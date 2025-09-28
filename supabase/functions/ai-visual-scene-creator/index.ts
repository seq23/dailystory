// DEPLOY_MARKER: 2025-09-27T00:00:00Z - Optimized with echoing CORS and memoized lazy loading

// ============= RESILIENT IMPORT SYSTEM =============
// Dynamic Supabase client creation using resilient loading
async function createSupabaseClient() {
  try {
    // Preferred: resilient loader from _shared
    let memoizedImport: <T=any>(href: string) => Promise<T>;
    try {
      ({ memoizedImport } = await import(
        new URL("../_shared/resilientLoader.ts", import.meta.url).href
      ));
    } catch {
      // Fallback: simple local memoizer to stay up during cold boot anomalies
      const cache = new Map<string, Promise<any>>();
      memoizedImport = <T=any>(href: string) => {
        if (!cache.has(href)) cache.set(href, import(href));
        return cache.get(href)! as Promise<T>;
      };
    }

    // Use resilient loading for Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    // Try primary CDN first, then fallback
    const { createClient } = await memoizedImport('https://esm.sh/@supabase/supabase-js@2.57.4');
    return createClient(supabaseUrl, supabaseServiceRoleKey);
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    // Return a null client to continue without Supabase for nuclear independence
    return null;
  }
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
function getNuclearStyleFramework(difficulty: string) {
  const normalizedDifficulty = difficulty?.toLowerCase() || 'medium';
  const framework = NUCLEAR_HARDCODED_STYLE_FRAMEWORKS[normalizedDifficulty as keyof typeof NUCLEAR_HARDCODED_STYLE_FRAMEWORKS] || NUCLEAR_HARDCODED_STYLE_FRAMEWORKS['medium'];
  return framework;
}

async function getPhaseOrchestrator() {
  try {
    // Preferred: resilient loader from _shared
    let memoizedImport: <T=any>(href: string) => Promise<T>;
    try {
      ({ memoizedImport } = await import(
        new URL("../_shared/resilientLoader.ts", import.meta.url).href
      ));
    } catch {
      // Fallback: simple local memoizer to stay up during cold boot anomalies
      const cache = new Map<string, Promise<any>>();
      memoizedImport = <T=any>(href: string) => {
        if (!cache.has(href)) cache.set(href, import(href));
        return cache.get(href)! as Promise<T>;
      };
    }

    const [
      orchestratorModule,
      { CharacterConsistencyService },
      { UnifiedPlaceholderResolver }
    ] = await Promise.all([
      memoizedImport(new URL("../_shared/PhaseIntegrationOrchestrator.js", import.meta.url).href),
      memoizedImport(new URL("../_shared/CharacterConsistencyService.js", import.meta.url).href),
      memoizedImport(new URL("../_shared/UnifiedPlaceholderResolver.js", import.meta.url).href)
    ]);
    
    return { 
      phaseIntegrationOrchestrator: orchestratorModule.phaseIntegrationOrchestrator, 
      getNuclearStyleFramework, 
      CharacterConsistencyService, 
      UnifiedPlaceholderResolver 
    };
  } catch (error: unknown) {
    console.warn('Phase orchestrator lazy load failed:', error);
    return null;
  }
}

// Fast Boot Sync Recovery Configuration
const FAST_BOOT_SYNC = {
  maxRetries: 3,
  delays: [500, 2000, 3500], // Total: 6 seconds max
  bootErrors: ['Module not found', 'BOOT_OR_IMPORT_FAILURE', 'failed to determine entrypoint', 'Service initialization failed'],
  maxTotalTime: 6000
};

// ============= BULLETPROOF PHASES IMPLEMENTATION =============

// PHASE 3: FAST CIRCUIT BREAKER PROTECTION  
const TIER_TIMEOUTS = {
  DIRECT_MODE: 8000,      // 8s max for Direct Mode
  AI_GENERATION: 15000,   // 15s max for AI generation
  OPENAI_API: 12000       // 12s max for OpenAI calls
};

// PHASE 1B: Fast Direct Mode Validation
function validateDirectModePayload(payload: any): { isValid: boolean; contentType: string } {
  if (!payload.pageText && !payload.storyText) throw new Error("MISSING_STORY_CONTENT");
  // Don't fail for missing userInfo - normalize it instead
  return { isValid: true, contentType: payload.pageText ? 'pageText' : 'storyText' };
}

// PHASE 1C: UserInfo Normalization - Real World Defaults
function normalizeUserInfo(userInfo: any, deriveRegionalEthnicity: any): any {
  // Use the same exact fallbacks as production (child, age 8, prefer-not-to-answer, medium, etc.)
  return {
    name: userInfo?.name || 'child',
    age: userInfo?.age || 8,
    userName: userInfo?.userName || userInfo?.name || 'child',
    ethnicity: deriveRegionalEthnicity(userInfo, userInfo?.avatar),
    skinTone: userInfo?.skinTone || userInfo?.avatar?.skinTone || 'medium',
    avatar: {
      type: userInfo?.avatar?.type || userInfo?.ethnicity || 'prefer-not-to-answer',
      skinTone: userInfo?.avatar?.skinTone || userInfo?.skinTone || 'medium'
    },
    nativeLanguage: userInfo?.nativeLanguage || 'en',
    difficulty: userInfo?.difficulty || 'pre-reader',
    grade: userInfo?.grade || 'PreK',
    culturalProfile: (userInfo?.nativeLanguage && userInfo?.nativeLanguage !== 'en') ? userInfo?.nativeLanguage : undefined,
    // Pass through any additional fields
    ...userInfo
  };
}

// PHASE 3B: Instant Failure Detection
function shouldFailFast(error: any): boolean {
  const msg = error?.message?.toLowerCase() || '';
  return msg.includes('missing_story_content') || 
         msg.includes('missing_user_info') ||
         msg.includes('payload_null') ||
         msg.includes('no_story_content');
}

// PHASE 5A: Primary Scene Quality Check
function validatePrimarySceneQuality(scene: any): boolean {
  if (!scene || typeof scene !== 'string') return false;
  if (scene.length < 50) return false;
  if (scene.includes('undefined') || scene.includes('null')) return false;
  return scene.split(' ').filter(word => word.length > 0).length >= 8; // Minimum word count
}

// PHASE 5B: Image URL Validation  
function validateImageURL(url: any): boolean {
  if (!url || typeof url !== 'string') return false;
  if (!url.startsWith('http')) return false;
  if (url.includes('undefined') || url.includes('null')) return false;
  return url.length > 20; // Reasonable URL length
}

// Echoing CORS with Vary headers for preflight consistency  
function generateEchoCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin');
  const requestHeaders = req.headers.get('Access-Control-Request-Headers');
  
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Headers': requestHeaders || 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
    'Access-Control-Max-Age': '600',
    'Vary': 'Origin, Access-Control-Request-Headers',
  };
}

