# Escalation Logic Fix - September 25, 2025

## Overview
Fixed critical escalation logic issues in the image generation system that prevented proper tier cascading and nuclear template fallbacks.

## Problems Identified

### 1. Unreachable Code in Orchestrator (Lines 807-821)
**File:** `supabase/functions/runware-generate-image/index.js`
**Issue:** Lines 807-821 were inside a `catch (tier25Error)` block but were an `else` clause, making them unreachable.
**Impact:** Regular escalation from Tier 1 → 2.5A → 2.5B → 2.5C → 2.5D never worked.

### 2. Missing 2.5B Tier Escalation
**Issue:** No escalation path from 2.5A to 2.5B in regular flow.
**Impact:** System jumped directly from 2.5A failure to nuclear templates, skipping 2.5B.

### 3. Nuclear Templates Only in Force Mode
**Issue:** `tryNuclearTemplates()` was only called in Force Tier mode, not regular escalation.
**Impact:** Regular flow never attempted 2.5C → 2.5D cascade.

## Fix Implementation

### Backend Changes (`supabase/functions/runware-generate-image/index.js`)

**Old Structure (Broken):**
```javascript
} catch (tier25Error) {
  if (payload.forceTier === 'COMPLETE_TIER_1' || payload.forceTier === 'tier-1' || payload.skipTier25) {
    // Force Mode logic
  } else {
    // UNREACHABLE: This else was inside the catch block
    // Regular escalation logic was here but never executed
  }
}
```

**New Structure (Fixed):**
```javascript
} catch (tier25Error) {
  log.failure('tier-2.5A', { error: (tier25Error && tier25Error.message) || String(tier25Error), escalation: 'tier-2.5B' });
  
  // Escalate to Tier 2.5B
  try {
    log.attempt('tier-2.5B', { note: 'Escalating from Tier 2.5A failure' });
    const resp25B = await supabase.functions.invoke('runware-template-ab', {
      body: {
        storyText,
        pageText: storyText,
        userInfo: payload.userInfo,
        sessionId,
        pageNumber: pageNumber || 1,
        templateComplexity: 'B'
      }
    });
    
    if (resp25B?.data?.success) {
      result = resp25B.data;
      log.success('tier-2.5B', { imageUrl: result.imageURL });
    } else {
      throw new Error('Tier 2.5B failed');
    }
  } catch (tier25BError) {
    log.failure('tier-2.5B', { error: (tier25BError && tier25BError.message) || String(tier25BError), escalation: 'nuclear-templates' });
    
    // Escalate to nuclear templates (2.5C → 2.5D)
    result = await tryNuclearTemplates({
      storyText,
      userInfo: payload.userInfo,
      sessionId,
      pageNumber: pageNumber || 1,
      log
    });
  }
}

// Handle Force Tier modes separately
if (payload.forceTier === 'COMPLETE_TIER_1' || payload.forceTier === 'tier-1' || payload.skipTier25) {
  // Force Mode logic moved outside regular flow
}
```

### Frontend Changes (`src/services/SimpleImageService.ts`)

**Enhanced `generateWithTemplate()` method:**
- Now tries both 2.5C and 2.5D nuclear templates in sequence
- Each template gets its own complexity parameter
- Proper fallback chain: 2.5C → 2.5D → SVG fallback

**Key Changes:**
```typescript
// Try nuclear templates in order: 2.5C → 2.5D
const templates = [
  { complexity: 'C', tierName: 'TIER_2_5C_TEMPLATE' },
  { complexity: 'D', tierName: 'TIER_2_5D_TEMPLATE' }
];

for (const template of templates) {
  try {
    const { data: templateResult, error: templateError } = await supabase.functions.invoke('runware-template-cd', {
      body: {
        pageText: storyText.trim().substring(0, 3000),
        userInfo,
        sessionId: normalizedSessionId,
        pageNumber,
        isGuestUser: !isPremium,
        difficultyLevel: this.mapDifficultyLevel(userInfo),
        templateComplexity: template.complexity // ← KEY FIX
      }
    });
    // Success handling...
  } catch (error) {
    // Continue to next template if this one fails
  }
}
```

## Escalation Flow - Fixed

### Regular Flow (Non-Force Mode)
```
Client → Orchestrator → Tier 1 → 2.5A → 2.5B → 2.5C → 2.5D → Client (Tier 4 fallback)
```

### Orchestrator Failure (503)
```
Client → Orchestrator (fails) → Client calls Direct Mode → Client calls 2.5C → Client calls 2.5D → Client (Tier 4 fallback)
```

### Force Mode (Testing)
```
Client → Orchestrator → Direct Mode → 2.5C → 2.5D → Client (Tier 4 fallback)
```

## Verification

### Backend Logs Show Proper Escalation:
- ✅ Tier 1 attempt
- ✅ 2.5A escalation on Tier 1 failure
- ✅ 2.5B escalation on 2.5A failure
- ✅ Nuclear templates (2.5C → 2.5D) on 2.5B failure

### Frontend Handles Orchestrator Failures:
- ✅ Direct Mode attempt when orchestrator returns 503
- ✅ 2.5C attempt when Direct Mode fails
- ✅ 2.5D attempt when 2.5C fails
- ✅ SVG fallback when all nuclear templates fail

## Files Modified

1. **`supabase/functions/runware-generate-image/index.js`** (lines 755-822)
   - Moved unreachable escalation logic outside catch block
   - Added proper 2.5B escalation step
   - Called `tryNuclearTemplates()` in regular flow

2. **`src/services/SimpleImageService.ts`** (lines 590-686)
   - Enhanced `generateWithTemplate()` to try both 2.5C and 2.5D
   - Added `templateComplexity` parameter for nuclear templates
   - Improved error handling and logging

## Impact

- **Fixed:** Complete tier escalation system now works properly
- **Fixed:** Nuclear templates are now accessible in regular flow
- **Fixed:** 2.5B tier is now properly utilized
- **Enhanced:** Frontend can handle orchestrator failures with direct tier calls
- **Improved:** Better error logging and debugging capabilities

## Testing Status

- ✅ Regular escalation flow: Tier 1 → 2.5A → 2.5B → 2.5C → 2.5D
- ✅ Force Mode logic preserved and functional
- ✅ Frontend nuclear template fallbacks working
- ✅ Orchestrator failure detection and escalation working

## Date: September 25, 2025
## Status: IMPLEMENTED AND VERIFIED