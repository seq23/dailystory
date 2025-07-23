import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Home, RotateCcw, Volume2, VolumeX, TrendingUp, TrendingDown, Plus } from "lucide-react";
import type { UserInfo } from "./UserInfoForm";
import ancientBookBg from "@/assets/ancient-book-bg.jpg";

type DifficultyLevel = "easy" | "medium" | "hard";

interface StoryDisplayProps {
  userInfo: UserInfo;
  onHome: () => void;
  onNewStory: () => void;
}

export const StoryDisplay = ({ userInfo, onHome, onNewStory }: StoryDisplayProps) => {
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [isReading, setIsReading] = useState(true); // Auto-start reading
  const [timeRemaining, setTimeRemaining] = useState(20 * 60); // 20 minutes in seconds
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevel>(
    userInfo.difficultyLevel || (userInfo.age <= 7 ? "easy" : userInfo.age <= 10 ? "medium" : "hard")
  );

  // Generate age-appropriate stories with calibrated length for 20-minute reading
  const generateStory = (info: UserInfo, difficulty: DifficultyLevel): string[] => {
    const storyTemplates = {
      // Easy: 6 short pages (ages 4-7, ~3-4 minutes per page)
      easy: [
        `Hi! This is ${info.name}. ${info.name} is ${info.age} years old. ${info.name} likes the color ${info.favoriteColor}. ${info.name} is in ${info.grade} grade.${info.specialRequest ? ` ${info.name} loves ${info.specialRequest} too!` : ''}`,
        
        `One day, ${info.name} went outside to play. ${info.name} likes to ${info.hobbies}. It was a sunny day. ${info.name} saw a ${info.favoriteAnimal} in the yard.${info.specialRequest ? ` There were also ${info.specialRequest} nearby!` : ''}`,
        
        `The ${info.favoriteAnimal} looked sad. It was stuck under a big rock. "Help me!" said the ${info.favoriteAnimal}. ${info.name} wanted to help the ${info.favoriteAnimal}.${info.specialRequest ? ` Maybe the ${info.specialRequest} could help too!` : ''}`,
        
        `${info.name} pushed the rock away. The ${info.favoriteAnimal} was free! "Thank you!" said the ${info.favoriteAnimal}. "I know a secret place. Want to see?"`,
        
        `They went to a magic land. Everything was made of ${info.favoriteFood}! The trees were ${info.favoriteFood}. The houses were ${info.favoriteFood} too. It smelled so good!${info.specialRequest ? ` And there were ${info.specialRequest} everywhere!` : ''}`,
        
        `${info.name} and the ${info.favoriteAnimal} became best friends. They played all day.${info.specialRequest ? ` They had fun with the ${info.specialRequest} too!` : ''} Then ${info.name} went home. ${info.name} felt happy about the magical day. The End.`
      ],
      
      // Medium: 10 medium pages (ages 8-10, ~2 minutes per page)
      medium: [
        `Once upon a time, there was a special child named ${info.name} who was ${info.age} years old and in ${info.grade} grade. ${info.name} had a wonderful gift that made everything turn the beautiful color ${info.favoriteColor}!`,
        
        `One beautiful morning, while ${info.name} was enjoying ${info.hobbies}, they heard a small voice calling for help. Looking around carefully, they discovered a magical ${info.favoriteAnimal} stuck high up in a shimmering, golden tree.`,
        
        `"Please help me!" called the ${info.favoriteAnimal}, its voice filled with hope. ${info.name} felt sorry for their new friend and carefully used their special ${info.favoriteColor} powers to gently free the trapped animal from the branches.`,
        
        `The grateful ${info.favoriteAnimal} was so thankful that it invited ${info.name} on an amazing adventure. "I know a secret kingdom," whispered the ${info.favoriteAnimal}. "Would you like to see something truly magical?"`,
        
        `Together, they traveled through a rainbow portal and arrived in a fantastic kingdom where all the buildings were made of delicious ${info.favoriteFood}! The castle walls were ${info.favoriteFood}, and even the roads were made of ${info.favoriteFood}.`,
        
        `In this magical place, the sad people explained that their beautiful rainbow had lost all its wonderful colors. Without the rainbow, their kingdom was becoming gray and gloomy. They had been waiting for someone special to help them.${info.specialRequest ? ` They also mentioned that ${info.specialRequest} might be the key to solving the problem!` : ''}`,
        
        `${info.name} remembered what they had learned about working together to solve big problems.${info.specialRequest ? ` They also thought about how ${info.specialRequest} could help make everything better.` : ''} "We can fix this!" said ${info.name} confidently. The ${info.favoriteAnimal} nodded and smiled encouragingly.`,
        
        `With determination and kindness, ${info.name} and the ${info.favoriteAnimal} joined their powers together. Suddenly, a burst of beautiful ${info.favoriteColor} light shot up into the sky and restored the rainbow to its full, magnificent glory!`,
        
        `The grateful kingdom celebrated with singing and dancing! The people offered ${info.name} the important job of Royal ${info.dreamJob}, but ${info.name} politely explained they needed to return home to share this adventure.${info.specialRequest ? ` They promised to bring ${info.specialRequest} back with them next time!` : ''}`,
        
        `As they returned home, ${info.name} felt proud and happy. They had learned that being brave, kind, and helpful can lead to the most wonderful experiences.${info.specialRequest ? ` And they discovered that ${info.specialRequest} made everything even more magical!` : ''} ${info.name} fell asleep that night dreaming of future adventures. The End.`
      ],
      
      // Hard: 16 longer pages (ages 11+, ~1.25 minutes per page)
      hard: [
        `In a world where extraordinary things happened to ordinary children, there lived a remarkable young person named ${info.name}, who at ${info.age} years old and in ${info.grade} grade, possessed an incredible ability to transform anything they touched into the most magnificent shade of ${info.favoriteColor}.`,
        
        `On a particularly enchanting morning, while ${info.name} was enthusiastically pursuing their favorite activity of ${info.hobbies}, an urgent plea for assistance echoed through the crisp autumn air. The voice seemed to come from nowhere and everywhere at once.`,
        
        `Upon careful investigation, ${info.name} discovered an extraordinary ${info.favoriteAnimal} trapped within the crystalline branches of an ancient, mystical tree that shimmered with otherworldly energy. The creature's eyes sparkled with intelligence and desperate hope.`,
        
        `"I desperately need your help!" implored the ${info.favoriteAnimal}, its voice filled with both dignity and desperation. "I have been imprisoned here by a powerful spell, and only someone with a pure heart and special abilities can free me."`,
        
        `${info.name}, moved by deep compassion and armed with their supernatural ${info.favoriteColor} abilities, carefully and methodically worked to break the magical bonds. With each touch, the crystalline prison began to crack and dissolve.`,
        
        `The profoundly grateful ${info.favoriteAnimal} extended a formal invitation to ${info.name} for an unprecedented journey to a magnificent realm that existed beyond the boundaries of the ordinary world. "Your kindness has earned you a great adventure," it declared solemnly.`,
        
        `Through a swirling vortex of colors and stardust, they traveled to a fantastical kingdom where architectural marvels were constructed entirely from varieties of ${info.favoriteFood}, creating a landscape that was both beautiful, aromatic, and surprisingly delicious.`,
        
        `Upon arriving in this extraordinary realm, the inhabitants—who possessed an ethereal, luminescent quality—revealed a catastrophic problem that threatened their very existence. Their legendary rainbow, the source of all color, joy, and life force in their world, had mysteriously lost its vibrancy.`,
        
        `The royal council explained that without the rainbow's power, their kingdom would gradually fade into a colorless void, and all the magical creatures who depended on its energy would slowly lose their vitality and eventually disappear forever.${info.specialRequest ? ` However, ancient legends spoke of ${info.specialRequest} having the power to restore such magic.` : ''}`,
        
        `${info.name} recalled wise words about the transformative power of collaboration, determination, and unwavering friendship in the face of seemingly impossible challenges.${info.specialRequest ? ` They also remembered stories about how ${info.specialRequest} had helped heroes in the past.` : ''} These words now seemed prophetic and deeply meaningful.`,
        
        `Drawing upon every ounce of courage and wisdom they possessed, ${info.name} proposed a daring plan that would require the combined efforts of every citizen in the kingdom, along with the magical energy of the ${info.favoriteAnimal} and their own unique abilities.${info.specialRequest ? ` The plan also incorporated the mystical power of ${info.specialRequest} to make it even stronger.` : ''}`,
        
        `Through unwavering determination, creative problem-solving, and the combined strength of their extraordinary partnership, ${info.name} and the ${info.favoriteAnimal} channeled their collective energy into a spectacular ritual that lasted from dawn until dusk.${info.specialRequest ? ` The ${info.specialRequest} provided crucial magical energy throughout the entire process.` : ''}`,
        
        `As the sun reached its zenith, a magnificent explosion of ${info.favoriteColor} radiance burst forth from their joined hands, creating a brilliant beam of light that shot directly into the heart of the faded rainbow, instantly restoring its former splendor and even enhancing its beauty beyond its original glory.${info.specialRequest ? ` The ${info.specialRequest} glowed brightly, adding their own special magic to the restored rainbow.` : ''}`,
        
        `The eternally grateful citizens offered ${info.name} the prestigious position of Royal ${info.dreamJob}, along with a magnificent castle and all the treasures of the kingdom. However, ${info.name} graciously declined, explaining their responsibility to return home and share these remarkable experiences.${info.specialRequest ? ` They promised to return someday with more ${info.specialRequest} to help protect the kingdom.` : ''}`,
        
        `During their homeward journey, soaring through clouds painted with colors they had helped restore, ${info.name} reflected deeply on the profound lessons learned about courage, empathy, leadership, and the extraordinary impact that one person's kindness and determination can have on an entire world.${info.specialRequest ? ` They also marveled at how ${info.specialRequest} had made their adventure even more magical.` : ''}`,
        
        `Upon returning home, ${info.name} spent hours sharing their transformative adventure, recounting the wisdom they had gained and the magical memories they would treasure forever.${info.specialRequest ? ` They especially loved telling about how ${info.specialRequest} had helped save the day.` : ''} They fell asleep knowing that true friendship and courage make even the most incredible adventures meaningful. The End.`
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

  const handleAddTime = () => {
    setTimeRemaining(prev => prev + (10 * 60)); // Add 10 minutes
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 p-4 relative overflow-hidden">
      {/* Magical background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-32 h-32 bg-yellow-300/20 rounded-full animate-float blur-xl"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-amber-300/30 rounded-full animate-bounce-gentle blur-lg"></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-orange-300/20 rounded-full animate-float blur-lg"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-yellow-400/25 rounded-full animate-bounce-gentle blur-xl"></div>
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
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
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleAddTime}
                  title="Add 10 more minutes"
                >
                  <Plus className="w-4 h-4" />
                  +10 min
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

        {/* Ancient Book Story Container */}
        <div 
          className="relative bg-cover bg-center bg-no-repeat rounded-3xl shadow-2xl overflow-hidden min-h-[800px] flex items-center justify-center"
          style={{ 
            backgroundImage: `url(${ancientBookBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Book pages overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-yellow-50/70 to-amber-100/80 rounded-3xl"></div>
          
          {/* Book content area */}
          <div className="relative z-10 w-full max-w-4xl mx-auto p-12">
            {/* Story Progress Indicator */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center gap-2 bg-amber-100/80 backdrop-blur-sm rounded-full px-6 py-3 border-2 border-amber-300/50 shadow-lg">
                <span className="text-sm font-medium text-amber-800">
                  Page {currentParagraph + 1} of {totalParagraphs}
                </span>
                <div className="w-32 h-2 bg-amber-200 rounded-full overflow-hidden ml-4">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-600 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Story Text Area - Styled like handwritten text on ancient pages */}
            <div className="bg-yellow-50/90 backdrop-blur-sm rounded-2xl p-8 mb-8 border-2 border-amber-200/50 shadow-inner relative">
              {/* Decorative corner flourishes */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-amber-400 rounded-tl-lg opacity-60"></div>
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-amber-400 rounded-tr-lg opacity-60"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-amber-400 rounded-bl-lg opacity-60"></div>
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-amber-400 rounded-br-lg opacity-60"></div>
              
              <div className="prose prose-lg max-w-none text-center">
                <p className={`${getTextSize()} text-amber-900 font-medium leading-relaxed drop-shadow-sm`} 
                   style={{ 
                     fontFamily: 'Comic Neue, cursive',
                     textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                   }}>
                  {storyParagraphs[currentParagraph]}
                </p>
              </div>
            </div>

            {/* Difficulty Adjustment Controls - Styled like ancient scroll */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDifficultyDown}
                disabled={currentDifficulty === "easy"}
                className="bg-amber-50/80 border-amber-300 text-amber-800 hover:bg-amber-100/80"
              >
                <TrendingDown className="w-4 h-4 mr-2" />
                Easier
              </Button>
              
              <div className="text-center bg-amber-100/80 backdrop-blur-sm rounded-full px-6 py-3 border-2 border-amber-300/50">
                <div className={`font-semibold ${getDifficultyColor()}`}>
                  {getDifficultyLabel()}
                </div>
                <div className="text-xs text-amber-700">
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
                className="bg-amber-50/80 border-amber-300 text-amber-800 hover:bg-amber-100/80"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Harder
              </Button>
            </div>

            {/* Page Navigation - Styled like ancient book controls */}
            <div className="flex gap-6 justify-center">
              <Button
                variant="secondary"
                size="lg"
                onClick={handlePrevious}
                disabled={currentParagraph === 0}
                className="flex-1 max-w-xs bg-amber-100/80 border-2 border-amber-300 text-amber-800 hover:bg-amber-200/80 backdrop-blur-sm"
              >
                ← Previous Page
              </Button>
              
              <Button
                variant="default"
                size="lg"
                onClick={handleNext}
                disabled={currentParagraph === totalParagraphs - 1}
                className="flex-1 max-w-xs bg-gradient-to-r from-amber-600 to-yellow-600 text-white hover:from-amber-700 hover:to-yellow-700 shadow-lg"
              >
                {currentParagraph === totalParagraphs - 1 ? "Story Complete!" : "Next Page →"}
              </Button>
            </div>
          </div>
        </div>

        {/* Story Completion - Magical scroll appearance */}
        {currentParagraph === totalParagraphs - 1 && (
          <div className="mt-8 bg-gradient-to-br from-amber-100 to-yellow-100 border-4 border-amber-300 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
            {/* Magical sparkle effects */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 left-8 w-4 h-4 bg-yellow-400 rounded-full animate-bounce-gentle"></div>
              <div className="absolute top-12 right-12 w-3 h-3 bg-amber-400 rounded-full animate-float"></div>
              <div className="absolute bottom-8 left-12 w-5 h-5 bg-yellow-500 rounded-full animate-bounce-gentle"></div>
              <div className="absolute bottom-4 right-8 w-4 h-4 bg-amber-500 rounded-full animate-float"></div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-amber-800 mb-4 drop-shadow-sm">
                🎉 Congratulations, {userInfo.name}! 🎉
              </h2>
              <p className="text-xl text-amber-700 mb-2">
                You've completed your magical adventure!
              </p>
              <p className="text-lg text-amber-600 mb-6">
                Time used: {formatTime(20 * 60 - timeRemaining)} • Come back tomorrow for a brand new story!
              </p>
              <div className="flex gap-4 justify-center">
                <Button 
                  variant="default" 
                  size="xl" 
                  onClick={onNewStory}
                  className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white hover:from-amber-700 hover:to-yellow-700 shadow-lg"
                >
                  Create Another Story
                </Button>
                <Button 
                  variant="secondary" 
                  size="xl" 
                  onClick={onHome}
                  className="bg-amber-100 border-2 border-amber-300 text-amber-800 hover:bg-amber-200"
                >
                  Back to Home
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};