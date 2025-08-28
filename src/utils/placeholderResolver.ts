import type { UserInfo } from "@/types";
import { APP_CONFIG } from "@/config/appConfig";
// Canonical placeholders we support across prompts/components
// {userName}, {favoriteColor}, {favoriteAnimal}, {favoriteFood}, {hobbies}, {specialRequest}
// Micro-tokens used by style patterns
// {animal}, {friend}, {setting}, {adjective}, {object}, {action}, {pronoun}, {food}, {color}

type Seed = Record<string, string>;

export interface MicroContext {
  userInfo?: UserInfo;
  pageText?: string;
  seed?: Seed; // variables extracted from content (e.g., names, adjectives)
}

// Enhanced validation and error handling
export interface PlaceholderValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  resolvedCount: number;
  unresolvedPlaceholders: string[];
}

export interface SafeUserInfo extends Partial<UserInfo> {
  name: string;
  favoriteColor: string;
  favoriteAnimal: string;
  favoriteFood: string;
  hobbies: string;
  specialRequest: string;
}

const FALLBACK_POOLS = {
  // Level 0 vocabulary-compliant fallback pools (using ENHANCED_LEVEL_0_VOCABULARY)
  animal: ["cat", "dog", "bird", "rabbit", "duck", "pig", "cow", "horse", "fish", "bear"],
  food: ["cake", "milk", "eat", "apple", "bread", "water"],
  setting: ["house", "farm", "school", "park", "bed", "home"],
  object: ["ball", "book", "box", "car", "toy", "tree"],
  action: ["play", "run", "go", "come", "look", "jump"],
  adjective: ["big", "little", "good", "funny", "pretty", "new"],
  friend: ["Sam", "Alex", "Kim", "Lee", "Pat", "Jo"],
  color: ["red", "blue", "yellow", "black", "brown", "white"],
  // Legacy and edge case placeholders
  forestType: ["magic", "deep", "green", "quiet", "old", "big"],
  weatherType: ["sunny", "rainy", "cloudy", "windy", "clear", "nice"],
  placeType: ["park", "forest", "garden", "field", "yard", "beach"]
} as const;

// Enhanced fallback system with comprehensive defaults
const SAFE_DEFAULTS: SafeUserInfo = {
  name: "Child",
  favoriteColor: "blue", 
  favoriteAnimal: "puppy",
  favoriteFood: "cookies",
  hobbies: "playing",
  specialRequest: "fun adventure"
};

// Article agreement for a/an placement
const VOWEL_SOUNDS = new Set(['a', 'e', 'i', 'o', 'u']);
function getArticle(word: string): string {
  if (!word) return 'a';
  const firstChar = word.toLowerCase().charAt(0);
  return VOWEL_SOUNDS.has(firstChar) ? 'an' : 'a';
}

const KNOWN_ANIMALS = new Set([
  "cat","dog","puppy","kitten","rabbit","bunny","turtle","bird","owl","fox","bear","panda","deer","lion","tiger","monkey","zebra","giraffe","horse","pig","cow","sheep","goat","duck","chicken","mouse","rat","hamster","parrot","goldfish","fish"
]);

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Enhanced validation for user data
export function validateAndSanitizeUserInfo(userInfo?: Partial<UserInfo>): SafeUserInfo {
  const errors: string[] = [];
  
  if (!userInfo) {
    console.warn('⚠️ [VALIDATION] No userInfo provided, using safe defaults');
    return { ...SAFE_DEFAULTS };
  }

  const sanitized: SafeUserInfo = {
    name: sanitizeString(userInfo.name) || SAFE_DEFAULTS.name,
    favoriteColor: sanitizeString(userInfo.favoriteColor) || SAFE_DEFAULTS.favoriteColor,
    favoriteAnimal: sanitizeString(userInfo.favoriteAnimal) || SAFE_DEFAULTS.favoriteAnimal,
    favoriteFood: sanitizeString(userInfo.favoriteFood) || SAFE_DEFAULTS.favoriteFood,
    hobbies: sanitizeString(userInfo.hobbies) || SAFE_DEFAULTS.hobbies,
    specialRequest: sanitizeString(userInfo.specialRequest) || SAFE_DEFAULTS.specialRequest
  };

  if (errors.length > 0) {
    console.warn('⚠️ [VALIDATION] UserInfo validation errors:', errors);
  }

  return sanitized;
}

function sanitizeString(value: any): string {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/[<>{}]/g, '').substring(0, 50); // Remove potential injection chars and limit length
}

