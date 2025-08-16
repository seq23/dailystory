import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Mic, MicOff, AlertTriangle, CheckCircle, Settings } from 'lucide-react';
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
    if (state.status === 'permission-denied') return 'Grant Microphone Access';
    if (state.status === 'permission-requesting') return 'Allow Microphone...';
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
      case 'permission-requesting': return 'bg-orange-500 animate-pulse';
      case 'permission-denied': return 'bg-red-500';
      case 'speaking': return 'bg-purple-500 animate-pulse';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getMicrophoneIcon = () => {
    if (state.microphonePermission === 'denied') return <AlertTriangle className="w-4 h-4" />;
    if (state.microphonePermission === 'granted') return <CheckCircle className="w-4 h-4" />;
    return isActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />;
  };

  const getMicrophonePermissionBadge = () => {
    switch (state.microphonePermission) {
      case 'granted': return <Badge variant="outline" className="text-xs text-green-600">Mic ✓</Badge>;
      case 'denied': return <Badge variant="destructive" className="text-xs">Mic ✗</Badge>;
      case 'checking': return <Badge variant="secondary" className="text-xs">Checking...</Badge>;
      default: return null;
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
          disabled={isConnecting || state.status === 'permission-requesting'}
          className="flex items-center gap-2"
        >
          {getMicrophoneIcon()}
          {getButtonText()}
        </Button>
        
        <div className="flex items-center gap-3">
          {/* Microphone Permission Status */}
          {getMicrophonePermissionBadge()}
          
          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
            <Badge variant="outline" className="text-xs">
              {getSystemLabel()}
            </Badge>
          </div>
          
          {/* Voice Activity Meter with Level */}
          {isListening && (
            <div className="flex items-center gap-2">
              <VoiceActivityIndicator />
              {state.microphoneLevel > 0 && (
                <div className="flex items-center gap-1">
                  <div className="w-8 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-75"
                      style={{ width: `${Math.min(state.microphoneLevel * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(state.microphoneLevel * 100)}%
                  </span>
                </div>
              )}
            </div>
          )}
          
          {/* Speed Indicator */}
          {state.readingSpeed !== 1.0 && (
            <Badge variant="secondary" className="text-xs">
              Speed: {state.readingSpeed.toFixed(1)}x
            </Badge>
          )}
        </div>
      </div>

      {/* Connection Progress */}
      {state.connectionProgress && !state.error && (
        <div className="w-full max-w-md">
          <div className="text-sm text-blue-600 dark:text-blue-400 text-center mb-2">
            {state.connectionProgress}
          </div>
          <Progress value={undefined} className="h-2" />
        </div>
      )}

      {/* Enhanced Error Display with Help */}
      {state.error && (
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>{state.error}</p>
              {state.status === 'permission-denied' && (
                <div className="text-xs">
                  <p className="font-medium mb-1">To fix this:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Click the microphone icon in your browser's address bar</li>
                    <li>Select "Allow" for microphone access</li>
                    <li>Refresh the page if needed</li>
                  </ul>
                </div>
              )}
              {state.status === 'failed' && state.activeSystem === 'elevenlabs' && (
                <div className="text-xs">
                  <p>Will try backup voice system automatically...</p>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
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