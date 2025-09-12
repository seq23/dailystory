// ============= NUCLEAR HARDCODE NEGATIVE PROMPT SYSTEM =============
// Shared module for both Tier 1 (Orchestrator) and Tier 2.5 (Nuclear Fallback)
// Nuclear Independence: 90%+ hardcoded arrays for comprehensive safety filtering

// UNIFIED NEGATIVE PROMPT (Hardcoded Base for All Characters)
export const NUCLEAR_BASE_NEGATIVE_PROMPT = "NO TEXT, no words, no letters, no writing, no captions, no watermarks, no signatures, no logos, no adult features, no mature faces, no wrinkles, no facial hair, no makeup, no weapons, no scary features, no distorted faces, no asymmetrical features, no blurry faces, no low quality, no pixelated, no grainy, no artifacts, no noise, no overexposed, no underexposed, no harsh shadows, no dramatic lighting, no neon colors, no oversaturated, no desaturated, no black and white, no sepia, no vintage effects, no filters, no borders, no frames, no split screen, no collage, no montage, no duplicate faces, no extra limbs, no missing limbs, no missing body, no deformed hands, no extra fingers, no missing fingers, no anatomical errors, no unrealistic proportions, no cartoon exaggeration, no anime style, no manga style, no abstract art, no surreal elements, no photorealistic adults, no teenagers, no infants, no babies";

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
 * Generate comprehensive nuclear negative prompt for Tier 1 only
 * Enhanced with multi-character consistency support
 * Note: Tier 2.5 uses hardcoded arrays directly for nuclear independence
 */
export function generateNuclearNegativePrompt(culturalProfile, avatarType, difficulty, pageNumber = 1, secondaryCharacters = []) {
  console.log(`🛡️ Nuclear Negative: Generating for ${avatarType} with cultural profile: ${culturalProfile}`);
  console.log(`🛡️ Nuclear Negative: Secondary characters:`, secondaryCharacters);
  
  // Start with nuclear base negative prompt (now a string, not array)
  let negativeComponents = [NUCLEAR_BASE_NEGATIVE_PROMPT];
  
  // ============= PHASE 5 ENHANCEMENT: MULTI-CHARACTER GENDER CONSISTENCY =============
  // Primary character gender filtering
  if (avatarType === 'boy') {
    negativeComponents.push(...NUCLEAR_OPPOSITE_GENDER_NEGATIVES.boy);
    console.log('🛡️ Nuclear Negative: Added opposite gender negatives for primary boy character');
  } else if (avatarType === 'girl') {
    negativeComponents.push(...NUCLEAR_OPPOSITE_GENDER_NEGATIVES.girl);
    console.log('🛡️ Nuclear Negative: Added opposite gender negatives for primary girl character');
  } else if (avatarType === 'prefer-not-to-answer' || avatarType === 'neutral' || avatarType === 'child') {
    negativeComponents.push(...NUCLEAR_GENDER_NEUTRAL_NEGATIVES);
    console.log('🛡️ Nuclear Negative: Added gender-neutral negatives for primary character');
  }
  
  // ============= NEW: SECONDARY CHARACTER GENDER CONSISTENCY =============
  if (secondaryCharacters && secondaryCharacters.length > 0) {
    // Analyze secondary characters for gender-specific filtering
    const secondaryCharacterText = secondaryCharacters.join(' ').toLowerCase();
    
    // If we have mixed gender characters, apply consistency filters
    const hasMaleCharacters = /\b(dad|father|brother|boy|man|uncle|grandpa|boyfriend)\b/.test(secondaryCharacterText);
    const hasFemaleCharacters = /\b(mom|mother|sister|girl|woman|aunt|grandma|girlfriend)\b/.test(secondaryCharacterText);
    
    if (hasMaleCharacters && hasFemaleCharacters) {
      // Mixed gender scene - apply balanced filtering
      negativeComponents.push('gender confusion', 'character inconsistency', 'mismatched gender features');
      console.log('🛡️ Nuclear Negative: Added mixed-gender consistency filters');
    } else if (hasMaleCharacters && avatarType === 'girl') {
      // Girl with male characters - maintain character distinction
      negativeComponents.push('masculine features on female characters', 'gender feature mixing');
      console.log('🛡️ Nuclear Negative: Added girl-with-males consistency filters');
    } else if (hasFemaleCharacters && avatarType === 'boy') {
      // Boy with female characters - maintain character distinction
      negativeComponents.push('feminine features on male characters', 'gender feature mixing');
      console.log('🛡️ Nuclear Negative: Added boy-with-females consistency filters');
    }
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
    
    // ============= NEW: MULTI-CHARACTER CONSISTENCY FOR STORY PROGRESSION =============
    if (secondaryCharacters && secondaryCharacters.length > 0) {
      negativeComponents.push('secondary character inconsistency', 'relationship confusion', 'character role mixing');
      console.log('🛡️ Nuclear Negative: Added multi-character story consistency filters');
    }
  }
  
  // Return complete nuclear negative prompt
  const finalNegativePrompt = negativeComponents.join(', ');
  console.log(`🛡️ Nuclear Negative: Generated prompt with ${negativeComponents.length} components for ${secondaryCharacters.length} secondary characters`);
  
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