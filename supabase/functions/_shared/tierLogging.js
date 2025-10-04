// tierLogging.js
// Unified logging: console + DB-backed tier tracing

/**
 * Low-level structured log to DB
 */
async function insertDebugRow(supabase, row) {
  if (!supabase) {
    console.warn("⚠️ Supabase client missing, log skipped:", row);
    return;
  }
  try {
    const { data, error } = await supabase.from('image_generation_debug').insert([row]);
    if (error) {
      console.error("❌ DB INSERT FAILED:", {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        row_sample: {
          session_id: row.session_id,
          tier: row.tier,
          user_id: row.user_id,
          has_image_url: !!row.image_url,
          has_prompts: !!(row.positive_prompt && row.negative_prompt)
        }
      });
    } else {
      console.log("✅ Successfully logged to image_generation_debug:", row.session_id);
    }
  } catch (err) {
    console.error("⚠️ Failed DB log insert (caught exception):", err.message, err);
  }
}

/**
 * Extract user ID from authorization header or return system fallback
 */
function extractUserId(authHeader) {
  if (!authHeader) return '00000000-0000-0000-0000-000000000001'; // System UUID
  
  try {
    // Extract JWT token from Bearer header
    const token = authHeader.replace('Bearer ', '');
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || '00000000-0000-0000-0000-000000000001';
  } catch {
    return '00000000-0000-0000-0000-000000000001'; // System UUID fallback
  }
}

/**
 * Generic tier attempt logger with proper user ID handling
 */
export async function logTierAttempt(
  supabase,
  sessionId,
  requestId,
  tier,
  status,
  context = {}
) {
  // Ensure we always have a valid user_id for RLS compliance
  const userId = context.userId || context.authHeader ? extractUserId(context.authHeader) : '00000000-0000-0000-0000-000000000001';
  
  const payload = {
    session_id: sessionId,
    user_id: userId, // Always provide a valid UUID
    page_number: context.pageNumber || 1,
    tier,
    status, // 'attempting', 'success', 'failure'
    edge_function: context.edgeFunction || 'runware-generate-image',
    positive_prompt: context.positivePrompt || null,
    negative_prompt: context.negativePrompt || null,
    api_response: context.apiResponse || null,
    image_url: context.imageUrl || null,
    success: status === 'success',
    failure_reason: context.error || null,
    processing_time_ms: context.processingTime || null,
    template_complexity: context.templateComplexity || null,
    context: {
      ...context,
      requestId,
      timestamp: new Date().toISOString(),
    },
  };

  await insertDebugRow(supabase, payload);

  // Console mirror
  console.log(
    `📊 [IMAGE_DEBUG] ${tier} ${status} | session=${sessionId} | req=${requestId}`,
    context
  );
}

export async function logTierSuccess(supabase, sessionId, requestId, tier, context = {}) {
  return logTierAttempt(supabase, sessionId, requestId, tier, 'success', context);
}

export async function logTierFailure(supabase, sessionId, requestId, tier, context = {}) {
  return logTierAttempt(supabase, sessionId, requestId, tier, 'failure', context);
}

/**
 * Compatibility wrappers for index.js
 * These push to DB as `attempting` logs and mirror to console
 */
export async function logTier1(msg, context = {}, supabase = null, sessionId = 'system', requestId = 'sys') {
  console.log(`🔴 [TIER1] ${msg}`, context);
  await logTierAttempt(supabase, sessionId, requestId, 'tier-1', 'attempting', {
    message: msg,
    ...context,
  });
}

export async function logTier2(msg, context = {}, supabase = null, sessionId = 'system', requestId = 'sys') {
  console.log(`🟢 [TIER2] ${msg}`, context);
  await logTierAttempt(supabase, sessionId, requestId, 'tier-2.5', 'attempting', {
    message: msg,
    ...context,
  });
}

/**
 * Error classification helpers
 */
export function getErrorType(errorMessage) {
  if (!errorMessage) return 'unknown';
  const msg = errorMessage.toLowerCase();
  if (msg.includes('timeout')) return 'timeout';
  if (msg.includes('character')) return 'character_consistency';
  if (msg.includes('enhanced') || msg.includes('phaseintegration')) return 'enhanced_data';
  if (msg.includes('api') || msg.includes('fetch')) return 'api_error';
  if (msg.includes('runware')) return 'runware_api';
  if (msg.includes('template')) return 'template_error';
  if (msg.includes('404')) return 'not_found';
  if (msg.includes('500')) return 'server_error';
  if (msg.includes('auth')) return 'authentication';
  return 'unknown';
}

/**
 * Cascade summary for debug dashboards
 */
export function getTierCascadeSummary(sessionId, tierLogs) {
  const cascade = {
    sessionId,
    totalAttempts: tierLogs.length,
    sequence: [],
    finalOutcome: null,
  };

  const byTier = {};
  for (const log of tierLogs) {
    (byTier[log.tier] ||= []).push(log);
  }

  for (const tier of ['tier-1', 'tier-2.5A', 'tier-2.5B', 'tier-2.5C', 'tier-2.5D']) {
    if (byTier[tier]) {
      const success = byTier[tier].some(l => l.status === 'success');
      const fail = byTier[tier].some(l => l.status === 'failure');
      cascade.sequence.push({ tier, success, fail, count: byTier[tier].length });
      if (success) cascade.finalOutcome = { tier, log: byTier[tier].find(l => l.status === 'success') };
    }
  }

  return cascade;
}