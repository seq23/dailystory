import { DifficultyLevel, UserInfo } from '../types';

// Story Arc Management (consolidated from storyArcManager)
interface StoryArc {
  setup: string[];
  development: string[];
  resolution: string[];
}

// Story Transition Management (consolidated from storyTransitionManager)
export interface TransitionConfig {
  fromPages: number;
  toPages: number;
  fromDifficulty?: DifficultyLevel;
  toDifficulty?: DifficultyLevel;
  isPremium: boolean;
}

export interface TransitionMessage {
  title: string;
  message: string;
  encouragement: string;
  continueText: string;
}

export class StoryManager {
  // Story Arc Management Methods
  static getTemplateByPosition(userInfo: UserInfo, difficulty: DifficultyLevel, pageIndex: number, totalPages: number): string {
    const position = this.getStoryPosition(pageIndex, totalPages);
    const arcTemplates = this.getArcTemplates(difficulty);
    const templates = arcTemplates[position];
    
    if (!templates || templates.length === 0) {
      return "Continue your amazing adventure, {name}! What happens next in your story?";
    }
    
    const template = templates[Math.floor(Math.random() * templates.length)];
    return this.processTemplate(template, userInfo, difficulty);
  }

  private static getStoryPosition(pageIndex: number, totalPages: number): keyof StoryArc {
    const progress = pageIndex / totalPages;
    
    if (progress < 0.3) return 'setup';
    if (progress < 0.8) return 'development';
    return 'resolution';
  }

  private static getArcTemplates(difficulty: DifficultyLevel): StoryArc {
    const templates = {
      easy: {
        setup: [
          "Hello {name}! Today you will go on a fun adventure. You love {favoriteActivity} and your best friend is {bestFriend}.",
          "Once upon a time, there was a {age}-year-old named {name}. {name} lived in a {setting} and loved to {favoriteActivity}.",
          "Meet {name}! {name} is {age} years old and has a special friend named {bestFriend}. Today they will discover something amazing!"
        ],
        development: [
          "{name} and {bestFriend} found something wonderful! They decided to {favoriteActivity} together.",
          "As {name} explored the {setting}, something magical happened. {bestFriend} was there to help!",
          "The adventure continues! {name} learned something new about {favoriteActivity} with {bestFriend}."
        ],
        resolution: [
          "{name} felt so happy! The adventure with {bestFriend} was the best day ever. They can't wait for tomorrow!",
          "At the end of the day, {name} hugged {bestFriend}. They had learned so much about {favoriteActivity}!",
          "{name} smiled big. Today's adventure in the {setting} with {bestFriend} was perfect!"
        ]
      },
      medium: {
        setup: [
          "{name}, who is {age} years old, discovered an unusual opportunity in their {setting}. With {bestFriend} by their side, they felt ready for anything.",
          "The story begins when {name} noticed something different about their favorite place for {favoriteActivity}. {bestFriend} was curious too.",
          "Every {age}-year-old has dreams, but {name}'s dream was special. In the {setting}, with {bestFriend}, the adventure was about to begin."
        ],
        development: [
          "As {name} and {bestFriend} investigated further, they realized this wasn't an ordinary day. Their skills in {favoriteActivity} would be important.",
          "The challenge grew bigger, but {name} remembered what they learned about {favoriteActivity}. {bestFriend} offered encouragement.",
          "Working together, {name} and {bestFriend} faced the obstacles. The {setting} held more secrets than they imagined."
        ],
        resolution: [
          "Through teamwork and persistence, {name} and {bestFriend} achieved something remarkable. Their {favoriteActivity} skills had saved the day!",
          "As the sun set over the {setting}, {name} reflected on the lessons learned. {bestFriend} had been the perfect companion.",
          "The adventure concluded with {name} feeling proud and confident. Tomorrow would bring new opportunities for {favoriteActivity}."
        ]
      },
      hard: {
        setup: [
          "At {age} years old, {name} possessed an unusual talent for {favoriteActivity} that set them apart in their {setting}. When {bestFriend} presented an intriguing challenge, everything changed.",
          "The morning mist lifted from the {setting} as {name} contemplated the decision ahead. {bestFriend}'s proposal about {favoriteActivity} would require courage.",
          "In a world where {favoriteActivity} held special significance, {name} stood at a crossroads. The {setting} whispered of ancient secrets, and {bestFriend} held the key."
        ],
        development: [
          "As the quest intensified, {name} discovered that their {favoriteActivity} abilities were connected to something much larger. {bestFriend} revealed unexpected knowledge about the {setting}.",
          "The obstacles multiplied, testing not only {name}'s {favoriteActivity} skills but also their friendship with {bestFriend}. The {setting} itself seemed to respond to their efforts.",
          "Each breakthrough brought new understanding. {name} and {bestFriend} realized that {favoriteActivity} was more than just a hobby—it was their destiny in this {setting}."
        ],
        resolution: [
          "The transformation was complete. {name} had not only mastered {favoriteActivity} but had also discovered their true purpose. {bestFriend} stood as a loyal ally, and the {setting} was forever changed.",
          "In the aftermath of their journey, {name} understood that growth comes through challenge. {bestFriend} had been both teacher and student, and {favoriteActivity} had been their shared language.",
          "As the story concluded, {name} looked toward new horizons. The skills gained through {favoriteActivity} and the bond with {bestFriend} would guide future adventures beyond this {setting}."
        ]
      },
      expert: {
        setup: [
          "The sophisticated narrative of {name}, now {age}, begins in a {setting} where {favoriteActivity} serves as both passion and metaphor for life's deeper complexities. {bestFriend} emerges as a catalyst for profound transformation.",
          "Within the intricate landscape of the {setting}, {name} navigates the delicate balance between mastery and discovery in {favoriteActivity}. {bestFriend}'s presence introduces philosophical dimensions to their journey.",
          "As dawn breaks over the {setting}, {name} contemplates the relationship between {favoriteActivity} and existence itself. {bestFriend} represents both challenge and companionship in this introspective odyssey."
        ],
        development: [
          "The narrative deepens as {name} encounters increasingly complex scenarios that demand not just proficiency in {favoriteActivity}, but wisdom and emotional intelligence. {bestFriend} serves as both mirror and guide through the {setting}'s mysteries.",
          "Through a series of interconnected events, {name} begins to understand that {favoriteActivity} is a lens through which all of life's lessons can be examined. {bestFriend} and the {setting} become integral parts of this realization.",
          "The journey transcends the physical realm as {name} grapples with abstract concepts made tangible through {favoriteActivity}. {bestFriend} provides perspective that illuminates the deeper meanings within their {setting}."
        ],
        resolution: [
          "The conclusion reveals that {name}'s mastery of {favoriteActivity} was merely the beginning of a lifelong pursuit of understanding. {bestFriend} remains a cherished companion, and the {setting} continues to offer infinite possibilities for growth.",
          "As the narrative arc completes, {name} recognizes that every ending is also a beginning. The relationship with {bestFriend} and the {favoriteActivity} they shared within this {setting} has prepared them for whatever lies ahead.",
          "The story's end finds {name} fundamentally changed yet authentically themselves. {favoriteActivity} has become a philosophy, {bestFriend} a treasured co-traveler, and the {setting} a sacred space of transformation."
        ]
      }
    };

    return templates[difficulty] || templates.easy;
  }

