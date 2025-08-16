import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SimpleAudioEngine } from '@/services/SimpleAudioEngine';

export type VoiceSystemType = 'elevenlabs' | 'openai' | 'idle';
export type VoiceStatus = 'idle' | 'connecting' | 'connected' | 'listening' | 'processing' | 'speaking' | 'failed';

interface VoiceSystemState {
  activeSystem: VoiceSystemType;
  status: VoiceStatus;
  error?: string;
  readingSpeed: number;
}

interface VoiceCommand {
  command: string;
  args?: any;
}

export const useUnifiedVoiceCommands = () => {
  const [state, setState] = useState<VoiceSystemState>({
    activeSystem: 'idle',
    status: 'idle',
    readingSpeed: 1.0
  });

  const { toast } = useToast();
  const engine = SimpleAudioEngine.getInstance();
  const fallbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Try ElevenLabs first, fallback to OpenAI
  const startVoiceCommands = useCallback(async () => {
    console.log('🎤 Starting unified voice commands...');
    
    // Try ElevenLabs first
    setState(prev => ({ ...prev, activeSystem: 'elevenlabs', status: 'connecting' }));
    
    try {
      // Dispatch start to ElevenLabs
      window.dispatchEvent(new CustomEvent('voice:start'));
      
      // Set fallback timeout
      fallbackTimeoutRef.current = setTimeout(() => {
        console.log('🔄 ElevenLabs timeout, trying OpenAI fallback...');
        fallbackToOpenAI();
      }, 8000);
      
    } catch (error) {
      console.error('❌ ElevenLabs failed immediately:', error);
      fallbackToOpenAI();
    }
  }, []);

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
    
    window.dispatchEvent(new CustomEvent('voice:stop'));
    setState(prev => ({ ...prev, activeSystem: 'idle', status: 'idle', error: undefined }));
  }, []);

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
          setTimeout(() => fallbackToOpenAI(), 100);
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
    isActive: state.status !== 'idle',
    isConnecting: state.status === 'connecting',
    isListening: state.status === 'listening',
    isProcessing: state.status === 'processing'
  };
};