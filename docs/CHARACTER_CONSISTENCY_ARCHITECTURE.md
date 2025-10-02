# CHARACTER CONSISTENCY ARCHITECTURE - Technical Reference

> **Note**: This document provides supplementary technical details. For complete status, integration guides, and resolved errors, see the canonical **[CHARACTER_CONSISTENCY_STATUS.md](./CHARACTER_CONSISTENCY_STATUS.md)**.

---

## Service Overview

**Location**: `supabase/functions/_shared/CharacterConsistencyService.js`  
**Pattern**: Singleton instance (pre-instantiated)  
**Integration**: All image generation edge functions

---

## Complete Function Inventory

**Total Functions**: 21 core methods  
**Failure Classification**: 20 Graceful Fallback | 1 Fail-Fast  
**Last Audited**: 2025-10-01

> **📋 For complete function audit with line numbers and failure behaviors**, see [CHARACTER_CONSISTENCY_SERVICE_COMPLETE_FUNCTION_AUDIT.md](./CHARACTER_CONSISTENCY_SERVICE_COMPLETE_FUNCTION_AUDIT.md)

> **🔗 For integration patterns across edge functions**, see [CCS_FUNCTION_INTEGRATION_SNAPSHOT_2025-10-01.md](./CCS_FUNCTION_INTEGRATION_SNAPSHOT_2025-10-01.md)

---

## Method Reference (Quick Lookup)

### Core Methods

#### `getInstance()`
Returns singleton instance of the service.

### `analyzeVisualDetails(sessionId, pageText, pageNumber, characterName?)`
- Analyzes and caches visual details from story text
- Extracts colored objects, atmospheric words, character appearance
- Stores data by sessionId and pageNumber

### `ESSENTIAL_VOCABULARY` ✅ ENHANCED (2025-09-30)
**STATUS**: 134+ words across 15 categories  
**Purpose**: Core vocabulary for character consistency system  
**Categories**: Hair textures, skin descriptors, facial features, body types, clothing items, actions, emotions, settings, cultural elements  
**Location**: Lines 334-349 of CharacterConsistencyService.js

### `LEAN_CULTURAL_FALLBACK` ✅ NEW (2025-09-30)
**STATUS**: Emergency cultural enhancement system  
**Purpose**: Standalone fallback when StaticDataCache unavailable  
**Contents**: 
- Hair mappings: 5 skin tones × 3 options each (15 total combinations)
- African American hair arrays: Girls (3 options) + Boys (3 options)
- Curated features: 3 culturally appropriate options
**Location**: Lines 352-382 of CharacterConsistencyService.js  
**Design**: Zero external dependencies, instant availability

### `detectAllCharacters(pageText, context)` ✅
**STATUS**: CONSOLIDATED API  
**Purpose**: Unified detection for all character types (main, secondary, family, community)  
**Returns**: Object with `secondaryCharacters` array and other detection results  
**Usage**: Template AB should call this instead of older `detectSecondaryCharacters`  

### `getSecondaryCharactersForSession(sessionId)` ✅ NEW (2025-09-30)
**STATUS**: FULLY INTEGRATED  
**Purpose**: Retrieves all tracked secondary characters for a session  
**Returns**: `Promise<SecondaryCharacter[]>` with name, relationship, appearance, traits  
**Usage**: AI visual scene creator (lines 178-188), template integration  
**Fix**: ERROR-051 resolution

### `getCulturalEnhancements(userInfo, sessionId, characterName)` ✅ CORRECTED CLASSIFICATION
**STATUS**: GRACEFUL FALLBACK (2025-10-01)  
**Purpose**: Generates culturally appropriate character enhancements  
**Parameters**: userInfo (object), sessionId (string), characterName (string)  
**Returns**: `{ hair, features }` - Does NOT return skinTone  
**Failure Behavior**: ⚠️ **GRACEFUL FALLBACK** (CORRECTED from fail-fast)  
**3-Tier Logic**:
- **Tier 1**: Database cache lookup → Full character data (if available)
- **Tier 2**: `HAIR_BY_SKIN_TONE_INLINE` + `getSkinFeatures()` → Inlined arrays (if Tier 1 fails)
- **Tier 3**: ~~Generic fallback~~ **REMOVED** (was causing inconsistency)
**Fallback Pattern**: Uses `getBasicCharacterSeed()` if no cached data exists (line 1093)  
**Location**: Lines 1085-1170 of CharacterConsistencyService.js  
**Usage**: All tiers safe - `ai-visual-scene-creator`, `runware-template-ab`, `runware-generate-image`  
**Data Sources**: Same as `getBasicCharacterSeed()` - 144+ hair options, 40 African American styles  
**Fixes**: ERROR-049, ERROR-050, ERROR-054

