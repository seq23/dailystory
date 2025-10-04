# Unified Debug System

## Overview

The debug system has been completely unified into a single, comprehensive interface that eliminates scattered `window.debug*` objects and console pollution.

## Architecture

### Core Components

1. **UnifiedDebugMonitor** (`src/components/UnifiedDebugMonitor.tsx`)
   - Single debug interface accessible via `?debug=1`
   - Consolidates all debugging functionality
   - Tabs: Console, Network, Netflix, Image Analysis, Audio Test, System Validation

2. **UnifiedSystemValidator** (`src/services/UnifiedSystemValidator.ts`)
   - Comprehensive system validation
   - Audio, network, cache, UI, and performance checks
   - Singleton pattern with global access in debug mode

3. **Core Services** (Non-auto-initializing)
   - `DebugLogger` - Centralized logging
   - `NetworkDebugger` - Network request monitoring
   - `sessionCacheDebug` - Session cache utilities

## What Was Removed

### Deleted Files
- `src/utils/debugConsole.ts` - Functions moved to UnifiedDebugMonitor
- `src/utils/cacheDebugConsole.ts` - Deprecated, functionality in UnifiedSystemValidator
- `src/utils/imageDebugConsole.ts` - Had require() issues, moved to UnifiedDebugMonitor
- `src/utils/childDebugConsole.ts` - Functionality integrated
- `src/utils/voiceDebugger.ts` - Audio testing moved to UnifiedDebugMonitor

### Removed Imports
- Removed auto-initializing imports from `main.tsx`
- Removed debug console imports from `CleanStoryDisplay.tsx` and `PremiumHeader.tsx`
- Fixed require() statements in `audioImplementationValidator.ts`

## Usage

### Debug Mode Access
```
?debug=1  // Enable unified debug interface
```

### Available Functionality
- **Console Logs**: Real-time debug logging with filtering
- **Network Monitoring**: Request tracking and failure analysis
- **Netflix Debugging**: Story generation pipeline monitoring
- **Image Analysis**: Session cache and image loading debug
- **Audio Testing**: Charlotte voice service testing
- **System Validation**: Comprehensive health checks

### Global Debug Access (Debug Mode Only)
```javascript
// Available in browser console when ?debug=1 is set
window.unifiedSystemValidator.validateSystem()
window.sessionCacheDebug.investigate()
```

## Benefits Achieved

✅ **Single Debug Interface** - One unified component instead of 7+ scattered utilities  
✅ **Clean Console** - No debug pollution in production  
✅ **Professional UX** - Hidden debug functionality for end users  
✅ **Enhanced Developer Experience** - Comprehensive debugging in one place  
✅ **Fixed Build Errors** - No more require() statement issues  
✅ **Maintainable Architecture** - Centralized debug logic

## Migration Notes

All previous debug functionality remains available through the UnifiedDebugMonitor. The scattered `window.debug*` objects have been eliminated, and debug access is properly gated behind debug mode.

## Image Debug Data

### Recent Image Prompts Response Shape

The `recent-image-prompts` operation returns a normalized shape for consistency:

```javascript
{
  imagePrompts: [
    {
      id: "uuid",
      session_id: "session-id",
      positive_prompt: "The actual prompt sent to Runware...",
      negative_prompt: "NO TEXT, no words...",
      image_url: "https://...",
      tier: "TIER_1" | "TIER_2.5A" | "TIER_2.5B" | "TIER_2.5C" | "DIRECT_MODE",
      edge_function: "runware-template-cd" | "runware-template-ab" | "ai-visual-scene-creator",
      page_number: number,
      status: "success" | "failure" | "attempting",
      created_at: "timestamp"
    }
  ],
  data: [...]  // Backward compatibility alias (same as imagePrompts)
}
```

**Backward Compatibility**: Both `data` and `imagePrompts` fields are returned:
- `data`: Array of image prompts (legacy field for old consumers)
- `imagePrompts`: Array of image prompts (normalized field)

Consumers can use either field - they contain the same data.

### Prompt Storage

- **positive_prompt**: The actual positive prompt sent to Runware API
- **negative_prompt**: The actual negative prompt sent to Runware API  
- **edge_function**: Which edge function generated the image (runware-template-cd, runware-template-ab, etc.)
- **tier**: Which tier succeeded (TIER_1, TIER_2.5A, DIRECT_MODE, etc.)
- **page_number**: Story page number this image was generated for
- All fields stored in `image_generation_debug` table via `tierLogger.success()` calls

### Sampling and Reliability

**Default Behavior** (Production):
- Success logs: 10% sampling rate (configurable via `DEBUG_TIER_LOG_SAMPLE`)
- Failure logs: 100% (always logged, never sampled)

**Debug Mode** (Full Logging):
Set `DEBUG_TIER_LOG_SAMPLE=1` to force 100% logging of success events:
```bash
# In Supabase Edge Function Secrets
DEBUG_TIER_LOG_SAMPLE=1
```

This ensures "last 6 image prompts" is **always** available during debugging.

**Client-Side Debug Access**:
```javascript
// Only works when ?debug=1 is active
const { imagePrompts } = await DebugGateway.getRecentImagePrompts(6);
console.log(imagePrompts); // Array of last 6 prompts with full details

// Manual tier checking (for deep debugging)
window.checkImageTier();
// Logs detailed tier information for last 10 images to console
```

### CORS Implementation

All debug endpoints return proper CORS headers in both success and error responses:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- OPTIONS preflight requests return **200 status** (required by browsers)

### Error Handling

**Validation Errors** (400 Bad Request):
When required fields are missing (e.g., `pageText` or `storyText`), functions return structured error responses:

```json
{
  "success": false,
  "error": "NO_STORY_CONTENT",
  "message": "Missing required story content. Please provide pageText or storyText in the request body.",
  "hint": "Check your request body structure and ensure all required fields are present",
  "requiredFields": {
    "storyContent": "pageText OR storyText",
    "sessionId": "string",
    "userInfo": "object"
  }
}
```

**Server Errors** (500 Internal Server Error):
- Include escalation information
- Log full error details server-side
- Return generic error messages to client

**All error responses include CORS headers** to prevent browser CORS errors from masking the actual error.

## Common Issues

### CORS Error with `[object Object]` in URL
If you see CORS errors with URLs like `functions/v1/[object%20Object]`, this typically indicates a bug where an object is being used as a string in a fetch URL. Check that endpoint references use `.name` property when the endpoint is an object: `${endpoint.name}` not `${endpoint}`.