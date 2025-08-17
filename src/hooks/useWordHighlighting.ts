
import { useEffect, useRef } from 'react';
import { useSimpleAudioHighlighting } from '@/hooks/useSimpleAudioHighlighting';

/**
 * Simplified word highlighting hook for audio playback
 * Fixed circular dependency by removing cleanup function pattern
 */
export const useWordHighlighting = (text: string, isAudioPlaying: boolean) => {
  const { 
    highlightWord, 
    clearHighlighting, 
    startHighlighting, 
    stopHighlighting,
    currentHighlightedWord
  } = useSimpleAudioHighlighting();

  // Handle audio state changes with 300ms debouncing
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Clear any existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Set new debounced action
    debounceTimeoutRef.current = setTimeout(() => {
      if (isAudioPlaying) {
        startHighlighting();
      } else {
        stopHighlighting();
      }
    }, 300); // 300ms debounce to prevent rapid start/stop cycles
    
    // Cleanup function
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [isAudioPlaying, startHighlighting, stopHighlighting]);

  // Clear highlighting on text change (new page/story)
  useEffect(() => {
    console.log('🧹 Word highlighting: Text changed, clearing highlights');
    clearHighlighting();
  }, [text, clearHighlighting]);

  // Simple highlight callback without circular dependency
  const onWordHighlight = (wordIndex: number) => {
    if (wordIndex === -1) {
      clearHighlighting();
    } else {
      highlightWord(wordIndex);
    }
  };

  return {
    onWordHighlight,
    currentHighlightedWord,
    clearHighlighting
  };
};
