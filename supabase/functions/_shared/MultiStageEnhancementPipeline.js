// Phase 2: Simplified Template-Based Pipeline - NO AI Features, Dynamic Templates Only

import { DifficultyLevelMapper } from './DifficultyLevelMapper.js';
import { getStyleFramework } from './styleFrameworks.js';

function selectWeightedElement(array) {
  if (!array || array.length === 0) return '';
  return array[Math.floor(Math.random() * array.length)];
}

export class MultiStageEnhancementPipeline {
  static async processThroughPipeline(storyText, userInfo, sessionId, pageNumber, totalPages) {
    try {
      console.log(`🔄 Tier 2 Template Pipeline: ${sessionId} page ${pageNumber}/${totalPages}`);
      
      // Data preparation - NO AI analysis
      const difficulty = DifficultyLevelMapper.mapToImageDifficulty(userInfo);
      const framework = getStyleFramework(difficulty);
      
      // Simple character descriptors - NO AI enhancement
      const characterDescriptors = this.prepareCharacterDescriptors(userInfo);
      
      // Extract scene content - NO emotional analysis
      const primaryScene = this.extractPrimaryScene(storyText);
      
      // Build template-based prompt - NO AI enhancements
      const enhancedPrompt = this.buildTemplatePrompt(
        primaryScene, 
        characterDescriptors, 
        framework,
        userInfo
      );
      
      const negativePrompt = this.buildSimpleNegativePrompt(userInfo);
      
      return {
        success: true,
        enhancedPrompt,
        negativePrompt,
        // Technical parameters for Runware
        generationParams: {
          ...framework.parameters,
          outputFormat: "WEBP",
          model: "runware:100@1",
          CFGScale: 3.0, // Medium quality settings
          steps: 8
        },
        // Metadata
        difficulty: difficulty,
        styleFramework: framework.name,
        culturalProfile: userInfo?.nativeLanguage || 'en',
        qualityScore: 75 // Template-based quality
      };
      
    } catch (error) {
      console.error('❌ Pipeline error:', error);
      return this.createFallbackResult(storyText, userInfo);
    }
  }
  
  // Data extraction only - no prompt building
  static extractPrimaryScene(storyText) {
    if (!storyText || storyText.length < 10) {
      return 'A colorful children\'s book scene';
    }
    
    const sentences = storyText.split(/[.!?]+/).filter(s => s.trim().length > 5);
    const longestSentence = sentences.reduce((a, b) => a.length > b.length ? a : b, '');
    
    return longestSentence.trim() || storyText.substring(0, 100);
  }

  // Prepare character descriptors for frontend StructuredPromptEngine
  static prepareCharacterDescriptors(userInfo) {
    if (!userInfo) return [];
    
    const language = userInfo?.nativeLanguage || 'en';
    const profile = FrontendIntelligence.culturalProfiles[language] || FrontendIntelligence.culturalProfiles.en;
    
    const descriptors = [];
    
    if (userInfo.name) {
      descriptors.push({
        type: 'main_character',
        name: userInfo.name,
        relationship: 'protagonist',
        culturalRole: 'child',
        skinTone: userInfo.avatar?.skinTone || 'medium',
        gender: userInfo.gender || 'neutral',
        age: userInfo.age || 'child',
        culturalProfile: profile
      });
    }
    
    return descriptors;
  }

  // Template-based prompt building - NO AI analysis
  static buildTemplatePrompt(primaryScene, characterDescriptors, framework, userInfo) {
    const characterElements = characterDescriptors.map(char => char.name || 'child').join(', ');
    const culturalContext = this.buildSimpleCulturalContext(userInfo);
    const styleElements = framework.prompt || 'children\'s book illustration';
    
    return `${primaryScene} showing ${characterElements}, ${culturalContext}, ${styleElements}, ${framework.brandSuffix || 'children\'s book illustration'}`;
  }
  
  static buildSimpleNegativePrompt(userInfo) {
    let baseNegative = "text, words, scary, dark, adult themes, photorealistic";
    
    // Add gender consistency
    if (userInfo?.avatar?.type === 'girl') {
      baseNegative += ', boy character, male character, masculine features';
    } else if (userInfo?.avatar?.type === 'boy') {
      baseNegative += ', girl character, female character, feminine features, dress, skirt';
    }
    
    return baseNegative;
  }
  
  static buildSimpleCulturalContext(userInfo) {
    if (!userInfo?.nativeLanguage || userInfo.nativeLanguage === 'en') {
      return 'diverse children, inclusive setting';
    }
    
    const culturalMap = {
      'es': 'Latino setting',
      'fr': 'French style', 
      'zh': 'Chinese elements',
      'ar': 'Arabic context',
      'hi': 'Indian heritage',
      'pt': 'Brazilian warmth'
    };
    
    return culturalMap[userInfo.nativeLanguage] || 'multicultural setting';
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