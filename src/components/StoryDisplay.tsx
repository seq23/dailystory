import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
import { ElevenLabsService } from "@/services/textToSpeechService";

type DifficultyLevel = "easy" | "medium" | "hard" | "expert";

interface StoryDisplayProps {
  userInfo: UserInfo;
  onHome: () => void;
  onNewStory: () => void;
}

export const StoryDisplay = ({ userInfo, onHome, onNewStory }: StoryDisplayProps) => {
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [isReading, setIsReading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(10 * 60);
  const [storyExtensions, setStoryExtensions] = useState(0);
  const [story, setStory] = useState<string[]>([]);
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevel>(
    userInfo.difficultyLevel || (userInfo.age <= 6 ? "easy" : userInfo.age <= 9 ? "medium" : userInfo.age <= 12 ? "hard" : "expert")
  );
  const [currentIllustration, setCurrentIllustration] = useState<string>("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [runwareService] = useState<SecureRunwareService>(() => new SecureRunwareService("LRRGqlrg67zH8uss6lMjVvc54pVOrznM"));
  const [elevenLabsService] = useState<any>(() => 
    new ElevenLabsService({ apiKey: "sk_9935316e04bb91ad195bacd28187279ec30691b8fa66ab6b" })
  );

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

  const getAvatarDescription = () => {
    const genderDesc = userInfo.avatar.type === "boy" ? "young boy" : "young girl";
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
    const avatarDesc = getAvatarDescription();
    const hobbies = info.hobbies;
    
    const extensionStories = [
      // Extension 1
      [
        `${info.name} discovered a hidden portal that led to an even more magical realm. This new world was filled with floating islands and creatures made of starlight who needed ${info.name}'s help.`,
        `In this celestial realm, ${info.name} learned to harness the power of the stars themselves. Each constellation told a different story, and ${info.name} could bring these stories to life through their connection to ${hobbies}.`,
        `A wise star-spirit approached ${info.name} and explained that the balance between all magical worlds was in danger. Only someone with a pure heart and deep love for ${hobbies} could restore harmony.`,
        `${info.name} embarked on a quest through the cosmic realm, solving stellar puzzles and helping star-creatures overcome their challenges. Each good deed made ${info.name}'s inner light shine brighter.`,
        `With their dragon companion by their side, ${info.name} faced trials that tested not just their magical abilities, but their kindness, wisdom, and determination to help others.`
      ],
      // Extension 2
      [
        `${info.name} and their dragon friend discovered an ancient library floating among the clouds, where books contained living stories that could teach amazing lessons about ${hobbies}.`,
        `The librarian, a gentle phoenix, revealed that some stories had lost their way and needed ${info.name}'s help to find their proper endings. Each rescued story would grant ${info.name} new wisdom.`,
        `As ${info.name} ventured deeper into the library, they found books that responded to their love of ${hobbies}, revealing secrets about courage, friendship, and the magic of believing in oneself.`,
        `${info.name} helped reunite separated story characters, solved riddles written in languages of light, and discovered that every act of kindness created new chapters in the great book of life.`,
        `The phoenix gifted ${info.name} a special bookmark that would always guide them back to any story they wished to revisit, ensuring their adventures could continue forever.`
      ],
      // Extension 3  
      [
        `${info.name} was invited to join the Council of Young Heroes, where children from all magical realms gathered to share their adventures and learn from each other's experiences with ${hobbies}.`,
        `At the council, ${info.name} met other brave children who had overcome incredible challenges. Together, they planned missions to help magical creatures throughout all the connected realms.`,
        `${info.name} led a team on a mission to restore color to a realm that had lost its vibrancy. Using their knowledge of ${hobbies} and their team's combined skills, they painted rainbows across the sky.`,
        `The grateful inhabitants of the colorless realm taught ${info.name} ancient songs that could heal hearts and bring joy to anyone who heard them. These melodies became ${info.name}'s most treasured gift.`,
        `${info.name} returned home with new friends from across the magical multiverse, knowing that their adventures had taught them the most important lesson: that sharing joy makes it multiply infinitely.`
      ]
    ];
    
    const selectedExtension = extensionStories[extensionNumber % extensionStories.length];
    
    const difficultySettings = {
      easy: { words: 50 },
      medium: { words: 80 },
      hard: { words: 120 },
      expert: { words: 150 }
    };
    
    const settings = difficultySettings[difficulty];
    
    return selectedExtension.map(paragraph => {
      const words = paragraph.split(' ');
      if (words.length > settings.words) {
        return words.slice(0, settings.words).join(' ') + '...';
      }
      return paragraph;
    });
  };

  const generateInitialStory = (info: UserInfo, difficulty: DifficultyLevel): string[] => {
    const avatarDesc = getAvatarDescription();
    const hobbies = info.hobbies;
    
    const difficultySettings = {
      easy: { 
        sentences: 2, 
        words: 50, 
        vocabulary: "simple words that 4-6 year olds know",
        structure: "short, simple sentences"
      },
      medium: { 
        sentences: 3, 
        words: 80, 
        vocabulary: "age-appropriate words for 7-9 year olds",
        structure: "clear, engaging sentences"
      },
      hard: { 
        sentences: 4, 
        words: 120, 
        vocabulary: "challenging but accessible words for 10-12 year olds",
        structure: "varied sentence structures"
      },
      expert: { 
        sentences: 5, 
        words: 150, 
        vocabulary: "advanced vocabulary for 13+ year olds",
        structure: "complex and sophisticated sentences"
      }
    };

    const settings = difficultySettings[difficulty];
    
    const baseStory = [
      `Once upon a time, there was ${avatarDesc} named ${info.name}. ${info.name} loved ${hobbies} more than anything in the world. One magical morning, ${info.name} discovered something amazing that would change everything.`,
      
      `${info.name} found a mysterious, glowing object hidden in their favorite place. It sparkled with all the colors of the rainbow and seemed to whisper secrets of adventure. When ${info.name} touched it, something incredible happened.`,
      
      `Suddenly, ${info.name} was transported to a magical world where ${hobbies} came to life! Everything was more colorful, more exciting, and full of friendly creatures who wanted to help ${info.name} on an amazing quest.`,
      
      `In this enchanted land, ${info.name} met a wise guide who explained that they had been chosen for a special mission. The guide gave ${info.name} magical powers related to ${hobbies} and showed them the path to adventure.`,
      
      `${info.name} faced their first challenge with courage and creativity. Using their love of ${hobbies} and their new magical abilities, they solved puzzles and helped other creatures in need. Everyone was amazed by ${info.name}'s kindness.`,
      
      `As ${info.name} continued their journey, they discovered hidden talents they never knew they had. Each challenge made them stronger and more confident. The magical world seemed to respond to ${info.name}'s pure heart and determination.`,
      
      `${info.name} encountered a friendly dragon who was sad because they had lost something precious. Using their knowledge of ${hobbies} and their problem-solving skills, ${info.name} helped the dragon find what was lost.`,
      
      `The grateful dragon became ${info.name}'s loyal companion and taught them how to fly through the clouds. Together, they soared over magical forests, crystal lakes, and rainbow bridges, seeing wonders beyond imagination.`,
      
      `${info.name} and their dragon friend discovered a beautiful castle where a celebration was taking place. All the magical creatures they had helped were there, cheering for ${info.name} and celebrating their heroic deeds.`,
      
      `At the celebration, ${info.name} was honored as a true hero of the magical realm. They received a special gift that would always remind them of their adventure and the friends they had made along the way.`
    ];

    return baseStory.map(paragraph => {
      const words = paragraph.split(' ');
      if (words.length > settings.words) {
        return words.slice(0, settings.words).join(' ') + '...';
      }
      return paragraph;
    });
  };

  // Initialize story with useEffect to avoid conflicts
  useEffect(() => {
    const initialStory = generateInitialStory(userInfo, currentDifficulty);
    setStory(initialStory);
  }, [userInfo, currentDifficulty]);

  const totalPages = story.length;
  const currentStory = story[currentParagraph] || "Loading your magical story...";

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

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (isReading && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsReading(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isReading, timeRemaining]);

  useEffect(() => {
    const illustrationIndex = currentParagraph % illustrations.length;
    setCurrentIllustration(illustrations[illustrationIndex]);
  }, [currentParagraph]);


  const handleNext = () => {
    if (currentParagraph < totalPages - 1) {
      setCurrentParagraph(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentParagraph > 0) {
      setCurrentParagraph(prev => prev - 1);
    }
  };

  const handleDifficultyUp = () => {
    const levels: DifficultyLevel[] = ["easy", "medium", "hard", "expert"];
    const currentIndex = levels.indexOf(currentDifficulty);
    if (currentIndex < levels.length - 1) {
      setCurrentDifficulty(levels[currentIndex + 1]);
    }
  };

  const handleDifficultyDown = () => {
    const levels: DifficultyLevel[] = ["easy", "medium", "hard", "expert"];
    const currentIndex = levels.indexOf(currentDifficulty);
    if (currentIndex > 0) {
      setCurrentDifficulty(levels[currentIndex - 1]);
    }
  };

  const handleAddTime = () => {
    setTimeRemaining(prev => prev + 600); // Add 10 minutes (600 seconds)
    const extensionPages = generateStoryExtension(userInfo, currentDifficulty, storyExtensions);
    setStory(prev => [...prev, ...extensionPages]);
    setStoryExtensions(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Magical floating elements */}
      <div className="absolute inset-0 pointer-events-none">
        <Star className="absolute top-20 left-10 text-accent w-6 h-6 animate-float" />
        <Heart className="absolute top-32 right-16 text-primary-glow w-5 h-5 animate-bounce-gentle" />
        <Sparkles className="absolute bottom-32 left-20 text-secondary w-7 h-7 animate-wiggle" />
        <Star className="absolute bottom-20 right-32 text-accent w-4 h-4 animate-float" />
      </div>

      {/* Header with Logo and Company Branding */}
      <header className="relative z-10 bg-white/90 backdrop-blur-sm shadow-soft border-b-4 border-primary">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Company Name */}
            <div className="flex items-center gap-4">
              <img 
                src={time2ReadLogo} 
                alt="Time2Read Logo" 
                className="w-12 h-12 hover:animate-wiggle cursor-pointer"
              />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Time2Read
                </h1>
                <p className="text-sm text-muted-foreground font-comic">
                  Reading Adventures for Kids
                </p>
              </div>
            </div>

            {/* User Info and Navigation */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3 bg-gradient-card rounded-2xl px-4 py-2 shadow-soft">
                <img 
                  src={getUserAvatar()} 
                  alt="Your avatar" 
                  className="w-8 h-8 rounded-full border-2 border-primary"
                />
                <div className="text-sm">
                  <p className="font-semibold text-foreground">{userInfo.name}</p>
                  <p className="text-muted-foreground">Age {userInfo.age}</p>
                </div>
              </div>
              
              <Button
                onClick={onHome}
                variant="outline"
                size="sm"
                className="font-comic hover:scale-105 transition-transform bg-white/80 hover:bg-white"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              
              <Button
                onClick={onNewStory}
                size="sm"
                className="font-comic hover:scale-105 transition-transform bg-gradient-primary hover:shadow-glow"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                New Story
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Story Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Story Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">
                Page {currentParagraph + 1} of {totalPages}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Progress:</span>
              <div className="w-20 text-sm font-semibold text-primary">
                {Math.round(((currentParagraph + 1) / totalPages) * 100)}%
              </div>
            </div>
          </div>
          <Progress 
            value={((currentParagraph + 1) / totalPages) * 100} 
            className="h-3 bg-secondary/30"
          />
        </div>

        {/* Story Book Layout */}
        <Card className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-card border-4 border-primary/20 overflow-hidden">
          <div className="p-8">
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              {/* Illustration Panel */}
              <div className="relative">
                <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-secondary p-4 shadow-soft">
                  {currentIllustration ? (
                    <img
                      src={currentIllustration}
                      alt={`Story illustration for page ${currentParagraph + 1}`}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-card rounded-xl flex items-center justify-center">
                      <div className="text-center">
                        {isGeneratingImage ? (
                          <>
                            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
                            <p className="text-muted-foreground font-comic">
                              Creating magical illustration...
                            </p>
                          </>
                        ) : (
                          <>
                            <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
                            <p className="text-muted-foreground font-comic">
                              Illustration loading...
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Decorative corner elements */}
                <Star className="absolute -top-2 -left-2 text-accent w-6 h-6" />
                <Heart className="absolute -top-2 -right-2 text-primary w-5 h-5" />
                <Sparkles className="absolute -bottom-2 -left-2 text-secondary w-6 h-6" />
                <Star className="absolute -bottom-2 -right-2 text-accent w-5 h-5" />
              </div>

              {/* Story Text Panel */}
              <div className="space-y-6">
                {/* Difficulty Level Badge */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-gradient-secondary rounded-full text-sm font-semibold text-secondary-foreground">
                      {currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)} Level
                    </span>
                  </div>
                  
                  {/* Difficulty Controls */}
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleDifficultyDown}
                      size="sm"
                      variant="outline"
                      className="rounded-full w-8 h-8 p-0 hover:scale-110 transition-transform"
                      disabled={currentDifficulty === "easy"}
                    >
                      <TrendingDown className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={handleDifficultyUp}
                      size="sm"
                      variant="outline"
                      className="rounded-full w-8 h-8 p-0 hover:scale-110 transition-transform"
                      disabled={currentDifficulty === "expert"}
                    >
                      <TrendingUp className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Story Text */}
                <div className="bg-gradient-card rounded-2xl p-6 shadow-soft min-h-[300px] flex items-center">
                  <div className="w-full">
                    <p className={`leading-relaxed font-comic text-lg ${
                      userInfo.age <= 7 ? 'text-2xl' : 
                      userInfo.age <= 9 ? 'text-xl' : 
                      'text-lg'
                    }`}>
                      {processTextForPhonetics(currentStory, "", currentDifficulty, elevenLabsService)}
                    </p>
                  </div>
                </div>

                {/* Navigation Controls */}
                <div className="flex justify-between items-center">
                  <Button
                    onClick={handlePrevious}
                    disabled={currentParagraph === 0}
                    className="bg-gradient-secondary hover:shadow-soft font-comic rounded-2xl px-6"
                  >
                    ← Previous
                  </Button>
                  
                  <Button
                    onClick={handleNext}
                    disabled={currentParagraph >= totalPages - 1}
                    className="bg-gradient-primary hover:shadow-glow font-comic rounded-2xl px-6"
                  >
                    Next →
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
      />
    </div>
  );
};
