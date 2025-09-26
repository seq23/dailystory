// DEPLOY_MARKER: 2025-09-26T18:25:00Z - COMPLETE TypeScript conversion with FIXED imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// ============= AI VISUAL SCENE CREATOR - FIXED TYPESCRIPT IMPLEMENTATION =============

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

// Dynamic imports to prevent boot failures
async function getSharedModules() {
  try {
    const [
      staticData,
      resolver,
      style,
      character,
      session
    ] = await Promise.all([
      import('../_shared/StaticDataCache.js').catch(() => ({})),
      import('../_shared/UnifiedPlaceholderResolver.js').catch(() => ({})),
      import('../_shared/styleFrameworks.js').catch(() => ({})),
      import('../_shared/CharacterConsistencyService.js').catch(() => ({})),
      import('../_shared/SessionStateManager.js').catch(() => ({}))
    ]);
    
    return {
      getCulturalBundle: (staticData as any)?.getCulturalBundle || null,
      shouldApplyCulturalEnhancements: (staticData as any)?.shouldApplyCulturalEnhancements || null,
      UnifiedPlaceholderResolver: (resolver as any)?.UnifiedPlaceholderResolver || null,
      getStyleFramework: (style as any)?.getStyleFramework || (() => 'Contemporary children\'s book illustration'),
      characterConsistencyService: (character as any)?.characterConsistencyService || null,
      SessionStateManager: (session as any)?.SessionStateManager || null
    };
  } catch (error) {
    console.warn('Failed to load shared modules:', error);
    return {
      getCulturalBundle: null,
      shouldApplyCulturalEnhancements: null,
      UnifiedPlaceholderResolver: null,
      getStyleFramework: () => 'Contemporary children\'s book illustration',
      characterConsistencyService: null,
      SessionStateManager: null
    };
  }
}

// TypeScript interfaces
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

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// CORS headers
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

// AI Model Configuration
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

// Simple circuit breaker
class SimpleCircuitBreaker {
  private failures: number = 0;
  private lastFailure: number = 0;
  private threshold: number = 3;
  private timeout: number = 30000;
  
  isOpen(): boolean {
    if (this.failures >= this.threshold && (Date.now() - this.lastFailure < this.timeout)) {
      return true;
    }
    if (this.failures >= this.threshold && (Date.now() - this.lastFailure >= this.timeout)) {
      this.failures = 0;
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

// Validation functions
function validateDirectModePayload(payload: DirectModePayload): { isValid: boolean; contentType: string } {
  if (!payload.pageText && !payload.storyText) {
    throw new Error("MISSING_STORY_CONTENT");
  }
  // userInfo is optional; defaulted downstream
  return { isValid: true, contentType: payload.pageText ? 'pageText' : 'storyText' };
}

function validatePrimarySceneQuality(scene: string): boolean {
  if (!scene || typeof scene !== 'string') return false;
  if (scene.length < 30) return false;
  if (scene.includes('undefined') || scene.includes('null')) return false;
  return scene.split(' ').filter(word => word.length > 0).length >= 5;
}

// JSON parsing with fallbacks
function parseAIResponse(content: string): AIResponse {
  try {
    return JSON.parse(content);
  } catch (directError) {
    // Try extracting JSON from code blocks
    const match = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/i) || 
                  content.match(/(\{[\s\S]*?\})/);
    
    if (match?.[1]) {
      try {
        return JSON.parse(match[1].trim());
      } catch (e) {
        // Extract just primaryScene as fallback
        const sceneMatch = content.match(/"primaryScene"\s*:\s*"([^"]+)"/i);
        if (sceneMatch?.[1]) {
          return {
            primaryScene: sceneMatch[1].trim(),
            backgroundColor: 'soft, child-friendly background',
            lighting: 'warm, gentle lighting',
            composition: 'centered composition',
            setting: 'story setting',
            mood: 'cheerful and engaging',
            style: 'children\'s book illustration',
            secondaryCharacters: { humans: [], pets: [] },
            objects: []
          };
        }
      }
    }
    
    throw new Error('Could not parse AI response');
  }
}

// OpenAI API call with fallback models
async function callOpenAIWithFallback(messages: any[], timeout: number = 12000, requestId?: string): Promise<any> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }
  
  if (circuitBreaker.isOpen()) {
    console.warn('Circuit breaker is open, skipping OpenAI');
    throw new Error('Circuit breaker open - service degraded');
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
  
  circuitBreaker.recordFailure();
  throw new Error('All AI models failed');
}

