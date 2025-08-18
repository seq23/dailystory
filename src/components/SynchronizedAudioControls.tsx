import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Square, RotateCcw } from 'lucide-react';
import { SimplifiedAudioEngine } from '@/services/SimplifiedAudioEngine';
import { useToast } from '@/hooks/use-toast';

interface SynchronizedAudioControlsProps {
  text: string;
  contentHash?: string;
  onPlayingChange?: (playing: boolean) => void;
  onWordHighlight?: (wordIndex: number) => void;
}

/**
 * Audio controls using ElevenLabs native timing synchronization
 * Replaces manual timing calculations with /with-timestamps API
 */
export const SynchronizedAudioControls: React.FC<SynchronizedAudioControlsProps> = ({
  text,
  contentHash,
  onPlayingChange,
  onWordHighlight
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  const audioEngine = SimplifiedAudioEngine.getInstance();

  // Listen for audio state changes
  useEffect(() => {
  const handleStateChange = (event: CustomEvent) => {
    const playing = event.detail.isPlaying;
    setIsPlaying(playing);
    onPlayingChange?.(playing);
    
    // Only clear loading state when audio actually starts playing
    if (playing) {
      setIsLoading(false);
    }
    
    if (!playing) {
      setError(null);
    }
  };

    window.addEventListener('audio:statechange', handleStateChange as EventListener);
    
    return () => {
      window.removeEventListener('audio:statechange', handleStateChange as EventListener);
    };
  }, [onPlayingChange]);

  const onPlay = async () => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🎵 SynchronizedAudioControls: Starting playback');
      
      await audioEngine.playTextWithSynchronization({
        text,
        contentHash,
        context: 'conversation', // Always use conversation for natural Charlotte voice
        onWordHighlight
      });
      
      setRetryCount(0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Audio playback failed';
      console.error('🎵 SynchronizedAudioControls: Playback failed:', errorMessage);
      
      setError(errorMessage);
      setIsLoading(false);
      
      toast({
        title: "Audio Error",
        description: "Could not play audio. Trying device voice...",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const onRetry = async () => {
    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);
    
    console.log(`🔄 SynchronizedAudioControls: Retry attempt ${newRetryCount}`);
    
    // Exponential backoff delay
    const delay = Math.min(5000, Math.pow(2, newRetryCount - 1) * 1000);
    if (delay > 1000) {
      toast({
        title: "Retrying...",
        description: `Waiting ${delay / 1000} seconds before retry`,
        duration: delay,
      });
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    await onPlay();
  };

  const onStop = () => {
    console.log('🛑 SynchronizedAudioControls: Stopping playback');
    
    audioEngine.stop();
    
    // Clear any word highlighting
    if (onWordHighlight) {
      onWordHighlight(-1);
    }
    
    setIsPlaying(false);
    setIsLoading(false);
    setError(null);
    
    // Notify parent component
    onPlayingChange?.(false);
    
    // Dispatch global state change event
    window.dispatchEvent(new CustomEvent('audio:statechange', { 
      detail: { isPlaying: false } 
    }));
  };

  if (isLoading) {
    return (
      <Button disabled variant="outline" className="gap-2">
        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
        Loading Audio...
      </Button>
    );
  }

  if (error) {
    return (
      <Button onClick={onRetry} variant="outline" className="gap-2 text-orange-600 border-orange-300 hover:bg-orange-50">
        <RotateCcw className="h-4 w-4" />
        Try Again {retryCount > 0 && `(${retryCount})`}
      </Button>
    );
  }

  if (isPlaying) {
    return (
      <Button onClick={onStop} variant="outline" className="gap-2">
        <Square className="h-4 w-4" />
        Stop
      </Button>
    );
  }

  return (
    <Button onClick={onPlay} variant="outline" className="gap-2">
      <Play className="h-4 w-4" />
      Read to Me
    </Button>
  );
};