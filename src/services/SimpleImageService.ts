// Simple Image Service using Runware AI
// Clean, minimal image generation with easy provider switching

import type { UserInfo } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { APP_CONFIG, IMAGE_STYLES, type ImageStyle } from '@/config/appConfig';
import { ErrorHandler, ErrorType } from '@/utils/errorHandling';
import { DirectContentExtractor } from './DirectContentExtractor';

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
}

export class SimpleImageService {
  private static readonly DEFAULT_CONFIG: ImageGenerationConfig = {
    provider: APP_CONFIG.images.defaultProvider,
    width: APP_CONFIG.images.runware.width,
    height: APP_CONFIG.images.runware.height,
    style: 'children-book-illustration'
  };


  static async generateStoryImage(
    storyText: string, 
    userInfo: UserInfo, 
    pageNumber: number = 1,
    totalPages: number = 10,
    config: Partial<ImageGenerationConfig> = {}
  ): Promise<ImageResult> {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    
    try {
      console.log(`🎨 Direct Image: Creating image for page ${pageNumber}/${totalPages} - "${storyText}"`);
      
      // Extract page content directly 
      const directPrompt = DirectContentExtractor.createSimplePrompt(storyText, userInfo);
      
      const negativePrompt = [
        'scary', 'dark', 'violent', 'inappropriate', 'adult content', 'disturbing',
        'blurry', 'low quality', 'distorted', 'text', 'words', 'letters'
      ].join(', ');
      
      const result = finalConfig.provider === 'runware' 
        ? await this.generateWithRunware(directPrompt, finalConfig, negativePrompt)
        : await this.generateWithDALLE(directPrompt, finalConfig);
      
      return result;
      
    } catch (error) {
      console.error('🎨 Direct Image: Generation failed:', error);
      return {
        url: '',
        success: false,
        error: error instanceof Error ? error.message : 'Image generation failed'
      };
    }
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