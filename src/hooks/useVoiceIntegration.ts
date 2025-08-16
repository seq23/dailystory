import { useRef, useCallback } from 'react';
import { SimpleAudioEngine } from '@/services/SimpleAudioEngine';
import { useConversation } from '@11labs/react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook to integrate the main UI voice buttons with the SimpleVoiceCommands system
 */
export const useVoiceIntegration = () => {
  const engine = SimpleAudioEngine.getInstance();
  const voiceSystemRef = useRef<any>(null);

  // Define client tools for voice commands (same as SimpleVoiceCommands)
  const clientTools = {
    play: () => {
      console.log('🎯 Voice command: play');
      const text = (window as any).__pageContentString || '';
      const hash = (window as any).__pageContentHash || undefined;
      const storyTitle = (window as any).__storyTitle || '';
      const userName = (window as any).__userName || '';
      
      if (text) {
        engine.playText({ 
          text, 
          contentHash: hash,
          voiceId: 'XB0fDUnXU5powFXDhCwa' // Charlotte
        }).catch(console.error);
        return `Starting to read ${storyTitle ? `"${storyTitle}"` : 'the story'} with Charlotte's voice${userName ? ` for ${userName}` : ''}`;
      }
      return "No story content available to read";
    },
    
    stop: () => {
      console.log('🎯 Voice command: stop');
      engine.stop();
      return "Stopped reading";
    },
    
    next: () => {
      console.log('🎯 Voice command: next page');
      window.dispatchEvent(new CustomEvent('reader:navigate', { 
        detail: { direction: 'next' } 
      }));
      return "Going to next page";
    },
    
    previous: () => {
      console.log('🎯 Voice command: previous page');
      window.dispatchEvent(new CustomEvent('reader:navigate', { 
        detail: { direction: 'prev' } 
      }));
      return "Going to previous page";
    },
    
    wordHelp: (args: any) => {
      console.log('🎯 Voice command: word help', args);
      window.dispatchEvent(new CustomEvent('voice:wordHelp', { 
        detail: args || null 
      }));
      return "Getting word help";
    }
  };

  const {
    status,
    isSpeaking,
    startSession,
    endSession
  } = useConversation({ 
    clientTools,
    onConnect: () => {
      console.log('🎤 Connected to Buddy via integration hook');
      
      // Dispatch voice status event for UI updates
      window.dispatchEvent(new CustomEvent('voice:status', { 
        detail: { status: 'listening', system: 'elevenlabs' } 
      }));
      
      const storyTitle = (window as any).__storyTitle || '';
      const contextMessage = storyTitle ? `I'm ready to help with "${storyTitle}"!` : "I'm ready to help!";
      toast.success(`${contextMessage} Try saying "play story"`);
    },
    onDisconnect: () => {
      console.log('🎤 Disconnected from Buddy via integration hook');
      
      // Dispatch voice status event for UI updates
      window.dispatchEvent(new CustomEvent('voice:status', { 
        detail: { status: 'idle', system: 'elevenlabs' } 
      }));
      
      toast.info('Buddy disconnected');
    },
    onError: (error: any) => {
      console.error('🎤 Voice error in integration hook:', error);
      const errorMessage = typeof error === 'string' ? error : error?.message || 'Connection failed';
      toast.error(`Voice error: ${errorMessage}`);
      
      // Dispatch error status
      window.dispatchEvent(new CustomEvent('voice:status', { 
        detail: { status: 'idle', system: 'elevenlabs' } 
      }));
    },
    onMessage: (message) => {
      console.log('🎤 Voice message received in integration hook:', message);
    }
  });

  const handleVoiceToggle = useCallback(async () => {
    if (status === 'connected') {
      console.log('🎤 Voice session already connected, ending...');
      await endSession();
    } else {
      try {
        console.log('🎤 Starting voice command session via integration hook...');
        
        // Update UI to show connecting state
        window.dispatchEvent(new CustomEvent('voice:status', { 
          detail: { status: 'processing', system: 'elevenlabs' } 
        }));
        
        // Test microphone permissions first
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          console.log('🎤 Microphone access granted');
          stream.getTracks().forEach(track => track.stop()); // Clean up test stream
        } catch (micError) {
          console.error('🎤 Microphone access denied:', micError);
          toast.error('Microphone access required for voice commands');
          window.dispatchEvent(new CustomEvent('voice:status', { 
            detail: { status: 'idle', system: 'elevenlabs' } 
          }));
          return;
        }
        
        // Get signed URL from Supabase  
        console.log('🎤 Requesting ElevenLabs agent signed URL...');
        const { data, error } = await supabase.functions.invoke('elevenlabs-agent-signed-url');
        
        if (error) {
          console.error('🎤 Supabase function error:', error);
          toast.error(`Voice connection failed: ${error.message}`);
          window.dispatchEvent(new CustomEvent('voice:status', { 
            detail: { status: 'idle', system: 'elevenlabs' } 
          }));
          return;
        }
        
        if (!data?.signed_url) {
          console.error('🎤 No signed URL in response:', data);
          toast.error('No signed URL received from ElevenLabs');
          window.dispatchEvent(new CustomEvent('voice:status', { 
            detail: { status: 'idle', system: 'elevenlabs' } 
          }));
          return;
        }
        
        console.log('🎤 Got signed URL, starting session...');
        const sessionResult = await startSession({ signedUrl: data.signed_url });
        console.log('🎤 Session started successfully:', sessionResult);
      } catch (error: any) {
        console.error('🎤 Failed to start voice session:', error);
        toast.error(`Could not connect to Buddy: ${error.message || 'Unknown error'}`);
        window.dispatchEvent(new CustomEvent('voice:status', { 
          detail: { status: 'idle', system: 'elevenlabs' } 
        }));
      }
    }
  }, [status, startSession, endSession]);

  return {
    status,
    isSpeaking,
    handleVoiceToggle,
    isConnected: status === 'connected',
    isConnecting: status === 'connecting'
  };
};