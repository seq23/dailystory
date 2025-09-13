import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return createCorsOptionsResponse();
  }

  

  try {
    const { code } = await req.json();
    
    if (!code || typeof code !== 'string') {
      return createCorsErrorResponse('Discount code is required', 400);
    }

    // Create Supabase client with service role for discount code access
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    console.log(`[Validate Discount] Checking code: ${code}`);

    // Check if code exists and is active
    const { data: discountCode, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('active', true)
      .maybeSingle();

    if (error) {
      console.error('[Validate Discount] Database error:', error);
      return createCorsErrorResponse('Error validating discount code', 500);
    }

    if (!discountCode) {
      console.log(`[Validate Discount] Code not found or inactive: ${code}`);
      return createCorsResponse({ 
        valid: false, 
        message: 'Invalid or expired discount code' 
      });
    }

    // Check usage limits if set
    if (discountCode.max_uses && discountCode.current_uses >= discountCode.max_uses) {
      console.log(`[Validate Discount] Code usage limit reached: ${code}`);
      return createCorsResponse({ 
        valid: false, 
        message: 'This discount code has reached its usage limit' 
      });
    }

    console.log(`[Validate Discount] Code valid: ${code} - ${discountCode.description}`);
    
    return createCorsResponse({
      valid: true,
      message: `✅ Code validated! ${discountCode.description}`,
      code: discountCode.code,
      description: discountCode.description,
      duration_days: discountCode.duration_days
    });

  } catch (error) {
    console.error('[Validate Discount] Error:', error);
    return createCorsErrorResponse(error.message || 'Internal server error', 500);
  }
});