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

    // Enhanced multilingual audio support with better error handling
    const isEnglishSpeaker = userInfo.nativeLanguage === 'en';
    const supportedLanguages = ['en', 'es', 'fr', 'pt', 'zh', 'hi', 'ar'];
    const isLanguageSupported = supportedLanguages.includes(userInfo.nativeLanguage || 'en');
    
    console.log(`🌍 Audio Language Check: User=${userInfo.nativeLanguage}, Premium=${isPremium}, Supported=${isLanguageSupported}`);

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
    
    // Enhanced model selection with fallback support
    const model = isEnglishSpeaker ? 'eleven_turbo_v2' : 'eleven_multilingual_v2';
    console.log(`🎵 Audio Model Selected: ${model} for language: ${userInfo.nativeLanguage}`);

    try {
      // Stop any currently playing audio
      this.stopAudio();

      // Use enhanced AudioSyncService for better highlighting synchronization
      const { audioSyncService } = await import('./audioSyncService');
      
      await audioSyncService.playText({
        text: processedText,
        voice,
        model,
        speed,
        onWordHighlight: enableHighlighting ? onWordHighlight : undefined,
        onStateChange: (isPlaying: boolean) => {
          // Critical: Sync state immediately when audioSyncService changes
          console.log(`🔄 AudioSync state change: ${this.isPlaying} → ${isPlaying}`);
          this.isPlaying = isPlaying;
        },
        onSyncError: (error?: any) => {
          console.log('🔄 Audio sync error, falling back to browser speech', error);
          this.isPlaying = false; // Reset state on error
          
          // Enhanced fallback with language support
          if (!isLanguageSupported && !isPremium) {
            console.log('❌ Language not supported for free users, using English fallback');
            this.fallbackToBrowserSpeech(processedText, { ...userInfo, nativeLanguage: 'en' }, onWordHighlight);
          } else {
            this.fallbackToBrowserSpeech(processedText, userInfo, onWordHighlight);
          }
        }
      });

      // Mark page as played for free users
      if (!isPremium) {
        this.playedPages.add(currentPage);
      }

      this.isPlaying = true;
      console.log(`🎵 Enhanced audio playback started for difficulty: ${difficulty}, speed: ${speed}x`);
      
    } catch (error) {
      console.error('Enhanced audio playback failed:', error);
      
      // Enhanced error handling with language-specific fallbacks
      if (!isLanguageSupported && !isPremium) {
        console.log('🌍 Language not supported for free users, providing English fallback');
        this.fallbackToBrowserSpeech(processedText, { ...userInfo, nativeLanguage: 'en' }, onWordHighlight);
      } else if (!isEnglishSpeaker && isPremium) {
        console.log('🌍 Multilingual audio failed for premium user, trying browser fallback');
        this.fallbackToBrowserSpeech(processedText, userInfo, onWordHighlight);
      } else {
        this.fallbackToBrowserSpeech(processedText, userInfo, onWordHighlight);
      }
    }
  }

  async playPhoneticBreakdown(options: PhoneticsOptions): Promise<void> {
    const { word, userInfo, showSyllables = true, playbackSpeed = phoneticSettings.playbackSpeed } = options;
    
    console.log('🔤 UNIVERSAL PHONETIC: Starting breakdown for:', word, 'User:', userInfo.name, 'Language:', userInfo.nativeLanguage || 'en', 'Device:', this.isMobile() ? 'mobile' : 'desktop');
    
    try {
      // Validate inputs
      if (!word || !userInfo) {
        console.error('❌ UNIVERSAL PHONETIC: Missing required parameters');
        throw new Error('Word and user info required for phonetic breakdown');
      }

      if (!showSyllables) {
        // Simple word pronunciation - available to ALL users universally
        console.log('🔤 UNIVERSAL: Playing simple pronunciation');
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
    // Stop new sync service if available
    import('./audioSyncService').then(({ audioSyncService }) => {
      audioSyncService.stopAudio();
    }).catch(() => {
      // Fallback to old method
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio = null;
      }
      this.mobileAudioManager.stopAudio();
    });
    
    // Clear speech synthesis if active
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    // Critical: Always reset our state immediately
    this.isPlaying = false;
    this.clearHighlighting();
    
    console.log('🛑 Enhanced audio service completely stopped');
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
    // Standardized speed based on French Level 3 preference (0.85x for all languages)
    const baseSpeed = {
      beginner: 0.5,   // Slower for absolute beginners/level 0
      easy: 0.75,      // Slower for better comprehension
      medium: 0.85,    // Perfect French pace - now used for all languages
      hard: 0.9,       // Slightly faster but still clear
      expert: 1.0      // Normal speed
    }[difficulty];
    
    // Removed language multipliers - all languages now use the same perfect pace
    // More gentle age-appropriate speed adjustment
    const ageMultiplier = userInfo && userInfo.age <= 8 ? 0.9 : 1.0;
    
    const finalSpeed = Math.max(0.4, Math.min(1.2, baseSpeed * ageMultiplier));
    
    console.log(`🎵 Standardized audio speed for ${difficulty}: ${finalSpeed} (all languages)`);
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

    // Standardized voice selection - Charlotte for all languages and ages (matches perfect French experience)
    return "XB0fDUnXU5powFXDhCwa"; // Charlotte - perfect voice and pace for all users
  }

  private async generateAudio(text: string, voice: string, userInfo: UserInfo, isPremium: boolean): Promise<string> {
    // Use eleven_multilingual_v2 for all languages for consistent timing and quality
    const model = "eleven_multilingual_v2";

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

  private fallbackToBrowserSpeech(text: string, userInfo: UserInfo, onWordHighlight?: (wordIndex: number) => void): void {
    if ('speechSynthesis' in window) {
      const speed = this.getSpeedForDifficulty('easy', userInfo);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speed;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Enhanced language selection for browser speech
      const languageMap: Record<string, string> = {
        'en': 'en',
        'es': 'es',
        'fr': 'fr',
        'pt': 'pt',
        'zh': 'zh',
        'hi': 'hi',
        'ar': 'ar'
      };
      
      const targetLanguage = languageMap[userInfo.nativeLanguage || 'en'] || 'en';
      utterance.lang = targetLanguage;
      
      console.log(`🗣️ Browser speech fallback using language: ${targetLanguage}`);

      utterance.onend = () => {
        this.isPlaying = false;
        this.clearHighlighting();
      };

      utterance.onerror = () => {
        this.isPlaying = false;
      };

      speechSynthesis.speak(utterance);
      this.isPlaying = true;
      
      // Start highlighting for fallback speech
      if (onWordHighlight) {
        this.startWordHighlighting(text, speed, onWordHighlight);
      }
    }
  }

  private startWordHighlighting(text: string, speed: number, onWordHighlight: (wordIndex: number) => void): void {
    // Split text consistently with textProcessor
    const words = text.split(/(\s+)/);
    const wordsWithIndices = words.map((word, index) => ({ word, originalIndex: index }))
      .filter(item => item.word.trim().length > 0);
    
    this.totalWords = wordsWithIndices.length;
    this.currentWordIndex = 0;
    
      // Enhanced timing calculation optimized for eleven_multilingual_v2
      const calculateWordInterval = (word: string, index: number): number => {
        const baseInterval = 165; // Optimized for eleven_multilingual_v2 (matches AudioSyncService)
        const speedAdjustment = 1 / speed;
        const hasPunctuation = /[.!?]/.test(word);
        const pauseAfterPunctuation = hasPunctuation ? 85 : 0; // Enhanced pause for multilingual model
        const wordLength = word.length;
        const lengthAdjustment = wordLength > 6 ? 12 : 0; // Slightly longer for complex words
        
        // Text length speed adjustment for better following
        const textLengthCorrection = this.totalWords > 8 ? 0.9 : 
                                   this.totalWords > 6 ? 0.95 : 1.0;
        
        // Last word buffer to ensure completion
        const isLastWord = index === this.totalWords - 1;
        const lastWordBuffer = isLastWord ? 60 : 0; // Longer buffer for multilingual model
        
        return ((baseInterval * speedAdjustment) + pauseAfterPunctuation + lengthAdjustment + lastWordBuffer) * textLengthCorrection;
      };

    const highlightNext = () => {
      if (this.currentWordIndex < wordsWithIndices.length && this.isPlaying) {
        const currentItem = wordsWithIndices[this.currentWordIndex];
        const wordOnlyIndex = this.currentWordIndex;
        console.log(`🎯 Highlighting word ${this.currentWordIndex + 1}/${this.totalWords}: "${currentItem.word}" (index: ${wordOnlyIndex})`);
        
        onWordHighlight(wordOnlyIndex);
        
        const nextInterval = calculateWordInterval(currentItem.word, this.currentWordIndex);
        this.currentWordIndex++;
        
        // Ensure last word gets proper highlighting time
        if (this.currentWordIndex < wordsWithIndices.length) {
          this.highlightTimeout = setTimeout(highlightNext, nextInterval);
        } else {
          // Last word - add extra buffer time to ensure it's visible
          console.log(`📍 Last word highlighted, adding completion buffer`);
          this.highlightTimeout = setTimeout(() => {
            if (this.isPlaying) {
              console.log(`🧹 Clearing highlights after completion`);
              onWordHighlight(-1);
            }
          }, Math.max(nextInterval, 800)); // Minimum 800ms for last word
        }
      } else {
        // Highlighting completed - clear all highlights
        console.log('🎯 Highlighting sequence completed, clearing highlights');
        onWordHighlight(-1);
        this.clearHighlighting();
      }
    };

    // Start highlighting with minimal delay
    this.highlightTimeout = setTimeout(highlightNext, 100);
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
    console.log(`🔤 UNIVERSAL Enhanced: Delegating syllable breaking for "${word}"`);
    
    // Delegate to the comprehensive phonetic rules engine
    const syllables = phoneticRulesEngine.breakIntoSyllables(word);
    
    // Get debug information for troubleshooting
    const debugInfo = phoneticRulesEngine.getDebugInfo(word);
    console.log(`🎯 UNIVERSAL Debug:`, debugInfo);
    
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