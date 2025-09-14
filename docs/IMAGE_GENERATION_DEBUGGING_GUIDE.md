# Image Generation Debugging Guide

## Overview

The image generation system provides comprehensive debugging tools to help identify and resolve issues across all tiers. This guide covers debugging methods, common issues, and troubleshooting workflows.

## Debug Mode

### Enabling Debug Mode
Add `?debug=1` to any URL to enable debug mode:
```
https://your-app.com/story?debug=1
```

### Debug Features
- **Console Logging**: Detailed logs for all image generation steps
- **ImageTierTester Component**: Visual testing interface for all tiers
- **Request ID Correlation**: Track requests across all functions
- **Performance Metrics**: Response times and success rates

## ImageTierTester Component

### Access
Navigate to `/prompt-testing?debug=1` to access the tier testing interface.

### Available Tests

#### Connectivity Tests
- **GET Health Checks**: Tests endpoint reachability using lightweight GET requests
- **API Key Status**: Shows presence of required API keys (OpenAI, Runware) per endpoint
- **Status Display**: "healthy" (2xx + keys present), "non-2xx (status)", or "unreachable"

#### Individual Tier Tests
- **Tier 1**: Tests `ai-visual-scene-creator` directly
- **Tier 2.5A-D**: Tests `runware-simple-fallback` with different complexity levels
- **Tier 4**: Uses local placeholder generation (no edge function dependency)

#### Batch Testing
- **Run All Tiers**: Tests complete fallback chain
- **Performance Analysis**: Measures response times across tiers
- **Success Rate Tracking**: Monitors tier reliability

#### Test Configuration
```typescript
interface TierTestConfig {
  storyText: string;
  sessionId: string;
  avatarIdentity: {
    name: string;
    age: number;
    userName: string;
  };
}
```

## Console Debugging

### Debug Log Categories

#### Frontend Logs
Look for these prefixes in browser console:
- `IMAGE GENERATION DEBUG`: Frontend service operations
- `SIMPLE IMAGE SERVICE`: Service method calls
- `TIER FALLBACK`: Fallback progression
- `CACHE MANAGEMENT`: Image caching operations
- `CONNECTIVITY TEST`: GET-based health check results showing endpoint status and API key presence

#### Backend Logs
Monitor edge function logs in Supabase Dashboard:

##### Main Orchestrator (`runware-generate-image`)
- `ORCHESTRATOR`: Main orchestrator flow
- `TIER PROGRESSION`: Tier fallback decisions
- `REQUEST VALIDATION`: Input validation results
- `FINAL RESPONSE`: Response preparation

##### Tier 1 (`ai-visual-scene-creator`)
- `AI SCENE CREATOR`: Scene enhancement process
- `CHARACTER CONSISTENCY`: Database character operations
- `OPENAI REQUEST`: OpenAI API interactions
- `RUNWARE WEBSOCKET`: WebSocket connection status

##### Tier 2.5 (`runware-simple-fallback`)
- `TEMPLATE FALLBACK`: Template selection and processing
- `COMPLEXITY LEVEL`: Complexity fallback progression
- `RUNWARE API`: Direct API interactions

### Request ID Correlation

#### Format
Request IDs follow the pattern: `[REQ-{8chars}-{5chars}]`
Example: `[REQ-mferghcd-e98ij]`

#### Tracking Across Functions
1. Frontend generates unique request ID
2. Main orchestrator receives and logs request ID
3. Each tier function logs with the same request ID
4. Responses include request ID for correlation

#### Search Strategy
Use request ID to search across all edge function logs:
```
Search: "REQ-mferghcd-e98ij"
```

## Common Issues & Solutions

### False "Module not found" Errors (Supabase Sync Anomaly)

**Issue**: 
- Edge function logs show "Module not found: index.js" despite files being present
- Affected functions: `runware-generate-image`, `runware-template-cd`, `ai-visual-scene-creator`
- Functions work correctly despite error messages

**Cause**: 
- Supabase sync delay between TypeScript shim deployment and JavaScript implementation
- GitHub repository contains files but Supabase deployment pipeline has temporary sync issues

**Troubleshooting Steps**:
1. **Verify files exist**: Check GitHub repository for index.js files
2. **Test functionality**: Despite log errors, functions should work normally
3. **Check DEPLOY_MARKER**: Look for recent timestamp updates in shim files
4. **Monitor actual behavior**: Focus on function execution, not log messages
5. **Force redeploy only if broken**: Only redeploy if actual functionality fails

**Log Examples**:
```
ERROR worker boot error: Module not found: file:///home/runner/work/time-2-read/time-2-read/supabase/functions/runware-generate-image/index.js
INFO ✅ runware-template-ab completed successfully via Supabase client
```

**Resolution**: This is a false positive - files are present and functional.

### Tier 1 Undefined apiKey Variable (FIXED)

**Issue**: 
- The `runware-generate-image` function was referencing an undefined `apiKey` variable instead of `runwareApiKey`
- This caused "apiKey is not defined" errors and forced fallback to Tier 2.5

**Fix Applied**:
- Fixed line 1356: Changed `apiKeyPresent: !!apiKey` to `apiKeyPresent: !!runwareApiKey`
- Fixed line 1363: Changed `generateWithRunwarePremium(apiKey, ...)` to `generateWithRunwarePremium(runwareApiKey, ...)`
- Added guard condition: Tier 1 now only executes if `runwareApiKey` is present, unless `forceTier === 1`

**Validation Steps**:
1. Test A: Use `forceTier = 1` with short prompt - should no longer show "apiKey is not defined" error
2. Test B: Auto mode with missing `RUNWARE_API_KEY` - should skip Tier 1 cleanly without error
3. Use new "Tier 1 Smoke Test" button in ApiKeyDiagnostic for easy testing
   - Available on Prompt Testing page (`/prompt-testing?debug=1`) in the Infrastructure Testing section

