# TIER 2.5 PREMIUM TEMPLATES - COMPREHENSIVE REFERENCE

## Overview
The Tier 2.5 system utilizes category-based templates with line breaks for enhanced image generation. All levels (0-4) within each tier use the same template structure for consistency.

## Template Structure

### Tier 2.5A Template (Premium - All Levels 0-4)
Used for users with enhanced cultural features (dark skin tones).

```
Narrative: {pageText}.
Character Description: {character} {age}, {ethnicity}, {hair}, {features} {bundle.culturalEnhancements}.
Action: {semantic_scene}.
Secondary elements: {secondary_characters}.
Consistency: {visual_consistency_elements}.
Context: {cultural_context}, {community_context}.
Brand Suffix: {frameworkPrompt}, {cameraDirective}.
```

**Key Features:**
- Includes "Consistency" section with visual consistency elements
- Uses semantic scene extraction for enhanced action understanding
- Integrates Character Consistency Service for secondary characters
- Supports cultural enhancements for diverse representation

### Tier 2.5B Template (Basic - All Levels 0-4)
Used for users without enhanced cultural features (light/medium/olive skin tones).

```
Narrative: {pageText}.
Subject: {character}, {age}, {ethnicity}, {hairDescription}, {facialFeatures}.
Action: {scene}
Context: {cultural_context} {leftover data}.
Brand Suffix: {fullFrameworkPrompt},
```

**Key Features:**
- No "Consistency" section (simplified structure)
- Uses simple scene extraction
- Includes leftover data handling
- Streamlined for faster processing

## Tier System Overview

### Tier 1 Template (Complete - All Levels)
Used by runware-generate-image for enhanced story data.

```
Enhanced prompt from PhaseIntegrationOrchestrator with templateStructure: 'COMPLETE_TIER_1'
```

**Key Features:**
- OpenAI-enhanced structured prompts
- Character consistency integration
- Visual detail tracking
- Advanced scene understanding

## Placeholder Resolution

### Primary Placeholders
- `{pageText}` - Story text with fallback to `{storyText}`
- `{character}` - Character name from characterData or userInfo
- `{age}` - User age (default: '6')
- `{ethnicity}` - Derived from language and skin tone
- `{hair}` / `{hairDescription}` - Skin-tone based hair descriptions
- `{features}` / `{facialFeatures}` - Skin-tone based facial features

### Advanced Placeholders (Tier 2.5A Only)
- `{semantic_scene}` - Enhanced action extraction
- `{secondary_characters}` - Detected from Character Consistency Service
- `{visual_consistency_elements}` - Character appearance consistency
- `{bundle.culturalEnhancements}` - Cultural feature enhancements

### Context Placeholders
- `{cultural_context}` - Language-based cultural setting (non-English only)
- `{community_context}` - Community setting context
- `{leftover_data}` - Additional orchestrator data (Tier 2.5B)

### Style Placeholders
- `{frameworkPrompt}` - Style framework based on template level
- `{fullFrameworkPrompt}` - Complete framework prompt
- `{cameraDirective}` - Camera angle specification

## Tier Selection Logic

### Tier 1 Selection Criteria
- Enhanced story data available from PhaseIntegrationOrchestrator
- templateStructure: 'COMPLETE_TIER_1'
- Uses direct Runware API with advanced prompts

### Tier 2.5A Selection Criteria
- User has dark or darker skin tone
- Requires enhanced cultural representation
- Uses Character Consistency Service
- Includes secondary character detection

### Tier 2.5B Selection Criteria  
- User has light, pale, medium, or olive skin tone
- Streamlined processing
- No character consistency service
- Simplified scene extraction

## Hair and Facial Feature Mapping

### African American Users (Dark Skin)
- **Hair Options**: Natural curls, twist out, wash and go, protective styles, loc styles
- **Facial Features**: Full lips, broad nose, high cheekbones, expressive eyes
- **Cultural Enhancements**: Applied automatically via StaticDataCache

### Non-African American Users (Light/Medium/Olive Skin)
- **Hair Options**: Various textures based on ethnicity
- **Facial Features**: Ethnicity-appropriate features
- **Cultural Enhancements**: None (empty string)

## Ethnicity Resolution

### Language-Based Mapping
- English + Dark Skin → "African American"
- Spanish + Dark Skin → "Afro-Latino"  
- Portuguese + Dark Skin → "Afro-Brazilian"
- English + Light/Medium/Olive Skin → "" (empty)
- Other languages → Language-specific ethnicity

### Cultural Context Resolution
- English → No cultural context (American default)
- Spanish → "Hispanic cultural setting"
- Portuguese → "Portuguese cultural environment"
- French → "French cultural atmosphere"
- Chinese → "Chinese cultural background"
- Japanese → "Japanese cultural setting"
- Arabic → "Arabic cultural environment"

## Template Processing Flow

1. **Tier Determination**: Based on available enhanced data and skin tone
2. **Template Selection**: Single template per tier (no sub-levels)
3. **Context Preparation**: Enhanced context with all placeholders
4. **Service Integration**: Character Consistency Service (Tier 1 & 2.5A only)
5. **Placeholder Resolution**: 4-tier priority system
6. **Escalation Logic**: 2.5A failures escalate to 2.5B
7. **Final Assembly**: Clean, formatted prompt output

## Integration Points

### Character Consistency Service (Tier 1 & 2.5A Only)
- `detectSecondaryCharacters()` - Find secondary characters in story
- `getCharacterAppearanceFromStory()` - Retrieve visual consistency elements
- Session-based character caching

### Scene Extraction
- **Tier 1**: PhaseIntegrationOrchestrator enhanced prompts
- **Tier 2.5A**: `extractSemanticScene()` - Advanced semantic understanding
- **Tier 2.5B**: `extractSimpleScene()` - Basic action/object/location extraction

### Style Frameworks
- Beginner/Easy/Medium: Contemporary Children's Book Illustration
- Hard/Expert: 2.9D Rendered Illustration with advanced lighting

## Debugging and Validation

### Template Export
Templates are exported as constants for validation:
- `TIER_25A_TEMPLATE`
- `TIER_25B_TEMPLATE`

### Resolution Monitoring
- Placeholder resolution success rate tracking
- Escalation event logging
- Cultural enhancement application monitoring

## Future Enhancements

### Planned Features
- Community context expansion
- Enhanced secondary character relationships
- Advanced cultural setting variations
- Template performance optimization

### Maintenance Notes
- Templates use exact line break formatting
- All placeholders must be resolved or cleaned
- Cultural arrays require periodic updates
- Performance metrics guide optimization

This comprehensive template system ensures consistent, culturally-aware image generation across all user demographics while maintaining high performance and reliability.