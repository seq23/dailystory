import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Home, RotateCcw, Volume2, Timer, Play, Pause, Minus, X } from "lucide-react";

import type { UserInfo, SessionStats } from "@/types";
import { InteractiveAudioReading } from "@/components/InteractiveAudioReading";
import { adaptiveStoryGenerator } from "@/services/adaptiveStoryGenerator";
import { APP_CONFIG } from "@/constants/app";
import { useToast } from "@/hooks/use-toast";

// Import fallback illustrations
import illustration1 from "@/assets/story-illustration-1.jpg";
import illustration2 from "@/assets/story-illustration-2.jpg";
import illustration3 from "@/assets/story-illustration-3.jpg";
import illustration4 from "@/assets/story-illustration-4.jpg";
import illustration5 from "@/assets/story-illustration-5.jpg";

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
  const { toast } = useToast();
  
  // Story state
  const [story, setStory] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Session state
  const [timeRemaining, setTimeRemaining] = useState(APP_CONFIG.FREE_SESSION_DURATION);
  const [sessionStartTime] = useState<Date>(new Date());
  const [wordsRead, setWordsRead] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showFinishCountdown, setShowFinishCountdown] = useState(false);

  // Fallback illustrations
  const illustrations = [illustration1, illustration2, illustration3, illustration4, illustration5];

  // Generate story on component mount
  useEffect(() => {
    const generateStory = async () => {
      try {
        setIsLoading(true);
        
        const storyConfig = {
          age: userInfo.age,
          gradeLevel: userInfo.gradeLevel || userInfo.grade,
          readingLevel: (userInfo.readingLevel || 'beginner') as 'beginner' | 'elementary' | 'intermediate' | 'advanced',
          interests: userInfo.interests || [userInfo.hobbies || 'adventure'],
          theme: 'adventure'
        };

        const generatedStory = await adaptiveStoryGenerator.generateStory(storyConfig);
        setStory(generatedStory.pages);
        setWordsRead(generatedStory.wordCount);
        
        toast({
          title: "Story Ready! 📚",
          description: `A new ${generatedStory.readingLevel} level story has been created just for you!`,
          duration: 3000,
        });
        
      } catch (error) {
        console.error('Failed to generate story:', error);
        
        // Fallback story based on age
        const fallbackStory = userInfo.age <= 5 ? [
          "The cat sat on the mat.",
          "The cat was happy.",
          "The cat played with a ball.",
          "The ball was red.",
          "The cat ran fast.",
          "The end."
        ] : userInfo.age <= 8 ? [
          "Once upon a time, there was a brave little mouse named Max.",
          "Max lived in a cozy hole under the kitchen.",
          "One day, Max decided to explore the big house.",
          "He found many interesting things.",
          "Max made new friends along the way.",
          "And they all lived happily ever after!"
        ] : [
          "In a small village nestled between rolling hills, lived a curious girl named Luna.",
          "She had always wondered about the mysterious forest that bordered her town.",
          "When strange lights began appearing among the trees each night, Luna knew she had to investigate.",
          "With her backpack and flashlight, she ventured into the forest.",
          "There, she discovered a magical secret that would change everything.",
          "Luna's adventure was just beginning!"
        ];
        
        setStory(fallbackStory);
        setWordsRead(fallbackStory.join(' ').split(' ').length);
        
        toast({
          title: "Using Sample Story",
          description: "Generated a story for you to enjoy reading!",
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    generateStory();
  }, [userInfo, toast]);

  // Timer countdown (with pause support)
  useEffect(() => {
    if (timeRemaining <= 0 || isPaused) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSessionEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isPaused]);

  const handleSessionEnd = () => {
    const sessionStats: SessionStats = {
      wordsRead,
      timeSpent: APP_CONFIG.FREE_SESSION_DURATION - timeRemaining,
      pagesRead: currentPage + 1,
      startTime: sessionStartTime.getTime(),
      accuracy: 100 // Placeholder
    };
    
    onSessionEnded(sessionStats);
  };

  const handleNewStory = () => {
    setCurrentPage(0);
    setTimeRemaining(APP_CONFIG.FREE_SESSION_DURATION);
    onNewStory();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Creating Your Story...</h2>
          <p className="text-gray-600">Personalizing content for {userInfo.name}</p>
        </div>
      </div>
    );
  }

  const currentStory = story[currentPage] || "Loading...";
  const progress = ((currentPage + 1) / story.length) * 100;
  const currentIllustration = illustrations[currentPage % illustrations.length];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Professional Premium Timer Display */}
      {timeRemaining > 0 && (
        <div className="fixed bottom-6 right-6 sm:right-8 z-50 flex flex-col items-center gap-4" style={{ marginRight: 'max(1rem, env(safe-area-inset-right))', marginBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          
          {/* Main Timer Circle - Professional & Larger */}
          <div className="relative">
            {/* Main Timer Circle */}
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-white to-gray-50 backdrop-blur-sm rounded-full shadow-2xl border-4 border-white/80 flex items-center justify-center ring-4 ring-green-500/20">
              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-500/10 to-transparent animate-pulse"></div>
              
              {/* Progress Circle */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
                {/* Background circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="hsl(var(--muted))"
                  strokeWidth="6"
                  fill="none"
                  opacity="0.3"
                />
                {/* Progress circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke={timeRemaining <= 300 ? "#ef4444" : "#22c55e"}
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 50}
                  strokeDashoffset={2 * Math.PI * 50 - ((timeRemaining / APP_CONFIG.FREE_SESSION_DURATION) * 2 * Math.PI * 50)}
                  className="transition-all duration-1000 ease-out filter drop-shadow-lg"
                  strokeLinecap="round"
                />
              </svg>
              
              {/* Time Display */}
              <div className="relative z-10 text-center">
                <div className={`text-sm sm:text-lg font-bold tracking-tight ${timeRemaining <= 300 ? 'text-red-500' : 'text-green-600'}`}>
                  {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                  Premium
                </div>
              </div>
            </div>
          </div>
          
          {/* 3 Control Buttons Only */}
          <div className="flex gap-4 items-center">
            
            {/* 1. Pause/Resume Button - Center */}
            <Button
              size="lg"
              onClick={() => setIsPaused(!isPaused)}
              className="bg-gradient-to-b from-white to-gray-50 backdrop-blur-sm border-2 border-green-500/30 text-green-600 hover:bg-green-500 hover:text-white shadow-xl w-12 h-12 sm:w-16 sm:h-16 rounded-full p-0 transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:border-green-500/50"
            >
              {isPaused ? <Play className="w-4 h-4 sm:w-6 sm:h-6" /> : <Pause className="w-4 h-4 sm:w-6 sm:h-6" />}
            </Button>
            
            {/* 2. Reduce Time Button - Left */}
            <Button
              variant="outline"
              size="lg"
              disabled={timeRemaining <= 300}
              className={`bg-gradient-to-b from-white to-orange-50 backdrop-blur-sm border-2 border-orange-400/50 text-orange-600 hover:bg-orange-500 hover:text-white shadow-lg w-10 h-10 sm:w-14 sm:h-14 rounded-full p-0 transition-all duration-300 hover:scale-110 hover:shadow-xl ${
                timeRemaining <= 300 
                  ? 'opacity-50 cursor-not-allowed' 
                  : ''
              }`}
              onClick={() => {
                if (timeRemaining > 300) {
                  setTimeRemaining(prev => Math.max(300, prev - 300));
                }
              }}
            >
              <Minus className="w-3 h-3 sm:w-5 sm:h-5" />
            </Button>

            {/* 3. End Session Button - Right */}
            <Button
              variant="outline"
              size="lg"
              className="bg-gradient-to-b from-white to-red-50 backdrop-blur-sm border-2 border-red-400/50 text-red-600 hover:bg-red-500 hover:text-white shadow-lg w-10 h-10 sm:w-14 sm:h-14 rounded-full p-0 transition-all duration-300 hover:scale-110 hover:shadow-xl"
              onClick={() => {
                setTimeRemaining(0);
                onSessionEnded({
                  timeSpent: APP_CONFIG.FREE_SESSION_DURATION - timeRemaining,
                  wordsRead,
                  pagesRead: currentPage + 1,
                  startTime: sessionStartTime.getTime(),
                  accuracy: 100
                });
              }}
            >
              <X className="w-3 h-3 sm:w-5 sm:h-5" />
            </Button>
          </div>
          
          {/* Premium Badge */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full shadow-lg border-2 border-white/50 text-xs font-bold">
            ✨ UNLIMITED
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-gray-800">{userInfo.name}'s Reading Adventure</h1>
                <p className="text-sm text-gray-600">Page {currentPage + 1} of {story.length}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button onClick={handleNewStory} variant="outline" size="sm">
                <RotateCcw className="w-4 h-4 mr-2" />
                New Story
              </Button>
              <Button onClick={onHome} variant="outline" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Story Illustration */}
          <div className="order-2 lg:order-1">
            <Card className="h-[500px] lg:h-[600px]">
              <CardContent className="p-6 h-full">
                <img 
                  src={currentIllustration}
                  alt={`Story illustration for page ${currentPage + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              </CardContent>
            </Card>
          </div>

          {/* Story Text */}
          <div className="order-1 lg:order-2">
            <Card className="h-[500px] lg:h-[600px] flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col">
                {/* Progress Bar */}
                <div className="mb-6">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    Reading Progress: {Math.round(progress)}%
                  </p>
                </div>

                {/* Story Text */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <p className={`${
                      userInfo.age <= 5 ? 'text-3xl' : 
                      userInfo.age <= 8 ? 'text-2xl' : 
                      'text-xl'
                    } font-medium leading-relaxed text-gray-800 max-w-md mx-auto`}>
                      {currentStory}
                    </p>
                  </div>
                </div>

                {/* Audio Controls */}
                <div className="mt-6">
                  <InteractiveAudioReading 
                    text={currentStory}
                    userInfo={userInfo}
                    isEnabled={true}
                  />
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center mt-6">
                  <Button 
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    variant="outline"
                  >
                    ← Previous
                  </Button>
                  
                  <span className="text-sm font-medium text-gray-600">
                    {currentPage + 1} / {story.length}
                  </span>
                  
                  <Button 
                    onClick={() => setCurrentPage(Math.min(story.length - 1, currentPage + 1))}
                    disabled={currentPage >= story.length - 1}
                    variant="outline"
                  >
                    Next →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StoryDisplay;