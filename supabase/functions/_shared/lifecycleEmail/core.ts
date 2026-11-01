// Sending one lifecycle email, and the sweep that finds who is due. All I/O is injected
// (LifecycleDeps), so vitest runs the whole decision path against fakes and the Deno
// function wires the real database and Resend. Guard: src/test/guards/lifecycle-emails.test.ts.
import {
  type EmailKind, type SkipReason, type SubscriberRow, LIFECYCLE_FROM, LIFECYCLE_REPLY_TO, SITE_URL,
  dueComeBack, dueFreeStoriesUsed, dueTrialEnding, dueWelcome, gate, parentFirstName,
} from "./rules.ts";
import { type ChildStats, type RenderInput, renderLifecycleEmail } from "./templates.ts";

export interface OutgoingEmail {
  from: string; to: string; reply_to: string; subject: string; html: string; text: string;
  headers: Record<string, string>;
}
export type SendResult = { ok: true; id: string | null } | { ok: false; status: number; error: string };

export interface ReadingRow { child_profile_id: string | null; completed_at: string | null; pages_read: number | null; started_at?: string | null }

export interface LifecycleDeps {
  now: Date;
  /** LIFECYCLE_MAILING_ADDRESS. Missing = NAMED STOP, nothing sent. */
  mailingAddress: string | null;
  /** Base URL of the unsubscribe function (one-click POST endpoint). */
  unsubscribeEndpoint: string;
  siteUrl?: string | undefined;
  /** Local private copy only: send to this one address and nobody else. */
  localRecipientOnly?: string | null | undefined;
  paused(): Promise<boolean>;
  account(userId: string): Promise<{ email: string | null; meta: Record<string, unknown> } | null>;
  /** public.institution_ai_lane(user, null); throws when it cannot be read. */
  lane(userId: string): Promise<string>;
  /** Creates the prefs row when missing. */
  prefs(userId: string): Promise<{ token: string; optedOut: boolean; isTest: boolean }>;
  subscriber(userId: string): Promise<(SubscriberRow & { stripe_livemode?: boolean | null }) | null>;
  alreadySent(userId: string, kind: EmailKind): Promise<boolean>;
  /** Insert the log row; false when it already exists (another sender won the race). */
  claim(userId: string, kind: EmailKind): Promise<boolean>;
  release(userId: string, kind: EmailKind): Promise<void>;
  recordProviderId(userId: string, kind: EmailKind, id: string | null): Promise<void>;
  children(userId: string): Promise<{ id: string; name: string }[]>;
  readings(userId: string, since: Date | null): Promise<ReadingRow[]>;
  quizzes(userId: string, since: Date | null): Promise<{ child_profile_id: string | null }[]>;
  send(email: OutgoingEmail): Promise<SendResult>;
  /** Sweep candidates. */
  subscribersForSweep(): Promise<SubscriberRow[]>;
  recentFreeCompleters(since: Date): Promise<string[]>;
}

export type Outcome =
  | { status: "sent"; kind: EmailKind; userId: string; id: string | null }
  | { status: "skipped"; kind: EmailKind; userId: string; reason: SkipReason | "not_due" | "nothing_saved" }
  | { status: "stopped"; kind: EmailKind; userId: string; stop: string; detail: string };

/** Named stops the sweep reports (nothing sent): a person must act. */
export const NAMED_STOPS = {
  no_mailing_address: "NAMED STOP LIFECYCLE_MAILING_ADDRESS: the CAN-SPAM postal address secret is not set, so no lifecycle email is sent.",
  sender_unverified: "NAMED STOP SENDER_DOMAIN_UNVERIFIED: Resend refused the time-2-read.com sender (domain not verified in the app's Resend team), so no lifecycle email is sent.",
} as const;

const FAMILY = "Your family";

/** Per-child stats from finished reading sessions and quiz attempts. Unattributed rows go to the
 *  only child when there is one, else to "Your family". */
