import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff } from 'lucide-react';
import { useUnifiedVoiceCommands } from '@/hooks/useUnifiedVoiceCommands';
import { ElevenLabsVoiceSystem } from './ElevenLabsVoiceSystem';
import { OpenAIVoiceSystem } from './OpenAIVoiceSystem';
import { VoiceActivityIndicator } from './VoiceActivityIndicator';

export const UnifiedVoiceCommands: React.FC = () => {
  const {
    state,
    toggleVoiceCommands,
    clientTools,
    isActive,
    isConnecting,
    isListening,
    isProcessing
  } = useUnifiedVoiceCommands();

  const getButtonText = () => {
    if (!isActive) return 'Start Voice Commands';
    if (isConnecting) return 'Connecting...';
    if (isProcessing) return 'Processing...';
    if (isListening) return 'Listening...';
    return 'Voice Active';
  };

  const getStatusColor = () => {
    switch (state.status) {
      case 'connected': return 'bg-green-500';
      case 'listening': return 'bg-green-500 animate-pulse';
      case 'processing': return 'bg-yellow-500 animate-pulse';
      case 'connecting': return 'bg-blue-500 animate-pulse';
      case 'speaking': return 'bg-purple-500 animate-pulse';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getSystemLabel = () => {
    if (state.activeSystem === 'idle') return 'Ready';
    if (state.activeSystem === 'elevenlabs') return 'Voice Assistant';
    return 'Backup Voice';
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Main Control */}
      <div className="flex items-center gap-4">
        <Button 
          onClick={toggleVoiceCommands}
          variant={isActive ? 'outline' : 'default'}
          disabled={isConnecting}
          className="flex items-center gap-2"
        >
          {isActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          {getButtonText()}
        </Button>
        
        <div className="flex items-center gap-3">
          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
            <Badge variant="outline" className="text-xs">
              {getSystemLabel()}
            </Badge>
          </div>
          
          {/* Voice Activity Meter */}
          {isListening && <VoiceActivityIndicator />}
          
          {/* Speed Indicator */}
          {state.readingSpeed !== 1.0 && (
            <Badge variant="secondary" className="text-xs">
              Speed: {state.readingSpeed.toFixed(1)}x
            </Badge>
          )}
        </div>
      </div>

      {/* Error Display */}
      {state.error && (
        <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-md">
          {state.error}
        </div>
      )}

      {/* Commands Help */}
      <div className="text-center text-sm text-muted-foreground max-w-md">
        <p className="font-medium mb-2">Available Commands:</p>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="font-medium text-foreground">Reading:</p>
            <p>"read", "stop", "pause"</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Speed:</p>
            <p>"faster", "slower", "normal speed"</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Navigation:</p>
            <p>"next page", "back", "previous"</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Help:</p>
            <p>"what is this word"</p>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      {isActive && (
        <div className="text-xs text-muted-foreground text-center">
          {state.activeSystem === 'elevenlabs' ? 
            'Using premium voice assistant' : 
            'Using backup voice system'
          }
        </div>
      )}

      {/* Active voice system components - only render the active one */}
      {state.activeSystem === 'elevenlabs' && <ElevenLabsVoiceSystem />}
      {state.activeSystem === 'openai' && <OpenAIVoiceSystem />}
    </div>
  );
};