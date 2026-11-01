// Who may get a parent lifecycle email, and when. Pure (no imports), so vitest loads it.
// Approved by Sequoia 1 Nov 2026. Guard: src/test/guards/lifecycle-emails.test.ts.

export type EmailKind = "welcome" | "trial_ending" | "free_stories_used" | "come_back";
export const EMAIL_KINDS: readonly EmailKind[] = ["welcome", "trial_ending", "free_stories_used", "come_back"];

/** The sender. Approved From and Reply-To; the From domain must be time-2-read.com (guarded). */
export const LIFECYCLE_FROM = "Time-2-Read <hello@time-2-read.com>";
export const LIFECYCLE_REPLY_TO = "st@time-2-read.com";
export const SITE_URL = "https://time-2-read.com";

const DAY = 86_400_000;
const HOUR = 3_600_000;

/** Timing windows. A sweep that runs late still sends; a window never reaches back far enough
 *  to email a backlog of old accounts the day this ships. */
export const WINDOWS = {
  /** Welcome: trial started within the last 2 days (the webhook sends at once; the sweep catches misses). */
  welcomeMaxAgeMs: 2 * DAY,
  /** Trial ending: "2 days before" = trial ends within 48 h, and not later than 12 h before the charge. */
  trialEndingLatestMs: 48 * HOUR,
  trialEndingEarliestMs: 12 * HOUR,
  /** 3 free stories: the 3rd story was finished within the last 3 days. */
  freeStoriesMaxAgeMs: 3 * DAY,
  /** Come back: cancelled 14 to 21 days ago. */
  comeBackMinMs: 14 * DAY,
  comeBackMaxMs: 21 * DAY,
} as const;

// Reserved and throwaway domains (RFC 2606/6761 and common test inboxes).
const TEST_DOMAINS = [/\.test$/, /\.example$/, /\.invalid$/, /\.localhost$/, /\.local$/, /^localhost$/,
  /(^|\.)example\.(com|net|org)$/, /(^|\.)mailinator\.com$/, /(^|\.)test\.com$/, /(^|\.)testing\.com$/];

/** A test account: flagged in lifecycle_email_prefs, a reserved/throwaway domain, a +test style
 *  address, or a Stripe test-mode subscription. */
export function isTestAccount(a: { email: string; isTestFlag?: boolean; stripeLivemode?: boolean | null }): boolean {
  if (a.isTestFlag) return true;
  if (a.stripeLivemode === false) return true;
  const email = a.email.trim().toLowerCase();
  const at = email.lastIndexOf("@");
  if (at < 1) return true; // not a deliverable address: never send
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (TEST_DOMAINS.some((re) => re.test(domain))) return true;
  return /\+(test|e2e|qa|playwright)/.test(local);
}

export type SkipReason =
  | "paused" | "no_mailing_address" | "no_account_email" | "school_account" | "school_unconfirmed"
  | "test_account" | "opted_out" | "already_sent" | "local_recipient_only";

export interface Gate {
  paused: boolean;
  mailingAddress: string | null;
  email: string | null;
  /** institution_ai_lane(user, null): 'school', 'family', or null when it could not be read. */
  lane: "school" | "family" | null;
  isTestFlag: boolean;
  stripeLivemode: boolean | null;
  optedOut: boolean;
  alreadySent: boolean;
  /** Local private copy only: the one address test sends may go to. */
  localRecipientOnly?: string | null;
}

