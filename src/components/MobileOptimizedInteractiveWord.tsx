import { useState, useMemo } from "react";
import { InteractiveWord } from "./InteractiveWord";
import { MobileTTSModal } from "./MobileTTSModal";
import { useIsMobile } from "@/hooks/use-mobile";
import type { UserInfo } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { EnhancedAudioService } from "@/services/enhancedAudioService";
import { VocabularyLevelClassifier } from "@/utils/vocabularyLevelClassifier";
import { getGlobalAddVocabularyWord } from "@/utils/gamificationGlobals";

interface MobileOptimizedInteractiveWordProps {
  word: string;
  className?: string;
  difficulty?: "beginner" | "easy" | "medium" | "hard" | "expert";
  userInfo?: UserInfo;
  isPremium?: boolean;
  sentenceContext?: string;
  userId?: string;
  forceModal?: boolean;
}

export const MobileOptimizedInteractiveWord = (props: MobileOptimizedInteractiveWordProps) => {
  const { isMobileOrTablet } = useIsMobile();
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingWordData, setIsLoadingWordData] = useState(false);
  const audioService = useMemo(() => new EnhancedAudioService(), []);

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
    const handleClick = () => {
      if (!shouldBeInteractive) return;
      setShowMobileModal(true);
    };

    const handleHearIt = async () => {
      if (isPlaying) return;
      setIsPlaying(true);
      try {
        const response = await fetch('https://cpzeuogomaixamrtnnmj.supabase.co/functions/v1/elevenlabs-tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: cleanWord, voice: "XB0fDUnXU5powFXDhCwa", model: 'eleven_turbo_v2' })
        });
        if (!response.ok) throw new Error('TTS failed');
        const audioBlob = await response.blob();
        const url = URL.createObjectURL(audioBlob);
        const audio = new Audio(url);
        audio.onended = () => { setIsPlaying(false); URL.revokeObjectURL(url); };
        audio.onerror = () => setIsPlaying(false);
        await audio.play();
      } catch (e) {
        console.error('Mobile HearIt failed', e);
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

        const response = await fetch('https://cpzeuogomaixamrtnnmj.supabase.co/functions/v1/elevenlabs-tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: definition, voice: "XB0fDUnXU5powFXDhCwa", model: 'eleven_multilingual_v2' })
        });
        if (response.ok) {
          const audioBlob = await response.blob();
          const url = URL.createObjectURL(audioBlob);
          const audio = new Audio(url);
          audio.onended = () => { URL.revokeObjectURL(url); };
          await audio.play();
        }
      } catch (e) {
        console.error('Mobile Explain failed', e);
      } finally {
        setIsLoadingWordData(false);
      }
    };

    const handleSyllables = async () => {
      if (!props.userInfo) return;
      try {
        await audioService.playPhoneticBreakdown({ word: cleanWord, userInfo: props.userInfo });
      } catch (e) {
        console.error('Mobile Syllables failed', e);
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
        reviewStatus: 'new',
        context: props.sentenceContext || '',
        addedAt: new Date().toISOString(),
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
        />
      </>
    );
  }

  // For desktop, use the original InteractiveWord component
  return <InteractiveWord {...props} />;
};
