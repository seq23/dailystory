import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import { withSecurity, SecurityMiddleware, AuthenticatedUser } from "../_shared/security.js";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

interface IncidentLogRequest {
  userId: string;
  childProfileId?: string;
  violationType: string;
  detectedContent: string;
  contextField: string;
  ipAddress?: string;
  userAgent?: string;
}

const handler = async (req: Request, user?: AuthenticatedUser): Promise<Response> => {
  const security = new SecurityMiddleware();
  
  try {
    const { 
      childProfileId,
      violationType,
      detectedContent,
      contextField,
      userAgent
    }: Omit<IncidentLogRequest, 'userId'> = await req.json();

    // Use authenticated user ID instead of accepting it from request
    const userId = user?.id;
    if (!userId) {
      throw new Error('User authentication required');
    }

    // Validate that child profile belongs to authenticated user
    if (childProfileId) {
      const { data: childProfile, error: childError } = await supabase
        .from('child_profiles')
        .select('id')
        .eq('id', childProfileId)
        .eq('parent_user_id', userId)
        .single();
      
      if (childError || !childProfile) {
        throw new Error('Child profile access denied');
      }
    }

    console.log("Logging personal info incident:", {
      userId,
      violationType,
      contextField
    });

    // Log the incident to the database with server-extracted data
    const { data: incident, error: insertError } = await supabase
      .from('personal_info_incidents')
      .insert({
        user_id: userId,
        child_profile_id: childProfileId,
        violation_type: violationType,
        detected_content: detectedContent,
        context_field: contextField,
        ip_address: security.getClientIP(req),
        user_agent: req.headers.get('User-Agent'),
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

    return security.createSecureResponse({
      success: true,
      incidentId: incident.id,
      shouldTriggerEmail,
      recentIncidentCount: incidentCount,
      recentIncidents: recentIncidents?.slice(0, 5) // Return last 5 incidents for context
    });
  } catch (error: any) {
    console.error("Error in log-personal-info-incident function:", error);
    return security.createErrorResponse(error.message, 500);
  }
};

// Apply security middleware with authentication required
serve(await withSecurity(handler, {
  requireAuth: true,
  rateLimit: {
    requests: 10, // Max 10 incident reports per hour per user
    windowMs: 60 * 60 * 1000 // 1 hour
  },
  auditLog: true
}));