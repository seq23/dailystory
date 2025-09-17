# Image Generation System Deployment Guide v2

**UPDATED FOR RECOVERY**: This v2 guide reflects lessons learned from the September 17, 2025 system recovery, including GitHub Actions permission fixes and realistic deployment expectations.

## 🛠️ CRITICAL DEPLOYMENT REQUIREMENTS

### GitHub Actions Permissions (MANDATORY)
**BREAKING CHANGE**: All monitor workflows now require explicit permissions to function.

```yaml
# Required in ALL monitor workflow files
jobs:
  health-check:
    runs-on: ubuntu-latest
    permissions:
      actions: write    # Trigger deployment workflows
      issues: write     # Create health alert issues
      contents: read    # Basic repository access
```

**Without these permissions**:
- Monitor workflows fail with HTTP 403 errors
- Auto-recovery system becomes non-functional
- Health alerts cannot be created
- Manual intervention required for all failures

### Edge Function Deployment Architecture

#### Primary Functions (All Required)
1. **`runware-generate-image`** - Main orchestrator and entry point
2. **`ai-visual-scene-creator`** - Tier 1 AI-enhanced generation
3. **`runware-template-ab`** - Tier 2.5A-B template with services
4. **`runware-template-cd`** - Tier 2.5C-D nuclear independence tier

#### Shared Dependencies
- **`_shared/RunwareWebSocketService.js`** - Runware API integration
- **`_shared/UnifiedDebugValidator.js`** - System validation and debugging
- **`_shared/ServiceHealthMonitor.js`** - Health monitoring utilities

## DEPLOYMENT PROCESS v2

### 1. Pre-Deployment Validation

**Environment Variables Check**:
```bash
# Verify all required secrets are set
curl -H "Authorization: Bearer [SUPABASE_SERVICE_ROLE_KEY]" \
  "https://[PROJECT_ID].supabase.co/functions/v1/runware-generate-image"

# Expected: Function boots without environment variable errors
```

**Required Secrets**:
- `OPENAI_API_KEY` - AI scene generation (Tier 1)
- `RUNWARE_API_KEY` - Image generation API (All tiers)
- `SUPABASE_URL` - Database integration
- `SUPABASE_SERVICE_ROLE_KEY` - Database authentication

### 2. GitHub Actions Workflow Configuration

**Repository Settings Requirements**:
```
Settings → Actions → General → Workflow permissions
☑️ Read and write permissions
☑️ Allow GitHub Actions to create and approve pull requests
```

**Deploy Functions Workflow** (`deploy-functions.yml`):
- **Trigger Methods**: Push to main, daily schedule, manual dispatch
- **Deployment Features**: Batch deployment, targeted redeploy, warm-up sequence
- **Error Handling**: Retry logic, rate limiting, validation checks

### 3. Automated Deployment Execution

**Force Deploy All Functions**:
```bash
# Manual trigger via GitHub CLI
gh workflow run deploy-functions.yml

# Manual trigger via API
curl -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/[OWNER/REPO]/actions/workflows/deploy-functions.yml/dispatches \
  -d '{"ref":"main"}'
```

**Targeted Function Deployment**:
```bash
# Deploy specific function only
gh workflow run deploy-functions.yml \
  --field target_function=runware-generate-image \
  --field priority_functions=runware-generate-image
```

### 4. Post-Deployment Monitoring

**Health Check Verification**:
```bash
# Test function availability (GET request)
curl -X GET "https://[PROJECT_ID].supabase.co/functions/v1/runware-generate-image" \
  -H "Authorization: Bearer [ANON_KEY]"

# Expected: HTTP 200 with system status response
```

**Functional Testing (POST request)**:
```bash
# Test actual image generation capability
curl -X POST "https://[PROJECT_ID].supabase.co/functions/v1/runware-generate-image" \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "a simple test image",
    "style": "photorealistic",
    "user_id": "test-user"
  }'

# Expected: HTTP 200 with image URL response
```

## MONITORING & RECOVERY SYSTEM v2

### Staggered Health Monitoring
- **Frequency**: Every 5-8 minutes per function
- **Coverage**: All 4 primary edge functions
- **Detection**: HTTP errors, timeouts, service unavailability
- **Response**: Automatic targeted redeployment

### Auto-Recovery Workflow (Fixed)
1. **Health Check Failure**: Monitor detects function issues
2. **Retry Logic**: 2 attempts with 30-second intervals
3. **Trigger Redeploy**: Call `deploy-functions.yml` with specific function
4. **Create Alert**: Generate GitHub issue for persistent failures
5. **Warm-up**: Test redeployed function health

