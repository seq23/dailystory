import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/use-mobile';
import { SimplifiedAudioEngine } from '@/services/SimplifiedAudioEngine';
import type { UserInfo } from '@/types';

interface AudioControlsOptions {
  text: string;
  userInfo: UserInfo;
  currentPage: number;
  contentHash?: string;
  difficulty?: 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';
  onWordHighlight?: (wordIndex: number) => void;
  onAudioStateChange?: (isPlaying: boolean) => void;
}

/**
 * Hook for managing audio playback controls and state
 * Handles play/stop/loading states and audio service coordination
 */
export const useAudioControls = ({
  text,
  userInfo,
  currentPage,
  contentHash,
  difficulty = 'easy',
  onWordHighlight,
  onAudioStateChange
}: AudioControlsOptions) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isStabilizing, setIsStabilizing] = useState(false);
  
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isMobileOrTablet } = useIsMobile();
  
  const speedMultiplierRef = useRef(1);
  const lastTapRef = useRef<number>(0);

  // Speed baseline calculator (mirror of service mapping)
  const getBaseSpeed = () => {
    const map: Record<typeof difficulty, number> = {
      beginner: 0.5,
      easy: 0.75,
      medium: 0.85,
      hard: 0.9,
      expert: 1.0,
    } as const;
    const base = map[difficulty] ?? 0.85;
    const ageMultiplier = userInfo && (userInfo as any).age && (userInfo as any).age <= 8 ? 0.9 : 1.0;
    return Math.max(0.4, Math.min(1.2, base * ageMultiplier));
  };

  // Mobile audio initialization is handled by SimplifiedAudioEngine internally

  // Stop audio on text or page change to avoid stale playback and apply reduced stabilization
  useEffect(() => {
    // Immediate state update
    setIsPlaying(false);
    setIsLoading(false);
    
    // Stop audio service
    SimplifiedAudioEngine.getInstance().stop();
    
    setIsStabilizing(true);
    // Reduced stabilization timing: 500ms for optimal performance
    const delay = 500;
    const to = window.setTimeout(() => setIsStabilizing(false), delay);
    return () => clearTimeout(to);
  }, [text, currentPage]);

  /**
   * Play audio with enhanced validation and stabilization
   */
  const playAudio = async (validateHashSync: () => Promise<boolean>) => {
    setIsLoading(true);

    // Debounce rapid taps
    const now = Date.now();
    if (now - (lastTapRef.current || 0) < 350) { 
      setIsLoading(false); 
      return; 
    }
    lastTapRef.current = now;

    try {
      // Validate hash synchronization first
      const syncValid = await validateHashSync();
      if (!syncValid) {
        setIsLoading(false);
        return;
      }

      await playWithValidation();
    } catch (error) {
      console.error('Enhanced audio playback error:', error);

      toast({
        title: t("audioReading.audioError", "Audio Error"),
        description: isMobileOrTablet ? 
          t("audioReading.mobileAudioError", "Could not play audio. On mobile devices, ensure sound is enabled and try again.") :
          t("audioReading.audioPlayError", "Could not play audio. Please try again."),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Play audio with stabilization check
   */
  const playWithValidation = async (retryCount = 0): Promise<void> => {
    // Enhanced stabilization with reduced timing (500ms instead of 3-4 seconds)
    if (isStabilizing) {
      console.log('🕐 Audio playback waiting for stabilization...');
      if (retryCount === 0) {
        toast({
          title: t("audioReading.stabilizing", "Preparing audio..."),
          description: t("audioReading.stabilizingDesc", "Please wait while we prepare the best reading experience."),
          duration: 2000,
        });
      }
      
      // Wait for stabilization to complete
      while (isStabilizing) {
        await new Promise(r => setTimeout(r, 100));
      }
    }

    const speed = getBaseSpeed() * speedMultiplierRef.current;
    const playSnapshot = { text, page: currentPage, contentHash };

    // Play with SimplifiedAudioEngine
    await SimplifiedAudioEngine.getInstance().playTextWithSynchronization({
      text,
      voiceId: 'XB0fDUnXU5powFXDhCwa', // Charlotte voice
      context: 'learning',
      contentHash,
      onWordHighlight: (wordIndex: number) => {
        console.log(`🎯 Audio Sync: Highlighting word ${wordIndex}`);
        onWordHighlight?.(wordIndex);
      }
    });

    // Guard: if page or text changed during load, stop and bail
    if (playSnapshot.page !== currentPage || playSnapshot.text !== text || playSnapshot.contentHash !== contentHash) {
      console.warn('🛑 TTS aborted due to page/text/hash change during load');
      SimplifiedAudioEngine.getInstance().stop();
      toast({ 
        title: t('audioReading.pageChanged', 'Page changed'), 
        description: t('audioReading.refreshAudio', 'Audio refreshed for the new page.'), 
        duration: 1800 
      });
      return;
    }

    setIsPlaying(true);
  };

  /**
   * Stop audio playback
   */
  const stopAudio = () => {
    console.log('🛑 Audio Controls: Stop initiated');
    
    // Immediate state update for responsive UI
    setIsPlaying(false);
    setIsLoading(false);
    
    // Clear highlighting immediately
    onWordHighlight?.(-1);
    
    // Notify parent component immediately
    onAudioStateChange?.(false);
    
    // Stop audio sync service
    SimplifiedAudioEngine.getInstance().stop();
    
    // Emit state change for UI updates (but not stop events to prevent loops)
    window.dispatchEvent(new CustomEvent('audio:statechange', { 
      detail: { isPlaying: false } 
    }));
    
    console.log('✅ Audio Controls: Stop completed');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      SimplifiedAudioEngine.getInstance().stop();
    };
  }, []);

  return {
    isPlaying,
    isLoading,
    isStabilizing,
    playAudio,
    stopAudio,
    speedMultiplierRef
  };
};