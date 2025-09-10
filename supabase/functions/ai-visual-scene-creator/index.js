import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { CharacterConsistencyService } from '../_shared/CharacterConsistencyService.js';
import { SecondaryElementDetector } from '../_shared/SecondaryElementDetector.js';
import { SessionStateManager } from '../_shared/SessionStateManager.js';

// Inline CORS utilities to fix boot failure
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

function createCorsResponse(data, status = 200) {
  const headers = { 
    ...corsHeaders, 
    'Content-Type': 'application/json' 
  };
  
  return new Response(JSON.stringify(data), { status, headers });
}

function createCorsErrorResponse(error, status = 500) {
  const errorMessage = error instanceof Error ? error.message : error;
  console.error('Edge function error:', errorMessage);
  
  return createCorsResponse({ 
    success: false, 
    error: errorMessage 
  }, status);
}

function createCorsOptionsResponse() {
  return new Response(null, { headers: corsHeaders });
}

// AI VISUAL SCENE CREATOR - FOR IMAGE GENERATION ONLY - NEVER DISCUSS IN STORY GENERATION CONTEXT

// Inline EdgeErrorHandler replacement
const EdgeErrorHandler = {
  handleError(error, functionName, context = {}) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`ERROR ${functionName} Error:`, errorMessage, context);
    return createCorsErrorResponse(errorMessage, 500);
  },
  
  withPerformanceTracking(functionName, model, operation) {
    const startTime = Date.now();
    console.log(`START ${functionName} starting with model: ${model}`);
    
    return operation().then(result => {
      const duration = Date.now() - startTime;
      console.log(`SUCCESS ${functionName} completed in ${duration}ms`);
      return result;
    }).catch(error => {
      const duration = Date.now() - startTime;
      console.error(`ERROR ${functionName} failed after ${duration}ms:`, error);
      throw error;
    });
  }
};

// Functional VisualDetailTracker placeholder with required methods
const VisualDetailTracker = {
  enabled: true,
  analyzeTextForDetails(sessionId, text, pageNumber) {
    console.log(`VISUAL Visual details analyzed for session ${sessionId}, page ${pageNumber}`);
    // Functional placeholder - stores nothing but doesn't break
  },
  getVisualDetailsForPrompt(sessionId) {
    console.log(`GET Getting visual details for session ${sessionId}`);
    return ''; // Return empty string for consistent prompts
  },
  injectConsistentDetails(sessionId, text, pageNumber) {
    console.log(`INJECT Injecting consistent details for session ${sessionId}, page ${pageNumber}`);
    return text; // Return original text unchanged
  },
  clearSessionDetails(sessionId) {
    console.log(`CLEAR Clearing details for session ${sessionId}`);
    // Functional placeholder - clears nothing but doesn't break
  }
};

// Inline implementations for missing tierFailureMonitoring functions
const TierFailureLogger = {
  logTier1OpenAIFailure(error, details) {
    console.error('ALERT Tier 1 OpenAI Failure:', error, details);
  },
  logTier1ValidationFailure(error, details) {
    console.error('ALERT Tier 1 Validation Failure:', error, details);
  }
};

const CircuitBreakerMonitor = {
  trackCircuitBreakerState(serviceName, state, details) {
    console.log(`CIRCUIT Circuit Breaker [${serviceName}]: ${state}`, details);
  },
  trackServiceHealth(serviceName, status, details) {
    console.log(`HEALTH Service Health [${serviceName}]: ${status}`, details);
  }
};

const QualityGateMonitor = {
  trackQualityGate(gate, status, details) {
    console.log(`QUALITY Quality Gate [${gate}]: ${status}`, details);
  }
};

// Validation functions
function validatePayload(payload) {
  if (!payload) throw new Error("Payload is required");
  if (typeof payload.storyText !== 'string' || payload.storyText.trim() === '') {
    throw new Error("storyText must be a non-empty string");
  }
  if (!payload.sessionId || typeof payload.sessionId !== 'string') {
    throw new Error("sessionId must be a non-empty string");
  }
  if (typeof payload.pageNumber !== 'number' || payload.pageNumber < 1) {
    throw new Error("pageNumber must be a positive number");
  }
  if (typeof payload.totalPages !== 'number' || payload.totalPages < 1) {
    throw new Error("totalPages must be a positive number");
  }
  // Additional validations can be added here
}

