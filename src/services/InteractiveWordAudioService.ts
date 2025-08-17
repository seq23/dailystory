/**
 * Dedicated Interactive Word Audio Service
 * Handles "hear it", "explain", and "syllables" button actions with proper audio coordination
 * Bypasses VoiceHoverController interference and provides direct audio paths
 */
import { SimpleAudioEngine } from '@/services/SimpleAudioEngine';
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

      // Use SimpleAudioEngine directly for reliable coordination
      const audioEngine = SimpleAudioEngine.getInstance();
      await audioEngine.playText({
        text: cleanWord,
        voiceId: 'XB0fDUnXU5powFXDhCwa', // Charlotte
        contentHash: `hear-${cleanWord}-${Date.now()}`,
        modelId: 'eleven_turbo_v2_5'
      });
      console.log(`✅ Successfully played word: ${cleanWord}`);

    } catch (error) {
      console.error(`❌ Failed to play word "${word}":`, error);
      
      if (retryCount < 2) {
        console.log(`🔄 Retrying hear word (attempt ${retryCount + 1})`);
        setTimeout(() => this.hearWord(word, retryCount + 1), 500);
        return;
      }
      
      // Final fallback to browser speech
      this.fallbackToBrowserSpeech(word);
      
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
  static async explainWord(word: string, retryCount = 0): Promise<void> {
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
          language: 'en',
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

      // Use SimpleAudioEngine directly for reliable coordination
      const audioEngine = SimpleAudioEngine.getInstance();
      await audioEngine.playText({
        text: definition.definition,
        voiceId: 'XB0fDUnXU5powFXDhCwa', // Charlotte
        contentHash: definition.definition.substring(0, 20),
        modelId: 'eleven_turbo_v2_5'
      });
      console.log(`✅ Successfully explained word: ${cleanWord}`);

    } catch (error) {
      console.error(`❌ Failed to explain word "${word}":`, error);
      
      if (retryCount < 2) {
        console.log(`🔄 Retrying explain word (attempt ${retryCount + 1})`);
        setTimeout(() => this.explainWord(word, retryCount + 1), 500);
        return;
      }
      
      // Final fallback
      this.fallbackToBrowserSpeech(`Sorry, I couldn't find the definition for ${word}`);
      
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

      // Use SimpleAudioEngine directly for reliable coordination
      const audioEngine = SimpleAudioEngine.getInstance();
      await audioEngine.playText({
        text: syllableText,
        voiceId: 'XB0fDUnXU5powFXDhCwa', // Charlotte
        contentHash: syllableText,
        modelId: 'eleven_turbo_v2_5'
      });
      console.log(`✅ Successfully played syllables: ${syllableText}`);

    } catch (error) {
      console.error(`❌ Failed to break word "${word}" into syllables:`, error);
      
      if (retryCount < 2) {
        console.log(`🔄 Retrying syllables (attempt ${retryCount + 1})`);
        setTimeout(() => this.syllableWord(word, retryCount + 1), 500);
        return;
      }
      
      // Final fallback
      this.fallbackToBrowserSpeech(`Sorry, I couldn't break down ${word} into syllables`);
      
    } finally {
      // Release audio control
      window.dispatchEvent(new CustomEvent('audio:stopped', { 
        detail: { system: 'interactive-word' } 
      }));
      this.processingRequests.delete(requestId);
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
  private static fallbackToBrowserSpeech(text: string): void {
    console.log(`🗣️ Browser speech fallback: "${text}"`);
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any current speech
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      
      // Try to find a good voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith('en') && 
        (voice.name.includes('Female') || voice.name.includes('Google'))
      ) || voices.find(voice => voice.lang.startsWith('en'));
      
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