// What the lifecycle emails need from Stripe, written to public.subscribers by stripe-webhook:
// trial dates, a scheduled cancel, when it was cancelled, and live vs test mode.
// Pure (db injected). Billing access itself stays in _shared/subscriptionUpdate.ts.
// Guard: src/test/guards/lifecycle-emails.test.ts.

export interface StripeSubLike {
  status?: string;
  trial_start?: number | null;
  trial_end?: number | null;
  cancel_at_period_end?: boolean | null;
  canceled_at?: number | null;
  ended_at?: number | null;
  customer?: string | { id: string };
}

const iso = (s: number | null | undefined) => (typeof s === "number" && s > 0 ? new Date(s * 1000).toISOString() : null);

/** Column values for a subscription as Stripe describes it now. */
export function lifecycleColumns(sub: StripeSubLike, livemode: boolean | undefined, ended: boolean, now: Date): Record<string, unknown> {
  const v: Record<string, unknown> = {
    cancel_at_period_end: !!sub.cancel_at_period_end && !ended,
  };
  if (typeof livemode === "boolean") v.stripe_livemode = livemode;
  if (sub.trial_start) v.trial_start = iso(sub.trial_start);
  if (sub.trial_end) v.trial_end = iso(sub.trial_end);
  if (ended || sub.status === "canceled") v.cancelled_at = iso(sub.ended_at) ?? iso(sub.canceled_at) ?? now.toISOString();
  else v.cancelled_at = null; // a resubscribed account is no longer "cancelled"
  return v;
}

type Db = { from: (t: string) => { update: (v: Record<string, unknown>) => { eq: (k: string, v: string) => PromiseLike<{ error: { message: string } | null }> } } };

/** Subscription events by customer. Returns what it did; never throws (billing sync owns retries). */
export async function recordSubscriptionLifecycle(
  event: { type: string; livemode?: boolean; data: { object: StripeSubLike } }, db: Db, now = new Date(),
): Promise<string> {
  const types = ["customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted", "customer.subscription.trial_will_end"];
  if (!types.includes(event.type)) return "ignored";
  const sub = event.data.object;
  const customer = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
  if (!customer) return "no customer";
  const values = lifecycleColumns(sub, event.livemode, event.type === "customer.subscription.deleted", now);
  const { error } = await db.from("subscribers").update(values).eq("stripe_customer_id", customer);
  return error ? `error: ${error.message}` : "recorded";
}

/** Checkout completed: the new subscription's trial dates, by user id. */
export async function recordCheckoutLifecycle(userId: string, sub: StripeSubLike | null, livemode: boolean | undefined, db: Db, now = new Date()): Promise<string> {
  if (!sub) return "no subscription";
  const values = lifecycleColumns(sub, livemode, false, now);
  const { error } = await db.from("subscribers").update(values).eq("user_id", userId);
  return error ? `error: ${error.message}` : "recorded";
}
