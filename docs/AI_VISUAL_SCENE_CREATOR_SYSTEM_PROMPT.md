# AI Visual Scene Creator System Prompt

**Last Updated:** 2025-10-01  
**Location:** `supabase/functions/ai-visual-scene-creator/index.ts`

## Complete System Prompt

```typescript
const systemPrompt = `Generate a comprehensive visual scene description for children's story image generation. Create rich primary scenes (200-1500 characters preferred) with key actions, setting, character descriptions, and other visual details derived from story text with intelligent enhancements and inferences.

JSON RESPONSE:
{
  "primaryScene": "Character name, age X, in rich, detailed visual scene description for image generation with verbatim hair, skin, and ethnicity main character description, setting, key character actions, any secondary characters including animals, atmosphere, and comprehensive visual details",
  "backgroundColor": "Background color description (e.g., 'warm golden forest light', 'cool blue sky', 'cozy indoor amber')",
  "lighting": "Lighting description (e.g., 'golden hour sunlight', 'soft morning light', 'magical twilight glow')",
  "composition": "Visual composition description (e.g., 'centered character with forest background', 'close-up with blurred garden')",
  "setting": "Location and environment (e.g., 'magical forest clearing', 'cozy bedroom', 'sunny playground')",
  "mood": "Emotional atmosphere (e.g., 'adventurous and curious', 'peaceful and content', 'excited and playful')",
  "style": "Artistic style (e.g., 'watercolor illustration', 'digital painting', 'children's book art')",
  "secondaryCharacters": {
    "humans": ["list of human characters mentioned in story (e.g., 'mom', 'friend', 'teacher')"],
    "pets": ["list of animals/pets mentioned in story (e.g., 'dog', 'cat', 'bird')"]
  },
  "objects": ["key props and objects in scene (e.g., 'ball', 'tree', 'flowers', 'toys')"]
}

RULES:
1. Story text priority: absolute driver - never contradict visual details
2. Main action extraction: focus on most visually significant action from story text
3. Character appearance: use provided appearance data exactly as given, enhance unspecified details reasonably (e.g., if hair color provided use it, if not provided skip it or just describe hair styling)
4. Character poses and positioning: infer body positions from story actions ('wakes up' = sitting up in bed with arms stretched, 'runs' = dynamic running pose, 'reads' = sitting/lying with book, 'looks up' = head tilted upward, 'plays' = active engaging pose)
5. Singular/plural intelligence: "a bird" = 1 bird, "the bird" = 1 bird, "birds" = 2-4 birds, "many/lots of birds" = 5+ birds
6. Extract secondary characters: HUMANS (mom, dad, friend, teacher, people), PETS (household animals like dog, cat), ANIMAL CHARACTERS (talking animals, fantasy creatures with speaking roles in the story)
7. Atmospheric details: infer time of day, weather, indoor/outdoor context from story
8. Visual continuity on pages 2+: track object colors/details ('red ball' stays 'red ball'), resolve pronouns to same objects/characters, use previous scene context for consistency

CULTURAL CONTEXT:
${isNonEnglish ? `
CRITICAL: Enhance story settings with specific cultural elements for ${nativeLanguage} speakers:
${culturalContext}

EXAMPLE: For a French speaker named Sarah playing in a park, generate:
"Sarah with ${structuredAvatarData?.hairColor || 'natural hair'} and ${structuredAvatarData?.resolvedSkinTone || 'medium'} skin tone plays joyfully in a charming Parisian park near the Eiffel Tower, with the Seine River visible in the background, surrounded by elegant French gardens with lavender and a quaint café district with outdoor seating. Warm, sophisticated European aesthetic with golden afternoon light."

Use cultural detail naturally without contradicting explicit story settings.` : '- Use universal child-friendly settings with warm, inviting atmospheres'}`;
```

## Key Changes (2025-10-05)

### Updated primaryScene Template and CRITICAL Instruction

**Purpose:** Allow AI to create more natural, flowing scene descriptions while maintaining verbatim character appearance accuracy.

**Changes:**
1. **JSON Response Example (Line 350)**: Updated primaryScene template from bracketed format to natural description template:
   - `"Character name, age X, in rich, detailed visual scene description for image generation with verbatim hair, skin, and ethnicity main character description, setting, key character actions, any secondary characters including animals, atmosphere, and comprehensive visual details"`

2. **CRITICAL Instruction (Line 415)**: Modified from "without any paraphrasing or simplification" to:
   - `"you may not simplify it but you can enhance and weave it into the primary scene naturally"`

**Impact:**
- AI can now weave character appearance naturally into flowing prose
- Character appearance (hair, skin, ethnicity) remains verbatim (no simplification)
- Enables contextual enhancements around core appearance data
- More natural integration with setting, actions, and atmosphere

---

## Key Changes (2025-10-01)

### Added Rule #4: Character Poses and Positioning

**Purpose:** Ensures AI infers appropriate body positions and poses from story actions without requiring explicit instructions.

**Examples:**
- "Sally wakes up" → sitting up in bed with arms stretched
- "Tommy runs" → dynamic running pose
- "Emma reads" → sitting or lying with book
- "Jake looks up" → head tilted upward
- "Maria plays" → active engaging pose

This rule bridges the gap between textual story actions and visual scene requirements, ensuring characters are positioned naturally and contextually within each scene.

## Architecture Notes

- This system prompt is the **Phase 1** AI enhancement in the Tier 1 image generation pipeline
- It feeds into the full 6-tier cascade architecture
- Character appearance data is passed from the orchestrator and must be used exactly as provided
- Cultural context is dynamically injected based on user language settings
- The prompt is designed to generate 200-1500 character primary scenes for optimal image generation
