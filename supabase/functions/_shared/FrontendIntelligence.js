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
  
  static selectCulturalSetting(userInfo, culturalProfile) {
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
  
  static buildPremiumPrompt(storyText, userInfo, characterSeed, culturalProfile, sceneContext, emotionalContext, qualityEnhancements) {
    const characterDescription = this.buildAdvancedCharacterDescription(userInfo, culturalProfile, characterSeed);
    const setting = this.selectCulturalSetting(userInfo, culturalProfile);
    
    return `${storyText} featuring ${characterDescription} in ${setting}. ${qualityEnhancements}. Children's book illustration style, safe for children, consistent character appearance.`;
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