### `getBasicCharacterSeed(avatarIdentity, sessionId)` ✅ NEW (2025-09-30)
**STATUS**: REFACTORED - PURE COMPUTATION  
**Responsibility**: **Pure computation** - Generate basic character seed with zero external dependencies  
**Purpose**: Provides guaranteed-success fallback for tier-based architecture  
**Parameters**: avatarIdentity (object with name, type, skinTone), sessionId (string)  
**Returns**: Complete `CharacterSeed` object with cultural authenticity  
**Failure Behavior**: ✅ **ALWAYS SUCCEEDS** - Cannot fail (pure computation, no database, no imports)  
**Location**: Lines 837-884 of CharacterConsistencyService.js  
**Data Sources**: 
- `HAIR_BY_SKIN_TONE_INLINE` (144+ hair options across 6 skin tones)
- `AFRICAN_AMERICAN_HAIR_INLINE` (20 boys + 20 girls styles)
- `AFRICAN_AMERICAN_FACIAL_FEATURES_INLINE` (12 descriptions)
- `getSkinFeatures()` static method for facial features
**Usage**: Ultimate fallback for `getEnhancedCharacterSeed()` failures (Tier 2.5+)  
**Performance**: < 10ms (pure computation)  
**Why It Exists**: Original `getCharacterSeed()` was over-engineered with too many failure points

### `getCharacterFromCache(sessionId, characterName)` ✅ NEW (2025-09-30)
**STATUS**: REFACTORED - SIMPLE CACHE LOOKUP  
**Responsibility**: **Simple cache lookup** - Database query with no complex logic  
**Purpose**: Check for existing cached character data without expensive orchestration  
**Parameters**: sessionId (string), characterName (string)  
**Returns**: `CharacterSeed | null`  
**Failure Behavior**: ✅ **GRACEFUL NULL RETURN** - Returns null on any error, never throws  
**Location**: Lines 891-901 of CharacterConsistencyService.js  
**Usage**: Optional cache check in orchestration layers  
**Performance**: Fast (database query with memory cache)  
**Why It Exists**: Decouples simple cache lookup from complex orchestration logic

### `getEnhancedCharacterSeed(sessionId, avatarIdentity, storyContext, sessionType, pageTextClothing)` ✅ NEW (2025-09-30)
**STATUS**: REFACTORED - FULL ORCHESTRATION  
**Responsibility**: **Full CCS orchestration** - Complete character generation with all enhancements  
**Purpose**: Provide maximum-quality character seed with database caching, cultural features, clothing detection  
**Parameters**: sessionId, avatarIdentity (object), storyContext, sessionType, pageTextClothing (optional)  
**Returns**: Complete `CharacterSeed` object **OR THROWS ERROR**  
**Failure Behavior**: ⚠️ **FAIL-FAST (THROWS ERROR)** - Signals need for tier escalation  
**Location**: Lines 918-1000 of CharacterConsistencyService.js  
**Critical Classification**: **ONLY CCS METHOD THAT TRIGGERS TIER ESCALATION**  
**Usage**: Tier 1 (`runware-generate-image`) - throws to escalate to Tier 2.5  
**Fallback Pattern**: Tier 2.5 catches errors and uses `getBasicCharacterSeed()`  
**Performance**: Heavy (50-200ms with database + orchestration)  
**Why It Exists**: Retains full orchestration capability while enabling precise failure control for tier-based architecture

### `getCharacterSeed(sessionId, avatarIdentity, storyContext, sessionType)` ✅
**STATUS**: REQUIRES PROPER ARGUMENTS  
**Purpose**: Generates consistent character seeds with avatar identity  
**Signature**: Expects `avatarIdentity` object with `{name, type, skinTone}`, not just a string  
**Usage**: Pass full `avatarIdentity` object for correct cache keys and consistency

### `getCharacterAppearanceFromStory(sessionId, characterName?)`
- Combines character appearance from all cached pages
- Returns comprehensive appearance description
- Used for character consistency across story pages

### `getColoredObjects(sessionId)`
- Returns comma-separated string of unique colored objects
- Aggregates from all pages in session
- Used for environmental consistency

### `clearSession(sessionId)`
- Clears all cached data for a session
- Called when session ends or new story begins
- Prevents memory leaks and cross-session contamination

## Integration Points

