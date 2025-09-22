import React, { useEffect } from 'react';
import { MobileAudioManager } from '@/services/mobileAudioManager';
import { DebugLogger } from '@/services/DebugLogger';
import { ProductionLogging } from '@/services/ProductionLogger';

export const VoiceCommandIntegration: React.FC = () => {
  useEffect(() => {
    // Listen for voice command audio requests
    const handleVoiceAudioRequest = async () => {
      try {
        // Request audio coordination for voice commands
        window.dispatchEvent(new CustomEvent('audio:request', { 
          detail: { system: 'voice' } 
        }));
        
        // Initialize mobile audio if needed
        const mobileAudio = MobileAudioManager.getInstance();
        if (!mobileAudio.isAudioReady()) {
          await mobileAudio.initializeMobileAudio();
        }
        
        DebugLogger.log('audio', 'Voice command audio coordination established');
      } catch (error) {
        ProductionLogging.warn('AUDIO', 'Voice command audio setup failed', 'VoiceCommandIntegration', { error });
      }
    };

    // Listen for voice system start
    window.addEventListener('voice:start', handleVoiceAudioRequest);
    window.addEventListener('voice:toggle', handleVoiceAudioRequest);

    // Handle voice system stop
    const handleVoiceStop = () => {
      // Release voice audio coordination
      window.dispatchEvent(new CustomEvent('audio:stopped', { 
        detail: { system: 'voice' } 
      }));
    };

    window.addEventListener('voice:stop', handleVoiceStop);

    return () => {
      window.removeEventListener('voice:start', handleVoiceAudioRequest);
      window.removeEventListener('voice:toggle', handleVoiceAudioRequest);
      window.removeEventListener('voice:stop', handleVoiceStop);
    };
  }, []);

  // This component is invisible - it only handles voice-audio integration
  return null;
};