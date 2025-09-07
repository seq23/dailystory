// ============= TIER 2.5 NUCLEAR INDEPENDENCE - SHARED NUCLEAR NEGATIVE PROMPT SYSTEM =============
// This edge function uses the shared nuclear negative prompt system for consistency
import { generateNuclearNegativePrompt, detectCulturalProfileForNegatives } from "../_shared/NuclearNegativePrompts.js";

// Nuclear Independent CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// Nuclear Independent CORS Response Functions  
function createCorsResponse(data: any, status = 200): Response {
  const headers = { 
    ...corsHeaders, 
    'Content-Type': 'application/json' 
  };
  return new Response(JSON.stringify(data), { status, headers });
}

function createCorsErrorResponse(error: string | Error, status = 500): Response {
  const errorMessage = error instanceof Error ? error.message : error;
  console.error('Edge function error:', errorMessage);
  return createCorsResponse({ 
    success: false, 
    error: errorMessage 
  }, status);
}

function createCorsOptionsResponse(): Response {
  return new Response(null, { headers: corsHeaders });
}

// ============= TIER 2.5 NUCLEAR INDEPENDENCE - ALL CONSTANTS FIRST =============

// PREMIUM PROMPT TEMPLATES BY DIFFICULTY (Enhanced with Page Text and Style Framework Integration)
const PREMIUM_PROMPT_TEMPLATES = {
  beginner: "{pageText}. {character} {age}, {hair}, {features}, {scene} in {setting}{objects}{secondary_characters}. {emotion}. {ethnicity}. {frameworkPrompt}",
  easy: "{pageText}. {character} {age}, {hair}, {features}, {scene} in {setting}{objects}{secondary_characters}. {emotion}. {ethnicity}. {frameworkPrompt}",
  medium: "{character} {age}, {hair}, {features}, {scene} in {setting}{objects}{secondary_characters}. {emotion}. {ethnicity}. {frameworkPrompt}. {pageText}",
  hard: "{character} {age}, {hair}, {features}, {scene} in {setting}{objects}{secondary_characters}. {emotion}. {ethnicity}. {frameworkPrompt}. {pageText}",
  expert: "{character} {age}, {hair}, {features}, {scene} in {setting}{objects}{secondary_characters}. {emotion}. {ethnicity}. {frameworkPrompt}. {pageText}"
};

// AFRICAN AMERICAN ARRAYS (Nuclear Independence - Combined Features Only)
const HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES = {
  boys: [
    'textured buzz cut', 'detailed fade cut', 'textured taper fade', 'detailed high top fade', 
    'textured low fade', 'detailed crew cut', 'textured caesar cut', 'detailed curly top fade', 
    'textured curly high fade', 'detailed curly low fade', 'textured curly taper fade', 
    'detailed curly high top', 'textured curly mohawk', 'detailed curly faux hawk', 
    'textured curly undercut', 'detailed fade with curls on top', 'textured crop', 
    'detailed curly fringe fade', 'textured twisted top fade', 'detailed undercut design', 
    'textured hair tattoo', 'detailed geometric patterns', 'textured mini afro', 
    'detailed medium afro', 'textured tapered afro', 'detailed wash and go', 
    'textured finger coils', 'detailed two strand twists', 'textured flat twists', 
    'detailed mini twists', 'textured locs', 'detailed starter locs', 'textured freeform locs', 
    'detailed twisted locs', 'textured side part locs', 'detailed middle part locs', 
    'textured ponytail with locs', 'detailed nape area tapered'
  ],
  girls: [
    'wearing a detailed traditional afro hairstyle with natural coily hair texture, spherical volume shape, tight curl pattern definition, authentic Black hair structure, individual strand coils, dimensional texture depth, natural shine and movement',
    'wearing detailed, photorealistic separated box braids with rectangular parting, each individual braid clearly distinct, multiple separate braided sections, geometric hair sectioning, individual strand definition per braid, occasionally with colorful strands, professional box braid styling',
    'wearing detailed, photorealistic cornrows braided straight back in parallel rows, tight to scalp weaving, visible scalp parts between each row, traditional row braiding style, occasionally with colorful strands',
    'wearing detailed, defined twist-out curls with natural curl pattern, bouncy texture, individual curl definition, soft volume, natural hair movement',
    'wearing detailed afro puffs hairstyle with two symmetrical hair puffs positioned high on head, natural curly texture, rounded voluminous shape, authentic afro hair structure, defined curl clusters, bouncy texture depth',
    'well-maintained dreadlocs with natural texture, individual strand definition, mature lock formation, photorealistic hair texture',
    'wearing a natural wash-and-go curls with defined curl pattern, bouncy texture, individual curl strands, soft volume, natural movement, salon-quality finish',
    'wearing detailed, photorealistic, traditional flat twists hairstyle, neat twisting pattern, detailed texture, individual strand definition',
    'wearing detailed sleek bun with smooth edges sitting high on the head, neat hair, no loose hair, polished finish, professional styling',
    'wearing sleek relaxed ponytail with smooth edges, straight hair texture, polished finish, tight hair control, professional styling, light reflection on hair',
    'wearing detailed relaxed curved bob hairstyle with smooth inward styling, visible side part, salon shaping technique, sleek finish, dimensional movement, professional curved cutting, professional salon results'
  ]
};

const HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES = [
  'rich dark chocolate complexion with warm dark chocolate eyes, beautiful expressive smile, and strong confident features',
  'warm deep brown skin with deep rich brown eyes, graceful facial structure, and kind welcoming demeanor',
  'beautiful dark ebony skin tone with beautiful dark amber eyes, striking natural beauty, and joyful animated expression',
  'rich mahogany complexion with warm coffee brown eyes, elegant bone structure, and warm inviting smile',
  'warm caramel brown complexion with deep mahogany eyes, radiant glow, and bright engaging expression',
  'deep cocoa skin with rich cocoa brown eyes, natural confident bearing, and gentle friendly expression',
  'rich chestnut brown complexion with warm honey brown eyes, beautiful authentic features, and lively cheerful demeanor',
  'warm coffee-colored skin with beautiful chestnut brown eyes, strong dignified presence, and warm genuine smile',
  'beautiful bronze complexion with deep mocha eyes, graceful natural beauty, and bright expressive features',
  'deep amber brown skin tone with warm bronze brown eyes, confident friendly demeanor, and welcoming joyful expression',
  'rich mocha complexion with rich dark hazel eyes, striking elegant appearance, and kind animated smile',
  'warm honey brown skin with beautiful golden brown eyes, natural confidence, and warm engaging demeanor',
  'beautiful dark copper complexion with deep caramel eyes, radiant authentic beauty, and bright cheerful expression',
  'deep golden brown skin with warm toffee brown eyes, gentle strong features, and kind welcoming smile',
  'rich terra cotta complexion with rich dark copper eyes, beautiful natural glow, and confident friendly expression'
];

const HARDCODED_AFRICAN_AMERICAN_CLOTHING = [
  'vibrant colorful casual wear', 'stylish modern youth clothing', 'trendy cultural fashion', 
  'bright patterned shirt and comfortable pants', 'colorful hoodie and jeans', 'modern streetwear style', 
  'fashionable casual outfit', 'contemporary youth fashion', 'stylish comfortable clothing', 
  'trendy modern casual wear', 'vibrant youth streetwear', 'fashionable everyday outfit'
];

// REMOVED LIMITED CULTURAL ARRAYS - LET RUNWARE DECIDE THEIR LOOK
// Hispanic/Latino, Chinese/Asian, and Middle Eastern arrays removed
// Only African American arrays maintained for detailed representation

// STANDARD AMERICAN ARRAYS (Hair array removed - AI handles generation)

const HARDCODED_STANDARD_AMERICAN_SKIN_TONES = [
  'fair light complexion', 'warm light skin', 'peachy fair skin', 'light rosy complexion',
  'pale golden skin', 'creamy light skin', 'fair pink-toned skin', 'light neutral complexion'
];

const HARDCODED_STANDARD_AMERICAN_EYE_COLORS = [
  'bright blue eyes', 'warm green eyes', 'hazel eyes', 'light brown eyes',
  'sparkling blue eyes', 'emerald green eyes', 'golden hazel eyes', 'deep blue eyes'
];

const HARDCODED_STANDARD_AMERICAN_FACIAL_FEATURES = [
  'bright sparkling eyes', 'cheerful friendly smile', 'freckled nose and rosy cheeks',
  'expressive animated eyes', 'warm genuine smile', 'lively enthusiastic expression',
  'kind gentle demeanor', 'confident bright smile', 'playful mischievous grin'
];

