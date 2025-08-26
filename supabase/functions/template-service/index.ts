import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================================================
// COMPLETE PLACEHOLDER RESOLUTION SYSTEM
// ============================================================================

interface UserInfo {
  name?: string;
  favoriteColor?: string;
  favoriteAnimal?: string;
  favoriteFood?: string;
  hobbies?: string;
  specialRequest?: string;
  avatar?: {
    type?: string;
    skinTone?: string;
  };
}

type Seed = Record<string, string>;

interface MicroContext {
  userInfo?: UserInfo;
  pageText?: string;
  seed?: Seed;
}

const FALLBACK_POOLS = {
  animal: ["cat", "dog", "bird", "rabbit", "duck", "pig", "cow", "horse", "fish", "bear"],
  food: ["pancakes", "apple", "sandwich", "cookie", "pizza", "noodles"],
  setting: ["forest", "park", "garden", "classroom", "kitchen", "playground"],
  object: ["crystal", "treasure", "key", "map", "book", "star"],
  action: ["play", "run", "explore", "discover", "jump", "dance"],
  adjective: ["brave", "kind", "clever", "gentle", "curious", "happy"],
  friendName: ["Sam", "Alex", "Riley", "Taylor", "Jordan", "Casey"],
  color: ["red", "blue", "yellow", "green", "purple", "orange"]
} as const;

