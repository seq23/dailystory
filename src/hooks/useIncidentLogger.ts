import { supabase } from "@/integrations/supabase/client";

interface IncidentLogData {
  childProfileId?: string;
  violationType: string;
  detectedContent: string;
  contextField: string;
}

export const useIncidentLogger = () => {
  const logIncident = async (data: IncidentLogData) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('No authenticated user for incident logging');
        return { success: false, error: 'No authenticated user' };
      }

      // Get user agent and try to extract IP from headers (limited in browser)
      const userAgent = navigator.userAgent;
      
      const { data: result, error } = await supabase.functions.invoke('log-personal-info-incident', {
        body: {
          userId: user.id,
          childProfileId: data.childProfileId,
          violationType: data.violationType,
          detectedContent: data.detectedContent,
          contextField: data.contextField,
          userAgent,
          // Note: IP address will be extracted server-side from request headers
        }
      });

      if (error) {
        console.error('Failed to log incident:', error);
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
      return { success: false, error: 'Failed to log incident' };
    }
  };

  return { logIncident };
};