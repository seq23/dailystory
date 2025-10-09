# Tier Hair Mapping Architecture

## Overview
This document defines the 3-way hair mapping architecture across frontend and backend systems to ensure proper separation of concerns and prevent regressions.

## 3-Way Hair Mapping Architecture (October 2025 - Updated with Direct Mode Parity)

### File Structure and Responsibilities
- **Frontend Story** (`src/services/StaticDataCache.ts`): 65 variations - FOR STORY GENERATION ONLY
- **Backend Failsafe** (`supabase/functions/generate-adaptive-story/StaticDataCache.ts`): 65 story + 65 image - FAILSAFE CATCH-ALL  
- **Backend Image** (`supabase/functions/_shared/StaticDataCache.js`): 65 variations - FOR IMAGE GENERATION ONLY
- **Direct Mode** (`supabase/functions/ai-visual-scene-creator/index.ts`): 65 general + 42 African American = **107 total variations** - 1:1 PARITY WITH ORCHESTRATOR

### Architecture Rules
1. Frontend and Backend must maintain identical 65 styling variations for story consistency
2. Backend .js provides image-optimized descriptors for visual generation
3. Backend .ts failsafe contains BOTH modes to handle either scenario
4. **Direct Mode now has 1:1 parity with orchestrator** for all hair arrays and African American cultural arrays
5. All files must be updated together when hair mappings change

## Cultural Enhancement System
- **Only African American enhancements are supported**
- Uses comprehensive arrays: **42 hairstyles** (10 boys + 20 girls + 12 child) + **36 facial features**
- **Direct Mode now includes full African American cultural arrays** (previously missing)
- All other cultural arrays removed as unused (asian, hispanic, etc.)

## Tier Responsibilities
- **Tier 2.5B**: Uses `bundle.culturalEnhancements` via `UniversalPlaceholderResolver`
- **Tier 2.5C**: Uses `{cultural.hair}` + `{cultural.features}` via `UnifiedPlaceholderResolver`
- **Direct Mode**: Uses inline `AFRICAN_AMERICAN_HAIR_INLINE` + `AFRICAN_AMERICAN_FACIAL_FEATURES_INLINE` arrays

## Protected Arrays
- `HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES` (30 items total - Template Service)
- `AFRICAN_AMERICAN_HAIR_INLINE` (42 items total - Direct Mode) - **NEW**
- `HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES` (36 items - Template Service)
- `AFRICAN_AMERICAN_FACIAL_FEATURES_INLINE` (36 items - Direct Mode) - **NEW**
- `HAIR_BY_SKIN_TONE` mapping (65 items total across all files)
- `INLINE_HAIR_BY_SKIN` mapping (65 items - Direct Mode) - **NOW 1:1 PARITY**

## Modification Rules
1. Never modify hair arrays without updating both frontend, backend, AND Direct Mode
2. Cultural enhancements only support 'african' cultural type
3. getCulturalSelection() only routes 'african' requests to comprehensive arrays
4. All other cultural requests return empty string
5. **Direct Mode hair arrays MUST maintain 1:1 parity with orchestrator** (including " hair" suffix)

## Session-Seeded Hair Selection (October 2025 - Backend Implementation)

### Implementation Locations
- **Backend Story Generation**: `supabase/functions/generate-adaptive-story/StaticDataCache.ts` (lines 341-352, 389, 401, 412)
- **Frontend Image Generation**: `src/services/SimpleImageService.ts` (lines 876-947)
- **Algorithm**: Seeded PRNG using sessionId for deterministic variety
- **Benefit**: Consistent hair within session + variety between sessions

