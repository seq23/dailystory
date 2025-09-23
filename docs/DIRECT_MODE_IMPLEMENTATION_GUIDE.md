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
3. Self-contained avatar processing and prompt building
4. Character consistency and cultural intelligence (internal)
5. Direct image generation via runware-template-cd
6. Returns with `tier: 'DIRECT_MODE'` identifier

## Implementation Details

### Trigger Conditions
Direct Mode is triggered when:
- `forceTier === 'COMPLETE_TIER_1'` is specified (Force Tier 1 button)
- PhaseIntegrationOrchestrator enhancement fails or times out
- API boot failures prevent normal orchestrator flow

### Request Format
```javascript
const directModeRequest = {
  pageText: "Story text for image generation",
  avatarIdentity: {
    name: "Character name",
    age: 12,
    userName: "user123"
  },
  sessionId: "session-abc123",
  directMode: true  // This flag triggers Direct Mode
};
```

### Response Format
```javascript
// Success Response
{
  success: true,
  tier: 'DIRECT_MODE',
  imageURL: 'https://...',
  positivePrompt: 'Comprehensive prompt built by Direct Mode...',
  negativePrompt: 'Quality and safety prompts...',
  metadata: {
    promptSource: 'DIRECT_MODE',
    characterConsistency: true,
    culturalIntelligence: 'FULL',
    enhancementCount: 0,
    processingTime: 2.3
  }
}

// Failure Response  
{
  success: false,
  tier: 'DIRECT_MODE_FAILED',
  error: 'Specific failure reason',
  templateStructure: 'TIER_1_FAILED'
}
```

## Feature Parity

### Character Consistency
- **Avatar Identity Processing**: Full avatar identity validation and processing
- **Session-Based Caching**: Character appearance cached across pages
- **Seed Generation**: Consistent character seeds for visual continuity
- **Database Integration**: Character data stored and retrieved properly

### Cultural Intelligence
- **Skin Tone Variations**: Complete cultural heritage mapping
- **Hair Descriptions**: 73-variation hair mapping system
- **Cultural Context**: Respectful representation across ethnicities
- **Feature Enhancement**: Detailed physical characteristic descriptions

### Prompt Building
- **Comprehensive Templates**: Full template system with cultural intelligence
- **Quality Prompts**: Professional photography and artistic style prompts
- **Safety Prompts**: COPPA-compliant negative prompts for child safety
- **Brand Framework**: Consistent style framework integration

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
- **Normal Case**: Orchestrator succeeds → "Tier 1 Success"
- **Fallback Case**: Orchestrator fails → Direct Mode succeeds → "Direct Mode Success"  
- **Complete Failure**: Both fail → "Tier 1 Failed"
- **No Escalation**: Never shows Tier 2.5A content during Force Tier 1

### Performance Testing
Monitor Direct Mode performance characteristics:
- Response times should be 1.8-2.5 seconds average
- Success rate should exceed 95%
- Prompt quality should match orchestrator-enhanced results
- Character consistency should be maintained across sessions

## Maintenance & Monitoring

### Health Monitoring
- Monitor Direct Mode success rates via edge function logs
- Track response times and identify performance regressions
- Verify character consistency accuracy across different avatar types
- Validate cultural intelligence representation quality

### Capacity Planning
- Direct Mode reduces load on PhaseIntegrationOrchestrator
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