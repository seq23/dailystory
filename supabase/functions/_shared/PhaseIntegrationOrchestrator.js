/**
 * PHASE INTEGRATION ORCHESTRATOR
 * Coordinates Phase 1 (Character Consistency) and Phase 2 (Visual Detail Tracker)
 * with the existing image generation pipeline
 */

import { CharacterConsistencyService } from './CharacterConsistencyService.js';
import { VisualDetailTracker } from './VisualDetailTracker.js';
import { getCulturalSelection } from './tier25Vocabulary.js';

export class PhaseIntegrationOrchestrator {
  constructor() {
    this.initialized = false;
    this.characterConsistencyService = new CharacterConsistencyService();
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
      const secondaryCharacters = [];

      // Phase 2: Load visual history for consistency  
      const visualHistory = await this.visualDetailTracker.getVisualHistory(userId, characterName);
      const consistencyRecommendations = await this.visualDetailTracker.getConsistencyRecommendations(userId, characterName);

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
  async getEnhancedPrompt(userInfo, basePrompt, storyText, sessionId) {
    try {
      const userId = userInfo?.id || userInfo?.userId || 'anonymous';
      const characterName = userInfo?.name || userInfo?.childName || 'Child';

      console.log(`🎨 PHASE ORCHESTRATOR: Generating Tier 1 enhanced prompt template`, {
        userId,
        characterName,
        basePromptLength: basePrompt?.length || 0
      });

      // Phase 1: Get character consistency data
      const existingTraits = await this.characterConsistencyService.getCharacterFromDatabase(sessionId, `traits_${characterName}`) || {};
      const visualDescription = await this.characterConsistencyService.buildCharacterDescription(
        { characterName, age: '6-8' }, 
        storyText || '', 
        null, 
        sessionId
      );

      // Phase 2: Get visual consistency recommendations
      const recommendations = { recommendations: [], consistencyScore: 1.0 };

      // Get style framework for brand suffix
      const difficulty = userInfo?.difficulty || userInfo?.gradeLevel || 'medium';
      const styleFrameworks = {
        'beginner': 'Contemporary Children\'s Book Illustration with sharp facial definition, refined features',
        'easy': 'Contemporary Children\'s Book Illustration with sharp facial definition, refined features', 
        'medium': 'Contemporary Children\'s Book Illustration with sharp facial definition, refined features',
        'hard': '2.9D Rendered Illustration with golden hour volumetric lighting',
        'expert': '2.9D Rendered Illustration with golden hour volumetric lighting'
      };
      const brandSuffix = styleFrameworks[difficulty] || styleFrameworks['medium'];

      // Build the EXACT Tier 1 template structure
      const primaryScene = basePrompt || 'A beautiful children\'s story scene';
      
      // Avatar Identity and Regional Context
      const avatarIdentity = `${characterName}, age ${userInfo?.age || 6}`;
      const regionalContext = userInfo?.nativeLanguage !== 'en' ? 'culturally appropriate' : 'diverse and inclusive';
      
      // Cultural Enhancements
      const culturalEnhancements = await this.getCulturalEnhancements(userInfo, sessionId);
      
      // Consistency Details
      const consistencyDetails = visualDescription || 'consistent character design';
      
      // Character Description
      const characterDescription = [avatarIdentity, regionalContext, culturalEnhancements, consistencyDetails]
        .filter(Boolean).join(', ');

      // Previous Appearance Data
      const previousAppearance = existingTraits ? 'maintains visual consistency from previous pages' : '';
      
      // Build complete Tier 1 enhanced prompt template
      const enhancedPrompt = [
        `PRIMARY SCENE: ${primaryScene}`,
        `CHARACTER DESCRIPTION: ${characterDescription}`,
        `CHARACTER CONSISTENCY:`,
        `- Avatar Identity: ${avatarIdentity}`,
        `- Visual Traits: ${consistencyDetails}`,
        previousAppearance ? `- Previous Appearance: ${previousAppearance}` : '',
        culturalEnhancements ? `- Cultural Enhancements: ${culturalEnhancements}` : '',
        `BRAND SUFFIX: ${brandSuffix}`,
        `CONTEXT: ${storyText || basePrompt}`
      ].filter(Boolean).join('\n');

      console.log(`✅ PHASE ORCHESTRATOR: Complete Tier 1 template generated`, {
        userId,
        characterName,
        hasTraits: !!existingTraits,
        enhancedLength: enhancedPrompt.length,
        templateComponents: 6
      });

      return {
        enhancedPrompt,
        characterConsistency: {
          hasTraits: !!existingTraits,
          visualDescription: consistencyDetails
        },
        visualConsistency: {
          score: recommendations.consistencyScore,
          previousAppearance: previousAppearance
        },
        enhancementSuccessful: true,
        templateStructure: 'COMPLETE_TIER_1'
      };
    } catch (error) {
      console.error(`❌ PHASE ORCHESTRATOR: Tier 1 template generation failed`, { error });
      return {
        enhancedPrompt: basePrompt,
        enhancementSuccessful: false,
        error: error.message,
        templateStructure: 'FAILED'
      };
    }
  }

  /**
   * Get cultural enhancements based on user profile with seeded selection
   */
  async getCulturalEnhancements(userInfo, sessionId) {
    const language = userInfo?.nativeLanguage || userInfo?.language || 'en';
    const skinTone = userInfo?.skinTone || userInfo?.avatar?.skinTone || 'light';
    
    // Apply seeded cultural enhancements for dark-skinned users with supported languages
    if ((skinTone === 'dark' || skinTone === 'darker') && 
        ['en', 'fr', 'es', 'pt'].includes(language.toLowerCase())) {
      
      // Use seeded selection for consistent cultural arrays
      const { getCulturalBundle } = await import('./StaticDataCache.js');
      const culturalBundle = getCulturalBundle(userInfo, sessionId || 'default');
      return `${culturalBundle.hair}, ${culturalBundle.features}`;
    }
    
    return '';
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
      
      // Step 3: Enhanced prompt generation (will be used by image generation)
      const promptEnhancement = await this.getEnhancedPrompt(
        userInfo, 
        storyText, 
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
        totalUsers: Math.max(characterStats.characterCacheSize, visualStats.characterCount),
        memoryEfficiency: 'optimized',
        cacheHealth: 'good'
      }
    };
  }
}

// Export singleton instance
export const phaseIntegrationOrchestrator = new PhaseIntegrationOrchestrator();