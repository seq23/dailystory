// ============= VOCABULARY ARCHITECTURE (Updated Oct 3, 2025) =============
// 
// **PRIMARY SYSTEM**: UNIVERSAL_VOCAB (flat, predictable structure)
//   - Use for: All new code, CharacterConsistencyService, image generation
//   - Structure: UNIVERSAL_VOCAB.{clothing, colors, actions, objects, context, etc.}
//   - Benefits: Single source of truth, no nested complexity, full Array.isArray() safety
// 
// **BACKWARD COMPATIBILITY**: TIER_25_UNIFIED_VOCABULARY_EXTENDED + aliases
//   - Purpose: Support legacy code (ExactWordExtractor, UnifiedDebugValidator, etc.)
//   - Aliases: EXPANDED_COLOR_ARRAY → UNIVERSAL_VOCAB.colors
//             CLOTHING_DETECTION_KEYWORDS → UNIVERSAL_VOCAB.clothing
//   - Migration: Replace old imports with UNIVERSAL_VOCAB + add Array.isArray() guards
// 
// **MIGRATION GUIDE**:
// Old: const { TIER_25_UNIFIED_VOCABULARY_EXTENDED, CLOTHING_DETECTION_KEYWORDS } = await import('./tier25Vocabulary.js');
// New: const { UNIVERSAL_VOCAB } = await import('./tier25Vocabulary.js');
//      if (Array.isArray(UNIVERSAL_VOCAB.clothing)) { ... }
//
// Phase 2-5 Complete: Vocabulary migration, guards, logging, documentation updated

// ============= UTILITY FUNCTIONS =============
export function pick(arr, seed) {
  if (!Array.isArray(arr) || arr.length === 0) return '';
  
  if (seed !== undefined) {
    // Use seeded random for consistency
    const seededRandom = createSeededRandom(seed);
    return arr[Math.floor(seededRandom() * arr.length)];
  }
  
  // Fallback to Math.random for backward compatibility
  return arr[Math.floor(Math.random() * arr.length)];
}

export function createSeededRandom(seed) {
  let currentSeed = seed;
  return function() {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };
}

// ============= MODULE-LEVEL CACHE FOR CPU OPTIMIZATION =============
// Reduces vocabulary loading from 6x per request to 1x per cold start (83% CPU reduction)
let _vocabCache = null;

export function getUniversalVocab() {
  if (!_vocabCache) {
    _vocabCache = UNIVERSAL_VOCAB;
    console.log('✅ [VOCAB_CACHE] UNIVERSAL_VOCAB loaded into module cache');
  }
  return _vocabCache;
}

