import { useEffect } from 'react';
import { SimpleAudioEngine } from '@/services/SimpleAudioEngine';

/**
 * Comprehensive audio recovery system
 * Handles cleanup and recovery for all audio systems when errors occur
 */
export const ComprehensiveAudioRecovery = () => {
  useEffect(() => {
    // Handle all audio system stops
    const handleStopAll = () => {
      console.log('🛑 Stopping all audio systems...');
      
      try {
        // Stop SimpleAudioEngine
        const audioEngine = SimpleAudioEngine.getInstance();
        audioEngine.stop();
      } catch (error) {
        console.warn('Failed to stop SimpleAudioEngine:', error);
      }

      try {
        // Stop browser speech synthesis
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      } catch (error) {
        console.warn('Failed to stop speech synthesis:', error);
      }

      try {
        // Stop any ElevenLabs audio elements
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => {
          try {
            audio.pause();
            audio.currentTime = 0;
          } catch (e) {
            console.warn('Failed to stop audio element:', e);
          }
        });
      } catch (error) {
        console.warn('Failed to stop audio elements:', error);
      }

      try {
        // Clear highlighting
        window.dispatchEvent(new CustomEvent('highlighting:clear-all'));
      } catch (error) {
        console.warn('Failed to clear highlighting:', error);
      }

      // Dispatch completion event
      window.dispatchEvent(new CustomEvent('audio:stopped:all'));
    };

    // Handle specific audio system stops
    const handleStopAudioSync = () => {
      try {
        // Import and stop audioSyncService if available
        import('@/services/audioSyncService').then(({ audioSyncService }) => {
          audioSyncService.stopAudio();
        }).catch(() => {
          // Service not available, ignore
        });
      } catch (error) {
        console.warn('Failed to stop audioSyncService:', error);
      }
    };

    const handleStopSimpleAudio = () => {
      try {
        const audioEngine = SimpleAudioEngine.getInstance();
        audioEngine.stop();
      } catch (error) {
        console.warn('Failed to stop SimpleAudioEngine:', error);
      }
    };

    const handleStopVoiceCommands = () => {
      try {
        // Stop voice command audio
        window.dispatchEvent(new CustomEvent('voice:stop'));
      } catch (error) {
        console.warn('Failed to stop voice commands:', error);
      }
    };

    const handleStopCharlotte = () => {
      try {
        // Stop Charlotte's conversation audio
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      } catch (error) {
        console.warn('Failed to stop Charlotte audio:', error);
      }
    };

    // Register event listeners
    window.addEventListener('audio:stop:all', handleStopAll);
    window.addEventListener('audio:stop:audioSyncService', handleStopAudioSync);
    window.addEventListener('audio:stop:SimpleAudioEngine', handleStopSimpleAudio);
    window.addEventListener('audio:stop:voiceCommands', handleStopVoiceCommands);
    window.addEventListener('audio:stop:charlotte', handleStopCharlotte);

    return () => {
      window.removeEventListener('audio:stop:all', handleStopAll);
      window.removeEventListener('audio:stop:audioSyncService', handleStopAudioSync);
      window.removeEventListener('audio:stop:SimpleAudioEngine', handleStopSimpleAudio);
      window.removeEventListener('audio:stop:voiceCommands', handleStopVoiceCommands);
      window.removeEventListener('audio:stop:charlotte', handleStopCharlotte);
    };
  }, []);

  // This component doesn't render anything
  return null;
};