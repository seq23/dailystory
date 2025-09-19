import React, { useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useOpenAIRealtimeChat } from '@/hooks/useOpenAIRealtimeChat';
import { SimplifiedAudioEngine } from '@/services/SimplifiedAudioEngine';
import { DebugLogger } from '@/services/DebugLogger';

export const OpenAIVoiceCommands: React.FC = () => {
  const engine = SimplifiedAudioEngine.getInstance();

  // Handle function calls from OpenAI
  const handleFunctionCall = useCallback((functionName: string, args: any) => {
    DebugLogger.log('audio', 'Executing voice command', { functionName, args });

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
          }).catch(error => DebugLogger.error('audio', 'Audio playback failed', error));
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

      default:
        DebugLogger.warn('audio', 'Unknown voice command', { functionName });
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

  // Dispatch voice status events
  useEffect(() => {
    const status = isConnected ? (isProcessing ? 'processing' : 'listening') : 'idle';
    try {
      window.dispatchEvent(new CustomEvent('voice:status', { 
        detail: { status } 
      }));
    } catch (error) {
      DebugLogger.error('audio', 'Error dispatching voice status', error);
    }
  }, [isConnected, isProcessing]);

  // Handle global voice events
  useEffect(() => {
    const handleOpenAIStart = () => {
      DebugLogger.log('audio', 'OpenAI voice commands starting');
      if (!isConnected) connect();
    };
    
    const handleStop = () => {
      if (isConnected) disconnect();
    };

    window.addEventListener('openai:start', handleOpenAIStart);
    window.addEventListener('voice:stop', handleStop);

    return () => {
      window.removeEventListener('openai:start', handleOpenAIStart);
      window.removeEventListener('voice:stop', handleStop);
    };
  }, [isConnected, connect, disconnect]);

  const getButtonText = () => {
    if (!isConnected) return 'Talk to Buddy';
    if (isProcessing) return 'Processing...';
    if (isRecording) return 'Listening...';
    return 'Connected';
  };

  const getButtonVariant = () => {
    if (!isConnected) return 'default';
    if (isProcessing) return 'secondary';
    return 'outline';
  };

  const handleButtonClick = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button 
        onClick={handleButtonClick}
        variant={getButtonVariant()}
        disabled={isConnected && !isRecording && !isProcessing}
      >
        {getButtonText()}
      </Button>
      
      {isConnected && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <div className={`w-2 h-2 rounded-full ${
            isProcessing ? 'bg-yellow-500 animate-pulse' :
            isRecording ? 'bg-green-500 animate-pulse' :
            'bg-gray-400'
          }`} />
          <span className="text-xs">
            {isProcessing ? 'Processing' : isRecording ? 'Listening' : 'Connected'}
          </span>
        </div>
      )}
    </div>
  );
};

export default OpenAIVoiceCommands;