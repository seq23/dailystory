// DEPLOY_MARKER: 2025-01-30T20:17:15Z - FORCED REDEPLOY TO FIX BOOT FAILURES
// ============= RUNWARE TEMPLATE CD: TIER 2.5C & 2.5D =============
// Implementation of complexity levels C and D for advanced template generation
// NO character consistency, NO shared functions beyond styleFrameworks
// Pure pageText + style framework (C) or hardcoded template (D)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// Inline cultural detection for emergency independence (no imports)
function inlineDetectCultural(userInfo, avatarIdentity) {
  const culturalProfile = {
    nativeLanguage: userInfo?.nativeLanguage || 'en',
    skinTone: userInfo?.avatar?.skinTone || avatarIdentity?.skinTone || 'light',
    includes: function(term) {
      return this.nativeLanguage === term || this.skinTone === term;
    }
  };
  
  if (culturalProfile.nativeLanguage !== 'en' || 
      ['dark', 'medium-dark', 'brown'].includes(culturalProfile.skinTone)) {
    return 'african-american';
  }
  return 'general';
}

function generateInlineNuclearNegative(culturalProfile, avatarType, difficulty) {
  const base = 'ugly, deformed, blurry, bad anatomy, wrong proportions, text, watermark, signature';
  
  if (culturalProfile === 'african-american') {
    return base + ', whitewashing, pale skin, incorrect ethnicity, cultural misrepresentation';
  }
  
  if (avatarType && avatarType.includes('boy')) {
    return base + ', feminine features, girl, female clothing, pink, dresses';
  }
  
  if (avatarType && avatarType.includes('girl')) {
    return base + ', masculine features, boy, male clothing, facial hair';
  }
  
  return base + ', inappropriate content, violence, scary elements';
}

// ============= INLINED STYLE FRAMEWORKS =============
// Inlined to make edge function self-contained
const COMPREHENSIVE_STYLE_FRAMEWORKS = {
  'beginner': {
    name: 'Contemporary Children\'s Book Illustration',
    frameworkPrompt: 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, painterly texture quality, warm natural lighting',
    negativePrompt: 'NO TEXT, NO CHARACTER NAMES, bad anatomy, head only, missing body, deformed limbs, extra fingers, missing fingers, blurry, low quality, distorted face, asymmetrical eyes, bad proportions, extra limbs, malformed hands, poorly drawn, artifacts, noise, oversaturated, underexposed, overexposed, duplicate, cropped, watermark, signature, text, logo, bad lighting, flat lighting, plastic skin, waxy skin, artificial look, uncanny valley'
  },
  
  'easy': {
    name: 'Contemporary Children\'s Book Illustration',
    frameworkPrompt: 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, painterly texture quality, warm natural lighting',
    negativePrompt: 'NO TEXT, NO CHARACTER NAMES, bad anatomy, head only, missing body, deformed limbs, extra fingers, missing fingers, blurry, low quality, distorted face, asymmetrical eyes, bad proportions, extra limbs, malformed hands, poorly drawn, artifacts, noise, oversaturated, underexposed, overexposed, duplicate, cropped, watermark, signature, text, logo, bad lighting, flat lighting, plastic skin, waxy skin, artificial look, uncanny valley'
  },
  
  'medium': {
    name: 'Contemporary Children\'s Book Illustration',
    frameworkPrompt: 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, painterly texture quality, warm natural lighting',
    negativePrompt: 'NO TEXT, NO CHARACTER NAMES, bad anatomy, head only, missing body, deformed limbs, extra fingers, missing fingers, blurry, low quality, distorted face, asymmetrical eyes, bad proportions, extra limbs, malformed hands, poorly drawn, artifacts, noise, oversaturated, underexposed, overexposed, duplicate, cropped, watermark, signature, text, logo, bad lighting, flat lighting, plastic skin, waxy skin, artificial look, uncanny valley'
  },
  
  'hard': {
    name: '2.9D Rendered Illustration',
    frameworkPrompt: '2.9D rendered illustration with golden hour volumetric lighting, SSS, AO, GI, beautiful child characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, child-friendly, diverse representation, warm natural lighting',
    negativePrompt: 'NO TEXT, NO CHARACTER NAMES, bad anatomy, head only, missing body, deformed limbs, extra fingers, missing fingers, blurry, low quality, distorted face, asymmetrical eyes, bad proportions, extra limbs, malformed hands, poorly drawn, artifacts, noise, oversaturated, underexposed, overexposed, duplicate, cropped, watermark, signature, text, logo, bad lighting, flat lighting, plastic skin, waxy skin, artificial look, uncanny valley'
  },
  
  'expert': {
    name: '2.9D Rendered Illustration',
    frameworkPrompt: '2.9D rendered illustration with golden hour volumetric lighting, SSS, AO, GI, beautiful child characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, child-friendly, diverse representation, warm natural lighting',
    negativePrompt: 'NO TEXT, NO CHARACTER NAMES, bad anatomy, head only, missing body, deformed limbs, extra fingers, missing fingers, blurry, low quality, distorted face, asymmetrical eyes, bad proportions, extra limbs, malformed hands, poorly drawn, artifacts, noise, oversaturated, underexposed, overexposed, duplicate, cropped, watermark, signature, text, logo, bad lighting, flat lighting, plastic skin, waxy skin, artificial look, uncanny valley'
  }
};

