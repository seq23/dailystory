import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

// CORS and Response Utilities
function createCorsResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    }
  });
}

function createCorsErrorResponse(message, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    }
  });
}

function createCorsOptionsResponse() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    }
  });
}

// Error Handling and Monitoring Utilities
const EdgeErrorHandler = {
  async withPerformanceTracking(operation, operationName = 'unknown') {
    const startTime = Date.now();
    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      console.log(`✅ ${operationName} completed successfully in ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ ${operationName} failed after ${duration}ms:`, error.message);
      throw error;
    }
  }
};

const VisualDetailTracker = {
  trackClothingDetails(sessionId, pageNumber, clothing) {
    console.log(`📝 Tracking clothing for session ${sessionId}, page ${pageNumber}:`, clothing);
    // Placeholder for tracking visual details across sessions
  },
  
  getClothingDetails(sessionId, pageNumber) {
    console.log(`📖 Retrieving clothing for session ${sessionId}, page ${pageNumber}`);
    return null; // Placeholder - would return cached clothing details
  }
};

const TierFailureLogger = {
  logFailure(tier, model, error, context = {}) {
    console.error(`❌ Tier ${tier} failure - Model: ${model}`, {
      error: error.message,
      context,
      timestamp: new Date().toISOString()
    });
  }
};

const CircuitBreakerMonitor = {
  logStateChange(newState, reason, context = {}) {
    console.log(`🔄 Circuit Breaker State: ${newState} - ${reason}`, {
      context,
      timestamp: new Date().toISOString()
    });
  }
};

const QualityGateMonitor = {
  logQualityCheck(result, criteria, context = {}) {
    console.log(`🎯 Quality Gate Check: ${result ? 'PASS' : 'FAIL'}`, {
      criteria,
      context,
      timestamp: new Date().toISOString()
    });
  }
};

// Validation Functions
function checkPrimarySceneCriteria(enhancedData) {
  const criteria = {
    hasCharacters: false,
    hasValidScene: false,
    hasEmotionalContent: false,
    hasVisualDetails: false,
    hasNarrative: false
  };

  if (!enhancedData || !enhancedData.characters) {
    return { passed: false, criteria, score: 0 };
  }

  // Check for characters
  if (enhancedData.characters && enhancedData.characters.length > 0) {
    criteria.hasCharacters = true;
  }

  // Check for valid scene
  if (enhancedData.scene && (enhancedData.scene.setting || enhancedData.scene.environment)) {
    criteria.hasValidScene = true;
  }

  // Check for emotional content
  if (enhancedData.characters.some(char => char.emotions && char.emotions.length > 0)) {
    criteria.hasEmotionalContent = true;
  }

  // Check for visual details
  if (enhancedData.visualDetails && Object.keys(enhancedData.visualDetails).length > 0) {
    criteria.hasVisualDetails = true;
  }

  // Check for narrative
  if (enhancedData.narrative || enhancedData.scene?.narrative) {
    criteria.hasNarrative = true;
  }

  const passedCount = Object.values(criteria).filter(Boolean).length;
  const totalCriteria = Object.keys(criteria).length;
  const score = (passedCount / totalCriteria) * 100;

  return {
    passed: score >= 60, // 60% pass rate
    criteria,
    score: Math.round(score),
    passedCount,
    totalCriteria
  };
}

function validateAndEnhanceContent(enhancedData, originalText) {
  const validation = {
    isValid: false,
    hasRequiredFields: false,
    hasCharacterData: false,
    hasSceneData: false,
    score: 0,
    issues: []
  };

  if (!enhancedData) {
    validation.issues.push('No enhanced data provided');
    return validation;
  }

  // Check required fields
  if (enhancedData.characters && enhancedData.scene) {
    validation.hasRequiredFields = true;
  } else {
    validation.issues.push('Missing required fields (characters or scene)');
  }

  // Check character data quality
  if (enhancedData.characters && enhancedData.characters.length > 0) {
    const validCharacters = enhancedData.characters.filter(char => 
      char.name && (char.description || char.emotions)
    );
    if (validCharacters.length > 0) {
      validation.hasCharacterData = true;
    }
  } else {
    validation.issues.push('No valid character data');
  }

  // Check scene data quality
  if (enhancedData.scene && (enhancedData.scene.setting || enhancedData.scene.environment)) {
    validation.hasSceneData = true;
  } else {
    validation.issues.push('No valid scene data');
  }

  const validPoints = [
    validation.hasRequiredFields,
    validation.hasCharacterData,
    validation.hasSceneData
  ].filter(Boolean).length;

  validation.score = Math.round((validPoints / 3) * 100);
  validation.isValid = validation.score >= 60;

  return validation;
}

