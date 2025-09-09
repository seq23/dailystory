/**
 * Interactive Word Audio Service
 * Handles "hear it", "explain", and "syllables" button actions with direct TTS calls
 * Uses SmartElevenLabsTTS directly for fast 2-3 second response times
 */
import { SmartElevenLabsTTS } from '@/services/smartElevenLabsTTS';
import { supabase } from '@/integrations/supabase/client';
import { phoneticRulesEngine } from '@/services/phoneticRulesEngine';
import { contextualPronunciation } from '@/services/contextualPronunciation';

export class InteractiveWordAudioService {
  private static processingRequests = new Set<string>();
  private static requestCounter = 0;

  /**
   * Play word pronunciation directly without interference
   */
  static async hearWord(word: string, retryCount = 0): Promise<void> {
    const requestId = `hear-${word}-${++this.requestCounter}`;
    
    if (this.processingRequests.has(requestId)) {
      console.log(`🔒 Already processing hear request for: ${word}`);
      return;
    }

    this.processingRequests.add(requestId);
    console.log(`🔊 Direct HEAR request: "${word}" [Request: ${requestId}]`);

    try {
      const cleanWord = word.replace(/[.,!?;:'"()]/g, '').trim();
      
      // Request audio control with high priority for direct button actions
      window.dispatchEvent(new CustomEvent('audio:request', { 
        detail: { system: 'interactive-word', priority: 5, source: 'direct-button' } 
      }));

      // Add 5-second timeout for interactive word requests
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Interactive word timeout - using browser fallback')), 5000);
      });

      // Use direct TTS for fast response (2-3 seconds)
      await Promise.race([
        this.playDirectTTS(cleanWord, 'XB0fDUnXU5powFXDhCwa'),
        timeoutPromise
      ]);
      console.log(`✅ Successfully played word: ${cleanWord}`);

    } catch (error) {
      console.error(`❌ Failed to play word "${word}":`, error);
      
      if (retryCount < 2) {
        console.log(`🔄 Retrying hear word (attempt ${retryCount + 1})`);
        setTimeout(() => this.hearWord(word, retryCount + 1), 500);
        return;
      }
      
      // Final fallback to browser speech
      this.fallbackToBrowserSpeech(word, 'en');
      
    } finally {
      // Release audio control
      window.dispatchEvent(new CustomEvent('audio:stopped', { 
        detail: { system: 'interactive-word' } 
      }));
      this.processingRequests.delete(requestId);
    }
  }

  /**
   * Explain word meaning with audio
   */
  static async explainWord(word: string, userLanguage: string = 'en', retryCount = 0): Promise<void> {
    const requestId = `explain-${word}-${++this.requestCounter}`;
    
    if (this.processingRequests.has(requestId)) {
      console.log(`🔒 Already processing explain request for: ${word}`);
      return;
    }

    this.processingRequests.add(requestId);
    console.log(`📖 Direct EXPLAIN request: "${word}" [Request: ${requestId}]`);

    try {
      const cleanWord = word.replace(/[.,!?;:'"()]/g, '').trim();
      
      // Request audio control with high priority for direct button actions
      window.dispatchEvent(new CustomEvent('audio:request', { 
        detail: { system: 'interactive-word', priority: 5, source: 'direct-button' } 
      }));

      // Get word definition
      const { data: definition, error } = await supabase.functions.invoke('word-dictionary', {
        body: { 
          word: cleanWord.toLowerCase(),
          userLanguage: userLanguage,
          userLevel: 'beginner'
        }
      });

      if (error) {
        throw new Error(`Dictionary API error: ${error.message}`);
      }

      if (!definition?.definition) {
        throw new Error('No definition found');
      }

      console.log(`📖 Got definition for "${cleanWord}": ${definition.definition}`);

      // Add 5-second timeout for explanations
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Explain word timeout - using browser fallback')), 5000);
      });

      // Use direct TTS for fast response (3-4 seconds including dictionary lookup)
      await Promise.race([
        this.playDirectTTS(definition.definition, 'XB0fDUnXU5powFXDhCwa'),
        timeoutPromise
      ]);
      console.log(`✅ Successfully explained word: ${cleanWord}`);

    } catch (error) {
      console.error(`❌ Failed to explain word "${word}":`, error);
      
      if (retryCount < 2) {
        console.log(`🔄 Retrying explain word (attempt ${retryCount + 1})`);
        setTimeout(() => this.explainWord(word, userLanguage, retryCount + 1), 500);
        return;
      }
      
      // Final fallback with correct language
      this.fallbackToBrowserSpeech(`Sorry, I couldn't find the definition for ${word}`, userLanguage);
      
    } finally {
      // Release audio control
      window.dispatchEvent(new CustomEvent('audio:stopped', { 
        detail: { system: 'interactive-word' } 
      }));
      this.processingRequests.delete(requestId);
    }
  }

