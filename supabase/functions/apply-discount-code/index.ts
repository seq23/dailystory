// Payment Function Pattern: Tier 1 (Network CDN) + Tier 2 (Vendor) ONLY
// NO template fallback - payment requires live database access
// Returns 503 if both network and vendor fail
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createPaymentSupabaseClient, createPaymentUnavailableResponse, memoizedImport } from '../_shared/resilientLoader.ts';
import { createDynamicCorsResponse, createDynamicCorsErrorResponse, createDynamicCorsOptionsResponse } from "../_shared/corsAdvanced.js";
import { handleHealthAndCors } from "../_shared/healthCors.ts";

serve(async (req) => {
  // Handle health check and CORS preflight
  const healthCorsResponse = handleHealthAndCors(req);
  if (healthCorsResponse) return healthCorsResponse;

  try {
    // Create payment-specific Supabase client (Tier 1 + Tier 2 only)
    const supabaseClient = await createPaymentSupabaseClient();
    if (!supabaseClient) {
      console.error('[Apply Discount] Payment service unavailable - database connection failed');
      return createPaymentUnavailableResponse('apply-discount-code');
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
      console.log('[Apply Discount] Using payment client as service fallback');
      supabaseService = supabaseClient;
    }

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return createDynamicCorsErrorResponse('Authorization required', null, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      return createDynamicCorsErrorResponse('Invalid authentication', null, 401);
    }

    console.log(`[Apply Discount] Processing for user: ${user.id}`);

    // Check if user has a pending discount code
    const { data: subscriber, error: subError } = await supabaseService
      .from('subscribers')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (subError) {
      console.error('[Apply Discount] Error fetching subscriber:', subError);
      return createDynamicCorsErrorResponse('Error checking subscription status', null, 500);
    }

    if (!subscriber?.discount_code_pending) {
      return createDynamicCorsResponse({ 
        activated: false, 
        message: 'No pending discount code found' 
      }, null);
    }

    if (subscriber.discount_activated) {
      return createDynamicCorsResponse({ 
        activated: false, 
        message: 'Discount code already activated' 
      }, null);
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
      return createDynamicCorsErrorResponse('Invalid discount code', null, 400);
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
      return createDynamicCorsErrorResponse('Error activating discount', null, 500);
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

    return createDynamicCorsResponse({
      activated: true,
      message: `Welcome! Your ${codeDetails.duration_days} days of free premium starts now!`,
      code: discountCode,
      description: codeDetails.description,
      duration_days: codeDetails.duration_days,
      activation_date: activationDate.toISOString(),
      end_date: endDate.toISOString()
    }, null);

  } catch (error) {
    console.error('[Apply Discount] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return createDynamicCorsErrorResponse(errorMessage, null, 500);
  }
});