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

### Enhancement Generation
Dark-skinned users receive:
- **Cultural Hair**: Afro, cornrows, braids, dreadlocks, protective styles
- **Facial Features**: Full lips, broad nose, high cheekbones, warm brown eyes
- **Seeded Consistency**: Same user gets same enhancements across sessions

### Language Support Matrix
| Language | Code | Regional Authenticity | Cultural Features |
|----------|------|---------------------|-------------------|
| English  | en   | Standard            | Dark skin only    |
| French   | fr   | French authenticity | Dark skin only    |
| Spanish  | es   | Hispanic authenticity| Dark skin only    |
| Portuguese| pt  | Brazilian authenticity| Dark skin only   |
| Chinese  | zh   | Asian authenticity  | Dark skin only    |

### Implementation Flow
1. **Skin Tone Check**: `skinTone === 'dark'` or `'darker'`
2. **Cultural Seed**: Generated from `userName + sessionId`
3. **Feature Selection**: Seeded random from `CULTURAL_ARRAYS.african`
4. **Template Integration**: `{bundle.culturalEnhancements}` placeholder
5. **Consistency**: Same features across all story pages

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
