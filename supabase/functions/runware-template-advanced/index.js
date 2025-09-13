// ============= RUNWARE TEMPLATE ADVANCED: TIER 2.5C & 2.5D =============
// Simplified implementation of complexity levels C and D from runware-simple-fallback
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
  console.error('Advanced Template Error:', error);
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

// Generate Tier 2.5C template (pageText + style framework)
function generateTier25C(storyText, userInfo) {
  console.log('🎯 Tier 2.5C: Generating Emergency Framework Template');
  
  const difficulty = userInfo?.difficulty || 'medium';
  const styleFramework = getStyleFramework(difficulty);
  
  // Take first 2500 characters of pageText + style framework
  const truncatedText = (storyText || '').substring(0, 2500);
  const emergencyFramework = styleFramework.frameworkPrompt;
  
  const positivePrompt = truncatedText + ' ' + emergencyFramework;
  const negativePrompt = styleFramework.negativePrompt;
  
  console.log('✅ Tier 2.5C: Emergency Framework Template generated');
  
  return {
    positivePrompt,
    negativePrompt,
    templateType: 'Emergency Framework Template',
    tier: '2.5C'
  };
}

// Generate Tier 2.5D template (hardcoded emergency)
function generateTier25D() {
  console.log('🎯 Tier 2.5D: Generating Ultimate Emergency Fallback');
  
  const positivePrompt = "ULTIMATE_EMERGENCY_TEMPLATE_USED: A cheerful child character in a colorful outdoor scene with bright, friendly lighting. Contemporary children's book illustration with soft painterly style, warm expressions, detailed facial features, vibrant colors, shallow depth of field, character-focused composition, child-friendly aesthetic, high rendering quality, artistic lighting, diverse representation";
  
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
  console.log('📨 Advanced Template Request:', req.method);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Health check
  if (req.method === 'GET' || req.method === 'HEAD') {
    return createResponse({ status: 'healthy' });
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
      template = generateTier25C(storyText, userInfo);
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
    console.error('💥 Advanced Template Error:', error);
    return createErrorResponse(error.message || 'Template generation failed', 500);
  }
});