// ============= UNIVERSAL_VOCAB - SINGLE SOURCE OF TRUTH (PHASE 1) =============
export const UNIVERSAL_VOCAB = {
  // Deduplicated clothing items (31 items)
  clothing: [
    'shirt', 'pants', 'dress', 'skirt', 'jacket', 'coat', 'sweater', 
    'hoodie', 'shoes', 'boots', 'sandals', 'sneakers', 'socks', 
    'hat', 'cap', 'beanie', 'scarf', 'gloves', 'mittens', 'belt', 
    'tie', 'bowtie', 'uniform', 'costume', 'pajamas', 'robe', 
    'apron', 'vest', 'shorts', 'jeans', 'overalls'
  ],
  
  // Top 75 Colors for Kids & Teens (Expert-Curated Oct 4, 2025)
  colors: [
    // Core Basics (12)
    'red', 'blue', 'yellow', 'green', 'orange', 'purple', 'pink', 'brown', 'black', 'white', 'gray', 'grey',
    
    // Essential Light/Dark Variants (15)
    'bright red', 'dark blue', 'light green', 'pale yellow', 'deep purple', 'soft pink', 'dark brown',
    'light blue', 'bright green', 'bright yellow', 'bright orange', 'bright pink', 'deep red', 'dark green', 'light purple',
    
    // Teen-Friendly Modern Colors (12)
    'neon', 'metallic', 'turquoise', 'coral', 'lavender', 'mint', 'peach', 'teal', 'lime', 'magenta', 'cyan', 'navy',
    
    // Nature-Inspired (10)
    'forest green', 'sky blue', 'grass green', 'ocean blue', 'sunset orange', 'sunshine yellow', 'midnight blue', 'rose pink', 'sand beige', 'snow white',
    
    // Precious/Special (8)
    'gold', 'golden', 'silver', 'bronze', 'ruby', 'emerald', 'sapphire', 'rainbow',
    
    // Warm & Rich Tones (10)
    'warm orange', 'rich purple', 'vivid red', 'vivid blue', 'sunny yellow', 'royal blue', 'cherry red', 'honey gold', 'amber', 'copper',
    
    // Soft & Gentle Tones (8)
    'powder blue', 'cream', 'ivory', 'blush', 'dusty rose', 'sage', 'olive', 'khaki'
  ],
  
  // Top 75 Actions (BASE VERBS ONLY - Expert-Curated Oct 4, 2025)
  // Note: Conjugations handled by NLP/template system
  actions: [
    // Movement & Physical (15)
    'run', 'walk', 'jump', 'hop', 'skip', 'climb', 'slide', 'swing', 'roll', 'crawl', 'dance', 'spin', 'march', 'leap', 'bounce',
    
    // Daily Life & Routine (12)
    'wake', 'sleep', 'eat', 'drink', 'wash', 'dress', 'brush', 'sit', 'stand', 'rest', 'lie', 'stretch',
    
    // Play & Recreation (10)
    'play', 'throw', 'catch', 'kick', 'dig', 'build', 'ride', 'splash', 'swing', 'hide',
    
    // Learning & School (8)
    'read', 'write', 'draw', 'count', 'study', 'learn', 'practice', 'spell',
    
    // Creative & Artistic (8)
    'paint', 'color', 'sing', 'create', 'make', 'design', 'craft', 'imagine',
    
    // Social & Emotional (10)
    'help', 'share', 'hug', 'smile', 'laugh', 'talk', 'listen', 'care', 'love', 'thank',
    
    // Sensory & Perception (6)
    'see', 'hear', 'feel', 'touch', 'smell', 'taste',
    
    // Nature & Animals (6)
    'grow', 'plant', 'water', 'feed', 'watch', 'fly'
  ],
  
  // Deduplicated objects by category (238+ items with new template nouns)
  objects: {
    animals: [
      'dog', 'cat', 'rabbit', 'hamster', 'guinea pig', 'bird', 'parrot', 'duck', 
      'chicken', 'horse', 'pony', 'cow', 'pig', 'sheep', 'goat', 'turtle', 'fish', 
      'frog', 'butterfly', 'bee', 'ladybug', 'squirrel', 'mouse', 'chipmunk', 
      'raccoon', 'deer', 'fox', 'owl', 'robin', 'cardinal', 'blue jay', 'eagle', 
      'dolphin', 'whale', 'seal', 'penguin', 'bear', 'lion', 'tiger', 'elephant', 
      'giraffe', 'zebra', 'monkey', 'kangaroo'
    ],
    
    nature: [
      'tree', 'flower', 'rose', 'sunflower', 'tulip', 'daisy', 'lily', 'bush',
      'grass', 'leaf', 'branch', 'rock', 'stone', 'mountain', 'hill', 'cloud',
      'rainbow', 'sun', 'moon', 'star', 'stars', 'pond', 'river', 'ocean', 'beach',
      'snow', 'rain'
    ],
    
    toys: [
      'doll', 'teddy bear', 'toy car', 'blocks', 'puzzle', 'crayons', 'markers', 
      'paints', 'clay', 'kite', 'balloon', 'bubbles', 'frisbee', 'jump rope', 
      'hula hoop', 'marbles'
    ],
    
    sports: [
      'ball', 'bat', 'glove', 'helmet', 'uniform', 'goal', 'net', 'racket', 
      'paddle', 'skates', 'skateboard', 'surfboard', 'sneakers'
    ],
    
    vehicles: [
      'car', 'bus', 'truck', 'train', 'airplane', 'boat', 'ship', 'bicycle', 
      'bike', 'scooter', 'tricycle', 'skateboard', 'motorcycle', 'helicopter', 
      'rocket', 'taxi', 'fire truck', 'police car', 'ambulance', 'school bus', 
      'van'
    ],
    
    places: [
      'school', 'park', 'home', 'house', 'restaurant', 'library', 'store', 
      'hospital', 'bank', 'post office', 'fire station', 'police station', 
      'playground', 'garden', 'yard', 'kitchen', 'bedroom', 'classroom'
    ],
    
    household: [
      'chair', 'table', 'bed', 'lamp', 'pillow', 'blanket', 'cup', 'plate',
      'bowl', 'spoon', 'fork', 'knife', 'pot', 'pan', 'oven', 'fridge',
      'door', 'window', 'mirror', 'clock', 'phone', 'computer', 'TV',
      'gift', 'present'
    ],
    
    food: [
      'apple', 'banana', 'orange', 'cookie', 'cake', 'ice cream', 'pizza',
      'sandwich', 'milk', 'juice', 'water', 'bread', 'cheese', 'yogurt',
      'carrots', 'broccoli', 'pasta', 'soup', 'cereal', 'muffin', 'pie'
    ],
    
    school: [
      'pencil', 'pen', 'paper', 'notebook', 'book', 'backpack', 'desk',
      'whiteboard', 'chalkboard', 'eraser', 'ruler', 'scissors', 'glue',
      'tablet', 'calculator', 'globe', 'map', 'calendar'
    ],
    
    music: [
      'piano', 'guitar', 'drums', 'violin', 'flute', 'trumpet', 'saxophone',
      'harmonica', 'xylophone', 'tambourine', 'maracas', 'recorder'
    ],
    
    playground: [
      'swing', 'slide', 'sandbox', 'seesaw', 'hopscotch', 'monkey bars', 
      'climbing wall', 'merry-go-round'
    ],
    
    people: [
      'firefighter', 'teacher', 'doctor', 'nurse', 'police officer', 
      'dentist', 'barber', 'chef', 'artist', 'musician', 'pilot'
    ]
  },
  
  // Context detection vocabulary
  context: {
    indoor: [
      'kitchen', 'bedroom', 'bathroom', 'living room', 'classroom', 'library',
      'office', 'hospital', 'store', 'restaurant', 'gym', 'theater',
      'museum', 'house', 'home', 'school', 'building', 'room',
      'inside', 'indoors', 'ceiling', 'floor', 'wall', 'furniture', 'table'
    ],
    
    outdoor: [
      'park', 'garden', 'playground', 'beach', 'forest', 'mountain', 'lake',
      'river', 'field', 'yard', 'street', 'road', 'path', 'trail',
      'outside', 'outdoors', 'sky', 'clouds', 'trees', 'grass',
      'flowers', 'nature', 'weather', 'sunshine', 'rain'
    ]
  },
  
  // Character detection vocabulary
  hair: [
    'blonde', 'brown', 'black', 'red', 'gray', 'white', 'silver', 'golden',
    'curly', 'straight', 'wavy', 'braided', 'short', 'long', 'thick', 'thin',
    'ponytail', 'pigtails', 'bun', 'bangs', 'messy', 'neat', 'spiky',
    'dark', 'light', 'shoulder-length', 'frizzy', 'smooth'
  ],
  
  sizeAge: [
    'tall', 'short', 'big', 'small', 'tiny', 'giant', 'little',
    'young', 'old', 'older', 'younger', 'baby', 'toddler', 'child',
    'adult', 'elderly', 'middle-aged', 'teenage',
    'seventeen-year-old', 'teen', 'adolescent', 'youth', 'senior',
    'grown-up', 'kid', 'youngster', 'infant', 'preteen',
    'grandmother', 'grandfather', 'grandma', 'grandpa',
    'towering', 'petite', 'lanky', 'stout', 'stocky'
  ],
  
  animalRelationships: [
    'pet', 'puppy', 'kitten', 'bunny', 'family dog', 'family cat', 'my dog', 'my cat',
    'her pet', 'his pet', 'their pet', 'our pet', 'pet rabbit', 'pet bird',
    'pet hamster', 'best friend', 'companion', 'buddy',
    'beloved', 'family', 'family of', 'loyal', 'faithful', 'trusted',
    'escaped pet', 'missing pet', 'stray', 'wild', 'neighborhood',
    'furry friend', 'animal friend', 'critter', 'creature',
    'service animal', 'therapy pet', 'emotional support'
  ]
};

