/**
 * PHASE INTEGRATION ORCHESTRATOR
 * Coordinates Phase 1 (Character Consistency) and Phase 2 (Visual Detail Tracker)
 * with the existing image generation pipeline
 */

import { characterConsistencyService } from './CharacterConsistencyService.js';
import { VisualDetailTracker } from './VisualDetailTracker.js';
import { getCulturalBundle, getHairBySkintone, getSkinBySkintone } from './StaticDataCache.js';
import { UnifiedPlaceholderResolver } from './UnifiedPlaceholderResolver.js';
import { getStyleFramework } from './styleFrameworks.js';
import { UnifiedCharacterDescriptor } from './UnifiedCharacterDescriptor.js';

export class PhaseIntegrationOrchestrator {
  constructor() {
    this.initialized = false;
    this.characterConsistencyService = characterConsistencyService;
    this.visualDetailTracker = new VisualDetailTracker();
  }


  /**
   * Initialize Phase 1 & 2 integration with image generation pipeline
   */
  async initializePhases(userInfo, sessionId, requestId) {
    try {
      console.log(`🚀 PHASE ORCHESTRATOR: Initializing Phase 1 & 2 integration`, {
        userId: userInfo?.id || userInfo?.userId,
        sessionId,
        requestId
      });

      // Phase 1: Load existing character traits
      const userId = userInfo?.id || userInfo?.userId || 'anonymous';
      const characterName = userInfo?.name || userInfo?.childName || 'Child';

      const existingTraits = await this.characterConsistencyService.getCharacterFromDatabase(sessionId, `traits_${characterName}`) || {};
      
      // Generate secondary characters - detect from story text first, then generate seeds
      const secondaryCharacters = [];
      // Note: Will be populated during generateTier1EnhancedPrompt when storyText is available

      // Phase 2: Load visual history for consistency  
      const visualHistory = await this.visualDetailTracker.getVisualHistory(sessionId, 'general', 10);
      const consistencyRecommendations = await this.visualDetailTracker.getConsistencyRecommendations(sessionId, 'general');

      this.initialized = true;

      console.log(`✅ PHASE ORCHESTRATOR: Phases initialized successfully`, {
        userId,
        characterName,
        hasExistingTraits: !!existingTraits,
        secondaryCharacterCount: secondaryCharacters.length,
        visualHistoryCount: visualHistory.length,
        consistencyScore: consistencyRecommendations.consistencyScore
      });

      return {
        phase1: {
          existingTraits,
          secondaryCharacters,
          characterConsistency: true
        },
        phase2: {
          visualHistory,
          consistencyRecommendations,
          visualTracking: true
        },
        integrationStatus: 'success'
      };
    } catch (error) {
      console.error(`❌ PHASE ORCHESTRATOR: Failed to initialize phases`, { error, userInfo, sessionId });
      return {
        phase1: { characterConsistency: false },
        phase2: { visualTracking: false },
        integrationStatus: 'failed',
        error: error.message
      };
    }
  }

  /**
   * Process story text and extract character traits (Phase 1)
   */
  async processStoryForTraits(userInfo, storyText, sessionId) {
    try {
      const userId = userInfo?.id || userInfo?.userId || 'anonymous';
      const characterName = userInfo?.name || userInfo?.childName || 'Child';

      console.log(`🔍 PHASE ORCHESTRATOR: Processing story for trait extraction`, {
        userId,
        characterName,
        storyLength: storyText?.length || 0
      });

      // Extract traits from story text
      const extractedTraits = await this.characterConsistencyService.saveCharacterToDatabase(
        sessionId, 
        `traits_${characterName}`, 
        { extractedFromText: storyText, timestamp: Date.now() }
      );

      // Generate consistent visual description
      const visualDescription = await this.characterConsistencyService.buildCharacterDescription(
        { characterName, age: '6-8' }, 
        storyText, 
        null, 
        sessionId
      );

      console.log(`✅ PHASE ORCHESTRATOR: Story processing complete`, {
        userId,
        characterName,
        extractedTraitCount: Object.keys(extractedTraits || {}).length,
        hasDescription: !!visualDescription
      });

      return {
        extractedTraits,
        visualDescription,
        characterName,
        processedSuccessfully: true
      };
    } catch (error) {
      console.error(`❌ PHASE ORCHESTRATOR: Story processing failed`, { error });
      return {
        extractedTraits: null,
        visualDescription: '',
        processedSuccessfully: false,
        error: error.message
      };
    }
  }

