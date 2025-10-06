// DEPLOY_MARKER: 2025-10-06T03:10:00Z - IdempotencyMemory optional everywhere + debug cleanup

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ✅ BUNDLER HINT: Force CCS inclusion in deployment bundle (dynamic import used inside handler)
import { characterConsistencyService as _ccsHint } from "../_shared/CharacterConsistencyService.js";

// Import dynamic CORS system for bulletproof cross-origin support
import { 
  createDynamicCorsOptionsResponse, 
  createDynamicCorsResponse, 
  createDynamicCorsErrorResponse 
} from '../_shared/corsAdvanced.ts';

// ========== GLOBAL SUPABASE CLIENT (lazy-initialized) ==========
let supabaseClient: any = null;

// ========== CCS BOOT VERIFICATION ==========
let ccsBootStatus = { loaded: false, error: null as string | null };

async function verifyCCSBoot() {
  let ccsModule;
  try {
    try {
      ccsModule = await import("../_shared/CharacterConsistencyService.js");
      console.log('✅ [BOOT] Tier 1 (ai-visual-scene-creator): _shared loaded');
    } catch (sharedError) {
      ccsModule = await import("../_vendor/CharacterConsistencyService.mjs");
      console.log('✅ [BOOT] Tier 1 (ai-visual-scene-creator): _vendor loaded (fallback)');
    }
    const ccs = ccsModule.characterConsistencyService;
    
    // Test key method
    const testResult = await ccs.getEnhancedCharacterSeed({ name: 'Test', age: 8 }, 'test-session', 'TestChar');
    
    if (testResult && testResult.characterName) {
      ccsBootStatus = { loaded: true, error: null };
      console.log('✅ [BOOT] Tier 1 (ai-visual-scene-creator): CCS loaded successfully');
      return true;
    } else {
      throw new Error('CCS method returned invalid result');
    }
  } catch (error) {
    ccsBootStatus = { loaded: false, error: error.message };
    console.error('❌ [BOOT] Tier 1 (ai-visual-scene-creator): CCS load failed -', error.message);
    return false;
  }
}

// ========== INLINED: ProviderGate (Concurrency + Circuit Breaker) ==========
// Inlined to avoid bundling failures with _shared/ dynamic imports
// Feature flag: DISABLE_PROVIDER_GATE=true to skip gating

interface GateConfig {
  maxConcurrency: number;
  failThreshold: number;
  cooldownMs: number;
  maxWaitMs: number;
}

interface CircuitState {
  failures: number;
  lastFailureAt: number;
  isOpen: boolean;
}

interface GateState {
  active: number;
  waiting: Array<{ resolve: () => void; acquiredAt: number }>;
  circuit: CircuitState;
}

const gates = new Map<string, GateState>();

const DEFAULT_CONFIGS: Record<string, GateConfig> = {
  'T1:ai-visual-scene-creator': {
    maxConcurrency: parseInt(Deno.env.get('PROVIDER_CONCURRENCY_T1') || '6'),
    failThreshold: parseInt(Deno.env.get('CIRCUIT_FAIL_THRESHOLD') || '5'),
    cooldownMs: parseInt(Deno.env.get('CIRCUIT_COOLDOWN_MS') || '30000'),
    maxWaitMs: 2000
  },
  'DM:runware-template-cd': {
    maxConcurrency: parseInt(Deno.env.get('PROVIDER_CONCURRENCY_RUNWARE') || '4'),
    failThreshold: parseInt(Deno.env.get('CIRCUIT_FAIL_THRESHOLD') || '5'),
    cooldownMs: parseInt(Deno.env.get('CIRCUIT_COOLDOWN_MS') || '45000'),
    maxWaitMs: 2000
  },
  'T25A:runware-template-ab': {
    maxConcurrency: parseInt(Deno.env.get('PROVIDER_CONCURRENCY_RUNWARE') || '4'),
    failThreshold: parseInt(Deno.env.get('CIRCUIT_FAIL_THRESHOLD') || '5'),
    cooldownMs: parseInt(Deno.env.get('CIRCUIT_COOLDOWN_MS') || '45000'),
    maxWaitMs: 2000
  },
  'T25B:runware-template-ab': {
    maxConcurrency: parseInt(Deno.env.get('PROVIDER_CONCURRENCY_RUNWARE') || '4'),
    failThreshold: parseInt(Deno.env.get('CIRCUIT_FAIL_THRESHOLD') || '5'),
    cooldownMs: parseInt(Deno.env.get('CIRCUIT_COOLDOWN_MS') || '45000'),
    maxWaitMs: 2000
  },
  'T25C:runware-template-cd': {
    maxConcurrency: parseInt(Deno.env.get('PROVIDER_CONCURRENCY_RUNWARE') || '4'),
    failThreshold: parseInt(Deno.env.get('CIRCUIT_FAIL_THRESHOLD') || '5'),
    cooldownMs: parseInt(Deno.env.get('CIRCUIT_COOLDOWN_MS') || '45000'),
    maxWaitMs: 2000
  },
  'IMG:runware-generate-image': {
    maxConcurrency: parseInt(Deno.env.get('PROVIDER_CONCURRENCY_RUNWARE') || '4'),
    failThreshold: parseInt(Deno.env.get('CIRCUIT_FAIL_THRESHOLD') || '5'),
    cooldownMs: parseInt(Deno.env.get('CIRCUIT_COOLDOWN_MS') || '45000'),
    maxWaitMs: 2000
  }
};

function getOrCreateGateState(key: string): GateState {
  if (!gates.has(key)) {
    gates.set(key, {
      active: 0,
      waiting: [],
      circuit: {
        failures: 0,
        lastFailureAt: 0,
        isOpen: false
      }
    });
  }
  return gates.get(key)!;
}

function getConfig(key: string): GateConfig {
  return DEFAULT_CONFIGS[key] || DEFAULT_CONFIGS['T25A:runware-template-ab'];
}

function isCircuitOpen(key: string): boolean {
  const state = getOrCreateGateState(key);
  const config = getConfig(key);
  const now = Date.now();
  
  if (state.circuit.isOpen) {
    if (now - state.circuit.lastFailureAt >= config.cooldownMs) {
      console.log(`🔄 [GATE] Circuit ${key} half-open: cooldown passed, allowing next attempt`);
      state.circuit.isOpen = false;
      state.circuit.failures = 0;
    }
  }
  
  return state.circuit.isOpen;
}

async function acquire(key: string): Promise<{ acquired: boolean; reason?: string; retryAfterSeconds?: number }> {
  const state = getOrCreateGateState(key);
  const config = getConfig(key);
  
  if (isCircuitOpen(key)) {
    const timeUntilCooldown = Math.ceil((config.cooldownMs - (Date.now() - state.circuit.lastFailureAt)) / 1000);
    return { 
      acquired: false, 
      reason: 'CIRCUIT_OPEN', 
      retryAfterSeconds: Math.max(3, Math.min(8, timeUntilCooldown))
    };
  }
  
  if (state.active < config.maxConcurrency) {
    state.active++;
    return { acquired: true };
  }
  
  const jitter = Math.floor(Math.random() * 150);
  const timeout = config.maxWaitMs + jitter;
  
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      const index = state.waiting.findIndex(w => w.resolve === resolveAcquire);
      if (index !== -1) {
        state.waiting.splice(index, 1);
      }
      resolve({ 
        acquired: false, 
        reason: 'QUEUE_TIMEOUT', 
        retryAfterSeconds: Math.floor(3 + Math.random() * 5)
      });
    }, timeout);
    
    const resolveAcquire = () => {
      clearTimeout(timeoutId);
      state.active++;
      resolve({ acquired: true });
    };
    
    state.waiting.push({ 
      resolve: resolveAcquire, 
      acquiredAt: Date.now() 
    });
  });
}

