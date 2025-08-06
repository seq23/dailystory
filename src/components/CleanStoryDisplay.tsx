import { useState, useEffect } from "react";
import { MobileOptimizedButton } from "@/components/MobileOptimizedButton";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Home, RotateCcw, Loader2, Volume2, VolumeX } from "lucide-react";
import { useTranslation } from "react-i18next";

// Audio and Interactive Components
import { ElevenLabsAudio } from "@/components/ElevenLabsAudio";
import { VocabularyCollector } from "@/components/VocabularyCollector";
import { processTextForPhonetics } from "@/utils/textProcessor";
import { useWordHighlighting } from "@/hooks/useWordHighlighting";
import { useGamification } from "@/hooks/useGamification";

import type { UserInfo, SessionStats } from "@/types";
import { NetflixStyleStoryService, type NetflixStoryResult } from "@/services/NetflixStyleStoryService";
import { LiveGenerationService, type LiveGenerationContext, type LivePageResult } from "@/services/LiveGenerationService";
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
  
  // Define current story for highlighting hook
  const currentStory = story[currentPage] || "";
  
  // Audio highlighting integration
  const { onWordHighlight, currentHighlightedWord, clearHighlighting } = useWordHighlighting(
    currentStory, 
    isAudioPlaying
  );
  
  // Gamification integration
  const { updateActivity, recordReadingSession } = useGamification({
    userId: userInfo.name,
    enablePersistence: true,
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
        currentPage + 1
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
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-primary">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-foreground">
                  {storyTitle}
                </h1>
                {isPremium && (
                  <span className="bg-primary text-white px-2 py-1 rounded text-sm">
                    Live Generation
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <MobileOptimizedButton onClick={onNewStory} variant="outline" size="sm">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  New Story
                </MobileOptimizedButton>
                <MobileOptimizedButton onClick={onHome} variant="outline" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </MobileOptimizedButton>
              </div>
            </div>
          </div>
        </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-card shadow-card">
            <CardContent className="p-6">
              {/* Progress Bar */}
              <div className="mb-6">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Page {currentPage + 1} of {isPremium && !isStoryComplete ? `${story.length}+` : story.length}
                  {isPremium && !isStoryComplete && ' (Live Generation)'}
                </p>
              </div>

              {/* Story Content */}
              <div className="bg-gradient-card rounded-lg p-6 mb-6 min-h-[300px]">
                {/* Image Section */}
                {currentImage && (
                  <div className="mb-6">
                    <img 
                      src={currentImage} 
                      alt={`Story illustration for page ${currentPage + 1}`}
                      className="w-full h-48 object-cover rounded-lg shadow-soft"
                    />
                  </div>
                )}
                
                {isGeneratingImage && !currentImage && (
                  <div className="mb-6 h-48 bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Creating illustration...</p>
                    </div>
                  </div>
                )}

                {/* Audio Controls */}
                <div className="mb-6 flex justify-center gap-4">
                  <ElevenLabsAudio
                    text={currentStory}
                    userInfo={userInfo}
                    isPremium={isPremium}
                    onUpgrade={onUpgrade}
                    onWordHighlight={onWordHighlight}
                    difficulty={userInfo.difficultyLevel || 'medium'}
                  />
                  
                  {/* Audio Playing State Monitor */}
                  {isAudioPlaying && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      Playing Audio
                    </div>
                  )}
                  
                  <MobileOptimizedButton
                    onClick={() => setShowVocabularyCollector(true)}
                    variant="outline"
                    size="sm"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Vocabulary
                  </MobileOptimizedButton>
                </div>

                {/* Interactive Text Content */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground mb-4 leading-relaxed story-content">
                    {processTextForPhonetics(
                      currentStory,
                      "cursor-pointer hover:bg-primary/10 rounded px-1 transition-colors",
                      userInfo.difficultyLevel || 'medium',
                      userInfo,
                      isPremium,
                      userInfo.name,
                      currentHighlightedWord
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center">
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
                      Generating...
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
      
      {/* Vocabulary Collector Modal */}
      <VocabularyCollector
        userInfo={userInfo}
        isVisible={showVocabularyCollector}
        onClose={() => setShowVocabularyCollector(false)}
        enablePersistence={true}
      />
      </div>
    </ErrorBoundary>
  );
};

export default CleanStoryDisplay;