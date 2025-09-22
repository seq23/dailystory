// TIER ROUTING LOGGING SYSTEM (ESM-safe)

export async function logTierAttempt(supabase, sessionId, requestId, tier, status, context = {}) {
  if (!supabase) return; // graceful if no client

  try {
    const edgeFunction =
      context.edgeFunction ||
      (tier === "tier-1"
        ? "ai-visual-scene-creator"
        : tier === "tier-2.5A" || tier === "tier-2.5B"
        ? "runware-template-ab"
        : tier === "tier-2.5C" || tier === "tier-2.5D"
        ? "runware-template-cd"
        : "runware-generate-image");

    const enhancedContext = {
      ...context,
      tierAnalysis: analyzeTierContext(tier, status, context),
      requestId,
      timestamp: new Date().toISOString(),
    };

    if (tier === "tier-1" && context.modelUsed) {
      enhancedContext.modelUsed = context.modelUsed;
      enhancedContext.modelAttemptNumber = context.modelAttemptNumber;
      enhancedContext.totalModelsAvailable = context.totalModelsAvailable;
      enhancedContext.modelSuccessTracking = true;
    }

    await supabase.from("image_generation_debug").insert([
      {
        session_id: sessionId,
        user_id: context.userId || null,
        page_number: context.pageNumber || context.page_number || 1,
        tier,
        status, // 'attempting', 'success', 'failure'
        edge_function: edgeFunction,
        positive_prompt: context.positivePrompt || context.prompt || null,
        negative_prompt: context.negativePrompt || null,
        api_response: context.apiResponse || {
          tierRouting: true,
          requestId,
          modelUsed: context.modelUsed,
          modelAttemptNumber: context.modelAttemptNumber,
        },
        image_url: context.imageUrl || context.imageURL || null,
        success: status === "success",
        failure_reason: context.error || context.errorMessage || null,
        processing_time_ms: context.completionTime || context.processingTime || null,
        template_complexity: context.templateComplexity || null,
        context: enhancedContext,
      },
    ]);

    console.log(
      `📊 [IMAGE_DEBUG] ${tier} ${status} logged for ${sessionId} (${edgeFunction})${
        context.modelUsed ? ` [Model: ${context.modelUsed}]` : ""
      }`
    );
  } catch (error) {
    console.warn(`⚠️ Failed to log image generation debug:`, error?.message || error);
  }
}

export async function logTierSuccess(supabase, sessionId, requestId, tier, _status, context = {}) {
  return logTierAttempt(supabase, sessionId, requestId, tier, "success", context);
}

export async function logTierFailure(supabase, sessionId, requestId, tier, _status, context = {}) {
  return logTierAttempt(supabase, sessionId, requestId, tier, "failure", context);
}

export function getErrorType(errorMessage) {
  if (!errorMessage) return "unknown";
  const m = String(errorMessage).toLowerCase();
  if (m.includes("timeout")) return "timeout";
  if (m.includes("character") || m.includes("consistency")) return "character_consistency";
  if (m.includes("enhanced") || m.includes("phaseintegration")) return "enhanced_data";
  if (m.includes("api") || m.includes("fetch")) return "api_error";
  if (m.includes("runware")) return "runware_api";
  if (m.includes("template")) return "template_error";
  if (m.includes("404")) return "not_found";
  if (m.includes("500")) return "server_error";
  if (m.includes("auth")) return "authentication";
  return "unknown";
}

