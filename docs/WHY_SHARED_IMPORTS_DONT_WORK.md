# Why #shared/ and import.meta.url Patterns Don't Work in Edge Functions

## ⚠️ CRITICAL: Two Import Anti-Patterns

This document explains **two separate import issues** that have been tried multiple times and consistently fail in Supabase Edge Functions.

---

## 🚫 Anti-Pattern 1: #shared/ Import Map Aliases

### The Problem

Deno import maps (configured in `supabase/deno.json`) **don't work with dynamic `import()` statements** in Supabase Edge Functions.

### Configuration Example

```json
{
  "imports": {
    "#shared/": "./supabase/functions/_shared/"
  }
}
```

### What Works vs What Fails

✅ **WORKS** - Static imports:
```typescript
import { something } from "#shared/file.ts"; 
```

❌ **FAILS** - Dynamic imports:
```typescript
const module = await import("#shared/file.ts"); // Runtime error!
```

### Why It Fails

- **Compilation**: Import maps are resolved during Deno's compilation/bundling phase
- **Runtime**: At runtime in Edge Functions, `import()` tries to fetch `#shared/file.ts` as a literal URL
- **Result**: "Module not found" error because `#shared/` doesn't exist as a real path

### Historical Context

**ERROR-046**: First attempt to use `#shared/` aliases failed in production with "Module not found" errors
**ERROR-052**: Second attempt with different configuration also failed  
**ERROR-053**: Final decision to use relative paths `../_shared/` as standard

---

## 🚫 Anti-Pattern 2: import.meta.url for Local Files

### The Problem

Using `new URL(relativePath, import.meta.url).href` creates **absolute `file://` paths** that cannot be imported in Deno edge functions.

### What Fails

❌ **FAILS** - URL-based local imports:
```typescript
const moduleUrl = new URL("../_shared/service.ts", import.meta.url).href;
// Creates: file:///home/runner/work/dailystory/dailystory/supabase/functions/_shared/service.ts
const { Service } = await import(moduleUrl); // Cannot import file:// URLs!
```

### Why It Fails

- **Deno Limitation**: `import.meta.url` creates `file:///absolute/path` URLs
- **Edge Function Runtime**: Cannot dynamically import local files via `file://` protocol
- **Result**: "Module not found" error even though the file exists

### When import.meta.url DOES Work

✅ **WORKS** - External HTTP/HTTPS URLs:
```typescript
// This is fine - importing from CDN
const cdnUrl = new URL("package@version", "https://cdn.skypack.dev/").href;
const module = await import(cdnUrl);
```

❌ **FAILS** - Local file system paths:
```typescript
// This fails - local file import
const localUrl = new URL("./module.ts", import.meta.url).href;
const module = await import(localUrl); // ERROR!
```

### Historical Context

**ERROR-048**: Production outage when `runware-generate-image` used `new URL("../_shared/RunwareWebSocketService.ts", import.meta.url).href`
- **Impact**: All Tier 1 Complete attempts failing with "Module not found"
- **Resolution**: Changed to direct relative import: `await import("../_shared/RunwareWebSocketService.ts")`

---

## ✅ CORRECT SOLUTION: Direct Relative Imports + Vendor Bundles

### For Local TypeScript Files

**Always use direct relative path imports:**

```typescript
// ✅ CORRECT - Works in all contexts
import { Service } from "../_shared/Service.ts";
const { Service } = await import("../_shared/Service.ts");
```

### For External CDN Packages

**Use memoizedImport with HTTP/HTTPS URLs:**

```typescript
// ✅ CORRECT - Use resilient loader for CDN packages
const { memoizedImport } = await import("../_shared/resilientLoader.ts");
const supabase = await memoizedImport("https://esm.sh/@supabase/supabase-js@2.57.4");
```

### **NEW: Vendor Bundles for Critical Internal Modules (2025-10-03)**

**For critical shared services that must be 100% reliable:**

