// notify-data-breach: the parent incident notice that src/pages/Privacy.tsx promises
// ("Personal information incidents are logged and parents are notified"). Owner only.
//
// The owner names the incident and the affected child profiles and/or accounts. Each parent's
// address is the account's own sign-in email, read from the database (never from the body and
// never child_profiles.parent_email, which the account owner can rewrite). One email per
// parent, naming only that parent's own affected children. Every send is recorded per parent
// (public.incident_notices); a re-run of the same incident sends only what has not been sent,
// so a mailer outage is retried by running it again and nobody gets it twice.
// dry-run (the default) shows the rendered email and the counts and sends nothing.
// Pure (deps injected): guard src/test/guards/incident-notice.test.ts.
import { adminOrCronRefusal, escapeHtml, json, type GetUser } from "../_shared/callerCheck.ts";

export const NOTICE_FROM = "Time2Read <privacy@time-2-read.com>";
export const PRIVACY_INBOX = "privacy@time-2-read.com";
/** Sends per call (Resend allows about 2 a second); run again to continue. */
export const MAX_SENDS_PER_RUN = 40;
export const SEND_SPACING_MS = 600;
const MAX_IDS = 2000;
const MAX_BODY_BYTES = 256 * 1024;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const INCIDENT_ID = /^[a-z0-9][a-z0-9-]{5,79}$/;
const SEVERITIES = ["low", "medium", "high", "critical"] as const;
/** Shown in the dry-run preview in place of a real child's name. */
export const PREVIEW_CHILD = "[your child's first name]";

export interface Incident {
  incidentId: string;
  whenItHappened: string;
  whatHappened: string;
  dataInvolved: string[];
  whatWeAreDoing: string;
  whatYouCanDo: string | null;
  severity: (typeof SEVERITIES)[number];
}

export interface ChildRow {
  id: string;
  parent_user_id: string;
  display_name: string | null;
}

export interface NoticeEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** The same key for the same incident and parent, so the mailer also refuses a repeat. */
  idempotencyKey: string;
}

export type ClaimResult = "claimed" | "sent" | "sending";

export interface IncidentDeps {
  adminIds: string[];
  getUser: GetUser;
  serviceKey: string;
  /** Throw when the database cannot be read. */
  childrenByIds: (ids: string[]) => Promise<ChildRow[]>;
  childrenOfParents: (parentIds: string[]) => Promise<ChildRow[]>;
  /** The account's sign-in email, or null when there is no such account or no address. */
  accountEmail: (userId: string) => Promise<string | null>;
  /** Records the incident once (data_breach_log, keyed by incident id). */
  logIncident: (incident: Incident, parentsAffected: number) => Promise<void>;
  /** Atomically takes the right to send to this parent: "claimed" when never sent or last
   *  failed; otherwise the row's status ("sent", or "sending" when a run is in flight or
   *  stopped mid-send: never re-sent automatically, since it may have gone). */
  claim: (incidentId: string, parentId: string) => Promise<ClaimResult>;
  record: (incidentId: string, parentId: string, result: { status: "sent"; providerId: string | null } | { status: "failed"; error: string }) => Promise<void>;
  /** Sends through Resend; throws on any refusal. Returns the provider's id. */
  sendEmail: (email: NoticeEmail) => Promise<string | null>;
  /** RESEND_API_KEY is set. */
  mailConfigured: boolean;
  pause?: (ms: number) => Promise<void>;
}

type Parsed = { incident: Incident; childIds: string[]; accountIds: string[]; mode: "dry-run" | "send" };

function text(v: unknown, min: number, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length >= min && t.length <= max ? t : null;
}

function ids(v: unknown): string[] | null {
  if (v === undefined || v === null) return [];
  if (!Array.isArray(v) || !v.every((x) => typeof x === "string" && UUID.test(x))) return null;
  return [...new Set(v.map((x: string) => x.toLowerCase()))];
}

