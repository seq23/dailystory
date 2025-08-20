// AI Validation Service - Smart Enhancement Layer
// Replaces destructive hallucination detection with creative enhancement

/**
 * Score and validate AI extraction while preserving creativity
 * @param {Object} enhancedStoryData - AI extracted data
 * @param {string} storyText - Original story text
 * @param {string} sessionId - Session identifier
 * @param {number} pageNumber - Current page number
 * @returns {Object} - Enhanced data with quality score
 */
export async function scoreAndValidateAIExtraction(enhancedStoryData, storyText, sessionId, pageNumber) {
  const score = {
    characterConsistency: 0,    // 0-25 points
    settingLogic: 0,           // 0-25 points
    objectRelevance: 0,        // 0-25 points
    storyCoherence: 0,         // 0-25 points
    totalScore: 0              // 0-100 total
  };

  // Import story state manager for consistency checking
  let StoryVisualStateManager;
  try {
    const module = await import('./storyVisualState.js');
    StoryVisualStateManager = module.StoryVisualStateManager || globalThis.StoryVisualStateManager;
  } catch (error) {
    console.warn('Could not import StoryVisualStateManager for validation');
  }

  // Get previous story context
  const storyState = StoryVisualStateManager?.getStoryState?.(sessionId);
  const previousPages = StoryVisualStateManager?.getPromptHistory?.(sessionId, 3) || [];
  
  // 1. CHARACTER CONSISTENCY SCORING (0-25)
  if (enhancedStoryData.characters && Array.isArray(enhancedStoryData.characters)) {
    let characterScore = 0;
    
    enhancedStoryData.characters.forEach(char => {
      // Check if character name is reasonable
      if (char.name && char.name !== "character") {
        const nameInText = storyText.toLowerCase().includes(char.name.toLowerCase());
        const nameInHistory = storyState?.characters?.has(char.name) || false;
        
        if (nameInText || nameInHistory) {
          characterScore += 8; // Named character mentioned or established
        } else if (previousPages.length > 0) {
          characterScore += 4; // New character in ongoing story (reasonable)
        }
      }
      
      // Check character description quality
      if (char.description && char.description !== "child") {
        characterScore += 3;
      }
      
      // Check emotional context
      if (char.emotions && char.emotions !== "neutral") {
        characterScore += 2;
      }
    });
    
    score.characterConsistency = Math.min(characterScore, 25);
  }

  // 2. SETTING LOGIC SCORING (0-25)
  if (enhancedStoryData.setting) {
    let settingScore = 0;
    const setting = enhancedStoryData.setting;
    
    // Check location consistency
    if (setting.location) {
      const locationInText = storyText.toLowerCase().includes(setting.location.toLowerCase());
      const previousLocation = storyState?.setting?.primaryLocation;
      
      if (locationInText) {
        settingScore += 10; // Location explicitly mentioned
      } else if (previousLocation && setting.location === previousLocation) {
        settingScore += 8; // Consistent with previous location
      } else if (setting.location === "indoor scene" || setting.location === "outdoor scene") {
        settingScore += 5; // Safe generic location
      } else if (previousPages.length > 0) {
        settingScore += 6; // New location in ongoing story (logical progression)
      }
    }
    
    // Check time progression
    if (setting.timeOfDay && setting.timeOfDay !== "daytime") {
      settingScore += 5;
    }
    
    // Check weather context
    if (setting.weather && setting.weather !== "clear") {
      settingScore += 5;
    }
    
    // Check season awareness
    if (setting.season && setting.season !== "unspecified") {
      settingScore += 5;
    }
    
    score.settingLogic = Math.min(settingScore, 25);
  }

  // 3. OBJECT RELEVANCE SCORING (0-25)
  let objectScore = 0;
  if (enhancedStoryData.objects && Array.isArray(enhancedStoryData.objects)) {
    enhancedStoryData.objects.forEach(obj => {
      const objectInText = storyText.toLowerCase().includes(obj.toLowerCase());
      const objectInHistory = storyState?.objects?.has(obj) || false;
      
      if (objectInText) {
        objectScore += 8; // Object explicitly mentioned
      } else if (objectInHistory) {
        objectScore += 6; // Object from previous pages (consistency)
      } else if (previousPages.length > 0) {
        objectScore += 3; // New object in ongoing story (reasonable inference)
      }
    });
  }
  score.objectRelevance = Math.min(objectScore, 25);

  // 4. STORY COHERENCE SCORING (0-25)
  let coherenceScore = 0;
  
  // Check mood appropriateness
  if (enhancedStoryData.mood && enhancedStoryData.mood !== "neutral") {
    coherenceScore += 5;
  }
  
  // Check narrative elements
  if (enhancedStoryData.narrativeElements) {
    const elements = enhancedStoryData.narrativeElements;
    
    if (elements.action && elements.action !== "general activity") {
      coherenceScore += 7;
    }
    
    if (elements.focus && elements.focus !== "character") {
      coherenceScore += 5;
    }
    
    if (elements.perspective && elements.perspective !== "eye level") {
      coherenceScore += 3;
    }
  }
  
  // Story progression bonus for ongoing stories
  if (previousPages.length > 0) {
    coherenceScore += 5;
  }
  
  score.storyCoherence = Math.min(coherenceScore, 25);

  // Calculate total score
  score.totalScore = score.characterConsistency + score.settingLogic + score.objectRelevance + score.storyCoherence;

  // ENHANCEMENT LOGIC BASED ON SCORE
  let enhancedData = { ...enhancedStoryData };
  
  if (score.totalScore >= 60) {
    // High quality - accept as is with minimal enhancement
    console.log(`✅ High quality AI output (${score.totalScore}/100) - accepting with minimal enhancement`);
    enhancedData = enhanceHighQualityOutput(enhancedData, storyState, storyText);
  } else if (score.totalScore >= 40) {
    // Medium quality - enhance and correct
    console.log(`🔧 Medium quality AI output (${score.totalScore}/100) - applying enhancements`);
    enhancedData = enhanceMediumQualityOutput(enhancedData, storyState, storyText, previousPages);
  } else {
    // Low quality - heavy enhancement while preserving creativity
    console.log(`🚀 Low quality AI output (${score.totalScore}/100) - applying heavy enhancements`);
    enhancedData = enhanceLowQualityOutput(enhancedData, storyState, storyText, previousPages);
  }

  return {
    qualityScore: score,
    enhancedData
  };
}

