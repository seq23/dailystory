import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BookOpen, Home, RotateCcw, Volume2, VolumeX, TrendingUp, TrendingDown, Plus, Minus, Star, Heart, Sparkles, Wand2, Play, Pause, Timer, Mic, MicOff } from "lucide-react";
import { FloatingTimer } from "./FloatingTimer";
import type { UserInfo } from "./UserInfoForm";
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
import { createChildFriendlyPrompt } from "@/services/runwareService";
import { createOpenAITTSService } from "@/services/textToSpeechService";
import InclusiveStoryGenerator from "@/services/inclusiveStoryGenerator";
import { useToast } from "@/hooks/use-toast";

type DifficultyLevel = "easy" | "medium" | "hard" | "expert";

interface StoryDisplayProps {
  userInfo: UserInfo;
  onHome: () => void;
  onNewStory: () => void;
  onSessionEnded: (stats?: any) => void;
}

const StoryDisplay = ({ userInfo, onHome, onNewStory, onSessionEnded }: StoryDisplayProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  // Core state
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [isReading, setIsReading] = useState(true); // Auto-start reading
  const [timeRemaining, setTimeRemaining] = useState(610); // 10 minutes 10 seconds
  const [story, setStory] = useState<string[]>([]);
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
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  // Services - Initialize with debugging
  const [runwareService] = useState<SecureRunwareService>(() => {
    console.log('Initializing Runware service with API key');
    const service = new SecureRunwareService("LRRGqlrg67zH8uss6lMjVvc54pVOrznM");
    console.log('Runware service created:', service);
    return service;
  });
  const [openAIService] = useState<any>(() => createOpenAITTSService());

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
        // Reset progress bar and reading state for new session
        setCurrentParagraph(0);
        setIsReading(true); // Auto-start reading
        setTimeRemaining(610); // Reset to 10:10 (610 seconds)
        setHasShownAddPagesAlert(false); // Reset alert flag for new session
        setCustomIllustrations(new Map()); // Clear custom illustrations
        
        // Start tutorial for new session only if not shown before
        if (!hasShownTutorial) {
          setShowTutorial(true);
          setTutorialStep(0);
          setHasShownTutorial(true);
        }
        
        const generatedStory = InclusiveStoryGenerator.generateCulturallyAdaptedStory(userInfo, currentDifficulty, false, 10);
        setStory(generatedStory);
        
        // Calculate word count for stats and reset reading stats
        const wordCount = generatedStory.join(' ').split(' ').filter(word => word.length > 0).length;
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
        if (generatedStory.length > 0) {
          // Small delay to ensure component is ready
          setTimeout(() => {
            generateCustomIllustration(0, generatedStory[0]);
          }, 500);
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
  }, [userInfo, currentDifficulty]);

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
            setCountdownSeconds(5);
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
            handleFinishSession();
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
      }, 3000); // 3 seconds as requested
    }
  }, [currentParagraph, story.length, timeRemaining, hasShownAddPagesAlert]);

  useEffect(() => {
    if (showTutorial && story.length > 0) {
      const tutorialSteps = [
        { message: "Welcome! Timer auto-started at 10:10. Green + adds time, orange - removes time.", duration: 2500, target: "timer" },
        { message: "Speaker button reads aloud, microphone records you reading.", duration: 2000, target: "audio" },
        { message: "Easier/Harder buttons adjust story difficulty as you read.", duration: 1500, target: "difficulty" },
        { message: "Add/Remove Pages buttons change your story length.", duration: 2000, target: "pages" },
        { message: "Happy reading! Enjoy your personalized adventure!", duration: 2000, target: "center" }
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
    } else if (currentDifficulty === "hard") {
      setCurrentDifficulty("medium");
    } else if (currentDifficulty === "expert") {
      setCurrentDifficulty("hard");
    }
  };

  const handleMakeHarder = () => {
    if (currentDifficulty === "easy") {
      setCurrentDifficulty("medium");
    } else if (currentDifficulty === "medium") {
      setCurrentDifficulty("hard");
    } else if (currentDifficulty === "hard") {
      setCurrentDifficulty("expert");
    }
  };

  const handleNext = () => {
    if (currentParagraph < totalPages - 1) {
      const nextParagraph = currentParagraph + 1;
      setCurrentParagraph(nextParagraph);
      
      // Set new illustration
      const illustrationIndex = nextParagraph % illustrations.length;
      setCurrentIllustration(illustrations[illustrationIndex]);
      
      // Auto-generate custom illustration for the new page
      if (story[nextParagraph]) {
        generateCustomIllustration(nextParagraph, story[nextParagraph]);
      }
    }
  };

  const handlePrevious = () => {
    if (currentParagraph > 0) {
      const prevParagraph = currentParagraph - 1;
      setCurrentParagraph(prevParagraph);
      
      // Set illustration
      const illustrationIndex = prevParagraph % illustrations.length;
      setCurrentIllustration(illustrations[illustrationIndex]);
      
      // Auto-generate custom illustration for the previous page if needed
      if (story[prevParagraph]) {
        generateCustomIllustration(prevParagraph, story[prevParagraph]);
      }
    }
  };

  const handleAddPages = async () => {
    try {
      // Add 5 pages each time
      const extension = InclusiveStoryGenerator.generateCulturallyAdaptedStory(userInfo, currentDifficulty, true, 5);
      setStory(prev => [...prev, ...extension]);
      setShowAddPagesAlert(false); // Hide current alert but don't reset the flag
      
      toast({
        title: "Story Extended! 📖",
        description: `Added 5 more pages to your adventure.`,
      });
    } catch (error) {
      console.error('Error extending story:', error);
      toast({
        title: "Extension Error",
        description: "Unable to add more pages. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddTime = () => {
    // Add 10 minutes (600 seconds), not 10 seconds
    setTimeRemaining(prev => prev + 600);
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
    // Update final reading stats
    const finalStats = {
      ...readingStats,
      pagesRead: currentParagraph + 1,
      timeSpent: Math.floor((Date.now() - readingStats.startTime) / 1000),
      totalPages: totalPages,
      currentDifficulty
    };
    
    // Navigate to session ended with stats
    onSessionEnded(finalStats);
  };

  const playTextToSpeech = async (text: string) => {
    if (isPlaying) return;
    
    try {
      setIsPlaying(true);
      const audioUrl = await openAIService.synthesizeText(text, userInfo.nativeLanguage || 'en', 1.0);
      
      if (audioUrl) {
        const audio = new HTMLAudioElement();
        audio.src = audioUrl;
        currentAudioRef.current = audio;
        
        audio.onended = () => {
          setIsPlaying(false);
          currentAudioRef.current = null;
        };
        
        audio.onerror = () => {
          setIsPlaying(false);
          currentAudioRef.current = null;
        };
        
        await audio.play();
      }
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
    console.log('=== generateCustomIllustration called ===');
    console.log('pageIndex:', pageIndex, 'storyText length:', storyText?.length);
    console.log('isGeneratingImage:', isGeneratingImage);
    console.log('customIllustrations.has(pageIndex):', customIllustrations.has(pageIndex));
    
    if (isGeneratingImage || customIllustrations.has(pageIndex)) {
      console.log('Exiting early - already generating or exists');
      return;
    }
    
    try {
      setIsGeneratingImage(true);
      
      // Add 1-2 second delay as requested
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create culturally competent prompt
      const prompt = createChildFriendlyPrompt(storyText, userInfo, pageIndex);
      
      console.log('Generating image with prompt:', prompt);
      console.log('Using Runware service:', runwareService);
      
      console.log('Generating image with prompt:', prompt);
      console.log('Using Runware service:', runwareService);
      
      // Use a simpler approach that bypasses some security layers
      const result = await runwareService.generateImage({
        positivePrompt: prompt,
        model: "runware:100@1",
        width: 768,
        height: 768,
        numberResults: 1,
        outputFormat: "WEBP",
        CFGScale: 7,
        scheduler: "FlowMatchEulerDiscreteScheduler"
      });
      
      console.log('Image generation result:', result);
      
      if (result?.imageURL) {
        setCustomIllustrations(prev => new Map(prev.set(pageIndex, result.imageURL)));
        
        if (pageIndex === currentParagraph) {
          setCurrentIllustration(result.imageURL);
        }
        
      } else {
        console.error('No image URL in result:', result);
        throw new Error('No image URL received from service');
      }
    } catch (error) {
      console.error('Error generating illustration:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        runwareService: runwareService
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Simple Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={time2ReadLogo} alt="Time2Read" className="w-10 h-10 rounded-lg" />
              <h1 className="text-xl font-bold text-purple-800">
                {userInfo.name}'s Reading Time
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                onClick={handleFinishSession} 
                className="bg-green-500 hover:bg-green-600 text-white rounded-full"
                size="sm"
              >
                ✨ I'm Done!
              </Button>
              <Button onClick={onNewStory} variant="outline" size="sm" className="rounded-full">
                <RotateCcw className="w-4 h-4 mr-1" />
                New Story
              </Button>
              <Button onClick={onHome} variant="outline" size="sm" className="rounded-full">
                <Home className="w-4 h-4 mr-1" />
                Home
              </Button>
            </div>
          </div>
        </div>
      </header>


      {/* Main Content Container - Increased reading area */}
      <div className="flex-1 max-w-6xl mx-auto px-4 py-6 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Story Content - Larger area */}
          <div className="order-2 lg:order-1">
            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl border-2 border-purple-200/50 overflow-hidden min-h-[600px]">
              <CardContent className="p-8">
                {/* Story Text */}
                <div className="prose prose-lg max-w-none">
                  <div className="text-2xl leading-relaxed text-gray-800 font-medium space-y-4">
                    {processTextForPhonetics(currentStory, "", currentDifficulty, userInfo)}
                  </div>
                </div>
                
                {/* Controls */}
                <div className="space-y-4 mt-8">
                  {/* Audio & Recording */}
                  <div className="flex justify-center space-x-3" data-tutorial-target="audio">
                    <Button
                      onClick={() => isPlaying ? stopTextToSpeech() : playTextToSpeech(currentStory)}
                      variant="outline"
                      size="sm"
                      className="rounded-full bg-blue-50 border-blue-200 hover:bg-blue-100"
                    >
                      {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>

                    <Button
                      onClick={() => isRecording ? stopRecording() : startRecording()}
                      variant={isRecording ? "destructive" : "outline"}
                      size="sm"
                      className="rounded-full"
                    >
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
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
                      Easier
                    </Button>
                    
                    <Button
                      onClick={handleMakeHarder}
                      disabled={currentDifficulty === "expert"}
                      size="sm"
                      variant="outline"
                      className="rounded-full text-xs"
                    >
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Harder
                    </Button>
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
                      ← Back
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
                      Next →
                    </Button>
                  </div>

                  {/* Page Management Section */}
                  <div className="mt-4 pt-3 border-t border-gray-100" data-tutorial-target="pages">
                    <div className="flex items-center justify-center space-x-3">
                      <span className="text-sm text-gray-600 font-medium">Story Length:</span>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={handleReducePages}
                          variant="outline"
                          size="sm"
                          className="rounded-full text-xs px-3 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                          disabled={story.length <= 1}
                        >
                          <div className="relative">
                            <BookOpen className="w-4 h-4 mr-1" />
                            <Minus className="w-1.5 h-1.5 absolute -top-0.5 -right-0.5 bg-white rounded-full" />
                          </div>
                          Remove Pages
                        </Button>
                        
                        <span className="text-sm font-bold text-purple-600 px-2">
                          {totalPages} page{totalPages !== 1 ? 's' : ''}
                        </span>
                        
                        <div className="relative">
                          <Button
                            onClick={handleAddPages}
                            variant="outline"
                            size="sm"
                            className={`rounded-full text-xs px-3 hover:bg-green-50 hover:border-green-200 hover:text-green-600 transition-all duration-300 ${
                              showAddPagesAlert 
                                ? 'animate-bounce bg-yellow-200 border-yellow-400 text-yellow-800 shadow-lg scale-110 animate-pulse' 
                                : ''
                            }`}
                          >
                            <div className="relative">
                              <BookOpen className="w-4 h-4 mr-1" />
                              <Plus className="w-1.5 h-1.5 absolute -top-0.5 -right-0.5 bg-white rounded-full" />
                            </div>
                            Add Pages
                            {showAddPagesAlert && " ⚡"}
                          </Button>
                          
                          {/* Animated Alert Bubble */}
                          {showAddPagesAlert && (
                            <div className="absolute -top-16 -left-8 z-50 animate-bounce">
                              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-2xl shadow-xl border-2 border-yellow-300 relative animate-pulse">
                                <div className="flex items-center space-x-2">
                                  <span className="text-lg">📖</span>
                                  <div>
                                    <div className="text-sm font-bold">Almost done!</div>
                                    <div className="text-xs">Click + to add more pages!</div>
                                  </div>
                                </div>
                                {/* Arrow pointing down */}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-yellow-400"></div>
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

          {/* Illustration - Constrained to reading area */}
          <div className="order-1 lg:order-2">
            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl border-2 border-purple-200/50 overflow-hidden max-h-[600px]">
              <CardContent className="p-6">
                <div className="relative w-full h-[500px] bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl overflow-hidden flex items-center justify-center">
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

                  {/* Chapter Badge */}
                  <div className="absolute bottom-4 left-4">
                    <div className="bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-bold text-purple-800">Chapter {currentParagraph + 1}</span>
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
              Time's Up!
            </h2>
            <p className="text-gray-600 mb-4">
              Going to your reading report in...
            </p>
            <div className="text-4xl font-bold text-purple-600 mb-4">
              {countdownSeconds}
            </div>
            <Button 
              onClick={handleFinishSession}
              className="bg-purple-500 hover:bg-purple-600 text-white rounded-full px-6"
            >
              Go Now ✨
            </Button>
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
                    Tutorial {tutorialStep + 1}/5
                  </div>
                  <div className="text-sm">
                    {showTutorial && tutorialStep < 5 ? [
                      "Welcome! Timer auto-started at 10:10. Green + adds time, orange - removes time.",
                      "Speaker button reads aloud, microphone records you reading.",
                      "Easier/Harder buttons adjust story difficulty as you read.",
                      "Add/Remove Pages buttons change your story length.",
                      "Happy reading! Enjoy your personalized adventure!"
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
    </div>
  );
};

export default StoryDisplay;