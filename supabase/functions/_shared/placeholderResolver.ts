/**
 * Advanced Placeholder Resolution for Edge Functions
 * Consolidated from frontend with MicroContext and seed-based resolution
 * Single source of truth for all placeholder logic
 */

import type { UserInfo } from "./types/index.ts";
import { getAvatar } from "./types/index.ts";

export interface MicroContext {
  userInfo?: UserInfo;
  pageText?: string;
  seed?: Record<string, any>;
}

export const FALLBACK_POOLS = {
  animal: ["cat", "dog", "bird", "rabbit", "duck", "pig", "cow", "horse", "fish", "bear", "sheep", "goat", "chicken", "turkey", "mouse", "hamster", "guinea pig", "turtle", "frog", "lizard", "snake", "butterfly", "bee", "ladybug", "ant", "spider", "crab", "lobster", "octopus", "whale", "dolphin", "seal", "penguin", "flamingo", "parrot", "canary", "peacock", "swan", "goose", "rooster", "lamb", "calf", "puppy", "kitten", "chick", "bunny", "piglet", "foal", "cubs", "panda", "koala"],
  animalType: ["owl", "fox", "bear", "deer", "rabbit", "wolf", "eagle", "squirrel", "raccoon", "badger", "otter", "beaver", "mole", "hedgehog", "chipmunk", "skunk", "opossum", "porcupine", "weasel", "ferret", "mink", "lynx", "bobcat", "cougar", "panther", "jaguar", "leopard", "cheetah", "lion", "tiger", "elephant", "giraffe", "zebra", "hippo", "rhino", "moose", "elk", "caribou", "bison", "buffalo", "antelope", "gazelle", "impala", "wildebeest", "gnu", "yak", "ibex", "chamois", "mountain goat", "bighorn sheep"],
  monsterType: ["dragon", "troll", "giant", "ogre", "goblin", "beast", "wizard", "creature", "demon", "ghost", "phantom", "specter", "wraith", "banshee", "vampire", "werewolf", "zombie", "skeleton", "mummy", "ghoul", "lich", "necromancer", "sorcerer", "warlock", "witch", "cyclops", "minotaur", "centaur", "chimera", "griffin", "phoenix", "unicorn", "pegasus", "basilisk", "hydra", "kraken", "leviathan", "behemoth", "golem", "gargoyle", "imp", "pixie", "sprite", "fairy", "elf", "dwarf", "orc", "hobgoblin", "kobold", "gnome"],
  food: ["pancakes", "apple", "sandwich", "cookie", "pizza", "noodles", "cake", "milk", "bread", "water", "banana", "orange", "grapes", "strawberry", "blueberry", "cherry", "peach", "pear", "plum", "mango", "pineapple", "watermelon", "cantaloupe", "kiwi", "lemon", "lime", "avocado", "tomato", "carrot", "broccoli", "spinach", "lettuce", "cucumber", "pepper", "onion", "garlic", "potato", "rice", "pasta", "cheese", "yogurt", "ice cream", "chocolate", "candy", "honey", "jam", "butter", "eggs", "chicken", "fish"],
  setting: ["forest", "park", "garden", "classroom", "kitchen", "playground", "house", "farm", "school", "home", "library", "museum", "zoo", "beach", "mountain", "lake", "river", "meadow", "field", "barn", "stable", "treehouse", "castle", "palace", "cottage", "cabin", "tent", "cave", "tunnel", "bridge", "tower", "lighthouse", "pier", "dock", "harbor", "village", "town", "city", "market", "store", "bakery", "hospital", "church", "theater", "circus", "carnival", "amusement park", "island", "desert", "jungle"],
  object: ["ball", "book", "box", "car", "toy", "tree", "chair", "table", "bed", "lamp", "clock", "mirror", "picture", "flower", "plant", "key", "door", "window", "hat", "shoe", "bag", "bottle", "cup", "plate", "spoon", "fork", "knife", "pen", "pencil", "paper", "scissors", "glue", "tape", "string", "rope", "chain", "ring", "necklace", "bracelet", "watch", "phone", "computer", "camera", "guitar", "piano", "drum", "flute", "trumpet", "violin", "microphone"],
  action: ["play", "run", "go", "come", "look", "jump", "walk", "skip", "hop", "dance", "sing", "laugh", "smile", "cry", "shout", "whisper", "talk", "listen", "read", "write", "draw", "paint", "color", "build", "make", "create", "fix", "help", "share", "give", "take", "find", "search", "explore", "discover", "learn", "teach", "study", "practice", "try", "climb", "swim", "fly", "drive", "ride", "sail", "float", "dig", "plant", "grow"],
  adjective: ["brave", "clever", "kind", "happy", "big", "little", "good", "funny", "pretty", "new", "old", "young", "tall", "short", "wide", "narrow", "thick", "thin", "heavy", "light", "fast", "slow", "loud", "quiet", "bright", "dark", "colorful", "plain", "smooth", "rough", "soft", "hard", "warm", "cool", "hot", "cold", "wet", "dry", "clean", "dirty", "fresh", "stale", "sweet", "sour", "bitter", "salty", "spicy", "mild", "strong", "weak"],
  friend: ["Sam", "Alex", "Riley", "Taylor", "Jordan", "Casey", "Kim", "Lee", "Pat", "Jo", "Chris", "Jamie", "Morgan", "Avery", "Quinn", "Sage", "Rowan", "Finley", "Emery", "Hayden", "Parker", "Reese", "Blake", "Drew", "Sage", "River", "Sky", "Rain", "Storm", "Brook", "Clay", "Reed", "Vale", "Bay", "Wren", "Fox", "Sage", "Lane", "West", "North", "East", "South", "Blue", "Gray", "Green", "Rose", "Lily", "Iris", "Jade", "Ruby"],
  color: ["red", "blue", "yellow", "black", "brown", "white", "green", "orange", "purple", "pink", "gray", "silver", "gold", "bronze", "copper", "violet", "indigo", "turquoise", "teal", "cyan", "magenta", "maroon", "navy", "lime", "olive", "aqua", "fuchsia", "crimson", "scarlet", "ruby", "emerald", "sapphire", "amber", "ivory", "pearl", "coral", "salmon", "peach", "lavender", "lilac", "mint", "sage", "forest", "jungle", "ocean", "sky", "sunset", "sunrise", "rainbow", "moonlight"],
  forestType: ["magic", "deep", "green", "quiet", "old", "big", "enchanted", "dark", "sunny", "mysterious", "ancient", "hidden", "secret", "forbidden", "whispering", "singing", "dancing", "glowing", "sparkling", "shimmering", "misty", "foggy", "shadowy", "peaceful", "serene", "tranquil", "wild", "untamed", "pristine", "virgin", "primeval", "tropical", "temperate", "deciduous", "coniferous", "bamboo", "rainforest", "jungle", "woodland", "grove", "thicket", "copse", "stand", "glade", "clearing", "meadow", "dell", "hollow", "valley", "ravine"],
  weatherType: ["sunny", "rainy", "cloudy", "windy", "clear", "nice", "stormy", "snowy", "foggy", "misty", "hazy", "humid", "dry", "hot", "cold", "warm", "cool", "mild", "pleasant", "beautiful", "perfect", "lovely", "gorgeous", "wonderful", "glorious", "bright", "brilliant", "radiant", "dazzling", "sparkling", "crisp", "fresh", "breezy", "gusty", "calm", "still", "peaceful", "serene", "balmy", "tropical", "arctic", "freezing", "scorching", "sweltering", "chilly", "frosty", "icy", "slippery", "wet", "damp"],
  placeType: ["park", "forest", "garden", "field", "yard", "beach", "mountain", "hill", "valley", "meadow", "prairie", "plain", "desert", "oasis", "jungle", "rainforest", "swamp", "marsh", "wetland", "lake", "pond", "river", "stream", "creek", "waterfall", "spring", "well", "cave", "cavern", "grotto", "cliff", "canyon", "gorge", "plateau", "mesa", "butte", "ridge", "peak", "summit", "slope", "trail", "path", "road", "highway", "bridge", "tunnel", "island", "peninsula", "bay", "cove"]
} as const;

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function cleanup(text: string): string {
  return text
    .replace(/\{[^}]+\}/g, "") // strip unresolved tokens
    .replace(/\s{2,}/g, " ") // collapse multiple spaces
    .replace(/\s+([,.!?:;])/g, "$1") // remove space before punctuation
    .replace(/\s+$/, "") // trim trailing spaces
    .replace(/^\s+/, "") // trim leading spaces
    .replace(/\.\s*\./g, ".") // remove double periods
    .replace(/,\s*,/g, ",") // remove double commas
    .replace(/\ba\s+a\s+/gi, "a ") // fix "a a" duplication bug
    .replace(/\ban\s+an\s+/gi, "an ") // fix "an an" duplication bug
    .replace(/\bthe\s+the\s+/gi, "the ") // fix "the the" duplication bug
    .trim();
}

