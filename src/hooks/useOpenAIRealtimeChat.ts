import { useState, useEffect, useRef, useCallback } from 'react';
import { AudioRecorder, encodeAudioForAPI, playAudioData, clearAudioQueue } from '@/utils/audioUtils';
import { useToast } from '@/hooks/use-toast';
import { DebugLogger } from '@/services/DebugLogger';

interface RealtimeChatMessage {
  type: string;
  content?: string;
  timestamp: number;
}

interface UseOpenAIRealtimeChatProps {
  onFunctionCall?: (functionName: string, args: any) => void;
}

export const useOpenAIRealtimeChat = ({ onFunctionCall }: UseOpenAIRealtimeChatProps = {}) => {
  const [messages, setMessages] = useState<RealtimeChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const transcriptBufferRef = useRef('');
  
  const { toast } = useToast();

  const initAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      
      // Resume audio context if suspended (mobile requirement)
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      DebugLogger.log('audio', 'Audio context initialized');
    }
    return audioContextRef.current;
  }, []);

  const handleAudioData = useCallback((audioData: Float32Array) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const base64Audio = encodeAudioForAPI(audioData);
      const message = {
        type: 'input_audio_buffer.append',
        audio: base64Audio
      };
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const connect = useCallback(async () => {
    try {
      DebugLogger.log('audio', 'Connecting to Voice Assistant...');
      
      // Initialize audio context first
      await initAudioContext();
      
      // Connect to our Supabase edge function
      const wsUrl = 'wss://cpzeuogomaixamrtnnmj.functions.supabase.co/openai-realtime';
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        DebugLogger.log('audio', 'Connected to Voice Assistant');
        setIsConnected(true);
        
        // Dispatch global voice status event
        window.dispatchEvent(new CustomEvent('voice:status', { 
          detail: { status: 'connected', system: 'openai' } 
        }));
        
        toast({
          title: 'Voice Assistant Ready',
          description: 'Say: "read", "stop", "next", "back", or "what is this word"'
        });
      };

      wsRef.current.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        DebugLogger.log('audio', 'Received message', { type: data.type });

        switch (data.type) {
          case 'response.audio.delta':
            // Play audio chunk
            if (audioContextRef.current && data.delta) {
              const binaryString = atob(data.delta);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              await playAudioData(audioContextRef.current, bytes);
              
              // Dispatch speaking status
              window.dispatchEvent(new CustomEvent('voice:status', { 
                detail: { status: 'speaking', system: 'openai' } 
              }));
            }
            break;

          case 'response.audio_transcript.delta':
            // Accumulate transcript
            if (data.delta) {
              transcriptBufferRef.current += data.delta;
            }
            break;

          case 'response.audio_transcript.done':
            // Complete transcript received
            if (transcriptBufferRef.current) {
              setMessages(prev => [...prev, {
                type: 'assistant',
                content: transcriptBufferRef.current,
                timestamp: Date.now()
              }]);
              transcriptBufferRef.current = '';
            }
            break;

          case 'function_call':
            // Handle function calls from our edge function
            DebugLogger.log('audio', 'Function call', { function: data.function, arguments: data.arguments });
            onFunctionCall?.(data.function, data.arguments);
            break;

          case 'input_audio_buffer.speech_started':
            DebugLogger.log('audio', 'Speech started');
            setIsProcessing(true);
            clearAudioQueue(); // Stop any ongoing audio
            
            // Dispatch processing status
            window.dispatchEvent(new CustomEvent('voice:status', { 
              detail: { status: 'processing', system: 'openai' } 
            }));
            break;

          case 'input_audio_buffer.speech_stopped':
            DebugLogger.log('audio', 'Speech stopped');
            setIsProcessing(false);
            
            // Dispatch listening status
            window.dispatchEvent(new CustomEvent('voice:status', { 
              detail: { status: 'listening', system: 'openai' } 
            }));
            break;

          case 'error':
            console.error('❌ API Error:', data.message);
            toast({
              title: 'Voice Error',
              description: data.message,
              variant: 'destructive'
            });
            break;

          case 'disconnected':
            DebugLogger.log('audio', 'Disconnected', { reason: data.reason });
            setIsConnected(false);
            break;
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        
        // Dispatch error status
        window.dispatchEvent(new CustomEvent('voice:status', { 
          detail: { status: 'failed', system: 'openai', error: 'Connection failed' } 
        }));
        
        toast({
          title: 'Voice Assistant Error',
          description: 'Failed to connect to voice service',
          variant: 'destructive'
        });
      };

      wsRef.current.onclose = () => {
        DebugLogger.log('audio', 'Connection closed');
        setIsConnected(false);
        setIsRecording(false);
        
        // Dispatch disconnected status
        window.dispatchEvent(new CustomEvent('voice:status', { 
          detail: { status: 'idle', system: 'openai' } 
        }));
      };

    } catch (error) {
      console.error('❌ Connection failed:', error);
      toast({
        title: 'Connection Failed',
        description: 'Could not connect to voice service',
        variant: 'destructive'
      });
    }
  }, [initAudioContext, onFunctionCall, toast]);

  const startRecording = useCallback(async () => {
    try {
      DebugLogger.log('audio', 'Starting recording...');
      
      if (!audioRecorderRef.current) {
        audioRecorderRef.current = new AudioRecorder((audioData) => {
          handleAudioData(audioData);
          
          // Calculate and dispatch voice level for visualization
          const level = audioData.reduce((max, sample) => Math.max(max, Math.abs(sample)), 0);
          window.dispatchEvent(new CustomEvent('voice:level', { detail: { level } }));
        });
      }
      
      await audioRecorderRef.current.start();
      setIsRecording(true);
      
      // Dispatch listening status
      window.dispatchEvent(new CustomEvent('voice:status', { 
        detail: { status: 'listening', system: 'openai' } 
      }));
      
      DebugLogger.log('audio', 'Recording started');
    } catch (error) {
      console.error('❌ Recording failed:', error);
      
      // Dispatch error status
      window.dispatchEvent(new CustomEvent('voice:status', { 
        detail: { status: 'failed', system: 'openai', error: 'Microphone access denied' } 
      }));
      
      toast({
        title: 'Microphone Error',
        description: 'Could not access microphone',
        variant: 'destructive'
      });
    }
  }, [handleAudioData, toast]);

  const stopRecording = useCallback(() => {
    DebugLogger.log('audio', 'Stopping recording...');
    
    if (audioRecorderRef.current) {
      audioRecorderRef.current.stop();
      audioRecorderRef.current = null;
    }
    
    setIsRecording(false);
    
    // Dispatch connected status (no longer listening)
    window.dispatchEvent(new CustomEvent('voice:status', { 
      detail: { status: 'connected', system: 'openai' } 
    }));
    
    DebugLogger.log('audio', 'Recording stopped');
  }, []);

  const disconnect = useCallback(() => {
    DebugLogger.log('audio', 'Disconnecting...');
    
    if (audioRecorderRef.current) {
      audioRecorderRef.current.stop();
      audioRecorderRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    clearAudioQueue();
    setIsConnected(false);
    setIsRecording(false);
    setIsProcessing(false);
  }, []);

  const sendTextMessage = useCallback((text: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = {
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [{ type: 'input_text', text }]
        }
      };
      
      wsRef.current.send(JSON.stringify(message));
      wsRef.current.send(JSON.stringify({ type: 'response.create' }));
      
      setMessages(prev => [...prev, {
        type: 'user',
        content: text,
        timestamp: Date.now()
      }]);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [disconnect]);

  return {
    messages,
    isConnected,
    isRecording,
    isProcessing,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    sendTextMessage
  };
};