import type { UserInfo, DifficultyLevel } from "@/types";

// Unified interface for all image generation needs
export interface ImageGenerationOptions {
  pageIndex: number;
  totalPages: number;
  storyText: string;
  userInfo: UserInfo;
  difficulty: DifficultyLevel;
  establishedCharacter?: EstablishedCharacter;
  isNewStory?: boolean;
}

export interface EstablishedCharacter {
  userName: string;
  characterDescription: string;
  avatar: any;
  favoriteColor: string;
  favoriteAnimal: string;
  hobbies: string;
  favoriteFood: string;
  skinTone: string;
  avatarType: string;
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  seed?: number;
  pageIndex: number;
}

export class UnifiedImageService {
  private static imageCache = new Map<string, GeneratedImage>();
  private static usedSeeds = new Set<number>();
  private static currentCharacter: EstablishedCharacter | null = null;

  /**
   * Main entry point for all image generation
   * Fast, consistent, and intelligent image generation for stories
   */
  static async generateStoryImage(options: ImageGenerationOptions): Promise<GeneratedImage> {
    const { pageIndex, storyText, userInfo, establishedCharacter } = options;

    // Generate cache key for deduplication
    const cacheKey = this.generateCacheKey(storyText, userInfo, pageIndex);
    
    // Check cache first for speed
    if (this.imageCache.has(cacheKey)) {
      console.log(`Using cached image for page ${pageIndex + 1}`);
      return this.imageCache.get(cacheKey)!;
    }

    try {
      // Establish or use existing character for consistency
      const character = this.establishCharacterConsistency(userInfo, establishedCharacter);
      
      // Build intelligent prompt with all context
      const prompt = this.buildIntelligentPrompt(options, character);
      
      // Generate image via edge function
      const result = await this.callImageGenerationAPI(prompt, character, pageIndex);
      
      // Cache the result
      this.imageCache.set(cacheKey, result);
      
      console.log(`Generated new image for page ${pageIndex + 1}`);
      return result;

    } catch (error) {
      console.error(`Image generation failed for page ${pageIndex + 1}:`, error);
      // Return fallback image
      return this.getFallbackImage(pageIndex, storyText);
    }
  }

  /**
   * Establish character consistency across all images
   */
  static establishCharacterConsistency(
    userInfo: UserInfo, 
    existingCharacter?: EstablishedCharacter
  ): EstablishedCharacter {
    
    if (existingCharacter) {
      this.currentCharacter = existingCharacter;
      return existingCharacter;
    }

    // Create new character profile for consistency
    const characterDescription = userInfo.avatar ? 
      `, a curious and brave ${userInfo.avatar.type === 'boy' ? 'boy' : userInfo.avatar.type === 'girl' ? 'girl' : 'child'}` : 
      '';

    const character: EstablishedCharacter = {
      userName: userInfo.name?.trim() || 'Alex',
      characterDescription,
      avatar: userInfo.avatar,
      favoriteColor: userInfo.favoriteColor?.toLowerCase()?.trim() || 'blue',
      favoriteAnimal: userInfo.favoriteAnimal?.toLowerCase()?.trim() || 'cat',
      hobbies: userInfo.hobbies || 'reading',
      favoriteFood: userInfo.favoriteFood?.toLowerCase()?.trim() || 'pizza',
      skinTone: userInfo.avatar?.skinTone || 'medium',
      avatarType: userInfo.avatar?.type || 'boy'
    };

    this.currentCharacter = character;
    return character;
  }

