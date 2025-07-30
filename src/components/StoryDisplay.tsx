import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BookOpen, Home, RotateCcw, Volume2, VolumeX, TrendingUp, TrendingDown, Plus, Minus, Star, Heart, Sparkles, Wand2, Play, Pause, Timer, Mic, MicOff } from "lucide-react";
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
  onSessionEnded: () => void;
}

const StoryDisplay = ({ userInfo, onHome, onNewStory, onSessionEnded }: StoryDisplayProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  // Core state
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(10 * 60); // 10 minutes in seconds
  const [story, setStory] = useState<string[]>([]);
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevel>(
    userInfo.difficultyLevel || (userInfo.age <= 6 ? "easy" : userInfo.age <= 9 ? "medium" : userInfo.age <= 12 ? "hard" : "expert")
  );
  
  // UI state
  const [showAddPagesAlert, setShowAddPagesAlert] = useState(false);
  const [hasShownAddPagesAlert, setHasShownAddPagesAlert] = useState(false);
  const [showFinishCountdown, setShowFinishCountdown] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(5);
  
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
        const generatedStory = InclusiveStoryGenerator.generateCulturallyAdaptedStory(userInfo, currentDifficulty);
        setStory(generatedStory);
        
        // Calculate word count for stats
        const wordCount = generatedStory.join(' ').split(' ').filter(word => word.length > 0).length;
        setReadingStats(prev => ({ 
          ...prev, 
          wordsRead: wordCount,
          startTime: Date.now() 
        }));
        
        // Set illustration
        const illustrationIndex = Math.floor(Math.random() * illustrations.length);
        setCurrentIllustration(illustrations[illustrationIndex]);
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
      setCurrentParagraph(prev => prev + 1);
      
      // Set new illustration
      const illustrationIndex = (currentParagraph + 1) % illustrations.length;
      setCurrentIllustration(illustrations[illustrationIndex]);
    }
  };

  const handlePrevious = () => {
    if (currentParagraph > 0) {
      setCurrentParagraph(prev => prev - 1);
      
      // Set illustration
      const illustrationIndex = (currentParagraph - 1) % illustrations.length;
      setCurrentIllustration(illustrations[illustrationIndex]);
    }
  };

  const handleAddPages = async () => {
    try {
      const extension = InclusiveStoryGenerator.generateCulturallyAdaptedStory(userInfo, currentDifficulty, true, 1);
      setStory(prev => [...prev, ...extension]);
      setShowAddPagesAlert(false); // Hide current alert but don't reset the flag
      
      toast({
        title: "Story Extended! 📖",
        description: `Added ${extension.length} more pages to your adventure.`,
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
      // Remove the last page, but don't go below 1 page
      setStory(prev => prev.slice(0, -1));
      
      // If current page is now out of bounds, go to the last page
      if (currentParagraph >= story.length - 1) {
        setCurrentParagraph(story.length - 2);
      }
      
      toast({
        title: "Page Removed! 📖",
        description: "Removed the last page from your story.",
      });
    }
  };

  const handleFinishSession = () => {
    // Update final reading stats
    setReadingStats(prev => ({
      ...prev,
      pagesRead: currentParagraph + 1,
      timeSpent: Math.floor((Date.now() - prev.startTime) / 1000)
    }));
    
    // Navigate to session ended with stats
    onSessionEnded();
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
    if (isGeneratingImage || customIllustrations.has(pageIndex)) return;
    
    try {
      setIsGeneratingImage(true);
      
      // Add 1-2 second delay as requested
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create culturally competent prompt
      const prompt = createChildFriendlyPrompt(storyText, userInfo, pageIndex);
      
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
        
        toast({
          title: "Custom Illustration Generated! 🎨",
          description: "A unique image was created for this page.",
        });
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
      toast({
        title: "Illustration Error",
        description: "Unable to generate custom illustration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingImage(false);
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-700">
              Page {currentParagraph + 1} of {totalPages}
            </span>
            <span className="text-sm text-purple-600">
              {currentDifficulty === "easy" ? "Pre-K - 1st Grade" :
               currentDifficulty === "medium" ? "2nd - 3rd Grade" :
               currentDifficulty === "hard" ? "4th - 5th Grade" :
               "6th Grade+"}
            </span>
          </div>
          <Progress 
            value={(currentParagraph / Math.max(1, totalPages - 1)) * 100} 
            className="h-3 bg-purple-100"
          />
        </div>

        {/* Story Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Large Image Section - LEFT */}
          <div className="lg:col-span-2">
            <Card className="bg-white/95 shadow-xl rounded-3xl overflow-hidden border-0">
              <div className="relative">
                <img 
                  src={customIllustrations.get(currentParagraph) || currentIllustration}
                  alt="Story illustration"
                  className="w-full h-96 lg:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                
                {/* Generate Image Button */}
                <div className="absolute top-4 right-4">
                  <Button
                    onClick={() => generateCustomIllustration(currentParagraph, currentStory)}
                    disabled={isGeneratingImage || customIllustrations.has(currentParagraph)}
                    size="sm"
                    className="bg-white/90 hover:bg-white text-gray-700 rounded-xl shadow-lg"
                  >
                    {isGeneratingImage ? (
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Wand2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>

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
            </Card>
          </div>

          {/* Story Text - RIGHT */}
          <div className="lg:col-span-1">
            <Card className="bg-white/95 shadow-xl rounded-3xl overflow-hidden border-0 h-full">
              {/* Story Header */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg border-2 border-white/30">
                    <img 
                      src={getUserAvatar()} 
                      alt={`${userInfo.name}'s avatar`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">
                      {userInfo.name}'s Adventure
                    </h2>
                    <p className="text-purple-100 text-sm">
                      Let's read together!
                    </p>
                  </div>
                </div>
              </div>

              {/* Story Content */}
              <div className="p-6 flex-1 flex flex-col justify-between min-h-[400px]">
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <p className={`leading-relaxed font-medium text-gray-800 ${
                      currentDifficulty === "easy" ? 'text-xl font-bold' :
                      currentDifficulty === "medium" ? 'text-lg' :
                      'text-base'
                    }`}>
                      {processTextForPhonetics(currentStory, "", currentDifficulty, userInfo)}
                    </p>
                  </div>
                </div>
                
                {/* Controls */}
                <div className="space-y-4 mt-6">
                  {/* Audio & Recording */}
                  <div className="flex justify-center space-x-3">
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
                  <div className="flex justify-center space-x-2">
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
                      
                      {/* Page Controls */}
                      <div className="flex space-x-1 relative">
                        <Button
                          onClick={handleReducePages}
                          variant="outline"
                          size="sm"
                          className="rounded-full text-xs px-2"
                          disabled={story.length <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        
                        <div className="relative">
                          <Button
                            onClick={handleAddPages}
                            variant="outline"
                            size="sm"
                            className={`rounded-full text-xs px-2 transition-all duration-300 ${
                              showAddPagesAlert 
                                ? 'animate-bounce bg-yellow-200 border-yellow-400 text-yellow-800 shadow-lg scale-110 animate-pulse' 
                                : ''
                            }`}
                            style={{
                              animation: showAddPagesAlert 
                                ? 'jump 0.6s ease-in-out infinite alternate, flash 0.8s ease-in-out infinite' 
                                : undefined
                            }}
                          >
                            <Plus className="w-3 h-3" />
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
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Floating Timer */}
      <div className="fixed bottom-6 left-6 z-50">
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl p-4 border-0">
          <div className="flex items-center space-x-3">
            {/* Timer Display */}
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <div className="text-center">
                  <div className="text-sm font-bold text-white">
                    {formatTime(timeRemaining)}
                  </div>
                </div>
              </div>
              <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${
                isReading ? 'bg-green-400 animate-pulse' : 'bg-red-400'
              }`} />
            </div>
            
            {/* Controls */}
            <div className="flex flex-col space-y-1">
              <Button
                onClick={() => setIsReading(!isReading)}
                size="sm"
                className={`rounded-full text-xs px-3 ${
                  isReading ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {isReading ? <Pause className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
                {isReading ? "Pause" : "Start"}
              </Button>
              
              {/* Time Controls */}
              <div className="flex space-x-1">
                <Button
                  onClick={handleReduceTime}
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs px-2"
                  disabled={timeRemaining <= 60}
                >
                  <Minus className="w-3 h-3" />
                  -10m
                </Button>
                
                <Button
                  onClick={handleAddTime}
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs px-2"
                >
                  <Plus className="w-3 h-3" />
                  +10m
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Floating Reading Stats - LEFT SIDE */}
      <div className="fixed top-32 left-4 z-40">
        <Card className="bg-white/95 backdrop-blur-sm shadow-xl rounded-xl p-4 text-sm border-0">
          <h4 className="font-bold text-purple-800 mb-3 flex items-center">
            📊 Reading Progress
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Words:</span>
              <span className="font-bold text-purple-700">{readingStats.wordsRead}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Time:</span>
              <span className="font-bold text-green-700">{formatTime(readingStats.timeSpent)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pages:</span>
              <span className="font-bold text-blue-700">{currentParagraph + 1}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Accuracy:</span>
              <span className="font-bold text-orange-700">{readingStats.accuracy}%</span>
            </div>
          </div>
        </Card>
      </div>

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
    </div>
  );
};

export default StoryDisplay;