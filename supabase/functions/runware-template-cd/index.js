// DEPLOY_MARKER: 2025-10-03T19:30:00Z - Made all top-level imports lazy-load to prevent boot failures

// Lazy load RunwareErrorHandler to prevent boot failures
let RunwareErrorHandler = null;
let runwareErrorHandlerLoadAttempted = false;

async function getRunwareErrorHandler() {
  if (!runwareErrorHandlerLoadAttempted) {
    runwareErrorHandlerLoadAttempted = true;
    try {
      const module = await import("../_shared/runwareErrorHandler.ts");
      RunwareErrorHandler = module.RunwareErrorHandler;
      console.log("✅ RunwareErrorHandler loaded successfully");
    } catch (err) {
      console.warn("⚠️ RunwareErrorHandler unavailable (non-critical):", err.message);
      RunwareErrorHandler = null;
    }
  }
  return RunwareErrorHandler;
}

// ProviderGate is now inlined in index.ts receptionist - no dynamic import needed

// ============= RUNWARE TEMPLATE CD: TIER 2.5C & 2.5D =============
// Implementation of complexity levels C and D for advanced template generation
// NO character consistency, NO shared functions beyond styleFrameworks
// Pure pageText + style framework (C) or hardcoded template (D)

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
  
// Use structured logging instead of console.log
// console.log replaced with structured logging for production readiness
  return framework;
}

// ============= BUSINESS LOGIC ONLY - NO HTTP HANDLING =============

// Determine complexity level (C or D)
function getComplexityLevel(userInfo, templateComplexity) {
  // Use templateComplexity if provided by orchestrator
  if (templateComplexity === 'C' || templateComplexity === 'D') {
    console.log(`🎯 Using orchestrator templateComplexity: ${templateComplexity}`);
    return templateComplexity;
  }
  
  // Auto-determine: C for nuclear templates, D for ultimate emergency
  if (!userInfo || (!userInfo.difficulty && !userInfo.difficultyLevel)) {
    return 'D'; // No user info = ultimate emergency
  }
  
  // Default to C (nuclear framework)
  return 'C';
}

