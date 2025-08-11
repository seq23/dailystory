import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Square } from 'lucide-react';
import { SimpleAudioEngine } from '@/services/SimpleAudioEngine';

interface AudioControlsProps {
  text: string;
  contentHash?: string;
  onPlayingChange?: (playing: boolean) => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({ text, contentHash, onPlayingChange }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => {
      const st = SimpleAudioEngine.getInstance().getStatus();
      setIsPlaying(prev => (prev !== st.isPlaying ? st.isPlaying : prev));
      if (onPlayingChange) onPlayingChange(st.isPlaying);
    }, 400);
    return () => clearInterval(iv);
  }, [onPlayingChange]);

  const onPlay = async () => {
    const engine = SimpleAudioEngine.getInstance();
    try {
      await engine.playText({ text, contentHash });
      setIsPlaying(true);
      onPlayingChange?.(true);
    } catch (e) {
      console.error('Play failed', e);
      setIsPlaying(false);
      onPlayingChange?.(false);
    }
  };

  const onStop = () => {
    const engine = SimpleAudioEngine.getInstance();
    engine.stop();
    setIsPlaying(false);
    onPlayingChange?.(false);
  };

  return (
    <div className="flex items-center gap-3">
      {!isPlaying ? (
        <Button size="lg" variant="default" onClick={onPlay} aria-label="Play narration">
          <Play className="w-5 h-5 mr-2" />
          Play
        </Button>
      ) : (
        <Button size="lg" variant="destructive" onClick={onStop} aria-label="Stop narration">
          <Square className="w-5 h-5 mr-2" />
          Stop
        </Button>
      )}
    </div>
  );
};

export default AudioControls;
