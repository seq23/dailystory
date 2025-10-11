# Vendor Bundle Directory - CRITICAL NAMING RULES

## Purpose
This directory contains LOCAL copies of external dependencies to eliminate network dependency and provide 0ms import times.

## File Naming Convention (STRICTLY ENFORCED)

All vendor bundles MUST follow this pattern:
```
{package-name}@{version}.bundle.mjs
```

Examples:
- ✅ `supabase-js@2.57.4.bundle.mjs`
- ✅ `openai@4.28.0.bundle.mjs`
- ❌ `supabase-js@2.57.4.mjs` (MISSING .bundle - WILL BREAK IMPORTS)

## Critical Incident: 2025-10-11 Filename Mismatch

**Issue**: Vendor bundle was named `supabase-js@2.57.4.bundle.mjs` but all imports used `supabase-js@2.57.4.mjs`

**Impact**:
- 100% vendor-first failure rate
- All operations forced to network CDN (7-28 second delays)
- Complete bypass of 0ms vendor architecture
- Tier 1 and Direct Mode both failed every time

**Root Cause**: Filename inconsistency between actual file and import statements

**Prevention**: 
1. Always use `.bundle.mjs` extension
2. Run validation script before deployment
3. Test vendor-first-selftest endpoint (includes import check)

## Validation Script

Before deploying changes:
```bash
deno run --allow-read supabase/functions/_vendor/validate-vendor-imports.js
```

This scans all function files and verifies import paths match actual vendor files.

## Import Examples

### Correct Import (0ms delay)
```typescript
const { createClient } = await import('../_vendor/supabase-js@2.57.4.bundle.mjs');
```

### Incorrect Import (fails silently, forces network fallback)
```typescript
const { createClient } = await import('../_vendor/supabase-js@2.57.4.mjs'); // ❌ WRONG
```

## Files Using Vendor Bundles

All these files import vendor bundles and MUST use correct filename:
1. `_shared/resilientLoader.js` - Primary client creation functions
2. `_shared/resilientLoader.ts` - TypeScript source
3. `_shared/CharacterConsistencyService.ts` - CCS direct imports
4. `runware-generate-image/CharacterConsistencyServiceInline.js` - Inlined CCS
5. `runware-generate-image/index.ts` - Import path mapping
6. `runware-template-cd/index.ts` - Template service fallbacks

## Maintenance Checklist

When adding new vendor bundles:
1. ✅ Name file with `.bundle.mjs` extension
2. ✅ Update CDN_FALLBACKS config in resilientLoader
3. ✅ Use exact filename in all import statements
4. ✅ Run validation script
5. ✅ Test vendor-first-selftest endpoint
6. ✅ Verify import success in edge logs

When updating existing vendor bundles:
1. ✅ Keep filename consistent (don't rename)
2. ✅ Search codebase for all import references
3. ✅ Verify all imports use same filename
4. ✅ Run validation script
5. ✅ Test vendor-first-selftest endpoint

## Monitoring

Search edge logs weekly for:
- "Vendor bundle failed" - indicates import issue
- "Module not found" - indicates filename mismatch
- "Import timeout" - indicates CDN fallback triggered

Any occurrence warrants immediate investigation.
