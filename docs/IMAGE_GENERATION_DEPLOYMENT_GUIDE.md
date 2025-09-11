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
3. **`runware-simple-fallback`** - Tier 2.5 template fallback

### Deployment

Edge functions are automatically deployed when code is pushed to the repository. No manual deployment steps required.

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
- **Required For**: `ai-visual-scene-creator`, `runware-simple-fallback`
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

[functions.runware-simple-fallback]
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

## Monitoring & Logging

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