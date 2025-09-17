import React, { useState, useMemo, useEffect, useRef } from "react";
import { InteractiveWord } from "./InteractiveWord";
import { MobileTTSModal } from "./MobileTTSModal";
import { useIsMobile } from "@/hooks/use-mobile";
import type { UserInfo } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { PhoneticRulesEngine } from "@/services/phoneticRulesEngine";
import { SimpleAudioEngine } from "@/services/SimpleAudioEngine";
import { VocabularyLevelClassifier } from "@/utils/vocabularyLevelClassifier";
import { getGlobalAddVocabularyWord } from "@/utils/gamificationGlobals";
import { VocabularyTrackingService } from "@/services/vocabularyTrackingService";
import { useToast } from "@/hooks/use-toast";
import { DebugLogger } from "@/services/DebugLogger";

interface MobileOptimizedInteractiveWordProps {
  word: string;
  className?: string;
  difficulty?: "beginner" | "easy" | "medium" | "hard" | "expert";
  userInfo?: UserInfo;
  isPremium?: boolean;
  sentenceContext?: string;
  userId?: string;
  forceModal?: boolean;
  wordAlreadySaved?: boolean;
}

export const MobileOptimizedInteractiveWord = React.memo((props: MobileOptimizedInteractiveWordProps) => {
  const { isMobileOrTablet } = useIsMobile();
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingWordData, setIsLoadingWordData] = useState(false);
  const audioEngine = SimpleAudioEngine.getInstance();
  const { toast } = useToast();
  const [hasCountedReview, setHasCountedReview] = useState(false);
  
  // CRITICAL FIX: Add debouncing to prevent multiple rapid modal opens
  const [isDebouncing, setIsDebouncing] = useState(false);
  const debounceTimeoutRef = useRef<number | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const difficulty = props.difficulty || "easy";
  const cleanWord = useMemo(() => props.word.replace(/[.,!?;:'"()—–\-\/]/g, ''), [props.word]);
  
  // Skip highlighting for pure punctuation tokens
  const isPurelyPunctuation = useMemo(() => /^[—–\-\/.,!?;:'"()]+$/.test(props.word.trim()), [props.word]);

  // Voice commands status (desktop only)
  const [vcStatus, setVcStatus] = useState<'idle' | 'listening' | 'processing'>('idle');
  const cancelRef = useRef<boolean>(false);

  useEffect(() => {
    const onStatus = (e: any) => setVcStatus(e?.detail?.status || 'idle');
    window.addEventListener('voice:status', onStatus as EventListener);
    return () => window.removeEventListener('voice:status', onStatus as EventListener);
  }, []);


  // CRITICAL FIX: Cache expensive word difficulty calculations OUTSIDE of other useMemo
  const cachedWordDifficulty = useMemo(() => {
    return VocabularyLevelClassifier.getWordDifficulty(props.word, difficulty);
  }, [props.word, difficulty]);

  // LEAN Adaptive Interactive Word Rules - Smart ESL & Progress Tracking (CACHED)
  const shouldBeInteractive = useMemo(() => {
    const lw = cleanWord.toLowerCase();
    if (!lw || isPurelyPunctuation) return false;

    // Exclusions: user's name, family terms/honorifics, proper nouns
    if (props.userInfo?.name && lw === props.userInfo.name.toLowerCase()) return false;

    const excluded = new Set([
      'mom','dad','mama','papa','mommy','daddy','mr','mrs','ms','miss','sir','maam','ma\'am',
      'grandma','grandpa','aunt','uncle','brother','sister'
    ]);
    if (excluded.has(lw)) return false;

    const trimmedOriginal = (props.word || '').replace(/[.,!?;:'"()]/g, '');
    const isAllCaps = trimmedOriginal === trimmedOriginal.toUpperCase();
    const isProperNoun = /^[A-Z][a-z]+$/.test(trimmedOriginal) && trimmedOriginal !== 'I';
    if (isProperNoun && !isAllCaps) return false;

    const { shouldHighlight, level } = cachedWordDifficulty;
    
    // ESL Boost: +20% more interactive words for non-native English speakers
    const isESL = props.userInfo?.nativeLanguage && props.userInfo.nativeLanguage !== 'en';
    if (isESL && !shouldHighlight && difficulty !== 'beginner') {
      // Boost: Make easier words interactive for ESL learners
      if (level <= 3) return true; // ESL boost for levels 1-3
    }
    
    return shouldHighlight;
  }, [cleanWord, props.userInfo?.name, props.userInfo?.nativeLanguage, difficulty, cachedWordDifficulty]);

// For mobile devices, use click-to-open modal instead of hover
if (props.forceModal || isMobileOrTablet) {
  const markReviewedOnce = () => {
    if (!hasCountedReview) {
      try { (window as any).markWordReviewed?.(cleanWord); } catch {}
      setHasCountedReview(true);
    }
  };

  const handleClick = async () => {
    // CRITICAL FIX: Debounce rapid clicks
    if (!shouldBeInteractive || isDebouncing) return;
    
    setIsDebouncing(true);
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    
    (window as any).__lastSelectedWord = cleanWord;
    // Set hovered word context for voice commands on mobile/tablet
    (window as any).__hoveredWord = cleanWord;
    setHasCountedReview(false);
    
    // CRITICAL FIX: Open modal immediately, defer heavy operations
    setShowMobileModal(true);
    
    // Reset debouncing after modal is open
    debounceTimeoutRef.current = window.setTimeout(() => {
      setIsDebouncing(false);
    }, 300);
    
    // CRITICAL FIX: Move heavy operations to background (non-blocking)
    setTimeout(async () => {
      try {
        // Auto-save vocabulary tracking (deferred)
        VocabularyTrackingService.logEncounter(cleanWord, cleanWord, difficulty).catch(() => {});
        
        // Add to vocabulary (deferred)
        const normalizedDifficulty: 'beginner' | 'intermediate' | 'advanced' =
          (difficulty === 'beginner' || difficulty === 'easy') ? 'beginner' :
          (difficulty === 'medium') ? 'intermediate' : 'advanced';
        const vocabularyWord: any = {
          word: cleanWord,
          definition: '',
          difficulty: normalizedDifficulty,
          dateAdded: new Date().toISOString(),
          timesReviewed: 0,
          mastered: false,
          storyContext: props.sentenceContext || ''
        };
        (window as any).addToVocabulary?.(vocabularyWord);
        const addVocabularyWord = getGlobalAddVocabularyWord();
        addVocabularyWord && addVocabularyWord();
      } catch (error) {
        DebugLogger.warn('story', 'Background vocabulary operations failed', error);
      }
    }, 0);
  };

    const handleHearIt = async () => {
      if (isPlaying) return;
      setIsPlaying(true);
      try {
        // CRITICAL FIX: Lazy load audio service only when needed
        const { InteractiveWordAudioService } = await import('@/services/InteractiveWordAudioService');
        await InteractiveWordAudioService.hearWord(cleanWord);
      } catch (e) {
        DebugLogger.error('audio', 'Mobile HearIt failed', e);
      } finally {
        setIsPlaying(false);
        markReviewedOnce();
      }
    };

    const handleExplain = async () => {
      if (isLoadingWordData) return;
      setIsLoadingWordData(true);
      try {
        // CRITICAL FIX: Lazy load audio service only when needed
        const { InteractiveWordAudioService } = await import('@/services/InteractiveWordAudioService');
        await InteractiveWordAudioService.explainWord(cleanWord, props.userInfo?.nativeLanguage || 'en');
      } catch (e) {
        DebugLogger.error('story', 'Mobile Explain failed', e);
      } finally {
        setIsLoadingWordData(false);
        markReviewedOnce();
      }
    };

    const handleSyllables = async () => {
      try {
        setIsPlaying(true);
        // CRITICAL FIX: Lazy load audio service only when needed
        const { InteractiveWordAudioService } = await import('@/services/InteractiveWordAudioService');
        await InteractiveWordAudioService.syllableWord(cleanWord);
        setIsPlaying(false);
      } catch (e) {
        DebugLogger.error('audio', 'Mobile Syllables failed', e);
        setIsPlaying(false);
      } finally {
        markReviewedOnce();
      }
    };

    const handleSave = () => {
      const normalizedDifficulty: 'beginner' | 'intermediate' | 'advanced' =
        (difficulty === 'beginner' || difficulty === 'easy') ? 'beginner' :
        (difficulty === 'medium') ? 'intermediate' : 'advanced';

      const vocabularyWord: any = {
        word: cleanWord,
        definition: '',
        difficulty: normalizedDifficulty,
        dateAdded: new Date().toISOString(),
        timesReviewed: 0,
        mastered: false,
        storyContext: props.sentenceContext || ''
      };

      try {
        (window as any).addToVocabulary?.(vocabularyWord);
      } catch (err) {
        DebugLogger.warn('story', 'addToVocabulary not available', err);
      }

      try {
        const addVocabularyWord = getGlobalAddVocabularyWord();
        addVocabularyWord && addVocabularyWord();
      } catch {}

      setShowMobileModal(false);
      toast({ title: 'Saved to Vocabulary', description: cleanWord, duration: 1800 });
    };

    return (
      <>
        <span
          onClick={handleClick}
          onTouchStart={(e) => {
            // CRITICAL FIX: Enhanced touch handling - prevent conflicts with long-press
            e.stopPropagation();
            if (!shouldBeInteractive || isDebouncing) return;
            // Only trigger modal if not a long-press (handled by PremiumHoverController)
            setTimeout(() => {
              if (!e.defaultPrevented) {
                handleClick();
              }
            }, 50); // Small delay to let long-press handler potentially prevent this
          }}
          onTouchEnd={(e) => {
            // Prevent click event after touch
            e.preventDefault();
          }}
          onMouseEnter={() => {
            if (!shouldBeInteractive || isMobileOrTablet) return; // CRITICAL FIX: Block hover on mobile
            (window as any).__hoveredWord = cleanWord;
            
            // Note: Premium hover is now handled by PremiumHoverController
            // This keeps the word context for voice commands only
          }}
          onMouseLeave={() => {
            if ((window as any).__hoveredWord === cleanWord) {
              (window as any).__hoveredWord = '';
            }
            cancelRef.current = true;
          }}
          className={`${props.className} inline ${shouldBeInteractive ? 'cursor-pointer underline decoration-dotted decoration-2 underline-offset-2 hover:decoration-primary' : ''} ${props.isPremium && shouldBeInteractive ? 'interactive-word-premium-hover' : ''}`}
          style={{ fontSize: 'inherit', lineHeight: 'inherit', display: 'inline' }}
        >
          {props.word}
        </span>
        <MobileTTSModal
          isOpen={showMobileModal}
          onClose={() => setShowMobileModal(false)}
          word={props.word}
          onHearIt={handleHearIt}
          onExplain={handleExplain}
          onSyllables={handleSyllables}
          onSave={handleSave}
          isPremium={props.isPremium}
          userInfo={props.userInfo}
          isPlaying={isPlaying}
          isLoadingWordData={isLoadingWordData}
          isSaved={!!props.wordAlreadySaved}
        />
      </>
    );
  }

  // For desktop, use the original InteractiveWord component
  return <InteractiveWord {...props} />;
}, (prevProps, nextProps) => {
  // Memoization comparison
  return (
    prevProps.word === nextProps.word &&
    prevProps.className === nextProps.className &&
    prevProps.difficulty === nextProps.difficulty &&
    prevProps.isPremium === nextProps.isPremium &&
    prevProps.forceModal === nextProps.forceModal
  );
});
