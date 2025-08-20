// MultiStage Enhancement Pipeline - Unified AI Brain for All Tiers
// Now uses real AI functions from FrontendIntelligence.js

import { DifficultyLevelMapper } from './DifficultyLevelMapper.js';
import { getStyleFramework } from './styleFrameworks.js';

function selectWeightedElement(array) {
  if (!array || array.length === 0) return '';
  return array[Math.floor(Math.random() * array.length)];
}

export class MultiStageEnhancementPipeline {
  
  // ============= TIER 1: PREMIUM AI-ENHANCED PROCESSING =============
  static async processTier1Premium(storyText, userInfo, sessionId, pageNumber, totalPages) {
    try {
      console.log(`🔥 Tier 1 Premium AI Pipeline: ${sessionId} page ${pageNumber}/${totalPages}`);
      
      // Import fresh frontend intelligence
      const { FrontendIntelligence } = await import('./FrontendIntelligence.js');
      
      // 1. Generate stable character seed for consistency
      const characterSeed = this.generateStableSeed(userInfo, sessionId);
      
      // 2. Get cultural profile
      const culturalProfile = FrontendIntelligence.CULTURAL_VISUAL_PROFILES?.[userInfo.nativeLanguage] || 
                             FrontendIntelligence.CULTURAL_VISUAL_PROFILES?.['en'] || {};
      
      // 3. Use real FixedCulturalLogic for African American processing
      const characterDescription = FrontendIntelligence.shouldApplyAfricanAmericanCulturalVariations(userInfo)
        ? `${userInfo.name || 'Alex'} (girl with dark skin and ${FrontendIntelligence.getUniversalHairMapping(userInfo)}, ${FrontendIntelligence.generateExpandedAfricanAmericanFeatures()})`
        : FrontendIntelligence.buildAdvancedCharacterDescription(userInfo, culturalProfile, characterSeed);
      
      // 4. Extract scene and emotional context
      const sceneContext = this.extractSceneContent(storyText);
      const emotionalContext = FrontendIntelligence.detectEmotionalContext(storyText);
      
      // 5. Build premium prompt with real AI functions
      const enhancedPrompt = FrontendIntelligence.buildPremiumPrompt(
        storyText,
        userInfo,
        characterSeed,
        culturalProfile,
        sceneContext,
        emotionalContext,
        'Ultra high resolution, professional children\'s book illustration, vibrant colors, consistent character appearance'
      );
      
      // 6. Generate advanced negative prompt with cultural awareness
      const negativePrompt = this.buildAdvancedNegativePrompt(userInfo, culturalProfile);
      
      // 7. Premium generation parameters
      const generationParams = {
        model: 'runware:100@1',
        steps: 8,
        cfgScale: 2.0,
        scheduler: 'FlowMatchEulerDiscreteScheduler',
        width: 1024,
        height: 1024,
        outputFormat: 'WEBP'
      };
      
      console.log('✨ Tier 1 Premium AI processing completed with real FixedCulturalLogic');
      
      return {
        enhancedPrompt,
        negativePrompt,
        generationParams,
        metadata: {
          tier: 'premium-ai',
          characterSeed,
          culturalProfile: userInfo.nativeLanguage,
          emotionalContext: emotionalContext.mood,
          africanAmericanProcessing: FrontendIntelligence.shouldApplyAfricanAmericanCulturalVariations(userInfo),
          processingTime: Date.now()
        }
      };
      
    } catch (error) {
      console.error('❌ Tier 1 Premium processing failed:', error);
      return this.createFallbackResult(storyText, userInfo, 'tier1-premium');
    }
  }
  
  // ============= TIER 2: SIMPLE TEMPLATE-BASED PROCESSING =============
  static async processThroughPipeline(storyText, userInfo, sessionId, pageNumber, totalPages) {
    try {
      console.log(`🔄 Tier 2 Simple Template Pipeline: ${sessionId} page ${pageNumber}/${totalPages}`);
      
      // Simple template-based processing - NO AI functions
      const difficulty = DifficultyLevelMapper.mapToImageDifficulty(userInfo);
      const framework = getStyleFramework(difficulty);
      
      // Simple character description based on avatar info only
      const characterDescription = this.buildSimpleCharacterDescription(userInfo);
      
      const enhancedPrompt = this.buildEnhancedTemplatePrompt(
        storyText,
        characterDescription,
        framework,
        userInfo
      );
      
      const negativePrompt = this.buildSimpleNegativePrompt(userInfo);
      
      return {
        enhancedPrompt,
        negativePrompt,
        // Simple template parameters
        generationParams: {
          ...framework.parameters,
          outputFormat: "WEBP",
          model: "runware:100@1",
          CFGScale: 3.0,
          steps: 8
        },
        // Simple metadata
        metadata: {
          tier: 'simple-template',
          difficulty: difficulty,
          styleFramework: framework.name,
          qualityScore: 75
        }
      };
      
    } catch (error) {
      console.error('❌ Tier 2 Simple pipeline error:', error);
      return this.createFallbackResult(storyText, userInfo, 'tier2-fallback');
    }
  }
  
