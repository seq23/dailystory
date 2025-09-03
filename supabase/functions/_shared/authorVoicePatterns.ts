// Color-Based Story Voice Patterns for Never-Ending Stories
// Moved from frontend to edge functions for single source of truth

export type DifficultyLevel = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';

export interface ColorVoice {
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
  styleSummary: string;
  sampleMicroLines: string[];
}

export const COLOR_VOICES: Record<string, ColorVoice> = {
  red: {
    name: "Red Voice",
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
        "Little by little, {userName} learned more.",
        "The sun painted new patterns on leaves.",
        "A gentle breeze carried sweet scents.",
        "Slowly, the world grew brighter around {pronoun}.",
        "Each step brought a new discovery.",
        "The garden seemed to whisper secrets.",
        "Colors danced before {userName}'s eyes.",
        "Something magical was about to happen.",
        "The earth felt warm beneath {pronoun} feet.",
        "A new season was beginning to bloom.",
        "Petals floated down like tiny wishes.",
        "The morning dew sparkled like diamonds.",
        "Every flower seemed to nod hello.",
        "Time moved as slowly as honey.",
        "Nature held {userName} in its gentle arms.",
        "The world pulsed with quiet life.",
        "Another wonderful day was unfolding.",
        "Peace settled over the growing garden.",
        "The cycle of life continued its dance.",
        "Everything felt perfectly in place.",
        "A new chapter was ready to begin.",
        "The rhythm of growth never stopped."
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
    preferredThemes: ["nature", "growth", "curiosity", "discovery"],
    styleSummary: "Gentle, nature-focused voice with simple rhythmic patterns. Emphasizes growth, transformation, and curiosity through bright natural imagery.",
    sampleMicroLines: [
      "Step by step, everything changed colors.",
      "The garden seemed to whisper secrets.",
      "Pop! Out came something wonderful...",
      "Little by little, {userName} learned more."
    ]
  },

  yellow: {
    name: "Yellow Voice", 
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
        "More giggles, more wiggles!",
        "Bounce bounce bounce to the silly song!",
        "Wiggle your {body part}, shake your {body part}!",
        "Hip hip hooray for playtime!",
        "Tickle tickle goes the fuzzy {animal}!",
        "Zoom zoom zoom around the yard!",
        "Splish splash splash in the puddles!",
        "Clap clap clap with happy hands!",
        "Silly sounds and silly faces!",
        "Jump jump jump like a bouncy ball!",
        "Peek-a-boo! I see you too!",
        "Waddle like a happy duck!",
        "Giggle snorts and snorty giggles!",
        "Twirl and whirl and spin around!",
        "Fuzzy wuzzy wasn't fuzzy, was {pronoun}?",
        "Beep beep goes the busy bee!",
        "Silly silly silly billy!",
        "Dance party in the barnyard!",
        "Wobbly wobbly like jelly!",
        "Ring around the rosie time!",
        "Giggles echoed everywhere!",
        "What a wonderfully wacky day!"
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
    preferredThemes: ["animals", "friendship", "playfulness", "humor"],
    styleSummary: "Playful, bouncy voice with silly rhymes and humor. Features anthropomorphic animals and repetitive, joyful language.",
    sampleMicroLines: [
      "But wait! There's more fun to be had!",
      "Round and round and giggle around!",
      "Bounce bounce bounce to the silly song!",
      "What a wonderfully wacky day!"
    ]
  },

  green: {
    name: "Green Voice",
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
        "And then... everything changed.",
        "Feelings are complicated sometimes.",
        "'{userName}, what do you think we should do?'",
        "That made {userName} stop and think.",
        "Maybe they could figure this out together.",
        "The big problem suddenly seemed smaller.",
        "'Oh!' said {userName}. 'I understand now!'",
        "Sometimes friends see things differently.",
        "That gave {userName} a new idea to try.",
        "'{userName},' said {friend}, 'I have an idea.'",
        "They looked at each other and smiled.",
        "The answer was simpler than they thought.",
        "Maybe the real problem was something else.",
        "'{userName}, can you help me understand?'",
        "That's when everything started to make sense.",
        "They decided to be brave together.",
        "The feeling in {pronoun} chest was getting better.",
        "Maybe being different wasn't so bad after all.",
        "'{userName}, you're really good at this!'",
        "And that's when {pronoun} realized something important.",
        "Friends make everything better, don't they?",
        "The hard part was almost over."
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
    preferredThemes: ["friendship", "kindness", "empathy", "problem-solving"],
    styleSummary: "Emotionally honest voice with simple dialogue and problem-solving focus. Emphasizes friendship, feelings, and working through challenges together.",
    sampleMicroLines: [
      "But then something important happened.",
      "Maybe there was another way to think about this.",
      "And then... everything changed.",
      "Friends make everything better, don't they?"
    ]
  },

  purple: {
    name: "Purple Voice",
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
        "And so they set off on their gentle adventure.",
        "The afternoon sun painted everything golden.",
        "They walked slowly, savoring each moment.",
        "A gentle breeze carried the scent of flowers.",
        "The season whispered promises of change.",
        "Hand in hand, they explored the quiet path.",
        "Time seemed to slow down just for them.",
        "Nature welcomed their peaceful friendship.",
        "They shared stories as soft as morning light.",
        "Each step brought a new small wonder.",
        "The world felt safe and full of kindness.",
        "Their friendship bloomed like spring flowers.",
        "Together they discovered hidden treasures.",
        "The forest held its breath in gentle reverence.",
        "They moved with the unhurried grace of seasons.",
        "Simple moments became precious memories.",
        "Their hearts were as light as autumn leaves.",
        "The path ahead sparkled with possibility.",
        "They learned the wisdom of going slowly.",
        "Peace settled around them like a warm blanket.",
        "The day unfolded like a gentle story."
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
    preferredThemes: ["friendship", "nature", "seasons", "quiet wisdom"],
    styleSummary: "Gentle, whimsical voice with friendship and seasonal themes. Emphasizes quiet wisdom, shared adventures, and the beauty of simple moments.",
    sampleMicroLines: [
      "Together, they decided to try something new.",
      "The afternoon sun painted everything golden.",
      "Time seemed to slow down just for them.",
      "Simple moments became precious memories."
    ]
  },

  orange: {
    name: "Orange Voice",
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
        "A clever solution saved the day.",
        "Mom called from the kitchen with perfect timing.",
        "The mess looked worse than it actually was.",
        "Somehow, the disaster turned into something better.",
        "{userName} remembered what Dad always said.",
        "The phone rang at exactly the right moment.",
        "It was one of those days when everything goes wrong.",
        "But {userName} had dealt with worse before.",
        "A quick text to {friend} changed everything.",
        "The homework could wait—this was more important.",
        "Sometimes the best plans are no plans at all.",
        "Family dinner conversations never go as expected.",
        "The real test was how {userName} handled it.",
        "Mom's advice from last week suddenly made sense.",
        "It was time to try a completely different approach.",
        "The clock on the wall seemed to tick louder.",
        "This was definitely going to be a good story later.",
        "At least it wasn't as bad as last Tuesday.",
        "The important thing was that everyone was okay.",
        "Some days you just have to laugh at the chaos.",
        "Tomorrow would definitely be a fresh start."
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
    preferredThemes: ["family", "school", "humor", "resilience", "growing up"],
    styleSummary: "Realistic, relatable voice focusing on everyday family and school adventures. Emphasizes humor, resilience, and the ordinary magic of growing up.",
    sampleMicroLines: [
      "Of course, things didn't go smoothly.",
      "As usual, life was more complicated than expected.",
      "Mom called from the kitchen with perfect timing.",
      "Tomorrow would definitely be a fresh start."
    ]
  },

  pink: {
    name: "Pink Voice",
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
        "What happened next was simply astounding!",
        "The beastly grown-ups had no idea what was coming.",
        "With a flick of {pronoun} finger, {userName} made magic happen!",
        "The horrid headmistress was about to get her comeuppance!",
        "{userName} grinned the most mischievous grin imaginable.",
        "And then {userName} did something absolutely brilliant!",
        "The grown-ups stood there, jaws agape, as {userName}...",
        "It was time for the magnificent finale!",
        "With tremendous cleverness, {userName} outsmarted them all!",
        "The room erupted in the most wonderful chaos!",
        "Even {userName} was amazed by what {pronoun} had accomplished!",
        "The terrible adults learned a lesson they'd never forget!",
        "And that, dear reader, is how {userName} became a legend!",
        "The school would never be quite the same again!",
        "From that day forward, nobody dared underestimate {userName}!",
        "It was absolutely, positively, magnificently splendiferous!",
        "The grown-ups finally understood they'd met their match!",
        "What a gloriously topsy-turvy day it had become!",
        "The children cheered as {userName} took a bow!",
        "Even the most beastly teachers had to admit it was brilliant!",
        "And so {userName}'s reputation for magnificence grew and grew!"
      ],
      closings: [
        "And from that day on, {userName} was never bothered by horrid grown-ups again!",
        "The grown-ups learned to treat children with proper respect!",
        "What a perfectly wonderful, magnificently magical day!",
        "And everyone agreed that {userName} was absolutely splendiferous!",
        "The world became a much more interesting place with {userName} in it!",
        "Sometimes being extraordinary is exactly what the world needs!",
        "And they all lived more magically ever after!",
        "The end! (But really, it was just the beginning of the magic!)"
      ]
    },
    characteristics: ["imaginative", "quirky", "dark humor", "magical realism", "child empowerment"],
    preferredThemes: ["imagination", "justice", "empowerment", "magic", "cleverness"],
    styleSummary: "Imaginative, empowering voice with quirky characters and magical elements. Features child protagonists outsmarting adults through cleverness and special abilities.",
    sampleMicroLines: [
      "But then, something absolutely extraordinary happened!",
      "The most wonderfully wicked idea popped into {userName}'s head!",
      "With tremendous cleverness, {userName} outsmarted them all!",
      "It was absolutely, positively, magnificently splendiferous!"
    ]
  }
};

