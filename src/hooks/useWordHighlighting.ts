import { useEffect, useRef } from 'react';
import { useSimpleAudioHighlighting } from '@/hooks/useSimpleAudioHighlighting';

/**
 * Simplified word highlighting hook for audio playback
 * Clean architecture without circular dependencies
 */
export const useWordHighlighting = (text: string, isAudioPlaying: boolean) => {
  const { 
    highlightWord, 
    clearHighlighting, 
    startHighlighting, 
    stopHighlighting,
    currentHighlightedWord,
    setCleanupFunction
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

  // Circuit breaker to prevent infinite highlighting loops
  const lastHighlightedRef = useRef<{ wordIndex: number; timestamp: number } | null>(null);
  const highlightCountRef = useRef(0);

  // Simple highlight callback with circuit breaker
  const onWordHighlight = (wordIndex: number) => {
    const now = Date.now();
    
    // Check for infinite loop protection
    if (lastHighlightedRef.current && 
        lastHighlightedRef.current.wordIndex === wordIndex &&
        now - lastHighlightedRef.current.timestamp < 100) {
      highlightCountRef.current++;
      
      // If we've highlighted the same word more than 5 times in 100ms, stop
      if (highlightCountRef.current > 5) {
        console.warn(`🚨 Infinite highlighting loop detected for word ${wordIndex}. Stopping.`);
        clearHighlighting();
        return;
      }
    } else {
      // Reset counter for new word or after delay
      highlightCountRef.current = 0;
    }
    
    lastHighlightedRef.current = { wordIndex, timestamp: now };
    
    if (wordIndex === -1) {
      clearHighlighting();
    } else {
      highlightWord(wordIndex);
    }
  };

  return {
    onWordHighlight,
    currentHighlightedWord,
    setCleanupFunction,
    clearHighlighting
  };
};