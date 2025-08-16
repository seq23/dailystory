import { supabase } from '@/integrations/supabase/client';

interface WordTimestamp {
  word: string;
  start_time: number;
  end_time: number;
}

interface ElevenLabsSyncResponse {
  audio: string; // base64 audio
  alignment: {
    characters: Array<{
      character: string;
      start_time: number;
      end_time: number;
    }>;
    words: WordTimestamp[];
  };
}

interface SyncPlayOptions {
  text: string;
  voice?: string;
  model?: string;
  onWordHighlight?: (wordIndex: number) => void;
  onAudioEnd?: () => void;
  signal?: AbortSignal;
}

/**
 * ElevenLabs Word-Level Synchronization Service
 * Uses ElevenLabs' built-in alignment feature for perfect word highlighting
 */
export class ElevenLabsWordSync {
  private audio: HTMLAudioElement | null = null;
  private wordTimestamps: WordTimestamp[] = [];
  private highlightTimeouts: number[] = [];
  private isPlaying = false;

  async playWithWordSync(options: SyncPlayOptions): Promise<void> {
    const { text, voice = 'XB0fDUnXU5powFXDhCwa', model = 'eleven_turbo_v2_5', onWordHighlight, onAudioEnd, signal } = options;

    console.log('🎯 ElevenLabs Word Sync: Starting synchronized playback');

    // Stop any existing playback
    this.stop();

    try {
      // Generate audio with word-level timestamps using ElevenLabs alignment
      console.log('🎤 Requesting ElevenLabs TTS with word alignment...');
      
      const { data, error } = await supabase.functions.invoke('elevenlabs-tts', {
        body: {
          text: text.slice(0, 3000), // Limit text length
          voice,
          model,
          enable_logging: true,
          output_format: 'mp3_44100_128',
          apply_text_normalization: 'auto',
          optimize_streaming_latency: 0,
          use_pvc_as_ivc: false
          // Note: Word alignment may not be available in all ElevenLabs models
          // We'll fall back to our manual highlighting if needed
        }
      });

      if (error) {
        throw new Error(`ElevenLabs API error: ${error.message}`);
      }

      if (!data || !data.audio) {
        throw new Error('No audio data received from ElevenLabs');
      }

      // Parse enhanced response with word alignment
      let audioData: string;
      let wordTimestamps: WordTimestamp[] = [];

      if (data && typeof data === 'object') {
        if ('audio' in data) {
          audioData = data.audio;
          
          // Check for enhanced word alignment from our edge function
          if (data.alignment && data.alignment.words && Array.isArray(data.alignment.words)) {
            wordTimestamps = data.alignment.words;
            console.log('✅ Using enhanced word alignment from edge function');
          } else {
            // Fallback to our client-side timing
            wordTimestamps = this.generateFallbackTimestamps(text);
            console.log('⚠️ No word alignment found, using fallback timestamps');
          }
        } else if (typeof data === 'string') {
          audioData = data;
          wordTimestamps = this.generateFallbackTimestamps(text);
          console.log('✅ Using direct base64 audio response with fallback timing');
        } else {
          throw new Error('No audio data found in ElevenLabs response');
        }
      } else if (typeof data === 'string') {
        audioData = data;
        wordTimestamps = this.generateFallbackTimestamps(text);
        console.log('✅ Using string audio response with fallback timing');
      } else {
        throw new Error('Unexpected response format from ElevenLabs');
      }

      this.wordTimestamps = wordTimestamps;

      console.log('✅ Received ElevenLabs audio:', {
        wordCount: this.wordTimestamps.length,
        audioSize: audioData.length,
        hasAlignment: wordTimestamps.length > 0
      });

      // Create audio element and play
      const audioBlob = this.base64ToBlob(audioData, 'audio/mpeg');
      const audioUrl = URL.createObjectURL(audioBlob);

      this.audio = new Audio(audioUrl);
      this.audio.preload = 'auto';

      // Set up word highlighting based on timestamps
      this.setupWordHighlighting(onWordHighlight);

      // Handle audio end
      this.audio.onended = () => {
        console.log('🎵 Audio playback ended');
        this.isPlaying = false;
        onWordHighlight?.(-1); // Clear highlighting
        onAudioEnd?.();
        this.cleanup();
      };

      this.audio.onerror = (e) => {
        console.error('🔥 Audio playback error:', e);
        this.isPlaying = false;
        onAudioEnd?.();
        this.cleanup();
      };

      // Check for abort signal
      if (signal?.aborted) {
        this.cleanup();
        return;
      }

      // Start playback
      await this.audio.play();
      this.isPlaying = true;

      console.log('🎵 Audio playback started with word sync');

    } catch (error) {
      console.error('❌ ElevenLabs Word Sync failed:', error);
      this.cleanup();
      throw error;
    }
  }

