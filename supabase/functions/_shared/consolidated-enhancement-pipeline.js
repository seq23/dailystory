// CONSOLIDATED ENHANCEMENT PIPELINE - Master Integration (All Phases Complete)
// Integrates: Phase 1 (Difficulty Mapping), Phase 2 (Quality Standards), 
// Phase 3 (Prompt Optimization), Phase 4 (Cultural Fixes), Phase 4.7 (Consolidation)

import { DifficultyLevelMapper } from './DifficultyLevelMapper.js';
import { QualityStandardizationEngine } from './quality-standardization.js';
import { PromptOptimizationEngine } from './prompt-optimization.js';
import { CulturalRepresentationEngine } from './cultural-representation-fixes.js';

export class ConsolidatedEnhancementPipeline {
  // ========== ABSORBED MULTICULTURAL VISUAL SERVICE LOGIC ==========
  static CULTURAL_VISUAL_PROFILES = {
    'ar': {
      skinTones: [
        'fair olive skin', 'light honey skin', 'golden bronze skin', 'warm olive skin', 
        'deep amber skin', 'honey-toned skin', 'rich caramel skin', 'warm mahogany skin',
        'deep bronze skin', 'rich mocha skin', 'dark olive skin', 'deep umber skin'
      ],
      hairStyles: ['flowing dark wavy hair', 'elegant braided hair', 'thick curly dark hair', 'straight black hair with silk scarf', 'traditional updo with decorative pins'],
      facialFeatures: ['expressive dark eyes', 'elegant eyebrows', 'warm smile', 'gentle facial features', 'kind expression'],
      culturalElements: ['traditional Arabic patterns', 'geometric decorations', 'ornate designs', 'cultural jewelry', 'henna art'],
      familyStructure: ['extended family gathering', 'grandmother telling stories', 'multiple generations together', 'community elders', 'family celebration'],
      settings: ['traditional Arabic architecture', 'beautiful mosque courtyards', 'desert oasis', 'bustling marketplace', 'ornate gardens with fountains'],
      clothing: ['traditional thobe', 'modern modest clothing', 'festive cultural dress', 'elegant hijab styles', 'contemporary Middle Eastern fashion'],
      celebrations: ['Eid celebrations', 'traditional wedding', 'family feast', 'cultural festival', 'community gathering'],
      negativePrompts: ['stereotypical', 'caricature', 'offensive', 'inaccurate cultural representation', 'negative stereotypes']
    },
    'es': {
      skinTones: [
        'fair olive skin', 'light tan skin', 'warm caramel skin', 'sun-kissed bronze skin', 
        'rich copper skin', 'golden olive skin', 'warm mahogany skin', 'deep bronze skin',
        'rich mocha skin', 'deep caramel skin', 'dark bronze skin', 'rich umber skin'
      ],
      hairStyles: ['thick wavy dark hair', 'long straight black hair', 'curly brown hair', 'braided hair with colorful ribbons', 'natural wavy hair'],
      facialFeatures: ['warm brown eyes', 'expressive eyebrows', 'radiant smile', 'strong facial features', 'joyful expression'],
      culturalElements: ['vibrant colors', 'traditional patterns', 'festive decorations', 'cultural art', 'family symbols'],
      familyStructure: ['large extended family', 'abuela figure', 'many cousins playing', 'family celebration', 'multigenerational gathering'],
      settings: ['colorful Latin neighborhood', 'beautiful plaza', 'family courtyard', 'vibrant market', 'traditional hacienda'],
      clothing: ['traditional dress', 'colorful festival clothing', 'modern Latin fashion', 'cultural celebration attire', 'family gathering clothes'],
      celebrations: ['quinceañera', 'Day of the Dead celebration', 'family fiesta', 'cultural festival', 'traditional wedding'],
      negativePrompts: ['stereotypical', 'caricature', 'offensive portrayal', 'inaccurate representation', 'negative stereotypes']
    },
    'zh': {
      skinTones: [
        'porcelain skin', 'fair peachy skin', 'light honey skin', 'warm honey skin', 
        'golden tan skin', 'light olive skin', 'soft peachy skin', 'medium tan skin',
        'warm bronze skin', 'deep honey skin', 'rich tan skin', 'deep bronze skin'
      ],
      hairStyles: ['straight black hair', 'elegant hair bun', 'hair with traditional ornaments', 'sleek bob cut', 'braided hair with silk ribbons'],
      facialFeatures: ['almond-shaped eyes', 'delicate features', 'gentle smile', 'serene expression', 'kind eyes'],
      culturalElements: ['traditional Chinese patterns', 'dragon motifs', 'cherry blossoms', 'calligraphy art', 'jade jewelry'],
      familyStructure: ['multigenerational family', 'grandparents with wisdom', 'respect for elders', 'family harmony', 'traditional family structure'],
      settings: ['traditional Chinese garden', 'pagoda architecture', 'bamboo forest', 'beautiful temple', 'modern Chinese cityscape'],
      clothing: ['traditional qipao', 'modern Chinese fashion', 'festival clothing', 'elegant silk dress', 'contemporary Asian style'],
      celebrations: ['Chinese New Year', 'Moon Festival', 'traditional tea ceremony', 'family reunion', 'cultural festival'],
      negativePrompts: ['stereotypical', 'caricature', 'offensive portrayal', 'inaccurate cultural elements', 'negative stereotypes']
    },
    'hi': {
      skinTones: [
        'fair wheat skin', 'light golden skin', 'warm wheat skin', 'golden brown skin', 
        'warm amber skin', 'rich mahogany skin', 'deep bronze skin', 'warm caramel skin',
        'deep amber skin', 'rich mocha skin', 'dark bronze skin', 'deep umber skin'
      ],
      hairStyles: ['long braided hair', 'hair decorated with flowers', 'traditional hair jewelry', 'elegant bun with ornaments', 'flowing dark hair'],
      facialFeatures: ['expressive dark eyes', 'elegant eyebrows', 'warm smile', 'gentle features', 'kind expression'],
      culturalElements: ['traditional Indian patterns', 'henna designs', 'colorful rangoli', 'spiritual symbols', 'cultural jewelry'],
      familyStructure: ['joint family system', 'multiple generations', 'traditional family roles', 'community celebration', 'extended family gathering'],
      settings: ['beautiful Indian architecture', 'colorful temple', 'traditional courtyard', 'vibrant marketplace', 'modern Indian home'],
      clothing: ['traditional sari', 'elegant lehenga', 'modern Indian fashion', 'festival clothing', 'contemporary Indian style'],
      celebrations: ['Diwali celebration', 'traditional wedding', 'Holi festival', 'family gathering', 'cultural ceremony'],
      negativePrompts: ['stereotypical', 'caricature', 'offensive portrayal', 'inaccurate cultural representation', 'negative stereotypes']
    },
    'pt': {
      skinTones: [
        'fair olive skin', 'light caramel skin', 'golden olive skin', 'warm caramel skin', 
        'sun-kissed bronze skin', 'tropical tan skin', 'rich mocha skin', 'deep bronze skin',
        'warm mahogany skin', 'deep caramel skin', 'rich umber skin', 'deep ebony skin'
      ],
      hairStyles: ['beach wave hair', 'natural curly hair', 'long flowing hair', 'textured natural hair', 'modern Brazilian styles'],
      facialFeatures: ['warm brown eyes', 'radiant smile', 'expressive features', 'joyful expression', 'vibrant personality'],
      culturalElements: ['tropical patterns', 'beach culture', 'vibrant colors', 'carnival elements', 'natural beauty'],
      familyStructure: ['beach family gathering', 'community celebration', 'large family party', 'neighborhood festival', 'extended family'],
      settings: ['beautiful Brazilian beach', 'tropical garden', 'colorful neighborhood', 'coastal town', 'modern Brazilian city'],
      clothing: ['tropical casual wear', 'carnival costume', 'beach festival clothing', 'modern Brazilian fashion', 'cultural celebration attire'],
      celebrations: ['carnival celebration', 'beach festival', 'family gathering', 'community party', 'cultural event'],
      negativePrompts: ['stereotypical', 'caricature', 'offensive portrayal', 'inaccurate representation', 'negative stereotypes']
    },
    'fr': {
      skinTones: [
        'fair rose skin', 'warm peach skin', 'light tan skin', 'golden olive skin', 
        'creamy complexion', 'warm caramel skin', 'rich bronze skin', 'deep amber skin',
        'warm mahogany skin', 'rich ebony skin', 'deep mocha skin', 'dark umber skin'
      ],
      hairStyles: ['elegant French braids', 'chic bob cut', 'sophisticated updo', 'natural wavy hair', 'stylish modern cut'],
      facialFeatures: ['bright eyes', 'refined features', 'elegant smile', 'sophisticated expression', 'charming demeanor'],
      culturalElements: ['French elegance', 'artistic elements', 'cultural sophistication', 'traditional patterns', 'refined aesthetics'],
      familyStructure: ['intimate family gathering', 'grandparents storytelling', 'elegant family dinner', 'cultural tradition', 'family celebration'],
      settings: ['charming French countryside', 'elegant Parisian street', 'beautiful French garden', 'traditional French home', 'cultural landmark'],
      clothing: ['chic French fashion', 'elegant dress', 'sophisticated style', 'cultural formal wear', 'modern French clothing'],
      celebrations: ['French cultural festival', 'family feast', 'traditional celebration', 'elegant gathering', 'cultural event'],
      negativePrompts: ['stereotypical', 'caricature', 'offensive portrayal', 'inaccurate cultural elements', 'negative stereotypes']
    },
    'en': {
      // Full spectrum of African American skin tones (very light to very dark)
      skinTones: [
        'fair brown skin', 'light caramel skin', 'warm beige skin', 'peachy brown skin',
        'light bronze skin', 'warm honey skin', 'golden caramel skin', 'honey bronze skin',
        'caramel skin', 'deep amber skin', 'golden bronze skin', 'warm mahogany skin',
        'cool espresso skin', 'dark chocolate skin', 'deep umber skin', 'cool walnut skin',
        'rich coffee skin', 'deep chestnut skin', 'rich cocoa skin', 'deep ebony skin'
      ],
      // Diverse African American hair textures and styles
      hairStyles: [
        'natural afro hair', 'protective braids', 'twist hairstyles', 'beautiful locs', 
        'silk press hair', 'cornrow braids', 'bantu knots', 'wash and go curls',
        'loose natural curls', 'tight coily hair', 'soft waves', 'kinky textured hair',
        '4C natural hair', '3B curly hair', 'box braids', 'goddess braids',
        'passion twists', 'flat twists', 'relaxed straight hair', 'blown out hair',
        'pressed curls', 'tapered natural cut', 'fade with curls on top', 'twist out', 'braid out'
      ],
      // EXPANDED: Mix of African American and general American facial features (FIXED)
      facialFeatures: [
        'beautiful dark eyes', 'strong cheekbones', 'radiant smile', 'confident expression', 
        'regal bearing', 'kind eyes', 'proud posture', 'bright hazel eyes', 'gentle smile',
        'expressive brown eyes', 'warm personality', 'friendly demeanor', 'intelligent gaze',
        'striking features', 'graceful expression', 'warm brown eyes', 'bright smile',
        'noble bearing', 'charming personality', 'engaging eyes', 'joyful demeanor'
      ],
      // Mix of African American cultural pride and general American elements
      culturalElements: [
        'modern urban style', 'contemporary American fashion', 'diverse American culture', 
        'metropolitan diversity', 'cultural pride symbols', 'community strength',
        'mainstream American culture', 'suburban lifestyle', 'middle-class family values',
        'American dream symbols', 'educational achievement', 'professional success'
      ],
      familyStructure: [
        'strong family bonds', 'community support', 'church family', 'multigenerational wisdom', 
        'extended family gathering', 'neighborhood community', 'nuclear family', 'suburban family',
        'professional family', 'academic family', 'middle-class household', 'two-parent home'
      ],
      // Mix of urban African American and suburban/general American settings
      settings: [
        'vibrant African American neighborhood', 'community center', 'beautiful church', 
        'family home', 'cultural center', 'historical landmark', 'suburban neighborhood',
        'modern American suburb', 'middle-class community', 'well-maintained school',
        'public library', 'shopping mall', 'local park', 'family restaurant'
      ],
      clothing: [
        'jeans and sneakers', 'casual t-shirt', 'modern American fashion', 
        'contemporary urban style', 'hoodie and jeans', 'athletic wear', 
        'modern African American fashion', 'contemporary style', 'preppy clothes',
        'school uniform', 'suburban casual wear', 'mainstream fashion', 'polo shirt'
      ],
      celebrations: [
        'Juneteenth celebration', 'family reunion', 'church gathering', 'community festival', 
        'cultural pride event', 'graduation celebration', 'birthday party', 'Christmas morning',
        'Thanksgiving dinner', 'Fourth of July barbecue', 'school achievement ceremony', 'sports victory'
      ],
      negativePrompts: ['stereotypical', 'caricature', 'offensive portrayal', 'negative stereotypes', 'inaccurate representation', 'degrading imagery']
    }
  };

