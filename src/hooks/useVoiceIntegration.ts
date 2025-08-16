import { useRef, useCallback } from 'react';
import { SimpleAudioEngine } from '@/services/SimpleAudioEngine';
import { useConversation } from '@11labs/react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook to integrate the main UI voice buttons with the SimpleVoiceCommands system
 */
export const useVoiceIntegration = () => {
  const engine = SimpleAudioEngine.getInstance();
  const voiceSystemRef = useRef<any>(null);

  // Enhanced word context resolution function
  const getContextualWord = (providedWord?: string): string => {
    if (providedWord && providedWord.trim()) return providedWord.trim();
    
    // Check global word context (set by InteractiveWord system)
    const hoveredWord = (window as any).__hoveredWord;
    const lastSelectedWord = (window as any).__lastSelectedWord;
    
    if (hoveredWord?.trim()) return hoveredWord.trim();
    if (lastSelectedWord?.trim()) return lastSelectedWord.trim();
    
    return ''; // Will trigger clarification request
  };

  // Define client tools for voice commands - Enhanced Charlotte/Buddy capabilities
  const clientTools = {
    play: () => {
      console.log('🎯 Voice command: play');
      const text = (window as any).__pageContentString || '';
      const hash = (window as any).__pageContentHash || undefined;
      const storyTitle = (window as any).__storyTitle || '';
      const userName = (window as any).__userName || '';
      
      if (text) {
        // Brief delay to let Charlotte finish her acknowledgment
        setTimeout(() => {
          engine.playText({ 
            text, 
            contentHash: hash,
            voiceId: 'XB0fDUnXU5powFXDhCwa' // Charlotte
          }).catch(console.error);
        }, 200);
        return "Got it!"; // Very brief response to avoid audio conflicts
      }
      return "No story content available to read";
    },
    
    stop: () => {
      console.log('🎯 Voice command: stop');
      engine.stop();
      return "Stopped reading";
    },
    
    next: () => {
      console.log('🎯 Voice command: next page');
      window.dispatchEvent(new CustomEvent('reader:navigate', { 
        detail: { direction: 'next' } 
      }));
      return "Going to next page";
    },
    
    previous: () => {
      console.log('🎯 Voice command: previous page');
      window.dispatchEvent(new CustomEvent('reader:navigate', { 
        detail: { direction: 'prev' } 
      }));
      return "Going to previous page";
    },
    
    // ENHANCED WORD ASSISTANCE TOOLS with Context Awareness
    wordHelp: (args: any) => {
      const word = getContextualWord(args?.word || args?.text);
      console.log('🎯 Voice command: general word help for:', word);
      
      if (word) {
        // Trigger comprehensive word help modal or voice explanation
        window.dispatchEvent(new CustomEvent('voice:wordHelp', { 
          detail: { word, action: 'general' }
        }));
        return `Let me help you with "${word}". I can pronounce it, explain what it means, or break it into syllables!`;
      }
      return "Please tell me which word you'd like help with, or hover over a word and ask again!";
    },

    hearWord: (args: any) => {
      const word = getContextualWord(args?.word || args?.text);
      console.log('🎯 Voice command: hear word:', word);
      
      if (word) {
        // Use existing VoiceHoverController functionality
        window.dispatchEvent(new CustomEvent('voice:hover:word', {
          detail: { word, action: 'hear' }
        }));
        return `Here's how "${word}" sounds!`;
      }
      return "Please tell me which word you'd like to hear, or hover over a word and ask again!";
    },

    explainWord: (args: any) => {
      const word = getContextualWord(args?.word || args?.text);
      console.log('🎯 Voice command: explain word:', word);
      
      if (word) {
        // Use existing VoiceHoverController functionality  
        window.dispatchEvent(new CustomEvent('voice:hover:word', {
          detail: { word, action: 'explain' }
        }));
        return `Let me explain what "${word}" means!`;
      }
      return "Please tell me which word you'd like me to explain, or hover over a word and ask again!";
    },

    syllableWord: (args: any) => {
      const word = getContextualWord(args?.word || args?.text);
      console.log('🎯 Voice command: syllables for:', word);
      
      if (word) {
        // Enhanced syllable breakdown with counting
        import('@/services/phoneticRulesEngine').then(({ phoneticRulesEngine }) => {
          const syllables = phoneticRulesEngine.breakIntoSyllables(word);
          const count = syllables?.length || 1;
          const syllableText = syllables?.join(' - ') || word;
          
          // Play enhanced syllable response
          const response = `"${word}" has ${count} syllable${count !== 1 ? 's' : ''}: ${syllableText}`;
          
          engine.playText({
            text: response,
            voiceId: 'XB0fDUnXU5powFXDhCwa', // Charlotte
            contentHash: response.substring(0, 20)
          });
        });
        
        return `Breaking down "${word}" into syllables for you!`;
      }
      return "Please tell me which word you'd like me to break into syllables, or hover over a word and ask again!";
    },

    // Quiz commands
    startQuiz: () => {
      console.log('🎯 Voice command: start quiz');
      window.dispatchEvent(new CustomEvent('voice:quiz', {
        detail: { action: 'start' }
      }));
      const storyTitle = (window as any).__storyTitle || '';
      return `Great! Let's start a quiz about ${storyTitle ? `"${storyTitle}"` : 'your story'}!`;
    },

    askQuestion: (args: any) => {
      console.log('🎯 Voice command: ask question', args);
      const { question, options } = args || {};
      
      if (question && options) {
        let response = `Here's your question: ${question.question || question}. `;
        if (options && Array.isArray(options)) {
          response += 'Your options are: ';
          options.forEach((option: string, index: number) => {
            response += `${String.fromCharCode(65 + index)}: ${option}. `;
          });
        }
        response += 'What is your answer?';
        return response;
      }
      
      return "Here's your quiz question!";
    },

    processAnswer: (args: any) => {
      console.log('🎯 Voice command: process answer', args);
      const answer = args?.answer || args?.text || args;
      
      window.dispatchEvent(new CustomEvent('voice:quiz', {
        detail: { 
          action: 'answer', 
          data: { 
            answerText: answer,
            answerIndex: args?.index 
          } 
        }
      }));
      
      return "Got your answer! Let me check that...";
    },

    endQuiz: () => {
      console.log('🎯 Voice command: end quiz');
      window.dispatchEvent(new CustomEvent('voice:quiz', {
        detail: { action: 'end' }
      }));
      return "Great job completing the quiz!";
    }
  };

  const {
    status,
    isSpeaking,
    startSession,
    endSession
  } = useConversation({ 
    clientTools,
    onConnect: () => {
      console.log('🎤 Connected to Charlotte (Buddy) via integration hook');
      
      // Dispatch voice status event for UI updates
      window.dispatchEvent(new CustomEvent('voice:status', { 
        detail: { status: 'listening', system: 'elevenlabs' } 
      }));
      
      // No toast here - let ElevenLabs handle connection feedback to avoid duplicates
    },
    onDisconnect: () => {
      console.log('🎤 Disconnected from Charlotte (Buddy) via integration hook');
      
      // Dispatch voice status event for UI updates
      window.dispatchEvent(new CustomEvent('voice:status', { 
        detail: { status: 'idle', system: 'elevenlabs' } 
      }));
      
      toast.info('Charlotte disconnected');
    },
    onError: (error: any) => {
      console.error('🎤 Voice error in integration hook:', error);
      const errorMessage = typeof error === 'string' ? error : error?.message || 'Connection failed';
      toast.error(`Voice error: ${errorMessage}`);
      
      // Dispatch error status
      window.dispatchEvent(new CustomEvent('voice:status', { 
        detail: { status: 'idle', system: 'elevenlabs' } 
      }));
    },
    onMessage: (message) => {
      console.log('🎤 Voice message received in integration hook:', message);
    }
  });

  const handleVoiceToggle = useCallback(async () => {
    if (status === 'connected') {
      console.log('🎤 Voice session already connected, ending...');
      await endSession();
    } else {
      try {
        console.log('🎤 Starting voice command session via integration hook...');
        
        // Update UI to show connecting state
        window.dispatchEvent(new CustomEvent('voice:status', { 
          detail: { status: 'processing', system: 'elevenlabs' } 
        }));
        
        // Test microphone permissions first
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          console.log('🎤 Microphone access granted');
          stream.getTracks().forEach(track => track.stop()); // Clean up test stream
        } catch (micError) {
          console.error('🎤 Microphone access denied:', micError);
          toast.error('Microphone access required for voice commands');
          window.dispatchEvent(new CustomEvent('voice:status', { 
            detail: { status: 'idle', system: 'elevenlabs' } 
          }));
          return;
        }
        
        // Get signed URL from Supabase  
        console.log('🎤 Requesting ElevenLabs agent signed URL...');
        const { data, error } = await supabase.functions.invoke('elevenlabs-agent-signed-url');
        
        if (error) {
          console.error('🎤 Supabase function error:', error);
          toast.error(`Voice connection failed: ${error.message}`);
          window.dispatchEvent(new CustomEvent('voice:status', { 
            detail: { status: 'idle', system: 'elevenlabs' } 
          }));
          return;
        }
        
        if (!data?.signed_url) {
          console.error('🎤 No signed URL in response:', data);
          toast.error('No signed URL received from ElevenLabs');
          window.dispatchEvent(new CustomEvent('voice:status', { 
            detail: { status: 'idle', system: 'elevenlabs' } 
          }));
          return;
        }
        
        console.log('🎤 Got signed URL, starting session...');
        const sessionResult = await startSession({ signedUrl: data.signed_url });
        console.log('🎤 Session started successfully:', sessionResult);
      } catch (error: any) {
        console.error('🎤 Failed to start voice session:', error);
        toast.error(`Could not connect to Buddy: ${error.message || 'Unknown error'}`);
        window.dispatchEvent(new CustomEvent('voice:status', { 
          detail: { status: 'idle', system: 'elevenlabs' } 
        }));
      }
    }
  }, [status, startSession, endSession]);

  return {
    status,
    isSpeaking,
    handleVoiceToggle,
    isConnected: status === 'connected',
    isConnecting: status === 'connecting'
  };
};