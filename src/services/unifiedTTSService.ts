import { supabase } from "@/integrations/supabase/client";
import { contextualPronunciation } from "./contextualPronunciation";

export type TTSVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
export type TTSProvider = 'openai' | 'elevenlabs' | 'browser';

export interface UnifiedTTSOptions {
  voice?: TTSVoice | string;
  speed?: number;
  provider?: TTSProvider;
  userInfo?: any;
}

export interface TTSServiceConfig {
  preferredProvider: TTSProvider;
  fallbackToWebSpeech: boolean;
  mobileOptimized: boolean;
  cacheEnabled: boolean;
}

export class UnifiedTTSService {
  private audioCache = new Map<string, string>();
  private currentAudio: HTMLAudioElement | null = null;
  private config: TTSServiceConfig;
  private audioInitialized = false;

  constructor(config: Partial<TTSServiceConfig> = {}) {
    this.config = {
      preferredProvider: 'openai',
      fallbackToWebSpeech: true,
      mobileOptimized: true,
      cacheEnabled: true,
      ...config
    };
  }

  async speakText(text: string, options: UnifiedTTSOptions = {}): Promise<void> {
    try {
      // Initialize mobile audio if needed
      if (this.config.mobileOptimized && !this.audioInitialized) {
        await this.initializeMobileAudio();
      }

      // Process text for better pronunciation
      const processedText = contextualPronunciation.processTextForPronunciation(text, true);
      const provider = options.provider || this.config.preferredProvider;
      const cacheKey = `${processedText}-${provider}-${options.voice || 'default'}-${options.speed || 1.0}`;
      
      let audioUrl = this.config.cacheEnabled ? this.audioCache.get(cacheKey) : null;
      
      if (!audioUrl) {
        audioUrl = await this.generateAudio(processedText, provider, options);
        if (this.config.cacheEnabled && audioUrl) {
          this.audioCache.set(cacheKey, audioUrl);
        }
      }

      if (audioUrl) {
        await this.playAudio(audioUrl);
      } else if (this.config.fallbackToWebSpeech) {
        this.fallbackToWebSpeech(processedText, options);
      }

    } catch (error) {
      console.error('Unified TTS Error:', error);
      if (this.config.fallbackToWebSpeech) {
        this.fallbackToWebSpeech(text, options);
      } else {
        throw error;
      }
    }
  }

  async explainWord(word: string, userLevel?: 'easy' | 'medium' | 'hard', userLanguage?: string): Promise<void> {
    try {
      const { data, error } = await supabase.functions.invoke('word-dictionary', {
        body: {
          word,
          userLevel: userLevel || 'easy',
          userLanguage: userLanguage || 'en'
        }
      });

      if (error) throw new Error(error.message);
      
      if (data?.explanation) {
        await this.speakText(data.explanation, { speed: 0.8 });
      }
    } catch (error) {
      console.error('Word explanation error:', error);
      // Fallback: just pronounce the word
      await this.speakText(word);
    }
  }

  private async generateAudio(text: string, provider: TTSProvider, options: UnifiedTTSOptions): Promise<string | null> {
    switch (provider) {
      case 'openai':
        return this.generateOpenAIAudio(text, options);
      case 'elevenlabs':
        return this.generateElevenLabsAudio(text, options);
      case 'browser':
        this.fallbackToWebSpeech(text, options);
        return null;
      default:
        throw new Error(`Unknown TTS provider: ${provider}`);
    }
  }

