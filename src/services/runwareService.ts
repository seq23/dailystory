import { toast } from "sonner";

const API_ENDPOINT = "wss://ws-api.runware.ai/v1";

export interface GenerateImageParams {
  positivePrompt: string;
  model?: string;
  width?: number;
  height?: number;
  numberResults?: number;
  outputFormat?: string;
  CFGScale?: number;
  scheduler?: string;
  strength?: number;
  promptWeighting?: "compel" | "sdEmbeds";
  seed?: number | null;
  lora?: string[];
}

export interface GeneratedImage {
  imageURL: string;
  positivePrompt: string;
  seed: number;
  NSFWContent: boolean;
}

export class RunwareService {
  private ws: WebSocket | null = null;
  private apiKey: string | null = null;
  private connectionSessionUUID: string | null = null;
  private messageCallbacks: Map<string, (data: any) => void> = new Map();
  private isAuthenticated: boolean = false;
  private connectionPromise: Promise<void> | null = null;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.connectionPromise = this.connect();
  }

  private connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(API_ENDPOINT);
      
      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.authenticate().then(resolve).catch(reject);
      };

      this.ws.onmessage = (event) => {
        console.log("WebSocket message received:", event.data);
        const response = JSON.parse(event.data);
        
        if (response.error || response.errors) {
          console.error("WebSocket error response:", response);
          return;
        }

        if (response.data) {
          response.data.forEach((item: any) => {
            if (item.taskType === "authentication") {
              console.log("Authentication successful, session UUID:", item.connectionSessionUUID);
              this.connectionSessionUUID = item.connectionSessionUUID;
              this.isAuthenticated = true;
            } else {
              const callback = this.messageCallbacks.get(item.taskUUID);
              if (callback) {
                callback(item);
                this.messageCallbacks.delete(item.taskUUID);
              }
            }
          });
        }
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        reject(error);
      };

      this.ws.onclose = () => {
        console.log("WebSocket closed, attempting to reconnect...");
        this.isAuthenticated = false;
        setTimeout(() => {
          this.connectionPromise = this.connect();
        }, 1000);
      };
    });
  }

  private authenticate(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error("WebSocket not ready for authentication"));
        return;
      }
      
      const authMessage = [{
        taskType: "authentication",
        apiKey: this.apiKey,
        ...(this.connectionSessionUUID && { connectionSessionUUID: this.connectionSessionUUID }),
      }];
      
      console.log("Sending authentication message");
      
      // Set up a one-time authentication callback
      const authCallback = (event: MessageEvent) => {
        const response = JSON.parse(event.data);
        if (response.data?.[0]?.taskType === "authentication") {
          this.ws?.removeEventListener("message", authCallback);
          resolve();
        }
      };
      
      this.ws.addEventListener("message", authCallback);
      this.ws.send(JSON.stringify(authMessage));
    });
  }

  async generateImage(params: GenerateImageParams): Promise<GeneratedImage> {
    // Wait for connection and authentication before proceeding
    await this.connectionPromise;

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.isAuthenticated) {
      this.connectionPromise = this.connect();
      await this.connectionPromise;
    }

    const taskUUID = crypto.randomUUID();
    
    return new Promise((resolve, reject) => {
      const message = [{
        taskType: "imageInference",
        taskUUID,
        model: params.model || "runware:100@1",
        width: 768,
        height: 1024,
        numberResults: params.numberResults || 1,
        outputFormat: params.outputFormat || "WEBP",
        steps: 4,
        CFGScale: params.CFGScale || 1,
        scheduler: params.scheduler || "FlowMatchEulerDiscreteScheduler",
        strength: params.strength || 0.8,
        lora: params.lora || [],
        ...params,
      }];

      if (!params.seed) {
        delete message[0].seed;
      }

      if (message[0].model === "runware:100@1") {
        delete message[0].promptWeighting;
      }

      console.log("Sending image generation message:", message);

      this.messageCallbacks.set(taskUUID, (data) => {
        if (data.error) {
          reject(new Error(data.errorMessage));
        } else {
          resolve(data);
        }
      });

      this.ws?.send(JSON.stringify(message));
    });
  }
}

// Cache for generated images
export const generatedImageCache = new Map<string, string>();