  /**
   * Build intelligent prompt combining all context and requirements
   */
  private static buildIntelligentPrompt(
    options: ImageGenerationOptions, 
    character: EstablishedCharacter
  ): string {
    const { storyText, pageIndex, totalPages, difficulty } = options;

    // Analyze story content for intelligent elements
    const storyContext = this.analyzeStoryContent(storyText, character);
    
    // Get scene type based on page position
    const sceneType = this.getSceneType(pageIndex, totalPages);
    
    // Build character description with proper representation
    const characterDesc = this.buildCharacterDescription(character);
    
    // Get art style for difficulty level
    const artStyle = this.getArtStyleForDifficulty(difficulty);
    
    // Combine all elements into intelligent prompt
    let prompt = `${artStyle} children's book illustration. `;
    prompt += `${characterDesc} `;
    
    // Add story context intelligently
    if (storyContext.mainAction) {
      prompt += `${storyContext.mainAction} `;
    }
    
    if (storyContext.setting) {
      prompt += `in ${storyContext.setting} `;
    }
    
    if (storyContext.objects.length > 0) {
      prompt += `with ${storyContext.objects[0]} `;
    }
    
    // Add scene type context
    prompt += `${sceneType}. `;
    
    // Add organic user elements
    const organicElements = this.getOrganicUserElements(character, storyContext);
    if (organicElements) {
      prompt += `${organicElements}. `;
    }
    
    // Add quality and safety modifiers with NO TEXT rule
    prompt += this.getQualityModifiers(difficulty);
    
    return prompt.trim();
  }

  /**
   * Analyze story content for intelligent context
   */
  private static analyzeStoryContent(storyText: string, character: EstablishedCharacter) {
    const text = storyText.toLowerCase();
    
    // Detect main actions
    const actions = ['walking', 'running', 'playing', 'exploring', 'finding', 'meeting', 'reading', 'dancing', 'singing'];
    const mainAction = actions.find(action => text.includes(action)) || null;
    
    // Detect settings
    const settings = {
      'forest': 'a magical forest',
      'garden': 'a beautiful garden', 
      'home': 'a cozy home',
      'school': 'a friendly school',
      'park': 'a sunny park',
      'beach': 'a sandy beach'
    };
    const setting = Object.entries(settings).find(([key]) => text.includes(key))?.[1] || null;
    
    // Detect objects mentioned in story
    const objects = ['book', 'ball', 'flower', 'tree', 'toy', 'gift'];
    const detectedObjects = objects.filter(obj => text.includes(obj));
    
    // Check if story mentions user's favorite elements
    const mentionsFavoriteAnimal = text.includes(character.favoriteAnimal);
    const mentionsFavoriteColor = text.includes(character.favoriteColor);
    
    return {
      mainAction,
      setting,
      objects: detectedObjects,
      mentionsFavoriteAnimal,
      mentionsFavoriteColor
    };
  }

  /**
   * Build character description with proper representation
   */
  private static buildCharacterDescription(character: EstablishedCharacter): string {
    const { userName, skinTone, avatarType } = character;
    
    // Enhanced skin tone mapping for accurate representation
    const skinToneMap = {
      'pale': 'very light skin tone, pale complexion',
      'light': 'light skin tone, fair complexion',
      'medium': 'medium skin tone, warm brown complexion', 
      'olive': 'olive skin tone, Mediterranean complexion',
      'dark': 'dark skin tone, beautiful deep brown African/African American complexion'
    };
    
    const consistentSkinTone = skinToneMap[skinTone as keyof typeof skinToneMap] || 'medium skin tone';
    
    // Enhanced gender and ethnicity descriptions for accurate representation
    let genderDesc;
    if (skinTone === 'dark') {
      genderDesc = avatarType === 'boy' ? 'young Black boy' : avatarType === 'girl' ? 'young Black girl' : 'young Black child';
    } else {
      genderDesc = avatarType === 'boy' ? 'young boy' : avatarType === 'girl' ? 'young girl' : 'young child';
    }
    
    return `${genderDesc} named ${userName} with ${consistentSkinTone}`;
  }

  /**
   * Get organic user elements to weave into the scene
   */
  private static getOrganicUserElements(character: EstablishedCharacter, storyContext: any): string {
    const elements = [];
    
    // Add favorite color organically if mentioned in story or randomly
    if (storyContext.mentionsFavoriteColor || Math.random() > 0.7) {
      elements.push(`${character.favoriteColor} accents in the scene`);
    }
    
    // Add favorite animal if mentioned or contextually appropriate
    if (storyContext.mentionsFavoriteAnimal || (storyContext.setting && Math.random() > 0.6)) {
      elements.push(`friendly ${character.favoriteAnimal} nearby`);
    }
    
    return elements.join(', ');
  }

