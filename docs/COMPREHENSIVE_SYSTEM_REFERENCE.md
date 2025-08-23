# Comprehensive System Reference Documentation

## ⚠️ CRITICAL: MASTER REFERENCE FOR THREE CORE SYSTEMS

This document serves as the **SINGLE SOURCE OF TRUTH** for three critical systems that must remain consistent across all image generation tiers to prevent regressions or confusion.

---

## 1. HAIR COLOR MAPPING SYSTEM

### ✅ CORRECT HAIR MAPPING (All Tiers Must Match)

```javascript
const hairMap = {
  'pale': 'red hair',        // Celtic/Irish heritage representation
  'light': 'blonde hair',    // Nordic/Germanic heritage representation  
  'medium': 'brown hair',    // Common globally
  'olive': 'dark brown hair', // Mediterranean/Middle Eastern
  'dark': 'black hair'       // Natural textured hair + cultural enhancements
};
```

### Implementation Locations
- **Tier 1**: `supabase/functions/runware-generate-image/index.ts` (lines 807-814)
- **Tier 2**: `supabase/functions/runware-template-generation/index.ts` (via UnifiedCharacterDescriptor)
- **Tier 2.5**: `supabase/functions/runware-simple-fallback/index.ts` (lines 286-292)
- **Shared Logic**: `supabase/functions/_shared/UnifiedCharacterDescriptor.js` (lines 32-38)
- **Hair Intelligence**: `supabase/functions/_shared/FrontendIntelligence.js` (getUniversalHairMapping method)

### REGRESSION PREVENTION CHECKLIST
- [ ] All tiers use identical `pale → red hair` mapping
- [ ] All tiers use identical `light → blonde hair` mapping  
- [ ] Skin tone determines hair color (avatar-based representation)
- [ ] ALL hair colors represented across avatar options
- [ ] No random hair assignment that breaks avatar consistency

---

## 2. GENDER MAPPING SYSTEM

### ✅ CORRECT GENDER HANDLING

```javascript
// Core Mappings:
"boy" → "7-year-old boy" (unchanged)
"girl" → "7-year-old girl" (unchanged)
"prefer-not-to-answer" → "7-year-old child" + "with no gender specific characteristics" + comprehensive gender-neutral negative prompts
No avatar type → "7-year-old child" (safe fallback)
Unknown name → "7-year-old child" (safe fallback)
```

### Implementation Locations
- **Tier 1**: `supabase/functions/runware-generate-image/index.ts` (lines 32-37, 763)
- **Tier 2**: `supabase/functions/runware-template-generation/index.ts` (lines 188-198)
- **Tier 2.5**: `supabase/functions/runware-simple-fallback/index.ts` (lines 24, 246-248, 395-397)
- **AI Enhancement**: `supabase/functions/ai-story-enhancer/index.ts` (line 430)
- **Shared Logic**: `supabase/functions/_shared/UnifiedCharacterConsistency.js` (lines 115, 154, 394-398)
- **Pipeline Enhancement**: `supabase/functions/_shared/MultiStageEnhancementPipeline.js` (lines 827-829)

### Gender-Neutral Negative Prompts
Applied when `avatarType === 'child'` or `avatarType === 'prefer-not-to-answer'`:
- "masculine features, feminine features"
- "boy-specific clothing, girl-specific clothing" 
- "gender-specific hairstyles, gendered accessories"
- "strongly masculine appearance, strongly feminine appearance"

### Age Mapping by Difficulty
```javascript
const ageMapping = {
  'beginner': '5-year-old',
  'easy': '7-year-old',      // ← DEFAULT
  'medium': '9-year-old', 
  'hard': '11-year-old',
  'expert': '13-year-old'
};
```

---

## 3. CULTURAL ENHANCEMENT SYSTEM

### ✅ LANGUAGE + SKIN TONE MATRIX

```javascript
// Trigger Logic:
English + dark skin = African American enhancements (shouldApplyAfricanAmericanCulturalVariations)
French + dark skin = African-French/Francophone Black world ("african-french")
Spanish + dark skin = Hispanic/Latino with African heritage ("hispanic-multicultural")
Other language + dark skin = General African heritage ("african")
```

