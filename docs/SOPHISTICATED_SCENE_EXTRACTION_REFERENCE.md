# SOPHISTICATED SCENE EXTRACTION SYSTEM - TECHNICAL REFERENCE

## Overview
The Sophisticated Scene Extraction System is a hybrid approach implemented in Tier 2.5B that combines semantic analysis with advanced regex patterns to extract meaningful scene descriptions from story text.

## System Architecture

### Core Function: `extractSimpleScene(storyText)`
**Location**: `supabase/functions/runware-template-ab/index.js` (lines 309-620)  
**Purpose**: Extract action + object + location from story text with comprehensive coverage  
**Method**: Hybrid tokenization + semantic analysis + intelligent fallbacks

## Key Features

### 1. Enhanced Color Vocabulary (30+ Colors)
```javascript
const COLORS = [
  // Core colors
  "red", "blue", "green", "yellow", "purple", "pink", "orange",
  "brown", "black", "white", "gray", "grey", "gold", "silver",
  
  // Extended palette  
  "turquoise", "lavender", "burgundy", "teal", "beige", "maroon",
  "navy", "violet", "indigo", "cream", "ivory", "peach",
  "magenta", "cyan", "olive", "tan", "aqua"
];
```

**Shade Support**: Handles "light" and "dark" prefixes (e.g., "light blue dress", "dark green forest")

### 2. Progressive Verb Lemmatization
Transforms verbs to present continuous (-ing) form with irregular verb handling:

```javascript
const irregular = {
  run: "running", ran: "running",
  swim: "swimming", sit: "sitting", get: "getting",
  put: "putting", hug: "hugging", stop: "stopping",
  lie: "lying", see: "seeing", saw: "seeing",
  eat: "eating", ate: "eating", take: "taking",
  make: "making", write: "writing", drive: "driving",
  give: "giving", have: "having", use: "using",
  wear: "wearing", hold: "holding", carry: "carrying",
  walk: "walking", look: "looking", play: "playing"
};
```

**Example Transformations**:
- "Emma walked through the forest" → "walking through the forest"
- "She sat on the bench" → "sitting on the bench"
- "He ran quickly" → "running quickly"

### 3. Comprehensive Object Recognition
**KNOWN_OBJECTS Array (50+ Items)**:
```javascript
const KNOWN_OBJECTS = [
  // Toys & Items
  "ball", "backpack", "bag", "book", "lantern", "hat", "basket", 
  "flower", "map", "rope", "cloak", "compass", "bottle", "flashlight",
  "lunchbox", "scarf", "toy", "toys", "cookie", "apple", "food",
  
  // Clothing & Accessories  
  "dress", "shirt", "pants", "clothes", "shoes", "jacket", "coat",
  "sweater", "skirt", "blouse", "uniform", "outfit", "crown", 
  "necklace", "glasses", "watch", "belt", "gloves", "socks", 
  "boots", "sandals"
];
```

### 4. Multi-Sentence Processing
Processes multiple sentences and merges extracted elements:

```javascript
function extractHybrid(text) {
  const sentences = splitSentences(text);
  const merged = { action: null, setting: null, objects: [] };
  
  for (const sentence of sentences) {
    const part = extractSentenceHybrid(sentence);
    // Merge actions, settings, and objects across sentences
    if (!merged.action && part.action) merged.action = part.action;
    if (!merged.setting && part.setting) merged.setting = part.setting;
    // Deduplicate objects by head + colors
  }
  
  return merged;
}
```

### 5. Intelligent Tokenization & Noun Phrase Capture
**Features**:
- Smart tokenization with punctuation handling
- Noun phrase boundary detection using stop tokens
- Determiner removal ("a", "an", "the") from captured phrases
- Color extraction within noun phrases

**Example**:
```javascript
// Input: "Emma picked up the beautiful red dress"
// Tokens: ["Emma", "picked", "up", "the", "beautiful", "red", "dress"]  
// Captured: { phrase: "beautiful red dress", head: "dress", colors: ["red"] }
```

### 6. Evidence-Based Scene Assembly
Only returns scenes with supporting evidence from the text:

```javascript
const parts = [];
if (actionText) parts.push(actionText);           // "carrying"
if (objectText) parts.push(objectText);           // "blue dress"  
if (settingText) parts.push(`in the ${settingText}`); // "in the forest"

const scene = parts.join(' ').trim(); // "carrying blue dress in the forest"
```

