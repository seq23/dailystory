
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { DifficultyLevel, UserInfo } from '@/types';
import { getStoredUserInfo } from '@/utils/userStorage';
import { generateStory } from '@/services/storyGenerationService';
import { SimpleImageService } from '@/services/SimpleImageService';
import { AudioControls } from '@/components/AudioControls';
import { SynchronizedAudioControls } from '@/components/SynchronizedAudioControls';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import { getStoredStory, storeStory, clearStoredStory } from '@/utils/storyStorage';
import { ValidationFeedback } from '@/components/ValidationFeedback';
import { validateField } from '@/utils/validation';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StoryPage {
  pageNumber: number;
  content: string;
  imageUrl?: string;
  imagePrompt?: string;
  isGeneratingImage?: boolean;
}

interface CleanStoryDisplayProps {
  userInfo?: UserInfo;
  isPremium?: boolean;
  currentStory?: any;
  onSessionEnded?: (stats: any) => void;
  onHome?: () => void;
  onUpgrade?: () => void;
  onNewStory?: () => void;
  children?: React.ReactNode;
}

export const CleanStoryDisplay: React.FC<CleanStoryDisplayProps> = ({
  userInfo: propUserInfo,
  isPremium = false,
  currentStory,
  onSessionEnded,
  onHome,
  onUpgrade,
  onNewStory,
  children
}) => {
  // Basic state
  const [story, setStory] = useState<StoryPage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStoryStable, setIsStoryStable] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(propUserInfo || null);
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>('medium');
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random()}`);

  // Navigation and URL handling
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  // Load user info on mount if not provided as prop
  useEffect(() => {
    if (!propUserInfo) {
      const loadUserInfo = async () => {
        try {
          const stored = await getStoredUserInfo();
          if (stored) {
            setUserInfo(stored);
            if (stored.difficultyLevel) {
              setDifficultyLevel(stored.difficultyLevel);
            }
          }
        } catch (error) {
          console.error('Failed to load user info:', error);
        }
      };
      loadUserInfo();
    }
  }, [propUserInfo]);

  // Simple story generation effect
  useEffect(() => {
    if (!userInfo?.name || !userInfo?.age) return;
    
    if (story.length > 0) return; // Already have story
    if (isGenerating) return; // Already generating

    const generateNewStory = async () => {
      console.log('🚀 Starting story generation for:', userInfo.name);
      setIsGenerating(true);
      
      try {
        // Check for stored story first
        const storedStory = getStoredStory(userInfo.name, userInfo.age.toString());
        if (storedStory && storedStory.length > 0) {
          console.log('📚 Loading stored story');
          setStory(storedStory);
          setIsStoryStable(true);
          return;
        }

        // Generate new story
        console.log('✨ Generating new story');
        const generatedStory = await generateStory(userInfo, difficultyLevel);
        
        if (generatedStory && generatedStory.length > 0) {
          const storyPages = generatedStory.map((content, index) => ({
            pageNumber: index + 1,
            content: content.trim(),
            imageUrl: undefined,
            imagePrompt: undefined,
            isGeneratingImage: false
          }));
          
          setStory(storyPages);
          storeStory(userInfo.name, userInfo.age.toString(), storyPages);
          setIsStoryStable(true);
          
          console.log('✅ Story generation complete');
        }
      } catch (error) {
        console.error('❌ Story generation failed:', error);
        toast({
          title: "Story Generation Failed",
          description: "We couldn't create your story. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsGenerating(false);
      }
    };

    generateNewStory();
  }, [userInfo?.name, userInfo?.age, difficultyLevel, isGenerating, story.length, toast]);

  // Update URL when story changes
  useEffect(() => {
    if (story.length > 0 && userInfo?.name) {
      const title = `${userInfo.name}'s Story`;
      setSearchParams({
        session: 'story',
        page: currentPage.toString(),
        total: story.length.toString(),
        title: title
      });
    }
  }, [story.length, currentPage, userInfo?.name, setSearchParams]);

  // Generate image for current page
  const generateImageForPage = useCallback(async (pageNumber: number) => {
    if (!story[pageNumber - 1] || !userInfo) return;
    
    const page = story[pageNumber - 1];
    if (page.imageUrl || page.isGeneratingImage) return;

    console.log(`🎨 Generating image for page ${pageNumber}`);
    
    // Update page to show generating state
    setStory(prev => prev.map(p => 
      p.pageNumber === pageNumber 
        ? { ...p, isGeneratingImage: true }
        : p
    ));

    try {
      const imageResult = await SimpleImageService.generateStoryImage(
        page.content,
        userInfo,
        difficultyLevel,
        storyId,
        pageNumber,
        sessionId,
        false // isGuestUser - simplified for now
      );

      if (imageResult?.success && imageResult?.url) {
        setStory(prev => prev.map(p => 
          p.pageNumber === pageNumber 
            ? { 
                ...p, 
                imageUrl: imageResult.url,
                imagePrompt: imageResult.prompt,
                isGeneratingImage: false 
              }
            : p
        ));
        console.log(`✅ Image generated for page ${pageNumber}`);
      } else {
        throw new Error('Image generation failed');
      }
    } catch (error) {
      console.error(`❌ Image generation failed for page ${pageNumber}:`, error);
      setStory(prev => prev.map(p => 
        p.pageNumber === pageNumber 
          ? { ...p, isGeneratingImage: false }
          : p
      ));
      
      toast({
        title: "Image Generation Failed",
        description: `Couldn't generate image for page ${pageNumber}. Please try again.`,
        variant: "destructive",
      });
    }
  }, [story, userInfo, difficultyLevel, storyId, sessionId, toast]);

  // Auto-generate image for current page
  useEffect(() => {
    if (isStoryStable && story.length > 0 && currentPage <= story.length) {
      generateImageForPage(currentPage);
    }
  }, [currentPage, isStoryStable, story.length, generateImageForPage]);

  // Navigation functions
  const goToNextPage = useCallback(() => {
    if (currentPage < story.length) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, story.length]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  const resetStory = useCallback(async () => {
    if (!userInfo) return;
    
    console.log('🔄 Resetting story');
    clearStoredStory(userInfo.name, userInfo.age.toString());
    setStory([]);
    setIsStoryStable(false);
    setCurrentPage(1);
    
    toast({
      title: "Story Reset",
      description: "Generating a fresh story for you!",
    });
  }, [userInfo, toast]);

  // Get current page data
  const currentPageData = useMemo(() => {
    return story.find(page => page.pageNumber === currentPage);
  }, [story, currentPage]);

  // Loading state
  if (isGenerating || !userInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Creating Your Story</h3>
            <p className="text-gray-600">Please wait while we craft something magical...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No story state
  if (!isGenerating && story.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">No Story Available</h3>
            <p className="text-gray-600 mb-4">We couldn't create your story. Please try again.</p>
            <Button onClick={resetStory} className="w-full">
              <RotateCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onHome || (() => navigate('/'))}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Home
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">
              {userInfo?.name}'s Story
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm">
              Page {currentPage} of {story.length}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={resetStory}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              New Story
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Story Content */}
          <Card className="h-fit">
            <CardContent className="p-6">
              {currentPageData ? (
                <div className="space-y-4">
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-800 leading-relaxed">
                      {currentPageData.content}
                    </p>
                  </div>
                  
                  {/* Validation Feedback - simplified */}
                  <ValidationFeedback
                    hasErrors={false}
                    errors={[]}
                    hasCoppaViolation={false}
                  />
                  
                  {/* Audio Controls - simplified */}
                  <div className="border-t pt-4">
                    <SynchronizedAudioControls
                      text={currentPageData.content}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Page not found</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Image Section */}
          <Card className="h-fit">
            <CardContent className="p-6">
              <div className="aspect-square relative bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg overflow-hidden">
                {currentPageData?.isGeneratingImage ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                      <p className="text-purple-700 font-medium">Creating illustration...</p>
                    </div>
                  </div>
                ) : currentPageData?.imageUrl ? (
                  <img
                    src={currentPageData.imageUrl}
                    alt={`Story illustration for page ${currentPage}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Sparkles className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                      <p className="text-purple-600 font-medium">Illustration will appear here</p>
                    </div>
                  </div>
                )}
              </div>
              
              {currentPageData?.imagePrompt && (
                <p className="mt-3 text-sm text-gray-500 italic">
                  {currentPageData.imagePrompt}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <Button
            variant="outline"
            onClick={goToPreviousPage}
            disabled={currentPage <= 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <div className="flex gap-2">
            {story.map((_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={cn(
                  "w-3 h-3 rounded-full transition-all",
                  currentPage === index + 1
                    ? "bg-purple-600 scale-125"
                    : "bg-purple-200 hover:bg-purple-300"
                )}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
          
          <Button
            variant="outline"
            onClick={goToNextPage}
            disabled={currentPage >= story.length}
            className="flex items-center gap-2"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {children}
      </div>
    </div>
  );
};
