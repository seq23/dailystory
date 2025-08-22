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
 * NEW MASTER PLAN: Detect mismatches in streamlined 3-field schema
 */
function detectContentMismatches(data, text) {
  const mismatches = [];
  const textLower = text.toLowerCase();
  
  // NEW: Validate primaryScene presence and quality
  if (!data.primaryScene || data.primaryScene.length < 10) {
    mismatches.push('missing-primary-scene: Primary scene description too short or missing');
  }
  
  // NEW: Validate visualComponents structure
  if (!data.visualComponents) {
    mismatches.push('missing-visual-components: Visual components object missing');
  } else {
    const vc = data.visualComponents;
    if (!vc.sceneType) mismatches.push('missing-scene-type: Scene type not specified');
    if (!vc.lighting) mismatches.push('missing-lighting: Lighting not specified');
  }
  
  // Action mismatch detection
  if (data.narrativeElements?.action) {
    const actionWords = {
      'sleeping': ['sleep', 'nap', 'rest', 'bed'],
      'running': ['run', 'sprint', 'race'],
      'crying': ['cry', 'tear', 'sob'],
      'laughing': ['laugh', 'giggle', 'smile']
    };
    
    for (const [aiAction, keywords] of Object.entries(actionWords)) {
      if (data.narrativeElements.action.includes(aiAction)) {
        const oppositeFound = Object.entries(actionWords)
          .filter(([action]) => action !== aiAction)
          .some(([_, oppKeywords]) => oppKeywords.some(word => textLower.includes(word)));
        
        if (oppositeFound && !keywords.some(word => textLower.includes(word))) {
          mismatches.push(`action-mismatch: AI says ${aiAction} but story suggests otherwise`);
        }
      }
    }
  }

  // ENHANCED: Lighting/Weather mismatch detection
  const lightingWords = {
    'bright': ['sun', 'sunny', 'bright', 'shine', 'shining', 'yellow', 'warm light'],
    'dark': ['dark', 'night', 'shadow', 'dim', 'gloomy'],
    'cloudy': ['cloud', 'cloudy', 'overcast', 'gray sky'],
    'rainy': ['rain', 'rainy', 'wet', 'storm']
  };
  
  for (const [condition, keywords] of Object.entries(lightingWords)) {
    const hasCondition = keywords.some(word => textLower.includes(word));
    if (hasCondition) {
      // Check if AI missed obvious lighting/weather cues
      const aiWeather = data.setting?.weather?.toLowerCase() || '';
      const aiLocation = data.setting?.location?.toLowerCase() || '';
      
      if (condition === 'bright' && (!aiWeather.includes('sun') && !aiLocation.includes('bright') && !aiLocation.includes('outdoor'))) {
        mismatches.push(`scene-mismatch: Story mentions ${keywords.join('/')} but AI missed bright/sunny context`);
      }
      if (condition === 'dark' && (!aiWeather.includes('dark') && !aiLocation.includes('dark'))) {
        mismatches.push(`scene-mismatch: Story mentions darkness but AI missed dark context`);
      }
    }
  }

  // ENHANCED: Emotional expression mismatch detection  
  const emotionalWords = {
    'happy': ['happy', 'joy', 'smile', 'laugh', 'giggle', 'cheerful', 'excited', 'plays'],
    'sad': ['sad', 'cry', 'tear', 'unhappy', 'lonely', 'worried'],
    'playful': ['play', 'fun', 'game', 'adventure', 'explore']
  };
  
  for (const [emotion, keywords] of Object.entries(emotionalWords)) {
    const hasEmotion = keywords.some(word => textLower.includes(word));
    if (hasEmotion && data.characters?.length > 0) {
      const aiEmotions = data.characters.map(c => c.emotions?.toLowerCase() || '').join(' ');
      const aiMood = data.mood?.toLowerCase() || '';
      
      if (emotion === 'happy' && !aiEmotions.includes('happy') && !aiEmotions.includes('joy') && !aiMood.includes('happy')) {
        mismatches.push(`emotion-mismatch: Story suggests happiness/joy but AI missed emotional context`);
      }
      if (emotion === 'sad' && !aiEmotions.includes('sad') && !aiMood.includes('sad')) {
        mismatches.push(`emotion-mismatch: Story suggests sadness but AI missed emotional context`);
      }
    }
  }

  // Setting contradiction check (enhanced)
  if (data.setting?.location) {
    const indoorWords = ['bedroom', 'kitchen', 'house', 'room', 'inside'];
    const outdoorWords = ['park', 'forest', 'outside', 'garden', 'yard', 'bright', 'sun'];
    
    const hasIndoor = indoorWords.some(word => textLower.includes(word));
    const hasOutdoor = outdoorWords.some(word => textLower.includes(word));
    
    if (hasIndoor && data.setting.location.includes('outdoor')) {
      mismatches.push('setting-mismatch: AI says outdoor but story mentions indoor location');
    }
    if (hasOutdoor && data.setting.location.includes('indoor')) {
      mismatches.push('setting-mismatch: AI says indoor but story mentions outdoor location');
    }
  }
  
  // Missing objects detection (minor fixable issue)
  const textWords = text.toLowerCase().split(/\s+/);
  const commonObjects = ['book', 'ball', 'toy', 'car', 'dog', 'cat', 'tree', 'flower'];
  const missingObjects = commonObjects.filter(obj => 
    textWords.includes(obj) && 
    (!data.objects || !data.objects.some(o => o.toLowerCase().includes(obj)))
  );
  if (missingObjects.length > 0) {
    mismatches.push(`missing-objects: Story mentions ${missingObjects.join(', ')} but AI missed them`);
  }

  // Generic names detection (minor fixable issue)  
  if (data.characters?.some(c => c.name === "character")) {
    mismatches.push(`generic-names: AI used generic "character" name instead of extracting actual name`);
  }

  return mismatches;
}

/**
 * NEW MASTER PLAN: Calculate quality score for 3-field schema
 */
function calculateQualityScore(data, text, mismatches) {
  let score = 100;
  
  // NEW SCHEMA CRITICAL ERRORS → Trigger Tier 2 Fallback (Score ≤ 40)
  mismatches.forEach(mismatch => {
    if (mismatch.includes('missing-primary-scene')) {
      score -= 70; // Missing primary scene = critical error for new schema
    } else if (mismatch.includes('missing-visual-components')) {
      score -= 50; // Missing visual components = major error
    } else if (mismatch.includes('missing-scene-type')) {
      score -= 15; // Missing scene type = moderate error (fixable)
    } else if (mismatch.includes('missing-lighting')) {
      score -= 15; // Missing lighting = moderate error (fixable)
    } else if (mismatch.includes('scene-mismatch')) {
      score -= 60; // Scene context mismatch = critical visual error
    } else if (mismatch.includes('action-mismatch')) {
      score -= 60; // Wrong action = critical error
    } else if (mismatch.includes('setting-mismatch')) {
      score -= 30; // Indoor/outdoor mismatch = major error
    } else if (mismatch.includes('emotion-mismatch')) {
      score -= 5; // Missing emotions = minor error (fixable)
    } else if (mismatch.includes('missing-objects')) {
      score -= 5; // Missing objects = minor error (fixable)
    } else if (mismatch.includes('generic-names')) {
      score -= 2; // Generic names = minor error (fixable)
    } else {
      score -= 10; // Other mismatches
    }
  });
  
  // NEW SCHEMA: Check completeness of 3-field structure
  if (!data.primaryScene) score -= 70;
  if (!data.visualComponents) score -= 50;
  if (!data.characters) score -= 15;
  
  // Ensure minimum score
  return Math.max(0, score);
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