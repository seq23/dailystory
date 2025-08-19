// Enhanced Multi-Stage Pipeline - Clean Orchestration Only
// Imports all data from synced FrontendIntelligence.js

import { DifficultyLevelMapper } from './DifficultyLevelMapper.js';
import { getStyleFramework, buildCompletePrompt } from './styleFrameworks.js';
import { 
  FrontendIntelligence, 
  generateCulturalCharacterDescription, 
  analyzeEmotionalContent,
  generateFacialFeaturesDescription 
} from './FrontendIntelligence.js';

// All cultural data now imported from FrontendIntelligence.js
// No manual duplication - single source of truth!

function selectWeightedElement(array) {
  if (!array || array.length === 0) return '';
  return array[Math.floor(Math.random() * array.length)];
}

export class MultiStageEnhancementPipeline {
  static async processThroughPipeline(storyText, userInfo, sessionId, pageNumber, totalPages) {
    try {
      console.log(`🔄 Pipeline processing: ${sessionId} page ${pageNumber}/${totalPages}`);
      
      const difficulty = DifficultyLevelMapper.mapToImageDifficulty(userInfo);
      const framework = getStyleFramework(difficulty);
      
      const sceneDescription = this.extractPrimaryScene(storyText);
      const characterDescription = generateCulturalCharacterDescription(userInfo);
      const culturalSetting = this.generateCulturalSetting(userInfo);
      const emotionalContext = analyzeEmotionalContent(storyText);
      
      const { enhancedPrompt: qualityPrompt, optimizations } = this.applyQualityEnhancements(sceneDescription);
      
      const { positivePrompt, negativePrompt } = buildCompletePrompt(
        framework,
        qualityPrompt,
        characterDescription,
        culturalSetting
      );
      
      const finalPrompt = `${positivePrompt}, ${emotionalContext.colorPalette.join(', ')}, ${emotionalContext.lightingStyle}, ${emotionalContext.compositionStyle}`;
      
      const parameters = {
        ...framework.parameters,
        outputFormat: "WEBP",
        model: "runware:100@1"
      };
      
      const qualityScore = this.calculateQualityScore(positivePrompt);
      
      return {
        success: true,
        enhancedPrompt: finalPrompt,
        negativePrompt: negativePrompt,
        generationParams: parameters,
        qualityScore: qualityScore,
        difficulty: difficulty,
        styleFramework: framework.name,
        culturalProfile: userInfo?.nativeLanguage || 'en',
        emotionalTone: emotionalContext.mood,
        optimizations: optimizations
      };
      
    } catch (error) {
      console.error('❌ Pipeline error:', error);
      return this.createFallbackResult(storyText, userInfo);
    }
  }
  
  static extractPrimaryScene(storyText) {
    if (!storyText || storyText.length < 10) {
      return 'A colorful children\'s book scene';
    }
    
    const sentences = storyText.split(/[.!?]+/).filter(s => s.trim().length > 5);
    const longestSentence = sentences.reduce((a, b) => a.length > b.length ? a : b, '');
    
    return longestSentence.trim() || storyText.substring(0, 100);
  }

  static generateCulturalSetting(userInfo) {
    if (!userInfo) return 'pleasant children-friendly environment';
    
    const language = userInfo?.nativeLanguage || 'en';
    const profile = FrontendIntelligence.culturalProfiles[language] || FrontendIntelligence.culturalProfiles.en;
    
    if (!profile) return 'pleasant children-friendly environment';
    
    const setting = selectWeightedElement(profile.settings || []);
    const culturalElement = selectWeightedElement(profile.culturalElements || []);
    
    return `${setting} with ${culturalElement}`;
  }

  static applyQualityEnhancements(prompt) {
    let enhancedPrompt = prompt;
    const optimizations = [];
    
    if (!enhancedPrompt.includes("children's book illustration")) {
      enhancedPrompt += ", professional children's book illustration, warm earth tones, safe wholesome content";
      optimizations.push("Added professional children's book styling");
    }
    
    return { enhancedPrompt, optimizations };
  }

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

  static createFallbackResult(storyText, userInfo) {
    const difficulty = DifficultyLevelMapper.mapToImageDifficulty(userInfo);
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