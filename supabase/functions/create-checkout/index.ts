// Payment Function Pattern: Tier 1 (Network CDN) + Tier 2 (Vendor) ONLY
// NO template fallback - payment requires live database access
// Returns 503 if both network and vendor fail
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { handleHealthAndCors } from "../_shared/healthCors.ts";
import { memoizedImport, createPaymentSupabaseClient, createPaymentUnavailableResponse, createImportFailureResponse } from "../_shared/resilientLoader.ts";

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

serve(async (req) => {
  // Handle CORS and health checks
  const healthResponse = handleHealthAndCors(req);
  if (healthResponse) return healthResponse;

  try {
    logStep("Function started");

    // Load Stripe with resilient import
    const { default: Stripe } = await memoizedImport('stripe');
    
    // Create payment-specific Supabase client (Tier 1 + Tier 2 only)
    const supabaseClient = await createPaymentSupabaseClient();
    if (!supabaseClient) {
      logStep("Payment service unavailable - database connection failed");
      return createPaymentUnavailableResponse('create-checkout');
    }
    
    // Create service role client with same fallback pattern
    let supabaseService;
    try {
      const { createClient } = await memoizedImport('@supabase/supabase-js');
      supabaseService = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );
    } catch (importError) {
      console.error('Failed to create service client, using payment client as fallback');
      supabaseService = supabaseClient;
    }

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
    const { plan } = await req.json();
    logStep("Plan selected", { plan });

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

    // Define pricing based on plan
    let priceData;
    if (plan === "monthly") {
      priceData = {
        currency: "usd",
        product_data: { name: "Premium Monthly Subscription" },
        unit_amount: 1000, // $10.00
        recurring: { interval: "month" },
      };
    } else if (plan === "annual") {
      priceData = {
        currency: "usd",
        product_data: { name: "Premium Annual Subscription" },
        unit_amount: 10000, // $100.00
        recurring: { interval: "year" },
      };
    } else {
      throw new Error("Invalid plan selected. Choose 'monthly' or 'annual'.");
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: priceData,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`,
      metadata: {
        user_id: user.id,
        plan: plan,
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

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