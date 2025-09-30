# Anti-Regression Guidelines

**Purpose**: Prevent recurring issues in import patterns, service usage, and character consistency integration  
**Last Updated**: 2025-09-30  
**Status**: Active enforcement required

---

## 🚨 Critical Import Pattern Rules

### Rule 1: Always Use `#shared/` Import Map Alias

**Why**: Supabase edge functions deploy to isolated environments where relative paths can fail

```typescript
// ✅ CORRECT - Uses import map
import { characterConsistencyService } from '#shared/CharacterConsistencyService.js';

// ❌ WRONG - Relative path (fails in deployment)
import { characterConsistencyService } from '../_shared/CharacterConsistencyService.js';
import { characterConsistencyService } from '../../_shared/CharacterConsistencyService.js';
```

**Configuration**: `supabase/deno.json`
```json
{
  "imports": {
    "#types/": "./supabase/functions/_shared/types/",
    "#shared/": "./supabase/functions/_shared/"
  }
}
```

**Enforcement**: All imports in edge functions MUST use `#shared/` or `#types/` aliases

---

### Rule 2: Always Use Dynamic Imports in Edge Functions

**Why**: Static imports can cause module resolution conflicts and import stampedes in Deno

```typescript
// ✅ CORRECT - Dynamic import
const { characterConsistencyService } = await import('#shared/CharacterConsistencyService.js');

// ❌ WRONG - Static import at top of file
import { CharacterConsistencyService } from '#shared/CharacterConsistencyService.js';
```

**Pattern Locations**:
- `ai-visual-scene-creator/index.ts`: Lines 178, 385, 494
- `runware-generate-image/index.ts`: All CharacterConsistencyService usage
- `runware-template-ab/index.js`: Service imports

**Exception**: TypeScript type imports are OK as static imports:
```typescript
// ✅ OK - Type imports only (compile-time, not runtime)
import type { UserInfo } from "#types/index.ts";
```

---

### Rule 3: Always Use Singleton Instances (Never Instantiate)

**Why**: Services are exported as pre-instantiated singletons, not class constructors

```typescript
// ✅ CORRECT - Use singleton instance
const { characterConsistencyService } = await import('#shared/CharacterConsistencyService.js');
const characters = await characterConsistencyService.getSecondaryCharactersForSession(sessionId);

// ❌ WRONG - Attempting to instantiate
const characterService = new CharacterConsistencyService(); // This will fail!
```

**Export Structure** (`CharacterConsistencyService.js`):
```javascript
export class CharacterConsistencyService {
  // Class definition
}

// Exports singleton instance (NOT class constructor)
export const characterConsistencyService = CharacterConsistencyService.getInstance();
```

**Usage Pattern**:
```typescript
// Import the singleton
const { characterConsistencyService } = await import('#shared/CharacterConsistencyService.js');

// Use it directly - it's already instantiated
const result = await characterConsistencyService.someMethod();
```

---

### Rule 4: Consistent Variable Naming

**Why**: Prevents confusion between singleton instance and class constructor

```typescript
// ✅ CORRECT - Clear singleton naming
const { characterConsistencyService } = await import('#shared/CharacterConsistencyService.js');

// ❌ WRONG - Confusing naming
const characterService = new CharacterConsistencyService();
const service = await import('#shared/...');
```

**Standard Variable Name**: `characterConsistencyService` (matches export name)

---

## 🎭 Secondary Character Integration Rules

### Rule 5: Always Retrieve Secondary Characters in AI Scene Generation

**Why**: Stories mention families and friends, images should show them

```typescript
// ✅ CORRECT - Always retrieve
let cachedSecondaryCharacters: any[] = [];

try {
  const { characterConsistencyService } = await import('#shared/CharacterConsistencyService.js');
  cachedSecondaryCharacters = await characterConsistencyService.getSecondaryCharactersForSession(sessionId);
  console.log(`✅ Retrieved ${cachedSecondaryCharacters.length} cached secondary characters`);
} catch (error) {
  console.warn(`⚠️ Failed to retrieve cached secondary characters:`, error);
  cachedSecondaryCharacters = []; // Graceful degradation
}

// ❌ WRONG - Ignoring secondary characters
// (Only using main character data)
```