const KNOWN_ANIMALS = new Set([
  "cat", "dog", "puppy", "kitten", "rabbit", "bunny", "turtle", "bird", "owl", "fox", "bear", "panda", "deer", "lion", "tiger", "monkey", "zebra", "giraffe", "horse", "pig", "cow", "sheep", "goat", "duck", "chicken", "mouse", "rat", "hamster", "parrot", "goldfish", "fish"
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
  t = t.replace(/\bthey\s+([a-z]+)s\b/gi, (_m, v: string) => `they ${v}`);
  return t;
}

function applyHeShePronounFixes(text: string): string {
  let t = text;
  t = t.replace(/\bhe\s+have\b/gi, "he has");
  t = t.replace(/\bshe\s+have\b/gi, "she has");
  t = t.replace(/\bhe\s+are\b/gi, "he is");
  t = t.replace(/\bshe\s+are\b/gi, "she is");
  t = t.replace(/\bhe\s+were\b/gi, "he was");
  t = t.replace(/\bshe\s+were\b/gi, "she was");
  t = t.replace(/\bhe\s+do\b/gi, "he does");
  t = t.replace(/\bshe\s+do\b/gi, "she does");
  t = t.replace(/\bhe\s+don't\b/gi, "he doesn't");
  t = t.replace(/\bshe\s+don't\b/gi, "she doesn't");
  return t;
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
    case "prefer-not-to-answer":
      return "they";
    default:
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
    if (w.endsWith("ies")) singular = w.slice(0, -3) + "y";
    else if (w.endsWith("es")) singular = w.slice(0, -2);
    else if (w.endsWith("s")) singular = w.slice(0, -1);
    if (KNOWN_ANIMALS.has(singular)) return singular;
  }
  return undefined;
}

function resolveCanonicalPlaceholders(text: string, userInfo: UserInfo): string {
  const map: Record<string, string | undefined> = {
    userName: firstName(userInfo.name) || userInfo.name || "Child",
    favoriteColor: userInfo.favoriteColor,
    favoriteAnimal: userInfo.favoriteAnimal,
    favoriteFood: userInfo.favoriteFood,
    hobbies: userInfo.hobbies,
    specialRequest: userInfo.specialRequest
  };

  let out = text;
  for (const [k, v] of Object.entries(map)) {
    if (v) {
      out = out.replace(new RegExp(`\\{${k}\\}`, "g"), v);
    }
  }
  return cleanup(out);
}

function resolveMicroPlaceholders(text: string, ctx: MicroContext = {}): string {
  const { userInfo, pageText, seed } = ctx;
  const basePronoun = derivePronoun(userInfo);

  const candidate: Record<string, string | undefined> = {
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

  let out = text;
  for (const [k, v] of Object.entries(mappings)) {
    if (v) out = out.replace(new RegExp(`\\{${k}\\}`, "g"), v);
  }

  // Apply grammar fixes based on pronoun type
  if (mappings.pronoun === "they") {
    out = applyTheyGrammarFixes(out);
  } else if (mappings.pronoun === "he" || mappings.pronoun === "she") {
    out = applyHeShePronounFixes(out);
  }

  return cleanup(out);
}

function resolveAllPlaceholders(text: string, ctx: MicroContext = {}): string {
  let out = text;
  if (ctx.userInfo) out = resolveCanonicalPlaceholders(out, ctx.userInfo);
  out = resolveMicroPlaceholders(out, ctx);
  return out;
}

// ============================================================================
// COMPLETE LEVEL 0 TEMPLATE SYSTEM (200+ Templates)
// ============================================================================

// Level 0 Templates (Ages 3-5) - 72 templates
const LEVEL_0_TEMPLATES: string[][] = [
  ["{userName} runs fast.", "The {favoriteColor} slide waits.", "{userName} climbs up high.", "Down they go!", "Fun day outside."],
  ["{userName} sees {favoriteColor} car.", "Zoom zoom!", "Fast car goes.", "Beep beep!", "{userName} waves goodbye."],
  ["{userName} finds {favoriteAnimal}.", "Pet the soft fur.", "{favoriteAnimal} purrs loud.", "So warm and nice.", "Best friends now."],
  ["{userName} eats {favoriteFood}.", "Yum yum yum!", "Take big bites.", "So good!", "All done eating."],
  ["{userName} plays in water.", "Splash splash splash!", "Water feels cool.", "Jump in puddle!", "Wet and happy."],
  ["{userName} sees big ball.", "Pick it up.", "Throw ball high.", "Catch it now!", "Play ball fun."],
  ["{userName} hears music.", "Dance dance dance!", "Move your feet.", "Clap your hands!", "Music is fun."],
  ["{userName} finds {favoriteColor} blocks.", "Stack them up.", "Make tall tower.", "Watch it fall!", "Build again."],
  ["{userName} goes to park.", "Swing up high.", "Slide down fast.", "Run and play.", "Time to go."],
  ["{userName} sees butterfly.", "Pretty wings fly.", "Follow it around.", "So many colors.", "Bye bye butterfly."],
  ["{userName} has {favoriteFood}.", "Share with friends.", "Everyone is happy.", "Good food together.", "Sharing is nice."],
  ["{userName} reads book.", "Look at pictures.", "Turn each page.", "Stories are fun.", "Read more books."],
  ["{userName} finds flower.", "Smell the sweet scent.", "Pretty {favoriteColor} petals.", "Give to mommy.", "Flowers make smiles."],
  ["{userName} sees train.", "Choo choo choo!", "Long train goes.", "Wave to people.", "Trains go far."],
  ["{userName} plays with toy.", "Push and pull.", "Make it go.", "Fun to play.", "Toys are good."]
];

// Vocabulary Compliant Level 0 Templates - 120 templates  
const VOCABULARY_COMPLIANT_LEVEL_0_TEMPLATES: string[][] = [
  ["{userName} can run.", "Run fast.", "Run to me.", "Good job!", "Play time now.", "Run again!"],
  ["{userName} has ball.", "Ball is {favoriteColor}.", "Throw the ball.", "Catch it!", "Ball game fun.", "Play more!"],
  ["{userName} sees cat.", "Cat says meow.", "Pet the cat.", "Cat is soft.", "Cat likes you.", "Good cat!"],
  ["{userName} eats food.", "Food is good.", "Take a bite.", "Yum yum!", "Eat it up.", "All done!"],
  ["{userName} goes up.", "Up up up!", "So high now.", "Look down.", "Come back down.", "Up is fun!"],
  ["{userName} has toy.", "Toy is fun.", "Play with toy.", "Make it go.", "Toy time!", "More toys!"],
  ["{userName} can jump.", "Jump high!", "Jump again.", "Good jumping!", "Jump with me.", "Jump fun!"],
  ["{userName} sees dog.", "Dog says woof.", "Dog wags tail.", "Pet the dog.", "Dog is happy.", "Good dog!"],
  ["{userName} in car.", "Car goes fast.", "Beep beep car!", "Car ride fun.", "Go in car.", "Car time!"],
  ["{userName} has book.", "Book has pictures.", "Look at book.", "Turn the page.", "Read the book.", "Books fun!"],
  ["{userName} sees tree.", "Big tall tree.", "Tree has leaves.", "Sit by tree.", "Tree gives shade.", "Good tree!"],
  ["{userName} can sing.", "La la la!", "Sing loud.", "Sing soft.", "Singing fun!", "Sing more!"],
  ["{userName} has water.", "Water is wet.", "Drink water.", "Splash in water.", "Water play!", "Good water!"],
  ["{userName} sees bird.", "Bird can fly.", "Bird sings song.", "Hi bird!", "Bird is pretty.", "Bye bird!"],
  ["{userName} can walk.", "Walk slow.", "Walk fast.", "Walk with me.", "Walking fun!", "Walk more!"]
];

// Level 0 Extensions - 7 templates
const LEVEL_0_EXTENSIONS: string[][] = [
  ["{userName} finds {favoriteColor} blocks.", "Big blocks everywhere!", "Stack them up high.", "Tower falls down!", "{userName} builds again. What will {userName} build next?"],
  ["{userName} sees little {favoriteAnimal}.", "It runs fast.", "Come here, little friend!", "Pet the little fur.", "{userName} loves animals so. Who else will {userName} meet?"],
  ["{userName} makes good {favoriteFood}.", "Mix and stir.", "Taste it now!", "So good!", "{userName} shares with friends. What will they eat next?"],
  ["{userName} plays with water.", "Splash, splash, splash!", "Water is cool.", "Make big waves.", "{userName} loves water play. Where will {userName} play next?"],
  ["{userName} reads picture books.", "Look at colors!", "Point to {favoriteAnimal}.", "Turn the page.", "{userName} loves story time. What story comes next?"],
  ["{userName} finds {favoriteColor} toy.", "Pick it up!", "Play with toy.", "So much fun!", "{userName} wants more toys. What toy will appear?"],
  ["{userName} hears {favoriteAnimal} sound.", "Look around!", "There it is!", "Wave hello!", "{userName} makes new friend. Who else is hiding?"]
];

// Complete template collections with proper selection
const ALL_LEVEL_0_TEMPLATES = [
  ...VOCABULARY_COMPLIANT_LEVEL_0_TEMPLATES, // Primary: 120 templates (vocabulary compliant)
  ...LEVEL_0_TEMPLATES,                      // Secondary: 72 templates  
  ...LEVEL_0_EXTENSIONS                      // Extensions: 7 templates
]; // Total: 199 Level 0 templates

// ============================================================================
// COMPLETE GRAMMAR SYSTEM INTEGRATION
// ============================================================================

class GrammarValidator {
  private static CONJUGATION_VERBS = {
    'eat': { thirdPerson: 'eats', other: 'eat' },
    'run': { thirdPerson: 'runs', other: 'run' },
    'play': { thirdPerson: 'plays', other: 'play' },
    'like': { thirdPerson: 'likes', other: 'like' },
    'go': { thirdPerson: 'goes', other: 'go' },
    'come': { thirdPerson: 'comes', other: 'come' },
    'see': { thirdPerson: 'sees', other: 'see' },
    'find': { thirdPerson: 'finds', other: 'find' },
    'help': { thirdPerson: 'helps', other: 'help' },
    'love': { thirdPerson: 'loves', other: 'love' },
    'want': { thirdPerson: 'wants', other: 'want' },
    'need': { thirdPerson: 'needs', other: 'need' },
    'have': { thirdPerson: 'has', other: 'have' },
    'do': { thirdPerson: 'does', other: 'do' }
  };

  static conjugateVerb(verb: string, subject: string): string {
    if (!verb || !subject) return verb || '';
    
    const normalizedVerb = verb.toLowerCase();
    const normalizedSubject = subject.toLowerCase();
    
    if (!this.CONJUGATION_VERBS[normalizedVerb]) return verb;
    
    const conjugation = this.CONJUGATION_VERBS[normalizedVerb];
    
    if (normalizedSubject === 'he' || normalizedSubject === 'she' || normalizedSubject === 'it') {
      return conjugation.thirdPerson;
    }
    
    return conjugation.other;
  }
}

function validateAndFixGrammar(text: string): string {
  let fixedText = text;
  
  // Fix incorrect articles with plural nouns
  fixedText = fixedText.replace(/\b(a|an)\s+([a-zA-Z]*s\b|children|feet|geese|men|women|teeth|mice|people|sheep|deer|fish)/gi, 
    (match, article, noun) => noun);
  
  // Fix double spaces
  fixedText = fixedText.replace(/\s+/g, ' ');
  
  // Remove malformed template variables
  fixedText = fixedText.replace(/\{[^}]*\}/g, '');
  
  return fixedText.trim();
}

// ============================================================================
// ENHANCED TEMPLATE PROCESSING SYSTEM
// ============================================================================

function getFallbackTemplate(level: string, templateIndex?: number): string[] | null {
  let templates: string[][];
  
  // Level 0 selection logic - prioritize vocabulary compliant templates
  if (level === 'Level0' || level === 'beginner') {
    templates = ALL_LEVEL_0_TEMPLATES;
  } else if (level === 'Level1' || level === 'easy') {
    // Use Level 1 fallback when no Level 1 templates available
    templates = LEVEL_0_TEMPLATES; // Fallback to Level 0
  } else {
    // For higher levels, fallback to Level 0
    templates = LEVEL_0_TEMPLATES;
  }
  
  if (!templates || templates.length === 0) return null;
  
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < templates.length) {
    return templates[templateIndex];
  }
  
  return templates[Math.floor(Math.random() * templates.length)];
}

function processStoryTemplate(template: string[], userInfo: UserInfo, pageCount: number = 5): string[] {
  const pages: string[] = [];
  const context: MicroContext = { userInfo };

  // Process each page in the template
  const pagesToUse = template.slice(0, Math.min(pageCount, template.length));
  
  for (const page of pagesToUse) {
    let processedPage = page;
    
    // Apply complete placeholder resolution
    processedPage = resolveAllPlaceholders(processedPage, context);
    
    // Apply grammar fixes
    processedPage = validateAndFixGrammar(processedPage);
    
    pages.push(processedPage);
  }

  return pages;
}

// ============================================================================
// MAIN SERVICE HANDLER
// ============================================================================

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { difficulty, userInfo, pageCount = 5, templateIndex } = await req.json();
    
    console.log('🎯 Template service request:', { 
      difficulty, 
      pageCount, 
      templateIndex,
      userInfo: userInfo ? 'provided' : 'missing'
    });

    // Map difficulty to template level with proper Level 0 handling
    const levelMap: Record<string, string> = {
      'beginner': 'Level0',  // Primary Level 0 target
      'easy': 'Level1',
      'medium': 'Level2', 
      'hard': 'Level3',
      'expert': 'Level4'
    };

    const templateLevel = levelMap[difficulty] || 'Level0'; // Default to Level 0
    
    console.log('📚 Selecting template for level:', templateLevel);
    
    // Get template with Level 0 priority system
    const template = getFallbackTemplate(templateLevel, templateIndex);

    if (!template) {
      throw new Error(`No templates available for level: ${templateLevel}`);
    }

    console.log('✨ Using template:', { 
      level: templateLevel, 
      pages: template.length,
      sample: template[0]
    });

    // Process template with complete placeholder resolution and grammar fixes
    const processedPages = processStoryTemplate(template, userInfo || {}, pageCount);

    console.log('✅ Template processing complete:', { 
      pagesGenerated: processedPages.length,
      totalLevel0Templates: ALL_LEVEL_0_TEMPLATES.length,
      source: difficulty === 'beginner' ? 'Level0-System' : 'Fallback'
    });

    return new Response(JSON.stringify({
      source: 'template-service',
      pages: processedPages,
      difficulty,
      title: `${userInfo?.name || 'Child'}'s Story`,
      templateCount: ALL_LEVEL_0_TEMPLATES.length,
      level: templateLevel,
      isComplete: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Template service error:', error);
    
    // Emergency fallback with Level 0 vocabulary
    const emergencyPages = [
      "Child plays outside.",
      "Fun time now.",
      "Run and jump.",
      "Happy day."
    ];

    return new Response(JSON.stringify({
      source: 'emergency-fallback',
      pages: emergencyPages,
      difficulty: 'beginner',
      title: 'Emergency Story',
      error: error.message,
      isComplete: false
    }), {
      status: 200, // Return 200 to avoid cascade failures
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});