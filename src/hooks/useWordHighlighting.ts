import React, { useEffect } from 'react';
import { useSimpleAudioHighlighting } from '@/hooks/useSimpleAudioHighlighting';

/**
 * Simplified word highlighting hook with difficulty-based highlighting control
 * Levels 0-2: Enable highlighting, Levels 3-4: Disable highlighting
 */
export const useWordHighlighting = (
  text: string, 
  isAudioPlaying: boolean,
  difficulty: "beginner" | "easy" | "medium" | "hard" | "expert" = "easy"
) => {
  const { 
    highlightWord, 
    clearHighlighting, 
    currentHighlightedWord,
    setCleanupFunction
  } = useSimpleAudioHighlighting();

  // Difficulty level mapping
  const difficultyLevel = React.useMemo(() => {
    switch(difficulty) {
      case 'beginner': return 0;
      case 'easy': return 1;
      case 'medium': return 2;
      case 'hard': return 3;
      case 'expert': return 4;
      default: return 1;
    }
  }, [difficulty]);

  // Highlighting enabled only for levels 0-2
  const highlightingEnabled = difficultyLevel <= 2;

  // Clear highlighting on text change (new page/story)
  useEffect(() => {
    console.log('🧹 Word highlighting: Text changed, clearing highlights');
    clearHighlighting();
  }, [text, clearHighlighting]);

  // Difficulty-based word highlighting callback
  const onWordHighlight = React.useCallback((wordIndex: number) => {
    if (!highlightingEnabled) {
      console.log(`🚫 Word highlighting disabled for difficulty level ${difficultyLevel}`);
      return; // No highlighting for levels 3-4
    }

    if (wordIndex === -1) {
      clearHighlighting();
    } else {
      highlightWord(wordIndex);
    }
  }, [highlightWord, clearHighlighting, highlightingEnabled, difficultyLevel]);

  return {
    onWordHighlight,
    currentHighlightedWord: highlightingEnabled ? currentHighlightedWord : -1,
    setCleanupFunction,
    clearHighlighting,
    highlightingEnabled,
    difficultyLevel
  };
};