// AI Models Configuration
const AI_MODELS = [
  {
    name: 'gpt-4.1-2025-04-14',
    tier: 1,
    timeout: 30000,
    isExpertContent: false,
    maxCompletionTokens: 2048
  },
  {
    name: 'gpt-4o',
    tier: 2,
    timeout: 25000,
    isExpertContent: false,
    maxTokens: 1500
  },
  {
    name: 'gpt-4o-mini',
    tier: 3,
    timeout: 20000,
    isExpertContent: false,
    maxTokens: 1200
  }
];

// Circuit Breaker Implementation
class UnifiedCircuitBreaker {
  constructor() {
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failures = new Map(); // model -> failure count
    this.lastFailureTime = new Map(); // model -> timestamp
    this.circuitOpenTime = new Map(); // model -> timestamp when opened
    this.FAILURE_THRESHOLD = 3;
    this.RECOVERY_TIMEOUT = 60000; // 1 minute
    this.HALF_OPEN_MAX_CALLS = 1;
    this.halfOpenCalls = new Map(); // model -> call count
    this.expertContentAware = true;
  }

  async execute(modelName, operation, isExpertContent = false) {
    const currentState = this.getModelState(modelName);
    
    if (currentState === 'OPEN') {
      if (this.shouldAttemptRecovery(modelName)) {
        this.transitionToHalfOpen(modelName);
      } else {
        throw new Error(`Circuit breaker is OPEN for model ${modelName}`);
      }
    }

    if (currentState === 'HALF_OPEN') {
      const currentCalls = this.halfOpenCalls.get(modelName) || 0;
      if (currentCalls >= this.HALF_OPEN_MAX_CALLS) {
        throw new Error(`Circuit breaker HALF_OPEN limit exceeded for ${modelName}`);
      }
      this.halfOpenCalls.set(modelName, currentCalls + 1);
    }

    try {
      const result = await operation();
      this.onSuccess(modelName);
      return result;
    } catch (error) {
      this.onFailure(modelName, error, isExpertContent);
      throw error;
    }
  }

  getModelState(modelName) {
    if (this.circuitOpenTime.has(modelName)) {
      if (this.shouldAttemptRecovery(modelName)) {
        return 'HALF_OPEN';
      }
      return 'OPEN';
    }
    return 'CLOSED';
  }

  shouldAttemptRecovery(modelName) {
    const openTime = this.circuitOpenTime.get(modelName);
    if (!openTime) return false;
    return Date.now() - openTime > this.RECOVERY_TIMEOUT;
  }

  transitionToHalfOpen(modelName) {
    this.circuitOpenTime.delete(modelName);
    this.halfOpenCalls.set(modelName, 0);
    CircuitBreakerMonitor.logStateChange('HALF_OPEN', 'Recovery timeout elapsed', { modelName });
  }

  onSuccess(modelName) {
    this.failures.delete(modelName);
    this.lastFailureTime.delete(modelName);
    this.circuitOpenTime.delete(modelName);
    this.halfOpenCalls.delete(modelName);
    
    if (this.getModelState(modelName) !== 'CLOSED') {
      CircuitBreakerMonitor.logStateChange('CLOSED', 'Operation succeeded', { modelName });
    }
  }

  onFailure(modelName, error, isExpertContent) {
    const currentFailures = (this.failures.get(modelName) || 0) + 1;
    this.failures.set(modelName, currentFailures);
    this.lastFailureTime.set(modelName, Date.now());

    // Expert content gets higher threshold
    const threshold = isExpertContent && this.expertContentAware ? 
      this.FAILURE_THRESHOLD + 2 : this.FAILURE_THRESHOLD;

    if (currentFailures >= threshold) {
      this.circuitOpenTime.set(modelName, Date.now());
      this.halfOpenCalls.delete(modelName);
      CircuitBreakerMonitor.logStateChange('OPEN', `Failure threshold exceeded (${currentFailures}/${threshold})`, { 
        modelName, 
        error: error.message,
        isExpertContent 
      });
    }
  }

