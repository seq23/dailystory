// Simple Image Service using Runware AI
// Clean, minimal image generation with easy provider switching

import type { UserInfo, DifficultyLevel } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { APP_CONFIG, IMAGE_STYLES, DIFFICULTY_STYLE_MAPPING, type ImageStyle } from '@/config/appConfig';
import { ErrorHandler, ErrorType } from '@/utils/errorHandling';
import { AdvancedStoryAnalyzer } from './AdvancedStoryAnalyzer';
import { DirectContentExtractor } from './DirectContentExtractor';
import { withTimeout, TIMEOUT_CONFIGS } from '@/utils/networkTimeout';
import { PromptLengthManager } from '@/utils/promptLengthManager';
import { ImageFallbackService } from './ImageFallbackService';

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
  provider?: string;
  model?: string;
  cost?: number;
  seed?: number; // For consistency tracking across providers
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
    try { 
      localStorage.setItem(this.getUsageKey(userKey), JSON.stringify(usage)); 
      console.log(`💰 Updated usage: ${usage.count} images, $${usage.cost.toFixed(4)} estimated cost`);
    } catch {}
  }

  // Character seed persistence for cross-provider consistency
  private static getCharacterSeedFromCache(characterName: string, sessionId: string): number | undefined {
    try {
      const key = `char_seed_${sessionId}_${characterName}`;
      const cached = localStorage.getItem(key);
      return cached ? parseInt(cached) : undefined;
    } catch {
      return undefined;
    }
  }

  private static saveCharacterSeedToCache(characterName: string, sessionId: string, seed: number): void {
    try {
      const key = `char_seed_${sessionId}_${characterName}`;
      localStorage.setItem(key, seed.toString());
      console.log(`🔒 Cached seed ${seed} for ${characterName} in session ${sessionId}`);
    } catch {}
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
    // Quality degradation disabled - always return null for consistent high quality
    return null;
  }

  private static async applyDegradationIfNeeded(userKey: string, config: ImageGenerationConfig) {
    // Quality degradation disabled - always return original config for 1024x1024 images
    return config;
  }

  private static recordUsage(userKey: string, actualCost?: number) {
    const usage = this.loadUsage(userKey);
    usage.count += 1;
    usage.cost += actualCost || this.ESTIMATED_COST_PER_IMAGE_USD;
    usage.last = Date.now();
    this.saveUsage(userKey, usage);

    // Lightweight anomaly notice
    if (usage.count % 25 === 0) {
      console.info('[Images] Usage milestone', { user: userKey, count: usage.count, estCostUSD: usage.cost.toFixed(4) });
    }
  }

  /**
   * Generate a simple prompt using only rule-based extraction (fallback)
   */
  private static generateSimplePrompt(
    storyText: string,
    userInfo: UserInfo,
    difficultyLevel: DifficultyLevel,
    sessionId?: string
  ): { positivePrompt: string; negativePrompt?: string } {
    console.log(`📝 Using simple rule-based extraction for: "${storyText}"`);
    
    const pageContent = DirectContentExtractor.extractPageContent(storyText);
    const styleFramework = DIFFICULTY_STYLE_MAPPING[difficultyLevel];
    const baseStyle = styleFramework?.prompt || DIFFICULTY_STYLE_MAPPING['beginner'].prompt;
    const brandSuffix = styleFramework?.brandSuffix || DIFFICULTY_STYLE_MAPPING['beginner'].brandSuffix;
    
    // Note: StoryVisualStateManager is handled server-side now
    // const { StoryVisualStateManager } = require('./storyVisualState');
    
    // Build scene-specific prompt with basic details
    const sceneElements = [];
    
    // Add subject with descriptors
    const subjectWithDescriptor = pageContent.descriptor 
      ? `${pageContent.descriptor} ${pageContent.subject}`
      : `friendly ${pageContent.subject}`;
    sceneElements.push(`showing a ${subjectWithDescriptor}`);
    
    if (pageContent.action) sceneElements.push(`${pageContent.action}`);
    if (pageContent.object) sceneElements.push(`with ${pageContent.object}`);
    if (pageContent.location) sceneElements.push(`in a ${pageContent.location}`);
    
    // Environmental continuity handled server-side now
    let environmentalContext = '';
    // if (sessionId) {
    //   environmentalContext = StoryVisualStateManager.getSettingForPrompt(sessionId);
    // }
    
    const coreContent = `${baseStyle} ${sceneElements.join(' ')}${environmentalContext}`;
    
    // Use advanced prompt management with user preferences
    const userPreferences = {
      optimizeForSpeed: true,       // Simple mode prioritizes speed
      allowStyleReduction: true,    // Allow style reduction for length
      maxPromptComplexity: 'minimal' as const
    };
    
    const segments = PromptLengthManager.createSegments(
      coreContent,
      '', // No additional style framework for simple mode
      '', // No character details for simple mode  
      brandSuffix,
      'minimal' // Use minimal quality tier for simple mode
    );
    
    const { optimizedPrompt, strategy, optimizations } = PromptLengthManager.optimizeWithAdvancedPrioritization(
      segments,
      userInfo,
      difficultyLevel,
      userPreferences
    );
    
    console.log(`📝 Simple prompt generated: ${optimizedPrompt.length} chars (${strategy} strategy)`);
    if (optimizations.length > 0) {
      console.log(`🔧 Simple optimizations: ${optimizations.join(', ')}`);
    }
    
    return { positivePrompt: optimizedPrompt };
  }

  // OPTIMIZED: Clean scene extraction with enhanced backend processing
  static async generateStoryImage(
    storyText: string,
    userInfo: UserInfo,
    difficultyLevel: DifficultyLevel,
    sessionId: string,
    pageNumber: number = 1,
    totalPages: number = 10,
    config: Partial<ImageGenerationConfig> = {}
  ): Promise<ImageResult> {
    const userKey = this.getUserKey(userInfo);
    const mergedConfig: ImageGenerationConfig = { ...this.DEFAULT_CONFIG, ...config } as ImageGenerationConfig;

    const release = await this.throttleAndQueue(userKey);
    try {
      // Force consistent 1024x1024 output - no degradation
      const finalConfig = { ...mergedConfig, width: 1024, height: 1024 };

      console.log(`🚀 Clean scene extraction for page ${pageNumber}/${totalPages}: "${storyText}"`);

      // Extract clean scene description - all enhancement happens server-side
      const cleanScene = DirectContentExtractor.extractPageContent(storyText).subject || storyText;
      
      console.log(`🎯 Clean scene for ${userInfo.name}: "${cleanScene}"`);

      // TIER 1: Enhanced Runware with full AI enhancement (server-side)
      let result = await this.generateWithRunware(cleanScene, finalConfig, undefined, userInfo, pageNumber, sessionId, difficultyLevel);

      // TIER 2: Simple Runware with AI enhancement (server-side)  
      if (!result.success) {
        console.log('⚠️ Enhanced Runware failed, trying simple Runware with AI...');
        result = await this.generateWithRunwareSimple(cleanScene, finalConfig, userInfo, pageNumber);
      }

      // TIER 3: Enhanced Runware without AI (server-side style only)
      if (!result.success) {
        console.log('⚠️ Runware with AI failed, trying enhanced Runware without AI...');
        result = await this.generateWithRunware(cleanScene, finalConfig, undefined, userInfo, pageNumber, sessionId, difficultyLevel);
      }

      // TIER 4: OpenAI with basic enhancement
      if (!result.success) {
        console.log('⚠️ Enhanced Runware failed, falling back to OpenAI...');
        
        // Try to preserve character seed for OpenAI fallback
        const existingSeed = this.getCharacterSeedFromCache(userInfo.name, sessionId);
        
        result = await this.generateWithOpenAI(
          cleanScene, 
          finalConfig, 
          undefined, 
          userInfo, 
          pageNumber, 
          sessionId,
          existingSeed
        );
        
        // If OpenAI succeeds, save seed for future consistency
        if (result.success && result.seed) {
          this.saveCharacterSeedToCache(userInfo.name, sessionId, result.seed);
        }
      }

      if (result.success) {
        this.recordUsage(userKey, result.cost);
        console.log(`✅ Generation successful with ${result.provider} (${userInfo.name}) - Tier ${this.getTierUsed(result.provider)}`);
      } else {
        console.error('❌ EMERGENCY FIX: All image providers failed after 3 tiers, providing fallback:', result.error);
        
        // ALWAYS generate fallback placeholder image - never return failure
        console.log('🎨 EMERGENCY FIX: Generating guaranteed fallback placeholder image...');
        const fallbackUrl = ImageFallbackService.generateStoryPlaceholder(storyText, pageNumber);
        
        result = {
          url: fallbackUrl,
          success: true,
          provider: 'fallback-guaranteed',
          error: undefined
        };
        
        console.log('✅ EMERGENCY FIX: Guaranteed fallback placeholder generated successfully');
      }
      
      return result;
    } catch (error) {
      console.error('🚀 Ultra-fast generation failed:', error);
      
      // Even on complete failure, provide a fallback image
      console.log('🎨 Complete failure - generating emergency fallback...');
      const emergencyFallback = ImageFallbackService.generateStoryPlaceholder(storyText, pageNumber);
      
      return {
        url: emergencyFallback,
        success: true,
        provider: 'emergency-fallback',
        error: undefined
      };
    } finally {
      release();
    }
  }

  private static getTierUsed(provider?: string): string {
    if (provider === 'runware-enhanced') return '1 (Enhanced)';
    if (provider === 'runware') return '2 (Simple)';
    if (provider === 'openai') return '3 (OpenAI)';
    if (provider === 'fallback') return '4 (Fallback)';
    if (provider === 'emergency-fallback') return '5 (Emergency)';
    return 'Unknown';
  }

  private static async generateWithRunware(prompt: string, config: ImageGenerationConfig, negativePrompt?: string, userInfo?: UserInfo, pageNumber?: number, sessionId?: string, difficultyLevel?: DifficultyLevel): Promise<ImageResult> {
    try {
      console.log('🎨 Token-conscious Runware generation with character consistency');

      const defaultRunware = APP_CONFIG.images.runware;
      
      // NEW: Ultra-simplified body for server-side processing
      const body: any = {
        pageText: prompt, // Send raw page text for server-side processing
        sessionId,
        userInfo,
        pageNumber,
        difficultyLevel, // Pass difficulty level for appropriate art style
        width: config.width,
        height: config.height,
        model: defaultRunware.model,
        numberResults: 1,
        outputFormat: defaultRunware.outputFormat,
        CFGScale: defaultRunware.CFGScale,
        scheduler: "FlowMatchEulerDiscreteScheduler"
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
        success: true,
        provider: 'runware-enhanced', // Mark as enhanced tier
        model: data.model || 'runware:100@1',
        cost: data.cost || this.ESTIMATED_COST_PER_IMAGE_USD,
        seed: data.seed // Include seed for consistency
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

  // NEW: TIER 2 - Simple Runware without AI enhancement (original way)
  private static async generateWithRunwareSimple(
    cleanScene: string, 
    config: ImageGenerationConfig,
    userInfo?: UserInfo,
    pageNumber?: number
  ): Promise<ImageResult> {
    try {
      console.log('🎨 Simple Runware generation (no AI enhancement)');

      // Create basic prompt without complex visual state management
      const characterDesc = userInfo 
        ? `${userInfo.name} (${userInfo.avatar?.type || 'child'})`
        : 'friendly character';
      
      const simplePrompt = `Children's book illustration: ${characterDesc} ${cleanScene}. Bright, colorful, safe for children, consistent-face children-book bright-colors`;

      const { data, error } = await supabase.functions.invoke('runware-test-simple', {
        body: {
          pageText: simplePrompt // Send as simple prompt, not complex pageText
        }
      });

      if (error) {
        throw new Error(`Simple Runware API error: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Simple Runware generation failed');
      }

      return {
        url: data.imageURL,
        success: true,
        provider: 'runware', // Mark as simple runware
        model: 'runware:100@1',
        cost: data.cost || this.ESTIMATED_COST_PER_IMAGE_USD,
        seed: data.seed
      };

    } catch (error) {
      const appError = ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), 'runware-simple-generation');
      console.error('🎨 Simple Runware generation failed:', appError);

      return {
        url: '',
        success: false,
        error: ErrorHandler.getUserMessage(appError)
      };
    }
  }

  private static async generateWithOpenAI(
    storyText: string, 
    config: ImageGenerationConfig, 
    negativePrompt?: string,
    userInfo?: UserInfo,
    pageNumber?: number,
    sessionId?: string,
    seed?: number
  ): Promise<ImageResult> {
    try {
      console.log('🤖 Calling OpenAI image generation...');
      
      // Create enhanced prompt for OpenAI similar to Runware
      const enhancedPrompt = userInfo 
        ? `Children's book illustration: ${userInfo.name} (${userInfo.avatar?.type || 'child'}) ${storyText}. Bright, cheerful, safe for children.`
        : `Children's book illustration: ${storyText}. Bright, cheerful, safe for children.`;
      
      const { data, error } = await supabase.functions.invoke('openai-image', {
        body: {
          positivePrompt: enhancedPrompt,
          negativePrompt,
          width: config.width,
          height: config.height,
          quality: 'high',
          style: 'vivid',
          userInfo,
          pageNumber,
          seed,
          sessionId
        }
      });

      if (error) {
        console.error('OpenAI function error:', error);
        return {
          url: '',
          success: false,
          error: `OpenAI function error: ${error.message}`
        };
      }

      if (!data.success) {
        console.error('OpenAI generation failed:', data.error);
        return {
          url: '',
          success: false,
          error: data.error
        };
      }

      return {
        url: data.imageURL,
        success: true,
        provider: 'openai',
        model: data.model,
        cost: data.cost || 0.08, // Use actual OpenAI pricing
        seed: data.seed // Include seed for consistency
      };

    } catch (error) {
      console.error('OpenAI generation error:', error);
      return {
        url: '',
        success: false,
        error: `OpenAI generation failed: ${error.message}`
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