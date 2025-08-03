// Grammar validation utilities to prevent subject-verb agreement errors
export class GrammarValidator {
  
  // Common plural endings to detect plural nouns
  private static PLURAL_PATTERNS = [
    /s$/i,           // dogs, cats, books
    /es$/i,          // dishes, boxes, wishes
    /ies$/i,         // berries, babies, stories
    /ves$/i,         // leaves, wolves, knives
    /i$/i,           // cacti, fungi
    /ae$/i,          // larvae, antennae
    /a$/i,           // data, criteria (some Latin plurals)
  ];

  // Irregular plurals that don't follow standard patterns
  private static IRREGULAR_PLURALS = new Set([
    'children', 'feet', 'geese', 'men', 'women', 'teeth', 'mice', 'people',
    'sheep', 'deer', 'fish', 'species', 'series', 'means', 'aircraft'
  ]);

  /**
   * Determines if a noun is plural
   */
  static isPlural(noun: string): boolean {
    if (!noun || typeof noun !== 'string') return false;
    
    const cleanNoun = noun.trim().toLowerCase();
    
    // Check irregular plurals first
    if (this.IRREGULAR_PLURALS.has(cleanNoun)) {
      return true;
    }
    
    // Check common plural patterns
    return this.PLURAL_PATTERNS.some(pattern => pattern.test(cleanNoun));
  }

  /**
   * Gets the correct article (a/an/the) for a noun, or empty string for plurals
   */
  static getCorrectArticle(noun: string, definite: boolean = false): string {
    if (!noun || typeof noun !== 'string') return '';
    
    const cleanNoun = noun.trim().toLowerCase();
    
    // If plural, don't use indefinite articles
    if (this.isPlural(cleanNoun)) {
      return definite ? 'the ' : '';
    }
    
    // For singular nouns
    if (definite) {
      return 'the ';
    }
    
    // Use 'an' before vowel sounds, 'a' before consonants
    const vowelSounds = /^[aeiou]/i;
    return vowelSounds.test(cleanNoun) ? 'an ' : 'a ';
  }

  /**
   * Creates a grammatically correct phrase with article + adjective + noun
   */
  static createNounPhrase(adjective: string, noun: string, definite: boolean = false): string {
    if (!noun) return '';
    
    const article = this.getCorrectArticle(noun, definite);
    const cleanAdjective = adjective?.trim() || '';
    const cleanNoun = noun.trim();
    
    if (cleanAdjective) {
      return `${article}${cleanAdjective} ${cleanNoun}`;
    }
    
    return `${article}${cleanNoun}`;
  }
  
