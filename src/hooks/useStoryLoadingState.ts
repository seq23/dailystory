// Story Loading State Hook - Manages loading states and debouncing for story generation
import { useState, useEffect, useRef } from 'react';
import { DifficultyLevel } from '@/types';

interface LoadingState {
  isLoading: boolean;
  loadingMessage: string;
  progress: number;
}

interface UseStoryLoadingStateOptions {
  debounceMs?: number;
  loadingMessages?: string[];
}

export function useStoryLoadingState(options: UseStoryLoadingStateOptions = {}) {
  const {
    debounceMs = 1000,
    loadingMessages = [
      'Crafting your story...',
      'Adding magical details...',
      'Almost ready...'
    ]
  } = options;

  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    loadingMessage: loadingMessages[0],
    progress: 0
  });

  const [pendingDifficulty, setPendingDifficulty] = useState<DifficultyLevel | null>(null);
  const [activeDifficulty, setActiveDifficulty] = useState<DifficultyLevel | null>(null);
  
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const progressTimeoutRef = useRef<NodeJS.Timeout>();
  const messageIntervalRef = useRef<NodeJS.Timeout>();

  // Start loading with progress animation
  const startLoading = (message?: string) => {
    setLoadingState({
      isLoading: true,
      loadingMessage: message || loadingMessages[0],
      progress: 0
    });

    // Animate progress
    let currentProgress = 0;
    progressTimeoutRef.current = setInterval(() => {
      currentProgress += Math.random() * 15 + 5; // Random increment between 5-20%
      if (currentProgress > 90) currentProgress = 90; // Cap at 90% until completion
      
      setLoadingState(prev => ({
        ...prev,
        progress: currentProgress
      }));
    }, 200);

    // Cycle through loading messages
    let messageIndex = 0;
    messageIntervalRef.current = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      setLoadingState(prev => ({
        ...prev,
        loadingMessage: loadingMessages[messageIndex]
      }));
    }, 1500);
  };

  // Stop loading and complete progress
  const stopLoading = () => {
    // Complete progress animation
    setLoadingState(prev => ({
      ...prev,
      progress: 100
    }));

    // Clean up intervals
    if (progressTimeoutRef.current) {
      clearInterval(progressTimeoutRef.current);
    }
    if (messageIntervalRef.current) {
      clearInterval(messageIntervalRef.current);
    }

    // Hide loading after brief completion display
    setTimeout(() => {
      setLoadingState({
        isLoading: false,
        loadingMessage: loadingMessages[0],
        progress: 0
      });
    }, 500);
  };

  // Debounced difficulty change handler
  const requestDifficultyChange = (newDifficulty: DifficultyLevel) => {
    setPendingDifficulty(newDifficulty);
    
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Show loading immediately for user feedback
    startLoading('Changing difficulty...');

    // Set debounced timeout
    debounceTimeoutRef.current = setTimeout(() => {
      setActiveDifficulty(newDifficulty);
      setPendingDifficulty(null);
    }, debounceMs);
  };

  // Cancel any pending difficulty change
  const cancelPendingChange = () => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    setPendingDifficulty(null);
    stopLoading();
  };

  // Check if difficulty change is pending
  const isPendingChange = pendingDifficulty !== null;

  // Get current effective difficulty (active or pending)
  const getCurrentDifficulty = () => activeDifficulty || pendingDifficulty;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (progressTimeoutRef.current) {
        clearInterval(progressTimeoutRef.current);
      }
      if (messageIntervalRef.current) {
        clearInterval(messageIntervalRef.current);
      }
    };
  }, []);

  return {
    loadingState,
    startLoading,
    stopLoading,
    requestDifficultyChange,
    cancelPendingChange,
    isPendingChange,
    pendingDifficulty,
    activeDifficulty,
    getCurrentDifficulty
  };
}