### Template AB Service Method Issues

#### Broken Character Consistency Method Calls
**Symptoms**:
- Template AB (complexity A-B) generating generic templates
- Character consistency not working despite cached data
- Method not found errors in shared services

**Debug Steps**:
1. Check `CharacterService.getCharacterSeed()` method exists and is exported
2. Verify `VisualTracker.trackVisualDetails()` method signature
3. Ensure proper service initialization in template AB function
4. Test character consistency flow with correct method names

**Log Examples**:
```
WARNING Template AB: Character consistency unavailable: TypeError: CharacterService.getCharacterSeed is not a function
ERROR Template AB: VisualTracker method not found
INFO Template AB: Falling back to basic template without character consistency
```

### Tier 1 Issues

#### OpenAI API Timeouts
**Symptoms**:
- Console shows `OPENAI_TIMEOUT` error
- Response time >8 seconds
- Fallback to Tier 2.5 triggered

**Debug Steps**:
1. Check OpenAI API key in Supabase secrets
2. Monitor OpenAI API status
3. Review model selection (newer models vs legacy)
4. Check request payload size

**Log Examples**:
```
ERROR Model gpt-4.1-2025-04-14 failed on attempt 1: timeout
FALLBACK [REQ-abc123] Tier 1 failed, attempting Tier 2.5
```

#### Character Consistency Failures
**Symptoms**:
- Characters look different across pages
- Database character storage errors
- Missing character seed values

**Debug Steps**:
1. Check database character_consistency table
2. Verify session ID consistency
3. Review character seed generation
4. Test character retrieval and storage

**Log Examples**:
```
ERROR Failed to save character session-123_Maya to database
WARNING Character seed not found, generating new one
```

#### Runware WebSocket Issues
**Symptoms**:
- WebSocket connection failures
- Image generation hangs
- Connection timeout errors

**Debug Steps**:
1. Check Runware API key configuration
2. Monitor WebSocket connection logs
3. Test direct Runware API access
4. Review network connectivity

### Tier 2.5 Issues

#### Template Selection Failures
**Symptoms**:
- Complexity level fallback triggered
- Template not found errors
- Fallback to Tier 4

**Debug Steps**:
1. Review available templates
2. Check complexity level progression
3. Verify template matching logic
4. Test direct template API calls

**Log Examples**:
```
TEMPLATE Complexity A failed, falling back to B
ERROR Template selection failed for complexity C
```

#### Runware API Errors
**Symptoms**:
- Direct API call failures
- Authentication errors
- Rate limit exceeded

**Debug Steps**:
1. Verify Runware API key
2. Check rate limiting status
3. Monitor API response errors
4. Test API connectivity

### Tier 4 Issues

#### SVG Generation Failures
**Symptoms**:
- No image displayed
- JavaScript execution errors
- CSP policy violations

**Debug Steps**:
1. Check browser console for CSP errors
2. Verify SVG generation logic
3. Test blob URL vs data URL support
4. Review fallback image service

**Log Examples**:
```
ERROR CSP blocks data URLs, using blob URL fallback
WARNING SVG generation failed, using default placeholder
```

## Debugging Workflow

### 1. Identify the Issue
- Check browser console for frontend errors
- Note which tier failed (if any)
- Collect request ID from logs

### 2. Trace the Request
- Search edge function logs for request ID
- Follow request progression through tiers
- Identify point of failure

### 3. Analyze the Failure
- Review error messages and context
- Check API key configuration
- Verify request payload format
- Monitor external service status

### 4. Test the Fix
- Use ImageTierTester for isolated testing
- Run specific tier tests
- Verify end-to-end functionality
- Monitor success rates

## Performance Analysis

### Response Time Targets
- **Tier 1**: 3-8 seconds
- **Tier 2.5**: 2-5 seconds  
- **Tier 4**: <100ms

### Success Rate Monitoring
Track success rates via console logs:
```javascript
// Frontend success rate tracking
console.log('TIER SUCCESS RATE', {
  tier1: '87%',
  tier25: '96%', 
  tier4: '100%',
  overall: '100%'
});
```

### Performance Optimization
- Monitor P95 response times
- Identify bottlenecks in tier progression
- Optimize caching strategies
- Review fallback trigger thresholds

## Advanced Debugging

### Manual Function Testing
Test functions directly via Supabase Dashboard:

```javascript
// Test ai-visual-scene-creator
{
  "storyText": "A brave knight enters the dragon's lair",
  "avatarIdentity": {
    "name": "Arthur",
    "age": 12,
    "userName": "TestUser"
  },
  "sessionId": "debug-session-123"
}
```

### Database Inspection
Check character consistency data:
```sql
SELECT * FROM character_consistency 
WHERE session_id = 'your-session-id'
ORDER BY created_at DESC;
```

### API Health Checks
Monitor external service status:
- OpenAI API Status: https://status.openai.com/
- Runware API Status: Check Runware dashboard
- Supabase Status: https://status.supabase.com/

## Best Practices

### Development
- Always test in debug mode first
- Use unique session IDs for testing
- Monitor console logs during development
- Test all tier fallback scenarios

### Production
- Monitor edge function error rates
- Set up alerts for tier failure rates
- Review performance metrics regularly
- Track user experience impact

### Maintenance
- Keep API keys updated
- Monitor external service changes
- Update fallback thresholds based on data
- Maintain debug logging clarity

This debugging guide provides comprehensive coverage of the image generation system's debugging capabilities and common troubleshooting scenarios.