// Simple Image Service using Runware AI
// Clean, minimal image generation with easy provider switching

import type { UserInfo } from '@/types';

export interface ImageGenerationConfig {
  provider: 'runware' | 'dalle';
  width: number;
  height: number;
  style: string;
}

export interface ImageResult {
  url: string;
  success: boolean;
  error?: string;
}

export class SimpleImageService {
  private static readonly DEFAULT_CONFIG: ImageGenerationConfig = {
    provider: 'runware',
    width: 1024,
    height: 1024,
    style: 'children-book-illustration'
  };

  static async generateStoryImage(
    storyText: string, 
    userInfo: UserInfo, 
    pageNumber: number = 1,
    config: Partial<ImageGenerationConfig> = {}
  ): Promise<ImageResult> {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    
    try {
      console.log(`🎨 Simple Image: Generating image for page ${pageNumber} using ${finalConfig.provider}`);
      
      // Create character-consistent prompt
      const characterDescription = this.buildCharacterDescription(userInfo);
      const prompt = this.buildImagePrompt(storyText, characterDescription, finalConfig.style);
      
      if (finalConfig.provider === 'runware') {
        return await this.generateWithRunware(prompt, finalConfig);
      } else {
        return await this.generateWithDALLE(prompt, finalConfig);
      }
      
    } catch (error) {
      console.error('🎨 Simple Image: Generation failed:', error);
      return {
        url: '',
        success: false,
        error: error instanceof Error ? error.message : 'Image generation failed'
      };
    }
  }

  private static buildCharacterDescription(userInfo: UserInfo): string {
    // Simple, consistent character description
    const age = userInfo.age;
    const ageGroup = age <= 5 ? 'young child' : age <= 8 ? 'child' : age <= 12 ? 'older child' : 'young person';
    
    return `${ageGroup} named ${userInfo.name}, ${userInfo.avatar?.type || 'friendly'} appearance with ${userInfo.avatar?.skinTone || 'warm'} skin tone`;
  }

  private static buildImagePrompt(storyText: string, characterDescription: string, style: string): string {
    // Extract key elements from story text
    const cleanText = storyText.toLowerCase();
    const actions = this.extractActions(cleanText);
    const setting = this.extractSetting(cleanText);
    
    return `A beautiful ${style} showing ${characterDescription} ${actions} in ${setting}. 
    Bright, cheerful, safe for children, high quality digital art, warm lighting, engaging composition.
    Style: professional children's book illustration, vibrant colors, friendly atmosphere.`;
  }

  private static extractActions(text: string): string {
    // Simple action extraction
    if (text.includes('play')) return 'playing happily';
    if (text.includes('adventure')) return 'on an adventure';
    if (text.includes('discover')) return 'discovering something wonderful';
    if (text.includes('friend')) return 'with friends';
    if (text.includes('learn')) return 'learning something new';
    return 'enjoying a peaceful moment';
  }

  private static extractSetting(text: string): string {
    // Simple setting extraction
    if (text.includes('forest') || text.includes('tree')) return 'a magical forest';
    if (text.includes('garden')) return 'a beautiful garden';
    if (text.includes('home') || text.includes('house')) return 'a cozy home';
    if (text.includes('school')) return 'a friendly school';
    if (text.includes('park')) return 'a sunny park';
    if (text.includes('beach') || text.includes('ocean')) return 'a peaceful beach';
    return 'a magical, safe place';
  }

  private static async generateWithRunware(prompt: string, config: ImageGenerationConfig): Promise<ImageResult> {
    try {
      // Use existing Runware service if available, otherwise call edge function directly
      const response = await fetch('/api/runware-generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          positivePrompt: prompt,
          width: config.width,
          height: config.height,
          model: 'runware:100@1',
          numberResults: 1,
          outputFormat: 'WEBP'
        })
      });

      if (!response.ok) {
        throw new Error(`Runware API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      return {
        url: data.imageURL || data.url,
        success: true
      };
      
    } catch (error) {
      console.error('🎨 Runware generation failed:', error);
      return {
        url: '',
        success: false,
        error: error instanceof Error ? error.message : 'Runware generation failed'
      };
    }
  }

  private static async generateWithDALLE(prompt: string, config: ImageGenerationConfig): Promise<ImageResult> {
    try {
      // Placeholder for DALL-E implementation
      // This would call OpenAI's DALL-E API when switched
      console.log('🎨 DALL-E generation not yet implemented');
      
      return {
        url: '',
        success: false,
        error: 'DALL-E provider not yet implemented'
      };
      
    } catch (error) {
      return {
        url: '',
        success: false,
        error: error instanceof Error ? error.message : 'DALL-E generation failed'
      };
    }
  }

  static switchProvider(newProvider: 'runware' | 'dalle'): void {
    // Configuration-driven provider switching
    console.log(`🎨 Simple Image: Switching provider to ${newProvider}`);
    // This would update a global config or local storage
  }

  static getAvailableProviders(): Array<{name: string; id: 'runware' | 'dalle'; costEffective: boolean}> {
    return [
      { name: 'Runware AI', id: 'runware', costEffective: true },
      { name: 'DALL-E 3', id: 'dalle', costEffective: false }
    ];
  }
}