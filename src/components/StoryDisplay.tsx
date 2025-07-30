import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BookOpen, Home, RotateCcw, Volume2, VolumeX, TrendingUp, TrendingDown, Plus, Star, Heart, Sparkles, Wand2, Zap } from "lucide-react";
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
import { FloatingTimer } from "./FloatingTimer";
import { processTextForPhonetics } from "@/utils/textProcessor";
import { SecureRunwareService, secureImageCache, cacheImage, getCachedImage } from "@/services/secureRunwareService";
import { SecurityValidator } from "@/utils/securityValidation";
import { SecurityMonitor } from "@/utils/monitoring";
import { createChildFriendlyPrompt } from "@/services/runwareService";
import { createOpenAITTSService } from "@/services/textToSpeechService";
import InclusiveStoryGenerator from "@/services/inclusiveStoryGenerator";
import CulturalAdaptationService from "@/services/culturalAdaptationService";

type DifficultyLevel = "easy" | "medium" | "hard" | "expert";

interface StoryDisplayProps {
  userInfo: UserInfo;
  onHome: () => void;
  onNewStory: () => void;
  onSessionEnded: () => void;
}

const StoryDisplay = ({ userInfo, onHome, onNewStory, onSessionEnded }: StoryDisplayProps) => {
  const { t } = useTranslation();
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [isReading, setIsReading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(10 * 60 + 10);
  const [storyExtensions, setStoryExtensions] = useState(0);
  const [story, setStory] = useState<string[]>([]);
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevel>(
    userInfo.difficultyLevel || (userInfo.age <= 6 ? "easy" : userInfo.age <= 9 ? "medium" : userInfo.age <= 12 ? "hard" : "expert")
  );
  const [hasShownDifficultyAlert, setHasShownDifficultyAlert] = useState(false);
  const [showTutorialBubble, setShowTutorialBubble] = useState(true);
  const [lastStoryVariant, setLastStoryVariant] = useState<number | null>(null);
  const [currentIllustration, setCurrentIllustration] = useState<string>("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [customIllustrations, setCustomIllustrations] = useState<Map<number, string>>(new Map());
  const [illustrationGenerationQueue, setIllustrationGenerationQueue] = useState<number[]>([]);
  const [runwareService] = useState<SecureRunwareService>(() => new SecureRunwareService("LRRGqlrg67zH8uss6lMjVvc54pVOrznM"));
  const [openAIService] = useState<any>(() => createOpenAITTSService());
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioQueue, setAudioQueue] = useState<HTMLAudioElement[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-dismiss tutorial bubble after 6 seconds (with 5 second delay)
  useEffect(() => {
    if (showTutorialBubble && currentParagraph === 0) {
      const delayTimer = setTimeout(() => {
        const flashTimer = setTimeout(() => {
          setShowTutorialBubble(false);
        }, 6000);
        return () => clearTimeout(flashTimer);
      }, 5000);
      return () => clearTimeout(delayTimer);
    }
  }, [showTutorialBubble, currentParagraph]);

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

  const getUserAvatar = () => {
    const avatarImages = {
      boy: {
        pale: avatarBoyPale,
        light: avatarBoyLight,
        medium: avatarBoyMedium,
        olive: avatarBoyOlive,
        dark: avatarBoyDark,
      },
      girl: {
        pale: avatarGirlPale,
        light: avatarGirlLight,
        medium: avatarGirlMedium,
        olive: avatarGirlOlive,
        dark: avatarGirlDark,
      },
    };
    return avatarImages[userInfo.avatar.type]?.[userInfo.avatar.skinTone] || avatarBoyLight;
  };

  const getAvatarDescription = (includeAppearance = false) => {
    const genderDesc = userInfo.avatar.type === "boy" ? "young boy" : "young girl";
    if (!includeAppearance) {
      return `a ${genderDesc}`;
    }
    const skinToneDesc = {
      pale: "very light skin",
      light: "light skin", 
      medium: "medium skin",
      olive: "olive skin",
      dark: "dark skin"
    }[userInfo.avatar.skinTone];
    return `a happy ${genderDesc} with ${skinToneDesc}`;
  };

  const generateStoryExtension = (info: UserInfo, difficulty: DifficultyLevel, extensionNumber: number): string[] => {
    return InclusiveStoryGenerator.generateCulturallyAdaptedStory(
      info, 
      difficulty, 
      true, // isExtension = true
      extensionNumber
    );
  };

  const generateInitialStory = (info: UserInfo, difficulty: DifficultyLevel): string[] => {
    return InclusiveStoryGenerator.generateCulturallyAdaptedStory(
      info, 
      difficulty, 
      false // isExtension = false
    );
  };

  const generateCustomIllustration = async (paragraphIndex: number, storyParagraph: string) => {
    if (isGeneratingImage || customIllustrations.has(paragraphIndex)) return;

    try {
      setIsGeneratingImage(true);
      setIllustrationGenerationQueue(prev => [...prev, paragraphIndex]);

      const prompt = createChildFriendlyPrompt(
        storyParagraph,
        userInfo.name
      );

      const imageUrl = await runwareService.generateImage({
        positivePrompt: prompt,
        model: "runware:100@1",
        numberResults: 1,
        outputFormat: "WEBP"
      });

      if (imageUrl) {
        const newIllustrations = new Map(customIllustrations);
        newIllustrations.set(paragraphIndex, imageUrl.imageURL || "");
        setCustomIllustrations(newIllustrations);
        await cacheImage(imageUrl.imageURL || "", paragraphIndex.toString());
      }
    } catch (error) {
      console.error("Error generating illustration:", error);
    } finally {
      setIsGeneratingImage(false);
      setIllustrationGenerationQueue(prev => prev.filter(i => i !== paragraphIndex));
    }
  };

  const playTextToSpeech = async (text: string) => {
    if (isPlaying) return;
    
    try {
      setIsPlaying(true);
      const audioUrl = await openAIService.synthesize(text, userInfo.nativeLanguage || 'en');
      
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
      console.error("Error playing text-to-speech:", error);
      setIsPlaying(false);
    }
  };

  const stopTextToSpeech = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setIsPlaying(false);
  };

  const totalPages = story.length;
  const currentStory = story[currentParagraph] || "";
  
  useEffect(() => {
    const initialStory = generateInitialStory(userInfo, currentDifficulty);
    setStory(initialStory);
  }, [userInfo, currentDifficulty]);

  useEffect(() => {
    if (story.length > 0) {
      const illustrationIndex = currentParagraph % illustrations.length;
      setCurrentIllustration(illustrations[illustrationIndex]);
    }
  }, [currentParagraph, story.length]);

  useEffect(() => {
    const checkDifficulty = () => {
      const preferredDifficulty = userInfo.difficultyLevel || (userInfo.age <= 6 ? "easy" : userInfo.age <= 9 ? "medium" : userInfo.age <= 12 ? "hard" : "expert");
      if (currentDifficulty !== preferredDifficulty && !hasShownDifficultyAlert) {
        alert(t("storyDisplay.alerts.difficultyMismatch", { preferredDifficulty }));
        setHasShownDifficultyAlert(true);
      }
    };
    checkDifficulty();
  }, [currentDifficulty, userInfo, hasShownDifficultyAlert, t]);

  const handleNext = () => {
    if (currentParagraph < totalPages - 1) {
      setCurrentParagraph(currentParagraph + 1);
      setShowTutorialBubble(false);
    }
    stopTextToSpeech();
  };

  const handlePrevious = () => {
    if (currentParagraph > 0) {
      setCurrentParagraph(currentParagraph - 1);
    }
    stopTextToSpeech();
  };

  const handleAddTime = () => {
    setTimeRemaining(prev => prev + 300);
  };

  const handleAddPages = () => {
    const extensionPages = generateStoryExtension(userInfo, currentDifficulty, storyExtensions);
    setStory(prev => [...prev, ...extensionPages]);
    setStoryExtensions(prev => prev + 1);
  };

  const handleDifficultyChange = (newDifficulty: DifficultyLevel) => {
    setCurrentDifficulty(newDifficulty);
    const newStory = generateInitialStory(userInfo, newDifficulty);
    setStory(newStory);
    setCurrentParagraph(0);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
        {/* Magical floating elements with enhanced animations */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <Star className="absolute top-20 left-4 md:left-10 text-accent w-4 h-4 md:w-6 md:h-6 animate-float opacity-70" />
          <Heart className="absolute top-32 right-8 md:right-16 text-primary-glow w-4 h-4 md:w-5 md:h-5 animate-bounce-gentle opacity-60" />
          <Sparkles className="absolute bottom-32 left-8 md:left-20 text-secondary w-5 h-5 md:w-7 md:h-7 animate-wiggle opacity-80" />
          <Star className="absolute bottom-20 right-16 md:right-32 text-accent w-3 h-3 md:w-4 md:h-4 animate-float opacity-75" />
          <Wand2 className="absolute top-1/2 left-4 text-primary-glow w-5 h-5 animate-pulse opacity-50" />
          <Zap className="absolute top-1/3 right-4 text-accent w-4 h-4 animate-bounce opacity-60" />
        </div>

        {/* Enhanced Header with professional styling */}
        <header className="relative z-20 p-4 sm:p-6 bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-sm border-b border-primary/20">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative">
                <img src={time2ReadLogo} alt="Time2Read" className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl shadow-elegant transition-transform hover:scale-105" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-primary font-comic">
                  {t("storyDisplay.header.title")}
                </h1>
                <p className="text-xs sm:text-sm text-text-secondary font-comic opacity-80">
                  {userInfo.name}'s Reading Adventure
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={onNewStory}
                    variant="outline"
                    size="sm"
                    className="bg-gradient-subtle hover:bg-gradient-primary transition-all duration-300 border-primary/30 hover:border-primary/50 font-comic text-xs sm:text-sm shadow-soft hover:shadow-glow"
                  >
                    <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{t("storyDisplay.navigation.newStory")}</span>
                    <span className="sm:hidden">New</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Generate a new story adventure</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={onHome}
                    variant="outline"
                    size="sm"
                    className="bg-gradient-subtle hover:bg-gradient-secondary transition-all duration-300 border-secondary/30 hover:border-secondary/50 font-comic text-xs sm:text-sm shadow-soft hover:shadow-elegant"
                  >
                    <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{t("storyDisplay.navigation.home")}</span>
                    <span className="sm:hidden">Home</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Return to the main menu</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </header>

        <main className="relative z-10 px-3 sm:px-6 pb-32 pt-6">
          <div className="max-w-6xl mx-auto">
            {/* Enhanced Progress Section */}
            <div className="mb-6">
              <Card className="bg-card-surface/95 backdrop-blur-sm border-card-border shadow-elegant rounded-2xl p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                      <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm sm:text-base font-bold text-text-primary font-comic">
                          {t("storyDisplay.progress.page")} {currentParagraph + 1} {t("storyDisplay.progress.of")} {totalPages}
                        </span>
                        {showTutorialBubble && currentParagraph === 0 && (
                          <div className="bg-accent text-white px-2 py-1 rounded-full text-xs font-comic animate-bounce-gentle">
                            Click words to learn!
                          </div>
                        )}
                      </div>
                      <Progress 
                        value={(currentParagraph / Math.max(1, totalPages - 1)) * 100} 
                        className="h-2 sm:h-3 w-48 sm:w-64 bg-surface-soft"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-gradient-subtle rounded-xl px-3 py-2 shadow-soft">
                      <TrendingUp className="w-4 h-4 text-secondary" />
                      <span className="text-xs sm:text-sm font-bold text-text-primary font-comic capitalize">
                        {currentDifficulty} Level
                      </span>
                    </div>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => isPlaying ? stopTextToSpeech() : playTextToSpeech(currentStory)}
                          variant="outline"
                          size="sm"
                          className="bg-gradient-primary hover:bg-gradient-primary/80 text-white border-primary/50 rounded-xl shadow-glow"
                        >
                          {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isPlaying ? "Stop reading" : "Read aloud"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </Card>
            </div>

            {/* Enhanced Story Content */}
            <Card className="bg-card-surface/95 backdrop-blur-sm border-card-border shadow-elegant rounded-3xl overflow-hidden">
              <div className="relative">
                {/* Story Header with Avatar */}
                <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-4 sm:p-6 text-center border-b border-primary/10">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="relative">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden shadow-elegant border-4 border-primary/30 bg-gradient-primary p-1">
                        <img 
                          src={getUserAvatar()} 
                          alt={`${userInfo.name}'s avatar`}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                        <Star className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div className="text-left">
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary font-comic">
                        {userInfo.name}'s Adventure
                      </h2>
                      {userInfo.hobbies && (
                        <p className="text-sm sm:text-base text-text-secondary font-comic">
                          Featuring: {userInfo.hobbies}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Story Content with Illustration */}
                <div className="grid lg:grid-cols-2 gap-6 p-4 sm:p-6 lg:p-8">
                  {/* Illustration Section */}
                  <div className="order-2 lg:order-1">
                    <div className="relative rounded-2xl overflow-hidden shadow-elegant bg-gradient-subtle">
                      <img 
                        src={customIllustrations.get(currentParagraph) || currentIllustration}
                        alt="Story illustration"
                        className="w-full h-64 sm:h-80 lg:h-96 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      
                      {/* Custom illustration button */}
                      <div className="absolute top-4 right-4">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => generateCustomIllustration(currentParagraph, currentStory)}
                              disabled={isGeneratingImage || customIllustrations.has(currentParagraph)}
                              size="sm"
                              className="bg-primary/90 hover:bg-primary text-white rounded-xl shadow-glow"
                            >
                              {isGeneratingImage && illustrationGenerationQueue.includes(currentParagraph) ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                    </div>
                  </div>

                  {/* Text Section */}
                  <div className="order-1 lg:order-2 flex flex-col justify-center">
                    <div className="bg-gradient-to-br from-surface-primary/50 to-surface-soft/50 rounded-2xl p-6 sm:p-8 shadow-soft border border-primary/10">
                      <div className="text-center mb-6">
                        <div className="inline-flex items-center gap-2 bg-accent/10 rounded-full px-4 py-2 mb-4">
                          <Sparkles className="w-4 h-4 text-accent" />
                          <span className="text-sm font-comic text-accent">Chapter {currentParagraph + 1}</span>
                        </div>
                      </div>

                      <div className="prose prose-lg max-w-none">
                        <p className={`leading-relaxed font-comic text-center text-text-primary ${
                          currentDifficulty === "easy" ? 'text-xl sm:text-2xl lg:text-3xl font-bold' :
                          userInfo.age <= 7 ? 'text-lg sm:text-xl lg:text-2xl' : 
                          userInfo.age <= 9 ? 'text-base sm:text-lg lg:text-xl' : 
                          'text-sm sm:text-base lg:text-lg'
                        }`}>
                          {processTextForPhonetics(currentStory, "", currentDifficulty, userInfo)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Navigation Controls */}
                <div className="bg-gradient-to-r from-surface-soft/50 to-surface-primary/50 p-4 sm:p-6 border-t border-primary/10">
                  <div className="flex justify-between items-center gap-4 max-w-2xl mx-auto">
                    <Button
                      onClick={handlePrevious}
                      disabled={currentParagraph === 0}
                      className="bg-gradient-secondary hover:bg-gradient-secondary/80 disabled:bg-surface-soft disabled:text-text-secondary font-comic rounded-2xl px-4 sm:px-8 py-3 text-sm sm:text-base shadow-soft hover:shadow-elegant transition-all duration-300 disabled:cursor-not-allowed"
                    >
                      <span className="flex items-center gap-2">
                        <span>←</span>
                        <span className="hidden sm:inline">{t("storyDisplay.navigation.previous")}</span>
                        <span className="sm:hidden">Back</span>
                      </span>
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                              i === currentParagraph % 5 
                                ? 'bg-primary scale-125 shadow-glow' 
                                : 'bg-surface-soft'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <Button
                      onClick={handleNext}
                      disabled={currentParagraph >= totalPages - 1}
                      className="bg-gradient-primary hover:bg-gradient-primary/80 disabled:bg-surface-soft disabled:text-text-secondary font-comic rounded-2xl px-4 sm:px-8 py-3 text-sm sm:text-base shadow-glow hover:shadow-elegant transition-all duration-300 disabled:cursor-not-allowed"
                    >
                      <span className="flex items-center gap-2">
                        <span className="hidden sm:inline">{t("storyDisplay.navigation.next")}</span>
                        <span className="sm:hidden">Next</span>
                        <span>→</span>
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </main>

        {/* Enhanced Floating Timer */}
        <FloatingTimer
          timeRemaining={timeRemaining}
          isReading={isReading}
          onToggleReading={() => setIsReading(!isReading)}
          onAddTime={handleAddTime}
          onAddPages={handleAddPages}
          pagesRemaining={totalPages - currentParagraph - 1}
          currentParagraph={currentParagraph}
          onSessionEnded={onSessionEnded}
        />
      </div>
    </TooltipProvider>
  );
};

console.log("StoryDisplay component loaded");
export default StoryDisplay;