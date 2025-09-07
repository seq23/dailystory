import { supabase } from "@/integrations/supabase/client";
import { EnhancedSecurityValidator } from "@/utils/securityEnhancedValidation";

interface IncidentLogData {
  childProfileId?: string;
  violationType: string;
  detectedContent: string;
  contextField: string;
}

export const useIncidentLogger = () => {
  const logIncident = async (data: IncidentLogData) => {
    try {
      // Enhanced client-side validation before sending to server
      const inputValidation = EnhancedSecurityValidator.validateUserInput(
        data.detectedContent, 
        'incident_report'
      );
      
      if (!inputValidation.isValid) {
        console.warn('Invalid incident data:', inputValidation.errors);
        return { success: false, error: 'Invalid incident data' };
      }

      // Rate limiting check
      const rateLimitOk = await EnhancedSecurityValidator.checkClientRateLimit(
        'incident_report'
      );
      
      if (!rateLimitOk) {
        return { success: false, error: 'Rate limit exceeded' };
      }

      // Get current user - this will be validated server-side as well
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('No authenticated user for incident logging');
        return { success: false, error: 'Authentication required' };
      }

      // Call the secured edge function (JWT required)
      const { data: result, error } = await supabase.functions.invoke('log-personal-info-incident', {
        body: {
          childProfileId: data.childProfileId,
          violationType: data.violationType,
          detectedContent: data.detectedContent,
          contextField: data.contextField,
          // Server will extract IP and user agent from headers
        }
      });

      if (error) {
        console.error('Failed to log incident:', error);
        // Log the failure as a security event
        await EnhancedSecurityValidator.logSecurityEvent('incident_logging_failure', {
          error: error.message,
          violationType: data.violationType,
          contextField: data.contextField
        });
        return { success: false, error: error.message };
      }

      console.log('Incident logged successfully:', result);
      return { 
        success: true, 
        incidentId: result?.incidentId,
        shouldTriggerEmail: result?.shouldTriggerEmail,
        recentIncidentCount: result?.recentIncidentCount
      };
    } catch (err) {
      console.error('Error logging incident:', err);
      // Log the error as a security event
      await EnhancedSecurityValidator.logSecurityEvent('incident_logging_error', {
        error: err instanceof Error ? err.message : 'Unknown error',
        violationType: data.violationType,
        contextField: data.contextField
      });
      return { success: false, error: 'Failed to log incident' };
    }
  };

  return { logIncident };
};