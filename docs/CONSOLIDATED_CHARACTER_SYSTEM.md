# CONSOLIDATED CHARACTER SYSTEM

## Overview

The character consistency system has been completely consolidated into a single, unified service that handles all character-related functionality. This eliminates redundancy and provides a clear, maintainable architecture.

## Architecture

### Single Source of Truth: `CharacterConsistencyService`

**Location**: `supabase/functions/_shared/CharacterConsistencyService.js`

This service now owns ALL character-related functionality:

- **Character Generation & Consistency**: Primary and secondary character creation with seed-based consistency
- **Visual Detail Tracking**: Clothing, appearance, and object detection with database persistence  
- **Secondary Character Detection**: Comprehensive relationship pattern detection with 25+ types
- **Cultural Enhancements**: Consistent cultural trait application
- **Database Management**: Writes only to authoritative tables (see below)

### Minimal Database Footprint

The system now writes to only **2 authoritative tables**:

1. **`character_consistency_cache`**: Stores character seeds, cultural selections, and consistency data per session
2. **`visual_details_cache`**: Stores detected clothing, settings, objects, and visual signals per session/page

**Legacy Tables** (read-only, no longer written to):
- `character_traits` - Legacy, deprecated
- `visual_details` - Legacy, deprecated

### Inlined Orchestration

**Main Orchestrator**: `supabase/functions/runware-generate-image/index.ts`

The PhaseIntegrationOrchestrator has been eliminated and its logic inlined directly into the main image generation function. This provides:

- **Direct Orchestration**: No lazy loading or dependency issues
- **Tier Routing**: Tier 1 → Direct Mode → 2.5A → 2.5B → 2.5C cascade
- **Enhanced Prompts**: Calls CharacterConsistencyService for all data needs
- **AI Scene Generation**: Uses `ai-visual-scene-creator` for primaryScene via OpenAI

### AI Scene Generation

**Service**: `supabase/functions/ai-visual-scene-creator/index.ts`

Explicitly handles OpenAI integration for generating primaryScene descriptions:
- **Model**: `gpt-5-mini-2025-08-07` with `max_completion_tokens`
- **Input Validation**: Flexible acceptance of pageText OR storyText  
- **Fallback Handling**: Graceful degradation when AI fails
- **Integration**: Called by runware-generate-image for Tier 1 processing

## API Surface

### CharacterConsistencyService Core Methods (Performance-Optimized)

#### The 5 Core Methods

1. **`batchFetchCCSData(sessionId, characterName)`**
   - **Purpose**: Fetch all CCS data in a single database query
   - **Returns**: `{ characterSeed, visualDetails, coloredObjects, latestClothing }`
   - **Performance**: Replaces 6 separate queries with 1 batch query
   - **Database Tables**: `character_consistency_cache`, `visual_details_cache`

2. **`getStructuredAvatarData(sessionId, userInfo)`**
   - **Purpose**: Generate hair/skin consistency from avatar identity
   - **Returns**: `{ skinTone, hairColor, skinFeatures, type, name, age, nativeLanguage, ethnicity }`
   - **Data Sources**: Inline vocabulary (HAIR_BY_SKIN_TONE_INLINE, AFRICAN_AMERICAN_HAIR_INLINE, AFRICAN_AMERICAN_FACIAL_FEATURES_INLINE)
   - **Eye Color**: Embedded in `skinFeatures` for African American users, inferred from story for others

3. **`getEnhancedCharacterSeed(sessionId, avatarIdentity, storyContext, sessionType, pageTextClothing)`**
   - **Purpose**: Fetch or generate full character seed **including cultural enhancements**
   - **Returns**: Character seed with `selectedCulturalHair` and `selectedCulturalFeatures`
   - **Database Tables**: `character_consistency_cache` (read/write)
   - **Critical**: Includes cultural bundle - no need for separate `getCulturalEnhancements()` call
   - **Clothing Persistence**: Uses `pageTextClothing` parameter to maintain clothing across pages

