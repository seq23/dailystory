// Multi-Stage Enhancement Pipeline - Edge Function Implementation
// Serverless version of the enhancement system

// Import cultural visual service
import { MulticulturalVisualService } from './cultural-visual-service.js';

export class MultiStageEnhancementPipeline {
  static async processThroughPipeline(
    storyText,
    userInfo,
    sessionId,
    pageNumber,
    totalPages = 10
  ) {
    const startTime = Date.now();
    const stagesCompleted = [];
    const fallbacksUsed = [];
    
    console.log(`🔄 Starting multi-stage enhancement pipeline for page ${pageNumber}`);
    
    // Initial context
    let pipelineContext = {
      originalText: storyText,
      userInfo,
      sessionId,
      pageNumber,
      totalPages,
      sceneDescription: '',
      characters: [],
      styleElements: [],
      prompt: '',
      parameters: this.getDefaultParameters(),
      qualityScore: 0
    };

    try {
      // Stage 1: Scene Extraction & Cultural Enhancement
      console.log('🎯 Stage 1: Scene & Cultural Enhancement');
      const stage1Result = await this.enhanceSceneWithCulture(pipelineContext);
      pipelineContext = { ...pipelineContext, ...stage1Result };
      stagesCompleted.push('Scene & Cultural Enhancement');

      // Stage 2: Character Detection & Consistency
      console.log('🎭 Stage 2: Character Detection');
      const stage2Result = await this.detectAndEnhanceCharacters(pipelineContext);
      pipelineContext = { ...pipelineContext, ...stage2Result };
      stagesCompleted.push('Character Detection');

      // Stage 3: Style Framework Application
      console.log('🎨 Stage 3: Style Framework');
      const stage3Result = await this.applyStyleFramework(pipelineContext);
      pipelineContext = { ...pipelineContext, ...stage3Result };
      stagesCompleted.push('Style Framework');

      // Stage 4: Quality Optimization
      console.log('✨ Stage 4: Quality Optimization');
      const stage4Result = await this.optimizeQuality(pipelineContext);
      pipelineContext = { ...pipelineContext, ...stage4Result };
      stagesCompleted.push('Quality Optimization');

      // Stage 5: Parameter Optimization
      console.log('⚙️ Stage 5: Parameter Optimization');
      const stage5Result = await this.optimizeParameters(pipelineContext);
      pipelineContext = { ...pipelineContext, ...stage5Result };
      stagesCompleted.push('Parameter Optimization');

    } catch (error) {
      console.error('❌ Pipeline stage failed:', error);
      fallbacksUsed.push(error.message);
      
      // Fallback to basic enhancement
      pipelineContext.prompt = this.createFallbackPrompt(storyText, userInfo);
      pipelineContext.parameters = this.getDefaultParameters();
    }

    const processingTime = Date.now() - startTime;
    
    const result = {
      finalPrompt: pipelineContext.prompt,
      enhancedCharacters: pipelineContext.characters,
      optimizedParameters: pipelineContext.parameters,
      qualityScore: this.calculateQualityScore(pipelineContext),
      stagesCompleted,
      fallbacksUsed,
      processingTime
    };

    console.log(`🏁 Pipeline completed in ${processingTime}ms. Quality score: ${result.qualityScore}/100`);
    
    return result;
  }

  // Stage 1: Scene Extraction & Cultural Enhancement
  static async enhanceSceneWithCulture(context) {
    const { originalText, userInfo } = context;
    
    // Extract primary scene
    const primaryScene = this.extractPrimaryScene(originalText);
    
    // Add cultural context
    const culturalSetting = MulticulturalVisualService.generateCulturalSetting(userInfo);
    const culturalProfile = MulticulturalVisualService.getCulturalVisualProfile(userInfo.nativeLanguage);
    
    const enhancedScene = `${primaryScene}, ${culturalSetting}, ${culturalProfile.culturalElements.slice(0, 2).join(', ')}`;
    
    return {
      sceneDescription: enhancedScene,
      culturalContext: culturalProfile
    };
  }

  // Stage 2: Character Detection & Enhancement
  static async detectAndEnhanceCharacters(context) {
    const { originalText, userInfo } = context;
    
    const detectedCharacters = this.detectCharactersInText(originalText, userInfo);
    
    // Generate character descriptions with cultural consistency
    const characterDescriptions = detectedCharacters.map(char => {
      return `${char.name}: ${char.physicalTraits}`;
    });
    
    return {
      characters: detectedCharacters,
      characterDescriptions: characterDescriptions.join(', ')
    };
  }

  // Stage 3: Style Framework Application
  static async applyStyleFramework(context) {
    const { userInfo, pageNumber, totalPages, sceneDescription } = context;
    
    // Import centralized style framework
    const { getStyleFramework, buildCompletePrompt } = await import('../_shared/styleFrameworks.js');
    
    const difficulty = userInfo.readingLevel || 'medium';
    const framework = getStyleFramework(difficulty);
    
    console.log(`🎨 Applying ${framework.name} style for difficulty: ${difficulty}`);
    
    // Analyze emotional content
    const emotionalContext = this.analyzeEmotionalContent(sceneDescription);
    
    // Build complete prompt using centralized framework
    const finalPrompt = buildCompletePrompt(
      framework,
      sceneDescription,
      context.characterDescriptions || '',
      emotionalContext
    );
    
    return {
      styleFramework: framework,
      styleElements: [framework.artStyle, framework.quality, emotionalContext],
      prompt: finalPrompt
    };
  }

