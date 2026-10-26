// Grade word lists (public-domain / standard lists), shared by the edge functions and
// the app (src/constants/educationalWords.ts re-exports them). Pure: no imports.
// Guard: src/test/guards/word-lists.test.ts (counts, no duplicates within a list).

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

/** Fry Instant Words, 1st hundred (E. Fry, 1000 Instant Words), in frequency order. */
export const FRY_1ST_100 = ("the of and a to in is you that it he was for on are as with his they I at be this have from " +
  "or one had by words but not what all were we when your can said there use an each which she do how their if will up " +
  "other about out many then them these so some her would make like him into time has look two more write go see number " +
  "no way could people my than first water been call who oil its now find long down day did get come made may part").split(" ");

/** Fry Instant Words, 2nd hundred. */
export const FRY_2ND_100 = ("over new sound take only little work know place years live me back give most very after things " +
  "our just name good sentence man think say great where help through much before line right too means old any same tell " +
  "boy follow came want show also around form three small set put end does another well large must big even such because " +
  "turn here why ask went men read need land different home us move try kind hand picture again change off play spell air " +
  "away animals house point page letters mother answer found study still learn should America world").split(" ");

/**
 * The target words for each Reads-at grade, for prompts and for scoring a story
 * against its grade (re-exported by src/lib/readingLevelMap.ts as GRADE_WORD_LISTS).
 * Pre-K–3rd: Dolch by list (+ nouns) and Fry 1st/2nd hundred. 4th–10th draw on the
 * app's curated level-3/level-4 sets in ./vocabulary (Fry 300–1000 and the Academic
 * Word List are not transcribed yet: no verified copy in the repo).
 */
export const GRADE_SIGHT_WORDS: Readonly<Record<string, readonly string[]>> = Object.freeze({
  PreK: DOLCH_PRE_PRIMER,
  K: [...DOLCH_PRE_PRIMER, ...DOLCH_PRIMER],
  "1": [...DOLCH_FIRST_GRADE, ...FRY_1ST_100.slice(0, 50)],
  "2": [...DOLCH_SECOND_GRADE, ...FRY_1ST_100.slice(50)],
  "3": [...DOLCH_THIRD_GRADE, ...DOLCH_NOUNS, ...FRY_2ND_100],
});
