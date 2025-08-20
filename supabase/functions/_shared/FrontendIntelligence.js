// Frontend Intelligence - Auto-generated from 2025-01-20T22:30:00.000Z
// This file contains real AI functions extracted from frontend TypeScript services

export class FrontendIntelligence {
  
  // ============= COMPREHENSIVE AFRICAN AMERICAN ARRAYS =============
  
  // Boys' Hair Styles (34 styles)
  static BOYS_HAIR_STYLES = [
    'buzz cut', 'fade cut', 'taper fade', 'high top fade', 'low fade', 'crew cut', 'caesar cut', 
    'curly top fade', 'curly high fade', 'curly low fade', 'curly taper fade', 'curly high top', 
    'curly mohawk', 'curly faux hawk', 'curly undercut', 'fade with curls on top', 'textured crop', 
    'curly fringe fade', 'twisted top fade', 'undercut design', 'hair tattoo', 'geometric patterns', 
    'mini afro', 'medium afro', 'tapered afro', 'wash and go', 'finger coils', 'two strand twists', 
    'flat twists', 'mini twists', 'locs', 'starter locs', 'freeform locs', 'twisted locs', 
    'side part locs', 'middle part locs', 'ponytail with locs', 'nape area tapered'
  ];

  // Girls' Hair Styles (60+ styles)
  static GIRLS_HAIR_STYLES = [
    'short natural hair', 'medium natural hair', 'long natural hair', 'shoulder-length hair', 'chin-length hair',
    'twist out', 'bantu knots', 'rod set', 'braid out', 'pineapple updo', 'high puff', 'low puff', 
    'side puff', 'double puff', 'space buns', 'top knot bun', 'low bun', 'messy bun', 'sleek bun',
    'cornrows', 'box braids', 'micro braids', 'jumbo braids', 'goddess braids', 'dutch braids', 
    'french braids', 'fishtail braids', 'halo braid', 'crown braid', 'side braids', 'three strand twists',
    'senegalese twists', 'marley twists', 'havana twists', 'passion twists', 'spring twists', 
    'kinky twists', 'chunky twists', 'protective twists', 'sisterlocs', 'microlocs', 'traditional locs',
    'interlocked locs', 'braided locs', 'loc updo', 'half up half down locs', 'afro puffs', 'large afro',
    'picked out afro', 'shaped afro', 'curly afro', 'coily afro', 'kinky afro', 'twist and pin style',
    'bobby pin curls', 'hair accessories with bows', 'headbands', 'hair clips', 'barrettes', 'scrunchies',
    'silk scarves', 'bandanas', 'side swept bangs', 'face framing layers', 'layered cut', 'blunt cut',
    'asymmetrical cut', 'zigzag parts', 'curved parts', 'triangle parts', 'diamond parts', 
    'heart shaped parts', 'star patterns'
  ];

  // African American Skin Tones (20 variations)
  static AFRICAN_AMERICAN_SKIN_TONES = [
    'fair brown skin', 'light caramel skin', 'warm beige skin', 'peachy brown skin',
    'light bronze skin', 'warm honey skin', 'golden caramel skin', 'honey bronze skin',
    'caramel skin', 'deep amber skin', 'golden bronze skin', 'warm mahogany skin',
    'cool espresso skin', 'dark chocolate skin', 'deep umber skin', 'cool walnut skin',
    'rich coffee skin', 'deep chestnut skin', 'rich cocoa skin', 'deep ebony skin'
  ];

  // African American Cultural Settings (19 options - mixed & specific)
  static AFRICAN_AMERICAN_SETTINGS = [
    'vibrant African American neighborhood', 'community center', 'beautiful church', 
    'family home', 'cultural center', 'historical landmark', 'suburban neighborhood',
    'modern American suburb', 'middle-class community', 'well-maintained school',
    'public library', 'shopping mall', 'local park', 'family restaurant',
    'HBCU campus', 'community garden', 'Black-owned business district', 'cultural arts center', 
    'jazz club venue', 'soul food restaurant', 'barbershop community space', 'family reunion park', 
    'African American museum', 'neighborhood basketball court', 'church fellowship hall', 
    'mentorship program center', 'youth development center'
  ];

  // Cultural Pride Elements (12 options)
  static CULTURAL_PRIDE_ELEMENTS = [
    'cultural pride symbols', 'community strength', 'modern urban style', 'rich heritage', 
    'historical legacy', 'community leadership', 'artistic expression', 'musical heritage', 
    'strong family bonds', 'educational excellence', 'entrepreneurial spirit', 'social justice values'
  ];