function release(key: string, ok: boolean = true): void {
  const state = getOrCreateGateState(key);
  const config = getConfig(key);
  
  if (state.active > 0) {
    state.active--;
  }
  
  if (!ok) {
    state.circuit.failures++;
    state.circuit.lastFailureAt = Date.now();
    
    if (state.circuit.failures >= config.failThreshold) {
      state.circuit.isOpen = true;
      console.warn(`⚠️ [GATE] Circuit ${key} OPENED: ${state.circuit.failures} failures >= ${config.failThreshold} threshold`);
    }
  } else {
    if (state.circuit.failures > 0) {
      state.circuit.failures = Math.max(0, state.circuit.failures - 1);
    }
  }
  
  while (state.waiting.length > 0 && state.active < config.maxConcurrency) {
    const waiter = state.waiting.shift();
    if (waiter) {
      waiter.resolve();
    }
  }
}

// ========== END INLINED: ProviderGate ==========

// ============= PERFECT AI VISUAL SCENE CREATOR WITH CHARACTER CONSISTENCY =============
// Complete implementation with word-for-word OpenAI prompts and CharacterConsistencyService integration

// Emergency hair fallback - skin-tone-specific defaults (NO "lighter"/"darker" - only pale/light/medium/olive/dark)
function emergencyHairFallback(skinTone: string): string {
  const normalized = (skinTone || 'medium').toLowerCase();
  const EMERGENCY_HAIR_MAP: Record<string, string> = {
    'pale': 'red hair',
    'light': 'blonde hair',
    'medium': 'brown hair',
    'olive': 'dark brown hair',
    'dark': 'black textured 4C hair'
  };
  return EMERGENCY_HAIR_MAP[normalized] || EMERGENCY_HAIR_MAP['medium'];
}

// Character consistency service - Loaded conditionally for Direct Mode only
let characterConsistencyService = null;

// Local inline type for user info (replaces removed top-level import)
interface UserInfoLocal {
  name?: string;
  userName?: string;
  skinTone?: string;
  avatar?: { skinTone?: string };
  structuredAvatarData?: any;
  native_language?: string;
  nativeLanguage?: string;
}

