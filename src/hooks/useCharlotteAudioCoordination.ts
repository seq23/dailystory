import { useEffect } from 'react';
import { SmartElevenLabsTTS } from '@/services/smartElevenLabsTTS';

/**
 * Hook to handle Charlotte's voice coordination with the audio system
 * Ensures Charlotte doesn't speak over story audio
 */
export const useCharlotteAudioCoordination = () => {
  useEffect(() => {
    // Listen for Charlotte stop requests from audio coordinator
    const handleCharlotteStop = () => {
      console.log('🤖 Charlotte Audio Coordination: Received stop request');
      // Charlotte is managed by ElevenLabs conversation system
      // The conversation system will handle stopping naturally
      // We just need to acknowledge the request
      window.dispatchEvent(new CustomEvent('audio:stopped', { detail: { system: 'charlotte' } }));
    };

    // Listen for audio conflicts
    const handleAudioConflict = (event: CustomEvent) => {
      const { system } = event.detail || {};
      console.log(`🤖 Charlotte Audio Coordination: Audio conflict detected with ${system}`);
      
      // If story audio (simple/sync) is starting, Charlotte should yield
      if (system === 'simple' || system === 'sync') {
        console.log('🤖 Charlotte yielding to story audio');
        // Don't interrupt Charlotte mid-sentence, but prevent new speech
        window.dispatchEvent(new CustomEvent('charlotte:defer'));
      }
    };

    // Enhanced coordination for seamless user experience
    const handleStoryAudioStart = () => {
      console.log('🤖 Charlotte Audio Coordination: Story audio starting, deferring Charlotte');
      // Brief delay to let Charlotte finish current phrase if speaking
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('audio:request', { detail: { system: 'simple' } }));
      }, 100);
    };

    const handleCharlotteSpeechRequest = () => {
      console.log('🤖 Charlotte Audio Coordination: Speech request, checking conflicts');
      // Quick check if story audio is active
      const coordinator = (window as any).__SimpleAudioCoordinator;
      if (coordinator?.getActiveSystem() === 'simple') {
        console.log('🤖 Charlotte deferring to active story audio');
        return false; // Block Charlotte speech
      }
      return true; // Allow Charlotte speech
    };

    // Set up event listeners
    window.addEventListener('charlotte:stop', handleCharlotteStop);
    window.addEventListener('audio:conflict', handleAudioConflict as EventListener);
    window.addEventListener('story:audio:start', handleStoryAudioStart);
    window.addEventListener('charlotte:speech:request', handleCharlotteSpeechRequest);

    // Setup Charlotte speech coordination with natural delays
    const originalGenerateConversationSpeech = SmartElevenLabsTTS.generateConversationSpeech;
    SmartElevenLabsTTS.generateConversationSpeech = async (text: string, voiceId?: string) => {
      // Check if we should defer to story audio
      const coordinator = (window as any).__SimpleAudioCoordinator;
      if (coordinator?.getActiveSystem() === 'simple' || coordinator?.getActiveSystem() === 'sync') {
        console.log('🤖 Charlotte deferring speech to story audio');
        // Return empty audio to prevent speech conflict
        return new ArrayBuffer(0);
      }
      
      // Proceed with normal Charlotte speech
      return originalGenerateConversationSpeech.call(SmartElevenLabsTTS, text, voiceId);
    };

    return () => {
      // Cleanup event listeners
      window.removeEventListener('charlotte:stop', handleCharlotteStop);
      window.removeEventListener('audio:conflict', handleAudioConflict as EventListener);
      window.removeEventListener('story:audio:start', handleStoryAudioStart);
      window.removeEventListener('charlotte:speech:request', handleCharlotteSpeechRequest);
      
      // Restore original method
      SmartElevenLabsTTS.generateConversationSpeech = originalGenerateConversationSpeech;
    };
  }, []);

  return {
    // Utility function to check if Charlotte can speak
    canCharlotteSpeak: () => {
      const coordinator = (window as any).__SimpleAudioCoordinator;
      const activeSystem = coordinator?.getActiveSystem();
      return !activeSystem || activeSystem === 'charlotte';
    },
    
    // Function to request Charlotte speech permission
    requestCharlotteSpeech: () => {
      window.dispatchEvent(new CustomEvent('audio:request', { detail: { system: 'charlotte' } }));
    },
    
    // Function to release Charlotte's audio lock
    releaseCharlotteSpeech: () => {
      window.dispatchEvent(new CustomEvent('audio:stopped', { detail: { system: 'charlotte' } }));
    }
  };
};