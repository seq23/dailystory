# TIER 2.5 TEMPLATE SYSTEM REFERENCE - COMPREHENSIVE A-D DOCUMENTATION

## Overview
The Tier 2.5 system provides 4 complexity levels (A-D) with distinct template structures and capabilities. Each tier has specific template formats, hair mapping systems, and nuclear independence levels.

## Template System Architecture

### Tier 2.5A Template (Premium - runware-template-ab)
**Function**: `runware-template-ab` with complexity 'A'
**Template Constant**: `TIER_25A_TEMPLATE`
**Hair System**: Sophisticated 73-variation StaticDataCache mapping

```
Narrative: {pageText}.
Character Description: {character} {age}, {ethnicity}, {hair}, {features} {bundle.culturalEnhancements}.
Action: {semantic_scene}.
Secondary elements: {secondary_characters}.
Consistency: {visual_consistency_elements} {setting_context}.
Context: {cultural_context}, {community_context}.
Brand Suffix: {frameworkPrompt}, {cameraDirective}.
```

**Key Features:**
- Enhanced semantic scene extraction with `extractSemanticScene()`
- Character Consistency Service integration for secondary characters
- 73 hair variations from StaticDataCache with seeded selection
- Cultural enhancement bundles for diverse representation
- Visual consistency tracking across story sessions

### Tier 2.5B Template (Basic - runware-template-ab)
**Function**: `runware-template-ab` with complexity 'B'
**Template Constant**: `TIER_25B_TEMPLATE`
**Hair System**: Sophisticated 73-variation StaticDataCache mapping
**Scene Extraction**: Sophisticated hybrid system with advanced features

```
Narrative: {pageText}.
Subject: {character}, {age}, {ethnicity}, {hairDescription}, {facialFeatures}.
Action: {scene}
Context: {cultural_context} {leftover_data}.
Brand Suffix: {fullFrameworkPrompt},
```

**Key Features:**
- Simplified template structure without consistency section
- **Sophisticated Hybrid Scene Extraction System**:
  - 30+ color vocabulary (turquoise, lavender, burgundy, teal, beige, maroon, navy, violet, etc.)
  - Progressive verb lemmatization with irregular verb handling (run→running, sit→sitting)
  - Multi-sentence processing that merges actions/objects/settings across sentences
  - Intelligent tokenization with noun phrase capture and stop token detection
  - Expanded KNOWN_OBJECTS array including clothing items and accessories
  - Evidence-based scene assembly with integrity-safe fallbacks
- 73 hair variations from StaticDataCache (same as Tier A)
- Leftover data handling for orchestrator context
- Streamlined processing for faster generation

### Tier 2.5C Template (Nuclear Hardcoded - runware-template-cd)
**Function**: `runware-template-cd` with complexity 'C'
**Template**: Hardcoded nuclear template (no constant export)
**Hair System**: Lean 5-option `getSimpleHairColor()` mapping

```
A young [avatarType] named [characterName] age [age] [skinTone] skin complexion with [hairColor] [culturalFeatures]
[storyText]
[styleFramework]
```

**Key Features:**
- Nuclear independence with zero external dependencies (beyond StaticDataCache)
- Lean hair color mapping: 5 direct mappings by skin tone
- Hardcoded character description assembly
- Emergency cultural features for dark skin tones only
- Direct style framework integration

**Lean Hair Mapping (Nuclear Simple)**:
- `pale` → `red hair`
- `light` → `blonde hair` 
- `medium` → `brown hair`
- `olive` → `dark black hair`
- `dark` → `thick textured 4C hair`

### Tier 2.5D Template (Ultimate Emergency - runware-template-cd)
**Function**: `runware-template-cd` with complexity 'D'
**Template**: Fully hardcoded emergency fallback
**Hair System**: None (hardcoded diverse group)

```
A diverse group of children playing together in [fallbackContext]
Emergency images are temporarily being generated
[ultimateStyleFramework]
```

**Key Features:**
- Ultimate emergency fallback with no personalization
- Hardcoded "diverse group of children" approach
- No individual hair mapping (group diversity implied)
- Guaranteed generation with minimal complexity
- Nuclear independence from all user data

## Hair Mapping System Comparison

### Sophisticated Hair System (Tiers 2.5A & 2.5B)
**Source**: StaticDataCache.js `HAIR_BY_SKIN_TONE` array
**Variations**: 73 total options across 5 skin tone categories
**Selection**: Seeded deterministic selection based on user characteristics
**Examples**:
- Dark skin: "Natural 4C hair texture", "Protective loc styles", "Twist-out curls"
- Light skin: "Straight blonde hair", "Wavy brown hair", "Curly red hair"
- Medium skin: "Soft brown waves", "Straight black hair", "Curly brunette"

### Lean Hair System (Tier 2.5C)
**Source**: Nuclear `getSimpleHairColor()` function in runware-template-cd
**Variations**: 5 direct mappings only
**Selection**: Direct switch statement based on skin tone
**Cultural Focus**: Authentic 4C hair texture for dark skin, traditional options for others