/**
 * Enhance high-quality AI output with consistency checks
 */
function enhanceHighQualityOutput(data, storyState, storyText) {
  const enhanced = { ...data };
  
  // Minimal character consistency enforcement
  if (enhanced.characters && storyState?.characters) {
    enhanced.characters = enhanced.characters.map(char => {
      const existingChar = storyState.characters.get(char.name);
      if (existingChar && existingChar.description) {
        // Maintain character description consistency
        return {
          ...char,
          description: existingChar.description
        };
      }
      return char;
    });
  }
  
  return enhanced;
}

/**
 * Enhance medium-quality AI output with corrections
 */
function enhanceMediumQualityOutput(data, storyState, storyText, previousPages) {
  const enhanced = { ...data };
  
  // Character enhancement
  if (enhanced.characters) {
    enhanced.characters = enhanced.characters.map(char => {
      // Use established character names if available
      if (char.name === "character" && storyState?.characters && storyState.characters.size > 0) {
        const firstChar = storyState.characters.values().next().value;
        if (firstChar) {
          return {
            ...char,
            name: firstChar.name,
            description: firstChar.description || char.description
          };
        }
      }
      return char;
    });
  }
  
  // Setting enhancement
  if (enhanced.setting && storyState?.setting) {
    const currentSetting = storyState.setting;
    if (currentSetting.primaryLocation && !enhanced.setting.location) {
      enhanced.setting.location = currentSetting.primaryLocation;
    }
    if (currentSetting.timeOfDay && enhanced.setting.timeOfDay === "daytime") {
      enhanced.setting.timeOfDay = currentSetting.timeOfDay;
    }
  }
  
  // Object enhancement - add missing established objects
  if (storyState?.objects && storyState.objects.size > 0) {
    const establishedObjects = Array.from(storyState.objects.keys());
    const relevantObjects = establishedObjects.filter(obj => 
      storyText.toLowerCase().includes(obj.toLowerCase())
    );
    
    if (relevantObjects.length > 0) {
      enhanced.objects = [...(enhanced.objects || []), ...relevantObjects];
    }
  }
  
  return enhanced;
}

/**
 * Enhance low-quality AI output with heavy improvements while preserving creativity
 */
function enhanceLowQualityOutput(data, storyState, storyText, previousPages) {
  const enhanced = enhanceMediumQualityOutput(data, storyState, storyText, previousPages);
  
  // Character name inference from text
  if (enhanced.characters) {
    enhanced.characters = enhanced.characters.map(char => {
      if (char.name === "character") {
        // Try to infer character name from text
        const nameMatches = storyText.match(/\b[A-Z][a-z]+\b/g);
        if (nameMatches && nameMatches.length > 0) {
          const potentialName = nameMatches[0];
          if (potentialName.length > 2 && !['The', 'And', 'But', 'Then', 'They'].includes(potentialName)) {
            return {
              ...char,
              name: potentialName
            };
          }
        }
      }
      return char;
    });
  }
  
  // Setting inference from text
  if (enhanced.setting) {
    const locationKeywords = {
      'home': ['home', 'house', 'kitchen', 'bedroom', 'living room'],
      'school': ['school', 'classroom', 'playground', 'library'],
      'park': ['park', 'playground', 'grass', 'trees', 'outside'],
      'forest': ['forest', 'woods', 'trees', 'nature'],
      'beach': ['beach', 'sand', 'ocean', 'water']
    };
    
    const textLower = storyText.toLowerCase();
    for (const [location, keywords] of Object.entries(locationKeywords)) {
      if (keywords.some(keyword => textLower.includes(keyword))) {
        enhanced.setting.location = location;
        break;
      }
    }
  }
  
  // Mood inference from text
  const moodKeywords = {
    'happy': ['happy', 'excited', 'joy', 'smile', 'laugh', 'fun'],
    'sad': ['sad', 'cry', 'tear', 'unhappy', 'disappointed'],
    'scared': ['scared', 'afraid', 'frightened', 'worried'],
    'angry': ['angry', 'mad', 'upset', 'frustrated'],
    'curious': ['wonder', 'curious', 'explore', 'discover', 'look']
  };
  
  const textLower = storyText.toLowerCase();
  for (const [mood, keywords] of Object.entries(moodKeywords)) {
    if (keywords.some(keyword => textLower.includes(keyword))) {
      enhanced.mood = mood;
      break;
    }
  }
  
  return enhanced;
}

// Make available globally
if (typeof globalThis !== 'undefined') {
  globalThis.scoreAndValidateAIExtraction = scoreAndValidateAIExtraction;
}