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

## ✅ CORRECT SOLUTION: Direct Relative Imports

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

---

## 📋 Import Pattern Decision Matrix

| File Location | Import Type | Correct Pattern | Never Use |
|--------------|-------------|-----------------|-----------|
| Local `_shared/` | Static | `import { X } from "../_shared/file.ts"` | `#shared/file.ts` |
| Local `_shared/` | Dynamic | `await import("../_shared/file.ts")` | `new URL(..., import.meta.url)` |
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

**Accept** only these patterns:

```typescript
// ✅ ACCEPT: Direct relative import
const module = await import("../_shared/file.ts");

// ✅ ACCEPT: memoizedImport for CDN
const { memoizedImport } = await import("../_shared/resilientLoader.ts");
const pkg = await memoizedImport("https://esm.sh/package");
```

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
