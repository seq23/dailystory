import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Home, RotateCcw, Volume2, VolumeX, TrendingUp, TrendingDown, Plus, Star, Heart, Sparkles, Wand2, Play, Pause, Timer, Clock, Award, Target, Mic, MicOff } from "lucide-react";
import type { UserInfo } from "./UserInfoForm";
import ancientBookBg from "@/assets/ancient-book-bg.jpg";
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
import { SecureRunwareService, secureImageCache, cacheImage, getCachedImage } from "@/services/secureRunwareService";
import { SecurityValidator } from "@/utils/securityValidation";
import { SecurityMonitor } from "@/utils/monitoring";
import { createChildFriendlyPrompt } from "@/services/runwareService";
import { createOpenAITTSService } from "@/services/textToSpeechService";
import InclusiveStoryGenerator from "@/services/inclusiveStoryGenerator";
import CulturalAdaptationService from "@/services/culturalAdaptationService";
import { useToast } from "@/hooks/use-toast";

type DifficultyLevel = "easy" | "medium" | "hard" | "expert";

interface StoryDisplayProps {
  userInfo: UserInfo;
  onHome: () => void;
  onNewStory: () => void;
  onSessionEnded: () => void;
}

interface ReadingStats {
  wordsRead: number;
  timeSpent: number;
  accuracy: number;
  streak: number;
}

