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

function derivePronoun(userInfo?: UserInfo): string {
  switch (userInfo?.avatar?.type) {
    case "boy": return "he";
    case "girl": return "she"; 
    case "prefer-not-to-answer": return "they";
    default: return "they";
  }
}

export function resolveCanonicalPlaceholders(text: string, userInfo: UserInfo): string {
  const map: Record<string, string> = {
    userName: firstName(userInfo.name) || userInfo.name || "Child",
    favoriteColor: userInfo.favoriteColor || pick(FALLBACK_POOLS.color),
    favoriteAnimal: userInfo.favoriteAnimal || pick(FALLBACK_POOLS.animal), 
    favoriteFood: userInfo.favoriteFood || pick(FALLBACK_POOLS.food),
    hobbies: userInfo.hobbies || "playing outside",
    specialRequest: userInfo.specialRequest || "adventure"
  };

  let out = text;
  for (const [k, v] of Object.entries(map)) {
    if (v) {
      out = out.replace(new RegExp(`\\{${k}\\}`, "g"), v);
    }
  }
  return out;
}

export function resolveMicroPlaceholders(text: string, ctx: MicroContext = {}): string {
  const { userInfo, seed } = ctx;
  const pronoun = derivePronoun(userInfo);
  
  const mappings: Record<string, string> = {
    pronoun: pronoun,
    animal: seed?.animal || userInfo?.favoriteAnimal || pick(FALLBACK_POOLS.animal),
    animalType: seed?.animalType || pick(FALLBACK_POOLS.animalType),
    monsterType: seed?.monsterType || pick(FALLBACK_POOLS.monsterType),
    food: seed?.food || userInfo?.favoriteFood || pick(FALLBACK_POOLS.food),
    setting: seed?.setting || pick(FALLBACK_POOLS.setting),
    object: seed?.object || pick(FALLBACK_POOLS.object),
    action: seed?.action || pick(FALLBACK_POOLS.action),
    adjective: seed?.adjective || pick(FALLBACK_POOLS.adjective),
    color: seed?.color || userInfo?.favoriteColor || pick(FALLBACK_POOLS.color),
    friend: seed?.friend || pick(FALLBACK_POOLS.friend),
    forestType: seed?.forestType || pick(FALLBACK_POOLS.forestType),
    weatherType: seed?.weatherType || pick(FALLBACK_POOLS.weatherType),
    placeType: seed?.placeType || pick(FALLBACK_POOLS.placeType)
  };

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
  
  return cleanup(out);
}

export function resolveAllPlaceholders(text: string, ctx: MicroContext = {}): string {
  let result = text;
  if (ctx.userInfo) {
    result = resolveCanonicalPlaceholders(result, ctx.userInfo);
  }
  result = resolveMicroPlaceholders(result, ctx);
  return result;
}