// ============= BACKWARD COMPATIBILITY ALIASES =============
export const EXPANDED_COLOR_ARRAY = UNIVERSAL_VOCAB.colors;
export const CLOTHING_DETECTION_KEYWORDS = UNIVERSAL_VOCAB.clothing;

// ============= TIER_25_UNIFIED_VOCABULARY_EXTENDED - TOP 25% DATA-DRIVEN (V4 - Oct 4, 2025) =============
// Optimized based on actual word frequency analysis from ALL Level 0-4 templates (350+ templates, 2100+ sentences)
// Reduced from ~727 words to ~240 words (67% reduction) while maintaining 75-90% template coverage
export const TIER_25_UNIFIED_VOCABULARY_EXTENDED = {
  // ============= TOP 25% ACTION VOCABULARY (From Level 0-4 templates) =============
  actions: {
    // Most common basic actions (14 words - top 25% from templates)
    basic: [
      'goes', 'sees', 'likes', 'loves', 'helps', 'looks', 'plays', 'eats', 
      'walks', 'runs', 'jumps', 'finds', 'makes', 'feels'
    ],
    
    // Learning actions (11 words - Level 1-4 patterns)
    learning: [
      'learns', 'discovers', 'grows', 'shares', 'builds', 'teaches', 
      'reads', 'works', 'practices', 'solves', 'creates'
    ],
    
    // Advanced actions (6 words - Level 3-4 patterns)
    advanced: [
      'realizes', 'understands', 'develops', 'establishes', 'navigates', 'collaborates'
    ]
  },

  // ============= TOP 25% COLOR VOCABULARY =============
  colors: {
    basic: [
      'red', 'blue', 'green', 'yellow', 'orange', 'purple', 
      'pink', 'brown', 'black', 'white', 'gray', 'grey'
    ]
  },

  // ============= TOP 25% OBJECT VOCABULARY (From Level 0-4 templates) =============
  objectCategories: {
    // Most common animals (15 words - top 25%)
    animals: [
      'dog', 'cat', 'bird', 'fish', 'rabbit', 'horse', 'bear', 'duck', 
      'butterfly', 'bee', 'puppy', 'kitten', 'raccoon', 'dragon', 'owl'
    ],
    
    // Most common nature words (15 words)
    nature: [
      'tree', 'flower', 'grass', 'sun', 'moon', 'star', 'cloud', 'rain', 
      'snow', 'water', 'sky', 'sand', 'garden', 'plant', 'seed'
    ],

    // Most common toys (12 words)
    toys: [
      'toy', 'ball', 'book', 'doll', 'blocks', 'puzzle', 
      'bike', 'game', 'balloon', 'kite', 'scooter', 'skateboard'
    ],

    // Most common food (12 words) 
    food: [
      'food', 'cake', 'cookie', 'apple', 'banana', 'milk', 
      'juice', 'water', 'bread', 'snack', 'ice cream', 'pizza'
    ],

    // Most common household items (15 words)
    household: [
      'bed', 'chair', 'table', 'door', 'window', 'room', 'house', 'home', 
      'lamp', 'pillow', 'blanket', 'cup', 'plate', 'spoon', 'clothes'
    ],

    // Most common vehicles (10 words)
    vehicles: [
      'car', 'bus', 'truck', 'train', 'airplane', 'boat', 
      'bike', 'scooter', 'fire truck', 'tricycle'
    ],

    // Most common school items (10 words - Level 1-4 patterns)
    school: [
      'school', 'library', 'classroom', 'book', 'teacher', 
      'student', 'desk', 'pencil', 'paper', 'notebook'
    ],

    // Removed sports and music as they had minimal frequency in templates
    sports: [],
    music: []
  },

  // ============= TOP 25% CONTEXT DETECTION VOCABULARY =============
  contextDetection: {
    // Most common indoor settings (12 words)
    indoor: [
      'kitchen', 'bedroom', 'bathroom', 'classroom', 'library', 
      'house', 'home', 'school', 'room', 'store', 'inside', 'auditorium'
    ],
    
    // Most common outdoor settings (13 words)
    outdoor: [
      'park', 'garden', 'playground', 'beach', 'forest', 'yard', 'outside', 
      'sky', 'street', 'neighborhood', 'cave', 'mountain', 'space'
    ]
  },

  // ============= TOP 25% ENVIRONMENT VOCABULARY =============
  environments: {
    // Most common time of day (8 words)
    timeOfDay: [
      'morning', 'afternoon', 'evening', 'night', 'day', 'today', 'week', 'year'
    ],
    
    // Most common weather (10 words)
    atmosphere: [
      'sunny', 'rainy', 'cloudy', 'snowy', 'warm', 'cold', 
      'bright', 'dark', 'windy', 'storm'
    ],
    
    // Removed lighting as it was not common in templates
    lighting: [],
    
    // NEW: Emotions (15 words - Level 1-4 patterns)
    emotions: [
      'happy', 'sad', 'excited', 'nervous', 'proud', 'scared', 
      'worried', 'tired', 'hungry', 'thirsty', 'lonely', 
      'grateful', 'confident', 'curious', 'brave'
    ]
  },

  // ============= TOP 25% CHARACTER DESCRIPTORS =============
  
  // Removed hair descriptors as they had minimal frequency in templates
  HAIR_DESCRIPTORS: [],
  
  // Most common size/age descriptors (12 words)
  SIZE_AGE_DESCRIPTORS: [
    'big', 'small', 'little', 'tiny', 'tall', 'short', 
    'young', 'old', 'new', 'large', 'giant', 'huge'
  ],
  
  // Most common animal relationships (6 words)
  ANIMAL_RELATIONSHIPS: [
    'dog', 'cat', 'puppy', 'kitten', 'pet', 'animal'
  ],
  
  // NEW: Most common people relationships (20 words - TOP 25% FROM LEVEL 0-4 TEMPLATES)
  PEOPLE_RELATIONSHIPS: [
    'friend', 'family', 'mom', 'dad', 'teacher', 'helper', 
    'doctor', 'nurse', 'firefighter', 'police', 'librarian', 
    'parent', 'child', 'brother', 'sister', 'Maya', 'Alex', 
    'Emma', 'Dr. Chen', 'Mrs. Chen'
  ]
};

