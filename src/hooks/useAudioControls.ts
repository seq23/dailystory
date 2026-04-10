import { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/use-mobile';
import { charlotteVoiceService } from '@/services/CharlotteVoiceService';
import { BrowserTTSService } from '@/services/BrowserTTSService';
import { getTTSProvider, TTS_CONFIG } from '@/config/ttsConfig';
import { DebugLogger } from '@/services/DebugLogger';
import { generateSessionId } from '@/utils/sessionId';
import type { UserInfo } from '@/types';

interface AudioControlsOptions {
  text: string;
  userInfo: UserInfo;
  currentPage: number;
  contentHash?: string;
  difficulty?: 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';
  onWordHighlight?: (wordIndex: number) => void;
  onAudioStateChange?: (isPlaying: boolean) => void;
  isPremium?: boolean;
}

/**
 * Consolidated hook for managing all audio playback controls and state
 * Includes session management, hash synchronization, word highlighting, and vocabulary tracking
 */
export const useAudioControls = ({
  text,
  userInfo,
  currentPage,
  contentHash,
  difficulty = 'easy',
  onWordHighlight,
  onAudioStateChange,
  isPremium = false
}: AudioControlsOptions) => {
  // Core audio states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isStabilizing, setIsStabilizing] = useState(false);
  
  // Session management states (from useAudioSession)
  const [hasPlayedThisPage, setHasPlayedThisPage] = useState(false);
  
  // Highlighting states (from multiple highlighting hooks)
  const [currentHighlightedWord, setCurrentHighlightedWord] = useState(-1);
  const [highlightingEnabled, setHighlightingEnabled] = useState(true);
  
  // Vocabulary states (from useAudioVocabulary)
  const [wordsInteracted, setWordsInteracted] = useState(0);
  const [sessionWordsRead, setSessionWordsRead] = useState(0);
  const [pagesCompleted, setPagesCompleted] = useState<Set<number>>(new Set());
  const [audioPlayedPage, setAudioPlayedPage] = useState<number | null>(null);
  const [vocabularyData, setVocabularyData] = useState<any>(null);
  
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isMobileOrTablet } = useIsMobile();
  
  const speedMultiplierRef = useRef(1);
  const lastTapRef = useRef<number>(0);
  const sessionKeyRef = useRef<string>('');
  const cleanupRef = useRef<(() => void) | null>(null);
  const stateChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Track last highlighted word index to restore on ensure-active
  const currentHighlightRef = useRef<number>(-1);

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

  // Session management setup (from useAudioSession)
  useEffect(() => {
    const sessionId = sessionStorage.getItem('t2r_session_id') || generateSessionId();
    if (!sessionStorage.getItem('t2r_session_id')) {
      sessionStorage.setItem('t2r_session_id', sessionId);
    }
    sessionKeyRef.current = `t2r_audio_session_${sessionId}`;
  }, []);

  // Load session data for current page
  useEffect(() => {
    if (isPremium) {
      setHasPlayedThisPage(false);
      return;
    }

    try {
      const sessionData = JSON.parse(sessionStorage.getItem(sessionKeyRef.current) || '{}');
      const pageKey = `page_${currentPage}_${contentHash?.slice(0, 8) || 'unknown'}`;
      setHasPlayedThisPage(Boolean(sessionData[pageKey]));
    } catch {
      setHasPlayedThisPage(false);
    }
  }, [currentPage, contentHash, isPremium]);

  // Expose user name for vocabulary service
  useEffect(() => {
    (window as any).__currentUserName = userInfo?.name || 'guest';
  }, [userInfo?.name]);

  // Difficulty-based highlighting control
  const difficultyLevel = (() => {
    switch(difficulty) {
      case 'beginner': return 0;
      case 'easy': return 1; 
      case 'medium': return 2;
      case 'hard': return 3;
      case 'expert': return 4;
      default: return 1;
    }
  })();

  useEffect(() => {
    setHighlightingEnabled(difficultyLevel <= 2);
  }, [difficultyLevel]);

  // Universal highlighting fix - event listeners setup
  useEffect(() => {
    // Listen for all audio state changes with debouncing
    const handleAudioStateChange = (event: CustomEvent) => {
      const { isPlaying: playing } = event.detail;
      
      // Sync isPlaying state
      setIsPlaying(playing);
      
      if (stateChangeTimeoutRef.current) {
        clearTimeout(stateChangeTimeoutRef.current);
      }
      
      stateChangeTimeoutRef.current = setTimeout(() => {
        if (playing) {
          DebugLogger.log('audio', 'Audio started - ensuring highlighting is active');
          window.dispatchEvent(new CustomEvent('highlighting:ensure-active'));
        } else {
          DebugLogger.log('audio', 'Audio stopped - clearing all highlights');
          window.dispatchEvent(new CustomEvent('highlighting:clear-all'));
        }
      }, 300);
    };
    
    // Listen for highlighting requests
    const handleHighlightingRequest = (event: CustomEvent) => {
      const { wordIndex } = event.detail;
      
      const interactiveWords = document.querySelectorAll('[data-word-index]');
      
      // ENHANCED DEBUG: Log detailed tokenization mismatch info
      if (interactiveWords.length === 0) {
        DebugLogger.error('ui', `❌ HIGHLIGHTING BROKEN: No [data-word-index] elements found for word ${wordIndex}`, {
          requestedWordIndex: wordIndex,
          availableElements: document.querySelectorAll('[data-word-index]').length,
          allDataAttributes: Array.from(document.querySelectorAll('[data-word-index]')).map(el => el.getAttribute('data-word-index')),
          currentText: text?.slice(0, 100) + '...'
        });
      } else {
        DebugLogger.log('ui', `✅ Highlighting system found ${interactiveWords.length} interactive words for index ${wordIndex}`);
      }
      
      interactiveWords.forEach((element) => {
        const elementIndex = parseInt(element.getAttribute('data-word-index') || '-1');
        
        if (elementIndex === wordIndex) {
          element.classList.add('highlighted');
          element.setAttribute('data-highlighted', 'true');
        } else {
          element.classList.remove('highlighted');
          element.removeAttribute('data-highlighted');
        }
      });
      
      setCurrentHighlightedWord(highlightingEnabled ? wordIndex : -1);
      currentHighlightRef.current = highlightingEnabled ? wordIndex : -1;
      DebugLogger.log('ui', `Universal highlighting: word ${wordIndex} (${interactiveWords.length} words processed)`);
    };
    
    // Listen for clear highlighting requests
    const handleClearHighlighting = () => {
      const highlightedElements = document.querySelectorAll('[data-highlighted]');
      
      highlightedElements.forEach((element) => {
        element.classList.remove('highlighted');
        element.removeAttribute('data-highlighted');
      });
      
      setCurrentHighlightedWord(-1);
      currentHighlightRef.current = -1;
      if (highlightedElements.length > 0) {
        DebugLogger.log('ui', `Universal highlighting cleared: ${highlightedElements.length} elements`);
      }
    };
    
    // Re-apply last known highlight when audio resumes or UI re-renders
    const handleEnsureActive = () => {
      const wi = currentHighlightRef.current;
      if (highlightingEnabled && wi >= 0) {
        DebugLogger.log('ui', `Ensuring highlight active: word ${wi}`);
        window.dispatchEvent(new CustomEvent('highlighting:request', { detail: { wordIndex: wi } }));
      } else {
        DebugLogger.log('ui', 'Ensure-active: no highlight to restore');
      }
    };
    
    // Listen for session reset to reset guest play states
    const handleSessionReset = () => {
      setHasPlayedThisPage(false);
      setIsPlaying(false);
    };
    window.addEventListener('audio:statechange', handleAudioStateChange as EventListener);
    window.addEventListener('highlighting:request', handleHighlightingRequest as EventListener);
    window.addEventListener('highlighting:clear-all', handleClearHighlighting as EventListener);
    window.addEventListener('highlighting:ensure-active', handleEnsureActive as EventListener);
    window.addEventListener('audio:session:reset', handleSessionReset);
    
    return () => {
      window.removeEventListener('audio:statechange', handleAudioStateChange as EventListener);
      window.removeEventListener('highlighting:request', handleHighlightingRequest as EventListener);
      window.removeEventListener('highlighting:clear-all', handleClearHighlighting as EventListener);
      window.removeEventListener('highlighting:ensure-active', handleEnsureActive as EventListener);
      window.removeEventListener('audio:session:reset', handleSessionReset);
      
      if (stateChangeTimeoutRef.current) {
        clearTimeout(stateChangeTimeoutRef.current);
      }
    };
  }, [highlightingEnabled]);

  // Stop audio on text or page change to avoid stale playback and apply reduced stabilization
  useEffect(() => {
    // Immediate state update
    setIsPlaying(false);
    setIsLoading(false);
    
    // Stop Charlotte's audio service
    charlotteVoiceService.stop();
    
    // Clear highlighting on text change
    clearHighlighting();
    
    setIsStabilizing(true);
    // 800ms stabilization to ensure page stability before audio starts
    const delay = 800;
    const to = window.setTimeout(() => setIsStabilizing(false), delay);
    return () => clearTimeout(to);
  }, [text, currentPage]);

  // Vocabulary management functions
  const incrementWordsInteracted = useCallback(() => {
    setWordsInteracted(prev => prev + 1);
  }, []);

  const incrementSessionWordsRead = useCallback((count: number = 1) => {
    setSessionWordsRead(prev => prev + count);
  }, []);

  const markPageCompleted = useCallback((pageNumber: number) => {
    setPagesCompleted(prev => new Set([...prev, pageNumber]));
  }, []);

  const resetSessionCounters = useCallback(() => {
    setWordsInteracted(0);
    setSessionWordsRead(0);
    setPagesCompleted(new Set());
    setAudioPlayedPage(null);
  }, []);

  const clearVocabularyData = useCallback(() => {
    setVocabularyData(null);
  }, []);

  // Highlighting management functions
  const highlightWord = useCallback((wordIndex: number) => {
    if (!highlightingEnabled) {
      DebugLogger.log('ui', `Word highlighting disabled for difficulty level ${difficultyLevel}`);
      return;
    }
    
    window.dispatchEvent(new CustomEvent('highlighting:request', { 
      detail: { wordIndex } 
    }));

    // Immediate local state update to avoid missed UI events
    setCurrentHighlightedWord(wordIndex);
    currentHighlightRef.current = wordIndex;
    
    if (onWordHighlight) {
      onWordHighlight(wordIndex);
    }
  }, [highlightingEnabled, difficultyLevel, onWordHighlight]);

  const clearHighlighting = useCallback(() => {
    window.dispatchEvent(new CustomEvent('highlighting:clear-all'));
    
    if (onWordHighlight) {
      onWordHighlight(-1);
    }
  }, [onWordHighlight]);

  // Session management functions
  const markPageAsPlayed = useCallback(() => {
    if (isPremium) return;

    try {
      const sessionData = JSON.parse(sessionStorage.getItem(sessionKeyRef.current) || '{}');
      const pageKey = `page_${currentPage}_${contentHash?.slice(0, 8) || 'unknown'}`;
      sessionData[pageKey] = true;
      sessionStorage.setItem(sessionKeyRef.current, JSON.stringify(sessionData));
      setHasPlayedThisPage(true);
    } catch (error) {
      DebugLogger.warn('performance', 'Failed to save audio session data:', error);
    }
  }, [isPremium, currentPage, contentHash]);

  // Hash synchronization validation
  const validateHashSync = useCallback(async (): Promise<boolean> => {
    const currentUIHash = (window as any).__pageContentHash;
    const currentText = (window as any).__pageContentString;
    
    DebugLogger.log('audio', 'Hash Validation Debug', {
      audioServiceHash: contentHash?.slice(0,12),
      uiWindowHash: currentUIHash?.slice(0,12), 
      hashesMatch: contentHash === currentUIHash,
      audioHashExists: !!contentHash,
      uiHashExists: !!currentUIHash,
      textLength: currentText?.length || 0,
      timestamp: Date.now()
    });
    
    if (contentHash && currentUIHash && currentUIHash !== contentHash) {
      DebugLogger.log('audio', `Hash mismatch detected: UI=${currentUIHash?.slice(0,10)}, Audio=${contentHash?.slice(0,10)} - waiting for sync...`);
      
      toast({
        title: "Syncing content...",
        description: "Waiting for content synchronization. This may take a moment during story generation.",
        duration: 3000,
      });
      
      // Simplified sync check - wait for hashes to match
      const MAX_WAIT_TIME = 5000;
      const startTime = Date.now();
      
      while (Date.now() - startTime < MAX_WAIT_TIME) {
        const newUIHash = (window as any).__pageContentHash;
        if (newUIHash && newUIHash === contentHash) {
          DebugLogger.log('audio', 'Hash synchronization successful');
          toast({
            title: "Content synchronized",
            description: "Audio is now ready to play with synchronized content.",
            duration: 1500,
          });
          return true;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      DebugLogger.error('network', '❌ Hash sync timeout - unable to synchronize content');
      toast({
        title: "Sync timeout",
        description: "Content synchronization took too long. Please try again.",
        variant: "destructive",
        duration: 4000,
      });
      return false;
    }
    
    return true;
  }, [contentHash, toast]);

  /**
   * Play audio with enhanced validation and stabilization
   */
  const playAudio = async (customValidateHashSync?: () => Promise<boolean>) => {
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
      const hashValidator = customValidateHashSync || validateHashSync;
      const syncValid = await hashValidator();
      if (!syncValid) {
        setIsLoading(false);
        return;
      }

      await playWithValidation();
    } catch (error) {
      DebugLogger.error('audio', 'Enhanced audio playback error:', error);

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
    // 800ms stabilization to ensure page content is fully stable
    if (isStabilizing) {
      DebugLogger.log('audio', 'Audio playback waiting for stabilization...');
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

    const playSnapshot = { text, page: currentPage, contentHash };

    // Use Charlotte's unified voice service for story reading
    await charlotteVoiceService.charlotteReadStory(text, (wordIndex: number) => {
      DebugLogger.log('audio', `Charlotte Audio Sync: Highlighting word ${wordIndex}`);
      highlightWord(wordIndex);
    });

    // Guard: if page or text changed during load, stop and bail
    if (playSnapshot.page !== currentPage || playSnapshot.text !== text || playSnapshot.contentHash !== contentHash) {
      DebugLogger.warn('audio', '🛑 Charlotte TTS aborted due to page/text/hash change during load');
      charlotteVoiceService.stop();
      toast({ 
        title: t('audioReading.pageChanged', 'Page changed'), 
        description: t('audioReading.refreshAudio', 'Charlotte refreshed for the new page.'), 
        duration: 1800 
      });
      return;
    }

    setIsPlaying(true);
    
    // Dispatch audio state change for synchronization
    window.dispatchEvent(new CustomEvent('audio:statechange', { 
      detail: { isPlaying: true } 
    }));
  };

  /**
   * Stop audio playback
   */
  const stopAudio = () => {
    DebugLogger.log('audio', 'Audio Controls: Stop initiated');
    
    // Immediate state update for responsive UI
    setIsPlaying(false);
    setIsLoading(false);
    
    // Clear highlighting immediately
    clearHighlighting();
    
    // Notify parent component immediately
    onAudioStateChange?.(false);
    
    // Stop Charlotte's audio service
    charlotteVoiceService.stop();
    
    // Emit state change for UI updates (but not stop events to prevent loops)
    window.dispatchEvent(new CustomEvent('audio:statechange', { 
      detail: { isPlaying: false } 
    }));
    
    DebugLogger.log('audio', 'Audio Controls: Stop completed');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      charlotteVoiceService.stop();
    };
  }, []);

  // Computed values for session management
  const canUseAudio = isPremium || !hasPlayedThisPage;
  const shouldShowCrown = !isPremium && hasPlayedThisPage;

  // Vocabulary state object
  const vocabularyState = {
    isAudioPlaying: isPlaying,
    isAudioLoading: isLoading,
    showVocabularyCollector: false, // Managed by parent components
    wordsInteracted,
    sessionWordsRead,
    pagesCompleted,
    audioPlayedPage,
    vocabularyData,
  };

  const vocabularyActions = {
    setIsAudioPlaying: setIsPlaying,
    setIsAudioLoading: setIsLoading,
    setShowVocabularyCollector: () => {}, // Managed by parent components
    setWordsInteracted,
    setSessionWordsRead,
    setPagesCompleted,
    setAudioPlayedPage,
    setVocabularyData,
    incrementWordsInteracted,
    incrementSessionWordsRead,
    markPageCompleted,
    resetSessionCounters,
    clearVocabularyData,
  };

  return {
    // Core audio controls
    isPlaying,
    isLoading,
    isStabilizing,
    playAudio,
    stopAudio,
    speedMultiplierRef,
    
    // Session management (from useAudioSession)
    canUseAudio,
    shouldShowCrown,
    hasPlayedThisPage,
    markPageAsPlayed,
    
    // Hash synchronization (from useAudioSync)
    validateHashSync,
    
    // Word highlighting (from multiple highlighting hooks)
    currentHighlightedWord,
    highlightWord,
    clearHighlighting,
    highlightingEnabled,
    difficultyLevel,
    
    // Vocabulary management (from useAudioVocabulary)
    vocabularyState,
    vocabularyActions,
    wordsInteracted,
    sessionWordsRead,
  };
};