// PURE DATABASE FUNCTION - Zero Network Dependencies
// Direct Supabase REST API calls only
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
        activated: false, 
        message: 'Service temporarily unavailable' 
      }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ 
        activated: false, 
        message: 'Authorization required' 
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = decodeJWT(token);
    const userId = payload?.sub;

    if (!userId) {
      return new Response(JSON.stringify({ 
        activated: false, 
        message: 'Invalid authentication' 
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log(`[Apply Discount] Processing for user: ${userId}`);

    // Check if user has a pending discount code - PURE DATABASE READ
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
    const subscriber = subData[0];

    if (!subscriber?.discount_code_pending) {
      return new Response(JSON.stringify({ 
        activated: false, 
        message: 'No pending discount code found' 
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (subscriber.discount_activated) {
      return new Response(JSON.stringify({ 
        activated: false, 
        message: 'Discount code already activated' 
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const discountCode = subscriber.discount_code_pending;
    console.log(`[Apply Discount] Activating code: ${discountCode} for user: ${userId}`);

    // Get discount code details - PURE DATABASE READ
    const codeResponse = await fetch(
      `${supabaseUrl}/rest/v1/discount_codes?code=eq.${encodeURIComponent(discountCode)}&active=eq.true&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        }
      }
    );

    const codeData = await codeResponse.json();
    const codeDetails = codeData[0];

    if (!codeDetails) {
      console.error('[Apply Discount] Invalid discount code');
      return new Response(JSON.stringify({ 
        activated: false, 
        message: 'Invalid discount code' 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Calculate end date
    const activationDate = new Date();
    const endDate = new Date(activationDate);
    endDate.setDate(endDate.getDate() + codeDetails.duration_days);

    // Update subscriber with discount activation - PURE DATABASE WRITE
    const updateResponse = await fetch(
      `${supabaseUrl}/rest/v1/subscribers?user_id=eq.${userId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
      }
    );

    if (!updateResponse.ok) {
      console.error('[Apply Discount] Error updating subscriber');
      return new Response(JSON.stringify({ 
        activated: false, 
        message: 'Error activating discount' 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Update discount code usage count - PURE DATABASE WRITE
    await fetch(
      `${supabaseUrl}/rest/v1/discount_codes?id=eq.${codeDetails.id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_uses: codeDetails.current_uses + 1,
          updated_at: new Date().toISOString()
        })
      }
    );

    console.log(`[Apply Discount] Successfully activated ${discountCode} for user ${userId} until ${endDate.toISOString()}`);

    return new Response(JSON.stringify({
      activated: true,
      message: `Welcome! Your ${codeDetails.duration_days} days of free premium starts now!`,
      code: discountCode,
      description: codeDetails.description,
      duration_days: codeDetails.duration_days,
      activation_date: activationDate.toISOString(),
      end_date: endDate.toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('[Apply Discount] Error:', error);
    return new Response(JSON.stringify({ 
      activated: false, 
      message: error instanceof Error ? error.message : 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});