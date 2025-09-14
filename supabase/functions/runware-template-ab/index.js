// DEPLOY_MARKER: 2025-01-30T20:18:45Z - FORCED REDEPLOY VIA PURE JS - REMOVED TS SHIM
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

// ============= EXACT TEMPLATE STRUCTURES FROM MASTER PLAN =============

const PREMIUM_PROMPT_TEMPLATES = {
  'level_0-1': 'Narrative: {pageText}. Subject: {character} {age}, {ethnicity}, {hair}, {features}, {emotion}. Action: {scene}. Composition: {spatial_composition}. Environment: {setting}, {atmosphere}. Elements: {props}, {action_objects}, {sensory_details}. Context: {community_context}, {secondary_characters}. Technical: {frameworkPrompt}, {cameraDirective}',
  
  'level_2-4': 'Technical: {frameworkPrompt}, {cameraDirective}. Narrative: {pageText}. Subject: {character} {age}, {ethnicity}, {hair}, {features}, {emotion}. Action: {scene}. Composition: {spatial_composition}. Environment: {setting}, {atmosphere}. Elements: {props}, {action_objects}, {sensory_details}. Context: {community_context}, {secondary_characters}'
};

const BASIC_PROMPT_TEMPLATES = {
  'level_0-1': 'Subject: {character} {age}, {ethnicity}. Action: {scene}. Environment: {setting}. Technical: {frameworkPrompt}',
  
  'level_2-4': 'Technical: {frameworkPrompt}. Subject: {character} {age}, {ethnicity}. Action: {scene}. Environment: {setting}'
};

// ============= CULTURAL INTELLIGENCE INTEGRATION =============
async function getCulturalArrays() {
  try {
    const { CULTURAL_ARRAYS } = await import("../_shared/tier25Vocabulary.js");
    return CULTURAL_ARRAYS;
  } catch (error) {
    console.warn('Cultural arrays unavailable:', error);
    return null;
  }
}

