// TIER ROUTING LOGGING SYSTEM
// Comprehensive tracking of image generation tier attempts, failures, and successes

/**
 * Log tier attempt with detailed context for debugging
 * Enhanced with model-specific logging for Tier 1 
 */
export async function logTierAttempt(supabase, sessionId, requestId, tier, status, context = {}) {
  if (!supabase) return; // Graceful fallback if no Supabase client
  
  try {
    // Extract edge function name from context or determine from tier
    const edgeFunction = context.edgeFunction || 
      (tier === 'tier-1' ? 'ai-visual-scene-creator' :
       tier === 'tier-2.5A' || tier === 'tier-2.5B' ? 'runware-template-ab' :
       tier === 'tier-2.5C' || tier === 'tier-2.5D' ? 'runware-template-cd' : 
       'runware-generate-image');

    // Enhanced context for model tracking in Tier 1
    const enhancedContext = {
      ...context,
      tierAnalysis: analyzeTierContext(tier, status, context),
      requestId,
      timestamp: new Date().toISOString()
    };

    // Add model-specific tracking for Tier 1
    if (tier === 'tier-1' && context.modelUsed) {
      enhancedContext.modelUsed = context.modelUsed;
      enhancedContext.modelAttemptNumber = context.modelAttemptNumber;
      enhancedContext.totalModelsAvailable = context.totalModelsAvailable;
      enhancedContext.modelSuccessTracking = true;
    }
    
    // Log to dedicated image_generation_debug table
    await supabase
      .from('image_generation_debug')
      .insert([{
        session_id: sessionId,
        user_id: context.userId || null,
        page_number: context.pageNumber || context.page_number || 1,
        tier: tier,
        status: status, // 'attempting', 'success', 'failure'
        edge_function: edgeFunction,
        positive_prompt: context.positivePrompt || context.prompt || null,
        negative_prompt: context.negativePrompt || null,
        api_response: context.apiResponse || { 
          tierRouting: true, 
          requestId,
          modelUsed: context.modelUsed,
          modelAttemptNumber: context.modelAttemptNumber
        },
        image_url: context.imageUrl || context.imageURL || null,
        success: status === 'success',
        failure_reason: context.error || context.errorMessage || null,
        processing_time_ms: context.completionTime || context.processingTime || null,
        template_complexity: context.templateComplexity || null,
        context: enhancedContext
      }]);
      
    console.log(`📊 [IMAGE_DEBUG] ${tier} ${status} logged for ${sessionId} (${edgeFunction})${context.modelUsed ? ` [Model: ${context.modelUsed}]` : ''}`);
  } catch (error) {
    console.warn(`⚠️ Failed to log image generation debug:`, error.message);
  }
}

/**
 * Analyze error type for better debugging
 */
export function getErrorType(errorMessage) {
  if (!errorMessage) return 'unknown';
  
  const message = errorMessage.toLowerCase();
  
  if (message.includes('timeout')) return 'timeout';
  if (message.includes('character') || message.includes('consistency')) return 'character_consistency';
  if (message.includes('enhanced') || message.includes('phaseintegration')) return 'enhanced_data';
  if (message.includes('api') || message.includes('fetch')) return 'api_error';
  if (message.includes('runware')) return 'runware_api';
  if (message.includes('template')) return 'template_error';
  if (message.includes('404')) return 'not_found';
  if (message.includes('500')) return 'server_error';
  if (message.includes('auth')) return 'authentication';
  
  return 'unknown';
}

/**
 * Log tier success with detailed context for debugging
 */
export async function logTierSuccess(supabase, sessionId, requestId, tier, status, context = {}) {
  return await logTierAttempt(supabase, sessionId, requestId, tier, 'success', context);
}

/**
 * Log tier failure with detailed context for debugging
 */
export async function logTierFailure(supabase, sessionId, requestId, tier, status, context = {}) {
  return await logTierAttempt(supabase, sessionId, requestId, tier, 'failure', context);
}

/**
 * Provide contextual analysis of tier routing decisions
 */
