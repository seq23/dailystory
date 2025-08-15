// Ultra-simplified image service for server-side visual processing
import { supabase } from '@/integrations/supabase/client';
import { UserInfo } from '@/types';

export interface ImageGenerationConfig {
  provider: 'runware' | 'openai';
  width: number;
  height: number;
  style?: string;
}

export interface ImageResult {
  url: string;
  success: boolean;
  error?: string;
  provider?: string;
  model?: string;
  cost?: number;
}

export class OptimizedImageService {
  private static readonly DEFAULT_CONFIG: ImageGenerationConfig = {
    provider: 'runware',
    width: 1024,
    height: 1024,
    style: 'children-book-illustration'
  };

  // Ultra-fast image generation with server-side processing
  static async generateStoryImage(
    pageText: string,
    userInfo: UserInfo,
    sessionId?: string,
    pageNumber?: number,
    config: Partial<ImageGenerationConfig> = {}
  ): Promise<ImageResult> {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    
    console.log(`🚀 Ultra-fast generation: "${pageText}" (page ${pageNumber})`);
    
    try {
      // Direct call to optimized edge function
      const { data, error } = await supabase.functions.invoke('runware-generate-image', {
        body: {
          pageText,
          sessionId,
          userInfo,
          pageNumber: pageNumber || 1,
          width: finalConfig.width,
          height: finalConfig.height,
          model: "runware:100@1",
          numberResults: 1,
          outputFormat: "WEBP",
          CFGScale: 1,
          scheduler: "FlowMatchEulerDiscreteScheduler"
        }
      });

      if (error) {
        throw new Error(`Generation error: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Image generation failed');
      }

      return {
        url: data.imageURL,
        success: true,
        provider: 'runware',
        model: 'runware:100@1',
        cost: data.cost || 0.01
      };

    } catch (error) {
      console.error('🚀 Ultra-fast generation failed:', error);
      return {
        url: '',
        success: false,
        error: error instanceof Error ? error.message : 'Generation failed'
      };
    }
  }

  // Fallback to OpenAI if needed
  static async generateWithOpenAI(
    prompt: string,
    config: ImageGenerationConfig
  ): Promise<ImageResult> {
    try {
      const { data, error } = await supabase.functions.invoke('openai-image', {
        body: {
          prompt,
          size: `${config.width}x${config.height}`,
          quality: "standard",
          style: "vivid"
        }
      });

      if (error) {
        throw new Error(`OpenAI error: ${error.message}`);
      }

      return {
        url: data.url,
        success: true,
        provider: 'openai',
        model: 'dall-e-3',
        cost: 0.04
      };

    } catch (error) {
      console.error('OpenAI generation failed:', error);
      return {
        url: '',
        success: false,
        error: error instanceof Error ? error.message : 'OpenAI generation failed'
      };
    }
  }
}