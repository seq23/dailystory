import { useCallback, useEffect } from 'react';
import { useOpenAIRealtimeChat } from '@/hooks/useOpenAIRealtimeChat';
import { SimpleAudioEngine } from '@/services/SimpleAudioEngine';

export type OpenAIVoiceStatus = 'idle' | 'connecting' | 'connected' | 'listening' | 'processing' | 'speaking' | 'failed';

export const useOpenAIVoiceCommands = () => {
  const engine = SimpleAudioEngine.getInstance();

  // Handle function calls from OpenAI
  const handleFunctionCall = useCallback((functionName: string, args: any) => {
    console.log('🎯 OPENAI VOICE COMMAND:', functionName, args);

    switch (functionName) {
      case 'play_story':
        console.log('▶️ Playing story...');
        const text = (window as any).__pageContentString || '';
        const hash = (window as any).__pageContentHash || undefined;
        
        if (text) {
          engine.playText({ 
            text, 
            contentHash: hash,
            voiceId: 'XB0fDUnXU5powFXDhCwa' // Charlotte
          }).catch(console.error);
        } else {
          console.warn('⚠️ No story content available');
        }
        break;

      case 'stop_reading':
        console.log('⏹️ Stopping reading...');
        engine.stop();
        break;

      case 'next_page':
        console.log('➡️ Going to next page...');
        window.dispatchEvent(new CustomEvent('reader:navigate', { 
          detail: { direction: 'next' } 
        }));
        break;

      case 'previous_page':
        console.log('⬅️ Going to previous page...');
        window.dispatchEvent(new CustomEvent('reader:navigate', { 
          detail: { direction: 'prev' } 
        }));
        break;

      case 'word_help':
        console.log('❓ Getting word help...', args);
        window.dispatchEvent(new CustomEvent('voice:wordHelp', { 
          detail: args || null 
        }));
        break;

      case 'speed_up':
        console.log('📈 Speed up command...');
        window.dispatchEvent(new CustomEvent('voice:speedChange', { 
          detail: { action: 'faster' } 
        }));
        break;

      case 'slow_down':
        console.log('📉 Slow down command...');
        window.dispatchEvent(new CustomEvent('voice:speedChange', { 
          detail: { action: 'slower' } 
        }));
        break;

      case 'normal_speed':
        console.log('🎯 Normal speed command...');
        window.dispatchEvent(new CustomEvent('voice:speedChange', { 
          detail: { action: 'normal' } 
        }));
        break;

      default:
        console.warn('❓ Unknown voice command:', functionName);
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
    console.log('🎤 Starting OpenAI voice commands...');
    if (!isConnected) connect();
  }, [isConnected, connect]);

  const stop = useCallback(() => {
    console.log('🛑 Stopping OpenAI voice commands...');
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