/**
 * Get color voice for user based on their preferences and difficulty
 */
export function getColorVoiceForUser(userInfo: any = {}, difficulty: DifficultyLevel = 'easy'): ColorVoice {
  const favoriteColor = userInfo.favoriteColor?.toLowerCase() || 'blue';
  
  // Map colors to voices with fallbacks
  const colorMapping: Record<string, string> = {
    red: 'red',
    pink: 'pink',
    purple: 'purple',
    blue: 'purple', // fallback to purple for gentle themes
    green: 'green',
    yellow: 'yellow',
    orange: 'orange',
    white: 'green', // fallback to gentle green voice
    black: 'pink', // fallback to imaginative pink voice
    brown: 'orange', // fallback to realistic orange voice
    gray: 'green', // fallback to problem-solving green voice
    grey: 'green'
  };
  
  const voiceKey = colorMapping[favoriteColor] || 'green';
  
  // Age-appropriate fallbacks based on difficulty
  if (difficulty === 'beginner' && !['red', 'yellow'].includes(voiceKey)) {
    return COLOR_VOICES.red; // Simple, nature-focused for youngest readers
  }
  
  if (difficulty === 'easy' && !['red', 'yellow', 'green', 'purple'].includes(voiceKey)) {
    return COLOR_VOICES.green; // Emotionally honest but simple
  }
  
  return COLOR_VOICES[voiceKey] || COLOR_VOICES.green;
}

/**
 * Apply micro placeholder resolution to voice patterns
 */
export function resolveMicroPlaceholders(text: string, userInfo: any = {}): string {
  const placeholders = {
    userName: userInfo.name || 'Child',
    pronoun: derivePronoun(userInfo),
    friend: 'Alex',
    animal: userInfo.favoriteAnimal || 'cat',
    color: userInfo.favoriteColor || 'blue',
    adjective: 'happy',
    object: 'ball'
  };
  
  let resolved = text;
  for (const [key, value] of Object.entries(placeholders)) {
    resolved = resolved.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }
  
  return resolved;
}

// Use shared pronoun derivation from placeholderResolver
import { derivePronoun } from './placeholderResolver.ts';