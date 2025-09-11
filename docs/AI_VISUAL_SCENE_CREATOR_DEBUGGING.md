# AI Visual Scene Creator Debugging Guide

## ⚠️ CRITICAL: COMPREHENSIVE DEBUGGING REFERENCE

This document provides complete debugging guidance for the enhanced AI story generation system with visual-first optimization, comprehensive validation, and cross-function request tracking.

---

## DEBUGGING SYSTEM OVERVIEW

### Request ID Correlation System
- **Purpose**: Track requests across all functions for complete debugging workflow
- **Implementation**: Unique request IDs generated and propagated through entire pipeline
- **Functions Involved**: `ai-visual-scene-creator`, `runware-generate-image`, `debug-prompt-history`

### Enhanced Logging Components
1. **OpenAI Prompt Debugging**: Complete system and user prompts with request correlation
2. **Validation Step Tracking**: Individual criterion scores and detailed analysis
3. **Previous Context Integration**: How previous page text influences current generation
4. **Runware Assembly Debugging**: Complete prompt building process
5. **Tier Fallback Tracking**: Error propagation between tiers

---

## DEBUGGING WORKFLOW

### Step 1: Identify Request ID
Every image generation request creates a unique request ID that flows through all functions:

```javascript
// Generated in runware-generate-image/index.ts
const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
```

### Step 2: Track Request Through Functions
Use the request ID to correlate logs across:
1. **ai-visual-scene-creator**: AI prompt construction and response
2. **runware-generate-image**: Orchestration and tier management  
3. **debug-prompt-history**: Historical tracking and analysis

### Step 3: Analyze Debug Output
Each function provides specific debugging information tied to the request ID.

---

## DEPRECATED TYPESCRIPT FUNCTIONS ⚠️

**CRITICAL: DO NOT DELETE UNTIL USER IS COMFORTABLE WITH NEW .JS FILES**

The following TypeScript edge functions are **DEPRECATED** and should not be edited:
- `ai-visual-scene-creator/index.ts` (ACTIVE BUT NEEDS JS MIGRATION)
- `runware-generate-image/index.ts` (DEPRECATED - DO NOT EDIT)
- `runware-simple-fallback/index.backup.ts` (BACKUP - DO NOT DELETE) 
- Plus 2 other deprecated functions (see [IMAGE_FUNCTIONS_DEPRECATION.md](IMAGE_FUNCTIONS_DEPRECATION.md))

---

## FUNCTION-SPECIFIC DEBUGGING

### AI Visual Scene Creator (`ai-visual-scene-creator/index.ts`)

#### Key Debug Logs to Look For:
```
📥 Incoming Request Structure: {requestId, method, bodyKeys, bodyTypes, storyTextLength, pageInfo}
📊 Dependency Verification Results: {cors, errorHandling, MultiStageEnhancementPipeline}
🔍 AI Visual Scene Creator: Starting Phase 3 Request Analysis
⚠️ [ERROR] AI Visual Scene Creator failed - returning error to Orchestrator
⏱️ ai-visual-scene-creator Performance: [time]ms (SUCCESS/FAILURE)
```

#### Enhanced Request Structure Analysis:
- **Request Method**: Should be POST
- **Body Keys**: Must include `storyText`, `userInfo`, `sessionId`, `pageNumber`, `avatarIdentity`, `previousPageText`
- **Body Types**: Verify all expected data types are present
- **Story Text Length**: Indicates content complexity
- **Page Info**: Shows current page and total pages context

#### Previous Context Integration Debugging:
```javascript
// Look for logs showing previousPageText processing
console.log("📚 Previous Context Analysis:", {
  hasPreviousText: !!previousPageText,
  previousTextLength: previousPageText?.length || 0,
  contextIntegrationAttempt: true
});
```

### Runware Generate Image (`runware-generate-image/index.ts`)

