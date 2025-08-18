// Centralized Art Style Framework - Single Source of Truth
// Implements comprehensive art style synchronization across all image generation services

export const COMPREHENSIVE_STYLE_FRAMEWORKS = {
  'beginner': {
    // Level 0 - Pre-reader
    name: 'High-Quality 3D Children\'s Art',
    artStyle: 'High-quality 3D-rendered digital illustration with cartoon aesthetics (NO TEXT)',
    colorPalette: 'Bright, cheerful colors with natural color harmony',
    lighting: 'Natural daylight with soft shadows and highlights',
    texture: 'Smooth, polished surfaces with subtle material definition',
    composition: 'Clear, focused composition with appealing depth',
    quality: 'Premium children\'s book illustration with depth and dimension',
    
    // Prompt components
    prompt: '3D children\'s book art, bright colors, smooth rendering, cheerful',
    complexity: 'standard',
    colorPaletteKey: 'bright_vibrant',
    detailLevel: 'high',
    rendering: '3d_smooth',
    brandSuffix: 'children\'s book illustration, warm earth tones, diverse inclusive characters, professional artwork',
    
    // Technical parameters (Runware optimized)
    parameters: {
      cfgScale: 2.5,
      steps: 6,
      scheduler: 'FlowMatchEulerDiscreteScheduler',
      strength: 0.8
    }
  },
  
  'easy': {
    // Level 1 - Beginner (identical to Level 0)
    name: 'High-Quality 3D Children\'s Art',
    artStyle: 'High-quality 3D-rendered digital illustration with cartoon aesthetics (NO TEXT)',
    colorPalette: 'Bright, cheerful colors with natural color harmony',
    lighting: 'Natural daylight with soft shadows and highlights',
    texture: 'Smooth, polished surfaces with subtle material definition',
    composition: 'Clear, focused composition with appealing depth',
    quality: 'Premium children\'s book illustration with depth and dimension',
    
    // Prompt components
    prompt: '3D children\'s book art, bright colors, smooth rendering, cheerful',
    complexity: 'standard',
    colorPaletteKey: 'bright_vibrant',
    detailLevel: 'high',
    rendering: '3d_smooth',
    brandSuffix: 'children\'s book illustration, warm earth tones, diverse inclusive characters, professional artwork',
    
    // Technical parameters (Runware optimized)
    parameters: {
      cfgScale: 2.5,
      steps: 6,
      scheduler: 'FlowMatchEulerDiscreteScheduler',
      strength: 0.8
    }
  },
  
  'medium': {
    // Level 2 - Developing
    name: 'Digital Painterly Illustration',
    artStyle: 'Digital illustration with painterly qualities, soft brush strokes',
    colorPalette: 'Warm, muted tones with soft pastels',
    lighting: 'Gentle, diffused natural lighting with subtle rim lighting',
    texture: 'Smooth gradients with subtle texture overlay',
    composition: 'Clean, focused composition with depth of field',
    quality: 'Professional children\'s book illustration standard',
    
    // Prompt components
    prompt: 'children\'s book illustration, soft pastels, warm lighting, digital art',
    complexity: 'minimal',
    colorPaletteKey: 'warm_pastels',
    detailLevel: 'medium',
    rendering: 'painterly',
    brandSuffix: 'children\'s book illustration, warm colors, safe wholesome content',
    
    // Technical parameters (Runware optimized)
    parameters: {
      cfgScale: 3.0,
      steps: 8,
      scheduler: 'FlowMatchEulerDiscreteScheduler',
      strength: 0.75
    }
  },
  
  'hard': {
    // Level 3 - Sophisticated
    name: 'Sophisticated 2D Digital Art',
    artStyle: '2D digital illustration (sophisticated artistic style)',
    colorPalette: 'Nuanced color gradients, artistic palette',
    lighting: 'Advanced lighting with sophisticated shadows and highlights',
    texture: 'Refined digital textures with artistic depth',
    composition: 'Sophisticated artistic composition with visual hierarchy',
    quality: 'Sophisticated artistic children\'s book illustration',
    
    // Prompt components
    prompt: '2D digital illustration (sophisticated artistic style), nuanced color gradients, artistic palette, highly detailed, advanced digital painting techniques',
    complexity: 'high',
    colorPaletteKey: 'nuanced_artistic',
    detailLevel: 'highly detailed',
    rendering: 'advanced_digital_painting',
    brandSuffix: 'artistic children\'s book illustration, refined quality, diverse representation',
    
    // Technical parameters (Runware optimized)
    parameters: {
      cfgScale: 3.5,
      steps: 10,
      scheduler: 'FlowMatchEulerDiscreteScheduler',
      strength: 0.8
    }
  },
  
  'expert': {
    // Level 4 - Masterful
    name: 'Masterful 2D Digital Art',
    artStyle: '2D digital illustration (masterful artistic technique)',
    colorPalette: 'Complex color theory, professional artist palette',
    lighting: 'Complex artistic lighting with intricate shadow work',
    texture: 'Intricate artistic textures with masterful detail',
    composition: 'Masterful artistic composition with complex visual storytelling',
    quality: 'Masterful children\'s book art with diverse representation',
    
    // Prompt components
    prompt: '2D digital illustration (masterful artistic technique), complex color theory, intricate details',
    complexity: 'very_high',
    colorPaletteKey: 'complex_professional',
    detailLevel: 'intricate and complex',
    rendering: 'masterful_artistic_technique',
    brandSuffix: 'masterful children\'s book art, sophisticated quality, diverse representation',
    
    // Technical parameters (Runware optimized)
    parameters: {
      cfgScale: 3.8,
      steps: 12,
      scheduler: 'FlowMatchEulerDiscreteScheduler',
      strength: 0.85
    }
  }
};

