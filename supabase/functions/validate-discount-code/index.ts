// Payment Function Pattern: Tier 1 (Network CDN) + Tier 2 (Vendor) ONLY
// NO template fallback - payment requires live database access
// Returns 503 if both network and vendor fail
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createDynamicCorsResponse, createDynamicCorsErrorResponse, createDynamicCorsOptionsResponse } from "../_shared/corsAdvanced.js";
import { handleHealthAndCors } from "../_shared/healthCors.ts";

serve(async (req) => {
  // Handle health check and CORS preflight
  const healthCorsResponse = handleHealthAndCors(req);
  if (healthCorsResponse) return healthCorsResponse;

  

  try {
    const { code } = await req.json();
    
    if (!code || typeof code !== 'string') {
      return createDynamicCorsErrorResponse('Discount code is required', null, 400);
    }

    // Create payment-specific Supabase client (Tier 1 + Tier 2 only)
    const { createPaymentSupabaseClient, createPaymentUnavailableResponse, memoizedImport } = await import("../_shared/resilientLoader.ts");
    
    let supabase;
    try {
      const { createClient } = await memoizedImport('@supabase/supabase-js');
      supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );
    } catch (importError) {
      console.log('[Validate Discount] Using payment client fallback');
      supabase = await createPaymentSupabaseClient();
    }
    
    if (!supabase) {
      console.error('[Validate Discount] Payment service unavailable - database connection failed');
      return createPaymentUnavailableResponse('validate-discount-code');
    }

    console.log(`[Validate Discount] Checking code: ${code}`);

    // Check if code exists and is active
    const { data: discountCode, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('active', true)
      .single();

    if (error) {
      // Handle "no rows returned" error separately
      if (error.code === 'PGRST116') {
        console.log(`[Validate Discount] Code not found or inactive: ${code}`);
        return createDynamicCorsResponse({ 
          valid: false, 
          message: 'Invalid or expired discount code' 
        }, undefined, 400);
      }
      console.error('[Validate Discount] Database error:', error);
      return createDynamicCorsErrorResponse('Error validating discount code', undefined, 500);
    }

    if (!discountCode) {
      console.log(`[Validate Discount] Code not found: ${code}`);
      return createDynamicCorsResponse({ 
        valid: false, 
        message: 'Invalid or expired discount code' 
      }, undefined, 400);
    }

    // Check usage limits if set
    if (discountCode.max_uses && discountCode.current_uses >= discountCode.max_uses) {
      console.log(`[Validate Discount] Code usage limit reached: ${code}`);
      return createDynamicCorsResponse({
        valid: false,
        message: 'This discount code has reached its usage limit'
      }, null);
    }

    console.log(`[Validate Discount] Code valid: ${code} - ${discountCode.description}`);
    
    return createDynamicCorsResponse({
      valid: true,
      message: `✅ Code validated! ${discountCode.description}`,
      code: discountCode.code,
      description: discountCode.description,
      duration_days: discountCode.duration_days
    }, undefined, 200);

  } catch (error) {
    console.error('[Validate Discount] Error:', error);
    return createDynamicCorsErrorResponse(error instanceof Error ? error.message : 'Internal server error', undefined, 500);
  }
});