# Tier Hair Mapping Architecture

## Overview
This document defines the 3-way hair mapping architecture across frontend and backend systems to ensure proper separation of concerns and prevent regressions.

## 3-Way Hair Mapping Architecture (October 2025)

### File Structure and Responsibilities
- **Frontend Story** (`src/services/StaticDataCache.ts`): 65 variations - FOR STORY GENERATION ONLY
- **Backend Failsafe** (`supabase/functions/generate-adaptive-story/StaticDataCache.ts`): 65 story + 65 image - FAILSAFE CATCH-ALL  
- **Backend Image** (`supabase/functions/_shared/StaticDataCache.js`): 65 variations - FOR IMAGE GENERATION ONLY

### Architecture Rules
1. Frontend and Backend must maintain identical 65 styling variations for story consistency
2. Backend .js provides image-optimized descriptors for visual generation
3. Backend .ts failsafe contains BOTH modes to handle either scenario
4. All three files must be updated together when hair mappings change

## Cultural Enhancement System
- **Only African American enhancements are supported**
- Uses comprehensive arrays: 30 hairstyles + 36 facial features
- All other cultural arrays removed as unused (asian, hispanic, etc.)

## Tier Responsibilities
- **Tier 2.5B**: Uses `bundle.culturalEnhancements` via `UniversalPlaceholderResolver`
- **Tier 2.5C**: Uses `{cultural.hair}` + `{cultural.features}` via `UnifiedPlaceholderResolver`

## Protected Arrays
- `HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES` (30 items total)
- `HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES` (36 items)
- `HAIR_BY_SKIN_TONE` mapping (65 items total across all 3 files)

## Modification Rules
1. Never modify hair arrays without updating both frontend and backend
2. Cultural enhancements only support 'african' cultural type
3. getCulturalSelection() only routes 'african' requests to comprehensive arrays
4. All other cultural requests return empty string

## Session-Seeded Hair Selection (September 2025)

### Implementation
- **Location**: `src/services/SimpleImageService.ts` (lines 876-947)
- **Algorithm**: Seeded PRNG using sessionId for deterministic variety
- **Benefit**: Consistent hair within session + variety between sessions

### Functions
```javascript
// Session-seeded random selection
createSeededRandom(seed: number): () => number
pickFromArray<T>(arr: T[], sessionId: string): T
```

### Selection Logic
1. Convert `sessionId` to numeric seed
2. Use seeded PRNG to pick from array
3. Same session = same random selection
4. Different sessions = different selections

### Hair Selection Priority (UPDATED)
1. **Ethnicity Override** (deterministic for cultural authenticity)
2. **Session-Seeded Selection** from `HAIR_BY_SKIN_TONE` arrays
3. ~~userInfo.hair override~~ **REMOVED** (was causing consistency bugs)

### Critical Change
**BEFORE**: `hair: userInfo.hair || universalHair`  
**AFTER**: `hair: universalHair`  
- Ensures session-seeded hair is always used
- Prevents external overrides from breaking consistency

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