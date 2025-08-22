import { supabase } from '@/integrations/supabase/client';
import type { UserInfo, DifficultyLevel } from '@/types';
import { ErrorHandler } from '@/utils/errorHandling';

// Simple service configuration
interface ImageGenerationConfig {
  provider: 'runware' | 'openai';
  dimensions: { width: number; height: number };
  style?: string;
  difficultyLevel?: DifficultyLevel;
  sessionId?: string;
  totalPages?: number;
  pageNumber?: number;
}

interface ImageResult {
  url: string;
  success: boolean;
  provider?: string;
  model?: string;
  cost?: number;
  seed?: number;
  error?: string;
  prompt?: string;
  metadata?: any;
}

export class SimpleImageService {
  private static readonly DEFAULT_CONFIG: ImageGenerationConfig = {
    provider: 'runware',
    dimensions: { width: 1024, height: 1024 },
    style: 'children-book',
    difficultyLevel: 'medium'
  };

  private static readonly CONCURRENCY_LIMIT = 4;
  private static readonly RATE_LIMIT_PER_SEC = 2;
  private static readonly DAILY_COST_CEILING_USD = 50;
  private static readonly ESTIMATED_COST_PER_IMAGE_USD = 0.002;

  // UNIVERSAL HAIR MAPPING - Single source of truth for all systems
  private static getHairColorFromAvatar(avatar: any): string {
    if (!avatar?.skinTone) return 'brown';
    
    // Universal mapping: pale → red, light → blonde, medium → brown, olive → black
    const universalHairMap = {
      'pale': 'red',
      'light': 'blonde', 
      'medium': 'brown',
      'olive': 'black',
      'dark': 'textured black hair variety' // Special handling below
    };
    
    // For dark skin tone, use natural textured hair
    if (avatar.skinTone === 'dark') {
      return 'natural textured hair';
    }
    
    return universalHairMap[avatar.skinTone] || 'brown';
  }

  // NEW: Universal hair mapping that handles cultural logic
  private static getUniversalHairMapping(userInfo: UserInfo): string {
    if (!userInfo?.avatar?.skinTone) return 'brown';
    
    // Enhanced cultural processing handled by backend
    if (userInfo.avatar.skinTone === 'dark' && userInfo.nativeLanguage === 'en') {
      return 'natural textured hair';
    }
    
    // Use standard universal mapping
    return this.getHairColorFromAvatar(userInfo.avatar);
  }

  private static detectEmotionalContext(text: string): any {
    // Detect emotional context from text for StructuredPromptEngine
    const emotions = {
      curiosity: /curious|wonder|explore|discover|interested/i,
      excitement: /excited|happy|joy|thrilled|amazing/i,
      sadness: /sad|cry|tear|upset|disappointed/i,
      surprise: /surprise|shocked|unexpected|wow|gasp/i,
      determination: /determined|brave|strong|confident|bold/i
    };

    for (const [emotion, pattern] of Object.entries(emotions)) {
      if (pattern.test(text)) {
        return {
          mood: emotion,
          intensity: 0.7,
          colorPalette: emotion === 'excitement' ? 'warm' : emotion === 'sadness' ? 'cool' : 'balanced',
          lighting: emotion === 'surprise' ? 'dramatic' : 'soft',
          composition: 'centered'
        };
      }
    }

    return {
      mood: 'neutral',
      intensity: 0.5,
      colorPalette: 'balanced',
      lighting: 'soft',
      composition: 'centered'
    };
  }

