// Author Voice Service - Moved from Backend for Frontend Processing
import type { DifficultyLevel } from "@/types";

export interface ColorVoice {
  name: string;
  description: string;
  ageRange: string;
  patterns: {
    openings: string[];
    transitions: string[];
    closings: string[];
    plotTwists: string[];      // NEW
    continuations: string[];   // NEW
    pauses: string[];         // NEW
    hooks: string[];          // NEW
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
        "Little by little, {userName} learned more."
      ],
      closings: [
        "And {userName} was a beautiful {animal}!",
        "What a beautiful day {pronoun} had become!",
        "Now {pronoun} was no longer hungry.",
        "The end of a perfect day."
      ],
      plotTwists: [
        "Suddenly, the {animal} revealed a secret!",
        "The {color} path led to an amazing discovery!",
        "Something magical happened to {userName}!"
      ],
      continuations: [
        "Tomorrow brings a new adventure...",
        "The story continues with {userName}...",
        "What happens next? Let's see..."
      ],
      pauses: [
        "Take a gentle breath...",
        "Pause and imagine...",
        "Rest for a moment..."
      ],
      hooks: [
        "A sparkle catches {userName}'s eye...",
        "Something rustles in the leaves...",
        "A gentle sound calls to {userName}..."
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
        "More giggles, more wiggles!"
      ],
      closings: [
        "The end! (But not really the end.)",
        "And {userName} was very, very happy.",
        "What a silly, wonderful day!",
        "Time for a snack and a nap!"
      ],
      plotTwists: [
        "Surprise! The {animal} can dance too!",
        "Whoops! {userName} started a giggle parade!",
        "Oh my! Everyone wants to join the fun!"
      ],
      continuations: [
        "More silly fun awaits...",
        "The giggles never stop...",
        "Round two of silliness begins..."
      ],
      pauses: [
        "Giggle break time!",
        "Catch your breath from laughing!",
        "Wiggle pause!"
      ],
      hooks: [
        "A funny sound makes {userName} giggle...",
        "Something bouncy catches {userName}'s eye...",
        "A silly song starts playing..."
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
        "And then... everything changed."
      ],
      closings: [
        "And they both laughed and laughed.",
        "That is what friendship is all about.",
        "Tomorrow would bring new adventures.",
        "Being different makes life special."
      ],
      plotTwists: [
        "The problem turned into a gift!",
        "A friend appeared just when needed!",
        "The solution was hiding in plain sight!"
      ],
      continuations: [
        "The friendship grows stronger...",
        "New challenges await...",
        "The next day brings hope..."
      ],
      pauses: [
        "Take a deep breath together...",
        "Think about what matters most...",
        "Feel the friendship in your heart..."
      ],
      hooks: [
        "A gentle voice calls {userName}'s name...",
        "Something warm touches {userName}'s heart...",
        "A friend's eyes sparkle with understanding..."
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
        "And so they set off on their gentle adventure."
      ],
      closings: [
        "And so their friendship grew even stronger.",
        "They spent the rest of the day enjoying each other's company.",
        "That evening, they felt grateful for their friendship.",
        "Some things are better when shared with a friend."
      ],
      plotTwists: [
        "The seasons brought an unexpected gift!",
        "A quiet moment revealed something beautiful!",
        "The simple became extraordinary!"
      ],
      continuations: [
        "The seasons turn, the friendship remains...",
        "Tomorrow holds gentle surprises...",
        "The friendship grows with each season..."
      ],
      pauses: [
        "Listen to the gentle breeze...",
        "Notice the changing light...",
        "Feel the warmth of friendship..."
      ],
      hooks: [
        "A soft whisper in the wind...",
        "Gentle footsteps on the path...",
        "A quiet knock at the door..."
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
        "A clever solution saved the day."
      ],
      closings: [
        "And {userName} learned that growing up means making mistakes.",
        "Sometimes the best adventures are the unexpected ones.",
        "Life with family is never boring.",
        "And {userName} couldn't wait for tomorrow's adventure."
      ],
      plotTwists: [
        "The mistake turned into the best part!",
        "Family came to the rescue in an unexpected way!",
        "The boring day became an amazing adventure!"
      ],
      continuations: [
        "Tomorrow's plan is already forming...",
        "The family adventure continues...",
        "Next week holds new possibilities..."
      ],
      pauses: [
        "Take a moment to appreciate family...",
        "Think about what you've learned...",
        "Consider all the possibilities..."
      ],
      hooks: [
        "The phone rings with news...",
        "Mom calls from the kitchen...",
        "A new plan starts forming..."
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
        "What happened next was simply astounding!"
      ],
      closings: [
        "And {userName} lived happily ever after (until the next adventure).",
        "It was the most splendidly ridiculous day anyone could imagine.",
        "The grown-ups learned to never underestimate {userName} again.",
        "And that, dear reader, is how {userName} changed everything."
      ],
      plotTwists: [
        "The impossible became gloriously possible!",
        "The adults discovered {userName}'s magnificent secret!",
        "Everything turned wonderfully upside down!"
      ],
      continuations: [
        "The extraordinary adventures multiply...",
        "More magnificent mischief awaits...",
        "The next impossible thing beckons..."
      ],
      pauses: [
        "Savor this delicious moment...",
        "Let the wonder sink in...",
        "Feel the magic in the air..."
      ],
      hooks: [
        "A peculiar shimmer catches the light...",
        "Something extraordinary stirs...",
        "The impossible whispers {userName}'s name..."
      ]
    },
    characteristics: ["imaginative", "dark humor", "quirky", "empowering"],
    preferredThemes: ["imagination", "empowerment", "quirky adventures", "outsmarting adults"],
    styleSummary: "Imaginative voice with dark humor and quirky characters. Celebrates uniqueness and empowers children through fantastical, slightly subversive adventures.",
    sampleMicroLines: [
      "But then, something absolutely extraordinary happened!",
      "The most wonderfully wicked idea popped into {userName}'s head!",
      "Little did they know that {userName} was planning something spectacular!",
      "It was the most splendidly ridiculous day anyone could imagine."
    ]
  },

  navyblue: {
    name: "Navy Blue Voice",
    description: "Sophisticated storytelling with mystery, adventure, and deeper themes suitable for older children.",
    ageRange: "9-12",
    patterns: {
      openings: [
        "{userName} stood at the edge of the great mystery, wondering what lay ahead.",
        "The ancient map revealed secrets that {userName} never expected to discover.",
        "It was the kind of adventure that changes everything you thought you knew.",
        "{userName} had always felt different, but today {pronoun} would understand why.",
        "The storm clouds gathered as {userName} realized the truth about the legend.",
        "In the depths of the old library, {userName} found more than just books.",
        "Sometimes the greatest adventures begin with the smallest clues.",
        "{userName} never imagined that one decision would alter the course of history."
      ],
      transitions: [
        "But the mystery deepened with each discovery.",
        "As the pieces fell into place, {userName} began to understand.",
        "The ancient wisdom revealed itself slowly, deliberately.",
        "Each challenge tested not just {userName}'s courage, but {pronoun} character.",
        "The path forward demanded both intelligence and bravery.",
        "What seemed impossible began to make perfect sense.",
        "The legendary powers awakened within {userName} at last.",
        "Time was running out, but {userName} had learned enough to act."
      ],
      closings: [
        "And {userName} emerged forever changed by the wisdom gained.",
        "The mystery was solved, but greater adventures awaited.",
        "With newfound understanding, {userName} stepped confidently into the future.",
        "The legend would live on, carried forward by {userName}'s courage."
      ],
      plotTwists: [
        "The enemy revealed themselves to be an unexpected ally!",
        "The ancient prophecy had been misunderstood all along!",
        "The greatest power was hidden within {userName} from the beginning!"
      ],
      continuations: [
        "Greater mysteries call to {userName}...",
        "The adventure has only just begun...",
        "New legends await their champion..."
      ],
      pauses: [
        "Consider the weight of this moment...",
        "Let the ancient wisdom settle in your mind...",
        "Feel the power of understanding growing..."
      ],
      hooks: [
        "An ancient symbol glows in the darkness...",
        "Whispers of forgotten knowledge reach {userName}...",
        "The very air thrums with mystical energy..."
      ]
    },
    characteristics: ["mysterious", "adventurous", "sophisticated", "legendary"],
    preferredThemes: ["mystery", "adventure", "ancient wisdom", "personal growth"],
    styleSummary: "Sophisticated voice with mystery and adventure themes. Features deeper storytelling, ancient wisdom, and character development suitable for older children.",
    sampleMicroLines: [
      "But the mystery deepened with each discovery.",
      "The ancient wisdom revealed itself slowly, deliberately.",
      "Time was running out, but {userName} had learned enough to act.",
      "With newfound understanding, {userName} stepped confidently into the future."
    ]
  },

  copper: {
    name: "Copper Voice",
    description: "Warm, craftsman-like stories focusing on creation, skill development, and mastery through practice.",
    ageRange: "9-12",
    patterns: {
      openings: [
        "{userName} had been practicing for months, but today would be the real test.",
        "The workshop was filled with tools and dreams, waiting for {userName} to begin.",
        "Every master craftsperson started exactly where {userName} stood now.",
        "The art had been passed down through generations, and now it came to {userName}.",
        "In {pronoun} hands, raw materials would become something extraordinary.",
        "The old master watched as {userName} approached the workbench with determination.",
        "Today, {userName} would learn that true skill comes from the heart, not just the hands.",
        "The project seemed impossible, but {userName} had been preparing for this moment."
      ],
      transitions: [
        "But then {userName} remembered the master's most important lesson.",
        "The work required patience, precision, and something more—passion.",
        "Each mistake became a stepping stone toward mastery.",
        "The ancient techniques revealed their secrets to {userName} slowly.",
        "With careful attention, {userName} began to see the patterns emerge.",
        "The tools seemed to respond to {userName}'s growing confidence.",
        "What had seemed complex became elegantly simple.",
        "The rhythm of creation flowed through {userName}'s work."
      ],
      closings: [
        "And {userName} stepped back to admire not just the creation, but the creator {pronoun} had become.",
        "The masterpiece was complete, but {userName}'s journey as a craftsperson had just begun.",
        "With skilled hands and a proud heart, {userName} knew this was only the beginning.",
        "The tradition lived on, now carried forward by {userName}'s capable hands."
      ],
      plotTwists: [
        "The 'mistake' revealed a better way to solve the problem!",
        "The old master had been secretly learning from {userName} too!",
        "The creation exceeded even {userName}'s wildest dreams!"
      ],
      continuations: [
        "New projects call to the skilled craftsperson...",
        "The workshop holds more secrets to discover...",
        "Greater challenges await the dedicated artisan..."
      ],
      pauses: [
        "Feel the satisfaction of work well done...",
        "Appreciate the beauty of skilled hands at work...",
        "Notice how practice transforms into artistry..."
      ],
      hooks: [
        "The workshop door creaks open to new possibilities...",
        "An unfamiliar tool catches {userName}'s eye...",
        "The scent of sawdust and dreams fills the air..."
      ]
    },
    characteristics: ["craftsmanship", "skill development", "patience", "mastery"],
    preferredThemes: ["learning", "creation", "tradition", "skill mastery"],
    styleSummary: "Warm, craftsman-focused voice emphasizing skill development and creation. Celebrates the journey from novice to master through dedication and practice.",
    sampleMicroLines: [
      "The work required patience, precision, and something more—passion.",
      "Each mistake became a stepping stone toward mastery.",
      "The rhythm of creation flowed through {userName}'s work.",
      "With skilled hands and a proud heart, {userName} knew this was only the beginning."
    ]
  },

  slategray: {
    name: "Slate Gray Voice",
    description: "Thoughtful, introspective stories exploring complex emotions, relationships, and moral dilemmas.",
    ageRange: "10-12",
    patterns: {
      openings: [
        "{userName} stared out the window, wrestling with thoughts too big for words.",
        "Some decisions change everything, and {userName} was about to make one.",
        "The question had been bothering {userName} for weeks: what was the right thing to do?",
        "It wasn't the kind of problem that had easy answers, but {userName} had to try.",
        "In the quiet moments between day and night, {userName} found clarity at last.",
        "The conversation with {friend} had left {userName} with more questions than answers.",
        "Growing up meant facing the kinds of choices {userName} used to avoid.",
        "Sometimes understanding yourself is the hardest journey of all."
      ],
      transitions: [
        "But as {userName} thought deeper, the picture became clearer.",
        "The weight of the decision pressed down, but so did the wisdom to handle it.",
        "Slowly, the complex emotions began to sort themselves out.",
        "What {friend} had said suddenly made perfect sense.",
        "The courage to act came from an unexpected place within {userName}.",
        "Sometimes the most difficult path is also the most necessary one.",
        "The truth, when it finally came, was both simple and profound.",
        "In that moment of understanding, everything changed for {userName}."
      ],
      closings: [
        "And {userName} discovered that growing up meant making peace with uncertainty.",
        "The question was answered, but {userName} knew there would be many more to come.",
        "With a deeper understanding of {pronoun}self, {userName} faced the future with quiet confidence.",
        "Some lessons can only be learned by living through them, and {userName} had learned well."
      ],
      plotTwists: [
        "The person {userName} trusted most had been wrong all along!",
        "The problem solved itself when {userName} stopped trying to control it!",
        "The answer was found in the last place {userName} expected to look!"
      ],
      continuations: [
        "New questions emerge as {userName} grows wiser...",
        "The journey of self-discovery continues...",
        "Greater understanding brings greater responsibility..."
      ],
      pauses: [
        "Take time to sit with these complex feelings...",
        "Consider all the perspectives in this situation...",
        "Feel the weight and wisdom of growing up..."
      ],
      hooks: [
        "A memory surfaces that changes everything...",
        "The phone call {userName} has been dreading arrives...",
        "A moment of silence reveals the truth..."
      ]
    },
    characteristics: ["introspective", "complex emotions", "moral depth", "thoughtful"],
    preferredThemes: ["self-discovery", "moral dilemmas", "relationships", "emotional growth"],
    styleSummary: "Thoughtful, introspective voice exploring complex emotions and moral questions. Suitable for older children navigating the challenges of growing up and understanding themselves.",
    sampleMicroLines: [
      "But as {userName} thought deeper, the picture became clearer.",
      "Sometimes the most difficult path is also the most necessary one.",
      "In that moment of understanding, everything changed for {userName}.",
      "Some lessons can only be learned by living through them, and {userName} had learned well."
    ]
  },

  teal: {
    name: "Teal Voice",
    description: "Environmentally conscious stories blending science, nature, and social responsibility for mature young readers.",
    ageRange: "10-12",
    patterns: {
      openings: [
        "{userName} had always felt connected to the natural world, but today that connection became a calling.",
        "The environmental data was clear, and it was up to {userName}'s generation to act.",
        "In the forest, {userName} discovered that every living thing was part of a vast, interconnected system.",
        "The scientists had been right all along, and now {userName} understood what needed to be done.",
        "Standing by the polluted river, {userName} made a promise that would change everything.",
        "The future of the planet rested in the hands of young people like {userName}.",
        "What started as a school project became {userName}'s mission to heal the world.",
        "The climate crisis wasn't just news anymore—it was {userName}'s reality to face."
      ],
      transitions: [
        "But {userName} knew that individual action must become collective movement.",
        "The solution required both scientific understanding and community cooperation.",
        "As {userName} learned more, the urgency of the situation became crystal clear.",
        "The old ways of thinking had failed; it was time for {userName}'s generation to lead.",
        "Each small action rippled outward, creating waves of positive change.",
        "The research revealed both the problem and the path forward.",
        "With determination and scientific knowledge, {userName} began to make a difference.",
        "The planet's future depended on choices being made right now."
      ],
      closings: [
        "And {userName} realized that protecting the earth was not just a responsibility, but a privilege.",
        "The work was far from over, but {userName} now knew that change was possible.",
        "With science as a guide and passion as fuel, {userName} stepped boldly into environmental leadership.",
        "The planet had found another guardian in {userName}, and hope grew a little stronger."
      ],
      plotTwists: [
        "The solution was hiding in nature's own design all along!",
        "The adults finally started listening to {userName}'s generation!",
        "The small local action sparked a global movement!"
      ],
      continuations: [
        "The environmental work expands to new challenges...",
        "More young activists join {userName}'s cause...",
        "The next generation of earth guardians emerges..."
      ],
      pauses: [
        "Listen to what the earth is telling us...",
        "Feel your connection to all living things...",
        "Consider your role as a planetary steward..."
      ],
      hooks: [
        "The morning news brings urgent environmental data...",
        "A dying tree whispers its secrets to {userName}...",
        "The research results arrive with shocking implications..."
      ]
    },
    characteristics: ["environmental consciousness", "scientific thinking", "social responsibility", "future-focused"],
    preferredThemes: ["environmentalism", "science", "social justice", "global citizenship"],
    styleSummary: "Environmentally conscious voice blending science education with social responsibility. Empowers older children to become environmental stewards and global citizens.",
    sampleMicroLines: [
      "But {userName} knew that individual action must become collective movement.",
      "Each small action rippled outward, creating waves of positive change.",
      "The planet's future depended on choices being made right now.",
      "With science as a guide and passion as fuel, {userName} stepped boldly into environmental leadership."
    ]
  }
};

