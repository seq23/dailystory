/**
 * UNIFIED CHARLOTTE VOICE SERVICE
 * Single source of truth for ALL Charlotte audio functionality
 * Consolidates conversation, learning, story reading, interactive words, and voice buddy
 */
import { SmartElevenLabsTTS } from '@/services/smartElevenLabsTTS';
import { SynchronizedElevenLabsTTS } from '@/services/SynchronizedElevenLabsTTS';
import phonicsMiniDict from '@/data/phonicsMiniDict';
import { contextualPronunciation } from '@/services/contextualPronunciation';
import { supabase } from '@/integrations/supabase/client';
import { DebugLogger } from '@/services/DebugLogger';

export type CharlotteContext = 'conversation' | 'learning' | 'story' | 'interactive' | 'buddy';

interface CharlotteVoiceRequest {
  text: string;
  context: CharlotteContext;
  voiceId?: string;
  retryCount?: number;
  onWordHighlight?: (wordIndex: number) => void;
}

interface CharlotteSpeechResult {
  audioBuffer: ArrayBuffer;
  wordTimings?: Array<{ word: string; startTime: number; endTime: number }>;
}

/**
 * Unified Charlotte Voice Service
 * Charlotte is the single voice for everything: conversations, story reading, word explanations, syllables
 */
export class CharlotteVoiceService {
  private static instance: CharlotteVoiceService | null = null;
  private static processingRequests = new Set<string>();
  private static requestCounter = 0;
  private static charlotteVoiceId = 'XB0fDUnXU5powFXDhCwa'; // Charlotte's voice
  
  private audio: HTMLAudioElement | null = null;
  private currentUrl: string | null = null;
  private playing = false;
  private wordTimings: Array<{ word: string; startTime: number; endTime: number }> = [];
  private onWordHighlight?: (wordIndex: number) => void;
  private highlightInterval?: NodeJS.Timeout;
  private currentHash: string | null = null;

  static getInstance() {
    if (!this.instance) {
      this.instance = new CharlotteVoiceService();
      // Expose globally for AudioPlaybackTester and backward compatibility
      (window as any).__CharlotteVoiceService = this.instance;
      // BACKWARD COMPATIBILITY: Expose as SimplifiedAudioEngine for legacy code
      (window as any).__SimplifiedAudioEngine = this.instance;
    }
    return this.instance;
  }

  /**
   * CHARLOTTE READS STORY - With word highlighting and timing
   * Uses sophisticated timing system for story reading with word-by-word highlighting
   */
  async charlotteReadStory(text: string, onWordHighlight?: (wordIndex: number) => void, speed?: number): Promise<void> {
    const requestId = `story-${++CharlotteVoiceService.requestCounter}`;
    DebugLogger.log('audio', `🎙️ Charlotte Reading Story: "${text.substring(0, 50)}..." [Request: ${requestId}]`);

    try {
      // Request audio control with high priority for story reading
      window.dispatchEvent(new CustomEvent('audio:request', { 
        detail: { system: 'charlotte-story', priority: 4, source: 'story-reading' } 
      }));

      // Use synchronized TTS for story reading (maintains word timing sophistication)
      const result = await SynchronizedElevenLabsTTS.generateSynchronizedSpeech(
        text, 
        'conversation', // Natural conversation tone for story reading
        CharlotteVoiceService.charlotteVoiceId
      );

      this.wordTimings = result.wordTimings;
      this.onWordHighlight = onWordHighlight;

      // Play with word highlighting
      await this.playCharlotteAudio(result.audioBuffer, true, speed);
      
      DebugLogger.log('audio', `✅ Charlotte story reading completed: ${requestId}`);

    } catch (error) {
      DebugLogger.error('audio', `❌ Charlotte story reading failed: ${requestId}`, error);
      throw error; // Let caller handle fallback to prevent duplicate browser TTS
    } finally {
      window.dispatchEvent(new CustomEvent('audio:stopped', { 
        detail: { system: 'charlotte-story' } 
      }));
    }
  }

