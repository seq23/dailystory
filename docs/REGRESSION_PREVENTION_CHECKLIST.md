# Regression Prevention Checklist

## Document Status
**Created**: October 7, 2025  
**Last Updated**: October 7, 2025  
**Purpose**: Pre-deployment verification for emergency fallback protection

---

## Overview

This checklist ensures that changes to the story generation system don't break the emergency fallback protection that prevents users from seeing diagnostic error pages.

**Use this checklist before**:
- Merging story generation code changes
- Deploying error handling updates
- Modifying CleanStoryDisplay.tsx
- Updating NetflixStyleStoryService or LiveGenerationService
- Changing ErrorHandlingManager

---

## ✅ Pre-Deployment Checklist

### Phase 1: Code Review

#### Emergency Fallback Integrity

- [ ] **Outer safety nets exist in both services**
  - `src/services/NetflixStyleStoryService.ts` (lines 61-236)
  - `src/services/LiveGenerationService.ts` (lines 555-595)

- [ ] **Try/catch wrappers in CleanStoryDisplay**
  - Guest user flow (lines 2162-2199)
  - Premium user flow (lines 1974-1998)

- [ ] **ErrorHandlingManager accessible**
  - Import present in CleanStoryDisplay.tsx (line 135-138)
  - Import present in both story services
  - `getEmergencyContent()` method unchanged

#### User-Facing Error Handling

- [ ] **No `setError()` in story generation flows**
  - Search codebase: `grep -n "setError" src/components/CleanStoryDisplay.tsx`
  - Verify only safe `setError()` calls remain (initial state, premium-only features)

- [ ] **Toast notifications used instead**
  - Guest flow shows "System Recovery Mode" toast
  - Premium flow shows "Story Recovery Mode" toast

- [ ] **Emergency content treated as story**
  - Returns valid `NetflixStoryResult` or `LiveGenerationResult`
  - Pages array structure correct
  - `success: true` in result object

#### Source Tracking

- [ ] **Source tracking set in all paths**
  - AI generation: `'ai'`
  - Template service: `'template'`
  - Emergency fallback: `'emergency'`
  - Cache restoration: `'restored'`

- [ ] **Global tracking variable used**
  - `(globalThis as any).__LAST_STORY_SOURCE__` set correctly

#### Diagnostic Gating

- [ ] **Diagnostic components gated correctly**
  - `window.__ENABLE_DIAGNOSTICS__` check present (line 4035)
  - DiagnosticPanel conditional render
  - ApiKeyDiagnostic conditional render

---

### Phase 2: Functional Testing

#### Emergency Fallback Testing

- [ ] **Test Tier 3 emergency fallback**
  - Force AI generation failure
  - Verify emergency content displays
  - Confirm toast notification shows
  - Check no diagnostic page appears

