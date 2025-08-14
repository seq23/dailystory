// Story Voice Patterns - 10 Author Styles for Educational Reading
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
  ericCarleRed: {
    name: "Eric Carle Style",
    description: "Simple, rhythmic text with bright imagery and nature themes. Growth and transformation stories.",
    ageRange: "3-5",
    patterns: {
      openings: [
        "In the light of the moon, {userName} saw a little {animal}...",
        "On Monday, {userName} ate through one {food}...",
        "A small {animal} sat on a leaf...",
        "The very {adjective} {userName} was ready for adventure...",
        "Early in the morning, a {adjective} {animal} peeked out...",
        "Under a {color} sky, {userName} found something special...",
        "{userName} followed a colorful trail through the garden...",
        "One bright {object} led to another, and another..."
      ],
      transitions: [
        "But {pronoun} was still curious.",
        "The next day was Sunday again.",
        "Pop! Out came something wonderful...",
        "Now {pronoun} wasn't small anymore.",
        "Soon, the {animal} showed a new path.",
        "Step by step, everything changed colors.",
        "And then a friendly {animal} waved hello.",
        "Little by little, {userName} learned more."
      ],
      closings: [
        "And {userName} was a beautiful {animal}!",
        "What a beautiful day {pronoun} had become!",
        "Now {pronoun} was no longer hungry.",
        "The end of a perfect day.",
        "The garden grew quiet as stars appeared.",
        "{userName} smiled at the gentle night sky.",
        "Everything felt bright and new.",
        "Tomorrow, {userName} would explore again."
      ]
    },
    characteristics: ["simple repetition", "nature themes", "transformation", "growth"],
    preferredThemes: ["nature", "growth", "curiosity", "discovery"]
  },

  sandraBoyntonYellow: {
    name: "Sandra Boynton Style", 
    description: "Playful, rhyming stories with humor and charm, often featuring anthropomorphic animals.",
    ageRange: "3-5",
    patterns: {
      openings: [
        "Hippos go berserk! And so does {userName}!",
        "Moo, baa, la la la! {userName} loves to play!",
        "Oh my goodness! Oh my gosh! {userName} needs to dance!",
        "Dogs and cats and pigs, oh my! {userName} says hello!",
        "Time to wiggle, time to jiggle, {userName} starts the day!",
        "Barnyard animals everywhere! {userName} wants to join!",
        "Silly songs and silly dances, {userName} loves them all!",
        "But not {userName}. {userName} says 'Let's have fun!'"
      ],
      transitions: [
        "But wait! There's more fun to be had!",
        "Stomp stomp stomp goes {userName}!",
        "What a silly thing to do!",
        "Everybody dance! Even {userName}!",
        "Round and round and giggle around!",
        "Oink and moo and cock-a-doodle-doo!",
        "Time for snacks and silly snorts!",
        "More giggles, more wiggles!"
      ],
      closings: [
        "The end! (But not really the end.)",
        "And {userName} was very, very happy.",
        "What a silly, wonderful day!",
        "Time for a snack and a nap!",
        "Good night, sleep tight, don't let the bed bugs bite!",
        "And everyone laughed until they cried!",
        "That's all folks! Time to say goodbye!",
        "Sweet dreams of dancing animals!"
      ]
    },
    characteristics: ["silly", "bouncy", "animals", "humor", "rhyming"],
    preferredThemes: ["animals", "friendship", "playfulness", "humor"]
  },

  moWillemsGreen: {
    name: "Mo Willems Style",
    description: "Minimalist dialogue, expressive illustrations, and humor that resonates with both kids and adults.",
    ageRange: "5-7",
    patterns: {
      openings: [
        "{userName} was having a really difficult day.",
        "'I do NOT want to!' said {userName}.",
        "{userName} had a very important question.",
        "There was a big problem today.",
        "{userName} found it hard to explain feelings.",
        "Today was going to be different.",
        "Something was not quite right.",
        "'Wait!' shouted {userName}. 'I have an idea!'"
      ],
      transitions: [
        "But then something important happened.",
        "'Wait!' shouted {userName}.",
        "That was not what {pronoun} expected at all.",
        "Sometimes the best ideas come when you least expect them.",
        "They took a deep breath and tried again.",
        "Maybe there was another way to think about this.",
        "'{userName},' said the wise friend, 'listen carefully.'",
        "And then... everything changed."
      ],
      closings: [
        "And they both laughed and laughed.",
        "That is what friendship is all about.",
        "Tomorrow would bring new adventures.",
        "Being different makes life special.",
        "They solved it with patience and kindness.",
        "Different ideas can still work together.",
        "They promised to listen first next time.",
        "And that felt like real friendship."
      ]
    },
    characteristics: ["emotional honesty", "friendship", "simple dialogue", "problem solving"],
    preferredThemes: ["friendship", "kindness", "empathy", "problem-solving"]
  },

  arnoldLobelPurple: {
    name: "Arnold Lobel Style",
    description: "Gentle, whimsical tales with friendship and moral undertones.",
    ageRange: "5-7",
    patterns: {
      openings: [
        "{userName} and {friend} were the very best of friends.",
        "One spring morning, {userName} knocked on the door.",
        "{userName} was feeling quite lonely today.",
        "It was the kind of day when friends are most important.",
        "{userName} had been thinking about {friend} all morning.",
        "The seasons were changing, and so was {userName}.",
        "There are days when even good friends disagree.",
        "{userName} wanted to do something special for {friend}."
      ],
      transitions: [
        "But then {friend} had a wonderful idea.",
        "Together, they decided to try something new.",
        "Sometimes the best adventures are shared.",
        "That's when {userName} remembered something important.",
        "Friends can help each other in surprising ways.",
        "They discovered that working together was better.",
        "The two friends learned something valuable.",
        "And so they set off on their gentle adventure."
      ],
      closings: [
        "And so their friendship grew even stronger.",
        "They spent the rest of the day enjoying each other's company.",
        "That evening, they felt grateful for their friendship.",
        "Some things are better when shared with a friend.",
        "And they lived happily, side by side.",
        "Their friendship was a gift they treasured.",
        "Together, they watched the sunset and smiled.",
        "The best days are the ones spent with good friends."
      ]
    },
    characteristics: ["gentle wisdom", "friendship", "seasonal themes", "quiet adventures"],
    preferredThemes: ["friendship", "nature", "seasons", "quiet wisdom"]
  },

  beverlyClearyOrange: {
    name: "Beverly Cleary Style",
    description: "Relatable everyday adventures, realistic dialogue, and themes of friendship, family, and school life.",
    ageRange: "7-9",
    patterns: {
      openings: [
        "{userName} had been looking forward to this day all week.",
        "It all started when {userName} decided to help with chores.",
        "Nobody understood {userName} the way family did.",
        "Things never went the way {userName} planned them.",
        "First period had already gone sideways.",
        "{userName} thought today would be simple—until it wasn't.",
        "It began with a tiny mistake and a big lesson.",
        "The plan looked perfect on paper, but real life was different."
      ],
      transitions: [
        "But then something unexpected happened.",
        "That's when {userName} got a brilliant idea.",
        "Of course, things didn't go smoothly.",
        "As usual, life was more complicated than expected.",
        "So {userName} made a quick change and kept going.",
        "Of course, {friend} had a different opinion.",
        "They had to ask for help—and that was okay.",
        "A clever solution saved the day."
      ],
      closings: [
        "And {userName} learned that growing up means making mistakes.",
        "Sometimes the best adventures are the unexpected ones.",
        "Life with family is never boring.",
        "And {userName} couldn't wait for tomorrow's adventure.",
        "It wasn't perfect, but it was real.",
        "{userName} learned that being brave looks ordinary up close.",
        "Family jokes made the tough parts easier.",
        "Tomorrow had room for better choices and new adventures."
      ]
    },
    characteristics: ["realistic", "family life", "humor", "relatability", "everyday adventures"],
    preferredThemes: ["family", "school", "humor", "resilience", "growing up"]
  },

  roaldDahlPink: {
    name: "Roald Dahl Style",
    description: "Imaginative, often dark humor, quirky characters, and playful language.",
    ageRange: "7-9",
    patterns: {
      openings: [
        "{userName} had always been a rather extraordinary child.",
        "There was something decidedly peculiar about {userName}.",
        "Most grown-ups are beastly creatures, but {userName} was different.",
        "It was on a particularly dreary Tuesday that {userName} discovered...",
        "{userName} possessed a most unusual and wonderful secret.",
        "Now, you must understand that {userName} was no ordinary child.",
        "The grown-ups never suspected that {userName} could...",
        "It all began when {userName} found something absolutely impossible."
      ],
      transitions: [
        "But then, something absolutely extraordinary happened!",
        "Suddenly, {userName} realized {pronoun} had a magnificent power!",
        "The grown-ups were in for a tremendous surprise!",
        "That's when {userName} decided to teach them a lesson!",
        "Little did they know that {userName} was planning something spectacular!",
        "And then, with a tremendous whoosh and a crackle...",
        "The most wonderfully wicked idea popped into {userName}'s head!",
        "What happened next was simply astounding!"
      ],
      closings: [
        "And from that day forward, {userName} was never underestimated again!",
        "The grown-ups learned to respect {userName}'s extraordinary abilities!",
        "What a gloriously magnificent adventure it had been!",
        "And {userName} lived mischievously ever after!",
        "The world was a much more interesting place with {userName} in it!",
        "And that, my dear friends, is how {userName} saved the day!",
        "From then on, life was absolutely splendiferous!",
        "And they all celebrated with the most delicious treats imaginable!"
      ]
    },
    characteristics: ["imaginative", "quirky", "playful language", "empowerment", "mischief"],
    preferredThemes: ["magic", "empowerment", "overcoming bullies", "imagination"]
  },

  rickRiordanNavyBlue: {
    name: "Rick Riordan Style",
    description: "Fast-paced adventures with witty banter, quest structures, and mythological elements blended into modern settings.",
    ageRange: "9-11",
    patterns: {
      openings: [
        "{userName} had always known {pronoun} was different, but this was ridiculous.",
        "The day {userName} discovered {pronoun} could control water started like any other.",
        "Most kids worry about math tests. {userName} worried about monsters.",
        "It wasn't every day that {userName}'s teacher turned into a fury.",
        "{userName} should have known that field trip would end in disaster.",
        "The ancient prophecy had mentioned {userName} specifically, which was terrifying.",
        "When your {object} starts glowing, you know you're in trouble.",
        "{userName} thought {pronoun} was having a normal day until the {mythical creature} showed up."
      ],
      transitions: [
        "That's when {userName} realized this wasn't going to be easy.",
        "Suddenly, {userName}'s training kicked in.",
        "Time slowed down as {userName} focused {pronoun} power.",
        "The quest was only getting more dangerous.",
        "But {userName} had {friends} counting on {pronoun}.",
        "This was exactly what the prophecy had warned about.",
        "Drawing {pronoun} {weapon}, {userName} prepared for battle.",
        "The fate of both worlds hung in the balance."
      ],
      closings: [
        "And {userName} realized that being a hero isn't about being perfect.",
        "The adventure was over, but {userName} knew more challenges awaited.",
        "Sometimes saving the world is just another Tuesday.",
        "With great power comes great homework, {userName} thought wryly.",
        "The gods were pleased, and that was saying something.",
        "Camp would never be the same after {userName}'s quest.",
        "Not bad for a {age}-year-old demigod.",
        "The prophecy was fulfilled, but new mysteries had already begun."
      ]
    },
    characteristics: ["fast-paced", "heroic quests", "witty dialogue", "modern mythology", "coming of age"],
    preferredThemes: ["adventure", "mythology", "friendship", "courage", "identity"]
  },

  jkRowlingCopper: {
    name: "J.K. Rowling Style",
    description: "Richly imagined fantasy worlds, layered plots, and a balance of mystery, action, and character growth.",
    ageRange: "9-11",
    patterns: {
      openings: [
        "{userName} had always felt there was something different about {pronoun}, something magical.",
        "The letter arrived on {userName}'s birthday, changing everything forever.",
        "Strange things had been happening around {userName} lately.",
        "The old {object} in {userName}'s {setting} began to glow mysteriously.",
        "{userName} discovered that {pronoun} family had kept an enormous secret.",
        "It was on Platform {number} that {userName}'s real adventure began.",
        "The {magical creature} appeared just when {userName} needed help most.",
        "Professor {teacher} had been waiting for {userName} to discover {pronoun} true potential."
      ],
      transitions: [
        "But {userName} soon learned that magic came with great responsibility.",
        "The mystery deepened as {userName} uncovered ancient secrets.",
        "With {pronoun} wand in hand, {userName} felt {pronoun} power growing.",
        "The {antagonist} would not give up without a fight.",
        "Together with {friends}, {userName} devised a clever plan.",
        "The prophecy spoke of a chosen one, and {userName} was beginning to understand.",
        "Dark forces were gathering, but {userName} was not alone.",
        "The final confrontation would test everything {userName} had learned."
      ],
      closings: [
        "And {userName} understood that the greatest magic of all was {love/friendship}.",
        "Hogwarts would always be home to {userName}.",
        "The battle was won, but {userName} knew the war against darkness continued.",
        "With {pronoun} friends by {pronoun} side, {userName} was ready for anything.",
        "The magical world was safe, thanks to {userName}'s courage.",
        "And so {userName}'s legend began to grow.",
        "The boy/girl who lived had become the {hero/heroine} who conquered.",
        "Magic, it seemed, was just the beginning of {userName}'s story."
      ]
    },
    characteristics: ["rich world-building", "mystery", "character growth", "magical realism", "friendship"],
    preferredThemes: ["magic", "friendship", "good vs evil", "identity", "courage"]
  },

  suzanneCollinsSlateGray: {
    name: "Suzanne Collins Style",
    description: "Tense, action-driven narratives with high stakes and themes of survival, sacrifice, and societal conflict.",
    ageRange: "11-15",
    patterns: {
      openings: [
        "When {userName} volunteered, everything changed.",
        "The arena was designed to break spirits, but {userName} was different.",
        "Survival wasn't just about staying alive—it was about staying human.",
        "The rules of the game were simple: win or die.",
        "In District {number}, {userName} had learned that hope was dangerous.",
        "The Capitol had underestimated {userName}, and that would be their mistake.",
        "Freedom always comes at a price, and {userName} was willing to pay it.",
        "The revolution needed a symbol, and {userName} had become that symbol."
      ],
      transitions: [
        "But {userName} had learned to adapt, to survive.",
        "The stakes were higher than {userName} had ever imagined.",
        "Every decision could mean life or death for those {pronoun} loved.",
        "The gamemakers were changing the rules, but {userName} would not break.",
        "Alliance meant survival, but trust was a luxury {userName} couldn't afford.",
        "The line between right and wrong blurred in the arena of war.",
        "Sacrifice was the only currency that mattered now.",
        "The final battle would determine the fate of all the districts."
      ],
      closings: [
        "And {userName} realized that winning wasn't about defeating enemies—it was about saving souls.",
        "The games were over, but the real work of rebuilding had just begun.",
        "Freedom tasted like {food}, sweet and hard-earned.",
        "The nightmares would fade, but the courage would remain.",
        "A new world was possible, and {userName} had helped make it so.",
        "The mockingjay's song carried hope across all the districts.",
        "Peace was fragile, but {userName} would protect it.",
        "And the children would grow up free."
      ]
    },
    characteristics: ["high stakes", "survival themes", "social commentary", "complex morality", "coming of age"],
    preferredThemes: ["survival", "justice", "sacrifice", "rebellion", "hope"]
  },

  madeleinelengleTeal: {
    name: "Madeleine L'Engle Style",
    description: "Philosophical, imaginative stories blending science, faith, and coming-of-age themes.",
    ageRange: "11-15",
    patterns: {
      openings: [
        "It was a dark and stormy night when {userName} first felt the tesseract.",
        "The universe was vast and full of mystery, and {userName} was about to discover {pronoun} place in it.",
        "Love was the one force in the universe that could transcend time and space.",
        "Mrs. Who had told {userName} that the light was always stronger than the darkness.",
        "On the planet {planet}, {userName} learned that being different was a gift.",
        "The IT could control minds, but it could never touch the human heart.",
        "Mathematics and music, {userName} realized, were the languages of creation.",
        "Meg's faults were also her greatest strengths, as {userName} would learn."
      ],
      transitions: [
        "But {userName} was beginning to understand that love was indeed the answer.",
        "The journey through space and time had only just begun.",
        "Faith and science, {userName} discovered, were not enemies but allies.",
        "The darkness was real, but so was the light that {userName} carried within.",
        "Mrs. Whatsit's words echoed in {userName}'s mind: 'The foolishness of God is wiser than men.'",
        "Tessering required not just courage, but absolute trust in love.",
        "The battle between good and evil was fought in the human heart.",
        "And {userName} realized that {pronoun} was part of something infinitely larger."
      ],
      closings: [
        "And {userName} understood that love was the fabric that held the universe together.",
        "The stars sang their eternal song, and {userName} was part of the chorus.",
        "Home was not a place but the people who loved you unconditionally.",
        "The wrinkle in time had taught {userName} that all moments were precious.",
        "With {pronoun} family reunited, {userName} felt the universe smile.",
        "And the light shone in the darkness, and the darkness could not overcome it.",
        "Mrs. Whatsit was right: there was such a thing as a happy ending.",
        "The adventure was over, but {userName}'s journey of growth had just begun."
      ]
    },
    characteristics: ["philosophical", "scientific", "spiritual", "cosmic scope", "deep themes"],
    preferredThemes: ["love", "science", "faith", "family", "cosmic adventure"]
  }
};

