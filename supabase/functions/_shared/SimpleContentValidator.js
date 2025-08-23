// ULTRA-SIMPLIFIED PRIMARY SCENE ONLY VALIDATION
// Complete overhaul - focuses ONLY on primaryScene validation, everything else optional

/**
 * ULTRA-SIMPLE VALIDATION: Binary field-existence check - informational only
 * @param {Object} enhancedStoryData - AI extracted data
 * @param {string} storyText - Original story text
 * @returns {Object} - Enhanced data or tier 2 trigger (never blocks)
 */
export function validateAndEnhanceContent(enhancedStoryData, storyText) {
  const fieldCheck = checkPrimarySceneCriteria(enhancedStoryData);
  
  console.log(`🔍 ULTRA-SIMPLE Field Check: ${fieldCheck.passCount}/5 fields present (${fieldCheck.passCount >= 3 ? 'PASS' : 'TIER 2'})`);
  console.log(`📊 Field Status:`, fieldCheck);
  
  // Binary decision: 3+ fields = accept, <3 fields = Tier 2
  if (fieldCheck.passCount < 3) {
    console.log(`❌ Insufficient fields (${fieldCheck.passCount}/5) - falling back to Tier 2`);
    return { useTier2: true, fieldCheck };
  }
  
  // Apply basic fixes and accept content
  const enhanced = applyBasicFixes(enhancedStoryData, storyText);
  
  console.log(`✅ Field validation passed (${fieldCheck.passCount}/5) - content accepted`);
  return { enhancedData: enhanced, fieldCheck };
}

/**
 * ULTRA-SIMPLE: Check if 5 key fields exist (binary yes/no per field)
 */
function checkPrimarySceneCriteria(data) {
  return {
    primaryScene: !!(data.primaryScene && data.primaryScene.length > 0),
    characterAppearance: !!(data.characters?.characterAppearance),
    setting: !!(data.visualComponents?.setting),
    action: !!(data.visualComponents?.action),
    context: !!(data.visualComponents && Object.keys(data.visualComponents).length > 2), // sceneType, lighting, keyObjects
    get passCount() {
      return [this.primaryScene, this.characterAppearance, this.setting, this.action, this.context].filter(Boolean).length;
    }
  };
}

// Removed complex scoring - validation is now informational only

/**
 * ULTRA-SIMPLIFIED: Basic fixes for primaryScene only
 */
function applyBasicFixes(data, text) {
  const enhanced = { ...data };
  
  // ONLY fix primaryScene if missing/broken
  if (!enhanced.primaryScene || enhanced.primaryScene.length < 10) {
    const textLower = text.toLowerCase();
    let sceneDescription = 'child in scene';
    
    // Basic scene detection for fallback
    if (textLower.includes('outside') || textLower.includes('park')) {
      sceneDescription = 'child outside in bright outdoor scene';
    } else if (textLower.includes('home') || textLower.includes('house')) {
      sceneDescription = 'child at home in cozy indoor scene';
    } else if (textLower.includes('playing')) {
      sceneDescription = 'child playing in colorful scene';
    }
    
    enhanced.primaryScene = sceneDescription;
    console.log('🔧 Applied primaryScene fallback:', sceneDescription);
  }
  
  // Leave characters and visualComponents completely untouched - they're optional
  
  return enhanced;
}

// Make available globally
if (typeof globalThis !== 'undefined') {
  globalThis.validateAndEnhanceContent = validateAndEnhanceContent;
}