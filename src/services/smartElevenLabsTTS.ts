import { supabase } from '@/integrations/supabase/client';

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
    console.log(`🔊 Smart TTS: "${text}" [Context: ${context}]`);

    // Request audio coordinator permission for Charlotte speech
    if (context === 'conversation') {
      window.dispatchEvent(new CustomEvent('audio:request', { detail: { system: 'charlotte' } }));
    }

    // Add timeout protection - 15 seconds for TTS requests (increased for better reliability)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('TTS request timeout - falling back to browser speech')), 15000);
    });

    try {
      // Race between TTS request and timeout
      const { data, error } = await Promise.race([
        supabase.functions.invoke('elevenlabs-tts-smart', {
          body: {
            text,
            voiceId,
            context
          }
        }),
        timeoutPromise
      ]);

      if (error) {
        console.error('❌ Smart TTS Error:', error);
        
        // If dictionary-related error and learning context, retry without dictionary
        if (context === 'learning' && (error.message.includes('dictionary') || error.message.includes('pronunciation'))) {
          console.log('🔄 Retrying TTS without dictionary for learning context...');
          
          try {
            const { data: retryData, error: retryError } = await Promise.race([
              supabase.functions.invoke('elevenlabs-tts-smart', {
                body: {
                  text,
                  voiceId,
                  context: 'conversation' // Use conversation context to avoid dictionary
                }
              }),
              timeoutPromise
            ]);
            
            if (!retryError && retryData?.audioContent) {
              console.log('✅ Smart TTS Success (no dictionary fallback)');
              
              // Convert base64 to ArrayBuffer
              const binaryString = atob(retryData.audioContent);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              
              // Release audio coordinator lock for Charlotte speech (original context was conversation)
              window.dispatchEvent(new CustomEvent('audio:stopped', { detail: { system: 'charlotte' } }));
              
              return bytes.buffer;
            }
          } catch (retryErr) {
            console.warn('Retry without dictionary also failed:', retryErr);
          }
        }
        
        throw new Error(`Smart TTS failed: ${error.message}`);
      }

      if (!data?.audioContent) {
        throw new Error('No audio content received from Smart TTS');
      }

      // Convert base64 to ArrayBuffer
      const binaryString = atob(data.audioContent);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      console.log(`✅ Smart TTS Success: ${bytes.byteLength} bytes [Applied Lexicon: ${data.appliedLexicon || false}]`);
      
      // Release audio coordinator lock for Charlotte speech
      if (context === 'conversation') {
        window.dispatchEvent(new CustomEvent('audio:stopped', { detail: { system: 'charlotte' } }));
      }
      
      return bytes.buffer;
      
    } catch (timeoutError) {
      console.error('❌ TTS request timed out, falling back to browser speech');
      
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
    console.log('🗣️ Charlotte conversation speech - forcing conversation context');
    return this.generateSpeech(text, 'conversation', voiceId);
  }

  /**
   * Generate phonetic speech for learning content
   */
  static async generateLearningSpeech(text: string, voiceId?: string): Promise<ArrayBuffer> {
    return this.generateSpeech(text, 'learning', voiceId);
  }
}