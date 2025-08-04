// Enhanced Audio Service
// Unified service for all audio functionality including TTS, speed control, highlighting, and premium features

import { defaultAudioConfig, voiceCommands, characterVoices, phoneticSettings } from '@/config/audioConfig';
import type { AudioSettings } from '@/config/audioConfig';
import type { UserInfo } from '@/types';

export interface AudioPlaybackOptions {
  text: string;
  difficulty: 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';
  userInfo: UserInfo;
  isPremium?: boolean;
  enableHighlighting?: boolean;
  onWordHighlight?: (wordIndex: number) => void;
  currentPage?: number;
  characterType?: 'narrator' | 'child' | 'adult' | 'elderly' | 'animal';
}

export interface PhoneticsOptions {
  word: string;
  userInfo: UserInfo;
  showSyllables?: boolean;
  playbackSpeed?: number;
}

export interface VoiceCommandResult {
  recognized: boolean;
  command?: string;
  action?: () => void;
  parameters?: string[];
}

export class EnhancedAudioService {
  private config: AudioSettings;
  private currentAudio: HTMLAudioElement | null = null;
  private isPlaying = false;
  private audioCache = new Map<string, string>();
  private highlightTimeout: NodeJS.Timeout | null = null;
  private speechRecognition: any = null;
  private playedPages = new Set<number>();

  constructor(customConfig?: Partial<AudioSettings>) {
    this.config = { ...defaultAudioConfig, ...customConfig };
    this.initializeSpeechRecognition();
  }

  // === Core Audio Playback Methods ===

  async playText(options: AudioPlaybackOptions): Promise<void> {
    const {
      text,
      difficulty,
      userInfo,
      isPremium = false,
      enableHighlighting = true,
      onWordHighlight,
      currentPage = 0,
      characterType = 'narrator'
    } = options;

    // Check free user limits
    if (!isPremium && this.playedPages.has(currentPage)) {
      throw new Error('Page already played - upgrade for unlimited audio');
    }

    // Get adaptive speed based on difficulty
    const speed = this.getSpeedForDifficulty(difficulty);
    
    // Get appropriate voice
    const voice = this.getVoiceForUser(userInfo, characterType, isPremium);
    
    // Prepare text with length limits
    const maxLength = isPremium ? this.config.quality.maxTextLength.premium : this.config.quality.maxTextLength.free;
    const processedText = text.slice(0, maxLength);

    try {
      // Stop any currently playing audio
      this.stopAudio();

      // Check cache first
      const cacheKey = this.getCacheKey(processedText, voice, speed);
      let audioUrl = this.audioCache.get(cacheKey);

      if (!audioUrl) {
        // Generate new audio
        audioUrl = await this.generateAudio(processedText, voice, userInfo, isPremium);
        
        // Cache for future use
        if (this.config.quality.cacheAudio) {
          this.audioCache.set(cacheKey, audioUrl);
        }
      }

      // Create and configure audio element
      this.currentAudio = new Audio(audioUrl);
      this.currentAudio.playbackRate = speed;

      // Set up event handlers
      this.currentAudio.onended = () => {
        this.isPlaying = false;
        this.clearHighlighting();
      };

      this.currentAudio.onerror = () => {
        this.isPlaying = false;
        this.fallbackToBrowserSpeech(processedText, speed);
      };

      // Start playback
      await this.currentAudio.play();
      this.isPlaying = true;

      // Mark page as played for free users
      if (!isPremium) {
        this.playedPages.add(currentPage);
      }

      // Start word highlighting if enabled
      if (enableHighlighting && this.shouldEnableHighlighting(difficulty) && onWordHighlight) {
        this.startWordHighlighting(processedText, speed, onWordHighlight);
      }

    } catch (error) {
      console.error('Enhanced audio playback failed:', error);
      this.fallbackToBrowserSpeech(processedText, speed);
    }
  }

