# CCS Database Error Handling Strategy

**Last Updated:** 2025-10-09  
**Status:** ✅ IMPLEMENTED

---

## Philosophy

Database errors should **NEVER** crash story generation. CCS gracefully degrades to in-memory processing using inline vocabulary fallbacks.

---

## Error Handling Strategy

### Database Fetch Failures
- **`getCharacterFromDatabase()`** returns `null` (never throws)
- **`getEnhancedCharacterSeed()`** generates fresh seed using inline `TIER_25_UNIFIED_VOCABULARY_EXTENDED`
- **`getCulturalEnhancements()`** throws clear error for orchestrator escalation to Direct Mode

### Database Save Failures
- **`saveCharacterToDatabase()`** returns `false` (never throws)
- Character data persists in smart cache for session
- Logging captures save failures for monitoring

---

## Inline Vocabulary Fallback

**Location:** `CharacterConsistencyServiceInline.js` lines 396-578

CCS has `TIER_25_UNIFIED_VOCABULARY_EXTENDED` (240 words) fully inlined:
- Hair colors, eye colors, skin tones
- Clothing items, accessories
- Actions, settings, emotional states

**Result:** Vocabulary is **ALWAYS** available, even if external vocabulary files or database are unavailable.

---

## 99.99% Uptime Strategy

```
Database Available:
1. Fetch from database → Use cached data
2. Generate if missing → Save to database
3. ✅ Image generated

Database Unavailable:
1. Fetch returns null (graceful)
2. Generate fresh seed with inline vocab
3. Save fails (logged, ignored)
4. ✅ Image generated (no persistence)

CCS Method Failure (non-database):
1. Core method throws error
2. Orchestrator catches error
3. Escalates to Direct Mode
4. ❌ No image (expected behavior)
```

---

## Core CCS Methods (Must Escalate on Failure)

| Method | Failure Behavior |
|--------|------------------|
| `getEnhancedCharacterSeed()` | Database errors → graceful degradation; CCS errors → escalate |
| `getCulturalEnhancements()` | Database errors → throw for escalation; missing data → escalate |
| `getCharacterAppearanceFromStory()` | Any failure → immediate escalation |
| `getSessionSetting()` | Any failure → immediate escalation |
| `buildClothingDescription()` | Count=0 → return ""; Database error or inconsistency → escalate |
| `detectAllCharacters()` | Uses inline vocab → should not fail |
| `generateCharacterForConsistency()` | Uses inline vocab → should not fail |

---

## Monitoring

Track these metrics:
- Database fetch failure rate (target: < 0.01%)
- Database save failure rate (target: < 0.01%)
- CCS escalation rate (target: < 5%)
- Fresh seed generation rate (indicates database unavailability)

---

## Implementation Files

- `supabase/functions/runware-generate-image/CharacterConsistencyServiceInline.js`
- `supabase/functions/runware-generate-image/index.ts` (Tier 1 orchestrator)
- `supabase/functions/runware-template-ab/index.ts` (Tier 2.5A orchestrator)

---

## Changes Implemented (2025-10-09)

### Phase 1: Removed Overengineered Fallback
- ❌ **Deleted:** `getBasicCharacterSeed()` method (78 lines)
- **Rationale:** Incomplete character data with hardcoded clothing ("wearing casual clothing")
- **Impact:** CCS failures now escalate to Direct Mode instead of degrading to basic seed

### Phase 2: Database Error Graceful Degradation
- ✅ **`getCharacterFromDatabase()`** - Returns `null` instead of throwing on database errors
- ✅ **`saveCharacterToDatabase()`** - Returns `false` instead of throwing on database errors
- ✅ **`getEnhancedCharacterSeed()`** - Try-catch wrapper for database calls, generates fresh seed on fetch failure
- ✅ **`getCulturalEnhancements()`** - Try-catch wrapper for database calls, throws clear error if no character data

### Phase 3: Core Method Escalation
- ✅ **`getCharacterAppearanceFromStory()`** - Escalates to Direct Mode on any failure (no silent failure)
- ✅ **`getSessionSetting()`** - Escalates to Direct Mode on any failure (no silent failure)

### Phase 4: Documentation
- ✅ **Updated:** `docs/CCS_DOCUMENTATION_UPDATE_SUMMARY_2025-10-04.md` (method count: 7 → 6)
- ✅ **Created:** `docs/CCS_DATABASE_ERROR_HANDLING.md` (this file)

---

## Testing Checklist

- [x] **Tier 1 with database available:** Generates image successfully
- [x] **Tier 1 with database unavailable:** Generates image successfully (fresh seed with inline vocab)
- [ ] **Tier 1 with `getCharacterAppearanceFromStory()` failure:** Escalates to Direct Mode (no image expected)
- [ ] **Tier 1 with `getSessionSetting()` failure:** Escalates to Direct Mode (no image expected)
- [x] **Tier 2.5A with database available:** Generates image successfully
- [ ] **Tier 2.5A with database unavailable:** Escalates to Template CD (image generated)
- [x] **Verify logging:** See "gracefully degrading" messages for database errors
- [ ] **Verify logging:** See "core CCS method failure" messages for method errors
- [x] **Verify smart cache:** Character data persists across pages in session
- [x] **Database monitoring:** No thrown errors in logs for database failures
- [x] **Vocabulary availability:** Inline `TIER_25_UNIFIED_VOCABULARY_EXTENDED` always loads

---

## Expected Behavior Examples

### Example 1: Database Available (Normal Operation)
```
[CCS] Fetching character from database...
✅ [CCS] Using cached character data for Alex
[TIER_1] getCharacterAppearanceFromStory: SUCCESS
[TIER_1] AI scene creator generating prompt...
✅ Image generated
```

### Example 2: Database Unavailable (Graceful Degradation)
```
[CCS] Fetching character from database...
❌ [CCS] Database fetch error (gracefully degrading to fresh generation): Connection timeout
⚠️ [CCS] Database fetch failed for Alex, generating fresh seed
[CCS] Generating fresh seed with inline vocabulary...
✅ [CCS] Character seed generated
⚠️ [CCS] Database save failed for Alex, continuing with in-memory cache: Connection timeout
[TIER_1] getCharacterAppearanceFromStory: SUCCESS
[TIER_1] AI scene creator generating prompt...
✅ Image generated (no database persistence)
```

### Example 3: Core CCS Method Failure (Escalation)
```
[CCS] Character data loaded
[TIER_1] getCharacterAppearanceFromStory...
❌ [TIER_1] getCharacterAppearanceFromStory: FAILED - core CCS method failure
❌ CHARACTERSERVICE_UNAVAILABLE_TRY_DIRECT_MODE
[TIER_1] Escalating to Direct Mode...
[DIRECT_MODE] Generating scene-only JSON...
❌ No image (expected behavior for core method failures)
```

---

## Key Principles

1. **Database errors = Graceful degradation** (generate fresh seed, continue without persistence)
2. **Core method errors = Immediate escalation** (fail fast to Direct Mode)
3. **Inline vocabulary = 100% availability** (no external dependencies)
4. **Smart cache = Session persistence** (character data survives database outages within session)
5. **Logging = Transparency** (all degradation paths clearly logged for monitoring)
