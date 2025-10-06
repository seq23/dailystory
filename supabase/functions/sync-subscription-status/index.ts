// BACKGROUND STRIPE SYNC - Writes to subscribers table cache
// This function queries Stripe API and updates the database
// Called periodically or on-demand (non-blocking)

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { memoizedImport, createPaymentSupabaseClient, createResilientStripeClient } from '../_shared/resilientLoader.ts';
import { handleHealthAndCors } from "../_shared/healthCors.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SYNC-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  const healthResponse = handleHealthAndCors(req);
  if (healthResponse) return healthResponse;

  try {
    const supabaseClient = await createPaymentSupabaseClient();
    if (!supabaseClient) {
      logStep("Payment client unavailable - skipping sync");
      return new Response(JSON.stringify({
        success: false,
        message: "Payment client unavailable"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("Stripe key not configured - skipping sync");
      return new Response(JSON.stringify({
        success: false,
        message: "Stripe not configured"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Get user from authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("No authorization header - skipping sync");
      return new Response(JSON.stringify({
        success: false,
        message: "No authorization"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !userData?.user?.email) {
      logStep("Auth failed", { error: authError?.message });
      return new Response(JSON.stringify({
        success: false,
        message: "Authentication failed"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const user = userData.user;
    logStep("Syncing subscription for user", { email: user.email });

    // Check for manual override first
    const { data: subRow } = await supabaseClient
      .from("subscribers")
      .select("override_premium, override_tier, override_end, stripe_customer_id")
      .eq("email", user.email)
      .maybeSingle();

    const overrideActive = subRow?.override_premium === true &&
      (!subRow.override_end || new Date(subRow.override_end) > new Date());

    if (overrideActive) {
      logStep("Override active - updating cache", { tier: subRow.override_tier });
      await supabaseClient.from("subscribers").upsert({
        email: user.email,
        user_id: user.id,
        stripe_customer_id: subRow?.stripe_customer_id ?? null,
        subscribed: true,
        subscription_tier: subRow?.override_tier ?? "Premium",
        subscription_end: subRow?.override_end ?? null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });

      return new Response(JSON.stringify({
        success: true,
        subscribed: true,
        source: "manual_override"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Query Stripe for current subscription status
    const stripe = await createResilientStripeClient(stripeKey);
    if (!stripe) {
      logStep("Stripe client unavailable - skipping sync");
      return new Response(JSON.stringify({
        success: false,
        message: "Stripe service unavailable"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No Stripe customer found - updating cache as unsubscribed");
      await supabaseClient.from("subscribers").upsert({
        email: user.email,
        user_id: user.id,
        stripe_customer_id: null,
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });

      return new Response(JSON.stringify({
        success: true,
        subscribed: false,
        source: "stripe_api"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionTier = null;
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      
      const priceId = subscription.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId);
      const amount = price.unit_amount || 0;
      
      if (amount === 1000 && price.recurring?.interval === 'month') {
        subscriptionTier = "Monthly Premium";
      } else if (amount === 10000 && price.recurring?.interval === 'year') {
        subscriptionTier = "Annual Premium";
      } else {
        subscriptionTier = "Premium";
      }
      
      logStep("Active subscription found", { tier: subscriptionTier, endDate: subscriptionEnd });
    } else {
      logStep("No active subscription");
    }

    // Update database cache with fresh Stripe data
    await supabaseClient.from("subscribers").upsert({
      email: user.email,
      user_id: user.id,
      stripe_customer_id: customerId,
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    logStep("Cache updated successfully", { subscribed: hasActiveSub });
    
    return new Response(JSON.stringify({
      success: true,
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      source: "stripe_api"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR during sync", { message: errorMessage });
    
    return new Response(JSON.stringify({
      success: false,
      message: "Sync failed",
      error: errorMessage
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
