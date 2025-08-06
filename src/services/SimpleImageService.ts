// Simple Image Service using Runware AI
// Clean, minimal image generation with easy provider switching

import type { UserInfo } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { APP_CONFIG, IMAGE_STYLES, type ImageStyle } from '@/config/appConfig';
import { ErrorHandler, ErrorType } from '@/utils/errorHandling';
import { AdvancedStoryAnalyzer, type StoryAnalysis } from './AdvancedStoryAnalyzer';

export interface ImageGenerationConfig {
  provider: 'runware' | 'dalle';
  width: number;
  height: number;
  style: ImageStyle;
}

export interface ImageResult {
  url: string;
  success: boolean;
  error?: string;
  analysis?: StoryAnalysis;
}

export class SimpleImageService {
  private static readonly DEFAULT_CONFIG: ImageGenerationConfig = {
    provider: APP_CONFIG.images.defaultProvider,
    width: APP_CONFIG.images.runware.width,
    height: APP_CONFIG.images.runware.height,
    style: 'children-book-illustration'
  };

  // Store previous analysis for continuity
  private static previousAnalysis: StoryAnalysis | undefined;

  static async generateStoryImage(
    storyText: string, 
    userInfo: UserInfo, 
    pageNumber: number = 1,
    totalPages: number = 10,
    config: Partial<ImageGenerationConfig> = {}
  ): Promise<ImageResult> {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    
    try {
      console.log(`🎨 Enhanced Image: Analyzing story content for page ${pageNumber}/${totalPages}`);
      
      // Advanced content analysis
      const analysis = AdvancedStoryAnalyzer.analyzeStoryContent(
        storyText, 
        pageNumber, 
        totalPages, 
        this.previousAnalysis
      );
      
      // Store for next iteration
      this.previousAnalysis = analysis;
      
      console.log(`🎨 Analysis complete:`, {
        action: analysis.mainAction,
        setting: analysis.setting.location,
        mood: analysis.mood,
        emotions: analysis.emotions,
        objects: analysis.objects.slice(0, 3)
      });
      
      // Generate enhanced prompt
      const enhancedPrompt = AdvancedStoryAnalyzer.generateEnhancedPrompt(
        analysis, 
        userInfo, 
        finalConfig.style
      );
      
      const fullPrompt = this.buildFinalPrompt(enhancedPrompt);
      
      const result = finalConfig.provider === 'runware' 
        ? await this.generateWithRunware(fullPrompt, finalConfig, enhancedPrompt.negativePrompt.join(', '))
        : await this.generateWithDALLE(fullPrompt, finalConfig);
      
      return {
        ...result,
        analysis
      };
      
    } catch (error) {
      console.error('🎨 Enhanced Image: Generation failed:', error);
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

  private static buildFinalPrompt(enhancedPrompt: any): string {
    const { mainPrompt, styleModifiers, compositionHints, colorPalette } = enhancedPrompt;
    
    return `${mainPrompt} ${styleModifiers.join(', ')}. ${compositionHints.join(', ')}. Color palette: ${colorPalette.join(', ')}.`;
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

  private static async generateWithRunware(prompt: string, config: ImageGenerationConfig, negativePrompt?: string): Promise<ImageResult> {
    try {
      console.log('🎨 Calling Supabase Edge Function for Runware image generation');
      
      const body: any = {
        positivePrompt: prompt,
        width: config.width,
        height: config.height,
        model: APP_CONFIG.images.runware.model,
        numberResults: 1,
        outputFormat: APP_CONFIG.images.runware.outputFormat,
        steps: APP_CONFIG.images.runware.steps,
        CFGScale: APP_CONFIG.images.runware.CFGScale
      };
      
      if (negativePrompt) {
        body.negativePrompt = negativePrompt;
      }
      
      const { data, error } = await supabase.functions.invoke('runware-generate-image', {
        body
      });

      if (error) {
        throw new Error(`Runware API error: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Image generation failed');
      }

      return {
        url: data.imageURL,
        success: true
      };
      
    } catch (error) {
      const appError = ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), 'runware-generation');
      console.error('🎨 Runware generation failed:', appError);
      
      return {
        url: '',
        success: false,
        error: ErrorHandler.getUserMessage(appError)
      };
    }
  }

  private static async generateWithDALLE(prompt: string, config: ImageGenerationConfig): Promise<ImageResult> {
    try {
      // Future DALL-E implementation would call OpenAI Edge Function
      console.log('🎨 DALL-E integration ready for implementation');
      
      // Would call: supabase.functions.invoke('openai-dalle', { body: { prompt, ...config } })
      
      return {
        url: '',
        success: false,
        error: 'DALL-E provider not yet implemented'
      };
      
    } catch (error) {
      const appError = ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), 'dalle-generation');
      
      return {
        url: '',
        success: false,
        error: ErrorHandler.getUserMessage(appError)
      };
    }
  }

  static switchProvider(newProvider: 'runware' | 'dalle'): void {
    // Configuration-driven provider switching
    console.log(`🎨 Simple Image: Switching provider to ${newProvider}`);
    APP_CONFIG.images.defaultProvider = newProvider;
    localStorage.setItem('preferredImageProvider', newProvider);
  }

  static getAvailableProviders(): Array<{name: string; id: 'runware' | 'dalle'; costEffective: boolean}> {
    return [
      { name: 'Runware AI', id: 'runware', costEffective: true },
      { name: 'DALL-E 3', id: 'dalle', costEffective: false }
    ];
  }
}