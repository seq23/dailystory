// ============= TIER 2.5B: RUNWARE TEMPLATE ADVANCED (C-D COMPLEXITY) =============
// Handles Level C (detailed scenes) and Level D (complex narratives)
// More sophisticated processing with cultural awareness and character consistency

import { serve } from "https://deno.land/std@0.168.0/http/server.js";

console.log("[runware-template-advanced] Loaded: 2025-09-13T02:15:00Z - C-D Complexity Handler");

// Lazy loading for heavy dependencies
let CULTURAL_ARRAYS = null;
let VOCAB = null;

async function initDependencies() {
  if (!CULTURAL_ARRAYS) {
    try {
      const culturalMod = await import('../_shared/tier25Vocabulary.js');
      CULTURAL_ARRAYS = culturalMod.CULTURAL_ARRAYS;
      console.log('Cultural arrays loaded for Advanced template');
    } catch (error) {
      console.warn('Failed to load cultural arrays:', error);
      CULTURAL_ARRAYS = { fallback: true };
    }
  }
  
  if (!VOCAB) {
    try {
      const vocabMod = await import("../_shared/tier25Vocabulary.js");
      VOCAB = vocabMod.default;
      console.log('Vocabulary loaded for Advanced template');
    } catch (error) {
      console.warn('Failed to load vocabulary:', error);
      VOCAB = { fallback: true };
    }
  }
}

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
  console.error('Template Advanced Error:', error);
  return createResponse({ 
    success: false, 
    error: error instanceof Error ? error.message : error 
  }, status);
}

// ============= COMPLEXITY LEVEL DETECTION =============
function getComplexityLevel(userInfo, templateComplexity) {
  // Handle C-D complexity levels only
  const validLevels = ['C', 'D'];
  
  if (templateComplexity && validLevels.includes(templateComplexity)) {
    console.log(`🎯 Template Advanced: Using provided complexity: ${templateComplexity}`);
    return templateComplexity;
  }
  
  // Map user info to C-D complexity
  const gradeLevel = userInfo?.gradeLevel || 'K';
  const age = userInfo?.age || 5;
  
  if (['2', '3', '4'].includes(gradeLevel) || (age >= 7 && age <= 9)) {
    return 'C'; // Detailed scenes
  }
  
  if (['5', '6', '7', '8'].includes(gradeLevel) || age >= 10) {
    return 'D'; // Complex narratives
  }
  
  // Default to C for advanced template
  return 'C';
}

// ============= CULTURAL PROFILE DETECTION =============
function detectCulturalProfile(avatarIdentity) {
  if (!avatarIdentity) return 'default';
  
  const identity = avatarIdentity.avatarIdentity?.toLowerCase() || '';
  const skinTone = avatarIdentity.skinToneVariation?.toLowerCase() || '';
  
  // Detect cultural context from avatar identity
  if (identity.includes('african') || identity.includes('black') || 
      skinTone.includes('dark') || skinTone.includes('ebony')) {
    return 'african_american';
  }
  
  if (identity.includes('asian') || identity.includes('chinese') || identity.includes('japanese')) {
    return 'asian';
  }
  
  if (identity.includes('hispanic') || identity.includes('latino') || identity.includes('latina')) {
    return 'hispanic';
  }
  
  return 'default';
}