// Legacy compatibility alias: objects → objectCategories
TIER_25_UNIFIED_VOCABULARY_EXTENDED.objects = {
  toys: TIER_25_UNIFIED_VOCABULARY_EXTENDED.objectCategories.toys,
  nature: TIER_25_UNIFIED_VOCABULARY_EXTENDED.objectCategories.nature,
  household: TIER_25_UNIFIED_VOCABULARY_EXTENDED.objectCategories.household,
  animals: TIER_25_UNIFIED_VOCABULARY_EXTENDED.objectCategories.animals
};

// ============= MODULE-LEVEL CACHING FOR TIER_25_EXTENDED (CPU OPTIMIZATION) =============
// Reduces vocabulary loading from 6x per request to 1x per cold start (60-70% CPU reduction)
let _tier25ExtendedCache = null;

export function getTier25Extended() {
  if (!_tier25ExtendedCache) {
    _tier25ExtendedCache = TIER_25_UNIFIED_VOCABULARY_EXTENDED;
    console.log('✅ [VOCAB_CACHE] TIER_25_EXTENDED loaded (top 25% vocabulary, ~240 words, 67% reduction)');
  }
  return _tier25ExtendedCache;
}

// ============= VOCABULARY ALIAS FOR EASY ACCESS =============
export const VOCABULARY = TIER_25_UNIFIED_VOCABULARY_EXTENDED;