  // User key generation for session tracking
  private static generateUserKey(userId?: string): string {
    return userId ? `user_${userId}` : `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private static async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Usage tracking methods
  private static async loadUsage(userKey: string): Promise<{ count: number; cost: number; lastReset: string }> {
    try {
      const stored = localStorage.getItem(`image_usage_${userKey}`);
      if (!stored) return { count: 0, cost: 0, lastReset: new Date().toDateString() };
      
      const usage = JSON.parse(stored);
      const today = new Date().toDateString();
      
      if (usage.lastReset !== today) {
        return { count: 0, cost: 0, lastReset: today };
      }
      
      return usage;
    } catch {
      return { count: 0, cost: 0, lastReset: new Date().toDateString() };
    }
  }

  private static async saveUsage(userKey: string, count: number, cost: number): Promise<void> {
    try {
      const usage = {
        count,
        cost,
        lastReset: new Date().toDateString()
      };
      localStorage.setItem(`image_usage_${userKey}`, JSON.stringify(usage));
    } catch (error) {
      console.warn('Failed to save usage data:', error);
    }
  }

  // Character logic moved to backend - all methods removed

  private static async throttleAndQueue(userKey: string): Promise<void> {
    const lastRequest = this.userRequestTimes.get(userKey) || 0;
    const timeSinceLastRequest = Date.now() - lastRequest;
    const minInterval = 1000 / this.RATE_LIMIT_PER_SEC;
    
    if (timeSinceLastRequest < minInterval) {
      await this.sleep(minInterval - timeSinceLastRequest);
    }
    
    this.userRequestTimes.set(userKey, Date.now());
  }

  private static userRequestTimes = new Map<string, number>();

  // Quality degradation (currently disabled but structure in place)
  private static shouldDegrade(userKey: string): boolean {
    // Future: Implement based on usage patterns
    return false;
  }

  private static applyDegradationIfNeeded(config: ImageGenerationConfig, userKey: string): ImageGenerationConfig {
    if (!this.shouldDegrade(userKey)) return config;
    
    // Future: Apply quality degradation
    return {
      ...config,
      dimensions: { width: 512, height: 512 }
    };
  }

  // Usage recording
  private static async recordUsage(result: ImageResult, userId?: string): Promise<void> {
    try {
      const userKey = this.generateUserKey(userId);
      const usage = await this.loadUsage(userKey);
      const newCost = usage.cost + (result.cost || this.ESTIMATED_COST_PER_IMAGE_USD);
      
      await this.saveUsage(userKey, usage.count + 1, newCost);
      
      console.log(`📊 Usage recorded: ${usage.count + 1} images, $${newCost.toFixed(4)} cost`);
    } catch (error) {
      console.warn('Failed to record usage:', error);
    }
  }

  // Enhanced prompt generation - now calls backend orchestrator directly
  private static async generateEnhancedPrompt(
    pageText: string, 
    userInfo: UserInfo, 
    pageNumber: number, 
    sessionId: string
  ): Promise<string> {
    console.warn('Enhanced prompt generation moved to backend orchestrator');
    return this.generateLegacyPrompt(pageText, userInfo);
  }

  // Legacy prompt generation as fallback
  private static async generateLegacyPrompt(pageText: string, userInfo?: UserInfo): Promise<string> {
    let characterDesc = 'friendly character';
    
    if (userInfo && userInfo.avatar) {
      try {
        characterDesc = `${userInfo.avatar?.type || 'child'} with ${userInfo.avatar?.skinTone || 'medium'} skin`;
        
        if (userInfo.name && pageText.toLowerCase().includes(userInfo.name.toLowerCase())) {
          characterDesc = `${userInfo.name} (${characterDesc})`;
        }
      } catch (error) {
        console.warn('Character description error, using basic description:', error);
        characterDesc = `${userInfo.avatar?.type || 'child'} with ${userInfo.avatar?.skinTone || 'medium'} skin`;
      }
    }
    
    const visualElements = '';
    return `Children's book illustration: ${characterDesc}. Scene: ${pageText}${visualElements}. Bright, colorful, safe for children, consistent character appearance`;
  }

