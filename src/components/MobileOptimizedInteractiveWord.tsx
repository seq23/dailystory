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

  // Voice commands status and hover sequencing (desktop only)
  const [vcStatus, setVcStatus] = useState<'idle' | 'listening' | 'processing'>('idle');
  const hoverTimerRef = useRef<number | null>(null);
  const lastTriggerRef = useRef<number>(0);
  const cancelRef = useRef<boolean>(false);
  const COOLDOWN_MS = 3500;
  const DWELL_MS = 400;

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
  };

    const handleHearIt = async () => {
      if (isPlaying) return;
      setIsPlaying(true);
      try {
        const { SimpleAudioEngine } = await import('@/services/SimpleAudioEngine');
        await SimpleAudioEngine.getInstance().playText({
          text: cleanWord,
          voiceId: 'XB0fDUnXU5powFXDhCwa', // Charlotte
          modelId: 'eleven_turbo_v2_5'
        });
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
        const userLang = props.userInfo?.nativeLanguage || 'en';
        const { data, error } = await supabase.functions.invoke('word-dictionary', {
          body: { word: cleanWord, userLevel: difficulty, userLanguage: userLang }
        });
        const definition: string = (!error && data?.definition) ? data.definition : cleanWord;

        // Language-specific audio: Charlotte for English speakers, native browser speech for others
        if (userLang === 'en') {
          // Use Charlotte's voice for English speakers
          try {
            const { SimpleAudioEngine } = await import('@/services/SimpleAudioEngine');
            await SimpleAudioEngine.getInstance().playText({
              text: definition,
              voiceId: 'XB0fDUnXU5powFXDhCwa', // Charlotte
              modelId: 'eleven_turbo_v2_5'
            });
          } catch (error) {
            console.error('Charlotte TTS failed, falling back to browser speech:', error);
            // Fallback to browser speech for English speakers if Charlotte fails
            if ('speechSynthesis' in window) {
              const utterance = new SpeechSynthesisUtterance(definition);
              utterance.rate = 0.7;
              utterance.pitch = 1.0;
              utterance.volume = 1.0;
              speechSynthesis.speak(utterance);
            }
          }
        } else {
          // Use native browser speech for non-English speakers
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(definition);
            utterance.rate = 0.7;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            utterance.lang = userLang;
            
            const voices = speechSynthesis.getVoices();
            const languageCode = userLang.substring(0, 2);
            const nativeVoice = voices.find(voice => 
              voice.lang.toLowerCase().startsWith(languageCode.toLowerCase())
            );
            if (nativeVoice) utterance.voice = nativeVoice;
            speechSynthesis.speak(utterance);
          }
        }
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
        const raw = PhoneticRulesEngine.getInstance().breakIntoSyllables(cleanWord);
        const toAudioFriendly = (original: string, sylls: string[]) => {
          const w = (original || '').toLowerCase();
          if (w.endsWith('ies') && w.length > 4) return [w.slice(0, -3) + 'y', 's'];
          if (w.endsWith('es') && w.length > 3) return [w.slice(0, -2), 'es'];
          if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) return [w.slice(0, -1), 's'];
          return sylls;
        };
        const adjusted = toAudioFriendly(cleanWord, raw);
        const syllText = adjusted.join(', ');

        const { SimpleAudioEngine } = await import('@/services/SimpleAudioEngine');
        await SimpleAudioEngine.getInstance().playText({
          text: syllText,
          voiceId: 'XB0fDUnXU5powFXDhCwa', // Charlotte
          modelId: 'eleven_turbo_v2_5'
        });
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
            if (isMobileOrTablet) return; // no hover on touch devices
            const now = Date.now();
            if (vcStatus !== 'listening') return;
            if (now - lastTriggerRef.current < COOLDOWN_MS) return;
            if (isPlaying || isLoadingWordData) return;
            cancelRef.current = false;
            if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = window.setTimeout(async () => {
              if (cancelRef.current) return;
              lastTriggerRef.current = Date.now();
              // Enhanced voice command sequence: word + definition
              if (isPlaying || isLoadingWordData) return;
              try {
                // 1) Pronounce word with Charlotte voice
                await audioEngine.playText({ 
                  text: cleanWord,
                  voiceId: 'XB0fDUnXU5powFXDhCwa' // Charlotte
                });
                if (cancelRef.current) return;
                
                // 2) Speak definition with Charlotte voice
                const userLang = props.userInfo?.nativeLanguage || 'en';
                const { data, error } = await supabase.functions.invoke('word-dictionary', {
                  body: { word: cleanWord, userLevel: difficulty, userLanguage: userLang }
                });
                const definition: string = (!error && data?.definition) ? data.definition : `${cleanWord} is a word in this story`;
                await audioEngine.playText({ 
                  text: definition,
                  voiceId: 'XB0fDUnXU5powFXDhCwa' // Charlotte
                });
              } catch (e) {
                console.warn('Voice command sequence failed', e);
              }
            }, DWELL_MS) as unknown as number;
          }}
          onMouseLeave={() => {
            if ((window as any).__hoveredWord === cleanWord) (window as any).__hoveredWord = '';
            cancelRef.current = true;
            if (hoverTimerRef.current) {
              window.clearTimeout(hoverTimerRef.current);
              hoverTimerRef.current = null;
            }
          }}
          className={`${props.className} inline ${shouldBeInteractive ? 'cursor-pointer underline decoration-dotted decoration-2 underline-offset-2 hover:decoration-primary' : ''}`}
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
