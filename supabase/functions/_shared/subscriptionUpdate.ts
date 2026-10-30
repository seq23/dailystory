import { subscriptionEndFrom, subscriptionGivesAccess, type StripeSubscriptionDates } from "./subscriptionEnd.ts";

interface Subscription extends StripeSubscriptionDates {
  customer: string | { id: string };
  items?: { data: { current_period_end?: number | null; price?: { recurring?: { interval?: string } | null } }[] };
}

/** Process verified Stripe lifecycle events; errors must reach the webhook's 500 response for retries. */
export async function syncSubscriptionEvent(
  event: { type: string; data: { object: Subscription } },
  db: { from: (table: string) => { update: (values: Record<string, unknown>) => { eq: (key: string, value: string) => PromiseLike<{ error: { message: string } | null }> } } },
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
  const { error } = await db.from("subscribers").update(values).eq("stripe_customer_id", customer);
  if (error) throw new Error(`Subscription sync failed: ${error.message}`);
  return true;
}
