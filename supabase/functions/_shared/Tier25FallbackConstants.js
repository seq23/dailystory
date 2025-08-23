// ============= TIER 2.5 NUCLEAR FALLBACK CONSTANTS =============
// This file contains all hardcoded constants for the Tier 2.5 fallback system
// These constants ensure reliable prompt generation when all other systems fail

export class Tier25FallbackConstants {
  
  // ============= NEGATIVE PROMPT SEGMENTS =============
  // Hardcoded negative prompt components for consistent quality and cultural sensitivity
  static NEGATIVE_PROMPT_SEGMENTS = {
    // Pixar anti-toy protection
    PIXAR_ANTITOY: "avoid toy-like appearance, not plastic toys, not action figures, not dolls, realistic human features",
    
    // African American cultural sensitivity
    AFRICAN_AMERICAN_SENSITIVITY: "respectful representation, authentic features, cultural dignity, avoid stereotypes",
    
    // General quality control
    QUALITY_CONTROL: "avoid low quality, blurry, distorted, deformed, duplicate, extra limbs, bad anatomy, poorly drawn hands, mutation, mutated, ugly, disgusting, amputation",
    
    // Style consistency
    STYLE_CONSISTENCY: "avoid anime style, avoid cartoon network style, avoid disney 3d style, professional children's book illustration"
  };

  // ============= GENERATION PARAMETERS BY DIFFICULTY =============
  // Hardcoded technical parameters for each difficulty level
  static GENERATION_PARAMS_BY_DIFFICULTY = {
    beginner: {
      cfg_scale: 7.0,
      steps: 25,
      sampler: "DPM++ 2M Karras",
      strength: 0.75,
      width: 768,
      height: 768
    },
    easy: {
      cfg_scale: 7.5,
      steps: 30,
      sampler: "DPM++ 2M Karras", 
      strength: 0.8,
      width: 768,
      height: 768
    },
    medium: {
      cfg_scale: 8.0,
      steps: 35,
      sampler: "DPM++ 2M Karras",
      strength: 0.85,
      width: 1024,
      height: 1024
    },
    hard: {
      cfg_scale: 8.5,
      steps: 40,
      sampler: "DPM++ 2M Karras",
      strength: 0.9,
      width: 1024,
      height: 1024
    },
    expert: {
      cfg_scale: 9.0,
      steps: 45,
      sampler: "DPM++ 2M Karras",
      strength: 0.95,
      width: 1024,
      height: 1024
    }
  };

  // ============= FALLBACK METADATA =============
  // Hardcoded metadata for tracking Tier 2.5 usage and quality
  static FALLBACK_METADATA = {
    tier: "2.5",
    fallback_type: "nuclear_hardcoded",
    quality_score: 0.85,
    reliability_level: "maximum",
    cultural_safety: true,
    pixar_protection: true,
    generation_source: "tier_25_fallback_constants"
  };

  // ============= UNIFIED NEGATIVE PROMPT GENERATOR =============
  // Combines all negative prompt segments into a cohesive negative prompt
  static generateUnifiedNegativePrompt(userInfo, difficulty = 'medium') {
    const segments = [];
    
    // Always include quality control
    segments.push(this.NEGATIVE_PROMPT_SEGMENTS.QUALITY_CONTROL);
    
    // Always include style consistency
    segments.push(this.NEGATIVE_PROMPT_SEGMENTS.STYLE_CONSISTENCY);
    
    // Add Pixar anti-toy protection
    segments.push(this.NEGATIVE_PROMPT_SEGMENTS.PIXAR_ANTITOY);
    
    // Add African American sensitivity if applicable
    const avatarType = userInfo?.avatar?.type || userInfo?.avatarIdentity?.type;
    if (avatarType === 'african-american' || avatarType === 'black') {
      segments.push(this.NEGATIVE_PROMPT_SEGMENTS.AFRICAN_AMERICAN_SENSITIVITY);
    }
    
    // Join with commas and return
    return segments.join(', ');
  }

  // ============= GENERATION PARAMETERS GETTER =============
  // Returns hardcoded generation parameters for given difficulty
  static getGenerationParams(difficulty = 'medium') {
    return this.GENERATION_PARAMS_BY_DIFFICULTY[difficulty] || this.GENERATION_PARAMS_BY_DIFFICULTY.medium;
  }

  // ============= METADATA GETTER =============
  // Returns hardcoded metadata with difficulty and timestamp
  static getFallbackMetadata(difficulty = 'medium') {
    return {
      ...this.FALLBACK_METADATA,
      difficulty_level: difficulty,
      generated_at: new Date().toISOString(),
      fallback_reason: "tier_25_nuclear_fallback_activated"
    };
  }
}