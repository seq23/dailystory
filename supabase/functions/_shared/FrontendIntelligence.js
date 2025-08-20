// Frontend Intelligence - Auto-generated from 2025-01-20T22:30:00.000Z
// This file contains real AI functions extracted from frontend TypeScript services

export class FrontendIntelligence {
  
  // ============= FIXED CULTURAL LOGIC =============
  
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
      const africanAmericanSettings = [
        'vibrant urban neighborhood', 'community cultural center', 'historic Black church',
        'family barbershop', 'community garden', 'local soul food restaurant',
        'neighborhood block party', 'community celebration', 'family reunion',
        'cultural heritage center', 'community library', 'local community center'
      ];
      const selectRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
      return selectRandom(africanAmericanSettings);
    }
    
    const selectRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
    return selectRandom(culturalProfile.settings || []);
  }
  
  static getUniversalHairMapping(userInfo) {
    if (!userInfo?.avatar?.skinTone) return 'brown';
    
    if (userInfo.avatar.skinTone === 'dark' && userInfo.nativeLanguage === 'en') {
      return 'natural textured hair';
    }
    
    const universalHairMap = {
      'pale': 'red',
      'light': 'blonde', 
      'medium': 'brown',
      'olive': 'black',
      'dark': 'textured black hair variety'
    };
    
    return universalHairMap[userInfo.avatar.skinTone] || 'brown';
  }
  
  static buildAdvancedCharacterDescription(userInfo, culturalProfile, characterSeed) {
    if (this.shouldApplyAfricanAmericanCulturalVariations(userInfo)) {
      const africanAmericanFeatures = this.generateExpandedAfricanAmericanFeatures();
      const hairMapping = this.getUniversalHairMapping(userInfo);
      return `${userInfo.name || 'Alex'} (girl with dark skin and ${hairMapping}, ${africanAmericanFeatures})`;
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
      settings: ['suburban neighborhood', 'community center', 'family home'],
      negativePrompts: ['stereotypical', 'caricature', 'offensive portrayal']
    }
  };
}

// For CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FrontendIntelligence };
}