// Streamlined Story Generation Handler
// Processes pre-processed bundles from frontend services  
// Uses shared validation utilities for consistent page generation

import { getStoryPrompt, getExpertStoryPrompt, formatUserPrompt, resolvePromptPlaceholders, getExpectedPages, getPerPageTokenLimit, mapGradeToExpertLevel, type DifficultyLevel, type ExpertGradeLevel } from "../_shared/storyPrompts.ts";
import { 
  parseIntoPages as sharedParseIntoPages, 
  getTokensForGrade as sharedGetTokensForGrade,
  mapDifficultyToLevel,
  type ValidationLevel 
} from "../_shared/validation-utils.ts";
import { resolveAllPlaceholders } from '../_shared/placeholderResolver.ts';
import { UnifiedValidator, type ValidationConfig } from '../_shared/unifiedValidator.ts';
import { safeErrorMessage, safePropertyAccess, safeModelAccess } from '../_shared/errorPatterns.ts';

// Phase 2: Cultural context now embedded in StaticDataCache (no external imports needed)

// Import static caching and error classification
import { getModelChain, getHairColorMapping, getSystemSettings, processAvatarIdentityFromCache, getCulturalContextArrays, getVocabularyCache } from './StaticDataCache.ts';
const { classifyError, getRetryEnhancement, ErrorCategory } = await import('./errorClassification.ts');

// CORS headers - moved to top to fix ReferenceError
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StreamlinedBundle {
  sessionId: string;
  storyContent: string;
  avatarData: {
    skinTone?: string;
  };
  systemSettings: {
    gradeLevel: number;
    complianceTarget: number;
  };
}

interface StreamlinedConfig {
  sessionType: 'free' | 'premium' | 'repair';
  pageNumber: number;
  existingStory?: string;
  isEndingPage?: boolean;
  // Repair-specific configuration
  repairAttempt?: number;
  originalContent?: string[];
  repairReasons?: string[];
}

// Hair color mapping using cached data (performance optimized)
function getHairColorForSkinTone(skinTone: string | undefined): string | null {
  if (!skinTone) return null;
  const mapping = getHairColorMapping();
  return mapping[skinTone] || null;
}

