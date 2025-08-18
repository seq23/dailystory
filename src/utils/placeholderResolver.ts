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

const FALLBACK_POOLS = {
  animal: ["puppy", "kitten", "rabbit", "turtle", "bird", "fox", "bear", "panda", "deer", "owl"],
  food: ["apple", "pancakes", "sandwich", "cookie", "pizza", "noodles"],
  setting: ["forest", "park", "garden", "classroom", "kitchen", "playground"],
  object: ["book", "ball", "kite", "backpack", "lantern", "paintbrush"],
  action: ["play", "explore", "giggle", "dance", "skip", "imagine"],
  adjective: ["little", "brave", "curious", "gentle", "silly", "bright"],
  friendName: ["Sam", "Alex", "Riley", "Taylor", "Jordan", "Casey"],
  color: ["red", "blue", "green", "yellow", "purple", "orange"]
} as const;

const KNOWN_ANIMALS = new Set([
  "cat","dog","puppy","kitten","rabbit","bunny","turtle","bird","owl","fox","bear","panda","deer","lion","tiger","monkey","zebra","giraffe","horse","pig","cow","sheep","goat","duck","chicken","mouse","rat","hamster","parrot","goldfish","fish"
]);

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function cleanup(text: string): string {
  return text
    .replace(/\{[^}]+\}/g, "") // strip unresolved tokens
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.!?:;])/g, "$1")
    .trim();
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

export function resolveCanonicalPlaceholders(text: string, userInfo: UserInfo): string {
  const map: Record<string, string | undefined> = {
    userName: firstName(userInfo.name) || userInfo.name,
    favoriteColor: userInfo.favoriteColor,
    favoriteAnimal: userInfo.favoriteAnimal,
    favoriteFood: userInfo.favoriteFood,
    hobbies: userInfo.hobbies,
    specialRequest: userInfo.specialRequest
  };

  let out = text;
  for (const [k, v] of Object.entries(map)) {
    if (v) out = out.replace(new RegExp(`\\{${k}\\}`, "g"), v);
  }
  return cleanup(out);
}

// Generate all pronoun forms for comprehensive substitution
function generatePronounSet(baseProform: string): Record<string, string> {
  console.log(`🔍 [DEBUG] Generating pronoun set for base: ${baseProform}`);
  
  switch (baseProform) {
    case "he":
      return { pronoun: "he", he: "he", him: "him", his: "his", himself: "himself" };
    case "she":
      return { pronoun: "she", she: "she", her: "her", hers: "hers", herself: "herself" };
    case "they":
      return { pronoun: "they", they: "they", them: "them", their: "their", theirs: "theirs", themselves: "themselves" };
    default:
      return { pronoun: "they", they: "they", them: "them", their: "their", theirs: "theirs", themselves: "themselves" };
  }
}

export function resolveMicroPlaceholders(text: string, ctx: MicroContext = {}): string {
  const { userInfo, pageText, seed } = ctx;

  const basePronoun = derivePronoun(userInfo);
  const pronounSet = generatePronounSet(basePronoun);
  
  console.log(`🔍 [DEBUG] Generated pronoun set:`, pronounSet);

  const candidate: Record<string, string | undefined> = {
    // bridge from seed variables
    userName: seed?.userName || seed?.name || firstName(userInfo?.name) || userInfo?.name,
    adjective: seed?.adjective,

    // micro tokens with mapping to canonical where sensible
    pronoun: basePronoun,
    animal: seed?.animal || userInfo?.favoriteAnimal || scanForAnimalFromText(pageText) || pick(FALLBACK_POOLS.animal),
    food: seed?.food || userInfo?.favoriteFood || pick(FALLBACK_POOLS.food),
    setting: seed?.setting || pick(FALLBACK_POOLS.setting),
    object: seed?.object || pick(FALLBACK_POOLS.object),
    action: seed?.action || pick(FALLBACK_POOLS.action),
    adjectiveFallback: pick(FALLBACK_POOLS.adjective),
    color: seed?.color || userInfo?.favoriteColor || pick(FALLBACK_POOLS.color),
    friend: seed?.friend || pick(FALLBACK_POOLS.friendName)
  };

  // prefer explicit adjective, else fallback
  const adjective = candidate.adjective || candidate.adjectiveFallback;

  let out = text;
  const mappings: Record<string, string | undefined> = {
    userName: candidate.userName,
    pronoun: candidate.pronoun,
    animal: candidate.animal,
    food: candidate.food,
    setting: candidate.setting,
    object: candidate.object,
    action: candidate.action,
    adjective: adjective,
    color: candidate.color,
    friend: candidate.friend,
    // Add all pronoun forms
    ...pronounSet
  };

  console.log(`🔍 [DEBUG] Final mappings with pronouns:`, mappings);

  for (const [k, v] of Object.entries(mappings)) {
    if (v) out = out.replace(new RegExp(`\\{${k}\\}`, "g"), v);
  }

  if (
    mappings.pronoun === "they" &&
    (APP_CONFIG as any)?.features?.authorVoice?.grammarTweaks?.theyAgreement
  ) {
    out = applyTheyGrammarFixes(out);
  }

  return cleanup(out);
}

export function resolveAllPlaceholders(text: string, ctx: MicroContext = {}): string {
  let out = text;
  if (ctx.userInfo) out = resolveCanonicalPlaceholders(out, ctx.userInfo);
  out = resolveMicroPlaceholders(out, ctx);
  return out;
}