  /**
   * Break word into syllables with audio
   */
  static async syllableWord(word: string, retryCount = 0): Promise<void> {
    const requestId = `syllables-${word}-${++this.requestCounter}`;
    
    if (this.processingRequests.has(requestId)) {
      console.log(`🔒 Already processing syllables request for: ${word}`);
      return;
    }

    this.processingRequests.add(requestId);
    console.log(`🔤 Direct SYLLABLES request: "${word}" [Request: ${requestId}]`);

    try {
      const cleanWord = word.replace(/[.,!?;:'"()]/g, '').trim();
      
      // Request audio control with high priority for direct button actions
      window.dispatchEvent(new CustomEvent('audio:request', { 
        detail: { system: 'interactive-word', priority: 5, source: 'direct-button' } 
      }));

      // Get syllables using the async method for consistency
      const syllables = await phoneticRulesEngine.breakIntoSyllablesAsync(cleanWord);
      
      if (!syllables || syllables.length === 0) {
        throw new Error('No syllables found');
      }

      const syllableText = syllables.join(' - ');
      console.log(`🔤 Syllables for "${cleanWord}": ${syllableText}`);

      // Add 5-second timeout for syllables
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Syllables timeout - using browser fallback')), 5000);
      });

      // Use direct TTS for fast response (2-3 seconds)
      await Promise.race([
        this.playDirectTTS(syllableText, 'XB0fDUnXU5powFXDhCwa'),
        timeoutPromise
      ]);
      console.log(`✅ Successfully played syllables: ${syllableText}`);

    } catch (error) {
      console.error(`❌ Failed to break word "${word}" into syllables:`, error);
      
      if (retryCount < 2) {
        console.log(`🔄 Retrying syllables (attempt ${retryCount + 1})`);
        setTimeout(() => this.syllableWord(word, retryCount + 1), 500);
        return;
      }
      
      // Final fallback
      this.fallbackToBrowserSpeech(`Sorry, I couldn't break down ${word} into syllables`, 'en');
      
    } finally {
      // Release audio control
      window.dispatchEvent(new CustomEvent('audio:stopped', { 
        detail: { system: 'interactive-word' } 
      }));
      this.processingRequests.delete(requestId);
    }
  }

  /**
   * Play audio directly using SmartElevenLabsTTS for fast response
   */
  private static async playDirectTTS(text: string, voiceId: string): Promise<void> {
    console.log(`🎵 Playing direct TTS: "${text}"`);
    
    try {
      // Generate audio buffer using conversation context (fast, no dictionary)
      const audioBuffer = await SmartElevenLabsTTS.generateConversationSpeech(text, voiceId);
      
      // Create and play audio
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      // Wait for audio to finish
      await new Promise<void>((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          reject(new Error('Audio playback failed'));
        };
        audio.play().catch(reject);
      });
      
    } catch (error) {
      console.error('Direct TTS failed, using browser fallback:', error);
      this.fallbackToBrowserSpeech(text);
    }
  }

  /**
   * Play audio buffer directly
   */
  private static async playAudioBuffer(audioBuffer: ArrayBuffer): Promise<void> {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioData = await audioContext.decodeAudioData(audioBuffer);
    const source = audioContext.createBufferSource();
    source.buffer = audioData;
    source.connect(audioContext.destination);
    
    return new Promise((resolve, reject) => {
      source.onended = () => resolve();
      source.onerror = reject;
      source.start();
    });
  }

  /**
   * Browser speech synthesis fallback
   */
  private static fallbackToBrowserSpeech(text: string, userLanguage: string = 'en'): void {
    console.log(`🗣️ Browser speech fallback: "${text}"`);
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any current speech
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      
      // Try to find a good voice in the user's language
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith(userLanguage) && 
        (voice.name.includes('Female') || voice.name.includes('Google'))
      ) || voices.find(voice => voice.lang.startsWith(userLanguage)) || 
      voices.find(voice => voice.lang.startsWith('en')); // Fallback to English
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    } else {
      console.error('❌ Browser speech synthesis not available');
    }
  }

  /**
   * Clear all processing requests (cleanup)
   */
  static clearAllRequests(): void {
    this.processingRequests.clear();
    console.log('🧹 Cleared all interactive word audio requests');
  }
}