function analyzeTierContext(tier, status, context) {
  const analysis = { tierLevel: tier, statusType: status, timestamp: new Date().toISOString() };

  if (tier === "tier-1") {
    analysis.description = "Runware Premium API direct call";
    analysis.capabilities = ["highest_quality", "character_consistency", "enhanced_prompts"];
    if (status === "failure") {
      analysis.commonFailureReasons = [
        "API timeout or rate limiting",
        "Character consistency requirements not met",
        "Enhanced story data processing failure",
        "Runware service unavailable",
      ];
      analysis.escalationPath = "tier-2.5A (Template AB)";
    }
  } else if (tier === "tier-2.5A") {
    analysis.description = "Template AB with character consistency retry (Premium Features)";
    analysis.capabilities = ["template_based", "avatar_identity", "character_consistency", "premium_features"];
    analysis.templateType = "runware-template-ab";
    analysis.templateComplexity = context.templateComplexity || "A";
    if (status === "failure") {
      analysis.commonFailureReasons = [
        "Template processing error",
        "Character consistency still failing",
        "Avatar identity data insufficient",
        "Template AB service issues",
      ];
      analysis.escalationPath = "tier-2.5B (Template AB - Basic Features)";
    }
  } else if (tier === "tier-2.5B") {
    analysis.description = "Template AB with basic features (Reduced Enhancement)";
    analysis.capabilities = ["template_based", "basic_avatar", "reduced_enhancements"];
    analysis.templateType = "runware-template-ab";
    analysis.templateComplexity = context.templateComplexity || "B";
    if (status === "failure") {
      analysis.commonFailureReasons = [
        "Basic template processing error",
        "Reduced enhancement pipeline failed",
        "Template AB service degraded",
        "Infrastructure issues",
      ];
      analysis.escalationPath = "tier-2.5C (Template CD - Nuclear Hardcoded)";
    }
  } else if (tier === "tier-2.5C") {
    analysis.description = "Template CD with nuclear independence (Hardcoded Nuclear)";
    analysis.capabilities = ["nuclear_independence", "hardcoded_templates", "fallback_stable", "nuclear_frameworks"];
    analysis.templateType = "runware-template-cd";
    analysis.templateComplexity = context.templateComplexity || "C";
    analysis.nuclearMode = true;
    if (status === "success") {
      analysis.note = 'This tier uses hardcoded templates which may cause issues like "two birds" - check template content';
      analysis.templateWarning = "Template CD bypasses character consistency for stability";
    }
    if (status === "failure") {
      analysis.commonFailureReasons = [
        "Nuclear template processing failed",
        "Hardcoded framework errors",
        "Template CD service issues",
        "Infrastructure problems",
      ];
      analysis.escalationPath = "tier-2.5D (Template CD - Ultimate Emergency)";
    }
  } else if (tier === "tier-2.5D") {
    analysis.description = "Template CD with ultimate emergency (Minimal Processing)";
    analysis.capabilities = ["ultimate_emergency", "minimal_processing", "maximum_reliability", "emergency_fallback"];
    analysis.templateType = "runware-template-cd";
    analysis.templateComplexity = context.templateComplexity || "D";
    analysis.ultimateEmergency = true;
    if (status === "success") {
      analysis.note = "Ultimate emergency tier succeeded - investigate why earlier tiers failed";
      analysis.templateWarning = "Minimal processing used - may lack advanced features";
    }
    if (status === "failure") {
      analysis.criticalIssue = "All Runware tiers failed - this should be extremely rare";
      analysis.commonFailureReasons = [
        "Complete Runware service outage",
        "Fundamental system configuration issues",
        "Database or infrastructure complete failure",
      ];
      analysis.escalationPath = "tier-4 (SVG Fallback - Last Resort)";
    }
  }

  return analysis;
}

export function getTierCascadeSummary(sessionId, tierLogs) {
  const cascade = { sessionId, totalAttempts: tierLogs.length, tierSequence: [], finalOutcome: null, issueAnalysis: [] };
  const groups = {};
  for (const log of tierLogs) {
    const t = log.tier;
    if (!groups[t]) groups[t] = [];
    groups[t].push(log);
  }
  for (const t of ["tier-1", "tier-2.5A", "tier-2.5B", "tier-2.5C", "tier-2.5D"]) {
    if (groups[t]) {
      const attempts = groups[t].filter((l) => l.status === "attempt");
      const successes = groups[t].filter((l) => l.status === "success");
      const failures = groups[t].filter((l) => l.status === "failure");
      cascade.tierSequence.push({
        tier: t,
        attempted: attempts.length > 0,
        succeeded: successes.length > 0,
        failed: failures.length > 0,
        attempts: attempts.length,
        context: attempts[0]?.context,
      });
      if (successes.length > 0) cascade.finalOutcome = { tier: t, success: true, result: successes[0].context };
    }
  }
  if (groups["tier-1"] && groups["tier-1"].some((l) => l.status === "failure")) {
    const f = groups["tier-1"].find((l) => l.status === "failure");
    cascade.issueAnalysis.push({
      tier: "tier-1",
      issue: "Tier 1 failed",
      errorType: f?.context?.errorType,
      escalationReason: f?.context?.escalationReason,
    });
  }
  if (cascade.finalOutcome?.tier === "tier-2.5C") {
    cascade.issueAnalysis.push({
      tier: "tier-2.5C",
      issue: "Used Template CD (nuclear independence)",
      warning: 'Check for "two birds" or hardcoded template issues',
      recommendation: "Investigate why Tier 1 and 2.5A failed",
    });
  }
  return cascade;
}