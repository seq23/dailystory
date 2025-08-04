// Level 0 vocabulary for ages 3-5 (ultra-simple pre-reading vocabulary)
export const LEVEL_0_VOCABULARY = new Set([
  // Ultra-basic sight words (most essential)
  'a', 'an', 'and', 'i', 'is', 'the', 'see', 'go', 'me', 'my', 'you', 'it', 'in', 'on', 'up', 'we', 'no', 'yes',
  
  // Core family words
  'mom', 'dad', 'baby',
  
  // Essential animals (most familiar)
  'cat', 'dog', 'bird', 'fish', 'cow', 'pig', 'duck', 'bee', 'bear', 'frog',
  
  // Primary colors only
  'red', 'blue', 'green', 'yellow', 'big', 'small',
  
  // Simple actions (present tense only)
  'go', 'see', 'run', 'play', 'eat', 'sit', 'get', 'like', 'look', 'come', 'want', 'help', 'give',
  
  // Essential objects
  'ball', 'book', 'toy', 'car', 'cup', 'hat', 'bed', 'home', 'tree', 'sun',
  
  // Basic emotions and descriptors
  'happy', 'sad', 'nice', 'good', 'fun', 'fast', 'slow',
  
  // Simple foods
  'apple', 'milk', 'cake', 'food',
  
  // Essential pronouns
  'he', 'she', 'they', 'this', 'that',
  
  // Basic prepositions
  'to', 'with', 'here', 'there',
  
  // Simple numbers
  'one', 'two', 'many',
  
  // Basic greetings
  'hello', 'hi', 'bye',
  
  // Simple connecting words
  'too', 'very'
]);

export function isLevel0Word(word: string): boolean {
  return LEVEL_0_VOCABULARY.has(word.toLowerCase());
}

export function validateLevel0Sentence(sentence: string, userName?: string): { isValid: boolean; invalidWords: string[] } {
  const words = sentence.toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 0);
  
  const userNameLower = userName?.toLowerCase();
  const invalidWords = words.filter(word => {
    // Always allow the user's name
    if (userNameLower && word === userNameLower) {
      return false;
    }
    return !LEVEL_0_VOCABULARY.has(word);
  });
  
  return {
    isValid: invalidWords.length === 0,
    invalidWords
  };
}