  static processTemplate(template: string, userInfo: UserInfo, difficulty: DifficultyLevel): string {
    let processed = template;
    
    // Replace user info placeholders
    processed = processed.replace(/{name}/g, userInfo.name);
    processed = processed.replace(/{age}/g, userInfo.age.toString());
    processed = processed.replace(/{favoriteActivity}/g, userInfo.hobbies || 'playing');
    processed = processed.replace(/{bestFriend}/g, userInfo.favoriteAnimal || 'friend');
    processed = processed.replace(/{setting}/g, 'magical place');
    
    return processed;
  }

  // Story Transition Management Methods
  static generateTransitionMessage(config: TransitionConfig): TransitionMessage {
    if (config.fromDifficulty && config.toDifficulty && config.fromDifficulty !== config.toDifficulty) {
      return this.generateDifficultyTransition(config);
    } else {
      return this.generatePageTransition(config);
    }
  }

  private static generateDifficultyTransition(config: TransitionConfig): TransitionMessage {
    const { fromDifficulty, toDifficulty, isPremium } = config;
    
    const transitions = {
      'easy-medium': {
        title: '🌟 Amazing Progress!',
        message: `Wow! You're reading so well that your story is getting more exciting with new words and adventures!`,
        encouragement: 'You\'re becoming a stronger reader! Let\'s discover what happens next.',
        continueText: isPremium ? 'Continue the Adventure!' : 'Continue Reading!'
      },
      'medium-hard': {
        title: '🚀 Fantastic Growth!',
        message: `Incredible! Your reading skills are soaring! Your story is evolving with more complex adventures and deeper friendships.`,
        encouragement: 'You\'re ready for bigger challenges and richer stories!',
        continueText: isPremium ? 'Unlock New Adventures!' : 'Keep Growing!'
      },
      'hard-expert': {
        title: '🏆 Exceptional Mastery!',
        message: `Outstanding! You've become such a skilled reader that your story is transforming into an epic tale with profound themes and complex characters.`,
        encouragement: 'You\'re ready to explore the most sophisticated stories and ideas!',
        continueText: isPremium ? 'Begin the Epic!' : 'Master the Story!'
      }
    };

    const key = `${fromDifficulty}-${toDifficulty}` as keyof typeof transitions;
    return transitions[key] || transitions['easy-medium'];
  }

