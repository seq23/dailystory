// PURE DATABASE FUNCTION - Zero Network Dependencies
// Direct Supabase REST API calls only
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { handleHealthAndCors } from "../_shared/healthCors.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "600",
  "Vary": "Origin, Access-Control-Request-Headers",
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
  console.log(`[ACTIVATE-DISCOUNT] ${step}${detailsStr}`);
};

serve(async (req) => {
  const healthResponse = handleHealthAndCors(req);
  if (healthResponse) return healthResponse;

  try {
    logStep("Function started");

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Service temporarily unavailable' 
      }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const payload = decodeJWT(token);
    const userId = payload?.sub;
    const userEmail = payload?.email;

    if (!userId || !userEmail) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId, email: userEmail });

    // Parse request body for discount code
    const { discountCode } = await req.json();
    const codeToActivate = discountCode || "SEQUOIA90";
    logStep("Discount code to activate", { discountCode: codeToActivate });

    // Check if discount code exists and is valid - PURE DATABASE READ
    const codeResponse = await fetch(
      `${supabaseUrl}/rest/v1/discount_codes?code=eq.${encodeURIComponent(codeToActivate)}&active=eq.true&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        }
      }
    );

    const codeData = await codeResponse.json();
    const discountCodeData = codeData[0];

    if (!discountCodeData) {
      throw new Error(`Invalid or inactive discount code: ${codeToActivate}`);
    }
    logStep("Discount code validated", { code: discountCodeData.code, duration: discountCodeData.duration_days });

    // Check if user already has this discount activated - PURE DATABASE READ
    const subResponse = await fetch(
      `${supabaseUrl}/rest/v1/subscribers?user_id=eq.${userId}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        }
      }
    );

    const subData = await subResponse.json();
    const existingSubscriber = subData[0];

    if (existingSubscriber?.discount_activated) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Discount code already activated for this account",
        alreadyActivated: true 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Calculate subscription end date
    const subscriptionEnd = new Date();
    subscriptionEnd.setDate(subscriptionEnd.getDate() + discountCodeData.duration_days);

    // Update or create subscriber record with activated discount - PURE DATABASE WRITE
    const subscriberData = {
      user_id: userId,
      email: userEmail,
      subscribed: true,
      subscription_tier: "Premium",
      subscription_end: subscriptionEnd.toISOString(),
      override_premium: true,
      override_end: subscriptionEnd.toISOString(),
      override_reason: `Discount code: ${codeToActivate}`,
      override_tier: "Premium",
      discount_activated: true,
      discount_activated_at: new Date().toISOString(),
      discount_code_pending: null,
      updated_at: new Date().toISOString(),
    };

    const upsertResponse = await fetch(
      `${supabaseUrl}/rest/v1/subscribers`,
      {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates,return=representation'
        },
        body: JSON.stringify(subscriberData)
      }
    );

    if (!upsertResponse.ok) {
      throw new Error('Failed to activate discount');
    }

    const updatedSubscriber = await upsertResponse.json();
    logStep("Subscriber record verified", { 
      subscriberId: updatedSubscriber?.[0]?.id,
      discountActivated: updatedSubscriber?.[0]?.discount_activated,
      subscribed: updatedSubscriber?.[0]?.subscribed
    });

    // Update discount code usage count - PURE DATABASE WRITE
    await fetch(
      `${supabaseUrl}/rest/v1/discount_codes?id=eq.${discountCodeData.id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          current_uses: discountCodeData.current_uses + 1,
          updated_at: new Date().toISOString()
        })
      }
    );

    logStep("Discount code successfully activated", { 
      userId, 
      code: codeToActivate,
      expiresAt: subscriptionEnd.toISOString()
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: `${codeToActivate} discount activated! You now have Premium access until ${subscriptionEnd.toLocaleDateString()}`,
      activated: true,
      expiresAt: subscriptionEnd.toISOString(),
      tier: "Premium"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in activate-discount-code", { message: errorMessage });
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