### Template AB (`runware-template-ab/index.js`) - CORRECTED
```javascript
// Service instantiation
const { CharacterConsistencyService } = await import("../_shared/CharacterConsistencyService.js");
const characterService = CharacterConsistencyService.getInstance();

// Consolidated character detection (CORRECT API)
const detections = await characterService.detectAllCharacters(pageText, {
  sessionId,
  pageNumber: pageNumber || 1,
  userInfo
});
const detectedSecondaryCharacters = detections?.secondaryCharacters || [];

// Character seed with proper avatarIdentity (CORRECT ARGUMENTS)
const avatarIdentity = {
  name: characterName,
  type: userInfo?.avatar?.type || 'child',
  skinTone: userInfo?.avatar?.skinTone || 'medium'
};
const characterSeed = await characterService.getCharacterSeed(
  sessionId,
  avatarIdentity,
  storyText || '',
  'continuing'
);

// Visual analysis
await characterService.analyzeVisualDetails(
  sessionId, storyText, pageNumber, userInfo?.name
);

// Get colored objects (MUST AWAIT)
const coloredObjects = await characterService.getColoredObjects(sessionId);
```

### Template CD Integration
Similar pattern with lazy loading and singleton instance usage.

### ⚡ Vendor-First Architecture (Global - October 2025)

**Performance Optimization**: ALL functions now benefit from vendor-first Supabase client loading, eliminating CDN failures entirely.

**Global Change**: The resilient loader now prioritizes the local vendor bundle FIRST for `@supabase/supabase-js`, only falling back to CDNs if the vendor fails. This applies to:
- All `createResilientSupabaseClient()` calls (now vendor-first + SERVICE_ROLE_KEY fallback)
- All `createVendorFirstSupabaseClient()` calls (explicit vendor-first)
- All `createDatabaseSupabaseClient()` calls (network-first with vendor fallback)

**Affected Functions:**
- `runware-generate-image/index.ts` - Lines 67-73, 342-344, 976-978
- `runware-template-ab/index.js` - Lines 2158-2173, 2234-2249
- `runware-template-cd/index.js` - Lines 293-299, 513-517 (now vendor-first)
- `CharacterConsistencyService.js/.ts` - Lines 800-838 (.js), 838-849 (.ts)
- `ServiceHealthMonitor.js` - Lines 18-22 (now vendor-first)
- `security.ts` - Lines 7, 55 (now vendor-first)
- `log-personal-info-incident/index.ts` - Lines 26-28 (now vendor-first)

**Performance Improvement:**
- **Before:** 28,000ms (4 CDN attempts @ 7s each) for network-first
- **After:** ~5ms (local vendor bundle import)
- **Impact:** Eliminates network dependency and CDN failures system-wide

**Root Cause Fix:**
- CDN imports (esm.sh, jspm.io, jsdelivr, unpkg) were failing due to edge runtime constraints
- Vendor-first approach eliminates these 4 failing CDN attempts entirely
- All Supabase clients now load from local vendor bundle first

## Visual Consistency Flow

1. **Page Analysis**: Each story page analyzed for visual details
2. **Character Extraction**: Main and secondary characters identified
3. **Appearance Caching**: Character traits stored by session
4. **Seed Generation**: Consistent seeds for character appearance
5. **Cross-Page Consistency**: Same characters maintain appearance
6. **Session Cleanup**: Data cleared when session ends

## Caching Strategy

### Visual Detail Cache
- **Key**: `${sessionId}_${pageNumber}`
- **Content**: Colored objects, atmospheric words, character appearance
- **Persistence**: Session duration only

### Secondary Character Cache
- **Key**: `${sessionId}_${pageNumber}_secondary`
- **Content**: Character names, relationships, context
- **Persistence**: Session duration only

## Error Handling
- Lazy loading with fallback if service unavailable
- Graceful degradation if methods fail
- Console warnings for debugging
- No impact on story generation if character service fails

## Performance Considerations
- Singleton pattern prevents multiple instances
- Caching reduces redundant analysis
- Memory cleanup on session end
- Lazy loading reduces initial bundle size

## Documentation Cross-Reference

For complete details on:
- **Integration Status**: See [CHARACTER_CONSISTENCY_STATUS.md](./CHARACTER_CONSISTENCY_STATUS.md)
- **Resolved Errors**: See [MASTER_ERRORS_TO_FIX_ERROR_050_051.md](./MASTER_ERRORS_TO_FIX_ERROR_050_051.md)
- **Secondary Characters**: See CHARACTER_CONSISTENCY_STATUS.md § Secondary Character Integration
- **Testing Procedures**: See CHARACTER_CONSISTENCY_STATUS.md § Testing & Validation

---

## Future Enhancements
- Cross-session character persistence for premium users
- Enhanced relationship detection algorithms
- Visual similarity scoring for character consistency
- Integration with story library character storage

---

**Last Updated**: 2025-09-30  
**Status**: All critical errors resolved (ERROR-050, ERROR-051, ERROR-052, ERROR-054)  
**Recent Enhancement**: 3-Tier Cultural Enhancement System with LEAN_CULTURAL_FALLBACK