// Generate complete visual schema using OpenAI with word-for-word prompts
async function generateCompleteVisualSchema(
  storyText: string, 
  userInfo: UserInfoLocal, 
  sessionId: string, 
  pageNumber: number = 1,
  inputStructuredAvatarData: any = null,
  mainCharacterAppearance: any = null,
  secondaryCharacters: any[] = []
): Promise<{ visualSchema: any; aiDebugSchema: any; structuredAvatarData: any }> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  // PRIORITY 1: Get complete structured avatar data from CharacterConsistencyService
  let structuredAvatarData = inputStructuredAvatarData || userInfo?.structuredAvatarData;
  let characterName = userInfo?.name || userInfo?.userName || 'child';
  let ethnicity = '';
  
  // If missing, generate complete structured avatar data using CharacterConsistencyService
  if (!structuredAvatarData) {
    try {
      // Two-tier fallback: _shared first, _vendor last resort
      let ccsModule;
      try {
        ccsModule = await import('../_shared/CharacterConsistencyService.js');
        console.log(`✅ [CCS_IMPORT_DM] _shared loaded`);
      } catch (sharedError) {
        console.warn(`⚠️ [CCS_IMPORT_DM] _shared failed, trying _vendor:`, sharedError);
        ccsModule = await import('../_vendor/CharacterConsistencyService.mjs');
        console.log(`✅ [CCS_IMPORT_DM] _vendor loaded (last resort)`);
      }
      
      characterConsistencyService = ccsModule.characterConsistencyService;
      structuredAvatarData = await characterConsistencyService.getStructuredAvatarData(sessionId, userInfo);
      console.log(`✅ Generated complete structuredAvatarData via CharacterConsistencyService:`, structuredAvatarData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`⚠️ CharacterConsistencyService unavailable, trying StaticDataCache fallback:`, errorMessage);
      
      // 3-Tier fallback: CCS → StaticDataCache → Hardcoded
      try {
        const { getHairBySkintone, getSkinBySkintone } = await import('../_shared/StaticDataCache.js');
        const skinTone = userInfo?.skinTone || userInfo?.avatar?.skinTone || 'medium';
        const hairColor = getHairBySkintone(skinTone, sessionId);
        const skinFeatures = getSkinBySkintone(skinTone, sessionId);
        
        structuredAvatarData = {
          resolvedSkinTone: skinTone,
          hairColor: hairColor || emergencyHairFallback(skinTone),
          skinFeatures: skinFeatures || 'medium skin tone with brown eyes',
          ethnicity: 'Euro-American',
          source: 'static_data_cache'
        };
        console.log(`✅ [AISCHEMA_FALLBACK] source=static_data_cache, hairColor=${structuredAvatarData.hairColor}`);
      } catch (staticError) {
        console.warn(`⚠️ StaticDataCache fallback failed, using hardcoded:`, staticError);
        const fallbackSkinTone = userInfo?.skinTone || userInfo?.avatar?.skinTone || 'medium';
        
        // CRITICAL: Derive ethnicity from skinTone, not hardcoded 'Euro-American'
        const ethnicityMap: Record<string, string> = {
          'pale': 'Euro-American',
          'light': 'Euro-American',
          'medium': 'Mediterranean',
          'olive': 'Middle Eastern',
          'dark': 'African'
        };
        const derivedEthnicity = ethnicityMap[fallbackSkinTone] || 'Euro-American';
        
        const avatarType = userInfo?.avatar?.type || 'girl';
        structuredAvatarData = {
          resolvedSkinTone: fallbackSkinTone,
          hairColor: characterConsistencyService 
            ? characterConsistencyService.getHair(fallbackSkinTone, sessionId, derivedEthnicity, avatarType)
            : emergencyHairFallback(fallbackSkinTone),
          skinFeatures: characterConsistencyService
            ? characterConsistencyService.getSkinFeatures(fallbackSkinTone, sessionId)
            : `${fallbackSkinTone} skin tone with brown eyes`,
          ethnicity: derivedEthnicity,
          source: 'hardcoded_fallback'
        };
        console.log(`✅ [AISCHEMA_FALLBACK] source=hardcoded, skinTone=${fallbackSkinTone}, ethnicity=${derivedEthnicity}, hairColor=${structuredAvatarData.hairColor}`);
      }
    }
  }

  // Extract ethnicity from structured data
  ethnicity = structuredAvatarData?.ethnicity || 'Euro-American';
  const nativeLanguage = userInfo?.native_language || userInfo?.nativeLanguage || 'en';
  
  // Build complete character data string for OpenAI including hair and skin features from structuredAvatarData
  const characterData = structuredAvatarData 
    ? `${characterName}, age ${userInfo?.age || structuredAvatarData?.age || 6}, ${structuredAvatarData.hairColor || emergencyHairFallback(structuredAvatarData.resolvedSkinTone || 'medium')}, ${structuredAvatarData.skinFeatures || 'medium skin tone'}, ${ethnicity} ethnicity`
    : `${characterName}, character appearance data from orchestrator`;
  
  console.log(`🔍 [HAIR_FALLBACK_TIER] Hair source: ${structuredAvatarData?.source || 'unknown'}, hairColor=${structuredAvatarData?.hairColor}`);
  
  console.log(`🎨 Complete character data for OpenAI:`, {
    characterName,
    hair: structuredAvatarData?.hairColor,
    skinFeatures: structuredAvatarData?.skinFeatures,
    ethnicity,
    fullString: characterData
  });
  // Retrieve previous page's primary scene for visual continuity
  let previousPrimaryScene = null;
  let previousVisualSchema = null;

  // Lazy-initialize supabaseClient before first use (vendor-first pattern)
  if (!supabaseClient) {
    try {
      const { createVendorFirstSupabaseClient } = await import('../_shared/resilientLoader.js');
      supabaseClient = await createVendorFirstSupabaseClient();
      console.log('✅ [SUPABASE] Vendor-first client initialized successfully');
    } catch (clientError) {
      console.error('❌ [SUPABASE] Client initialization failed:', clientError);
      throw new Error(`Supabase client unavailable: ${clientError.message}`);
    }
  }

  if (pageNumber > 1) {
    try {
      const { data: prevScene, error } = await supabaseClient
        .from('visual_details_cache')
        .select('detail_value, visual_elements')
        .eq('session_id', sessionId)
        .eq('detail_type', 'primary_scene')
        .eq('page_first_seen', pageNumber - 1)
        .maybeSingle();
      
      if (error) {
        console.warn(`⚠️ Failed to retrieve previous primary scene (non-fatal):`, error);
      } else if (prevScene) {
        previousPrimaryScene = prevScene.detail_value; // Full 1500-char primary scene
        previousVisualSchema = prevScene.visual_elements?.fullSchema || null;
        console.log(`✅ PREVIOUS_SCENE_LOADED: Retrieved from page ${pageNumber - 1}`);
      }
    } catch (error) {
      console.warn(`⚠️ Exception retrieving previous primary scene (non-fatal):`, error);
    }
  }
  const isNonEnglish = nativeLanguage && nativeLanguage !== 'en';
  
  // Build specific cultural enhancement instructions based on native language
  let culturalContext = '';
  if (isNonEnglish) {
    switch (nativeLanguage) {
      case 'fr':
        culturalContext = 'French cultural elements like Parisian parks near Eiffel Tower, Seine River waterfront scenes, charming café districts with outdoor seating, French gardens with lavender, elegant French architecture, boulangeries';
        break;
      case 'es':
        culturalContext = 'Spanish cultural settings like Mediterranean courtyards, colorful plazas with fountains, vibrant Hispanic neighborhoods, traditional Spanish architecture, sunny patios with potted plants, Spanish gardens';
        break;
      case 'zh':
        culturalContext = 'Chinese cultural elements like traditional gardens with bamboo, pagoda backgrounds, Chinese parks with stone bridges, cultural landmarks, lantern-lit scenes, traditional Chinese architecture';
        break;
      case 'ar':
        culturalContext = 'Middle Eastern cultural settings like desert oasis scenes, traditional Arabic architecture with geometric patterns, cultural landmarks, palm tree gardens, ornate archways';
        break;
      default:
        culturalContext = `${nativeLanguage} cultural context with authentic local settings and architecture`;
    }
  }

  // WORD-FOR-WORD OpenAI PROMPTS - Phase 1 (lines 625-678 and 682-694 from deprecated JS version)
  const systemPrompt = `Generate a comprehensive visual scene description for children's story image generation. Create rich primary scenes (200-2000 characters preferred) with key actions, setting, character descriptions, and other visual details derived from story text with intelligent enhancements and inferences.

JSON RESPONSE:
{
  "primaryScene": "Character name, age X, (weave ethnicity in here) in rich, detailed visual scene description for image generation with main character description (verbatim hair and skin / features provided weaved in naturally), setting, key character actions OR character as observer/in background if action focuses on object/animal, any secondary characters including animals, atmosphere, and comprehensive visual details",
  "backgroundColor": "Background color description (e.g., 'warm golden forest light', 'cool blue sky', 'cozy indoor amber')",
  "lighting": "Lighting description (e.g., 'golden hour sunlight', 'soft morning light', 'magical twilight glow')",
  "composition": "Visual composition description (e.g., 'centered character with forest background', 'close-up with blurred garden')",
  "setting": "Location and environment (e.g., 'magical forest clearing', 'cozy bedroom', 'sunny playground')",
  "mood": "Emotional atmosphere (e.g., 'adventurous and curious', 'peaceful and content', 'excited and playful')",
  "style": "Artistic style (e.g., 'watercolor illustration', 'digital painting', 'children's book art')",
  "secondaryCharacters": {
    "humans": ["list of human characters mentioned in story (e.g., 'mom', 'friend', 'teacher')"],
    "pets": ["list of animals/pets mentioned in story (e.g., 'dog', 'cat', 'bird')"]
  },
  "objects": ["key props and objects in scene (e.g., 'ball', 'tree', 'flowers', 'toys')"]
}

RULES:
1. Story text priority: absolute driver - never contradict visual details
2. Main action extraction: focus on most visually significant action from story text
3. Character appearance: use provided appearance data VERBATIM (word-for-word ethnicity, hair, skin tone) but weave it naturally into flowing prose using connecting phrases like "with her" or "who has" - NEVER simplify core appearance details
4. Character poses and positioning: infer body positions from story actions ('wakes up' = sitting up in bed with arms stretched, 'runs' = dynamic running pose, 'reads' = sitting/lying with book, 'looks up' = head tilted upward, 'plays' = active engaging pose)
5. Singular/plural intelligence: "a bird" = 1 bird, "the bird" = 1 bird, "birds" = 2-4 birds, "many/lots of birds" = 5+ birds
6. Extract secondary characters: HUMANS (mom, dad, friend, teacher, people), PETS (household animals like dog, cat), ANIMAL CHARACTERS (talking animals, fantasy creatures with speaking roles in the story)
7. Atmospheric details: infer time of day, weather, indoor/outdoor context from story
8. Visual continuity on pages 2+: CRITICAL - maintain exact visual consistency from PREVIOUS SCENE:
   - Object persistence: if previous scene mentions "pink backpack", current scene MUST show "pink backpack" when story references "it" or "the backpack"
   - Clothing consistency: if previous scene shows "blue shirt", character keeps "blue shirt" unless story explicitly says they changed
   - Pronoun resolution: "it", "them", "her toy" MUST match objects/characters from previous scene
   - Scene element maintenance: if previous scene was "sunny park", continue "sunny park" unless story changes location
   - Color memory: NEVER change colors ("red ball" stays "red ball", "green jacket" stays "green jacket")
   
   CORRECT EXAMPLE:
   Previous: "Sarah, age 6, with brown curly hair and medium skin tone, holds a pink backpack in a sunny park"
   Current Story: "Sarah walked with it to the playground"
   Current Scene: "Sarah, age 6, with brown curly hair and medium skin tone, walks confidently carrying her pink backpack through the sunny park toward the playground"
   
    WRONG EXAMPLE:
    Previous: "pink backpack"
    Current Story: "walked with it"
    Current Scene: "walks with a blue bag" ❌ (color changed)
9. Main character presence in ALL scenes (children's story requirement): ALWAYS include the main character in EVERY scene for visual continuity
   - If story text explicitly mentions character doing an action: character is PRIMARY FOCUS of scene
   - If story text focuses on object/animal WITHOUT mentioning character (e.g., "The dog jumps", "The ball rolls"): position main character as OBSERVER or in BACKGROUND watching/near the action
   - Example: Story says "The bird flies away" → Scene: "Sarah, age 6, with brown curly hair, watches from the garden as a small bird flies away into the blue sky"
   - Example: Story says "The toy car zooms across the floor" → Scene: "Jake, age 5, with short black hair, sits nearby on the floor smiling as his red toy car zooms across the wooden floor"
   - NEVER generate a scene without the main character visible - they must always be present for children's story continuity

PHASE 1 ENHANCEMENT - MAIN CHARACTER APPEARANCE:
- If mainCharacterAppearance physical features are provided (e.g., 'brown eyes', 'curly hair'), incorporate them into the scene description
- If mainCharacterAppearance clothing is provided (e.g., 'blue shirt', 'red sneakers'), ensure they're visible in the scene

PHASE 1 ENHANCEMENT - SECONDARY CHARACTER VISUALS:
- If secondary characters have visualDetails (e.g., ['blonde', 'tall', 'blue dress']), incorporate these descriptors into their appearance in the scene
- Use visualDetails to create consistent appearances for recurring secondary characters across pages

CULTURAL CONTEXT:
${isNonEnglish ? `
CRITICAL: Enhance story settings with specific cultural elements for ${nativeLanguage} speakers:
${culturalContext}