### Backend Functions (Story Generation)
```typescript
// Session-seeded PRNG utilities
const createSeededRandom = (seed: string): number => {
  const numericSeed = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return numericSeed;
};

const seededIndex = (sessionId: string, arrayLength: number): number => {
  const seed = createSeededRandom(sessionId);
  return seed % arrayLength;
};

// Updated function signature with optional sessionId
export const processAvatarIdentityFromCache = (userInfo: any, sessionId?: string) => {
  // ...
  const skinToneVariation = sessionId
    ? skinToneVariations[seededIndex(sessionId, skinToneVariations.length)]
    : skinToneVariations[Math.floor(Math.random() * skinToneVariations.length)];
  
  const hairColor = sessionId
    ? filteredHairOptions[seededIndex(sessionId, filteredHairOptions.length)]
    : filteredHairOptions[Math.floor(Math.random() * filteredHairOptions.length)];
};
```

### Frontend Functions (Image Generation)
```javascript
// Session-seeded random selection
createSeededRandom(seed: number): () => number
pickFromArray<T>(arr: T[], sessionId: string): T
```

### Selection Logic
1. Convert `sessionId` string to numeric seed via character code sum
2. Use modulo operator (`seed % arrayLength`) for deterministic index selection
3. Same session = same index = same hair/skin variation
4. Different sessions = different seeds = different variations

### Integration Points
**Backend Story Generation**:
- Entry: `supabase/functions/generate-adaptive-story/streamlined-handler.ts` (line 783)
- Call: `processAvatarIdentityFromCache(completeAvatarInfo, bundle.sessionId)`
- Result: Consistent hair descriptions in story text across all pages

**Frontend Image Generation**:
- Entry: `src/services/SimpleImageService.ts`
- Uses: Session-seeded selection for visual consistency
- Result: Generated images match story text hair descriptions

### Hair Selection Priority (UPDATED)
1. **Ethnicity Override** (deterministic for cultural authenticity)
2. **Session-Seeded Selection** from `HAIR_STORY_MODE` arrays (backend) or `HAIR_BY_SKIN_TONE` arrays (frontend)
3. **Fallback**: `Math.random()` when no sessionId provided (backward compatible)

### Mathematical Consistency Proof
```typescript
// Example: sessionId = "abc123"
// Character codes: a=97, b=98, c=99, 1=49, 2=50, 3=51
// numericSeed = 97 + 98 + 99 + 49 + 50 + 51 = 444
// For array length 15: index = 444 % 15 = 9
// Result: Always returns index 9 for sessionId "abc123"
```

### Business Logic Preserved
- **Guest Users**: Fresh sessionId per story → Different hair per story ✅ VARIETY
- **Premium Users**: Same sessionId across pages → Same hair across pages ✅ CONSISTENCY
- **Backward Compatibility**: Optional parameter with Math.random() fallback ✅ NO BREAKING CHANGES

### Inline CCS Alignment (January 2025)
**Location**: `supabase/functions/runware-generate-image/CharacterConsistencyServiceInline.js`
- **Updated Method**: `getStructuredAvatarData()` now returns `skinFeatures` to prevent downstream fallbacks
- **Skin Feature Arrays**: Added `PALE_SKIN_FEATURES_INLINE`, `LIGHT_SKIN_FEATURES_INLINE`, `MEDIUM_SKIN_FEATURES_INLINE`, `OLIVE_SKIN_FEATURES_INLINE` (12 variations each)
- **African American Features**: Uses `AFRICAN_AMERICAN_FACIAL_FEATURES_INLINE` (36 variations) inline within CCS
- **Cultural Routing**: dark + en/es/fr/pt → African American hair (30) + features (36), all other combinations → Generic hair (65) + skin tone feature arrays
- **Benefit**: All hair/skin mappings are inline in CCS - NO StaticDataCache dependency
- **Note**: StaticDataCache DOES NOT contain getHairBySkintone/getSkinBySkintone functions

## Hair Mapping by Skin Tone (65 Total Variations)

### Story Mode (Frontend .ts + Backend .ts Failsafe)
Used for text narratives in story generation:

**Pale (14 variations)**  
Styling terms: long red, short red, red in pigtails, red in ponytail, shoulder-length red, long auburn, short auburn, auburn in braids, shoulder-length auburn, long strawberry blonde, short strawberry blonde, strawberry blonde in pigtails, curly red, wavy auburn

