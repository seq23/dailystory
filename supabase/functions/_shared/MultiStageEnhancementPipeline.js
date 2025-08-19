// Lean Multi-Stage Enhancement Pipeline - Phase 4.7 Implementation
// Coordinates enhancement phases without duplicating frontend logic

import { DifficultyLevelMapper } from './DifficultyLevelMapper.js';
import { getStyleFramework, buildCompletePrompt } from './styleFrameworks.js';

export class MultiStageEnhancementPipeline {
  /**
   * Main processing function - lean coordination layer
   */
  static async processThroughPipeline(storyText, userInfo, sessionId, pageNumber, totalPages) {
    try {
      console.log(`🔄 Pipeline processing: ${sessionId} page ${pageNumber}/${totalPages}`);
      
      // Phase 1: Difficulty mapping with centralized logging
      const difficulty = DifficultyLevelMapper.mapToImageDifficulty(userInfo);
      
      // Phase 2: Get highest quality style framework
      const framework = getStyleFramework(difficulty);
      
      // Phase 4: Basic cultural context (frontend handles complex cultural logic)
      const culturalContext = this.getBasicCulturalContext(userInfo);
      
      // Extract basic scene description
      const sceneDescription = this.extractPrimaryScene(storyText);
      
      // Phase 3: Build optimized prompt (deduplication + token management in styleFrameworks.js)
      const { positivePrompt, negativePrompt } = buildCompletePrompt(
        framework,
        sceneDescription,
        '', // Character description handled by frontend services
        culturalContext
      );
      
      // Return consistent quality parameters for all levels
      const parameters = {
        ...framework.parameters,
        outputFormat: "WEBP",
        model: "runware:100@1"
      };
      
      const qualityScore = this.calculateQualityScore(positivePrompt);
      
      console.log(`✅ Pipeline complete: Quality score ${qualityScore}, ${difficulty} → ${framework.name}`);
      
      return {
        success: true,
        enhancedPrompt: positivePrompt,
        negativePrompt: negativePrompt,
        generationParams: parameters,
        qualityScore: qualityScore,
        difficulty: difficulty,
        styleFramework: framework.name
      };
      
    } catch (error) {
      console.error('❌ Pipeline error:', error);
      return this.createFallbackResult(storyText, userInfo);
    }
  }
  
  /**
   * Extract main scene from story text (simple keyword-based)
   */
  static extractPrimaryScene(storyText) {
    if (!storyText || storyText.length < 10) {
      return 'A colorful children\'s book scene';
    }
    
    // Find the longest sentence (likely most descriptive)
    const sentences = storyText.split(/[.!?]+/).filter(s => s.trim().length > 5);
    const longestSentence = sentences.reduce((a, b) => a.length > b.length ? a : b, '');
    
    return longestSentence.trim() || storyText.substring(0, 100);
  }
  
  /**
   * Basic cultural context (frontend services handle complex logic)
   */
  static getBasicCulturalContext(userInfo) {
    const language = userInfo?.nativeLanguage || userInfo?.language || 'en';
    
    // Simple mapping - complex cultural logic stays in frontend
    const basicContext = {
      'es': 'warm, inclusive representation',
      'fr': 'artistic, expressive style',
      'zh': 'harmonious, balanced composition',
      'ar': 'respectful, authentic cultural elements',
      'hi': 'vibrant, culturally rich',
      'pt': 'warm, family-oriented scene'
    };
    
    return basicContext[language] || 'diverse, inclusive representation';
  }
  
  /**
   * Simple quality scoring
   */
  static calculateQualityScore(prompt) {
    if (!prompt) return 0;
    
    const qualityIndicators = [
      'high-quality', 'premium', 'professional', 'detailed', 
      'illustration', 'artistic', 'vibrant', 'beautiful'
    ];
    
    const score = qualityIndicators.reduce((acc, indicator) => {
      return acc + (prompt.toLowerCase().includes(indicator) ? 10 : 0);
    }, 50);
    
    return Math.min(score, 100);
  }
  
  /**
   * Fallback for errors
   */
  static createFallbackResult(storyText, userInfo) {
    const difficulty = userInfo?.readingLevel || 'easy';
    const framework = getStyleFramework(difficulty);
    
    return {
      success: true,
      enhancedPrompt: `${storyText}, ${framework.prompt}, children's book illustration`,
      negativePrompt: "text, words, scary, dark, adult themes",
      generationParams: framework.parameters,
      qualityScore: 60,
      difficulty: difficulty,
      styleFramework: 'Fallback'
    };
  }
}