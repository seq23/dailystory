// Payment Function Pattern: Tier 1 (Network CDN) + Tier 2 (Vendor) ONLY
// NO template fallback - payment requires live database access
// Returns 503 if both network and vendor fail
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { handleHealthAndCors } from "../_shared/healthCors.ts";
import { createImportFailureResponse } from "../_shared/resilientLoader.ts";
import { createPaymentServiceClient } from "../_shared/paymentSupabase.ts";
import Stripe from "../_shared/stripe.ts";
import { ACCESS_CODE_UNAVAILABLE, ACCESS_CODE_MESSAGES, decideTrial, normalizeAccessCode } from "../_shared/accessCodeRules.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "600",
  "Vary": "Origin, Access-Control-Request-Headers",
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

// A refused access code is a plain message the parent can act on, never a 500.
const codeRefusal = (code: string, message: string, status: number) =>
  new Response(JSON.stringify({ error: message, code }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

serve(async (req) => {
  // Handle CORS and health checks
  const healthResponse = handleHealthAndCors(req);
  if (healthResponse) return healthResponse;

  try {
    logStep("Function started");

    // Load Stripe with resilient import
    
    // Real SDK, service role: verifies the caller and reads subscribers
    const supabaseClient = createPaymentServiceClient();
    const supabaseService = supabaseClient;

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured yet. Please add your Stripe secret key to proceed with payments.");
    }
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check if user already has premium access before creating checkout session
    const { data: existingSubscriber } = await supabaseService
      .from('subscribers')
      .select('subscribed, subscription_end, override_premium, override_end, subscription_tier')
      .eq('user_id', user.id)
      .single();

    if (existingSubscriber) {
      const now = new Date();
      const hasActiveSubscription = existingSubscriber.subscribed && 
        (!existingSubscriber.subscription_end || new Date(existingSubscriber.subscription_end) > now);
      const hasActiveOverride = existingSubscriber.override_premium && 
        (!existingSubscriber.override_end || new Date(existingSubscriber.override_end) > now);
      
      if (hasActiveSubscription || hasActiveOverride) {
        logStep("User already has premium access", { 
          subscribed: existingSubscriber.subscribed,
          overridePremium: existingSubscriber.override_premium,
          tier: existingSubscriber.subscription_tier
        });
        throw new Error("You already have an active premium subscription. No payment needed!");
      }
    }

    // Parse the request body to get the selected plan
    const { plan, accessCode } = await req.json();
    const normalizedCode = normalizeAccessCode(accessCode);
    logStep("Plan selected", { plan, accessCode: normalizedCode || null });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      logStep("Creating new customer");
    }

    // Pricing: $9.99/month or $79/year, 7-day free trial (or an access code's days), card taken up front.
    // STRIPE_PRICE_MONTHLY / STRIPE_PRICE_ANNUAL (Stripe price ids) win when set;
    // otherwise the amounts below are sent inline. Pinned by
    // src/test/guards/free-story-paywall.test.ts.
    if (plan !== "monthly" && plan !== "annual") {
      throw new Error("Invalid plan selected. Choose 'monthly' or 'annual'.");
    }
    const configuredPrice = Deno.env.get(plan === "monthly" ? "STRIPE_PRICE_MONTHLY" : "STRIPE_PRICE_ANNUAL");
    const productId = Deno.env.get("STRIPE_PRODUCT_ID");
    const inlinePrice = {
      currency: "usd",
      ...(productId ? { product: productId } : { product_data: { name: "Time2Read Premium" } }),
      unit_amount: plan === "monthly" ? 999 : 7900, // $9.99 / $79.00
      recurring: { interval: plan === "monthly" ? "month" : "year" },
    };
    const lineItem = configuredPrice
      ? { price: configuredPrice, quantity: 1 }
      : { price_data: inlinePrice, quantity: 1 };

    // One free trial per customer: a returning customer who already had a subscription pays from day one.
    let hadSubscription = false;
    if (customerId) {
      const previous = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 1 });
      hadSubscription = previous.data.length > 0;
    }

    // Access code (optional): validated here on the server against public.access_codes.
    // No code = the default 7-day trial. Rules in _shared/accessCodeRules.ts.
    let codeRow = null;
    if (normalizedCode) {
      const { data: found, error: lookupError } = await supabaseService
        .from("access_codes")
        .select("id, code, trial_days, label, active")
        .eq("code", normalizedCode)
        .eq("active", true)
        .maybeSingle();
      if (lookupError) {
        logStep("Access code lookup failed", { message: lookupError.message });
        return codeRefusal(ACCESS_CODE_UNAVAILABLE, ACCESS_CODE_MESSAGES[ACCESS_CODE_UNAVAILABLE], 503);
      }
      codeRow = found;
    }
    const trial = decideTrial({ rawCode: accessCode, row: codeRow, hadSubscription });
    if (!trial.ok) {
      logStep("Access code refused", { accessCode: normalizedCode, reason: trial.error });
      return codeRefusal(trial.error, trial.message, 400);
    }
    const sessionMetadata: Record<string, string> = {
      user_id: user.id,
      plan,
      ...(trial.code ? { access_code: trial.code.code } : {}),
    };

    const origin = req.headers.get("origin") || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [lineItem],
      mode: "subscription",
      payment_method_collection: "always",
      subscription_data: {
        ...(trial.trialDays > 0 ? { trial_period_days: trial.trialDays } : {}),
        metadata: sessionMetadata,
      },
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`,
      metadata: sessionMetadata,
    });

    logStep("Checkout session created", { sessionId: session.id, trialDays: trial.trialDays, accessCode: trial.code?.code ?? null });

    // Record the code use so signups per code can be counted (access_code_signups view).
    // The webhook marks the row completed. A failed insert never blocks the parent's checkout.
    if (trial.code) {
      const { error: redemptionError } = await supabaseService.from("access_code_redemptions").insert({
        access_code_id: trial.code.id,
        code: trial.code.code,
        trial_days: trial.trialDays,
        user_id: user.id,
        stripe_session_id: session.id,
        stripe_customer_id: customerId ?? null,
      });
      if (redemptionError) logStep("ERROR recording access code use", { message: redemptionError.message });
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    
    // Check for import failure and return 503 with structured response
    if (errorMessage.includes('Import') || errorMessage.includes('CDN') || errorMessage.includes('load')) {
      return createImportFailureResponse(error, 'create-checkout');
    }
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});