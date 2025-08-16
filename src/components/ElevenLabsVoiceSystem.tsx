import React, { useEffect } from 'react';
import { useElevenLabsVoiceCommands } from '@/hooks/useElevenLabsVoiceCommands';

export const ElevenLabsVoiceSystem: React.FC = () => {
  const { start, stop, connected, connecting } = useElevenLabsVoiceCommands();

  // Handle global voice events
  useEffect(() => {
    const handleStart = () => { 
      if (!connected && !connecting) start(); 
    };
    
    const handleStop = () => { 
      if (connected) stop(); 
    };
    
    const handleToggle = () => { 
      if (connected) { 
        stop(); 
      } else if (!connecting) { 
        start(); 
      } 
    };

    window.addEventListener('voice:start', handleStart as EventListener);
    window.addEventListener('voice:stop', handleStop as EventListener);
    window.addEventListener('voice:toggle', handleToggle as EventListener);
    
    return () => {
      window.removeEventListener('voice:start', handleStart as EventListener);
      window.removeEventListener('voice:stop', handleStop as EventListener);
      window.removeEventListener('voice:toggle', handleToggle as EventListener);
    };
  }, [connected, connecting, start, stop]);

  // This component is invisible - it only handles voice logic
  return null;
};