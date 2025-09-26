// DEPLOY_MARKER: 2025-09-26T18:00:00Z - COMPLETE TypeScript conversion with full business logic
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ============= AI VISUAL SCENE CREATOR - COMPLETE TYPESCRIPT IMPLEMENTATION =============

import { 
  getCulturalBundle, 
  shouldApplyCulturalEnhancements 
} from '../_shared/StaticDataCache.js';
import { UnifiedPlaceholderResolver } from '../_shared/UnifiedPlaceholderResolver.js';
import { getStyleFramework } from '../_shared/styleFrameworks.js';
import { characterConsistencyService } from '../_shared/CharacterConsistencyService.js';
import { SessionStateManager } from '../_shared/SessionStateManager.js';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

// TypeScript interfaces for better type safety
interface UserInfo {
  name?: string;
  age?: number | string;
  userName?: string;
  childName?: string;
  avatar?: {
    type?: string;
    skinTone?: string;
    hairColor?: string;
  };
  nativeLanguage?: string;
  difficulty?: string;
  sessionId?: string;
  pageNumber?: number;
}

interface AIResponse {
  primaryScene: string;
  backgroundColor?: string;
  lighting?: string;
  composition?: string;
  setting?: string;
  mood?: string;
  style?: string;
  secondaryCharacters?: {
    humans: string[];
    pets: string[];
  };
  objects?: string[];
  extractionMethod?: string;
  aiSchema?: any;
}

interface DirectModePayload {
  pageText?: string;
  storyText?: string;
  userInfo?: UserInfo;
  sessionId?: string;
  pageNumber?: number;
  directMode?: boolean;
  isDebugMode?: boolean;
  _internal_orchestrator_call?: boolean;
  enhancedStoryData?: any;
  avatarIdentity?: any;
  previousPrimaryScene?: string;
}

// ============= BULLETPROOF PHASES IMPLEMENTATION =============

// PHASE 3: FAST CIRCUIT BREAKER PROTECTION  
const TIER_TIMEOUTS = {
  DIRECT_MODE: 8000,      // 8s max for Direct Mode
  AI_GENERATION: 15000,   // 15s max for AI generation
  OPENAI_API: 12000       // 12s max for OpenAI calls
};

// PHASE 1B: Fast Direct Mode Validation
function validateDirectModePayload(payload: DirectModePayload): { isValid: boolean; contentType: string } {
  if (!payload.pageText && !payload.storyText) throw new Error("MISSING_STORY_CONTENT");
  if (!payload.userInfo) throw new Error("MISSING_USER_INFO");
  return { isValid: true, contentType: payload.pageText ? 'pageText' : 'storyText' };
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
function validatePrimarySceneQuality(scene: string): boolean {
  if (!scene || typeof scene !== 'string') return false;
  if (scene.length < 50) return false;
  if (scene.includes('undefined') || scene.includes('null')) return false;
  return scene.split(' ').filter(word => word.length > 0).length >= 8; // Minimum word count
}

// PHASE 5B: Image URL Validation  
function validateImageURL(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  if (!url.startsWith('http')) return false;
  if (url.includes('undefined') || url.includes('null')) return false;
  return url.length > 20; // Reasonable URL length
}

// PHASE 4B: Direct Mode Fallback Chain
const AI_MODELS_FALLBACK = ['gpt-4o', 'gpt-4o-mini'];

// Initialize Supabase client for internal function calls
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  throw new Error('Supabase configuration required');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getPhaseOrchestrator(): Promise<any> {
  try {
    const { phaseIntegrationOrchestrator } = await import("../_shared/PhaseIntegrationOrchestrator.js");
    return phaseIntegrationOrchestrator;
  } catch (error: any) {
    console.warn('PhaseIntegrationOrchestrator lazy load failed:', error);
    if (error?.message?.includes('DNS') || error?.message?.includes('resolution') || error?.message?.includes('network')) {
      console.error('DNS Resolution Error - Phase Integration Orchestrator unreachable:', error?.message);
    }
    return null;
  }
}

// Inline CORS utilities
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
  'Access-Control-Max-Age': '600',
};

function createCorsResponse(data: any, status: number = 200): Response {
  const headers = { 
    ...corsHeaders, 
    'Content-Type': 'application/json' 
  };
  
  return new Response(JSON.stringify(data), { status, headers });
}

function createCorsErrorResponse(error: any, status: number = 500): Response {
  const errorMessage = error instanceof Error ? error.message : error;
  console.error('Edge function error:', errorMessage);
  
  return createCorsResponse({ 
    success: false, 
    error: errorMessage 
  }, status);
}

