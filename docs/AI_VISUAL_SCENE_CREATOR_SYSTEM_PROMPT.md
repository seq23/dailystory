# AI Visual Scene Creator System Prompt

**Last Updated:** 2025-10-01  
**Location:** `supabase/functions/ai-visual-scene-creator/index.ts`

## Complete System Prompt

```typescript
const systemPrompt = `Generate a comprehensive visual scene description for children's story image generation. Create rich primary scenes (200-1500 characters preferred) with key actions, setting, character descriptions, and other visual details derived from story text with intelligent enhancements and inferences.

JSON RESPONSE:
{
  "primaryScene": "Character name, age X, ethnicity, in rich, detailed visual scene description for image generation with main character description (verbatim hair and features provided), setting, key character actions, any secondary characters including animals, atmosphere, and comprehensive visual details",
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

## Key Changes (2025-10-08)

### Session-Wide Secondary Character Persistence (Latest)

**Purpose:** Ensure secondary characters maintain visual consistency across ALL pages in a session, regardless of absence duration (solves "Jake Problem").

**Changes:**
1. **Database Query Enhancement (Lines 430-470)**: Added session-wide character retrieval
   - New query fetches ALL `secondaryCharacters` from ALL previous pages (`lt('page_first_seen', pageNumber)`)
   - Map-based deduplication merges humans and pets arrays
   - Injects complete session memory into `previousVisualSchema.secondaryCharacters`

2. **Rule #6 Updated (Lines 521-530)**: "Secondary Characters - SESSION CONSISTENCY"
   - Title emphasizes session-wide consistency
   - **CRITICAL CONSISTENCY RULES** added (5 explicit rules)
   - AI instructed to extract ONLY from current story text
   - AI must reuse EXACT details for returning named characters from session memory
   - Prevents auto-inclusion of absent characters

3. **PREVIOUS SCENE Section Enhanced (Lines 601-615)**: Clarified session-wide scope
   - Added "ALL previous pages in session" language
   - **IMPORTANT** note: Data is "CONSISTENCY REFERENCE ONLY"
   - Prevents AI from auto-carrying forward characters not in current story

**Impact:**
- Character on page 2 maintains visual consistency when reappearing on page 8
- Session-wide memory without auto-inclusion (AI still requires story text mention)
- Solves long-absence consistency issues
- Minimal performance overhead (typical story = 10-20 pages)

**Example:**
- Page 2: "Jake: boy with curly brown hair, red shirt, blue baseball cap"
- Pages 3-7: Jake not mentioned
- Page 8: Story mentions "Jake ran to the door"
- Result: Jake appears with identical visual details from page 2

---

### Added Clothing Consistency System

**Purpose:** Track clothing across pages to maintain visual continuity with explicit carry-forward rules.

**Changes:**
1. **JSON Schema Update (Line 469)**: Added `"clothing": ["blue shirt", "red sneakers", "yellow hat"]` field to response format
2. **Rule 10 Added (Lines 502-506)**: CLOTHING CONSISTENCY RULES section with 5 specific guidelines
3. **PREVIOUS SCENE Enhancement (Lines 540-556)**: Clothing data now appears FIRST in structured schema (highest priority)
4. **Carry-Forward Rule**: AI must document all clothing in response even if not mentioned in current story text

**Impact:**
- Clothing colors/items persist across pages (e.g., "blue shirt" stays "blue shirt")
- Story-driven clothing changes supported (e.g., "put on a jacket")
- AI carries forward clothing from previous scenes automatically
- Structured clothing data prioritized over prose inference

---

## Key Changes (2025-10-05)

### Updated primaryScene Template and CRITICAL Instruction

**Purpose:** Allow AI to create more natural, flowing scene descriptions while maintaining verbatim character appearance accuracy.

**Changes:**
1. **JSON Response Example (Line 350)**: Updated primaryScene template to emphasize ethnicity positioning and verbatim requirements:
   - `"Character name, age X, ethnicity, in rich, detailed visual scene description for image generation with main character description (verbatim hair and features provided), setting, key character actions, any secondary characters including animals, atmosphere, and comprehensive visual details"`

2. **CRITICAL Instruction (Line 415)**: Updated to require hair and skin tone only (ethnicity handled separately), with enhancement permission:
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

---

## Complete System and User Prompts (Word-for-Word)

### System Prompt (Lines 317-598 in index.ts)

**Location:** `supabase/functions/ai-visual-scene-creator/index.ts`

```typescript
const systemPrompt = `Generate a comprehensive visual scene description for children's story image generation. Create rich primary scenes (200-1500 characters preferred) with key actions, setting, character descriptions, and other visual details derived from story text with intelligent enhancements and inferences.

JSON RESPONSE:
{
  "primaryScene": "Character name, age X, ethnicity, in rich, detailed visual scene description for image generation with main character description (verbatim hair and features provided), setting, key character actions, any secondary characters including animals, atmosphere, and comprehensive visual details",
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
  "objects": ["key props and objects in scene (e.g., 'ball', 'tree', 'flowers', 'toys')"],
  "clothing": ["list of clothing items and colors (e.g., 'blue shirt', 'red sneakers', 'yellow hat')"]
}

RULES:
1. Story text priority: absolute driver - never contradict visual details
2. Main action extraction: focus on most visually significant action from story text
3. Character appearance: use provided appearance data exactly as given, enhance unspecified details reasonably (e.g., if hair color provided use it, if not provided skip it or just describe hair styling)
4. Character poses and positioning: infer body positions from story actions ('wakes up' = sitting up in bed with arms stretched, 'runs' = dynamic running pose, 'reads' = sitting/lying with book, 'looks up' = head tilted upward, 'plays' = active engaging pose)
5. Singular/plural intelligence: "a bird" = 1 bird, "the bird" = 1 bird, "birds" = 2-4 birds, "many/lots of birds" = 5+ birds

**Rule #6: Secondary Characters - SESSION CONSISTENCY**
Extract ONLY characters explicitly mentioned in the CURRENT STORY TEXT:
- HUMANS: Named people (Jake, mom, teacher) or unnamed groups (friends, children, people)
- PETS: Named or unnamed animals (Whiskers the cat, dog, birds)

**CRITICAL CONSISTENCY RULES:**
1. Only include characters mentioned/implied in CURRENT story text
2. If a character from PREVIOUS SCENE data reappears by NAME, reuse their EXACT details for visual consistency
3. Do NOT carry forward characters unless they appear in current story
4. Do NOT invent names for unnamed characters (use "friends", "people", "dog")
5. For unnamed groups, use collective descriptions in primaryScene (Rule #1)

7. Atmospheric details: infer time of day, weather, indoor/outdoor context from story
8. Visual continuity on pages 2+: track object colors/details ('red ball' stays 'red ball'), resolve pronouns to same objects/characters, use previous scene context for consistency

**Rule #10: CLOTHING CONSISTENCY RULES**
1. Story-driven changes take precedence ("put on jacket" = add jacket)
2. Persist all clothing from PREVIOUS SCENE unless story text indicates change
3. Document ALL clothing items in response (carry forward from previous)
4. Use PREVIOUS SCENE clothing data as baseline, story text as modifier
5. If no clothing in PREVIOUS SCENE and none in story, infer seasonally appropriate items

CULTURAL CONTEXT:
${isNonEnglish ? `
CRITICAL: Enhance story settings with specific cultural elements for ${nativeLanguage} speakers:
${culturalContext}

EXAMPLE: For a French speaker named Sarah playing in a park, generate:
"Sarah with ${structuredAvatarData?.hairColor || 'natural hair'} and ${structuredAvatarData?.resolvedSkinTone || 'medium'} skin tone plays joyfully in a charming Parisian park near the Eiffel Tower, with the Seine River visible in the background, surrounded by elegant French gardens with lavender and a quaint café district with outdoor seating. Warm, sophisticated European aesthetic with golden afternoon light."

Use cultural detail naturally without contradicting explicit story settings.` : '- Use universal child-friendly settings with warm, inviting atmospheres'}`;
```

### User Prompt (Lines 600-633 in index.ts)

**Location:** `supabase/functions/ai-visual-scene-creator/index.ts`

```typescript
const userPrompt = `
**CURRENT STORY TEXT (Primary Authority):**
${storyText}

${previousVisualSchema ? `
**PREVIOUS SCENE (Session-Wide Character Memory):**
- Previous Primary Scene: ${previousVisualSchema.primaryScene || 'None'}
- Previous Clothing: ${previousVisualSchema.clothing?.join(', ') || 'None'}
- Previous Secondary Characters: ${JSON.stringify(previousVisualSchema.secondaryCharacters || { humans: [], pets: [] })}
- Previous Setting: ${previousVisualSchema.setting || 'None'}
- Previous Objects: ${previousVisualSchema.objects?.join(', ') || 'None'}

**IMPORTANT:** Previous Secondary Characters are from ALL previous pages in session. This data is for CONSISTENCY REFERENCE ONLY. Only include characters in your output if they are mentioned/implied in CURRENT story text.
` : ''}

**CHARACTER APPEARANCE (Verbatim Requirements):**
${characterAppearanceBlock}

**CRITICAL:** You MUST include the character's hair color and skin tone verbatim as provided above. You may not simplify it but you can enhance and weave it into the primary scene naturally. Ethnicity should be mentioned early in the primaryScene description.

**PAGE CONTEXT:**
Page ${pageNumber} of story for ${structuredAvatarData?.characterName || 'character'}

Generate the complete JSON response with all required fields.`;
```

### Database Query Implementation (Lines 430-470 in index.ts)

**Session-Wide Secondary Character Retrieval:**

```typescript
// Query for session-wide secondary characters (all previous pages)
const { data: sessionCharacters, error: charError } = await supabaseClient
  .from('visual_details_cache')
  .select('visual_elements')
  .eq('session_id', sessionId)
  .eq('detail_type', 'secondary_characters')
  .lt('page_first_seen', pageNumber)
  .order('page_first_seen', { ascending: false });

if (!charError && sessionCharacters && sessionCharacters.length > 0) {
  const allHumans = new Map<string, string>();
  const allPets = new Map<string, string>();
  
  // Merge and deduplicate characters from all previous pages
  for (const record of sessionCharacters) {
    const chars = record.visual_elements?.secondaryCharacters;
    if (chars) {
      chars.humans?.forEach((h: string) => {
        if (!allHumans.has(h)) allHumans.set(h, h);
      });
      chars.pets?.forEach((p: string) => {
        if (!allPets.has(p)) allPets.set(p, p);
      });
    }
  }
  
  // Inject session-wide characters into schema
  if (!previousVisualSchema) previousVisualSchema = {};
  previousVisualSchema.secondaryCharacters = {
    humans: Array.from(allHumans.values()),
    pets: Array.from(allPets.values())
  };
  
  console.log(`✅ SESSION_CHARACTERS_LOADED: ${allHumans.size} humans, ${allPets.size} pets from ${sessionCharacters.length} pages`);
}
```

---

## Implementation Details

### Secondary Character Persistence Flow

1. **Database Query** (Lines 430-470): Fetches ALL `secondaryCharacters` from ALL previous pages in session
2. **Deduplication** (Lines 445-462): Map-based merging ensures unique character names across session
3. **Schema Injection** (Lines 465-468): Session-wide characters added to `previousVisualSchema.secondaryCharacters`
4. **System Prompt Rule #6** (Lines 521-530): AI instructed to extract ONLY from current story text but reuse exact details for returning characters
5. **User Prompt Context** (Lines 601-615): Session-wide character data provided as "CONSISTENCY REFERENCE ONLY"

### Critical Design Decisions

**Why Session-Wide Retrieval?**
- Solves "Jake Problem" (character on page 2 consistent when reappearing on page 8)
- Minimal complexity (no new fields, just broader query)
- Leverages existing `visual_details_cache` storage

**Why "Reference Only" Approach?**
- Prevents AI from auto-including absent characters
- Maintains story-driven character inclusion
- Ensures current story text remains "Primary Authority"

**Why Map-Based Deduplication?**
- Ensures unique character names across session
- Preserves most recent visual details
- Efficient O(n) performance
