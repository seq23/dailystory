// MultiStage Enhancement Pipeline - Unified AI Brain for All Tiers
// Imports auto-extracted frontend AI intelligence for sophisticated processing

import { DifficultyLevelMapper } from './DifficultyLevelMapper.js';
import { getStyleFramework } from './styleFrameworks.js';
import { 
  FrontendIntelligence,
  generateFacialFeaturesDescription,
  createSeededRandom,
  generateStableSeed,
  determineCulturalProfile,
  extractPrimaryScene,
  buildCharacterDescription,
  buildCulturalContext,
  generateCulturalCharacterDescription,
  analyzeEmotionalContent
} from './FrontendIntelligence.js';

function selectWeightedElement(array) {
  if (!array || array.length === 0) return '';
  return array[Math.floor(Math.random() * array.length)];
}

export class MultiStageEnhancementPipeline {
  
  // ============= TIER 1: PREMIUM AI-ENHANCED PROCESSING =============
  static async processTier1Premium(storyText, userInfo, sessionId, pageNumber, totalPages) {
    try {
      console.log(`🔥 Tier 1 Premium AI Pipeline: ${sessionId} page ${pageNumber}/${totalPages}`);
      
      // 1. Advanced character consistency with seeded generation
      const characterSeed = generateStableSeed(userInfo?.userId || sessionId, userInfo?.name || 'child');
      const culturalProfile = determineCulturalProfile(userInfo);
      
      // 2. Extract and analyze primary scene
      const primaryScene = extractPrimaryScene(storyText);
      const emotionalContext = analyzeEmotionalContent(storyText);
      
      // 3. Build sophisticated character description using full AI system
      const characterDescription = this.buildAdvancedCharacterDescription(userInfo, culturalProfile, characterSeed);
      
      // 4. Generate premium prompt using advanced AI enhancement
      const enhancedPrompt = this.buildPremiumPrompt(
        primaryScene,
        characterDescription,
        buildCulturalContext(userInfo),
        emotionalContext,
        userInfo
      );
      
      // 5. Build comprehensive negative prompt
      const negativePrompt = this.buildAdvancedNegativePrompt(userInfo, culturalProfile);
      
      return {
        success: true,
        enhancedPrompt,
        negativePrompt,
        // Premium generation parameters
        generationParams: {
          model: "runware:100@1",
          outputFormat: "WEBP",
          CFGScale: 4.0,
          steps: 12,
          scheduler: "FlowMatchEulerDiscreteScheduler",
          width: 1024,
          height: 1024
        },
        // AI metadata
        characterSeed,
        culturalProfile,
        emotionalContext: emotionalContext.mood,
        qualityScore: 95,
        tier: 'premium-ai'
      };
      
    } catch (error) {
      console.error('❌ Tier 1 Premium pipeline error:', error);
      return this.createFallbackResult(storyText, userInfo, 'tier1-fallback');
    }
  }
  
  // ============= TIER 2: TEMPLATE-BASED PROCESSING (ENHANCED) =============
  static async processThroughPipeline(storyText, userInfo, sessionId, pageNumber, totalPages) {
    try {
      console.log(`🔄 Tier 2 Enhanced Template Pipeline: ${sessionId} page ${pageNumber}/${totalPages}`);
      
      // Enhanced data preparation using AI intelligence
      const difficulty = DifficultyLevelMapper.mapToImageDifficulty(userInfo);
      const framework = getStyleFramework(difficulty);
      const culturalProfile = determineCulturalProfile(userInfo);
      
      // AI-enhanced character descriptors
      const characterDescriptors = this.prepareAICharacterDescriptors(userInfo, culturalProfile);
      
      // AI-enhanced scene extraction
      const primaryScene = extractPrimaryScene(storyText);
      const emotionalContext = analyzeEmotionalContent(storyText);
      
      // Build enhanced template prompt using AI intelligence
      const enhancedPrompt = this.buildEnhancedTemplatePrompt(
        primaryScene,
        characterDescriptors,
        framework,
        userInfo,
        emotionalContext
      );
      
      const negativePrompt = this.buildSmartNegativePrompt(userInfo, culturalProfile);
      
      return {
        success: true,
        enhancedPrompt,
        negativePrompt,
        // Enhanced template parameters
        generationParams: {
          ...framework.parameters,
          outputFormat: "WEBP",
          model: "runware:100@1",
          CFGScale: 3.0,
          steps: 8
        },
        // Enhanced metadata
        difficulty: difficulty,
        styleFramework: framework.name,
        culturalProfile: culturalProfile,
        emotionalContext: emotionalContext.mood,
        qualityScore: 85 // Enhanced template quality
      };
      
    } catch (error) {
      console.error('❌ Tier 2 Enhanced pipeline error:', error);
      return this.createFallbackResult(storyText, userInfo, 'tier2-fallback');
    }
  }
  
  // ============= PREMIUM AI CHARACTER PROCESSING =============
  static buildAdvancedCharacterDescription(userInfo, culturalProfile, characterSeed) {
    // Use sophisticated AI character generation
    const baseDescription = generateCulturalCharacterDescription(userInfo);
    
    // Add AI-enhanced details using seeded randomization
    const random = createSeededRandom(characterSeed);
    const profile = FrontendIntelligence.culturalProfiles[userInfo?.nativeLanguage || 'en'];
    
    if (profile) {
      // Enhanced facial features using AI system
      const facialFeatures = generateFacialFeaturesDescription(profile.facialFeatures);
      
      // Add emotional personality traits
      const personalityTraits = this.generatePersonalityTraits(random);
      
      return `${baseDescription}, ${facialFeatures}, ${personalityTraits}`;
    }
    
    return baseDescription;
  }
  