function cleanup(text: string): string {
  const originalText = text;
  
  // Enhanced cleanup - more aggressive placeholder removal and grammar fixes
  let cleaned = text
    .replace(/\{[^}]+\}/g, "") // strip unresolved tokens
    .replace(/\s{2,}/g, " ") // collapse multiple spaces
    .replace(/\s+([,.!?:;])/g, "$1") // remove space before punctuation
    .replace(/\s+$/, "") // trim trailing spaces
    .replace(/^\s+/, "") // trim leading spaces
    .replace(/\.\s*\./g, ".") // remove double periods
    .replace(/,\s*,/g, ",") // remove double commas
    // Enhanced grammar fixes
    .replace(/\ba\s+([aeiouAEIOU])/g, "an $1") // Fix a/an agreement
    .replace(/\ban\s+([^aeiouAEIOU])/g, "a $1") // Fix an/a agreement
    .replace(/([.!?])\s*([a-z])/g, (match, punct, letter) => punct + " " + letter.toUpperCase()) // Capitalize after sentences
    .trim();

  // Log if we cleaned up any placeholders for monitoring
  const hadPlaceholders = /\{[^}]+\}/.test(originalText);
  const stillHasPlaceholders = /\{[^}]+\}/.test(cleaned);
  
  if (hadPlaceholders && !stillHasPlaceholders) {
    console.log('🧹 [CLEANUP] Removed unresolved placeholders from text');
  } else if (stillHasPlaceholders) {
    console.warn('⚠️ [CLEANUP] Text still contains unresolved placeholders after cleanup:', cleaned.match(/\{[^}]+\}/g));
  }
  
  return cleaned;
}

function applyTheyGrammarFixes(text: string): string {
  let t = text;
  t = t.replace(/\bthey\s+is\b/gi, "they are");
  t = t.replace(/\bthey\s+was\b/gi, "they were");
  t = t.replace(/\bthey\s+has\b/gi, "they have");
  t = t.replace(/\bthey\s+does\b/gi, "they do");
  t = t.replace(/\bthey\s+goes\b/gi, "they go");
  // Drop 3rd person singular -s after they (simple heuristic)
  t = t.replace(/\bthey\s+([a-z]+)s\b/gi, (_m, v: string) => `they ${v}`);
  return t;
}

