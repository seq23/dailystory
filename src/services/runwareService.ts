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

// Function to generate child-friendly illustration prompts
export const createChildFriendlyPrompt = (storyText: string, userInfo?: any, pageIndex = 0): string => {
  // Import ContentSecurity here to avoid circular imports
  const { ContentSecurity } = require('@/utils/security');
  
  // Sanitize the input prompt for security
  const sanitizedStoryText = ContentSecurity.sanitizePrompt(storyText);
  const lowerText = sanitizedStoryText.toLowerCase();
  
  // Extract key elements directly from the story text
  let mainScene = "";
  let characters = [];
  let setting = "";
  let objects = [];
  let mood = "happy and cheerful";
  
  // Enhanced story text analysis - extract more specific details from the actual story
  const storyWords = lowerText.split(/\s+/);
  const storyContext = sanitizedStoryText; // Keep original capitalization for better context
  
  // ALWAYS include the main character first if userInfo is provided
  if (userInfo) {
    const genderDesc = userInfo.avatar?.type === "boy" ? "young boy" : "young girl";
    const skinToneDesc = {
      pale: "very light skin",
      light: "light skin", 
      medium: "medium skin",
      olive: "olive skin",
      dark: "dark skin"
    }[userInfo.avatar?.skinTone] || "medium skin";
    
    // Create a detailed character description
    const mainCharacter = `${genderDesc} named ${userInfo.name || 'the main character'} with ${skinToneDesc}`;
    characters.push(mainCharacter);
    
    // Add favorite animal if mentioned in story or if it's a key part of user info
    if (userInfo.favoriteAnimal && (lowerText.includes(userInfo.favoriteAnimal.toLowerCase()) || lowerText.includes('animal') || lowerText.includes('friend'))) {
      characters.push(`friendly ${userInfo.favoriteAnimal.toLowerCase()}`);
    }
  }
  
  // Analyze the story text more comprehensively
  
  // Detect other characters
  const animalKeywords = {
    'cat': 'cute cat', 'dog': 'happy dog', 'bird': 'colorful bird', 'rabbit': 'fluffy rabbit',
    'bear': 'friendly bear', 'lion': 'majestic lion', 'elephant': 'gentle elephant', 
    'horse': 'beautiful horse', 'fish': 'bright fish', 'butterfly': 'colorful butterfly',
    'dragon': 'friendly dragon', 'unicorn': 'magical unicorn'
  };
  
  Object.entries(animalKeywords).forEach(([keyword, description]) => {
    if (lowerText.includes(keyword)) {
      characters.push(description);
    }
  });
  
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
  
  // Add setting with story context
  if (setting) {
    prompt += "in " + setting + " ";
  } else if (storyWords.length > 5) {
    // Try to infer setting from story if not explicitly found
    prompt += "in the setting described in the story ";
  } else {
    prompt += "in a magical, safe place ";
  }
  
  // Add objects that appear in the story
  if (objects.length > 0) {
    prompt += "surrounded by " + objects.slice(0, 3).join(', ') + " ";
  }
  
  // Include a snippet of the actual story context for better accuracy
  if (storyContext.length > 20) {
    const relevantWords = storyWords.slice(0, 8).join(' ');
    prompt += `based on this story context: "${relevantWords}..." `;
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
      const hobbiesList = userInfo.hobbies.split(',').map(h => h.trim()).slice(0, 2);
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
  
  // Diverse art style options that appeal to both boys and girls
  const artStyles = [
    "realistic children's photography style with natural lighting",
    "vibrant digital illustration with bold colors", 
    "soft watercolor painting style",
    "modern cartoon illustration with clean lines",
    "realistic digital art with photographic quality",
    "colorful storybook illustration",
    "contemporary children's book art style",
    "bright and engaging realistic style"
  ];
  
  // Choose art style based on story content and user preferences
  let selectedStyle = artStyles[pageIndex % artStyles.length] || artStyles[0];
  
  // Color palette variety - not just pastels
  const colorPalettes = [
    "vibrant and energetic colors",
    "warm earth tones and natural colors", 
    "bright primary colors",
    "soft pastels",
    "rich jewel tones",
    "cool blues and greens",
    "warm oranges and yellows",
    "balanced natural color palette"
  ];
  
  // Select color palette that incorporates user's favorite color if available
  let selectedColors = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
  if (userInfo?.favoriteColor) {
    selectedColors = `beautiful ${userInfo.favoriteColor.toLowerCase()} tones with complementary colors`;
  }
  
  // Add mood, style, and universal appeal
  prompt += `with a ${mood} atmosphere, ${selectedColors}, ${selectedStyle}, appealing to all children regardless of gender, diverse and inclusive, safe and wholesome content, high quality professional artwork`;
  
  // Final security validation of the generated prompt
  const finalPrompt = ContentSecurity.sanitizePrompt(prompt);
  
  return finalPrompt;
};