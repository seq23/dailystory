import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Volume2, HelpCircle, Languages, BookOpen, Lightbulb, Plus, Crown, Layers } from 'lucide-react';
import { SimpleAudioEngine } from '@/services/SimpleAudioEngine';
import { PhoneticRulesEngine } from '@/services/phoneticRulesEngine';
import { useToast } from '@/hooks/use-toast';
import { contextualPronunciation } from '@/services/contextualPronunciation';
import { supabase } from '@/integrations/supabase/client';
import { VocabularyLevelClassifier } from '@/utils/vocabularyLevelClassifier';
import { useIsMobile } from '@/hooks/use-mobile';
import { getGlobalAddVocabularyWord } from '@/utils/gamificationGlobals';
import { cn } from '@/lib/utils';
import type { UserInfo } from '@/types';
import { VocabularyTrackingService } from '@/services/vocabularyTrackingService';

interface InteractiveWordProps {
  word: string;
  className?: string;
  difficulty?: "beginner" | "easy" | "medium" | "hard" | "expert";
  userInfo?: UserInfo;
  isPremium?: boolean;
  sentenceContext?: string;
  onClick?: () => void;
  userId?: string;
}

export const InteractiveWord = ({ 
  word, 
  className = "", 
  difficulty = "easy",
  userInfo,
  isPremium = false,
  sentenceContext = "",
  onClick,
  userId
}: InteractiveWordProps) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { isMobileOrTablet, isCapacitor } = useIsMobile();
  
  // Enhanced mobile/tablet word highlighting support
  const getAddVocabularyWord = () => {
    return getGlobalAddVocabularyWord() || (() => {
      console.warn('⚠️ Global addVocabularyWord not available - gamification may not be set up');
    });
  };
  
  const userLanguageT = useCallback((key: string, fallback: string) => {
    if (userInfo?.nativeLanguage && userInfo.nativeLanguage !== 'en') {
      try {
        const translation = i18n.t(key, { lng: userInfo.nativeLanguage });
        if (translation && translation !== key && translation !== fallback) {
          return translation;
        }
        
        const manualTranslations: Record<string, Record<string, string>> = {
          'zh': {
            'interactiveWord.hearIt': '听一听',
            'interactiveWord.explain': '解释', 
            'interactiveWord.translate': '翻译',
            'interactiveWord.addToVocabulary': '保存单词'
          },
          'ar': {
            'interactiveWord.hearIt': 'استمع إليها',
            'interactiveWord.explain': 'اشرح',
            'interactiveWord.translate': 'ترجم', 
            'interactiveWord.addToVocabulary': 'احفظ الكلمة'
          },
          'hi': {
            'interactiveWord.hearIt': 'सुनें',
            'interactiveWord.explain': 'समझाएं',
            'interactiveWord.translate': 'अनुवाद करें',
            'interactiveWord.addToVocabulary': 'शब्द सहेजें'
          },
          'pt': {
            'interactiveWord.hearIt': 'Ouvir',
            'interactiveWord.explain': 'Explicar',
            'interactiveWord.translate': 'Traduzir',
            'interactiveWord.addToVocabulary': 'Salvar palavra'
          }
        };
        
        const manualTranslation = manualTranslations[userInfo.nativeLanguage]?.[key];
        if (manualTranslation) {
          return manualTranslation;
        }
      } catch (error) {
        console.error('❌ Translation error:', error);
      }
    }
    
    return fallback;
  }, [userInfo?.nativeLanguage, i18n, t]);

  const [showTooltip, setShowTooltip] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wordData, setWordData] = useState<any>(null);
  const [isLoadingWordData, setIsLoadingWordData] = useState(false);
  const audioEngine = SimpleAudioEngine.getInstance();
  const [isPlayingPhonetics, setIsPlayingPhonetics] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
    offset: number;
  }>({ vertical: 'top', horizontal: 'center', offset: 0 });
  
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const phoneticEngine = PhoneticRulesEngine.getInstance();
  const phoneticSpelling = phoneticEngine.breakIntoSyllables(word).join('-');
  const cleanWord = word.replace(/[.,!?;:'"()]/g, '').trim();
  const { isMobile } = useIsMobile();
  const reviewCountedRef = useRef(false);

  const isNativeEnglishSpeaker = userInfo?.nativeLanguage === "en";
  const isESLLearner = userInfo?.nativeLanguage !== "en";
  const userNativeLanguage = userInfo?.nativeLanguage || "en";

  const wordDifficulty = VocabularyLevelClassifier.getWordDifficulty(word, difficulty);
  const shouldHighlight = wordDifficulty.shouldHighlight;
  const wordComplexity = wordDifficulty.complexity;

  const getVoiceForUser = (userInfo?: UserInfo) => {
    return "XB0fDUnXU5powFXDhCwa"; // Charlotte
  };

  // Enhanced mobile/tablet interaction handling
  const handleInteraction = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Set global variables for compatibility
    (window as any).__hoveredWord = cleanWord;
    (window as any).__lastSelectedWord = cleanWord;
    reviewCountedRef.current = false;
    
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    
    // Calculate optimal position for tooltip with enhanced mobile support
    if (wordRef.current) {
      const rect = wordRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      const baseTooltipHeight = 120;
      const buttonHeight = 40;
      const extraButtons = (isESLLearner ? 1 : 0) + (isPremium ? 1 : 0) + 
                          (isNativeEnglishSpeaker && userInfo?.age && userInfo.age > 12 ? 1 : 0);
      const estimatedTooltipHeight = baseTooltipHeight + (Math.ceil(extraButtons / 2) * buttonHeight);
      const estimatedTooltipWidth = Math.min(340, viewportWidth * 0.9);
      const margin = isMobileOrTablet ? 10 : 20;
      
      let vertical: 'top' | 'bottom' = 'bottom';
      let horizontal: 'left' | 'center' | 'right' = 'center';
      let offset = 0;
      
      // Enhanced mobile positioning
      if (isMobileOrTablet) {
        // For mobile, prefer center positioning and adjust based on screen position
        if (rect.bottom > viewportHeight * 0.6) {
          vertical = 'top';
        }
        horizontal = 'center';
      } else {
        // Desktop positioning logic
        const spaceAbove = rect.top;
        const spaceBelow = viewportHeight - rect.bottom;
        const wordCenter = rect.left + rect.width / 2;
        
        if (rect.bottom > viewportHeight * 0.67) {
          vertical = 'top';
        } else if (spaceBelow < estimatedTooltipHeight + margin) {
          if (spaceAbove > spaceBelow && spaceAbove >= estimatedTooltipHeight + margin) {
            vertical = 'top';
          } else {
            vertical = 'top';
          }
        }
        
        const tooltipHalfWidth = estimatedTooltipWidth / 2;
        const leftEdgeIfCentered = wordCenter - tooltipHalfWidth;
        const rightEdgeIfCentered = wordCenter + tooltipHalfWidth;
        
        if (leftEdgeIfCentered < margin) {
          horizontal = 'left';
          offset = Math.max(margin - rect.left, 0);
        } else if (rightEdgeIfCentered > viewportWidth - margin) {
          horizontal = 'right'; 
          offset = Math.max((rect.right + estimatedTooltipWidth) - (viewportWidth - margin), 0);
        }
      }
      
      setTooltipPosition({ vertical, horizontal, offset });
    }
    
    setShowTooltip(true);
  }, [cleanWord, isESLLearner, isPremium, isNativeEnglishSpeaker, userInfo?.age, isMobileOrTablet]);

  const handleMouseEnter = () => {
    if (!isMobileOrTablet) {
      handleInteraction({} as React.MouseEvent);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobileOrTablet) {
      (window as any).__hoveredWord = undefined;
      hideTimeoutRef.current = setTimeout(() => {
        setShowTooltip(false);
      }, 200);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isMobileOrTablet) {
      handleInteraction(e);
    }
  };

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isMobileOrTablet && !showTooltip) {
      handleInteraction(e);
    } else if (!isMobileOrTablet) {
      onClick?.();
    }
  };

  const handlePronounce = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      const cleanWordOnly = word.replace(/[.,!?;:'"()]/g, '').trim();
      const processedWord = contextualPronunciation.processTextForPronunciation(cleanWordOnly, false);
      await audioEngine.playText({
        text: processedWord,
        voiceId: 'XB0fDUnXU5powFXDhCwa', // Charlotte
        contentHash: processedWord
      });
    } catch (error) {
      console.error('Error pronouncing word:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleExplain = async (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (isPlaying || isLoadingWordData) return;
    
    console.log('🔍 EXPLAIN CLICKED - Enhanced mobile support:', {
      word,
      isMobileOrTablet,
      touchEvent: 'type' in e && e.type === 'touchstart',
      userNativeLanguage
    });
    
    try {
      const addVocabularyWord = getAddVocabularyWord();
      addVocabularyWord();
    } catch (error) {
      console.error('❌ Failed to track vocabulary word:', error);
    }

    try {
      if (!reviewCountedRef.current) {
        (window as any).markWordReviewed?.(cleanWord);
        reviewCountedRef.current = true;
      }
    } catch {}
    
    setIsLoadingWordData(true);
    setIsPlaying(true);
    
    try {
      const cleanWord = word.replace(/[.,!?;:'"()]/g, '');
      
      let definition = '';
      let definitionToSpeak = '';
      
      try {
        const { data: wordData, error: wordError } = await supabase.functions.invoke('word-dictionary', {
          body: { 
            word: cleanWord, 
            userLevel: difficulty,
            userLanguage: userNativeLanguage,
            sentenceContext: sentenceContext
          }
        });
        
        if (!wordError && wordData?.definition) {
          definition = wordData.definition;
          definitionToSpeak = wordData.definition;
        } else {
          definition = getWordDefinition(cleanWord, sentenceContext);
          definitionToSpeak = definition;
        }
      } catch (apiError) {
        definition = getWordDefinition(cleanWord, sentenceContext);
        definitionToSpeak = definition;
      }
      
      try {
        await VocabularyTrackingService.logEncounter(cleanWord, definitionToSpeak, wordComplexity);
      } catch (e) {
        console.warn('Vocabulary tracking failed', e);
      }
      
      toast({
        title: userLanguageT('interactiveWord.definition', 'Definition'),
        description: `"${cleanWord}" = ${definition}`,
        duration: 5000,
      });
      
      // Enhanced audio with proper mobile support
      if (userNativeLanguage === 'en') {
        try {
          await SimpleAudioEngine.getInstance().playText({
            text: definitionToSpeak,
            voiceId: 'XB0fDUnXU5powFXDhCwa', // Charlotte
            modelId: 'eleven_turbo_v2_5'
          });
          setIsPlaying(false);
        } catch (error) {
          console.error('Charlotte TTS failed, falling back to browser speech:', error);
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(definitionToSpeak);
            utterance.rate = 0.7;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            utterance.onend = () => setIsPlaying(false);
            utterance.onerror = () => setIsPlaying(false);
            speechSynthesis.speak(utterance);
          } else {
            setIsPlaying(false);
          }
        }
      } else {
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(definitionToSpeak);
          utterance.rate = 0.7;
          utterance.pitch = 1.0;
          utterance.volume = 1.0;
          utterance.lang = userNativeLanguage;
          
          const voices = speechSynthesis.getVoices();
          const languageCode = userNativeLanguage.substring(0, 2);
          const nativeVoice = voices.find(voice => 
            voice.lang.toLowerCase().startsWith(languageCode.toLowerCase())
          );
          if (nativeVoice) utterance.voice = nativeVoice;
          
          utterance.onend = () => setIsPlaying(false);
          utterance.onerror = () => setIsPlaying(false);
          speechSynthesis.speak(utterance);
        } else {
          setIsPlaying(false);
        }
      }
      
    } catch (error) {
      console.error('❌ Handle explain error:', error);
      
      toast({
        title: userLanguageT("interactiveWord.definition", "Definition"),
        description: `"${word.replace(/[.,!?;:'"()]/g, '')}" = ${getWordDefinition(word.replace(/[.,!?;:'"()]/g, ''), sentenceContext)}`,
        duration: 3000,
      });
    } finally {
      setIsLoadingWordData(false);
      setIsPlaying(false);
    }
  };

  // Simple word definition fallback
  const getWordDefinition = (word: string, context: string) => {
    const cleanWord = word.toLowerCase().replace(/[.,!?;:'"()]/g, '');
    
    const definitions: Record<string, string> = {
      // Common words for children
      'playing': 'having fun with games or toys',
      'running': 'moving very fast on your feet',
      'jumping': 'pushing yourself up into the air',
      'swimming': 'moving through water',
      'reading': 'looking at words and understanding what they mean',
      'writing': 'making letters and words on paper',
      'drawing': 'making pictures with pencils or crayons',
      'adventure': 'an exciting journey or experience',
      'friend': 'someone you like and enjoy being with',
      'happy': 'feeling good and cheerful',
      'excited': 'feeling very happy about something',
      'curious': 'wanting to learn and know more about things',
      'brave': 'not afraid to do something scary or difficult',
      'kind': 'being nice and caring to others',
      'smart': 'being good at learning and understanding things',
      'funny': 'making people laugh',
      'surprised': 'feeling amazed when something unexpected happens',
    };
    
    return definitions[cleanWord] || `${cleanWord} is a word that appears in this story`;
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  if (!shouldHighlight) {
    return <span className={className}>{word}</span>;
  }

  return (
    <span
      ref={wordRef}
      className={cn(
        className,
        "relative inline cursor-pointer",
        "underline decoration-dotted decoration-2 underline-offset-2 decoration-primary/40",
        "hover:decoration-primary transition-colors duration-200",
        isMobileOrTablet && "touch-manipulation select-none", // Enhanced mobile support
        showTooltip && "decoration-primary"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
      role={shouldHighlight ? "button" : undefined}
      tabIndex={shouldHighlight ? 0 : undefined}
      aria-label={shouldHighlight ? `Tap to learn about "${cleanWord}"` : undefined}
      style={{
        WebkitTapHighlightColor: 'transparent',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none'
      }}
    >
      {word}
      
      {/* Enhanced tooltip with mobile optimization */}
      {shouldHighlight && showTooltip && (
        <div
          className={cn(
            "absolute z-50 bg-popover border border-border rounded-lg shadow-2xl",
            "min-w-[280px] max-w-[340px] p-4",
            // Mobile-first positioning
            isMobileOrTablet ? [
              "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
              "w-[90vw] max-w-[340px]",
              "animate-in fade-in-0 zoom-in-95 duration-200"
            ] : [
              // Desktop positioning
              tooltipPosition.vertical === 'top' 
                ? "bottom-full mb-2" 
                : "top-full mt-2",
              tooltipPosition.horizontal === 'left' 
                ? "left-0" 
                : tooltipPosition.horizontal === 'right' 
                  ? "right-0" 
                  : "left-1/2 -translate-x-1/2"
            ]
          )}
          style={!isMobileOrTablet && tooltipPosition.offset ? {
            transform: `translateX(${-tooltipPosition.offset}px)`
          } : undefined}
          onMouseEnter={() => {
            if (hideTimeoutRef.current) {
              clearTimeout(hideTimeoutRef.current);
              hideTimeoutRef.current = null;
            }
          }}
          onMouseLeave={!isMobileOrTablet ? handleMouseLeave : undefined}
        >
          {/* Mobile overlay for closing */}
          {isMobileOrTablet && (
            <div 
              className="fixed inset-0 bg-black/20 -z-10"
              onClick={() => setShowTooltip(false)}
            />
          )}
          
          {/* Word header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-foreground">{cleanWord}</h3>
            {isMobileOrTablet && (
              <button
                onClick={() => setShowTooltip(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                ✕
              </button>
            )}
          </div>
          
          {/* Phonetic spelling */}
          <div className="text-sm text-muted-foreground mb-3 font-mono">
            /{phoneticSpelling}/
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {/* Pronounce button */}
            <button
              onClick={handlePronounce}
              disabled={isPlaying}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-colors duration-200",
                isMobileOrTablet && "touch-manipulation min-h-[44px]" // Enhanced touch target
              )}
            >
              <Volume2 className="w-4 h-4" />
              {isPlaying ? "Playing..." : userLanguageT('interactiveWord.hearIt', 'Hear It')}
            </button>
            
            {/* Explain button */}
            <button
              onClick={handleExplain}
              disabled={isLoadingWordData || isPlaying}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium",
                "bg-secondary text-secondary-foreground hover:bg-secondary/90",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-colors duration-200",
                isMobileOrTablet && "touch-manipulation min-h-[44px]"
              )}
            >
              <HelpCircle className="w-4 h-4" />
              {isLoadingWordData ? "Loading..." : userLanguageT('interactiveWord.explain', 'Explain')}
            </button>
            
            {/* Save to vocabulary (premium) */}
            {isPremium && (
              <button
                onClick={() => {
                  try {
                    const addVocabularyWord = getAddVocabularyWord();
                    addVocabularyWord();
                    toast({
                      title: "Word Saved!",
                      description: `"${cleanWord}" added to vocabulary.`,
                      duration: 2000,
                    });
                  } catch (error) {
                    console.error('Failed to save word:', error);
                  }
                }}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium",
                  "bg-accent text-accent-foreground hover:bg-accent/90",
                  "transition-colors duration-200",
                  isMobileOrTablet && "touch-manipulation min-h-[44px]"
                )}
              >
                <Plus className="w-4 h-4" />
                {userLanguageT('interactiveWord.addToVocabulary', 'Save')}
              </button>
            )}
          </div>
          
          {/* Status indicator for mobile */}
          {isMobileOrTablet && (
            <div className="mt-3 pt-3 border-t border-border text-center">
              <span className="text-xs text-muted-foreground">
                Tap outside to close
              </span>
            </div>
          )}
        </div>
      )}
    </span>
  );
};

export default InteractiveWord;