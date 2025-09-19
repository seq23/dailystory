# Image Generation Deployment Guide

⚠️ **DEPRECATED TYPESCRIPT FUNCTIONS - DO NOT EDIT** ⚠️

**CRITICAL: DO NOT DELETE UNTIL USER IS COMFORTABLE WITH NEW .JS FILES**

The following TypeScript edge functions are deprecated:
- `runware-generate-image/index.ts` (DEPRECATED)
- `ai-visual-scene-creator/index.ts` (ACTIVE BUT NEEDS JS MIGRATION)  
- `runware-simple-fallback/index.backup.ts` (BACKUP - DO NOT DELETE)
- `prompt-studio/index.ts` (DEPRECATED)
- `runware-diagnostic/index.ts` (DEPRECATED)

See [docs/IMAGE_FUNCTIONS_DEPRECATION.md](IMAGE_FUNCTIONS_DEPRECATION.md) for complete deprecation details.

## Overview

This guide covers deployment, configuration, and monitoring of the image generation system's edge functions and associated services.

## Edge Functions

### Required Functions

The image generation system requires these Supabase edge functions:

1. **`runware-generate-image`** - Main orchestrator
2. **`ai-visual-scene-creator`** - Tier 1 AI enhancement  
3. **`runware-template-ab`** - Tier 2.5 template fallback

### Function Deployment Architecture
- **Primary Functions**: Use TypeScript shims (`index.ts`) that import JavaScript implementations (`index.js`)
- **Problematic Functions**: `runware-template-ab` may require pure JavaScript deployment (no TypeScript shim)
- **Deployment Strategy**: GitHub Actions performs bulk deployment + individual function deployment for reliability

### Deployment

Edge functions are automatically deployed when code is pushed to the repository. The deployment workflow includes:
1. Bulk deployment of all functions
2. Individual deployment of `runware-template-ab` for reliability

#### Manual Deployment (if needed)
```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy runware-generate-image
```

## Environment Variables & Secrets

### Required Secrets

Configure these secrets in Supabase Dashboard > Edge Functions > Secrets:

#### `OPENAI_API_KEY`
- **Purpose**: Powers Tier 1 AI scene generation
- **Required For**: `ai-visual-scene-creator` function
- **Format**: `sk-...` (OpenAI API key)
- **Where to Get**: https://platform.openai.com/api-keys

#### `RUNWARE_API_KEY`  
- **Purpose**: Powers image generation in Tiers 1 and 2.5
- **Required For**: `ai-visual-scene-creator`, `runware-template-ab`
- **Format**: Runware API key
- **Where to Get**: https://runware.ai/ (Dashboard > API Keys)

### Optional Configuration

#### `IMAGE_DEBUG_MODE`
- **Purpose**: Enable verbose logging across all functions
- **Default**: `false`
- **Values**: `true` | `false`

#### `TIER_FORCE_LEVEL`
- **Purpose**: Force specific tier for testing
- **Default**: `null` (normal progression)
- **Values**: `1` | `2.5` | `4`

### Environment Variable Access

```javascript
// In edge functions
const openaiKey = Deno.env.get('OPENAI_API_KEY');
const runwareKey = Deno.env.get('RUNWARE_API_KEY');
const debugMode = Deno.env.get('IMAGE_DEBUG_MODE') === 'true';
```

## CORS Configuration

### Headers Setup

All image generation functions use these CORS headers:

```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

### OPTIONS Handling

Each function includes OPTIONS request handling:

```javascript
// Handle CORS preflight requests
if (req.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders });
}
```

## Function Configuration

### `supabase/config.toml`

```toml
project_id = "your-project-id"

[functions.runware-generate-image]
verify_jwt = false

[functions.ai-visual-scene-creator]
verify_jwt = false

