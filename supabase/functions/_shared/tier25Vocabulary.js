// ============= TIER 2.5 UNIFIED VOCABULARY - NUCLEAR INDEPENDENCE =============
// Lazy-loaded vocabulary module for performance optimization
// Contains all large constant arrays to prevent cold-boot failures

// ============= CULTURAL ARRAYS - MOVED TO StaticDataCache.js =============
// African American arrays moved to StaticDataCache.js for centralized management
// This maintains backward compatibility while consolidating cultural data

// Import cultural selection function from StaticDataCache for compatibility
import { getCulturalBundle } from './StaticDataCache.js';

// Legacy CULTURAL_ARRAYS maintained for backward compatibility
export const CULTURAL_ARRAYS = {
  african: {
    // These arrays are now sourced from StaticDataCache.js
    // Maintained for existing function signatures
    hair: [], // Populated by getCulturalSelection()
    features: [] // Populated by getCulturalSelection()
  }
};

// ============= PLACEHOLDER POOLS =============
export const PLACEHOLDER_POOLS = {
  // Character placeholders
  animals: ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'fish', 'turtle', 'horse', 'cow', 'pig', 'sheep'],
  colors: ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white'],
  sizes: ['big', 'small', 'tiny', 'huge', 'large', 'little', 'giant', 'enormous'],
  
  // NEW: Clothing styles for character consistency
  clothingStyles: ['casual', 'colorful', 'comfortable', 'neat', 'playful', 'stylish', 'fun', 'vibrant'],
  
  // Story elements
  foods: [
    'apples', 'bananas', 'cookies', 'cake', 'pizza', 'ice cream', 'sandwiches', 'fruit',
    'vegetables', 'snacks', 'treats', 'candy', 'chocolate', 'juice', 'milk'
  ],
  
  settings: [
    'park', 'forest', 'beach', 'mountain', 'garden', 'playground', 'school', 'library',
    'zoo', 'farm', 'castle', 'spaceship', 'underwater kingdom', 'magical forest', 'village'
  ],
  
  activities: [
    'playing', 'exploring', 'discovering', 'learning', 'helping', 'sharing', 'creating',
    'building', 'dancing', 'singing', 'reading', 'drawing', 'painting', 'cooking'
  ],
  
  emotions: [
    'happy', 'excited', 'curious', 'brave', 'kind', 'friendly', 'cheerful', 'proud',
    'amazed', 'delighted', 'surprised', 'grateful', 'confident', 'adventurous'
  ],
  
  // Friends and family
  friends: [
    'best friend', 'school friend', 'neighbor', 'playmate', 'buddy', 'companion',
    'adventure partner', 'study buddy', 'teammate', 'classmate'
  ],
  
  family: [
    'mom', 'dad', 'sister', 'brother', 'grandma', 'grandpa', 'aunt', 'uncle',
    'cousin', 'family', 'parents', 'siblings', 'relatives'
  ],

  // NEW: Pattern arrays for character consistency detection
  coloredObjectPatterns: [
    /\b(red|blue|green|yellow|purple|pink|orange|black|white|brown|gray|grey|gold|silver)\s+(\w+)\b/gi,
    /\b(\w+)\s+(red|blue|green|yellow|purple|pink|orange|black|white|brown|gray|grey|gold|silver)\b/gi
  ],

  atmosphericPatterns: [
    /\b(bright|dark|sunny|cloudy|rainy|stormy|peaceful|calm|exciting|scary|magical|mysterious|cheerful|gloomy)\b/gi,
    /\b(sparkling|glowing|shimmering|twinkling|rustling|whispers|echoing|silence)\b/gi
  ],

  characterPatterns: [
    /\b(friend|buddy|pal|companion|classmate|teammate|neighbor|sibling|sister|brother|cousin)\b/gi,
    /\b([A-Z][a-z]+)\s+(said|says|asked|tells|told|replied|answered|whispered|shouted|called|smiled|laughed|ran|walked|jumped)\b/g,
    /\b(he|she|they)\s+(is|was|are|were|has|had|does|did|can|could|will|would|should|must)\b/gi
  ]
};

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

export function getCulturalSelection(culturalType, feature, seed) {
  // Route to StaticDataCache.js for cultural selections
  if (culturalType === 'african') {
    // Import and use StaticDataCache functions
    try {
      if (feature === 'hair') {
        const { getAfricanAmericanHair } = await import('./StaticDataCache.js');
        return getAfricanAmericanHair('boy', seed); // Default to boy, should be enhanced with gender
      }
      if (feature === 'features') {
        const { getAfricanAmericanFeatures } = await import('./StaticDataCache.js');
        return getAfricanAmericanFeatures(seed);
      }
    } catch (error) {
      console.warn('StaticDataCache import failed, using empty fallback:', error);
      return '';
    }
  }
  
  // All other cultural types return empty (no longer supported)
  return '';
}