4. **`analyzeVisualDetails(sessionId, pageText, pageNumber) + getColoredObjects(sessionId)`**
   - **Purpose**: Extract colored objects and cache them
   - **Returns**: Array of colored object strings (e.g., `["red ball", "blue shirt"]`)
   - **Database Tables**: `visual_details_cache` (write)
   - **Vocabulary**: Uses Tier 25 cache first (240 words), lazy-loads full vocab if needed

5. **`detectAllCharacters(text, context) + batchWriteDetections(sessionId, pageNumber, detectionResults)`**
   - **Purpose**: Detect secondary characters and main character appearance, batch write to database
   - **Returns**: `{ secondaryCharacters: [...], mainCharacterAppearance: {...} }`
   - **Database Tables**: `visual_details_cache` (write)
   - **Clothing Detection**: Stores clothing in `visual_details_cache` with `detail_type: 'clothing'`
   - **Performance**: Batch writes all detections in 1 query

#### Helper Methods

- **`buildClothingDescription(sessionId, characterName)`** - Get most recent clothing (fixed to return only latest, not all)
- **`detectSimpleAtmosphere(pageText)`** - Detect indoor/outdoor context using tiered vocabulary
- **`generateSecondaryCharacter(characterName, characterType, userInfo, sessionId)`** - Create secondary characters
- **`getSecondaryCharacterSeed(sessionId, characterName, characterType, userInfo)`** - Get secondary character seeds

#### Deprecated Methods (Removed from Orchestrator)

- ~~`getCulturalEnhancements(userInfo, sessionId, characterName)`~~ - **REDUNDANT** (duplicates `getEnhancedCharacterSeed`)
- ~~`getCharacterAppearanceFromStory(sessionId, characterName)`~~ - **DEAD CODE** (never used in orchestrator)
- ~~`getSessionSetting(sessionId, "never_ending_story")`~~ - **DEAD CODE** (never used)
- ~~`getSessionSetting(sessionId, "context")`~~ - **REPLACED** by `detectSimpleAtmosphere()`

#### Session Management
- `clearSession(sessionId)` - Clear all session data from both authoritative tables
- `clearServerState()` - Clear memory cache

## Integration Points

### Frontend Integration
The frontend should NOT import character services directly. All character consistency is handled server-side through:
- Edge function calls to `runware-generate-image`  
- Backend-driven session management
- Database-backed persistence across edge instances

### Image Generation Flow
1. **Request** → `runware-generate-image/index.ts`
2. **Tier 1** → Inlined orchestration calls CharacterConsistencyService
3. **AI Scene** → `ai-visual-scene-creator` generates primaryScene via OpenAI
4. **Enhancement** → Cultural traits, visual details, secondary characters added
5. **Generation** → Enhanced prompt sent to Runware API
6. **Fallback** → Tier cascade if any step fails

## Data Flow

### Character Consistency
```
User Request → CharacterConsistencyService.getCharacterSeed() → character_consistency_cache
                ↓
          Cultural Enhancements → character_consistency_cache (cultural selections)
                ↓  
          Visual Analysis → visual_details_cache (clothing, objects, settings)
                ↓
          Enhanced Prompt Generation → Image Generation
```

### Session Management  
```
New Story → clearSession() → Clear both authoritative tables
  ↓
Story Generation → Populate character_consistency_cache & visual_details_cache  
  ↓
Navigation → Retrieve from authoritative tables for consistency
  ↓
Next Story → clearSession() → Fresh start
```

## Tiered Caching Architecture

### Overview
The CharacterConsistencyService implements a **2-tier vocabulary caching system** for optimal memory usage and performance.

### Tier 1: TIER_25_EXTENDED (Fast Path)
- **Size**: 240 words, ~6KB
- **Load Time**: Instant (loaded on first use)
- **Coverage**: 75-90% of typical story vocabulary
- **Categories**: colors, actions, objects, clothing, settings, relationships, animals
- **Lookup**: O(1) via `getTier25Cache()`

