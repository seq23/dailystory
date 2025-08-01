import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Timer, Star, Crown, Sparkles, TrendingUp, Award, Clock, Play, Pause, Minus, X, ChevronUp, ChevronDown, Plus, Home, RotateCcw } from "lucide-react";
import type { UserInfo, SessionStats } from "@/types";
import { InteractiveAudioReading } from "@/components/InteractiveAudioReading";
import { ElevenLabsAudio } from "@/components/ElevenLabsAudio";
import { EarlyReaderStoryGenerator } from "@/services/earlyReaderStoryGenerator";
import { UnifiedImageService, type EstablishedCharacter } from "@/services/unifiedImageService";

import { APP_CONFIG } from "@/constants/app";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { processTextForPhonetics } from "@/utils/textProcessor";
import { InlineTutorial } from "@/components/InlineTutorial";
import { FloatingTimer } from "@/components/FloatingTimer";

// Import avatar assets
import avatarBoyPale from "@/assets/avatar-boy-pale.jpg";
import avatarBoyLight from "@/assets/avatar-boy-light.jpg";
import avatarBoyMedium from "@/assets/avatar-boy-medium.jpg";
import avatarBoyOlive from "@/assets/avatar-boy-olive.jpg";
import avatarBoyDark from "@/assets/avatar-boy-dark.jpg";
import avatarGirlPale from "@/assets/avatar-girl-pale.jpg";
import avatarGirlLight from "@/assets/avatar-girl-light.jpg";
import avatarGirlMedium from "@/assets/avatar-girl-medium.jpg";
import avatarGirlOlive from "@/assets/avatar-girl-olive.jpg";
import avatarGirlDark from "@/assets/avatar-girl-dark.jpg";

// Import fallback illustrations
import illustration1 from "@/assets/story-illustration-1.jpg";
import illustration2 from "@/assets/story-illustration-2.jpg";
import illustration3 from "@/assets/story-illustration-3.jpg";
import illustration4 from "@/assets/story-illustration-4.jpg";
import illustration5 from "@/assets/story-illustration-5.jpg";

interface FreeReadingSessionProps {
  userInfo: UserInfo;
  onUpgrade: () => void;
  onCreateAccount: () => void;
  onHome?: () => void;
  onNewStory?: () => void;
  onSessionEnded?: (stats: any) => void;
}