  /**
   * Determine scene type based on page position
   */
  private static getSceneType(pageIndex: number, totalPages: number): string {
    if (pageIndex === 0) {
      return 'Character introduction scene, clear and welcoming';
    } else if (pageIndex === totalPages - 1) {
      return 'Happy ending scene, peaceful and satisfying';
    } else if (pageIndex < totalPages / 2) {
      return 'Adventure beginning, exciting and safe';
    } else {
      return 'Story development, engaging and friendly';
    }
  }

  /**
   * Get art style based on difficulty level
   */
  private static getArtStyleForDifficulty(difficulty: DifficultyLevel): string {
    switch (difficulty) {
      case 'easy':
        return 'Colorful cartoon-style';
      case 'medium':
        return 'Gentle illustrated';
      case 'hard':
        return 'Detailed realistic';
      case 'expert':
        return 'Photorealistic';
      default:
        return 'Beautiful illustrated';
    }
  }

  /**
   * Get quality modifiers with hard NO TEXT rule
   */
  private static getQualityModifiers(difficulty: DifficultyLevel): string {
    const baseModifiers = 'Safe for children, clear composition, warm lighting, NO TEXT, NO WORDS, NO LETTERS in the image';
    
    switch (difficulty) {
      case 'easy':
        return `${baseModifiers}, simple and cheerful, bright colors`;
      case 'medium':
        return `${baseModifiers}, detailed and engaging, soft colors`;
      case 'hard':
        return `${baseModifiers}, rich detail, natural lighting`;
      case 'expert':
        return `${baseModifiers}, sophisticated detail, cinematic quality`;
      default:
        return baseModifiers;
    }
  }

  /**
   * Call the image generation API with character consistency
   */
  private static async callImageGenerationAPI(
    prompt: string, 
    character: EstablishedCharacter, 
    pageIndex: number
  ): Promise<GeneratedImage> {
    
    const response = await fetch('https://cpzeuogomaixamrtnnmj.supabase.co/functions/v1/runware-generate-image', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwemV1b2dvbWFpeGFtcnRubm1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5ODQ2NTEsImV4cCI6MjA2OTU2MDY1MX0.3ziDSHAS6XNd73eF5GVEOHW8GpnP03h3NJKqElMyino`
      },
      body: JSON.stringify({ 
        positivePrompt: prompt,
        width: 1024,
        height: 1024,
        // Character consistency parameters for enhanced representation
        characterName: character.userName,
        characterDescription: character.characterDescription,
        skinTone: character.skinTone,
        avatarType: character.avatarType,
        pageIndex: pageIndex
      })
    });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.imageURL) {
      throw new Error(result.error || 'Image generation failed');
    }
    
    return {
      url: result.imageURL,
      prompt: prompt,
      seed: result.seed,
      pageIndex: pageIndex
    };
  }

  /**
   * Generate cache key for deduplication
   */
  private static generateCacheKey(storyText: string, userInfo: UserInfo, pageIndex: number): string {
    const textHash = this.hashString(storyText.slice(0, 100));
    const userHash = this.hashString(`${userInfo.name}-${userInfo.avatar?.skinTone}-${userInfo.avatar?.type}`);
    return `${textHash}-${userHash}-${pageIndex}`;
  }

  /**
   * Simple hash function for cache keys
   */
  private static hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Get fallback image when generation fails
   */
  private static getFallbackImage(pageIndex: number, storyText: string): GeneratedImage {
    // Import fallback illustrations
    const fallbackImages = [
      '/src/assets/story-illustration-1.jpg',
      '/src/assets/story-illustration-2.jpg', 
      '/src/assets/story-illustration-3.jpg',
      '/src/assets/story-illustration-4.jpg',
      '/src/assets/story-illustration-5.jpg'
    ];
    
    const fallbackUrl = fallbackImages[pageIndex % fallbackImages.length];
    
    return {
      url: fallbackUrl,
      prompt: `Fallback illustration for: ${storyText.slice(0, 50)}...`,
      pageIndex: pageIndex
    };
  }

  /**
   * Clear cache (useful for testing or memory management)
   */
  static clearCache(): void {
    this.imageCache.clear();
    this.usedSeeds.clear();
  }

  /**
   * Get current character for external access
   */
  static getCurrentCharacter(): EstablishedCharacter | null {
    return this.currentCharacter;
  }

  /**
   * Set character for external management
   */
  static setCurrentCharacter(character: EstablishedCharacter): void {
    this.currentCharacter = character;
  }
}