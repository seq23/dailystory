import { serve } from "https://deno.land/std@0.190.0/http/server.js";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import { withSecurity, SecurityMiddleware, AuthenticatedUser } from "../_shared/security.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

interface SecurityDashboardRequest {
  timeRange?: '1h' | '24h' | '7d' | '30d';
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

const handler = async (req: Request, user?: AuthenticatedUser): Promise<Response> => {
  const security = new SecurityMiddleware();
  
  try {
    const { timeRange = '24h', riskLevel }: SecurityDashboardRequest = 
      req.method === 'POST' ? await req.json() : {};

    // Get security dashboard data
    const { data: dashboardData, error: dashboardError } = await supabase
      .rpc('get_security_dashboard');

    if (dashboardError) {
      throw new Error(`Failed to get security dashboard: ${dashboardError.message}`);
    }

    // Get detailed security events based on filters
    let query = supabase
      .from('security_monitoring')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    // Apply time range filter
    const timeRanges = {
      '1h': '1 hour',
      '24h': '24 hours', 
      '7d': '7 days',
      '30d': '30 days'
    };
    
    query = query.gte('created_at', `now() - interval '${timeRanges[timeRange]}'`);

    // Apply risk level filter
    if (riskLevel) {
      query = query.eq('risk_level', riskLevel);
    }

    const { data: securityEvents, error: eventsError } = await query;

    if (eventsError) {
      throw new Error(`Failed to get security events: ${eventsError.message}`);
    }

    // Get recent personal info incidents
    const { data: incidents, error: incidentsError } = await supabase
      .from('personal_info_incidents')
      .select('id, violation_type, created_at, user_id')
      .gte('created_at', `now() - interval '${timeRanges[timeRange]}'`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (incidentsError) {
      throw new Error(`Failed to get incidents: ${incidentsError.message}`);
    }

    // Calculate security metrics
    const metrics = {
      totalEvents: securityEvents?.length || 0,
      criticalEvents: securityEvents?.filter(e => e.risk_level === 'CRITICAL').length || 0,
      highRiskEvents: securityEvents?.filter(e => e.risk_level === 'HIGH').length || 0,
      incidentsCount: incidents?.length || 0,
      uniqueUsersAffected: new Set(securityEvents?.map(e => e.user_id).filter(Boolean)).size,
      topEventTypes: securityEvents?.reduce((acc: Record<string, number>, event) => {
        acc[event.event_type] = (acc[event.event_type] || 0) + 1;
        return acc;
      }, {}) || {},
    };

    // Generate security recommendations
    const recommendations = [];
    if (metrics.criticalEvents > 0) {
      recommendations.push("🚨 Critical security events detected - immediate investigation required");
    }
    if (metrics.highRiskEvents > 10) {
      recommendations.push("⚠️ High number of high-risk events - review security policies");
    }
    if (metrics.incidentsCount > 20) {
      recommendations.push("📋 Elevated personal info incidents - review input validation");
    }
    if (metrics.uniqueUsersAffected > metrics.totalEvents * 0.1) {
      recommendations.push("👥 Multiple users affected - possible systematic issue");
    }

    const response = {
      success: true,
      data: {
        dashboard: dashboardData,
        events: securityEvents,
        incidents: incidents,
        metrics,
        recommendations,
        filters: { timeRange, riskLevel },
        generatedAt: new Date().toISOString()
      }
    };

    return security.createSecureResponse(response);

  } catch (error: any) {
    console.error("Error in security-dashboard function:", error);
    return security.createErrorResponse(error.message, 500);
  }
};

// Apply security middleware - requires authentication and admin privileges
serve(await withSecurity(handler, {
  requireAuth: true,
  rateLimit: {
    requests: 10, // Max 10 dashboard requests per hour
    windowMs: 60 * 60 * 1000 // 1 hour
  },
  auditLog: true
}));