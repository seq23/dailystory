# Type System Architecture

## Overview
This document outlines the comprehensive type system architecture designed to prevent cascading TypeScript errors across Edge functions.

## Core Components

### 1. Canonical Types (`supabase/functions/_shared/types/index.ts`)
Single source of truth for all shared interfaces:
- `UserInfo` - User data structure
- `CharacterSeed` - Character consistency data
- `AvatarIdentity` - Character creation input
- `SessionId` - Session identifier type
- `StoryContext` - Story context type

### 2. Runtime Validation (`supabase/functions/_shared/dto/user.ts`)
Zod schemas for boundary validation:
- `UserInfoDto` - Validates user data at API boundaries
- `CharacterSeedDto` - Validates character data
- `AvatarIdentityDto` - Validates character creation input

### 3. Path Alias System
Configured in `supabase/deno.json`:
```json
{
  "imports": {
    "#types/": "./supabase/functions/_shared/types/"
  }
}
```

All imports use the canonical path:
```typescript
import type { UserInfo, CharacterSeed } from "#types/index.ts";
```

## Architecture Benefits

### 1. Prevents Type Cascades
- Single source of truth eliminates conflicting type definitions
- Path aliases ensure consistent imports across all functions
- Strict TypeScript flags catch issues early

### 2. Runtime Safety
- Zod validation at boundaries catches shape mismatches
- Type-safe parsing prevents runtime errors
- Clear error messages for debugging

### 3. Developer Experience
- IDE autocompletion across all functions
- Consistent type checking
- Clear error messages

## TypeScript Configuration

### Strict Flags Enabled
- `strict: true` - All strict checks enabled
- `noImplicitAny: true` - No implicit any types
- `noImplicitReturns: true` - All code paths must return
- `exactOptionalPropertyTypes: true` - Strict optional property handling
- `noUncheckedIndexedAccess: true` - Safe array/object access

### Import Rules
- All shared types must use `#types/` alias
- No direct relative imports to type files
- Barrel exports through `index.ts`

## File Structure

```
supabase/functions/_shared/
├── types/
│   └── index.ts          # Canonical type definitions
├── dto/
│   └── user.ts           # Runtime validation schemas
└── [function-files].ts   # Import from #types/
```

## Migration Guide

### For New Functions
1. Import types: `import type { UserInfo } from "#types/index.ts";`
2. Use Zod validation at boundaries: `validateUserInfo(data)`
3. Follow strict TypeScript practices

### For Existing Functions
1. Replace local type definitions with imports from `#types/`
2. Add parameter type annotations to eliminate TS7006 errors
3. Fix return type mismatches (Promise<void> vs Promise<boolean>)
4. Add runtime validation for external data

## Maintenance Guidelines

### Adding New Types
1. Add to `supabase/functions/_shared/types/index.ts`
2. Create corresponding Zod schema in `dto/`
3. Export through barrel pattern
4. Update this documentation

### Modifying Existing Types
1. Update canonical definition in `types/index.ts`
2. Update corresponding Zod schema
3. Test all consuming functions
4. Update documentation

### Debugging Type Issues
1. Check for multiple type definitions with same name
2. Verify all imports use `#types/` alias
3. Run `tsc --noEmit` for type-only validation
4. Check Zod validation at runtime boundaries

## Error Prevention Checklist

- [ ] All shared types defined in `#types/index.ts`
- [ ] All imports use `#types/` alias
- [ ] Zod schemas for runtime validation
- [ ] Strict TypeScript flags enabled
- [ ] No implicit any types (TS7006)
- [ ] Consistent return types
- [ ] Proper parameter annotations

This architecture ensures type safety, prevents cascading errors, and provides a maintainable foundation for the Edge function ecosystem.