// HYBRID FUNCTION - Pure Database + Stripe SDK
// Uses direct database calls for Supabase, requires Stripe SDK for payment sync
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple JWT decoder (no library imports needed)
function decodeJWT(token: string): { email?: string; sub?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SYNC-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Inline CORS and health check handling
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  
  const url = new URL(req.url);
  if (req.method === 'HEAD' && (url.pathname === '/health' || url.pathname === '/')) {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  
  if (req.method === 'GET' && (url.pathname === '/health' || url.pathname === '/')) {
    return new Response(JSON.stringify({ ok: true }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({
        success: false,
        message: "Database configuration unavailable"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 503,
      });
    }

    if (!stripeKey) {
      logStep("Stripe key not configured - skipping sync");
      return new Response(JSON.stringify({
        success: false,
        message: "Stripe not configured"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 503,
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("No authorization header - skipping sync");
      return new Response(JSON.stringify({
        success: false,
        message: "No authorization"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = decodeJWT(token);
    const userEmail = payload?.email;
    const userId = payload?.sub;

    if (!userEmail || !userId) {
      logStep("Auth failed - invalid token");
      return new Response(JSON.stringify({
        success: false,
        message: "Authentication failed"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    logStep("Syncing subscription for user", { email: userEmail });

    // Check for manual override first - PURE DATABASE READ
    const subResponse = await fetch(
      `${supabaseUrl}/rest/v1/subscribers?email=eq.${encodeURIComponent(userEmail)}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        }
      }
    );

    const subData = await subResponse.json();
    const subRow = subData[0];

    const overrideActive = (subRow?.override_premium === true &&
      (!subRow.override_end || new Date(subRow.override_end) > new Date())) ||
      subRow?.discount_activated === true;

    if (overrideActive) {
      logStep("Override or discount active - preserving status", { 
        tier: subRow.override_tier,
        discountActivated: subRow.discount_activated
      });

      // Update cache - PURE DATABASE WRITE
      await fetch(
        `${supabaseUrl}/rest/v1/subscribers`,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            email: userEmail,
            user_id: userId,
            stripe_customer_id: subRow?.stripe_customer_id ?? null,
            subscribed: true,
            subscription_tier: subRow?.override_tier ?? "Premium",
            subscription_end: subRow?.override_end ?? null,
            discount_activated: subRow?.discount_activated ?? false,
            discount_activated_at: subRow?.discount_activated_at ?? null,
            updated_at: new Date().toISOString(),
          })
        }
      );

      return new Response(JSON.stringify({
        success: true,
        subscribed: true,
        source: "manual_override"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Query Stripe for current subscription status (only external dependency)
    const Stripe = (await import("https://esm.sh/stripe@14.21.0")).default;
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    
    if (customers.data.length === 0) {
      // Check if user has discount activation BEFORE marking as unsubscribed
      if (subRow?.discount_activated === true || 
          (subRow?.override_premium === true && 
           (!subRow?.override_end || new Date(subRow.override_end) > new Date()))) {
        logStep("No Stripe customer but discount/override active - preserving status");
        return new Response(JSON.stringify({
          success: true,
          subscribed: true,
          source: "discount_protection"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      logStep("No Stripe customer found AND no discount - updating cache as unsubscribed");
      
      // Update cache - PURE DATABASE WRITE
      await fetch(
        `${supabaseUrl}/rest/v1/subscribers`,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            email: userEmail,
            user_id: userId,
            stripe_customer_id: null,
            subscribed: false,
            subscription_tier: null,
            subscription_end: null,
            updated_at: new Date().toISOString(),
          })
        }
      );

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

    // Update database cache with fresh Stripe data - PURE DATABASE WRITE
    await fetch(
      `${supabaseUrl}/rest/v1/subscribers`,
      {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          email: userEmail,
          user_id: userId,
          stripe_customer_id: customerId,
          subscribed: hasActiveSub,
          subscription_tier: subscriptionTier,
          subscription_end: subscriptionEnd,
          updated_at: new Date().toISOString(),
        })
      }
    );

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
      status: 500,
    });
  }
});
