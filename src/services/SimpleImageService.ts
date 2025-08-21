import { supabase } from '@/integrations/supabase/client';
import type { UserInfo, DifficultyLevel } from '@/types';
import { ErrorHandler } from '@/utils/errorHandling';
import { UnifiedCharacterDescriptor } from './UnifiedCharacterDescriptor';

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
    
    // For dark skin tone, route to FixedCulturalLogic for African American hair variety
    if (avatar.skinTone === 'dark') {
      // Return indicator that requires special cultural logic processing
      return 'requires_cultural_processing';
    }
    
    return universalHairMap[avatar.skinTone] || 'brown';
  }

  // NEW: Universal hair mapping that handles cultural logic
  private static getUniversalHairMapping(userInfo: UserInfo): string {
    if (!userInfo?.avatar?.skinTone) return 'brown';
    
    // Check if we need cultural processing for dark skin + English
    if (userInfo.avatar.skinTone === 'dark' && userInfo.nativeLanguage === 'en') {
      // Import FixedCulturalLogic for African American hair variety
      return 'natural textured hair'; // Simplified representation
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

  // Character seed caching for consistency - now properly integrated
  private static getCharacterSeedKey(userInfo: UserInfo, sessionId?: string): string {
    return `char_seed_${userInfo.name}_${sessionId || 'global'}`;
  }

  // Get cached character seed for consistency
  private static async getStoredCharacterSeed(userInfo: UserInfo, sessionId?: string): Promise<number | undefined> {
    try {
      const { StoryVisualStateManager } = await import('./storyVisualState');
      if (sessionId && userInfo.name) {
        return StoryVisualStateManager.getCharacterSeed(sessionId, userInfo.name);
      }
    } catch (error) {
      console.warn('Failed to get character seed:', error);
    }
    return undefined;
  }

  // Store successful character seed for consistency
  private static async storeCharacterSeed(userInfo: UserInfo, sessionId: string, seed: number, pageNumber: number): Promise<void> {
    try {
      const { StoryVisualStateManager } = await import('./storyVisualState');
      if (userInfo.name) {
        const characterDesc = await this.generateCulturalCharacterDescription(userInfo);
        StoryVisualStateManager.updateCharacterWithSeed(sessionId, userInfo.name, characterDesc, seed, pageNumber);
        console.log(`✅ Stored character seed ${seed} for ${userInfo.name} in session ${sessionId}`);
      }
    } catch (error) {
      console.warn('Failed to store character seed:', error);
    }
  }

  // Generate cultural character description using unified service
  private static async generateCulturalCharacterDescription(userInfo: UserInfo): Promise<string> {
    try {
      return UnifiedCharacterDescriptor.getCharacterDescriptionSafe(userInfo);
    } catch (error) {
      console.warn('Failed to generate cultural description, using basic fallback:', error);
      return `${userInfo.avatar?.type || 'child'} with ${userInfo.avatar?.skinTone || 'medium'} skin`;
    }
  }

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

  // Enhanced prompt generation using EnhancedPromptBuilder
  private static async generateEnhancedPrompt(
    pageText: string, 
    userInfo: UserInfo, 
    pageNumber: number, 
    sessionId: string
  ): Promise<string> {
    try {
      const { EnhancedPromptBuilder } = await import('./EnhancedPromptBuilder');
      
      const result = await EnhancedPromptBuilder.buildCompletePrompt(
        pageText,
        userInfo,
        pageNumber,
        sessionId,
        {
          maxTokens: 300,
          enableDeduplication: true,
          enableCharacterConsistency: true,
          prioritizeCharacterDetails: true
        }
      );
      
      console.log('✨ Enhanced prompt generated with deduplication and caching');
      return result.prompt;
    } catch (error) {
      console.warn('EnhancedPromptBuilder not available, falling back to legacy prompt generation:', error);
      return this.generateLegacyPrompt(pageText, userInfo);
    }
  }

  // Legacy prompt generation as fallback
  private static async generateLegacyPrompt(pageText: string, userInfo?: UserInfo): Promise<string> {
    let characterDesc = 'friendly character';
    
    if (userInfo && userInfo.avatar) {
      try {
        characterDesc = UnifiedCharacterDescriptor.getCharacterDescriptionSafe(userInfo);
        
        if (userInfo.name && pageText.toLowerCase().includes(userInfo.name.toLowerCase())) {
          characterDesc = `${userInfo.name} (${characterDesc})`;
        }
      } catch (error) {
        console.warn('UnifiedCharacterDescriptor not available, using basic description:', error);
        characterDesc = `${userInfo.avatar?.type || 'child'} with ${userInfo.avatar?.skinTone || 'medium'} skin`;
      }
    }
    
    try {
      const { StructuredPromptEngine } = await import('./StructuredPromptEngine');
      const extractedContent = StructuredPromptEngine.extractPageContent(pageText);
      
      const visualElements = extractedContent.object 
        ? ` featuring ${extractedContent.object}` 
        : '';
      
      return `Children's book illustration: ${characterDesc}. Scene: ${pageText}${visualElements}. Bright, colorful, safe for children, consistent character appearance`;
    } catch (error) {
      console.warn('⚠️ StructuredPromptEngine not available, using basic prompt');
      return `Children's book illustration: ${characterDesc}. Scene: ${pageText}. Bright, colorful, safe for children, consistent character appearance`;
    }
  }

  // Main generation method - now a thin wrapper calling backend orchestrator
  // Preserves existing interface for frontend callers
  static async generateStoryImage(
    pageText: string,
    userInfo: UserInfo,
    difficulty: DifficultyLevel = 'medium',
    sessionId?: string,
    pageNumber?: number,
    totalPages?: number
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
          sessionId,
          pageNumber,
          totalPages,
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

  // Provider methods for backward compatibility
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
}