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
   * Convert ElevenLabs character-level timing to word-level timing with improved debugging
   */
  private static convertCharacterTimingsToWords(
    text: string, 
    alignment: TimestampData
  ): Array<{ word: string; startTime: number; endTime: number }> {
    console.log('🔧 Converting character timings to word timings:', {
      textLength: text.length,
      charactersCount: alignment.characters.length,
      textPreview: text.substring(0, 50) + '...'
    });
    
    // Better word tokenization that handles punctuation
    const words = text.split(/(\s+)/).filter(word => word.trim().length > 0);
    const wordTimings: Array<{ word: string; startTime: number; endTime: number }> = [];
    
    console.log('📝 Tokenized words:', words.slice(0, 10), words.length > 10 ? `... (${words.length} total)` : '');
    
    let textPosition = 0;
    let charTimingIndex = 0;
    
    for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
      const word = words[wordIndex];
      
      // Find the exact position of this word in the original text
      const wordStartPos = text.indexOf(word, textPosition);
      const wordEndPos = wordStartPos + word.length;
      
      // Find corresponding character timings
      let wordStartTime = 0;
      let wordEndTime = 0;
      let foundTimingData = false;
      
      // Debug character timing data structure
      console.log('🔍 Character timing data sample:', {
        totalCharacters: alignment.characters.length,
        firstChar: alignment.characters[0],
        wordPos: { start: wordStartPos, end: wordEndPos },
        wordText: word
      });
      
      // Search for character timing that corresponds to this word's position
      for (let i = charTimingIndex; i < alignment.characters.length; i++) {
        const charTiming = alignment.characters[i];
        if (!charTiming) continue;
        
        // The character timing index should match the character position in text
        // Check if this character index is within our word's character range in the text
        if (i >= wordStartPos && i < wordEndPos) {
          if (!foundTimingData) {
            wordStartTime = charTiming.start_time_ms || 0;
            foundTimingData = true;
            console.log(`🎯 Found start timing for "${word}" at char ${i}: ${wordStartTime}ms`);
          }
          wordEndTime = (charTiming.start_time_ms || 0) + (charTiming.duration_ms || 200);
        }
      }
      
      // If we didn't find timing data, use fallback logic
      if (!foundTimingData) {
        const estimatedDuration = Math.max(200, word.length * 120); // 120ms per character, min 200ms
        wordStartTime = wordTimings.length > 0 ? wordTimings[wordTimings.length - 1].endTime + 50 : 0;
        wordEndTime = wordStartTime + estimatedDuration;
        
        console.log(`⚠️ No timing data found for word "${word}" at position ${wordStartPos}, using fallback:`, {
          startTime: wordStartTime,
          endTime: wordEndTime,
          duration: estimatedDuration
        });
      }
      
      // Ensure no overlapping times and add small gap between words
      if (wordTimings.length > 0) {
        const lastWordEnd = wordTimings[wordTimings.length - 1].endTime;
        if (wordStartTime < lastWordEnd) {
          wordStartTime = lastWordEnd + 10; // 10ms gap
          if (wordEndTime <= wordStartTime) {
            wordEndTime = wordStartTime + Math.max(200, word.length * 120);
          }
        }
      }
      
      const timing = {
        word: word.trim(),
        startTime: wordStartTime,
        endTime: wordEndTime
      };
      
      wordTimings.push(timing);
      
      console.log(`📍 Word ${wordIndex}: "${word}" → ${wordStartTime}ms - ${wordEndTime}ms (${wordEndTime - wordStartTime}ms)`);
      
      textPosition = wordEndPos;
      charTimingIndex = Math.max(charTimingIndex, wordStartPos);
    }
    
    console.log(`✅ Word timing conversion complete: ${words.length} words → ${wordTimings.length} timings`, {
      totalDuration: wordTimings.length > 0 ? wordTimings[wordTimings.length - 1].endTime : 0,
      averageWordDuration: wordTimings.length > 0 ? 
        wordTimings.reduce((sum, t) => sum + (t.endTime - t.startTime), 0) / wordTimings.length : 0
    });
    
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