// Enhanced Audio Service
// Unified service for all audio functionality including TTS, speed control, highlighting, and premium features

import { defaultAudioConfig, voiceCommands, characterVoices, phoneticSettings } from '@/config/audioConfig';
import type { AudioSettings } from '@/config/audioConfig';
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
    
    try {
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
      
      console.log(`🔤 Playing phonetic breakdown for "${word}":`, syllables);
      
      for (let i = 0; i < syllables.length; i++) {
        console.log(`🔤 Playing syllable ${i + 1}/${syllables.length}: "${syllables[i]}"`);
        
        try {
          await this.playText({
            text: syllables[i],
            difficulty: 'easy',
            userInfo,
            isPremium: false, // Syllable breakdown now available to all users
            enableHighlighting: false
          });

          // Longer pause between syllables for clarity
          if (i < syllables.length - 1) {
            await this.delay(800); // Increased from 400ms to 800ms
          }
        } catch (syllableError) {
          console.error(`❌ Error playing syllable "${syllables[i]}":`, syllableError);
          // Try to continue with remaining syllables, but log the failure
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
    // Split text consistently with textProcessor
    const words = text.split(/(\s+)/);
    const wordsWithIndices = words.map((word, index) => ({ word, originalIndex: index }))
      .filter(item => item.word.trim().length > 0);
    
    this.totalWords = wordsWithIndices.length;
    this.currentWordIndex = 0;
    
    // More accurate timing calculation based on actual reading speed
    const calculateWordInterval = (word: string, index: number): number => {
      const baseInterval = 700; // Base 700ms per word for clear reading
      const speedAdjustment = 1 / speed; // Adjust for playback speed
      const hasPunctuation = /[.!?]/.test(word);
      const pauseAfterPunctuation = hasPunctuation ? 400 : 0;
      const wordLength = word.length;
      const lengthAdjustment = wordLength > 6 ? 100 : 0; // Extra time for long words
      
      return (baseInterval * speedAdjustment) + pauseAfterPunctuation + lengthAdjustment;
    };

    const highlightNext = () => {
      if (this.currentWordIndex < wordsWithIndices.length && this.isPlaying) {
        const currentItem = wordsWithIndices[this.currentWordIndex];
        const wordOnlyIndex = this.currentWordIndex; // Use sequential word index, not original text index
        console.log(`🎯 Highlighting word ${this.currentWordIndex + 1}/${this.totalWords}: "${currentItem.word}" (word-only index: ${wordOnlyIndex})`);
        
        onWordHighlight(wordOnlyIndex);
        
        const nextInterval = calculateWordInterval(currentItem.word, this.currentWordIndex);
        this.currentWordIndex++;
        
        this.highlightTimeout = setTimeout(highlightNext, nextInterval);
      }
    };

    // Start highlighting immediately with reduced initial delay
    this.highlightTimeout = setTimeout(highlightNext, 200);
  }

  private clearHighlighting(): void {
    if (this.highlightTimeout) {
      clearTimeout(this.highlightTimeout);
      this.highlightTimeout = null;
    }
  }

  private breakIntoSyllables(word: string): string[] {
    const cleanWord = word.replace(/[.,!?;:'"()]/g, '').toLowerCase();
    
    // Dictionary of known difficult words
    const knownSyllables: Record<string, string[]> = {
      'flowers': ['flow', 'ers'],
      'wonderful': ['won', 'der', 'ful'],
      'beautiful': ['beau', 'ti', 'ful'],
      'together': ['to', 'geth', 'er'],
      'remember': ['re', 'mem', 'ber'],
      'different': ['dif', 'fer', 'ent'],
      'important': ['im', 'por', 'tant'],
      'adventure': ['ad', 'ven', 'ture'],
      'character': ['char', 'ac', 'ter'],
      'favorite': ['fa', 'vor', 'ite']
    };
    
    // Check dictionary first
    if (knownSyllables[cleanWord]) {
      console.log(`📚 Using dictionary syllables for "${cleanWord}":`, knownSyllables[cleanWord]);
      return knownSyllables[cleanWord];
    }
    
    // Simple vowel-based splitting for unknown words
    const vowels = 'aeiouy';
    const syllables: string[] = [];
    let currentSyllable = '';
    
    for (let i = 0; i < cleanWord.length; i++) {
      const char = cleanWord[i];
      currentSyllable += char;
      
      // If we hit a vowel, look for a good break point
      if (vowels.includes(char)) {
        // If this is the end, add the syllable
        if (i === cleanWord.length - 1) {
          syllables.push(currentSyllable);
          break;
        }
        
        // Look ahead for consonant-vowel pattern
        let j = i + 1;
        while (j < cleanWord.length && !vowels.includes(cleanWord[j])) {
          j++;
        }
        
        // If we found another vowel, split appropriately
        if (j < cleanWord.length) {
          const consonantCount = j - i - 1;
          if (consonantCount === 1) {
            // Single consonant: take it with us
            currentSyllable += cleanWord[i + 1];
            syllables.push(currentSyllable);
            currentSyllable = '';
            i++; // Skip the consonant
          } else if (consonantCount > 1) {
            // Multiple consonants: split after first
            currentSyllable += cleanWord[i + 1];
            syllables.push(currentSyllable);
            currentSyllable = '';
            i++; // Skip first consonant
          }
        }
      }
    }
    
    // Add any remaining characters
    if (currentSyllable) {
      syllables.push(currentSyllable);
    }
    
    // Fallback: if breaking failed, return whole word
    if (syllables.length === 0 || syllables.join('') !== cleanWord) {
      console.log(`📝 Syllable breaking failed for "${cleanWord}", using whole word`);
      return [cleanWord];
    }
    
    console.log(`📝 Syllables for "${cleanWord}":`, syllables);
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