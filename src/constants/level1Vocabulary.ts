// Level 1 vocabulary for 3-5 year olds (sight words and simple concepts)
export const LEVEL_1_VOCABULARY = new Set([
  // Basic sight words
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were', 'will', 'with',
  
  // Simple verbs (present tense)
  'go', 'goes', 'see', 'sees', 'run', 'runs', 'play', 'plays', 'eat', 'eats', 'get', 'gets', 'give', 'gives', 'look', 'looks', 'find', 'finds', 'help', 'helps', 'come', 'comes', 'want', 'wants', 'like', 'likes', 'make', 'makes', 'take', 'takes', 'walk', 'walks', 'jump', 'jumps', 'sit', 'sits', 'put', 'puts', 'stop', 'stops', 'call', 'calls', 'show', 'shows', 'open', 'opens', 'close', 'closes', 'ask', 'asks', 'tell', 'tells', 'know', 'knows', 'say', 'says', 'think', 'thinks', 'feel', 'feels', 'hear', 'hears', 'hold', 'holds', 'keep', 'keeps', 'let', 'lets', 'live', 'lives', 'love', 'loves', 'move', 'moves', 'need', 'needs', 'pull', 'pulls', 'push', 'pushes', 'read', 'reads', 'sleep', 'sleeps', 'stand', 'stands', 'start', 'starts', 'try', 'tries', 'turn', 'turns', 'use', 'uses', 'wait', 'waits', 'work', 'works', 'write', 'writes',
  
  // Simple animals
  'cat', 'dog', 'bird', 'fish', 'cow', 'pig', 'duck', 'hen', 'bee', 'bug', 'bear', 'fox', 'frog', 'mouse', 'horse', 'lion', 'tiger', 'sheep', 'goat', 'owl', 'bat', 'ant', 'fly',
  
  // Basic colors
  'red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'brown', 'orange', 'purple', 'gray', 'grey',
  
  // Simple objects and things
  'ball', 'book', 'box', 'car', 'cup', 'door', 'egg', 'hat', 'home', 'house', 'key', 'milk', 'pan', 'pen', 'pot', 'run', 'sun', 'top', 'toy', 'tree', 'bed', 'bag', 'bat', 'bell', 'bike', 'boat', 'bone', 'cake', 'coat', 'corn', 'desk', 'doll', 'drum', 'farm', 'fire', 'flag', 'game', 'gift', 'hill', 'hole', 'ice', 'jail', 'jet', 'joke', 'king', 'kite', 'lake', 'lamp', 'leaf', 'leg', 'log', 'map', 'moon', 'nail', 'nest', 'net', 'nose', 'park', 'path', 'pie', 'pool', 'rain', 'road', 'rock', 'rope', 'rose', 'sail', 'sand', 'sea', 'seed', 'ship', 'sock', 'star', 'step', 'tag', 'tail', 'team', 'tent', 'test', 'toe', 'tool', 'town', 'train', 'truck', 'wall', 'wave', 'well', 'wind', 'wing', 'wood', 'yard', 'zoo',
  
  // Simple food
  'apple', 'banana', 'bread', 'cake', 'cheese', 'cookie', 'fish', 'food', 'ice', 'meat', 'milk', 'pie', 'rice', 'soup', 'tea', 'water',
  
  // Simple people and family
  'mom', 'dad', 'baby', 'boy', 'girl', 'man', 'woman', 'friend', 'teacher', 'child', 'kids', 'family',
  
  // Simple places
  'home', 'house', 'room', 'yard', 'park', 'school', 'store', 'farm', 'zoo', 'beach', 'forest', 'garden',
  
  // Simple descriptors (keep to minimum)
  'big', 'small', 'good', 'bad', 'hot', 'cold', 'old', 'new', 'fast', 'slow', 'happy', 'sad', 'nice', 'pretty', 'fun', 'long', 'short', 'tall', 'clean', 'dirty', 'dry', 'wet', 'full', 'empty', 'hard', 'soft', 'high', 'low', 'loud', 'quiet', 'open', 'shut', 'right', 'left', 'up', 'down', 'in', 'out', 'over', 'under',
  
  // Simple numbers and quantities  
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'many', 'few', 'some', 'all', 'more', 'less', 'first', 'last',
  
  // Simple pronouns and basic grammar
  'i', 'me', 'my', 'you', 'your', 'he', 'him', 'his', 'she', 'her', 'it', 'its', 'we', 'us', 'our', 'they', 'them', 'their', 'this', 'that', 'here', 'there', 'now', 'then', 'yes', 'no', 'not', 'can', 'could', 'may', 'might', 'will', 'would', 'should',
  
  // Simple time words
  'day', 'night', 'morning', 'today', 'now', 'soon', 'late', 'early',
  
  // Simple connecting words (minimal)
  'and', 'but', 'or', 'so', 'if', 'when', 'then', 'too', 'also'
]);

export function isLevel1Word(word: string): boolean {
  return LEVEL_1_VOCABULARY.has(word.toLowerCase());
}

export function validateLevel1Sentence(sentence: string): { isValid: boolean; invalidWords: string[] } {
  const words = sentence.toLowerCase()
    .replace(/[^\\w\\s]/g, '') // Remove punctuation
    .split(/\\s+/)
    .filter(word => word.length > 0);
  
  const invalidWords = words.filter(word => !LEVEL_1_VOCABULARY.has(word));
  
  return {
    isValid: invalidWords.length === 0,
    invalidWords
  };
}
