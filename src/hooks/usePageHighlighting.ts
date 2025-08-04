import { useRef, useEffect } from 'react';

/**
 * Hook to manage word highlighting state and ensure proper cleanup on page changes
 */
export const usePageHighlighting = () => {
  const currentHighlightRef = useRef<number>(-1);
  const cleanupCallbackRef = useRef<(() => void) | null>(null);

  // Reset highlighting when component unmounts or page changes
  const resetHighlighting = () => {
    if (cleanupCallbackRef.current) {
      cleanupCallbackRef.current();
    }
    currentHighlightRef.current = -1;
    console.log('🧹 Page highlighting reset');
  };

  // Set the cleanup callback for when page changes
  const setCleanupCallback = (callback: () => void) => {
    cleanupCallbackRef.current = callback;
  };

  // Update current highlighted word
  const setHighlightedWord = (wordIndex: number) => {
    currentHighlightRef.current = wordIndex;
  };

  // Get current highlighted word
  const getHighlightedWord = () => {
    return currentHighlightRef.current;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetHighlighting();
    };
  }, []);

  return {
    resetHighlighting,
    setCleanupCallback,
    setHighlightedWord,
    getHighlightedWord
  };
};