EXAMPLE: For a French speaker named Sarah playing in a park, generate:
"Sarah with ${structuredAvatarData?.hairColor || 'natural hair'} and ${structuredAvatarData?.resolvedSkinTone || 'medium'} skin tone plays joyfully in a charming Parisian park near the Eiffel Tower, with the Seine River visible in the background, surrounded by elegant French gardens with lavender and a quaint café district with outdoor seating. Warm, sophisticated European aesthetic with golden afternoon light."

Use cultural detail naturally without contradicting explicit story settings.` : '- Use universal child-friendly settings with warm, inviting atmospheres'}`;

  const userPrompt = `Create a visual scene description for this story page.

CHARACTER APPEARANCE: ${characterData}

${mainCharacterAppearance ? `
MAIN CHARACTER APPEARANCE DETAILS:
- Physical features: ${JSON.stringify(mainCharacterAppearance.physicalFeatures || [])}
- Clothing: ${JSON.stringify(mainCharacterAppearance.clothing || [])}
` : ''}

${secondaryCharacters && secondaryCharacters.length > 0 ? `
SECONDARY CHARACTERS WITH VISUAL DETAILS:
${secondaryCharacters.map(char => 
  `- ${char.name} (${char.type}): ${char.visualDetails ? char.visualDetails.join(', ') : 'no visual details'}`
).join('\n')}
` : ''}

STORY TEXT:
"${storyText}"

PREVIOUS SCENE (for visual consistency):
${previousPrimaryScene ? `
Primary Scene: "${previousPrimaryScene}"
${previousVisualSchema ? `
Additional Context:
- Background: ${previousVisualSchema.backgroundColor}
- Lighting: ${previousVisualSchema.lighting}
- Setting: ${previousVisualSchema.setting}
- Mood: ${previousVisualSchema.mood}
- Objects: ${previousVisualSchema.objects?.join(', ') || 'none'}
- Secondary Characters: ${JSON.stringify(previousVisualSchema.secondaryCharacters || {})}
` : ''}
` : 'None - this is the first scene'}

Generate a comprehensive scene with complete visual elements including background, lighting, composition, setting, mood, style, secondary characters (categorized as humans vs pets), and key objects. Maintain character and setting continuity while showcasing the current page's action. CRITICAL: The primaryScene must include the complete CHARACTER APPEARANCE string (ethnicity, hair, and skin tone) exactly as provided, word-for-word, you may not simplify it but you can enhance and weave it into the primary scene naturally. Place ethnicity after age.`;

  try {
    // Retry with jitter for 429/503 errors
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            max_tokens: 500,
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          // Check for retryable errors
          if (response.status === 429 || response.status === 503) {
            const retryAfter = response.headers.get('Retry-After');
            const delayMs = retryAfter 
              ? parseInt(retryAfter) * 1000 
              : Math.min(1000 * Math.pow(2, attempt), 8000) + Math.random() * 1000;
            
            lastError = new Error(`OpenAI API ${response.status}: ${response.statusText}`);
            if (attempt < 2) {
              console.warn(`⚠️ OpenAI ${response.status}, retrying in ${delayMs}ms`);
              await new Promise(resolve => setTimeout(resolve, delayMs));
              continue;
            }
          }
          throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        
        if (!content) {
          throw new Error('No content generated by OpenAI');
        }
        
        // Success - break retry loop
        lastError = null;

    // Parse JSON response
    let visualSchema;
    try {
      visualSchema = JSON.parse(content);
    } catch (parseError) {
      // If JSON parse fails, try to extract just primaryScene
      const primarySceneMatch = content.match(/"primaryScene":\s*"([^"]+)"/);
      if (primarySceneMatch && primarySceneMatch[1] && primarySceneMatch[1].length >= 30) {
        // Create minimal schema with just primaryScene
        visualSchema = {
          primaryScene: primarySceneMatch[1],
          backgroundColor: 'warm natural lighting',
          lighting: 'soft daylight',
          composition: 'centered character',
          setting: 'story scene',
          mood: 'cheerful and engaging',
          style: 'children\'s book illustration',
          secondaryCharacters: [],
          objects: []
        };
        console.log('✅ Extracted primaryScene from malformed JSON');
      } else {
        // Only fail if we can't get primaryScene at all
        throw new Error(`No usable primaryScene found in OpenAI response`);
      }
    }

    // Build AI Debug Schema for comprehensive debugging
    const aiDebugSchema = {
      modelUsed: 'gpt-4o-mini',
      systemPrompt: systemPrompt,
      userPrompt: userPrompt,
      characterDataSent: characterData, // Exact string sent to OpenAI
      structuredAvatarData: userInfo?.structuredAvatarData || null, // Use from userInfo if available
      rawUserInfoReceived: {
        hasStructuredAvatar: !!userInfo?.structuredAvatarData,
        avatarSkinTone: userInfo?.avatar?.skinTone,
        skinTone: userInfo?.skinTone,
        avatarHairColor: userInfo?.avatar?.hairColor,
        nativeLanguage: userInfo?.native_language || userInfo?.nativeLanguage,
        fullUserInfo: userInfo
      },
      storyTextLength: storyText.length,
      isNonEnglish: isNonEnglish,
      culturalContext: culturalContext
    };

    // PHASE 4: Retrieve cached secondary characters and enhance visual schema
    let cachedSecondaryCharacters: any[] = [];
    
    try {
      // Try _shared import first, fallback to _vendor
    let ccsModule;
    try {
      ccsModule = await import('../runware-generate-image/CharacterConsistencyServiceInline.js');
      console.log(`✅ [CCS_IMPORT_DM] inline loaded for secondary characters`);
    } catch (inlineError) {
      try {
        ccsModule = await import('../_shared/CharacterConsistencyService.js');
        console.log(`✅ [CCS_IMPORT_DM] _shared loaded for secondary characters (fallback)`);
      } catch (sharedError) {
        console.warn(`⚠️ [CCS_IMPORT_DM] _shared failed, trying _vendor:`, sharedError);
        ccsModule = await import('../_vendor/CharacterConsistencyService.mjs');
        console.log(`✅ [CCS_IMPORT_DM] _vendor loaded for secondary characters (last resort)`);
      }
    }
      
      const { characterConsistencyService } = ccsModule;
      cachedSecondaryCharacters = await characterConsistencyService.getSecondaryCharactersForSession(sessionId);
      console.log(`✅ [CDN_IMPORT_SUCCESS] Retrieved ${cachedSecondaryCharacters.length} cached secondary characters for session ${sessionId}`);
    } catch (error) {
      // Categorize import failure
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorCategory = errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')
        ? 'CDN_IMPORT_FAILURE'
        : errorMessage.includes('Cannot find module') || errorMessage.includes('not found')
        ? 'SERVICE_UNAVAILABLE'
        : 'IMPORT_ERROR';
      
      console.warn(`⚠️ [${errorCategory}] Failed to retrieve cached secondary characters:`, errorMessage);
    }
    
    // Merge OpenAI-detected and cached secondary characters
    const mergedSecondaryCharacters = {
      humans: [
        ...(visualSchema.secondaryCharacters?.humans || []),
        ...cachedSecondaryCharacters
          .filter(char => char.type !== 'animal' && char.type !== 'pet')
          .map(char => char.name)
      ],
      pets: [
        ...(visualSchema.secondaryCharacters?.pets || []),
        ...cachedSecondaryCharacters
          .filter(char => char.type === 'animal' || char.type === 'pet')
          .map(char => char.name)
      ]
    };

    // Enhance with structured avatar data and cached secondary characters
    const enhancedSchema = {
      ...visualSchema,
      // Add structured avatar data
      characterAppearance: structuredAvatarData,
      // Merge secondary characters from OpenAI and cache
      secondaryCharacters: mergedSecondaryCharacters,
      // Add detailed secondary character data for consistency (PHASE 1: includes visualDetails)
      secondaryCharacterDetails: cachedSecondaryCharacters,
      objects: visualSchema.objects || []
    };

        console.log('✅ Generated complete visual schema with character consistency');
        return { visualSchema: enhancedSchema, aiDebugSchema, structuredAvatarData };
        
      } catch (attemptError) {
        lastError = attemptError instanceof Error ? attemptError : new Error(String(attemptError));
        if (attempt === 2) break; // Last attempt
        // Add jitter before retry
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
      }
    }
    
    // All retries failed
    throw lastError || new Error('OpenAI generation failed after retries');

  } catch (error) {
    console.error('OpenAI generation failed:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`OpenAI visual scene generation failed: ${errorMessage}`);
  }
}