const HARDCODED_STANDARD_AMERICAN_CLOTHING = [
  'casual t-shirt and jeans', 'hoodie and sneakers', 'button-up shirt and khakis', 
  'sweater and comfortable pants', 'polo shirt and shorts', 'flannel shirt and jeans',
  'graphic tee and cargo shorts', 'pullover and joggers', 'camp shirt and chinos',
  'tank top and denim shorts', 'long sleeve tee and leggings', 'sundress and sandals',
  'blouse and skirt', 'cardigan and dress', 'tunic and leggings', 'romper and flats',
  'striped shirt and overalls', 'peasant top and jeans', 'wrap dress and boots',
  'knit top and wide leg pants', 'denim jacket and dress', 'crop top and high waisted jeans',
  'oversized sweater and skinny jeans', 'off shoulder top and midi skirt', 'blazer and trousers',
  'band tee and ripped jeans', 'vintage inspired outfit', 'bohemian style clothing',
  'preppy casual wear', 'athletic wear and running shoes', 'cozy knit sweater and boots',
  'plaid shirt and dark jeans', 'solid color tee and cargo pants', 'striped long sleeve and shorts',
  'fleece jacket and sweatpants', 'henley shirt and khaki shorts', 'crew neck sweatshirt and jeans',
  'v-neck tee and chino pants', 'quarter zip pullover and joggers', 'pocket tee and denim',
  'thermal shirt and canvas pants', 'rugby shirt and twill shorts', 'mock turtleneck and corduroys',
  'flannel pajama set', 'terry cloth robe and slippers', 'cotton nightgown', 'silk pajamas',
  'jersey knit pajamas', 'plaid flannel pajama pants', 'soft cotton sleepwear', 'cozy night clothes',
  'denim jacket and jeans', 'cardigan and slacks', 'henley shirt and chinos', 
  'baseball cap and casual wear', 'sneakers and athletic socks', 'backpack and school clothes', 
  'comfortable everyday outfit', 'playground-appropriate clothing', 'weekend casual wear', 
  'school uniform alternatives', 'athletic wear and running shoes', 'layered casual look', 
  'seasonal appropriate clothing', 'comfortable playtime outfit', 'trendy youth fashion', 
  'classic American casual style', 'modern comfortable clothing', 'age-appropriate fashion'
];

// ============= NUCLEAR INDEPENDENT CORE FUNCTIONS =============

// DRAMATICALLY EXPANDED COLOR AND OBJECT ARRAYS FOR TIER 2.5
const EXPANDED_COLOR_ARRAY = [
  // Basic Colors
  'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'black', 'white', 'brown', 'gray', 'grey',
  // Vibrant Colors
  'bright red', 'bright blue', 'bright green', 'bright yellow', 'bright orange', 'bright purple', 'bright pink',
  'vibrant red', 'vibrant blue', 'vibrant green', 'electric blue', 'neon green', 'hot pink', 'lime green',
  // Pastel Colors
  'light blue', 'light pink', 'light green', 'light yellow', 'soft blue', 'soft pink', 'soft purple',
  'pastel blue', 'pastel pink', 'pastel yellow', 'pale blue', 'pale green', 'pale yellow',
  // Dark Colors
  'dark blue', 'dark green', 'dark red', 'dark purple', 'navy blue', 'forest green', 'burgundy',
  // Metallic & Special Colors
  'silver', 'gold', 'metallic blue', 'shiny red', 'sparkly pink', 'glittery purple', 'rainbow',
  // Natural Colors
  'sky blue', 'ocean blue', 'grass green', 'sunset orange', 'sunshine yellow', 'cherry red'
];

const EXPANDED_OBJECT_ARRAY = {
  // Food Items
  food: ['apple', 'banana', 'sandwich', 'cookie', 'cake', 'pizza', 'ice cream', 'cupcake', 'donut', 'bread', 'cheese', 'crackers', 'fruit', 'vegetables', 'juice box', 'water bottle', 'milk', 'cereal', 'pancakes', 'toast'],
  
  // Animals & Pets (100+ animals across 6 categories - allows any color for user stories)
  animals: [
    // Pets & Domesticated
    'dog', 'cat', 'rabbit', 'hamster', 'guinea pig', 'parakeet', 'goldfish', 'turtle', 'ferret', 'chinchilla', 'hedgehog', 'rat', 'mouse', 'canary', 'cockatiel', 'budgie', 'parrot', 'macaw', 'iguana', 'snake',
    // Farm Animals  
    'cow', 'pig', 'sheep', 'chicken', 'duck', 'goose', 'horse', 'goat', 'llama', 'alpaca', 'donkey', 'mule', 'turkey', 'rooster', 'hen',
    // Wild Animals
    'lion', 'tiger', 'bear', 'elephant', 'wolf', 'fox', 'deer', 'squirrel', 'raccoon', 'skunk', 'porcupine', 'beaver', 'otter', 'mink', 'badger', 'leopard', 'cheetah', 'jaguar', 'panther', 'lynx', 'bobcat', 'coyote', 'hyena', 'rhino', 'hippo', 'giraffe', 'zebra', 'antelope', 'gazelle', 'buffalo', 'bison', 'moose', 'elk', 'caribou',
    // Sea Animals
    'dolphin', 'whale', 'shark', 'fish', 'octopus', 'crab', 'lobster', 'seahorse', 'starfish', 'jellyfish', 'seal', 'sea lion', 'walrus', 'orca', 'stingray',
    // Birds
    'eagle', 'owl', 'robin', 'cardinal', 'flamingo', 'penguin', 'pelican', 'heron', 'crane', 'stork', 'swan', 'hawk', 'falcon', 'vulture', 'peacock', 'ostrich', 'emu', 'kiwi', 'toucan', 'hummingbird',
    // Insects & Small Creatures
    'butterfly', 'ladybug', 'bee', 'ant', 'spider', 'caterpillar', 'grasshopper', 'cricket', 'dragonfly', 'firefly', 'beetle', 'moth', 'wasp', 'fly', 'mosquito', 'frog', 'toad', 'salamander', 'lizard', 'chameleon'
  ],
  
  // Vehicles & Transportation
  vehicles: ['car', 'truck', 'bus', 'train', 'airplane', 'helicopter', 'boat', 'ship', 'bicycle', 'scooter', 'skateboard', 'motorcycle', 'fire truck', 'police car', 'ambulance', 'school bus', 'taxi', 'rocket', 'submarine', 'hot air balloon'],
  
  // Toys & Games
  toys: ['ball', 'doll', 'teddy bear', 'blocks', 'puzzle', 'kite', 'yo-yo', 'top', 'marbles', 'action figure', 'stuffed animal', 'toy car', 'toy train', 'board game', 'cards', 'dice', 'jump rope', 'hula hoop', 'frisbee', 'bubbles'],
  
  // Tools & Instruments
  tools: ['hammer', 'screwdriver', 'wrench', 'paintbrush', 'scissors', 'ruler', 'magnifying glass', 'telescope', 'microscope', 'calculator', 'compass', 'flashlight', 'camera', 'telephone', 'computer', 'tablet', 'keyboard', 'mouse', 'headphones', 'microphone'],
  
  // Nature & Outdoor
  nature: ['tree', 'flower', 'leaf', 'rock', 'shell', 'stick', 'acorn', 'pinecone', 'feather', 'pebble', 'sand', 'grass', 'moss', 'mushroom', 'berry', 'seed', 'branch', 'log', 'crystal', 'butterfly net'],
  
  // Clothing & Accessories
  clothing: ['hat', 'cap', 'shirt', 'dress', 'pants', 'shoes', 'socks', 'jacket', 'sweater', 'scarf', 'gloves', 'belt', 'tie', 'bow tie', 'necklace', 'bracelet', 'earrings', 'ring', 'watch', 'sunglasses'],
  
  // Sports & Recreation
  sports: ['soccer ball', 'basketball', 'football', 'baseball', 'tennis ball', 'golf ball', 'ping pong ball', 'volleyball', 'hockey stick', 'baseball bat', 'tennis racket', 'golf club', 'skateboard', 'roller skates', 'ice skates', 'helmet', 'bicycle', 'swimming goggles', 'life jacket', 'surfboard'],
  
  // Electronics & Technology
  electronics: ['computer', 'laptop', 'tablet', 'phone', 'television', 'radio', 'speaker', 'headphones', 'camera', 'video game', 'remote control', 'calculator', 'digital clock', 'mp3 player', 'keyboard', 'mouse', 'printer', 'scanner', 'projector', 'smartwatch'],
  
  // Furniture & Household
  furniture: ['chair', 'table', 'bed', 'desk', 'bookshelf', 'dresser', 'mirror', 'lamp', 'clock', 'picture frame', 'vase', 'pillow', 'blanket', 'curtains', 'rug', 'couch', 'sofa', 'cabinet', 'drawer', 'closet']
};

// ENHANCED INDOOR/OUTDOOR KEYWORDS
const ENHANCED_INDOOR_KEYWORDS = [
  'kitchen', 'bedroom', 'classroom', 'library', 'home', 'house', 'room', 'reading', 'cooking', 'tv', 'computer', 'tablet', 
  'indoor', 'inside', 'studying', 'homework', 'bed', 'chair', 'table', 'desk', 'sofa', 'couch', 'floor', 'ceiling', 
  'wall', 'door', 'window', 'lamp', 'light', 'book', 'newspaper', 'magazine', 'phone', 'television', 'radio', 
  'bathroom', 'shower', 'bath', 'toilet', 'sink', 'mirror', 'closet', 'cabinet', 'refrigerator', 'oven', 'microwave'
];

const ENHANCED_OUTDOOR_KEYWORDS = [
  'park', 'playground', 'garden', 'forest', 'beach', 'mountain', 'backyard', 'ball', 'bat', 'bike', 'outdoor', 'outside', 
  'nature', 'tree', 'grass', 'flower', 'sky', 'sun', 'moon', 'star', 'cloud', 'rain', 'snow', 'wind', 'air',
  'field', 'hill', 'river', 'lake', 'ocean', 'sea', 'pond', 'stream', 'path', 'trail', 'road', 'street',
  'running', 'walking', 'hiking', 'climbing', 'swimming', 'fishing', 'camping', 'picnic', 'barbecue', 'sports'
];

