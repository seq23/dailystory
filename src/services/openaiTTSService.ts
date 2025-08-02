// Supabase client will be available globally in edge functions
declare const supabase: any;

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
      const cacheKey = `${text}-${options.voice || 'alloy'}-${options.speed || 1.0}`;
      
      let audioUrl = this.audioCache.get(cacheKey);
      
      if (!audioUrl) {
        const response = await fetch('https://cpzeuogomaixamrtnnmj.supabase.co/functions/v1/openai-tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: text.replace(/[.,!?;:'"()]/g, ''), // Clean text
            voice: options.voice || 'nova', // Use more natural voice
            speed: options.speed || 1.0
          })
        });

        if (!response.ok) throw new Error('TTS request failed');
        const data = await response.arrayBuffer();
        // Convert response to blob URL
        const blob = new Blob([data], { type: 'audio/mpeg' });
        audioUrl = URL.createObjectURL(blob);
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