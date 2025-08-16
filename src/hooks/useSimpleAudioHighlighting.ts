import { useState, useCallback, useRef } from 'react';

/**
 * Simplified audio highlighting hook with lean architecture
 * Removed circular dependencies and excessive state management
 */
export const useSimpleAudioHighlighting = () => {
  const [currentHighlightedWord, setCurrentHighlightedWord] = useState(-1);
  const [isActive, setIsActive] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Simple word highlighting
  const highlightWord = useCallback((wordIndex: number) => {
    console.log(`🎯 Highlighting word ${wordIndex}`);
    setCurrentHighlightedWord(wordIndex);
  }, []);

  // Clear highlighting
  const clearHighlighting = useCallback(() => {
    console.log('🧹 Clearing highlights');
    setCurrentHighlightedWord(-1);
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
  }, []);

  // Start highlighting session
  const startHighlighting = useCallback(() => {
    console.log('🎵 Starting highlighting session');
    setIsActive(true);
    setCurrentHighlightedWord(-1);
  }, []);

  // Stop highlighting session
  const stopHighlighting = useCallback(() => {
    console.log('🛑 Stopping highlighting session');
    setIsActive(false);
    clearHighlighting();
  }, [clearHighlighting]);

  // Set cleanup function for external cleanup
  const setCleanupFunction = useCallback((cleanup: () => void) => {
    cleanupRef.current = cleanup;
  }, []);

  return {
    currentHighlightedWord,
    isActive,
    highlightWord,
    clearHighlighting,
    startHighlighting,
    stopHighlighting,
    setCleanupFunction
  };
};