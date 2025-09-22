import { supabase } from "@/integrations/supabase/client";
import { DebugLogger } from "@/services/DebugLogger";

interface COPPANotificationData {
  parentEmail: string;
  childName: string;
  violations: string[];
  detectedContent: string;
}

export const useCOPPANotification = () => {
  const sendCOPPANotification = async (data: COPPANotificationData) => {
    try {
      const { data: result, error } = await supabase.functions.invoke('send-coppa-notification', {
        body: {
          ...data,
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        DebugLogger.error('auth', 'Failed to send COPPA notification:', error);
        return { success: false, error: error.message };
      }

      DebugLogger.log('network', 'COPPA notification sent successfully', result);
      return { success: true, messageId: result?.messageId };
    } catch (err) {
      DebugLogger.error('auth', 'Error sending COPPA notification:', err);
      return { success: false, error: 'Failed to send notification' };
    }
  };

  return { sendCOPPANotification };
};