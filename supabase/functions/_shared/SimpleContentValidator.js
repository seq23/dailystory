// Ultra-Lean Content Validation System
// Replaces 3 complex validation systems (1000+ lines) with simple content accuracy check

/**
 * NEW MASTER PLAN: Simple validator for streamlined 3-field schema
 * @param {Object} enhancedStoryData - AI extracted data (primaryScene, visualComponents, characters)
 * @param {string} storyText - Original story text
 * @returns {Object} - Enhanced data, quality score, or tier 2 trigger
 */
export function validateAndEnhanceContent(enhancedStoryData, storyText) {
  // Part 1: New Schema Validation for 3-Field Structure
  const mismatches = detectContentMismatches(enhancedStoryData, storyText);
  const qualityScore = calculateQualityScore(enhancedStoryData, storyText, mismatches);
  
  console.log(`🔍 NEW SCHEMA Quality Assessment: ${qualityScore}/100 (${mismatches.length} mismatches)`);
  
  // QUALITY GATE: Reject unfixable content (≤40) → Tier 2
  if (qualityScore <= 40) {
    console.log(`❌ Quality too low (${qualityScore}/100) - falling back to Tier 2`);
    return { useTier2: true, qualityScore, mismatches };
  }
  
  // If moderate mismatches found (31-70), trigger re-analysis
  if (mismatches.length > 0 && qualityScore <= 70) {
    console.log(`⚠️ Content mismatches detected: ${mismatches.join(', ')} - triggering re-analysis`);
    return { requiresReanalysis: true, mismatches, qualityScore };
  }
  
  // Part 2: Basic Fixes for New Schema Structure
  const enhanced = applyBasicFixes(enhancedStoryData, storyText);
  
  console.log(`✅ NEW SCHEMA Content validated and enhanced (score: ${qualityScore}/100)`);
  return { enhancedData: enhanced, qualityScore };
}

/**
 * SCHEMA-ALIGNED: Detect mismatches in actual 3-field schema only
 * Fields we validate: characters, visualComponents, primaryScene
 */
