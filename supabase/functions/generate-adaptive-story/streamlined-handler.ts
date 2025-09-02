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
import { validateAndEnhanceGrammar } from '../_shared/grammarValidator.ts';
import { UnifiedValidator, type ValidationConfig } from '../_shared/unifiedValidator.ts';

// CORS headers - moved to top to fix ReferenceError
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StreamlinedBundle {
  storyContent: string;
  systemSettings: {
    gradeLevel: number;
    complianceTarget: number;
  };
}

interface StreamlinedConfig {
  sessionType: 'free' | 'premium' | 'repair';
  pageNumber: number;
  existingStory?: string;
  // Repair-specific configuration
  repairAttempt?: number;
  originalContent?: string[];
  repairReasons?: string[];
}

// Hair color mapping for English speakers only (moved from main handler)
function getHairColorForSkinTone(skinTone: string | undefined): string | null {
  if (!skinTone) return null;
  
  const hairColorMap: Record<string, string> = {
    'pale': 'red hair',
    'light': 'blonde hair', 
    'medium': 'brown hair',
    'olive': 'black hair',
    'dark': 'dark curly hair'
  };
  
  return hairColorMap[skinTone] || null;
}

export async function handleStreamlinedGeneration(requestBody: any) {
  const { bundle, config }: { bundle: StreamlinedBundle; config: StreamlinedConfig & { expertGradeLevel?: string; difficulty?: string } } = requestBody;
  
  console.log('🎯 STREAMLINED: Processing lean bundle');
  console.log('🔍 STREAMLINED: Config received:', {
    expertGradeLevel: config.expertGradeLevel,
    difficulty: config.difficulty,
    gradeLevel: bundle.systemSettings.gradeLevel,
    sessionType: config.sessionType,
    isRepairMode: config.sessionType === 'repair'
  });
  
  // Handle repair mode with special processing
  if (config.sessionType === 'repair') {
    console.log('🔧 STREAMLINED: REPAIR MODE detected:', {
      attempt: config.repairAttempt || 1,
      hasOriginalContent: !!(config.originalContent && config.originalContent.length > 0),
      hasRepairReasons: !!(config.repairReasons && config.repairReasons.length > 0)
    });
  }
  
  // PHASE 1: API Key Validation
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  console.log('🔍 API Key validation:', {
    hasApiKey: !!apiKey,
    keyPrefix: apiKey ? apiKey.substring(0, 7) + '...' : 'MISSING',
    timestamp: new Date().toISOString()
  });
  
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
      
    console.log(`🎯 STREAMLINED: Selected prompt config for ${expertGrade || effectiveDifficulty}:`, {
      hasSystemPrompt: !!promptConfig.systemPrompt,
      tokens: promptConfig.tokens,
      expectedPages: promptConfig.expectedPages
    });
    
    // Extract userInfo from already-resolved bundle
    let userInfo = {};
    try {
      const matches = bundle.storyContent.match(/Character Info: ({.*})/);
      if (matches) {
        userInfo = JSON.parse(matches[1]);
      }
    } catch (e) {
      console.warn('Could not extract userInfo from bundle, using defaults');
    }

    // Bundle already contains resolved natural language - use directly
    let finalSystemPrompt = promptConfig.systemPrompt;
    let finalUserPrompt = bundle.storyContent;
    
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
    
    // Add token buffer for repair operations (repairs need more tokens for context)
    const baseTokens = sharedGetTokensForGrade(effectiveGradeLevel);
    const repairTokenBuffer = config.sessionType === 'repair' ? Math.floor(baseTokens * 0.2) : 0;
    const finalTokenLimit = baseTokens + repairTokenBuffer;
    
    console.log(`🤖 [AI-DEBUG] STREAMLINED: Calling OpenAI for ${expertGrade || effectiveDifficulty}:`, {
      effectiveGradeLevel,
      expertGrade,
      effectiveDifficulty,
      systemPromptLength: aiPrompt.systemPrompt.length,
      userPromptLength: aiPrompt.userPrompt.length,
      expectedTokens: finalTokenLimit,
      isRepairMode: config.sessionType === 'repair',
      repairTokenBuffer
    });
    
    const storyText = await generateWithOpenAI(aiPrompt, effectiveGradeLevel, userInfo, finalTokenLimit);
    
    // PHASE 5: Bulk Story Processing - Apply validation, grammar, placeholders to ENTIRE story ONCE
    console.log('🔧 STREAMLINED: Starting bulk processing on complete story');
    
    // Compute validation level first
    const validationLevel = expertGrade ? 
      mapDifficultyToLevel(expertGrade) : 
      mapDifficultyToLevel(effectiveDifficulty as DifficultyLevel);
    
    // Step 1: Apply UnifiedValidator to entire story
    const validationConfig: ValidationConfig = {
      mode: config.sessionType === 'free' ? 'guest' : 'live',
      level: validationLevel,
      userLanguage: 'en'
    };
    
    const validationResult = UnifiedValidator.validateContent(storyText, validationConfig);
    console.log('✅ STREAMLINED: Story validation complete:', {
      decision: validationResult.decision,
      isValid: validationResult.isValid,
      tokenCount: validationResult.metrics.tokenCount
    });
    
    // Step 2: Apply grammar enhancement to entire story ONCE
    const grammarEnhanced = validateAndEnhanceGrammar(storyText, 'they');
    console.log('✅ STREAMLINED: Grammar enhancement complete');
    
    // Step 3: Apply placeholder resolution to entire story ONCE  
    const placeholderResolved = resolveAllPlaceholders(grammarEnhanced, { userInfo });
    console.log('✅ STREAMLINED: Placeholder resolution complete');
    
    // Step 4: THEN parse into pages using shared validation utilities
    const pages = sharedParseIntoPages(placeholderResolved, validationLevel);
    
    
    console.log('📊 [PAGE-DEBUG] Final processing result:', {
      pagesCount: pages.length,
      totalLength: placeholderResolved.length,
      pagePreview: pages.map(p => p.substring(0, 50) + '...')
    });
    
    // Calculate real vocabulary compliance using dynamic loader
    let vocabCompliance = 1.0; // Default fallback
    try {
      const { calculateVocabularyCompliance } = await import('../_shared/vocabularyLoader.ts');
      const complianceResult = await calculateVocabularyCompliance(placeholderResolved, effectiveGradeLevel);
      vocabCompliance = complianceResult.compliance;
    } catch (error) {
      console.warn('⚠️ [VOCAB-DEBUG] Could not calculate vocabulary compliance:', error);
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
      const errorMessage = error.message.toLowerCase();
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
      technicalError: error.message || 'Story generation failed'
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

async function generateWithOpenAI(prompt: { systemPrompt: string; userPrompt: string }, gradeLevel: number, userInfo?: any, customTokenLimit?: number): Promise<string> {
  const maxTokens = customTokenLimit || sharedGetTokensForGrade(gradeLevel);
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  
  // Add hair color mapping for English speakers
  let enhancedUserPrompt = prompt.userPrompt;
  if (userInfo?.avatar?.skinTone && userInfo?.nativeLanguage === 'en') {
    const hairColor = getHairColorForSkinTone(userInfo.avatar.skinTone);
    if (hairColor) {
      enhancedUserPrompt += `\nCharacter appearance: ${userInfo.name} has ${hairColor}.`;
    }
  }

  // Enhanced AI Generation with Expert Circuit Breaker and Legacy Model Fallback
  let storyText = '';
  let attempt = 1;
  
  // Expert detection for specialized handling
  const isExpertLevel = gradeLevel >= 6 && gradeLevel <= 10;
  const maxAttempts = isExpertLevel ? 6 : 4; // Increased attempts for legacy fallback
  const startTime = Date.now();

  // Progressive model chain with legacy fallback (GPT-4o models use different parameters)
  const modelProgression = isExpertLevel ? [
    { model: 'gpt-5-2025-08-07', description: 'flagship expert quality', paramName: 'max_completion_tokens' },
    { model: 'gpt-4.1-2025-04-14', description: 'intelligent fallback', paramName: 'max_completion_tokens' }, 
    { model: 'gpt-5-mini-2025-08-07', description: 'fast & reliable', paramName: 'max_completion_tokens' },
    { model: 'gpt-4.1-2025-04-14', description: 'retry intelligent', paramName: 'max_completion_tokens' },
    { model: 'gpt-4o', description: 'legacy fallback', paramName: 'max_tokens', supportsTemperature: true },
    { model: 'gpt-4o-mini', description: 'final legacy attempt', paramName: 'max_tokens', supportsTemperature: true }
  ] : [
    { model: 'gpt-4o-mini', description: 'fast & reliable', paramName: 'max_tokens', supportsTemperature: true }, 
    { model: 'gpt-4o-mini', description: 'fast & reliable', paramName: 'max_tokens', supportsTemperature: true },
    { model: 'gpt-4o', description: 'legacy fallback', paramName: 'max_tokens', supportsTemperature: true },
    { model: 'gpt-4o-mini', description: 'final legacy attempt', paramName: 'max_tokens', supportsTemperature: true }
  ];

  console.log(`🎯 Expert Circuit Breaker: ${isExpertLevel ? 'EXPERT' : 'REGULAR'} mode - ${maxAttempts} attempts available`);

  // Apply to BOTH attempts
  const baseInstructions = `
CRITICAL SUCCESS REQUIREMENTS:
- Generate a reliable engaging narrative suitable for children
- Use exactly three asterisks (***) on a line by themselves to separate story pages
- Include natural continuation hooks and smooth story flow  
- If target vocabulary provided, incorporate naturally throughout
- This is a never-ending story - always continue, never conclude

Example format:
PAGE TEXT
***
PAGE TEXT
***
Continue in this exact format, using *** to separate each story page.
`;

  while (attempt <= maxAttempts && !storyText) {
    try {
      const currentModel = modelProgression[attempt - 1];
      console.log(`🤖 AI Attempt ${attempt}/${maxAttempts} using ${currentModel.model} (${currentModel.description}):`, { 
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
      
      // API call with correct model parameters and enhanced logging
      const apiBody: any = {
        model: currentModel.model,
        messages: [
          { role: 'system', content: enhancedSystemPrompt },
          { role: 'user', content: finalUserPrompt }
        ]
      };
      
      // Use correct parameter based on model
      apiBody[currentModel.paramName] = maxTokens;
      
      // Add temperature for legacy models that support it
      if (currentModel.supportsTemperature) {
        apiBody.temperature = 0.8;
      }
      
      console.log(`🔍 API Request attempt ${attempt}:`, {
        model: currentModel.model,
        paramName: currentModel.paramName,
        tokenLimit: maxTokens,
        supportsTemperature: !!currentModel.supportsTemperature,
        promptLength: enhancedSystemPrompt.length + finalUserPrompt.length
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
          model: currentModel.model
        });
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
      
      if (storyText && storyText.trim()) {
        const vocabularyUsage = extractVocabularyUsage(storyText, enhancedUserPrompt);
        console.log(`✅ [AI-DEBUG] SUCCESS with ${currentModel.model}:`, { 
          attempt,
          contentLength: storyText.length,
          model: currentModel.model,
          processingTime: `${Date.now() - startTime}ms`,
          vocabularyTracking: vocabularyUsage,
          gradeLevel,
          hasPageMarkers: storyText.includes('***'),
          wordCount: storyText.split(/\s+/).length,
          estimatedTokens: Math.ceil(storyText.split(/\s+/).length * 1.3)
        });
        
        // Enhanced vocabulary tracking for analytics (both user and system vocabulary)
        if (vocabularyUsage.hasTargetVocabulary && vocabularyUsage.usedWords.length > 0) {
          console.log(`📚 User vocabulary tracking: ${vocabularyUsage.usedWords.length} priority words used`);
        }
        
        // Track system vocabulary compliance for analytics
        try {
          const { calculateVocabularyCompliance } = await import('../_shared/vocabularyLoader.ts');
          const systemCompliance = await calculateVocabularyCompliance(storyText, gradeLevel);
          console.log(`📊 System vocabulary compliance: ${Math.round(systemCompliance.compliance * 100)}% for grade ${gradeLevel}`);
          
          // Add system compliance to vocabulary tracking
          vocabularyUsage.systemCompliance = systemCompliance.compliance;
          vocabularyUsage.systemValidWords = systemCompliance.validWords;
          vocabularyUsage.systemTotalWords = systemCompliance.totalWords;
        } catch (error) {
          console.warn('⚠️ System vocabulary tracking failed:', error);
        }
        
        break;
      } else {
        console.log(`❌ ${currentModel.model} produced empty content:`, {
          rawResponse: storyText,
          attempt,
          model: currentModel.model
        });
        storyText = '';
      }
      
    } catch (error) {
      console.error(`❌ Attempt ${attempt} with ${modelProgression[attempt - 1].model} failed:`, {
        error: error.message,
        model: modelProgression[attempt - 1].model,
        attempt,
        maxAttempts,
        stack: error.stack
      });
      storyText = '';
    }
    
    attempt++;
  }

  if (!storyText?.trim()) {
    console.error('❌ All AI generation attempts failed:', {
      totalAttempts: maxAttempts,
      modelsAttempted: modelProgression.map(m => m.model),
      isExpertLevel,
      gradeLevel,
      processingTimeMs: Date.now() - startTime
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