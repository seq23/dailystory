import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Home, RotateCcw, Volume2, VolumeX, TrendingUp, TrendingDown, Plus } from "lucide-react";
import type { UserInfo } from "./UserInfoForm";
import ancientBookBg from "@/assets/ancient-book-bg.jpg";
import illustration1 from "@/assets/story-illustration-1.jpg";
import illustration2 from "@/assets/story-illustration-2.jpg"; 
import illustration3 from "@/assets/story-illustration-3.jpg";
import { FloatingTimer } from "./FloatingTimer";

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
  const [storyExtensions, setStoryExtensions] = useState(0); // Track how many 10-min extensions added
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevel>(
    userInfo.difficultyLevel || (userInfo.age <= 7 ? "easy" : userInfo.age <= 10 ? "medium" : "hard")
  );

  // Generate age-appropriate stories with calibrated length for 20-minute reading
  const generateStory = (info: UserInfo, difficulty: DifficultyLevel): string[] => {
    const baseStoryTemplates = {
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
    
    return baseStoryTemplates[difficulty];
  };

  // Generate additional story content for time extensions
  const generateExtendedContent = (info: UserInfo, difficulty: DifficultyLevel, extensionNumber: number): string[] => {
    const extensionTemplates = {
      easy: [
        `The next day, ${info.name} went back to the magic land. The ${info.favoriteAnimal} was there waiting! "Want to see more?" asked the ${info.favoriteAnimal}.`,
        `They found a playground made of ${info.favoriteFood}! The swings were ${info.favoriteFood} and the slide was too. ${info.name} had so much fun playing.`,
        `Then they met other animals who wanted to be friends. There was a nice ${info.favoriteAnimal === 'cat' ? 'dog' : 'cat'} and a funny bird. They all played together happily.`
      ],
      medium: [
        `As ${info.name} settled back into their normal routine, they discovered that their magical adventure had given them new abilities. They could now sense when others needed help, just like the ${info.favoriteAnimal} had needed help.`,
        `One afternoon, ${info.name} noticed their neighbor looking sad and worried. Using their newfound wisdom and the lessons learned from their magical journey, they offered kindness and assistance.`,
        `The neighbor explained that their garden was dying and they didn't know why. ${info.name} remembered the power of ${info.favoriteColor} magic and gently touched the wilting plants.`,
        `Miraculously, the garden began to bloom with vibrant flowers in every color imaginable! The neighbor was amazed and grateful, and ${info.name} realized their adventure had taught them to help others.`,
        `That evening, ${info.name} looked up at the sky and saw a small rainbow forming. The ${info.favoriteAnimal} appeared beside them and smiled. "Your kindness is spreading magic everywhere," it said warmly.`
      ],
      hard: [
        `In the weeks following their extraordinary adventure, ${info.name} began to notice subtle changes in their ordinary world. The experience had awakened a deeper awareness of the interconnectedness of all living things and the responsibility that comes with great power.`,
        `During a particularly challenging day at school, ${info.name} encountered a situation that required the same courage and wisdom they had demonstrated in the magical kingdom. A new student was being treated unfairly by others.`,
        `Drawing upon the lessons learned about standing up for those who cannot stand up for themselves, ${info.name} intervened with compassion and determination, creating an atmosphere of inclusion and understanding.`,
        `The transformation in their school environment was remarkable. Other students began following ${info.name}'s example, creating a community built on mutual respect and kindness, much like the kingdom they had helped restore.`,
        `That night, as ${info.name} reflected on the day's events, they understood that the true magic wasn't in the fantastic realm they had visited, but in the ability to bring positive change to the world around them through consistent acts of courage and compassion.`,
        `The ${info.favoriteAnimal} appeared one more time in their dreams, offering a final piece of wisdom: "The greatest adventures are not in distant magical lands, but in the everyday moments where you choose to make a difference."`,
        `${info.name} awoke with a profound sense of purpose, knowing that their story was just beginning and that every day offered new opportunities to create magic through kindness, courage, and the unwavering belief that one person can indeed change the world.`,
        `Years later, ${info.name} would look back on that transformative experience as the moment they truly understood their place in the world and their responsibility to use their gifts in service of others, carrying forward the lessons of the magical kingdom into every aspect of their life.`
      ]
    };
    
    const templates = extensionTemplates[difficulty];
    const startIndex = (extensionNumber - 1) * getExtensionPageCount(difficulty);
    return templates.slice(startIndex, startIndex + getExtensionPageCount(difficulty)) || templates;
  };

  // Calculate pages to add per 10-minute extension based on difficulty
  const getExtensionPageCount = (difficulty: DifficultyLevel): number => {
    switch (difficulty) {
      case "easy": return 3; // ~3.5 min per page, so 3 pages for 10 min
      case "medium": return 5; // ~2 min per page, so 5 pages for 10 min  
      case "hard": return 8; // ~1.25 min per page, so 8 pages for 10 min
      default: return 5;
    }
  };

  // Combine base story with any extensions
  const getCompleteStory = (): string[] => {
    const baseStory = generateStory(userInfo, currentDifficulty);
    let completeStory = [...baseStory];
    
    // Add extended content for each 10-minute extension
    for (let i = 1; i <= storyExtensions; i++) {
      const extensionContent = generateExtendedContent(userInfo, currentDifficulty, i);
      completeStory = [...completeStory, ...extensionContent];
    }
    
    return completeStory;
  };

  const storyParagraphs = getCompleteStory();
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
    setStoryExtensions(prev => prev + 1); // Add corresponding story content
  };

  const handleDifficultyUp = () => {
    if (currentDifficulty === "easy") setCurrentDifficulty("medium");
    else if (currentDifficulty === "medium") setCurrentDifficulty("hard");
    setCurrentParagraph(0); // Reset to beginning with new difficulty
    setStoryExtensions(0); // Reset extensions when difficulty changes
  };

  const handleDifficultyDown = () => {
    if (currentDifficulty === "hard") setCurrentDifficulty("medium");
    else if (currentDifficulty === "medium") setCurrentDifficulty("easy");
    setCurrentParagraph(0); // Reset to beginning with new difficulty
    setStoryExtensions(0); // Reset extensions when difficulty changes
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

  // Get current illustration based on story progress
  const getCurrentIllustration = () => {
    if (progress <= 33) return illustration1;
    if (progress <= 66) return illustration2;
    return illustration3;
  };

  // Get current chapter based on story progress
  const getCurrentChapter = () => {
    if (progress <= 33) return 1;
    if (progress <= 66) return 2;
    return 3;
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative overflow-hidden"
      style={{ 
        backgroundImage: `url(${ancientBookBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Book pages overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/70 via-yellow-50/60 to-amber-100/70"></div>
      
      {/* Magical floating elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-yellow-300/30 rounded-full animate-float blur-xl"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-amber-300/40 rounded-full animate-bounce-gentle blur-lg"></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-orange-300/30 rounded-full animate-float blur-lg"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-yellow-400/35 rounded-full animate-bounce-gentle blur-xl"></div>
      </div>

      {/* Main content positioned as if on book pages */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header positioned at top of book */}
        <div className="flex items-center justify-between p-6 bg-amber-100/60 backdrop-blur-sm border-b border-amber-300/30">
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

        {/* Story content positioned on book pages */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-5xl mx-auto">
            {/* Story Progress Indicator - floating above the page */}
            <div className="flex items-center justify-center mb-12">
              <div className="flex items-center gap-2 bg-amber-100/90 backdrop-blur-sm rounded-full px-8 py-4 border-2 border-amber-300/60 shadow-xl">
                <span className="text-lg font-medium text-amber-800">
                  Page {currentParagraph + 1} of {totalParagraphs}
                </span>
                <div className="w-40 h-3 bg-amber-200 rounded-full overflow-hidden ml-6">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-600 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Two-column responsive layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12 max-w-7xl mx-auto">
              {/* Illustration Column */}
              <div className="flex flex-col items-center space-y-6">
                {/* Chapter Indicator */}
                <div className="bg-amber-100/90 backdrop-blur-sm rounded-2xl px-6 py-3 border-2 border-amber-400/60 shadow-lg">
                  <span className="text-lg font-bold text-amber-800">
                    Chapter {getCurrentChapter()} of 3
                  </span>
                </div>
                
                {/* Illuminated Manuscript Frame */}
                <div className="relative bg-amber-50/95 p-6 rounded-3xl border-4 border-amber-400/80 shadow-2xl backdrop-blur-sm">
                  {/* Ornate corner decorations */}
                  <div className="absolute -top-2 -left-2 w-8 h-8 bg-amber-600 rounded-full border-2 border-amber-300"></div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-600 rounded-full border-2 border-amber-300"></div>
                  <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-amber-600 rounded-full border-2 border-amber-300"></div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-600 rounded-full border-2 border-amber-300"></div>
                  
                  {/* Medieval manuscript decorative elements */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-2 border-amber-500 rounded-tl-xl opacity-60"></div>
                  <div className="absolute top-4 right-4 w-6 h-6 border-2 border-amber-500 rounded-tr-xl opacity-60"></div>
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-2 border-amber-500 rounded-bl-xl opacity-60"></div>
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-2 border-amber-500 rounded-br-xl opacity-60"></div>
                  
                  {/* The Illustration */}
                  <div className="relative overflow-hidden rounded-2xl border-3 border-amber-300">
                    <img 
                      src={getCurrentIllustration()} 
                      alt={`Chapter ${getCurrentChapter()} illustration`}
                      className="w-full h-auto max-w-md mx-auto shadow-lg transition-transform duration-300 hover:scale-105"
                      style={{ aspectRatio: '3/4' }}
                    />
                    {/* Magical overlay effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-100/20 via-transparent to-amber-100/20 pointer-events-none"></div>
                  </div>
                  
                  {/* Decorative flourish below image */}
                  <div className="mt-4 flex justify-center">
                    <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Story Text Column */}
              <div className="flex flex-col justify-center">
                <div className="bg-yellow-50/95 backdrop-blur-sm rounded-3xl p-8 lg:p-12 border-3 border-amber-300/60 shadow-2xl relative">
                  {/* Ornate corner decorations */}
                  <div className="absolute top-6 left-6 w-8 h-8 border-t-3 border-l-3 border-amber-500 rounded-tl-2xl opacity-70"></div>
                  <div className="absolute top-6 right-6 w-8 h-8 border-t-3 border-r-3 border-amber-500 rounded-tr-2xl opacity-70"></div>
                  <div className="absolute bottom-6 left-6 w-8 h-8 border-b-3 border-l-3 border-amber-500 rounded-bl-2xl opacity-70"></div>
                  <div className="absolute bottom-6 right-6 w-8 h-8 border-b-3 border-r-3 border-amber-500 rounded-br-2xl opacity-70"></div>
                  
                  {/* Central ornamental flourish */}
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-60"></div>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-60"></div>
                  
                  <div className="prose prose-lg max-w-none">
                    <p className={`${getTextSize()} text-amber-900 font-medium leading-relaxed drop-shadow-sm animate-fade-in text-left lg:text-justify`} 
                       style={{ 
                         fontFamily: 'Comic Neue, cursive',
                         textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                         lineHeight: '1.8'
                       }}>
                      {storyParagraphs[currentParagraph]}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Difficulty controls - floating like magical runes */}
            <div className="flex items-center justify-center gap-6 mb-12">
              <Button
                variant="outline"
                size="lg"
                onClick={handleDifficultyDown}
                disabled={currentDifficulty === "easy"}
                className="bg-amber-50/90 border-2 border-amber-400 text-amber-800 hover:bg-amber-100/90 shadow-lg backdrop-blur-sm px-6 py-3"
              >
                <TrendingDown className="w-5 h-5 mr-2" />
                Easier
              </Button>
              
              <div className="text-center bg-amber-100/90 backdrop-blur-sm rounded-2xl px-8 py-4 border-3 border-amber-400/70 shadow-xl">
                <div className={`text-lg font-bold ${getDifficultyColor()}`}>
                  {getDifficultyLabel()}
                </div>
                <div className="text-sm text-amber-700 mt-1">
                  {currentDifficulty === "easy" && "Simple words & short sentences"}
                  {currentDifficulty === "medium" && "Moderate vocabulary & sentences"}
                  {currentDifficulty === "hard" && "Advanced vocabulary & complex sentences"}
                </div>
              </div>
              
              <Button
                variant="outline"
                size="lg"
                onClick={handleDifficultyUp}
                disabled={currentDifficulty === "hard"}
                className="bg-amber-50/90 border-2 border-amber-400 text-amber-800 hover:bg-amber-100/90 shadow-lg backdrop-blur-sm px-6 py-3"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                Harder
              </Button>
            </div>

            {/* Page navigation - styled like turning pages of the book */}
            <div className="flex gap-8 justify-center">
              <Button
                variant="secondary"
                size="xl"
                onClick={handlePrevious}
                disabled={currentParagraph === 0}
                className="px-10 py-4 bg-amber-100/90 border-3 border-amber-400 text-amber-800 hover:bg-amber-200/90 backdrop-blur-sm shadow-xl text-lg font-semibold hover:scale-105 transition-all duration-200"
              >
                ← Previous Page
              </Button>
              
              <Button
                variant="default"
                size="xl"
                onClick={handleNext}
                disabled={currentParagraph === totalParagraphs - 1}
                className="px-10 py-4 bg-gradient-to-r from-amber-600 to-yellow-600 text-white hover:from-amber-700 hover:to-yellow-700 shadow-xl text-lg font-semibold hover:scale-105 transition-all duration-200"
              >
                {currentParagraph === totalParagraphs - 1 ? "Story Complete! ✨" : "Next Page →"}
              </Button>
            </div>
          </div>
        </div>

        {/* Story completion overlay - appears over the book */}
        {currentParagraph === totalParagraphs - 1 && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-20 animate-fade-in">
            <div className="bg-gradient-to-br from-amber-100 to-yellow-100 border-4 border-amber-400 rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden max-w-2xl mx-8 animate-scale-in">
              {/* Magical celebration sparkles */}
              <div className="absolute inset-0 opacity-30 pointer-events-none">
                <div className="absolute top-6 left-12 w-6 h-6 bg-yellow-400 rounded-full animate-bounce-gentle"></div>
                <div className="absolute top-16 right-16 w-4 h-4 bg-amber-400 rounded-full animate-float"></div>
                <div className="absolute bottom-12 left-16 w-8 h-8 bg-yellow-500 rounded-full animate-bounce-gentle"></div>
                <div className="absolute bottom-6 right-12 w-5 h-5 bg-amber-500 rounded-full animate-float"></div>
                <div className="absolute top-1/2 left-8 w-3 h-3 bg-yellow-300 rounded-full animate-bounce-gentle"></div>
                <div className="absolute top-1/3 right-8 w-4 h-4 bg-amber-300 rounded-full animate-float"></div>
              </div>
              
              <div className="relative z-10">
                <h2 className="text-5xl font-bold text-amber-800 mb-6 drop-shadow-sm animate-bounce-gentle">
                  🎉 Congratulations, {userInfo.name}! 🎉
                </h2>
                <p className="text-2xl text-amber-700 mb-4 font-semibold">
                  You've completed your magical adventure!
                </p>
                <p className="text-lg text-amber-600 mb-8">
                  Time used: {formatTime(20 * 60 - timeRemaining)} • Come back tomorrow for a brand new story!
                </p>
                <div className="flex gap-6 justify-center">
                  <Button 
                    variant="default" 
                    size="xl" 
                    onClick={onNewStory}
                    className="px-8 py-4 bg-gradient-to-r from-amber-600 to-yellow-600 text-white hover:from-amber-700 hover:to-yellow-700 shadow-xl text-lg font-semibold hover:scale-105 transition-all duration-200"
                  >
                    Create Another Story
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="xl" 
                    onClick={onHome}
                    className="px-8 py-4 bg-amber-100 border-3 border-amber-400 text-amber-800 hover:bg-amber-200 text-lg font-semibold hover:scale-105 transition-all duration-200"
                  >
                    Back to Home
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Floating Timer Component */}
        <FloatingTimer
          timeRemaining={timeRemaining}
          isReading={isReading}
          onToggleReading={() => setIsReading(!isReading)}
          onAddTime={handleAddTime}
        />
      </div>
    </div>
  );
};