  // Common present tense verbs that need conjugation with third person singular
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
    'do': { thirdPerson: 'does', other: 'do' },
    'say': { thirdPerson: 'says', other: 'say' },
    'get': { thirdPerson: 'gets', other: 'get' },
    'know': { thirdPerson: 'knows', other: 'know' },
    'think': { thirdPerson: 'thinks', other: 'think' },
    'feel': { thirdPerson: 'feels', other: 'feel' },
    'look': { thirdPerson: 'looks', other: 'look' },
    'try': { thirdPerson: 'tries', other: 'try' },
    'make': { thirdPerson: 'makes', other: 'make' },
    'take': { thirdPerson: 'takes', other: 'take' },
    'give': { thirdPerson: 'gives', other: 'give' },
    'work': { thirdPerson: 'works', other: 'work' },
    'call': { thirdPerson: 'calls', other: 'call' },
    'move': { thirdPerson: 'moves', other: 'move' },
    'turn': { thirdPerson: 'turns', other: 'turn' },
    'start': { thirdPerson: 'starts', other: 'start' },
    'stop': { thirdPerson: 'stops', other: 'stop' },
    'walk': { thirdPerson: 'walks', other: 'walk' },
    'talk': { thirdPerson: 'talks', other: 'talk' },
    'ask': { thirdPerson: 'asks', other: 'ask' },
    'tell': { thirdPerson: 'tells', other: 'tell' },
    'show': { thirdPerson: 'shows', other: 'show' },
    'hear': { thirdPerson: 'hears', other: 'hear' },
    'listen': { thirdPerson: 'listens', other: 'listen' },
    'watch': { thirdPerson: 'watches', other: 'watch' },
    'learn': { thirdPerson: 'learns', other: 'learn' },
    'teach': { thirdPerson: 'teaches', other: 'teach' },
    'read': { thirdPerson: 'reads', other: 'read' },
    'write': { thirdPerson: 'writes', other: 'write' },
    'draw': { thirdPerson: 'draws', other: 'draw' },
    'sing': { thirdPerson: 'sings', other: 'sing' },
    'dance': { thirdPerson: 'dances', other: 'dance' },
    'swim': { thirdPerson: 'swims', other: 'swim' },
    'jump': { thirdPerson: 'jumps', other: 'jump' },
    'fly': { thirdPerson: 'flies', other: 'fly' },
    'sleep': { thirdPerson: 'sleeps', other: 'sleep' },
    'wake': { thirdPerson: 'wakes', other: 'wake' },
    'open': { thirdPerson: 'opens', other: 'open' },
    'close': { thirdPerson: 'closes', other: 'close' },
    'carry': { thirdPerson: 'carries', other: 'carry' },
    'hold': { thirdPerson: 'holds', other: 'hold' },
    'pick': { thirdPerson: 'picks', other: 'pick' },
    'drop': { thirdPerson: 'drops', other: 'drop' },
    'push': { thirdPerson: 'pushes', other: 'push' },
    'pull': { thirdPerson: 'pulls', other: 'pull' },
    'throw': { thirdPerson: 'throws', other: 'throw' },
    'catch': { thirdPerson: 'catches', other: 'catch' }
  };

  /**
   * Conjugates a verb based on the subject pronoun
   */
  static conjugateVerb(verb: string, subject: string): string {
    // Add null/undefined checks
    if (!verb || !subject) {
      console.warn(`Invalid parameters for conjugation: verb="${verb}", subject="${subject}"`);
      return verb || '';
    }
    
    const normalizedVerb = verb.toLowerCase();
    const normalizedSubject = subject.toLowerCase();
    
    // Check if this verb needs conjugation
    if (!this.CONJUGATION_VERBS[normalizedVerb]) {
      console.warn(`Unknown verb for conjugation: ${verb}. Using as-is.`);
      return verb;
    }
    
    const conjugation = this.CONJUGATION_VERBS[normalizedVerb];
    
    // Third person singular (he, she, it) gets the conjugated form
    if (normalizedSubject === 'he' || normalizedSubject === 'she' || normalizedSubject === 'it') {
      return conjugation.thirdPerson;
    }
    
    // All others (I, you, we, they) get the base form
    return conjugation.other;
  }

  /**
   * Creates a grammatically correct sentence with subject + verb + object
   */
  static createSentence(subject: string, verb: string, object?: string): string {
    const conjugatedVerb = this.conjugateVerb(verb, subject);
    const capitalizedSubject = subject.charAt(0).toUpperCase() + subject.slice(1);
    
    if (object) {
      return `${capitalizedSubject} ${conjugatedVerb} ${object}.`;
    } else {
      return `${capitalizedSubject} ${conjugatedVerb}.`;
    }
  }

  /**
   * Validates story text for common grammar errors
   */
  static validateStoryText(text: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check for comma-separated subjects with singular verbs (dogs, cats, lions is happy)
    const multipleSubjectPattern = /\b([a-zA-Z]+),\s*([a-zA-Z]+)(?:,\s*([a-zA-Z]+))?\s+(is|was|has|does|goes|runs|eats|plays|likes|loves|wants|needs|sees|finds|helps|makes|takes|gives|works|calls|moves|turns|starts|stops|walks|talks|asks|tells|shows|hears|listens|watches|learns|teaches|reads|writes|draws|sings|dances|swims|jumps|flies|sleeps|wakes|opens|closes|carries|holds|picks|drops|pushes|pulls|throws|catches)\b/gi;
    
    const multipleSubjectMatches = Array.from(text.matchAll(multipleSubjectPattern));
    if (multipleSubjectMatches.length > 0) {
      multipleSubjectMatches.forEach(match => {
        const [fullMatch, subject1, subject2, subject3, verb] = match;
        const pluralVerb = this.makePluralVerb(verb);
        errors.push(`Grammar error: Multiple subjects "${subject1}, ${subject2}${subject3 ? ', ' + subject3 : ''}" need plural verb "${pluralVerb}" not "${verb}"`);
      });
    }
    
    // Check for pronoun + base verb errors (he eat, she run, etc.)
    const pronounVerbPattern = /\b(he|she|it)\s+(eat|run|play|like|go|come|see|find|help|love|want|need|have|do|say|get|know|think|feel|look|try|make|take|give|work|call|move|turn|start|stop|walk|talk|ask|tell|show|hear|listen|watch|learn|teach|read|write|draw|sing|dance|swim|jump|fly|sleep|wake|open|close|carry|hold|pick|drop|push|pull|throw|catch)\b/gi;
    
    // Use matchAll to get capture groups properly
    const matches = Array.from(text.matchAll(pronounVerbPattern));
    if (matches.length > 0) {
      matches.forEach(match => {
        const [fullMatch, pronoun, verb] = match;
        if (pronoun && verb) {
          const correctVerb = this.conjugateVerb(verb, pronoun);
          if (verb !== correctVerb) {
            errors.push(`Grammar error: "${fullMatch}" should be "${pronoun} ${correctVerb}"`);
          }
        }
      });
    }
    
    // Check for incorrect articles with plural nouns (a dogs, an cats)
    const incorrectArticlePattern = /\b(a|an)\s+([a-zA-Z]*s\b|children|feet|geese|men|women|teeth|mice|people|sheep|deer|fish)/gi;
    const incorrectArticleMatches = Array.from(text.matchAll(incorrectArticlePattern));
    if (incorrectArticleMatches.length > 0) {
      incorrectArticleMatches.forEach(match => {
        const [fullMatch, article, noun] = match;
        errors.push(`Grammar error: "${fullMatch}" - don't use "${article}" with plural noun "${noun}"`);
      });
    }
    
    // Check for missing articles before singular countable nouns (with adjectives)
    const missingArticlePattern = /\b(with|play with|see|find|hold|catch|throw|pick up|grab|get|likes|loves|wants|needs)\s+(blue|red|green|yellow|pink|purple|orange|big|small|round|square)\s+(ball|toy|book|cat|dog|car|house|tree|flower|apple|cookie|cup|box|bag)\b/gi;
    const articleMatches = Array.from(text.matchAll(missingArticlePattern));
    if (articleMatches.length > 0) {
      articleMatches.forEach(match => {
        const [fullMatch] = match;
        errors.push(`Grammar error: "${fullMatch}" needs an article (a/the) before the noun`);
      });
    }
    
    // Check for missing articles before singular countable nouns (without adjectives)
    const missingArticleSimplePattern = /\b(likes|loves|sees|finds|wants|needs|has|gets|throws|catches|holds)\s+(ball|toy|book|cat|dog|car|house|tree|flower|apple|cookie|cup|box|bag)\b/gi;
    const simpleArticleMatches = Array.from(text.matchAll(missingArticleSimplePattern));
    if (simpleArticleMatches.length > 0) {
      simpleArticleMatches.forEach(match => {
        const [fullMatch] = match;
        errors.push(`Grammar error: "${fullMatch}" needs an article (a/the) before the noun`);
      });
    }
    
    // Check for malformed template variables
    if (text.includes('{') || text.includes('[')) {
      errors.push('Template variables not properly replaced');
    }
    
    // Check for double spaces
    if (text.includes('  ')) {
      errors.push('Multiple consecutive spaces found');
    }
    
    // Check for proper sentence ending
    if (text.trim() && !text.trim().match(/[.!?]$/)) {
      errors.push('Sentence should end with proper punctuation');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates an array of story pages
   */
  static validateStoryPages(pages: string[]): { isValid: boolean; pageErrors: Array<{ pageIndex: number; errors: string[] }> } {
    const pageErrors: Array<{ pageIndex: number; errors: string[] }> = [];
    
    pages.forEach((page, index) => {
      const validation = this.validateStoryText(page);
      if (!validation.isValid) {
        pageErrors.push({
          pageIndex: index + 1,
          errors: validation.errors
        });
      }
    });
    
    return {
      isValid: pageErrors.length === 0,
      pageErrors
    };
  }

  /**
   * Safe template replacement that ensures proper grammar
   */
  static createGrammaticalSentence(template: {
    subject: string;
    verb: string;
    object?: string;
    adjective?: string;
  }): string {
    const { subject, verb, object, adjective } = template;
    const conjugatedVerb = this.conjugateVerb(verb, subject);
    const capitalizedSubject = subject.charAt(0).toUpperCase() + subject.slice(1);
    
    let sentence = `${capitalizedSubject} ${conjugatedVerb}`;
    
    if (adjective && object) {
      sentence += ` ${adjective} ${object}`;
    } else if (object) {
      sentence += ` ${object}`;
    }
    
    return sentence + '.';
  }

  /**
   * Converts singular verb to plural form
   */
  private static makePluralVerb(verb: string): string {
    const singularToPlural = {
      'is': 'are',
      'was': 'were', 
      'has': 'have',
      'does': 'do',
      'goes': 'go',
      'runs': 'run',
      'eats': 'eat',
      'plays': 'play',
      'likes': 'like',
      'loves': 'love',
      'wants': 'want',
      'needs': 'need',
      'sees': 'see',
      'finds': 'find',
      'helps': 'help',
      'makes': 'make',
      'takes': 'take',
      'gives': 'give',
      'works': 'work',
      'calls': 'call',
      'moves': 'move',
      'turns': 'turn',
      'starts': 'start',
      'stops': 'stop',
      'walks': 'walk',
      'talks': 'talk',
      'asks': 'ask',
      'tells': 'tell',
      'shows': 'show',
      'hears': 'hear',
      'listens': 'listen',
      'watches': 'watch',
      'learns': 'learn',
      'teaches': 'teach',
      'reads': 'read',
      'writes': 'write',
      'draws': 'draw',
      'sings': 'sing',
      'dances': 'dance',
      'swims': 'swim',
      'jumps': 'jump',
      'flies': 'fly',
      'sleeps': 'sleep',
      'wakes': 'wake',
      'opens': 'open',
      'closes': 'close',
      'carries': 'carry',
      'holds': 'hold',
      'picks': 'pick',
      'drops': 'drop',
      'pushes': 'push',
      'pulls': 'pull',
      'throws': 'throw',
      'catches': 'catch'
    };
    
    return singularToPlural[verb.toLowerCase()] || verb;
  }
}

// Export helper function for easy use in story generators
export const validateAndFixGrammar = (text: string): string => {
  const validation = GrammarValidator.validateStoryText(text);
  
  if (!validation.isValid) {
    console.warn('Grammar issues detected:', validation.errors);
    
    // Attempt basic fixes for common issues
    let fixedText = text;
    
    // Fix incorrect articles with plural nouns (a dogs -> dogs, an cats -> cats)
    fixedText = fixedText.replace(/\b(a|an)\s+([a-zA-Z]*s\b|children|feet|geese|men|women|teeth|mice|people|sheep|deer|fish)/gi, 
      (match, article, noun) => {
        return noun;
      });
    
    // Fix missing articles before singular countable nouns (with adjectives)
    fixedText = fixedText.replace(/\b(with|play with|see|find|hold|catch|throw|pick up|grab|get|likes|loves|wants|needs)\s+(blue|red|green|yellow|pink|purple|orange|big|small|round|square)\s+(ball|toy|book|cat|dog|car|house|tree|flower|apple|cookie|cup|box|bag)\b/gi, 
      (match, verb, adjective, noun) => {
        return `${verb} the ${adjective} ${noun}`;
      });
    
    // Fix missing articles before singular countable nouns (without adjectives)
    fixedText = fixedText.replace(/\b(likes|loves|sees|finds|wants|needs|has|gets|throws|catches|holds)\s+(ball|toy|book|cat|dog|car|house|tree|flower|apple|cookie|cup|box|bag)\b/gi, 
      (match, verb, noun) => {
        return `${verb} the ${noun}`;
      });
    
    // Fix double spaces
    fixedText = fixedText.replace(/\s+/g, ' ');
    
    // Remove malformed template variables
    fixedText = fixedText.replace(/\{[^}]*\}/g, '');
    fixedText = fixedText.replace(/\[/g, '').replace(/\]/g, '');
    
    return fixedText.trim();
  }
  
  return text;
};

