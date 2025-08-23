// PHASE 5: Circuit Breaker and Enhanced Error Handling
class ServiceCircuitBreaker {
  static circuits = new Map();
  
  static getCircuit(serviceName) {
    if (!this.circuits.has(serviceName)) {
      this.circuits.set(serviceName, {
        failures: 0,
        lastFailureTime: null,
        state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
        threshold: 3,
        timeout: 30000 // 30 seconds
      });
    }
    return this.circuits.get(serviceName);
  }
  
  static async execute(serviceName, operation, context = {}) {
    const circuit = this.getCircuit(serviceName);
    
    // Check if circuit is open
    if (circuit.state === 'OPEN') {
      const timeSinceLastFailure = Date.now() - circuit.lastFailureTime;
      if (timeSinceLastFailure < circuit.timeout) {
        throw new Error(`Circuit breaker is OPEN for ${serviceName}. Failing fast.`);
      } else {
        circuit.state = 'HALF_OPEN';
        console.log(`🔄 CIRCUIT: ${serviceName} moving to HALF_OPEN state`);
      }
    }
    
    try {
      const result = await operation();
      
      // Success - reset circuit
      if (circuit.state === 'HALF_OPEN') {
        circuit.state = 'CLOSED';
        circuit.failures = 0;
        console.log(`✅ CIRCUIT: ${serviceName} restored to CLOSED state`);
      }
      
      return result;
    } catch (error) {
      circuit.failures++;
      circuit.lastFailureTime = Date.now();
      
      console.error(`🚨 CIRCUIT: ${serviceName} failure ${circuit.failures}/${circuit.threshold}`, {
        error: error.message,
        context
      });
      
      // Check if we should open the circuit
      if (circuit.failures >= circuit.threshold) {
        circuit.state = 'OPEN';
        console.error(`💥 CIRCUIT: ${serviceName} circuit breaker is now OPEN`);
      }
      
      throw error;
    }
  }
}

