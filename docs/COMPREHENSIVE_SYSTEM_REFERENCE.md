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
- **AI Enhancement**: `supabase/functions/ai-visual-scene-creator/index.ts` (line 430)
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

### ✅ LANGUAGE + SKIN TONE MATRIX (CORRECTED)

```javascript
// CORRECTED Trigger Logic:
English + dark skin = African American enhancements ONLY (shouldApplyAfricanAmericanCulturalVariations)
English + non-dark skin = NO cultural enhancements (hair mapping handled separately)
French + any skin = French language cultural profile ("fr")
Spanish + any skin = Spanish language cultural profile ("es") 
Chinese + any skin = Chinese language cultural profile ("zh")
Arabic + any skin = Arabic language cultural profile ("ar")
Hindi + any skin = Hindi language cultural profile ("hi")
Other non-English + any skin = Respective native language cultural profile
```

### CRITICAL CLARIFICATION
- **English users**: Only dark skin users get African American cultural enhancements. Non-dark skin English users receive NO cultural profile enhancements (hair mapping is handled separately by UnifiedCharacterConsistency.js).
- **Non-English users**: All users regardless of skin tone get their native language cultural profile applied.

### Implementation Locations
- **Main Cultural Enhancement Logic**: `supabase/functions/_shared/FrontendIntelligence.js` (enhanceVisualPromptWithCulture, lines 299-354)
- **African American Detection**: `supabase/functions/_shared/FrontendIntelligence.js` (shouldApplyAfricanAmericanCulturalVariations, lines 576-625)
- **Native Language Detection**: `supabase/functions/_shared/FrontendIntelligence.js` (shouldApplyNativeLanguageCulturalProfile, lines 628-639)  
- **Cultural Profiles**: `supabase/functions/_shared/FrontendIntelligence.js` (CULTURAL_VISUAL_PROFILES, lines 51-94)
- **Enhancement Arrays**: `supabase/functions/_shared/FrontendIntelligence.js` (EXPANDED_AFRICAN_AMERICAN_* arrays)
- **Character Consistency**: `supabase/functions/_shared/UnifiedCharacterConsistency.js` (hair mapping handled separately)

### Specific Enhancements Applied

#### English + Dark Skin → African American Enhancements ONLY
- **Hairstyles**: Natural textures, braids, locs, twist-outs (via separate hair mapping system)
- **Settings**: Churches, barbershops, family cookouts, community events (story-context based only)
- **Cultural Elements**: Heritage symbols, community strength, family traditions (story-context based only)
- **Details**: Soul food, gospel music, extended family gatherings (story-context based only)
- **NO base cultural profile keywords applied** (skin tone, hair, clothing keywords from English profile are skipped)

#### English + Non-Dark Skin → NO Cultural Enhancements
- **Hair mapping**: Handled separately by `UnifiedCharacterConsistency.js` based on avatar skin tone
- **Cultural elements**: None applied (no English cultural profile keywords)
- **Settings**: Only story-context based, no cultural enhancements
- **Result**: Clean character generation without inappropriate cultural elements

#### Non-English + Any Skin → Native Language Cultural Profile  
- **Full Cultural Profile**: All keywords from native language profile applied (skin tone, hair, clothing, cultural elements)
- **Example Languages**: Spanish, French, Chinese, Arabic, Hindi
- **Hair mapping**: Combined with native language hair style keywords
- **Cultural Context**: Authentic representation matching user's native language

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
# CORRECTED Test language + skin combinations:
English + dark → shouldApplyAfricanAmericanCulturalVariations = true, African American enhancements applied ✅
English + pale/light/medium/olive → NO cultural enhancements, hair mapping only ✅  
French + any skin → Native language cultural profile applied ✅
Spanish + any skin → Native language cultural profile applied ✅
Chinese + any skin → Native language cultural profile applied ✅
Arabic + any skin → Native language cultural profile applied ✅
Hindi + any skin → Native language cultural profile applied ✅
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
- Check shouldApplyAfricanAmericanCulturalVariations trigger (English + dark skin only)
- Check shouldApplyNativeLanguageCulturalProfile trigger (non-English languages only)
- Verify English + non-dark skin gets NO cultural enhancements
- Verify non-English languages get full cultural profiles regardless of skin tone
- Look for cultural profile assignments and enhancement applications

---

## VERSION HISTORY

- **v1.0** (Initial): Created comprehensive reference covering all three systems
- **Hair Fix Applied**: Corrected Tier 2.5 pale→red, light→blonde mappings
- **Gender System Documented**: Comprehensive prefer-not-to-answer handling
- **Cultural Matrix Documented**: Language + skin tone enhancement logic
- **v2.0** (Cultural Fix Applied): Fixed English + non-dark skin cultural enhancement bug
  - English + non-dark skin now receives NO cultural enhancements (hair mapping only)
  - Added shouldApplyNativeLanguageCulturalProfile method for non-English detection
  - Updated enhanceVisualPromptWithCulture logic to differentiate properly

