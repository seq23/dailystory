import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getPhoneticSpelling } from "@/utils/phoneticDictionary";
import { Volume2, HelpCircle, Languages, BookOpen, Lightbulb, Plus, Crown } from "lucide-react";
import { createOpenAITTSService } from "@/services/textToSpeechService";
import { useToast } from "@/hooks/use-toast";
import { contextualPronunciation } from "@/services/contextualPronunciation";
import type { UserInfo } from "@/types";

interface InteractiveWordProps {
  word: string;
  className?: string;
  difficulty?: "easy" | "medium" | "hard" | "expert";
  userInfo?: UserInfo;
  isPremium?: boolean;
  sentenceContext?: string;
}

export const InteractiveWord = ({ 
  word, 
  className = "", 
  difficulty = "easy",
  userInfo,
  isPremium = false,
  sentenceContext = ""
}: InteractiveWordProps) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wordData, setWordData] = useState<any>(null);
  const [isLoadingWordData, setIsLoadingWordData] = useState(false);
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
        // Get context-aware pronunciation
        const cleanWord = word.replace(/[.,!?;:'"()]/g, '');
        const fullContext = sentenceContext || `The word ${cleanWord} in context`;
        const pronunciationInfo = contextualPronunciation.getWordPronunciation(cleanWord, fullContext);
        
        // Use context-aware pronunciation if available
        const textToSpeak = pronunciationInfo.isContextAware 
          ? `${cleanWord}, pronounced as ${pronunciationInfo.pronunciation}`
          : cleanWord;
        
        const speed = isESLLearner ? 0.7 : 1.0;
        await ttsService.speakText(textToSpeak, { speed });
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
    if (isPlaying || isLoadingWordData) return;
    
    setIsLoadingWordData(true);
    try {
      if (ttsService) {
        // Get comprehensive word data and speak it
        const userLevel = difficulty === 'easy' ? 'easy' : difficulty === 'medium' ? 'medium' : 'hard';
        await ttsService.explainWord(word, userLevel);
        
        // Also get the word data for display
        const data = await ttsService.getWordData(word, userLevel);
        setWordData(data);
      }
    } catch (error) {
      console.error('Error explaining word:', error);
    } finally {
      setIsLoadingWordData(false);
    }
  };

  // Enhanced word definition with context awareness
  const getWordDefinition = (word: string, context: string) => {
    const cleanWord = word.toLowerCase().replace(/[.,!?;:'"()]/g, '');
    
    // Comprehensive word definitions for children
    const definitions: Record<string, string> = {
      // Common verbs
      'inventing': 'creating or making something new that has never existed before',
      'exploring': 'going to new places or trying to discover new things',
      'discovering': 'finding something for the first time',
      'creating': 'making something new',
      'building': 'putting things together to make something',
      'painting': 'using colors and brushes to make pictures',
      'singing': 'making music with your voice',
      'dancing': 'moving your body to music',
      'playing': 'having fun with games or toys',
      'running': 'moving very fast on your feet',
      'jumping': 'pushing yourself up into the air',
      'swimming': 'moving through water',
      'flying': 'moving through the air',
      'reading': 'looking at words and understanding what they mean',
      'writing': 'making letters and words on paper',
      'drawing': 'making pictures with pencils or crayons',
      
      // Animals
      'elephant': 'a very big gray animal with a long nose called a trunk',
      'giraffe': 'a tall animal with a very long neck and spots',
      'lion': 'a big cat that lives in Africa and has a mane',
      'tiger': 'a big orange cat with black stripes',
      'bear': 'a big furry animal that likes honey',
      'monkey': 'an animal that swings from trees and likes bananas',
      'bird': 'an animal that has wings and can fly',
      'fish': 'an animal that lives in water and has fins',
      'dog': 'a friendly animal that people keep as pets',
      'cat': 'a small furry animal that says meow',
      
      // Objects
      'castle': 'a big stone building where kings and queens live',
      'treasure': 'gold, silver, and jewels that are very valuable',
      'ship': 'a big boat that can travel across the ocean',
      'car': 'a vehicle with four wheels that people drive',
      'airplane': 'a flying machine that takes people to faraway places',
      'house': 'a building where people live',
      'school': 'a place where children go to learn',
      'park': 'a place with grass and trees where people can play',
      'forest': 'a place with lots of trees',
      'mountain': 'a very tall hill',
      'ocean': 'a very big body of water',
      'river': 'water that flows from one place to another',
      
      // Colors and descriptions
      'magical': 'special and wonderful, like in fairy tales',
      'beautiful': 'very pretty and nice to look at',
      'brave': 'not afraid to do something scary',
      'kind': 'nice and caring to others',
      'smart': 'very good at learning and thinking',
      'funny': 'making people laugh',
      'happy': 'feeling good and cheerful',
      'excited': 'feeling very happy about something',
      'surprised': 'feeling amazed when something unexpected happens',
      'proud': 'feeling good about something you did well'
    };

    // Check if we have a specific definition
    if (definitions[cleanWord]) {
      return definitions[cleanWord];
    }

    // Context-aware definitions for compound words
    const contextualDefinitions: Record<string, Record<string, string>> = {
      'skied': {
        'green skied': 'having a sky that is green in color',
        'blue skied': 'having a sky that is blue in color', 
        'clear skied': 'having a clear, cloudless sky'
      }
    };

    if (contextualDefinitions[cleanWord]) {
      for (const [contextKey, definition] of Object.entries(contextualDefinitions[cleanWord])) {
        if (context.toLowerCase().includes(contextKey)) {
          return definition;
        }
      }
    }

    // Age-appropriate fallback
    return getAgeAppropriateDefinition(cleanWord);
  };

  const getAgeAppropriateDefinition = (word: string) => {
    // For words we don't have specific definitions for, provide helpful context
    if (word.length <= 3) {
      return `a small word that helps make your story interesting`;
    } else if (word.length <= 6) {
      return `an important word that adds meaning to your story`;
    } else {
      return `a longer word that makes your story more detailed and exciting`;
    }
  };

  const handleTranslate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoadingWordData || isNativeEnglishSpeaker) return;
    
    setIsLoadingWordData(true);
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
      // For now, just get word data since translation will be added later
      if (ttsService) {
        const data = await ttsService.getWordData(cleanWord, difficulty as 'easy' | 'medium' | 'hard');
        setWordData(data);
      }
    } catch (error) {
      console.error('Error translating word:', error);
    } finally {
      setIsLoadingWordData(false);
    }
  };

  const handleAddToVocabulary = () => {
    const cleanWord = word.replace(/[.,!?;:'"()]/g, '');
    if (cleanWord.length < 2) return;

    const vocabularyWord = {
      word: cleanWord,
      definition: wordData?.definition || `A word from your story`,
      phonetic: wordData?.phonetic || '',
      sampleSentence: wordData?.sampleSentence || word,
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

    // Track for gamification
    if ((window as any).addVocabularyWord) {
      (window as any).addVocabularyWord();
    }

    toast({
      title: "Word Saved! 📝",
      description: `"${cleanWord}" has been added to your vocabulary collection.`,
      duration: 3000,
    });
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
          className="fixed z-[99999] bg-white border border-gray-200 text-gray-900 px-4 py-4 sm:px-6 sm:py-5 rounded-xl shadow-2xl text-sm sm:text-base font-medium backdrop-blur-sm"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={(e) => e.stopPropagation()}
          style={{
            // Fixed positioning based on word location - made larger for kids
            ...(tooltipPosition.horizontal === 'left' ? {
              left: `${Math.max(20, wordRef.current?.getBoundingClientRect().left || 0)}px`,
            } : tooltipPosition.horizontal === 'right' ? {
              right: `${Math.max(20, window.innerWidth - (wordRef.current?.getBoundingClientRect().right || window.innerWidth))}px`,
            } : {
              left: `${Math.max(20, Math.min(window.innerWidth - 400, (wordRef.current?.getBoundingClientRect().left || 0) + (wordRef.current?.getBoundingClientRect().width || 0) / 2 - 200))}px`,
            }),
            ...(tooltipPosition.vertical === 'top' ? {
              bottom: `${window.innerHeight - (wordRef.current?.getBoundingClientRect().top || 0) + 12}px`,
            } : {
              top: `${(wordRef.current?.getBoundingClientRect().bottom || 0) + 12}px`,
            }),
            maxWidth: 'min(400px, 92vw)',
            minWidth: 'min(320px, 88vw)',
            width: 'max-content',
            boxShadow: '0 15px 50px -15px rgba(0, 0, 0, 0.4)',
            border: '2px solid rgba(0, 0, 0, 0.1)'
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
          {wordData && (
            <div className="mb-2 text-xs">
              <div className="font-semibold text-blue-600 mb-1">{wordData.phonetic}</div>
              <div className="text-gray-600 mb-1">{wordData.definition}</div>
              <div className="text-gray-500 italic">"{wordData.sampleSentence}"</div>
            </div>
          )}
          
          {/* Action buttons - larger and more spaced for kids */}
          <div className="grid grid-cols-2 gap-3 mb-2">
            <button
              onClick={handlePronounce}
              className="flex items-center justify-center gap-2 text-sm bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 px-4 py-3 rounded-lg transition-colors touch-manipulation min-h-[48px] font-semibold text-blue-700 shadow-sm"
              disabled={isPlaying}
            >
              <Volume2 className="w-4 h-4" />
              {t("interactiveWord.hearIt")}
            </button>
            
            <button
              onClick={handleExplain}
              className="flex items-center justify-center gap-2 text-sm bg-green-50 hover:bg-green-100 border-2 border-green-200 px-4 py-3 rounded-lg transition-colors touch-manipulation min-h-[48px] font-semibold text-green-700 shadow-sm"
              disabled={isPlaying || isLoadingWordData}
            >
              <HelpCircle className="w-4 h-4" />
              {isLoadingWordData ? t("interactiveWord.loading") : t("interactiveWord.explain")}
            </button>
          </div>

          {/* Secondary buttons row */}
          <div className="flex items-center gap-2 flex-wrap">{/* ESL Translation and other buttons continue here */}

            {/* Translation button for ESL learners only */}
            {isESLLearner && (
              <button
                onClick={handleTranslate}
                className="flex items-center gap-1 text-xs bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-2 rounded-md transition-colors touch-manipulation min-h-[36px] font-medium text-purple-700"
                disabled={isLoadingWordData}
              >
                <Languages className="w-3 h-3" />
                {isLoadingWordData ? t("interactiveWord.loading") : t("interactiveWord.translate")}
              </button>
            )}

            {/* Add to vocabulary button - Premium feature */}
            <div className="relative group">
              <button
                onClick={isPremium ? handleAddToVocabulary : undefined}
                className={`flex items-center gap-1 text-xs px-3 py-2 rounded-md transition-colors touch-manipulation min-h-[36px] font-medium ${
                  isPremium 
                    ? 'bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 text-yellow-700 cursor-pointer' 
                    : 'bg-gray-100 text-gray-500 cursor-not-allowed opacity-60 border border-gray-200'
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
                className="flex items-center gap-1 text-xs bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-2 rounded-md transition-colors touch-manipulation min-h-[36px] font-medium text-indigo-700"
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