export interface AuthorVoiceBundle {
  voice: ColorVoice;
  selectedPatterns: {
    opening: string;
    transitions: string[];
    closing: string;
  };
  characteristics: string[];
  themeAlignment: string[];
}

export class AuthorVoiceService {
  /**
   * Select author voice based on user's favorite color and difficulty
   */
  static selectVoiceForUser(favoriteColor: string, difficulty: DifficultyLevel = 'easy'): ColorVoice {
    // Convert hex colors to color names if needed
    const colorName = this.normalizeColorName(favoriteColor);
    
    // Age-appropriate fallback logic
    const ageGroup = this.getAgeGroupFromDifficulty(difficulty);
    
    // Primary selection by color
    if (COLOR_VOICES[colorName]) {
      const voice = COLOR_VOICES[colorName];
      if (this.isAgeAppropriate(voice, ageGroup)) {
        return voice;
      }
    }
    
    // Fallback to age-appropriate voice
    return this.getAgeAppropriateVoice(ageGroup);
  }

  /**
   * Bundle voice with specific patterns for story generation
   */
  static createVoiceBundle(favoriteColor: string, difficulty: DifficultyLevel): AuthorVoiceBundle {
    const voice = this.selectVoiceForUser(favoriteColor, difficulty);
    
    // Select specific patterns (random selection for variety)
    const opening = this.selectRandomPattern(voice.patterns.openings);
    const transitions = this.selectRandomPatterns(voice.patterns.transitions, 3);
    const closing = this.selectRandomPattern(voice.patterns.closings);
    
    return {
      voice,
      selectedPatterns: {
        opening,
        transitions,
        closing
      },
      characteristics: voice.characteristics,
      themeAlignment: voice.preferredThemes || []
    };
  }

