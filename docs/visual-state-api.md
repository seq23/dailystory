# Visual State API Documentation

## Overview

The Visual State API provides a comprehensive system for managing character consistency, secondary elements, and visual details across story pages. It enables frontend-backend state synchronization and maintains visual coherence throughout the storytelling experience.

## Core Components

### StoryVisualStateManager

The primary class for managing story state and visual consistency.

#### Key Methods

**Session Management:**
- `getOrCreateStoryState(sessionId)`: Initialize or retrieve story state for a session
- `clearSessionState(sessionId)`: Clear all state data for a session
- `getStoryState(sessionId)`: Get the current story state object

**Character Management:**
- `updateSecondaryCharacter(sessionId, name, type, relationshipType, pageNumber)`: Track secondary characters
- `getSecondaryCharacters(sessionId, pageNumber)`: Retrieve secondary characters for a specific page
- `updateCharacterAnimal(sessionId, name, species, hasDialogue, pageNumber)`: Track character animals
- `getCharacterAnimals(sessionId, pageNumber)`: Get character animals for a page

**Visual Consistency:**
- `getVisualDetailsForPrompt(sessionId)`: Get visual consistency details for prompt building
- `getSettingForPrompt(sessionId)`: Retrieve setting information for prompts
- `updateSetting(sessionId, settingData)`: Update story setting information

### VisualDetailTracker

Manages visual element tracking and consistency across pages.

#### Key Methods

- `analyzeTextForDetails(sessionId, storyText, pageNumber)`: Extract visual details from story text
- `injectConsistentDetails(sessionId, storyText, pageNumber)`: Enhance story text with consistent visual details
- `getSessionDetails(sessionId)`: Get all tracked visual details for a session
- `getVisualDetailsForPrompt(sessionId)`: Get details formatted for prompt building

### SecondaryElementDetector

Identifies and classifies secondary characters and animals in story content.

#### Key Methods

- `parseElements(sessionId, primaryScene, storyText, pageNumber)`: Parse and detect secondary elements
- `detectSecondaryCharacters(text)`: Identify secondary character mentions
- `detectCharacterAnimals(text)`: Identify animal characters in the story

## Integration Patterns

### Frontend-Backend Synchronization

The Visual State API maintains consistency between frontend user interactions and backend image generation:

```javascript
// Backend: Update state during image generation
const visualState = StoryVisualStateManager.getOrCreateStoryState(sessionId);
StoryVisualStateManager.updateSecondaryCharacter(sessionId, 'grandmother', 'family', 'family_elder', pageNumber);

// Backend: Retrieve for prompt building
const secondaryCharacters = StoryVisualStateManager.getSecondaryCharacters(sessionId, pageNumber);
```

### Session Persistence

Visual state persists across page generations within a session:

1. **Page 1**: Initialize state, detect main character
2. **Page 2**: Add secondary character (grandmother), maintain visual consistency
3. **Page 3**: Continue with established characters and setting
4. **Page N**: All previous visual elements remain consistent

### Character Consistency

The API ensures character appearance and behavior remain consistent:

- **Visual Descriptions**: Standardized character appearance details
- **Relationship Tracking**: Maintains family/friend relationships
- **Dialogue Consistency**: Tracks which animals can speak
- **Cultural Context**: Preserves cultural elements across pages

## Error Handling

The Visual State API includes robust error handling:

```javascript
try {
  const secondaryElements = await SecondaryElementDetector.parseElements(
    sessionId, primaryScene, storyText, pageNumber
  );
  // Process elements...
} catch (error) {
  console.log('⚠️ Secondary element detection failed:', error.message);
  // Continue with fallback processing
}
```

## Performance Optimization

### Memory Management

- Automatic cleanup of old page data
- Regex cache management for pattern matching
- Temporary data structure cleanup

### Caching Strategy

- Visual details cached per session
- Character consistency data persisted
- Secondary element patterns cached for reuse

## Usage Examples

### Basic Story State Setup

```javascript
// Initialize story state
const sessionId = "session_123";
const visualState = StoryVisualStateManager.getOrCreateStoryState(sessionId);

// Track visual details
VisualDetailTracker.analyzeTextForDetails(sessionId, storyText, pageNumber);

// Detect secondary elements
const secondaryElements = await SecondaryElementDetector.parseElements(
  sessionId, primaryScene, storyText, pageNumber
);
```

### Character Consistency

```javascript
// Add secondary character
StoryVisualStateManager.updateSecondaryCharacter(
  sessionId, 
  'grandmother', 
  'elderly woman', 
  'family_elder', 
  pageNumber
);

// Add character animal
StoryVisualStateManager.updateCharacterAnimal(
  sessionId,
  'Fluffy',
  'cat',
  false, // hasDialogue
  pageNumber
);

// Retrieve for prompt building
const secondaryCharacters = StoryVisualStateManager.getSecondaryCharacters(sessionId, pageNumber);
const characterAnimals = StoryVisualStateManager.getCharacterAnimals(sessionId, pageNumber);
```

### Visual Detail Enhancement

```javascript
// Extract and track visual details
VisualDetailTracker.analyzeTextForDetails(sessionId, storyText, pageNumber);

// Enhance story text with consistent details
const enhancedText = VisualDetailTracker.injectConsistentDetails(
  sessionId, 
  storyText, 
  pageNumber
);

// Get details for prompt building
const visualDetails = VisualDetailTracker.getVisualDetailsForPrompt(sessionId);
```

## Best Practices

1. **Always Initialize State**: Call `getOrCreateStoryState()` before other operations
2. **Error Handling**: Wrap API calls in try-catch blocks for graceful fallbacks  
3. **Memory Cleanup**: Clear session state when stories are completed
4. **Consistent Naming**: Use consistent character and element names across pages
5. **Page Number Tracking**: Always provide accurate page numbers for proper sequencing

## Migration Guide

When updating from older visual state systems:

1. Replace direct state manipulation with API calls
2. Update character tracking to use new secondary character methods
3. Migrate visual detail tracking to use VisualDetailTracker
4. Update error handling to use new graceful fallback patterns

This API provides a robust foundation for maintaining visual consistency and character continuity across multi-page story generation while offering flexibility for different story types and complexity levels.