// Grammar validation utilities to prevent subject-verb agreement errors
export class GrammarValidator {
  
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
}

// Export helper function for easy use in story generators
export const validateAndFixGrammar = (text: string): string => {
  const validation = GrammarValidator.validateStoryText(text);
  
  if (!validation.isValid) {
    console.warn('Grammar issues detected:', validation.errors);
    
    // Attempt basic fixes for common issues
    let fixedText = text;
    
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
  // Test the specific error we fixed
  const testCases = [
    'He eat pizza.',      // Should detect error
    'He eats pizza.',     // Should pass
    'She run fast.',      // Should detect error  
    'She runs fast.',     // Should pass
    'They eat pizza.',    // Should pass
    'Alex eats pizza.'    // Should pass
  ];
  
  console.log('🧪 Grammar Validator Test Results:');
  testCases.forEach(test => {
    const result = GrammarValidator.validateStoryText(test);
    console.log(`"${test}" - ${result.isValid ? '✅ PASS' : '❌ FAIL'}: ${result.errors.join(', ')}`);
  });
}

export default GrammarValidator;