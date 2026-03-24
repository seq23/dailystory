// PURE DATABASE READER - Zero Network Dependencies
// This function ONLY reads from the subscribers table cache
// Stripe sync happens in background via sync-subscription-status function

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { handleHealthAndCors } from "../_shared/healthCors.ts";

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
    if (!user?.id || !user?.email) return null;
    return { id: user.id, email: user.email };
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
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || supabaseKey;
    
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

    // Cryptographically verify JWT via Supabase Auth
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

    const user = await verifyUser(supabaseUrl, supabaseAnonKey!, authHeader);
    if (!user?.email) {
      return new Response(JSON.stringify({
        subscribed: false,
        cached: true,
        message: "Authentication failed"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const userEmail = user.email;

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
