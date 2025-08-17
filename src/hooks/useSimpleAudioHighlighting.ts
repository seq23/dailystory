
import { useState, useCallback } from 'react';

/**
 * Simplified audio highlighting hook with no circular dependencies
 * Uses direct state management instead of callback patterns
 */
export const useSimpleAudioHighlighting = () => {
  const [currentHighlightedWord, setCurrentHighlightedWord] = useState(-1);
  const [isActive, setIsActive] = useState(false);

  // Simple word highlighting without callback dependencies
  const highlightWord = useCallback((wordIndex: number) => {
    console.log(`🎯 Highlighting word ${wordIndex}`);
    setCurrentHighlightedWord(wordIndex);
  }, []);

  // Clear highlighting without cleanup callbacks
  const clearHighlighting = useCallback(() => {
    console.log('🧹 Clearing highlights');
    setCurrentHighlightedWord(-1);
    // Remove cleanup callback that was causing circular dependency
  }, []);

  // Start highlighting session
  const startHighlighting = useCallback(() => {
    if (isActive) {
      console.log('🎵 Already highlighting, ignoring start request');
      return;
    }
    console.log('🎵 Starting highlighting session');
    setIsActive(true);
    setCurrentHighlightedWord(-1);
  }, [isActive]);

  // Stop highlighting session
  const stopHighlighting = useCallback(() => {
    if (!isActive) {
      console.log('🛑 Already inactive, ignoring stop request');
      return;
    }
    console.log('🛑 Stopping highlighting session');
    setIsActive(false);
    clearHighlighting();
  }, [isActive, clearHighlighting]);

  return {
    currentHighlightedWord,
    isActive,
    highlightWord,
    clearHighlighting,
    startHighlighting,
    stopHighlighting
  };
};
