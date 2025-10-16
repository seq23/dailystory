import { supabase } from '@/integrations/supabase/client';
import { DebugLogger } from '@/services/DebugLogger';
import { AdaptiveTimeout } from '@/utils/adaptiveTimeout';
import { TTSCircuitBreaker } from '@/services/TTSCircuitBreaker';

/**
 * Smart ElevenLabs TTS service that applies phonetic lexicon only for learning contexts
 * Conversation contexts use natural pronunciation
 */
export class SmartElevenLabsTTS {
  /**
   * Generate speech with context-aware pronunciation
   * @param text - Text to convert to speech
   * @param context - 'conversation' for natural speech, 'learning' for phonetic pronunciation
   * @param voiceId - ElevenLabs voice ID (defaults to Charlotte)
   */
  static async generateSpeech(
    text: string, 
    context: 'conversation' | 'learning' = 'conversation',
    voiceId: string = 'XB0fDUnXU5powFXDhCwa'
  ): Promise<ArrayBuffer> {
    DebugLogger.log('audio', `Smart TTS: "${text}" [Context: ${context}]`);

    // PHASE 2B: Check circuit breaker FIRST - fail-fast if ElevenLabs is down
    if (TTSCircuitBreaker.isOpen()) {
      DebugLogger.warn('audio', '⚠️ TTS circuit breaker OPEN - failing fast to browser speech');
      throw new Error('TTS circuit breaker open - ElevenLabs service unavailable');
    }

    // Request audio coordinator permission for Charlotte speech
    if (context === 'conversation') {
      window.dispatchEvent(new CustomEvent('audio:request', { detail: { system: 'charlotte' } }));
    }

    // TIMEOUT AUTHORITY: This is the ONLY timeout for all TTS requests
    // Adaptive: 15s for good connections, 25s for 3g, 30s for 2g/slow-2g
    const adaptiveTimeoutMs = AdaptiveTimeout.getTTSTimeout();
    DebugLogger.log('audio', `Using adaptive timeout: ${adaptiveTimeoutMs}ms`);
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`TTS request timeout after ${adaptiveTimeoutMs}ms - falling back to browser speech`)), adaptiveTimeoutMs);
    });

    try {
      // Race between TTS request and timeout
      const { data, error } = await Promise.race([
        supabase.functions.invoke('elevenlabs-tts-smart', {
          body: {
            text,
            voice_id: voiceId,
            context
          }
        }),
        timeoutPromise
      ]);

      if (error) {
        DebugLogger.error('audio', 'Smart TTS Error:', error);
        
        // If dictionary-related error and learning context, retry without dictionary
        if (context === 'learning' && (error.message.includes('dictionary') || error.message.includes('pronunciation'))) {
          DebugLogger.log('audio', 'Retrying TTS without dictionary for learning context...');
          
          try {
            const { data: retryData, error: retryError } = await Promise.race([
              supabase.functions.invoke('elevenlabs-tts-smart', {
                body: {
                  text,
                  voice_id: voiceId,
                  context: 'conversation' // Use conversation context to avoid dictionary
                }
              }),
              timeoutPromise
            ]);
            
            if (!retryError && retryData?.audio_base64) {
              DebugLogger.log('audio', 'Smart TTS Success (no dictionary fallback)');
              
              // Convert base64 to ArrayBuffer
              const binaryString = atob(retryData.audio_base64);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              
              // Release audio coordinator lock for Charlotte speech (original context was conversation)
              window.dispatchEvent(new CustomEvent('audio:stopped', { detail: { system: 'charlotte' } }));
              
              return bytes.buffer;
            }
          } catch (retryErr) {
            DebugLogger.warn('audio', 'Retry without dictionary also failed:', retryErr);
          }
        }
        
        throw new Error(`Smart TTS failed: ${error.message}`);
      }

      if (!data?.audio_base64) {
        throw new Error('No audio content received from Smart TTS');
      }

      // Convert base64 to ArrayBuffer
      const binaryString = atob(data.audio_base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      DebugLogger.log('audio', `Smart TTS Success: ${bytes.byteLength} bytes [Applied Lexicon: ${data.appliedLexicon || false}]`);
      
      // PHASE 2B: Record success in circuit breaker
      TTSCircuitBreaker.recordSuccess();
      
      // Release audio coordinator lock for Charlotte speech
      if (context === 'conversation') {
        window.dispatchEvent(new CustomEvent('audio:stopped', { detail: { system: 'charlotte' } }));
      }
      
      return bytes.buffer;
      
    } catch (timeoutError) {
      DebugLogger.error('audio', 'TTS request timed out, falling back to browser speech');
      
      // PHASE 2B: Record failure in circuit breaker
      TTSCircuitBreaker.recordFailure();
      
      // Fallback to browser speech synthesis
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8;
        utterance.pitch = 1.0;
        utterance.volume = 0.9;
        window.speechSynthesis.speak(utterance);
      }
      
      // Release audio coordinator lock
      if (context === 'conversation') {
        window.dispatchEvent(new CustomEvent('audio:stopped', { detail: { system: 'charlotte' } }));
      }
      
      throw timeoutError;
    }
  }

  /**
   * Generate natural speech for Charlotte's conversation (ALWAYS uses conversation context)
   */
  static async generateConversationSpeech(text: string, voiceId?: string): Promise<ArrayBuffer> {
    DebugLogger.log('audio', 'Charlotte conversation speech - forcing conversation context');
    return this.generateSpeech(text, 'conversation', voiceId);
  }

  /**
   * Generate phonetic speech for learning content
   */
  static async generateLearningSpeech(text: string, voiceId?: string): Promise<ArrayBuffer> {
    return this.generateSpeech(text, 'learning', voiceId);
  }
}