**Integration Points**:
- AI Visual Scene Creator: Lines 178-188
- Template Systems: `{secondary_characters}` placeholder
- Image Prompts: Include family context in descriptions

---

### Rule 6: Format Secondary Characters for AI Comprehension

**Why**: AI models need natural language descriptions, not raw data

```typescript
// ✅ CORRECT - Natural language formatting
const secondaryCharacterDescriptions = cachedSecondaryCharacters
  .map(char => {
    const relationship = char.relationshipToMain || 'friend';
    const name = char.name || 'companion';
    const appearance = char.appearance || 'warm presence';
    return `${relationship} named ${name}: ${appearance}`;
  })
  .join(', ');

// Result: "parent named Mom: warm brown eyes, curly black hair, sibling named Brother: playful energy"

// ❌ WRONG - Raw object dump
const descriptions = JSON.stringify(cachedSecondaryCharacters);
```

---

### Rule 7: Graceful Degradation for Missing Characters

**Why**: Not all stories have secondary characters; system should continue gracefully

```typescript
// ✅ CORRECT - Handle empty arrays
const familyContext = secondaryCharacterDescriptions 
  ? `\nOther characters present: ${secondaryCharacterDescriptions}`
  : ''; // Empty string if no secondary characters

// ❌ WRONG - Assume characters always exist
const familyContext = `\nOther characters present: ${secondaryCharacterDescriptions}`; // Breaks if empty
```

---

## 🔍 Cultural Enhancement Rules

### Rule 8: Always Use Correct Method Signatures

**Why**: Incorrect parameters cause silent failures and fallback to inferior alternatives

```typescript
// ✅ CORRECT - 3 parameters
const culturalEnhancements = await characterConsistencyService.getCulturalEnhancements(
  userInfo,           // User profile object
  sessionId,          // Session identifier
  characterName       // Character name string
);

// ❌ WRONG - Incorrect parameter count or order
const culturalEnhancements = await characterConsistencyService.getCulturalEnhancements(
  sessionId, userInfo, characterName, skinTone, hairColor // Too many parameters!
);
```

**Method Signature Documentation**:
- `getCulturalEnhancements(userInfo, sessionId, characterName)` → Returns `{ hair, features }`
- Does NOT return `skinTone` (use `userInfo.skinTone` directly)

---

### Rule 9: Verify Return Value Structures

**Why**: Accessing non-existent properties causes undefined errors

```typescript
// ✅ CORRECT - Use actual return structure
const { hair, features } = culturalEnhancements;

// Use userInfo for skinTone
const structuredAvatarData = {
  resolvedSkinTone: userInfo.skinTone || userInfo?.avatarIdentity?.skinTone || 'medium',
  assignedHairColor: hair,
  source: 'character_service_generation'
};

// ❌ WRONG - Accessing non-existent property
const skinTone = culturalEnhancements.skinTone; // Undefined! This property doesn't exist
```

---

### Rule 10: Implement 3-Tier Fallback for Cultural Data

**Why**: Ensures system continues even when services fail

```typescript
// ✅ CORRECT - 3-tier fallback
try {
  // Tier 1: Orchestrator data (if available)
  if (orchestratorData?.structuredAvatarData) {
    structuredAvatarData = orchestratorData.structuredAvatarData;
  } 
  // Tier 2: CharacterConsistencyService generation
  else {
    const { characterConsistencyService } = await import('#shared/CharacterConsistencyService.js');
    const culturalEnhancements = await characterConsistencyService.getCulturalEnhancements(
      userInfo, sessionId, userInfo?.name || 'Child'
    );
    structuredAvatarData = {
      resolvedSkinTone: userInfo.skinTone || 'medium',
      assignedHairColor: culturalEnhancements.hair,
      source: 'character_service_generation'
    };
  }
} catch (error) {
  // Tier 3: Emergency hardcoded fallback
  console.warn(`⚠️ All cultural enhancement tiers failed, using emergency fallback`);
  structuredAvatarData = getEmergencyHairMapping(userInfo.skinTone);
}

// ❌ WRONG - No fallback
const culturalEnhancements = await characterConsistencyService.getCulturalEnhancements(...);
// Fails completely if service unavailable
```

