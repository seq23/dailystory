// Clean Deploy: 2025-01-30T12:00:00Z - Force GitHub refresh
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

import { handleHealthAndCors } from "../_shared/healthCors.ts";


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '600',
  'Content-Type': 'application/json',
  'Vary': 'Origin, Access-Control-Request-Headers',
};

interface SecurityEventRequest {
  eventType: string;
  details: any;
}

interface AuthenticatedUser {
  id: string;
  email?: string;
}

// Helper function to get client IP
function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for') || 
         req.headers.get('x-real-ip') || 
         req.headers.get('cf-connecting-ip') || 
         'unknown';
}

// Helper function to validate JWT and get user
async function validateAuth(req: Request): Promise<AuthenticatedUser | null> {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.replace('Bearer ', '');

    const { memoizedImport } = await import("../_shared/resilientLoader.ts");
    const { createClient } = await memoizedImport('@supabase/supabase-js');
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return null;
    }

    return { id: user.id, email: user.email };
  } catch (error) {
    console.error('Auth validation error:', error);
    return null;
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS and health checks
  const healthResponse = handleHealthAndCors(req);
  if (healthResponse) return healthResponse;

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: corsHeaders }
    );
  }
  
  try {
    // Validate authentication - this is a security-critical function
    const user = await validateAuth(req);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: corsHeaders }
      );
    }

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
      ip_address: getClientIP(req),
      user_agent: req.headers.get('User-Agent'),
      referer: req.headers.get('Referer'),
      origin: req.headers.get('Origin')
    };

// Create Supabase client via resilient loader
const { memoizedImport } = await import("../_shared/resilientLoader.ts");
const { createClient } = await memoizedImport('@supabase/supabase-js');
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// Log the security event to the database
const { data: logEntry, error: insertError } = await supabase
  .from('security_audit_log')
  .insert({
    event_type: eventType,
    user_id: user.id,
    details: enhancedDetails,
    ip_address: getClientIP(req),
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
        userId: user.id,
        details: enhancedDetails,
        logId: logEntry.id
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        logId: logEntry.id,
        timestamp: logEntry.created_at
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error: any) {
    console.error("Error in log-security-event function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
};

// Serve the handler directly (no middleware wrapper to avoid circular dependency)
serve(handler);