// Generate character seed - simplified for Scene-Only mode
function generateCharacterSeed(sessionId: string, userInfo: any) {
  const characterName = userInfo?.name || userInfo?.userName || 'child';
  const skinTone = userInfo?.avatar?.skinTone || userInfo?.skinTone || 'medium';
  const language = userInfo?.language || userInfo?.nativeLanguage || 'en';
  
  // Detect ethnicity using same logic as CCS
  let ethnicity = 'Euro-American';
  if (['hi', 'hi-IN'].includes(language)) ethnicity = 'Indian';
  else if (['zh', 'zh-CN'].includes(language)) ethnicity = 'Chinese';
  else if (['ar', 'ar-SA'].includes(language)) ethnicity = 'MENA region';
  else if (skinTone.toLowerCase() === 'dark') {
    if (['en', 'en-US'].includes(language)) ethnicity = 'African American';
    else if (language === 'es') ethnicity = 'Afro-Latino';
    else if (language === 'fr') ethnicity = 'Francophone African';
    else if (language === 'pt') ethnicity = 'Afro-Brazilian';
  } else {
    if (language === 'fr') ethnicity = 'French';
    else if (language === 'es') ethnicity = 'Spanish / Latino';
    else if (language === 'pt') ethnicity = 'Portuguese';
  }
  
  return {
    seed: Math.floor(Math.random() * 999999),
    characterName,
    avatarType: userInfo?.avatar?.type || 'child',
    skinTone,
    ethnicity,
    culturalProfile: userInfo?.nativeLanguage !== 'en' ? userInfo?.nativeLanguage : undefined
  };
}