**Light (15 variations)**  
Styling terms: long blonde, short blonde, blonde in pigtails, blonde in ponytail, shoulder-length blonde, long platinum blonde, short platinum blonde, long golden blonde, short golden blonde, golden blonde in braids, long dirty blonde, short dirty blonde, curly blonde, wavy blonde, blonde in twin braids

**Medium (15 variations)**  
Styling terms: long brown, short brown, brown in ponytail, brown in pigtails, shoulder-length brown, long chestnut, short chestnut, chestnut in braids, long dark brown, short dark brown, dark brown in ponytail, curly brown, wavy brown, brown in bun, shoulder-length chestnut

**Olive (14 variations)**  
Styling terms: long black, short black, black in ponytail, black in braids, shoulder-length black, long jet black, short jet black, jet black in bun, long dark brown, short dark brown, dark brown in ponytail, straight black, wavy black, black in twin braids

**Dark (7 variations)**  
Generic descriptive: pretty hair, thick hair, shiny hair, great hair, amazing hair, awesome hair, voluminous thick hair

### Image Mode (Backend .js)
Used for AI image generation prompts - currently matches Story Mode for consistency (65 variations)

## Cultural Enhancement Detection
```javascript
// UnifiedPlaceholderResolver.js - detectCulturalContext()
// Only returns 'african' or 'none' - no other cultural types supported
if (skinTone === 'dark' || skinTone === 'darker') {
  return 'african'; // Uses comprehensive HARDCODED_AFRICAN_AMERICAN_* arrays
}
return 'none'; // No cultural enhancements for light skin users
```

## Cleanup Summary
**Removed Arrays** (67 unused items):
- european: 10 hair + 6 features (16 items) 
- asian: 8 hair + 6 features (14 items)
- hispanic: 8 hair + 6 features (14 items) 
- middleEastern: 7 hair + 5 features (12 items)
- nativeAmerican: 6 hair + 5 features (11 items)

**Result**: Clean architecture with only active arrays and perfect frontend/backend hair parity.

---

## E2E Verification & System Architecture (January 2025)

### Actual Usage vs Assumptions

**ACTIVELY USED COMPONENTS:**
1. **Frontend Story** (`src/services/StaticDataCache.ts`):
   - Used by: `CleanStoryDisplay` component via `storyGenerationService.generateStoryPage()`
   - Purpose: Lightweight avatar processing for story text generation
   - Hair Data: 65 variations in `HAIR_STORY_MODE` constant

2. **Backend Failsafe** (`supabase/functions/generate-adaptive-story/StaticDataCache.ts`):
   - Used by: `streamlined-handler.ts` at line 780 via `processAvatarIdentityFromCache()`
   - Purpose: Server-side story generation with enhanced avatar processing + binary validation
   - Hair Data: 65 variations in `HAIR_STORY_MODE` constant
   - Also used by: `determineImageGenerationTier()` for avatar completeness validation

**DORMANT COMPONENT:**
3. **Backend Image** (`supabase/functions/_shared/StaticDataCache.js`):
   - Status: EXISTS BUT NOT ACTIVELY USED
   - Not imported by: `runware-generate-image`, `ai-visual-scene-creator`, or other active edge functions
   - Hair Data: 65 variations (maintained for potential future use)
   - Note: Image services use embedded/inlined hair data (73 variations) from `SimpleImageService.ts` instead

### processAvatarIdentityFromCache() - Central Avatar Processing Hub

**Function Location:**
- Frontend: `src/services/StaticDataCache.ts` (lightweight version)
- Backend: `supabase/functions/generate-adaptive-story/StaticDataCache.ts` (full version with validation)

