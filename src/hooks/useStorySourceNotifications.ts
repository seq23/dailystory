import { useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

/**
 * Monitors story source changes and provides persistent yellow/green toast notifications
 * - Yellow warning: Appears on every page when using backup stories (7 seconds)
 * - Green recovery: Shows once only when AI recovers (4 seconds) 
 * - Status indicator integration: Sets flags for persistent UI indicators
 */
export const useStorySourceNotifications = () => {
  const lastSourceRef = useRef<string | null>(null);
  const hasShownRecoveryRef = useRef(false);

  useEffect(() => {
    const checkSourceChange = () => {
      try {
        const currentSource = (globalThis as any).__LAST_STORY_SOURCE__;
        const previousSource = lastSourceRef.current;
        
        // Only proceed if source has actually changed
        if (currentSource === previousSource) return;
        
        console.log('📡 Story source changed:', { from: previousSource, to: currentSource });
        
        // Update stored source
        lastSourceRef.current = currentSource;
        
        if (currentSource === 'fallback') {
          // Show yellow warning toast for backup mode (persistent on every page)
          toast({
            title: "⚠️ Using Pre-Written Content",
            description: "AI is taking a break. You're reading quality backup stories! Parents: This is normal during high demand.",
            variant: "warning",
            duration: 7000, // 7 seconds
          });
          
          // Set flag for persistent status indicator
          try {
            sessionStorage.setItem('story_backup_mode', 'true');
          } catch {}
          
        } else if (currentSource === 'ai' && previousSource === 'fallback') {
          // AI recovered - show green success toast (one-time only)
          const recoveryKey = 'ai_recovery_shown_' + Date.now();
          const hasShownRecovery = sessionStorage.getItem('ai_recovery_shown');
          
          if (!hasShownRecovery && !hasShownRecoveryRef.current) {
            toast({
              title: "✅ AI Stories Restored",
              description: "AI generation is back online! Enjoying fresh new stories.",
              variant: "default",
              duration: 4000, // 4 seconds
              className: "border-green-500 bg-green-50 text-green-800 dark:border-green-400 dark:bg-green-900/10 dark:text-green-400",
            });
            
            // Prevent duplicate green notifications this session
            hasShownRecoveryRef.current = true;
            try {
              sessionStorage.setItem('ai_recovery_shown', 'true');
            } catch {}
          }
          
          // Clear backup mode flag
          try {
            sessionStorage.removeItem('story_backup_mode');
          } catch {}
        }
      } catch (error) {
        console.error('Story source notification error:', error);
      }
    };

    // Check immediately
    checkSourceChange();
    
    // Monitor for changes on page navigation and story events
    const handleStoryEvent = () => {
      setTimeout(checkSourceChange, 100); // Small delay to ensure source is updated
    };
    
    // Listen to story generation events
    window.addEventListener('story:generation:complete', handleStoryEvent);
    
    // Listen to page navigation events
    const handleNavigation = () => {
      setTimeout(checkSourceChange, 200);
    };
    
    // Monitor page visibility changes (user switching tabs/returning)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(checkSourceChange, 100);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('popstate', handleNavigation);
    
    // Periodic check for source changes (every 2 seconds)
    const interval = setInterval(checkSourceChange, 2000);
    
    return () => {
      window.removeEventListener('story:generation:complete', handleStoryEvent);
      window.removeEventListener('popstate', handleNavigation);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, []);

  // Clear recovery flag when component unmounts (session ends)
  useEffect(() => {
    return () => {
      try {
        sessionStorage.removeItem('ai_recovery_shown');
        sessionStorage.removeItem('story_backup_mode');
      } catch {}
    };
  }, []);
};