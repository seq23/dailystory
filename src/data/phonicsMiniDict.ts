// Minimal, curated phonics overrides merged with auto-generated coverage from vocab sets
// Keys are lowercase and cleaned (letters only) by the engine during lookup
import autoBase from '@/data/autoPhonicsFromVocab';

const curated: Record<string, string[]> = {
  // Level 0 words (selected overrides)
  'hello': ['heh', 'loh'],
  'water': ['wah', 'ter'],
  'happy': ['hap', 'ee'],
  'family': ['fam', 'uh', 'lee'],
  'friend': ['frend'],
  'school': ['skool'],
  'sweet': ['sweet'],
  'children': ['chil', 'dren'],
  'library': ['lie', 'brare', 'ree'],
  // Irregular plurals (kid-friendly)
  'men': ['men'],
  'women': ['wih', 'min'],
  'people': ['pee', 'pul'],
  'mice': ['mice'],
  'geese': ['geese'],
  'teeth': ['teeth'],
  'feet': ['feet'],
  'lice': ['lice'],
  // Helpful base forms
  'puppy': ['pup', 'py'],

  // Single-syllable helper breakdowns for clarity
  'jump': ['jum', 'p'],
  'blue': ['bl', 'oo'],
  'high': ['h', 'eye'],
  'bright': ['br', 'igh', 't'],
  'plays': ['play', 's'],
  'play': ['pl', 'ay'],
  'chase': ['chay', 's'],
  'fast': ['f', 'a', 'st'],
  'snack': ['sn', 'ack'],
  'snacks': ['sn', 'ack', 's'],
  'good': ['good'],
  'green': ['gr', 'ee', 'n'],
  'likes': ['like', 's'],
  'smiles': ['smiles'],
  'bounce': ['bounce'],
  'what': ['whuh', 'ut'],

  // Fixed phonetic entries (NOT grammatical analysis)
  'found': ['found'],        // Single syllable - NOT "find past"
  'went': ['went'],
  'came': ['came'], 
  'saw': ['saw'],
  'thought': ['thought'],
  'brought': ['brought'],
  'bought': ['bought'],
  'fought': ['fought'],
  'taught': ['taught'],
  'caught': ['caught'],

  // Kid-friendly curated fixes
  'tree': ['tr', 'ee'],
  'trees': ['tr', 'ee', 's'],
  'soccer': ['soc', 'cer'],
  'apple': ['ap', 'ple'],
  'better': ['bet', 'ter'],
  'butter': ['but', 'ter'],
  'bottle': ['bot', 'tle'],
  // Level 1+ selected overrides
  'animal': ['an', 'ih', 'mul'],
  'garden': ['gar', 'den'],
  'mountain': ['mown', 'tin'],
  'adventure': ['ad', 'ven', 'cher'],
  'character': ['kar', 'ik', 'ter'],
  'favorite': ['fay', 'vor', 'it'],
  'flowers': ['flow', 'ers'],
  'hero': ['he', 'ro'],
  'wonderful': ['wun', 'der', 'ful'],
  'beautiful': ['byoo', 'ti', 'ful'],
  'together': ['toh', 'get', 'her'],
  'remember': ['rih', 'mem', 'ber'],
  'different': ['dif', 'er', 'ent'],
  'important': ['im', 'por', 'tant'],

  // Level 2-4 complex overrides
  'principles': ['prin', 'suh', 'puls'],
  'organization': ['or', 'gan', 'ih', 'zay', 'shun'],
  'development': ['dih', 'vel', 'up', 'ment'],
  'responsibility': ['rih', 'spon', 'suh', 'bil', 'ih', 'tee'],
  'understanding': ['un', 'der', 'stan', 'ding'],
  'environment': ['en', 'vy', 'run', 'ment'],
  'technology': ['tek', 'nol', 'uh', 'jee'],
  'communication': ['kuh', 'myoo', 'nih', 'kay', 'shun'],
  'opportunity': ['op', 'er', 'too', 'nih', 'tee'],
  'experience': ['ik', 'speer', 'ee', 'ens'],
  'education': ['ed', 'yoo', 'kay', 'shun'],
  'government': ['guv', 'ern', 'ment'],
  'information': ['in', 'fer', 'may', 'shun'],
  'international': ['in', 'ter', 'nash', 'uh', 'nul'],
  'management': ['man', 'ij', 'ment'],
  'presentation': ['prez', 'en', 'tay', 'shun'],
  'professional': ['pruh', 'fesh', 'uh', 'nul'],
  'relationship': ['rih', 'lay', 'shun', 'ship'],
  'temperature': ['tem', 'per', 'uh', 'cher'],
  'transportation': ['trans', 'per', 'tay', 'shun'],

  // Illuminate family
  'illuminate': ['ill', 'loo', 'muh', 'nate'],
  'illumination': ['ill', 'loo', 'muh', 'nay', 'shun'],
  'illuminating': ['ill', 'loo', 'muh', 'nay', 'ting'],

  // High-frequency early-reader / ESL fixes (common mis-segmentations)
  'little': ['lit', 'tul'],
  'because': ['bee', 'kuz'],
  'under': ['un', 'der'],
  'over': ['oh', 'ver'],
  'sister': ['sis', 'ter'],
  'brother': ['bruh', 'ther'],
  'mother': ['muh', 'ther'],
  'father': ['fah', 'ther'],
  'morning': ['mor', 'ning'],
  'birthday': ['birth', 'day'],
  'rabbit': ['rab', 'bit'],
  'yellow': ['yel', 'loh'],
  'window': ['win', 'doh'],
  'pretty': ['prit', 'ee'],
  'again': ['uh', 'gen'],
  'many': ['men', 'ee'],
  'very': ['ver', 'ee'],
  'every': ['ev', 'ree'],
  'story': ['stor', 'ee'],
  'funny': ['fun', 'ee'],
  'bunny': ['bun', 'ee'],
  'sunny': ['sun', 'ee'],
  'sorry': ['sor', 'ee'],
  'color': ['kul', 'er'],
  'picture': ['pik', 'cher'],
  'nature': ['nay', 'cher'],
};

// Merge: auto-generated baseline first, then curated overrides take precedence
const dict: Record<string, string[]> = {
  ...autoBase,
  ...curated,
};

export default dict;
