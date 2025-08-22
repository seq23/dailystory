import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";

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
 */

// Phase 2: Enhanced Backend Orchestrator for All Image Generation Tiers
// Now handles: AI Enhancement → Tier 1 → Tier 2 → Tier 2.5 → Tier 3 → Tier 4
serve(async (req) => {
  console.log(`🎯 Image Generation Orchestrator: ${req.method} ${req.url}`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }

  // Validate API key
  const apiKey = Deno.env.get('RUNWARE_API_KEY');
  if (!apiKey) {
    console.error('❌ RUNWARE_API_KEY not found in environment');
    return createCorsErrorResponse('Server configuration error', 500);
  }

  try {
    // Import orchestrator services (removed MultiStageEnhancementPipeline since we now call ai-story-enhancer directly)
    const { StoryVisualStateManager } = await import('../_shared/storyVisualState.js');
    const { SecurityValidator } = await import('../_shared/SecurityValidator.js');
    
    // Parse request
    const { 
      pageText, 
      userInfo, 
      storyId,
      sessionId = storyId,
      pageNumber = 1,
      isGuestUser,
      enhancedStoryData,
      forceTier // Optional: force specific tier for testing
    } = await req.json();

    // ============================================================================
    // PHASE 4: CRITICAL SECURITY VALIDATION
    // ============================================================================
    
    // Validate required parameters
    if (!pageText) {
      return createCorsErrorResponse('Missing pageText parameter', 400);
    }
    
    if (!sessionId) {
      return createCorsErrorResponse('Missing sessionId parameter', 400);
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
      return createCorsErrorResponse(`Security validation failed: ${securityCheck.reason}`, securityCheck.status || 403);
    }

    // Rate limiting check
    const rateLimitCheck = await SecurityValidator.checkRateLimit(sessionId, 'image_generation');
    if (!rateLimitCheck.allowed) {
      console.error('🚨 Rate limit exceeded for session:', sessionId);
      return createCorsErrorResponse('Rate limit exceeded. Please try again later.', 429);
    }

    console.log(`🎯 Starting image orchestration for page ${pageNumber} (Guest: ${isGuestUser})`);
    console.log(`🧠 Enhanced data available: ${enhancedStoryData ? 'Yes' : 'No'}`);
    console.log('🔍 TIER SYSTEM DEBUG - Starting orchestrated tier progression', {
      pageText: pageText.substring(0, 100) + '...',
      userInfo: !!userInfo,
      sessionId,
      pageNumber,
      totalPages: req.json.totalPages || 'unknown',
      forceTier: forceTier || 'auto',
      timestamp: new Date().toISOString()
    });

    // PHASE 1: Avatar Identity Mapper - Process user avatar data once at orchestrator level
    const avatarIdentity = mapAvatarIdentity(userInfo);
    console.log(`👤 Avatar Identity Mapped: ${avatarIdentity.type}/${avatarIdentity.skinTone} - Cultural: ${avatarIdentity.culturalProfile}`);

    // ============================================================================ 
    // TIER 1: AI-Enhanced High-Quality - PROVIDED TO ALL USERS
    // ============================================================================
    // CRITICAL: This tier is available to BOTH guest and premium users
    // The isGuestUser flag is for analytics/tracking ONLY, not tier restrictions
    if (!forceTier || forceTier === 1) {
      try {
        console.log('🧠 Starting Tier 1: AI-Enhanced High-Quality Generation');
        console.log('🔍 TIER 1 DEBUG - Calling ai-story-enhancer directly (clean architecture)');
        
        // Call ai-story-enhancer directly with pre-processed avatar identity
        const aiEnhancerResult = await callTierFunction('ai-story-enhancer', {
          storyText: pageText,
          userInfo,
          storyId,
          sessionId,
          pageNumber,
          totalPages: isGuestUser, // Reusing existing parameter mapping
          avatarIdentity, // Pass pre-processed avatar identity directly
          enhancedStoryData
        });

        console.log('🔍 TIER 1 DEBUG - AI enhancer result:', {
          success: aiEnhancerResult?.success !== false,
          hasEnhancedPrompt: !!aiEnhancerResult?.enhancedPrompt,
          hasNegativePrompt: !!aiEnhancerResult?.negativePrompt,
          error: aiEnhancerResult?.error || 'none'
        });

        // Check if AI enhancer failed and return error to trigger Tier 2 fallback
        if (aiEnhancerResult?.success === false || aiEnhancerResult?.error || !aiEnhancerResult?.enhancedPrompt) {
          console.log('⚠️ AI Enhancer failed - orchestrator will handle fallback to Tier 2');
          throw new Error(aiEnhancerResult?.error || 'AI enhancer did not return enhanced prompt');
        }

        const enhancementResult = {
          enhancedPrompt: aiEnhancerResult.enhancedPrompt,
          negativePrompt: aiEnhancerResult.negativePrompt,
          metadata: aiEnhancerResult.metadata || {}
        };
        
        console.log('🔍 TIER 1 DEBUG - Enhancement result:', {
          hasPrompt: !!enhancementResult?.enhancedPrompt,
          promptLength: enhancementResult?.enhancedPrompt?.length || 0,
          hasNegative: !!enhancementResult?.negativePrompt,
          metadata: enhancementResult?.metadata ? 'present' : 'missing'
        });
        
        const positivePrompt = enhancementResult.enhancedPrompt;
        const negativePrompt = enhancementResult.negativePrompt;

        console.log(`🎨 Premium AI-enhanced prompt (${positivePrompt.length} chars):`, positivePrompt.substring(0, 100) + '...');

        // Generate with Runware Tier 1 (Premium) - PHASE 1 FIX: Pass sessionId and pageNumber
        const tier1Result = await generateWithRunwarePremium(
          apiKey, 
          positivePrompt, 
          negativePrompt, 
          enhancementResult?.metadata?.characterSeed,
          sessionId,
          pageNumber
        );
        
        if (tier1Result.success) {
          console.log('✅ Tier 1 AI-Enhanced succeeded');
          
          // TIER POLICY COMPLIANCE LOG - Critical for regression prevention
          console.log(`🔒 TIER POLICY COMPLIANCE: User type "${isGuestUser ? 'GUEST' : 'PREMIUM'}" received TIER 1 image - Policy maintained`);
          
          // Store visual state for consistency
          if (sessionId && enhancementResult?.metadata?.characterSeed) {
            try {
              StoryVisualStateManager.addSuccessfulPrompt(
                sessionId, 
                positivePrompt,
                enhancementResult.generationParams, 
                tier1Result.seed || enhancementResult.metadata.characterSeed,
                tier1Result.imageURL,
                pageNumber
              );
            } catch (error) {
              console.warn('⚠️ Failed to store visual state (non-critical):', error);
            }
          }

          return createCorsResponse({
            success: true,
            imageURL: tier1Result.imageURL,
            seed: tier1Result.seed,
            provider: 'runware-orchestrator',
            tier: 1,
            enhancementLevel: 'ai-enhanced-premium',
            qualityScore: enhancementResult.qualityScore || 95,
            metadata: {
              model: "runware:100@1",
              promptLength: positivePrompt.length,
              sessionId: sessionId || 'unknown',
              pageNumber,
              isGuestUser,
              orchestrated: true
            }
          });
        }
        
        console.log('⚠️ Tier 1 failed, falling back to Tier 2');
        console.log('🔍 TIER 1 FAILURE DEBUG - Generation failed but no error thrown');
      } catch (error) {
        console.log('⚠️ Tier 1 error, falling back to Tier 2:', error.message);
        console.log('🔍 TIER 1 ERROR DEBUG - Full error:', {
          message: error.message,
          stack: error.stack?.substring(0, 200) || 'no stack'
        });
      }
    }

    // TIER 2: Template-based Generation  
    if (!forceTier || forceTier === 2) {
      try {
        console.log('🎨 Starting Tier 2: Template-based Generation');
        console.log('🔍 TIER 2 DEBUG - Calling runware-template-generation function');
        
        const tier2Result = await callTierFunction('runware-template-generation', {
          pageText,
          userInfo,
          storyId,
          sessionId,
          pageNumber,
          isGuestUser,
          difficultyLevel: 'medium',
          avatarIdentity // Pass optimized avatar identity to all tiers
        });
        
        console.log('🔍 TIER 2 DEBUG - Function response:', {
          success: tier2Result?.success || false,
          hasImageURL: !!tier2Result?.imageURL,
          error: tier2Result?.error || 'none'
        });

        if (tier2Result.success) {
          console.log('✅ Tier 2 Template-based succeeded');
          return createCorsResponse({
            success: true,
            imageURL: tier2Result.imageURL,
            seed: tier2Result.seed,
            provider: 'runware-orchestrator',
            tier: 2,
            enhancementLevel: 'template-based',
            metadata: { ...tier2Result.metadata, orchestrated: true }
          });
        }
        
        console.log('⚠️ Tier 2 failed, falling back to Tier 2.5');
        console.log('🔍 TIER 2 FAILURE DEBUG - Template generation failed');
      } catch (error) {
        console.log('⚠️ Tier 2 error, falling back to Tier 2.5:', error.message);
        console.log('🔍 TIER 2 ERROR DEBUG - Full error:', {
          message: error.message,
          stack: error.stack?.substring(0, 200) || 'no stack'
        });
      }
    }

    // TIER 2.5: Nuclear Hardcoded Fallback
    if (!forceTier || forceTier === 2.5) {
      try {
        console.log('🔧 Starting Tier 2.5: Nuclear Hardcoded Fallback');
        console.log('🔍 TIER 2.5 DEBUG - Calling runware-simple-fallback function (FIXED VERSION)');
        
        const tier25Result = await callTierFunction('runware-simple-fallback', {
          pageText,
          userInfo,
          difficultyLevel: 'medium',
          avatarIdentity // Pass optimized avatar identity to all tiers
        });
        
        console.log('🔍 TIER 2.5 DEBUG - Function response:', {
          success: tier25Result?.success || false,
          hasImageURL: !!tier25Result?.imageURL,
          error: tier25Result?.error || 'none',
          tier: '2.5 (ANIMAL BIAS FIXED)'
        });

        if (tier25Result.success) {
          console.log('✅ Tier 2.5 Nuclear Hardcoded succeeded');
          return createCorsResponse({
            success: true,
            imageURL: tier25Result.imageURL,
            seed: tier25Result.seed,
            provider: 'runware-orchestrator',
            tier: 2.5,
            enhancementLevel: 'nuclear-hardcoded',
            metadata: { orchestrated: true }
          });
        }
        
        console.log('⚠️ Tier 2.5 failed, falling back to Tier 3');
      } catch (error) {
        console.log('⚠️ Tier 2.5 error, falling back to Tier 3:', error.message);
      }
    }

    // TIER 3: OpenAI DALL-E Fallback
    if (!forceTier || forceTier === 3) {
      try {
        console.log('🎯 Starting Tier 3: OpenAI DALL-E Generation');
        
        const tier3Result = await callTierFunction('openai-image', {
          positivePrompt: `Children's book illustration: ${pageText}. Bright, colorful, safe for children.`,
          negativePrompt: "text, letters, words, writing, signs, watermarks, ugly, deformed, bad anatomy, photorealistic, anime",
          size: '1024x1024',
          model: 'gpt-image-1',
          quality: 'standard',
          avatarIdentity // Pass optimized avatar identity to all tiers
        });

        if (tier3Result.success) {
          console.log('✅ Tier 3 OpenAI succeeded');
          return createCorsResponse({
            success: true,
            imageURL: tier3Result.imageURL,
            provider: 'runware-orchestrator',
            tier: 3,
            enhancementLevel: 'openai-fallback',
            metadata: { orchestrated: true }
          });
        }
        
        console.log('⚠️ Tier 3 failed, falling back to Tier 4');
      } catch (error) {
        console.log('⚠️ Tier 3 error, falling back to Tier 4:', error.message);
      }
    }

    // TIER 4: SVG Placeholder (Guaranteed Success)
    console.log('📝 Generating Tier 4: SVG Placeholder');
    const svgResult = generateSVGPlaceholder(pageText, userInfo);
    
    return createCorsResponse({
      success: true,
      imageURL: svgResult.url,
      provider: 'runware-orchestrator',
      tier: 4,
      enhancementLevel: 'svg-placeholder',
      metadata: { orchestrated: true }
    });

  } catch (error) {
    console.error('❌ Image orchestration failed:', error);
    
    // TIER POLICY COMPLIANCE LOG - Log any orchestration failures
    console.error(`🔒 TIER POLICY WARNING: Image orchestration failed for user type "${isGuestUser ? 'GUEST' : 'PREMIUM'}" - Check fallback system`);
    
    return createCorsErrorResponse(
      `Image generation orchestration failed: ${error.message}`,
      500
    );
  }
});

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
  private static readonly CONNECTION_TIMEOUT = 30000; // 30 seconds
  
  static async connectWithRetry(
    apiKey: string, 
    positivePrompt: string, 
    negativePrompt: string, 
    seed?: number, 
    sessionId?: string, 
    pageNumber?: number,
    attempt: number = 1
  ): Promise<any> {
    try {
      return await this.attemptConnection(apiKey, positivePrompt, negativePrompt, seed, sessionId, pageNumber);
    } catch (error) {
      const wsError = error as WebSocketError;
      
      // Check if error is retryable and we haven't exceeded max attempts
      if (wsError.isRetryable && attempt < this.MAX_RETRIES) {
        const delay = Math.min(this.BASE_DELAY * Math.pow(2, attempt - 1), this.MAX_DELAY);
        console.warn(`🔄 WebSocket attempt ${attempt} failed, retrying in ${delay}ms: ${wsError.message}`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.connectWithRetry(apiKey, positivePrompt, negativePrompt, seed, sessionId, pageNumber, attempt + 1);
      }
      
      console.error(`❌ WebSocket failed after ${attempt} attempts: ${wsError.message}`);
      throw wsError;
    }
  }
  
  private static attemptConnection(
    apiKey: string, 
    positivePrompt: string, 
    negativePrompt: string, 
    seed?: number, 
    sessionId?: string, 
    pageNumber?: number
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let ws: WebSocket;
      let connectionTimeout: number;
      let isResolved = false;
      
      const cleanup = () => {
        if (connectionTimeout) clearTimeout(connectionTimeout);
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
        ws = new WebSocket('wss://ws-api.runware.ai/v1');
        
        // Enhanced timeout with better error handling
        connectionTimeout = setTimeout(() => {
          safeReject(new WebSocketError(
            `WebSocket timeout after ${this.CONNECTION_TIMEOUT}ms for session ${sessionId || 'unknown'}`,
            'TIMEOUT',
            true // Timeout errors are retryable
          ));
        }, this.CONNECTION_TIMEOUT);

        ws.onopen = () => {
          console.log(`📡 WebSocket connected to Runware (attempt ${sessionId || 'unknown'})`);
          
          // Send authentication with error handling
          try {
            ws.send(JSON.stringify([{
              taskType: "authentication",
              apiKey: apiKey
            }]));
          } catch (sendError) {
            safeReject(new WebSocketError(
              `Failed to send authentication: ${sendError.message}`,
              'AUTH',
              true
            ));
          }
        };

        ws.onmessage = (event) => {
          try {
            const response = JSON.parse(event.data);
            
            // Enhanced error detection with rate limiting
            if (response.error || response.errors) {
              const errorMsg = response.errorMessage || response.errors?.[0]?.message || 'Generation failed';
              const errorCode = response.errorCode || response.errors?.[0]?.code;
              
              console.error('❌ Runware API error:', { errorMsg, errorCode, sessionId });
              
              // Classify error types for better handling
              let errorType: 'RATE_LIMIT' | 'AUTH' | 'GENERATION' = 'GENERATION';
              let isRetryable = false;
              
              if (errorCode === 'RATE_LIMIT_EXCEEDED' || errorMsg.toLowerCase().includes('rate limit')) {
                errorType = 'RATE_LIMIT';
                isRetryable = true;
                console.warn(`🚦 Rate limit detected for session ${sessionId}, will retry with backoff`);
              } else if (errorCode === 'INVALID_API_KEY' || errorMsg.toLowerCase().includes('authentication')) {
                errorType = 'AUTH';
                isRetryable = false;
              } else if (errorMsg.toLowerCase().includes('busy') || errorMsg.toLowerCase().includes('overload')) {
                isRetryable = true;
              }
              
              safeReject(new WebSocketError(errorMsg, errorType, isRetryable));
              return;
            }

            if (response.data) {
              for (const item of response.data) {
                if (item.taskType === "authentication") {
                  console.log(`✅ Runware authenticated for session ${sessionId || 'unknown'}`);
                  
                  // PHASE 1 FIX: Emergency Truncation with proper parameters
                  console.log(`📏 Original prompt length: ${positivePrompt.length} characters`);
                  if (positivePrompt.length > 2990) {
                    console.warn(`🚨 EMERGENCY TRUNCATION: Prompt length ${positivePrompt.length} > 2990, truncating for session ${sessionId || 'unknown'} page ${pageNumber || 0}...`);
                    positivePrompt = positivePrompt.substring(0, 2990);
                    console.log(`✂️ Truncated to ${positivePrompt.length} characters for session ${sessionId || 'unknown'}, page ${pageNumber || 0}`);
                  }

                  // Send premium image generation request
                  const imageRequest = [{
                    taskType: "imageInference",
                    taskUUID: crypto.randomUUID(),
                    positivePrompt: positivePrompt,
                    negativePrompt: negativePrompt,
                    width: 1024,
                    height: 1024,
                    model: "runware:100@1",
                    numberResults: 1,
                    outputFormat: "WEBP",
                    CFGScale: 4.0,
                    scheduler: "FlowMatchEulerDiscreteScheduler",
                    steps: 12,
                    ...(seed && { seed })
                  }];
                  
                  console.log(`🚀 Sending premium image generation request for session ${sessionId || 'unknown'}`);
                  
                  try {
                    ws.send(JSON.stringify(imageRequest));
                  } catch (sendError) {
                    safeReject(new WebSocketError(
                      `Failed to send image request: ${sendError.message}`,
                      'NETWORK',
                      true
                    ));
                  }
                  
                } else if (item.taskType === "imageInference") {
                  console.log(`🎯 Premium image generated successfully for session ${sessionId || 'unknown'}:`, item.imageURL);
                  
                  safeResolve({
                    success: true,
                    imageURL: item.imageURL,
                    seed: item.seed,
                    taskUUID: item.taskUUID
                  });
                }
              }
            }
          } catch (parseError) {
            safeReject(new WebSocketError(
              `Failed to parse WebSocket response: ${parseError.message}`,
              'NETWORK',
              true
            ));
          }
        };

        ws.onerror = (error) => {
          console.error(`❌ WebSocket connection error for session ${sessionId || 'unknown'}:`, error);
          safeReject(new WebSocketError(
            `WebSocket connection failed: ${error.toString()}`,
            'CONNECTION',
            true // Connection errors are retryable
          ));
        };

        ws.onclose = (event) => {
          console.log(`📡 WebSocket closed for session ${sessionId || 'unknown'} (code: ${event.code})`);
          
          // Only reject if we haven't already resolved/rejected
          if (!isResolved) {
            const isAbnormalClose = event.code !== 1000 && event.code !== 1001;
            safeReject(new WebSocketError(
              `WebSocket closed unexpectedly (code: ${event.code})`,
              'CONNECTION',
              isAbnormalClose // Abnormal closes are retryable
            ));
          }
        };
        
      } catch (error) {
        safeReject(new WebSocketError(
          `Failed to create WebSocket: ${error.message}`,
          'CONNECTION',
          true
        ));
      }
    });
  }
}

