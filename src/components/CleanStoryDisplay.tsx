import { useState, useEffect } from "react";
import { MobileOptimizedButton } from "@/components/MobileOptimizedButton";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BookOpen, Home, RotateCcw, Loader2, Volume2, VolumeX, ChevronUp, ChevronDown, Settings, Plus, RefreshCw, X, Clock, PlusCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";

// Mobile-Optimized UI Components
import { CollapsibleFloatingTimer } from "@/components/CollapsibleFloatingTimer";
import { SimpleTutorialOverlay } from "@/components/SimpleTutorialOverlay";
import { MobileOptimizedHeader } from "@/components/MobileOptimizedHeader";
import { ProgressTowers } from "@/components/ProgressTowers";
import { GameContextProvider } from "@/components/GameContextProvider";

// Audio and Interactive Components
import { ElevenLabsAudio } from "@/components/ElevenLabsAudio";
import { VocabularyCollector } from "@/components/VocabularyCollector";
import { processTextForPhonetics } from "@/utils/textProcessor";
import { useWordHighlighting } from "@/hooks/useWordHighlighting";
import { useGamification } from "@/hooks/useGamification";
import { useIsMobile } from "@/hooks/use-mobile";
import { getMobileTextConfig, getMobileStoryContainer } from "@/utils/mobileTextOptimizations";

import type { UserInfo, SessionStats } from "@/types";
import { NetflixStyleStoryService, type NetflixStoryResult } from "@/services/NetflixStyleStoryService";
import { LiveGenerationService, type LiveGenerationContext, type LivePageResult } from "@/services/LiveGenerationService";
import { AddPagesService, type AddPagesResult } from "@/services/addPagesService";
import { SimpleImageService } from "@/services/SimpleImageService";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorHandler, ErrorType } from "@/utils/errorHandling";

interface CleanStoryDisplayProps {
  userInfo: UserInfo;
  isPremium: boolean;
  onSessionEnded: (stats: SessionStats) => void;
  onHome: () => void;
  onUpgrade: () => void;
  onNewStory: () => void;
}