// NUCLEAR HARDCODED AVATAR MAPPINGS (15 combinations: 3 types × 5 skin tones)
const NUCLEAR_AVATAR_MAPPINGS = {
  // BOY MAPPINGS
  'boy-pale': {
    character: 'boy',
    age: '6-year-old',
    hair: 'red hair',
    features: 'attractive child character with fair pale complexion'
  },
  'boy-light': {
    character: 'boy', 
    age: '6-year-old',
    hair: 'blonde hair', 
    features: 'attractive child character with light complexion'
  },
  'boy-medium': {
    character: 'boy',
    age: '6-year-old', 
    hair: 'brown hair',
    features: 'attractive child character with medium complexion'
  },
  'boy-olive': {
    character: 'boy',
    age: '6-year-old',
    hair: 'black hair',
    features: 'attractive child character with olive complexion'
  },
  'boy-dark': {
    character: 'African American boy',
    age: '6-year-old',
    hair: 'textured hair',
    features: 'attractive child character with authentic African American features'
  },

  // GIRL MAPPINGS  
  'girl-pale': {
    character: 'girl',
    age: '6-year-old',
    hair: 'red hair',
    features: 'attractive child character with fair pale complexion'
  },
  'girl-light': {
    character: 'girl',
    age: '6-year-old', 
    hair: 'blonde hair',
    features: 'attractive child character with light complexion'
  },
  'girl-medium': {
    character: 'girl',
    age: '6-year-old',
    hair: 'brown hair',
    features: 'attractive child character with medium complexion'
  },
  'girl-olive': {
    character: 'girl', 
    age: '6-year-old',
    hair: 'black hair',
    features: 'attractive child character with olive complexion'
  },
  'girl-dark': {
    character: 'African American girl',
    age: '6-year-old',
    hair: 'textured hair', 
    features: 'attractive child character with authentic African American features'
  },

  // GENDER-NEUTRAL MAPPINGS (for prefer-not-to-answer)
  'neutral-pale': {
    character: 'child with gender neutral characteristics',
    age: '6-year-old',
    hair: 'red hair',
    features: 'attractive gender neutral child character with fair pale complexion and no recognizable gender'
  },
  'neutral-light': {
    character: 'child with gender neutral characteristics',
    age: '6-year-old',
    hair: 'blonde hair',
    features: 'attractive gender neutral child character with light complexion and no recognizable gender'
  },
  'neutral-medium': {
    character: 'child with gender neutral characteristics',
    age: '6-year-old',
    hair: 'brown hair',
    features: 'attractive gender neutral child character with medium complexion and no recognizable gender'
  },
  'neutral-olive': {
    character: 'child with gender neutral characteristics', 
    age: '6-year-old',
    hair: 'black hair',
    features: 'attractive gender neutral child character with olive complexion and no recognizable gender'
  },
  'neutral-dark': {
    character: 'African American child with gender neutral characteristics',
    age: '6-year-old', 
    hair: 'textured hair',
    features: 'attractive gender neutral child character with authentic African American features and no recognizable gender'
  }
};

// NUCLEAR AVATAR MAPPING FUNCTION
function getNuclearAvatarMapping(userInfo: any, difficulty: string): any {
  try {
    console.log('🛡️ Tier 2.5: Nuclear avatar mapping started');
    
    // Get avatar type - fix the critical bug here
    let avatarType = userInfo?.avatar?.type || 'prefer-not-to-answer';
    const avatarSkinTone = userInfo?.avatar?.skinTone || 'light';
    
    console.log(`🛡️ Tier 2.5: Avatar data - Type: ${avatarType}, SkinTone: ${avatarSkinTone}`);
    
    // Handle missing avatar data - default to gender-neutral
    if (!userInfo?.avatar?.type) {
      console.log('🛡️ Tier 2.5: No avatar type found, defaulting to gender-neutral');
      avatarType = 'prefer-not-to-answer';
    }
    
    // Map avatar type to character prefix
    let characterPrefix;
    if (avatarType === 'prefer-not-to-answer') {
      characterPrefix = 'neutral';
    } else {
      characterPrefix = avatarType; // 'boy' or 'girl'  
    }
    
    // Create mapping key
    const mappingKey = `${characterPrefix}-${avatarSkinTone}`;
    console.log(`🛡️ Tier 2.5: Nuclear mapping key: ${mappingKey}`);
    
    // Get the nuclear mapping
    const avatarMapping = NUCLEAR_AVATAR_MAPPINGS[mappingKey];
    
    if (!avatarMapping) {
      console.warn(`⚠️ Tier 2.5: No mapping found for ${mappingKey}, using emergency fallback`);
      // Enhanced emergency fallback with user's specifications
      return {
        character: 'happy child',
        age: '10-year-old',
        hair: 'beautiful thick hair',
        features: 'attractive child character',
        source: 'emergency-fallback'
      };
    }
    
    // Adjust age based on difficulty
    const ageMapping = {
      'beginner': '3-year-old',
      'easy': '5-year-old', 
      'medium': '7-year-old',
      'hard': '9-year-old',
      'expert': '11-year-old'
    };
    
    const finalMapping = {
      ...avatarMapping,
      age: ageMapping[difficulty] || avatarMapping.age
    };
    
    console.log(`✅ Tier 2.5: Nuclear mapping successful for ${mappingKey}`);
    return finalMapping;
    
  } catch (error) {
    console.error('❌ Tier 2.5: Nuclear avatar mapping error:', error);
    // Enhanced ultimate failsafe with user's specifications
    return {
      character: 'happy child',
      age: '10-year-old', 
      hair: 'beautiful thick hair',
      features: 'attractive child character',
      source: 'emergency-fallback'
    };
  }
}

// CHARACTER CONSISTENCY ENHANCEMENT FUNCTION  
// Enhances nuclear mapping with consistent character data while preserving nuclear independence
function enhanceNuclearMappingWithConsistency(userInfo: any, difficulty: string, characterData: any, sessionId: string): any {
  try {
    console.log('🎭 Tier 2.5: Starting character consistency enhancement');
    
    // STEP 1: Get the nuclear mapping (always safe)
    const nuclearMapping = getNuclearAvatarMapping(userInfo, difficulty);
    console.log('🛡️ Tier 2.5: Nuclear mapping obtained successfully');
    
    // STEP 2: If no character data, return nuclear mapping (existing behavior)
    if (!characterData || !characterData.seed) {
      console.log('🛡️ Tier 2.5: No character data available - using nuclear mapping');
      return nuclearMapping;
    }
    
    // STEP 3: Enhance nuclear mapping with consistent traits
    console.log('🎭 Tier 2.5: Enhancing nuclear mapping with consistent character data');
    
    const enhancedMapping = {
      ...nuclearMapping, // Start with nuclear safety
      
      // Override with consistent traits when available
      ...(characterData.consistentEyeColor && { eyeColor: characterData.consistentEyeColor }),
      ...(characterData.consistentClothingStyle && { clothing: characterData.consistentClothingStyle }),
      ...(characterData.consistentHairDescription && { hair: characterData.consistentHairDescription }),
      
      // Preserve nuclear safety features
      seed: characterData.seed, // Use consistent seed
      source: 'enhanced-nuclear-mapping'
    };
    
    console.log('✅ Tier 2.5: Character consistency enhancement completed:', {
      hasConsistentEyeColor: !!characterData.consistentEyeColor,
      hasConsistentClothing: !!characterData.consistentClothingStyle,
      hasConsistentHair: !!characterData.consistentHairDescription,
      seed: characterData.seed,
      sessionId: sessionId
    });
    
    return enhancedMapping;
    
  } catch (error) {
    console.warn('⚠️ Tier 2.5: Character consistency enhancement failed - falling back to nuclear mapping:', error);
    // BULLETPROOF FALLBACK: Return nuclear mapping on any error
    return getNuclearAvatarMapping(userInfo, difficulty);
  }
}

function mapDifficultyInline(userInfo?: any, fallbackLevel: string = 'medium'): string {
  try {
    const rawLevel = userInfo?.readingLevel || userInfo?.difficultyLevel || userInfo?.gradeLevel;
    const validLevels = ['beginner', 'easy', 'medium', 'hard', 'expert'];
    
    if (rawLevel && validLevels.includes(rawLevel)) {
      console.log(`🛡️ Tier 2.5: Direct level mapping: ${rawLevel}`);
      return rawLevel;
    }
    
    if (userInfo?.gradeLevel) {
      const grade = String(userInfo.gradeLevel).toLowerCase();
      if (grade.includes('k') || grade.includes('pre') || grade.includes('0')) {
        console.log(`🛡️ Tier 2.5: Grade-based mapping: ${grade} → beginner`);
        return 'beginner';
      }
      if (grade.includes('1') || grade.includes('2')) {
        console.log(`🛡️ Tier 2.5: Grade-based mapping: ${grade} → easy`);
        return 'easy';
      }
      if (grade.includes('3') || grade.includes('4')) {
        console.log(`🛡️ Tier 2.5: Grade-based mapping: ${grade} → medium`);
        return 'medium';
      }
      if (grade.includes('5') || grade.includes('6')) {
        console.log(`🛡️ Tier 2.5: Grade-based mapping: ${grade} → hard`);
        return 'hard';
      }
      if (grade.includes('7') || grade.includes('8') || grade.includes('9')) {
        console.log(`🛡️ Tier 2.5: Grade-based mapping: ${grade} → expert`);
        return 'expert';
      }
    }
    
    if (userInfo?.age) {
      const age = parseInt(userInfo.age);
      if (age <= 5) return 'beginner';
      if (age <= 7) return 'easy';
      if (age <= 10) return 'medium';
      if (age <= 13) return 'hard';
      return 'expert';
    }
    
    console.log(`🛡️ Tier 2.5: Using fallback level: ${fallbackLevel}`);
    return fallbackLevel;
    
  } catch (error) {
    console.warn(`⚠️ Tier 2.5: Difficulty mapping error (using fallback): ${error}`);
    return fallbackLevel;
  }
}

