import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { 
  createDynamicCorsOptionsResponse, 
  createDynamicCorsResponse, 
  createDynamicCorsErrorResponse 
} from "../_shared/corsAdvanced.ts";
import { monitorRequest } from "../_shared/headerMonitor.ts";
import { SessionStateManager } from "../_shared/SessionStateManager.ts";
import { SecurityValidator } from "../_shared/SecurityValidator.js";
import { AVATAR_FALLBACK_DESCRIPTIONS, validateAvatarConsistency, validateAvatarQuality } from "../_shared/avatarConsistency.js";
import { generateNuclearNegativePrompt, detectCulturalProfileForNegatives } from "../_shared/NuclearNegativePrompts.js";
import { DifficultyLevelMapper } from "../_shared/DifficultyLevelMapper.js";

/**
 * ============================================================================
 * IMAGE GENERATION TIER POLICY - CRITICAL BUSINESS RULE
 * ============================================================================
 * 
 * ALL USERS (GUEST AND PREMIUM) RECEIVE TIER 1 IMAGES
 * 
 * This is a fundamental business decision to ensure:
 * - 100% image generation success rate through comprehensive fallback system
 * - Consistent high-quality user experience regardless of subscription status  
 * - Premium value proposition focused on other features (unlimited time, saves, etc.)
 * - Simplified architecture without subscription-based image quality tiers
 * 
 * TIER PROGRESSION FOR ALL USERS:
 * - Tier 1: AI-Enhanced Premium (runware:100@1 with full enhancement pipeline)
 * - Tier 2: Template-Based Fallback (structured templates)
 * - Tier 2.5: Nuclear Hardcoded Fallback (guaranteed generation)
 * - Tier 3: OpenAI DALL-E Fallback (external provider)
 * - Tier 4: SVG Placeholder (100% guaranteed success)
 * 
 * IMPORTANT: The `isGuestUser` parameter is for analytics/tracking only
 * DO NOT use it for tier selection or image quality degradation
 * 
 * REGRESSION PREVENTION:
 * - Never implement subscription-based tier restrictions
 * - All users must start with Tier 1 premium image generation
 * - Fallbacks exist for reliability, not subscription enforcement
 * 
 * ============================================================================
 * 
 * EMERGENCY CORS FIX TIMESTAMP: 2025-01-09 00:00:00 UTC
 * Fixed Tier 1 success responses to use createDynamicCorsResponse
 */

// ============= CULTURAL DESCRIPTION ARRAYS =============
// African American Arrays - Standardized with debug-tier-2-5-templates
const HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES = {
  boys: [
    'textured buzz cut', 'detailed fade cut', 'textured taper fade', 'detailed high top fade', 
    'textured low fade', 'detailed crew cut', 'textured caesar cut', 'detailed curly top fade', 
    'textured curly high fade', 'detailed curly low fade', 'textured curly taper fade', 
    'detailed curly high top', 'textured curly mohawk', 'detailed curly faux hawk', 
    'textured curly undercut', 'detailed fade with curls on top', 'textured crop', 
    'detailed curly fringe fade', 'textured twisted top fade', 'detailed undercut design'
  ],
  girls: [
    'wearing a detailed traditional afro hairstyle with natural coily hair texture, spherical volume shape, tight curl pattern definition, authentic Black hair structure, individual strand coils, dimensional texture depth, natural shine and movement',
    'wearing detailed, photorealistic separated box braids with rectangular parting, each individual braid clearly distinct, multiple separate braided sections, geometric hair sectioning, individual strand definition per braid, occasionally with colorful strands, professional box braid styling',
    'wearing detailed, photorealistic cornrows braided straight back in parallel rows, tight to scalp weaving, visible scalp parts between each row, traditional row braiding style, occasionally with colorful strands',
    'wearing detailed, defined twist-out curls with natural curl pattern, bouncy texture, individual curl definition, soft volume, natural hair movement',
    'wearing detailed afro puffs hairstyle with two symmetrical hair puffs positioned high on head, natural curly texture, rounded voluminous shape, authentic afro hair structure, defined curl clusters, bouncy texture depth',
    'well-maintained dreadlocs with natural texture, individual strand definition, mature lock formation, photorealistic hair texture',
    'wearing a natural wash-and-go curls with defined curl pattern, bouncy texture, individual curl strands, soft volume, natural movement, salon-quality finish',
    'wearing detailed, photorealistic, traditional flat twists hairstyle, neat twisting pattern, detailed texture, individual strand definition',
    'wearing detailed sleek bun with smooth edges sitting high on the head, neat hair, no loose hair, polished finish, professional styling',
    'wearing sleek relaxed ponytail with smooth edges, straight hair texture, polished finish, tight hair control, professional styling, light reflection on hair',
    'wearing detailed relaxed curved bob hairstyle with smooth inward styling, visible side part, salon shaping technique, sleek finish, dimensional movement, professional curved cutting, professional salon results'
  ]
};


const HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES = [
  // Light Tones
  "light brown skin tone with warm amber eyes, full lips, defined cheekbones, natural nose bridge",
  "caramel skin tone with deep brown eyes, soft full lips, high cheekbones, elegant nose shape",
  "honey complexion with hazel-green eyes, naturally full lips, sculpted cheekbones, refined nose",
  "warm beige skin with golden brown eyes, full expressive lips, defined facial structure, natural nose",
  "light caramel complexion with bright hazel eyes, full lips, prominent cheekbones, authentic nose shape",
  
  // Medium Tones
  "medium brown skin tone with golden amber eyes, full lips, strong cheekbones, natural nose bridge",
  "cocoa skin tone with warm honey eyes, naturally full lips, defined cheekbones, elegant nose shape",
  "warm brown complexion with bright amber eyes, full expressive lips, sculpted cheekbones, refined nose",
  "chestnut skin tone with hazel-brown eyes, full lips, prominent cheekbones, authentic nose bridge",
  "amber skin tone with deep brown eyes, soft full lips, high cheekbones, natural nose shape",
  
  // Medium-Dark Tones
  "deep brown skin tone with golden amber eyes, full lips, defined cheekbones, natural nose bridge",
  "rich chocolate complexion with warm honey eyes, naturally full lips, strong cheekbones, elegant nose",
  "mahogany skin tone with bright hazel eyes, full expressive lips, sculpted cheekbones, refined nose shape",
  "warm deep brown skin with golden brown eyes, full lips, prominent cheekbones, authentic nose bridge",
  "bronze skin tone with light amber eyes, soft full lips, high cheekbones, natural nose shape",
  
  // Dark Tones
  "dark brown skin tone with golden amber eyes, full lips, defined cheekbones, natural nose bridge",
  "ebony skin tone with warm honey eyes, naturally full lips, strong cheekbones, elegant nose shape",
  "deep mahogany complexion with bright amber eyes, full expressive lips, sculpted cheekbones, refined nose",
  "rich dark chocolate skin with golden hazel eyes, full lips, prominent cheekbones, authentic nose bridge",
  "beautiful dark brown skin with light amber eyes, soft full lips, high cheekbones, natural nose shape",
  "deep ebony skin tone with warm golden eyes, naturally full lips, defined cheekbones, elegant nose bridge",
  "dark mahogany complexion with honey-colored eyes, full expressive lips, strong cheekbones, refined nose shape",
  "rich chocolate brown skin with bright hazel eyes, full lips, sculpted cheekbones, authentic nose bridge",
  "beautiful deep brown skin with golden amber eyes, soft full lips, prominent cheekbones, natural nose shape",
  "stunning ebony complexion with warm amber eyes, naturally full lips, high cheekbones, elegant nose bridge"
];

// Hispanic/Latino arrays removed for template unification
// Only African American arrays remain for dark skin users
// AI handles other ethnicities naturally

// Regional Authenticity Strings for Non-English Speakers
const REGIONAL_AUTHENTICITY_STRINGS = {
  'zh': 'authentic East Asian features reflecting Chinese heritage',
  'hi': 'authentic South Asian features reflecting Indian heritage', 
  'ar': 'authentic Middle Eastern features reflecting Arabic heritage',
  'ja': 'authentic East Asian features reflecting Japanese heritage',
  'ko': 'authentic East Asian features reflecting Korean heritage',
  'fr': 'authentic European features reflecting French heritage',
  'de': 'authentic European features reflecting German heritage',
  'ru': 'authentic Eastern European features reflecting Russian heritage',
  'pt': 'authentic Latin American features reflecting Portuguese heritage'
};

// ============= TIER FAILURE TRACKING =============
class TierFailureTracker {
  static trackFailure(tier: string, errorType: string, sessionId?: string, details?: any) {
    const failure = {
      tier,
      errorType,
      timestamp: Date.now(),
      sessionId,
      details
    };
    
    console.warn(`🔴 TIER FAILURE TRACKED:`, failure);
    
    // Store in session state if available
    if (sessionId && globalThis.globalArcSessionManager) {
      try {
        const session = globalThis.globalArcSessionManager.sessions.get(sessionId);
        if (session) {
          if (!session.tierFailures) session.tierFailures = [];
          session.tierFailures.push(failure);
          
          // Keep only last 10 failures per session
          if (session.tierFailures.length > 10) {
            session.tierFailures = session.tierFailures.slice(-10);
          }
        }
      } catch (error) {
        console.warn('Failed to store tier failure in session:', error);
      }
    }
  }
  
  static getFailureStats(sessionId?: string) {
    if (!sessionId || !globalThis.globalArcSessionManager) return null;
    
    try {
      const session = globalThis.globalArcSessionManager.sessions.get(sessionId);
      return session?.tierFailures || [];
    } catch (error) {
      console.warn('Failed to retrieve failure stats:', error);
      return null;
    }
  }
}

// ============= WEBSOCKET ERROR CLASSIFICATION =============
class WebSocketError extends Error {
  constructor(message: string, public type: 'CONNECTION' | 'TIMEOUT' | 'RATE_LIMIT' | 'AUTH' | 'GENERATION' | 'NETWORK', public isRetryable: boolean = false) {
    super(message);
    this.name = 'WebSocketError';
  }
}

// ============= ENHANCED WEBSOCKET MANAGER =============
class RunwareWebSocketManager {
  private static readonly MAX_RETRIES = 3;
  private static readonly BASE_DELAY = 1000; // 1 second
  private static readonly MAX_DELAY = 8000; // 8 seconds
  private static readonly CONNECTION_TIMEOUT = 90000; // 90 seconds - increased timeout for longer image generation
  private static readonly IMAGE_GENERATION_TIMEOUT = 120000; // 120 seconds - separate timeout for image generation phase
  
