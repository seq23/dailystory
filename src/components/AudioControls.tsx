import React, { useEffect, useRef, useState } from 'react';
import { DebugLogger } from '@/services/DebugLogger';
import { performanceManager } from '@/services/PerformanceManager';
import { Button } from '@/components/ui/button';
import { Play, Square } from 'lucide-react';
import { SimpleAudioEngine } from '@/services/SimpleAudioEngine';
import { useIsMobile } from '@/hooks/use-mobile';

interface AudioControlsProps {
  text: string;
  contentHash?: string;
  onPlayingChange?: (playing: boolean) => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({ text, contentHash, onPlayingChange }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { isMobileOrTablet } = useIsMobile();
  const lastTapRef = useRef<number>(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Event-driven state updates instead of polling
  useEffect(() => {
    const handleAudioStateChange = (event: CustomEvent) => {
      const isPlayingNow = event.detail.isPlaying;
      setIsPlaying(isPlayingNow);
      if (onPlayingChange) onPlayingChange(isPlayingNow);
    };

    window.addEventListener('audio:statechange', handleAudioStateChange as EventListener);
    return () => {
      window.removeEventListener('audio:statechange', handleAudioStateChange as EventListener);
    };
  }, [onPlayingChange]);

  const onPlay = async () => {
    const now = Date.now();
    if (now - (lastTapRef.current || 0) < 350) return; // debounce rapid taps
    lastTapRef.current = now;

    // Clear any previous errors
    setError(null);
    setIsLoading(true);

    // Lock content hash during audio preparation
    const uiHash = (typeof window !== 'undefined' && (window as any).__pageContentHash) || contentHash;
    if (typeof window !== 'undefined') {
      (window as any).__audioHashLocked = uiHash;
    }

    const engine = SimpleAudioEngine.getInstance();
    try {
      // Enhanced mobile delay for better content synchronization
      if (isMobileOrTablet) {
        await new Promise((r) => performanceManager.setTimeout(() => r(undefined), 800, 'mobile audio sync')); // Increased to 800ms for better mobile sync
      }
      
      await engine.playText({ 
        text, 
        contentHash: uiHash,
        voiceId: 'XB0fDUnXU5powFXDhCwa' // Charlotte
      });
      
      // Reset retry count on success
      setRetryCount(0);
      setIsLoading(false);
      setIsPlaying(true);
      onPlayingChange?.(true);
      
      // Emit state change event for other components
      window.dispatchEvent(new CustomEvent('audio:statechange', { 
        detail: { isPlaying: true } 
      }));
      
    } catch (e) {
      DebugLogger.error('audio', 'Play failed', e);
      setIsLoading(false);
      setIsPlaying(false);
      setError(e instanceof Error ? e.message : 'Audio playback failed');
      onPlayingChange?.(false);
      window.dispatchEvent(new CustomEvent('audio:statechange', { 
        detail: { isPlaying: false } 
      }));
    } finally {
      // Unlock hash after audio starts
      if (typeof window !== 'undefined') {
        delete (window as any).__audioHashLocked;
      }
    }
  };

  const onRetry = async () => {
    if (retryCount >= 3) return; // Max 3 retries
    
    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);
    
    // Exponential backoff: 1s, 2s, 4s
    const delay = Math.pow(2, newRetryCount - 1) * 1000;
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    
    retryTimeoutRef.current = performanceManager.setTimeout(() => {
      onPlay();
    }, delay, 'audio retry backoff');
  };
  const onStop = () => {
    if (DebugLogger.isDebugEnabled()) {
      DebugLogger.log('audio', 'AudioControls: Stop button pressed');
    }
    
    const engine = SimpleAudioEngine.getInstance();
    engine.stop();
    
    // Also stop any ElevenLabs audio that might be playing
    try {
      const audioSyncService = (window as any).__audioSyncService;
      if (audioSyncService) {
        audioSyncService.stopAudio();
        if (DebugLogger.isDebugEnabled()) {
          DebugLogger.log('audio', 'Also stopped AudioSyncService');
        }
      }
    } catch {}
    
    // Clear loading and retry states
    setIsLoading(false);
    setError(null);
    setRetryCount(0);
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    
    // Immediate state update
    setIsPlaying(false);
    onPlayingChange?.(false);
    
    // Emit state change event for other components
    window.dispatchEvent(new CustomEvent('audio:statechange', { 
      detail: { isPlaying: false } 
    }));
  };

  return (
    <div className="flex items-center gap-3">
      {isLoading ? (
        <Button size="lg" variant="outline" disabled aria-label="Loading audio">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-2"></div>
          Loading Audio...
        </Button>
      ) : error && !isPlaying ? (
        <div className="flex items-center gap-2">
          <Button size="lg" variant="outline" onClick={onRetry} disabled={retryCount >= 3} aria-label="Retry audio">
            <Play className="w-5 h-5 mr-2" />
            Try Again {retryCount > 0 && `(${retryCount}/3)`}
          </Button>
          {retryCount >= 3 && (
            <span className="text-sm text-muted-foreground">Max retries reached</span>
          )}
        </div>
      ) : !isPlaying ? (
        <Button size="lg" variant="default" onClick={onPlay} aria-label="Read to me">
          <Play className="w-5 h-5 mr-2" />
          Read to Me
        </Button>
      ) : (
        <Button size="lg" variant="destructive" onClick={onStop} aria-label="Stop narration">
          <Square className="w-5 h-5 mr-2" />
          Stop
        </Button>
      )}
    </div>
  );
};

export default AudioControls;