  // ========== ABSORBED STRUCTURED PROMPT ENGINE LOGIC ==========
  static STYLE_FRAMEWORKS = {
    'beginner': 'Very simple children\'s book illustration, minimal details, large clear shapes, bright basic colors',
    'easy': 'Simple children\'s book illustration, clear lines, bright cheerful colors, minimal background details',
    'medium': 'Children\'s book art style, detailed characters, vibrant scenes, engaging composition',
    'hard': 'Professional children\'s book illustration, rich details, dynamic composition, sophisticated lighting',
    'expert': 'Award-winning children\'s book art, cinematic composition, masterful storytelling through visuals, complex scenes'
  };

  static EMOTIONAL_MAPPINGS = {
    'happy celebration': {
      mood: 'happy',
      intensity: 'high',
      colorPalette: ['warm yellows', 'bright oranges', 'cheerful blues'],
      lightingStyle: 'bright warm lighting',
      compositionStyle: 'dynamic joyful composition'
    },
    'peaceful moment': {
      mood: 'calm',
      intensity: 'low',
      colorPalette: ['soft pastels', 'gentle greens', 'warm beiges'],
      lightingStyle: 'soft natural lighting',
      compositionStyle: 'balanced serene composition'
    },
    'adventure scene': {
      mood: 'exciting',
      intensity: 'high',
      colorPalette: ['bold blues', 'energetic greens', 'adventurous purples'],
      lightingStyle: 'dramatic adventure lighting',
      compositionStyle: 'dynamic action composition'
    },
    'cozy family time': {
      mood: 'cozy',
      intensity: 'medium',
      colorPalette: ['warm earth tones', 'comfortable browns', 'gentle golds'],
      lightingStyle: 'warm intimate lighting',
      compositionStyle: 'cozy gathering composition'
    }
  };

