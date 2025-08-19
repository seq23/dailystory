
// Phase 2: Quality Standardization System
// Ensures consistent quality parameters across all image generation services

export class QualityStandardizationEngine {
  // Standardized quality tiers with optimal parameters for each use case
  static QUALITY_TIERS = {
    // High-quality story images
    story: {
      steps: 4,
      cfgScale: 1.5,
      scheduler: "FlowMatchEulerDiscreteScheduler",
      strength: 0.8,
      outputFormat: "WEBP",
      model: "runware:100@1"
    },
    
    // Fast preview generation
    preview: {
      steps: 3,
      cfgScale: 1.2,
      scheduler: "FlowMatchEulerDiscreteScheduler", 
      strength: 0.7,
      outputFormat: "WEBP",
      model: "runware:100@1"
    },
    
    // High-detail final images
    premium: {
      steps: 6,
      cfgScale: 2.0,
      scheduler: "FlowMatchEulerDiscreteScheduler",
      strength: 0.9,
      outputFormat: "WEBP",
      model: "runware:100@1"
    }
  };

  /**
   * Get standardized quality parameters for a given use case
   */
  static getQualityParameters(tier = 'story', overrides = {}) {
    const baseParams = this.QUALITY_TIERS[tier] || this.QUALITY_TIERS.story;
    return { ...baseParams, ...overrides };
  }

  /**
   * Validate and normalize quality parameters
   */
  static validateQualityParams(params) {
    const validated = { ...params };
    
    // Ensure steps are within valid range
    if (validated.steps < 1) validated.steps = 1;
    if (validated.steps > 10) validated.steps = 10;
    
    // Ensure cfgScale is within valid range
    if (validated.cfgScale < 1.0) validated.cfgScale = 1.0;
    if (validated.cfgScale > 7.0) validated.cfgScale = 7.0;
    
    // Ensure strength is within valid range
    if (validated.strength < 0.1) validated.strength = 0.1;
    if (validated.strength > 1.0) validated.strength = 1.0;
    
    return validated;
  }

  /**
   * Get quality parameters optimized for difficulty level
   */
  static getParametersForDifficulty(difficulty) {
    const difficultyToTier = {
      'beginner': 'preview',  // Faster for young children
      'easy': 'story',        // Standard quality
      'medium': 'story',      // Standard quality
      'hard': 'premium',      // Higher quality for advanced readers
      'expert': 'premium'     // Maximum quality
    };

    const tier = difficultyToTier[difficulty] || 'story';
    return this.getQualityParameters(tier);
  }

  /**
   * Apply consistent negative prompt standards
   */
  static getStandardNegativePrompt() {
    return 'NO TEXT, no letters, no words, no writing, no signs, no symbols, ugly, deformed, bad anatomy, extra limb, mutation, poorly drawn, cropped, lowres, worst quality, low quality, blurry, text, error, adult, mature, violence, scary, dark, inappropriate, nsfw, suggestive, weapons, photorealistic, anime, copyrighted characters, brand logos';
  }

  /**
   * Optimize parameters based on image dimensions
   */
  static optimizeForDimensions(params, width, height) {
    const optimized = { ...params };
    const totalPixels = width * height;
    
    // Adjust steps based on image size
    if (totalPixels > 1500000) { // Large images
      optimized.steps = Math.min(optimized.steps + 1, 8);
    } else if (totalPixels < 700000) { // Small images
      optimized.steps = Math.max(optimized.steps - 1, 2);
    }
    
    return optimized;
  }
}
