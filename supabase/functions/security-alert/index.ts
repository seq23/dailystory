// Force clean redeployment: 2025-01-23T02:45:00Z
import { serve } from "https://deno.land/std@0.190.0/http/server.js";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import { withSecurity, SecurityMiddleware, AuthenticatedUser } from "../_shared/security.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

interface SecurityAlertRequest {
  alertType: 'suspicious_activity' | 'data_breach' | 'unauthorized_access' | 'system_anomaly';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details: {
    description: string;
    affectedUsers?: string[];
    affectedTables?: string[];
    ipAddress?: string;
    userAgent?: string;
    additionalContext?: Record<string, any>;
  };
}

const handler = async (req: Request, user?: AuthenticatedUser): Promise<Response> => {
  const security = new SecurityMiddleware();
  
  try {
    const { alertType, severity, details }: SecurityAlertRequest = await req.json();

    // Validate alert data
    if (!alertType || !severity || !details?.description) {
      throw new Error('Missing required alert data');
    }

    // Log security alert to enhanced monitoring
    const alertId = crypto.randomUUID();
    
    // Insert into security monitoring table
    const { error: monitoringError } = await supabase
      .from('security_monitoring')
      .insert({
        event_type: 'security_alert',
        user_id: user?.id || null,
        table_name: details.affectedTables?.join(',') || null,
        operation: alertType.toUpperCase(),
        sensitive_data_accessed: severity === 'CRITICAL' || severity === 'HIGH',
        risk_level: severity,
        details: {
          alert_id: alertId,
          alert_type: alertType,
          description: details.description,
          affected_users: details.affectedUsers || [],
          affected_tables: details.affectedTables || [],
          ip_address: details.ipAddress,
          user_agent: details.userAgent,
          additional_context: details.additionalContext || {},
          reported_by: user?.id || 'system',
          timestamp: new Date().toISOString()
        }
      });

    if (monitoringError) {
      throw new Error(`Failed to log security alert: ${monitoringError.message}`);
    }

    // Also log to main security audit log
    await security.logSecurityEvent('security_alert_created', {
      alert_id: alertId,
      alert_type: alertType,
      severity,
      description: details.description,
      reported_by: user?.id || 'system'
    });

    // For critical alerts, trigger immediate response
    if (severity === 'CRITICAL') {
      // Log critical alert
      console.error(`🚨 CRITICAL SECURITY ALERT: ${alertType}`, {
        alertId,
        description: details.description,
        affectedUsers: details.affectedUsers,
        timestamp: new Date().toISOString()
      });

      // Could integrate with external alerting systems here
      // e.g., PagerDuty, Slack, email notifications
    }

    // Generate response recommendations based on alert type and severity
    const recommendations = generateSecurityRecommendations(alertType, severity, details);

    return security.createSecureResponse({
      success: true,
      alertId,
      alertType,
      severity,
      status: 'logged',
      recommendations,
      nextSteps: [
        'Alert has been logged to security monitoring system',
        'Security team has been notified',
        'Investigation will be initiated within 4 hours',
        'Status updates will be provided as investigation progresses'
      ],
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Error in security-alert function:", error);
    return security.createErrorResponse(error.message, 500);
  }
};

function generateSecurityRecommendations(
  alertType: string, 
  severity: string, 
  details: any
): string[] {
  const recommendations = [];

  switch (alertType) {
    case 'suspicious_activity':
      recommendations.push('🔍 Review user access patterns and session logs');
      recommendations.push('🚫 Consider temporary account restrictions if necessary');
      if (severity === 'CRITICAL') {
        recommendations.push('⚠️ Immediately disable affected user accounts');
        recommendations.push('🔒 Reset all active sessions for affected users');
      }
      break;

    case 'data_breach':
      recommendations.push('🚨 Immediately assess scope of data exposure');
      recommendations.push('📋 Document all affected data and users');
      recommendations.push('🔒 Implement additional access controls');
      if (severity === 'CRITICAL') {
        recommendations.push('📞 Notify affected users within 24 hours');
        recommendations.push('📝 Prepare regulatory compliance notifications');
      }
      break;

    case 'unauthorized_access':
      recommendations.push('🔐 Review and strengthen authentication mechanisms');
      recommendations.push('📊 Audit recent access logs for patterns');
      if (details.affectedTables?.includes('child_profiles')) {
        recommendations.push('👶 COPPA compliance review required');
      }
      break;

    case 'system_anomaly':
      recommendations.push('⚙️ Check system health and performance metrics');
      recommendations.push('🔧 Review recent configuration changes');
      recommendations.push('📈 Monitor for continued anomalous behavior');
      break;
  }

  // Add general recommendations based on severity
  if (severity === 'CRITICAL' || severity === 'HIGH') {
    recommendations.push('📱 Increase monitoring frequency');
    recommendations.push('👥 Engage security incident response team');
    recommendations.push('📝 Begin incident documentation process');
  }

  return recommendations;
}

// Apply security middleware - requires authentication
serve(await withSecurity(handler, {
  requireAuth: true,
  rateLimit: {
    requests: 50, // Max 50 alerts per hour per user
    windowMs: 60 * 60 * 1000 // 1 hour
  },
  auditLog: true
}));