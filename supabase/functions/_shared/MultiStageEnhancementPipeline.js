// MultiStage Enhancement Pipeline - Unified AI Brain for All Tiers
// Now uses real AI functions from FrontendIntelligence.js

import { DifficultyLevelMapper } from './DifficultyLevelMapper.js';
import { getStyleFramework, validateStyleFramework } from './styleFrameworks.js';
import './storyVisualState.js'; // Loads StoryVisualStateManager globally
import './VisualDetailTracker.js'; // Loads VisualDetailTracker globally

function selectWeightedElement(array) {
  if (!array || array.length === 0) return '';
  return array[Math.floor(Math.random() * array.length)];
}

export class MultiStageEnhancementPipeline {
  
  // ============= TIER 1: PREMIUM AI-ENHANCED PROCESSING WITH STYLE FRAMEWORKS =============
  static async processTier1Premium(storyText, userInfo, sessionId, pageNumber, totalPages) {
    try {
      console.log(`🔥 Tier 1 Premium AI Pipeline with Style Frameworks + Visual State: ${sessionId} page ${pageNumber}/${totalPages}`);
      
      // Import fresh frontend intelligence
      const { FrontendIntelligence } = await import('./FrontendIntelligence.js');
      
      // 0. Initialize and analyze visual state for consistency
      const visualState = globalThis.StoryVisualStateManager.getOrCreateStoryState(sessionId);
      globalThis.VisualDetailTracker.analyzeTextForDetails(sessionId, storyText, pageNumber);
      globalThis.StoryVisualStateManager.analyzeAndTrackVisualDetails(sessionId, storyText, pageNumber);
      
      // Detect and update setting/environment from story text
      this.updateSettingFromText(sessionId, storyText);
      
      // 1. Determine difficulty level and get style framework
      const imageDifficulty = DifficultyLevelMapper.mapToImageDifficulty(userInfo);
      const styleFramework = getStyleFramework(imageDifficulty);
      
      // Validate style framework
      if (!validateStyleFramework(imageDifficulty)) {
        console.warn('⚠️ Style framework validation failed for', imageDifficulty, 'using fallback');
      }
      
      console.log('🎨 Selected style framework:', imageDifficulty, styleFramework.name);
      
      // 2. Generate stable character seed for consistency (check visual state first)
      let characterSeed = globalThis.StoryVisualStateManager.getCharacterSeed(sessionId, userInfo.name || 'Alex');
      if (!characterSeed) {
        characterSeed = this.generateStableSeed(userInfo, sessionId);
        globalThis.StoryVisualStateManager.updateCharacterWithSeed(sessionId, userInfo.name || 'Alex', characterSeed, null);
      }
      
      // 3. Get cultural profile
      const culturalProfile = FrontendIntelligence.CULTURAL_VISUAL_PROFILES?.[userInfo.nativeLanguage] || 
                             FrontendIntelligence.CULTURAL_VISUAL_PROFILES?.['en'] || {};
      
      // 4. Extract scene and emotional context
      const sceneContext = this.extractSceneContent(storyText);
      const emotionalContext = FrontendIntelligence.detectEmotionalContext(storyText);
      
      // 5. Get existing visual state for consistency
      const existingSetting = globalThis.StoryVisualStateManager.getSettingForPrompt(sessionId);
      const visualDetails = globalThis.VisualDetailTracker.getVisualDetailsForPrompt(sessionId);
      const storyStateDetails = globalThis.StoryVisualStateManager.getVisualDetailsForPrompt(sessionId);
      
      // 6. Build premium prompt with AI intelligence, style framework AND visual state
      const enhancedPrompt = FrontendIntelligence.buildPremiumPrompt(
        storyText,
        userInfo,
        characterSeed,
        culturalProfile,
        sceneContext,
        emotionalContext,
        styleFramework,
        {
          existingSetting,
          visualDetails,
          storyStateDetails,
          pageNumber,
          totalPages
        }
      );
      
      // 6. Generate advanced negative prompt with style framework considerations
      const negativePrompt = this.buildAdvancedNegativePrompt(userInfo, culturalProfile, styleFramework);
      
      // 7. Premium generation parameters using style framework
      const generationParams = {
        model: 'runware:100@1',
        steps: styleFramework.parameters?.steps || 8, // Use framework steps or premium default
        cfgScale: styleFramework.parameters?.cfgScale || 2.0,
        scheduler: 'FlowMatchEulerDiscreteScheduler',
        width: 1024,
        height: 1024,
        outputFormat: 'WEBP'
      };
      
      console.log('✨ Tier 1 Premium AI processing completed with style framework + visual state:', {
        styleFramework: styleFramework.name,
        difficulty: imageDifficulty,
        characterSeed,
        existingSetting: existingSetting ? 'YES' : 'NO',
        visualDetails: visualDetails ? 'YES' : 'NO',
        trackedObjects: globalThis.VisualDetailTracker.getSessionDetails(sessionId).length,
        hasSkinTones: FrontendIntelligence.AFRICAN_AMERICAN_SKIN_TONES?.length || 0,
        hasBoysHair: FrontendIntelligence.BOYS_HAIR_STYLES?.length || 0,
        hasGirlsHair: FrontendIntelligence.GIRLS_HAIR_STYLES?.length || 0,
        hasSettings: FrontendIntelligence.AFRICAN_AMERICAN_SETTINGS?.length || 0,
        hasCulturalElements: FrontendIntelligence.CULTURAL_PRIDE_ELEMENTS?.length || 0
      });
      
      return {
        enhancedPrompt,
        negativePrompt,
        generationParams,
        metadata: {
          tier: 'premium-ai-styled-visual-state',
          characterSeed,
          styleFramework: styleFramework.name,
          difficulty: imageDifficulty,
          culturalProfile: userInfo.nativeLanguage,
          emotionalContext: emotionalContext.mood,
          africanAmericanProcessing: FrontendIntelligence.shouldApplyAfricanAmericanCulturalVariations(userInfo),
          visualStateEnabled: true,
          hasExistingSetting: !!existingSetting,
          hasVisualDetails: !!visualDetails,
          trackedObjectsCount: globalThis.VisualDetailTracker.getSessionDetails(sessionId).length,
          processingTime: Date.now(),
          arrayStats: {
            skinTones: FrontendIntelligence.AFRICAN_AMERICAN_SKIN_TONES?.length || 0,
            boysHair: FrontendIntelligence.BOYS_HAIR_STYLES?.length || 0,
            girlsHair: FrontendIntelligence.GIRLS_HAIR_STYLES?.length || 0,
            settings: FrontendIntelligence.AFRICAN_AMERICAN_SETTINGS?.length || 0,
            culturalElements: FrontendIntelligence.CULTURAL_PRIDE_ELEMENTS?.length || 0
          }
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
  
  // ============= SMART NEGATIVE PROMPTS WITH STYLE FRAMEWORK SUPPORT =============
  static buildAdvancedNegativePrompt(userInfo, culturalProfile, styleFramework = null) {
    let baseNegative = "NO TEXT, no letters, no words, no writing, no signs, no symbols, ugly, deformed, bad anatomy, extra limb, mutation, poorly drawn, cropped, lowres, worst quality, low quality, blurry, text, error, adult, mature, violence, scary, dark, inappropriate, nsfw, suggestive, weapons, photorealistic, anime, copyrighted characters, brand logos";
    
    // Add style framework negative prompts
    if (styleFramework && styleFramework.negativePrompt) {
      baseNegative += `, ${styleFramework.negativePrompt}`;
    }
    
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

  static updateSettingFromText(sessionId, storyText) {
    const text = storyText.toLowerCase();
    let detectedSetting = {};
    
    // Detect location
    const locations = {
      'park': 'park',
      'school': 'school',
      'home': 'home',
      'house': 'home',
      'library': 'library',
      'store': 'store',
      'playground': 'playground',
      'garden': 'garden',
      'kitchen': 'kitchen',
      'bedroom': 'bedroom',
      'forest': 'forest',
      'beach': 'beach',
      'mountain': 'mountain'
    };
    
    for (const [keyword, location] of Object.entries(locations)) {
      if (text.includes(keyword)) {
        detectedSetting.location = location;
        break;
      }
    }
    
    // Detect time of day
    const times = {
      'morning': 'morning',
      'afternoon': 'afternoon',
      'evening': 'evening',
      'night': 'night',
      'sunrise': 'morning',
      'sunset': 'evening',
      'dawn': 'morning',
      'dusk': 'evening'
    };
    
    for (const [keyword, time] of Object.entries(times)) {
      if (text.includes(keyword)) {
        detectedSetting.timeOfDay = time;
        break;
      }
    }
    
    // Detect weather
    const weather = {
      'sunny': 'sunny',
      'rainy': 'rainy',
      'cloudy': 'cloudy',
      'snowy': 'snowy',
      'foggy': 'foggy',
      'stormy': 'stormy',
      'rain': 'rainy',
      'snow': 'snowy',
      'storm': 'stormy'
    };
    
    for (const [keyword, weatherType] of Object.entries(weather)) {
      if (text.includes(keyword)) {
        detectedSetting.weather = weatherType;
        break;
      }
    }
    
    // Update setting if any new elements detected
    if (Object.keys(detectedSetting).length > 0) {
      globalThis.StoryVisualStateManager.updateSetting(sessionId, detectedSetting);
      console.log('🌍 Updated story setting:', detectedSetting);
    }
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