const StoryDisplay = ({ userInfo, onHome, onNewStory, onSessionEnded }: StoryDisplayProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  // Core state
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(10 * 60);
  const [maxReadingTime, setMaxReadingTime] = useState(10 * 60);
  const [storyExtensions, setStoryExtensions] = useState(0);
  const [story, setStory] = useState<string[]>([]);
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevel>(
    userInfo.difficultyLevel || (userInfo.age <= 6 ? "easy" : userInfo.age <= 9 ? "medium" : userInfo.age <= 12 ? "hard" : "expert")
  );
  
  // UI state
  const [showTutorialBubble, setShowTutorialBubble] = useState(true);
  const [showAddPagesAlert, setShowAddPagesAlert] = useState(false);
  const [hasShownAddPagesAlert, setHasShownAddPagesAlert] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Image generation
  const [currentIllustration, setCurrentIllustration] = useState<string>("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [customIllustrations, setCustomIllustrations] = useState<Map<number, string>>(new Map());
  const [illustrationGenerationQueue, setIllustrationGenerationQueue] = useState<number[]>([]);
  
  // Audio/TTS
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoReadMode, setAutoReadMode] = useState(false);
  const [readingSpeed, setReadingSpeed] = useState(1.0);
  const [isRecording, setIsRecording] = useState(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  // Services
  const [runwareService] = useState<SecureRunwareService>(() => new SecureRunwareService("LRRGqlrg67zH8uss6lMjVvc54pVOrznM"));
  const [openAIService] = useState<any>(() => createOpenAITTSService());
  
  // Reading stats
  const [readingStats, setReadingStats] = useState<ReadingStats>({
    wordsRead: 0,
    timeSpent: 0,
    accuracy: 100,
    streak: 0
  });
  const sessionStartTime = useRef<number>(Date.now());

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

  // Auto-dismiss tutorial bubble
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTutorialBubble(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  // Generate initial story
  useEffect(() => {
    const generateStory = async () => {
      try {
        const generator = new InclusiveStoryGenerator();
        const generatedStory = InclusiveStoryGenerator.generateCulturallyAdaptedStory(userInfo, currentDifficulty);
        setStory(generatedStory);
        
        // Set illustration
        const illustrationIndex = Math.floor(Math.random() * illustrations.length);
        setCurrentIllustration(illustrations[illustrationIndex]);
        
        // Update reading stats
        const wordCount = generatedStory.join(' ').split(' ').length;
        setReadingStats(prev => ({ ...prev, wordsRead: wordCount }));
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

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isReading && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          if (newTime === 0) {
            setIsReading(false);
            setShowCelebration(true);
            handleSessionEnd();
          }
          return newTime;
        });
        
        setReadingStats(prev => ({ ...prev, timeSpent: prev.timeSpent + 1 }));
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isReading, timeRemaining]);

  // Add pages alert logic
  useEffect(() => {
    const isNextToLastPage = currentParagraph === story.length - 2;
    const hasTimeRemaining = timeRemaining > 60;
    
    if (isNextToLastPage && hasTimeRemaining && !hasShownAddPagesAlert) {
      setShowAddPagesAlert(true);
      setHasShownAddPagesAlert(true);
      
      setTimeout(() => {
        setShowAddPagesAlert(false);
      }, 5000);
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
      setReadingStats(prev => ({ ...prev, streak: prev.streak + 1 }));
      
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
      const generator = new InclusiveStoryGenerator();
      const extension = InclusiveStoryGenerator.generateCulturallyAdaptedStory(userInfo, currentDifficulty, true, storyExtensions + 1);
      setStory(prev => [...prev, ...extension]);
      setStoryExtensions(prev => prev + 1);
      setShowAddPagesAlert(false);
      setHasShownAddPagesAlert(false);
      
      toast({
        title: "Story Extended!",
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

  const handleTimeChange = (value: string) => {
    const minutes = parseInt(value);
    const seconds = minutes * 60;
    setMaxReadingTime(seconds);
    setTimeRemaining(seconds);
  };

  const handleSessionEnd = () => {
    setShowCelebration(true);
    
    setTimeout(() => {
      onSessionEnded();
    }, 5000);
  };

  const playTextToSpeech = async (text: string) => {
    if (isPlaying) return;
    
    try {
      setIsPlaying(true);
      const audioUrl = await openAIService.synthesizeText(text, userInfo.nativeLanguage || 'en', readingSpeed);
      
      if (audioUrl) {
        const audio = new HTMLAudioElement();
        audio.src = audioUrl;
        currentAudioRef.current = audio;
        
        audio.onended = () => {
          setIsPlaying(false);
          currentAudioRef.current = null;
          if (autoReadMode && currentParagraph < totalPages - 1) {
            setTimeout(() => handleNext(), 2000);
          }
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
      setIllustrationGenerationQueue(prev => [...prev, pageIndex]);
      
      const prompt = createChildFriendlyPrompt(storyText, userInfo);
      const result = await runwareService.generateImage({
        positivePrompt: prompt,
        width: 512,
        height: 512,
        numberResults: 1
      });
      
      if (result?.imageURL) {
        await cacheImage(result.imageURL, `story-${pageIndex}`);
        setCustomIllustrations(prev => new Map(prev.set(pageIndex, result.imageURL)));
        
        if (pageIndex === currentParagraph) {
          setCurrentIllustration(result.imageURL);
        }
      }
    } catch (error) {
      console.error('Error generating illustration:', error);
      toast({
        title: "Illustration Error",
        description: "Unable to generate custom illustration.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingImage(false);
      setIllustrationGenerationQueue(prev => prev.filter(id => id !== pageIndex));
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.start();
      setIsRecording(true);
      
      mediaRecorder.ondataavailable = (event) => {
        // Handle recorded audio data
        console.log('Recording data available:', event.data);
      };
      
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
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
        {/* Enhanced Magical Background Elements */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-pink-200/30 to-purple-200/30 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-1/3 right-20 w-24 h-24 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-lg animate-float"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-br from-green-200/20 to-teal-200/20 rounded-full blur-2xl animate-bounce-gentle"></div>
          
          {/* Floating Icons */}
          <Star className="absolute top-20 left-20 text-yellow-400 w-6 h-6 animate-float opacity-70" />
          <Heart className="absolute top-40 right-32 text-pink-400 w-5 h-5 animate-bounce-gentle opacity-60" />
          <Sparkles className="absolute bottom-40 left-16 text-purple-400 w-7 h-7 animate-wiggle opacity-80" />
          <Star className="absolute bottom-20 right-40 text-indigo-400 w-4 h-4 animate-float opacity-75" />
        </div>

        {/* Modern Header */}
        <header className="relative z-20 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img src={time2ReadLogo} alt="Time2Read" className="w-12 h-12 rounded-xl shadow-lg transition-transform hover:scale-105" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 font-comic">
                    {userInfo.name}'s Reading Journey
                  </h1>
                  <p className="text-sm text-gray-600">
                    {currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)} Level • {formatTime(readingStats.timeSpent)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  onClick={onNewStory}
                  variant="outline"
                  className="bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 rounded-xl shadow-sm"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  New Story
                </Button>
                
                <Button
                  onClick={onHome}
                  variant="outline"
                  className="bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 rounded-xl shadow-sm"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Timer and Controls Section */}
          <div className="mb-8">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                {/* Timer Display */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <div className="text-center">
                        <div className="text-xl font-bold text-white">
                          {formatTime(timeRemaining)}
                        </div>
                        <div className="text-xs text-indigo-100">
                          Reading Time
                        </div>
                      </div>
                    </div>
                    <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center ${
                      isReading ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                    }`}>
                      {isReading ? <Play className="w-3 h-3 text-white" /> : <Pause className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                  
                  {/* Timer Controls */}
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => setIsReading(!isReading)}
                        variant={isReading ? "default" : "outline"}
                        className="rounded-xl"
                      >
                        {isReading ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                        {isReading ? "Pause" : "Start"} Timer
                      </Button>
                      
                      <Button
                        onClick={() => setTimeRemaining(prev => Math.min(prev + 600, 3600))}
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        +10 min
                      </Button>
                    </div>
                    
                    {/* Time Setting */}
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Max time:</span>
                      <Select value={maxReadingTime.toString()} onValueChange={handleTimeChange}>
                        <SelectTrigger className="w-24 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="600">10 min</SelectItem>
                          <SelectItem value="1200">20 min</SelectItem>
                          <SelectItem value="1800">30 min</SelectItem>
                          <SelectItem value="2400">40 min</SelectItem>
                          <SelectItem value="3000">50 min</SelectItem>
                          <SelectItem value="3600">60 min</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                {/* Progress and Add Pages */}
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-800 mb-1">
                      Page {currentParagraph + 1} of {totalPages}
                    </div>
                    <Progress 
                      value={(currentParagraph / Math.max(1, totalPages - 1)) * 100} 
                      className="h-2 w-40"
                    />
                  </div>
                  
                  <Button
                    onClick={handleAddPages}
                    variant="outline"
                    className={`rounded-xl ${showAddPagesAlert ? 'animate-pulse bg-green-50 border-green-300 text-green-700' : ''}`}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Add More Pages
                    {showAddPagesAlert && <span className="ml-2 text-xs">⚡</span>}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Story Content */}
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Illustration & Stats Sidebar - LEFT COLUMN */}
            <div className="lg:col-span-2 space-y-6">
              {/* Illustration */}
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
                <div className="relative">
                  <img 
                    src={customIllustrations.get(currentParagraph) || currentIllustration}
                    alt="Story illustration"
                    className="w-full h-80 lg:h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  
                  <div className="absolute top-4 right-4">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => generateCustomIllustration(currentParagraph, currentStory)}
                          disabled={isGeneratingImage || customIllustrations.has(currentParagraph)}
                          size="sm"
                          className="bg-white/90 hover:bg-white text-gray-700 rounded-xl shadow-lg"
                        >
                          {isGeneratingImage && illustrationGenerationQueue.includes(currentParagraph) ? (
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Wand2 className="w-4 h-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Generate custom illustration</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Chapter indicator overlay */}
                  <div className="absolute bottom-4 left-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm font-bold text-indigo-800">Chapter {currentParagraph + 1}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Reading Stats */}
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-yellow-500" />
                  Reading Progress
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-700">Words Read</span>
                    <span className="text-lg font-bold text-indigo-600">{readingStats.wordsRead}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-700">Time Reading</span>
                    <span className="text-lg font-bold text-emerald-600">{formatTime(readingStats.timeSpent)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-700">Streak</span>
                    <span className="text-lg font-bold text-purple-600">{readingStats.streak} pages</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-700">Accuracy</span>
                    <span className="text-lg font-bold text-orange-600">{readingStats.accuracy}%</span>
                  </div>
                </div>

                {/* Reading Speed Control */}
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700">Reading Speed</span>
                    <span className="text-sm text-gray-600">{readingSpeed}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={readingSpeed}
                    onChange={(e) => setReadingSpeed(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </Card>
            </div>

            {/* Story Text - RIGHT COLUMN */}
            <div className="lg:col-span-3">
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden">
                {/* Story Header */}
                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl overflow-hidden shadow-lg border-4 border-white/30">
                          <img 
                            src={getUserAvatar()} 
                            alt={`${userInfo.name}'s avatar`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-6 h-6 lg:w-8 lg:h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                          <Star className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xl lg:text-2xl font-bold mb-1">
                          {userInfo.name}'s Adventure
                        </h2>
                        <p className="text-indigo-100 text-sm lg:text-base">
                          Chapter {currentParagraph + 1}: The Journey Continues
                        </p>
                        {userInfo.hobbies && (
                          <p className="text-xs lg:text-sm text-indigo-200 mt-1">
                            Featuring: {userInfo.hobbies}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Difficulty Level Controls */}
                    <div className="flex flex-col items-end space-y-2">
                      <div className="text-xs lg:text-sm text-indigo-100 font-medium text-right">
                        Reading Level: {
                          currentDifficulty === "easy" ? "Pre-K - 1st Grade" :
                          currentDifficulty === "medium" ? "2nd - 3rd Grade" :
                          currentDifficulty === "hard" ? "4th - 5th Grade" :
                          "6th Grade+"
                        }
                      </div>
                      <div className="flex space-x-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={handleMakeEasier}
                              disabled={currentDifficulty === "easy"}
                              size="sm"
                              className="bg-white/20 hover:bg-white/30 text-white border-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-2 py-1 text-xs lg:px-3 lg:text-sm"
                            >
                              <TrendingDown className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                              Easier
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Make the story easier to read</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={handleMakeHarder}
                              disabled={currentDifficulty === "expert"}
                              size="sm"
                              className="bg-white/20 hover:bg-white/30 text-white border-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-2 py-1 text-xs lg:px-3 lg:text-sm"
                            >
                              <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                              Harder
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Make the story more challenging</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Story Content */}
                <div className="p-6 lg:p-8">
                  <div className="bg-gradient-to-br from-gray-50 to-indigo-50/30 rounded-2xl p-6 lg:p-8 border border-gray-100 min-h-[400px] flex items-center justify-center">
                    <div className="prose prose-lg max-w-none text-center w-full">
                      <p className={`leading-relaxed font-medium text-gray-800 ${
                        currentDifficulty === "easy" ? 'text-xl lg:text-2xl xl:text-3xl font-bold' :
                        userInfo.age <= 7 ? 'text-lg lg:text-xl xl:text-2xl' : 
                        userInfo.age <= 9 ? 'text-base lg:text-lg xl:text-xl' : 
                        'text-sm lg:text-base xl:text-lg'
                      }`}>
                        {processTextForPhonetics(currentStory, "", currentDifficulty, userInfo)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Audio Controls */}
                  <div className="flex justify-center space-x-4 mt-6">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => isPlaying ? stopTextToSpeech() : playTextToSpeech(currentStory)}
                          variant="outline"
                          size="sm"
                          className="rounded-xl bg-indigo-50 hover:bg-indigo-100 border-indigo-200"
                        >
                          {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                          <span className="ml-2 hidden sm:inline">
                            {isPlaying ? "Stop" : "Listen"}
                          </span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isPlaying ? "Stop reading aloud" : "Read this page aloud"}</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => isRecording ? stopRecording() : startRecording()}
                          variant={isRecording ? "destructive" : "outline"}
                          size="sm"
                          className="rounded-xl"
                        >
                          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                          <span className="ml-2 hidden sm:inline">
                            {isRecording ? "Stop" : "Practice"}
                          </span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isRecording ? "Stop reading practice" : "Practice reading aloud"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* Navigation */}
                <div className="bg-gray-50/80 p-6 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <Button
                      onClick={handlePrevious}
                      disabled={currentParagraph === 0}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 disabled:bg-gray-100 disabled:text-gray-400 rounded-xl px-4 lg:px-6 py-2 lg:py-3 font-medium text-sm lg:text-base"
                    >
                      ← Previous
                    </Button>
                    
                    <div className="flex space-x-2">
                      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full transition-all duration-300 ${
                            i === currentParagraph % 7 
                              ? 'bg-indigo-500 scale-125 shadow-lg' 
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    
                    <Button
                      onClick={handleNext}
                      disabled={currentParagraph >= totalPages - 1}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white disabled:bg-gray-100 disabled:text-gray-400 rounded-xl px-4 lg:px-6 py-2 lg:py-3 font-medium text-sm lg:text-base"
                    >
                      Next →
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>

        {/* Celebration Overlay */}
        {showCelebration && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-3xl p-8 text-center max-w-md mx-4 shadow-2xl">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Congratulations!
              </h2>
              <p className="text-gray-600 mb-6">
                You've completed your reading session!
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>📚 Words read: {readingStats.wordsRead}</p>
                <p>⏰ Time spent: {formatTime(readingStats.timeSpent)}</p>
                <p>🔥 Pages read: {readingStats.streak}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

console.log("StoryDisplay component loaded");
export default StoryDisplay;