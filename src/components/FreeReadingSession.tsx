import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Timer, Star, Crown, Sparkles, TrendingUp, Award, Clock } from "lucide-react";
import type { UserInfo, SessionStats } from "@/types";
import { InteractiveAudioReading } from "@/components/InteractiveAudioReading";
import { adaptiveStoryGenerator } from "@/services/adaptiveStoryGenerator";
import { APP_CONFIG } from "@/constants/app";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

// Import fallback illustrations
import illustration1 from "@/assets/story-illustration-1.jpg";
import illustration2 from "@/assets/story-illustration-2.jpg";
import illustration3 from "@/assets/story-illustration-3.jpg";
import illustration4 from "@/assets/story-illustration-4.jpg";
import illustration5 from "@/assets/story-illustration-5.jpg";

interface FreeReadingSessionProps {
  userInfo: UserInfo;
  onUpgrade: () => void;
  onCreateAccount: () => void;
}

export const FreeReadingSession: React.FC<FreeReadingSessionProps> = ({
  userInfo,
  onUpgrade,
  onCreateAccount,
}) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  
  // Story state
  const [story, setStory] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [currentDifficulty, setCurrentDifficulty] = useState<'beginner' | 'elementary' | 'intermediate' | 'advanced'>(
    userInfo.readingAbility === 'easy' ? 'beginner' :
    userInfo.readingAbility === 'medium' ? 'elementary' :
    userInfo.readingAbility === 'hard' ? 'intermediate' : 'advanced'
  );
  
  // Session state
  const [timeRemaining, setTimeRemaining] = useState(APP_CONFIG.FREE_SESSION_DURATION);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [wordsRead, setWordsRead] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showProgressReport, setShowProgressReport] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);

  // Celebration state
  const [celebrationStep, setCelebrationStep] = useState(0); // 0: animation, 1: shaking, 2: progress
  const audioContextRef = useRef<AudioContext | null>(null);
  const celebrationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fallback illustrations
  const illustrations = [illustration1, illustration2, illustration3, illustration4, illustration5];

  // Difficulty level mappings
  const difficultyLevels = {
    beginner: { label: 'PreK-1st Grade', author: 'Dr. Seuss', color: 'green' },
    elementary: { label: '2nd-3rd Grade', author: 'Junie B. Jones', color: 'blue' },
    intermediate: { label: '4th-5th Grade', author: 'Judy Blume', color: 'orange' },
    advanced: { label: '6th-12th Grade', author: 'J.K. Rowling', color: 'purple' }
  };

  // Generate story on component mount
  useEffect(() => {
    const generateStory = async () => {
      try {
        setIsLoading(true);
        
        console.log('Generating story for user:', userInfo.name);
        
        const storyConfig = {
          age: userInfo.age,
          gradeLevel: userInfo.gradeLevel || userInfo.grade,
          readingLevel: currentDifficulty,
          interests: [userInfo.hobbies, userInfo.favoriteAnimal, userInfo.specialRequest].filter(Boolean),
          theme: userInfo.specialRequest || 'adventure'
        };

        console.log('Story config:', storyConfig);

        const generatedStory = await adaptiveStoryGenerator.generateStory(storyConfig);
        
        console.log('Generated story:', generatedStory);
        
        // Ensure we have exactly 10 pages
        const targetPages = 10;
        let pages = generatedStory.pages;
        
        if (pages.length < targetPages) {
          // Pad with additional content if needed
          const additionalPages = targetPages - pages.length;
          for (let i = 0; i < additionalPages; i++) {
            pages.push(`The adventure continues...`);
          }
        } else if (pages.length > targetPages) {
          // Trim to exactly 10 pages
          pages = pages.slice(0, targetPages);
        }
        
        setStory(pages);
        setWordsRead(generatedStory.wordCount);
        
      } catch (error) {
        console.error('Failed to generate story:', error);
        toast({
          title: "Story Generation Error",
          description: "Using a simple story for your reading session.",
          variant: "default"
        });
        
        // Enhanced fallback story that's exactly 10 pages
        const fallbackStory = userInfo.age <= 5 ? [
          `Hello ${userInfo.name}! Let's read together.`,
          "The cat sat on the mat.",
          "The cat was happy and purr.",
          "The cat played with a red ball.",
          "The ball rolled and rolled.",
          "The cat ran fast to catch it.",
          "They played in the sunny yard.",
          "Soon it was time to rest.",
          "The cat curled up for a nap.",
          "The end. Great reading!"
        ] : userInfo.age <= 8 ? [
          `Hi ${userInfo.name}! Here's your adventure.`,
          "Once upon a time, there was a brave little mouse named Max.",
          "Max lived in a cozy hole under the kitchen floor.",
          "One day, Max decided to explore the big house above.",
          "He found many interesting things on his journey.",
          "Max made new friends along the way.",
          "Together they solved puzzles and had fun.",
          "They shared snacks and told stories.",
          "When the day ended, they were all happy.",
          "And they all lived happily ever after!"
        ] : [
          `Welcome ${userInfo.name}! Your story begins now.`,
          "In a small village nestled between rolling hills, lived a curious girl named Luna.",
          "She had always wondered about the mysterious forest that bordered her town.",
          "When strange lights began appearing among the trees each night, Luna knew she had to investigate.",
          "With her backpack and flashlight, she ventured into the forest one evening.",
          "There, she discovered a magical secret that would change everything she thought she knew.",
          "The lights were coming from a hidden community of friendly forest creatures.",
          "They had been waiting for someone like Luna to help them solve an important problem.",
          "Together, they worked to protect their magical home from danger.",
          "Luna's adventure was just beginning, and she couldn't wait for tomorrow!"
        ];
        
        setStory(fallbackStory);
        setWordsRead(fallbackStory.join(' ').split(' ').length);
      } finally {
        setIsLoading(false);
      }
    };

    generateStory();
  }, [userInfo, toast, currentDifficulty]);

  // Function to regenerate story with new difficulty
  const changeDifficulty = async (newDifficulty: typeof currentDifficulty) => {
    if (newDifficulty === currentDifficulty) return;
    
    setCurrentDifficulty(newDifficulty);
    setCurrentPage(0); // Reset to first page
    
    toast({
      title: `Switching to ${difficultyLevels[newDifficulty].label}`,
      description: `Story style inspired by ${difficultyLevels[newDifficulty].author}`,
      duration: 3000,
    });
  };

  // Start session when user begins reading
  const startSession = () => {
    if (!sessionStarted) {
      setSessionStarted(true);
      setSessionStartTime(new Date());
      toast({
        title: "Free Reading Session Started! 📚",
        description: "You have 20 minutes of free reading time. Enjoy!",
        duration: 4000,
      });
    }
  };

  // Timer countdown (only starts when session is started)
  useEffect(() => {
    if (!sessionStarted || timeRemaining <= 0 || sessionEnded) return;

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
  }, [sessionStarted, timeRemaining, sessionEnded]);

  // Celebration animations and sounds
  const startCelebration = () => {
    setShowCelebration(true);
    setCelebrationStep(0);
    
    // Play celebration sound
    playJoyfulMelody();
    
    // Step 1: Confetti animation (3 seconds)
    celebrationTimerRef.current = setTimeout(() => {
      setCelebrationStep(1);
      
      // Step 2: Screen shaking (2 seconds)
      celebrationTimerRef.current = setTimeout(() => {
        setCelebrationStep(2);
        setShowProgressReport(true);
        
        // Final step: Show progress report (1 second delay)
        celebrationTimerRef.current = setTimeout(() => {
          setShowCelebration(false);
        }, 1000);
      }, 2000);
    }, 3000);
  };

  const playJoyfulMelody = () => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioContext = audioContextRef.current;
      
      // Create a joyful celebration melody
      const playNote = (frequency: number, startTime: number, duration: number, volume: number = 0.1) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, startTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };
      
      // Play "Happy Birthday" style melody
      const now = audioContext.currentTime;
      const notes = [
        { freq: 523.25, time: 0, duration: 0.3 },    // C5
        { freq: 523.25, time: 0.3, duration: 0.2 },  // C5
        { freq: 587.33, time: 0.5, duration: 0.4 },  // D5
        { freq: 523.25, time: 0.9, duration: 0.4 },  // C5
        { freq: 698.46, time: 1.3, duration: 0.4 },  // F5
        { freq: 659.25, time: 1.7, duration: 0.8 },  // E5
        
        // Repeat pattern higher
        { freq: 783.99, time: 2.7, duration: 0.3 },  // G5
        { freq: 783.99, time: 3.0, duration: 0.2 },  // G5
        { freq: 880.00, time: 3.2, duration: 0.4 },  // A5
        { freq: 783.99, time: 3.6, duration: 0.4 },  // G5
        { freq: 1046.50, time: 4.0, duration: 0.4 }, // C6
        { freq: 987.77, time: 4.4, duration: 0.8 },  // B5
      ];
      
      notes.forEach(note => {
        playNote(note.freq, now + note.time, note.duration);
      });
      
      // Clean up
      setTimeout(() => {
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      }, 6000);
    } catch (error) {
      console.error('Audio playback failed:', error);
    }
  };

  const handleSessionEnd = () => {
    if (sessionEnded) return;
    
    setSessionEnded(true);
    startCelebration();
  };

  // Calculate session stats
  const calculateStats = () => {
    const timeSpent = APP_CONFIG.FREE_SESSION_DURATION - timeRemaining;
    const readingSpeed = Math.round((wordsRead / (timeSpent / 60)) || 0);
    const pagesRead = currentPage + 1;
    
    return {
      timeSpent,
      wordsRead,
      pagesRead,
      readingSpeed,
      completionRate: Math.round((pagesRead / story.length) * 100)
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t("freeReadingSession.loading.title")}</h2>
          <p className="text-gray-600">{t("freeReadingSession.loading.description", { name: userInfo.name })}</p>
        </div>
      </div>
    );
  }

  const currentStory = story[currentPage] || "Loading...";
  const progress = ((currentPage + 1) / story.length) * 100;
  const currentIllustration = illustrations[currentPage % illustrations.length];
  const stats = calculateStats();

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 ${
      celebrationStep === 1 ? 'animate-pulse' : ''
    }`}>
      {/* Timer Display */}
      {sessionStarted && timeRemaining > 0 && !sessionEnded && (
        <div className="fixed top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border z-50">
          <div className="flex items-center gap-2">
            <Timer className={`w-4 h-4 ${timeRemaining <= 300 ? 'text-red-500' : 'text-primary'}`} />
            <span className={`text-sm font-medium ${timeRemaining <= 300 ? 'text-red-500' : ''}`}>
              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')} {t("freeReadingSession.timer.freeTime")}
            </span>
          </div>
        </div>
      )}

      {/* Free Trial Badge */}
      {!sessionEnded && (
        <div className="fixed top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg z-50">
          🎁 {t("freeReadingSession.freeTrial")}
        </div>
      )}

      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
          {/* Confetti rain */}
          {celebrationStep >= 0 && [...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20px`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
                transform: `translateY(${window.innerHeight + 100}px)`,
              }}
            >
              <div className={`w-3 h-3 rounded-full ${
                ['bg-yellow-400', 'bg-pink-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400'][i % 5]
              }`} />
            </div>
          ))}
          
          {/* Celebration text */}
          {celebrationStep >= 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center animate-scale-in">
                <div className="text-6xl mb-4">🎉</div>
                <h1 className="text-4xl font-bold text-yellow-600 mb-2 animate-bounce">
                  {t("freeReadingSession.celebration.congratulations")}
                </h1>
                <p className="text-xl text-gray-700">{t("freeReadingSession.celebration.sessionComplete")}</p>
              </div>
            </div>
          )}
          
          {/* Screen shake effect */}
          {celebrationStep === 1 && (
            <div className="absolute inset-0 bg-yellow-100/30 animate-pulse" />
          )}
        </div>
      )}

      {/* Progress Report Modal */}
      {showProgressReport && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md mx-auto animate-scale-in">
            <CardContent className="p-6 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{t("freeReadingSession.progressReport.title")}</h2>
                <p className="text-gray-600">{t("freeReadingSession.progressReport.description")}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.wordsRead}</div>
                  <div className="text-sm text-gray-600">{t("freeReadingSession.progressReport.stats.wordsRead")}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.pagesRead}</div>
                  <div className="text-sm text-gray-600">{t("freeReadingSession.progressReport.stats.pages")}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{Math.floor(stats.timeSpent / 60)}m</div>
                  <div className="text-sm text-gray-600">{t("freeReadingSession.progressReport.stats.readingTime")}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.readingSpeed}</div>
                  <div className="text-sm text-gray-600">{t("freeReadingSession.progressReport.stats.wordsPerMin")}</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>{t("freeReadingSession.progressReport.stats.storyProgress")}</span>
                  <span>{stats.completionRate}%</span>
                </div>
                <Progress value={stats.completionRate} className="h-3" />
              </div>

              {/* Premium upgrade CTA */}
              <div className="border-t pt-6">
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 mb-4">
                  <Crown className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-bold text-purple-800 mb-2">{t("freeReadingSession.progressReport.premium.title")}</h3>
                  <ul className="text-sm text-purple-700 text-left space-y-1">
                    <li>{t("freeReadingSession.progressReport.premium.features.unlimitedTime")}</li>
                    <li>{t("freeReadingSession.progressReport.premium.features.thousandsStories")}</li>
                    <li>{t("freeReadingSession.progressReport.premium.features.personalizedPath")}</li>
                    <li>{t("freeReadingSession.progressReport.premium.features.progressTracking")}</li>
                    <li>{t("freeReadingSession.progressReport.premium.features.achievements")}</li>
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Button onClick={onUpgrade} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Crown className="w-4 h-4 mr-2" />
                    {t("freeReadingSession.progressReport.premium.upgradeNow")}
                  </Button>
                  <Button onClick={onCreateAccount} variant="outline" className="flex-1">
                    {t("freeReadingSession.progressReport.premium.createAccount")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content - Hidden during progress report */}
      {!showProgressReport && (
        <>
          {/* Header */}
          <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-primary" />
                  <div>
                    <h1 className="text-xl font-bold text-gray-800">
                      {sessionStarted ? t("freeReadingSession.session.title", { name: userInfo.name }) : t("freeReadingSession.session.titleNotStarted")}
                    </h1>
                    <p className="text-sm text-gray-600">
                      {sessionStarted ? t("freeReadingSession.session.subtitle", { currentPage: currentPage + 1, totalPages: story.length }) : t("freeReadingSession.session.subtitleNotStarted")}
                    </p>
                  </div>
                </div>
                
                {!sessionStarted && (
                  <Button onClick={startSession} className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white">
                    <Sparkles className="w-4 h-4 mr-2" />
                    {t("freeReadingSession.session.startReading")}
                  </Button>
                )}
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
                    {/* Difficulty Level Selector */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2 justify-center">
                        {Object.entries(difficultyLevels).map(([level, info]) => (
                          <Button
                            key={level}
                            onClick={() => changeDifficulty(level as typeof currentDifficulty)}
                            variant={currentDifficulty === level ? "default" : "outline"}
                            size="sm"
                            className={`text-xs ${
                              currentDifficulty === level 
                                ? `bg-${info.color}-500 hover:bg-${info.color}-600` 
                                : `border-${info.color}-300 hover:bg-${info.color}-50`
                            }`}
                          >
                            {info.label}
                          </Button>
                        ))}
                      </div>
                      <p className="text-center text-xs text-gray-500 mt-1">
                        Current style: {difficultyLevels[currentDifficulty].author}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                      <Progress value={progress} className="h-2" />
                      <p className="text-sm text-gray-600 mt-2 text-center">
                        {t("freeReadingSession.progress.readingProgress", { percent: Math.round(progress) })}
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
                    {sessionStarted && (
                      <div className="mt-6">
                        <InteractiveAudioReading 
                          text={currentStory}
                          userInfo={userInfo}
                          isEnabled={true}
                        />
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between items-center mt-6">
                      <Button 
                        onClick={() => {
                          if (!sessionStarted) startSession();
                          setCurrentPage(Math.max(0, currentPage - 1));
                        }}
                        disabled={currentPage === 0}
                        variant="outline"
                      >
                        {t("freeReadingSession.navigation.previous")}
                      </Button>
                      
                      <span className="text-sm font-medium text-gray-600">
                        {t("freeReadingSession.navigation.pageInfo", { current: currentPage + 1, total: story.length })}
                      </span>
                      
                      <Button 
                        onClick={() => {
                          if (!sessionStarted) startSession();
                          setCurrentPage(Math.min(story.length - 1, currentPage + 1));
                        }}
                        disabled={currentPage >= story.length - 1}
                        variant="outline"
                      >
                        {t("freeReadingSession.navigation.next")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </>
      )}
    </div>
  );
};