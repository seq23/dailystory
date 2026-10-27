// The standard word lists, the ONE copy in the repo: Dolch, Fry 1,000 and the Academic
// Word List. Shared by the edge functions and the app (src/constants/educationalWords.ts
// and src/lib/readingLevelMap.ts re-export them). Pure data: no imports. Which grade
// gets which list: ./gradeWords.ts. Provenance: docs/reading-levels.md.
// Guard: src/test/guards/word-lists.test.ts (counts, no duplicates, no second copy).

/** Dolch sight words, 220 service words in five lists (E. W. Dolch, 1936/1948). */
export const DOLCH_PRE_PRIMER = [
  "a", "and", "away", "big", "blue", "can", "come", "down", "find", "for",
  "funny", "go", "help", "here", "I", "in", "is", "it", "jump", "little",
  "look", "make", "me", "my", "not", "one", "play", "red", "run", "said",
  "see", "the", "three", "to", "two", "up", "we", "where", "yellow", "you",
] as const;

export const DOLCH_PRIMER = [
  "all", "am", "are", "at", "ate", "be", "black", "brown", "but", "came",
  "did", "do", "eat", "four", "get", "good", "have", "he", "into", "like",
  "must", "new", "no", "now", "on", "our", "out", "please", "pretty", "ran",
  "ride", "saw", "say", "she", "so", "soon", "that", "there", "they", "this",
  "too", "under", "want", "was", "well", "went", "what", "white", "who", "will",
  "with", "yes",
] as const;

export const DOLCH_FIRST_GRADE = [
  "after", "again", "an", "any", "as", "ask", "by", "could", "every", "fly",
  "from", "give", "going", "had", "has", "her", "him", "his", "how", "just",
  "know", "let", "live", "may", "of", "old", "once", "open", "over", "put",
  "round", "some", "stop", "take", "thank", "them", "then", "think", "walk", "were",
  "when",
] as const;

export const DOLCH_SECOND_GRADE = [
  "always", "around", "because", "been", "before", "best", "both", "buy", "call", "cold",
  "does", "don't", "fast", "first", "five", "found", "gave", "goes", "green", "its",
  "made", "many", "off", "or", "pull", "read", "right", "sing", "sit", "sleep",
  "tell", "their", "these", "those", "upon", "us", "use", "very", "wash", "which",
  "why", "wish", "work", "would", "write", "your",
] as const;

export const DOLCH_THIRD_GRADE = [
  "about", "better", "bring", "carry", "clean", "cut", "done", "draw", "drink", "eight",
  "fall", "far", "full", "got", "grow", "hold", "hot", "hurt", "if", "keep",
  "kind", "laugh", "light", "long", "much", "myself", "never", "only", "own", "pick",
  "seven", "shall", "show", "six", "small", "start", "ten", "today", "together", "try",
  "warm",
] as const;

/** Dolch's 95 high-frequency nouns. */
export const DOLCH_NOUNS = [
  "apple", "baby", "back", "ball", "bear", "bed", "bell", "bird", "birthday", "boat",
  "box", "boy", "bread", "brother", "cake", "car", "cat", "chair", "chicken", "children",
  "Christmas", "coat", "corn", "cow", "day", "dog", "doll", "door", "duck", "egg",
  "eye", "farm", "farmer", "father", "feet", "fire", "fish", "floor", "flower", "game",
  "garden", "girl", "goodbye", "grass", "ground", "hand", "head", "hill", "home", "horse",
  "house", "kitty", "leg", "letter", "man", "men", "milk", "money", "morning", "mother",
  "name", "nest", "night", "paper", "party", "picture", "pig", "rabbit", "rain", "ring",
  "robin", "Santa Claus", "school", "seed", "sheep", "shoe", "sister", "snow", "song", "squirrel",
  "stick", "street", "sun", "table", "thing", "time", "top", "toy", "tree", "watch",
  "water", "way", "wind", "window", "wood",
] as const;

export const DOLCH_SERVICE_WORDS: readonly string[] = [
  ...DOLCH_PRE_PRIMER, ...DOLCH_PRIMER, ...DOLCH_FIRST_GRADE, ...DOLCH_SECOND_GRADE, ...DOLCH_THIRD_GRADE,
];

/**
 * Fry's 1,000 Instant Words, ten hundreds in frequency order (E. Fry; Fry, Kress &
 * Fountoukidis, The Reading Teacher's Book of Lists). FRY_HUNDREDS[0] is the 1st hundred.
 * Verified 26 Oct 2026 against two primary copies plus three tie-breakers; provenance and
 * every disagreement: docs/reading-levels.md, "Where the word lists come from".
 */
