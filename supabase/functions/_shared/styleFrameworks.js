// Centralized Art Style Framework - Single Source of Truth
// Implements comprehensive art style synchronization across all image generation services

export const COMPREHENSIVE_STYLE_FRAMEWORKS = {
  'beginner': {
    // Level 0 - Pre-reader
    name: '3D Pixar Animation Style',
    artStyle: '3D Pixar animation style with smooth rounded features and warm golden tones, single main character focus',
    colorPalette: 'Warm golden tones with soft, natural color harmony',
    lighting: 'Soft volumetric lighting with warm golden highlights',
    texture: 'Smooth, rounded surfaces with professional 3D rendering quality',
    composition: 'Clear, focused single character composition, minimal clean background',
    quality: 'Professional animation studio quality with depth and dimension',
    
    // Prompt components
    prompt: '3D Pixar animation style, soft volumetric lighting, warm golden tones, smooth rounded features, high-quality 3D rendering, child-friendly, professional animation studio quality',
    complexity: 'standard',
    colorPaletteKey: 'bright_vibrant',
    detailLevel: 'high',
    rendering: 'pixar_3d',
    brandSuffix: 'photorealistic 3D render, Pixar animation quality, detailed facial features, realistic proportions, cinematic lighting, detailed indoor environment, soft natural window light, high quality 3D animation',
    negativePrompt: 'toy, figurine, doll, plastic, simple background, flat lighting, multiple characters, crowd, busy background, dark colors, scary, photorealistic, adult themes, text, words',
    
    // Technical parameters (Ultra Premium Quality)
    parameters: {
      cfgScale: 4.0,
      steps: 12,
      scheduler: 'FlowMatchEulerDiscreteScheduler',
      strength: 0.9,
      outputFormat: 'WEBP'
    }
  },
  
  'easy': {
    // Level 1 - Beginner (identical to Level 0)
    name: '3D Pixar Animation Style',
    artStyle: '3D Pixar animation style with smooth rounded features and warm golden tones (NO TEXT)',
    colorPalette: 'Warm golden tones with soft, natural color harmony',
    lighting: 'Soft volumetric lighting with warm golden highlights',
    texture: 'Smooth, rounded surfaces with professional 3D rendering quality',
    composition: 'Clear, focused composition with appealing depth',
    quality: 'Professional animation studio quality with depth and dimension',
    
    // Prompt components
    prompt: '3D Pixar animation style, soft volumetric lighting, warm golden tones, smooth rounded features, high-quality 3D rendering, child-friendly, professional animation studio quality',
    complexity: 'standard',
    colorPaletteKey: 'bright_vibrant',
    detailLevel: 'high',
    rendering: 'pixar_3d',
    brandSuffix: 'photorealistic 3D render, Pixar animation quality, detailed facial features, realistic proportions, cinematic lighting, detailed indoor environment, soft natural window light, high quality 3D animation',
    
    negativePrompt: 'toy, figurine, doll, plastic, simple background, flat lighting, multiple people, crowd, cluttered background, dark atmosphere, scary elements, photorealistic, text, adult content',
    
    // Technical parameters (Ultra Premium Quality)
    parameters: {
      cfgScale: 4.0,
      steps: 12,
      scheduler: 'FlowMatchEulerDiscreteScheduler',
      strength: 0.9,
      outputFormat: 'WEBP'
    }
  },
  
  'medium': {
    // Level 2 - Developing
    name: 'Digital Painterly Illustration',
    artStyle: 'Digital illustration with painterly qualities, soft brush strokes, focused character presentation',
    colorPalette: 'Warm, muted tones with soft pastels, harmonious palette',
    lighting: 'Gentle, diffused natural lighting with subtle rim lighting, clear visibility',
    texture: 'Smooth gradients with subtle texture overlay, clean finish',
    composition: 'Clean, focused single character composition with depth of field, minimal background',
    quality: 'Ultra professional children\'s book illustration standard',
    
    // Prompt components
    prompt: '2D painterly digital illustration style, soft natural lighting, expressive design, masterful composition, warm tones, light rays',
    complexity: 'minimal',
    colorPaletteKey: 'warm_pastels',
    detailLevel: 'medium',
    rendering: 'painterly',
    brandSuffix: 'professional children\'s book digital illustration, natural lighting for dark skin, culturally accurate, safe wholesome content, high quality professional artwork',
    negativePrompt: 'multiple people, crowd, cluttered background, dark atmosphere, scary elements, photorealistic, text, adult content',
    
    // Technical parameters (Ultra Premium Quality)
    parameters: {
      cfgScale: 4.0,
      steps: 12,
      scheduler: 'FlowMatchEulerDiscreteScheduler',
      strength: 0.9,
      outputFormat: 'WEBP'
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
    
    // Technical parameters (Ultra Premium Quality)
    parameters: {
      cfgScale: 4.0,
      steps: 12,
      scheduler: 'FlowMatchEulerDiscreteScheduler',
      strength: 0.9,
      outputFormat: 'WEBP'
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
    
    // Technical parameters (Ultra Premium Quality)
    parameters: {
      cfgScale: 4.0,
      steps: 12,
      scheduler: 'FlowMatchEulerDiscreteScheduler',
      strength: 0.9,
      outputFormat: 'WEBP'
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
  'pixar_3d': '3D Pixar animation style, smooth rounded features, professional animation studio quality',
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

// Legacy prompt building - now handled by MultiStageEnhancementPipeline
// DO NOT USE - kept for backwards compatibility only
export function buildCompletePrompt(framework, sceneDescription, characterDescription = '', culturalContext = '', storyElements = null) {
  console.warn('⚠️ buildCompletePrompt() is deprecated - use MultiStageEnhancementPipeline');
  
  // Simple fallback for emergency use only
  const simplePrompt = `${sceneDescription}, ${framework.prompt}, ${framework.brandSuffix}`;
  const negativePrompt = framework.negativePrompt || "text, words, scary, dark";
  
  return {
    positivePrompt: simplePrompt,
    negativePrompt
  };
}

// Helper function to get optimized parameters - KEEP THIS (technical only)
export function getOptimizedParameters(framework, characterComplexity = 1) {
  const baseParams = { ...framework.parameters };
  
  // Adjust for character complexity (Runware optimized)
  if (characterComplexity > 2) {
    baseParams.steps = Math.min(baseParams.steps + 2, 15);
    baseParams.cfgScale = Math.min(baseParams.cfgScale + 0.3, 4.0);
  }
  
  return baseParams;
}

// Validation function - KEEP THIS (technical validation)
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