// ============= UNIFIED VOCABULARY - EXTENDED VERSION =============
const TIER_25_UNIFIED_VOCABULARY_EXTENDED = {
  // ============= UNIFIED ACTION VOCABULARY =============
  actions: {
    // Basic physical actions (with all verb forms)
    basic: [
      'run', 'runs', 'ran', 'running', 'jump', 'jumps', 'jumped', 'jumping', 
      'walk', 'walks', 'walked', 'walking', 'play', 'plays', 'played', 'playing',
      'dance', 'dances', 'danced', 'dancing', 'climb', 'climbs', 'climbed', 'climbing',
      'throw', 'throws', 'threw', 'throwing', 'catch', 'catches', 'caught', 'catching',
      'swim', 'swims', 'swam', 'swimming', 'slide', 'slides', 'slid', 'sliding',
      'roll', 'rolls', 'rolled', 'rolling', 'hide', 'hides', 'hid', 'hiding',
      'dig', 'digs', 'dug', 'digging', 'kick', 'kicks', 'kicked', 'kicking'
    ],
    
    // Creative & academic actions  
    creative: [
      'draw', 'draws', 'drew', 'drawing', 'write', 'writes', 'wrote', 'writing',
      'build', 'builds', 'built', 'building', 'create', 'creates', 'created', 'creating',
      'paint', 'paints', 'painted', 'painting', 'read', 'reads', 'reading',
      'cook', 'cooks', 'cooked', 'cooking', 'study', 'studies', 'studied', 'studying'
    ],
    
    // Sensory & state actions
    sensory: [
      'see', 'sees', 'saw', 'seeing', 'hear', 'hears', 'heard', 'hearing',
      'feel', 'feels', 'felt', 'feeling', 'smell', 'smells', 'smelled', 'smelling',
      'taste', 'tastes', 'tasted', 'tasting', 'touch', 'touches', 'touched', 'touching'
    ],
    
    // State & position actions  
    states: [
      'wake', 'wakes', 'woke', 'waking', 'sleep', 'sleeps', 'slept', 'sleeping',
      'lay', 'lays', 'laid', 'laying', 'sit', 'sits', 'sat', 'sitting',
      'stand', 'stands', 'stood', 'standing', 'lie', 'lies', 'lying'
    ],
    
    // Fantasy & magical actions
    fantasy: [
      'fly', 'flies', 'flew', 'flying', 'float', 'floats', 'floated', 'floating',
      'magic', 'magical', 'transform', 'transforms', 'transformed', 'transforming',
      'disappear', 'disappears', 'disappeared', 'disappearing', 'sparkle', 'sparkles', 'sparkling',
      'glow', 'glows', 'glowed', 'glowing', 'enchant', 'enchants', 'enchanted', 'enchanting'
    ],
    
    // Social & emotional actions
    social: [
      'help', 'helps', 'helped', 'helping', 'share', 'shares', 'shared', 'sharing',
      'laugh', 'laughs', 'laughed', 'laughing', 'smile', 'smiles', 'smiled', 'smiling',
      'hug', 'hugs', 'hugged', 'hugging', 'explore', 'explores', 'explored', 'exploring'
    ],
    
    // Action intensity vocabulary
    intensity: [
      'energetically', 'gently', 'excitedly', 'peacefully', 'eagerly', 'carefully',
      'boldly', 'quietly', 'joyfully', 'thoughtfully', 'confidently', 'gracefully',
      'enthusiastically', 'calmly', 'playfully', 'determinedly', 'curiously', 'lovingly'
    ],
    
    // Body language vocabulary
    bodyLanguage: [
      'arms outstretched', 'hands on hips', 'finger pointing', 'arms crossed',
      'hands behind back', 'palms open', 'hands clasped', 'reaching upward',
      'leaning forward eagerly', 'tilting head curiously', 'shoulders squared confidently',
      'bouncing on toes excitedly', 'crouching down carefully', 'standing tall proudly',
      'kneeling beside gently', 'bending over attentively'
    ]
  },

  // ============= UNIFIED OBJECT VOCABULARY =============
  objectCategories: {
    // Living creatures (75+ items)
    animals: [
      'puppy', 'dog', 'cat', 'kitten', 'bunny', 'rabbit', 'hamster', 'guinea pig',
      'bird', 'parrot', 'duck', 'chicken', 'horse', 'pony', 'cow', 'pig',
      'sheep', 'goat', 'turtle', 'fish', 'frog', 'butterfly', 'bee', 'ladybug',
      'squirrel', 'mouse', 'chipmunk', 'raccoon', 'deer', 'fox', 'owl', 'robin',
      'cardinal', 'blue jay', 'eagle', 'dolphin', 'whale', 'seal', 'penguin',
      'bear', 'lion', 'tiger', 'elephant', 'giraffe', 'zebra', 'monkey', 'kangaroo'
    ],
    
    nature: [
      'tree', 'flower', 'rose', 'sunflower', 'tulip', 'daisy', 'lily', 'bush',
      'grass', 'leaf', 'branch', 'rock', 'stone', 'mountain', 'hill', 'cloud',
      'rainbow', 'sun', 'moon', 'star', 'pond', 'river', 'ocean', 'beach'
    ],

    // Toys & play items (60+ items)
    toys: [
      'ball', 'doll', 'teddy bear', 'toy car', 'truck', 'train', 'airplane',
      'blocks', 'puzzle', 'crayons', 'markers', 'paints', 'clay', 'book',
      'game', 'bike', 'scooter', 'swing', 'slide', 'seesaw', 'kite',
      'balloon', 'bubbles', 'frisbee', 'jump rope', 'hula hoop', 'marbles'
    ],

    // Food & kitchen items (40+ items) 
    food: [
      'apple', 'banana', 'orange', 'cookie', 'cake', 'ice cream', 'pizza',
      'sandwich', 'milk', 'juice', 'water', 'bread', 'cheese', 'yogurt',
      'carrots', 'broccoli', 'pasta', 'soup', 'cereal', 'muffin', 'pie'
    ],

    // Household items (60+ items)
    household: [
      'chair', 'table', 'bed', 'lamp', 'pillow', 'blanket', 'cup', 'plate',
      'bowl', 'spoon', 'fork', 'knife', 'pot', 'pan', 'oven', 'fridge',
      'door', 'window', 'mirror', 'clock', 'phone', 'computer', 'TV'
    ],

    // Transportation (25+ items)
    vehicles: [
      'car', 'bus', 'truck', 'train', 'airplane', 'boat', 'ship', 'bike',
      'scooter', 'skateboard', 'motorcycle', 'helicopter', 'rocket', 'taxi',
      'fire truck', 'police car', 'ambulance', 'school bus', 'van'
    ],

    // School & learning items (30+ items)
    school: [
      'pencil', 'pen', 'paper', 'notebook', 'book', 'backpack', 'desk',
      'whiteboard', 'chalkboard', 'eraser', 'ruler', 'scissors', 'glue',
      'computer', 'tablet', 'calculator', 'globe', 'map', 'calendar'
    ],

    // Sports & activities (25+ items)
    sports: [
      'ball', 'bat', 'glove', 'helmet', 'sneakers', 'uniform', 'goal',
      'net', 'racket', 'paddle', 'skates', 'skateboard', 'surfboard'
    ],

    // Musical instruments (15+ items)
    music: [
      'piano', 'guitar', 'drums', 'violin', 'flute', 'trumpet', 'saxophone',
      'harmonica', 'xylophone', 'tambourine', 'maracas', 'recorder'
    ]
  },

  // ============= UNIFIED CONTEXT DETECTION VOCABULARY =============
  contextDetection: {
    // Indoor context indicators (25 essential items)
    indoor: [
      'kitchen', 'bedroom', 'bathroom', 'living room', 'classroom', 'library',
      'office', 'hospital', 'store', 'restaurant', 'gym', 'theater',
      'museum', 'house', 'home', 'school', 'building', 'room',
      'inside', 'indoors', 'ceiling', 'floor', 'wall', 'furniture', 'table'
    ],
    
    // Outdoor context indicators (25 essential items) 
    outdoor: [
      'park', 'garden', 'playground', 'beach', 'forest', 'mountain', 'lake',
      'river', 'field', 'yard', 'street', 'road', 'path', 'trail',
      'outside', 'outdoors', 'sky', 'clouds', 'trees', 'grass',
      'flowers', 'nature', 'weather', 'sunshine', 'rain'
    ]
  },

  // ============= ENHANCED SETTINGS VOCABULARY =============  
  environments: {
    // Time-based settings
    timeOfDay: [
      'morning', 'afternoon', 'evening', 'night', 'dawn', 'dusk', 'midnight',
      'sunrise', 'sunset', 'noon', 'twilight', 'early morning', 'late night'
    ],
    
    // Weather & atmosphere  
    atmosphere: [
      'sunny', 'cloudy', 'rainy', 'snowy', 'windy', 'foggy', 'misty',
      'bright', 'dark', 'warm', 'cool'
    ],
    
    // Lighting conditions
    lighting: [
      'bright sunlight', 'soft lamplight', 'golden hour glow', 'moonlight',
      'candlelight', 'firelight', 'starlight', 'fluorescent lighting',
      'natural light', 'artificial light', 'dim lighting', 'harsh lighting'
    ]
  }
};

