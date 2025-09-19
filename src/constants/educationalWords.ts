/**
 * Educational Word Lists for Smart Dictionary Caching
 * Combined Dolch and Fry word lists for comprehensive coverage
 */

// Dolch Pre-Primer (40 words) - Most basic sight words
export const DOLCH_PRE_PRIMER = [
  'a', 'and', 'away', 'big', 'blue', 'can', 'come', 'down', 'find', 'for',
  'funny', 'go', 'help', 'here', 'I', 'in', 'is', 'it', 'jump', 'little',
  'look', 'make', 'me', 'my', 'not', 'one', 'play', 'red', 'run', 'said',
  'see', 'the', 'three', 'to', 'two', 'up', 'we', 'where', 'yellow', 'you'
];

// Dolch Primer (52 words) - First grade sight words
export const DOLCH_PRIMER = [
  'all', 'am', 'are', 'at', 'ate', 'be', 'black', 'brown', 'but', 'came',
  'did', 'do', 'eat', 'four', 'get', 'good', 'have', 'he', 'into', 'like',
  'must', 'new', 'no', 'now', 'on', 'our', 'out', 'please', 'pretty', 'ran',
  'ride', 'saw', 'say', 'she', 'so', 'soon', 'that', 'there', 'they', 'this',
  'too', 'under', 'want', 'was', 'well', 'went', 'what', 'white', 'who', 'will',
  'with', 'yes'
];

// Dolch First Grade (41 words)
export const DOLCH_FIRST_GRADE = [
  'after', 'again', 'an', 'any', 'as', 'ask', 'by', 'could', 'every', 'fly',
  'from', 'give', 'going', 'had', 'has', 'her', 'him', 'his', 'how', 'just',
  'know', 'let', 'live', 'may', 'of', 'old', 'once', 'open', 'over', 'put',
  'round', 'some', 'stop', 'take', 'thank', 'them', 'think', 'walk', 'were', 'when'
];

// Dolch Second Grade (46 words)
export const DOLCH_SECOND_GRADE = [
  'always', 'around', 'because', 'been', 'before', 'best', 'both', 'buy', 'call', 'cold',
  'does', 'don\'t', 'fast', 'first', 'five', 'found', 'gave', 'goes', 'green', 'its',
  'made', 'many', 'off', 'or', 'pull', 'read', 'right', 'sing', 'sit', 'sleep',
  'tell', 'their', 'these', 'those', 'upon', 'us', 'use', 'very', 'wash', 'which',
  'why', 'wish', 'work', 'would', 'write', 'your'
];

// Fry's First 100 Words (grades 3-4) - most common words beyond Dolch
export const FRY_FIRST_100 = [
  'about', 'add', 'again', 'air', 'almost', 'along', 'also', 'although', 'always', 'America',
  'another', 'answer', 'any', 'appear', 'area', 'ask', 'back', 'ball', 'base', 'become',
  'bed', 'began', 'begin', 'being', 'below', 'between', 'big', 'black', 'blue', 'boat',
  'book', 'both', 'box', 'boy', 'bring', 'build', 'building', 'business', 'but', 'call',
  'came', 'can', 'car', 'care', 'carry', 'case', 'cat', 'catch', 'cause', 'change',
  'check', 'child', 'children', 'city', 'class', 'close', 'color', 'come', 'company', 'complete',
  'could', 'country', 'course', 'cover', 'create', 'cut', 'day', 'deep', 'did', 'difference',
  'different', 'do', 'does', 'don\'t', 'door', 'down', 'draw', 'during', 'each', 'early',
  'earth', 'easy', 'eat', 'end', 'enough', 'even', 'ever', 'every', 'example', 'eye',
  'face', 'fact', 'family', 'far', 'farm', 'fast', 'father', 'feel', 'few', 'field'
];

// Fry's Second 100 Words (grades 5-6) - intermediate vocabulary
export const FRY_SECOND_100 = [
  'figure', 'fill', 'final', 'find', 'fire', 'first', 'fish', 'five', 'food', 'form',
  'found', 'four', 'friend', 'from', 'front', 'full', 'game', 'gave', 'get', 'girl',
  'give', 'go', 'going', 'good', 'got', 'government', 'great', 'green', 'ground', 'group',
  'grow', 'had', 'half', 'hand', 'hard', 'has', 'have', 'he', 'head', 'hear',
  'heat', 'help', 'her', 'here', 'high', 'him', 'his', 'hold', 'home', 'horse',
  'hot', 'hour', 'house', 'how', 'however', 'hundred', 'I', 'idea', 'if', 'important',
  'in', 'increase', 'inside', 'into', 'is', 'island', 'it', 'its', 'job', 'just',
  'keep', 'kind', 'know', 'land', 'large', 'last', 'later', 'learn', 'leave', 'left',
  'let', 'letter', 'life', 'light', 'like', 'line', 'list', 'little', 'live', 'local',
  'long', 'look', 'lot', 'low', 'machine', 'make', 'man', 'many', 'may', 'me'
];

// Combined educational word list for caching (379 unique words)
export const EDUCATIONAL_WORDS_FOR_CACHE = [
  ...new Set([
    ...DOLCH_PRE_PRIMER,
    ...DOLCH_PRIMER, 
    ...DOLCH_FIRST_GRADE,
    ...DOLCH_SECOND_GRADE,
    ...FRY_FIRST_100,
    ...FRY_SECOND_100
  ])
];

// Word level mappings for difficulty classification
export const WORD_LEVEL_MAP = new Map([
  // Level 0: Dolch Pre-Primer
  ...DOLCH_PRE_PRIMER.map(word => [word, 0] as const),
  
  // Level 1: Dolch Primer
  ...DOLCH_PRIMER.map(word => [word, 1] as const),
  
  // Level 2: Dolch 1st & 2nd Grade
  ...DOLCH_FIRST_GRADE.map(word => [word, 2] as const),
  ...DOLCH_SECOND_GRADE.map(word => [word, 2] as const),
  
  // Level 3: Fry's First 100 (grades 3-4)
  ...FRY_FIRST_100.map(word => [word, 3] as const),
  
  // Level 4: Fry's Second 100 (grades 5-6)
  ...FRY_SECOND_100.map(word => [word, 4] as const)
]);

export const getWordEducationalLevel = (word: string): number => {
  return WORD_LEVEL_MAP.get(word.toLowerCase()) ?? 5; // Default to advanced if not found
};

export const isEducationalWord = (word: string): boolean => {
  return WORD_LEVEL_MAP.has(word.toLowerCase());
};