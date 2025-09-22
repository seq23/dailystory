import { useState, useCallback, useRef } from 'react';
import { DebugLogger } from '@/services/DebugLogger';

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
    DebugLogger.log('audio', 'Highlighting word', { wordIndex });
    setCurrentHighlightedWord(wordIndex);
  }, []);

  // Clear highlighting
  const clearHighlighting = useCallback(() => {
    DebugLogger.log('audio', 'Clearing highlights');
    setCurrentHighlightedWord(-1);
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
  }, []);

  // Start highlighting session
  const startHighlighting = useCallback(() => {
    DebugLogger.log('audio', 'Starting highlighting session');
    // Force reset state before starting
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    setIsActive(true);
    setCurrentHighlightedWord(-1);
  }, []);

  // Stop highlighting session  
  const stopHighlighting = useCallback(() => {
    DebugLogger.log('audio', 'Stopping highlighting session');
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