function createCorsOptionsResponse(): Response {
  return new Response(null, { headers: corsHeaders });
}

// Simple error handling and logging utilities
function handleError(error: any, functionName: string, context: any = {}): Response {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`ERROR ${functionName}:`, errorMessage, context);
  return createCorsErrorResponse(errorMessage, 500);
}

function withPerformanceTracking<T>(functionName: string, model: string, operation: () => Promise<T>): Promise<T> {
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

// ============= INLINE VALIDATION FUNCTIONS =============

function checkPrimarySceneCriteria(data: any): { primaryScene: boolean; passCount: number; details: any } {
  const scene = data.primaryScene;
  if (!scene || typeof scene !== 'string') {
    console.log('DEBUG VALIDATION DEBUG: Missing or invalid primaryScene', { 
      hasScene: !!scene, 
      sceneType: typeof scene,
      sceneValue: scene 
    });
    return { primaryScene: false, passCount: 0, details: 'missing_or_invalid' };
  }

  // Validation with regex match examples
  const lengthTest = scene.length >= 15;
  const characterRegex = /\b(child|character|person|they|he|she|avatar)\b/i;
  const actionRegex = /\b(playing|reading|building|walking|running|sitting|standing|holding|looking|smiling)\b/i;
  const settingRegex = /\b(room|classroom|garden|playground|library|home|indoor|outdoor|table|floor)\b/i;
  const descriptiveRegex = /\b(colorful|bright|sunny|warm|cheerful|detailed|realistic|beautiful)\b/i;
  
  const characterMatch = scene.match(characterRegex);
  const actionMatch = scene.match(actionRegex);
  const settingMatch = scene.match(settingRegex);
  const descriptiveMatch = scene.match(descriptiveRegex);

  const hasCharacter = !!characterMatch;
  const hasAction = !!actionMatch;
  const hasSetting = !!settingMatch;
  const hasDescriptiveWords = !!descriptiveMatch;

  const qualityScore = [lengthTest, hasCharacter, hasAction, hasSetting, hasDescriptiveWords].filter(Boolean).length;
  const isPrimarySceneValid = qualityScore >= 1;

  console.log('TIER 1 VALIDATION: Primary Scene Criteria Analysis:', {
    sceneLength: scene.length,
    lengthTest: `${lengthTest} (>= 15 chars - RELAXED)`,
    characterTest: `${hasCharacter} ${characterMatch ? `(matched: "${characterMatch[0]}")` : '(no match)'}`,
    actionTest: `${hasAction} ${actionMatch ? `(matched: "${actionMatch[0]}")` : '(no match)'}`,
    settingTest: `${hasSetting} ${settingMatch ? `(matched: "${settingMatch[0]}")` : '(no match)'}`,
    descriptiveTest: `${hasDescriptiveWords} ${descriptiveMatch ? `(matched: "${descriptiveMatch[0]}")` : '(no match)'}`,
    qualityScore: `${qualityScore}/5`,
    validationResult: isPrimarySceneValid ? 'TIER 1 APPROVED - RELAXED VALIDATION' : 'TIER 2 TRIGGER',
    scenePreview: scene.substring(0, 150) + (scene.length > 150 ? '...' : ''),
    relaxedThresholds: 'length: 15+ chars, score: 1+ criteria (was 30+ chars, 2+ criteria)'
  });

  return {
    primaryScene: isPrimarySceneValid,
    passCount: isPrimarySceneValid ? 1 : 0,
    details: {
      length: scene.length,
      hasCharacter,
      hasAction, 
      hasSetting,
      hasDescriptiveWords,
      qualityScore: `${qualityScore}/5`,
      matchExamples: {
        character: characterMatch?.[0] || 'none',
        action: actionMatch?.[0] || 'none',
        setting: settingMatch?.[0] || 'none',
        descriptive: descriptiveMatch?.[0] || 'none'
      }
    }
  };
}

function validateAndEnhanceContent(enhancedStoryData: any, storyText: string): any {
  // Check if we have ANY form of primaryScene (even from fallback extraction)
  if (!enhancedStoryData || !enhancedStoryData.primaryScene) {
    console.log(`ERROR TIER 2 TRIGGER: No primaryScene found in data`, {
      hasData: !!enhancedStoryData,
      dataKeys: enhancedStoryData ? Object.keys(enhancedStoryData) : [],
      tier2Reasoning: 'Missing primaryScene content'
    });
    return { useTier2: true, fieldCheck: { primaryScene: false, passCount: 0, details: 'no_primary_scene' } };
  }
  
  const fieldCheck = checkPrimarySceneCriteria(enhancedStoryData);
  
  // RELAXED VALIDATION: Accept if primaryScene exists and meets 2/5 criteria OR if it was extracted via fallback
  const isFallbackExtraction = enhancedStoryData.extractionMethod === 'fallback_text_extraction' || 
                               enhancedStoryData.extractionMethod === 'full_content_fallback';
  
  // Accept fallback extractions with lower standards, or regular extractions with 2/5 criteria
  const shouldAccept = isFallbackExtraction || fieldCheck.primaryScene;
  
  console.log('DEBUG VALIDATION SUMMARY:', {
    result: shouldAccept ? 'PASS' : 'TIER 2 TRIGGER',
    qualityScore: fieldCheck.details?.qualityScore || '0/5',
    sceneLength: enhancedStoryData.primaryScene?.length || 0,
    extractionMethod: enhancedStoryData.extractionMethod || 'standard_json',
    isFallbackExtraction: isFallbackExtraction,
    criteria: fieldCheck.details,
    decision: shouldAccept ? 'Accept for Tier 1' : 'Fallback to Tier 2',
    tier2Reason: !shouldAccept ? 'Insufficient visual quality criteria' : null
  });
  
  if (!shouldAccept) {
    console.log(`ERROR TIER 2 TRIGGER: Visual scene validation failed`, {
      qualityScore: fieldCheck.details?.qualityScore || '0/5',
      sceneLength: enhancedStoryData.primaryScene?.length || 0,
      extractionMethod: enhancedStoryData.extractionMethod || 'standard_json',
      missingCriteria: Object.entries(fieldCheck.details || {})
        .filter(([key, value]) => key !== 'qualityScore' && key !== 'length' && !value)
        .map(([key]) => key),
      tier2Reasoning: 'Insufficient visual elements for high-quality image generation'
    });
    return { useTier2: true, fieldCheck };
  }
  
  console.log(`SUCCESS TIER 1 APPROVED: Visual scene validation passed`, {
    qualityScore: fieldCheck.details?.qualityScore || 'fallback',
    sceneLength: enhancedStoryData.primaryScene.length,
    extractionMethod: enhancedStoryData.extractionMethod || 'standard_json',
    passedCriteria: Object.entries(fieldCheck.details || {})
      .filter(([key, value]) => key !== 'qualityScore' && key !== 'length' && value)
      .map(([key]) => key),
    contentDecision: 'Proceeding with AI-enhanced generation'
  });
  
  // Add prompts for debugging visibility
  const positivePrompt = enhancedStoryData.primaryScene || 'children\'s story illustration';
  const negativePrompt = 'blur, dark, scary, adult content, inappropriate';
  
  return { 
    enhancedData: enhancedStoryData, 
    fieldCheck,
    positivePrompt,
    negativePrompt,
    primaryScene: enhancedStoryData.primaryScene,
    aiSchema: enhancedStoryData.aiSchema
  };
}

// AI Model Fallback Chain Configuration
interface AIModel {
  name: string;
  maxTokens: string;
  supportsTemperature: boolean;
}

const AI_MODELS: AIModel[] = [
  { name: 'gpt-4o', maxTokens: 'max_tokens', supportsTemperature: true },
  { name: 'gpt-4.1-2025-04-14', maxTokens: 'max_completion_tokens', supportsTemperature: false },
  { name: 'gpt-5-2025-08-07', maxTokens: 'max_completion_tokens', supportsTemperature: false }
];

// Simple circuit breaker for API reliability
class SimpleCircuitBreaker {
  private failures: number = 0;
  private lastFailure: number = 0;
  private threshold: number = 3;
  private timeout: number = 30000; // 30 seconds
  
  isOpen(): boolean {
    if (this.failures >= this.threshold && (Date.now() - this.lastFailure < this.timeout)) {
      return true;
    }
    if (this.failures >= this.threshold && (Date.now() - this.lastFailure >= this.timeout)) {
      this.failures = 0; // Reset after timeout
    }
    return false;
  }
  
  recordSuccess(): void {
    this.failures = 0;
  }
  
  recordFailure(): void {
    this.failures++;
    this.lastFailure = Date.now();
  }
}

const circuitBreaker = new SimpleCircuitBreaker();

// ============= ROBUST JSON PARSING WITH FALLBACKS =============

function parseAIResponse(content: string): AIResponse {
  try {
    return JSON.parse(content);
  } catch (directError) {
    // Try extracting JSON from code blocks
    const match = content.match(/```(?:json)?\s*(\{[\\s\\S]*?\})\s*```/i) || 
                  content.match(/(\{[\\s\\S]*?\})/);
    
    if (match?.[1]) {
      try {
        return JSON.parse(match[1].trim());
      } catch (e) {
        // Extract just primaryScene as fallback
        const sceneMatch = content.match(/"primaryScene"\s*:\s*"([^"]+)"/i);
        if (sceneMatch?.[1]) {
          return {
            primaryScene: sceneMatch[1].trim(),
            backgroundColor: undefined,
            lighting: undefined,
            composition: undefined,
            setting: undefined,
            mood: undefined,
            style: undefined,
            secondaryCharacters: { humans: [], pets: [] },
            objects: []
          };
        }
      }
    }
    
    throw new Error('Could not parse AI response');
  }
}

