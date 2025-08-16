import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useConversation } from '@11labs/react';
import { SimpleAudioEngine } from '@/services/SimpleAudioEngine';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';

export const SimpleVoiceCommands: React.FC = () => {
  const engine = SimpleAudioEngine.getInstance();
  const { isMobileOrTablet } = useIsMobile();

  // Define client tools for voice commands
  const clientTools = {
    play: () => {
      console.log('🎯 Voice command: play');
      const text = (window as any).__pageContentString || '';
      const hash = (window as any).__pageContentHash || undefined;
      
      if (text) {
        engine.playText({ 
          text, 
          contentHash: hash,
          voiceId: 'XB0fDUnXU5powFXDhCwa' // Charlotte
        }).catch(console.error);
        return "Starting to read the story with Charlotte's voice";
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
      console.log('🎤 Connected to Buddy');
      console.log('🎤 Voice session established successfully');
      toast.success('Buddy is ready to help! Try saying "play story"');
    },
    onDisconnect: () => {
      console.log('🎤 Disconnected from Buddy');
      toast.info('Buddy disconnected');
    },
    onError: (error: any) => {
      console.error('🎤 Voice error details:', error);
      const errorMessage = typeof error === 'string' ? error : error?.message || 'Connection failed';
      toast.error(`Voice error: ${errorMessage}`);
    },
    onMessage: (message) => {
      console.log('🎤 Voice message received:', message);
    }
  });

  const handleToggle = useCallback(async () => {
    if (status === 'connected') {
      console.log('🎤 Voice session already connected, ending...');
      await endSession();
    } else {
      try {
        console.log('🎤 Starting voice command session...');
        console.log('🎤 Current status:', status);
        console.log('🎤 useConversation hook available:', !!useConversation);
        
        // Get signed URL from Supabase  
        console.log('🎤 Requesting ElevenLabs agent signed URL...');
        const { data, error } = await supabase.functions.invoke('elevenlabs-agent-signed-url');
        
        console.log('🎤 Supabase function response:', { data, error });
        
        if (error) {
          console.error('🎤 Supabase function error:', error);
          toast.error(`Voice connection failed: ${error.message}`);
          return;
        }
        
        if (!data?.signed_url) {
          console.error('🎤 No signed URL in response:', data);
          toast.error('No signed URL received from ElevenLabs');
          return;
        }
        
        console.log('🎤 Got signed URL, starting session...');
        
        // Test microphone permissions first
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          console.log('🎤 Microphone access granted');
          stream.getTracks().forEach(track => track.stop()); // Clean up test stream
        } catch (micError) {
          console.error('🎤 Microphone access denied:', micError);
          toast.error('Microphone access required for voice commands');
          return;
        }
        
        console.log('🎤 About to call startSession with signed URL...');
        const sessionResult = await startSession({ signedUrl: data.signed_url });
        console.log('🎤 Session started successfully:', sessionResult);
      } catch (error: any) {
        console.error('🎤 Failed to start voice session:', error);
        console.error('🎤 Error stack:', error.stack);
        toast.error(`Could not connect to Buddy: ${error.message || 'Unknown error'}`);
      }
    }
  }, [status, startSession, endSession]);

  const getButtonText = () => {
    if (status === 'connected') return 'Stop Voice Commands';
    if (status === 'connecting') return 'Connecting...';
    return isMobileOrTablet ? 'Buddy' : 'Talk to Buddy';
  };

  const getStatusBadge = () => {
    if (status === 'connected') {
      return isSpeaking ? 
        <Badge variant="default" className="bg-blue-500">Speaking</Badge> :
        <Badge variant="outline" className="border-green-500 text-green-500">Listening</Badge>;
    }
    if (status === 'connecting') {
      return <Badge variant="secondary">Connecting</Badge>;
    }
    return null;
  };

  return (
    <div className="flex items-center gap-3">
      <Button 
        onClick={handleToggle}
        variant={status === 'connected' ? 'outline' : 'default'}
        disabled={status === 'connecting'}
      >
        {getButtonText()}
      </Button>
      
      {getStatusBadge()}
      
      {status === 'connected' && (
        <div className="text-xs text-muted-foreground max-w-xs">
          Say: "play story", "stop reading", "next page", "previous page", or "help with [word]"
        </div>
      )}
    </div>
  );
};