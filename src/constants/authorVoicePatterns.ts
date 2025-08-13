// Story Voice Patterns - Different narrative styles mapped by age groups
import type { DifficultyLevel, UserInfo } from "@/types";
import { resolveMicroPlaceholders } from "@/utils/placeholderResolver";

export interface AuthorVoice {
  name: string;
  description: string;
  ageRange: string;
  patterns: {
    openings: string[];
    transitions: string[];
    closings: string[];
  };
  characteristics: string[];
  preferredThemes?: string[];
}

export const AUTHOR_VOICES: Record<string, AuthorVoice> = {
  redPattern: {
    name: "Nature Discovery Style",
    description: "Simple repetitive patterns with nature themes and growth",
    ageRange: "3-6",
    patterns: {
      openings: [
        "In the light of the moon, {userName} saw...",
        "On Monday, {userName} ate through one {food}...",
        "A small {animal} sat on a leaf...",
        "The very {adjective} {userName} was ready...",
        "Early in the {setting}, a {adjective} {animal} peeked out...",
        "Under a {color} sky, {userName} found a {object}...",
        "{userName} followed a {color} trail through the {setting}...",
        "One {color} {object} led to another, and another..."
      ],
      transitions: [
        "But {pronoun} was still hungry.",
        "The next day was Sunday again.",
        "Pop! Out came {userName}...",
        "Now {pronoun} wasn't {adjective} any more.",
        "Soon, the {animal} showed a new path.",
        "Step by step, the {setting} changed colors.",
        "And then a friendly {animal} waved hello.",
        "Little by little, {userName} learned more."
      ],
      closings: [
        "And {userName} was a beautiful {animal}!",
        "What a beautiful {animal} {pronoun} had become!",
        "Now {pronoun} was no longer hungry.",
        "The end of a perfect day.",
        "The {setting} grew quiet as stars appeared.",
        "{userName} smiled at the gentle night sky.",
        "Everything felt calm, bright, and new.",
        "Tomorrow, {userName} would explore again."
      ]
    },
    characteristics: ["simple repetition", "nature themes", "transformation", "growth"],
    preferredThemes: ["nature", "growth", "curiosity", "discovery"]
  },

  bluePattern: {
    name: "Friendship Adventure Style", 
    description: "Emotional honesty with simple dialogue and friendship",
    ageRange: "3-7",
    patterns: {
      openings: [
        "{userName} was having a really bad day.",
        "'I do NOT want to!' said {userName}.",
        "{userName} and {friend} were best friends.",
        "There was a big problem today."
      ],
      transitions: [
        "But then {friend} said something important.",
        "'Wait!' shouted {userName}.",
        "That was not what {pronoun} expected at all.",
        "Friends can help each other."
      ],
      closings: [
        "And they both laughed and laughed.",
        "That is what friends are for.",
        "Tomorrow would be even better.",
        "Being different makes friendship special."
      ]
    },
    characteristics: ["emotional honesty", "friendship", "simple dialogue", "problem solving"],
    preferredThemes: ["friendship", "kindness", "empathy", "problem-solving"]
  },

  greenPattern: {
    name: "Playful Rhythm Style",
    description: "Rhythmic patterns with playful language and wordplay",
    ageRange: "3-8", 
    patterns: {
      openings: [
        "Oh my! Oh me! {userName} could not see...",
        "Here comes {userName} running fast...",
        "Would you like {food} and {object}?",
        "I do not like them, Sam-I-Am..."
      ],
      transitions: [
        "But wait! What's that? What could it be?",
        "Then {userName} said with a great big grin...",
        "Round and round and round they go!",
        "This way, that way, here and there!"
      ],
      closings: [
        "And {userName} learned something new that day!",
        "What a {adjective} day it turned out to be!",
        "The fun was done, but memories stayed.",
        "And that is that about that!"
      ]
    },
    characteristics: ["rhythm", "rhyme", "wordplay", "exuberance"],
    preferredThemes: ["creativity", "playfulness", "curiosity"]
  },

  simpleYellowPattern: {
    name: "Simple Bedtime Style",
    description: "Ultra-simple bedtime words for beginners",
    ageRange: "2-3",
    patterns: {
      openings: [
        "Night time.",
        "Moon shines.",
        "Stars out.",
        "Sleep time."
      ],
      transitions: [
        "{userName} yawns.",
        "Eyes close.",
        "Dream time.",
        "So quiet."
      ],
      closings: [
        "{userName} sleeps.",
        "Good night.",
        "Sweet dreams.",
        "All done."
      ]
    },
    characteristics: ["2-3 words", "bedtime", "ultra simple", "calming"]
  },

  simpleOrangePattern: {
    name: "Simple Silly Style",
    description: "Ultra-simple silly animal words for beginners",
    ageRange: "2-3",
    patterns: {
      openings: [
        "Dogs jump.",
        "Cats dance.",
        "Bears wiggle.",
        "Fun time!"
      ],
      transitions: [
        "{userName} laughs.",
        "So silly!",
        "More fun!",
        "Again! Again!"
      ],
      closings: [
        "{userName} giggles.",
        "So funny!",
        "Happy day!",
        "All done!"
      ]
    },
    characteristics: ["2-3 words", "silly", "animals", "joyful"]
  },

  yellowPattern: {
    name: "Gentle Bedtime Style",
    description: "Gentle, soothing rhythms with everyday magic",
    ageRange: "4-6",
    patterns: {
      openings: [
        "In the great green {setting}, there was...",
        "Goodnight {object}, goodnight {animal}...",
        "Once upon a time in a little {setting}...",
        "There was a little {animal} who loved..."
      ],
      transitions: [
        "And in the {setting} there was...",
        "Quietly, softly, {userName} whispered...",
        "The moon rose higher and...",
        "All around the {setting}, things were peaceful."
      ],
      closings: [
        "And they all lived quietly ever after.",
        "Goodnight stars, goodnight air, goodnight noises everywhere.",
        "And {userName} fell fast asleep.",
        "Peace filled the {setting} as night came."
      ]
    },
    characteristics: ["gentle rhythm", "bedtime comfort", "simple beauty", "peaceful endings"]
  },

  orangePattern: {
    name: "Silly Animal Style",
    description: "Silly, bouncy rhythms with animal characters",
    ageRange: "4-5",
    patterns: {
      openings: [
        "Hippos go berserk! And so does {userName}!",
        "But not {userName}. {userName} says...",
        "Moo, baa, la la la! {userName} loves to...",
        "Oh my goodness! Oh my gosh! {userName} needs to..."
      ],
      transitions: [
        "But wait! There's more!",
        "Stomp stomp stomp goes {userName}!",
        "What a {adjective} thing to do!",
        "Everybody {action}! Even {userName}!"
      ],
      closings: [
        "The end! (But not really the end.)",
        "And {userName} was very, very happy.",
        "What a silly, wonderful day!",
        "Time for a snack and a nap!"
      ]
    },
    characteristics: ["silly", "bouncy", "animals", "humor"]
  },

  purplePattern: {
    name: "Cause & Effect Style",
    description: "Cause-and-effect chains with circular storytelling",
    ageRange: "3-7",
    patterns: {
      openings: [
        "If you give {userName} a {object}...",
        "When {userName} sees a {animal}...",
        "If {userName} goes to the {setting}...",
        "One thing always leads to another when..."
      ],
      transitions: [
        "That will remind {pronoun} of...",
        "So {pronoun} will want to...",
        "Which means {pronoun} will need...",
        "Then {pronoun} will probably ask for..."
      ],
      closings: [
        "And chances are, {pronoun} will want another {object}.",
        "Which will remind {pronoun} how this all started.",
        "And the whole thing will begin again.",
        "And you know what that means..."
      ]
    },
    characteristics: ["cause and effect", "circular narratives", "predictable patterns", "humor"]
  },

  simpleSilverPattern: {
    name: "Simple Growing Style",
    description: "Ultra-simple growth words for beginners",
    ageRange: "2-3",
    patterns: {
      openings: [
        "{userName} grows.",
        "Getting big.",
        "I can!",
        "Look! {userName}!"
      ],
      transitions: [
        "Try again.",
        "Almost there!",
        "Keep going.",
        "Good job!"
      ],
      closings: [
        "{userName} did!",
        "All done!",
        "So proud!",
        "Big now!"
      ]
    },
    characteristics: ["2-3 words", "growth", "encouragement", "pride"]
  },

  pearlPattern: {
    name: "Growing Up Style",
    description: "Gentle emotional stories about growing up",
    ageRange: "4-8",
    patterns: {
      openings: [
        "{userName} was not quite ready for...",
        "Sometimes {userName} felt very small...",
        "When {userName} was little, {pronoun} thought...",
        "There are days when everything seems..."
      ],
      transitions: [
        "But slowly, things began to change.",
        "And then {userName} had an idea.",
        "Sometimes the best things happen when...",
        "That's when {userName} realized..."
      ],
      closings: [
        "And {userName} knew everything would be okay.",
        "Growing up happens one day at a time.",
        "Some things are worth waiting for.",
        "And {userName} felt brave and ready."
      ]
    },
    characteristics: ["gentle emotion", "growing up", "reassurance", "quiet wisdom"]
  },

  goldPattern: {
    name: "Adventure Life Style",
    description: "Realistic childhood adventures with humor",
    ageRange: "7-12",
    patterns: {
      openings: [
        "{userName} had been looking forward to this day...",
        "It all started when {userName} decided to...",
        "Nobody understood {userName} the way...",
        "Things never went the way {userName} planned..."
      ],
      transitions: [
        "But then something unexpected happened.",
        "That's when {userName} got a brilliant idea.",
        "Of course, things didn't go smoothly.",
        "As usual, life was more complicated than..."
      ],
      closings: [
        "And {userName} learned that growing up means...",
        "Sometimes the best adventures are unexpected.",
        "Life with family is never boring.",
        "And {userName} couldn't wait for tomorrow."
      ]
    },
    characteristics: ["realistic", "family life", "humor", "relatability"],
    preferredThemes: ["family", "adventure", "humor", "resilience"]
  }
};

