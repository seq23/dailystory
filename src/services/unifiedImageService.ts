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

    // Deep analysis of story content for intelligent scene building
    const storyContext = this.analyzeStoryContent(storyText, character);
    
    // Get scene type based on page position
    const sceneType = this.getSceneType(pageIndex, totalPages);
    
    // Build character description with proper representation
    const characterDesc = this.buildCharacterDescription(character);
    
    // Get professional art style for difficulty level
    const artStyle = this.getArtStyleForDifficulty(difficulty);
    
    // INTELLIGENT SCENE CONSTRUCTION: Build the scene naturally
    let prompt = `${artStyle} professionally illustrated children's book art. `;
    
    // Main subject: Always start with the character
    prompt += `${characterDesc} `;
    
    // Intelligent action + interaction analysis
    const sceneDescription = this.buildIntelligentScene(storyText, storyContext, character);
    prompt += `${sceneDescription} `;
    
    // Setting context
    if (storyContext.setting) {
      prompt += `in ${storyContext.setting} `;
    }
    
    // Scene type and mood
    prompt += `${sceneType}. `;
    
    // Add organic user elements that enhance the scene
    const organicElements = this.getOrganicUserElements(character, storyContext);
    if (organicElements) {
      prompt += `${organicElements}. `;
    }
    
    // Professional quality and STRICT no-text enforcement
    prompt += this.getQualityModifiers(difficulty);
    
    return prompt.trim();
  }

  /**
   * Build intelligent scene based on story analysis
   */
  private static buildIntelligentScene(storyText: string, storyContext: any, character: EstablishedCharacter): string {
    const text = storyText.toLowerCase();
    
    // INTELLIGENT INTERACTION DETECTION - Enhanced for better story matching
    const interactions = [
      // Social interactions with friends/people
      { pattern: /shares?.*pizza.*with.*friends?/i, description: `sharing pizza with friends in a group setting` },
      { pattern: /shares?.*with.*friends?/i, description: `sharing something with friends` },
      { pattern: /play.*with.*friends?/i, description: `playing with friends` },
      { pattern: /eat.*with.*friends?/i, description: `eating together with friends` },
      { pattern: /friends?/i, description: `with friends in a social setting` },
      
      // Food-related interactions - Enhanced detection
      { pattern: /cat.*likes.*pizza/i, description: `sharing pizza with a friendly cat` },
      { pattern: /cat.*pizza/i, description: `cat enjoying pizza together` },
      { pattern: /pizza.*cat/i, description: `pizza time with a cat` },
      { pattern: /likes.*pizza.*too/i, description: `sharing delicious pizza together` },
      { pattern: /eat.*pizza/i, description: `enjoying pizza` },
      { pattern: /shares?.*pizza/i, description: `sharing pizza` },
      { pattern: /pizza/i, description: `with pizza prominently featured` },
      { pattern: /eat.*cookie/i, description: `eating a cookie` },
      { pattern: /eat.*apple/i, description: `eating an apple` },
      { pattern: /drink/i, description: `drinking something refreshing` },
      
      // Movement and action-focused interactions
      { pattern: /run.*to.*house/i, description: `running toward a house` },
      { pattern: /run.*to/i, description: `running toward something` },
      { pattern: /walk.*to.*house/i, description: `walking toward a house` },
      { pattern: /walk.*to/i, description: `walking toward something` },
      { pattern: /running/i, description: `running energetically` },
      { pattern: /walking/i, description: `walking purposefully` },
      { pattern: /jumping/i, description: `jumping with joy` },
      { pattern: /skipping/i, description: `skipping happily` },
      
      // Animal interactions
      { pattern: /meet.*cat/i, description: `meeting a friendly cat` },
      { pattern: /meet.*dog/i, description: `meeting a playful dog` },
      { pattern: /meet.*bird/i, description: `meeting a colorful bird` },
      
      // Object interactions
      { pattern: /find.*book/i, description: `discovering a magical book` },
      { pattern: /find.*treasure/i, description: `finding a treasure` },
      { pattern: /play.*ball/i, description: `playing with a ball` },
      { pattern: /chase.*butterfly/i, description: `chasing colorful butterflies` },
      { pattern: /read.*story/i, description: `reading a story` },
      
      // Activity interactions
      { pattern: /dance/i, description: `dancing joyfully` },
      { pattern: /sing/i, description: `singing happily` },
      { pattern: /explore/i, description: `exploring with curiosity` },
      { pattern: /adventure/i, description: `on an exciting adventure` }
    ];
    
    // Find the most specific interaction
    for (const interaction of interactions) {
      if (interaction.pattern.test(storyText)) {
        return interaction.description;
      }
    }
    
    // COLOR-SPECIFIC INTERACTIONS - Enhanced to detect any color + animal combination
    const colorAnimals = [
      { pattern: /purple.*lion/i, description: `meeting a magical purple lion` },
      { pattern: /blue.*cat/i, description: `meeting a magical blue cat` },
      { pattern: /red.*bird/i, description: `meeting a beautiful red bird` },
      { pattern: /green.*frog/i, description: `meeting a friendly green frog` },
      { pattern: /purple.*butterfly/i, description: `meeting a purple butterfly` },
      { pattern: /pink.*elephant/i, description: `meeting a gentle pink elephant` },
      { pattern: /orange.*tiger/i, description: `meeting a friendly orange tiger` },
      { pattern: /yellow.*lion/i, description: `meeting a bright yellow lion` },
      { pattern: /silver.*wolf/i, description: `meeting a majestic silver wolf` },
      { pattern: /golden.*eagle/i, description: `meeting a magnificent golden eagle` }
    ];
    
    for (const colorAnimal of colorAnimals) {
      if (colorAnimal.pattern.test(storyText)) {
        return colorAnimal.description;
      }
    }
    
    // GENERAL COLOR + ANIMAL DETECTION (fallback for any color + animal combination)
    const colorWords = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange', 'black', 'white', 'brown', 'gray', 'silver', 'golden'];
    const animalWords = ['cat', 'dog', 'lion', 'tiger', 'elephant', 'bird', 'frog', 'butterfly', 'wolf', 'bear', 'rabbit', 'horse', 'fish', 'turtle'];
    
    for (const color of colorWords) {
      for (const animal of animalWords) {
        const pattern = new RegExp(`${color}.*${animal}|${animal}.*${color}`, 'i');
        if (pattern.test(storyText)) {
          return `meeting a magical ${color} ${animal}`;
        }
      }
    }
    
    // COLOR + OBJECT DETECTION (for objects like "blue house", "red ball", etc.)
    const objectWords = ['ball', 'basketball', 'book', 'flower', 'tree', 'toy', 'gift', 'hat', 'car', 'bike', 'balloon', 'apple', 'cookie', 'cup', 'box', 'bag', 'house', 'door', 'window', 'building'];
    
    for (const color of colorWords) {
      for (const object of objectWords) {
        const pattern = new RegExp(`${color}.*${object}|${object}.*${color}`, 'i');
        if (pattern.test(storyText)) {
          if (object === 'house') {
            return `approaching a beautiful ${color} ${object}`;
          } else {
            return `playing with a ${color} ${object}`;
          }
        }
      }
    }
    
    // Fallback to detected action or default
    if (storyContext.mainAction) {
      return storyContext.mainAction;
    }
    
    return 'in a magical moment';
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
    
    // Detect objects mentioned in story - Enhanced list including food items
    const objects = ['book', 'ball', 'basketball', 'flower', 'tree', 'toy', 'gift', 'hat', 'car', 'bike', 'balloon', 'apple', 'cookie', 'cup', 'box', 'bag', 'house', 'door', 'window', 'building', 'pizza', 'cake', 'sandwich', 'juice'];
    const detectedObjects = objects.filter(obj => text.includes(obj));
    
    // ENHANCED: Detect color+object combinations in story (including houses, buildings)
    const colorObjectCombinations = [];
    const colorWords = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange', 'black', 'white', 'brown', 'gray', 'silver', 'golden'];
    for (const color of colorWords) {
      for (const object of objects) {
        const pattern = new RegExp(`${color}.*${object}|${object}.*${color}`, 'i');
        if (pattern.test(text)) {
          colorObjectCombinations.push({ color, object });
        }
      }
    }
    
    // ENHANCED: Detect specific colors mentioned in the story text
    const mentionedColors = [];
    for (const color of colorWords) {
      if (text.includes(color)) {
        mentionedColors.push(color);
      }
    }
    
    // ENHANCED: Detect specific animals mentioned in the story text  
    const mentionedAnimals = [];
    const animalWords = ['cat', 'dog', 'lion', 'tiger', 'elephant', 'bird', 'frog', 'butterfly', 'wolf', 'bear', 'rabbit', 'horse', 'fish', 'turtle'];
    for (const animal of animalWords) {
      if (text.includes(animal)) {
        mentionedAnimals.push(animal);
      }
    }
    
    // Check if story mentions user's favorite elements
    const mentionsFavoriteAnimal = text.includes(character.favoriteAnimal);
    const mentionsFavoriteColor = text.includes(character.favoriteColor);
    
    return {
      mainAction,
      setting,
      objects: detectedObjects,
      mentionsFavoriteAnimal,
      mentionsFavoriteColor,
      mentionedColors, // NEW: Colors specifically mentioned in story
      mentionedAnimals, // NEW: Animals specifically mentioned in story
      colorObjectCombinations, // NEW: Color+object combinations like "blue basketball"
      storyText: text // NEW: Keep original text for reference
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
   * Get organic user elements to weave into the scene - Enhanced to prioritize story-mentioned elements
   */
  private static getOrganicUserElements(character: EstablishedCharacter, storyContext: any): string {
    const elements = [];
    
    // PRIORITY 1: Use specific color+object combinations mentioned in the story
    if (storyContext.colorObjectCombinations && storyContext.colorObjectCombinations.length > 0) {
      const combo = storyContext.colorObjectCombinations[0];
      elements.push(`${combo.color} ${combo.object} prominently featured in the scene`);
    }
    
    // PRIORITY 2: Use colors and animals specifically mentioned in the story text
    if (storyContext.mentionedColors && storyContext.mentionedColors.length > 0 && !elements.length) {
      elements.push(`${storyContext.mentionedColors[0]} colors prominently featured`);
    } else if (storyContext.mentionsFavoriteColor || Math.random() > 0.7) {
      // Fallback to user's favorite color
      elements.push(`${character.favoriteColor} accents in the scene`);
    }
    
    if (storyContext.mentionedAnimals && storyContext.mentionedAnimals.length > 0) {
      // Don't add "friendly X nearby" if the animal is already part of the main scene
      const mainAnimal = storyContext.mentionedAnimals[0];
      if (!storyContext.storyText.includes(`${character.userName}`) || !storyContext.storyText.includes('meeting')) {
        elements.push(`${mainAnimal} as described in the story`);
      }
    } else if (storyContext.mentionsFavoriteAnimal || (storyContext.setting && Math.random() > 0.6)) {
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
   * Get professional art style based on difficulty level and age
   */
  private static getArtStyleForDifficulty(difficulty: DifficultyLevel): string {
    switch (difficulty) {
      case 'easy':
        return 'Bright vibrant cartoon-style children\'s book illustration, warm colorful animated style like Disney Junior or Nick Jr, rounded friendly features, cozy indoor/outdoor settings with beautiful bright colors, cheerful and welcoming cartoon art';
      case 'medium':
        return 'Colorful cartoon-style children\'s book illustration, warm animated art style, friendly cartoon characters, bright cheerful colors, beautiful simplified cartoon backgrounds, child-friendly cartoon aesthetic';
      case 'hard':
        return 'Realistic children\'s book illustration style, detailed semi-realistic art, natural proportions, realistic lighting and shadows, sophisticated illustration technique, painterly realistic style appropriate for ages 8-12';
      case 'expert':
        return 'Photorealistic detailed illustration, highly realistic children\'s book art, natural realistic proportions, sophisticated realistic detail, professional realistic illustration style for advanced young readers ages 10+';
      default:
        return 'Warm colorful cartoon-style children\'s book illustration';
    }
  }

  /**
   * Get quality modifiers with STRICT no-text enforcement
   */
  private static getQualityModifiers(difficulty: DifficultyLevel): string {
    const strictNoTextRule = 'ABSOLUTELY NO TEXT ANYWHERE IN THE IMAGE, NO CHARACTER NAMES, NO TITLES, NO WORDS, NO LETTERS, NO WRITING, NO SIGNS WITH TEXT, NO SPEECH BUBBLES, NO DIALOGUE, NO STORY TEXT, NO NARRATION, NO CAPTIONS, text-free illustration only';
    
    switch (difficulty) {
      case 'easy':
        return `${strictNoTextRule}, warm vibrant cartoon-style illustration, bright cheerful colors, rounded friendly cartoon features, cozy comfortable settings, child-friendly cartoon aesthetic, simple clear composition, Disney Junior animation quality, welcoming and safe atmosphere`;
      case 'medium':
        return `${strictNoTextRule}, colorful cartoon children's book art, warm animated illustration style, bright harmonious colors, friendly cartoon characters, beautiful simplified backgrounds, child-appropriate cartoon quality, engaging cartoon composition`;
      case 'hard':
        return `${strictNoTextRule}, realistic children's book illustration, natural realistic lighting, detailed realistic textures, sophisticated realistic art style, painterly realistic technique, realistic proportions and anatomy, professional realistic illustration quality for ages 8-12`;
      case 'expert':
        return `${strictNoTextRule}, photorealistic detailed children's book art, highly realistic illustration technique, natural realistic lighting and shadows, sophisticated realistic detail, museum-quality realistic illustration, advanced realistic art style for young readers 10+`;
      default:
        return `${strictNoTextRule}, warm colorful cartoon children's book illustration, safe for children, bright cheerful atmosphere`;
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
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ 
        positivePrompt: prompt,
        width: 1024,
        height: 768, // 4:3 aspect ratio optimal for story illustrations
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

  /**
   * Smart fallback selection for free users using enhanced content analysis
   */
  static selectSmartFallback(
    storyText: string, 
    character: EstablishedCharacter, 
    pageIndex: number, 
    illustrations: string[]
  ): GeneratedImage {
    // Use the same intelligent scene analysis as premium users
    const storyContext = this.analyzeStoryContent(storyText, character);
    
    // Build descriptive prompt for better fallback matching
    const intelligentScene = this.buildIntelligentScene(storyText, storyContext, character);
    
    // Select best fitting illustration based on story content
    let selectedIndex = pageIndex % illustrations.length;
    
    // Enhanced fallback selection based on story analysis
    if (storyContext.mentionedAnimals.length > 0 || storyContext.mentionsFavoriteAnimal) {
      // Animal stories - use illustrations 1, 3, 5 (tend to have animals)
      const animalIllustrations = [0, 2, 4];
      selectedIndex = animalIllustrations[pageIndex % animalIllustrations.length];
    } else if (storyContext.objects.includes('pizza') || storyContext.objects.includes('food')) {
      // Food/sharing stories - use illustrations 2, 4 (tend to have sharing/social scenes)
      const foodIllustrations = [1, 3];
      selectedIndex = foodIllustrations[pageIndex % foodIllustrations.length];
    } else if (storyContext.setting) {
      // Location-based stories - rotate through all illustrations
      selectedIndex = pageIndex % illustrations.length;
    }
    
    return {
      url: illustrations[selectedIndex],
      prompt: `Smart fallback: ${intelligentScene} - ${storyText.slice(0, 50)}...`,
      pageIndex: pageIndex
    };
  }
}