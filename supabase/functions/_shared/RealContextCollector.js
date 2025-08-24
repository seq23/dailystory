// Real Context Collector - Collects actual story content for continuity
// Integrates with SessionStateManager to provide rich context

import { globalSessionManager } from './SessionStateManager.js';

export class RealContextCollector {
  
  // ============= CONTEXT COLLECTION =============
  static async collectRealStoryContext(sessionId, pageNumber, storyText) {
    console.log(`🔍 Collecting real context for session ${sessionId}, page ${pageNumber}`);
    console.log('📖 Step 4: Story context collection...');
    
    const contextData = {
      previousPages: [],
      characterDescriptions: [],
      visualElements: [],
      settingContinuity: [],
      narrativeContinuity: []
    };
    
    // Collect previous story content - fail if this fails
    console.log('📖 Collecting prompt history...');
    const promptHistory = globalSessionManager.getPromptHistory(sessionId, 3);
    
    for (const entry of promptHistory) {
      if (entry.originalText && entry.pageNumber < pageNumber) {
        contextData.previousPages.push({
          pageNumber: entry.pageNumber,
          content: entry.originalText,
          visualDescription: entry.visualDescription || ''
        });
      }
    }
    
    // Collect character consistency data - fail if this fails
    console.log('📖 Collecting character details...');
    const characterDetails = globalSessionManager.getVisualDetailsForPrompt(sessionId);
    if (characterDetails) {
      contextData.characterDescriptions.push(characterDetails);
    }
    
    // Collect visual elements - fail if this fails
    if (globalThis.VisualDetailTracker?.getSessionDetails) {
      console.log('📖 Collecting visual details...');
      const visualDetails = globalThis.VisualDetailTracker.getSessionDetails(sessionId);
      contextData.visualElements = visualDetails || [];
    }
    
    // Collect setting continuity - fail if this fails
    console.log('📖 Collecting setting data...');
    const currentSetting = globalSessionManager.getSettingForPrompt(sessionId);
    if (currentSetting) {
      contextData.settingContinuity.push(currentSetting);
    }
    
    return contextData;
  }
  
  // ============= CONTEXT INTEGRATION =============
  static buildContextualPromptAddition(contextData, storyText) {
    const contextParts = [];
    
    // Add character names for pronoun clarity (replaces AdvancedPronounResolver)
    const characterNames = this.extractCharacterNamesFromText(storyText);
    if (characterNames.length > 0) {
      contextParts.push(`Characters present: ${characterNames.join(', ')}`);
    }
    
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

  // ============= CHARACTER NAME EXTRACTION (replaces AdvancedPronounResolver) =============
  static extractCharacterNamesFromText(text) {
    if (!text) return [];
    
    // Simple but effective character name detection
    const namePattern = /\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)?\b/g;
    const matches = text.match(namePattern) || [];
    
    // Filter out common capitalized words
    const commonWords = ['The', 'A', 'An', 'This', 'That', 'Then', 'When', 'Where', 'Why', 'How', 'But', 'And', 'Or', 'So'];
    const characterNames = matches
      .filter(name => !commonWords.includes(name))
      .filter(name => name.length > 2)
      .slice(0, 4); // Keep top 4 character names
    
    return [...new Set(characterNames)]; // Remove duplicates
  }
}

// Export singleton instance
export const realContextCollector = new RealContextCollector();