export function childStats(children: { id: string; name: string }[], readings: ReadingRow[], quizzes: { child_profile_id: string | null }[]): ChildStats[] {
  const byId = new Map<string, ChildStats>();
  const known = new Set(children.map((c) => c.id));
  for (const c of children) byId.set(c.id, { name: c.name, stories: 0, pages: 0, quizzes: 0 });
  const keyOf = (id: string | null) => (id && known.has(id) ? id : children.length === 1 ? children[0]!.id : FAMILY);
  const row = (k: string) => {
    if (!byId.has(k)) byId.set(k, { name: FAMILY, stories: 0, pages: 0, quizzes: 0 });
    return byId.get(k)!;
  };
  for (const r of readings) {
    const s = row(keyOf(r.child_profile_id));
    if (r.completed_at) s.stories += 1;
    s.pages += Math.max(0, r.pages_read ?? 0);
  }
  for (const q of quizzes) row(keyOf(q.child_profile_id)).quizzes += 1;
  return [...byId.values()];
}

/** The child who finished the most stories (ties: first listed). */
function topChild(stats: ChildStats[]): ChildStats | null {
  const real = stats.filter((s) => s.name !== FAMILY && s.stories > 0).sort((a, b) => b.stories - a.stories);
  return real[0] ?? null;
}

