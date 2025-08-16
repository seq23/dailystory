import React, { useEffect } from 'react';
import { useOpenAIVoiceCommands } from '@/hooks/useOpenAIVoiceCommands';

export const OpenAIVoiceSystem: React.FC = () => {
  const { start, stop, connected } = useOpenAIVoiceCommands();

  // Handle global voice events
  useEffect(() => {
    const handleOpenAIStart = () => {
      console.log('🎤 OpenAI voice system starting...');
      if (!connected) start();
    };
    
    const handleStop = () => {
      if (connected) stop();
    };

    window.addEventListener('openai:start', handleOpenAIStart);
    window.addEventListener('voice:stop', handleStop);

    return () => {
      window.removeEventListener('openai:start', handleOpenAIStart);
      window.removeEventListener('voice:stop', handleStop);
    };
  }, [connected, start, stop]);

  // This component is invisible - it only handles voice logic
  return null;
};