// ============= ENHANCED COLOR DETECTION ARRAYS =============
const EXPANDED_COLOR_ARRAY = [
  // Primary Colors
  'red', 'blue', 'yellow', 'green', 'orange', 'purple', 'pink', 'brown', 'black', 'white',
  // Extended Colors  
  'turquoise', 'coral', 'lavender', 'mint', 'peach', 'gold', 'silver', 'bronze',
  'maroon', 'navy', 'teal', 'lime', 'magenta', 'cyan', 'beige', 'tan',
  // Descriptive Colors
  'bright red', 'deep blue', 'sunny yellow', 'forest green', 'soft pink', 'rich purple',
  'warm orange', 'sky blue', 'grass green', 'snow white', 'charcoal black',
  // Vibrant Colors
  'bright red', 'bright blue', 'bright green', 'bright yellow', 'bright orange', 'bright purple', 'bright pink',
  'vivid red', 'vivid blue', 'vivid green', 'vivid yellow', 'vivid orange', 'vivid purple', 'vivid pink',
  'deep red', 'deep blue', 'deep green', 'deep purple', 'deep orange', 'deep pink', 'deep brown',
  'dark red', 'dark blue', 'dark green', 'dark purple', 'dark orange', 'dark pink', 'dark brown',
  'light red', 'light blue', 'light green', 'light yellow', 'light purple', 'light pink', 'light brown',
  'pale red', 'pale blue', 'pale green', 'pale yellow', 'pale purple', 'pale pink', 'pale brown',
  // Shades and Tints
  'crimson', 'scarlet', 'ruby', 'cherry', 'rose', 'salmon', 'coral', 'peach', 'apricot',
  'navy', 'royal blue', 'sky blue', 'teal', 'turquoise', 'aqua', 'cyan', 'powder blue',
  'forest green', 'lime green', 'emerald', 'jade', 'mint', 'seafoam', 'olive', 'sage',
  'golden', 'lemon', 'butter', 'cream', 'ivory', 'beige', 'tan', 'khaki', 'sand',
  'violet', 'lavender', 'lilac', 'plum', 'magenta', 'fuchsia', 'orchid', 'amethyst',
  'tangerine', 'amber', 'rust', 'copper', 'bronze', 'gold', 'honey', 'caramel',
  'cotton candy pink', 'bubblegum pink', 'hot pink', 'flamingo', 'blush', 'dusty rose'
];

