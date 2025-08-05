import { useState, useEffect, useRef } from "react";
import { MobileOptimizedButton } from "@/components/MobileOptimizedButton";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Timer, Star, Crown, Sparkles, TrendingUp, Award, Clock, Play, Pause, Minus, X, ChevronUp, ChevronDown, Plus, Home, RotateCcw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { UserInfo, SessionStats } from "@/types";
import type { Achievement } from "@/services/gamificationService";
import { InteractiveAudioReading } from "@/components/InteractiveAudioReading";
import { ElevenLabsAudio } from "@/components/ElevenLabsAudio";
import { UniversalContentManager } from "@/services/universalContentManager";
import { Level0StoryProcessor } from "@/services/level0StoryProcessor";
import { UnifiedImageService, type EstablishedCharacter } from "@/services/unifiedImageService";
import { FreeTrialPageLimitError } from "@/utils/errorHandling";
import { SessionPageTracker } from "@/services/sessionPageTracker";
import { ProgressIndicator } from "@/components/ui/progress-indicator";

import { APP_CONFIG } from "@/constants/app";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { processTextForPhonetics } from "@/utils/textProcessor";
import { TutorialOverlay } from "@/components/TutorialOverlay";
import { FloatingTimer } from "@/components/FloatingTimer";
import { useGamification } from "@/hooks/useGamification";
import { AchievementNotification } from "@/components/AchievementNotification";
import { ProgressTowers } from "@/components/ProgressTowers";
import { setupGamificationGlobals, cleanupGamificationGlobals } from "@/utils/gamificationGlobals";

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
  isPremium?: boolean;
}