  private async generateOpenAIAudio(text: string, options: UnifiedTTSOptions): Promise<string> {
    const { data, error } = await supabase.functions.invoke('openai-tts', {
      body: {
        text,
        voice: this.mapToOpenAIVoice(options.voice, options.userInfo),
        speed: options.speed || 0.7
      }
    });

    if (error) throw new Error(error.message);
    if (!data?.audioContent) throw new Error('No audio data received from OpenAI');

    // Convert base64 to blob
    const audioBuffer = Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0));
    const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    return URL.createObjectURL(audioBlob);
  }

  private async generateElevenLabsAudio(text: string, options: UnifiedTTSOptions): Promise<string> {
    const { data, error } = await supabase.functions.invoke('elevenlabs-tts', {
      body: {
        text,
        voice: this.mapToElevenLabsVoice(options.voice, options.userInfo),
        model: "eleven_multilingual_v2"
      }
    });

    if (error) throw new Error(error.message);
    if (!data) throw new Error('No audio data received from ElevenLabs');

    // Convert array buffer to blob
    const audioBlob = new Blob([new Uint8Array(data)], { type: 'audio/mpeg' });
    return URL.createObjectURL(audioBlob);
  }

  private mapToOpenAIVoice(voice?: string | TTSVoice, userInfo?: any): TTSVoice {
    if (voice && ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'].includes(voice)) {
      return voice as TTSVoice;
    }

    // Intelligent voice selection based on user info
    if (userInfo) {
      const age = userInfo.age || 8;
      const gender = userInfo.gender;
      
      if (age <= 10) {
        return gender === 'girl' ? 'nova' : 'onyx';
      } else if (age <= 15) {
        return gender === 'girl' ? 'shimmer' : 'echo';
      }
    }

    return 'nova'; // Default child-friendly voice
  }

  private mapToElevenLabsVoice(voice?: string, userInfo?: any): string {
    // Map to ElevenLabs voice IDs based on user preferences
    const voiceMap: Record<string, string> = {
      'child-friendly': 'pNInz6obpgDQGcFmaJgB', // Adam (child-friendly)
      'young-girl': 'EXAVITQu4vr4xnSDxMaL', // Bella (young female)
      'young-boy': 'VR6AewLTigWG4xSOukaG', // Josh (young male)
      'default': 'pNInz6obpgDQGcFmaJgB'
    };

    if (voice && voiceMap[voice]) {
      return voiceMap[voice];
    }

    // Select based on user info
    if (userInfo?.gender === 'girl') {
      return voiceMap['young-girl'];
    } else if (userInfo?.gender === 'boy') {
      return voiceMap['young-boy'];
    }

    return voiceMap['default'];
  }

  private async playAudio(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.stopCurrentAudio();
      
      this.currentAudio = new Audio(audioUrl);
      this.currentAudio.preload = 'auto';
      
      this.currentAudio.onended = () => {
        resolve();
      };
      
      this.currentAudio.onerror = () => {
        reject(new Error('Audio playback failed'));
      };
      
      this.currentAudio.play().catch(reject);
    });
  }

  private fallbackToWebSpeech(text: string, options: UnifiedTTSOptions): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.speed || 0.8;
      utterance.pitch = 1.1; // Slightly higher pitch for children
      
      // Try to find a child-friendly voice
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('child') ||
        voice.name.toLowerCase().includes('kid') ||
        voice.name.toLowerCase().includes('young')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      speechSynthesis.speak(utterance);
    }
  }

  private async initializeMobileAudio(): Promise<void> {
    if (typeof window !== 'undefined' && !this.audioInitialized) {
      try {
        // Create a silent audio context to initialize audio on mobile
        const silentAudio = new Audio();
        silentAudio.src = 'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ4AAAAAAAAAAAAA';
        silentAudio.preload = 'auto';
        silentAudio.volume = 0;
        
        await silentAudio.play();
        silentAudio.pause();
        
        this.audioInitialized = true;
        console.log('Mobile audio initialized successfully');
      } catch (error) {
        console.warn('Failed to initialize mobile audio:', error);
        // Continue without initialization
      }
    }
  }

  stopCurrentAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    
    // Also stop web speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }

  isPlaying(): boolean {
    return (this.currentAudio && !this.currentAudio.paused) || 
           (typeof window !== 'undefined' && speechSynthesis.speaking);
  }

  clearCache(): void {
    this.audioCache.forEach(url => URL.revokeObjectURL(url));
    this.audioCache.clear();
  }

  // Static factory methods for common configurations
  static createForChildren(config?: Partial<TTSServiceConfig>): UnifiedTTSService {
    return new UnifiedTTSService({
      preferredProvider: 'openai',
      fallbackToWebSpeech: true,
      mobileOptimized: true,
      cacheEnabled: true,
      ...config
    });
  }

  static createForPremium(config?: Partial<TTSServiceConfig>): UnifiedTTSService {
    return new UnifiedTTSService({
      preferredProvider: 'elevenlabs',
      fallbackToWebSpeech: true,
      mobileOptimized: true,
      cacheEnabled: true,
      ...config
    });
  }
}