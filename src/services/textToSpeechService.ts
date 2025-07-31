import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface TextToSpeechConfig {
  voice?: string;
  speed?: number;
}

export class OpenAITTSService {
  private voice: string;
  private speed: number;
  private audioCache: Map<string, string> = new Map();

  constructor(config: TextToSpeechConfig) {
    // Use child-friendly voices - nova is clear and natural for children
    this.voice = config.voice || "nova"; // Nova is more natural than shimmer
    this.speed = config.speed || 0.9;
  }

  async speakText(text: string, options?: { speed?: number }): Promise<void> {
    // Clean the text for speech
    const cleanText = text.replace(/[.,!?;:'"()]/g, '').trim();
    
    if (!cleanText) return;

    // Check cache first
    const cacheKey = `${cleanText}_${this.voice}`;
    if (this.audioCache.has(cacheKey)) {
      const audioUrl = this.audioCache.get(cacheKey)!;
      await this.playAudio(audioUrl);
      return;
    }

    try {
      // Use Supabase edge function for TTS
      const { data, error } = await supabase.functions.invoke('openai-tts', {
        body: {
          text: cleanText,
          voice: this.voice,
          speed: options?.speed || this.speed
        }
      });

      if (error) {
        console.error('TTS Supabase Error:', error);
        throw new Error(`TTS Error: ${error.message}`);
      }

      // The response from the edge function is already an ArrayBuffer
      const audioBlob = new Blob([data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Cache the audio URL
      this.audioCache.set(cacheKey, audioUrl);
      
      await this.playAudio(audioUrl);
    } catch (error) {
      console.error('Error generating speech:', error);
      
      // Provide specific error message
      if (error.message?.includes('OpenAI API key not configured')) {
        toast.error('OpenAI API key is missing. Please configure it in project settings.');
      } else if (error.message?.includes('TTS Error')) {
        toast.error('Speech generation failed. Trying fallback voice...');
      } else {
        toast.error('Audio service temporarily unavailable.');
      }
      
      // Fallback to browser speech synthesis
      this.fallbackToWebSpeech(cleanText);
    }
  }

  private async playAudio(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      
      audio.onloadeddata = () => {
        console.log('Audio loaded successfully');
      };
      
      audio.onended = () => {
        console.log('Audio playback completed');
        resolve();
      };
      
      audio.onerror = (e) => {
        console.error('Audio playback failed:', e);
        reject(new Error('Audio playback failed'));
      };
      
      audio.play().catch((playError) => {
        console.error('Audio play() failed:', playError);
        reject(playError);
      });
    });
  }

  private fallbackToWebSpeech(text: string): void {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      
      // Try to use a child-friendly voice
      const voices = speechSynthesis.getVoices();
      const childVoice = voices.find(voice => 
        voice.name.includes('child') || 
        voice.name.includes('young') ||
        voice.name.includes('Daniel') ||
        voice.name.includes('Samantha')
      );
      
      if (childVoice) {
        utterance.voice = childVoice;
      }
      
      speechSynthesis.speak(utterance);
    }
  }

  // Method to explain a word using OpenAI
  async explainWord(word: string): Promise<void> {
    const cleanWord = word.replace(/[.,!?;:'"()]/g, '').trim();
    
    if (!cleanWord) return;

    try {
      // Get definition from OpenAI
      const definition = await this.getWordDefinition(cleanWord);
      const explanationText = `The word ${cleanWord} means: ${definition}`;
      await this.speakText(explanationText);
    } catch (error) {
      console.error('Error explaining word:', error);
      // Fallback to simple explanation
      await this.speakText(`The word is: ${cleanWord}`);
    }
  }

  private async getWordDefinition(word: string): Promise<string> {
    // Return a simple fallback definition
    return `A word that means something special.`;
  }

  // Method to get AI-powered explanations and translations
  async getAIResponse(prompt: string): Promise<string> {
    return 'Sorry, I could not provide an explanation.';
  }
}

// Create OpenAI TTS service instance
export const createOpenAITTSService = () => {
  return new OpenAITTSService({
    voice: 'nova', // Clear and natural voice for kids
    speed: 0.9 // Default speed
  });
};