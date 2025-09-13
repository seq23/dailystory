// DEPLOY_MARKER: 2025-01-30T20:17:15Z - FORCED REDEPLOY TO FIX BOOT FAILURES
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
  
  if (complexity === 'A') {
    console.log('🎯 Template AB: Processing Tier 2.5A - AI Failure Fallback with shared services');
    
    // Tier 2.5A: Use shared services (exists because AI/Tier 1 might fail)
    let characterDescription = '';
    let visualDetails = '';
    
    try {
      const CharacterService = await getCharacterService();
      const VisualTracker = await getVisualTracker();
      
      if (CharacterService && sessionId && avatarIdentity) {
        console.log('🎭 Template AB: Getting character consistency data');
        const characterConsistencyService = new CharacterService();
        const charData = await characterConsistencyService.getCharacterSeed(sessionId, avatarIdentity, storyText, 'standard', storyText);
        if (charData) {
          characterDescription = `${childName} with consistent appearance`;
        }
      }
      
      if (VisualTracker && sessionId && storyText) {
        console.log('👁️ Template AB: Tracking visual details');
        await VisualTracker.analyzeTextForDetails(sessionId, storyText, pageNumber, childName);
        const objectDescription = await VisualTracker.buildObjectDescription(sessionId);
        if (objectDescription) {
          visualDetails = objectDescription.split(',').slice(0, 2).join(', '); // Keep it simple
        }
      }
    } catch (error) {
      console.error('❌ Template AB Tier 2.5A: Shared services failed, escalating to Tier 2.5B');
      throw new Error(`Tier 2.5A shared services failed: ${error.message}`);
    }
    
    // Build simple prompts with shared service data
    const characterPart = characterDescription ? `${characterDescription}, ` : `${childName}, `;
    const visualPart = visualDetails ? `with ${visualDetails}, ` : '';
    
    console.log('✅ Template AB Tier 2.5A: Successfully using shared services');
    return {
      positivePrompt: `A simple, colorful illustration showing ${characterPart}${visualPart}basic shapes and ${favoriteColor} colors. Clean, minimal, child-friendly cartoon style.`,
      negativePrompt: 'complex details, realistic, adult themes, scary, dark',
      templateType: 'ai-failure-fallback',
      difficulty: 'A',
      enhancementLevel: 'minimal'
    };
  }
  
  if (complexity === 'B') {
    console.log('🎯 Template AB: Processing Tier 2.5B - Shared Services Fallback with nuclear independence');
    
    // Tier 2.5B: Nuclear independence (exists because shared services might fail)
    // NO shared services - pure nuclear template logic
    try {
      const characterPart = `${childName}, `;
      const colorPart = favoriteColor ? `${favoriteColor} themed ` : '';
      const simpleScene = storyText.substring(0, 100); // First 100 chars for context
      
      console.log('✅ Template AB Tier 2.5B: Successfully using nuclear independence');
      return {
        positivePrompt: `A simple cartoon illustration of ${characterPart}in a ${colorPart}scene. ${simpleScene}. Clean, bright, child-friendly art style.`,
        negativePrompt: 'complex backgrounds, realistic details, adult themes, scary elements',
        templateType: 'shared-services-fallback',
        difficulty: 'B', 
        enhancementLevel: 'basic'
      };
    } catch (error) {
      console.error('❌ Template AB Tier 2.5B: Nuclear independence failed, escalating to Tier 2.5C');
      throw new Error(`Tier 2.5B nuclear independence failed: ${error.message}`);
    }
  }
  
  // Should never reach here - throw error to escalate to next tier
  throw new Error(`Unsupported complexity level: ${complexity}. Template AB only handles A and B.`);
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