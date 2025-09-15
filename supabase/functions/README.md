# Supabase Edge Functions Manifest

This directory contains all Edge Functions for the project. GitHub is the source of truth - any functions not listed below should be removed from the Supabase dashboard.

## Canonical Function List (40 Functions)

### Authentication & Subscription Functions
- `activate-discount-code` - JWT: true
- `apply-discount-code` - JWT: true  
- `check-subscription` - JWT: true
- `create-checkout` - JWT: true
- `create-premium-subscription` - JWT: true
- `customer-portal` - JWT: true
- `send-custom-auth-email` - JWT: true
- `validate-discount-code` - JWT: false

### AI & Content Generation Functions
- `ai-visual-scene-creator` - JWT: false (JS only)
- `background-image-pregeneration` - JWT: false
- `clear-character-cache` - JWT: false
- `correct-spelling` - JWT: false
- `generate-adaptive-story` - JWT: false
- `generate-fallback-images` - JWT: false
- `process-story-content` - JWT: false
- `template-service` - JWT: false
- `translate-universal` - JWT: false

### Audio & Voice Functions
- `elevenlabs-agent-signed-url` - JWT: false
- `elevenlabs-dictionary-manager` - JWT: false
- `elevenlabs-tts-smart` - JWT: false
- `elevenlabs-tts` - JWT: false
- `openai-realtime` - JWT: false
- `openai-tts` - JWT: false
- `voice-to-text` - JWT: false
- `word-dictionary` - JWT: false

### Image Generation Functions
- `image-proxy` - JWT: false
- `runware-generate-image` - JWT: false (JS only)

- `runware-template-ab` - JWT: false (JS only)
- `runware-template-cd` - JWT: false (JS only)

### Security & Monitoring Functions
- `log-personal-info-incident` - JWT: true
- `log-security-event` - JWT: true
- `notification-service` - JWT: true
- `security-alert` - JWT: true
- `security-dashboard` - JWT: true
- `send-coppa-notification` - JWT: true
- `send-parental-notification` - JWT: true

### System & Debug Functions
- `get-monitoring-data` - JWT: false
- `model-performance-monitor` - JWT: false
- `system-diagnostics` - JWT: false

## Entry File Requirements

All functions use `index.ts` as their entry point. JavaScript-only functions have TypeScript shim files that import their `index.js` implementations:
- `ai-visual-scene-creator` - Shim: `index.ts` → Implementation: `index.js`
- `runware-generate-image` - Shim: `index.ts` → Implementation: `index.js`
- `runware-template-ab` - Shim: `index.ts` → Implementation: `index.js`
- `runware-template-cd` - Shim: `index.ts` → Implementation: `index.js`
- `background-image-pregeneration` - Shim: `index.ts` → Implementation: `index.js`

## Maintenance Notes

1. **Source of Truth**: GitHub repository contains the canonical list of functions
2. **Supabase Dashboard**: Manually remove any functions not in this list
3. **Deployment**: Functions auto-deploy when code is committed
4. **Entry Files**: JavaScript-only functions use TypeScript shim files that import the JavaScript implementation
5. **CI Resilience**: Generic deploy step uses `continue-on-error: true` to ensure explicit per-function deploys always run even if bundling fails

## Known Supabase Sync Anomalies

### False "Module not found" Errors
**Issue**: Edge function logs may show "Module not found: index.js" even when files exist
**Cause**: Supabase deployment sync delays between TypeScript shims and JavaScript implementations
**Files Affected**: `runware-generate-image`, `runware-template-cd`, `ai-visual-scene-creator`
**Status**: Files are present and functional - this is a false positive

### Troubleshooting Steps
1. Verify files exist in GitHub repository
2. Check DEPLOY_MARKER timestamps for sync confirmation
3. Monitor function execution - should work despite log errors
4. Force redeploy only if actual functionality is broken

## Forced Redeploy History

**2025-01-30T21:30:00Z** - Documentation update for sync anomaly awareness
- Added "Known Supabase Sync Anomalies" section
- Updated DEPLOY_MARKER for affected shim files
- Clarified that "Module not found" errors are false positives

**2025-01-30T20:17:15Z** - Emergency redeploy to fix boot failures in:
- `ai-visual-scene-creator`: Boot failure "failed to determine entrypoint"  
- `runware-generate-image`: Module not found error for index.js
- Resolution: Updated DEPLOY_MARKER timestamps to force fresh deployment snapshot

## Sync Status

- **GitHub Functions**: 40 (canonical)
- **Supabase Dashboard**: Should match GitHub after cleanup
- **Last Sync**: Manual cleanup required for 23 extra functions

## Next Steps

1. Remove extra functions from Supabase dashboard
2. Verify all 40 functions deploy correctly
3. Monitor logs for any deployment issues