### Implementation Locations
- **Main Trigger**: `supabase/functions/_shared/FrontendIntelligence.js` (shouldApplyAfricanAmericanCulturalVariations, lines 555-580)
- **Cultural Profiles**: `supabase/functions/runware-generate-image/index.ts` (lines 798-802)
- **Enhancement Arrays**: `supabase/functions/_shared/FrontendIntelligence.js` (EXPANDED_AFRICAN_AMERICAN_* arrays)
- **Tier 2.5 Implementation**: `supabase/functions/runware-simple-fallback/index.ts` (lines 296-302, 528-545)
- **Character Consistency**: `supabase/functions/_shared/UnifiedCharacterConsistency.js` (lines 171-173)

### Specific Enhancements Applied

#### African American (English + dark skin)
- **Hairstyles**: Natural textures, braids, locs, twist-outs
- **Settings**: Churches, barbershops, family cookouts, community events
- **Cultural Elements**: Heritage symbols, community strength, family traditions
- **Details**: Soul food, gospel music, extended family gatherings
- **Clothing**: "modern American fashion"

#### African-French (French + dark skin) 
- **Profile**: "african-french"
- **Clothing**: "African-French fusion style"
- **Cultural Context**: Larger Francophone Black world representation

#### Hispanic-African Heritage (Spanish + dark skin)
- **Profile**: "hispanic-multicultural" 
- **Clothing**: "contemporary Hispanic fashion"
- **Cultural Context**: Latino community with African heritage elements

---

## CRITICAL TESTING SCENARIOS

### Hair Color Consistency Test
```bash
# Test each avatar type produces expected hair:
Tier 1 + pale avatar → red hair ✅
Tier 2 + pale avatar → red hair ✅  
Tier 2.5 + pale avatar → red hair ✅

Tier 1 + light avatar → blonde hair ✅
Tier 2 + light avatar → blonde hair ✅
Tier 2.5 + light avatar → blonde hair ✅
```

### Gender Mapping Test
```bash
# Test prefer-not-to-answer handling:
All tiers + "prefer-not-to-answer" → "7-year-old child" + gender-neutral negatives ✅
All tiers + no avatar → "7-year-old child" fallback ✅
All tiers + unknown → "7-year-old child" fallback ✅
```

### Cultural Enhancement Test  
```bash
# Test language + skin combinations:
English + dark → shouldApplyAfricanAmericanCulturalVariations = true ✅
French + dark → "african-french" profile ✅
Spanish + dark → "hispanic-multicultural" profile ✅
German + dark → General African heritage ✅
```

---

## REGRESSION PREVENTION RULES

### 🚫 NEVER DO
1. **Make hair color random** - Breaks avatar-based representation
2. **Remove skin tone → hair color mapping** - Destroys intentional diversity system  
3. **Broaden cultural triggers without research** - Could apply inappropriate enhancements
4. **Remove "prefer-not-to-answer" handling** - Breaks gender inclusivity
5. **Change tier implementations independently** - Creates inconsistency bugs

### ✅ ALWAYS DO
1. **Test all three tiers for consistency** after any changes
2. **Verify hair color mapping** matches across all implementation locations
3. **Check gender-neutral negatives** are applied for prefer-not-to-answer
4. **Confirm cultural enhancements** only trigger for appropriate demographics
5. **Update this documentation** when making legitimate system changes

---

## QUICK DEBUGGING REFERENCE

### Hair Color Issues
- Check hairMap in each tier's implementation
- Verify pale→red, light→blonde consistency
- Look for console logs showing hair color assignments

### Gender Issues  
- Look for "prefer-not-to-answer" → "child" mapping
- Check gender-neutral negative prompts application
- Verify age mapping (7-year-old default)

### Cultural Issues
- Check shouldApplyAfricanAmericanCulturalVariations trigger
- Verify language + skin tone matrix results
- Look for cultural profile assignments

---

## VERSION HISTORY

- **v1.0** (Initial): Created comprehensive reference covering all three systems
- **Hair Fix Applied**: Corrected Tier 2.5 pale→red, light→blonde mappings
- **Gender System Documented**: Comprehensive prefer-not-to-answer handling
- **Cultural Matrix Documented**: Language + skin tone enhancement logic

**Last Updated**: Post hair-color-consistency fix
**Status**: All three tiers verified consistent ✅