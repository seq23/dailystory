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
        useTimestamps: context === 'learning'
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
   * Convert ElevenLabs character-level timing to word-level timing with comprehensive debugging and fallbacks
   */
  private static convertCharacterTimingsToWords(
    text: string, 
    alignment: TimestampData
  ): Array<{ word: string; startTime: number; endTime: number }> {
    console.log('🔧 Converting character timings to word timings:', {
      textLength: text.length,
      charactersCount: alignment.characters?.length || 0,
      textPreview: text.substring(0, 50) + '...',
      alignmentStructure: alignment
    });
    
    // Better word tokenization that handles punctuation
    const words = text.split(/(\s+)/).filter(word => word.trim().length > 0);
    const wordTimings: Array<{ word: string; startTime: number; endTime: number }> = [];
    
    console.log('📝 Tokenized words:', words.slice(0, 10), words.length > 10 ? `... (${words.length} total)` : '');
    
    // Check if we have valid timing data
    if (!alignment || !alignment.characters || alignment.characters.length === 0) {
      console.warn('⚠️ No character timing data available, using estimated timing');
      return this.generateFallbackWordTimings(words);
    }
    
    // Debug first few character entries to understand structure
    console.log('🔍 First 3 character timing entries:', alignment.characters.slice(0, 3));
    
    let textPosition = 0;
    
    for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
      const word = words[wordIndex];
      
      // Find the exact position of this word in the original text
      const wordStartPos = text.indexOf(word, textPosition);
      const wordEndPos = wordStartPos + word.length;
      
      if (wordStartPos === -1) {
        console.warn(`⚠️ Could not find word "${word}" in text at position ${textPosition}`);
        continue;
      }
      
      // Find corresponding character timings
      let wordStartTime: number | undefined;
      let wordEndTime: number | undefined;
      let foundValidTiming = false;
      
      // Map character positions to timings
      for (let charPos = wordStartPos; charPos < wordEndPos; charPos++) {
        // Check if we have timing data for this character position
        const charTiming = alignment.characters[charPos];
        
        if (charTiming && typeof charTiming.start_time_ms === 'number') {
          if (wordStartTime === undefined) {
            wordStartTime = charTiming.start_time_ms;
            foundValidTiming = true;
            console.log(`🎯 Found start timing for "${word}" at char ${charPos}: ${wordStartTime}ms`);
          }
          // Update end time based on this character
          const charEndTime = charTiming.start_time_ms + (charTiming.duration_ms || 200);
          if (wordEndTime === undefined || charEndTime > wordEndTime) {
            wordEndTime = charEndTime;
          }
        }
      }
      
      // If we didn't find valid timing data, use natural fallback timing
      if (!foundValidTiming || wordStartTime === undefined || wordEndTime === undefined) {
        // Balanced timing calculations for natural speech synchronization
        const shortWords = ['a', 'an', 'the', 'is', 'are', 'was', 'were', 'to', 'of', 'and', 'or', 'but', 'in', 'on', 'at', 'by', 'for', 'with', 'from'];
        const isShortWord = shortWords.includes(word.toLowerCase().trim());
        
        // Balanced timing: 100ms per character, min 120ms for short words, 180ms for regular
        const baseDuration = isShortWord ? 120 : Math.max(180, word.length * 100);
        const estimatedDuration = baseDuration;
        
        wordStartTime = wordTimings.length > 0 ? wordTimings[wordTimings.length - 1].endTime + 50 : 0; // Balanced 50ms gap
        wordEndTime = wordStartTime + estimatedDuration;
        
        console.log(`⚠️ Using fallback timing for "${word}":`, {
          startTime: wordStartTime,
          endTime: wordEndTime,
          duration: estimatedDuration
        });
      }
      
      // Ensure no overlapping times and add natural gap between words
      if (wordTimings.length > 0) {
        const lastWordEnd = wordTimings[wordTimings.length - 1].endTime;
        if (wordStartTime < lastWordEnd) {
          wordStartTime = lastWordEnd + 40; // Balanced 40ms gap for clarity
          if (wordEndTime <= wordStartTime) {
            const shortWords = ['a', 'an', 'the', 'is', 'are', 'was', 'were', 'to', 'of', 'and', 'or', 'but', 'in', 'on', 'at', 'by', 'for', 'with', 'from'];
            const isShortWord = shortWords.includes(word.toLowerCase().trim());
            const balancedDuration = isShortWord ? 120 : Math.max(180, word.length * 100);
            wordEndTime = wordStartTime + balancedDuration;
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
    }
    
    console.log(`✅ Word timing conversion complete: ${words.length} words → ${wordTimings.length} timings`, {
      totalDuration: wordTimings.length > 0 ? wordTimings[wordTimings.length - 1].endTime : 0,
      averageWordDuration: wordTimings.length > 0 ? 
        wordTimings.reduce((sum, t) => sum + (t.endTime - t.startTime), 0) / wordTimings.length : 0
    });
    
    return wordTimings;
  }

  /**
   * Generate fallback word timings when ElevenLabs timing data is unavailable
   */
  private static generateFallbackWordTimings(words: string[]): Array<{ word: string; startTime: number; endTime: number }> {
    console.log('🔄 Generating natural fallback word timings for', words.length, 'words');
    
    const wordTimings: Array<{ word: string; startTime: number; endTime: number }> = [];
    let currentTime = 0;
    
    // Common short words with natural timing
    const shortWords = ['a', 'an', 'the', 'is', 'are', 'was', 'were', 'to', 'of', 'and', 'or', 'but', 'in', 'on', 'at', 'by', 'for', 'with', 'from'];
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const isShortWord = shortWords.includes(word.toLowerCase().trim());
      
      // Balanced duration calculation: 100ms per character, realistic minimums
      const baseDuration = isShortWord ? 120 : Math.max(180, word.length * 100); // Balanced 100ms per character
      const estimatedDuration = baseDuration;
      
      wordTimings.push({
        word: word.trim(),
        startTime: currentTime,
        endTime: currentTime + estimatedDuration
      });
      
      currentTime += estimatedDuration + 50; // Balanced 50ms gap between words
    }
    
    console.log('✅ Natural fallback timing generated for', wordTimings.length, 'words');
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