import { supabase } from "@/integrations/supabase/client";
import { contextualPronunciation } from "./contextualPronunciation";

export type OpenAIVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

export interface TTSOptions {
  voice?: OpenAIVoice;
  speed?: number; // 0.25 to 4.0
}

export class OpenAITTSService {
  private audioCache = new Map<string, string>();
  private currentAudio: HTMLAudioElement | null = null;

  async speakText(text: string, options: TTSOptions = {}): Promise<void> {
    try {
      // Process text for better pronunciation
      const processedText = contextualPronunciation.processTextForPronunciation(text, true);
      const cacheKey = `${processedText}-${options.voice || 'alloy'}-${options.speed || 1.0}`;
      
      let audioUrl = this.audioCache.get(cacheKey);
      
      if (!audioUrl) {
        const { data, error } = await supabase.functions.invoke('openai-tts', {
          body: {
            text: processedText,
        voice: options.voice || 'nova',
        speed: options.speed || 0.7
          }
        });

        if (error) throw new Error(error.message);
        if (!data?.audioContent) throw new Error('No audio data received');

        // Convert base64 to blob
        const audioBuffer = Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0));
        const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });

        audioUrl = URL.createObjectURL(audioBlob);
        this.audioCache.set(cacheKey, audioUrl);
      }

      // Stop any current audio
      this.stopCurrentAudio();

      // Play new audio
      this.currentAudio = new Audio(audioUrl);
      this.currentAudio.preload = 'auto';
      
      return new Promise((resolve, reject) => {
        if (this.currentAudio) {
          this.currentAudio.onended = () => resolve();
          this.currentAudio.onerror = () => reject(new Error('Audio playback failed'));
          this.currentAudio.play().catch(reject);
        }
      });

    } catch (error) {
      console.error('TTS Error:', error);
      throw error;
    }
  }

  stopCurrentAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  isPlaying(): boolean {
    return this.currentAudio && !this.currentAudio.paused;
  }

  clearCache(): void {
    this.audioCache.forEach(url => URL.revokeObjectURL(url));
    this.audioCache.clear();
  }
}