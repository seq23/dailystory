import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, RefreshCw, Wand } from "lucide-react";
import { DebugLogger } from '@/services/DebugLogger';
import { MobileOptimizedButton } from "@/components/MobileOptimizedButton";

interface StoryNavigationControlsProps {
  currentPage: number;
  totalPages: number;
  isPremium: boolean;
  isLoadingNextPage: boolean;
  isGeneratingNewStory: boolean;
  isGeneratingRewrite: boolean;
  canGoNext: boolean;
  canGoPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onGenerateNext: () => void;
  onGenerateNewStory: () => void;
  onGenerateRewrite: () => void;
  onFinishStory?: () => void;
}

export const StoryNavigationControls: React.FC<StoryNavigationControlsProps> = ({
  currentPage,
  totalPages,
  isPremium,
  isLoadingNextPage,
  isGeneratingNewStory,
  isGeneratingRewrite,
  canGoNext,
  canGoPrevious,
  onNext,
  onPrevious,
  onGenerateNext,
  onGenerateNewStory,
  onGenerateRewrite,
  onFinishStory
}) => {
  const handleNext = () => {
    DebugLogger.log('ui', 'Navigation: Next page requested', { currentPage, totalPages });
    
    if (currentPage < totalPages - 1) {
      onNext();
    } else if (isPremium) {
      onGenerateNext();
    }
  };

  const handlePrevious = () => {
    DebugLogger.log('ui', 'Navigation: Previous page requested', { currentPage });
    
    if (currentPage > 0) {
      onPrevious();
    }
  };

  return (
    <div className="story-navigation-controls flex items-center justify-between w-full">
      {/* Previous Button */}
      <Button
        onClick={handlePrevious}
        disabled={!canGoPrevious}
        variant="ghost"
        size="sm"
        className="navigation-button"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Previous
      </Button>

      {/* Center Controls */}
      <div className="flex items-center gap-2">
        {/* Page Indicator */}
        <span className="text-sm text-muted-foreground">
          Page {currentPage + 1} of {totalPages}
        </span>

        {/* Premium Controls */}
        {isPremium && (
          <div className="flex items-center gap-2">
            <MobileOptimizedButton
              onClick={onGenerateRewrite}
              disabled={isGeneratingRewrite || isGeneratingNewStory}
              variant="ghost"
              size="sm"
            >
              <Wand className="w-4 h-4" />
              {isGeneratingRewrite ? 'Rewriting...' : 'Rewrite'}
            </MobileOptimizedButton>

            {onFinishStory && (
              <MobileOptimizedButton
                onClick={onFinishStory}
                variant="outline"
                size="sm"
              >
                Finish Story
              </MobileOptimizedButton>
            )}
          </div>
        )}

        {/* Guest Next Story Button */}
        {!isPremium && currentPage === 5 && (
          <MobileOptimizedButton
            onClick={onGenerateNewStory}
            disabled={isGeneratingNewStory}
            variant="default"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isGeneratingNewStory ? 'Loading...' : 'Next Story'}
          </MobileOptimizedButton>
        )}
      </div>

      {/* Next Button */}
      <Button
        onClick={handleNext}
        disabled={!canGoNext || isLoadingNextPage}
        variant="ghost"
        size="sm"
        className="navigation-button"
      >
        {isLoadingNextPage ? (
          <>
            <div className="animate-spin w-4 h-4 mr-2 border-2 border-primary border-t-transparent rounded-full" />
            Loading...
          </>
        ) : (
          <>
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
};