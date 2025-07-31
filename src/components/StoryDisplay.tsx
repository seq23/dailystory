import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BookOpen, Home, RotateCcw, Volume2, VolumeX, TrendingUp, TrendingDown, Plus, Minus, Star, Heart, Sparkles, Wand2, Play, Pause, Timer, Mic, MicOff, BarChart3, Target } from "lucide-react";
import { FloatingTimer } from "./FloatingTimer";
import type { UserInfo, DifficultyLevel, SessionStats } from "@/types";
import ProgressDashboard from "@/components/ProgressDashboard";
import LearningPathDashboard from "@/components/LearningPathDashboard";
import AdaptiveUI from "@/components/AdaptiveUI";
import { ProgressTrackingService, ReadingProgress } from "@/services/progressTrackingService";
import { createOpenAITTSService } from "@/services/textToSpeechService";
import { useToast } from "@/hooks/use-toast";
import { StoryGeneratorService } from "@/services/storyGenerator";

import illustration1 from "@/assets/story-illustration-1.jpg";
import illustration2 from "@/assets/story-illustration-2.jpg";
import illustration3 from "@/assets/story-illustration-3.jpg";
import illustration4 from "@/assets/story-illustration-4.jpg";
import illustration5 from "@/assets/story-illustration-5.jpg";
import illustration6 from "@/assets/story-illustration-6.jpg";
import illustration7 from "@/assets/story-illustration-7.jpg";
import illustration8 from "@/assets/story-illustration-8.jpg";
import illustration9 from "@/assets/story-illustration-9.jpg";
import illustration10 from "@/assets/story-illustration-10.jpg";
import illustration11 from "@/assets/story-illustration-11.jpg";
import illustration12 from "@/assets/story-illustration-12.jpg";
import illustration13 from "@/assets/story-illustration-13.jpg";
import illustration14 from "@/assets/story-illustration-14.jpg";
import illustration15 from "@/assets/story-illustration-15.jpg";
import illustration16 from "@/assets/story-illustration-16.jpg";
import illustration17 from "@/assets/story-illustration-17.jpg";
import illustration18 from "@/assets/story-illustration-18.jpg";
import illustration19 from "@/assets/story-illustration-19.jpg";
import illustration20 from "@/assets/story-illustration-20.jpg";
import illustration21 from "@/assets/story-illustration-21.jpg";
import illustration22 from "@/assets/story-illustration-22.jpg";
import illustration23 from "@/assets/story-illustration-23.jpg";
import illustration24 from "@/assets/story-illustration-24.jpg";
import illustration25 from "@/assets/story-illustration-25.jpg";
import illustration26 from "@/assets/story-illustration-26.jpg";
import illustration27 from "@/assets/story-illustration-27.jpg";
import illustration28 from "@/assets/story-illustration-28.jpg";
import illustration29 from "@/assets/story-illustration-29.jpg";
import illustration30 from "@/assets/story-illustration-30.jpg";
import illustration31 from "@/assets/story-illustration-31.jpg";
import illustration32 from "@/assets/story-illustration-32.jpg";
import illustration33 from "@/assets/story-illustration-33.jpg";
import illustration34 from "@/assets/story-illustration-34.jpg";
import illustration35 from "@/assets/story-illustration-35.jpg";
import illustration36 from "@/assets/story-illustration-36.jpg";
import illustration37 from "@/assets/story-illustration-37.jpg";
import illustration38 from "@/assets/story-illustration-38.jpg";
import illustration39 from "@/assets/story-illustration-39.jpg";
import illustration40 from "@/assets/story-illustration-40.jpg";
import illustration41 from "@/assets/story-illustration-41.jpg";
import illustration42 from "@/assets/story-illustration-42.jpg";
import illustration43 from "@/assets/story-illustration-43.jpg";
import illustration44 from "@/assets/story-illustration-44.jpg";
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
import time2ReadLogo from "@/assets/time2read-logo.png";
import { processTextForPhonetics } from "@/utils/textProcessor";
import { SecureRunwareService } from "@/services/secureRunwareService";
import { APP_CONFIG } from "@/constants/app";

// Remove duplicate type definition - using centralized types

interface StoryDisplayProps {
  userInfo: UserInfo;
  onHome: () => void;
  onNewStory: () => void;
  onSessionEnded: (stats?: any) => void;
}

