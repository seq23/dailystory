import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useConversation } from '@11labs/react';
import { supabase } from '@/integrations/supabase/client';
import { SimpleAudioEngine } from '@/services/SimpleAudioEngine';

export type ElevenLabsVoiceStatus = 'idle' | 'connecting' | 'connected' | 'listening' | 'processing' | 'speaking' | 'failed';

interface ElevenLabsVoiceState {
  status: ElevenLabsVoiceStatus;
  error?: string;
  agentId?: string;
}

export const useElevenLabsVoiceCommands = () => {
  const { toast } = useToast();
  const [state, setState] = useState<ElevenLabsVoiceState>({
    status: 'idle',
    agentId: localStorage.getItem('eleven_agent_id') || ''
  });
  
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const voiceLevelRef = useRef<number>(0);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const engine = useMemo(() => SimpleAudioEngine.getInstance(), []);

  // Client tools for voice commands
  const clientTools = useMemo(() => ({
    play: async () => {
      console.log('🎤 ELEVENLABS VOICE COMMAND: play tool called');
      const text = (window as any).__lastNarrationText || (window as any).__pageContentString || '';
      const hash = (window as any).__pageContentHash || undefined;
      
      if (!text) {
        console.log('🎤 ERROR: No text content available for reading');
        return 'no_text';
      }
      
      try {
        await engine.playText({ 
          text, 
          contentHash: hash,
          voiceId: 'XB0fDUnXU5powFXDhCwa'
        });
        console.log('🎤 SUCCESS: Audio playback started');
        return 'ok';
      } catch (error) {
        console.error('🎤 ERROR: Audio playback failed:', error);
        return 'error';
      }
    },
    
    stop: async () => {
      console.log('🎤 ELEVENLABS VOICE COMMAND: stop tool called');
      try {
        engine.stop();
        console.log('🎤 SUCCESS: Audio stopped');
        return 'ok';
      } catch (error) {
        console.error('🎤 ERROR: Stop failed:', error);
        return 'error';
      }
    },
    
    next: async () => {
      console.log('🎤 ELEVENLABS VOICE COMMAND: next tool called');
      try {
        window.dispatchEvent(new CustomEvent('reader:navigate', { detail: { direction: 'next' } }));
        console.log('🎤 SUCCESS: Next page event dispatched');
        return 'ok';
      } catch (error) {
        console.error('🎤 ERROR: Next navigation failed:', error);
        return 'error';
      }
    },
    
    previous: async () => {
      console.log('🎤 ELEVENLABS VOICE COMMAND: previous tool called');
      try {
        window.dispatchEvent(new CustomEvent('reader:navigate', { detail: { direction: 'prev' } }));
        console.log('🎤 SUCCESS: Previous page event dispatched');
        return 'ok';
      } catch (error) {
        console.error('🎤 ERROR: Previous navigation failed:', error);
        return 'error';
      }
    },
    
    wordHelp: async (params?: any) => {
      console.log('🎤 ELEVENLABS VOICE COMMAND: wordHelp tool called with params:', params);
      try {
        window.dispatchEvent(new CustomEvent('voice:wordHelp', { detail: params || null }));
        console.log('🎤 SUCCESS: Word help event dispatched');
        return 'ok';
      } catch (error) {
        console.error('🎤 ERROR: Word help failed:', error);
        return 'error';
      }
    },
    
    speedUp: async () => {
      console.log('🎤 ELEVENLABS VOICE COMMAND: speedUp tool called');
      try {
        window.dispatchEvent(new CustomEvent('voice:speedChange', { detail: { action: 'faster' } }));
        console.log('🎤 SUCCESS: Speed up event dispatched');
        return 'ok';
      } catch (error) {
        console.error('🎤 ERROR: Speed up failed:', error);
        return 'error';
      }
    },
    
    slowDown: async () => {
      console.log('🎤 ELEVENLABS VOICE COMMAND: slowDown tool called');
      try {
        window.dispatchEvent(new CustomEvent('voice:speedChange', { detail: { action: 'slower' } }));
        console.log('🎤 SUCCESS: Slow down event dispatched');
        return 'ok';
      } catch (error) {
        console.error('🎤 ERROR: Slow down failed:', error);
        return 'error';
      }
    },
    
    normalSpeed: async () => {
      console.log('🎤 ELEVENLABS VOICE COMMAND: normalSpeed tool called');
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

  // Initialize voice level monitoring
  const startVoiceLevelMonitoring = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const updateLevel = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const level = average / 255;
        
        voiceLevelRef.current = level;
        
        // Dispatch voice level events
        window.dispatchEvent(new CustomEvent('voice:level', { 
          detail: { level } 
        }));
        
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      
      updateLevel();
      
    } catch (error) {
      console.error('Failed to start voice level monitoring:', error);
    }
  }, []);

  const stopVoiceLevelMonitoring = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    analyserRef.current = null;
    voiceLevelRef.current = 0;
  }, []);

  const conversation = useConversation({
    clientTools,
    overrides: {
      tts: { voiceId: 'XB0fDUnXU5powFXDhCwa' },
    },
    onConnect: () => { 
      console.log('🎤 ElevenLabs conversation connected');
      setConnected(true);
      setState(prev => ({ ...prev, status: 'listening' }));
      startVoiceLevelMonitoring();
      window.dispatchEvent(new CustomEvent('voice:status', { 
        detail: { status: 'listening', system: 'elevenlabs' } 
      })); 
    },
    onDisconnect: () => { 
      console.log('🎤 ElevenLabs conversation disconnected');
      setConnected(false);
      setState(prev => ({ ...prev, status: 'idle' }));
      stopVoiceLevelMonitoring();
      window.dispatchEvent(new CustomEvent('voice:status', { 
        detail: { status: 'idle', system: 'elevenlabs' } 
      })); 
    },
    onError: (e: any) => { 
      console.error('🎤 ElevenLabs conversation error:', e);
      const errorMessage = typeof e === 'string' ? e : (e?.message || 'Unknown error');
      setState(prev => ({ ...prev, status: 'failed', error: errorMessage }));
      stopVoiceLevelMonitoring();
      window.dispatchEvent(new CustomEvent('voice:status', { 
        detail: { status: 'failed', system: 'elevenlabs', error: errorMessage } 
      })); 
    },
    onMessage: (message) => {
      console.log('🎤 ElevenLabs message:', message);
    },
  });

  const start = useCallback(async () => {
    setConnecting(true);
    setState(prev => ({ ...prev, status: 'connecting', error: undefined }));
    
    window.dispatchEvent(new CustomEvent('voice:status', { 
      detail: { status: 'connecting', system: 'elevenlabs' } 
    }));
    
    try {
      console.log('🎤 Starting ElevenLabs conversation...');
      
      // Check microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      console.log('✅ Microphone access granted');

      // Get signed URL from Supabase edge function
      const body = state.agentId ? { agentId: state.agentId } : {};
      const { data, error } = await supabase.functions.invoke('elevenlabs-agent-signed-url', { body });
      
      if (error) {
        console.error('❌ ElevenLabs API error:', error);
        const errorMsg = error.message || 'Unknown error';
        
        if (errorMsg.includes('API key') || errorMsg.includes('unauthorized') || errorMsg.includes('401')) {
          throw new Error('ElevenLabs API key not configured. Please set up your API key in project settings.');
        }
        
        throw new Error(`ElevenLabs setup failed: ${errorMsg}`);
      }

      if (data && (data as any).error) {
        const apiError = (data as any).error;
        console.error('❌ ElevenLabs API returned error:', apiError);
        throw new Error(`ElevenLabs API error: ${apiError}`);
      }

      const url = (data as any)?.signed_url || (data as any)?.url || (data as any)?.signedUrl;
      if (!url || !/^wss?:\/\//.test(url)) {
        throw new Error('Invalid or missing signed URL from ElevenLabs');
      }

      console.log('🔗 Starting ElevenLabs session...');
      const id = await (conversation as any).startSession({ url });
      console.log('✅ ElevenLabs conversation started:', id);
      
      toast({ 
        title: 'Voice Assistant Connected', 
        description: 'Say: "read", "stop", "next", "back", or "what is this word"' 
      });
      
    } catch (e: any) {
      console.error('❌ ElevenLabs connection failed:', e);
      setState(prev => ({ ...prev, status: 'failed', error: e.message }));
      
      window.dispatchEvent(new CustomEvent('voice:status', { 
        detail: { status: 'failed', system: 'elevenlabs', error: e.message } 
      }));
      
      toast({ 
        title: 'Voice Assistant Error', 
        description: e?.message || 'Could not start voice session', 
        variant: 'destructive' 
      });
    } finally {
      setConnecting(false);
    }
  }, [state.agentId, conversation, toast, startVoiceLevelMonitoring]);

  const stop = useCallback(async () => {
    try { 
      await (conversation as any).endSession(); 
    } catch {}
    setConnected(false);
    setState(prev => ({ ...prev, status: 'idle', error: undefined }));
    stopVoiceLevelMonitoring();
    window.dispatchEvent(new CustomEvent('voice:status', { 
      detail: { status: 'idle', system: 'elevenlabs' } 
    }));
  }, [conversation, stopVoiceLevelMonitoring]);

  // Persist agentId
  useEffect(() => {
    try { 
      if (state.agentId) localStorage.setItem('eleven_agent_id', state.agentId); 
    } catch {}
  }, [state.agentId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopVoiceLevelMonitoring();
    };
  }, [stopVoiceLevelMonitoring]);

  return {
    state,
    connecting,
    connected,
    start,
    stop,
    clientTools,
    isActive: connected,
    isConnecting: connecting,
    isListening: state.status === 'listening',
    isProcessing: state.status === 'processing'
  };
};