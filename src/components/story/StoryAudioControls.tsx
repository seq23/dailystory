import React from 'react';
import { SynchronizedAudioControls } from "@/components/SynchronizedAudioControls";
import { SimplifiedAudioEngine } from "@/services/SimplifiedAudioEngine";
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
        onAudioStateChange(false, true);
        await audioEngineRef.current.speak(currentStoryText);
        onAudioStateChange(true, false);
        onAudioPlayed(currentPage);
      }
    } catch (error) {
      DebugLogger.error('audio', 'Audio playback failed', error);
      onAudioStateChange(false, false);
    }
  };

  return (
    <div className="story-audio-controls">
      <SynchronizedAudioControls
        text={currentStoryText}
        onPlayingChange={(playing) => onAudioStateChange(playing, false)}
      />
      
      {/* Mobile Audio Button */}
      <Button
        onClick={handleDockPlayAudio}
        disabled={audioDisabled}
        variant="ghost"
        size="sm"
        className="audio-dock-button"
      >
        {isAudioLoading ? (
          <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
        ) : isAudioPlaying ? (
          <VolumeX className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
};