// ULTRA-SIMPLIFIED PRIMARY SCENE ONLY VALIDATION
// Complete overhaul - focuses ONLY on primaryScene validation, everything else optional

/**
 * ULTRA-SIMPLIFIED VALIDATION: Only validates primaryScene 
 * @param {Object} enhancedStoryData - AI extracted data with NEW SCHEMA
 * @param {string} storyText - Original story text
 * @returns {Object} - Enhanced data, quality score, or tier 2 trigger
 */
export function validateAndEnhanceContent(enhancedStoryData, storyText) {
  // ONLY validate primaryScene - everything else is optional
  const mismatches = detectContentMismatches(enhancedStoryData, storyText);
  const qualityScore = calculateQualityScore(enhancedStoryData, storyText, mismatches);
  
  console.log(`🔍 ULTRA-SIMPLIFIED Quality Assessment: ${qualityScore}/100 (${mismatches.length} primaryScene issues)`);
  
  // QUALITY GATE: Reject unfixable content (≤40) → Tier 2
  if (qualityScore <= 40) {
    console.log(`❌ Quality too low (${qualityScore}/100) - falling back to Tier 2`);
    return { useTier2: true, qualityScore, mismatches };
  }
  
  // If moderate primaryScene issues (31-70), trigger re-analysis
  if (mismatches.length > 0 && qualityScore <= 70) {
    console.log(`⚠️ Primary scene issues detected: ${mismatches.join(', ')} - triggering re-analysis`);
    return { requiresReanalysis: true, mismatches, qualityScore };
  }
  
  // Apply basic fixes 
  const enhanced = applyBasicFixes(enhancedStoryData, storyText);
  
  console.log(`✅ PRIMARY SCENE ONLY validation complete (score: ${qualityScore}/100)`);
  return { enhancedData: enhanced, qualityScore };
}

/**
 * ULTRA-SIMPLIFIED: Only validate primaryScene - characters & visualComponents completely optional
 */
function detectContentMismatches(data, text) {
  const mismatches = [];
  
  console.log('🔍 PRIMARY SCENE ONLY Validation:', {
    hasPrimaryScene: !!data.primaryScene,
    primarySceneLength: data.primaryScene?.length || 0,
    hasCharacters: !!data.characters, // optional
    hasVisualComponents: !!data.visualComponents, // optional
    newSchemaDetected: typeof data.characters === 'object'
  });
  
  // ============= ONLY VALIDATE PRIMARY SCENE =============
  if (!data.primaryScene) {
    mismatches.push('missing-primary-scene');
    return mismatches; // Critical failure - return immediately
  }
  
  const scene = data.primaryScene;
  
  // Length check - minimum for complete sentence
  if (scene.length < 20) {
    mismatches.push('primary-scene-too-short');
  }
  
  // Content checks (character/action/setting presence)
  const sceneLower = scene.toLowerCase();
  
  // Character presence check
  if (!sceneLower.includes('boy') && !sceneLower.includes('girl') && 
      !sceneLower.includes('child') && !sceneLower.includes('kid')) {
    mismatches.push('missing-character-reference');
  }
  
  // Action/activity presence check
  const actionWords = ['playing', 'running', 'walking', 'sitting', 'standing', 'eating', 'reading', 'looking', 'going', 'jumping', 'dancing', 'singing'];
  if (!actionWords.some(word => sceneLower.includes(word))) {
    mismatches.push('missing-action');
  }
  
  // Setting/location presence check  
  const settingWords = ['park', 'home', 'room', 'kitchen', 'outside', 'inside', 'garden', 'yard', 'school', 'bedroom', 'living room', 'playground'];
  if (!settingWords.some(word => sceneLower.includes(word))) {
    mismatches.push('missing-setting');
  }
  
  // Context richness check - subtract points for no context
  if (scene.split(' ').length < 8 || 
      scene.includes('child in scene') || 
      scene.includes('generic') ||
      scene.includes('simple scene')) {
    mismatches.push('lacks-contextual-detail');
  }
  
  console.log('📊 PRIMARY SCENE Validation Results:', {
    totalIssues: mismatches.length,
    issues: mismatches,
    criticalFailure: mismatches.includes('missing-primary-scene')
  });

  return mismatches;
}

/**
 * ULTRA-SIMPLIFIED: Quality scoring based ONLY on primaryScene
 */
function calculateQualityScore(data, text, mismatches) {
  let score = 100; // Start at perfect
  
  console.log('📊 ULTRA-SIMPLIFIED Quality Score Calculation:', {
    totalIssues: mismatches.length,
    startingScore: score,
    hasPrimaryScene: !!data.primaryScene
  });
  
  // PRIMARY SCENE ONLY scoring
  mismatches.forEach(mismatch => {
    switch(mismatch) {
      case 'missing-primary-scene': 
        score -= 100; // Total failure
        break;
      case 'primary-scene-too-short': 
        score -= 80; 
        break;
      case 'missing-character-reference': 
        score -= 30; 
        break;
      case 'missing-action': 
        score -= 30; 
        break; 
      case 'missing-setting': 
        score -= 30; 
        break;
      case 'lacks-contextual-detail': 
        score -= 20; // User's "no context" penalty
        break;
      default: 
        score -= 10; // Generic penalty
    }
  });
  
  const finalScore = Math.max(0, score);
  
  console.log('📊 ULTRA-SIMPLIFIED Final Score:', {
    finalScore,
    triggerTier2: finalScore <= 40,
    qualityLevel: finalScore > 80 ? 'HIGH' : finalScore > 40 ? 'MEDIUM' : 'LOW'
  });
  
  return finalScore;
}

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