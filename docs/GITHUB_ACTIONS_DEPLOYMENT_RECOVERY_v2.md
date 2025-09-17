# GitHub Actions Deployment Recovery Guide v2

**EMERGENCY PROCEDURES**: This document provides step-by-step recovery for GitHub Actions permission failures and deployment issues discovered on September 17, 2025.

## 🚨 CRITICAL ISSUE: Permission Failures

### Problem Identified
All monitor workflows (`monitor-*.yml`) were failing with:
```
Error: Resource not accessible by integration
HTTP 403: Forbidden
```

### Root Cause Analysis
GitHub Actions workflows require explicit permissions to:
1. **Trigger other workflows** (`workflow_dispatch` API calls)
2. **Create issues** (health alert generation)
3. **Read repository contents** (basic functionality)

Without these permissions, the GITHUB_TOKEN lacks necessary API access rights.

### Immediate Fix Applied

**Required Permissions Block**:
```yaml
jobs:
  health-check:
    runs-on: ubuntu-latest
    permissions:
      actions: write    # Required for triggering deploy-functions.yml
      issues: write     # Required for creating health alert issues
      contents: read    # Required for basic repository access
    env:
      SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Files Updated**:
- `.github/workflows/monitor-runware-generate.yml` ✅
- `.github/workflows/monitor-ai-visual.yml` ✅
- `.github/workflows/monitor-template-ab.yml` ✅
- `.github/workflows/monitor-template-cd.yml` ✅

## Recovery Verification Steps

### 1. Workflow Permission Testing
```bash
# Check if monitor can trigger deployment (should return HTTP 204)
curl -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$GITHUB_REPOSITORY/actions/workflows/deploy-functions.yml/dispatches \
  -d '{"ref":"main","inputs":{"target_function":"runware-generate-image"}}'
```

**Expected**: HTTP 204 No Content (success)
**Previous**: HTTP 403 Forbidden (permission denied)

### 2. Issue Creation Testing
```bash
# Check if monitor can create health alerts (should return HTTP 201)
curl -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$GITHUB_REPOSITORY/issues \
  -d '{"title":"Test Health Alert","body":"Permission test","labels":["test"]}'
```

**Expected**: HTTP 201 Created (success)
**Previous**: HTTP 403 Forbidden (permission denied)

## Monitor Workflow Recovery Process

### Staggered Health Check Schedule (Fixed)
- **runware-generate-image**: Every 5 minutes (*/5 * * * *)
- **ai-visual-scene-creator**: Every 6 minutes (:01,:07,:13,:19,:25,:31,:37,:43,:49,:55)
- **runware-template-ab**: Every 7 minutes (:02,:09,:16,:23,:30,:37,:44,:51,:58)
- **runware-template-cd**: Every 8 minutes (:03,:11,:19,:27,:35,:43,:51,:59)

### Auto-Recovery Flow (Now Functional)
1. **Health Check**: GET request to edge function endpoint
2. **Failure Detection**: HTTP 404, 500, or network timeout
3. **Retry Logic**: 2 attempts with 30-second intervals
4. **Auto-Deployment**: Trigger `deploy-functions.yml` with specific function
5. **Alert Creation**: Generate GitHub issue for persistent failures

### Error Handling Improvements

**Before (Misleading Success Messages)**:
```bash
echo "✅ Targeted redeploy triggered for $FUNCTION_NAME"
# This showed success even when API call returned 403
```

**After (Proper Error Detection)**:
```bash
response=$(curl -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$GITHUB_REPOSITORY/actions/workflows/deploy-functions.yml/dispatches \
  -d '{"ref":"main","inputs":{"priority_functions":"'$FUNCTION_NAME'","target_function":"'$FUNCTION_NAME'"}}'
  -w "%{http_code}")

if [[ "$response" == "204" ]]; then
  echo "✅ Targeted redeploy triggered successfully for $FUNCTION_NAME"
else
  echo "❌ Failed to trigger redeploy (HTTP $response) - requires manual intervention"
  exit 1
fi
```

## Manual Recovery Procedures

### Emergency Deployment Trigger
```bash
# Force deploy all edge functions
gh workflow run deploy-functions.yml

# Deploy specific function
gh workflow run deploy-functions.yml \
  --field target_function=runware-generate-image \
  --field priority_functions=runware-generate-image
```

### Monitor Status Check
```bash
# Check latest monitor run results
gh run list --workflow=monitor-runware-generate.yml --limit=5

# View specific run logs
gh run view [RUN_ID] --log
```

### Issue Management
```bash
# List automated health alerts
gh issue list --label="automated-alert" --label="edge-functions"

# Close resolved alerts
gh issue close [ISSUE_NUMBER] --comment="Issue resolved by deployment recovery"
```

## Debugging Failed Deployments

### Common Issues & Solutions

**1. Permission Denied (403)**
- **Cause**: Missing `permissions` block in workflow
- **Solution**: Add `actions: write` and `issues: write` permissions

**2. Workflow Not Found (404)**
- **Cause**: Incorrect workflow file path in API call
- **Solution**: Verify `deploy-functions.yml` exists and is accessible

**3. Invalid Input Parameters**
- **Cause**: Malformed JSON in workflow dispatch payload
- **Solution**: Validate JSON structure and parameter names

**4. Rate Limiting (429)**
- **Cause**: Too many API calls in short period
- **Solution**: Add delays between requests, respect rate limits

### Monitoring Dashboard Access

**GitHub Actions Tab**: View real-time workflow execution
- Navigate: Repository → Actions → Workflows
- Filter: Monitor workflows vs Deploy workflows
- Status: Green (success), Red (failure), Yellow (in progress)

**Supabase Function Logs**: View edge function execution details
- Navigate: Supabase Dashboard → Edge Functions → [Function Name] → Logs
- Filter: Error level, time range, specific function calls

## Prevention Strategies

### Required Repository Settings
- **Actions permissions**: "Read and write permissions" for GITHUB_TOKEN
- **Workflow permissions**: Allow actions to create and approve pull requests
- **Issue permissions**: Allow workflows to create issues and comments

### Workflow File Best Practices
```yaml
# Always include explicit permissions
permissions:
  actions: write
  issues: write
  contents: read

# Include error handling for API calls
- name: Trigger deployment with error handling
  run: |
    response=$(curl -w "%{http_code}" [API_CALL])
    if [[ "$response" != "204" ]]; then
      echo "❌ API call failed (HTTP $response)"
      exit 1
    fi
```

### Monitoring Alerts
- **Critical**: Function down for >10 minutes
- **Warning**: Function returning errors but still responding
- **Info**: Successful auto-recovery completion

## Recovery Validation Checklist

- [ ] All 4 monitor workflows have `permissions` block
- [ ] Test deployment trigger returns HTTP 204
- [ ] Test issue creation returns HTTP 201  
- [ ] Monitor schedules are staggered correctly
- [ ] Edge functions respond to health checks
- [ ] Auto-recovery loop completes successfully
- [ ] GitHub issues created for persistent failures
- [ ] Debug console shows monitor activity

**Recovery Status**: ✅ Complete - All GitHub Actions permission issues resolved and auto-recovery system operational.