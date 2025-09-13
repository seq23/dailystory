// ============= TIER 2.5A-B: RUNWARE TEMPLATE AB (A-B COMPLEXITY) =============
// Handles Level A (basic shapes/colors) and Level B (simple scenes)
// Lightweight, fast deployment - optimized for simple template generation with character consistency

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

console.log(`INIT runware-template-ab boot at ${new Date().toISOString()} | std@0.168.0`);

// ============= LAZY LOADING FUNCTIONS FOR HEAVY DEPENDENCIES =============

async function getCharacterService() {
  try {
    const { CharacterConsistencyService } = await import("../_shared/CharacterConsistencyService.js");
    return CharacterConsistencyService;
  } catch (error) {
    console.warn('CharacterService lazy load failed:', error);
    return null;
  }
}

async function getSessionManager() {
  try {
    const { globalSessionManager } = await import("../_shared/SessionStateManager.js");
    return globalSessionManager;
  } catch (error) {
    console.warn('SessionManager lazy load failed:', error);
    return null;
  }
}

async function getVisualTracker() {
  try {
    const { VisualDetailTracker } = await import("../_shared/VisualDetailTracker.js");
    return VisualDetailTracker;
  } catch (error) {
    console.warn('VisualTracker lazy load failed:', error);
    return null;
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
  console.error('Template AB Error:', error);
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
    console.log(`🎯 Template AB: Using provided complexity: ${templateComplexity}`);
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

// ============= ENHANCED SIMPLE TEMPLATE GENERATION WITH CHARACTER CONSISTENCY =============
async function generateSimpleTemplate(complexity, storyText, userInfo, avatarIdentity, sessionId, pageNumber) {
  const childName = userInfo?.childName || 'child';
  const favoriteColor = userInfo?.favoriteColor || 'blue';
  
  // Try to get character consistency data
  let characterDescription = '';
  let visualDetails = '';
  
  try {
    const CharacterService = await getCharacterService();
    const VisualTracker = await getVisualTracker();
    
    if (CharacterService && sessionId && avatarIdentity) {
      console.log('🎭 Template AB: Getting character consistency data');
      
      // Use the correct method name from the service
      if (CharacterService.getInstance) {
        const serviceInstance = CharacterService.getInstance();
        if (serviceInstance.analyzeVisualDetails) {
          await serviceInstance.analyzeVisualDetails(sessionId, storyText, pageNumber, childName);
          const coloredObjects = serviceInstance.getColoredObjects(sessionId);
          if (coloredObjects) {
            characterDescription = `${childName} with consistent appearance`;
          }
        }
      }
    }
    
    if (VisualTracker && sessionId && storyText) {
      console.log('👁️ Template AB: Tracking visual details');
      // Use the correct method name from the service
      if (VisualTracker.analyzeVisualDetails) {
        await VisualTracker.analyzeVisualDetails(sessionId, storyText, pageNumber);
        const coloredObjects = VisualTracker.getColoredObjects(sessionId);
        if (coloredObjects) {
          visualDetails = coloredObjects.split(',').slice(0, 2).join(', '); // Keep it simple
        }
      }
    }
  } catch (error) {
    console.warn('⚠️ Template AB: Character consistency unavailable:', error);
  }
  
  // Build simple prompts with character consistency when available
  const characterPart = characterDescription ? `${characterDescription}, ` : `${childName}, `;
  const visualPart = visualDetails ? `with ${visualDetails}, ` : '';
  
  if (complexity === 'A') {
    // Level A: Basic shapes and colors with character consistency
    return {
      positivePrompt: `A simple, colorful illustration showing ${characterPart}${visualPart}basic shapes and ${favoriteColor} colors. Clean, minimal, child-friendly cartoon style.`,
      negativePrompt: 'complex details, realistic, adult themes, scary, dark',
      templateType: 'basic-shapes',
      difficulty: 'A',
      enhancementLevel: 'minimal'
    };
  }
  
  if (complexity === 'B') {
    // Level B: Simple scenes with character consistency
    const simpleScene = storyText.substring(0, 100); // First 100 chars for context
    return {
      positivePrompt: `A simple cartoon illustration of ${characterPart}${visualPart}in a ${favoriteColor} themed scene. ${simpleScene}. Clean, bright, child-friendly art style.`,
      negativePrompt: 'complex backgrounds, realistic details, adult themes, scary elements',
      templateType: 'simple-scene',
      difficulty: 'B', 
      enhancementLevel: 'basic'
    };
  }
  
  // Fallback to basic with character consistency
  return {
    positivePrompt: `A simple, happy illustration of ${characterPart}${visualPart}with ${favoriteColor} colors. Child-friendly cartoon style.`,
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
  
  console.log('🎨 Template AB: Calling Runware API');
  
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
  console.log(`🎯 Template AB: ${req.method} ${req.url}`);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Handle health checks (GET/HEAD requests)
  if (req.method === 'GET' || req.method === 'HEAD') {
    console.log('🏥 Template AB: Health check request');
    return createResponse({
      healthy: true,
      status: 'healthy',
      functionName: 'runware-template-ab',
      service: 'runware-template-ab',
      projectId: 'cpzeuogomaixamrtnnmj',
      tier: '2.5A-B',
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
    
    console.log('📝 Template AB: Processing request', {
      templateComplexity,
      sessionId,
      pageNumber,
      hasStoryText: !!storyText,
      hasUserInfo: !!userInfo
    });
    
    // Initialize session manager if available
    try {
      const SessionManager = await getSessionManager();
      if (SessionManager && sessionId) {
        console.log('📋 Template AB: Updating session state');
        SessionManager.updateSession(sessionId, {
          lastActivity: Date.now(),
          currentFunction: 'runware-template-ab',
          pageNumber: pageNumber
        });
      }
    } catch (error) {
      console.warn('⚠️ Template AB: Session management unavailable:', error);
    }
    
    // Determine complexity level
    const complexity = getComplexityLevel(userInfo, templateComplexity);
    
    if (!['A', 'B'].includes(complexity)) {
      console.log(`⚠️ Template AB: Complexity ${complexity} not handled by this function - use CD template`);
      return createErrorResponse(`Complexity ${complexity} not supported by AB template. Use CD template.`, 400);
    }
    
    // Generate template with character consistency
    const template = await generateSimpleTemplate(complexity, storyText, userInfo, avatarIdentity, sessionId, pageNumber);
    
    console.log('🎨 Template AB: Generated template', {
      complexity,
      templateType: template.templateType,
      promptLength: template.positivePrompt.length
    });
    
    // Call Runware API
    const imageData = await callRunwareAPI(template.positivePrompt, template.negativePrompt);
    
    console.log('✅ Template AB: Image generated successfully');
    
    return createResponse({
      success: true,
      imageURL: imageData.imageURL,
      prompt: template.positivePrompt,
      negativePrompt: template.negativePrompt,
      tier: '2.5A-B - Template AB',
      complexity: complexity,
      templateType: template.templateType,
      enhancementLevel: template.enhancementLevel,
      sessionId: sessionId,
      pageNumber: pageNumber,
      processingTime: Date.now()
    });
    
  } catch (error) {
    console.error('❌ Template AB: Error', error);
    return createErrorResponse(error.message, 500);
  }
});