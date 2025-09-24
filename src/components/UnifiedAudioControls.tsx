import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Square, RotateCcw } from 'lucide-react';
import { charlotteVoiceService } from '@/services/CharlotteVoiceService';
import { useToast } from '@/hooks/use-toast';
import { DebugLogger } from '@/services/DebugLogger';
import { useIsMobile } from '@/hooks/use-mobile';
import { performanceManager } from '@/services/PerformanceManager';

interface UnifiedAudioControlsProps {
  text: string;
  contentHash?: string;
  onPlayingChange?: (playing: boolean) => void;
  onWordHighlight?: (wordIndex: number) => void;
  difficulty?: string;
  size?: 'default' | 'lg';
  variant?: 'default' | 'outline' | 'destructive';
}

/**
 * Unified audio controls combining both AudioControls and SynchronizedAudioControls
 * Handles both basic playback and synchronized word highlighting
 */
export const UnifiedAudioControls: React.FC<UnifiedAudioControlsProps> = ({
  text,
  contentHash,
  onPlayingChange,
  onWordHighlight,
  difficulty = 'beginner',
  size = 'default',
  variant = 'default'
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();
  const { isMobileOrTablet } = useIsMobile();

  // Event-driven state updates
  useEffect(() => {
    const handleAudioStateChange = (event: CustomEvent) => {
      const isPlayingNow = event.detail.isPlaying;
      setIsPlaying(isPlayingNow);
      onPlayingChange?.(isPlayingNow);
      
      // Clear loading state when audio starts playing
      if (isPlayingNow) {
        setIsLoading(false);
        setError(null);
      }
    };

    window.addEventListener('audio:statechange', handleAudioStateChange as EventListener);
    return () => {
      window.removeEventListener('audio:statechange', handleAudioStateChange as EventListener);
    };
  }, [onPlayingChange]);

  const onPlay = async () => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    setError(null);

    // Lock content hash during audio preparation
    const uiHash = window.__pageContentHash || contentHash;
    if (typeof window !== 'undefined') {
      window.__audioHashLocked = uiHash;
    }

    try {
      // Enhanced mobile delay for better content synchronization
      if (isMobileOrTablet) {
        await new Promise((r) => performanceManager.setTimeout(() => r(undefined), 800, 'mobile audio sync'));
      }

      // Level-based highlighting: Only enable for beginner/easy (levels 0-1)
      const difficultyStr = String(difficulty).toLowerCase();
      const shouldHighlight = difficultyStr === 'beginner' || difficultyStr === 'easy' || difficultyStr === '0' || difficultyStr === '1';
      const highlightCallback = shouldHighlight ? onWordHighlight : undefined;
      
      DebugLogger.log('audio', `Audio highlighting ${shouldHighlight ? 'ENABLED' : 'DISABLED'} for difficulty: "${difficulty}"`);
      
      await charlotteVoiceService.charlotteReadStory(text, highlightCallback);
      
      setRetryCount(0);
      setIsLoading(false);
      setIsPlaying(true);
      onPlayingChange?.(true);
      
      // Emit state change event
      window.dispatchEvent(new CustomEvent('audio:statechange', { 
        detail: { isPlaying: true } 
      }));
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Audio playback failed';
      DebugLogger.error('audio', 'UnifiedAudioControls: Playback failed', { error: errorMessage });
      
      setError(errorMessage);
      setIsLoading(false);
      setIsPlaying(false);
      
      // Clear any word highlighting on error
      if (onWordHighlight) {
        onWordHighlight(-1);
      }
      
      onPlayingChange?.(false);
      
      window.dispatchEvent(new CustomEvent('audio:statechange', { 
        detail: { isPlaying: false } 
      }));
      
      toast({
        title: "Audio Error",
        description: "Could not play audio. Trying device voice...",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      // Unlock hash after audio starts
      if (typeof window !== 'undefined') {
        delete window.__audioHashLocked;
      }
    }
  };

  const onRetry = async () => {
    if (retryCount >= 3) return; // Max 3 retries
    
    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);
    
    DebugLogger.log('audio', `UnifiedAudioControls: Retry attempt ${newRetryCount}`);
    
    // Exponential backoff delay
    const delay = Math.min(5000, Math.pow(2, newRetryCount - 1) * 1000);
    if (delay > 1000) {
      toast({
        title: "Retrying...",
        description: `Waiting ${delay / 1000} seconds before retry`,
        duration: delay,
      });
      
      await new Promise(resolve => performanceManager.setTimeout(() => resolve(undefined), delay, 'audio retry backoff'));
    }
    
    await onPlay();
  };

  const onStop = () => {
    DebugLogger.log('audio', 'UnifiedAudioControls: Stopping playback');
    
    charlotteVoiceService.stop();
    
    // Also stop any other audio that might be playing
    try {
      const audioSyncService = window.__audioSyncService;
      if (audioSyncService) {
        audioSyncService.stopAudio();
      }
    } catch {}
    
    // Clear any word highlighting
    if (onWordHighlight) {
      onWordHighlight(-1);
    }
    
    // Clear loading and retry states
    setIsLoading(false);
    setError(null);
    setRetryCount(0);
    
    setIsPlaying(false);
    onPlayingChange?.(false);
    
    // Emit state change event
    window.dispatchEvent(new CustomEvent('audio:statechange', { 
      detail: { isPlaying: false } 
    }));
  };

  // Loading state
  if (isLoading) {
    return (
      <Button size={size} variant="outline" disabled aria-label="Loading audio">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
        Loading Audio...
      </Button>
    );
  }

  // Error state with retry
  if (error && !isPlaying) {
    return (
      <div className="flex items-center gap-2">
        <Button 
          size={size} 
          variant="outline" 
          onClick={onRetry} 
          disabled={retryCount >= 3} 
          aria-label="Retry audio"
          className="gap-2 text-orange-600 border-orange-300 hover:bg-orange-50"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again {retryCount > 0 && `(${retryCount}/3)`}
        </Button>
        <span className="text-sm text-muted-foreground">
          {retryCount >= 3 ? 'Using device voice' : 'Using device voice'}
        </span>
      </div>
    );
  }

  // Playing state
  if (isPlaying) {
    return (
      <Button 
        size={size} 
        variant="destructive" 
        onClick={onStop} 
        aria-label="Stop narration"
        className="gap-2"
      >
        <Square className="w-4 h-4" />
        Stop
      </Button>
    );
  }

  // Default play state
  return (
    <Button 
      size={size} 
      variant={variant} 
      onClick={onPlay} 
      aria-label="Read to me"
      className="gap-2"
    >
      <Play className="w-4 h-4" />
      Read to Me
    </Button>
  );
};

export { UnifiedAudioControls as SynchronizedAudioControls } from './UnifiedAudioControls';