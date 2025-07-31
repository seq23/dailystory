import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { BookOpen, Home, RotateCcw, Volume2, VolumeX, TrendingUp, TrendingDown, Plus, Minus, Star, Heart, Sparkles, Wand2, Play, Pause, Timer, Mic, MicOff, BarChart3, Target } from "lucide-react";
import { FloatingTimer } from "./FloatingTimer";
import type { UserInfo, DifficultyLevel, SessionStats } from "@/types";
import ProgressDashboard from "@/components/ProgressDashboard";
import LearningPathDashboard from "@/components/LearningPathDashboard";
import AdaptiveUI from "@/components/AdaptiveUI";
import { InteractiveAudioReading } from "@/components/InteractiveAudioReading";
import { ReadingRewardsSystem } from "@/components/ReadingRewardsSystem";
import { VocabularyCollector } from "@/components/VocabularyCollector";
import { ComprehensionQuiz } from "@/components/ComprehensionQuiz";
import { MiniGames } from "@/components/MiniGames";
import { StoryGeneratorService } from "@/services/storyGenerator";
import { SecureRunwareService } from "@/services/secureRunwareService";
import { ProgressTrackingService } from "@/services/progressTrackingService";
import { createOpenAITTSService } from "@/services/textToSpeechService";
import { PersonalizedLearningService } from "@/services/personalizedLearningService";
import { processTextForPhonetics } from "@/utils/textProcessor";
import { APP_CONFIG } from "@/constants/app";
import { useToast } from "@/hooks/use-toast";

// Import all illustrations
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

// Import avatar images
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

interface StoryDisplayProps {
  userInfo: UserInfo;
  onNewStory: () => void;
  onHome: () => void;
  onSessionEnded: (stats: SessionStats) => void;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({
  userInfo,
  onNewStory,
  onHome,
  onSessionEnded,
}) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();

  // Story state
  const [story, setStory] = useState<string[]>([]);
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevel>(userInfo.readingAbility || 'easy');
  const [storyConfig, setStoryConfig] = useState<any>(null);
  
  // Reading session state
  const [isReading, setIsReading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(APP_CONFIG.FREE_SESSION_DURATION);
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());
  const [sessionWordsRead, setSessionWordsRead] = useState(0);
  const [showFinishCountdown, setShowFinishCountdown] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(5);
  const [showCongratulations, setShowCongratulations] = useState(false);
  
  // Progress tracking state
  const [readingProgress, setReadingProgress] = useState<any>(null);
  const [showProgressDashboard, setShowProgressDashboard] = useState(false);
  const [showLearningPath, setShowLearningPath] = useState(false);
  
  // Tutorial state
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [hasShownTutorial, setHasShownTutorial] = useState(false);
  const [showAddPagesAlert, setHasShownAddPagesAlert] = useState(false);
  
  // Image generation state
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [customIllustrations, setCustomIllustrations] = useState<Map<number, string>>(new Map());
  