/** Every rule checked before every send. The first failing rule is the reason. */
export function gate(g: Gate): { send: true } | { send: false; reason: SkipReason } {
  if (g.paused) return { send: false, reason: "paused" };
  if (!g.mailingAddress || g.mailingAddress.trim().length < 10) return { send: false, reason: "no_mailing_address" };
  if (!g.email) return { send: false, reason: "no_account_email" };
  // Fail closed: a school account, or one whose school status cannot be confirmed, gets nothing.
  if (g.lane === "school") return { send: false, reason: "school_account" };
  if (g.lane !== "family") return { send: false, reason: "school_unconfirmed" };
  if (g.localRecipientOnly) {
    if (g.email.trim().toLowerCase() !== g.localRecipientOnly.trim().toLowerCase()) return { send: false, reason: "local_recipient_only" };
  } else if (isTestAccount({ email: g.email, isTestFlag: g.isTestFlag, stripeLivemode: g.stripeLivemode })) {
    return { send: false, reason: "test_account" };
  }
  if (g.isTestFlag) return { send: false, reason: "test_account" };
  if (g.optedOut) return { send: false, reason: "opted_out" };
  if (g.alreadySent) return { send: false, reason: "already_sent" };
  return { send: true };
}

export interface SubscriberRow {
  user_id: string | null;
  subscribed: boolean | null;
  subscription_tier: string | null;
  subscription_end: string | null;
  trial_start: string | null;
  trial_end: string | null;
  cancel_at_period_end: boolean | null;
  cancelled_at: string | null;
  override_premium?: boolean | null;
  override_end?: string | null;
}

const t = (s: string | null | undefined) => (s ? Date.parse(s) : NaN);

/** Welcome: a trial that started recently and has not ended. */
export function dueWelcome(s: SubscriberRow, now: Date): boolean {
  const start = t(s.trial_start), end = t(s.trial_end);
  if (!s.user_id || !s.subscribed || isNaN(start) || isNaN(end)) return false;
  return end > now.getTime() && now.getTime() - start <= WINDOWS.welcomeMaxAgeMs && start <= now.getTime() + HOUR;
}

/** Trial ending: still trialing, not set to cancel, trial ends 12–48 h from now. */
export function dueTrialEnding(s: SubscriberRow, now: Date): boolean {
  const end = t(s.trial_end);
  if (!s.user_id || !s.subscribed || s.cancel_at_period_end || s.cancelled_at || isNaN(end)) return false;
  const left = end - now.getTime();
  return left <= WINDOWS.trialEndingLatestMs && left >= WINDOWS.trialEndingEarliestMs;
}

/** Come back: cancelled 14–21 days ago and not subscribed again. */
export function dueComeBack(s: SubscriberRow, now: Date): boolean {
  const c = t(s.cancelled_at);
  if (!s.user_id || s.subscribed || isNaN(c)) return false;
  const age = now.getTime() - c;
  return age >= WINDOWS.comeBackMinMs && age <= WINDOWS.comeBackMaxMs;
}

/** Paid access now (subscription or a staff override): such an account is not "free". */
export function hasPaidAccess(s: Partial<SubscriberRow> | null | undefined, now: Date): boolean {
  if (!s) return false;
  const subscribed = !!s.subscribed && (!s.subscription_end || t(s.subscription_end) > now.getTime());
  const override = !!s.override_premium && (!s.override_end || t(s.override_end) > now.getTime());
  return subscribed || override;
}

/**
 * 3 free stories used: a FREE account (never had a trial or subscription, no paid access) whose
 * 3rd finished story was finished within the window. completions = completed_at of finished stories.
 */
export function dueFreeStoriesUsed(sub: Partial<SubscriberRow> | null, completions: string[], now: Date): boolean {
  if (hasPaidAccess(sub, now)) return false;
  if (sub && (sub.trial_start || sub.cancelled_at || sub.subscription_tier)) return false;
  const times = completions.map((c) => Date.parse(c)).filter((n) => !isNaN(n)).sort((a, b) => a - b);
  if (times.length < 3) return false;
  return now.getTime() - times[2]! <= WINDOWS.freeStoriesMaxAgeMs;
}

/** A first name for "Hi {name}," from the account's own metadata; never a child's name. */
export function parentFirstName(meta: Record<string, unknown> | null | undefined): string | null {
  for (const k of ["first_name", "given_name", "full_name", "name", "display_name"]) {
    const v = meta?.[k];
    if (typeof v === "string" && v.trim() && !v.includes("@")) return (v.trim().split(/\s+/)[0] ?? "").slice(0, 40);
  }
  return null;
}
