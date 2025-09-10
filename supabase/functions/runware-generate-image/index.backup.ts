import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { 
  createDynamicCorsOptionsResponse, 
  createDynamicCorsResponse, 
  createDynamicCorsErrorResponse 
} from "../_shared/corsAdvanced.ts";
import { monitorRequest } from "../_shared/headerMonitor.ts";
import { SessionStateManager } from "../_shared/SessionStateManager.js";
import { SecurityValidator } from "../_shared/SecurityValidator.js";
import { AVATAR_FALLBACK_DESCRIPTIONS, validateAvatarConsistency, validateAvatarQuality } from "../_shared/avatarConsistency.ts";
import { generateNuclearNegativePrompt, detectCulturalProfileForNegatives } from "../_shared/NuclearNegativePrompts.ts";
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
  static trackFailure(tier: number, errorType: string, sessionId: string, details: any) {
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
  
  static getFailureStats(sessionId: string) {
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
  type: string;
  isRetryable: boolean;
  
  constructor(message: string, type: string, isRetryable: boolean = false) {
    super(message);
    this.name = 'WebSocketError';
    this.type = type;
    this.isRetryable = isRetryable;
  }
}

// ============= ENHANCED WEBSOCKET MANAGER =============
class RunwareWebSocketManager {
  static MAX_RETRIES = 3;
  static BASE_DELAY = 1000; // 1 second
  static MAX_DELAY = 8000; // 8 seconds
  static CONNECTION_TIMEOUT = 90000; // 90 seconds - increased timeout for longer image generation
  static IMAGE_GENERATION_TIMEOUT = 120000; // 120 seconds - separate timeout for image generation phase
  
  static async connectWithRetry(
    apiKey: string, 
    positivePrompt: string, 
    negativePrompt: string, 
    seed: number | undefined, 
    sessionId: string, 
    pageNumber: number,
    attempt: number = 1,
    requestId?: string // Cross-function correlation
  ) {
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
  
  static attemptConnection(
    apiKey: string, 
    positivePrompt: string, 
    negativePrompt: string, 
    seed: number | undefined, 
    sessionId: string, 
    pageNumber: number,
    requestId?: string // Cross-function correlation
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
                  let errorType = 'GENERATION';
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
async function callTierFunction(functionName: string, payload: any) {
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
function mapAvatarIdentity(userInfo: any, sessionId: string) {
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
  const avatarTypeMap: Record<string, string> = {
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
  const skinToneMap: Record<string, string> = {
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
  const SKIN_TONE_VARIATIONS: Record<string, string[]> = {
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
  const hairColorMap: Record<string, string> = {
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
function generateKidFriendlyPlaceholder(pageText: string) {
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

// ============= ENHANCED PROMPT BUILDER =============
function buildEnhancedPrompt(pageText: string, avatarIdentity: any, sessionId: string, pageNumber: number): { positive: string, negative: string } {
  console.log('🎯 Building enhanced prompt for Tier 1 generation');
  
  // Extract character name from page text or use avatar identity
  const characterName = avatarIdentity?.name || 'the child';
  
  // Build character description based on avatar identity
  let characterDescription = '';
  
  if (avatarIdentity?.skinTone === 'dark') {
    // Use African American specific descriptions for dark skin tone
    const genderKey = avatarIdentity.type === 'girl' ? 'girls' : 'boys';
    const hairstyles = HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES[genderKey];
    const facialFeatures = HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES;
    
    // Seeded selection for consistency
    const seed = `${sessionId}_${pageNumber}_${characterName}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash + seed.charCodeAt(i)) & 0xffffffff;
    }
    
    const hairstyleIndex = Math.abs(hash) % hairstyles.length;
    const featureIndex = Math.abs(hash >> 8) % facialFeatures.length;
    
    characterDescription = `${facialFeatures[featureIndex]}, ${hairstyles[hairstyleIndex]}`;
  } else if (avatarIdentity?.skinToneVariation) {
    // Use skin tone variation for other ethnicities
    characterDescription = avatarIdentity.skinToneVariation;
  } else {
    // Fallback description
    characterDescription = `attractive child character with ${avatarIdentity?.skinTone || 'medium'} skin tone`;
  }
  
  // Add regional authenticity for non-English speakers
  const nativeLanguage = avatarIdentity?.nativeLanguage || 'english';
  if (nativeLanguage !== 'english' && REGIONAL_AUTHENTICITY_STRINGS[nativeLanguage]) {
    characterDescription += `, ${REGIONAL_AUTHENTICITY_STRINGS[nativeLanguage]}`;
  }
  
  // Build scene description from page text
  const sceneKeywords = extractSceneKeywords(pageText);
  
  // Construct positive prompt
  const positivePrompt = `
    Professional children's book illustration, ${characterDescription}, 
    ${sceneKeywords}, 
    vibrant colors, soft lighting, child-friendly art style, 
    high quality digital art, detailed illustration, 
    safe for children, wholesome content, 
    storybook illustration style, warm and inviting atmosphere
  `.replace(/\s+/g, ' ').trim();
  
  // Generate nuclear negative prompt
  const negativePrompt = generateNuclearNegativePrompt(
    detectCulturalProfileForNegatives(avatarIdentity?.culturalProfile, avatarIdentity?.nativeLanguage)
  );
  
  console.log('🎯 Enhanced prompt built:', {
    positiveLength: positivePrompt.length,
    negativeLength: negativePrompt.length,
    characterName,
    skinTone: avatarIdentity?.skinTone
  });
  
  return {
    positive: positivePrompt,
    negative: negativePrompt
  };
}

// Helper function to extract scene keywords from page text
function extractSceneKeywords(pageText: string): string {
  if (!pageText) return 'peaceful scene';
  
  // Simple keyword extraction - look for common scene elements
  const sceneWords = [
    'forest', 'garden', 'house', 'room', 'kitchen', 'bedroom', 'playground',
    'school', 'park', 'beach', 'mountain', 'river', 'tree', 'flower',
    'sunny', 'cloudy', 'rainy', 'snowy', 'morning', 'afternoon', 'evening',
    'happy', 'sad', 'excited', 'surprised', 'running', 'walking', 'sitting',
    'playing', 'reading', 'eating', 'sleeping', 'dancing', 'singing'
  ];
  
  const foundWords = sceneWords.filter(word => 
    pageText.toLowerCase().includes(word)
  );
  
  if (foundWords.length > 0) {
    return foundWords.slice(0, 3).join(', ');
  }
  
  return 'peaceful scene';
}

// ============= MAIN SERVE FUNCTION =============
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return createDynamicCorsOptionsResponse();
  }

  // Monitor request for debugging
  monitorRequest(req, 'runware-generate-image');

  let requestBody: any = null;
  let sessionId: string = '';
  let requestId: string = '';

  try {
    requestBody = await req.json();
    sessionId = requestBody.sessionId || crypto.randomUUID();
    requestId = crypto.randomUUID().substring(0, 8);
    
    console.log(`🎨 [${requestId}] Image generation request received:`, {
      hasPageText: !!requestBody.pageText,
      hasUserInfo: !!requestBody.userInfo,
      pageNumber: requestBody.pageNumber,
      sessionId: sessionId.substring(0, 15) + '...',
      timestamp: new Date().toISOString()
    });

    // Validate required fields
    if (!requestBody.pageText) {
      throw new Error('pageText is required');
    }

    // Security validation
    const securityResult = SecurityValidator.validateImageRequest(requestBody);
    if (!securityResult.isValid) {
      console.warn(`🔒 [${requestId}] Security validation failed:`, securityResult.reason);
      return createDynamicCorsErrorResponse(
        `Security validation failed: ${securityResult.reason}`,
        400
      );
    }

    // Initialize session state
    const sessionManager = SessionStateManager.getInstance();
    sessionManager.initializeSession(sessionId, {
      startTime: Date.now(),
      requestCount: 0,
      lastActivity: Date.now()
    });

    // Map avatar identity
    const avatarIdentity = mapAvatarIdentity(requestBody.userInfo, sessionId);
    
    // TIER 1: AI-Enhanced Premium Generation (Runware)
    console.log(`🚀 [${requestId}] Starting TIER 1: AI-Enhanced Premium Generation`);
    
    try {
      const runwareApiKey = Deno.env.get('RUNWARE_API_KEY');
      if (!runwareApiKey) {
        throw new Error('RUNWARE_API_KEY not configured');
      }

      // Build enhanced prompts
      const { positive, negative } = buildEnhancedPrompt(
        requestBody.pageText,
        avatarIdentity,
        sessionId,
        requestBody.pageNumber || 1
      );

      // Generate seed for consistency
      const seed = Math.floor(Math.random() * 1000000);

      // Attempt Runware generation with retry logic
      const result = await RunwareWebSocketManager.connectWithRetry(
        runwareApiKey,
        positive,
        negative,
        seed,
        sessionId,
        requestBody.pageNumber || 1,
        1,
        requestId
      );

      if (result.success && result.imageURL) {
        console.log(`✅ [${requestId}] TIER 1 SUCCESS: Image generated successfully`);
        
        // Validate image quality
        const qualityResult = await validateAvatarQuality(result.imageURL, avatarIdentity);
        
        return createDynamicCorsResponse({
          success: true,
          imageURL: result.imageURL,
          seed: result.seed,
          tier: 1,
          provider: 'runware',
          enhancementLevel: 'premium',
          qualityScore: qualityResult.score,
          metadata: {
            promptLength: positive.length,
            negativePromptLength: negative.length,
            generationTime: Date.now(),
            sessionId,
            requestId
          }
        });
      }

    } catch (tier1Error) {
      console.warn(`⚠️ [${requestId}] TIER 1 FAILED:`, tier1Error.message);
      TierFailureTracker.trackFailure(1, tier1Error.type || 'UNKNOWN', sessionId, {
        error: tier1Error.message,
        requestId
      });
    }

    // TIER 2: Template-Based Fallback
    console.log(`🔄 [${requestId}] Falling back to TIER 2: Template-Based Generation`);
    
    try {
      const tier2Result = await callTierFunction('runware-template-fallback', {
        pageText: requestBody.pageText,
        userInfo: requestBody.userInfo,
        avatarIdentity,
        sessionId,
        pageNumber: requestBody.pageNumber || 1,
        requestId
      });

      if (tier2Result?.success && tier2Result?.imageURL) {
        console.log(`✅ [${requestId}] TIER 2 SUCCESS: Template-based image generated`);
        
        return createDynamicCorsResponse({
          success: true,
          imageURL: tier2Result.imageURL,
          tier: 2,
          provider: tier2Result.provider || 'template',
          enhancementLevel: 'template',
          metadata: {
            templateUsed: tier2Result.templateUsed,
            generationTime: Date.now(),
            sessionId,
            requestId
          }
        });
      }

    } catch (tier2Error) {
      console.warn(`⚠️ [${requestId}] TIER 2 FAILED:`, tier2Error.message);
      TierFailureTracker.trackFailure(2, 'TEMPLATE_ERROR', sessionId, {
        error: tier2Error.message,
        requestId
      });
    }

    // TIER 2.5: Nuclear Hardcoded Fallback
    console.log(`🔄 [${requestId}] Falling back to TIER 2.5: Nuclear Hardcoded Generation`);
    
    try {
      const tier25Result = await callTierFunction('runware-simple-fallback', {
        pageText: requestBody.pageText,
        userInfo: requestBody.userInfo,
        avatarIdentity,
        sessionId,
        pageNumber: requestBody.pageNumber || 1,
        difficultyLevel: requestBody.difficultyLevel,
        requestId
      });

      if (tier25Result?.success && tier25Result?.imageURL) {
        console.log(`✅ [${requestId}] TIER 2.5 SUCCESS: Nuclear fallback image generated`);
        
        return createDynamicCorsResponse({
          success: true,
          imageURL: tier25Result.imageURL,
          tier: 2.5,
          provider: tier25Result.provider || 'nuclear-fallback',
          enhancementLevel: 'hardcoded',
          metadata: {
            fallbackType: 'nuclear',
            generationTime: Date.now(),
            sessionId,
            requestId
          }
        });
      }

    } catch (tier25Error) {
      console.warn(`⚠️ [${requestId}] TIER 2.5 FAILED:`, tier25Error.message);
      TierFailureTracker.trackFailure(2.5, 'NUCLEAR_ERROR', sessionId, {
        error: tier25Error.message,
        requestId
      });
    }

    // TIER 3: OpenAI DALL-E Fallback
    console.log(`🔄 [${requestId}] Falling back to TIER 3: OpenAI DALL-E Generation`);
    
    try {
      const tier3Result = await callTierFunction('openai-dalle-fallback', {
        pageText: requestBody.pageText,
        userInfo: requestBody.userInfo,
        avatarIdentity,
        sessionId,
        pageNumber: requestBody.pageNumber || 1,
        requestId
      });

      if (tier3Result?.success && tier3Result?.imageURL) {
        console.log(`✅ [${requestId}] TIER 3 SUCCESS: DALL-E image generated`);
        
        return createDynamicCorsResponse({
          success: true,
          imageURL: tier3Result.imageURL,
          tier: 3,
          provider: 'openai-dalle',
          enhancementLevel: 'external',
          metadata: {
            externalProvider: 'openai',
            generationTime: Date.now(),
            sessionId,
            requestId
          }
        });
      }

    } catch (tier3Error) {
      console.warn(`⚠️ [${requestId}] TIER 3 FAILED:`, tier3Error.message);
      TierFailureTracker.trackFailure(3, 'DALLE_ERROR', sessionId, {
        error: tier3Error.message,
        requestId
      });
    }

    // TIER 4: SVG Placeholder (100% guaranteed success)
    console.log(`🔄 [${requestId}] Falling back to TIER 4: SVG Placeholder (guaranteed success)`);
    
    const placeholderResult = generateKidFriendlyPlaceholder(requestBody.pageText);
    
    console.log(`✅ [${requestId}] TIER 4 SUCCESS: SVG placeholder generated (100% success rate)`);
    
    return createDynamicCorsResponse({
      success: true,
      imageURL: placeholderResult.url,
      tier: 4,
      provider: 'svg-placeholder',
      enhancementLevel: 'placeholder',
      metadata: {
        fallbackType: 'svg',
        guaranteedSuccess: true,
        generationTime: Date.now(),
        sessionId,
        requestId,
        tierFailures: TierFailureTracker.getFailureStats(sessionId)
      }
    });

  } catch (error) {
    console.error(`❌ [${requestId}] Critical error in image generation:`, error);
    
    // Even in critical error, return SVG placeholder for 100% success rate
    const emergencyPlaceholder = generateKidFriendlyPlaceholder(requestBody?.pageText || '');
    
    return createDynamicCorsResponse({
      success: true,
      imageURL: emergencyPlaceholder.url,
      tier: 4,
      provider: 'emergency-svg',
      enhancementLevel: 'emergency',
      error: error.message,
      metadata: {
        emergencyFallback: true,
        originalError: error.message,
        generationTime: Date.now(),
        sessionId,
        requestId
      }
    });
  }
});