export const FreeReadingSession: React.FC<FreeReadingSessionProps> = ({
  userInfo,
  onUpgrade,
  onCreateAccount,
  onHome,
  onNewStory,
  onSessionEnded,
}) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  
  // Story state
  const [story, setStory] = useState<string[]>([]);
  const [storyImages, setStoryImages] = useState<Array<{url?: string, prompt: string}>>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [currentDifficulty, setCurrentDifficulty] = useState<'easy' | 'medium' | 'hard' | 'expert'>(
    userInfo.readingAbility === 'easy' ? 'easy' :
    userInfo.readingAbility === 'medium' ? 'medium' :
    userInfo.readingAbility === 'hard' ? 'hard' : 'expert'
  );
  
  // Session state
  const [timeRemaining, setTimeRemaining] = useState(APP_CONFIG.FREE_SESSION_DURATION);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [wordsRead, setWordsRead] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showProgressReport, setShowProgressReport] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [tutorialActive, setTutorialActive] = useState(true);
  const [showAddPagesAlert, setShowAddPagesAlert] = useState(false);
  const [hasShownAddPagesAlert, setHasShownAddPagesAlert] = useState(false);

  // Character consistency - store original character details  
  const [establishedCharacter, setEstablishedCharacter] = useState<EstablishedCharacter | null>(null);
  const [originalStoryConfig, setOriginalStoryConfig] = useState<any>(null);

  // Celebration state
  const [celebrationStep, setCelebrationStep] = useState(0); // 0: animation, 1: shaking, 2: progress
  const audioContextRef = useRef<AudioContext | null>(null);
  const celebrationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fallback illustrations
  const illustrations = [illustration1, illustration2, illustration3, illustration4, illustration5];
  
  // Avatar mapping for consistent display across all users
  const getAvatarImage = (avatar: any) => {
    if (!avatar || !avatar.type || !avatar.skinTone) {
      return avatarBoyMedium; // Default fallback
    }
    
    const { type, skinTone } = avatar;
    
    // Handle all avatar types including "prefer-not-to-answer"
    const avatarMap = {
      boy: {
        pale: avatarBoyPale,
        light: avatarBoyLight,
        medium: avatarBoyMedium,
        olive: avatarBoyOlive,
        dark: avatarBoyDark
      },
      girl: {
        pale: avatarGirlPale,
        light: avatarGirlLight,
        medium: avatarGirlMedium,
        olive: avatarGirlOlive,
        dark: avatarGirlDark
      },
      "prefer-not-to-answer": {
        pale: avatarBoyMedium,
        light: avatarBoyMedium,
        medium: avatarBoyMedium,
        olive: avatarBoyMedium,
        dark: avatarBoyMedium
      }
    };
    
    return avatarMap[type as keyof typeof avatarMap]?.[skinTone as keyof typeof avatarMap.boy] || avatarBoyMedium;
  };
  
  const userAvatarImage = getAvatarImage(userInfo?.avatar);

  // Difficulty level mappings - 4 levels but only 2 buttons
  const difficultyLevels = ['easy', 'medium', 'hard', 'expert'] as const;
  
  const getDifficultyIndex = () => {
    return difficultyLevels.indexOf(currentDifficulty);
  };
  
  const getCurrentDifficulty = () => currentDifficulty;
  
  const canDecreaseDifficulty = () => getDifficultyIndex() > 0;
  const canIncreaseDifficulty = () => getDifficultyIndex() < difficultyLevels.length - 1;

  // Generate story on component mount - show immediate fallback then upgrade
  useEffect(() => {
    if (!userInfo.name) return;
    
    // IMMEDIATE: Show fallback story right away (no loading screen)
    const immediateFallback = [
      `Welcome ${userInfo.name}! Your adventure is starting...`,
      "Once upon a time, in a magical world of stories...",
      "There lived characters waiting to meet you.",
      "Adventures, mysteries, and fun await around every corner.",
      "Each page brings new discoveries and excitement.",
      "The story grows more amazing as you read on.",
      "Characters come to life with every word you read.",
      "Magic happens when imagination meets curiosity.",
      "Your journey through this tale is just beginning.",
      "Get ready for the most wonderful reading adventure!"
    ];
    
    // Set immediate story to prevent loading screen
    setStory(immediateFallback);
    setWordsRead(immediateFallback.join(' ').split(' ').length);
    setIsLoading(false); // No loading screen!
    
    // AUTO-START: Begin timer immediately and start tutorial
    setSessionStarted(true);
    setSessionStartTime(new Date());
    
    // BACKGROUND: Generate real story asynchronously
    let isCancelled = false;
    
    const generateRealStory = async () => {
      try {
        console.log('Generating enhanced story for user:', userInfo.name);
        
        // Build interests array from non-empty user preferences
        const interests = [
          userInfo.hobbies, 
          userInfo.favoriteAnimal, 
          userInfo.specialRequest,
          userInfo.favoriteFood
        ].filter(item => item && item.trim().length > 0);
        
        // If no interests, add some defaults based on age
        if (interests.length === 0) {
          interests.push(userInfo.age <= 6 ? 'animals' : userInfo.age <= 8 ? 'friendship' : 'adventure');
        }
        
        const characterDescription = userInfo.avatar ? `, a curious and brave ${userInfo.avatar.type === 'boy' ? 'boy' : userInfo.avatar.type === 'girl' ? 'girl' : 'child'}` : '';
        
        const storyConfig = {
          age: userInfo.age,
          gradeLevel: userInfo.gradeLevel || userInfo.grade,
          readingLevel: currentDifficulty,
          interests: interests,
          theme: userInfo.specialRequest || 'adventure',
          userName: userInfo.name,
          characterDescription,
          avatar: userInfo.avatar,
          favoriteColor: userInfo.favoriteColor,
          favoriteAnimal: userInfo.favoriteAnimal,
          hobbies: userInfo.hobbies,
          favoriteFood: userInfo.favoriteFood,
          nativeLanguage: userInfo.nativeLanguage || 'en'
        };

        // Store the original character details for consistency
        setOriginalStoryConfig(storyConfig);
        const characterDetails = UnifiedImageService.establishCharacterConsistency(userInfo);
        setEstablishedCharacter(characterDetails);

        console.log('Story config:', storyConfig);

        if (!isCancelled) {
          // Generate story content using the new generator
          const { pages, config } = EarlyReaderStoryGenerator.generateStory(
            userInfo, 
            currentDifficulty as 'easy' | 'medium' | 'hard' | 'expert', 
            10
          );
          const generatedStory = { pages, config, images: [], wordCount: pages.join(' ').split(' ').length, title: `${userInfo.name}'s Adventure`, theme: 'adventure', readingLevel: currentDifficulty };
          setStoryImages(generatedStory.images || []);
          
          if (!isCancelled) {
            console.log('Generated enhanced story, replacing fallback...');
            
            // Ensure we have exactly 10 pages
            const targetPages = 10;
            let pages = generatedStory.pages;
            
            if (pages.length < targetPages) {
              const additionalPages = targetPages - pages.length;
              for (let i = 0; i < additionalPages; i++) {
                pages.push(`${userInfo.name}'s adventure continues with more exciting discoveries...`);
              }
            } else if (pages.length > targetPages) {
              pages = pages.slice(0, targetPages);
            }
            
            // Smoothly replace the fallback story
            setStory(pages);
            setWordsRead(generatedStory.wordCount);
            
            // Show success message
            toast({
              title: "Story Ready!",
              description: "Custom images are generating in the background",
              duration: 3000,
            });

            // Now generate images progressively in the background using UnifiedImageService
            const startProgressiveImageGeneration = async () => {
              // Establish character once for consistency across all images
              const characterConsistency = UnifiedImageService.establishCharacterConsistency(userInfo);
              console.log(`Starting progressive image generation with character consistency for ${characterConsistency.userName}`);
              
              for (let i = 0; i < Math.min(pages.length, 10); i++) {
                try {
                  console.log(`Generating image ${i + 1}/${pages.length} for ${characterConsistency.userName}...`);
                  
                  const imageOptions = {
                    pageIndex: i,
                    totalPages: pages.length,
                    storyText: pages[i],
                    userInfo: userInfo,
                    difficulty: getCurrentDifficulty(),
                    establishedCharacter: characterConsistency,
                    isNewStory: false
                  };
                  
                  const generatedImage = await UnifiedImageService.generateStoryImage(imageOptions);
                  
                  // Update story images with generated result
                  setStoryImages(prev => {
                    const newImages = [...prev];
                    newImages[i] = { url: generatedImage.url, prompt: generatedImage.prompt };
                    return newImages;
                  });
                  
                  console.log(`Successfully generated consistent image for ${characterConsistency.userName} (page ${i + 1})`);
                  
                } catch (imageError) {
                  console.log(`Image generation failed for page ${i + 1}, using fallback:`, imageError);
                  
                  // Fallback to stock illustrations
                  const pageImage = { 
                    url: illustrations[i % illustrations.length], 
                    prompt: pages[i] 
                  };
                  
                  if (!isCancelled && pageImage.url) {
                    setStoryImages(prevImages => {
                      const newImages = [...prevImages];
                      newImages[i] = pageImage;
                      return newImages;
                    });
                    console.log(`Updated image for page ${i + 1}`);
                  }
                }
                
                // Small delay between generations to avoid overwhelming the API
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            };

            // Start progressive image generation (non-blocking)
            startProgressiveImageGeneration();
          }
        }
        
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to generate enhanced story:', error);
        }
      }
    };
    
    // Start background story generation (non-blocking)
    generateRealStory();
    
    // Cleanup function to prevent race conditions
    return () => {
      isCancelled = true;
    };
  }, [userInfo.name]);

  // Flash "add more pages" alert when on next-to-last page with >1 minute remaining
  useEffect(() => {
    const pagesLeft = story.length - currentPage;
    if (timeRemaining > 1 * 60 && pagesLeft === 1 && !hasShownAddPagesAlert && !showAddPagesAlert && sessionStarted) {
      setHasShownAddPagesAlert(true);
      setShowAddPagesAlert(true);
      
      const timer = setTimeout(() => {
        setShowAddPagesAlert(false);
      }, 2500);
      
      return () => clearTimeout(timer);
    }
  }, [timeRemaining, currentPage, story.length, hasShownAddPagesAlert, showAddPagesAlert, sessionStarted]);
  
  // Reset the flag when more pages are added or we move away from the last page
  useEffect(() => {
    const pagesLeft = story.length - currentPage;
    if (pagesLeft > 1) {
      setHasShownAddPagesAlert(false);
    }
  }, [currentPage, story.length]);

  // Function to change difficulty easier/harder - SMOOTH, NO RELOAD
  const changeDifficulty = async (direction: 'easier' | 'harder') => {
    const currentIndex = getDifficultyIndex();
    let newIndex: number;
    
    if (direction === 'easier' && canDecreaseDifficulty()) {
      newIndex = currentIndex - 1;
    } else if (direction === 'harder' && canIncreaseDifficulty()) {
      newIndex = currentIndex + 1;
    } else {
      return;
    }
    
    const newDifficulty = difficultyLevels[newIndex];
    
    // Show immediate feedback
    toast({
      title: `Updating to ${newDifficulty} level...`,
      description: "Story is being adjusted for you",
      duration: 2000,
    });
    
    // Update difficulty immediately (no page reload)
    setCurrentDifficulty(newDifficulty);
    
    // Generate new story content smoothly in background
    const generateUpdatedStory = async () => {
      try {
        if (!establishedCharacter) return;
        
        // Generate new story at the new difficulty level with SAME page count
        const currentPageCount = story.length;
        const { pages: newPages, config: newConfig } = EarlyReaderStoryGenerator.generateStory(
          userInfo, 
          newDifficulty as 'easy' | 'medium' | 'hard' | 'expert', 
          currentPageCount
        );
        const updatedStory = { pages: newPages, config: newConfig, images: [], wordCount: newPages.join(' ').split(' ').length };
        
        // Ensure exact same page count (no change in navigation)
        let pages = updatedStory.pages;
        if (pages.length !== currentPageCount) {
          if (pages.length < currentPageCount) {
            const additionalPages = currentPageCount - pages.length;
            for (let i = 0; i < additionalPages; i++) {
              pages.push(`${userInfo.name}'s adventure continues with more exciting discoveries...`);
            }
          } else {
            pages = pages.slice(0, currentPageCount);
          }
        }
        
        // Update story and reset images for progressive generation
        setStory(pages);
        setStoryImages([]);
        setWordsRead(updatedStory.wordCount);
        
        // Keep user on same relative page position
        const maxPage = Math.max(0, pages.length - 1);
        setCurrentPage(Math.min(currentPage, maxPage));
        
        // Success feedback
        toast({
          title: "Story Updated!",
          description: `Now reading at ${newDifficulty} level`,
          duration: 2000,
        });

        // IMMEDIATELY start progressive image generation for new content (NON-BLOCKING)
        const startProgressiveImageGeneration = async () => {
          for (let i = 0; i < Math.min(pages.length, 10); i++) {
            try {
              console.log(`Generating image ${i + 1}/${pages.length} for ${establishedCharacter.userName} at ${getCurrentDifficulty()} difficulty...`);
              
              const imageOptions = {
                pageIndex: i,
                totalPages: pages.length,
                storyText: pages[i],
                userInfo: userInfo,
                difficulty: getCurrentDifficulty(),
                establishedCharacter: establishedCharacter,
                isNewStory: false
              };
              
              const generatedImage = await UnifiedImageService.generateStoryImage(imageOptions);
              
              // Update story images with generated result
              setStoryImages(prev => {
                const newImages = [...prev];
                newImages[i] = { url: generatedImage.url, prompt: generatedImage.prompt };
                return newImages;
              });
              
              console.log(`Successfully generated image for ${establishedCharacter.userName} (page ${i + 1}) after difficulty change`);
              
            } catch (imageError) {
              console.log(`Image generation failed for page ${i + 1}, using fallback:`, imageError);
                  
              // Fallback to stock illustrations
              const pageImage = { 
                url: illustrations[i % illustrations.length], 
                prompt: pages[i] 
              };
              
              if (pageImage.url) {
                setStoryImages(prevImages => {
                  const newImages = [...prevImages];
                  newImages[i] = pageImage;
                  return newImages;
                });
              }
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        };

        // Start progressive image generation (non-blocking)
        startProgressiveImageGeneration();
        
      } catch (error) {
        console.error('Failed to update story for new difficulty:', error);
        toast({
          title: "Update Failed",
          description: "Keeping current story content",
          duration: 2000,
        });
      }
    };
    
    // Start background story update (non-blocking)
    generateUpdatedStory();
  };
  
  // Function to add more pages to the story
  const addMorePages = async () => {
    if (isLoading || !establishedCharacter) return;
    
    try {
      console.log('Maintaining character consistency for page extension:', establishedCharacter.userName);

      // Generate new pages using the new generator
      const { pages: newPages, config } = EarlyReaderStoryGenerator.generateStory(
        userInfo, 
        currentDifficulty as 'easy' | 'medium' | 'hard' | 'expert', 
        5
      );
      
      // Add new pages and generate images for them
      const startPageIndex = story.length;
      setStory(prev => [...prev, ...newPages]);
      
      // Initialize placeholder images
      const placeholderImages = newPages.map((_, i) => ({ 
        url: '', 
        prompt: `Consistent character ${establishedCharacter.userName} as established in the story`,
        pageIndex: startPageIndex + i
      }));
      setStoryImages(prev => [...prev, ...placeholderImages]);
      
      // Generate images for new pages progressively using UnifiedImageService
      const generateNewPageImages = async () => {
        for (let i = 0; i < newPages.length; i++) {
          try {
            console.log(`Generating image for new page ${startPageIndex + i + 1} for ${establishedCharacter.userName}...`);
            
            const imageOptions = {
              pageIndex: startPageIndex + i,
              totalPages: story.length + newPages.length,
              storyText: newPages[i],
              userInfo: userInfo,
              difficulty: getCurrentDifficulty(),
              establishedCharacter: establishedCharacter,
              isNewStory: false
            };
            
            const generatedImage = await UnifiedImageService.generateStoryImage(imageOptions);
            
            // Update story images with generated result
            setStoryImages(prev => {
              const newImages = [...prev];
              newImages[startPageIndex + i] = { url: generatedImage.url, prompt: generatedImage.prompt };
              return newImages;
            });
            
            console.log(`Successfully generated image for new page ${startPageIndex + i + 1}`);
            
          } catch (imageError) {
            console.log(`Image generation failed for new page ${startPageIndex + i + 1}, using fallback:`, imageError);
            
            // Fallback to stock illustrations
            const pageImage = { 
              url: illustrations[(startPageIndex + i) % illustrations.length], 
              prompt: newPages[i] 
            };
            
            setStoryImages(prevImages => {
              const newImages = [...prevImages];
              newImages[startPageIndex + i] = pageImage;
              return newImages;
            });
          }
          
          // Add delay between requests
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      };

      // Start progressive image generation (non-blocking)
      generateNewPageImages();
      
      // Update word count for session stats but don't reset timer
      setWordsRead(prev => prev + newPages.join(' ').split(' ').length);
    } catch (error) {
      console.error('Failed to add more pages:', error);
    }
  };

  // Start session when user begins reading
  const startSession = () => {
    if (!sessionStarted) {
      setSessionStarted(true);
      setSessionStartTime(new Date());
    }
  };

  // Timer countdown (only starts when session is started and not paused)
  useEffect(() => {
    if (!sessionStarted || timeRemaining <= 0 || sessionEnded || isPaused) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSessionEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionStarted, timeRemaining, sessionEnded, isPaused]);

  // Celebration animations and sounds
  const startCelebration = () => {
    setShowCelebration(true);
    setCelebrationStep(0);
    
    // Play celebration sound
    playJoyfulMelody();
    
    // Step 1: Confetti animation (3 seconds)
    celebrationTimerRef.current = setTimeout(() => {
      setCelebrationStep(1);
      
      // Step 2: Screen shaking (2 seconds)
      celebrationTimerRef.current = setTimeout(() => {
        setCelebrationStep(2);
        setShowProgressReport(true);
        
        // Final step: Show progress report (1 second delay)
        celebrationTimerRef.current = setTimeout(() => {
          setShowCelebration(false);
        }, 1000);
      }, 2000);
    }, 3000);
  };

  const playJoyfulMelody = () => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioContext = audioContextRef.current;
      
      // Create a joyful celebration melody
      const playNote = (frequency: number, startTime: number, duration: number, volume: number = 0.1) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, startTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };
      
      // Play "Happy Birthday" style melody
      const now = audioContext.currentTime;
      const notes = [
        { freq: 523.25, time: 0, duration: 0.3 },    // C5
        { freq: 523.25, time: 0.3, duration: 0.2 },  // C5
        { freq: 587.33, time: 0.5, duration: 0.4 },  // D5
        { freq: 523.25, time: 0.9, duration: 0.4 },  // C5
        { freq: 698.46, time: 1.3, duration: 0.4 },  // F5
        { freq: 659.25, time: 1.7, duration: 0.8 },  // E5
        
        // Repeat pattern higher
        { freq: 783.99, time: 2.7, duration: 0.3 },  // G5
        { freq: 783.99, time: 3.0, duration: 0.2 },  // G5
        { freq: 880.00, time: 3.2, duration: 0.4 },  // A5
        { freq: 783.99, time: 3.6, duration: 0.4 },  // G5
        { freq: 1046.50, time: 4.0, duration: 0.4 }, // C6
        { freq: 987.77, time: 4.4, duration: 0.8 },  // B5
      ];
      
      notes.forEach(note => {
        playNote(note.freq, now + note.time, note.duration);
      });
      
      // Clean up
      setTimeout(() => {
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      }, 6000);
    } catch (error) {
      console.error('Audio playback failed:', error);
    }
  };

  const handleSessionEnd = () => {
    if (sessionEnded) return;
    
    setSessionEnded(true);
    startCelebration();
  };

  // Calculate session stats
  const calculateStats = () => {
    const timeSpent = APP_CONFIG.FREE_SESSION_DURATION - timeRemaining;
    const readingSpeed = Math.round((wordsRead / (timeSpent / 60)) || 0);
    const pagesRead = currentPage + 1;
    const completionRate = Math.round((pagesRead / story.length) * 100);
    
    return {
      wordsRead,
      timeSpent,
      pagesRead,
      totalPages: story.length,
      accuracy: 100, // Placeholder - would be calculated based on comprehension questions
      currentDifficulty: userInfo.readingLevel || 'medium',
      readingSpeed,
      completionRate
    };
  };

  // Navigate to session ended page
  const navigateToSessionEnd = (sessionStats?: any) => {
    const stats = sessionStats || calculateStats();
    onSessionEnded?.(stats);
  };

  if (isLoading) {
    console.log('FreeReadingSession userInfo:', userInfo); // Debug log
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t("freeReadingSession.loading.title")}</h2>
          <p className="text-gray-600">
            {userInfo.name 
              ? `Generating personalized content for ${userInfo.name}`
              : "Generating personalized content..."
            }
          </p>
        </div>
      </div>
    );
  }

  const currentStory = story[currentPage] || "Loading...";
  const progress = ((currentPage + 1) / story.length) * 100;
  const currentIllustration = illustrations[currentPage % illustrations.length];
  const stats = calculateStats();

  return (
    <>
      
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col ${
        celebrationStep === 1 ? 'animate-pulse' : ''
      }`}>
        {/* FloatingTimer Component */}
        {sessionStarted && timeRemaining > 0 && !sessionEnded && (
          <FloatingTimer
            timeRemaining={timeRemaining}
            isReading={!isPaused}
            onToggleReading={() => setIsPaused(!isPaused)}
            onReduceTime={() => {
              if (timeRemaining > 5 * 60) {
                setTimeRemaining(prev => Math.max(5 * 60, prev - 5 * 60));
              }
            }}
            onEndSession={() => {
              // FloatingTimer will handle the celebration and redirect
            }}
            pagesRemaining={story.length - currentPage}
            currentParagraph={currentPage}
            onSessionEnded={navigateToSessionEnd}
            sessionStats={calculateStats()}
          />
        )}

      {/* Free Trial Badge - Moved to bottom right to avoid timer overlap */}
      {!sessionEnded && (
        <div className="fixed bottom-6 right-6 z-40">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-full shadow-xl border-2 border-white">
            <div className="flex items-center gap-2 animate-bounce">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-bold">{t("freeReadingSession.freeTrial")}</span>
            </div>
          </div>
        </div>
      )}

      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
          {/* Confetti rain */}
          {celebrationStep >= 0 && [...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20px`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
                transform: `translateY(${window.innerHeight + 100}px)`,
              }}
            >
              <div className={`w-3 h-3 rounded-full ${
                ['bg-yellow-400', 'bg-pink-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400'][i % 5]
              }`} />
            </div>
          ))}
          
          {/* Celebration text */}
          {celebrationStep >= 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center animate-scale-in">
                <div className="text-6xl mb-4">🎉</div>
                <h1 className="text-4xl font-bold text-yellow-600 mb-2 animate-bounce">
                  {t("freeReadingSession.celebration.congratulations")}
                </h1>
                <p className="text-xl text-gray-700">{t("freeReadingSession.celebration.sessionComplete")}</p>
              </div>
            </div>
          )}
          
          {/* Screen shake effect */}
          {celebrationStep === 1 && (
            <div className="absolute inset-0 bg-yellow-100/30 animate-pulse" />
          )}
        </div>
      )}

      {/* Progress Report Modal */}
      {showProgressReport && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md mx-auto animate-scale-in">
            <CardContent className="p-6 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{t("freeReadingSession.progressReport.title")}</h2>
                <p className="text-gray-600">{t("freeReadingSession.progressReport.description")}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.wordsRead}</div>
                  <div className="text-sm text-gray-600">{t("freeReadingSession.progressReport.stats.wordsRead")}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.pagesRead}</div>
                  <div className="text-sm text-gray-600">{t("freeReadingSession.progressReport.stats.pages")}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{Math.floor(stats.timeSpent / 60)}m</div>
                  <div className="text-sm text-gray-600">{t("freeReadingSession.progressReport.stats.readingTime")}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.readingSpeed}</div>
                  <div className="text-sm text-gray-600">{t("freeReadingSession.progressReport.stats.wordsPerMin")}</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>{t("freeReadingSession.progressReport.stats.storyProgress")}</span>
                  <span>{stats.completionRate}%</span>
                </div>
                <Progress value={stats.completionRate} className="h-3" />
              </div>

              {/* Premium upgrade CTA */}
              <div className="border-t pt-6">
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 mb-4">
                  <Crown className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-bold text-purple-800 mb-2">{t("freeReadingSession.progressReport.premium.title")}</h3>
                  <ul className="text-sm text-purple-700 text-left space-y-1">
                    <li>{t("freeReadingSession.progressReport.premium.features.unlimitedTime")}</li>
                    <li>{t("freeReadingSession.progressReport.premium.features.thousandsStories")}</li>
                    <li>{t("freeReadingSession.progressReport.premium.features.personalizedPath")}</li>
                    <li>{t("freeReadingSession.progressReport.premium.features.progressTracking")}</li>
                    <li>{t("freeReadingSession.progressReport.premium.features.achievements")}</li>
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Button onClick={onUpgrade} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Crown className="w-4 h-4 mr-2" />
                    {t("freeReadingSession.progressReport.premium.upgradeNow")}
                  </Button>
                  <Button onClick={onCreateAccount} variant="outline" className="flex-1">
                    {t("freeReadingSession.progressReport.premium.createAccount")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content - Hidden during progress report */}
      {!showProgressReport && (
        <>
          {/* Header */}
          <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* User Avatar - Consistent across all users */}
                  <div className="flex items-center gap-3">
                    <img 
                      src={userAvatarImage} 
                      alt={`${userInfo.name}'s avatar`}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-primary/20 shadow-sm"
                    />
                    <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-xl font-bold text-gray-800">
                      {userInfo.name}'s Reading Adventure
                    </h1>
                    <p className="text-sm text-gray-600">
                      Page {currentPage + 1} of {story.length}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
                  {/* Navigation buttons - Mobile responsive */}
                  <Button onClick={onNewStory} variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                    <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">New Story</span>
                  </Button>
                  <Button onClick={onHome} variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                    <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Home</span>
                  </Button>
                  
                  {/* Start session button - Mobile responsive */}
                  {!sessionStarted && (
                    <Button onClick={startSession} className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white text-xs sm:text-sm px-2 sm:px-4">
                      <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="hidden xs:inline">{t("freeReadingSession.session.startReading")}</span>
                      <span className="xs:hidden">Start</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Main Content - Overhauled Layout with Proper Scrolling */}
          <main className="flex-1 flex flex-col overflow-hidden">
            <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 flex-1 flex flex-col">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto flex-1 overflow-hidden">
                
                {/* Story Illustration - Mobile Optimized */}
                <div className="order-2 lg:order-1 flex flex-col">
                  <Card className="flex-1 min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]">
                    <CardContent className="p-3 sm:p-4 lg:p-6 h-full">
                      <img 
                        src={storyImages[currentPage]?.url || illustrations[currentPage % illustrations.length]}
                        alt={`Story illustration for page ${currentPage + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Story Text Panel - Overhauled with Proper Layout */}
                <div className="order-1 lg:order-2 flex flex-col">
                  <Card className="flex-1 flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg">
                    
                    {/* Fixed Header Section */}
                    <div className="flex-shrink-0 p-3 sm:p-4 lg:p-6 border-b border-gray-100">
                      {/* Difficulty Level Selector */}
                      <div className="mb-4 reading-level-controls">
                        <div className="flex gap-3 justify-center items-center">
                          <div className="relative group">
                            <Button
                              onClick={() => changeDifficulty('easier')}
                              disabled={!canDecreaseDifficulty() || isLoading}
                              variant="outline"
                              size="sm"
                              className="p-2 transition-all duration-200 hover:scale-105 hover:shadow-md"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                              {t('freeReadingSession.readingLevel.easier')}
                            </div>
                          </div>
                          
                          <span className="text-sm font-medium text-gray-600">
                            {t('freeReadingSession.readingLevel.label')}
                          </span>
                          
                          <div className="relative group">
                            <Button
                              onClick={() => changeDifficulty('harder')}
                              disabled={!canIncreaseDifficulty() || isLoading}
                              variant="outline"
                              size="sm"
                              className="p-2 transition-all duration-200 hover:scale-105 hover:shadow-md"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </Button>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                              {t('freeReadingSession.readingLevel.harder')}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <Progress value={progress} className="h-2" />
                        <p className="text-sm text-gray-600 mt-2 text-center">
                          Reading Progress: {Math.round(progress)}%
                        </p>
                      </div>
                    </div>

                    {/* Scrollable Story Content */}
                    <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
                      <div className="flex items-center justify-center min-h-full">
                        <div className="text-center w-full">
                          {/* Apply reading level configuration with proper responsive design */}
                          {(() => {
                            const config = EarlyReaderStoryGenerator.getReadingConfigForDifficulty(currentDifficulty);
                            return (
                              <div className={`${config.fontSize} ${config.lineHeight} ${config.spacing} font-medium text-gray-800 max-w-full break-words hyphens-auto leading-relaxed`}>
                                {processTextForPhonetics(
                                  currentStory, 
                                  "", 
                                  currentDifficulty as "easy" | "medium" | "hard" | "expert",
                                  userInfo
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Audio Controls Section */}
                    {sessionStarted && (
                      <div className="flex-shrink-0 p-3 sm:p-4 lg:p-6 border-t border-gray-100 audio-controls">
                        <InteractiveAudioReading 
                          text={currentStory}
                          userInfo={userInfo}
                          isEnabled={true}
                        />
                      </div>
                    )}

                    {/* Fixed Navigation Footer */}
                    <div className="flex-shrink-0 p-3 sm:p-4 lg:p-6 border-t border-gray-100 bg-gray-50/50">
                      <div className="flex justify-between items-center story-navigation">
                        <Button 
                          onClick={() => {
                            setCurrentPage(Math.max(0, currentPage - 1));
                          }}
                          disabled={currentPage === 0}
                          variant="outline"
                          size="sm"
                          className="flex-shrink-0 min-w-[80px]"
                        >
                          {t("freeReadingSession.navigation.previous")}
                        </Button>
                        
                        <div className="flex flex-col items-center gap-1 px-2">
                          <span className="text-xs sm:text-sm font-medium text-gray-600 whitespace-nowrap">
                            {currentPage + 1} / {story.length}
                          </span>
                          <div className="relative group">
                            <Button
                              onClick={addMorePages}
                              disabled={isLoading}
                              variant="outline"
                              size="sm"
                              className={`p-1.5 sm:p-2 transition-all duration-300 ${
                                showAddPagesAlert 
                                  ? 'animate-bounce bg-amber-100 border-amber-400 text-amber-700 shadow-lg ring-2 ring-amber-300' 
                                  : 'bg-blue-50 hover:bg-blue-100 border-blue-200'
                              }`}
                            >
                              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                            
                            {/* Alert Tooltip with X button */}
                            {showAddPagesAlert && (
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-amber-600 text-white px-2 py-1 rounded text-xs whitespace-nowrap z-50 animate-pulse">
                                <div className="flex items-center gap-2">
                                  <span>⏰ Add more pages now!</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowAddPagesAlert(false);
                                    }}
                                    className="text-white hover:text-amber-200 transition-colors"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                                {/* Arrow pointing down */}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-2 border-r-2 border-t-4 border-transparent border-t-amber-600"></div>
                              </div>
                            )}
                            
                            {/* Regular Tooltip */}
                            {!showAddPagesAlert && (
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 rounded text-xs transition-all duration-300 pointer-events-none whitespace-nowrap z-50 bg-gray-800 text-white opacity-0 group-hover:opacity-100">
                                Add 5 more pages
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <Button 
                          onClick={() => {
                            setCurrentPage(Math.min(story.length - 1, currentPage + 1));
                          }}
                          disabled={currentPage >= story.length - 1}
                          variant="outline"
                          size="sm"
                          className="flex-shrink-0 min-w-[80px]"
                        >
                          {t("freeReadingSession.navigation.next")}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </main>
          
          {/* New Inline Tutorial */}
          <InlineTutorial 
            isActive={tutorialActive} 
            onComplete={() => setTutorialActive(false)} 
          />
        </>
      )}
      </div>
    </>
  );
};