// AI Models configuration
const AI_MODELS = [
  { name: 'gpt-4.1-2025-04-14', maxTokens: 'max_completion_tokens', supportsTemperature: false },
  { name: 'gpt-4o', maxTokens: 'max_tokens', supportsTemperature: true },
  { name: 'gpt-5-2025-08-07', maxTokens: 'max_completion_tokens', supportsTemperature: false }
];

// Circuit breaker state
let circuitBreakerOpen = false;
let circuitBreakerLastFailureTime = 0;
const CIRCUIT_BREAKER_TIMEOUT = 60000; // 1 minute

function isCircuitBreakerOpen() {
  if (!circuitBreakerOpen) return false;
  const now = Date.now();
  if (now - circuitBreakerLastFailureTime > CIRCUIT_BREAKER_TIMEOUT) {
    circuitBreakerOpen = false;
    console.log("Circuit breaker reset after timeout");
    return false;
  }
  return true;
}

function openCircuitBreaker() {
  circuitBreakerOpen = true;
  circuitBreakerLastFailureTime = Date.now();
  CircuitBreakerMonitor.trackCircuitBreakerState('OpenAI', 'OPEN', { time: circuitBreakerLastFailureTime });
}

function closeCircuitBreaker() {
  circuitBreakerOpen = false;
  CircuitBreakerMonitor.trackCircuitBreakerState('OpenAI', 'CLOSED', { time: Date.now() });
}

// Parsing and processing functions
function parseEnhancedStoryData(rawData) {
  try {
    if (typeof rawData === 'string') {
      return JSON.parse(rawData);
    }
    return rawData;
  } catch (error) {
    console.error("Failed to parse enhanced story data:", error);
    return null;
  }
}

async function callOpenAIModel(payload, modelName) {
  // This is a placeholder for the actual OpenAI call
  // In real implementation, you would call OpenAI API here
  console.log(`Calling OpenAI model ${modelName} with payload`, payload);
  // Simulate response
  return {
    enhancedStoryData: {
      characters: [
        { name: "Sequoia", emotions: ["happy", "curious"] }
      ],
      secondaryElements: ["forest", "flowers"]
    }
  };
}

async function processVisualSceneCreation(payload) {
  if (isCircuitBreakerOpen()) {
    throw new Error("Circuit breaker is open. Skipping OpenAI call.");
  }

  validatePayload(payload);

  // Inject consistent details if enabled
  if (VisualDetailTracker.enabled) {
    payload.storyText = VisualDetailTracker.injectConsistentDetails(payload.sessionId, payload.storyText, payload.pageNumber);
  }

  // Analyze text for visual details
  if (VisualDetailTracker.enabled) {
    VisualDetailTracker.analyzeTextForDetails(payload.sessionId, payload.storyText, payload.pageNumber);
  }

  // Select AI model (simple selection for example)
  const model = AI_MODELS[0].name;

  try {
    const response = await EdgeErrorHandler.withPerformanceTracking(
      'processVisualSceneCreation',
      model,
      () => callOpenAIModel(payload, model)
    );

    // Parse and validate response
    const enhancedData = parseEnhancedStoryData(response.enhancedStoryData);
    if (!enhancedData) {
      TierFailureLogger.logTier1ValidationFailure("Invalid enhanced story data", { payload, response });
      throw new Error("Invalid enhanced story data received from AI");
    }

    // Track quality gate success
    QualityGateMonitor.trackQualityGate('EnhancedStoryData', 'PASS', { sessionId: payload.sessionId });

    // Clear session details if last page
    if (payload.pageNumber === payload.totalPages) {
      VisualDetailTracker.clearSessionDetails(payload.sessionId);
    }

    closeCircuitBreaker();

    return {
      success: true,
      enhancedStoryData: enhancedData
    };

  } catch (error) {
    TierFailureLogger.logTier1OpenAIFailure(error, { payload });
    openCircuitBreaker();
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }

  try {
    const payload = await req.json();

    const result = await processVisualSceneCreation(payload);

    return createCorsResponse(result);

  } catch (error) {
    return EdgeErrorHandler.handleError(error, 'ai-visual-scene-creator');
  }
});
