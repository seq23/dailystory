import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Home, RotateCcw, Volume2, Timer, Play, Pause, Minus, X, ChevronUp, ChevronDown, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { UserInfo, SessionStats } from "@/types";
import { ElevenLabsAudio } from "@/components/ElevenLabsAudio";
import { InteractiveAudioReading } from "@/components/InteractiveAudioReading";
import { EarlyReaderStoryGenerator } from "@/services/earlyReaderStoryGenerator";
import { UnifiedImageService, type EstablishedCharacter } from "@/services/unifiedImageService";
import { APP_CONFIG } from "@/constants/app";
import { useToast } from "@/hooks/use-toast";
import { TutorialOverlay } from "@/components/TutorialOverlay";
import { FloatingTimer } from "@/components/FloatingTimer";
import { useGamification } from "@/hooks/useGamification";
import { GamificationDashboard } from "@/components/GamificationDashboard";
import { AchievementNotification } from "@/components/AchievementNotification";

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

interface StoryDisplayProps {
  userInfo: UserInfo;
  onNewStory: () => void;
  onHome: () => void;
  onSessionEnded: (stats: SessionStats) => void;
  isPremium?: boolean;
  onUpgrade?: () => void;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({
  userInfo,
  onNewStory,
  onHome,
  onSessionEnded,
  isPremium = false,
  onUpgrade,
}) => {
  const { toast } = useToast();
  const { t } = useTranslation();

  // Initialize gamification
  const {
    userStats,
    recordReadingSession,
    addVocabularyWord,
    getNextAchievement,
    hasNewAchievements
  } = useGamification({
    userId: userInfo?.name || 'guest',
    onAchievementUnlocked: (achievement) => {
      console.log('New achievement unlocked:', achievement.title);
    },
    onLevelUp: (newLevel) => {
      // Level up happens silently, no toast notification
      console.log('Level up to:', newLevel);
    }
  });

  const [currentAchievement, setCurrentAchievement] = useState(null);
  
  // Story state
  const [story, setStory] = useState<string[]>([]);
  const [storyImages, setStoryImages] = useState<Array<{url?: string, prompt: string}>>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDifficulty, setCurrentDifficulty] = useState<'easy' | 'medium' | 'hard' | 'expert'>('easy');
  