#### Tier System Debug Logs:
```
🔍 TIER SYSTEM DEBUG - Starting orchestrated tier progression
🧠 Starting Tier 1: AI-Enhanced High-Quality Generation
🔍 TIER 1 DEBUG - Calling ai-visual-scene-creator directly (clean architecture)
⚠️ Tier 1 error, falling back to Tier 2: [error message]
🎨 Starting Tier 2: Template-based Generation
⚠️ Tier 2 error, falling back to Tier 2.5: [error message]
🔧 Starting Tier 2.5: Nuclear Hardcoded Fallback
✅ Tier [X] succeeded
```

#### Enhanced Error Analysis:
```javascript
// Detailed error debugging for each tier
console.log("🔍 TIER [X] ERROR DEBUG - Full error:", {
  message: error.message,
  stack: error.stack.substring(0, 200) + "..."
});
```

#### Avatar Identity Mapping Debug:
```
🎯 AVATAR MAPPING - Original type: [type] → Mapped type: [type] (PHASE 2 FIX: proper null handling)
👤 Avatar Identity Mapped: [type]/[skin] - Cultural: [cultural]
```

### Debug Prompt History (`debug-prompt-history/index.ts`)

#### Session State Debugging:
```javascript
// Request ID correlation tracking
console.log("🔍 Debug: Request ID correlation for session:", {
  sessionId: sessionId,
  requestId: requestId, 
  correlatedRequests: correlatedRequestCount
});

// Prompt history analysis
console.log("📚 Retrieved prompt history:", {
  sessionId: sessionId,
  totalEntries: promptHistory.length,
  sessionExists: !!storyState,
  sessionInfo: sessionInfo
});
```

---

## ENHANCED VALIDATION DEBUGGING

### 5-Criteria Quality Scoring System
Each validation criterion is scored individually and logged:

```javascript
// Validation scoring debug output
console.log("📊 Enhanced Validation Analysis:", {
  requestId: requestId,
  primarySceneLength: primaryScene.length,
  qualityScores: {
    characterPresence: characterScore,      // 0-20 points
    settingDetails: settingScore,           // 0-20 points  
    visualComposition: compositionScore,    // 0-20 points
    actionableElements: elementsScore,      // 0-20 points
    narrativeCoherence: coherenceScore      // 0-20 points
  },
  totalScore: totalValidationScore,
  passThreshold: 60,
  validationResult: totalValidationScore >= 60 ? "PASS" : "FAIL"
});
```

### Previous Context Integration Scoring
```javascript
// Previous context analysis debug
console.log("📚 Previous Context Integration Analysis:", {
  requestId: requestId,
  hasPreviousContext: !!previousPageText,
  previousContextLength: previousPageText?.length || 0,
  contextReferencesFound: contextReferences.length,
  continuityScore: continuityScore,
  integrationQuality: integrationQuality
});
```

---

## COMMON DEBUGGING SCENARIOS

### Scenario 1: Tier 1 Consistently Failing
**Symptoms**: Always falls back to Tier 2 or 2.5
**Debug Steps**:
1. Check ai-visual-scene-creator error logs for specific failure reasons
2. Analyze validation scores to see which criteria are failing
3. Verify previous context integration is working properly
4. Check if OpenAI API is responding correctly

**Look For**:
```
❌ AI Visual Scene Creator failed - returning error to Orchestrator: {errorMessage, errorStack}
📊 Enhanced Validation Analysis: {qualityScores, totalScore, validationResult: "FAIL"}
```

### Scenario 2: Previous Context Not Being Used
**Symptoms**: Generated scenes don't reference previous pages
**Debug Steps**:
1. Verify `previousPageText` is being passed in request
2. Check system prompt includes previous context instructions
3. Analyze AI response for previous context integration
4. Review narrative coherence scoring

**Look For**:
```
📚 Previous Context Analysis: {hasPreviousText: false} // Should be true
🔍 AI Visual Scene Creator: Starting Phase 3 Request Analysis // Should include previous context
```

### Scenario 3: Request ID Correlation Issues
**Symptoms**: Cannot track requests across functions
**Debug Steps**:
1. Verify request ID generation in runware-generate-image
2. Check request ID propagation to ai-visual-scene-creator
3. Confirm debug-prompt-history receives request ID
4. Analyze cross-function correlation logs

