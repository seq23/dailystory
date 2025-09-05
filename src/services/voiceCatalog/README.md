# Advanced Voice Catalog (AVC) v1.1.0

## Overview

This is the implementation of the user's custom AVC v1.1.0 specification, providing a sophisticated voice selection system for story generation based on indexed codebook references and multi-level voice definitions.

## Architecture

```
voiceCatalog/
├── types.ts                 # Core type definitions
├── CodebookService.ts       # Global codebook with indexed arrays
├── VoiceProcessor.ts        # Resolves codebook references
├── VoiceDataLoader.ts       # User's voice data (all levels)
├── VoiceCatalogService.ts   # Voice loading & caching
├── VoiceSelector.ts         # Intelligent voice selection
├── VoiceCatalogIntegration.ts # Bridge to existing systems
└── index.ts                 # Main exports
```

## Key Features

### 1. Global Codebook (AVC v1.1.0)
- **21 tone types**: playful, cozy, soothing, etc.
- **15 story hooks**: tiny_time, quiet_room, ordinary_until, etc.
- **13 transitions**: and_then_softly, meanwhile, beyond_woods, etc.
- **15 twist types**: ordinary_to_magical, helper_reveals, etc.
- **Complete arrays** for all story elements (sounds, themes, settings, etc.)

### 2. Voice Levels
- **Beginner (Level 0)**: Ages 3-6, direct user integration
- **Easy (Level 1)**: Delta overrides from beginner, subtle integration
- **Medium (Level 2)**: Ages 7-12, balanced approach
- **Hard (Level 3)**: Ages 10-16, sophisticated themes
- **Expert (Level 4)**: Ages 14-18, complex narratives

### 3. Delta Override System
Easy level uses delta overrides to avoid duplication:
```json
{
  "ref": "meadow_tales_beg_v1",
  "id": "meadow_tales_easy_v1", 
  "vf": {"cad": 10},
  "uig": {"rules": {"u": {"m": "subtle", "max": 4}}}
}
```

### 4. Intelligent Voice Selection
- **Compatibility scoring**: Age, reading level, theme matching
- **User integration rules**: How often to include user's name/interests
- **Multiple options**: Get 3 best matches for variety
- **Recommendation system**: Avoid recently used voices

## Usage

### Basic Voice Selection
```typescript
import { VoiceCatalogIntegration } from '@/services/voiceCatalog';

const result = await VoiceCatalogIntegration.selectAndPrepareVoice(
  userInfo,
  'medium',
  { themes: ['adventure'], warmthPreference: 0.8 }
);

console.log(`Selected: ${result.selectedVoice.pn}`);
console.log(`Score: ${result.compatibilityScore}`);
```

### Get Multiple Options
```typescript
const alternatives = await VoiceCatalogIntegration.getVoiceAlternatives(
  userInfo,
  'hard',
  3
);
```

### Create Story Prompt
```typescript
const promptBundle = VoiceCatalogIntegration.createStoryPromptBundle(result);
// Use this with your AI story generation
```

## Integration Points

### Replacing AuthorVoiceService
The new system replaces the old AuthorVoiceService:

```typescript
// OLD
const voice = AuthorVoiceService.selectInspirationalVoice(difficulty);

// NEW  
const result = await VoiceCatalogIntegration.selectAndPrepareVoice(
  userInfo, 
  difficulty
);
```

### Story Generation Pipeline
```typescript
// 1. Select voice
const voiceResult = await VoiceCatalogIntegration.selectAndPrepareVoice(userInfo, difficulty);

// 2. Create AI prompt
const promptBundle = VoiceCatalogIntegration.createStoryPromptBundle(voiceResult);

// 3. Generate story (existing pipeline)
const story = await generateStory(promptBundle, userInfo);
```

## Voice Structure

Each voice contains:
- **Voice Format (vf)**: tone, cadence, warmth, humor levels
- **Story Structure (st)**: hooks, transitions, twists, endings
- **Character Settings (ch)**: helpers, dialog style, point of view
- **World Details (wd)**: settings, scale, moral approach
- **Reading Specs (rd)**: sound effects, alliteration, sentence length
- **User Integration Guidelines (uig)**: How to incorporate user data

## Example Voice Selection Process

1. **Load voices** for difficulty level
2. **Score compatibility** based on:
   - Age appropriateness (30% weight)
   - Theme matching (20% weight) 
   - Reading level fit (20% weight)
   - User input integration (15% weight)
   - Preference matching (15% weight)
3. **Select best match** with reasoning
4. **Process voice** through codebook resolver
5. **Create story bundle** for AI generation

## Performance Features

- **Lazy loading**: Voice data loaded on demand
- **Caching**: Processed voices cached per level
- **Delta optimization**: Easy level uses overrides vs full duplication
- **Batch operations**: Multiple voice operations in parallel

## Testing

```typescript
// Test voice selection
const testResult = await VoiceCatalogIntegration.testVoiceSelection('medium');

// Get catalog stats
const stats = await VoiceCatalogIntegration.getCatalogInfo();
console.log(`Total voices: ${stats.totalVoices}`);
```

## Migration Guide

### From AuthorVoiceService
1. Replace `AuthorVoiceService.selectInspirationalVoice()` calls
2. Use `VoiceCatalogIntegration.selectAndPrepareVoice()` 
3. Update story generation to use the new prompt bundle format
4. Test with existing user data

### Voice Data Updates
- Add new voices to `VoiceDataLoader.ts`
- Follow the AVC schema structure
- Use codebook indexes for all arrays
- Test voice processing and selection

## Troubleshooting

### Common Issues
- **Missing 'm' property**: Ensure all user input rules have method ("direct"/"subtle")
- **Invalid indexes**: Check codebook array bounds
- **Type errors**: Verify all voice data matches the TypeScript interfaces
- **Performance**: Check cache hits, consider voice data size

### Debug Tools
```typescript
// Get voice statistics
const stats = VoiceProcessor.getVoiceStats(processedVoice);

// Test codebook resolution
const resolved = CodebookService.resolveIndexes('tones', [1, 0]);
```

This system provides a robust, scalable foundation for sophisticated story voice selection based on your exact AVC v1.1.0 specification.