### Monitor Workflow Schedule (Optimized)
```yaml
# Prevents overwhelming system with simultaneous checks
runware-generate-image:  "*/5 * * * *"       # Every 5 minutes
ai-visual-scene-creator: "1,7,13,19,25,31,37,43,49,55 * * * *"  # Every 6 minutes (offset)
runware-template-ab:     "2,9,16,23,30,37,44,51,58 * * * *"     # Every 7 minutes (offset)
runware-template-cd:     "3,11,19,27,35,43,51,59 * * * *"       # Every 8 minutes (offset)
```

## TROUBLESHOOTING DEPLOYMENT ISSUES

### Common Failure Patterns

#### 1. GitHub Actions Permission Errors
**Symptoms**:
```
Error: Resource not accessible by integration
POST https://api.github.com/repos/.../actions/workflows/.../dispatches: 403
```

**Resolution**:
```yaml
# Add to ALL monitor workflows
permissions:
  actions: write
  issues: write  
  contents: read
```

#### 2. Edge Function Boot Failures
**Symptoms**:
- Functions return HTTP 503 on health checks
- Import errors in function logs
- Environment variable missing errors

**Resolution**:
1. Check Supabase function logs for specific error messages
2. Verify all shared dependencies are properly uploaded
3. Confirm environment variables are set in Supabase dashboard
4. Redeploy with force refresh of all dependencies

#### 3. "False Healthy" Functions
**Symptoms**:
- Health checks return HTTP 200
- Actual image generation fails with HTTP 400/500
- Users see fallback images instead of generated content

**Investigation**:
```bash
# Test with actual payload instead of just health check
curl -X POST "https://[PROJECT_ID].supabase.co/functions/v1/runware-generate-image" \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test image","user_id":"debug-test"}'
```

#### 4. Deployment Pipeline Failures
**Symptoms**:
- Workflows complete but functions aren't updated
- Deployment logs show success but issues persist
- Multiple deployment attempts required

**Resolution**:
1. Check deployment logs for actual completion vs timeout
2. Verify Supabase CLI authentication in workflow
3. Confirm function upload vs just configuration update
4. Test with manual deployment to isolate pipeline issues

### Emergency Recovery Procedures

**Complete System Reset**:
```bash
# 1. Force redeploy all functions
gh workflow run deploy-functions.yml --field force_deploy=true

# 2. Clear Supabase function cache (if available)
# Navigate to Supabase dashboard → Edge Functions → Clear cache

# 3. Restart monitoring workflows
gh workflow run monitor-runware-generate.yml
gh workflow run monitor-ai-visual.yml
gh workflow run monitor-template-ab.yml
gh workflow run monitor-template-cd.yml

# 4. Verify recovery with functional test
curl -X POST [...] # Full image generation test
```

**Monitor Workflow Recovery**:
```bash
# Check recent runs for permission errors
gh run list --workflow=monitor-runware-generate.yml --limit=5

# Re-run failed monitors after permission fix
gh run rerun [FAILED_RUN_ID]
```

## PERFORMANCE EXPECTATIONS (Realistic)

### Success Rate Targets
- **Health Check Success**: >95% (GET request availability)
- **Functional Success**: >80% (actual image generation)
- **Auto-Recovery Success**: >90% (monitor → deploy → recovery)
- **End-to-End Success**: >75% (user request → delivered image)

### Response Time Expectations
- **Health Check**: <2 seconds
- **Image Generation**: 10-30 seconds (depending on tier)
- **Auto-Recovery**: 2-5 minutes (detection → redeploy → validation)
- **Manual Recovery**: 5-15 minutes (investigation → fix → verification)

### Tier Performance (Updated)
- **Tier 1 (AI)**: 60-80% success rate, highest quality
- **Tier 2.5A-B (Template+)**: 70-90% success rate, good quality  
- **Tier 2.5C-D (Nuclear)**: 85-95% success rate, consistent quality
- **Tier 4 (SVG)**: 100% success rate, basic quality

## DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] All 4 monitor workflows have `permissions` block
- [ ] Required secrets configured in Supabase
- [ ] GitHub repository has proper Actions permissions
- [ ] Shared dependencies updated in `_shared/` folder

### Deployment Execution  
- [ ] `deploy-functions.yml` workflow completes successfully
- [ ] All functions show "deployed" status in Supabase dashboard
- [ ] Health checks return HTTP 200 for all functions
- [ ] Functional tests pass for at least one tier

### Post-Deployment Validation
- [ ] Monitor workflows can trigger redeployments (HTTP 204)
- [ ] Health alerts can be created (HTTP 201)
- [ ] Debug console shows function activity
- [ ] End-to-end image generation works for test user

### Recovery System Verification
- [ ] Simulate function failure and verify auto-recovery
- [ ] Check GitHub issues for automated health alerts
- [ ] Validate monitor schedule doesn't cause conflicts
- [ ] Confirm warm-up sequence after redeployment

**Deployment Status**: Ready for production with realistic expectations and functional recovery system.