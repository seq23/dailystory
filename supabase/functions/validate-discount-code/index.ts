// PURE DATABASE FUNCTION - Zero Network Dependencies
// Direct Supabase REST API calls only
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    const { code } = await req.json();
    
    if (!code || typeof code !== 'string') {
      return new Response(JSON.stringify({ 
        valid: false, 
        message: 'Discount code is required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ 
        valid: false, 
        message: 'Service temporarily unavailable' 
      }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log(`[Validate Discount] Checking code: ${code}`);

    // PURE DATABASE READ - Direct REST API call
    const dbResponse = await fetch(
      `${supabaseUrl}/rest/v1/discount_codes?code=eq.${encodeURIComponent(code.toUpperCase())}&active=eq.true&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        }
      }
    );

    if (!dbResponse.ok) {
      console.error('[Validate Discount] Database error');
      return new Response(JSON.stringify({ 
        valid: false, 
        message: 'Error validating discount code' 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const data = await dbResponse.json();
    const discountCode = data[0];

    if (!discountCode) {
      console.log(`[Validate Discount] Code not found: ${code}`);
      return new Response(JSON.stringify({ 
        valid: false, 
        message: 'Invalid or expired discount code' 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Check usage limits if set
    if (discountCode.max_uses && discountCode.current_uses >= discountCode.max_uses) {
      console.log(`[Validate Discount] Code usage limit reached: ${code}`);
      return new Response(JSON.stringify({
        valid: false,
        message: 'This discount code has reached its usage limit'
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log(`[Validate Discount] Code valid: ${code} - ${discountCode.description}`);
    
    return new Response(JSON.stringify({
      valid: true,
      message: `✅ Code validated! ${discountCode.description}`,
      code: discountCode.code,
      description: discountCode.description,
      duration_days: discountCode.duration_days
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('[Validate Discount] Error:', error);
    return new Response(JSON.stringify({ 
      valid: false, 
      message: error instanceof Error ? error.message : 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});