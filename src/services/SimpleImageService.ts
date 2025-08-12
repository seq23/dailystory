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

  // Invisible, ops-safe guardrails (per-user, per-session)
  private static inFlightPerUser: Record<string, number> = {};
  private static recentTimestampsPerUser: Record<string, number[]> = {};

  // Tunables
  private static readonly CONCURRENCY_LIMIT = 3; // per user
  private static readonly RATE_LIMIT_PER_SEC = 2; // per user
  private static readonly DAILY_COST_CEILING_USD = 2; // soft cap per user/day
  private static readonly ESTIMATED_COST_PER_IMAGE_USD = 0.002; // conservative estimate

  private static getUserKey(userInfo: UserInfo): string {
    return (userInfo as any)?.id || userInfo?.name || 'anonymous';
  }

  private static async sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
  }

  private static getUsageKey(userKey: string) {
    const day = new Date().toISOString().slice(0, 10);
    return `img_usage_${day}_${userKey}`;
  }

  private static loadUsage(userKey: string): { count: number; cost: number; last: number } {
    try {
      const raw = localStorage.getItem(this.getUsageKey(userKey));
      if (!raw) return { count: 0, cost: 0, last: 0 };
      return JSON.parse(raw);
    } catch {
      return { count: 0, cost: 0, last: 0 };
    }
  }

  private static saveUsage(userKey: string, usage: { count: number; cost: number; last: number }) {
    try { localStorage.setItem(this.getUsageKey(userKey), JSON.stringify(usage)); } catch {}
  }

  private static async throttleAndQueue(userKey: string) {
    // Concurrency control (polling-based, simple and robust)
    if (!this.inFlightPerUser[userKey]) this.inFlightPerUser[userKey] = 0;
    while (this.inFlightPerUser[userKey] >= this.CONCURRENCY_LIMIT) {
      await this.sleep(100);
    }

    // Rate limiting (token-less, timestamp window)
    const now = Date.now();
    const windowMs = 1000;
    const timestamps = (this.recentTimestampsPerUser[userKey] || []).filter(t => now - t < windowMs);
    if (timestamps.length >= this.RATE_LIMIT_PER_SEC) {
      const waitMs = windowMs - (now - timestamps[0]);
      if (waitMs > 0) await this.sleep(waitMs);
    }

    // Reserve slot
    this.inFlightPerUser[userKey]++;
    this.recentTimestampsPerUser[userKey] = [...(this.recentTimestampsPerUser[userKey] || []), Date.now()];

    // Return release function
    return () => {
      this.inFlightPerUser[userKey] = Math.max(0, (this.inFlightPerUser[userKey] || 1) - 1);
    };
  }

  private static shouldDegrade(userKey: string) {
    const usage = this.loadUsage(userKey);
    const ratio = usage.cost / this.DAILY_COST_CEILING_USD;
    if (ratio >= 1) return 'hard';
    if (ratio >= 0.8) return 'soft';
    return null;
  }

  private static async applyDegradationIfNeeded(userKey: string, config: ImageGenerationConfig) {
    const mode = this.shouldDegrade(userKey);
    if (!mode) return config;

    const degraded: ImageGenerationConfig = { ...config };
    if (mode === 'soft') {
      degraded.width = Math.min(config.width, 768);
      degraded.height = Math.min(config.height, 768);
      await this.sleep(150); // gentle pacing
      console.info('[Images] Soft-degrade active (cost nearing ceiling).');
    } else if (mode === 'hard') {
      degraded.width = Math.min(config.width, 512);
      degraded.height = Math.min(config.height, 512);
      await this.sleep(400); // stronger pacing
      console.info('[Images] Hard-degrade active (daily ceiling reached).');
    }
    return degraded;
  }

  private static recordUsage(userKey: string) {
    const usage = this.loadUsage(userKey);
    usage.count += 1;
    usage.cost += this.ESTIMATED_COST_PER_IMAGE_USD;
    usage.last = Date.now();
    this.saveUsage(userKey, usage);

    // Lightweight anomaly notice
    if (usage.count % 25 === 0) {
      console.info('[Images] Usage milestone', { user: userKey, count: usage.count, estCostUSD: usage.cost.toFixed(4) });
    }
  }

  static async generateStoryImage(
    storyText: string,
    userInfo: UserInfo,
    pageNumber: number = 1,
    totalPages: number = 10,
    config: Partial<ImageGenerationConfig> = {}
  ): Promise<ImageResult> {
    const userKey = this.getUserKey(userInfo);
    const mergedConfig: ImageGenerationConfig = { ...this.DEFAULT_CONFIG, ...config } as ImageGenerationConfig;

    const release = await this.throttleAndQueue(userKey);
    try {
      const finalConfig = await this.applyDegradationIfNeeded(userKey, mergedConfig);

      console.log(`🎨 Direct Image: Creating image for page ${pageNumber}/${totalPages}`);

      // Extract page content directly
      const directPrompt = DirectContentExtractor.createSimplePrompt(storyText, userInfo);

      const negativePrompt = [
        'scary', 'dark', 'violent', 'inappropriate', 'adult content', 'disturbing',
        'blurry', 'low quality', 'distorted', 'text', 'words', 'letters'
      ].join(', ');

      const result = finalConfig.provider === 'runware'
        ? await this.generateWithRunware(directPrompt, finalConfig, negativePrompt)
        : await this.generateWithDALLE(directPrompt, finalConfig);

      if (result.success) {
        this.recordUsage(userKey);
      }

      return result;
    } catch (error) {
      console.error('🎨 Direct Image: Generation failed:', error);
      return {
        url: '',
        success: false,
        error: error instanceof Error ? error.message : 'Image generation failed'
      };
    } finally {
      release();
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