function applyTheyGrammarFixes(text: string): string {
  return text
    .replace(/\bthey\s+is\b/gi, "they are")
    .replace(/\bthey\s+was\b/gi, "they were")  
    .replace(/\bthey\s+has\b/gi, "they have")
    .replace(/\bthey\s+does\b/gi, "they do")
    .replace(/\bthey\s+goes\b/gi, "they go")
    .replace(/\bthey\s+explores\b/gi, "they explore");
}

function applyHeShePronounFixes(text: string): string {
  return text
    .replace(/\b(he|she)\s+have\b/gi, (match, pronoun) => `${pronoun} has`)
    .replace(/\b(he|she)\s+are\b/gi, (match, pronoun) => `${pronoun} is`)
    .replace(/\b(he|she)\s+were\b/gi, (match, pronoun) => `${pronoun} was`)
    .replace(/\b(he|she)\s+do\b/gi, (match, pronoun) => `${pronoun} does`);
}

function firstName(name?: string): string | undefined {
  if (!name) return undefined;
  const parts = name.trim().split(/\s+/);
  return parts[0];
}

export function derivePronoun(userInfo?: UserInfo): string {
  const avatar = getAvatar(userInfo);
  switch (avatar?.type) {
    case "boy": return "he";
    case "girl": return "she"; 
    case "prefer-not-to-answer": return "they";
    default: return "they";
  }
}

