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
  // NUCLEAR UNIFIED BASE - Word-for-Word as Specified
  const base = 'NO TEXT, no words, no letters, no writing, no captions, no watermarks, no signatures, no logos, bad anatomy, deformed, blurry, low quality, distorted face, extra limbs, malformed hands, poorly drawn, artifacts, noise, oversaturated, underexposed, overexposed, duplicate, cropped, watermark, signature, text, logo, bad lighting, flat lighting, plastic skin, waxy skin, artificial look, uncanny valley';
  
  // GENDER-SPECIFIC NEGATIVES - Word-for-Word as Specified  
  const boysNegative = 'NO feminine features, makeup, female anatomy, girl clothing, long feminine hairstyles, feminine accessories, narrow shoulders, feminine body structure, female proportions, feminine expressions, girl toys, female-coded activities exclusively';
  const girlsNegative = 'NO masculine features, facial hair, male anatomy, boy clothing, short masculine haircuts, broad shoulders, angular jaw, masculine body structure, male proportions, masculine expressions, boy toys, male-coded activities exclusively';
  const genderNeutralNegative = 'NO overly gendered features, extreme masculine traits, extreme feminine traits, gender-specific clothing, highly gendered toys, overly masculine expressions, overly feminine expressions, binary gender stereotypes, gendered color schemes exclusively';
  
  // COMPREHENSIVE AFRICAN AMERICAN PROTECTION (Complete 25+ Item List)
  const africanAmericanNegativeBlock = 'skin lightening, whitewashing, pale skin, light skin, caucasian features, european features, fair complexion, light complexion, white skin tone, bleached skin, lightened skin, washed out skin, faded skin tone, stereotypes, caricature, exaggerated features, cultural appropriation, offensive stereotypes, racial caricature, minstrel imagery, tokenism, straight hair texture, caucasian hair, european hair texture, fine hair texture, silky straight hair, pin straight hair, unnaturally straight hair, narrow nose, thin lips, small features, delicate bone structure, european bone structure, caucasian facial structure, non-African features';
  
  // UNIVERSAL CULTURAL SENSITIVITY 
  const culturalSensitivityNegativeBlock = 'cultural stereotypes, racial stereotypes, ethnic stereotypes, cultural caricature, offensive imagery, discriminatory content, prejudicial representation, cultural mockery, insensitive portrayal, appropriative elements, tokenistic representation, oversimplified culture, cultural reduction';
  
  let negativeComponents = [base];
  
  // Apply gender-specific negatives
  if (avatarType && avatarType.includes('boy')) {
    negativeComponents.push(boysNegative);
  } else if (avatarType && avatarType.includes('girl')) {
    negativeComponents.push(girlsNegative);
  } else {
    negativeComponents.push(genderNeutralNegative);
  }
  
  // Apply African American protection
  if (culturalProfile === 'african-american') {
    negativeComponents.push(africanAmericanNegativeBlock);
  }
  
  // Always apply cultural sensitivity
  negativeComponents.push(culturalSensitivityNegativeBlock);
  
  return negativeComponents.join(', ');
}

// ============= NUCLEAR HARDCODED STYLE FRAMEWORKS =============
// Nuclear independence - hardcoded with exact user specifications
const NUCLEAR_HARDCODED_STYLE_FRAMEWORKS = {
  'beginner': {
    name: 'Contemporary Children\'s Book Illustration',
    frameworkPrompt: 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, warm natural lighting'
  },
  'easy': {
    name: 'Contemporary Children\'s Book Illustration', 
    frameworkPrompt: 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, warm natural lighting'
  },
  'medium': {
    name: 'Contemporary Children\'s Book Illustration',
    frameworkPrompt: 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, warm natural lighting'
  },
  'hard': {
    name: '2.9D Rendered Illustration',
    frameworkPrompt: '2.9D rendered illustration with golden hour volumetric lighting, SSS, AO, GI, beautiful child characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, child-friendly, diverse representation'
  },
  'expert': {
    name: '2.9D Rendered Illustration',
    frameworkPrompt: '2.9D rendered illustration with golden hour volumetric lighting, SSS, AO, GI, beautiful child characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, child-friendly, diverse representation'
  }
};