```typescript
// ✅ CORRECT - Two-tier fallback pattern
let service;
try {
  // Tier 1: Try bundled _shared version
  const sharedModule = await import("../_shared/CharacterConsistencyService.js");
  service = sharedModule.characterConsistencyService;
  console.log(`✅ Loaded from _shared (bundled)`);
} catch (sharedError) {
  // Tier 2: Vendor bundle fallback
  console.warn(`⚠️ _shared import failed, using vendor bundle:`, sharedError);
  const vendorModule = await import("../_vendor/CharacterConsistencyService.mjs");
  service = vendorModule.characterConsistencyService;
  console.log(`✅ Loaded from _vendor bundle`);
}
```

**Why Vendor Bundles for Internal Modules?**
- **Problem**: Deno Deploy sometimes fails to bundle `_shared/` modules
- **Solution**: Create `.mjs` copies in `_vendor/` as production fallback
- **Result**: 100% reliability even if bundler configuration fails
- **When to Use**: Critical services like CharacterConsistencyService, RunwareWebSocketService

---

## Solution Implemented (2025-10-03)

### Two-Tier Vendor Fallback for Internal Modules

**Phase 1**: Explicit Bundler Configuration
- Created `supabase/functions/deno.jsonc` with explicit `include` paths for `_shared/**/*.js` and `_vendor/**/*.mjs`
- Updated `supabase/config.toml` to add `import_map = "./deno.jsonc"` for:
  - `runware-generate-image` (Tier 1 orchestrator)
  - `runware-template-ab` (Tier 2.5A)
  - `runware-template-cd` (Tier 2.5C/2.5D)
  - `ai-visual-scene-creator` (Direct Mode)

**Phase 2**: Vendor Bundle for CharacterConsistencyService
- Created `supabase/functions/_vendor/CharacterConsistencyService.mjs` (copy of shared service)
- Implemented two-tier import pattern in critical functions:

```typescript
// Tier 1: Try _shared import (bundled)
let service;
try {
  const sharedModule = await import("../_shared/CharacterConsistencyService.js");
  service = sharedModule.characterConsistencyService;
  console.log(`✅ [CCS_IMPORT] _shared loaded successfully`);
} catch (sharedError) {
  // Tier 2: Vendor fallback for production reliability
  console.warn(`⚠️ [CCS_IMPORT] _shared import failed, trying _vendor:`, sharedError);
  try {
    const vendorModule = await import("../_vendor/CharacterConsistencyService.mjs");
    service = vendorModule.characterConsistencyService;
    console.log(`✅ [CCS_IMPORT] _vendor loaded successfully`);
  } catch (vendorError) {
    console.error(`❌ [CCS_IMPORT] both _shared and _vendor paths failed`, { sharedError, vendorError });
    throw new Error(`CCS_IMPORT_FAILURE: both paths failed`);
  }
}
```

**Phase 3**: Explicit Logging for Verification
- Added deployment marker: `DEPLOY_MARKER: 2025-10-03T18:50:00Z`
- Added explicit logs to prove which import path is used:
  - `✅ [CCS_IMPORT] _shared loaded successfully` - Bundled import worked
  - `✅ [CCS_IMPORT] _vendor loaded successfully` - Vendor fallback used
  - `❌ [CCS_IMPORT] both paths failed` - Total failure (should never happen)

**Phase 4**: Direct Mode Enhancement
- Applied same two-tier import pattern to `ai-visual-scene-creator` in two locations:
  - `getStructuredAvatarData` (line ~54)
  - `getSecondaryCharactersForSession` (line ~317)
- Added `[CCS_IMPORT_DM]` logs to distinguish Direct Mode imports

**Phase 5**: Timeout Increase for Verification
- Temporarily increased Direct Mode timeout from 15s → 20s
- Allows distinguishing CCS import failures from legitimate Direct Mode timeouts
- Will revert to 15s after verification confirms vendor fallback works

### Verification
See [TIER1_IMPORT_RESOLUTION_VERIFICATION_2025-10-03.md](./TIER1_IMPORT_RESOLUTION_VERIFICATION_2025-10-03.md) for:
- Test plan (3 verification runs)
- Expected logs
- Success criteria
- Rollback plan

### Related Documentation
- [TIER_1_IMPORT_FAILURE_POSTMORTEM.md](./TIER_1_IMPORT_FAILURE_POSTMORTEM.md) - Root cause analysis
- [CCS_RUNTIME_VERIFICATION_2025-10-02.md](./CCS_RUNTIME_VERIFICATION_2025-10-02.md) - CCS method verification