  static async connectWithRetry(
    apiKey: string, 
    positivePrompt: string, 
    negativePrompt: string, 
    seed?: number, 
    sessionId?: string, 
    pageNumber?: number,
    attempt: number = 1,
    requestId?: string // PHASE 5: Cross-function correlation
  ): Promise<any> {
    try {
      return await this.attemptConnection(apiKey, positivePrompt, negativePrompt, seed, sessionId, pageNumber, requestId);
    } catch (error) {
      const wsError = error as WebSocketError;
      const logPrefix = requestId ? `[${requestId}]` : '';
      
      // Check if error is retryable and we haven't exceeded max attempts
      if (wsError.isRetryable && attempt < this.MAX_RETRIES) {
        const delay = Math.min(this.BASE_DELAY * Math.pow(2, attempt - 1), this.MAX_DELAY);
        console.warn(`🔄 ${logPrefix} WebSocket attempt ${attempt} failed, retrying in ${delay}ms: ${wsError.message}`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.connectWithRetry(apiKey, positivePrompt, negativePrompt, seed, sessionId, pageNumber, attempt + 1, requestId);
      }
      
      console.error(`❌ ${logPrefix} WebSocket failed after ${attempt} attempts: ${wsError.message}`);
      throw wsError;
    }
  }
  
  private static attemptConnection(
    apiKey: string, 
    positivePrompt: string, 
    negativePrompt: string, 
    seed?: number, 
    sessionId?: string, 
    pageNumber?: number,
    requestId?: string // PHASE 5: Cross-function correlation
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let ws: WebSocket;
      let connectionTimeout: number;
      let generationTimeout: number;
      let isResolved = false;
      
      const cleanup = () => {
        if (connectionTimeout) clearTimeout(connectionTimeout);
        if (generationTimeout) clearTimeout(generationTimeout);
        if (ws && ws.readyState === WebSocket.OPEN) ws.close();
      };
      
      const safeReject = (error: WebSocketError) => {
        if (!isResolved) {
          isResolved = true;
          cleanup();
          reject(error);
        }
      };
      
      const safeResolve = (result: any) => {
        if (!isResolved) {
          isResolved = true;
          cleanup();
          resolve(result);
        }
      };
      
      try {
        const logPrefix = requestId ? `[${requestId}]` : '';
        console.log(`🔌 ${logPrefix} Attempting WebSocket connection to Runware`);
        
        // Set connection timeout (for WebSocket connection + authentication)
        connectionTimeout = setTimeout(() => {
          safeReject(new WebSocketError('Connection and authentication timeout', 'TIMEOUT', true));
        }, this.CONNECTION_TIMEOUT);
        
        ws = new WebSocket('wss://ws-api.runware.ai/v1');
        
        ws.onopen = () => {
          console.log(`✅ ${logPrefix} WebSocket connected, authenticating...`);
          
          // Send authentication - FIX: Runware requires array format
          ws.send(JSON.stringify([{
            taskType: "authentication",
            apiKey: apiKey
          }]));
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log(`📨 ${logPrefix} WebSocket message received:`, data);
            
            if (data.data && data.data.length > 0) {
              const message = data.data[0];
              
              // Handle authentication response - FIX: Correct Runware authentication format
              if (message.taskType === "authentication" && message.connectionSessionUUID) {
                console.log(`🔑 ${logPrefix} Authentication successful (UUID: ${message.connectionSessionUUID}), sending image generation request`);
                
                // Clear connection timeout and set image generation timeout
                clearTimeout(connectionTimeout);
                generationTimeout = setTimeout(() => {
                  safeReject(new WebSocketError('Image generation timeout after authentication', 'GENERATION_TIMEOUT', true));
                }, this.IMAGE_GENERATION_TIMEOUT);
                
                // Build generation request
                const generationRequest = {
                  taskType: "imageInference",
                  taskUUID: crypto.randomUUID(),
                  positivePrompt,
                  negativePrompt,
                  height: 1024, // FIXED: Optimized from 512x512 to 1024x1024
                  width: 1024,
                  model: "runware:100@1",
                  steps: 25, // Optimized: Balanced quality/speed to prevent timeouts
                  CFGScale: 8, // Optimized: Balanced prompt adherence for reliability
                  clipSkip: 1,
                  scheduler: "FlowMatchEulerDiscreteScheduler",
                  onlyUpscale: false,
                  useCache: false,
                  numImages: 1
                };
                
                // Add seed if provided
                if (seed !== undefined) {
                  generationRequest.seed = seed;
                }
                
                console.log(`🎯 ${logPrefix} Sending generation request:`, {
                  taskUUID: generationRequest.taskUUID,
                  promptLength: positivePrompt.length,
                  negativePromptLength: negativePrompt.length,
                  model: generationRequest.model,
                  seed: seed || 'random'
                });
                
                // FIX: Runware requires array format for image generation
                ws.send(JSON.stringify([generationRequest]));
                
              } else if (message.taskType === "authentication" && !message.connectionSessionUUID) {
                safeReject(new WebSocketError('Authentication failed - no session UUID received', 'AUTH', false));
                
              } else if (message.taskType === 'imageInference') {
                // Handle generation response
                if (message.imageURL) {
                  console.log(`🎨 ${logPrefix} Image generation successful:`, {
                    imageURL: message.imageURL,
                    taskUUID: message.taskUUID,
                    seed: message.seed
                  });
                  
                  safeResolve({
                    success: true,
                    imageURL: message.imageURL,
                    seed: message.seed,
                    taskUUID: message.taskUUID,
                    provider: 'runware',
                    tier: 1
                  });
                  
                } else if (message.error) {
                  console.error(`❌ ${logPrefix} Generation error:`, message.error);
                  
                  // Classify error type for retry logic
                  const errorMsg = message.error.toString().toLowerCase();
                  let errorType: WebSocketError['type'] = 'GENERATION';
                  let isRetryable = true;
                  
                  if (errorMsg.includes('rate limit') || errorMsg.includes('quota')) {
                    errorType = 'RATE_LIMIT';
                    isRetryable = false; // Don't retry rate limits immediately
                  } else if (errorMsg.includes('network') || errorMsg.includes('connection')) {
                    errorType = 'NETWORK';
                  } else if (errorMsg.includes('auth')) {
                    errorType = 'AUTH';
                    isRetryable = false;
                  }
                  
                  safeReject(new WebSocketError(
                    `Generation failed: ${message.error}`,
                    errorType,
                    isRetryable
                  ));
                }
              }
            }
          } catch (parseError) {
            console.error(`❌ ${logPrefix} Failed to parse WebSocket message:`, parseError);
            safeReject(new WebSocketError('Message parsing failed', 'NETWORK', true));
          }
        };
        
        ws.onerror = (error) => {
          console.error(`❌ ${logPrefix} WebSocket error:`, error);
          safeReject(new WebSocketError('WebSocket connection error', 'CONNECTION', true));
        };
        
        ws.onclose = (event) => {
          console.log(`🔌 ${logPrefix} WebSocket closed:`, { code: event.code, reason: event.reason });
          if (!isResolved) {
            safeReject(new WebSocketError('WebSocket closed unexpectedly', 'CONNECTION', true));
          }
        };
        
      } catch (error) {
        console.error(`❌ ${logPrefix} WebSocket setup error:`, error);
        safeReject(new WebSocketError(`Setup failed: ${error.message}`, 'CONNECTION', true));
      }
    });
  }
}

