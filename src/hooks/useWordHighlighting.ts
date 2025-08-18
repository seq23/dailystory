import React, { useEffect } from 'react';
import { useSimpleAudioHighlighting } from '@/hooks/useSimpleAudioHighlighting';

/**
 * Simplified word highlighting hook - now just forwards events from SimplifiedAudioEngine
 * ElevenLabs native timing eliminates need for manual calculations and loop protection
 */
export const useWordHighlighting = (text: string, isAudioPlaying: boolean) => {
  const { 
    highlightWord, 
    clearHighlighting, 
    currentHighlightedWord,
    setCleanupFunction
  } = useSimpleAudioHighlighting();

  // Clear highlighting on text change (new page/story)
  useEffect(() => {
    console.log('🧹 Word highlighting: Text changed, clearing highlights');
    clearHighlighting();
  }, [text, clearHighlighting]);

  // Simple word highlighting callback - no loop protection needed with native timing
  const onWordHighlight = React.useCallback((wordIndex: number) => {
    if (wordIndex === -1) {
      clearHighlighting();
    } else {
      highlightWord(wordIndex);
    }
  }, [highlightWord, clearHighlighting]);

  return {
    onWordHighlight,
    currentHighlightedWord,
    setCleanupFunction,
    clearHighlighting
  };
};