**Look For**:
```
🔍 TIER SYSTEM DEBUG - Starting orchestrated tier progression {requestId: "req_..."}
📥 Incoming Request Structure: {requestId: "req_..."}  
🔍 Debug: Request ID correlation for session: {requestId: "req_..."}
```

### Scenario 4: Enhanced Validation Too Strict
**Symptoms**: High-quality content failing validation
**Debug Steps**:
1. Analyze individual criterion scores to identify bottlenecks
2. Check if 120-character minimum is appropriate for content
3. Review previous context integration requirements
4. Evaluate quality scoring algorithm accuracy

**Look For**:
```
📊 Enhanced Validation Analysis: {
  primarySceneLength: 150,  // Above minimum
  totalScore: 58,           // Just below 60 threshold
  validationResult: "FAIL"
}
```

---

## DEBUGGING TOOLS AND COMMANDS

### Using Edge Function Logs
Access Supabase edge function logs to view all debugging output:

```bash
# Filter logs by function and time range
supabase functions logs --function ai-visual-scene-creator --since 1h
supabase functions logs --function runware-generate-image --since 1h  
supabase functions logs --function debug-prompt-history --since 1h
```

### Using Debug Prompt History Endpoint
Query the debug endpoint for session-specific information:

```javascript
// GET request to debug endpoint
const debugResponse = await fetch(`/debug-prompt-history?sessionId=${sessionId}&limit=10`);
const debugData = await debugResponse.json();

console.log("Debug Analysis:", {
  promptHistory: debugData.promptHistory,
  sessionInfo: debugData.sessionInfo,
  totalEntries: debugData.totalEntries
});
```

### Request ID Correlation Query
Track a specific request across all functions:

```javascript
// Search logs for specific request ID
const requestId = "req_1756069071897_abc123";
// Look for this ID in ai-visual-scene-creator, runware-generate-image, and debug logs
```

---

## PERFORMANCE MONITORING

### Key Performance Indicators
- **Tier 1 Success Rate**: Target 70-80% (enhanced validation)
- **Previous Context Integration**: Target 95%+ when available  
- **Request ID Correlation**: Target 100% tracking success
- **Average Validation Score**: Target 70+ points
- **Response Time**: Target <10 seconds end-to-end

### Performance Debug Logs
```javascript
console.log("⏱️ Performance Metrics:", {
  requestId: requestId,
  tier1SuccessRate: tier1Successes / totalRequests,
  averageValidationScore: totalValidationScore / requestCount,
  averageResponseTime: totalResponseTime / requestCount,
  previousContextUsageRate: contextUsages / availableContexts
});
```

---

## TROUBLESHOOTING CHECKLIST

### Before Starting Debugging:
- [ ] Verify all edge functions are deployed and running
- [ ] Check Supabase logs are accessible
- [ ] Confirm request includes all required parameters
- [ ] Validate session state exists and is accessible

### During Debugging:
- [ ] Track request ID through entire pipeline
- [ ] Analyze each validation criterion individually  
- [ ] Verify previous context integration attempts
- [ ] Check tier fallback reasons and error messages
- [ ] Review OpenAI prompt construction and response

### After Issue Resolution:
- [ ] Verify fix doesn't break existing functionality
- [ ] Test with multiple scenarios and edge cases
- [ ] Update documentation if new patterns emerge
- [ ] Monitor performance impact of any changes

---

## EMERGENCY DEBUGGING

### System-Wide Failures
If the entire system is failing:
1. Check Supabase edge function status
2. Verify OpenAI API connectivity and quotas
3. Review recent code deployments
4. Check database connectivity for character consistency
5. Validate all required environment variables are set

### Partial Functionality Issues  
If some requests work but others fail:
1. Compare working vs failing request structures
2. Analyze validation score patterns
3. Check for specific content triggering failures
4. Review previous context integration success rates
5. Examine tier fallback patterns for insights

---

**Last Updated**: Post Visual-First Prompt Optimization Implementation  
**Status**: Comprehensive debugging system fully documented ✅