// Age-based style mapping
export const AGE_AUTHOR_MAPPING: Record<string, string[]> = {
  "2-3": ["simpleYellowPattern", "simpleOrangePattern", "simpleSilverPattern"],
  "3-4": ["redPattern", "bluePattern", "greenPattern", "purplePattern"],
  "4-5": ["redPattern", "bluePattern", "greenPattern", "purplePattern", "yellowPattern", "orangePattern"],
  "5-6": ["greenPattern", "bluePattern", "purplePattern", "pearlPattern"],
  "6-7": ["greenPattern", "purplePattern", "pearlPattern"],
  "7-8": ["pearlPattern", "goldPattern"],
  "8-12": ["goldPattern"],
  "12+": ["goldPattern"]
};

export const DIFFICULTY_VOICE_MAPPING: Record<DifficultyLevel, string[]> = {
  beginner: ["simpleYellowPattern", "simpleOrangePattern", "simpleSilverPattern"],
  easy: ["redPattern", "yellowPattern", "orangePattern"],
  medium: ["bluePattern", "greenPattern", "purplePattern"],
  hard: ["pearlPattern", "purplePattern", "bluePattern"],
  expert: ["goldPattern", "pearlPattern"]
};

/**
 * Get appropriate story style for user age and difficulty level
 */