  // ========== ABSORBED ADVANCED QUALITY ENGINE LOGIC ==========
  static CHILDREN_BOOK_OPTIMAL_PARAMS = {
    cfgScale: 3.5,
    steps: 10,
    model: "runware:100@1",
    scheduler: "FlowMatchEulerDiscreteScheduler",
    outputFormat: "WEBP"
  };

  static QUALITY_ENHANCEMENT_PATTERNS = [
    {
      name: "Character Description Enhancement",
      pattern: /\b(child|boy|girl|person|character)\b/gi,
      enhancement: (match) => `${match} with expressive bright eyes`
    },
    {
      name: "Scene Atmosphere Enhancement", 
      pattern: /\bin\s+(the\s+)?(garden|park|room|house|school)/gi,
      enhancement: (match) => `${match} with soft natural lighting and warm atmosphere`
    },
    {
      name: "Color Vibrancy Enhancement",
      pattern: /\b(red|blue|green|yellow|orange|purple|pink)\b/gi,
      enhancement: (match) => `vibrant ${match}`
    }
  ];

  // ========== MAIN PROCESSING PIPELINE ==========
  static async processThroughPipeline(storyText, userInfo, sessionId, pageNumber, totalPages = 10) {
    const startTime = Date.now();
    console.log(`🔄 Starting consolidated enhancement pipeline for page ${pageNumber}`);
    
    try {
      // Stage 1: Scene Extraction with Cultural Enhancement
      const primaryScene = await this.extractPrimarySceneWithAI(storyText, sessionId, pageNumber, userInfo);
      const culturalSetting = this.generateCulturalSetting(userInfo);
      const enhancedScene = `${primaryScene}, ${culturalSetting}`;

      // Stage 2: Character Detection with Cultural Consistency
      const characterInfo = this.detectAndEnhanceCharacters(storyText, userInfo);
      
      // Stage 3: Emotional Analysis and Style Framework (Phase 1 Integration)
      const emotionalContext = this.analyzeEmotionalContent(storyText);
      const difficulty = DifficultyLevelMapper.normalizeLevel(userInfo.readingLevel || userInfo.difficultyLevel || 'easy');
      const styleFramework = this.STYLE_FRAMEWORKS[difficulty];

      // Stage 4: Complete Prompt Composition
      const template = this.composeStructuredPrompt(
        enhancedScene,
        characterInfo,
        emotionalContext,
        styleFramework,
        userInfo
      );

      // Stage 5: Quality Enhancement + Prompt Optimization (Phase 2 & 3 Integration)
      let enhancedPrompt = this.applyQualityEnhancements(template.finalPrompt);
      enhancedPrompt = PromptOptimizationEngine.optimizeForTokenBudget(enhancedPrompt, difficulty);
      
      // Stage 6: Cultural Validation (Phase 4 Integration)
      const culturalWarnings = CulturalRepresentationEngine.validateCulturalRepresentation(enhancedPrompt, userInfo);
      if (culturalWarnings.length > 0) {
        console.log('🌍 Cultural representation warnings:', culturalWarnings);
      }
      
      // Stage 7: Parameter Optimization (Phase 2 Integration)
      const optimizedParameters = QualityStandardizationEngine.getParametersForDifficulty(difficulty);

      const processingTime = Date.now() - startTime;
      
      return {
        prompt: enhancedPrompt,
        negativePrompt: this.generateCulturalNegativePrompt(userInfo),
        parameters: optimizedParameters,
        enhancedCharacters: characterInfo.characters,
        qualityScore: this.calculateQualityScore(enhancedPrompt),
        processingTime,
        enhancementLevel: 'all-phases-integrated',
        validation: {
          tokenCount: PromptOptimizationEngine.estimateTokenCount(enhancedPrompt),
          culturalWarnings
        }
      };

    } catch (error) {
      console.error('❌ Consolidated pipeline failed:', error);
      return this.createFallbackResult(storyText, userInfo);
    }
  }

