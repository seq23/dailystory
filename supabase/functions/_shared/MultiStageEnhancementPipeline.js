// MultiStage Enhancement Pipeline - Unified AI Brain for All Tiers
// Now uses real AI functions from FrontendIntelligence.js

import { DifficultyLevelMapper } from './DifficultyLevelMapper.js';
import { getStyleFramework, validateStyleFramework } from './styleFrameworks.js';
import { BackendTokenManager, PromptPriority } from './BackendTokenManager.js';
import './storyVisualState.js'; // Loads StoryVisualStateManager globally
import './VisualDetailTracker.js'; // Loads VisualDetailTracker globally
import './AnimalCharacterManager.js'; // Loads AnimalCharacterManager globally
import './AdvancedPronounResolver.js'; // Loads AdvancedPronounResolver globally

function selectWeightedElement(array) {
  if (!array || array.length === 0) return '';
  return array[Math.floor(Math.random() * array.length)];
}

export class MultiStageEnhancementPipeline {
  
  // ============= TIER 1: HIGH-QUALITY AI-ENHANCED PROCESSING WITH STYLE FRAMEWORKS =============
  static async processTier1HighQuality(storyText, userInfo, sessionId, pageNumber, totalPages, enhancedStoryData = null) {
    try {
      console.log(`🔥 Tier 1 High-Quality AI Pipeline with Style Frameworks + Visual State: ${sessionId} page ${pageNumber}/${totalPages}`);
      console.log(`🧠 Enhanced Data: ${enhancedStoryData ? 'AI-enhanced input available' : 'Using standard processing'}`);
      
      // Import fresh frontend intelligence
      const { FrontendIntelligence } = await import('./FrontendIntelligence.js');
      
      // 0. Initialize and analyze visual state for consistency
      const visualState = globalThis.StoryVisualStateManager.getOrCreateStoryState(sessionId);
      
      // CRITICAL: Analyze animals FIRST before any text processing to ensure immediate inclusion
      globalThis.AnimalCharacterManager.analyzeAndRegisterAnimals(sessionId, storyText, pageNumber);
      
      globalThis.VisualDetailTracker.analyzeTextForDetails(sessionId, storyText, pageNumber);
      globalThis.StoryVisualStateManager.analyzeAndTrackVisualDetails(sessionId, storyText, pageNumber);
      
      // 1. Analyze relationships and resolve pronouns first
      globalThis.AdvancedPronounResolver.analyzeRelationships(sessionId, storyText, pageNumber);
      
      // 2. Enhance story text with consistent visual details AND pronoun resolution
      let enhancedStoryText = globalThis.AdvancedPronounResolver.resolveComplexPronouns(sessionId, storyText, pageNumber);
      enhancedStoryText = globalThis.VisualDetailTracker.injectConsistentDetails(sessionId, enhancedStoryText, pageNumber);
      enhancedStoryText = globalThis.AnimalCharacterManager.injectConsistentAnimals(sessionId, enhancedStoryText, pageNumber);
      
      // If AI enhancement data is available, incorporate it into the story context
      if (enhancedStoryData && enhancedStoryData.characters) {
        console.log('🧠 Incorporating AI-enhanced character and setting data');
        // Enrich the story text with AI-discovered details for better cultural processing
        const aiCharacterDescriptions = enhancedStoryData.characters.map(char => 
          `${char.name || 'character'}: ${char.description || ''} (${char.emotions || 'neutral'})`
        ).join(', ');
        const aiSettingInfo = enhancedStoryData.setting ? 
          `Setting: ${enhancedStoryData.setting.location || ''} at ${enhancedStoryData.setting.timeOfDay || 'daytime'} with ${enhancedStoryData.setting.weather || 'clear'} weather` : '';
        
        enhancedStoryText = `${enhancedStoryText}\n[AI Context: ${aiCharacterDescriptions}. ${aiSettingInfo}. Mood: ${enhancedStoryData.mood || 'neutral'}]`;
      }
      
      console.log('🎯 Visual detail enhancement applied:', {
        originalLength: storyText.length,
        enhancedLength: enhancedStoryText.length,
        aiEnhanced: !!enhancedStoryData,
        changed: storyText !== enhancedStoryText,
        trackedDetails: globalThis.VisualDetailTracker.getSessionDetails(sessionId).length
      });
      
      // Detect and update setting/environment from story text
      this.updateSettingFromText(sessionId, enhancedStoryText);
      
      // 2. Determine difficulty level and get style framework
      const imageDifficulty = DifficultyLevelMapper.mapToImageDifficulty(userInfo);
      const styleFramework = getStyleFramework(imageDifficulty);
      
      // Validate style framework
      if (!validateStyleFramework(imageDifficulty)) {
        console.warn('⚠️ Style framework validation failed for', imageDifficulty, 'using fallback');
      }
      
      console.log('🎨 Selected style framework:', imageDifficulty, styleFramework.name);
      
      // 3. Generate stable character seed for consistency (check visual state first)
      let characterSeed = globalThis.StoryVisualStateManager.getCharacterSeed(sessionId, userInfo.name || 'Alex');
      if (!characterSeed) {
        characterSeed = this.generateStableSeed(userInfo, sessionId);
        globalThis.StoryVisualStateManager.updateCharacterWithSeed(sessionId, userInfo.name || 'Alex', characterSeed, null);
      }
      
      // 4. Get cultural profile
      const culturalProfile = FrontendIntelligence.CULTURAL_VISUAL_PROFILES?.[userInfo.nativeLanguage] || 
                             FrontendIntelligence.CULTURAL_VISUAL_PROFILES?.['en'] || {};
      
      // 5. Extract scene and emotional context from enhanced text using AI-enhanced method
      const sceneContext = this.extractAIEnhancedSceneContext(enhancedStoryText, enhancedStoryData);
      const emotionalContext = FrontendIntelligence.detectEmotionalContext(enhancedStoryText);
      
      // 6. Get existing visual state for consistency AND enhance with cultural context
      const existingSetting = globalThis.StoryVisualStateManager.getSettingForPrompt(sessionId);
      const visualDetails = globalThis.VisualDetailTracker.getVisualDetailsForPrompt(sessionId);
      const storyStateDetails = globalThis.StoryVisualStateManager.getVisualDetailsForPrompt(sessionId);
      const animalDetails = globalThis.AnimalCharacterManager.getAnimalSeedsForPrompt(sessionId);
      
      // NEW: Use enhanced cultural setting logic instead of override
      let enhancedSetting = existingSetting;
      if (!enhancedSetting && enhancedStoryData) {
        // Use AI-determined setting and enhance it with cultural context
        enhancedSetting = FrontendIntelligence.enhanceAISettingWithCulture(
          enhancedStoryData, 
          userInfo, 
          culturalProfile
        );
      } else if (!enhancedSetting) {
        // Fallback: enhance default setting
        enhancedSetting = FrontendIntelligence.enhanceAISettingWithCulture(
          { location: "indoor scene" }, 
          userInfo, 
          culturalProfile
        );
      }
      
      // 7. Build premium prompt with AI intelligence, style framework AND enhanced story text
      const enhancedPrompt = FrontendIntelligence.buildPremiumPrompt(
        enhancedStoryText, // Use enhanced text instead of original
        userInfo,
        characterSeed,
        culturalProfile,
        sceneContext,
        emotionalContext,
        styleFramework,
        {
          existingSetting: enhancedSetting, // Use enhanced setting instead of raw existing
          visualDetails,
          storyStateDetails,
          animalDetails,
          pageNumber,
          totalPages
        }
      );
      
      // 8. Generate advanced negative prompt with style framework considerations
      const negativePrompt = this.buildAdvancedNegativePrompt(userInfo, culturalProfile, styleFramework, pageNumber);
      
      // 9. Premium generation parameters using style framework
      const generationParams = {
        model: 'runware:100@1',
        steps: styleFramework.parameters?.steps || 8, // Use framework steps or premium default
        cfgScale: styleFramework.parameters?.cfgScale || 2.0,
        scheduler: 'FlowMatchEulerDiscreteScheduler',
        width: 1024,
        height: 1024,
        outputFormat: 'WEBP'
      };
      
      // Apply token optimization before returning
      const isAfricanAmericanCharacter = FrontendIntelligence.shouldApplyAfricanAmericanCulturalVariations(userInfo);
      const promptSegments = BackendTokenManager.createPromptSegments(
        sceneContext,
        `${userInfo?.name || 'Alex'} character`,
        styleFramework.prompt || 'children\'s book illustration',
        styleFramework.brandSuffix || '',
        visualDetails || '',
        isAfricanAmericanCharacter
      );
      
      const optimization = BackendTokenManager.optimizePrompt(promptSegments);
      const finalEnhancedPrompt = optimization.optimizedPrompt;
      
      console.log('✨ Tier 1 High-Quality AI processing completed with style framework + visual state + token optimization:', {
        styleFramework: styleFramework.name,
        difficulty: imageDifficulty,
        characterSeed,
        existingSetting: existingSetting ? 'YES' : 'NO',
        visualDetails: visualDetails ? 'YES' : 'NO',
        trackedObjects: globalThis.VisualDetailTracker.getSessionDetails(sessionId).length,
        tokenOptimization: {
          originalLength: optimization.originalLength,
          finalLength: optimization.finalLength,
          applied: optimization.applied,
          truncated: optimization.truncated
        },
        hasSkinTones: FrontendIntelligence.AFRICAN_AMERICAN_SKIN_TONES?.length || 0,
        hasBoysHair: FrontendIntelligence.BOYS_HAIR_STYLES?.length || 0,
        hasGirlsHair: FrontendIntelligence.GIRLS_HAIR_STYLES?.length || 0,
        hasSettings: FrontendIntelligence.AFRICAN_AMERICAN_SETTINGS?.length || 0,
        hasCulturalElements: FrontendIntelligence.CULTURAL_PRIDE_ELEMENTS?.length || 0
      });
      
      return {
        enhancedPrompt: finalEnhancedPrompt,
        negativePrompt,
        generationParams,
        metadata: {
          tier: 'high-quality-ai-styled-visual-state',
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
      console.error('❌ Tier 1 High-Quality processing failed:', error);
      return this.createFallbackResult(storyText, userInfo, 'tier1-high-quality');
    }
  }
  
  // ============= TIER 2: SIMPLE TEMPLATE-BASED PROCESSING =============
  static async processThroughPipeline(storyText, userInfo, sessionId, pageNumber, totalPages) {
    try {
      console.log(`🔄 Tier 2 Simple Template Pipeline: ${sessionId} page ${pageNumber}/${totalPages}`);
      
      // 1. Analyze relationships and resolve pronouns first (same as Tier 1)
      globalThis.AdvancedPronounResolver.analyzeRelationships(sessionId, storyText, pageNumber);
      
      // 2. Enhance story text with consistent visual details AND pronoun resolution
      globalThis.AnimalCharacterManager.analyzeAndRegisterAnimals(sessionId, storyText, pageNumber);
      let enhancedStoryText = globalThis.AdvancedPronounResolver.resolveComplexPronouns(sessionId, storyText, pageNumber);
      enhancedStoryText = globalThis.VisualDetailTracker.injectConsistentDetails(sessionId, enhancedStoryText, pageNumber);
      enhancedStoryText = globalThis.AnimalCharacterManager.injectConsistentAnimals(sessionId, enhancedStoryText, pageNumber);
      
      console.log('🎯 Tier 2 Visual detail enhancement applied:', {
        originalLength: storyText.length,
        enhancedLength: enhancedStoryText.length,
        changed: storyText !== enhancedStoryText,
        trackedDetails: globalThis.VisualDetailTracker.getSessionDetails(sessionId).length,
        trackedAnimals: globalThis.AnimalCharacterManager.getSessionAnimals(sessionId).length
      });
      
      // 2. Simple template-based processing - NO AI functions
      const difficulty = DifficultyLevelMapper.mapToImageDifficulty(userInfo);
      const framework = getStyleFramework(difficulty);
      
      // 3. Simple character description based on avatar info only
      const characterDescription = this.buildSimpleCharacterDescription(userInfo);
      
      const enhancedPrompt = this.buildEnhancedTemplatePrompt(
        enhancedStoryText, // Use enhanced text instead of original
        characterDescription,
        framework,
        userInfo
      );
      
      const negativePrompt = this.buildSimpleNegativePrompt(userInfo, pageNumber);
      
      // Apply token optimization to simple template as well
      // Import FrontendIntelligence for African American detection
      const { FrontendIntelligence } = await import('./FrontendIntelligence.js');
      const isAfricanAmericanCharacter = FrontendIntelligence.shouldApplyAfricanAmericanCulturalVariations(userInfo);
      const promptSegments = BackendTokenManager.createPromptSegments(
        enhancedStoryText,
        characterDescription,
        framework.prompt || 'children\'s book illustration',
        framework.brandSuffix || '',
        '',
        isAfricanAmericanCharacter
      );
      
      const optimization = BackendTokenManager.optimizePrompt(promptSegments);
      const finalEnhancedPrompt = optimization.optimizedPrompt;
      
      console.log('✨ Tier 2 Simple processing with token optimization:', {
        originalLength: optimization.originalLength,
        finalLength: optimization.finalLength,
        applied: optimization.applied
      });
      
      return {
        enhancedPrompt: finalEnhancedPrompt,
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
  static buildAdvancedNegativePrompt(userInfo, culturalProfile, styleFramework = null, pageNumber = 1) {
    // Build negative prompt with new priority structure
    const pageSpecific = this.buildPageSpecificNegatives(pageNumber, userInfo);
    const selectiveText = this.buildSelectiveTextPrevention();
    const bodyCompleteness = "floating head, disembodied head, head with no body, portrait only, bust shot, headshot only, cropped body, incomplete body, missing torso, cut off body, partial body, torso cutoff, body cropped out, head floating, disconnected head, severed head, no full body";
    const qualityControl = "ugly, deformed, bad anatomy, extra limb, mutation, poorly drawn, cropped, lowres, worst quality, low quality, blurry, text, error";
    const contentSafety = "adult, mature, violence, scary, dark, inappropriate, nsfw, suggestive, weapons";
    const stylePrevention = "photorealistic, anime, copyrighted characters, brand logos";
    
    let baseNegative = [pageSpecific, selectiveText, bodyCompleteness, qualityControl, contentSafety, stylePrevention]
      .filter(Boolean)
      .join(', ');
    
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
  
  static buildSimpleNegativePrompt(userInfo, pageNumber = 1) {
    // Build negative prompt with new priority structure
    const pageSpecific = this.buildPageSpecificNegatives(pageNumber, userInfo);
    const selectiveText = this.buildSelectiveTextPrevention();
    const bodyCompleteness = "floating head, disembodied head, head with no body, portrait only, bust shot, headshot only, cropped body, incomplete body, missing torso, cut off body, partial body, torso cutoff, body cropped out, head floating, disconnected head, severed head, no full body";
    const qualityControl = "ugly, deformed, bad anatomy, extra limb, mutation, poorly drawn, cropped, lowres, worst quality, low quality, blurry, text, error";
    const contentSafety = "adult, mature, violence, scary, dark, inappropriate, nsfw, suggestive, weapons";
    const stylePrevention = "photorealistic, anime, copyrighted characters, brand logos";
    
    let baseNegative = [pageSpecific, selectiveText, bodyCompleteness, qualityControl, contentSafety, stylePrevention]
      .filter(Boolean)
      .join(', ');
    
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

  // ============= PAGE-SPECIFIC AND SELECTIVE TEXT PREVENTION =============
  static buildPageSpecificNegatives(pageNumber, userInfo) {
    if (pageNumber === 1 && userInfo?.name) {
      const characterName = userInfo.name.toLowerCase();
      return `${characterName} text, ${characterName} title, character name title, comic book style title, name across top, title page text, character name banner, name in large letters`;
    }
    return null;
  }

  static buildSelectiveTextPrevention() {
    return "text, letters, words, writing, symbols, numbers, characters, alphabet, readable text, visible text, any text, illegible text, garbled text, nonsensical text, random letters, floating text, overlaid text, character name text, title text, comic book title, name sprawled across image, large character names, promotional text, text on book, words on book, book title, letters on book";
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

  // NEW: AI-Enhanced Scene Context Method
  static extractAIEnhancedSceneContext(storyText, enhancedStoryData = null) {
    console.log('🧠 Using AI-enhanced scene context extraction');
    
    if (enhancedStoryData) {
      // Build rich context from AI analysis
      const characters = enhancedStoryData.characters?.map(char => 
        `${char.name || 'character'} (${char.description || 'child'}, feeling ${char.emotions || 'neutral'})`
      ).join(', ') || '';
      
      const setting = enhancedStoryData.setting ? 
        `${enhancedStoryData.setting.location || 'indoor scene'} during ${enhancedStoryData.setting.timeOfDay || 'daytime'} with ${enhancedStoryData.setting.weather || 'clear'} weather` : '';
      
      const objects = enhancedStoryData.objects?.length > 0 ? 
        `, featuring ${enhancedStoryData.objects.slice(0, 3).join(', ')}` : '';
      
      const mood = enhancedStoryData.mood ? `, ${enhancedStoryData.mood} mood` : '';
      
      const lighting = enhancedStoryData.lighting ? `, ${enhancedStoryData.lighting}` : '';
      
      const action = enhancedStoryData.narrativeElements?.action ? 
        `, ${enhancedStoryData.narrativeElements.action}` : '';
      
      const richContext = `${characters} in ${setting}${objects}${mood}${lighting}${action}`;
      
      console.log('✅ Built rich AI-enhanced context:', {
        hasCharacters: !!characters,
        hasSetting: !!setting,
        hasObjects: !!objects,
        contextLength: richContext.length
      });
      
      return richContext;
    } else {
      // Fallback to intelligent text analysis (not substring)
      console.log('⚠️ No AI data available, using intelligent text analysis');
      
      // Extract key sentences and actions
      const sentences = storyText.split('.').filter(s => s.trim().length > 10);
      const keyContent = sentences.slice(0, 3).join('. ').trim();
      
      // Detect action words
      const actionWords = ['walks', 'runs', 'plays', 'reads', 'looks', 'finds', 'goes', 'sees', 'opens', 'sits'];
      const hasAction = actionWords.some(action => storyText.toLowerCase().includes(action));
      
      const intelligentContext = keyContent + (hasAction ? ' [action scene]' : ' [static scene]');
      
      console.log('✅ Built intelligent fallback context:', {
        sentences: sentences.length,
        hasAction,
        contextLength: intelligentContext.length
      });
      
      return intelligentContext;
    }
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
      negativePrompt: this.buildSimpleNegativePrompt(userInfo, 1),
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