### 7. Integrity-Safe Fallback System
**Fallback Hierarchy**:
1. **Extracted Evidence**: Use tokenization results if complete
2. **Red Ball Priority**: Special handling for explicit red ball mentions  
3. **Generic Ball**: Handle other ball colors/mentions
4. **Location + Action**: Combine only when both are present
5. **Empty Return**: No fabrication when insufficient evidence

**Example Fallbacks**:
```javascript
// Text: "playing with red ball in the park"
// Result: "playing with red ball in the park"

// Text: "Emma smiled"  
// Result: "" (no fabrication - insufficient evidence)
```

## Processing Flow

### Step 1: Normalization & Tokenization
- Clean text (smart quotes, extra spaces)
- Apply aliases (e.g., "emama" → "emma", "backback" → "backpack")
- Split into sentences and tokens

### Step 2: Hybrid Extraction
For each sentence:
- **Action Detection**: Find verbs with VERB_RE regex
- **Object Capture**: Extract noun phrases after verbs + color-object pairs
- **Setting Detection**: Find preposition + location patterns

### Step 3: Multi-Sentence Merge
- Combine actions, objects, settings from all sentences
- Deduplicate objects by head noun + color combination
- Preserve first occurrence of actions and settings

### Step 4: Scene Assembly  
- Transform action to progressive form (`toProgressive()`)
- Select primary object (first in list)
- Format with appropriate prepositions
- Return complete scene or empty string

## Integration Examples

### Basic Usage
```javascript
const scene = extractSimpleScene("Emma walked through the magical forest wearing her blue dress");
// Result: "walking through the magical forest wearing blue dress"
```

### Multi-Sentence Processing
```javascript  
const story = "Emma found a beautiful red ball. She picked it up carefully. Then she walked into the garden.";
const scene = extractSimpleScene(story);
// Result: "carrying red ball in the garden"
```

### Color-Object Recognition
```javascript
const scene = extractSimpleScene("She put on her turquoise jacket and grabbed the lavender backpack");
// Result: "wearing turquoise jacket carrying lavender backpack"
```

## Error Handling & Edge Cases

### Invalid Input
- `null`/`undefined` → returns `""`
- Non-string input → returns `""`
- Empty string → returns `""`

### Insufficient Evidence  
- No clear action → returns `""`
- Location without action → returns `""`
- Prevents hallucination of non-existent scene elements

### Complex Sentences
- Handles compound sentences with multiple clauses
- Preserves prepositions in action phrases ("walked through", "running across")
- Manages object relationships and possession

## Performance Characteristics

### Regex Patterns
- Compiled once with `mkRe()` helper
- Case-insensitive matching with word boundaries
- Optimized for common story patterns

### Memory Usage
- Local scoping of all arrays and constants
- No global state or persistent caches
- Garbage collection friendly

### Processing Speed
- Tokenization-based approach (faster than full parsing)
- Short-circuit evaluation in fallback chains
- Efficient regex compilation and reuse

## Debugging Features

### Console Logging
```javascript
console.log('🔍 Simple regex scene extraction from story text');
console.log(`✅ Simple scene extracted: "${scene}"`);
```

### Evidence Tracking
- Logs extracted actions, objects, and settings
- Shows tokenization results for debugging
- Provides fallback chain information

## Cultural Considerations

### Object Recognition
- Includes diverse clothing items and accessories  
- Supports various cultural objects and settings
- Neutral approach to personal items

### Language Patterns  
- Designed for English text processing
- Handles common storytelling patterns
- Supports various narrative styles

## Version History

### V3 Enhancements (2025-09-17)
- Expanded color vocabulary from 13 to 30+ colors
- Added comprehensive clothing/accessory recognition
- Implemented progressive verb lemmatization  
- Enhanced multi-sentence processing capabilities
- Added evidence-based integrity safeguards
- Improved tokenization with smart punctuation handling

## Integration Points

### Template System Integration
Used in **Tier 2.5B** via `{scene}` placeholder:
```javascript
// Template B format
"Narrative: {pageText}. Subject: {character}, {age}, {ethnicity}, {hairDescription}, {facialFeatures}. Action: {scene} Context: {cultural_context} {leftover_data}. Brand Suffix: {fullFrameworkPrompt},"
```

### Fallback Chain
- **Primary**: Semantic extraction in Tier 2.5A  
- **Secondary**: Sophisticated hybrid extraction in Tier 2.5B
- **Tertiary**: Basic text usage in Tier 2.5C
- **Emergency**: Hardcoded context in Tier 2.5D

This sophisticated system ensures rich, accurate scene descriptions while maintaining integrity and preventing hallucination of non-existent story elements.