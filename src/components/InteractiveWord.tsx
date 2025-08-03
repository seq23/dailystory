import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { getPhoneticSpelling } from "@/utils/phoneticDictionary";
import { Volume2, HelpCircle, Languages, BookOpen, Lightbulb, Plus, Crown } from "lucide-react";
import { createOpenAITTSService } from "@/services/textToSpeechService";
import { useToast } from "@/hooks/use-toast";
import { contextualPronunciation } from "@/services/contextualPronunciation";
import { supabase } from "@/integrations/supabase/client";
import { VocabularyLevelClassifier } from "@/utils/vocabularyLevelClassifier";
import { useIsMobile } from "@/hooks/use-mobile";
import type { UserInfo } from "@/types";

interface InteractiveWordProps {
  word: string;
  className?: string;
  difficulty?: "easy" | "medium" | "hard" | "expert";
  userInfo?: UserInfo;
  isPremium?: boolean;
  sentenceContext?: string;
  onClick?: () => void; // Add explicit onClick for better touch handling
}

export const InteractiveWord = ({ 
  word, 
  className = "", 
  difficulty = "easy",
  userInfo,
  isPremium = false,
  sentenceContext = "",
  onClick
}: InteractiveWordProps) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { isMobileDevice, isCapacitor } = useIsMobile();
  
  // ENHANCED: Debug and fix translation issues for Arabic, Chinese, Hindi
  const userLanguageT = useCallback((key: string, fallback: string) => {
    if (userInfo?.nativeLanguage && userInfo.nativeLanguage !== 'en') {
      try {
        // Approach 1: Try direct i18n translation
        const translation = i18n.t(key, { lng: userInfo.nativeLanguage });
        if (translation && translation !== key && translation !== fallback) {
          return translation;
        }
        
        // Approach 2: Manual fallback with known translations
        const manualTranslations = {
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
  }, [userInfo?.nativeLanguage]);
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

  // Enhanced voice selection for natural pronunciation - consistent with other components
  const getVoiceForUser = (userInfo?: UserInfo) => {
    if (!userInfo) return "cgSgspJ2msm6clMCkdW9"; // Default Jessica voice (natural)
    
    const age = userInfo.age;
    const isGirl = userInfo.avatar?.type === 'girl';
    const isNativeEnglishSpeaker = userInfo.nativeLanguage === 'en';
    
    if (!isNativeEnglishSpeaker) {
      // Use multilingual voices for non-native speakers
      if (age <= 8) {
        return isGirl ? "EXAVITQu4vr4xnSDxMaL" : "TX3LPaxmHKxFdv7VOQHJ"; // Sarah or Liam
      } else if (age <= 12) {
        return isGirl ? "XB0fDUnXU5powFXDhCwa" : "N2lVS1w4EtoT3dr4eOWO"; // Charlotte or Callum
      } else {
        return isGirl ? "9BWtsMINqrJLrRacOk9x" : "CwhRBWXzGAHq8TQ4Fs17"; // Aria or Roger
      }
    } else {
      // Use most natural voices for native English speakers
      if (age <= 8) {
        return isGirl ? "EXAVITQu4vr4xnSDxMaL" : "TX3LPaxmHKxFdv7VOQHJ"; // Sarah or Liam
      } else if (age <= 12) {
        return isGirl ? "cgSgspJ2msm6clMCkdW9" : "nPczCjzI2devNBz1zQrb"; // Jessica or Brian (very natural)
      } else {
        return isGirl ? "cgSgspJ2msm6clMCkdW9" : "onwK4e9ZLuTAKqWW03F9"; // Jessica or Daniel (most natural)
      }
    }
  };

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
      
      // Use ElevenLabs for high-quality pronunciation
      const voice = getVoiceForUser(userInfo);
      const model = isNativeEnglishSpeaker ? "eleven_turbo_v2" : "eleven_multilingual_v2";
      const response = await fetch('https://cpzeuogomaixamrtnnmj.supabase.co/functions/v1/elevenlabs-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanWord,
          voice: voice,
          model: model
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        // Mobile-specific audio configuration
        if (isMobileDevice) {
          audio.preload = 'metadata';
        }
        
        audio.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        audio.onerror = () => setIsPlaying(false);
        await audio.play();
      } else {
        throw new Error('ElevenLabs TTS failed');
      }
    } catch (error) {
      console.error('Error pronouncing word:', error);
      setIsPlaying(false);
    }
  };

  const handleExplain = async (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (isPlaying || isLoadingWordData) return;
    
    console.log('🔍 EXPLAIN CLICKED - Debug info:', {
      word,
      userNativeLanguage,
      difficulty,
      isMobileDevice,
      touchEvent: e.type === 'touchstart'
    });
    
    setIsLoadingWordData(true);
    setIsPlaying(true);
    
    try {
      const cleanWord = word.replace(/[.,!?;:'"()]/g, '');
      
      // Always try to get proper definition from API first
      let definition = '';
      let definitionToSpeak = '';
      
      // Try to get definition via dictionary API for ALL users
      try {
        console.log('📞 Calling word-dictionary API for:', { cleanWord, userNativeLanguage, difficulty });
        const { data: wordData, error: wordError } = await supabase.functions.invoke('word-dictionary', {
          body: { 
            word: cleanWord, 
            userLevel: difficulty,
            userLanguage: userNativeLanguage
          }
        });
        
        console.log('📞 API Response:', { wordData, wordError });
        
        if (!wordError && wordData?.definition) {
          definition = wordData.definition;
          definitionToSpeak = wordData.definition;
          console.log('✅ Got proper API definition:', definition);
        } else {
          console.warn('⚠️ API call failed or no definition, using local fallback');
          // Only use local definitions as fallback
          definition = getWordDefinition(cleanWord, sentenceContext);
          definitionToSpeak = definition;
        }
      } catch (apiError) {
        console.warn('⚠️ API call threw error, using local fallback:', apiError);
        definition = getWordDefinition(cleanWord, sentenceContext);
        definitionToSpeak = definition;
      }
      
      console.log('📝 Final definition to use:', definition);
      
      // Show definition immediately
      toast({
        title: userLanguageT('interactiveWord.definition', 'Definition'),
        description: `"${cleanWord}" = ${definition}`,
        duration: 5000,
      });
      
      // Use ElevenLabs for consistent high-quality TTS
      try {
        const voice = getVoiceForUser(userInfo);
        const model = isNativeEnglishSpeaker ? "eleven_turbo_v2" : "eleven_multilingual_v2";
        
        const response = await fetch('https://cpzeuogomaixamrtnnmj.supabase.co/functions/v1/elevenlabs-tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: definitionToSpeak,
            voice: voice,
            model: model
          })
        });

        if (response.ok) {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          
          // Mobile-specific audio configuration
          if (isMobileDevice) {
            audio.preload = 'metadata';
          }
          
          audio.onended = () => {
            setIsPlaying(false);
            URL.revokeObjectURL(audioUrl);
          };
          
          audio.onerror = () => {
            console.warn('ElevenLabs audio failed, falling back to browser speech');
            fallbackToBrowserSpeech();
          };
          
          await audio.play();
        } else {
          throw new Error('ElevenLabs TTS failed');
        }
      } catch (error) {
        console.warn('ElevenLabs failed, using browser speech fallback:', error);
        fallbackToBrowserSpeech();
      }
      
      function fallbackToBrowserSpeech() {
        if ('speechSynthesis' in window) {
          try {
            const utterance = new SpeechSynthesisUtterance(definitionToSpeak);
            utterance.rate = 0.7;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            if (userNativeLanguage !== 'en') {
              utterance.lang = userNativeLanguage;
              const voices = speechSynthesis.getVoices();
              const languageCode = userNativeLanguage.substring(0, 2);
              const nativeVoice = voices.find(voice => 
                voice.lang.toLowerCase().startsWith(languageCode.toLowerCase())
              );
              if (nativeVoice) utterance.voice = nativeVoice;
            }
            
            utterance.onend = () => setIsPlaying(false);
            utterance.onerror = () => setIsPlaying(false);
            
            speechSynthesis.speak(utterance);
          } catch (audioError) {
            console.error('Browser speech also failed:', audioError);
            setIsPlaying(false);
          }
        } else {
          setIsPlaying(false);
        }
      }
      
    } catch (error) {
      console.error('❌ Handle explain error (safe fallback):', error);
      
      // Always show fallback toast even on error
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
      'journeyed': 'traveled from one place to another on an adventure',
      'appeared': 'showed up or came into sight',
      'explained': 'told someone about something to help them understand',
      'recognized': 'knew or remembered something from before',
      'destined': 'meant to happen or planned by fate',
      'adventure': 'an exciting journey or experience',
      'mission': 'an important job or task to complete',
      'remarkable': 'very special or amazing',
      'bushes': 'small plants with lots of leaves and branches',
      
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
      'tree': 'a tall plant with a thick trunk, branches, and leaves',
      'oak': 'a type of strong tree with thick branches',
      'neighborhood': 'the area around your home where you live',
      
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
      'proud': 'feeling good about something you did well',
      'important': 'very special and needed',
      'urgent': 'needs to be done right away',
      'wonderful': 'really amazing and great',
      'different': 'not the same as others',
      'blue': 'the color of the sky on a clear day'
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
    setIsPlaying(true);
    
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
      
      // Show status to user
      toast({
        title: "Getting Translation...",
        description: `Looking up "${cleanWord}" in ${langName}`,
        duration: 2000,
      });
      
      // Create a translation request to Supabase function
      const { data, error } = await supabase.functions.invoke('translate-word', {
        body: {
          word: cleanWord,
          targetLanguage: userNativeLanguage,
          context: sentenceContext
        }
      });

      if (!error && data) {
        const translationText = data.translation || `Translation: ${data.translated_word}`;
        
        // Show translation result
        toast({
          title: `${cleanWord} in ${langName}`,
          description: translationText,
          duration: 5000,
        });

        // Show audio status to user
        toast({
          title: "🔊 Playing Audio...",
          description: "Preparing to speak the translation",
          duration: 2000,
        });

        // Mobile audio requires user interaction - try to create a simple audio element first
        try {
          // Create a simple test audio to unlock mobile audio
          const testAudio = new Audio();
          testAudio.src = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwfAg==" 
          await testAudio.play().catch(() => {});
          testAudio.pause();
        } catch (e) {
          // Ignore test audio errors
        }

        // Try playing the actual translation audio
        let audioPlayed = false;

        // First try OpenAI TTS
        if (ttsService) {
          try {
            toast({
              title: "🎤 High Quality Audio",
              description: "Using OpenAI voice synthesis...",
              duration: 2000,
            });
            
            await ttsService.speakText(translationText, {
              voice: 'nova',
              speed: 0.7
            });
            
            audioPlayed = true;
            
            toast({
              title: "✅ Audio Complete",
              description: "Translation audio finished playing",
              duration: 2000,
            });
            
          } catch (ttsError) {
            toast({
              title: "⚠️ High Quality Audio Failed",
              description: "Trying backup audio method...",
              duration: 2000,
            });
          }
        }

        // If OpenAI TTS failed, try browser speech
        if (!audioPlayed && 'speechSynthesis' in window) {
          try {
            toast({
              title: "🗣️ Browser Audio",
              description: "Using device speech synthesis...",
              duration: 2000,
            });

            // Cancel any existing speech
            speechSynthesis.cancel();
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const utterance = new SpeechSynthesisUtterance(translationText);
            utterance.rate = 0.6;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            utterance.lang = userNativeLanguage;
            
            // Load voices if needed
            let voices = speechSynthesis.getVoices();
            if (voices.length === 0) {
              await new Promise(resolve => {
                speechSynthesis.onvoiceschanged = resolve;
                setTimeout(resolve, 1000);
              });
              voices = speechSynthesis.getVoices();
            }
            
            // Find best voice
            const languageCode = userNativeLanguage.substring(0, 2);
            const nativeVoice = voices.find(voice => 
              voice.lang.toLowerCase().startsWith(languageCode.toLowerCase())
            );
            
            if (nativeVoice) {
              utterance.voice = nativeVoice;
            }
            
            return new Promise<void>((resolve) => {
              utterance.onstart = () => {
                toast({
                  title: "🔊 Audio Playing",
                  description: "Speaking translation now...",
                  duration: 2000,
                });
              };
              
              utterance.onend = () => {
                toast({
                  title: "✅ Audio Complete",
                  description: "Translation speech finished",
                  duration: 2000,
                });
                setIsPlaying(false);
                resolve();
              };
              
              utterance.onerror = (event) => {
                toast({
                  title: "❌ Speech Error",
                  description: `Speech failed: ${event.error}. Check device volume and audio settings.`,
                  duration: 4000,
                });
                setIsPlaying(false);
                resolve();
              };
              
              speechSynthesis.speak(utterance);
              
              // Timeout fallback
              setTimeout(() => {
                if (speechSynthesis.speaking) {
                  speechSynthesis.cancel();
                }
                toast({
                  title: "⏰ Audio Timeout",
                  description: "Audio took too long. Try again or check audio settings.",
                  duration: 3000,
                });
                setIsPlaying(false);
                resolve();
              }, 8000);
            });
            
          } catch (audioError) {
            toast({
              title: "❌ Browser Audio Failed",
              description: "Device doesn't support speech synthesis",
              duration: 3000,
            });
          }
        }

        if (!audioPlayed && !('speechSynthesis' in window)) {
          toast({
            title: "❌ No Audio Support",
            description: "Your device doesn't support audio playback",
            duration: 4000,
          });
        }

      } else {
        toast({
          title: "❌ Translation Failed",
          description: error?.message || "Could not translate word",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Translation service unavailable",
        duration: 3000,
      });
    } finally {
      setIsLoadingWordData(false);
      setIsPlaying(false);
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
      className={`relative inline-block cursor-pointer touch-manipulation ${className} ${isPlaying ? 'opacity-70' : ''}`}
      onMouseEnter={!isMobileDevice ? handleMouseEnter : undefined}
      onMouseLeave={!isMobileDevice ? handleMouseLeave : undefined}
      onTouchStart={isMobileDevice ? handleMouseEnter : undefined}
      onTouchEnd={isMobileDevice ? () => {
        // Brief delay to allow touch interaction before hiding
        setTimeout(handleMouseLeave, 3000);
      } : undefined}
      onClick={onClick}
      style={{
        WebkitTapHighlightColor: 'transparent', // Remove mobile tap highlight
        userSelect: 'none'
      }}
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
              {userLanguageT("interactiveWord.hearIt", "Hear It")}
            </button>
            
            <button
              onClick={handleExplain}
              onTouchStart={(e) => {
                if (isMobileDevice) {
                  e.preventDefault();
                  handleExplain(e);
                }
              }}
              className="flex items-center justify-center gap-2 text-xs sm:text-sm bg-green-50 hover:bg-green-100 active:bg-green-200 border-2 border-green-200 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg transition-colors touch-manipulation min-h-[44px] font-semibold text-green-700 shadow-sm"
              disabled={isPlaying || isLoadingWordData}
            >
              <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              {isLoadingWordData ? userLanguageT("interactiveWord.loading", "Loading...") : userLanguageT("interactiveWord.explain", "Explain")}
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
                <span className="hidden xs:inline">{isLoadingWordData ? userLanguageT("interactiveWord.loading", "Loading...") : userLanguageT("interactiveWord.translate", "Translate")}</span>
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
                <span className="hidden xs:inline">{userLanguageT("interactiveWord.addToVocabulary", "Save Word")}</span>
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
                <span className="hidden xs:inline">{userLanguageT("interactiveWord.etymology", "Etymology")}</span>
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

// Enhanced Mobile-Optimized InteractiveWord with dedicated TTS windows
const MobileOptimizedInteractiveWord = (props: InteractiveWordProps) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [showMobileTTS, setShowMobileTTS] = useState(false);
  const [isPlayingMobile, setIsPlayingMobile] = useState(false);
  const [mobileWordData, setMobileWordData] = useState<any>(null);
  const [isLoadingMobile, setIsLoadingMobile] = useState(false);
  
  // Detect if we're running in Capacitor (native mobile app)
  const isNativeApp = typeof window !== 'undefined' && 
    (window as any).Capacitor?.isNativePlatform?.();

  // Enhanced mobile detection for tablets and phones
  const isMobileDevice = typeof window !== 'undefined' && 
    (/Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
     navigator.maxTouchPoints > 0 || 
     window.innerWidth <= 768);

  // Get voice based on user avatar and difficulty level
  const getVoiceForUser = () => {
    if (!props.userInfo) return "EXAVITQu4vr4xnSDxMaL"; // Default Sarah
    
    const isGirl = props.userInfo.avatar?.type === 'girl';
    
    switch (props.difficulty) {
      case 'easy':
        return isGirl ? "EXAVITQu4vr4xnSDxMaL" : "TX3LPaxmHKxFdv7VOQHJ"; // Sarah or Liam
      case 'medium':
        return isGirl ? "XB0fDUnXU5powFXDhCwa" : "N2lVS1w4EtoT3dr4eOWO"; // Charlotte or Callum
      case 'hard':
        return isGirl ? "9BWtsMINqrJLrRacOk9x" : "CwhRBWXzGAHq8TQ4Fs17"; // Aria or Roger
      case 'expert':
        return isGirl ? "cgSgspJ2msm6clMCkdW9" : "onwK4e9ZLuTAKqWW03F9"; // Jessica or Daniel
      default:
        return isGirl ? "EXAVITQu4vr4xnSDxMaL" : "TX3LPaxmHKxFdv7VOQHJ"; // Sarah or Liam
    }
  };

  // Mobile-optimized TTS pronunciation
  const handleMobilePronounce = async () => {
    if (isPlayingMobile) return;
    
    setIsPlayingMobile(true);
    
    try {
      const voiceId = getVoiceForUser();
      console.log('Mobile TTS: Starting pronunciation for word:', props.word, 'Voice:', voiceId);
      
      const response = await supabase.functions.invoke('elevenlabs-tts', {
        body: {
          text: props.word,
          voice: voiceId,
          model: 'eleven_turbo_v2_5' // Fast model for better mobile performance
        }
      });

      console.log('Mobile TTS Response:', response);

      if (response.error) {
        console.error('Mobile TTS Error:', response.error);
        throw new Error(response.error.message || 'TTS failed');
      }
      
      // CRITICAL FIX: The edge function returns audio data directly, not as a nested object
      if (!response.data) {
        throw new Error('No audio data received from TTS service');
      }
      
      // Handle audio blob properly for mobile - response.data is already the audio ArrayBuffer
      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      console.log('Mobile TTS: Audio blob created, size:', audioBlob.size, 'type:', audioBlob.type);
      
      const audioUrl = URL.createObjectURL(audioBlob);
      console.log('Mobile TTS: Audio URL created:', audioUrl.substring(0, 50) + '...');
      
      // Create audio element without source first
      const audio = new Audio();
      
      // Enhanced mobile-specific audio configuration
      audio.preload = 'none'; // Better for mobile performance
      audio.volume = 0.8;
      
      // Set up all event handlers BEFORE setting src
      audio.onloadstart = () => console.log('Mobile TTS: Audio load started');
      audio.oncanplay = () => console.log('Mobile TTS: Audio can play');
      audio.onloadeddata = () => console.log('Mobile TTS: Audio data loaded');
      
      audio.onended = () => {
        console.log('Mobile TTS: Audio ended');
        setIsPlayingMobile(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = (e) => {
        console.error('Mobile TTS: Audio playback error:', e);
        console.error('Audio error details:', {
          error: audio.error,
          networkState: audio.networkState,
          readyState: audio.readyState,
          currentSrc: audio.currentSrc
        });
        setIsPlayingMobile(false);
        URL.revokeObjectURL(audioUrl);
        throw new Error('Audio format not supported on this device');
      };
      
      // NOW set the source
      audio.src = audioUrl;
      
      // Mobile requires user interaction before playing audio
      console.log('Mobile TTS: Starting audio playback');
      
      // Ensure user interaction for mobile audio with better error handling
      try {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
        console.log('Mobile TTS: Audio started successfully');
      } catch (playError) {
        console.error('Mobile TTS: Play error:', playError);
        URL.revokeObjectURL(audioUrl);
        throw new Error('Audio playback requires user interaction or format not supported');
      }
      
    } catch (error) {
      console.error('Mobile TTS Error Details:', error);
      setIsPlayingMobile(false);
      
      // Provide different error messages for different scenarios
      const errorMessage = error.message?.includes('API key') 
        ? "TTS service temporarily unavailable"
        : error.message?.includes('network') || error.message?.includes('fetch')
        ? "Network error - please check your connection"
        : error.message?.includes('format not supported')
        ? "Audio format not supported on this device"
        : error.message?.includes('user interaction')
        ? "Tap the button again to enable audio"
        : "Audio unavailable - please try again";
        
      toast({
        title: "Audio unavailable",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  // Mobile-optimized word explanation with TTS
  const handleMobileExplain = async () => {
    if (isLoadingMobile || isPlayingMobile) return;
    
    setIsLoadingMobile(true);
    
    try {
      console.log('Mobile Explain: Starting for word:', props.word);
      
      // Get word definition first
      const response = await supabase.functions.invoke('word-dictionary', {
        body: {
          word: props.word,
          targetLanguage: props.userInfo?.nativeLanguage || 'en',
          context: props.sentenceContext || ''
        }
      });

      if (response.error) {
        console.error('Dictionary API Error:', response.error);
        throw new Error('Could not get word definition');
      }
      
      const wordData = response.data;
      setMobileWordData(wordData);
      console.log('Mobile Explain: Got word data:', wordData);
      
      // Generate TTS for explanation (available for all users)
      const voiceId = getVoiceForUser();
      const explanationText = wordData.definition 
        ? `${props.word}. ${wordData.definition}.${wordData.sampleSentence ? ` Example: ${wordData.sampleSentence}` : ''}`
        : `${props.word} is a word in English.`;
      
      console.log('Mobile Explain: TTS text:', explanationText.substring(0, 100) + '...');
      
      const ttsResponse = await supabase.functions.invoke('elevenlabs-tts', {
        body: {
          text: explanationText.slice(0, 800), // Limit for better performance
          voice: voiceId,
          model: 'eleven_turbo_v2_5'
        }
      });

      if (ttsResponse.error) {
        console.error('TTS API Error:', ttsResponse.error);
        // Don't throw here - just skip TTS but keep the definition
        setIsLoadingMobile(false);
        return;
      }
      
      // CRITICAL FIX: Handle TTS audio properly - response.data is the audio ArrayBuffer
      if (!ttsResponse.data) {
        console.warn('No TTS audio data received, skipping audio');
        setIsLoadingMobile(false);
        return;
      }
      
      const audioBlob = new Blob([ttsResponse.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.preload = 'metadata';
      audio.volume = 0.9;
      audio.crossOrigin = 'anonymous';
      
      audio.onended = () => {
        console.log('Mobile Explain: TTS ended');
        setIsPlayingMobile(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = (e) => {
        console.error('Mobile Explain: TTS playback error:', e);
        setIsPlayingMobile(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      setIsPlayingMobile(true);
      console.log('Mobile Explain: Starting TTS playback');
      
      // Ensure user interaction for mobile audio
      try {
        await audio.play();
        console.log('Mobile Explain: Audio started successfully');
      } catch (playError) {
        console.error('Mobile Explain: Play error:', playError);
        setIsPlayingMobile(false);
        URL.revokeObjectURL(audioUrl);
        throw new Error('Audio playback requires user interaction');
      }
      
    } catch (error) {
      console.error('Mobile Explain Error:', error);
      
      // Provide fallback explanation without TTS
      if (!mobileWordData) {
        setMobileWordData({
          definition: `${props.word} is a word. Tap 'Hear It' to hear the pronunciation.`,
          sampleSentence: ""
        });
      }
      
      const errorMessage = props.isPremium 
        ? "Explanation service temporarily unavailable"
        : "Basic explanation available - upgrade for full features";
        
      toast({
        title: "Limited explanation",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoadingMobile(false);
    }
  };

  // Enhanced mobile word click handler
  const handleMobileWordClick = () => {
    setShowMobileTTS(!showMobileTTS);
  };

  // Check if this word is a user name - if so, don't make it interactive
  const cleanWord = props.word.replace(/[^\w\s]/g, '').toLowerCase().trim();
  const isUserName = props.userInfo?.name && cleanWord === props.userInfo.name.toLowerCase();

  console.log('📱 Mobile Wrapper Active:', {
    word: props.word,
    cleanWord,
    isUserName,
    userName: props.userInfo?.name,
    userNativeLanguage: props.userInfo?.nativeLanguage,
    isMobileDevice,
    isNativeApp,
    passThrough: 'Enhanced Mobile TTS'
  });

  // If not mobile, use regular component
  if (!isMobileDevice) {
    return <InteractiveWord {...props} />;
  }

  // If this is a user name on mobile, render as plain text (no underline, no interaction)
  if (isUserName) {
    return <span className={props.className || ''}>{props.word}</span>;
  }

  // Mobile-optimized rendering with dedicated TTS windows
  return (
    <span className="relative inline-block">
      <span 
        className={`underline decoration-dotted cursor-pointer touch-manipulation ${props.className || ''} ${
          isPlayingMobile ? 'opacity-70' : ''
        }`}
        onClick={handleMobileWordClick}
        style={{
          WebkitTapHighlightColor: 'transparent',
          userSelect: 'none'
        }}
      >
        {props.word}
      </span>
      
      {/* Mobile TTS Popup Window */}
      {showMobileTTS && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[99999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{props.word}</h3>
              {mobileWordData && (
                <div className="text-sm text-gray-600">
                  <p className="mb-2">{mobileWordData.definition}</p>
                  {mobileWordData.sampleSentence && (
                    <p className="italic">"{mobileWordData.sampleSentence}"</p>
                  )}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={handleMobilePronounce}
                disabled={isPlayingMobile}
                className="flex flex-col items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 border-2 border-blue-200 p-4 rounded-xl transition-colors touch-manipulation min-h-[80px] font-semibold text-blue-700 disabled:opacity-50"
              >
                <Volume2 className="w-6 h-6" />
                <span className="text-sm">
                  {isPlayingMobile ? "Playing..." : t("interactiveWord.hearIt", "Hear It")}
                </span>
              </button>
              
              <button
                onClick={handleMobileExplain}
                disabled={isLoadingMobile || isPlayingMobile}
                className="flex flex-col items-center justify-center gap-2 bg-green-50 hover:bg-green-100 active:bg-green-200 border-2 border-green-200 p-4 rounded-xl transition-colors touch-manipulation min-h-[80px] font-semibold text-green-700 disabled:opacity-50"
              >
                <HelpCircle className="w-6 h-6" />
                <span className="text-sm">
                  {isLoadingMobile ? t("interactiveWord.loading", "Loading...") : t("interactiveWord.explain", "Explain")}
                </span>
              </button>
            </div>
            
            {/* User type indicator for transparency */}
            <div className="text-center mb-4">
              <span className="text-xs text-gray-500">
                {props.isPremium ? "✨ Premium Features" : "🎁 Free Trial - All features available"}
              </span>
            </div>
            
            <button
              onClick={() => setShowMobileTTS(false)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </span>
  );
};

export { MobileOptimizedInteractiveWord };