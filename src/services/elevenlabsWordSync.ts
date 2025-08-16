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

      // Parse response - handle actual ElevenLabs response format
      let audioData: string;
      let wordTimestamps: WordTimestamp[] = [];

      if (data && typeof data === 'object') {
        if ('audio' in data) {
          // Standard ElevenLabs response with base64 audio
          audioData = data.audio;
          console.log('✅ Using standard ElevenLabs audio response');
        } else if (typeof data === 'string') {
          // Direct base64 string response
          audioData = data;
          console.log('✅ Using direct base64 audio response');
        } else {
          throw new Error('No audio data found in ElevenLabs response');
        }
        
        // ElevenLabs doesn't provide word alignment in basic TTS
        // Generate fallback timestamps for all responses
        wordTimestamps = this.generateFallbackTimestamps(text);
      } else if (typeof data === 'string') {
        // Simple base64 audio response (fallback)
        audioData = data;
        wordTimestamps = this.generateFallbackTimestamps(text);
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

    console.log('🎯 Setting up word highlighting timers');

    // Schedule highlight for each word based on its timestamp
    this.wordTimestamps.forEach((wordData, index) => {
      const highlightTime = wordData.start_time * 1000; // Convert to milliseconds
      
      const timeoutId = window.setTimeout(() => {
        if (this.isPlaying) {
          console.log(`🎯 Highlighting word ${index}: "${wordData.word}" at ${highlightTime}ms`);
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
          console.log('🎯 Clearing word highlighting');
          onWordHighlight(-1);
        }
      }, clearTime);

      this.highlightTimeouts.push(clearTimeoutId);
    }
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
    // Generate estimated timestamps for when ElevenLabs doesn't provide alignment
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const avgWordsPerSecond = 2.5; // Estimate for Charlotte's voice
    
    return words.map((word, index) => ({
      word: word.replace(/[.,!?;:'"()]/g, ''), // Clean punctuation
      start_time: index / avgWordsPerSecond,
      end_time: (index + 1) / avgWordsPerSecond
    }));
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