function corsResponse(data: any, req: Request, status = 200): Response {
  const corsHeaders = generateEchoCorsHeaders(req);
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

function createCorsErrorResponse(error: any, status = 500, req?: Request): Response {
  const errorMessage = error instanceof Error ? error.message : error;
  console.error('Edge function error:', errorMessage);
  
  if (req) {
    return corsResponse({ 
      success: false, 
      error: errorMessage 
    }, req, status);
  }
  
  // Fallback when req is not available
  return new Response(JSON.stringify({ 
    success: false, 
    error: errorMessage 
  }), {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Content-Type': 'application/json'
    }
  });
}

// Simple error handling and logging utilities
function handleError(error: unknown, functionName: string, context: Record<string, any> = {}) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`ERROR ${functionName}:`, errorMessage, context);
  // Return a lazy fallback that doesn't require req parameter
  return new Response(JSON.stringify({ 
    success: false, 
    error: errorMessage 
  }), {
    status: 500,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Content-Type': 'application/json'
    }
  });
}

function withPerformanceTracking<T>(functionName: string, model: string | undefined, operation: () => Promise<T>): Promise<T> {
  const startTime = Date.now();
  console.log(`START ${functionName} with model: ${model}`);
  
  return operation().then(result => {
    console.log(`SUCCESS ${functionName} completed in ${Date.now() - startTime}ms`);
    return result;
  }).catch(error => {
    console.error(`ERROR ${functionName} failed after ${Date.now() - startTime}ms:`, error);
    throw error;
  });
}

