// ============= TIER 2.5 NUCLEAR VOCABULARY SYSTEM =============
// See: docs/TIER_2_5_PREMIUM_TEMPLATES.md

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