  // ========== ABSORBED MULTICULTURAL METHODS ==========
  static getCulturalVisualProfile(nativeLanguage) {
    return this.CULTURAL_VISUAL_PROFILES[nativeLanguage] || this.CULTURAL_VISUAL_PROFILES['en'];
  }

  static generateCulturalCharacterDescription(userInfo) {
    if (!userInfo) {
      return 'friendly child character with warm features and expressive eyes';
    }

    // Phase 4 Integration: Use enhanced cultural representation engine
    return CulturalRepresentationEngine.generateCulturalCharacterDescription(userInfo);
    const culturalElement = this.selectRandomElement(profile.culturalElements);
    const genderTerm = userInfo.avatar?.type === 'boy' ? 'boy' : 
                      userInfo.avatar?.type === 'girl' ? 'girl' : 'child';
    
    return `${genderTerm} with ${skinTone}, ${hairStyle}, ${facialFeatures}, ${culturalElement}`;
  }

  static generateMixedAfricanAmericanDescription(userInfo) {
    const profile = this.getCulturalVisualProfile('en');
    const genderTerm = userInfo.avatar?.type === 'boy' ? 'boy' : 
                      userInfo.avatar?.type === 'girl' ? 'girl' : 'child';
    
    const skinTone = this.mapSkinToneToDescription(userInfo.avatar?.skinTone, profile);
    const hairStyle = this.getCulturallyAppropriateHairStyle(userInfo);
    
    // FIXED: Weighted randomization instead of 50/50
    const facialFeatures = Math.random() < 0.6 
      ? this.selectRandomElement(['beautiful dark eyes', 'strong cheekbones', 'radiant smile', 'confident expression', 'regal bearing', 'striking features'])
      : this.selectRandomElement(['bright hazel eyes', 'gentle smile', 'expressive brown eyes', 'warm personality', 'friendly demeanor', 'engaging eyes']);
    
    const culturalElement = Math.random() < 0.6
      ? this.selectRandomElement(['cultural pride symbols', 'community strength', 'modern urban style'])
      : this.selectRandomElement(['mainstream American culture', 'suburban lifestyle', 'educational achievement']);
    
    return `${genderTerm} with ${skinTone}, ${hairStyle}, ${facialFeatures}, ${culturalElement}`;
  }

