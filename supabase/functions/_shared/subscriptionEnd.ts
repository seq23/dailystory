// When a Stripe subscription's paid access ends, from Stripe's own dates (27 Oct 2026, final
// live tests: the webhook stored "now + 1 month" at checkout, so a 7-day trial showed
// "Premium active until" a month out, and a cancelled trial still showed that date).
// Guard: src/test/guards/pricing-trial.test.ts.

export interface StripeSubscriptionDates {
  status?: string;
  cancel_at?: number | null;
  current_period_end?: number | null;
  trial_end?: number | null;
}

/** The access end Stripe has scheduled: a set cancel date first, else the end of the paid or trial period. */
export function subscriptionEndFrom(sub: StripeSubscriptionDates | null | undefined, fallback: Date): Date {
  const seconds = sub?.cancel_at ?? sub?.current_period_end ?? sub?.trial_end ?? null;
  return typeof seconds === "number" && seconds > 0 ? new Date(seconds * 1000) : fallback;
}

/** Stripe statuses that still give Premium. */
export function subscriptionGivesAccess(status: string | undefined): boolean {
  return status === "active" || status === "trialing" || status === "past_due";
}
