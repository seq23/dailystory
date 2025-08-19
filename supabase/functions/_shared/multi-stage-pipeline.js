// Multi-Stage Enhancement Pipeline - Consolidated Edition
// Single source of truth for all extraction and enhancement logic

// Import cultural visual service
import { MulticulturalVisualService } from './cultural-visual-service.js';

export class MultiStageEnhancementPipeline {
  static async processThroughPipeline(
    storyText,
    userInfo,
    sessionId,
    pageNumber,
    totalPages = 10,
    enhancementLevel = 'full' // 'minimal' for Tier 2.5, 'full' for Tier 1
  ) {
    const startTime = Date.now();
    const stagesCompleted = [];
    const fallbacksUsed = [];
    
    console.log(`🔄 Starting ${enhancementLevel} enhancement pipeline for page ${pageNumber}`);
    
    // Initial context
    let pipelineContext = {
      originalText: storyText,
      userInfo,
      sessionId,
      pageNumber,
      totalPages,
      enhancementLevel,
      sceneDescription: '',
      characters: [],
      animals: [],
      objects: [],
      styleElements: [],
      prompt: '',
      negativePrompt: '',
      parameters: this.getDefaultParameters(),
      qualityScore: 0
    };

    try {
      if (enhancementLevel === 'minimal') {
        // Tier 2.5: Minimal hardcoded processing
        console.log('🎯 Tier 2.5: Minimal processing mode');
        pipelineContext.sceneDescription = this.extractPrimarySceneFallback(storyText);
        pipelineContext.characters = this.detectCharactersSimple(storyText, userInfo);
        pipelineContext.prompt = this.createFallbackPrompt(storyText, userInfo);
        pipelineContext.negativePrompt = this.buildStandardizedNegativePrompt(userInfo);
        stagesCompleted.push('Minimal Processing');
      } else {
        // Tier 1: Full AI-enhanced processing
        console.log('🎯 Stage 1: AI Scene & Cultural Enhancement');
        const stage1Result = await this.enhanceSceneWithCulture(pipelineContext);
        pipelineContext = { ...pipelineContext, ...stage1Result };
        stagesCompleted.push('AI Scene & Cultural Enhancement');

        console.log('🎭 Stage 2: Enhanced Character Detection');
        const stage2Result = await this.detectAndEnhanceCharacters(pipelineContext);
        pipelineContext = { ...pipelineContext, ...stage2Result };
        stagesCompleted.push('Enhanced Character Detection');

        console.log('🎨 Stage 3: Style Framework');
        const stage3Result = await this.applyStyleFramework(pipelineContext);
        pipelineContext = { ...pipelineContext, ...stage3Result };
        stagesCompleted.push('Style Framework');

        console.log('✨ Stage 4: Quality Optimization');
        const stage4Result = await this.optimizeQuality(pipelineContext);
        pipelineContext = { ...pipelineContext, ...stage4Result };
        stagesCompleted.push('Quality Optimization');

        console.log('⚙️ Stage 5: Parameter Optimization');
        const stage5Result = await this.optimizeParameters(pipelineContext);
        pipelineContext = { ...pipelineContext, ...stage5Result };
        stagesCompleted.push('Parameter Optimization');
      }

    } catch (error) {
      console.error('❌ Pipeline stage failed:', error);
      fallbacksUsed.push(error.message);
      
      // Fallback to basic enhancement
      pipelineContext.prompt = this.createFallbackPrompt(storyText, userInfo);
      pipelineContext.negativePrompt = this.buildStandardizedNegativePrompt(userInfo);
      pipelineContext.parameters = this.getDefaultParameters();
    }

    const processingTime = Date.now() - startTime;
    
    const result = {
      finalPrompt: pipelineContext.prompt,
      negativePrompt: pipelineContext.negativePrompt,
      enhancedCharacters: pipelineContext.characters,
      animals: pipelineContext.animals,
      objects: pipelineContext.objects,
      optimizedParameters: pipelineContext.parameters,
      qualityScore: this.calculateQualityScore(pipelineContext),
      stagesCompleted,
      fallbacksUsed,
      processingTime,
      enhancementLevel
    };

    console.log(`🏁 ${enhancementLevel} pipeline completed in ${processingTime}ms. Quality score: ${result.qualityScore}/100`);
    
    return result;
  }

  // Stage 1: AI-Enhanced Scene Extraction & Cultural Enhancement
  static async enhanceSceneWithCulture(context) {
    const { originalText, userInfo, sessionId, pageNumber } = context;
    
    // Extract primary scene using AI enhancement
    const primaryScene = await this.extractPrimarySceneWithAI(originalText, sessionId, pageNumber, userInfo);
    
    // Add cultural context
    const culturalSetting = MulticulturalVisualService.generateCulturalSetting(userInfo);
    const culturalProfile = MulticulturalVisualService.getCulturalVisualProfile(userInfo?.nativeLanguage || 'en');
    
    const enhancedScene = `${primaryScene}, ${culturalSetting}, ${culturalProfile.culturalElements.slice(0, 2).join(', ')}`;
    
    return {
      sceneDescription: enhancedScene,
      culturalContext: culturalProfile
    };
  }

