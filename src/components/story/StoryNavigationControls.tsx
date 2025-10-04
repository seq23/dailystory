/**
 * CRITICAL REGRESSION PREVENTION:
 * 
 * This component handles NAVIGATION ONLY (Previous/Next page controls).
 * 
 * ❌ DO NOT ADD "Next Story" BUTTONS HERE ❌
 * 
 * The "Next Story" functionality for guest users is handled by the
 * Magic Wand button in CleanStoryDisplay.tsx (lines 4057-4132).
 * 
 * Separation of Concerns:
 * - Navigation Controls: Previous/Next page navigation
 * - Action Buttons (CleanStoryDisplay): Story actions (Next Story, Finish Story)
 * 
 * See: docs/NEXT_STORY_BUTTON_REGRESSION_FIX.md
 * See: docs/UI_COMPONENT_RESPONSIBILITIES.md
 */

import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, RefreshCw, GraduationCap } from "lucide-react";
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
  canGoNext: boolean;
  canGoPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onGenerateNext: () => void;
  /**
   * IMPORTANT: This prop exists for INTERNAL USE ONLY.
   * It should NOT be used to render a "Next Story" button in this component.
   * 
   * The "Next Story" button is rendered in CleanStoryDisplay.tsx only.
   * This prop is passed through for potential future use cases.
   * 
   * @deprecated in navigation context - use CleanStoryDisplay Magic Wand button
   */
  onGenerateNewStory: () => void;
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
  canGoNext,
  canGoPrevious,
  onNext,
  onPrevious,
  onGenerateNext,
  onGenerateNewStory,
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