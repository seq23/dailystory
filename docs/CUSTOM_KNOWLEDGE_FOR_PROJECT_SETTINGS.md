# Custom Knowledge for Project Settings

## Instructions
**Copy the content below into Project Settings → Manage Knowledge**

---

## CRITICAL ERROR HANDLING RULES (October 2025)

### 🚨 NEVER-SHOW-DIAGNOSTICS RULE
Users must NEVER see diagnostic error pages under ANY circumstances. This is a critical business requirement.

**Implementation:**
- All story generation failures MUST use emergency content fallback
- Emergency content is treated as a VALID STORY (not an error state)
- Diagnostic UI gated behind `window.__ENABLE_DIAGNOSTICS__` flag
- Toast notifications replace error pages

**Files:**
- `src/components/CleanStoryDisplay.tsx` (lines 1974-1998, 2162-2199, 4035-4043)
- `src/services/NetflixStyleStoryService.ts` (lines 61-236)
- `src/services/LiveGenerationService.ts` (lines 555-595)

### 🔒 EMERGENCY CONTENT ALWAYS SUCCEEDS
`ErrorHandlingManager.getEmergencyContent()` must NEVER throw exceptions. It is the final safety net.

**Implementation:**
- Synchronous generation (no async/await)
- Zero external dependencies
- Simple template selection with fallback
- Returns creative, rhyming story content
- Always returns valid string (never null/undefined)

**File:** `src/services/errorHandlingManager.ts` (lines 112-183)

### 🛡️ OUTER SAFETY NETS REQUIRED
All story generation services must have outer try/catch wrappers that prevent unhandled exceptions.

**Implementation:**
- Wrap entire `generateStory()` method in try/catch
- Catch block generates emergency content
- Always return valid result structure (never throw)
- Log errors for monitoring

**Files:**
- `src/services/NetflixStyleStoryService.ts` (lines 61-236)
- `src/services/LiveGenerationService.ts` (lines 555-595)

### 📊 SOURCE TRACKING MANDATORY
All story generation paths must set source tracking for analytics.

**Implementation:**
```typescript
(globalThis as any).__LAST_STORY_SOURCE__ = 'ai' | 'template' | 'emergency' | 'restored';
```

**Sources:**
- `'ai'` - Tier 1: AI generation succeeded
- `'template'` - Tier 2: Template service fallback
- `'emergency'` - Tier 3: Emergency content fallback
- `'restored'` - Story restored from cache

### 🎯 NO setError() IN USER-FACING PATHS
Guest and premium story generation flows must NEVER call `setError()` which triggers diagnostic pages.

**Instead use:**
```typescript
toast({
  title: "📖 System Recovery Mode",
  description: "We're using backup content. Your session continues normally.",
  duration: 5000,
});
```

**Safe setError() usage:**
- Initial state clearing (line 1241)
- Premium-only features that guests don't access
- Developer diagnostic mode (when `__ENABLE_DIAGNOSTICS__ = true`)

### 🔐 DIAGNOSTIC GATING
Diagnostic components must be conditionally rendered based on `window.__ENABLE_DIAGNOSTICS__` flag.

**Implementation:**
```typescript
{window.__ENABLE_DIAGNOSTICS__ && (
  <>
    <DiagnosticPanel />
    <ApiKeyDiagnostic />
  </>
)}
```