/** Check every rule, render, claim the log row, send. Never sends twice for one (account, kind). */
export async function sendLifecycleEmail(kind: EmailKind, userId: string, deps: LifecycleDeps): Promise<Outcome> {
  const skip = (reason: SkipReason | "not_due" | "nothing_saved"): Outcome => ({ status: "skipped", kind, userId, reason });
  if (!deps.mailingAddress || deps.mailingAddress.trim().length < 10) {
    return { status: "stopped", kind, userId, stop: "LIFECYCLE_MAILING_ADDRESS", detail: NAMED_STOPS.no_mailing_address };
  }
  const [paused, account, sub, sent] = await Promise.all([
    deps.paused(), deps.account(userId), deps.subscriber(userId), deps.alreadySent(userId, kind),
  ]);
  let lane: "school" | "family" | null = null;
  try {
    const l = await deps.lane(userId);
    lane = l === "school" ? "school" : l === "family" ? "family" : null;
  } catch { lane = null; }
  const prefs = await deps.prefs(userId);
  const g = gate({
    paused, mailingAddress: deps.mailingAddress, email: account?.email ?? null, lane,
    isTestFlag: prefs.isTest, stripeLivemode: sub?.stripe_livemode ?? null, optedOut: prefs.optedOut,
    alreadySent: sent, localRecipientOnly: deps.localRecipientOnly ?? null,
  });
  if (g.send === false) return skip((g as { send: false; reason: SkipReason }).reason);

  const now = deps.now;
  const site = deps.siteUrl ?? SITE_URL;
  const unsubscribeUrl = `${site.replace(/\/$/, "")}/unsubscribe?t=${encodeURIComponent(prefs.token)}`;
  const base: Omit<RenderInput, "kind"> = {
    parentName: parentFirstName(account!.meta), mailingAddress: deps.mailingAddress, unsubscribeUrl, siteUrl: site,
  };
  let input: RenderInput;
  if (kind === "welcome" || kind === "trial_ending") {
    if (!sub) return skip("not_due");
    if (kind === "welcome" ? !dueWelcome(sub, now) : !dueTrialEnding(sub, now)) return skip("not_due");
    input = { ...base, kind, trialEnd: new Date(sub.trial_end!), plan: sub.subscription_tier === "annual" ? "annual" : "monthly" };
    if (kind === "trial_ending") {
      const since = sub.trial_start ? new Date(sub.trial_start) : null;
      const [kids, reads, quizzes] = await Promise.all([deps.children(userId), deps.readings(userId, since), deps.quizzes(userId, since)]);
      input.children = childStats(kids, reads, quizzes);
    }
  } else if (kind === "free_stories_used") {
    const [kids, reads] = await Promise.all([deps.children(userId), deps.readings(userId, null)]);
    const done = reads.filter((r) => r.completed_at).sort((a, b) => Date.parse(a.completed_at!) - Date.parse(b.completed_at!));
    if (!dueFreeStoriesUsed(sub, done.map((r) => r.completed_at!), now)) return skip("not_due");
    const thirdChild = done[2]?.child_profile_id;
    const named = kids.find((k) => k.id === thirdChild) ?? (kids.length === 1 ? kids[0] : null);
    input = { ...base, kind, childName: named?.name ?? null };
  } else {
    if (!sub || !dueComeBack(sub, now)) return skip("not_due");
    const [kids, reads] = await Promise.all([deps.children(userId), deps.readings(userId, null)]);
    const stats = childStats(kids, reads, []);
    const total = stats.reduce((n, s) => n + s.stories, 0);
    // The copy says their stories are saved; with none saved it would not be true.
    if (total === 0) return skip("nothing_saved");
    const top = topChild(stats);
    input = { ...base, kind, childName: top?.name ?? null, storyCount: top ? top.stories : total };
  }

  const r = renderLifecycleEmail(input);
  if (!(await deps.claim(userId, kind))) return skip("already_sent");
  const oneClick = `${deps.unsubscribeEndpoint}?t=${encodeURIComponent(prefs.token)}`;
  const result = await deps.send({
    from: LIFECYCLE_FROM, to: account!.email!, reply_to: LIFECYCLE_REPLY_TO, subject: r.subject, html: r.html, text: r.text,
    headers: {
      "List-Unsubscribe": `<${oneClick}>, <mailto:${LIFECYCLE_REPLY_TO}?subject=unsubscribe>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
  if (result.ok === false) {
    const failed = result as { ok: false; status: number; error: string };
    await deps.release(userId, kind); // not sent: the next sweep may try again
    const unverified = failed.status === 403 && /domain|verif/i.test(failed.error);
    return {
      status: "stopped", kind, userId,
      stop: unverified ? "SENDER_DOMAIN_UNVERIFIED" : `RESEND_${failed.status}`,
      detail: unverified ? NAMED_STOPS.sender_unverified : failed.error.slice(0, 200),
    };
  }
  const id = (result as { ok: true; id: string | null }).id;
  await deps.recordProviderId(userId, kind, id);
  return { status: "sent", kind, userId, id };
}

/** One pass over everyone who might be due. A named stop that applies to every send ends the pass. */
export async function runLifecycleSweep(deps: LifecycleDeps): Promise<{ outcomes: Outcome[]; stop: string | null }> {
  const outcomes: Outcome[] = [];
  if (!deps.mailingAddress || deps.mailingAddress.trim().length < 10) return { outcomes, stop: NAMED_STOPS.no_mailing_address };
  if (await deps.paused()) return { outcomes, stop: null };
  const now = deps.now;
  const subs = await deps.subscribersForSweep();
  const jobs: [EmailKind, string][] = [];
  for (const s of subs) {
    if (!s.user_id) continue;
    if (dueWelcome(s, now)) jobs.push(["welcome", s.user_id]);
    if (dueTrialEnding(s, now)) jobs.push(["trial_ending", s.user_id]);
    if (dueComeBack(s, now)) jobs.push(["come_back", s.user_id]);
  }
  for (const u of await deps.recentFreeCompleters(new Date(now.getTime() - 3 * 86_400_000))) jobs.push(["free_stories_used", u]);
  for (const [kind, userId] of jobs) {
    const o = await sendLifecycleEmail(kind, userId, deps);
    outcomes.push(o);
    if (o.status === "stopped" && (o.stop === "SENDER_DOMAIN_UNVERIFIED" || o.stop === "LIFECYCLE_MAILING_ADDRESS")) {
      return { outcomes, stop: o.detail };
    }
  }
  return { outcomes, stop: null };
}
