import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getPhoneticSpelling } from "@/utils/phoneticDictionary";
import { Volume2, HelpCircle, Languages, BookOpen, Lightbulb, Plus, Crown } from "lucide-react";
import { createOpenAITTSService } from "@/services/textToSpeechService";
import { useToast } from "@/hooks/use-toast";
import { contextualPronunciation } from "@/services/contextualPronunciation";
import { supabase } from "@/integrations/supabase/client";
import { VocabularyLevelClassifier } from "@/utils/vocabularyLevelClassifier";
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

  // Use enhanced vocabulary classifier for better difficulty assessment
  const wordDifficulty = VocabularyLevelClassifier.getWordDifficulty(word, difficulty);
  const shouldHighlight = wordDifficulty.shouldHighlight;
  const wordComplexity = wordDifficulty.complexity;

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
      const cleanWord = word.replace(/[.,!?;:'"()]/g, '');
      
      if (ttsService) {
        // Get context-aware pronunciation but just speak the word normally
        const fullContext = sentenceContext || `The word ${cleanWord} in context`;
        const pronunciationInfo = contextualPronunciation.getWordPronunciation(cleanWord, fullContext);
        
        // Just speak the word - the contextual service will handle pronunciation internally
        const speed = isESLLearner ? 0.6 : 0.7;
        await ttsService.speakText(cleanWord, { speed, userInfo });
      } else {
        // Fallback to browser speech synthesis
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(cleanWord);
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

  const handleExplain = async (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (isPlaying || isLoadingWordData) return;
    
    setIsLoadingWordData(true);
    setIsPlaying(true);
    
    try {
      const cleanWord = word.replace(/[.,!?;:'"()]/g, '');
      console.log('Mobile Explain Debug:', {
        cleanWord, 
        userNativeLanguage, 
        isESLLearner, 
        difficulty,
        isMobile: /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      });
      
      // Get word data from dictionary in user's native language
      const { data: wordData, error: wordError } = await supabase.functions.invoke('word-dictionary', {
        body: { 
          word: cleanWord, 
          userLevel: difficulty,
          userLanguage: userNativeLanguage
        }
      });
      
      console.log('Mobile Dictionary Response:', { data: wordData, error: wordError });
      console.log('Raw wordData fields:', {
        definition: wordData?.definition,
        phonetic: wordData?.phonetic, 
        sampleSentence: wordData?.sampleSentence,
        explanation: wordData?.explanation
      });
      
      if (!wordError && wordData) {
        setWordData(wordData);
        
        // Mobile-specific: Show translated explanation for all users
        toast({
          title: t('interactiveWord.definition'),
          description: `"${cleanWord}" = ${wordData.definition}`,
          duration: 5000,
        });
        
        // Create multilingual explanation for mobile TTS
        // Build explanation using available localized fields since wordData.explanation is undefined
        const explanationParts = [];
        if (wordData.phonetic) {
          explanationParts.push(`${cleanWord} ${t('interactiveWord.pronouncedAs', 'is pronounced')} ${wordData.phonetic}.`);
        }
        if (wordData.definition) {
          explanationParts.push(wordData.definition);
        }
        if (wordData.sampleSentence) {
          explanationParts.push(`${t('interactiveWord.example', 'Example')}: ${wordData.sampleSentence}`);
        }
        
        const explanation = explanationParts.length > 0 
          ? explanationParts.join(' ') 
          : `${cleanWord} ${t('interactiveWord.isAWord', 'is a word')}.`;
        
        console.log('Built explanation for mobile TTS:', {
          userNativeLanguage,
          explanationLength: explanation.length,
          explanationPreview: explanation.substring(0, 100) + '...',
          explanationParts: explanationParts.length
        });
        
        // Mobile optimized: Always prefer Web Speech API for better mobile compatibility
        const isMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile || !ttsService) {
          console.log('Using Web Speech API for mobile explain button:', { 
            userNativeLanguage, 
            isMobile,
            hasTtsService: !!ttsService,
            explanationPreview: explanation.substring(0, 50) + '...' 
          });
          
          if ('speechSynthesis' in window) {
            console.log('Speech synthesis available, starting TTS process...');
            
            // Cancel any existing speech
            speechSynthesis.cancel();
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const utterance = new SpeechSynthesisUtterance(explanation);
            utterance.rate = isESLLearner ? 0.6 : 0.7;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            // Enhanced voice selection for user's native language
            const voices = speechSynthesis.getVoices();
            console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
            
            // Language mapping for better voice matching
            const languageMap: Record<string, string[]> = {
              'ar': ['ar-SA', 'ar-EG', 'ar'],
              'es': ['es-ES', 'es-MX', 'es-US', 'es'],
              'zh': ['zh-CN', 'zh-TW', 'zh-HK', 'zh'],
              'hi': ['hi-IN', 'hi'],
              'pt': ['pt-BR', 'pt-PT', 'pt'],
              'fr': ['fr-FR', 'fr-CA', 'fr']
            };
            
            const languageCodes = languageMap[userNativeLanguage] || [userNativeLanguage];
            
            let selectedVoice = null;
            for (const langCode of languageCodes) {
              selectedVoice = voices.find(voice => voice.lang.startsWith(langCode));
              if (selectedVoice) break;
            }
            
            // Fallback to any voice containing the language code
            if (!selectedVoice) {
              selectedVoice = voices.find(voice => 
                voice.lang.includes(userNativeLanguage) || 
                voice.name.toLowerCase().includes(userNativeLanguage)
              );
            }
            
            if (selectedVoice) {
              utterance.voice = selectedVoice;
              utterance.lang = selectedVoice.lang;
              console.log('Selected voice for', userNativeLanguage, ':', selectedVoice.name, selectedVoice.lang);
            } else {
              console.warn('No voice found for language:', userNativeLanguage);
              // Set language attribute even without specific voice
              utterance.lang = userNativeLanguage;
            }
            
            console.log('About to speak explanation with utterance settings:', {
              text: explanation.substring(0, 50) + '...',
              voice: utterance.voice?.name || 'default',
              lang: utterance.lang,
              rate: utterance.rate,
              pitch: utterance.pitch,
              volume: utterance.volume
            });
            
            utterance.onerror = (error) => {
              console.error('Speech synthesis error:', error);
              console.error('Error event details:', {
                error: error.error,
                type: error.type,
                currentTarget: error.currentTarget
              });
              toast({
                title: t("interactiveWord.audioUnavailable", "Audio unavailable"), 
                description: t("interactiveWord.definitionShown", "Definition shown below. Try with headphones if needed."),
                duration: 3000,
              });
              setIsPlaying(false);
            };
            
            utterance.onend = () => {
              console.log('Speech synthesis completed successfully');
              setIsPlaying(false);
            };
            
            utterance.onstart = () => {
              console.log('Speech synthesis started');
            };
            
            console.log('Calling speechSynthesis.speak()...');
            speechSynthesis.speak(utterance);
            return;
          } else {
            console.log('Speech synthesis not available');
            toast({
              title: t("interactiveWord.audioUnavailable", "Audio unavailable"), 
              description: t("interactiveWord.audioNotSupported", "Audio not supported on this device. Definition shown below."),
              duration: 3000,
            });
            setIsPlaying(false);
            return;
          }
        }
        
        if (ttsService) {
          console.log('TTS Request: voice=nova, speed=0.6, text="' + explanation.substring(0, 50) + '..."');
          
          // Use TTS to speak the explanation
          await ttsService.speakText(explanation, {
            speed: 0.6,
            userInfo
          });
        }
      } else {
        console.error('Failed to get word data:', wordError);
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error explaining word:', error);
      
      // Enhanced mobile error handling with translations
      if (error.message?.includes('not allowed') || error.message?.includes('permission') || error.message?.includes('gesture')) {
        toast({
          title: t("interactiveWord.touchToEnable", "Touch to Enable Audio"),
          description: t("interactiveWord.tapAgain", "Tap this button again to enable audio explanations."),
          duration: 4000,
        });
      } else {
        toast({
          title: t("interactiveWord.audioNotAvailable", "Audio Not Available"),
          description: t("interactiveWord.tryHeadphones", "Try using headphones or enabling audio permissions."),
          duration: 3000,
        });
      }
      
      // Show word data even if audio fails
      const cleanWord = word.replace(/[.,!?;:'"()]/g, '');
      const definition = getWordDefinition(cleanWord, sentenceContext);
      setWordData({
        definition,
        phonetic: getPhoneticSpelling(cleanWord),
        sampleSentence: `Example: "${cleanWord}" in context.`
      });
    } finally {
      setIsLoadingWordData(false);
      setIsPlaying(false);
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
      const languageNames: Record<string, string> = {
        'ar': 'Arabic',
        'es': 'Spanish',
        'zh': 'Chinese',
        'hi': 'Hindi',
        'pt': 'Portuguese',
        'fr': 'French'
      };
      const langName = languageNames[userNativeLanguage] || userNativeLanguage;
      
      // Create a translation request to Supabase function
      const { data, error } = await supabase.functions.invoke('translate-word', {
        body: {
          word: cleanWord,
          targetLanguage: userNativeLanguage,
          context: sentenceContext
        }
      });

      if (!error && data) {
        // Show translation in a toast
        toast({
          title: `${cleanWord} in ${langName}`,
          description: data.translation || `Translation: ${data.translated_word}`,
          duration: 5000,
        });

        // Also get word data for additional context
        if (ttsService) {
          const wordData = await ttsService.getWordData(cleanWord, difficulty as 'easy' | 'medium' | 'hard');
          setWordData(wordData);
        }
      } else {
        // Fallback: show simple translation message
        console.error('Translation error:', error);
        toast({
          title: `${cleanWord} in ${langName}`,
          description: t("interactiveWord.translationError", "Translation service temporarily unavailable"),
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error translating word:', error);
      // Fallback message
      toast({
        title: t("interactiveWord.translate"),
        description: t("interactiveWord.translationError", "Translation not available"),
        duration: 3000,
      });
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
      difficulty: wordComplexity,
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
          className={`fixed z-[99999] bg-white border border-gray-200 text-gray-900 px-3 py-3 sm:px-4 sm:py-4 rounded-xl shadow-2xl text-xs sm:text-sm font-medium backdrop-blur-sm transition-all duration-200 ${
            /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
              ? 'max-h-[70vh] overflow-y-auto scrollbar-thin' 
              : ''
          }`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={(e) => e.stopPropagation()}
          style={{
            // Mobile-optimized positioning with better viewport handling
            ...(tooltipPosition.horizontal === 'left' ? {
              left: `${Math.max(10, wordRef.current?.getBoundingClientRect().left || 0)}px`,
            } : tooltipPosition.horizontal === 'right' ? {
              right: `${Math.max(10, window.innerWidth - (wordRef.current?.getBoundingClientRect().right || window.innerWidth))}px`,
            } : {
              left: `${Math.max(10, Math.min(window.innerWidth - 320, (wordRef.current?.getBoundingClientRect().left || 0) + (wordRef.current?.getBoundingClientRect().width || 0) / 2 - 160))}px`,
            }),
            ...(tooltipPosition.vertical === 'top' ? {
              bottom: `${Math.max(10, window.innerHeight - (wordRef.current?.getBoundingClientRect().top || 0) + 8)}px`,
              maxHeight: `${Math.max(200, (wordRef.current?.getBoundingClientRect().top || 0) - 20)}px`,
            } : {
              top: `${Math.max(10, (wordRef.current?.getBoundingClientRect().bottom || 0) + 8)}px`,
              maxHeight: `${Math.max(200, window.innerHeight - (wordRef.current?.getBoundingClientRect().bottom || 0) - 20)}px`,
            }),
            maxWidth: 'min(340px, calc(100vw - 20px))',
            minWidth: 'min(280px, calc(100vw - 40px))',
            width: 'auto',
            boxShadow: '0 15px 50px -15px rgba(0, 0, 0, 0.4)',
            border: '2px solid rgba(0, 0, 0, 0.1)',
            // Ensure tooltip stays within safe area on mobile
            marginLeft: 'max(0px, env(safe-area-inset-left))',
            marginRight: 'max(0px, env(safe-area-inset-right))',
            marginTop: 'max(0px, env(safe-area-inset-top))',
            marginBottom: 'max(0px, env(safe-area-inset-bottom))'
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
          
          {/* Action buttons - mobile-optimized sizing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
            <button
              onClick={handlePronounce}
              className="flex items-center justify-center gap-2 text-xs sm:text-sm bg-blue-50 hover:bg-blue-100 active:bg-blue-200 border-2 border-blue-200 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg transition-colors touch-manipulation min-h-[44px] font-semibold text-blue-700 shadow-sm"
              disabled={isPlaying}
            >
              <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />
              {t("interactiveWord.hearIt")}
            </button>
            
            <button
              onClick={handleExplain}
              className="flex items-center justify-center gap-2 text-xs sm:text-sm bg-green-50 hover:bg-green-100 active:bg-green-200 border-2 border-green-200 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg transition-colors touch-manipulation min-h-[44px] font-semibold text-green-700 shadow-sm"
              disabled={isPlaying || isLoadingWordData}
            >
              <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              {isLoadingWordData ? t("interactiveWord.loading") : t("interactiveWord.explain")}
            </button>
          </div>

          {/* Secondary buttons row - mobile-optimized */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Translation button for ESL learners only */}
            {isESLLearner && (
              <button
                onClick={handleTranslate}
                className="flex items-center gap-1 text-xs bg-purple-50 hover:bg-purple-100 active:bg-purple-200 border border-purple-200 px-2.5 py-2 rounded-md transition-colors touch-manipulation min-h-[36px] font-medium text-purple-700 shadow-sm"
                disabled={isLoadingWordData}
              >
                <Languages className="w-3 h-3" />
                <span className="hidden xs:inline">{isLoadingWordData ? t("interactiveWord.loading") : t("interactiveWord.translate")}</span>
                <span className="xs:hidden">Trans</span>
              </button>
            )}

            {/* Add to vocabulary button - Premium feature */}
            <div className="relative group">
              <button
                onClick={isPremium ? handleAddToVocabulary : undefined}
                className={`flex items-center gap-1 text-xs px-2.5 py-2 rounded-md transition-colors touch-manipulation min-h-[36px] font-medium shadow-sm ${
                  isPremium 
                    ? 'bg-yellow-50 hover:bg-yellow-100 active:bg-yellow-200 border border-yellow-200 text-yellow-700 cursor-pointer' 
                    : 'bg-gray-100 text-gray-500 cursor-not-allowed opacity-60 border border-gray-200'
                }`}
                disabled={!isPremium}
              >
                {isPremium ? <Plus className="w-3 h-3" /> : <Crown className="w-3 h-3" />}
                <span className="hidden xs:inline">{t("interactiveWord.addToVocabulary", "Save Word")}</span>
                <span className="xs:hidden">Save</span>
              </button>
              
              {/* Premium tooltip for free users - mobile optimized */}
              {!isPremium && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg max-w-[200px]">
                  <div className="flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    <span>Premium Feature</span>
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-2 border-r-2 border-t-2 border-transparent border-t-purple-600"></div>
                </div>
              )}
            </div>

            {/* Etymology button for advanced native speakers */}
            {isNativeEnglishSpeaker && userInfo?.age && userInfo.age > 12 && (
              <button
                onClick={() => {/* TODO: Implement etymology lookup */}}
                className="flex items-center gap-1 text-xs bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 border border-indigo-200 px-2.5 py-2 rounded-md transition-colors touch-manipulation min-h-[36px] font-medium text-indigo-700 shadow-sm"
              >
                <Lightbulb className="w-3 h-3" />
                <span className="hidden xs:inline">{t("interactiveWord.etymology")}</span>
                <span className="xs:hidden">Info</span>
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

// Add mobile-specific optimizations for native apps with enhanced translation debugging
const MobileOptimizedInteractiveWord = (props: InteractiveWordProps) => {
  const { t, i18n } = useTranslation();
  
  // Detect if we're running in Capacitor (native mobile app)
  const isNativeApp = typeof window !== 'undefined' && 
    (window as any).Capacitor?.isNativePlatform?.();

  // Enhanced mobile detection for tablets and phones
  const isMobileDevice = typeof window !== 'undefined' && 
    (/Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
     window.matchMedia('(max-width: 768px)').matches ||
     isNativeApp);

  // Mobile translation debugging
  if (isMobileDevice) {
    console.log('Mobile Translation Debug:', {
      word: props.word,
      userNativeLanguage: props.userInfo?.nativeLanguage,
      currentLanguage: i18n.language,
      explainButtonText: t("interactiveWord.explain"),
      isESL: props.userInfo?.nativeLanguage !== 'en'
    });
  }

  // Apply mobile-specific optimizations
  const optimizedProps = {
    ...props,
    className: `${props.className || ''} ${
      isMobileDevice ? 'mobile-optimized touch-manipulation select-none' : ''
    }`
  };

  return <InteractiveWord {...optimizedProps} />;
};

export { MobileOptimizedInteractiveWord };