// Discount Code Validation - Public (pre-auth, used on the sign-up form)
// Anti-enumeration is enforced via IP-based rate limiting (no auth required)
// Direct Supabase REST API calls only
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// IP-based rate limiting to prevent brute-force code enumeration.
// Returns true when the request is allowed, false when the limit is exceeded.
const RATE_LIMIT_MAX = 10; // max attempts
const RATE_LIMIT_WINDOW_MIN = 5; // per 5-minute window
async function checkRateLimit(supabaseUrl: string, supabaseKey: string, ip: string): Promise<boolean> {
  try {
    const action = 'validate-discount-code';
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MIN * 60 * 1000).toISOString();

    // Count recent attempts from this IP within the window
    const countResp = await fetch(
      `${supabaseUrl}/rest/v1/rate_limits?identifier=eq.${encodeURIComponent(ip)}&action=eq.${action}&window_start=gte.${encodeURIComponent(windowStart)}&select=id`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'count=exact',
        }
      }
    );
    const rows = await countResp.json();
    if (Array.isArray(rows) && rows.length >= RATE_LIMIT_MAX) {
      return false;
    }

    // Record this attempt (best-effort)
    await fetch(`${supabaseUrl}/rest/v1/rate_limits`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ identifier: ip, action })
    });
    return true;
  } catch {
    // Fail open on rate-limit infra errors so legitimate users aren't blocked
    return true;
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

    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ 
        valid: false, 
        message: 'Service temporarily unavailable' 
      }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Anti-enumeration: IP-based rate limiting (this is a pre-auth public endpoint)
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
    const allowed = await checkRateLimit(supabaseUrl, supabaseKey, ip);
    if (!allowed) {
      return new Response(JSON.stringify({ 
        valid: false, 
        message: 'Too many attempts. Please try again in a few minutes.' 
      }), {
        status: 429,
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

    console.log(`[Validate Discount] Checking code (ip: ${ip})`);

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