// TIER 1: Premium Runware Generation with Enhanced Robustness
async function generateWithRunwarePremium(
  apiKey: string, 
  positivePrompt: string, 
  negativePrompt: string, 
  seed?: number, 
  sessionId?: string, 
  pageNumber?: number
) {
  console.log(`🚀 Starting enhanced WebSocket generation for session ${sessionId || 'unknown'}, page ${pageNumber || 0}`);
  
  try {
    return await RunwareWebSocketManager.connectWithRetry(
      apiKey, 
      positivePrompt, 
      negativePrompt, 
      seed, 
      sessionId, 
      pageNumber
    );
  } catch (error) {
    const wsError = error as WebSocketError;
    console.error(`💥 Enhanced WebSocket generation failed for session ${sessionId || 'unknown'}:`, {
      type: wsError.type,
      retryable: wsError.isRetryable,
      message: wsError.message
    });
    
    // Re-throw with additional context for tier fallback logic
    throw new Error(`WebSocket generation failed (${wsError.type}): ${wsError.message}`);
  }
}

// Helper: Call other tier functions
async function callTierFunction(functionName: string, params: any) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration');
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    throw new Error(`${functionName} failed: ${response.status}`);
  }

  return await response.json();
}

// NEW MASTER PLAN: Avatar Identity Mapper with Direct Visual Descriptions
function mapAvatarIdentity(userInfo: any) {
  const avatar = userInfo?.avatar || {};
  const { type = 'prefer-not-to-answer', skinTone = 'medium' } = avatar;
  const { nativeLanguage = 'en' } = userInfo;

  // Map avatar type and skin tone to standardized identity
  const avatarType = type === 'prefer-not-to-answer' ? 'child' : type;
  const genderText = avatarType === 'boy' ? 'boy' : 'girl';
  
  // Standardized skin tone mapping
  const skinToneMap = {
    'pale': 'fair',
    'light': 'light', 
    'medium': 'medium',
    'olive': 'olive',
    'dark': 'dark'
  };
  const standardizedSkinTone = skinToneMap[skinTone] || 'medium';

  // NEW MASTER PLAN: Direct Visual Descriptions for English Speakers Only
  let visualDescription = '';
  if (nativeLanguage === 'en') {
    const visualDescriptionMap = {
      'fair': `fair skin white ${genderText} with red hair`,
      'light': `white ${genderText} with blonde hair`,
      'medium': `medium skin white ${genderText} with brown hair`,
      'olive': `olive skin white ${genderText} with black hair`,
      'dark': `black ${genderText}`
    };
    visualDescription = visualDescriptionMap[standardizedSkinTone] || `${genderText}`;
  }

  // Cultural profile determination (legacy compatibility)
  let culturalProfile;
  if (nativeLanguage === 'en') {
    if (standardizedSkinTone === 'dark') culturalProfile = 'african-american';
    else if (standardizedSkinTone === 'light' || standardizedSkinTone === 'fair') culturalProfile = 'european-american';
    else culturalProfile = 'multicultural-american';
  } else if (nativeLanguage === 'es') {
    if (standardizedSkinTone === 'dark') culturalProfile = 'afro-hispanic';
    else if (standardizedSkinTone === 'olive' || standardizedSkinTone === 'medium') culturalProfile = 'hispanic-latino';
    else culturalProfile = 'hispanic-multicultural';
  } else if (nativeLanguage === 'fr') culturalProfile = standardizedSkinTone === 'dark' ? 'african-french' : 'french-multicultural';
  else if (nativeLanguage === 'zh') culturalProfile = 'chinese-asian';
  else if (nativeLanguage === 'hi') culturalProfile = 'indian-south-asian';
  else if (nativeLanguage === 'ar') culturalProfile = 'middle-eastern';
  else culturalProfile = 'standard-american'; // PHASE 2: Default to standard-american instead of global-multicultural

  // Hair color mapping (legacy compatibility)
  const hairColorMap = {
    'fair': 'red',
    'light': 'blonde',
    'medium': 'brown', 
    'olive': 'black',
    'dark': 'natural textured hair'
  };
  const hairColor = hairColorMap[standardizedSkinTone] || 'brown';

  return {
    type: avatarType,
    skinTone: standardizedSkinTone,
    hairColor,
    culturalProfile,
    nativeLanguage,
    name: userInfo?.name || 'child',
    visualDescription // NEW: Direct visual description for Runware optimization
  };
}

// Helper: Generate SVG Placeholder
function generateSVGPlaceholder(pageText: string, userInfo: any) {
  const characterName = userInfo?.name || 'Character';
  const shortScene = pageText.substring(0, 50);
  
  const svgContent = `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="400" fill="#f0f9ff"/>
      <circle cx="200" cy="150" r="60" fill="#ddd6fe"/>
      <text x="200" y="250" text-anchor="middle" font-family="Arial" font-size="16" fill="#1f2937">
        ${characterName}
      </text>
      <text x="200" y="280" text-anchor="middle" font-family="Arial" font-size="12" fill="#6b7280">
        ${shortScene}...
      </text>
      <text x="200" y="320" text-anchor="middle" font-family="Arial" font-size="10" fill="#9ca3af">
        Story illustration loading...
      </text>
    </svg>
  `;
  
  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  
  return { url, success: true };
}