// The one way a signed-in parent starts the Premium trial: Stripe checkout through the
// create-checkout function. Used by the in-app paywall (StoryPaywall) and the Pricing page
// (27 Oct 2026, final live tests: a signed-in parent on Pricing, reached from "See plans",
// tapped "Start 7-day free trial" and landed on the sign-up form, so a family with free
// stories left had no way to start the trial). Guard: src/test/guards/pricing-trial.test.ts.
import { supabase } from "@/integrations/supabase/client";
import { DebugLogger } from "@/services/DebugLogger";
import { checkoutBody, checkoutErrorMessage } from "@/lib/accessCode";

export type TrialPlan = "monthly" | "annual";

export const CHECKOUT_RETRY_MESSAGE = "We couldn't open checkout just now. Please try again in a moment.";

/**
 * Opens Stripe checkout for the plan. Returns null when the browser is on its way to checkout,
 * or the message to show the parent when it could not open.
 */
export async function startTrialCheckout(plan: TrialPlan, go: (url: string) => void = (url) => { window.location.href = url; }): Promise<string | null> {
  try {
    const { data: session } = await supabase.auth.getSession();
    const { data, error: fnError } = await supabase.functions.invoke("create-checkout", {
      body: checkoutBody(plan),
      headers: session.session ? { Authorization: `Bearer ${session.session.access_token}` } : undefined,
    });
    if (fnError || data?.error) {
      const refused = await checkoutErrorMessage(fnError, data);
      if (refused) return refused;
      throw fnError ?? new Error(data.error);
    }
    if (!data?.url) throw new Error("Checkout did not return a link");
    go(data.url);
    return null;
  } catch (err) {
    DebugLogger.error("auth", "Trial checkout failed", err);
    return CHECKOUT_RETRY_MESSAGE;
  }
}
