# Error Handling Standards and Best Practices

**Last Updated**: January 2025  
**Status**: ✅ Implemented Across All Services with Emergency Source Tracking

## Overview
This document establishes consistent, safe error handling patterns across the codebase to prevent crashes, improve reliability, and maintain proper source tracking for the fallback system.

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

### Error Logging with Source Tracking
```typescript
// ✅ SAFE - Standardized error logging with source awareness
import { logSafeError } from '../supabase/functions/_shared/errorPatterns';
logSafeError('Generation failed', error, { 
  attempt, 
  model: currentModel?.model,
  source: window.__LAST_STORY_SOURCE__ || 'unknown'
});
```

### Emergency Content Source Tracking (NEW)
```typescript
// ✅ SAFE - Proper emergency source labeling
const handleEmergencyContent = (userInfo: UserInfo) => {
  const emergencyContent = ErrorHandlingManager.getEmergencyContent(userInfo);
  
  // CRITICAL: Always set emergency source
  if (typeof window !== 'undefined') {
    window.__LAST_STORY_SOURCE__ = 'emergency';
  }
  
  return {
    content: emergencyContent,
    source: 'emergency', // Explicit source in response
    pageCount: 1
  };
};
```

### Global Source Flag Management
```typescript
// ✅ SAFE - Centralized source tracking
const setGlobalSourceFlag = (source: 'ai' | 'fallback' | 'emergency') => {
  if (typeof window !== 'undefined') {
    window.__LAST_STORY_SOURCE__ = source;
    
    // Trigger source change detection
    window.dispatchEvent(new CustomEvent('story:generation:complete', {
      detail: { source }
    }));
  }
};
```

## ❌ Unsafe Patterns (Never Use These)

### Direct Property Access
```typescript
// ❌ UNSAFE - Can cause ReferenceError if error is not Error instance
error.message

// ❌ UNSAFE - Can cause TypeError if currentModel is undefined
currentModel.model

### Missing Source Tracking
```typescript
// ❌ UNSAFE - Emergency content without source tracking
const handleEmergency = () => {
  return ErrorHandlingManager.getEmergencyContent(userInfo);
  // Missing: window.__LAST_STORY_SOURCE__ = 'emergency'
};

// ❌ UNSAFE - Template content mislabeled as emergency
const templateFallback = () => {
  const content = templateService.generate(userInfo);
  window.__LAST_STORY_SOURCE__ = 'emergency'; // WRONG: Should be 'fallback'
  return content;
};
```
```

## Emergency Content and Source Tracking Standards ✅ IMPLEMENTED

### Content Source Definitions
- **AI Content**: `source: 'ai'` - Primary OpenAI generation
- **Fallback Content**: `source: 'fallback'` - Template-based generation  
- **Emergency Content**: `source: 'emergency'` - Rhyming safety net content

### Proper Source Labeling
```typescript
// ✅ CORRECT - Template service response
const templateResult = await templateService.generate(userInfo);
setGlobalSourceFlag('fallback');
return {
  content: templateResult.content,
  source: 'fallback', // Template content is fallback
  pageCount: templateResult.pageCount
};

// ✅ CORRECT - Emergency content response  
const emergencyContent = ErrorHandlingManager.getEmergencyContent(userInfo);
setGlobalSourceFlag('emergency');
return {
  content: emergencyContent,
  source: 'emergency', // Emergency content is emergency
  pageCount: 1
};
```

### Error Recovery with Source Awareness
```typescript
// ✅ SAFE - Recovery with proper source tracking
const executeWithRecovery = async <T>(
  primaryOperation: () => Promise<T>,
  fallbackOperation: () => Promise<T>,
  emergencyOperation: () => T,
  context: string
): Promise<T> => {
  try {
    const result = await primaryOperation();
    setGlobalSourceFlag('ai');
    return result;
  } catch (primaryError) {
    logSafeError(primaryError, `${context}_primary`);
    
    try {
      const fallbackResult = await fallbackOperation();
      setGlobalSourceFlag('fallback');
      return fallbackResult;
    } catch (fallbackError) {
      logSafeError(fallbackError, `${context}_fallback`);
      
      const emergencyResult = emergencyOperation();
      setGlobalSourceFlag('emergency');
      return emergencyResult;
    }
  }
};
```

## 🔧 Migration Examples

