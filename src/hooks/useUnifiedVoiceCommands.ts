import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SimpleAudioEngine } from '@/services/SimpleAudioEngine';
import { MobileAudioManager } from '@/services/mobileAudioManager';

export type VoiceSystemType = 'elevenlabs' | 'openai' | 'idle';
export type VoiceStatus = 'idle' | 'connecting' | 'connected' | 'listening' | 'processing' | 'speaking' | 'failed' | 'permission-denied' | 'permission-requesting';

interface VoiceSystemState {
  activeSystem: VoiceSystemType;
  status: VoiceStatus;
  error?: string;
  readingSpeed: number;
  microphonePermission: 'granted' | 'denied' | 'prompt' | 'checking';
  microphoneLevel: number;
  connectionProgress: string;
}

interface VoiceCommand {
  command: string;
  args?: any;
}

export const useUnifiedVoiceCommands = () => {
  const [state, setState] = useState<VoiceSystemState>({
    activeSystem: 'idle',
    status: 'idle',
    readingSpeed: 1.0,
    microphonePermission: 'prompt',
    microphoneLevel: 0,
    connectionProgress: ''
  });

  const { toast } = useToast();
  const engine = SimpleAudioEngine.getInstance();
  const mobileAudio = MobileAudioManager.getInstance();
  const fallbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Enhanced command handler
  const handleCommand = useCallback((command: string, args?: any) => {
    console.log('🎯 Unified voice command:', command, args);
    
    switch (command) {
      case 'play':
        const text = (window as any).__pageContentString || '';
        const hash = (window as any).__pageContentHash || undefined;
        
        if (text) {
          engine.playText({ 
            text, 
            contentHash: hash,
            voiceId: 'XB0fDUnXU5powFXDhCwa'
          }).catch(console.error);
        }
        break;

      case 'stop':
        engine.stop();
        break;

      case 'speedUp':
        setState(prev => {
          const newSpeed = Math.min(prev.readingSpeed + 0.15, 2.0);
          console.log('📈 Speed increased to:', newSpeed);
          return { ...prev, readingSpeed: newSpeed };
        });
        break;

      case 'slowDown':
        setState(prev => {
          const newSpeed = Math.max(prev.readingSpeed - 0.15, 0.5);
          console.log('📉 Speed decreased to:', newSpeed);
          return { ...prev, readingSpeed: newSpeed };
        });
        break;

      case 'normalSpeed':
        setState(prev => ({ ...prev, readingSpeed: 1.0 }));
        console.log('🎯 Speed reset to normal');
        break;

      case 'next':
        window.dispatchEvent(new CustomEvent('reader:navigate', { 
          detail: { direction: 'next' } 
        }));
        break;

      case 'previous':
        window.dispatchEvent(new CustomEvent('reader:navigate', { 
          detail: { direction: 'prev' } 
        }));
        break;

      case 'wordHelp':
        window.dispatchEvent(new CustomEvent('voice:wordHelp', { 
          detail: args || null 
        }));
        break;

      default:
        console.warn('❓ Unknown command:', command);
    }
  }, [engine]);

  // Check microphone permissions
  const checkMicrophonePermission = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, microphonePermission: 'checking', connectionProgress: 'Checking microphone permissions...' }));
    
    try {
      // Check if permissions API is available
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        
        if (permission.state === 'granted') {
          setState(prev => ({ ...prev, microphonePermission: 'granted', connectionProgress: 'Microphone access granted' }));
          return true;
        } else if (permission.state === 'denied') {
          setState(prev => ({ 
            ...prev, 
            microphonePermission: 'denied', 
            status: 'permission-denied',
            error: 'Microphone access denied. Please enable microphone permissions in your browser settings.',
            connectionProgress: ''
          }));
          
          toast({
            title: 'Microphone Access Denied',
            description: 'Please enable microphone permissions in your browser settings to use voice commands.',
            variant: 'destructive'
          });
          return false;
        }
      }
      
      // Fallback: Try to request microphone access directly
      setState(prev => ({ ...prev, status: 'permission-requesting', connectionProgress: 'Requesting microphone access...' }));
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: { 
            sampleRate: 24000, 
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true 
          } 
        });
        
        // Store the stream for later use
        microphoneStreamRef.current = stream;
        
        setState(prev => ({ ...prev, microphonePermission: 'granted', connectionProgress: 'Microphone access granted' }));
        console.log('✅ Microphone access granted');
        return true;
        
      } catch (error: any) {
        console.error('❌ Microphone access denied:', error);
        
        let errorMessage = 'Microphone access was denied.';
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Microphone access denied. Please click the microphone icon in your browser\'s address bar and allow access.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No microphone found. Please connect a microphone and try again.';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Microphone is being used by another application. Please close other apps and try again.';
        }
        
        setState(prev => ({ 
          ...prev, 
          microphonePermission: 'denied', 
          status: 'permission-denied',
          error: errorMessage,
          connectionProgress: ''
        }));
        
        toast({
          title: 'Microphone Access Error',
          description: errorMessage,
          variant: 'destructive'
        });
        return false;
      }
    } catch (error) {
      console.error('❌ Permission check failed:', error);
      setState(prev => ({ 
        ...prev, 
        microphonePermission: 'denied', 
        status: 'failed',
        error: 'Could not check microphone permissions.',
        connectionProgress: ''
      }));
      return false;
    }
  }, [toast]);

  // Start microphone level monitoring
  const startMicrophoneLevelMonitoring = useCallback(() => {
    if (!microphoneStreamRef.current) return;
    
    try {
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(microphoneStreamRef.current);
      
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const updateLevel = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const level = average / 255;
        
        setState(prev => ({ ...prev, microphoneLevel: level }));
        
        // Dispatch voice level events for other components
        window.dispatchEvent(new CustomEvent('voice:level', { 
          detail: { level } 
        }));
        
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      
      updateLevel();
      console.log('✅ Microphone level monitoring started');
      
    } catch (error) {
      console.error('❌ Failed to start microphone level monitoring:', error);
    }
  }, []);

  // Stop microphone level monitoring
  const stopMicrophoneLevelMonitoring = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (microphoneStreamRef.current) {
      microphoneStreamRef.current.getTracks().forEach(track => track.stop());
      microphoneStreamRef.current = null;
    }
    
    analyserRef.current = null;
    setState(prev => ({ ...prev, microphoneLevel: 0 }));
  }, []);

  // Enhanced voice command starter with permission handling
  const startVoiceCommands = useCallback(async () => {
    console.log('🎤 Starting unified voice commands with permission check...');
    
    // Reset any previous errors
    setState(prev => ({ ...prev, error: undefined, connectionProgress: 'Initializing...' }));
    
    // Step 1: Check and request microphone permissions
    const hasPermission = await checkMicrophonePermission();
    if (!hasPermission) {
      return; // Error already handled in checkMicrophonePermission
    }
    
    // Step 2: Initialize mobile audio if needed
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      setState(prev => ({ ...prev, connectionProgress: 'Initializing mobile audio...' }));
      try {
        if (!mobileAudio.isAudioReady()) {
          await mobileAudio.initializeMobileAudio();
        }
        console.log('✅ Mobile audio initialized');
      } catch (error) {
        console.warn('⚠️ Mobile audio initialization failed:', error);
        // Continue anyway, as this is not critical
      }
    }
    
    // Step 3: Start microphone level monitoring
    startMicrophoneLevelMonitoring();
    
    // Step 4: Try ElevenLabs first
    setState(prev => ({ ...prev, activeSystem: 'elevenlabs', status: 'connecting', connectionProgress: 'Connecting to ElevenLabs...' }));
    
    try {
      // Dispatch start to ElevenLabs
      console.log('🎤 Dispatching voice:start event to ElevenLabs...');
      window.dispatchEvent(new CustomEvent('voice:start'));
      console.log('🎤 voice:start event dispatched successfully');
      
      // Set fallback timeout - reduced to 5 seconds for faster fallback
      fallbackTimeoutRef.current = setTimeout(() => {
        console.log('🔄 ElevenLabs timeout (5s), trying OpenAI fallback...');
        setState(prev => ({ ...prev, connectionProgress: 'ElevenLabs timeout, trying backup system...' }));
        fallbackToOpenAI();
      }, 5000);
      
    } catch (error) {
      console.error('❌ ElevenLabs failed immediately:', error);
      setState(prev => ({ ...prev, connectionProgress: 'ElevenLabs failed, trying backup system...' }));
      fallbackToOpenAI();
    }
  }, [checkMicrophonePermission, startMicrophoneLevelMonitoring, mobileAudio]);

  const fallbackToOpenAI = useCallback(() => {
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = null;
    }
    
    setState(prev => ({ ...prev, activeSystem: 'openai', status: 'connecting' }));
    window.dispatchEvent(new CustomEvent('openai:start'));
    
    toast({
      title: 'Using backup voice system',
      description: 'ElevenLabs unavailable, switched to OpenAI'
    });
  }, [toast]);

  const stopVoiceCommands = useCallback(() => {
    console.log('🛑 Stopping voice commands...');
    
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = null;
    }
    
    // Stop microphone monitoring
    stopMicrophoneLevelMonitoring();
    
    window.dispatchEvent(new CustomEvent('voice:stop'));
    setState(prev => ({ 
      ...prev, 
      activeSystem: 'idle', 
      status: 'idle', 
      error: undefined,
      connectionProgress: '',
      microphoneLevel: 0
    }));
  }, [stopMicrophoneLevelMonitoring]);

  const toggleVoiceCommands = useCallback(() => {
    if (state.status === 'idle') {
      startVoiceCommands();
    } else {
      stopVoiceCommands();
    }
  }, [state.status, startVoiceCommands, stopVoiceCommands]);

  // Listen for voice status updates from both systems
  useEffect(() => {
    const handleVoiceStatus = (event: CustomEvent) => {
      const { status, system, error } = event.detail;
      console.log('📊 Voice status update:', { status, system, error });
      
      setState(prev => {
        // If we're connecting to ElevenLabs and get a success, clear fallback timeout
        if (prev.activeSystem === 'elevenlabs' && 
            (status === 'listening' || status === 'connected') && 
            fallbackTimeoutRef.current) {
          clearTimeout(fallbackTimeoutRef.current);
          fallbackTimeoutRef.current = null;
        }
        
        // If ElevenLabs fails and we haven't fallen back yet, trigger fallback
        if (prev.activeSystem === 'elevenlabs' && 
            (status === 'failed' || error) && 
            fallbackTimeoutRef.current) {
          console.log('🔄 ElevenLabs failed, falling back to OpenAI:', error);
          setTimeout(() => fallbackToOpenAI(), 100);
          return prev;
        }
        
        // If we get an unexpected disconnection, also try fallback
        if (prev.activeSystem === 'elevenlabs' && 
            status === 'idle' && 
            prev.status !== 'idle' &&
            fallbackTimeoutRef.current) {
          console.log('🔄 ElevenLabs disconnected unexpectedly, falling back to OpenAI');
          setTimeout(() => fallbackToOpenAI(), 500);
          return prev;
        }
        
        return {
          ...prev,
          status,
          activeSystem: system || prev.activeSystem,
          error
        };
      });
    };

    window.addEventListener('voice:status', handleVoiceStatus as EventListener);
    return () => window.removeEventListener('voice:status', handleVoiceStatus as EventListener);
  }, [fallbackToOpenAI]);

  // Client tools for both systems
  const clientTools = {
    play: () => { handleCommand('play'); return 'Starting to read'; },
    stop: () => { handleCommand('stop'); return 'Stopped reading'; },
    speedUp: () => { handleCommand('speedUp'); return 'Reading faster'; },
    slowDown: () => { handleCommand('slowDown'); return 'Reading slower'; },
    normalSpeed: () => { handleCommand('normalSpeed'); return 'Normal speed'; },
    next: () => { handleCommand('next'); return 'Next page'; },
    previous: () => { handleCommand('previous'); return 'Previous page'; },
    wordHelp: (args: any) => { handleCommand('wordHelp', args); return 'Helping with word'; }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
      }
    };
  }, []);

  return {
    state,
    toggleVoiceCommands,
    stopVoiceCommands,
    clientTools,
    isActive: state.status !== 'idle' && state.status !== 'permission-denied',
    isConnecting: state.status === 'connecting' || state.status === 'permission-requesting',
    isListening: state.status === 'listening',
    isProcessing: state.status === 'processing'
  };
};