  /**
   * Resolve placeholders in voice patterns
   */
  static resolvePlaceholders(text: string, userInfo: any = {}): string {
    return text
      .replace(/\{userName\}/g, userInfo.name || 'the child')
      .replace(/\{pronoun\}/g, this.derivePronoun(userInfo))
      .replace(/\{friend\}/g, userInfo.favoriteAnimal || 'friend')
      .replace(/\{animal\}/g, userInfo.favoriteAnimal || 'cat')
      .replace(/\{food\}/g, userInfo.favoriteFood || 'cookies')
      .replace(/\{color\}/g, userInfo.favoriteColor || 'blue')
      .replace(/\{adjective\}/g, 'wonderful')
      .replace(/\{object\}/g, 'treasure');
  }

  private static normalizeColorName(color: string): string {
    if (!color) return 'blue';
    
    // Handle hex colors
    const hexToColorMap: Record<string, string> = {
      '#EF4444': 'red',
      '#F59E0B': 'yellow', 
      '#10B981': 'green',
      '#8B5CF6': 'purple',
      '#F97316': 'orange',
      '#EC4899': 'pink',
      '#3B82F6': 'blue'
    };
    
    if (color.startsWith('#')) {
      return hexToColorMap[color] || 'blue';
    }
    
    return color.toLowerCase();
  }

