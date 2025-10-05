# Vocabulary Compliance Prompts - Complete Reference

**Last Updated**: 2025-10-05  
**Version**: 2.0  
**Status**: Production Active

## Overview

This document provides the **exact word-for-word prompts** used throughout the story generation system to enforce vocabulary compliance. These prompts are designed to guide AI models to include:

- **100% of user-defined vocabulary** (formWords, specialRequestWords, teacherWords)
- **50%+ of grade-level educational vocabulary** (Dolch, Fry, Common Core standards)

### Compliance Philosophy

- **Guidance-Based**: Prompts encourage compliance without validation/rejection
- **Dual Priority**: User words take absolute priority over system vocabulary
- **Educational Focus**: Grade-level vocabulary supports learning goals
- **Natural Integration**: Words should flow naturally within the narrative

---

## Frontend Prompts

**Location**: `src/services/storyGenerationService.ts`

### Main Vocabulary Template (Lines 342-352)

#### When User Words Are Present (hasUserWords = true)

```
🎯 VOCABULARY REQUIREMENTS:
1. CRITICAL PRIORITY - INCLUDE ALL 100%: Use ALL of these user-specified words naturally in your story: [user word list] (sources: [form/special-request/teacher]). These words were specifically requested by the user/teacher and must be woven into the narrative.
2. EDUCATIONAL VOCABULARY - TARGET 50%+ USAGE: [educational standards vocabulary]. Use at least half of these grade-level words to support learning goals while maintaining story flow.
3. DIFFICULTY CONTEXT: Story difficulty level is [difficulty level]
4. FALLBACK: Age-appropriate vocabulary for [age]-year-olds
```

#### When No User Words Are Present (hasUserWords = false)

```
📚 VOCABULARY REQUIREMENTS - EDUCATIONAL FOCUS:
1. PRIMARY VOCABULARY - TARGET 50%+ USAGE: [educational standards vocabulary]. Use at least half of these educational words to support grade-level learning goals.
2. DIFFICULTY CONTEXT: Story difficulty level is [difficulty level]
3. FALLBACK: Age-appropriate vocabulary for [age]-year-olds
4. EMERGENCY: Simple vocabulary for ages 7-10 if needed
```

**Context**: This template is applied during story bundle creation and is sent to the AI generation endpoint. The `[educational standards vocabulary]` is populated by the `getEducationalVocabularyInstructions()` function.

---

### Grade-Level Vocabulary Instructions (Lines 493-497)

These instructions populate the educational vocabulary section of the main template based on the user's grade level.

#### Grade Level 0 (Pre-K, Ages 3-5)

```
📚 VOCABULARY TARGET (use 50%+ of these): Pre-K vocabulary following Dolch Pre-Primer sight words (40 essential words like: a, and, away, big, blue, can, come, down, find, for). These are foundational reading words for Pre-K learners.
```

#### Grade Level 1 (1st-2nd Grade, Ages 5-7)

```
📚 VOCABULARY TARGET (use 50%+ of these): 1st-2nd grade vocabulary following Dolch Primer + Fry's First 100 words (includes: after, again, an, any, as, ask, by, could, every, fly, from, give, going, had, has, her, him, his, how, just). These support early reading development.
```

#### Grade Level 2 (2nd-3rd Grade, Ages 7-9)

```
📚 VOCABULARY TARGET (use 50%+ of these): 2nd-3rd grade vocabulary following Dolch Grade 1-2 + Fry's words 101-300 (includes: around, because, before, best, both, buy, call, cold, does, don't, fast, first, five, found, gave, goes, green, its, made, many, off, or, pull, read, right, sing, sit, sleep, tell, their, these, those, upon, us, use, very, wash, which, why, wish, work, would, write, your). These words build reading fluency.
```

#### Grade Level 3 (4th-5th Grade, Ages 9-11)

