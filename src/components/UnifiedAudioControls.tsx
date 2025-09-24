import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Square, RotateCcw } from 'lucide-react';
import { charlotteVoiceService } from '@/services/CharlotteVoiceService';
import { useToast } from '@/hooks/use-toast';
import { DebugLogger } from '@/services/DebugLogger';
import { useIsMobile } from '@/hooks/use-mobile';
import { performanceManager } from '@/services/PerformanceManager';
import { useTranslation } from 'react-i18next';
import type { UserInfo } from '@/types';

interface UnifiedAudioControlsProps {
  text: string;
  contentHash?: string;
  userInfo?: UserInfo;
  isEnabled?: boolean;
  isPremium?: boolean;
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
  userInfo,
  isEnabled = true,
  isPremium = false,
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
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [words, setWords] = useState<string[]>([]);
  const [audioSpeed, setAudioSpeed] = useState(
    userInfo?.nativeLanguage === 'en' ? 1.0 : 0.8
  );
  
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isMobileOrTablet } = useIsMobile();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Split text into words for highlighting
  useEffect(() => {
    const textWords = text.split(/(\s+)/).filter(word => word.trim().length > 0);
    setWords(textWords);
  }, [text]);

  // Reset hasPlayedAudio when text changes (new page) - for free users only
  useEffect(() => {
    if (!isPremium) {
      setHasPlayedAudio(false);
    }
    setIsPlaying(false);
    setCurrentWordIndex(-1);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [text, isPremium]);

  // Mobile audio initialization
  const initializeMobileAudio = async () => {
    if (audioInitialized || !isMobileOrTablet) return;
    
    try {
      const audio = new Audio();
      audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMeBS113+TQeCkELI7L7tmNQAgMW7Dn7adTEw1GnN/y';
      await audio.play().catch(() => {});
      audio.pause();
      setAudioInitialized(true);
    } catch (error) {
      DebugLogger.log('audio', 'Mobile audio init failed', error);
      setAudioInitialized(true);
    }
  };

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

  const highlightWords = (interval: number) => {
    let index = 0;
    
    const highlightNext = () => {
      if (index < words.length && isPlaying) {
        setCurrentWordIndex(index);
        onWordHighlight?.(index);
        index++;
        
        // Calculate dynamic interval based on word complexity
        const word = words[index - 1] || '';
        const wordInterval = interval * (word.length > 6 ? 1.2 : 1.0);
        const punctuationPause = /[.!?]$/.test(word) ? 200 : 0;
        
        timeoutRef.current = setTimeout(highlightNext, wordInterval + punctuationPause);
      } else {
        setCurrentWordIndex(-1);
        setIsPlaying(false);
      }
    };
    
    highlightNext();
  };

  const adjustSpeed = (newSpeed: number) => {
    setAudioSpeed(newSpeed);
    if (isPlaying) {
      onStop();
    }
    // Reset played state for free users when speed changes
    if (!isPremium && hasPlayedAudio) {
      setHasPlayedAudio(false);
    }
  };

  const onPlay = async () => {
    if (!text.trim() || (!isPremium && hasPlayedAudio)) return;
    
    // Initialize mobile audio if needed
    if (isMobileOrTablet && !audioInitialized) {
      await initializeMobileAudio();
    }
    
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
      
      await charlotteVoiceService.charlotteReadStory(text, highlightCallback, audioSpeed);
      
      // Mark as played for free users
      if (!isPremium) {
        setHasPlayedAudio(true);
      }
      
      // Start word highlighting if enabled
      if (shouldHighlight && words.length > 0) {
        const totalWords = words.length;
        const estimatedDuration = text.length * 100;
        const wordsPerSecond = totalWords / (estimatedDuration / 1000);
        const wordInterval = 1000 / wordsPerSecond / audioSpeed;
        highlightWords(wordInterval);
      }
      
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
    
    // Stop word highlighting
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
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
    setCurrentWordIndex(-1);
    
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

  // API key validation
  if (!isEnabled) {
    return (
      <div className="text-center text-muted-foreground py-2">
        <p className="text-sm">{t("audioReading.apiKeyRequired", "Add your OpenAI API key to enable audio reading")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 p-3 bg-card rounded-lg border">
      {/* Audio Control Button */}
      <div className="flex items-center gap-2">
        <div className="relative group">
          {isLoading ? (
            <Button size={size} variant="outline" disabled aria-label="Loading audio">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent mr-2"></div>
              {t("audioReading.loadingAudio", "Loading Audio...")}
            </Button>
          ) : error && !isPlaying ? (
            <Button 
              size={size} 
              variant="outline" 
              onClick={onRetry} 
              disabled={retryCount >= 3} 
              aria-label="Retry audio"
              className="gap-2 text-orange-600 border-orange-300 hover:bg-orange-50"
            >
              <RotateCcw className="w-4 h-4" />
              {t("audioReading.tryAgain", "Try Again")} {retryCount > 0 && `(${retryCount}/3)`}
            </Button>
          ) : isPlaying ? (
            <Button 
              size={size} 
              variant="destructive" 
              onClick={onStop} 
              aria-label="Stop narration"
              className="gap-2"
            >
              <Square className="w-4 h-4" />
              {t("audioReading.stop", "Stop")}
            </Button>
          ) : (
            <Button
              onClick={onPlay}
              disabled={!isPremium && hasPlayedAudio}
              variant={variant}
              size={isMobileOrTablet ? "default" : size}
              className={`gap-2 ${
                !isPremium && hasPlayedAudio ? 'opacity-50 cursor-not-allowed' : ''
              } ${isMobileOrTablet ? 'min-h-[44px] px-4' : ''}`}
              aria-label="Read to me"
            >
              <Play className="w-4 h-4" />
              {t("audioReading.readToMe", "Read to Me")}
            </Button>
          )}
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap border shadow-md">
            {!isPremium && hasPlayedAudio ? t("audioReading.audioUsedTooltip", "Audio used (1x per page for free users)") : 
             isPlaying ? t("audioReading.audioPlaying", "Audio playing...") : 
             t("audioReading.playAudio", "Play audio reading")}
          </div>
        </div>
        
        {/* Status indicator */}
        {!isPremium && hasPlayedAudio && (
          <span className="text-xs text-orange-600 font-medium">
            ✓ {t("audioReading.audioUsed", "Audio used")}
          </span>
        )}
      </div>

      {/* Speed controls */}
      <div className="flex items-center gap-1 flex-wrap justify-center">
        <span className="text-xs text-muted-foreground mr-2">{t("audioReading.speed", "Speed")}:</span>
        <Button
          onClick={() => adjustSpeed(0.5)}
          variant="ghost"
          size={isMobileOrTablet ? "default" : "sm"}
          className={`text-xs ${audioSpeed === 0.5 ? 'bg-accent' : ''} ${isMobileOrTablet ? 'min-h-[36px] px-3' : ''}`}
        >
          0.5x
        </Button>
        <Button
          onClick={() => adjustSpeed(0.8)}
          variant="ghost"
          size={isMobileOrTablet ? "default" : "sm"}
          className={`text-xs ${audioSpeed === 0.8 ? 'bg-accent' : ''} ${isMobileOrTablet ? 'min-h-[36px] px-3' : ''}`}
        >
          0.8x
        </Button>
        <Button
          onClick={() => adjustSpeed(1.0)}
          variant="ghost"
          size={isMobileOrTablet ? "default" : "sm"}
          className={`text-xs ${audioSpeed === 1.0 ? 'bg-accent' : ''} ${isMobileOrTablet ? 'min-h-[36px] px-3' : ''}`}
        >
          1x
        </Button>
      </div>
      
      {/* Status and upgrade prompts */}
      {isPlaying && (
        <div className="text-xs text-primary font-medium">
          🎵 {t("audioReading.playingAudio", "Playing audio...")} ({currentWordIndex + 1}/{words.length})
        </div>
      )}
      
      {!isPremium && hasPlayedAudio && (
        <div className="text-center mt-1">
          <div className="text-xs text-orange-600 mb-1">
            🎧 {t("audioReading.freeLimit", "Free users get 1 audio per page")}
          </div>
          <div className="text-xs text-muted-foreground">
            {t("audioReading.wantUnlimited", "Want unlimited audio?")}
            <button className="ml-1 text-primary hover:text-primary/80 underline font-medium">
              {t("audioReading.upgradeToPremium", "Upgrade to Premium")}
            </button>
          </div>
        </div>
      )}
      
      {error && retryCount >= 3 && (
        <span className="text-sm text-muted-foreground">
          {t("audioReading.usingDeviceVoice", "Using device voice")}
        </span>
      )}
    </div>
  );
};

export default UnifiedAudioControls;

// Backward compatibility export
export { UnifiedAudioControls as SynchronizedAudioControls };