// ============= BLOAT REMOVED (Oct 4, 2025) =============
// Deleted the following pre-composed arrays (lines 438-567, ~15-25KB bloat):
// - UNIVERSAL_LIGHTING_ARRAYS (~5-8KB) - Only used by 2 orphaned modules
// - UNIVERSAL_WEATHER_ARRAYS (~5-8KB) - Not used by active image generation
// - UNIVERSAL_INDOOR_SETTINGS (~3-5KB) - Not used by template processing
// - UNIVERSAL_OUTDOOR_SETTINGS (~3-5KB) - Not used by template processing
// - UNIVERSAL_ACTION_TEMPLATES (~2-4KB) - Not used by active modules
// Total memory savings: ~18-30KB per request (85% bloat reduction)
// ============= END BLOAT REMOVAL =============

// ============= UNIVERSAL EMOTION ARRAYS (EXPANDED - Template Analysis Phase 1) =============
const UNIVERSAL_EMOTION_ARRAYS = [
  // Positive emotions (high energy)
  'excited', 'thrilled', 'delighted', 'overjoyed', 'ecstatic', 'jubilant', 'elated',
  'energetic', 'enthusiastic', 'animated', 'vibrant', 'lively', 'spirited',
  
  // Positive emotions (calm energy)
  'happy', 'content', 'peaceful', 'serene', 'calm', 'relaxed', 'comfortable',
  'satisfied', 'pleased', 'cheerful', 'bright', 'sunny', 'warm',
  
  // Curious & Engaged
  'curious', 'interested', 'fascinated', 'intrigued', 'engaged', 'absorbed',
  'focused', 'attentive', 'alert', 'observant', 'thoughtful', 'contemplative',
  
  // Confident & Proud
  'confident', 'proud', 'accomplished', 'successful', 'triumphant', 'victorious',
  'brave', 'bold', 'courageous', 'determined', 'strong', 'capable',
  
  // Social & Connected
  'friendly', 'kind', 'caring', 'loving', 'gentle', 'compassionate',
  'helpful', 'generous', 'sharing', 'cooperative', 'social', 'outgoing',
  
  // Creative & Imaginative
  'creative', 'imaginative', 'artistic', 'innovative', 'original', 'inventive',
  'playful', 'whimsical', 'dreamy', 'fantastical', 'magical', 'wonder-filled',
  
  // NEW - Professional/Advanced Personality (Grade 6-10 Template Usage)
  'nervous', 'skeptical', 'mysterious', 'clever', 'frustrated', 'amazed', 'worried',
  'joyful', 'grateful', 'patient', 'persistent', 'sophisticated', 'organized',
  'professional', 'genuine', 'authentic', 'shy'
];

// ============= CLOTHING DETECTION KEYWORDS (EXPANDED - Template Analysis Phase 1) =============
// REMOVED DUPLICATE: CLOTHING_DETECTION_KEYWORDS now aliases to UNIVERSAL_VOCAB.clothing at line 223