  // ============= CORE CULTURAL LOGIC =============
  
  static shouldApplyAfricanAmericanCulturalVariations(userInfo) {
    return userInfo.nativeLanguage === 'en' && userInfo.avatar?.skinTone === 'dark';
  }
  
  static generateExpandedAfricanAmericanFeatures() {
    const features = {
      eyes: [
        'almond-shaped dark brown eyes', 'round rich brown eyes', 'deep-set hazel eyes',
        'prominent amber eyes', 'almond-shaped hazel-green eyes', 'round dark brown eyes',
        'deep-set rich brown eyes', 'prominent hazel eyes', 'almond-shaped amber eyes',
        'round hazel-green eyes', 'expressive dark brown eyes', 'bright amber eyes',
        'warm hazel eyes', 'intelligent dark brown eyes', 'sparkling hazel-green eyes',
        'wide-set brown eyes', 'close-set amber eyes', 'upturned dark eyes',
        'downturned warm eyes', 'monolid brown eyes'
      ],
      nose: [
        'wider nasal bridge', 'fuller rounded nostrils', 'broad noble nose', 'narrow refined nose',
        'button nose shape', 'straight elegant nose', 'distinctive nose bridge', 'well-proportioned nose',
        'aquiline nose profile', 'slightly upturned nose', 'prominent nose bridge', 'delicate nose shape',
        'strong nose structure', 'refined nose tip', 'broad nose base'
      ],
      lips: [
        'fuller well-defined lips', 'naturally full lips', 'heart-shaped lips', 'bow-shaped lips',
        'beautifully full lips', 'expressive full lips', 'naturally defined lips',
        'curved upper lip', 'prominent lower lip', 'balanced lip proportion',
        'soft full lips', 'defined lip corners', 'naturally plump lips'
      ],
      facialStructure: [
        'high cheekbones', 'strong jawline', 'rounded face shape', 'oval face shape',
        'smooth facial contours', 'natural facial symmetry', 'elegant bone structure',
        'defined cheekbones', 'graceful jawline', 'harmonious facial features',
        'angular face shape', 'soft facial curves', 'prominent chin', 'delicate chin',
        'wide face structure', 'narrow face profile'
      ],
      cheekbones: [
        'high prominent cheekbones', 'subtly defined cheekbones', 'naturally sculpted cheekbones',
        'graceful cheek contours', 'strong cheekbone structure', 'soft cheek definition'
      ]
    };
    
    const selectRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
    
    const eyes = selectRandom(features.eyes);
    const nose = selectRandom(features.nose);
    const lips = selectRandom(features.lips);
    const structure = selectRandom(features.facialStructure);
    const cheekbones = selectRandom(features.cheekbones);
    
    return `${eyes}, ${nose}, ${lips}, ${structure}, ${cheekbones}`;
  }
  
  // NEW: Enhanced Cultural Setting Logic - ENHANCE AI settings instead of overriding
  static enhanceAISettingWithCulture(aiSettingData, userInfo, culturalProfile) {
    const aiLocation = aiSettingData?.setting?.location || aiSettingData?.location || "indoor scene";
    
    if (this.shouldApplyAfricanAmericanCulturalVariations(userInfo)) {
      // Enhancement mapping for African American cultural context
      const culturalEnhancements = {
        'bedroom': 'cozy bedroom with African American family photos and cultural artwork',
        'home': 'family home with cultural heritage displays and family pictures', 
        'kitchen': 'warm kitchen with soul food ingredients and family recipes',
        'living room': 'comfortable living room with African American art and family memorabilia',
        'school': 'diverse classroom with multicultural learning materials',
        'classroom': 'diverse classroom with multicultural learning materials',
        'park': 'community park with diverse families and cultural celebration elements',
        'library': 'public library with African American literature and cultural resources',
        'restaurant': 'family-friendly restaurant with diverse community atmosphere',
        'playground': 'neighborhood playground with diverse children and families',
        'garden': 'community garden with diverse gardeners and cultural plants',
        'store': 'neighborhood store with diverse community members',
        'church': 'beautiful church with strong community fellowship',
        'museum': 'cultural museum celebrating African American heritage'
      };
      
      // Find best match or add generic cultural context
      for (const [key, enhancement] of Object.entries(culturalEnhancements)) {
        if (aiLocation.toLowerCase().includes(key)) {
          return enhancement;
        }
      }
      
      // Fallback: enhance with generic cultural modifiers
      return `${aiLocation} with African American cultural elements and community atmosphere`;
    }
    
    // For International routes (non-English), add appropriate cultural context
    if (userInfo.nativeLanguage !== 'en') {
      const culturalModifiers = {
        'es': 'with Latino/Hispanic cultural elements',
        'fr': 'with French cultural touches',
        'zh': 'with Chinese cultural elements',
        'ar': 'with Arabic cultural atmosphere',
        'hi': 'with Indian cultural elements',
        'pt': 'with Portuguese/Brazilian cultural touches'
      };
      
      const modifier = culturalModifiers[userInfo.nativeLanguage] || 'with appropriate cultural elements';
      return `${aiLocation} ${modifier}`;
    }
    
    // For Standard American Route (English + Non-Dark skin) - CULTURAL BYPASS
    // Return AI setting as-is with minimal enhancement
    return aiLocation;
  }
  
