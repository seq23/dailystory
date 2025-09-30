# Character Consistency Status by Tier

**Last Updated**: 2025-09-30

This document tracks the status of Character Consistency Service integration across all image generation tiers.

---

## Overview

The **CharacterConsistencyService** provides:
- Stable character appearance across story pages
- Avatar identity preservation (ethnicity, features, clothing)
- Secondary character tracking (parents, siblings, friends)
- Colored object persistence (red ball, blue backpack, etc.)
- Setting context consistency (home, school, park)

---

## Current Status by Tier

### ✅ Tier 1 (Orchestrator with CharacterConsistencyService)
**Status**: FIXED - Now properly loading via import map

**Details**:
- ✅ Uses `#shared/CharacterConsistencyService.js` import map
- ✅ Loads singleton instance: `characterConsistencyService`
- ✅ Full character appearance tracking across pages
- ✅ Avatar identity preservation
- ✅ Colored object detection and persistence
- ✅ Secondary character consistency

**Import Path**: `#shared/CharacterConsistencyService.js`
**Edge Function**: `runware-generate-image/index.ts`

---

### ✅ Direct Mode (AI Visual Scene Creator with CharacterConsistencyService)
**Status**: FIXED - Now properly loading via import map

**Details**:
- ✅ Uses `#shared/CharacterConsistencyService.js` import map
- ✅ Conditional loading (only for Direct Mode)
- ✅ Falls back gracefully if service unavailable
- ✅ Generates AI visual schemas with character consistency when healthy

**Import Path**: `#shared/CharacterConsistencyService.js`
**Edge Function**: `ai-visual-scene-creator/index.ts`

---

### ⚠️ Template CD (Nuclear Fallback)
**Status**: NO CHARACTER CONSISTENCY (by design)

**Details**:
- ⚠️ Pure hardcoded templates
- ⚠️ No dynamic character tracking
- ⚠️ No avatar identity preservation
- ✅ Guaranteed to work (emergency fallback)
- ✅ Basic quality without advanced features

**Edge Function**: `runware-template-cd/index.js`

---

## Import Map Configuration

The project uses Deno import maps configured in `supabase/deno.json`:

```json
{
  "imports": {
    "#types/": "./supabase/functions/_shared/types/",
    "#shared/": "./supabase/functions/_shared/"
  }
}
```

**Usage**:
```typescript
// ✅ CORRECT - Uses import map
import { characterConsistencyService } from '#shared/CharacterConsistencyService.js';

// ❌ WRONG - Relative path (fails in deployment)
import { characterConsistencyService } from '../_shared/CharacterConsistencyService.js';
```

---

## Export Structure

**File**: `supabase/functions/_shared/CharacterConsistencyService.js`

**Export**:
```javascript
// Exports singleton instance (NOT class constructor)
export const characterConsistencyService = CharacterConsistencyService.getInstance();
```

**Usage**:
```typescript
const { characterConsistencyService } = await import('#shared/CharacterConsistencyService.js');

// Service is already instantiated - use directly
const appearance = await characterConsistencyService.getCharacterAppearanceFromStory(
  sessionId, 
  characterName
);
```

---

## Testing Character Consistency

### E2E User Simulation
1. Go to `/prompt-testing?debug=1`
2. Find "E2E User Simulation" section
3. **Disable "Smart Bypass"** toggle
4. Click "Run E2E User Simulation"
5. Check "Routing Steps" for:
   - `✅ Character consistency active` (Tier 1 healthy)
   - `⚠️ Character consistency NOT active` (fallback mode)

### Force Tier 1 Button
1. Go to `/prompt-testing?debug=1`
2. Find "Force Tier 1" section
3. Click "Force Tier 1"
4. Check logs for:
   - `[TIER_1] CharacterConsistencyService loaded successfully`
   - Or: `[TIER_1] CharacterConsistencyService failed: [error]`

---

## Troubleshooting

### "Module not found" Errors
**Symptom**: `Module not found: file:///.../_shared/CharacterConsistencyService.js`

**Solution**: Verify import uses `#shared/` import map:
```typescript
// ✅ Correct
import { characterConsistencyService } from '#shared/CharacterConsistencyService.js';
```

### "CharacterConsistencyService instance not functional"
**Symptom**: Service loaded but missing methods

**Solution**: Check export structure - should export singleton instance, not class

### Cascade to Direct Mode on Every Request
**Symptom**: Tier 1 always fails, always uses Direct Mode

**Solution**: 
1. Check edge function logs for import errors
2. Verify `#shared/` import map is used
3. Ensure `CharacterConsistencyService.js` is deployed to `_shared` folder

---

## Architecture Decisions

### Why Import Maps Instead of Relative Paths?
- ✅ Supabase Edge Functions deploy to isolated environments
- ✅ Relative paths can fail due to module resolution
- ✅ Import maps provide stable, canonical paths
- ✅ Configured once in `deno.json`, used everywhere

### Why Singleton Instance Instead of Class Export?
- ✅ Single source of truth for character cache
- ✅ Prevents multiple instances with separate state
- ✅ Simpler usage (no need to call `.getInstance()`)
- ✅ Consistent with image generation architecture

### Why Graceful Degradation?
- ✅ System continues working even if character consistency fails
- ✅ Users get images (albeit without advanced features)
- ✅ Prevents complete system failure from single service issue
- ✅ Fallback path clearly indicated in metadata

---

## Related Documentation

- [Type System Architecture](./TYPE_SYSTEM_ARCHITECTURE.md)
- [Character Consistency Architecture](./CHARACTER_CONSISTENCY_ARCHITECTURE.md)
- [Escalation Logic Fix](./ESCALATION_LOGIC_FIX_2025_09_26.md)