```
📚 VOCABULARY TARGET (use 50%+ of these): 4th-5th grade vocabulary following Common Core Grade 4-5 + Fry's words 301-600 (includes more complex words like: beautiful, country, decided, discover, during, enough, especially, February, finally, happened, important, interesting, library, neither, probably, question, surprised, together, usually, weight). These expand academic vocabulary.
```

#### Grade Level 4 (Middle/High School, Ages 11-13+)

```
📚 VOCABULARY TARGET (use 50%+ of these): Middle/high school vocabulary following Academic Word List + Oxford 3000 + Common Core Tier 2 academic vocabulary (includes sophisticated words like: analyze, approach, appropriate, assume, category, concept, consist, constitute, create, define, demonstrate, element, establish, estimate, evaluate, factor, identify, indicate, individual, interpret, method, occur, percent, period, policy, principle, procedure, process, require, research, respond, role, section, significant, similar, source, specific, structure, theory, vary). These prepare for advanced academic work.
```

**Context**: These instructions are dynamically selected based on the user's grade level (0-4) and inserted into the main vocabulary template. Grade level is determined by the user's profile or age.

---

## Backend Prompts

**Location**: `supabase/functions/_shared/storyPrompts.ts`

### Level 0: Pre-Reader (Ages 3-5) - Lines 109-113

**NOTE**: This level was **NOT modified** in the recent vocabulary compliance update. It retains the original 70% compliance target.

```
VOCABULARY COMPLIANCE (70% minimum):
- PRIORITY 1: User words (from getUserVocabulary()) - ALWAYS allowed regardless of restrictions
- PRIORITY 2: Level 0 sight words (from getVocabularySet(0)) - Core 3-5 year vocabulary
- When user words provided: Mix user words + Level 0 words to reach 70% compliance
- When no user words: Use 70% Level 0 words + 30% simple fill words
```

**Context**: Pre-reader level maintains a 70% minimum target as these are the youngest learners with the simplest vocabulary needs.

---

### Level 1: Easy (Ages 5-7) - Lines 180-183

```
🎯 VOCABULARY REQUIREMENTS:
- PRIORITY 1 (INCLUDE ALL 100%): User-specified words from VocabularyService.getUserVocabulary() - These words were specifically requested by the user/teacher and must be woven naturally into the story. User vocabulary takes absolute priority and must be included regardless of grade level restrictions.
- PRIORITY 2 (TARGET 50%+ USAGE): getVocabularySet(1) - Level 1 system vocabulary (5-7 years: Dolch 1st grade + CVC expansion). Use at least half of these grade-appropriate words to support learning goals and reading development.
- When no user vocabulary exists, focus on Level 1 compliance for developing readers.
```

**Sentence Structure Context**:
- 4-8 word sentences (max 12 words)
- 15-24 words per page total (NO PAGE OVER 30 WORDS)
- Simple present/past tense, subject-verb-object structure

---

### Level 2: Medium (Ages 7-9) - Lines 228-231

```
🎯 VOCABULARY REQUIREMENTS:
- PRIORITY 1 (INCLUDE ALL 100%): User-specified words from VocabularyService.getUserVocabulary() - These words were specifically requested by the user/teacher and must be woven naturally into the story. User vocabulary takes absolute priority and must be included regardless of grade level restrictions.
- PRIORITY 2 (TARGET 50%+ USAGE): getVocabularySet(2) - Level 2 system vocabulary (7-9 years: Dolch 2nd grade + compound words). Use at least half of these grade-appropriate words to support learning goals and vocabulary development.
- When no user vocabulary exists, focus on Level 2 compliance for intermediate readers.
```

**Sentence Structure Context**:
- 5-12 word sentences (max 15 words)
- 50-70 words per page total
- Mix simple and compound sentences

---

### Level 3: Hard (Ages 9-11) - Lines 276-279

```
🎯 VOCABULARY REQUIREMENTS:
- PRIORITY 1 (INCLUDE ALL 100%): User-specified words from VocabularyService.getUserVocabulary() - These words were specifically requested by the user/teacher and must be woven naturally into the story. User vocabulary takes absolute priority and must be included regardless of grade level restrictions.
- PRIORITY 2 (TARGET 50%+ USAGE): getVocabularySet(3) - Level 3 system vocabulary (9-11 years: 3rd-4th grade academic terms). Use at least half of these grade-appropriate words to support learning goals and academic vocabulary development.
- When no user vocabulary exists, focus on Level 3 compliance for advanced elementary readers.
```