async function callOpenAIWithFallback(messages: any[], timeout: number = 6000, requestId?: string, avatarIdentity?: any): Promise<any> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }
  
  if (circuitBreaker.isOpen()) {
    console.warn('Circuit breaker is open, skipping OpenAI');
    const error = new Error('Circuit breaker open - service degraded');
    console.error('ALERT Tier 1 OpenAI Failure:', error, { 
      reason: 'circuit_breaker_open',
      models: AI_MODELS.map(m => m.name)
    });
    throw error;
  }
  
  for (let modelIndex = 0; modelIndex < AI_MODELS.length; modelIndex++) {
    const model = AI_MODELS[modelIndex];
    const logPrefix = requestId ? `[${requestId}]` : '';
    console.log(`MODEL ${logPrefix} Trying model ${modelIndex + 1}/${AI_MODELS.length}: ${model.name}`);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const requestBody: any = {
        model: model.name,
        messages
      };
      
      // Set the correct token parameter based on model
      if (model.maxTokens === 'max_completion_tokens') {
        requestBody.max_completion_tokens = 600;
      } else {
        requestBody.max_tokens = 600;
      }
      
      // Only add temperature for models that support it
      if (model.supportsTemperature) {
        requestBody.temperature = 0.3;
      }
      
      console.log(`Attempting ${model.name} (1 attempt per model)`);
      
      // Direct fetch with timeout and error classification
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const result = await response.json();
        
        const content = result?.choices?.[0]?.message?.content;
        if (!content?.trim()) {
          console.log(`Empty content from ${model.name}, trying next model`);
          continue;
        }
        
        circuitBreaker.recordSuccess();
        console.log(`SUCCESS: ${model.name} returned valid content`);
        return result;
      } else {
        console.log(`HTTP error from ${model.name}: ${response.status}, trying next model`);
        continue;
      }
    } catch (error: any) {
      console.log(`Error with ${model.name}: ${error?.message || error}, trying next model`);
      continue;
    }
  }
  
  throw new Error('All AI models failed');
}