  // ============= SIMPLE TEMPLATE PROCESSING =============
  static buildEnhancedTemplatePrompt(storyText, characterDescription, framework, userInfo) {
    const styleElements = framework.prompt || 'children\'s book illustration';
    
    return `${storyText} showing ${characterDescription}, ${styleElements}, ${framework.brandSuffix || 'enhanced children\'s book illustration'}`;
  }

  static buildSimpleCharacterDescription(userInfo) {
    const name = userInfo?.name || 'Alex';
    const gender = userInfo?.avatar?.type === 'girl' ? 'girl' : 'boy';
    const skinTone = userInfo?.avatar?.skinTone || 'medium';
    
    // Simple skin tone mapping
    const skinMap = {
      light: 'light skin',
      medium: 'medium skin',
      olive: 'olive skin', 
      dark: 'dark skin',
      pale: 'pale skin'
    };
    
    return `${name} (${gender} with ${skinMap[skinTone] || 'medium skin'})`;
  }
  
  // ============= SMART NEGATIVE PROMPTS =============
  static buildAdvancedNegativePrompt(userInfo, culturalProfile) {
    let baseNegative = "NO TEXT, no letters, no words, no writing, no signs, no symbols, ugly, deformed, bad anatomy, extra limb, mutation, poorly drawn, cropped, lowres, worst quality, low quality, blurry, text, error, adult, mature, violence, scary, dark, inappropriate, nsfw, suggestive, weapons, photorealistic, anime, copyrighted characters, brand logos";
    
    // Add gender consistency
    if (userInfo?.avatar?.type === 'girl') {
      baseNegative += ', boy character, male character, masculine features';
    } else if (userInfo?.avatar?.type === 'boy') {
      baseNegative += ', girl character, female character, feminine features, dress, skirt';
    }
    
    // Enhanced negative prompts for African American characters
    if (userInfo.nativeLanguage === 'en' && userInfo.avatar?.skinTone === 'dark') {
      baseNegative += ', inconsistent character appearance, wrong skin color, incorrect facial features, stereotypical representation, caricature features, inaccurate cultural elements, offensive portrayal';
    }
    
    return baseNegative;
  }
  
  static buildSimpleNegativePrompt(userInfo) {
    let baseNegative = "text, words, scary, dark, adult themes, photorealistic";
    
    // Add gender consistency
    if (userInfo?.avatar?.type === 'girl') {
      baseNegative += ', boy character, male character, masculine features';
    } else if (userInfo?.avatar?.type === 'boy') {
      baseNegative += ', girl character, female character, feminine features, dress, skirt';
    }
    
    return baseNegative;
  }

  // ============= UTILITY METHODS =============
  static generateStableSeed(userInfo, sessionId) {
    let hash = 0;
    const input = `${userInfo?.name || 'child'}-${sessionId}`;
    
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash);
  }

  static extractSceneContent(storyText) {
    // Simple scene extraction for prompt building
    return storyText.substring(0, 200); // Take first 200 chars as primary scene
  }

  // ============= FALLBACK SYSTEM =============
  static createFallbackResult(storyText, userInfo, tier) {
    const difficulty = DifficultyLevelMapper.mapToImageDifficulty(userInfo);
    const framework = getStyleFramework(difficulty);
    
    return {
      enhancedPrompt: `${storyText}, ${framework.prompt}, children's book illustration`,
      negativePrompt: "text, words, scary, dark, adult themes",
      generationParams: framework.parameters,
      metadata: {
        tier: tier,
        qualityScore: tier === 'tier1-fallback' ? 70 : 60,
        difficulty: difficulty,
        styleFramework: 'Fallback'
      }
    };
  }
}