  // Stage 2: Enhanced Character Detection & Enhancement
  static async detectAndEnhanceCharacters(context) {
    const { originalText, userInfo } = context;
    
    const detectionResult = this.detectCharactersInText(originalText, userInfo);
    
    // Generate character descriptions with cultural consistency
    const characterDescriptions = detectionResult.characters.map(char => {
      return `${char.name}: ${char.physicalTraits}`;
    });
    
    return {
      characters: detectionResult.characters,
      animals: detectionResult.animals,
      objects: detectionResult.objects,
      characterDescriptions: characterDescriptions.join(', ')
    };
  }

  // Stage 3: Style Framework Application
  static async applyStyleFramework(context) {
    const { userInfo, pageNumber, totalPages, sceneDescription } = context;
    
    // Import centralized style framework
    const { getStyleFramework, buildCompletePrompt } = await import('./styleFrameworks.js');
    
    const difficulty = userInfo?.readingLevel || 'medium';
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

  // Stage 4: Enhanced Quality Optimization
  static async optimizeQuality(context) {
    const { prompt, userInfo, styleFramework } = context;
    
    // Add quality enhancement terms
    const qualityTerms = MulticulturalVisualService.getQualityEnhancementTerms(userInfo);
    
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
    
    // Standardized negative prompt system
    const enhancedNegativePrompt = this.buildStandardizedNegativePrompt(userInfo);
    
    const finalOptimizedPrompt = `${optimizedPrompt}, ${qualityTerms}`;
    
    return {
      optimizedPrompt: finalOptimizedPrompt,
      negativePrompt: enhancedNegativePrompt,
      prompt: finalOptimizedPrompt,
      tokenEfficiency: this.calculateTokenEfficiency(prompt, finalOptimizedPrompt)
    };
  }

  // Stage 5: Enhanced Parameter Optimization
  static async optimizeParameters(context) {
    const { userInfo, characters, styleFramework, sessionId, pageNumber } = context;
    
    // Import centralized parameter optimization
    const { getOptimizedParameters } = await import('./styleFrameworks.js');
    
    // Get culturally optimized parameters
    const culturalParams = MulticulturalVisualService.getOptimizedGenerationParams(userInfo);
    const defaultParams = this.getDefaultParameters();
    
    // Get framework-specific parameters with progressive scaling
    const frameworkParams = styleFramework ? styleFramework.parameters : {};
    
    // Progressive quality scaling based on difficulty
    const scaledParams = this.applyProgressiveQualityScaling(frameworkParams, styleFramework?.complexity);
    
    // Merge all parameter sources
    const baseParameters = { ...defaultParams, ...culturalParams, ...scaledParams };
    
    // Enhanced seed management for character consistency
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

  // CONSOLIDATED EXTRACTION METHODS

  // Direct AI-powered scene extraction (no external calls)
  static async extractPrimarySceneWithAI(storyText, sessionId, pageNumber, userInfo) {
    console.log(`🤖 Using integrated AI for scene extraction: "${storyText.substring(0, 60)}..."`);
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.log(`⚠️ No OpenAI API key, using fallback extraction`);
      return this.extractPrimarySceneFallback(storyText);
    }
    
    try {
      // Build character context for consistency
      const characterContext = userInfo?.name ? 
        `\n\nMain Character: ${userInfo.name} (${userInfo.avatar?.type || 'child'} with ${userInfo.avatar?.skinTone || 'medium'} skin tone)` : '';
      
      const systemPrompt = `Extract visual elements from children's story text into a prompt-ready format.

Focus on:
- Visual descriptors (colors, sizes, textures)
- Key objects and characters  
- Setting and atmosphere
- Actions and emotions

Output format: Single descriptive sentence ready for image generation.

Example input: "Lucy found a sparkly blue shell on the sandy beach"
Example output: "young girl discovering shiny blue seashell on sunny beach, warm golden sand, ocean waves in background"

Keep prompts:
- Under 200 characters when possible
- Focused on visual elements only
- Child-appropriate and wholesome
- Ready to append to style suffixes`;

      const userPrompt = `Text: "${storyText}"${characterContext}

Transform this into a visual prompt sentence for page ${pageNumber || 1}. Consider character continuity.`;

      // Call OpenAI directly with timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('OpenAI timeout')), 8000);
      });

      const response = await Promise.race([
        fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            max_tokens: 150
          }),
        }),
        timeoutPromise
      ]);

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const enhancedScene = data.choices[0].message.content.trim();
      
      console.log(`🤖 AI-Enhanced Scene: ${enhancedScene.substring(0, 100)}...`);
      return enhancedScene;
      
    } catch (error) {
      console.log(`⚠️ AI scene extraction failed, using fallback: ${error.message}`);
      return this.extractPrimarySceneFallback(storyText);
    }
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

  // CONSOLIDATED CHARACTER, ANIMAL, AND OBJECT DETECTION
  static detectCharactersInText(text, userInfo) {
    const characters = [];
    const animals = [];
    const objects = [];
    const lowerText = text.toLowerCase();
    
    // Primary character
    if (userInfo?.name) {
      characters.push({
        name: userInfo.name,
        type: 'primary',
        physicalTraits: MulticulturalVisualService.generateCulturalCharacterDescription(userInfo)
      });
    }
    
    // Family members detection (consolidated from extract-story-elements)
    const familyPatterns = {
      'mother|mom|mama': { name: 'Mother', relationship: 'mother' },
      'father|dad|papa': { name: 'Father', relationship: 'father' },
      'sister|sis': { name: 'Sister', relationship: 'sister' },
      'brother|bro': { name: 'Brother', relationship: 'brother' },
      'grandmother|grandma': { name: 'Grandmother', relationship: 'grandmother' },
      'grandfather|grandpa': { name: 'Grandfather', relationship: 'grandfather' }
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

    // Animal detection (consolidated from multiple sources)
    const animalTerms = [
      'cat', 'kitten', 'kitty', 'dog', 'puppy', 'doggy', 'bird', 'robin', 'sparrow',
      'rabbit', 'bunny', 'bear', 'teddy', 'tiger', 'lion', 'elephant', 'horse',
      'duck', 'fish', 'goldfish', 'frog', 'toad', 'turtle', 'mouse', 'hamster',
      'owl', 'eagle', 'fox', 'deer', 'squirrel', 'butterfly'
    ];
    
    for (const animal of animalTerms) {
      if (lowerText.includes(animal)) {
        if (!animals.includes(animal)) {
          animals.push(animal);
        }
      }
    }

    // Object detection (consolidated from visual keywords)
    const objectTerms = [
      'ball', 'toy', 'book', 'flower', 'tree', 'house', 'car', 'bike', 'bicycle',
      'kite', 'swing', 'slide', 'balloon', 'castle', 'tower', 'boat', 'plane',
      'train', 'bus', 'truck', 'hat', 'shoes', 'backpack', 'bag', 'coat', 'dress'
    ];
    
    for (const obj of objectTerms) {
      if (lowerText.includes(obj)) {
        if (!objects.includes(obj)) {
          objects.push(obj);
        }
      }
    }
    
    return { characters, animals, objects };
  }

  // Simple character detection for Tier 2.5
  static detectCharactersSimple(text, userInfo) {
    const characters = [];
    
    if (userInfo?.name) {
      characters.push({
        name: userInfo.name,
        type: 'primary',
        physicalTraits: `${userInfo.avatar?.type || 'child'} with ${userInfo.avatar?.skinTone || 'medium'} skin`
      });
    }
    
    return characters;
  }

  static generateFamilyMemberTraits(userInfo, relationship) {
    const culturalProfile = MulticulturalVisualService.getCulturalVisualProfile(userInfo?.nativeLanguage || 'en');
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

  // STANDARDIZED NEGATIVE PROMPT SYSTEM
  static buildStandardizedNegativePrompt(userInfo) {
    // Use the standardized 95-word negative prompt for all tiers
    let standardNegative = 'NO TEXT, no letters, no words, no writing, no signs, no symbols, ugly, deformed, bad anatomy, extra limb, mutation, poorly drawn, cropped, lowres, worst quality, low quality, blurry, text, error, adult, mature, violence, scary, dark, inappropriate, nsfw, suggestive, weapons, photorealistic, anime, copyrighted characters, brand logos';

    // Avatar-based character consistency enforcement
    if (userInfo?.avatar?.type === 'girl') {
      standardNegative += ', boy character, male character, masculine features, he, him, his, male clothing, boy hairstyle';
    } else if (userInfo?.avatar?.type === 'boy') {
      standardNegative += ', girl character, female character, feminine features, she, her, hers, female clothing, girl hairstyle, dress, skirt';
    }

    console.log(`📝 Using standardized negative prompt (~95 words) for token efficiency`);
    return standardNegative;
  }

  // UTILITY METHODS
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

  static getOptimalPromptLength(complexity) {
    const lengthLimits = {
      'minimal': 2200,
      'standard': 2600,
      'high': 3000,
      'very_high': 3400
    };
    return lengthLimits[complexity] || 2600;
  }

  static calculateTokenEfficiency(originalPrompt, optimizedPrompt) {
    const originalTokens = Math.ceil(originalPrompt.length / 4);
    const optimizedTokens = Math.ceil(optimizedPrompt.length / 4);
    return {
      originalTokens,
      optimizedTokens,
      efficiency: ((originalTokens - optimizedTokens) / originalTokens * 100).toFixed(1) + '%'
    };
  }

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

  // SEED MANAGEMENT SYSTEM
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
    if (!this.seedHistoryCache) this.seedHistoryCache = new Map();
    return this.seedHistoryCache.get(sessionId) || [];
  }

  static getCharacterSeeds(sessionId, characters) {
    const seeds = {};
    if (characters) {
      characters.forEach(char => {
        if (char.seed) seeds[char.name] = char.seed;
      });
    }
    return seeds;
  }

  static generateOptimizedSeed(sessionId, pageNumber) {
    const baseHash = this.simpleHash(sessionId + pageNumber);
    return Math.abs(baseHash) % 2147483647;
  }

  static simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  }
}