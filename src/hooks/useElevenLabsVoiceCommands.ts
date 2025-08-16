import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useConversation } from '@11labs/react';
import { supabase } from '@/integrations/supabase/client';
import { SimpleAudioEngine } from '@/services/SimpleAudioEngine';
import { VoiceDebugger } from '@/utils/voiceDebugger';
import { MobileAudioManager } from '@/services/mobileAudioManager';

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
  const voiceDebugger = useMemo(() => VoiceDebugger.getInstance(), []);

  // Client tools for voice commands
  const clientTools = useMemo(() => ({
    play: async () => {
      voiceDebugger.log('elevenlabs', 'play tool called');
      const text = (window as any).__lastNarrationText || (window as any).__pageContentString || '';
      const hash = (window as any).__pageContentHash || undefined;
      
      if (!text) {
        voiceDebugger.log('elevenlabs', 'play failed - no text content');
        return 'No text content available for reading';
      }
      
      try {
        await engine.playText({ 
          text, 
          contentHash: hash,
          voiceId: 'XB0fDUnXU5powFXDhCwa'
        });
        voiceDebugger.log('elevenlabs', 'play success');
        return 'Started reading the story';
      } catch (error) {
        voiceDebugger.log('elevenlabs', 'play error', error);
        return 'Could not start reading';
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
      voiceDebugger.log('elevenlabs', 'next tool called');
      try {
        window.dispatchEvent(new CustomEvent('reader:navigate', { detail: { direction: 'next' } }));
        voiceDebugger.log('elevenlabs', 'next navigation dispatched');
        return 'Going to the next page';
      } catch (error) {
        voiceDebugger.log('elevenlabs', 'next error', error);
        return 'Could not go to next page';
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
  }), [engine, voiceDebugger]);

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
      agent: {
        prompt: {
          prompt: `You are a friendly reading assistant named Buddy that helps children navigate interactive stories. 

When you hear any of these commands, immediately call the corresponding tool:

READING COMMANDS:
- "read", "start reading", "play", "begin reading" → call play() tool
- "stop", "pause", "stop reading" → call stop() tool

SPEED CONTROL COMMANDS:
- "read faster", "faster", "speed up" → call speedUp() tool  
- "read slower", "slower", "slow down" → call slowDown() tool
- "normal speed", "reset speed" → call normalSpeed() tool

NAVIGATION COMMANDS:  
- "next", "next page", "go forward", "turn the page" → call next() tool
- "back", "previous", "go back", "previous page" → call previous() tool

WORD HELP COMMANDS:
- "what is this word", "help with word", "explain word" → call wordHelp() tool

Always:
1. Acknowledge the command enthusiastically
2. Call the appropriate tool immediately  
3. Be encouraging and positive
4. Keep responses brief and child-friendly

Example responses:
- "Great! Let me start reading for you!" (then call play())
- "Perfect! Reading faster now!" (then call speedUp())
- "Sure thing! Going to the next page!" (then call next())
- "Of course! Let me help you with that word!" (then call wordHelp())`
        },
        firstMessage: "Hi! I'm Buddy, your reading assistant. Say things like 'read', 'next page', or 'what is this word' and I'll help you!"
      }
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
      console.log('🎤 ElevenLabs conversation disconnected - checking if intentional...');
      const wasConnected = connected;
      setConnected(false);
      setState(prev => ({ ...prev, status: 'idle' }));
      stopVoiceLevelMonitoring();
      
      // If we were connected and disconnected unexpectedly, trigger fallback
      if (wasConnected) {
        console.log('🔄 Unexpected disconnection, triggering fallback...');
        window.dispatchEvent(new CustomEvent('voice:status', { 
          detail: { status: 'failed', system: 'elevenlabs', error: 'Connection lost' } 
        }));
      } else {
        window.dispatchEvent(new CustomEvent('voice:status', { 
          detail: { status: 'idle', system: 'elevenlabs' } 
        }));
      }
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
      
      // Track if agent is speaking or processing based on message content
      const messageType = (message as any)?.type || message?.message || '';
      
      if (messageType.includes('agent') || messageType.includes('response')) {
        setState(prev => ({ ...prev, status: 'speaking' }));
      } else if (messageType.includes('transcript') || messageType.includes('final')) {
        setState(prev => ({ ...prev, status: 'processing' }));
      } else if (messageType.includes('tool') || messageType.includes('call')) {
        console.log('🔧 Tool call detected:', message);
        setState(prev => ({ ...prev, status: 'processing' }));
      }
    },
  });

  // Mobile audio unlock function for voice commands
  const unlockMobileAudioForVoice = useCallback(async () => {
    try {
      // Initialize mobile audio manager
      const mobileAudio = MobileAudioManager.getInstance();
      if (!mobileAudio.isAudioReady()) {
        await mobileAudio.initializeMobileAudio();
      }
      
      voiceDebugger.log('elevenlabs', 'Mobile audio unlocked for voice commands');
    } catch (error) {
      voiceDebugger.log('elevenlabs', 'Failed to unlock mobile audio', { error });
      console.warn('Failed to unlock mobile audio for voice:', error);
    }
  }, [voiceDebugger]);

  const start = useCallback(async () => {
    setConnecting(true);
    setState(prev => ({ ...prev, status: 'connecting', error: undefined }));
    
    window.dispatchEvent(new CustomEvent('voice:status', { 
      detail: { status: 'connecting', system: 'elevenlabs' } 
    }));
    
    try {
      console.log('🎤 Starting ElevenLabs conversation...');
      
      // Unlock mobile audio before starting voice commands
      await unlockMobileAudioForVoice();
      
      // Note: Microphone permission check is now handled by the unified system
      // This hook assumes permissions are already granted
      
      // Get signed URL from Supabase edge function
      console.log('🔍 Calling ElevenLabs edge function with agentId:', state.agentId);
      const body = state.agentId ? { agentId: state.agentId } : {};
      console.log('📤 Request body:', body);
      const { data, error } = await supabase.functions.invoke('elevenlabs-agent-signed-url', { body });
      
      if (error) {
        console.error('❌ ElevenLabs API error:', error);
        const errorMsg = error.message || 'Unknown error';
        
        if (errorMsg.includes('API key') || errorMsg.includes('unauthorized') || errorMsg.includes('401')) {
          throw new Error('ElevenLabs API key is not configured properly.');
        }
        
        if (errorMsg.includes('agent_id') || errorMsg.includes('agentId')) {
          throw new Error('ElevenLabs Agent ID is not configured properly.');
        }
        
        throw new Error(`ElevenLabs setup failed: ${errorMsg}`);
      }

      if (data && (data as any).error) {
        const apiError = (data as any).error;
        console.error('❌ ElevenLabs API returned error:', apiError);
        
        if (apiError.includes('agent_id')) {
          throw new Error('Invalid Agent ID. Please check your ElevenLabs agent configuration.');
        }
        
        throw new Error(`ElevenLabs API error: ${apiError}`);
      }

      const url = (data as any)?.signed_url || (data as any)?.url || (data as any)?.signedUrl;
      if (!url || !/^wss?:\/\//.test(url)) {
        throw new Error('Could not get valid connection URL from ElevenLabs.');
      }

      console.log('🔗 Starting ElevenLabs session...');
      const id = await (conversation as any).startSession({ url });
      console.log('✅ ElevenLabs conversation started:', id);
      
      // Don't show toast here - let the unified system handle user feedback
      
    } catch (e: any) {
      console.error('❌ ElevenLabs connection failed:', e);
      setState(prev => ({ ...prev, status: 'failed', error: e.message }));
      
      window.dispatchEvent(new CustomEvent('voice:status', { 
        detail: { status: 'failed', system: 'elevenlabs', error: e.message } 
      }));
      
      // Don't show toast here - let the unified system handle the fallback
    } finally {
      setConnecting(false);
    }
  }, [state.agentId, conversation, unlockMobileAudioForVoice]);

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