export const FreeReadingSession: React.FC<FreeReadingSessionProps> = ({
  userInfo,
  onUpgrade,
  onCreateAccount,
  onHome,
  onNewStory,
  onSessionEnded,
  isPremium = false,
}) => {
  console.log('🎮 FreeReadingSession: Component initializing...', { userInfo: !!userInfo, isPremium });
  const { toast } = useToast();
  const { t } = useTranslation();

  // Initialize gamification (no persistence for free trial)
  const {
    userStats,
    recordReadingSession,
    addVocabularyWord,
    getNextAchievement,
    hasNewAchievements
  } = useGamification({
    userId: userInfo?.name || 'guest',
    enablePersistence: false, // Free trial users don't get persistence
    userType: 'free', // Free trial users don't get streak achievements
    onAchievementUnlocked: (achievement) => {
      setCurrentAchievement(achievement);
    },
    onLevelUp: (newLevel) => {
      // Level up happens silently, no toast notification
      console.log('Level up to:', newLevel);
    }
  });

  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  
  // Story state
  const [story, setStory] = useState<string[]>([]);
  const [storyImages, setStoryImages] = useState<Array<{url?: string, prompt: string}>>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStarted, setSessionStarted] = useState(false);
  
  // Session page tracking
  const [pageInfo, setPageInfo] = useState(() => SessionPageTracker.getPageInfo());
  const [currentDifficulty, setCurrentDifficulty] = useState<'beginner' | 'easy' | 'medium' | 'hard' | 'expert'>(
    userInfo.readingAbility === 'beginner' ? 'beginner' :
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
  const [storyCompleted, setStoryCompleted] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [tutorialActive, setTutorialActive] = useState(true);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);
  const [showAddPagesAlert, setShowAddPagesAlert] = useState(false);
  const [showReminderPulse, setShowReminderPulse] = useState(false);
  const [hasShownAddPagesAlert, setHasShownAddPagesAlert] = useState(false);
  const [storyMaxPages, setStoryMaxPages] = useState(5); // Track current story's maximum possible pages

  // Character consistency - store original character details  
  const [establishedCharacter, setEstablishedCharacter] = useState<EstablishedCharacter | null>(null);
  const [originalStoryConfig, setOriginalStoryConfig] = useState<any>(null);

  // Celebration state
  const [celebrationStep, setCelebrationStep] = useState(0); // 0: animation, 1: shaking, 2: progress
  const audioContextRef = useRef<AudioContext | null>(null);
  const celebrationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle story completion toast to avoid React warning - only trigger once per completion
  const [hasShownCompletionToast, setHasShownCompletionToast] = useState(false);
  
  // Word highlighting for audio
  const [wordHighlightIndex, setWordHighlightIndex] = useState<number>(-1);
  
  // Mobile specific state
  const isMobile = useIsMobile();
  
  // Word highlighting callback for audio
  const handleWordHighlight = (wordIndex: number) => {
    setWordHighlightIndex(wordIndex);
    console.log('Highlighting word index:', wordIndex);
  };
  
  // Utility function to calculate real-time word count from current story
  const calculateActualWordsRead = () => {
    const storyText = story.join(' ');
    const actualCount = storyText.split(/\s+/).filter(word => word.trim().length > 0).length;
    console.log('FreeReadingSession word count debug:', {
      staleWordsRead: wordsRead,
      actualWordsRead: actualCount,
      storyPages: story.length,
      currentPage: currentPage + 1
    });
    return actualCount;
  };
  
  useEffect(() => {
    if (storyCompleted && !sessionEnded && !hasShownCompletionToast) {
      console.log('FreeReadingSession: Story completed, but skipping toast (Progress Towers will show feedback)');
      setHasShownCompletionToast(true);
    }
  }, [storyCompleted, sessionEnded, hasShownCompletionToast]);

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
  const difficultyLevels = ['beginner', 'easy', 'medium', 'hard', 'expert'] as const;
  
  const getDifficultyIndex = () => {
    return difficultyLevels.indexOf(currentDifficulty);
  };
  
  const getCurrentDifficulty = () => currentDifficulty;
  
  const canDecreaseDifficulty = () => getDifficultyIndex() > 0;
  const canIncreaseDifficulty = () => getDifficultyIndex() < difficultyLevels.length - 1;

  // Setup gamification globals on mount (no persistence for free trial)
  useEffect(() => {
    console.log('🎮 FreeReadingSession: Component mounted, checking gamification setup...', {
      addVocabularyWordAvailable: !!addVocabularyWord,
      userInfoName: userInfo?.name,
      vocabularyWordsLearned: userStats.vocabularyWordsLearned,
      environment: window.location.href.includes('preview') ? 'preview' : 'console'
    });
    
    if (addVocabularyWord && userInfo?.name) {
      console.log('🎮 FreeReadingSession: Setting up gamification globals...');
      setupGamificationGlobals(addVocabularyWord, false);
      console.log('🎮 FreeReadingSession: Gamification globals setup complete');
      
      // Test the global function
      console.log('🎮 FreeReadingSession: Testing global function availability...');
      console.log('🎮 FreeReadingSession: window.addVocabularyWord available:', !!(window as any).addVocabularyWord);
    } else {
      console.error('❌ FreeReadingSession: Cannot setup gamification - missing requirements:', {
        hasAddVocabularyWord: !!addVocabularyWord,
        hasUserName: !!userInfo?.name
      });
    }
    
    return () => {
      console.log('🎮 FreeReadingSession: Cleaning up gamification globals');
      cleanupGamificationGlobals();
    };
  }, [addVocabularyWord, userInfo?.name]); // Add userInfo.name to deps

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
          // Route Level 0 through hierarchical template system, others through Universal Content Manager
          let storyResult;
          
          if (currentDifficulty === 'beginner') {
            console.log('🚀 FreeReadingSession: Using Level0StoryProcessor for Level 0 (beginner)');
            console.log('📊 FreeReadingSession: Current difficulty:', currentDifficulty);
            console.log('🎯 FreeReadingSession: User info:', userInfo);
            
            const level0Result = await Level0StoryProcessor.generateStory(userInfo);
            storyResult = { 
              segments: level0Result.content.map(text => ({ text })),
              wordCount: level0Result.content.join(' ').split(' ').length,
              title: `${userInfo.name}'s Adventure`
            };
            console.log('📚 FreeReadingSession: Level 0 story generated via hierarchical system');
          } else {
            console.log('🚀 FreeReadingSession: Using UniversalContentManager for Level 1+ difficulties');
            console.log('📊 FreeReadingSession: Current difficulty:', currentDifficulty);
            console.log('🎯 FreeReadingSession: User info:', userInfo);
            console.log('🔍 FreeReadingSession: Current story BEFORE generation:', story.slice(0, 2));
            
            storyResult = await UniversalContentManager.generateNewStoryWithAntiRepetition(
              userInfo, 
              currentDifficulty,
              { isPremium: false, userId: userInfo.name }
            );
          }
          const generatedStory = { 
            pages: storyResult.segments.map(s => s.text), 
            config: { readingLevel: currentDifficulty }, 
            images: [], 
            wordCount: storyResult.wordCount, 
            title: storyResult.title, 
            theme: 'adventure', 
            readingLevel: currentDifficulty
          };
          setStoryImages(generatedStory.images || []);
          
          if (!isCancelled) {
            console.log('📚 FreeReadingSession: Generated enhanced story, replacing fallback...');
            console.log('📖 FreeReadingSession: Story first page:', generatedStory.pages[0]);
            console.log('🔍 FreeReadingSession: Story pages sample:', generatedStory.pages.slice(0, 3));
            console.log('📊 FreeReadingSession: Total pages generated:', generatedStory.pages.length);
            
            // Ensure we have exactly 5 pages for unified free trial experience
            const targetPages = 5;
            let pages = generatedStory.pages;
            
            // Trust the enhanced template system to provide exactly the right number of pages
            // No more hardcoded fallbacks - the hierarchical system handles content generation
            if (pages.length < targetPages) {
              console.log(`📊 FreeReadingSession: Story generator returned ${pages.length} pages, expected ${targetPages}. Trusting system to handle extensions.`);
            } else if (pages.length > targetPages) {
              console.log(`📊 FreeReadingSession: Story generator returned ${pages.length} pages, trimming to ${targetPages}.`);
              pages = pages.slice(0, targetPages);
            }
            
            // Smoothly replace the fallback story
            setStory(pages);
            setWordsRead(generatedStory.wordCount);
            
            // Show success message removed - no longer showing notification

            // Now generate images progressively in the background using UnifiedImageService
            const startProgressiveImageGeneration = async () => {
              // Establish character once for consistency across all images
              const characterConsistency = UnifiedImageService.establishCharacterConsistency(userInfo);
              console.log(`Starting progressive image generation with character consistency for ${characterConsistency.userName}`);
              
              for (let i = 0; i < pages.length; i++) {
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

  // Flash "add more pages" alert when on LAST page with >1 minute remaining
  useEffect(() => {
    const isOnLastPage = currentPage === story.length - 1;
    if (timeRemaining > 1 * 60 && isOnLastPage && !hasShownAddPagesAlert && !showAddPagesAlert && sessionStarted) {
      setHasShownAddPagesAlert(true);
      setShowAddPagesAlert(true);
    }
  }, [timeRemaining, currentPage, story.length, hasShownAddPagesAlert, showAddPagesAlert, sessionStarted]);
  
  // Reset the flag when user moves away from the last page
  useEffect(() => {
    const isOnLastPage = currentPage === story.length - 1;
    if (!isOnLastPage) {
      setHasShownAddPagesAlert(false);
      setShowAddPagesAlert(false);
    }
  }, [currentPage, story.length]);

  // Auto-dismiss tooltip after 2.5 seconds and start periodic reminders
  useEffect(() => {
    if (showAddPagesAlert) {
      const dismissTimer = setTimeout(() => {
        setShowAddPagesAlert(false);
      }, 2500);

      // Start periodic reminder pulses after tooltip dismisses
      const reminderTimer = setTimeout(() => {
        const reminderInterval = setInterval(() => {
          if (currentPage === story.length - 1) {
            setShowReminderPulse(true);
            setTimeout(() => setShowReminderPulse(false), 1000);
          }
        }, Math.random() * 2000 + 8000); // 8-10 seconds

        return () => clearInterval(reminderInterval);
      }, 2500);

      return () => {
        clearTimeout(dismissTimer);
        clearTimeout(reminderTimer);
      };
    }
  }, [showAddPagesAlert, currentPage, story.length]);

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
        
        // Route Level 0 through hierarchical template system, others through Universal Content Manager
        const currentPageCount = story.length;
        let storyResult;
        
        if (newDifficulty === 'beginner') {
          console.log('🔄 FreeReadingSession: Difficulty change to Level 0, using Level0StoryProcessor');
          const level0Result = await Level0StoryProcessor.generateStory(userInfo);
          storyResult = { 
            segments: level0Result.content.map(text => ({ text })),
            wordCount: level0Result.content.join(' ').split(' ').length,
            title: `${userInfo.name}'s Adventure`
          };
        } else {
          console.log('🔄 FreeReadingSession: Difficulty change to Level 1+, using UniversalContentManager');
          storyResult = await UniversalContentManager.generateNewStoryWithAntiRepetition(
            userInfo, 
            newDifficulty as 'easy' | 'medium' | 'hard' | 'expert',
            { isPremium: false, userId: userInfo.name }
          );
        }
        const updatedStory = { 
          pages: storyResult.segments.map(s => s.text), 
          config: { readingLevel: newDifficulty }, 
          images: [], 
          wordCount: storyResult.wordCount
        };
        
        // Ensure exact same page count (no change in navigation)
        let pages = updatedStory.pages;
        if (pages.length !== currentPageCount) {
          if (pages.length < currentPageCount) {
            const additionalPages = currentPageCount - pages.length;
            
            // Generate additional pages through Level0StoryProcessor to ensure validation
            try {
              const continuationResult = await Level0StoryProcessor.continueStory(userInfo, additionalPages);
              if (continuationResult.content.length > 0) {
                pages.push(...continuationResult.content);
              } else {
                // If no content generated, just keep existing pages
                pages = pages.slice(0, currentPageCount);
              }
            } catch (error) {
              console.error('Failed to generate continuation pages:', error);
              // Keep existing pages without adding invalid content
              pages = pages.slice(0, currentPageCount);
            }
          } else {
            pages = pages.slice(0, currentPageCount);
          }
        }
        
        // Update story and keep existing images during progressive generation
        setStory(pages);
        setWordsRead(updatedStory.wordCount);
        
        // Keep user on same relative page position
        const maxPage = Math.max(0, pages.length - 1);
        setCurrentPage(Math.min(currentPage, maxPage));
        
        // Silent update - no toast notification needed

        // IMMEDIATELY start progressive image generation for new content (NON-BLOCKING)
        const startProgressiveImageGeneration = async () => {
          for (let i = 0; i < pages.length; i++) {
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
    const isOnLastPage = currentPage === story.length - 1;
    if (isLoading || !establishedCharacter || !isOnLastPage) return;
    
    setIsLoading(true);
    console.log('🔄 Adding more pages to story...');
    
    try {
      console.log('Maintaining character consistency for page extension:', establishedCharacter.userName);

      // Use proper story continuation instead of generating new story
      const currentStoryPages = story.map(page => page);
      const continuationStory = await UniversalContentManager.continueExistingStory(
        currentStoryPages,
        userInfo, 
        currentDifficulty,
        { isPremium: false, userId: userInfo.name }
      );
      
      // Extract only the new pages (continuation adds to existing story)
      const existingPageCount = story.length;
      const allPages = continuationStory.segments.map(s => s.text);
      const newPages = allPages.slice(existingPageCount);
      
      // Check if we'd exceed the 20-page story limit
      if (story.length + newPages.length > 20) {
        toast({
          title: "Story Length Limit Reached",
          description: `This story has reached the 20-page limit. Start a new story to continue reading!`,
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // Add new pages and generate images for them
      const startPageIndex = story.length;
      setStory(prev => [...prev, ...newPages]);
      
      // Update story max pages to reflect the new total possible pages
      setStoryMaxPages(prev => prev + newPages.length);
      
      // Track navigation for analytics only
      SessionPageTracker.trackPagesAdded(newPages.length);
      
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
      
      // Reset story completion state when adding pages
      setStoryCompleted(false);
      setHasShownCompletionToast(false);
      
      setIsLoading(false);
      
      toast({
        title: "Pages Added!",
        description: `Added ${newPages.length} new pages to your story`,
        duration: 2000,
      });
      
    } catch (error) {
      console.error('Failed to add more pages:', error);
      
      // Handle page limit errors
      if (error instanceof FreeTrialPageLimitError) {
        toast({
          title: "Free Trial Limit Reached",
          description: error.upgradeMessage,
          duration: 5000,
        });
        
        // Show upgrade option
        setTimeout(() => {
          onUpgrade();
        }, 2000);
      } else {
        toast({
          title: "Error",
          description: "Unable to add more pages. Please try again.",
          duration: 3000,
        });
      }
      
      setIsLoading(false);
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
    
    // Calculate actual words read for accurate session recording
    const actualWordsRead = calculateActualWordsRead();
    
    // Record reading session for gamification
    const timeSpent = APP_CONFIG.FREE_SESSION_DURATION - timeRemaining;
    recordReadingSession({
      wordsRead: actualWordsRead,
      timeSpent,
      pagesRead: currentPage + 1,
      storyCompleted: currentPage >= story.length - 1,
      readingSpeed: Math.round((actualWordsRead / (timeSpent / 60)) || 0)
    });

    console.log('FreeReadingSession: Recorded session with progress:', {
      actualWordsRead,
      timeSpent,
      pagesRead: currentPage + 1,
      storyCompleted: currentPage >= story.length - 1
    });

    // Clear session template tracking when session ends
    import("@/services/sessionTemplateManager").then(({ SessionTemplateManager }) => {
      SessionTemplateManager.clearSession();
    });
    
    startCelebration();
  };

  // Calculate session stats
  const calculateStats = () => {
    const timeSpent = APP_CONFIG.FREE_SESSION_DURATION - timeRemaining;
    
    // Use real-time word count calculation instead of stale state
    const actualWordsRead = calculateActualWordsRead();
    const readingSpeed = Math.round((actualWordsRead / (timeSpent / 60)) || 0);
    const pagesRead = currentPage + 1;
    const completionRate = Math.round((pagesRead / story.length) * 100);
    
    return {
      wordsRead: actualWordsRead,
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
            showTutorial={tutorialActive}
            tutorialStep={currentTutorialStep}
          />
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
                  <MobileOptimizedButton onClick={onUpgrade} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Crown className="w-4 h-4 mr-2" />
                    {t("freeReadingSession.progressReport.premium.upgradeNow")}
                  </MobileOptimizedButton>
                  <MobileOptimizedButton onClick={onCreateAccount} variant="outline" className="flex-1">
                    {t("freeReadingSession.progressReport.premium.createAccount")}
                  </MobileOptimizedButton>
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
                      {t("freeReadingSession.session.title", "{name}'s Reading Adventure").replace("{name}", userInfo.name)}
                    </h1>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <span>
                         {t("freeReadingSession.navigation.pageInfo", "Page {current} / {total}").replace("{current}", (currentPage + 1).toString()).replace("{total}", storyMaxPages.toString())}
                      </span>
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                        🎁 {t("freeReadingSession.freeTrial")}
                      </span>
                    </p>
                    
                  </div>
                </div>
                
                <div id="navigation-controls" className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
                  {/* Navigation buttons - Mobile responsive */}
                  <MobileOptimizedButton onClick={onNewStory} variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                    <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                     <span className="hidden sm:inline">{t("sessionEnded.startNewStory", "New Story")}</span>
                   </MobileOptimizedButton>
                   <MobileOptimizedButton onClick={onHome} variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                     <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                     <span className="hidden sm:inline">{t("sessionEnded.goToHome", "Home")}</span>
                  </MobileOptimizedButton>
                  
                  {/* Start session button - Mobile responsive */}
                  {!sessionStarted && (
                    <MobileOptimizedButton onClick={startSession} className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white text-xs sm:text-sm px-2 sm:px-4">
                      <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="hidden xs:inline">{t("freeReadingSession.session.startReading")}</span>
                      <span className="xs:hidden">Start</span>
                    </MobileOptimizedButton>
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
                      <div id="reading-level-controls" className="mb-4 reading-level-controls">
                        <div className="flex gap-4 justify-center items-center">
                          <div className="relative group">
                            <MobileOptimizedButton
                              onClick={() => changeDifficulty('easier')}
                              disabled={!canDecreaseDifficulty() || isLoading}
                              variant="outline"
                              size="lg"
                              className="p-3 transition-all duration-200 hover:scale-110 hover:shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 hover:border-blue-300 text-blue-700 rounded-xl"
                            >
                              <ChevronDown className="w-5 h-5" />
                            </MobileOptimizedButton>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[100] shadow-lg before:content-[''] before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-b-blue-600">
                              {t("freeReadingSession.readingLevel.easier", "🌟 Make this story easier")}
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl border border-purple-200 shadow-sm">
                              <span className="text-sm font-bold text-gray-700">
                                📚 {t("storyDisplay.readingLevel")} {getDifficultyIndex()}
                              </span>
                              {/* Visual Reading Level Indicators */}
                              <div className="flex gap-1 ml-2">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <div
                                    key={i}
                                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                      i <= getDifficultyIndex() 
                                        ? 'bg-primary shadow-sm scale-110' 
                                        : 'bg-muted border border-muted-foreground/30'
                                    }`}
                                    title={`Level ${i} ${i <= getDifficultyIndex() ? '(Current)' : ''}`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="relative group">
                            <MobileOptimizedButton
                              onClick={() => changeDifficulty('harder')}
                              disabled={!canIncreaseDifficulty() || isLoading}
                              variant="outline"
                              size="lg"
                              className="p-3 transition-all duration-200 hover:scale-110 hover:shadow-lg bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 hover:border-green-300 text-green-700 rounded-xl"
                            >
                              <ChevronUp className="w-5 h-5" />
                            </MobileOptimizedButton>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[100] shadow-lg before:content-[''] before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-b-green-600">
                              {t("freeReadingSession.readingLevel.harder", "🚀 Make this story harder")}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <Progress value={progress} className="h-2" />
                        <p className="text-sm text-gray-600 mt-2 text-center">
                          {t("storyDisplay.readingProgress")}: {Math.round(progress)}%
                        </p>
                      </div>
                    </div>

                    {/* Scrollable Story Content */}
                    <div id="story-content" className="story-content flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
                      <div className="flex items-center justify-center min-h-full">
                        <div className="text-center w-full">
                          {/* Apply reading level configuration with proper responsive design */}
                          {(() => {
                            // Use difficulty-based font sizing with proper hierarchy (no overflow)
                             const getFontSizeForDifficulty = (difficulty: string) => {
                               console.log('FreeReadingSession: Getting font size for difficulty:', difficulty);
                                switch (difficulty) {
                                  case 'easy': 
                                    console.log('FreeReadingSession: Using EXTRA BIG text for Level 1 (young children)');
                                    return 'text-4xl sm:text-5xl md:text-6xl'; // EXTRA BIG for young children
                                  case 'medium': 
                                    console.log('FreeReadingSession: Using big text for Level 2');
                                    return 'text-3xl sm:text-4xl'; // Big for level 2
                                  case 'hard': 
                                    console.log('FreeReadingSession: Using medium text for Level 3');
                                    return 'text-2xl sm:text-3xl'; // Medium size
                                  case 'expert': 
                                    console.log('FreeReadingSession: Using normal text for Level 4');
                                    return 'text-xl sm:text-2xl'; // Normal size
                                  default: 
                                    console.log('FreeReadingSession: Default case - using EXTRA BIG fonts for young children');
                                    return 'text-4xl sm:text-5xl md:text-6xl';
                                }
                             };
                            
                            const config = { 
                              fontSize: getFontSizeForDifficulty(currentDifficulty), 
                              lineHeight: 'leading-relaxed', 
                              spacing: 'space-y-4' 
                            };
                            
                            return (
                              <div className={`story-text ${config.fontSize} ${config.lineHeight} ${config.spacing} font-bold text-gray-800 max-w-full break-words hyphens-auto leading-relaxed overflow-hidden`} dir="ltr" style={{ textAlign: 'left' }}>
                                <div className="max-h-[400px] overflow-y-auto px-2">
                                   {processTextForPhonetics(
                                     currentStory, 
                                     "", 
                                     currentDifficulty as "easy" | "medium" | "hard" | "expert",
                                     userInfo,
                                     false, // Free users are not premium
                                     userInfo?.name || '',
                                     wordHighlightIndex
                                   )}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Audio Controls Section - Using ElevenLabs TTS */}
                    {sessionStarted && (
                      <div className="flex-shrink-0 p-3 sm:p-4 lg:p-6 border-t border-gray-100 audio-controls">
                         <ElevenLabsAudio 
                           text={currentStory}
                           userInfo={userInfo}
                           isPremium={false} // Free users are not premium
                           onUpgrade={onUpgrade}
                           currentPage={currentPage}
                           totalPages={story.length}
                           isExtendedPage={story.length > 10 && currentPage >= 10} // Extended pages beyond original 10
                           onWordHighlight={handleWordHighlight}
                         />
                      </div>
                    )}

                    {/* Fixed Navigation Footer */}
                    <div className="flex-shrink-0 p-3 sm:p-4 lg:p-6 border-t border-gray-100 bg-gray-50/50">
                      <div className="flex justify-between items-center story-navigation">
                        <MobileOptimizedButton 
                          onClick={() => {
                            setCurrentPage(Math.max(0, currentPage - 1));
                          }}
                          disabled={currentPage === 0}
                          variant="outline"
                          size="sm"
                          className="flex-shrink-0 min-w-[80px]"
                        >
                          {t("storyDisplay.previous")}
                        </MobileOptimizedButton>
                        
                        <div className="flex flex-col items-center gap-1 px-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-medium text-gray-600 whitespace-nowrap">
                              {t("freeReadingSession.navigation.pageInfo", "Page {current} / {total}").replace("{current}", (currentPage + 1).toString()).replace("{total}", storyMaxPages.toString())}
                            </span>
                          </div>
                          <div className="relative group">
                            <MobileOptimizedButton
                              id="add-pages-button"
                              onClick={addMorePages}
                              disabled={isLoading || currentPage !== story.length - 1}
                              variant="outline"
                              size="sm"
                              className={`p-1.5 sm:p-2 transition-all duration-300 ${
                                showAddPagesAlert && currentPage === story.length - 1
                                  ? 'animate-bounce bg-amber-100 border-amber-400 text-amber-700 shadow-lg ring-2 ring-amber-300' 
                                  : showReminderPulse && currentPage === story.length - 1
                                  ? 'animate-bounce bg-amber-100 border-amber-400 text-amber-700 shadow-lg ring-2 ring-amber-300'
                                  : currentPage === story.length - 1
                                    ? 'bg-blue-50 hover:bg-blue-100 border-blue-200'
                                    : 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-50'
                              }`}
                            >
                              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                            </MobileOptimizedButton>
                            
                             {/* Alert Tooltip with X button */}
                             {showAddPagesAlert && (
                               <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-amber-600 text-white px-2 py-1 rounded text-xs whitespace-nowrap z-50 animate-pulse-finite">
                                 <div className="flex items-center gap-2">
                                   <span>{t("storyDisplay.addPagesAlert")}</span>
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
                                 {currentPage === story.length - 1 ? t("storyDisplay.addPagesTooltip") : t("storyDisplay.addPagesDisabled")}
                               </div>
                             )}
                          </div>
                        </div>
                        
                        <MobileOptimizedButton 
                          onClick={() => {
                            if (currentPage === story.length - 2) {
                              // User is about to complete the story
                              const nextPage = currentPage + 1;
                              setCurrentPage(nextPage);
                              setStoryCompleted(true);
                              
                              // Calculate actual words read for accurate session recording
                              const actualWordsRead = calculateActualWordsRead();
                              
                              // Trigger story completion gamification
                              const timeSpent = sessionStartTime ? 
                                Math.floor((Date.now() - sessionStartTime.getTime()) / 1000) : 
                                APP_CONFIG.FREE_SESSION_DURATION - timeRemaining;
                              
                              recordReadingSession({
                                wordsRead: actualWordsRead,
                                timeSpent,
                                pagesRead: nextPage + 1,
                                storyCompleted: true,
                                readingSpeed: Math.round((actualWordsRead / (timeSpent / 60)) || 0)
                              });

                              console.log('FreeReadingSession: Story completed! Recorded session:', {
                                actualWordsRead,
                                timeSpent,
                                pagesRead: nextPage + 1,
                                storyCompleted: true
                              });
                              
                              // Story completed - toast will be shown by useEffect
                            } else {
                              const nextPage = Math.min(story.length - 1, currentPage + 1);
                              setCurrentPage(nextPage);
                              
                              // Track forward navigation
                              if (nextPage > currentPage) {
                                SessionPageTracker.trackPageNavigation(nextPage);
                                setPageInfo(SessionPageTracker.getPageInfo());
                              }
                            }
                          }}
                          disabled={currentPage >= story.length - 1}
                          variant="outline"
                          size="sm"
                          className="flex-shrink-0 min-w-[80px]"
                        >
                          {currentPage === story.length - 2 ? t("storyDisplay.finish") : t("storyDisplay.next")}
                        </MobileOptimizedButton>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </main>
          
          {/* Improved Tutorial */}
          <TutorialOverlay
            isVisible={tutorialActive} 
            onComplete={() => setTutorialActive(false)}
            onSkip={() => setTutorialActive(false)}
            onStartTimer={() => {
              // Auto-start the session when tutorial completes
              if (!sessionStarted) {
                setSessionStarted(true);
                setSessionStartTime(new Date());
              }
              console.log('Tutorial completed - timer auto-started at 20:59');
            }}
            onStepChange={setCurrentTutorialStep}
            sessionStartTime={sessionStartTime}
          />

          {/* Achievement Notification */}
          {currentAchievement && (
            <AchievementNotification
              achievement={currentAchievement}
              isVisible={!!currentAchievement}
              onClose={() => setCurrentAchievement(null)}
            />
          )}
        </>
      )}
      </div>
      
      {/* Progress Towers - Show during active session for free users, always for premium users */}
      {(() => {
        const shouldShow = isPremium || (sessionStarted && !sessionEnded && !showProgressReport);
        console.log('Progress Towers visibility:', { 
          isPremium, 
          sessionStarted, 
          sessionEnded, 
          showProgressReport, 
          shouldShow 
        });
        return shouldShow;
      })() ? (
        <ProgressTowers
          userId={userInfo.name}
          userType={isPremium ? "premium" : "free"}
          currentWordsRead={calculateActualWordsRead()}
          currentPagesRead={currentPage + 1}
          vocabularyLearned={userStats.vocabularyWordsLearned}
          shouldPulse={
            tutorialActive && 
            currentTutorialStep === 5 && // Step 6 (0-indexed)
            sessionStartTime &&
            Date.now() - sessionStartTime.getTime() < 5000 // First 5 seconds
          }
          onProgressUpdate={(type, value) => {
            if (type === 'vocabulary') {
              console.log('📚 FreeReadingSession: Vocabulary progress updated in ProgressTowers:', {
                type,
                value,
                currentUserStatsVocab: userStats.vocabularyWordsLearned,
                environment: window.location.href.includes('preview') ? 'preview' : 'console'
              });
            }
          }}
        />
      ) : null}
    </>
  );
};