// Call runware-template-cd for Direct Mode image generation
async function callRunwareTemplateCD(payload: any): Promise<string> {
  try {
    const response = await fetch('https://cpzeuogomaixamrtnnmj.supabase.co/functions/v1/runware-template-cd', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`runware-template-cd failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success || !result.imageURL) {
      throw new Error(`runware-template-cd failed: ${result.error || 'No image URL returned'}`);
    }

    return result.imageURL;
  } catch (error) {
    console.error('Direct Mode image generation failed:', error);
    throw error;
  }
}

// HTTP fallback for Supabase client failures
async function httpFallbackCall(endpoint: string, payload: any): Promise<any> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase configuration for HTTP fallback');
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serviceRoleKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`HTTP fallback failed: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

// Main request handler
serve(async (req) => {
  try {
  // Trigger CCS boot verification once (non-blocking)
  if (ccsBootStatus.loaded === false && ccsBootStatus.error === null) {
    verifyCCSBoot().catch(err => console.error('CCS boot verification failed:', err));
  }
  
  // Handle CORS preflight requests with dynamic header detection
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling CORS preflight with dynamic headers');
    return createDynamicCorsOptionsResponse(req);
  }

  console.log("✅ ai-visual-scene-creator: Successfully booted and reachable");

  // Health check endpoints
  if (req.method === 'HEAD' && req.url.includes('/health')) {
    return createDynamicCorsResponse(null, req, 200);
  }

  if (req.method === 'GET') {
    return createDynamicCorsResponse({ 
      status: 'healthy', 
      service: 'ai-visual-scene-creator',
      timestamp: new Date().toISOString()
    }, req, 200);
  }

  // Only allow POST for main functionality
  if (req.method !== 'POST') {
    return createDynamicCorsErrorResponse({ error: 'Method not allowed' }, req, 405);
  }

  // Feature flag check - declare outside try block for catch block scope
  const gatingEnabled = Deno.env.get('DISABLE_PROVIDER_GATE') !== 'true';
  
  // Hoist gate variables outside try block to prevent ReferenceError in catch block
  const gateKey = 'T1:ai-visual-scene-creator';
  let gateAcquired = false;
  let gateStartTime = Date.now();

  try {
    const requestId = `${Math.random().toString(36).substring(2)}`;
    console.log(`🚀 [${requestId}] ai-visual-scene-creator: POST ${req.url}`);
    
    // ============= PROVIDER GATE: Pre-call health check =============
    gateStartTime = Date.now();
    
    if (gatingEnabled) {
      const gateResult = await acquire(gateKey);
      
      if (!gateResult.acquired) {
        console.warn(`⚠️ [GATE] ${gateKey} denied: ${gateResult.reason} - proceeding in degraded mode (no blocking)`);
        // Don't return 503 - proceed in degraded mode
      } else {
        gateAcquired = true;
        console.log(`✅ [GATE] ${gateKey} acquired`);
      }
    } else {
      console.log(`⏭️ [GATE] Provider gating DISABLED via env flag`);
    }

    // Parse request payload
    let payload: any;
    try {
      payload = await req.json();
    } catch (error) {
      if (gatingEnabled && gateAcquired) release(gateKey, false);
      console.error(`❌ [${requestId}] Failed to parse JSON:`, error);
      return createDynamicCorsErrorResponse({
        error: 'Invalid JSON payload'
      }, req, 400);
    }

    // Validate required fields - enhanced content checking
    const content = payload.pageText || payload.storyText || payload.content || '';
    if (!content.trim()) {
      if (gatingEnabled && gateAcquired) release(gateKey, false);
      console.error(`❌ [${requestId}] Validation failure (no retry): MISSING_STORY_CONTENT`);
      return createDynamicCorsErrorResponse({
        error: 'MISSING_STORY_CONTENT',
        tier: 'VALIDATION_FAILED'
      }, req, 400);
    }

    const userInfo = payload.userInfo || {};
    const sessionId = payload.sessionId || `session-${requestId}`;
    const pageNumber = payload.pageNumber || 1;
    const directMode = payload.directMode === true;
    
    // PHASE 1 FIX: Extract appearance data from payload for character consistency
    const mainCharacterAppearance = payload.mainCharacterAppearance || null;
    const secondaryCharacters = payload.secondaryCharacters || [];

    console.log(`✅ [${requestId}] Payload validated - Direct Mode: ${directMode}`);

    // ============= TIER 2 CCS STANDARDIZATION: ADD MISSING CORE METHODS =============
    let enhancedCharacterSeed = null;
    let detectedAllCharacters = null;
    let neverEndingSetting = "";
    
    try {
      let ccsImportResult;
      try {
        ccsImportResult = await import('../runware-generate-image/CharacterConsistencyServiceInline.js');
      } catch (inlineError) {
        try {
          ccsImportResult = await import('../_shared/CharacterConsistencyService.js');
        } catch (sharedError) {
          ccsImportResult = await import('../_vendor/CharacterConsistencyService.mjs');
        }
      }
      const { characterConsistencyService } = ccsImportResult;
      
      // Get enhanced character seed with graceful fallback (CCS CORE METHOD)
      const characterName = userInfo?.name || userInfo?.userName || 'child';
      const avatarIdentity = {
        name: characterName,
        type: userInfo?.avatar?.type || 'child',
        skinTone: userInfo?.avatar?.skinTone || userInfo?.skinTone || 'medium'
      };
      
      try {
        enhancedCharacterSeed = await characterConsistencyService.getEnhancedCharacterSeed(
          sessionId,
          avatarIdentity,
          content,
          'continuing'
        );
        console.log(`🔍 [${requestId}] [TIER_2] getEnhancedCharacterSeed: SUCCESS`);
      } catch (enhancedError) {
        console.warn(`⚠️ [${requestId}] [TIER_2] getEnhancedCharacterSeed: FAILED, using basic fallback`);
        try {
          enhancedCharacterSeed = await characterConsistencyService.getBasicCharacterSeed(avatarIdentity, sessionId);
          console.log(`🔍 [${requestId}] [TIER_2] getBasicCharacterSeed: SUCCESS (fallback)`);
        } catch (basicError) {
          console.warn(`⚠️ [${requestId}] [TIER_2] getBasicCharacterSeed: FAILED (graceful)`, basicError.message);
        }
      }

      // Detect all characters (CCS CORE METHOD)
      try {
        detectedAllCharacters = await characterConsistencyService.detectAllCharacters(content, {
          sessionId,
          pageNumber,
          userInfo
        });
        console.log(`🔍 [${requestId}] [TIER_2] detectAllCharacters: SUCCESS`, {
          secondaryCount: detectedAllCharacters?.secondaryCharacters?.length || 0
        });
      } catch (detectError) {
        console.warn(`⚠️ [${requestId}] [TIER_2] detectAllCharacters: FAILED (graceful)`, detectError.message);
      }

      // Get never-ending story setting (CCS CORE METHOD)
      try {
        neverEndingSetting = await characterConsistencyService.getSessionSetting(sessionId, "never_ending_story") || "";
        console.log(`🔍 [${requestId}] [TIER_2] getSessionSetting: SUCCESS`, { neverEndingSetting });
      } catch (settingError) {
        console.warn(`⚠️ [${requestId}] [TIER_2] getSessionSetting: FAILED (graceful)`, settingError.message);
      }
    } catch (ccsImportError) {
      console.warn(`⚠️ [${requestId}] [TIER_2] CCS Import FAILED (graceful) - all 3 methods unavailable:`, ccsImportError.message);
    }
    // ============= END TIER 2 CCS STANDARDIZATION =============
    
    // ============= IDEMPOTENCY: Coalesce duplicate requests (OPTIONAL) =============
    let IdempotencyMemory: any;
    try {
      IdempotencyMemory = await import("../_shared/IdempotencyMemory.js");
      console.log(`✅ [${requestId}] IdempotencyMemory loaded`);
    } catch (idempotencyError) {
      console.warn(`⚠️ [${requestId}] IdempotencyMemory unavailable, proceeding without deduplication:`, idempotencyError.message);
      // Minimal fallback stub
      IdempotencyMemory = {
        generateKey: (parts: any) => JSON.stringify(parts),
        getOrRun: async (key: string, ttlMs: number, fn: () => Promise<any>) => {
          console.log(`⏭️ [${requestId}] Idempotency bypassed (module unavailable)`);
          return await fn();
        }
      };
    }
    
    const idempotencyKey = IdempotencyMemory.generateKey({
      sessionId,
      pageNumber: pageNumber || 1,
      operationName: 'ai-visual-scene',
      promptSignature: content ? content.substring(0, 100) : ''
    });

    // Wrap main logic in idempotency cache
    const result = await IdempotencyMemory.getOrRun(idempotencyKey, 30000, async () => {
      let operationSuccess = false;
      
      try {
        // CRITICAL FIX: Declare structuredAvatarData in function scope
        let structuredAvatarData: any = null;

    // PHASE 1 & 2: Generate complete visual schema with character consistency
    console.log(`🎨 [${requestId}] Generating complete visual schema...`);
    let visualSchema: any;
    let aiDebugSchema: any;
    
    try {
      const result = await generateCompleteVisualSchema(
        content, 
        userInfo, 
        sessionId, 
        pageNumber, 
        structuredAvatarData,
        mainCharacterAppearance,
        secondaryCharacters
      );
      visualSchema = result.visualSchema;
      aiDebugSchema = result.aiDebugSchema;
      structuredAvatarData = result.structuredAvatarData;
      console.log(`✅ [${requestId}] Visual schema generated successfully`);
    } catch (schemaError) {
      const errorMessage = schemaError instanceof Error ? schemaError.message : String(schemaError);
      console.error(`❌ [${requestId}] Visual schema generation failed:`, errorMessage);
      return {
        success: false,
        error: `Visual schema generation failed: ${errorMessage}`,
        tier: 'SCHEMA_GENERATION_FAILED',
        httpStatus: 500
      };
    }

    // CRITICAL FIX: Import characterConsistencyService at main scope (non-fatal)
    let characterConsistencyService: any = null;
    let characterServiceAvailable = false;
    
    try {
      let importResult;
      try {
        importResult = await import('../runware-generate-image/CharacterConsistencyServiceInline.js');
        console.log(`✅ [${requestId}] CharacterConsistencyService loaded from inline`);
      } catch (inlineError) {
        try {
          importResult = await import('../_shared/CharacterConsistencyService.js');
          console.log(`✅ [${requestId}] CharacterConsistencyService loaded from _shared (fallback)`);
        } catch (sharedError) {
          importResult = await import('../_vendor/CharacterConsistencyService.mjs');
          console.log(`✅ [${requestId}] CharacterConsistencyService loaded from _vendor (last resort)`);
        }
      }
      characterConsistencyService = importResult.characterConsistencyService;
      characterServiceAvailable = true;
    } catch (importError) {
      const errorMessage = importError instanceof Error ? importError.message : String(importError);
      console.warn(`⚠️ [${requestId}] CharacterConsistencyService unavailable (non-fatal):`, errorMessage);
      characterServiceAvailable = false;
    }

    // DIRECT MODE ONLY: After primary scene generation, analyze visual details
    if (directMode && characterServiceAvailable && characterConsistencyService) {
      try {
        const characterName = userInfo?.name || userInfo?.userName || 'Child';
        await characterConsistencyService.analyzeVisualDetails(
          sessionId,
          visualSchema.primaryScene,
          pageNumber,
          characterName
        );
        console.log(`✅ [${requestId}] ANALYSIS_APPLIED: Visual details analyzed and cached for page ${pageNumber}`);
      } catch (error) {
        console.warn(`⚠️ [${requestId}] Failed to analyze visual details (non-fatal):`, error);
      }

      // Save current primary scene with rolling 2-page window cleanup
      try {
        const characterName = userInfo?.name || userInfo?.userName || 'Child';
        
        // Step 1: Delete old primary scenes (keep only last 2 pages)
        const { error: deleteError } = await supabaseClient
          .from('visual_details_cache')
          .delete()
          .eq('session_id', sessionId)
          .eq('detail_type', 'primary_scene')
          .lt('page_first_seen', pageNumber - 1);
        
        if (deleteError) {
          console.warn(`⚠️ Failed to cleanup old primary scenes (non-fatal):`, deleteError);
        } else {
          console.log(`🧹 CLEANUP: Removed primary scenes older than page ${pageNumber - 1}`);
        }
        
        // Step 2: Insert current page's primary scene with full schema backup
        const { error: insertError } = await supabaseClient
          .from('visual_details_cache')
          .insert({
            session_id: sessionId,
            character_name: characterName,
            detail_type: 'primary_scene',
            detail_key: `page_${pageNumber}`,
            detail_value: visualSchema.primaryScene, // Full 1500-char primary scene
            page_first_seen: pageNumber,
            page_last_seen: pageNumber,
            visual_elements: {
              storyText: storyText.substring(0, 200),
              pageNumber,
              timestamp: new Date().toISOString(),
              fullSchema: {
                backgroundColor: visualSchema.backgroundColor,
                lighting: visualSchema.lighting,
                composition: visualSchema.composition,
                setting: visualSchema.setting,
                mood: visualSchema.mood,
                style: visualSchema.style,
                secondaryCharacters: visualSchema.secondaryCharacters,
                objects: visualSchema.objects
              }
            }
          });
        
        if (insertError) {
          console.warn(`⚠️ Failed to save primary scene (non-fatal):`, insertError);
        } else {
          console.log(`💾 PRIMARY_SCENE_SAVED: Page ${pageNumber} stored for continuity`);
        }
      } catch (error) {
        console.warn(`⚠️ Exception during primary scene storage (non-fatal):`, error);
      }
    }

    // ARCHITECTURE FIX: Character generation only for Direct Mode
    // Scene-Only mode returns ONLY primaryScene to orchestrator
    // Orchestrator is responsible for character consistency via CharacterConsistencyService
    
    let characterSeed: any = null;
    let culturalBundle: any = null;

    if (directMode) {
      // DIRECT MODE ONLY: Generate character seed and cultural bundle
      console.log(`🎨 [${requestId}] Direct Mode: Generating initial character descriptor with 2-tier fallback`);
      
      // Generate character seed for consistency
      characterSeed = await generateCharacterSeed(sessionId, userInfo);

      // Generate culturalBundle using CharacterConsistencyService with aligned sessionId
      if (characterServiceAvailable && characterConsistencyService) {
        try {
          culturalBundle = await characterConsistencyService.getCulturalEnhancements(
            userInfo, 
            sessionId, 
            sessionId // Use sessionId directly for alignment with other character data
          );
          console.log(`✅ [${requestId}] INITIAL_DESCRIPTOR_SOURCE: CharacterConsistencyService (inlined)`);
        } catch (tier1Error) {
          console.warn(`⚠️ [${requestId}] CharacterConsistencyService.getCulturalEnhancements failed, trying StaticDataCache`, tier1Error);
          characterServiceAvailable = false;
        }
      }
      
      // 3-Tier fallback: CCS → StaticDataCache → Hardcoded
      if (!culturalBundle) {
        try {
          console.log(`🔄 [${requestId}] Trying StaticDataCache for cultural bundle (Tier 2)`);
          const { getHairBySkintone, getSkinBySkintone } = await import('../_shared/StaticDataCache.js');
          const skinTone = userInfo?.avatar?.skinTone || userInfo?.skinTone || 'medium';
          const nativeLanguage = userInfo?.native_language || userInfo?.nativeLanguage || 'en';
          const hairColor = getHairBySkintone(skinTone, sessionId);
          const skinFeatures = getSkinBySkintone(skinTone, sessionId);
          
          // Standardized ethnicity detection: dark skin + afro heritage languages (en, es, fr, pt)
          const isAfricanAmerican = (skinTone === 'dark') && ['en', 'en-US', 'es', 'fr', 'pt'].includes(nativeLanguage);
          
          culturalBundle = {
            hair: hairColor || (isAfricanAmerican ? 'photorealistic detailed textured 4C African American hairstyle' : 'brown hair'),
            features: skinFeatures || (isAfricanAmerican ? 'authentic African American features' : 'diverse features'),
            profile: characterSeed?.culturalProfile || null,
            source: 'static_data_cache'
          };
          console.log(`✅ [${requestId}] [CULTURAL_BUNDLE_FALLBACK] source=static_data_cache`);
        } catch (staticError) {
          console.log(`🔄 [${requestId}] StaticDataCache failed, using emergency hardcoded (Tier 3)`);
          const skinTone = userInfo?.avatar?.skinTone || userInfo?.skinTone || 'medium';
          const nativeLanguage = userInfo?.native_language || userInfo?.nativeLanguage || 'en';
          
          // Standardized ethnicity detection: dark skin + afro heritage languages (en, es, fr, pt)
          const isAfricanAmerican = (skinTone === 'dark') && ['en', 'en-US', 'es', 'fr', 'pt'].includes(nativeLanguage);
          
          culturalBundle = {
            hair: isAfricanAmerican ? 'photorealistic detailed textured 4C African American hairstyle' : userInfo?.avatar?.hairColor || 'brown hair',
            features: isAfricanAmerican ? 'authentic African American features' : 'diverse features',
            profile: characterSeed?.culturalProfile || null,
            source: 'emergency_hardcoded'
          };
          console.log(`✅ [${requestId}] [CULTURAL_BUNDLE_FALLBACK] source=hardcoded`);
        }
      }
    } else {
      // Fallback for Scene-Only mode without orchestrator bundle
      culturalBundle = {
        hair: userInfo?.avatar?.hairColor || 'natural hair',
        features: userInfo?.nativeLanguage !== 'en' ? `${userInfo.nativeLanguage} cultural features` : 'diverse features',
        profile: characterSeed?.culturalProfile || null,
        source: 'minimal_fallback'
      };
    }

    // Get colored objects string from visual schema
    let coloredObjects = visualSchema.coloredObjects || '';

    // PHASE 3: Handle Direct Mode vs Scene-Only Mode
    let imageURL: string | undefined;
    let tier: string;
    let runwareDebugData: any = {};

    if (directMode) {
      console.log(`🖼️ [${requestId}] Direct Mode: Full character processing with service`);
      
      // DIRECT MODE: Get character appearance and colored objects from service
      let characterAppearance: string | null = null;
      
      if (characterServiceAvailable && characterConsistencyService) {
        try {
          characterAppearance = await characterConsistencyService.getCharacterAppearanceFromStory(sessionId, characterSeed?.characterName || 'child');
          const serviceColoredObjects = await characterConsistencyService.getColoredObjects(sessionId);
          if (serviceColoredObjects) {
            coloredObjects = serviceColoredObjects;
          }
          console.log(`✅ [${requestId}] Character data retrieved from service`);
        } catch (error) {
          console.warn(`⚠️ [${requestId}] Failed to retrieve character data from service (non-fatal):`, error);
        }
      } else {
        console.warn(`⚠️ [${requestId}] CharacterConsistencyService unavailable, using minimal fallback data`);
      }
      
      // Validate structuredAvatarData exists
      if (!structuredAvatarData) {
        console.error(`❌ [${requestId}] structuredAvatarData missing, using emergency fallback`);
        structuredAvatarData = {
          resolvedSkinTone: 'medium',
          assignedHairColor: 'brown hair',
          skinFeatures: 'medium skin tone with brown eyes',
          ethnicity: 'Euro-American',
          source: 'emergency_fallback'
        };
      }
      
      console.log(`✅ [${requestId}] Using structuredAvatarData:`, {
        hairColor: structuredAvatarData?.assignedHairColor,
        skinTone: structuredAvatarData?.resolvedSkinTone,
        ethnicity: structuredAvatarData?.ethnicity,
        source: structuredAvatarData?.source
      });
      
      // Prepare payload for runware-template-cd with character consistency data
      const templatePayload = {
        pageText: content,
        userInfo,
        sessionId,
        pageNumber,
        avatarIdentity: {
          type: characterSeed.avatarType,
          skinTone: characterSeed.skinTone,
          name: characterSeed.characterName
        },
        templateComplexity: 'C', // Use Tier 2.5C for nuclear hardcoded template
        failedTierData: {
          enhancedSceneData: visualSchema.primaryScene,
          // Enhanced deduplication: avoid duplicating hair from culturalBundle
          characterConsistency: characterAppearance || `${characterSeed.characterName} is a ${characterSeed.avatarType}, age ${userInfo?.age || 6}${culturalBundle?.hair ? `, ${culturalBundle.hair}` : ''}${culturalBundle?.features ? `, ${culturalBundle.features}` : ''}`,
          visualConsistency: `${visualSchema.backgroundColor}, ${visualSchema.lighting}`,
          culturalEnhancements: `${culturalBundle.hair}, ${culturalBundle.features}`,
          structuredAvatarData // Always provide structured avatar data
        }
      };
      
      // runwareDebugData already declared at line 360 (outer scope)
      
      try {
        const response = await fetch('https://cpzeuogomaixamrtnnmj.supabase.co/functions/v1/runware-template-cd', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify(templatePayload)
        });

        if (!response.ok) {
          throw new Error(`runware-template-cd failed: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        
        if (!result.success || !result.imageURL) {
          throw new Error(`runware-template-cd failed: ${result.error || 'No image URL returned'}`);
        }

        imageURL = result.imageURL;
        
        // Capture Runware debug data for Direct Mode
        runwareDebugData = {
          positivePrompt: result.positivePrompt || result.debug?.positivePrompt,
          negativePrompt: result.negativePrompt || result.debug?.negativePrompt,
          templateUsed: result.templateUsed || 'runware-template-cd',
          templateComplexity: templatePayload.templateComplexity,
          templatePayloadSent: templatePayload
        };
        
        tier = 'DIRECT_MODE';
        console.log(`✅ [${requestId}] Direct Mode image generated successfully`);
      } catch (directError) {
        console.error(`❌ [${requestId}] Direct Mode failed, falling back to Scene-Only:`, directError);
        // Fall back to Scene-Only mode if Direct Mode fails
        tier = 'TIER_1_SCENE_ONLY';
      }
    } else {
      // ARCHITECTURE FIX: Scene-Only mode returns ONLY visual elements
      // NO CHARACTER DATA - orchestrator will handle character consistency
      console.log(`✅ [${requestId}] Scene-Only mode: Returning primaryScene and visual schema to orchestrator`);
      console.log(`🎯 [${requestId}] Orchestrator is responsible for CharacterConsistencyService calls`);
      tier = 'TIER_1_SCENE_ONLY';
    }

    // PHASE 4: Return complete orchestrator-expected schema
    const response = {
      success: true,
      tier,
      // Core visual schema from OpenAI
      primaryScene: visualSchema.primaryScene,
      enhancedPrompt: visualSchema.primaryScene, // enhancedPrompt = primaryScene for orchestrator
      negativePrompt: 'blurry, low quality, dark, scary, violent, inappropriate, adult content, text, watermarks',
      backgroundColor: visualSchema.backgroundColor,
      lighting: visualSchema.lighting,
      composition: visualSchema.composition,
      setting: visualSchema.setting,
      mood: visualSchema.mood,
      style: visualSchema.style,
      secondaryCharacters: visualSchema.secondaryCharacters || [],
      objects: visualSchema.objects || [],
      
      // ARCHITECTURE FIX: Character data only in Direct Mode
      ...(directMode && characterSeed && { characterSeed }),
      ...(directMode && culturalBundle && { culturalBundle }),
      ...(directMode && coloredObjects && { coloredObjects }),
      
      // CRITICAL FIX: Include structuredAvatarData in ALL modes for orchestrator
      ...(structuredAvatarData && { structuredAvatarData }),
      
      // Metadata for orchestrator
      templateStructure: directMode ? undefined : 'COMPLETE_TIER_1',
      detectedCharacters: visualSchema.detectedCharacters || [],
      
      // DEBUG: Full OpenAI request details for debugging
      aiDebugSchema,
      
      // DEBUG: Runware debug data (Direct Mode only) - Scene-Only mode doesn't have this
      ...(directMode && imageURL && runwareDebugData && { runwareDebugData }),
      
      // Image URL only in Direct Mode
      ...(imageURL && { imageURL }),
      
      // Processing metadata
      requestId,
      timestamp: new Date().toISOString(),
      processingTime: Date.now(),
      metadata: {
        ccsBootStatus: {
          loaded: ccsBootStatus.loaded,
          tier1: false,
          tier25: false,
          directMode: ccsBootStatus.loaded
        },
        sceneExtracted: !!visualSchema.primaryScene,
      }
    };

        console.log(`✅ [${requestId}] Response prepared:`, {
          tier: response.tier,
          hasPrimaryScene: !!response.primaryScene,
          hasImageURL: !!response.imageURL,
          secondaryCharacterCount: response.secondaryCharacters?.humans?.length || 0,
          objectCount: response.objects?.length || 0
        });

        operationSuccess = true;
        return response;
      } finally {
        // Release gate
        if (gatingEnabled && gateAcquired) {
          release(gateKey, operationSuccess);
          const gateElapsed = Date.now() - gateStartTime;
          console.log(`⏱️ [GATE] ${gateKey} released after ${gateElapsed}ms, success=${operationSuccess}`);
        }
      }
    });

    return createDynamicCorsResponse(result, req, result.httpStatus ?? 200);

  } catch (error) {
    // Ensure gate is released on error - wrap in try-catch to prevent cleanup errors from masking original error
    try {
      if (gatingEnabled && gateAcquired) {
        release(gateKey, false);
      }
    } catch (cleanupError) {
      console.warn('⚠️ Gate cleanup error (non-fatal):', cleanupError);
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('ai-visual-scene-creator error:', errorMessage);
    
    // Return error with dynamic CORS headers
    const isUpstreamError = errorMessage.includes('429') || errorMessage.includes('503') || errorMessage.includes('OpenAI');
    const status = isUpstreamError ? 503 : 500;
    
    return createDynamicCorsErrorResponse({
      error: errorMessage,
      tier: 'ERROR',
      retryAfterSeconds: isUpstreamError ? 5 : undefined
    }, req, status);
  } catch (outerError) {
    const outerMessage = outerError instanceof Error ? outerError.message : String(outerError);
    console.error('ai-visual-scene-creator top-level error:', outerMessage);
    return createDynamicCorsErrorResponse({
      error: outerMessage,
      tier: 'HANDLER_CRASH'
    }, req, 500);
  }
});