  // NEW: Standard American descriptions for English + non-dark skin
  static generateStandardAmericanDescription(userInfo) {
    const genderTerm = userInfo.avatar?.type === 'boy' ? 'boy' : 
                      userInfo.avatar?.type === 'girl' ? 'girl' : 'child';
    
    const standardSkinTones = {
      'pale': 'fair skin',
      'light': 'light skin tone',
      'medium': 'medium skin tone',
      'olive': 'olive skin tone'
    };
    
    const standardHairStyles = [
      'brown hair', 'blonde hair', 'dark hair', 'curly hair', 'straight hair',
      'wavy hair', 'short hair', 'long hair', 'shoulder-length hair'
    ];
    
    const standardFeatures = [
      'bright eyes', 'friendly smile', 'cheerful expression', 'kind eyes',
      'warm smile', 'happy demeanor', 'gentle expression', 'bright personality'
    ];
    
    const standardElements = [
      'casual American style', 'suburban lifestyle', 'modern clothing',
      'contemporary look', 'everyday fashion', 'mainstream style'
    ];
    
    const skinTone = standardSkinTones[userInfo.avatar?.skinTone] || 'medium skin tone';
    const hairStyle = this.selectRandomElement(standardHairStyles);
    const facialFeatures = this.selectRandomElement(standardFeatures);
    const element = this.selectRandomElement(standardElements);
    
    return `${genderTerm} with ${skinTone}, ${hairStyle}, ${facialFeatures}, ${element}`;
  }

