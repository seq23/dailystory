import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface IncidentLogRequest {
  userId: string;
  childProfileId?: string;
  violationType: string;
  detectedContent: string;
  contextField: string;
  ipAddress?: string;
  userAgent?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      userId,
      childProfileId,
      violationType,
      detectedContent,
      contextField,
      ipAddress,
      userAgent
    }: IncidentLogRequest = await req.json();

    console.log("Logging personal info incident:", {
      userId,
      violationType,
      contextField
    });

    // Log the incident to the database
    const { data: incident, error: insertError } = await supabase
      .from('personal_info_incidents')
      .insert({
        user_id: userId,
        child_profile_id: childProfileId,
        violation_type: violationType,
        detected_content: detectedContent,
        context_field: contextField,
        ip_address: ipAddress,
        user_agent: userAgent,
        email_notification_sent: false
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to log incident: ${insertError.message}`);
    }

    // Check if we should trigger email notifications
    // Count recent incidents for this user
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentIncidents, error: countError } = await supabase
      .from('personal_info_incidents')
      .select('id, violation_type, detected_content, created_at')
      .eq('user_id', userId)
      .gte('created_at', oneDayAgo)
      .order('created_at', { ascending: false });

    if (countError) {
      console.error("Error counting recent incidents:", countError);
    }

    const incidentCount = recentIncidents?.length || 1;
    let shouldTriggerEmail = false;

    // Trigger immediate email for severe violations or multiple incidents
    if (violationType.includes('phone') || 
        violationType.includes('address') || 
        violationType.includes('email') ||
        incidentCount >= 3) {
      shouldTriggerEmail = true;
    }

    console.log("Incident logged successfully:", {
      incidentId: incident.id,
      shouldTriggerEmail,
      recentIncidentCount: incidentCount
    });

    return new Response(JSON.stringify({
      success: true,
      incidentId: incident.id,
      shouldTriggerEmail,
      recentIncidentCount: incidentCount,
      recentIncidents: recentIncidents?.slice(0, 5) // Return last 5 incidents
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in log-personal-info-incident function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);