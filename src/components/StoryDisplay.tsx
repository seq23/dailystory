import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BookOpen, Home, RotateCcw, Volume2, VolumeX, TrendingUp, TrendingDown, Plus, Star, Heart, Sparkles } from "lucide-react";
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

  // Auto-dismiss tutorial bubble after 6 seconds (with 5 second delay)
  useEffect(() => {
    if (showTutorialBubble && currentParagraph === 0) {
      // Wait 5 seconds before starting the 6-second flash animation
      const delayTimer = setTimeout(() => {
        const flashTimer = setTimeout(() => {
          setShowTutorialBubble(false);
        }, 6000);
        
        return () => clearTimeout(flashTimer);
      }, 5000);
      
      return () => clearTimeout(delayTimer);
    }
  }, [showTutorialBubble, currentParagraph]);
  
  const [currentIllustration, setCurrentIllustration] = useState<string>("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [customIllustrations, setCustomIllustrations] = useState<Map<number, string>>(new Map());
  const [illustrationGenerationQueue, setIllustrationGenerationQueue] = useState<number[]>([]);
  const [runwareService] = useState<SecureRunwareService>(() => new SecureRunwareService("LRRGqlrg67zH8uss6lMjVvc54pVOrznM"));
  const [openAIService] = useState<any>(() => createOpenAITTSService());

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
    // Use the new inclusive story generator for culturally adapted extensions
    return InclusiveStoryGenerator.generateCulturallyAdaptedStory(
      info, 
      difficulty, 
      true, // isExtension = true
      extensionNumber
    );
  };

  const generateInitialStory = (info: UserInfo, difficulty: DifficultyLevel): string[] => {
    // Use the new inclusive story generator for culturally adapted initial stories
    return InclusiveStoryGenerator.generateCulturallyAdaptedStory(
      info, 
      difficulty, 
      false // isExtension = false
    );
  };

  useEffect(() => {
    const generateIllustration = async (paragraphIndex: number) => {
      if (customIllustrations.has(paragraphIndex)) {
        return; // Skip if already generated
      }

      const storyParagraph = story[paragraphIndex];
      if (!storyParagraph) {
        return; // Skip if paragraph is empty
      }

      setIsGeneratingImage(true);
      try {
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
          await cacheImage(imageUrl.imageURL || "", paragraphIndex.toString()); // Cache the image
        }
      } catch (error) {
        console.error("Error generating image:", error);
      } finally {
        setIsGeneratingImage(false);
        setIllustrationGenerationQueue(prevQueue => prevQueue.slice(1)); // Remove the processed index
      }
    };

    if (illustrationGenerationQueue.length > 0 && !isGeneratingImage) {
      generateIllustration(illustrationGenerationQueue[0]);
    }
  }, [illustrationGenerationQueue, isGeneratingImage, story, userInfo, customIllustrations, runwareService, t]);

  useEffect(() => {
    // Queue illustrations for the first three paragraphs
    const initialQueue = Array.from({ length: Math.min(3, story.length) }, (_, i) => i);
    setIllustrationGenerationQueue(initialQueue);
  }, [story]);

  useEffect(() => {
    if (story.length > 0 && currentParagraph < story.length && !customIllustrations.has(currentParagraph)) {
      // If the current paragraph doesn't have an illustration, add it to the queue
      setIllustrationGenerationQueue(prevQueue => [...prevQueue, currentParagraph]);
    }
  }, [currentParagraph, story, customIllustrations]);

  useEffect(() => {
    if (timeRemaining <= 0) {
      onSessionEnded();
    }

    if (isReading && timeRemaining > 0) {
      const timerId = setTimeout(() => {
        setTimeRemaining(time => time - 1);
      }, 1000);

      return () => clearTimeout(timerId);
    }
  }, [isReading, timeRemaining, onSessionEnded]);

  useEffect(() => {
    // Check if the current difficulty level is different from the user's preferred level
    const preferredDifficulty = userInfo.difficultyLevel || (userInfo.age <= 6 ? "easy" : userInfo.age <= 9 ? "medium" : userInfo.age <= 12 ? "hard" : "expert");
    if (currentDifficulty !== preferredDifficulty && !hasShownDifficultyAlert) {
      alert(t("storyDisplay.alerts.difficultyMismatch", { preferredDifficulty }));
      setHasShownDifficultyAlert(true);
    }
  }, [currentDifficulty, userInfo, hasShownDifficultyAlert, t]);

  const totalPages = story.length;
  const currentStory = story[currentParagraph] || "";
  
  useEffect(() => {
    const initialStory = generateInitialStory(userInfo, currentDifficulty);
    setStory(initialStory);
  }, [userInfo, currentDifficulty]);

  const handleNext = () => {
    if (currentParagraph < totalPages - 1) {
      setCurrentParagraph(currentParagraph + 1);
      setShowTutorialBubble(false);
    }
  };

  const handlePrevious = () => {
    if (currentParagraph > 0) {
      setCurrentParagraph(currentParagraph - 1);
    }
  };

  const handleAddTime = () => {
    setTimeRemaining(prev => prev + 300);
  };

  const handleAddPages = () => {
    // Generate new story pages without adding time
    const extensionPages = generateStoryExtension(userInfo, currentDifficulty, storyExtensions);
    setStory(prev => [...prev, ...extensionPages]);
    setStoryExtensions(prev => prev + 1);
  };

  return (
    <TooltipProvider>
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Magical floating elements */}
      <div className="absolute inset-0 pointer-events-none">
        <Star className="absolute top-20 left-4 md:left-10 text-accent w-4 h-4 md:w-6 md:h-6 animate-float" />
        <Heart className="absolute top-32 right-8 md:right-16 text-primary-glow w-4 h-4 md:w-5 md:h-5 animate-bounce-gentle" />
        <Sparkles className="absolute bottom-32 left-8 md:left-20 text-secondary w-5 h-5 md:w-7 md:h-7 animate-wiggle" />
        <Star className="absolute bottom-20 right-16 md:right-32 text-accent w-3 h-3 md:w-4 md:h-4 animate-float" />
      </div>

      {/* Header with navigation */}
      <header className="relative z-20 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={time2ReadLogo} alt="Time2Read" className="w-12 h-12 rounded-xl shadow-elegant" />
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary font-comic">
              {t("storyDisplay.header.title")}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={onNewStory}
              variant="outline"
              className="bg-card-surface/80 backdrop-blur-sm border-primary/20 hover:bg-card-surface hover:border-primary/40 font-comic text-sm sm:text-base"
            >
              <RotateCcw className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{t("storyDisplay.navigation.newStory")}</span>
              <span className="sm:hidden">{t("storyDisplay.navigation.newStoryShort")}</span>
            </Button>
            
            <Button
              onClick={onHome}
              variant="outline" 
              className="bg-card-surface/80 backdrop-blur-sm border-primary/20 hover:bg-card-surface hover:border-primary/40 font-comic text-sm sm:text-base"
            >
              <Home className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{t("storyDisplay.navigation.home")}</span>
              <span className="sm:hidden">{t("storyDisplay.navigation.homeShort")}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 px-4 sm:px-6 pb-32">
        <Card className="mx-auto max-w-4xl bg-card-surface/95 backdrop-blur-sm border-card-border shadow-elegant rounded-3xl overflow-hidden">
          <div className="relative">
            {/* Progress indicator */}
            <div className="p-4 sm:p-6 pb-3 sm:pb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-text-secondary font-comic">
                    {t("storyDisplay.progress.page")} {currentParagraph + 1} {t("storyDisplay.progress.of")} {totalPages}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-secondary" />
                    <span className="text-xs font-medium text-text-secondary font-comic capitalize">
                      {currentDifficulty}
                    </span>
                  </div>
                </div>
              </div>
              
              <Progress 
                value={(currentParagraph / (totalPages - 1)) * 100} 
                className="h-2 bg-surface-soft"
              />
            </div>

            {/* Story content */}
            <div className="px-4 sm:px-6 pb-6">
              <div 
                className="bg-gradient-soft rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-center relative overflow-hidden shadow-soft"
                style={{
                  backgroundImage: `url(${ancientBookBg})`,
                  backgroundBlendMode: 'soft-light',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* Content overlay for better readability */}
                <div className="absolute inset-0 bg-surface-primary/90 rounded-2xl sm:rounded-3xl"></div>
                
                <div className="relative z-10">
                  <div className="mb-6 sm:mb-8">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full overflow-hidden shadow-elegant border-4 border-primary/20">
                      <img 
                        src={getUserAvatar()} 
                        alt={`${userInfo.name}'s avatar`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary mb-2 font-comic">
                      {userInfo.name}'s {t("storyDisplay.content.adventure")}
                    </h2>
                    <div className="text-sm text-text-secondary font-comic">
                      {userInfo.hobbies && (
                        <span>{t("storyDisplay.content.featuring")} {userInfo.hobbies}</span>
                      )}
                    </div>
                  </div>

                  <div className="max-w-3xl mx-auto">
                    <p className={`leading-relaxed font-comic text-center ${
                      currentDifficulty === "easy" ? 'text-2xl sm:text-3xl lg:text-4xl font-bold' :
                      userInfo.age <= 7 ? 'text-lg sm:text-xl lg:text-2xl' : 
                      userInfo.age <= 9 ? 'text-base sm:text-lg lg:text-xl' : 
                      'text-sm sm:text-base lg:text-lg'
                    }`}>
                      {processTextForPhonetics(currentStory, "", currentDifficulty, userInfo)}
                    </p>
                  </div>
                </div>

                {/* Navigation Controls */}
                <div className="flex justify-between items-center gap-2 mt-8">
                  <Button
                    onClick={handlePrevious}
                    disabled={currentParagraph === 0}
                    className="bg-gradient-secondary hover:shadow-soft font-comic rounded-xl sm:rounded-2xl px-3 sm:px-6 text-sm sm:text-base"
                  >
                    <span className="hidden sm:inline">← {t("storyDisplay.navigation.previous")}</span>
                    <span className="sm:hidden">{t("storyDisplay.navigation.previousShort")}</span>
                  </Button>
                  
                  <Button
                    onClick={handleNext}
                    disabled={currentParagraph >= totalPages - 1}
                    className="bg-gradient-primary hover:shadow-glow font-comic rounded-xl sm:rounded-2xl px-3 sm:px-6 text-sm sm:text-base"
                  >
                    <span className="hidden sm:inline">{t("storyDisplay.navigation.next")} →</span>
                    <span className="sm:hidden">{t("storyDisplay.navigation.nextShort")}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </main>

      {/* Floating Timer */}
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

console.log("StoryDisplay component loaded"); // Force module refresh
export default StoryDisplay;
