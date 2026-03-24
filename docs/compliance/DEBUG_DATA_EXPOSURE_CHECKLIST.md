# Debug Data Exposure Checklist

**Purpose:** Prevent regression of debug data visibility in image generation system  
**Created:** 2025-09-30 (Response to ERROR-047)  
**Scope:** Backend edge functions + Frontend debug UI

---

## 🚨 Critical Requirements

### Backend Edge Functions

#### `ai-visual-scene-creator` Returns
**MUST include in final response:**
```typescript
{
  success: boolean,
  imageURL: string,
  tier: string,
  // CRITICAL: Debug data must be populated
  aiDebugSchema: {
    enhancedBy: string,
    enhancedPrompt: string,
    promptCharCount: number,
    template: string,
    characterConsistencyLevel: string,
    culturalIntelligence: string,
    sessionId: string
  },
  runwareDebugData: {
    templateStructure: string, // e.g., "2.5C"
    imageURL: string,
    prompt: string,
    tier: string,
    // For Direct Mode
    mode?: string,
    characterDescription?: object,
    hairMapping?: object
  },
  primaryScene: string,
  openaiInteraction?: object,
  culturalContext?: object
}
```

**Anti-Regression Requirements:**
- ✅ NO duplicate variable declarations for `runwareDebugData` (check for shadowing)
- ✅ `runwareDebugData` MUST be populated before final response assembly
- ✅ Outer scope `runwareDebugData` (line 360) is the authoritative source
- ✅ Inner scope Template 2.5C logic MUST update outer scope variable
- ✅ Direct Mode responses MUST include `runwareDebugData.mode = 'direct'`

#### `runware-generate-image` Returns
**MUST include in final response:**
```typescript
{
  success: boolean,
  imageURL: string,
  tier: string,
  // CRITICAL: Orchestrator debug data must be exposed
  orchestratorDebugData: {
    aiDebugSchema: object,        // From ai-visual-scene-creator
    runwareDebugData: object,      // Template details (2.5C, etc.)
    primaryScene: string,          // Scene text
    openaiInteraction: object,     // OpenAI request/response
    culturalContext: object        // Cultural intelligence data
  },
  // Additional debug fields
  requestId: string,
  processingTime: number,
  tierProgression: string[]
}
```

**Anti-Regression Requirements:**
- ✅ `orchestratorDebugData` MUST be extracted from Tier 1 response
- ✅ All nested debug objects MUST be preserved (no null/undefined defaults)
- ✅ Template structure (2.5A, 2.5B, 2.5C, 2.5D) MUST be visible
- ✅ Tier routing decisions MUST be logged and included

### Frontend Debug UI (`ImageTierTester.tsx`)

#### Display Order (PRIMARY SCENE FIRST)
**MUST render in this order:**
1. **Primary Scene** (the actual scene text used)
2. **OpenAI Interaction Details** (request/response)
3. **Cultural Context** (cultural intelligence data)
4. **AI Debug Schema** (template details, character consistency)

**Anti-Regression Requirements:**
- ✅ Primary Scene MUST be visually prominent (first in display)
- ✅ All debug sections MUST handle undefined/null gracefully
- ✅ Template structure (2.5C) MUST be displayed when available
- ✅ Character description and hair mapping MUST be shown for Direct Mode

---

## 🔍 Anti-Regression Testing Protocol

### Pre-Deployment Checks

#### 1. Backend Variable Shadowing Audit
**Files to check:**
- `ai-visual-scene-creator/index.ts`
- `runware-generate-image/index.js`
- `runware-template-ab/index.js`
- `runware-template-cd/index.js`

**Search Pattern:**
```bash
# Check for duplicate declarations
grep -n "let runwareDebugData" supabase/functions/*/index.ts
grep -n "let orchestratorDebugData" supabase/functions/*/index.js

# Expected: ONE declaration per file
```

#### 2. Debug Data Flow Test
**Test Case 1: Force Tier 1 (ai-scene-creator button)**
- Click "Force Tier 1 (ai-scene-creator)" in ImageTierTester
- Verify response includes `orchestratorDebugData`
- Check `orchestratorDebugData.aiDebugSchema` is populated
- Verify `orchestratorDebugData.primaryScene` is visible

**Test Case 2: Force Tier 1 Orchestrator (Full Flow button)**
- Click "Force Tier 1 Orchestrator (Full Flow)" in ImageTierTester
- Verify response includes complete debug data
- Check `orchestratorDebugData.runwareDebugData` is populated
- Verify OpenAI interaction details are visible

**Test Case 3: Force Tier 1 Direct Mode**
- Click "Force Tier 1 Direct Mode" in ImageTierTester
- Verify `runwareDebugData.mode === 'direct'`
- Check `runwareDebugData.characterDescription` is populated
- Verify Template 2.5C details are visible

#### 3. UI Display Verification
**Manual Inspection:**
- Navigate to `/prompt-testing?debug=1`
- Run all Force Tier 1 tests
- Verify Primary Scene appears FIRST in debug output
- Check all debug sections render without errors
- Confirm Template structure (2.5C) is visible

---

## 🛡️ Code Review Checklist

### For Backend Changes (Edge Functions)