// Nuclear helper function to get style framework by difficulty
function getNuclearStyleFramework(difficulty) {
  const normalizedDifficulty = difficulty?.toLowerCase() || 'medium';
  const framework = NUCLEAR_HARDCODED_STYLE_FRAMEWORKS[normalizedDifficulty] || NUCLEAR_HARDCODED_STYLE_FRAMEWORKS['medium'];
  
  console.log(`🎨 Nuclear Retrieved ${framework.name} style framework for difficulty: ${normalizedDifficulty}`);
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

// Generate Tier 2.5C template - NUCLEAR HARDCODED VERSION
function generateTier25C(storyText, userInfo, avatarIdentity, failedTierData = {}) {
  console.log('🚀 Nuclear Tier 2.5C: Pure hardcoded template - NO imports, NO dependencies');
  console.log('📊 Nuclear 2.5C: Received failed tier data', {
    hasCharacterConsistency: !!failedTierData.characterConsistency,
    hasVisualConsistency: !!failedTierData.visualConsistency,
    hasCulturalEnhancements: !!failedTierData.culturalEnhancements,
    hasEnhancedSceneData: !!failedTierData.enhancedSceneData
  });
  
  // Component 1: Scene (1500 character limit) - NO FALLBACKS, trigger 2.5D immediately
  if (!storyText) {
    console.log('🚨 Nuclear 2.5C: No storyText provided - triggering Tier 2.5D immediately');
    return generateTier25D(storyText, userInfo, avatarIdentity, failedTierData);
  }
  const sceneText = storyText.substring(0, 1500);
  
  // Component 2: Character Description with static template format
  const characterName = userInfo?.name || userInfo?.childName || 'child';
  const age = userInfo?.age || 8;
  const skinTone = userInfo?.avatar?.skinTone || userInfo?.skinTone || 'diverse'; 
  const avatarType = userInfo?.avatar?.type || 'child';
  
  // Base template: "A young $(avatar type) named $(name) age $(age) $(skintone) skin complexion"
  let characterDesc = `A young ${avatarType} named ${characterName} age ${age} ${skinTone} skin complexion`;
  
  // Add alternative string for dark skin ONLY
  if (skinTone === 'dark' || skinTone === 'medium-dark' || skinTone === 'brown') {
    characterDesc += ' with culturally appropriate African American features and natural hair texture';
  }
  
  // Component 3: Catch-All Failed Tier Information
  const catchAllElements = [
    failedTierData.characterConsistency || '',
    failedTierData.visualConsistency || '',
    failedTierData.culturalEnhancements || '',
    failedTierData.enhancedSceneData || ''
  ].filter(Boolean);
  const catchAllInfo = catchAllElements.length > 0 ? catchAllElements.join(', ') : 'enhanced story details';
  
  // Component 4: Brand Suffix (hardcoded framework - ALWAYS LAST)
  const difficulty = userInfo?.difficulty || 'medium';
  const hardcodedFramework = getNuclearStyleFramework(difficulty);
  
  // NUCLEAR CONCATENATION - NO placeholders, NO resolution, NO fallback, WITH LINE BREAKS
  const positivePrompt = `scene: ${sceneText}.\n\ncharacter description: ${characterDesc}.\n\n${catchAllInfo}.\n\nbrand suffix: ${hardcodedFramework.frameworkPrompt}`;
  
  // Generate nuclear negative prompt
  const culturalProfileType = inlineDetectCultural(userInfo, avatarIdentity);
  const negativePrompt = generateInlineNuclearNegative(culturalProfileType, 'child', difficulty);
  
  console.log('✅ Nuclear 2.5C: Template generated with zero dependencies');
  
  return {
    positivePrompt,
    negativePrompt,
    templateType: 'Nuclear Hardcoded Template - Zero Dependencies',
    tier: 'NUCLEAR_2.5C',
    styleFrameworkUsed: hardcodedFramework.name,
    failedTierDataUsed: catchAllElements.length > 0
  };
}

// Generate Tier 2.5D template (hardcoded emergency with unified style)
function generateTier25D() {
  console.log('🎯 Tier 2.5D: Generating Ultimate Emergency Fallback with Unified Style Framework');
  
  // Use the nuclear style framework even for hardcoded emergency
  const styleFramework = getNuclearStyleFramework('medium');
  
  const positivePrompt = `Diverse group of delighted children from different backgrounds having an absolute blast together: one child with beautiful Mediterranean olive-toned skin and flowing dark wavy hair with bright hazel eyes, one African American child with gorgeous natural 4C coily hair texture and rich deep brown complexion with expressive warm brown eyes, one child with fair peachy skin tone and sandy brown curls with bright blue eyes, one Indian child with warm golden-brown skin and sleek black hair with deep amber eyes, all engaged in spontaneous joyful activities - playing in the park, eating pizza and laughing, maybe building the most elaborate blanket fort ever, having an epic dance party in pajamas, creating colorful chalk masterpieces on sidewalks, racing paper airplanes, blowing enormous soap bubbles that shimmer like rainbows, or staging a hilarious puppet show with mismatched socks, pure childhood magic and unbridled fun, authentic expressions of wonder and delight, one child prominently holding up a handmade colorful sign that clearly reads "SORRY, IMAGES BEING WEIRD RIGHT NOW!" with cheerful decorative text, bright natural lighting, warm joyful atmosphere, authentic diverse representation, Contemporary children's book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, painterly texture quality`;
  
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

// Call Runware API with retry logic
async function callRunwareAPI(positivePrompt, negativePrompt, retries = 2) {
  const apiKey = Deno.env.get('RUNWARE_API_KEY');
  if (!apiKey) {
    throw new Error('RUNWARE_API_KEY not configured');
  }

  console.log('🌐 Calling Runware API...');
  
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
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
      console.error(`❌ Runware API attempt ${attempt}/${retries + 1} failed:`, error);
      
      if (attempt <= retries) {
        const delay = attempt * 1000; // Progressive delay
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
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
      enhancedStoryData = null, // PHASE 4: Enhanced data from orchestrator
      failedTierData = {}
    } = body;

    console.log('📝 Template CD: Processing with parameter-based session data', {
      sessionId,
      pageNumber,
      emergencyMode,
      sessionDataReceived: !!(sessionId && pageNumber),
      hasEnhancedStoryData: !!enhancedStoryData
    });
    
    console.log('📊 Template CD: Received failed tier data', {
      hasCharacterConsistency: !!failedTierData.characterConsistency,
      hasVisualConsistency: !!failedTierData.visualConsistency,
      hasCulturalEnhancements: !!failedTierData.culturalEnhancements
    });

    // Determine complexity level
    const complexity = getComplexityLevel(userInfo, templateComplexity);
    console.log(`🎯 Determined complexity level: ${complexity}`);

    // Generate template based on complexity
    let template;
    if (complexity === 'D') {
      template = generateTier25D();
    } else {
      template = generateTier25C(storyText, userInfo, avatarIdentity, failedTierData);
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