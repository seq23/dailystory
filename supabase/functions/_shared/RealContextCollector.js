// Real Context Collector - Collects actual story content for continuity
// Integrates with StoryVisualStateManager to provide rich context

export class RealContextCollector {
  
  // ============= CONTEXT COLLECTION =============
  static async collectRealStoryContext(sessionId, pageNumber, storyText) {
    try {
      console.log(`🔍 Collecting real context for session ${sessionId}, page ${pageNumber}`);
      
      const contextData = {
        previousPages: [],
        characterDescriptions: [],
        visualElements: [],
        settingContinuity: [],
        narrativeContinuity: []
      };
      
      // Collect previous story content safely
      if (globalThis.StoryVisualStateManager?.getPromptHistory) {
        try {
          const promptHistory = globalThis.StoryVisualStateManager.getPromptHistory(sessionId, 3);
          
          for (const entry of promptHistory) {
            if (entry.originalText && entry.pageNumber < pageNumber) {
              contextData.previousPages.push({
                pageNumber: entry.pageNumber,
                content: entry.originalText,
                visualDescription: entry.visualDescription || ''
              });
            }
          }
        } catch (error) {
          console.warn('⚠️ Could not collect prompt history:', error.message);
        }
      }
      
      // Collect character consistency data
      if (globalThis.StoryVisualStateManager?.getVisualDetailsForPrompt) {
        try {
          const characterDetails = globalThis.StoryVisualStateManager.getVisualDetailsForPrompt(sessionId);
          if (characterDetails) {
            contextData.characterDescriptions.push(characterDetails);
          }
        } catch (error) {
          console.warn('⚠️ Could not collect character details:', error.message);
        }
      }
      
      // Collect visual elements
      if (globalThis.VisualDetailTracker?.getSessionDetails) {
        try {
          const visualDetails = globalThis.VisualDetailTracker.getSessionDetails(sessionId);
          contextData.visualElements = visualDetails || [];
        } catch (error) {
          console.warn('⚠️ Could not collect visual details:', error.message);
        }
      }
      
      // Collect setting continuity
      if (globalThis.StoryVisualStateManager?.getSettingForPrompt) {
        try {
          const currentSetting = globalThis.StoryVisualStateManager.getSettingForPrompt(sessionId);
          if (currentSetting) {
            contextData.settingContinuity.push(currentSetting);
          }
        } catch (error) {
          console.warn('⚠️ Could not collect setting:', error.message);
        }
      }
      
      return contextData;
      
    } catch (error) {
      console.error('❌ Real context collection failed:', error.message);
      return {
        previousPages: [],
        characterDescriptions: [],
        visualElements: [],
        settingContinuity: [],
        narrativeContinuity: []
      };
    }
  }
  
  // ============= CONTEXT INTEGRATION =============
  static buildContextualPromptAddition(contextData, storyText) {
    const contextParts = [];
    
    // Add previous page continuity
    if (contextData.previousPages && contextData.previousPages.length > 0) {
      const recentPage = contextData.previousPages[contextData.previousPages.length - 1];
      if (recentPage && recentPage.visualDescription) {
        contextParts.push(`Previous scene: ${recentPage.visualDescription}`);
      }
    }
    
    // Add character continuity
    if (contextData.characterDescriptions && contextData.characterDescriptions.length > 0) {
      const characterDesc = contextData.characterDescriptions[0];
      if (characterDesc) {
        contextParts.push(`Character consistency: ${characterDesc}`);
      }
    }
    
    // Add visual element continuity
    if (contextData.visualElements && contextData.visualElements.length > 0) {
      const recentElements = contextData.visualElements.slice(-3).map(e => e.description).join(', ');
      if (recentElements) {
        contextParts.push(`Visual continuity: ${recentElements}`);
      }
    }
    
    // Add setting continuity
    if (contextData.settingContinuity && contextData.settingContinuity.length > 0) {
      const setting = contextData.settingContinuity[0];
      if (setting) {
        contextParts.push(`Setting continuity: ${setting}`);
      }
    }
    
    return contextParts.length > 0 ? `[Story Context: ${contextParts.join('. ')}]` : '';
  }
  
  // ============= ENHANCED STORY TEXT GENERATION =============
  static enhanceStoryTextWithRealContext(storyText, contextData) {
    const contextAddition = this.buildContextualPromptAddition(contextData, storyText);
    
    if (contextAddition) {
      return `${storyText}\n${contextAddition}`;
    }
    
    return storyText;
  }
  
  // ============= CONTEXT VALIDATION =============
  static validateContextQuality(contextData) {
    const quality = {
      hasPreviousPages: contextData.previousPages && contextData.previousPages.length > 0,
      hasCharacterDescriptions: contextData.characterDescriptions && contextData.characterDescriptions.length > 0,
      hasVisualElements: contextData.visualElements && contextData.visualElements.length > 0,
      hasSettingContinuity: contextData.settingContinuity && contextData.settingContinuity.length > 0
    };
    
    const qualityScore = Object.values(quality).filter(Boolean).length;
    
    return {
      ...quality,
      qualityScore: qualityScore,
      qualityLevel: qualityScore >= 3 ? 'high' : qualityScore >= 2 ? 'medium' : 'low',
      isUsable: qualityScore >= 1
    };
  }
}

// Export singleton instance
export const realContextCollector = new RealContextCollector();