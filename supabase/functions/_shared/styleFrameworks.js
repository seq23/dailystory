// Simplified Art Style Framework - 2 Frameworks Only
// Phase 2 Implementation: Levels 0-2 and 3-4 only

export const COMPREHENSIVE_STYLE_FRAMEWORKS = {
  'beginner': {
    // Levels 0-2: Contemporary children's book illustration
    name: 'Contemporary Children\'s Book Illustration',
    artStyle: 'Contemporary children\'s book illustration with sharp facial definition',
    colorPalette: 'Vibrant color harmony with warm natural lighting',
    lighting: 'Artistic lighting with warm natural tones',
    texture: 'Painterly texture quality with detailed rendering',
    composition: 'Character-focused composition with shallow DOF',
    quality: 'High rendering quality with facial detail emphasis',
    
    // Prompt components
    prompt: 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, painterly texture quality, warm natural lighting',
    complexity: 'standard',
    colorPaletteKey: 'vibrant_harmony',
    detailLevel: 'high',
    rendering: 'contemporary_illustration',
    brandSuffix: 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, painterly texture quality, warm natural lighting',
    negativePrompt: 'NO TEXT, NO CHARACTER NAMES, bad anatomy, head only, missing body, deformed limbs, extra fingers, missing fingers, blurry, low quality, distorted face, asymmetrical eyes, bad proportions, extra limbs, malformed hands, poorly drawn, artifacts, noise, oversaturated, underexposed, overexposed, duplicate, cropped, watermark, signature, text, logo, bad lighting, flat lighting, plastic skin, waxy skin, artificial look, uncanny valley',
    
    // Technical parameters
    parameters: {
      cfgScale: 8,
      steps: 25,
      scheduler: 'FlowMatchEulerDiscreteScheduler',
      strength: 0.75,
      outputFormat: 'WEBP'
    }
  },
  
  'easy': {
    // Levels 0-2: Contemporary children's book illustration (same as beginner)
    name: 'Contemporary Children\'s Book Illustration',
    artStyle: 'Contemporary children\'s book illustration with sharp facial definition',
    colorPalette: 'Vibrant color harmony with warm natural lighting',
    lighting: 'Artistic lighting with warm natural tones',
    texture: 'Painterly texture quality with detailed rendering',
    composition: 'Character-focused composition with shallow DOF',
    quality: 'High rendering quality with facial detail emphasis',
    
    prompt: 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, painterly texture quality, warm natural lighting',
    complexity: 'standard',
    colorPaletteKey: 'vibrant_harmony',
    detailLevel: 'high',
    rendering: 'contemporary_illustration',
    brandSuffix: 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, painterly texture quality, warm natural lighting',
    negativePrompt: 'NO TEXT, NO CHARACTER NAMES, bad anatomy, head only, missing body, deformed limbs, extra fingers, missing fingers, blurry, low quality, distorted face, asymmetrical eyes, bad proportions, extra limbs, malformed hands, poorly drawn, artifacts, noise, oversaturated, underexposed, overexposed, duplicate, cropped, watermark, signature, text, logo, bad lighting, flat lighting, plastic skin, waxy skin, artificial look, uncanny valley',
    
    parameters: {
      cfgScale: 8,
      steps: 25,
      scheduler: 'FlowMatchEulerDiscreteScheduler',
      strength: 0.75,
      outputFormat: 'WEBP'
    }
  },
  
  'medium': {
    // Levels 0-2: Contemporary children's book illustration (same as above)
    name: 'Contemporary Children\'s Book Illustration',
    artStyle: 'Contemporary children\'s book illustration with sharp facial definition',
    colorPalette: 'Vibrant color harmony with warm natural lighting',
    lighting: 'Artistic lighting with warm natural tones',
    texture: 'Painterly texture quality with detailed rendering',
    composition: 'Character-focused composition with shallow DOF',
    quality: 'High rendering quality with facial detail emphasis',
    
    prompt: 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, painterly texture quality, warm natural lighting',
    complexity: 'standard',
    colorPaletteKey: 'vibrant_harmony',
    detailLevel: 'high',
    rendering: 'contemporary_illustration',
    brandSuffix: 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, painterly texture quality, warm natural lighting',
    negativePrompt: 'NO TEXT, NO CHARACTER NAMES, bad anatomy, head only, missing body, deformed limbs, extra fingers, missing fingers, blurry, low quality, distorted face, asymmetrical eyes, bad proportions, extra limbs, malformed hands, poorly drawn, artifacts, noise, oversaturated, underexposed, overexposed, duplicate, cropped, watermark, signature, text, logo, bad lighting, flat lighting, plastic skin, waxy skin, artificial look, uncanny valley',
    
    parameters: {
      cfgScale: 8,
      steps: 25,
      scheduler: 'FlowMatchEulerDiscreteScheduler',
      strength: 0.75,
      outputFormat: 'WEBP'
    }
  },
  
  'hard': {
    // Levels 3-4: 2.9D rendered illustration
    name: '2.9D Rendered Illustration',
    artStyle: '2.9D rendered illustration with golden hour volumetric lighting',
    colorPalette: 'Semi-realistic digital art with photorealism-artistic balance',
    lighting: 'Golden hour volumetric lighting with SSS, AO, GI',
    texture: 'Dimensional skin rendering with matte finish, realistic materials',
    composition: 'High-end rendering with raytraced shadows, shallow DOF',
    quality: 'Beautiful child characters with graceful features, consistent topology & proportions',
    
    prompt: '2.9D rendered illustration with golden hour volumetric lighting, SSS, AO, GI, beautiful child characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, child-friendly, diverse representation',
    complexity: 'high',
    colorPaletteKey: 'semi_realistic',
    detailLevel: 'highly detailed',
    rendering: '2_9d_rendered',
    brandSuffix: '2.9D rendered illustration with golden hour volumetric lighting, SSS, AO, GI, beautiful child characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, child-friendly, diverse representation',
    negativePrompt: 'NO TEXT, NO CHARACTER NAMES, bad anatomy, head only, missing body, deformed limbs, extra fingers, missing fingers, blurry, low quality, distorted face, asymmetrical eyes, bad proportions, extra limbs, malformed hands, poorly drawn, artifacts, noise, oversaturated, underexposed, overexposed, duplicate, cropped, watermark, signature, text, logo, bad lighting, flat lighting, plastic skin, waxy skin, artificial look, uncanny valley',
    
    parameters: {
      cfgScale: 8,
      steps: 25,
      scheduler: 'FlowMatchEulerDiscreteScheduler',
      strength: 0.85,
      outputFormat: 'WEBP'
    }
  },
  
  'expert': {
    // Levels 3-4: 2.9D rendered illustration (same as hard)
    name: '2.9D Rendered Illustration',
    artStyle: '2.9D rendered illustration with golden hour volumetric lighting',
    colorPalette: 'Semi-realistic digital art with photorealism-artistic balance',
    lighting: 'Golden hour volumetric lighting with SSS, AO, GI',
    texture: 'Dimensional skin rendering with matte finish, realistic materials',
    composition: 'High-end rendering with raytraced shadows, shallow DOF',
    quality: 'Beautiful child characters with graceful features, consistent topology & proportions',
    
    prompt: '2.9D rendered illustration with golden hour volumetric lighting, SSS, AO, GI, beautiful child characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, child-friendly, diverse representation',
    complexity: 'high',
    colorPaletteKey: 'semi_realistic',
    detailLevel: 'highly detailed',
    rendering: '2_9d_rendered',
    brandSuffix: '2.9D rendered illustration with golden hour volumetric lighting, SSS, AO, GI, beautiful child characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, child-friendly, diverse representation',
    negativePrompt: 'NO TEXT, NO CHARACTER NAMES, bad anatomy, head only, missing body, deformed limbs, extra fingers, missing fingers, blurry, low quality, distorted face, asymmetrical eyes, bad proportions, extra limbs, malformed hands, poorly drawn, artifacts, noise, oversaturated, underexposed, overexposed, duplicate, cropped, watermark, signature, text, logo, bad lighting, flat lighting, plastic skin, waxy skin, artificial look, uncanny valley',
    
    parameters: {
      cfgScale: 8,
      steps: 25,
      scheduler: 'FlowMatchEulerDiscreteScheduler',
      strength: 0.85,
      outputFormat: 'WEBP'
    }
  }
};

// Color palette definitions (simplified)
export const COLOR_PALETTE_DEFINITIONS = {
  'vibrant_harmony': 'vibrant color harmony, warm natural lighting, child-friendly colors',
  'semi_realistic': 'semi-realistic color palette, photorealism-artistic balance'
};

// Rendering technique definitions (simplified)
export const RENDERING_TECHNIQUE_DEFINITIONS = {
  'contemporary_illustration': 'contemporary children\'s book illustration style',
  '2_9d_rendered': '2.9D rendered illustration with advanced lighting'
};

// Helper function to get style framework by difficulty
export function getStyleFramework(difficulty) {
  const normalizedDifficulty = difficulty?.toLowerCase() || 'medium';
  const framework = COMPREHENSIVE_STYLE_FRAMEWORKS[normalizedDifficulty] || COMPREHENSIVE_STYLE_FRAMEWORKS['medium'];
  
  console.log(`🎨 Retrieved ${framework.name} style framework for difficulty: ${normalizedDifficulty}`);
  return framework;
}

// Helper function to get optimized parameters
export function getOptimizedParameters(framework, characterComplexity = 1) {
  return { ...framework.parameters };
}

// Validation function
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