// PURE DATABASE READER - Zero Network Dependencies
// This function ONLY reads from the subscribers table cache
// Stripe sync happens in background via sync-subscription-status function

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { handleHealthAndCors } from "../_shared/healthCors.ts";

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
  const healthResponse = handleHealthAndCors(req);
  if (healthResponse) return healthResponse;

  try {
    // Get Supabase connection details from env
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({
        subscribed: false,
        cached: true,
        message: "Database configuration unavailable"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Extract user email from JWT token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({
        subscribed: false,
        cached: true,
        message: "No authorization provided"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = decodeJWT(token);
    const userEmail = payload?.email;

    if (!userEmail) {
      return new Response(JSON.stringify({
        subscribed: false,
        cached: true,
        message: "Email not available"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // PURE DATABASE READ - Direct REST API call (no network imports)
    const dbResponse = await fetch(
      `${supabaseUrl}/rest/v1/subscribers?email=eq.${encodeURIComponent(userEmail)}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        }
      }
    );

    if (!dbResponse.ok) {
      return new Response(JSON.stringify({
        subscribed: false,
        cached: true,
        message: "Database read failed"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const data = await dbResponse.json();
    const subscriber = data[0];

    // Return cached subscription status
    const now = new Date();
    const hasValidSubscription = subscriber?.subscribed === true;
    const hasValidOverride = subscriber?.override_premium === true &&
      (!subscriber.override_end || new Date(subscriber.override_end) > now);
    
    const isActive = hasValidSubscription || hasValidOverride;

    return new Response(JSON.stringify({
      subscribed: isActive,
      subscription_tier: subscriber?.subscription_tier ?? null,
      subscription_end: subscriber?.subscription_end ?? null,
      cached: true,
      last_synced: subscriber?.updated_at ?? null,
      source: "database_cache"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    // Graceful fallback - always return 200 with unsubscribed state
    return new Response(JSON.stringify({
      subscribed: false,
      cached: true,
      message: "Could not retrieve subscription status",
      error: error instanceof Error ? error.message : "Unknown error"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