function extractSceneWithPremiumTemplate(pageText: string): { scene: string, setting: string, objects: string, secondary_characters: string } {
  try {
    if (!pageText || typeof pageText !== 'string') {
      console.log('🛡️ Tier 2.5: No pageText provided, using fallback scene');
      return {
        scene: 'sitting and reading happily',
        setting: ' a cozy library',
        objects: '',
        secondary_characters: ''
      };
    }

    const sentences = pageText.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    if (sentences.length === 0) {
      console.log('🛡️ Tier 2.5: No valid sentences found, using fallback');
      return {
        scene: 'exploring and learning',
        setting: ' a bright classroom',
        objects: '',
        secondary_characters: ''
      };
    }

    // Score sentences for visual richness
    let bestSentence = sentences[0];
    let bestScore = 0;

    for (const sentence of sentences) {
      let score = 0;
      const lowerSentence = sentence.toLowerCase();
      
      // Action words
      const actionWords = ['running', 'jumping', 'playing', 'reading', 'writing', 'drawing', 'building', 'exploring', 'discovering', 'learning', 'creating', 'making', 'walking', 'sitting', 'standing', 'dancing', 'singing', 'laughing', 'smiling'];
      actionWords.forEach(word => {
        if (lowerSentence.includes(word)) score += 2;
      });
      
      // Setting words
      const settingWords = ['park', 'school', 'home', 'garden', 'playground', 'library', 'classroom', 'kitchen', 'bedroom', 'backyard', 'forest', 'beach', 'mountain', 'city', 'street', 'house', 'room', 'outside', 'inside'];
      settingWords.forEach(word => {
        if (lowerSentence.includes(word)) score += 3;
      });
      
      // Object words
      const objectWords = ['book', 'toy', 'ball', 'bike', 'swing', 'slide', 'tree', 'flower', 'car', 'truck', 'doll', 'game', 'puzzle', 'blocks', 'crayon', 'paper', 'pencil', 'computer', 'tablet', 'phone'];
      objectWords.forEach(word => {
        if (lowerSentence.includes(word)) score += 1;
      });
      
      if (score > bestScore) {
        bestScore = score;
        bestSentence = sentence;
      }
    }

    // Extract components from best sentence
    const result = {
      scene: extractActionFromSentence(bestSentence),
      setting: extractSettingFromSentence(bestSentence), // Note: No previousSetting in extraction phase
      objects: extractObjectsFromSentence(bestSentence, pageText),
      secondary_characters: extractSecondaryCharactersFromSentence(bestSentence)
    };

    console.log('🛡️ Tier 2.5: Scene extraction complete:', result);
    return result;

  } catch (error) {
    console.warn('⚠️ Tier 2.5: Scene extraction error, using fallback:', error);
    return {
      scene: 'reading and learning',
      setting: ' a peaceful study area',
      objects: '',
      secondary_characters: ''
    };
  }
}

function extractActionFromSentence(sentence: string): string {
  const lowerSentence = sentence.toLowerCase();
  const actionMappings = {
    'running': 'running joyfully', 'jumping': 'jumping energetically', 'playing': 'playing happily',
    'reading': 'reading attentively', 'writing': 'writing carefully', 'drawing': 'drawing creatively',
    'building': 'building imaginatively', 'exploring': 'exploring curiously', 'discovering': 'discovering excitedly',
    'learning': 'learning eagerly', 'creating': 'creating artistically', 'making': 'making thoughtfully',
    'walking': 'walking confidently', 'sitting': 'sitting comfortably', 'standing': 'standing proudly',
    'dancing': 'dancing gracefully', 'singing': 'singing joyfully', 'laughing': 'laughing cheerfully',
    'smiling': 'smiling warmly'
  };
  
  for (const [action, description] of Object.entries(actionMappings)) {
    if (lowerSentence.includes(action)) {
      return description;
    }
  }
  
  return 'engaging in activities';
}

// ENHANCED SETTING EXTRACTION WITH NUCLEAR-SAFE MEMORY AND EXPANDED KEYWORDS
function extractSettingFromSentence(sentence: string, previousSetting?: string): string {
  const lowerSentence = sentence.toLowerCase();
  
  // Enhanced setting mappings
  const settingMappings = {
    'park': ' a vibrant community park with green spaces', 
    'school': ' a bright modern school with learning areas', 
    'home': ' a cozy comfortable home with warm atmosphere',
    'garden': ' a beautiful blooming garden with colorful flowers', 
    'playground': ' a fun colorful playground with exciting equipment', 
    'library': ' a quiet peaceful library with rows of books',
    'classroom': ' a bright engaging classroom with educational materials', 
    'kitchen': ' a warm inviting kitchen with cooking areas', 
    'bedroom': ' a comfortable personal bedroom with cozy furnishings',
    'backyard': ' a spacious family backyard with outdoor fun', 
    'forest': ' a magical green forest with tall trees', 
    'beach': ' a sunny sandy beach with ocean waves',
    'mountain': ' a majestic mountain landscape with scenic views', 
    'city': ' a bustling vibrant city with urban energy', 
    'street': ' a friendly neighborhood street with community feel',
    'house': ' a welcoming family house with homey atmosphere', 
    'room': ' a cozy indoor room with comfortable space', 
    'living room': ' a comfortable living room with family seating',
    'dining room': ' a welcoming dining room with eating space',
    'bathroom': ' a clean bright bathroom with modern fixtures',
    'garage': ' an organized garage with storage space',
    'basement': ' a finished basement with recreation area',
    'attic': ' a cozy attic with interesting discoveries',
    'hallway': ' a bright hallway connecting different rooms',
    'porch': ' a charming front porch with welcoming atmosphere',
    'patio': ' a lovely outdoor patio with relaxation space',
    'deck': ' an elevated deck with outdoor entertainment area'
  };
  
  // Check for specific settings first
  for (const [setting, description] of Object.entries(settingMappings)) {
    if (lowerSentence.includes(setting)) {
      return description;
    }
  }
  
  // If no specific setting found, use indoor/outdoor classification
  let isIndoor = false;
  let isOutdoor = false;
  
  // Check for indoor keywords
  for (const keyword of ENHANCED_INDOOR_KEYWORDS) {
    if (lowerSentence.includes(keyword)) {
      isIndoor = true;
      break;
    }
  }
  
  // Check for outdoor keywords
  if (!isIndoor) {
    for (const keyword of ENHANCED_OUTDOOR_KEYWORDS) {
      if (lowerSentence.includes(keyword)) {
        isOutdoor = true;
        break;
      }
    }
  }
  
  // Apply indoor/outdoor classification
  if (isIndoor) {
    return ' a comfortable indoor space with cozy atmosphere';
  } else if (isOutdoor) {
    return ' a beautiful outdoor setting with natural environment';
  }
  
  // Nuclear-safe setting memory: Use previousSetting if available
  if (previousSetting && previousSetting.trim().length > 0) {
    console.log('🛡️ Tier 2.5: Using previous setting memory:', previousSetting);
    return previousSetting;
  }
  
  // Ultimate fallback
  return ' indoor portrait style photo with main character focus';
}

// DYNAMIC COLOR-OBJECT RESOLUTION SYSTEM
function extractObjectsFromSentence(sentence: string, originalPageText?: string): string {
  const lowerSentence = sentence.toLowerCase();
  
  // First try to detect and resolve object + color combinations
  const dynamicObjectColor = detectAndResolveObjectColor(sentence, originalPageText);
  if (dynamicObjectColor) {
    return dynamicObjectColor;
  }
  
  // Enhanced object mappings with more variety
  const objectMappings = {
    'book': ', with colorful educational books nearby', 
    'toy': ', with fun educational toys around',
    'ball': ', with a bright colorful ball', 
    'bike': ', with a shiny bicycle nearby',
    'swing': ', near playground swings', 
    'slide': ', by a colorful playground slide',
    'tree': ', under beautiful shade trees', 
    'flower': ', surrounded by blooming flowers',
    'car': ', near toy cars and vehicles', 
    'truck': ', with toy trucks and construction vehicles',
    'doll': ', with favorite dolls and stuffed animals', 
    'game': ', with educational games and activities',
    'puzzle': ', with colorful learning puzzles', 
    'blocks': ', with building blocks and construction toys',
    'crayon': ', with bright crayons and art supplies', 
    'paper': ', with drawing paper and notebooks',
    'pencil': ', with colorful pencils and writing tools', 
    'computer': ', with educational technology',
    'tablet': ', with learning apps and digital tools', 
    'phone': ', with communication devices',
    // New expanded mappings
    'apple': ', with fresh red apples nearby',
    'banana': ', with yellow bananas around',
    'sandwich': ', with a delicious sandwich to enjoy',
    'cookie': ', with sweet cookies nearby',
    'kite': ', with a colorful kite ready to fly',
    'butterfly': ', with beautiful butterflies around',
    'dog': ', with a friendly dog companion',
    'cat': ', with a playful cat nearby',
    'rabbit': ', with a cute bunny friend',
    'bird': ', with cheerful birds singing',
    'fish': ', with colorful fish swimming',
    'elephant': ', with a gentle elephant friend',
    'lion': ', with a brave lion character',
    'tiger': ', with a friendly tiger companion',
    'bear': ', with a cuddly teddy bear',
    'monkey': ', with a playful monkey friend',
    'horse': ', with a beautiful horse nearby',
    'airplane': ', with toy airplanes soaring',
    'helicopter': ', with a fun helicopter toy',
    'train': ', with an exciting toy train',
    'boat': ', with a colorful toy boat',
    'rocket': ', with an amazing rocket ship',
    'hat': ', wearing a stylish hat',
    'shoes': ', with comfortable shoes on',
    'glasses': ', wearing smart glasses',
    'watch': ', with a cool wristwatch',
    'backpack': ', with a colorful school backpack'
  };
  
  for (const [object, description] of Object.entries(objectMappings)) {
    if (lowerSentence.includes(object)) {
      return description;
    }
  }
  
  return '';
}

