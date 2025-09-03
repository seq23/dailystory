/**
 * Advanced Placeholder Resolution for Edge Functions
 * Consolidated from frontend with MicroContext and seed-based resolution
 * Single source of truth for all placeholder logic
 */

export interface MicroContext {
  userInfo?: UserInfo;
  pageText?: string;
  seed?: Record<string, any>;
}

export interface UserInfo {
  name?: string;
  age?: number;
  grade?: string;
  nativeLanguage?: string;
  learningGoal?: string;
  avatar?: { type: string; skinTone?: string };
  favoriteColor?: string;
  favoriteAnimal?: string;
  hobbies?: string;
  favoriteFood?: string;
  specialRequest?: string;
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
  switch (userInfo?.avatar?.type) {
    case "boy": return "he";
    case "girl": return "she"; 
    case "prefer-not-to-answer": return "they";
    default: return "they";
  }
}

function deriveCompleteGenderInfo(userInfo?: UserInfo): string {
  switch (userInfo?.avatar?.type) {
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

  let out = text;
  for (const [k, v] of Object.entries(map)) {
    if (v) {
      out = out.replace(new RegExp(`\\{${k}\\}`, "g"), v);
    }
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

export { deriveCompleteGenderInfo };