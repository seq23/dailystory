# IMAGE GENERATION PROMPTS - WORD-FOR-WORD DOCUMENTATION

**Created**: 2025-10-01  
**Purpose**: Complete snapshot of all image generation prompts, templates, and character consistency data used across the story generation system.

---

## PAYLOAD CONVENTIONS

**CRITICAL**: All image generation functions (`runware-generate-image`, `runware-template-ab`, `runware-template-cd`) accept BOTH `pageText` AND `storyText` interchangeably.

**Supported Formats**:
1. Root-level: `{ pageText: "...", userInfo: {...}, sessionId: "...", pageNumber: 1 }`
2. Root-level alternate: `{ storyText: "...", userInfo: {...}, sessionId: "...", pageNumber: 1 }`
3. Nested enhancedStoryData: `{ enhancedStoryData: { storyText: "...", userInfo: {...}, sessionId: "..." } }`
4. Nested bundle: `{ bundle: { storyText: "...", userInfo: {...}, sessionId: "...", pageNumber: 1 } }`

The orchestrator (`runware-generate-image`) automatically normalizes all payloads to ensure both `pageText` and `storyText` are set at the root level, along with `userInfo`, `sessionId`, and `pageNumber`.

---

## TABLE OF CONTENTS

1. [AI Visual Scene Creator Prompts](#ai-visual-scene-creator-prompts)
2. [Image Generation Templates](#image-generation-templates)
3. [Character Consistency System](#character-consistency-system)
4. [Cultural Enhancement System](#cultural-enhancement-system)
5. [Negative Prompts](#negative-prompts)
6. [Style Frameworks](#style-frameworks)
7. [Hair & Skin Variation Arrays](#hair--skin-variation-arrays)

---

## AI VISUAL SCENE CREATOR PROMPTS

### System Prompt (OpenAI gpt-4o-mini)

**File**: `supabase/functions/ai-visual-scene-creator/index.ts` (lines 102-150)

```
Generate a comprehensive visual scene description for children's story image generation.

OBJECTIVE: Create a vivid visual scene description (200-1500 characters recommended) that captures the story moment with complete visual elements, character consistency, and cultural authenticity.

JSON RESPONSE:
{
  "primaryScene": "Rich, detailed visual scene description for image generation with setting, character actions, atmosphere, and comprehensive visual details",
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

CRITICAL CHARACTER RULES:
Use character appearance data EXACTLY as provided in the CHARACTER APPEARANCE section below - NEVER substitute, modify, or invent character details. Focus on scene generation and visual atmosphere.

VISUAL ENHANCEMENT RULES:
5. Create detailed primary scenes with rich visual descriptions (200-1500 characters)
6. Extract ALL secondary characters from story text and categorize correctly:
   - HUMANS: mom, dad, friend, teacher, brother, sister, grandma, neighbor, people
   - PETS/ANIMALS: dog, cat, bird, rabbit, hamster, fish, horse, any animals
7. Include comprehensive atmospheric details (time of day, weather, indoor/outdoor)
8. Specify background colors, lighting conditions, and visual composition
9. List key objects, props, and visual elements in the scene
10. Preserve exact counts: "a bird" = 1 bird, "birds" = multiple
11. Use visual continuity with previous scene context

ATMOSPHERIC GUIDANCE:
- Time of day: "morning sunlight", "afternoon glow", "evening twilight"
- Indoor/outdoor: "inside the cozy kitchen", "outside in the garden"  
- Weather: "sunny day", "light drizzle", "snowy morning"
- Objects/props: include furniture, toys, nature elements, tools

CULTURAL CONTEXT:
[For non-English speakers, specific cultural elements are injected here]

EXAMPLE: For a French speaker named Sarah playing in a park, generate:
"Sarah with [hair color] and [skin tone] plays joyfully in a charming Parisian park near the Eiffel Tower, with the Seine River visible in the background, surrounded by elegant French gardens with lavender and a quaint café district with outdoor seating. Warm, sophisticated European aesthetic with golden afternoon light."
```

### User Prompt Template

**File**: `supabase/functions/ai-visual-scene-creator/index.ts` (lines 152-162)

```
Create a visual scene description for this story page.

CHARACTER APPEARANCE: {characterName}, {assignedHairColor}, {skinFeatures}, {ethnicity} ethnicity

STORY TEXT:
"{storyText}"

PREVIOUS SCENE (for visual consistency):
"{previousPrimaryScene || 'None - this is the first scene'}"

Generate a comprehensive scene with complete visual elements including background, lighting, composition, setting, mood, style, secondary characters (categorized as humans vs pets), and key objects. Maintain character and setting continuity while showcasing the current page's action. Use the character appearance data exactly - include the specified hair color and skin tone prominently in the scene description.
```

**Character Data Format Examples**:
- `Emma, honey blonde hair, light skin complexion with bright blue eyes and soft features, Euro-American ethnicity`
- `Jamal, beautiful dark coils with defined curl pattern, caramel skin tone with deep chocolate eyes and a confident cheerful expression, african-american ethnicity`
- `Sofia, chocolate brown hair, olive skin tone with warm hazel eyes, Euro-American ethnicity`

---

## IMAGE GENERATION TEMPLATES

### TIER 1: Complete Template (Tier 2.5A) - runware-template-ab

**File**: `supabase/functions/runware-template-ab/index.js`

#### Template Structure (COMPLETE_TIER_1_TEMPLATE)

```
PRIMARY SCENE: {primaryScene}

CHARACTER DESCRIPTION: {characterSeed}

CONSISTENCY:
- Secondary characters: {secondaryCharacters}
- Colored objects: {coloredObjects}
- Setting context: {settingContext}

BRAND SUFFIX: {styleFramework}
```

**Character Seed Format** (from CharacterConsistencyService):
```
A {avatarType} named {characterName} {ageDescription}, {assignedHairColor}, {skinFeatures} {ethnicity}
```

**Example**:
```
PRIMARY SCENE: Emma walks around the dirt path near the lake and saw a purple butterfly.

CHARACTER DESCRIPTION: A girl named Emma 8, honey blonde hair, light skin complexion with bright blue eyes and soft features Euro-American.

CONSISTENCY:
- Secondary characters: Josie: {"type":"protagonist"}, butterfly: {"type":"animal"}
- Colored objects: purple butterfly
- Setting context: dirt path, lake and saw a purple butterfly

BRAND SUFFIX: Contemporary children's book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, warm natural lighting, detailed illustration.
```

### TIER 2.5C/D: Template-Based Generation - runware-template-cd

**File**: `supabase/functions/runware-template-cd/index.js`

#### Tier 2.5C Template (Simple Scene + Style Framework)
```
{pageText}

{styleFramework}
```

#### Tier 2.5D Template (Hardcoded Emergency Template)
```
A child enjoying a story moment in a warm, friendly setting.

Contemporary children's book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, warm natural lighting.
```

---

## CHARACTER CONSISTENCY SYSTEM

### Structured Avatar Data Generation

**File**: `supabase/functions/_shared/CharacterConsistencyService.js`

#### Method: `getStructuredAvatarData(sessionId, userInfo)`

**Returns**:
```javascript
{
  resolvedSkinTone: 'light',              // Standardized: pale, light, medium, olive, dark
  assignedHairColor: 'honey blonde hair',  // Specific variation from 73-item array
  skinFeatures: 'light skin complexion with bright blue eyes and soft features',
  ethnicity: 'Euro-American',             // Detected from language + skin tone
  source: 'character_service_generation', // Tracking metadata
  nativeLanguage: 'en',
  avatarType: 'girl'
}
```

#### Ethnicity Detection Logic

**File**: `supabase/functions/_shared/CharacterConsistencyService.js` (line 1348)

```javascript
static detectEthnicity(userInfo) {
  const skinTone = (userInfo?.avatar?.skinTone || userInfo?.skinTone || 'medium').toLowerCase();
  return (skinTone === 'dark' || skinTone === 'deep' || skinTone === 'darker') 
    ? 'african-american' 
    : 'Euro-American';
}
```

**Ethnicity Rules**:
- `dark`, `deep`, `darker` skin tones → `african-american`
- `pale`, `light`, `medium`, `olive` skin tones → `Euro-American`

---

## CULTURAL ENHANCEMENT SYSTEM

### Cultural Context by Language

**File**: `supabase/functions/ai-visual-scene-creator/index.ts` (lines 82-98)

```javascript
const culturalContextMap = {
  'fr': 'French cultural elements like Parisian parks near Eiffel Tower, Seine River waterfront scenes, charming café districts with outdoor seating, French gardens with lavender, elegant French architecture, boulangeries',
  
  'es': 'Spanish cultural settings like Mediterranean courtyards, colorful plazas with fountains, vibrant Hispanic neighborhoods, traditional Spanish architecture, sunny patios with potted plants, Spanish gardens',
  
  'zh': 'Chinese cultural elements like traditional gardens with bamboo, pagoda backgrounds, Chinese parks with stone bridges, cultural landmarks, lantern-lit scenes, traditional Chinese architecture',
  
  'ar': 'Middle Eastern cultural settings like desert oasis scenes, traditional Arabic architecture with geometric patterns, cultural landmarks, palm tree gardens, ornate archways',
  
  'default': '{language} cultural context with authentic local settings and architecture'
}
```

### African American Cultural Enhancements

**Hair Styles** (30 variations):
- **Girls**: `wearing natural hair in a cute protective style with colorful hair accessories`, `wearing beautiful braids with neat parting and decorative beads`, `wearing a stylish twist-out with defined curl pattern`, etc.
- **Boys**: `wearing a curly top fade with perfectly defined coils on top`, `wearing twist sponge curls with tight coil definition`, `wearing a high top fade with voluminous textured crown`, etc.

**Facial Features** (36 variations):
- `light brown skin tone with warm brown eyes and a bright infectious smile`
- `caramel skin tone with deep chocolate eyes and a confident cheerful expression`
- `medium brown skin tone with warm brown eyes and gentle features`
- `rich mahogany complexion with bright eyes and joyful dimpled smile`
- etc.

---

## NEGATIVE PROMPTS

### Nuclear Negative Prompt System

**File**: `supabase/functions/_shared/NuclearNegativePrompts.js`

#### Base Negative (Universal)
```
NO TEXT, no words, no letters, no writing, no captions, no watermarks, no signatures, no logos, bad anatomy, deformed, blurry, low quality, distorted face, extra limbs, malformed hands, poorly drawn, artifacts, noise, oversaturated, underexposed, overexposed, duplicate, cropped, watermark, signature, text, logo, bad lighting, flat lighting, plastic skin, waxy skin, artificial look, uncanny valley
```

#### Children's Book Protection
```
NO adult faces, adult features, mature faces, adult photos, realistic photography, photorealistic adults, adult portraits, grown-up faces, realistic human photos, photo of adults, adult photography, mature portraits, realistic adult imagery, photo-realistic people, adult subjects, mature individuals, realistic human photography, adult models, stock photos of adults, professional adult photography
```

#### Gender-Specific Negatives

**Boys**:
```
NO feminine features, makeup, female anatomy, girl clothing, long feminine hairstyles, feminine accessories, narrow shoulders, feminine body structure, female proportions, feminine expressions, girl toys, female-coded activities exclusively
```

**Girls**:
```
NO masculine features, facial hair, male anatomy, boy clothing, short masculine haircuts, broad shoulders, angular jaw, masculine body structure, male proportions, masculine expressions, boy toys, male-coded activities exclusively
```

**Gender Neutral**:
```
NO overly gendered features, extreme masculine traits, extreme feminine traits, gender-specific clothing, highly gendered toys, overly masculine expressions, overly feminine expressions, binary gender stereotypes, gendered color schemes exclusively
```

#### African American Protection (25+ items)
```
skin lightening, whitewashing, pale skin, light skin, caucasian features, european features, fair complexion, light complexion, white skin tone, bleached skin, lightened skin, washed out skin, faded skin tone, stereotypes, caricature, exaggerated features, cultural appropriation, offensive stereotypes, racial caricature, minstrel imagery, tokenism, straight hair texture, caucasian hair, european hair texture, fine hair texture, silky straight hair, pin straight hair, unnaturally straight hair, narrow nose, thin lips, small features, delicate bone structure, european bone structure, caucasian facial structure, non-African features
```

#### Universal Cultural Sensitivity
```
cultural stereotypes, racial stereotypes, ethnic stereotypes, cultural caricature, offensive imagery, discriminatory content, prejudicial representation, cultural mockery, insensitive portrayal, appropriative elements, tokenistic representation, oversimplified culture, cultural reduction
```

---

## STYLE FRAMEWORKS

### Nuclear Hardcoded Style Frameworks

**Files**: `supabase/functions/runware-template-ab/index.js` (lines 68-90), `supabase/functions/runware-template-cd/index.js` (lines 65-86)

#### Beginner / Easy / Medium
```
Contemporary children's book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, warm natural lighting
```

#### Hard / Expert
```
2.9D rendered illustration with golden hour volumetric lighting, SSS, AO, GI, beautiful child characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, child-friendly
```

---

## HAIR & SKIN VARIATION ARRAYS

### 73-Variation Hair System (by Skin Tone)

**File**: `supabase/functions/_shared/CharacterConsistencyService.js` (lines 800-1100)

#### Pale Skin (14 variations)
```javascript
[
  'platinum blonde hair', 'ice blonde hair', 'white blonde hair',
  'strawberry blonde hair', 'golden red hair', 'copper penny hair',
  'auburn curls', 'honey gold hair', 'champagne blonde hair',
  'pearl blonde hair', 'vanilla blonde hair', 'butter blonde hair',
  'golden flax hair', 'silver blonde hair'
]
```

#### Light Skin (15 variations)
```javascript
[
  'platinum blonde hair', 'golden blonde hair', 'honey blonde hair',
  'moonlight blonde hair', 'sunshine blonde hair', 'wheat blonde hair',
  'flaxen blonde hair', 'amber blonde hair', 'butterscotch blonde hair',
  'sandy blonde hair', 'champagne blonde hair', 'vanilla blonde hair',
  'lemon blonde hair', 'pearl blonde hair', 'dusty blonde hair'
]
```

#### Medium Skin (15 variations)
```javascript
[
  'chestnut brown hair', 'chocolate brown hair', 'coffee brown hair',
  'walnut brown hair', 'caramel brown hair', 'toffee brown hair',
  'honey brown hair', 'amber brown hair', 'hazel brown hair',
  'bronze brown hair', 'cinnamon brown hair', 'nutmeg brown hair',
  'russet brown hair', 'mocha brown hair', 'maple brown hair'
]
```

#### Olive Skin (14 variations)
```javascript
[
  'jet black hair', 'raven black hair', 'midnight black hair',
  'ebony black hair', 'onyx black hair', 'obsidian black hair',
  'coal black hair', 'espresso black hair', 'dark mahogany hair',
  'deep brown hair', 'rich brown hair', 'dark chocolate hair',
  'umber brown hair', 'dark coffee hair'
]
```

#### Dark Skin (15 variations)
```javascript
[
  'beautiful dark coils with defined curl pattern',
  'natural tight curls with gorgeous texture',
  'stunning kinky curls with volume',
  'gorgeous afro curls with beautiful definition',
  'natural curly hair with defined coils',
  'beautiful textured curls with shine',
  'natural coily hair with great volume'
]
```

### Skin Feature Variations (by Skin Tone)

#### Pale Skin Features (13 variations)
```javascript
[
  'alabaster skin with luminous green eyes and rosy cheeks',
  'ivory skin with crystal blue eyes and gentle smile',
  'porcelain skin with emerald eyes and delicate features',
  'cream skin with sapphire eyes and sweet expression',
  'moonlight skin with ocean blue eyes and soft smile',
  'pearl skin with jade green eyes and cheerful face',
  'snow skin with sky blue eyes and bright smile',
  'milky skin with sea green eyes and charming features',
  'fair skin with aqua eyes and warm smile',
  'light cream skin with teal eyes and friendly features',
  'pale rose skin with turquoise eyes and gentle face',
  'peachy pale skin with mint green eyes and joyful expression',
  'vanilla skin with cerulean eyes and sweet smile'
]
```

#### Light Skin Features (15 variations)
```javascript
[
  'light skin complexion with bright blue eyes and soft features',
  'fair skin with sparkling green eyes and cheerful smile',
  'peach skin tone with golden hazel eyes and gentle features',
  'rosy skin with warm brown eyes and friendly expression',
  'light beige skin with bright hazel eyes and sweet smile',
  'cream beige skin with deep blue eyes and kind features',
  'peachy cream skin with forest green eyes and joyful face',
  'soft pink skin tone with amber eyes and warm expression',
  'light rose skin with honey eyes and cheerful features',
  'pale beige skin with sage green eyes and gentle smile',
  'light ivory skin with chestnut eyes and friendly face',
  'peachy beige skin with teal eyes and bright smile',
  'cream rose skin with olive eyes and sweet expression',
  'soft cream skin with copper eyes and warm features',
  'light peach skin with moss green eyes and kind smile'
]
```

#### Medium Skin Features (15 variations)
```javascript
[
  'warm beige skin with deep brown eyes and friendly smile',
  'tan skin tone with dark brown eyes and cheerful expression',
  'honey skin with chocolate eyes and gentle features',
  'golden beige skin with warm brown eyes and bright smile',
  'olive beige skin with hazel eyes and sweet expression',
  'warm tan skin with amber eyes and kind features',
  'medium beige skin with dark hazel eyes and friendly face',
  'caramel skin tone with deep hazel eyes and joyful smile',
  'golden tan skin with brown eyes and warm expression',
  'wheat skin with chestnut eyes and cheerful features',
  'medium olive skin with walnut eyes and gentle smile',
  'sun-kissed skin with coffee eyes and bright face',
  'bronze beige skin with mahogany eyes and sweet features',
  'warm honey skin with toffee eyes and friendly smile',
  'medium tan skin with cocoa eyes and kind expression'
]
```

#### Olive Skin Features (14 variations)
```javascript
[
  'olive skin tone with deep brown eyes and warm smile',
  'Mediterranean olive skin with dark eyes and friendly features',
  'golden olive skin with chocolate eyes and cheerful expression',
  'rich olive skin with warm brown eyes and gentle smile',
  'tanned olive skin with deep hazel eyes and bright features',
  'warm olive complexion with dark brown eyes and sweet smile',
  'sun-kissed olive skin with espresso eyes and kind face',
  'deep olive skin with walnut eyes and joyful expression',
  'bronze olive skin with coffee eyes and warm features',
  'rich tan skin with mahogany eyes and friendly smile',
  'deep golden skin with dark hazel eyes and cheerful face',
  'warm bronze skin with deep brown eyes and gentle features',
  'olive tan skin with chocolate eyes and bright smile',
  'Mediterranean tan skin with dark eyes and sweet expression'
]
```

#### African American Facial Features (36 variations)
```javascript
[
  'light brown skin tone with warm brown eyes and a bright infectious smile',
  'caramel skin tone with deep chocolate eyes and a confident cheerful expression',
  'medium brown skin tone with warm brown eyes and gentle features',
  'honey brown complexion with amber eyes and friendly dimpled smile',
  'golden brown skin with dark brown eyes and joyful animated features',
  'rich caramel complexion with hazel eyes and warm welcoming smile',
  'toffee skin tone with deep brown eyes and bright expressive face',
  'warm brown complexion with chocolate eyes and cheerful engaging features',
  'light caramel skin with brown eyes and sweet gentle expression',
  'golden honey skin tone with warm eyes and friendly joyful smile',
  // ... 26 more variations
]
```

---

## SESSION-SEEDED SELECTION

### Deterministic Hair Selection

**File**: `supabase/functions/_shared/CharacterConsistencyService.js` (lines 1356-1363)

```javascript
static seededPick(array, seed) {
  if (!array || array.length === 0) return '';
  const hash = seed.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  const index = Math.abs(hash) % array.length;
  return array[index];
}
```

**Usage**:
- Same `sessionId` → Same hair color selection
- Different `sessionId` → Different hair color selection
- Ensures consistency within a story session
- Provides variety between different story sessions

---

## COMPLETE DATA FLOW DIAGRAM

```
User Profile (userInfo)
    ↓
CharacterConsistencyService.getStructuredAvatarData(sessionId, userInfo)
    ↓
Outputs: {
  resolvedSkinTone: 'light',
  assignedHairColor: 'honey blonde hair',  ← Session-seeded from 73-item array
  skinFeatures: 'light skin complexion...',
  ethnicity: 'Euro-American'
}
    ↓
ai-visual-scene-creator receives complete character data
    ↓
OpenAI System Prompt + User Prompt (with character data)
    ↓
OpenAI generates: {
  primaryScene: "Emma with honey blonde hair...",
  backgroundColor: "warm golden light",
  lighting: "soft natural light",
  // ... complete visual schema
}
    ↓
runware-template-ab builds COMPLETE_TIER_1_TEMPLATE
    ↓
Runware API generates image with:
  - Positive Prompt: PRIMARY SCENE + CHARACTER DESCRIPTION + CONSISTENCY + BRAND SUFFIX
  - Negative Prompt: Nuclear negative with cultural protection
    ↓
Final Image URL
```

---

## TIER SYSTEM OVERVIEW

### Tier 1 (Direct Mode + AI Scene)
1. **ai-visual-scene-creator** generates complete visual schema via OpenAI
2. **runware-template-ab** builds COMPLETE_TIER_1_TEMPLATE with character consistency
3. Includes: Primary scene, character seed, secondary characters, colored objects, setting context, style framework

### Tier 2.5A (Template + Character Consistency)
1. **runware-template-ab** builds template with character consistency service
2. No AI scene generation, uses raw story text + character data + style framework
3. Includes: Character seed, secondary characters, colored objects, style framework

### Tier 2.5C (Template + Style Framework)
1. **runware-template-cd** uses simple template
2. Story text + style framework only
3. No character consistency features

### Tier 2.5D (Emergency Fallback)
1. **runware-template-cd** uses hardcoded emergency template
2. Generic child + style framework
3. Maximum reliability, minimal features

---

## TESTING EXAMPLES

### Test Case: Emma (Light Skin, English Speaker)

**Input**:
```javascript
userInfo = {
  name: 'Emma',
  avatar: {
    skinTone: 'light',
    type: 'girl'
  },
  nativeLanguage: 'en'
}
sessionId = 'test-session-123'
```

**Expected Output**:
```javascript
structuredAvatarData = {
  resolvedSkinTone: 'light',
  assignedHairColor: 'honey blonde hair',  // Session-seeded from 15 light variations
  skinFeatures: 'light skin complexion with bright blue eyes and soft features',
  ethnicity: 'Euro-American',
  source: 'character_service_generation'
}
```

**Character Data String**:
```
Emma, honey blonde hair, light skin complexion with bright blue eyes and soft features, Euro-American ethnicity
```

### Test Case: Jamal (Dark Skin, English Speaker)

**Input**:
```javascript
userInfo = {
  name: 'Jamal',
  avatar: {
    skinTone: 'dark',
    type: 'boy'
  },
  nativeLanguage: 'en'
}
sessionId = 'test-session-456'
```

**Expected Output**:
```javascript
structuredAvatarData = {
  resolvedSkinTone: 'dark',
  assignedHairColor: 'wearing a curly top fade with perfectly defined coils on top',
  skinFeatures: 'caramel skin tone with deep chocolate eyes and a confident cheerful expression',
  ethnicity: 'african-american',
  source: 'character_service_generation'
}
```

**Character Data String**:
```
Jamal, wearing a curly top fade with perfectly defined coils on top, caramel skin tone with deep chocolate eyes and a confident cheerful expression, african-american ethnicity
```

---

## MAINTENANCE NOTES

**Critical Files**:
- `supabase/functions/ai-visual-scene-creator/index.ts` - OpenAI prompts
- `supabase/functions/_shared/CharacterConsistencyService.js` - Character data generation
- `supabase/functions/runware-template-ab/index.js` - Tier 1 & 2.5A templates
- `supabase/functions/runware-template-cd/index.js` - Tier 2.5C & 2.5D templates
- `supabase/functions/_shared/NuclearNegativePrompts.js` - Negative prompts

**Update Protocol**:
1. Any prompt changes must be documented here immediately
2. Version control: Document date and reason for changes
3. Test all tiers after prompt modifications
4. Verify character consistency across sessions

**Last Updated**: 2025-10-01  
**Version**: 1.0.0  
**Status**: Production