**Sentence Structure Context**:
- Varied sentence lengths (max 20 words)
- 80-120 words per page total
- Complex sentences with dependent clauses

---

### Level 4: Expert (Ages 11-13+) - Lines 324-327

```
🎯 VOCABULARY REQUIREMENTS:
- PRIORITY 1 (INCLUDE ALL 100%): User-specified words from VocabularyService.getUserVocabulary() - These words were specifically requested by the user/teacher and must be woven naturally into the story. User vocabulary takes absolute priority and must be included regardless of grade level restrictions.
- PRIORITY 2 (TARGET 50%+ USAGE): getVocabularySet(4) - Level 4 system vocabulary (11-13+ years: comprehensive 7th-12th grade). Use at least half of these grade-appropriate words to support learning goals and advanced vocabulary development.
- When no user vocabulary exists, focus on Level 4 compliance for advanced readers.
```

**Sentence Structure Context**:
- Sophisticated sentence structures with multiple clauses
- 120-200 words per page total
- Literary devices and advanced vocabulary

---

### Expert Grade-Specific Levels (6th-10th Grade)

All expert grade levels (6th through 10th) use the same vocabulary requirements template with grade-specific context.

#### 6th Grade Expert - Lines 369-372

```
🎯 VOCABULARY REQUIREMENTS:
- PRIORITY 1 (INCLUDE ALL 100%): User-specified words from VocabularyService.getUserVocabulary() - These words were specifically requested by the user/teacher and must be woven naturally into the story. User vocabulary takes absolute priority and must be included regardless of grade level restrictions.
- PRIORITY 2 (TARGET 50%+ USAGE): getVocabularySet(4) - Level 4 system vocabulary (6th grade uses comprehensive expert-level vocabulary). Use at least half of these educational words to support advanced learning goals.
- When no user vocabulary exists, use Level 4 vocabulary with 6th grade sentence complexity.
```

#### 7th Grade Expert - Lines 415-418

```
🎯 VOCABULARY REQUIREMENTS:
- PRIORITY 1 (INCLUDE ALL 100%): User-specified words from VocabularyService.getUserVocabulary() - These words were specifically requested by the user/teacher and must be woven naturally into the story. User vocabulary takes absolute priority and must be included regardless of grade level restrictions.
- PRIORITY 2 (TARGET 50%+ USAGE): getVocabularySet(4) - Level 4 system vocabulary (7th grade uses comprehensive expert-level vocabulary). Use at least half of these educational words to support advanced learning goals.
- When no user vocabulary exists, use Level 4 vocabulary with 7th grade sentence complexity.
```

#### 8th Grade Expert - Lines 461-464

```
🎯 VOCABULARY REQUIREMENTS:
- PRIORITY 1 (INCLUDE ALL 100%): User-specified words from VocabularyService.getUserVocabulary() - These words were specifically requested by the user/teacher and must be woven naturally into the story. User vocabulary takes absolute priority and must be included regardless of grade level restrictions.
- PRIORITY 2 (TARGET 50%+ USAGE): getVocabularySet(4) - Level 4 system vocabulary (8th grade uses comprehensive expert-level vocabulary). Use at least half of these educational words to support advanced learning goals.
- When no user vocabulary exists, use Level 4 vocabulary with 8th grade sentence complexity.
```

#### 9th Grade Expert - Lines 507-510

```
🎯 VOCABULARY REQUIREMENTS:
- PRIORITY 1 (INCLUDE ALL 100%): User-specified words from VocabularyService.getUserVocabulary() - These words were specifically requested by the user/teacher and must be woven naturally into the story. User vocabulary takes absolute priority and must be included regardless of grade level restrictions.
- PRIORITY 2 (TARGET 50%+ USAGE): getVocabularySet(4) - Level 4 system vocabulary (9th grade uses comprehensive expert-level vocabulary). Use at least half of these educational words to support advanced learning goals.
- When no user vocabulary exists, use Level 4 vocabulary with 9th grade sentence complexity.
```