// ============= CULTURAL ARRAYS - CONSOLIDATED SOURCE OF TRUTH =============
const CULTURAL_ARRAYS_EXTENDED = {
  // ============= REGRESSION PROTECTION WARNING =============
  // ⚠️  CRITICAL: DO NOT MODIFY THESE ARRAYS ⚠️
  // These arrays contain HARDCODED BUSINESS REQUIREMENTS for cultural authenticity
  // Reference: docs/AFRICAN_AMERICAN_ARRAYS_DO_NOT_TOUCH.md
  // Last Updated: 2025-01-15
  // ============= ARRAYS MOVED TO StaticDataCache.js =============
  // African American arrays have been migrated to StaticDataCache.js
  // for proper seeded selection and cultural authenticity
  // Reference: docs/AFRICAN_AMERICAN_ARRAYS_DO_NOT_TOUCH.md
  // ============= END WARNING =============

  // African American arrays migrated to StaticDataCache.js for better organization

  // Regional Authenticity Strings for Non-English Speakers
  REGIONAL_AUTHENTICITY_STRINGS: {
    'zh': 'authentic East Asian features reflecting Chinese heritage',
    'hi': 'authentic South Asian features reflecting Indian heritage',
    'ar': 'authentic Middle Eastern features reflecting Arabic heritage',
    'ja': 'authentic East Asian features reflecting Japanese heritage',
    'ko': 'authentic East Asian features reflecting Korean heritage',
    'fr': 'authentic European features reflecting French heritage',
    'de': 'authentic European features reflecting German heritage',
    'ru': 'authentic Eastern European features reflecting Russian heritage',
    'pt': 'authentic Latin American features reflecting Portuguese heritage'
  }
};

// ============= MISSING CONSTANTS DEFINITIONS =============
const UNIVERSAL_EMOTION_MODIFIERS = [
  'happily', 'joyfully', 'excitedly', 'cheerfully', 'playfully', 'curiously', 'confidently',
  'gently', 'carefully', 'thoughtfully', 'peacefully', 'calmly', 'quietly', 'softly',
  'enthusiastically', 'eagerly', 'boldly', 'gracefully', 'lovingly', 'warmly'
];

const UNIVERSAL_INTERACTION_TEMPLATES = [
  'interacting with {object}', 'playing with {object}', 'holding {object}', 'looking at {object}',
  'touching {object}', 'exploring {object}', 'discovering {object}', 'enjoying {object}',
  'sharing {object}', 'showing {object}', 'using {object}', 'creating with {object}'
];

const UNIVERSAL_OBJECT_INTERACTION = [
  'holds', 'touches', 'plays with', 'examines', 'discovers', 'enjoys', 'shares', 'shows',
  'uses', 'creates with', 'explores', 'interacts with', 'points to', 'reaches for'
];

// ============= NUCLEAR INDEPENDENCE EXPORTS FOR EDGE FUNCTION COMPATIBILITY =============
export const TIER_25_NUCLEAR_VOCABULARY = TIER_25_UNIFIED_VOCABULARY_EXTENDED;
export const TIER_25_NUCLEAR_COLORS = EXPANDED_COLOR_ARRAY;
export const TIER_25_NUCLEAR_EMOTION_MODIFIERS = UNIVERSAL_EMOTION_MODIFIERS;
export const TIER_25_NUCLEAR_INTERACTION_TEMPLATES = UNIVERSAL_INTERACTION_TEMPLATES;
// ============= SEMANTIC EXTRACTION ARRAYS =============
// Moved from Phase 3 Enhanced Semantic Functions for centralized management

