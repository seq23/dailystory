// Enhanced Audio Service
// Unified service for all audio functionality including TTS, speed control, highlighting, and premium features

import { defaultAudioConfig, voiceCommands, characterVoices, phoneticSettings } from '@/config/audioConfig';
import type { AudioSettings } from '@/config/audioConfig';
import { contextualPronunciation } from './contextualPronunciation';
import { phoneticRulesEngine } from './phoneticRulesEngine';
import type { UserInfo } from '@/types';
import { MobileAudioManager } from '@/services/mobileAudioManager';

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
  private mobileAudioManager: MobileAudioManager;
  private currentWordIndex = 0;
  private totalWords = 0;

  constructor(customConfig?: Partial<AudioSettings>) {
    this.config = { ...defaultAudioConfig, ...customConfig };
    this.mobileAudioManager = MobileAudioManager.getInstance();
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

    // Get adaptive speed based on difficulty and user language
    const speed = this.getSpeedForDifficulty(difficulty, userInfo);
    
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

      // Use mobile audio manager for enhanced mobile support
      if (this.isMobile()) {
        const response = await fetch(audioUrl);
        const audioBlob = await response.blob();
        
        await this.mobileAudioManager.playAudioBlob(audioBlob, {
          onEnded: () => {
            this.isPlaying = false;
            this.clearHighlighting();
          },
          onError: (error) => {
            this.isPlaying = false;
            this.fallbackToBrowserSpeech(processedText, speed);
          }
        });
        
        this.isPlaying = true;
      } else {
        // Desktop playback
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
      }

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
    
    console.log('🔤 Starting universal phonetic breakdown for:', word, 'User:', userInfo.name, 'Language:', userInfo.nativeLanguage);
    
    try {
      if (!showSyllables) {
        // Simple word pronunciation - available to all users universally
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
      
      console.log(`🔤 Playing phonetic breakdown for "${word}":`, syllables);
      
      // Stop any existing audio first
      this.stopAudio();
      
      for (let i = 0; i < syllables.length; i++) {
        console.log(`🔤 Playing syllable ${i + 1}/${syllables.length}: "${syllables[i]}"`);
        
        try {
          // Use direct browser speech for phonetic breakdown to avoid conflicts
          await this.playPhoneticSyllable(syllables[i], userInfo);

          // Longer pause between syllables for clarity
          if (i < syllables.length - 1) {
            console.log(`⏸️ Pausing 1200ms before next syllable...`);
            await this.delay(1200); // Increased pause for clearer separation
          }
        } catch (syllableError) {
          console.error(`❌ Error playing syllable "${syllables[i]}":`, syllableError);
          // Continue with remaining syllables instead of stopping completely
          continue;
        }
      }
      
      console.log(`✅ Phonetic breakdown completed for "${word}"`);
    } catch (error) {
      console.error('Phonetic breakdown failed:', error);
      // Fallback to simple pronunciation
      return this.playText({
        text: word,
        difficulty: 'easy',
        userInfo,
        isPremium: false,
        enableHighlighting: false
      });
    }
  }

  /**
   * Play a single syllable using browser speech synthesis for reliability
   */
  private async playPhoneticSyllable(syllable: string, userInfo: UserInfo): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if ('speechSynthesis' in window) {
        try {
          // Cancel any existing speech
          speechSynthesis.cancel();
          
          // Convert syllables to speech-friendly pronunciations
          const pronunciationText = phoneticRulesEngine.getSpeechFriendlyPronunciation(syllable);
          
          const utterance = new SpeechSynthesisUtterance(pronunciationText);
          utterance.rate = 0.7; // Slower for clear pronunciation
          utterance.pitch = 1.0;
          utterance.volume = 1.0;
          utterance.lang = 'en';
          
          // Find an English voice
          const voices = speechSynthesis.getVoices();
          const englishVoice = voices.find(voice => 
            voice.lang.toLowerCase().startsWith('en')
          );
          
          if (englishVoice) {
            utterance.voice = englishVoice;
          }
          
          utterance.onend = () => {
            console.log(`✅ Syllable "${syllable}" (pronounced as "${pronunciationText}") finished playing`);
            resolve();
          };
          
          utterance.onerror = (e) => {
            console.error(`❌ Error playing syllable "${syllable}":`, e);
            reject(e);
          };
          
          speechSynthesis.speak(utterance);
          console.log(`🗣️ Started playing syllable: "${syllable}" (pronounced as "${pronunciationText}")`);
        } catch (error) {
          console.error(`❌ Failed to create utterance for "${syllable}":`, error);
          reject(error);
        }
      } else {
        console.error('❌ Speech synthesis not available');
        reject(new Error('Speech synthesis not available'));
      }
    });
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
    
    // Also stop mobile audio manager
    this.mobileAudioManager.stopAudio();
    
    this.isPlaying = false;
    this.clearHighlighting();
    
    console.log('🛑 Audio stopped and highlighting cleared');
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

  private getSpeedForDifficulty(difficulty: 'beginner' | 'easy' | 'medium' | 'hard' | 'expert', userInfo?: UserInfo): number {
    const baseSpeed = this.config.speedByDifficulty[difficulty];
    
    // Adjust speed based on user's native language
    let finalSpeed: number;
    if (userInfo?.nativeLanguage === 'en') {
      finalSpeed = baseSpeed * 0.7; // Slower for English native speakers
    } else {
      finalSpeed = baseSpeed * 0.6; // Even slower for non-native speakers
    }
    
    console.log(`🎵 Audio speed for ${difficulty} (${userInfo?.nativeLanguage}): ${finalSpeed}`);
    return finalSpeed;
  }

  private shouldEnableHighlighting(difficulty: 'beginner' | 'easy' | 'medium' | 'hard' | 'expert'): boolean {
    return this.config.highlighting.enabledForLevels.includes(difficulty);
  }

  private getVoiceForUser(userInfo: UserInfo, characterType: string = 'narrator', isPremium: boolean = false): string {
    // Use character-specific voices for premium users
    if (isPremium && this.config.premium.characterVoiceConsistency) {
      return characterVoices[characterType as keyof typeof characterVoices] || characterVoices.narrator;
    }

    // Enhanced voice selection logic with friendly female voices as default
    const age = userInfo.age;
    const isGirl = userInfo.avatar?.type === 'girl';
    const isNativeEnglishSpeaker = userInfo.nativeLanguage === 'en';
    
    // Default to friendly female voices for better user experience
    if (isNativeEnglishSpeaker) {
      if (age <= 8) {
        return isGirl ? "EXAVITQu4vr4xnSDxMaL" : "EXAVITQu4vr4xnSDxMaL"; // Sarah - warm, friendly for children
      } else if (age <= 12) {
        return isGirl ? "cgSgspJ2msm6clMCkdW9" : "cgSgspJ2msm6clMCkdW9"; // Jessica - very natural and friendly
      } else {
        return isGirl ? "cgSgspJ2msm6clMCkdW9" : "XB0fDUnXU5powFXDhCwa"; // Jessica or Charlotte - natural, friendly voices
      }
    } else {
      // For non-native speakers, use clear, friendly multilingual voices
      if (age <= 8) {
        return isGirl ? "EXAVITQu4vr4xnSDxMaL" : "EXAVITQu4vr4xnSDxMaL"; // Sarah for clear pronunciation
      } else if (age <= 12) {
        return isGirl ? "XB0fDUnXU5powFXDhCwa" : "XB0fDUnXU5powFXDhCwa"; // Charlotte - clear and friendly
      } else {
        return isGirl ? "9BWtsMINqrJLrRacOk9x" : "9BWtsMINqrJLrRacOk9x"; // Aria - sophisticated and clear
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
    // Split text consistently with textProcessor
    const words = text.split(/(\s+)/);
    const wordsWithIndices = words.map((word, index) => ({ word, originalIndex: index }))
      .filter(item => item.word.trim().length > 0);
    
    this.totalWords = wordsWithIndices.length;
    this.currentWordIndex = 0;
    
    // Much faster, more responsive timing calculation
    const calculateWordInterval = (word: string, index: number): number => {
      const baseInterval = 250; // Reduced from 350ms to 250ms for much faster highlighting
      const speedAdjustment = 1 / speed; // Adjust for playback speed
      const hasPunctuation = /[.!?]/.test(word);
      const pauseAfterPunctuation = hasPunctuation ? 150 : 0; // Reduced pause
      const wordLength = word.length;
      const lengthAdjustment = wordLength > 6 ? 25 : 0; // Minimal extra time for long words
      
      return (baseInterval * speedAdjustment) + pauseAfterPunctuation + lengthAdjustment;
    };

    const highlightNext = () => {
      if (this.currentWordIndex < wordsWithIndices.length && this.isPlaying) {
        const currentItem = wordsWithIndices[this.currentWordIndex];
        const wordOnlyIndex = this.currentWordIndex; // Use sequential word index for consistency
        console.log(`🎯 Highlighting word ${this.currentWordIndex + 1}/${this.totalWords}: "${currentItem.word}" (word-only index: ${wordOnlyIndex})`);
        
        onWordHighlight(wordOnlyIndex);
        
        const nextInterval = calculateWordInterval(currentItem.word, this.currentWordIndex);
        this.currentWordIndex++;
        
        this.highlightTimeout = setTimeout(highlightNext, nextInterval);
      } else {
        // Highlighting completed - clear all highlights
        console.log('🎯 Highlighting sequence completed, clearing highlights');
        onWordHighlight(-1); // Signal to clear all highlights
        this.clearHighlighting();
      }
    };

    // Start highlighting immediately with minimal delay
    this.highlightTimeout = setTimeout(highlightNext, 50);
  }

  private clearHighlighting(): void {
    if (this.highlightTimeout) {
      clearTimeout(this.highlightTimeout);
      this.highlightTimeout = null;
    }
    this.currentWordIndex = 0;
    this.totalWords = 0;
    console.log('🧹 Highlighting cleared and reset');
  }

  private breakIntoSyllables(word: string): string[] {
    console.log(`🔤 Enhanced syllable breaking for "${word}"`);
    
    // Use the comprehensive phonetic rules engine
    const syllables = phoneticRulesEngine.breakIntoSyllables(word);
    
    // Get debug information
    const debugInfo = phoneticRulesEngine.getDebugInfo(word);
    console.log(`🎯 Phonetic breakdown debug:`, debugInfo);
    
    return syllables;
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

   private isMobile(): boolean {
     return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
   }
 }