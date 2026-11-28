// Which Stripe customer belongs to a signed-in account (security audit B, 27 Nov 2026).
//
// Before: customer-portal, sync-subscription-status and create-checkout took the first Stripe
// customer with the account's email. Sign-up email is not proven (auto-confirm stays on, her
// ruling 27 Nov 2026), so anyone who signed up with a parent's address after she deleted her
// account, or changed her email, got her Premium and a billing-portal session on her customer:
// card, address, invoices, cancel.
//
// Now a customer is linked to an account only by what WE recorded for that account id:
//   1. subscribers.stripe_customer_id on the row whose user_id is the caller (set by the
//      signed stripe-webhook from checkout), then
//   2. a Stripe subscription whose metadata.user_id is the caller's id (create-checkout writes
//      it on every subscription), for a payer whose row was never filled in.
// An email is never a link. emailHadSubscription below may only take a free trial away.
// Pure (no imports), so vitest loads it. Tests: src/test/edge/discount-and-billing.test.ts.

// The Stripe calls this needs, typed loosely so the SDK and the test stub both fit.
export interface StripeLike {
  customers: {
    retrieve(id: string): Promise<{ id: string; deleted?: boolean }>;
    list(args: { email: string; limit: number }): Promise<{ data: Array<{ id: string }> }>;
  };
  subscriptions: {
    search(args: { query: string; limit: number }): Promise<{ data: Array<{ customer: string | { id: string } }> }>;
    list(args: { customer: string; status: string; limit: number }): Promise<{ data: unknown[] }>;
  };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isMissing(e: unknown): boolean {
  const err = e as { code?: string; statusCode?: number } | null;
  return err?.code === "resource_missing" || err?.statusCode === 404;
}

/** The account's own Stripe customer id, or null when none is linked. Other Stripe errors throw. */
export async function linkedStripeCustomer(
  stripe: StripeLike,
  account: { userId: string; storedCustomerId?: string | null },
): Promise<string | null> {
  const stored = (account.storedCustomerId ?? "").trim();
  if (stored) {
    try {
      const c = await stripe.customers.retrieve(stored);
      if (c && !c.deleted) return c.id;
    } catch (e) {
      if (!isMissing(e)) throw e;
    }
  }
  // The id goes inside a Stripe search query: only a real uuid is ever put there.
  if (!UUID.test(account.userId)) return null;
  const found = await stripe.subscriptions.search({ query: `metadata['user_id']:'${account.userId}'`, limit: 10 });
  for (const s of found.data) {
    const id = typeof s.customer === "string" ? s.customer : s.customer?.id;
    if (id) return id;
  }
  return null;
}

/**
 * True when any Stripe customer with this email ever had a subscription. Used ONLY to refuse a
 * second free trial (one trial per person); it never links a customer, grants access or opens
 * billing.
 */
export async function emailHadSubscription(stripe: StripeLike, email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  const customers = await stripe.customers.list({ email, limit: 10 });
  for (const c of customers.data) {
    const subs = await stripe.subscriptions.list({ customer: c.id, status: "all", limit: 1 });
    if (subs.data.length > 0) return true;
  }
  return false;
}
