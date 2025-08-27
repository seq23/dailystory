/**
 * Template Converter for Story Templates
 * Converts StoryTemplate objects to string[] arrays with full placeholder resolution
 */

// Types matching the frontend
interface MicroVariants {
  text: string;
  alternatives: string[];
  optionalDetails: string[];
}

interface StoryScene {
  text: string;
  pause: boolean;
  hook: string;
  microVariants: MicroVariants;
}

interface AttachableEnding {
  type: 'cozy' | 'silly' | 'triumphant' | 'reflective';
  text: string;
  microVariants: string[];
}

interface StoryTemplate {
  title: string;
  theme: string;
  level: string;
  scenes: StoryScene[];
  endings: AttachableEnding[];
  reuse: {
    swappableElements: Record<string, string[]>;
    weatherVariants: string[];
    settingVariants: string[];
    randomSeed?: number;
  };
}

interface UserInfo {
  name?: string;
  avatar?: any;
  favoriteColor?: string;
  favoriteAnimal?: string;
  favoriteFood?: string;
  hobbies?: string;
  specialRequest?: string;
  difficultyLevel?: string;
}

// Fallback pools (matching placeholderResolver.ts)
const FALLBACK_POOLS = {
  animal: ["cat", "dog", "bird", "rabbit", "duck", "pig", "cow", "horse", "fish", "bear"],
  food: ["cake", "milk", "eat", "apple", "bread", "water"],
  setting: ["house", "farm", "school", "park", "bed", "home"],
  object: ["ball", "book", "box", "car", "toy", "tree"],
  action: ["play", "run", "go", "come", "look", "jump"],
  adjective: ["big", "little", "good", "funny", "pretty", "new"],
  friend: ["Sam", "Alex", "Kim", "Lee", "Pat", "Jo"],
  color: ["red", "blue", "yellow", "black", "brown", "white"],
  forestType: ["magic", "deep", "green", "quiet", "old", "big"],
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
    .trim();
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

// Apply grammar fixes based on pronoun
function applyGrammarFixes(text: string, pronoun: string): string {
  let t = text;
  
  if (pronoun === "they") {
    t = t.replace(/\bthey\s+is\b/gi, "they are");
    t = t.replace(/\bthey\s+was\b/gi, "they were");
    t = t.replace(/\bthey\s+has\b/gi, "they have");
    t = t.replace(/\bthey\s+does\b/gi, "they do");
    t = t.replace(/\bthey\s+goes\b/gi, "they go");
  } else if (pronoun === "he" || pronoun === "she") {
    t = t.replace(new RegExp(`\\b${pronoun}\\s+have\\b`, 'gi'), `${pronoun} has`);
    t = t.replace(new RegExp(`\\b${pronoun}\\s+are\\b`, 'gi'), `${pronoun} is`);
    t = t.replace(new RegExp(`\\b${pronoun}\\s+were\\b`, 'gi'), `${pronoun} was`);
    t = t.replace(new RegExp(`\\b${pronoun}\\s+do\\b`, 'gi'), `${pronoun} does`);
  }
  
  return t;
}

// Resolve canonical placeholders
function resolveCanonicalPlaceholders(text: string, userInfo: UserInfo): string {
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

// Resolve micro placeholders
function resolveMicroPlaceholders(text: string, userInfo: UserInfo): string {
  const pronoun = derivePronoun(userInfo);
  
  const mappings: Record<string, string> = {
    pronoun: pronoun,
    animal: userInfo.favoriteAnimal || pick(FALLBACK_POOLS.animal),
    food: userInfo.favoriteFood || pick(FALLBACK_POOLS.food),
    setting: pick(FALLBACK_POOLS.setting),
    object: pick(FALLBACK_POOLS.object),
    action: pick(FALLBACK_POOLS.action),
    adjective: pick(FALLBACK_POOLS.adjective),
    color: userInfo.favoriteColor || pick(FALLBACK_POOLS.color),
    friend: pick(FALLBACK_POOLS.friend),
    forestType: pick(FALLBACK_POOLS.forestType),
    weatherType: pick(FALLBACK_POOLS.weatherType),
    placeType: pick(FALLBACK_POOLS.placeType)
  };

  let out = text;
  for (const [k, v] of Object.entries(mappings)) {
    if (v) out = out.replace(new RegExp(`\\{${k}\\}`, "g"), v);
  }
  
  return applyGrammarFixes(out, pronoun);
}

// Process scene with microVariants
function processScene(scene: StoryScene, userInfo: UserInfo): string {
  const shouldUseAlternative = Math.random() < 0.3; // 30% chance for variety
  const shouldAddDetail = Math.random() < 0.4; // 40% chance for detail
  
  let text = shouldUseAlternative && scene.microVariants.alternatives.length > 0
    ? pick(scene.microVariants.alternatives)
    : scene.microVariants.text;
  
  // Add optional detail
  if (shouldAddDetail && scene.microVariants.optionalDetails.length > 0) {
    const detail = pick(scene.microVariants.optionalDetails);
    // Simple sentence combination
    text = text.trim().endsWith('.') 
      ? `${text.slice(0, -1)}, and ${detail}.`
      : `${text} ${detail.charAt(0).toUpperCase()}${detail.slice(1)}.`;
  }
  
  // Apply placeholder resolution
  text = resolveCanonicalPlaceholders(text, userInfo);
  text = resolveMicroPlaceholders(text, userInfo);
  
  return cleanup(text);
}

// Process ending
function processEnding(endings: AttachableEnding[], userInfo: UserInfo): string {
  if (endings.length === 0) return "And they lived happily ever after.";
  
  const ending = pick(endings);
  const shouldUseVariant = Math.random() < 0.4 && ending.microVariants.length > 0;
  
  let text = shouldUseVariant ? pick(ending.microVariants) : ending.text;
  
  // Apply placeholder resolution
  text = resolveCanonicalPlaceholders(text, userInfo);
  text = resolveMicroPlaceholders(text, userInfo);
  
  return cleanup(text);
}

/**
 * Convert a StoryTemplate to a string array
 */
export function convertStoryTemplateToStringArray(
  template: StoryTemplate, 
  userInfo: UserInfo = {}, 
  pageCount: number = 5
): string[] {
  console.log(`🔄 Converting template: "${template.title}" for ${pageCount} pages`);
  
  const pages: string[] = [];
  
  // Process scenes up to pageCount - 1 (save one slot for ending)
  const scenesToUse = Math.min(pageCount - 1, template.scenes.length);
  
  for (let i = 0; i < scenesToUse; i++) {
    const processedScene = processScene(template.scenes[i], userInfo);
    pages.push(processedScene);
  }
  
  // Add ending
  const ending = processEnding(template.endings, userInfo);
  pages.push(ending);
  
  console.log(`✅ Template converted to ${pages.length} pages`);
  return pages;
}