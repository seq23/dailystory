# CHARACTER CONSISTENCY ARCHITECTURE - Technical Reference

> **Note**: This document provides supplementary technical details. For complete status, integration guides, and resolved errors, see the canonical **[CHARACTER_CONSISTENCY_STATUS.md](./CHARACTER_CONSISTENCY_STATUS.md)**.

---

## Service Overview

**Location**: `supabase/functions/_shared/CharacterConsistencyService.js`  
**Pattern**: Singleton instance (pre-instantiated)  
**Integration**: All image generation edge functions

---

## Method Reference (Quick Lookup)

### `getInstance()`
Returns singleton instance of the service.

### `analyzeVisualDetails(sessionId, pageText, pageNumber, characterName?)`
- Analyzes and caches visual details from story text
- Extracts colored objects, atmospheric words, character appearance
- Stores data by sessionId and pageNumber

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

### `getCulturalEnhancements(userInfo, sessionId, characterName)` ✅
**STATUS**: SIGNATURE VERIFIED  
**Purpose**: Generates culturally appropriate character enhancements  
**Parameters**: userInfo (object), sessionId (string), characterName (string)  
**Returns**: `{ hair, features }` - Does NOT return skinTone  
**Usage**: Direct Mode (line 385-392), AI visual scenes, templates  
**Fixes**: ERROR-049, ERROR-050 (import pattern standardized)

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
**Status**: All critical errors resolved (ERROR-050, ERROR-051, ERROR-052)