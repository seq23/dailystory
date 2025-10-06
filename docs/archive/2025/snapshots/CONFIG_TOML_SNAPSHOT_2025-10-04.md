# supabase/config.toml Configuration Snapshot (2025-10-04)

## Purpose
This document captures the CORRECT configuration for functions requiring bundler configuration to prevent future regressions.

## Critical Configuration Pattern

All functions using:
- Receptionist architecture (dynamic imports)
- Shared service imports from `_shared/`
- Vendor fallback imports from `_vendor/`

MUST have this configuration:

```toml
[functions.function-name]
verify_jwt = false  # or true, depending on function
import_map = "./deno.jsonc"
```

## Functions Requiring import_map

Based on TIER_1_IMPORT_FAILURE_POSTMORTEM.md, these functions require `import_map`:

### ✅ Functions Requiring import_map

**runware-template-ab** requires `import_map` because its `index.js` has static imports from `_shared/`:

```toml
[functions.runware-template-ab]
verify_jwt = false
import_map = "../deno.jsonc"
```

**runware-template-cd** does NOT require `import_map` (it uses only lazy-loading):

```toml
[functions.runware-template-cd]
verify_jwt = false
```

**Path Resolution Note:** Use `../deno.jsonc` because the path is relative to `supabase/functions/<function-name>/`, and `deno.jsonc` lives one level up at `supabase/functions/deno.jsonc`.

## Why import_map is Required

1. **Bundler Configuration**: Points to `supabase/functions/deno.jsonc`
2. **Include Paths**: `deno.jsonc` specifies `include: ["**/*.ts", "**/*.js", "_shared/**/*", "_vendor/**/*"]`
3. **Dynamic Import Support**: Ensures dynamically imported modules are bundled at deploy time
4. **Production Reliability**: Without this, dynamic imports fail with "Module not found"

## The Problem This Solves

### Symptom
```
[TIER_1] Failed: Module not found: file:///home/runner/work/dailystory/dailystory/supabase/functions/_shared/RunwareWebSocketService.ts
```

### Root Cause
Without `import_map = "./deno.jsonc"`:
- Deno Deploy's bundler doesn't know to include dynamically imported files
- Receptionist pattern's `await import("./index.js")` fails at runtime
- Vendor fallback's `await import("../_shared/...")` fails at runtime

### Solution
Adding `import_map = "./deno.jsonc"` tells the bundler:
- "Include ALL files matching patterns in deno.jsonc"
- This includes `**/*.ts`, `**/*.js`, `_shared/**/*`, `_vendor/**/*`
- Dynamic imports succeed because files are present in deployment

## Testing Verification

To verify correct configuration:

1. **Deploy functions** (automatic with Lovable)
2. **Navigate to** `/prompt-testing?debug=1`
3. **Check health status** for these patterns:
   - ✅ `GET (Health Check) Status 200 HEALTHY`
   - ✅ `POST (Runtime Test) Status 200 SUCCESS`

4. **Check edge function logs** for success patterns:
   - ✅ `Handler loaded successfully` (receptionist functions)
   - ✅ `[CCS_IMPORT] _shared loaded successfully` (CCS imports)
   - ✅ `[VENDOR_FALLBACK] Loaded from _shared (bundled)` (vendor imports)

5. **Verify NO errors** like:
   - ❌ `Module not found: file:///.../_shared/...`
   - ❌ `Failed to load handler`
   - ❌ `GET (Health Check) Status 500`

## Common Mistakes to Avoid

❌ **DON'T**: Assume bundler will include files without `import_map`
❌ **DON'T**: Remove `import_map` during config cleanup
❌ **DON'T**: Create per-function `deno.jsonc` files (use shared one)
❌ **DON'T**: Test only in local development (bundling differs in production)

✅ **DO**: Use `import_map = "./deno.jsonc"` for all functions with dynamic imports
✅ **DO**: Test in production-like environment (Lovable preview) before releasing
✅ **DO**: Check edge function logs for import success/failure
✅ **DO**: Add `import_map` for NEW functions following receptionist pattern

## October 6, 2025 - Cross-Function Import Configuration

### Functions Requiring import_map for Inline Service Imports:

**ai-visual-scene-creator** requires `import_map` because it imports from orchestrator:
```toml
[functions.ai-visual-scene-creator]
verify_jwt = false
import_map = "./deno.jsonc"
```

**runware-template-ab** requires `import_map` because it imports from orchestrator:
```toml
[functions.runware-template-ab]
verify_jwt = false
import_map = "./deno.jsonc"
```

**Reason**: Cross-function imports (importing `CharacterConsistencyServiceInline.js` from `runware-generate-image` into other functions) require bundler configuration to include files from other function directories.

**Critical Rule**: Any function importing from another function's directory MUST have `import_map = "./deno.jsonc"` in config.toml.

## Receptionist Architecture Functions

Functions using the V4.3 Receptionist Architecture pattern require `import_map`:

**Pattern**: `index.ts` (receptionist) dynamically imports `index.js` (handler)

```typescript
// index.ts - Receptionist (always present)
const mod = await import("./index.js");
const handler = mod.default || mod.handler;
```

**Why**: Without `import_map`, Deno Deploy doesn't bundle `index.js`, causing runtime failures.

**Functions Using This Pattern**:
- `runware-generate-image` ✅
- `runware-template-ab` ✅
- `runware-template-cd` ✅

## Related Documentation

- `docs/TIER_1_IMPORT_FAILURE_POSTMORTEM.md` - Original incident and fix
- `docs/WHY_SHARED_IMPORTS_DONT_WORK.md` - Import patterns and limitations
- `docs/RECEPTIONIST_ARCHITECTURE_AND_STATIC_IMPORTS.md` - Receptionist pattern details
- `supabase/functions/deno.jsonc` - The bundler configuration file

## Configuration Audit History

- **2025-10-03**: `import_map` added to `runware-generate-image` (postmortem fix)
- **2025-10-04**: `import_map` added to `runware-template-ab` and `runware-template-cd` (regression fix)
- **2025-10-04**: Configuration snapshot document created

## Last Verified

- **Date**: 2025-10-04
- **Status**: CONFIGURATION UPDATED
- **Tested**: Awaiting deployment verification
- **Next Review**: When new receptionist functions are added

## Deployment Checklist

When adding NEW receptionist functions:

- [ ] Create `index.ts` (receptionist with LKG pattern)
- [ ] Create `index.js` (actual handler implementation)
- [ ] Add function to `supabase/config.toml`
- [ ] Add `import_map = "./deno.jsonc"` line
- [ ] Test with `/prompt-testing?debug=1`
- [ ] Verify health check returns 200 HEALTHY
- [ ] Verify runtime test returns 200 SUCCESS
- [ ] Check logs for "Handler loaded successfully"
- [ ] Update this document with new function