  // LEGACY: Keep for backward compatibility but mark as deprecated
  static selectCulturalSetting(userInfo, culturalProfile) {
    console.warn('⚠️ selectCulturalSetting is deprecated. Use enhanceAISettingWithCulture instead.');
    if (this.shouldApplyAfricanAmericanCulturalVariations(userInfo)) {
      return this.selectRandomElement(this.AFRICAN_AMERICAN_SETTINGS);
    }
    
    return this.selectRandomElement(culturalProfile.settings || []);
  }
  
  static selectRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  static detectGender(userInfo) {
    // Simple gender detection logic
    const name = userInfo.name?.toLowerCase() || '';
    const interests = userInfo.interests?.join(' ').toLowerCase() || '';
    
    // Look for typical girl indicators
    if (name.includes('a') && name.length > 3) return 'girl';
    if (interests.includes('princess') || interests.includes('doll')) return 'girl';
    
    // Default based on avatar or random
    return Math.random() > 0.5 ? 'girl' : 'boy';
  }

  static getAfricanAmericanHairStyle(userInfo) {
    if (this.shouldApplyAfricanAmericanCulturalVariations(userInfo)) {
      const gender = this.detectGender(userInfo);
      const hairStyles = gender === 'girl' ? this.GIRLS_HAIR_STYLES : this.BOYS_HAIR_STYLES;
      return this.selectRandomElement(hairStyles);
    }
    
    // Fallback for non-African American users
    const universalHairMap = {
      'pale': 'red hair',
      'light': 'blonde hair', 
      'medium': 'brown hair',
      'olive': 'black hair',
      'dark': 'dark brown hair'
    };
    
    return universalHairMap[userInfo.avatar?.skinTone] || 'brown hair';
  }

  static getAfricanAmericanSkinTone(userInfo) {
    if (this.shouldApplyAfricanAmericanCulturalVariations(userInfo)) {
      return this.selectRandomElement(this.AFRICAN_AMERICAN_SKIN_TONES);
    }
    
    // Fallback for other users
    return userInfo.avatar?.skinTone || 'medium skin';
  }

  static selectCulturalPrideElement(userInfo) {
    if (this.shouldApplyAfricanAmericanCulturalVariations(userInfo)) {
      return this.selectRandomElement(this.CULTURAL_PRIDE_ELEMENTS);
    }
    
    // Fallback for other cultures
    return 'cultural heritage';
  }
  
  static buildAdvancedCharacterDescription(userInfo, culturalProfile, characterSeed) {
    if (this.shouldApplyAfricanAmericanCulturalVariations(userInfo)) {
      const africanAmericanFeatures = this.generateExpandedAfricanAmericanFeatures();
      const specificHairStyle = this.getAfricanAmericanHairStyle(userInfo);
      const specificSkinTone = this.getAfricanAmericanSkinTone(userInfo);
      const culturalPrideElement = this.selectCulturalPrideElement(userInfo);
      const gender = this.detectGender(userInfo);
      
      return `${userInfo.name || 'Alex'} (${gender} with ${specificSkinTone}, ${africanAmericanFeatures}, ${specificHairStyle}, ${culturalPrideElement})`;
    }
    
    return `${userInfo.name || 'child'} with ${userInfo.avatar?.skinTone || 'medium'} skin`;
  }
  
