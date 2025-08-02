# Story Development Guidelines

## Preventing Grammar Errors

### ❌ NEVER DO: Direct Pronoun + Present Tense Verb
```javascript
// WRONG - This causes "He eat pizza"
`${pronouns.subject} eat ${favoriteFood}.`

// WRONG - This causes "She run fast"  
`${pronouns.subject} run fast.`
```

### ✅ ALWAYS DO: Use Name or Proper Conjugation
```javascript
// CORRECT - Use character name
`${characterName} eats ${favoriteFood}.`

// CORRECT - Use grammar helper
import GrammarValidator from '@/utils/grammarValidator';
const sentence = GrammarValidator.createSentence(pronouns.subject, 'eat', favoriteFood);
```

## Grammar Rules for Story Templates

### 1. Subject-Verb Agreement
- **Third person singular** (he, she, it) + present tense = add 's' to verb
  - he eats, she runs, it plays
- **All others** (I, you, we, they) + present tense = base verb
  - I eat, you run, they play

### 2. Safe Template Patterns

#### ✅ SAFE: Past Tense (No Conjugation Needed)
```javascript
`${characterName} walked to the ${favoriteColor} house.`
`${pronouns.subject} discovered something amazing.`
`The ${favoriteAnimal} helped ${characterName}.`
```

#### ✅ SAFE: Character Names with Present Tense
```javascript
`${characterName} loves ${favoriteFood}.`
`${characterName} plays with the ${favoriteAnimal}.`
`${characterName} sees a ${favoriteColor} butterfly.`
```

#### ✅ SAFE: Modal Verbs
```javascript
`${pronouns.subject} could see the ${favoriteColor} ${favoriteAnimal}.`
`${pronouns.subject} would like to play.`
`${pronouns.subject} will find the treasure.`
```

#### ❌ DANGEROUS: Pronouns + Present Tense Base Verbs
```javascript
// These patterns will cause grammar errors:
`${pronouns.subject} eat...`     // becomes "he eat"
`${pronouns.subject} run...`     // becomes "she run"  
`${pronouns.subject} play...`    // becomes "it play"
```

## Quality Assurance Process

### 1. Automated Grammar Checking
All story generators should use the grammar validator:

```javascript
import GrammarValidator from '@/utils/grammarValidator';
import StoryQualityChecker from '@/utils/storyQualityChecker';

// After generating pages
const qualityCheck = StoryQualityChecker.checkStoryQuality(pages, difficulty);
if (!qualityCheck.isValid) {
  console.warn('Quality issues:', qualityCheck.issues);
}
```

### 2. Manual Review Checklist

Before adding new story templates, check:

- [ ] No direct pronoun + present tense base verb combinations
- [ ] All sentences end with proper punctuation
- [ ] Page transitions flow naturally
- [ ] Content appropriate for reading level
- [ ] Character names used consistently
- [ ] No template variables left unreplaced (`{name}`, `[text]`)

### 3. Testing Patterns

Test with different pronoun combinations:
```javascript
// Test all pronoun types
const pronounSets = [
  { subject: 'he', object: 'him', possessive: 'his' },
  { subject: 'she', object: 'her', possessive: 'her' },
  { subject: 'they', object: 'them', possessive: 'their' }
];

pronounSets.forEach(pronouns => {
  // Test your template with each pronoun set
  const result = processTemplate(template, { pronouns });
  const validation = GrammarValidator.validateStoryText(result);
  if (!validation.isValid) {
    console.error('Grammar error with pronouns:', pronouns, validation.errors);
  }
});
```

## Story Flow Best Practices

### 1. Page Transitions
Each page should:
- End at a natural pause in the narrative
- Set up anticipation for the next page
- Maintain character and setting consistency

### 2. Difficulty Progression
- **Easy (3-8 words)**: Simple subjects + simple verbs + basic objects
- **Medium (8-25 words)**: Compound sentences, basic adjectives
- **Hard (20-45 words)**: Complex sentences, richer vocabulary
- **Expert (35-80 words)**: Sophisticated themes, advanced sentence structures

### 3. Character Consistency
- Use the same character name throughout
- Maintain personality traits
- Keep physical descriptions consistent

## Code Review Requirements

### For Story Template Changes:
1. Run grammar validation on all new templates
2. Test with all pronoun combinations
3. Verify reading level appropriateness
4. Check page flow and transitions
5. Ensure no hardcoded text that should be user-customizable

### For Story Generator Changes:
1. Add quality checking to generation pipeline
2. Log grammar issues for monitoring
3. Test edge cases (empty inputs, special characters)
4. Verify word count limits are enforced
5. Test with different user info combinations

## Monitoring and Alerts

### Development Mode:
- Show grammar warnings in console
- Display quality scores for generated stories
- Highlight problematic templates

### Production Mode:
- Log quality issues for analysis
- Track grammar error rates
- Monitor story generation success rates

## Emergency Fix Protocol

If a grammar error is discovered in production:

1. **Immediate**: Fix the specific template causing the error
2. **Short-term**: Add automated test to prevent regression
3. **Long-term**: Review all templates for similar patterns
4. **Prevention**: Update this guide with the new pattern to avoid

## Common Mistake Patterns to Avoid

### 1. Present Tense Pronoun Errors
```javascript
// WRONG PATTERNS:
`${subject} eat`, `${subject} run`, `${subject} play`
`${subject} like`, `${subject} go`, `${subject} see`
`${subject} find`, `${subject} help`, `${subject} love`

// SAFE ALTERNATIVES:
`${characterName} eats`, `${characterName} runs`, `${characterName} plays`
`${subject} was eating`, `${subject} will run`, `${subject} can play`
```

### 2. Template Variable Leakage
```javascript
// WRONG - Variables not replaced:
"Alex saw a {color} cat."  // {color} not replaced
"[name] went home."        // [name] brackets wrong

// CORRECT - Proper replacement:
"Alex saw a blue cat."     // All variables replaced
```

### 3. Inconsistent Character References
```javascript
// WRONG - Mixed character references:
"Alex went to school. He played with friends. The child was happy."

// CORRECT - Consistent references:
"Alex went to school. Alex played with friends. Alex was happy."
// OR
"Alex went to school. He played with friends. He was happy."
```

## Tools and Resources

### Grammar Validation:
- `GrammarValidator.validateStoryText(text)` - Check single page
- `GrammarValidator.validateStoryPages(pages)` - Check full story
- `GrammarValidator.createSentence(subject, verb, object)` - Safe sentence creation

### Quality Checking:
- `StoryQualityChecker.checkStoryQuality(pages, difficulty)` - Comprehensive check
- Provides grammar, flow, structure, and readability analysis

### Development Helpers:
- `validateAndFixGrammar(text)` - Auto-fix common issues
- `GrammarValidator.conjugateVerb(verb, subject)` - Proper verb forms

Remember: **Quality first, then creativity.** A grammatically correct simple story is better than a creative story with errors.