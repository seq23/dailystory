# Voice Catalog Backend - Story Generation System

## Overview

The Voice Catalog Backend provides the data foundation and server-side services for the story generation voice selection system. This backend infrastructure supports the Advanced Voice Catalog (AVC) v1.1.0 implementation.

**IMPORTANT**: This is exclusively for story generation backend services. It is NOT related to:
- User voice command processing
- Audio file management or streaming
- Speech-to-text or microphone services

## Backend Architecture - Story Generation System

### Data Files Structure
```
supabase/functions/_shared/voice-catalog/
├── voices-beginner.v1.json      # 18 beginner narrative voices
├── voices-easy.v1.json          # 18 delta overrides for beginner voices  
├── voices-medium.v1.json        # 12 medium complexity voices
├── voices-hard.v1.json          # 11 advanced narrative voices
├── voices-expert.v1.json        # 10 expert storytelling voices
├── codebook.v1.1.json          # Global narrative element codebook
├── themes.v1.json              # 41-theme story library with safety data
└── ThemeLibraryService.ts       # Backend theme management service
```

### Voice Data Schema - Story Generation System

#### Beginner Level Voices (voices-beginner.v1.json)
- **Count**: 18 voices
- **Target Age**: 3-5 years
- **Characteristics**: Simple vocabulary, basic story structures, minimal complexity
- **Format**: Complete voice definitions with all narrative elements

#### Easy Level Delta Overrides (voices-easy.v1.json)  
- **Count**: 18 overrides
- **Target Age**: 5-7 years
- **Characteristics**: Enhanced beginner voices with slight complexity increases
- **Format**: Delta modifications applied to beginner base voices

#### Medium/Hard/Expert Levels
- **Medium**: 12 voices for ages 7-9, moderate narrative complexity
- **Hard**: 11 voices for ages 9-12, advanced storytelling elements  
- **Expert**: 10 voices for ages 12+, sophisticated narrative techniques

## Global Codebook (codebook.v1.1.json) - Story Generation System

### Codebook Structure
The codebook contains predefined arrays of narrative elements:

```json
{
  "schema": "codebook.v1.1", 
  "v": "1.1.0",
  "tones": ["gentle", "playful", "mysterious", ...],
  "narr": ["first-person", "third-person", ...], 
  "wordplay": ["alliteration", "rhyming", ...],
  "hooks": ["mysterious beginning", "action start", ...],
  "trans": ["meanwhile", "suddenly", ...],
  "pauses": ["dramatic pause", "gentle break", ...],
  "conts": ["and then", "next", ...],
  "twists": ["surprise reveal", "character switch", ...],
  "ends": ["happy ending", "cliffhanger", ...],
  "helpers": ["wise mentor", "magical guide", ...],
  "dialog": ["conversational", "formal", ...],
  "emote": ["joy", "excitement", "wonder", ...],
  "setting": ["forest", "castle", "home", ...],
  "scale": ["intimate", "grand", ...],
  "moral": ["friendship", "honesty", ...],
  "leaps": ["time jump", "location change", ...],
  "repeat": ["refrain", "callback", ...],
  "snd": ["nature sounds", "magical chimes", ...],
  "themes": ["adventure", "friendship", ...]
}
```

### Codebook Usage
- Voice definitions reference codebook elements by array index
- Frontend resolves indexes to actual narrative element strings
- Enables compact voice definitions and consistent element library

## Theme Library Backend (themes.v1.json) - Story Generation System

### Theme Data Structure
```json
{
  "schema": "themes.v1",
  "v": "1.0.0", 
  "themes": [
    {
      "id": "adventure",
      "tags": ["exploration", "journey", "discovery"],
      "suggested_levers": {
        "hooks": [1, 15, 23],
        "twists": [5, 12, 18],
        "endings": [2, 9, 14]
      },
      "safety": {
        "peril": "medium",
        "horror": "none"
      },
      "notes": "Classic adventure theme with exploration elements"
    }
  ]
}
```

### Theme Categories
- **Total Themes**: 41 carefully curated story themes
- **Safety Validation**: Peril and horror levels for age-appropriate filtering
- **Suggested Elements**: Recommended hooks, twists, and endings per theme
- **Tag System**: Enables intelligent theme matching and discovery