  // Session state
  const [timeRemaining, setTimeRemaining] = useState(APP_CONFIG.FREE_SESSION_DURATION);
  const [sessionStartTime] = useState<Date>(new Date());
  const [wordsRead, setWordsRead] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showFinishCountdown, setShowFinishCountdown] = useState(false);
  const [tutorialActive, setTutorialActive] = useState(true);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);
  const [showAddPagesAlert, setShowAddPagesAlert] = useState(false);
  const [hasShownAddPagesAlert, setHasShownAddPagesAlert] = useState(false);
  const [canAddMorePages, setCanAddMorePages] = useState(true);
  const [pagesAdded, setPagesAdded] = useState(0);

  // Character consistency - store original character details  
  const [establishedCharacter, setEstablishedCharacter] = useState<EstablishedCharacter | null>(null);

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
  
  const canDecreaseDifficulty = () => getDifficultyIndex() > 0;
  const canIncreaseDifficulty = () => getDifficultyIndex() < difficultyLevels.length - 1;

  // Generate story on component mount
  useEffect(() => {
    const generateStory = async () => {
      try {
        setIsLoading(true);
        
        const readingLevel = userInfo.readingLevel || (userInfo as any).difficultyLevel || 'easy';
        const initialDifficulty = (readingLevel === 'beginner' ? 'easy' :
                                   readingLevel === 'elementary' ? 'medium' :
                                   readingLevel === 'intermediate' ? 'hard' : 
                                   readingLevel === 'advanced' ? 'expert' : 'easy') as 'easy' | 'medium' | 'hard' | 'expert';
        setCurrentDifficulty(initialDifficulty);
        
        // Generate story using the new generator
        const { pages, config } = EarlyReaderStoryGenerator.generateStory(
          userInfo, 
          initialDifficulty, 
          10
        );
        const generatedStory = { 
          pages, 
          config, 
          images: [], 
          wordCount: pages.join(' ').split(' ').length, 
          readingLevel: initialDifficulty 
        };
        setStory(generatedStory.pages);
        setStoryImages(generatedStory.images || []);
        setWordsRead(generatedStory.wordCount);
        
        // Establish character consistency for intelligent image generation
        const characterDetails = UnifiedImageService.establishCharacterConsistency(userInfo);
        setEstablishedCharacter(characterDetails);
        
        // Generate intelligent images for all users - Premium gets AI, Free gets smart fallback selection
        const generateImagesProgressively = async () => {
          console.log(`Starting intelligent image generation for ${isPremium ? 'premium' : 'free'} user ${characterDetails.userName}`);
          
          for (let i = 0; i < generatedStory.pages.length; i++) {
            try {
              if (isPremium) {
                // Premium users: Generate AI images with enhanced food detection
                const imageOptions = {
                  pageIndex: i,
                  totalPages: generatedStory.pages.length,
                  storyText: generatedStory.pages[i],
                  userInfo: userInfo,
                  difficulty: initialDifficulty,
                  establishedCharacter: characterDetails,
                  isNewStory: true
                };
                
                const generatedImage = await UnifiedImageService.generateStoryImage(imageOptions);
                
                setStoryImages(prev => {
                  const newImages = [...prev];
                  newImages[i] = { url: generatedImage.url, prompt: generatedImage.prompt };
                  return newImages;
                });
                
                console.log(`Generated intelligent AI image ${i + 1}/${generatedStory.pages.length} for premium user`);
              } else {
                // Free users: Smart fallback selection using same enhanced content analysis
                const smartFallback = UnifiedImageService.selectSmartFallback(
                  generatedStory.pages[i], 
                  characterDetails, 
                  i, 
                  illustrations
                );
                
                setStoryImages(prev => {
                  const newImages = [...prev];
                  newImages[i] = { url: smartFallback.url, prompt: smartFallback.prompt };
                  return newImages;
                });
                
                console.log(`Selected smart fallback image ${i + 1}/${generatedStory.pages.length} for free user`);
              }
            } catch (error) {
              console.error(`Failed to generate image for page ${i + 1}:`, error);
              // Use fallback illustration
              setStoryImages(prev => {
                const newImages = [...prev];
                newImages[i] = { url: illustrations[i % illustrations.length], prompt: `Fallback illustration for page ${i + 1}` };
                return newImages;
              });
            }
          }
        };
        
        // Start progressive image generation
        generateImagesProgressively();
        
        // Success notification removed - no longer showing story ready message
        
      } catch (error) {
        console.error('Failed to generate story:', error);
        
        // Fallback story based on age
        const fallbackStory = userInfo.age <= 5 ? [
          "The cat sat on the mat.",
          "The cat was happy.",
          "The cat played with a ball.",
          "The ball was red.",
          "The cat ran fast.",
          "The end."
        ] : userInfo.age <= 8 ? [
          "Once upon a time, there was a brave little mouse named Max.",
          "Max lived in a cozy hole under the kitchen.",
          "One day, Max decided to explore the big house.",
          "He found many interesting things.",
          "Max made new friends along the way.",
          "And they all lived happily ever after!"
        ] : [
          "In a small village nestled between rolling hills, lived a curious girl named Luna.",
          "She had always wondered about the mysterious forest that bordered her town.",
          "When strange lights began appearing among the trees each night, Luna knew she had to investigate.",
          "With her backpack and flashlight, she ventured into the forest.",
          "There, she discovered a magical secret that would change everything.",
          "Luna's adventure was just beginning!"
        ];
        
        setStory(fallbackStory);
        setWordsRead(fallbackStory.join(' ').split(' ').length);
        
        toast({
          title: "Using Sample Story",
          description: "Generated a story for you to enjoy reading!",
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    generateStory();
  }, [userInfo, toast]);

  // Timer countdown (with pause support)
  useEffect(() => {
    if (timeRemaining <= 0 || isPaused) return;

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
  }, [timeRemaining, isPaused]);

  const handleSessionEnd = () => {
    const timeSpent = APP_CONFIG.FREE_SESSION_DURATION - timeRemaining;
    const sessionStats: SessionStats = {
      wordsRead,
      timeSpent,
      pagesRead: currentPage + 1,
      startTime: sessionStartTime.getTime(),
      accuracy: 100 // Placeholder
    };

    // Record reading session for gamification
    recordReadingSession({
      wordsRead,
      timeSpent,
      pagesRead: currentPage + 1,
      storyCompleted: currentPage >= story.length - 1,
      readingSpeed: Math.round((wordsRead / (timeSpent / 60)) || 0)
    });
    
    onSessionEnded(sessionStats);
  };

  // Calculate session stats for premium users
  const calculateStats = () => {
    const timeSpent = sessionStartTime ? 
      Math.floor((Date.now() - sessionStartTime.getTime()) / 1000) : 
      APP_CONFIG.FREE_SESSION_DURATION - timeRemaining;
    
    return {
      wordsRead,
      timeSpent,
      pagesRead: currentPage + 1,
      totalPages: story.length,
      accuracy: 100, // Placeholder - would be calculated based on comprehension questions
      currentDifficulty: userInfo.readingLevel || currentDifficulty,
      readingSpeed: Math.round((wordsRead / (timeSpent / 60)) || 0)
    };
  };

  const handleNewStory = async () => {
    if (isPremium) {
      // Premium users: Generate new story directly
      setCurrentPage(0);
      setTimeRemaining(APP_CONFIG.FREE_SESSION_DURATION);
      setIsLoading(true);
      
      try {
        // Generate new story using the new generator
        const { pages, config } = EarlyReaderStoryGenerator.generateStory(
          userInfo, 
          currentDifficulty, 
          10
        );
        const generatedStory = { 
          pages, 
          config, 
          images: [], 
          wordCount: pages.join(' ').split(' ').length, 
          readingLevel: currentDifficulty 
        };
        
        setStory(generatedStory.pages);
        setStoryImages(generatedStory.images || []);
        setWordsRead(generatedStory.wordCount);
        
        // Generate intelligent images for new story using established character
        if (establishedCharacter) {
          const generateImagesForNewStory = async () => {
            console.log(`Generating images for new story for premium user ${establishedCharacter.userName}`);
            
            for (let i = 0; i < generatedStory.pages.length; i++) {
              try {
                const imageOptions = {
                  pageIndex: i,
                  totalPages: generatedStory.pages.length,
                  storyText: generatedStory.pages[i],
                  userInfo: userInfo,
                  difficulty: currentDifficulty,
                  establishedCharacter: establishedCharacter,
                  isNewStory: true
                };
                
                const generatedImage = await UnifiedImageService.generateStoryImage(imageOptions);
                
                setStoryImages(prev => {
                  const newImages = [...prev];
                  newImages[i] = { url: generatedImage.url, prompt: generatedImage.prompt };
                  return newImages;
                });
                
                console.log(`Generated intelligent image ${i + 1}/${generatedStory.pages.length} for new story`);
              } catch (error) {
                console.error(`Failed to generate image for page ${i + 1}:`, error);
                // Use fallback illustration
                setStoryImages(prev => {
                  const newImages = [...prev];
                  newImages[i] = { url: illustrations[i % illustrations.length], prompt: `Fallback illustration for page ${i + 1}` };
                  return newImages;
                });
              }
            }
          };
          
          generateImagesForNewStory();
        }
        
        // Success notification removed - no longer showing new story ready message
      } catch (error) {
        console.error('Failed to generate new story:', error);
        toast({
          title: "Error",
          description: "Failed to generate new story. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      // Free users: Go back to information form
      onNewStory();
    }
  };
  
  // Function to change difficulty easier/harder
  const changeDifficulty = async (direction: 'easier' | 'harder') => {
    const currentIndex = getDifficultyIndex();
    let newIndex: number;
    
    if (direction === 'easier' && canDecreaseDifficulty()) {
      newIndex = currentIndex - 1;
    } else if (direction === 'harder' && canIncreaseDifficulty()) {
      newIndex = currentIndex + 1;
    } else {
      return; // No change possible
    }
    
    const newDifficulty = difficultyLevels[newIndex];
    setCurrentDifficulty(newDifficulty);
    setIsLoading(true);
    setCurrentPage(0);
    
    try {
      // Generate new story at the new difficulty level
      const { pages, config } = EarlyReaderStoryGenerator.generateStory(
        userInfo, 
        newDifficulty, 
        10
      );
      const newStory = { 
        pages, 
        config, 
        images: [], 
        wordCount: pages.join(' ').split(' ').length 
      };
      
      setStory(newStory.pages);
      setWordsRead(newStory.wordCount);
      
      // Keep existing images initially to avoid blank pages, then update them
      // Generate intelligent images for new difficulty level for ALL users (premium + free)
      if (establishedCharacter) {
        const generateImagesForNewDifficulty = async () => {
          console.log(`Regenerating images for difficulty change to ${newDifficulty} for ${isPremium ? 'premium' : 'free'} user ${establishedCharacter.userName}`);
          
          for (let i = 0; i < newStory.pages.length; i++) {
            try {
              if (isPremium) {
                // Premium users: Generate AI images with enhanced food detection
                const imageOptions = {
                  pageIndex: i,
                  totalPages: newStory.pages.length,
                  storyText: newStory.pages[i],
                  userInfo: userInfo,
                  difficulty: newDifficulty,
                  establishedCharacter: establishedCharacter,
                  isNewStory: false
                };
                
                const generatedImage = await UnifiedImageService.generateStoryImage(imageOptions);
                
                setStoryImages(prev => {
                  const newImages = [...prev];
                  newImages[i] = { url: generatedImage.url, prompt: generatedImage.prompt };
                  return newImages;
                });
                
                console.log(`Generated intelligent AI image ${i + 1}/${newStory.pages.length} for difficulty ${newDifficulty}`);
              } else {
                // Free users: Smart fallback selection using enhanced content analysis
                const smartFallback = UnifiedImageService.selectSmartFallback(
                  newStory.pages[i], 
                  establishedCharacter, 
                  i, 
                  illustrations
                );
                
                setStoryImages(prev => {
                  const newImages = [...prev];
                  newImages[i] = { url: smartFallback.url, prompt: smartFallback.prompt };
                  return newImages;
                });
                
                console.log(`Selected smart fallback image ${i + 1}/${newStory.pages.length} for difficulty ${newDifficulty}`);
              }
            } catch (error) {
              console.error(`Failed to generate image for page ${i + 1} at new difficulty:`, error);
              // Use fallback illustration
              setStoryImages(prev => {
                const newImages = [...prev];
                newImages[i] = { url: illustrations[i % illustrations.length], prompt: `Fallback illustration for page ${i + 1}` };
                return newImages;
              });
            }
          }
        };
        
        generateImagesForNewDifficulty();
      }
      
    } catch (error) {
      console.error('Failed to change difficulty:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Flash "add more pages" alert when user reaches the LAST page with >1 minute remaining for premium
  useEffect(() => {
    const isOnLastPage = currentPage === story.length - 1;
    if (isOnLastPage && canAddMorePages && !showAddPagesAlert) {
      setShowAddPagesAlert(true);
    }
  }, [currentPage, story.length, canAddMorePages, showAddPagesAlert]);
  
  // Reset alert when user moves away from last page
  useEffect(() => {
    const isOnLastPage = currentPage === story.length - 1;
    if (!isOnLastPage) {
      setShowAddPagesAlert(false);
    }
  }, [currentPage, story.length]);
  
  // Function to add more pages to the story - only when on last page
  const addMorePages = async () => {
    if (isLoading || !canAddMorePages) return;
    
    const isOnLastPage = currentPage === story.length - 1;
    if (!isOnLastPage) return; // Only allow adding pages when on the last page
    
    try {
      // Generate extended story using the new generator
      const { pages: newPages, config } = EarlyReaderStoryGenerator.generateStory(
        userInfo, 
        currentDifficulty, 
        5 // Always add exactly 5 pages
      );
      
      // Add new pages and update word count
      setStory(prev => [...prev, ...newPages]);
      setStoryImages(prev => [...prev, ...newPages.map(() => ({ url: '', prompt: '' }))]);
      setWordsRead(prev => prev + newPages.join(' ').split(' ').length);
      
      // Track pages added and disable button until user reaches new last page
      setPagesAdded(prev => prev + 5);
      setCanAddMorePages(false);
      setShowAddPagesAlert(false);
      
      // Show success message
      toast({
        title: "5 More Pages Added! 📚",
        description: "Your story has been extended! Reach the last page to add more.",
        duration: 3000,
      });
      
    } catch (error) {
      console.error('Failed to add more pages:', error);
      toast({
        title: "Error",
        description: "Failed to add more pages. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Re-enable adding pages when user reaches the new last page
  useEffect(() => {
    const isOnLastPage = currentPage === story.length - 1;
    if (isOnLastPage && !canAddMorePages) {
      setCanAddMorePages(true);
    }
  }, [currentPage, story.length, canAddMorePages]);

  // Check for new achievements and show them
  useEffect(() => {
    if (hasNewAchievements && !currentAchievement) {
      const achievement = getNextAchievement();
      if (achievement) {
        setCurrentAchievement(achievement);
      }
    }
  }, [hasNewAchievements, currentAchievement, getNextAchievement]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Creating Your Story...</h2>
          <p className="text-gray-600">Personalizing content for {userInfo.name}</p>
        </div>
      </div>
    );
  }

  const currentStory = story[currentPage] || "Loading...";
  const progress = ((currentPage + 1) / story.length) * 100;
  // Use custom generated image if available, otherwise fallback
  const currentImage = storyImages[currentPage]?.url || illustrations[currentPage % illustrations.length];
  const currentIllustration = currentImage;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pb-safe">
      {/* Professional Premium Timer Display - Top Right, Smaller */}
      {timeRemaining > 0 && (
        <div className="fixed top-2 right-4 sm:right-6 z-50 flex flex-col items-center gap-3" style={{ marginRight: 'max(0.5rem, env(safe-area-inset-right))', marginTop: 'max(0.5rem, env(safe-area-inset-top))' }}>
          
          {/* Main Timer Circle - Professional & Larger */}
          <div className="relative">
            {/* Main Timer Circle */}
            <div className="relative w-18 h-18 sm:w-20 sm:h-20 bg-gradient-to-br from-white to-gray-50 backdrop-blur-sm rounded-full shadow-xl border-3 border-white/80 flex items-center justify-center ring-2 ring-green-500/20">
              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-500/10 to-transparent animate-pulse"></div>
              
              {/* Progress Circle */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 80 80">
                {/* Background circle */}
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="hsl(var(--muted))"
                  strokeWidth="6"
                  fill="none"
                  opacity="0.3"
                />
                {/* Progress circle */}
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke={timeRemaining <= 300 ? "#ef4444" : "#22c55e"}
                  strokeWidth="5"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 32}
                  strokeDashoffset={2 * Math.PI * 32 - ((timeRemaining / APP_CONFIG.FREE_SESSION_DURATION) * 2 * Math.PI * 32)}
                  className="transition-all duration-1000 ease-out filter drop-shadow-lg"
                  strokeLinecap="round"
                />
              </svg>
              
              {/* Time Display */}
              <div className="relative z-10 text-center">
                <div className={`text-xs sm:text-sm font-bold tracking-tight ${timeRemaining <= 300 ? 'text-red-500' : 'text-green-600'}`}>
                  {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-[8px] sm:text-[10px] text-gray-600 font-medium leading-tight">
                  Premium
                </div>
              </div>
            </div>
          </div>
          
          {/* 3 Control Buttons Only */}
          <div className="flex gap-3 items-center">
            
            {/* 1. Pause/Resume Button - Center */}
            <Button
              size="lg"
              onClick={() => setIsPaused(!isPaused)}
              className="bg-gradient-to-b from-white to-gray-50 backdrop-blur-sm border-2 border-green-500/30 text-green-600 hover:bg-green-500 hover:text-white shadow-xl w-10 h-10 sm:w-12 sm:h-12 rounded-full p-0 transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:border-green-500/50"
            >
              {isPaused ? <Play className="w-3 h-3 sm:w-4 sm:h-4" /> : <Pause className="w-3 h-3 sm:w-4 sm:h-4" />}
            </Button>
            
            {/* 2. Reduce Time Button - Left */}
            <Button
              variant="outline"
              size="lg"
              disabled={timeRemaining <= 300}
              className={`bg-gradient-to-b from-white to-orange-50 backdrop-blur-sm border-2 border-orange-400/50 text-orange-600 hover:bg-orange-500 hover:text-white shadow-lg w-8 h-8 sm:w-10 sm:h-10 rounded-full p-0 transition-all duration-300 hover:scale-110 hover:shadow-xl ${
                timeRemaining <= 300 
                  ? 'opacity-50 cursor-not-allowed' 
                  : ''
              }`}
              onClick={() => {
                if (timeRemaining > 300) {
                  setTimeRemaining(prev => Math.max(300, prev - 300));
                }
              }}
            >
              <Minus className="w-2 h-2 sm:w-3 sm:h-3" />
            </Button>

            {/* 3. End Session Button - Right */}
            <Button
              variant="outline"
              size="lg"
              className="bg-gradient-to-b from-white to-red-50 backdrop-blur-sm border-2 border-red-400/50 text-red-600 hover:bg-red-500 hover:text-white shadow-lg w-8 h-8 sm:w-10 sm:h-10 rounded-full p-0 transition-all duration-300 hover:scale-110 hover:shadow-xl"
              onClick={() => {
                setTimeRemaining(0);
                onSessionEnded({
                  timeSpent: APP_CONFIG.FREE_SESSION_DURATION - timeRemaining,
                  wordsRead,
                  pagesRead: currentPage + 1,
                  startTime: sessionStartTime.getTime(),
                  accuracy: 100
                });
              }}
            >
              <X className="w-2 h-2 sm:w-3 sm:h-3" />
            </Button>
          </div>
          
          {/* Premium Badge */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 rounded-full shadow-lg border-2 border-white/50 text-xs font-bold">
            ✨ UNLIMITED
          </div>
        </div>
      )}

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
                 <h1 className="text-lg sm:text-xl font-bold text-gray-800">{t("freeReadingSession.session.title", "{name}'s Reading Adventure").replace("{name}", userInfo.name)}</h1>
                 <p className="text-sm text-gray-600">{t("freeReadingSession.navigation.pageInfo", "{current} / {total}").replace("{current}", (currentPage + 1).toString()).replace("{total}", story.length.toString())}</p>
              </div>
            </div>
          
          <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
              <Button onClick={handleNewStory} variant="outline" size="sm">
              <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
               <span className="hidden sm:inline">{t("sessionEnded.startNewStory", "New Story")}</span>
               </Button>
               <Button onClick={onHome} variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
               <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
               <span className="hidden sm:inline">{t("sessionEnded.goToHome", "Home")}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Overhauled Layout with Proper Scrolling */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 flex-1 flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto flex-1 overflow-hidden">
            
            {/* Story Illustration - Optimized for Perfect Fitting */}
            <div className="order-2 lg:order-1 flex flex-col">
              <Card className="flex-1 min-h-[400px] lg:min-h-[500px]">
                <CardContent className="p-4 h-full flex items-center justify-center">
                  <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
                    <img 
                      src={currentIllustration}
                      alt={`Story illustration for page ${currentPage + 1}`}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                      style={{ aspectRatio: '4/3' }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Story Text Panel - Overhauled with Proper Layout */}
            <div className="order-1 lg:order-2 flex flex-col">
              <Card className="flex-1 flex flex-col overflow-hidden">
                
                {/* Fixed Header Section */}
                <div className="flex-shrink-0 p-6 border-b border-gray-100">
                  {/* Difficulty Level Selector */}
                  <div id="reading-level-controls" className="mb-4 reading-level-controls">
                    <div className="flex gap-4 justify-center items-center">
                      <div className="relative group">
                        <Button
                          onClick={() => changeDifficulty('easier')}
                          disabled={!canDecreaseDifficulty() || isLoading}
                          variant="outline"
                          size="lg"
                          className="p-3 transition-all duration-200 hover:scale-110 hover:shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 hover:border-blue-300 text-blue-700 rounded-xl"
                        >
                          <ChevronDown className="w-5 h-5" />
                        </Button>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[100] shadow-lg before:content-[''] before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-b-blue-600">
                          {t("freeReadingSession.readingLevel.easier", "🌟 Make this story easier")}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <span className="text-sm font-bold text-gray-700 bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1 rounded-full border border-purple-200">
                          📚 {t("storyDisplay.readingLevel")} {getDifficultyIndex() + 1}
                        </span>
                      </div>
                      
                      <div className="relative group">
                        <Button
                          onClick={() => changeDifficulty('harder')}
                          disabled={!canIncreaseDifficulty() || isLoading}
                          variant="outline"
                          size="lg"
                          className="p-3 transition-all duration-200 hover:scale-110 hover:shadow-lg bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 hover:border-green-300 text-green-700 rounded-xl"
                        >
                          <ChevronUp className="w-5 h-5" />
                        </Button>
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
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="flex items-center justify-center min-h-full">
                    <div className="text-center w-full">
                      {/* Story Text with Reading Level Configuration and Overflow Protection */}
                      {(() => {
                        const config = EarlyReaderStoryGenerator.getReadingConfigForDifficulty(currentDifficulty);
                        return (
                          <div className={`${config.fontSize} ${config.lineHeight} ${config.spacing} font-medium text-gray-800 max-w-full break-words hyphens-auto leading-relaxed overflow-hidden`}>
                            <div className="max-h-[400px] overflow-y-auto px-2">
                              {currentStory}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Audio Controls Section - Using ElevenLabs TTS */}
                <div className="flex-shrink-0 p-6 border-t border-gray-100 audio-controls">
                  <ElevenLabsAudio 
                    text={currentStory}
                    userInfo={userInfo}
                    isPremium={true} // Authenticated users get premium features
                    onUpgrade={onUpgrade}
                    currentPage={currentPage}
                    totalPages={story.length}
                    isExtendedPage={false} // Premium users can use all pages
                  />
                </div>

                {/* Fixed Navigation Footer */}
                <div className="flex-shrink-0 p-6 border-t border-gray-100 bg-gray-50/50">
                  <div className="flex justify-between items-center story-navigation reading-level-controls">
                    <Button 
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                      variant="outline"
                      className="min-w-[100px]"
                    >
                      {t("storyDisplay.previous")}
                    </Button>
                    
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">
                        {currentPage + 1} / {story.length}
                      </span>
                      <div className="relative group">
                        <Button
                          id="add-pages-button"
                          onClick={addMorePages}
                          disabled={isLoading || !canAddMorePages}
                          variant="outline"
                          size="sm"
                          className={`p-1.5 sm:p-2 transition-all duration-300 ${
                            showAddPagesAlert && canAddMorePages
                              ? 'animate-bounce bg-amber-100 border-amber-400 text-amber-700 shadow-lg ring-2 ring-amber-300' 
                              : canAddMorePages
                              ? 'bg-blue-50 hover:bg-blue-100 border-blue-200'
                              : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
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
                        {!showAddPagesAlert && canAddMorePages && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 rounded text-xs transition-all duration-300 pointer-events-none whitespace-nowrap z-50 bg-gray-800 text-white opacity-0 group-hover:opacity-100">
                            Add 5 more pages (only on last page)
                          </div>
                        )}
                        
                        {/* Disabled state tooltip */}
                        {!canAddMorePages && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 rounded text-xs transition-all duration-300 pointer-events-none whitespace-nowrap z-50 bg-gray-800 text-white opacity-0 group-hover:opacity-100">
                            Reach the last page to add more
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => setCurrentPage(Math.min(story.length - 1, currentPage + 1))}
                      disabled={currentPage >= story.length - 1}
                      variant="outline"
                      className="min-w-[100px]"
                    >
                      {t("storyDisplay.next")}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      {/* FloatingTimer Component for Premium Users */}
      {isPremium && (
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
          onSessionEnded={(sessionStats) => {
            const stats = sessionStats || calculateStats();
            onSessionEnded(stats);
          }}
          sessionStats={calculateStats()}
          showTutorial={tutorialActive}
          tutorialStep={currentTutorialStep}
        />
      )}
      
      {/* Improved Tutorial */}
      <TutorialOverlay
        isVisible={tutorialActive} 
        onComplete={() => setTutorialActive(false)}
        onSkip={() => setTutorialActive(false)}
        onStartTimer={() => {
          // Auto-start the timer when tutorial completes (premium users)
          setIsPaused(false);
          console.log('Tutorial completed - timer auto-started at 20:59');
        }}
        onStepChange={setCurrentTutorialStep}
      />
    </div>
  );
};

export default StoryDisplay;