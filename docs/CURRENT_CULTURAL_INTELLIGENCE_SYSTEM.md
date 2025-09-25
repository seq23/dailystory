# CURRENT CULTURAL INTELLIGENCE SYSTEM

## System Status: ACTIVE ✅
**Primary Implementation**: `UnifiedPlaceholderResolver.js`  
**Integration Point**: `runware-template-ab/index.js`  
**Cultural Arrays**: `tier25Vocabulary.js`

## Core Architecture

### Cultural Detection Logic
```javascript
detectCulturalContext(userInfo) {
  const skinTone = userInfo?.skinTone || userInfo?.avatarIdentity?.skinTone;
  
  if (skinTone === 'dark' || skinTone === 'darker') {
    return 'african'; // ALL dark skin users get African cultural features
  }
  
  return 'none'; // Light skin users get no cultural enhancements
}
```

**CRITICAL**: Cultural enhancements are SKIN-TONE BASED, not language-based.

### Enhancement Generation with Character Consistency
Dark-skinned users receive:
- **Cultural Hair**: Afro, cornrows, braids, dreadlocks, protective styles
- **Facial Features**: Full lips, broad nose, high cheekbones, warm brown eyes
- **Character-Seeded Consistency**: Same character gets same enhancements across all pages in a session

### Implementation Flow
1. **Skin Tone Check**: `skinTone === 'dark'` or `'darker'`
2. **Character Seed**: Generated from character consistency service using `characterName + avatarIdentity`
3. **Feature Selection**: Seeded random from `CULTURAL_ARRAYS.african` using character seed
4. **Template Integration**: `{bundle.culturalEnhancements}` placeholder
5. **Consistency**: Same features for same character across all pages, different across characters/sessions

### Cultural Bundle Integration
**NEW FLOW**: `CharacterConsistencyService.getCulturalEnhancements(userInfo, sessionId, characterName)`
- Retrieves/creates character data with database persistence
- Calls `StaticDataCache.getCulturalBundle()` with character seed (not session seed)
- Caches cultural selections in character consistency database
- Returns consistent cultural bundle across all story pages

### Cultural Arrays Structure
```javascript
CULTURAL_ARRAYS = {
  african: {
    hair: ['beautiful afro', 'elegant braids', 'stylish cornrows', ...],
    features: ['warm brown eyes', 'full lips', 'high cheekbones', ...]
  },
  // Other cultural arrays exist but are currently unused
  european: { ... },
  asian: { ... },
  hispanic: { ... }
}
```

### Template Integration
**Placeholder**: `{bundle.culturalEnhancements}`  
**Example Output**: `"with beautiful braids, warm brown eyes"`  
**Usage in Templates**: Added to all premium and basic prompt templates

### Monitoring & Logging
- Cultural enhancement level: `UNIVERSAL_CULTURAL_INTELLIGENCE`
- Enhancement decisions logged with user context
- Seeded random ensures reproducible results

## Business Logic
- **Guest Users**: 6-page stories with cultural enhancements if dark-skinned
- **Premium Users**: Unlimited stories with cultural enhancements if dark-skinned
- **Light-Skinned Users**: No cultural enhancements regardless of premium status
- **Consistency**: Same enhancements within a session, different across sessions

## Technical Notes
- Uses seeded random for character consistency
- Integrates with `CharacterConsistencyService` for secondary character handling
- Fallback to empty string if resolution fails
- No performance impact on light-skinned users (empty string resolution)
