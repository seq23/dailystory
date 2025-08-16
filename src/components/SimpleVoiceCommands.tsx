import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useConversation } from '@11labs/react';
import { SimpleAudioEngine } from '@/services/SimpleAudioEngine';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const SimpleVoiceCommands: React.FC = () => {
  const engine = SimpleAudioEngine.getInstance();

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
      console.log('🎤 Connected to Charlotte');
      toast.success('Charlotte is ready to help!');
    },
    onDisconnect: () => {
      console.log('🎤 Disconnected from Charlotte');
    },
    onError: (error) => {
      console.error('🎤 Voice error:', error);
      toast.error('Voice connection failed');
    }
  });

  const handleToggle = useCallback(async () => {
    if (status === 'connected') {
      await endSession();
    } else {
      try {
        // Get signed URL from Supabase  
        console.log('🎤 Requesting ElevenLabs agent signed URL...');
        const { data, error } = await supabase.functions.invoke('elevenlabs-agent-signed-url');
        
        if (error) {
          console.error('🎤 Supabase function error:', error);
          throw error;
        }
        if (!data?.signed_url) {
          console.error('🎤 No signed URL in response:', data);
          throw new Error('No signed URL received');
        }
        
        console.log('🎤 Got signed URL, starting session...');
        await startSession({ signedUrl: data.signed_url });
      } catch (error) {
        console.error('🎤 Failed to start voice session:', error);
        toast.error('Could not connect to Charlotte');
      }
    }
  }, [status, startSession, endSession]);

  const getButtonText = () => {
    if (status === 'connected') return 'Stop Voice Commands';
    if (status === 'connecting') return 'Connecting...';
    return 'Talk to Charlotte';
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
        <div className="text-xs text-muted-foreground">
          Say: "play story", "stop", "next page", "previous page"
        </div>
      )}
    </div>
  );
};