// PHASE 5: Enhanced retry logic with exponential backoff
class EnhancedRetryManager {
  static async retryWithBackoff(operation, options = {}) {
    const {
      maxRetries = 3,
      baseDelay = 1000,
      maxDelay = 10000,
      retryOn503 = true,
      serviceName = 'unknown'
    } = options;
    
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 RETRY: ${serviceName} attempt ${attempt + 1}/${maxRetries + 1}`);
        return await operation();
      } catch (error) {
        lastError = error;
        
        const is503Error = error.message?.includes('503') || 
                          error.status === 503 ||
                          error.message?.includes('Service Unavailable');
        
        const isRetryableError = is503Error || 
                               error.message?.includes('timeout') ||
                               error.message?.includes('ECONNRESET') ||
                               error.message?.includes('network');
        
        console.error(`❌ RETRY: ${serviceName} attempt ${attempt + 1} failed`, {
          error: error.message,
          status: error.status,
          isRetryable: isRetryableError,
          is503: is503Error
        });
        
        // Don't retry on final attempt or non-retryable errors
        if (attempt === maxRetries || (!retryOn503 && !isRetryableError)) {
          break;
        }
        
        if (isRetryableError) {
          const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
          console.log(`⏳ RETRY: ${serviceName} waiting ${delay}ms before retry`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          break; // Don't retry non-retryable errors
        }
      }
    }
    
    throw lastError;
  }
}

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";
import { MultiStageEnhancementPipeline } from "../_shared/MultiStageEnhancementPipeline.js";
import { DifficultyLevelMapper } from "../_shared/DifficultyLevelMapper.js";

// Hardcoded avatar fallback descriptions
const AVATAR_FALLBACK_DESCRIPTIONS = {
  // PALE SKIN TONE
  "girl/pale": "{name} is a young child with pale skin, red hair, and green eyes",
  "boy/pale": "{name} is a young child with pale skin, red hair, and green eyes", 
  "prefer-not-to-answer/pale": "{name} is a young child with pale skin, red hair, and green eyes",

  // LIGHT SKIN TONE  
  "girl/light": "{name} is a young child with light skin, blonde hair, and blue eyes",
  "boy/light": "{name} is a young child with light skin, blonde hair, and blue eyes",
  "prefer-not-to-answer/light": "{name} is a young child with light skin, blonde hair, and blue eyes",

  // MEDIUM SKIN TONE
  "girl/medium": "{name} is a young child with medium skin, brown hair, and brown eyes", 
  "boy/medium": "{name} is a young child with medium skin, brown hair, and brown eyes",
  "prefer-not-to-answer/medium": "{name} is a young child with medium skin, brown hair, and brown eyes",

  // OLIVE SKIN TONE
  "girl/olive": "{name} is a young child with olive skin, natural textured hair, and dark eyes",
  "boy/olive": "{name} is a young child with olive skin, natural textured hair, and dark eyes", 
  "prefer-not-to-answer/olive": "{name} is a young child with olive skin, natural textured hair, and dark eyes",

  // DARK SKIN TONE (Enhanced descriptions)
  "girl/dark": "{name} is a young black girl, rich dark brown skin, curly black hair in ponytails, bright brown eyes, joyful expression, soft natural lighting",
  "boy/dark": "{name} is a young black boy, rich dark brown skin, short textured black hair, warm brown eyes, friendly smile, natural lighting",
  "prefer-not-to-answer/dark": "{name} is a young black child, rich dark brown skin, curly black hair in ponytails, bright brown eyes, joyful expression, soft natural lighting",

  // DEFAULT FALLBACK
  "default": "{name} is a young child with a bright smile and cheerful demeanor"
};

// Avatar consistency validation function
function validateAvatarConsistency(prompt: string, avatarIdentity: any, userInfo: any): string {
  const userName = userInfo?.name || 'child';
  
  // If no avatar identity provided, use fallback
  if (!avatarIdentity) {
    console.log('🔍 VALIDATION: No avatarIdentity provided, using fallback');
    const avatarType = userInfo?.avatar?.type || 'prefer-not-to-answer';
    const skinTone = userInfo?.avatar?.skinTone || 'medium';
    const fallbackKey = `${avatarType}/${skinTone}`;
    const fallbackDescription = AVATAR_FALLBACK_DESCRIPTIONS[fallbackKey] || AVATAR_FALLBACK_DESCRIPTIONS["default"];
    return fallbackDescription.replace('{name}', userName);
  }
  
  // Check if prompt contains generic descriptions
  const genericPatterns = [
    `${userName} is a young child`,
    `${userName} is a child`,
    'young child with',
    'child with'
  ];
  
  const isGeneric = genericPatterns.some(pattern => 
    prompt.toLowerCase().includes(pattern.toLowerCase())
  );
  
  if (isGeneric) {
    console.log('🔍 VALIDATION: Generic description detected, using enhanced fallback');
    const avatarType = avatarIdentity.type || 'prefer-not-to-answer';
    const skinTone = avatarIdentity.skinTone || 'medium';
    const fallbackKey = `${avatarType}/${skinTone}`;
    const fallbackDescription = AVATAR_FALLBACK_DESCRIPTIONS[fallbackKey] || AVATAR_FALLBACK_DESCRIPTIONS["default"];
    console.log(`🔍 VALIDATION: Using fallback ${fallbackKey}: ${fallbackDescription}`);
    return fallbackDescription.replace('{name}', userName);
  }
  
  // Replace {name} placeholder if present
  return prompt.replace('{name}', userName);
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmotionalContext {
  mood: string;
  intensity: number;
  colorPalette: string;
  lighting: string;
}

interface CharacterDescriptor {
  name: string;
  type: 'primary' | 'family' | 'friend' | 'secondary';
  relationship?: string;
  physicalTraits: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }

  try {
    console.log('🏭 Tier 2: Template-based image generation starting...');
    
    const { pageText, storyId, sessionId = storyId, userInfo, avatarIdentity, pageNumber = 1, totalPages = 10 } = await req.json();

    if (!pageText) {
      return createCorsErrorResponse('Missing pageText parameter', 400);
    }

    // Validate user info for consistency
    const validationResult = validateUserInfo(userInfo);
    if (!validationResult.valid) {
      console.warn(`⚠️ User info validation warning: ${validationResult.error}`);
    }

    console.log(`🏭 Using lean enhancement pipeline for page ${pageNumber}/${totalPages}`);

    // Use lean multi-stage enhancement pipeline for all processing
    const mappedDifficulty = DifficultyLevelMapper.mapToImageDifficulty(userInfo);
    console.log(`🔧 Mapped difficulty: ${mappedDifficulty} from user reading level: ${userInfo?.readingLevel}`, {
      userReadingLevel: userInfo?.readingLevel,
      userDifficultyLevel: userInfo?.difficultyLevel,  
      finalMappedLevel: mappedDifficulty
    });

    const enhancementResult = await MultiStageEnhancementPipeline.processTier2HighQuality(
      pageText,
      userInfo,
      storyId,
      sessionId,
      pageNumber,
      totalPages,
      avatarIdentity
    );

    // Validate and enhance character consistency with hardcoded fallbacks
    const validatedPrompt = validateAvatarConsistency(enhancementResult.enhancedPrompt, avatarIdentity, userInfo);
    console.log(`🔍 VALIDATION: Original prompt validated/enhanced`);
    console.log(`📝 Validated Prompt: ${validatedPrompt}`);

    const finalPrompt = validatedPrompt;
    const negativePrompt = enhancementResult.negativePrompt;
    const optimizedParameters = enhancementResult.generationParams;

    // 🔍 TIER 2 DEBUG LOGGING - Full prompts for debugging
    console.log(`🔍 TIER 2 DEBUG - Session: ${sessionId}, Page: ${pageNumber}/${totalPages}`);
    console.log(`📝 Enhanced Prompt (FULL): ${finalPrompt}`);
    console.log(`🚫 Negative Prompt: ${negativePrompt}`);
    console.log(`⚙️ Generation Parameters:`, optimizedParameters);

    // PHASE 5: Enhanced Runware generation with circuit breaker and retry logic
    const result = await ServiceCircuitBreaker.execute('runware-api', async () => {
      return await EnhancedRetryManager.retryWithBackoff(
        () => generateWithRunware(finalPrompt, negativePrompt, optimizedParameters, sessionId, pageNumber),
        {
          maxRetries: 2,
          baseDelay: 2000,
          maxDelay: 8000,
          retryOn503: true,
          serviceName: 'runware-template'
        }
      );
    }, { sessionId, pageNumber, promptLength: finalPrompt.length });

    if (result.success) {
      console.log(`✅ Tier 2 generation successful using template-based enhancement`);
      return createCorsResponse({
        success: true,
        imageURL: result.url,
        provider: 'runware-template',
        prompt: finalPrompt,
        qualityScore: enhancementResult.qualityScore || 0.8,
        enhancementLevel: 'template-based',
        optimizations: enhancementResult.appliedOptimizations || [],
        processingTime: result.processingTime
      });
    } else {
      console.log(`❌ Tier 2 generation failed: ${result.error}`);
      return createCorsErrorResponse(result.error || 'Template-based generation failed', 500);
    }

  } catch (error) {
    console.error('❌ Tier 2 template generation error:', error);
    return createCorsErrorResponse(`Template generation failed: ${error.message}`, 500);
  }
});

// Legacy functions removed - functionality now handled by MultiStageEnhancementPipeline

// Validate user info for template consistency
function validateUserInfo(userInfo: any): { valid: boolean; error?: string } {
  if (!userInfo) {
    return { valid: false, error: "No user info provided" };
  }
  
  if (!userInfo.name) {
    return { valid: false, error: "Missing user name" };
  }
  
  return { valid: true };
}

// PHASE 5: Runware generation with enhanced 503 error handling
async function generateWithRunware(
  prompt: string,
  negativePrompt: string,
  parameters: any,
  sessionId: string,
  pageNumber: number
): Promise<{ success: boolean; url?: string; error?: string; processingTime?: number }> {
  const startTime = Date.now();
  
  try {
    const apiKey = Deno.env.get('RUNWARE_API_KEY');
    if (!apiKey) {
      throw new Error('Runware API key not configured');
    }

    console.log(`🚀 PHASE 5: Enhanced Runware generation (template) - Session: ${sessionId}, Page: ${pageNumber}`);
    console.log(`📏 Prompt length: ${prompt.length} chars`);
    
    // WebSocket connection to Runware with enhanced error handling
    const ws = new WebSocket('wss://ws-api.runware.ai/v1');
    
    return new Promise((resolve) => {
      let authCompleted = false;
      let connectionEstablished = false;
      
      // PHASE 5: Extended timeout for better 503 recovery
      const timeout = setTimeout(() => {
        if (!connectionEstablished) {
          console.warn('🚨 PHASE 5: Connection timeout - potential 503 service unavailable');
        }
        ws.close();
        resolve({ success: false, error: 'Generation timeout (enhanced handling)' });
      }, 60000); // Increased to 60 seconds

      ws.onopen = () => {
        connectionEstablished = true;
        console.log('🔗 PHASE 5: WebSocket connection established');
        
        // Authenticate first
        const authMessage = JSON.stringify([{
          taskType: "authentication",
          apiKey: apiKey
        }]);
        ws.send(authMessage);
      };

      ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          
          // PHASE 5: Enhanced error response handling
          if (response.error || response.errors) {
            clearTimeout(timeout);
            ws.close();
            
            const errorMessage = response.errorMessage || response.errors?.[0]?.message || 'Unknown error';
            const errorCode = response.errorCode || response.errors?.[0]?.code;
            
            console.error('🚨 PHASE 5: Runware API error detected', {
              errorMessage,
              errorCode,
              sessionId,
              pageNumber
            });
            
            // Check for 503 or service unavailable patterns
            const is503Error = errorMessage.includes('503') || 
                             errorMessage.includes('Service Unavailable') ||
                             errorMessage.includes('temporarily unavailable') ||
                             errorCode === '503';
            
            if (is503Error) {
              console.error('🚨 PHASE 5: 503 Service Unavailable detected');
              const error = new Error(errorMessage);
              error.status = 503;
              resolve({ success: false, error: errorMessage });
            } else {
              resolve({ success: false, error: errorMessage });
            }
            return;
          }
          
          if (response.data) {
            for (const item of response.data) {
              if (item.taskType === 'authentication' && !authCompleted) {
                authCompleted = true;
                console.log('🔐 PHASE 5: Runware authenticated, sending generation request');
                
                // Emergency truncation with proper parameters  
                console.log(`📏 Original prompt length: ${prompt.length} characters`);
                if (prompt.length > 2990) {
                  console.warn(`🚨 EMERGENCY TRUNCATION: Prompt length ${prompt.length} > 2990, truncating...`);
                  prompt = prompt.substring(0, 2990);
                  console.log(`✂️ Truncated to ${prompt.length} characters`);
                }

                // Send image generation request
                const generationMessage = JSON.stringify([{
                  taskType: "imageInference",
                  taskUUID: crypto.randomUUID(),
                  positivePrompt: prompt,
                  negativePrompt: negativePrompt,
                  width: parameters.width || 1024,
                  height: parameters.height || 1024,
                  model: parameters.model || "runware:100@1",
                  steps: parameters.steps || 8,
                  CFGScale: parameters.CFGScale || 3.0,
                  scheduler: parameters.scheduler || "FlowMatchEulerDiscreteScheduler",
                  seed: parameters.seed || null,
                  numberResults: 1,
                  outputFormat: "WEBP"
                }]);
                
                ws.send(generationMessage);
              } else if (item.taskType === 'imageInference') {
                clearTimeout(timeout);
                ws.close();
                
                if (item.imageURL) {
                  const processingTime = Date.now() - startTime;
                  console.log(`✅ PHASE 5: Template generation SUCCESS - Session: ${sessionId}, Page: ${pageNumber}`);
                  console.log(`🖼️ Image URL: ${item.imageURL}`);
                  console.log(`⏱️ Processing Time: ${processingTime}ms`);
                  resolve({ 
                    success: true, 
                    url: item.imageURL,
                    processingTime
                  });
                } else {
                  resolve({ success: false, error: 'No image URL in response' });
                }
              }
            }
          }
        } catch (parseError) {
          console.error('🚨 PHASE 5: Error parsing WebSocket response:', parseError);
          clearTimeout(timeout);
          ws.close();
          resolve({ success: false, error: 'Failed to parse response' });
        }
      };

      ws.onerror = (error) => {
        clearTimeout(timeout);
        console.error('🚨 PHASE 5: Runware WebSocket error:', error);
        
        // Check if it's a connection-related error that might indicate 503
        const errorMessage = error.toString();
        if (errorMessage.includes('503') || !connectionEstablished) {
          console.error('🚨 PHASE 5: Potential 503 error detected in WebSocket connection');
          const enhancedError = new Error('WebSocket connection failed - potential service unavailable');
          enhancedError.status = 503;
          resolve({ success: false, error: enhancedError.message });
        } else {
          resolve({ success: false, error: 'WebSocket connection failed' });
        }
      };

      ws.onclose = (event) => {
        clearTimeout(timeout);
        console.log(`🔗 PHASE 5: WebSocket closed - Code: ${event.code}, Reason: ${event.reason}`);
        
        if (!authCompleted) {
          // Check close codes that might indicate service issues
          if (event.code === 1006 || event.code === 1011 || event.code === 1014) {
            console.error('🚨 PHASE 5: Connection closed with service error code:', event.code);
            resolve({ success: false, error: 'Service temporarily unavailable' });
          } else {
            resolve({ success: false, error: 'Connection closed before authentication' });
          }
        }
      };
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('🚨 PHASE 5: Runware generation error:', error);
    
    // Enhanced error classification
    if (error.message?.includes('503') || error.status === 503) {
      error.status = 503;
    }
    
    return { success: false, error: error.message, processingTime };
  }
}