- [ ] No duplicate variable declarations for debug data objects
- [ ] Debug data is populated BEFORE final response assembly
- [ ] Outer scope variables are not shadowed by inner scope declarations
- [ ] All debug fields are explicitly set (no implicit undefined)
- [ ] Response includes `aiDebugSchema`, `runwareDebugData`, `orchestratorDebugData`
- [ ] Template structure (2.5A/B/C/D) is included in responses
- [ ] Error paths still return partial debug data when possible

### For Frontend Changes (ImageTierTester)

- [ ] Primary Scene is displayed FIRST
- [ ] All debug sections handle undefined/null gracefully
- [ ] Template details (2.5C) are rendered when available
- [ ] No display logic assumes debug data exists (use optional chaining)
- [ ] Debug output is collapsible/expandable for readability
- [ ] Request IDs are displayed for correlation
- [ ] Error messages are clear and actionable

---

## 🚨 Common Regression Risks

### 1. Variable Shadowing
**Risk:** Duplicate `let runwareDebugData = {}` declarations
**Detection:** Search for duplicate declarations in same file
**Prevention:** Use outer scope comments: `// runwareDebugData already declared at line X`

### 2. Premature Response Assembly
**Risk:** Building final response before populating debug data
**Detection:** Check order of debug data population vs `return` statements
**Prevention:** Populate ALL debug data first, then assemble response

### 3. Incomplete Data Propagation
**Risk:** Debug data exists in Tier 1 but not passed through orchestrator
**Detection:** Compare Tier 1 response vs orchestrator response
**Prevention:** Explicit extraction: `const { aiDebugSchema, runwareDebugData } = tier1Response`

### 4. UI Display Order Changes
**Risk:** Reordering debug sections breaks "Primary Scene first" requirement
**Detection:** Visual inspection of `/prompt-testing?debug=1`
**Prevention:** Comment in code: `// CRITICAL: Primary Scene MUST display first`

---

## 📊 Monitoring & Alerts

### Key Metrics to Track
- **Debug Data Completeness:** % of responses with full debug data
- **Template Visibility:** % of 2.5C responses showing template structure
- **UI Rendering Errors:** Frontend errors in debug sections
- **Variable Shadowing Incidents:** Static analysis alerts

### Alert Thresholds
- 🔴 **CRITICAL:** Debug data missing in >10% of responses
- 🟡 **WARNING:** Template structure not visible in 2.5C responses
- 🟢 **INFO:** All debug data flowing correctly

---

## 📝 Files to Monitor for Changes

**Backend (Edge Functions):**
- `supabase/functions/ai-visual-scene-creator/index.ts` (Line 360, 445)
- `supabase/functions/runware-generate-image/index.js` (Lines 1075-1082)
- `supabase/functions/runware-template-ab/index.js`
- `supabase/functions/runware-template-cd/index.js`

**Frontend (Debug UI):**
- `src/components/ImageTierTester.tsx` (Lines 2829-2941)

**Documentation:**
- `docs/IMAGE_GENERATION_DEBUGGING_GUIDE.md` (Debug data exposure section)
- `docs/MASTER_ERRORS_TO_FIX.md` (ERROR-047 entry)
- `STORY_GENERATION_TEST_PLAN.md` (Debug verification section)

---

## 🔄 Rollback Plan

### If Debug Data Regression Detected

**Step 1: Identify Scope**
- Which debug fields are missing?
- Which tier is affected?
- Is it backend or frontend issue?

**Step 2: Quick Fix Options**
1. **Variable Shadowing:** Remove duplicate declarations
2. **Missing Fields:** Add explicit field population
3. **UI Display:** Restore Primary Scene first order

**Step 3: Emergency Revert**
If fix is complex, revert to last working commit:
```bash
# Backend revert
git revert <commit-hash> supabase/functions/ai-visual-scene-creator/index.ts

# Frontend revert
git revert <commit-hash> src/components/ImageTierTester.tsx
```

**Step 4: Redeploy & Verify**
- Deploy fixed version
- Run all Force Tier 1 tests
- Verify debug data completeness
- Update documentation with fix

---

## ✅ Success Criteria

**Backend:**
- All Force Tier 1 responses include complete `orchestratorDebugData`
- Template 2.5C details visible in `runwareDebugData.templateStructure`
- No variable shadowing in debug data paths
- Zero null/undefined debug fields in successful responses

**Frontend:**
- Primary Scene displays FIRST in debug output
- All debug sections render without errors
- Template structure (2.5C) visible when available
- Graceful handling of missing debug fields

**Overall:**
- 100% debug data completeness for successful image generations
- Zero regression incidents in debug data exposure
- Clear documentation trail for all debug data requirements
- Comprehensive testing protocol prevents future issues

---

**Related Documentation:**
- [ERROR-047 in MASTER_ERRORS_TO_FIX.md](./MASTER_ERRORS_TO_FIX.md#error-047-debug-data-exposure-blocked-by-variable-shadowing)
- [IMAGE_GENERATION_DEBUGGING_GUIDE.md](./IMAGE_GENERATION_DEBUGGING_GUIDE.md)
- [STORY_GENERATION_TEST_PLAN.md](../STORY_GENERATION_TEST_PLAN.md)
