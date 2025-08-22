
// MultiStage Enhancement Pipeline - Unified AI Brain for All Tiers
// Now uses real AI functions from FrontendIntelligence.js
//
// ============= ES6 IMPORT STANDARDS =============
// This file follows ES6 import patterns for consistency:
// - Static imports for always-needed modules (top of file)
// - Dynamic imports for conditional/fallback modules (inside methods)
// - No CommonJS require() statements in ES6 context
// - Proper error handling for dynamic imports with fallback logic
// ============= END IMPORT STANDARDS =============

import { DifficultyLevelMapper } from './DifficultyLevelMapper.js';
import { getStyleFramework, validateStyleFramework } from './styleFrameworks.js';
import { BackendTokenManager, PromptPriority } from './BackendTokenManager.js';
import './storyVisualState.js'; // Loads StoryVisualStateManager globally
import './VisualDetailTracker.js'; // Loads VisualDetailTracker globally
// AnimalCharacterManager removed - now using UnifiedCharacterDescriptor
import './AdvancedPronounResolver.js'; // Loads AdvancedPronounResolver globally
import { CulturalTextTracker } from './CulturalTextTracker.js'; // PHASE 4 & 5: Cultural text tracking

function selectWeightedElement(array) {
  if (!array || array.length === 0) return '';
  return array[Math.floor(Math.random() * array.length)];
}

export class MultiStageEnhancementPipeline {
  
  // ============= AI ENHANCEMENT CACHING SYSTEM =============
  static aiEnhancementCache = new Map();
  