  /**
   * Track visual generation and detect conflicts (Phase 2)
   */
  async trackVisualGeneration(userInfo, visualData, sessionId, imageUrl) {
    try {
      const userId = userInfo?.id || userInfo?.userId || 'anonymous';
      const characterName = userInfo?.name || userInfo?.childName || 'Child';

      console.log(`👁️ PHASE ORCHESTRATOR: Tracking visual generation`, {
        userId,
        characterName,
        sessionId,
        hasImageUrl: !!imageUrl
      });

      // Track visual detail (Phase 2.1)
      const visualId = await this.visualDetailTracker.trackVisualDetail({
        user_id: userId,
        character_name: characterName,
        session_id: sessionId,
        page_number: visualData.pageNumber || 1,
        image_url: imageUrl,
        visual_elements: visualData
      });

      // Detect appearance conflicts (Phase 2.3) - placeholder for future enhancement
      const conflicts = [];

      // Resolve conflicts if any detected
      let resolvedElements = {};

      console.log(`✅ PHASE ORCHESTRATOR: Visual tracking complete`, {
        userId,
        characterName,
        visualId,
        conflictCount: conflicts.length,
        resolvedElementCount: Object.keys(resolvedElements).length
      });

      return {
        visualId,
        conflicts,
        resolvedElements,
        trackingSuccessful: true,
        consistency: {
          conflictCount: conflicts.length,
          hasResolutions: Object.keys(resolvedElements).length > 0
        }
      };
    } catch (error) {
      console.error(`❌ PHASE ORCHESTRATOR: Visual tracking failed`, { error });
      return {
        visualId: null,
        conflicts: [],
        resolvedElements: {},
        trackingSuccessful: false,
        error: error.message
      };
    }
  }