  private static generatePageTransition(config: TransitionConfig): TransitionMessage {
    const { fromPages, toPages, isPremium } = config;
    
    if (isPremium) {
      return {
        title: '📚 Story Expanding!',
        message: `Your adventure is growing! From ${fromPages} pages to ${toPages} pages of magical storytelling.`,
        encouragement: 'With premium AI magic, your story becomes richer and more personalized with each page!',
        continueText: 'Continue the Magic!'
      };
    } else {
      return {
        title: '📖 Story Growing!',
        message: `Fantastic reading! Your story is expanding from ${fromPages} to ${toPages} pages of adventure.`,
        encouragement: 'You\'re doing amazing! Let\'s see what exciting new pages await.',
        continueText: 'Keep Reading!'
      };
    }
  }

  static shouldShowTransition(
    currentPages: number, 
    newPages: number, 
    currentDifficulty: DifficultyLevel, 
    newDifficulty: DifficultyLevel
  ): boolean {
    // Show transition if pages increase significantly or difficulty changes
    const significantPageIncrease = newPages > currentPages && (newPages - currentPages) >= 5;
    const difficultyChange = currentDifficulty !== newDifficulty;
    
    return significantPageIncrease || difficultyChange;
  }

  static getTransitionPageContent(config: TransitionConfig): string {
    const message = this.generateTransitionMessage(config);
    
    return `
🌟 **${message.title}** 🌟

${message.message}

${message.encouragement}

---

*${message.continueText}*
    `.trim();
  }

  static getDifficultyProgression(): { [key in DifficultyLevel]: DifficultyLevel | null } {
    return {
      'easy': 'medium',
      'medium': 'hard', 
      'hard': 'expert',
      'expert': null // No progression beyond expert
    };
  }

  static shouldProgressDifficulty(
    currentDifficulty: DifficultyLevel,
    pagesRead: number,
    readingAccuracy: number,
    timeSpent: number
  ): boolean {
    const progression = this.getDifficultyProgression();
    const nextLevel = progression[currentDifficulty];
    
    if (!nextLevel) return false; // Already at highest level
    
    // Progression criteria based on difficulty
    const criteria = {
      'easy': {
        minPages: 15,
        minAccuracy: 0.85,
        minTimeMinutes: 8
      },
      'medium': {
        minPages: 25,
        minAccuracy: 0.80,
        minTimeMinutes: 12
      },
      'hard': {
        minPages: 35,
        minAccuracy: 0.75,
        minTimeMinutes: 18
      }
    };

    const current = criteria[currentDifficulty as keyof typeof criteria];
    if (!current) return false;

    const timeMinutes = timeSpent / (1000 * 60);
    
    return (
      pagesRead >= current.minPages &&
      readingAccuracy >= current.minAccuracy &&
      timeMinutes >= current.minTimeMinutes
    );
  }

  static getPageProgression(currentPages: number, difficulty: DifficultyLevel, isPremium: boolean): number {
    const baseProgression = {
      'easy': [5, 10, 15, 20],
      'medium': [8, 15, 25, 30],
      'hard': [10, 20, 30, 40],
      'expert': [12, 25, 40, 50]
    };

    const progression = baseProgression[difficulty];
    const currentIndex = progression.findIndex(pages => pages >= currentPages);
    
    if (currentIndex === -1 || currentIndex === progression.length - 1) {
      // Already at max for this difficulty
      return currentPages;
    }
    
    const nextPages = progression[currentIndex + 1];
    
    // Premium users get more pages
    if (isPremium) {
      return Math.min(nextPages * 1.5, 60); // Cap at 60 pages for premium
    }
    
    return nextPages;
  }

  static generateCelebrationMessage(achievement: string): string {
    const celebrations = [
      `🎉 Congratulations! You've ${achievement}! Your reading journey is truly inspiring.`,
      `🌟 Amazing work! ${achievement}! You're becoming such a strong reader.`,
      `🏆 Fantastic! You've ${achievement}! Keep up the incredible progress.`,
      `🚀 Wonderful! ${achievement}! Your dedication to reading is paying off.`,
      `💫 Brilliant! You've ${achievement}! Every page makes you a better reader.`
    ];
    
    return celebrations[Math.floor(Math.random() * celebrations.length)];
  }
}