export function getAuthorVoiceForUser(userInfo: UserInfo, difficulty: DifficultyLevel): AuthorVoice {
  const age = userInfo.age;
  
  // Find age-appropriate patterns
  let ageAppropriateAuthors: string[] = [];
  
  if (age <= 3) ageAppropriateAuthors = AGE_AUTHOR_MAPPING["2-3"];
  else if (age <= 4) ageAppropriateAuthors = AGE_AUTHOR_MAPPING["3-4"];
  else if (age <= 5) ageAppropriateAuthors = AGE_AUTHOR_MAPPING["4-5"];
  else if (age <= 6) ageAppropriateAuthors = AGE_AUTHOR_MAPPING["5-6"];
  else if (age <= 7) ageAppropriateAuthors = AGE_AUTHOR_MAPPING["6-7"];
  else if (age <= 8) ageAppropriateAuthors = AGE_AUTHOR_MAPPING["7-8"];
  else if (age <= 12) ageAppropriateAuthors = AGE_AUTHOR_MAPPING["8-12"];
  else ageAppropriateAuthors = AGE_AUTHOR_MAPPING["12+"];
  
  // Get difficulty-appropriate patterns
  const difficultyAuthors = DIFFICULTY_VOICE_MAPPING[difficulty];
  
  // Find intersection of age-appropriate and difficulty-appropriate patterns
  const appropriateAuthors = ageAppropriateAuthors.filter(author => 
    difficultyAuthors.includes(author)
  );
  
  // If no intersection, prioritize age-appropriateness
  const finalAuthors = appropriateAuthors.length > 0 ? appropriateAuthors : ageAppropriateAuthors;
  
  // Select random pattern from appropriate list
  const selectedAuthor = finalAuthors[Math.floor(Math.random() * finalAuthors.length)];
  
  return AUTHOR_VOICES[selectedAuthor];
}