// Quick test to verify grammar validation works
if (typeof window !== 'undefined') {
  // Test the specific errors we fixed
  const testCases = [
    'He eat pizza.',      // Should detect error
    'He eats pizza.',     // Should pass
    'She run fast.',      // Should detect error  
    'She runs fast.',     // Should pass
    'They eat pizza.',    // Should pass
    'Alex eats pizza.',   // Should pass
    'Scooter saw a dogs.',// Should detect plural article error
    'Emma likes a cats.', // Should detect plural article error
    'Sam found dogs.',    // Should pass
    'Anna has cats.'      // Should pass
  ];
  
  console.log('🧪 Grammar Validator Test Results:');
  testCases.forEach(test => {
    const result = GrammarValidator.validateStoryText(test);
    console.log(`"${test}" - ${result.isValid ? '✅ PASS' : '❌ FAIL'}: ${result.errors.join(', ')}`);
  });
  
  // Test the plural article fixes
  const pluralTests = [
    { input: 'dogs', expected: 'dogs' },
    { input: 'cats', expected: 'cats' },
    { input: 'dog', expected: 'a dog' },
    { input: 'elephant', expected: 'an elephant' }
  ];
  
  console.log('🧪 Article/Plural Test Results:');
  pluralTests.forEach(test => {
    const result = GrammarValidator.createNounPhrase('', test.input);
    const passed = result === test.expected;
    console.log(`"${test.input}" -> "${result}" (expected: "${test.expected}") - ${passed ? '✅ PASS' : '❌ FAIL'}`);
  });
}

export default GrammarValidator;