// DYNAMIC OBJECT + COLOR DETECTION SYSTEM
function detectAndResolveObjectColor(sentence: string, originalPageText?: string): string {
  const lowerSentence = sentence.toLowerCase();
  let detectedObject = '';
  let detectedColor = '';
  
  // Detect object from expanded array
  const allObjects = [
    ...EXPANDED_OBJECT_ARRAY.food,
    ...EXPANDED_OBJECT_ARRAY.animals,
    ...EXPANDED_OBJECT_ARRAY.vehicles,
    ...EXPANDED_OBJECT_ARRAY.toys,
    ...EXPANDED_OBJECT_ARRAY.tools,
    ...EXPANDED_OBJECT_ARRAY.nature,
    ...EXPANDED_OBJECT_ARRAY.clothing,
    ...EXPANDED_OBJECT_ARRAY.sports,
    ...EXPANDED_OBJECT_ARRAY.electronics,
    ...EXPANDED_OBJECT_ARRAY.furniture
  ];
  
  for (const object of allObjects) {
    if (lowerSentence.includes(object)) {
      detectedObject = object;
      break;
    }
  }
  
  // Detect color from expanded array
  for (const color of EXPANDED_COLOR_ARRAY) {
    if (lowerSentence.includes(color)) {
      detectedColor = color;
      break;
    }
  }
  
  // Check for plural form in original page text if available
  function getPluralForm(object: string, originalText?: string): string {
    if (!originalText) return object;
    const lowerOriginal = originalText.toLowerCase();
    const pluralForm = object + 's';
    return lowerOriginal.includes(pluralForm) ? pluralForm : object;
  }
  
  // If both object and color detected, combine them (compact format with plural support)
  if (detectedObject && detectedColor) {
    const pluralForm = getPluralForm(detectedObject, originalPageText);
    return `${detectedColor} ${pluralForm} nearby`;
  }
  
  // If only object detected, let Runware decide the color (compact format with plural support)
  if (detectedObject) {
    const pluralForm = getPluralForm(detectedObject, originalPageText);
    return `${pluralForm} nearby`;
  }
  
  // If only color detected, let Runware decide what object to color
  if (detectedColor) {
    return '';
  }
  
  return '';
}

function extractSecondaryCharactersFromSentence(sentence: string): string {
  const lowerSentence = sentence.toLowerCase();
  const detectedCharacters = [];
  
  // Family relationship patterns with pronouns (from SecondaryElementDetector.js)
  const familyPatterns = [
    { pattern: /(?:my|your|his|her|their)\s+(mom|mother|mommy|mama)/gi, description: 'caring mother' },
    { pattern: /(?:my|your|his|her|their)\s+(dad|father|daddy|papa)/gi, description: 'supportive father' },
    { pattern: /(?:my|your|his|her|their)\s+(sister|sis)/gi, description: 'playful sister' },
    { pattern: /(?:my|your|his|her|their)\s+(brother|bro)/gi, description: 'energetic brother' },
    { pattern: /(?:my|your|his|her|their)\s+(friend|buddy|pal)/gi, description: 'cheerful friend' }
  ];
  
  // Process pronoun-based family patterns first (more specific)
  familyPatterns.forEach(({ pattern, description }) => {
    const matches = [...lowerSentence.matchAll(pattern)];
    matches.forEach(match => {
      const name = match[1].toLowerCase();
      if (!detectedCharacters.find(c => c.includes(name))) {
        detectedCharacters.push(description);
      }
    });
  });
  
  // If no pronoun-based matches, fall back to simple keyword detection
  if (detectedCharacters.length === 0) {
    const simpleCharacterMappings = {
      'teacher': 'kind helpful teacher',
      'parent': 'loving supportive parent', 
      'family': 'loving family members',
      'classmate': 'happy classmates',
      'student': 'fellow students learning together',
      'children': 'other joyful children',
      'kids': 'other excited kids playing',
      'people': 'friendly community members'
    };
    
    for (const [character, description] of Object.entries(simpleCharacterMappings)) {
      if (lowerSentence.includes(character)) {
        detectedCharacters.push(description);
        break; // Only take first match to avoid overcrowding
      }
    }
  }
  
  // Return compact format (no ", with a" prefix to match current token-efficient format)
  return detectedCharacters.length > 0 ? detectedCharacters[0] + ' nearby' : '';
}

function fillPremiumTemplate(
  difficulty: string,
  userInfo: any,
  scene: string,
  setting: string,
  objects: string,
  secondary_characters: string,
  emotion: string,
  pageText: string,
  avatarIdentity?: any
): string {
  try {
    console.log(`🛡️ Tier 2.5: Filling template for difficulty: ${difficulty}`);
    
    const template = PREMIUM_PROMPT_TEMPLATES[difficulty] || PREMIUM_PROMPT_TEMPLATES.medium;
    
    // NUCLEAR AVATAR MAPPING - Replace complex cultural profile system
    const avatarMapping = getNuclearAvatarMapping(userInfo, difficulty);
    console.log(`🛡️ Tier 2.5: Nuclear avatar mapping applied: ${avatarMapping.character}`);
    
    // Detect cultural contexts with standardized language detection
    const userLanguage = avatarIdentity?.nativeLanguage || userInfo?.language || 'en';
    const skinTone = userInfo?.avatar?.skinTone || '';
    
    const isEnglishDarkSkin = (userLanguage === 'en' || userLanguage === 'english') && 
                              (skinTone.toLowerCase().includes('dark') || 
                               skinTone.toLowerCase().includes('brown') ||
                               skinTone.toLowerCase().includes('black'));
    
    const isFrenchDarkSkin = (userLanguage === 'fr' || userLanguage === 'french') && 
                             (skinTone.toLowerCase().includes('dark') || 
                              skinTone.toLowerCase().includes('brown') ||
                              skinTone.toLowerCase().includes('black'));
    
    const isSpanishDarkSkin = (userLanguage === 'es' || userLanguage === 'spanish') && 
                              (skinTone.toLowerCase().includes('dark') || 
                               skinTone.toLowerCase().includes('brown') ||
                               skinTone.toLowerCase().includes('black'));
    
    const isPortugueseDarkSkin = (userLanguage === 'pt' || userLanguage === 'portuguese') && 
                                 (skinTone.toLowerCase().includes('dark') || 
                                  skinTone.toLowerCase().includes('brown') ||
                                  skinTone.toLowerCase().includes('black'));
    
    let finalMapping = avatarMapping;
    
    // English + Dark Skin: African American hairstyles + facial features
    if (isEnglishDarkSkin) {
      console.log('🛡️ Tier 2.5: Using African American cultural arrays for English + dark skin');
      
      const character = avatarMapping.character === 'child' ? 'boy' : avatarMapping.character;
      const extractedGender = extractGenderFromCharacter(character);
      const genderKey = extractedGender === 'girl' ? 'girls' : 'boys';
      
      finalMapping = {
        ...avatarMapping,
        hair: getRandomItem(HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES[genderKey]),
        features: getRandomItem(HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES)
      };
    }
    // French + Dark Skin: African American hairstyles + facial features  
    else if (isFrenchDarkSkin) {
      console.log('🛡️ Tier 2.5: Using African American cultural arrays for French + dark skin');
      
      const character = avatarMapping.character === 'child' ? 'boy' : avatarMapping.character;
      const extractedGender = extractGenderFromCharacter(character);
      const genderKey = extractedGender === 'girl' ? 'girls' : 'boys';
      
      finalMapping = {
        ...avatarMapping,
        hair: getRandomItem(HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES[genderKey]),
        features: getRandomItem(HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES)
      };
    }
    // Spanish + Dark Skin: African American hairstyles + facial features
    else if (isSpanishDarkSkin) {
      console.log('🛡️ Tier 2.5: Using African American cultural arrays for Spanish + dark skin');
      
      const character = avatarMapping.character === 'child' ? 'boy' : avatarMapping.character;
      const extractedGender = extractGenderFromCharacter(character);
      const genderKey = extractedGender === 'girl' ? 'girls' : 'boys';
      
      finalMapping = {
        ...avatarMapping,
        hair: getRandomItem(HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES[genderKey]),
        features: getRandomItem(HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES)
      };
    }
    // Portuguese + Dark Skin: African American hairstyles + facial features
    else if (isPortugueseDarkSkin) {
      console.log('🛡️ Tier 2.5: Using African American cultural arrays for Portuguese + dark skin');
      
      const character = avatarMapping.character === 'child' ? 'boy' : avatarMapping.character;
      const extractedGender = extractGenderFromCharacter(character);
      const genderKey = extractedGender === 'girl' ? 'girls' : 'boys';
      
      finalMapping = {
        ...avatarMapping,
        hair: getRandomItem(HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES[genderKey]),
        features: getRandomItem(HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES)
      };
    }
    
    // Apply cultural setting enhancement
    const enhancedSetting = applyCulturalSettingEnhancement(setting, userInfo, avatarIdentity);
    
    // Get style framework settings
    const styleSettings = getStyleFrameworkSettings(difficulty);
    
    // Conditional clothing detection from story text
    const clothing = detectClothingFromStory(pageText || scene);
    
    // Use FULL pageText for intelligent processing (truncation happens at final prompt assembly)
    const processedPageText = pageText || 'A story about learning and discovery';
    
    // Get character ethnicity note
    const ethnicity = getCharacterEthnicity(userInfo, avatarIdentity);
    
    // Fill template with nuclear mappings and style framework integration
    let filledTemplate = template
      .replace('{pageText}', processedPageText)
      .replace('{character}', finalMapping.character)
      .replace('{age}', finalMapping.age)
      .replace('{hair}', finalMapping.hair)
      .replace('{features}', finalMapping.features)
      .replace('{scene}', scene)
      .replace('{setting}', enhancedSetting)
      .replace('{objects}', objects)
      .replace('{secondary_characters}', secondary_characters)
      .replace('{emotion}', emotion)
      .replace('{ethnicity}', ethnicity)
      .replace('{frameworkPrompt}', styleSettings.frameworkPrompt);
    
    // Add clothing if detected
    if (clothing) {
      filledTemplate = filledTemplate.replace('{features}', `${finalMapping.features}, wearing ${clothing}`);
    }
    
    console.log(`🛡️ Tier 2.5: Template filled successfully with nuclear mapping`);
    return filledTemplate;
    
  } catch (error) {
    console.error('❌ Tier 2.5: Template filling error:', error);
    return generateEmergencyPrompt(userInfo);
  }
}

