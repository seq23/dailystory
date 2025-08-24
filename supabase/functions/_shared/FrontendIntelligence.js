// ============= STRIPPED FRONTEND INTELLIGENCE =============
// Reduced from 655 lines to basic utility functions only
// All cultural arrays moved to CharacterConsistencyService

export class FrontendIntelligence {
  
  // ============= BASIC UTILITY FUNCTIONS ONLY =============
  
  static detectEmotionalContext(storyText) {
    if (!storyText || typeof storyText !== 'string') return 'neutral';
    
    const positive = ['happy', 'joy', 'smile', 'laugh', 'fun', 'excited', 'wonderful', 'amazing', 'great'];
    const negative = ['sad', 'cry', 'angry', 'scared', 'worried', 'trouble', 'problem', 'hurt'];
    
    const textLower = storyText.toLowerCase();
    
    const positiveCount = positive.filter(word => textLower.includes(word)).length;
    const negativeCount = negative.filter(word => textLower.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }
  
  static detectSceneContext(storyText) {
    if (!storyText || typeof storyText !== 'string') return 'indoor';
    
    const outdoor = ['outside', 'park', 'playground', 'garden', 'beach', 'forest', 'field'];
    const indoor = ['inside', 'home', 'house', 'room', 'school', 'classroom', 'library'];
    
    const textLower = storyText.toLowerCase();
    
    const outdoorCount = outdoor.filter(word => textLower.includes(word)).length;
    const indoorCount = indoor.filter(word => textLower.includes(word)).length;
    
    if (outdoorCount > indoorCount) return 'outdoor';
    return 'indoor';
  }
  
  // Simple fallback method for compatibility
  static buildEnhancedPromptWithSafety(storyText, userInfo, sessionId, pageNumber) {
    console.log('🔄 FrontendIntelligence fallback - redirecting to CharacterConsistencyService');
    
    const emotion = this.detectEmotionalContext(storyText);
    const scene = this.detectSceneContext(storyText);
    
    return `${emotion} ${scene} children's book scene: ${storyText}`;
  }
}