# CHARACTER CONSISTENCY ARCHITECTURE

## Single Source of Truth: CharacterConsistencyService ✅

**Location**: `supabase/functions/_shared/CharacterConsistencyService.js`  
**Pattern**: Singleton instance  
**Integration**: All edge functions use this service

## Core Methods - VERIFIED PRESENT

### `getInstance()`
Returns singleton instance of the service.

### `analyzeVisualDetails(sessionId, pageText, pageNumber, characterName?)`
- Analyzes and caches visual details from story text
- Extracts colored objects, atmospheric words, character appearance
- Stores data by sessionId and pageNumber

### `detectSecondaryCharacters(sessionId, pageText, pageNumber)`
- Detects secondary characters and relationships
- Uses pattern matching for family members, friends, etc.
- Returns array of character objects with names and relationships

### `getSecondaryCharacterSeed(sessionId, characterName, type)` ✅
**STATUS**: VERIFIED PRESENT - NOT A BUG  
**Purpose**: Generates consistent seeds for secondary character appearance  
**Usage**: Called correctly in `runware-template-ab/index.js` lines 248-252

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

### Template AB (`runware-template-ab/index.js`)
```javascript
// Service instantiation
const CharacterService = await getCharacterService();
const characterService = CharacterService.getInstance();

// Secondary character detection
const detectedCharacters = await characterService.detectSecondaryCharacters(
  sessionId, storyText, pageNumber
);

// Character seed generation
const secondaryData = await characterService.getSecondaryCharacterSeed(
  sessionId, characterName, 'secondary_character'
);

// Visual analysis
await characterService.analyzeVisualDetails(
  sessionId, storyText, pageNumber, userInfo?.name
);
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

## Future Enhancements
- Cross-session character persistence for premium users
- Enhanced relationship detection algorithms
- Visual similarity scoring for character consistency
- Integration with story library character storage