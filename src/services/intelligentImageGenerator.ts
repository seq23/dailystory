import type { UserInfo } from '@/types';

export interface ImageGenerationParams {
  storyText: string;
  userInfo: UserInfo;
  pageNumber: number;
  previousImages?: string[];
}

export interface GeneratedImage {
  imageURL: string;
  prompt: string;
  seed: number;
  pageNumber: number;
}

export class IntelligentImageGenerator {
  private generatedImages: Map<string, GeneratedImage> = new Map();
  private usedSeeds: Set<number> = new Set();

  async generateStoryImage(params: ImageGenerationParams): Promise<GeneratedImage> {
    const { storyText, userInfo, pageNumber, previousImages = [] } = params;
    
    // Create cache key to avoid regenerating same content
    const cacheKey = `${this.hashString(storyText)}-${pageNumber}`;
    
    if (this.generatedImages.has(cacheKey)) {
      return this.generatedImages.get(cacheKey)!;
    }

    try {
      // Analyze story content and create intelligent prompt
      const prompt = this.createIntelligentPrompt(storyText, userInfo, pageNumber, previousImages);
      
      // Generate unique seed to avoid duplicates
      const seed = this.generateUniqueSeed();
      
      // Call Supabase edge function for secure API access
      const response = await fetch('/supabase/functions/v1/runware-generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          positivePrompt: prompt,
          model: "runware:100@1",
          width: 1024,
          height: 1024,
          numberResults: 1,
          outputFormat: "WEBP",
          CFGScale: 1,
          scheduler: "FlowMatchEulerDiscreteScheduler", 
          strength: 0.8,
          seed
        })
      });

      if (!response.ok) {
        throw new Error(`Image generation failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Image generation failed');
      }

      const generatedImage: GeneratedImage = {
        imageURL: result.imageURL,
        prompt,
        seed: result.seed,
        pageNumber
      };

      // Cache the result
      this.generatedImages.set(cacheKey, generatedImage);
      this.usedSeeds.add(result.seed);

      return generatedImage;

    } catch (error) {
      console.error('Intelligent image generation error:', error);
      throw error;
    }
  }

  private createIntelligentPrompt(
    storyText: string, 
    userInfo: UserInfo, 
    pageNumber: number,
    previousImages: string[]
  ): string {
    // Extract key elements from story
    const storyElements = this.analyzeStoryContent(storyText);
    
    // Build character description based on avatar
    const characterDescription = this.buildCharacterDescription(userInfo);
    
    // Create scene description
    const sceneDescription = this.buildSceneDescription(storyElements, pageNumber);
    
    // Add style and quality modifiers
    const styleModifiers = "beautiful children's book illustration, soft lighting, warm colors, high quality, detailed, professional artwork";
    
    // Combine all elements
    let prompt = `${sceneDescription}`;
    
    // Add character if story mentions them
    if (this.storyMentionsMainCharacter(storyText, userInfo.name)) {
      prompt += `, featuring ${characterDescription}`;
    }
    
    // Add style
    prompt += `, ${styleModifiers}`;
    
    // Add uniqueness elements to avoid duplicates
    const uniqueElements = this.generateUniqueElements(pageNumber, previousImages);
    if (uniqueElements) {
      prompt += `, ${uniqueElements}`;
    }

    return prompt;
  }

  private analyzeStoryContent(storyText: string): any {
    const text = storyText.toLowerCase();
    
    return {
      setting: this.detectSetting(text),
      actions: this.detectActions(text),
      objects: this.detectObjects(text),
      mood: this.detectMood(text),
      timeOfDay: this.detectTimeOfDay(text)
    };
  }

  private detectSetting(text: string): string {
    const settings = [
      { keywords: ['forest', 'tree', 'woods', 'jungle'], setting: 'enchanted forest' },
      { keywords: ['beach', 'ocean', 'sea', 'sand'], setting: 'beautiful beach' },
      { keywords: ['mountain', 'hill', 'peak'], setting: 'majestic mountains' },
      { keywords: ['city', 'street', 'building'], setting: 'colorful city' },
      { keywords: ['home', 'house', 'room'], setting: 'cozy home interior' },
      { keywords: ['garden', 'flower', 'park'], setting: 'magical garden' },
      { keywords: ['school', 'classroom'], setting: 'friendly school' },
      { keywords: ['farm', 'barn', 'field'], setting: 'peaceful farm' },
      { keywords: ['castle', 'palace'], setting: 'fairy tale castle' },
      { keywords: ['space', 'star', 'planet'], setting: 'magical space scene' }
    ];

    for (const { keywords, setting } of settings) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return setting;
      }
    }
    
    return 'beautiful outdoor scene';
  }

  private detectActions(text: string): string[] {
    const actions = [
      'playing', 'running', 'jumping', 'laughing', 'reading', 'learning',
      'exploring', 'discovering', 'helping', 'sharing', 'dancing', 'singing'
    ];
    
    return actions.filter(action => text.includes(action));
  }

  private detectObjects(text: string): string[] {
    const objects = [
      'book', 'ball', 'flower', 'tree', 'animal', 'bird', 'butterfly',
      'toy', 'bicycle', 'kite', 'rainbow', 'cloud', 'sun', 'moon'
    ];
    
    return objects.filter(obj => text.includes(obj));
  }

  private detectMood(text: string): string {
    if (text.includes('happy') || text.includes('joy') || text.includes('fun')) {
      return 'joyful and bright';
    }
    if (text.includes('adventure') || text.includes('explore')) {
      return 'adventurous and exciting';
    }
    if (text.includes('peaceful') || text.includes('calm')) {
      return 'peaceful and serene';
    }
    return 'warm and friendly';
  }

  private detectTimeOfDay(text: string): string {
    if (text.includes('morning') || text.includes('sunrise')) return 'morning light';
    if (text.includes('night') || text.includes('moon') || text.includes('star')) return 'magical nighttime';
    if (text.includes('sunset') || text.includes('evening')) return 'golden sunset';
    return 'bright daylight';
  }

  private buildCharacterDescription(userInfo: UserInfo): string {
    const { avatar, age } = userInfo;
    
    let description = '';
    
    // Age-appropriate description
    if (age <= 6) {
      description += 'a cute young child';
    } else if (age <= 10) {
      description += 'a cheerful child';
    } else {
      description += 'a confident young person';
    }

    // Physical characteristics based on avatar
    if (avatar?.type === 'boy') {
      description += ' boy';
    } else if (avatar?.type === 'girl') {
      description += ' girl';
    } else {
      description += '';
    }

    // Skin tone representation (realistic and respectful)
    if (avatar?.skinTone) {
      switch (avatar.skinTone) {
        case 'pale':
          description += ' with fair skin';
          break;
        case 'light':
          description += ' with light skin';
          break;
        case 'medium':
          description += ' with medium skin tone';
          break;
        case 'olive':
          description += ' with olive skin';
          break;
        case 'dark':
          description += ' with beautiful dark skin, African or African-American features';
          break;
      }
    }

    return description;
  }

  private buildSceneDescription(storyElements: any, pageNumber: number): string {
    let scene = `A ${storyElements.mood} scene in ${storyElements.setting}`;
    
    if (storyElements.timeOfDay) {
      scene += ` during ${storyElements.timeOfDay}`;
    }
    
    if (storyElements.actions.length > 0) {
      scene += `, with ${storyElements.actions.slice(0, 2).join(' and ')}`;
    }
    
    if (storyElements.objects.length > 0) {
      scene += `, including ${storyElements.objects.slice(0, 2).join(' and ')}`;
    }

    return scene;
  }

  private storyMentionsMainCharacter(storyText: string, userName: string): boolean {
    const text = storyText.toLowerCase();
    const name = userName.toLowerCase();
    
    return text.includes(name) || 
           text.includes('you') || 
           text.includes('your') ||
           text.includes('character') ||
           text.includes('hero') ||
           text.includes('main');
  }

  private generateUniqueElements(pageNumber: number, previousImages: string[]): string {
    const uniqueElements = [
      'unique perspective',
      'different angle view',
      'creative composition',
      'artistic style variation',
      'new visual elements'
    ];
    
    // Add page-specific elements to ensure uniqueness
    const pageSpecific = [
      'foreground focus',
      'background detail',
      'side view angle',
      'close-up detail',
      'wide landscape view'
    ];

    const element = uniqueElements[pageNumber % uniqueElements.length];
    const pageElement = pageSpecific[pageNumber % pageSpecific.length];
    
    return `${element}, ${pageElement}`;
  }

  private generateUniqueSeed(): number {
    let seed;
    let attempts = 0;
    
    do {
      seed = Math.floor(Math.random() * 1000000);
      attempts++;
    } while (this.usedSeeds.has(seed) && attempts < 100);
    
    return seed;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString();
  }

  // Clear cache if needed
  clearCache(): void {
    this.generatedImages.clear();
    this.usedSeeds.clear();
  }

  // Get cached images for a story
  getCachedImages(): GeneratedImage[] {
    return Array.from(this.generatedImages.values());
  }
}