  static generateCacheKey(sessionId, pageNumber, storyText) {
    // Create hash of story text for content validation
    let hash = 0;
    for (let i = 0; i < storyText.length; i++) {
      const char = storyText.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `${sessionId}_page_${pageNumber}_${Math.abs(hash)}`;
  }
  
  static getCachedAIEnhancement(sessionId, pageNumber, storyText) {
    const cacheKey = this.generateCacheKey(sessionId, pageNumber, storyText);
    const cached = this.aiEnhancementCache.get(cacheKey);
    
    if (cached) {
      console.log(`🎯 AI Enhancement Cache HIT for ${cacheKey}`);
      return cached;
    }
    
    console.log(`❌ AI Enhancement Cache MISS for ${cacheKey}`);
    return null;
  }
  
  static setCachedAIEnhancement(sessionId, pageNumber, storyText, enhancedData) {
    const cacheKey = this.generateCacheKey(sessionId, pageNumber, storyText);
    this.aiEnhancementCache.set(cacheKey, {
      enhancedData,
      cachedAt: new Date(),
      sessionId,
      pageNumber
    });
    console.log(`💾 AI Enhancement Cache SET for ${cacheKey}`);
  }
  
  static clearSessionCache(sessionId) {
    let cleared = 0;
    for (const [key, value] of this.aiEnhancementCache.entries()) {
      if (value.sessionId === sessionId) {
        this.aiEnhancementCache.delete(key);
        cleared++;
      }
    }
    console.log(`🧹 Cleared ${cleared} AI enhancement cache entries for session ${sessionId}`);
  }
  
  // ============= TIER 1: HIGH-QUALITY AI-ENHANCED PROCESSING WITH STYLE FRAMEWORKS =============
  static async processTier1HighQuality(storyText, userInfo, storyId, sessionId, pageNumber, totalPages, enhancedStoryData, avatarIdentity) {
    try {
      console.log(`🔥 Tier 1 High-Quality AI Pipeline with Style Frameworks + Visual State + Character Consistency: storyId ${storyId}, session ${sessionId} page ${pageNumber}/${totalPages}`);
      
      // Enhanced data should be provided directly from ai-story-enhancer
      if (!enhancedStoryData) {
        console.log(`🧠 No enhanced data provided - using standard processing`);
        // Cache check removed - AI enhancement now handled by ai-story-enhancer function directly
      }
      
      console.log(`🧠 Enhanced Data: ${enhancedStoryData ? 'AI-enhanced input available' : 'Using standard processing'}`);
      
      // Import fresh frontend intelligence and character consistency
      const { FrontendIntelligence } = await import('./FrontendIntelligence.js');
      const { characterConsistency } = await import('./UnifiedCharacterConsistency.js');
      
      // Set current storyId for FrontendIntelligence to use
      globalThis.currentStoryId = storyId;
      
      // 0. Initialize and analyze visual state for consistency
      const visualState = globalThis.StoryVisualStateManager.getOrCreateStoryState(sessionId);
      
      // CRITICAL: Analyze animals FIRST before any text processing to ensure immediate inclusion
      // Animal processing now handled by UnifiedCharacterDescriptor
      
      globalThis.VisualDetailTracker.analyzeTextForDetails(sessionId, storyText, pageNumber);
      globalThis.StoryVisualStateManager.analyzeAndTrackVisualDetails(sessionId, storyText, pageNumber);
      
      // 1. Analyze relationships and resolve pronouns first
      globalThis.AdvancedPronounResolver.analyzeRelationships(sessionId, storyText, pageNumber);
      
      // 2. Enhance story text with consistent visual details AND pronoun resolution
      let enhancedStoryText = globalThis.AdvancedPronounResolver.resolveComplexPronouns(sessionId, storyText, pageNumber);
      enhancedStoryText = globalThis.VisualDetailTracker.injectConsistentDetails(sessionId, enhancedStoryText, pageNumber);
      // Animal injection now handled by UnifiedCharacterDescriptor
      
      // NEW MASTER PLAN: If AI enhancement data is available (3-field schema), incorporate it
      if (enhancedStoryData && enhancedStoryData.primaryScene) {
        console.log('🧠 Incorporating AI-enhanced data (NEW 3-FIELD SCHEMA)');
        // Use primaryScene and visualComponents from new schema
        const aiContext = [];
        
        if (enhancedStoryData.primaryScene) {
          aiContext.push(`Primary Scene: ${enhancedStoryData.primaryScene}`);
        }
        
        if (enhancedStoryData.visualComponents) {
          const vc = enhancedStoryData.visualComponents;
          if (vc.setting) aiContext.push(`Setting: ${vc.setting}`);
          if (vc.lighting) aiContext.push(`Lighting: ${vc.lighting}`);
          if (vc.mood) aiContext.push(`Mood: ${vc.mood}`);
        }
        
        if (aiContext.length > 0) {
          enhancedStoryText = `${enhancedStoryText}\n[AI Context: ${aiContext.join(', ')}]`;
        }
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
      
      // 3. Generate story-based character consistency using UnifiedCharacterConsistency with pre-processed avatar identity
      console.log('🎭 Generating story-based character consistency with pre-processed avatar identity');
      const characterConsistencyData = characterConsistency.getCharacterSeed(
        userInfo.name || 'user',
        storyId,
        userInfo,
        enhancedStoryText, // Pass story context for contextual analysis
        avatarIdentity // Pass pre-processed avatar identity from orchestrator
      );
      
      const characterSeed = characterConsistencyData.seed;
      const characterDescription = characterConsistencyData.characterDescription;
      
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
      // Animal details now handled by UnifiedCharacterDescriptor
      const animalDetails = '';
      
      // NEW: Use enhanced cultural setting logic instead of override
      let enhancedSetting = existingSetting;
      if (!enhancedSetting && enhancedStoryData) {
        // Use AI-determined setting and enhance it with cultural context
        enhancedSetting = FrontendIntelligence.enhanceAISettingWithCulture(
          enhancedStoryData, 
          userInfo, 
          culturalProfile,
          enhancedStoryText
        );
      } else if (!enhancedSetting) {
        // Fallback: enhance default setting
        enhancedSetting = FrontendIntelligence.enhanceAISettingWithCulture(
          { location: "indoor scene" }, 
          userInfo, 
          culturalProfile,
          enhancedStoryText
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
          totalPages,
          avatarIdentity // Pass avatarIdentity for African American detection
        },
        imageDifficulty // Pass difficulty as parameter
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
      
      // PHASE 4 & 5: Track cultural text before token optimization
      CulturalTextTracker.trackTextEntry(sessionId, pageNumber, enhancedPrompt, 'enhanced-prompt');
      
      // NEW MASTER PLAN: Apply token optimization with updated parameters
      const fullCharacterDescription = characterDescription;
      
      console.log('🔧 NEW MASTER PLAN: Token Manager - Full Character Description:', fullCharacterDescription);
      
      // PHASE 4: Track character description for cultural text
      CulturalTextTracker.trackTextEntry(sessionId, pageNumber, fullCharacterDescription, 'character-description');
      
      // NEW MASTER PLAN: Pass aiSchemaData to createPromptSegments for 3-field schema support
      const promptSegments = BackendTokenManager.createPromptSegments(
        sceneContext,
        fullCharacterDescription,
        styleFramework.prompt || 'children\'s book illustration',
        styleFramework.brandSuffix || '',
        visualDetails || '',
        '', // culturalElements - set as empty for now
        enhancedStoryData // Pass AI schema data for new 3-field processing
      );
      
      const optimization = BackendTokenManager.optimizePrompt(promptSegments);
      const finalEnhancedPrompt = optimization.optimizedPrompt;
      
      // PHASE 4: Track final optimized prompt
      CulturalTextTracker.trackPipelineStage(sessionId, pageNumber, finalEnhancedPrompt, 'final-optimized');
      
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
          // NEW MASTER PLAN: Removed old array references
          processingMethod: 'direct-visual-descriptions'
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
            // NEW MASTER PLAN: Updated processing method
            directVisualProcessing: true,
            visualStateEnabled: true,
          hasExistingSetting: !!existingSetting,
          hasVisualDetails: !!visualDetails,
          trackedObjectsCount: globalThis.VisualDetailTracker.getSessionDetails(sessionId).length,
            processingTime: Date.now(),
            // NEW MASTER PLAN: Removed old array stats
            processingMethod: 'direct-visual-descriptions'
        }
      };
      
    } catch (error) {
      console.error('❌ Tier 1 High-Quality processing failed:', error);
      return this.createFallbackResult(storyText, userInfo, 'tier1-high-quality');
    }
  }
  
  // ============= TIER 2: SIMPLE TEMPLATE-BASED PROCESSING =============
  static async processThroughPipeline(storyText, userInfo, storyId, sessionId, pageNumber, totalPages) {
    try {
      console.log(`🔄 Tier 2 Template Pipeline (with enhanced character detection + story consistency): storyId ${storyId}, session ${sessionId} page ${pageNumber}/${totalPages}`);
      
      // 1. Analyze relationships and resolve pronouns first (same as Tier 1)
      globalThis.AdvancedPronounResolver.analyzeRelationships(sessionId, storyText, pageNumber);
      
      // 2. Enhanced character detection - animal handling now in UnifiedCharacterDescriptor
      let enhancedStoryText = globalThis.AdvancedPronounResolver.resolveComplexPronouns(sessionId, storyText, pageNumber);
      enhancedStoryText = globalThis.VisualDetailTracker.injectConsistentDetails(sessionId, enhancedStoryText, pageNumber);
      // Animal injection now handled by UnifiedCharacterDescriptor
      
      console.log('🎯 Tier 2 Enhanced character detection applied:', {
        originalLength: storyText.length,
        enhancedLength: enhancedStoryText.length,
        changed: storyText !== enhancedStoryText,
        trackedDetails: globalThis.VisualDetailTracker.getSessionDetails(sessionId).length,
        trackedAnimals: 0, // Animal tracking now in UnifiedCharacterDescriptor
        animalCharacters: [] // Animal characters now in UnifiedCharacterDescriptor
      });
      
      // 2. Simple template-based processing - NO AI functions
      const difficulty = DifficultyLevelMapper.mapToImageDifficulty(userInfo);
      const framework = getStyleFramework(difficulty);
      
      // 3. Simple character description based on avatar info only
      const characterDescription = this.buildSimpleCharacterDescription(userInfo, difficulty);
      
      const enhancedPrompt = this.buildEnhancedTemplatePrompt(
        enhancedStoryText, // Use enhanced text instead of original
        characterDescription,
        framework,
        userInfo
      );
      
      const negativePrompt = this.buildSimpleNegativePrompt(userInfo, pageNumber);
      
      // NEW MASTER PLAN: Apply token optimization with updated parameters
      const promptSegments = BackendTokenManager.createPromptSegments(
        enhancedStoryText,
        characterDescription,
        framework.prompt || 'children\'s book illustration',
        framework.brandSuffix || '',
        '', // visualDetails
        '', // culturalElements
        null // aiSchemaData - not available in Tier 2
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

  static buildSimpleCharacterDescription(userInfo, difficulty) {
    // Use local character generation logic (UnifiedCharacterDescriptor not available in edge functions)
    console.log('Building simple character description with local logic');
      
    // Fallback to legacy logic for compatibility
    const name = userInfo?.name || 'Alex';
    const gender = userInfo?.avatar?.type === 'girl' ? 'girl' : 'boy';
    const skinTone = userInfo?.avatar?.skinTone || 'medium';
    
    // Apply age range modifier based on difficulty level
    let ageRange = '5-8 years old'; // Default for beginner/easy/medium
    if (difficulty === 'hard') {
      ageRange = '9-11 years old';
    } else if (difficulty === 'expert') {
      ageRange = '11-13 years old';
    }
    
    // Simple skin tone mapping
    const skinMap = {
      light: 'light skin',
      medium: 'medium skin',
      olive: 'olive skin', 
      dark: 'dark skin',
      pale: 'pale skin'
    };
    
    return `${name} (${gender}, ${ageRange}, with ${skinMap[skinTone] || 'medium skin'})`;
  }
  
  // ============= SMART NEGATIVE PROMPTS WITH STYLE FRAMEWORK SUPPORT =============
  static buildAdvancedNegativePrompt(userInfo, culturalProfile, styleFramework, pageNumber) {
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
  
  static buildSimpleNegativePrompt(userInfo, pageNumber) {
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
  static extractAIEnhancedSceneContext(storyText, enhancedStoryData) {
    console.log('🧠 Using AI-enhanced scene context extraction');
    
    if (enhancedStoryData) {
      // Build rich context from AI analysis
      const characters = enhancedStoryData.characters?.map(char => 
        `${char.name || 'character'} (${char.description || 'child'}, feeling ${char.emotions || 'neutral'})`
      ).join(', ') || '';
      
      // Enhanced setting detection with validation
      let setting = '';
      if (enhancedStoryData.setting) {
        const location = enhancedStoryData.setting.location || 'indoor scene';
        const timeOfDay = enhancedStoryData.setting.timeOfDay || 'daytime';
        const weather = enhancedStoryData.setting.weather || 'clear';
        
        // Validate setting against story text for accuracy
        const storyLower = storyText.toLowerCase();
        let validatedLocation = location;
        
        // Fix common park vs forest confusion
        if (location.includes('park') && (storyLower.includes('forest') || storyLower.includes('woods') || storyLower.includes('trees'))) {
          validatedLocation = storyLower.includes('park') ? 'park with trees' : 'forest';
        } else if (location.includes('forest') && storyLower.includes('park')) {
          validatedLocation = 'park';
        }
        
        // Additional location validation
        const locationKeywords = {
          'school': ['classroom', 'teacher', 'desk', 'lesson'],
          'home': ['house', 'room', 'kitchen', 'bedroom'],
          'library': ['books', 'shelves', 'quiet', 'reading'],
          'playground': ['swing', 'slide', 'play equipment'],
          'beach': ['sand', 'ocean', 'waves', 'seashell'],
          'garden': ['flowers', 'plants', 'growing', 'watering']
        };
        
        for (const [locationType, keywords] of Object.entries(locationKeywords)) {
          if (keywords.some(keyword => storyLower.includes(keyword))) {
            validatedLocation = locationType;
            break;
          }
        }
        
        setting = `${validatedLocation} during ${timeOfDay} with ${weather} weather`;
      }
      
      const objects = enhancedStoryData.objects?.length > 0 ? 
        `, featuring ${enhancedStoryData.objects.slice(0, 3).join(', ')}` : '';
      
      const mood = enhancedStoryData.mood ? `, ${enhancedStoryData.mood} mood` : '';
      
      const lighting = enhancedStoryData.lighting ? `, ${enhancedStoryData.lighting}` : '';
      
      const action = enhancedStoryData.narrativeElements?.action ? 
        `, ${enhancedStoryData.narrativeElements.action}` : '';
      
      const richContext = `${characters} in ${setting}${objects}${mood}${lighting}${action}`;
      
      console.log('✅ Built rich AI-enhanced context with validation:', {
        hasCharacters: !!characters,
        hasSetting: !!setting,
        hasObjects: !!objects,
        contextLength: richContext.length,
        originalLocation: enhancedStoryData.setting?.location,
        validatedLocation: setting.includes('during') ? setting.split(' during')[0] : setting
      });
      
      return richContext;
    } else {
      // Enhanced fallback to intelligent text analysis
      console.log('⚠️ No AI data available, using enhanced intelligent text analysis');
      
      // Extract key sentences and actions
      const sentences = storyText.split('.').filter(s => s.trim().length > 10);
      const keyContent = sentences.slice(0, 3).join('. ').trim();
      
      // Enhanced location detection for fallback
      const storyLower = storyText.toLowerCase();
      let detectedLocation = 'indoor scene';
      
      const locationMatches = {
        'park': ['park', 'playground', 'swings', 'slides'],
        'forest': ['forest', 'woods', 'trees', 'hiking trail'],
        'school': ['school', 'classroom', 'teacher', 'lesson'],
        'home': ['home', 'house', 'kitchen', 'bedroom'],
        'library': ['library', 'books', 'shelves', 'librarian'],
        'beach': ['beach', 'sand', 'ocean', 'waves'],
        'garden': ['garden', 'flowers', 'plants', 'growing']
      };
      
      for (const [location, keywords] of Object.entries(locationMatches)) {
        if (keywords.some(keyword => storyLower.includes(keyword))) {
          detectedLocation = location;
          break;
        }
      }
      
      // Detect action words
      const actionWords = ['walks', 'runs', 'plays', 'reads', 'looks', 'finds', 'goes', 'sees', 'opens', 'sits'];
      const hasAction = actionWords.some(action => storyLower.includes(action));
      
      const intelligentContext = `character in ${detectedLocation} scene, ${keyContent}` + 
                                (hasAction ? ' [action scene]' : ' [static scene]');
      
      console.log('✅ Built enhanced intelligent fallback context:', {
        sentences: sentences.length,
        detectedLocation,
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