// Main scene generation function
async function generatePrimarySceneFromStory(
  requestId: string, 
  storyText: string, 
  userInfo: UserInfo, 
  sessionId: string, 
  pageNumber: number = 1,
  avatarIdentity?: any,
  previousPrimaryScene?: string
): Promise<AIResponse> {
  
  console.log(`🚀 [${requestId}] Generating scene from story (${storyText.length} chars)`);
  
  // Get user's cultural context and avatar info
  const userName = userInfo.name || userInfo.userName || userInfo.childName || 'child';
  const gender = userInfo.avatar?.type || 'child';
  const skinTone = userInfo.avatar?.skinTone || 'medium';
  const nativeLanguage = userInfo.nativeLanguage || 'en';
  
  // Load shared modules and get character appearance
  const { 
    shouldApplyCulturalEnhancements,
    characterConsistencyService 
  } = await getSharedModules();
  
  let characterAppearance = '';
  if (characterConsistencyService?.getInstance) {
    try {
      const service = characterConsistencyService.getInstance();
      characterAppearance = await service.getCharacterAppearanceFromStory(sessionId, userName) || '';
    } catch (error) {
      console.warn('Failed to get character appearance:', error);
    }
  }
  
  // Determine if this is a non-English user
  const isNonEnglish = nativeLanguage !== 'en' && shouldApplyCulturalEnhancements && shouldApplyCulturalEnhancements({ nativeLanguage });
  
  // Build culturally-appropriate system prompt
  const culturalContext = isNonEnglish ? `Focus on culturally authentic representation for ${nativeLanguage} speakers.` : '';
  
  // Create comprehensive prompt for scene generation
  const messages = [
    {
      role: 'system',
      content: `You are an expert at creating detailed, child-friendly visual scene descriptions for story illustrations. 
${culturalContext}

Your task is to analyze the story text and extract a comprehensive visual scene description that captures:
1. The main character's appearance and actions
2. The setting and environment details  
3. Objects, props, and visual elements
4. Mood, lighting, and atmosphere
5. Any secondary characters or pets

${characterAppearance ? `Character consistency: ${characterAppearance}` : ''}

CRITICAL: You must respond with valid JSON in this exact format:
{
  "primaryScene": "detailed description of the main visual scene",
  "backgroundColor": "description of background/setting",
  "lighting": "lighting mood and quality",
  "composition": "visual composition details",
  "setting": "location/environment description", 
  "mood": "emotional atmosphere",
  "style": "artistic style notes",
  "secondaryCharacters": {
    "humans": ["list of other people"],
    "pets": ["list of animals/pets"]
  },
  "objects": ["list of important objects/props"]
}

The primaryScene should be detailed (50+ words) and include character actions, appearance details, setting elements, and visual storytelling elements appropriate for children's book illustration.`
    },
    {
      role: 'user',
      content: `Story text: ${storyText}

Character: ${userName} (${gender}, ${skinTone} skin tone)
Page number: ${pageNumber}
${previousPrimaryScene ? `Previous scene: ${previousPrimaryScene}` : ''}

Generate a comprehensive visual scene description in JSON format.`
    }
  ];
  
  try {
    const result = await callOpenAIWithFallback(messages, 15000, requestId);
    const content = result?.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('Empty response from AI');
    }
    
    const parsedResponse = parseAIResponse(content);
    
    // Validate the response has required fields
    if (!parsedResponse.primaryScene || parsedResponse.primaryScene.length < 30) {
      throw new Error('AI response missing or insufficient primaryScene');
    }
    
    console.log(`✅ [${requestId}] SUCCESS: Generated ${parsedResponse.primaryScene.length} char scene`);
    return parsedResponse;
    
  } catch (error: any) {
    console.error(`❌ [${requestId}] Generation failed:`, error);
    throw error;
  }
}