function analyzeTierContext(tier, status, context) {
  const analysis = {
    tierLevel: tier,
    statusType: status,
    timestamp: new Date().toISOString()
  };
  
  if (tier === 'tier-1') {
    analysis.description = 'Runware Premium API direct call';
    analysis.capabilities = ['highest_quality', 'character_consistency', 'enhanced_prompts'];
    
    if (status === 'failure') {
      analysis.commonFailureReasons = [
        'API timeout or rate limiting',
        'Character consistency requirements not met', 
        'Enhanced story data processing failure',
        'Runware service unavailable'
      ];
      analysis.escalationPath = 'tier-2.5A (Template AB)';
    }
  } else if (tier === 'tier-2.5A') {
    analysis.description = 'Template AB with character consistency retry';
    analysis.capabilities = ['template_based', 'avatar_identity', 'character_consistency'];
    analysis.templateType = 'runware-template-ab';
    analysis.templateComplexity = context.templateComplexity;
    
    if (status === 'failure') {
      analysis.commonFailureReasons = [
        'Template processing error',
        'Character consistency still failing',
        'Avatar identity data insufficient',
        'Template AB service issues'
      ];
      analysis.escalationPath = 'tier-2.5C (Template CD - Nuclear Independence)';
    }
  } else if (tier === 'tier-2.5C') {
    analysis.description = 'Template CD with nuclear independence (hardcoded templates)';
    analysis.capabilities = ['nuclear_independence', 'hardcoded_templates', 'fallback_stable'];
    analysis.templateType = 'runware-template-cd';
    analysis.nuclearMode = true;
    
    if (status === 'success') {
      analysis.note = 'This tier uses hardcoded templates which may cause issues like "two birds" - check template content';
      analysis.templateWarning = 'Template CD bypasses character consistency for stability';
    }
    
    if (status === 'failure') {
      analysis.criticalIssue = 'All tiers failed - this should be very rare';
      analysis.commonFailureReasons = [
        'Template CD service completely down',
        'Fundamental configuration issues',
        'Database or infrastructure problems'
      ];
    }
  }
  
  return analysis;
}

/**
 * Get tier cascade summary for debugging 
 */
export function getTierCascadeSummary(sessionId, tierLogs) {
  const cascade = {
    sessionId,
    totalAttempts: tierLogs.length,
    tierSequence: [],
    finalOutcome: null,
    issueAnalysis: []
  };
  
  // Group logs by tier and status
  const tierGroups = {};
  tierLogs.forEach(log => {
    const tier = log.tier;
    if (!tierGroups[tier]) tierGroups[tier] = [];
    tierGroups[tier].push(log);
  });
  
  // Build sequence
  ['tier-1', 'tier-2.5A', 'tier-2.5C'].forEach(tier => {
    if (tierGroups[tier]) {
      const attempts = tierGroups[tier].filter(log => log.status === 'attempt');
      const successes = tierGroups[tier].filter(log => log.status === 'success'); 
      const failures = tierGroups[tier].filter(log => log.status === 'failure');
      
      cascade.tierSequence.push({
        tier,
        attempted: attempts.length > 0,
        succeeded: successes.length > 0,
        failed: failures.length > 0,
        attempts: attempts.length,
        context: attempts[0]?.context
      });
      
      if (successes.length > 0) {
        cascade.finalOutcome = {
          tier,
          success: true,
          result: successes[0].context
        };
      }
    }
  });
  
  // Analyze issues
  if (tierGroups['tier-1'] && tierGroups['tier-1'].some(log => log.status === 'failure')) {
    const tier1Failure = tierGroups['tier-1'].find(log => log.status === 'failure');
    cascade.issueAnalysis.push({
      tier: 'tier-1',
      issue: 'Tier 1 failed',
      errorType: tier1Failure?.context?.errorType,
      escalationReason: tier1Failure?.context?.escalationReason
    });
  }
  
  if (cascade.finalOutcome?.tier === 'tier-2.5C') {
    cascade.issueAnalysis.push({
      tier: 'tier-2.5C',
      issue: 'Used Template CD (nuclear independence)',
      warning: 'Check for "two birds" or hardcoded template issues',
      recommendation: 'Investigate why Tier 1 and 2.5A failed'
    });
  }
  
  return cascade;
}