// ============= TIER 2.5 UNIFIED VOCABULARY - NUCLEAR INDEPENDENCE =============
// Lazy-loaded vocabulary module for performance optimization
// Contains all large constant arrays to prevent cold-boot failures

// ============= TIER 2.5 UNIFIED VOCABULARY - NUCLEAR INDEPENDENCE =============
const TIER_25_UNIFIED_VOCABULARY = {
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
  settings: {
    indoor: ['room', 'house', 'school', 'library', 'kitchen', 'bedroom', 'classroom'],
    outdoor: ['park', 'garden', 'playground', 'forest', 'beach', 'field', 'yard'],
    specific: ['cozy corner', 'sunny spot', 'quiet place', 'bright area', 'comfortable space'],
    fantasy: ['magical place', 'enchanted garden', 'dreamy landscape', 'wonder-filled space']
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
      'bright', 'dark', 'warm', 'cool', 'peaceful', 'lively', 'quiet',
      'busy', 'serene', 'magical', 'mysterious', 'cheerful', 'cozy'
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
  'guest room with welcoming decor', 'master suite with luxury touches', 'kids' room with colorful decorations',
  
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

// ============= EXPORT ALL VOCABULARY =============
export default {
  TIER_25_UNIFIED_VOCABULARY,
  TIER_25_UNIFIED_VOCABULARY_EXTENDED,
  EXPANDED_COLOR_ARRAY,
  UNIVERSAL_LIGHTING_ARRAYS,
  UNIVERSAL_WEATHER_ARRAYS,
  UNIVERSAL_INDOOR_SETTINGS,
  UNIVERSAL_OUTDOOR_SETTINGS,
  UNIVERSAL_ACTION_TEMPLATES,
  UNIVERSAL_EMOTION_ARRAYS,
  CLOTHING_DETECTION_KEYWORDS
};