function getCharacterEthnicity(userInfo: any, avatarIdentity?: any): string {
  try {
    const language = avatarIdentity?.nativeLanguage || userInfo?.language || 'en';
    const skinTone = userInfo?.avatar?.skinTone || userInfo?.skinTone || '';
    
    // Check for dark skin first (African American representation)
    if (skinTone.toLowerCase().includes('dark') || 
        skinTone.toLowerCase().includes('brown') ||
        skinTone.toLowerCase().includes('black') ||
        skinTone.toLowerCase().includes('ebony') ||
        skinTone.toLowerCase().includes('chocolate')) {
      return "depict character from African American background";
    }
    
    // Language-based ethnicity notes
    if (language === 'es' || language === 'spanish') {
      return "depict character from Spanish/Latino background";
    }
    
    if (language === 'fr' || language === 'french') {
      return "depict character from European background";
    }
    
    if (language === 'zh' || language === 'chinese') {
      return "depict character from Asian background";
    }
    
    if (language === 'hi' || language === 'hindi') {
      return "child of Indian origin";
    }
    
    if (language === 'ar' || language === 'arabic') {
      return "depict character from Middle Eastern background";
    }
    
    if (language === 'pt' || language === 'portuguese') {
      return "depict character from Latin American background";
    }
    
    // Default: no specific ethnicity note for English/Standard American
    return "";
    
  } catch (error) {
    console.warn('⚠️ Tier 2.5: Character ethnicity detection error:', error);
    return "";
  }
}

// AFTER line 805, ADD emergency prompt generator:
function generateEmergencyPrompt(userInfo: any): string {
  const gender = userInfo?.avatar?.type === 'girl' ? 'girl' : 
                userInfo?.avatar?.type === 'boy' ? 'boy' : 'child';
  
  return `An attractive ${gender} in a portrait style photo with main character focus. Beautiful children's book illustration, warm lighting, cheerful atmosphere, high quality, detailed art.`;
}

// ============= HELPER FUNCTIONS =============

// ENHANCED CLOTHING DETECTION WITH COLOR SYSTEM
function detectClothingFromStory(text: string): string {
  if (!text) return '';
  
  // Expanded clothing keywords
  const clothingKeywords = [
    'shirt', 'dress', 'shoes', 'hat', 'jacket', 'sweater', 'pants', 'jeans',
    'skirt', 'uniform', 'pajamas', 'coat', 'scarf', 'boots', 'sneakers',
    'hoodie', 'shorts', 'socks', 'blouse', 'tie', 'apron', 'gloves',
    'cap', 'helmet', 'vest', 'cardigan', 'blazer', 'overalls', 'romper',
    'tunic', 'polo', 'turtleneck', 'tank top', 'sandals', 'slippers',
    'belt', 'suspenders', 'bandana', 'headband', 'mittens', 'raincoat'
  ];
  
  const lowerText = text.toLowerCase();
  
  // Try dynamic clothing + color detection first
  const dynamicClothingColor = detectAndResolveClothingColor(text);
  if (dynamicClothingColor) {
    return dynamicClothingColor;
  }
  
  // Fallback to basic clothing detection
  for (const keyword of clothingKeywords) {
    if (lowerText.includes(keyword)) {
      // Extract clothing context around the keyword
      const sentences = text.split(/[.!?]+/);
      for (const sentence of sentences) {
        if (sentence.toLowerCase().includes(keyword)) {
          // Add random color if no color specified
          const randomColor = EXPANDED_COLOR_ARRAY[Math.floor(Math.random() * EXPANDED_COLOR_ARRAY.length)];
          return `a ${randomColor} ${keyword}`;
        }
      }
    }
  }
  
  return '';
}

// DYNAMIC CLOTHING + COLOR DETECTION SYSTEM
function detectAndResolveClothingColor(text: string): string {
  const lowerText = text.toLowerCase();
  let detectedClothing = '';
  let detectedColor = '';
  
  // Detect clothing type
  const clothingTypes = ['dress', 'shirt', 'pants', 'jacket', 'sweater', 'shoes', 'hat', 'shorts', 'skirt', 'hoodie', 'jeans', 'boots', 'sneakers', 'coat', 'scarf', 'gloves'];
  
  for (const clothing of clothingTypes) {
    if (lowerText.includes(clothing)) {
      detectedClothing = clothing;
      break;
    }
  }
  
  // Detect color
  for (const color of EXPANDED_COLOR_ARRAY) {
    if (lowerText.includes(color)) {
      detectedColor = color;
      break;
    }
  }
  
  // If both detected, combine them (no restrictions - allow any color for any clothing)
  if (detectedClothing && detectedColor) {
    return `a ${detectedColor} ${detectedClothing}`;
  }
  
  // If only clothing detected, let Runware decide the color
  if (detectedClothing) {
    return `a ${detectedClothing}`;
  }
  
  // If only color detected, let Runware decide what clothing to color
  if (detectedColor) {
    return '';
  }
  
  return '';
}

function truncatePageText(text: string, difficulty: string): string {
  if (!text) return '';
  
  // Beginner/Easy: Use full pageText at beginning
  if (difficulty === 'beginner' || difficulty === 'easy') {
    return text;
  }
  
  // Medium/Hard/Expert: Truncate pageText for end positioning
  const maxLength = difficulty === 'medium' ? 100 : difficulty === 'hard' ? 80 : 60;
  
  if (text.length <= maxLength) {
    return text;
  }
  
  // Truncate at word boundary
  const truncated = text.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  if (lastSpaceIndex > maxLength * 0.7) { // Only truncate at word if it's not too short
    return truncated.substring(0, lastSpaceIndex) + '...';
  }
  
  return truncated + '...';
}

// ============= FINAL PROMPT TRUNCATION (TIER 2.5 ENHANCEMENT) =============
function truncateFinalPrompt(prompt: string, difficulty: string): string {
  if (!prompt) return prompt;
  
  // Runware API has practical limits - apply intelligent truncation
  // Expert/Hard levels can have longer prompts, beginners get shorter ones
  const maxLength = difficulty === 'expert' ? 800 : 
                   difficulty === 'hard' ? 700 :
                   difficulty === 'medium' ? 600 : 500;
  
  if (prompt.length <= maxLength) {
    return prompt;
  }
  
  console.log(`🛡️ Tier 2.5: Final prompt truncation applied. Original: ${prompt.length} chars, Max: ${maxLength} chars`);
  
  // Smart truncation: preserve key elements, truncate narrative portion
  // Split the prompt to identify the story text portion (usually after pageText)
  const parts = prompt.split('. ');
  let preservedParts = [];
  let narrativeParts = [];
  let totalLength = 0;
  
  // Identify parts to preserve (character descriptions, settings, etc.)
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const isCharacterDesc = part.includes('age ') || part.includes('hair') || part.includes('wearing') || part.includes('ethnicity');
    const isSettingDesc = part.includes('in ') && (part.includes('room') || part.includes('park') || part.includes('school'));
    const isStyleDesc = part.includes('illustration') || part.includes('art') || part.includes('painting');
    
    if (isCharacterDesc || isSettingDesc || isStyleDesc) {
      preservedParts.push(part);
      totalLength += part.length + 2; // +2 for '. '
    } else {
      narrativeParts.push(part);
    }
  }
  
  // Add narrative parts until we hit the limit
  let remainingLength = maxLength - totalLength;
  let finalNarrativeParts = [];
  
  for (const narrativePart of narrativeParts) {
    if (narrativePart.length + 2 <= remainingLength) {
      finalNarrativeParts.push(narrativePart);
      remainingLength -= (narrativePart.length + 2);
    } else {
      // Truncate this part and stop
      if (remainingLength > 50) { // Only add if we have reasonable space
        const truncatedPart = narrativePart.substring(0, remainingLength - 10);
        const lastSpaceIndex = truncatedPart.lastIndexOf(' ');
        if (lastSpaceIndex > truncatedPart.length * 0.7) {
          finalNarrativeParts.push(truncatedPart.substring(0, lastSpaceIndex) + '...');
        }
      }
      break;
    }
  }
  
  // Reassemble the prompt: preserved parts + truncated narrative
  const finalPrompt = [...preservedParts, ...finalNarrativeParts].join('. ');
  
  console.log(`🛡️ Tier 2.5: Smart truncation completed. Final: ${finalPrompt.length} chars`);
  return finalPrompt;
}