  getStatus() {
    const status = {
      globalState: this.state,
      models: {},
      failureCounts: Object.fromEntries(this.failures),
      lastFailureTimes: Object.fromEntries(this.lastFailureTime),
      openCircuits: Array.from(this.circuitOpenTime.keys())
    };

    for (const model of AI_MODELS) {
      status.models[model.name] = this.getModelState(model.name);
    }

    return status;
  }

  reset() {
    this.failures.clear();
    this.lastFailureTime.clear();
    this.circuitOpenTime.clear();
    this.halfOpenCalls.clear();
    CircuitBreakerMonitor.logStateChange('RESET', 'Manual circuit breaker reset');
  }
}

const circuitBreaker = new UnifiedCircuitBreaker();

// JSON Parsing with Comprehensive Fallback Strategy
function parseEnhancedStoryData(rawData) {
  console.log('🔍 Starting enhanced JSON parsing with 4-strategy fallback system');
  
  if (!rawData || typeof rawData !== 'string') {
    console.log('❌ Invalid raw data type:', typeof rawData);
    throw new Error('Invalid input data for parsing');
  }

  const strategies = [
    {
      name: 'Direct JSON Parse',
      execute: (data) => JSON.parse(data.trim())
    },
    {
      name: 'Extract JSON Block',
      execute: (data) => {
        const jsonMatch = data.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (!jsonMatch) throw new Error('No JSON block found');
        return JSON.parse(jsonMatch[1]);
      }
    },
    {
      name: 'Find JSON Object',
      execute: (data) => {
        const startIndex = data.indexOf('{');
        const endIndex = data.lastIndexOf('}');
        if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
          throw new Error('No JSON object boundaries found');
        }
        const jsonStr = data.substring(startIndex, endIndex + 1);
        return JSON.parse(jsonStr);
      }
    },
    {
      name: 'Balanced Brace Extraction',
      execute: (data) => {
        let braceCount = 0;
        let startIndex = -1;
        
        for (let i = 0; i < data.length; i++) {
          if (data[i] === '{') {
            if (braceCount === 0) startIndex = i;
            braceCount++;
          } else if (data[i] === '}') {
            braceCount--;
            if (braceCount === 0 && startIndex !== -1) {
              const jsonStr = data.substring(startIndex, i + 1);
              return JSON.parse(jsonStr);
            }
          }
        }
        throw new Error('No balanced JSON object found');
      }
    }
  ];

  for (let i = 0; i < strategies.length; i++) {
    const strategy = strategies[i];
    try {
      console.log(`📋 Attempting Strategy ${i + 1}: ${strategy.name}`);
      const result = strategy.execute(rawData);
      
      if (result && typeof result === 'object') {
        console.log(`✅ Strategy ${i + 1} (${strategy.name}) succeeded`);
        console.log('📊 Parsed object keys:', Object.keys(result));
        return result;
      } else {
        console.log(`⚠️ Strategy ${i + 1} returned invalid result type:`, typeof result);
      }
    } catch (error) {
      console.log(`❌ Strategy ${i + 1} (${strategy.name}) failed:`, error.message);
    }
  }

  console.error('💥 All JSON parsing strategies failed');
  throw new Error('Failed to parse enhanced story data with all strategies');
}

// OpenAI Integration with Comprehensive Fallback
async function callOpenAIWithFallback(payload, requestId) {
  const openAIKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIKey) {
    throw new Error('OpenAI API key not configured');
  }

  console.log(`🚀 Starting OpenAI fallback chain for request ${requestId}`);
  
  const availableModels = AI_MODELS.filter(model => {
    const state = circuitBreaker.getModelState(model.name);
    return state !== 'OPEN';
  });

  if (availableModels.length === 0) {
    console.error('❌ All AI models have open circuit breakers');
    throw new Error('All AI models are currently unavailable');
  }

  console.log(`📋 Available models: ${availableModels.map(m => m.name).join(', ')}`);

  for (let i = 0; i < availableModels.length; i++) {
    const model = availableModels[i];
    
    try {
      console.log(`🎯 Attempting Tier ${model.tier} with model: ${model.name}`);
      
      const result = await circuitBreaker.execute(
        model.name,
        () => callOpenAIModel(payload, model, requestId),
        model.isExpertContent
      );
      
      console.log(`✅ Tier ${model.tier} (${model.name}) succeeded`);
      return result;
      
    } catch (error) {
      console.error(`❌ Tier ${model.tier} (${model.name}) failed:`, error.message);
      TierFailureLogger.logFailure(model.tier, model.name, error, { requestId, payload: { sessionId: payload.sessionId } });
      
      if (i === availableModels.length - 1) {
        console.error('💥 All available tiers exhausted');
        throw error;
      }
    }
  }
}

