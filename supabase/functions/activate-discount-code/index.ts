// Clean Deploy: 2025-01-30T12:00:00Z - Force GitHub refresh
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ACTIVATE-DISCOUNT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Create Supabase client with service role key to bypass RLS
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Also create anon client for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
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

    // Parse request body for discount code
    const { discountCode } = await req.json();
    const codeToActivate = discountCode || "SEQUOIA90"; // Default to SEQUOIA90 if not provided
    logStep("Discount code to activate", { discountCode: codeToActivate });

    // Check if discount code exists and is valid
    const { data: discountCodeData, error: discountError } = await supabaseService
      .from('discount_codes')
      .select('*')
      .eq('code', codeToActivate)
      .eq('active', true)
      .single();

    if (discountError || !discountCodeData) {
      throw new Error(`Invalid or inactive discount code: ${codeToActivate}`);
    }
    logStep("Discount code validated", { code: discountCodeData.code, duration: discountCodeData.duration_days });

    // Check if user already has this discount activated
    const { data: existingSubscriber } = await supabaseService
      .from('subscribers')
      .select('*')
      .eq('user_id', user.id)
      .single();

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

    // Update or create subscriber record with activated discount
    const { data: updatedSubscriber, error: updateError } = await supabaseService
      .from('subscribers')
      .upsert({
        user_id: user.id,
        email: user.email,
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
      }, { 
        onConflict: 'user_id'
      });

    if (updateError) {
      throw new Error(`Failed to activate discount: ${updateError.message}`);
    }
    logStep("Subscriber record updated", { subscriberId: updatedSubscriber?.[0]?.id });

    // Update discount code usage count
    const { error: usageError } = await supabaseService
      .from('discount_codes')
      .update({ 
        current_uses: discountCodeData.current_uses + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', discountCodeData.id);

    if (usageError) {
      console.error("Warning: Failed to update discount code usage:", usageError);
    }

    logStep("Discount code successfully activated", { 
      userId: user.id, 
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