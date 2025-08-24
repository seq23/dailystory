
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
import { CharacterConsistencyService } from './CharacterConsistencyService.js';
import { SessionStateManager } from './SessionStateManager.js';
import './VisualDetailTracker.js'; // Loads VisualDetailTracker globally
import './AdvancedPronounResolver.js'; // Loads AdvancedPronounResolver globally
import { CulturalTextTracker } from './CulturalTextTracker.js';
import { mapAvatarIdentity } from './mapAvatarIdentity.js';
import { RealContextCollector } from './RealContextCollector.js';


function selectWeightedElement(array) {
  if (!array || array.length === 0) return '';
  return array[Math.floor(Math.random() * array.length)];
}

export class MultiStageEnhancementPipeline {
  
  // ============= CLEAN ARCHITECTURE SERVICES =============
  static characterService = new CharacterConsistencyService();
  static sessionManager = new SessionStateManager();
  
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
      
      // Import fresh frontend intelligence and character consistency with comprehensive error handling
      console.log('🔍 Tier 1: Starting FrontendIntelligence import...');
      const { FrontendIntelligence } = await import('./FrontendIntelligence.js');
      console.log('✅ Tier 1: FrontendIntelligence import successful');
      
      // Import characterConsistency singleton with safety
      console.log('🔍 Tier 1: Starting UnifiedCharacterConsistency import...');
      let characterConsistency;
      try {
        const { characterConsistency: importedInstance } = await import('./UnifiedCharacterConsistency.js');
        
        if (importedInstance && typeof importedInstance.getCharacterSeed === 'function') {
          characterConsistency = importedInstance;
          console.log('✅ Tier 1: UnifiedCharacterConsistency import successful');
        } else {
          throw new Error('Invalid characterConsistency instance');
        }
      } catch (importError) {
        console.error('❌ UnifiedCharacterConsistency import failed:', importError.message);
        // Fallback mock to prevent cascade failure
        characterConsistency = {
          getCharacterSeed: async (name, storyId, userInfo, storyText, avatarIdentity) => {
            console.log('🔄 Using enhanced character consistency fallback mock');
            return {
              seed: `fallback-${Date.now()}`,
              characterDescription: avatarIdentity?.visualDescription || 'young child with friendly demeanor',
              culturalContext: userInfo?.culturalProfile || 'universal child-friendly context'
            };
          }
        };
        console.log('🔄 Enhanced character consistency fallback mock activated');
      }
      
      // Set current storyId for FrontendIntelligence to use
      globalThis.currentStoryId = storyId;
      
      // ============= SESSION & VISUAL STATE INITIALIZATION =============
      const visualState = this.sessionManager.getOrCreateSessionState(sessionId);
      console.log('✅ Visual state initialized with clean architecture');
      
      // 0.5. SECONDARY ELEMENT DETECTION - Detect and track secondary characters and animals
      let SecondaryElementDetector;
      try {
        console.log('🔍 Tier 1: Starting SecondaryElementDetector import (Strategy 1: relative)...');
        SecondaryElementDetector = (await import('./SecondaryElementDetector.js')).SecondaryElementDetector;
        console.log('✅ Tier 1: SecondaryElementDetector Strategy 1 successful');
      } catch (error1) {
        try {
          console.log('🔍 Tier 1: SecondaryElementDetector Strategy 2: absolute path...');
          SecondaryElementDetector = (await import(`${Deno.cwd()}/supabase/functions/_shared/SecondaryElementDetector.js`)).SecondaryElementDetector;
          console.log('✅ Tier 1: SecondaryElementDetector Strategy 2 successful');
        } catch (error2) {
          try {
            console.log('🔍 Tier 1: SecondaryElementDetector Strategy 3: file protocol...');
            SecondaryElementDetector = (await import(`file://${Deno.cwd()}/supabase/functions/_shared/SecondaryElementDetector.js`)).SecondaryElementDetector;
            console.log('✅ Tier 1: SecondaryElementDetector Strategy 3 successful');
          } catch (error3) {
            try {
              console.log('🔍 Tier 1: SecondaryElementDetector Strategy 4: mock fallback...');
              SecondaryElementDetector = {
                parseElements: async () => {
                  console.log('🔄 Using mock SecondaryElementDetector');
                  return [];
                }
              };
              console.log('✅ Tier 1: SecondaryElementDetector Strategy 4 (mock) successful');
            } catch (error4) {
              console.error('❌ All SecondaryElementDetector import strategies failed:', { error1: error1.message, error2: error2.message, error3: error3.message, error4: error4.message });
              SecondaryElementDetector = null;
            }
          }
        }
      }
      
      try {
        const secondaryElements = await SecondaryElementDetector.parseElements(
          sessionId, 
          enhancedStoryData?.primaryScene || '', 
          storyText, 
          pageNumber
        );

        // Update visual state with detected elements
        if (secondaryElements && secondaryElements.length > 0) {
          console.log(`🎭 Found ${secondaryElements.length} secondary elements, updating visual state...`);
          
          for (const element of secondaryElements) {
            if (element.category === 'secondary_character') {
              globalThis.StoryVisualStateManager.updateSecondaryCharacter(
                sessionId, 
                element.name, 
                element.type, 
                element.relationshipType,
                pageNumber
              );
            } else if (element.category === 'character_animal') {
              globalThis.StoryVisualStateManager.updateCharacterAnimal(
                sessionId,
                element.name,
                element.species,
                element.hasDialogue,
                pageNumber
              );
            }
          }
        }
      } catch (error) {
        console.log('⚠️ Secondary element detection failed:', error.message);
      }
      
      // CRITICAL: Analyze animals FIRST before any text processing to ensure immediate inclusion
      // Animal processing now handled by UnifiedCharacterDescriptor
      
      // Visual tracking with clean architecture
      try {
        if (globalThis.VisualDetailTracker?.analyzeTextForDetails) {
          globalThis.VisualDetailTracker.analyzeTextForDetails(sessionId, storyText, pageNumber);
        }
        this.sessionManager.analyzeAndTrackVisualDetails(sessionId, storyText, pageNumber);
        if (globalThis.AdvancedPronounResolver?.analyzeRelationships) {
          globalThis.AdvancedPronounResolver.analyzeRelationships(sessionId, storyText, pageNumber);
        }
      } catch (error) {
        console.warn('⚠️ Visual tracking failed, continuing without:', error.message);
      }
      
