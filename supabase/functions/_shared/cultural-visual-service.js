// Cultural Visual Service for Enhanced Multicultural Character Representation
// This module provides comprehensive cultural visual profiles for authentic character representation

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
    hairStyles: ['elegant French braids', 'chic bob cut', 'sophisticated updo', 'natural wavy hair', 'stylish modern cut', 'natural afro hair', 'protective braids', 'twist hairstyles', 'beautiful locs'],
    facialFeatures: ['bright eyes', 'refined features', 'elegant smile', 'sophisticated expression', 'charming demeanor', 'beautiful dark eyes', 'strong cheekbones', 'radiant smile', 'confident expression'],
    culturalElements: ['French elegance', 'artistic elements', 'cultural sophistication', 'traditional patterns', 'refined aesthetics', 'African-French heritage', 'Francophone African culture', 'Parisian diversity', 'West African French influence', 'multicultural France'],
    familyStructure: ['intimate family gathering', 'grandparents storytelling', 'elegant family dinner', 'cultural tradition', 'family celebration', 'African diaspora family', 'Francophone community', 'multicultural gathering'],
    settings: ['charming French countryside', 'elegant Parisian street', 'beautiful French garden', 'traditional French home', 'cultural landmark', 'multicultural Paris neighborhood', 'French colonial architecture', 'African community in France', 'modern Dakar street', 'Francophone African city', 'Abidjan marketplace', 'Bamako modern district'],
    clothing: ['chic French fashion', 'elegant dress', 'sophisticated style', 'cultural formal wear', 'modern French clothing', 'African print with French cut', 'dashiki with modern jeans', 'kente accents on French fashion', 'traditional headwrap with chic outfit', 'Parisian style with African jewelry', 'French blazer with traditional patterns', 'modern Senegalese fashion', 'Ivorian-French fusion style'],
    celebrations: ['French cultural festival', 'family feast', 'traditional celebration', 'elegant gathering', 'cultural event', 'African-French cultural celebration', 'Francophone heritage festival', 'multicultural community event'],
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
    // Mix of African American and general American facial features
    facialFeatures: [
      'beautiful dark eyes', 'strong cheekbones', 'radiant smile', 'confident expression', 
      'regal bearing', 'kind eyes', 'proud posture', 'bright hazel eyes', 'gentle smile',
      'expressive brown eyes', 'warm personality', 'friendly demeanor', 'intelligent gaze'
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

export class MulticulturalVisualService {
  static getCulturalVisualProfile(nativeLanguage) {
    return CULTURAL_VISUAL_PROFILES[nativeLanguage] || CULTURAL_VISUAL_PROFILES['en'];
  }

  static generateCulturalCharacterDescription(userInfo) {
    if (!userInfo || !userInfo.avatar) {
      console.warn('⚠️ Missing userInfo or avatar, using default character');
      return 'friendly child with warm smile';
    }

    // Handle "prefer not to answer" avatar type
    const genderTerm = userInfo.avatar.type === 'neutral' || userInfo.avatar.type === 'prefer not to answer' 
      ? 'child' 
      : userInfo.avatar.type === 'boy' ? 'boy' : 'girl';

    // Special handling for English speakers with dark skin - mix African American and general American
    if (userInfo.nativeLanguage === 'en' && userInfo.avatar?.skinTone === 'dark') {
      return this.generateMixedAfricanAmericanDescription(userInfo, genderTerm);
    }
    
    const profile = this.getCulturalVisualProfile(userInfo.nativeLanguage);
    
    // Map skin tone properly
    const skinToneMapping = {
      'pale': 'fair skin with rosy cheeks',
      'light': 'light skin with warm undertones',
      'medium': 'medium skin with golden undertones', 
      'olive': 'olive skin with warm bronze undertones',
      'dark': this.getDarkSkinCulturalDescription(userInfo.nativeLanguage)
    };

    const skinTone = skinToneMapping[userInfo.avatar.skinTone] || skinToneMapping['medium'];
    const hairStyle = this.getCulturallyAppropriateHairStyle(userInfo);
    const facialFeatures = this.selectRandomElement(profile.facialFeatures);
    const culturalElement = this.selectRandomElement(profile.culturalElements);
    
    console.log(`🎭 Unified Character: ${genderTerm} with ${skinTone}, ${hairStyle}`);
    
    return `${genderTerm} with ${skinTone}, ${hairStyle}, ${facialFeatures}, ${culturalElement}`;
  }

  static generateMixedAfricanAmericanDescription(userInfo, genderTerm = null) {
    const profile = this.getCulturalVisualProfile('en');
    const finalGenderTerm = genderTerm || (userInfo.avatar?.type === 'boy' ? 'boy' : 'girl');
    
    // Use specific African American skin tone description
    const skinTone = 'rich African American brown skin';
    
    // Get culturally appropriate hair style for African American heritage
    const hairStyle = this.getCulturallyAppropriateHairStyle(userInfo);
    
    // Mix African American and general American facial features (50/50 chance)
    const facialFeatures = Math.random() < 0.5 
      ? this.selectRandomElement(['beautiful dark eyes', 'strong cheekbones', 'radiant smile', 'confident expression', 'regal bearing'])
      : this.selectRandomElement(['bright hazel eyes', 'gentle smile', 'expressive brown eyes', 'warm personality', 'friendly demeanor']);
    
    // Mix cultural pride elements with mainstream American (50/50 chance)  
    const culturalElement = Math.random() < 0.5
      ? this.selectRandomElement(['cultural pride symbols', 'community strength', 'modern urban style'])
      : this.selectRandomElement(['mainstream American culture', 'suburban lifestyle', 'educational achievement']);
    
    console.log(`🎭 Mixed AA Character: ${finalGenderTerm} with ${skinTone}, ${hairStyle}, ${facialFeatures}, ${culturalElement}`);
    
    return `${finalGenderTerm} with ${skinTone}, ${hairStyle}, ${facialFeatures}, ${culturalElement}`;
  }

  static getDarkSkinCulturalDescription(nativeLanguage) {
    const culturalDescriptions = {
      'es': 'rich Afro-Latina brown skin',
      'ar': 'rich Middle Eastern brown skin', 
      'hi': 'rich South Asian brown skin',
      'zh': 'warm East Asian skin',
      'pt': 'rich Afro-Brazilian brown skin',
      'fr': 'rich Afro-French brown skin',
      'en': 'rich African American brown skin'
    };
    
    return culturalDescriptions[nativeLanguage] || 'rich brown skin';
  }

  static getCulturallyAppropriateHairStyle(userInfo) {
    // When language is English and skin tone is dark, use African American hair textures/styles
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

  static generateCulturalSecondaryCharacters(userInfo, count = 2) {
    const profile = this.getCulturalVisualProfile(userInfo.nativeLanguage);
    const characters = [];

    for (let i = 0; i < count; i++) {
      const familyType = this.selectRandomElement(profile.familyStructure);
      const skinTone = this.selectRandomElement(profile.skinTones);
      const hairStyle = this.selectRandomElement(profile.hairStyles);
      
      characters.push(`${familyType} member with ${skinTone} and ${hairStyle}`);
    }

    return characters;
  }

  static generateCulturalSetting(userInfo) {
    // Special handling for English speakers with dark skin - mix urban and suburban settings
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
    
    // 50/50 chance between African American urban settings and general American suburban settings
    const isUrbanSetting = Math.random() < 0.5;
    
    const setting = isUrbanSetting 
      ? this.selectRandomElement(['vibrant African American neighborhood', 'community center', 'beautiful church', 'cultural center', 'historical landmark'])
      : this.selectRandomElement(['suburban neighborhood', 'modern American suburb', 'middle-class community', 'well-maintained school', 'public library', 'local park']);
    
    const culturalElement = isUrbanSetting
      ? this.selectRandomElement(['cultural pride symbols', 'community strength', 'modern urban style'])
      : this.selectRandomElement(['mainstream American culture', 'suburban lifestyle', 'middle-class family values']);
    
    console.log(`🏘️ Mixed AA Setting: ${setting} with ${culturalElement} (Urban: ${isUrbanSetting})`);
    
    return `${setting} with ${culturalElement}`;
  }

  static generateCulturalNegativePrompt(userInfo) {
    const profile = this.getCulturalVisualProfile(userInfo.nativeLanguage);
    const generalNegatives = [
      'low quality', 'blurry', 'distorted', 'amateur', 'poorly drawn',
      'incorrect anatomy', 'disproportionate', 'ugly', 'disfigured'
    ];
    
    return [...generalNegatives, ...profile.negativePrompts].join(', ');
  }

  static getCulturalClothing(userInfo) {
    const profile = this.getCulturalVisualProfile(userInfo.nativeLanguage);
    return this.selectRandomElement(profile.clothing);
  }

  static getCulturalCelebration(userInfo) {
    const profile = this.getCulturalVisualProfile(userInfo.nativeLanguage);
    return this.selectRandomElement(profile.celebrations);
  }

  static getHairColorForSkinTone(skinTone, profile) {
    // Map skin tones to specific hair colors instead of random selection
    if (!skinTone) {
      return this.selectRandomElement(profile.hairStyles);
    }
    
    switch (skinTone) {
      case 'pale':
        return this.selectRandomElement([
          'ginger red hair', 'auburn wavy hair', 'copper-colored hair', 
          'strawberry blonde hair', 'natural red curls', 'russet brown hair'
        ]);
      case 'light':
        return this.selectRandomElement([
          'golden blonde hair', 'honey blonde hair', 'platinum blonde hair',
          'ash blonde hair', 'sandy blonde hair', 'light golden hair'
        ]);
      case 'medium':
        return this.selectRandomElement([
          'chestnut brown hair', 'chocolate brown hair', 'warm brown hair',
          'caramel brown hair', 'rich brunette hair', 'mahogany brown hair'
        ]);
      case 'olive':
        return this.selectRandomElement([
          'dark brown hair', 'jet black hair', 'espresso brown hair',
          'coal black hair', 'deep brunette hair', 'onyx black hair'
        ]);
      case 'dark':
        // Already handled in generateMixedAfricanAmericanDescription
        return this.selectRandomElement(profile.hairStyles);
      default:
        return this.selectRandomElement(profile.hairStyles);
    }
  }

  static selectRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  // Melanin-optimized generation parameters for better skin tone rendering
  static getOptimizedGenerationParams(userInfo) {
    const isDarkerSkinTone = ['ar', 'hi', 'en'].includes(userInfo.nativeLanguage);
    
    return {
      cfgScale: isDarkerSkinTone ? 1.2 : 1.0,
      steps: isDarkerSkinTone ? 6 : 4,
      scheduler: "FlowMatchEulerDiscreteScheduler",
      strength: isDarkerSkinTone ? 0.9 : 0.8
    };
  }

  // Anti-bias quality enhancement terms
  static getQualityEnhancementTerms(userInfo) {
    const profile = this.getCulturalVisualProfile(userInfo.nativeLanguage);
    const baseQuality = 'ultra high resolution, professional children\'s book illustration, beautiful, dignified, respectful representation';
    
    const culturalQuality = userInfo.nativeLanguage === 'en' ? 
      ', melanin-rich skin tones, natural hair textures, positive African American representation' :
      ', authentic cultural representation, respectful portrayal, cultural pride';

    return `${baseQuality}${culturalQuality}`;
  }
}