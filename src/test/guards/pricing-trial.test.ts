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