- [ ] **Test outer safety nets**
  - Simulate complete service failure
  - Verify services return valid results (don't throw)
  - Confirm emergency content generated

- [ ] **Test ErrorHandlingManager**
  ```javascript
  const content = ErrorHandlingManager.getEmergencyContent({ name: 'Test User' });
  // Should return rhyming story content (never throw)
  ```

#### Source Tracking Verification

- [ ] **Verify source tracking works**
  ```javascript
  // After story generation:
  console.log(window.__LAST_STORY_SOURCE__);
  // Should be: 'ai', 'template', 'emergency', or 'restored'
  ```

- [ ] **Test each tier sets source correctly**
  - Tier 1 (AI): `'ai'`
  - Tier 2 (Template): `'template'`
  - Tier 3 (Emergency): `'emergency'`

#### Toast Notification Testing

- [ ] **Guest user toast displays**
  - Title: "📖 System Recovery Mode"
  - Description includes "backup content"
  - Duration: 5000ms

- [ ] **Premium user toast displays**
  - Title: "📖 Story Recovery Mode"  
  - Description includes "continue your story"
  - Duration: 5000ms

#### Diagnostic Gating Testing

- [ ] **Default state: diagnostics hidden**
  ```javascript
  console.log(window.__ENABLE_DIAGNOSTICS__); // Should be undefined/false
  ```

- [ ] **Enable diagnostics manually**
  ```javascript
  window.__ENABLE_DIAGNOSTICS__ = true;
  // Refresh page - diagnostic panel should appear
  ```

---

### Phase 3: Integration Testing

#### Timer System Integration

- [ ] **Guest timer works with emergency content**
  - 20-minute timer starts
  - Timer continues during emergency mode
  - Pause/resume functions work

- [ ] **Premium timer works with emergency content**
  - Timer dismissal works
  - Session continues indefinitely

#### Image Generation Integration

- [ ] **Images generate for emergency pages**
  - `runware-generate-image` receives `pageText`
  - Image URL returned and displayed
  - Loading states work correctly

- [ ] **Image caching works**
  - Emergency story images cached
  - Images persist during navigation

#### Navigation Integration

- [ ] **Forward navigation works**
  - Next page button functional
  - Page numbers increment correctly
  - Source tracking maintained

- [ ] **Backward navigation works**
  - Previous page button functional
  - Cached pages display correctly
  - Images restore from cache

#### Cache System Integration

- [ ] **Emergency stories cache correctly**
  - Cache stores emergency content
  - Source tracking preserved in cache
  - Restoration works identically

- [ ] **Cache restoration works**
  - Restoring emergency story displays correctly
  - Source tracking shows `'restored'`
  - Timer/session state restored

#### Session Management Integration

- [ ] **Guest session maintains state**
  - Page limit enforcement (6 pages)
  - Timer tracks correctly
  - "Next Story" button appears at page 6

- [ ] **Premium session maintains state**
  - Unlimited pages work
  - "Finish Story" button functional
  - Session persists across emergency mode

---

### Phase 4: User Experience Testing

#### Guest User Experience

- [ ] **New story generation**
  - Emergency content displays as story
  - Toast notification non-intrusive
  - Timer starts and runs correctly

- [ ] **"Next Story" functionality**
  - Button appears at page 6
  - Cache clears on "Next Story"
  - New emergency story generates

- [ ] **Session end behavior**
  - 20-minute timer expires correctly
  - Cache clears on session end
  - User can start new session

#### Premium User Experience

- [ ] **Live generation flow**
  - Emergency content works with live generation
  - "Finish Story" button appears
  - Session continuity maintained

- [ ] **Story library integration**
  - Emergency stories can be saved
  - Saved stories include source tracking
  - Library displays emergency stories normally

- [ ] **"Magic wand" re-write**
  - Re-write clears cache correctly
  - New generation triggers (may hit emergency again)
  - Images regenerate appropriately

---

### Phase 5: Error Scenario Testing

#### Network Failure Scenarios

- [ ] **Complete network failure**
  - Emergency content generates locally
  - No diagnostic page shows
  - User can continue session

- [ ] **Partial network failure**
  - Tier 2 fallback attempts before emergency
  - Graceful degradation through tiers
  - Source tracking shows correct tier

#### Service Failure Scenarios

- [ ] **AI service unavailable**
  - Falls back to template service
  - If template fails, emergency content
  - User experience maintained

- [ ] **Template service unavailable**
  - Emergency content generates immediately
  - Toast notification displayed
  - Session continues normally

#### Edge Cases

- [ ] **Rapid repeated failures**
  - Multiple emergency stories in sequence
  - Emergency content randomization works
  - No diagnostic page accumulation

- [ ] **Mixed success/failure**
  - Some pages AI, some emergency
  - Navigation works across tiers
  - Cache handles mixed sources

---

### Phase 6: Performance Testing

#### Emergency Fallback Performance

- [ ] **Emergency content generation speed**
  - `ErrorHandlingManager.getEmergencyContent()` < 50ms
  - No network calls required
  - Synchronous generation

- [ ] **Toast notification performance**
  - Toast displays immediately
  - No UI blocking
  - Dismissal works smoothly

#### Integration Performance

- [ ] **Emergency mode doesn't degrade system**
  - Timer continues accurately
  - Navigation remains responsive
  - Image generation still works

---

### Phase 7: Monitoring Setup

#### Logging Verification

- [ ] **Emergency fallback logs present**
  ```bash
  grep "EMERGENCY FALLBACK" logs.txt
  grep "OUTER SAFETY NET" logs.txt
  ```

- [ ] **Source tracking logs present**
  ```bash
  grep "__LAST_STORY_SOURCE__" logs.txt
  ```

#### Analytics Tracking

- [ ] **Emergency fallback rate tracked**
  ```javascript
  const emergencyRate = emergencyStoryCount / totalStoryCount;
  ```

- [ ] **Alert thresholds configured**
  - Alert if emergency rate > 5%
  - Alert if diagnostic page views > 0

#### Health Check Endpoints

- [ ] **Emergency content generator health**
  ```javascript
  // Should always return valid content
  ErrorHandlingManager.getEmergencyContent({ name: 'Health Check' });
  ```

---

### Phase 8: Documentation Verification

#### Code Comments

- [ ] **Emergency fallback sections commented**
  - Try/catch wrappers explain purpose
  - Source tracking explained
  - Toast notification rationale documented

#### Documentation Files Updated

- [ ] **EMERGENCY_FALLBACK_PROTECTION.md**
  - Implementation details current
  - Line numbers accurate
  - Code examples match actual code

- [ ] **STORY_GENERATION_TEST_PLAN.md**
  - Emergency fallback test cases added
  - Success metrics updated
  - Risk areas documented

- [ ] **DIAGNOSTIC_GATING_IMPLEMENTATION.md**
  - Gating mechanism documented
  - Developer access instructions clear
  - Security implications explained

#### Custom Knowledge Updated

- [ ] **Project custom knowledge**
  - Emergency fallback rules added
  - Never-show-diagnostics rule emphasized
  - `__ENABLE_DIAGNOSTICS__` flag documented

---

## 🚨 Critical "MUST PASS" Items

These items are **blocking** - deployment cannot proceed if any fail:

### 1. Zero Diagnostic Page Exposure
```javascript
// MUST be undefined/false by default
window.__ENABLE_DIAGNOSTICS__ === undefined || window.__ENABLE_DIAGNOSTICS__ === false
```

### 2. Emergency Content Always Returns
```javascript
// MUST never throw
try {
  const content = ErrorHandlingManager.getEmergencyContent({ name: 'Test' });
  console.assert(typeof content === 'string', 'Emergency content must be string');
  console.assert(content.length > 0, 'Emergency content must not be empty');
} catch (e) {
  console.error('CRITICAL: Emergency content generator threw exception');
}
```

### 3. No User-Facing setError() Calls
```bash
# MUST return only safe setError() calls
grep -n "setError" src/components/CleanStoryDisplay.tsx
# Verify each call is either:
# - Initial state clearing
# - Premium-only feature
# - Developer diagnostic mode
```

### 4. Outer Safety Nets Present
```bash
# MUST have outer try/catch in both services
grep -A 5 "catch (outerError" src/services/NetflixStyleStoryService.ts
grep -A 5 "catch" src/services/LiveGenerationService.ts
```

### 5. Toast Notifications Display
```javascript
// MUST show toast (not setError) on emergency fallback
// Test: Force emergency mode, verify toast appears
```

---

## ⚠️ High-Risk Areas

Pay special attention to changes in these areas:

### CleanStoryDisplay.tsx
- Lines 1974-1998: Premium user initialization
- Lines 2162-2199: Guest user story generation
- Lines 4035-4043: Diagnostic panel gating

### NetflixStyleStoryService.ts
- Lines 61-236: Outer safety net wrapper
- Lines 226-235: Emergency content return

### LiveGenerationService.ts
- Lines 555-595: Emergency fallback logic

### ErrorHandlingManager.ts
- Lines 112-183: Emergency content generation
- Template array (must have at least 1 valid template)

---

## 🔄 Post-Deployment Verification

### Immediate (First Hour)

- [ ] Monitor emergency fallback activation rate
  - Expected: < 5% of total stories
  - Alert if > 10%

- [ ] Check diagnostic page view count
  - Expected: 0 views by end users
  - Alert if > 0

- [ ] Verify toast notifications working
  - Check user reports
  - Monitor frontend error logs

### First Day

- [ ] Review edge function logs
  - Look for "OUTER SAFETY NET" activations
  - Check "EMERGENCY FALLBACK" frequency
  - Verify source tracking values

- [ ] Monitor user engagement metrics
  - Emergency story completion rates
  - Session continuation rates
  - Image generation success with emergency content

### First Week

- [ ] Analyze emergency fallback patterns
  - Identify common failure modes
  - Optimize Tier 1/2 to reduce Tier 3 usage
  - Document any new edge cases

- [ ] Review user feedback
  - Check for reports of error pages
  - Verify toast messaging clarity
  - Assess user confidence in recovery mode

---

## 📋 Quick Reference Commands

### Search for setError() Calls
```bash
grep -rn "setError" src/components/CleanStoryDisplay.tsx
```

### Verify Outer Safety Nets
```bash
grep -A 10 "catch (outerError" src/services/NetflixStyleStoryService.ts
```

### Check Emergency Content Generator
```bash
grep -A 20 "getEmergencyContent" src/services/errorHandlingManager.ts
```

### Find Diagnostic Gating
```bash
grep -n "__ENABLE_DIAGNOSTICS__" src/components/CleanStoryDisplay.tsx
```

### Test Emergency Content Generation
```javascript
// In browser console:
const manager = await import('./src/services/errorHandlingManager');
const content = manager.ErrorHandlingManager.getEmergencyContent({ name: 'Test User' });
console.log(content);
```

---

## 🎯 Success Criteria

### Deployment is APPROVED when:

✅ All checklist items passed  
✅ All critical "MUST PASS" items verified  
✅ High-risk areas reviewed and tested  
✅ Documentation updated and accurate  
✅ Monitoring and alerting configured  
✅ No diagnostic page exposure possible  
✅ Emergency content generation tested and working  
✅ Integration with all systems verified  

### Deployment is BLOCKED when:

❌ Any critical "MUST PASS" item fails  
❌ Diagnostic page can be triggered by users  
❌ Emergency content generator can throw  
❌ Source tracking not working  
❌ Toast notifications not displaying  
❌ Integration tests failing  

---

## 📚 Related Documentation

- [EMERGENCY_FALLBACK_PROTECTION.md](./EMERGENCY_FALLBACK_PROTECTION.md) - Implementation details
- [DIAGNOSTIC_GATING_IMPLEMENTATION.md](./DIAGNOSTIC_GATING_IMPLEMENTATION.md) - Diagnostic access
- [STORY_GENERATION_TEST_PLAN.md](../STORY_GENERATION_TEST_PLAN.md) - Testing procedures
- [MASTER_ERRORS_TO_FIX.md](./MASTER_ERRORS_TO_FIX.md) - Error tracking system

---

## 🔧 Troubleshooting Failed Checklist Items

### If: Emergency content generator throws
**Fix**: Verify `getEmergencyContent()` has proper try/catch around template selection

### If: Diagnostic page shows to users
**Fix**: Check `window.__ENABLE_DIAGNOSTICS__` gating in CleanStoryDisplay.tsx line 4035

### If: setError() called in user path
**Fix**: Replace with emergency content generation + toast notification

### If: Source tracking not working
**Fix**: Verify `(globalThis as any).__LAST_STORY_SOURCE__` set in all paths

### If: Toast not displaying
**Fix**: Check `toast` import from `@/hooks/use-toast` and Toaster component present

---

**Last Updated**: October 7, 2025  
**Next Review**: Before each deployment affecting story generation or error handling