export function parseIncident(body: unknown): Parsed | string {
  const b = (body ?? {}) as Record<string, unknown>;
  const incidentId = typeof b.incidentId === "string" && INCIDENT_ID.test(b.incidentId) ? b.incidentId : null;
  if (!incidentId) return "incidentId: 6-80 lowercase letters, digits and dashes (it keeps re-runs from sending twice)";
  const whenItHappened = text(b.whenItHappened, 4, 200);
  if (!whenItHappened) return "whenItHappened is required (for example: between 2 and 4 November 2026)";
  const whatHappened = text(b.whatHappened, 20, 4000);
  if (!whatHappened) return "whatHappened is required (20-4000 characters)";
  const data = Array.isArray(b.dataInvolved) ? b.dataInvolved.map((d) => text(d, 1, 200)) : [];
  if (data.length < 1 || data.length > 12 || data.some((d) => !d)) return "dataInvolved: 1-12 short items";
  const whatWeAreDoing = text(b.whatWeAreDoing, 20, 4000);
  if (!whatWeAreDoing) return "whatWeAreDoing is required (20-4000 characters)";
  let whatYouCanDo: string | null = null;
  if (b.whatYouCanDo !== undefined && b.whatYouCanDo !== null && b.whatYouCanDo !== "") {
    whatYouCanDo = text(b.whatYouCanDo, 10, 4000);
    if (!whatYouCanDo) return "whatYouCanDo: 10-4000 characters, or leave it out for the standard steps";
  }
  const severity = (b.severity ?? "medium") as Incident["severity"];
  if (!SEVERITIES.includes(severity)) return `severity: one of ${SEVERITIES.join(", ")}`;
  const childIds = ids(b.childIds);
  const accountIds = ids(b.accountIds);
  if (!childIds || !accountIds) return "childIds and accountIds are lists of ids";
  if (childIds.length + accountIds.length > MAX_IDS) return `at most ${MAX_IDS} ids per incident call`;
  const mode = b.mode ?? "dry-run";
  if (mode !== "dry-run" && mode !== "send") return 'mode is "dry-run" (default) or "send"';
  return {
    incident: { incidentId, whenItHappened, whatHappened, dataInvolved: data as string[], whatWeAreDoing, whatYouCanDo, severity },
    childIds, accountIds, mode,
  };
}

