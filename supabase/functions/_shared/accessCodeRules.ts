// Pure rules for access-code trials (no imports, so vitest can load it).
// A parent may type a code (e.g. HOMESCHOOL15) where they start the trial. The code
// lives in public.access_codes (see the 20261025 migration) and sets the Stripe
// trial length. Used by create-checkout; pinned by src/test/guards/access-code-trial.test.ts.

export const DEFAULT_TRIAL_DAYS = 7;
export const MAX_TRIAL_DAYS = 730; // Stripe's own ceiling for trial_period_days

export const INVALID_ACCESS_CODE = "INVALID_ACCESS_CODE";
export const ACCESS_CODE_TRIAL_USED = "ACCESS_CODE_TRIAL_USED";
export const ACCESS_CODE_UNAVAILABLE = "ACCESS_CODE_UNAVAILABLE";

export const ACCESS_CODE_MESSAGES = {
  [INVALID_ACCESS_CODE]:
    "That code didn't work. Check the spelling, or leave the box empty to start the regular free trial.",
  [ACCESS_CODE_TRIAL_USED]:
    "That code is for a first free trial, and this account has already had one. You can still subscribe without the code.",
  [ACCESS_CODE_UNAVAILABLE]:
    "We couldn't check that code just now. Please try again, or leave the box empty to continue without it.",
} as const;

/** "homeschool 15", " HomeSchool15 " and "HOMESCHOOL15" are the same code. */
export function normalizeAccessCode(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw.replace(/\s+/g, "").toUpperCase();
}

export interface AccessCodeRow {
  id?: string;
  code: string;
  trial_days: number;
  label?: string | null;
  active: boolean;
}

export type TrialDecision =
  | { ok: true; trialDays: number; code: AccessCodeRow | null }
  | { ok: false; error: keyof typeof ACCESS_CODE_MESSAGES; message: string };

function refuse(error: keyof typeof ACCESS_CODE_MESSAGES): TrialDecision {
  return { ok: false, error, message: ACCESS_CODE_MESSAGES[error] };
}

/**
 * Decide the trial for a checkout.
 * - no code: 7 days, or none when the customer already had a subscription (one trial per customer);
 * - a code: must match an active row exactly after normalising, and gives that row's days;
 * - a code on a customer who already had a trial is refused, never silently dropped.
 */
export function decideTrial(input: {
  rawCode: unknown;
  row: AccessCodeRow | null | undefined;
  hadSubscription: boolean;
}): TrialDecision {
  const code = normalizeAccessCode(input.rawCode);
  if (!code) {
    return { ok: true, trialDays: input.hadSubscription ? 0 : DEFAULT_TRIAL_DAYS, code: null };
  }
  const row = input.row;
  const days = Number(row?.trial_days);
  if (
    !row ||
    row.active !== true ||
    normalizeAccessCode(row.code) !== code ||
    !Number.isInteger(days) ||
    days < 1 ||
    days > MAX_TRIAL_DAYS
  ) {
    return refuse(INVALID_ACCESS_CODE);
  }
  if (input.hadSubscription) return refuse(ACCESS_CODE_TRIAL_USED);
  return { ok: true, trialDays: days, code: row };
}

// ---------------------------------------------------------------------------
// Code at sign-up (Oct 2026): a code typed when the account is made gives Premium
// at once, with no card, for the code's trial_days. Used by redeem-access-code.
// One code grant per account; redeeming the same code again is a no-op that
// reports the same end date, so a retry never fails and never stacks days.

export const ACCESS_CODE_ALREADY_REDEEMED = "ACCESS_CODE_ALREADY_REDEEMED";

export interface ExistingGrant {
  code: string;
  expires_at: string | null;
}

export type GrantDecision =
  | { ok: true; alreadyActive: boolean; trialDays: number; premiumUntil: string; code: string }
  | { ok: false; error: string; message: string };

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Decide what a code does for an account.
 * - a bad or inactive code is refused with the plain INVALID message;
 * - an account that already redeemed a code keeps that grant (same code → ok, same end date;
 *   a different code → refused, one free period per account);
 * - otherwise Premium runs from now for the code's days.
 */
export function decideGrant(input: {
  rawCode: unknown;
  row: AccessCodeRow | null | undefined;
  existing: ExistingGrant | null | undefined;
  now: Date;
}): GrantDecision {
  const code = normalizeAccessCode(input.rawCode);
  const row = input.row;
  const days = Number(row?.trial_days);
  if (
    !code ||
    !row ||
    row.active !== true ||
    normalizeAccessCode(row.code) !== code ||
    !Number.isInteger(days) ||
    days < 1 ||
    days > MAX_TRIAL_DAYS
  ) {
    return { ok: false, error: INVALID_ACCESS_CODE, message: "That code didn't work. Check the spelling and try again." };
  }
  const existing = input.existing;
  if (existing) {
    if (normalizeAccessCode(existing.code) === code && existing.expires_at) {
      return { ok: true, alreadyActive: true, trialDays: days, premiumUntil: existing.expires_at, code };
    }
    return {
      ok: false,
      error: ACCESS_CODE_ALREADY_REDEEMED,
      message: "This account has already used a code. Premium from that code stays until its end date.",
    };
  }
  return {
    ok: true,
    alreadyActive: false,
    trialDays: days,
    premiumUntil: new Date(input.now.getTime() + days * DAY_MS).toISOString(),
    code,
  };
}

/** "Premium active until 9 November 2026": the one wording used on every screen. */
export function premiumUntilLabel(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `Premium active until ${d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}`;
}