#### 10th Grade Expert - Lines 553-556

```
🎯 VOCABULARY REQUIREMENTS:
- PRIORITY 1 (INCLUDE ALL 100%): User-specified words from VocabularyService.getUserVocabulary() - These words were specifically requested by the user/teacher and must be woven naturally into the story. User vocabulary takes absolute priority and must be included regardless of grade level restrictions.
- PRIORITY 2 (TARGET 50%+ USAGE): getVocabularySet(4) - Level 4 system vocabulary (10th grade uses comprehensive expert-level vocabulary). Use at least half of these educational words to support advanced learning goals.
- When no user vocabulary exists, use Level 4 vocabulary with 10th grade sentence complexity.
```

**Context**: All expert grade levels (6-10) reference the same Level 4 vocabulary set (`getVocabularySet(4)`) but with grade-specific sentence complexity and content maturity expectations.

---

## Prompt Evolution

### Before (Original System)

**Original User Vocabulary Instructions**:
```
Use these user-specified words: [word list]
Try to include grade-level vocabulary when appropriate
```

**Original System Vocabulary Instructions**:
```
VOCABULARY COMPLIANCE (70% minimum):
- Use words from the vocabulary set
- Balance user words with system vocabulary
```

### After (Current System - Updated 2025-10-05)

**Current User Vocabulary Instructions**:
```
🎯 CRITICAL PRIORITY - INCLUDE ALL 100%: Use ALL of these user-specified words naturally in your story: [word list] (sources: [source types]). These words were specifically requested by the user/teacher and must be woven into the narrative.
```

**Current System Vocabulary Instructions**:
```
📚 EDUCATIONAL VOCABULARY - TARGET 50%+ USAGE: [grade-level vocabulary]. Use at least half of these grade-level words to support learning goals while maintaining story flow.
```

### Key Changes Made

1. **Explicit Targets**: Changed from vague "try to include" to specific "100%" and "50%+ usage" targets
2. **Priority Labeling**: Added "PRIORITY 1" and "PRIORITY 2" labels to clarify hierarchy
3. **Emoji Markers**: Added 🎯 and 📚 for visual prominence in prompts
4. **Educational Context**: Added explanations of why words matter (e.g., "support learning goals")
5. **Source Transparency**: Added source attribution (form/special-request/teacher) for user words
6. **Encouraging Language**: Used positive, instructive language without threat of rejection
7. **Fallback Guidance**: Added fallback instructions for scenarios without user vocabulary

---

## Integration Flow

### Request Flow Through System

```
1. User Profile → Grade Level Determined
                 ↓
2. Frontend Service → Vocabulary Bundle Created
   - User words collected (formWords, specialRequestWords, teacherWords)
   - Grade-level instructions selected (0-4)
   - Main template populated with vocabulary requirements
                 ↓
3. Edge Function Router → Bundle passed to AI handler
                 ↓
4. AI Handler → Prompts constructed with:
   - Frontend vocabulary template (Priority 1 & 2)
   - Backend difficulty-level prompts (sentence structure + vocabulary)
   - User info and theme integration
                 ↓
5. OpenAI Models → Generate story with vocabulary compliance
   - gpt-4-turbo-2024-04-09 (Attempt 1)
   - gpt-4o-mini (Attempt 2 fallback)
                 ↓
6. Story Response → Parsed and returned to frontend
                 ↓
7. Vocabulary Service → Track word encounters (authenticated users only)
```

### Priority System Explanation

**PRIORITY 1: User-Defined Words (100% target)**
- Sources: formWords, specialRequestWords, teacherWords
- Treatment: Must be woven naturally into narrative
- Override: Takes absolute priority over grade-level restrictions
- Examples: "butterfly, metamorphosis, cocoon" (teacher-requested)