/**
 * Get appropriate story style for difficulty level (backward compatibility)
 */
export function getAuthorVoiceForDifficulty(difficulty: DifficultyLevel): AuthorVoice {
  const availableVoices = DIFFICULTY_VOICE_MAPPING[difficulty];
  const selectedVoice = availableVoices[Math.floor(Math.random() * availableVoices.length)];
  return AUTHOR_VOICES[selectedVoice];
}

/**
 * Apply story style characteristics to content naturally
 */
export function applyAuthorVoice(
  content: string,
  voice: AuthorVoice,
  position: 'opening' | 'transition' | 'closing'
): string {
  // If content is already author-voice styled or very short, return as is
  if (content.length < 20 || isAlreadyStyledContent(content, voice)) {
    return content;
  }

  const patterns = voice.patterns[position + 's' as keyof typeof voice.patterns];
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  
  // Extract variables from content for pattern substitution
  const variables = extractContentVariables(content);
  const styledPattern = substitutePatternVariables(pattern, variables, content);

  // Apply voice characteristics naturally based on position
  switch (position) {
    case 'opening':
      return enhanceOpeningWithVoice(content, styledPattern, voice);
    case 'closing':
      return enhanceClosingWithVoice(content, styledPattern, voice);
    case 'transition':
      return enhanceTransitionWithVoice(content, styledPattern, voice);
    default:
      return content;
  }
}

/**
 * Check if content already has story style styling
 */
function isAlreadyStyledContent(content: string, voice: AuthorVoice): boolean {
  const voiceIndicators = [
    ...voice.patterns.openings,
    ...voice.patterns.transitions, 
    ...voice.patterns.closings
  ].flatMap(pattern => pattern.split(' ').filter(word => 
    !word.includes('{') && word.length > 3
  ));
  
  return voiceIndicators.some(indicator => 
    content.toLowerCase().includes(indicator.toLowerCase())
  );
}

/**
 * Extract variables from existing content
 */
function extractContentVariables(content: string): Record<string, string> {
  // Simple extraction - can be enhanced based on content analysis
  const variables: Record<string, string> = {};
  
  // Extract potential names (capitalized words not at sentence start)
  const nameMatch = content.match(/\b[A-Z][a-z]+\b/g);
  if (nameMatch) {
    variables.name = nameMatch[0];
    variables.userName = nameMatch[0];
  }
  
  // Extract basic descriptors
  if (content.includes('beautiful')) variables.adjective = 'beautiful';
  if (content.includes('little')) variables.adjective = 'little';
  if (content.includes('big')) variables.adjective = 'big';
  
  return variables;
}

/**
 * Substitute pattern variables using resolver with safe fallbacks
 */
function substitutePatternVariables(
  pattern: string,
  variables: Record<string, string>,
  sourceContent?: string
): string {
  return resolveMicroPlaceholders(pattern, { seed: variables, pageText: sourceContent });
}

/**
 * Enhance opening with voice characteristics
 */
function enhanceOpeningWithVoice(content: string, pattern: string, voice: AuthorVoice): string {
  // For openings, replace the first sentence if pattern is meaningful
  if (pattern.length > 10 && !pattern.includes('{}')) {
    const sentences = content.split('. ');
    sentences[0] = pattern;
    return sentences.join('. ');
  }
  return content;
}

/**
 * Enhance closing with voice characteristics  
 */
function enhanceClosingWithVoice(content: string, pattern: string, voice: AuthorVoice): string {
  // For closings, replace the last sentence if pattern is meaningful
  if (pattern.length > 10 && !pattern.includes('{}')) {
    const sentences = content.split('. ');
    sentences[sentences.length - 1] = pattern;
    return sentences.join('. ');
  }
  return content;
}

/**
 * Enhance transition with voice characteristics
 */
function enhanceTransitionWithVoice(content: string, pattern: string, voice: AuthorVoice): string {
  // For transitions, enhance the middle part if pattern is meaningful
  if (pattern.length > 10 && !pattern.includes('{}')) {
    const sentences = content.split('. ');
    if (sentences.length > 2) {
      const midIndex = Math.floor(sentences.length / 2);
      sentences[midIndex] = pattern + '. ' + sentences[midIndex];
      return sentences.join('. ');
    }
  }
  return content;
}