const StoryDisplay = ({ userInfo, onHome, onNewStory, onSessionEnded }: StoryDisplayProps) => {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  
  // Core state
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [isReading, setIsReading] = useState(true); // Auto-start reading
  const [timeRemaining, setTimeRemaining] = useState(APP_CONFIG.FREE_SESSION_DURATION);
  const [story, setStory] = useState<string[]>([]);
  const [storyConfig, setStoryConfig] = useState<any>(null);
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevel>(
    userInfo.difficultyLevel || (userInfo.age <= 6 ? "easy" : userInfo.age <= 9 ? "medium" : userInfo.age <= 12 ? "hard" : "expert")
  );
  
  // UI state
  const [showAddPagesAlert, setShowAddPagesAlert] = useState(false);
  const [hasShownAddPagesAlert, setHasShownAddPagesAlert] = useState(false);
  const [showFinishCountdown, setShowFinishCountdown] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(5);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [hasShownTutorial, setHasShownTutorial] = useState(false);
  const [showCongratulations, setShowCongratulations] = useState(false);
  
  // Progress tracking
  const [readingProgress, setReadingProgress] = useState<ReadingProgress | null>(null);
  const [showProgressDashboard, setShowProgressDashboard] = useState(false);
  const [showLearningPath, setShowLearningPath] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());
  const [sessionWordsRead, setSessionWordsRead] = useState(0);
  
  // Reading stats
  const [readingStats, setReadingStats] = useState({
    wordsRead: 0,
    timeSpent: 0,
    pagesRead: 0,
    startTime: Date.now(),
    accuracy: 95
  });
  
  // Image generation
  const [currentIllustration, setCurrentIllustration] = useState<string>("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [customIllustrations, setCustomIllustrations] = useState<Map<number, string>>(new Map());
  
  // Audio/TTS
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hasPlayedAudioForPage, setHasPlayedAudioForPage] = useState<Set<number>>(new Set());
  const [audioSpeed, setAudioSpeed] = useState(0.75); // Default speed
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  // Services - Initialize with debugging
  const [runwareService] = useState<SecureRunwareService>(() => {
    console.log('Initializing Runware service with API key');
    const service = new SecureRunwareService(APP_CONFIG.RUNWARE_API_KEY);
    console.log('Runware service created:', service);
    return service;
  });
  const [openAIService] = useState<any>(() => createOpenAITTSService());
  
  // Set language based on user's native language when component loads
  useEffect(() => {
    if (userInfo.nativeLanguage && userInfo.nativeLanguage !== i18n.language) {
      i18n.changeLanguage(userInfo.nativeLanguage);
    }
  }, [userInfo.nativeLanguage, i18n]);

  // Illustrations array
  const illustrations = [
    illustration1, illustration2, illustration3, illustration4, illustration5,
    illustration6, illustration7, illustration8, illustration9, illustration10,
    illustration11, illustration12, illustration13, illustration14, illustration15,
    illustration16, illustration17, illustration18, illustration19, illustration20,
    illustration21, illustration22, illustration23, illustration24, illustration25,
    illustration26, illustration27, illustration28, illustration29, illustration30,
    illustration31, illustration32, illustration33, illustration34, illustration35,
    illustration36, illustration37, illustration38, illustration39, illustration40,
    illustration41, illustration42, illustration43, illustration44
  ];

  // Generate initial story and setup reading stats
  useEffect(() => {
    const generateStory = async () => {
      try {
        // Reset progress bar and reading state for new session (free version)
        setCurrentParagraph(0);
        setIsReading(true); // Auto-start reading
        setTimeRemaining(APP_CONFIG.FREE_SESSION_DURATION);
        setHasShownAddPagesAlert(false); // Reset alert flag for new session
        setCustomIllustrations(new Map()); // Clear custom illustrations
        
        // Initialize fresh progress tracking for each session (free version - no persistence)
        const newProgress = ProgressTrackingService.initializeProgress(userInfo);
        setReadingProgress(newProgress);
        // Don't save progress for free version - reset every session
        
        // Start tutorial for new session only if not shown before
        if (!hasShownTutorial) {
          setShowTutorial(true);
          setTutorialStep(0);
          setHasShownTutorial(true);
        }
        
        // Use centralized story generation service with word limits
        const result = await StoryGeneratorService.generateStory(userInfo, currentDifficulty, 10);
        setStory(result.pages);
        setStoryConfig(result.config);
        
        // Calculate word count for stats and reset reading stats
        const wordCount = result.pages.join(' ').split(' ').filter(word => word.length > 0).length;
        setSessionStartTime(new Date());
        setSessionWordsRead(wordCount);
        
        setReadingStats({ 
          wordsRead: wordCount,
          timeSpent: 0, // Reset time spent
          pagesRead: 0, // Reset pages read
          startTime: Date.now(), // Reset start time
          accuracy: 95
        });
        
        // Set illustration
        const illustrationIndex = Math.floor(Math.random() * illustrations.length);
        setCurrentIllustration(illustrations[illustrationIndex]);
        
        // Auto-generate custom illustration for the first page
        if (result.pages.length > 0) {
          // 1-2 second delay for first page image generation
          setTimeout(() => {
            generateCustomIllustration(0, result.pages[0]);
          }, 1500);
        }
      } catch (error) {
        console.error('Error generating story:', error);
        toast({
          title: "Story Generation Error",
          description: "Unable to generate story. Please try again.",
          variant: "destructive"
        });
      }
    };

    generateStory();
  }, [userInfo]);

  // Update reading stats when reading
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isReading) {
      interval = setInterval(() => {
        setReadingStats(prev => ({
          ...prev,
          timeSpent: prev.timeSpent + 1
        }));
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isReading]);

  // Timer countdown with finish countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isReading && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          if (newTime === 0) {
            setIsReading(false);
            // Start 5-second countdown before auto-finishing
            setShowFinishCountdown(true);
            setCountdownSeconds(APP_CONFIG.COUNTDOWN_DURATION);
          }
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isReading, timeRemaining]);

  // Countdown timer for auto-finish
  useEffect(() => {
    let countdownInterval: NodeJS.Timeout | null = null;
    
    if (showFinishCountdown && countdownSeconds > 0) {
      countdownInterval = setInterval(() => {
        setCountdownSeconds(prev => {
          const newCount = prev - 1;
          if (newCount === 0) {
            // Show congratulations before finishing
            setShowCongratulations(true);
            setShowFinishCountdown(false);
            // Finish session after celebration
            setTimeout(() => {
              handleFinishSession();
            }, 3000);
          }
          return newCount;
        });
      }, 1000);
    }
    
    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [showFinishCountdown, countdownSeconds]);

  // Add pages alert logic - only once per session
  useEffect(() => {
    const isNextToLastPage = currentParagraph === story.length - 2;
    const hasTimeRemaining = timeRemaining > 60;
    
    // Only show alert once per session, first time reaching next-to-last page
    if (isNextToLastPage && hasTimeRemaining && !hasShownAddPagesAlert && story.length > 1) {
      setShowAddPagesAlert(true);
      setHasShownAddPagesAlert(true); // Once set, never reset during session
      
      setTimeout(() => {
        setShowAddPagesAlert(false);
      }, APP_CONFIG.ALERT_DURATION);
    }
  }, [currentParagraph, story.length, timeRemaining, hasShownAddPagesAlert]);

  useEffect(() => {
    if (showTutorial && story.length > 0) {
      const tutorialSteps = [
        { message: t("storyDisplay.difficulty.tutorialSteps.step1"), duration: APP_CONFIG.TUTORIAL_STEP_DURATION, target: "timer" },
        { message: t("storyDisplay.difficulty.tutorialSteps.step2"), duration: APP_CONFIG.TUTORIAL_STEP_DURATION, target: "audio" },
        { message: t("storyDisplay.difficulty.tutorialSteps.step3"), duration: APP_CONFIG.TUTORIAL_STEP_DURATION, target: "difficulty" },
        { message: t("storyDisplay.difficulty.tutorialSteps.step4"), duration: APP_CONFIG.TUTORIAL_STEP_DURATION, target: "pages" },
        { message: t("storyDisplay.difficulty.tutorialSteps.step5"), duration: APP_CONFIG.TUTORIAL_STEP_DURATION, target: "center" }
      ];

      let currentStep = 0;
      
      const showNextStep = () => {
        if (currentStep < tutorialSteps.length) {
          setTutorialStep(currentStep);
          
          // Add highlighting class to target element
          const targetElement = document.querySelector(`[data-tutorial-target="${tutorialSteps[currentStep].target}"]`);
          if (targetElement) {
            targetElement.classList.add('tutorial-highlight');
          }
          
          // Remove highlighting from previous element
          if (currentStep > 0) {
            const prevTargetElement = document.querySelector(`[data-tutorial-target="${tutorialSteps[currentStep - 1].target}"]`);
            if (prevTargetElement) {
              prevTargetElement.classList.remove('tutorial-highlight');
            }
          }

          setTimeout(() => {
            currentStep++;
            if (currentStep < tutorialSteps.length) {
              showNextStep();
            } else {
              setShowTutorial(false);
              setHasShownTutorial(true);
              // Remove highlighting from last element
              const lastTargetElement = document.querySelector(`[data-tutorial-target="${tutorialSteps[currentStep - 1].target}"]`);
              if (lastTargetElement) {
                lastTargetElement.classList.remove('tutorial-highlight');
              }
            }
          }, tutorialSteps[currentStep].duration);
        }
      };

      const timer = setTimeout(() => {
        showNextStep();
      }, 1000);

      return () => {
        clearTimeout(timer);
        // Clean up any remaining highlights
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
          el.classList.remove('tutorial-highlight');
        });
      };
    }
  }, [showTutorial, story.length, hasShownTutorial]);

  const totalPages = story.length;
  const currentStory = story[currentParagraph] || "Loading your adventure...";

  const getUserAvatar = () => {
    const gender = userInfo.avatar.type || 'boy';
    const skinTone = userInfo.avatar.skinTone || 'light';
    
    if (gender === 'boy') {
      switch (skinTone) {
        case 'pale': return avatarBoyPale;
        case 'light': return avatarBoyLight;
        case 'medium': return avatarBoyMedium;
        case 'olive': return avatarBoyOlive;
        case 'dark': return avatarBoyDark;
        default: return avatarBoyLight;
      }
    } else {
      switch (skinTone) {
        case 'pale': return avatarGirlPale;
        case 'light': return avatarGirlLight;
        case 'medium': return avatarGirlMedium;
        case 'olive': return avatarGirlOlive;
        case 'dark': return avatarGirlDark;
        default: return avatarGirlLight;
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMakeEasier = () => {
    if (currentDifficulty === "medium") {
      setCurrentDifficulty("easy");
      regenerateStoryWithNewDifficulty("easy");
    } else if (currentDifficulty === "hard") {
      setCurrentDifficulty("medium");
      regenerateStoryWithNewDifficulty("medium");
    } else if (currentDifficulty === "expert") {
      setCurrentDifficulty("hard");
      regenerateStoryWithNewDifficulty("hard");
    }
  };

  const handleMakeHarder = () => {
    if (currentDifficulty === "easy") {
      setCurrentDifficulty("medium");
      regenerateStoryWithNewDifficulty("medium");
    } else if (currentDifficulty === "medium") {
      setCurrentDifficulty("hard");
      regenerateStoryWithNewDifficulty("hard");
    } else if (currentDifficulty === "hard") {
      setCurrentDifficulty("expert");
      regenerateStoryWithNewDifficulty("expert");
    }
  };

  const regenerateStoryWithNewDifficulty = async (newDifficulty: DifficultyLevel) => {
    try {
      // Store current page to maintain reading position if possible
      const previousPage = currentParagraph;
      const currentStoryLength = story.length;
      
      console.log(`Regenerating story: current length ${currentStoryLength}, difficulty ${newDifficulty}`);
      
      // Only regenerate story content, don't reset timer or session stats
      // Use improved story generator with current story length to maintain page count
      const result = await StoryGeneratorService.generateStory(userInfo, newDifficulty, currentStoryLength);
      
      console.log(`Generated story: received ${result.pages.length} pages, expected ${currentStoryLength}`);
      
      setStory(result.pages);
      setStoryConfig(result.config);
      
      // Clear custom illustrations for new story
      setCustomIllustrations(new Map());
      
      // Determine best page to start on (try to maintain position, but don't exceed new story length)
      const maxPageIndex = Math.max(0, result.pages.length - 1);
      const targetPage = Math.min(previousPage, maxPageIndex);
      setCurrentParagraph(targetPage);
      
      // Immediately set default illustration for current page to avoid blank state
      const illustrationIndex = targetPage % illustrations.length;
      setCurrentIllustration(illustrations[illustrationIndex]);
      
      // Auto-generate custom illustration for the current page with delay
      if (result.pages.length > 0 && result.pages[targetPage]) {
        // Add 1-2 second delay when difficulty changes
        setTimeout(() => {
          generateCustomIllustration(targetPage, result.pages[targetPage]);
        }, 1500);
      }
      
    } catch (error) {
      console.error('Error regenerating story with new difficulty:', error);
      toast({
        title: "Story Update Error",
        description: "Unable to update story difficulty. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleNext = () => {
    if (currentParagraph < totalPages - 1) {
      const nextParagraph = currentParagraph + 1;
      setCurrentParagraph(nextParagraph);
      
      // Check if we already have a custom illustration for this page
      if (customIllustrations.has(nextParagraph)) {
        setCurrentIllustration(customIllustrations.get(nextParagraph)!);
      } else {
        // Set default illustration first
        const illustrationIndex = nextParagraph % illustrations.length;
        setCurrentIllustration(illustrations[illustrationIndex]);
        
        // Auto-generate custom illustration for the new page with delay
        if (story[nextParagraph]) {
          // Add 1-2 second delay when navigating to new page
          setTimeout(() => {
            generateCustomIllustration(nextParagraph, story[nextParagraph]);
          }, 1200);
        }
      }
    }
  };

  const handlePrevious = () => {
    if (currentParagraph > 0) {
      const prevParagraph = currentParagraph - 1;
      setCurrentParagraph(prevParagraph);
      
      // Check if we already have a custom illustration for this page
      if (customIllustrations.has(prevParagraph)) {
        setCurrentIllustration(customIllustrations.get(prevParagraph)!);
      } else {
        // Set default illustration first
        const illustrationIndex = prevParagraph % illustrations.length;
        setCurrentIllustration(illustrations[illustrationIndex]);
        
        // Auto-generate custom illustration for the previous page with delay
        if (story[prevParagraph]) {
          // Add 1-2 second delay when navigating to previous page
          setTimeout(() => {
            generateCustomIllustration(prevParagraph, story[prevParagraph]);
          }, 1200);
        }
      }
    }
  };

  const handleAddPages = async () => {
    try {
      // Generate continuation that flows from current story context
      // Pass the ENTIRE existing story context, not just last 3 pages
      const fullStoryContext = story.join(' '); // Full story for complete context
      const result = await StoryGeneratorService.generateStoryContinuation(
        userInfo, 
        currentDifficulty, 
        5, 
        fullStoryContext
      );
      
      setStory(prev => [...prev, ...result.pages]);
      // IMPORTANT: Do NOT update storyConfig to maintain consistency with original story
      // The continuation should use the same visual config as the existing story
      setShowAddPagesAlert(false); // Hide current alert but don't reset the flag
      
      // CRITICAL: Do NOT update storyConfig to maintain visual consistency
      // The continuation uses the existing story's configuration to ensure
      // font sizes, word limits, and styling remain identical
      
      toast({
        title: "Story Extended! 📖",
        description: "5 new pages have been added to your adventure!",
      });
      
      // Update reading stats
      const newWordCount = result.pages.join(' ').split(' ').filter(word => word.length > 0).length;
      setSessionWordsRead(prev => prev + newWordCount);
      setReadingStats(prev => ({
        ...prev,
        wordsRead: prev.wordsRead + newWordCount
      }));
    } catch (error) {
      console.error('Error adding pages:', error);
      toast({
        title: "Error",
        description: "Unable to add more pages. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddTime = () => {
    // Add 5 minutes (300 seconds), but don't go over 20 minutes (1200 seconds)
    setTimeRemaining(prev => Math.min(prev + 300, 20 * 60));
    toast({
      title: t("storyDisplay.timeAdded"),
      description: t("storyDisplay.timeAddedDescription"),
    });
  };

  const handleReduceTime = () => {
    // Remove 10 minutes (600 seconds), but don't go below 1 minute
    setTimeRemaining(prev => Math.max(prev - 600, 60));
  };

  const handleReducePages = () => {
    if (story.length > 1) {
      // Remove 1 page at a time
      setStory(prev => prev.slice(0, -1));
      
      // If current page is now out of bounds, go to the last page
      if (currentParagraph >= story.length - 1) {
        setCurrentParagraph(story.length - 2);
      }
      
      toast({
        title: "Page Removed 📄",
        description: "Removed 1 page from your story.",
      });
    }
  };

  const handleFinishSession = () => {
    setIsReading(false);
    
    // Calculate actual session stats
    const actualTimeSpent = Math.floor((Date.now() - sessionStartTime.getTime()) / 1000);
    const sessionTimeSpent = (20 * 60) - timeRemaining;
    const isFullSession = sessionTimeSpent >= (20 * 60);
    const actualWordsRead = sessionWordsRead;
    const actualPagesRead = currentParagraph + 1; // Current page + 1 since it's 0-indexed
    
    // Update reading progress (but don't save for free version)
    if (readingProgress) {
      const updatedProgress = ProgressTrackingService.updateReadingSession(
        readingProgress,
        {
          wordsRead: actualWordsRead,
          timeSpent: sessionTimeSpent,
          storiesCompleted: actualPagesRead >= totalPages ? 1 : 0,
          comprehensionScore: readingStats.accuracy
        }
      );
      setReadingProgress(updatedProgress);
      // Don't save progress for free version - reset every session
    }
    
    // Create session stats for SessionEnded component
    const sessionStats = {
      wordsRead: actualWordsRead,
      timeSpent: actualTimeSpent,
      pagesRead: actualPagesRead,
      totalPages: story.length,
      accuracy: 95, // This could be enhanced with actual reading accuracy tracking
      currentDifficulty: currentDifficulty
    };
    
    // Update progress tracking if available
    if (readingProgress) {
      const sessionData = {
        wordsRead: actualWordsRead,
        timeSpent: actualTimeSpent,
        storiesCompleted: 1,
        comprehensionScore: 95
      };
      
      const updatedProgress = ProgressTrackingService.updateReadingSession(readingProgress, sessionData);
      const finalProgress = {
        ...updatedProgress,
        personalizedRecommendations: ProgressTrackingService.generatePersonalizedRecommendations(updatedProgress, userInfo)
      };
      
      setReadingProgress(finalProgress);
      ProgressTrackingService.saveProgress(finalProgress);
    }
    
    // Navigate to session ended with actual stats
    onSessionEnded(sessionStats);
  };

  const playTextToSpeech = async (text: string) => {
    // Prevent multiple clicks and playing audio multiple times per page
    if (isPlaying || hasPlayedAudioForPage.has(currentParagraph)) return;
    
    try {
      setIsPlaying(true);
      // Mark this page as having played audio
      setHasPlayedAudioForPage(prev => new Set([...prev, currentParagraph]));
      
      // Stop any existing audio first
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      
      await openAIService.speakText(text, { speed: audioSpeed });
      setIsPlaying(false);
    } catch (error) {
      console.error('Error playing text-to-speech:', error);
      setIsPlaying(false);
      toast({
        title: "Audio Error",
        description: "Unable to play audio. Please try again.",
        variant: "destructive"
      });
    }
  };

  const stopTextToSpeech = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setIsPlaying(false);
  };


  const generateCustomIllustration = async (pageIndex: number, storyText: string) => {
    console.log('=== Generating page-specific illustration with character consistency ===');
    console.log('Page:', pageIndex, 'Story text:', storyText);
    
    // Validate inputs
    if (isGeneratingImage || customIllustrations.has(pageIndex) || !storyText?.trim()) {
      console.log('Skipping generation - invalid conditions');
      return;
    }
    
    try {
      setIsGeneratingImage(true);
      
      // 1-2 second delay as requested by user
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Extract main characters from the entire story for consistency
      const fullStoryText = story.join(' ').toLowerCase();
      
      // ALWAYS start with the user as the main character with accurate ethnic representation
      const userCharacterDescription = () => {
        const gender = userInfo.avatar?.type || 'child';
        const age = userInfo.age || 8;
        
        // Accurate skin tone and ethnic representation
        const skinToneMap = {
          pale: 'very light skin, European features',
          light: 'light skin, Caucasian features', 
          medium: 'medium brown skin, mixed heritage features',
          olive: 'olive-toned skin, Mediterranean or Middle Eastern features',
          dark: 'dark brown skin, African or African American features with beautiful dark skin tone'
        };
        
        const skinTone = skinToneMap[userInfo.avatar?.skinTone || 'medium'];
        
        return `${userInfo.name}, a ${age}-year-old ${gender} with ${skinTone}`;
      };
      
      // Character consistency mapping - USER is ALWAYS the main character
      const storyCharacters = {
        mainCharacter: userCharacterDescription(), // User is always main character
        characterColor: '',
        characterType: '',
        secondaryCharacters: [] as string[]
      };
      
      // Find secondary characters (animals, friends) from story content
      const animals = ['cat', 'dog', 'rabbit', 'bear', 'fox', 'bird', 'mouse', 'elephant', 'lion', 'tiger', 'owl', 'squirrel', 'deer', 'wolf'];
      const colors = ['blue', 'red', 'yellow', 'green', 'purple', 'orange', 'pink', 'white', 'black', 'brown', 'golden', 'silver', 'gray', 'grey'];
      
      // Find secondary animal characters with colors for story context
      for (const animal of animals) {
        if (fullStoryText.includes(animal)) {
          for (const color of colors) {
            if (fullStoryText.includes(`${color} ${animal}`) || fullStoryText.includes(`${color}-${animal}`)) {
              storyCharacters.secondaryCharacters.push(`${color} ${animal}`);
              break;
            }
          }
          if (!storyCharacters.secondaryCharacters.some(char => char.includes(animal))) {
            storyCharacters.secondaryCharacters.push(animal);
          }
        }
      }
      
      // Enhanced language-specific prompts with professional quality and consistency
      const getLanguageSpecificPrompt = (nativeLanguage: string) => {
        const basePrompts = {
          en: {
            base: "A museum-quality, professional children's book illustration in exquisite watercolor style showing",
            context: "perfectly capturing the scene:",
            atmosphere: "rendered with masterful artistic technique, luminous colors, perfect lighting, flawless composition, consistent character design, award-winning children's book artistry, gallery-worthy illustration, highly detailed professional artwork, safe wholesome content, picture book perfection"
          },
          es: {
            base: "Una ilustración profesional de calidad de museo para libro infantil en exquisito estilo acuarela mostrando",
            context: "capturando perfectamente la escena:",
            atmosphere: "renderizada con técnica artística magistral, colores luminosos, iluminación perfecta, composición impecable, diseño de personajes consistente, arte galardonado de libros infantiles, ilustración digna de galería, obra de arte profesional muy detallada, contenido seguro y saludable, perfección de libro ilustrado"
          },
          fr: {
            base: "Une illustration professionnelle de qualité muséale pour livre d'enfants en style aquarelle exquis montrant",
            context: "capturant parfaitement la scène:",
            atmosphere: "rendue avec une technique artistique magistrale, des couleurs lumineuses, un éclairage parfait, une composition impeccable, un design de personnage cohérent, un art primé de livre pour enfants, une illustration digne de galerie, une œuvre d'art professionnelle très détaillée, un contenu sûr et sain, la perfection du livre d'images"
          },
          pt: {
            base: "Uma ilustração profissional de qualidade de museu para livro infantil em estilo aquarela requintado mostrando",
            context: "capturando perfeitamente a cena:",
            atmosphere: "renderizada com técnica artística magistral, cores luminosas, iluminação perfeita, composição impecável, design de personagem consistente, arte premiada de livros infantis, ilustração digna de galeria, obra de arte profissional muito detalhada, conteúdo seguro e saudável, perfeição de livro ilustrado"
          },
          ar: {
            base: "رسم توضيحي احترافي بجودة متحف لكتاب أطفال بأسلوب ألوان مائية رائع يُظهر",
            context: "يلتقط المشهد بشكل مثالي:",
            atmosphere: "مُقدم بتقنية فنية بارعة، ألوان مضيئة، إضاءة مثالية، تركيب لا تشوبه شائبة، تصميم شخصيات متسق، فن حائز على جوائز لكتب الأطفال، رسم توضيحي يليق بالمعرض، عمل فني احترافي مفصل جداً، محتوى آمن وصحي، كمال كتاب مصور"
          },
          zh: {
            base: "一幅博物馆级专业儿童书籍水彩风格插图，展示",
            context: "完美捕捉场景：",
            atmosphere: "以精湛的艺术技巧渲染，明亮的色彩，完美的光照，无瑕的构图，一致的角色设计，获奖儿童书籍艺术，画廊级插图，高度详细的专业艺术作品，安全健康的内容，图画书的完美"
          },
          hi: {
            base: "एक संग्रहालय-गुणवत्ता का, पेशेवर बच्चों की पुस्तक का उत्कृष्ट जल रंग शैली में चित्रण दिखा रहा है",
            context: "दृश्य को पूर्ण रूप से कैप्चर करते हुए:",
            atmosphere: "कुशल कलात्मक तकनीक के साथ प्रस्तुत, चमकदार रंग, सही प्रकाश व्यवस्था, निर्दोष संरचना, निरंतर चरित्र डिज़ाइन, पुरस्कार विजेता बच्चों की पुस्तक कलाकृति, गैलरी-योग्य चित्रण, अत्यधिक विस्तृत पेशेवर कलाकृति, सुरक्षित स्वस्थ सामग्री, चित्र पुस्तक की पूर्णता"
          }
        };
        
        return basePrompts[nativeLanguage as keyof typeof basePrompts] || basePrompts.en;
      };
      
      // Analyze current page for specific scene elements
      const currentPageText = storyText.toLowerCase();
      let sceneDetails = "";
      
      // ALWAYS include the user as the main character in every scene
      const userInScene = storyCharacters.mainCharacter;
      const secondaryChar = storyCharacters.secondaryCharacters[0] || 'a friendly companion';
      
      if (currentPageText.includes("hello") || currentPageText.includes("said")) {
        sceneDetails = `${userInScene} speaking or greeting ${secondaryChar} with warm, expressive eyes and friendly body language`;
      } else if (currentPageText.includes("adventure") || currentPageText.includes("explore")) {
        sceneDetails = `${userInScene} on an exciting adventure with ${secondaryChar} through a magical, detailed landscape`;
      } else if (currentPageText.includes("friend") || currentPageText.includes("meet")) {
        sceneDetails = `${userInScene} meeting ${secondaryChar} in a heartwarming, beautifully detailed scene`;
      } else if (currentPageText.includes("play") || currentPageText.includes("fun")) {
        sceneDetails = `${userInScene} playing joyfully with ${secondaryChar} in a beautiful environment`;
      } else if (currentPageText.includes("home") || currentPageText.includes("house")) {
        sceneDetails = `${userInScene} in a cozy, beautifully illustrated home setting`;
      } else if (currentPageText.includes("garden") || currentPageText.includes("flower")) {
        sceneDetails = `${userInScene} in a vibrant garden with stunning floral details`;
      } else if (currentPageText.includes("forest") || currentPageText.includes("tree")) {
        sceneDetails = `${userInScene} in an enchanted forest with magnificent trees and lighting`;
      } else {
        sceneDetails = `${userInScene} in a magical storybook scene with beautiful details`;
      }
      
      // Generate enhanced prompt in the user's native language
      const langPrompt = getLanguageSpecificPrompt(userInfo.nativeLanguage || 'en');
      const prompt = `${langPrompt.base} ${sceneDetails} ${langPrompt.context} ${storyText}. ${langPrompt.atmosphere}. CRITICAL: ALWAYS show ${userInScene} as the main character with exact ethnic representation - ${userInfo.name} with authentic ${userInfo.avatar?.skinTone === 'dark' ? 'African/African American' : userInfo.avatar?.skinTone || 'medium'} features and ${userInfo.avatar?.type || 'child'} characteristics. Accurate ethnic representation is essential.`;
      
      console.log('Enhanced consistency prompt:', prompt);
      console.log('Main character for consistency:', storyCharacters.mainCharacter);
      
      // Generate image with enhanced settings for quality
      const result = await runwareService.generateImage({
        positivePrompt: prompt,
        model: "runware:100@1",
        width: 1024, // Higher resolution for beauty
        height: 1024,
        numberResults: 1,
        outputFormat: "WEBP",
        CFGScale: 8, // Higher for better prompt adherence
        scheduler: "FlowMatchEulerDiscreteScheduler"
      });
      
      console.log('Generation result:', result);
      
      if (result?.imageURL) {
        // Update illustrations map
        setCustomIllustrations(prev => new Map(prev.set(pageIndex, result.imageURL)));
        
        // Update current illustration if we're still on this page
        if (pageIndex === currentParagraph) {
          setCurrentIllustration(result.imageURL);
          console.log('Updated current illustration for page:', pageIndex);
        }
        
      } else {
        console.error('No image URL in result');
        throw new Error('Failed to generate image');
      }
    } catch (error) {
      console.error('Image generation failed:', error);
      
      // Show error notification only for actual failures
      toast({
        title: "Image Generation Failed",
        description: "Using default illustration instead.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };
  
  // Tutorial positioning functions
  const getTutorialPosition = () => {
    switch (tutorialStep) {
      case 0: return "top-24 right-6"; // Timer area
      case 1: return "top-1/2 left-6 transform -translate-y-1/2"; // Audio controls
      case 2: return "top-1/2 left-6 transform -translate-y-1/2"; // Difficulty controls  
      case 3: return "top-1/2 left-6 transform -translate-y-1/2"; // Page controls
      case 4: return "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"; // Center
      default: return "bottom-6 right-6";
    }
  };

  const getArrowPosition = () => {
    switch (tutorialStep) {
      case 0: return "top-full left-8"; // Point up to timer
      case 1: return "right-full top-6"; // Point right to controls
      case 2: return "right-full top-6"; // Point right to controls
      case 3: return "right-full top-6"; // Point right to controls
      case 4: return "hidden"; // No arrow for center message
      default: return "hidden";
    }
  };
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.start();
      setIsRecording(true);
      
      mediaRecorder.onstop = () => {
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
      };
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Unable to start recording. Please check microphone permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <AdaptiveUI userInfo={userInfo} className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Simple Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* User Avatar */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-purple-200 shadow-sm">
                <img 
                  src={getUserAvatar()} 
                  alt={`${userInfo.name}'s avatar`}
                  className="w-full h-full object-cover"
                />
              </div>
              <img src={time2ReadLogo} alt="Time2Read" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg" />
              <h1 className="text-sm sm:text-lg md:text-xl font-bold text-purple-800 truncate">
                {userInfo.name}'s {t("storyDisplay.header.readingTime")}
              </h1>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button
                onClick={() => setShowProgressDashboard(true)}
                variant="ghost"
                size="sm"
                className="text-purple-600 hover:bg-purple-50 hidden sm:flex"
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                <span className="hidden md:inline">{t("storyDisplay.header.progress")}</span>
              </Button>
              <Button
                onClick={() => setShowLearningPath(true)}
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:bg-blue-50 hidden sm:flex"
              >
                <Target className="w-4 h-4 mr-1" />
                <span className="hidden md:inline">{t("learningPath.challenges")}</span>
              </Button>
              <Button 
                onClick={handleFinishSession} 
                className="bg-green-500 hover:bg-green-600 text-white rounded-full text-xs sm:text-sm"
                size="sm"
              >
                <span className="hidden sm:inline">{t("storyDisplay.header.done")}</span>
                <span className="sm:hidden">Done</span>
              </Button>
              <Button onClick={onNewStory} variant="outline" size="sm" className="rounded-full hidden sm:flex">
                <RotateCcw className="w-4 h-4 mr-1" />
                <span className="hidden md:inline">{t("storyDisplay.header.newStory")}</span>
              </Button>
              <Button onClick={onHome} variant="outline" size="sm" className="rounded-full">
                <Home className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                <span className="hidden sm:inline">{t("storyDisplay.header.home")}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>


      {/* Main Content Container - Full width and height */}
      <div className="flex-1 w-full px-2 sm:px-4 py-4 sm:py-6 pt-4 sm:pt-20 pb-24 sm:pb-32 min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-start h-full">
          {/* Illustration - Now on the left */}
          <div className="order-2 lg:order-1">
            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl sm:rounded-3xl border-2 border-purple-200/50 overflow-hidden max-h-[300px] sm:max-h-[400px] lg:max-h-[600px]">
              <CardContent className="p-3 sm:p-6">
                <div className="relative w-full h-[250px] sm:h-[350px] lg:h-[500px] bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl overflow-hidden flex items-center justify-center">
                  {currentIllustration ? (
                    <img 
                      src={customIllustrations.get(currentParagraph) || currentIllustration}
                      alt="Story illustration"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="text-6xl mb-4">📖</div>
                      <p className="text-purple-600 font-medium">Your story illustration is loading...</p>
                    </div>
                  )}
                  
                  {/* Image Generation Status */}
                  {isGeneratingImage && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg px-3 py-2 flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-medium text-gray-700">Creating image...</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Story Content - Now on the right */}
          <div className="order-1 lg:order-2">
            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl sm:rounded-3xl border-2 border-purple-200/50 overflow-visible min-h-[600px] sm:min-h-[700px] lg:min-h-[800px]">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                {/* Story Text with Dynamic Word-Limited Sizing */}
                <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
                  <div className={`
                    leading-relaxed text-gray-800 font-medium text-center space-y-3 sm:space-y-4
                    ${storyConfig?.fontSize || (
                      currentDifficulty === 'easy' 
                        ? 'text-4xl sm:text-5xl lg:text-6xl' 
                        : currentDifficulty === 'medium'
                        ? 'text-3xl sm:text-4xl lg:text-5xl'
                        : currentDifficulty === 'hard'
                        ? 'text-2xl sm:text-3xl lg:text-4xl'
                        : 'text-xl sm:text-2xl lg:text-3xl'
                    )}
                    ${storyConfig?.lineHeight || 'leading-relaxed'}
                  `}>
                    {processTextForPhonetics(currentStory, "", currentDifficulty, userInfo)}
                  </div>
                </div>
                
                {/* Controls */}
                <div className="space-y-3 sm:space-y-4 mt-4 sm:mt-6 lg:mt-8">
                  {/* Audio & Recording */}
                  <div className="flex justify-center space-x-2 sm:space-x-3" data-tutorial-target="audio">
                    <Button
                      onClick={() => playTextToSpeech(currentStory)}
                      variant="outline"
                      size="sm"
                      className="rounded-full bg-blue-50 border-blue-200 hover:bg-blue-100 p-2 sm:p-3"
                      disabled={isPlaying || hasPlayedAudioForPage.has(currentParagraph)}
                    >
                      {isPlaying ? (
                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      ) : hasPlayedAudioForPage.has(currentParagraph) ? (
                        <VolumeX className="w-3 h-3 sm:w-4 sm:h-4" />
                      ) : (
                        <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                    </Button>

                    <Button
                      onClick={() => isRecording ? stopRecording() : startRecording()}
                      variant={isRecording ? "destructive" : "outline"}
                      size="sm"
                      className="rounded-full p-2 sm:p-3"
                    >
                      {isRecording ? <MicOff className="w-3 h-3 sm:w-4 sm:h-4" /> : <Mic className="w-3 h-3 sm:w-4 sm:h-4" />}
                    </Button>
                  </div>

                  {/* Audio Speed Controls */}
                  <div className="flex justify-center items-center space-x-2">
                    <span className="text-xs text-gray-600 font-medium hidden sm:inline">{t("storyDisplay.controls.speed")}</span>
                    <div className="flex space-x-1">
                      {[0.5, 0.75, 1.0].map((speed) => (
                        <Button
                          key={speed}
                          onClick={() => setAudioSpeed(speed)}
                          variant={audioSpeed === speed ? "default" : "outline"}
                          size="sm"
                          className="rounded-full text-xs px-2 sm:px-3 py-1 h-6 sm:h-7"
                        >
                          {speed}x
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div className="flex justify-center space-x-2" data-tutorial-target="difficulty">
                    <Button
                      onClick={handleMakeEasier}
                      disabled={currentDifficulty === "easy"}
                      size="sm"
                      variant="outline"
                      className="rounded-full text-xs"
                    >
                      <TrendingDown className="w-3 h-3 mr-1" />
                      {t("storyDisplay.controls.easier")}
                    </Button>
                    
                    <Button
                      onClick={handleMakeHarder}
                      disabled={currentDifficulty === "expert"}
                      size="sm"
                      variant="outline"
                      className="rounded-full text-xs"
                    >
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {t("storyDisplay.controls.harder")}
                    </Button>
                  </div>

                   {/* Page Counter */}
                   <div className="text-center mb-4">
                     <span className="text-sm font-medium text-muted-foreground">
                       {t("storyDisplay.navigation.pageCounter", { 
                         current: currentParagraph + 1, 
                         total: totalPages 
                       })}
                     </span>
                   </div>

                   {/* Navigation */}
                   <div className="flex justify-between items-center">
                    <Button
                      onClick={handlePrevious}
                      disabled={currentParagraph === 0}
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                    >
                      {t("storyDisplay.controls.back")}
                    </Button>
                    
                    <div className="flex items-center space-x-3">
                      {/* Page dots */}
                      <div className="flex space-x-1">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-all ${
                              i === currentParagraph % 5 
                                ? 'bg-purple-500 scale-125' 
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <Button
                      onClick={handleNext}
                      disabled={currentParagraph >= totalPages - 1}
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                    >
                      {t("storyDisplay.controls.next")}
                    </Button>
                  </div>

                  {/* Page Management Section */}
                  <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-100" data-tutorial-target="pages">
                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-3">
                      <span className="text-xs sm:text-sm text-gray-600 font-medium">{t("storyDisplay.pages.storyLength")}</span>
                      
                      <div className="flex items-center justify-center space-x-1 sm:space-x-2 w-full sm:w-auto">
                        <Button
                          onClick={handleReducePages}
                          variant="outline"
                          size="sm"
                          className="rounded-full text-xs px-2 sm:px-3 py-1 h-8 hover:bg-red-50 hover:border-red-200 hover:text-red-600 flex-shrink-0"
                          disabled={story.length <= 1}
                        >
                          <div className="relative flex items-center">
                            <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            <Minus className="w-1 h-1 sm:w-1.5 sm:h-1.5 absolute -top-0.5 -right-0.5 bg-white rounded-full" />
                          </div>
                          <span className="hidden sm:inline">{t("storyDisplay.pages.removePages")}</span>
                          <span className="sm:hidden">-</span>
                        </Button>
                        
                        <span className="text-xs sm:text-sm font-bold text-purple-600 px-1 sm:px-2 text-center min-w-[60px] sm:min-w-[80px]">
                          {totalPages} {totalPages !== 1 ? t("storyDisplay.pages.pages") : t("storyDisplay.pages.page")}
                        </span>
                        
                        <div className="relative flex-shrink-0">
                          <Button
                            onClick={handleAddPages}
                            variant="outline"
                            size="sm"
                            className={`rounded-full text-xs px-2 sm:px-3 py-1 h-8 hover:bg-green-50 hover:border-green-200 hover:text-green-600 transition-all duration-300 ${
                              showAddPagesAlert 
                                ? 'animate-bounce bg-yellow-200 border-yellow-400 text-yellow-800 shadow-lg scale-110 animate-pulse' 
                                : ''
                            }`}
                          >
                            <div className="relative flex items-center">
                              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              <Plus className="w-1 h-1 sm:w-1.5 sm:h-1.5 absolute -top-0.5 -right-0.5 bg-white rounded-full" />
                            </div>
                            <span className="hidden sm:inline">{t("storyDisplay.pages.addPages")}</span>
                            <span className="sm:hidden">+</span>
                            {showAddPagesAlert && <span className="ml-1">⚡</span>}
                          </Button>
                          
                          {/* Animated Alert Bubble */}
                          {showAddPagesAlert && (
                            <div className="absolute -top-12 sm:-top-16 -left-4 sm:-left-8 z-50 animate-bounce">
                              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-xl sm:rounded-2xl shadow-xl border-2 border-yellow-300 relative animate-pulse max-w-[200px] sm:max-w-none">
                                <div className="flex items-center space-x-1 sm:space-x-2">
                                  <span className="text-sm sm:text-lg">📖</span>
                                  <div>
                                    <div className="text-xs sm:text-sm font-bold">{t("storyDisplay.alerts.almostDone")}</div>
                                    <div className="text-xs hidden sm:block">{t("storyDisplay.alerts.clickToAdd")}</div>
                                  </div>
                                </div>
                                {/* Arrow pointing down */}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 sm:border-l-8 border-r-4 sm:border-r-8 border-t-4 sm:border-t-8 border-l-transparent border-r-transparent border-t-yellow-400"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                 </div>
               </CardContent>
             </Card>
           </div>
         </div>
       </div>

      {/* Floating Timer */}
      <FloatingTimer 
        timeRemaining={timeRemaining}
        isReading={isReading}
        onToggleReading={() => setIsReading(!isReading)}
        onAddTime={handleAddTime}
        onSubtractTime={handleReduceTime}
        onAddPages={handleAddPages}
        pagesRemaining={totalPages - currentParagraph - 1}
        currentParagraph={currentParagraph}
        onSessionEnded={handleFinishSession}
        tutorialTarget="timer"
      />


      {/* Countdown Overlay */}
      {showFinishCountdown && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <Card className="bg-white rounded-3xl p-8 text-center max-w-md mx-4 shadow-2xl border-0">
            <div className="text-6xl mb-4">⏰</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {t("storyDisplay.countdown.timesUp")}
            </h2>
            <p className="text-gray-600 mb-4">
              {t("storyDisplay.countdown.goingToReport")}
            </p>
            <div className="text-4xl font-bold text-purple-600 mb-4">
              {countdownSeconds}
            </div>
            <Button 
              onClick={handleFinishSession}
              className="bg-purple-500 hover:bg-purple-600 text-white rounded-full px-6"
            >
              {t("storyDisplay.countdown.goNow")}
            </Button>
          </Card>
        </div>
      )}

      {/* Congratulations Screen */}
      {showCongratulations && (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          
          {/* Floating particles/confetti effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className="absolute animate-float opacity-80"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              >
                {['🌟', '⭐', '✨', '🎉', '🎊', '📚', '🏆'][Math.floor(Math.random() * 7)]}
              </div>
            ))}
          </div>
          
          <Card className="relative z-10 bg-white/95 backdrop-blur-sm rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-4 shadow-2xl border-0 animate-celebration">
            <div className="animate-bounce-gentle">
              <div className="text-8xl sm:text-9xl mb-6 animate-shake-hard">🎉</div>
              
              <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent mb-4 animate-flash">
                CONGRATULATIONS!
              </h1>
              
              <div className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 animate-shake-hard">
                🏆 Amazing Reading Session! 🏆
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-4 animate-wiggle">
                  <div className="text-3xl mb-2">📖</div>
                  <div className="text-sm text-gray-600">Pages Read</div>
                  <div className="text-2xl font-bold text-blue-600">{currentParagraph + 1}</div>
                </div>
                
                <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-4 animate-wiggle" style={{animationDelay: '0.2s'}}>
                  <div className="text-3xl mb-2">⏱️</div>
                  <div className="text-sm text-gray-600">Time Reading</div>
                  <div className="text-2xl font-bold text-green-600">{formatTime((20 * 60) - timeRemaining)}</div>
                </div>
              </div>
              
              <div className="text-lg text-gray-700 mb-6 animate-flash">
                You're becoming a reading superstar! 🌟
              </div>
              
              <div className="flex justify-center space-x-2">
                {['🌟', '⭐', '✨', '🏆', '🎊'].map((emoji, i) => (
                  <span 
                    key={i} 
                    className="text-4xl animate-bounce-gentle" 
                    style={{animationDelay: `${i * 0.1}s`}}
                  >
                    {emoji}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="absolute -top-4 -right-4 text-6xl animate-spin-slow">🎯</div>
            <div className="absolute -bottom-4 -left-4 text-6xl animate-bounce">🚀</div>
          </Card>
        </div>
      )}

        {/* Floating Tutorial - Positioned dynamically */}
        {showTutorial && (
          <div className={`fixed z-50 transition-all duration-500 ease-out ${getTutorialPosition()}`}>
            <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl rounded-2xl p-6 max-w-sm animate-scale-in">
              <div className="flex items-start gap-4">
                <div className="bg-white/20 rounded-full p-2 flex-shrink-0">
                  <span className="text-2xl">🎯</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium mb-1">
                    {t("storyDisplay.tutorial.step")} {tutorialStep + 1}/{t("storyDisplay.tutorial.of")}
                  </div>
                  <div className="text-sm">
                    {showTutorial && tutorialStep < 5 ? [
                      t("storyDisplay.difficulty.tutorialSteps.step1"),
                      t("storyDisplay.difficulty.tutorialSteps.step2"),
                      t("storyDisplay.difficulty.tutorialSteps.step3"),
                      t("storyDisplay.difficulty.tutorialSteps.step4"),
                      t("storyDisplay.difficulty.tutorialSteps.step5")
                    ][tutorialStep] : ""}
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setShowTutorial(false);
                    setTutorialStep(0);
                    // Clean up highlights
                    document.querySelectorAll('.tutorial-highlight').forEach(el => {
                      el.classList.remove('tutorial-highlight');
                    });
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 p-1 h-auto"
                >
                  ×
                </Button>
              </div>
              
              {/* Animated Arrow Pointer */}
              <div className={`absolute ${getArrowPosition()} w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-purple-600`} />
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((tutorialStep + 1) / 5) * 100}%` }}
                  />
                </div>
              </div>
            </Card>
          </div>
        )}
        
        {/* Progress Dashboard */}
      {showProgressDashboard && readingProgress && (
        <ProgressDashboard
          progress={readingProgress}
          userInfo={userInfo}
          onClose={() => setShowProgressDashboard(false)}
        />
      )}

      {showLearningPath && readingProgress && (
        <LearningPathDashboard
          userInfo={userInfo}
          progress={readingProgress}
          onClose={() => setShowLearningPath(false)}
          onChallengeComplete={(challengeId, score) => {
            // Update progress when challenges are completed
            const updatedProgress = {
               ...readingProgress,
               // Add points tracking to the progress (this could be enhanced by updating the ReadingProgress interface)
               storiesCompleted: readingProgress.storiesCompleted + 1
            };
            setReadingProgress(updatedProgress);
            ProgressTrackingService.saveProgress(updatedProgress);
            toast({
              title: "Challenge Complete!",
              description: `You earned ${score} points!`,
            });
          }}
        />
      )}
    </AdaptiveUI>
  );
};

export default StoryDisplay;