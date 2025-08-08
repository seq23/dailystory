// Level 3 Vocabulary (Ages 9-11) - 4th Grade
// Refined sophisticated vocabulary with essential function words

export const LEVEL_3_VOCABULARY = new Set([
  // Essential function words for sentence structure
  'the', 'and', 'is', 'was', 'were', 'are', 'have', 'has', 'had', 'will', 'would', 'could', 'should', 
  'can', 'may', 'might', 'must', 'do', 'does', 'did', 'be', 'been', 'being', 'with', 'without',
  'but', 'or', 'so', 'if', 'when', 'where', 'who', 'what', 'why', 'how', 'that', 'this', 'these',
  'those', 'in', 'on', 'at', 'by', 'for', 'from', 'to', 'of', 'about', 'through', 'during',
  
  // Sophisticated 4th Grade Core Vocabulary
  'ability', 'accomplish', 'according', 'accurate', 'achieve', 'adventure', 'analyze', 'ancient', 'announce',
  'appearance', 'approach', 'appropriate', 'arrangement', 'assistance', 'atmosphere', 'attention', 'attitude',
  'audience', 'authority', 'available', 'balance', 'barrier', 'behavior', 'brilliant', 'celebrate', 'ceremony',
  'challenge', 'character', 'civilization', 'communicate', 'community', 'compare', 'compete', 'complete',
  'concentrate', 'conclude', 'confidence', 'consider', 'contribute', 'convince', 'cooperation', 'courage',
  
  // Advanced Descriptive Words
  'magnificent', 'extraordinary', 'tremendous', 'spectacular', 'incredible', 'marvelous', 'fantastic', 'amazing',
  'brilliant', 'gorgeous', 'splendid', 'remarkable', 'outstanding', 'excellent', 'wonderful', 'delightful',
  'fascinating', 'mysterious', 'adventurous', 'dangerous', 'enormous', 'gigantic', 'miniature', 'transparent',
  'fragile', 'sturdy', 'flexible', 'smooth', 'rough', 'slippery', 'comfortable', 'uncomfortable',
  
  // Complex Emotion & Character Words
  'determined', 'confident', 'anxious', 'relieved', 'satisfied', 'frustrated', 'disappointed', 'embarrassed',
  'suspicious', 'curious', 'jealous', 'grateful', 'generous', 'selfish', 'honest', 'dishonest',
  'patient', 'impatient', 'responsible', 'irresponsible', 'loyal', 'disloyal', 'brave', 'cowardly',
  'creative', 'imaginative', 'intelligent', 'foolish', 'wise', 'stubborn', 'flexible', 'independent',
  
  // Academic & Scientific Vocabulary
  'experiment', 'investigate', 'observe', 'examine', 'research', 'discover', 'analyze', 'compare',
  'contrast', 'conclude', 'predict', 'hypothesis', 'evidence', 'measurement', 'calculation', 'solution',
  'environment', 'ecosystem', 'habitat', 'population', 'community', 'organism', 'species', 'evolution',
  'temperature', 'pressure', 'energy', 'matter', 'substance', 'chemical', 'physical', 'mechanical',
  
  // Narrative & Literary Words
  'meanwhile', 'however', 'therefore', 'consequently', 'nevertheless', 'furthermore', 'initially', 'eventually',
  'suddenly', 'gradually', 'immediately', 'frequently', 'occasionally', 'constantly', 'certainly', 'obviously',
  'apparently', 'fortunately', 'unfortunately', 'surprisingly', 'remarkably', 'especially', 'particularly',
  'definitely', 'absolutely', 'completely', 'entirely', 'partially', 'somewhat', 'extremely', 'incredibly',
  
  // Leadership & Social Words
  'leadership', 'teamwork', 'cooperation', 'collaboration', 'responsibility', 'citizenship', 'democracy',
  'government', 'election', 'candidate', 'representative', 'senator', 'president', 'mayor', 'governor',
  'constitution', 'amendment', 'freedom', 'liberty', 'justice', 'equality', 'opportunity', 'privilege',
  'tradition', 'culture', 'heritage', 'celebration', 'ceremony', 'festival', 'holiday', 'anniversary',
  
  // Action & Movement Words
  'accomplish', 'achieve', 'attempt', 'struggle', 'overcome', 'conquer', 'defeat', 'triumph', 'succeed',
  'persevere', 'persist', 'continue', 'proceed', 'advance', 'progress', 'develop', 'improve', 'enhance',
  'demonstrate', 'illustrate', 'represent', 'symbolize', 'indicate', 'suggest', 'recommend', 'propose',
  'require', 'demand', 'insist', 'persuade', 'convince', 'influence', 'inspire', 'motivate', 'encourage'
]);

export function isLevel3Word(word: string): boolean {
  return LEVEL_3_VOCABULARY.has(word.toLowerCase());
}

export function validateLevel3Sentence(sentence: string, userName?: string): { 
  isValid: boolean; 
  invalidWords: string[];
} {
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
    return !LEVEL_3_VOCABULARY.has(word);
  });
  
  return {
    isValid: invalidWords.length === 0,
    invalidWords
  };
}