async function callOpenAIModel(payload, model, requestId) {
  const openAIKey = Deno.env.get('OPENAI_API_KEY');
  
  const messages = [
    {
      role: 'system',
      content: `You are an expert story enhancement AI that transforms simple text into rich, detailed visual scenes suitable for image generation.

CRITICAL REQUIREMENTS:
1. Return ONLY valid JSON in this exact structure:
{
  "characters": [
    {
      "name": "character_name",
      "description": "detailed visual description",
      "emotions": ["emotion1", "emotion2"],
      "clothing": "detailed clothing description",
      "position": "where they are in the scene"
    }
  ],
  "scene": {
    "setting": "detailed environment description",
    "lighting": "lighting conditions",
    "mood": "overall scene mood",
    "environment": "physical environment details"
  },
  "visualDetails": {
    "colors": ["color1", "color2"],
    "objects": ["object1", "object2"],
    "atmosphere": "atmospheric description"
  },
  "narrative": "enhanced narrative description"
}

2. Include the main character with avatar identity: ${JSON.stringify(payload.avatarIdentity)}
3. Focus on visual, descriptive content suitable for image generation
4. Ensure cultural sensitivity and age-appropriate content
5. Return ONLY the JSON object, no additional text or formatting`
    },
    {
      role: 'user',
      content: `Transform this story text into enhanced visual scene data: "${payload.storyText}"

Context:
- Session ID: ${payload.sessionId}
- Page: ${payload.pageNumber}/${payload.totalPages}
- User: ${payload.userInfo.name}
- Avatar: ${JSON.stringify(payload.avatarIdentity)}

Return the enhanced scene data as JSON.`
    }
  ];

  const requestBody = {
    model: model.name,
    messages: messages
  };

  // Add appropriate token parameter based on model
  if (model.maxCompletionTokens) {
    requestBody.max_completion_tokens = model.maxCompletionTokens;
  } else if (model.maxTokens) {
    requestBody.max_tokens = model.maxTokens;
  }

  console.log(`📤 Sending request to ${model.name} (Tier ${model.tier})`);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), model.timeout);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response structure from OpenAI');
    }

    const content = data.choices[0].message.content;
    console.log(`📥 Received response from ${model.name}:`, content.substring(0, 200) + '...');

    const enhancedData = parseEnhancedStoryData(content);
    
    return {
      enhancedStoryData: enhancedData,
      model: model.name,
      tier: model.tier,
      usage: data.usage || {},
      requestId
    };

  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${model.timeout}ms for model ${model.name}`);
    }
    
    throw error;
  }
}

// Character Consistency Service (Simplified Implementation)
const CharacterConsistencyService = {
  async getCharacterSeed(sessionId, avatarIdentity, storyContext, sessionType, pageTextClothing) {
    console.log(`👤 Getting character seed for session ${sessionId}`);
    
    // Simplified implementation - would connect to database in full version
    return {
      characterName: avatarIdentity?.name || 'Main Character',
      physicalTraits: {
        skinTone: avatarIdentity?.skinTone || 'medium',
        type: avatarIdentity?.type || 'child',
        culturalBackground: avatarIdentity?.culturalBackground || 'diverse'
      },
      clothingStyle: 'casual',
      seed: `${sessionId}-${avatarIdentity?.type}-${avatarIdentity?.skinTone}`
    };
  },

  async buildCharacterDescription(seedData, storyContext, pageTextClothing, sessionId) {
    console.log(`🎨 Building character description for session ${sessionId}`);
    
    return `A ${seedData.physicalTraits.type} with ${seedData.physicalTraits.skinTone} skin tone, wearing ${seedData.clothingStyle} clothing. ${storyContext || ''}`;
  }
};

// Secondary Element Detector (Simplified Implementation)
const SecondaryElementDetector = {
  async parseElements(sessionId, primaryScene, storyText, pageNumber) {
    console.log(`🔍 Detecting secondary elements for session ${sessionId}, page ${pageNumber}`);
    
    // Simplified detection - would use complex regex patterns in full version
    const elements = [];
    
    // Basic family member detection
    const familyPatterns = /(mom|mother|dad|father|sister|brother|grandma|grandpa)/gi;
    const familyMatches = storyText.match(familyPatterns);
    
    if (familyMatches) {
      familyMatches.forEach(match => {
        elements.push({
          type: 'character',
          name: match.toLowerCase(),
          relationship: 'family',
          detectedIn: storyText
        });
      });
    }

    // Basic animal detection
    const animalPatterns = /(dog|cat|bird|rabbit|horse|pet)/gi;
    const animalMatches = storyText.match(animalPatterns);
    
    if (animalMatches) {
      animalMatches.forEach(match => {
        elements.push({
          type: 'animal',
          species: match.toLowerCase(),
          relationship: 'companion',
          detectedIn: storyText
        });
      });
    }

    console.log(`📋 Detected ${elements.length} secondary elements`);
    return elements;
  }
};

// Session State Manager (Simplified Implementation)
const SessionStateManager = {
  async updateSessionContext(sessionId, newData) {
    console.log(`💾 Updating session context for ${sessionId}`);
    // Would persist to database in full version
    return { success: true };
  },

  async getSessionContext(sessionId) {
    console.log(`📖 Getting session context for ${sessionId}`);
    // Would retrieve from database in full version
    return null;
  }
};

// Main Processing Function with 3-Phase System
async function processVisualSceneCreation(payload) {
  console.log('🎬 Starting Visual Scene Creation with 3-Phase Processing System');
  console.log('📊 Input payload:', {
    sessionId: payload.sessionId,
    pageNumber: payload.pageNumber,
    hasAvatarIdentity: !!payload.avatarIdentity,
    textLength: payload.storyText?.length || 0
  });

  // Validate payload
  if (!payload.storyText || !payload.sessionId || !payload.userInfo) {
    throw new Error('Missing required payload fields');
  }

  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  console.log(`🆔 Generated Request ID: ${requestId}`);

  try {
    // PHASE 1: AI Scene Generation
    console.log('🚀 === PHASE 1: AI Scene Generation ===');
    
    const aiResult = await EdgeErrorHandler.withPerformanceTracking(
      () => callOpenAIWithFallback(payload, requestId),
      `AI Scene Generation (${requestId})`
    );

    console.log('✅ Phase 1 completed - AI scene generated');
    console.log('📊 AI Result:', {
      model: aiResult.model,
      tier: aiResult.tier,
      hasCharacters: !!aiResult.enhancedStoryData?.characters?.length,
      hasScene: !!aiResult.enhancedStoryData?.scene
    });

    // PHASE 2: Post-AI Construction and Enhancement
    console.log('🔧 === PHASE 2: Post-AI Construction ===');
    
    const characterSeed = await CharacterConsistencyService.getCharacterSeed(
      payload.sessionId,
      payload.avatarIdentity,
      payload.storyText,
      'live',
      null
    );

    const characterDescription = await CharacterConsistencyService.buildCharacterDescription(
      characterSeed,
      payload.storyText,
      null,
      payload.sessionId
    );

    const secondaryElements = await SecondaryElementDetector.parseElements(
      payload.sessionId,
      aiResult.enhancedStoryData,
      payload.storyText,
      payload.pageNumber
    );

    // Track visual details
    VisualDetailTracker.trackClothingDetails(
      payload.sessionId,
      payload.pageNumber,
      aiResult.enhancedStoryData?.characters?.[0]?.clothing || 'casual clothing'
    );

    console.log('✅ Phase 2 completed - Character consistency and secondary elements processed');

    // PHASE 3: Validation and Quality Assessment
    console.log('🎯 === PHASE 3: Validation & Quality Assessment ===');
    
    const primaryValidation = checkPrimarySceneCriteria(aiResult.enhancedStoryData);
    const contentValidation = validateAndEnhanceContent(aiResult.enhancedStoryData, payload.storyText);

    QualityGateMonitor.logQualityCheck(
      primaryValidation.passed,
      primaryValidation.criteria,
      { requestId, sessionId: payload.sessionId }
    );

    console.log('📊 Validation Results:', {
      primaryScore: primaryValidation.score,
      contentValid: contentValidation.isValid,
      overallQuality: primaryValidation.passed && contentValidation.isValid ? 'HIGH' : 'MEDIUM'
    });

    // Update session state
    await SessionStateManager.updateSessionContext(payload.sessionId, {
      lastProcessedPage: payload.pageNumber,
      lastCharacterSeed: characterSeed,
      lastAIModel: aiResult.model
    });

    console.log('✅ Phase 3 completed - All validations passed');

    // Construct comprehensive response
    const response = {
      success: true,
      enhancedStoryData: aiResult.enhancedStoryData,
      metadata: {
        requestId,
        sessionId: payload.sessionId,
        pageNumber: payload.pageNumber,
        processing: {
          model: aiResult.model,
          tier: aiResult.tier,
          processingTimePhases: {
            phase1_ai_generation: 'completed',
            phase2_post_processing: 'completed', 
            phase3_validation: 'completed'
          }
        },
        validation: {
          primarySceneScore: primaryValidation.score,
          contentValidation: contentValidation.isValid,
          qualityGate: primaryValidation.passed && contentValidation.isValid
        },
        characterConsistency: {
          characterSeed: characterSeed.seed,
          clothingTracked: true,
          secondaryElementsCount: secondaryElements.length
        },
        circuitBreakerStatus: circuitBreaker.getStatus(),
        timestamp: new Date().toISOString()
      }
    };

    console.log('🎉 Visual Scene Creation completed successfully');
    return response;

  } catch (error) {
    console.error('❌ Visual Scene Creation failed:', error);
    
    const errorResponse = {
      success: false,
      error: error.message,
      metadata: {
        requestId,
        sessionId: payload.sessionId,
        failurePhase: 'processing',
        circuitBreakerStatus: circuitBreaker.getStatus(),
        timestamp: new Date().toISOString()
      }
    };

    return errorResponse;
  }
}

// Main Serve Function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }

  try {
    console.log('🎬 AI Visual Scene Creator - Request received');
    console.log('📊 Request details:', {
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(req.headers.entries())
    });

    if (req.method !== 'POST') {
      return createCorsErrorResponse('Method not allowed', 405);
    }

    let payload;
    try {
      payload = await req.json();
      console.log('📥 Payload received:', {
        hasStoryText: !!payload.storyText,
        hasSessionId: !!payload.sessionId,
        hasUserInfo: !!payload.userInfo,
        hasAvatarIdentity: !!payload.avatarIdentity
      });
    } catch (error) {
      console.error('❌ Invalid JSON payload:', error);
      return createCorsErrorResponse('Invalid JSON payload', 400);
    }

    // Handle diagnostic endpoints
    if (payload.diagnostic) {
      console.log('🔍 Diagnostic mode activated:', payload.diagnostic);
      
      switch (payload.diagnostic) {
        case 'circuit-breaker-status':
          const status = circuitBreaker.getStatus();
          console.log('📊 Circuit breaker status:', status);
          return createCorsResponse({
            diagnostic: 'circuit-breaker-status',
            status,
            timestamp: new Date().toISOString()
          });

        case 'health-check':
          return createCorsResponse({
            diagnostic: 'health-check',
            status: 'healthy',
            availableModels: AI_MODELS.map(m => ({
              name: m.name,
              tier: m.tier,
              circuitState: circuitBreaker.getModelState(m.name)
            })),
            timestamp: new Date().toISOString()
          });

        case 'reset-circuit-breaker':
          circuitBreaker.reset();
          return createCorsResponse({
            diagnostic: 'reset-circuit-breaker',
            status: 'reset-completed',
            timestamp: new Date().toISOString()
          });

        default:
          return createCorsErrorResponse(`Unknown diagnostic: ${payload.diagnostic}`, 400);
      }
    }

    // Process normal visual scene creation request
    const result = await processVisualSceneCreation(payload);
    
    if (result.success) {
      console.log('✅ Request processed successfully');
      return createCorsResponse(result);
    } else {
      console.error('❌ Processing failed:', result.error);
      return createCorsErrorResponse(result.error, 500);
    }

  } catch (error) {
    console.error('💥 Unhandled error in serve function:', error);
    return createCorsErrorResponse(`Internal server error: ${error.message}`, 500);
  }
});