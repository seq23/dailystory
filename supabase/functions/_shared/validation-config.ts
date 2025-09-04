// Shared Validation Configuration - TypeScript Export
// Single source of truth for all validation rules and limits

export const validationConfig = {
  "_comment": "FINAL SINGLE SOURCE OF TRUTH - All validation limits defined here",
  "_version": "3.0.0 - Character-Only Validation System (2025-01-03)",
  "_tokenValidation": "DISABLED - Character validation only",
  "_methodology": "Character limits based on real AI story analysis with creativity-based buffers",
  "_progression": "Level0 < Level1 < Level2 < Level3 < Level4 < Grade6-10 (proper educational progression)",
  
  "tokenLimits": {
    "_status": "DISABLED - KEPT FOR REFERENCE ONLY",
    "_note": "Token validation bypassed - these limits are no longer used in validation",
    "Level0": { "perPage": 15, "guestStory": 180 },
    "Level1": { "perPage": 60, "guestStory": 720 },
    "Level2": { "perPage": 250, "guestStory": 3000 },
    "Level3": { "perPage": 350, "guestStory": 4200 },
    "Level4": { "perPage": 500, "guestStory": 6000 },
    "Grade6": { "perPage": 500, "guestStory": 6000 },
    "Grade7": { "perPage": 500, "guestStory": 6000 },
    "Grade8": { "perPage": 500, "guestStory": 6000 },
    "Grade9": { "perPage": 500, "guestStory": 6000 },
    "Grade10": { "perPage": 500, "guestStory": 6000 }
  },
  "difficultyMapping": {
    "beginner": "Level0",
    "easy": "Level1",
    "medium": "Level2",
    "hard": "Level3",
    "expert": "Level4",
    "6th": "Grade6",
    "grade6": "Grade6",
    "7th": "Grade7",
    "grade7": "Grade7",
    "8th": "Grade8",
    "grade8": "Grade8",
    "9th": "Grade9",
    "grade9": "Grade9",
    "10th": "Grade10",
    "grade10": "Grade10"
  },
  "pageExpectations": {
    "netflix": {
      "Level0": 12,
      "Level1": 12,
      "Level2": 12,
      "Level3": 12,
      "Level4": 12,
      "Grade6": 12,
      "Grade7": 12,
      "Grade8": 12,
      "Grade9": 12,
      "Grade10": 12
    },
    "live": null
  },
  "validationThresholds": {
    "minContentRatio": 0.3,
    "maxContentRatio": 1.5,
    "splitTolerance": 1.5,
    "cacheLimit": 500
  },
  "characterMinimumsPerPage": {
    "_comment": "DYNAMIC PER-PAGE CHARACTER MINIMUMS - Single source of truth for all services",
    "_purpose": "Realistic minimums that catch empty/insufficient responses while allowing natural variation",
    "_alignment": "Level 0 system prompt requires 2-8 words per sentence, 'I see.' = 5 chars perfect for validation",
    "_validation_methodology": "Used by both Netflix (multiply by 12 pages) and Live (per-page) services",
    
    "Level0": { 
      "minCharsPerPage": 5,
      "_example": "'I see.' meets system prompt 2-word minimum, catches empty responses"
    },
    "Level1": { 
      "minCharsPerPage": 15,
      "_example": "Short sentences like 'Sam runs fast.' = 15 chars"
    },
    "Level2": { 
      "minCharsPerPage": 25,
      "_example": "Simple paragraphs, basic storytelling"
    },
    "Level3": { 
      "minCharsPerPage": 40,
      "_example": "More developed content per page"
    },
    "Level4": { 
      "minCharsPerPage": 50,
      "_example": "Rich content for advanced readers"
    },
    "Grade6": { 
      "minCharsPerPage": 60,
      "_example": "Grade-level appropriate complexity"
    },
    "Grade7": { 
      "minCharsPerPage": 60,
      "_example": "Grade-level appropriate complexity"
    },
    "Grade8": { 
      "minCharsPerPage": 60,
      "_example": "Grade-level appropriate complexity"
    },
    "Grade9": { 
      "minCharsPerPage": 60,
      "_example": "Grade-level appropriate complexity"
    },
    "Grade10": { 
      "minCharsPerPage": 60,
      "_example": "Grade-level appropriate complexity"
    }
  },
  "referenceAverages": {
    "_comment": "REFERENCE DATA - Keep averages for documentation, use minimums for validation",
    "_purpose": "Ensures we catch real content while allowing natural variation",
    "_methodology": "Averages observed from real AI stories, minimums set for practical validation",
    
    "Level0": { "avgCharsPerPage": 33, "minCharsPerPage": 5 },
    "Level1": { "avgCharsPerPage": 167, "minCharsPerPage": 15 },
    "Level2": { "avgCharsPerPage": 292, "minCharsPerPage": 25 },
    "Level3": { "avgCharsPerPage": 1667, "minCharsPerPage": 40 },
    "Level4": { "avgCharsPerPage": 2167, "minCharsPerPage": 50 },
    "Grade6": { "avgCharsPerPage": 2250, "minCharsPerPage": 60 },
    "Grade7": { "avgCharsPerPage": 2250, "minCharsPerPage": 60 },
    "Grade8": { "avgCharsPerPage": 2250, "minCharsPerPage": 60 },
    "Grade9": { "avgCharsPerPage": 2250, "minCharsPerPage": 60 },
    "Grade10": { "avgCharsPerPage": 2250, "minCharsPerPage": 60 }
  },
  "characterThresholds": {
    "_comment": "LEGACY STORY-LEVEL CHARACTER LIMITS - Kept for compatibility",
    "_note": "Per-page validation now uses characterMinimumsPerPage above",
    "_base_methodology": "Base limits from actual story data, multiplied by creativity buffers",
    "_buffers": "L0-1: 1.2x, L2-3: 1.5x, L4: 2.0x, Grade6-10: 2.5x for maximum creativity",
    "_data_source": "Jordan story (20,283 chars), other real AI stories analyzed for accuracy",
    
    "Level0": { 
      "minChars": 5, 
      "maxChars": 480,
      "_comment": "400 base × 1.2 buffer = 480 chars (PreK-K simple stories)"
    },
    "Level1": { 
      "minChars": 5, 
      "maxChars": 2400,
      "_comment": "2,000 base × 1.2 buffer = 2,400 chars (1st grade stories)"  
    },
    "Level2": { 
      "minChars": 5, 
      "maxChars": 5250,
      "_comment": "3,500 base × 1.5 buffer = 5,250 chars (2nd-3rd grade stories)"
    },
    "Level3": { 
      "minChars": 5, 
      "maxChars": 30000,
      "_comment": "20,000 base × 1.5 buffer = 30,000 chars (Jordan story reference)"
    },
    "Level4": { 
      "minChars": 5, 
      "maxChars": 52000,
      "_comment": "26,000 base × 2.0 buffer = 52,000 chars (expert level creativity)"
    },
    "Grade6": { 
      "minChars": 5, 
      "maxChars": 67500,
      "_comment": "27,000 base × 2.5 buffer = 67,500 chars (6th grade - highest creativity)"
    },
    "Grade7": { 
      "minChars": 5, 
      "maxChars": 67500,
      "_comment": "27,000 base × 2.5 buffer = 67,500 chars (7th grade - highest creativity)"
    },
    "Grade8": { 
      "minChars": 5, 
      "maxChars": 67500,
      "_comment": "27,000 base × 2.5 buffer = 67,500 chars (8th grade - highest creativity)"
    },
    "Grade9": { 
      "minChars": 5, 
      "maxChars": 67500,
      "_comment": "27,000 base × 2.5 buffer = 67,500 chars (9th grade - highest creativity)"
    },
    "Grade10": { 
      "minChars": 5, 
      "maxChars": 67500,
      "_comment": "27,000 base × 2.5 buffer = 67,500 chars (10th grade - highest creativity)"
    }
  }
} as const;

export default validationConfig;