import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Home, RotateCcw, Volume2, VolumeX, TrendingUp, TrendingDown } from "lucide-react";
import type { UserInfo } from "./UserInfoForm";

type DifficultyLevel = "easy" | "medium" | "hard";

interface StoryDisplayProps {
  userInfo: UserInfo;
  onHome: () => void;
  onNewStory: () => void;
}

export const StoryDisplay = ({ userInfo, onHome, onNewStory }: StoryDisplayProps) => {
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(20 * 60); // 20 minutes in seconds
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevel>(
    userInfo.difficultyLevel || (userInfo.age <= 7 ? "easy" : userInfo.age <= 10 ? "medium" : "hard")
  );

  // Generate age-appropriate stories based on difficulty level
  const generateStory = (info: UserInfo, difficulty: DifficultyLevel): string[] => {
    const storyTemplates = {
      easy: [
        `Hi! This is ${info.name}. ${info.name} is ${info.age} years old. ${info.name} likes the color ${info.favoriteColor}.`,
        
        `One day, ${info.name} saw a ${info.favoriteAnimal}. The ${info.favoriteAnimal} was sad. It was stuck in a tree.`,
        
        `"Help me!" said the ${info.favoriteAnimal}. ${info.name} wanted to help. ${info.name} climbed up the tree.`,
        
        `${info.name} helped the ${info.favoriteAnimal} get down. The ${info.favoriteAnimal} was happy now.`,
        
        `"Thank you!" said the ${info.favoriteAnimal}. "Want to see something cool?" ${info.name} said yes.`,
        
        `They went to a magic place. Everything was made of ${info.favoriteFood}! It looked yummy.`,
        
        `${info.name} and the ${info.favoriteAnimal} played together. They had so much fun.`,
        
        `"I have to go home now," said ${info.name}. "I want to tell ${info.bestFriend} about you!"`,
        
        `The ${info.favoriteAnimal} smiled. "Come back soon!" it said. ${info.name} waved goodbye.`,
        
        `${info.name} went home. ${info.name} felt happy. Being kind and helpful is always good! The End.`
      ],
      
      medium: [
        `Once upon a time, there was a special child named ${info.name} who was ${info.age} years old and in ${info.grade} grade. ${info.name} had a wonderful gift that made everything turn ${info.favoriteColor}!`,
        
        `One beautiful morning, while ${info.name} was enjoying ${info.hobbies}, they heard a small voice calling for help. Looking around carefully, they discovered a magical ${info.favoriteAnimal} stuck high up in a shimmering tree.`,
        
        `"Please help me!" called the ${info.favoriteAnimal}. ${info.name} felt sorry for their new friend and used their special ${info.favoriteColor} powers to gently free the trapped animal.`,
        
        `The grateful ${info.favoriteAnimal} was so thankful that it invited ${info.name} on an amazing adventure to a secret kingdom where all the buildings were made of delicious ${info.favoriteFood}!`,
        
        `In this magical place, the people explained that their rainbow had lost all its beautiful colors. ${info.name} remembered what ${info.bestFriend} always said about working together to solve problems.`,
        
        `With determination and kindness, ${info.name} and the ${info.favoriteAnimal} joined their powers together. Suddenly, a burst of ${info.favoriteColor} light restored the rainbow to its full glory!`,
        
        `The grateful kingdom offered ${info.name} the important job of Royal ${info.dreamJob}, but ${info.name} politely explained they needed to return home to share this adventure with ${info.bestFriend}.`,
        
        `As they flew home together, ${info.name} felt proud of what they had accomplished. They learned that being brave, kind, and helpful can lead to the most wonderful experiences.`,
        
        `Back at home, ${info.name} excitedly told ${info.bestFriend} about the magical ${info.favoriteAnimal} and their colorful adventure. They fell asleep dreaming of future adventures.`,
        
        `And so ${info.name} learned that every day brings new opportunities for kindness and adventure. The End.`
      ],
      
      hard: [
        `In a world where extraordinary things happened to ordinary children, there lived a remarkable young person named ${info.name}, who at ${info.age} years old and in ${info.grade} grade, possessed an incredible ability to transform anything they touched into the most magnificent shade of ${info.favoriteColor}.`,
        
        `On a particularly enchanting morning, while ${info.name} was enthusiastically pursuing their favorite activity of ${info.hobbies}, an urgent plea for assistance echoed through the air. Upon investigation, they discovered an extraordinary ${info.favoriteAnimal} trapped within the crystalline branches of an ancient, mystical tree.`,
        
        `"I desperately need your help!" implored the ${info.favoriteAnimal}, its voice filled with both hope and desperation. ${info.name}, moved by compassion and armed with their supernatural ${info.favoriteColor} abilities, carefully and methodically worked to liberate their newfound companion.`,
        
        `The profoundly grateful ${info.favoriteAnimal} extended an invitation to ${info.name} for an unprecedented journey to a magnificent realm where architectural marvels were constructed entirely from varieties of ${info.favoriteFood}, creating a landscape both beautiful and delicious.`,
        
        `Upon arriving in this fantastical kingdom, the inhabitants revealed a catastrophic problem: their legendary rainbow, source of all color and joy in their world, had mysteriously lost its vibrancy. ${info.name} recalled the wise words ${info.bestFriend} had once shared about the transformative power of collaboration and friendship.`,
        
        `Through unwavering determination, creative problem-solving, and the combined strength of their partnership, ${info.name} and the ${info.favoriteAnimal} channeled their collective energy, producing a spectacular explosion of ${info.favoriteColor} radiance that magnificently restored the rainbow's former splendor.`,
        
        `The eternally grateful citizens offered ${info.name} the prestigious position of Royal ${info.dreamJob}, recognizing their exceptional leadership and problem-solving abilities. However, ${info.name} graciously declined, explaining their responsibility to return home and share these remarkable experiences with their cherished friend ${info.bestFriend}.`,
        
        `During their homeward journey, soaring through clouds painted with colors they had helped restore, ${info.name} reflected on the profound lessons learned about courage, empathy, and the extraordinary impact that one person's kindness can have on an entire world.`,
        
        `Upon reuniting with ${info.bestFriend}, ${info.name} recounted every detail of their transformative adventure with the magical ${info.favoriteAnimal} and the colorful kingdom. That night, they drifted off to sleep with hearts full of gratitude and minds buzzing with anticipation for future adventures.`,
        
        `Thus concluded an adventure that taught ${info.name} that within every individual lies the potential for greatness, and that through kindness, creativity, and friendship, even the most seemingly impossible challenges can be overcome. The End.`
      ]
    };
    
    return storyTemplates[difficulty];
  };

  const storyParagraphs = generateStory(userInfo, currentDifficulty);
  const totalParagraphs = storyParagraphs.length;

  useEffect(() => {
    if (isReading && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsReading(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isReading, timeRemaining]);

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
    if (timeRemaining === 0) {
      setTimeRemaining(20 * 60); // Reset to 20 minutes if timer reached 0
    }
  };

  const handleDifficultyUp = () => {
    if (currentDifficulty === "easy") setCurrentDifficulty("medium");
    else if (currentDifficulty === "medium") setCurrentDifficulty("hard");
    setCurrentParagraph(0); // Reset to beginning with new difficulty
  };

  const handleDifficultyDown = () => {
    if (currentDifficulty === "hard") setCurrentDifficulty("medium");
    else if (currentDifficulty === "medium") setCurrentDifficulty("easy");
    setCurrentParagraph(0); // Reset to beginning with new difficulty
  };

  // Dynamic text size based on age and difficulty
  const getTextSize = () => {
    if (userInfo.age <= 7 && currentDifficulty === "easy") return "text-3xl leading-relaxed";
    if (userInfo.age <= 9 && currentDifficulty === "easy") return "text-2xl leading-relaxed";
    if (currentDifficulty === "easy") return "text-xl leading-relaxed";
    if (currentDifficulty === "medium") return "text-lg leading-relaxed";
    return "text-base leading-relaxed";
  };

  const getDifficultyColor = () => {
    switch (currentDifficulty) {
      case "easy": return "text-green-600";
      case "medium": return "text-yellow-600";
      case "hard": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getDifficultyLabel = () => {
    switch (currentDifficulty) {
      case "easy": return "Easy Reading";
      case "medium": return "Medium Reading";
      case "hard": return "Advanced Reading";
      default: return "Reading";
    }
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progress = ((currentParagraph + 1) / totalParagraphs) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header with Timer */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-primary rounded-full shadow-soft">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {userInfo.name}'s Magical Adventure
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-muted-foreground">
                  A personalized story just for you!
                </p>
                <span className={`text-sm font-semibold px-2 py-1 rounded-full bg-white/80 ${getDifficultyColor()}`}>
                  {getDifficultyLabel()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Reading Timer */}
            <div className="flex flex-col items-center">
              <div className={`text-2xl font-bold px-4 py-2 rounded-2xl border-2 transition-all duration-300 ${
                timeRemaining <= 300 ? 'text-red-600 border-red-300 bg-red-50' : 
                timeRemaining <= 600 ? 'text-yellow-600 border-yellow-300 bg-yellow-50' :
                'text-green-600 border-green-300 bg-green-50'
              }`}>
                {formatTime(timeRemaining)}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Button
                  variant={isReading ? "destructive" : "fun"}
                  size="sm"
                  onClick={() => setIsReading(!isReading)}
                >
                  {isReading ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  {isReading ? "Pause" : "Start"}
                </Button>
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
        </div>

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

          {/* Story Text with Dynamic Sizing */}
          <div className="prose prose-lg max-w-none mb-8">
            <p className={`${getTextSize()} text-foreground font-medium`}>
              {storyParagraphs[currentParagraph]}
            </p>
          </div>

          {/* Difficulty Adjustment Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDifficultyDown}
              disabled={currentDifficulty === "easy"}
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              Easier
            </Button>
            
            <div className="text-center">
              <div className={`font-semibold ${getDifficultyColor()}`}>
                {getDifficultyLabel()}
              </div>
              <div className="text-xs text-muted-foreground">
                {currentDifficulty === "easy" && "Simple words & short sentences"}
                {currentDifficulty === "medium" && "Moderate vocabulary & sentences"}
                {currentDifficulty === "hard" && "Advanced vocabulary & complex sentences"}
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleDifficultyUp}
              disabled={currentDifficulty === "hard"}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Harder
            </Button>
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
            <p className="text-xl text-white/90 mb-2">
              You've completed your magical adventure!
            </p>
            <p className="text-lg text-white/80 mb-6">
              Time used: {formatTime(20 * 60 - timeRemaining)} • Come back tomorrow for a brand new story!
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