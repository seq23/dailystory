import { SupportedLanguage } from "@/types/multilingual";
import { UserInfo, SkinTone } from "@/types";

export interface CulturalVisualProfile {
  skinTones: string[];
  hairStyles: string[];
  facialFeatures: string[];
  culturalElements: string[];
  familyStructure: string[];
  settings: string[];
  clothing: string[];
  celebrations: string[];
  negativePrompts: string[];
}

export class MulticulturalVisualService {
  private static readonly CULTURAL_VISUAL_PROFILES: Record<SupportedLanguage, CulturalVisualProfile> = {
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

  static getCulturalVisualProfile(nativeLanguage: SupportedLanguage): CulturalVisualProfile {
    return this.CULTURAL_VISUAL_PROFILES[nativeLanguage] || this.CULTURAL_VISUAL_PROFILES['en'];
  }

  static generateCulturalCharacterDescription(userInfo: UserInfo): string {
    // Special handling for English speakers with dark skin - mix African American and general American
    if (userInfo.nativeLanguage === 'en' && userInfo.avatar?.skinTone === 'dark') {
      return this.generateMixedAfricanAmericanDescription(userInfo);
    }
    
    const profile = this.getCulturalVisualProfile(userInfo.nativeLanguage);
    
    // Map user's basic skin tone choice to detailed skin tone description
    const skinTone = this.mapSkinToneToDescription(userInfo.avatar.skinTone, profile);
    const hairStyle = this.getCulturallyAppropriateHairStyle(userInfo);
    const facialFeatures = this.selectRandomElement(profile.facialFeatures);
    const culturalElement = this.selectRandomElement(profile.culturalElements);

    const genderTerm = userInfo.avatar.type === 'boy' ? 'boy' : 
                      userInfo.avatar.type === 'girl' ? 'girl' : 'child';
    
    return `${genderTerm} with ${skinTone}, ${hairStyle}, ${facialFeatures}, ${culturalElement}`;
  }

  static generateMixedAfricanAmericanDescription(userInfo: UserInfo): string {
    const profile = this.getCulturalVisualProfile('en');
    const genderTerm = userInfo.avatar.type === 'boy' ? 'boy' : 
                      userInfo.avatar.type === 'girl' ? 'girl' : 'child';
    
    // Map user's basic skin tone choice to detailed African American skin tone description
    const skinTone = this.mapSkinToneToDescription(userInfo.avatar.skinTone, profile);
    
    // Get culturally appropriate hair style for African American heritage
    const hairStyle = this.getCulturallyAppropriateHairStyle(userInfo);
    
    // Weighted selection favoring African American facial features (70/30)
    const africanAmericanFeatures = [
      'beautiful dark eyes', 'strong cheekbones', 'radiant smile', 'confident expression', 
      'regal bearing', 'warm deep brown eyes', 'expressive dark eyes', 'proud smile',
      'bright intelligent eyes', 'strong jawline', 'dignified bearing', 'gentle dark eyes',
      'radiant warm smile', 'noble features', 'kind dark eyes', 'confident gaze',
      'warm personality', 'strong facial structure', 'graceful features', 'wise eyes'
    ];
    const generalAmericanFeatures = [
      'bright hazel eyes', 'gentle smile', 'expressive brown eyes', 'warm personality', 
      'friendly demeanor', 'kind green eyes', 'cheerful expression', 'bright blue eyes'
    ];
    
    const facialFeatures = Math.random() < 0.7 
      ? this.selectRandomElement(africanAmericanFeatures)
      : this.selectRandomElement(generalAmericanFeatures);
    
    // Weighted selection with expanded African American cultural elements (60/40)
    const africanAmericanCulture = [
      'cultural pride symbols', 'community strength', 'modern urban style', 'rich heritage',
      'historical legacy', 'community leadership', 'artistic expression', 'musical heritage',
      'strong family bonds', 'educational excellence', 'entrepreneurial spirit', 'social justice values'
    ];
    const mainstreamAmericanCulture = [
      'mainstream American culture', 'suburban lifestyle', 'educational achievement', 
      'middle-class values', 'professional success', 'academic excellence'
    ];
    
    const culturalElement = Math.random() < 0.6
      ? this.selectRandomElement(africanAmericanCulture)
      : this.selectRandomElement(mainstreamAmericanCulture);
    
    return `${genderTerm} with ${skinTone}, ${hairStyle}, ${facialFeatures}, ${culturalElement}`;
  }

  private static getCulturallyAppropriateHairStyle(userInfo: UserInfo): string {
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

  static generateCulturalSecondaryCharacters(userInfo: UserInfo, count: number = 2): string[] {
    const profile = this.getCulturalVisualProfile(userInfo.nativeLanguage);
    const characters: string[] = [];

    for (let i = 0; i < count; i++) {
      const familyType = this.selectRandomElement(profile.familyStructure);
      const skinTone = this.selectRandomElement(profile.skinTones);
      const hairStyle = this.selectRandomElement(profile.hairStyles);
      
      characters.push(`${familyType} member with ${skinTone} and ${hairStyle}`);
    }

    return characters;
  }

  static generateCulturalSetting(userInfo: UserInfo): string {
    // Special handling for English speakers with dark skin - mix urban and suburban settings
    if (userInfo.nativeLanguage === 'en' && userInfo.avatar?.skinTone === 'dark') {
      return this.generateMixedAfricanAmericanSetting(userInfo);
    }
    
    const profile = this.getCulturalVisualProfile(userInfo.nativeLanguage);
    const setting = this.selectRandomElement(profile.settings);
    const culturalElement = this.selectRandomElement(profile.culturalElements);
    
    return `${setting} with ${culturalElement}`;
  }

  static generateMixedAfricanAmericanSetting(userInfo: UserInfo): string {
    const profile = this.getCulturalVisualProfile('en');
    
    // Weighted selection: 65% diverse African American settings, 35% general American settings
    const isAfricanAmericanSetting = Math.random() < 0.65;
    
    const africanAmericanSettings = [
      'vibrant African American neighborhood', 'community center', 'beautiful church', 
      'cultural center', 'historical landmark', 'HBCU campus', 'community garden',
      'Black-owned business district', 'cultural arts center', 'jazz club venue',
      'soul food restaurant', 'barbershop community space', 'family reunion park',
      'African American museum', 'community library', 'neighborhood basketball court',
      'church fellowship hall', 'mentorship program center', 'youth development center'
    ];
    const generalAmericanSettings = [
      'suburban neighborhood', 'modern American suburb', 'middle-class community', 
      'well-maintained school', 'public library', 'local park', 'shopping center',
      'community recreation center', 'family-friendly restaurant'
    ];
    
    const setting = isAfricanAmericanSetting 
      ? this.selectRandomElement(africanAmericanSettings)
      : this.selectRandomElement(generalAmericanSettings);
    
    const culturalElement = isAfricanAmericanSetting
      ? this.selectRandomElement(['cultural pride symbols', 'community strength', 'modern urban style', 'rich heritage', 'strong community bonds'])
      : this.selectRandomElement(['mainstream American culture', 'suburban lifestyle', 'middle-class family values']);
    
    return `${setting} with ${culturalElement}`;
  }

  static generateCulturalNegativePrompt(userInfo: UserInfo): string {
    const profile = this.getCulturalVisualProfile(userInfo.nativeLanguage);
    const generalNegatives = [
      'low quality', 'blurry', 'distorted', 'amateur', 'poorly drawn',
      'incorrect anatomy', 'disproportionate', 'ugly', 'disfigured'
    ];
    
    return [...generalNegatives, ...profile.negativePrompts].join(', ');
  }

  static getCulturalClothing(userInfo: UserInfo): string {
    const profile = this.getCulturalVisualProfile(userInfo.nativeLanguage);
    return this.selectRandomElement(profile.clothing);
  }

  static getCulturalCelebration(userInfo: UserInfo): string {
    const profile = this.getCulturalVisualProfile(userInfo.nativeLanguage);
    return this.selectRandomElement(profile.celebrations);
  }

  private static mapSkinToneToDescription(basicSkinTone: SkinTone, profile: CulturalVisualProfile): string {
    const skinTones = profile.skinTones;
    const totalTones = skinTones.length;
    
    // Map basic skin tone to appropriate ranges within the detailed skin tone array
    switch (basicSkinTone) {
      case 'light':
        // Select from first third of the skin tone array (lightest)
        const lightRange = skinTones.slice(0, Math.ceil(totalTones / 3));
        return this.selectRandomElement(lightRange);
        
      case 'medium':
        // Select from middle third of the skin tone array
        const mediumStart = Math.ceil(totalTones / 3);
        const mediumEnd = Math.ceil(totalTones * 2 / 3);
        const mediumRange = skinTones.slice(mediumStart, mediumEnd);
        return this.selectRandomElement(mediumRange);
        
      case 'dark':
        // Select from last third of the skin tone array (darkest)
        const darkStart = Math.ceil(totalTones * 2 / 3);
        const darkRange = skinTones.slice(darkStart);
        return this.selectRandomElement(darkRange);
        
      case 'olive':
        // For olive, select from skin tones that contain "olive" or middle range if none
        const oliveTones = skinTones.filter(tone => tone.includes('olive'));
        if (oliveTones.length > 0) {
          return this.selectRandomElement(oliveTones);
        }
        // Fallback to medium range if no olive tones available
        const oliveMediumStart = Math.ceil(totalTones / 3);
        const oliveMediumEnd = Math.ceil(totalTones * 2 / 3);
        const oliveMediumRange = skinTones.slice(oliveMediumStart, oliveMediumEnd);
        return this.selectRandomElement(oliveMediumRange);
        
      case 'pale':
        // Select from very first entries (lightest possible)
        const paleRange = skinTones.slice(0, Math.max(1, Math.ceil(totalTones / 4)));
        return this.selectRandomElement(paleRange);
        
      default:
        // Fallback to random selection from middle range
        const defaultStart = Math.ceil(totalTones / 3);
        const defaultEnd = Math.ceil(totalTones * 2 / 3);
        const defaultRange = skinTones.slice(defaultStart, defaultEnd);
        return this.selectRandomElement(defaultRange);
    }
  }

  private static selectRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  // Melanin-optimized generation parameters for better skin tone rendering
  static getOptimizedGenerationParams(userInfo: UserInfo): { 
    cfgScale: number; 
    steps: number; 
    scheduler: string;
    strength: number;
  } {
    const isDarkerSkinTone = ['ar', 'hi', 'en'].includes(userInfo.nativeLanguage);
    
    return {
      cfgScale: isDarkerSkinTone ? 1.2 : 1.0,
      steps: isDarkerSkinTone ? 6 : 4,
      scheduler: "FlowMatchEulerDiscreteScheduler",
      strength: isDarkerSkinTone ? 0.9 : 0.8
    };
  }

  // Anti-bias quality enhancement terms
  static getQualityEnhancementTerms(userInfo: UserInfo): string {
    const profile = this.getCulturalVisualProfile(userInfo.nativeLanguage);
    const baseQuality = 'ultra high resolution, professional children\'s book illustration, beautiful, dignified, respectful representation';
    
    const culturalQuality = userInfo.nativeLanguage === 'en' ? 
      ', melanin-rich skin tones, natural hair textures, positive African American representation' :
      ', authentic cultural representation, respectful portrayal, cultural pride';

    return `${baseQuality}${culturalQuality}`;
  }
}