**Entry Points:**
1. Frontend story generation → `CleanStoryDisplay` → `storyGenerationService.generateStoryPage()` → bundles `userInfo`
2. Backend story generation → `generate-adaptive-story/index.ts` → `handleStreamlinedGeneration()` → line 780: `processAvatarIdentityFromCache(completeAvatarInfo)`
3. Tier routing → `determineImageGenerationTier()` → validates avatar completeness

**Complete E2E Data Flow:**
```
Frontend Request (CleanStoryDisplay)
  ↓
storyGenerationService.generateStoryPage(userInfo)
  ↓ bundles: avatarType, skinTone, characterName, nativeLanguage, etc.
  ↓
Supabase Edge Function: generate-adaptive-story/index.ts
  ↓
streamlined-handler.ts → handleStreamlinedGeneration()
  ↓
Line 780: processAvatarIdentityFromCache(completeAvatarInfo)
  ↓
PROCESSING STEPS:
  1. Binary Validation → validateAvatarIdentityCompleteness()
  2. Data Extraction → avatarType, skinTone, userName, nativeLanguage
  3. Cultural Profile Detection → detectCulturalProfile() maps language + skinTone
  4. Enhanced Skin Tone Variation → selects from CULTURAL_SKIN_TONE_VARIATIONS arrays
  5. Hair Color Processing → retrieves from HAIR_STORY_MODE (65 variations)
     - Filters gendered styles for 'prefer-not-to-answer' avatars
  6. Gender/Pronoun Processing → getGenderPronounMapping() maps to pronouns
  7. Complete Avatar Bundle Creation → returns full object
  ↓
OUTPUT: {
  type, skinTone, skinToneVariation, hairColor, culturalProfile,
  nativeLanguage, name, pronoun, completeGenderInfo, visualDescription,
  validationInfo, timestamp
}
  ↓
Used for: Story text enhancement, Image generation routing, Cultural context
```

**Data Sources (What processAvatarIdentityFromCache Pulls From):**

1. **Hair Mappings (65 variations)**:
   - Source: `HAIR_STORY_MODE` constant in Backend StaticDataCache.ts
   - Structure: Organized by skin tone (Pale: 14, Light: 15, Medium: 15, Olive: 14, Dark: 7)
   - Example: "long blonde", "brown in ponytail", "natural coily hair", etc.

2. **Cultural Skin Tone Variations**:
   - Source: `CULTURAL_SKIN_TONE_VARIATIONS` arrays
   - Purpose: Respectful, authentic descriptions like "beautiful rich dark skin"
   - Used for: Enhanced visual descriptions in story text

3. **Gender/Pronoun Mappings**:
   - Source: `getGenderPronounMapping()` function
   - Returns: Pronouns (she/her, he/him, they/them) + full gender information
   - Maps: `avatarType` → complete pronoun + gender data

4. **Cultural Context Arrays** (from `getCulturalContextArrays()`):
   - 9 cultural contexts: Names, Foods, Celebrations, Values, Sports, Music, Art, Literature, History
   - African American Names: 65 PROTECTED entries (see AFRICAN_AMERICAN_ARRAYS_DO_NOT_TOUCH.md)
   - Example Names: 'Zoe', 'Cheyenne', 'Brooklyn', 'Layla', 'Kennedy', 'Christian', etc.

**Current System Usage:**
- Backend failsafe: Story generation enhancement with full validation
- Tier routing: Avatar completeness validation for image generation tier selection
- Frontend: Lightweight avatar processing for story text generation
- Results applied to: Story text enhancement, image generation routing, cultural context

---

## Protected Cultural Arrays Summary

### African American Names (65 entries - PROTECTED)
- **Status**: MAXIMUM protection - SENTIMENTAL value
- **Location**: Both Frontend and Backend StaticDataCache.ts files
- **Count**: 65 entries (matches hair variations for system consistency)
- **Documentation**: See `docs/AFRICAN_AMERICAN_ARRAYS_DO_NOT_TOUCH.md` for complete array
- **Warning**: Hand-curated with sentimental value - NEVER modify without business approval