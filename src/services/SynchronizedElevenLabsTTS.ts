import { supabase } from '@/integrations/supabase/client';
import { DebugLogger } from '@/services/DebugLogger';

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
    DebugLogger.log('audio', `🔊 Synchronized TTS: "${text}" [Context: ${context}]`);

    // Add timeout and network check
    const startTime = Date.now();
    let retries = 0;
    const maxRetries = 2;
    const maxTimeoutMs = 8000;

    while (retries <= maxRetries) {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('TTS request timeout')), maxTimeoutMs - (Date.now() - startTime));
      });

      try {
        DebugLogger.log('audio', `TTS request attempt ${retries + 1}/${maxRetries + 1}`, {
          text: text.substring(0, 50) + '...',
          context,
          voiceId,
          timeoutMs: maxTimeoutMs - (Date.now() - startTime)
        });

        const { data, error } = await Promise.race([
          supabase.functions.invoke('elevenlabs-tts-smart', {
            body: {
              text,
              voice_id: voiceId,
              context,
              useTimestamps: true
            }
          }),
          timeoutPromise
        ]);

        DebugLogger.log('audio', 'ElevenLabs TTS Response received', {
          hasData: !!data,
          error: error?.message,
          dataKeys: data ? Object.keys(data) : [],
          hasAudioContent: !!(data?.audioContent),
          hasAudioBase64: !!(data?.audio_base64),
          responseSize: data ? JSON.stringify(data).length : 0
        });

        if (error) {
          DebugLogger.error('audio', '❌ Synchronized TTS API Error', {
            error: error.message,
            attempt: retries + 1,
            context,
            text: text.substring(0, 100)
          });
          
          if (retries < maxRetries) {
            retries++;
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
            continue;
          }
          throw new Error(`Synchronized TTS failed after ${maxRetries + 1} attempts: ${error.message}`);
        }

        // Handle both response formats: audioContent (old) and audio_base64 (new)
        const audioData = data?.audioContent || data?.audio_base64;
        if (!audioData) {
          const errorMsg = `No audio content received. Response structure: ${JSON.stringify(data)}`;
          DebugLogger.error('audio', errorMsg, {
            dataKeys: data ? Object.keys(data) : [],
            dataStructure: data,
            attempt: retries + 1
          });
          
          if (retries < maxRetries) {
            retries++;
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
            continue;
          }
          throw new Error(errorMsg);
        }

        DebugLogger.log('audio', '✅ Audio content received successfully', {
          audioDataLength: audioData.length,
          attempt: retries + 1,
          totalTime: Date.now() - startTime
        });

        // Convert base64 audio to ArrayBuffer
        const binaryString = atob(audioData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Convert character-level timing to word-level timing
        const wordTimings = data.alignment 
          ? this.convertCharacterTimingsToWords(text, data.alignment)
          : this.generateFallbackWordTimings(text.split(/(\s+)/).filter(word => word.trim().length > 0));

        DebugLogger.log('audio', `✅ Synchronized TTS Success: ${bytes.byteLength} bytes, ${wordTimings.length} word timings`);
        
        return {
          audioBuffer: bytes.buffer,
          wordTimings
        };

      } catch (timeoutError) {
        DebugLogger.error('audio', `TTS request timeout/error on attempt ${retries + 1}`, {
          error: timeoutError.message,
          timeElapsed: Date.now() - startTime,
          attempt: retries + 1
        });
        
        if (retries < maxRetries && (Date.now() - startTime) < maxTimeoutMs * 0.8) {
          retries++;
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
          continue;
        }
        
        // Final fallback - browser speech synthesis
        DebugLogger.warn('audio', 'All TTS attempts failed, falling back to browser speech');
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.8;
          utterance.pitch = 1.0;
          utterance.volume = 0.9;
          window.speechSynthesis.speak(utterance);
        }
        
        throw timeoutError;
      }
    }

     throw new Error('Maximum retries exceeded');
  }

  /**
   * Convert ElevenLabs character-level timing to word-level timing with comprehensive debugging and fallbacks
   */
  private static convertCharacterTimingsToWords(
    text: string, 
    alignment: TimestampData
  ): Array<{ word: string; startTime: number; endTime: number }> {
    DebugLogger.log('audio', '🔧 Converting character timings to word timings', {
      textLength: text.length,
      charactersCount: alignment.characters?.length || 0,
      textPreview: text.substring(0, 50) + '...',
      alignmentStructure: alignment
    });
    
    // Better word tokenization that handles punctuation
    const words = text.split(/(\s+)/).filter(word => word.trim().length > 0);
    const wordTimings: Array<{ word: string; startTime: number; endTime: number }> = [];
    
    DebugLogger.log('audio', '📝 Tokenized words', { 
      wordsPreview: words.slice(0, 10), 
      totalWords: words.length 
    });
    
    // Check if we have valid timing data
    if (!alignment || !alignment.characters || alignment.characters.length === 0) {
      DebugLogger.warn('audio', '⚠️ No character timing data available, using estimated timing');
      return this.generateFallbackWordTimings(words);
    }
    
    // Debug first few character entries to understand structure
    DebugLogger.log('audio', '🔍 First 3 character timing entries', alignment.characters.slice(0, 3));
    
    let textPosition = 0;
    
    for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
      const word = words[wordIndex];
      
      // Find the exact position of this word in the original text
      const wordStartPos = text.indexOf(word, textPosition);
      const wordEndPos = wordStartPos + word.length;
      
      if (wordStartPos === -1) {
        DebugLogger.warn('audio', `⚠️ Could not find word "${word}" in text at position ${textPosition}`);
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
            DebugLogger.log('audio', `🎯 Found start timing for "${word}" at char ${charPos}: ${wordStartTime}ms`);
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
        
        DebugLogger.log('audio', `⚠️ Using fallback timing for "${word}"`, {
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
      
      DebugLogger.log('audio', `📍 Word ${wordIndex}: "${word}" → ${wordStartTime}ms - ${wordEndTime}ms (${wordEndTime - wordStartTime}ms)`);
      
      textPosition = wordEndPos;
    }
    
    DebugLogger.log('audio', `✅ Word timing conversion complete: ${words.length} words → ${wordTimings.length} timings`, {
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
    DebugLogger.log('audio', '🔄 Generating natural fallback word timings', { wordCount: words.length });
    
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
    
    DebugLogger.log('audio', '✅ Natural fallback timing generated', { wordTimingsCount: wordTimings.length });
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