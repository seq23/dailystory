
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useConversation } from '@11labs/react';
import { supabase } from '@/integrations/supabase/client';
import { SimpleAudioEngine } from '@/services/SimpleAudioEngine';

interface VoiceCommandsProps {
  agentId?: string; // If provided, will override the backend default
  clientTools?: Record<string, (...args: any[]) => string>;
}

const CHARLOTTE = 'XB0fDUnXU5powFXDhCwa';

export const VoiceCommands: React.FC<VoiceCommandsProps> = ({ agentId: initialAgentId, clientTools: providedClientTools }) => {
  const { toast } = useToast();
  const [agentId, setAgentId] = useState<string>(() => initialAgentId || (localStorage.getItem('eleven_agent_id') || ''));
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  // Map agent tools -> app actions
  const engine = useMemo(() => SimpleAudioEngine.getInstance(), []);
  const clientTools = useMemo(() => providedClientTools || ({
    // Voice Command: "read", "start reading", "play" -> play tool
    play: async () => {
      console.log('🎤 VOICE COMMAND: play tool called');
      const text = (window as any).__lastNarrationText || (window as any).__pageContentString || '';
      const hash = (window as any).__pageContentHash || undefined;
      
      console.log('🎤 Content check:', {
        hasLastNarrationText: !!(window as any).__lastNarrationText,
        hasPageContentString: !!(window as any).__pageContentString,
        hasContentHash: !!(window as any).__pageContentHash,
        textLength: text.length,
        textPreview: text.substring(0, 50) + '...'
      });
      
      if (!text) {
        console.log('🎤 ERROR: No text content available for reading');
        return 'no_text';
      }
      
      try {
        await engine.playText({ 
          text, 
          contentHash: hash,
          voiceId: 'XB0fDUnXU5powFXDhCwa' // Charlotte
        });
        console.log('🎤 SUCCESS: Audio playback started');
        return 'ok';
      } catch (error) {
        console.error('🎤 ERROR: Audio playback failed:', error);
        return 'error';
      }
    },
    
    // Voice Command: "stop", "pause", "stop reading" -> stop tool
    stop: async () => {
      console.log('🎤 VOICE COMMAND: stop tool called');
      try {
        engine.stop();
        console.log('🎤 SUCCESS: Audio stopped');
        return 'ok';
      } catch (error) {
        console.error('🎤 ERROR: Stop failed:', error);
        return 'error';
      }
    },
    
    // Voice Command: "next", "next page", "go forward" -> next tool
    next: async () => {
      console.log('🎤 VOICE COMMAND: next tool called');
      try {
        window.dispatchEvent(new CustomEvent('reader:navigate', { detail: { direction: 'next' } }));
        console.log('🎤 SUCCESS: Next page event dispatched');
        return 'ok';
      } catch (error) {
        console.error('🎤 ERROR: Next navigation failed:', error);
        return 'error';
      }
    },
    
    // Voice Command: "back", "previous", "go back", "previous page" -> previous tool
    previous: async () => {
      console.log('🎤 VOICE COMMAND: previous tool called');
      try {
        window.dispatchEvent(new CustomEvent('reader:navigate', { detail: { direction: 'prev' } }));
        console.log('🎤 SUCCESS: Previous page event dispatched');
        return 'ok';
      } catch (error) {
        console.error('🎤 ERROR: Previous navigation failed:', error);
        return 'error';
      }
    },
    
    // Voice Command: "what is this word", "help with word", "explain word" -> wordHelp tool
    wordHelp: async (params?: any) => {
      console.log('🎤 VOICE COMMAND: wordHelp tool called with params:', params);
      try {
        window.dispatchEvent(new CustomEvent('voice:wordHelp', { detail: params || null }));
        console.log('🎤 SUCCESS: Word help event dispatched');
        return 'ok';
      } catch (error) {
        console.error('🎤 ERROR: Word help failed:', error);
        return 'error';
      }
    },
    
    // Voice Command: "read faster", "faster", "speed up" -> speedUp tool
    speedUp: async () => {
      console.log('🎤 VOICE COMMAND: speedUp tool called');
      try {
        window.dispatchEvent(new CustomEvent('voice:speedChange', { detail: { action: 'faster' } }));
        console.log('🎤 SUCCESS: Speed up event dispatched');
        return 'ok';
      } catch (error) {
        console.error('🎤 ERROR: Speed up failed:', error);
        return 'error';
      }
    },
    
    // Voice Command: "read slower", "slower", "slow down" -> slowDown tool
    slowDown: async () => {
      console.log('🎤 VOICE COMMAND: slowDown tool called');
      try {
        window.dispatchEvent(new CustomEvent('voice:speedChange', { detail: { action: 'slower' } }));
        console.log('🎤 SUCCESS: Slow down event dispatched');
        return 'ok';
      } catch (error) {
        console.error('🎤 ERROR: Slow down failed:', error);
        return 'error';
      }
    },
    
    // Voice Command: "normal speed", "reset speed" -> normalSpeed tool
    normalSpeed: async () => {
      console.log('🎤 VOICE COMMAND: normalSpeed tool called');
      try {
        window.dispatchEvent(new CustomEvent('voice:speedChange', { detail: { action: 'normal' } }));
        console.log('🎤 SUCCESS: Normal speed event dispatched');
        return 'ok';
      } catch (error) {
        console.error('🎤 ERROR: Normal speed failed:', error);
        return 'error';
      }
    },
  }), [engine]);

  const conversation = useConversation({
    clientTools,
    overrides: {
      tts: { voiceId: CHARLOTTE },
    },
    onConnect: () => { 
      console.log('🎤 ElevenLabs conversation connected');
      setConnected(true); 
      try { window.dispatchEvent(new CustomEvent('voice:status', { detail: { status: 'listening' } })); } catch {} 
    },
    onDisconnect: () => { 
      console.log('🎤 ElevenLabs conversation disconnected');
      setConnected(false); 
      try { window.dispatchEvent(new CustomEvent('voice:status', { detail: { status: 'idle' } })); } catch {} 
    },
    onError: (e) => { 
      console.error('🎤 ElevenLabs conversation error:', e); 
      try { window.dispatchEvent(new CustomEvent('voice:status', { detail: { status: 'idle' } })); } catch {} 
    },
    onMessage: (message) => {
      console.log('🎤 ElevenLabs message:', message);
    },
  });

  // Persist any explicitly set agentId (still supported for advanced override)
useEffect(() => {
    try { if (agentId) localStorage.setItem('eleven_agent_id', agentId); } catch {}
  }, [agentId]);

  const start = useCallback(async () => {
    setConnecting(true);
    try {
      // Check for mobile/tablet device
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      console.log('🎤 Voice Commands - Device detection:', {
        isMobile: isMobileDevice,
        isTouch: isTouchDevice,
        userAgent: navigator.userAgent.substring(0, 100)
      });

      // Mic permission preflight (prevents silent failures on some browsers)
      try {
        // Enhanced mobile microphone permission request
        const constraints = {
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            ...(isMobileDevice && {
              sampleRate: 48000, // Higher sample rate for mobile
              channelCount: 1,
              latency: 0.1 // Lower latency for mobile
            })
          }
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        // Test that we can actually use the stream on mobile
        stream.getTracks().forEach(track => track.stop());
        console.log('📱 Mobile microphone permission granted and tested');
      } catch (permErr: any) {
        console.error('🎤 Microphone permission failed:', permErr);
        throw new Error(permErr?.message || 'Microphone permission is required to start voice');
      }

      // If an agentId is present, pass it; otherwise let the backend use the default from secrets
      const body = agentId ? { agentId } : {};
      const { data, error } = await supabase.functions.invoke('elevenlabs-agent-signed-url', { body });
      if (error) throw new Error(error.message || 'Failed to get signed URL');

      // Some edge functions return 2xx with an error payload
      if (data && (data as any).error) throw new Error((data as any).error);

      const url = (data as any)?.signed_url || (data as any)?.url || (data as any)?.signedUrl;
      if (!url || !/^wss?:\/\//.test(url)) throw new Error('Invalid signed URL returned');

      try { window.dispatchEvent(new CustomEvent('voice:status', { detail: { status: 'processing' } })); } catch {}
      const id = await (conversation as any).startSession({ url });
      console.log('Started ElevenLabs conversation:', id);
      toast({ title: 'Voice connected', description: 'Say: "read", "stop", "next", "back".' });
      try { window.dispatchEvent(new CustomEvent('voice:status', { detail: { status: 'listening' } })); } catch {}
    } catch (e: any) {
      console.error('Start voice failed', e);
      toast({ title: 'Voice error', description: e?.message || 'Could not start voice session', variant: 'destructive' });
      try { window.dispatchEvent(new CustomEvent('voice:status', { detail: { status: 'idle' } })); } catch {}
    } finally {
      setConnecting(false);
    }
  }, [agentId, conversation, toast]);

  const stop = useCallback(async () => {
    try { await (conversation as any).endSession(); } catch {}
    setConnected(false);
    try { window.dispatchEvent(new CustomEvent('voice:status', { detail: { status: 'idle' } })); } catch {}
  }, [conversation]);

  useEffect(() => {
    const startHandler = () => { if (!connected && !connecting) start(); };
    const stopHandler = () => { if (connected) stop(); };
    const toggleHandler = () => { if (connected) { stop(); } else if (!connecting) { start(); } };

    window.addEventListener('voice:start', startHandler as EventListener);
    window.addEventListener('voice:stop', stopHandler as EventListener);
    window.addEventListener('voice:toggle', toggleHandler as EventListener);
    return () => {
      window.removeEventListener('voice:start', startHandler as EventListener);
      window.removeEventListener('voice:stop', stopHandler as EventListener);
      window.removeEventListener('voice:toggle', toggleHandler as EventListener);
    };
  }, [connected, connecting, start, stop]);

  return (
    <div className="flex items-center gap-2">
      {/* Input removed: backend will use the default agent from Supabase secrets */}
      {!connected ? (
        <Button onClick={start} disabled={connecting}>{connecting ? 'Connecting…' : 'Talk to Buddy'}</Button>
      ) : (
        <Button variant="secondary" onClick={stop}>Stop Talking</Button>
      )}
    </div>
  );
};

export default VoiceCommands;
