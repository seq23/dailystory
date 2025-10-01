// ============= NUCLEAR HARDCODE NEGATIVE PROMPT SYSTEM =============
// Shared module for both Tier 1 (Orchestrator) and Tier 2.5 (Nuclear Fallback)
// Nuclear Independence: 90%+ hardcoded arrays for comprehensive safety filtering

// NUCLEAR UNIFIED NEGATIVE PROMPT BASE (Word-for-Word as Specified)
export const NUCLEAR_BASE_NEGATIVE_PROMPT = "NO TEXT, no words, no letters, no writing, no captions, no watermarks, no signatures, no logos, bad anatomy, deformed, blurry, low quality, distorted face, extra limbs, malformed hands, poorly drawn, artifacts, noise, oversaturated, underexposed, overexposed, duplicate, cropped, watermark, signature, text, logo, bad lighting, flat lighting, plastic skin, waxy skin, artificial look, uncanny valley";

// NUCLEAR GENDER-SPECIFIC NEGATIVE PROMPTS (Word-for-Word as Specified)
export const NUCLEAR_GIRLS_NEGATIVE_PROMPT = "NO masculine features, facial hair, male anatomy, boy clothing, short masculine haircuts, broad shoulders, angular jaw, masculine body structure, male proportions, masculine expressions, boy toys, male-coded activities exclusively";

export const NUCLEAR_BOYS_NEGATIVE_PROMPT = "NO feminine features, makeup, female anatomy, girl clothing, long feminine hairstyles, feminine accessories, narrow shoulders, feminine body structure, female proportions, feminine expressions, girl toys, female-coded activities exclusively";

export const NUCLEAR_GENDER_NEUTRAL_NEGATIVE_PROMPT = "NO overly gendered features, extreme masculine traits, extreme feminine traits, gender-specific clothing, highly gendered toys, overly masculine expressions, overly feminine expressions, binary gender stereotypes, gendered color schemes exclusively";


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
  // Convert cultural profile to string if it's an object
  const culturalProfileStr = typeof culturalProfile === 'object' ? 
    (culturalProfile?.nativeLanguage || culturalProfile?.skinTone || 'general') : 
    (culturalProfile || 'general');
    
  console.log(`🛡️ Nuclear Negative: Generating for ${avatarType} with cultural profile: ${culturalProfileStr}`);
  console.log(`🛡️ Nuclear Negative: Secondary characters:`, secondaryCharacters);
  
  // Start with nuclear base negative prompt (now a string, not array)
  let negativeComponents = [NUCLEAR_BASE_NEGATIVE_PROMPT];
  
  // ============= UPDATED: GENDER-BASED NEGATIVE PROMPTS (Word-for-Word) =============
  // Primary character gender filtering using exact user-specified negative prompts
  if (avatarType === 'boy') {
    negativeComponents.push(NUCLEAR_BOYS_NEGATIVE_PROMPT);
    console.log('🛡️ Nuclear Negative: Added boys negative prompt for primary boy character');
  } else if (avatarType === 'girl') {
    negativeComponents.push(NUCLEAR_GIRLS_NEGATIVE_PROMPT);
    console.log('🛡️ Nuclear Negative: Added girls negative prompt for primary girl character');
  } else if (avatarType === 'prefer-not-to-answer' || avatarType === 'neutral' || avatarType === 'child') {
    negativeComponents.push(NUCLEAR_GENDER_NEUTRAL_NEGATIVE_PROMPT);
    console.log('🛡️ Nuclear Negative: Added gender-neutral negative prompt for primary character');
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
  if (culturalProfileStr === 'african-american' || 
      culturalProfileStr === 'African American' ||
      (culturalProfileStr && culturalProfileStr.includes && culturalProfileStr.includes('dark')) || 
      (culturalProfileStr && culturalProfileStr.includes && culturalProfileStr.includes('african')) ||
      (culturalProfileStr && culturalProfileStr.includes && culturalProfileStr.includes('black'))) {
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
    
    // Return Euro-American profile
    return 'Euro-American';
    
  } catch (error) {
    console.warn('⚠️ Nuclear Negative: Cultural profile detection error:', error);
    return 'Euro-American';
  }
}