// Direct mode handler
async function handleVisualSceneDirectMode(payload: DirectModePayload): Promise<Response> {
  const requestId = `w${Math.random().toString(36).substr(2, 8)}`;
  console.log(`🚀 [${requestId}] ai-visual-scene-creator: Processing direct mode`);

  try {
    // Fast validation
    const validation = validateDirectModePayload(payload);
    
    const storyContent = payload.pageText || payload.storyText || '';
    const userInfo = payload.userInfo || {};
    const sessionId = payload.sessionId || 'direct-session';
    const pageNumber = payload.pageNumber || 1;

    console.log(`🎯 [${requestId}] Direct Mode: Generating scene from ${validation.contentType}`);

    try {
      const aiResponse = await generatePrimarySceneFromStory(
        requestId,
        storyContent,
        userInfo,
        sessionId,
        pageNumber,
        payload.avatarIdentity,
        payload.previousPrimaryScene
      );

      // Get style framework
      const { getStyleFramework } = await getSharedModules();
      const difficulty = userInfo.difficulty || 'medium';
      const styleFramework = getStyleFramework(difficulty);

      const response = {
        success: true,
        primaryScene: aiResponse.primaryScene,
        backgroundColor: aiResponse.backgroundColor || 'soft, child-friendly background',
        lighting: aiResponse.lighting || 'warm, gentle lighting',
        composition: aiResponse.composition || 'centered, story-focused composition',
        setting: aiResponse.setting || 'story-appropriate setting',
        mood: aiResponse.mood || 'cheerful and engaging',
        style: aiResponse.style || styleFramework,
        secondaryCharacters: aiResponse.secondaryCharacters || { humans: [], pets: [] },
        objects: aiResponse.objects || [],
        extractionMethod: 'direct_ai_generation',
        aiSchema: aiResponse,
        directMode: true,
        processedAt: new Date().toISOString(),
        requestId
      };

      console.log(`✅ [${requestId}] Direct Mode SUCCESS: Scene generated (${response.primaryScene.length} chars)`);
      return createCorsResponse(response);

    } catch (aiError: any) {
      console.error(`❌ [${requestId}] Direct Mode AI failed:`, aiError);
      
      // Fallback to basic extraction
      const fallbackScene = storyContent.length > 100 ? 
        storyContent.substring(0, 100) + '...' : 
        storyContent || 'A child in a story scene';

      const fallbackResponse = {
        success: true,
        primaryScene: fallbackScene,
        backgroundColor: 'soft, story-appropriate background',
        lighting: 'warm, natural lighting',
        composition: 'child-focused composition',
        setting: 'story setting',
        mood: 'engaging and appropriate',
        style: 'children\'s book illustration',
        secondaryCharacters: { humans: [], pets: [] },
        objects: [],
        extractionMethod: 'fallback_content_extraction',
        directMode: true,
        fallback: true,
        requestId
      };

      console.log(`🔄 [${requestId}] Direct Mode FALLBACK: Using content extraction`);
      return createCorsResponse(fallbackResponse);
    }

  } catch (error: any) {
    console.error(`❌ [${requestId}] Direct Mode failed:`, error);
    
    if (error.message === "MISSING_STORY_CONTENT") {
      return createCorsErrorResponse("Validation failed: MISSING_STORY_CONTENT", 400);
    }
    
    return createCorsErrorResponse(error.message, 500);
  }
}

// Main serve function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = `w${Math.random().toString(36).substr(2, 8)}`;
  console.log(`🚀 [${requestId}] ai-visual-scene-creator: ${req.method} ${req.url}`);

  // Health check for GET requests
  if (req.method === 'GET') {
    return createCorsResponse({
      status: "healthy",
      service: "ai-visual-scene-creator",
      timestamp: new Date().toISOString()
    });
  }

  // Handle POST requests
  if (req.method === 'POST') {
    try {
      const payload = await req.json();
      console.log(`📦 [${requestId}] Payload keys:`, Object.keys(payload));

      // Fast validation
      if (!payload.pageText && !payload.storyText) {
        console.log(`❌ [${requestId}] Fast validation failed: MISSING_STORY_CONTENT`);
        return createCorsErrorResponse("Validation failed: MISSING_STORY_CONTENT", 400);
      }

      // Process in direct mode
      return await handleVisualSceneDirectMode(payload);

    } catch (error: any) {
      console.error(`❌ [${requestId}] Request processing failed:`, error);
      return createCorsErrorResponse(error.message, 500);
    }
  }

  return createCorsErrorResponse("Method not allowed", 405);
});

console.log(`🚀 [${new Date().toISOString()}] ai-visual-scene-creator ready`);