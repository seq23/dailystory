# Resilient Import System Documentation

## ✅ MIGRATION COMPLETE

**Status**: All edge functions successfully migrated to resilient import system  
**Remaining esm.sh imports**: 0  
**Build Status**: ✅ PASSING  
**Last Updated**: 2025-01-30T12:00:00Z  

### Recently Completed (2025-01-30):
- ✅ Fixed `create-checkout/index.ts` - Migrated Stripe and Supabase imports
- ✅ Fixed `create-premium-subscription/index.ts` - Migrated Stripe import  
- ✅ Fixed `customer-portal/index.ts` - Migrated Stripe and Supabase imports
- ✅ Fixed `CharacterConsistencyService.ts` - Replaced 3 esm.sh imports
- ✅ Fixed `PhaseIntegrationOrchestrator.js` - Fixed incorrect deno.land import
- ✅ Fixed `ThemeLibraryService.ts` - Fixed Node.js require() to Deno import
- ✅ All 24 edge functions now use consistent resilient patterns

## System Overview

The Resilient Import System provides a robust way to import external dependencies in Supabase Edge Functions, with automatic CDN fallbacks, memoization, and structured error handling. **The system is now fully operational across all edge functions.**

## Core Components

### 1. Multi-CDN Fallback Configuration

```typescript
const CDN_FALLBACKS = {
  '@supabase/supabase-js': {
    primary: 'https://deno.land/x/supabase@2.0.2/mod.ts',
    fallbacks: [
      'https://esm.sh/@supabase/supabase-js@2.55.0?pin=v135',
      'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.55.0/+esm',
      'https://unpkg.com/@supabase/supabase-js@2.55.0?module'
    ]
  },
  'openai': {
    primary: 'https://deno.land/x/openai@v4.28.0/mod.ts',
    fallbacks: [
      'https://esm.sh/openai@4.28.0?pin=v135',
      'https://cdn.jsdelivr.net/npm/openai@4.28.0/+esm',
      'https://unpkg.com/openai@4.28.0?module'
    ]
  }
};
```

### 2. Enhanced memoizedImport Function

- **Caching**: Prevents duplicate imports of the same package
- **Failure Tracking**: Remembers failed imports to avoid retries
- **Fallback Cascade**: Automatically tries alternative CDNs on failure

### 3. createResilientSupabaseClient

Pre-configured Supabase client factory with resilient loading:

```typescript
const supabase = await createResilientSupabaseClient();
```

## Usage Patterns

### 1. Edge Function Implementation

**✅ CORRECT Pattern:**
```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { memoizedImport, createResilientSupabaseClient } from '../_shared/resilientLoader.ts';

serve(async (req) => {
  try {
    // Load Supabase client
    const supabase = await createResilientSupabaseClient();
    
    // Load external APIs inside handler
    const { default: Stripe } = await memoizedImport('stripe');
    const { Configuration, OpenAIApi } = await memoizedImport('openai');
    
    // Use the loaded modules...
    
  } catch (error) {
    // Structured error handling with 503 response
    return createImportFailureResponse(error, 'function-name');
  }
});
```

**❌ INCORRECT Pattern:**
```typescript
// Don't do this - fragile top-level imports
import Stripe from 'https://esm.sh/stripe@12.0.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0';
```

### 2. Class-Based Services

**✅ CORRECT Pattern:**
```typescript
export class MyService {
  private supabase: any;

  async initialize() {
    if (!this.supabase) {
      this.supabase = await createResilientSupabaseClient();
    }
    return this.supabase;
  }

  async someMethod() {
    await this.initialize();
    // Use this.supabase...
  }
}
```

**❌ INCORRECT Pattern:**
```typescript
export class MyService {
  constructor() {
    // Don't do this - synchronous import in constructor
    this.supabase = createClient(url, key);
  }
}
```

## CDN Hierarchy

The system tries CDNs in this order:

1. **Primary CDN** (Deno.land/JSR) - Best performance and reliability
2. **esm.sh** (pinned versions) - Good compatibility
3. **jsDelivr** - Fast global CDN
4. **unpkg** - Fallback option

## Error Handling

### 1. Structured 503 Responses

When imports fail, the system returns structured 503 responses:

