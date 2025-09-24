import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ElevenLabsAudio, type ElevenLabsAudioHandle } from '@/components/ElevenLabsAudio';
import { MobileOptimizedInteractiveWord } from '@/components/MobileOptimizedInteractiveWord';
import { BookOpen, ChevronLeft, ChevronRight, Play, Crown } from 'lucide-react';
import type { UserInfo } from '@/types';

interface InteractiveStoryTesterProps {
  userInfo: UserInfo;
  selectedLanguage: string;
  isPremium: boolean;
  difficulty: 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';
  highlightingEnabled: boolean;
}

export const InteractiveStoryTester = ({ 
  userInfo, 
  selectedLanguage,
  isPremium, 
  difficulty,
  highlightingEnabled 
}: InteractiveStoryTesterProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [highlightedWordIndex, setHighlightedWordIndex] = useState(-1);
  const [wordInteractionCount, setWordInteractionCount] = useState(0);
  const audioRef = useRef<ElevenLabsAudioHandle>(null);

  // Create userInfo with selected language (like MultilingualWordTester)
  const testUserInfo: UserInfo = {
    ...userInfo,
    nativeLanguage: selectedLanguage as any
  };

  // Sample story pages for testing
  const storyPages = [
    {
      id: 1,
      text: "Once upon a time, in a magical forest filled with sparkling streams and towering ancient trees, there lived a curious young fox named Ruby. She had bright orange fur that shimmered in the sunlight and eyes that gleamed with wonder about the mysterious world around her.",
      hash: "story-page-1-hash-12345"
    },
    {
      id: 2, 
      text: "Ruby loved to explore the enchanted woodland, discovering hidden pathways and secret clearings where wildflowers danced in the gentle breeze. One morning, she stumbled upon a peculiar golden acorn that glowed with an inner light, unlike anything she had ever seen before.",
      hash: "story-page-2-hash-67890"
    },
    {
      id: 3,
      text: "As Ruby carefully picked up the magical acorn, it began to whisper ancient secrets in a language she somehow understood. The acorn told her about a forgotten treasure buried deep within the heart of the forest, protected by riddles and challenges that only the bravest could solve.",
      hash: "story-page-3-hash-abcdef"
    },
    {
      id: 4,
      text: "Excited by this incredible discovery, Ruby decided to embark on the greatest adventure of her life. She packed her small backpack with berries and fresh water, said goodbye to her cozy den, and set off into the unknown depths of the magical forest with courage in her heart.",
      hash: "story-page-4-hash-ghijkl"
    },
    {
      id: 5,
      text: "The journey led Ruby through dark valleys and over sparkling hills, past talking brooks and singing birds. Each step brought new wonders and challenges, testing her cleverness and determination as she followed the acorn's mysterious guidance toward her destiny.",
      hash: "story-page-5-hash-mnopqr"
    },
    {
      id: 6,
      text: "Finally, after many hours of walking, Ruby arrived at a clearing where an ancient oak tree stood majestically. The tree's trunk was covered in glowing symbols, and at its base lay a chest filled with the most beautiful gems she had ever imagined, sparkling like captured starlight.",
      hash: "story-page-6-hash-stuvwx"
    }
  ];

  const currentStory = storyPages[currentPage];
  const maxPages = isPremium ? storyPages.length : Math.min(6, storyPages.length);

  const handleWordHighlight = (wordIndex: number) => {
    if (highlightingEnabled) {
      setHighlightedWordIndex(wordIndex);
    }
  };

  const handleWordInteraction = () => {
    setWordInteractionCount(prev => prev + 1);
  };

  const processTextIntoWords = (text: string) => {
    const words = text.split(/(\s+|[.,!?;:])/);
    let wordIndex = 0;
    
    return words.map((segment, index) => {
      if (/^\s+$/.test(segment) || /^[.,!?;:]$/.test(segment)) {
        return <span key={index}>{segment}</span>;
      }
      
      const currentWordIndex = wordIndex++;
      const isHighlighted = highlightingEnabled && currentWordIndex === highlightedWordIndex;
      
      return (
        <MobileOptimizedInteractiveWord
          key={`${selectedLanguage}-${index}-${segment}`}
          word={segment}
          className={`inline transition-all duration-300 ${
            isHighlighted 
              ? 'bg-yellow-200/80 dark:bg-yellow-800/60 animate-pulse shadow-md rounded-sm' 
              : ''
          }`}
          difficulty={difficulty}
          userInfo={testUserInfo}
          isPremium={isPremium}
          forceModal={true}
        />
      );
    });
  };

  const navigateToPage = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < maxPages) {
      setCurrentPage(pageIndex);
      setHighlightedWordIndex(-1);
      // Update global state for audio synchronization
      (window as any).__pageContentHash = currentStory.hash;
      (window as any).__pageContentString = currentStory.text;
    }
  };

  // Set global state for audio synchronization
  React.useEffect(() => {
    if (currentStory) {
      (window as any).__pageContentHash = currentStory.hash;
      (window as any).__pageContentString = currentStory.text;
      (window as any).__IS_PREMIUM = isPremium;
      (window as any).__storyTitle = "Ruby's Magical Adventure";
      (window as any).__userName = userInfo.name;
      (window as any).currentStoryPage = currentPage + 1;
    }
  }, [currentStory, isPremium, userInfo.name, currentPage]);

  return (
    <div className="space-y-6">
      {/* Story Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Ruby's Magical Adventure - Interactive Story Testing
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isPremium ? 'default' : 'secondary'}>
                {isPremium ? 'Premium' : 'Guest'} Mode
              </Badge>
              {!isPremium && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  6 pages max
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                Page {currentPage + 1} of {maxPages}
              </span>
              <Progress value={((currentPage + 1) / maxPages) * 100} className="w-32" />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Word interactions: {wordInteractionCount}</span>
              {highlightingEnabled && (
                <Badge variant="outline">Highlighting: ON</Badge>
              )}
            </div>
          </div>

          {/* Audio Controls */}
          <div className="mb-6">
            <ElevenLabsAudio
              ref={audioRef}
              text={currentStory.text}
              userInfo={testUserInfo}
              isPremium={isPremium}
              currentPage={currentPage}
              totalPages={maxPages}
              difficulty={difficulty}
              onWordHighlight={handleWordHighlight}
              contentHash={currentStory.hash}
            />
          </div>
        </CardContent>
      </Card>

      {/* Story Content */}
      <Card>
        <CardContent className="pt-6">
          <div className="prose prose-lg max-w-none leading-relaxed text-lg">
            {processTextIntoWords(currentStory.text)}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => navigateToPage(currentPage - 1)}
              disabled={currentPage === 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous Page
            </Button>

            <div className="flex items-center gap-2">
              {Array.from({ length: maxPages }, (_, i) => (
                <Button
                  key={i}
                  onClick={() => navigateToPage(i)}
                  variant={i === currentPage ? 'default' : 'outline'}
                  size="sm"
                  className="w-10 h-10"
                >
                  {i + 1}
                </Button>
              ))}
            </div>

            <Button
              onClick={() => navigateToPage(currentPage + 1)}
              disabled={currentPage >= maxPages - 1}
              variant="outline"
              className="flex items-center gap-2"
            >
              Next Page
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {!isPremium && currentPage === 5 && (
            <div className="mt-4 p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Guest users can only read 6 pages per story
              </p>
              <Button variant="default" className="flex items-center gap-2">
                <Crown className="w-4 h-4" />
                Upgrade to Premium for Full Stories
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Testing Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Story Reading:</strong> Click "Read Story" to test full story playback with word highlighting</p>
            <p><strong>Word Interactions:</strong> Click any word to test Hear/Explain/Syllables functionality</p>
            <p><strong>Voice Commands:</strong> Use "Buddy" button to test voice commands like "next page", "pause", "continue"</p>
            <p><strong>Navigation:</strong> Test page navigation to ensure audio stops/starts correctly</p>
            <p><strong>Premium vs Guest:</strong> Switch user type to test different access levels</p>
            <p><strong>Language Testing:</strong> Change native language to test multilingual explanations</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};