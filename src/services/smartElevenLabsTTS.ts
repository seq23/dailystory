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

    // First attempt: with dictionary (for learning context)
    const { data, error } = await supabase.functions.invoke('elevenlabs-tts-smart', {
      body: {
        text,
        voiceId,
        context
      }
    });

    if (error) {
      console.error('❌ Smart TTS Error:', error);
      
      // If dictionary-related error and learning context, retry without dictionary
      if (context === 'learning' && (error.message.includes('dictionary') || error.message.includes('pronunciation'))) {
        console.log('🔄 Retrying TTS without dictionary for learning context...');
        
        try {
          const { data: retryData, error: retryError } = await supabase.functions.invoke('elevenlabs-tts-smart', {
            body: {
              text,
              voiceId,
              context: 'conversation' // Use conversation context to avoid dictionary
            }
          });
          
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