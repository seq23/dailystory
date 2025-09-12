import { serve } from "https://deno.land/std@0.190.0/http/server.js";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured yet. Please add your Stripe secret key to proceed with payments.");
    }
    logStep("Stripe key verified");

    // Create a Supabase client using the anon key for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Also create service role client for checking subscription status
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

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
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});