const CleanStoryDisplay: React.FC<CleanStoryDisplayProps> = ({
  userInfo,
  isPremium,
  onSessionEnded,
  onHome,
  onUpgrade,
  onNewStory
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isMobile, isTablet, isMobileOrTablet } = useIsMobile();
  
  // Story state
  const [story, setStory] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingNextPage, setIsLoadingNextPage] = useState(false);
  const [storyTitle, setStoryTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Premium live generation state
  const [liveContext, setLiveContext] = useState<LiveGenerationContext | null>(null);
  const [isStoryComplete, setIsStoryComplete] = useState(false);
  
  // Image state
  const [pageImages, setPageImages] = useState<Record<number, string>>({});
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  // Audio and Interactive Features state
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showVocabularyCollector, setShowVocabularyCollector] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [wordsInteracted, setWordsInteracted] = useState(0);

  // Timer and Tutorial state
  const [timeRemaining, setTimeRemaining] = useState(20 * 60); // 20 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimerCanceled, setIsTimerCanceled] = useState(false); // Premium: timer can be canceled
  const [showTutorial, setShowTutorial] = useState(true);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);

  // Add pages state
  const [isAddingPages, setIsAddingPages] = useState(false);
  const [showAddPagesButton, setShowAddPagesButton] = useState(false);

  // Reading Level state
  const [currentDifficulty, setCurrentDifficulty] = useState<'beginner' | 'easy' | 'medium' | 'hard' | 'expert'>(userInfo.difficultyLevel || 'beginner');
  const difficultyLevels: ('beginner' | 'easy' | 'medium' | 'hard' | 'expert')[] = ['beginner', 'easy', 'medium', 'hard', 'expert'];
  
  // Define current story for highlighting hook
  const currentStory = story[currentPage] || "";
  
  // Audio highlighting integration
  const { onWordHighlight, currentHighlightedWord, clearHighlighting } = useWordHighlighting(
    currentStory, 
    isAudioPlaying
  );
  
  // Gamification integration
  const {
    userStats,
    updateActivity,
    recordReadingSession,
    addVocabularyWord,
    newAchievements,
    hasNewAchievements,
    getNextAchievement,
    clearNewAchievements,
    resetStats
  } = useGamification({
    userId: userInfo.name,
    enablePersistence: isPremium, // Only persist for premium users
    onAchievementUnlocked: (achievement) => {
      console.log('🏆 Achievement unlocked:', achievement.title || achievement.id);
    }
  });

  // Initialize story based on tier
  useEffect(() => {
    initializeStory();
  }, [userInfo, isPremium]);

  // Generate image for current page
  useEffect(() => {
    if (story.length > 0 && currentPage < story.length && !pageImages[currentPage]) {
      generateImageForCurrentPage();
    }
  }, [currentPage, story, pageImages]);

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeRemaining > 0 && !isTimerCanceled) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            // Only end session for free users when timer expires
            if (!isPremium) {
              handleEndSession();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeRemaining, isTimerCanceled, isPremium]);

  // Show "Add Pages" button when user reaches the end
  useEffect(() => {
    const isAtEnd = currentPage === story.length - 1 && story.length > 0;
    const canAddPages = isPremium || (!isPremium && timeRemaining > 0);
    setShowAddPagesButton(isAtEnd && canAddPages && !isStoryComplete);
  }, [currentPage, story.length, isPremium, timeRemaining, isStoryComplete]);

  const initializeStory = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (isPremium) {
        // Premium: Live generation - start with first page
        console.log('🎯 Premium user: Starting live generation');
        const result = await LiveGenerationService.generateFirstPage(userInfo);
        
        if (result.error) {
          setError(result.error);
          return;
        }
        
        setStory([result.content]);
        setLiveContext(result.nextContext || null);
        setIsStoryComplete(result.isComplete);
        setStoryTitle(`${userInfo.name}'s Live Adventure`);
        
      } else {
        // Free: Netflix-style - generate complete story upfront
        console.log('🎬 Free user: Generating complete story');
        const result = await NetflixStyleStoryService.generateCompleteStory(userInfo);
        
        if (result.error) {
          setError(result.error);
          return;
        }
        
        setStory(result.pages);
        setStoryTitle(result.title);
        setIsStoryComplete(true);
      }
      
    } catch (error) {
      console.error('Story initialization failed:', error);
      setError('Failed to create your story. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateNextPage = async () => {
    if (!isPremium || !liveContext || isLoadingNextPage) return;
    
    setIsLoadingNextPage(true);
    
    try {
      const result = await LiveGenerationService.generateNextPage(liveContext);
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      setStory(prev => [...prev, result.content]);
      setLiveContext(result.nextContext || null);
      setIsStoryComplete(result.isComplete);
      
    } catch (error) {
      console.error('Failed to generate next page:', error);
      setError('Failed to continue the story. Please try again.');
    } finally {
      setIsLoadingNextPage(false);
    }
  };

  const generateImageForCurrentPage = async () => {
    if (isGeneratingImage || pageImages[currentPage]) return;
    
    setIsGeneratingImage(true);
    
    try {
      const storyText = story[currentPage];
      const result = await SimpleImageService.generateStoryImage(
        storyText, 
        userInfo, 
        currentPage + 1,
        story.length
      );
      
      if (result.success && result.url) {
        setPageImages(prev => ({
          ...prev,
          [currentPage]: result.url
        }));
      }
      
    } catch (error) {
      console.log('Image generation failed, continuing without image:', error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleNext = async () => {
    // Stop audio when navigating
    setIsAudioPlaying(false);
    clearHighlighting();
    
    if (isPremium && !isStoryComplete && currentPage === story.length - 1) {
      // Premium: Generate next page live
      await generateNextPage();
      if (story.length > currentPage + 1) {
        setCurrentPage(currentPage + 1);
      }
    } else if (currentPage < story.length - 1) {
      // Navigate to next existing page
      setCurrentPage(currentPage + 1);
    } else {
      // Story completed - record comprehensive session stats
      const timeSpent = Date.now() - sessionStartTime;
      const totalWordsRead = story.join(' ').split(' ').length;
      
      const sessionStats: SessionStats = {
        timeSpent,
        wordsRead: totalWordsRead,
        pagesRead: story.length,
        startTime: sessionStartTime,
        accuracy: 100
      };
      
      // Record session for gamification
      recordReadingSession({
        timeSpent,
        wordsRead: totalWordsRead,
        pagesRead: story.length,
        storyCompleted: true,
        readingSpeed: Math.round((totalWordsRead / timeSpent) * 60000) // words per minute
      });
      
      onSessionEnded(sessionStats);
    }
  };
  
  const handlePrevious = () => {
    // Stop audio when navigating
    setIsAudioPlaying(false);
    clearHighlighting();
    setCurrentPage(Math.max(0, currentPage - 1));
  };
  
  const handleWordInteraction = () => {
    setWordsInteracted(prev => prev + 1);
    updateActivity({ wordsRead: 1 });
  };

  // Timer controls
  const handleToggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const handleReduceTime = () => {
    setTimeRemaining(prev => Math.max(5 * 60, prev - 5 * 60)); // Reduce by 5 minutes, minimum 5 minutes
  };

  const handleEndSession = () => {
    const timeSpent = (20 * 60 - timeRemaining) * 1000; // Convert to milliseconds
    const totalWordsRead = story.join(' ').split(' ').length;
    
    const sessionStats = {
      timeSpent,
      wordsRead: totalWordsRead,
      pagesRead: story.length,
      startTime: sessionStartTime,
      accuracy: 100
    };
    
    recordReadingSession({
      timeSpent,
      wordsRead: totalWordsRead,
      pagesRead: story.length,
      storyCompleted: currentPage === story.length - 1,
      readingSpeed: Math.round((totalWordsRead / timeSpent) * 60000)
    });
    
    onSessionEnded(sessionStats);
  };

  // Premium timer controls
  const handleCancelTimer = () => {
    setIsTimerCanceled(true);
    setIsTimerRunning(false);
    toast({
      title: "Timer Stopped",
      description: "You can now read without time limits!",
      duration: 3000,
    });
  };

  const handleExtendTime = () => {
    const extension = 15 * 60; // 15 minutes
    const maxTime = 60 * 60; // 60 minutes max
    setTimeRemaining(prev => Math.min(maxTime, prev + extension));
    toast({
      title: "Time Extended!",
      description: "Added 15 minutes to your reading session.",
      duration: 3000,
    });
  };

  // Add pages functionality
  const handleAddPages = async () => {
    if (isAddingPages) return;
    
    setIsAddingPages(true);
    
    try {
      console.log('📄 Adding pages to story...');
      
      const result = await AddPagesService.addPages(
        userInfo, 
        story, 
        userInfo.difficultyLevel || currentDifficulty
      );
      
      if (result.error) {
        toast({
          title: "Couldn't Add Pages",
          description: result.error,
          variant: "destructive",
        });
        return;
      }
      
      // Add new pages to story
      setStory(prev => [...prev, ...result.newPages]);
      
      toast({
        title: "Pages Added! ✨",
        description: `Added ${result.newPages.length} new pages to your story!`,
        duration: 4000,
      });
      
      // Auto-navigate to first new page
      setTimeout(() => {
        setCurrentPage(story.length);
      }, 500);
      
    } catch (error) {
      console.error('Failed to add pages:', error);
      toast({
        title: "Error Adding Pages",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsAddingPages(false);
    }
  };

  // Regenerate current page (premium only)
  const handleRegeneratePage = async () => {
    if (!isPremium || isLoadingNextPage) return;
    
    setIsLoadingNextPage(true);
    
    try {
      // For live generation, regenerate using the context
      if (liveContext) {
        const result = await LiveGenerationService.generateNextPage({
          ...liveContext,
          currentPage: currentPage,
          storyContext: story.slice(0, currentPage)
        });
        
        if (!result.error) {
          // Replace current page
          const newStory = [...story];
          newStory[currentPage] = result.content;
          setStory(newStory);
          
          toast({
            title: "Page Regenerated! ✨",
            description: "Your story page has been refreshed.",
            duration: 3000,
          });
        }
      }
    } catch (error) {
      console.error('Failed to regenerate page:', error);
      toast({
        title: "Regeneration Failed",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingNextPage(false);
    }
  };

  // Difficulty controls
  const handleDifficultyChange = (direction: 'up' | 'down') => {
    const currentIndex = difficultyLevels.indexOf(currentDifficulty);
    let newIndex = currentIndex;
    
    if (direction === 'up' && currentIndex < difficultyLevels.length - 1) {
      newIndex = currentIndex + 1;
    } else if (direction === 'down' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    }
    
    if (newIndex !== currentIndex) {
      setCurrentDifficulty(difficultyLevels[newIndex]);
      // Here you would trigger story regeneration with new difficulty
      console.log('Difficulty changed to:', difficultyLevels[newIndex]);
    }
  };

  // Tutorial controls
  const handleCompleteTutorial = () => {
    setShowTutorial(false);
    setIsTimerRunning(true); // Start timer after tutorial
  };

  const handleSkipTutorial = () => {
    setShowTutorial(false);
  };

  // Get mobile-optimized text configuration
  const mobileTextConfig = getMobileTextConfig(currentDifficulty);
  const mobileContainerConfig = getMobileStoryContainer(currentDifficulty);

  const progress = story.length > 0 ? ((currentPage + 1) / story.length) * 100 : 0;
  const currentImage = pageImages[currentPage];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {isPremium ? 'Creating Your Live Story...' : 'Creating Your Complete Story...'}
          </h2>
          <p className="text-white/80">
            {isPremium ? `Generating page 1 for ${userInfo.name}` : `Preparing ${userInfo.name}'s complete adventure`}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Oops! Something went wrong</h2>
          <p className="text-white/80 mb-6">{error}</p>
          <MobileOptimizedButton onClick={onNewStory} className="bg-white text-primary">
            Try Again
          </MobileOptimizedButton>
        </div>
      </div>
    );
  }

  return (
    <GameContextProvider 
      userId={userInfo.name} 
      userType={isPremium ? 'premium' : 'free'}
      userInfo={userInfo}
    >
      <ErrorBoundary>
        <div className="min-h-screen bg-gradient-primary mobile-optimized">
        {/* Mobile-Optimized Header */}
        <MobileOptimizedHeader
          storyTitle={storyTitle}
          currentDifficulty={currentDifficulty}
          onHome={onHome}
          onNewStory={onNewStory}
          onIncreaseDifficulty={() => handleDifficultyChange('up')}
          onDecreaseDifficulty={() => handleDifficultyChange('down')}
          showLevelControls={true}
        />

        {/* Premium Controls Bar - Mobile Optimized */}
        {isPremium && !isTimerCanceled && timeRemaining > 0 && (
          <div className="bg-primary/10 border-b border-primary/20 p-2 sm:p-3">
            <div className="container mx-auto flex flex-wrap items-center justify-center gap-2">
              <span className="bg-primary text-white px-2 py-1 rounded text-xs sm:text-sm">
                Live Generation
              </span>
              <MobileOptimizedButton
                onClick={handleCancelTimer}
                size="sm"
                variant="outline"
                className="h-8 px-2 text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Cancel Timer
              </MobileOptimizedButton>
              <MobileOptimizedButton
                onClick={handleExtendTime}
                size="sm"
                variant="outline"
                className="h-8 px-2 text-xs"
                disabled={timeRemaining >= 60 * 60}
              >
                <Clock className="w-3 h-3 mr-1" />
                +15min
              </MobileOptimizedButton>
            </div>
          </div>
        )}

      {/* Main Content - Mobile Optimized */}
      <main className={`container mx-auto safe-area-padding ${mobileContainerConfig}`}>
        <div className="max-w-4xl mx-auto">
          <Card className="bg-card shadow-card mobile-text-fixed">
            <CardContent className={`${isMobileOrTablet ? 'p-3 sm:p-4' : 'p-6'}`}>
              {/* Progress Bar */}
              <div className="mb-6">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Page {currentPage + 1} of {isPremium && !isStoryComplete ? `${story.length}+` : story.length}
                  {isPremium && !isStoryComplete && ' (Live Generation)'}
                </p>
              </div>

              {/* Story Content - Vertical Layout */}
              <div className="bg-gradient-card rounded-lg p-6 mb-6 min-h-[400px]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Image Section - Left Side */}
                  <div className="lg:order-1">
                    {currentImage && (
                      <img 
                        src={currentImage} 
                        alt={`Story illustration for page ${currentPage + 1}`}
                        className="w-full h-64 lg:h-96 object-cover rounded-lg shadow-soft"
                      />
                    )}
                    
                    {isGeneratingImage && !currentImage && (
                      <div className="w-full h-64 lg:h-96 bg-muted rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Creating illustration...</p>
                        </div>
                      </div>
                    )}

                    {/* Audio Controls */}
                    <div id="audio-controls" className="mt-4 flex justify-center gap-4">
                      <ElevenLabsAudio
                        text={currentStory}
                        userInfo={userInfo}
                        isPremium={isPremium}
                        onUpgrade={onUpgrade}
                        onWordHighlight={onWordHighlight}
                        difficulty={currentDifficulty}
                      />
                      
                      {/* Audio Playing State Monitor */}
                      {isAudioPlaying && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                          Playing Audio
                        </div>
                      )}
                      
                    </div>
                  </div>

                  {/* Text Content - Right Side - Mobile Optimized */}
                  <div className="lg:order-2 flex flex-col justify-center">
                    <div className="text-center lg:text-left">
                      <div className={`font-bold text-foreground mb-4 story-content mobile-reading-optimized ${mobileTextConfig.fontSize} ${mobileTextConfig.lineHeight} ${mobileTextConfig.letterSpacing} ${mobileTextConfig.paragraphSpacing}`}>
                        {processTextForPhonetics(
                          currentStory,
                          "cursor-pointer hover:bg-primary/10 rounded px-1 transition-colors touch-target",
                          currentDifficulty,
                          userInfo,
                          isPremium,
                          userInfo.name,
                          currentHighlightedWord
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Pages Section - Show when at end */}
              {showAddPagesButton && (
                <div className="mb-6 p-4 bg-gradient-card rounded-lg border border-primary/20">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Want more adventure?</h3>
                    <p className="text-muted-foreground mb-4">
                      {isPremium 
                        ? "Add more pages to continue your story!" 
                        : `Add pages before time runs out! ${Math.floor(timeRemaining / 60)}:${(timeRemaining % 60).toString().padStart(2, '0')} remaining`
                      }
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        onClick={handleAddPages}
                        disabled={isAddingPages}
                        className="bg-primary text-primary-foreground"
                      >
                        {isAddingPages ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Adding Pages...
                          </>
                        ) : (
                          <>
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Add 3-5 More Pages
                          </>
                        )}
                      </Button>
                      
                      {isPremium && (
                        <Button
                          onClick={handleRegeneratePage}
                          disabled={isLoadingNextPage}
                          variant="outline"
                        >
                          {isLoadingNextPage ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Regenerating...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Regenerate Page
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div id="story-navigation" className="flex justify-between items-center">
                <MobileOptimizedButton
                  onClick={handlePrevious}
                  disabled={currentPage === 0}
                  variant="outline"
                >
                  Previous
                </MobileOptimizedButton>

                <span className="text-sm font-medium text-muted-foreground">
                  {currentPage + 1} / {isPremium && !isStoryComplete ? `${story.length}+` : story.length}
                </span>

                <MobileOptimizedButton
                  onClick={handleNext}
                  disabled={isLoadingNextPage}
                  className="bg-primary text-primary-foreground"
                >
                  {isLoadingNextPage ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isPremium ? 'Generating page...' : 'Generating...'}
                    </>
                  ) : currentPage === story.length - 1 && isStoryComplete ? (
                    'Complete'
                  ) : currentPage === story.length - 1 && isPremium ? (
                    'Generate Next'
                  ) : (
                    'Next'
                  )}
                </MobileOptimizedButton>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      {/* Simplified Tutorial */}
      <SimpleTutorialOverlay
        isVisible={showTutorial}
        onComplete={handleCompleteTutorial}
        onSkip={handleSkipTutorial}
        onStepChange={setCurrentTutorialStep}
      />

      {/* Vocabulary Collector Modal */}
      <VocabularyCollector
        userInfo={userInfo}
        isVisible={showVocabularyCollector}
        onClose={() => setShowVocabularyCollector(false)}
        enablePersistence={true}
      />
        
      {/* Collapsible Floating Timer - Mobile Optimized */}
      <CollapsibleFloatingTimer
        timeRemaining={timeRemaining}
        isReading={isTimerRunning}
        onToggleReading={handleToggleTimer}
        onReduceTime={isPremium ? handleReduceTime : undefined}
        onEndSession={handleEndSession}
        onSessionEnded={handleEndSession}
        showTutorial={showTutorial}
      />
      
      {/* Progress Tower - Collapsible floating tower */}
      <ProgressTowers
        userId={userInfo?.name}
        userType={isPremium ? 'premium' : 'free'}
        currentWordsRead={userStats.totalWordsRead || 0}
        currentPagesRead={userStats.totalStoriesCompleted || 0}
        vocabularyLearned={userStats.vocabularyWordsLearned || 0}
        onProgressUpdate={(progressData) => {
          console.log('Progress updated:', progressData);
        }}
        shouldPulse={false}
        className="fixed"
      />
      </div>
    </ErrorBoundary>
    </GameContextProvider>
  );
};

export default CleanStoryDisplay;