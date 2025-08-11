import { useState, useMemo } from "react";
import { InteractiveWord } from "./InteractiveWord";
import { MobileTTSModal } from "./MobileTTSModal";
import { useIsMobile } from "@/hooks/use-mobile";
import type { UserInfo } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { PhoneticRulesEngine } from "@/services/phoneticRulesEngine";
import { EnhancedAudioService } from "@/services/enhancedAudioService";
import { VocabularyLevelClassifier } from "@/utils/vocabularyLevelClassifier";
import { getGlobalAddVocabularyWord } from "@/utils/gamificationGlobals";
import { VocabularyTrackingService } from "@/services/vocabularyTrackingService";

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
  const [enhancedAudio] = useState(() => new EnhancedAudioService());
  // unified TTS via ElevenLabs edge function; no local audio service needed

  const difficulty = props.difficulty || "easy";
  const cleanWord = useMemo(() => props.word.replace(/[.,!?;:'"()]/g, ''), [props.word]);

  // Level rules: 0-1 (beginner/easy) underline all; 2-4 (medium/hard/expert) only significant words
  const shouldBeInteractive = useMemo(() => {
    const lw = cleanWord.toLowerCase();
    if (props.userInfo?.name && lw === props.userInfo.name.toLowerCase()) return false;
    if (difficulty === "beginner" || difficulty === "easy") return lw.length > 0;
    const { shouldHighlight } = VocabularyLevelClassifier.getWordDifficulty(props.word, difficulty);
    return shouldHighlight;
  }, [cleanWord, props.userInfo?.name, difficulty, props.word]);

  // For mobile devices, use click-to-open modal instead of hover
  if (props.forceModal || isMobileOrTablet) {
    const handleClick = async () => {
      if (!shouldBeInteractive) return;
      (window as any).__lastSelectedWord = cleanWord;
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
        await enhancedAudio.playText({
          text: cleanWord,
          difficulty: 'easy',
          userInfo: props.userInfo!,
          isPremium: !!props.isPremium,
          enableHighlighting: false,
        });
      } catch (e) {
        console.error('Mobile HearIt failed', e);
      } finally {
        setIsPlaying(false);
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

        await enhancedAudio.playText({
          text: definition,
          difficulty: 'easy',
          userInfo: props.userInfo!,
          isPremium: !!props.isPremium,
          enableHighlighting: false,
        });
      } catch (e) {
        console.error('Mobile Explain failed', e);
      } finally {
        setIsLoadingWordData(false);
      }
    };

    const handleSyllables = async () => {
      try {
        setIsPlaying(true);
        const raw = await PhoneticRulesEngine.getInstance().breakIntoSyllablesAsync(cleanWord);
        const toAudioFriendly = (original: string, sylls: string[]) => {
          const w = (original || '').toLowerCase();
          if (w.endsWith('ies') && w.length > 4) return [w.slice(0, -3) + 'y', 's'];
          if (w.endsWith('es') && w.length > 3) return [w.slice(0, -2), 'es'];
          if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) return [w.slice(0, -1), 's'];
          return sylls;
        };
        const adjusted = toAudioFriendly(cleanWord, raw);
        const syllText = adjusted.join(', ');

        await enhancedAudio.playText({
          text: syllText,
          difficulty: 'easy',
          userInfo: props.userInfo!,
          isPremium: !!props.isPremium,
          enableHighlighting: false,
        });
        setIsPlaying(false);
      } catch (e) {
        console.error('Mobile Syllables failed', e);
        setIsPlaying(false);
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
    };

    return (
      <>
        <span
          onClick={handleClick}
          onMouseEnter={() => { if (shouldBeInteractive) (window as any).__hoveredWord = cleanWord; }}
          onMouseLeave={() => { if ((window as any).__hoveredWord === cleanWord) (window as any).__hoveredWord = ''; }}
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