// Color palette definitions
export const COLOR_PALETTE_DEFINITIONS = {
  'bright_vibrant': 'bright cheerful colors, natural vibrant hues, harmonious palette',
  'warm_pastels': 'warm muted tones, soft pastels, gentle color harmony',
  'nuanced_artistic': 'nuanced color gradients, artistic palette, sophisticated color relationships',
  'complex_professional': 'complex color theory, professional artist palette, masterful color composition'
};

// Rendering technique definitions
export const RENDERING_TECHNIQUE_DEFINITIONS = {
  '3d_smooth': '3D rendered, smooth polished surfaces, cartoon aesthetics',
  'painterly': 'digital painterly style, soft brush strokes, artistic texture',
  'advanced_digital_painting': 'advanced digital painting techniques, sophisticated rendering',
  'masterful_artistic_technique': 'masterful artistic technique, complex artistic methods'
};

// Helper function to get style framework by difficulty
export function getStyleFramework(difficulty) {
  const normalizedDifficulty = difficulty?.toLowerCase() || 'medium';
  const framework = COMPREHENSIVE_STYLE_FRAMEWORKS[normalizedDifficulty] || COMPREHENSIVE_STYLE_FRAMEWORKS['medium'];
  
  // Validate framework completeness
  if (!validateStyleFramework(normalizedDifficulty)) {
    console.warn(`⚠️ Style framework validation failed for difficulty: ${normalizedDifficulty}`);
  }
  
  console.log(`🎨 Retrieved ${framework.name} style framework for difficulty: ${normalizedDifficulty}`);
  return framework;
}

// Helper function to build complete prompt from framework
export function buildCompletePrompt(framework, sceneDescription, characterDescription = '', culturalContext = '') {
  const basePrompt = `${sceneDescription}, ${framework.prompt}`;
  
  let enhancedPrompt = basePrompt;
  
  if (characterDescription) {
    enhancedPrompt += `, ${characterDescription}`;
  }
  
  if (culturalContext) {
    enhancedPrompt += `, ${culturalContext}`;
  }
  
  // Add framework-specific quality terms
  enhancedPrompt += `, ${framework.artStyle}, ${framework.quality}`;
  
  // Add brand suffix
  enhancedPrompt += `, ${framework.brandSuffix}`;
  
  return enhancedPrompt;
}

// Helper function to get optimized parameters
export function getOptimizedParameters(framework, characterComplexity = 1) {
  const baseParams = { ...framework.parameters };
  
  // Adjust for character complexity (Runware optimized)
  if (characterComplexity > 2) {
    baseParams.steps = Math.min(baseParams.steps + 2, 15);
    baseParams.cfgScale = Math.min(baseParams.cfgScale + 0.3, 4.0);
  }
  
  return baseParams;
}

// Validation function to ensure framework completeness
export function validateStyleFramework(difficulty) {
  const normalizedDifficulty = difficulty?.toLowerCase() || 'medium';
  const framework = COMPREHENSIVE_STYLE_FRAMEWORKS[normalizedDifficulty] || COMPREHENSIVE_STYLE_FRAMEWORKS['medium'];
  
  const requiredFields = [
    'name', 'artStyle', 'colorPalette', 'lighting', 'texture', 
    'composition', 'quality', 'prompt', 'complexity', 'colorPaletteKey', 
    'detailLevel', 'rendering', 'brandSuffix', 'parameters'
  ];
  
  const missingFields = requiredFields.filter(field => !framework[field]);
  
  if (missingFields.length > 0) {
    console.warn(`⚠️ Style framework "${difficulty}" missing fields:`, missingFields);
    return false;
  }
  
  return true;
}

// Export default framework getter for backwards compatibility
export { getStyleFramework as default };