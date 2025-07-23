import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Home, RotateCcw, Volume2, VolumeX } from "lucide-react";
import type { UserInfo } from "./UserInfoForm";

interface StoryDisplayProps {
  userInfo: UserInfo;
  onHome: () => void;
  onNewStory: () => void;
}

export const StoryDisplay = ({ userInfo, onHome, onNewStory }: StoryDisplayProps) => {
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  // Generate a personalized story based on user info
  const generateStory = (info: UserInfo): string[] => {
    const stories = [
      `Once upon a time, there was a wonderful child named ${info.name} who was ${info.age} years old and in ${info.grade} grade. ${info.name} had a special gift - everything they touched turned the most beautiful shade of ${info.favoriteColor}!`,
      
      `One sunny morning, ${info.name} was playing ${info.hobbies} when they heard a tiny voice calling for help. Looking around, they discovered a magical ${info.favoriteAnimal} who was stuck in a rainbow-colored tree!`,
      
      `"Please help me!" squeaked the ${info.favoriteAnimal}. "${info.name} used their special ${info.favoriteColor} powers to gently free their new friend. The grateful ${info.favoriteAnimal} invited ${info.name} on an amazing adventure!"`,
      
      `Together, they soared through cotton candy clouds and landed in a magical kingdom where all the houses were made of ${info.favoriteFood}! The people there had been waiting for someone just like ${info.name} to help them solve a very important problem.`,
      
      `The kingdom's rainbow had lost all its colors! ${info.name} remembered what ${info.bestFriend} always said: "When we work together, we can do anything!" So ${info.name} and the magical ${info.favoriteAnimal} joined hands and used the power of friendship.`,
      
      `With a burst of ${info.favoriteColor} light, the rainbow blazed back to life with all the colors imaginable! The kingdom cheered, and the king offered ${info.name} the chance to become the Royal ${info.dreamJob} - the most important job in the whole kingdom!`,
      
      `${info.name} smiled and said, "I would love to help, but first I need to go home and tell ${info.bestFriend} about this amazing adventure!" The magical ${info.favoriteAnimal} promised to visit ${info.name} again soon.`,
      
      `As ${info.name} flew home on the back of their new friend, they looked down at the colorful world below and felt so happy. They had learned that being kind, helpful, and brave can lead to the most wonderful adventures of all!`,
      
      `Back at home, ${info.name} couldn't wait to tell ${info.bestFriend} about the magical ${info.favoriteAnimal}, the ${info.favoriteFood} houses, and how they had saved the rainbow. They fell asleep that night dreaming of their next great adventure.`,
      
      `And they all lived happily ever after! The End. Remember, just like ${info.name}, you have special powers too - the power of kindness, creativity, and friendship can take you on amazing adventures every single day!`
    ];
    
    return stories;
  };

  const storyParagraphs = generateStory(userInfo);
  const totalParagraphs = storyParagraphs.length;

  useEffect(() => {
    if (isReading) {
      const timer = setInterval(() => {
        setReadingProgress(prev => {
          const newProgress = prev + (100 / (20 * 60)); // 20 minutes = 1200 seconds
          if (newProgress >= 100) {
            setIsReading(false);
            return 100;
          }
          return newProgress;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isReading]);

  const handleNext = () => {
    if (currentParagraph < totalParagraphs - 1) {
      setCurrentParagraph(currentParagraph + 1);
    }
  };

  const handlePrevious = () => {
    if (currentParagraph > 0) {
      setCurrentParagraph(currentParagraph - 1);
    }
  };

  const handleStartReading = () => {
    setIsReading(true);
    setReadingProgress(0);
  };

  const progress = ((currentParagraph + 1) / totalParagraphs) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-primary rounded-full shadow-soft">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {userInfo.name}'s Magical Adventure
              </h1>
              <p className="text-muted-foreground">
                A personalized story just for you!
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="playful" size="lg" onClick={onNewStory}>
              <RotateCcw className="w-5 h-5" />
              New Story
            </Button>
            <Button variant="ghost" size="lg" onClick={onHome}>
              <Home className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Reading Progress */}
        <Card className="bg-gradient-card shadow-card border-0 rounded-3xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Reading Progress</h3>
            <div className="flex items-center gap-2">
              <Button
                variant={isReading ? "destructive" : "fun"}
                size="sm"
                onClick={() => setIsReading(!isReading)}
              >
                {isReading ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                {isReading ? "Pause" : "Start Reading"}
              </Button>
            </div>
          </div>
          <Progress value={readingProgress} className="h-3 mb-2" />
          <p className="text-sm text-muted-foreground">
            {Math.round(readingProgress)}% complete • {Math.round((readingProgress / 100) * 20)} minutes read
          </p>
        </Card>

        {/* Story Content */}
        <Card className="bg-gradient-card shadow-card border-0 rounded-3xl p-8 mb-6">
          {/* Story Progress */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Page {currentParagraph + 1} of {totalParagraphs}
              </span>
            </div>
            <Progress value={progress} className="w-32 h-2" />
          </div>

          {/* Story Text */}
          <div className="prose prose-lg max-w-none mb-8">
            <p className="text-xl leading-relaxed text-foreground font-medium">
              {storyParagraphs[currentParagraph]}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex gap-4 justify-center">
            <Button
              variant="playful"
              size="lg"
              onClick={handlePrevious}
              disabled={currentParagraph === 0}
              className="flex-1 max-w-xs"
            >
              Previous Page
            </Button>
            
            <Button
              variant="fun"
              size="lg"
              onClick={handleNext}
              disabled={currentParagraph === totalParagraphs - 1}
              className="flex-1 max-w-xs"
            >
              {currentParagraph === totalParagraphs - 1 ? "Story Complete!" : "Next Page"}
            </Button>
          </div>
        </Card>

        {/* Story completed message */}
        {currentParagraph === totalParagraphs - 1 && (
          <Card className="bg-gradient-hero shadow-glow border-0 rounded-3xl p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              🎉 Congratulations, {userInfo.name}! 🎉
            </h2>
            <p className="text-xl text-white/90 mb-6">
              You've completed your magical adventure! Come back tomorrow for a brand new story.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="hero" size="xl" onClick={onNewStory}>
                Create Another Story
              </Button>
              <Button variant="card" size="xl" onClick={onHome}>
                Back to Home
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};