**PRIORITY 2: Educational Vocabulary (50%+ target)**
- Sources: Dolch lists, Fry words, Common Core standards
- Treatment: Use at least half to support learning goals
- Fallback: Age-appropriate vocabulary if vocabulary set unavailable
- Examples: Grade 2 might include "because, before, around, both"

---

## Expected Outcomes

### Compliance Rate Improvements

**Before Update** (Estimated):
- User vocabulary inclusion: ~60-75%
- System vocabulary inclusion: ~40-60%
- Inconsistent compliance across difficulty levels

**After Update** (Target):
- User vocabulary inclusion: **95-100%** (aiming for perfect compliance)
- System vocabulary inclusion: **50-70%** (minimum 50%, natural variation above)
- Consistent compliance expectations across all levels

### AI Behavior Changes

1. **Increased User Word Integration**: AI models prioritize user words earlier in story generation
2. **Educational Context Awareness**: AI understands the pedagogical purpose of vocabulary lists
3. **Natural Weaving**: Stronger emphasis on "natural" integration prevents forced vocabulary usage
4. **Fallback Clarity**: Clear fallback instructions reduce confusion when vocabulary sets are unavailable

### Monitoring Approach

**No Hard Validation**: Stories are not rejected for vocabulary non-compliance

**Soft Monitoring** (Recommended):
- Log vocabulary usage rates in analytics
- Track user words vs. system words inclusion percentages
- Monitor story quality ratings relative to vocabulary compliance
- A/B test compliance rate impact on user satisfaction

**Quality Over Quantity**: Natural narrative flow takes precedence over forced vocabulary insertion

---

## Vocabulary Sources Reference

### User-Defined Vocabulary Sources

1. **formWords**: Words collected from the story generation form (user input)
2. **specialRequestWords**: Words from special requests or custom prompts
3. **teacherWords**: Words specifically provided by teachers/educators

### System Vocabulary Sources

1. **Dolch Lists**: 
   - Pre-Primer (40 words)
   - Primer (52 words)
   - Grade 1 (41 words)
   - Grade 2 (46 words)
   - Grade 3 (41 words)

2. **Fry Words**:
   - First 100 (most common)
   - 101-300 (intermediate)
   - 301-600 (advanced elementary)

3. **Common Core Standards**:
   - Grade 4-5 vocabulary
   - Tier 2 academic vocabulary (cross-curricular)
   - Academic Word List (AWL)

4. **Oxford 3000**:
   - Core vocabulary for English learners
   - Used in expert/advanced levels

---

## Usage Examples

### Example 1: Guest User, Age 7, No Custom Vocabulary

**Applied Prompts**:
- Frontend: "📚 VOCABULARY REQUIREMENTS - EDUCATIONAL FOCUS" (no user words version)
- Backend: Level 1 (Easy) prompt with "TARGET 50%+ USAGE: getVocabularySet(1)"
- Grade Instructions: "1st-2nd grade vocabulary following Dolch Primer + Fry's First 100"

**Expected Behavior**:
- AI focuses on Priority 2 (system vocabulary only)
- Uses ~50-70% of Dolch Primer + Fry First 100 words
- Age-appropriate fallback vocabulary fills the rest

---

### Example 2: Premium User, Age 9, Teacher Vocabulary: "photosynthesis, chlorophyll, oxygen"

**Applied Prompts**:
- Frontend: "🎯 VOCABULARY REQUIREMENTS" with user words (Priority 1 + Priority 2)
- Backend: Level 2 (Medium) prompt with both priorities
- Grade Instructions: "2nd-3rd grade vocabulary following Dolch Grade 1-2 + Fry's 101-300"

**Expected Behavior**:
- AI includes "photosynthesis, chlorophyll, oxygen" naturally (100% target)
- Also weaves in ~50%+ of Dolch Grade 1-2 words
- Story complexity matches Level 2 (50-70 words/page, compound sentences)

---

### Example 3: Premium User, 10th Grade Expert, No Custom Vocabulary

