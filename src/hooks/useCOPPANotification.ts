import { supabase } from "@/integrations/supabase/client";

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
        console.error('Failed to send COPPA notification:', error);
        return { success: false, error: error.message };
      }

      console.log('COPPA notification sent successfully:', result);
      return { success: true, messageId: result?.messageId };
    } catch (err) {
      console.error('Error sending COPPA notification:', err);
      return { success: false, error: 'Failed to send notification' };
    }
  };

  return { sendCOPPANotification };
};