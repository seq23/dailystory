import { toast } from "sonner";

export interface TextToSpeechConfig {
  apiKey: string;
  voice?: string;
  model?: string;
}

export class OpenAITTSService {
  private apiKey: string;
  private voice: string;
  private model: string;
  private audioCache: Map<string, string> = new Map();

  constructor(config: TextToSpeechConfig) {
    this.apiKey = config.apiKey;
    // Use child-friendly voices - fable is perfect for storytelling
    this.voice = config.voice || "fable"; // Available: alloy, echo, fable, onyx, nova, shimmer
    this.model = config.model || "tts-1"; // tts-1 for speed, tts-1-hd for quality
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
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          input: cleanText,
          voice: this.voice,
          response_format: 'mp3',
          speed: options?.speed || 0.9 // Use provided speed or default
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          throw new Error('OpenAI API quota exceeded. Please check your billing.');
        }
        throw new Error(`OpenAI TTS API error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Cache the audio URL
      this.audioCache.set(cacheKey, audioUrl);
      
      await this.playAudio(audioUrl);
    } catch (error) {
      console.error('Error generating speech:', error);
      toast.error('Failed to generate speech. Please check your API key.');
      
      // Fallback to browser speech synthesis
      this.fallbackToWebSpeech(cleanText);
    }
  }

  private async playAudio(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error('Audio playback failed'));
      audio.play().catch(reject);
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
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that creates simple, child-friendly definitions for words. Keep definitions under 15 words and use simple language that a child can understand. Be clear and concise.'
            },
            {
              role: 'user',
              content: `Define the word "${word}" in simple terms for a child.`
            }
          ],
          max_tokens: 50,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content?.trim() || `A word that means something special.`;
    } catch (error) {
      console.error('Error generating definition:', error);
      throw error;
    }
  }

  // Method to get AI-powered explanations and translations
  async getAIResponse(prompt: string): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant for children learning English. Provide clear, accurate, and age-appropriate responses.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 100,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content?.trim() || 'Sorry, I could not provide an explanation.';
    } catch (error) {
      console.error('Error getting AI response:', error);
      throw error;
    }
  }
}

// Create OpenAI TTS service instance
export const createOpenAITTSService = () => {
  const OPENAI_API_KEY = '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';
  
  return new OpenAITTSService({
    apiKey: OPENAI_API_KEY,
    voice: 'fable', // Perfect storytelling voice for kids
    model: 'tts-1' // Fast model
  });
};