  static getCulturallyAppropriateHairStyle(userInfo) {
    if (userInfo.nativeLanguage === 'en' && userInfo.avatar?.skinTone === 'dark') {
      const africanAmericanHairStyles = [
        'natural afro hair', 'protective braids', 'twist hairstyles', 'beautiful locs', 
        'silk press hair', 'cornrow braids', 'bantu knots', 'wash and go curls',
        'loose natural curls', 'tight coily hair', 'kinky textured hair',
        '4C natural hair', '3B curly hair', 'box braids', 'goddess braids',
        'passion twists', 'flat twists', 'relaxed straight hair', 'blown out hair',
        'tapered natural cut', 'fade with curls on top', 'twist out', 'braid out'
      ];
      return this.selectRandomElement(africanAmericanHairStyles);
    }
    
    const profile = this.getCulturalVisualProfile(userInfo.nativeLanguage);
    return this.selectRandomElement(profile.hairStyles);
  }

  static generateCulturalSetting(userInfo) {
    if (userInfo.nativeLanguage === 'en' && userInfo.avatar?.skinTone === 'dark') {
      return this.generateMixedAfricanAmericanSetting(userInfo);
    }
    
    const profile = this.getCulturalVisualProfile(userInfo.nativeLanguage);
    const setting = this.selectRandomElement(profile.settings);
    const culturalElement = this.selectRandomElement(profile.culturalElements);
    
    return `${setting} with ${culturalElement}`;
  }

  static generateMixedAfricanAmericanSetting(userInfo) {
    const profile = this.getCulturalVisualProfile('en');
    
    const isUrbanSetting = Math.random() < 0.5;
    
    const setting = isUrbanSetting 
      ? this.selectRandomElement(['vibrant African American neighborhood', 'community center', 'beautiful church', 'cultural center', 'historical landmark'])
      : this.selectRandomElement(['suburban neighborhood', 'modern American suburb', 'middle-class community', 'well-maintained school', 'public library', 'local park']);
    
    const culturalElement = isUrbanSetting
      ? this.selectRandomElement(['cultural pride symbols', 'community strength', 'modern urban style'])
      : this.selectRandomElement(['mainstream American culture', 'suburban lifestyle', 'middle-class family values']);
    
    return `${setting} with ${culturalElement}`;
  }

  static generateCulturalNegativePrompt(userInfo) {
    const baseNegative = 'low quality, blurry, distorted, ugly, inappropriate content, offensive, stereotypical, caricature';
    const profile = this.getCulturalVisualProfile(userInfo.nativeLanguage);
    const culturalNegatives = profile.negativePrompts.join(', ');
    
    return `${baseNegative}, ${culturalNegatives}`;
  }

  static getQualityEnhancementTerms(userInfo) {
    const baseQuality = 'high quality, detailed, vibrant colors, child-friendly, wholesome, safe content';
    
    if (userInfo.nativeLanguage === 'en' && userInfo.avatar?.skinTone === 'dark') {
      return `${baseQuality}, authentic African American representation, respectful diverse portrayal, natural skin tones, cultural authenticity`;
    }
    
    return `${baseQuality}, authentic cultural representation, respectful diverse portrayal`;
  }

  static getOptimizedGenerationParams(userInfo) {
    const baseParams = { ...this.CHILDREN_BOOK_OPTIMAL_PARAMS };
    
    if (userInfo.nativeLanguage === 'en' && userInfo.avatar?.skinTone === 'dark') {
      return {
        ...baseParams,
        cfgScale: 4.0, // Higher for better skin tone accuracy
        steps: 12 // More steps for facial feature consistency
      };
    }
    
    return baseParams;
  }