// ============= PLACEHOLDER RESOLUTION SYSTEM =============
async function resolvePlaceholders(template, data, hasCulturalIntelligence) {
  const { 
    storyText, 
    userInfo, 
    avatarIdentity, 
    characterData, 
    visualDetails, 
    secondaryCharacters,
    frameworkPrompt 
  } = data;

  const childName = userInfo?.name || userInfo?.childName || 'child';
  
  // Build character description with cultural intelligence
  let characterDescription = childName;
  let ethnicity = '';
  let hair = '';
  let features = '';
  
  if (hasCulturalIntelligence && avatarIdentity) {
    console.log('🌍 Applying cultural intelligence for avatarIdentity:', avatarIdentity);
    
    // Use avatarIdentity for cultural elements
    const culturalArrays = await getCulturalArrays();
    
    if (culturalArrays) {
      // Handle English + dark skin tone scenario (African American features)
      const nativeLanguage = avatarIdentity.nativeLanguage || userInfo?.nativeLanguage || 'en';
      const skinTone = avatarIdentity.skinTone || userInfo?.avatar?.skinTone;
      const avatarType = avatarIdentity.type || userInfo?.avatar?.type;
      
      if (nativeLanguage === 'en' && (skinTone === 'dark' || skinTone === 'medium')) {
        // Apply African American cultural features
        console.log('🌍 Applying African American cultural features');
        
        if (culturalArrays.HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES.length > 0) {
          const randomFeature = culturalArrays.HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES[
            Math.floor(Math.random() * culturalArrays.HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES.length)
          ];
          features = randomFeature;
        }
        
        if (culturalArrays.HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES) {
          const genderKey = (avatarType === 'girl') ? 'girls' : 'boys';
          const hairStyles = culturalArrays.HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES[genderKey];
          if (hairStyles && hairStyles.length > 0) {
            hair = hairStyles[Math.floor(Math.random() * hairStyles.length)];
          }
        }
        
        ethnicity = 'African American';
      } else if (nativeLanguage !== 'en' && culturalArrays.REGIONAL_AUTHENTICITY_STRINGS[nativeLanguage]) {
        // Apply regional authenticity for non-English speakers
        console.log(`🌍 Applying regional authenticity for language: ${nativeLanguage}`);
        ethnicity = culturalArrays.REGIONAL_AUTHENTICITY_STRINGS[nativeLanguage];
      } else {
        // Default cultural baseline
        ethnicity = 'diverse multicultural';
        hair = 'well-styled hair';
        features = 'expressive features';
      }
    } else {
      console.warn('⚠️ Cultural arrays not available, using default features');
      ethnicity = 'diverse';
      hair = 'styled hair';
      features = 'friendly features';
    }
  } else {
    console.log('🚫 No cultural intelligence applied');
  }

  // Framework prompt (style)
  const framework = frameworkPrompt || 'children\'s book illustration style';
  
  // Placeholder mapping
  const placeholders = {
    pageText: storyText || '',
    character: characterDescription,
    age: userInfo?.age ? `age ${userInfo.age}` : '',
    ethnicity: ethnicity,
    hair: hair,
    features: features,
    emotion: 'happy and engaged',
    scene: storyText?.substring(0, 50) || 'playing',
    spatial_composition: 'centered composition',
    setting: 'bright, colorful environment',
    atmosphere: 'cheerful and warm',
    props: visualDetails?.objects || '',
    action_objects: visualDetails?.actionObjects || '',
    sensory_details: visualDetails?.sensoryDetails || '',
    community_context: hasCulturalIntelligence && ethnicity ? `${ethnicity} community setting` : '',
    secondary_characters: secondaryCharacters || '',
    frameworkPrompt: framework,
    cameraDirective: 'medium shot, eye level'
  };

  // Replace placeholders in template
  let resolvedTemplate = template;
  Object.entries(placeholders).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    resolvedTemplate = resolvedTemplate.replace(new RegExp(placeholder, 'g'), value || '');
  });

  // Clean up extra spaces and commas
  resolvedTemplate = resolvedTemplate
    .replace(/,\s*,/g, ',')
    .replace(/,\s*\./g, '.')
    .replace(/\s+/g, ' ')
    .replace(/,\s*$/g, '')
    .trim();

  console.log('✅ Template resolved with cultural intelligence:', hasCulturalIntelligence);
  return resolvedTemplate;
}

// ============= TIER ROUTING WITH SERVICE HEALTH CHECKS =============
async function checkServiceHealth() {
  const services = {
    characterService: false,
    visualTracker: false,
    sessionManager: false
  };

  try {
    const CharacterService = await getCharacterService();
    services.characterService = !!CharacterService;
  } catch (error) {
    console.warn('CharacterService health check failed:', error.message);
  }

  try {
    const VisualTracker = await getVisualTracker();
    services.visualTracker = !!VisualTracker;
  } catch (error) {
    console.warn('VisualTracker health check failed:', error.message);
  }

  try {
    const SessionManager = await getSessionManager();
    services.sessionManager = !!SessionManager;
  } catch (error) {
    console.warn('SessionManager health check failed:', error.message);
  }

  return services;
}

