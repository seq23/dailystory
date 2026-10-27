// Guard (27 Oct 2026, final live tests): a signed-in parent on Pricing (reached from "See plans")
// tapped "Start 7-day free trial" and landed on the sign-up form; with free stories left there
// was no way to start the trial. Pricing and the in-app paywall now share one checkout start.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const invoke = vi.fn();
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getSession: vi.fn(async () => ({ data: { session: { access_token: "tok" } } })) },
    functions: { invoke: (...a: unknown[]) => invoke(...a) },
  },
}));

const read = (rel: string) => readFileSync(join(__dirname, "../../..", rel), "utf8");

describe("starting the trial", () => {
  beforeEach(() => invoke.mockReset());

  it("opens Stripe checkout for the chosen plan, as the signed-in parent", async () => {
    const { startTrialCheckout } = await import("@/lib/trialCheckout");
    invoke.mockResolvedValue({ data: { url: "https://checkout.stripe.com/c/pay/x" }, error: null });
    const go = vi.fn();
    expect(await startTrialCheckout("annual", go)).toBeNull();
    expect(go).toHaveBeenCalledWith("https://checkout.stripe.com/c/pay/x");
    const [fn, opts] = invoke.mock.calls[0] as [string, { body: { plan: string }; headers: Record<string, string> }];
    expect(fn).toBe("create-checkout");
    expect(opts.body.plan).toBe("annual");
    expect(opts.headers.Authorization).toBe("Bearer tok");
  });
  it("tells the parent when checkout cannot open, and goes nowhere", async () => {
    const { startTrialCheckout, CHECKOUT_RETRY_MESSAGE } = await import("@/lib/trialCheckout");
    invoke.mockResolvedValue({ data: {}, error: null });
    const go = vi.fn();
    expect(await startTrialCheckout("monthly", go)).toBe(CHECKOUT_RETRY_MESSAGE);
    expect(go).not.toHaveBeenCalled();
  });
});

describe("Pricing and the paywall use the one checkout start", () => {
  it("Pricing: a signed-in parent gets plan buttons that open checkout; only a signed-out visitor goes to /auth", () => {
    const s = read("src/components/PricingSection.tsx");
    const premium = s.slice(s.indexOf("{/* Premium */}"), s.indexOf("{/* Enterprise */}"));
    expect(premium).toMatch(/\{signedIn \? \(\s*<div className="space-y-2" data-testid="pricing-trial-signed-in">/);
    expect(premium).toMatch(/onClick=\{\(\) => startTrial\(plan\)\}/);
    expect(premium).toMatch(/\) : \(\s*<Link to="\/auth">/);
    expect(s).toMatch(/const problem = await startTrialCheckout\(plan\);/);
    expect(s).toMatch(/supabase\.auth\.getSession\(\)\.then\(\(\{ data \}\) => \{ if \(live\) setSignedIn\(!!data\.session\); \}\)/);
  });
  it("the paywall keeps no checkout code of its own", () => {
    const s = read("src/components/StoryPaywall.tsx");
    expect(s).toMatch(/const problem = await startTrialCheckout\(plan\);/);
    expect(s).not.toMatch(/functions\.invoke\("create-checkout"/);
  });
});

describe("the stored Premium end is Stripe's date", () => {
  it("a trial ends at its trial end; a cancel date wins; no date falls back", async () => {
    const { subscriptionEndFrom, subscriptionGivesAccess } = await import("../../../supabase/functions/_shared/subscriptionEnd");
    const fb = new Date("2030-01-01T00:00:00Z");
    const nov3 = Date.UTC(2026, 10, 3) / 1000;
    expect(subscriptionEndFrom({ status: "trialing", current_period_end: nov3, trial_end: nov3 }, fb).toISOString()).toBe("2026-11-03T00:00:00.000Z");
    expect(subscriptionEndFrom({ cancel_at: nov3 - 86400, current_period_end: nov3 }, fb).toISOString()).toBe("2026-11-02T00:00:00.000Z");
    expect(subscriptionEndFrom(null, fb)).toBe(fb);
    expect(subscriptionEndFrom({}, fb)).toBe(fb);
    expect(subscriptionGivesAccess("trialing")).toBe(true);
    expect(subscriptionGivesAccess("canceled")).toBe(false);
  });
  it("the webhook stores it at checkout and on every subscription update", () => {
    const w = read("supabase/functions/stripe-webhook/index.ts");
    const checkout = w.slice(w.indexOf('event.type === "checkout.session.completed"'), w.indexOf('event.type === "customer.subscription.updated"'));
    expect(checkout).toMatch(/stripeSub = await stripe\.subscriptions\.retrieve\(String\(session\.subscription\)\);/);
    expect(checkout).toMatch(/const subscriptionEnd = subscriptionEndFrom\(stripeSub, planEnd\);/);
    expect(checkout).toMatch(/subscription_end: subscriptionEnd\.toISOString\(\),/);
    const upd = w.slice(w.indexOf('event.type === "customer.subscription.updated"'), w.indexOf('event.type === "customer.subscription.deleted"'));
    expect(upd).toMatch(/subscribed: subscriptionGivesAccess\(subscription\.status\),\s*subscription_end: subscriptionEnd\.toISOString\(\),/);
    expect(upd).toMatch(/\.eq\("stripe_customer_id", stripeCustomerId\)/);
  });
});
