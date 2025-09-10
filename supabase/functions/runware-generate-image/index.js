import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { 
  createDynamicCorsOptionsResponse, 
  createDynamicCorsResponse, 
  createDynamicCorsErrorResponse 
} from "../_shared/corsAdvanced.js";
import { monitorRequest } from "../_shared/headerMonitor.js";
import { SessionStateManager } from "../_shared/SessionStateManager.js";
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
  static trackFailure(tier, errorType, sessionId, details) {
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
  
  static getFailureStats(sessionId) {
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
  constructor(message, type, isRetryable = false) {
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
    apiKey, 
    positivePrompt, 
    negativePrompt, 
    seed, 
    sessionId, 
    pageNumber,
    attempt = 1,
    requestId // Cross-function correlation
  ) {
    try {
      return await this.attemptConnection(apiKey, positivePrompt, negativePrompt, seed, sessionId, pageNumber, requestId);
    } catch (error) {
      const wsError = error;
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
    apiKey, 
    positivePrompt, 
    negativePrompt, 
    seed, 
    sessionId, 
    pageNumber,
    requestId // Cross-function correlation
  ) {
    return new Promise((resolve, reject) => {
      let ws;
      let connectionTimeout;
      let generationTimeout;
      let isResolved = false;
      
      const cleanup = () => {
        if (connectionTimeout) clearTimeout(connectionTimeout);
        if (generationTimeout) clearTimeout(generationTimeout);
        if (ws && ws.readyState === WebSocket.OPEN) ws.close();
      };
      
      const safeReject = (error) => {
        if (!isResolved) {
          isResolved = true;
          cleanup();
          reject(error);
        }
      };
      
      const safeResolve = (result) => {
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
async function callTierFunction(functionName, payload) {
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
function mapAvatarIdentity(userInfo, sessionId) {
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
  function getSeededSkinToneVariation(skinTone, seed) {
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
function generateKidFriendlyPlaceholder(pageText) {
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

// ============= PROMPT ENHANCEMENT SYSTEM =============
function enhancePromptForRunware(basePrompt, avatarIdentity, pageText, sessionId, pageNumber) {
  try {
    console.log('🎯 Enhancing prompt for Runware generation:', {
      basePromptLength: basePrompt.length,
      avatarType: avatarIdentity?.type,
      skinTone: avatarIdentity?.skinTone,
      pageNumber
    });
    
    let enhancedPrompt = basePrompt;
    
    // Add character consistency elements
    if (avatarIdentity) {
      // Use skin tone variation for detailed character description
      if (avatarIdentity.skinToneVariation) {
        enhancedPrompt = enhancedPrompt.replace(
          /attractive child character/gi,
          avatarIdentity.skinToneVariation
        );
      }
      
      // Add cultural authenticity for non-English speakers
      if (avatarIdentity.nativeLanguage && avatarIdentity.nativeLanguage !== 'english') {
        const authenticity = REGIONAL_AUTHENTICITY_STRINGS[avatarIdentity.nativeLanguage];
        if (authenticity) {
          enhancedPrompt += `, ${authenticity}`;
        }
      }
      
      // Add African American specific styling for dark skin tones
      if (avatarIdentity.skinTone === 'dark') {
        const genderKey = avatarIdentity.type === 'girl' ? 'girls' : 'boys';
        const hairstyles = HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES[genderKey];
        
        if (hairstyles && hairstyles.length > 0) {
          // Use seeded selection for consistency
          let hash = 0;
          const seedStr = `${sessionId}_${pageNumber}_hair`;
          for (let i = 0; i < seedStr.length; i++) {
            hash = ((hash << 5) - hash + seedStr.charCodeAt(i)) & 0xffffffff;
          }
          const hairstyleIndex = Math.abs(hash) % hairstyles.length;
          const selectedHairstyle = hairstyles[hairstyleIndex];
          
          // Replace generic hair references with specific styling
          enhancedPrompt = enhancedPrompt.replace(
            /with textured natural hair/gi,
            selectedHairstyle
          );
        }
        
        // Add facial feature enhancement
        if (HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES.length > 0) {
          let hash = 0;
          const seedStr = `${sessionId}_${pageNumber}_features`;
          for (let i = 0; i < seedStr.length; i++) {
            hash = ((hash << 5) - hash + seedStr.charCodeAt(i)) & 0xffffffff;
          }
          const featureIndex = Math.abs(hash) % HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES.length;
          const selectedFeatures = HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES[featureIndex];
          
          enhancedPrompt += `, ${selectedFeatures}`;
        }
      }
    }
    
    // Add quality and style enhancements
    enhancedPrompt += ', high quality digital art, detailed illustration, vibrant colors, child-friendly style, storybook illustration, professional artwork, clean composition, engaging visual storytelling';
    
    console.log('✅ Prompt enhancement completed:', {
      originalLength: basePrompt.length,
      enhancedLength: enhancedPrompt.length,
      addedElements: enhancedPrompt.length - basePrompt.length
    });
    
    return enhancedPrompt;
    
  } catch (error) {
    console.error('❌ Prompt enhancement failed:', error);
    return basePrompt; // Return original prompt if enhancement fails
  }
}

// ============= TIER 1: RUNWARE PREMIUM GENERATION =============
async function generateTier1Image(pageText, userInfo, difficultyLevel, sessionId, pageNumber, isGuestUser, requestId) {
  const logPrefix = requestId ? `[${requestId}]` : '';
  console.log(`🎯 ${logPrefix} [TIER-1] Starting Runware premium generation`);
  
  try {
    // Validate API key
    const runwareApiKey = Deno.env.get('RUNWARE_API_KEY');
    if (!runwareApiKey) {
      throw new Error('RUNWARE_API_KEY not configured');
    }
    
    // Map avatar identity
    const avatarIdentity = mapAvatarIdentity(userInfo, sessionId);
    
    // Generate base prompt using template service
    console.log(`📞 ${logPrefix} Calling template-service for base prompt generation`);
    const templateResult = await callTierFunction('template-service', {
      pageText,
      userInfo,
      difficultyLevel,
      sessionId,
      pageNumber,
      avatarIdentity,
      requestId
    });
    
    if (!templateResult?.success || !templateResult?.positivePrompt) {
      throw new Error('Template service failed to generate base prompt');
    }
    
    // Enhance prompt for Runware
    const enhancedPrompt = enhancePromptForRunware(
      templateResult.positivePrompt,
      avatarIdentity,
      pageText,
      sessionId,
      pageNumber
    );
    
    // Generate nuclear negative prompt
    const culturalProfile = detectCulturalProfileForNegatives(avatarIdentity);
    const negativePrompt = generateNuclearNegativePrompt(culturalProfile);
    
    // Generate consistent seed
    const seed = Math.abs(
      `${sessionId}_${pageNumber}_${avatarIdentity.seed}`.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0)
    );
    
    console.log(`🎯 ${logPrefix} [TIER-1] Attempting Runware WebSocket generation:`, {
      promptLength: enhancedPrompt.length,
      negativePromptLength: negativePrompt.length,
      seed,
      model: 'runware:100@1'
    });
    
    // Attempt WebSocket generation with retry logic
    const result = await RunwareWebSocketManager.connectWithRetry(
      runwareApiKey,
      enhancedPrompt,
      negativePrompt,
      seed,
      sessionId,
      pageNumber,
      1,
      requestId
    );
    
    if (result.success && result.imageURL) {
      console.log(`✅ ${logPrefix} [TIER-1] Runware generation successful`);
      
      // Validate image quality
      const qualityCheck = await validateAvatarQuality(result.imageURL, avatarIdentity);
      
      return createDynamicCorsResponse({
        success: true,
        imageURL: result.imageURL,
        seed: result.seed,
        tier: 1,
        provider: 'runware',
        model: 'runware:100@1',
        enhancementLevel: 'premium',
        qualityScore: qualityCheck.score,
        metadata: {
          promptLength: enhancedPrompt.length,
          generationTime: Date.now(),
          avatarConsistency: qualityCheck.consistent,
          taskUUID: result.taskUUID
        }
      });
    }
    
    throw new Error('Runware generation failed - no image URL returned');
    
  } catch (error) {
    console.error(`❌ ${logPrefix} [TIER-1] Runware generation failed:`, error);
    
    // Track failure for analytics
    TierFailureTracker.trackFailure(1, error.type || 'GENERATION', sessionId, {
      error: error.message,
      pageNumber,
      isGuestUser,
      timestamp: Date.now()
    });
    
    throw error;
  }
}

// ============= TIER 2: TEMPLATE-BASED FALLBACK =============
async function generateTier2Image(pageText, userInfo, difficultyLevel, sessionId, pageNumber, isGuestUser, requestId) {
  const logPrefix = requestId ? `[${requestId}]` : '';
  console.log(`🔄 ${logPrefix} [TIER-2] Starting template-based fallback generation`);
  
  try {
    const avatarIdentity = mapAvatarIdentity(userInfo, sessionId);
    
    // Call template-based generation service
    const result = await callTierFunction('debug-tier-2-templates', {
      pageText,
      userInfo,
      difficultyLevel,
      sessionId,
      pageNumber,
      avatarIdentity,
      isGuestUser,
      requestId
    });
    
    if (result?.success && result?.imageURL) {
      console.log(`✅ ${logPrefix} [TIER-2] Template-based generation successful`);
      
      return createDynamicCorsResponse({
        success: true,
        imageURL: result.imageURL,
        seed: result.seed,
        tier: 2,
        provider: result.provider || 'template-based',
        enhancementLevel: 'standard',
        metadata: {
          templateUsed: result.templateUsed,
          generationTime: Date.now(),
          fallbackReason: 'tier-1-failure'
        }
      });
    }
    
    throw new Error('Template-based generation failed');
    
  } catch (error) {
    console.error(`❌ ${logPrefix} [TIER-2] Template-based generation failed:`, error);
    
    TierFailureTracker.trackFailure(2, 'TEMPLATE', sessionId, {
      error: error.message,
      pageNumber,
      isGuestUser,
      timestamp: Date.now()
    });
    
    throw error;
  }
}

// ============= TIER 2.5: NUCLEAR HARDCODED FALLBACK =============
async function generateTier25Image(pageText, userInfo, difficultyLevel, sessionId, pageNumber, isGuestUser, requestId) {
  const logPrefix = requestId ? `[${requestId}]` : '';
  console.log(`🚨 ${logPrefix} [TIER-2.5] Starting nuclear hardcoded fallback generation`);
  
  try {
    const avatarIdentity = mapAvatarIdentity(userInfo, sessionId);
    
    // Enhanced payload for nuclear fallback
    const payload = {
      pageText,
      userInfo,
      difficultyLevel,
      sessionId,
      pageNumber,
      avatarIdentity,
      isGuestUser,
      requestId,
      characterData: {
        name: avatarIdentity.name,
        skinTone: avatarIdentity.skinTone,
        type: avatarIdentity.type,
        culturalProfile: avatarIdentity.culturalProfile
      }
    };
    
    console.log(`🔧 ${logPrefix} [TIER-2.5] Calling runware-simple-fallback with enhanced payload`);
    
    const result = await callTierFunction('runware-simple-fallback', payload);
    
    if (result?.success && result?.imageURL) {
      console.log(`✅ ${logPrefix} [TIER-2.5] Nuclear fallback generation successful`);
      
      return createDynamicCorsResponse({
        success: true,
        imageURL: result.imageURL,
        seed: result.seed,
        tier: 2.5,
        provider: result.provider || 'nuclear-fallback',
        enhancementLevel: result.enhancementLevel || 'basic',
        metadata: {
          fallbackType: 'nuclear-hardcoded',
          generationTime: Date.now(),
          fallbackReason: 'tier-2-failure',
          templateCategory: result.templateCategory
        }
      });
    }
    
    throw new Error('Nuclear fallback generation failed');
    
  } catch (error) {
    console.error(`❌ ${logPrefix} [TIER-2.5] Nuclear fallback generation failed:`, error);
    
    TierFailureTracker.trackFailure(2.5, 'NUCLEAR_FALLBACK', sessionId, {
      error: error.message,
      pageNumber,
      isGuestUser,
      timestamp: Date.now()
    });
    
    throw error;
  }
}

// ============= TIER 3: OPENAI DALL-E FALLBACK =============
async function generateTier3Image(pageText, userInfo, difficultyLevel, sessionId, pageNumber, isGuestUser, requestId) {
  const logPrefix = requestId ? `[${requestId}]` : '';
  console.log(`🔄 ${logPrefix} [TIER-3] Starting OpenAI DALL-E fallback generation`);
  
  try {
    const avatarIdentity = mapAvatarIdentity(userInfo, sessionId);
    
    // Call OpenAI DALL-E service
    const result = await callTierFunction('openai-dalle-fallback', {
      pageText,
      userInfo,
      difficultyLevel,
      sessionId,
      pageNumber,
      avatarIdentity,
      isGuestUser,
      requestId
    });
    
    if (result?.success && result?.imageURL) {
      console.log(`✅ ${logPrefix} [TIER-3] OpenAI DALL-E generation successful`);
      
      return createDynamicCorsResponse({
        success: true,
        imageURL: result.imageURL,
        seed: result.seed,
        tier: 3,
        provider: 'openai-dalle',
        enhancementLevel: 'external',
        metadata: {
          model: result.model || 'dall-e-3',
          generationTime: Date.now(),
          fallbackReason: 'tier-2.5-failure'
        }
      });
    }
    
    throw new Error('OpenAI DALL-E generation failed');
    
  } catch (error) {
    console.error(`❌ ${logPrefix} [TIER-3] OpenAI DALL-E generation failed:`, error);
    
    TierFailureTracker.trackFailure(3, 'DALLE', sessionId, {
      error: error.message,
      pageNumber,
      isGuestUser,
      timestamp: Date.now()
    });
    
    throw error;
  }
}

// ============= TIER 4: SVG PLACEHOLDER (100% GUARANTEED) =============
function generateTier4Image(pageText, userInfo, difficultyLevel, sessionId, pageNumber, isGuestUser, requestId) {
  const logPrefix = requestId ? `[${requestId}]` : '';
  console.log(`🛡️ ${logPrefix} [TIER-4] Generating guaranteed SVG placeholder`);
  
  try {
    const placeholder = generateKidFriendlyPlaceholder(pageText);
    
    console.log(`✅ ${logPrefix} [TIER-4] SVG placeholder generated successfully`);
    
    return createDynamicCorsResponse({
      success: true,
      imageURL: placeholder.url,
      tier: 4,
      provider: 'svg-placeholder',
      enhancementLevel: 'placeholder',
      metadata: {
        type: 'svg-fallback',
        generationTime: Date.now(),
        fallbackReason: 'all-tiers-failed',
        guaranteed: true
      }
    });
    
  } catch (error) {
    console.error(`❌ ${logPrefix} [TIER-4] SVG placeholder generation failed:`, error);
    
    // This should never happen, but provide ultimate fallback
    return createDynamicCorsResponse({
      success: false,
      error: 'Complete system failure - all tiers failed including SVG placeholder',
      tier: 4,
      provider: 'system-error'
    });
  }
}

// ============= MAIN HANDLER =============
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return createDynamicCorsOptionsResponse();
  }
  
  // Generate unique request ID for cross-function correlation
  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`🚀 [${requestId}] Image generation request started`);
  
  let requestBody;
  
  try {
    // Monitor request headers
    monitorRequest(req);
    
    // Parse request body
    requestBody = await req.json();
    console.log(`📝 [${requestId}] Request received:`, {
      hasPageText: !!requestBody.pageText,
      hasUserInfo: !!requestBody.userInfo,
      pageNumber: requestBody.pageNumber,
      sessionId: requestBody.sessionId?.substring(0, 15) + '...' || 'none',
      isGuestUser: requestBody.isGuestUser
    });
    
    // Validate required fields
    if (!requestBody.pageText) {
      throw new Error('pageText is required');
    }
    
    // Security validation
    const securityCheck = SecurityValidator.validateImageRequest(requestBody);
    if (!securityCheck.isValid) {
      throw new Error(`Security validation failed: ${securityCheck.error}`);
    }
    
    // Initialize session state
    const sessionManager = new SessionStateManager();
    if (requestBody.sessionId) {
      sessionManager.initializeSession(requestBody.sessionId, requestBody.userInfo);
    }
    
    // Extract parameters
    const {
      pageText,
      userInfo,
      difficultyLevel,
      sessionId,
      pageNumber = 1,
      isGuestUser = true
    } = requestBody;
    
    console.log(`🎯 [${requestId}] Starting 4-tier generation system for ${isGuestUser ? 'guest' : 'premium'} user`);
    
    // TIER 1: Runware Premium (ALL USERS)
    try {
      return await generateTier1Image(pageText, userInfo, difficultyLevel, sessionId, pageNumber, isGuestUser, requestId);
    } catch (tier1Error) {
      console.warn(`⚠️ [${requestId}] Tier 1 failed, proceeding to Tier 2:`, tier1Error.message);
    }
    
    // TIER 2: Template-Based Fallback
    try {
      return await generateTier2Image(pageText, userInfo, difficultyLevel, sessionId, pageNumber, isGuestUser, requestId);
    } catch (tier2Error) {
      console.warn(`⚠️ [${requestId}] Tier 2 failed, proceeding to Tier 2.5:`, tier2Error.message);
    }
    
    // TIER 2.5: Nuclear Hardcoded Fallback
    try {
      return await generateTier25Image(pageText, userInfo, difficultyLevel, sessionId, pageNumber, isGuestUser, requestId);
    } catch (tier25Error) {
      console.warn(`⚠️ [${requestId}] Tier 2.5 failed, proceeding to Tier 3:`, tier25Error.message);
    }
    
    // TIER 3: OpenAI DALL-E Fallback
    try {
      return await generateTier3Image(pageText, userInfo, difficultyLevel, sessionId, pageNumber, isGuestUser, requestId);
    } catch (tier3Error) {
      console.warn(`⚠️ [${requestId}] Tier 3 failed, proceeding to Tier 4:`, tier3Error.message);
    }
    
    // TIER 4: SVG Placeholder (100% Guaranteed)
    return generateTier4Image(pageText, userInfo, difficultyLevel, sessionId, pageNumber, isGuestUser, requestId);
    
  } catch (error) {
    console.error(`❌ [${requestId}] Request processing failed:`, error);
    
    // Track critical failure
    if (requestBody?.sessionId) {
      TierFailureTracker.trackFailure('SYSTEM', 'CRITICAL', requestBody.sessionId, {
        error: error.message,
        requestId,
        timestamp: Date.now()
      });
    }
    
    return createDynamicCorsErrorResponse(error.message, 500);
  }
});
