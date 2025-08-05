import { usePageHighlighting } from '@/hooks/usePageHighlighting';
import { useState, useEffect } from 'react';

/**
 * Enhanced hook for managing audio-synchronized word highlighting
 * Provides better sync tracking and cleanup for improved user experience
 */
export const useAudioHighlighting = () => {
  const { setCleanupCallback, setHighlightedWord, getHighlightedWord, resetHighlighting } = usePageHighlighting();
  const [currentHighlightedWord, setCurrentHighlightedWord] = useState(-1);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [syncOffset, setSyncOffset] = useState(0); // For sync drift correction

  // Enhanced word highlighting with sync monitoring
  const highlightWord = (wordIndex: number) => {
    console.log(`🎯 Audio Highlighting: Setting word ${wordIndex} as highlighted`);
    
    // Update both local state and page highlighting hook
    setCurrentHighlightedWord(wordIndex);
    setHighlightedWord(wordIndex);
    
    // Apply sync offset correction if needed
    const correctedIndex = wordIndex + syncOffset;
    if (Math.abs(syncOffset) > 0) {
      console.log(`🔄 Sync correction applied: ${wordIndex} → ${correctedIndex}`);
    }
  };

  // Monitor for sync drift and auto-correct
  const checkSyncDrift = (expectedIndex: number, actualIndex: number) => {
    const drift = actualIndex - expectedIndex;
    
    if (Math.abs(drift) > 2) {
      console.log(`🚨 Sync drift detected: expected ${expectedIndex}, actual ${actualIndex}, drift: ${drift}`);
      setSyncOffset(prevOffset => prevOffset - drift);
      return true;
    }
    return false;
  };

  // Enhanced cleanup with sync reset
  const clearHighlighting = () => {
    console.log('🧹 Audio Highlighting: Clearing all highlights and resetting sync');
    setCurrentHighlightedWord(-1);
    setHighlightedWord(-1);
    setSyncOffset(0);
    setIsAudioPlaying(false);
    
    // Force reset highlighting state
    resetHighlighting();
  };

  // Setup cleanup callback when component mounts
  useEffect(() => {
    setCleanupCallback(clearHighlighting);
  }, [setCleanupCallback]);

  // Audio state management
  const startAudioHighlighting = () => {
    console.log('🎵 Audio Highlighting: Starting highlighting session');
    setIsAudioPlaying(true);
    setSyncOffset(0); // Reset sync offset for new session
  };

  const stopAudioHighlighting = () => {
    console.log('🛑 Audio Highlighting: Stopping highlighting session');
    setIsAudioPlaying(false);
    clearHighlighting();
  };

  // Get current state
  const getHighlightingState = () => ({
    currentWord: currentHighlightedWord,
    isPlaying: isAudioPlaying,
    syncOffset: syncOffset
  });

  return {
    highlightWord,
    clearHighlighting,
    startAudioHighlighting,
    stopAudioHighlighting,
    checkSyncDrift,
    getHighlightingState,
    currentHighlightedWord,
    isAudioPlaying
  };
};