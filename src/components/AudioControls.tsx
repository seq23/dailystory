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

  // Event-driven state updates instead of polling
  useEffect(() => {
    const handleAudioStateChange = (event: CustomEvent) => {
      const isPlayingNow = event.detail.isPlaying;
      setIsPlaying(isPlayingNow);
      if (onPlayingChange) onPlayingChange(isPlayingNow);
    };

    window.addEventListener('audio:statechange', handleAudioStateChange as EventListener);
    return () => {
      window.removeEventListener('audio:statechange', handleAudioStateChange as EventListener);
    };
  }, [onPlayingChange]);

  const onPlay = async () => {
    const now = Date.now();
    if (now - (lastTapRef.current || 0) < 350) return; // debounce rapid taps
    lastTapRef.current = now;

    // Lock content hash during audio preparation
    const uiHash = (typeof window !== 'undefined' && (window as any).__pageContentHash) || contentHash;
    if (typeof window !== 'undefined') {
      (window as any).__audioHashLocked = uiHash;
    }

    const engine = SimpleAudioEngine.getInstance();
    try {
      // Reduced mobile delay - remove the problematic 1200ms wait
      if (isMobileOrTablet) {
        await new Promise((r) => setTimeout(r, 300)); // Minimal 300ms delay
      }
      
      await engine.playText({ 
        text, 
        contentHash: uiHash,
        voiceId: 'XB0fDUnXU5powFXDhCwa' // Charlotte
      });
      
      // Immediate state update without polling
      setIsPlaying(true);
      onPlayingChange?.(true);
      
      // Emit state change event for other components
      window.dispatchEvent(new CustomEvent('audio:statechange', { 
        detail: { isPlaying: true } 
      }));
      
    } catch (e) {
      console.error('Play failed', e);
      setIsPlaying(false);
      onPlayingChange?.(false);
      window.dispatchEvent(new CustomEvent('audio:statechange', { 
        detail: { isPlaying: false } 
      }));
    } finally {
      // Unlock hash after audio starts
      if (typeof window !== 'undefined') {
        delete (window as any).__audioHashLocked;
      }
    }
  };
  const onStop = () => {
    const engine = SimpleAudioEngine.getInstance();
    engine.stop();
    
    // Immediate state update
    setIsPlaying(false);
    onPlayingChange?.(false);
    
    // Emit state change event for other components
    window.dispatchEvent(new CustomEvent('audio:statechange', { 
      detail: { isPlaying: false } 
    }));
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
