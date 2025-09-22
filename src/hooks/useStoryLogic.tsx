import { useState, useEffect, useCallback, useRef } from "react";
import { DebugLogger } from '@/services/DebugLogger';
import { generateSessionId, generateSessionIdWithPrefix } from '@/utils/sessionId';
import type { UserInfo, DifficultyLevel, ExpertGradeLevel } from '@/types';

export interface StoryState {
  story: string[];
  currentPage: number;
  storyId: string;
  storyTitle: string;
  isStoryComplete: boolean;
  isStoryStable: boolean;
  liveContext: any;
  timeRemaining: number;
  isTimerRunning: boolean;
  isTimerCanceled: boolean;
  timerEnabled: boolean;
  userPausedTimer: boolean;
  hasChosenUntimed: boolean;
}

export interface StoryActions {
  setStory: (story: string[]) => void;
  setCurrentPage: (page: number) => void;
  setStoryId: (id: string) => void;
  setStoryTitle: (title: string) => void;
  setIsStoryComplete: (complete: boolean) => void;
  setIsStoryStable: (stable: boolean) => void;
  setLiveContext: (context: any) => void;
  setTimeRemaining: (time: number) => void;
  setIsTimerRunning: (running: boolean) => void;
  setIsTimerCanceled: (canceled: boolean) => void;
  setTimerEnabled: (enabled: boolean) => void;
  setUserPausedTimer: (paused: boolean) => void;
  setHasChosenUntimed: (chosen: boolean) => void;
}

export interface UseStoryLogicProps {
  userInfo: UserInfo;
  isPremium: boolean;
  initialDifficulty: DifficultyLevel;
  expertGradeLevel?: ExpertGradeLevel;
  onSessionEnded?: (stats: any) => void;
}

export const useStoryLogic = ({
  userInfo,
  isPremium,
  initialDifficulty,
  expertGradeLevel,
  onSessionEnded
}: UseStoryLogicProps) => {
  // Core story state
  const [story, setStory] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [storyId, setStoryId] = useState(() => generateSessionIdWithPrefix('story'));
  const [storyTitle, setStoryTitle] = useState('');
  const [isStoryComplete, setIsStoryComplete] = useState(false);
  const [isStoryStable, setIsStoryStable] = useState(false);
  const [liveContext, setLiveContext] = useState<any>(null);

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(20 * 60); // 20 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimerCanceled, setIsTimerCanceled] = useState(false);
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [userPausedTimer, setUserPausedTimer] = useState(false);
  const [hasChosenUntimed, setHasChosenUntimed] = useState(false);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingNextPage, setIsLoadingNextPage] = useState(false);
  const [isGeneratingNewStory, setIsGeneratingNewStory] = useState(false);
  const [isGeneratingRewrite, setIsGeneratingRewrite] = useState(false);

  // Session tracking
  const sessionStartTime = useRef(Date.now());
  const characterSessionId = useRef(generateSessionId());

  // Initialize timer on mount
  useEffect(() => {
    if (!isPremium) {
      // Guests always have timer enabled
      setIsTimerRunning(true);
    } else {
      // Premium users check localStorage preference
      try {
        const timerPref = localStorage.getItem('readingTimerEnabled');
        const enabled = timerPref !== '0';
        setTimerEnabled(enabled);
        if (enabled) {
          setIsTimerRunning(true);
        }
      } catch (error) {
        DebugLogger.warn('story', 'Failed to load timer preference', error);
      }
    }
  }, [isPremium]);

  // Timer countdown effect
  useEffect(() => {
    if (!isTimerRunning || isTimerCanceled || hasChosenUntimed) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          if (onSessionEnded) {
            const sessionStats = {
              timeSpent: (20 * 60 - prev) * 1000,
              wordsRead: 0, // This would be calculated elsewhere
              pagesRead: currentPage + 1,
              startTime: sessionStartTime.current,
              accuracy: 100
            };
            onSessionEnded(sessionStats);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, isTimerCanceled, hasChosenUntimed, currentPage, onSessionEnded]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (currentPage < story.length - 1) {
      setCurrentPage(currentPage + 1);
      DebugLogger.log('story', 'Navigated to next page', { 
        newPage: currentPage + 1, 
        totalPages: story.length 
      });
    }
  }, [currentPage, story.length]);

  const handlePrevious = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      DebugLogger.log('story', 'Navigated to previous page', { 
        newPage: currentPage - 1 
      });
    }
  }, [currentPage]);

  // Timer controls
  const handleToggleTimer = useCallback(() => {
    if (userPausedTimer) {
      setIsTimerRunning(true);
      setUserPausedTimer(false);
    } else {
      setIsTimerRunning(false);
      setUserPausedTimer(true);
    }
    DebugLogger.log('story', 'Timer toggled', { 
      isRunning: !isTimerRunning, 
      userPaused: !userPausedTimer 
    });
  }, [isTimerRunning, userPausedTimer]);

  const handleReduceTime = useCallback(() => {
    const reduction = 5 * 60; // 5 minutes
    setTimeRemaining(prev => Math.max(60, prev - reduction)); // Minimum 1 minute
    DebugLogger.log('story', 'Time reduced', { reduction, newTime: timeRemaining - reduction });
  }, [timeRemaining]);

  return {
    // State
    state: {
      story,
      currentPage,
      storyId,
      storyTitle,
      isStoryComplete,
      isStoryStable,
      liveContext,
      timeRemaining,
      isTimerRunning,
      isTimerCanceled,
      timerEnabled,
      userPausedTimer,
      hasChosenUntimed,
      isLoading,
      isLoadingNextPage,
      isGeneratingNewStory,
      isGeneratingRewrite
    },

    // Actions
    actions: {
      setStory,
      setCurrentPage,
      setStoryId,
      setStoryTitle,
      setIsStoryComplete,
      setIsStoryStable,
      setLiveContext,
      setTimeRemaining,
      setIsTimerRunning,
      setIsTimerCanceled,
      setTimerEnabled,
      setUserPausedTimer,
      setHasChosenUntimed,
      setIsLoading,
      setIsLoadingNextPage,
      setIsGeneratingNewStory,
      setIsGeneratingRewrite
    },

    // Handlers
    handlers: {
      handleNext,
      handlePrevious,
      handleToggleTimer,
      handleReduceTime
    },

    // Refs
    refs: {
      sessionStartTime,
      characterSessionId
    }
  };
};