---

## 📝 Logging and Debugging Rules

### Rule 11: Add Detailed Logging for Service Calls

**Why**: Early detection of failures prevents production issues

```typescript
// ✅ CORRECT - Detailed logging
console.log(`🔍 [${requestId}] Calling CharacterConsistencyService with parameters:`, {
  userName: userInfo?.name,
  sessionId: sessionId,
  characterName: userInfo?.name || 'Child',
  skinTone: userInfo?.skinTone || userInfo?.avatarIdentity?.skinTone || 'medium'
});

const culturalEnhancements = await characterConsistencyService.getCulturalEnhancements(
  userInfo, sessionId, userInfo?.name || 'Child'
);

console.log(`✅ [${requestId}] CharacterService returned:`, culturalEnhancements);

// ❌ WRONG - Silent failures
const culturalEnhancements = await characterConsistencyService.getCulturalEnhancements(...);
// No way to know if it failed!
```

**Logging Standards**:
- Log parameters before service calls
- Log return values after service calls
- Log errors with full context
- Use request IDs for tracing

---

### Rule 12: Log Fallback Usage for Monitoring

**Why**: Track system health and identify when services are degraded

```typescript
// ✅ CORRECT - Log fallback usage
if (!orchestratorData?.structuredAvatarData) {
  console.log(`🔄 [${requestId}] No orchestrator data - generating structuredAvatarData via CharacterConsistencyService`);
  try {
    // ... service call ...
  } catch (error) {
    console.error(`❌ [${requestId}] CharacterService failed, using emergency fallback:`, error);
    // ... emergency fallback ...
  }
}

// ❌ WRONG - Silent fallbacks
if (!orchestratorData?.structuredAvatarData) {
  structuredAvatarData = getEmergencyHairMapping(skinTone);
  // No indication that fallback was used!
}
```

---

## 🔒 Type Safety Rules

### Rule 13: Add Type Guards Before Iteration

**Why**: Prevents "is not iterable" runtime errors

```typescript
// ✅ CORRECT - Type guards
if (Array.isArray(detections.animals)) {
  for (const animal of detections.animals) {
    // Safe iteration
  }
} else if (detections.animals && typeof detections.animals === 'object') {
  // Handle object structure: { silent_pets: [...], speaking_animals: [...] }
  if (Array.isArray(detections.animals.silent_pets)) {
    for (const pet of detections.animals.silent_pets) {
      // Safe iteration
    }
  }
}

// ❌ WRONG - Assume structure
for (const animal of detections.animals) {
  // Breaks if animals is object, not array!
}
```

---

### Rule 14: Validate Method Parameters

**Why**: Undefined parameters cause silent failures

```typescript
// ✅ CORRECT - Validate parameters
if (!sessionId || typeof sessionId !== 'string') {
  console.error('Invalid sessionId provided to getSecondaryCharactersForSession');
  return [];
}

// ❌ WRONG - No validation
const characters = await service.getSecondaryCharactersForSession(sessionId);
// Fails silently if sessionId is undefined
```

---

## 🧪 Testing Rules

### Rule 15: Test All Fallback Paths

**Why**: Fallbacks must work when primary systems fail

**Test Matrix**:
- ✅ Service available, data present
- ✅ Service available, data missing
- ✅ Service unavailable (import fails)
- ✅ Service throws error
- ✅ Empty response from service

```typescript
// Test each tier independently
// Tier 1: Orchestrator present
// Tier 2: Orchestrator missing, service works
// Tier 3: Service fails, emergency fallback
```

---

### Rule 16: Verify Import Patterns in Edge Function Environment

**Why**: Local development may work while deployment fails

**Testing Checklist**:
- [ ] Deploy edge function to Supabase
- [ ] Test dynamic imports in production
- [ ] Verify `#shared/` alias resolution
- [ ] Check singleton instance access
- [ ] Monitor edge function logs for import errors

---

## 📚 Documentation Rules

### Rule 17: Update CHARACTER_CONSISTENCY_STATUS.md When Adding Features

**Why**: Central documentation must reflect current implementation

