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
      'hard': '7-9',
      'expert': '7-9'
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
      '7-9': COLOR_VOICES.orange
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

export { COLOR_VOICES };