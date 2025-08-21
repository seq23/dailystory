// Ultra-Lean Content Validation System
// Replaces 3 complex validation systems (1000+ lines) with simple content accuracy check

/**
 * Simple content validator - focuses on story-AI accuracy and basic fixes
 * @param {Object} enhancedStoryData - AI extracted data
 * @param {string} storyText - Original story text
 * @returns {Object} - Enhanced data or re-analysis trigger
 */
export function validateAndEnhanceContent(enhancedStoryData, storyText) {
  // Part 1: Content Accuracy Check - detect major mismatches
  const mismatches = detectContentMismatches(enhancedStoryData, storyText);
  
  // If major mismatches found, trigger re-analysis
  if (mismatches.length > 0) {
    console.log(`⚠️ Content mismatches detected: ${mismatches.join(', ')} - triggering re-analysis`);
    return { requiresReanalysis: true, mismatches };
  }
  
  // Part 2: Basic Fixes Only - fix obvious AI errors
  const enhanced = applyBasicFixes(enhancedStoryData, storyText);
  
  console.log(`✅ Content validated and enhanced`);
  return { enhancedData: enhanced };
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
  
  // Setting contradiction check
  if (data.setting?.location) {
    const indoorWords = ['bedroom', 'kitchen', 'house', 'room', 'inside'];
    const outdoorWords = ['park', 'forest', 'outside', 'garden', 'yard'];
    
    const hasIndoor = indoorWords.some(word => textLower.includes(word));
    const hasOutdoor = outdoorWords.some(word => textLower.includes(word));
    
    if (hasIndoor && data.setting.location.includes('outdoor')) {
      mismatches.push('setting-mismatch: AI says outdoor but story mentions indoor location');
    }
    if (hasOutdoor && data.setting.location.includes('indoor')) {
      mismatches.push('setting-mismatch: AI says indoor but story mentions outdoor location');
    }
  }
  
  return mismatches;
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