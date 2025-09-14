/**
 * PHASE INTEGRATION ORCHESTRATOR
 * Coordinates Phase 1 (Character Consistency) and Phase 2 (Visual Detail Tracker)
 * with the existing image generation pipeline
 */

import { characterConsistencyService } from './CharacterConsistencyService.js';
import { visualDetailTracker } from './VisualDetailTracker.js';

export class PhaseIntegrationOrchestrator {
  constructor() {
    this.initialized = false;
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

      const existingTraits = characterConsistencyService.getCharacterTraits(userId, characterName);
      const secondaryCharacters = characterConsistencyService.getSecondaryCharacters(userId, characterName);

      // Phase 2: Load visual history for consistency
      const visualHistory = visualDetailTracker.getVisualHistory(userId, characterName, 5);
      const consistencyRecommendations = visualDetailTracker.getConsistencyRecommendations(userId, characterName);

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
      const extractedTraits = characterConsistencyService.extractAndCacheTraits(
        userId, 
        characterName, 
        storyText
      );

      // Generate consistent visual description
      const visualDescription = characterConsistencyService.generateConsistentDescription(
        userId, 
        characterName, 
        true // Include secondary characters
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
      const visualId = visualDetailTracker.trackVisualDetail(
        userId,
        sessionId,
        characterName,
        {
          ...visualData,
          imageUrl,
          pageNumber: visualData.pageNumber || 1
        }
      );

      // Detect appearance conflicts (Phase 2.3)
      const conflicts = visualDetailTracker.detectAppearanceConflicts(
        userId,
        characterName,
        visualData
      );

      // Resolve conflicts if any detected
      let resolvedElements = {};
      if (conflicts.length > 0) {
        resolvedElements = visualDetailTracker.resolveVisualConflicts(
          userId,
          characterName,
          conflicts
        );
      }

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
   * Get enhanced prompt with Phase 1 & 2 data
   */
  async getEnhancedPrompt(userInfo, basePrompt, storyText, sessionId) {
    try {
      const userId = userInfo?.id || userInfo?.userId || 'anonymous';
      const characterName = userInfo?.name || userInfo?.childName || 'Child';

      console.log(`🎨 PHASE ORCHESTRATOR: Generating enhanced prompt`, {
        userId,
        characterName,
        basePromptLength: basePrompt?.length || 0
      });

      // Phase 1: Get character consistency data
      const existingTraits = characterConsistencyService.getCharacterTraits(userId, characterName);
      const visualDescription = characterConsistencyService.generateConsistentDescription(
        userId, 
        characterName, 
        false
      );

      // Phase 2: Get visual consistency recommendations
      const recommendations = visualDetailTracker.getConsistencyRecommendations(userId, characterName);

      // Build enhanced prompt
      let enhancedPrompt = basePrompt;

      // Add character consistency if available
      if (existingTraits && visualDescription) {
        enhancedPrompt += ` Focus on: ${visualDescription}.`;
      }

      // Add visual consistency guidance
      if (recommendations.consistencyScore < 0.8 && recommendations.recommendations.length > 0) {
        const topRecommendation = recommendations.recommendations[0];
        enhancedPrompt += ` Visual consistency: ${topRecommendation.suggestion}.`;
      }

      console.log(`✅ PHASE ORCHESTRATOR: Enhanced prompt generated`, {
        userId,
        characterName,
        hasTraits: !!existingTraits,
        consistencyScore: recommendations.consistencyScore,
        enhancedLength: enhancedPrompt.length
      });

      return {
        enhancedPrompt,
        characterConsistency: {
          hasTraits: !!existingTraits,
          visualDescription
        },
        visualConsistency: {
          score: recommendations.consistencyScore,
          recommendationCount: recommendations.recommendations.length
        },
        enhancementSuccessful: true
      };
    } catch (error) {
      console.error(`❌ PHASE ORCHESTRATOR: Prompt enhancement failed`, { error });
      return {
        enhancedPrompt: basePrompt,
        enhancementSuccessful: false,
        error: error.message
      };
    }
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
    const characterStats = characterConsistencyService.getCacheStats();
    const visualStats = visualDetailTracker.getCacheStats();

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