function deriveCompleteGenderInfo(userInfo?: UserInfo): string {
  const avatar = getAvatar(userInfo);
  switch (avatar?.type) {
    case "boy": return "boy. Use he/him/his pronouns";
    case "girl": return "girl. Use she/her/hers pronouns"; 
    case "prefer-not-to-answer": return "child. Use they/them/their pronouns";
    default: return "child. Use they/them/their pronouns";
  }
}

export function resolveCanonicalPlaceholders(text: string, userInfo: UserInfo): string {
  const map: Record<string, string> = {};
  
  // Always provide fallbacks for canonical placeholders - use user data if available, fallbacks otherwise
  map.userName = userInfo.name ? (firstName(userInfo.name) || userInfo.name) : "Child";
  map.favoriteColor = userInfo.favoriteColor || pick(FALLBACK_POOLS.color);
  map.favoriteAnimal = userInfo.favoriteAnimal || pick(FALLBACK_POOLS.animal);
  map.favoriteFood = userInfo.favoriteFood || pick(FALLBACK_POOLS.food);
  map.hobbies = userInfo.hobbies || pick(FALLBACK_POOLS.action);
  map.specialRequest = userInfo.specialRequest || "";

  // Enhanced character name extraction from special request
  let extractedCharacterNames: string[] = [];
  if (userInfo.specialRequest) {
    try {
      // Try to extract character names from special request
      extractedCharacterNames = extractCharacterNamesFromRequest(userInfo.specialRequest);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn('Character name extraction failed:', errorMessage);
    }
  }

  let out = text;
  for (const [k, v] of Object.entries(map)) {
    if (v) {
      out = out.replace(new RegExp(`\\{${k}\\}`, "g"), v);
    }
  }
  
  // Apply character name substitutions if extracted
  if (extractedCharacterNames.length > 0) {
    out = applyCharacterNameSubstitutions(out, extractedCharacterNames);
  }
  
  return out; // Don't cleanup here - micro placeholders still need processing
}

