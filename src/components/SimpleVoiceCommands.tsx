import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useConversation } from '@11labs/react';
import { SimplifiedAudioEngine } from '@/services/SimplifiedAudioEngine';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { DebugLogger } from '@/services/DebugLogger';

export const SimpleVoiceCommands: React.FC = () => {
  const engine = SimplifiedAudioEngine.getInstance();
  const { isMobileOrTablet } = useIsMobile();

  // Define client tools for voice commands
  const clientTools = {
    play: () => {
      DebugLogger.log('audio', 'Voice command: play - CLIENT TOOL EXECUTED');
      DebugLogger.log('performance', 'Global variables check', {
        hasPageContentString: !!((window as any).__pageContentString),
        hasPageContentHash: !!((window as any).__pageContentHash),
        hasStoryTitle: !!((window as any).__storyTitle),
        pageContentLength: ((window as any).__pageContentString || '').length
      });
      
      const text = (window as any).__pageContentString || '';
      const hash = (window as any).__pageContentHash || undefined;
      const storyTitle = (window as any).__storyTitle || '';
      const userName = (window as any).__userName || '';
      
      if (text) {
        DebugLogger.log('audio', 'About to start audio playback', { 
          textLength: text.length, 
          hash, 
          voiceId: 'XB0fDUnXU5powFXDhCwa' 
        });
        engine.playTextWithSynchronization({ 
          text, 
          contentHash: hash,
          voiceId: 'XB0fDUnXU5powFXDhCwa' // Charlotte
        }).then(() => {
          DebugLogger.log('audio', 'Audio playback started successfully');
        }).catch((error) => {
          DebugLogger.error('audio', 'Audio playback failed', error);
        });
        return `Starting to read ${storyTitle ? `"${storyTitle}"` : 'the story'} with Charlotte's voice${userName ? ` for ${userName}` : ''}`;
      }
      
      DebugLogger.warn('audio', 'No story content available - text variable is empty');
      return "No story content available to read";
    },
    
    stop: () => {
      DebugLogger.log('audio', 'Voice command: stop');
      engine.stop();
      return "Stopped reading";
    },
    
    next: () => {
      DebugLogger.log('ui', 'Voice command: next page');
      window.dispatchEvent(new CustomEvent('reader:navigate', { 
        detail: { direction: 'next' } 
      }));
      return "Going to next page";
    },
    
    previous: () => {
      DebugLogger.log('ui', 'Voice command: previous page');
      window.dispatchEvent(new CustomEvent('reader:navigate', { 
        detail: { direction: 'prev' } 
      }));
      return "Going to previous page";
    },
    
    wordHelp: (args: any) => {
      DebugLogger.log('audio', 'Voice command: word help', args);
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
      DebugLogger.log('audio', 'Connected to Buddy');
      DebugLogger.log('audio', 'Voice session established successfully');
      
      // Dispatch voice status event for UI updates
      window.dispatchEvent(new CustomEvent('voice:status', { 
        detail: { status: 'connected', system: 'elevenlabs' } 
      }));
      
      const storyTitle = (window as any).__storyTitle || '';
      const contextMessage = storyTitle ? `I'm ready to help with "${storyTitle}"!` : "I'm ready to help!";
      toast.success(`${contextMessage} Try saying "play story"`);
    },
    onDisconnect: () => {
      DebugLogger.log('audio', 'Disconnected from Buddy');
      
      // Dispatch voice status event for UI updates
      window.dispatchEvent(new CustomEvent('voice:status', { 
        detail: { status: 'idle', system: 'elevenlabs' } 
      }));
      
      toast.info('Buddy disconnected');
    },
    onError: (error: any) => {
      DebugLogger.error('audio', 'Voice error details', {
        error,
        errorType: typeof error,
        errorProperties: Object.keys(error || {})
      });
      
      // Dispatch error status
      window.dispatchEvent(new CustomEvent('voice:status', { 
        detail: { status: 'failed', system: 'elevenlabs', error } 
      }));
      
      const errorMessage = typeof error === 'string' ? error : error?.message || 'Connection failed';
      toast.error(`Voice error: ${errorMessage}`);
    },
    onMessage: (message) => {
      DebugLogger.log('audio', 'Voice message received', message);
      
      // For now, just log the message - the @11labs/react library handles status updates
      // The status from useConversation hook will automatically update UI
    }
  });

  const handleToggle = useCallback(async () => {
    DebugLogger.log('audio', 'Voice toggle clicked', { status });
    
    if (status === 'connected') {
      DebugLogger.log('audio', 'Voice session connected, ending');
      await endSession();
    } else {
      try {
        DebugLogger.log('audio', 'Starting voice command session', { 
          status, 
          hasConversationHook: !!useConversation 
        });
        
        // Dispatch connecting status
        window.dispatchEvent(new CustomEvent('voice:status', { 
          detail: { status: 'connecting', system: 'elevenlabs' } 
        }));
        
        // Get signed URL from Supabase  
        DebugLogger.log('network', 'Requesting ElevenLabs agent signed URL');
        const { data, error } = await supabase.functions.invoke('elevenlabs-agent-signed-url');
        
        DebugLogger.log('network', 'Supabase function response', { 
          hasData: !!data, 
          hasError: !!error,
          dataKeys: data ? Object.keys(data) : [],
          errorDetails: error || 'none'
        });
        
        if (error) {
          DebugLogger.error('network', 'Supabase function error', error);
          toast.error(`Voice connection failed: ${error.message}`);
          return;
        }
        
        if (!data?.signed_url) {
          DebugLogger.error('network', 'No signed URL in response', data);
          toast.error('No signed URL received from ElevenLabs');
          return;
        }
        
        DebugLogger.log('network', 'Got signed URL, testing microphone');
        
        // Test microphone permissions first
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          DebugLogger.log('audio', 'Microphone access granted');
          stream.getTracks().forEach(track => track.stop()); // Clean up test stream
        } catch (micError) {
          DebugLogger.error('audio', 'Microphone access denied', micError);
          toast.error('Microphone access required for voice commands');
          return;
        }
        
        DebugLogger.log('audio', 'About to call startSession with signed URL');
        const sessionResult = await startSession({ signedUrl: data.signed_url });
        DebugLogger.log('audio', 'Session started successfully', sessionResult);
      } catch (error: any) {
        DebugLogger.error('audio', 'Failed to start voice session', {
          error,
          stack: error.stack
        });
        
        // Dispatch failed status
        window.dispatchEvent(new CustomEvent('voice:status', { 
          detail: { status: 'failed', system: 'elevenlabs', error } 
        }));
        
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