  static buildPremiumPrompt(storyText, userInfo, characterSeed, culturalProfile, sceneContext, emotionalContext, styleFramework, visualStateData = {}) {
    const characterDescription = this.buildAdvancedCharacterDescription(userInfo, culturalProfile, characterSeed);
    
    // Use existing setting if available, otherwise select new one
    let setting = visualStateData.existingSetting || this.selectCulturalSetting(userInfo, culturalProfile);
    
    // Build base prompt with scene and character
    let prompt = `${sceneContext} featuring ${characterDescription} in ${setting}`;
    
    // Add visual consistency from tracked objects and details
    if (visualStateData.visualDetails) {
      prompt += `, with ${visualStateData.visualDetails}`;
    }
    
    if (visualStateData.storyStateDetails) {
      prompt += `, maintaining ${visualStateData.storyStateDetails}`;
    }
    
    // Add page progression context for environmental consistency
    if (visualStateData.pageNumber > 1 && visualStateData.totalPages) {
      prompt += `, story progression ${visualStateData.pageNumber}/${visualStateData.totalPages}, maintaining visual continuity`;
    }
    
    // Add emotional context
    if (emotionalContext && emotionalContext.mood !== 'neutral') {
      prompt += `, ${emotionalContext.mood} mood and atmosphere`;
    }
    
    // Integrate style framework specifications
    if (styleFramework) {
      // Add art style
      if (styleFramework.artStyle) {
        prompt += `, ${styleFramework.artStyle}`;
      }
      
      // Add color palette with emotional enhancement
      if (styleFramework.colorPalette) {
        const enhancedColorPalette = this.enhanceColorPaletteWithEmotion(styleFramework.colorPalette, emotionalContext);
        prompt += `, ${enhancedColorPalette}`;
      }
      
      // Add lighting
      if (styleFramework.lighting) {
        prompt += `, ${styleFramework.lighting}`;
      }
      
      // Add texture and composition
      if (styleFramework.texture) {
        prompt += `, ${styleFramework.texture}`;
      }
      
      if (styleFramework.composition) {
        prompt += `, ${styleFramework.composition}`;
      }
      
      // Add quality specifications
      if (styleFramework.quality) {
        prompt += `, ${styleFramework.quality}`;
      }
      
      // Add style framework's specific prompt
      if (styleFramework.prompt) {
        prompt += `, ${styleFramework.prompt}`;
      }
    } else {
      // Fallback quality enhancements if no style framework
      prompt += ', ultra high resolution, professional children\'s book illustration, vibrant colors, perfect lighting';
    }
    
    // Add children's book context
    prompt += ', children\'s book illustration style, safe for children, consistent character appearance';
    
    return prompt;
  }

  /**
   * Enhance color palette based on emotional context
   */
  static enhanceColorPaletteWithEmotion(colorPalette, emotionalContext) {
    if (!emotionalContext || !emotionalContext.mood || emotionalContext.mood === 'neutral') {
      return colorPalette;
    }
    
    // Map emotions to color enhancements
    const emotionColorMap = {
      happy: 'bright and cheerful colors',
      sad: 'muted and gentle colors', 
      excited: 'vibrant and energetic colors',
      calm: 'soft and soothing colors',
      mysterious: 'deep and atmospheric colors',
      adventure: 'bold and dynamic colors',
      joyful: 'luminous and uplifting colors',
      peaceful: 'serene and harmonious colors'
    };
    
    // Find matching emotion
    for (const [emotion, colorEnhancement] of Object.entries(emotionColorMap)) {
      if (emotionalContext.mood.toLowerCase().includes(emotion)) {
        return `${colorPalette} with ${colorEnhancement}`;
      }
    }
    
    return colorPalette;
  }
  
  static detectEmotionalContext(text) {
    return {
      mood: 'neutral',
      intensity: 0.5,
      colorPalette: 'balanced',
      lighting: 'soft',
      composition: 'centered'
    };
  }
  
  static CULTURAL_VISUAL_PROFILES = {
    'en': {
      settings: this.AFRICAN_AMERICAN_SETTINGS,
      skinTones: this.AFRICAN_AMERICAN_SKIN_TONES,
      boysHairStyles: this.BOYS_HAIR_STYLES,
      girlsHairStyles: this.GIRLS_HAIR_STYLES,
      culturalElements: this.CULTURAL_PRIDE_ELEMENTS,
      negativePrompts: ['stereotypical', 'caricature', 'offensive portrayal', 'negative stereotypes', 'inaccurate representation', 'degrading imagery']
    }
  };
}

// For CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FrontendIntelligence };
}