import { useEffect, useRef } from 'react';
import { useAudioHighlighting } from '@/hooks/useAudioHighlighting';

/**
 * Hook to provide synchronized word highlighting during audio playback
 * Integrates with the enhanced audio sync service for precise timing
 */
export const useWordHighlighting = (text: string, isAudioPlaying: boolean) => {
  const { 
    highlightWord, 
    clearHighlighting, 
    startAudioHighlighting, 
    stopAudioHighlighting,
    currentHighlightedWord,
    getHighlightingState
  } = useAudioHighlighting();
  
  const cleanupRef = useRef<(() => void) | null>(null);

  // Handle audio state changes
  useEffect(() => {
    if (isAudioPlaying) {
      startAudioHighlighting();
    } else {
      stopAudioHighlighting();
    }
  }, [isAudioPlaying]); // Remove function dependencies to prevent circular updates

  // Enhanced cleanup on text change (new page/story)
  useEffect(() => {
    // Clear highlighting immediately when text changes
    console.log('🧹 Word highlighting: Text changed, clearing highlights');
    clearHighlighting();
    
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      clearHighlighting();
    };
  }, [text]); // Remove clearHighlighting from dependencies to prevent circular updates

  // Enhanced highlight callback with sync monitoring
  const onWordHighlight = (wordIndex: number) => {
    if (wordIndex === -1) {
      // Clear highlighting
      clearHighlighting();
      return;
    }

    // Apply highlighting with enhanced visual feedback
    highlightWord(wordIndex);
    
    // Log for debugging and monitoring
    const state = getHighlightingState();
    if (state.syncOffset !== 0) {
      console.log(`🔄 Highlight sync offset: ${state.syncOffset}`);
    }
  };

  // Register cleanup function
  const setCleanupFunction = (cleanup: () => void) => {
    cleanupRef.current = cleanup;
  };

  return {
    onWordHighlight,
    currentHighlightedWord,
    setCleanupFunction,
    clearHighlighting
  };
};