  /**
   * CHARLOTTE MULTILINGUAL EXPLANATIONS - Uses ElevenLabs Multilingual v2 for all languages
   * Replaces browser TTS with Charlotte's voice for consistent experience
   */
  async charlotteMultilingualExplain(text: string, language: string = 'en'): Promise<void> {
    const requestId = `multilingual-${++CharlotteVoiceService.requestCounter}`;
    DebugLogger.log('audio', `🌍 Charlotte Multilingual Explain: "${text}" in ${language} [Request: ${requestId}]`);

    try {
      window.dispatchEvent(new CustomEvent('audio:request', { 
        detail: { system: 'charlotte-multilingual', priority: 5, source: 'multilingual-explanation' } 
      }));

      // Use ElevenLabs TTS with Charlotte's voice - multilingual support handled by service
      const audioBuffer = await SmartElevenLabsTTS.generateSpeech(
        text, 
        'conversation', 
        CharlotteVoiceService.charlotteVoiceId
      );

      await this.playCharlotteAudio(audioBuffer, false);
      
      DebugLogger.log('audio', `✅ Charlotte multilingual explanation completed: ${requestId}`);

    } catch (error) {
      DebugLogger.error('audio', `❌ Charlotte multilingual explanation failed: ${requestId}`, error);
      throw error; // Let caller handle fallback to prevent duplicate browser TTS
    } finally {
      window.dispatchEvent(new CustomEvent('audio:stopped', { 
        detail: { system: 'charlotte-multilingual' } 
      }));
    }
  }

  /**
   * CHARLOTTE INTERACTIVE AUDIO - Fast response for buttons (hear, explain, syllables)
   * Uses fast direct TTS for 2-3 second response times
   */
  async charlotteInteractiveAudio(request: CharlotteVoiceRequest): Promise<void> {
    const { text, context } = request;
    const requestId = `interactive-${context}-${++CharlotteVoiceService.requestCounter}`;
    
    // Debounce rapid clicks
    const existingRequest = Array.from(CharlotteVoiceService.processingRequests)
      .find(id => id.includes(`interactive-${context}-${text.substring(0, 10)}`));
    if (existingRequest) {
      DebugLogger.log('audio', `🔒 Charlotte debounced: ${context} request for "${text}"`);
      return;
    }

    CharlotteVoiceService.processingRequests.add(requestId);
    DebugLogger.log('audio', `Charlotte Interactive: ${context.toUpperCase()} - "${text}" [Request: ${requestId}]`);

    try {
      // Request audio control with highest priority for interactive buttons
      window.dispatchEvent(new CustomEvent('audio:request', { 
        detail: { system: 'charlotte-interactive', priority: 5, source: 'interactive-button' } 
      }));

      // Use appropriate context for TTS generation
      let finalText = text;
      let ttsContext: 'conversation' | 'learning' = 'conversation';

      // Handle different interactive contexts
      switch (context) {
        case 'learning':
          // Syllable breakdown with Charlotte's learning voice
          finalText = await this.prepareSyllableText(text);
          ttsContext = 'learning'; // Use phonetic lexicon for syllables
          break;
        case 'interactive':
          // Word explanation with Charlotte's natural voice
          finalText = await this.prepareExplanationText(text);
          ttsContext = 'conversation'; // Natural explanation
          break;
        default:
          // Direct pronunciation with Charlotte's natural voice
          ttsContext = 'conversation';
          break;
      }

      // 8-second timeout for interactive requests
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Charlotte interactive timeout - using browser fallback')), 8000);
      });

      // Use fast direct TTS through SmartElevenLabsTTS
      const audioBuffer = await Promise.race([
        SmartElevenLabsTTS.generateSpeech(finalText, ttsContext, CharlotteVoiceService.charlotteVoiceId),
        timeoutPromise
      ]);

      await this.playCharlotteAudio(audioBuffer, false);
      