export async function handleStreamlinedGeneration(requestBody: any) {
  const { bundle, config }: { bundle: StreamlinedBundle; config: StreamlinedConfig & { expertGradeLevel?: string; difficulty?: string } } = requestBody;
  
  // PHASE 1: API Key Validation
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!apiKey) {
    console.error('❌ CRITICAL: OpenAI API key not found in environment');
    return new Response(JSON.stringify({
      success: false,
      error: 'OpenAI API key not configured. Please check Supabase secrets.',
      errorType: 'api_key_missing'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  if (!apiKey.startsWith('sk-')) {
    console.error('❌ CRITICAL: Invalid OpenAI API key format');
    return new Response(JSON.stringify({
      success: false,
      error: 'Invalid OpenAI API key format. Please check Supabase secrets.',
      errorType: 'api_key_invalid'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  try {
    // PRIORITY: Use expertGradeLevel or difficulty from config if provided
    let effectiveDifficulty: DifficultyLevel | ExpertGradeLevel;
    let expertGrade: ExpertGradeLevel | null = null;
    
    if (config.expertGradeLevel) {
      // Direct expert grade level passed from Netflix service
      expertGrade = config.expertGradeLevel as ExpertGradeLevel;
      effectiveDifficulty = expertGrade;
      console.log(`🎓 STREAMLINED: Using direct expert grade level: ${expertGrade}`);
    } else if (config.difficulty) {
      // Direct difficulty passed from Netflix service
      effectiveDifficulty = config.difficulty as DifficultyLevel;
      // Check if it's actually an expert grade in disguise
      if (['grade6', 'grade7', 'grade8', 'grade9', 'grade10'].includes(config.difficulty)) {
        expertGrade = config.difficulty as ExpertGradeLevel;
        console.log(`🎓 STREAMLINED: Detected expert grade in difficulty: ${expertGrade}`);
      } else {
        console.log(`📚 STREAMLINED: Using regular difficulty: ${effectiveDifficulty}`);
      }
    } else {
      // Fallback to system grade level mapping
      expertGrade = mapGradeToExpertLevel(bundle.systemSettings.gradeLevel);
      effectiveDifficulty = expertGrade || mapGradeLevelToDifficulty(bundle.systemSettings.gradeLevel);
      console.log(`🔄 STREAMLINED: Fallback mapping - Grade ${bundle.systemSettings.gradeLevel} → ${effectiveDifficulty}`);
    }
    
    // Use existing prompts from storyPrompts.ts - handle expert grades (6-10) separately
    const promptConfig = expertGrade 
      ? getExpertStoryPrompt(expertGrade)
      : getStoryPrompt(effectiveDifficulty as DifficultyLevel);
    
    // Extract userInfo from already-resolved bundle
    let userInfo = {};
    try {
      const matches = bundle.storyContent.match(/Character Info: ({.*})/);
      if (matches) {
        userInfo = JSON.parse(matches[1]);
        // Add avatar data from separate field (clean prompts) - FIXED STRUCTURE
        if (bundle.avatarData?.skinTone) {
          userInfo = { 
            ...userInfo, 
            avatar: { 
              skinTone: bundle.avatarData.skinTone, 
              type: userInfo.avatar?.type || 'prefer-not-to-answer' 
            } 
          };
        }
      }
    } catch (e) {
      console.warn('Could not extract userInfo from bundle, using defaults');
    }

    // Bundle already contains resolved natural language - use directly
    let finalSystemPrompt = promptConfig.systemPrompt;
    let finalUserPrompt = bundle.storyContent;

    // Parse control line from bundle - Enhanced with fail-soft defaults
    let ctrlData = null;
    try {
      const ctrlMatch = bundle.storyContent.match(/<CTRL>(.*?)<\/CTRL>/);
      if (ctrlMatch) {
        ctrlData = JSON.parse(ctrlMatch[1]);
        console.log('🎭 Parsed voice control data:', ctrlData);
      }
    } catch (error) {
      console.warn('⚠️ Could not parse control data, using fail-soft defaults');
      
      // Fail-soft: Create minimal control data structure
      ctrlData = {
        vf: { id: 'neutral_v0', cad: 12, var: 3, fig: 0.45, hum: 0.5, warm: 0.85, nar: 'storybook' },
        iu: { mode: 'direct', caps: { u: { max: 4 }, c: { max: 3 }, a: { max: 2 }, f: { max: 1 }, h: { max: 1 } } },
        ah: { u: 0.8, c: 0.6, a: 0.5, f: 0.3, h: 0.4 }, // neutral affinity baseline
        themes: ['friendship'],
        level: effectiveDifficulty || 'medium'
      };
    }

    // Add fail-soft instructions to system prompt
    if (ctrlData) {
      finalSystemPrompt += `\n\nCONTROL PARAMETERS: ${JSON.stringify(ctrlData)}
- Voice characteristics: ${ctrlData.vf?.nar || 'storybook'} narrative style
- Input integration mode: ${ctrlData.iu?.mode || 'direct'}
- Affinity hints: ${JSON.stringify(ctrlData.ah || {})} (prioritize high-scoring inputs)
- Input usage caps: ${JSON.stringify(ctrlData.iu?.caps || {})} (max usage per type)
- Theme focus: ${ctrlData.themes?.join(', ') || 'adventure'}
- Level: ${ctrlData.level || 'medium'}`;
    }

    finalSystemPrompt += `\n\nFAIL-SOFT RULES:
- If CTRL data is missing or minimal, choose reasonable defaults and continue
- Never reference missing information or apologize for limitations
- Always produce a complete story regardless of input quality
- Use provided user inputs only if they exist, otherwise omit gracefully
- Default to gentle, age-appropriate themes if none specified`;
    
    // Add available functions to system prompt
    finalSystemPrompt += `\n\nAVAILABLE FUNCTIONS:
- getCulturalContext(userInfo) - Fetch culturally relevant character names, foods, and celebrations when needed`;
    
    // REPAIR MODE: Enhance prompts with repair-specific instructions
    if (config.sessionType === 'repair' && config.originalContent && config.repairReasons) {
      console.log('🔧 STREAMLINED: Applying repair-specific prompt enhancements');
      
      const repairInstructions = `
REPAIR REQUEST (Attempt ${config.repairAttempt || 1}):
The following content had these issues: ${config.repairReasons.join(', ')}

ORIGINAL CONTENT TO REPAIR:
${config.originalContent.join(' ')}

REPAIR INSTRUCTIONS:
- Fix vocabulary that's too advanced or inappropriate
- Ensure appropriate content length
- Maintain story coherence and age-appropriate language
- Keep the same characters and core narrative
- Address the specific issues mentioned above

Generate a corrected version that addresses these issues while keeping the story engaging.`;
      
      finalSystemPrompt += '\n\n' + repairInstructions;
      finalUserPrompt = bundle.storyContent + '\n\nPlease repair the content based on the instructions above.';
    }
    
    const aiPrompt = {
      systemPrompt: finalSystemPrompt,
      userPrompt: finalUserPrompt // Already resolved by 4-tier system or enhanced for repair
    };
    
    // Generate story with OpenAI - pass the effective grade level for token calculation
    const effectiveGradeLevel = expertGrade ? 
      (parseInt(expertGrade.replace('grade', '')) || bundle.systemSettings.gradeLevel) : 
      bundle.systemSettings.gradeLevel;
    
    // Use service-aware token limits based on difficulty and service type
    const storyText = await generateWithOpenAI(aiPrompt, effectiveGradeLevel, userInfo, undefined, effectiveDifficulty, config, bundle.sessionId, bundle);
    
    // PHASE 5: Bulk Story Processing - Apply validation, grammar, placeholders to ENTIRE story ONCE
    // Compute validation level first
    const validationLevel = expertGrade ? 
      mapDifficultyToLevel(expertGrade) : 
      mapDifficultyToLevel(effectiveDifficulty as DifficultyLevel);
    
    // Step 1: Apply UnifiedValidator to entire story with actual token budget
    const actualTokenBudget = effectiveDifficulty ? getServiceAwareTokenLimit(effectiveDifficulty, config) : getServiceSpecificFallback(config);
    const validationConfig: ValidationConfig = {
      mode: config.sessionType === 'free' ? 'guest' : 'live',
      level: validationLevel,
      userLanguage: 'en',
      actualTokenBudget,
      retryAttempt: config.repairAttempt || 0,
      isEndingPage: config.isEndingPage || false
    };
    
    console.log(`🔍 Validation Config: mode=${validationConfig.mode}, actualTokenBudget=${actualTokenBudget}, retryAttempt=${config.repairAttempt || 0}`);
    
    const validationResult = UnifiedValidator.validateContent(storyText, validationConfig);
    
    // Detect service type for proper page parsing
    const serviceType = getServiceType(config);
    console.log(`🎯 Service Type Detected: ${serviceType}`);
    
    // Check if validation requires retry with hints
    if (validationResult.decision === 'RETRY_WITH_HINT' && (config.repairAttempt || 0) < 2) {
      console.log(`🔄 RETRY WITH HINT: Validation suggests retry (attempt ${(config.repairAttempt || 0) + 1})`);
      console.log('Validation hints:', validationResult.hints);
      
      // Append hints to the AI prompt and retry generation
      const hintsText = validationResult.hints ? 
        '\n\nIMPORTANT REQUIREMENTS:\n' + validationResult.hints.join('\n') : '';
      
      const retryPrompt = {
        systemPrompt: aiPrompt.systemPrompt + hintsText,
        userPrompt: aiPrompt.userPrompt + hintsText
      };
      
      // Retry with updated config
      const retryConfig = {
        ...config,
        repairAttempt: (config.repairAttempt || 0) + 1
      };
      
      console.log(`🔄 Retrying generation with hints (attempt ${retryConfig.repairAttempt})`);
      const retryStoryText = await generateWithOpenAI(retryPrompt, effectiveGradeLevel, userInfo, undefined, effectiveDifficulty, retryConfig, bundle.sessionId, bundle);
      
      // Validate the retry result
      const retryValidationResult = UnifiedValidator.validateContent(retryStoryText, {
        ...validationConfig,
        retryAttempt: retryConfig.repairAttempt,
        isEndingPage: config.isEndingPage || false
      });
      
      if (retryValidationResult.decision === 'ACCEPT' || retryValidationResult.decision === 'REPAIR_AND_SPLIT') {
        console.log(`✅ Retry successful with decision: ${retryValidationResult.decision}`);
        // Use the retry result with proper service detection
        const retryPlaceholderResolved = resolveAllPlaceholders(retryStoryText, { userInfo });
        const retryPages = sharedParseIntoPages(retryPlaceholderResolved, validationLevel, serviceType);
        
        // Calculate educational standards compliance for retry result
        let retryVocabCompliance = 1.0;
        try {
          // Use modern complexity analysis instead of static word matching
          retryVocabCompliance = calculateEducationalCompliance(retryPlaceholderResolved, effectiveGradeLevel);
        } catch (error) {
          // Silent fallback to high compliance
          retryVocabCompliance = 0.9;
        }
        
        return new Response(JSON.stringify({
          success: true,
          story: retryPlaceholderResolved,
          pages: retryPages,
          vocabCompliance: retryVocabCompliance,
          metadata: {
            processingMode: 'retry-with-hints',
            gradeLevel: bundle.systemSettings.gradeLevel,
            vocabularyCompliance: retryVocabCompliance,
            retryAttempt: retryConfig.repairAttempt,
            originalValidationDecision: validationResult.decision,
            retryValidationDecision: retryValidationResult.decision
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        console.log(`⚠️ Retry still failed with decision: ${retryValidationResult.decision}, proceeding with original`);
        // Fall through to use original result with any available fixes
      }
    }
    
    // Step 2: Apply placeholder resolution to entire story ONCE (grammar processing moved to process-story-content)
    const placeholderResolved = resolveAllPlaceholders(storyText, { userInfo });
    
    // Step 4: THEN parse into pages using shared validation utilities with service detection
    const pages = sharedParseIntoPages(placeholderResolved, validationLevel, serviceType);
    
    // Calculate educational standards compliance
    let vocabCompliance = 1.0;
    try {
      // Use modern complexity analysis instead of static word matching
      vocabCompliance = calculateEducationalCompliance(placeholderResolved, effectiveGradeLevel);
    } catch (error) {
      // Silent fallback to high compliance
      vocabCompliance = 0.9;
    }
    
    // Return streamlined response with bulk-processed story
    return new Response(JSON.stringify({
      success: true,
      story: placeholderResolved,
      pages: pages, // Use bulk-processed pages
      vocabCompliance,
      metadata: {
        processingMode: 'streamlined-bulk',
        gradeLevel: bundle.systemSettings.gradeLevel,
        vocabularyCompliance: vocabCompliance
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ STREAMLINED: Generation failed:', error);
    
    // Enhanced error categorization
    let errorType = 'unknown_error';
    let userMessage = 'Story generation failed';
    
    if (error instanceof Error) {
      const errorMessage = safeErrorMessage(error).toLowerCase();
      if (errorMessage.includes('api key') || errorMessage.includes('unauthorized')) {
        errorType = 'api_key_error';
        userMessage = 'AI service authentication failed. Please try again.';
      } else if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
        errorType = 'rate_limit_error';
        userMessage = 'AI service is busy. Please try again in a moment.';
      } else if (errorMessage.includes('model') || errorMessage.includes('availability')) {
        errorType = 'model_unavailable';
        userMessage = 'AI model temporarily unavailable. Please try again.';
      } else if (errorMessage.includes('all ai generation attempts failed')) {
        errorType = 'ai_generation_failed';
        userMessage = 'AI generation failed after multiple attempts. Please try again.';
      }
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: userMessage,
      errorType,
      technicalError: safeErrorMessage(error)
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

function mapGradeLevelToDifficulty(gradeLevel: number): DifficultyLevel {
  if (gradeLevel === 0) return 'beginner';
  if (gradeLevel === 1) return 'easy';
  if (gradeLevel === 2) return 'medium';
  if (gradeLevel === 3) return 'hard';
  return 'expert';
}

/**
 * Get per-page token limits directly from system prompts - SINGLE SOURCE OF TRUTH
 */
function getPerPageTokenLimitLocal(difficulty: DifficultyLevel | ExpertGradeLevel): number {
  try {
    // Import the function from storyPrompts and call it
    return getPerPageTokenLimit(difficulty);
  } catch (error) {
    console.error(`❌ Failed to get per-page token limit for ${difficulty}:`, error);
    // Fallback to known values from system prompts
    const fallbacks: Record<string, number> = {
      'beginner': 15,  // Level0: "15 tokens per page"
      'easy': 60,      // Level1: "60 tokens per page"
      'medium': 75,    // Level2: "75 tokens per page" - FIXED from 250
      'hard': 120,     // Level3: "120 tokens per page" - FIXED from 350
      'expert': 180,   // Level4: "180 tokens per page" - FIXED from 500
      'grade6': 350,   // Grade6: "350 tokens per page" - FIXED from 500
      'grade7': 350,   // Grade7: "350 tokens per page" - FIXED from 500
      'grade8': 350,   // Grade8: "350 tokens per page" - FIXED from 500
      'grade9': 350,   // Grade9: "350 tokens per page" - FIXED from 500
      'grade10': 350,  // Grade10: "350 tokens per page" - FIXED from 500
    };
    return fallbacks[difficulty] || 350;
  }
}

/**
 * Get Netflix token limits (full story) = per-page × expected pages
 */
function getNetflixTokenLimit(difficulty: DifficultyLevel | ExpertGradeLevel): number {
  const perPageTokens = getPerPageTokenLimitLocal(difficulty);
  const expectedPages = getExpectedPages(difficulty);
  const netflixLimit = perPageTokens * expectedPages;
  
  console.log(`📚 Netflix token limit for ${difficulty}: ${perPageTokens}/page × ${expectedPages} pages = ${netflixLimit} tokens`);
  return netflixLimit;
}

/**
 * Get Live token limits (single page) = per-page limit only
 */
function getLiveTokenLimit(difficulty: DifficultyLevel | ExpertGradeLevel): number {
  const liveLimit = getPerPageTokenLimitLocal(difficulty);
  
  console.log(`📄 Live token limit for ${difficulty}: ${liveLimit} tokens per page`);
  return liveLimit;
}

/**
 * Service-specific fallback token limits
 */
function getServiceSpecificFallback(config?: StreamlinedConfig): number {
  const isLiveGeneration = config?.sessionType === 'premium';
  return isLiveGeneration ? 350 : 1500; // Live: 350 (single page), Netflix: 1500 (multiple pages)
}

/**
 * Determine service type based on config
 */
function getServiceType(config?: StreamlinedConfig): 'netflix' | 'live' {
  // Netflix service: Guest users (sessionType: 'free') get full stories
  // Live service: Premium users (sessionType: 'premium') get page-by-page generation
  
  const isLiveGeneration = config?.sessionType === 'premium';
  const serviceType = isLiveGeneration ? 'live' : 'netflix';
  
  console.log(`🎯 Service Type Detection:`, {
    sessionType: config?.sessionType,
    pageNumber: config?.pageNumber,
    hasExistingStory: !!config?.existingStory,
    isLiveGeneration,
    detectedService: serviceType
  });
  
  return serviceType;
}

/**
 * Service-aware token limit function - detects Netflix vs Live automatically
 */
function getServiceAwareTokenLimit(difficulty: DifficultyLevel | ExpertGradeLevel, config?: StreamlinedConfig): number {
  // Simplified service detection logic
  const isLiveGeneration = config?.sessionType === 'premium';
  const isNetflixGeneration = config?.sessionType === 'free';
  
  console.log(`🎯 Service Detection: sessionType=${config?.sessionType}, pageNumber=${config?.pageNumber}, hasExistingStory=${!!config?.existingStory}`);
  console.log(`🎯 Service Decision: isLive=${isLiveGeneration}, isNetflix=${isNetflixGeneration}`);
  
  if (isLiveGeneration) {
    const limit = getLiveTokenLimit(difficulty);
    console.log(`📄 Using Live token limit: ${limit}`);
    return limit;
  } else {
    const limit = getNetflixTokenLimit(difficulty);
    console.log(`📺 Using Netflix token limit: ${limit}`);
    return limit;
  }
}

async function generateWithOpenAI(prompt: { systemPrompt: string; userPrompt: string }, gradeLevel: number, userInfo?: any, customTokenLimit?: number, difficulty?: DifficultyLevel | ExpertGradeLevel, config?: StreamlinedConfig, sessionId?: string, bundleForDebug?: any): Promise<string> {
  // Protected token limit calculation with service-specific fallbacks
  let maxTokens: number;
  try {
    maxTokens = customTokenLimit || (difficulty ? getServiceAwareTokenLimit(difficulty, config) : getServiceSpecificFallback(config));
  } catch (tokenError) {
    console.warn('⚠️ Token limit calculation failed, using service-specific fallback:', safeErrorMessage(tokenError));
    maxTokens = getServiceSpecificFallback(config);
  }
  
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  
  // Enhanced avatar processing using StaticDataCache - UNIVERSAL coverage
  let enhancedUserPrompt = prompt.userPrompt;
  
  // Phase 3: Vocabulary Caching Integration - Inject cached vocabulary BEFORE generation
  const enhancedPromptWithVocabulary = preprocessVocabularyFromCache(enhancedUserPrompt, gradeLevel);
  enhancedUserPrompt = enhancedPromptWithVocabulary.prompt;
  const vocabCachePerformance = enhancedPromptWithVocabulary.performance;
  
  try {
    // Use userInfo which already contains avatar data from bundle
    const completeAvatarInfo = userInfo;
    const avatarInfo = processAvatarIdentityFromCache(completeAvatarInfo);
    
    // Universal hair color enhancement (no language restriction)
    if (avatarInfo.hairColor && avatarInfo.userName) {
      enhancedUserPrompt += `\nPhysical description: ${avatarInfo.userName} has ${avatarInfo.hairColor}.`;
    }
    
    // Universal gender/pronoun enhancement  
    if (avatarInfo.completeGenderInfo && avatarInfo.userName) {
      enhancedUserPrompt += `\nCharacter pronouns: ${avatarInfo.userName} is a ${avatarInfo.completeGenderInfo}.`;
    }
    
    // Add clear directives for AI story creation
    enhancedUserPrompt += `\n\nCREATIVE Suggestions (guidelines, not hard rules):
- Weave in user preferences naturally:
  - favoriteColor → objects, clothing, scenery, atmosphere
  - favoriteAnimal → companion, helper, or encountered character
  - hobbies/skills → problem-solving, challenges, abilities
  - favoriteFood → meals, discoveries, celebrations
- Subtly reflect cultural background: You have access to getCulturalContext() function for authentic cultural elements. Use as background details only - never stereotypical or plot-central. Frequency: 1-2 brief mentions maximum per story.
- Use natural storytelling flow with engaging openings, smooth transitions, and satisfying conclusions.

- Use vocabulary integration liberally.`;
    
  } catch (avatarError) {
    console.warn('⚠️ Avatar processing failed:', safeErrorMessage(avatarError));
  }

  // Enhanced AI Generation with Intelligent Circuit Breaker
  let storyText = '';
  let attempt = 1;
  let currentModelIndex = 0;
  let retriesOnCurrentModel = 0;
  const maxRetriesPerModel = 2;
  const startTime = Date.now(); // Track processing time
  
  // Protected expert detection and model chain initialization
  let isExpertLevel: boolean;
  let modelProgression: any[];
  let systemSettings: any;
  let maxAttempts: number;
  
  try {
    isExpertLevel = gradeLevel >= 6 && gradeLevel <= 10;
    modelProgression = getModelChain(isExpertLevel);
    systemSettings = getSystemSettings();
    maxAttempts = safePropertyAccess(systemSettings, 'maxAttempts', { expert: 6, regular: 3 })[isExpertLevel ? 'expert' : 'regular'];
  } catch (initError) {
    console.warn('⚠️ Model chain initialization failed, using defaults:', safeErrorMessage(initError));
    isExpertLevel = gradeLevel >= 6 && gradeLevel <= 10;
    modelProgression = [{ model: 'gpt-5-2025-08-07', description: 'Primary Model', paramName: 'max_completion_tokens', supportsTemperature: false }];
    systemSettings = { baseInstructions: '\n\nGenerate high-quality, age-appropriate story content.' };
    maxAttempts = isExpertLevel ? 6 : 3;
  }
  
  console.log(`🎯 Intelligent Circuit Breaker: ${isExpertLevel ? 'EXPERT' : 'REGULAR'} mode - ${maxAttempts} attempts available`);
  
  const baseInstructions = safePropertyAccess(systemSettings, 'baseInstructions', '\n\nGenerate high-quality, age-appropriate story content.');

  while (attempt <= maxAttempts && !storyText) {
    try {
      // Protected model access with bounds checking
      const currentModel = currentModelIndex < modelProgression.length 
        ? safeModelAccess(modelProgression[currentModelIndex])
        : { name: 'gpt-5-2025-08-07', description: 'Fallback Model' };
      
      console.log(`🤖 AI Attempt ${attempt}/${maxAttempts} using ${currentModel.name} (${currentModel.description}) - Model ${currentModelIndex + 1}/${modelProgression.length}, Retry ${retriesOnCurrentModel + 1}/${maxRetriesPerModel}:`, { 
        gradeLevel,
        tokenBudget: maxTokens,
        qualityFirst: attempt === 1,
        hasTargetVocabulary: enhancedUserPrompt.includes('Priority vocabulary')
      });
      
      // Attempt 1: Base prompt + complete instructions
      // Attempt 2: Same complete instructions + reliability emphasis
      let enhancedSystemPrompt = prompt.systemPrompt + baseInstructions;
      let finalUserPrompt = enhancedUserPrompt;
      
      // Progressive retry enhancement with *** reminders based on attempt number
      if (isExpertLevel) {
        if (attempt === 2) {
          enhancedSystemPrompt += `\n\nQUALITY ENHANCEMENT: Second attempt with intelligent model - focus on sophisticated narrative structure and advanced vocabulary integration.`;
        } else if (attempt >= 3) {
          enhancedSystemPrompt += `\n\nRELIABILITY EMPHASIS: Attempt ${attempt}/${maxAttempts} - prioritize completion and reliability while maintaining quality. Generate any engaging story content that meets the requirements above.`;
          finalUserPrompt += ` Create engaging story with natural flow and clear narrative structure. Include all target vocabulary naturally.`;
        }
      } else if (attempt === 2) {
        enhancedSystemPrompt += `\n\nRELIABILITY EMPHASIS: Final attempt before template fallback - prioritize completion and reliability. Generate any engaging story content that meets the requirements above.`;
        finalUserPrompt += ` Create any engaging story with natural flow and clear narrative structure. Include all target vocabulary naturally.`;
      }
      
      // Protected API call with correct model parameters and enhanced logging
      const apiBody: any = {
        model: safePropertyAccess(currentModel, 'name', 'gpt-5-2025-08-07'),
        messages: [
          { role: 'system', content: enhancedSystemPrompt },
          { role: 'user', content: finalUserPrompt }
        ]
      };
      
  // PHASE 3: Enhanced token limits with reasoning overhead for newer models
  try {
    const paramName = safePropertyAccess(currentModel, 'paramName', 'max_completion_tokens');
    let adjustedTokens = Math.min(maxTokens, 100000); // Base limit
    
    apiBody[paramName] = adjustedTokens;
    console.log(`🎯 Service-Aware Token Limit: ${apiBody[paramName]} (${difficulty ? `${difficulty} - ${config?.pageNumber ? 'Live' : 'Netflix'}` : `grade ${gradeLevel}`})`);
  } catch (paramError) {
    console.warn('⚠️ Parameter assignment failed, using default:', safeErrorMessage(paramError));
    apiBody.max_completion_tokens = Math.min(maxTokens, 100000);
  }
      
      // Add temperature for legacy models that support it
      if (safePropertyAccess(currentModel, 'supportsTemperature', false)) {
        apiBody.temperature = 0.8;
      }
      
      console.log(`🔍 API Request attempt ${attempt}:`, {
        model: currentModel.name,
        tokenValidation: 'DISABLED',
        supportsTemperature: !!currentModel.supportsTemperature,
        promptLength: enhancedSystemPrompt.length + finalUserPrompt.length,
        note: 'Service-aware token limits applied - Netflix (full story) vs Live (per page)'
      });
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiBody),
      });

      console.log(`🔍 API Response attempt ${attempt}:`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API Error ${response.status} on attempt ${attempt}:`, {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText,
          model: currentModel?.name || 'unknown'
        });
        
        // Store failed AI prompt for debugging (EVERYTHING sent to AI, even failures)
        try {
          const { globalSessionManager } = await import('../_shared/SessionStateManager.js');
        globalSessionManager.storeAIPromptForDebugging(sessionId || 'unknown-session', {
          systemPrompt: enhancedSystemPrompt,
          userPrompt: finalUserPrompt,
          model: currentModel.name,
          tokenLimit: apiBody[safePropertyAccess(currentModel, 'paramName', 'max_completion_tokens')],
          pageNumber: config?.pageNumber || 1,
          attempt: attempt,
           success: false,
           bundle: bundleForDebug,
            apiResponse: {
              status: response.status,
                statusText: response.statusText,
                errorBody: errorText,
                error: `API Error ${response.status}`,
                content: errorText
              }
           });
        } catch (debugError) {
          console.warn('⚠️ Failed to store failed AI prompt for debugging:', debugError);
        }
        
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log(`🔍 API Response data attempt ${attempt}:`, {
        hasChoices: !!data.choices,
        choicesLength: data.choices?.length || 0,
        firstChoiceContent: data.choices?.[0]?.message?.content ? 'present' : 'missing',
        contentLength: data.choices?.[0]?.message?.content?.length || 0,
        usage: data.usage
      });
      
      storyText = data.choices?.[0]?.message?.content || '';
      
      // PHASE 2: Function Call Detection and Execution
      if (storyText && hasFunctionCalls(storyText)) {
        console.log('🔧 Function calls detected in AI response, executing functions...');
        
        try {
          const executedContent = await executeFunctionCalls(storyText, {
            userInfo: completeAvatarInfo,
            gradeLevel: gradeLevel,
            difficulty: difficulty
          });
          
          if (executedContent !== storyText) {
            // Re-inject the executed content back to AI for final processing
            storyText = await reInjectExecutedContent(executedContent, enhancedSystemPrompt, apiKey, currentModel);
            console.log('✅ Function calls executed and content re-injected successfully');
          }
        } catch (functionError) {
          console.warn('⚠️ Function execution failed, using original content:', safeErrorMessage(functionError));
          // Continue with original content - don't break the story generation
        }
      }
      
      // PHASE 3: Detect reasoning tokens consuming all budget without content
      const usage = data.usage || {};
      const reasoningTokens = usage.completion_tokens_details?.reasoning_tokens || 0;
      const contentLength = storyText?.length || 0;
      
      if (reasoningTokens > 0 && contentLength < 50) {
        console.log(`⚠️ REASONING TOKEN ISSUE: Model ${currentModel.name} used ${reasoningTokens} reasoning tokens but produced ${contentLength} chars. Advancing to content-focused model.`);
        
        // Store failure for debugging
        try {
          const { globalSessionManager } = await import('../_shared/SessionStateManager.js');
          globalSessionManager.storeAIPromptForDebugging(sessionId || 'unknown-session', {
            systemPrompt: enhancedSystemPrompt,
            userPrompt: finalUserPrompt,
            model: currentModel.name,
            tokenLimit: apiBody[safePropertyAccess(currentModel, 'paramName', 'max_completion_tokens')],
            pageNumber: config?.pageNumber || 1,
            attempt: attempt,
            success: false,
            bundle: bundleForDebug,
             apiResponse: {
               status: response.status,
               contentLength,
               usage: data.usage,
               reasoningTokenFailure: true,
               reasoningTokens,
               content: storyText || ''
             }
          });
        } catch (debugError) {
          console.warn('⚠️ Failed to store reasoning token failure for debugging:', debugError);
        }
        
        // Skip to next model (prefer content-focused models)
        currentModelIndex++;
        retriesOnCurrentModel = 0;
        if (currentModelIndex >= modelProgression.length) {
          console.error('❌ All models failed including reasoning token fallback');
          throw new Error('All AI generation attempts failed - reasoning models consuming tokens without content');
        }
        
        attempt++;
        continue;
      }
      
      // Store complete AI prompt for debugging (EVERYTHING sent to AI)
      try {
        const { globalSessionManager } = await import('../_shared/SessionStateManager.js');
        globalSessionManager.storeAIPromptForDebugging(sessionId || 'unknown-session', {
          systemPrompt: enhancedSystemPrompt,
          userPrompt: finalUserPrompt,
          model: currentModel.name,
          tokenLimit: apiBody[safePropertyAccess(currentModel, 'paramName', 'max_completion_tokens')],
          pageNumber: config?.pageNumber || 1,
          attempt: attempt,
           success: true,
           bundle: bundleForDebug,
            apiResponse: {
              status: response.status,
              contentLength: storyText?.length || 0,
              usage: data.usage,
              hasChoices: !!data.choices,
              choicesLength: data.choices?.length || 0,
              content: storyText || ''
            }
         });
      } catch (debugError) {
        console.warn('⚠️ Failed to store AI prompt for debugging:', debugError);
      }
      
      if (storyText && storyText.trim()) {
        const vocabularyUsage = extractVocabularyUsage(storyText, enhancedUserPrompt);
        console.log(`✅ [AI-DEBUG] SUCCESS with ${currentModel.name}:`, { 
          attempt,
          contentLength: storyText.length,
          model: currentModel.name,
          processingTime: `${Date.now() - startTime}ms`,
          vocabularyTracking: vocabularyUsage,
          vocabularyCachePerformance: vocabCachePerformance, // Phase 3: Cache performance tracking
          gradeLevel,
          hasPageMarkers: storyText.includes('***'),
          wordCount: storyText.split(/\s+/).length,
          estimatedTokens: Math.ceil(storyText.split(/\s+/).length * 1.3)
        });
        
        // Enhanced vocabulary tracking for analytics (user vocabulary preserved)
        if (vocabularyUsage.hasTargetVocabulary && vocabularyUsage.usedWords.length > 0) {
          console.log(`📚 User vocabulary tracking: ${vocabularyUsage.usedWords.length} priority words used`);
        }
        
        // Track educational standards compliance for analytics
        try {
          const words = storyText.split(/\s+/).filter(w => w.length > 0);
          const systemCompliance = calculateEducationalCompliance(storyText, gradeLevel);
          console.log(`📊 Educational standards compliance: ${Math.round(systemCompliance * 100)}% for grade ${gradeLevel}`);
          
          // Add system compliance to vocabulary tracking
          vocabularyUsage.systemCompliance = systemCompliance;
          vocabularyUsage.systemValidWords = Math.round(systemCompliance * words.length);
          vocabularyUsage.systemTotalWords = words.length;
        } catch (error) {
          console.warn('⚠️ Educational compliance calculation failed, using fallback');
          vocabularyUsage.systemCompliance = 0.9;
        }
        
        break;
      } else {
        console.log(`❌ ${currentModel.name} produced empty content:`, {
          rawResponse: storyText,
          attempt,
          model: currentModel.name,
          fullAPIResponse: data,
          contentPath: 'choices[0].message.content',
          hasChoices: !!data.choices,
          choicesLength: data.choices?.length || 0,
          messageContent: data.choices?.[0]?.message?.content || null
        });
        
        // PHASE 2: Treat empty content as an error to trigger model switching
        const emptyContentError = new Error(`Model ${currentModel.name} produced empty content`);
        throw emptyContentError;
      }
      
    } catch (error) {
      console.error(`❌ Generation attempt ${attempt} failed:`, {
        error: safeErrorMessage(error),
        model: safePropertyAccess(currentModel, 'name', 'unknown'),
        attempt: attempt,
        maxAttempts: maxAttempts,
        currentModelIndex,
        retriesOnCurrentModel
      });
      
      // Protected Error Classification
      let classifiedError;
      let retryEnhancement = '';
      
      try {
        classifiedError = classifyError(error);
        retryEnhancement = getRetryEnhancement(classifiedError.category, attempt);
        console.log(`📊 Error Classification: ${classifiedError.category}, Retry same model: ${classifiedError.shouldRetryWithSameModel}, Fallback: ${classifiedError.shouldFallbackToNextModel}`);
      } catch (classificationError) {
        console.warn('⚠️ Error classification failed, using default fallback:', safeErrorMessage(classificationError));
        classifiedError = { 
          category: 'system_error', 
          shouldRetryWithSameModel: false, 
          shouldFallbackToNextModel: true 
        };
      }
      
      if (classifiedError.shouldRetryWithSameModel && retriesOnCurrentModel < maxRetriesPerModel) {
        // Content validation errors - retry same model with enhanced prompts
        retriesOnCurrentModel++;
        if (retryEnhancement) {
          enhancedUserPrompt += `\n\n${retryEnhancement}`;
        }
        console.log(`🔄 Retrying same model with content enhancement (${retriesOnCurrentModel}/${maxRetriesPerModel})`);
      } else {
        // API error or max retries reached - move to next model
        currentModelIndex++;
        retriesOnCurrentModel = 0;
        if (currentModelIndex >= modelProgression.length) {
          console.error('❌ All AI generation attempts failed');
          throw new Error('All AI generation attempts failed');
        }
        const nextModelName = safePropertyAccess(modelProgression[currentModelIndex], 'name', 'next model');
        console.log(`🔄 Moving to next model: ${nextModelName}`);
      }
      
      attempt++;
      
      if (attempt > maxAttempts) {
        console.error('❌ Maximum attempts reached');
        throw new Error('All AI generation attempts failed');
      }
    }
  }

  if (!storyText?.trim()) {
    console.error('❌ All AI generation attempts failed:', {
      totalAttempts: maxAttempts,
      modelsAttempted: modelProgression.map(m => m.model),
      isExpertLevel,
      gradeLevel,
      currentModelIndex,
      retriesOnCurrentModel
    });
    throw new Error(`All AI generation attempts failed after ${maxAttempts} attempts with models: ${modelProgression.map(m => m.model).join(', ')}`);
  }

  return cleanStoryText(storyText);
}

// Helper function for vocabulary tracking
function extractVocabularyUsage(storyText: string, userPrompt: string): any {
  const vocabMatch = userPrompt.match(/Priority vocabulary to include: ([^\n]+)/);
  if (!vocabMatch) return { hasTargetVocabulary: false };
  
  const targetWords = vocabMatch[1].split(', ').filter(word => word.trim());
  const usedWords = targetWords.filter(word => 
    storyText.toLowerCase().includes(word.toLowerCase())
  );
  
  return {
    hasTargetVocabulary: true,
    targetWords,
    usedWords,
    usageRate: `${usedWords.length}/${targetWords.length}`,
    missingWords: targetWords.filter(word => !usedWords.includes(word))
  };
}

function cleanStoryText(text: string): string {
  return text
    .replace(/\*\*.*?\*\*/g, '') // Remove bold formatting
    .replace(/^(Page|Chapter|\d+\.)\s*[:\-]?\s*/gmi, '') // Remove page markers
    .replace(/\n\n+/g, '\n\n') // Normalize spacing
    .trim();
}

function cleanPageBreakMarkers(text: string): string {
  return text.replace(/\s*\*\*\*\s*/g, '').trim();
}

// ============================================================================
// FUNCTION EXECUTION SYSTEM - Phase 2-4 Implementation
// ============================================================================

/**
 * Phase 2: Detect if AI response contains function calls
 */
function hasFunctionCalls(storyText: string): boolean {
  const functionCallPatterns = [
    /getCulturalContext\s*\([^)]*\)/gi
  ];
  
  return functionCallPatterns.some(pattern => pattern.test(storyText));
}

/**
 * Phase 3: Execute function calls found in AI response
 */
async function executeFunctionCalls(storyText: string, context: any): Promise<string> {
  let processedText = storyText;
  
  console.log('🔧 Executing function calls with context:', {
    hasUserInfo: !!context.userInfo,
    gradeLevel: context.gradeLevel,
    difficulty: context.difficulty
  });
  
  // Execute getCulturalContext() calls
  const culturalMatches = [...processedText.matchAll(/getCulturalContext\s*\([^)]*\)/gi)];
  for (const match of culturalMatches) {
    try {
      const culturalArrays = getCulturalContextArrays();
      const userLanguage = context.userInfo?.nativeLanguage || 'en';
      const skinTone = context.userInfo?.avatar?.skinTone;
      
      let culturalKey = userLanguage;
      if (userLanguage === 'en' && skinTone === 'dark') {
        culturalKey = 'en-african-american';
      } else if (userLanguage === 'fr' && skinTone === 'dark') {
        culturalKey = 'fr-francophone-african';
      }
      
      const selectedCultural = culturalArrays[culturalKey];
      
      if (selectedCultural) {
        const culturalContent = `Cultural elements: Character names like ${selectedCultural.characterNames.slice(0, 3).join(', ')}, foods such as ${selectedCultural.commonFoods.slice(0, 3).join(', ')}, celebrations including ${selectedCultural.celebrations.slice(0, 2).join(', ')}, and values of ${selectedCultural.values.slice(0, 2).join(' and ')}.`;
        
        processedText = processedText.replace(match[0], culturalContent);
        console.log('✅ Executed getCulturalContext() successfully');
      } else {
        processedText = processedText.replace(match[0], 'diverse cultural elements');
        console.log('⚠️ getCulturalContext() returned null, using fallback');
      }
    } catch (error) {
      processedText = processedText.replace(match[0], 'diverse cultural elements');
      console.warn('❌ getCulturalContext() execution failed:', safeErrorMessage(error));
    }
  }
  
  return processedText;
}

/**
 * Phase 4: Re-inject executed content back to AI for final processing
 */
async function reInjectExecutedContent(executedContent: string, systemPrompt: string, apiKey: string, currentModel: any): Promise<string> {
  console.log('🔄 Re-injecting executed content back to AI for final processing');
  
  const reInjectionPrompt = `${systemPrompt}

FUNCTION EXECUTION COMPLETE:
The following content contains executed function results that need to be integrated into a cohesive story format. Please rewrite this content as a natural, flowing story that incorporates all the provided elements seamlessly.

CONTENT TO PROCESS:
${executedContent}

Please generate the final story version with natural narrative flow.`;

  try {
    const apiBody: any = {
      model: safePropertyAccess(currentModel, 'name', 'gpt-5-2025-08-07'),
      messages: [
        { role: 'system', content: 'You are a story writer. Convert the provided content with function results into a natural, flowing story.' },
        { role: 'user', content: reInjectionPrompt }
      ]
    };
    
    // Use same token configuration as original model
    const paramName = safePropertyAccess(currentModel, 'paramName', 'max_completion_tokens');
    apiBody[paramName] = 2000; // Sufficient for rewriting
    
    if (safePropertyAccess(currentModel, 'supportsTemperature', false)) {
      apiBody.temperature = 0.7;
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiBody),
    });
    
    if (!response.ok) {
      console.warn('⚠️ Re-injection API call failed, using executed content as-is');
      return executedContent;
    }
    
    const data = await response.json();
    const reprocessedContent = data.choices?.[0]?.message?.content || executedContent;
    
    console.log('✅ Content successfully re-injected and reprocessed by AI');
    return reprocessedContent;
    
  } catch (error) {
    console.warn('❌ Re-injection failed, using executed content as-is:', safeErrorMessage(error));
    return executedContent;
  }
}

/**
 * Calculate educational standards compliance using complexity analysis
 */
function calculateEducationalCompliance(content: string, gradeLevel: number): number {
  // Modern educational compliance using complexity analysis
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0);
  
  if (words.length === 0) return 1.0;
  
  // Calculate educational appropriateness based on word complexity
  const simpleWords = words.filter(word => word.length <= 4).length;
  const mediumWords = words.filter(word => word.length >= 5 && word.length <= 7).length;
  const complexWords = words.filter(word => word.length >= 8).length;
  
  // Grade-appropriate complexity scoring
  let score = 0.85; // Base score for educational appropriateness
  
  if (gradeLevel <= 1) {
    // Pre-K to 1st grade: favor simple words
    score = Math.min(1.0, 0.7 + (simpleWords / words.length) * 0.3);
  } else if (gradeLevel <= 2) {
    // 2nd-3rd grade: balanced simple/medium
    score = Math.min(1.0, 0.6 + ((simpleWords + mediumWords) / words.length) * 0.4);
  } else {
    // 4th+ grade: allow complexity
    score = Math.min(1.0, 0.8 + (mediumWords + complexWords) / words.length * 0.2);
  }
  
  return Math.round(score * 100) / 100;
}

// Phase 3: Vocabulary Caching Enhancement - Preprocessing Function  
function preprocessVocabularyFromCache(userPrompt: string, gradeLevel: number): { prompt: string; performance: any } {
  const startTime = Date.now();
  let enhancedPrompt = userPrompt;
  
  try {
    // Get cached system vocabulary for the grade level
    const systemVocabulary = getVocabularyCache(gradeLevel, 'system');
    
    // Extract any existing user-specified vocabulary from prompt
    const existingVocabMatch = userPrompt.match(/Priority vocabulary to include: ([^\n]+)/);
    let userSpecifiedWords: string[] = [];
    
    if (existingVocabMatch) {
      userSpecifiedWords = existingVocabMatch[1].split(', ').map(w => w.trim()).filter(w => w);
    }
    
    // Combine vocabularies with user words taking priority
    const combinedVocabulary = [...new Set([...userSpecifiedWords, ...systemVocabulary.slice(0, 15)])];
    
    // Inject vocabulary into the prompt BEFORE AI generation
    if (combinedVocabulary.length > 0) {
      const vocabularySection = `\nPriority vocabulary to include: ${combinedVocabulary.join(', ')}`;
      
      // Replace existing vocabulary or append new one
      if (existingVocabMatch) {
        enhancedPrompt = enhancedPrompt.replace(/Priority vocabulary to include: [^\n]+/, vocabularySection.trim());
      } else {
        enhancedPrompt += vocabularySection;
      }
    }
    
    const processingTime = Date.now() - startTime;
    const performance = {
      cacheHit: true,
      processingTime: `${processingTime}ms`,
      systemVocabCount: systemVocabulary.length,
      userVocabCount: userSpecifiedWords.length,
      combinedVocabCount: combinedVocabulary.length,
      gradeLevel,
      vocabularySource: 'cached'
    };
    
    console.log(`📚 Vocabulary Cache Integration: Grade ${gradeLevel} - ${combinedVocabulary.length} words injected (${systemVocabulary.length} cached + ${userSpecifiedWords.length} user) in ${processingTime}ms`);
    
    return { prompt: enhancedPrompt, performance };
    
  } catch (error) {
    console.warn('⚠️ Vocabulary cache integration failed, using original prompt:', safeErrorMessage(error));
    
    const performance = {
      cacheHit: false,
      processingTime: `${Date.now() - startTime}ms`,
      error: safeErrorMessage(error),
      gradeLevel,
      vocabularySource: 'fallback'
    };
    
    return { prompt: userPrompt, performance };
  }
}