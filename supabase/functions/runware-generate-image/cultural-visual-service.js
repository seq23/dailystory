// Cultural Visual Service for Enhanced Multicultural Character Representation
// This module provides comprehensive cultural visual profiles for authentic character representation

const CULTURAL_VISUAL_PROFILES = {
  'ar': {
    skinTones: ['warm olive skin', 'golden bronze skin', 'deep amber skin', 'honey-toned skin', 'rich caramel skin'],
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
    skinTones: ['warm caramel skin', 'sun-kissed bronze skin', 'rich copper skin', 'golden olive skin', 'warm tan skin'],
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
    skinTones: ['porcelain skin', 'warm honey skin', 'golden tan skin', 'light olive skin', 'soft peachy skin'],
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
    skinTones: ['warm wheat skin', 'rich mahogany skin', 'deep bronze skin', 'golden brown skin', 'warm amber skin'],
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
    skinTones: ['golden olive skin', 'warm caramel skin', 'rich mocha skin', 'sun-kissed bronze skin', 'tropical tan skin'],
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
    skinTones: ['fair rose skin', 'warm peach skin', 'golden olive skin', 'light tan skin', 'creamy complexion'],
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
    skinTones: ['rich cocoa skin', 'deep ebony skin', 'warm mahogany skin', 'golden bronze skin', 'deep amber skin', 'caramel skin', 'honey bronze skin'],
    hairStyles: ['natural afro hair', 'protective braids', 'twist hairstyles', 'beautiful locs', 'silk press hair', 'cornrow braids', 'bantu knots', 'wash and go curls'],
    facialFeatures: ['beautiful dark eyes', 'strong cheekbones', 'radiant smile', 'confident expression', 'regal bearing', 'kind eyes', 'proud posture'],
    culturalElements: ['African patterns', 'cultural pride symbols', 'traditional textiles', 'African art', 'community strength', 'cultural heritage'],
    familyStructure: ['strong family bonds', 'community support', 'church family', 'multigenerational wisdom', 'extended family gathering', 'neighborhood community'],
    settings: ['vibrant African American neighborhood', 'community center', 'beautiful church', 'family home', 'cultural center', 'historical landmark'],
    clothing: ['traditional African dress', 'modern African American fashion', 'cultural celebration attire', 'Sunday best clothing', 'contemporary style'],
    celebrations: ['Juneteenth celebration', 'family reunion', 'church gathering', 'community festival', 'cultural pride event', 'graduation celebration'],
    negativePrompts: ['stereotypical', 'caricature', 'offensive portrayal', 'negative stereotypes', 'inaccurate representation', 'degrading imagery']
  }
};

export class MulticulturalVisualService {
  static getCulturalVisualProfile(nativeLanguage) {
    return CULTURAL_VISUAL_PROFILES[nativeLanguage] || CULTURAL_VISUAL_PROFILES['en'];
  }

  static generateCulturalCharacterDescription(userInfo) {
    const profile = this.getCulturalVisualProfile(userInfo.nativeLanguage);
    const skinTone = this.selectRandomElement(profile.skinTones);
    const hairStyle = this.selectRandomElement(profile.hairStyles);
    const facialFeatures = this.selectRandomElement(profile.facialFeatures);
    const culturalElement = this.selectRandomElement(profile.culturalElements);

    const genderTerm = userInfo.avatar.type === 'boy' ? 'boy' : 'girl';
    
    return `${genderTerm} with ${skinTone}, ${hairStyle}, ${facialFeatures}, ${culturalElement}`;
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
    const profile = this.getCulturalVisualProfile(userInfo.nativeLanguage);
    const setting = this.selectRandomElement(profile.settings);
    const culturalElement = this.selectRandomElement(profile.culturalElements);
    
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