  async playPhoneticBreakdown(options: PhoneticsOptions): Promise<void> {
    const { word, userInfo, showSyllables = true, playbackSpeed = phoneticSettings.playbackSpeed } = options;
    
    if (!showSyllables) {
      // Simple word pronunciation - now available to all users
      return this.playText({
        text: word,
        difficulty: 'easy',
        userInfo,
        isPremium: false, // Phonetics now available to all users
        enableHighlighting: false
      });
    }

    // Break word into syllables and play each with pauses - now available to all users
    const syllables = this.breakIntoSyllables(word);
    
    for (let i = 0; i < syllables.length; i++) {
      await this.playText({
        text: syllables[i],
        difficulty: 'easy',
        userInfo,
        isPremium: false, // Syllable breakdown now available to all users
        enableHighlighting: false
      });

      // Pause between syllables
      if (i < syllables.length - 1) {
        await this.delay(phoneticSettings.pauseBetweenSyllables);
      }
    }
  }

  // === Voice Command Methods (Premium) ===

  startVoiceCommands(): void {
    if (!this.speechRecognition) return;

    this.speechRecognition.start();
  }

  stopVoiceCommands(): void {
    if (!this.speechRecognition) return;

    this.speechRecognition.stop();
  }

  processVoiceCommand(transcript: string): VoiceCommandResult {
    const lowerTranscript = transcript.toLowerCase();

    // Check navigation commands
    for (const [command, action] of Object.entries(voiceCommands.navigation)) {
      if (lowerTranscript.includes(command)) {
        return { recognized: true, command, action };
      }
    }

    // Check reading commands
    for (const [command, action] of Object.entries(voiceCommands.reading)) {
      if (lowerTranscript.includes(command)) {
        return { recognized: true, command, action };
      }
    }

    // Check vocabulary commands (with parameters)
    for (const [pattern, action] of Object.entries(voiceCommands.vocabulary)) {
      const regex = new RegExp(pattern.replace('*', '(.+)'));
      const match = lowerTranscript.match(regex);
      if (match) {
        return { 
          recognized: true, 
          command: pattern, 
          action: () => action(match[1]),
          parameters: [match[1]]
        };
      }
    }

    return { recognized: false };
  }

  // === Audio Control Methods ===

  stopAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    this.isPlaying = false;
    this.clearHighlighting();
  }

  adjustSpeed(newSpeed: number): void {
    if (this.currentAudio) {
      this.currentAudio.playbackRate = newSpeed;
    }
  }

  getPlaybackStatus(): { isPlaying: boolean; currentTime: number; duration: number } {
    return {
      isPlaying: this.isPlaying,
      currentTime: this.currentAudio?.currentTime || 0,
      duration: this.currentAudio?.duration || 0
    };
  }

  // === Private Helper Methods ===

  private getSpeedForDifficulty(difficulty: 'beginner' | 'easy' | 'medium' | 'hard' | 'expert'): number {
    return this.config.speedByDifficulty[difficulty];
  }

  private shouldEnableHighlighting(difficulty: 'beginner' | 'easy' | 'medium' | 'hard' | 'expert'): boolean {
    return this.config.highlighting.enabledForLevels.includes(difficulty);
  }

  private getVoiceForUser(userInfo: UserInfo, characterType: string = 'narrator', isPremium: boolean = false): string {
    // Use character-specific voices for premium users
    if (isPremium && this.config.premium.characterVoiceConsistency) {
      return characterVoices[characterType as keyof typeof characterVoices] || characterVoices.narrator;
    }

    // Standard voice selection logic
    const age = userInfo.age;
    const isGirl = userInfo.avatar?.type === 'girl';
    const isNativeEnglishSpeaker = userInfo.nativeLanguage === 'en';
    
    if (isNativeEnglishSpeaker) {
      if (age <= 8) {
        return isGirl ? "EXAVITQu4vr4xnSDxMaL" : "TX3LPaxmHKxFdv7VOQHJ";
      } else if (age <= 12) {
        return isGirl ? "cgSgspJ2msm6clMCkdW9" : "nPczCjzI2devNBz1zQrb";
      } else {
        return isGirl ? "cgSgspJ2msm6clMCkdW9" : "onwK4e9ZLuTAKqWW03F9";
      }
    } else {
      if (age <= 8) {
        return isGirl ? "EXAVITQu4vr4xnSDxMaL" : "TX3LPaxmHKxFdv7VOQHJ";
      } else if (age <= 12) {
        return isGirl ? "XB0fDUnXU5powFXDhCwa" : "N2lVS1w4EtoT3dr4eOWO";
      } else {
        return isGirl ? "9BWtsMINqrJLrRacOk9x" : "CwhRBWXzGAHq8TQ4Fs17";
      }
    }
  }

  private async generateAudio(text: string, voice: string, userInfo: UserInfo, isPremium: boolean): Promise<string> {
    const isNativeEnglishSpeaker = userInfo.nativeLanguage === 'en';
    const model = isNativeEnglishSpeaker ? "eleven_turbo_v2" : "eleven_multilingual_v2";

    const response = await fetch('https://cpzeuogomaixamrtnnmj.supabase.co/functions/v1/elevenlabs-tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voice,
        model
      })
    });

    if (!response.ok) {
      throw new Error('ElevenLabs TTS failed');
    }

    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
  }

  private fallbackToBrowserSpeech(text: string, speed: number): void {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speed;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = 'en';

      utterance.onend = () => {
        this.isPlaying = false;
        this.clearHighlighting();
      };

      utterance.onerror = () => {
        this.isPlaying = false;
      };

      speechSynthesis.speak(utterance);
      this.isPlaying = true;
    }
  }

  private startWordHighlighting(text: string, speed: number, onWordHighlight: (wordIndex: number) => void): void {
    const words = text.split(/(\s+)/).filter(word => word.trim().length > 0);
    // Improved timing: estimate 150 words per minute at normal speed, adjusted by speed
    const baseWordsPerMinute = 150;
    const wordsPerSecond = (baseWordsPerMinute * speed) / 60;
    const wordInterval = 1000 / wordsPerSecond;

    let wordIndex = 0;

    const highlightNext = () => {
      if (wordIndex < words.length && this.isPlaying) {
        onWordHighlight(wordIndex);
        wordIndex++;
        this.highlightTimeout = setTimeout(highlightNext, wordInterval);
      }
    };

    highlightNext();
  }

  private clearHighlighting(): void {
    if (this.highlightTimeout) {
      clearTimeout(this.highlightTimeout);
      this.highlightTimeout = null;
    }
  }

  private breakIntoSyllables(word: string): string[] {
    // Simple syllable breaking - can be enhanced with more sophisticated logic
    const vowels = 'aeiouyAEIOUY';
    const syllables: string[] = [];
    let currentSyllable = '';
    
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      currentSyllable += char;
      
      if (vowels.includes(char) && i < word.length - 1) {
        // Look ahead for consonant pattern
        let nextVowelIndex = -1;
        for (let j = i + 1; j < word.length; j++) {
          if (vowels.includes(word[j])) {
            nextVowelIndex = j;
            break;
          }
        }
        
        if (nextVowelIndex > i + 1) {
          // Add one consonant to current syllable
          currentSyllable += word[i + 1];
          syllables.push(currentSyllable);
          currentSyllable = '';
          i++; // Skip the consonant we just added
        }
      }
    }
    
    if (currentSyllable) {
      syllables.push(currentSyllable);
    }
    
    return syllables.length > 0 ? syllables : [word];
  }

  private getCacheKey(text: string, voice: string, speed: number): string {
    return `${text.slice(0, 50)}_${voice}_${speed}`;
  }

  private initializeSpeechRecognition(): void {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      this.speechRecognition = new SpeechRecognition();
      this.speechRecognition.continuous = true;
      this.speechRecognition.interimResults = false;
      this.speechRecognition.lang = 'en-US';

      this.speechRecognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        const result = this.processVoiceCommand(transcript);
        
        if (result.recognized && result.action) {
          result.action();
        }
      };
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // === Public Utility Methods ===

  clearCache(): void {
    this.audioCache.clear();
  }

  resetPlayedPages(): void {
    this.playedPages.clear();
  }

  updateConfig(newConfig: Partial<AudioSettings>): void {
    this.config = { ...this.config, ...newConfig };
  }
}