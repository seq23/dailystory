import { supabase } from '@/integrations/supabase/client';

interface TimestampData {
  characters: Array<{
    character: string;
    start_time_ms: number;
    duration_ms: number;
  }>;
  character_start_times_ms: number[];
  character_end_times_ms: number[];
}

interface SynchronizedTTSResult {
  audioBuffer: ArrayBuffer;
  wordTimings: Array<{
    word: string;
    startTime: number;
    endTime: number;
  }>;
}

/**
 * ElevenLabs TTS service with native timing synchronization
 * Uses ElevenLabs /with-timestamps endpoint for perfect word highlighting
 */
export class SynchronizedElevenLabsTTS {
  /**
   * Generate speech with native ElevenLabs timing data
   */
  static async generateSynchronizedSpeech(
    text: string, 
    context: 'conversation' | 'learning' = 'conversation',
    voiceId: string = 'XB0fDUnXU5powFXDhCwa'
  ): Promise<SynchronizedTTSResult> {
    console.log(`🔊 Synchronized TTS: "${text}" [Context: ${context}]`);

    const { data, error } = await supabase.functions.invoke('elevenlabs-tts-smart', {
      body: {
        text,
        voiceId,
        context,
        useTimestamps: true
      }
    });

    if (error) {
      console.error('❌ Synchronized TTS Error:', error);
      throw new Error(`Synchronized TTS failed: ${error.message}`);
    }

    if (!data?.audioContent || !data?.alignment) {
      throw new Error('No audio content or timing data received');
    }

    // Convert base64 audio to ArrayBuffer
    const binaryString = atob(data.audioContent);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Convert character-level timing to word-level timing
    const wordTimings = this.convertCharacterTimingsToWords(text, data.alignment);

    console.log(`✅ Synchronized TTS Success: ${bytes.byteLength} bytes, ${wordTimings.length} word timings`);
    
    return {
      audioBuffer: bytes.buffer,
      wordTimings
    };
  }

  /**
   * Convert ElevenLabs character-level timing to word-level timing
   */
  private static convertCharacterTimingsToWords(
    text: string, 
    alignment: TimestampData
  ): Array<{ word: string; startTime: number; endTime: number }> {
    const words = text.split(/(\s+)/).filter(word => word.trim().length > 0);
    const wordTimings: Array<{ word: string; startTime: number; endTime: number }> = [];
    
    let textIndex = 0;
    let charIndex = 0;
    
    for (const word of words) {
      // Find the start position of this word in the original text
      const wordStartIndex = text.indexOf(word, textIndex);
      const wordEndIndex = wordStartIndex + word.length;
      
      // Find corresponding character timings
      let wordStartTime = 0;
      let wordEndTime = 0;
      
      // Map to character alignment data
      if (charIndex < alignment.characters.length) {
        // Find character timing for word start
        const startChar = alignment.characters[charIndex];
        wordStartTime = startChar?.start_time_ms || 0;
        
        // Advance through characters for this word
        let endCharIndex = charIndex;
        for (let i = charIndex; i < alignment.characters.length && i < charIndex + word.length; i++) {
          endCharIndex = i;
        }
        
        const endChar = alignment.characters[endCharIndex];
        wordEndTime = endChar ? (endChar.start_time_ms + endChar.duration_ms) : wordStartTime + 200;
        
        charIndex = endCharIndex + 1;
      } else {
        // Fallback timing if we run out of character data
        const estimatedDuration = word.length * 100; // 100ms per character
        wordStartTime = wordTimings.length > 0 ? wordTimings[wordTimings.length - 1].endTime : 0;
        wordEndTime = wordStartTime + estimatedDuration;
      }
      
      wordTimings.push({
        word: word.trim(),
        startTime: wordStartTime,
        endTime: wordEndTime
      });
      
      textIndex = wordEndIndex;
    }
    
    console.log(`📍 Word timing conversion: ${words.length} words → ${wordTimings.length} timings`);
    return wordTimings;
  }

  /**
   * Generate natural speech for Charlotte's conversation (with timing)
   */
  static async generateConversationSpeech(text: string, voiceId?: string): Promise<SynchronizedTTSResult> {
    return this.generateSynchronizedSpeech(text, 'conversation', voiceId);
  }

  /**
   * Generate phonetic speech for learning content (with timing)
   */
  static async generateLearningSpeech(text: string, voiceId?: string): Promise<SynchronizedTTSResult> {
    return this.generateSynchronizedSpeech(text, 'learning', voiceId);
  }
}