```json
{
  "success": false,
  "error": "Service temporarily unavailable",
  "code": "IMPORT_FAILURE",
  "details": {
    "function": "function-name",
    "timestamp": "2025-01-27T10:00:00.000Z",
    "message": "Critical dependencies could not be loaded"
  }
}
```

### 2. CORS Headers Included

All error responses include proper CORS headers for frontend compatibility.

### 3. Retry-After Header

503 responses include `Retry-After: 300` header suggesting retry in 5 minutes.

## Best Practices

### 1. Import Inside Handlers

Always load external dependencies inside request handlers, not at the top level:

```typescript
serve(async (req) => {
  // ✅ Load inside handler
  const { OpenAI } = await memoizedImport('openai');
});
```

### 2. Initialize Services Properly

For class-based services, use async initialization:

```typescript
class MyTracker {
  private client: any;
  
  async initialize() {
    if (!this.client) {
      this.client = await createResilientSupabaseClient();
    }
  }
  
  async track() {
    await this.initialize();
    // Use this.client...
  }
}
```

### 3. Handle Import Failures Gracefully

```typescript
try {
  const service = await memoizedImport('external-service');
  // Use service...
} catch (error) {
  console.error('Service unavailable:', error);
  return createImportFailureResponse(error, 'my-function');
}
```

### 4. Use Type Imports Carefully

For TypeScript types, import them through the resilient loader:

```typescript
const { default: Stripe } = await memoizedImport('stripe');
// Stripe constructor is available as Stripe
```

## Debugging

### 1. Console Logging

The system provides detailed console logging for troubleshooting:

```
Primary CDN failed for openai: NetworkError
Trying fallback CDN: https://esm.sh/openai@4.28.0?pin=v135
Fallback CDN failed: https://esm.sh/openai@4.28.0?pin=v135
```

### 2. Cache Management

Clear the import cache for debugging:

```typescript
import { clearImportCache } from '../_shared/resilientLoader.ts';
clearImportCache(); // Clears both import and failure caches
```

## Migration Guide

### Migrating Existing Functions

1. **Replace top-level imports:**
   ```typescript
   // Old
   import { createClient } from 'https://esm.sh/@supabase/supabase-js';
   
   // New
   import { createResilientSupabaseClient } from '../_shared/resilientLoader.ts';
   ```

2. **Move client creation inside handlers:**
   ```typescript
   // Old
   const supabase = createClient(url, key);
   
   // New
   const supabase = await createResilientSupabaseClient();
   ```

3. **Add error handling:**
   ```typescript
   try {
     // Function logic
   } catch (error) {
     return createImportFailureResponse(error, 'function-name');
   }
   ```

## Monitoring

The system logs all import attempts and failures for monitoring:

- **Success**: Normal console logging
- **Failures**: Error console logging with fallback attempts
- **Cache hits**: Silent (performance optimization)

## Configuration

### Adding New Packages

To add support for a new package, extend the CDN_FALLBACKS configuration:

```typescript
const CDN_FALLBACKS = {
  // Existing packages...
  'new-package': {
    primary: 'https://deno.land/x/new-package@1.0.0/mod.ts',
    fallbacks: [
      'https://esm.sh/new-package@1.0.0?pin=v135',
      'https://cdn.jsdelivr.net/npm/new-package@1.0.0/+esm',
      'https://unpkg.com/new-package@1.0.0?module'
    ]
  }
};
```

## Security Considerations

- All CDNs use HTTPS
- Version pinning prevents supply chain attacks
- Import failures are logged for security monitoring
- No dynamic imports from user input

## Performance

- **Memoization** prevents duplicate network requests
- **Failure caching** prevents repeated failed attempts
- **CDN hierarchy** optimizes for speed and reliability
- **Async loading** doesn't block function startup

## Compatibility

The system is compatible with:
- Supabase Edge Functions
- Deno runtime
- TypeScript/JavaScript
- All major external APIs (OpenAI, Stripe, etc.)

## Troubleshooting

### Common Issues

1. **Import failures**: Check CDN status and network connectivity
2. **Type errors**: Ensure proper destructuring of imports
3. **Cache issues**: Use `clearImportCache()` to reset

### Debug Mode

Enable verbose logging by setting console log level to debug in your function.