  static generatePersonalityTraits(random) {
    const traits = [
      'curious and imaginative',
      'brave and adventurous', 
      'kind and empathetic',
      'intelligent and thoughtful',
      'joyful and energetic',
      'creative and artistic',
      'determined and confident',
      'gentle and caring'
    ];
    
    return selectWeightedElement(traits);
  }
  
  // ============= PREMIUM PROMPT BUILDING =============
  static buildPremiumPrompt(primaryScene, characterDescription, culturalContext, emotionalContext, userInfo) {
    const emotionalEnhancement = this.buildEmotionalEnhancement(emotionalContext);
    const qualityEnhancement = this.buildQualityEnhancement(userInfo);
    
    return `${primaryScene} featuring ${characterDescription}, ${culturalContext}, ${emotionalEnhancement}, ${qualityEnhancement}, masterful children's book illustration, premium digital art, perfect composition, professional quality`;
  }
  
  static buildEmotionalEnhancement(emotionalContext) {
    const { mood, intensity, colorPalette, lightingStyle, compositionStyle } = emotionalContext;
    
    const colors = Array.isArray(colorPalette) ? colorPalette.join(' and ') : 'warm harmonious colors';
    
    return `${mood} ${intensity} mood, ${colors}, ${lightingStyle}, ${compositionStyle}`;
  }
  
  static buildQualityEnhancement(userInfo) {
    const difficulty = userInfo?.difficultyLevel || userInfo?.readingLevel || 'medium';
    
    const qualityMap = {
      'beginner': 'vibrant 3D children\'s art, smooth rendering, bright cheerful atmosphere',
      'easy': 'polished digital illustration, warm inviting colors, smooth artistic style',
      'medium': 'sophisticated digital art, nuanced color harmony, professional composition',
      'hard': 'masterful illustration, complex artistic techniques, intricate visual storytelling',
      'expert': 'premium artistic masterpiece, advanced color theory, exceptional visual narrative'
    };
    
    return qualityMap[difficulty] || qualityMap['medium'];
  }
  
  // ============= ENHANCED TEMPLATE PROCESSING =============
  static prepareAICharacterDescriptors(userInfo, culturalProfile) {
    if (!userInfo) return [];
    
    const profile = FrontendIntelligence.culturalProfiles[userInfo?.nativeLanguage || 'en'];
    
    const descriptors = [];
    
    if (userInfo.name) {
      descriptors.push({
        type: 'main_character',
        name: userInfo.name,
        relationship: 'protagonist',
        culturalRole: 'child',
        culturalProfile: culturalProfile,
        // Enhanced with AI-extracted character consistency
        physicalDescription: buildCharacterDescription(userInfo, culturalProfile),
        culturalContext: buildCulturalContext(userInfo)
      });
    }
    
    return descriptors;
  }
  
  static buildEnhancedTemplatePrompt(primaryScene, characterDescriptors, framework, userInfo, emotionalContext) {
    const characterElements = characterDescriptors.map(char => char.physicalDescription || char.name || 'child').join(', ');
    const culturalContext = characterDescriptors[0]?.culturalContext || buildCulturalContext(userInfo);
    const styleElements = framework.prompt || 'children\'s book illustration';
    const emotionalEnhancement = emotionalContext.mood || 'peaceful';
    
    return `${primaryScene} showing ${characterElements}, ${culturalContext}, ${emotionalEnhancement} atmosphere, ${styleElements}, ${framework.brandSuffix || 'enhanced children\'s book illustration'}`;
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
    
    // Add cultural consistency
    const profile = FrontendIntelligence.culturalProfiles[userInfo?.nativeLanguage || 'en'];
    if (profile?.negativePrompts) {
      baseNegative += ', ' + profile.negativePrompts.join(', ');
    }
    
    return baseNegative;
  }
  
  static buildSmartNegativePrompt(userInfo, culturalProfile) {
    let baseNegative = "text, words, scary, dark, adult themes, photorealistic";
    
    // Add gender consistency
    if (userInfo?.avatar?.type === 'girl') {
      baseNegative += ', boy character, male character, masculine features';
    } else if (userInfo?.avatar?.type === 'boy') {
      baseNegative += ', girl character, female character, feminine features, dress, skirt';
    }
    
    return baseNegative;
  }

  // ============= FALLBACK SYSTEM =============
  static createFallbackResult(storyText, userInfo, tier) {
    const difficulty = DifficultyLevelMapper.mapToImageDifficulty(userInfo);
    const framework = getStyleFramework(difficulty);
    
    return {
      success: true,
      enhancedPrompt: `${storyText}, ${framework.prompt}, children's book illustration`,
      negativePrompt: "text, words, scary, dark, adult themes",
      generationParams: framework.parameters,
      qualityScore: tier === 'tier1-fallback' ? 70 : 60,
      difficulty: difficulty,
      styleFramework: 'Fallback',
      tier: tier
    };
  }
}