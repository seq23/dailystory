// Enhanced Multi-Stage Pipeline with Frontend Intelligence Integration
// Full cultural intelligence, emotional context, and quality optimization

import { DifficultyLevelMapper } from './DifficultyLevelMapper.js';
import { getStyleFramework, buildCompletePrompt } from './styleFrameworks.js';

// Frontend Intelligence - Cultural Profiles (from MulticulturalVisualService.ts)
const CULTURAL_VISUAL_PROFILES = {
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
    // Enhanced African American representation (20+ skin tone variations)
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
    facialFeatures: {
      eyes: [
        'almond-shaped dark brown eyes', 'round rich brown eyes', 'deep-set hazel eyes', 
        'prominent amber eyes', 'almond-shaped hazel-green eyes', 'round dark brown eyes',
        'deep-set rich brown eyes', 'prominent hazel eyes', 'almond-shaped amber eyes',
        'round hazel-green eyes', 'expressive dark brown eyes', 'bright amber eyes',
        'warm hazel eyes', 'intelligent dark brown eyes', 'sparkling hazel-green eyes'
      ],
      eyebrows: [
        'full well-defined eyebrows', 'naturally arched eyebrows', 'thick expressive eyebrows',
        'elegantly shaped eyebrows', 'bold natural eyebrows', 'gracefully arched eyebrows'
      ],
      eyelashes: [
        'long curved eyelashes', 'naturally thick eyelashes', 'beautifully curled eyelashes',
        'full dark eyelashes', 'elegantly long eyelashes'
      ],
      nose: [
        'wider nasal bridge', 'fuller rounded nostrils', 'broad noble nose', 'narrow refined nose',
        'button nose shape', 'straight elegant nose', 'distinctive nose bridge', 'well-proportioned nose'
      ],
      lips: [
        'fuller well-defined lips', 'naturally full lips', 'heart-shaped lips', 'bow-shaped lips',
        'beautifully full lips', 'expressive full lips', 'naturally defined lips'
      ],
      facialStructure: [
        'high cheekbones', 'strong jawline', 'rounded face shape', 'oval face shape',
        'smooth facial contours', 'natural facial symmetry', 'elegant bone structure',
        'defined cheekbones', 'graceful jawline', 'harmonious facial features'
      ]
    },
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

// Emotional Context Mappings (from StructuredPromptEngine.ts)
const EMOTIONAL_MAPPINGS = {
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

// Quality Enhancement Patterns (from AdvancedQualityEngine.ts)
const QUALITY_ENHANCEMENT_PATTERNS = [
  {
    name: "Character Description Enhancement",
    pattern: /\b(child|boy|girl|person|character)\b/gi,
    enhancement: (match) => `${match} with expressive bright eyes and warm friendly smile`
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

// African American Weighted Selection Algorithm
function selectAfricanAmericanSkinTone() {
  const skinTones = CULTURAL_VISUAL_PROFILES.en.skinTones;
  
  // Weighted selection favoring diversity across the spectrum
  const weights = skinTones.map((_, index) => {
    const position = index / (skinTones.length - 1);
    // Higher weight for middle and darker tones
    return position > 0.3 ? 1.5 : 1.0;
  });
  
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const random = Math.random() * totalWeight;
  
  let cumulativeWeight = 0;
  for (let i = 0; i < skinTones.length; i++) {
    cumulativeWeight += weights[i];
    if (random <= cumulativeWeight) {
      return skinTones[i];
    }
  }
  
  return skinTones[Math.floor(Math.random() * skinTones.length)];
}

function selectWeightedElement(array) {
  if (!array || array.length === 0) return '';
  return array[Math.floor(Math.random() * array.length)];
}


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
      
      // Phase 3: Enhanced cultural intelligence processing
      const enhancedCultural = this.getEnhancedCulturalContext(userInfo);
      
      // Phase 4: Emotional context analysis
      const emotionalContext = this.analyzeEmotionalContent(storyText);
      
      // Phase 5: Quality enhancements
      const { enhancedPrompt: qualityPrompt, optimizations } = this.applyQualityEnhancements(sceneDescription);
      
      // Build complete prompt with all enhancements
      const { positivePrompt, negativePrompt } = buildCompletePrompt(
        framework,
        qualityPrompt,
        enhancedCultural.characterDescription,
        enhancedCultural.setting
      );
      
      // Add emotional color palette and lighting
      const finalPrompt = `${positivePrompt}, ${emotionalContext.colorPalette.join(', ')}, ${emotionalContext.lightingStyle}, ${emotionalContext.compositionStyle}`;
      
      console.log(`🎨 Applied ${optimizations.length} quality enhancements`, optimizations.slice(0, 3));
      
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
        enhancedPrompt: finalPrompt,
        negativePrompt: `${negativePrompt}, ${enhancedCultural.negativePrompt}`,
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
   * Enhanced cultural intelligence with frontend logic
   */
  static getEnhancedCulturalContext(userInfo) {
    const language = userInfo?.nativeLanguage || userInfo?.language || 'en';
    const profile = CULTURAL_VISUAL_PROFILES[language] || CULTURAL_VISUAL_PROFILES.en;
    
    // Generate culturally authentic character description
    const characterDescription = this.generateCulturalCharacterDescription(userInfo);
    
    // Generate cultural setting
    const setting = this.generateCulturalSetting(userInfo);
    
    // Select cultural elements
    const culturalElements = selectWeightedElement(profile.culturalElements);
    
    return {
      characterDescription,
      setting,
      culturalElements,
      negativePrompt: profile.negativePrompts.join(', ')
    };
  }

  /**
   * Generate culturally authentic character description with weighted African American representation
   */
  static generateCulturalCharacterDescription(userInfo) {
    const language = userInfo?.nativeLanguage || 'en';
    const profile = CULTURAL_VISUAL_PROFILES[language] || CULTURAL_VISUAL_PROFILES.en;
    
    // Special handling for English speakers with dark skin - enhanced African American representation
    if (language === 'en' && userInfo.avatar?.skinTone === 'dark') {
      return this.generateMixedAfricanAmericanDescription(userInfo);
    }
    
    const skinTone = this.mapSkinToneToDescription(userInfo.avatar?.skinTone, profile);
    const hairStyle = selectWeightedElement(profile.hairStyles);
    const facialFeatures = this.generateFacialFeaturesDescription(profile.facialFeatures);
    const culturalElement = selectWeightedElement(profile.culturalElements);
    
    const genderTerm = userInfo.avatar?.type === 'boy' ? 'boy' : 
                      userInfo.avatar?.type === 'girl' ? 'girl' : 'child';
    
    return `${genderTerm} with ${skinTone}, ${hairStyle}, ${facialFeatures}, ${culturalElement}`;
  }

  /**
   * Enhanced African American representation with 50/50 urban/suburban mixing
   */
  static generateMixedAfricanAmericanDescription(userInfo) {
    const genderTerm = userInfo.avatar?.type === 'boy' ? 'boy' : 
                      userInfo.avatar?.type === 'girl' ? 'girl' : 'child';
    
    // Use weighted selection for diverse skin tone representation
    const skinTone = selectAfricanAmericanSkinTone();
    
    // African American hair styles with authentic textures
    const africanAmericanHairStyles = [
      'natural afro hair', 'protective braids', 'twist hairstyles', 'beautiful locs', 
      'silk press hair', 'cornrow braids', 'bantu knots', 'wash and go curls',
      'loose natural curls', 'tight coily hair', 'kinky textured hair',
      '4C natural hair', '3B curly hair', 'box braids', 'goddess braids',
      'passion twists', 'flat twists', 'relaxed straight hair', 'blown out hair',
      'tapered natural cut', 'fade with curls on top', 'twist out', 'braid out'
    ];
    
    const hairStyle = selectWeightedElement(africanAmericanHairStyles);
    
    // Use the comprehensive facial features system from the English profile
    const facialFeatures = this.generateFacialFeaturesDescription(CULTURAL_VISUAL_PROFILES.en.facialFeatures);
    
    // 50/50 mix of cultural pride elements with mainstream American
    const culturalElement = Math.random() < 0.5
      ? selectWeightedElement(['cultural pride symbols', 'community strength', 'modern urban style'])
      : selectWeightedElement(['mainstream American culture', 'suburban lifestyle', 'educational achievement']);
    
    return `${genderTerm} with ${skinTone}, ${hairStyle}, ${facialFeatures}, ${culturalElement}`;
  }

  /**
   * Generate cultural setting with urban/suburban mixing for African Americans
   */
  static generateCulturalSetting(userInfo) {
    const language = userInfo?.nativeLanguage || 'en';
    const profile = CULTURAL_VISUAL_PROFILES[language] || CULTURAL_VISUAL_PROFILES.en;
    
    // Special handling for English speakers with dark skin - mix urban and suburban settings
    if (language === 'en' && userInfo.avatar?.skinTone === 'dark') {
      return this.generateMixedAfricanAmericanSetting();
    }
    
    const setting = selectWeightedElement(profile.settings);
    const culturalElement = selectWeightedElement(profile.culturalElements);
    
    return `${setting} with ${culturalElement}`;
  }

  /**
   * Mixed African American setting generation (50/50 urban/suburban)
   */
  static generateMixedAfricanAmericanSetting() {
    // 50/50 chance between African American urban settings and general American suburban settings
    const isUrbanSetting = Math.random() < 0.5;
    
    const setting = isUrbanSetting 
      ? selectWeightedElement(['vibrant African American neighborhood', 'community center', 'beautiful church', 'cultural center', 'historical landmark'])
      : selectWeightedElement(['suburban neighborhood', 'modern American suburb', 'middle-class community', 'well-maintained school', 'public library', 'local park']);
    
    const culturalElement = isUrbanSetting
      ? selectWeightedElement(['cultural pride symbols', 'community strength', 'modern urban style'])
      : selectWeightedElement(['mainstream American culture', 'suburban lifestyle', 'middle-class family values']);
    
    return `${setting} with ${culturalElement}`;
  }

  /**
   * Map user's basic skin tone choice to detailed cultural description
   */
  /**
   * Generate comprehensive facial features description from component-based system
   */
  static generateFacialFeaturesDescription(facialFeatures) {
    // Handle both old array format and new component-based format
    if (Array.isArray(facialFeatures)) {
      return selectWeightedElement(facialFeatures);
    }
    
    // New component-based format - select one from each category
    if (facialFeatures && typeof facialFeatures === 'object') {
      const eyes = selectWeightedElement(facialFeatures.eyes || []);
      const eyebrows = selectWeightedElement(facialFeatures.eyebrows || []);
      const eyelashes = selectWeightedElement(facialFeatures.eyelashes || []);
      const nose = selectWeightedElement(facialFeatures.nose || []);
      const lips = selectWeightedElement(facialFeatures.lips || []);
      const facialStructure = selectWeightedElement(facialFeatures.facialStructure || []);
      
      // Combine 2-3 components for natural description
      const components = [eyes, eyebrows, nose, lips, facialStructure].filter(Boolean);
      const selectedComponents = components.slice(0, 3); // Use first 3 non-empty components
      
      return selectedComponents.join(', ');
    }
    
    return 'gentle friendly features';
  }

  /**
   * Maps a general skin tone to a more specific description based on cultural profile
   */
  static mapSkinToneToDescription(skinTone, profile) {
    if (!skinTone || !profile.skinTones) return selectWeightedElement(profile.skinTones);
    
    const toneMap = {
      'pale': profile.skinTones.slice(0, 3),      // First 3 (lightest)
      'light': profile.skinTones.slice(2, 6),    // Light-medium range
      'medium': profile.skinTones.slice(4, 8),   // Medium range  
      'olive': profile.skinTones.slice(6, 10),   // Medium-dark range
      'dark': profile.skinTones.slice(8)         // Darkest range
    };
    
    const toneRange = toneMap[skinTone] || profile.skinTones;
    return selectWeightedElement(toneRange);
  }

  /**
   * Analyze story text for emotional content and map to visual style
   */
  static analyzeEmotionalContent(storyText) {
    const text = storyText.toLowerCase();
    
    // Happy/celebration patterns
    if (text.includes('laugh') || text.includes('smile') || text.includes('joy') || 
        text.includes('celebrate') || text.includes('party') || text.includes('happy')) {
      return EMOTIONAL_MAPPINGS['happy celebration'];
    }
    
    // Adventure/exciting patterns
    if (text.includes('adventure') || text.includes('explore') || text.includes('discover') ||
        text.includes('journey') || text.includes('exciting') || text.includes('climb')) {
      return EMOTIONAL_MAPPINGS['adventure scene'];
    }
    
    // Cozy/family patterns
    if (text.includes('family') || text.includes('home') || text.includes('cozy') ||
        text.includes('together') || text.includes('warm') || text.includes('hug')) {
      return EMOTIONAL_MAPPINGS['cozy family time'];
    }
    
    // Default to peaceful
    return EMOTIONAL_MAPPINGS['peaceful moment'];
  }

  /**
   * Apply quality enhancement patterns to prompt
   */
  static applyQualityEnhancements(prompt) {
    let enhancedPrompt = prompt;
    const optimizations = [];
    
    // Apply enhancement patterns
    for (const pattern of QUALITY_ENHANCEMENT_PATTERNS) {
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      const matches = enhancedPrompt.matchAll(regex);
      
      for (const match of matches) {
        if (match[0] && match.index !== undefined) {
          const enhanced = pattern.enhancement(match[0]);
          enhancedPrompt = enhancedPrompt.replace(match[0], enhanced);
          optimizations.push(`Applied ${pattern.name}: ${match[0]} → ${enhanced}`);
        }
      }
    }
    
    // Add professional children's book illustration suffix
    const professionalSuffix = ", professional children's book illustration, warm earth tones and soft natural lighting, diverse inclusive characters with expressive faces, contemporary storybook art style, safe wholesome content, high quality digital artwork";
    
    if (!enhancedPrompt.includes("professional children's book illustration")) {
      enhancedPrompt += professionalSuffix;
      optimizations.push("Added professional children's book illustration styling");
    }
    
    return { enhancedPrompt, optimizations };
  }

  /**
   * Basic cultural context (legacy method)
   */
  static getBasicCulturalContext(userInfo) {
    const language = userInfo?.nativeLanguage || userInfo?.language || 'en';
    
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