import { supabase } from "@/integrations/supabase/client";
import { contextualPronunciation } from "./contextualPronunciation";

const __TTS_DEBUG__ = (globalThis as any).__TTS_DEBUG__ === true;

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
  private webSpeechSpeaking = false;

  constructor(config: Partial<TTSServiceConfig> = {}) {
    this.config = {
      preferredProvider: 'elevenlabs',
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
      // Generate deterministic cache key
      const normalizedVoice = options.voice || 'default';
      const normalizedSpeed = (options.speed || 1.0).toFixed(2);
      const cacheKey = `${processedText}-${provider}-${normalizedVoice}-${normalizedSpeed}`;

      if (__TTS_DEBUG__) {
        console.debug('[UnifiedTTS] speakText', {
          text: processedText,
          provider,
          cacheKey,
          cacheSize: this.audioCache.size,
          cacheEnabled: this.config.cacheEnabled,
        });
      }
      
      let audioUrl = this.config.cacheEnabled ? this.audioCache.get(cacheKey) : null;
      if (__TTS_DEBUG__) {
        console.debug('[UnifiedTTS] cache lookup', { hit: !!audioUrl });
      }
      
      if (!audioUrl) {
        if (__TTS_DEBUG__) console.debug('[UnifiedTTS] generating audio', { provider });
        audioUrl = await this.generateAudio(processedText, provider, options);
        if (this.config.cacheEnabled && audioUrl) {
          this.audioCache.set(cacheKey, audioUrl);
          if (__TTS_DEBUG__) console.debug('[UnifiedTTS] cache set', { cacheKey, cacheSize: this.audioCache.size });
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
    if (__TTS_DEBUG__) console.debug('[UnifiedTTS] OpenAI TTS invoke', { voice: this.mapToOpenAIVoice(options.voice, options.userInfo), speed: options.speed || 0.7 });
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
    const url = URL.createObjectURL(audioBlob);
    if (__TTS_DEBUG__) console.debug('[UnifiedTTS] OpenAI TTS URL created', { urlPrefix: url.slice(0, 16) });
    return url;
  }


  private async generateElevenLabsAudio(text: string, options: UnifiedTTSOptions): Promise<string> {
    if (__TTS_DEBUG__) console.debug('[UnifiedTTS] ElevenLabs TTS invoke', { voice: this.mapToElevenLabsVoice(options.voice, options.userInfo) });
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
    const url = URL.createObjectURL(audioBlob);
    if (__TTS_DEBUG__) console.debug('[UnifiedTTS] ElevenLabs TTS URL created', { urlPrefix: url.slice(0, 16) });
    return url;
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
    // Unified default voice across the app: Charlotte (friendly, clear)
    // ElevenLabs Voice ID for Charlotte
    return 'XB0fDUnXU5powFXDhCwa';
  }

  private async playAudio(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.stopCurrentAudio();
      if (__TTS_DEBUG__) console.debug('[UnifiedTTS] playAudio start', { audioUrl: audioUrl.slice(0, 16) });
      
      this.currentAudio = new Audio(audioUrl);
      this.currentAudio.preload = 'auto';
      
      this.currentAudio.onended = () => {
        if (__TTS_DEBUG__) console.debug('[UnifiedTTS] playAudio ended');
        resolve();
      };
      
      this.currentAudio.onerror = () => {
        if (__TTS_DEBUG__) console.debug('[UnifiedTTS] playAudio error');
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

      // Track speaking state to make isPlaying deterministic
      utterance.onstart = () => { this.webSpeechSpeaking = true; };
      utterance.onend = () => { this.webSpeechSpeaking = false; };
      utterance.onerror = () => { this.webSpeechSpeaking = false; };
      
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
    
    // Stop web speech synthesis and ensure bidirectional state synchronization
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { 
        speechSynthesis.cancel();
        // Force synchronization of mock state for testing
        if ((speechSynthesis as any).speaking !== undefined) {
          (speechSynthesis as any).speaking = false;
        }
      } catch (error) {
        // Ignore errors during cleanup
      } finally { 
        this.webSpeechSpeaking = false; 
      }
    }
  }

  isPlaying(): boolean {
    // Check audio element first
    if (this.currentAudio) {
      return !this.currentAudio.paused;
    }
    
    // Check web speech synthesis state - prioritize internal tracking
    const webSpeechPlaying = this.webSpeechSpeaking || 
      (typeof window !== 'undefined' && 'speechSynthesis' in window && Boolean((speechSynthesis as any).speaking));
    
    if (__TTS_DEBUG__) {
      console.debug('[UnifiedTTS] isPlaying check', {
        hasAudio: !!this.currentAudio,
        paused: this.currentAudio ? this.currentAudio.paused : undefined,
        webSpeechSpeaking: this.webSpeechSpeaking,
        synthSpeaking: typeof window !== 'undefined' && 'speechSynthesis' in window ? (speechSynthesis as any).speaking : undefined,
        result: webSpeechPlaying
      });
    }
    
    return webSpeechPlaying;
  }


  clearCache(): void {
    this.audioCache.forEach(url => URL.revokeObjectURL(url));
    this.audioCache.clear();
    if (__TTS_DEBUG__) console.debug('[UnifiedTTS] cache cleared');
  }

  getCacheSize(): number {
    return this.audioCache.size;
  }

  // Testing utility method to reset all internal state
  _resetForTesting(): void {
    this.stopCurrentAudio();
    this.clearCache();
    this.audioInitialized = false;
    this.webSpeechSpeaking = false;
  }


  // Static factory methods for common configurations
  static createForChildren(config?: Partial<TTSServiceConfig>): UnifiedTTSService {
    return new UnifiedTTSService({
      preferredProvider: 'elevenlabs',
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