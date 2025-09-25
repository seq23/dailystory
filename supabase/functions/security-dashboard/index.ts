// Clean Deploy: 2025-01-30T12:00:00Z - Force GitHub refresh
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { handleHealthAndCors } from "../_shared/healthCors.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "600",
};

serve(async (req) => {
  // Handle CORS and health checks
  const healthResponse = handleHealthAndCors(req);
  if (healthResponse) return healthResponse;

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw userError;

    // Get security dashboard data
    const { data: dashboardData, error: dashboardError } = await supabaseClient
      .rpc('get_security_dashboard');

    if (dashboardError) {
      console.error("Error getting dashboard data:", dashboardError);
      throw dashboardError;
    }

    // Get recent security events
    const { data: recentEvents } = await supabaseClient
      .from('security_audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    const dashboardResponse = {
      dashboard_data: dashboardData,
      recent_events: recentEvents || [],
      system_status: {
        monitoring_active: true,
        last_updated: new Date().toISOString()
      }
    };

    return new Response(
      JSON.stringify({ 
        success: true, 
        ...dashboardResponse
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in security-dashboard:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : String(error) }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});