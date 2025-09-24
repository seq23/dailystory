import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useConversation } from '@11labs/react';
import { supabase } from '@/integrations/supabase/client';
import { charlotteVoiceService } from '@/services/CharlotteVoiceService';
import { DebugLogger } from '@/services/DebugLogger';
import { OpenAIVoiceCommands } from './OpenAIVoiceCommands';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface UnifiedVoiceCommandsProps {
  agentId?: string;
  clientTools?: Record<string, (...args: any[]) => string>;
  onCommand?: (command: string) => void;
  showFallbackOption?: boolean;
  headless?: boolean;
}

interface VoiceSystemStatus {
  system: 'elevenlabs' | 'openai' | 'idle';
  status: 'connecting' | 'connected' | 'listening' | 'processing' | 'failed' | 'idle';
  error?: string;
}

const CHARLOTTE = 'XB0fDUnXU5powFXDhCwa';

export const UnifiedVoiceCommands: React.FC<UnifiedVoiceCommandsProps> = ({ 
  agentId: initialAgentId, 
  clientTools: providedClientTools,
  onCommand,
  showFallbackOption = false,
  headless = false
}) => {
  const { toast } = useToast();
  const [agentId, setAgentId] = useState<string>(() => initialAgentId || (localStorage.getItem('eleven_agent_id') || ''));
  const [currentSystem, setCurrentSystem] = useState<VoiceSystemStatus>({
    system: 'idle',
    status: 'idle'
  });
  const [manualOverride, setManualOverride] = useState(false);
  const [readingSpeed, setReadingSpeed] = useState(1.0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced client tools with speed controls and all previous functionality
  const clientTools = useMemo(() => providedClientTools || ({
    // Voice Command: "read", "start reading", "play" -> play tool
    play: async () => {
      if (DebugLogger.isDebugEnabled()) {
        DebugLogger.log('audio', 'UNIFIED VOICE COMMAND: play tool called');
      }
      const text = (window as any).__lastNarrationText || (window as any).__pageContentString || '';
      
      if (!text) {
        DebugLogger.error('audio', 'No text content available for reading');
        return 'no_text';
      }
      
      try {
        // Brief delay to let Charlotte acknowledgment finish
        setTimeout(() => {
          charlotteVoiceService.charlotteReadStory(text, () => {}).catch((error) => 
            DebugLogger.error('audio', 'Text-to-speech failed', error)
          );
        }, 200);
        return 'Starting to read the story';
      } catch (error) {
        DebugLogger.error('audio', 'Play command failed:', error);
        return 'error';
      }
    },
    
    // Voice Command: "stop", "stop reading" -> stop tool
    stop: async () => {
      DebugLogger.log('audio', 'UNIFIED VOICE COMMAND: stop tool called');
      try {
        charlotteVoiceService.stop();
        return 'Stopped reading';
      } catch (error) {
        DebugLogger.error('audio', 'Stop command failed:', error);
        return 'error';
      }
    },
    
    // Voice Command: "pause", "pause reading" -> pause tool
    pause: async () => {
      DebugLogger.log('audio', 'UNIFIED VOICE COMMAND: pause tool called');
      try {
        charlotteVoiceService.stop();
        return 'Paused reading';
      } catch (error) {
        DebugLogger.error('audio', 'Pause command failed:', error);
        return 'error';
      }
    },
    
    // Voice Command: "next", "next page", "go forward" -> next tool
    next: async () => {
      DebugLogger.log('audio', 'UNIFIED VOICE COMMAND: next tool called');
      try {
        window.dispatchEvent(new CustomEvent('reader:navigate', { detail: { direction: 'next' } }));
        return 'Going to the next page now!';
      } catch (error) {
        DebugLogger.error('audio', 'Next navigation failed:', error);
        return 'Sorry, I could not go to the next page.';
      }
    },
    
    // Voice Command: "back", "previous", "go back", "previous page" -> previous tool
    previous: async () => {
      DebugLogger.log('audio', 'UNIFIED VOICE COMMAND: previous tool called');
      try {
        window.dispatchEvent(new CustomEvent('reader:navigate', { detail: { direction: 'prev' } }));
        return 'Going back to the previous page!';
      } catch (error) {
        DebugLogger.error('audio', 'Previous navigation failed:', error);
        return 'Sorry, I could not go to the previous page.';
      }
    },
    
    // Voice Command: "what is this word", "help with word", "explain word" -> wordHelp tool
    wordHelp: async (params?: any) => {
      DebugLogger.log('audio', 'UNIFIED VOICE COMMAND: wordHelp tool called with params:', params);
      try {
        window.dispatchEvent(new CustomEvent('voice:wordHelp', { detail: params || null }));
        
        if (params?.word) {
          return `Let me help you with the word "${params.word}". I'll break it down for you: ${params.word.split('').join('-')}. This word means...`;
        }
        return 'I can help you with any word! Just tell me which word you need help with.';
      } catch (error) {
        DebugLogger.error('audio', 'Word help failed:', error);
        return 'Sorry, I could not help with that word right now.';
      }
    },
    
    // Voice Command: "read faster", "faster", "speed up" -> speedUp tool
    speedUp: async () => {
      const newSpeed = Math.min(readingSpeed + 0.15, 2.0);
      setReadingSpeed(newSpeed);
      DebugLogger.log('audio', 'Speed increased to:', newSpeed);
      return 'Reading faster now';
    },
    
    // Voice Command: "read slower", "slower", "slow down" -> slowDown tool
    slowDown: async () => {
      const newSpeed = Math.max(readingSpeed - 0.15, 0.5);
      setReadingSpeed(newSpeed);
      DebugLogger.log('audio', 'Speed decreased to:', newSpeed);
      return 'Reading slower now';
    },
    
    // Voice Command: "normal speed", "reset speed" -> normalSpeed tool
    normalSpeed: async () => {
      setReadingSpeed(1.0);
      DebugLogger.log('audio', 'Speed reset to normal');
      return 'Back to normal speed';
    },
  }), [readingSpeed, providedClientTools]);

  // ElevenLabs conversation setup
  const conversation = useConversation({
    clientTools,
    overrides: {
      tts: { voiceId: CHARLOTTE },
    },
    onConnect: () => { 
      DebugLogger.log('audio', 'ElevenLabs conversation connected');
      setCurrentSystem(prev => ({ ...prev, status: 'listening' }));
      window.dispatchEvent(new CustomEvent('voice:status', { detail: { status: 'listening', system: 'elevenlabs' } }));
    },
    onDisconnect: () => { 
      DebugLogger.log('audio', 'ElevenLabs conversation disconnected');
      setCurrentSystem({ system: 'idle', status: 'idle' });
      window.dispatchEvent(new CustomEvent('voice:status', { detail: { status: 'idle' } }));
    },
    onError: (e) => { 
      DebugLogger.error('audio', 'ElevenLabs conversation error:', e);
      const errorMessage = String(e);
      setCurrentSystem(prev => ({ ...prev, status: 'failed', error: errorMessage }));
      window.dispatchEvent(new CustomEvent('voice:status', { detail: { status: 'failed', error: errorMessage } }));
    },
    onMessage: (message) => {
      const msgData = message as any;
      DebugLogger.log('audio', 'ElevenLabs message:', message);
      
      if (msgData.type === 'agent.tool_call') {
        DebugLogger.log('audio', 'Tool call detected:', {
          toolName: msgData.tool_name,
          arguments: msgData.arguments
        });
        setCurrentSystem(prev => ({ ...prev, status: 'processing' }));
        window.dispatchEvent(new CustomEvent('voice:status', { detail: { status: 'processing', system: 'elevenlabs' } }));
      } else if (msgData.type === 'agent.tool_response') {
        setCurrentSystem(prev => ({ ...prev, status: 'listening' }));
        window.dispatchEvent(new CustomEvent('voice:status', { detail: { status: 'listening', system: 'elevenlabs' } }));
      }
    },
  });

  // Persist agentId
  useEffect(() => {
    try { 
      if (agentId) localStorage.setItem('eleven_agent_id', agentId); 
    } catch {}
  }, [agentId]);

  // Start ElevenLabs connection
  const startElevenLabs = useCallback(async () => {
    setCurrentSystem({ system: 'elevenlabs', status: 'connecting' });
    
    window.dispatchEvent(new CustomEvent('voice:status', { 
      detail: { status: 'connecting', system: 'elevenlabs' } 
    }));
    
    try {
      DebugLogger.log('audio', 'Starting ElevenLabs conversation...');
      
      // Enhanced microphone permission check
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          ...(isMobileDevice && {
            sampleRate: 48000,
            channelCount: 1,
            latency: 0.1
          })
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      stream.getTracks().forEach(track => track.stop());
      DebugLogger.log('audio', 'Microphone access granted');

      // Get signed URL from Supabase edge function
      const body = agentId ? { agentId } : {};
      const { data, error } = await supabase.functions.invoke('elevenlabs-agent-signed-url', { body });
      
      if (error || (data as any)?.error) {
        const errorMsg = error?.message || (data as any)?.error || 'Unknown error';
        throw new Error(`ElevenLabs setup failed: ${errorMsg}`);
      }

      const url = (data as any)?.signed_url || (data as any)?.url || (data as any)?.signedUrl;
      if (!url || !/^wss?:\/\//.test(url)) {
        throw new Error('Invalid or missing signed URL from ElevenLabs');
      }

      const id = await (conversation as any).startSession({ url });
      DebugLogger.log('audio', 'ElevenLabs conversation started:', id);
      
      const storyTitle = (window as any).__storyTitle || '';
      const contextMessage = storyTitle ? `Your buddy Charlotte is ready to help with "${storyTitle}"!` : "Your buddy Charlotte is ready to help!";
      toast({ 
        title: contextMessage, 
        description: 'Try saying "play story" or "help with this word"' 
      });
      
    } catch (e: any) {
      DebugLogger.error('audio', 'ElevenLabs connection failed:', e);
      
      if (!manualOverride && showFallbackOption) {
        DebugLogger.log('audio', 'Falling back to OpenAI voice commands');
        fallbackToOpenAI();
      } else {
        setCurrentSystem({ system: 'idle', status: 'failed', error: e.message });
        window.dispatchEvent(new CustomEvent('voice:status', { 
          detail: { status: 'failed', system: 'elevenlabs', error: e.message } 
        }));
        
        toast({ 
          title: 'Voice Assistant Error', 
          description: e?.message || 'Could not start voice session', 
          variant: 'destructive' 
        });
      }
    }
  }, [agentId, conversation, toast, manualOverride, showFallbackOption]);

  // Fallback to OpenAI
  const fallbackToOpenAI = useCallback(() => {
    setCurrentSystem({ system: 'openai', status: 'connecting' });
    window.dispatchEvent(new CustomEvent('openai:start'));
    
    // Wait for OpenAI connection with timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setCurrentSystem({ system: 'idle', status: 'failed', error: 'OpenAI connection timeout' });
    }, 10000);
  }, []);

  // Start voice commands (with fallback logic)
  const startVoiceCommands = useCallback(async () => {
    if (manualOverride) {
      fallbackToOpenAI();
    } else {
      await startElevenLabs();
    }
  }, [manualOverride, startElevenLabs, fallbackToOpenAI]);

  // Stop voice commands
  const stopVoiceCommands = useCallback(async () => {
    try { 
      await (conversation as any).endSession(); 
    } catch {}
    
    window.dispatchEvent(new CustomEvent('voice:stop'));
    setCurrentSystem({ system: 'idle', status: 'idle' });
    window.dispatchEvent(new CustomEvent('voice:status', { detail: { status: 'idle' } }));
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [conversation]);

  // Toggle voice commands
  const toggleVoiceCommands = () => {
    if (currentSystem.status !== 'idle') {
      stopVoiceCommands();
    } else {
      startVoiceCommands();
    }
  };

  // Listen for voice status updates and global events
  useEffect(() => {
    const handleVoiceStatus = (event: CustomEvent) => {
      const { status, system, error } = event.detail;
      
      if (system === 'openai') {
        setCurrentSystem(prev => ({ 
          ...prev, 
          status, 
          system: system || prev.system,
          error 
        }));
        
        // Clear timeout if OpenAI connects successfully
        if (status === 'listening' && timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    };

    const startHandler = () => { 
      if (currentSystem.status === 'idle') startVoiceCommands(); 
    };
    
    const stopHandler = () => { 
      if (currentSystem.status !== 'idle') stopVoiceCommands(); 
    };
    
    const toggleHandler = () => toggleVoiceCommands();

    window.addEventListener('voice:status', handleVoiceStatus as EventListener);
    window.addEventListener('voice:start', startHandler);
    window.addEventListener('voice:stop', stopHandler);
    window.addEventListener('voice:toggle', toggleHandler);
    
    return () => {
      window.removeEventListener('voice:status', handleVoiceStatus as EventListener);
      window.removeEventListener('voice:start', startHandler);
      window.removeEventListener('voice:stop', stopHandler);
      window.removeEventListener('voice:toggle', toggleHandler);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentSystem.status, startVoiceCommands, stopVoiceCommands]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Helper functions for UI
  const getStatusColor = () => {
    switch (currentSystem.status) {
      case 'connected':
      case 'listening': return 'bg-green-500 animate-pulse';
      case 'processing': return 'bg-yellow-500 animate-pulse';
      case 'connecting': return 'bg-blue-500 animate-pulse';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getButtonText = () => {
    if (currentSystem.status === 'idle') return 'Talk to Buddy';
    if (currentSystem.status === 'connecting') return 'Connecting...';
    if (currentSystem.status === 'processing') return 'Processing...';
    if (currentSystem.status === 'listening') return 'Listening...';
    return 'Voice Active';
  };

  const getSystemLabel = () => {
    if (currentSystem.system === 'idle') return 'Ready';
    if (currentSystem.system === 'elevenlabs') return 'Voice Assistant';
    if (currentSystem.system === 'openai') return 'Backup Voice';
    return 'Ready';
  };

  // Handle command passthrough for legacy compatibility
  useEffect(() => {
    if (onCommand) {
      const handleCommand = (event: CustomEvent) => {
        onCommand(event.detail.command);
      };
      window.addEventListener('voice:command', handleCommand as EventListener);
      return () => window.removeEventListener('voice:command', handleCommand as EventListener);
    }
  }, [onCommand]);

  // Headless mode - only handle events, no UI
  if (headless) {
    return (
      <div className="hidden">
        {currentSystem.system === 'openai' && <OpenAIVoiceCommands />}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-4">
        <Button 
          onClick={toggleVoiceCommands}
          variant={currentSystem.status === 'idle' ? 'default' : 'outline'}
          disabled={currentSystem.status === 'connecting'}
          className="gap-2"
        >
          {currentSystem.status === 'connecting' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : currentSystem.status === 'idle' ? (
            <Mic className="w-4 h-4" />
          ) : (
            <MicOff className="w-4 h-4" />
          )}
          {getButtonText()}
        </Button>
        
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
          <div className="flex flex-col text-xs">
            <Badge variant="outline" className="text-xs">
              {getSystemLabel()}
            </Badge>
            {readingSpeed !== 1.0 && (
              <Badge variant="secondary" className="text-xs mt-1">
                Speed: {readingSpeed.toFixed(1)}x
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Command help */}
      {currentSystem.status !== 'idle' && (
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
      )}

      {/* Fallback option */}
      {showFallbackOption && (
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
      )}

      {/* Error display */}
      {currentSystem.status === 'failed' && currentSystem.error && (
        <div className="text-xs text-destructive text-center max-w-md">
          {currentSystem.error}
        </div>
      )}

      {/* Hidden OpenAI component when using fallback */}
      {currentSystem.system === 'openai' && (
        <div className="hidden">
          <OpenAIVoiceCommands />
        </div>
      )}
    </div>
  );
};

export default UnifiedVoiceCommands;

// Backward compatibility exports
export { UnifiedVoiceCommands as VoiceCommands };
export { UnifiedVoiceCommands as HybridVoiceCommands };
export { UnifiedVoiceCommands as VoiceCommandController };

// Deprecated exports (for migration warning)
export const VoiceHoverController = () => {
  console.warn('VoiceHoverController is deprecated. Functionality moved to PremiumHoverController.');
  return null;
};

export const VoiceCommandIntegration = () => {
  console.warn('VoiceCommandIntegration is deprecated. Functionality integrated into UnifiedVoiceCommands.');
  return null;
};