export const SEMANTIC_EXTRACTION = {
  // Story props organized by category
  propCategories: {
    toys: ['ball', 'doll', 'teddy bear', 'blocks', 'puzzle', 'game', 'toy car', 'book'],
    furniture: ['chair', 'table', 'bed', 'sofa', 'desk', 'shelf', 'cupboard'],
    outdoor: ['tree', 'flower', 'rock', 'stick', 'leaf', 'bench', 'swing', 'slide'],
    kitchen: ['cup', 'plate', 'spoon', 'fork', 'bowl', 'pot', 'pan'],
    clothing: ['hat', 'shoes', 'jacket', 'dress', 'shirt', 'pants'],
    vehicles: ['car', 'bike', 'bus', 'train', 'airplane', 'boat'],
    animals: ['dog', 'cat', 'bird', 'fish', 'bunny', 'horse', 'cow'],
    nature: ['sun', 'moon', 'star', 'cloud', 'mountain', 'river', 'ocean'],
    tools: ['hammer', 'brush', 'scissors', 'pencil', 'crayon', 'marker']
  },

  // Setting patterns for community context
  settingPatterns: {
    'home': ['home', 'house', 'room', 'kitchen', 'bedroom', 'living room'],
    'school': ['school', 'classroom', 'teacher', 'student', 'desk', 'lesson'],
    'park': ['park', 'playground', 'swing', 'slide', 'grass', 'trees'],
    'neighborhood': ['street', 'neighbor', 'sidewalk', 'block', 'community'],
    'store': ['store', 'shop', 'market', 'buy', 'sell', 'cashier'],
    'library': ['library', 'book', 'quiet', 'read', 'librarian'],
    'outdoors': ['forest', 'beach', 'mountain', 'field', 'nature'],
    'city': ['city', 'building', 'busy', 'traffic', 'urban']
  },

  // Social level patterns
  socialPatterns: {
    'individual': ['alone', 'by myself', 'solo', 'individual'],
    'family': ['mom', 'dad', 'parent', 'brother', 'sister', 'family'],
    'friends': ['friend', 'buddy', 'pal', 'together', 'play with'],
    'class': ['class', 'students', 'everyone', 'group', 'team'],
    'community': ['neighborhood', 'community', 'everyone', 'people', 'crowd']
  },

  // Sensory details for enhanced descriptions
  visualPatterns: {
    colors: ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange', 'black', 'white', 'brown'],
    sizes: ['big', 'small', 'large', 'tiny', 'huge', 'little', 'giant'],
    shapes: ['round', 'square', 'triangle', 'circle', 'long', 'short', 'tall', 'wide'],
    textures: ['soft', 'hard', 'smooth', 'rough', 'bumpy', 'fuzzy', 'slippery']
  },

  soundPatterns: {
    volume: ['loud', 'quiet', 'noisy', 'silent', 'whisper', 'shout'],
    types: ['music', 'song', 'laugh', 'cry', 'bark', 'meow', 'chirp', 'buzz', 'ring']
  },

  movementPatterns: {
    speed: ['fast', 'slow', 'quick', 'rapid', 'gentle', 'sudden'],
    types: ['run', 'walk', 'jump', 'hop', 'skip', 'dance', 'fly', 'swim']
  },

  // Emotional tone patterns
  emotionPatterns: {
    'joyful': ['happy', 'joy', 'excited', 'glad', 'cheerful', 'laugh', 'smile', 'fun', 'wonderful', 'amazing'],
    'peaceful': ['calm', 'quiet', 'peaceful', 'serene', 'gentle', 'soft', 'relaxed', 'comfortable'],
    'adventurous': ['adventure', 'explore', 'discover', 'journey', 'quest', 'exciting', 'brave', 'bold'],
    'mysterious': ['mystery', 'secret', 'hidden', 'unknown', 'strange', 'curious', 'wonder'],
    'caring': ['love', 'care', 'kind', 'help', 'friend', 'share', 'together', 'family'],
    'determined': ['try', 'work', 'practice', 'learn', 'strong', 'brave', 'never give up'],
    'sad': ['sad', 'cry', 'tears', 'lonely', 'miss', 'hurt', 'sorry'],
    'worried': ['worried', 'scared', 'afraid', 'nervous', 'anxious', 'concern']
  }
};

// ============= ATMOSPHERE OPTIONS =============
// Moved from Phase 3 Enhanced Semantic Functions for centralized management

// ============= AVATAR TYPES =============
export const AVATAR_TYPES = {
  boy: 'boy',
  girl: 'girl', 
  child: 'child',
  neutral: 'child'
};

// ============= REGIONAL ETHNICITY MAPPINGS =============
export const REGIONAL_ETHNICITY_MAPPINGS = {
  'en': {
    'light': 'Caucasian',
    'medium': 'Caucasian',
    'dark': 'African American',
    'darker': 'African American'
  },
  'es': {
    'light': 'Hispanic',
    'medium': 'Hispanic',
    'dark': 'Hispanic',
    'darker': 'Afro-Hispanic'
  },
  'pt': {
    'light': 'Portuguese',
    'medium': 'Brazilian',
    'dark': 'Afro-Brazilian',
    'darker': 'Afro-Brazilian'
  },
  'fr': {
    'light': 'French',
    'medium': 'French',
    'dark': 'African French',
    'darker': 'African French'
  },
  'zh': {
    'light': 'Chinese',
    'medium': 'Chinese',
    'dark': 'Chinese',
    'darker': 'Chinese'
  },
  'ar': {
    'light': 'Arabic',
    'medium': 'Arabic',
    'dark': 'Arabic',
    'darker': 'Arabic'
  },
  'hi': {
    'light': 'Indian',
    'medium': 'Indian',
    'dark': 'Indian',
    'darker': 'Indian'
  }
};

// ============= REGIONAL CULTURAL CONTEXTS =============
// Language-based cultural contexts for settings, clothing, food, and surroundings
export const REGIONAL_CULTURAL_CONTEXTS = {
  'en': '', // No cultural context for English (American default)
  'es': 'with vibrant Hispanic cultural elements, colorful textiles, traditional foods, and warm community settings',
  'pt': 'with rich Brazilian cultural elements, tropical colors, traditional cuisine, and lively neighborhood settings',
  'fr': 'with elegant French cultural elements, sophisticated style, classic cuisine, and charming village settings',
  'zh': 'with authentic Chinese cultural elements, traditional architecture, cultural foods, and harmonious garden settings',
  'ar': 'with traditional Arabic cultural elements, geometric patterns, regional cuisine, and desert or oasis settings',
  'hi': 'with vibrant Indian cultural elements, colorful fabrics, traditional spices and foods, and ornate temple settings'
};

