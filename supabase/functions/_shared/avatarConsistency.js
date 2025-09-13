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

// ============================================================================
// PHASE 8: BINARY AVATAR VALIDATION WITH STORY TEXT PRIORITY
// ============================================================================

// Character description generation with story text priority
export function validateAvatarConsistency(prompt, avatarIdentity, userInfo, storyTextAppearance = null) {
  const userName = userInfo?.name || 'child';
  
  console.log('🔍 PHASE 8: Avatar validation with story text priority');
  
  // PRIORITY 1: Story text appearance overrides everything
  if (storyTextAppearance && storyTextAppearance.length > 0) {
    console.log('✅ STORY TEXT PRIORITY: Using appearance from story text');
    return `${userName} ${storyTextAppearance}`;
  }
  
  // PRIORITY 2: Complete avatar identity from StaticDataCache
  if (avatarIdentity && avatarIdentity.visualDescription) {
    console.log('✅ AVATAR IDENTITY: Using complete processed identity');
    return avatarIdentity.visualDescription;
  }
  
  // PRIORITY 3: Binary validation failure - use fallback descriptions
  if (!avatarIdentity) {
    console.log('🔍 BINARY FAILURE: No complete avatarIdentity, using fallback system');
    const avatarType = userInfo?.avatar?.type || 'child';
    const skinTone = userInfo?.avatar?.skinTone;
    
    if (!skinTone) {
      console.error('🚨 CRITICAL: No skinTone available for fallback!', {
        userInfo: userInfo?.avatar,
        avatarIdentity
      });
      return `${userName} is a child`;
    }
    
    const fallbackKey = `${avatarType}/${skinTone}`;
    const fallbackDescription = AVATAR_FALLBACK_DESCRIPTIONS[fallbackKey] || AVATAR_FALLBACK_DESCRIPTIONS["default"];
    console.log(`🔍 FALLBACK APPLIED: ${fallbackKey} for incomplete identity`);
    return fallbackDescription.replace('{name}', userName);
  }

  // PRIORITY 4: Partial avatar identity - construct from available data
  const avatarType = avatarIdentity.type || 'child';
  const skinTone = avatarIdentity.skinTone || 'medium';
  const fallbackKey = `${avatarType}/${skinTone}`;
  const characterDescription = AVATAR_FALLBACK_DESCRIPTIONS[fallbackKey] || AVATAR_FALLBACK_DESCRIPTIONS["default"];
  
  console.log(`🔍 PARTIAL IDENTITY: Generated description for ${fallbackKey}`);
  return characterDescription.replace('{name}', userName);
}

// ============================================================================
// PHASE 8: BINARY QUALITY VALIDATION FOR TIER ROUTING
// ============================================================================

// Enhanced quality validation with binary logic
export function validateAvatarQuality(prompt, avatarIdentity, userInfo, tierInfo = null) {
  const userName = userInfo?.name || 'child';
  
  console.log('🔍 PHASE 8: Binary quality validation for tier routing');
  
  // BINARY CHECK 1: Avatar identity completeness
  if (!avatarIdentity) {
    console.log('❌ BINARY FAILURE: Missing complete avatar identity - routing to Tier 2.5C');
    return { 
      isQualityAcceptable: false, 
      reason: 'missing_complete_avatar_identity',
      suggestedTier: '2.5C'
    };
  }
  
  // BINARY CHECK 2: Avatar identity validation metadata
  if (avatarIdentity.completenessValidation && !avatarIdentity.completenessValidation.isComplete) {
    console.log('❌ BINARY FAILURE: Avatar identity failed completeness validation - routing to Tier 2.5C');
    return { 
      isQualityAcceptable: false, 
      reason: 'incomplete_avatar_fields',
      suggestedTier: '2.5C',
      missingFields: avatarIdentity.completenessValidation.missing
    };
  }
  
  // BINARY CHECK 3: Visual description quality
  if (!avatarIdentity.visualDescription || avatarIdentity.visualDescription.length < 20) {
    console.log('❌ BINARY FAILURE: Insufficient visual description - routing to Tier 2.5B');
    return { 
      isQualityAcceptable: false, 
      reason: 'insufficient_visual_description',
      suggestedTier: '2.5B'
    };
  }
  
  // BINARY CHECK 4: Prompt quality patterns (legacy check)
  const promptString = typeof prompt === 'string' ? prompt : JSON.stringify(prompt);
  const lowQualityPatterns = [
    `${userName} is a young child`,
    `${userName} is a child`,
    'young child with',
    'child with',
    'character consistency: [object Object]',
    'undefined',
    'null'
  ];
  
  const hasLowQuality = lowQualityPatterns.some(pattern => 
    promptString.toLowerCase().includes(pattern.toLowerCase())
  );
  
  if (hasLowQuality) {
    console.log('⚠️ QUALITY WARNING: Low quality patterns detected but avatar identity complete');
    // Don't fail here if avatar identity is complete - just log warning
  }
  
  console.log('✅ BINARY SUCCESS: Avatar quality acceptable for enhanced processing');
  return { 
    isQualityAcceptable: true, 
    reason: 'quality_passed',
    suggestedTier: tierInfo?.tier || '1'
  };
}

// New function: Extract appearance details from story text
export function extractAppearanceFromStoryText(storyText, characterName) {
  if (!storyText || !characterName) return null;
  
  console.log('🔍 EXTRACTING: Appearance details from story text');
  
  // Appearance patterns to look for
  const appearancePatterns = [
    // Hair descriptions
    new RegExp(`${characterName}.*?(with|has)\\s+([^.!?]+hair[^.!?]*[.!?])`, 'i'),
    // Skin/complexion descriptions  
    new RegExp(`${characterName}.*?(with|has)\\s+([^.!?]*skin[^.!?]*[.!?])`, 'i'),
    // Eye descriptions
    new RegExp(`${characterName}.*?(with|has)\\s+([^.!?]*eyes?[^.!?]*[.!?])`, 'i'),
    // Clothing descriptions
    new RegExp(`${characterName}.*?(wearing|in)\\s+([^.!?]+[.!?])`, 'i'),
    // General appearance
    new RegExp(`${characterName}.*?(looks?|appears?)\\s+([^.!?]+[.!?])`, 'i')
  ];
  
  const appearances = [];
  
  for (const pattern of appearancePatterns) {
    const match = storyText.match(pattern);
    if (match && match[2]) {
      const description = match[2].trim();
      if (description.length > 3) {
        appearances.push(description);
      }
    }
  }
  
  if (appearances.length > 0) {
    const combinedAppearance = appearances.join(' ').replace(/[.!?]+/g, '');
    console.log('✅ EXTRACTED: Story appearance details:', combinedAppearance);
    return combinedAppearance;
  }
  
  console.log('🔍 NO EXTRACTION: No specific appearance details found in story text');
  return null;
}