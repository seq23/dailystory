import { useEffect } from 'react';
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

  // Handle audio state changes
  useEffect(() => {
    if (isAudioPlaying) {
      startHighlighting();
    } else {
      stopHighlighting();
    }
  }, [isAudioPlaying, startHighlighting, stopHighlighting]);

  // Clear highlighting on text change (new page/story)
  useEffect(() => {
    console.log('🧹 Word highlighting: Text changed, clearing highlights');
    clearHighlighting();
  }, [text, clearHighlighting]);

  // Simple highlight callback
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
    setCleanupFunction,
    clearHighlighting
  };
};