      DebugLogger.log('audio', `✅ Charlotte interactive completed: ${requestId}`);

    } catch (error) {
      DebugLogger.error('audio', `❌ Charlotte interactive failed: ${requestId}`, error);
      
      if (request.retryCount && request.retryCount < 1) {
        DebugLogger.log('audio', `🔄 Retrying Charlotte interactive (attempt ${request.retryCount + 1})`);
        setTimeout(() => this.charlotteInteractiveAudio({
          ...request,
          retryCount: (request.retryCount || 0) + 1
        }), 1000);
        return;
      }
      
      throw error; // Let caller handle fallback to prevent duplicate browser TTS
    } finally {
      window.dispatchEvent(new CustomEvent('audio:stopped', { 
        detail: { system: 'charlotte-interactive' } 
      }));
      CharlotteVoiceService.processingRequests.delete(requestId);
    }
  }

  /**
   * CHARLOTTE VOICE BUDDY - Conversation system for voice commands
   * Routes to ElevenLabs conversation system when buddy button is active
   */
  charlotteVoiceBuddy(): {
    canCharlotteSpeak: () => boolean;
    requestCharlotteSpeech: () => void;
    releaseCharlotteSpeech: () => void;
  } {
    DebugLogger.log('audio', 'Charlotte Voice Buddy: Activated');
    
    return {
      canCharlotteSpeak: () => {
        const coordinator = (window as any).__SimpleAudioCoordinator;
        const activeSystem = coordinator?.getActiveSystem();
        return !activeSystem || activeSystem === 'charlotte' || activeSystem === 'charlotte-buddy';
      },
      
      requestCharlotteSpeech: () => {
        DebugLogger.log('audio', 'Charlotte Voice Buddy: Requesting speech permission');
        window.dispatchEvent(new CustomEvent('audio:request', { 
          detail: { system: 'charlotte-buddy', priority: 6 } // Highest priority for voice buddy
        }));
      },
      
      releaseCharlotteSpeech: () => {
        DebugLogger.log('audio', 'Charlotte Voice Buddy: Releasing speech permission');
        window.dispatchEvent(new CustomEvent('audio:stopped', { 
          detail: { system: 'charlotte-buddy' } 
        }));
      }
    };
  }

  /**
   * CHARLOTTE COACHING SERVICES - Specialized methods for reading coach
   */
  
  // Charlotte provides accuracy feedback with proper interpolation
  async charlotteAccuracyFeedback(accuracy: number, isSuccess: boolean, pace: string): Promise<void> {
    const requestId = `accuracy-${++CharlotteVoiceService.requestCounter}`;
    DebugLogger.log('audio', `🎯 Charlotte Accuracy Feedback: ${accuracy}% success=${isSuccess} [Request: ${requestId}]`);

    try {
      window.dispatchEvent(new CustomEvent('audio:request', { 
        detail: { system: 'charlotte-coaching', priority: 5, source: 'accuracy-feedback' } 
      }));

      let message: string;
      if (isSuccess) {
        message = `Excellent reading! ${pace} That was a perfect score of ${accuracy} percent!`;
      } else {
        message = `Good effort! You got ${accuracy} percent correct. ${pace}`;
      }

      const audioBuffer = await SmartElevenLabsTTS.generateSpeech(
        message, 
        'conversation', 
        CharlotteVoiceService.charlotteVoiceId
      );

      await this.playCharlotteAudio(audioBuffer, false);
      
      DebugLogger.log('audio', `✅ Charlotte accuracy feedback completed: ${requestId}`);

    } catch (error) {
      DebugLogger.error('audio', `❌ Charlotte accuracy feedback failed: ${requestId}`, error);
      throw error;
    } finally {
      window.dispatchEvent(new CustomEvent('audio:stopped', { 
        detail: { system: 'charlotte-coaching' } 
      }));
    }
  }

  // Charlotte provides practice words coaching
  async charlottePracticeWords(words: string[]): Promise<void> {
    const requestId = `practice-${++CharlotteVoiceService.requestCounter}`;
    DebugLogger.log('audio', `📚 Charlotte Practice Words: ${words.join(', ')} [Request: ${requestId}]`);

    try {
      window.dispatchEvent(new CustomEvent('audio:request', { 
        detail: { system: 'charlotte-coaching', priority: 5, source: 'practice-words' } 
      }));

      const message = `Let's practice these words: ${words.join(', ')}. I'll demonstrate each one for you.`;

      const audioBuffer = await SmartElevenLabsTTS.generateSpeech(
        message, 
        'conversation', 
        CharlotteVoiceService.charlotteVoiceId
      );

      await this.playCharlotteAudio(audioBuffer, false);
      
      DebugLogger.log('audio', `✅ Charlotte practice words completed: ${requestId}`);

    } catch (error) {
      DebugLogger.error('audio', `❌ Charlotte practice words failed: ${requestId}`, error);
      throw error;
    } finally {
      window.dispatchEvent(new CustomEvent('audio:stopped', { 
        detail: { system: 'charlotte-coaching' } 
      }));
    }
  }

  /**
   * CHARLOTTE WORD SERVICES - Consolidated word interaction methods
   */
  
  // Charlotte hears/pronounces a word
  async charlotteHearWord(word: string): Promise<void> {
    const cleanWord = word.replace(/[.,!?;:'"()]/g, '').trim();
    await this.charlotteInteractiveAudio({
      text: cleanWord,
      context: 'interactive'
    });
  }

  // Charlotte explains a word meaning
  async charlotteExplainWord(word: string, userLanguage: string = 'en'): Promise<void> {
    const cleanWord = word.replace(/[.,!?;:'"()]/g, '').trim();
    
    try {
      // Get word definition
      const { data: definition, error } = await supabase.functions.invoke('word-dictionary', {
        body: { 
          word: cleanWord.toLowerCase(),
          userLanguage: userLanguage,
          userLevel: 'beginner'
        }
      });

      if (error || !definition?.definition) {
        throw new Error('No definition found');
      }

      await this.charlotteInteractiveAudio({
        text: definition.definition,
        context: 'interactive'
      });

    } catch (error) {
      DebugLogger.error('audio', `Charlotte word explanation failed for "${word}"`, error);
      await this.charlotteInteractiveAudio({
        text: `Sorry, I couldn't find the definition for ${word}`,
        context: 'interactive'
      });
    }
  }

  // Charlotte breaks down syllables with intelligent 3-4 stem chunking
  async charlotteSyllableWord(word: string): Promise<void> {
    const cleanWord = word.replace(/[.,!?;:'"()]/g, '').trim();
    
    try {
      // Use phonetic dictionary for syllable breakdown
      const cleanWordForSyllables = cleanWord.toLowerCase().replace(/[^a-z]/g, '');
      const syllables = phonicsMiniDict[cleanWordForSyllables] || [cleanWord];
      
      if (!syllables || syllables.length === 0) {
        throw new Error('No syllables found');
      }

      // Condense to maximum 4 stems for standard American pronunciation
      const condensedSyllables = this.condenseToMax4(syllables);
      const syllableText = condensedSyllables.join(' - ');
      DebugLogger.log('audio', `Charlotte syllables for "${cleanWord}": ${syllableText} (condensed from ${syllables.length} to ${condensedSyllables.length} stems)`);

      await this.charlotteInteractiveAudio({
        text: syllableText,
        context: 'learning' // Use learning context for phonetic pronunciation
      });

    } catch (error) {
      DebugLogger.error('audio', `Charlotte syllable breakdown failed for "${word}"`, error);
      await this.charlotteInteractiveAudio({
        text: `Sorry, I couldn't break down ${word} into syllables`,
        context: 'interactive'
      });
    }
  }

  /**
   * PRIVATE METHODS - Internal functionality
   */

  private condenseToMax4(syllables: string[]): string[] {
    if (syllables.length <= 4) return syllables;
    
    // Standard American syllable condensing - merge adjacent vowel-heavy syllables
    const condensed: string[] = [];
    let i = 0;
    
    while (i < syllables.length && condensed.length < 4) {
      if (condensed.length === 3 && i < syllables.length - 1) {
        // Merge all remaining syllables into the final stem
        condensed.push(syllables.slice(i).join(''));
        break;
      } else {
        condensed.push(syllables[i]);
        i++;
      }
    }
    
    return condensed;
  }

  private async prepareSyllableText(word: string): Promise<string> {
    try {
      const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
      const syllables = phonicsMiniDict[cleanWord] || [word];
      const condensed = this.condenseToMax4(syllables);
      return condensed.join(' - ');
    } catch {
      return word;
    }
  }

  private async prepareExplanationText(word: string): Promise<string> {
    // For now, return the word directly - explanation logic is in charlotteExplainWord
    return word;
  }

  private async playCharlotteAudio(audioBuffer: ArrayBuffer, withHighlighting: boolean, speed?: number): Promise<void> {
    const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);
    
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.preload = 'auto';
      this.audio.crossOrigin = 'anonymous';
      
      // Mobile-specific configurations
      (this.audio as any).playsInline = true;
      this.audio.setAttribute('playsinline', 'true');
      
      this.audio.addEventListener('ended', () => { 
        this.playing = false;
        this.stopWordHighlighting();
        window.dispatchEvent(new CustomEvent('audio:statechange', { 
          detail: { isPlaying: false, system: 'charlotte' } 
        }));
      });
      
      this.audio.addEventListener('play', () => { 
        this.playing = true;
        if (withHighlighting) {
          this.startWordHighlighting();
        }
        window.dispatchEvent(new CustomEvent('audio:statechange', { 
          detail: { isPlaying: true, system: 'charlotte' } 
        }));
      });
    }

    // Clean up previous URL
    if (this.currentUrl) {
      URL.revokeObjectURL(this.currentUrl);
    }
    
    this.currentUrl = audioUrl;
    this.audio.src = audioUrl;
    this.audio.playbackRate = speed || 1.0;
    
    // Wait for audio to finish
    await new Promise<void>((resolve, reject) => {
      if (!this.audio) return reject(new Error('Audio element not available'));
      
      this.audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      this.audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        reject(new Error('Audio playback failed'));
      };
      this.audio.play().catch(reject);
    });
  }

  private startWordHighlighting(): void {
    if (!this.audio || !this.onWordHighlight || this.wordTimings.length === 0) {
      return;
    }
    
    // Preserve callback across stop/start cycle
    const preservedCallback = this.onWordHighlight;
    this.stopWordHighlighting();
    this.onWordHighlight = preservedCallback;
    
    let lastHighlightedIndex = -1;
    
    const updateHighlight = () => {
      if (!this.audio || !this.playing) return;
      
      const currentTimeMs = this.audio.currentTime * 1000;
      
      // Find the current word based on timing
      let currentWordIndex = this.wordTimings.findIndex(timing => 
        currentTimeMs >= timing.startTime && currentTimeMs <= timing.endTime
      );
      
      // If no exact match, find closest word
      if (currentWordIndex === -1) {
        let closestDistance = Infinity;
        for (let i = 0; i < this.wordTimings.length; i++) {
          const timing = this.wordTimings[i];
          const distance = Math.min(
            Math.abs(currentTimeMs - timing.startTime),
            Math.abs(currentTimeMs - timing.endTime)
          );
          
          if (distance < 30 && distance < closestDistance) {
            closestDistance = distance;
            currentWordIndex = i;
          }
        }
      }
      
      // Update highlighting
      if (currentWordIndex !== -1 && currentWordIndex !== lastHighlightedIndex) {
        this.onWordHighlight?.(currentWordIndex);
        lastHighlightedIndex = currentWordIndex;
      } else if (currentWordIndex === -1 && lastHighlightedIndex !== -1) {
        this.onWordHighlight?.(-1);
        lastHighlightedIndex = -1;
      }
    };
    
    // Use audio timeupdate event for perfect timing sync
    this.audio.addEventListener('timeupdate', updateHighlight);
    
    // Also use interval as backup for smoother highlighting
    this.highlightInterval = setInterval(updateHighlight, 20);
  }

  private stopWordHighlighting(): void {
    if (this.highlightInterval) {
      clearInterval(this.highlightInterval);
      this.highlightInterval = undefined;
    }
    
    // Null safety check: ensure onWordHighlight is defined and is a function
    if (this.onWordHighlight && typeof this.onWordHighlight === 'function') {
      try {
        this.onWordHighlight(-1);
      } catch (error) {
        DebugLogger.error('audio', 'Error calling onWordHighlight callback', error);
      }
    }
    
    // Clear callback to prevent stale references
    this.onWordHighlight = undefined;
  }

  private fallbackToBrowserSpeech(text: string): void {
    DebugLogger.log('audio', `🗣️ Charlotte browser speech fallback: "${text}"`);
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const processedText = contextualPronunciation.processTextForPronunciation(text, true);
      const utterance = new SpeechSynthesisUtterance(processedText);
      
      utterance.rate = 0.7;
      utterance.pitch = 1.1;
      utterance.volume = 1.0;
      
      // Try to find a female voice (like Charlotte)
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang === 'en-us' && voice.name.toLowerCase().includes('female')
      ) || voices.find(voice => voice.lang.startsWith('en'));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  }

  /**
   * PUBLIC CONTROL METHODS - SimplifiedAudioEngine compatibility interface
   */
  
  /**
   * SimplifiedAudioEngine compatible interface - Main entry point for story reading
   */
  async playTextWithSynchronization(options: { 
    text: string; 
    contentHash?: string;
    onWordHighlight?: (wordIndex: number) => void 
  }): Promise<void> {
    DebugLogger.log('audio', `🎭 Charlotte playTextWithSynchronization: "${options.text.substring(0, 50)}..."`);
    
    // Store content hash for compatibility
    this.currentHash = options.contentHash || '';
    
    // Route to Charlotte's story reading functionality
    return this.charlotteReadStory(options.text, options.onWordHighlight);
  }

  /**
   * SimplifiedAudioEngine compatible status interface
   */
  getStatus(): { 
    isPlaying: boolean; 
    currentWordIndex: number; 
    totalWords: number; 
    contentHash: string 
  } {
    let currentWordIndex = -1;
    
    // Calculate current word index if audio is playing and we have timings
    if (this.playing && this.audio && this.wordTimings.length > 0) {
      const currentTimeMs = this.audio.currentTime * 1000;
      currentWordIndex = this.wordTimings.findIndex(timing => 
        currentTimeMs >= timing.startTime && currentTimeMs <= timing.endTime
      );
    }
    
    return {
      isPlaying: this.playing,
      currentWordIndex,
      totalWords: this.wordTimings.length,
      contentHash: this.currentHash || ''
    };
  }
  
  stop(): void {
    if (this.audio) {
      try {
        this.audio.pause();
        this.audio.currentTime = 0;
      } catch {}
    }
    
    if (this.currentUrl) {
      try {
        URL.revokeObjectURL(this.currentUrl);
      } catch {}
      this.currentUrl = null;
    }
    
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        speechSynthesis.cancel();
      } catch {}
    }
    
    this.stopWordHighlighting();
    this.playing = false;
    
    // Clear state to prevent conflicts between components
    this.wordTimings = [];
    this.currentHash = null;
    
    // Dispatch audio state change for UI synchronization
    window.dispatchEvent(new CustomEvent('audio:statechange', { 
      detail: { isPlaying: false } 
    }));
    
    DebugLogger.log('audio', '🛑 Charlotte voice stopped');
  }

  isPlaying(): boolean {
    return this.playing;
  }

  /**
   * Legacy SimplifiedAudioEngine method aliases for backward compatibility
   */
  stopAudio(): void {
    this.stop();
  }

  async playText(text: string, contentHash: string): Promise<void> {
    return this.playTextWithSynchronization({ text, contentHash });
  }

  static clearAllRequests(): void {
    this.processingRequests.clear();
    DebugLogger.log('audio', '🧹 Cleared all Charlotte voice requests');
  }
}

// Initialize and expose singleton
export const charlotteVoiceService = CharlotteVoiceService.getInstance();