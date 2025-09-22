import { useCallback, useEffect } from 'react';
import { useOpenAIRealtimeChat } from '@/hooks/useOpenAIRealtimeChat';
import { SimplifiedAudioEngine } from '@/services/SimplifiedAudioEngine';
import { DebugLogger } from '@/services/DebugLogger';

export type OpenAIVoiceStatus = 'idle' | 'connecting' | 'connected' | 'listening' | 'processing' | 'speaking' | 'failed';

export const useOpenAIVoiceCommands = () => {
  const engine = SimplifiedAudioEngine.getInstance();

  // Handle function calls from OpenAI
  const handleFunctionCall = useCallback((functionName: string, args: any) => {
    DebugLogger.log('audio', 'OpenAI Voice Command', { functionName, args });

    switch (functionName) {
      case 'play_story':
        DebugLogger.log('audio', 'Playing story');
        const text = (window as any).__pageContentString || '';
        const hash = (window as any).__pageContentHash || undefined;
        
        if (text) {
          engine.playTextWithSynchronization({ 
            text, 
            contentHash: hash,
            voiceId: 'XB0fDUnXU5powFXDhCwa' // Charlotte
          }).catch(console.error);
        } else {
          DebugLogger.warn('audio', 'No story content available');
        }
        break;

      case 'stop_reading':
        DebugLogger.log('audio', 'Stopping reading');
        engine.stop();
        break;

      case 'next_page':
        DebugLogger.log('ui', 'Going to next page');
        window.dispatchEvent(new CustomEvent('reader:navigate', { 
          detail: { direction: 'next' } 
        }));
        break;

      case 'previous_page':
        DebugLogger.log('ui', 'Going to previous page');
        window.dispatchEvent(new CustomEvent('reader:navigate', { 
          detail: { direction: 'prev' } 
        }));
        break;

      case 'word_help':
        DebugLogger.log('audio', 'Getting word help', args);
        window.dispatchEvent(new CustomEvent('voice:wordHelp', { 
          detail: args || null 
        }));
        break;

      case 'speed_up':
        DebugLogger.log('audio', 'Speed up command');
        window.dispatchEvent(new CustomEvent('voice:speedChange', { 
          detail: { action: 'faster' } 
        }));
        break;

      case 'slow_down':
        DebugLogger.log('audio', 'Slow down command');
        window.dispatchEvent(new CustomEvent('voice:speedChange', { 
          detail: { action: 'slower' } 
        }));
        break;

      case 'normal_speed':
        DebugLogger.log('audio', 'Normal speed command');
        window.dispatchEvent(new CustomEvent('voice:speedChange', { 
          detail: { action: 'normal' } 
        }));
        break;

      default:
        DebugLogger.warn('ui', 'Unknown voice command', { functionName });
    }
  }, [engine]);

  const {
    isConnected,
    isRecording,
    isProcessing,
    connect,
    disconnect,
    startRecording,
    stopRecording
  } = useOpenAIRealtimeChat({ onFunctionCall: handleFunctionCall });

  // Auto-start recording when connected
  useEffect(() => {
    if (isConnected && !isRecording) {
      startRecording();
    }
  }, [isConnected, isRecording, startRecording]);

  // Dispatch voice status events with consistent format
  useEffect(() => {
    const status = isConnected ? (isProcessing ? 'processing' : 'listening') : 'idle';
    try {
      window.dispatchEvent(new CustomEvent('voice:status', { 
        detail: { status, system: 'openai' } 
      }));
    } catch (error) {
      console.error('Error dispatching OpenAI voice status:', error);
    }
  }, [isConnected, isProcessing]);

  const start = useCallback(() => {
    DebugLogger.log('audio', 'Starting OpenAI voice commands');
    // Dispatch connecting status
    window.dispatchEvent(new CustomEvent('voice:status', { 
      detail: { status: 'connecting', system: 'openai' } 
    }));
    if (!isConnected) connect();
  }, [isConnected, connect]);

  const stop = useCallback(() => {
    DebugLogger.log('audio', 'Stopping OpenAI voice commands');
    if (isConnected) disconnect();
  }, [isConnected, disconnect]);

  // Client tools mapping (for compatibility with unified system)
  const clientTools = {
    play: () => handleFunctionCall('play_story', {}),
    stop: () => handleFunctionCall('stop_reading', {}),
    next: () => handleFunctionCall('next_page', {}),
    previous: () => handleFunctionCall('previous_page', {}),
    wordHelp: (args: any) => handleFunctionCall('word_help', args),
    speedUp: () => handleFunctionCall('speed_up', {}),
    slowDown: () => handleFunctionCall('slow_down', {}),
    normalSpeed: () => handleFunctionCall('normal_speed', {}),
  };

  return {
    state: {
      status: isConnected ? (isProcessing ? 'processing' : 'listening') : 'idle' as OpenAIVoiceStatus,
      error: undefined
    },
    connecting: false, // OpenAI connects instantly
    connected: isConnected,
    start,
    stop,
    clientTools,
    isActive: isConnected,
    isConnecting: false,
    isListening: isConnected && !isProcessing,
    isProcessing: isProcessing
  };
};