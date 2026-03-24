// Discount Code Validation - Requires Authentication
// Direct Supabase REST API calls only
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Cryptographic JWT verification via Supabase Auth API
async function verifyUser(supabaseUrl: string, supabaseAnonKey: string, authHeader: string): Promise<{ id: string; email: string } | null> {
  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': authHeader,
      }
    });
    if (!response.ok) return null;
    const user = await response.json();
    if (!user?.id) return null;
    return { id: user.id, email: user.email || '' };
  } catch {
    return null;
  }
}

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
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || supabaseKey;

    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ 
        valid: false, 
        message: 'Service temporarily unavailable' 
      }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Require authentication to prevent brute-force enumeration
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ 
        valid: false, 
        message: 'Authentication required' 
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const user = await verifyUser(supabaseUrl, supabaseAnonKey!, authHeader);
    if (!user) {
      return new Response(JSON.stringify({ 
        valid: false, 
        message: 'Authentication failed' 
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

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

    console.log(`[Validate Discount] Checking code for user: ${user.id}`);

    // PURE DATABASE READ - Direct REST API call
    const dbResponse = await fetch(
      `${supabaseUrl}/rest/v1/discount_codes?code=eq.${encodeURIComponent(code.toUpperCase())}&active=eq.true&select=code,duration_days,max_uses,current_uses`,
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
      return new Response(JSON.stringify({
        valid: false,
        message: 'This discount code has reached its usage limit'
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Minimal response - don't expose code details to prevent enumeration
    return new Response(JSON.stringify({
      valid: true,
      message: '✅ Code validated!'
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('[Validate Discount] Error:', error);
    return new Response(JSON.stringify({ 
      valid: false, 
      message: 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