  // Audio/TTS
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hasPlayedAudioForPage, setHasPlayedAudioForPage] = useState<Set<number>>(new Set());
  const [audioSpeed, setAudioSpeed] = useState(0.75);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  // Premium feature alert
  const [showPremiumAlert, setShowPremiumAlert] = useState(false);

  // Services - lazy initialization
  const runwareServiceRef = useRef<SecureRunwareService | null>(null);
  const ttsServiceRef = useRef<any>(null);

  // Initialize language from user preferences
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
        setCurrentParagraph(0);
        setIsReading(true);
        setTimeRemaining(APP_CONFIG.FREE_SESSION_DURATION);
        setHasShownAddPagesAlert(false);
        setCustomIllustrations(new Map());
        
        const newProgress = ProgressTrackingService.initializeProgress(userInfo);
        setReadingProgress(newProgress);
        
        if (!hasShownTutorial) {
          setShowTutorial(true);
          setTutorialStep(0);
          setHasShownTutorial(true);
        }
        
        const result = await StoryGeneratorService.generateStory(userInfo, currentDifficulty, 10);
        setStory(result.pages);
        setStoryConfig(result.config);
        
        const wordCount = result.pages.join(' ').split(' ').filter(word => word.length > 0).length;
        setSessionStartTime(new Date());
        setSessionWordsRead(wordCount);
        
      } catch (error) {
        console.error('Failed to generate story:', error);
        toast({
          title: "Story Generation Error",
          description: "Failed to create your story. Please try again.",
          variant: "destructive"
        });
      }
    };

    generateStory();
  }, [userInfo, currentDifficulty, hasShownTutorial, toast]);

  // Handle microphone click
  const handleMicrophoneClick = () => {
    setShowPremiumAlert(true);
  };

  // Get user avatar
  const getUserAvatar = () => {
    const avatarType = userInfo.avatar?.type || 'boy';
    const skinTone = userInfo.avatar?.skinTone || 'medium';
    
    const avatarMap = {
      'boy': {
        'pale': avatarBoyPale,
        'light': avatarBoyLight,
        'medium': avatarBoyMedium,
        'olive': avatarBoyOlive,
        'dark': avatarBoyDark,
      },
      'girl': {
        'pale': avatarGirlPale,
        'light': avatarGirlLight,
        'medium': avatarGirlMedium,
        'olive': avatarGirlOlive,
        'dark': avatarGirlDark,
      }
    };
    
    return avatarMap[avatarType]?.[skinTone] || avatarBoyMedium;
  };

  const currentStory = story[currentParagraph] || "Loading your magical story...";
  const totalPages = story.length;
  const currentIllustration = customIllustrations.get(currentParagraph) || illustrations[currentParagraph % illustrations.length];

  return (
    <AdaptiveUI userInfo={userInfo} className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-purple-200 shadow-sm">
                <img 
                  src={getUserAvatar()} 
                  alt={`${userInfo.name}'s avatar`}
                  className="w-full h-full object-cover"
                />
              </div>
              <img src={time2ReadLogo} alt="Time2Read" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg" />
              <h1 className="text-sm sm:text-lg md:text-xl font-bold text-purple-800 truncate">
                {userInfo.name}'s Reading Time
              </h1>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button onClick={onHome} variant="outline" size="sm" className="rounded-full">
                <Home className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-2 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-stretch h-full">
            {/* Illustration */}
            <div className="order-2 lg:order-1">
              <Card className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl sm:rounded-3xl border-2 border-purple-200/50 overflow-hidden h-[600px] sm:h-[700px] lg:h-[800px]">
                <CardContent className="p-3 sm:p-6 h-full">
                  <div className="relative w-full h-full bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl overflow-hidden flex items-center justify-center">
                    <img 
                      src={currentIllustration} 
                      alt={`Story illustration for page ${currentParagraph + 1}`}
                      className="w-full h-full object-cover rounded-xl sm:rounded-2xl"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Story Content */}
            <div className="order-1 lg:order-2">
              <Card className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl sm:rounded-3xl border-2 border-purple-200/50 overflow-visible min-h-[600px] sm:min-h-[700px] lg:min-h-[800px]">
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  {/* Story Text */}
                  <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
                    <div className="leading-relaxed text-gray-800 font-medium text-center space-y-3 sm:space-y-4 text-xl sm:text-2xl lg:text-3xl">
                      {processTextForPhonetics(currentStory, "", currentDifficulty, userInfo)}
                    </div>
                  </div>
                  
                  {/* Controls */}
                  <div className="space-y-3 sm:space-y-4 mt-4 sm:mt-6 lg:mt-8">
                    {/* Audio & Recording */}
                     <TooltipProvider>
                       {/* Audio Reading Controls */}
                       <InteractiveAudioReading 
                         text={currentStory}
                         userInfo={userInfo}
                         isEnabled={true}
                       />
                      <div className="flex justify-center space-x-2 sm:space-x-3">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full bg-blue-50 border-blue-200 hover:bg-blue-100 p-2 sm:p-3"
                            >
                              <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="bg-white border shadow-lg z-50">
                            <p className="text-sm">{t("storyDisplay.tooltips.audioButton")}</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={handleMicrophoneClick}
                              variant="outline"
                              size="sm"
                              className="rounded-full p-2 sm:p-3"
                            >
                              <Mic className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="bg-white border shadow-lg z-50">
                            <p className="text-sm">{t("storyDisplay.tooltips.microphoneButton")}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>

                    {/* Difficulty */}
                    <div className="flex justify-center space-x-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full text-xs"
                          >
                            <TrendingDown className="w-3 h-3 mr-1" />
                            Easier
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-white border shadow-lg z-50">
                          <p className="text-sm">{t("storyDisplay.tooltips.makeEasier")}</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full text-xs"
                          >
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Harder
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-white border shadow-lg z-50">
                          <p className="text-sm">{t("storyDisplay.tooltips.makeHarder")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    {/* Page Management */}
                    <div className="flex items-center justify-center space-x-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full text-xs"
                          >
                            <Minus className="w-3 h-3 mr-1" />
                            Remove
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-white border shadow-lg z-50">
                          <p className="text-sm">{t("storyDisplay.tooltips.removePages")}</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <span className="text-sm font-bold text-purple-600 px-2">
                        {totalPages} pages
                      </span>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full text-xs"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-white border shadow-lg z-50">
                          <p className="text-sm">{t("storyDisplay.tooltips.addPages")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        disabled={currentParagraph === 0}
                        onClick={() => setCurrentParagraph(Math.max(0, currentParagraph - 1))}
                      >
                        ← Previous
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        disabled={currentParagraph >= totalPages - 1}
                        onClick={() => setCurrentParagraph(Math.min(totalPages - 1, currentParagraph + 1))}
                      >
                        Next →
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Feature Alert */}
      <AlertDialog open={showPremiumAlert} onOpenChange={setShowPremiumAlert}>
        <AlertDialogContent className="bg-white border shadow-lg max-w-md mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2 text-purple-700">
              <Mic className="w-5 h-5" />
              <span>Premium Feature</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 space-y-2">
              <p>The recording feature allows you to:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Record yourself reading aloud</li>
                <li>Track pronunciation improvements</li>
                <li>Get personalized feedback</li>
                <li>Build reading confidence</li>
              </ul>
              <p className="text-purple-600 font-medium">This feature will be available with premium accounts when we add user profiles and payments.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => setShowPremiumAlert(false)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Got it!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdaptiveUI>
  );
};

export default StoryDisplay;