export function resolveMicroPlaceholders(text: string, ctx: MicroContext = {}): string {
  const { userInfo, seed } = ctx;
  const pronoun = derivePronoun(userInfo);
  
  const mappings: Record<string, string> = {};
  
  // Essential pronoun - always needed for grammar
  mappings.pronoun = pronoun;
  
  // Only add specific placeholders if we have user data or seed data
  if (seed?.animal || userInfo?.favoriteAnimal) {
    mappings.animal = seed?.animal || userInfo?.favoriteAnimal;
  }
  
  if (seed?.animalType) {
    mappings.animalType = seed.animalType;
  }
  
  if (seed?.monsterType) {
    mappings.monsterType = seed.monsterType;
  }
  
  if (seed?.food || userInfo?.favoriteFood) {
    mappings.food = seed?.food || userInfo?.favoriteFood;
  }
  
  if (seed?.setting) {
    mappings.setting = seed.setting;
  }
  
  if (seed?.object) {
    mappings.object = seed.object;
  }
  
  if (seed?.action) {
    mappings.action = seed.action;
  }
  
  if (seed?.adjective) {
    mappings.adjective = seed.adjective;
  }
  
  if (seed?.color || userInfo?.favoriteColor) {
    mappings.color = seed?.color || userInfo?.favoriteColor;
  }
  
  if (seed?.friend) {
    mappings.friend = seed.friend;
  }
  
  if (seed?.forestType) {
    mappings.forestType = seed.forestType;
  }
  
  if (seed?.weatherType) {
    mappings.weatherType = seed.weatherType;
  }
  
  if (seed?.placeType) {
    mappings.placeType = seed.placeType;
  }

  let out = text;
  for (const [k, v] of Object.entries(mappings)) {
    if (v) out = out.replace(new RegExp(`\\{${k}\\}`, "g"), v);
  }
  
  // Apply grammar fixes based on pronoun
  if (pronoun === "they") {
    out = applyTheyGrammarFixes(out);
  } else {
    out = applyHeShePronounFixes(out);
  }
  
  return out; // Don't cleanup yet - let resolveAllPlaceholders handle final cleanup
}

export function resolveAllPlaceholders(text: string, ctx: MicroContext = {}): string {
  let result = text;
  if (ctx.userInfo) {
    result = resolveCanonicalPlaceholders(result, ctx.userInfo);
  }
  result = resolveMicroPlaceholders(result, ctx);
  return cleanup(result); // Only NOW do we cleanup, after all placeholders are resolved
}

/**
 * Extract character names from special request text safely
 */
function extractCharacterNamesFromRequest(request: string): string[] {
  try {
    if (!request || typeof request !== 'string') return [];
    
    const names: string[] = [];
    const lowerRequest = request.toLowerCase();
    
    // Look for patterns like "my friend Sarah" or "about Emma"
    const namePatterns = [
      /\b(?:my\s+friend|friend|buddy|pal)\s+([A-Za-z]{2,15})\b/gi,
      /\b(?:about|with|meet)\s+([A-Za-z]{2,15})\b/gi,
      /\b([A-Za-z]{2,15})\s+(?:and\s+me|is\s+my)/gi
    ];
    
    for (const pattern of namePatterns) {
      let match;
      while ((match = pattern.exec(request)) !== null) {
        const name = match[1];
        if (name && name.length >= 2 && name.length <= 15) {
          // Check if it's likely a name (not a common word)
          if (!isCommonWordForName(name.toLowerCase())) {
            names.push(name.charAt(0).toUpperCase() + name.slice(1).toLowerCase());
          }
        }
        // Prevent infinite loops
        if (pattern.lastIndex === match.index) {
          pattern.lastIndex++;
        }
      }
    }
    
    // Remove duplicates and limit results
    return [...new Set(names)].slice(0, 2);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn('Character name extraction error:', errorMessage);
    return [];
  }
}

/**
 * Check if word is a common non-name word
 */
function isCommonWordForName(word: string): boolean {
  const commonWords = [
    'the', 'and', 'with', 'for', 'about', 'story', 'tell', 'want', 'like', 
    'can', 'you', 'please', 'make', 'create', 'write', 'need', 'would',
    'this', 'that', 'have', 'will', 'play', 'game', 'fun', 'time'
  ];
  return commonWords.includes(word);
}

/**
 * Apply character name substitutions to text
 */
