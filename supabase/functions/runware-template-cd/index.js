// DEPLOY_MARKER: 2025-01-30T20:17:15Z - FORCED REDEPLOY TO FIX BOOT FAILURES
// ============= RUNWARE TEMPLATE CD: TIER 2.5C & 2.5D =============
// Implementation of complexity levels C and D for advanced template generation
// NO character consistency, NO shared functions beyond styleFrameworks
// Pure pageText + style framework (C) or hardcoded template (D)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getStyleFramework } from '../_shared/styleFrameworks.js';

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

// ============= PHASE 3 INTEGRATION: EMERGENCY TEMPLATE WITH LIGHT CULTURAL CONTEXT =============
// Generate Tier 2.5C template (Emergency templates + Light cultural intelligence)
async function generateTier25C(storyText, userInfo, avatarIdentity) {
  console.log('🎯 Tier 2.5C: Generating Emergency Framework Template with LIGHT Cultural Intelligence');
  
  const difficulty = userInfo?.difficulty || 'medium';
  const styleFramework = getStyleFramework(difficulty);
  
  console.log('🎨 Retrieved', styleFramework.name, 'style framework for difficulty:', difficulty);
  
  try {
    // PHASE 3: Use Universal Placeholder Resolver for emergency templates
    const { UniversalPlaceholderResolver } = await import("../_shared/UniversalPlaceholderResolver.js");
    const resolver = new UniversalPlaceholderResolver(userInfo, avatarIdentity, storyText);
    
    // Emergency template with basic placeholders
    const emergencyTemplate = `{frameworkPrompt}. {character} {age}, {ethnicity} in scene: {scene}. Context: {cultural_context}. Simple children's illustration style.`;
    
    const additionalData = {
      frameworkPrompt: styleFramework.frameworkPrompt
    };
    
    const positivePrompt = resolver.resolve(emergencyTemplate, additionalData);
    const negativePrompt = styleFramework.negativePrompt + ', photorealistic, adult themes, complex details';
    
    console.log('✅ Tier 2.5C: Emergency Template generated with Universal Placeholder Resolver');
    console.log('🌍 Cultural Enhancement Level:', resolver.getCulturalEnhancementLevel());
    
    return {
      positivePrompt,
      negativePrompt,
      templateType: 'Emergency Framework Template - Light Cultural Intelligence',
      tier: '2.5C',
      culturalIntelligence: true,
      enhancementLevel: resolver.getCulturalEnhancementLevel()
    };
    
  } catch (error) {
    console.warn('⚠️ Universal Placeholder Resolver failed, using basic emergency template:', error);
    
    // Fallback to basic template
    const childName = userInfo?.name || userInfo?.childName || 'child';
    const age = userInfo?.age || 8;
    const truncatedText = (storyText || '').substring(0, 500);
    const emergencyFramework = styleFramework.frameworkPrompt;
    const basicCharacterInfo = `${childName}, age ${age}`;
    
    const positivePrompt = `${emergencyFramework}. ${basicCharacterInfo} in scene: ${truncatedText}. Simple children's illustration style.`;
    const negativePrompt = styleFramework.negativePrompt + ', photorealistic, adult themes, complex details';
    
    return {
      positivePrompt,
      negativePrompt,
      templateType: 'Emergency Framework Template - Basic Fallback',
      tier: '2.5C',
      culturalIntelligence: false
    };
  }
}

// Generate Tier 2.5D template (hardcoded emergency)
function generateTier25D() {
  console.log('🎯 Tier 2.5D: Generating Ultimate Emergency Fallback');
  
  const positivePrompt = "A diverse group of four beautiful child characters with graceful features and charming expressions, each holding colorful hand-drawn signs that say 'IMAGES ARE DOWN' in playful, child-friendly lettering. 2.9D rendered illustration with golden hour volumetric lighting, SSS, AO, GI featuring: one blonde child with fair porcelain skin, bright blue eyes, and silky straight platinum blonde hair with natural shine; one red-haired child with fair skin dotted with gentle freckles, warm green eyes, and vibrant curly copper-red hair with individual strand definition; one medium-skinned child with warm caramel complexion, expressive brown eyes, and wavy chestnut brown hair with rich texture; one African American child with beautiful rich deep brown skin tone, bright expressive dark eyes, defined facial bone structure, and natural coily hair texture with dimensional volume. Semi-realistic digital art with photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions. The children display resilient smiles despite the technical difficulty, showing positivity and teamwork. Child-friendly aesthetic with diverse representation, warm expressions, and bright vibrant colors optimized for young audiences.";
  
  const negativePrompt = "blurry, low quality, dark, scary, violent, inappropriate, adult content, realistic photo, 3d render";
  
  console.log('✅ Tier 2.5D: Ultimate Emergency Template generated');
  
  return {
    positivePrompt,
    negativePrompt,
    templateType: 'Ultimate Emergency Fallback Template',
    tier: '2.5D'
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

// Main handler
serve(async (req) => {
  console.log('📨 Template CD Request:', req.method);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Health check
  if (req.method === 'GET' || req.method === 'HEAD') {
    return createResponse({ 
      status: 'healthy',
      functionName: 'runware-template-cd',
      tier: '2.5C-D',
      complexity: 'C-D'
    });
  }

  // Only handle POST requests for generation
  if (req.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405);
  }

  try {
    // Parse request body
    const body = await req.json();
    console.log('📋 Request body received:', {
      hasStoryText: !!body.storyText,
      hasUserInfo: !!body.userInfo,
      templateComplexity: body.templateComplexity
    });

    const {
      storyText = '',
      userInfo = {},
      avatarIdentity = null,
      templateComplexity = null
    } = body;

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

    // Return successful response
    return createResponse({
      success: true,
      imageURL: imageURL,
      positivePrompt: template.positivePrompt,
      negativePrompt: template.negativePrompt,
      templateType: template.templateType,
      tier: template.tier,
      complexity: complexity,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Template CD Error:', error);
    return createErrorResponse(error.message || 'Template generation failed', 500);
  }
});