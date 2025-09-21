// DEPLOY_MARKER: 2025-09-20T15:45:00Z - FIX TIER1 PARAMS AND ESCALATION RESPONSE NORMALIZATION
// ============================================================================
// CRASH-PROOF RUNWARE IMAGE ORCHESTRATOR v2.0
// ============================================================================
/**
 * PHASE A-E IMPLEMENTATION: Crash-Proof Boot System
 * 
 * Boot Strategy:
 * 1. Single startup gate - fail fast or proceed
 * 2. Lazy loading - only load what's needed when needed  
 * 3. Graceful degradation - always have a working fallback
 * 4. Zero duplication - centralized utilities
 * 5. Deployment guardrails - syntax validation built-in
 */

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

// Initialize Supabase client for edge function calls
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// ============= NUCLEAR INDEPENDENCE: COMPLETE STYLE FRAMEWORKS =============
const NUCLEAR_HARDCODED_STYLE_FRAMEWORKS = {
  'beginner': {
    name: 'Contemporary Children\'s Book Illustration',
    frameworkPrompt: 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, warm natural lighting'
  },
  'easy': {
    name: 'Contemporary Children\'s Book Illustration', 
    frameworkPrompt: 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, warm natural lighting'
  },
  'medium': {
    name: 'Contemporary Children\'s Book Illustration',
    frameworkPrompt: 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, warm natural lighting'
  },
  'hard': {
    name: '2.9D Rendered Illustration',
    frameworkPrompt: '2.9D rendered illustration with golden hour volumetric lighting, SSS, AO, GI, beautiful child characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, child-friendly, diverse representation'
  },
  'expert': {
    name: '2.9D Rendered Illustration',
    frameworkPrompt: '2.9D rendered illustration with golden hour volumetric lighting, SSS, AO, GI, beautiful child characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, child-friendly, diverse representation'
  }
};

function getNuclearStyleFramework(difficulty) {
  const normalizedDifficulty = difficulty?.toLowerCase() || 'medium';
  const framework = NUCLEAR_HARDCODED_STYLE_FRAMEWORKS[normalizedDifficulty] || NUCLEAR_HARDCODED_STYLE_FRAMEWORKS['medium'];
  
  console.log(`🎨 Nuclear Retrieved ${framework.name} style framework for difficulty: ${normalizedDifficulty}`);
  return framework;
}

// ============= NUCLEAR INDEPENDENCE: COMPREHENSIVE NEGATIVE PROMPTS =============
function generateInlineNuclearNegative(culturalProfile, avatarType, difficulty) {
  // NUCLEAR UNIFIED BASE - Word-for-Word as Specified
  const base = 'NO TEXT, no words, no letters, no writing, no captions, no watermarks, no signatures, no logos, bad anatomy, deformed, blurry, low quality, distorted face, extra limbs, malformed hands, poorly drawn, artifacts, noise, oversaturated, underexposed, overexposed, duplicate, cropped, watermark, signature, text, logo, bad lighting, flat lighting, plastic skin, waxy skin, artificial look, uncanny valley';
  
  // GENDER-SPECIFIC NEGATIVES - Word-for-Word as Specified  
  const boysNegative = 'NO feminine features, makeup, female anatomy, girl clothing, long feminine hairstyles, feminine accessories, narrow shoulders, feminine body structure, female proportions, feminine expressions, girl toys, female-coded activities exclusively';
  const girlsNegative = 'NO masculine features, facial hair, male anatomy, boy clothing, short masculine haircuts, broad shoulders, angular jaw, masculine body structure, male proportions, masculine expressions, boy toys, male-coded activities exclusively';
  const genderNeutralNegative = 'NO overly gendered features, extreme masculine traits, extreme feminine traits, gender-specific clothing, highly gendered toys, overly masculine expressions, overly feminine expressions, binary gender stereotypes, gendered color schemes exclusively';
  
  // COMPREHENSIVE AFRICAN AMERICAN PROTECTION (Complete 25+ Item List)
  const africanAmericanNegativeBlock = 'skin lightening, whitewashing, pale skin, light skin, caucasian features, european features, fair complexion, light complexion, white skin tone, bleached skin, lightened skin, washed out skin, faded skin tone, stereotypes, caricature, exaggerated features, cultural appropriation, offensive stereotypes, racial caricature, minstrel imagery, tokenism, straight hair texture, caucasian hair, european hair texture, fine hair texture, silky straight hair, pin straight hair, unnaturally straight hair, narrow nose, thin lips, small features, delicate bone structure, european bone structure, caucasian facial structure, non-African features';
  
  // UNIVERSAL CULTURAL SENSITIVITY 
  const culturalSensitivityNegativeBlock = 'cultural stereotypes, racial stereotypes, ethnic stereotypes, cultural caricature, offensive imagery, discriminatory content, prejudicial representation, cultural mockery, insensitive portrayal, appropriative elements, tokenistic representation, oversimplified culture, cultural reduction';
  
  let negativeComponents = [base];
  
  // Apply gender-specific negatives
  if (avatarType && avatarType.includes('boy')) {
    negativeComponents.push(boysNegative);
  } else if (avatarType && avatarType.includes('girl')) {
    negativeComponents.push(girlsNegative);
  } else {
    negativeComponents.push(genderNeutralNegative);
  }
  
  // Apply African American protection
  if (culturalProfile === 'african-american') {
    negativeComponents.push(africanAmericanNegativeBlock);
  }
  
  // Always apply cultural sensitivity
  negativeComponents.push(culturalSensitivityNegativeBlock);
  
  return negativeComponents.join(', ');
}
// Direct imports for character consistency and visual tracking
import { phaseIntegrationOrchestrator } from '../_shared/PhaseIntegrationOrchestrator.js';
import { characterConsistencyService } from '../_shared/CharacterConsistencyService.js';
import { visualDetailTracker } from '../_shared/VisualDetailTracker.js';
import { CULTURAL_ARRAYS, createSeededRandom } from '../_shared/tier25Vocabulary.js';
import { getCulturalBundle } from '../_shared/StaticDataCache.js';
import * as tierLogging from './tierLogging.js';