// Helper function to get style framework by difficulty
function getStyleFramework(difficulty) {
  const normalizedDifficulty = difficulty?.toLowerCase() || 'medium';
  const framework = COMPREHENSIVE_STYLE_FRAMEWORKS[normalizedDifficulty] || COMPREHENSIVE_STYLE_FRAMEWORKS['medium'];
  
  console.log(`🎨 Retrieved ${framework.name} style framework for difficulty: ${normalizedDifficulty}`);
  return framework;
}

// CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// Response helpers
function createResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

function createErrorResponse(error, status = 500) {
  console.error('Template CD Error:', error);
  return createResponse({
    success: false,
    error: error instanceof Error ? error.message : error
  }, status);
}

// Determine complexity level (C or D)
function getComplexityLevel(userInfo, templateComplexity) {
  // Use templateComplexity if provided by orchestrator
  if (templateComplexity === 'C' || templateComplexity === 'D') {
    console.log(`🎯 Using orchestrator templateComplexity: ${templateComplexity}`);
    return templateComplexity;
  }
  
  // Default logic: use C for most cases, D only for ultimate emergency
  if (!userInfo || !userInfo.difficulty) {
    return 'D'; // No user info = ultimate emergency
  }
  
  // Default to C (emergency framework)
  return 'C';
}