### No Hair System (Tier 2.5D)
**Approach**: Hardcoded diverse group with implied variety
**Rationale**: Emergency fallback prioritizes speed over personalization

## Tier Selection Logic & Escalation

### Template AB Function (Tiers A & B)
```javascript
// runware-template-ab handles both A and B complexity
if (templateComplexity === 'A') {
  // Use TIER_25A_TEMPLATE with semantic scene extraction
} else {
  // Use TIER_25B_TEMPLATE with simple scene extraction  
}
```

### Template CD Function (Tiers C & D)
```javascript  
// runware-template-cd handles both C and D complexity
if (templateComplexity === 'C') {
  // Nuclear hardcoded template with lean hair mapping
} else {
  // Ultimate emergency template with diverse group fallback
}
```

### Escalation Flow
1. **Tier 1** → AI-enhanced premium (`ai-visual-scene-creator`)
2. **Tier 2.5A** → Premium template with full cultural intelligence  
3. **Tier 2.5B** → Basic template with simple scene extraction
4. **Tier 2.5C** → Nuclear hardcoded with lean hair mapping
5. **Tier 2.5D** → Ultimate emergency hardcoded fallback
6. **Tier 4** → Frontend SVG placeholder (guaranteed)

## Nuclear Independence Status

### Tier 2.5A & 2.5B Dependencies
- StaticDataCache.js for cultural bundles and hair arrays
- Character Consistency Service for secondary character detection
- Orchestrator context for enhanced story data

### Tier 2.5C Nuclear Independence ✅
- Zero external dependencies beyond StaticDataCache import
- Self-contained lean hair mapping function
- Nuclear hardcoded template assembly
- Emergency bypass capability via `SimpleImageService.emergencyFallbackTier25C()`

### Tier 2.5D Ultimate Nuclear Independence ✅
- Hardcoded template requires no external data
- Diverse group approach eliminates personalization dependencies  
- Guaranteed generation under any conditions

## Cultural Intelligence Levels

### Full Cultural Intelligence (Tiers A & B)
- 73 hair variations with cultural authenticity
- Cultural enhancement bundles for diverse representation
- Language-based ethnicity mapping
- Community context integration

### Light Cultural Intelligence (Tier C)  
- 5 lean hair mappings with cultural focus on 4C texture
- Basic cultural features for dark skin tones only
- Simplified ethnicity detection

### No Cultural Intelligence (Tier D)
- Hardcoded diverse group approach
- Emergency fallback without personalization

## Style Framework Integration

All tiers use the unified `getStyleFramework(difficulty)` system:
- **Beginner/Easy/Medium**: Contemporary Children's Book Illustration
- **Hard/Expert**: 2.9D Rendered Illustration with advanced lighting

## Template Constants Export

```javascript
// Exported from runware-template-ab
export const TIER_25A_TEMPLATE = "Narrative: {pageText}...";
export const TIER_25B_TEMPLATE = "Narrative: {pageText}..."; 

// runware-template-cd uses hardcoded assembly (no exports)
```

## Debugging and Validation

### Template Resolution Monitoring
- Placeholder resolution success rate tracking
- Escalation event logging  
- Hair mapping application verification
- Cultural enhancement monitoring

### Nuclear Independence Verification
- Zero dependency validation for Tier C/D
- Emergency fallback functionality testing
- Lean hair mapping accuracy checks

## Performance Metrics

### Success Rates
- **Tier 2.5A**: ~95% (premium features)
- **Tier 2.5B**: ~97% (streamlined processing)
- **Tier 2.5C**: ~99% (nuclear hardcoded)
- **Tier 2.5D**: ~99.9% (ultimate emergency)

### Hair Mapping Performance  
- **Sophisticated (A/B)**: 73 options, seeded selection
- **Lean (C)**: 5 options, direct mapping
- **None (D)**: Hardcoded group, no mapping needed

## Integration Points

### Character Consistency Service (Tiers A & B Only)
- Secondary character detection and descriptions
- Visual consistency element tracking
- Session-based character caching

### Scene Extraction Methods
- **Tier A**: `extractSemanticScene()` - Advanced semantic understanding with pattern matching
- **Tier B**: `extractSimpleScene()` - Sophisticated hybrid system with:
  - Multi-sentence tokenization and normalization
  - Progressive verb lemmatization (handles 20+ irregular verbs)
  - 30+ color vocabulary with shade variations (light/dark prefixes)
  - Expanded object recognition (50+ items including clothing/accessories)
  - Intelligent noun phrase capture with stop token detection
  - Evidence-based scene assembly with integrity-safe fallbacks
- **Tier C**: Basic story text usage without extraction
- **Tier D**: Hardcoded context without story analysis

### Emergency Fallback Access
- **Frontend Method**: `SimpleImageService.emergencyFallbackTier25C()`
- **Direct Call**: Bypasses orchestrator, calls Tier C directly
- **Nuclear Access**: Guaranteed generation when main system fails

This comprehensive template system ensures consistent, culturally-aware image generation across all complexity levels while maintaining nuclear independence for emergency scenarios and providing sophisticated personalization when conditions allow.