// ============= ENHANCED TEMPLATE GENERATION WITH EXACT STRUCTURES =============
async function generateSimpleTemplate(complexity, storyText, userInfo, avatarIdentity, sessionId, pageNumber) {
  console.log(`🎯 Template AB: Processing complexity ${complexity} with exact template structures`);
  
  // Determine difficulty level for template selection
  const age = userInfo?.age || 5;
  const gradeLevel = userInfo?.gradeLevel || 'K';
  const difficultyLevel = (gradeLevel === 'K' || gradeLevel === '1' || age <= 6) ? 'level_0-1' : 'level_2-4';
  
  // Check service health for tier routing
  const serviceHealth = await checkServiceHealth();
  
  if (complexity === 'A') {
    console.log('🎯 Template AB: Processing Tier 2.5A - AI Failure Fallback with shared services');
    
    // Tier 2.5A: PREMIUM templates + Full cultural intelligence + Shared services
    let characterData = null;
    let visualDetails = null;
    let secondaryCharacters = '';
    
    if (serviceHealth.characterService && avatarIdentity) {
      try {
        console.log('🎭 Template AB: Getting character consistency data');
        const CharacterService = await getCharacterService();
        const characterConsistencyService = new CharacterService();
        characterData = await characterConsistencyService.getCharacterSeed(sessionId, avatarIdentity, storyText, 'standard', storyText);
      } catch (error) {
        console.warn('Character service failed:', error);
      }
    }
    
    if (serviceHealth.visualTracker && sessionId) {
      try {
        console.log('👁️ Template AB: Tracking visual details');
        const VisualTracker = await getVisualTracker();
        await VisualTracker.analyzeTextForDetails(sessionId, storyText, pageNumber, userInfo?.name);
        const objDescription = await VisualTracker.buildObjectDescription(sessionId);
        const coloredObjects = await VisualTracker.getColoredObjectsForSession(sessionId);
        
        visualDetails = {
          objects: objDescription?.substring(0, 100) || '',
          actionObjects: coloredObjects?.slice(0, 2).join(', ') || '',
          sensoryDetails: 'bright, vivid colors'
        };
      } catch (error) {
        console.warn('Visual tracker failed:', error);
      }
    }

    // Get framework prompt (style)
    const frameworkPrompt = 'vibrant children\'s book illustration, digital art style';
    
    // Use PREMIUM template with full cultural intelligence
    const template = PREMIUM_PROMPT_TEMPLATES[difficultyLevel];
    const templateData = {
      storyText,
      userInfo,
      avatarIdentity,
      characterData,
      visualDetails,
      secondaryCharacters,
      frameworkPrompt
    };
    
    const positivePrompt = await resolvePlaceholders(template, templateData, true);
    
    console.log('✅ Template AB Tier 2.5A: PREMIUM template with cultural intelligence applied');
    console.log('🔍 Cultural elements detected:', {
      hasAvatarIdentity: !!avatarIdentity,
      nativeLanguage: avatarIdentity?.nativeLanguage || userInfo?.nativeLanguage,
      skinTone: avatarIdentity?.skinTone || userInfo?.avatar?.skinTone,
      usingChildsRealName: userInfo?.name || userInfo?.childName
    });
    
    console.log('✅ Template AB Tier 2.5A: Successfully using PREMIUM templates with cultural intelligence');
    return {
      positivePrompt,
      negativePrompt: 'photorealistic, adult themes, scary, dark, violent, inappropriate',
      templateType: 'premium-with-cultural-intelligence',
      difficulty: 'A',
      enhancementLevel: 'premium',
      difficultyLevel
    };
  }
  
  if (complexity === 'B') {
    console.log('🎯 Template AB: Processing Tier 2.5B - Nuclear Independence with basic templates');
    
    // Tier 2.5B: BASIC templates + Limited cultural intelligence + Nuclear independence
    const frameworkPrompt = 'simple cartoon illustration style';
    
    // Use BASIC template with limited cultural intelligence
    const template = BASIC_PROMPT_TEMPLATES[difficultyLevel];
    const templateData = {
      storyText,
      userInfo,
      avatarIdentity,
      characterData: null,
      visualDetails: null,
      secondaryCharacters: '',
      frameworkPrompt
    };
    
    const positivePrompt = await resolvePlaceholders(template, templateData, true);
    
    console.log('✅ Template AB Tier 2.5B: Successfully using BASIC templates with limited cultural intelligence');
    return {
      positivePrompt,
      negativePrompt: 'complex details, photorealistic, adult themes, scary',
      templateType: 'basic-with-limited-cultural',
      difficulty: 'B', 
      enhancementLevel: 'basic',
      difficultyLevel
    };
  }
  
  // Should never reach here - escalate to next tier
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