// Nuclear hair color mapping - lean and simple
function getSimpleHairColor(skinTone) {
  switch (skinTone) {
    case 'pale': return 'red hair';
    case 'light': return 'blonde hair';
    case 'medium': return 'brown hair';
    case 'olive': return 'dark black hair';
    case 'dark': return 'thick textured 4C hair';
    default: return 'brown hair'; // fallback
  }
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
  
  // ========== PRIMARY PATH: Direct Mode Clean Separation ==========
  if (failedTierData?.enhancedSceneData && failedTierData?.characterConsistency) {
    console.log('✅ [DIRECT_MODE] Using CCS data in separate sections (CLEAN SEPARATION)');
    
    // Validate data integrity
    const sceneLength = failedTierData.enhancedSceneData.length;
    const charLength = failedTierData.characterConsistency.length;
    
    if (sceneLength < 50 || charLength < 30) {
      console.warn(`⚠️ [DIRECT_MODE] Data integrity check failed (scene=${sceneLength}, char=${charLength}) - activating safety net`);
      // Fall through to safety net below
    } else {
      // Use CCS data AS-IS in clean 2-section format
      const difficulty = userInfo?.difficulty || 'medium';
      const hardcodedFramework = getNuclearStyleFramework(difficulty);
      
      const positivePrompt = `scene: ${failedTierData.enhancedSceneData}.\n\ncharacter: ${failedTierData.characterConsistency}.\n\nbrand suffix: ${hardcodedFramework.frameworkPrompt}`;
      
      const culturalProfileType = inlineDetectCultural(userInfo, avatarIdentity);
      const avatarType = userInfo?.avatar?.type || 'child';
      const negativePrompt = generateInlineNuclearNegative(culturalProfileType, avatarType, difficulty);
      
      console.log('✅ [DIRECT_MODE] Clean separation complete - scene and character in dedicated sections');
      
      return {
        positivePrompt,
        negativePrompt,
        templateType: 'Direct Mode Clean Separation (CCS Data)',
        tier: 'NUCLEAR_2.5C_DIRECT',
        styleFrameworkUsed: hardcodedFramework.name,
        directModeUsed: true,
        sceneSource: 'ai_visual_scene_creator',
        characterSource: 'character_consistency_service'
      };
    }
  }
  
  // ========== SAFETY NET PATH: Original Tier 2.5C Logic ==========
  console.log('📋 [SAFETY_NET] No Direct Mode data or integrity failed - using original Tier 2.5C logic');
  
  // Component 1: Scene (1000 character limit) - NO FALLBACKS, trigger 2.5D immediately
  if (!storyText) {
    console.log('🚨 Nuclear 2.5C: No storyText provided - triggering Tier 2.5D immediately');
    return generateTier25D(storyText, userInfo, avatarIdentity, failedTierData);
  }
  const sceneText = (failedTierData.enhancedSceneData || storyText).substring(0, 1000);
  
  // Component 2: Character Description with static template format
  const characterName = userInfo?.name || userInfo?.childName || 'child';
  const age = userInfo?.age || 8;
  const skinTone = userInfo?.avatar?.skinTone || userInfo?.skinTone || 'medium'; 
  const avatarType = userInfo?.avatar?.type || 'child';
  const nativeLanguage = userInfo?.nativeLanguage || userInfo?.language || 'en';
  
  // Map avatar type for character description
  let mappedAvatarType = avatarType;
  let genderNeutralDescription = '';
  
  if (avatarType === 'prefer-not-to-answer') {
    mappedAvatarType = 'child';
    genderNeutralDescription = ' gender neutral child with no visible male nor female characteristics';
  }
  
  // ALWAYS include physical descriptions - use structuredAvatarData or generate from skinTone
  const hasStructuredData = failedTierData?.structuredAvatarData?.skinTone && failedTierData?.structuredAvatarData?.hairColor;
  const effectiveSkinTone = hasStructuredData ? failedTierData.structuredAvatarData.skinTone : skinTone;
  const effectiveHairColor = hasStructuredData ? failedTierData.structuredAvatarData.hairColor : getSimpleHairColor(skinTone);
  
  let characterDesc;
  if (genderNeutralDescription) {
    characterDesc = `A ${genderNeutralDescription} named ${characterName} age ${age} ${effectiveSkinTone} skin complexion with ${effectiveHairColor}`;
  } else {
    characterDesc = `A young ${mappedAvatarType} named ${characterName} age ${age} ${effectiveSkinTone} skin complexion with ${effectiveHairColor}`;
  }
  
  // Add detailed cultural features for dark skin with supported languages (hair already handled above)
  const activeSkinTone = failedTierData?.structuredAvatarData?.skinTone || skinTone;
  if ((activeSkinTone.includes('dark') || activeSkinTone.includes('brown')) && ['en', 'fr', 'es', 'pt'].includes(nativeLanguage)) {
    characterDesc += ' with authentic African American features and naturally occurring melanin-rich skin tones ranging from warm beige to warm caramel to deep ebony with appropriate warm undertones, realistic hazel-green, brown and dark brown eyes with natural depth and authentic iris patterns, genuine African American facial bone structure with appropriate nose width and lip fullness, authentic textured hair ranging from 3B to 4C curl patterns including DETAILED AND PHOTOREALISTIC natural afros, box braids, cornrows, twist-outs, or protective styles with proper hair density and realistic coil definition, accurate representation of Black features without European beauty standard alterations, natural skin luminosity with warm golden or red undertones, detailed individual hair strand texture showing authentic curl patterns and natural shine';
  }
  
  // Component 3: Brand Suffix (hardcoded framework - ALWAYS LAST)
  const difficulty = userInfo?.difficulty || 'medium';
  const hardcodedFramework = getNuclearStyleFramework(difficulty);
  
  // NUCLEAR CONCATENATION - NO placeholders, NO resolution, NO fallback, WITH LINE BREAKS
  const positivePrompt = `scene: ${sceneText}.\n\ncharacter description: ${characterDesc}.\n\nbrand suffix: ${hardcodedFramework.frameworkPrompt}`;
  
  // Generate nuclear negative prompt with correct avatar type
  const culturalProfileType = inlineDetectCultural(userInfo, avatarIdentity);
  const negativePrompt = generateInlineNuclearNegative(culturalProfileType, avatarType, difficulty);
  
  console.log('✅ Nuclear 2.5C: Template generated with zero dependencies');
  
  return {
    positivePrompt,
    negativePrompt,
    templateType: 'Nuclear Hardcoded Template - Zero Dependencies',
    tier: 'NUCLEAR_2.5C',
    styleFrameworkUsed: hardcodedFramework.name,
    failedTierDataUsed: !!(failedTierData.enhancedSceneData || failedTierData.characterConsistency || failedTierData.visualConsistency || failedTierData.culturalEnhancements || failedTierData.structuredAvatarData)
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
            steps: 25,
            CFGScale: 8
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
      
      // Track Runware cost for analytics with 2-tier CDN fallback
      try {
        // FLUX.1 [schnell] pricing: $0.0013 per image
        const cost = 0.0013;
        
        let supabaseClient = null;
        
    // Phase 1: Use vendor-first Supabase client (standardized across all functions)
    try {
      console.log('🔍 [VENDOR_FIRST] Using createVendorFirstSupabaseClient for cost tracking');
      const { createVendorFirstSupabaseClient } = await import('../_shared/resilientLoader.ts');
      supabaseClient = await createVendorFirstSupabaseClient();
      console.log('✅ [VENDOR_FIRST] Supabase client initialized successfully (0ms network delay)');
    } catch (cdnError) {
      console.warn('⚠️ [2-TIER-CDN] Tier 1 FAILED: CDN import failed, activating Tier 2 fallback:', cdnError.message);
      // Tier 2: Fall back to local vendor bundle
      const { createClient } = await import('../_vendor/supabase-js@2.57.4.mjs');
      supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      console.log('✅ [2-TIER-CDN] Tier 2 SUCCESS: Local vendor fallback successful');
    }

        await supabaseClient.from('cost_tracking').insert({
          session_id: 'runware-session', // Will be updated when we get sessionId
          user_id: null,
          input_tokens: 0,
          output_tokens: 0,
          cost: cost,
          model_used: 'runware:100@1',
          operation_type: 'image_generation',
          provider: 'runware',
          api_endpoint: 'v1/imageInference',
          pricing_model: 'images',
          quantity_used: 1,
          unit_cost: cost
        });

        console.log(`💰 Runware Template CD cost tracked: $${cost} for image generation`);
      } catch (error) {
        console.warn('Failed to track Runware Template CD cost:', error);
      }
      
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

// Main handler - Pure business logic
async function handleRequest(req) {
  // OPTIONS fast path (preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
        'Access-Control-Max-Age': '600',
        'Content-Length': '0'
      }
    });
  }

  // GET/HEAD safety — never fail health
  if (req.method === 'GET' || req.method === 'HEAD') {
    const isHeadHealth = req.method === 'HEAD' && new URL(req.url).pathname === '/health';
    if (isHeadHealth) {
      return new Response(null, { status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store', 'x-health': 'true', 'Content-Length': '0' } });
    }
    return new Response(JSON.stringify({
      status: 'healthy',
      service: 'runware-template-cd',
      timestamp: new Date().toISOString()
    }), { status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' } });
  }

  try {
    // FLEXIBLE PAYLOAD HANDLING: Accept either pageText OR enhancedStoryData/storyText
    const payload = await req.json();
    console.log('🔍 Template CD: Request payload keys:', Object.keys(payload));
    
    let enhancedStoryData, storyText, pageNumber, avatarIdentity, templateComplexity, failedTierData, sessionId;
    
    // PRIORITY 1: Handle bundle-structured payloads (from tier cascades)
    if (payload.bundle && payload.config) {
      console.log('📦 Template CD: Detected nested payload structure (bundle format)');
      const bundle = payload.bundle;
      storyText = bundle.pageText || bundle.storyText || payload.pageText || payload.storyText;
      enhancedStoryData = { userInfo: bundle.userInfo || payload.userInfo };
      pageNumber = bundle.pageNumber || payload.pageNumber || 1;
      avatarIdentity = bundle.userInfo?.avatar || payload.userInfo?.avatar;
      templateComplexity = payload.config?.templateComplexity || payload.templateComplexity || 'C';
      sessionId = bundle.sessionId || payload.sessionId;
      failedTierData = bundle.failedTierData || payload.failedTierData;
    } else if (payload.pageText || payload.storyText) {
      // PRIORITY 2: Direct pageText or storyText format (pageText === storyText)
      console.log('📄 Template CD: Using direct pageText/storyText format');
      storyText = payload.pageText || payload.storyText;
      enhancedStoryData = { userInfo: payload.userInfo };
      pageNumber = payload.pageNumber || 1;
      avatarIdentity = payload.userInfo?.avatar;
      templateComplexity = payload.templateComplexity || 'C';
      sessionId = payload.sessionId;
      failedTierData = payload.failedTierData;
    } else if (payload.enhancedStoryData?.storyText) {
      // PRIORITY 3: Nested enhancedStoryData format
      console.log('📦 Template CD: Using nested enhancedStoryData.storyText format');
      enhancedStoryData = payload.enhancedStoryData;
      storyText = payload.enhancedStoryData.storyText || payload.enhancedStoryData.pageText;
      pageNumber = payload.pageNumber || payload.enhancedStoryData.pageNumber || 1;
      avatarIdentity = payload.enhancedStoryData.userInfo?.avatar || payload.avatarIdentity;
      templateComplexity = payload.templateComplexity || 'C';
      sessionId = payload.sessionId || payload.enhancedStoryData.sessionId;
      failedTierData = payload.failedTierData;
    } else {
      // PRIORITY 4: Enhanced legacy format
      console.log('📚 Template CD: Using enhanced legacy format');
      enhancedStoryData = payload.enhancedStoryData;
      storyText = payload.storyText || payload.pageText;
      pageNumber = payload.pageNumber || 1;
      avatarIdentity = payload.avatarIdentity;
      templateComplexity = payload.templateComplexity || 'C';
      sessionId = payload.sessionId;
      failedTierData = payload.failedTierData;
    }
  
    if (!storyText) {
      const receivedKeys = Object.keys(payload).join(', ');
      console.error(`❌ Template CD validation failed - Received payload keys: [${receivedKeys}]`);
      console.error(`❌ Missing required field. Expected: pageText OR storyText. Payload structure:`, JSON.stringify(payload, null, 2));
      throw new Error(`Missing required field: pageText OR storyText. Received keys: ${receivedKeys}`);
    }

  console.log(`🎯 Template CD processing complexity: ${templateComplexity || 'auto'}`);

  // Extract user info from enhancedStoryData
  const userInfo = enhancedStoryData.userInfo || {};
  
  // Determine complexity level (C or D)
  const complexityLevel = getComplexityLevel(userInfo, templateComplexity);
  console.log(`✅ Using complexity level: ${complexityLevel}`);

  let templateResult;
  
  if (complexityLevel === 'C') {
    // Tier 2.5C: Nuclear hardcoded template
    console.log('🚀 Processing Tier 2.5C: Nuclear hardcoded template');
    templateResult = generateTier25C(storyText, userInfo, avatarIdentity, failedTierData || {});
    
  } else {
    // Tier 2.5D: Ultimate emergency fallback
    console.log('🚀 Processing Tier 2.5D: Ultimate emergency fallback');
    templateResult = generateTier25D();
  }

  // ProviderGate is now handled at receptionist level (index.ts) - no gating in .js implementation

  // Generate the actual image using Runware API
  console.log('🎨 Template CD: Generating image with Runware API');
  const imageGenResult = await callRunwareAPI(
    templateResult.positivePrompt,
    templateResult.negativePrompt
  );
  
  // Defensive fallback: callRunwareAPI returns STRING, but handle both string/object
  const result = {
    success: true,
    imageURL: typeof imageGenResult === 'string' ? imageGenResult : imageGenResult?.imageURL,
    templateData: templateResult,
    complexity: complexityLevel,
    sessionArchitecture: 'parameter-based',
    processedAt: new Date().toISOString(),
    positivePrompt: templateResult.positivePrompt,
    negativePrompt: templateResult.negativePrompt,
    imageGeneration: {
      cost: typeof imageGenResult === 'object' ? (imageGenResult?.cost || 0.0013) : 0.0013,
      seed: typeof imageGenResult === 'object' ? imageGenResult?.seed : null
    }
  };
  
  console.log('✅ Template CD: Result prepared', { 
    hasImageURL: !!result.imageURL,
    imageGenResultType: typeof imageGenResult,
    imageURLSource: typeof imageGenResult === 'string' ? 'direct_string' : 'object_property'
  });

  // Log successful template generation with resilient Supabase client
  try {
    let supabase = null;
    
    // Use resilient loader (standardized across all functions)
    try {
      console.log('🔍 [VENDOR_FIRST] Using createVendorFirstSupabaseClient for logging');
      const { createVendorFirstSupabaseClient } = await import('../_shared/resilientLoader.ts');
      supabase = await createVendorFirstSupabaseClient();
      console.log('✅ [VENDOR_FIRST] Supabase client initialized successfully for logging');
    } catch (loaderError) {
      console.warn('⚠️ [RESILIENT_LOADER] Failed, using fallback:', loaderError.message);
      // Fallback to local vendor bundle
      const { createClient } = await import('../_vendor/supabase-js@2.57.4.mjs');
      supabase = createClient(
        Deno.env.get('SUPABASE_URL'),
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')
      );
      console.log('✅ [RESILIENT_LOADER] Local vendor fallback successful for logging');
    }
    
    const { logTierAttempt } = await import("../_shared/tierLogging.js");
    await logTierAttempt(
      supabase,
      sessionId,
      'template-cd-req',
      templateResult.tier || 'template-cd',
      'success',
      {
        positivePrompt: templateResult.positivePrompt,
        negativePrompt: templateResult.negativePrompt,
        visual_details: failedTierData?.visualDetails,
        edgeFunction: 'runware-template-cd',
        pageNumber: pageNumber || 1,
        imageUrl: result.imageURL
      }
    );
  } catch (loggingError) {
    console.warn('Failed to log template CD success:', loggingError.message);
  }

  return result;
  
  } catch (error) {
    const ErrorHandler = await getRunwareErrorHandler();
    const runwareError = ErrorHandler ? ErrorHandler.categorizeRunwareError(error) : {
      type: 'unknown_runware_error',
      message: error.message || String(error),
      escalation: 'TIER_4',
      retry: false
    };
    console.error('Template CD generation failed:', runwareError);
    
    return {
      success: false,
      error: runwareError.message,
      errorType: runwareError.type,
      escalation: runwareError.escalation,
      retry: runwareError.retry,
      code: runwareError.code
    };
  }
}

// Export for TypeScript receptionist
export default handleRequest;