  private static getAgeGroupFromDifficulty(difficulty: DifficultyLevel): string {
    const difficultyAgeMap = {
      'beginner': '3-5',
      'easy': '5-7', 
      'medium': '7-9',
      'hard': '9-12',
      'expert': '10-12'
    };
    return difficultyAgeMap[difficulty] || '5-7';
  }

  private static isAgeAppropriate(voice: ColorVoice, targetAgeGroup: string): boolean {
    return voice.ageRange === targetAgeGroup;
  }

  private static getAgeAppropriateVoice(ageGroup: string): ColorVoice {
    const ageVoiceMap = {
      '3-5': COLOR_VOICES.red,
      '5-7': COLOR_VOICES.green,
      '7-9': COLOR_VOICES.orange,
      '9-12': COLOR_VOICES.navyblue,
      '10-12': COLOR_VOICES.teal
    };
    return ageVoiceMap[ageGroup] || COLOR_VOICES.green;
  }

  private static selectRandomPattern(patterns: string[]): string {
    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  private static selectRandomPatterns(patterns: string[], count: number): string[] {
    const shuffled = [...patterns].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  private static derivePronoun(userInfo: any = {}): string {
    const avatarType = userInfo.avatar?.type;
    if (avatarType === 'girl') return 'she';
    if (avatarType === 'boy') return 'he';
    return 'they';
  }
}