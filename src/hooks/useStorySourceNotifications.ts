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
          
        } else if (currentSource === 'emergency') {
          // Show red emergency toast for nuclear fallback (critical system failure)
          toast({
            title: "🚨 System Recovery Mode",
            description: "Our storytelling system is experiencing issues. Emergency content is being used while we restore full service.",
            variant: "destructive", 
            duration: 10000, // 10 seconds for critical alerts
          });
          
          // Set flag for emergency status indicator
          try {
            sessionStorage.setItem('story_emergency_mode', 'true');
          } catch {}
          
        } else if (currentSource === 'ai' && (previousSource === 'fallback' || previousSource === 'emergency')) {
          // AI recovered - show green success toast (one-time only per session)
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
          
          // Clear backup and emergency mode flags
          try {
            sessionStorage.removeItem('story_backup_mode');
            sessionStorage.removeItem('story_emergency_mode');
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
    
    // EMERGENCY FIX: Reduced from 2s to 5s to prevent resource exhaustion
    const interval = setInterval(() => {
      // Only check if page is visible
      if (document.visibilityState === 'visible') {
        checkSourceChange();
      }
    }, 5000);
    
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
        sessionStorage.removeItem('story_emergency_mode');
      } catch {}
    };
  }, []);
};