function detectContentMismatches(data, text) {
  const mismatches = [];
  const textLower = text.toLowerCase();
  
  console.log('🔍 Schema Validation - Checking actual 3-field structure:', {
    hasCharacters: !!data.characters,
    hasVisualComponents: !!data.visualComponents,  
    hasPrimaryScene: !!data.primaryScene,
    visualComponentsKeys: data.visualComponents ? Object.keys(data.visualComponents) : [],
    primarySceneLength: data.primaryScene?.length || 0
  });
  
  // 1. VALIDATE primaryScene (Critical for image generation)
  if (!data.primaryScene || data.primaryScene.length < 15) {
    mismatches.push('missing-primary-scene: Primary scene description too short or missing');
  }
  
  // 2. VALIDATE visualComponents structure (matching actual prompt schema)
  if (!data.visualComponents) {
    mismatches.push('missing-visual-components: Visual components object missing');
  } else {
    const vc = data.visualComponents;
    if (!vc.sceneType) mismatches.push('missing-scene-type: Scene type not specified');
    if (!vc.lighting) mismatches.push('missing-lighting: Lighting not specified');
    
    // Enhanced lighting validation using the CORRECT field path
    const lightingWords = {
      'bright': ['sun', 'sunny', 'bright', 'shine', 'shining', 'yellow', 'warm light'],
      'dark': ['dark', 'night', 'shadow', 'dim', 'gloomy'],
      'cloudy': ['cloud', 'cloudy', 'overcast', 'gray sky'],
      'rainy': ['rain', 'rainy', 'wet', 'storm']
    };
    
    for (const [condition, keywords] of Object.entries(lightingWords)) {
      const hasCondition = keywords.some(word => textLower.includes(word));
      if (hasCondition && vc.lighting) {
        const aiLighting = vc.lighting.toLowerCase();
        const aiSetting = vc.setting?.toLowerCase() || '';
        
        if (condition === 'bright' && !aiLighting.includes('bright') && !aiSetting.includes('sunny') && !aiSetting.includes('outdoor')) {
          mismatches.push(`lighting-mismatch: Story mentions ${keywords.join('/')} but AI lighting is "${vc.lighting}"`);
        }
        if (condition === 'dark' && !aiLighting.includes('dim') && !aiLighting.includes('dramatic') && !aiSetting.includes('dark')) {
          mismatches.push(`lighting-mismatch: Story mentions darkness but AI lighting is "${vc.lighting}"`);
        }
      }
    }
    
    // Validate setting context using the CORRECT field path
    if (vc.setting) {
      const indoorWords = ['bedroom', 'kitchen', 'house', 'room', 'inside'];
      const outdoorWords = ['park', 'forest', 'outside', 'garden', 'yard', 'bright', 'sun'];
      
      const hasIndoor = indoorWords.some(word => textLower.includes(word));
      const hasOutdoor = outdoorWords.some(word => textLower.includes(word));
      
      if (hasIndoor && vc.sceneType === 'outdoor') {
        mismatches.push('setting-mismatch: AI says outdoor but story mentions indoor location');
      }
      if (hasOutdoor && vc.sceneType === 'indoor') {
        mismatches.push('setting-mismatch: AI says indoor but story mentions outdoor location');
      }
    }
  }

  // 3. VALIDATE characters (only check what we actually request)
  if (!data.characters || (typeof data.characters === 'string' && data.characters.length < 5)) {
    mismatches.push('missing-characters: Character description too short or missing');
  }

  // Enhanced mood validation using the CORRECT field path
  if (data.visualComponents?.mood) {
    const emotionalWords = {
      'happy': ['happy', 'joy', 'smile', 'laugh', 'giggle', 'cheerful', 'excited', 'plays'],
      'sad': ['sad', 'cry', 'tear', 'unhappy', 'lonely', 'worried'],
      'playful': ['play', 'fun', 'game', 'adventure', 'explore']
    };
    
    for (const [emotion, keywords] of Object.entries(emotionalWords)) {
      const hasEmotion = keywords.some(word => textLower.includes(word));
      if (hasEmotion) {
        const aiMood = data.visualComponents.mood.toLowerCase();
        
        if (emotion === 'happy' && !aiMood.includes('happy') && !aiMood.includes('joy') && !aiMood.includes('cheerful')) {
          mismatches.push(`mood-mismatch: Story suggests happiness but AI mood is "${data.visualComponents.mood}"`);
        }
        if (emotion === 'sad' && !aiMood.includes('sad') && !aiMood.includes('worried')) {
          mismatches.push(`mood-mismatch: Story suggests sadness but AI mood is "${data.visualComponents.mood}"`);
        }
      }
    }
  }

  // Enhanced object detection using the CORRECT field path
  if (data.visualComponents?.keyObjects) {
    const textWords = text.toLowerCase().split(/\s+/);
    const commonObjects = ['book', 'ball', 'toy', 'car', 'dog', 'cat', 'tree', 'flower'];
    const keyObjectsLower = data.visualComponents.keyObjects.toLowerCase();
    
    const missingObjects = commonObjects.filter(obj => 
      textWords.includes(obj) && !keyObjectsLower.includes(obj)
    );
    if (missingObjects.length > 0) {
      mismatches.push(`missing-objects: Story mentions ${missingObjects.join(', ')} but AI keyObjects is "${data.visualComponents.keyObjects}"`);
    }
  }
  
  console.log('📊 Schema Validation Results:', {
    totalMismatches: mismatches.length,
    mismatchTypes: mismatches.map(m => m.split(':')[0]),
    criticalIssues: mismatches.filter(m => m.includes('missing-primary-scene') || m.includes('missing-visual-components')).length
  });

  return mismatches;
}

/**
 * SCHEMA-ALIGNED: Calculate quality score for actual 3-field schema
 */
