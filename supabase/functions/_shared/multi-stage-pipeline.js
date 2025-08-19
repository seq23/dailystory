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

  // Stage 1: AI-Enhanced Scene Extraction & Cultural Enhancement
  static async enhanceSceneWithCulture(context) {
    const { originalText, userInfo, sessionId, pageNumber } = context;
    
    // Extract primary scene using AI enhancement
    const primaryScene = await this.extractPrimarySceneWithAI(originalText, sessionId, pageNumber, userInfo);
    
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

  // Stage 4: Enhanced Quality Optimization (Phase 3)
  static async optimizeQuality(context) {
    const { prompt, userInfo, styleFramework } = context;
    
    // Add quality enhancement terms
    const qualityTerms = MulticulturalVisualService.getQualityEnhancementTerms(userInfo);
    const negativePrompt = MulticulturalVisualService.generateCulturalNegativePrompt(userInfo);
    
    // Enhanced prompt length optimization with smart truncation
    let optimizedPrompt = prompt;
    const maxLength = this.getOptimalPromptLength(styleFramework?.complexity || 'standard');
    
    if (optimizedPrompt.length > maxLength) {
      // Smart truncation preserving key elements
      const sentences = optimizedPrompt.split(/[,.]/);
      let truncated = '';
      let currentLength = 0;
      
      for (const sentence of sentences) {
        if (currentLength + sentence.length + truncated.length > maxLength - 100) break;
        truncated += (truncated ? ', ' : '') + sentence.trim();
        currentLength += sentence.length;
      }
      
      optimizedPrompt = truncated || optimizedPrompt.substring(0, maxLength - 50);
      console.log(`📏 Smart prompt truncation: ${prompt.length} → ${optimizedPrompt.length} characters`);
    }
    
    // Enhanced negative prompt system
    const enhancedNegativePrompt = this.buildEnhancedNegativePrompt(negativePrompt, styleFramework);
    
    const finalOptimizedPrompt = `${optimizedPrompt}, ${qualityTerms}`;
    
    return {
      optimizedPrompt: finalOptimizedPrompt,
      negativePrompt: enhancedNegativePrompt,
      prompt: finalOptimizedPrompt,
      tokenEfficiency: this.calculateTokenEfficiency(prompt, finalOptimizedPrompt)
    };
  }

  // Stage 5: Enhanced Parameter Optimization (Phase 2 & 4)
  static async optimizeParameters(context) {
    const { userInfo, characters, styleFramework, sessionId, pageNumber } = context;
    
    // Import centralized parameter optimization
    const { getOptimizedParameters } = await import('../_shared/styleFrameworks.js');
    
    // Get culturally optimized parameters
    const culturalParams = MulticulturalVisualService.getOptimizedGenerationParams(userInfo);
    const defaultParams = this.getDefaultParameters();
    
    // Get framework-specific parameters with progressive scaling
    const frameworkParams = styleFramework ? styleFramework.parameters : {};
    
    // Progressive quality scaling based on difficulty (Phase 2)
    const scaledParams = this.applyProgressiveQualityScaling(frameworkParams, styleFramework?.complexity);
    
    // Merge all parameter sources (scaled framework takes precedence)
    const baseParameters = { ...defaultParams, ...culturalParams, ...scaledParams };
    
    // Enhanced seed management for character consistency (Phase 4)
    const seedContext = await this.optimizeSeedConsistency(sessionId, characters, pageNumber);
    if (seedContext.suggestedSeed) {
      baseParameters.seed = seedContext.suggestedSeed;
      console.log(`🌱 Using optimized seed for consistency: ${seedContext.suggestedSeed}`);
    }
    
    // Apply character complexity optimization
    const characterComplexity = characters?.length || 1;
    const optimizedParameters = getOptimizedParameters(
      { parameters: baseParameters }, 
      characterComplexity
    );
    
    console.log(`⚙️ Enhanced parameters for ${characterComplexity} character(s):`, {
      ...optimizedParameters,
      seedStrategy: seedContext.strategy,
      qualityTier: styleFramework?.complexity || 'standard'
    });
    
    return {
      parameters: optimizedParameters,
      seedContext
    };
  }

  // Helper methods

  // AI-Enhanced Primary Scene Extraction with Fallback
  static async extractPrimarySceneWithAI(storyText, sessionId, pageNumber, userInfo) {
    try {
      // Try AI-powered scene extraction first
      const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/extract-story-elements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
        },
        body: JSON.stringify({
          storyText: storyText,
          pageNumber: pageNumber || 1,
          totalPages: 10,
          difficultyLevel: userInfo?.readingLevel || 'medium',
          sessionId: sessionId || 'pipeline-session',
          userInfo: userInfo
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.enhancedDescription) {
          console.log(`🤖 AI-Enhanced Scene from Pipeline: ${data.enhancedDescription.substring(0, 100)}...`);
          return data.enhancedDescription;
        }
      }
    } catch (error) {
      console.log(`⚠️ AI scene extraction failed in pipeline, using fallback: ${error.message}`);
    }

    // Fallback to simplified scene extraction
    return this.extractPrimarySceneFallback(storyText);
  }

  // Fallback scene extraction without bias
  static extractPrimarySceneFallback(storyText) {
    const sentences = storyText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const actionWords = ['walk', 'run', 'play', 'look', 'see', 'go', 'find', 'hold', 'sit', 'stand', 'move', 'explore', 'discover'];
    
    let bestScene = sentences[0] || storyText;
    let highestScore = 0;
    
    for (const sentence of sentences) {
      const words = sentence.toLowerCase().split(/\s+/);
      let score = words.filter(word => actionWords.includes(word)).length;
      
      // Boost for emotional and visual content
      if (/\b(happy|excited|colorful|bright|beautiful)\b/i.test(sentence)) score += 2;
      
      // Slight reduction for purely introductory content
      if (/\b(once upon|there was|lived in)\b/i.test(sentence)) score -= 1;
      
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
    if (userInfo.name) {
      characters.push({
        name: userInfo.name,
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
      cfgScale: 3.0,
      steps: 8,
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

  // Phase 3: Enhanced Token Efficiency Methods
  static getOptimalPromptLength(complexity) {
    const lengthLimits = {
      'minimal': 2200,
      'standard': 2600,
      'high': 3000,
      'very_high': 3400
    };
    return lengthLimits[complexity] || 2600;
  }

  static buildEnhancedNegativePrompt(baseNegative, styleFramework) {
    const universalNegatives = [
      'text, letters, words, watermark, logo, signature',
      'blurry, distorted, deformed, low quality',
      'inappropriate content, violence, scary elements'
    ];
    
    const styleSpecificNegatives = {
      '3d_smooth': 'flat 2D, hand-drawn, sketch style',
      'painterly': '3D render, photorealistic, plastic texture',
      'advanced_digital_painting': 'amateur artwork, simple style',
      'masterful_artistic_technique': 'beginner art, childish drawing'
    };
    
    let enhancedNegative = baseNegative || '';
    enhancedNegative += ', ' + universalNegatives.join(', ');
    
    if (styleFramework?.rendering && styleSpecificNegatives[styleFramework.rendering]) {
      enhancedNegative += ', ' + styleSpecificNegatives[styleFramework.rendering];
    }
    
    return enhancedNegative;
  }

  static calculateTokenEfficiency(originalPrompt, optimizedPrompt) {
    const originalTokens = Math.ceil(originalPrompt.length / 4); // Rough token estimate
    const optimizedTokens = Math.ceil(optimizedPrompt.length / 4);
    return {
      originalTokens,
      optimizedTokens,
      efficiency: ((originalTokens - optimizedTokens) / originalTokens * 100).toFixed(1) + '%'
    };
  }

  // Phase 2: Progressive Quality Scaling
  static applyProgressiveQualityScaling(baseParams, complexity) {
    const qualityMultipliers = {
      'minimal': { cfgScale: 1.0, steps: 1.0 },
      'standard': { cfgScale: 1.1, steps: 1.1 },
      'high': { cfgScale: 1.2, steps: 1.3 },
      'very_high': { cfgScale: 1.3, steps: 1.5 }
    };
    
    const multiplier = qualityMultipliers[complexity] || qualityMultipliers['standard'];
    
    return {
      ...baseParams,
      cfgScale: Math.min(baseParams.cfgScale * multiplier.cfgScale, 4.0),
      steps: Math.min(Math.round(baseParams.steps * multiplier.steps), 15)
    };
  }

  // Phase 4: Enhanced Seed Management
  static async optimizeSeedConsistency(sessionId, characters, pageNumber) {
    const seedHistory = this.getSeedHistory(sessionId);
    const characterSeeds = this.getCharacterSeeds(sessionId, characters);
    
    // Strategy 1: Reuse character seed if same character appears
    if (characters && characters.length === 1) {
      const primaryChar = characters[0];
      const existingSeed = characterSeeds[primaryChar.name];
      if (existingSeed && pageNumber > 1) {
        return {
          strategy: 'character_consistency',
          suggestedSeed: existingSeed,
          confidence: 0.9
        };
      }
    }
    
    // Strategy 2: Use best performing seed from recent pages
    if (seedHistory.length > 0 && pageNumber > 3) {
      const recentSeeds = seedHistory.slice(-3);
      const bestSeed = recentSeeds.reduce((best, current) => 
        current.qualityScore > best.qualityScore ? current : best
      );
      
      if (bestSeed.qualityScore > 85) {
        return {
          strategy: 'high_quality_reuse',
          suggestedSeed: bestSeed.seed,
          confidence: 0.7
        };
      }
    }
    
    // Strategy 3: Generate new seed with pattern optimization
    const newSeed = this.generateOptimizedSeed(sessionId, pageNumber);
    return {
      strategy: 'optimized_new',
      suggestedSeed: newSeed,
      confidence: 0.5
    };
  }

  static getSeedHistory(sessionId) {
    // Simple in-memory storage for demo
    if (!this.seedHistoryCache) this.seedHistoryCache = new Map();
    return this.seedHistoryCache.get(sessionId) || [];
  }

  static getCharacterSeeds(sessionId, characters) {
    // Extract character seeds from state management
    const seeds = {};
    if (characters) {
      characters.forEach(char => {
        if (char.seed) seeds[char.name] = char.seed;
      });
    }
    return seeds;
  }

  static generateOptimizedSeed(sessionId, pageNumber) {
    // Generate deterministic but varied seeds based on session and page
    const baseHash = this.simpleHash(sessionId + pageNumber);
    return Math.abs(baseHash) % 2147483647; // Max 32-bit signed int
  }

  static simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }
}