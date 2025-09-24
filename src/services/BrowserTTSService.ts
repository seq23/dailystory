/**
 * UNIFIED BROWSER TTS SERVICE
 * Handles browser-based text-to-speech for all languages
 * Cost-effective alternative to ElevenLabs for non-English users
 */
import { DebugLogger } from '@/services/DebugLogger';
import type { SupportedLanguage } from '@/types/multilingual';

interface BrowserTTSOptions {
  text: string;
  language: SupportedLanguage;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export class BrowserTTSService {
  private static instance: BrowserTTSService | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isPlaying = false;

  // Language code mapping for browser TTS
  private static readonly LANGUAGE_CODES: Record<SupportedLanguage, string> = {
    'en': 'en-US',
    'es': 'es-ES',
    'fr': 'fr-FR', 
    'ar': 'ar-SA',
    'zh': 'zh-CN',
    'hi': 'hi-IN',
    'pt': 'pt-BR'
  };

  static getInstance(): BrowserTTSService {
    if (!this.instance) {
      this.instance = new BrowserTTSService();
    }
    return this.instance;
  }

  /**
   * Main method to speak text using browser TTS
   */
  async speak(options: BrowserTTSOptions): Promise<void> {
    const { text, language, rate = 0.8, pitch = 1, volume = 1 } = options;

    if (!('speechSynthesis' in window)) {
      DebugLogger.error('audio', 'Browser TTS not supported');
      throw new Error('Browser TTS not supported');
    }

    // Stop any current speech
    this.stop();

    return new Promise((resolve, reject) => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        this.currentUtterance = utterance;

        // Configure utterance
        utterance.lang = BrowserTTSService.LANGUAGE_CODES[language] || 'en-US';
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = volume;

        // Simplified voice selection - use browser default for reliability
        // Language is already set via utterance.lang which provides good results

        utterance.onstart = () => {
          this.isPlaying = true;
          DebugLogger.log('audio', 'Browser TTS started', { language, text: text.substring(0, 50) });
        };

        utterance.onend = () => {
          this.isPlaying = false;
          this.currentUtterance = null;
          DebugLogger.log('audio', 'Browser TTS completed');
          resolve();
        };

        utterance.onerror = (event) => {
          this.isPlaying = false;
          this.currentUtterance = null;
          DebugLogger.error('audio', 'Browser TTS error', event);
          reject(new Error(`Browser TTS error: ${event.error}`));
        };

        // Start speech
        speechSynthesis.speak(utterance);

      } catch (error) {
        this.isPlaying = false;
        this.currentUtterance = null;
        DebugLogger.error('audio', 'Browser TTS speak failed', error);
        reject(error);
      }
    });
  }

  /**
   * Stop any current speech
   */
  stop(): void {
    if ('speechSynthesis' in window) {
      try {
        speechSynthesis.cancel();
        this.isPlaying = false;
        this.currentUtterance = null;
        DebugLogger.log('audio', 'Browser TTS stopped');
      } catch (error) {
        DebugLogger.error('audio', 'Error stopping browser TTS', error);
      }
    }
  }

  /**
   * Check if currently playing
   */
  getIsPlaying(): boolean {
    return this.isPlaying && speechSynthesis.speaking;
  }

  /**
   * Get available voices for a language (simplified)
   */
  getVoicesForLanguage(language: SupportedLanguage): SpeechSynthesisVoice[] {
    // Simplified implementation - browser handles voice selection automatically
    return [];
  }

  /**
   * Convenience method to speak a word with pronunciation
   */
  async speakWord(word: string, language: SupportedLanguage): Promise<void> {
    return this.speak({
      text: word,
      language,
      rate: 0.7, // Slower rate for individual words
      pitch: 1,
      volume: 1
    });
  }

  /**
   * Convenience method to speak an explanation
   */
  async speakExplanation(explanation: string, language: SupportedLanguage): Promise<void> {
    return this.speak({
      text: explanation,
      language,
      rate: 0.8,
      pitch: 1,
      volume: 1
    });
  }

  /**
   * Convenience method for coach introductions and feedback
   */
  async speakCoachMessage(message: string, language: SupportedLanguage): Promise<void> {
    return this.speak({
      text: message,
      language,
      rate: 0.9, // Slightly faster for coach messages
      pitch: 1,
      volume: 1
    });
  }
}

// Export singleton instance
export const browserTTSService = BrowserTTSService.getInstance();