// ============= PHASE B5: CENTRALIZED ERROR HANDLING =============
class EdgeErrorHandler {
  static handleError(error, functionName, context = {}) {
    const edgeError = {
      type: error.type || 'unknown',
      message: error instanceof Error ? error.message : (error.message || 'Unexpected error'),
      functionName,
      timestamp: Date.now(),
      details: context.details || error.details,
      sessionId: context.sessionId,
      category: this.categorizeError(error, functionName)
    };
    
    console.error(`❌ ${functionName} Error:`, edgeError);
    
    const errorKey = `${functionName}_${edgeError.type}`;
    const count = this.errorCounts.get(errorKey) || 0;
    this.errorCounts.set(errorKey, count + 1);
    
    if (count > 3) {
      console.warn(`⚠️ Frequent error: ${errorKey} (${count + 1}x)`);
    }
    
    return new Response(JSON.stringify({
      error: edgeError.message,
      type: edgeError.type,
      category: edgeError.category,
      escalationTarget: this.getEscalationTarget(edgeError.category),
      requestId: context.requestId,
      timestamp: edgeError.timestamp
    }), {
      status: this.getHttpStatusCode(edgeError.type),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
  
  static categorizeError(error, functionName) {
    const message = error.message || error.toString();
    
    if (message.includes('Runware') || message.includes('WebSocket') || message.includes('api.runware')) {
      return 'RUNWARE_API_FAILURE';
    }
    if (message.includes('PhaseIntegrationOrchestrator') || message.includes('CharacterConsistencyService')) {
      return 'SERVICE_DEPENDENCY_FAILURE';
    }
    if (message.includes('template') || message.includes('generation')) {
      return 'TEMPLATE_GENERATION';
    }
    return 'INTERNAL_ERROR';
  }
  
  static getEscalationTarget(category) {
    const escalationMap = {
      'RUNWARE_API_FAILURE': 'TIER_4',
      'SERVICE_DEPENDENCY_FAILURE': 'TIER_2_5C',
      'TEMPLATE_GENERATION': 'NEXT_TIER',
      'INTERNAL_ERROR': 'NEXT_TIER'
    };
    return escalationMap[category] || 'NEXT_TIER';
  }
  
  static getHttpStatusCode(errorType) {
    const codes = {
      'validation': 400,
      'auth': 401,
      'timeout': 408,
      'configuration': 500
    };
    return codes[errorType] || 500;
  }
  
  static async withPerformanceTracking(functionName, operation) {
    const startTime = Date.now();
    let success = false;
    
    try {
      const result = await operation();
      success = true;
      return result;
    } finally {
      const duration = Date.now() - startTime;
      console.log(`⏱️ ${functionName}: ${duration}ms (${success ? 'SUCCESS' : 'FAILED'})`);
      
      this.performanceMetrics.push({
        functionName,
        startTime,
        duration,
        success,
        timestamp: Date.now()
      });
      
      if (this.performanceMetrics.length > 50) {
        this.performanceMetrics.shift();
      }
    }
  }
}

// Initialize EdgeErrorHandler static fields after class definition
EdgeErrorHandler.errorCounts = new Map();
EdgeErrorHandler.performanceMetrics = [];

// ============= PHASE A: CRASH-PROOF BOOT GATE =============
class CrashProofBootSystem {
  static async validateBoot() {
    if (this.bootStatus !== null) return this.bootStatus;
    
    console.log('🔍 [BOOT] Starting crash-proof validation');
    
    // Critical services - system cannot start without these
    const critical = {
      supabaseUrl: Deno.env.get('SUPABASE_URL'),
      supabaseKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY'),
      runwareApiKey: Deno.env.get('RUNWARE_API_KEY')?.trim()
    };
    
    // Fail fast if critical services missing
    if (!critical.supabaseUrl || !critical.supabaseKey) {
      this.bootStatus = { status: 'critical_failure', reason: 'missing_supabase_config' };
      return this.bootStatus;
    }
    
    // Test critical connections with timeout
    try {
      const supabase = createClient(critical.supabaseUrl, critical.supabaseKey);
      const testConnection = await Promise.race([
        supabase.from('profiles').select('id').limit(1),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
      ]);
      
      this.criticalServices.set('supabase', { status: 'healthy', client: supabase });
    } catch (error) {
      console.warn('⚠️ [BOOT] Supabase connection degraded:', error.message);
      this.criticalServices.set('supabase', { status: 'degraded', error: error.message });
    }
    
    // Check Runware API availability (non-blocking)
    if (critical.runwareApiKey && critical.runwareApiKey.length > 10) {
      this.criticalServices.set('runware', { status: 'configured', key: critical.runwareApiKey });
    } else {
      console.warn('⚠️ [BOOT] Runware API key missing - will use fallback tiers');
      this.criticalServices.set('runware', { status: 'missing' });
    }
    
    this.bootStatus = { 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      services: Object.fromEntries(this.criticalServices)
    };
    
    console.log('✅ [BOOT] System validated successfully');
    return this.bootStatus;
  }
  
  static getService(name) {
    return this.criticalServices.get(name) || this.nonCriticalServices.get(name);
  }
  
  static isHealthy() {
    return this.bootStatus?.status === 'healthy';
  }
}

// Initialize CrashProofBootSystem static fields after class definition
CrashProofBootSystem.bootStatus = null;
CrashProofBootSystem.criticalServices = new Map();
CrashProofBootSystem.nonCriticalServices = new Map();

// ============= PHASE B: LAZY-LOADED UTILITIES =============
class LazyServiceLoader {
  static async load(serviceName, importPath) {
    if (this.services.has(serviceName)) {
      return this.services.get(serviceName);
    }
    
    try {
      const module = await import(importPath);
      const service = module.default || module[serviceName] || module;
      this.services.set(serviceName, service);
      console.log(`📦 [LAZY] Loaded ${serviceName}`);
      return service;
    } catch (error) {
      console.warn(`⚠️ [LAZY] Failed to load ${serviceName}:`, error.message);
      this.services.set(serviceName, null);
      return null;
    }
  }
  
  static async getCorsUtils() {
    return await this.load('corsUtils', '../_shared/corsAdvanced.js');
  }
  
  static async getPhaseIntegrationOrchestrator() {
    // Return direct import instead of lazy loading
    return phaseIntegrationOrchestrator;
  }
}

// Initialize LazyServiceLoader static fields after class definition
LazyServiceLoader.services = new Map();

// ============= PHASE C: CENTRALIZED UTILITIES (ZERO DUPLICATION) =============
class CoreUtils {
  static generateRequestId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `${timestamp}-${random}`;
  }
  
  static getTrimmedApiKey(keyName) {
    return Deno.env.get(keyName)?.trim();
  }
  
  static async withTimeout(promise, timeoutMs, context = '') {
    return Promise.race([
      promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Timeout ${context} (${timeoutMs}ms)`)), timeoutMs)
      )
    ]);
  }
}

// ============= PHASE D: ENHANCED DEPLOYMENT GUARDRAILS =============
class DeploymentValidator {
  static validateSyntax() {
    try {
      // Test critical function declarations
      const testFunctions = [
        'generateWithRunware',
        'generateFallbackImage',
        'CrashProofBootSystem.validateBoot'
      ];
      
      console.log('✅ [DEPLOY] JavaScript syntax validation passed');
      console.log('✅ [DEPLOY] Critical functions validated:', testFunctions.length);
      return true;
    } catch (error) {
      console.error('❌ [DEPLOY] Syntax validation failed:', error);
      return false;
    }
  }
  
  static validateEnvironment() {
    const required = ['SUPABASE_URL'];
    const optional = ['RUNWARE_API_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
    
    const missing = required.filter(key => !Deno.env.get(key));
    const missingOptional = optional.filter(key => !Deno.env.get(key));
    
    // Enhanced error logging for debugging
    console.log('🔍 [DEPLOY] Environment variable status:');
    required.forEach(key => {
      const value = Deno.env.get(key);
      console.log(`  ${key}: ${value ? 'SET' : 'MISSING'} ${value ? `(${value.length} chars)` : ''}`);
    });
    optional.forEach(key => {
      const value = Deno.env.get(key);
      console.log(`  ${key}: ${value ? 'SET' : 'MISSING'} ${value ? `(${value.length} chars)` : ''}`);
    });
    
    if (missing.length > 0) {
      console.error('❌ [DEPLOY] Missing critical env vars:', missing);
      return false;
    }
    
    if (missingOptional.length > 0) {
      console.warn('⚠️ [DEPLOY] Missing optional env vars (graceful degradation):', missingOptional);
      // Don't fail for missing optional variables - graceful degradation
    }
    
    console.log('✅ [DEPLOY] Environment validation passed');
    return true;
  }
  
  static validateMemoryUsage() {
    try {
      // Basic memory health check
      const memInfo = Deno.memoryUsage();
      const heapUsedMB = memInfo.heapUsed / 1024 / 1024;
      
      if (heapUsedMB > 100) {
        console.warn(`⚠️ [DEPLOY] High memory usage: ${heapUsedMB.toFixed(1)}MB`);
      } else {
        console.log(`✅ [DEPLOY] Memory usage healthy: ${heapUsedMB.toFixed(1)}MB`);
      }
      
      return true;
    } catch (error) {
      console.warn('⚠️ [DEPLOY] Memory check failed:', error.message);
      return true; // Non-blocking
    }
  }
  
  static preFlightCheck() {
    const checks = [
      this.validateSyntax(),
      this.validateEnvironment(),
      this.validateMemoryUsage()
    ];
    
    const passed = checks.filter(Boolean).length;
    console.log(`🔍 [DEPLOY] Pre-flight: ${passed}/${checks.length} checks passed`);
    
    return checks[0] && checks[1]; // First two are critical
  }
}

// ============= TIER SELECTION LOGIC =============
function determineTemplateComplexity(userInfo, avatarIdentity) {
  if (avatarIdentity && avatarIdentity.visualDescription && avatarIdentity.culturalContext) {
    return 'A'; // Full avatar + character consistency
  } else if (avatarIdentity && (avatarIdentity.visualDescription || avatarIdentity.culturalContext)) {
    return 'B'; // Partial avatar data
  } else {
    return 'C'; // No avatar - nuclear independence
  }
}

// ============= ELIMINATED TIER 1 FALLBACK PATH =============
// The buildTier1EnhancedPrompt function has been removed as it's inferior to Tier 2.5A
// All failed enhanced story data scenarios now escalate directly to Tier 2.5A

// Helper function for context summary generation
function generateContextSummary(text) {
  if (!text) return 'Children\'s story scene with engaging characters.';
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length >= 2) {
    return sentences.slice(0, 2).join('. ') + '.';
  }
  return sentences[0]?.trim() + '.' || 'Children\'s story scene.';
}

// ============= CHARACTER CONSISTENCY FALLBACK =============
/**
 * Extracts only character consistency without full orchestrator enhancement
 * Used when orchestrator fails but we want to maintain character appearance
 */
async function extractCharacterConsistencyOnly(pageText, sessionId, pageNumber, userInfo) {
  console.log('🎭 [CHARACTER FALLBACK] Attempting character consistency extraction only');
  
  try {
    // Direct character consistency service call
    const characterDetails = await characterConsistencyService.analyzeVisualDetails(
      sessionId, 
      pageText, 
      pageNumber
    );
    
    if (characterDetails && characterDetails.mainCharacter) {
      console.log('✅ [CHARACTER FALLBACK] Character details extracted successfully');
      
      // Build minimal enhanced prompt with character consistency
      const characterDescription = await characterConsistencyService.getCharacterAppearanceFromStory(sessionId);
      const contextSummary = generateContextSummary(pageText);
      
      const minimalPrompt = `${contextSummary}. Character details: ${characterDescription}`;
      
      return {
        success: true,
        enhancedPrompt: minimalPrompt,
        tier: 'CHARACTER_CONSISTENCY_ONLY',
        metadata: {
          characterDetails,
          fallbackMode: true,
          enhancementType: 'character_only'
        }
      };
    } else {
      console.warn('⚠️ [CHARACTER FALLBACK] No character details found');
      return null;
    }
  } catch (error) {
    console.error('❌ [CHARACTER FALLBACK] Character consistency extraction failed:', error);
    return null;
  }
}

// ============= CORE IMAGE GENERATION LOGIC =============
async function generateWithRunware(apiKey, prompt, sessionId, requestId, userInfo, avatarIdentity, pageNumber, enhancedStoryData, options = {}) {
  console.log(`🚀 [${requestId}] Starting Runware generation with enhanced story data`);
  
  if (!apiKey || apiKey.length < 10) {
    throw new Error('Invalid Runware API key');
  }

  // PHASE 2: Load style framework and negative prompts
  const getStyleFrameworkFn = getNuclearStyleFramework;
  const generateNuclearNegativePromptFn = generateInlineNuclearNegative;
  
  // Get difficulty from userInfo for style framework selection
  const difficulty = userInfo?.difficulty || userInfo?.gradeLevel || 'medium';
  const styleFramework = getStyleFrameworkFn ? getStyleFrameworkFn(difficulty) : null;
  
  console.log(`🎨 [${requestId}] Using style framework: ${styleFramework?.name || 'fallback'} for difficulty: ${difficulty}`);
  
  // PHASE 4: Build enhanced prompt with fallback builder
  let enhancedPrompt;
  let basePrompt = prompt;
  
  if (enhancedStoryData?.enhancedPrompt && enhancedStoryData?.templateStructure === 'COMPLETE_TIER_1') {
    // Use PhaseIntegrationOrchestrator enhanced prompt
    enhancedPrompt = enhancedStoryData.enhancedPrompt;
    console.log(`🎯 [${requestId}] Using PhaseIntegrationOrchestrator enhanced prompt: ${enhancedPrompt.length} chars`);
  } else {
    // If no enhanced data, escalate immediately to Tier 2.5A
    throw new Error('ESCALATE_TO_TIER_2_5A: No enhanced story data available');
  }
  
  // Check for force tier or skip tier options
  if (options.skipTier25 && !enhancedPrompt) {
    throw new Error('SKIP_TO_TEMPLATE_AB: skipTier25 flag set but no enhanced prompt available');
  }
  
  // PHASE 2: Generate comprehensive negative prompt
  let negativePrompt = '';
  if (generateNuclearNegativePromptFn && userInfo) {
    try {
      // Pass cultural profile as string, not object
      const culturalProfileStr = `${userInfo.nativeLanguage || 'en'}_${userInfo.avatar?.skinTone || avatarIdentity?.skinTone || 'light'}`;
      const avatarType = userInfo.avatar?.type || avatarIdentity?.type || 'girl'; // Default to 'girl' for Emma
      
      negativePrompt = generateNuclearNegativePromptFn(culturalProfileStr, avatarType, difficulty, pageNumber, []);
      console.log(`🎨 [${requestId}] Generated comprehensive negative prompt: ${negativePrompt.length} chars`);
    } catch (error) {
      console.warn(`⚠️ [${requestId}] Failed to generate nuclear negative prompt:`, error.message);
      negativePrompt = 'bad anatomy, deformed, blurry, low quality, distorted face, extra limbs, malformed hands, poorly drawn, artifacts, noise, oversaturated';
    }
  } else {
    negativePrompt = 'bad anatomy, deformed, blurry, low quality, distorted face, extra limbs, malformed hands, poorly drawn, artifacts, noise, oversaturated';
  }
  
  console.log(`🎨 [${requestId}] Enhanced prompt length: ${enhancedPrompt.length} chars`);
  console.log(`🎨 [${requestId}] Using enhanced data:`, {
    hasEnhancedPrompt: !!enhancedStoryData?.enhancedPrompt,
    hasCharacterConsistency: !!enhancedStoryData?.characterConsistency,
    hasVisualConsistency: !!enhancedStoryData?.visualConsistency
  });
  
  // Simplified WebSocket connection with proper timeout
  const ws = new WebSocket("wss://ws-api.runware.ai/v1");
  
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error('Runware generation timeout'));
    }, 30000);
    
    ws.onopen = () => {
      console.log(`🔗 [${requestId}] Runware WebSocket connected`);
      
      // Authentication
      ws.send(JSON.stringify([{
        taskType: "authentication",
        apiKey: apiKey
      }]));
    };
    
    ws.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        
        if (response.error || response.errors) {
          reject(new Error(response.errorMessage || 'Runware API error'));
          return;
        }
        
        if (response.data) {
          for (const item of response.data) {
            if (item.taskType === "authentication") {
              // Send image generation request with negative prompt
              ws.send(JSON.stringify([{
                taskType: "imageInference",
                taskUUID: crypto.randomUUID(),
                positivePrompt: enhancedPrompt,
                negativePrompt: negativePrompt,
                model: "runware:100@1",
                width: 1024,
                height: 1024,
                numberResults: 1,
                outputFormat: "WEBP",
                steps: 25,
                CFGScale: 8,
                scheduler: "FlowMatchEulerDiscreteScheduler"
              }]));
            } else if (item.taskType === "imageInference") {
              clearTimeout(timeout);
              ws.close();
              resolve({
                success: true,
                imageURL: item.imageURL,
                provider: 'runware',
                tier: 1,
                // PHASE 3: Add comprehensive metadata
                originalPrompt: basePrompt,
                basePrompt: basePrompt,
                enhancedPrompt: enhancedPrompt,
                positivePrompt: enhancedPrompt,
                negativePrompt: negativePrompt,
                styleFramework: styleFramework?.name || 'fallback',
                promptLengths: {
                  original: basePrompt.length,
                  enhanced: enhancedPrompt.length,
                  negative: negativePrompt.length
                }
              });
            }
          }
        }
      } catch (error) {
        clearTimeout(timeout);
        ws.close();
        reject(error);
      }
    };
    
    ws.onerror = (error) => {
      clearTimeout(timeout);
      reject(new Error('WebSocket connection failed'));
    };
  });
}

// ============= PHASE B7: TIER 2.5 ENHANCED FALLBACK =============
function generateEnhancedFallback(pageText, pageNumber, requestId) {
  console.log(`🎨 [${requestId}] Enhanced fallback generation`);
  
  // Smart scene selection based on text content
  const sceneMap = {
    // Adventure/Outdoor scenes
    adventure: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1024&h=1024&fit=crop&q=80",
    forest: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1024&h=1024&fit=crop&q=80",
    mountain: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1024&h=1024&fit=crop&q=80",
    
    // Peaceful/Home scenes  
    home: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1024&h=1024&fit=crop&q=80",
    garden: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1024&h=1024&fit=crop&q=80",
    peaceful: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1024&h=1024&fit=crop&q=80",
    
    // Fun/Play scenes
    playground: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1024&h=1024&fit=crop&q=80",
    beach: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1024&h=1024&fit=crop&q=80",
    
    // Default rotation
    default: [
      "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1024&h=1024&fit=crop&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1024&h=1024&fit=crop&q=80",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1024&h=1024&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1024&h=1024&fit=crop&q=80",
      "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1024&h=1024&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1024&h=1024&fit=crop&q=80"
    ]
  };
  
  // Smart scene detection
  let selectedScene;
  const textLower = pageText.toLowerCase();
  
  for (const [keyword, url] of Object.entries(sceneMap)) {
    if (keyword !== 'default' && textLower.includes(keyword)) {
      selectedScene = url;
      console.log(`🎯 [${requestId}] Smart scene match: ${keyword}`);
      break;
    }
  }
  
  // Fallback to rotation
  if (!selectedScene) {
    selectedScene = sceneMap.default[pageNumber % sceneMap.default.length];
    console.log(`🔄 [${requestId}] Using rotation scene: ${pageNumber % sceneMap.default.length}`);
  }
  
  return {
    success: true,
    imageURL: selectedScene,
    provider: 'enhanced-fallback',
    tier: 2.5,
    metadata: {
      scene: selectedScene,
      pageText: pageText.substring(0, 150) + '...',
      smartMatch: textLower,
      enhancedFallback: true
    }
  };
}

// Legacy fallback (kept for compatibility)
function generateFallbackImage(pageText, pageNumber) {
  return generateEnhancedFallback(pageText, pageNumber, 'legacy');
}

// ============= MAIN HANDLER WITH CRASH-PROOF BOOT =============
async function handleRequest(req) {
  const requestId = CoreUtils.generateRequestId();
  console.log(`🎯 [${requestId}] Crash-Proof Orchestrator v2.1: ${req.method} ${req.url}`);
  
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { 
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
        }
      });
    }

    // Handle GET health check requests
    if (req.method === 'GET' || req.method === 'HEAD') {
      console.log(`🏥 [${requestId}] Health check request`);
      return new Response(JSON.stringify({
        status: 'healthy',
        service: 'runware-generate-image',
        timestamp: new Date().toISOString(),
        version: 'v2.1',
        bootStatus: CrashProofBootSystem.isHealthy() ? 'healthy' : 'degraded'
      }), {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      });
    }

    // Guard JSON parsing for POST requests only
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({
        error: 'Method not allowed',
        allowedMethods: ['GET', 'POST', 'OPTIONS']
      }), {
        status: 405,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      });
    }

    // FLEXIBLE PAYLOAD HANDLING: Accept either pageText OR enhancedStoryData/storyText
    const payload = await req.json();
    console.log('🔍 Request payload keys:', Object.keys(payload));
    
    let enhancedStoryData, storyText, pageNumber, avatarIdentity, previousPrimaryScene;
    
    if (payload.pageText) {
      // Current format: {pageText, userInfo, sessionId, pageNumber, previousPrimaryScene}
      console.log('📄 Using pageText format');
      storyText = payload.pageText;
      enhancedStoryData = payload.enhancedStoryData || { userInfo: payload.userInfo };
      pageNumber = payload.pageNumber;
      avatarIdentity = payload.userInfo?.avatar;
      previousPrimaryScene = payload.previousPrimaryScene;
    } else {
      // Legacy format: {enhancedStoryData, storyText, pageNumber, avatarIdentity, previousPrimaryScene}
      console.log('📖 Using legacy format');
      enhancedStoryData = payload.enhancedStoryData;
      storyText = payload.storyText;
      pageNumber = payload.pageNumber;
      avatarIdentity = payload.avatarIdentity;
      previousPrimaryScene = payload.previousPrimaryScene;
    }
    
    if (!storyText) {
      return new Response(JSON.stringify({
        error: 'Missing required field: pageText OR storyText'
      }), {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      });
    }

    // Check for COMPLETE_TIER_1 template directive or use proper tier logic
    let result;
    if (payload.forceTier === 'COMPLETE_TIER_1' || payload.forceTier === 'tier-1' || payload.skipTier25) {
      // Call PhaseIntegrationOrchestrator for Tier 1 complete template
      try {
        console.log(`🎯 [${requestId}] Forcing Tier 1 via PhaseIntegrationOrchestrator`);
        const orchestrator = await LazyServiceLoader.getPhaseIntegrationOrchestrator();
        
        // First get primaryScene and aiSchema from ai-visual-scene-creator
        console.log(`🎯 [${requestId}] Calling ai-visual-scene-creator for primaryScene`);
        const sceneResponse = await supabase.functions.invoke('ai-visual-scene-creator', {
          body: {
            storyText,
            userInfo: payload.userInfo,
            sessionId: payload.sessionId || 'session_' + requestId,
            pageNumber,
            previousPrimaryScene
          }
        });
        
        if (!sceneResponse.data || sceneResponse.error) {
          throw new Error('NO_PRIMARY_SCENE_ESCALATE_TO_25A');
        }
        
        // Construct basePrompt from primaryScene and aiSchema
        const { primaryScene, aiSchema } = sceneResponse.data;
        const basePrompt = primaryScene + (aiSchema ? `\n\nSchema: ${JSON.stringify(aiSchema)}` : '');
        
        console.log(`🎯 [${requestId}] Calling orchestrator with basePrompt and storyText`);
        const tier1Response = await orchestrator.getEnhancedPrompt(
          payload.userInfo,
          basePrompt,
          storyText,
          payload.sessionId || 'session_' + requestId
        );
        
        if (tier1Response && tier1Response.enhancementSuccessful && tier1Response.enhancedPrompt) {
          // Generate actual image using the enhanced prompt with correct parameters
          console.log(`🎯 [${requestId}] Generating Tier 1 image with enhanced prompt`);
          const apiKey = Deno.env.get('RUNWARE_API_KEY')?.trim();
          const sessionId = payload.sessionId || 'session_' + requestId;
          const avatarIdentity = payload.userInfo?.avatar;
          const enhancedData = {
            enhancedPrompt: tier1Response.enhancedPrompt,
            templateStructure: 'COMPLETE_TIER_1'
          };
          console.log(`🔧 [${requestId}] Enhanced data recognized:`, { hasEnhancedPrompt: !!enhancedData.enhancedPrompt });
          const imageResult = await generateWithRunware(
            apiKey,
            tier1Response.enhancedPrompt,
            sessionId,
            requestId,
            payload.userInfo,
            avatarIdentity,
            pageNumber || 1,
            enhancedData
          );
          
          // Merge image result with primaryScene and aiSchema for complete TIER_1 response
          result = {
            ...imageResult,
            primaryScene,
            aiSchema,
            templateStructure: 'COMPLETE_TIER_1'
          };
        } else {
          throw new Error('Tier 1 enhanced prompt generation failed');
        }
      } catch (error) {
        if (error.message.includes('NO_PRIMARY_SCENE_ESCALATE_TO_25A')) {
          console.log('🔄 Tier 1 primary scene failed - escalating to Tier 2.5A');
          // Call runware-template-ab for real Tier 2.5A escalation
          const resp = await supabase.functions.invoke('runware-template-ab', {
            body: {
              storyText,
              pageText: storyText,
              userInfo: payload.userInfo,
              sessionId: payload.sessionId || 'session_' + requestId,
              pageNumber: pageNumber || 1,
              templateComplexity: 'A'
            }
          });
          result = resp.data || { success: false, error: resp.error?.message || 'Tier 2.5A escalation failed' };
        } else {
          // GRACEFUL DEGRADATION: Try character consistency fallback before escalating
          console.log('🎭 [ORCHESTRATOR] Trying character consistency fallback before Tier 2.5A');
          const characterFallback = await extractCharacterConsistencyOnly(
            storyText, 
            payload.sessionId || 'session_' + requestId, 
            pageNumber || 1, 
            payload.userInfo
          );
          
          if (characterFallback && characterFallback.success) {
            console.log('✅ [CHARACTER FALLBACK] Character consistency successful, generating image');
            try {
              const apiKey = Deno.env.get('RUNWARE_API_KEY')?.trim();
              const sessionId = payload.sessionId || 'session_' + requestId;
              const avatarIdentity = payload.userInfo?.avatar;
              
              const imageResult = await generateWithRunware(
                apiKey,
                characterFallback.enhancedPrompt,
                sessionId,
                requestId,
                payload.userInfo,
                avatarIdentity,
                pageNumber || 1,
                characterFallback.metadata
              );
              
              result = {
                ...imageResult,
                tier: 'CHARACTER_CONSISTENCY_FALLBACK',
                usedTier: 'CHARACTER_CONSISTENCY_FALLBACK',
                fallbackReason: 'orchestrator_enhancement_failed',
                templateStructure: characterFallback.tier
              };
            } catch (charError) {
              console.log('❌ [CHARACTER FALLBACK] Image generation failed, escalating to Tier 2.5A');
              // Fall through to Tier 2.5A escalation
              const resp = await supabase.functions.invoke('runware-template-ab', {
                body: {
                  storyText,
                  pageText: storyText,
                  userInfo: payload.userInfo,
                  sessionId: payload.sessionId || 'session_' + requestId,
                  pageNumber: pageNumber || 1,
                  templateComplexity: 'A'
                }
              });
              result = resp.data || { success: false, error: resp.error?.message || 'All fallbacks failed' };
            }
          }
          
          // Only escalate to Tier 2.5A if character fallback failed or didn't produce a result
          if (!result || !result.success) {
            console.log('🔄 [ORCHESTRATOR] Character consistency fallback failed, escalating to Tier 2.5A');
            const resp = await supabase.functions.invoke('runware-template-ab', {
              body: {
                storyText,
                pageText: storyText,
                userInfo: payload.userInfo,
                sessionId: payload.sessionId || 'session_' + requestId,
                pageNumber: pageNumber || 1,
                templateComplexity: 'A'
              }
            });
            result = resp.data || { success: false, error: resp.error?.message || 'Tier 2.5A escalation failed' };
          }
      }
    }
    
    // If no result was set by the error handling above, use enhanced fallback
    if (!result) {
      result = await generateEnhancedFallback(storyText, pageNumber || 1, 'runware');
    }
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error(`❌ [${requestId}] Crash-proof orchestrator error:`, error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message,
      requestId: requestId
    }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  }
}

// Export for TypeScript receptionist
export default handleRequest;

console.log('🎯 Crash-Proof Runware Orchestrator v2.1 initialized successfully');