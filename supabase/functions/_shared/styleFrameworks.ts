// Simplified Art Style Framework - Levels 0-2 and 3-4 only
// Phase 2 Implementation: Streamlined structure with frameworkPrompt focus

export const COMPREHENSIVE_STYLE_FRAMEWORKS = {
  'beginner': {
    // Levels 0-2: Contemporary children's book illustration
    name: 'Contemporary Children\'s Book Illustration',
    frameworkPrompt: 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, painterly texture quality, warm natural lighting',
    negativePrompt: 'NO TEXT, NO CHARACTER NAMES, bad anatomy, head only, missing body, deformed limbs, extra fingers, missing fingers, blurry, low quality, distorted face, asymmetrical eyes, bad proportions, extra limbs, malformed hands, poorly drawn, artifacts, noise, oversaturated, underexposed, overexposed, duplicate, cropped, watermark, signature, text, logo, bad lighting, flat lighting, plastic skin, waxy skin, artificial look, uncanny valley'
  },
  
  'easy': {
    // Levels 0-2: Contemporary children's book illustration (same as beginner)
    name: 'Contemporary Children\'s Book Illustration',
    frameworkPrompt: 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, painterly texture quality, warm natural lighting',
    negativePrompt: 'NO TEXT, NO CHARACTER NAMES, bad anatomy, head only, missing body, deformed limbs, extra fingers, missing fingers, blurry, low quality, distorted face, asymmetrical eyes, bad proportions, extra limbs, malformed hands, poorly drawn, artifacts, noise, oversaturated, underexposed, overexposed, duplicate, cropped, watermark, signature, text, logo, bad lighting, flat lighting, plastic skin, waxy skin, artificial look, uncanny valley'
  },
  
  'medium': {
    // Levels 0-2: Contemporary children's book illustration (same as above)
    name: 'Contemporary Children\'s Book Illustration',
    frameworkPrompt: 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, painterly texture quality, warm natural lighting',
    negativePrompt: 'NO TEXT, NO CHARACTER NAMES, bad anatomy, head only, missing body, deformed limbs, extra fingers, missing fingers, blurry, low quality, distorted face, asymmetrical eyes, bad proportions, extra limbs, malformed hands, poorly drawn, artifacts, noise, oversaturated, underexposed, overexposed, duplicate, cropped, watermark, signature, text, logo, bad lighting, flat lighting, plastic skin, waxy skin, artificial look, uncanny valley'
  },
  
  'hard': {
    // Levels 3-4: 2.9D rendered illustration with warm natural lighting added
    name: '2.9D Rendered Illustration',
    frameworkPrompt: '2.9D rendered illustration with golden hour volumetric lighting, SSS, AO, GI, beautiful child characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, child-friendly, diverse representation, warm natural lighting',
    negativePrompt: 'NO TEXT, NO CHARACTER NAMES, bad anatomy, head only, missing body, deformed limbs, extra fingers, missing fingers, blurry, low quality, distorted face, asymmetrical eyes, bad proportions, extra limbs, malformed hands, poorly drawn, artifacts, noise, oversaturated, underexposed, overexposed, duplicate, cropped, watermark, signature, text, logo, bad lighting, flat lighting, plastic skin, waxy skin, artificial look, uncanny valley'
  },
  
  'expert': {
    // Levels 3-4: 2.9D rendered illustration (same as hard)
    name: '2.9D Rendered Illustration',
    frameworkPrompt: '2.9D rendered illustration with golden hour volumetric lighting, SSS, AO, GI, beautiful child characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, child-friendly, diverse representation, warm natural lighting',
    negativePrompt: 'NO TEXT, NO CHARACTER NAMES, bad anatomy, head only, missing body, deformed limbs, extra fingers, missing fingers, blurry, low quality, distorted face, asymmetrical eyes, bad proportions, extra limbs, malformed hands, poorly drawn, artifacts, noise, oversaturated, underexposed, overexposed, duplicate, cropped, watermark, signature, text, logo, bad lighting, flat lighting, plastic skin, waxy skin, artificial look, uncanny valley'
  }
};

// Helper function to get style framework by difficulty
export function getStyleFramework(difficulty: string): any {
  const normalizedDifficulty = difficulty?.toLowerCase() || 'medium';
  const framework = (COMPREHENSIVE_STYLE_FRAMEWORKS as any)[normalizedDifficulty] || COMPREHENSIVE_STYLE_FRAMEWORKS['medium'];
  
  console.log(`🎨 Retrieved ${framework.name} style framework for difficulty: ${normalizedDifficulty}`);
  return framework;
}

// Export default framework getter for backwards compatibility
export { getStyleFramework as default };