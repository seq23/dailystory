import React from 'react';
import { UnifiedAudioControls as SynchronizedAudioControls } from "@/components/UnifiedAudioControls";
import { DebugLogger } from '@/services/DebugLogger';
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StoryAudioControlsProps {
  audioEngineRef: React.RefObject<any>;
  isAudioPlaying: boolean;
  isAudioLoading: boolean;
  audioDisabled: boolean;
  currentStoryText: string;
  userInfo: any;
  isPremium: boolean;
  currentPage: number;
  audioPlayedPage: number;
  onAudioStateChange: (playing: boolean, loading: boolean) => void;
  onAudioPlayed: (page: number) => void;
}

export const StoryAudioControls: React.FC<StoryAudioControlsProps> = ({
  audioEngineRef,
  isAudioPlaying,
  isAudioLoading,
  audioDisabled,
  currentStoryText,
  userInfo,
  isPremium,
  currentPage,
  audioPlayedPage,
  onAudioStateChange,
  onAudioPlayed
}) => {
  const handleDockPlayAudio = async () => {
    if (!audioEngineRef.current) return;
    
    try {
      if (isAudioPlaying) {
        await audioEngineRef.current.stop();
        onAudioStateChange(false, false);
      } else {
        // Show loading state
        onAudioStateChange(false, true);
        
        // Initiate audio playback
        const audioPromise = audioEngineRef.current.speak(currentStoryText);
        
        // Keep loading until audio:statechange signals playback start
        // Wait for audio to complete
        await audioPromise;
        onAudioPlayed(currentPage);
      }
    } catch (error) {
      DebugLogger.error('audio', 'Audio playback failed', error);
      onAudioStateChange(false, false);
    }
  };

  const handleWordHighlight = (wordIndex: number) => {
    try {
      window.dispatchEvent(new CustomEvent('highlighting:request', { detail: { wordIndex } }));
    } catch (error) {
      DebugLogger.error('audio', 'Failed to dispatch highlighting:request', error);
    }
  };

  return (
    <SynchronizedAudioControls
      text={currentStoryText}
      userInfo={userInfo}
      isPremium={isPremium}
      onPlayingChange={(playing) => onAudioStateChange(playing, false)}
      onWordHighlight={handleWordHighlight}
    />
  );
};