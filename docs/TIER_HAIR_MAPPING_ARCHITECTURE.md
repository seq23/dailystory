# Tier Hair Mapping Architecture

## Overview
This document defines the hair mapping architecture across frontend and backend systems to ensure 1:1 parity and prevent regressions.

## Hair Array Requirements
- **Frontend**: `src/services/StaticDataCache.ts` - 73 total variations
- **Backend**: `supabase/functions/_shared/tier25Vocabulary.js` - 73 total variations  
- **Rule**: Must maintain exact 1:1 parity between frontend and backend

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
- `HAIR_BY_SKIN_TONE` frontend mapping (73 items total)

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

## Hair Mapping by Skin Tone (73 Total Variations)

### Pale (14 variations)
Red/Auburn focus: strawberry blonde, golden red, auburn curls, copper, reddish brown, ginger, red-gold, russet, mahogany red, burgundy, crimson, rose gold, amber red, cinnamon red

### Light (15 variations)  
Blonde focus: platinum, golden, honey, ash, sandy, wheat, butter, cream, champagne, vanilla, pearl, silver, moonlight, sunshine, caramel blonde

### Medium (15 variations)
Brown focus: chestnut, chocolate, coffee, walnut, hazelnut, mahogany, amber, bronze, toffee, mocha, caramel, russet, cedar, oak, maple brown

### Olive (14 variations)
Black/Dark focus: jet black, raven, midnight, obsidian, coal, ebony, onyx, charcoal, deep black, ink, shadow, pitch black, dark espresso, blackest brown

### Dark (7 variations)
Generic descriptive: beautiful dark, rich black, lustrous dark, silky black, gorgeous dark, shining black, magnificent dark

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