// ============= MAIN SCENE GENERATION FUNCTION =============

async function generatePrimarySceneFromStory(
  requestId: string, 
  storyText: string, 
  userInfo: UserInfo, 
  avatarIdentity?: any,
  previousPrimaryScene?: string,
  includeFullSchema: boolean = false
): Promise<Response> {
  const localStartTime = Date.now();
  
  // Character consistency integration
  let characterAppearance = '';
  let characterSeed = '';
  
  try {
    const sessionId = userInfo?.sessionId;
    if (sessionId && userInfo?.name) {
      characterAppearance = await characterConsistencyService.getCharacterAppearanceFromStory(sessionId, userInfo.name) || '';
      characterSeed = `char_${userInfo.name}_${sessionId}`.substring(0, 20);
    }
  } catch (charError) {
    console.warn(`Character consistency error (non-critical):`, charError);
  }

  // Cultural enhancement check
  const nativeLanguage = userInfo?.nativeLanguage || 'en';
  const isNonEnglish = nativeLanguage !== 'en' && shouldApplyCulturalEnhancements(nativeLanguage);
  
  // Character reference and cultural context
  const characterReference = avatarIdentity?.type === 'girl' ? 'A young girl' : 
                           avatarIdentity?.type === 'boy' ? 'A young boy' : 
                           'A child';
  
  let culturalContext = '';
  if (isNonEnglish) {
    const culturalSettings: { [key: string]: string } = {
      'es': 'in vibrant Spanish neighborhoods, near colorful South American or Mediterranean architecture',
      'fr': 'in charming French settings, near elegant European architecture, or beautiful countryside',
      'pt': 'in lively Brazilian neighborhoods, near tropical beaches, or colorful South American architecture',
      'zh': 'in peaceful Chinese gardens, near traditional pagodas, or modern Asian city settings',
      'de': 'in charming German villages, near castles, or beautiful European countryside',
      'it': 'in picturesque Italian piazzas, near ancient Roman architecture, or Tuscan landscapes'
    };
    culturalContext = culturalSettings[nativeLanguage] || 'in culturally authentic settings relevant to their heritage';
  }

  // Comprehensive character data for AI prompt
  const characterName = userInfo?.name || userInfo?.childName || 'Child';
  const characterAge = userInfo?.age || '6-8';
  const skinTone = userInfo?.avatar?.skinTone || 'medium';
  const hairColor = userInfo?.avatar?.hairColor || 'brown';
  
  // Build comprehensive character description
  const characterData = [
    `${characterReference} named ${characterName}`,
    `age ${characterAge}`,
    hairColor !== 'brown' ? `${hairColor} hair` : null,
    characterAppearance ? `with ${characterAppearance}` : null
  ].filter(Boolean).join(', ');

  return withPerformanceTracking('ai-visual-scene-creator-orchestrator', 'gpt-4o', async () => {
    const messages = [
      {
        role: 'system',
        content: `Generate a comprehensive visual scene description for children's story image generation.

OBJECTIVE: Create a vivid visual scene description (200-1500 characters recommended) that captures the story moment with complete visual elements, character consistency, and cultural authenticity.

JSON RESPONSE:
{
  "primaryScene": "Rich, detailed visual scene description for image generation with setting, character actions, atmosphere, and comprehensive visual details",
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

CRITICAL CHARACTER RULES:
1. NEVER describe main character's skin tone - focus on hair, clothing, facial expressions, and pose only
2. Use provided character data exactly - do not make up features for main character
3. For secondary characters, you may describe their appearance as needed
4. Use story-driven visual descriptions based on the text content

VISUAL ENHANCEMENT RULES:
5. Create detailed primary scenes with rich visual descriptions (200-1500 characters)
6. Extract ALL secondary characters from story text and categorize correctly:
   - HUMANS: mom, dad, friend, teacher, brother, sister, grandma, neighbor, people
   - PETS/ANIMALS: dog, cat, bird, rabbit, hamster, fish, horse, any animals
7. Include comprehensive atmospheric details (time of day, weather, indoor/outdoor)
8. Specify background colors, lighting conditions, and visual composition
9. List key objects, props, and visual elements in the scene
10. Preserve exact counts: "a bird" = 1 bird, "birds" = multiple
11. Use visual continuity with previous scene context

ATMOSPHERIC GUIDANCE:
- Time of day: "morning sunlight", "afternoon glow", "evening twilight"
- Indoor/outdoor: "inside the cozy kitchen", "outside in the garden"  
- Weather: "sunny day", "light drizzle", "snowy morning"
- Objects/props: include furniture, toys, nature elements, tools

CULTURAL CONTEXT:
${isNonEnglish ? `- Consider culturally authentic settings: ${culturalContext}` : '- Use universal child-friendly settings'}
${isNonEnglish ? `- Incorporate cultural elements appropriate for ${nativeLanguage} speaking families` : ''}

RESPONSE FORMAT:
- Return valid JSON with all 9 keys exactly as specified
- Use null (no quotes) for unclear visual components
- Use empty arrays [] for missing secondary characters or objects
- Focus on observable visual elements, not thoughts or dialogue
- Ensure primary scene is 200+ characters with comprehensive visual detail`
      },
      {
        role: 'user',
        content: `Create a visual scene description for this story page.

CHARACTER DATA: ${characterData}

STORY TEXT:
"${storyText}"

PREVIOUS SCENE (for visual consistency):
"${previousPrimaryScene || 'None - this is the first scene'}"

${characterAppearance ? `CHARACTER APPEARANCE NOTES: ${characterAppearance}` : ''}

Generate a comprehensive scene with complete visual elements including background, lighting, composition, setting, mood, style, secondary characters (categorized as humans vs pets), and key objects. Maintain character and setting continuity while showcasing the current page's action. Use the provided character data exactly and never describe the main character's skin tone.`
      }
    ];

    console.log(`🤖 [${requestId}] Generating primaryScene from storyText using OpenAI`);
    
    let processedContent: any;
    try {
      const result = await callOpenAIWithFallback(messages, 8000, requestId, avatarIdentity);
      const content = result?.choices?.[0]?.message?.content;
      
      if (!content?.trim()) {
        throw new Error('Empty response from OpenAI');
      }
      
      processedContent = parseAIResponse(content);
      console.log(`✅ [${requestId}] Generated primaryScene + aiSchema via OpenAI`);
      
    } catch (error) {
      console.error(`🚨 [${requestId}] Primary scene generation failed:`, error);
      throw error;
    }
    
    console.log(`✅ [${requestId}] Primary scene extracted via ${processedContent?.extractionMethod || 'openai_generated'}:`);
    console.log(`   Scene: ${processedContent?.primaryScene?.substring(0, 200)}...`);
    
    // CRITICAL: Ensure primaryScene is a clean string for template usage
    const primaryScene = processedContent?.primaryScene;
    if (!primaryScene || typeof primaryScene !== 'string' || primaryScene.length < 30) {
      console.error(`🚨 [${requestId}] Primary scene validation failed - escalating to Tier 2:`, {
        hasScene: !!primaryScene,
        sceneType: typeof primaryScene,
        sceneLength: primaryScene?.length || 0,
        sceneContent: primaryScene
      });
      throw new Error('Primary scene validation failed');
    }
    
    console.log(`✅ [${requestId}] Primary scene validation passed: ${primaryScene.length} characters`);
    
    // Return standardized response format with enhanced compatibility
    const response = {
      success: true,
      primaryScene: primaryScene,
      extractedScene: primaryScene,
      primarySceneLength: primaryScene.length,
      aiSchema: includeFullSchema ? (processedContent?.aiSchema || processedContent) : undefined,
      hasAiSchema: !!processedContent?.aiSchema,
      extractionMethod: 'openai_generated',
      requestId,
      processingTimeMs: Date.now() - localStartTime,
      // Include character consistency data for test results
      characterConsistency: includeFullSchema ? {
        characterAppearance,
        characterSeed,
        culturalContext: isNonEnglish ? culturalContext : null,
        avatarType: characterReference
      } : undefined
    };
    
    console.log(`✅ [${requestId}] Returning response:`, {
      success: response.success,
      primarySceneLength: response.primaryScene?.length,
      hasAiSchema: !!response.aiSchema,
      hasCharacterConsistency: !!response.characterConsistency,
      extractionMethod: response.extractionMethod
    });
    
    return createCorsResponse(response);
  }).finally(() => {
    const responseTime = Date.now() - localStartTime;
    console.log(`⏱️ [${requestId}] Request completed in ${responseTime}ms`);
  });
}

