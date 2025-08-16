import React, { useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useOpenAIRealtimeChat } from '@/hooks/useOpenAIRealtimeChat';
import { SimpleAudioEngine } from '@/services/SimpleAudioEngine';

export const OpenAIVoiceCommands: React.FC = () => {
  const engine = SimpleAudioEngine.getInstance();

  // Handle function calls from OpenAI
  const handleFunctionCall = useCallback((functionName: string, args: any) => {
    console.log('🎯 Executing voice command:', functionName, args);

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

  // Dispatch voice status events
  useEffect(() => {
    const status = isConnected ? (isProcessing ? 'processing' : 'listening') : 'idle';
    try {
      window.dispatchEvent(new CustomEvent('voice:status', { 
        detail: { status } 
      }));
    } catch (error) {
      console.error('Error dispatching voice status:', error);
    }
  }, [isConnected, isProcessing]);

  // Handle global voice events
  useEffect(() => {
    const handleStart = () => {
      if (!isConnected) connect();
    };
    
    const handleStop = () => {
      if (isConnected) disconnect();
    };
    
    const handleToggle = () => {
      if (isConnected) {
        disconnect();
      } else {
        connect();
      }
    };

    window.addEventListener('voice:start', handleStart);
    window.addEventListener('voice:stop', handleStop);
    window.addEventListener('voice:toggle', handleToggle);

    return () => {
      window.removeEventListener('voice:start', handleStart);
      window.removeEventListener('voice:stop', handleStop);
      window.removeEventListener('voice:toggle', handleToggle);
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