### Before (Unsafe)
```typescript
// ❌ UNSAFE EXAMPLE
async generateStory(userInfo: UserInfo) {
  try {
    const aiResult = await openaiService.generate(userInfo);
    return aiResult;
  } catch (error) {
    console.log("AI failed: " + error.message); // Unsafe error access
    
    const fallbackContent = this.getEmergencyContent(userInfo);
    return {
      content: fallbackContent,
      source: 'fallback' // WRONG: Emergency content labeled as fallback
    };
  }
}
```

### After (Safe)
```typescript
// ✅ SAFE EXAMPLE  
async generateStory(userInfo: UserInfo): Promise<NetflixStoryResult> {
  try {
    const aiResult = await openaiService.generate(userInfo);
    setGlobalSourceFlag('ai');
    return {
      content: aiResult.content,
      source: 'ai',
      pageCount: aiResult.pageCount
    };
  } catch (error) {
    logSafeError(error, 'NetflixStyleStoryService.generateStory');
    
    return await this.generateFallbackStory(userInfo, difficulty, safeErrorMessage(error));
  }
}

private static async generateFallbackStory(
  userInfo: UserInfo, 
  difficulty: DifficultyLevel,
  reason: string
): Promise<NetflixStoryResult> {
  try {
    const templateResult = await templateService.generate(userInfo, difficulty);
    setGlobalSourceFlag('fallback');
    return {
      content: templateResult.content,
      source: 'fallback', // Correct: Template content is fallback
      pageCount: templateResult.pageCount
    };
  } catch (templateError) {
    logSafeError(templateError, 'NetflixStyleStoryService.templateFallback');
    
    const emergencyContent = ErrorHandlingManager.getEmergencyContent(userInfo);
    setGlobalSourceFlag('emergency');
    return {
      content: emergencyContent,
      source: 'emergency', // Correct: Emergency content is emergency
      pageCount: 1
    };
  }
}
```

## Cultural Enhancement Error Prevention (Added September 25, 2025)

### Variable Name Consistency
**Standard**: All variables must match their usage context
**Example**: Use `skinTone` consistently instead of mixing `skinTone`, `culturalType`, or similar variations
**Enforcement**: Code review must verify variable name consistency

### Function Reference Validation
**Standard**: Verify function existence before calling
**Best Practice**: Use direct implementation over function dependencies when possible
**Example**: Instead of `this.shouldApplyCulturalFeatures(userInfo)`, use direct skinTone checking:
```javascript
const skinTone = userInfo?.skinTone || userInfo?.avatarIdentity?.skinTone || 'medium';
if (skinTone === 'dark' || skinTone === 'darker') {
  // Apply cultural features
}
```

### Safe Patterns for Placeholder Resolution Debugging
**Console Logging**: Always verify variables exist before using in console statements
```javascript
// ✅ CORRECT
const skinTone = userInfo?.skinTone || 'unknown';
console.log(`Cultural enhancements for ${userName} (${skinTone}): ${enhancements}`);

// ❌ WRONG
console.log(`Cultural enhancements for ${userName} (${culturalType}): ${enhancements}`);
```

### Prevention of Undefined Variable References
**Template Systems**: Always define variables before using them in templates or logging
**Fallback Strategy**: Use defensive programming with default values
**Example**:
```javascript
const skinTone = userInfo?.skinTone || userInfo?.avatarIdentity?.skinTone || 'medium';
const culturalEnhancements = this.getCulturalEnhancements(skinTone) || '';
```

### Nuclear Independence Standards for Cultural Processing
**Principle**: Each tier must handle cultural processing errors without escalating to higher tiers
**Implementation**: Use hardcoded fallbacks that never fail
**Example**:
```javascript
try {
  return this.getCulturalHairDescription(userInfo);
} catch (error) {
  console.warn('getCulturalHairDescription failed, using hardcoded fallbacks:', error);
  // Hardcoded fallbacks - never escalate tier on this failure
  const skinTone = userInfo?.skinTone || userInfo?.avatarIdentity?.skinTone || 'medium';
  if (skinTone === 'dark' || skinTone === 'darker') {
    return 'with authentic African American features';
  }
  return ''; // Safe fallback for all other cases
}
```

### Error Isolation for Cultural Features
**Standard**: Cultural processing failures must not crash the entire system
**Implementation**: Wrap all cultural enhancement logic in try-catch blocks
**Fallback**: Always provide safe defaults that maintain system operation

## 📊 Implementation Status

