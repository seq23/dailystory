// ============= STRIPPED MULTISTAGE ENHANCEMENT PIPELINE =============
// Reduced from 1,479 lines to systematic service wrappers only
// All Tier 1 logic moved to orchestrator, BackendTokenManager deleted

export class MultiStageEnhancementPipeline {
  
  // ============= TIER 2: SYSTEMATIC SERVICE WRAPPERS ONLY =============
  
  static async processTier2HighQuality(storyText, userInfo, storyId, sessionId, pageNumber, totalPages, enhancedStoryData, avatarIdentity) {
    console.log(`🔥 Tier 2 Systematic Services: storyId ${storyId}, session ${sessionId} page ${pageNumber}/${totalPages}`);
    
    try {
      // Import systematic services
      let SecondaryElementDetector, VisualDetailTracker, RealContextCollector;
      
      try {
        SecondaryElementDetector = (await import('./SecondaryElementDetector.js')).SecondaryElementDetector;
      } catch (e) {
        console.warn('SecondaryElementDetector not available:', e.message);
      }
      
      try {
        VisualDetailTracker = (await import('./VisualDetailTracker.js')).VisualDetailTracker;
      } catch (e) {
        console.warn('VisualDetailTracker not available:', e.message);
      }
      
      try {
        RealContextCollector = (await import('./RealContextCollector.js')).RealContextCollector;
      } catch (e) {
        console.warn('RealContextCollector not available:', e.message);
      }
      
      let collectedContext = '';
      let visualDetails = '';
      let secondaryCharacters = '';
      
      // Systematic service wrappers
      if (SecondaryElementDetector) {
        secondaryCharacters = SecondaryElementDetector.detectSecondaryCharacters(storyText, userInfo) || '';
      }
      
      if (VisualDetailTracker) {
        visualDetails = VisualDetailTracker.getVisualDetailsForPrompt(sessionId) || '';
      }
      
      if (RealContextCollector) {
        collectedContext = await RealContextCollector.collectRealContext(
          storyText, userInfo, sessionId, pageNumber, totalPages
        ) || '';
      }
      
      // Simple systematic prompt building
      const segments = [];
      
      if (storyText) segments.push(`Story: ${storyText}`);
      if (secondaryCharacters) segments.push(`Secondary characters: ${secondaryCharacters}`);
      if (visualDetails) segments.push(`Visual details: ${visualDetails}`);
      if (collectedContext) segments.push(`Context: ${collectedContext}`);
      
      const enhancedPrompt = segments.join(', ');
      const negativePrompt = 'blurry, low quality, distorted';
      
      console.log('✅ Tier 2 systematic processing complete');
      
      return {
        enhancedPrompt,
        negativePrompt,
        metadata: {
          processingTier: 'tier-2-systematic',
          servicesUsed: ['SecondaryElementDetector', 'VisualDetailTracker', 'RealContextCollector'],
          segmentCount: segments.length
        }
      };
      
    } catch (error) {
      console.error('❌ Tier 2 systematic services error:', error);
      
      // Simple fallback
      return {
        enhancedPrompt: `Story scene: ${storyText}`,
        negativePrompt: 'blurry, low quality, distorted',
        metadata: {
          processingTier: 'tier-2-fallback',
          error: error.message
        }
      };
    }
  }
  
  // ============= UTILITY FUNCTIONS =============
  
  static selectWeightedElement(elements, weights = null) {
    if (!elements || elements.length === 0) return '';
    if (!weights) return elements[Math.floor(Math.random() * elements.length)];
    
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let randomNum = Math.random() * totalWeight;
    
    for (let i = 0; i < elements.length; i++) {
      randomNum -= weights[i];
      if (randomNum <= 0) return elements[i];
    }
    
    return elements[0];
  }
  
  static updateSettingFromText(text, currentSetting) {
    if (!text) return currentSetting || 'indoor scene';
    
    const textLower = text.toLowerCase();
    
    if (textLower.includes('outside') || textLower.includes('park') || textLower.includes('playground')) {
      return 'outdoor playground scene';
    } else if (textLower.includes('home') || textLower.includes('house') || textLower.includes('room')) {
      return 'cozy home indoor scene';
    } else if (textLower.includes('school') || textLower.includes('classroom')) {
      return 'bright school classroom scene';
    }
    
    return currentSetting || 'colorful indoor scene';
  }
}