      // 2. REAL CONTEXT INTEGRATION - Collect actual story context first
      const realContextData = await RealContextCollector.collectRealStoryContext(sessionId, pageNumber, storyText);
      console.log('📚 Real context collected:', {
        previousPages: realContextData.previousPages.length,
        visualElements: realContextData.visualElements.length,
        hasCharacterDescriptions: realContextData.characterDescriptions.length > 0
      });
      
      // 2.5. Enhance story text with consistent visual details AND pronoun resolution
      let enhancedStoryText = storyText; // Start with original text
      try {
        if (globalThis.AdvancedPronounResolver?.resolveComplexPronouns) {
          enhancedStoryText = globalThis.AdvancedPronounResolver.resolveComplexPronouns(sessionId, storyText, pageNumber);
        }
        if (globalThis.VisualDetailTracker?.injectConsistentDetails) {
          enhancedStoryText = globalThis.VisualDetailTracker.injectConsistentDetails(sessionId, enhancedStoryText, pageNumber);
        }
        
        // Add real context to enhanced story text
        enhancedStoryText = RealContextCollector.enhanceStoryTextWithRealContext(enhancedStoryText, realContextData);
        
      } catch (error) {
        console.warn('⚠️ Story enhancement failed, using original text:', error.message);
        enhancedStoryText = storyText;
      }
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
        }
        
        // Add character mood from characters object
        if (enhancedStoryData.characters?.characterMood) {
          aiContext.push(`Mood: ${enhancedStoryData.characters.characterMood}`);
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
      
      // 3. Generate story-based character consistency with clean architecture
      console.log('🎭 Generating story-based character consistency with clean architecture');
      
      // Process avatar identity using runware source of truth
      const processedAvatarIdentity = mapAvatarIdentity(userInfo);
      
      const characterConsistencyData = await this.characterService.getCharacterSeed(
        sessionId,
        userInfo.name || 'user',
        userInfo,
        enhancedStoryText, // Pass story context for contextual analysis
        processedAvatarIdentity // Pass standardized avatar identity
      );
      
      const characterSeed = characterConsistencyData.seed;
      const characterDescription = characterConsistencyData.characterDescription;
      
      // 4. Get cultural profile from processed identity
      const culturalProfile = FrontendIntelligence.CULTURAL_VISUAL_PROFILES?.[processedAvatarIdentity.culturalProfile] || 
                             FrontendIntelligence.CULTURAL_VISUAL_PROFILES?.['en'] || {};
      
      // 5. Extract scene and emotional context from enhanced text using AI-enhanced method
      const sceneContext = this.extractAIEnhancedSceneContext(enhancedStoryText, enhancedStoryData);
      const emotionalContext = FrontendIntelligence.detectEmotionalContext(enhancedStoryText);
      
      // 6. Get existing visual state for consistency WITH SAFETY
      let existingSetting = '';
      let visualDetails = '';
      let storyStateDetails = '';
      let secondaryCharacterData = [];
      let characterAnimals = [];
      let secondaryCharacterPrompt = '';
      
      try {
        existingSetting = this.sessionManager.getSettingForPrompt(sessionId);
        if (globalThis.VisualDetailTracker?.getVisualDetailsForPrompt) {
          visualDetails = globalThis.VisualDetailTracker.getVisualDetailsForPrompt(sessionId);
        }
        storyStateDetails = this.sessionManager.getVisualDetailsForPrompt(sessionId);
        secondaryCharacterData = this.sessionManager.getSecondaryCharacters(sessionId, pageNumber);
        characterAnimals = this.sessionManager.getCharacterAnimals(sessionId, pageNumber);
        secondaryCharacterPrompt = this.buildSecondaryCharacterPrompt(secondaryCharacterData, characterAnimals);
      } catch (error) {
        console.warn('⚠️ Visual state retrieval failed, using empty values:', error.message);
      }
      
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
          processedAvatarIdentity, // Pass processed avatar identity
          secondaryCharacterPrompt // Include secondary characters
        },
        imageDifficulty // Pass difficulty as parameter
      );
      
      // 7.5. AVATAR CONSISTENCY VALIDATION - Tier 1
      console.log('🔍 Tier 1: Validating avatar consistency in generated prompt');
      const validationResult = this.validateAvatarConsistency(enhancedPrompt, avatarIdentity, userInfo, 'tier1');
      
      let finalPrompt = enhancedPrompt;
      if (!validationResult.isValid) {
        console.warn('⚠️ Tier 1: Avatar validation failed, generating enhanced prompt:', validationResult.reason);
        finalPrompt = this.generateEnhancedAvatarPrompt(enhancedStoryText, validationResult.fixedAvatarIdentity, userInfo, styleFramework);
        
        // Re-validate the enhanced prompt
        const revalidation = this.validateAvatarConsistency(finalPrompt, validationResult.fixedAvatarIdentity, userInfo, 'tier1-revalidated');
        if (!revalidation.isValid) {
          console.error('❌ Tier 1: Re-validation failed, IMMEDIATE cascade to Tier 2.5');
          throw new Error(`Tier 1 failed immediately: ${revalidation.reason}`);
        }
      }
      
      console.log('✅ Tier 1: Avatar validation passed');
      
      // 8. Generate unified negative prompt with style framework considerations
      const negativePrompt = this.buildUnifiedNegativePrompt(
        userInfo,
        culturalProfile,
        styleFramework,
        pageNumber,
        avatarIdentity
      );
      
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
      
      // PHASE 4 & 5: Track cultural text
      CulturalTextTracker.trackTextEntry(sessionId, pageNumber, enhancedPrompt, 'enhanced-prompt');
      
      // PHASE 2.16: Reorder prompt construction logic (Primary Scene → Brand Suffix → Character → Visual → Cultural → Style)
      const promptParts = [];
      
      // CRITICAL: Primary Scene (never truncate)
      if (enhancedStoryData?.primaryScene) {
        promptParts.push(enhancedStoryData.primaryScene);
      } else if (sceneContext) {
        promptParts.push(sceneContext);
      }
      
      // HIGH: Brand Suffix for ALL characters
      if (styleFramework.brandSuffix) {
        promptParts.push(styleFramework.brandSuffix);
      }
      
      // MEDIUM: Character description
      const fullCharacterDescription = characterDescription;
      if (fullCharacterDescription) {
        promptParts.push(fullCharacterDescription);
      }
      
      // HIGH PRIORITY: Action and Setting first
      if (enhancedStoryData?.visualComponents) {
        const vc = enhancedStoryData.visualComponents;
        // TOP PRIORITY: Action
        if (vc.action) promptParts.push(vc.action);
        // SECOND PRIORITY: Setting  
        if (vc.setting) promptParts.push(vc.setting);
        // LOWER PRIORITY: Other visual components
        if (vc.lighting) promptParts.push(vc.lighting);
        if (vc.keyObjects) promptParts.push(vc.keyObjects);
      }
      
      // Character mood from characters object
      if (enhancedStoryData?.characters?.characterMood) {
        promptParts.push(enhancedStoryData.characters.characterMood);
      }
      
      // MEDIUM: Visual details and secondary characters
      if (visualDetails) promptParts.push(visualDetails);
      if (secondaryCharacterPrompt) promptParts.push(secondaryCharacterPrompt);
      
      // LOW: Style framework
      if (styleFramework.prompt) {
        promptParts.push(styleFramework.prompt);
      }
      
      // Build final prompt with simple length checking
      const finalEnhancedPrompt = promptParts.filter(part => part && part.trim().length > 0).join(', ');
      
      // Length checking removed - let Runware handle truncation
      
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
          // PHASE 2: Updated processing method
          directPromptBuilding: true,
          tokenManagerRemoved: true,
          visualStateEnabled: true,
          hasExistingSetting: !!existingSetting,
          hasVisualDetails: !!visualDetails,
          trackedObjectsCount: globalThis.VisualDetailTracker.getSessionDetails(sessionId).length,
          processingTime: Date.now(),
          processingMethod: 'direct-prompt-construction'
        }
      };
      
    } catch (error) {
      console.error('❌ Tier 1 High-Quality processing failed - cascading to Tier 2:', error.message);
      console.error('🔍 Tier 1 Error Stack:', error.stack);
      console.error('🔍 Tier 1 Function Context:', { storyId, sessionId, pageNumber, totalPages });
      
      // Throw error to enable proper tier cascading (Tier 1 → Tier 2)
      throw new Error(`Tier 1 processing failed: ${error.message}`);
    }
  }
  
  // ============= TIER 2: HIGH-QUALITY PREMIUM PROCESSING (TIER 1 MINUS AI ENHANCEMENT) =============
  static async processTier2HighQuality(storyText, userInfo, storyId, sessionId, pageNumber, totalPages, avatarIdentity) {
    try {
    console.log(`🔥 Tier 2: Premium processing (no AI enhancement) for page ${pageNumber}/${totalPages}`);
    console.log('🔍 TIER 2 DEBUG - avatarIdentity received:', avatarIdentity);
    console.log('🔍 TIER 2 DEBUG - avatarIdentity.visualDescription:', avatarIdentity?.visualDescription);

      // Declare variables at method scope to prevent scoping issues
      let FrontendIntelligence, characterConsistency;
      
      try {
        console.log('🔍 Tier 2: Starting FrontendIntelligence import (Strategy 1: relative)...');
        ({ FrontendIntelligence } = await import('./FrontendIntelligence.js'));
        console.log('✅ Tier 2: FrontendIntelligence Strategy 1 successful');
      } catch (error1) {
        try {
          console.log('🔍 Tier 2: FrontendIntelligence Strategy 2: absolute path...');
          ({ FrontendIntelligence } = await import(`${Deno.cwd()}/supabase/functions/_shared/FrontendIntelligence.js`));
          console.log('✅ Tier 2: FrontendIntelligence Strategy 2 successful');
        } catch (error2) {
          try {
            console.log('🔍 Tier 2: FrontendIntelligence Strategy 3: working directory...');
            ({ FrontendIntelligence } = await import(`${Deno.cwd()}/supabase/functions/_shared/FrontendIntelligence.js`));
            console.log('✅ Tier 2: FrontendIntelligence Strategy 3 successful');
          } catch (error3) {
            try {
              console.log('🔍 Tier 2: FrontendIntelligence Strategy 4: URL import...');
              ({ FrontendIntelligence } = await import('https://deno.land/x/frontend_intelligence@latest/mod.js'));
              console.log('✅ Tier 2: FrontendIntelligence Strategy 4 successful');
            } catch (error4) {
              console.error('❌ All FrontendIntelligence import strategies failed:', { error1: error1.message, error2: error2.message, error3: error3.message, error4: error4.message });
              throw new Error(`Tier 2 processing failed: FrontendIntelligence module unavailable`);
            }
          }
        }
      }

      // Import characterConsistency singleton with safety (Tier 2)
      console.log('🔍 Tier 2: Starting UnifiedCharacterConsistency import...');
      try {
        const { characterConsistency: importedInstance } = await import('./UnifiedCharacterConsistency.js');
        
        if (importedInstance && typeof importedInstance.getCharacterSeed === 'function') {
          characterConsistency = importedInstance;
          console.log('✅ Tier 2: UnifiedCharacterConsistency import successful');
        } else {
          throw new Error('Invalid characterConsistency instance');
        }
      } catch (importError) {
        console.error('❌ Tier 2: UnifiedCharacterConsistency import failed:', importError.message);
        // Fallback mock to prevent cascade failure
        characterConsistency = {
          getCharacterSeed: async (name, storyId, userInfo, storyText, avatarIdentity) => {
            console.log('🔄 Tier 2: Using enhanced character consistency fallback mock');
            return {
              seed: `fallback-tier2-${Date.now()}`,
              characterDescription: avatarIdentity?.visualDescription || 'young child with friendly demeanor',
              culturalContext: userInfo?.culturalProfile || 'universal child-friendly context'
            };
          }
        };
        console.log('🔄 Tier 2: Enhanced character consistency fallback mock activated');
      }
      
      // Set current storyId for FrontendIntelligence to use
      globalThis.currentStoryId = storyId;
      
      // Initialize and analyze visual state for consistency WITH SAFETY
      let visualState;
      try {
        if (globalThis.StoryVisualStateManager?.getOrCreateStoryState) {
          visualState = globalThis.StoryVisualStateManager.getOrCreateStoryState(sessionId);
          console.log('✅ Tier 2: Visual state initialized successfully');
        } else {
          throw new Error('StoryVisualStateManager not available');
        }
      } catch (error) {
        console.error('❌ Tier 2: Visual state initialization failed, cascading to Tier 2.5:', error.message);
        throw new Error(`Tier 2 failed: Visual state unavailable - ${error.message}`);
      }
      
      // PHASE 1 FIX: Add missing secondary element detection to Tier 2 (same as Tier 1)
      let SecondaryElementDetector;
      try {
        console.log('🔍 Tier 2: Starting SecondaryElementDetector import (Strategy 1: relative)...');
        SecondaryElementDetector = (await import('./SecondaryElementDetector.js')).SecondaryElementDetector;
        console.log('✅ Tier 2: SecondaryElementDetector Strategy 1 successful');
      } catch (error1) {
        try {
          console.log('🔍 Tier 2: SecondaryElementDetector Strategy 2: absolute path...');
          SecondaryElementDetector = (await import(`${Deno.cwd()}/supabase/functions/_shared/SecondaryElementDetector.js`)).SecondaryElementDetector;
          console.log('✅ Tier 2: SecondaryElementDetector Strategy 2 successful');
        } catch (error2) {
          try {
            console.log('🔍 Tier 2: SecondaryElementDetector Strategy 3: file protocol...');
            SecondaryElementDetector = (await import(`file://${Deno.cwd()}/supabase/functions/_shared/SecondaryElementDetector.js`)).SecondaryElementDetector;
            console.log('✅ Tier 2: SecondaryElementDetector Strategy 3 successful');
          } catch (error3) {
            try {
              console.log('🔍 Tier 2: SecondaryElementDetector Strategy 4: mock fallback...');
              SecondaryElementDetector = {
                parseElements: async () => {
                  console.log('🔄 Using mock SecondaryElementDetector');
                  return [];
                }
              };
              console.log('✅ Tier 2: SecondaryElementDetector Strategy 4 (mock) successful');
            } catch (error4) {
              console.error('❌ All SecondaryElementDetector import strategies failed:', { error1: error1.message, error2: error2.message, error3: error3.message, error4: error4.message });
              SecondaryElementDetector = null;
            }
          }
        }
      }
      
      try {
        const secondaryElements = await SecondaryElementDetector.parseElements(
          sessionId, 
          '', // No AI-enhanced primary scene data in Tier 2
          storyText, 
          pageNumber
        );

        // Update visual state with detected elements
        if (secondaryElements && secondaryElements.length > 0) {
          console.log(`🎭 Tier 2: Found ${secondaryElements.length} secondary elements, updating visual state...`);
          
          for (const element of secondaryElements) {
            if (element.category === 'secondary_character') {
              globalThis.StoryVisualStateManager.updateSecondaryCharacter(
                sessionId, 
                element.name, 
                element.type, 
                element.relationshipType,
                pageNumber
              );
            } else if (element.category === 'character_animal') {
              globalThis.StoryVisualStateManager.updateCharacterAnimal(
                sessionId,
                element.name,
                element.species,
                element.hasDialogue,
                pageNumber
              );
            }
          }
        }
      } catch (error) {
        console.log('⚠️ Tier 2: Secondary element detection failed:', error.message);
      }
      
      globalThis.VisualDetailTracker.analyzeTextForDetails(sessionId, storyText, pageNumber);
      globalThis.StoryVisualStateManager.analyzeAndTrackVisualDetails(sessionId, storyText, pageNumber);
      
      // Analyze relationships and resolve pronouns first
      globalThis.AdvancedPronounResolver.analyzeRelationships(sessionId, storyText, pageNumber);
      
      // Enhance story text with consistent visual details AND pronoun resolution
      let enhancedStoryText = globalThis.AdvancedPronounResolver.resolveComplexPronouns(sessionId, storyText, pageNumber);
      enhancedStoryText = globalThis.VisualDetailTracker.injectConsistentDetails(sessionId, enhancedStoryText, pageNumber);
      
      console.log('🎯 Tier 2 premium enhancement applied:', {
        originalLength: storyText.length,
        enhancedLength: enhancedStoryText.length,
        changed: storyText !== enhancedStoryText,
        trackedDetails: globalThis.VisualDetailTracker.getSessionDetails(sessionId).length
      });
      
      // Detect and update setting/environment from story text
      this.updateSettingFromText(sessionId, enhancedStoryText);
      
      // Determine difficulty level and get style framework
      const imageDifficulty = DifficultyLevelMapper.mapToImageDifficulty(userInfo);
      const styleFramework = getStyleFramework(imageDifficulty);
      
      console.log('🎨 Selected premium style framework:', imageDifficulty, styleFramework.name);
      
      // Generate story-based character consistency with clean architecture (Tier 2)
      console.log('🎭 Tier 2: Using clean character consistency architecture');
      
      // Process avatar identity using clean architecture
      const processedAvatarIdentity = mapAvatarIdentity(userInfo);
      
      const characterConsistencyData = await this.characterService.getCharacterSeed(
        sessionId,
        userInfo.name || 'user',
        userInfo,
        enhancedStoryText,
        processedAvatarIdentity // Pass standardized avatar identity
      );
      
      const characterSeed = characterConsistencyData.seed;
      const characterDescription = characterConsistencyData.characterDescription;
      
      // Get cultural profile from processed identity (Tier 2)
      const culturalProfile = FrontendIntelligence.CULTURAL_VISUAL_PROFILES?.[processedAvatarIdentity.culturalProfile] || 
                             FrontendIntelligence.CULTURAL_VISUAL_PROFILES?.['en'] || {};
      
      // Extract scene and emotional context from enhanced text (no AI enhancement)
      const sceneContext = this.extractAIEnhancedSceneContext(enhancedStoryText, {}, pageNumber, totalPages, userInfo, sessionId);
      const emotionalContext = FrontendIntelligence.detectEmotionalContext(enhancedStoryText);
      
      // Get existing visual state for consistency WITH SAFETY (Tier 2)
      let existingSetting = '';
      let visualDetails = '';
      let storyStateDetails = '';
      let secondaryCharacterData = [];
      let characterAnimals = [];
      let secondaryCharacterPrompt = '';
      
      try {
        if (globalThis.StoryVisualStateManager?.getSettingForPrompt) {
          existingSetting = globalThis.StoryVisualStateManager.getSettingForPrompt(sessionId);
        }
        if (globalThis.VisualDetailTracker?.getVisualDetailsForPrompt) {
          visualDetails = globalThis.VisualDetailTracker.getVisualDetailsForPrompt(sessionId);
        }
        if (globalThis.StoryVisualStateManager?.getVisualDetailsForPrompt) {
          storyStateDetails = globalThis.StoryVisualStateManager.getVisualDetailsForPrompt(sessionId);
        }
        if (globalThis.StoryVisualStateManager?.getSecondaryCharacters) {
          secondaryCharacterData = globalThis.StoryVisualStateManager.getSecondaryCharacters(sessionId, pageNumber);
        }
        if (globalThis.StoryVisualStateManager?.getCharacterAnimals) {
          characterAnimals = globalThis.StoryVisualStateManager.getCharacterAnimals(sessionId, pageNumber);
        }
        secondaryCharacterPrompt = this.buildSecondaryCharacterPrompt(secondaryCharacterData, characterAnimals);
      } catch (error) {
        console.warn('⚠️ Tier 2: Visual state retrieval failed, using empty values:', error.message);
      }
      
      // Enhanced setting logic without AI data
      let enhancedSetting = existingSetting;
      if (!enhancedSetting) {
        enhancedSetting = FrontendIntelligence.enhanceAISettingWithCulture(
          { location: "indoor scene" }, 
          userInfo, 
          culturalProfile,
          enhancedStoryText
        );
      }
      
      // Build premium prompt using FrontendIntelligence
      const enhancedPrompt = FrontendIntelligence.buildPremiumPrompt(
        enhancedStoryText,
        userInfo,
        characterSeed,
        culturalProfile,
        sceneContext,
        emotionalContext,
        styleFramework,
        {
          existingSetting: enhancedSetting,
          visualDetails,
          storyStateDetails,
          animalDetails: characterAnimals && characterAnimals.length > 0 ? 
            characterAnimals.map(animal => `${animal.name} the ${animal.species}`).join(', ') : '',
          pageNumber,
          totalPages,
          avatarIdentity // Pass processed avatar identity from orchestrator
        },
        imageDifficulty
      );
      
      // 7.5. AVATAR CONSISTENCY VALIDATION - Tier 2
      console.log('🔍 Tier 2: Validating avatar consistency in generated prompt');
      const validationResult = this.validateAvatarConsistency(enhancedPrompt, avatarIdentity, userInfo, 'tier2');
      
      let finalPrompt = enhancedPrompt;
      if (!validationResult.isValid) {
        console.warn('⚠️ Tier 2: Avatar validation failed, generating enhanced prompt:', validationResult.reason);
        finalPrompt = this.generateEnhancedAvatarPrompt(enhancedStoryText, validationResult.fixedAvatarIdentity, userInfo, styleFramework);
        
        // Re-validate the enhanced prompt
        const revalidation = this.validateAvatarConsistency(finalPrompt, validationResult.fixedAvatarIdentity, userInfo, 'tier2-revalidated');
        if (!revalidation.isValid) {
          console.error('❌ Tier 2: Re-validation failed, cascading to Tier 2.5');
          throw new Error(`Tier 2 avatar validation failed: ${revalidation.reason}`);
        }
      }
      
      console.log('✅ Tier 2: Avatar validation passed');
      
      // 8. Generate unified negative prompt
      const negativePrompt = this.buildUnifiedNegativePrompt(
        userInfo,
        culturalProfile,
        styleFramework,
        pageNumber,
        avatarIdentity
      );
      
      // Premium generation parameters using style framework
      const generationParams = {
        model: 'runware:100@1',
        steps: styleFramework.parameters?.steps || 8,
        cfgScale: styleFramework.parameters?.cfgScale || 2.0,
        scheduler: 'FlowMatchEulerDiscreteScheduler',
        width: 1024,
        height: 1024,
        outputFormat: 'WEBP'
      };
      
      // Track cultural text before token optimization
      CulturalTextTracker.trackTextEntry(sessionId, pageNumber, enhancedPrompt, 'enhanced-prompt');
      
      // Apply token optimization with updated parameters
      const fullCharacterDescription = characterDescription;
      
      CulturalTextTracker.trackTextEntry(sessionId, pageNumber, fullCharacterDescription, 'character-description');
      
      const promptSegments = BackendTokenManager.createPromptSegments(
        sceneContext,
        fullCharacterDescription,
        styleFramework.prompt || 'children\'s book illustration',
        styleFramework.brandSuffix || '',
        visualDetails || '',
        secondaryCharacterPrompt, // PHASE 2 FIX: Pass secondary character prompt instead of empty string
        {} // No AI enhancement data for Tier 2
      );
      
      // Simple segment joining - preserve priority order and exact content
      const finalEnhancedPrompt = promptSegments
        .sort((a, b) => a.priority - b.priority) // Sort by priority (lower = higher priority)
        .map(segment => segment.content)
        .filter(content => content && content.trim().length > 0)
        .join(', ');
      
      // Debug logging to verify exact prompt being sent
      console.log(`🎯 EXACT PROMPT TO RUNWARE (${finalEnhancedPrompt.length} chars):`, finalEnhancedPrompt);
      
      CulturalTextTracker.trackPipelineStage(sessionId, pageNumber, finalEnhancedPrompt, 'final-optimized');
      
      console.log('✨ Tier 2 premium processing completed:', {
        styleFramework: styleFramework.name,
        difficulty: imageDifficulty,
        characterSeed,
        existingSetting: existingSetting ? 'YES' : 'NO',
        visualDetails: visualDetails ? 'YES' : 'NO',
        trackedObjects: globalThis.VisualDetailTracker.getSessionDetails(sessionId).length,
        finalPromptLength: finalEnhancedPrompt.length,
        processingMethod: 'premium-quality-no-ai'
      });
      
      return {
        enhancedPrompt: finalEnhancedPrompt,
        negativePrompt,
        generationParams,
        metadata: {
          tier: 'tier2-premium-quality',
          characterSeed,
          styleFramework: styleFramework.name,
          difficulty: imageDifficulty,
          culturalProfile: userInfo.nativeLanguage,
          emotionalContext: emotionalContext.mood,
          premiumProcessing: true,
          visualStateEnabled: true,
          hasExistingSetting: !!existingSetting,
          hasVisualDetails: !!visualDetails,
          trackedObjectsCount: globalThis.VisualDetailTracker.getSessionDetails(sessionId).length,
          processingTime: Date.now(),
          processingMethod: 'premium-quality-no-ai'
        }
      };
      
    } catch (error) {
      console.error('❌ Tier 2 premium processing failed - cascading to Tier 2.5:', error.message);
      console.error('🔍 Tier 2 Error Stack:', error.stack);
      console.error('🔍 Tier 2 Function Context:', { storyId, sessionId, pageNumber, totalPages });
      
      // Throw error to enable proper tier cascading (Tier 2 → Tier 2.5)
      throw new Error(`Tier 2 processing failed: ${error.message}`);
    }
  }

  

  
  // ============= UNIFIED NEGATIVE PROMPT SYSTEM (SINGLE SOURCE OF TRUTH) =============
  static buildUnifiedNegativePrompt(userInfo, culturalProfile, styleFramework, pageNumber, avatarIdentity) {
    const negatives = [];
    
    // PHASE 3.1: FIRST - New Pixar negative for Levels 0-1 (Beginner/Easy)
    const difficulty = DifficultyLevelMapper.mapToImageDifficulty(userInfo);
    if (difficulty === 'beginner' || difficulty === 'easy') {
      negatives.push('toy, figurine, doll, plastic, simple background, flat lighting');
    }
    
    // PHASE 3.1: SECOND - African American cultural sensitivity (priority protection)
    if (avatarIdentity?.skinTone === 'dark' && (avatarIdentity?.type === 'boy' || avatarIdentity?.type === 'girl')) {
      negatives.push('lightened skin, whitewashed, caucasian features, stereotypical, blurry, low quality, distorted, altered ethnicity, artificial skin lightening, noise, oversaturated');
    }
    
    // THEN: All existing negatives in current order
    
    // 1. Page-specific negatives (consolidation #1)
    if (pageNumber === 1 && userInfo?.name) {
      negatives.push(`${userInfo.name} text, name in large letters`);
    }
    
    // 2. Text prevention (consolidation #2 - exact specification)
    negatives.push('NO text, letters, words, writing, typography, captions, labels');
    
    // 3. Body completeness (consolidation #3)
    negatives.push('floating head, portrait only, incomplete body, missing torso');
    
    // 4. Quality control (unchanged #4)
    negatives.push('ugly, deformed, bad anatomy, extra limb, mutation, poorly drawn, cropped, lowres, worst quality, low quality, blurry, pixelated, noise, artifacts');
    
    // 5. Content safety (unchanged #5)
    negatives.push('adult, mature, violence, scary, dark, inappropriate, nsfw, suggestive, weapons, blood, gore, frightening');
    
    // 6. Style prevention (unchanged #6)
    negatives.push('photorealistic, realistic, photograph, anime, manga, comic book style, sketch, rough drawing');
    
    // 7. Gender consistency enforcement (enhanced with child/prefer-not-to-answer handling)
    if (avatarIdentity?.type === 'girl') {
      negatives.push('boy character, male character, masculine features');
    } else if (avatarIdentity?.type === 'boy') {
      negatives.push('girl character, female character, feminine features, dress, skirt');
    } else if (avatarIdentity?.type === 'child' || avatarIdentity?.type === 'prefer-not-to-answer') {
      negatives.push('masculine features, feminine features, boy characteristics, girl characteristics, gender-specific clothing, dress, skirt, masculine clothing, gendered accessories, gendered hairstyles');
      console.log('🎯 GENDER NEUTRAL NEGATIVES - Applied comprehensive gender-neutral negative prompts for child/prefer-not-to-answer');
    }
    
    // 8. Style framework compatibility (unchanged #8)
    if (styleFramework?.negativesToAvoid) {
      negatives.push(styleFramework.negativesToAvoid.join(', '));
    }
    
    return negatives.join(', ');
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

  // NEW: AI-Enhanced Scene Context Method (with session ID support for fallback enhancement)
  static extractAIEnhancedSceneContext(storyText, enhancedStoryData, pageNumber, totalPages, userInfo, sessionId) {
    console.log('🧠 Using AI-enhanced scene context extraction');
    
    if (enhancedStoryData) {
      // Build rich context from AI analysis - characters is now an object
      let characters = '';
      if (enhancedStoryData.characters) {
        const char = enhancedStoryData.characters;
        const characterParts = [];
        if (char.characterAppearance) characterParts.push(char.characterAppearance);
        if (char.characterPosition) characterParts.push(char.characterPosition);
        if (char.characterMood) characterParts.push(`feeling ${char.characterMood}`);
        if (char.secondaryCharacters) characterParts.push(`with ${char.secondaryCharacters}`);
        characters = characterParts.join(', ');
      }
      
      // Enhanced setting detection with validation
      let setting = '';
      if (enhancedStoryData.visualComponents?.setting) {
        const location = enhancedStoryData.visualComponents.setting || 'indoor scene';
        // Extract lighting info for time context
        const lighting = enhancedStoryData.visualComponents.lighting || 'natural lighting';
        // Use sceneType for weather context
        const sceneType = enhancedStoryData.visualComponents.sceneType || 'mixed';
        
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
        
        setting = `${validatedLocation} with ${lighting}`;
      }
      
      const objects = enhancedStoryData.visualComponents?.keyObjects ? 
        `, featuring ${enhancedStoryData.visualComponents.keyObjects}` : '';
      
      const mood = enhancedStoryData.characters?.characterMood ? 
        `, ${enhancedStoryData.characters.characterMood} mood` : '';
      
      const lighting = enhancedStoryData.visualComponents?.lighting ? 
        `, ${enhancedStoryData.visualComponents.lighting}` : '';
      
      const action = enhancedStoryData.visualComponents?.action ? 
        `, ${enhancedStoryData.visualComponents.action}` : '';
      
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
      
      // PHASE 3 FIX: Enhance fallback logic to include secondary elements in intelligent context
      let secondaryElementsContext = '';
      try {
        const sessionId = arguments[5]; // sessionId is the 6th parameter (index 5)
        if (sessionId) {
          const secondaryCharacterData = globalThis.StoryVisualStateManager?.getSecondaryCharacters?.(sessionId);
          const characterAnimals = globalThis.StoryVisualStateManager?.getCharacterAnimals?.(sessionId);
          
          const secondaryElements = [];
          if (secondaryCharacterData?.length > 0) {
            secondaryElements.push(...secondaryCharacterData.map(char => 
              `${char.name} the ${char.type}${char.relationshipType ? ` (${char.relationshipType})` : ''}`
            ));
          }
          if (characterAnimals?.length > 0) {
            secondaryElements.push(...characterAnimals.map(animal => 
              `${animal.name} the ${animal.species}${animal.hasDialogue ? ' (speaking)' : ''}`
            ));
          }
          
          if (secondaryElements.length > 0) {
            secondaryElementsContext = `, with ${secondaryElements.join(', ')}`;
          }
        }
      } catch (error) {
        console.log('⚠️ Failed to add secondary elements to fallback context:', error.message);
      }

      const intelligentContext = `character in ${detectedLocation} scene, ${keyContent}${secondaryElementsContext}` + 
                                (hasAction ? ' [action scene]' : ' [static scene]');
      
      console.log('✅ Built enhanced intelligent fallback context with secondary elements:', {
        sentences: sentences.length,
        detectedLocation,
        hasAction,
        hasSecondaryElements: !!secondaryElementsContext,
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
      this.sessionManager.updateSetting(sessionId, detectedSetting);
      console.log('🌍 Updated story setting:', detectedSetting);
    }
  }

  // ============= SECONDARY CHARACTER PROMPT BUILDING =============
  static buildSecondaryCharacterPrompt(secondaryCharacterData, characterAnimals) {
    const elements = [];
    
    // Process secondary characters
    if (secondaryCharacterData && secondaryCharacterData.length > 0) {
      const characters = secondaryCharacterData.map(char => {
        const relation = char.relationshipType ? ` (${char.relationshipType})` : '';
        return `${char.name} the ${char.type}${relation}`;
      });
      elements.push(`Secondary characters: ${characters.join(', ')}`);
    }
    
    // Process character animals
    if (characterAnimals && characterAnimals.length > 0) {
      const animals = characterAnimals.map(animal => {
        const dialogue = animal.hasDialogue ? ' (speaking)' : '';
        return `${animal.name} the ${animal.species}${dialogue}`;
      });
      elements.push(`Character animals: ${animals.join(', ')}`);
    }
    
    return elements.length > 0 ? elements.join(', ') : '';
  }

  // ============= PHASE 2: MEMORY & PERFORMANCE OPTIMIZATION =============
  static performMemoryCleanup(sessionId, pageNumber) {
    try {
      // 1. Clear expired regex cache (if any large cached patterns exist)
      this.clearRegexCache();
      
      // 2. Cleanup visual state manager memory for completed sessions
      if (globalThis.StoryVisualStateManager) {
        // Only clean up if we're past page 1 to avoid clearing active sessions
        if (pageNumber > 1) {
          console.log(`🧹 Performing memory cleanup for session ${sessionId}, page ${pageNumber}`);
          
          // Clear old secondary character cache (keep only current page)
          globalThis.StoryVisualStateManager.clearOldPageData?.(sessionId, pageNumber - 2);
        }
      }
      
      // 3. Clear temporary prompt building artifacts
      this.clearTempPromptData();
      
      console.log(`✅ Memory cleanup completed for session ${sessionId}`);
    } catch (error) {
      console.warn(`⚠️ Memory cleanup failed for session ${sessionId}:`, error.message);
      // Don't throw - memory cleanup failure shouldn't break image generation
    }
  }
  
  static clearRegexCache() {
    // Clear any cached regex patterns in SecondaryElementDetector
    if (globalThis.regexCache) {
      const cacheSize = Object.keys(globalThis.regexCache).length;
      if (cacheSize > 50) { // Clear if cache gets too large
        globalThis.regexCache = {};
        console.log(`🧹 Cleared regex cache (${cacheSize} entries)`);
      }
    }
  }
  
  static clearTempPromptData() {
    // Clear any temporary prompt building data structures
    if (globalThis.tempPromptCache) {
      globalThis.tempPromptCache = {};
    }
  }
  
  // ============= TIMEOUT PROTECTION FOR LONG OPERATIONS =============
  static async withTimeout(operation, timeoutMs = 10000, operationName = 'operation') {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`${operationName} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
      
      operation()
        .then(result => {
          clearTimeout(timeout);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeout);
          reject(error);
        });
    });
  }

  // ============= AVATAR CONSISTENCY VALIDATION =============
  static validateAvatarConsistency(prompt, avatarIdentity, userInfo, tier) {
    console.log('🔍 Avatar Validation: Starting comprehensive validation', { tier, avatarIdentity, userInfo: userInfo?.name });
    
    if (!prompt) {
      console.warn('⚠️ Avatar Validation: No prompt provided');
      return { isValid: false, reason: 'missing_prompt' };
    }
    
    // 1. Expanded Generic Pattern Detection
    const genericPatterns = [
      /\ba\s+(boy|girl|child|kid)\b/gi,
      /\b(young|small|little)\s+(boy|girl|child|kid)\b/gi,
      /\b(the|a)\s+(character|person|figure)\b/gi,
      /\b(main|primary)\s+(character|child)\b/gi,
      /\bgeneric\s+(description|character|child)\b/gi,
      /\bplaceholder\s+(character|name|child)\b/gi,
      /\bunnamed\s+(character|child|kid)\b/gi,
      /\b(simple|basic)\s+(character|description)\b/gi
    ];
    
    let hasGenericContent = false;
    const foundGenericPatterns = [];
    
    for (const pattern of genericPatterns) {
      const matches = prompt.match(pattern);
      if (matches) {
        hasGenericContent = true;
        foundGenericPatterns.push(...matches);
      }
    }
    
    // 2. Avatar Identity Mapping Validation
    let avatarMappingIssues = [];
    
    if (avatarIdentity) {
      // Check if visualDescription maps properly to type and skinTone
      if (avatarIdentity.visualDescription && (!avatarIdentity.type || !avatarIdentity.skinTone)) {
        console.warn('⚠️ Avatar Validation: visualDescription exists but type/skinTone missing');
        avatarMappingIssues.push('incomplete_avatar_mapping');
        
        // Attempt to extract from visualDescription
        const desc = avatarIdentity.visualDescription.toLowerCase();
        if (!avatarIdentity.type) {
          if (desc.includes('girl')) avatarIdentity.type = 'girl';
          else if (desc.includes('boy')) avatarIdentity.type = 'boy';
        }
        
        if (!avatarIdentity.skinTone) {
          if (desc.includes('dark') || desc.includes('black') || desc.includes('african')) {
            avatarIdentity.skinTone = 'dark';
          } else if (desc.includes('light') || desc.includes('white') || desc.includes('pale')) {
            avatarIdentity.skinTone = 'light';
          } else if (desc.includes('medium') || desc.includes('brown') || desc.includes('tan')) {
            avatarIdentity.skinTone = 'medium';
          }
        }
      }
      
      // Validate character name presence in prompt
      const characterName = userInfo?.name || avatarIdentity?.name;
      if (characterName && !prompt.toLowerCase().includes(characterName.toLowerCase())) {
        avatarMappingIssues.push('missing_character_name');
      }
      
      // Validate gender consistency
      if (avatarIdentity.type && avatarIdentity.type !== 'prefer-not-to-answer') {
        const genderPattern = avatarIdentity.type === 'girl' ? /\b(boy|male|he|him|his)\b/gi : /\b(girl|female|she|her|hers)\b/gi;
        if (genderPattern.test(prompt)) {
          avatarMappingIssues.push('gender_inconsistency');
        }
      }
    } else {
      avatarMappingIssues.push('missing_avatar_identity');
    }
    
    // 3. Prompt Content Analysis for Missing/Generic Descriptions
    const hasSpecificCharacterDetails = [
      /with\s+(dark|light|medium|brown|blonde|black|red)\s+(hair|skin)/gi,
      /wearing\s+(a|the|colorful|bright)/gi,
      /(smiling|happy|excited|curious|thoughtful)/gi,
      /\d+\s+year[s]?\s+old/gi,
      /(ethnic|cultural|traditional|diverse)/gi
    ].some(pattern => pattern.test(prompt));
    
    const lackingSpecifics = !hasSpecificCharacterDetails;
    
    // 4. Calculate Overall Validation Score
    let validationScore = 100;
    let issues = [];
    
    if (hasGenericContent) {
      validationScore -= 40;
      issues.push(`generic_patterns_found: ${foundGenericPatterns.join(', ')}`);
    }
    
    if (avatarMappingIssues.length > 0) {
      validationScore -= 30;
      issues.push(`avatar_mapping_issues: ${avatarMappingIssues.join(', ')}`);
    }
    
    if (lackingSpecifics) {
      validationScore -= 20;
      issues.push('lacking_specific_character_details');
    }
    
    const isValid = validationScore >= 70; // Require 70% score to pass
    
    console.log('🔍 Avatar Validation Result:', {
      tier,
      isValid,
      validationScore,
      issues,
      foundGenericPatterns,
      avatarMappingIssues,
      lackingSpecifics
    });
    
    return {
      isValid,
      validationScore,
      issues,
      reason: issues.length > 0 ? issues.join(', ') : null,
      foundGenericPatterns,
      avatarMappingIssues,
      fixedAvatarIdentity: avatarIdentity // Return the potentially fixed avatar identity
    };
  }
  
  // Helper method to generate enhanced avatar-specific prompt when validation fails
  static generateEnhancedAvatarPrompt(storyText, avatarIdentity, userInfo, styleFramework) {
    console.log('🔧 Avatar Validation: Generating enhanced avatar-specific prompt');
    
    const characterName = userInfo?.name || 'the child';
    let characterDescription = characterName;
    
    if (avatarIdentity) {
      if (avatarIdentity.type && avatarIdentity.type !== 'prefer-not-to-answer') {
        characterDescription = `${characterName}, a ${avatarIdentity.type}`;
      }
      
      if (avatarIdentity.skinTone) {
        const skinToneDesc = avatarIdentity.skinTone === 'dark' ? 'with beautiful dark skin' : 
                           avatarIdentity.skinTone === 'medium' ? 'with warm medium-toned skin' :
                           avatarIdentity.skinTone === 'light' ? 'with light skin' : '';
        if (skinToneDesc) characterDescription += ` ${skinToneDesc}`;
      }
      
      if (avatarIdentity.visualDescription) {
        // Extract additional details from visual description
        const desc = avatarIdentity.visualDescription.toLowerCase();
        if (desc.includes('hair')) {
          const hairMatch = desc.match(/(blonde|brown|black|red|curly|straight|wavy)\s+hair/gi);
          if (hairMatch) characterDescription += `, with ${hairMatch[0]}`;
        }
      }
    }
    
    const enhancedPrompt = `${storyText} featuring ${characterDescription}, ${styleFramework.prompt}, ${styleFramework.brandSuffix}`;
    
    console.log('🔧 Avatar Validation: Enhanced prompt generated:', enhancedPrompt);
    return enhancedPrompt;
  }

}
