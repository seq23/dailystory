# Supabase Edge Functions Manifest

This directory contains all Edge Functions for the project. GitHub is the source of truth - any functions not listed below should be removed from the Supabase dashboard.

## Canonical Function List (41 Functions)

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
- `runware-simple-fallback` - JWT: false
- `runware-template-advanced` - JWT: false (JS only)
- `runware-template-simple` - JWT: false (JS only)

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
- `unified-debug-service` - JWT: false

## Entry File Requirements

Most functions use `index.ts` as their entry point. However, these 4 functions MUST use `index.js` only:
- `ai-visual-scene-creator`
- `runware-generate-image`
- `runware-template-advanced`
- `runware-template-simple`

## Maintenance Notes

1. **Source of Truth**: GitHub repository contains the canonical list of functions
2. **Supabase Dashboard**: Manually remove any functions not in this list
3. **Deployment**: Functions auto-deploy when code is committed
4. **Entry Files**: Never create both `.js` and `.ts` entry files for the same function

## Sync Status

- **GitHub Functions**: 41 (canonical)
- **Supabase Dashboard**: Should match GitHub after cleanup
- **Last Sync**: Manual cleanup required for 23 extra functions

## Next Steps

1. Remove extra functions from Supabase dashboard
2. Verify all 41 functions deploy correctly
3. Monitor logs for any deployment issues