function getRandomItem(array: string[]): string {
  if (!array || array.length === 0) return 'default';
  return array[Math.floor(Math.random() * array.length)];
}

function extractGenderFromCharacter(character: string): string {
  if (!character || typeof character !== 'string') return 'child';
  const lowerChar = character.toLowerCase();
  if (lowerChar.includes('girl')) return 'girl';
  if (lowerChar.includes('boy')) return 'boy';
  return 'child';
}

function getAgeFromDifficulty(difficulty: string): string {
  const ageMap = {
    'beginner': 'age 5-6',
    'easy': 'age 7-8', 
    'medium': 'age 9-10',
    'hard': 'age 11-12',
    'expert': 'age 13-14'
  };
  return ageMap[difficulty] || 'age 9-10';
}

// Import style frameworks from shared location
function getStyleFrameworkSettings(difficulty: string): { frameworkPrompt: string, steps: number, CFGScale: number } {
  // Map difficulties to style frameworks - levels 0-2 use Contemporary, levels 3-4 use 2.9D
  const frameworkMap = {
    'beginner': 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, painterly texture quality, warm natural lighting',
    'easy': 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, painterly texture quality, warm natural lighting',
    'medium': 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, painterly texture quality, warm natural lighting',
    'hard': '2.9D rendered illustration with golden hour volumetric lighting, SSS, AO, GI, beautiful child characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, child-friendly, diverse representation, warm natural lighting',
    'expert': '2.9D rendered illustration with golden hour volumetric lighting, SSS, AO, GI, beautiful child characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, child-friendly, diverse representation, warm natural lighting'
  };
  
  return {
    frameworkPrompt: frameworkMap[difficulty] || frameworkMap.medium,
    steps: 25,
    CFGScale: 8
  };
}

// CULTURAL LANDMARKS ARRAYS FOR CONTEXT-AWARE SETTINGS
const CULTURAL_LANDMARKS = {
  spanish: ["with Spanish architecture", "in vibrant plaza", "near colorful market", "with Mediterranean backdrop", "in sunny courtyard"],
  french: ["near Eiffel Tower", "by Seine River", "near Louvre", "in charming café district", "with Parisian backdrop"],
  chinese: ["with traditional pagodas", "near Great Wall", "with ancient temples", "in bamboo garden", "with oriental architecture"],
  hindi: ["near Taj Mahal", "with palace elements", "in colorful market", "with Indian architecture", "in vibrant courtyard"],
  arabic: ["with Middle Eastern domes", "in ornate courtyard", "with mosaic patterns", "near ancient architecture", "with desert backdrop"]
};

function applyCulturalSettingEnhancement(baseSetting: string, userInfo: any, avatarIdentity?: any): string {
  try {
    const language = avatarIdentity?.nativeLanguage || userInfo?.language || 'en';
    
    // Get cultural landmarks for the language
    const landmarks = getCulturalLandmarks(language);
    if (landmarks.length > 0) {
      const randomLandmark = landmarks[Math.floor(Math.random() * landmarks.length)];
      
      // Context-aware enhancement - parse story context and add landmarks
      if (baseSetting.toLowerCase().includes('park')) {
        return baseSetting.replace('park', `park ${randomLandmark}`);
      }
      if (baseSetting.toLowerCase().includes('school')) {
        return baseSetting.replace('school', `school ${randomLandmark}`);
      }
      if (baseSetting.toLowerCase().includes('home')) {
        return baseSetting.replace('home', `home ${randomLandmark}`);
      }
      
      // Generic enhancement fallback
      return `${baseSetting} ${randomLandmark}`;
    }
    
    return baseSetting;
    
  } catch (error) {
    console.warn('⚠️ Tier 2.5: Cultural setting enhancement error:', error);
    return baseSetting;
  }
}

function getCulturalLandmarks(language: string): string[] {
  if (language === 'es' || language === 'spanish') return CULTURAL_LANDMARKS.spanish;
  if (language === 'fr' || language === 'french') return CULTURAL_LANDMARKS.french;  
  if (language === 'zh' || language === 'chinese') return CULTURAL_LANDMARKS.chinese;
  if (language === 'hi' || language === 'hindi') return CULTURAL_LANDMARKS.hindi;
  if (language === 'ar' || language === 'arabic') return CULTURAL_LANDMARKS.arabic;
  return [];
}

function detectCulturalProfile(userInfo: any, avatarIdentity?: any): string {
  try {
    const language = avatarIdentity?.nativeLanguage || userInfo?.language || 'en';
    const skinTone = userInfo?.avatar?.skinTone || userInfo?.skinTone || '';
    
    console.log(`🛡️ Tier 2.5: Detecting cultural profile - Language: ${language}, Skin: ${skinTone}`);
    
    // African American detection
    if (skinTone.toLowerCase().includes('dark') || 
        skinTone.toLowerCase().includes('brown') ||
        skinTone.toLowerCase().includes('black') ||
        skinTone.toLowerCase().includes('ebony') ||
        skinTone.toLowerCase().includes('chocolate')) {
      console.log('🛡️ Tier 2.5: African American profile detected via skin tone');
      return 'African American';
    }
    
    // Language-based detection with real ethnicities
    if (language === 'es' || language === 'spanish') {
      console.log('🛡️ Tier 2.5: Spanish/Latino ethnicity detected via language');
      return 'Spanish/Latino ethnicity';
    }
    
    if (language === 'fr' || language === 'french') {
      console.log('🛡️ Tier 2.5: European ethnicity detected via language');
      return 'European ethnicity';
    }
    
    if (language === 'zh' || language === 'chinese') {
      console.log('🛡️ Tier 2.5: East Asian ethnicity detected via language');
      return 'East Asian ethnicity';
    }
    
    if (language === 'hi' || language === 'hindi') {
      console.log('🛡️ Tier 2.5: South Asian ethnicity detected via language');
      return 'South Asian ethnicity';
    }
    
    if (language === 'ar' || language === 'arabic') {
      console.log('🛡️ Tier 2.5: Middle Eastern ethnicity detected via language');
      return 'Middle Eastern ethnicity';
    }
    
    if (language === 'pt' || language === 'portuguese') {
      console.log('🛡️ Tier 2.5: Latin American ethnicity detected via language');
      return 'Latin American ethnicity';
    }
    
    console.log('🛡️ Tier 2.5: Standard American profile (default)');
    return 'Standard American';
    
  } catch (error) {
    console.warn('⚠️ Tier 2.5: Cultural detection error, using default:', error);
    return 'Standard American';
  }
}

function detectEmotionFromText(text: string): string {
  try {
    if (!text || typeof text !== 'string') return ''; // Enhanced: Return empty string for fallback
    
    const lowerText = text.toLowerCase();
    
    // Positive emotions
    if (lowerText.includes('happy') || lowerText.includes('joy') || lowerText.includes('excited') || 
        lowerText.includes('celebration') || lowerText.includes('party') || lowerText.includes('fun')) {
      return 'Cheerful and celebratory atmosphere';
    }
    
    if (lowerText.includes('peaceful') || lowerText.includes('calm') || lowerText.includes('quiet') ||
        lowerText.includes('serene') || lowerText.includes('tranquil')) {
      return 'Peaceful and serene atmosphere';
    }
    
    if (lowerText.includes('adventure') || lowerText.includes('explore') || lowerText.includes('discover') ||
        lowerText.includes('journey') || lowerText.includes('quest')) {
      return 'Adventurous and curious atmosphere';
    }
    
    if (lowerText.includes('learn') || lowerText.includes('study') || lowerText.includes('school') ||
        lowerText.includes('education') || lowerText.includes('knowledge')) {
      return 'Educational and inspiring atmosphere';
    }
    
    // Default positive
    return 'Warm and welcoming atmosphere';
    
  } catch (error) {
    console.warn('⚠️ Tier 2.5: Emotion detection error:', error);
    return 'Positive and uplifting atmosphere';
  }
}

// ============= MAIN EDGE FUNCTION =============

