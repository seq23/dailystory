// ============= TIER 2.5A: RUNWARE TEMPLATE SIMPLE (A-B COMPLEXITY) =============
// Handles Level A (basic shapes/colors) and Level B (simple scenes)
// Lightweight, fast deployment - optimized for simple template generation

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

console.log("[runware-template-simple] Loaded: 2025-09-12T19:00:00Z - A-B Complexity Handler");

// ============= CORS HEADERS =============
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

function createResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

function createErrorResponse(error, status = 500) {
  console.error('Template Simple Error:', error);
  return createResponse({ 
    success: false, 
    error: error instanceof Error ? error.message : error 
  }, status);
}

// ============= COMPLEXITY LEVEL DETECTION =============
function getComplexityLevel(userInfo, templateComplexity) {
  // Handle A-B complexity levels only
  const validLevels = ['A', 'B'];
  
  if (templateComplexity && validLevels.includes(templateComplexity)) {
    console.log(`🎯 Template Simple: Using provided complexity: ${templateComplexity}`);
    return templateComplexity;
  }
  
  // Map user info to A-B complexity
  const gradeLevel = userInfo?.gradeLevel || 'K';
  const age = userInfo?.age || 5;
  
  if (gradeLevel === 'K' || gradeLevel === '1' || age <= 6) {
    return 'A'; // Basic shapes and colors
  }
  
  return 'B'; // Simple scenes
}

// ============= SIMPLE TEMPLATE GENERATION =============
function generateSimpleTemplate(complexity, storyText, userInfo, avatarIdentity) {
  const childName = userInfo?.childName || 'child';
  const favoriteColor = userInfo?.favoriteColor || 'blue';
  
  if (complexity === 'A') {
    // Level A: Basic shapes and colors
    return {
      positivePrompt: `A simple, colorful illustration showing ${childName} with basic shapes and ${favoriteColor} colors. Clean, minimal, child-friendly cartoon style.`,
      negativePrompt: 'complex details, realistic, adult themes, scary, dark',
      templateType: 'basic-shapes',
      difficulty: 'A',
      enhancementLevel: 'minimal'
    };
  }
  
  if (complexity === 'B') {
    // Level B: Simple scenes
    const simpleScene = storyText.substring(0, 100); // First 100 chars for context
    return {
      positivePrompt: `A simple cartoon illustration of ${childName} in a ${favoriteColor} themed scene. ${simpleScene}. Clean, bright, child-friendly art style.`,
      negativePrompt: 'complex backgrounds, realistic details, adult themes, scary elements',
      templateType: 'simple-scene',
      difficulty: 'B', 
      enhancementLevel: 'basic'
    };
  }
  
  // Fallback to basic
  return {
    positivePrompt: `A simple, happy illustration of ${childName} with ${favoriteColor} colors. Child-friendly cartoon style.`,
    negativePrompt: 'complex, realistic, adult, scary',
    templateType: 'fallback-basic',
    difficulty: 'A',
    enhancementLevel: 'minimal'
  };
}

// ============= RUNWARE API CALL =============
async function callRunwareAPI(prompt, negativePrompt) {
  const RUNWARE_API_KEY = Deno.env.get('RUNWARE_API_KEY');
  if (!RUNWARE_API_KEY) {
    throw new Error('RUNWARE_API_KEY not configured');
  }
  
  console.log('🎨 Template Simple: Calling Runware API');
  
  const payload = [
    {
      taskType: "authentication",
      apiKey: RUNWARE_API_KEY
    },
    {
      taskType: "imageInference",
      taskUUID: crypto.randomUUID(),
      positivePrompt: prompt,
      negativePrompt: negativePrompt,
      width: 1024,
      height: 1024,
      model: "runware:100@1",
      numberResults: 1,
      outputFormat: "WEBP",
      CFGScale: 1,
      scheduler: "FlowMatchEulerDiscreteScheduler"
    }
  ];
  
  const response = await fetch('https://api.runware.ai/v1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    throw new Error(`Runware API error: ${response.status}`);
  }
  
  const result = await response.json();
  const imageData = result.data?.find(item => item.taskType === 'imageInference');
  
  if (!imageData?.imageURL) {
    throw new Error('No image URL in Runware response');
  }
  
  return imageData;
}

// ============= MAIN HANDLER =============
serve(async (req) => {
  console.log(`🎯 Template Simple: ${req.method} ${req.url}`);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Handle health checks (GET/HEAD requests)
  if (req.method === 'GET' || req.method === 'HEAD') {
    console.log('🏥 Template Simple: Health check request');
    return createResponse({
      status: 'healthy',
      service: 'runware-template-simple',
      tier: '2.5A',
      complexity: 'A-B',
      timestamp: new Date().toISOString(),
      runwareApiKeyPresent: !!Deno.env.get('RUNWARE_API_KEY')
    });
  }
  
  try {
    const { 
      storyText, 
      userInfo, 
      avatarIdentity, 
      templateComplexity,
      sessionId,
      pageNumber 
    } = await req.json();
    
    console.log('📝 Template Simple: Processing request', {
      templateComplexity,
      sessionId,
      pageNumber,
      hasStoryText: !!storyText,
      hasUserInfo: !!userInfo
    });
    
    // Determine complexity level
    const complexity = getComplexityLevel(userInfo, templateComplexity);
    
    if (!['A', 'B'].includes(complexity)) {
      console.log(`⚠️ Template Simple: Complexity ${complexity} not handled by this function - use Advanced template`);
      return createErrorResponse(`Complexity ${complexity} not supported by Simple template. Use Advanced template.`, 400);
    }
    
    // Generate template
    const template = generateSimpleTemplate(complexity, storyText, userInfo, avatarIdentity);
    
    console.log('🎨 Template Simple: Generated template', {
      complexity,
      templateType: template.templateType,
      promptLength: template.positivePrompt.length
    });
    
    // Call Runware API
    const imageData = await callRunwareAPI(template.positivePrompt, template.negativePrompt);
    
    console.log('✅ Template Simple: Image generated successfully');
    
    return createResponse({
      success: true,
      imageURL: imageData.imageURL,
      prompt: template.positivePrompt,
      negativePrompt: template.negativePrompt,
      tier: '2.5A - Template Simple',
      complexity: complexity,
      templateType: template.templateType,
      enhancementLevel: template.enhancementLevel,
      sessionId: sessionId,
      pageNumber: pageNumber,
      processingTime: Date.now()
    });
    
  } catch (error) {
    console.error('❌ Template Simple: Error', error);
    return createErrorResponse(error.message, 500);
  }
});