### Tier 2: UNIVERSAL_VOCAB (Fallback)
- **Size**: 708 words, ~15KB
- **Load Time**: Lazy-loaded only on cache miss
- **Coverage**: 100% of vocabulary
- **Trigger**: Only when tier25 doesn't find required words
- **Lookup**: O(1) after loading

### Performance Impact
| Metric | Before Tiered Caching | After Tiered Caching | Improvement |
|--------|----------------------|---------------------|-------------|
| **Startup Memory** | 15KB (full vocab) | 6KB (tier25 only) | **60% reduction** |
| **Vocabulary Load** | 708 words | 240 words | **66% faster** |
| **Cache Hit Rate** | 0% (no cache) | 75-90% | **New capability** |
| **Detection Cycles** | 100% full vocab | 25-55% full vocab | **45-75% reduction** |

### Methods Using Tiered Caching
1. **`detectColoredObjects()`** - Tier25 first, full vocab if < 2 detections
2. **`detectSecondaryCharacters()`** - Tier25 relationships first, full vocab fallback
3. **`detectAppearance()`** - Tier25 clothing first, full vocab if no matches
4. **`detectSimpleAtmosphere()`** - Tier25 context words first, full vocab if inconclusive
5. **`buildClothingDescription()`** - DB cache → tier25 → full vocab cascade

## Benefits Achieved

### Performance
- **Single Service**: No redundant imports or lazy loading
- **Minimal DB**: Only 2 tables actively written to
- **Direct Orchestration**: No intermediate orchestrator layer
- **Efficient Caching**: Database-backed consistency across edge instances
- **Tiered Vocabulary**: 60% memory reduction, 66% faster startup, 75-90% cache hit rate
- **3-Tier Cultural Enhancement**: StaticDataCache → LEAN_CULTURAL_FALLBACK → eliminated generic (ERROR-054 fix)

### Consistency  
- **Unified Logic**: All character functionality in one place
- **Seed-Based**: Deterministic character generation across pages
- **Database Persistence**: Consistent data across edge function instances, automatic persistence after cultural enhancement generation (ERROR-054 fix)
- **Cultural Continuity**: Persistent cultural trait selections per session via enhanced ESSENTIAL_VOCABULARY (134+ words) and LEAN_CULTURAL_FALLBACK system

### Maintainability
- **Single Source**: One service to maintain for all character functionality
- **Clear Ownership**: Explicit table responsibilities 
- **Inlined Logic**: No complex orchestrator dependencies
- **TypeScript Parity**: 1:1 TS mirror available for type safety

## Removed Files

The following files were consolidated and are no longer needed:
- `supabase/functions/_shared/UnifiedCharacterDescriptor.js` (927 lines → ✅ consolidated into CharacterConsistencyService.js)
- `supabase/functions/_shared/VisualDetailTracker.js` (462 lines → ✅ consolidated into CharacterConsistencyService.js)  
- `supabase/functions/_shared/VisualDetailTracker.ts` (579 lines → ✅ consolidated into CharacterConsistencyService.js)
- `supabase/functions/_shared/SecondaryElementDetector.ts` (329 lines → ✅ consolidated into CharacterConsistencyService.js)
- `supabase/functions/_shared/PhaseIntegrationOrchestrator.js` (906 lines → ✅ inlined into runware-generate-image/index.ts)
- `src/services/UnifiedCharacterDescriptor.ts` (frontend legacy → removed)
- `src/services/CharacterConsistencyService.ts` (frontend mock → removed)

## Monitoring & Debugging

All character operations include comprehensive logging:
- **Character Generation**: Seed creation, cultural selection, database operations
- **Visual Detection**: Clothing, object, and character detection with confidence scores  
- **Secondary Characters**: Detection patterns, relationship types, seed generation
- **Database Operations**: All reads/writes to authoritative tables
- **Session Management**: Cache clearing, session transitions

Use the consolidated service's logging to debug any character-related issues across the entire story generation pipeline.