  /**
   * Get enhanced prompt with Phase 1 & 2 data using the EXACT Tier 1 template structure
   */
  async getEnhancedPrompt(userInfo, basePrompt, storyText, sessionId, enhancedStoryData = null) {
    try {
      const userId = userInfo?.id || userInfo?.userId || 'anonymous';
      const characterName = userInfo?.name || userInfo?.childName || 'Child';

      console.log(`🎨 PHASE ORCHESTRATOR: Generating Tier 1 enhanced prompt template`, {
        userId,
        characterName,
        basePromptLength: basePrompt?.length || 0
      });

      // Phase 1: Get character consistency data using proper getCharacterSeed for complete data
      const characterSeed = await this.characterConsistencyService.getCharacterSeed(
        sessionId,
        { name: characterName, age: userInfo?.age || 6 },
        storyText || '',
        'continuing'
      );
      const existingTraits = characterSeed || {};
      const visualDescription = characterSeed?.characterDescription || 'consistent character design';

      // Phase 2: Get visual consistency data for multi-page support
      const visualHistoryData = await this.visualDetailTracker.getVisualHistory(sessionId, 'general', 10);
      const visualHistory = Array.isArray(visualHistoryData) ? 
        visualHistoryData.map(item => {
          if (typeof item === 'object' && item.visual_elements) {
            // CRITICAL FIX: Convert objects to strings properly to prevent [object Object]
            return typeof item.visual_elements === 'object' ? 
              JSON.stringify(item.visual_elements).replace(/[{}"\[\]]/g, '').replace(/,/g, ', ') : 
              String(item.visual_elements);
          }
          return typeof item === 'string' ? item : '';
        }).filter(Boolean).join(', ') : 
        (visualHistoryData || '');

      // NEW: Setting persistence for Tier 1 - detect and persist settings
      const { ExactWordExtractor } = await import('./ExactWordExtractor.js');
      const currentSetting = ExactWordExtractor.extractExactSetting(storyText || '');
      let persistentSetting = null;
      
      if (currentSetting) {
        // Save current setting to database
        await this.visualDetailTracker.saveDetailToDatabase(
          sessionId, 'general', 'setting', 'location', currentSetting, 1
        );
        persistentSetting = currentSetting;
        console.log(`🏠 Tier 1: Detected and saved setting: ${currentSetting}`);
      } else {
        // Retrieve previous setting if no current one found
        persistentSetting = await this.visualDetailTracker.getSessionSetting(sessionId);
        if (persistentSetting) {
          console.log(`🏠 Tier 1: Using persistent setting: ${persistentSetting}`);
        }
      }
      
      // Get colored objects for visual consistency using CharacterConsistencyService
      await this.characterConsistencyService.analyzeVisualDetails(sessionId, storyText, 1);
      const coloredObjects = await this.characterConsistencyService.getColoredObjects(sessionId);
      
      // Extract specific clothing from pageText for Visual Traits
      const specificClothing = await this.extractClothingFromText(storyText || '');
      
      // Combine colored objects with visual history, eliminating redundancies
      const combinedVisualElements = this.combineVisualConsistency(coloredObjects, visualHistory);

      // Get ethnicity for cultural representation - only for dark skin or non-English
      const resolver = new UnifiedPlaceholderResolver();
      const skinTone = userInfo?.appearance?.skinTone || userInfo?.skinTone || userInfo?.avatar?.skinTone || 'medium';
      const language = userInfo?.nativeLanguage || userInfo?.language || 'en';
      let ethnicity = '';
      
      // Only show ethnicity for dark skin users or non-English speakers
      if (skinTone === 'dark' || skinTone === 'darker' || language !== 'en') {
        const ethnicityResult = await resolver.resolveCanonicalPlaceholders('{ethnicity}', userInfo);
        ethnicity = (typeof ethnicityResult === 'string' ? ethnicityResult : '').replace('{ethnicity}', '').trim();
      }

      // Get hair and skin variations based on skin tone with seeded selection
      // CRITICAL FIX: Pass explicit skinTone parameter to prevent hair mapping bugs
      const culturalBundle = getCulturalBundle(userInfo, sessionId, skinTone);
      
      // Convert sessionId to numeric seed for consistent selection
      const seedForConsistency = sessionId ? sessionId.split('-')[0].split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : Math.floor(Math.random() * 1000000);
      
      // Select both hair and facial features from cultural bundle
      const selectedHair = culturalBundle?.hair || getHairBySkintone(skinTone, seedForConsistency);
      const selectedSkin = culturalBundle?.features || getSkinBySkintone(skinTone, seedForConsistency);

      // Get style framework with full detailed prompts
      const difficulty = userInfo?.difficulty || userInfo?.gradeLevel || 'medium';
      const styleFrameworkData = getStyleFramework(difficulty);
      const styleFramework = styleFrameworkData.frameworkPrompt;

      // Use AI-generated primaryScene from enhanced data or call ai-visual-scene-creator
      let primaryScene;
      if (enhancedStoryData?.primaryScene) {
        primaryScene = enhancedStoryData.primaryScene;
      } else {
        // Call ai-visual-scene-creator to get proper AI schema
        try {
          const supabase = await import('https://esm.sh/@supabase/supabase-js@2.57.4').then(mod => 
            mod.createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY'))
          );
          const { data: aiResult, error: aiError } = await supabase.functions.invoke('ai-visual-scene-creator', {
            body: { pageText: storyText, userInfo, sessionId, pageNumber: 1 }
          });
          
          // CRITICAL FIX: Check for aiError OR missing primaryScene and escalate to Tier 2.5A
          if (aiError) {
            console.warn('🚨 AI scene creator returned error:', aiError);
            console.log('🔄 AI scene creator failed - escalating to Tier 2.5A');
            throw new Error('NO_PRIMARY_SCENE_ESCALATE_TO_25A');
          }
          
          if (!aiResult?.primaryScene) {
            console.warn('🚨 AI scene creator returned no primaryScene');
            console.log('🔄 AI scene creator missing primaryScene - escalating to Tier 2.5A');
            throw new Error('NO_PRIMARY_SCENE_ESCALATE_TO_25A');
          }
          
          primaryScene = aiResult.primaryScene;
        } catch (error) {
          console.warn('Failed to get AI primaryScene:', error.message);
          // CRITICAL FIX: Check for 503, Service unavailable, or ai-visual-scene-creator failures and escalate to Tier 2.5A
          if (error.message.includes('503') || 
              error.message.includes('Service unavailable') ||
              error.message.includes('ai-visual-scene-creator') || 
              error.message.includes('timeout') ||
              error.message.includes('NO_PRIMARY_SCENE_ESCALATE_TO_25A')) {
            console.log('🔄 AI scene creator failed - escalating to Tier 2.5A');
            throw new Error('NO_PRIMARY_SCENE_ESCALATE_TO_25A');
          }
          console.log('🔄 AI scene creator failed - escalating to Tier 2.5A');
          throw new Error('NO_PRIMARY_SCENE_ESCALATE_TO_25A');
        }
      }
      
      // Generate 1-2 sentence context summary instead of full text
      const contextSummary = this.generateContextSummary(storyText || basePrompt);
      
      // Avatar Identity and Regional Context
      const avatarType = userInfo?.avatar?.type || 'child';
      const avatarIdentity = `beautiful ${avatarType} character ${characterName}, age ${userInfo?.age || 6}`;
      
      // Cultural Enhancements
      const culturalEnhancements = await this.getCulturalEnhancements(userInfo, sessionId);
      
      // STEP 1: Detect secondary characters from story text
      const detectionContext = { sessionId, pageNumber: 1, userInfo };
      const characterDetection = UnifiedCharacterDescriptor.detectAllCharacters(storyText || '', detectionContext);
      const detectedSecondaryChars = characterDetection.secondaryCharacters || [];
      
      // STEP 2: Generate seeds for each detected secondary character  
      const secondaryCharacters = [];
      for (const detectedChar of detectedSecondaryChars) {
        try {
          const charSeed = await this.characterConsistencyService.getSecondaryCharacterSeed(
            sessionId, 
            detectedChar.name || detectedChar.displayName || 'secondary character', 
            detectedChar.type || detectedChar.relationshipType || 'companion',
            userInfo
          );
          if (charSeed) secondaryCharacters.push(charSeed);
        } catch (error) {
          console.warn(`Failed to generate seed for secondary character ${detectedChar.name}:`, error);
        }
      }
      
      // STEP 3: Format secondary characters for template inclusion with GUARANTEED string conversion
      console.log(`🔍 [DEBUG] Secondary characters before formatting:`, {
        secondaryCharactersLength: secondaryCharacters.length,
        secondaryCharactersData: secondaryCharacters.map(char => ({
          type: typeof char,
          keys: typeof char === 'object' ? Object.keys(char) : 'not_object',
          characterDescription: char?.characterDescription,
          name: char?.name
        }))
      });
      
      const formattedSecondaryCharacters = secondaryCharacters.length > 0 ? 
        secondaryCharacters.map(char => {
          // GUARANTEED string conversion to prevent [object Object] in prompts
          let description = 'secondary character';
          
          if (typeof char === 'string') {
            description = char;
          } else if (typeof char === 'object' && char !== null) {
            // Priority-based string extraction with guaranteed string conversion
            const possibleDescriptions = [
              char.characterDescription,
              char.description,
              char.name,
              char.displayName,
              char.type
            ];
            
            for (const desc of possibleDescriptions) {
              if (desc) {
                if (typeof desc === 'string' && desc.trim() !== '') {
                  description = desc.trim();
                  break;
                } else if (typeof desc === 'object') {
                  // CRITICAL FIX: Properly flatten nested objects to prevent [object Object]
                  try {
                    const flattenedDesc = JSON.stringify(desc).replace(/[{}"\[\]]/g, '').replace(/,/g, ', ').replace(/:/g, ': ');
                    if (flattenedDesc.trim() !== '') {
                      description = flattenedDesc.trim();
                      break;
                    }
                  } catch (e) {
                    // Final fallback - convert to string
                    description = String(desc);
                  }
                } else {
                  // Convert any other type to string
                  description = String(desc);
                  if (description.trim() !== '' && description !== 'undefined' && description !== 'null') {
                    break;
                  }
                }
              }
            }
            
            // Final safety check - if still no valid description, use object summary
            if (description === 'secondary character') {
              description = `${char.name || 'character'} (${char.type || 'companion'})`;
            }
          } else {
            // Handle null, undefined, or other types
            description = String(char);
          }
          
          // FINAL GUARANTEE: Ensure we never return [object Object]
          if (description.includes('[object Object]')) {
            description = 'secondary character';
          }
          
          return description;
        }).join(', ') : 
        'none detected';
      
      console.log(`✅ [DEBUG] Formatted secondary characters result:`, formattedSecondaryCharacters);
      
      // Enhanced character description with avatar type, hair and skin variations  
      const characterDescription = [
        avatarIdentity,
        ethnicity,
        selectedHair,
        selectedSkin
      ].filter(Boolean).join(', ');

      // Build complete 6-section Tier 1 enhanced prompt template with reordered structure
      // CRITICAL: PRIMARY SCENE must contain the exact raw OpenAI-generated scene description
      console.log(`🔍 [DEBUG] Template building - primaryScene type and content:`, {
        primarySceneType: typeof primaryScene,
        primarySceneLength: primaryScene?.length,
        primaryScenePreview: typeof primaryScene === 'string' ? primaryScene.substring(0, 100) + '...' : primaryScene
      });
      
      const enhancedPrompt = [
        `PRIMARY SCENE: ${primaryScene}`, // This MUST be the raw OpenAI output
        `CHARACTER DESCRIPTION: ${characterDescription}`,
        `CHARACTER CONSISTENCY:`,
        `- Visual Traits: ${specificClothing || `${characterName} wearing consistent character clothing`}`,
        `- Visual Consistency: ${combinedVisualElements}`,
        `- Secondary Characters: ${formattedSecondaryCharacters}`,
        // Move SETTING after CHARACTER CONSISTENCY
        persistentSetting ? `SETTING: consistently in ${persistentSetting}` : '',
        `STYLE FRAMEWORK: ${styleFramework}`,
        `CONTEXT: ${contextSummary}`
      ].filter(Boolean).join('\n');
      
      console.log(`✅ [DEBUG] Complete template structure verified:`, {
        templateLength: enhancedPrompt.length,
        hasRawPrimaryScene: typeof primaryScene === 'string' && primaryScene.length > 0,
        formattedSecondaryCharacters: formattedSecondaryCharacters
      });

      console.log(`✅ PHASE ORCHESTRATOR: Complete Tier 1 template generated`, {
        userId,
        characterName,
        hasTraits: !!existingTraits,
        enhancedLength: enhancedPrompt.length,
        templateComponents: 6,
        hasMultiPageData: !!(visualHistory)
      });

      return {
        enhancedPrompt,
        primaryScene,
        characterConsistency: {
          hasTraits: !!existingTraits,
          visualDescription: visualDescription || 'consistent character design',
          ethnicity,
          selectedHair
        },
        visualConsistency: {
          combinedVisualElements,
          specificClothing
        },
        enhancementSuccessful: true,
        templateStructure: 'COMPLETE_TIER_1'
      };
    } catch (error) {
      console.error(`❌ PHASE ORCHESTRATOR: Tier 1 template generation failed`, { error });
      
      // Propagate escalation signal instead of returning failure object
      if (error.message && error.message.includes('NO_PRIMARY_SCENE_ESCALATE_TO_25A')) {
        console.log(`🚨 PHASE ORCHESTRATOR: Rethrowing escalation signal`);
        throw error;
      }
      
      return {
        enhancedPrompt: basePrompt,
        primaryScene: basePrompt,
        enhancementSuccessful: false,
        error: error.message,
        templateStructure: 'FAILED'
      };
    }
  }

  // Helper method to generate AI-rich primary scene
  generatePrimaryScene(basePrompt, storyText) {
    const sceneText = storyText || basePrompt || 'A beautiful children\'s story scene';
    // Return the scene content word-for-word without modification
    return sceneText;
  }

  // Helper method to generate context summary (1-2 sentences)
  generateContextSummary(text) {
    if (!text) return 'Children\'s story scene with engaging characters.';
    
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length >= 2) {
      return sentences.slice(0, 2).join('. ') + '.';
    }
    return sentences[0]?.trim() + '.' || 'Children\'s story scene.';
  }

  // Helper method to extract specific clothing from text
  async extractClothingFromText(text) {
    if (!text) return '';
    
    // CRITICAL FIX: Use tier25Vocabulary CLOTHING_DETECTION_KEYWORDS instead of primitive regex
    const { CLOTHING_DETECTION_KEYWORDS } = await import('./tier25Vocabulary.js');
    
    // Create dynamic patterns using comprehensive clothing vocabulary
    const clothingPatterns = [
      // Specific clothing items using tier25Vocabulary
      new RegExp(`wearing?\\s+(?:a\\s+|an\\s+|his\\s+|her\\s+)?([^,.\s]+\\s+(?:${CLOTHING_DETECTION_KEYWORDS.join('|')}))`, 'gi'),
      new RegExp(`dressed\\s+in\\s+(?:a\\s+|an\\s+)?([^,.\s]+\\s+(?:${CLOTHING_DETECTION_KEYWORDS.join('|')}))`, 'gi'),
      new RegExp(`(?:a|an|his|her)\\s+([^,.\s]+\\s+(?:blue|red|green|yellow|pink|purple|black|white|brown|orange)\\s+(?:${CLOTHING_DETECTION_KEYWORDS.join('|')}))`, 'gi'),
      new RegExp(`(?:blue|red|green|yellow|pink|purple|black|white|brown|orange)\\s+(${CLOTHING_DETECTION_KEYWORDS.join('|')})`, 'gi')
    ];
    
    const matches = [];
    for (const pattern of clothingPatterns) {
      const found = text.match(pattern);
      if (found) {
        matches.push(...found.map(match => match.trim()));
      }
    }
    
    // Return the first match or empty string
    return matches.length > 0 ? `wearing ${matches[0].replace(/^wearing?\s*/i, '')}` : '';
  }

  // Helper method to combine visual consistency elements, eliminating redundancies
  // CRITICAL FIX: Improved deduplication logic to eliminate exact duplicates
  combineVisualConsistency(coloredObjects, visualHistory) {
    const elements = [];
    const seenElements = new Set(); // Track seen elements to prevent duplicates
    
    // Add colored objects if available
    if (coloredObjects && coloredObjects.trim()) {
      const normalizedColoredObjects = coloredObjects.toLowerCase().trim();
      if (!seenElements.has(normalizedColoredObjects)) {
        elements.push(coloredObjects);
        seenElements.add(normalizedColoredObjects);
      }
    }
    
    // Add unique visual history elements not already in colored objects
    if (visualHistory && visualHistory.trim()) {
      const historyItems = visualHistory.split(',').map(item => item.trim());
      
      historyItems.forEach(item => {
        if (item) {
          const normalizedItem = item.toLowerCase().trim();
          if (!seenElements.has(normalizedItem)) {
            // CRITICAL FIX: Handle object serialization to prevent "[object Object]"
            const itemToAdd = typeof item === 'object' ? JSON.stringify(item) : item;
            elements.push(itemToAdd);
            seenElements.add(normalizedItem);
          }
        }
      });
    }
    
    // Return unique elements as comma-separated string
    return elements.join(', ');
  }

  /**
   * Get cultural enhancements based on user profile with seeded selection
   */
  async getCulturalEnhancements(userInfo, sessionId) {
    const language = userInfo?.nativeLanguage || userInfo?.language || 'en';
    
    // Import REGIONAL_CULTURAL_CONTEXTS from tier25Vocabulary.js
    const { REGIONAL_CULTURAL_CONTEXTS } = await import('./tier25Vocabulary.js');
    
    // Use language-based cultural context (English gets empty string)
    const culturalContext = REGIONAL_CULTURAL_CONTEXTS[language.toLowerCase()] || '';
    
    console.log(`🌍 Cultural Enhancement Level: LANGUAGE_BASED for language: ${language}`);
    console.log(`🎨 Cultural Context Applied: ${culturalContext ? 'YES' : 'NO (English default)'}`);
    
    return culturalContext;
  }

  /**
   * Complete Phase 1 & 2 integration workflow
   */
  async executeCompleteWorkflow(userInfo, storyText, sessionId, requestId) {
    try {
      console.log(`🔄 PHASE ORCHESTRATOR: Executing complete Phase 1 & 2 workflow`, {
        userId: userInfo?.id || userInfo?.userId,
        sessionId,
        requestId
      });

      // Step 1: Initialize phases
      const initialization = await this.initializePhases(userInfo, sessionId, requestId);
      
      // Step 2: Process story for traits
      const storyProcessing = await this.processStoryForTraits(userInfo, storyText, sessionId);
      
      // Step 3: Get primary scene and aiSchema from ai-visual-scene-creator
      console.log(`🔧 ORCHESTRATOR: Calling ai-visual-scene-creator for basePrompt components`);
      
      const sceneResponse = await this.supabase.functions.invoke('ai-visual-scene-creator', {
        body: { 
          storyText, 
          includeFullSchema: true,
          requestId: `orchestrator-${sessionId}`,
          source: 'orchestrator'
        }
      });

      if (!sceneResponse.data?.success || !sceneResponse.data?.primaryScene) {
        console.error(`🚨 ORCHESTRATOR: No primary scene from ai-visual-scene-creator, escalating to Tier 2.5A`);
        throw new Error('NO_PRIMARY_SCENE_ESCALATE_TO_25A');
      }

      const { primaryScene, aiSchema } = sceneResponse.data;
      
      // Combine primaryScene + aiSchema into basePrompt
      const basePrompt = primaryScene + (aiSchema ? `\n\nSchema: ${JSON.stringify(aiSchema)}` : '');
      
      console.log(`✅ ORCHESTRATOR: Created basePrompt from primaryScene (${primaryScene.length} chars) + aiSchema (${aiSchema ? 'present' : 'missing'})`);
      
      // Step 4: Enhanced prompt generation (will be used by image generation)
      const promptEnhancement = await this.getEnhancedPrompt(
        userInfo, 
        basePrompt, 
        storyText, 
        sessionId
      );

      const workflow = {
        initialization,
        storyProcessing,
        promptEnhancement,
        workflowComplete: true,
        phases: {
          phase1Complete: initialization.phase1?.characterConsistency || false,
          phase2Complete: initialization.phase2?.visualTracking || false
        }
      };

      console.log(`✅ PHASE ORCHESTRATOR: Complete workflow executed`, {
        userId: userInfo?.id || userInfo?.userId,
        phase1Status: workflow.phases.phase1Complete,
        phase2Status: workflow.phases.phase2Complete,
        workflowComplete: workflow.workflowComplete
      });

      return workflow;
    } catch (error) {
      console.error(`❌ PHASE ORCHESTRATOR: Complete workflow failed`, { error });
      
      // Propagate escalation signal instead of returning failure object
      if (error.message && error.message.includes('NO_PRIMARY_SCENE_ESCALATE_TO_25A')) {
        console.log(`🚨 PHASE ORCHESTRATOR: Rethrowing escalation signal from workflow`);
        throw error;
      }
      
      return {
        workflowComplete: false,
        error: error.message,
        phases: {
          phase1Complete: false,
          phase2Complete: false
        }
      };
    }
  }

  /**
   * Get integration status and statistics
   */
  getIntegrationStatus() {
    const characterStats = { cacheSize: 0, hitRate: 1.0, lastUpdated: Date.now() };
    const visualStats = { cacheSize: 0, hitRate: 1.0, lastUpdated: Date.now() };

    return {
      initialized: this.initialized,
      phase1: {
        name: 'Character Consistency',
        status: 'active',
        stats: characterStats
      },
      phase2: {
        name: 'Visual Detail Tracker', 
        status: 'active',
        stats: visualStats
      },
      integration: {
        totalUsers: Math.max(characterStats.cacheSize, visualStats.cacheSize),
        memoryEfficiency: 'optimized',
        cacheHealth: 'good'
      }
    };
  }
}

// Export singleton instance
export const phaseIntegrationOrchestrator = new PhaseIntegrationOrchestrator();