Deno.serve(async (req: Request) => {
  console.log(`🛡️ Tier 2.5: ${req.method} ${req.url}`);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }
  
  try {
    let { pageText, userInfo, characterData, sessionId } = await req.json();
    
    // COMPREHENSIVE PARAMETER VALIDATION - Add missing defaults
    if (!pageText) {
      pageText = 'An attractive child in a bright cheerful environment';
      console.log('🛡️ Undefined pageText - using default:', pageText);
    }
    
    if (!userInfo) {
      userInfo = { avatar: { skinTone: 'medium' } };
      console.log('🛡️ Undefined userInfo - using default:', userInfo);
    }
    
    if (!userInfo.avatar) {
      userInfo.avatar = { skinTone: 'medium' };
      console.log('🛡️ Undefined avatarIdentity - using default skinTone: medium');
    }
    
    console.log('🛡️ Tier 2.5: Processing request with nuclear independence');
    console.log('🎭 Tier 2.5: Character consistency data received:', {
      hasCharacterData: !!characterData,
      sessionId: sessionId,
      characterSeed: characterData?.seed || 'none'
    });
    
    // Extract scene components with complete placeholder support
    const { scene, setting, objects, secondary_characters } = extractSceneWithPremiumTemplate(pageText);
    
    // Map difficulty level
    const difficulty = mapDifficultyInline(userInfo);
    
    // Detect emotion
    const emotion = detectEmotionFromText(pageText);
    
    // Extract avatarIdentity for consistent parameter passing
    const avatarIdentity = userInfo?.avatarIdentity || null;
    
    // Fill premium template with all placeholders including page text
    const prompt = fillPremiumTemplate(difficulty, userInfo, scene, setting, objects, secondary_characters, emotion, pageText, avatarIdentity);
    
    // Generate avatar mapping with character consistency enhancement
    const avatarMapping = enhanceNuclearMappingWithConsistency(userInfo, difficulty, characterData, sessionId);
    const avatarType = userInfo?.avatar?.type || 'prefer-not-to-answer';
    const pageNumber = userInfo?.pageNumber || 1; // Default to page 1 for Tier 2.5
    const culturalProfile = detectCulturalProfileForNegatives(userInfo, avatarIdentity);
    const negativePrompt = generateNuclearNegativePrompt(culturalProfile, avatarType, difficulty, pageNumber);
    
    // Get style framework settings  
    const styleSettings = getStyleFrameworkSettings(difficulty);
    
    console.log('🛡️ Tier 2.5: Connecting to Runware API via WebSocket...');
    
    // Connect to Runware WebSocket API
    const ws = new WebSocket('wss://ws-api.runware.ai/v1');
    
    return new Promise((resolve) => {
      let isResolved = false;
      
      const resolveOnce = (response: Response) => {
        if (!isResolved) {
          isResolved = true;
          ws.close();
          resolve(response);
        }
      };
      
      ws.onopen = () => {
        console.log('🛡️ Tier 2.5: WebSocket connected, authenticating...');
        
        // Send authentication
        const authMessage = [{
          taskType: "authentication",
          apiKey: Deno.env.get('RUNWARE_API_KEY')
        }];
        
        ws.send(JSON.stringify(authMessage));
      };
      
      ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          console.log('🛡️ Tier 2.5: Received WebSocket response:', response);
          
          if (response.error || response.errors) {
            console.error('❌ Tier 2.5: API error:', response);
            const errorMessage = response.errorMessage || response.errors?.[0]?.message || 'Unknown API error';
            resolveOnce(createCorsErrorResponse(errorMessage, 500));
            return;
          }
          
          if (response.data) {
            for (const item of response.data) {
              if (item.taskType === "authentication") {
                console.log('🛡️ Tier 2.5: Authentication successful, generating image...');
                
                // Apply final prompt truncation (TIER 2.5 Enhancement)
                const finalPrompt = truncateFinalPrompt(prompt, difficulty);
                
                // Send image generation request
                const imageMessage = [{
                  taskType: "imageInference",
                  taskUUID: crypto.randomUUID(),
                  positivePrompt: finalPrompt,
                  negativePrompt: negativePrompt,
                  width: 1024,
                  height: 1024,
                  model: "runware:100@1",
                  numberResults: 1,
                  outputFormat: "WEBP",
                  steps: styleSettings.steps,
                  CFGScale: styleSettings.CFGScale
                }];
                
                ws.send(JSON.stringify(imageMessage));
                
              } else if (item.taskType === "imageInference") {
                console.log('🛡️ Tier 2.5: Image generation successful!');
                
                 resolveOnce(createCorsResponse({
                   success: true,
                   imageURL: item.imageURL,
                   prompt: finalPrompt,
                   negativePrompt: negativePrompt,
                   difficulty: difficulty,
                   culturalProfile: culturalProfile,
                   tier: '2.5 Nuclear Independence + Character Consistency',
                   placeholders: {
                     objects: objects || 'none',
                     secondary_characters: secondary_characters || 'none'
                   },
                   characterConsistency: {
                     sessionId: sessionId,
                     characterSeed: characterData?.seed || 'none',
                     enhancementApplied: !!(characterData && characterData.seed),
                     source: avatarMapping?.source || 'nuclear-mapping'
                   }
                 }));
              }
            }
          }
        } catch (parseError) {
          console.error('❌ Tier 2.5: Response parsing error:', parseError);
          resolveOnce(createCorsErrorResponse('Failed to parse API response', 500));
        }
      };
      
      ws.onerror = (error) => {
        console.error('❌ Tier 2.5: WebSocket error:', error);
        console.log('🔄 Tier 2.5: Attempting HTTP fallback...');
        
        // HTTP FALLBACK: Try Runware REST API
        attemptHttpFallback(prompt, negativePrompt, styleSettings, sessionId, characterData, avatarMapping, difficulty, culturalProfile, objects, secondary_characters)
          .then(result => {
            if (result.success) {
              resolveOnce(result);
            } else {
              resolveOnce(createCorsErrorResponse('WebSocket and HTTP fallback both failed', 500));
            }
          })
          .catch(() => {
            resolveOnce(createCorsErrorResponse('WebSocket connection failed and HTTP fallback unavailable', 500));
          });
      };
      
      ws.onclose = (event) => {
        console.log('🛡️ Tier 2.5: WebSocket closed:', event.code, event.reason);
        if (!isResolved) {
          console.log('🔄 Tier 2.5: Attempting HTTP fallback due to unexpected close...');
          
          // HTTP FALLBACK: Try Runware REST API
          attemptHttpFallback(prompt, negativePrompt, styleSettings, sessionId, characterData, avatarMapping, difficulty, culturalProfile, objects, secondary_characters)
            .then(result => {
              if (result.success) {
                resolveOnce(result);
              } else {
                resolveOnce(createCorsErrorResponse('WebSocket closed and HTTP fallback failed', 500));
              }
            })
            .catch(() => {
              resolveOnce(createCorsErrorResponse('WebSocket connection closed and HTTP fallback unavailable', 500));
            });
        }
      };
      
      // Timeout after 30 seconds
      setTimeout(() => {
        if (!isResolved) {
          console.error('❌ Tier 2.5: Request timeout, trying HTTP fallback...');
          
          // HTTP FALLBACK: Try Runware REST API
          attemptHttpFallback(prompt, negativePrompt, styleSettings, sessionId, characterData, avatarMapping, difficulty, culturalProfile, objects, secondary_characters)
            .then(result => {
              if (result.success) {
                resolveOnce(result);
              } else {
                resolveOnce(createCorsErrorResponse('Request timeout and HTTP fallback failed', 408));
              }
            })
            .catch(() => {
              resolveOnce(createCorsErrorResponse('Request timeout', 408));
            });
        }
      }, 30000);
      
      // HTTP FALLBACK FUNCTION
      async function attemptHttpFallback(prompt, negativePrompt, styleSettings, sessionId, characterData, avatarMapping, difficulty, culturalProfile, objects, secondary_characters) {
        try {
          console.log('🌐 Tier 2.5: Attempting HTTP API fallback...');
          
          const httpResponse = await fetch('https://api.runware.ai/v1', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('RUNWARE_API_KEY')}`
            },
            body: JSON.stringify([
              {
                taskType: "authentication", 
                apiKey: Deno.env.get('RUNWARE_API_KEY')
              },
              {
                taskType: "imageInference",
                taskUUID: crypto.randomUUID(),
                positivePrompt: prompt,
                negativePrompt: negativePrompt,
                height: 512,
                width: 512, 
                model: "runware:100@1",
                steps: styleSettings.steps,
                CFGScale: styleSettings.CFGScale,
                outputFormat: "WEBP"
              }
            ])
          });
          
          if (!httpResponse.ok) {
            throw new Error(`HTTP ${httpResponse.status}: ${httpResponse.statusText}`);
          }
          
          const httpResult = await httpResponse.json();
          const imageData = httpResult.data?.find(item => item.taskType === 'imageInference');
          
          if (imageData?.imageURL) {
            console.log('✅ Tier 2.5: HTTP fallback successful!');
            return createCorsResponse({
              success: true,
              imageURL: imageData.imageURL,
              prompt: prompt,
              negativePrompt: negativePrompt,
              difficulty: difficulty,
              culturalProfile: culturalProfile,
              tier: '2.5 Nuclear Independence + Character Consistency (HTTP)',
              placeholders: {
                objects: objects || 'none',
                secondary_characters: secondary_characters || 'none'
              },
              characterConsistency: {
                sessionId: sessionId,
                characterSeed: characterData?.seed || 'none',
                enhancementApplied: !!(characterData && characterData.seed),
                source: avatarMapping?.source || 'nuclear-mapping'
              }
            });
          } else {
            throw new Error('No image URL in HTTP response');
          }
          
        } catch (httpError) {
          console.error('❌ Tier 2.5: HTTP fallback failed:', httpError);
          return { success: false, error: httpError.message };
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Tier 2.5: Main function error:', error);
    return createCorsErrorResponse(error.message || 'Internal server error', 500);
  }
});