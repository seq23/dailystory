import { subscriptionEndFrom, subscriptionGivesAccess, type StripeSubscriptionDates } from "./subscriptionEnd.ts";

interface Subscription extends StripeSubscriptionDates {
  customer: string | { id: string };
  items?: { data: { current_period_end?: number | null; price?: { recurring?: { interval?: string } | null } }[] };
}

/** Process verified Stripe lifecycle events; errors must reach the webhook's 500 response for retries. */
export async function syncSubscriptionEvent(
  event: { type: string; data: { object: Subscription } },
  db: { from: (table: string) => { update: (values: Record<string, unknown>, options: { count: 'exact' }) => { eq: (key: string, value: string) => PromiseLike<{ error: { message: string } | null; count: number | null }> } } },
  now = new Date(),
): Promise<boolean> {
  if (!["customer.subscription.updated", "customer.subscription.deleted"].includes(event.type)) return false;
  const sub = event.data.object;
  const customer = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
  if (!customer) throw new Error("Subscription has no customer");
  const active = event.type !== "customer.subscription.deleted" && subscriptionGivesAccess(sub.status);
  const interval = sub.items?.data[0]?.price?.recurring?.interval;
  const values: Record<string, unknown> = {
    subscribed: active,
    subscription_end: active ? subscriptionEndFrom(sub, now).toISOString() : null,
    updated_at: now.toISOString(),
  };
  if (!active) values.subscription_tier = null;
  else if (interval === "year" || interval === "month") values.subscription_tier = interval === "year" ? "annual" : "monthly";
  const { error, count } = await db.from("subscribers").update(values, { count: 'exact' }).eq("stripe_customer_id", customer);
  if (error) throw new Error(`Subscription sync failed: ${error.message}`);
  // Stripe does not guarantee delivery order: checkout may still be linking this customer.
  // A 500 asks Stripe to retry instead of acknowledging and losing the lifecycle update.
  if (count !== 1) throw new Error('Subscription customer not linked to exactly one subscriber');
  return true;
}
