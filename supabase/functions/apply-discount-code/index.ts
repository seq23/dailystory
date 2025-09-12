// Redeploy touch: 2025-09-12T18:45:32Z - Force complete rebuild
console.log("[apply-discount-code] Loaded: 2025-09-12T18:45:32Z");
import { serve } from "https://deno.land/std@0.190.0/http/server.js";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.js";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return createCorsOptionsResponse();
  }

  try {
    // Create authenticated Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return createCorsErrorResponse('Authorization required', 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      return createCorsErrorResponse('Invalid authentication', 401);
    }

    console.log(`[Apply Discount] Processing for user: ${user.id}`);

    // Create service role client for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Check if user has a pending discount code
    const { data: subscriber, error: subError } = await supabaseService
      .from('subscribers')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (subError) {
      console.error('[Apply Discount] Error fetching subscriber:', subError);
      return createCorsErrorResponse('Error checking subscription status', 500);
    }

    if (!subscriber?.discount_code_pending) {
      return createCorsResponse({ 
        activated: false, 
        message: 'No pending discount code found' 
      });
    }

    if (subscriber.discount_activated) {
      return createCorsResponse({ 
        activated: false, 
        message: 'Discount code already activated' 
      });
    }

    const discountCode = subscriber.discount_code_pending;
    console.log(`[Apply Discount] Activating code: ${discountCode} for user: ${user.id}`);

    // Get discount code details
    const { data: codeDetails, error: codeError } = await supabaseService
      .from('discount_codes')
      .select('*')
      .eq('code', discountCode)
      .eq('active', true)
      .single();

    if (codeError || !codeDetails) {
      console.error('[Apply Discount] Error fetching code details:', codeError);
      return createCorsErrorResponse('Invalid discount code', 400);
    }

    // Calculate end date (duration_days from now)
    const activationDate = new Date();
    const endDate = new Date(activationDate);
    endDate.setDate(endDate.getDate() + codeDetails.duration_days);

    // Update subscriber with discount activation
    const { error: updateError } = await supabaseService
      .from('subscribers')
      .update({
        subscribed: true,
        subscription_tier: 'premium',
        subscription_end: endDate.toISOString(),
        discount_activated: true,
        discount_activated_at: activationDate.toISOString(),
        override_premium: true,
        override_tier: 'premium',
        override_end: endDate.toISOString(),
        override_reason: `Discount code: ${discountCode}`,
        override_set_by: 'system',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('[Apply Discount] Error updating subscriber:', updateError);
      return createCorsErrorResponse('Error activating discount', 500);
    }

    // Update discount code usage count
    const { error: usageError } = await supabaseService
      .from('discount_codes')
      .update({
        current_uses: codeDetails.current_uses + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', codeDetails.id);

    if (usageError) {
      console.warn('[Apply Discount] Error updating usage count:', usageError);
      // Don't fail the request for this
    }

    console.log(`[Apply Discount] Successfully activated ${discountCode} for user ${user.id} until ${endDate.toISOString()}`);

    return createCorsResponse({
      activated: true,
      message: `Welcome! Your ${codeDetails.duration_days} days of free premium starts now!`,
      code: discountCode,
      description: codeDetails.description,
      duration_days: codeDetails.duration_days,
      activation_date: activationDate.toISOString(),
      end_date: endDate.toISOString()
    });

  } catch (error) {
    console.error('[Apply Discount] Error:', error);
    return createCorsErrorResponse(error.message || 'Internal server error', 500);
  }
});