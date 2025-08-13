import type { UserInfo } from "@/types";

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
  food: ["apple", "pancake", "sandwich", "cookie", "pizza", "noodles"],
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

function firstName(name?: string): string | undefined {
  if (!name) return undefined;
  const parts = name.trim().split(/\s+/);
  return parts[0];
}

function derivePronoun(userInfo?: UserInfo): string {
  switch (userInfo?.avatar?.type) {
    case "boy":
      return "he";
    case "girl":
      return "she";
    default:
      return "they";
  }
}

function scanForAnimalFromText(text?: string): string | undefined {
  if (!text) return undefined;
  const words = text.toLowerCase().match(/[a-zA-Z]+/g) || [];
  for (const w of words) {
    if (KNOWN_ANIMALS.has(w)) return w;
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

export function resolveMicroPlaceholders(text: string, ctx: MicroContext = {}): string {
  const { userInfo, pageText, seed } = ctx;

  const candidate: Record<string, string | undefined> = {
    // bridge from seed variables
    userName: seed?.userName || seed?.name || firstName(userInfo?.name) || userInfo?.name,
    adjective: seed?.adjective,

    // micro tokens with mapping to canonical where sensible
    pronoun: derivePronoun(userInfo),
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
    friend: candidate.friend
  };

  for (const [k, v] of Object.entries(mappings)) {
    if (v) out = out.replace(new RegExp(`\\{${k}\\}`, "g"), v);
  }

  return cleanup(out);
}

export function resolveAllPlaceholders(text: string, ctx: MicroContext = {}): string {
  let out = text;
  if (ctx.userInfo) out = resolveCanonicalPlaceholders(out, ctx.userInfo);
  out = resolveMicroPlaceholders(out, ctx);
  return out;
}
