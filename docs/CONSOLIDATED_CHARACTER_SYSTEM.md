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

### CharacterConsistencyService Methods

#### Character Management
- `getCharacterSeed(sessionId, avatarIdentity, storyContext, sessionType, pageTextClothing?)` - Get/create character with consistency
  - **CRITICAL**: `avatarIdentity` MUST be an object `{name, type, skinTone}`, NOT a string
  - **Incorrect**: `getCharacterSeed(sessionId, characterName)` ❌
  - **Correct**: `getCharacterSeed(sessionId, {name, type, skinTone}, storyContext, 'continuing')` ✅
- `getCulturalEnhancements(userInfo, sessionId, characterName)` - Get cultural traits with seeding
- `generateSecondaryCharacter(type, details, userInfo, sessionId)` - Create secondary characters
- `getSecondaryCharacterSeed(sessionId, characterName, characterType, userInfo?)` - Get secondary character seeds

#### Visual Detail Management  
- `analyzeVisualDetails(sessionId, pageText, pageNumber, characterName?)` - Detect and store visual elements
- `getColoredObjects(sessionId)` - Get detected colored objects for consistency
  - **CRITICAL**: This method is async, MUST be awaited
  - **Incorrect**: `const objects = service.getColoredObjects(sessionId)` ❌
  - **Correct**: `const objects = await service.getColoredObjects(sessionId)` ✅
- `getCharacterAppearanceFromStory(sessionId, characterName?)` - Build appearance description
- `buildClothingDescription(sessionId, characterName)` - Get character clothing description
- `getSessionSetting(sessionId)` - Get persistent setting across pages

#### Detection & Analysis
- `detectAllCharacters(text, context)` - **[CONSOLIDATED API]** Unified character detection
  - **Returns**: `{ secondaryCharacters: [...], humans: {...}, animals: {...}, ... }`
  - **Replaces**: Old `detectSecondaryCharacters` method  
  - **Usage**: Template AB MUST use this instead of deprecated methods
- `detectAnimals(text, context)` - Enhanced animal detection with species validation
- `detectCharacterAnimals(originalText, lowercaseText)` - Named animal detection
- `detectRelationships(text, context)` - Relationship pattern detection

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

## Benefits Achieved

### Performance
- **Single Service**: No redundant imports or lazy loading
- **Minimal DB**: Only 2 tables actively written to
- **Direct Orchestration**: No intermediate orchestrator layer
- **Efficient Caching**: Database-backed consistency across edge instances

### Consistency  
- **Unified Logic**: All character functionality in one place
- **Seed-Based**: Deterministic character generation across pages
- **Database Persistence**: Consistent data across edge function instances
- **Cultural Continuity**: Persistent cultural trait selections per session

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