import { useState, useEffect } from 'react';
import { AlertTriangle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * Persistent status indicator that appears after initial toast dismissal
 * Shows current story generation mode with clickable re-information
 */
export const StoryStatusIndicator = () => {
  const [currentMode, setCurrentMode] = useState<'normal' | 'backup' | 'emergency'>('normal');
  const [isVisible, setIsVisible] = useState(false);
  const { isMobileOrTablet } = useIsMobile();

  useEffect(() => {
    const checkStatus = () => {
      try {
        const source = (globalThis as any).__LAST_STORY_SOURCE__;
        const isBackupMode = sessionStorage.getItem('story_backup_mode') === 'true';
        const isEmergencyMode = sessionStorage.getItem('story_emergency_mode') === 'true';
        
        if (source === 'emergency' || isEmergencyMode) {
          setCurrentMode('emergency');
          setIsVisible(true);
        } else if (source === 'fallback' || isBackupMode) {
          setCurrentMode('backup');
          setIsVisible(true);
        } else {
          setCurrentMode('normal');
          setIsVisible(false);
        }
      } catch (error) {
        console.error('Status indicator error:', error);
      }
    };

    // Check immediately
    checkStatus();
    
    // Monitor changes
    const interval = setInterval(checkStatus, 1000);
    
    // Listen to story events
    const handleStoryEvent = () => {
      setTimeout(checkStatus, 100);
    };
    
    window.addEventListener('story:generation:complete', handleStoryEvent);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('story:generation:complete', handleStoryEvent);
    };
  }, []);

  const handleClick = () => {
    if (currentMode === 'backup') {
      toast({
        title: "⚠️ Using Pre-Written Content",
        description: "AI is taking a break. You're reading quality backup stories! Parents: This is normal during high demand.",
        variant: "warning",
        duration: 7000,
      });
    } else if (currentMode === 'emergency') {
      toast({
        title: "🚨 Emergency Content Mode",
        description: "System experiencing critical issues. Using emergency content. Parents: Please refresh the page.",
        variant: "destructive",
        duration: 10000,
      });
    }
  };

  if (!isVisible || currentMode === 'normal') {
    return null;
  }

  return (
    <div className={cn(
      "animate-in slide-in-from-top-2 duration-300",
      isMobileOrTablet 
        ? "absolute top-[234px] left-2 z-80"  // Mobile/tablet: upper left of image card, offset 234px
        : "fixed top-16 right-4 z-50"   // Desktop: unchanged (right side)
    )}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        className={cn(
          "flex items-center gap-2 shadow-lg transition-colors",
          currentMode === 'backup' && "border-yellow-500 bg-yellow-50 text-yellow-800 hover:bg-yellow-100 dark:border-yellow-400 dark:bg-yellow-900/10 dark:text-yellow-400",
          currentMode === 'emergency' && "border-red-500 bg-red-50 text-red-800 hover:bg-red-100 dark:border-red-400 dark:bg-red-900/10 dark:text-red-400"
        )}
      >
        {currentMode === 'backup' && (
          <>
            <AlertTriangle className="w-3 h-3" />
            <span className="text-xs font-medium">Backup Mode</span>
          </>
        )}
        {currentMode === 'emergency' && (
          <>
            <Zap className="w-3 h-3" />
            <span className="text-xs font-medium">Emergency</span>
          </>
        )}
      </Button>
    </div>
  );
};