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

const FALLBACK_POOLS = {
  animal: ["cat", "dog", "bird", "rabbit", "duck", "pig", "cow", "horse", "fish", "bear"],
  animalType: ["owl", "fox", "bear", "deer", "rabbit", "wolf", "eagle", "squirrel"],
  monsterType: ["dragon", "troll", "giant", "ogre", "goblin", "beast", "wizard", "creature"],
  food: ["pancakes", "apple", "sandwich", "cookie", "pizza", "noodles", "cake", "milk", "bread", "water"],
  setting: ["forest", "park", "garden", "classroom", "kitchen", "playground", "house", "farm", "school", "home"],
  object: ["ball", "book", "box", "car", "toy", "tree"],
  action: ["play", "run", "go", "come", "look", "jump"],
  adjective: ["brave", "clever", "kind", "happy", "big", "little", "good", "funny", "pretty", "new"],
  friend: ["Sam", "Alex", "Riley", "Taylor", "Jordan", "Casey", "Kim", "Lee", "Pat", "Jo"],
  color: ["red", "blue", "yellow", "black", "brown", "white"],
  forestType: ["magic", "deep", "green", "quiet", "old", "big", "enchanted", "dark", "sunny", "mysterious"],
  weatherType: ["sunny", "rainy", "cloudy", "windy", "clear", "nice"],
  placeType: ["park", "forest", "garden", "field", "yard", "beach"]
} as const;

function pick<T>(arr: readonly T[]): T {
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
  
  // Only add placeholders if user actually provided the data
  if (userInfo.name) {
    map.userName = firstName(userInfo.name) || userInfo.name;
  } else {
    map.userName = "Child"; // This is essential for story structure
  }
  
  if (userInfo.favoriteColor) {
    map.favoriteColor = userInfo.favoriteColor;
  }
  
  if (userInfo.favoriteAnimal) {
    map.favoriteAnimal = userInfo.favoriteAnimal;
  }
  
  if (userInfo.favoriteFood) {
    map.favoriteFood = userInfo.favoriteFood;
  }
  
  if (userInfo.hobbies) {
    map.hobbies = userInfo.hobbies;
  }
  
  if (userInfo.specialRequest) {
    map.specialRequest = userInfo.specialRequest;
  }

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