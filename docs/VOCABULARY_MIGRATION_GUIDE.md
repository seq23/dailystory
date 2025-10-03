# Vocabulary System Migration Guide

## Overview
Time2Read's vocabulary system was consolidated from scattered exports to a single `UNIVERSAL_VOCAB` structure on October 3, 2025.

## Old Property Name → New Property Name

| Old Export | New Property | Notes |
|-----------|-------------|-------|
| `CLOTHING_DETECTION_KEYWORDS` | `UNIVERSAL_VOCAB.clothing` | Alias still available for backward compat |
| `EXPANDED_COLOR_ARRAY` | `UNIVERSAL_VOCAB.colors` | Alias still available |
| `TIER_25_UNIFIED_VOCABULARY_EXTENDED.actions.basic` | `UNIVERSAL_VOCAB.actions` | Flat array now |
| `TIER_25_UNIFIED_VOCABULARY_EXTENDED.objectCategories.toys` | `UNIVERSAL_VOCAB.objects.toys` | Cleaner path |
| `TIER_25_UNIFIED_VOCABULARY_EXTENDED.contextDetection.indoor` | `UNIVERSAL_VOCAB.context.indoor` | Simpler nesting |

## Code Examples

### Before (Old Pattern - AVOID):
```javascript
import { TIER_25_UNIFIED_VOCABULARY_EXTENDED, CLOTHING_DETECTION_KEYWORDS } from './tier25Vocabulary.js';

for (const item of CLOTHING_DETECTION_KEYWORDS) {
  // May crash if import fails or array is undefined
}
```

### After (New Pattern - RECOMMENDED):
```javascript
import { UNIVERSAL_VOCAB } from './tier25Vocabulary.js';

if (Array.isArray(UNIVERSAL_VOCAB.clothing)) {
  for (const item of UNIVERSAL_VOCAB.clothing) {
    // Safe iteration with guard
  }
} else {
  console.warn('⚠️ vocabulary clothing array unavailable');
}
```

## Required Changes for Safe Code

### 1. Add Array.isArray() Guards
**Always** check array validity before iteration:
```javascript
// ❌ UNSAFE - May crash with "is not iterable"
for (const color of vocab.colors) { }

// ✅ SAFE - Protected with guard
if (Array.isArray(vocab.colors)) {
  for (const color of vocab.colors) { }
} else {
  console.warn('⚠️ vocab.colors unavailable');
}
```

### 2. Gate Verbose Logging
Only show per-item logs in debug mode:
```javascript
// ❌ NOISY - Logs on every detection
console.log(`🎨 Detected: ${item}`);

// ✅ CLEAN - Only logs when debugging
if (Deno.env.get('LOG_LEVEL') === 'debug') {
  console.log(`🎨 Detected: ${item}`);
}
```

### 3. Use Backward Compatibility Aliases
For gradual migration, aliases are available:
```javascript
// Legacy code can still use old property names
this.vocabulary.CLOTHING_DETECTION_KEYWORDS = this.vocabulary.clothing;
```

## Files Already Migrated
- ✅ CharacterConsistencyService.js (Phase 2)
- ✅ CharacterConsistencyService.ts (Phase 3)
- ✅ ColoredObjectTracker.js (Phase 4)

## Files Using Backward Compatibility Aliases (No Action Needed)
- UnifiedPlaceholderResolver.js (uses alias)
- CrossPageConsistencyIntelligence.js (uses alias)
- ExactWordExtractor.js (uses extended structure)
- UnifiedDebugValidator.js (uses extended structure)

## Benefits of Migration

| Aspect | Before | After |
|--------|--------|-------|
| **Imports** | 3+ named exports | 1 UNIVERSAL_VOCAB |
| **Structure** | Deeply nested objects | Flat, predictable paths |
| **Safety** | No guards, crashes possible | Array.isArray() guards everywhere |
| **Logging** | Verbose always-on logs | Gated behind LOG_LEVEL |
| **Maintenance** | Scattered changes needed | Single source updates |

## Troubleshooting

### "vocab.colors is not iterable" Error
**Cause**: Missing Array.isArray() guard  
**Fix**: Add guard before loop:
```javascript
if (!Array.isArray(vocab.colors)) {
  console.warn('⚠️ vocab.colors unavailable');
  return; // or handle gracefully
}
```

### Import Failures
**Cause**: Using old export names  
**Fix**: Update to UNIVERSAL_VOCAB:
```javascript
// Old
const { TIER_25_UNIFIED_VOCABULARY_EXTENDED } = await import('./tier25Vocabulary.js');

// New
const { UNIVERSAL_VOCAB } = await import('./tier25Vocabulary.js');
```

### Excessive Logging
**Cause**: Verbose logs not gated  
**Fix**: Gate with LOG_LEVEL check:
```javascript
if (Deno.env.get('LOG_LEVEL') === 'debug') {
  console.log('Verbose debug info');
}
```

## Testing Checklist

After migration, verify:
- [ ] No "is not iterable" errors in edge function logs
- [ ] Image generation works (Test Connectivity)
- [ ] Character consistency tracking works
- [ ] Colored object detection works
- [ ] Logs are clean (no verbose spam unless LOG_LEVEL=debug)
- [ ] Backward compatibility maintained (existing code still works)

## Related Documentation
- `docs/MASTER_ERRORS_TO_FIX.md` - ERROR-071 resolution details
- `supabase/functions/_shared/tier25Vocabulary.js` - Vocabulary source
- `docs/CCS_RUNTIME_VERIFICATION_2025-10-02.md` - Character service integration