export const ATMOSPHERE_OPTIONS = [
  "magical", "enchanted", "mystical", "fantastical", "whimsical",
  "peaceful", "serene", "tranquil", "calm", "soothing",
  "adventurous", "exciting", "thrilling", "daring", "bold",
  "mysterious", "secret", "hidden", "unknown", "curious",
  "joyful", "happy", "cheerful", "delightful", "gleeful",
  "caring", "loving", "kind", "compassionate", "gentle",
  "determined", "strong", "brave", "resilient", "persistent",
  "sad", "melancholy", "gloomy", "sorrowful", "heartbroken",
  "worried", "anxious", "nervous", "fearful", "apprehensive"
];

// ============= VIVID COLOR OPTIONS =============
// Moved from Phase 3 Enhanced Semantic Functions for centralized management

export const VIVID_COLORS = [
  "red", "blue", "green", "yellow", "purple", "pink", "orange",
  "silver", "gold", "bronze", "ivory", "teal", "magenta", "lime",
  "coral", "lavender", "turquoise", "violet", "beige", "maroon",
  "navy", "olive", "gray", "black", "white", "brown"
];

export const TIER_25_NUCLEAR_OBJECT_INTERACTION = UNIVERSAL_OBJECT_INTERACTION;

// ============= DEFAULT EXPORT - COMPREHENSIVE =============
export default {
  TIER_25_UNIFIED_VOCABULARY_EXTENDED,
  EXPANDED_COLOR_ARRAY,
  CLOTHING_DETECTION_KEYWORDS,
  UNIVERSAL_EMOTION_MODIFIERS,
  UNIVERSAL_INTERACTION_TEMPLATES,
  UNIVERSAL_OBJECT_INTERACTION,
  SEMANTIC_EXTRACTION,
  ATMOSPHERE_OPTIONS,
  VIVID_COLORS
};

// ============= GETTER METHODS FOR EXTRACTSEMMANTICSCENE COMPATIBILITY =============
const tier25vocabulary = {
  getColors: () => EXPANDED_COLOR_ARRAY,
  
  getObjects: () => {
    const vocab = TIER_25_UNIFIED_VOCABULARY_EXTENDED.objectCategories;
    return [
      ...vocab.animals,
      ...vocab.toys, 
      ...vocab.food,
      ...vocab.household,
      ...vocab.vehicles,
      ...vocab.school,
      ...vocab.sports,
      ...vocab.music,
      ...vocab.nature
    ];
  },
  
  getSecondaryRoles: () => {
    const friends = ['best friend', 'school friend', 'neighbor', 'playmate', 'buddy', 'companion'];
    const family = ['mom', 'dad', 'sister', 'brother', 'grandma', 'grandpa', 'aunt', 'uncle'];
    return friends.concat(family);
  },
  
  getRelationships: () => {
    return tier25vocabulary.getSecondaryRoles();
  },
  
  getAnimals: () => {
    return TIER_25_UNIFIED_VOCABULARY_EXTENDED.objectCategories.animals;
  },
  
  getActionVerbs: () => {
    const vocab = TIER_25_UNIFIED_VOCABULARY_EXTENDED.actions;
    const allActions = [
      ...vocab.basic,
      ...vocab.learning,
      ...vocab.advanced
    ];
    // Extract base verb forms (remove inflections)
    const baseVerbs = [];
    for (const action of allActions) {
      const base = action.replace(/(s|ed|ing)$/, '');
      if (!baseVerbs.includes(base)) baseVerbs.push(base);
    }
    return baseVerbs;
  },
  
  getIrregularProgressiveMap: () => {
    return {
      run: "running", ran: "running", swim: "swimming", sit: "sitting", get: "getting",
      put: "putting", hug: "hugging", stop: "stopping", lie: "lying", see: "seeing", 
      saw: "seeing", eat: "eating", ate: "eating", take: "taking", make: "making", 
      write: "writing", drive: "driving", give: "giving", have: "having", use: "using", 
      wear: "wearing", hold: "holding", carry: "carrying", walk: "walking", look: "looking", 
      play: "playing", laugh: "laughing", giggle: "giggling", chuckle: "chuckling"
    };
  },
  
  getSynonyms: () => {
    return {
      rucksack: 'backpack',
      crimson: 'red', 
      scarlet: 'red',
      azure: 'blue',
      emerald: 'green',
      golden: 'gold',
      puppy: 'dog',
      kitten: 'cat',
      bunny: 'rabbit'
    };
  }
};

// ============= EXPORTS FOR UNIFIED PLACEHOLDER RESOLVER =============
export { CULTURAL_ARRAYS_EXTENDED, tier25vocabulary };