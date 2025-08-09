// Minimal, curated phonics overrides to ensure kid-friendly syllables
// Keep entries lowercase
const dict: Record<string, string[]> = {
  // Level 0 words
  'hello': ['heh', 'loh'],
  'water': ['wah', 'ter'],
  'happy': ['hap', 'ee'],
  'family': ['fam', 'uh', 'lee'],
  'friend': ['frend'],
  'school': ['skool'],
  'sweet': ['sweet'],
  'children': ['chil', 'dren'],

  // Single-syllable helper breakdowns for clarity
  'jump': ['jum', 'p'],
  'blue': ['bl', 'oo'],
  'high': ['h', 'eye'],
  'bright': ['br', 'igh', 't'],
  'plays': ['play', 's'],
  'play': ['pl', 'ay'],
  'chase': ['ch', 'ay', 's'],
  'fast': ['f', 'a', 'st'],
  'snack': ['sn', 'ack'],
  'snacks': ['sn', 'ack', 's'],
  'good': ['g', 'oo', 'd'],
  'green': ['gr', 'ee', 'n'],
  'likes': ['like', 's'],
  'smiles': ['sm', 'eye', 'ls'],
  'bounce': ['b', 'ow', 'n', 's'],
  'what': ['whuh', 'ut'],

  // Level 1 words
  'animal': ['an', 'ih', 'mul'],
  'garden': ['gar', 'den'],
  'mountain': ['mown', 'tin'],
  'adventure': ['ad', 'ven', 'cher'],
  'character': ['kar', 'ik', 'ter'],
  'favorite': ['fay', 'vor', 'it'],
  'flowers': ['flow', 'ers'],
  'wonderful': ['wun', 'der', 'ful'],
  'beautiful': ['byoo', 'ti', 'ful'],
  'together': ['toh', 'get', 'her'],
  'remember': ['rih', 'mem', 'ber'],
  'different': ['dif', 'er', 'ent'],
  'important': ['im', 'por', 'tant'],

  // Level 2-4 words (including complex ones)
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
};

export default dict;
