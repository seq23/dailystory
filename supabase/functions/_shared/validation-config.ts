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
  "characterThresholds": {
    "_comment": "PRIMARY VALIDATION METHOD - Character limits based on real AI story analysis",
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