// Generate Tier 2.5C template (Emergency templates + Light cultural intelligence)
function generateTier25C(storyText, userInfo, avatarIdentity) {
  console.log('🎯 Tier 2.5C: Generating Emergency Framework Template with UNIFIED Style Framework');
  
  // PHASE 5: Enhanced pageText validation and fallback logic
  const pageTextLength = (storyText || '').trim().length;
  const hasValidPageText = pageTextLength >= 50;
  
  if (!hasValidPageText) {
    console.log('⚠️ Tier 2.5C: Insufficient pageText, falling back to Tier 2.5D');
    return {
      ...generateTier25D(),
      fallbackReason: `pageText too short (${pageTextLength} chars, minimum 50)`,
      autoFallback: true
    };
  }
  
  const difficulty = userInfo?.difficulty || 'medium';
  const styleFramework = getStyleFramework(difficulty);
  
  console.log('🎨 Retrieved', styleFramework.name, 'style framework for difficulty:', difficulty);
  
  // PHASE 5: Enhanced user info processing with cultural context
  const childName = userInfo?.name || userInfo?.childName || 'child';
  const age = userInfo?.age || 8;
  const skinTone = userInfo?.avatar?.skinTone || userInfo?.skinTone || 'diverse';
  const culturalContext = userInfo?.nativeLanguage !== 'en' ? 'culturally appropriate' : 'diverse and inclusive';
  
  // PHASE 5: Support up to 2000 characters of pageText
  const maxTextLength = 2000;
  const truncatedText = storyText.length > maxTextLength ? 
    storyText.substring(0, maxTextLength) + '...' : 
    storyText;
  
  // Enhanced character description with cultural context
  const characterDescription = `${childName}, age ${age}, ${skinTone} complexion`;
  
  // Use the unified style framework system with cultural enhancements
  const positivePrompt = `${styleFramework.frameworkPrompt}. ${characterDescription} in the following scene: ${truncatedText}. ${culturalContext} representation, engaging children's illustration.`;
  
  // PHASE 5: Generate comprehensive negative prompt
  let negativePrompt;
  try {
    const culturalProfile = {
      nativeLanguage: userInfo?.nativeLanguage || 'en',
      skinTone: skinTone
    };
    const avatarType = userInfo?.avatar?.type || 'child';
    
    const culturalProfileType = inlineDetectCultural(userInfo, avatarIdentity);
    negativePrompt = generateInlineNuclearNegative(culturalProfileType, 'child', difficulty);
    console.log(`🎨 Tier 2.5C: Generated comprehensive negative prompt: ${negativePrompt.length} chars`);
  } catch (error) {
    console.warn('⚠️ Tier 2.5C: Failed to generate nuclear negative prompt, using fallback:', error.message);
    negativePrompt = styleFramework.negativePrompt + ', photorealistic, adult themes, complex details';
  }
  
  return {
    positivePrompt,
    negativePrompt,
    templateType: 'Emergency Framework Template - Enhanced with Cultural Intelligence',
    tier: '2.5C',
    culturalIntelligence: true,
    styleFrameworkUsed: styleFramework.name,
    pageTextLength: pageTextLength,
    truncationStatus: storyText.length > maxTextLength ? 'truncated' : 'full',
    culturalContext: culturalContext,
    userInfoUsed: true
  };
}

// Generate Tier 2.5D template (hardcoded emergency with unified style)
function generateTier25D() {
  console.log('🎯 Tier 2.5D: Generating Ultimate Emergency Fallback with Unified Style Framework');
  
  // Use the unified style framework even for hardcoded emergency
  const styleFramework = getStyleFramework('medium');
  
  const positivePrompt = `${styleFramework.frameworkPrompt}. A diverse group of four beautiful child characters with graceful features and charming expressions, each holding colorful hand-drawn signs that say 'IMAGES ARE DOWN' in playful, child-friendly lettering. The children display resilient smiles despite the technical difficulty, showing positivity and teamwork. Child-friendly aesthetic with diverse representation, warm expressions, and bright vibrant colors optimized for young audiences.`;
  
  // PHASE 5: Use comprehensive negative prompt for Tier 2.5D
  let negativePrompt;
  try {
    const culturalProfileType = inlineDetectCultural({nativeLanguage: 'en'}, {skinTone: 'diverse'});
    negativePrompt = generateInlineNuclearNegative(culturalProfileType, 'child', 'medium');
    console.log(`🎨 Tier 2.5D: Generated comprehensive negative prompt: ${negativePrompt.length} chars`);
  } catch (error) {
    console.warn('⚠️ Tier 2.5D: Failed to generate nuclear negative prompt, using fallback:', error.message);
    negativePrompt = styleFramework.negativePrompt + ', blurry, low quality, dark, scary, violent, inappropriate, adult content';
  }
  
  console.log('✅ Tier 2.5D: Ultimate Emergency Template with unified style framework generated');
  
  return {
    positivePrompt,
    negativePrompt,
    templateType: 'Ultimate Emergency Fallback Template - Enhanced with Nuclear Safety',
    tier: '2.5D',
    styleFrameworkUsed: styleFramework.name,
    emergencyMode: true
  };
}