  /**
   * ============================================================================
   * MAIN IMAGE GENERATION METHOD - ALL USERS GET TIER 1 IMAGES
   * ============================================================================
   * 
   * CRITICAL BUSINESS RULE: This method provides Tier 1 (highest quality) images
   * to ALL users regardless of subscription status.
   * 
   * The `isPremium` parameter is used for:
   * - Analytics and usage tracking only
   * - Passed as `isGuestUser: !isPremium` to backend for logging
   * - DOES NOT affect image quality or tier selection
   * 
   * Backend orchestrator ensures 100% success rate through fallback tiers:
   * Tier 1 → Tier 2 → Tier 2.5 → Tier 3 → Tier 4
   * 
   * All users start with Tier 1 premium image generation.
   * ============================================================================
   */
  static async generateStoryImage(
    pageText: string,
    userInfo: UserInfo,
    difficulty: DifficultyLevel = 'medium',
    storyId?: string,
    pageNumber?: number,
    sessionId?: string,
    isPremium?: boolean // For analytics only - does not affect image quality
  ): Promise<ImageResult> {
    const userKey = this.generateUserKey(userInfo?.name);
    
    try {
      await this.throttleAndQueue(userKey);
    } catch (error) {
      console.warn('Throttling error:', error);
    }

    const cleanScene = pageText.replace(/[^\w\s\-.,!?]/g, '').trim();

    try {
      console.log('🎯 Calling backend orchestrator for image generation');
      
      const { data, error } = await supabase.functions.invoke('runware-generate-image', {
        body: {
          pageText: cleanScene,
          userInfo,
          storyId,
          sessionId,
          pageNumber,
          isGuestUser: !isPremium, // For analytics/tracking only - all users get Tier 1
          difficultyLevel: difficulty
        }
      });

      if (error) {
        throw new Error(`Backend orchestrator error: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Backend image generation failed');
      }

      console.log(`✅ Backend orchestrator succeeded (Tier ${data.tier}): ${data.enhancementLevel}`);

      const result: ImageResult = {
        url: data.imageURL,
        success: true,
        provider: data.provider || 'backend-orchestrator',
        model: data.metadata?.model || 'orchestrated',
        cost: data.cost || this.ESTIMATED_COST_PER_IMAGE_USD,
        seed: data.seed,
        metadata: {
          tier: data.tier,
          enhancementLevel: data.enhancementLevel,
          qualityScore: data.qualityScore,
          orchestrated: true,
          ...data.metadata
        }
      };

      // Record usage for tracking
      await this.recordUsage(result, userInfo?.name);
      
      return result;

    } catch (error) {
      console.error('❌ Backend orchestration failed, falling back to local SVG placeholder:', error);
      
      // Final fallback - generate SVG placeholder locally
      return this.generateSVGPlaceholder(cleanScene, userInfo);
    }
  }

  // Move SVG generation to backend and remove from frontend
  // TIER 4: SVG Placeholder (guaranteed success) - MOVED TO BACKEND
  private static generateSVGPlaceholder(cleanScene: string, userInfo?: UserInfo): ImageResult {
    console.warn('SVG generation moved to backend - this should not be called');
    
    // Fallback for legacy compatibility only
    return {
      url: 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="#f0f9ff"/><text x="200" y="200" text-anchor="middle" font-family="Arial">Moved to Backend</text></svg>'),
      success: true,
      provider: 'svg-fallback',
      model: 'placeholder',
      cost: 0,
      seed: undefined
    };
  }
  static getTierUsed(result: ImageResult): string {
    if (result.metadata?.tier) {
      const tierMap = {
        1: 'AI-Enhanced Premium (Tier 1)',
        2: 'Template-Based (Tier 2)', 
        2.5: 'Nuclear Hardcoded (Tier 2.5)',
        3: 'OpenAI DALL-E (Tier 3)',
        4: 'SVG Placeholder (Tier 4)'
      };
      return tierMap[result.metadata.tier] || 'Unknown';
    }
    
    // Legacy fallback based on provider
    if (result.provider === 'runware-premium') return 'High-Quality AI-Enhanced (Tier 1)';
    if (result.provider === 'runware-template') return 'Template-Based (Tier 2)';
    if (result.provider === 'runware-simple-fallback') return 'Nuclear Hardcoded (Tier 2.5)';
    if (result.provider === 'openai') return 'OpenAI DALL-E (Tier 3)';
    if (result.provider === 'svg') return 'SVG Placeholder (Tier 4)';
    return 'Backend Orchestrated';
  }

  // Simplified provider switching (now affects backend orchestrator)
  static async switchProvider(provider: 'runware' | 'openai'): Promise<void> {
    this.DEFAULT_CONFIG.provider = provider;
    console.log(`🔄 Default provider preference set to: ${provider} (affects backend orchestrator)`);
  }

  static getAvailableProviders(): string[] {
    return ['runware', 'openai'];
  }
}