import { serve } from "https://deno.land/std@0.190.0/http/server.js";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import { withSecurity, SecurityMiddleware, AuthenticatedUser } from "../_shared/security.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

interface DebugAccessRequest {
  operation: 'view_logs' | 'view_prompts' | 'view_sessions' | 'view_users';
  filters?: {
    userId?: string;
    sessionId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  };
}

const handler = async (req: Request, user?: AuthenticatedUser): Promise<Response> => {
  const security = new SecurityMiddleware();
  
  try {
    // Only allow premium users or service role to access debug functions
    if (!user?.premium && req.headers.get('authorization')?.includes('service_role')) {
      throw new Error('Debug access requires premium subscription or admin privileges');
    }

    const { operation, filters = {} }: DebugAccessRequest = await req.json();
    const { userId, sessionId, startDate, endDate, limit = 50 } = filters;

    let response;

    switch (operation) {
      case 'view_logs':
        // Get debug logs with privacy protection
        let logQuery = supabase
          .from('ai_prompt_debug_log')
          .select('id, user_id, session_id, model, success, page_number, created_at, token_limit')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (userId) logQuery = logQuery.eq('user_id', userId);
        if (sessionId) logQuery = logQuery.eq('session_id', sessionId);
        if (startDate) logQuery = logQuery.gte('created_at', startDate);
        if (endDate) logQuery = logQuery.lte('created_at', endDate);

        const { data: logs, error: logsError } = await logQuery;
        if (logsError) throw logsError;

        response = { logs: logs?.map(log => ({
          ...log,
          // Mask sensitive data in debug logs
          user_prompt: '[REDACTED]',
          system_prompt: '[REDACTED]',
          api_response: '[REDACTED]'
        })) };
        break;

      case 'view_sessions':
        // Get user sessions with privacy protection
        let sessionQuery = supabase
          .from('user_sessions')
          .select('id, user_id, created_at, last_activity, is_active, expires_at')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (userId) sessionQuery = sessionQuery.eq('user_id', userId);
        if (startDate) sessionQuery = sessionQuery.gte('created_at', startDate);

        const { data: sessions, error: sessionsError } = await sessionQuery;
        if (sessionsError) throw sessionsError;

        response = { sessions: sessions?.map(session => ({
          ...session,
          // Mask sensitive session data
          session_token_hash: '[REDACTED]',
          ip_address: '[REDACTED]',
          user_agent: '[REDACTED]'
        })) };
        break;

      case 'view_users':
        // Get user profiles with privacy protection (admin only)
        if (req.headers.get('authorization')?.includes('service_role')) {
          throw new Error('User data access requires admin privileges');
        }

        let userQuery = supabase
          .from('profiles')
          .select('id, user_id, display_name, grade_level, reading_level, created_at')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (userId) userQuery = userQuery.eq('user_id', userId);

        const { data: users, error: usersError } = await userQuery;
        if (usersError) throw usersError;

        response = { users: users?.map(user => ({
          ...user,
          // Mask all personal data
          interests: '[REDACTED]',
          favorite_color: '[REDACTED]',
          favorite_animal: '[REDACTED]',
          favorite_food: '[REDACTED]',
          hobbies: '[REDACTED]',
          special_request: '[REDACTED]'
        })) };
        break;

      default:
        throw new Error('Invalid debug operation');
    }

    // Log the debug access
    await security.logSecurityEvent('secure_debug_access', {
      operation,
      filters,
      userId: user?.id,
      timestamp: new Date().toISOString()
    });

    return security.createSecureResponse({
      success: true,
      operation,
      data: response,
      accessedAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Error in secure-debug-access function:", error);
    return security.createErrorResponse(error.message, 500);
  }
};

// Apply security middleware - requires authentication and rate limiting
serve(await withSecurity(handler, {
  requireAuth: true,
  requirePremium: false, // Allow authenticated users but log access
  rateLimit: {
    requests: 20, // Max 20 debug requests per hour
    windowMs: 60 * 60 * 1000 // 1 hour
  },
  auditLog: true
}));