function nameList(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

const standardSteps = (about: string) =>
  `You don't need to do anything to keep using Time2Read. If you would like us to show you, or delete, the information we hold about ${about}, reply to this email and we will do it.`;

/** One parent's notice. `children` are that parent's own affected children, by first name. */
export function renderNotice(incident: Incident, children: string[]): { subject: string; html: string; text: string } {
  const named = children.map((c) => c.trim()).filter(Boolean);
  const who = named.length === 0
    ? "your Time2Read account"
    : `your ${named.length === 1 ? "child" : "children"} ${nameList(named)}`;
  const subject = "A privacy notice from Time2Read";
  const steps = incident.whatYouCanDo ??
    standardSteps(named.length === 0 ? "your account" : named.length === 1 ? "your child" : "your children");
  const paras = (s: string) => s.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  const lines = [
    "Hello,",
    "",
    `We are writing to tell you about a privacy incident at Time2Read that involved information about ${who}.`,
    "",
    "WHAT HAPPENED",
    `When: ${incident.whenItHappened}`,
    ...paras(incident.whatHappened).flatMap((p) => [p, ""]),
    "WHAT INFORMATION WAS INVOLVED",
    ...incident.dataInvolved.map((d) => `- ${d}`),
    "",
    "WHAT WE ARE DOING",
    ...paras(incident.whatWeAreDoing).flatMap((p) => [p, ""]),
    "WHAT YOU CAN DO",
    ...paras(steps).flatMap((p) => [p, ""]),
    "QUESTIONS",
    `Reply to this email or write to ${PRIVACY_INBOX}.`,
    "",
    "Time2Read (Spry VSL LLC)",
    "This is a one-time notice about your account, not marketing.",
  ];

  const h = (t: string) =>
    `<h2 style="font-size:17px;line-height:1.3;margin:28px 0 8px;color:#1f2937;">${escapeHtml(t)}</h2>`;
  const p = (t: string) => `<p style="margin:0 0 14px;">${escapeHtml(t)}</p>`;
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light">
<title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#ffffff;">
<div style="max-width:560px;margin:0 auto;padding:24px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.55;color:#1f2937;overflow-wrap:anywhere;">
${p("Hello,")}
${p(`We are writing to tell you about a privacy incident at Time2Read that involved information about ${who}.`)}
${h("What happened")}
${p(`When: ${incident.whenItHappened}`)}
${paras(incident.whatHappened).map(p).join("\n")}
${h("What information was involved")}
<ul style="margin:0 0 14px;padding-left:22px;">${incident.dataInvolved.map((d) => `<li style="margin:0 0 6px;">${escapeHtml(d)}</li>`).join("")}</ul>
${h("What we are doing")}
${paras(incident.whatWeAreDoing).map(p).join("\n")}
${h("What you can do")}
${paras(steps).map(p).join("\n")}
${h("Questions")}
<p style="margin:0 0 14px;">Reply to this email or write to <a href="mailto:${PRIVACY_INBOX}" style="color:#1f2937;">${PRIVACY_INBOX}</a>.</p>
<p style="margin:28px 0 4px;">Time2Read (Spry VSL LLC)</p>
<p style="margin:0;font-size:13px;color:#6b7280;">This is a one-time notice about your account, not marketing.</p>
</div></body></html>`;
  return { subject, html, text: lines.join("\n").replace(/\n{3,}/g, "\n\n") };
}

export async function handleIncidentNotice(req: Request, deps: IncidentDeps, cors: Record<string, string>): Promise<Response> {
  if (req.method !== "POST") return json(405, { error: "POST only" }, cors);

  // 1. Owner only: an ADMIN_USER_IDS account, or the project's service key. Checked before
  //    the body is read.
  const auth = await adminOrCronRefusal(req, { adminIds: deps.adminIds, getUser: deps.getUser, serviceKey: deps.serviceKey, cors });
  if (auth.refused) return auth.refused;

  const raw = await req.text().catch(() => "");
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return json(413, { error: "Request too large" }, cors);
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return json(400, { error: "JSON body required" }, cors); }
  const parsed = parseIncident(body);
  if (typeof parsed === "string") return json(400, { error: parsed }, cors);
  const { incident, childIds, accountIds, mode } = parsed;
  if (mode === "send" && !deps.mailConfigured) {
    return json(503, { error: "NAMED STOP RESEND_API_KEY: the mail key is not set; nothing was sent." }, cors);
  }

  // 2. Who is affected, from the database only. A parent is notified about their own
  //    affected children; an account named directly covers all of its child profiles.
  const byParent = new Map<string, Map<string, string>>();
  const add = (parent: string) => byParent.get(parent) ?? byParent.set(parent, new Map()).get(parent)!;
  let unmatchedChildIds: string[] = [];
  const emails = new Map<string, string | null>();
  try {
    if (childIds.length) {
      const rows = await deps.childrenByIds(childIds);
      const found = new Set(rows.map((r) => r.id.toLowerCase()));
      unmatchedChildIds = childIds.filter((id) => !found.has(id));
      for (const r of rows) if (childIds.includes(r.id.toLowerCase())) add(r.parent_user_id).set(r.id, (r.display_name ?? "").trim());
    }
    if (accountIds.length) {
      for (const a of accountIds) add(a);
      for (const r of await deps.childrenOfParents(accountIds)) {
        if (accountIds.includes(r.parent_user_id.toLowerCase())) add(r.parent_user_id).set(r.id, (r.display_name ?? "").trim());
      }
    }
    const parents = [...byParent.keys()].sort();
    for (let i = 0; i < parents.length; i += 20) {
      const chunk = parents.slice(i, i + 20);
      const got = await Promise.all(chunk.map((id) => deps.accountEmail(id)));
      chunk.forEach((id, k) => emails.set(id, got[k]?.trim() || null));
    }
  } catch (e) {
    console.error(`[notify-data-breach] READ_FAILED: ${e instanceof Error ? e.message : e}`);
    return json(503, { error: "The database could not be read; nothing was sent. Try again." }, cors);
  }

  const parents = [...byParent.keys()].sort();
  const reachable = parents.filter((id) => emails.get(id));
  const noAddress = parents.length - reachable.length;
  const preview = renderNotice(incident, [PREVIEW_CHILD]);
  const summary = { incidentId: incident.incidentId, parents: parents.length, recipients: reachable.length, noAddress, unmatchedChildIds };

  // 3. Zero recipients is a named stop, never a quiet "done".
  if (reachable.length === 0) {
    return json(422, { ...summary, error: "NAMED STOP NO_RECIPIENTS: no affected parent with an email address was found; nothing was sent.", code: "NO_RECIPIENTS" }, cors);
  }
  if (mode === "dry-run") {
    return json(200, { mode, ...summary, sent: 0, preview: { from: NOTICE_FROM, subject: preview.subject, text: preview.text, html: preview.html } }, cors);
  }

  // 4. Send. The incident is recorded first: if that fails, nothing is sent.
  try {
    await deps.logIncident(incident, parents.length);
  } catch (e) {
    console.error(`[notify-data-breach] LOG_FAILED: ${e instanceof Error ? e.message : e}`);
    return json(503, { ...summary, error: "The incident could not be recorded; nothing was sent. Try again." }, cors);
  }
  const pause = deps.pause ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  let sent = 0, alreadySent = 0, inProgress = 0, failed = 0, attempted = 0;
  let remaining = 0;
  for (const parentId of reachable) {
    if (attempted >= MAX_SENDS_PER_RUN) { remaining++; continue; }
    let claim: ClaimResult;
    try {
      claim = await deps.claim(incident.incidentId, parentId);
    } catch (e) {
      console.error(`[notify-data-breach] CLAIM_FAILED: ${e instanceof Error ? e.message : e}`);
      failed++;
      continue;
    }
    if (claim === "sent") { alreadySent++; continue; }
    if (claim === "sending") { inProgress++; continue; }
    if (attempted > 0) await pause(SEND_SPACING_MS);
    attempted++;
    const names = [...byParent.get(parentId)!.values()].filter(Boolean).sort((a, b) => a.localeCompare(b));
    const email = renderNotice(incident, names);
    try {
      const providerId = await deps.sendEmail({ to: emails.get(parentId)!, ...email, idempotencyKey: `incident-${incident.incidentId}-${parentId}` });
      sent++;
      await deps.record(incident.incidentId, parentId, { status: "sent", providerId }).catch((e) =>
        console.error(`[notify-data-breach] RECORD_SENT_FAILED ${parentId}: ${e instanceof Error ? e.message : e}`));
    } catch (e) {
      failed++;
      const error = (e instanceof Error ? e.message : String(e)).replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, "[address]").slice(0, 300);
      await deps.record(incident.incidentId, parentId, { status: "failed", error }).catch((e2) =>
        console.error(`[notify-data-breach] RECORD_FAILED_FAILED ${parentId}: ${e2 instanceof Error ? e2.message : e2}`));
    }
  }

  const complete = failed === 0 && remaining === 0 && inProgress === 0;
  const status = failed > 0 ? 502 : remaining > 0 || inProgress > 0 ? 202 : 200;
  const next = failed > 0
    ? "Some notices failed and are recorded as failed. Run the same incident again to retry only those."
    : remaining > 0
      ? `Sent ${MAX_SENDS_PER_RUN} this run. Run the same incident again to continue.`
      : inProgress > 0
        ? "Some notices are mid-send in another run. Run the same incident again in 10 minutes: one that never finished is retried then, and one that went out is not sent twice."
        : "Every reachable parent has this notice.";
  return json(status, { mode, ...summary, sent, alreadySent, inProgress, failed, remaining, complete, next }, cors);
}
