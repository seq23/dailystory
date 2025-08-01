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
      // Use Supabase functions.invoke for proper authentication
      const speedToUse = options?.speed || this.speed;
      console.log(`TTS Request: voice=${this.voice}, speed=${speedToUse}, text="${cleanText.substring(0, 50)}..."`);
      
      const { data, error } = await supabase.functions.invoke('openai-tts', {
        body: JSON.stringify({
          text: cleanText,
          voice: this.voice,
          speed: speedToUse
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) {
        console.error('TTS Supabase Error:', error);
        throw new Error(`TTS Error: ${error.message}`);
      }

      
      if (!data || !data.audioContent) {
        throw new Error('No audio data received from TTS service');
      }

      console.log('Received audio data successfully');

      // Convert base64 audio data to blob
      const audioBuffer = Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0));
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
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

  // Method to explain a word using the word dictionary service
  async explainWord(word: string, userLevel: 'easy' | 'medium' | 'hard' = 'easy'): Promise<void> {
    const cleanWord = word.replace(/[.,!?;:'"()]/g, '').trim();
    
    if (!cleanWord) return;

    try {
      // Get comprehensive word data from dictionary service
      const { data, error } = await supabase.functions.invoke('word-dictionary', {
        body: JSON.stringify({
          word: cleanWord,
          userLevel: userLevel
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) {
        console.error('Dictionary service error:', error);
        throw new Error('Failed to get word definition');
      }

      const wordData = data;
      
      // Create comprehensive explanation text
      const explanationText = `The word ${cleanWord} is pronounced ${wordData.phonetic}. It means: ${wordData.definition}. Here's an example: ${wordData.sampleSentence}`;
      
      await this.speakText(explanationText);
    } catch (error) {
      console.error('Error explaining word:', error);
      // Fallback to simple explanation
      await this.speakText(`The word is: ${cleanWord}`);
    }
  }

  // Method to get word definition data without speaking
  async getWordData(word: string, userLevel: 'easy' | 'medium' | 'hard' = 'easy'): Promise<any> {
    const cleanWord = word.replace(/[.,!?;:'"()]/g, '').trim();
    
    if (!cleanWord) return null;

    try {
      const { data, error } = await supabase.functions.invoke('word-dictionary', {
        body: JSON.stringify({
          word: cleanWord,
          userLevel: userLevel
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) {
        console.error('Dictionary service error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting word data:', error);
      return null;
    }
  }

  // Method to pronounce just the word
  async pronounceWord(word: string): Promise<void> {
    const cleanWord = word.replace(/[.,!?;:'"()]/g, '').trim();
    
    if (!cleanWord) return;

    try {
      await this.speakText(cleanWord);
    } catch (error) {
      console.error('Error pronouncing word:', error);
    }
  }

  private async getWordDefinition(word: string): Promise<string> {
    try {
      const wordData = await this.getWordData(word);
      return wordData ? wordData.definition : 'A word that means something special.';
    } catch (error) {
      return 'A word that means something special.';
    }
  }
}

// Create OpenAI TTS service instance
export const createOpenAITTSService = () => {
  return new OpenAITTSService({
    voice: 'nova', // Clear and natural voice for kids
    speed: 0.9 // Default speed
  });
};