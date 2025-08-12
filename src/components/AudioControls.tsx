import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Square } from 'lucide-react';
import { SimpleAudioEngine } from '@/services/SimpleAudioEngine';
import { useIsMobile } from '@/hooks/use-mobile';

interface AudioControlsProps {
  text: string;
  contentHash?: string;
  onPlayingChange?: (playing: boolean) => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({ text, contentHash, onPlayingChange }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const { isMobileOrTablet } = useIsMobile();
  const lastTapRef = useRef<number>(0);
  const retriedRef = useRef<boolean>(false);

  useEffect(() => {
    const iv = setInterval(() => {
      const st = SimpleAudioEngine.getInstance().getStatus();
      setIsPlaying(prev => (prev !== st.isPlaying ? st.isPlaying : prev));
      if (onPlayingChange) onPlayingChange(st.isPlaying);
    }, 400);
    return () => clearInterval(iv);
  }, [onPlayingChange]);

  const onPlay = async () => {
    const now = Date.now();
    if (now - (lastTapRef.current || 0) < 350) return; // debounce rapid taps
    lastTapRef.current = now;
    retriedRef.current = false;

    const engine = SimpleAudioEngine.getInstance();
    try {
      // Ensure UI/content hash is stable and enforce mobile/tablet pre-wait
      const uiHash = (typeof window !== 'undefined' && (window as any).__pageContentHash) || contentHash;
      if (isMobileOrTablet) {
        await new Promise((r) => setTimeout(r, 1200));
      }
      await engine.playText({ text, contentHash: uiHash });
      setIsPlaying(true);
      onPlayingChange?.(true);

      // Post-start verification on mobile/tablet to catch any late mismatch
      if (isMobileOrTablet) {
        setTimeout(() => {
          const st = SimpleAudioEngine.getInstance().getStatus();
          const latestUiHash = (typeof window !== 'undefined' && (window as any).__pageContentHash) || contentHash;
          if (st.isPlaying && st.contentHash && latestUiHash && st.contentHash !== latestUiHash) {
            console.warn('🛑 Audio/UI hash mismatch detected on mobile, stopping and retrying once');
            engine.stop();
            if (!retriedRef.current) {
              retriedRef.current = true;
              setTimeout(() => { onPlay(); }, 350);
            } else {
              setIsPlaying(false);
              onPlayingChange?.(false);
            }
          }
        }, 1000);
      }
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
        <Button size="lg" variant="default" onClick={onPlay} aria-label="Read to me">
          <Play className="w-5 h-5 mr-2" />
          Read to Me
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
