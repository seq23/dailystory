// Avatar consistency module - PHASE 1: GENDER NEUTRAL SYSTEM
// Contains hardcoded fallback descriptions and validation functions

// Hardcoded avatar fallback descriptions for all tiers
export const AVATAR_FALLBACK_DESCRIPTIONS = {
  // PALE SKIN TONE
  "girl/pale": "{name} is a young girl with pale skin, red hair, and green eyes",
  "boy/pale": "{name} is a young boy with pale skin, red hair, and green eyes", 
  "child/pale": "{name} is a young child with pale skin, red hair, and green eyes, with no gender specific characteristics",
  
  // LIGHT SKIN TONE  
  "girl/light": "{name} is a young girl with light skin, blonde hair, and blue eyes",
  "boy/light": "{name} is a young boy with light skin, blonde hair, and blue eyes",
  "child/light": "{name} is a young child with light skin, blonde hair, and blue eyes, with no gender specific characteristics",

  // MEDIUM SKIN TONE
  "girl/medium": "{name} is a young girl with medium skin, brown hair, and brown eyes", 
  "boy/medium": "{name} is a young boy with medium skin, brown hair, and brown eyes",
  "child/medium": "{name} is a young child with medium skin, brown hair, and brown eyes, with no gender specific characteristics",

  // OLIVE SKIN TONE
  "girl/olive": "{name} is a young girl with olive skin, natural textured hair, and dark eyes",
  "boy/olive": "{name} is a young boy with olive skin, natural textured hair, and dark eyes", 
  "child/olive": "{name} is a young child with olive skin, natural textured hair, and dark eyes, with no gender specific characteristics",

  // DARK SKIN TONE (Enhanced descriptions)
  "girl/dark": "{name} is a young African American girl with authentic representation and diverse natural features, soft warm lighting",
  "boy/dark": "{name} is a young African American boy with authentic representation and diverse natural features, soft warm lighting",
  "child/dark": "{name} is a young African American child with authentic representation and diverse natural features, soft warm lighting, with no gender specific characteristics",

  // BACKWARD COMPATIBILITY ALIASES - prefer-not-to-answer → child
  "prefer-not-to-answer/pale": "{name} is a young child with pale skin, red hair, and green eyes, with no gender specific characteristics",
  "prefer-not-to-answer/light": "{name} is a young child with light skin, blonde hair, and blue eyes, with no gender specific characteristics",
  "prefer-not-to-answer/medium": "{name} is a young child with medium skin, brown hair, and brown eyes, with no gender specific characteristics",
  "prefer-not-to-answer/olive": "{name} is a young child with olive skin, natural textured hair, and dark eyes, with no gender specific characteristics",
  "prefer-not-to-answer/dark": "{name} is a young African American child with authentic representation and diverse natural features, soft warm lighting, with no gender specific characteristics",

  // DEFAULT FALLBACK
  "default": "{name} is a young child with a bright smile and cheerful demeanor, with no gender specific characteristics"
};

// Avatar consistency validation function for all tiers
export function validateAvatarConsistency(prompt, avatarIdentity, userInfo) {
  const userName = userInfo?.name || 'child';
  
  // If no avatar identity provided, use fallback
  if (!avatarIdentity) {
    console.log('🔍 AVATAR VALIDATION: No avatarIdentity provided, using fallback');
    const avatarType = userInfo?.avatar?.type || 'child';
    const skinTone = userInfo?.avatar?.skinTone;
    console.log('🎭 [FALLBACK DEBUG] Avatar consistency check:', { 
      avatarType, 
      skinTone,
      hasAvatarIdentity: !!avatarIdentity,
      hasVisualDescription: false 
    });
    
    if (!skinTone) {
      console.error('🚨 CRITICAL: No skinTone available for fallback!', {
        userInfo: userInfo?.avatar,
        avatarIdentity
      });
      return `${userName} is a child`;
    }
    
    const fallbackKey = `${avatarType}/${skinTone}`;
    const fallbackDescription = AVATAR_FALLBACK_DESCRIPTIONS[fallbackKey] || AVATAR_FALLBACK_DESCRIPTIONS["default"];
    console.log(`🔍 AVATAR VALIDATION: Applied fallback ${fallbackKey} for missing identity`);
    return fallbackDescription.replace('{name}', userName);
  }
  
  // Check if prompt contains generic descriptions
  const genericPatterns = [
    `${userName} is a young child`,
    `${userName} is a child`,
    'young child with',
    'child with'
  ];
  
  // Ensure prompt is a string before processing
  const promptString = typeof prompt === 'string' ? prompt : JSON.stringify(prompt);
  
  const isGeneric = genericPatterns.some(pattern => 
    promptString.toLowerCase().includes(pattern.toLowerCase())
  );
  
  if (isGeneric) {
    console.log('🔍 AVATAR VALIDATION: Generic description detected, using enhanced fallback');
    const avatarType = avatarIdentity.type || 'child';
    const skinTone = avatarIdentity.skinTone || 'medium';
    const fallbackKey = `${avatarType}/${skinTone}`;
    const fallbackDescription = AVATAR_FALLBACK_DESCRIPTIONS[fallbackKey] || AVATAR_FALLBACK_DESCRIPTIONS["default"];
    console.log(`🔍 AVATAR VALIDATION: Applied fallback ${fallbackKey}: ${fallbackDescription}`);
    return fallbackDescription.replace('{name}', userName);
  }
  
  // Replace {name} placeholder if present and return original prompt
  console.log('🔍 AVATAR VALIDATION: Prompt passed validation, using provided description');
  return prompt.replace('{name}', userName);
}

// Quality-based avatar validation for fallback trigger
export function validateAvatarQuality(prompt, avatarIdentity, userInfo) {
  const userName = userInfo?.name || 'child';
  
  // Missing avatar identity - quality failure
  if (!avatarIdentity) {
    console.log('🔍 QUALITY CHECK: Missing avatar identity - triggering fallback');
    return { isQualityAcceptable: false, reason: 'missing_avatar_identity' };
  }
  
  // Generic or low-quality patterns
  const lowQualityPatterns = [
    `${userName} is a young child`,
    `${userName} is a child`,
    'young child with',
    'child with',
    'character consistency: [object Object]',
    'undefined',
    'null'
  ];
  
  // Ensure prompt is a string before processing
  const promptString = typeof prompt === 'string' ? prompt : JSON.stringify(prompt);
  
  const hasLowQuality = lowQualityPatterns.some(pattern => 
    promptString.toLowerCase().includes(pattern.toLowerCase())
  );
  
  if (hasLowQuality) {
    console.log('🔍 QUALITY CHECK: Low quality avatar description - triggering fallback');
    return { isQualityAcceptable: false, reason: 'generic_description' };
  }
  
  // Missing visual description from avatar identity
  if (!avatarIdentity.visualDescription || avatarIdentity.visualDescription.length < 20) {
    console.log('🔍 QUALITY CHECK: Insufficient visual description - triggering fallback');
    return { isQualityAcceptable: false, reason: 'insufficient_visual_description' };
  }
  
  console.log('🔍 QUALITY CHECK: Avatar quality acceptable');
  return { isQualityAcceptable: true, reason: 'quality_passed' };
}