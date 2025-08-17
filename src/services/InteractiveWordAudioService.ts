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
      
      // Request audio control with dedicated channel
      window.dispatchEvent(new CustomEvent('audio:request', { 
        detail: { system: 'interactive-word', priority: 'high' } 
      }));

      // Slight delay to ensure audio coordination
      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        // Try SmartElevenLabsTTS first with learning context for clear pronunciation
        const audioBuffer = await SmartElevenLabsTTS.generateLearningSpeech(cleanWord);
        await this.playAudioBuffer(audioBuffer);
        console.log(`✅ SmartTTS success for word: ${cleanWord}`);
      } catch (smartError) {
        console.warn(`⚠️ SmartTTS failed for "${cleanWord}":`, smartError);
        
        // Fallback to SimpleAudioEngine
        const audioEngine = SimpleAudioEngine.getInstance();
        const processedWord = contextualPronunciation.processTextForPronunciation(cleanWord, false);
        
        await audioEngine.playText({
          text: processedWord,
          voiceId: 'XB0fDUnXU5powFXDhCwa', // Charlotte
          contentHash: `hear-${cleanWord}-${Date.now()}`
        });
        console.log(`✅ SimpleAudioEngine fallback success for: ${cleanWord}`);
      }

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
      
      // Request audio control
      window.dispatchEvent(new CustomEvent('audio:request', { 
        detail: { system: 'interactive-word', priority: 'high' } 
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

      // Slight delay to ensure audio coordination
      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        // Use SmartTTS for conversation-style definition
        const explanationText = `${cleanWord} means: ${definition.definition}`;
        const audioBuffer = await SmartElevenLabsTTS.generateConversationSpeech(explanationText);
        await this.playAudioBuffer(audioBuffer);
        console.log(`✅ SmartTTS explanation success for: ${cleanWord}`);
        
      } catch (smartError) {
        console.warn(`⚠️ SmartTTS failed for explanation of "${cleanWord}":`, smartError);
        
        // Fallback to SimpleAudioEngine
        const audioEngine = SimpleAudioEngine.getInstance();
        const explanationText = definition.definition;
        const processedText = contextualPronunciation.processTextForPronunciation(explanationText, true);
        
        await audioEngine.playText({
          text: processedText,
          voiceId: 'XB0fDUnXU5powFXDhCwa', // Charlotte
          contentHash: `explain-${cleanWord}-${Date.now()}`
        });
        console.log(`✅ SimpleAudioEngine explanation fallback success for: ${cleanWord}`);
      }

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
      
      // Request audio control
      window.dispatchEvent(new CustomEvent('audio:request', { 
        detail: { system: 'interactive-word', priority: 'high' } 
      }));

      // Get syllables using the async method for consistency
      const syllables = await phoneticRulesEngine.breakIntoSyllablesAsync(cleanWord);
      
      if (!syllables || syllables.length === 0) {
        throw new Error('No syllables found');
      }

      const syllableCount = syllables.length;
      const syllableText = syllables.join(' - ');
      const fullResponse = `${cleanWord} has ${syllableCount} syllable${syllableCount !== 1 ? 's' : ''}: ${syllableText}`;

      console.log(`🔤 Syllables for "${cleanWord}": ${syllableText}`);

      // Slight delay to ensure audio coordination
      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        // Use SmartTTS for conversation-style syllable breakdown
        const audioBuffer = await SmartElevenLabsTTS.generateConversationSpeech(fullResponse);
        await this.playAudioBuffer(audioBuffer);
        console.log(`✅ SmartTTS syllables success for: ${cleanWord}`);
        
      } catch (smartError) {
        console.warn(`⚠️ SmartTTS failed for syllables of "${cleanWord}":`, smartError);
        
        // Fallback to SimpleAudioEngine
        const audioEngine = SimpleAudioEngine.getInstance();
        
        await audioEngine.playText({
          text: fullResponse,
          voiceId: 'XB0fDUnXU5powFXDhCwa', // Charlotte
          contentHash: `syllables-${cleanWord}-${Date.now()}`
        });
        console.log(`✅ SimpleAudioEngine syllables fallback success for: ${cleanWord}`);
      }

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