## Backend Theme Service (ThemeLibraryService.ts) - Story Generation System

### Service Capabilities
```typescript
class ThemeLibraryService {
  // Map theme strings to valid library IDs
  static mapToLibrary(themes: string[], failSoft?: boolean): string[]
  
  // Validate theme safety for user age
  static validateThemeForAge(theme: string, age: number): boolean
  
  // Get theme metadata and constraints
  static getThemeMetadata(theme: string): ThemeMetadata | null
  static getSafetyConstraints(theme: string): SafetyConstraints | null
  
  // Theme discovery and filtering
  static getThemesByTag(tag: string): string[]
  static getAgeAppropriateThemes(age: number): string[]
  static filterThemesForAge(themes: string[], age: number): string[]
}
```

### Backend Integration
- Provides server-side theme validation for edge functions
- Enables consistent theme processing across frontend and backend
- Supports age-appropriate content filtering at the API level

## Voice Definition Schema - Story Generation System

### Complete Voice Structure
```typescript
interface VoiceDefinition {
  id: string;           // Unique voice identifier
  pn: string;           // Pretty display name
  vf: VoiceFormat;      // Tone, cadence, vocabulary settings
  st: StoryStructure;   // Hooks, transitions, twists, endings
  ch: CharacterSettings;// Point of view, dialogue, character arcs  
  wd: WorldDetails;     // Settings, scale, moral lessons
  rd: ReadingSpecs;     // Reading level, age appropriateness
  eg: EngagementGuidelines; // Directness, interactivity
  th: string[];         // Associated themes
  tg: number[];         // Target age groups
  uig: UserInputGuidelines; // User integration rules
  src: string[];        // Source inspirations
}
```

### Delta Override Format (Easy Level)
```typescript  
interface VoiceOverride {
  ref: string;          // Reference to base beginner voice
  id: string;           // New voice ID for easy level
  vf?: Partial<VoiceFormat>;      // Override voice format
  st?: Partial<StoryStructure>;   // Override story structure
  // ... other partial overrides
}
```

## Data Versioning - Story Generation System

### Version Management
- **Codebook**: v1.1.0 (current)
- **Voice Data**: v1 (current) 
- **Themes**: v1.0.0 (current)
- **Schema Evolution**: Backwards-compatible versioning strategy

### Update Process
1. Version bump in schema files
2. Migration path for existing voice definitions
3. Frontend compatibility layer updates
4. Backend service version alignment

## Performance Considerations - Story Generation System

### Data Loading Strategy
- Voice data loaded on-demand by difficulty level
- Codebook cached globally for all voice processing
- Theme library preloaded for validation operations

### Optimization Features
- Delta overrides reduce Easy level data size by ~60%
- Codebook indexing enables fast element resolution
- Theme tag indexing accelerates discovery operations

## Security & Safety - Story Generation System

### Content Safety
- All themes validated for age-appropriate content
- Peril and horror levels enforced at theme selection
- Voice definitions reviewed for appropriate complexity levels

### Data Integrity
- JSON schema validation for all data files
- Referential integrity between voices and codebook elements
- Theme-voice association validation

## Backend API Integration - Story Generation System

### Edge Function Support
- Theme validation available in server-side story generation
- Voice processing can occur in edge functions for performance
- Consistent data access patterns between frontend and backend

### Future Extensions
- Dynamic voice generation based on user preferences
- Real-time theme trend analysis
- A/B testing infrastructure for voice effectiveness

## Troubleshooting Backend Issues - Story Generation System

### Common Data Issues
1. **Missing Voice References**: Check codebook index validity
2. **Theme Validation Errors**: Verify theme library integrity
3. **Override Application Failures**: Validate delta reference accuracy

### Debug Tools
- Schema validation utilities for data files
- Codebook integrity checking
- Theme library validation methods

### Monitoring
- Voice selection success rates by difficulty level
- Theme usage analytics for content optimization
- Performance metrics for data loading operations

---

**Remember**: This backend infrastructure is exclusively for story generation voice selection. For user voice command backend services or audio processing, refer to the appropriate system documentation.