// ============= UNIVERSAL ATMOSPHERE ARRAYS =============
const UNIVERSAL_LIGHTING_ARRAYS = [
  // Golden Hour & Warm Light (30+ options)
  'with bright golden lighting', 'with warm afternoon sunlight', 'with cheerful morning rays',
  'with dazzling sunshine', 'with golden hour glow', 'with brilliant daylight',
  'with soft warm illumination', 'with gentle golden beams', 'with radiant natural light',
  'with luminous golden atmosphere', 'with glowing warm sunlight', 'with sparkling sunshine',
  'with heavenly golden light', 'with magnificent sun rays', 'with divine illumination',
  'with enchanting golden glow', 'with magical sunbeams', 'with celestial lighting',
  'with amber-toned lighting', 'with honey-colored illumination', 'with sunset glow',
  'with dawn light filtering', 'with sunrise illumination', 'with twilight glow',
  'with soft evening light', 'with warm indoor lighting', 'with cozy lamp glow',
  'with fireplace warmth', 'with candle-lit atmosphere', 'with lantern lighting',
  'with campfire radiance', 'with hearth-warm glow', 'with ember lighting',
  'with torch-light illumination', 'with lighthouse beaming', 'with aurora lighting'
];

const UNIVERSAL_WEATHER_ARRAYS = [
  // Clear & Pleasant (20+ options)
  'in cheerful clear weather', 'in peaceful sunny atmosphere', 'in bright pleasant conditions',
  'in crystal-clear skies', 'in perfect weather conditions', 'in delightful sunshine',
  'in gorgeous clear atmosphere', 'in beautiful sunny weather', 'in ideal outdoor conditions',
  'in magnificent clear day', 'in wonderfully bright weather', 'in perfectly clear conditions',
  // Soft & Gentle (15+ options)  
  'in gentle breeze conditions', 'in soft atmospheric haze', 'in mild comfortable weather',
  'in pleasant mild conditions', 'in calm peaceful atmosphere', 'in serene weather patterns',
  'in tranquil atmospheric conditions', 'in soothing gentle weather', 'in comfortable climate',
  'in soft atmospheric conditions', 'in calm weather patterns', 'in soothing atmospheric environment'
];

