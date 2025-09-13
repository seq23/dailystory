// ============= TIER 2.5 VOCABULARY CONSOLIDATION =============
// Shared vocabulary constants for consistent story generation
// Used by: runware-simple-fallback, runware-template-advanced

// SEMANTIC EXTRACTION ARRAYS for narrative consistency
export const SEMANTIC_EXTRACTION = {
  // Emotion detection patterns
  EMOTIONS: {
    happy: ['happy', 'joy', 'smile', 'laugh', 'cheerful', 'excited', 'delighted'],
    sad: ['sad', 'cry', 'tear', 'upset', 'disappointed', 'gloomy'],
    scared: ['scared', 'afraid', 'frightened', 'nervous', 'worried', 'anxious'],
    angry: ['angry', 'mad', 'furious', 'upset', 'annoyed', 'frustrated'],
    surprised: ['surprised', 'amazed', 'shocked', 'astonished', 'wonder'],
    curious: ['curious', 'wonder', 'question', 'explore', 'investigate']
  },

  // Action detection patterns
  ACTIONS: {
    movement: ['run', 'walk', 'jump', 'fly', 'climb', 'crawl', 'dance', 'skip'],
    creative: ['draw', 'paint', 'build', 'create', 'make', 'craft', 'design'],
    social: ['talk', 'share', 'help', 'hug', 'play', 'laugh', 'sing'],
    learning: ['read', 'write', 'study', 'learn', 'think', 'remember']
  },

  // Setting detection patterns
  SETTINGS: {
    indoor: ['inside', 'room', 'house', 'home', 'kitchen', 'bedroom', 'classroom'],
    outdoor: ['outside', 'park', 'garden', 'playground', 'forest', 'beach', 'yard'],
    magical: ['castle', 'kingdom', 'enchanted', 'magical', 'fairy', 'dragon']
  },

  // Object detection patterns
  OBJECTS: {
    toys: ['toy', 'doll', 'ball', 'game', 'puzzle', 'blocks', 'truck'],
    nature: ['flower', 'tree', 'leaf', 'rock', 'butterfly', 'bird', 'sun'],
    books: ['book', 'story', 'journal', 'notebook', 'paper', 'pencil'],
    food: ['apple', 'cookie', 'cake', 'snack', 'lunch', 'dinner', 'fruit']
  },

  // Color detection patterns
  COLORS: {
    primary: ['red', 'blue', 'yellow', 'green', 'orange', 'purple'],
    descriptive: ['bright', 'dark', 'light', 'colorful', 'rainbow', 'golden']
  },

  // Clothing detection patterns
  CLOTHING: {
    casual: ['shirt', 'pants', 'dress', 'shoes', 'socks', 'jacket'],
    formal: ['suit', 'tie', 'dress', 'uniform', 'costume'],
    seasonal: ['coat', 'hat', 'scarf', 'sandals', 'boots', 'swimsuit']
  }
};

// CULTURAL ARRAYS for character consistency
export const CULTURAL_ARRAYS = {
  HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES: {
    girls: [
      'natural afro hair', 'beautiful braided hair', 'stylish twist hairstyle', 'elegant cornrow hairstyle',
      'lovely natural curls', 'protective braided style', 'beautiful box braids', 'fashionable twist-out hair'
    ],
    boys: [
      'natural short afro', 'stylish fade haircut', 'neat natural hair', 'cool braided style',
      'trendy twist hairstyle', 'handsome natural curls', 'sharp lineup haircut', 'dapper natural hair'
    ]
  },
  HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES: [
    'with warm brown eyes and a bright smile', 'with expressive dark eyes and kind features',
    'with beautiful natural features and joyful expression', 'with bright eyes and confident smile',
    'with gentle features and radiant expression', 'with strong features and happy demeanor'
  ],
  HARDCODED_AFRICAN_AMERICAN_SKIN_TONES: [
    'rich ebony', 'warm mahogany', 'golden bronze', 'deep caramel', 'beautiful brown', 'radiant copper'
  ]
};

