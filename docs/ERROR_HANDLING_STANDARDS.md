# Standardized Error Handling Guidelines

## Overview
This document establishes consistent, safe error handling patterns across the codebase to prevent crashes and improve reliability.

## ✅ Safe Patterns (Always Use These)

### Error Message Extraction
```typescript
// ✅ SAFE - Handles all error types gracefully
import { safeErrorMessage } from '../supabase/functions/_shared/errorPatterns';
const message = safeErrorMessage(error);

// ✅ SAFE - Inline type checking
const message = error instanceof Error ? error.message : String(error);
```

### Property Access in Error Handlers
```typescript
// ✅ SAFE - Optional chaining with fallback
model: currentModel?.model || 'unknown'

// ✅ SAFE - Safe property access utility
import { safePropertyAccess } from '../supabase/functions/_shared/errorPatterns';
const modelName = safePropertyAccess(currentModel, 'model', 'unknown');
```

### Error Logging
```typescript
// ✅ SAFE - Standardized error logging
import { logSafeError } from '../supabase/functions/_shared/errorPatterns';
logSafeError('Generation failed', error, { attempt, model: currentModel?.model });
```

## ❌ Unsafe Patterns (Never Use These)

### Direct Property Access
```typescript
// ❌ UNSAFE - Can cause ReferenceError if error is not Error instance
error.message

// ❌ UNSAFE - Can cause TypeError if currentModel is undefined
currentModel.model

// ❌ UNSAFE - Variable declared in try block accessed in catch
try {
  const currentModel = getModel();
} catch (error) {
  console.log(currentModel.model); // ReferenceError!
}
```

## 🔧 Migration Examples

### Before (Unsafe)
```typescript
catch (error) {
  console.error('Failed:', {
    error: error.message,           // ❌ Unsafe
    model: currentModel.model       // ❌ Unsafe
  });
}
```

### After (Safe)
```typescript
catch (error) {
  console.error('Failed:', {
    error: error instanceof Error ? error.message : String(error), // ✅ Safe
    model: currentModel?.model || 'unknown'                        // ✅ Safe
  });
}
```

## 📊 Implementation Status

### Phase 1: Critical Fixes ✅
- [x] Fixed ReferenceError in `streamlined-handler.ts` line 366
- [x] Standardized currentModel references in story generation
- [x] Created shared error pattern utilities

### Phase 2: High Priority Files 🚧
- [ ] Update all edge functions with `error.message` usage (39 files)
- [ ] Standardize error logging in critical paths
- [ ] Apply safe patterns to frontend services

### Phase 3: Comprehensive Coverage 📋
- [ ] ESLint rules for error pattern enforcement
- [ ] Automated testing of error scenarios
- [ ] Performance impact assessment

## 🛡️ Prevention Guidelines

1. **Always use optional chaining** for object property access in error handlers
2. **Never access variables** declared in try blocks from catch blocks
3. **Always type-check errors** before accessing `.message` property
4. **Use standardized utilities** from `errorPatterns.ts` when available
5. **Test error scenarios** to ensure error handlers don't crash

## 📈 Benefits

- **Zero ReferenceErrors**: Safe variable access patterns
- **Consistent logging**: Standardized error message extraction  
- **Better debugging**: Meaningful error information always available
- **Crash prevention**: Robust error handling that never fails
- **Future-proof**: Patterns that work with any error type

## 🔍 Code Review Checklist

When reviewing code, check for:
- [ ] Direct `error.message` usage without type checking
- [ ] Object property access without optional chaining
- [ ] Variables from try blocks used in catch blocks
- [ ] Inconsistent error logging formats
- [ ] Missing fallback values for error scenarios