// Function to generate child-friendly illustration prompts with cultural competency
export const createChildFriendlyPrompt = (storyText: string, userInfo?: any, pageIndex = 0): string => {
  // Sanitize the input prompt for security (basic sanitization to avoid import issues)
  const sanitizedStoryText = storyText.replace(/[<>\"'&]/g, '').trim();
  const lowerText = sanitizedStoryText.toLowerCase();
  
  // Cultural competency based on native language
  const getCulturalElements = (nativeLanguage: string) => {
    const culturalSettings = {
      'ar': {
        architecture: 'traditional Middle Eastern architecture with domes and arches',
        clothing: 'traditional and modern Middle Eastern clothing',
        landscape: 'desert landscapes with oases, or modern Middle Eastern cities',
        family: 'diverse Middle Eastern family structures',
        food: 'traditional Middle Eastern cuisine'
      },
      'es': {
        architecture: 'colorful Latin American or Spanish colonial architecture',
        clothing: 'vibrant Latin American traditional and modern clothing',
        landscape: 'tropical landscapes, mountains, or vibrant Latino neighborhoods',
        family: 'diverse Latino family structures',
        food: 'traditional Latin American cuisine'
      },
      'zh': {
        architecture: 'traditional Chinese architecture with pagodas and modern Asian cities',
        clothing: 'traditional and modern East Asian clothing',
        landscape: 'Asian gardens, mountains, or modern Asian cities',
        family: 'diverse East Asian family structures',
        food: 'traditional East Asian cuisine'
      },
      'hi': {
        architecture: 'traditional Indian architecture with colorful buildings',
        clothing: 'vibrant traditional and modern South Asian clothing',
        landscape: 'diverse Indian landscapes from mountains to cities',
        family: 'diverse South Asian family structures',
        food: 'traditional South Asian cuisine'
      },
      'pt': {
        architecture: 'Portuguese or Brazilian colonial and modern architecture',
        clothing: 'vibrant Brazilian and Portuguese traditional and modern clothing',
        landscape: 'tropical Brazilian landscapes or Portuguese countryside',
        family: 'diverse Brazilian and Portuguese family structures',
        food: 'traditional Brazilian and Portuguese cuisine'
      },
      'fr': {
        architecture: 'classic French architecture or diverse francophone settings',
        clothing: 'elegant French and francophone traditional and modern clothing',
        landscape: 'French countryside, African landscapes, or diverse francophone settings',
        family: 'diverse francophone family structures',
        food: 'traditional French and francophone cuisine'
      },
      'en': {
        architecture: 'diverse architectural styles representing global cultures',
        clothing: 'diverse cultural clothing from around the world',
        landscape: 'diverse global landscapes and multicultural neighborhoods',
        family: 'diverse multicultural family structures',
        food: 'diverse international cuisine'
      }
    };
    
    return culturalSettings[nativeLanguage as keyof typeof culturalSettings] || culturalSettings['en'];
  };

  const culturalElements = getCulturalElements(userInfo?.nativeLanguage || 'en');
  
  // Enhanced story text analysis with smarter keyword extraction
  const storyWords = lowerText.split(/\s+/);
  const storyContext = sanitizedStoryText;
  
  // Use AI-like text analysis to extract key narrative elements
  const extractKeyElements = (text: string) => {
    const words = text.toLowerCase().split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Extract the most important nouns and actions from the first sentence
    const firstSentence = sentences[0]?.toLowerCase() || "";
    const keyWords = words.filter(word => 
      word.length > 3 && 
      !['the', 'and', 'was', 'were', 'that', 'this', 'with', 'have', 'they', 'from', 'been', 'said', 'each', 'which', 'their', 'would', 'there', 'could', 'other'].includes(word)
    ).slice(0, 5);
    
    return { keyWords, firstSentence, sentences };
  };
  
  const { keyWords, firstSentence, sentences } = extractKeyElements(storyContext);
  
  // Initialize story elements arrays
  let characters: string[] = [];
  let mainScene = "";
  let setting = "";
  let objects: string[] = [];
  let mood = "happy and cheerful";
  
  // ALWAYS include the main character first with precise details
  if (userInfo) {
    const genderDesc = userInfo.avatar?.type === "boy" ? "young boy" : "young girl";
    const skinToneDesc = {
      pale: "very light skin",
      light: "light skin", 
      medium: "medium skin",
      olive: "olive skin",
      dark: "dark skin"
    }[userInfo.avatar?.skinTone] || "medium skin";
    
    const mainCharacter = `${genderDesc} named ${userInfo.name || 'the main character'} with ${skinToneDesc}`;
    characters.push(mainCharacter);
    
    // Intelligently add favorite animal based on story context
    if (userInfo.favoriteAnimal) {
      const animalInStory = keyWords.some(word => 
        word.includes(userInfo.favoriteAnimal.toLowerCase()) ||
        firstSentence.includes(userInfo.favoriteAnimal.toLowerCase())
      );
      
      if (animalInStory || lowerText.includes('animal') || lowerText.includes('friend') || pageIndex === 0) {
        characters.push(`friendly ${userInfo.favoriteAnimal.toLowerCase()}`);
      }
    }
  }
  
  // Smart detection based on story keywords and context
  const detectMainAction = (text: string, keyWords: string[]) => {
    const actionMap = {
      'walking': 'walking through', 'running': 'running happily',
      'playing': 'playing together', 'eating': 'enjoying a meal',
      'reading': 'reading a book', 'sleeping': 'peacefully resting',
      'dancing': 'dancing joyfully', 'singing': 'singing happily',
      'helping': 'helping each other', 'learning': 'discovering something new',
      'exploring': 'exploring together', 'flying': 'flying through the air',
      'swimming': 'swimming in water', 'climbing': 'climbing safely',
      'building': 'building something creative', 'cooking': 'cooking together'
    };
    
    // Check story keywords first, then action keywords
    for (const [action, description] of Object.entries(actionMap)) {
      if (keyWords.includes(action) || text.includes(action)) {
        return description;
      }
    }
    return "";
  };
  
  mainScene = detectMainAction(lowerText, keyWords);
  
  // Setting detection with more context
  const settingKeywords = {
    'forest': 'magical forest with tall trees',
    'castle': 'beautiful fairy tale castle',
    'garden': 'colorful flower garden',
    'beach': 'sunny beach with gentle waves',
    'mountain': 'scenic mountains with green hills',
    'school': 'bright cheerful classroom',
    'home': 'cozy comfortable home',
    'park': 'beautiful park with green grass',
    'library': 'warm library filled with books',
    'kitchen': 'bright kitchen',
    'bedroom': 'cozy bedroom',
    'playground': 'fun playground',
    'farm': 'peaceful farm with animals',
    'city': 'friendly neighborhood',
    'space': 'colorful outer space with stars'
  };
  
  Object.entries(settingKeywords).forEach(([keyword, description]) => {
    if (lowerText.includes(keyword)) {
      setting = description;
      return;
    }
  });
  
  // Action detection for main scene
  const actionKeywords = {
    'walking': 'walking through',
    'running': 'running happily',
    'playing': 'playing together',
    'eating': 'enjoying a meal',
    'reading': 'reading a book',
    'sleeping': 'peacefully sleeping',
    'dancing': 'dancing joyfully',
    'singing': 'singing happily',
    'helping': 'helping each other',
    'learning': 'discovering something new',
    'exploring': 'exploring together',
    'flying': 'flying through the air',
    'swimming': 'swimming in water',
    'climbing': 'climbing safely',
    'building': 'building something creative',
    'painting': 'creating beautiful art',
    'cooking': 'cooking together',
    'laughing': 'laughing and having fun'
  };
  
  Object.entries(actionKeywords).forEach(([keyword, description]) => {
    if (lowerText.includes(keyword)) {
      mainScene = description;
      return;
    }
  });
  
  // Object detection
  const objectKeywords = {
    'book': 'magical storybook', 'toy': 'colorful toys', 'ball': 'bouncing ball',
    'flower': 'beautiful flowers', 'tree': 'tall friendly trees', 'house': 'cozy house',
    'car': 'bright car', 'bike': 'fun bicycle', 'boat': 'cheerful boat',
    'plane': 'friendly airplane', 'train': 'colorful train', 'cake': 'delicious cake',
    'cookie': 'sweet cookies', 'ice cream': 'yummy ice cream', 'pizza': 'tasty pizza',
    'rainbow': 'bright rainbow', 'star': 'twinkling stars', 'sun': 'warm sunshine',
    'moon': 'gentle moonlight', 'cloud': 'fluffy white clouds'
  };
  
  Object.entries(objectKeywords).forEach(([keyword, description]) => {
    if (lowerText.includes(keyword)) {
      objects.push(description);
    }
  });
  
  // Mood detection
  const moodKeywords = {
    'happy': 'joyful and cheerful',
    'excited': 'excited and energetic',
    'peaceful': 'calm and peaceful',
    'magical': 'magical and wonderful',
    'adventurous': 'adventurous and brave',
    'funny': 'fun and silly',
    'sleepy': 'cozy and sleepy',
    'surprised': 'surprised and amazed'
  };
  
  Object.entries(moodKeywords).forEach(([keyword, description]) => {
    if (lowerText.includes(keyword)) {
      mood = description;
      return;
    }
  });
  
  // Build comprehensive prompt that closely follows the story
  let prompt = "A beautiful children's book illustration depicting ";
  
  // Start with a direct reference to the story scene
  if (mainScene || setting || objects.length > 0) {
    prompt += "the scene where ";
  }
  
  // Add characters first (user's character is always primary)
  if (characters.length > 0) {
    prompt += characters.slice(0, 2).join(' and ') + " ";
  } else {
    prompt += "a happy child ";
  }
  
  // Add the main action/scene from the story
  if (mainScene) {
    prompt += mainScene + " ";
  } else {
    // If no specific action detected, try to infer from story context
    prompt += "is featured in the story ";
  }
  
  // Add culturally appropriate setting with story context
  if (setting) {
    prompt += "in " + setting + " ";
  } else if (storyWords.length > 5) {
    // Use cultural landscape if no specific setting found
    prompt += `in ${culturalElements.landscape} `;
  } else {
    prompt += "in a magical, safe place ";
  }
  
  // Add objects that appear in the story
  if (objects.length > 0) {
    prompt += "surrounded by " + objects.slice(0, 3).join(', ') + " ";
  }
  
  // Include intelligent story context - focus on the most important elements
  if (storyContext.length > 20) {
    // Use the key words we extracted for better context
    const contextPhrase = keyWords.length > 0 ? keyWords.slice(0, 4).join(' ') : storyWords.slice(0, 6).join(' ');
    prompt += `depicting the story moment: "${contextPhrase}" `;
  }
  
  // Add cultural elements based on user's background
  if (userInfo?.nativeLanguage && userInfo.nativeLanguage !== 'en') {
    prompt += `incorporating ${culturalElements.architecture}, `;
    prompt += `featuring ${culturalElements.clothing}, `;
    
    // Add cultural food context if relevant
    if (lowerText.includes('food') || lowerText.includes('eat') || lowerText.includes('meal')) {
      prompt += `with ${culturalElements.food}, `;
    }
  }
  
  // Add ALL user favorites to enhance personalization
  if (userInfo) {
    // Add favorite color
    if (userInfo.favoriteColor) {
      prompt += `featuring beautiful ${userInfo.favoriteColor.toLowerCase()} colors `;
    }
    
    // Add favorite food if it makes sense in context
    if (userInfo.favoriteFood && (lowerText.includes('food') || lowerText.includes('eat') || lowerText.includes('meal') || userInfo.favoriteFood.toLowerCase().includes('cake') || userInfo.favoriteFood.toLowerCase().includes('cookie'))) {
      prompt += `with delicious ${userInfo.favoriteFood.toLowerCase()} `;
    }
    
    // Add hobbies if relevant to the scene
    if (userInfo.hobbies && (lowerText.includes('play') || lowerText.includes('fun') || lowerText.includes('activity'))) {
      const hobbiesList = userInfo.hobbies.split(',').map((h: string) => h.trim()).slice(0, 2);
      prompt += `incorporating ${hobbiesList.join(' and ')} `;
    }
    
    // Add special request elements if mentioned
    if (userInfo.specialRequest) {
      const specialElements = userInfo.specialRequest.toLowerCase();
      if (specialElements.includes('magic') || specialElements.includes('dragon') || specialElements.includes('princess') || specialElements.includes('space') || specialElements.includes('power')) {
        prompt += `with magical elements from their special request: ${userInfo.specialRequest.toLowerCase()} `;
      }
    }
  }
  
  // Culturally diverse art style options
  const artStyles = [
    "realistic children's book illustration with natural lighting",
    "vibrant digital illustration with rich cultural details", 
    "warm watercolor painting style with cultural authenticity",
    "modern storybook illustration with diverse representation",
    "detailed digital art with photographic quality and cultural accuracy",
    "colorful multicultural children's book illustration",
    "contemporary diverse children's art style",
    "bright engaging illustration representing global cultures"
  ];
  
  // Choose art style based on story content and cultural background
  let selectedStyle = artStyles[pageIndex % artStyles.length] || artStyles[0];
  
  // Color palette that respects cultural aesthetics
  const colorPalettes = [
    "vibrant culturally authentic colors",
    "warm earth tones reflecting natural diversity", 
    "bright respectful primary colors",
    "soft harmonious pastels",
    "rich culturally inspired jewel tones",
    "cool blues and greens with cultural accents",
    "warm oranges and yellows with cultural depth",
    "balanced multicultural color palette"
  ];
  
  // Select color palette that incorporates user's favorite color and cultural background
  let selectedColors = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
  if (userInfo?.favoriteColor) {
    selectedColors = `beautiful ${userInfo.favoriteColor.toLowerCase()} tones with culturally authentic complementary colors`;
  }
  
  // Add mood, style, cultural sensitivity, and universal appeal
  prompt += `with a ${mood} atmosphere, ${selectedColors}, ${selectedStyle}, `;
  prompt += `culturally respectful and authentic representation, `;
  prompt += `diverse and inclusive characters, appealing to all children regardless of background, `;
  prompt += `safe and wholesome content, high quality professional children's book artwork, `;
  prompt += `accurate cultural representation when applicable, positive multicultural themes`;
  
  // Final security validation of the generated prompt
  const finalPrompt = prompt.replace(/[<>\"'&]/g, '').trim();
  
  console.log('Generated culturally competent prompt:', finalPrompt);
  
  return finalPrompt;
};