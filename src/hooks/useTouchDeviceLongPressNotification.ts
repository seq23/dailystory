import { useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { DebugLogger } from '@/services/DebugLogger';

/**
 * Hook to show long-press instruction notification for touch devices
 * Displays once per session to educate users about 2-second hold requirement
 */
export const useTouchDeviceLongPressNotification = () => {
  const { toast } = useToast();
  const { isMobileOrTablet } = useIsMobile();
  
  const STORAGE_KEY = 'touch_longpress_instruction_shown_v1';

  const showLongPressInstruction = useCallback(() => {
    if (!isMobileOrTablet) return;
    
    try {
      // Check if already shown this session
      const alreadyShown = sessionStorage.getItem(STORAGE_KEY);
      if (alreadyShown) return;

      // Mark as shown
      sessionStorage.setItem(STORAGE_KEY, 'true');

      // Show the instruction toast
      toast({
        title: "📱 Touch-Optimized Controls",
        description: "Buttons respond to deliberate taps (quick accidental taps are ignored). Long-press words for pronunciation. Designed for comfortable reading.",
        variant: "instruction", 
        duration: 8000, // Auto-dismiss after 8 seconds
        className: "instruction-toast touch-longpress-notification z-[200]"
      });
      
      DebugLogger.log('ui', 'Touch device long-press instruction shown');
    } catch (error) {
      DebugLogger.warn('ui', 'Failed to show touch device instruction:', error);
    }
  }, [isMobileOrTablet, toast]);

  const clearInstructionFlag = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      DebugLogger.warn('ui', 'Failed to clear instruction flag:', error);
    }
  }, []);

  return {
    showLongPressInstruction,
    clearInstructionFlag,
    shouldShow: isMobileOrTablet && !sessionStorage.getItem(STORAGE_KEY)
  };
};