// ============= TIER FUNCTION CALLER - ENHANCED DEBUGGING & PROPER SUPABASE CLIENT =============
async function callTierFunction(functionName: string, payload: any): Promise<any> {
  try {
    console.log(`📞 Calling ${functionName} with payload keys:`, Object.keys(payload));
    console.log(`🔍 DEBUG: ${functionName} request details:`, {
      functionName,
      payloadSize: JSON.stringify(payload).length,
      timestamp: new Date().toISOString(),
      sessionId: payload.sessionId?.substring(0, 15) + '...' || 'none'
    });
    
    // Enhanced Tier 2.5 debugging - log detailed payload for fallback function
    if (functionName === 'runware-simple-fallback') {
      console.log(`🔧 TIER 2.5 ENHANCED DEBUG - Detailed payload analysis:`, {
        hasPageText: !!payload.pageText && payload.pageText.length > 0,
        pageTextLength: payload.pageText?.length || 0,
        pageTextPreview: payload.pageText?.substring(0, 100) || 'none',
        hasUserInfo: !!payload.userInfo,
        userInfoKeys: payload.userInfo ? Object.keys(payload.userInfo) : [],
        hasDifficulty: !!payload.difficultyLevel,
        difficulty: payload.difficultyLevel,
        hasAvatarIdentity: !!payload.avatarIdentity,
        avatarIdentityKeys: payload.avatarIdentity ? Object.keys(payload.avatarIdentity) : [],
        avatarName: payload.avatarIdentity?.name || 'none',
        hasCharacterData: !!payload.characterData,
        characterDataType: typeof payload.characterData,
        hasSessionId: !!payload.sessionId,
        sessionIdLength: payload.sessionId?.length || 0,
        callingTier: '2.5',
        timestamp: new Date().toISOString()
      });
    }
    
    // Use proper Supabase client for edge function calls - FIX FOR AUTHENTICATION ISSUES
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || 'https://cpzeuogomaixamrtnnmj.supabase.co',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')
    );
    
    console.log(`🔌 Using Supabase client to invoke ${functionName}`);
    
    // Use Supabase client function invocation for proper authentication
    const { data: result, error: invokeError } = await supabase.functions.invoke(functionName, {
      body: payload
    });
    
    if (invokeError) {
      console.error(`❌ ${functionName} Supabase invoke error:`, invokeError);
      
      // Enhanced debugging for Tier 2.5 failures
      if (functionName === 'runware-simple-fallback') {
        console.error(`🔍 TIER 2.5 SUPABASE INVOKE FAILURE:`, {
          error: invokeError,
          errorMessage: invokeError.message,
          errorCode: invokeError.code,
          errorDetails: invokeError.details,
          payloadSessionId: payload.sessionId,
          hasAvatarIdentity: !!payload.avatarIdentity,
          hasUserInfo: !!payload.userInfo,
          hasPageText: !!payload.pageText,
          errorType: 'SUPABASE_INVOKE_ERROR',
          timestamp: new Date().toISOString()
        });
      }
      
      throw new Error(`${functionName} failed: ${invokeError.message}`);
    }
    
    console.log(`🔍 DEBUG: ${functionName} response:`, {
      resultKeys: Object.keys(result || {}),
      success: result?.success,
      hasImageURL: !!result?.imageURL,
      tier: result?.tier || 'unknown',
      provider: result?.provider || 'unknown'
    });
    
    if (!result) {
      throw new Error(`${functionName} returned no data`);
    }
    
    // Enhanced Tier 2.5 success debugging
    if (functionName === 'runware-simple-fallback') {
      console.log(`🎯 TIER 2.5 SUCCESS ANALYSIS:`, {
        success: result.success,
        hasImageURL: !!result.imageURL,
        imageURLPreview: result.imageURL?.substring(0, 50) + '...' || 'none',
        provider: result.provider,
        tier: result.tier,
        seed: result.seed,
        enhancementLevel: result.enhancementLevel,
        metadata: result.metadata,
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(`✅ ${functionName} completed successfully via Supabase client`);
    return result;
    
  } catch (error) {
    console.error(`❌ ${functionName} failed:`, error);
    
    // Enhanced error logging for Tier 2.5
    if (functionName === 'runware-simple-fallback') {
      console.error(`🚨 TIER 2.5 CRITICAL FAILURE:`, {
        errorMessage: error.message,
        errorName: error.name,
        errorStack: error.stack?.substring(0, 500),
        functionName,
        timestamp: new Date().toISOString(),
        fallbackStatus: 'FAILED - Proceeding to Tier 4'
      });
    }
    
    throw error;
  }
}

// ============= AVATAR IDENTITY MAPPER =============
// CRITICAL: This function maps UI avatar data to AI generation parameters
// DO NOT MODIFY without understanding the full avatar pipeline impact
function mapAvatarIdentity(userInfo: any, sessionId?: string): any {
  // REGRESSION PREVENTION: Default fallback identity
  // - skinTone: 'medium' is the statistically most common and balanced default
  // - DO NOT change to 'light' as this creates bias toward lighter skin tones
  // - 'medium' ensures better representation across all user demographics
  const defaultIdentity = {
    type: 'child',
    skinTone: 'medium', // CRITICAL: DO NOT change this default - ensures demographic balance
    culturalProfile: 'general',
    nativeLanguage: 'english',
    name: userInfo?.name || 'the child',
    hairColor: null
  };
  
  // If no avatar info provided, return default
  if (!userInfo?.avatar) {
    console.log('🔄 Avatar mapping: No avatar data provided, using default identity');
    return defaultIdentity;
  }
  
  // REGRESSION PREVENTION: Avatar type mapping
  // This maps UI avatar type values to AI generation parameters
  const avatarTypeMap = {
    'boy': 'boy',
    'girl': 'girl', 
    'child': 'child',
    'kid': 'child',
    'prefer-not-to-answer': 'prefer-not-to-answer'
  };
  
  // CRITICAL SKIN TONE MAPPING - DO NOT MODIFY THESE 5 MAPPINGS
  // These correspond to the exact 5 skin tone options in the UI:
  // REGRESSION WARNING: Removing ANY of these 5 mappings will break avatar generation
  // - 'pale': Very light skin tones (Northern European, etc.)
  // - 'light': Light skin tones (General European, etc.)  
  // - 'medium': Medium skin tones (Mediterranean, Mixed, etc.)
  // - 'olive': Olive skin tones (Middle Eastern, Southern European, etc.)
  // - 'dark': Dark skin tones (African, African diaspora, etc.)
  // The old incorrect mapping 'tan': 'medium' was REMOVED - do not re-add it
  const skinToneMap = {
    'pale': 'pale',     // REQUIRED: Maps to UI pale option
    'light': 'light',   // REQUIRED: Maps to UI light option  
    'medium': 'medium', // REQUIRED: Maps to UI medium option
    'olive': 'olive',   // REQUIRED: Maps to UI olive option - FIXED (was missing)
    'dark': 'dark'      // REQUIRED: Maps to UI dark option
  };
  
  // ENHANCED SKIN TONE VARIATION ARRAYS - FOR IMAGE GENERATION ONLY
  // REGRESSION PREVENTION: This provides detailed skin tone variations for character generation
  // DO NOT MODIFY without understanding cultural representation impact
  // This system ensures rich, varied character descriptions for image generation
  const SKIN_TONE_VARIATIONS = {
    'pale': [
      "attractive child character with porcelain white skin with cool undertones",
      "attractive child character with alabaster complexion with subtle pink flush",
      "attractive child character with fair ivory skin with delicate translucency",
      "attractive child character with cream-colored skin with soft warmth",
      "attractive child character with light peachy-pink complexion",
      "attractive child character with fair skin with gentle rosy undertones",
      "attractive child character with soft beige-pink skin with natural glow",
      "attractive child character with warm ivory complexion with subtle golden hints"
    ],
    'light': [
      "attractive child character with light ivory skin with golden undertones",
      "attractive child character with soft vanilla complexion with warm highlights",
      "attractive child character with honey-beige skin with natural radiance",
      "attractive child character with light golden skin with peachy undertones",
      "attractive child character with warm sand-colored complexion",
      "attractive child character with light tan skin with golden glow",
      "attractive child character with sun-kissed beige with bronze hints",
      "attractive child character with golden-light skin with warm depth"
    ],
    'medium': [
      "attractive child character with light caramel skin with golden undertones",
      "attractive child character with warm wheat-colored complexion",
      "attractive child character with honey-gold skin with amber highlights",
      "attractive child character with medium tan with bronze undertones",
      "attractive child character with rich caramel complexion with golden depth",
      "attractive child character with warm amber-toned skin with natural shine",
      "attractive child character with golden brown skin with copper highlights",
      "attractive child character with rich tan with deep bronze undertones"
    ],
    'olive': [
      "attractive child character with light olive skin with golden undertones",
      "attractive child character with soft olive-beige complexion",
      "attractive child character with warm olive-gold skin with neutral depth",
      "attractive child character with medium olive complexion with bronze hints",
      "attractive child character with rich olive skin with golden-green undertones",
      "attractive child character with deep olive complexion with warm bronze",
      "attractive child character with Mediterranean olive skin with copper highlights",
      "attractive child character with rich olive-tan with natural golden depth"
    ],
    'dark': [
      "attractive child authentic african american features with textured natural hair" // Enhanced cultural specificity
    ]
  };

  // CRITICAL HAIR COLOR MAPPING FOR STORY GENERATION ONLY
  // This provides simple hair descriptions for story text (NOT image generation)
  const hairColorMap = {
    'pale': 'red hair',              // Celtic/Northern European heritage
    'light': 'blonde hair',          // Northern European heritage  
    'medium': 'brown hair',          // Global medium tones
    'olive': 'black hair',           // Mediterranean/Middle Eastern heritage
    'dark': 'textured natural hair'  // African diaspora heritage - includes natural textures
  };

  // Seeded random selection for consistent skin tone variations
  function getSeededSkinToneVariation(skinTone: string, seed: string): string {
    const variations = SKIN_TONE_VARIATIONS[skinTone];
    if (!variations || variations.length === 0) return '';
    if (variations.length === 1) return variations[0];
    
    // Create consistent hash from seed
    let hash = 0;
    const seedStr = String(seed || '');
    for (let i = 0; i < seedStr.length; i++) {
      hash = ((hash << 5) - hash + seedStr.charCodeAt(i)) & 0xffffffff;
    }
    
    const index = Math.abs(hash) % variations.length;
    return variations[index];
  }
  
  const skinTone = skinToneMap[userInfo.avatar.skinTone] || defaultIdentity.skinTone;
  
  // Generate consistent seed for character variations
  const characterSeed = `${userInfo.name || 'user'}_${skinTone}_${sessionId || 'session'}`;
  
  // Build enhanced mapped identity
  const mappedIdentity = {
    type: avatarTypeMap[userInfo.avatar.type] || defaultIdentity.type,
    skinTone: skinTone,
    culturalProfile: userInfo.avatar.culturalProfile || defaultIdentity.culturalProfile,
    nativeLanguage: userInfo.avatar.nativeLanguage || defaultIdentity.nativeLanguage,
    name: userInfo.name || defaultIdentity.name,
    hairColor: hairColorMap[skinTone] || null, // For story generation only
    skinToneVariation: getSeededSkinToneVariation(skinTone, characterSeed), // For image generation only
    seed: characterSeed // For tier consistency
  };
  
  console.log('🔄 Avatar mapping completed:', {
    input: userInfo.avatar,
    output: mappedIdentity
  });
  
  return mappedIdentity;
}

// ============= KID-FRIENDLY PLACEHOLDER GENERATOR =============
function generateKidFriendlyPlaceholder(pageText: string): { url: string, success: boolean } {
  // Consistent broken wand fallback design matching frontend
  const svgContent = `
    <svg width="400" height="400" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect width="100%" height="100%" fill="#f8f9fa" stroke="#e5e7eb" stroke-width="1"/>
      
      <!-- User's Magic Wand Image -->
      <image 
        x="100" 
        y="50" 
        width="200" 
        height="150" 
        href="/lovable-uploads/30e11866-c281-4957-818d-724155f38846.png"
        preserveAspectRatio="xMidYMid meet"
      />
      
      <!-- Main message - Positioned higher to stay visible in small containers -->
      <text x="200" y="170" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" fill="#374151">
        Images not working right now
      </text>
      <text x="200" y="190" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#6b7280">
        Please try again later
      </text>
    </svg>
  `;
  
  // Convert to data URL for consistent display
  const dataUrl = `data:image/svg+xml;base64,${btoa(svgContent)}`;
  console.log('📸 [TIER-4] Generated kid-friendly placeholder with broken wand design');
  
  return {
    url: dataUrl,
    success: true
  };
}

// ============= TIER 1 RUNWARE PREMIUM GENERATION =============
async function generateWithRunwarePremium(
  apiKey: string,
  positivePrompt: string,
  negativePrompt: string,
  seed?: number,
  sessionId?: string,
  pageNumber?: number,
  requestId?: string
): Promise<any> {
  console.log(`🚀 [${requestId || 'unknown'}] Starting Runware Premium Generation:`, {
    sessionId,
    pageNumber,
    promptLength: positivePrompt.length,
    negativePromptLength: negativePrompt.length,
    seed: seed || 'random'
  });

  // ENHANCED LOGGING: Full prompt details for debugging
  console.log(`🎨 [${requestId || 'unknown'}] FULL Runware Prompt (${positivePrompt.length} chars):`, positivePrompt.substring(0, 200) + (positivePrompt.length > 200 ? '...' : ''));
  console.log(`🚫 [${requestId || 'unknown'}] NEGATIVE Prompt (${negativePrompt.length} chars):`, negativePrompt.substring(0, 100) + (negativePrompt.length > 100 ? '...' : ''));

  try {
    const result = await RunwareWebSocketManager.connectWithRetry(
      apiKey,
      positivePrompt,
      negativePrompt,
      seed,
      sessionId,
      pageNumber,
      1, // attempt number
      requestId
    );

    console.log(`✅ [${requestId || 'unknown'}] Runware Premium Generation Success:`, {
      sessionId,
      pageNumber,
      imageURL: result.imageURL,
      seed: result.seed,
      provider: result.provider,
      tier: result.tier
    });

    return {
      success: true,
      ...result
    };
  } catch (error) {
    console.error(`❌ [${requestId || 'unknown'}] Runware Premium Generation Failed:`, error);
    throw error;
  }
}

// Phase 2: Enhanced Backend Orchestrator for All Image Generation Tiers
// Now handles: AI Enhancement → Tier 1 → Tier 2 → Tier 2.5 → Tier 3 → Tier 4
serve(async (req) => {
  console.log(`🎯 Image Generation Orchestrator: ${req.method} ${req.url}`);

  // BULLETPROOFING: Startup diagnostics
  console.log('🔍 Tier 1 System Status Check:', {
    hasRunwareApiKey: !!Deno.env.get('RUNWARE_API_KEY'),
    timestamp: new Date().toISOString(),
    requestMethod: req.method
  });

  // Monitor request for header analytics
  monitorRequest(req, 'runware-generate-image');
  
  // Handle CORS preflight requests - BULLETPROOF DYNAMIC SYSTEM
  if (req.method === 'OPTIONS') {
    console.log('🔄 BULLETPROOF Dynamic CORS preflight - Auto-detecting headers');
    return createDynamicCorsOptionsResponse(req);
  }

  // Handle GET requests with health check (FIX: Add debugging endpoint)
  if (req.method === 'GET') {
    const apiKey = Deno.env.get('RUNWARE_API_KEY');
    console.log('🔍 GET request received - returning health check');
    
    return createDynamicCorsResponse({
      status: 'healthy',
      function: 'runware-generate-image',
      method: 'GET',
      timestamp: new Date().toISOString(),
      api_key_configured: !!apiKey,
      api_key_length: apiKey?.length || 0,
      supported_methods: ['POST'],
      health_check: 'OK',
      deployment_info: {
        tier_system: '5-tier fallback (1->2->2.5->3->4)',
        primary_provider: 'Runware AI',
        fallback_providers: ['Template-based', 'Nuclear hardcoded', 'OpenAI DALL-E', 'SVG placeholder']
      },
      usage: {
        method: 'POST',
        required_fields: ['pageText', 'userInfo', 'sessionId', 'storyId'],
        optional_fields: ['pageNumber', 'isGuestUser', 'enhancedStoryData', 'forceTier']
      },
      corsSystem: 'BULLETPROOF_DYNAMIC'
    }, req);
  }

  // Validate request method (FIX: Ensure only POST requests proceed)
  if (req.method !== 'POST') {
    console.error(`❌ Invalid request method: ${req.method}`);
    return createDynamicCorsErrorResponse(`Method ${req.method} not allowed. Use POST for image generation or GET for health check.`, req, 405);
  }

  // Validate API key
  const apiKey = Deno.env.get('RUNWARE_API_KEY');
  if (!apiKey) {
    console.error('❌ CRITICAL: RUNWARE_API_KEY not found in environment');
    console.error('📋 Available env vars:', Object.keys(Deno.env.toObject()).filter(key => key.includes('API')));
    return createDynamicCorsErrorResponse('Server configuration error: Missing Runware API key', req, 500);
  }
  
  // Enhanced API key validation - fixed for all Runware API key formats
  if (apiKey.length < 10) {
    console.error('❌ CRITICAL: RUNWARE_API_KEY appears too short (less than 10 chars)');
    return createDynamicCorsErrorResponse('Server configuration error: Invalid API key format', req, 500);
  }
  
  // Let Runware API validate the actual key format - don't enforce prefix locally
  
  console.log('✅ RUNWARE_API_KEY validated - length:', apiKey.length, 'chars');
  console.log('🎯 TIER 1 (Runware) - Starting AI-Enhanced Premium Generation');

  // Initialize variables at function scope (FIX: Prevent ReferenceError)
  let isGuestUser = false;
  let pageText = '';
  let userInfo = null;
  let sessionId = '';
  let storyId = '';
  let pageNumber = 1;
  let enhancedStoryData = null;
  let forceTier = null;

  try {
    // ============= REQUEST PARSING WITH DEBUG =============
    console.log('📨 Parsing request body...');
    
    // Validate Content-Type for POST requests (FIX: Ensure proper JSON)
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error(`❌ Invalid Content-Type: ${contentType || 'missing'}`);
      return createDynamicCorsErrorResponse('Content-Type must be application/json for POST requests', req, 400);
    }
    
    // Parse request with enhanced error handling (FIX: Catch JSON parse errors)
    let requestBody;
    try {
      const rawBody = await req.text();
      if (!rawBody || rawBody.trim().length === 0) {
        console.error('❌ Empty request body received');
        return createDynamicCorsErrorResponse('Request body cannot be empty', req, 400);
      }
      
      requestBody = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError.message);
      return createDynamicCorsErrorResponse(`Invalid JSON in request body: ${parseError.message}`, req, 400);
    }
    // Extract and validate parameters (FIX: Enhanced validation with defaults)
    const extractedParams = requestBody || {};
    
    pageText = extractedParams.pageText || '';
    userInfo = extractedParams.userInfo || null;
    storyId = extractedParams.storyId || '';
    sessionId = extractedParams.sessionId || '';
    pageNumber = extractedParams.pageNumber || 1;
    isGuestUser = extractedParams.isGuestUser || false; // Default to false for analytics tracking
    enhancedStoryData = extractedParams.enhancedStoryData || null;
    forceTier = extractedParams.forceTier || null;
    
    console.log('✅ Request body parsed successfully');
    console.log('📊 DEBUG: Request parameters:', {
      hasPageText: !!pageText,
      pageTextLength: pageText?.length || 0,
      pageTextPreview: pageText?.substring(0, 50) + (pageText?.length > 50 ? '...' : ''),
      hasUserInfo: !!userInfo,
      userInfoKeys: userInfo ? Object.keys(userInfo) : [],
      sessionId: sessionId?.substring(0, 15) + '...' || 'none',
      storyId: storyId?.substring(0, 15) + '...' || 'none',
      pageNumber,
      isGuestUser,
      forceTier: forceTier || 'auto',
      hasEnhancedStoryData: !!enhancedStoryData,
      requestSize: JSON.stringify(requestBody).length
    });

    // ============================================================================
    // ENHANCED PARAMETER VALIDATION (FIX: More comprehensive validation)
    // ============================================================================
    
    // Validate required parameters with detailed error messages
    if (!pageText || typeof pageText !== 'string' || pageText.trim().length === 0) {
      console.error('❌ Invalid pageText:', { pageText: pageText?.substring(0, 100) });
      return createDynamicCorsErrorResponse('Missing or invalid pageText parameter. Must be a non-empty string.', req, 400);
    }
    
    if (!sessionId || typeof sessionId !== 'string' || sessionId.length < 10) {
      console.error('❌ Invalid sessionId:', { sessionId: sessionId?.substring(0, 20) });
      return createDynamicCorsErrorResponse('Missing or invalid sessionId parameter. Must be a string with at least 10 characters.', req, 400);
    }
    
    if (!storyId || typeof storyId !== 'string' || storyId.length < 5) {
      console.error('❌ Invalid storyId:', { storyId: storyId?.substring(0, 20) });
      return createDynamicCorsErrorResponse('Missing or invalid storyId parameter. Must be a string with at least 5 characters.', req, 400);
    }

    // Validate pageNumber
    if (pageNumber && (typeof pageNumber !== 'number' || pageNumber < 1 || pageNumber > 1000)) {
      console.error('❌ Invalid pageNumber:', { pageNumber });
      return createDynamicCorsErrorResponse('Invalid pageNumber. Must be a number between 1 and 1000.', req, 400);
    }

    // Validate userInfo structure
    if (!userInfo || typeof userInfo !== 'object') {
      console.error('❌ Invalid userInfo:', { userInfo: typeof userInfo });
      return createDynamicCorsErrorResponse('Missing or invalid userInfo parameter. Must be an object.', req, 400);
    }

    // Log successful parameter validation
    console.log('✅ Enhanced parameter validation passed:', {
      pageTextLength: pageText.length,
      sessionIdLength: sessionId.length,
      storyIdLength: storyId.length,
      pageNumber,
      userType: isGuestUser ? 'GUEST' : 'PREMIUM'
    });

    // ============================================================================
    // PHASE 4: CRITICAL SECURITY VALIDATION
    // ============================================================================
    // ============================================================================
    
    // Validate required parameters
    if (!pageText) {
      return createDynamicCorsErrorResponse('Missing pageText parameter', req, 400);
    }
    
    if (!sessionId) {
      return createDynamicCorsErrorResponse('Missing sessionId parameter', req, 400);
    }
    
    if (!storyId) {
      return createDynamicCorsErrorResponse('Missing storyId parameter', req, 400);
    }

    // Security validation
    const securityCheck = await SecurityValidator.validateImageRequest(req, {
      pageText,
      sessionId,
      pageNumber,
      userInfo
    });
    
    if (!securityCheck.valid) {
      console.error('🚨 Security validation failed:', securityCheck.reason);
      return createDynamicCorsErrorResponse(`Security validation failed: ${securityCheck.reason}`, req, securityCheck.status || 403);
    }

    // Rate limiting check
    const rateLimitCheck = await SecurityValidator.checkRateLimit(sessionId, 'image_generation');
    if (!rateLimitCheck.allowed) {
      console.error('🚨 Rate limit exceeded for session:', sessionId);
      return createDynamicCorsErrorResponse('Rate limit exceeded. Please try again later.', req, 429);
    }

        console.log(`🎯 Starting image orchestration for page ${pageNumber} (Guest: ${isGuestUser || false})`);
        console.log(`🧠 Enhanced data available: ${enhancedStoryData ? 'Yes' : 'No'}`);
        console.log('🔍 TIER SYSTEM DEBUG - Starting orchestrated tier progression', {
          pageText: pageText.substring(0, 100) + '...',
          userInfo: !!userInfo,
          sessionId,
          pageNumber,
          totalPages: 'unknown',
          forceTier: forceTier || 'auto',
          timestamp: new Date().toISOString()
        });

    // PHASE 1: Avatar Identity Mapper - Process user avatar data once at orchestrator level
    const avatarIdentity = mapAvatarIdentity(userInfo, sessionId);
    console.log(`👤 Avatar Identity Mapped: ${avatarIdentity.type}/${avatarIdentity.skinTone} - Cultural: ${avatarIdentity.culturalProfile}`);
    
    // ORCHESTRATOR SCOPE: Initialize shared variables for nuclear independence
    let characterData = null; // Safe default - will be populated by Tier 1 if successful
    console.log('🛡️ Orchestrator: Initialized characterData to null for nuclear scope safety');
    
    // ENHANCED AVATAR MAPPING DEBUG
    console.log(`🔍 AVATAR MAPPING DETAILED DEBUG:`, {
      input: {
        userInfoAvatar: userInfo?.avatar,
        userInfoName: userInfo?.name,
        userInfoId: userInfo?.id
      },
      output: {
        type: avatarIdentity.type,
        skinTone: avatarIdentity.skinTone,
        culturalProfile: avatarIdentity.culturalProfile,
        nativeLanguage: avatarIdentity.nativeLanguage,
        name: avatarIdentity.name
      },
      mapping: `${userInfo?.avatar?.type || 'unknown'}/${userInfo?.avatar?.skinTone || 'unknown'} → ${avatarIdentity.type}/${avatarIdentity.skinTone}`
    });

    // ============================================================================ 
    // TIER 1: AI-Enhanced High-Quality - PROVIDED TO ALL USERS
    // ============================================================================
    // CRITICAL: This tier is available to BOTH guest and premium users
    // The isGuestUser flag is for analytics/tracking ONLY, not tier restrictions
    if (!forceTier || forceTier === 1) {
      try {
        console.log('🧠 Starting Tier 1: AI-Enhanced High-Quality Generation');
        console.log('🔍 TIER 1 DEBUG - Calling ai-visual-scene-creator directly (clean architecture)');
        
        // Call ai-visual-scene-creator directly with pre-processed avatar identity
        // CRITICAL FIX: Add difficultyLevel mapping for Tier 1
        const mappedDifficulty = DifficultyLevelMapper.mapToImageDifficulty(userInfo);
        
        // CRITICAL: Log prompt flow debugging before calling AI scene creator
        console.log('🔍 [PROMPT-FLOW] AI-SCENE-CREATOR: Calling ai-visual-scene-creator', {
          sessionId,
          pageNumber,
          promptPreview: pageText.substring(0, 100) + '...',
          stage: 'ai-visual-scene-creator',
          metadata: { 
            userInfo: userInfo?.name, 
            difficultyLevel: mappedDifficulty,
            timestamp: Date.now()
          }
        });

        const aiEnhancerResult = await callTierFunction('ai-visual-scene-creator', {
          storyText: pageText,
          userInfo,
          storyId,
          sessionId,
          pageNumber,
          avatarIdentity, // Pass pre-processed avatar identity directly
          enhancedStoryData,
          difficultyLevel: mappedDifficulty // CRITICAL FIX: Add missing difficultyLevel parameter
        });

        // CRITICAL: Log AI scene creator response for prompt flow debugging
        console.log('🔍 [PROMPT-FLOW] AI-SCENE-CREATOR: Response received', {
          sessionId,
          pageNumber,
          success: aiEnhancerResult.success,
          hasAiSchema: !!aiEnhancerResult.aiSchema,
          aiSchemaKeys: aiEnhancerResult.aiSchema ? Object.keys(aiEnhancerResult.aiSchema) : [],
          stage: 'ai-visual-scene-creator-response',
          metadata: { responseSize: JSON.stringify(aiEnhancerResult).length }
        });

        console.log('🔍 TIER 1 DEBUG - AI enhancer returned pure schema, doing direct technical assembly in orchestrator');
        
        if (!aiEnhancerResult.success) {
          throw new Error(`AI enhancer failed: ${aiEnhancerResult.error || 'Unknown error'}`);
        }

        // Get the pure AI schema from enhancer
        const aiSchema = aiEnhancerResult.aiSchema;
        
        // PHASE 2: DIRECT TECHNICAL ASSEMBLY IN ORCHESTRATOR
        console.log('🔧 Orchestrator: Starting direct technical assembly');
        
        // 0. VISUAL DETAIL ANALYSIS FIRST - Must run before character building
        try {
          const { VisualDetailTracker } = await import('../_shared/VisualDetailTracker.ts');
          const characterName = avatarIdentity?.name || userInfo?.name || 'child';
          await VisualDetailTracker.analyzeTextForDetails(sessionId, pageText, pageNumber || 1, characterName);
          console.log(`🎨 [${requestId}] Visual details analyzed before character building`);
        } catch (error) {
          console.log(`⚠️ [${requestId}] Visual detail analysis failed:`, error.message);
        }
        
        // Import services for direct assembly
        const { CharacterConsistencyService } = await import('../_shared/CharacterConsistencyService.ts');
        const { getStyleFramework } = await import('../_shared/styleFrameworks.js');
        const { validateAvatarConsistency } = await import('../_shared/avatarConsistency.js');
        
        // Initialize character consistency service
        const characterService = new CharacterConsistencyService();
        
        // 1. Character Consistency Generation - Update orchestrator scope variable
        characterData = await characterService.getCharacterSeed(
          sessionId,
          avatarIdentity,
          pageText,
          'standard'
        );
        console.log('✅ Orchestrator: characterData successfully populated by Tier 1');
        
        // 2. Style Framework Application - Map grade level to difficulty
        const gradeLevelToDifficulty = (grade) => {
          const gradeStr = String(grade).toLowerCase();
          if (gradeStr === 'k' || gradeStr === 'kindergarten') return 'beginner';
          if (['1', '2'].includes(gradeStr)) return 'easy';
          if (['3', '4'].includes(gradeStr)) return 'medium';
          if (['5', '6'].includes(gradeStr)) return 'hard';
          return 'expert'; // 7+
        };
        
        const difficulty = gradeLevelToDifficulty(userInfo.gradeLevel || 'K');
        const storyFramework = getStyleFramework(difficulty);
        
        // 3. Avatar Validation - Fix parameter order
        const validatedAvatar = validateAvatarConsistency('', avatarIdentity, userInfo);
        
        // PHASE 5: Generate unique request ID for cross-function correlation
        const requestId = `IMG-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
        console.log(`🎯 [${requestId}] Starting Runware prompt assembly phase`);

        // PHASE 4: Enhanced 5-Section Architecture prompt construction
        
        // Helper function to detect if user is Level 0-1 (beginner/easy)
        const isLevel01User = difficulty === 'beginner' || difficulty === 'easy';
        
        // CRITICAL CULTURAL CONTEXT GENERATOR
        // REGRESSION PREVENTION: This function handles cultural representation for diverse users
        // DO NOT MODIFY the cultural detection logic without comprehensive testing
        const generateCulturalContext = (avatarIdentity: any, userInfo: any, requestId: string, characterData?: any) => {
          const skinTone = avatarIdentity?.skinTone;
          const nativeLanguage = avatarIdentity?.nativeLanguage || userInfo?.native_language || 'en';
          
          // AFRICAN DIASPORA CULTURAL DETECTION SYSTEM
          // REGRESSION WARNING: This logic ensures proper representation for African diaspora users
          // Detection criteria: 'dark' skin tone + languages from African diaspora regions
          // - 'en' (English): African American users in US/UK/Canada/Australia
          // - 'fr' (French): Francophone African/Afro-Caribbean users  
          // - 'es' (Spanish): Afro Latino users in Spanish-speaking countries
          // - 'pt' (Portuguese): Afro Brazilian/Lusophone African users
          // DO NOT remove any of these language combinations
          if (skinTone === 'dark' && (nativeLanguage === 'en' || nativeLanguage === 'fr' || nativeLanguage === 'es' || nativeLanguage === 'pt')) {
            try {
              const isGirl = avatarIdentity?.type?.toLowerCase().includes('girl') || 
                           avatarIdentity?.type?.toLowerCase().includes('female');
              const hairstyles = isGirl ? HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES.girls : HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES.boys;
              
              // Attempt to access detailed arrays
              if (hairstyles && hairstyles.length > 0 && 
                  HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES && HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES.length > 0) {
                
                // Use stored selections if available, otherwise make random selection and store
                let features, hairstyle;
                if (characterData?.selectedCulturalFeatures && characterData?.selectedCulturalHair) {
                  features = characterData.selectedCulturalFeatures;
                  hairstyle = characterData.selectedCulturalHair;
                  console.log(`🌍 [${requestId}] Using stored cultural selections - Hair: ${hairstyle.substring(0, 30)}..., Features: ${features.substring(0, 30)}...`);
                } else {
                  features = HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES[Math.floor(Math.random() * HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES.length)];
                  hairstyle = hairstyles[Math.floor(Math.random() * hairstyles.length)];
                  console.log(`🎲 [${requestId}] Generated new cultural selections - Hair: ${hairstyle.substring(0, 30)}..., Features: ${features.substring(0, 30)}...`);
                }
                  // Store new cultural selections in character consistency
                  if (!characterData?.selectedCulturalFeatures && !characterData?.selectedCulturalHair) {
                    try {
                      const { CharacterConsistencyService } = await import('../_shared/CharacterConsistencyService.ts');
                      const characterService = new CharacterConsistencyService();
                      const characterName = avatarIdentity?.name || userInfo?.name || 'child';
                      const cacheKey = `${sessionId}_${characterName}`;
                      await characterService.updateCulturalSelections(sessionId, cacheKey, hairstyle, features);
                      console.log(`💾 [${requestId}] Stored cultural selections for future consistency`);
                    } catch (error) {
                      console.warn(`⚠️ [${requestId}] Failed to store cultural selections:`, error);
                    }
                  }
                
                // CULTURAL LABEL MAPPING - DO NOT MODIFY
                // This maps language codes to accurate cultural identities for the African diaspora
                const culturalLabel = nativeLanguage === 'en' ? 'African American' :      // US/Canada/UK/Australia
                                   nativeLanguage === 'fr' ? 'Francophone African' :    // France/Quebec/West Africa
                                   (nativeLanguage === 'es' || nativeLanguage === 'pt') ? 'Afro Latino' : // Latin America/Brazil
                                   'African American'; // Fallback for edge cases
                
                console.log(`🌍 [${requestId}] ${culturalLabel} detailed context applied (dark skin + ${nativeLanguage})`);
                return `${culturalLabel} heritage: ${hairstyle}, ${features}`;
              }
            } catch (error) {
              console.warn(`⚠️ [${requestId}] African American detailed arrays failed:`, error);
            }
            
            // CRITICAL FALLBACK: Always provide cultural context for African diaspora users
            // REGRESSION PREVENTION: This fallback ensures representation even when detailed arrays fail
            // DO NOT remove this fallback - it's essential for cultural accuracy
            const culturalLabel = nativeLanguage === 'en' ? 'African American' :        // English speakers
                                 nativeLanguage === 'fr' ? 'Francophone African' :      // French speakers  
                                 (nativeLanguage === 'es' || nativeLanguage === 'pt') ? 'Afro Latino' :  // Spanish/Portuguese speakers
                                 'African American'; // Safe fallback
            
            console.log(`🌍 [${requestId}] ${culturalLabel} fallback context applied (arrays unavailable)`);
            return `authentic ${culturalLabel} features required`;
          }
          
          // OTHER LANGUAGE USERS (any skin tone, non-English languages)
          if (nativeLanguage !== 'en') {
            try {
              if (REGIONAL_AUTHENTICITY_STRINGS && REGIONAL_AUTHENTICITY_STRINGS[nativeLanguage]) {
                console.log(`🌍 [${requestId}] Regional authenticity context applied for ${nativeLanguage}`);
                return REGIONAL_AUTHENTICITY_STRINGS[nativeLanguage];
              }
            } catch (error) {
              console.warn(`⚠️ [${requestId}] Regional authenticity strings failed for ${nativeLanguage}:`, error);
            }
            
            // OTHER LANGUAGE FALLBACK: Generic cultural context for non-English speakers
            console.log(`🌍 [${requestId}] Generic cultural fallback applied for ${nativeLanguage}`);
            return "culturally authentic features required";
          }
          
          // ENGLISH SPEAKERS WITH NON-DARK SKIN: Intentionally return null (no cultural context needed)
          console.log(`🌍 [${requestId}] No cultural context needed (English speaker, non-dark skin)`);
          return null;
        };
        
        // Helper function to generate story context with optimized Level 3-4 support
        const generateStoryContext = (pageText: string, difficulty: string, requestId: string) => {
          if (!isLevel01User) return null;
          
          if (!pageText || pageText.length < 10) return null;
          
          // Smart sentence detection for complex punctuation
          const smartSentenceSplit = (text: string): string[] => {
            // Enhanced regex to handle dialogue, complex punctuation, and multi-clause sentences
            const sentenceRegex = /[.!?]+(?=\s+[A-Z]|$)/g;
            const parts = text.trim().split(sentenceRegex);
            return parts
              .map(part => part.trim())
              .filter(part => part.length > 0)
              .map((part, index, array) => {
                // Add back punctuation if not the last part
                return index < array.length - 1 ? part + '.' : part;
              });
          };
          
          // Level-based story context: Full for Level 0-1, optimized for Level 2-4
          if (mappedDifficulty === 0 || mappedDifficulty === 1) {
            console.log(`📖 [${requestId}] Full story context provided for Level ${mappedDifficulty} user`);
            return pageText.trim();
          } else if (mappedDifficulty === 2) {
            // Level 2: Return first 2 sentences (existing logic maintained)
            const sentences = smartSentenceSplit(pageText);
            const firstTwoSentences = sentences.slice(0, 2).join(' ').trim();
            console.log(`📖 [${requestId}] First 2 sentences provided for Level ${mappedDifficulty} user: "${firstTwoSentences.substring(0, 50)}${firstTwoSentences.length > 50 ? '...' : ''}"`);
            return firstTwoSentences;
          } else {
            // Level 3-4: Return first 3 sentences with minimum character threshold
            const sentences = smartSentenceSplit(pageText);
            const firstThreeSentences = sentences.slice(0, 3).join(' ').trim();
            
            // Ensure minimum 150 character threshold for meaningful context
            if (firstThreeSentences.length >= 150 || sentences.length <= 3) {
              console.log(`📖 [${requestId}] First 3 sentences provided for Level ${mappedDifficulty} user (${firstThreeSentences.length} chars): "${firstThreeSentences.substring(0, 50)}${firstThreeSentences.length > 50 ? '...' : ''}"`);
              return firstThreeSentences;
            } else {
              // If first 3 sentences are too short, extend to 4 sentences or full text
              const extendedContext = sentences.slice(0, 4).join(' ').trim();
              console.log(`📖 [${requestId}] Extended to 4 sentences for Level ${mappedDifficulty} user (${extendedContext.length} chars): "${extendedContext.substring(0, 50)}${extendedContext.length > 50 ? '...' : ''}"`);
              return extendedContext;
            }
          }
        };
        
        console.log(`🎨 [${requestId}] Style Framework Retrieved:`, {
          difficulty,
          frameworkName: storyFramework.name,
          gradeLevel: userInfo.gradeLevel || 'K',
          hasAllComponents: {
            frameworkPrompt: !!storyFramework.frameworkPrompt,
            negativePrompt: !!storyFramework.negativePrompt
          }
        });
        
        // RESTRUCTURED 5-SECTION ARCHITECTURE
        const promptSections = {
          primaryScene: '',
          character: '',
          sceneDetails: '',
          storyContext: '',
          brandSuffix: ''
        };
        
        // 1. PRIMARY SCENE (First - establishes main visual context)
        if (aiSchema.primaryScene) {
          promptSections.primaryScene = aiSchema.primaryScene;
          console.log(`🎯 [${requestId}] Section 1 - Primary Scene Added:`, {
            length: aiSchema.primaryScene.length,
            preview: aiSchema.primaryScene.substring(0, 150) + '...',
            source: 'AI-enhanced primaryScene'
          });
        } else {
          console.warn(`⚠️ [${requestId}] Missing primaryScene from AI schema - Triggering Tier 2.5 fallback`);
          throw new Error('PRIMARY_SCENE_MISSING - Triggering Tier 2.5 fallback');
        }
        
        // 2. CHARACTER (Character + Cultural Context unified)
        let characterSection = '';
        if (characterData.characterDescription) {
          characterSection = characterData.characterDescription;
          console.log(`✅ [${requestId}] Section 2 - Character Description Added:`, {
            length: characterData.characterDescription.length,
            preview: characterData.characterDescription.substring(0, 100) + '...',
            seed: characterData.seed,
            source: 'CharacterConsistencyService'
          });
        } else {
          console.warn(`⚠️ [${requestId}] Missing character description`);
        }
        
        const culturalContext = generateCulturalContext(avatarIdentity, userInfo, requestId, characterData);
        if (culturalContext) {
          characterSection += characterSection ? `, ${culturalContext}` : culturalContext;
          console.log(`🌍 [${requestId}] Section 2 - Cultural Context Unified:`, {
            content: culturalContext.substring(0, 100) + '...',
            skinTone: avatarIdentity?.skinTone,
            language: avatarIdentity?.nativeLanguage || userInfo?.native_language,
            source: 'cultural description arrays'
          });
        } else {
          console.log(`🌍 [${requestId}] Section 2 - Cultural Context Skipped (English speaker with non-dark skin)`);
        }
        
        if (characterSection) {
          promptSections.character = characterSection;
        }
        
        // 3. SCENE DETAILS (Secondary Elements)
        let sceneDetailsSection = '';
        
        // 3.1. Secondary Elements
        try {
          const { SecondaryElementDetector } = await import('../_shared/SecondaryElementDetector.ts');
          const secondaryElements = await SecondaryElementDetector.parseElements(
            sessionId,
            promptSections.primaryScene, // Use primary scene
            pageText,
            pageNumber || 1
          );
          
          if (secondaryElements && secondaryElements.length > 0) {
            // PHASE 3.1b: Get seed-consistent descriptions for secondary characters
            const { CharacterConsistencyService } = await import('../_shared/CharacterConsistencyService.ts');
            const characterConsistencyService = new CharacterConsistencyService();
            
            const seededSecondaryDescriptions = await Promise.all(
              secondaryElements.slice(0, 4).map(async (el) => {
                if (el.type === 'secondary_character') {
                  try {
                    const secondaryCharacterSeed = await characterConsistencyService.getSecondaryCharacterSeed(
                      sessionId, 
                      el.name, 
                      'secondary_character'
                    );
                    const seedDescription = await characterConsistencyService.generateSecondaryCharacterDescription(
                      el.name, 
                      'secondary_character', 
                      secondaryCharacterSeed
                    );
                    console.log(`👤 [${requestId}] Secondary character seed applied: ${el.name} -> ${seedDescription} (seed: ${secondaryCharacterSeed})`);
                    return `${el.name}: ${seedDescription}`;
                  } catch (error) {
                    console.warn(`⚠️ [${requestId}] Secondary character seed failed for ${el.name}:`, error.message);
                    return `${el.name} (${el.type})`;
                  }
                } else {
                  return `${el.name} (${el.type})`;
                }
              })
            );
            
            const secondaryDescription = seededSecondaryDescriptions.join(', ');
            sceneDetailsSection = `Secondary characters and elements: ${secondaryDescription}`;
            console.log(`👥 [${requestId}] Section 3 - Seeded Secondary Elements Added:`, {
              content: secondaryDescription,
              count: secondaryElements.length,
              seedsApplied: seededSecondaryDescriptions.filter(desc => desc.includes(':')).length,
              source: 'SecondaryElementDetector + CharacterConsistencyService'
            });
          }
        } catch (error) {
          console.log(`⚠️ [${requestId}] Secondary elements detection failed:`, error.message);
        }
        
        // ============= ANALYZE PAGE TEXT FOR VISUAL DETAILS =============
        // Add visual detail analysis for consistent object tracking
        try {
          const { VisualDetailTracker } = await import('../_shared/VisualDetailTracker.ts');
          await VisualDetailTracker.analyzeTextForDetails(
            sessionId, 
            pageText, 
            pageNumber || 1, 
            characterData?.characterName || 'child'
          );
          console.log(`🔍 [${requestId}] Page text analyzed for visual details`);
        } catch (error) {
          console.warn(`⚠️ [${requestId}] Visual detail analysis failed:`, error.message);
        }
        
        // 3.2. Visual Details & Colored Objects (automatically integrated from database)
        try {
          const { VisualDetailTracker } = await import('../_shared/VisualDetailTracker.ts');
          
          // Get general visual consistency details
          const visualDetails = await VisualDetailTracker.getVisualDetailsForPrompt(sessionId);
          if (visualDetails) {
            const visualDetailsText = `Consistency details: ${visualDetails}`;
            sceneDetailsSection += sceneDetailsSection ? `, ${visualDetailsText}` : visualDetailsText;
            console.log(`🎯 [${requestId}] Section 3 - Consistency Details:`, {
              content: visualDetails,
              source: 'VisualDetailTracker (pre-processed)'
            });
          }
          
          // ============= NEW: GET COLORED OBJECTS FOR RICH DESCRIPTIONS =============
          const coloredObjects = await VisualDetailTracker.buildObjectDescription(sessionId);
          if (coloredObjects) {
            const coloredObjectsText = `Colored objects: ${coloredObjects}`;
            sceneDetailsSection += sceneDetailsSection ? `, ${coloredObjectsText}` : coloredObjectsText;
            console.log(`🎨 [${requestId}] Section 3 - Colored Objects Added:`, {
              content: coloredObjects,
              count: coloredObjects.split(',').length,
              source: 'VisualDetailTracker.buildObjectDescription (enhanced vocabulary)'
            });
          }
          
        } catch (error) {
          console.log(`⚠️ [${requestId}] Visual detail retrieval failed:`, error.message);
        }
        
        if (sceneDetailsSection) {
          promptSections.sceneDetails = sceneDetailsSection;
        }
        
        // 4. STORY CONTEXT (Level 0-1 only)
        const storyContext = generateStoryContext(pageText, difficulty, requestId);
        if (storyContext) {
          promptSections.storyContext = storyContext;
          console.log(`📖 [${requestId}] Section 4 - Story Context Added:`, {
            content: storyContext,
            level: `${difficulty} (Level 0-1)`,
            source: 'pageText visual extraction'
          });
        } else if (isLevel01User) {
          console.log(`📖 [${requestId}] Section 4 - Story Context Skipped (no visual keywords found)`);
        } else {
          console.log(`📖 [${requestId}] Section 4 - Story Context Skipped (Level 2+ user)`);
        }
        
        // 5. BRAND SUFFIX (Framework Prompt)
        if (storyFramework.frameworkPrompt) {
          promptSections.brandSuffix = storyFramework.frameworkPrompt;
          console.log(`🎨 [${requestId}] Section 5 - Brand Suffix Added:`, {
            content: storyFramework.frameworkPrompt,
            source: 'styleFramework.frameworkPrompt'
          });
        }
        
        // Generate nuclear negative prompt with comprehensive protection
        const culturalProfile = detectCulturalProfileForNegatives(userInfo, avatarIdentity);
        const avatarType = avatarIdentity?.type || userInfo?.avatar?.type || 'prefer-not-to-answer';
        const nuclearNegativePrompt = generateNuclearNegativePrompt(
          culturalProfile, 
          avatarType, 
          mappedDifficulty, 
          pageNumber
        );
        
        // Build comprehensive prompts with optimal ordering
        const promptParts = [];
        if (promptSections.primaryScene) {
          promptParts.push(`Primary Scene: ${promptSections.primaryScene}`);
        }
        if (promptSections.character) {
          promptParts.push(`Character: ${promptSections.character}`);
        }
        if (promptSections.storyContext) {
          promptParts.push(`Story Context: ${promptSections.storyContext}`);
        }
        if (promptSections.sceneDetails) {
          promptParts.push(`Scene Details: ${promptSections.sceneDetails}`);
        }
        if (promptSections.brandSuffix) {
          promptParts.push(`Brand Suffix: ${promptSections.brandSuffix}`);
        }
        
        const enhancedPrompt = promptParts.join('\n');
        const negativePrompt = nuclearNegativePrompt;
        
        // PHASE 4: Comprehensive prompt assembly logging
        console.log(`🔧 [${requestId}] Runware Prompt Assembly Complete:`, {
          totalSections: promptParts.length,
          finalPromptLength: enhancedPrompt.length,
          difficulty,
          frameworkName: storyFramework.name,
          sectionBreakdown: {
            primaryScene: promptSections.primaryScene ? `${promptSections.primaryScene.length} chars` : 'missing',
            character: promptSections.character ? `${promptSections.character.length} chars` : 'missing',
            sceneDetails: promptSections.sceneDetails ? `${promptSections.sceneDetails.length} chars` : 'missing',
            storyContext: promptSections.storyContext ? `${promptSections.storyContext.length} chars` : 'missing',
            brandSuffix: promptSections.brandSuffix ? `${promptSections.brandSuffix.length} chars` : 'missing'
          },
          componentStatus: {
            hasCharacterData: !!promptSections.character,
            hasPrimaryScene: !!promptSections.primaryScene,
            hasSceneDetails: !!promptSections.sceneDetails,
            hasStoryContext: !!promptSections.storyContext,
            hasBrandSuffix: !!promptSections.brandSuffix
          },
          negativePromptLength: negativePrompt.length,
          assemblyMethod: 'header-structured 5-section architecture'
        });

        // COMPREHENSIVE DEBUGGING: Full prompt logging (no truncation for debugging)
        console.log(`🎯 [${requestId}] FULL Runware Prompt (${enhancedPrompt.length} chars):`);
        console.log(`📝 [${requestId}] COMPLETE POSITIVE PROMPT:`, enhancedPrompt);
        console.log(`🚫 [${requestId}] COMPLETE NEGATIVE PROMPT:`, negativePrompt);
        console.log(`🏗️ [${requestId}] 5-SECTION ARCHITECTURE SUMMARY:`, {
          'Section 1': 'Primary Scene: AI-enhanced scene description',
          'Section 2': 'Character: Character + cultural context unified',
          'Section 3': 'Scene Details: Secondary elements',
          'Section 4': 'Story Context: Page text context (Level 0-1 only)',
          'Section 5': 'Brand Suffix: Style framework prompt'
        });
        
        // Avatar mapping debug logging
        console.log(`👤 [${requestId}] AVATAR MAPPING DEBUG:`, {
          originalAvatarType: userInfo?.avatar?.type,
          originalSkinTone: userInfo?.avatar?.skinTone,
          mappedAvatarType: avatarIdentity.type,
          mappedSkinTone: avatarIdentity.skinTone,
          culturalProfile: avatarIdentity.culturalProfile,
          nativeLanguage: avatarIdentity.nativeLanguage,
          characterName: userInfo?.name || 'child'
        });
        
        // Character consistency debug logging
        console.log(`🎭 [${requestId}] CHARACTER CONSISTENCY DEBUG:`, {
          characterSeed: characterData.seed,
          characterDescription: characterData.characterDescription,
          characterDescriptionLength: characterData.characterDescription?.length || 0,
          hasCharacterData: !!characterData.characterDescription
        });

        const enhancementResult = {
          enhancedPrompt,
          negativePrompt,
          metadata: {
            processingTier: 'tier-1-orchestrator-direct',
            aiEnhancement: true,
            characterSeed: characterData.seed,
            segmentCount: promptParts.length,
            requestId: requestId, // PHASE 5: Cross-function correlation
            ...aiEnhancerResult.metadata
          }
        };
        
        // PHASE 4: Detailed avatar validation with before/after comparison
        console.log(`🔍 [${requestId}] Avatar Validation Phase - Before:`, {
          promptLength: enhancedPrompt.length,
          avatarIdentityType: avatarIdentity.type,
          avatarIdentitySkinTone: avatarIdentity.skinTone,
          promptPreview: enhancedPrompt.substring(0, 150) + '...'
        });

        const validatedPrompt = validateAvatarConsistency(enhancedPrompt, avatarIdentity, userInfo);

        console.log(`🔍 [${requestId}] Avatar Validation Phase - After:`, {
          originalLength: enhancedPrompt.length,
          validatedLength: validatedPrompt.length,
          changed: enhancedPrompt !== validatedPrompt,
          lengthDifference: validatedPrompt.length - enhancedPrompt.length,
          validatedPreview: validatedPrompt.substring(0, 150) + '...',
          validationApplied: enhancedPrompt !== validatedPrompt ? 'YES - fallback used' : 'NO - passed validation'
        });

        console.log(`🎨 [${requestId}] Final Tier 1 Prompt Ready for Runware (${validatedPrompt.length} chars):`, 
          validatedPrompt.substring(0, 200) + (validatedPrompt.length > 200 ? '...' : ''));

        // CRITICAL: Log prompt flow for debugging 
        console.log('🔍 [PROMPT-FLOW] RUNWARE: Final prompt being sent to Runware API', {
          sessionId,
          pageNumber,
          promptPreview: validatedPrompt.substring(0, 100) + '...',
          stage: 'runware',
          metadata: { 
            promptLength: validatedPrompt.length, 
            negativePromptLength: negativePrompt.length,
            characterSeed: characterData.seed,
            tier: 1
          }
        });

        // PHASE 4: Generate with Runware Tier 1 (Premium) with enhanced logging
        console.log(`🚀 [${requestId}] Initiating Runware Premium Generation:`, {
          apiKeyPresent: !!apiKey,
          promptLength: validatedPrompt.length,
          negativePromptLength: negativePrompt.length,
          characterSeed: characterData.seed,
          sessionId: sessionId,
          pageNumber: pageNumber
        });

        const tier1Result = await generateWithRunwarePremium(
          apiKey, 
          validatedPrompt, 
          negativePrompt, 
          characterData.seed,
          sessionId,
          pageNumber,
          requestId // PHASE 5: Pass requestId for correlation
        );
        
        if (tier1Result.success) {
          console.log('✅ Tier 1 AI-Enhanced succeeded');
          
          // TIER POLICY COMPLIANCE LOG - Critical for regression prevention
          console.log(`🔒 TIER POLICY COMPLIANCE: User type "${isGuestUser ? 'GUEST' : 'PREMIUM'}" received TIER 1 image - Policy maintained`);
          
          // Store visual state for consistency
          if (sessionId && characterData?.seed) {
            try {
              const sessionManager = new SessionStateManager(sessionId);
              await sessionManager.addSuccessfulPrompt(
                validatedPrompt,
                enhancementResult.metadata, 
                characterData.seed,
                tier1Result.imageURL,
                pageNumber
              );
            } catch (error) {
              // NOTE: This is genuinely non-critical - visual state storage is optional for consistency
              console.warn('⚠️ Failed to store visual state (non-critical):', error);
            }
          }

          // PHASE 1: Store successful Tier 1 image prompt with DEBUG  
          console.log('📸 DEBUG: Storing Tier 1 image prompt...');
      const { globalSessionManager } = await import('../_shared/SessionStateManager.ts');
          
          try {
            globalSessionManager.storeImagePrompt(sessionId, {
              tier: '1',
              promptText: validatedPrompt,
              negativePrompt: enhancementResult.negativePrompt || '',
              originalPageText: pageText,
              enhancedPrompt: validatedPrompt,
              pageNumber: pageNumber,
              success: true,
              imageURL: tier1Result.imageURL,
              seed: tier1Result.seed,
              provider: 'runware-premium',
              model: 'runware:100@1',
              cost: 0.01,
              generationTime: 0,
              culturalProfile: enhancementResult.culturalProfile || {},
              styleFramework: enhancementResult.framework || {},
              metadata: {
                aiEnhanced: true,
                characterConsistency: true,
                avatarValidated: true,
                orchestrated: true,
                validationApplied: validatedPrompt !== enhancedPrompt,
                segmentCount: promptParts.length,
                qualityScore: enhancementResult.qualityScore || 95
              }
            });
            console.log('✅ [TIER-1] Stored image prompt for page', pageNumber, 'of session', sessionId);
          } catch (storeError) {
            console.error('❌ Failed to store Tier 1 image prompt:', storeError);
          }

          return createDynamicCorsResponse({
            success: true,
            imageURL: tier1Result.imageURL,
            seed: tier1Result.seed,
            provider: 'runware-orchestrator',
            tier: 1,
            enhancementLevel: 'ai-enhanced-premium',
            qualityScore: enhancementResult.qualityScore || 95,
            metadata: {
              model: "runware:100@1",
              promptLength: validatedPrompt.length,
              sessionId: sessionId || 'unknown',
              pageNumber,
              isGuestUser: isGuestUser,
              orchestrated: true,
              validationApplied: validatedPrompt !== enhancedPrompt,
              segmentCount: promptParts.length,
              characterSeed: characterData?.seed || 'fallback-seed'
            }
          }, req);
        }
        
        console.log('⚠️ Tier 1 failed, falling back to Tier 2.5');
        console.log('🔍 TIER 1 FAILURE DEBUG - Generation failed but no error thrown');
      } catch (error) {
        console.log('⚠️ Tier 1 error, falling back to Tier 2.5:', error.message);
        console.log('🔍 TIER 1 ERROR DEBUG - Full error:', {
          message: error.message,
          stack: error.stack?.substring(0, 200) || 'no stack'
        });
        
        // Enhanced WebSocket debugging
        if (error.message?.includes('timeout') || error.message?.includes('WebSocket')) {
          console.error(`🔌 WEBSOCKET DEBUG - Connection details:`, {
            hasApiKey: !!Deno.env.get('RUNWARE_API_KEY'),
            timestamp: new Date().toISOString(),
            sessionId: sessionId?.substring(0, 15) + '...' || 'none',
            errorType: error.name || 'Unknown'
          });
        }
      }
    }

    // TIER 2.5: Nuclear Hardcoded Fallback
    if (!forceTier || forceTier === 2.5) {
      try {
        console.log('🔧 Starting Tier 2.5: Nuclear Hardcoded Fallback');
        console.log('🔍 TIER 2.5 DEBUG - Calling runware-simple-fallback function (ENHANCED VERSION)');
        console.log('🛡️ TIER 2.5 PRE-CALL VALIDATION - Comprehensive parameter check');
        
        // ORCHESTRATOR PARAMETER RESOLUTION - Ensure all parameters are valid before tier calls
        console.log('🛡️ Orchestrator: Resolving parameters before Tier 2.5 call');
        
        // Resolve characterData - if undefined, set to null for nuclear independence
        let resolvedCharacterData = characterData;
        if (characterData === undefined) {
          resolvedCharacterData = null;
          console.log('⚠️ Orchestrator: characterData was undefined, resolved to null for nuclear independence');
        } else {
          console.log('✅ Orchestrator: characterData is valid, passing through');
        }
        
        // Ensure avatarIdentity is valid
        if (!avatarIdentity) {
          console.error('❌ Orchestrator: avatarIdentity is missing - this should never happen');
          throw new Error('Critical orchestrator error: avatarIdentity is undefined');
        }
        
        // TIER 2.5: Get proper difficulty mapping (same as Tier 1 & 2)
        const { DifficultyLevelMapper } = await import('../_shared/DifficultyLevelMapper.js');
        const mappedDifficulty = DifficultyLevelMapper.mapToImageDifficulty(userInfo);
        
        // Enhanced parameter validation with detailed logging
        console.log('🔍 TIER 2.5 ENHANCED VALIDATION - Complete parameter analysis:', {
          hasPageText: !!pageText,
          pageTextLength: pageText?.length || 0,
          pageTextValid: pageText && pageText.trim().length > 0,
          hasUserInfo: !!userInfo,
          userInfoValid: userInfo && typeof userInfo === 'object',
          hasDifficulty: !!mappedDifficulty,
          difficultyValue: mappedDifficulty,
          hasAvatarIdentity: !!avatarIdentity,
          avatarIdentityValid: avatarIdentity && avatarIdentity.name,
          avatarName: avatarIdentity?.name || 'none',
          characterDataStatus: resolvedCharacterData ? 'valid' : 'null (nuclear)',
          hasSessionId: !!sessionId,
          sessionIdValid: sessionId && sessionId.length > 0,
          allParametersValid: !!(pageText && userInfo && mappedDifficulty && avatarIdentity && sessionId),
          timestamp: new Date().toISOString()
        });
        
        // Additional validation - ensure critical parameters are not empty
        if (!pageText || pageText.trim().length === 0) {
          throw new Error('TIER 2.5 VALIDATION ERROR: pageText is empty or invalid');
        }
        
        if (!sessionId || sessionId.trim().length === 0) {
          throw new Error('TIER 2.5 VALIDATION ERROR: sessionId is empty or invalid');
        }
        
        console.log('🚀 TIER 2.5 CALLING - All validations passed, invoking function...');
        
        const tier25Result = await callTierFunction('runware-simple-fallback', {
          pageText,
          userInfo,
          difficultyLevel: mappedDifficulty,
          avatarIdentity, // Pass optimized avatar identity to all tiers
          characterData: resolvedCharacterData, // Pass resolved character data (null if undefined)
          sessionId // Pass session ID for consistency tracking
        });
        
        console.log('🔍 TIER 2.5 RESULT ANALYSIS - Comprehensive response evaluation:', {
          success: tier25Result?.success || false,
          hasImageURL: !!tier25Result?.imageURL,
          imageURLLength: tier25Result?.imageURL?.length || 0,
          imageURLValid: tier25Result?.imageURL && tier25Result.imageURL.startsWith('http'),
          error: tier25Result?.error || 'none',
          errorType: typeof tier25Result?.error,
          tier: '2.5 (CHARACTER CONSISTENCY ENHANCED)',
          provider: tier25Result?.provider || 'unknown',
          enhancementLevel: tier25Result?.enhancementLevel || 'unknown',
          characterConsistency: tier25Result?.characterConsistency || {},
          hasMetadata: !!tier25Result?.metadata,
          responseSize: JSON.stringify(tier25Result || {}).length,
          timestamp: new Date().toISOString()
        });

        if (tier25Result?.success && tier25Result?.imageURL) {
          console.log('✅ TIER 2.5 SUCCESS - Nuclear Hardcoded fallback succeeded');
          console.log('🎯 TIER 2.5 FINAL SUCCESS METRICS:', {
            imageURL: tier25Result.imageURL.substring(0, 50) + '...',
            provider: tier25Result.provider,
            tier: 2.5,
            enhancementLevel: tier25Result.enhancementLevel,
            fallbackSuccess: true,
            totalFallbackTime: Date.now() - (req.headers.get('x-request-start') || Date.now()),
            timestamp: new Date().toISOString()
          });
          
          return createDynamicCorsResponse({
            success: true,
            imageURL: tier25Result.imageURL,
            seed: tier25Result.seed,
            provider: 'runware-orchestrator',
            tier: 2.5,
            enhancementLevel: 'nuclear-hardcoded',
            metadata: { orchestrated: true, fallbackTier: 2.5 }
          }, req);
        }
        
        // Enhanced error analysis for failed Tier 2.5
        console.error('❌ TIER 2.5 FAILURE ANALYSIS - Detailed failure breakdown:', {
          success: tier25Result?.success,
          hasResult: !!tier25Result,
          error: tier25Result?.error,
          errorLength: tier25Result?.error?.length || 0,
          responseKeys: tier25Result ? Object.keys(tier25Result) : [],
          resultType: typeof tier25Result,
          hasImageURL: !!tier25Result?.imageURL,
          imageURLType: typeof tier25Result?.imageURL,
          timestamp: new Date().toISOString()
        });
        
        // Check for specific parsing errors that should skip retries
        const isParsinerError = tier25Result?.error?.includes('Failed to parse') || 
                               tier25Result?.error?.includes('finalPrompt is not defined') ||
                               tier25Result?.error?.includes('ReferenceError');
        
        if (isParsinerError) {
          console.log('🚫 Tier 2.5 parsing error detected - skipping retries and falling directly to Tier 4:', tier25Result.error);
        } else {
          console.log('⚠️ Tier 2.5 failed with non-parsing error - falling back to Tier 4:', tier25Result?.error || 'Unknown error');
        }
        
      } catch (error) {
        // Enhanced error handling with detailed logging
        console.error('🚨 TIER 2.5 EXCEPTION CAUGHT - Critical failure analysis:', {
          errorMessage: error.message,
          errorName: error.name,
          errorType: typeof error,
          errorStack: error.stack?.substring(0, 300),
          isParsingError: error.message?.includes('Failed to parse') || 
                         error.message?.includes('finalPrompt is not defined') ||
                         error.message?.includes('ReferenceError'),
          timestamp: new Date().toISOString(),
          fallbackPlan: 'Proceeding to Tier 4'
        });
        
        // Check if it's a parsing/scoping error to provide better logging
        const isParsinerError = error.message?.includes('Failed to parse') || 
                               error.message?.includes('finalPrompt is not defined') ||
                               error.message?.includes('ReferenceError');
        
        if (isParsinerError) {
          console.log('🚫 Tier 2.5 parsing/scoping error caught - falling directly to Tier 4:', error.message);
        } else {
          console.log('⚠️ Tier 2.5 error, falling back to Tier 4:', error.message);
        }
      }
    }
    // TIER 4: Kid-Friendly Placeholder (Ultimate Fallback)
    console.log('📝 Generating Tier 4: Kid-Friendly Placeholder');
    const placeholderResult = generateKidFriendlyPlaceholder(pageText);
    
    // PHASE 1: Store Tier 4 placeholder prompt with DEBUG
    console.log('📸 DEBUG: Storing Tier 4 placeholder prompt...');
    try {
      const { globalSessionManager } = await import('../_shared/SessionStateManager.ts');
      globalSessionManager.storeImagePrompt(sessionId, {
        tier: '4',
        promptText: `Kid-Friendly Placeholder: ${pageText.substring(0, 100)}...`,
        negativePrompt: '',
        originalPageText: pageText,
        enhancedPrompt: `Generated kid-friendly placeholder for ${avatarIdentity.name}`,
        pageNumber: pageNumber,
        success: true,
        imageURL: placeholderResult.url,
        seed: 0,
        provider: 'kid-friendly-placeholder',
        model: 'internal-rotating-scenes',
        cost: 0,
        generationTime: 0,
        fallbackReason: 'All image generation tiers failed',
        metadata: {
          avatarIdentity,
          guaranteedFallback: true,
          placeholderType: 'rotating-illustrated-scenes'
        }
      });
      console.log('✅ [TIER-4] Stored image prompt for page', pageNumber, 'of session', sessionId);
    } catch (storeError) {
      console.error('❌ Failed to store Tier 4 image prompt:', storeError);
    }
    
    return createDynamicCorsResponse({
      success: true,
      imageURL: placeholderResult.url,
      provider: 'runware-orchestrator',
      tier: 4,
      enhancementLevel: 'kid-friendly-placeholder',
      metadata: { orchestrated: true }
    }, req);
  } catch (error) {
    console.error('❌ Image orchestration failed:', error);
    
    // Enhanced error logging with request context (FIX: Variables now in scope)
    console.error('🔍 ORCHESTRATION ERROR DEBUG:', {
      errorMessage: error.message,
      errorType: error.constructor.name,
      userType: isGuestUser ? 'GUEST' : 'PREMIUM',
      sessionId: sessionId?.substring(0, 15) + '...' || 'none',
      pageNumber,
      timestamp: new Date().toISOString(),
      hasPageText: !!pageText,
      pageTextLength: pageText?.length || 0
    });
    
    // TIER POLICY COMPLIANCE LOG - Log any orchestration failures  
    console.error(`🔒 TIER POLICY WARNING: Image orchestration failed for user type "${isGuestUser ? 'GUEST' : 'PREMIUM'}" - Check fallback system`);
    
    // Enhanced error response with retry suggestions for 504 Gateway Timeout
    const errorMessage = error.message || 'Unknown error';
    const isTimeoutError = errorMessage.toLowerCase().includes('timeout') || 
                          errorMessage.toLowerCase().includes('gateway') ||
                          errorMessage.toLowerCase().includes('504');
    
    const responseMessage = isTimeoutError 
      ? `Image generation temporarily unavailable due to high demand. Please try again in a few moments. (Error: ${errorMessage})`
      : `Image generation orchestration failed: ${errorMessage}`;
    
    const statusCode = isTimeoutError ? 503 : 500; // Use 503 for temporary timeout issues
    
    return createDynamicCorsErrorResponse(responseMessage, req, statusCode);
  }
});