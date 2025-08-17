import { useState, useMemo, useEffect, useRef } from "react";
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

export const MobileOptimizedInteractiveWord = (props: MobileOptimizedInteractiveWordProps) => {
  const { isMobileOrTablet } = useIsMobile();
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingWordData, setIsLoadingWordData] = useState(false);
  const audioEngine = SimpleAudioEngine.getInstance();
  const { toast } = useToast();
  const [hasCountedReview, setHasCountedReview] = useState(false);

  const difficulty = props.difficulty || "easy";
  const cleanWord = useMemo(() => props.word.replace(/[.,!?;:'"()]/g, ''), [props.word]);

  // Voice commands status (desktop only)
  const [vcStatus, setVcStatus] = useState<'idle' | 'listening' | 'processing'>('idle');
  const cancelRef = useRef<boolean>(false);

  useEffect(() => {
    const onStatus = (e: any) => setVcStatus(e?.detail?.status || 'idle');
    window.addEventListener('voice:status', onStatus as EventListener);
    return () => window.removeEventListener('voice:status', onStatus as EventListener);
  }, []);


  // Level rules: 0-1 (beginner/easy) underline all; 2-4 (medium/hard/expert) only significant words
  // Level rules and importance filtering: Level 0 (beginner) = all words; others = important words only
  const shouldBeInteractive = useMemo(() => {
    const lw = cleanWord.toLowerCase();
    if (!lw) return false;

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

    // Level rules: beginner = all words; easy+ = classifier-based important words
    if (difficulty === 'beginner') return true;

    const { shouldHighlight } = VocabularyLevelClassifier.getWordDifficulty(props.word, difficulty);
    return shouldHighlight;
  }, [cleanWord, props.userInfo?.name, difficulty, props.word]);

// For mobile devices, use click-to-open modal instead of hover
if (props.forceModal || isMobileOrTablet) {
  const markReviewedOnce = () => {
    if (!hasCountedReview) {
      try { (window as any).markWordReviewed?.(cleanWord); } catch {}
      setHasCountedReview(true);
    }
  };

  const handleClick = async () => {
    if (!shouldBeInteractive) return;
    (window as any).__lastSelectedWord = cleanWord;
    // Set hovered word context for voice commands on mobile/tablet
    (window as any).__hoveredWord = cleanWord;
    setHasCountedReview(false);
    // Auto-save on click
    try {
      await VocabularyTrackingService.logEncounter(cleanWord, cleanWord, difficulty);
    } catch {}
    try {
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
    } catch {}
    setShowMobileModal(true);
    
    // Play Charlotte's voice for the word when modal opens (mobile only)
    if (isMobileOrTablet) {
      setTimeout(() => {
        handleHearIt();
      }, 300);
    }
  };

    const handleHearIt = async () => {
      if (isPlaying) return;
      setIsPlaying(true);
      try {
        const { InteractiveWordAudioService } = await import('@/services/InteractiveWordAudioService');
        await InteractiveWordAudioService.hearWord(cleanWord);
      } catch (e) {
        console.error('Mobile HearIt failed', e);
      } finally {
        setIsPlaying(false);
        markReviewedOnce();
      }
    };

    const handleExplain = async () => {
      if (isLoadingWordData) return;
      setIsLoadingWordData(true);
      try {
        const { InteractiveWordAudioService } = await import('@/services/InteractiveWordAudioService');
        await InteractiveWordAudioService.explainWord(cleanWord);
      } catch (e) {
        console.error('Mobile Explain failed', e);
      } finally {
        setIsLoadingWordData(false);
        markReviewedOnce();
      }
    };

    const handleSyllables = async () => {
      try {
        setIsPlaying(true);
        const { InteractiveWordAudioService } = await import('@/services/InteractiveWordAudioService');
        await InteractiveWordAudioService.syllableWord(cleanWord);
        setIsPlaying(false);
      } catch (e) {
        console.error('Mobile Syllables failed', e);
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
        console.warn('addToVocabulary not available', err);
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
            // Enhanced touch handling - single tap opens modal
            e.stopPropagation();
            if (!shouldBeInteractive) return;
            handleClick();
          }}
          onTouchEnd={(e) => {
            // Prevent click on touch devices
            e.preventDefault();
          }}
          onMouseEnter={() => {
            if (!shouldBeInteractive) return;
            (window as any).__hoveredWord = cleanWord;
            
            // Note: Premium hover is now handled by PremiumHoverController
            // This keeps the word context for voice commands only
          }}
          onMouseLeave={() => {
            if ((window as any).__hoveredWord === cleanWord) (window as any).__hoveredWord = '';
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
};
