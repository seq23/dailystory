# Direct Mode Implementation Guide

## Overview

Direct Mode is a nuclear independent image generation pathway that provides robust fallback functionality when the main orchestrator fails during Force Tier 1 operations. It ensures reliable image generation without external dependencies.

## Architecture

### Technical Location
- **Function**: `ai-visual-scene-creator` edge function
- **Trigger**: `directMode: true` flag in request payload
- **Caller**: `runware-generate-image` when orchestrator enhancement fails
- **Independence**: No orchestrator, PhaseIntegrationOrchestrator, or external service dependencies

### Workflow Comparison

#### Standard Tier 1 Path
1. `runware-generate-image` receives request
2. Calls PhaseIntegrationOrchestrator for enhancement
3. Enhanced prompts sent to `ai-visual-scene-creator`
4. Character consistency and scene analysis
5. Image generation via Runware API

#### Direct Mode Path  
1. `runware-generate-image` orchestrator enhancement fails
2. Direct call to `ai-visual-scene-creator` with `directMode: true`
3. Generate `primaryScene` via OpenAI API
4. Call `runware-template-cd` internally with generated scene data
5. Return real `imageURL` with `tier: 'DIRECT_MODE'` identifier

#### Scene-Only Mode Path
1. Call `ai-visual-scene-creator` without `directMode` flag
2. Generate `primaryScene` via OpenAI API  
3. Return only scene data with `tier: 'TIER_1_SCENE_ONLY'`
4. No `imageURL` returned (intended for scene testing)

## Implementation Details

### Trigger Conditions
Direct Mode is triggered when:
- `forceTier === 'COMPLETE_TIER_1'` is specified (Force Tier 1 button)
- PhaseIntegrationOrchestrator enhancement fails or times out
- API boot failures prevent normal orchestrator flow

### Request Format

**Direct Mode Request**:
```javascript
const directModeRequest = {
  storyText: "Story content for scene generation", // or pageText
  userInfo: {
    favoriteColor: "blue",
    avatar: { skinTone: "medium", hairColor: "brown" }
  },
  sessionId: "session-abc123",
  pageNumber: 1,
  directMode: true  // Triggers Direct Mode with real image generation
};
```

**Scene-Only Request**:
```javascript
const sceneOnlyRequest = {
  storyText: "Story content for scene generation",
  userInfo: { /* user preferences */ },
  sessionId: "session-abc123"
  // No directMode flag = scene-only response
};
```

### Response Format

**Direct Mode Success Response**:
```javascript
{
  success: true,
  imageURL: "https://im.runware.ai/image/...", // Real image URL
  provider: "runware-template-cd",
  tier: "DIRECT_MODE",
  primaryScene: "Generated visual scene description...",
  enhancedData: {
    realAIGenerated: true,
    openaiModel: "gpt-4o-mini",
    directMode: true
  },
  aiSchema: { /* structured scene data */ },
  requestId: "abc123",
  timestamp: "2025-09-27T..."
}
```

**Scene-Only Success Response**:
```javascript
{
  success: true,
  tier: "TIER_1_SCENE_ONLY",
  primaryScene: "Generated visual scene description...",
  enhancedData: {
    realAIGenerated: true,
    openaiModel: "gpt-4o-mini"
  },
  aiSchema: { /* structured scene data */ },
  requestId: "abc123",
  timestamp: "2025-09-27T..."
  // Note: No imageURL field
}
```

**Direct Mode Failure Response**:
```javascript
{
  success: false,
  error: "Direct Mode image generation failed: Template CD failed",
  nextAction: "ESCALATE_TIER_2_5C",
  primaryScene: "Generated scene (if available)",
  enhancedData: { /* available data */ }
}
```

## Usage Scenarios

### Frontend Direct Mode (Orchestrator Unhealthy)
When the orchestrator is unavailable, frontend can call Direct Mode:
```javascript
const response = await supabase.functions.invoke('ai-visual-scene-creator', {
  body: { 
    directMode: true, 
    storyText: "A young girl explores a magical garden...", 
    userInfo: { favoriteColor: "purple" },
    sessionId: "session_123",
    pageNumber: 1 
  }
});
// Returns real imageURL via internal runware-template-cd call
```

### Orchestrator Fallback Path  
When Tier 1 enhancement fails, orchestrator triggers Direct Mode:
1. `runware-generate-image` attempts PhaseIntegrationOrchestrator
2. On failure, calls `ai-visual-scene-creator` with `directMode: true`
3. Direct Mode generates scene and calls `runware-template-cd` internally
4. Returns real `imageURL` to orchestrator
5. If Direct Mode fails, orchestrator has final fallback to `runware-template-cd`

### Scene Testing Mode
For testing scene generation without image creation:
```javascript
const response = await supabase.functions.invoke('ai-visual-scene-creator', {
  body: { 
    storyText: "A story for scene testing...",
    userInfo: { /* preferences */ },
    sessionId: "test_session"
    // No directMode = scene-only response
  }
});
// Returns: primaryScene, enhancedData, aiSchema (no imageURL)
```

## Performance Characteristics

### Response Time Targets
- **Boot Time**: ~300ms (faster than orchestrator path)
- **Processing Time**: 1.8-2.5 seconds average
- **Success Rate**: 95%+ (nuclear independence advantage)

