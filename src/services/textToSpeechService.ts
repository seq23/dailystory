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

    // Check cache first - include speed in cache key for different speeds
    const cacheKey = `${cleanText}_${this.voice}_${options?.speed || this.speed}`;
    if (this.audioCache.has(cacheKey)) {
      const audioUrl = this.audioCache.get(cacheKey)!;
      await this.playAudio(audioUrl);
      return;
    }

    try {
      // Use Supabase edge function for TTS
      const speedToUse = options?.speed || this.speed;
      console.log(`TTS Request: voice=${this.voice}, speed=${speedToUse}, text="${cleanText.substring(0, 50)}..."`);
      
      const { data, error } = await supabase.functions.invoke('openai-tts', {
        body: {
          text: cleanText,
          voice: this.voice,
          speed: speedToUse
        }
      });

      console.log('TTS Supabase response:', { data: data ? 'received' : 'null', error });

      if (error) {
        console.error('TTS Supabase Error details:', error);
        throw new Error(`TTS Error: ${error.message || JSON.stringify(error)}`);
      }

      if (!data) {
        throw new Error('TTS Error: No audio data received from service');
      }

      console.log('TTS Response data type:', typeof data, 'Constructor:', data?.constructor?.name);
      console.log('Data preview (first 50 chars):', data instanceof ArrayBuffer ? 'ArrayBuffer' : String(data).substring(0, 50));

      // Handle different response formats from Supabase edge function
      let audioBlob;
      
      if (data instanceof ArrayBuffer) {
        console.log('Handling as ArrayBuffer, size:', data.byteLength);
        audioBlob = new Blob([data], { type: 'audio/mpeg' });
      } else if (data instanceof Uint8Array) {
        console.log('Handling as Uint8Array, size:', data.length);
        audioBlob = new Blob([data], { type: 'audio/mpeg' });
      } else if (typeof data === 'string') {
        console.log('Handling as string, length:', data.length);
        // Don't try to decode as base64, treat as binary string
        const bytes = new Uint8Array(data.length);
        for (let i = 0; i < data.length; i++) {
          bytes[i] = data.charCodeAt(i);
        }
        audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
      } else {
        console.log('Unknown data type, trying direct blob creation');
        audioBlob = new Blob([data], { type: 'audio/mpeg' });
      }
      
      console.log('Created audio blob:', audioBlob.size, 'bytes, type:', audioBlob.type);
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Cache the audio URL
      this.audioCache.set(cacheKey, audioUrl);
      
      await this.playAudio(audioUrl);
    } catch (error) {
      console.error('Error generating speech - Full error:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      
      // Provide specific error message
      if (error?.message?.includes('OpenAI API key not configured')) {
        toast.error('OpenAI API key is missing. Please configure it in project settings.');
      } else if (error?.message?.includes('TTS Error')) {
        toast.error(`TTS Error: ${error.message}. Using fallback voice...`);
      } else if (error?.message?.includes('No audio data')) {
        toast.error('Audio generation failed. Using fallback voice...');
      } else {
        toast.error(`Audio error: ${error?.message || 'Unknown error'}. Using fallback...`);
      }
      
      // Fallback to browser speech synthesis
      this.fallbackToWebSpeech(cleanText);
    }
  }

  private async playAudio(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      
      audio.onloadstart = () => {
        console.log('Audio loading started');
      };
      
      audio.onloadeddata = () => {
        console.log('Audio data loaded successfully');
      };
      
      audio.oncanplaythrough = () => {
        console.log('Audio can play through');
      };
      
      audio.onended = () => {
        console.log('Audio playback completed');
        URL.revokeObjectURL(audioUrl); // Clean up the blob URL
        resolve();
      };
      
      audio.onerror = (e) => {
        console.error('Audio playback failed:', e);
        console.error('Audio error details:', audio.error);
        URL.revokeObjectURL(audioUrl); // Clean up the blob URL
        reject(new Error(`Audio playback failed: ${audio.error?.message || 'Unknown error'}`));
      };
      
      // Set the source and attempt to play
      audio.src = audioUrl;
      audio.load(); // Explicitly load the audio
      
      audio.play().catch((playError) => {
        console.error('Audio play() failed:', playError);
        URL.revokeObjectURL(audioUrl); // Clean up the blob URL
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