// ============= UNIVERSAL SETTING ARRAYS =============
const UNIVERSAL_INDOOR_SETTINGS = [
  // Educational & Learning Spaces (15)
  'cozy library with warm lighting', 'bright classroom with colorful displays', 'quiet study area with soft chairs',
  'cheerful reading corner with pillows', 'modern computer lab with screens', 'creative art studio with supplies',
  'music room with instruments', 'science lab with experiments', 'workshop area with tools',
  'craft room with materials', 'playroom with toys', 'game room with activities',
  'den with comfortable seating', 'office with organized workspace', 'studio with creative tools',
  
  // Home & Family Spaces (15)
  'warm kitchen with cooking aromas', 'comfortable living room with soft furniture', 'cozy bedroom with soft bedding',
  'sunny dining room with family table', 'peaceful nursery with gentle colors', 'fun basement rec room',
  'welcoming entryway with coat hooks', 'organized garage workshop space', 'attic storage with treasures',
  'porch with rocking chairs', 'sunroom with plants', 'family room with entertainment center',
  'guest room with welcoming decor', 'master suite with luxury touches', 'kids\' room with colorful decorations',
  
  // Community & Public Spaces (20)
  'bustling shopping mall with stores', 'quiet museum with exhibits', 'lively community center with activities',
  'peaceful church with stained glass', 'busy train station with travelers', 'elegant hotel lobby with seating',
  'modern hospital with helpful staff', 'cozy cafe with warm atmosphere', 'vibrant arcade with games',
  'serene spa with relaxing ambiance', 'active gym with exercise equipment', 'cultural theater with performances',
  'art gallery with colorful paintings', 'dance studio with mirrors', 'pottery studio with clay',
  'photography studio with lights', 'recording studio with equipment'
];

const UNIVERSAL_OUTDOOR_SETTINGS = [
  // Natural Environments (20)
  'sunny backyard garden with flowering bushes', 'peaceful neighborhood park with tall trees', 'quiet forest clearing with dappled sunlight',
  'open meadow field with wildflowers', 'sparkling pond with lily pads', 'babbling creek with smooth stones',
  'rolling hills with green grass', 'sandy beach with gentle waves', 'mountain trail with scenic views',
  'desert oasis with palm trees', 'tropical rainforest with exotic birds', 'alpine valley with snow-capped peaks',
  'coastal cliff with ocean views', 'prairie grassland with swaying grasses', 'botanical garden with diverse plants',
  'nature preserve with wildlife', 'camping ground with fire pits', 'fishing spot by quiet lake',
  'hiking trail through woods', 'picnic area with shaded tables',
  
  // Community & Recreation Spaces (15)
  'busy playground with climbing equipment', 'sports field with goal posts', 'swimming pool with clear water',
  'tennis court with net ready', 'basketball court with hoops', 'baseball diamond with bases',
  'soccer field with fresh grass', 'golf course with rolling greens', 'skate park with ramps',
  'bike path through scenic area', 'outdoor theater with amphitheater seating', 'farmers market with fresh produce',
  'carnival grounds with colorful rides', 'fair grounds with game booths', 'festival area with entertainment stages',
  
  // Urban & Infrastructure (15)
  'busy city street with sidewalks', 'quiet suburban neighborhood with houses', 'town square with fountain',
  'shopping district with storefront windows', 'industrial area with large buildings', 'construction site with equipment',
  'transportation hub with multiple options', 'parking area with marked spaces', 'bridge crossing over water',
  'tunnel passage with lighting', 'rooftop garden with city views', 'courtyard with decorative features',
  'pier extending over water', 'boardwalk along waterfront', 'car parking garage with levels', 'boat dock with wooden planks'
];