  // ========== ABSORBED STRUCTURED PROMPT ENGINE METHODS ==========
  static composeStructuredPrompt(sceneDescription, characterInfo, emotionalContext, styleFramework, userInfo) {
    const visualAppearance = characterInfo.primaryCharacter || this.generateCulturalCharacterDescription(userInfo);
    const secondaryCharacters = characterInfo.secondaryCharacters || '';
    const culturalSetting = this.generateCulturalSetting(userInfo);
    const qualityEnhancement = this.getQualityEnhancementTerms(userInfo);
    
    const sections = [
      visualAppearance,
      secondaryCharacters,
      sceneDescription,
      culturalSetting,
      styleFramework,
      emotionalContext,
      qualityEnhancement
    ].filter(section => section && section.trim().length > 0);
    
    return {
      finalPrompt: sections.join(', ')
    };
  }

  static analyzeEmotionalContent(storyText) {
    const text = storyText.toLowerCase();
    
    if (text.includes('laugh') || text.includes('smile') || text.includes('joy') || 
        text.includes('celebrate') || text.includes('party') || text.includes('happy')) {
      return this.EMOTIONAL_MAPPINGS['happy celebration'].lightingStyle + ', ' + this.EMOTIONAL_MAPPINGS['happy celebration'].compositionStyle;
    }
    
    if (text.includes('adventure') || text.includes('explore') || text.includes('discover') ||
        text.includes('journey') || text.includes('exciting') || text.includes('climb')) {
      return this.EMOTIONAL_MAPPINGS['adventure scene'].lightingStyle + ', ' + this.EMOTIONAL_MAPPINGS['adventure scene'].compositionStyle;
    }
    
    if (text.includes('family') || text.includes('home') || text.includes('cozy') ||
        text.includes('together') || text.includes('warm') || text.includes('hug')) {
      return this.EMOTIONAL_MAPPINGS['cozy family time'].lightingStyle + ', ' + this.EMOTIONAL_MAPPINGS['cozy family time'].compositionStyle;
    }
    
    return this.EMOTIONAL_MAPPINGS['peaceful moment'].lightingStyle + ', ' + this.EMOTIONAL_MAPPINGS['peaceful moment'].compositionStyle;
  }