function applyCharacterNameSubstitutions(text: string, characterNames: string[]): string {
  try {
    if (!characterNames || characterNames.length === 0) return text;
    
    let result = text;
    
    // Replace friend placeholder with first extracted name
    if (characterNames[0]) {
      result = result.replace(/\{friend\}/g, characterNames[0]);
    }
    
    // Replace any generic friend names with extracted names
    const genericNames = ['Sam', 'Alex', 'Riley', 'Taylor', 'Jordan'];
    
    for (let i = 0; i < Math.min(characterNames.length, genericNames.length); i++) {
      const genericName = genericNames[i];
      const extractedName = characterNames[i];
      
      // Replace the generic name with extracted name
      const nameRegex = new RegExp(`\\b${genericName}\\b`, 'g');
      result = result.replace(nameRegex, extractedName);
    }
    
    console.log(`👤 Applied character name substitutions: [${characterNames.join(', ')}]`);
    
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn('Character name substitution error:', errorMessage);
    return text; // Return original text on error
  }
}

/**
 * ADVANCED ACTION VERB RESOLUTION AND NORMALIZATION
 */
function extractAndNormalizeAction(text: string): string {
  // Enhanced Level 0 action detection using proper vocabulary system
  const level0Actions = [
    'wakes up', 'waking up', 'wake up', 'gets up', 'getting up', 'sleeps', 'sleeping', 'sleep',
    'eats', 'eating', 'eat', 'drinks', 'drinking', 'drink', 'plays', 'playing', 'play',
    'goes', 'going', 'go', 'comes', 'coming', 'come', 'sits', 'sitting', 'sit',
    'stands', 'standing', 'stand', 'runs', 'running', 'run', 'walks', 'walking', 'walk',
    'jumps', 'jumping', 'jump', 'climbs', 'climbing', 'climb', 'swings', 'swinging', 'swing',
    'draws', 'drawing', 'draw', 'reads', 'reading', 'read', 'sings', 'singing', 'sing',
    'dances', 'dancing', 'dance', 'builds', 'building', 'build', 'creates', 'creating', 'create'
  ];
  
  // First check for Level 0 specific action patterns with word boundaries
  for (const action of level0Actions) {
    const actionRegex = new RegExp(`\\b${action.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (actionRegex.test(text)) {
      // Normalize Level 0 actions with intelligent inference
      if (action.includes('wakes up') || action.includes('waking up')) {
        return 'sitting up in bed with arms stretched';
      }
      if (action.includes('sleeps') || action.includes('sleeping')) {
        return 'lying peacefully in bed';
      }
      if (action.includes('eats') || action.includes('eating')) {
        return 'sitting at table eating';
      }
      if (action.includes('plays') || action.includes('playing')) {
        return 'playing happily';
      }
      if (action.includes('runs') || action.includes('running')) {
        return 'running energetically';
      }
      if (action.includes('jumps') || action.includes('jumping')) {
        return 'jumping excitedly';
      }
      if (action.includes('cleans') || action.includes('cleaning')) {
        return 'helping to clean up';
      }
      if (action.includes('reads') || action.includes('reading')) {
        return 'sitting comfortably reading';
      }
      if (action.includes('draws') || action.includes('drawing')) {
        return 'sitting at table drawing';
      }
      if (action.includes('helps') || action.includes('helping')) {
        return 'standing ready to help';
      }
      // Default Level 0 action with pose
      return `${action} cheerfully`;
    }
  }

  // Action verb patterns with enhanced normalization mapping
  const actionNormalizationMap: Record<string, string> = {
    'walked': 'walking through',
    'woke up': 'sitting up in bed with arms stretched',
    'cooking': 'standing at stove cooking',
    'walked through': 'walking through',
    'running around': 'running happily in',
    'jumped on': 'jumping excitedly on',
    'sat down': 'sitting comfortably in',
    'lying down': 'lying peacefully in'
  };

  // Try enhanced mappings
  for (const [pattern, normalized] of Object.entries(actionNormalizationMap)) {
    if (text.includes(pattern)) {
      return normalized;
    }
  }

  // FIXED: Enhanced action verb extraction with proper word boundaries to prevent false positives
  const actionMatch = text.match(/\b(wake|wakes|woke|waking|sleep|sleeps|slept|sleeping|eat|eats|ate|eating|play|plays|played|playing|walk|walks|walked|walking|run|runs|ran|running|jump|jumps|jumped|jumping|help|helps|helped|helping|clean|cleans|cleaned|cleaning|read|reads|reading|draw|draws|drew|drawing|sing|sings|sang|singing|dance|dances|danced|dancing|build|builds|built|building|climb|climbs|climbed|climbing|sit|sits|sat|sitting|stand|stands|stood|standing|come|comes|came|coming|look|looks|looked|looking|see|sees|saw|seeing)\b/);
  
  if (actionMatch) {
    let action = actionMatch[1];
    
    // Enhanced Level 0 specific normalizations with poses
    if (action === 'wake' || action === 'wakes' || action === 'woke') {
      return 'sitting up in bed with arms stretched';
    }
    if (action === 'sleep' || action === 'sleeps' || action === 'slept') {
      return 'lying peacefully in bed';
    }
    if (action === 'eat' || action === 'eats' || action === 'ate') {
      return 'sitting at table eating';
    }
    
    // Normalize to present continuous with intelligent inference
    if (action.endsWith('ed')) {
      action = action.slice(0, -2) + 'ing';
    }
    if (action.endsWith('s') && !action.endsWith('ing')) {
      action = action.slice(0, -1) + 'ing';
    }
    
    // Add Level 0 appropriate descriptors
    if (action === 'playing') return 'playing happily';
    if (action === 'running') return 'running energetically';
    if (action === 'jumping') return 'jumping excitedly';
    if (action === 'helping') return 'standing ready to help';
    if (action === 'reading') return 'sitting comfortably reading';
    if (action === 'drawing') return 'sitting at table drawing';
    
    return action;
  }

  // Intelligent inference for Level 0 common patterns
  if (text.includes('ball is red') || text.includes('red ball')) {
    return 'holding red ball cheerfully';
  }
  if (text.includes('ball is') || text.includes('the ball')) {
    return 'playing with ball happily';
  }

  return 'playing cheerfully';
}

/**
 * INFER OBJECT FROM ACTION CONTEXT
 */
function inferObjectFromAction(action: string): string {
  const actionObjectMap: Record<string, string> = {
    'cooking': 'food',
    'standing over stove': 'cooking utensils',
    'reading': 'book',
    'drawing': 'crayons',
    'writing': 'pencil',
    'playing': 'toys',
    'building': 'blocks',
    'swimming': 'pool toys'
  };
  return actionObjectMap[action] || '';
}

/**
 * INFER LOCATION FROM CONTEXT
 */
function inferLocationFromContext(text: string): string {
  // Enhanced Level 0 location detection using tier25Vocabulary
  const level0Locations = [
    'bed', 'bedroom', 'kitchen', 'home', 'house', 'room', 'bathroom', 'living room',
    'dining room', 'playroom', 'inside', 'indoors', 'park', 'playground', 'garden', 
    'yard', 'outside', 'outdoors', 'beach', 'forest', 'field', 'street', 'road', 
    'path', 'tree', 'grass', 'school', 'store', 'shop', 'library', 'hospital', 'farm', 'zoo'
  ];
  
  // Check for Level 0 specific locations first
  for (const location of level0Locations) {
    if (text.includes(location)) {
      // Return intelligent inference based on Level 0 context
      if (location === 'bed' || location === 'bedroom') return 'cozy bedroom';
      if (location === 'kitchen') return 'bright kitchen';
      if (location === 'park' || location === 'playground') return 'sunny park';
      if (location === 'home' || location === 'house') return 'comfortable home';
      if (location === 'school') return 'cheerful school';
      return location;
    }
  }
  
  // Enhanced context-based inference
  if (text.includes('kitchen') || text.includes('cooking') || text.includes('stove') || text.includes('eating')) return 'bright kitchen';
  if (text.includes('bedroom') || text.includes('bed') || text.includes('woke up') || text.includes('sleep')) return 'cozy bedroom';
  if (text.includes('park') || text.includes('playground') || text.includes('swing')) return 'sunny park';
  if (text.includes('beach') || text.includes('sand') || text.includes('ocean')) return 'beautiful beach';
  if (text.includes('forest') || text.includes('trees') || text.includes('woods')) return 'magical forest';
  if (text.includes('school') || text.includes('classroom') || text.includes('teacher')) return 'cheerful school';
  if (text.includes('outside') || text.includes('outdoors') || text.includes('garden')) return 'sunny outdoors';
  if (text.includes('inside') || text.includes('indoors') || text.includes('home') || text.includes('room')) return 'comfortable indoors';
  
  // Return empty string if no clear location - maintain text integrity
  return '';
}

/**
 * EXTRACT ATMOSPHERE (enhanced from previous version)
 */
function extractAtmosphere(text: string): string {
  if (text.includes('sunny') || text.includes('bright')) return 'bright sunny day';
  if (text.includes('rainy') || text.includes('cloudy')) return 'cloudy day';
  if (text.includes('morning')) return 'morning light';
  if (text.includes('evening') || text.includes('sunset')) return 'evening atmosphere';
  if (text.includes('night')) return 'nighttime setting';
  return 'warm natural lighting';
}

/**
 * INFER CHARACTER MOOD FROM TEXT CONTEXT
 */
function inferCharacterMood(text: string): string {
  if (text.includes('happy') || text.includes('excited') || text.includes('joyful')) return 'happy expression';
  if (text.includes('sad') || text.includes('crying')) return 'sad expression';
  if (text.includes('angry') || text.includes('mad')) return 'frustrated expression';
  if (text.includes('surprised') || text.includes('amazed')) return 'surprised expression';
  if (text.includes('scared') || text.includes('afraid')) return 'worried expression';
  return 'cheerful expression';
}

/**
 * INFER CHARACTER POSE FROM ACTION AND OBJECT
 */
function inferCharacterPose(action: string, object: string): string {
  if (action.includes('sitting')) return 'sitting pose';
  if (action.includes('standing')) return 'standing pose';
  if (action.includes('running')) return 'running pose';
  if (action.includes('jumping')) return 'mid-jump pose';
  if (action.includes('lying') || action.includes('sleeping')) return 'lying down';
  if (action.includes('cooking') || action.includes('stove')) return 'standing at counter';
  if (action.includes('reading')) return 'sitting comfortably';
  if (action.includes('drawing') || action.includes('writing')) return 'seated at table';
  return 'natural active pose';
}

/**
 * Summarize page text for semantic analysis (stub - implement if needed)
 */
function summarizePageText(pageText: string, context: MicroContext = {}): string {
  // Take first 2 sentences or 200 characters, whichever is shorter
  const sentences = pageText.match(/[^.!?]+[.!?]+/g) || [pageText];
  const firstTwoSentences = sentences.slice(0, 2).join(' ');
  return firstTwoSentences.length > 200 ? firstTwoSentences.substring(0, 200) : firstTwoSentences;
}

/**
 * Extract semantic scene description from story text for Tier 2.5A
 * SOPHISTICATED: Analyzes actions, objects, locations, atmosphere, mood, and pose
 */
export function extractSemanticScene(pageText: string, context: MicroContext = {}): string {
  if (!pageText || typeof pageText !== 'string' || pageText.trim().length === 0) {
    // Return empty string to maintain page text integrity
    console.log('📝 No semantic scene extractable - maintaining text integrity');
    return '';
  }

  // Use summarized pageText first (2 sentences max), fallback to full text
  let textToAnalyze = summarizePageText(pageText, context);
  if (!textToAnalyze || textToAnalyze.length < 10) {
    textToAnalyze = pageText;
  }

  const text = textToAnalyze.toLowerCase();
  
  // ADVANCED ACTION VERB RESOLUTION with normalization
  const extractedAction = extractAndNormalizeAction(text);
  
  // FIXED: Extract Object (what they're interacting with) - fixed regex to prevent character dropping
  const objectMatch = text.match(/\b(?:with|holding|carrying|using|playing with|reading|eating|building|drawing)\s+(?:a|an|the|some)?\s*([a-zA-Z]+(?:\s+[a-zA-Z]+)*?)(?:\s+(?:in|at|on|through|where|and|,|\.|!|\?)|$)/);
  const extractedObject = objectMatch ? objectMatch[1].trim() : inferObjectFromAction(extractedAction);
  
  // Extract Location 
  const locationMatch = text.match(/\b(?:in|at|on|near|by|inside|outside|through)\s+(?:the|a|an)?\s*([a-zA-Z]+(?:\s+[a-zA-Z]+)?)/);
  const extractedLocation = locationMatch ? locationMatch[1] : inferLocationFromContext(text);
  
  // Extract Atmosphere (indoor/outdoor, time of day, weather)
  const atmosphere = extractAtmosphere(text);
  
  // Infer Character Mood from context
  const characterMood = inferCharacterMood(text);
  
  // Infer Character Pose from action
  const characterPose = inferCharacterPose(extractedAction, extractedObject);
  
  // Build comprehensive semantic scene with action verb leading
  const sceneComponents = [
    extractedAction,
    extractedObject ? `with ${extractedObject}` : '',
    extractedLocation ? `in the ${extractedLocation}` : '',
    atmosphere,
    characterMood,
    characterPose
  ].filter(Boolean);
  
  const semanticScene = sceneComponents.join(', ');
  console.log(`✅ Sophisticated semantic scene extracted: "${semanticScene}"`);
  return semanticScene;
}

/**
 * TIER 2.5B: SIMPLIFIED SCENE EXTRACTION (Basic Regex) - FIXED
 * Extracts: Action + Object + Location with proper preposition handling
 */
export function extractSimpleScene(storyText: string): string {
  if (!storyText || typeof storyText !== 'string') return 'playing outdoors';
  
  console.log('🔍 Simple scene extraction from story text');
  
  const text = storyText.toLowerCase();
  
  // ENHANCED ACTION EXTRACTION with preposition preservation
  let extractedAction = '';
  
  // First check for action + preposition patterns (like "walked through")
  const actionWithPrepMatch = text.match(/\b(walked|running|going|moving)\s+(through|in|across|around|over|under)\b/);
  if (actionWithPrepMatch) {
    const baseAction = actionWithPrepMatch[1];
    const preposition = actionWithPrepMatch[2];
    // Normalize to present continuous
    if (baseAction === 'walked') {
      extractedAction = `walking ${preposition}`;
    } else if (baseAction === 'running') {
      extractedAction = `running ${preposition}`;
    } else if (baseAction === 'going') {
      extractedAction = `going ${preposition}`;
    } else if (baseAction === 'moving') {
      extractedAction = `moving ${preposition}`;
    }
  }
  
  // Fallback to basic action normalization if no preposition pattern found
  if (!extractedAction) {
    extractedAction = extractAndNormalizeAction(text);
  }
  
  // Enhanced object extraction (suppress for walking scenes to avoid noise)
  let extractedObject = '';
  if (!extractedAction.includes('walking') && !extractedAction.includes('running')) {
    const objectMatch = text.match(/\b(?:carrying|holding|with|playing with|using)\s+(?:a|an|the|some)?\s*([a-zA-Z]+(?:\s+[a-zA-Z]+)*)/);
    extractedObject = objectMatch ? objectMatch[1] : '';
  }
  
  // Enhanced location extraction with multiple prepositions
  const locationMatch = text.match(/\b(?:through|in|at|on|outside|inside|near|by)\s+(?:the|a)?\s*([a-zA-Z]+(?:\s+[a-zA-Z]+)?)/);
  const extractedLocation = locationMatch ? locationMatch[1] : inferLocationFromContext(text);
  
  // Build scene avoiding preposition duplication
  const sceneComponents = [];
  
  // Add action (may already include preposition)
  sceneComponents.push(extractedAction);
  
  // Add object if present and not redundant
  if (extractedObject && !extractedAction.includes(extractedObject)) {
    sceneComponents.push(`with ${extractedObject}`);
  }
  
  // Add location with smart preposition handling
  if (extractedLocation) {
    // If action already has preposition, don't add another one
    if (extractedAction.includes('through') || extractedAction.includes('in') || extractedAction.includes('across')) {
      sceneComponents.push(`the ${extractedLocation}`);
    } else {
      sceneComponents.push(`in the ${extractedLocation}`);
    }
  }
  
  const simpleScene = sceneComponents.join(', ').replace(/,\s*,/g, ',').trim();
  console.log(`✅ Simple scene extracted: "${simpleScene}"`);
  return simpleScene;
}

export { deriveCompleteGenderInfo };