// Shared placeholder resolver for edge functions
// This is a simplified version of the client-side placeholder resolver

const FALLBACK_POOLS = {
  animal: ["puppy", "kitten", "rabbit", "turtle", "bird", "fox", "bear", "panda", "deer", "owl"],
  food: ["apple", "pancakes", "sandwich", "cookie", "pizza", "noodles"],
  setting: ["forest", "park", "garden", "classroom", "kitchen", "playground"],
  object: ["book", "ball", "kite", "backpack", "lantern", "paintbrush"],
  action: ["play", "explore", "giggle", "dance", "skip", "imagine"],
  adjective: ["little", "brave", "curious", "gentle", "silly", "bright"],
  friendName: ["Sam", "Alex", "Riley", "Taylor", "Jordan", "Casey"],
  color: ["red", "blue", "green", "yellow", "purple", "orange"]
};

const KNOWN_ANIMALS = new Set([
  "cat","dog","puppy","kitten","rabbit","bunny","turtle","bird","owl","fox","bear","panda","deer","lion","tiger","monkey","zebra","giraffe","horse","pig","cow","sheep","goat","duck","chicken","mouse","rat","hamster","parrot","goldfish","fish"
]);

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function cleanup(text) {
  return text
    .replace(/\{[^}]+\}/g, "") // strip unresolved tokens
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.!?:;])/g, "$1")
    .trim();
}

function firstName(name) {
  if (!name) return undefined;
  const parts = name.trim().split(/\s+/);
  return parts[0];
}

function derivePronoun(userInfo) {
  switch (userInfo?.avatar?.type) {
    case "boy":
      return "he";
    case "girl":
      return "she";
    case "prefer-not-to-answer":
      return "they";
    default:
      return "they";
  }
}

function scanForAnimalFromText(text) {
  if (!text) return undefined;
  const words = text.toLowerCase().match(/[a-zA-Z]+/g) || [];
  const irregularMap = {
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
    if (w.endsWith("ies")) singular = w.slice(0, -3) + "y";
    else if (w.endsWith("es")) singular = w.slice(0, -2);
    else if (w.endsWith("s")) singular = w.slice(0, -1);
    if (KNOWN_ANIMALS.has(singular)) return singular;
  }
  return undefined;
}

export function resolveCanonicalPlaceholders(text, userInfo) {
  const map = {
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

export function resolveMicroPlaceholders(text, ctx = {}) {
  const { userInfo, pageText, seed } = ctx;
  const basePronoun = derivePronoun(userInfo);

  const candidate = {
    userName: seed?.userName || seed?.name || firstName(userInfo?.name) || userInfo?.name,
    adjective: seed?.adjective,
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

  const adjective = candidate.adjective || candidate.adjectiveFallback;

  let out = text;
  const mappings = {
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

export function resolveAllPlaceholders(text, ctx = {}) {
  let out = text;
  if (ctx.userInfo) out = resolveCanonicalPlaceholders(out, ctx.userInfo);
  out = resolveMicroPlaceholders(out, ctx);
  return out;
}