export const FRY_HUNDREDS: readonly (readonly string[])[] = Object.freeze([
  [ // 1st hundred
    "the", "of", "and", "a", "to", "in", "is", "you", "that", "it",
    "he", "was", "for", "on", "are", "as", "with", "his", "they", "I",
    "at", "be", "this", "have", "from", "or", "one", "had", "by", "words",
    "but", "not", "what", "all", "were", "we", "when", "your", "can", "said",
    "there", "use", "an", "each", "which", "she", "do", "how", "their", "if",
    "will", "up", "other", "about", "out", "many", "then", "them", "these", "so",
    "some", "her", "would", "make", "like", "him", "into", "time", "has", "look",
    "two", "more", "write", "go", "see", "number", "no", "way", "could", "people",
    "my", "than", "first", "water", "been", "called", "who", "am", "its", "now",
    "find", "long", "down", "day", "did", "get", "come", "made", "may", "part",
  ],
  [ // 2nd hundred
    "over", "new", "sound", "take", "only", "little", "work", "know", "place", "years",
    "live", "me", "back", "give", "most", "very", "after", "things", "our", "just",
    "name", "good", "sentence", "man", "think", "say", "great", "where", "help", "through",
    "much", "before", "line", "right", "too", "means", "old", "any", "same", "tell",
    "boy", "following", "came", "want", "show", "also", "around", "form", "three", "small",
    "set", "put", "end", "does", "another", "well", "large", "must", "big", "even",
    "such", "because", "turn", "here", "why", "ask", "went", "men", "read", "need",
    "land", "different", "home", "us", "move", "try", "kind", "hand", "picture", "again",
    "change", "off", "play", "spell", "air", "away", "animal", "house", "point", "page",
    "letter", "mother", "answer", "found", "study", "still", "learn", "should", "America", "world",
  ],
  [ // 3rd hundred
    "high", "every", "near", "add", "food", "between", "own", "below", "country", "plant",
    "last", "school", "father", "keep", "tree", "never", "start", "city", "earth", "eyes",
    "light", "thought", "head", "under", "story", "saw", "left", "don't", "few", "while",
    "along", "might", "close", "something", "seem", "next", "hard", "open", "example", "beginning",
    "life", "always", "those", "both", "paper", "together", "got", "group", "often", "run",
    "important", "until", "children", "side", "feet", "car", "mile", "night", "walk", "white",
    "sea", "began", "grow", "took", "river", "four", "carry", "state", "once", "book",
    "hear", "stop", "without", "second", "later", "miss", "idea", "enough", "eat", "face",
    "watch", "far", "Indian", "real", "almost", "let", "above", "girl", "sometimes", "mountains",
    "cut", "young", "talk", "soon", "list", "song", "being", "leave", "family", "it's",
  ],
  [ // 4th hundred
    "body", "music", "color", "stand", "sun", "questions", "fish", "area", "mark", "dog",
    "horse", "birds", "problem", "complete", "room", "knew", "since", "ever", "piece", "told",
    "usually", "didn't", "friends", "easy", "heard", "order", "red", "door", "sure", "become",
    "top", "ship", "across", "today", "during", "short", "better", "best", "however", "low",
    "hours", "black", "products", "happened", "whole", "measure", "remember", "early", "waves", "reached",
    "listen", "wind", "rock", "space", "covered", "fast", "several", "hold", "himself", "toward",
    "five", "step", "morning", "passed", "vowel", "true", "hundred", "against", "pattern", "numeral",
    "table", "north", "slowly", "money", "map", "farm", "pulled", "draw", "voice", "seen",
    "cold", "cried", "plan", "notice", "south", "sing", "war", "ground", "fall", "king",
    "town", "I'll", "unit", "figure", "certain", "field", "travel", "wood", "fire", "upon",
  ],
  [ // 5th hundred
    "done", "English", "road", "half", "ten", "fly", "gave", "box", "finally", "wait",
    "correct", "oh", "quickly", "person", "became", "shown", "minutes", "strong", "verb", "stars",
    "front", "feel", "fact", "inches", "street", "decided", "contain", "course", "surface", "produce",
    "building", "ocean", "class", "note", "nothing", "rest", "carefully", "scientists", "inside", "wheels",
    "stay", "green", "known", "island", "week", "less", "machine", "base", "ago", "stood",
    "plane", "system", "behind", "ran", "round", "boat", "game", "force", "brought", "understand",
    "warm", "common", "bring", "explain", "dry", "though", "language", "shape", "deep", "thousands",
    "yes", "clear", "equation", "yet", "government", "filled", "heat", "full", "hot", "check",
    "object", "bread", "rule", "among", "noun", "power", "cannot", "able", "six", "size",
    "dark", "ball", "material", "special", "heavy", "fine", "pair", "circle", "include", "built",
  ],
  [ // 6th hundred
    "can't", "matter", "square", "syllables", "perhaps", "bill", "felt", "suddenly", "test", "direction",
    "center", "farmers", "ready", "anything", "divided", "general", "energy", "subject", "Europe", "moon",
    "region", "return", "believe", "dance", "members", "picked", "simple", "cells", "paint", "mind",
    "love", "cause", "rain", "exercise", "eggs", "train", "blue", "wish", "drop", "developed",
    "window", "difference", "distance", "heart", "sit", "sum", "summer", "wall", "forest", "probably",
    "legs", "sat", "main", "winter", "wide", "written", "length", "reason", "kept", "interest",
    "arms", "brother", "race", "present", "beautiful", "store", "job", "edge", "past", "sign",
    "record", "finished", "discovered", "wild", "happy", "beside", "gone", "sky", "glass", "million",
    "west", "lay", "weather", "root", "instruments", "meet", "third", "months", "paragraph", "raised",
    "represent", "soft", "whether", "clothes", "flowers", "shall", "teacher", "held", "describe", "drive",
  ],
  [ // 7th hundred
    "cross", "speak", "solve", "appear", "metal", "son", "either", "ice", "sleep", "village",
    "factors", "result", "jumped", "snow", "ride", "care", "floor", "hill", "pushed", "baby",
    "buy", "century", "outside", "everything", "tall", "already", "instead", "phrase", "soil", "bed",
    "copy", "free", "hope", "spring", "case", "laughed", "nation", "quite", "type", "themselves",
    "temperature", "bright", "lead", "everyone", "method", "section", "lake", "iron", "within", "dictionary",
    "hair", "age", "amount", "scale", "pounds", "although", "per", "broken", "moment", "tiny",
    "possible", "gold", "milk", "quiet", "natural", "lot", "stone", "act", "build", "middle",
    "speed", "count", "consonant", "someone", "sail", "rolled", "bear", "wonder", "smiled", "angle",
    "fraction", "Africa", "killed", "melody", "bottom", "trip", "hole", "poor", "let's", "fight",
    "surprise", "French", "died", "beat", "exactly", "remain", "dress", "cat", "couldn't", "fingers",
  ],
  [ // 8th hundred
    "row", "least", "catch", "climbed", "wrote", "shouted", "continued", "itself", "else", "plains",
    "gas", "England", "burning", "design", "joined", "foot", "law", "ears", "grass", "you're",
    "grew", "skin", "valley", "cents", "key", "president", "brown", "trouble", "cool", "cloud",
    "lost", "sent", "symbols", "wear", "bad", "save", "experiment", "engine", "alone", "drawing",
    "east", "choose", "single", "touch", "information", "express", "mouth", "yard", "equal", "decimal",
    "yourself", "control", "practice", "report", "straight", "rise", "statement", "stick", "party", "seeds",
    "suppose", "woman", "coast", "bank", "period", "wire", "pay", "clean", "visit", "bit",
    "whose", "received", "garden", "please", "strange", "caught", "fell", "team", "God", "captain",
    "direct", "ring", "serve", "child", "desert", "increase", "history", "cost", "maybe", "business",
    "separate", "break", "uncle", "hunting", "flow", "lady", "students", "human", "art", "feeling",
  ],
  [ // 9th hundred
    "supply", "corner", "electric", "insects", "crops", "tone", "hit", "sand", "doctor", "provide",
    "thus", "won't", "cook", "bones", "mall", "board", "modern", "compound", "mine", "wasn't",
    "fit", "addition", "belong", "safe", "soldiers", "guess", "silent", "trade", "rather", "compare",
    "crowd", "poem", "enjoy", "elements", "indicate", "except", "expect", "flat", "seven", "interesting",
    "sense", "string", "blow", "famous", "value", "wings", "movement", "pole", "exciting", "branches",
    "thick", "blood", "lie", "spot", "bell", "fun", "loud", "consider", "suggested", "thin",
    "position", "entered", "fruit", "tied", "rich", "dollars", "send", "sight", "chief", "Japanese",
    "stream", "planets", "rhythm", "eight", "science", "major", "observe", "tube", "necessary", "weight",
    "meat", "lifted", "process", "army", "hat", "property", "particular", "swim", "terms", "current",
    "park", "sell", "shoulder", "industry", "wash", "block", "spread", "cattle", "wife", "sharp",
  ],
  [ // 10th hundred
    "company", "radio", "we'll", "action", "capital", "factories", "settled", "yellow", "isn't", "southern",
    "truck", "fair", "printed", "wouldn't", "ahead", "chance", "born", "level", "triangle", "molecules",
    "France", "repeated", "column", "western", "church", "sister", "oxygen", "plural", "various", "agreed",
    "opposite", "wrong", "chart", "prepared", "pretty", "solution", "fresh", "shop", "suffix", "especially",
    "shoes", "actually", "nose", "afraid", "dead", "sugar", "adjective", "fig", "office", "huge",
    "gun", "similar", "death", "score", "forward", "stretched", "experience", "rose", "allow", "fear",
    "workers", "Washington", "Greek", "women", "bought", "led", "march", "northern", "create", "British",
    "difficult", "match", "win", "doesn't", "steel", "total", "deal", "determine", "evening", "hoe",
    "rope", "cotton", "apple", "details", "entire", "corn", "substances", "smell", "tools", "conditions",
    "cows", "track", "arrived", "located", "sir", "seat", "division", "effect", "underline", "view",
  ],
]);

