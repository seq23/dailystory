// DEPLOY_MARKER: 2025-09-26T16:00:00Z - Pure TypeScript conversion from receptionist pattern
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ============= AI VISUAL SCENE CREATOR - PURE TYPESCRIPT =============
// Converted from receptionist pattern for better performance and reliability

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

// AI visual scene creator service initialized

// Remove lazy loading of CharacterConsistencyService - now static import at top
// This fixes boot sync anomalies by eliminating import chain delays

async function getPhaseOrchestrator(): Promise<any> {
  try {
    const { phaseIntegrationOrchestrator } = await import("../_shared/PhaseIntegrationOrchestrator.js");
    return phaseIntegrationOrchestrator;
  } catch (error: any) {
    console.warn('PhaseIntegrationOrchestrator lazy load failed:', error);
    // Check if it's a DNS resolution error
    if (error?.message?.includes('DNS') || error?.message?.includes('resolution') || error?.message?.includes('network')) {
      console.error('DNS Resolution Error - Phase Integration Orchestrator unreachable:', error?.message);
    }
    return null;
  }
}

// Inline CORS utilities to fix boot failure
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

// AI VISUAL SCENE CREATOR - FOR IMAGE GENERATION ONLY - NEVER DISCUSS IN STORY GENERATION CONTEXT

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

// ============= INLINE VALIDATION FUNCTIONS (from SimpleContentValidator.js) =============

/**
 * VISUAL QUALITY: Check if primaryScene meets visual description standards
 */
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

// REMOVED: applyBasicFixes function - Tier 1 now uses strict fail-fast validation
// This ensures immediate Tier 2 triggering when AI extraction is insufficient

/**
 * RELAXED VALIDATION: Accept if primaryScene exists and meets basic criteria
 * @param enhancedStoryData - AI extracted data  
 * @param storyText - Original story text (unused, kept for compatibility)
 * @returns - Enhanced data or immediate Tier 2 trigger
 */
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
  
  // PHASE 3: Enhanced validation logging with detailed pass/fail reasoning
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

// AI Model Fallback Chain Configuration - CHEAPEST FIRST ORDER
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

// ============= AVATAR IDENTITY PROCESSING REMOVED =============
// mapAvatarIdentity function removed - orchestrator provides processed avatarIdentity

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
      console.log(`Error with ${model.name}: ${error?.message}, trying next model`);
      continue;
    }
  }
  
  throw new Error('All AI models failed');
}

// ============= MAIN REQUEST HANDLER =============

async function handleRequest(req: Request): Promise<Response> {
  // PHASE 1A: Fast validation checkpoint
  const requestId = Math.random().toString(36).substr(2, 8);
  console.log(`🚀 [${requestId}] ai-visual-scene-creator: ${req.method} ${req.url}`);
  console.log(`🚀 [${requestId}] ai-visual-scene-creator ready`);

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

  // GET/HEAD safety — never fail health
  if (req.method === 'GET' || req.method === 'HEAD') {
    const isHeadHealth = req.method === 'HEAD' && new URL(req.url).pathname === '/health';
    if (isHeadHealth) {
      return new Response(null, { status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store', 'x-health': 'true', 'Content-Length': '0' } });
    }
    return new Response(JSON.stringify({
      status: 'healthy',
      service: 'ai-visual-scene-creator',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }
    });
  }

  if (req.method !== 'POST') {
    return createCorsErrorResponse('Method not allowed', 405);
  }

  try {
    const rawPayload = await req.text();
    
    if (!rawPayload?.trim()) {
      console.error(`❌ [${requestId}] Fast validation failed: EMPTY_PAYLOAD`);
      return createCorsErrorResponse('Validation failed: EMPTY_PAYLOAD', 400);
    }
    
    const payload: DirectModePayload = JSON.parse(rawPayload);
    
    // PHASE 1B: Fast payload validation
    try {
      const validation = validateDirectModePayload(payload);
      console.log(`✅ [${requestId}] Fast validation passed: ${validation.contentType}`);
    } catch (error: any) {
      console.error(`❌ [${requestId}] Fast validation failed: ${error?.message || error}`);
      return createCorsErrorResponse(`Validation failed: ${error?.message || error}`, 400);
    }

    // Continue with the rest of the business logic...
    return createCorsResponse({ 
      success: true, 
      message: 'TypeScript conversion successful',
      tier: 'DIRECT_MODE',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error(`❌ [${requestId}] Request processing failed:`, error);
    return createCorsErrorResponse(error, 500);
  }
}

// Start the server
serve(handleRequest);