**Applied Prompts**:
- Frontend: "📚 VOCABULARY REQUIREMENTS - EDUCATIONAL FOCUS" (no user words version)
- Backend: 10th Grade Expert prompt with Priority 2 focus
- Grade Instructions: "Middle/high school vocabulary (Academic Word List + Oxford 3000)"

**Expected Behavior**:
- AI focuses on sophisticated academic vocabulary
- Uses ~50%+ of Level 4 vocabulary set (AWL, Oxford 3000, Tier 2)
- 120-200 words per page with literary devices

---

## Quality Assurance

### Validation Framework

This system uses a **guidance-based approach** without hard validation. Quality is monitored through:

1. **User Satisfaction Metrics**: Story ratings, completion rates
2. **Vocabulary Analytics**: Inclusion rates logged but not enforced
3. **A/B Testing**: Compare compliance rate impacts on engagement
4. **Manual Review**: Periodic sampling of generated stories

### No Story Rejection

**Critical Design Decision**: Stories are **never rejected** for vocabulary non-compliance. This ensures:
- No user frustration from regeneration loops
- Natural narrative flow takes priority
- AI has creative freedom within guidance
- Educational goals are encouraged, not mandated

---

## Troubleshooting

### Issue: User Words Not Appearing in Story

**Possible Causes**:
1. User words not properly collected in frontend form
2. VocabularyService.getUserVocabulary() returning empty
3. AI model ignoring Priority 1 instructions

**Debug Steps**:
1. Check network request payload for vocabulary bundle
2. Verify `hasUserWords` flag is true in frontend template
3. Review edge function logs for vocabulary data
4. Test with explicit, simple user words (e.g., "cat, dog, tree")

---

### Issue: Too Much System Vocabulary, Story Feels Forced

**Possible Causes**:
1. 50%+ target being interpreted as minimum requirement
2. Vocabulary set too large for page word count
3. AI over-prioritizing vocabulary over narrative flow

**Solutions**:
1. Clarify in prompts: "natural integration" and "maintain story flow"
2. Reduce vocabulary set size for lower grade levels
3. Add prompt instruction: "Quality of story takes priority over quantity of vocabulary"

---

### Issue: Vocabulary Compliance Inconsistent Across Levels

**Possible Causes**:
1. Different AI models behaving differently (gpt-4 vs gpt-4o-mini)
2. Level 0 still using old 70% system
3. Expert levels referencing same vocabulary set but different interpretations

**Solutions**:
1. Monitor compliance by model and level
2. Consider updating Level 0 to match new system
3. Add level-specific examples in prompts

---

## Maintenance & Updates

### When to Update Prompts

1. **User feedback indicates low vocabulary inclusion**: Strengthen Priority 1 language
2. **Stories feel forced or unnatural**: Add more "natural weaving" instructions
3. **Educational standards change**: Update grade-level vocabulary lists
4. **New user vocabulary sources added**: Update source attribution in prompts

### Version History

- **v2.0** (2025-10-05): Added 100% user word target, 50%+ system vocabulary target, emoji markers, priority labels
- **v1.0** (Pre-2025): Original vocabulary compliance system with 70% minimum

### Testing New Prompts

1. Test with controlled vocabulary sets (5 user words, 10 system words)
2. Generate 10 stories per difficulty level
3. Manually count vocabulary inclusion rates
4. Compare story quality ratings before/after prompt changes
5. A/B test in production with small user percentage

---

## Related Documentation

- **[STORY_GENERATION_GUIDE.md](./STORY_GENERATION_GUIDE.md)**: Complete story generation system guide
- **[STORY_GENERATION_SYSTEM.md](./STORY_GENERATION_SYSTEM.md)**: Technical architecture and AI generation details
- **[Voice Catalog README](../src/services/voiceCatalog/README.md)**: Voice selection and story prompt integration

---

**Document Status**: Production Active  
**Last Audit**: 2025-10-05  
**Next Review**: 2025-11-05 or upon significant system changes
