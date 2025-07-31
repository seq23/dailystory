import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getPhoneticSpelling } from "@/utils/phoneticDictionary";
import { Volume2, HelpCircle, Languages, BookOpen, Lightbulb } from "lucide-react";
import { createOpenAITTSService } from "@/services/textToSpeechService";
import type { UserInfo } from "./UserInfoForm";

interface InteractiveWordProps {
  word: string;
  className?: string;
  difficulty?: "easy" | "medium" | "hard" | "expert";
  userInfo?: UserInfo; // New prop to adapt behavior
}

export const InteractiveWord = ({ 
  word, 
  className = "", 
  difficulty = "easy",
  userInfo 
}: InteractiveWordProps) => {
  const { t, i18n } = useTranslation();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wordExplanation, setWordExplanation] = useState<string>("");
  const [wordTranslation, setWordTranslation] = useState<string>("");
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);
  const [ttsService, setTtsService] = useState<any>(null);
  const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom'>('top');
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const phoneticSpelling = getPhoneticSpelling(word);

  useEffect(() => {
    // Initialize OpenAI TTS service
    const service = createOpenAITTSService();
    setTtsService(service);
  }, []);

  // Determine if user is a native English speaker
  const isNativeEnglishSpeaker = userInfo?.nativeLanguage === "en";
  const isESLLearner = userInfo?.nativeLanguage !== "en";
  const userNativeLanguage = userInfo?.nativeLanguage || "en";

  // Determine word difficulty level for visual indicators
  const getWordComplexity = (word: string) => {
    const cleanWord = word.toLowerCase().replace(/[.,!?;:'"()]/g, '');
    if (cleanWord.length <= 4) return "beginner";
    if (cleanWord.length <= 7) return "intermediate";
    return "advanced";
  };

  const wordComplexity = getWordComplexity(word);

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    
    // Calculate optimal position for tooltip
    if (wordRef.current) {
      const rect = wordRef.current.getBoundingClientRect();
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;
      
      // If there's less than 200px above or we're in the top 20% of viewport, show below
      if (spaceAbove < 200 || rect.top < window.innerHeight * 0.2) {
        setTooltipPosition('bottom');
      } else {
        setTooltipPosition('top');
      }
    }
    
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 200); // 200ms delay before hiding
  };

  const handlePronounce = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) return;
    
    setIsPlaying(true);
    try {
      if (ttsService) {
        // For ESL learners, use slower pronunciation
        const speed = isESLLearner ? 0.7 : 0.9;
        await ttsService.speakText(word, { speed });
      } else {
        // Fallback to browser speech synthesis
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(word.replace(/[.,!?;:'"()]/g, ''));
          utterance.rate = isESLLearner ? 0.6 : 0.7;
          utterance.pitch = 1.2;
          speechSynthesis.speak(utterance);
        }
      }
    } catch (error) {
      console.error('Error pronouncing word:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleExplain = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying || isLoadingExplanation) return;
    
    setIsLoadingExplanation(true);
    try {
      const cleanWord = word.replace(/[.,!?;:'"()]/g, '');
      
      if (ttsService) {
        if (isNativeEnglishSpeaker) {
          // For native speakers: age-appropriate English explanation
          const explanation = await getEnglishWordExplanation(cleanWord, userInfo);
          setWordExplanation(explanation);
          await ttsService.speakText(explanation);
        } else {
          // For ESL learners: explanation in native language
          const explanation = await getTranslatedWordExplanation(cleanWord, userNativeLanguage);
          setWordExplanation(explanation);
          await ttsService.speakText(explanation);
        }
      }
    } catch (error) {
      console.error('Error explaining word:', error);
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  const handleTranslate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoadingTranslation || isNativeEnglishSpeaker) return;
    
    setIsLoadingTranslation(true);
    try {
      const cleanWord = word.replace(/[.,!?;:'"()]/g, '');
      const translation = await getWordTranslation(cleanWord, userNativeLanguage);
      setWordTranslation(translation);
    } catch (error) {
      console.error('Error translating word:', error);
      setWordTranslation(t("interactiveWord.translationError"));
    } finally {
      setIsLoadingTranslation(false);
    }
  };

  // Enhanced word explanation for native English speakers
  const getEnglishWordExplanation = async (word: string, userInfo?: UserInfo): Promise<string> => {
    if (!ttsService) throw new Error('TTS service not available');
    
    const prompt = `Define "${word}" for a ${userInfo?.age || 8}-year-old native English speaker. Include:
    1. Simple definition
    2. Example in a sentence
    ${userInfo?.age && userInfo.age > 10 ? '3. One synonym' : ''}
    Keep it under 30 words total.`;

    return await ttsService.getAIResponse(prompt);
  };

  // Translated explanation for ESL learners
  const getTranslatedWordExplanation = async (word: string, targetLanguage: string): Promise<string> => {
    if (!ttsService) throw new Error('TTS service not available');
    
    const languageNames = {
      'ar': 'Arabic',
      'es': 'Spanish', 
      'zh': 'Chinese',
      'hi': 'Hindi',
      'pt': 'Portuguese',
      'fr': 'French'
    };

    const langName = languageNames[targetLanguage as keyof typeof languageNames] || targetLanguage;
    
    const prompt = `Explain the English word "${word}" in ${langName} for a language learner. Include:
    1. Translation in ${langName}
    2. Simple explanation in ${langName}
    3. Example sentence using the word in English with ${langName} context
    Keep it concise and educational.`;

    return await ttsService.getAIResponse(prompt);
  };

  // Word translation for ESL learners
  const getWordTranslation = async (word: string, targetLanguage: string): Promise<string> => {
    if (!ttsService) throw new Error('TTS service not available');
    
    const languageNames = {
      'ar': 'Arabic',
      'es': 'Spanish',
      'zh': 'Chinese', 
      'hi': 'Hindi',
      'pt': 'Portuguese',
      'fr': 'French'
    };

    const langName = languageNames[targetLanguage as keyof typeof languageNames] || targetLanguage;
    
    const prompt = `Translate the English word "${word}" to ${langName}. Give only the most common translation, no explanation.`;

    return await ttsService.getAIResponse(prompt);
  };

  // Determine if word should be interactive based on difficulty level and user type
  const shouldBeInteractive = () => {
    const cleanWord = word.toLowerCase().replace(/[.,!?;:'"()]/g, '');
    
    // For ESL learners, more words are interactive to help with learning
    if (isESLLearner) {
      if (difficulty === "easy") return cleanWord.length > 2;
      return cleanWord.length > 3;
    }
    
    // For native speakers, focus on more complex words
    if (difficulty === "easy") return cleanWord.length > 4;
    return cleanWord.length > 4;
  };

  if (!shouldBeInteractive()) {
    return <span className={className}>{word}</span>;
  }

  // Visual indicators for word complexity
  const getWordIndicatorColor = () => {
    switch (wordComplexity) {
      case "beginner": return "decoration-green-400";
      case "intermediate": return "decoration-yellow-400";  
      case "advanced": return "decoration-red-400";
      default: return "decoration-primary/30";
    }
  };

  return (
    <span
      ref={wordRef}
      className={`relative inline-block cursor-pointer ${className} ${isPlaying ? 'opacity-70' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className={`underline decoration-dotted hover:decoration-solid transition-all ${getWordIndicatorColor()}`}>
        {word}
      </span>
      
      {/* Complexity indicator for advanced users */}
      {userInfo?.age && userInfo.age > 10 && (
        <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
          wordComplexity === "beginner" ? "bg-green-400" :
          wordComplexity === "intermediate" ? "bg-yellow-400" : "bg-red-400"
        }`} />
      )}
      
      {showTooltip && (
        <div 
          className={`fixed z-[9999] ${
            tooltipPosition === 'top' 
              ? 'bottom-full mb-2' 
              : 'top-full mt-2'
          }`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: 'min(320px, 85vw)',
            minWidth: '280px'
          }}
        >
          <div className="bg-white border border-gray-200 text-gray-900 px-4 py-3 rounded-lg shadow-2xl text-sm font-medium backdrop-blur-sm w-full"
               style={{ 
                 boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.3)',
                 border: '1px solid rgba(0, 0, 0, 0.1)'
               }}>
            {/* Phonetic spelling */}
            {phoneticSpelling && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-500">"{phoneticSpelling}"</span>
                {userInfo?.age && userInfo.age > 8 && (
                  <span className="text-xs bg-gray-100 px-1 rounded">
                    {t(`interactiveWord.difficulty.${wordComplexity}`)}
                  </span>
                )}
              </div>
            )}

            {/* Word explanation or translation */}
            {(wordExplanation || wordTranslation) && (
              <div className="mb-2 text-xs">
                {wordTranslation && (
                  <div className="font-semibold text-blue-600 mb-1">{wordTranslation}</div>
                )}
                {wordExplanation && (
                  <div className="text-gray-600">{wordExplanation}</div>
                )}
              </div>
            )}
            
            {/* Action buttons */}
            <div className="flex items-center gap-1 flex-wrap">
              <button
                onClick={handlePronounce}
                className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                disabled={isPlaying}
              >
                <Volume2 className="w-3 h-3" />
                {t("interactiveWord.hearIt")}
              </button>
              
              <button
                onClick={handleExplain}
                className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                disabled={isPlaying || isLoadingExplanation}
              >
                <HelpCircle className="w-3 h-3" />
                {isLoadingExplanation ? t("interactiveWord.loading") : t("interactiveWord.explain")}
              </button>

              {/* Translation button for ESL learners only */}
              {isESLLearner && (
                <button
                  onClick={handleTranslate}
                  className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                  disabled={isLoadingTranslation}
                >
                  <Languages className="w-3 h-3" />
                  {isLoadingTranslation ? t("interactiveWord.loading") : t("interactiveWord.translate")}
                </button>
              )}

              {/* Etymology button for advanced native speakers */}
              {isNativeEnglishSpeaker && userInfo?.age && userInfo.age > 12 && (
                <button
                  onClick={() => {/* TODO: Implement etymology lookup */}}
                  className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                >
                  <Lightbulb className="w-3 h-3" />
                  {t("interactiveWord.etymology")}
                </button>
              )}
            </div>
          </div>
          {/* Dynamic arrow positioning */}
          <div 
            className={`absolute left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-transparent ${
              tooltipPosition === 'top'
                ? 'top-full border-t-4 border-t-gray-200'
                : 'bottom-full border-b-4 border-b-gray-200'
            }`}
          ></div>
        </div>
      )}
    </span>
  );
};