// UNIFIED VOCABULARY for consistent generation
export const TIER_25_UNIFIED_VOCABULARY = {
  actions: {
    basic: ['playing', 'running', 'jumping', 'walking', 'sitting', 'standing', 'looking', 'smiling'],
    creative: ['drawing', 'painting', 'building', 'creating', 'crafting', 'making', 'designing'],
    sensory: ['listening', 'watching', 'touching', 'smelling', 'tasting', 'feeling', 'sensing'],
    states: ['thinking', 'wondering', 'dreaming', 'imagining', 'remembering', 'learning'],
    fantasy: ['flying', 'floating', 'glowing', 'sparkling', 'shimmering', 'dancing'],
    social: ['talking', 'laughing', 'sharing', 'helping', 'caring', 'loving'],
    intensity: ['gently', 'carefully', 'excitedly', 'peacefully', 'energetically', 'boldly'],
    bodyLanguage: ['smiling brightly', 'standing tall', 'sitting cross-legged', 'arms spread wide', 'head tilted thoughtfully'],
    spatial: ['positioned in foreground', 'standing in center', 'sitting comfortably', 'moving forward confidently']
  },
  environments: {
    atmosphere: ['sunny', 'bright', 'warm', 'cheerful', 'peaceful', 'cozy', 'magical'],
    lighting: ['golden hour', 'soft lighting', 'natural light', 'warm glow', 'bright illumination'],
    weather: ['clear skies', 'gentle breeze', 'perfect weather', 'pleasant atmosphere']
  },
  objectCategories: {
    toys: ['toy', 'ball', 'doll', 'game', 'puzzle', 'blocks'],
    nature: ['flower', 'tree', 'leaf', 'rock', 'butterfly', 'bird'],
    books: ['book', 'story', 'journal', 'notebook', 'paper'],
    food: ['apple', 'snack', 'lunch', 'treat', 'cookie', 'fruit']
  },
  contextDetection: {
    indoor: ['inside', 'room', 'house', 'home', 'indoor', 'kitchen', 'bedroom'],
    outdoor: ['outside', 'park', 'garden', 'playground', 'outdoor', 'yard', 'field']
  }
};

// UNIVERSAL ARRAYS for fallback consistency
export const UNIVERSAL_EMOTION_ARRAYS = [
  'happy', 'excited', 'curious', 'peaceful', 'joyful', 'content', 'cheerful', 'proud',
  'amazed', 'delighted', 'grateful', 'confident', 'playful', 'wonder-filled', 'serene'
];

export const UNIVERSAL_INDOOR_SETTINGS = [
  'cozy library with warm lighting', 'bright classroom with colorful displays', 'warm kitchen with cooking aromas',
  'comfortable living room with soft furniture', 'cheerful reading corner with pillows', 'creative art studio with supplies'
];

export const UNIVERSAL_OUTDOOR_SETTINGS = [
  'sunny backyard garden with flowering bushes', 'peaceful neighborhood park with tall trees', 'busy playground with climbing equipment',
  'quiet forest clearing with dappled sunlight', 'open meadow field with wildflowers', 'sparkling pond with lily pads'
];

export const UNIVERSAL_LIGHTING_ARRAYS = [
  'with bright golden lighting', 'with warm afternoon sunlight', 'with cheerful morning rays',
  'with dazzling sunshine', 'with golden hour glow', 'with brilliant daylight'
];

// Backward compatibility VOCAB object
export const VOCAB = {
  TIER_25_UNIFIED_VOCABULARY,
  UNIVERSAL_EMOTION_ARRAYS,
  UNIVERSAL_INDOOR_SETTINGS,
  UNIVERSAL_OUTDOOR_SETTINGS,
  UNIVERSAL_LIGHTING_ARRAYS
};