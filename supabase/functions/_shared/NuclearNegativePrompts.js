// ============= NUCLEAR HARDCODE NEGATIVE PROMPT SYSTEM =============
// Shared module for both Tier 1 (Orchestrator) and Tier 2.5 (Nuclear Fallback)
// Nuclear Independence: 90%+ hardcoded arrays for comprehensive safety filtering

// NUCLEAR BASE NEGATIVE PROMPT (Quality & Safety)
export const NUCLEAR_BASE_NEGATIVE_PROMPT = [
  // Quality Filters
  'low quality', 'blurry', 'distorted', 'deformed', 'bad anatomy', 'weird proportions', 
  'extra limbs', 'missing limbs', 'bad hands', 'malformed hands', 'extra fingers', 
  'missing fingers', 'crossed eyes', 'bad facial features', 'unrealistic skin', 
  'plastic appearance', 'oversaturated', 'undersaturated', 'overexposed', 'underexposed',
  
  // Safety Filters  
  'no text', 'no words', 'no letters', 'no writing', 'no signatures', 'watermarks',
  'adult content', 'inappropriate content', 'violence', 'weapons', 'scary imagery',
  
  // Technical Filters
  'artifacts', 'noise', 'grain', 'pixelated', 'compression artifacts', 'jpeg artifacts',
  'digital noise', 'color banding', 'posterization', 'aliasing',
  
  // Style Prevention
  'cartoon style', 'anime style', 'manga style', 'comic book style', 'sketch style',
  'abstract art', 'surreal art', 'horror style', 'gothic style'
];

// NUCLEAR OPPOSITE GENDER NEGATIVE PROMPT 
export const NUCLEAR_OPPOSITE_GENDER_NEGATIVES = {
  boy: [
    // Exclude feminine characteristics for boys
    'makeup', 'lipstick', 'mascara', 'nail polish', 'jewelry', 'earrings', 'necklace', 
    'bracelet', 'rings', 'feminine hairstyles', 'long flowing hair', 'curled hair', 
    'braided hair', 'ponytails', 'pigtails', 'hair bows', 'hair ribbons', 'feminine clothing',
    'dress', 'skirt', 'blouse', 'feminine tops', 'high heels', 'ballet shoes', 
    'feminine accessories', 'purse', 'handbag', 'feminine colors', 'pink clothing',
    'feminine poses', 'feminine gestures', 'feminine expressions', 'delicate features',
    'soft feminine features', 'feminine body language'
  ],
  girl: [
    // Exclude masculine characteristics for girls  
    'facial hair', 'beard', 'mustache', 'masculine haircut', 'buzz cut', 'crew cut',
    'masculine clothing', 'suit', 'tie', 'masculine shirt', 'baggy clothing', 
    'masculine shoes', 'work boots', 'masculine accessories', 'masculine colors',
    'masculine poses', 'masculine gestures', 'masculine expressions', 'rugged features',
    'angular features', 'masculine body language', 'broad shoulders', 'masculine build',
    'deep voice indicators', 'masculine stance'
  ]
};

// NUCLEAR GENDER NEUTRAL NEGATIVE PROMPT (Excludes ALL gendered characteristics)
export const NUCLEAR_GENDER_NEUTRAL_NEGATIVES = [
  // Exclude ALL masculine characteristics
  'facial hair', 'beard', 'mustache', 'masculine haircut', 'buzz cut', 'crew cut',
  'masculine clothing', 'suit', 'tie', 'masculine shirt', 'masculine shoes', 
  'work boots', 'masculine accessories', 'masculine poses', 'masculine gestures', 
  'rugged features', 'angular features', 'masculine body language', 'broad shoulders',
  
  // Exclude ALL feminine characteristics  
  'makeup', 'lipstick', 'mascara', 'nail polish', 'jewelry', 'earrings', 'necklace',
  'bracelet', 'rings', 'feminine hairstyles', 'long flowing hair', 'curled hair',
  'braided hair', 'ponytails', 'pigtails', 'hair bows', 'hair ribbons', 'feminine clothing',
  'dress', 'skirt', 'blouse', 'high heels', 'ballet shoes', 'feminine accessories',
  'purse', 'handbag', 'feminine poses', 'feminine gestures', 'delicate features',
  'soft feminine features', 'feminine body language',
  
  // Gender-neutral enhancement
  'gendered clothing', 'gendered accessories', 'gendered hairstyles', 'gendered poses',
  'gendered expressions', 'gendered colors', 'gendered toys', 'gendered activities'
];

// NUCLEAR AFRICAN AMERICAN NEGATIVE PROMPT (Protection against whitewashing/lightening)
export const NUCLEAR_AFRICAN_AMERICAN_NEGATIVES = [
  // Skin tone protection
  'skin lightening', 'whitewashing', 'pale skin', 'light skin', 'caucasian features',
  'european features', 'fair complexion', 'light complexion', 'white skin tone',
  'bleached skin', 'lightened skin', 'washed out skin', 'faded skin tone',
  
  // Cultural sensitivity
  'stereotypes', 'caricature', 'exaggerated features', 'cultural appropriation',
  'offensive stereotypes', 'racial caricature', 'minstrel imagery', 'tokenism',
  
  // Hair texture protection  
  'straight hair texture', 'caucasian hair', 'european hair texture', 'fine hair texture',
  'silky straight hair', 'pin straight hair', 'unnaturally straight hair',
  
  // Feature protection
  'narrow nose', 'thin lips', 'small features', 'delicate bone structure',
  'european bone structure', 'caucasian facial structure', 'non-African features'
];