### Reliability Benefits
- **No External Dependencies**: Independent of orchestrator service health
- **Simplified Error Surface**: Fewer integration points reduce failure modes
- **Direct API Access**: Reduced latency through direct Runware integration
- **Self-Contained Logic**: All processing logic contained within single function

## Debugging Direct Mode

### Log Identification
Look for these log prefixes in `ai-visual-scene-creator` function logs:
```
DIRECT_MODE: Processing request with directMode=true
DIRECT_MODE: Avatar identity validation complete
DIRECT_MODE: Cultural intelligence analysis complete  
DIRECT_MODE: Character consistency seed generated
DIRECT_MODE: Comprehensive prompt built
DIRECT_MODE: Image generation successful
```

### Success Indicators
- Response includes `tier: 'DIRECT_MODE'`
- ImageTierTester shows "Direct Mode Success" badge (blue)
- Full prompt visibility with "Built by Direct Mode" indicator
- Character counts and cultural intelligence metadata displayed

### Failure Diagnosis
Common Direct Mode failures and solutions:

#### API Key Issues
**Symptoms**: Authentication errors, API key not found
**Debug**: Check OPENAI_API_KEY and RUNWARE_API_KEY in Supabase secrets
**Solution**: Verify API keys are properly configured

#### Template Generation Failures
**Symptoms**: Empty or malformed prompts
**Debug**: Check avatar identity validation and cultural intelligence logs
**Solution**: Verify avatar identity object structure and session ID format

#### Image Generation Timeouts
**Symptoms**: Runware API timeouts, connection issues
**Debug**: Monitor Runware API status and network connectivity
**Solution**: Check Runware service health and API limits

### Request Correlation
Use request ID correlation to trace Direct Mode execution:
```
Search logs for: [REQ-{requestId}]
Look for: DIRECT_MODE prefix in ai-visual-scene-creator logs
Follow: Request flow from trigger through completion
```

## Frontend Integration

### ImageTierTester Display
Direct Mode results are displayed with:
- **Badge**: "Direct Mode Success" (blue color)
- **Prompt Source**: "Built by Direct Mode"
- **Full Prompts**: `positivePrompt`, `negativePrompt` with character counts
- **Metadata**: Processing time, cultural intelligence level, character consistency status

### Error Display
Direct Mode failures show:
- **Badge**: "Tier 1 Failed" (red color)  
- **Error Context**: Specific failure reason and debugging information
- **No Escalation**: Clear indication that Force Tier 1 does not escalate

## Testing Direct Mode

### Manual Testing Steps
1. Navigate to `/prompt-testing?debug=1`
2. Click "Force Tier 1" button
3. Use prompt that typically works (e.g., "A young girl reading a book")
4. Observe result:
   - Success: "Tier 1 Success" OR "Direct Mode Success"
   - Failure: "Tier 1 Failed" with clear error message

### Expected Behaviors
- **Scene-Only Mode**: No `directMode` → Returns `primaryScene` only (no `imageURL`)
- **Direct Mode Success**: `directMode: true` → Returns real `imageURL` and `tier: "DIRECT_MODE"`
- **Direct Mode Fallback**: If orchestrator calls Direct Mode → Real image generation via template-cd
- **No Placeholder Images**: All `imageURL` responses are real, validated URLs

### Performance Testing
Monitor Direct Mode performance characteristics:
- Response times should be 1.8-2.5 seconds average
- Success rate should exceed 95%
- Prompt quality should match orchestrator-enhanced results
- Character consistency should be maintained across sessions

## HTTP Fallback Implementation (September 27, 2025)

### Enhanced Reliability
Direct Mode now includes HTTP fallback functionality when the Supabase client is unavailable:

**Primary Path**: Uses supabase.functions.invoke() when client is available
**Fallback Path**: Direct HTTP calls to edge functions when client is null/undefined

### HTTP Fallback Logic
```typescript
if (supabase) {
  // Use normal supabase client
  templateResponse = await supabase.functions.invoke('runware-template-cd', { body });
} else {
  // HTTP fallback using service role key
  const httpResponse = await fetch(`${SUPABASE_URL}/functions/v1/runware-template-cd`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
}
```

### Requirements
- **SUPABASE_SERVICE_ROLE_KEY** must be configured in edge function secrets
- HTTP fallback provides same functionality as supabase client calls
- Maintains error handling and response validation
- Logs fallback usage for monitoring

## Maintenance & Monitoring

### Health Monitoring
- Monitor Direct Mode success rates via edge function logs
- Track response times and identify performance regressions
- Monitor HTTP fallback usage frequency
- Verify character consistency accuracy across different avatar types
- Validate cultural intelligence representation quality

### Capacity Planning
- Direct Mode reduces load on PhaseIntegrationOrchestrator
- HTTP fallback provides additional reliability layer
- Self-contained processing scales independently
- Consider Direct Mode for emergency orchestrator bypass scenarios
- Monitor resource usage patterns for optimization opportunities

## Security Considerations

### Input Validation
- Direct Mode performs full input validation independently
- Avatar identity objects validated for required fields
- Session IDs validated for proper format and security
- Story text sanitized for safety and appropriateness

### Content Safety
- COPPA compliance maintained through integrated negative prompts
- Character age validation enforced at prompt building level
- Cultural sensitivity preserved through built-in intelligence
- Safety prompts automatically included in all generations

---

**Implementation Status**: ✅ OPERATIONAL  
**Last Updated**: September 23, 2025  
**Next Review**: October 1, 2025