---

## 📋 Import Pattern Decision Matrix

| File Location | Import Type | Correct Pattern | Never Use |
|--------------|-------------|-----------------|-----------|
| Local `_shared/` | Static | `import { X } from "../_shared/file.ts"` | `#shared/file.ts` |
| Local `_shared/` | Dynamic | `await import("../_shared/file.ts")` | `new URL(..., import.meta.url)` |
| Local `_shared/` | Critical Dynamic | Two-tier: `_shared/` → `_vendor/` fallback | Direct `file://` paths |
| External CDN | Dynamic | `memoizedImport("https://cdn/pkg")` | Direct `fetch()` |

---

## 🛡️ Prevention Guidelines

### Code Review Checklist

When reviewing edge function code, **reject** these patterns:

```typescript
// ❌ REJECT: #shared/ alias in dynamic import
const module = await import("#shared/file.ts");

// ❌ REJECT: import.meta.url for local files  
const url = new URL("../_shared/file.ts", import.meta.url).href;
const module = await import(url);

// ❌ REJECT: #shared/ in any dynamic context
const path = "#shared/file.ts";
const module = await import(path);
```

**Accept** these patterns:

```typescript
// ✅ ACCEPT: Direct relative import
const module = await import("../_shared/file.ts");

// ✅ ACCEPT: memoizedImport for CDN
const { memoizedImport } = await import("../_shared/resilientLoader.ts");
const pkg = await memoizedImport("https://esm.sh/package");

// ✅ ACCEPT: Two-tier vendor fallback (NEW 2025-10-03)
let service;
try {
  const module = await import("../_shared/CriticalService.js");
  service = module.service;
} catch (error) {
  const vendorModule = await import("../_vendor/CriticalService.mjs");
  service = vendorModule.service;
}
```

---

## 🔧 Special Case: Local Shim for resilientLoader (2025-10-12)

**For `runware-generate-image` function specifically:**

Cross-folder dynamic imports of `../_shared/resilientLoader.js` intermittently fail in production, causing non-2xx errors. Solution: always route through a local shim file that re-exports the shared version.

```typescript
// ✅ CORRECT - Use local shim in runware-generate-image
const { createVendorFirstSupabaseClient } = await memoizedImport("./resilientLoader.js");

// ❌ WRONG - Cross-folder import can fail
const { createVendorFirstSupabaseClient } = await memoizedImport("../_shared/resilientLoader.js");
```

**Implementation:**
- Local shim file: `supabase/functions/runware-generate-image/resilientLoader.js`
- Contents: `export * from "../_shared/resilientLoader.js";`
- Always add runtime guard after import:

```typescript
if (!createVendorFirstSupabaseClient || typeof createVendorFirstSupabaseClient !== 'function') {
  console.warn('⚠️ resilientLoader missing/invalid - using console-only logger');
  return createConsoleOnlyLogger(isProd);
}
```

**Why:**
- Logging/analytics is best-effort and must never block image generation with non-2xx errors
- Local shim bypasses Deno's cross-folder resolution issues
- Guard ensures graceful degradation when loader unavailable

---

## 📚 Related Documentation

- **ERROR-046**: CharacterConsistencyService import map failure
- **ERROR-048**: RunwareWebSocketService import.meta.url failure  
- **ERROR-052**: Second attempt at #shared/ aliases
- **ERROR-053**: Final standardization on relative paths

---

## 🔗 Reference Links

- `docs/MASTER_ERRORS_TO_FIX.md` - Complete error history
- `supabase/functions/README.md` - Edge function import guidelines
- `docs/RECEPTIONIST_ARCHITECTURE_AND_STATIC_IMPORTS.md` - Architecture patterns

---

## 📅 Document History

- **Created**: 2025-10-03 (after ERROR-046, ERROR-048, ERROR-052, ERROR-053)
- **Purpose**: Prevent future attempts to use #shared/ aliases or import.meta.url for local files
- **Status**: **PERMANENT REFERENCE** - These patterns have failed 4+ times in production