// Call Runware API
async function callRunwareAPI(positivePrompt, negativePrompt) {
  const apiKey = Deno.env.get('RUNWARE_API_KEY');
  if (!apiKey) {
    throw new Error('RUNWARE_API_KEY not configured');
  }

  console.log('🌐 Calling Runware API...');
  
  try {
    const response = await fetch('https://api.runware.ai/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([
        {
          taskType: "authentication",
          apiKey: apiKey.trim()
        },
        {
          taskType: "imageInference",
          taskUUID: crypto.randomUUID(),
          positivePrompt: positivePrompt,
          negativePrompt: negativePrompt,
          width: 1024,
          height: 1024,
          model: "runware:100@1",
          numberResults: 1,
          outputFormat: "WEBP",
          steps: 30,
          CFGScale: 10
        }
      ])
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    const imageData = result.data?.find(item => item.taskType === 'imageInference');

    if (!imageData?.imageURL) {
      throw new Error('No image URL in API response');
    }

    console.log('✅ Runware API call successful');
    return imageData.imageURL;

  } catch (error) {
    console.error('❌ Runware API call failed:', error);
    throw error;
  }
}

// Main handler - PHASE 4: Session Architecture Update
serve(async (req) => {
  console.log('📨 Template CD Request:', req.method);

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200, 
      headers: corsHeaders 
    });
  }

  // Health check
  if (req.method === 'GET' || req.method === 'HEAD') {
    return new Response(JSON.stringify({ 
      status: 'healthy',
      functionName: 'runware-template-cd',
      tier: '2.5C-D',
      complexity: 'C-D',
      timestamp: new Date().toISOString(),
      sessionArchitecture: 'parameter-based' // PHASE 4: Parameter-based session handling
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Only handle POST requests for generation
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({
      success: false,
      error: 'Method not allowed'
    }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // Parse request body
    const body = await req.json();
    console.log('📋 Request body received:', {
      hasStoryText: !!(body.storyText || body.pageText),
      hasUserInfo: !!body.userInfo,
      templateComplexity: body.templateComplexity,
      sessionId: body.sessionId,
      pageNumber: body.pageNumber,
      hasEnhancedStoryData: !!body.enhancedStoryData
    });

    // PHASE 4: Session data received via parameters only
    const {
      storyText = body.pageText || '', // Accept pageText as storyText
      pageText = body.pageText || '',
      userInfo = {},
      avatarIdentity = null,
      templateComplexity = null,
      sessionId,
      pageNumber,
      emergencyMode = false,
      enhancedStoryData = null // PHASE 4: Enhanced data from orchestrator
    } = body;

    console.log('📝 Template CD: Processing with parameter-based session data', {
      sessionId,
      pageNumber,
      emergencyMode,
      sessionDataReceived: !!(sessionId && pageNumber),
      hasEnhancedStoryData: !!enhancedStoryData
    });

    // Determine complexity level
    const complexity = getComplexityLevel(userInfo, templateComplexity);
    console.log(`🎯 Determined complexity level: ${complexity}`);

    // Generate template based on complexity
    let template;
    if (complexity === 'D') {
      template = generateTier25D();
    } else {
      template = await generateTier25C(storyText, userInfo, avatarIdentity);
    }

    // Call Runware API
    const imageURL = await callRunwareAPI(template.positivePrompt, template.negativePrompt);

    // Return successful response with enhanced prompt tracing
    return new Response(JSON.stringify({
      success: true,
      imageURL: imageURL,
      positivePrompt: template.positivePrompt,
      negativePrompt: template.negativePrompt,
      templateType: template.templateType,
      tier: template.tier,
      complexity: complexity,
      styleFrameworkUsed: template.styleFrameworkUsed,
      difficultyLevel: userInfo?.difficulty || 'medium',
      // PHASE 5: Enhanced metadata return
      pageTextLength: template.pageTextLength,
      truncationStatus: template.truncationStatus,
      culturalContext: template.culturalContext,
      userInfoUsed: template.userInfoUsed,
      fallbackReason: template.fallbackReason,
      autoFallback: template.autoFallback,
      emergencyMode: template.emergencyMode,
      promptLengths: {
        positive: template.positivePrompt.length,
        negative: template.negativePrompt.length
      },
      timestamp: new Date().toISOString(),
      sessionId,
      pageNumber,
      sessionArchitecture: 'parameter-based'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 Template CD Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Template generation failed',
      timestamp: new Date().toISOString(),
      sessionArchitecture: 'parameter-based' // PHASE 4: Even in errors, show parameter-based approach
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});