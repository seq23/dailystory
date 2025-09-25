import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, RefreshCw, Wand, GraduationCap } from "lucide-react";
import { DebugLogger } from '@/services/DebugLogger';
import { MobileOptimizedButton } from "@/components/MobileOptimizedButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StoryAudioControls } from "./StoryAudioControls";

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
  // Audio controls props
  audioEngineRef?: React.RefObject<any>;
  isAudioPlaying?: boolean;
  isAudioLoading?: boolean;
  audioDisabled?: boolean;
  currentStoryText?: string;
  userInfo?: any;
  audioPlayedPage?: number;
  onAudioStateChange?: (playing: boolean, loading: boolean) => void;
  onAudioPlayed?: (page: number) => void;
  onUpgrade?: () => void;
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
  onFinishStory,
  audioEngineRef,
  isAudioPlaying,
  isAudioLoading,
  audioDisabled,
  currentStoryText,
  userInfo,
  audioPlayedPage,
  onAudioStateChange,
  onAudioPlayed,
  onUpgrade
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

      {/* Center Controls with Audio Buttons */}
      <div className="flex items-center gap-4">
        {/* Read to Me Button - Left of page numbers - Guest Users Only */}
        {!isPremium && audioEngineRef && onAudioStateChange && onAudioPlayed && (
          <div className="xl:flex hidden">
            <StoryAudioControls
              audioEngineRef={audioEngineRef}
              isAudioPlaying={isAudioPlaying || false}
              isAudioLoading={isAudioLoading || false}
              audioDisabled={audioDisabled || false}
              currentStoryText={currentStoryText || ""}
              userInfo={userInfo}
              isPremium={isPremium}
              currentPage={currentPage}
              audioPlayedPage={audioPlayedPage ?? -1}
              onAudioStateChange={onAudioStateChange}
              onAudioPlayed={onAudioPlayed}
            />
          </div>
        )}
        
        {/* Page Indicator */}
        <span className="text-sm text-muted-foreground">
          Page {currentPage + 1} of {totalPages}
        </span>
        
        {/* Help Me Read Button - Right of page numbers - Guest Users Only */}
        {!isPremium && onUpgrade && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary" size="sm" className="xl:flex hidden">
                <GraduationCap className="w-4 h-4 mr-2" />
                Help Me Read
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[min(96vw,720px)] max-h-[85vh] overflow-y-auto p-0">
              <DialogHeader>
                <DialogTitle>Help Me Read</DialogTitle>
              </DialogHeader>
              {/* Help Me Read Coach for guests would be limited - show upgrade prompt */}
              <div className="p-6 text-center">
                <GraduationCap className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Unlock Reading Help</h3>
                <p className="text-muted-foreground mb-4">
                  Get personalized reading assistance with our premium features.
                </p>
                <Button onClick={onUpgrade} variant="default">
                  Upgrade Now
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Next Button */}
      <div className="flex items-center gap-2">
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
    </div>
  );
};