**Flag behavior:**
- Default: `undefined` (falsy) - components don't render
- Developer access: Set `window.__ENABLE_DIAGNOSTICS__ = true` in console
- Resets on page load (doesn't persist)

### 🧪 EMERGENCY FALLBACK TESTING
Before deploying story generation changes, test emergency fallback:

**Test commands:**
```javascript
// Test emergency content generation
const content = ErrorHandlingManager.getEmergencyContent({ name: 'Test User' });
console.assert(typeof content === 'string' && content.length > 0);

// Check diagnostic gating
console.assert(window.__ENABLE_DIAGNOSTICS__ === undefined);

// Verify source tracking
console.log(window.__LAST_STORY_SOURCE__); // Should be: 'ai', 'template', 'emergency', or 'restored'
```

### 📈 MONITORING THRESHOLDS
Alert on these conditions:

**Emergency Fallback Rate:**
- Warning: > 5% of stories use Tier 3 (emergency)
- Critical: > 10% of stories use Tier 3

**Diagnostic Page Views:**
- Alert: > 0 views by end users (should be impossible)

**Source Tracking:**
- Track tier distribution (Target: 95% AI, 4% template, 1% emergency)

### 🔄 4-TIER FALLBACK SYSTEM
Story generation follows this cascade:

```
Tier 1: AI Generation (OpenAI/Anthropic)
    ↓ (on failure)
Tier 2: Template Service (Edge function)
    ↓ (on failure)
Tier 3: Emergency Content (ErrorHandlingManager) ← NEVER FAILS
    ↓
Display as Normal Story + Toast Notification
```

**Key principle:** Every tier produces valid story content that integrates with existing systems (timer, images, navigation, cache).

### 🎨 USER EXPERIENCE DURING FAILURES
When emergency fallback activates:

**Guest Users:**
- ✅ See emergency story content
- ✅ Toast: "📖 System Recovery Mode"
- ✅ 20-minute timer continues
- ✅ Can click "Next Story" at page 6
- ❌ Never see diagnostic page

**Premium Users:**
- ✅ See emergency story content
- ✅ Toast: "📖 Story Recovery Mode"
- ✅ Session continues indefinitely
- ✅ Can click "Finish Story"
- ✅ Can save emergency story to library
- ❌ Never see diagnostic page

### 📚 INTEGRATION GUARANTEES
Emergency content must work with:

- ✅ **Timer System**: Respects guest 20-min limit, premium unlimited
- ✅ **Image Generation**: Emergency pages trigger image generation
- ✅ **Cache System**: Emergency stories cached like normal stories
- ✅ **Navigation**: Forward/backward navigation works
- ✅ **Session Management**: Guest limits and premium features maintained
- ✅ **Story Library**: Premium users can save emergency stories

### 🚫 ANTI-PATTERNS TO AVOID

**DON'T:**
```typescript
// ❌ Calling setError in story generation flow
if (storyGenerationFailed) {
  setError("Story generation failed");
}

// ❌ Throwing without outer safety net
async generateStory() {
  throw new Error("AI failed"); // Unhandled!
}

// ❌ Not setting source tracking
// Missing: (globalThis as any).__LAST_STORY_SOURCE__ = 'emergency';

// ❌ Exposing diagnostics by default
<DiagnosticPanel /> // Always rendered!
```

**DO:**
```typescript
// ✅ Using emergency fallback + toast
try {
  result = await generateStory();
} catch (error) {
  const emergencyContent = ErrorHandlingManager.getEmergencyContent(user);
  result = { pages: [{ pageNumber: 1, content: emergencyContent }], success: true, source: 'emergency' };
  toast({ title: "📖 System Recovery Mode", description: "Using backup content..." });
  (globalThis as any).__LAST_STORY_SOURCE__ = 'emergency';
}

// ✅ Outer safety net
async generateStory() {
  try {
    // All logic
  } catch (outerError) {
    return { /* valid emergency result */ };
  }
}

// ✅ Gated diagnostics
{window.__ENABLE_DIAGNOSTICS__ && <DiagnosticPanel />}
```

### 📋 PRE-DEPLOYMENT CHECKLIST
Before deploying story generation changes:

- [ ] Outer safety nets exist in both services
- [ ] Try/catch wrappers in CleanStoryDisplay
- [ ] Emergency content generator tested (never throws)
- [ ] Diagnostic gating verified (window.__ENABLE_DIAGNOSTICS__)
- [ ] Source tracking sets correctly
- [ ] Toast notifications display
- [ ] Integration tests pass (timer, images, navigation, cache)
- [ ] No `setError()` in user-facing story generation paths

### 📖 DOCUMENTATION REFERENCES
- `docs/EMERGENCY_FALLBACK_PROTECTION.md` - Complete implementation
- `docs/REGRESSION_PREVENTION_CHECKLIST.md` - Testing procedures
- `docs/DIAGNOSTIC_GATING_IMPLEMENTATION.md` - Developer access
- `docs/CURRENT_TEMPLATE_SYSTEM_AND_FALLBACK_CHAIN.md` - Architecture
- `STORY_GENERATION_TEST_PLAN.md` - Test cases

### 🎯 SUCCESS METRICS
- **Zero diagnostic page views** by end users
- **100% story delivery** (every request gets content)
- **Emergency fallback < 5%** of total stories
- **User confidence maintained** during outages

---

## SYSTEM ARCHITECTURE SUMMARY

**Business Logic:**
- Guest users: 20-min sessions, 6-page limit, never-ending stories (cut off at page 6)
- Premium users: Unlimited sessions, full stories, can finish/continue indefinitely
- Both user types: Never-ending AI stories (no natural conclusions)

**Story Generation:**
- 4-tier system: AI → Template → Emergency → Always Display
- Emergency content = valid story (not error state)
- Diagnostic pages = developer-only (gated)

**User Experience Guarantee:**
- Every story request receives content
- Sessions never interrupted by errors
- Transparent fallback via toast notifications
- All features work with emergency content

---

**Last Updated:** October 7, 2025  
**Next Review:** Before any story generation or error handling changes