// NUCLEAR CULTURAL SENSITIVITY NEGATIVES (Universal protection)
export const NUCLEAR_CULTURAL_SENSITIVITY_NEGATIVES = [
  'cultural stereotypes', 'racial stereotypes', 'ethnic stereotypes', 'cultural caricature',
  'offensive imagery', 'discriminatory content', 'prejudicial representation',
  'cultural mockery', 'insensitive portrayal', 'appropriative elements',
  'tokenistic representation', 'oversimplified culture', 'cultural reduction'
];

/**
 * Generate comprehensive nuclear negative prompt for both Tier 1 and Tier 2.5
 */
export function generateNuclearNegativePrompt(culturalProfile, avatarType, difficulty, pageNumber = 1) {
  console.log(`🛡️ Nuclear Negative: Generating for ${avatarType} with cultural profile: ${culturalProfile}`);
  
  // Start with nuclear base negative prompt
  let negativeComponents = [...NUCLEAR_BASE_NEGATIVE_PROMPT];
  
  // Add gender-specific negative prompts
  if (avatarType === 'boy') {
    negativeComponents.push(...NUCLEAR_OPPOSITE_GENDER_NEGATIVES.boy);
    console.log('🛡️ Nuclear Negative: Added opposite gender negatives for boy (excluding feminine features)');
  } else if (avatarType === 'girl') {
    negativeComponents.push(...NUCLEAR_OPPOSITE_GENDER_NEGATIVES.girl);
    console.log('🛡️ Nuclear Negative: Added opposite gender negatives for girl (excluding masculine features)');
  } else if (avatarType === 'prefer-not-to-answer' || avatarType === 'neutral' || avatarType === 'child') {
    negativeComponents.push(...NUCLEAR_GENDER_NEUTRAL_NEGATIVES);
    console.log('🛡️ Nuclear Negative: Added gender-neutral negatives (excluding ALL gendered features)');
  }
  
  // Add African American protection for ALL dark-skinned users
  if (culturalProfile === 'african-american' || 
      culturalProfile === 'African American' ||
      (culturalProfile && culturalProfile.includes('dark')) || 
      (culturalProfile && culturalProfile.includes('african')) ||
      (culturalProfile && culturalProfile.includes('black'))) {
    negativeComponents.push(...NUCLEAR_AFRICAN_AMERICAN_NEGATIVES);
    console.log('🛡️ Nuclear Negative: Added African American protection negatives (anti-whitewashing)');
  }
  
  // Always add cultural sensitivity negatives
  negativeComponents.push(...NUCLEAR_CULTURAL_SENSITIVITY_NEGATIVES);
  
  // Framework-Specific Negative Prompts (hardcoded by difficulty)
  if (difficulty === 'beginner' || difficulty === 'easy') {
    // Level 0-1 (Pixar anti-toy) - MUST be first for Level 0-1
    negativeComponents.push('toy', 'figurine', 'doll', 'plastic', 'simple background', 'flat lighting', 
                           'multiple characters', 'crowd', 'busy background', 'dark colors', 'scary', 
                           'photorealistic', 'adult themes');
  }
  
  // Additional Level 1+ negatives
  negativeComponents.push('multiple people', 'crowd', 'cluttered background', 'dark atmosphere', 
                         'scary elements', 'photorealistic');
  
  // Character Consistency Filters (Page > 1)
  if (pageNumber > 1) {
    negativeComponents.push('inconsistent character design', 'style variations', 'character appearance changes');
  }
  
  // Return complete nuclear negative prompt
  const finalNegativePrompt = negativeComponents.join(', ');
  console.log(`🛡️ Nuclear Negative: Generated prompt with ${negativeComponents.length} components`);
  
  return finalNegativePrompt;
}

/**
 * Detect cultural profile for negative prompt enhancement
 */
export function detectCulturalProfileForNegatives(userInfo, avatarIdentity) {
  try {
    const language = avatarIdentity?.nativeLanguage || userInfo?.language || 'en';
    const skinTone = userInfo?.avatar?.skinTone || userInfo?.skinTone || '';
    
    console.log(`🛡️ Nuclear Negative: Detecting cultural profile - Language: ${language}, Skin: ${skinTone}`);
    
    // Standardized language detection
    const isEnglishDarkSkin = (language === 'en' || language === 'english') && 
                              (skinTone.toLowerCase().includes('dark') || 
                               skinTone.toLowerCase().includes('brown') ||
                               skinTone.toLowerCase().includes('black'));
    
    const isFrenchDarkSkin = (language === 'fr' || language === 'french') && 
                             (skinTone.toLowerCase().includes('dark') || 
                              skinTone.toLowerCase().includes('brown') ||
                              skinTone.toLowerCase().includes('black'));
    
    const isSpanishDarkSkin = (language === 'es' || language === 'spanish') && 
                              (skinTone.toLowerCase().includes('dark') || 
                               skinTone.toLowerCase().includes('brown') ||
                               skinTone.toLowerCase().includes('black'));
    
    // Apply business rule: English/French/Spanish + Dark Skin = African American negative prompts
    if (isEnglishDarkSkin || isFrenchDarkSkin || isSpanishDarkSkin) {
      console.log(`🛡️ Nuclear Negative: African American profile detected for ${language} + dark skin`);
      return 'african-american';
    }
    
    // African American detection via skin tone
    if (skinTone.toLowerCase().includes('dark') || 
        skinTone.toLowerCase().includes('brown') ||
        skinTone.toLowerCase().includes('black') ||
        skinTone.toLowerCase().includes('ebony') ||
        skinTone.toLowerCase().includes('chocolate')) {
      console.log('🛡️ Nuclear Negative: African American profile detected via skin tone');
      return 'african-american';
    }
    
    // Return general profile
    return 'general';
    
  } catch (error) {
    console.warn('⚠️ Nuclear Negative: Cultural profile detection error:', error);
    return 'general';
  }
}