// OPTIMIZED SERVE HANDLER WITH FAST BOOT SYNC RECOVERY
Deno.serve(async (req: Request): Promise<Response> => {
  // PHASE 1: OPTIONS fast path (immediate return)
  if (req.method === 'OPTIONS') {
    const corsHeaders = generateEchoCorsHeaders(req);
    return new Response(null, { headers: corsHeaders });
  }

  // PHASE 2: GET/HEAD health checks
  if (req.method === 'GET' || req.method === 'HEAD') {
    return corsResponse({ 
      status: 'healthy', 
      service: 'ai-visual-scene-creator',
      timestamp: new Date().toISOString()
    }, req);
  }

  // PHASE 3: Method validation before JSON parsing
  if (req.method !== 'POST') {
    return corsResponse({ error: 'Method not allowed' }, req, 405);
  }

  // Fast Boot Sync Recovery wrapper
  for (let attempt = 0; attempt <= FAST_BOOT_SYNC.maxRetries; attempt++) {
    try {
      let payload: any;
      let requestId = '';

      // PHASE 3: JSON parsing only after method validation
      payload = await req.json();
      requestId = `${Math.random().toString(36).substring(2)}`;

      console.log(`🚀 [${requestId}] ai-visual-scene-creator: ${req.method} ${req.url}`);

      // PHASE 4: Fast validation
      const validationResult = validateDirectModePayload(payload);
      console.log(`✅ [${requestId}] Fast validation passed: ${validationResult.contentType}`);

      // Handle fast failure cases
      if (shouldFailFast(payload)) {
        console.log(`❌ [${requestId}] Fast failure detected`);
        return corsResponse({ 
          success: false, 
          error: 'Invalid payload - missing required fields' 
        }, req, 400);
      }

      // PHASE 5: Lazy load orchestrator and dependencies
      console.log(`📦 [${requestId}] Loading orchestrator (lazy)`);
      const orchestratorModules = await getPhaseOrchestrator();
      
      if (!orchestratorModules) {
        throw new Error('Service initialization failed');
      }

      // Load shared dependencies with resilient handling
      let memoizedImport: <T=any>(href: string) => Promise<T>;
      try {
        ({ memoizedImport } = await import(
          new URL("../_shared/resilientLoader.ts", import.meta.url).href
        ));
      } catch {
        // Fallback: simple local memoizer to stay up during cold boot anomalies
        const cache = new Map<string, Promise<any>>();
        memoizedImport = <T=any>(href: string) => {
          if (!cache.has(href)) cache.set(href, import(href));
          return cache.get(href)! as Promise<T>;
        };
      }

      // Load shared dependencies with resilient handling
      let deriveRegionalEthnicity = (userInfo: any) => userInfo?.ethnicity || 'American';
      let getHairBySkintone = (skinTone: string, sessionId?: string) => 'brown hair';
      let getSkinBySkintone = (skinTone: string, sessionId?: string) => 'medium skin tone';

      try {
        const resolverModule = await memoizedImport(
          new URL("../_shared/UnifiedPlaceholderResolver.js", import.meta.url).href
        );
        deriveRegionalEthnicity = resolverModule.deriveRegionalEthnicity;
      } catch (error) {
        console.warn(`[AI_VISUAL] UnifiedPlaceholderResolver load failed: ${error instanceof Error ? error.message : String(error)}`);
      }

      try {
        const cacheModule = await memoizedImport(
          new URL("../_shared/StaticDataCache.js", import.meta.url).href
        );
        getHairBySkintone = cacheModule.getHairBySkintone;
        getSkinBySkintone = cacheModule.getSkinBySkintone;
      } catch (error) {
        console.warn(`[AI_VISUAL] StaticDataCache load failed: ${error instanceof Error ? error.message : String(error)}`);;
      }

      // PHASE 5: Lazy load all dependencies in parallel
      const [dependencies, supabase] = await Promise.all([
        getPhaseOrchestrator(),
        createSupabaseClient()
      ]);

      if (!dependencies?.phaseIntegrationOrchestrator) {
        throw new Error('Service initialization failed');
      }

      console.log(`✅ [${requestId}] All dependencies loaded`);

      // PHASE 6: Normalize user info with real defaults
      const normalizedUserInfo = normalizeUserInfo(payload.userInfo, deriveRegionalEthnicity);
      console.log(`🔄 [${requestId}] UserInfo normalized:`, {
        name: normalizedUserInfo.name,
        ethnicity: normalizedUserInfo.ethnicity,
        skinTone: normalizedUserInfo.skinTone,
        difficulty: normalizedUserInfo.difficulty
      });

      // PHASE 7: Call orchestrator for enhancement
      const storyContentKey = validationResult.contentType;
      const storyContent = payload[storyContentKey];
      
      console.log(`🎭 [${requestId}] Processing with orchestrator (${storyContentKey}):`, {
        contentLength: storyContent?.length,
        userInfo: normalizedUserInfo.name,
        sessionId: payload.sessionId
      });

      const result = await withPerformanceTracking(
        'ai-visual-scene-creator', 
        'orchestrator',
        () => dependencies.phaseIntegrationOrchestrator.processDirectMode({
          [storyContentKey]: storyContent,
          userInfo: normalizedUserInfo,
          sessionId: payload.sessionId || `session-${requestId}`,
          requestId,
          isDebugMode: payload.isDebugMode || false,
          ...(payload.directMode && { directMode: true })
        })
      );

      console.log(`🎯 [${requestId}] Orchestrator processing completed:`, {
        success: result?.success,
        hasImageURL: !!result?.imageURL,
        provider: result?.provider
      });

      // PHASE 8: Validate and return result
      if (result && typeof result === 'object' && 'success' in result) {
        const response = {
          success: result.success,
          imageURL: result.imageURL,
          ...(result.templateData && { templateData: result.templateData }),
          ...(result.metadata && { metadata: result.metadata }),
          provider: result.provider || 'ai-visual-scene-creator',
          requestId,
          timestamp: new Date().toISOString()
        };
      
        return corsResponse(response, req);
      } else {
        // This should be a Response object (error case)
        return result;
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isSyncFailure = FAST_BOOT_SYNC.bootErrors.some(msg => 
        errorMessage.includes(msg)
      );
      
      if (!isSyncFailure || attempt === FAST_BOOT_SYNC.maxRetries) {
        // Final failure or non-sync error
        console.error('AI_VISUAL_SCENE_CREATOR - Final error after retries:', errorMessage);
        return createCorsErrorResponse(errorMessage, 500, req);
      }
      
      const delay = FAST_BOOT_SYNC.delays[attempt];
      console.warn(`🔄 [AI_VISUAL] Fast boot retry ${attempt + 1}/${FAST_BOOT_SYNC.maxRetries} in ${delay}ms: ${errorMessage}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // Should never reach here, but fallback
  return createCorsErrorResponse('Max retries exceeded', 500, req);
});