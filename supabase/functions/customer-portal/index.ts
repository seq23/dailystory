// Payment Function Pattern: Tier 1 (Network CDN) + Tier 2 (Vendor) ONLY
// NO template fallback - payment requires live database access
// Returns 503 if both network and vendor fail
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { handleHealthAndCors } from "../_shared/healthCors.ts";
import { createImportFailureResponse } from "../_shared/resilientLoader.ts";
import { createPaymentServiceClient } from "../_shared/paymentSupabase.ts";
import Stripe from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "600",
  "Vary": "Origin, Access-Control-Request-Headers",
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CUSTOMER-PORTAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS and health checks
  const healthResponse = handleHealthAndCors(req);
  if (healthResponse) return healthResponse;

  try {
    logStep("Function started");

    // Load Stripe with resilient import
    
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured yet. Please add your Stripe secret key to access customer portal.");
    }
    logStep("Stripe key verified");

    // Create payment-specific Supabase client (Tier 1 + Tier 2 only)
    const supabaseClient = createPaymentServiceClient();

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      throw new Error("No Stripe customer found for this user. Please complete a purchase first.");
    }
    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const origin = req.headers.get("origin") || "http://localhost:3000";
    // Optional flow from the trial-ending email's links (?billing=yearly|cancel in the app):
    //   cancel: Stripe's own cancel page for the live subscription (Stripe asks to confirm).
    //   yearly: switch a monthly subscription to yearly ($99, docs/PRICING.md) on the same product,
    //           no proration; during a trial the first charge is simply the yearly price.
    let flow: string | null = null;
    try { flow = (await req.json())?.flow ?? null; } catch { flow = null; }
    const live = flow ? (await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 10 })).data
      .find((s: any) => ["trialing", "active", "past_due"].includes(s.status)) : null;
    if (flow === "yearly") {
      if (!live) throw new Error("No active subscription to switch.");
      const item = live.items.data[0];
      if (item?.price?.recurring?.interval === "year") {
        return new Response(JSON.stringify({ switched: false, already: "annual" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
      }
      const product = typeof item.price.product === "string" ? item.price.product : item.price.product.id;
      await stripe.subscriptions.update(live.id, {
        items: [{ id: item.id, price_data: { currency: item.price.currency || "usd", product, unit_amount: 9900, recurring: { interval: "year" } } }],
        proration_behavior: "none",
        metadata: { ...(live.metadata ?? {}), plan: "annual", switched_from: "monthly" },
      });
      logStep("Switched to yearly", { subscription: live.id });
      return new Response(JSON.stringify({ switched: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
    }
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/`,
      ...(flow === "cancel" && live ? {
        flow_data: {
          type: "subscription_cancel",
          subscription_cancel: { subscription: live.id },
          after_completion: { type: "redirect", redirect: { return_url: `${origin}/` } },
        },
      } : {}),
    });
    logStep("Customer portal session created", { sessionId: portalSession.id, url: portalSession.url });

    return new Response(JSON.stringify({ url: portalSession.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in customer-portal", { message: errorMessage });
    
    // Check for import failure and return 503 with structured response
    if (errorMessage.includes('Import') || errorMessage.includes('CDN') || errorMessage.includes('load')) {
      return createImportFailureResponse(error, 'customer-portal');
    }
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});