import { toast } from "sonner";

export interface TextToSpeechConfig {
  apiKey: string;
  voiceId?: string;
  model?: string;
}

export class ElevenLabsService {
  private apiKey: string;
  private voiceId: string;
  private model: string;
  private audioCache: Map<string, string> = new Map();

  constructor(config: TextToSpeechConfig) {
    this.apiKey = config.apiKey;
    // Use child-friendly voices - Charlie is great for children's content
    this.voiceId = config.voiceId || "IKne3meq5aSn9XLyUdCD"; // Charlie
    this.model = config.model || "eleven_turbo_v2_5"; // Fast, multilingual model
  }

  async speakText(text: string): Promise<void> {
    // Clean the text for speech
    const cleanText = text.replace(/[.,!?;:'"()]/g, '').trim();
    
    if (!cleanText) return;

    // Check cache first
    const cacheKey = `${cleanText}_${this.voiceId}`;
    if (this.audioCache.has(cacheKey)) {
      const audioUrl = this.audioCache.get(cacheKey)!;
      await this.playAudio(audioUrl);
      return;
    }

    try {
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + this.voiceId, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: this.model,
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.75,
            style: 0.2,
            use_speaker_boost: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
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

  // Method to explain a word with definition and pronunciation
  async explainWord(word: string, definition?: string): Promise<void> {
    const cleanWord = word.replace(/[.,!?;:'"()]/g, '').trim();
    
    if (!cleanWord) return;

    let explanationText = `The word is: ${cleanWord}.`;
    
    if (definition) {
      explanationText += ` ${definition}`;
    } else {
      // Simple definitions for common words
      const simpleDefinitions: Record<string, string> = {
        'happy': 'This means feeling good and joyful.',
        'sad': 'This means feeling unhappy or down.',
        'big': 'This means very large in size.',
        'small': 'This means not very large, tiny.',
        'run': 'This means to move very fast with your legs.',
        'walk': 'This means to move by putting one foot in front of the other.',
        'beautiful': 'This means very pretty and nice to look at.',
        'magic': 'This means something wonderful and mysterious.',
        'friend': 'This means someone you like and who likes you too.',
        'adventure': 'This means an exciting journey or experience.',
        'discover': 'This means to find something new.',
        'wonderful': 'This means really, really good.',
        'important': 'This means something that matters a lot.',
        'together': 'This means being with someone else.',
        'special': 'This means different in a good way.'
      };
      
      const simpleDef = simpleDefinitions[cleanWord.toLowerCase()];
      if (simpleDef) {
        explanationText += ` ${simpleDef}`;
      }
    }

    await this.speakText(explanationText);
  }
}

// AI-powered word definition service
const generateAIDefinition = async (word: string): Promise<string | undefined> => {
  const OPENAI_API_KEY = 'your-openai-api-key-here'; // Replace with your actual OpenAI API key
  
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your-openai-api-key-here') {
    return undefined;
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates simple, child-friendly definitions for words. Keep definitions under 15 words and use simple language that a child can understand.'
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
    return data.choices[0]?.message?.content?.trim();
  } catch (error) {
    console.error('Error generating AI definition:', error);
    return undefined;
  }
};

// Word definition service for explanations
export const getWordDefinition = async (word: string): Promise<string | undefined> => {
  // First check static definitions
  const staticDefinitions: Record<string, string> = {
    'adventure': 'An exciting journey or experience with new discoveries.',
    'beautiful': 'Something that is very pretty and nice to look at.',
    'courage': 'Being brave even when you feel scared.',
    'discover': 'To find something new or learn about it for the first time.',
    'enormous': 'Something that is very, very big.',
    'fantastic': 'Something that is wonderful and amazing.',
    'generous': 'Being kind and willing to share with others.',
    'helpful': 'Being willing to help others when they need it.',
    'important': 'Something that matters a lot and is significant.',
    'journey': 'A trip or adventure from one place to another.',
    'kindness': 'Being nice and caring toward others.',
    'laughter': 'The happy sound you make when something is funny.',
    'magical': 'Something that seems to have special powers.',
    'neighborhood': 'The area where you live with houses and people around.',
    'obstacle': 'Something that gets in your way or makes things difficult.',
    'powerful': 'Having great strength or ability to do things.',
    'question': 'Something you ask when you want to know more.',
    'remember': 'To think about something that happened before.',
    'special': 'Something that is different in a good and important way.',
    'together': 'Being with someone else, not alone.',
    'understand': 'To know what something means or how it works.',
    'wonderful': 'Something that is really, really good and amazing.',
    'solace': 'Comfort when you feel sad or worried.',
    'mysterious': 'Something that is hard to understand or figure out.',
    'brilliant': 'Very smart or very bright and shiny.',
    'gentle': 'Being soft, kind, and not rough.',
    'wisdom': 'Having lots of good knowledge and understanding.',
    'treasure': 'Something very valuable and special.',
    'enchanted': 'Having magical powers or being under a magic spell.',
    'curious': 'Wanting to learn and know more about things.',
    'delightful': 'Something that makes you very happy.',
    'magnificent': 'Something that is really grand and impressive.',
    'marvelous': 'Something that is wonderful and amazing.',
    'extraordinary': 'Something that is very unusual and special.',
    'fortunate': 'Being lucky or having good things happen.',
    'graceful': 'Moving in a smooth and beautiful way.',
    'inspired': 'Feeling excited and creative about something.',
    'perseverance': 'Not giving up even when things are hard.',
    'compassion': 'Caring deeply about others and wanting to help them.'
  };
  
  // Check static definitions first
  const staticDefinition = staticDefinitions[word.toLowerCase()];
  if (staticDefinition) {
    return staticDefinition;
  }
  
  // Fall back to AI-generated definition
  return await generateAIDefinition(word);
};