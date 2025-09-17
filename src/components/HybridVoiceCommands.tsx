import React, { useState, useEffect, useCallback } from 'react';
import { DebugLogger } from '@/services/DebugLogger';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OpenAIVoiceCommands } from './OpenAIVoiceCommands';
import { VoiceCommands } from './VoiceCommands';
import { SimpleAudioEngine } from '@/services/SimpleAudioEngine';

interface VoiceSystemStatus {
  system: 'elevenlabs' | 'openai' | 'idle';
  status: 'connecting' | 'connected' | 'listening' | 'processing' | 'failed' | 'idle';
  error?: string;
}

export const HybridVoiceCommands: React.FC = () => {
  const [currentSystem, setCurrentSystem] = useState<VoiceSystemStatus>({
    system: 'idle',
    status: 'idle'
  });
  const [manualOverride, setManualOverride] = useState(false);
  const [readingSpeed, setReadingSpeed] = useState(1.0);
  const engine = SimpleAudioEngine.getInstance();

  // Enhanced command handlers with speed controls
  const handleCommand = useCallback((command: string, args?: any) => {
    DebugLogger.log('audio', 'Hybrid voice command:', { command, args });
    
    switch (command) {
      case 'play':
        const text = (window as any).__pageContentString || '';
        const hash = (window as any).__pageContentHash || undefined;
        
        if (text) {
          // Brief delay to let any Charlotte acknowledgment finish
          setTimeout(() => {
            engine.playText({ 
              text, 
              contentHash: hash,
              voiceId: 'XB0fDUnXU5powFXDhCwa' // Charlotte
            }).catch((error) => DebugLogger.error('audio', 'Text-to-speech playback failed', error));
          }, 200);
        }
        break;

      case 'stop':
        engine.stop();
        break;

      case 'speedUp':
        const newFasterSpeed = Math.min(readingSpeed + 0.15, 2.0);
        setReadingSpeed(newFasterSpeed);
        DebugLogger.log('audio', 'Speed increased to:', newFasterSpeed);
        // Apply speed change to current audio if playing
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          speechSynthesis.cancel(); // Cancel current speech to apply new speed
        }
        break;

      case 'slowDown':
        const newSlowerSpeed = Math.max(readingSpeed - 0.15, 0.5);
        setReadingSpeed(newSlowerSpeed);
        DebugLogger.log('audio', 'Speed decreased to:', newSlowerSpeed);
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          speechSynthesis.cancel();
        }
        break;

      case 'normalSpeed':
        setReadingSpeed(1.0);
        DebugLogger.log('audio', 'Speed reset to normal');
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          speechSynthesis.cancel();
        }
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
        DebugLogger.warn('audio', 'Unknown hybrid command', { command });
    }
  }, [engine, readingSpeed]);

  const startVoiceCommands = useCallback(async () => {
    if (manualOverride) {
      // Manual override - try OpenAI directly
      setCurrentSystem({ system: 'openai', status: 'connecting' });
      window.dispatchEvent(new CustomEvent('openai:start'));
      return;
    }

    // Try ElevenLabs first
    setCurrentSystem({ system: 'elevenlabs', status: 'connecting' });
    
    try {
      DebugLogger.log('audio', 'Attempting ElevenLabs connection...');
      
      // Start ElevenLabs connection
      window.dispatchEvent(new CustomEvent('voice:start'));
      
      // Wait for connection with timeout
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('ElevenLabs connection timeout')), 10000)
      );
      
      const connectionPromise = new Promise((resolve, reject) => {
        const handler = (event: any) => {
          const { status, error } = event.detail;
          
          if (status === 'listening' || status === 'connected') {
            window.removeEventListener('voice:status', handler);
            resolve(true);
          } else if (status === 'failed' || error) {
            window.removeEventListener('voice:status', handler);
            reject(new Error(error || 'ElevenLabs connection failed'));
          }
        };
        window.addEventListener('voice:status', handler);
      });
      
      await Promise.race([connectionPromise, timeout]);
      DebugLogger.log('audio', 'ElevenLabs connected successfully');
      
    } catch (error) {
      DebugLogger.log('audio', 'ElevenLabs failed, falling back to OpenAI:', error);
      fallbackToOpenAI();
    }
  }, [manualOverride]);

  const fallbackToOpenAI = useCallback(() => {
    setCurrentSystem({ system: 'openai', status: 'connecting' });
    window.dispatchEvent(new CustomEvent('openai:start'));
  }, []);

  const stopVoiceCommands = () => {
    window.dispatchEvent(new CustomEvent('voice:stop'));
    setCurrentSystem({ system: 'idle', status: 'idle' });
  };

  const toggleSystem = () => {
    if (currentSystem.status !== 'idle') {
      stopVoiceCommands();
    } else {
      startVoiceCommands();
    }
  };

  // Listen for voice status updates
  useEffect(() => {
    const handleVoiceStatus = (event: CustomEvent) => {
      const { status, system, error } = event.detail;
      setCurrentSystem(prev => ({ 
        ...prev, 
        status, 
        system: system || prev.system,
        error 
      }));
    };

    window.addEventListener('voice:status', handleVoiceStatus as EventListener);
    return () => window.removeEventListener('voice:status', handleVoiceStatus as EventListener);
  }, []);

  // Enhanced tool definitions for both systems
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

  const getStatusColor = () => {
    switch (currentSystem.status) {
      case 'connected': return 'bg-green-500';
      case 'listening': return 'bg-green-500 animate-pulse';
      case 'processing': return 'bg-yellow-500 animate-pulse';
      case 'connecting': return 'bg-blue-500 animate-pulse';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getButtonText = () => {
    if (currentSystem.status === 'idle') return 'Start Voice Commands';
    if (currentSystem.status === 'connecting') return 'Connecting...';
    if (currentSystem.status === 'processing') return 'Processing...';
    if (currentSystem.status === 'listening') return 'Listening...';
    return 'Voice Active';
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex items-center gap-4">
        <Button 
          onClick={toggleSystem}
          variant={currentSystem.status === 'idle' ? 'default' : 'outline'}
          disabled={currentSystem.status === 'connecting'}
        >
          {getButtonText()}
        </Button>
        
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
          <div className="flex flex-col text-xs">
              <Badge variant="outline" className="text-xs">
                {currentSystem.system === 'idle' ? 'Ready' : 
                 currentSystem.system === 'elevenlabs' ? 'Voice Assistant' : 'Backup Voice'}
              </Badge>
            {readingSpeed !== 1.0 && (
              <Badge variant="secondary" className="text-xs mt-1">
                Speed: {readingSpeed.toFixed(1)}x
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground max-w-md">
        <p><strong>Available Commands:</strong></p>
        <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
          <div>
            <p className="font-medium">Reading:</p>
            <p>"read", "stop", "pause"</p>
          </div>
          <div>
            <p className="font-medium">Speed:</p>
            <p>"faster", "slower", "normal speed"</p>
          </div>
          <div>
            <p className="font-medium">Navigation:</p>
            <p>"next page", "back", "previous"</p>
          </div>
          <div>
            <p className="font-medium">Help:</p>
            <p>"what is this word"</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs">
            <label className="flex items-center gap-1">
              <input 
                type="checkbox" 
                checked={manualOverride}
                onChange={(e) => setManualOverride(e.target.checked)}
                className="w-3 h-3"
              />
              Use backup voice system
            </label>
      </div>

      {/* Hidden components for actual voice processing */}
      <div className="hidden">
        <VoiceCommands clientTools={clientTools} />
        <OpenAIVoiceCommands />
      </div>
    </div>
  );
};

export default HybridVoiceCommands;