// ============= ADVANCED TEMPLATE GENERATION =============
function generateAdvancedTemplate(complexity, storyText, userInfo, avatarIdentity) {
  const childName = userInfo?.childName || 'child';
  const favoriteColor = userInfo?.favoriteColor || 'blue';
  const culturalProfile = detectCulturalProfile(avatarIdentity);
  
  // Extract key story elements
  const storyWords = storyText.toLowerCase();
  const hasAction = /\b(playing|running|building|reading|exploring)\b/.test(storyWords);
  const hasSetting = /\b(home|school|park|library|playground)\b/.test(storyWords);
  const hasEmotion = /\b(happy|excited|curious|proud|joyful)\b/.test(storyWords);
  
  let basePrompt = '';
  let enhancementLevel = '';
  
  if (complexity === 'C') {
    // Level C: Detailed scenes with cultural awareness
    enhancementLevel = 'detailed';
    basePrompt = `A detailed, vibrant illustration of ${childName} in a richly detailed scene. `;
    
    if (culturalProfile !== 'default') {
      basePrompt += `Culturally authentic representation with appropriate ${culturalProfile} visual elements. `;
    }
    
    if (hasAction) {
      basePrompt += `Dynamic action with detailed movement and expressions. `;
    }
    
    if (hasSetting) {
      basePrompt += `Rich environmental details with ${favoriteColor} color accents throughout the scene. `;
    }
    
    basePrompt += `High-quality children's book illustration style with warm, inviting atmosphere.`;
    
  } else if (complexity === 'D') {
    // Level D: Complex narratives with sophisticated details
    enhancementLevel = 'sophisticated';
    basePrompt = `A sophisticated, narrative-rich illustration depicting ${childName} in a complex scene with multiple story elements. `;
    
    if (culturalProfile !== 'default') {
      basePrompt += `Authentic ${culturalProfile} cultural representation with meaningful visual storytelling elements. `;
    }
    
    // Add story-specific enhancements
    if (hasAction && hasSetting && hasEmotion) {
      basePrompt += `Multi-layered composition showing emotional depth, environmental storytelling, and character development. `;
    }
    
    basePrompt += `Premium children's literature illustration quality with ${favoriteColor} as a thematic color element. `;
    basePrompt += `Professional artistic rendering with attention to character consistency and narrative coherence.`;
  }
  
  // Generate comprehensive negative prompt
  const negativePrompt = [
    'low quality', 'blurry', 'distorted', 'amateur',
    'inappropriate content', 'adult themes', 'violence',
    'scary elements', 'dark mood', 'unrealistic proportions'
  ];
  
  if (culturalProfile !== 'default') {
    negativePrompt.push('cultural stereotypes', 'inauthentic representation');
  }
  
  return {
    positivePrompt: basePrompt,
    negativePrompt: negativePrompt.join(', '),
    templateType: complexity === 'C' ? 'detailed-scene' : 'complex-narrative',
    difficulty: complexity,
    enhancementLevel: enhancementLevel,
    culturalProfile: culturalProfile
  };
}

// ============= RUNWARE API CALL =============
async function callRunwareAPI(prompt, negativePrompt) {
  const RUNWARE_API_KEY = Deno.env.get('RUNWARE_API_KEY');
  if (!RUNWARE_API_KEY) {
    throw new Error('RUNWARE_API_KEY not configured');
  }
  
  console.log('🎨 Template Advanced: Calling Runware API');
  
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
      CFGScale: 7, // Higher CFG for more detailed images
      scheduler: "FlowMatchEulerDiscreteScheduler",
      steps: 8 // More steps for advanced quality
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
  console.log(`🎯 Template Advanced: ${req.method} ${req.url}`);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Handle health checks (GET/HEAD requests)
  if (req.method === 'GET' || req.method === 'HEAD') {
    console.log('🏥 Template Advanced: Health check request');
    return createResponse({
      status: 'healthy',
      service: 'runware-template-advanced',
      tier: '2.5B',
      complexity: 'C-D',
      timestamp: new Date().toISOString(),
      runwareApiKeyPresent: !!Deno.env.get('RUNWARE_API_KEY')
    });
  }
  
  try {
    // Initialize dependencies
    await initDependencies();
    
    const { 
      storyText, 
      userInfo, 
      avatarIdentity, 
      templateComplexity,
      sessionId,
      pageNumber 
    } = await req.json();
    
    console.log('📝 Template Advanced: Processing request', {
      templateComplexity,
      sessionId,
      pageNumber,
      hasStoryText: !!storyText,
      hasUserInfo: !!userInfo,
      hasAvatarIdentity: !!avatarIdentity
    });
    
    // Determine complexity level
    const complexity = getComplexityLevel(userInfo, templateComplexity);
    
    if (!['C', 'D'].includes(complexity)) {
      console.log(`⚠️ Template Advanced: Complexity ${complexity} not handled by this function - use Simple template`);
      return createErrorResponse(`Complexity ${complexity} not supported by Advanced template. Use Simple template.`, 400);
    }
    
    // Generate template
    const template = generateAdvancedTemplate(complexity, storyText, userInfo, avatarIdentity);
    
    console.log('🎨 Template Advanced: Generated template', {
      complexity,
      templateType: template.templateType,
      culturalProfile: template.culturalProfile,
      promptLength: template.positivePrompt.length
    });
    
    // Call Runware API
    const imageData = await callRunwareAPI(template.positivePrompt, template.negativePrompt);
    
    console.log('✅ Template Advanced: Image generated successfully');
    
    return createResponse({
      success: true,
      imageURL: imageData.imageURL,
      prompt: template.positivePrompt,
      negativePrompt: template.negativePrompt,
      tier: '2.5B - Template Advanced',
      complexity: complexity,
      templateType: template.templateType,
      enhancementLevel: template.enhancementLevel,
      culturalProfile: template.culturalProfile,
      sessionId: sessionId,
      pageNumber: pageNumber,
      processingTime: Date.now()
    });
    
  } catch (error) {
    console.error('❌ Template Advanced: Error', error);
    return createErrorResponse(error.message, 500);
  }
});