  static extractPrimaryScene(storyText) {
    const sentences = storyText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const actionWords = ['walk', 'run', 'play', 'look', 'see', 'go', 'find', 'hold', 'sit', 'stand', 'move', 'jump', 'climb'];
    
    let bestScene = sentences[0] || storyText;
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

  // ========== ABSORBED ADVANCED QUALITY ENGINE METHODS ==========
  static optimizeForChildrensBooks(prompt, sessionId, pageNumber, userInfo) {
    let enhancedPrompt = prompt;
    const optimizations = [];

    // Apply enhancement patterns
    for (const pattern of this.QUALITY_ENHANCEMENT_PATTERNS) {
      const matches = prompt.matchAll(pattern.pattern);
      for (const match of matches) {
        if (match[0] && match.index !== undefined) {
          const enhanced = pattern.enhancement(match[0]);
          enhancedPrompt = enhancedPrompt.replace(match[0], enhanced);
          optimizations.push(`Applied ${pattern.name}: ${match[0]} → ${enhanced}`);
        }
      }
    }

    // Add professional suffix
    const professionalSuffix = ", professional children's book illustration, warm earth tones and soft natural lighting, diverse inclusive characters with expressive faces, contemporary storybook art style, safe wholesome content, high quality digital artwork, soft painterly texture, appealing composition";
    
    if (!enhancedPrompt.includes("professional children's book illustration")) {
      enhancedPrompt += professionalSuffix;
      optimizations.push("Added professional children's book illustration styling");
    }

    const qualityScore = this.calculateQualityScore(enhancedPrompt, optimizations.length);

    return {
      enhancedPrompt,
      qualityScore,
      optimizations,
      suggestedParameters: this.CHILDREN_BOOK_OPTIMAL_PARAMS
    };
  }

  static getOptimalParameters(difficulty, userInfo) {
    const baseParams = this.getOptimizedGenerationParams(userInfo);
    
    switch (difficulty) {
      case 'beginner':
        return { ...baseParams, cfgScale: 3.5, steps: 10 };
      case 'easy':
        return { ...baseParams, cfgScale: 3.5, steps: 10 };
      case 'medium':
        return { ...baseParams, cfgScale: 3.5, steps: 10 };
      case 'hard':
        return { ...baseParams, cfgScale: 4.0, steps: 12 };
      case 'expert':
        return { ...baseParams, cfgScale: 4.0, steps: 12 };
      default:
        return baseParams;
    }
  }

  static calculateQualityScore(prompt, optimizationCount) {
    let score = 0.6;
    
    const promptLength = prompt.length;
    if (promptLength > 100 && promptLength < 2800) {
      score += 0.2;
    }

    score += Math.min(optimizationCount * 0.05, 0.3);

    if (prompt.includes("professional children's book illustration")) {
      score += 0.1;
    }

    const descriptiveWords = (prompt.match(/\b(vibrant|soft|warm|bright|expressive|natural|cozy|magical)\b/gi) || []).length;
    score += Math.min(descriptiveWords * 0.02, 0.1);

    return Math.min(score, 1.0);
  }

  // ========== CHARACTER DETECTION METHODS ==========
  static detectAndEnhanceCharacters(storyText, userInfo) {
    const characters = [];
    const lowerText = storyText.toLowerCase();
    
    // Primary character
    if (userInfo?.name) {
      characters.push({
        name: userInfo.name,
        type: 'primary',
        physicalTraits: this.generateCulturalCharacterDescription(userInfo)
      });
    }
    
    // Family members detection
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
      if (regex.test(storyText)) {
        characters.push({
          name: info.name,
          type: 'family',
          relationship: info.relationship,
          physicalTraits: this.generateFamilyMemberTraits(userInfo, info.relationship)
        });
      }
    }

    return {
      characters,
      primaryCharacter: characters.find(c => c.type === 'primary')?.physicalTraits || '',
      secondaryCharacters: characters.filter(c => c.type !== 'primary').map(c => c.physicalTraits).join(', ')
    };
  }

  static generateFamilyMemberTraits(userInfo, relationship) {
    const culturalProfile = this.getCulturalVisualProfile(userInfo?.nativeLanguage || 'en');
    const baseTrait = culturalProfile.skinTones[0];
    
    if (relationship === 'mother' || relationship === 'father') {
      return `${baseTrait}, nurturing expression, ${culturalProfile.hairStyles[0]}`;
    } else if (relationship.includes('grand')) {
      return `${baseTrait}, wise kind eyes, gray hair`;
    } else {
      return `${baseTrait}, youthful appearance, ${culturalProfile.hairStyles[1]}`;
    }
  }

  // ========== AI SCENE EXTRACTION ==========
  static async extractPrimarySceneWithAI(storyText, sessionId, pageNumber, userInfo) {
    console.log(`🤖 Using AI for scene extraction: "${storyText.substring(0, 60)}..."`);
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.log(`⚠️ No OpenAI API key, using fallback extraction`);
      return this.extractPrimaryScene(storyText);
    }
    
    try {
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
      return this.extractPrimaryScene(storyText);
    }
  }

  // ========== UTILITY METHODS ==========
  static selectRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  static mapSkinToneToDescription(skinTone, profile) {
    const skinToneMap = {
      'pale': profile.skinTones[0] || 'fair skin',
      'light': profile.skinTones[1] || 'light skin tone',
      'medium': profile.skinTones[2] || 'medium skin tone',
      'olive': profile.skinTones[3] || 'olive skin tone',
      'dark': profile.skinTones[4] || 'dark skin tone'
    };
    
    return skinToneMap[skinTone] || profile.skinTones[0] || 'medium skin tone';
  }

  static normalizeDifficultyLevel(level) {
    // Phase 1 Integration: Use DifficultyLevelMapper
    return DifficultyLevelMapper.normalizeLevel(level);
  }

  static createFallbackResult(storyText, userInfo) {
    return {
      finalPrompt: `${storyText}, children's book illustration style, bright colors, safe wholesome content`,
      negativePrompt: this.generateCulturalNegativePrompt(userInfo),
      enhancedCharacters: [],
      optimizedParameters: this.CHILDREN_BOOK_OPTIMAL_PARAMS,
      qualityScore: 0.6,
      processingTime: 0,
      enhancementLevel: 'fallback'
    };
  }
}