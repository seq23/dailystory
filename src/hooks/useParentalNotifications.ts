import { supabase } from "@/integrations/supabase/client";
import { DebugLogger } from "@/services/DebugLogger";

interface ParentalNotificationData {
  parentEmail: string;
  childName: string;
  incidentCount: number;
  recentViolations: Array<{
    timestamp: string;
    violationType: string;
    content: string;
  }>;
  reportType: 'daily' | 'weekly' | 'monthly';
}

export const useParentalNotifications = () => {
  const sendParentalNotification = async (data: ParentalNotificationData) => {
    try {
      const { data: result, error } = await supabase.functions.invoke('send-parental-notification', {
        body: data
      });

      if (error) {
        DebugLogger.error('auth', 'Failed to send parental notification:', error);
        return { success: false, error: error.message };
      }

      DebugLogger.log('ui', 'Parental notification sent successfully', result);
      return { success: true, messageId: result?.messageId };
    } catch (err) {
      DebugLogger.error('auth', 'Error sending parental notification:', err);
      return { success: false, error: 'Failed to send notification' };
    }
  };

  return { sendParentalNotification };
};