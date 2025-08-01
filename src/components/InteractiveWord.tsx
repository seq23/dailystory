import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getPhoneticSpelling } from "@/utils/phoneticDictionary";
import { Volume2, HelpCircle, Languages, BookOpen, Lightbulb, Plus, Crown } from "lucide-react";
import { createOpenAITTSService } from "@/services/textToSpeechService";
import type { UserInfo } from "@/types";

interface InteractiveWordProps {
  word: string;
  className?: string;
  difficulty?: "easy" | "medium" | "hard" | "expert";
  userInfo?: UserInfo; // New prop to adapt behavior
  isPremium?: boolean; // Add premium status
}

export const InteractiveWord = ({ 
  word, 
  className = "", 
  difficulty = "easy",
  userInfo,
  isPremium = false
}: InteractiveWordProps) => {
  const { t, i18n } = useTranslation();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wordExplanation, setWordExplanation] = useState<string>("");
  const [wordTranslation, setWordTranslation] = useState<string>("");
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);
  const [ttsService, setTtsService] = useState<any>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
    offset: number;
  }>({ vertical: 'top', horizontal: 'center', offset: 0 });
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const phoneticSpelling = getPhoneticSpelling(word);

  useEffect(() => {
    // Initialize OpenAI TTS service using the improved service
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
    
    // Calculate optimal position for tooltip with viewport awareness
    if (wordRef.current) {
      const rect = wordRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // More accurate estimates based on actual content
      const baseTooltipHeight = 120; // Base height for content
      const buttonHeight = 40; // Height per button row
      const extraButtons = (isESLLearner ? 1 : 0) + (isPremium ? 1 : 0) + 
                          (isNativeEnglishSpeaker && userInfo?.age && userInfo.age > 12 ? 1 : 0);
      const estimatedTooltipHeight = baseTooltipHeight + (Math.ceil(extraButtons / 2) * buttonHeight);
      const estimatedTooltipWidth = Math.min(340, viewportWidth * 0.9); // Responsive width
      const margin = 20; // Increased safety margin
      
      // Check available space in all directions
      const spaceAbove = rect.top;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceLeft = rect.left;
      const spaceRight = viewportWidth - rect.right;
      const wordCenter = rect.left + rect.width / 2;
      
      // Enhanced vertical position logic with better bottom detection
      let vertical: 'top' | 'bottom' = 'bottom';
      
      // If word is in bottom third of viewport, prefer top positioning
      if (rect.bottom > viewportHeight * 0.67) {
        vertical = 'top';
      } else if (spaceBelow < estimatedTooltipHeight + margin) {
        // Not enough space below, check if top has more space
        if (spaceAbove > spaceBelow && spaceAbove >= estimatedTooltipHeight + margin) {
          vertical = 'top';
        } else {
          // Force top if bottom would definitely clip
          vertical = 'top';
        }
      } else {
        vertical = 'bottom';
      }
      
      // Enhanced horizontal position and offset calculation
      let horizontal: 'left' | 'center' | 'right' = 'center';
      let offset = 0;
      
      // Check if centered tooltip would be cut off
      const tooltipHalfWidth = estimatedTooltipWidth / 2;
      const leftEdgeIfCentered = wordCenter - tooltipHalfWidth;
      const rightEdgeIfCentered = wordCenter + tooltipHalfWidth;
      
      if (leftEdgeIfCentered < margin) {
        // Tooltip would be cut off on the left
        horizontal = 'left';
        offset = Math.max(margin - rect.left, 0);
      } else if (rightEdgeIfCentered > viewportWidth - margin) {
        // Tooltip would be cut off on the right
        horizontal = 'right'; 
        offset = Math.max((rect.right + estimatedTooltipWidth) - (viewportWidth - margin), 0);
      } else {
        // Centered position works fine
        horizontal = 'center';
        offset = 0;
      }
      
      setTooltipPosition({ vertical, horizontal, offset });
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
        const speed = isESLLearner ? 0.7 : 1.0;
        const voice = 'nova'; // Use consistent nova voice
        await ttsService.speakText(word, { speed, voice });
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
      
      // Use OpenAI to get a proper child-friendly definition
      if (isNativeEnglishSpeaker) {
        const response = await fetch('https://cpzeuogomaixamrtnnmj.supabase.co/functions/v1/openai-tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            text: `Define "${cleanWord}" in simple terms for a ${userInfo?.age || 8} year old child`,
            voice: 'nova',
            speed: 0.9
          })
        });
        
        // For now, use a simple but contextual explanation
        const explanation = `"${cleanWord}" means ${
          cleanWord.length <= 3 ? 'something simple and familiar' :
          cleanWord.length <= 6 ? 'something important in the story' :
          'something interesting and meaningful'
        }.`;
        
        setWordExplanation(explanation);
        if (ttsService) {
          await ttsService.speakText(explanation, { voice: 'nova' });
        }
      } else {
        const explanation = `"${cleanWord}" is an English word. It appears in your story and has a special meaning.`;
        setWordExplanation(explanation);
        if (ttsService) {
          await ttsService.speakText(explanation, { voice: 'nova' });
        }
      }
    } catch (error) {
      console.error('Error explaining word:', error);
      const fallbackExplanation = `"${word.replace(/[.,!?;:'"()]/g, '')}" is a word from your story.`;
      setWordExplanation(fallbackExplanation);
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
      // Simple translation placeholder - can be enhanced with translation API
      const languageNames: Record<string, string> = {
        'ar': 'Arabic',
        'es': 'Spanish',
        'zh': 'Chinese',
        'hi': 'Hindi',
        'pt': 'Portuguese',
        'fr': 'French'
      };
      const langName = languageNames[userNativeLanguage] || userNativeLanguage;
      setWordTranslation(`Translation to ${langName} will be available soon!`);
    } catch (error) {
      console.error('Error translating word:', error);
      setWordTranslation(t("interactiveWord.translationError"));
    } finally {
      setIsLoadingTranslation(false);
    }
  };

  const handleAddToVocabulary = () => {
    const cleanWord = word.replace(/[.,!?;:'"()]/g, '');
    if (cleanWord.length < 2) return;

    const vocabularyWord = {
      word: cleanWord,
      definition: wordExplanation || `A word from your story`,
      translation: wordTranslation,
      difficulty: getWordComplexity(cleanWord) as 'beginner' | 'intermediate' | 'advanced',
      dateAdded: new Date(),
      timesReviewed: 0,
      mastered: false,
      storyContext: word
    };

    // Add to global vocabulary collection
    if ((window as any).addToVocabulary) {
      (window as any).addToVocabulary(vocabularyWord);
    }
  };

  // Determine if word should be interactive based on difficulty level and user type
  const shouldBeInteractive = () => {
    const cleanWord = word.toLowerCase().replace(/[.,!?;:'"()]/g, '');
    
    // Never make the user's name interactive
    if (userInfo?.name && cleanWord === userInfo.name.toLowerCase()) {
      return false;
    }
    
    // For easy difficulty, make ALL words interactive (except user's name)
    if (difficulty === "easy") {
      return cleanWord.length > 0;
    }
    
    // For ESL learners, more words are interactive to help with learning
    if (isESLLearner) {
      if (difficulty === "medium") return cleanWord.length > 2;
      return cleanWord.length > 3;
    }
    
    // For native speakers, focus on more complex words
    if (difficulty === "medium") return cleanWord.length > 4;
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
          className="fixed z-[99999] bg-white border border-gray-200 text-gray-900 px-3 py-3 sm:px-4 rounded-lg shadow-2xl text-xs sm:text-sm font-medium backdrop-blur-sm"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={(e) => e.stopPropagation()}
          style={{
            // Fixed positioning based on word location
            ...(tooltipPosition.horizontal === 'left' ? {
              left: `${Math.max(20, wordRef.current?.getBoundingClientRect().left || 0)}px`,
            } : tooltipPosition.horizontal === 'right' ? {
              right: `${Math.max(20, window.innerWidth - (wordRef.current?.getBoundingClientRect().right || window.innerWidth))}px`,
            } : {
              left: `${Math.max(20, Math.min(window.innerWidth - 340, (wordRef.current?.getBoundingClientRect().left || 0) + (wordRef.current?.getBoundingClientRect().width || 0) / 2 - 170))}px`,
            }),
            ...(tooltipPosition.vertical === 'top' ? {
              bottom: `${window.innerHeight - (wordRef.current?.getBoundingClientRect().top || 0) + 8}px`,
            } : {
              top: `${(wordRef.current?.getBoundingClientRect().bottom || 0) + 8}px`,
            }),
            maxWidth: 'min(340px, 90vw)',
            minWidth: 'min(280px, 85vw)',
            width: 'max-content',
            boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(0, 0, 0, 0.1)'
          }}
        >
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
              className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1.5 sm:py-1 rounded transition-colors touch-manipulation min-h-[32px] sm:min-h-auto"
              disabled={isPlaying}
            >
              <Volume2 className="w-3 h-3" />
              {t("interactiveWord.hearIt")}
            </button>
            
            <button
              onClick={handleExplain}
              className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1.5 sm:py-1 rounded transition-colors touch-manipulation min-h-[32px] sm:min-h-auto"
              disabled={isPlaying || isLoadingExplanation}
            >
              <HelpCircle className="w-3 h-3" />
              {isLoadingExplanation ? t("interactiveWord.loading") : t("interactiveWord.explain")}
            </button>

            {/* Translation button for ESL learners only */}
            {isESLLearner && (
              <button
                onClick={handleTranslate}
                className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1.5 sm:py-1 rounded transition-colors touch-manipulation min-h-[32px] sm:min-h-auto"
                disabled={isLoadingTranslation}
              >
                <Languages className="w-3 h-3" />
                {isLoadingTranslation ? t("interactiveWord.loading") : t("interactiveWord.translate")}
              </button>
            )}

            {/* Add to vocabulary button - Premium feature */}
            <div className="relative group">
              <button
                onClick={isPremium ? handleAddToVocabulary : undefined}
                className={`flex items-center gap-1 text-xs px-2 py-1.5 sm:py-1 rounded transition-colors touch-manipulation min-h-[32px] sm:min-h-auto ${
                  isPremium 
                    ? 'bg-purple-100 hover:bg-purple-200 text-purple-700 cursor-pointer' 
                    : 'bg-gray-100 text-gray-500 cursor-not-allowed opacity-60'
                }`}
                disabled={!isPremium}
              >
                {isPremium ? <Plus className="w-3 h-3" /> : <Crown className="w-3 h-3" />}
                {t("interactiveWord.addToVocabulary", "Save Word")}
              </button>
              
              {/* Premium tooltip for free users */}
              {!isPremium && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                  <div className="flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    <span>Premium Feature - Upgrade to save words!</span>
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-purple-600"></div>
                </div>
              )}
            </div>

            {/* Etymology button for advanced native speakers */}
            {isNativeEnglishSpeaker && userInfo?.age && userInfo.age > 12 && (
              <button
                onClick={() => {/* TODO: Implement etymology lookup */}}
                className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1.5 sm:py-1 rounded transition-colors touch-manipulation min-h-[32px] sm:min-h-auto"
              >
                <Lightbulb className="w-3 h-3" />
                {t("interactiveWord.etymology")}
              </button>
            )}
          </div>

          {/* Dynamic arrow positioning */}
          <div 
            className={`absolute w-0 h-0 border-l-4 border-r-4 border-transparent ${
              tooltipPosition.vertical === 'top'
                ? 'top-full border-t-4 border-t-gray-200'
                : 'bottom-full border-b-4 border-b-gray-200'
            }`}
            style={{
              // Position arrow based on horizontal alignment
              ...(tooltipPosition.horizontal === 'left' ? {
                left: '20px'
              } : tooltipPosition.horizontal === 'right' ? {
                right: '20px'
              } : {
                left: '50%',
                transform: 'translateX(-50%)'
              })
            }}
          />
        </div>
      )}
    </span>
  );
};