/**
 * Coxhead's Academic Word List (Coxhead, 2000), 570 headwords in ten sublists, most
 * frequent first (1–9: 60 each, 10: 30). AWL_SUBLISTS[0] is sublist 1. Verified 26 Oct 2026
 * against the Victoria University of Wellington sublist pages, its headword PDF and the
 * EAP Foundation list; provenance: docs/reading-levels.md.
 */
export const AWL_SUBLISTS: readonly (readonly string[])[] = Object.freeze([
  [ // sublist 1
    "analyse", "approach", "area", "assess", "assume", "authority", "available", "benefit", "concept", "consist",
    "constitute", "context", "contract", "create", "data", "define", "derive", "distribute", "economy", "environment",
    "establish", "estimate", "evident", "export", "factor", "finance", "formula", "function", "identify", "income",
    "indicate", "individual", "interpret", "involve", "issue", "labour", "legal", "legislate", "major", "method",
    "occur", "percent", "period", "policy", "principle", "proceed", "process", "require", "research", "respond",
    "role", "section", "sector", "significant", "similar", "source", "specific", "structure", "theory", "vary",
  ],
  [ // sublist 2
    "achieve", "acquire", "administrate", "affect", "appropriate", "aspect", "assist", "category", "chapter", "commission",
    "community", "complex", "compute", "conclude", "conduct", "consequent", "construct", "consume", "credit", "culture",
    "design", "distinct", "element", "equate", "evaluate", "feature", "final", "focus", "impact", "injure",
    "institute", "invest", "item", "journal", "maintain", "normal", "obtain", "participate", "perceive", "positive",
    "potential", "previous", "primary", "purchase", "range", "region", "regulate", "relevant", "reside", "resource",
    "restrict", "secure", "seek", "select", "site", "strategy", "survey", "text", "tradition", "transfer",
  ],
  [ // sublist 3
    "alternative", "circumstance", "comment", "compensate", "component", "consent", "considerable", "constant", "constrain", "contribute",
    "convene", "coordinate", "core", "corporate", "correspond", "criteria", "deduce", "demonstrate", "document", "dominate",
    "emphasis", "ensure", "exclude", "framework", "fund", "illustrate", "immigrate", "imply", "initial", "instance",
    "interact", "justify", "layer", "link", "locate", "maximise", "minor", "negate", "outcome", "partner",
    "philosophy", "physical", "proportion", "publish", "react", "register", "rely", "remove", "scheme", "sequence",
    "sex", "shift", "specify", "sufficient", "task", "technical", "technique", "technology", "valid", "volume",
  ],
  [ // sublist 4
    "access", "adequate", "annual", "apparent", "approximate", "attitude", "attribute", "civil", "code", "commit",
    "communicate", "concentrate", "confer", "contrast", "cycle", "debate", "despite", "dimension", "domestic", "emerge",
    "error", "ethnic", "goal", "grant", "hence", "hypothesis", "implement", "implicate", "impose", "integrate",
    "internal", "investigate", "job", "label", "mechanism", "obvious", "occupy", "option", "output", "overall",
    "parallel", "parameter", "phase", "predict", "principal", "prior", "professional", "project", "promote", "regime",
    "resolve", "retain", "series", "statistic", "status", "stress", "subsequent", "sum", "summary", "undertake",
  ],
  [ // sublist 5
    "academy", "adjust", "alter", "amend", "aware", "capacity", "challenge", "clause", "compound", "conflict",
    "consult", "contact", "decline", "discrete", "draft", "enable", "energy", "enforce", "entity", "equivalent",
    "evolve", "expand", "expose", "external", "facilitate", "fundamental", "generate", "generation", "image", "liberal",
    "licence", "logic", "margin", "medical", "mental", "modify", "monitor", "network", "notion", "objective",
    "orient", "perspective", "precise", "prime", "psychology", "pursue", "ratio", "reject", "revenue", "stable",
    "style", "substitute", "sustain", "symbol", "target", "transit", "trend", "version", "welfare", "whereas",
  ],
  [ // sublist 6
    "abstract", "accurate", "acknowledge", "aggregate", "allocate", "assign", "attach", "author", "bond", "brief",
    "capable", "cite", "cooperate", "discriminate", "display", "diverse", "domain", "edit", "enhance", "estate",
    "exceed", "expert", "explicit", "federal", "fee", "flexible", "furthermore", "gender", "ignorant", "incentive",
    "incidence", "incorporate", "index", "inhibit", "initiate", "input", "instruct", "intelligent", "interval", "lecture",
    "migrate", "minimum", "ministry", "motive", "neutral", "nevertheless", "overseas", "precede", "presume", "rational",
    "recover", "reveal", "scope", "subsidy", "tape", "trace", "transform", "transport", "underlie", "utilise",
  ],
  [ // sublist 7
    "adapt", "adult", "advocate", "aid", "channel", "chemical", "classic", "comprehensive", "comprise", "confirm",
    "contrary", "convert", "couple", "decade", "definite", "deny", "differentiate", "dispose", "dynamic", "eliminate",
    "empirical", "equip", "extract", "file", "finite", "foundation", "globe", "grade", "guarantee", "hierarchy",
    "identical", "ideology", "infer", "innovate", "insert", "intervene", "isolate", "media", "mode", "paradigm",
    "phenomenon", "priority", "prohibit", "publication", "quote", "release", "reverse", "simulate", "sole", "somewhat",
    "submit", "successor", "survive", "thesis", "topic", "transmit", "ultimate", "unique", "visible", "voluntary",
  ],
  [ // sublist 8
    "abandon", "accompany", "accumulate", "ambiguous", "append", "appreciate", "arbitrary", "automate", "bias", "chart",
    "clarify", "commodity", "complement", "conform", "contemporary", "contradict", "crucial", "currency", "denote", "detect",
    "deviate", "displace", "drama", "eventual", "exhibit", "exploit", "fluctuate", "guideline", "highlight", "implicit",
    "induce", "inevitable", "infrastructure", "inspect", "intense", "manipulate", "minimise", "nuclear", "offset", "paragraph",
    "plus", "practitioner", "predominant", "prospect", "radical", "random", "reinforce", "restore", "revise", "schedule",
    "tense", "terminate", "theme", "thereby", "uniform", "vehicle", "via", "virtual", "visual", "widespread",
  ],
  [ // sublist 9
    "accommodate", "analogy", "anticipate", "assure", "attain", "behalf", "bulk", "cease", "coherent", "coincide",
    "commence", "compatible", "concurrent", "confine", "controversy", "converse", "device", "devote", "diminish", "distort",
    "duration", "erode", "ethic", "format", "found", "inherent", "insight", "integral", "intermediate", "manual",
    "mature", "mediate", "medium", "military", "minimal", "mutual", "norm", "overlap", "passive", "portion",
    "preliminary", "protocol", "qualitative", "refine", "relax", "restrain", "revolution", "rigid", "route", "scenario",
    "sphere", "subordinate", "supplement", "suspend", "team", "temporary", "trigger", "unify", "violate", "vision",
  ],
  [ // sublist 10
    "adjacent", "albeit", "assemble", "collapse", "colleague", "compile", "conceive", "convince", "depress", "encounter",
    "enormous", "forthcoming", "incline", "integrity", "intrinsic", "invoke", "levy", "likewise", "nonetheless", "notwithstanding",
    "odd", "ongoing", "panel", "persist", "pose", "reluctance", "so-called", "straightforward", "undergo", "whereby",
  ],
]);
/** Fry Instant Words, 1st hundred (FRY_HUNDREDS[0]). */
export const FRY_1ST_100: readonly string[] = FRY_HUNDREDS[0] ?? [];

/** Fry Instant Words, 2nd hundred (FRY_HUNDREDS[1]). */
export const FRY_2ND_100: readonly string[] = FRY_HUNDREDS[1] ?? [];