function applyHeShePronounFixes(text: string): string {
  let t = text;
  // Fix common subject-verb agreement errors for he/she
  t = t.replace(/\bhe\s+have\b/gi, "he has");
  t = t.replace(/\bshe\s+have\b/gi, "she has");
  t = t.replace(/\bhe\s+are\b/gi, "he is");
  t = t.replace(/\bshe\s+are\b/gi, "she is");
  t = t.replace(/\bhe\s+were\b/gi, "he was");
  t = t.replace(/\bshe\s+were\b/gi, "she was");
  t = t.replace(/\bhe\s+do\b/gi, "he does");
  t = t.replace(/\bshe\s+do\b/gi, "she does");
  
  // Additional comprehensive grammar fixes
  t = t.replace(/\bhe\s+don't\b/gi, "he doesn't");
  t = t.replace(/\bshe\s+don't\b/gi, "she doesn't");
  t = t.replace(/\bhe\s+can't\b/gi, "he can't"); // This is actually correct
  t = t.replace(/\bshe\s+can't\b/gi, "she can't"); // This is actually correct
  
  return t;
}

function firstName(name?: string): string | undefined {
  if (!name) return undefined;
  const parts = name.trim().split(/\s+/);
  return parts[0];
}

function derivePronoun(userInfo?: UserInfo): string {
  console.log('🔍 [DEBUG] Deriving pronoun from userInfo:', { 
    hasUserInfo: !!userInfo,
    avatar: userInfo?.avatar,
    avatarType: userInfo?.avatar?.type 
  });
  
  switch (userInfo?.avatar?.type) {
    case "boy":
      console.log('✅ [DEBUG] Using "he" pronoun for boy avatar');
      return "he";
    case "girl":
      console.log('✅ [DEBUG] Using "she" pronoun for girl avatar');
      return "she";
    case "prefer-not-to-answer":
      console.log('✅ [DEBUG] Using "they" pronoun for prefer-not-to-answer avatar');
      return "they";
    default:
      console.log('⚠️ [DEBUG] Using "they" pronoun (default fallback)');
      return "they";
  }
}

function scanForAnimalFromText(text?: string): string | undefined {
  if (!text) return undefined;
  const words = text.toLowerCase().match(/[a-zA-Z]+/g) || [];
  const irregularMap: Record<string, string> = {
    mice: "mouse",
    geese: "goose",
    deer: "deer",
    fish: "fish"
  };
  for (const w of words) {
    if (KNOWN_ANIMALS.has(w)) return w;
    const irregular = irregularMap[w];
    if (irregular && KNOWN_ANIMALS.has(irregular)) return irregular;
    let singular = w;
    if (w.endsWith("ies")) singular = w.slice(0, -3) + "y"; // bunnies -> bunny
    else if (w.endsWith("es")) singular = w.slice(0, -2); // foxes -> fox
    else if (w.endsWith("s")) singular = w.slice(0, -1); // dogs -> dog
    if (KNOWN_ANIMALS.has(singular)) return singular;
  }
  return undefined;
}

// Template structural validation
export function validateTemplateStructure(text: string): PlaceholderValidationResult {
  const placeholders = text.match(/\{[^}]+\}/g) || [];
  const knownPlaceholders = new Set([
    'userName', 'favoriteColor', 'favoriteAnimal', 'favoriteFood', 'hobbies', 'specialRequest',
    'animal', 'friend', 'setting', 'adjective', 'object', 'action', 'pronoun', 'food', 'color',
    'forestType', 'weatherType', 'placeType'
  ]);
  
  const errors: string[] = [];
  const warnings: string[] = [];
  const unresolvedPlaceholders: string[] = [];
  
  for (const placeholder of placeholders) {
    const cleanPlaceholder = placeholder.replace(/[{}]/g, '');
    if (!knownPlaceholders.has(cleanPlaceholder)) {
      errors.push(`Unknown placeholder: ${placeholder}`);
      unresolvedPlaceholders.push(placeholder);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    resolvedCount: placeholders.length - unresolvedPlaceholders.length,
    unresolvedPlaceholders
  };
}

export function resolveCanonicalPlaceholders(text: string, userInfo: UserInfo): string {
  // Validate and sanitize user info first
  const safeUserInfo = validateAndSanitizeUserInfo(userInfo);
  
  const map: Record<string, string> = {
    userName: firstName(safeUserInfo.name) || safeUserInfo.name,
    favoriteColor: safeUserInfo.favoriteColor,
    favoriteAnimal: safeUserInfo.favoriteAnimal,
    favoriteFood: safeUserInfo.favoriteFood,
    hobbies: safeUserInfo.hobbies,
    specialRequest: safeUserInfo.specialRequest
  };

  console.log('🔍 [DEBUG] Canonical placeholder resolution:', { 
    originalName: userInfo.name, 
    firstName: firstName(safeUserInfo.name),
    finalUserName: map.userName 
  });

  let out = text;
  let resolvedCount = 0;
  
  for (const [k, v] of Object.entries(map)) {
    const before = out;
    out = out.replace(new RegExp(`\\{${k}\\}`, "g"), v);
    if (before !== out) {
      resolvedCount++;
      console.log(`🔍 [DEBUG] Replaced {${k}} with "${v}"`);
    }
  }

  // Validate what we couldn't resolve
  const validation = validateTemplateStructure(out);
  if (!validation.isValid) {
    console.warn('⚠️ [VALIDATION] Template validation failed:', validation.errors);
  }

  return cleanup(out);
}

// Simplified pronoun handling - just return the base pronoun

export function resolveMicroPlaceholders(text: string, ctx: MicroContext = {}): string {
  try {
    const { userInfo, pageText, seed } = ctx;

    // Validate and sanitize user input
    const safeUserInfo = validateAndSanitizeUserInfo(userInfo);
    const basePronoun = derivePronoun(userInfo);
    
    console.log(`🔍 [DEBUG] Using simple pronoun: ${basePronoun}`);

    const candidate: Record<string, string | undefined> = {
      // bridge from seed variables with fallback safety
      userName: seed?.userName || seed?.name || firstName(safeUserInfo?.name) || safeUserInfo?.name,
      adjective: seed?.adjective,

      // micro tokens with comprehensive fallback chain
      pronoun: basePronoun,
      animal: seed?.animal || safeUserInfo?.favoriteAnimal || scanForAnimalFromText(pageText) || pick(FALLBACK_POOLS.animal),
      food: seed?.food || safeUserInfo?.favoriteFood || pick(FALLBACK_POOLS.food),
      setting: seed?.setting || pick(FALLBACK_POOLS.setting),
      object: seed?.object || pick(FALLBACK_POOLS.object),
      action: seed?.action || pick(FALLBACK_POOLS.action),
      adjectiveFallback: pick(FALLBACK_POOLS.adjective),
      color: seed?.color || safeUserInfo?.favoriteColor || pick(FALLBACK_POOLS.color),
      friend: seed?.friend || pick(FALLBACK_POOLS.friend),
      forestType: seed?.forestType || pick(FALLBACK_POOLS.forestType),
      weatherType: seed?.weatherType || pick(FALLBACK_POOLS.weatherType),
      placeType: seed?.placeType || pick(FALLBACK_POOLS.placeType)
    };

    // prefer explicit adjective, else fallback
    const adjective = candidate.adjective || candidate.adjectiveFallback;

    let out = text;
    const mappings: Record<string, string> = {
      userName: candidate.userName || "Child",
      pronoun: candidate.pronoun || "they",
      animal: candidate.animal || "cat",
      food: candidate.food || "cookies",
      setting: candidate.setting || "home",
      object: candidate.object || "toy",
      action: candidate.action || "play",
      adjective: adjective || "happy",
      color: candidate.color || "blue",
      friend: candidate.friend || "Alex",
      forestType: candidate.forestType || "magic",
      weatherType: candidate.weatherType || "sunny",
      placeType: candidate.placeType || "park"
    };

    console.log(`🔍 [DEBUG] Final robust mappings:`, mappings);

    // Apply all replacements with guaranteed values
    for (const [k, v] of Object.entries(mappings)) {
      out = out.replace(new RegExp(`\\{${k}\\}`, "g"), v);
    }

    // Enhanced grammar fixes
    out = applyEnhancedGrammarFixes(out, mappings.pronoun);

    return cleanup(out);
  } catch (error) {
    console.error('❌ [ERROR] Failed to resolve micro placeholders:', error);
    // Emergency fallback - return cleaned text with all placeholders removed
    return cleanup(text);
  }
}

// Enhanced grammar fixing system
function applyEnhancedGrammarFixes(text: string, pronoun: string): string {
  let fixed = text;
  
  // Apply pronoun-specific fixes
  if (pronoun === "they") {
    fixed = applyTheyGrammarFixes(fixed);
  } else if (pronoun === "he" || pronoun === "she") {
    fixed = applyHeShePronounFixes(fixed);
  }

  // Apply universal grammar enhancements
  fixed = fixed
    // Fix double articles
    .replace(/\ba\s+a\s+/gi, "a ")
    .replace(/\ban\s+an\s+/gi, "an ")
    // Fix spacing around contractions
    .replace(/(\w)\s+'(\w)/g, "$1'$2")
    // Fix capitalization after quotes
    .replace(/(['"])\s*([a-z])/g, (match, quote, letter) => quote + letter.toUpperCase())
    // Ensure proper sentence spacing
    .replace(/([.!?])\s*([A-Z])/g, "$1 $2");

  return fixed;
}

export function resolveAllPlaceholders(text: string, ctx: MicroContext = {}): string {
  try {
    // Validate template structure first
    const validation = validateTemplateStructure(text);
    if (!validation.isValid) {
      console.warn('⚠️ [VALIDATION] Template structure issues detected:', validation.errors);
    }

    let out = text;
    
    // Apply canonical placeholders first (user-specific)
    if (ctx.userInfo) {
      out = resolveCanonicalPlaceholders(out, ctx.userInfo);
    }
    
    // Apply micro placeholders (fallback system)
    out = resolveMicroPlaceholders(out, ctx);
    
    // Final validation check
    const finalValidation = validateTemplateStructure(out);
    if (finalValidation.unresolvedPlaceholders.length > 0) {
      console.warn('⚠️ [FINAL] Unresolved placeholders remain:', finalValidation.unresolvedPlaceholders);
    }
    
    return out;
  } catch (error) {
    console.error('❌ [ERROR] Complete placeholder resolution failed:', error);
    // Emergency fallback - clean everything
    return cleanup(text);
  }
}

// Additional utility functions for external validation
export function getPlaceholderCoverage(text: string): { total: number; covered: number; missing: string[] } {
  const validation = validateTemplateStructure(text);
  return {
    total: validation.resolvedCount + validation.unresolvedPlaceholders.length,
    covered: validation.resolvedCount,
    missing: validation.unresolvedPlaceholders
  };
}

export function isTemplateValid(text: string): boolean {
  return validateTemplateStructure(text).isValid;
}