function calculateQualityScore(data, text, mismatches) {
  let score = 100;
  
  console.log('📊 Quality Score Calculation - Schema-aligned scoring:', {
    totalMismatches: mismatches.length,
    startingScore: score,
    hasPrimaryScene: !!data.primaryScene,
    hasVisualComponents: !!data.visualComponents,
    hasCharacters: !!data.characters
  });
  
  // SCHEMA-ALIGNED CRITICAL ERRORS → Trigger Tier 2 Fallback (Score ≤ 40)
  mismatches.forEach(mismatch => {
    if (mismatch.includes('missing-primary-scene')) {
      score -= 70; // Missing primary scene = critical for image generation
    } else if (mismatch.includes('missing-visual-components')) {
      score -= 50; // Missing visual components = major structural error
    } else if (mismatch.includes('missing-characters')) {
      score -= 30; // Missing character description = major error
    } else if (mismatch.includes('missing-scene-type')) {
      score -= 15; // Missing scene type = moderate error (fixable in Tier 2)
    } else if (mismatch.includes('missing-lighting')) {
      score -= 15; // Missing lighting = moderate error (fixable in Tier 2)
    } else if (mismatch.includes('lighting-mismatch')) {
      score -= 25; // Wrong lighting context = visual error
    } else if (mismatch.includes('setting-mismatch')) {
      score -= 20; // Indoor/outdoor mismatch = visual context error  
    } else if (mismatch.includes('mood-mismatch')) {
      score -= 10; // Mood mismatch = moderate error (affects image tone)
    } else if (mismatch.includes('missing-objects')) {
      score -= 5; // Missing objects = minor error (fixable)
    } else {
      score -= 8; // Other mismatches = minor errors
    }
  });
  
  // SCHEMA COMPLETENESS CHECKS (aligned with actual prompt structure)
  if (!data.primaryScene) score -= 70;
  if (!data.visualComponents) score -= 50;
  if (!data.characters) score -= 30;
  
  // Bonus for high-quality primaryScene (key for image generation)
  if (data.primaryScene && data.primaryScene.length > 30) {
    score += 5; // Reward detailed scene descriptions
  }
  
  // Bonus for complete visualComponents structure
  if (data.visualComponents && 
      data.visualComponents.sceneType && 
      data.visualComponents.lighting && 
      data.visualComponents.setting) {
    score += 5; // Reward complete visual structure
  }
  
  const finalScore = Math.max(0, Math.min(100, score));
  
  console.log('📊 Quality Score Final:', {
    finalScore,
    triggerTier2: finalScore <= 40,
    qualityLevel: finalScore > 80 ? 'HIGH' : finalScore > 40 ? 'MEDIUM' : 'LOW'
  });
  
  return finalScore;
}

/**
 * NEW MASTER PLAN: Apply fixes for streamlined 3-field schema
 */
function applyBasicFixes(data, text) {
  const enhanced = { ...data };
  
  // NEW: Ensure primaryScene exists with basic fallback
  if (!enhanced.primaryScene || enhanced.primaryScene.length < 10) {
    const textLower = text.toLowerCase();
    let sceneDescription = 'child in scene';
    
    // Basic scene detection for fallback
    if (textLower.includes('outside') || textLower.includes('park')) {
      sceneDescription = 'child outside in bright scene';
    } else if (textLower.includes('home') || textLower.includes('house')) {
      sceneDescription = 'child at home in indoor scene';
    }
    
    enhanced.primaryScene = sceneDescription;
  }
  
  // NEW: Ensure visualComponents structure exists
  if (!enhanced.visualComponents) {
    enhanced.visualComponents = {
      sceneType: 'mixed',
      lighting: 'natural',
      keyObjects: '',
      setting: '',
      mood: 'neutral'
    };
  } else {
    const vc = enhanced.visualComponents;
    if (!vc.sceneType) vc.sceneType = text.toLowerCase().includes('outside') ? 'outdoor' : 'indoor';
    if (!vc.lighting) vc.lighting = 'bright';
    if (!vc.mood) vc.mood = 'cheerful';
  }
  
  // Legacy character fixes (if characters field exists as string)
  if (typeof enhanced.characters === 'string') {
    // Fix generic character references
    if (enhanced.characters.includes('character')) {
      const nameMatch = text.match(/\b[A-Z][a-z]{2,}\b/);
      if (nameMatch && !['The', 'And', 'But', 'Then', 'They', 'Once'].includes(nameMatch[0])) {
        enhanced.characters = enhanced.characters.replace(/character/g, nameMatch[0]);
      }
    }
  }
  
  return enhanced;
}

// Make available globally
if (typeof globalThis !== 'undefined') {
  globalThis.validateAndEnhanceContent = validateAndEnhanceContent;
}