**Required Updates**:
- Add new method to "Core Methods" section
- Document integration points (file paths, line numbers)
- Add usage examples
- Update testing procedures

---

### Rule 18: Cross-Reference Related Errors

**Why**: Understanding error relationships prevents recurrence

```markdown
## Related Issues
- ERROR-050 (Import pattern fix - prerequisite for this implementation)
- ERROR-049 (Direct Mode structuredAvatarData - also required import fix)
- PHASE-2 (Secondary character enhancement system-wide)
```

---

## 🚀 Deployment Rules

### Rule 19: Verify Edge Function Configuration

**Why**: Missing configuration causes deployment failures

**Deployment Checklist**:
- [ ] `supabase/deno.json` has import map configured
- [ ] `supabase/config.toml` includes edge function entry
- [ ] All dependencies use `#shared/` or `#types/` aliases
- [ ] No static imports of shared services
- [ ] Singleton patterns enforced

---

### Rule 20: Monitor Production After Deployment

**Why**: Catch issues early before they impact users

**Monitoring Checklist**:
- [ ] Check edge function logs for import errors
- [ ] Verify service call success rates
- [ ] Monitor fallback usage frequency
- [ ] Track secondary character retrieval rates
- [ ] Review cultural enhancement generation

---

## 📋 Pre-Change Checklist

**Use this checklist before modifying character consistency code:**

### Import Patterns
- [ ] Using `#shared/` alias (not relative paths)
- [ ] Using dynamic imports (not static)
- [ ] Using singleton instances (not instantiation)
- [ ] Consistent variable naming (`characterConsistencyService`)

### Service Integration
- [ ] Correct method signatures verified
- [ ] Return value structures documented
- [ ] Graceful degradation implemented
- [ ] 3-tier fallback architecture in place

### Secondary Characters
- [ ] Retrieving secondary characters when appropriate
- [ ] Formatting for AI comprehension
- [ ] Handling empty arrays gracefully
- [ ] Template integration verified

### Type Safety
- [ ] Type guards before iteration
- [ ] Parameter validation
- [ ] Null/undefined handling
- [ ] Error boundary implementation

### Testing
- [ ] All fallback paths tested
- [ ] Edge function deployment verified
- [ ] Production monitoring configured
- [ ] Documentation updated

### Logging
- [ ] Service call parameters logged
- [ ] Return values logged
- [ ] Errors logged with context
- [ ] Fallback usage tracked

---

## 🚨 Regression Detection

### Warning Signs

**Import Pattern Regressions**:
- "Module not found" errors in edge functions
- "Cannot read property 'getInstance'" errors
- Import stampedes (multiple simultaneous imports)
- Service instantiation errors

**Secondary Character Regressions**:
- Stories with families show only main character
- Empty secondary character arrays when characters exist
- AI visual schemas missing family context
- Template placeholders not resolving

**Cultural Enhancement Regressions**:
- All requests using emergency hardcoded fallback
- "Undefined property" errors in structuredAvatarData
- Hair color repetition across sessions
- Method signature mismatch errors

### Response Plan

1. **Immediate**: Check edge function logs for errors
2. **Review**: Verify import patterns against this guide
3. **Test**: Run E2E user simulation with debug mode
4. **Fix**: Apply corrections per relevant rules
5. **Document**: Update MASTER_ERRORS_TO_FIX.md
6. **Monitor**: Track fix effectiveness in production

---

## 📖 Related Documentation

- `docs/MASTER_ERRORS_TO_FIX.md` - Error tracking and resolution
- `docs/CHARACTER_CONSISTENCY_STATUS.md` - Service status and integration
- `docs/CHARACTER_CONSISTENCY_ARCHITECTURE.md` - Method reference
- `docs/CHARACTER_CONSISTENCY_STATUS.md` - Implementation guide and status
- `docs/PHASE_2_SECONDARY_CHARACTER_ENHANCEMENT.md` - Tier-specific processing

---

**Enforcement**: These guidelines are MANDATORY for all character consistency code changes  
**Review**: Guidelines should be reviewed before any edge function modifications  
**Updates**: Guidelines should be updated when new patterns emerge or errors are discovered