  // Stage 4: Quality Optimization
  static async optimizeQuality(context) {
    const { prompt, userInfo } = context;
    
    // Add quality enhancement terms
    const qualityTerms = MulticulturalVisualService.getQualityEnhancementTerms(userInfo);
    const negativePrompt = MulticulturalVisualService.generateCulturalNegativePrompt(userInfo);
    
    // Optimize prompt length
    let optimizedPrompt = prompt;
    if (optimizedPrompt.length > 2800) {
      // Simple truncation with quality preservation
      optimizedPrompt = optimizedPrompt.substring(0, 2500) + '...';
      console.log(`📏 Prompt truncated from ${prompt.length} to ${optimizedPrompt.length} characters`);
    }
    
    const finalOptimizedPrompt = `${optimizedPrompt}, ${qualityTerms}`;
    
    return {
      optimizedPrompt: finalOptimizedPrompt,
      negativePrompt,
      prompt: finalOptimizedPrompt
    };
  }

  // Stage 5: Parameter Optimization
  static async optimizeParameters(context) {
    const { userInfo, characters, styleFramework } = context;
    
    // Import centralized parameter optimization
    const { getOptimizedParameters } = await import('../_shared/styleFrameworks.js');
    
    // Get culturally optimized parameters
    const culturalParams = MulticulturalVisualService.getOptimizedGenerationParams(userInfo);
    const defaultParams = this.getDefaultParameters();
    
    // Get framework-specific parameters
    const frameworkParams = styleFramework ? styleFramework.parameters : {};
    
    // Merge all parameter sources (framework takes precedence)
    const baseParameters = { ...defaultParams, ...culturalParams, ...frameworkParams };
    
    // Apply character complexity optimization
    const characterComplexity = characters?.length || 1;
    const optimizedParameters = getOptimizedParameters(
      { parameters: baseParameters }, 
      characterComplexity
    );
    
    console.log(`⚙️ Optimized parameters for ${characterComplexity} character(s):`, optimizedParameters);
    
    return {
      parameters: optimizedParameters
    };
  }

  // Helper methods

  static extractPrimaryScene(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const actionWords = ['walk', 'run', 'play', 'look', 'see', 'go', 'find', 'hold', 'sit', 'stand', 'move'];
    
    let bestScene = sentences[0] || text;
    let highestScore = 0;
    
    for (const sentence of sentences) {
      const words = sentence.toLowerCase().split(/\s+/);
      const score = words.filter(word => actionWords.includes(word)).length;
      
      if (score > highestScore) {
        highestScore = score;
        bestScene = sentence.trim();
      }
    }
    
    return bestScene;
  }

  static detectCharactersInText(text, userInfo) {
    const characters = [];
    const lowerText = text.toLowerCase();
    
    // Primary character
    if (userInfo.childName) {
      characters.push({
        name: userInfo.childName,
        type: 'primary',
        physicalTraits: MulticulturalVisualService.generateCulturalCharacterDescription(userInfo)
      });
    }
    
    // Family members
    const familyPatterns = {
      'mother|mom|mama': { name: 'Mother', relationship: 'mother' },
      'father|dad|papa': { name: 'Father', relationship: 'father' },
      'sister|sis': { name: 'Sister', relationship: 'sister' },
      'brother|bro': { name: 'Brother', relationship: 'brother' },
      'grandmother|grandma': { name: 'Grandmother', relationship: 'grandmother' }
    };
    
    for (const [pattern, info] of Object.entries(familyPatterns)) {
      const regex = new RegExp(`\\b(${pattern})\\b`, 'i');
      if (regex.test(text)) {
        characters.push({
          name: info.name,
          type: 'family',
          relationship: info.relationship,
          physicalTraits: this.generateFamilyMemberTraits(userInfo, info.relationship)
        });
      }
    }
    
    return characters;
  }

  static generateFamilyMemberTraits(userInfo, relationship) {
    const culturalProfile = MulticulturalVisualService.getCulturalVisualProfile(userInfo.nativeLanguage);
    const baseTrait = culturalProfile.skinTones[0]; // Use consistent skin tone for family
    
    if (relationship === 'mother' || relationship === 'father') {
      return `${baseTrait}, nurturing expression, ${culturalProfile.hairStyles[0]}`;
    } else if (relationship.includes('grand')) {
      return `${baseTrait}, wise kind eyes, gray hair`;
    } else {
      return `${baseTrait}, youthful appearance, ${culturalProfile.hairStyles[1]}`;
    }
  }

  static analyzeEmotionalContent(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('happy') || lowerText.includes('joy') || lowerText.includes('smile')) {
      return 'warm bright lighting, joyful composition, cheerful colors';
    } else if (lowerText.includes('adventure') || lowerText.includes('explore')) {
      return 'dramatic adventure lighting, dynamic composition, bold colors';
    } else if (lowerText.includes('family') || lowerText.includes('home')) {
      return 'warm intimate lighting, cozy composition, comfortable colors';
    } else {
      return 'soft natural lighting, balanced composition, pleasant colors';
    }
  }

  static getDefaultParameters() {
    return {
      model: "runware:100@1",
      cfgScale: 1.5,
      steps: 3,
      scheduler: "FlowMatchEulerDiscreteScheduler",
      strength: 0.8,
      width: 1024,
      height: 1024
    };
  }

  static createFallbackPrompt(text, userInfo) {
    const culturalDesc = MulticulturalVisualService.generateCulturalCharacterDescription(userInfo);
    return `${text}, ${culturalDesc}, children's book illustration, vibrant colors, high quality`;
  }

  static calculateQualityScore(context) {
    let score = 60; // Base score
    
    if (context.characters && context.characters.length > 0) score += 15;
    if (context.culturalContext) score += 10;
    if (context.styleElements && context.styleElements.length > 0) score += 10;
    if (context.optimizedPrompt) score += 5;
    
    return Math.min(score, 100);
  }
}