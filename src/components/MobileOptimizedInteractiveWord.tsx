import React, { useState, useMemo, useEffect, useRef } from "react";
import { InteractiveWord } from "./InteractiveWord";
import { MobileTTSModal } from "./MobileTTSModal";
import { useIsMobile } from "@/hooks/use-mobile";
import type { UserInfo } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import phonicsMiniDict from '@/data/phonicsMiniDict';
import { charlotteVoiceService } from "@/services/CharlotteVoiceService";
import { browserTTSService } from "@/services/BrowserTTSService";
import { VocabularyLevelClassifier } from "@/utils/vocabularyLevelClassifier";
import { isRareWord } from "@/utils/rareWordsList";
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
  wordIndex?: number; // CRITICAL FIX: Add wordIndex for highlighting
}

export const MobileOptimizedInteractiveWord = React.memo((props: MobileOptimizedInteractiveWordProps) => {
  const { isMobileOrTablet } = useIsMobile();
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingWordData, setIsLoadingWordData] = useState(false);
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

  // Difficulty level mapping for word highlighting logic
  const difficultyLevel = useMemo(() => {
    switch(difficulty) {
      case 'beginner': return 0;
      case 'easy': return 1;
      case 'medium': return 2;
      case 'hard': return 3;
      case 'expert': return 4;
      default: return 1;
    }
  }, [difficulty]);

  // LEAN Word Highlighting Rules - Based on Difficulty Level
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

    // Difficulty-based underlining logic:
    // Levels 0-2 (beginner/easy/medium): Underline ALL words
    // Levels 3-4 (hard/expert): Underline only 7+ letter words
    if (difficultyLevel <= 2) {
      return true; // Underline all words for easier levels
    } else {
      // GATE E: Underline 7+ letter words OR any rare word (deterministic)
      // Catches short-but-rare words like "piqued", "wry", "deft" that the
      // length heuristic misses for advanced/independent readers.
      return cleanWord.length >= 7 || isRareWord(cleanWord);
    }
  }, [cleanWord, props.userInfo?.name, difficultyLevel]);

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
        // Use Charlotte's unified voice service
        await charlotteVoiceService.charlotteHearWord(cleanWord);
      } catch (e) {
        DebugLogger.error('audio', 'Mobile Charlotte HearIt failed', e);
      } finally {
        setIsPlaying(false);
        markReviewedOnce();
      }
    };

    const handleExplain = async () => {
      if (isLoadingWordData) return;
      setIsLoadingWordData(true);
      try {
        // Get definition from API first
        const { data: definitionData, error } = await supabase.functions.invoke('word-dictionary', {
          body: { 
            word: cleanWord, 
            userLevel: difficulty,
            userLanguage: props.userInfo?.nativeLanguage || 'en',
            sentenceContext: props.sentenceContext
          }
        });

        let definition = '';
        if (!error && definitionData?.definition) {
          definition = definitionData.definition;
        } else {
          // Fallback to local definition
          definition = `${cleanWord} - a word used in this story`;
        }

        // Audio explanation - use Charlotte for English speakers, browser TTS for others
        const userLanguage = props.userInfo?.nativeLanguage || 'en';
        
        if (userLanguage === 'en') {
          // English speakers get Charlotte's premium voice
          await charlotteVoiceService.charlotteExplainWord(cleanWord, userLanguage);
        } else {
          // Non-English speakers get browser TTS in their native language
          await browserTTSService.speakExplanation(definition, userLanguage as any);
        }

      } catch (e) {
        DebugLogger.error('story', 'Mobile word explanation failed', e);
      } finally {
        setIsLoadingWordData(false);
        markReviewedOnce();
      }
    };

    const handleSyllables = async () => {
      try {
        setIsPlaying(true);
        // Use Charlotte's unified voice service
        await charlotteVoiceService.charlotteSyllableWord(cleanWord);
        setIsPlaying(false);
      } catch (e) {
        DebugLogger.error('audio', 'Mobile Charlotte Syllables failed', e);
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
            // Gate C2: Track touch position to distinguish tap vs scroll
            const t = e.touches[0];
            if (t) {
              (e.currentTarget as any).__touchStartX = t.clientX;
              (e.currentTarget as any).__touchStartY = t.clientY;
              (e.currentTarget as any).__touchMoved = false;
            }
          }}
          onTouchMove={(e) => {
            const t = e.touches[0];
            const sx = (e.currentTarget as any).__touchStartX;
            const sy = (e.currentTarget as any).__touchStartY;
            if (t && typeof sx === 'number' && typeof sy === 'number') {
              const dx = Math.abs(t.clientX - sx);
              const dy = Math.abs(t.clientY - sy);
              // 10px threshold = scroll, not a tap
              if (dx > 10 || dy > 10) {
                (e.currentTarget as any).__touchMoved = true;
              }
            }
          }}
          onTouchEnd={(e) => {
            const moved = (e.currentTarget as any).__touchMoved;
            // If user scrolled (moved >10px), don't treat as tap → don't open modal
            if (moved) {
              e.preventDefault();
              return;
            }
            // Allow native click event to fire (handles modal open via onClick)
            // Do NOT call handleClick() here — onClick already does it.
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
          data-difficulty-level={difficultyLevel}
          data-highlight-enabled={difficultyLevel <= 2}
          data-word-index={props.wordIndex} // CRITICAL FIX: Add data-word-index for highlighting
          style={{ 
            fontSize: 'inherit', 
            lineHeight: 'inherit', 
            display: 'inline', 
            wordBreak: 'keep-all',
            overflowWrap: 'normal',
            hyphens: 'none',
            whiteSpace: 'nowrap'
          }}
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