  private setupWordHighlighting(onWordHighlight?: (wordIndex: number) => void) {
    if (!onWordHighlight || this.wordTimestamps.length === 0) return;

    console.log('🎯 Setting up word highlighting timers for', this.wordTimestamps.length, 'words');

    // Track audio element's actual time for more precise sync
    const startAudioTime = Date.now();
    let audioStarted = false;
    
    // Wait for audio to actually start playing before scheduling highlights
    const waitForAudioStart = () => {
      if (!this.audio || !this.isPlaying) return;
      
      if (this.audio.currentTime > 0 || audioStarted) {
        audioStarted = true;
        const actualStartTime = Date.now();
        
        // Schedule highlight for each word with adjusted timing
        this.wordTimestamps.forEach((wordData, index) => {
          const highlightTime = wordData.start_time * 1000; // Convert to milliseconds
          
          const timeoutId = window.setTimeout(() => {
            if (this.isPlaying && this.audio) {
              console.log(`🎯 Highlighting word ${index}: "${wordData.word}" at ${this.audio.currentTime.toFixed(2)}s`);
              onWordHighlight(index);
            }
          }, highlightTime);

          this.highlightTimeouts.push(timeoutId);
        });

        // Schedule clearing highlight at the end
        if (this.wordTimestamps.length > 0) {
          const lastWord = this.wordTimestamps[this.wordTimestamps.length - 1];
          const clearTime = lastWord.end_time * 1000;
          
          const clearTimeoutId = window.setTimeout(() => {
            if (this.isPlaying) {
              console.log('🎯 Clearing word highlighting at', this.audio?.currentTime.toFixed(2) + 's');
              onWordHighlight(-1);
            }
          }, clearTime);

          this.highlightTimeouts.push(clearTimeoutId);
        }
      } else {
        // Check again in 10ms for more precise timing
        setTimeout(waitForAudioStart, 10);
      }
    };

    // Start checking for audio start
    waitForAudioStart();
  }

  stop() {
    console.log('🛑 ElevenLabs Word Sync: Stopping');
    
    this.isPlaying = false;
    
    // Clear all highlight timeouts
    this.highlightTimeouts.forEach(id => clearTimeout(id));
    this.highlightTimeouts = [];
    
    // Stop audio
    if (this.audio) {
      try {
        this.audio.pause();
        this.audio.currentTime = 0;
      } catch {}
    }
    
    this.cleanup();
  }

  private cleanup() {
    if (this.audio) {
      const audioUrl = this.audio.src;
      if (audioUrl && audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
      }
      this.audio = null;
    }
    
    this.wordTimestamps = [];
  }

  private base64ToBlob(base64: string, mimeType: string): Blob {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes], { type: mimeType });
  }

  private generateFallbackTimestamps(text: string): WordTimestamp[] {
    // Enhanced fallback timing calibrated for Charlotte's voice (XB0fDUnXU5powFXDhCwa)
    const words = text.split(/\s+/).filter(word => word.length > 0);
    
    // Calibrated for Charlotte's actual speech patterns
    const wordsPerSecond = 2.3;
    const baseDelay = 0.15; // Audio processing startup time
    const punctuationDelay = 0.25; // Pause after punctuation
    const sentenceEndDelay = 0.4; // Longer pause after sentences
    
    let currentTime = baseDelay;
    
    return words.map((word, index) => {
      const cleanWord = word.replace(/[.,!?;:'"()]/g, '');
      const punctuation = word.match(/[.,!?;:'"()]/g);
      
      // Dynamic word duration based on complexity
      const syllableCount = Math.max(1, cleanWord.length / 3); // Rough syllable estimation
      const wordDuration = Math.max(0.12, syllableCount * 0.15 + 0.08);
      
      const startTime = currentTime;
      const endTime = startTime + wordDuration;
      
      // Calculate pause after word
      let pauseAfter = 1 / wordsPerSecond; // Base gap between words
      
      if (punctuation) {
        if (punctuation.some(p => ['.', '!', '?'].includes(p))) {
          pauseAfter += sentenceEndDelay;
        } else if (punctuation.some(p => [',', ';', ':'].includes(p))) {
          pauseAfter += punctuationDelay;
        }
      }
      
      // Update current time for next word
      currentTime = endTime + pauseAfter;
      
      return {
        word: cleanWord,
        start_time: startTime,
        end_time: endTime
      };
    });
  }

  getStatus() {
    return {
      isPlaying: this.isPlaying,
      wordCount: this.wordTimestamps.length
    };
  }
}

// Singleton instance
export const elevenLabsWordSync = new ElevenLabsWordSync();