// Age-based style mapping for the 10 author system
export const AGE_AUTHOR_MAPPING: Record<string, string[]> = {
  "3-5": ["ericCarleRed", "sandraBoyntonYellow"],
  "5-7": ["moWillemsGreen", "arnoldLobelPurple"],
  "7-9": ["beverlyClearyOrange", "roaldDahlPink"],
  "9-11": ["rickRiordanNavyBlue", "jkRowlingCopper"],
  "11-15": ["suzanneCollinsSlateGray", "madeleinelengleTeal"]
};

// Difficulty-based style mapping
export const DIFFICULTY_VOICE_MAPPING: Record<DifficultyLevel, string[]> = {
  beginner: ["ericCarleRed", "sandraBoyntonYellow"],
  easy: ["moWillemsGreen", "arnoldLobelPurple"],
  medium: ["beverlyClearyOrange", "roaldDahlPink"],
  hard: ["rickRiordanNavyBlue", "jkRowlingCopper"],
  expert: ["suzanneCollinsSlateGray", "madeleinelengleTeal"]
};

/**
 * Get appropriate story style for user age and difficulty level
 */
export function getAuthorVoiceForUser(userInfo: UserInfo, difficulty: DifficultyLevel): AuthorVoice {
  const age = userInfo.age;
  
  // Find age-appropriate patterns
  let ageAppropriateAuthors: string[] = [];
  
  if (age <= 5) ageAppropriateAuthors = AGE_AUTHOR_MAPPING["3-5"];
  else if (age <= 7) ageAppropriateAuthors = AGE_AUTHOR_MAPPING["5-7"];
  else if (age <= 9) ageAppropriateAuthors = AGE_AUTHOR_MAPPING["7-9"];
  else if (age <= 11) ageAppropriateAuthors = AGE_AUTHOR_MAPPING["9-11"];
  else ageAppropriateAuthors = AGE_AUTHOR_MAPPING["11-15"];
  
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
  try {
    return resolveMicroPlaceholders(pattern, variables);
  } catch (error) {
    console.warn('Pattern substitution failed:', error);
    return pattern.replace(/\{[^}]+\}/g, '___');
  }
}

/**
 * Apply opening enhancement with voice characteristics
 */
function enhanceOpeningWithVoice(content: string, styledPattern: string, voice: AuthorVoice): string {
  if (voice.characteristics.includes('rhythmic') || voice.characteristics.includes('repetition')) {
    return `${styledPattern} ${content}`;
  }
  return content.startsWith(styledPattern.split(' ')[0]) ? content : `${styledPattern} ${content}`;
}

/**
 * Apply closing enhancement with voice characteristics
 */
function enhanceClosingWithVoice(content: string, styledPattern: string, voice: AuthorVoice): string {
  if (voice.characteristics.includes('gentle') || voice.characteristics.includes('wisdom')) {
    return `${content} ${styledPattern}`;
  }
  return content.endsWith('.') ? `${content} ${styledPattern}` : `${content}. ${styledPattern}`;
}

/**
 * Apply transition enhancement with voice characteristics
 */
function enhanceTransitionWithVoice(content: string, styledPattern: string, voice: AuthorVoice): string {
  if (voice.characteristics.includes('fast-paced') || voice.characteristics.includes('action')) {
    return `${styledPattern} ${content}`;
  }
  return content;
}