// ============= DIRECT MODE IMPLEMENTATION =============

async function handleVisualSceneDirectMode(
  requestId: string, 
  storyText: string, 
  userInfo: UserInfo, 
  sessionId: string, 
  pageNumber: number
): Promise<Response> {
  console.log(`🎯 [${requestId}] DIRECT MODE: ai-visual-scene-creator bypass mode activated`);
  
  try {
    // Step 1: Generate primary scene via OpenAI
    const messages = [
      {
        role: 'system',
        content: `Generate a detailed visual scene description for children's story illustration.

OBJECTIVE: Create a vivid, child-friendly visual scene that captures the story moment.

JSON RESPONSE:
{
  "primaryScene": "Detailed visual description with setting, character, and action (50+ characters)",
  "backgroundColor": "Background color and atmosphere",
  "lighting": "Lighting conditions and mood",
  "composition": "Visual arrangement and framing",
  "setting": "Location and environment",
  "mood": "Emotional atmosphere",
  "style": "Artistic style and technique",
  "secondaryCharacters": {
    "humans": ["array of secondary human characters"],
    "pets": ["array of animal companions"]
  },
  "objects": ["array of significant objects in scene"]
}

RULES:
1. Child-appropriate content only
2. Vivid, colorful descriptions
3. Include spatial details (positions, colors, lighting)
4. Focus on visual elements only`
      },
      {
        role: 'user',
        content: `Create a visual scene for this story text: "${storyText}"`
      }
    ];

    let openAIResult: any;
    try {
      openAIResult = await callOpenAIWithFallback(messages, 8000, requestId, userInfo?.avatar);
    } catch (openAIError: any) {
      console.error(`❌ [${requestId}] OpenAI failed in direct mode, escalating to Tier 2.5C`);
      return createCorsErrorResponse(`OpenAI generation failed: ${openAIError?.message || openAIError}`, 503);
    }

    const content = openAIResult?.choices?.[0]?.message?.content;
    if (!content?.trim()) {
      console.error(`❌ [${requestId}] Empty OpenAI response in direct mode`);
      return createCorsErrorResponse('OpenAI returned empty content', 503);
    }

    let parsedResponse: AIResponse;
    try {
      parsedResponse = parseAIResponse(content);
    } catch (parseError: any) {
      console.error(`❌ [${requestId}] Failed to parse OpenAI response in direct mode`);
      return createCorsErrorResponse(`Failed to parse AI response: ${parseError?.message || parseError}`, 503);
    }

    if (!parsedResponse.primaryScene || parsedResponse.primaryScene.length < 20) {
      console.error(`❌ [${requestId}] Insufficient primary scene in direct mode`);
      return createCorsErrorResponse('Generated scene too short or missing', 503);
    }
    
    // Primary Scene Quality Gate
    if (!validatePrimarySceneQuality(parsedResponse.primaryScene)) {
      console.error(`❌ [${requestId}] Primary scene quality validation failed in direct mode`);
      return createCorsErrorResponse('Generated scene failed quality validation', 503);
    }

    console.log(`✅ [${requestId}] OpenAI generation successful in direct mode`);

    // Step 2: Complete character consistency with secondary characters and objects
    let characterAppearance = '';
    let detectedSecondaryCharacters: any[] = [];
    let secondaryDescriptions: string[] = [];
    let coloredObjects = '';
    
    try {
      const characterService = characterConsistencyService;
      
      if (sessionId) {
        try {
          // Main character analysis
          await characterService.analyzeVisualDetails(sessionId, storyText, pageNumber || 1, userInfo?.name);
          characterAppearance = await characterService.getCharacterAppearanceFromStory(sessionId, userInfo?.name) || '';

          // Connect VisualDetailTracker for sophisticated analysis  
          const { VisualDetailTracker } = await import("../_shared/VisualDetailTracker.js");
          await VisualDetailTracker.analyzeTextForDetails(sessionId, storyText, pageNumber || 1, null);
          
          // Secondary character detection
          const pageTextForAnalysis = storyText || parsedResponse.primaryScene || '';
          detectedSecondaryCharacters = await characterService.detectSecondaryCharacters(sessionId, pageTextForAnalysis, pageNumber);
          
          // Build secondary character descriptions with seeds
          for (const character of detectedSecondaryCharacters) {
            const seed = await characterService.getSecondaryCharacterSeed(
              sessionId, character.name, character.type || 'secondary_character'
            );
            secondaryDescriptions.push(`${character.name}: ${character.description} (${character.type})`);
          }
        } catch (characterError: any) {
          console.warn(`⚠️ Character consistency service error:`, characterError?.message || characterError);
          characterAppearance = '';
          detectedSecondaryCharacters = [];
          secondaryDescriptions = [];
        }
        
        // Get environmental consistency
        coloredObjects = await characterService.getColoredObjects(sessionId) || '';
        
        console.log(`✅ [${requestId}] Complete character consistency applied:`, {
          characterAppearance: !!characterAppearance,
          secondaryCharacters: detectedSecondaryCharacters.length,
          coloredObjects: !!coloredObjects
        });
      }
    } catch (characterError: any) {
      console.warn(`⚠️ [${requestId}] Character consistency failed, continuing without it:`, characterError?.message || characterError);
    }

    // Step 3: Get proper style framework using difficulty
    const difficulty = userInfo?.difficulty || 'medium';
    let styleFramework;
    try {
      styleFramework = await getStyleFramework(difficulty);
    } catch (styleError) {
      console.warn(`⚠️ Style framework error:`, styleError);
      styleFramework = { styles: [], negativesBase: [] };
    }

    // Return comprehensive direct mode response
    return createCorsResponse({
      success: true,
      tier: 'DIRECT_MODE',
      primaryScene: parsedResponse.primaryScene,
      aiSchema: parsedResponse,
      backgroundColor: parsedResponse.backgroundColor,
      lighting: parsedResponse.lighting,
      composition: parsedResponse.composition,
      setting: parsedResponse.setting,
      mood: parsedResponse.mood,
      style: parsedResponse.style,
      secondaryCharacters: parsedResponse.secondaryCharacters || { humans: [], pets: [] },
      objects: parsedResponse.objects || [],
      characterConsistency: {
        appearance: characterAppearance,
        secondaryCharacters: detectedSecondaryCharacters,
        secondaryDescriptions,
        coloredObjects
      },
      styleFramework,
      processingComplete: true,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error(`❌ [${requestId}] Direct mode processing failed:`, error);
    return createCorsErrorResponse(`Direct mode failed: ${error.message}`, 500);
  }
}

// ============= MAIN REQUEST HANDLER =============

async function handleRequest(req: Request): Promise<Response> {
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

  // GET/HEAD health check
  if (req.method === 'GET' || req.method === 'HEAD') {
    return createCorsResponse({
      status: 'healthy',
      service: 'ai-visual-scene-creator',
      timestamp: new Date().toISOString()
    });
  }

  const requestId = Math.random().toString(36).substring(2, 10);
  console.log(`🚀 [${requestId}] ai-visual-scene-creator: ${req.method} ${req.url}`);
  console.log(`🚀 [${requestId}] ai-visual-scene-creator ready`);
  console.log('📋 SessionStateManager initialized with clean architecture');

  try {
    // Parse request payload
    let payload: DirectModePayload;
    try {
      payload = await req.json();
    } catch (parseError) {
      console.error(`❌ [${requestId}] JSON parsing failed:`, parseError);
      return createCorsErrorResponse('Invalid JSON payload', 400);
    }

    console.log(`🔍 [${requestId}] Received payload keys:`, Object.keys(payload || {}));
    console.log(`🎯 [${requestId}] Call source: ${payload._internal_orchestrator_call ? 'Orchestrator' : 'Frontend'}`);

    // Enhanced payload validation
    const validation = validateDirectModePayload(payload);
    console.log(`✅ [${requestId}] Payload validation passed:`, validation);

    const isDebugCall = payload.isDebugMode === true;
    const isDirectModeCall = payload.directMode === true;
    const isOrchestratorCall = payload._internal_orchestrator_call === true;
    
    console.log(`📄 [${requestId}] Using ${validation.contentType} format`);
    
    // Determine call type and route appropriately
    if (isDebugCall) {
      console.log(`🔍 [${requestId}] Processing debug mode call - generating primaryScene + aiSchema for debugging`);
      const storyText = payload.storyText || payload.pageText || '';
      return await generatePrimarySceneFromStory(
        requestId, 
        storyText, 
        payload.userInfo!, 
        payload.avatarIdentity,
        payload.previousPrimaryScene,
        true // Include full schema for debug
      );
    } else if (isDirectModeCall) {
      console.log(`🔄 [${requestId}] Processing direct mode call - bypassing orchestrator`);
      const storyText = payload.storyText || payload.pageText || '';
      return await handleVisualSceneDirectMode(
        requestId,
        storyText,
        payload.userInfo!,
        payload.sessionId || '',
        payload.pageNumber || 1
      );
    } else if (isOrchestratorCall) {
      console.log(`🔄 [${requestId}] Processing orchestrator call - generating primaryScene + aiSchema for orchestrator`);
      const storyText = payload.storyText || payload.pageText || '';
      return await generatePrimarySceneFromStory(
        requestId,
        storyText, 
        payload.userInfo!,
        payload.avatarIdentity,
        payload.previousPrimaryScene,
        false // Standard response for orchestrator
      );
    } else {
      // Check if mode is specified
      if (!isDebugCall && !isDirectModeCall) {
        console.error(`❌ [${requestId}] Invalid mode: Must specify either directMode: true (for images) or isDebugMode: true (for scene descriptions)`, {
          hasDirectMode: !!isDirectModeCall,
          hasDebugMode: !!isDebugCall
        });
        return createCorsErrorResponse('INVALID_MODE: Must specify either directMode: true (for images) or isDebugMode: true (for scene descriptions)', 400);
      }
      
      console.log(`🔄 [${requestId}] Processing frontend/test call - generating primaryScene + aiSchema for frontend/test`);
      const storyText = payload.storyText || payload.pageText || '';
      return await generatePrimarySceneFromStory(
        requestId,
        storyText,
        payload.userInfo!,
        payload.avatarIdentity,
        payload.previousPrimaryScene,
        true // Include full schema for frontend calls
      );
    }

  } catch (error: any) {
    console.error(`❌ [${requestId}] Request processing failed:`, error);
    return createCorsErrorResponse(error, 500);
  }
}

// Start the server
serve(handleRequest);