[functions.runware-template-ab]
verify_jwt = false
```

### Public Access

All image generation functions are configured as **public** (`verify_jwt = false`) to ensure:
- Guest user access
- Simplified authentication flow
- Maximum reliability

## Database Setup

### Required Tables

#### `character_consistency`
Stores character data for consistency across story pages.

```sql
CREATE TABLE character_consistency (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  character_name TEXT NOT NULL,
  character_seed INTEGER NOT NULL,
  visual_description TEXT,
  clothing_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_character_consistency_session 
ON character_consistency(session_id);

CREATE INDEX idx_character_consistency_character 
ON character_consistency(session_id, character_name);
```

#### Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE character_consistency ENABLE ROW LEVEL SECURITY;

-- Allow all operations (functions run with service role)
CREATE POLICY "Allow all operations on character_consistency" 
ON character_consistency FOR ALL 
USING (true) 
WITH CHECK (true);
```

## Automated Deployment & Monitoring

### Scheduled Daily Deployments
Edge functions are automatically deployed daily at 2:00 AM UTC via GitHub Actions to prevent "drift" and deployment errors. This ensures:
- Functions stay synchronized with the latest code
- Deployment issues are caught early
- System reliability is maintained

### Operational Hardening: Staggered Health Monitoring
Critical functions are monitored independently with staggered timing to prevent circuit breaker conflicts:
- `runware-generate-image`: Every 5 minutes (`:00, :05, :10...`)
- `ai-visual-scene-creator`: Every 6 minutes (`:01, :07, :13...`)
- `runware-template-ab`: Every 7 minutes (`:02, :09, :16...`)
- `runware-template-cd`: Every 8 minutes (`:03, :11, :19...`)

Each function has its own dedicated monitoring workflow that:
- Tests function health with 2 retry attempts
- Includes 30-second circuit breaker reset delays
- Triggers targeted redeployment if 2 consecutive checks fail
- Creates GitHub issues for persistent failures

### Post-Deploy Warm-Up & Auto-Heal
After each deployment, the system performs an automated warm-up sequence:
1. **Stabilization Wait**: 2-minute delay after deployment completion
2. **Staggered Warm-Up**: Each function tested with 60-second intervals
3. **Secret Validation**: Verifies required environment variables are present
4. **Retry Logic**: 3 attempts per function with exponential backoff
5. **Auto-Healing**: Failed functions automatically trigger targeted redeployments

This prevents the "whack-a-mole" issue where functions randomly fail due to cold start problems.

### Pre-Deployment Health Checks
Before each deployment, the system performs health checks on existing functions to identify issues before deployment begins.

## Manual Monitoring & Logging

### Edge Function Logs

#### Access Logs
- **Location**: Supabase Dashboard > Edge Functions > Logs
- **Filter By**: Function name, time range, log level
- **Search**: Use request IDs for correlation

#### Log Levels
- **INFO**: Normal operation logs
- **WARN**: Non-critical issues (fallbacks, retries)
- **ERROR**: Critical failures requiring attention

### Key Metrics to Monitor

#### Success Rates
- **Tier 1**: Target 85-90%
- **Tier 2.5**: Target 95-99%
- **Overall System**: Must maintain 100%

#### Response Times
- **Tier 1**: 3-8 seconds average
- **Tier 2.5**: 2-5 seconds average
- **P95**: <10 seconds for any tier

#### Error Patterns
- OpenAI API timeouts
- Runware WebSocket failures
- Database character storage issues

### Alerting Setup

#### Critical Alerts
- Overall success rate <99%
- Any tier completely failing
- Database connection errors

#### Warning Alerts  
- Tier 1 success rate <80%
- Response times >10 seconds
- High API error rates

## Performance Optimization

### Caching Strategy

#### Character Consistency
- Characters cached in database per session
- Reduces API calls for repeated characters
- Improves consistency across pages

#### Image Caching
- Frontend caches generated images
- Reduces regeneration on navigation
- Session-based cache management

### Resource Optimization

#### OpenAI Usage
- Minimize prompt length
- Use appropriate model selection
- Implement request batching where possible

#### Runware Usage  
- Optimize WebSocket connections
- Reuse connections across requests
- Implement connection pooling

## Troubleshooting

### Common Deployment Issues

#### False "Module not found" Errors
**Symptoms**: Edge function logs show "Module not found: index.js" but functions work
**Cause**: Supabase sync delay between TypeScript shims and JavaScript implementations
**Affected Functions**: `runware-generate-image`, `runware-template-cd`, `ai-visual-scene-creator`
**Solution**: 
- Verify files exist in GitHub repository
- Check function actually works despite log errors
- This is a false positive - files are present and functional
- Only force redeploy if actual functionality is broken

#### Missing Secrets
**Symptoms**: Function errors about missing API keys
**Solution**: Verify secrets are set in Supabase Dashboard

#### CORS Errors
**Symptoms**: Browser blocks requests from frontend
**Solution**: Verify CORS headers and OPTIONS handling

#### Database Permissions
**Symptoms**: Character consistency errors
**Solution**: Check RLS policies and table permissions

### Health Checks

#### Function Health
Test each function individually:

```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/ai-visual-scene-creator' \
  -H 'Content-Type: application/json' \
  -d '{"storyText":"test","avatarIdentity":{"name":"Test","age":8,"userName":"TestUser"}}'
```

#### Database Health
```sql
-- Check character_consistency table
SELECT COUNT(*) FROM character_consistency;

-- Check recent activity
SELECT * FROM character_consistency 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

## Security Considerations

### API Key Protection
- Store all keys in Supabase Secrets (encrypted)
- Never expose keys in frontend code
- Rotate keys regularly

### Rate Limiting
- Supabase provides automatic rate limiting
- Monitor for abuse patterns
- Implement additional limits if needed

### Content Safety
- OpenAI provides built-in content filtering
- Monitor generated content for appropriateness
- Implement additional filters if required

## Rollback Procedures

### Function Rollback
```bash
# Rollback specific function
supabase functions deploy runware-generate-image --legacy-bundle

# Or revert to previous git commit and redeploy
git revert <commit-hash>
supabase functions deploy
```

### Database Rollback
```sql
-- Rollback character_consistency changes if needed
-- (Create backup before major changes)
```

### Emergency Procedures
- Disable problematic functions via dashboard
- Force Tier 4 (SVG) mode for guaranteed service
- Monitor error rates and user impact

This deployment guide ensures reliable setup and operation of the image generation system across all environments.