---

## 4. VISUAL-FIRST PROMPT OPTIMIZATION SYSTEM

### ✅ ENHANCED AI SYSTEM PROMPTS (PHASE 6)

The system prompts in `ai-visual-scene-creator/index.ts` have been enhanced to explicitly instruct OpenAI to use `previousPageText` for visual inferences and scene continuity:

#### Core Instructions Added to System Prompts:
```javascript
// Enhanced system prompts include:
- "Analyze the PREVIOUS STORY CONTEXT to understand what visual elements should continue or evolve"
- "Use previous page information to ensure visual progression and continuity"
- "Maintain continuity of setting, character positioning, and objects from previous scenes"
- "If previous context shows the character in a specific location or situation, ensure logical visual progression"
- "Inform your character and environmental descriptions using insights from the previous page"
```

#### Implementation Locations:
- **Simplified Model Prompt**: `ai-visual-scene-creator/index.ts` (lines 540-620)
- **Legacy Model Prompt**: `ai-visual-scene-creator/index.ts` (lines 650-750) 
- **Previous Context Integration**: `ai-visual-scene-creator/index.ts` (lines 625-630, 722)

### ✅ ENHANCED VALIDATION SYSTEM

#### Quality Scoring Criteria (5-Point System):
1. **Character presence and clarity** (20 points)
2. **Setting and environment details** (20 points) 
3. **Visual scene composition** (20 points)
4. **Actionable visual elements** (20 points)
5. **Narrative coherence with previous context** (20 points)

#### Validation Requirements:
- **Minimum Length**: 120+ characters for `primaryScene`
- **Quality Threshold**: 60+ points (60% pass rate)
- **Previous Context Integration**: Must reference or logically continue from previous page when available
- **Fail-Fast Implementation**: Immediate Tier 2 triggering on validation failure

### ✅ COMPREHENSIVE DEBUGGING SYSTEM

#### Request ID Correlation System:
- **Unique Request IDs**: Generated for each image generation request
- **Cross-Function Tracking**: IDs passed through all tiers and functions
- **Detailed Logging**: Enhanced logs with request correlation across ai-visual-scene-creator, runware-generate-image, and debug functions

#### Enhanced Logging Components:
1. **OpenAI Prompt Debugging**: Full system and user prompts logged with request IDs
2. **Validation Step Tracking**: Each validation criterion logged with scores
3. **Previous Context Integration**: Detailed logs of how previous page text influences current generation
4. **Runware Assembly Debugging**: Complete prompt building process logged
5. **Tier Fallback Tracking**: Detailed error propagation between tiers

#### Implementation Locations:
- **AI Visual Scene Creator**: `ai-visual-scene-creator/index.ts` (enhanced request structure logging)
- **Runware Generator**: `runware-generate-image/index.ts` (tier system debugging)
- **Debug Function**: `debug-prompt-history/index.ts` (prompt history tracking)

---

## CRITICAL TESTING SCENARIOS (UPDATED)

### Visual-First Optimization Test
```bash
# Test previous context integration:
Page 1 generation → stores context ✅
Page 2 generation → references Page 1 context ✅
Page 3 generation → maintains visual continuity ✅

# Test enhanced validation:
Short primaryScene (< 120 chars) → Tier 1 fails, Tier 2 triggers ✅
Low quality score (< 60 points) → Tier 1 fails, Tier 2 triggers ✅
Missing previous context reference → Quality score penalty ✅
```

### Enhanced Debugging Test
```bash
# Test request correlation:
Generate image → unique request ID created ✅
Check ai-visual-scene-creator logs → request ID present ✅
Check runware-generate logs → same request ID tracked ✅
Check debug-prompt-history → request ID correlated ✅

# Test detailed validation logging:
Tier 1 validation → each criterion logged with score ✅
Previous context analysis → detailed integration logs ✅
Runware assembly → complete prompt building logged ✅
```

---

## REGRESSION PREVENTION RULES (UPDATED)

### 🚫 NEVER DO
1. **Remove previous context integration** - Breaks visual continuity
2. **Lower validation thresholds** - Reduces output quality 
3. **Remove enhanced logging** - Eliminates debugging capabilities
4. **Skip request ID correlation** - Breaks cross-function tracking
5. **Modify system prompt instructions** - Reduces AI's context awareness

### ✅ ALWAYS DO
1. **Test previous context usage** after AI prompt changes
2. **Verify enhanced validation** maintains quality standards
3. **Check request ID propagation** across all functions
4. **Validate detailed logging** provides sufficient debugging info
5. **Update debugging documentation** when adding new features

---

**Last Updated**: Post Visual-First Prompt Optimization (Phase 6)
**Status**: All four systems implemented and verified ✅