// Ultra-Lean Content Validation System
// Replaces 3 complex validation systems (1000+ lines) with simple content accuracy check

/**
 * Simple content validator with quality gate - focuses on story-AI accuracy and basic fixes
 * @param {Object} enhancedStoryData - AI extracted data
 * @param {string} storyText - Original story text
 * @returns {Object} - Enhanced data, quality score, or tier 2 trigger
 */
export function validateAndEnhanceContent(enhancedStoryData, storyText) {
  // Part 1: Content Accuracy Check with Quality Scoring
  const mismatches = detectContentMismatches(enhancedStoryData, storyText);
  const qualityScore = calculateQualityScore(enhancedStoryData, storyText, mismatches);
  
  console.log(`🔍 Quality Assessment: ${qualityScore}/100 (${mismatches.length} mismatches)`);
  
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
  
  // Part 2: Basic Fixes Only - fix obvious AI errors
  const enhanced = applyBasicFixes(enhancedStoryData, storyText);
  
  console.log(`✅ Content validated and enhanced (score: ${qualityScore}/100)`);
  return { enhancedData: enhanced, qualityScore };
}

/**
 * Detect content mismatches between AI output and story text
 */
function detectContentMismatches(data, text) {
  const mismatches = [];
  const textLower = text.toLowerCase();
  
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
 * Calculate content quality score (0-100) - ENHANCED PENALTIES
 */
function calculateQualityScore(data, text, mismatches) {
  let score = 100;
  
  // UNFIXABLE CRITICAL ERRORS → Trigger Tier 2 Fallback (Score ≤ 40)
  mismatches.forEach(mismatch => {
    if (mismatch.includes('scene-mismatch')) {
      score -= 60; // Missing scene context = critical visual error (unfixable)
    } else if (mismatch.includes('action-mismatch')) {
      score -= 60; // Wrong character action = critical error (unfixable)  
    } else if (mismatch.includes('setting-mismatch')) {
      score -= 30; // Indoor/outdoor mismatch = major error (partially fixable)
    // FIXABLE MINOR ERRORS → Apply validation fixes (Continue processing)
    } else if (mismatch.includes('emotion-mismatch')) {
      score -= 5; // Missing emotions = minor error (fixable)
    } else if (mismatch.includes('missing-objects')) {
      score -= 5; // Missing objects = minor error (easily fixable)
    } else if (mismatch.includes('generic-names')) {
      score -= 2; // Generic names = minor error (easily fixable)
    } else {
      score -= 10; // Other mismatches
    }
  });
  
  // Check basic content completeness (minor penalties for fixable issues)
  if (!data.characters || data.characters.length === 0) score -= 15;
  if (!data.setting || !data.setting.location) score -= 10;
  if (data.characters?.some(c => c.name === "character")) score -= 2; // Now handled by generic-names detection
  if (data.setting?.location === "scene" || data.setting?.location === "indoor scene") score -= 5; // Reduced - fixable
  
  // Ensure minimum score
  return Math.max(0, score);
}

/**
 * Apply basic fixes to AI output
 */
function applyBasicFixes(data, text) {
  const enhanced = { ...data };
  
  // Fix generic "character" names
  if (enhanced.characters) {
    enhanced.characters = enhanced.characters.map(char => {
      if (char.name === "character") {
        const nameMatch = text.match(/\b[A-Z][a-z]{2,}\b/);
        if (nameMatch && !['The', 'And', 'But', 'Then', 'They', 'Once'].includes(nameMatch[0])) {
          return { ...char, name: nameMatch[0] };
        }
      }
      return char;
    });
  }
  
  // Add missing setting location if completely empty
  if (!enhanced.setting?.location || enhanced.setting.location === "scene") {
    const locationKeywords = {
      'home': ['home', 'house', 'kitchen', 'bedroom'],
      'school': ['school', 'classroom', 'teacher'],
      'park': ['park', 'playground', 'outside', 'trees']
    };
    
    const textLower = text.toLowerCase();
    for (const [location, keywords] of Object.entries(locationKeywords)) {
      if (keywords.some(word => textLower.includes(word))) {
        enhanced.setting = { ...enhanced.setting, location };
        break;
      }
    }
  }
  
  // Ensure objects mentioned in text are included
  if (enhanced.objects) {
    const textWords = text.toLowerCase().split(/\s+/);
    const commonObjects = ['book', 'ball', 'toy', 'car', 'dog', 'cat', 'tree', 'flower'];
    
    commonObjects.forEach(obj => {
      if (textWords.includes(obj) && !enhanced.objects.some(o => o.toLowerCase().includes(obj))) {
        enhanced.objects.push(obj);
      }
    });
  }
  
  return enhanced;
}

// Make available globally
if (typeof globalThis !== 'undefined') {
  globalThis.validateAndEnhanceContent = validateAndEnhanceContent;
}