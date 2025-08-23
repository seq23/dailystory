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
    prompt: '3D digital art style, Pixar-inspired character design, soft rounded features, friendly appealing aesthetics, bright cheerful colors, clean polished rendering. High-quality 3D animated character illustration for early readers',
    complexity: 'standard',
    colorPaletteKey: 'bright_vibrant',
    detailLevel: 'high',
    rendering: 'pixar_3d',
    brandSuffix: '3D animated style, Pixar-quality rendering, child-friendly design, diverse representation',
    negativePrompt: 'toy, figurine, doll, plastic, simple background, flat lighting, multiple characters, crowd, busy background, dark colors, scary, photorealistic, adult themes, text, words',
    
    // Technical parameters (Ultra Premium Quality)
    parameters: {
      cfgScale: 7.0,
      steps: 15,
      scheduler: 'FlowMatchEulerDiscreteScheduler',
      strength: 0.75,
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
    prompt: '3D digital art style, Pixar-inspired character design, soft rounded features, friendly appealing aesthetics, bright cheerful colors, clean polished rendering. High-quality 3D animated character illustration for early readers',
    complexity: 'standard',
    colorPaletteKey: 'bright_vibrant',
    detailLevel: 'high',
    rendering: 'pixar_3d',
    brandSuffix: '3D animated style, Pixar-quality rendering, child-friendly design, diverse representation',
    
    negativePrompt: 'toy, figurine, doll, plastic, simple background, flat lighting, multiple people, crowd, cluttered background, dark atmosphere, scary elements, photorealistic, text, adult content',
    
    // Technical parameters (Ultra Premium Quality)
    parameters: {
      cfgScale: 7.0,
      steps: 15,
      scheduler: 'FlowMatchEulerDiscreteScheduler',
      strength: 0.75,
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
    prompt: 'Digital painting style with painterly brush strokes, artistic color harmony, cinematic lighting, professional artwork quality. Professional painterly digital art with artistic sophistication',
    complexity: 'minimal',
    colorPaletteKey: 'warm_pastels',
    detailLevel: 'medium',
    rendering: 'painterly',
    brandSuffix: 'painterly digital art, cinematic lighting, artistic quality, diverse representation',
    negativePrompt: 'multiple people, crowd, cluttered background, dark atmosphere, scary elements, photorealistic, text, adult content',
    
    // Technical parameters (Ultra Premium Quality)
    parameters: {
      cfgScale: 7.5,
      steps: 18,
      scheduler: 'FlowMatchEulerDiscreteScheduler',
      strength: 0.8,
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
    prompt: 'Professional digital illustration with sophisticated artistic maturity, nuanced color gradients, refined visual storytelling, advanced digital painting techniques. Gallery-worthy professional digital illustration',
    complexity: 'high',
    colorPaletteKey: 'nuanced_artistic',
    detailLevel: 'highly detailed',
    rendering: 'advanced_digital_painting',
    brandSuffix: 'professional digital illustration, sophisticated artistic maturity, gallery-worthy quality, diverse representation',
    
    // Technical parameters (Ultra Premium Quality)
    parameters: {
      cfgScale: 8.0,
      steps: 20,
      scheduler: 'FlowMatchEulerDiscreteScheduler',
      strength: 0.85,
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
    prompt: 'Fine art digital illustration with masterful artistic sophistication, complex color harmonies, cinematic visual narrative, museum-quality artistic techniques. Museum-quality fine art digital illustration',
    complexity: 'very_high',
    colorPaletteKey: 'complex_professional',
    detailLevel: 'intricate and complex',
    rendering: 'masterful_artistic_technique',
    brandSuffix: 'fine art digital illustration, masterful artistic sophistication, museum-quality artwork, diverse representation',
    
    // Technical parameters (Ultra Premium Quality)
    parameters: {
      cfgScale: 8.5,
      steps: 25,
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