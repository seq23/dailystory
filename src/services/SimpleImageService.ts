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

  // Generate cultural character description using frontend service
  private static async generateCulturalCharacterDescription(userInfo: UserInfo): Promise<string> {
    try {
      const { StructuredPromptEngine } = await import('./StructuredPromptEngine');
      return StructuredPromptEngine.generateCulturalCharacterDescription(userInfo);
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
        const { StructuredPromptEngine } = await import('./StructuredPromptEngine');
        characterDesc = StructuredPromptEngine.generateCulturalCharacterDescription(userInfo);
        
        if (userInfo.name && pageText.toLowerCase().includes(userInfo.name.toLowerCase())) {
          characterDesc = `${userInfo.name} (${characterDesc})`;
        }
      } catch (error) {
        console.warn('StructuredPromptEngine not available, using basic description:', error);
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

  // Main generation method with AI-enhanced tiered approach
  // AI Enhancement → Tier 1 → Tier 2 → Tier 2.5 → Tier 3 → Tier 4
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

    const config: ImageGenerationConfig = {
      ...this.DEFAULT_CONFIG,
      difficultyLevel: difficulty,
      sessionId
    };

    const cleanScene = pageText.replace(/[^\w\s\-.,!?]/g, '').trim();

    try {
      // TIER 1: AI-Enhanced High-Quality Runware
      console.log('🧠 Starting Tier 1: AI-Enhanced High-Quality Runware');
      
      // Step 1: Get AI enhancement data
      let enhancedStoryData = null;
      try {
        const { data: aiData, error: aiError } = await supabase.functions.invoke('ai-story-enhancer', {
          body: {
            storyText: cleanScene,
            userInfo,
            sessionId,
            pageNumber,
            totalPages
          }
        });
        
        if (aiData && !aiError) {
          enhancedStoryData = aiData.enhancedStoryData;
          console.log('🧠 AI enhancement successful:', aiData.extractedElements);
        }
      } catch (aiError) {
        console.warn('⚠️ AI enhancement failed, proceeding without:', aiError);
      }
      
      // Step 2: Generate with Runware using AI-enhanced data
      const tier1Result = await this.generateWithRunware(cleanScene, config, userInfo, sessionId, pageNumber, totalPages, enhancedStoryData);
      
      if (tier1Result.success) {
        console.log(`✅ Tier 1 ${enhancedStoryData ? 'AI-Enhanced' : 'Standard'} High-Quality succeeded`);
        await this.recordUsage(tier1Result, userInfo?.name);
        return tier1Result;
      }
      
      console.log('⚠️ Tier 1 failed, falling back to Tier 2 Template-based');
    } catch (error) {
      console.log('⚠️ Tier 1 error, falling back to Tier 2 Template-based:', error);
    }

    try {
      // TIER 2: Template-based (Dynamic but no AI)
      console.log('🎨 Starting Tier 2: Template-based Runware generation');
      const tier2Result = await this.generateWithRunwareSimple(cleanScene, config, userInfo, pageNumber, totalPages);
      
      if (tier2Result.success) {
        console.log('✅ Tier 2 Template-based succeeded');
        await this.recordUsage(tier2Result, userInfo?.name);
        return tier2Result;
      }
      
      console.log('⚠️ Tier 2 failed, trying Tier 2.5 Nuclear Hardcoded');
    } catch (error) {
      console.log('⚠️ Tier 2 error, trying Tier 2.5 Nuclear Hardcoded:', error);
    }

    try {
      // TIER 2.5: Simple Runware fallback with hardcoded extraction
      console.log('🔧 Starting Tier 2.5: Simple Runware fallback');
      const tier25Result = await this.generateWithRunwareSimpleFallback(cleanScene, config, userInfo, pageNumber);
      
      if (tier25Result.success) {
        console.log('✅ Tier 2.5 succeeded with hardcoded extraction');
        await this.recordUsage(tier25Result, userInfo?.name);
        return tier25Result;
      }
      
      console.log('⚠️ Tier 2.5 failed, falling back to Tier 3');
    } catch (error) {
      console.log('⚠️ Tier 2.5 error, falling back to Tier 3:', error);
    }

    try {
      // TIER 3: OpenAI DALL-E fallback
      console.log('🎯 Starting Tier 3: OpenAI DALL-E generation');
      const tier3Result = await this.generateWithOpenAI(cleanScene, userInfo, difficulty, sessionId, pageNumber, totalPages);
      
      if (tier3Result.success) {
        console.log('✅ Tier 3 succeeded');
        await this.recordUsage(tier3Result, userInfo?.name);
        return tier3Result;
      }
      
      console.log('⚠️ Tier 3 failed, falling back to SVG placeholder');
    } catch (error) {
      console.log('⚠️ Tier 3 error, falling back to SVG placeholder:', error);
    }

    // TIER 4: SVG Placeholder (guaranteed success)
    console.log('📝 Generating SVG placeholder as final fallback');
    return this.generateSVGPlaceholder(cleanScene, userInfo);
  }

  // Provider methods
  static getTierUsed(result: ImageResult): string {
    if (result.provider === 'runware-premium') return 'High-Quality AI-Enhanced (Tier 1)';
    if (result.provider === 'runware-template') return 'Template-Based (Tier 2)';
    if (result.provider === 'runware-simple-fallback') return 'Nuclear Hardcoded (Tier 2.5)';
    if (result.provider === 'openai') return 'OpenAI DALL-E (Tier 3)';
    if (result.provider === 'svg') return 'SVG Placeholder (Tier 4)';
    return 'Unknown';
  }

  // TIER 1: AI-Enhanced High-Quality Runware (uses EnhancedPromptBuilder + AI analysis)
  private static async generateWithRunware(
    cleanScene: string, 
    config: ImageGenerationConfig,
    userInfo?: UserInfo,
    sessionId?: string,
    pageNumber?: number,
    totalPages?: number,
    enhancedStoryData?: any
  ): Promise<ImageResult> {
    try {
      console.log('🎨 Tier 1: High-Quality AI-Enhanced Runware generation');
      
      // Floating head risk assessment for logging
      const floatingHeadRiskFactors = {
        shortPrompt: cleanScene.length < 50,
        portraitKeywords: /portrait|headshot|face|head/i.test(cleanScene),
        missingBodyTerms: !(/full body|whole body|standing|sitting|walking/i.test(cleanScene)),
        highAspectRatio: config.dimensions.height > config.dimensions.width
      };
      
      console.log('🎯 Floating Head Risk Assessment:', {
        sessionId,
        pageNumber,
        riskFactors: floatingHeadRiskFactors,
        totalRiskScore: Object.values(floatingHeadRiskFactors).filter(Boolean).length,
        timestamp: new Date().toISOString()
      });

      // Get stored character seed for consistency
      let characterSeed: number | undefined;
      if (userInfo && sessionId) {
        characterSeed = await this.getStoredCharacterSeed(userInfo, sessionId);
        if (characterSeed) {
          console.log(`🎯 Using stored character seed ${characterSeed} for consistency`);
        }
      }

      const { data, error } = await supabase.functions.invoke('runware-generate-image', {
        body: {
          pageText: cleanScene,
          userInfo,
          sessionId,
          pageNumber,
          totalPages: totalPages || 10,
          seed: characterSeed, // Pass stored seed for consistency
          enhancedStoryData // Pass AI-enhanced data if available
        }
      });

      if (error) {
        throw new Error(`Tier 1 High-Quality API error: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Tier 1 High-Quality generation failed');
      }

      // Store successful seed for future consistency
      if (data.seed && userInfo && sessionId && pageNumber) {
        await this.storeCharacterSeed(userInfo, sessionId, data.seed, pageNumber);
      }

      // Enhanced logging for floating head detection
      console.log('🎯 Image Generation Result (Tier 1):', {
        tier: 'High-Quality AI-Enhanced',
        success: true,
        promptLength: cleanScene.length,
        containsBodyTerms: /full body|whole body|standing|sitting|walking/i.test(cleanScene),
        sessionId,
        pageNumber,
        seed: data.seed,
        timestamp: new Date().toISOString()
      });

      return {
        url: data.imageURL,
        success: true,
        provider: 'runware-premium',
        model: 'runware:100@1',
        cost: data.cost || this.ESTIMATED_COST_PER_IMAGE_USD,
        seed: data.seed,
        metadata: data.metadata
      };

    } catch (error) {
      const appError = ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), 'tier1-premium-generation');
      console.error('🎨 Tier 1 Premium generation failed:', appError);

      return {
        url: '',
        success: false,
        error: ErrorHandler.getUserMessage(appError)
      };
    }
  }

  // TIER 2: Template-based Runware (Dynamic but no AI)
  private static async generateWithRunwareSimple(
    cleanScene: string, 
    config: ImageGenerationConfig,
    userInfo?: UserInfo,
    pageNumber?: number,
    totalPages?: number
  ): Promise<ImageResult> {
    try {
      console.log('🎨 Tier 2: Template-based Runware generation (no AI features)');

      const { data, error } = await supabase.functions.invoke('runware-template-generation', {
        body: {
          pageText: cleanScene,
          userInfo,
          pageNumber,
          totalPages,
          sessionId: config.sessionId,
          difficultyLevel: config.difficultyLevel || 'medium'
        }
      });

      if (error) {
        throw new Error(`Tier 2 Template API error: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Tier 2 Template generation failed');
      }

      return {
        url: data.imageUrl || data.imageURL,
        success: true,
        provider: 'runware-template',
        model: 'runware:100@1',
        cost: data.cost || this.ESTIMATED_COST_PER_IMAGE_USD,
        seed: data.seed,
        metadata: {
          tier: 2,
          enhancementLevel: 'template-based',
          qualityScore: data.qualityScore,
          processingTime: data.processingTime
        }
      };

    } catch (error) {
      const appError = ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), 'tier2-template-generation');
      console.error('🎨 Tier 2 Template generation failed:', appError);

      return {
        url: '',
        success: false,
        error: ErrorHandler.getUserMessage(appError)
      };
    }
  }

  // TIER 3: OpenAI DALL-E
  private static async generateWithOpenAI(
    cleanScene: string, 
    userInfo?: UserInfo,
    difficulty?: string,
    sessionId?: string,
    pageNumber?: number,
    totalPages?: number
  ): Promise<ImageResult> {
    try {
      console.log('🎯 OpenAI DALL-E generation');

      const enhancedPrompt = await this.generateLegacyPrompt(cleanScene, userInfo);
      
      // Add comprehensive negative prompt for OpenAI
      const negativePrompt = "text, letters, words, writing, signs, watermarks, ugly, deformed, bad anatomy, extra limb, mutation, poorly drawn, cropped, lowres, worst quality, low quality, blurry, text, error, adult, mature, violence, scary, dark, inappropriate, nsfw, suggestive, weapons, photorealistic, anime, copyrighted characters, brand logos";

      console.log('🎯 [DEBUG] Calling OpenAI with:', {
        positivePrompt: enhancedPrompt?.substring(0, 50),
        negativePrompt: negativePrompt.substring(0, 50) + '...',
        size: '1024x1024',
        model: 'gpt-image-1',
        quality: 'standard'
      });

      const { data, error } = await supabase.functions.invoke('openai-image', {
        body: {
          positivePrompt: enhancedPrompt,
          negativePrompt: negativePrompt,
          size: '1024x1024',
          model: 'gpt-image-1',
          quality: 'standard'
        }
      });

      if (error) {
        throw new Error(`OpenAI API error: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'OpenAI generation failed');
      }

      return {
        url: data.imageURL,
        success: true,
        provider: 'openai',
        model: 'gpt-image-1',
        cost: 0.02, // OpenAI cost
        seed: undefined
      };

    } catch (error) {
      const appError = ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), 'openai-generation');
      console.error('🎯 OpenAI generation failed:', appError);

      return {
        url: '',
        success: false,
        error: ErrorHandler.getUserMessage(appError)
      };
    }
  }

  // TIER 4: SVG Placeholder (guaranteed success)
  private static generateSVGPlaceholder(cleanScene: string, userInfo?: UserInfo): ImageResult {
    const characterName = userInfo?.name || 'Character';
    const shortScene = cleanScene.substring(0, 50);
    
    const svgContent = `
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" fill="#f0f9ff"/>
        <circle cx="200" cy="150" r="60" fill="#ddd6fe"/>
        <text x="200" y="250" text-anchor="middle" font-family="Arial" font-size="16" fill="#1f2937">
          ${characterName}
        </text>
        <text x="200" y="280" text-anchor="middle" font-family="Arial" font-size="12" fill="#6b7280">
          ${shortScene}...
        </text>
        <text x="200" y="320" text-anchor="middle" font-family="Arial" font-size="10" fill="#9ca3af">
          Story illustration loading...
        </text>
      </svg>
    `;
    
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    return {
      url,
      success: true,
      provider: 'svg',
      model: 'placeholder',
      cost: 0,
      seed: undefined
    };
  }

  // TIER 2.5: Simple Runware fallback with hardcoded extraction
  private static async generateWithRunwareSimpleFallback(
    cleanScene: string,
    config: ImageGenerationConfig,
    userInfo?: UserInfo,
    pageNumber?: number
  ): Promise<ImageResult> {
    try {
      console.log('🎨 Tier 2.5: Simple fallback generation');

      const { data, error } = await supabase.functions.invoke('runware-simple-fallback', {
        body: {
          pageText: cleanScene,
          userInfo,
          difficultyLevel: config.difficultyLevel || 'medium'
        }
      });

      if (error) {
        throw new Error(`Tier 2.5 API error: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Tier 2.5 generation failed');
      }

      return {
        url: data.imageURL,
        success: true,
        provider: 'runware-simple-fallback',
        model: 'runware:100@1',
        cost: data.cost || this.ESTIMATED_COST_PER_IMAGE_USD,
        seed: data.seed
      };

    } catch (error) {
      const appError = ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), 'tier25-generation');
      console.error('🎨 Tier 2.5 generation failed:', appError);

      return {
        url: '',
        success: false,
        error: ErrorHandler.getUserMessage(appError)
      };
    }
  }

  // Provider switching
  static async switchProvider(provider: 'runware' | 'openai'): Promise<void> {
    this.DEFAULT_CONFIG.provider = provider;
    console.log(`🔄 Switched default provider to: ${provider}`);
  }

  static getAvailableProviders(): string[] {
    return ['runware', 'openai'];
  }
}