// ============= UNIVERSAL ACTION TEMPLATE ARRAYS =============
const UNIVERSAL_ACTION_TEMPLATES = [
  // Observation & Discovery Actions (15)
  'points excitedly at the {object}', 'gazes in wonder at the colorful {object}', 'discovers and watches the magnificent {object}',
  'spots and admires the graceful {object}', 'notices and smiles at the lovely {object}', 'observes the {object} with curious eyes',
  'finds and examines the interesting {object}', 'looks closely at the detailed {object}', 'studies the fascinating {object}',
  'peers at the mysterious {object}', 'stares in amazement at the incredible {object}', 'glimpses the beautiful {object}',
  'investigates the intriguing {object}', 'searches for the hidden {object}', 'focuses on the important {object}',
  
  // Interactive & Play Actions (20)
  'plays happily with the fun {object}', 'tosses the lightweight {object} gently', 'catches the flying {object} skillfully',
  'builds creatively with the sturdy {object}', 'arranges carefully the delicate {object}', 'collects the scattered {object}',
  'shares generously the special {object}', 'holds gently the precious {object}', 'carries proudly the important {object}',
  'places carefully the fragile {object}', 'moves gracefully the smooth {object}', 'lifts easily the light {object}',
  'pushes slowly the heavy {object}', 'pulls steadily the resistant {object}', 'rolls playfully the round {object}',
  'spins merrily the rotating {object}', 'bounces energetically the elastic {object}', 'slides smoothly the slippery {object}',
  'climbs carefully on the stable {object}', 'balances skillfully on the narrow {object}',
  
  // Creative & Learning Actions (15)
  'draws beautifully the artistic {object}', 'paints colorfully the vibrant {object}', 'writes carefully about the interesting {object}',
  'reads enthusiastically the engaging {object}', 'counts methodically the numerous {object}', 'measures precisely the exact {object}',
  'compares thoughtfully the similar {object}', 'organizes neatly the scattered {object}', 'sorts carefully the mixed {object}',
  'matches perfectly the identical {object}', 'groups logically the related {object}', 'sequences properly the ordered {object}',
  'identifies correctly the unique {object}', 'describes accurately the detailed {object}', 'explains clearly the complex {object}',
  
  // Care & Nurture Actions (10)
  'feeds lovingly the hungry {object}', 'waters gently the growing {object}', 'cleans carefully the dirty {object}',
  'repairs skillfully the broken {object}', 'protects bravely the vulnerable {object}', 'rescues heroically the endangered {object}',
  'helps willingly the struggling {object}', 'comforts soothingly the sad {object}', 'encourages enthusiastically the trying {object}',
  'supports strongly the weak {object}',
  
  // Adventure & Challenge Actions (15)
  'chases energetically the fast {object}', 'races competitively against the speedy {object}', 'hides cleverly from the seeking {object}',
  'follows carefully the leading {object}', 'leads confidently the following {object}', 'guides helpfully the lost {object}',
  'explores bravely the unknown {object}', 'adventures boldly toward the distant {object}', 'journeys courageously to the remote {object}',
  'travels excitedly to the exotic {object}', 'visits happily the friendly {object}', 'meets cheerfully the welcoming {object}',
  'greets warmly the arriving {object}', 'welcomes graciously the visiting {object}', 'invites kindly the lonely {object}',
  
  // Problem-Solving Actions (10)
  'solves cleverly the puzzling {object}', 'fixes expertly the malfunctioning {object}', 'assembles carefully the complex {object}',
  'constructs methodically the structured {object}', 'creates imaginatively the original {object}', 'invents brilliantly the innovative {object}',
  'designs thoughtfully the functional {object}', 'plans strategically the challenging {object}', 'overcomes bravely the difficult {object}',
  'conquers triumphantly the formidable {object}',
  
  // Special & Magical Actions (15)
  'transforms magically the ordinary {object}', 'enchants mysteriously the plain {object}', 'blesses ceremonially the sacred {object}',
  'celebrates joyfully the special {object}', 'honors respectfully the important {object}', 'treasures dearly the valuable {object}',
  'cherishes lovingly the meaningful {object}', 'admires deeply the beautiful {object}', 'appreciates fully the wonderful {object}',
  'enjoys thoroughly the delightful {object}', 'savors slowly the delicious {object}', 'experiences fully the amazing {object}',
  'skillfully avoids the tricky {object}', 'cleverly outsmarts the cunning {object}', 'successfully captures the quick {object}'
];

// ============= UNIVERSAL EMOTION ARRAYS =============
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
  'playful', 'whimsical', 'dreamy', 'fantastical', 'magical', 'wonder-filled'
];

// ============= CLOTHING DETECTION KEYWORDS =============
const CLOTHING_DETECTION_KEYWORDS = [
  'shirt', 'dress', 'pants', 'shorts', 'skirt', 'jacket', 'sweater', 'hoodie',
  'jeans', 'overalls', 'uniform', 'costume', 'pajamas', 'robe', 'coat',
  'blouse', 'tunic', 'cardigan', 'vest', 'tank top', 'polo', 'turtleneck'
];

