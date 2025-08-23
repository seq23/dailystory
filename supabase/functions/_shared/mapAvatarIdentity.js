// Avatar Identity Mapper - Source of Truth
// This is the definitive avatar processing function used across all image generation tiers

export function mapAvatarIdentity(userInfo) {
  const avatar = userInfo?.avatar || {};
  const { type, skinTone = 'medium' } = avatar;
  const { nativeLanguage = 'en' } = userInfo;

  // Map avatar type and skin tone to standardized identity - PHASE 2: Enhanced mapping logic
  const avatarType = type === 'prefer-not-to-answer' ? 'child' : (type || 'child');
  console.log(`🎯 AVATAR MAPPING - Original type: ${type} → Mapped type: ${avatarType} (PHASE 2 FIX: proper null handling)`);
  const genderText = avatarType === 'boy' ? 'boy' : avatarType === 'girl' ? 'girl' : 'child';
  
  // Standardized skin tone mapping
  const skinToneMap = {
    'pale': 'fair',
    'light': 'light', 
    'medium': 'medium',
    'olive': 'olive',
    'dark': 'dark'
  };
  const standardizedSkinTone = skinToneMap[skinTone] || 'medium';

  // NEW MASTER PLAN: Direct Visual Descriptions for English Speakers Only
  let visualDescription = '';
  if (nativeLanguage === 'en') {
    const visualDescriptionMap = {
      'fair': genderText === 'child' ? `fair skin child with no gender specific characteristics, red hair` : `fair skin white ${genderText} with red hair`,
      'light': genderText === 'child' ? `white child with no gender specific characteristics, blonde hair` : `white ${genderText} with blonde hair`,
      'medium': genderText === 'child' ? `medium skin white child with no gender specific characteristics, brown hair` : `medium skin white ${genderText} with brown hair`,
      'olive': genderText === 'child' ? `olive skin white child with no gender specific characteristics, black hair` : `olive skin white ${genderText} with black hair`,
      'dark': genderText === 'child' ? `black child with no gender specific characteristics` : `black ${genderText}`
    };
    visualDescription = visualDescriptionMap[standardizedSkinTone] || `${genderText}`;
  }

  // Cultural profile determination (legacy compatibility)
  let culturalProfile;
  if (nativeLanguage === 'en') {
    if (standardizedSkinTone === 'dark') culturalProfile = 'african-american';
    else if (standardizedSkinTone === 'light' || standardizedSkinTone === 'fair') culturalProfile = 'european-american';
    else culturalProfile = 'multicultural-american';
  } else if (nativeLanguage === 'es') {
    if (standardizedSkinTone === 'dark') culturalProfile = 'afro-hispanic';
    else if (standardizedSkinTone === 'olive' || standardizedSkinTone === 'medium') culturalProfile = 'hispanic-latino';
    else culturalProfile = 'hispanic-multicultural';
  } else if (nativeLanguage === 'fr') culturalProfile = standardizedSkinTone === 'dark' ? 'african-french' : 'french-multicultural';
  else if (nativeLanguage === 'zh') culturalProfile = 'chinese-asian';
  else if (nativeLanguage === 'hi') culturalProfile = 'indian-south-asian';
  else if (nativeLanguage === 'ar') culturalProfile = 'middle-eastern';
  else culturalProfile = 'standard-american'; // PHASE 2: Default to standard-american instead of global-multicultural

  // Hair color mapping (legacy compatibility)
  const hairColorMap = {
    'fair': 'red',
    'light': 'blonde',
    'medium': 'brown', 
    'olive': 'black',
    'dark': 'natural textured hair'
  };
  const hairColor = hairColorMap[standardizedSkinTone] || 'brown';

  return {
    type: avatarType,
    skinTone: standardizedSkinTone,
    hairColor,
    culturalProfile,
    nativeLanguage,
    name: userInfo?.name || 'child',
    visualDescription // NEW: Direct visual description for Runware optimization
  };
}