### Phase 1: Critical Fixes ✅ COMPLETED
- [x] **Fixed ReferenceError** in `streamlined-handler.ts` line 366
- [x] **Fixed Emergency Source Tracking** in `ErrorHandlingManager.getEmergencyContent()`
- [x] **Corrected Template Service** syntax error in `templateConverter.ts`
- [x] **Standardized currentModel references** in story generation
- [x] **Created shared error pattern utilities**
- [x] **Implemented global source flag management**

### Phase 2: Source Tracking Integration ✅ COMPLETED  
- [x] **Updated NetflixStyleStoryService** with proper emergency source labeling
- [x] **Updated LiveGenerationService** with per-page source tracking
- [x] **Integrated toast notification system** with source change detection
- [x] **Added status indicator system** with session storage coordination
- [x] **Implemented recovery notification system** with one-time session control

### Phase 3: Comprehensive Coverage ✅ COMPLETED
- [x] **All story generation services** use safe error patterns
- [x] **Emergency content properly labeled** as `'emergency'` not `'fallback'`
- [x] **Global source tracking** implemented across all content generation
- [x] **Session storage integration** for persistent UI state management
- [x] **Error statistics and monitoring** integration with source awareness

## 🛡️ Prevention Guidelines

1. **Always use optional chaining** for object property access in error handlers
2. **Never access variables** declared in try blocks from catch blocks
3. **Always type-check errors** before accessing `.message` property
4. **Always set proper source flags** when generating content (`'ai'`, `'fallback'`, `'emergency'`)
5. **Use standardized utilities** from `errorPatterns.ts` when available
6. **Dispatch source change events** when setting global source flags
7. **Test error scenarios** to ensure error handlers don't crash
8. **Validate source tracking** in all content generation flows
9. **Verify variable name consistency** in cultural enhancement logging
10. **Use direct implementation** over function dependencies for cultural processing
11. **Wrap cultural enhancement logic** in try-catch blocks with hardcoded fallbacks
12. **Test cultural processing** with various user data scenarios (missing skinTone, undefined avatarIdentity, etc.)

## Emergency Content Best Practices ✅ IMPLEMENTED

- Always label emergency/rhyming content as `source: 'emergency'`
- Set global source flag: `window.__LAST_STORY_SOURCE__ = 'emergency'`
- Include retry guidance in emergency content
- Maintain user personalization even in emergency mode
- Provide clear differentiation from template fallback content
- Dispatch `story:generation:complete` event for UI notifications

## Source Tracking Validation

### Validation Utility
```typescript
// Validation utility for source tracking
const validateSourceTracking = () => {
  const globalSource = window.__LAST_STORY_SOURCE__;
  const sessionFlags = {
    backup: sessionStorage.getItem('story_backup_mode') === 'true',
    emergency: sessionStorage.getItem('story_emergency_mode') === 'true'
  };
  
  // Ensure consistency between global flag and session storage
  if (globalSource === 'fallback' && !sessionFlags.backup) {
    console.warn('Source tracking inconsistency: fallback without backup flag');
  }
  
  if (globalSource === 'emergency' && !sessionFlags.emergency) {
    console.warn('Source tracking inconsistency: emergency without emergency flag');  
  }
};
```

## 📈 Benefits

- **Zero ReferenceErrors**: Safe variable access patterns
- **Consistent logging**: Standardized error message extraction  
- **Better debugging**: Meaningful error information always available
- **Crash prevention**: Robust error handling that never fails
- **Future-proof**: Patterns that work with any error type
- **Proper Source Tracking**: Clear user awareness of content source at all times
- **Seamless Fallbacks**: Smooth transitions between AI, template, and emergency content
- **Enhanced User Experience**: Toast notifications and status indicators for system awareness

## 🔍 Code Review Checklist

When reviewing code, check for:
- [ ] Direct `error.message` usage without type checking
- [ ] Object property access without optional chaining
- [ ] Variables from try blocks used in catch blocks
- [ ] Inconsistent error logging formats
- [ ] Missing fallback values for error scenarios
- [ ] **Emergency content labeled as `'fallback'` instead of `'emergency'`**
- [ ] **Missing global source flag setting in content generation**
- [ ] **Missing `story:generation:complete` event dispatch**
- [ ] **Inconsistent source tracking between global flags and session storage**
- [ ] **Toast notifications not triggered on source changes**

---

**Critical Note**: These standards are essential for maintaining system reliability and user experience. The emergency source tracking fixes are particularly important for proper toast notifications and status indicators.