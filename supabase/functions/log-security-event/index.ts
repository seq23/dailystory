import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import { withSecurity, SecurityMiddleware, AuthenticatedUser } from "../_shared/security.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

interface SecurityEventRequest {
  eventType: string;
  details: any;
}

const handler = async (req: Request, user?: AuthenticatedUser): Promise<Response> => {
  const security = new SecurityMiddleware();
  
  try {
    const { eventType, details }: SecurityEventRequest = await req.json();

    // Validate event type
    const allowedEventTypes = [
      'validation_failure',
      'incident_logging_failure', 
      'incident_logging_error',
      'auth_failure',
      'rate_limit_exceeded',
      'security_violation',
      'csp_violation',
      'suspicious_activity',
      'function_access',
      'premium_required'
    ];

    if (!allowedEventTypes.includes(eventType)) {
      throw new Error('Invalid event type');
    }

    // Enhanced details with server-side information
    const enhancedDetails = {
      ...details,
      server_timestamp: new Date().toISOString(),
      ip_address: security.getClientIP(req),
      user_agent: req.headers.get('User-Agent'),
      referer: req.headers.get('Referer'),
      origin: req.headers.get('Origin')
    };

    // Log the security event to the database
    const { data: logEntry, error: insertError } = await supabase
      .from('security_audit_log')
      .insert({
        event_type: eventType,
        user_id: user?.id || null,
        details: enhancedDetails,
        ip_address: security.getClientIP(req),
        user_agent: req.headers.get('User-Agent'),
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to log security event: ${insertError.message}`);
    }

    // For critical events, also log to console for immediate attention
    if (['security_violation', 'auth_failure', 'suspicious_activity'].includes(eventType)) {
      console.warn(`CRITICAL SECURITY EVENT: ${eventType}`, {
        userId: user?.id,
        details: enhancedDetails,
        logId: logEntry.id
      });
    }

    return security.createSecureResponse({
      success: true,
      logId: logEntry.id,
      timestamp: logEntry.created_at
    });

  } catch (error: any) {
    console.error("Error in log-security-event function:", error);
    return security.createErrorResponse(error.message, 500);
  }
};

// Apply security middleware - requires authentication and rate limiting
serve(await withSecurity(handler, {
  requireAuth: true,
  rateLimit: {
    requests: 50, // Max 50 security events per hour per user
    windowMs: 60 * 60 * 1000 // 1 hour
  },
  auditLog: false // Don't create recursive logging
}));