// Security Dashboard - Admin only access
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { handleHealthAndCors } from "../_shared/healthCors.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "600",
  "Vary": "Origin, Access-Control-Request-Headers",
};

serve(async (req) => {
  // Handle CORS and health checks
  const healthResponse = handleHealthAndCors(req);
  if (healthResponse) return healthResponse;

  try {
    const { memoizedImport } = await import("../_shared/resilientLoader.ts");
    const { createClient } = await memoizedImport('@supabase/supabase-js');
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
    if (userError || !userData?.user) throw new Error("Authentication failed");

    // Admin access control - only allowed user IDs can access security data
    const adminUserIds = (Deno.env.get('ADMIN_USER_IDS') || '').split(',').filter(Boolean);
    if (adminUserIds.length === 0) {
      // If no admins configured, deny all access for safety
      console.error("[security-dashboard] ADMIN_USER_IDS not configured - denying access");
      return new Response(
        JSON.stringify({ success: false, error: "Security dashboard not configured" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!adminUserIds.includes(userData.user.id)) {
      console.warn(`[security-dashboard] Unauthorized access attempt by user ${userData.user.id}`);
      return new Response(
        JSON.stringify({ success: false, error: "Forbidden" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