// ============= CULTURAL ARRAYS - CONSOLIDATED SOURCE OF TRUTH =============
const CULTURAL_ARRAYS_EXTENDED = {
  // ============= REGRESSION PROTECTION WARNING =============
  // ⚠️  CRITICAL: DO NOT MODIFY THESE ARRAYS ⚠️
  // These arrays contain HARDCODED BUSINESS REQUIREMENTS for cultural authenticity
  // Reference: docs/AFRICAN_AMERICAN_ARRAYS_DO_NOT_TOUCH.md
  // Last Updated: 2025-01-15
  // Status: PROTECTED - Cultural authenticity data
  // ============= END WARNING =============

  // African American Hairstyles - COMPREHENSIVE PROFESSIONAL ARRAYS
  HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES: {
    // Boys Hairstyles (10 Professional Entries) - DO NOT MODIFY
    boys: [
      "wearing a curly top fade with perfectly defined coils on top, crisp line-up around the edges, and smooth fade transitions down the sides and back",
      "wearing twist sponge curls with tight coil definition, fresh line-up with sharp edges, and tapered sides with natural texture",
      "wearing a high top fade with voluminous textured crown, geometric side part, and precision-cut fade gradation",
      "wearing starter dreads in neat sections with clean parting lines, natural root texture, and expertly shaped perimeter",
      "wearing a buzz cut with intricate geometric designs carved into the sides, crisp line-up, and smooth scalp fade",
      "wearing a classic flat top with perfectly squared edges, uniform height across the crown, and sharp side fade transitions",
      "wearing a caesar cut with deep 360 waves, brush pattern definition, and clean hairline shaping all around",
      "wearing lined-up curls with natural coil springs, precision edge work, and graduated fade from crown to neckline",
      "wearing a tapered afro with rounded natural shape, soft textured crown, and gradually shortened sides and back",
      "wearing a modern pompadour fade with curly volume swept upward, skin fade sides, and detailed edge definition"
    ],
    // Girls Hairstyles (20 Comprehensive Entries) - DO NOT MODIFY
    girls: [
      "wearing a full voluminous afro with authentic coily texture, natural 4B-4C curl pattern, rounded dome shape, dense hair distribution, individual curl spirals visible, matte finish texture, proper afro proportions, natural hair movement",
      "wearing individual box braids with distinct square sectioning, each braid separately defined and visible, geometric parting pattern, multiple separate braided units, detailed individual braid texture, professional sectioning technique, natural or vibrant color variations",
      "wearing cornrow braids in straight parallel rows, hair woven tightly against scalp, clean geometric parts showing scalp between rows, traditional African braiding technique, individual row definition, scalp-hugging pattern",
      "wearing defined twist-out curls with natural curl pattern, bouncy texture, individual curl definition, soft volume, natural hair movement",
      "wearing well-maintained locs with natural texture, individual strand definition, mature lock formation, organic hair pattern, cultural significance, photorealistic hair texture",
      "wearing natural wash-and-go curls with defined curl pattern, bouncy texture, individual curl strands, soft volume, natural movement, salon-quality finish",
      "wearing an elegant flat twist updo with precise parting, neat twisting pattern, decorative arrangement, formal styling, detailed texture work, individual strand definition",
      "wearing a sleek protective bun with smooth edges, neat hair arrangement, polished finish, professional styling, clean part lines, natural hair movement",
      "wearing a silky smooth silk press with glossy shine, pin-straight texture, individual strand definition, heat-pressed perfection, natural movement, luminous finish, silk-pressed smoothness",
      "wearing bone straight relaxed hair with sleek texture, ultra-smooth finish, perfect alignment, chemical straightening results, glossy appearance, flowing movement, chemically straightened texture",
      "wearing a precision-cut relaxed bob with blunt edges, smooth straight texture, professional salon finish, geometric cut lines, polished styling, professional salon results",
      "wearing layered relaxed hair with dimensional cutting, smooth straight texture, professional layers, voluminous styling, salon-quality finish, glossy straight hair finish",
      "wearing hot-pressed straight hair with curled ends, vintage styling technique, smooth shaft with bouncy curl tips, classic salon finish, heat-styled perfection",
      "wearing a sleek relaxed ponytail with smooth edges, straight hair texture, polished finish, tight hair control, professional styling, light reflection on hair",
      "wearing silk-pressed hair with clean side part, glossy straight texture, precise parting line, smooth flowing hair, salon-quality finish, glossy hair shine",
      "wearing relaxed hair with vintage bump styling, smooth straight texture, retro volume technique, polished finish, classic salon look, natural hair highlights",
      "wearing thermally straightened hair with heat-pressed texture, smooth alignment, individual strand definition, professional hot tool finish, luminous hair finish",
      "wearing a relaxed wrap hairstyle with smooth curved styling, salon wrap technique, sleek finish, dimensional movement, professional hair wrapping, professional salon results",
      "wearing afro puffs hairstyle with twin high-positioned hair puffs, natural coily texture pattern, symmetrical rounded shape, authentic Black hair structure, voluminous curl clusters, defined individual strands, traditional afro hair styling",
      "wearing long pigtails with curled ends, flowing length with bouncy spiral curls, symmetrical pigtail placement, smooth hair shaft with defined curl tips, glossy hair shine"
    ]
  },

  // African American Facial Features - THREE-TIER SYSTEM (36 Total Entries) - DO NOT MODIFY
  HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES: [
    // Light to Medium Tones (12 entries) - DO NOT MODIFY
    "light brown skin tone with warm brown eyes and a bright infectious smile",
    "light brown skin tone with hazel-green eyes and gentle dimples when smiling",
    "light brown skin tone with amber eyes and expressive eyebrows",
    "caramel skin tone with deep chocolate eyes and a confident cheerful expression",
    "caramel skin tone with hazel eyes with golden flecks and soft rounded cheeks",
    "caramel skin tone with bright brown eyes and an inquisitive thoughtful look",
    "honey complexion with golden brown eyes and a playful mischievous grin",
    "honey complexion with warm brown eyes and graceful bone structure",
    "honey complexion with hazel eyes and a warm welcoming expression",
    "warm beige skin with dark honey-colored eyes and animated joyful features",
    "warm beige skin with hazel-green eyes and gentle dimples",
    "light caramel complexion with rich coffee-colored eyes and expressive eyebrows",
    
    // Medium Tones (12 entries) - DO NOT MODIFY  
    "medium brown skin tone with warm brown eyes and a bright infectious smile",
    "medium brown skin tone with hazel eyes with golden flecks and gentle dimples when smiling",
    "medium brown skin tone with deep amber eyes and expressive eyebrows",
    "cocoa skin tone with dark chocolate eyes and a confident cheerful expression", 
    "cocoa skin tone with hazel-green eyes and soft rounded cheeks",
    "cocoa skin tone with bright brown eyes and an inquisitive thoughtful look",
    "warm brown complexion with golden brown eyes and a playful mischievous grin",
    "warm brown complexion with rich coffee-colored eyes and graceful bone structure",
    "chestnut skin tone with hazel eyes and a warm welcoming expression",
    "chestnut skin tone with warm brown eyes and animated joyful features",
    "amber skin tone with dark honey-colored eyes and gentle dimples",
    "amber skin tone with hazel-green eyes and expressive eyebrows",
    
    // Medium-Dark to Dark Tones (12 entries) - DO NOT MODIFY
    "deep brown skin tone with warm brown eyes and a bright infectious smile",
    "deep brown skin tone with dark chocolate eyes and gentle dimples when smiling",
    "deep brown skin tone with deep amber eyes and expressive eyebrows",
    "rich chocolate complexion with hazel eyes with golden flecks and a confident cheerful expression",
    "rich chocolate complexion with bright brown eyes and soft rounded cheeks",
    "rich chocolate complexion with golden brown eyes and an inquisitive thoughtful look",
    "dark brown skin tone with rich coffee-colored eyes and a playful mischievous grin",
    "dark brown skin tone with warm brown eyes and graceful bone structure", 
    "ebony skin tone with dark honey-colored eyes and a warm welcoming expression",
    "ebony skin tone with hazel-green eyes and animated joyful features",
    "deep mahogany complexion with hazel eyes and gentle dimples",
    "deep mahogany complexion with deep amber eyes and expressive eyebrows"
  ],

  // ============= REGRESSION PROTECTION WARNING =============
  // ⚠️  END OF PROTECTED ARRAYS - DO NOT MODIFY ABOVE ⚠️
  // Reference: docs/AFRICAN_AMERICAN_ARRAYS_DO_NOT_TOUCH.md
  // ============= END WARNING =============

  // African American Skin Tones (preserved for legacy compatibility)
  HARDCODED_AFRICAN_AMERICAN_SKIN_TONES: [
    'light brown complexion', 'medium brown skin', 'rich brown complexion', 'deep brown skin',
    'warm caramel complexion', 'golden brown skin', 'mahogany complexion', 'dark chocolate skin',
    'ebony complexion', 'honey-toned skin', 'bronze complexion', 'chestnut brown skin'
  ],

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
export const TIER_25_NUCLEAR_LIGHTING = UNIVERSAL_LIGHTING_ARRAYS;
export const TIER_25_NUCLEAR_WEATHER = UNIVERSAL_WEATHER_ARRAYS;
export const TIER_25_NUCLEAR_INDOOR = UNIVERSAL_INDOOR_SETTINGS;
export const TIER_25_NUCLEAR_OUTDOOR = UNIVERSAL_OUTDOOR_SETTINGS;
export const TIER_25_NUCLEAR_ACTION_TEMPLATES = UNIVERSAL_ACTION_TEMPLATES;
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
  UNIVERSAL_LIGHTING_ARRAYS,
  UNIVERSAL_WEATHER_ARRAYS,
  UNIVERSAL_INDOOR_SETTINGS,
  UNIVERSAL_OUTDOOR_SETTINGS,
  UNIVERSAL_ACTION_TEMPLATES,
  UNIVERSAL_EMOTION_MODIFIERS,
  UNIVERSAL_INTERACTION_TEMPLATES,
  UNIVERSAL_OBJECT_INTERACTION,
  SEMANTIC_EXTRACTION,
  ATMOSPHERE_OPTIONS,
  VIVID_COLORS
};

// ============= EXPORTS FOR UNIFIED PLACEHOLDER RESOLVER =============
export const VOCABULARY = TIER_25_UNIFIED_VOCABULARY_EXTENDED;
export { CULTURAL_ARRAYS_EXTENDED };