import { UserInfo, DifficultyLevel } from '../types';
import { Character, CharacterPool, CharacterPoolManager } from './characterPoolManager';

export interface StoryArcTemplate {
  setup: string[];
  development: string[];
  climax: string[];
  resolution: string[];
}

export interface StoryContext {
  currentPage: number;
  totalPages: number;
  characters: CharacterPool;
  userInfo: UserInfo;
  difficulty: DifficultyLevel;
  storyTheme?: string;
  currentConflict?: string;
}

export class CharacterDrivenStoryArc {
  private static storyThemes = {
    easy: [
      'friendship and kindness',
      'helping others',
      'learning new things',
      'family adventures',
      'animal friends'
    ],
    medium: [
      'overcoming fears',
      'teamwork and cooperation',
      'solving mysteries',
      'protecting nature',
      'discovering talents'
    ],
    hard: [
      'standing up for what is right',
      'understanding differences',
      'leadership and responsibility',
      'creative problem solving',
      'building community'
    ],
    expert: [
      'moral dilemmas and choices',
      'complex relationships',
      'philosophical questions',
      'social justice themes',
      'personal transformation'
    ]
  };

  static generateStoryArc(context: StoryContext): StoryArcTemplate {
    const theme = this.selectStoryTheme(context.difficulty, context.userInfo);
    const conflict = this.generateConflict(context.difficulty, context.characters, theme);
    
    return {
      setup: this.generateSetupPages(context, theme),
      development: this.generateDevelopmentPages(context, theme, conflict),
      climax: this.generateClimaxPages(context, theme, conflict),
      resolution: this.generateResolutionPages(context, theme)
    };
  }

  static getPageContent(context: StoryContext, enhancedVariables?: any): string {
    const storyArc = this.generateStoryArc(context);
    const position = this.determineStoryPosition(context.currentPage, context.totalPages);
    
    const templates = storyArc[position];
    const templateIndex = this.getTemplateIndex(context.currentPage, templates.length, position);
    
    return this.processTemplate(templates[templateIndex], context, enhancedVariables);
  }

  private static selectStoryTheme(difficulty: DifficultyLevel, userInfo: UserInfo): string {
    const themes = this.storyThemes[difficulty];
    
    // Select theme based on user interests
    const interests = userInfo.hobbies.toLowerCase();
    if (interests.includes('animal') && themes.includes('animal friends')) {
      return 'animal friends';
    }
    if (interests.includes('family') && themes.includes('family adventures')) {
      return 'family adventures';
    }
    if (interests.includes('mystery') && themes.includes('solving mysteries')) {
      return 'solving mysteries';
    }
    
    // Default to random theme
    return themes[Math.floor(Math.random() * themes.length)];
  }

  private static generateConflict(difficulty: DifficultyLevel, characters: CharacterPool, theme: string): string {
    const conflicts = {
      easy: [
        `${characters.main.name} loses something important`,
        `${characters.animals[0]?.name || 'a pet'} goes missing`,
        `${characters.main.name} wants to help someone`,
        `${characters.main.name} faces a small challenge`
      ],
      medium: [
        `${characters.main.name} must solve a problem to help ${characters.friends[0]?.name || 'a friend'}`,
        `${characters.animals[0]?.name || 'the animal companion'} is in trouble`,
        `${characters.main.name} discovers something mysterious`,
        `${characters.family[0]?.name || 'family'} needs ${characters.main.name}'s help`
      ],
      hard: [
        `${characters.main.name} must choose between two important things`,
        `${characters.friends[0]?.name || 'a friend'} and ${characters.main.name} disagree`,
        `${characters.main.name} faces a fear to protect others`,
        `The community needs ${characters.main.name}'s unique skills`
      ],
      expert: [
        `${characters.main.name} must understand ${characters.antagonists[0]?.name || "someone difficult"}`,
        `${characters.main.name} faces a moral dilemma about ${theme}`,
        `${characters.main.name} must bring together different groups`,
        `${characters.main.name} discovers the truth about something important`
      ]
    };

    const difficultyConflicts = conflicts[difficulty];
    return difficultyConflicts[Math.floor(Math.random() * difficultyConflicts.length)];
  }

  private static generateSetupPages(context: StoryContext, theme: string): string[] {
    const { characters, userInfo } = context;
    
    return [
      `Meet ${characters.main.name}, ${characters.main.backstory} ${characters.main.name} loves spending time with ${characters.family[0]?.name || 'family'} and ${characters.animals[0]?.name || 'pets'}.`,
      
      `${characters.main.name} lives in a wonderful place where ${this.getSettingDescription(context.difficulty)}. Every day brings new adventures with ${characters.friends[0]?.name || 'friends'}.`,
      
      `One sunny morning, ${characters.main.name} was ${this.getActivityDescription(userInfo)} when something interesting happened. ${characters.animals[0]?.name || 'A friendly animal'} ${characters.animals[0]?.catchphrase || 'came to visit'}.`,
      
      `"${characters.main.catchphrase}" said ${characters.main.name}. Today would be special because ${this.getSetupHook(context.difficulty, theme)}.`
    ];
  }

  private static generateDevelopmentPages(context: StoryContext, theme: string, conflict: string): string[] {
    const { characters } = context;
    
    return [
      `${characters.main.name} noticed that ${conflict}. ${characters.friends[0]?.name || 'A friend'} said, "We should help!"`,
      
      `Together, ${characters.main.name} and ${characters.friends[0]?.name || 'their friend'} began to ${this.getActionForTheme(theme, context.difficulty)}. ${characters.animals[0]?.name || 'Their animal friend'} wanted to help too.`,
      
      `${characters.family[0]?.name || 'Family'} gave ${characters.main.name} good advice: "${this.getWisdomForTheme(theme, context.difficulty)}" This made ${characters.main.name} feel more confident.`,
      
      `As they worked together, ${characters.main.name} learned that ${this.getLessonForTheme(theme, context.difficulty)}. ${characters.helpers[0]?.name || 'A helpful person'} appeared just when they needed guidance.`
    ];
  }

  private static generateClimaxPages(context: StoryContext, theme: string, conflict: string): string[] {
    const { characters } = context;
    
    return [
      `The moment had come! ${characters.main.name} needed to use ${this.getSkillForClimaxByDifficulty(context.difficulty)} to solve the problem. ${characters.friends[0]?.name || 'Their friend'} believed in them.`,
      
      `With ${characters.animals[0]?.name || 'their animal companion'} by their side, ${characters.main.name} ${this.getClimaxActionByDifficulty(context.difficulty, theme)}. Everyone watched hopefully.`,
      
      `"${this.getEncouragementByDifficulty(context.difficulty)}" called out ${characters.family[0]?.name || 'family'}. ${characters.main.name} took a deep breath and ${this.getClimaxResolutionByDifficulty(context.difficulty)}.`
    ];
  }

  private static generateResolutionPages(context: StoryContext, theme: string): string[] {
    const { characters } = context;
    
    return [
      `${characters.main.name} did it! ${this.getSuccessOutcomeByDifficulty(context.difficulty, theme)} Everyone was so proud and happy.`,
      
      `${characters.friends[0]?.name || 'Their friends'} and ${characters.family[0]?.name || 'family'} celebrated together. ${characters.animals[0]?.name || 'Their animal friend'} ${characters.animals[0]?.catchphrase || 'was very happy'}.`,
      
      `From that day on, ${characters.main.name} knew that ${this.getLifeLessonByDifficulty(context.difficulty, theme)}. The adventure had taught everyone something special.`,
      
      `As the sun set, ${characters.main.name} smiled and said, "${characters.main.catchphrase}" Tomorrow would bring new adventures, but for now, ${this.getEndingByDifficulty(context.difficulty)}.`
    ];
  }

  private static determineStoryPosition(currentPage: number, totalPages: number): keyof StoryArcTemplate {
    const setupEnd = Math.ceil(totalPages * 0.25);
    const developmentEnd = Math.ceil(totalPages * 0.65);
    const climaxEnd = Math.ceil(totalPages * 0.85);
    
    if (currentPage <= setupEnd) return 'setup';
    if (currentPage <= developmentEnd) return 'development';
    if (currentPage <= climaxEnd) return 'climax';
    return 'resolution';
  }

  private static getTemplateIndex(currentPage: number, templatesLength: number, position: keyof StoryArcTemplate): number {
    if (position === 'setup') {
      return Math.min(currentPage - 1, templatesLength - 1);
    }
    // For other positions, cycle through available templates
    return (currentPage - 1) % templatesLength;
  }

  private static processTemplate(template: string, context: StoryContext, enhancedVariables?: any): string {
    let processed = template;
    
    // Replace character placeholders
    processed = processed.replace(/\{main\}/g, context.characters.main.name);
    processed = processed.replace(/\{family\}/g, context.characters.family[0]?.name || 'family');
    processed = processed.replace(/\{friend\}/g, context.characters.friends[0]?.name || 'friend');
    processed = processed.replace(/\{animal\}/g, context.characters.animals[0]?.name || 'animal friend');
    processed = processed.replace(/\{helper\}/g, context.characters.helpers[0]?.name || 'helper');
    
    // Replace user info placeholders (basic)
    processed = processed.replace(/\{favoriteAnimal\}/g, context.userInfo.favoriteAnimal);
    processed = processed.replace(/\{favoriteColor\}/g, context.userInfo.favoriteColor);
    processed = processed.replace(/\{favoriteFood\}/g, context.userInfo.favoriteFood);
    processed = processed.replace(/\{hobbies\}/g, context.userInfo.hobbies);
    
    // Apply enhanced vocabulary variables if available
    if (enhancedVariables) {
      Object.entries(enhancedVariables).forEach(([key, value]) => {
        if (typeof value === 'string' && key !== 'name') {
          const regex = new RegExp(`\\{${key}\\}`, 'g');
          processed = processed.replace(regex, value);
        }
      });
      
      console.log(`🔧 Applied enhanced vocabulary variables to template:`, Object.keys(enhancedVariables));
    }
    
    return processed;
  }

  // Helper methods for generating difficulty-appropriate content
  private static getSettingDescription(difficulty: DifficultyLevel): string {
    const settings = {
      easy: ['children play and laugh', 'animals are friendly', 'flowers bloom everywhere'],
      medium: ['adventures wait around every corner', 'mysteries hide in quiet places', 'magic sparkles in the air'],
      hard: ['different communities live together', 'ancient secrets wait to be discovered', 'challenges build character'],
      expert: ['complex relationships shape the world', 'moral questions require deep thinking', 'wisdom comes through experience']
    };
    
    const options = settings[difficulty];
    return options[Math.floor(Math.random() * options.length)];
  }

  private static getActivityDescription(userInfo: UserInfo): string {
    const activity = userInfo.hobbies.toLowerCase();
    if (activity.includes('reading')) return 'reading a favorite book';
    if (activity.includes('sports')) return 'playing outside';
    if (activity.includes('art')) return 'drawing pictures';
    if (activity.includes('music')) return 'singing songs';
    return 'playing happily';
  }

  private static getSetupHook(difficulty: DifficultyLevel, theme: string): string {
    const hooks = {
      easy: `something fun was about to happen`,
      medium: `an adventure was calling`,
      hard: `a challenge would test their courage`,
      expert: `a profound journey was beginning`
    };
    return hooks[difficulty];
  }

  private static getActionForTheme(theme: string, difficulty: DifficultyLevel): string {
    if (theme.includes('friendship')) return difficulty === 'easy' ? 'make new friends' : 'build stronger friendships';
    if (theme.includes('mystery')) return difficulty === 'easy' ? 'look for clues' : 'investigate carefully';
    if (theme.includes('help')) return difficulty === 'easy' ? 'help others' : 'find ways to make a difference';
    return difficulty === 'easy' ? 'work together' : 'solve the problem step by step';
  }

  private static getWisdomForTheme(theme: string, difficulty: DifficultyLevel): string {
    const wisdom = {
      easy: ['Always be kind', 'Friends help each other', 'Try your best'],
      medium: ['Courage comes from caring', 'Every problem has a solution', 'Listen to understand'],
      hard: ['True strength comes from helping others', 'Different perspectives make us stronger', 'Leadership means serving others'],
      expert: ['Wisdom grows through understanding others', 'Justice requires both courage and compassion', 'Growth comes through embracing challenges']
    };
    
    const options = wisdom[difficulty];
    return options[Math.floor(Math.random() * options.length)];
  }

  private static getLessonForTheme(theme: string, difficulty: DifficultyLevel): string {
    const lessons = {
      easy: ['working together makes everything better', 'kindness always helps', 'everyone has something special to offer'],
      medium: ['friendship means supporting each other', 'courage grows when you help others', 'solutions come from creative thinking'],
      hard: ['understanding different viewpoints is important', 'real leadership means caring for everyone', 'communities grow stronger through cooperation'],
      expert: ['moral courage requires standing up for principles', 'complex problems need thoughtful solutions', 'personal growth comes through serving others']
    };
    
    const options = lessons[difficulty];
    return options[Math.floor(Math.random() * options.length)];
  }

  private static getSkillForClimaxByDifficulty(difficulty: DifficultyLevel): string {
    const skills = {
      easy: ['kindness and courage', 'friendship and caring', 'helpfulness and love'],
      medium: ['problem-solving skills', 'teamwork and creativity', 'determination and wisdom'],
      hard: ['leadership and understanding', 'courage and compassion', 'wisdom and strength'],
      expert: ['moral reasoning and empathy', 'complex thinking and courage', 'principled action and wisdom']
    };
    
    const options = skills[difficulty];
    return options[Math.floor(Math.random() * options.length)];
  }

  private static getClimaxActionByDifficulty(difficulty: DifficultyLevel, theme: string): string {
    const actions = {
      easy: ['showed great kindness', 'helped with a caring heart', 'did the right thing'],
      medium: ['solved the puzzle cleverly', 'brought everyone together', 'found a creative solution'],
      hard: ['stood up for what was right', 'showed true leadership', 'made a difficult but correct choice'],
      expert: ['navigated the moral complexity with wisdom', 'balanced competing values thoughtfully', 'demonstrated principled leadership']
    };
    
    const options = actions[difficulty];
    return options[Math.floor(Math.random() * options.length)];
  }

  private static getEncouragementByDifficulty(difficulty: DifficultyLevel): string {
    const encouragements = {
      easy: ['You can do it!', 'We believe in you!', 'You are so brave!'],
      medium: ['Trust yourself!', 'You have everything you need!', 'Your heart knows the way!'],
      hard: ['Your courage will guide you!', 'You have the strength to lead!', 'Trust in your wisdom!'],
      expert: ['Your principles will light the way!', 'Wisdom and courage will prevail!', 'Your moral compass is true!']
    };
    
    const options = encouragements[difficulty];
    return options[Math.floor(Math.random() * options.length)];
  }

  private static getClimaxResolutionByDifficulty(difficulty: DifficultyLevel): string {
    const resolutions = {
      easy: ['did exactly what was needed', 'made everything better', 'saved the day with kindness'],
      medium: ['found the perfect solution', 'brought harmony to everyone', 'solved the mystery completely'],
      hard: ['made the courageous choice', 'united everyone through leadership', 'chose justice over convenience'],
      expert: ['resolved the dilemma with wisdom', 'found a solution that honored all values', 'demonstrated true moral leadership']
    };
    
    const options = resolutions[difficulty];
    return options[Math.floor(Math.random() * options.length)];
  }

  private static getSuccessOutcomeByDifficulty(difficulty: DifficultyLevel, theme: string): string {
    const outcomes = {
      easy: ['Everyone was happy and safe.', 'The problem was solved with love.', 'Joy filled everyone\'s hearts.'],
      medium: ['The mystery was solved and everyone learned something new.', 'Friendship won the day.', 'Creative thinking saved everything.'],
      hard: ['Justice prevailed and the community grew stronger.', 'Leadership brought everyone together.', 'Courage created positive change.'],
      expert: ['Wisdom triumphed over conflict.', 'Moral courage transformed the situation.', 'Principled action inspired everyone.']
    };
    
    const options = outcomes[difficulty];
    return options[Math.floor(Math.random() * options.length)];
  }

  private static getLifeLessonByDifficulty(difficulty: DifficultyLevel, theme: string): string {
    const lessons = {
      easy: ['kindness always wins', 'friends make everything better', 'helping others feels wonderful'],
      medium: ['courage comes from caring about others', 'teamwork solves any problem', 'creativity opens new possibilities'],
      hard: ['true leadership means serving others', 'understanding differences makes us stronger', 'justice requires both courage and compassion'],
      expert: ['moral complexity requires thoughtful consideration', 'principled action inspires positive change', 'wisdom grows through understanding multiple perspectives']
    };
    
    const options = lessons[difficulty];
    return options[Math.floor(Math.random() * options.length)];
  }

  private static getEndingByDifficulty(difficulty: DifficultyLevel): string {
    const endings = {
      easy: ['everyone was happy and safe', 'love filled their hearts', 'dreams of more adventures danced in their minds'],
      medium: ['they knew more adventures awaited', 'friendship had made them all stronger', 'wisdom gained would guide future journeys'],
      hard: ['they understood their power to create positive change', 'leadership had grown through service to others', 'justice and compassion would guide their path'],
      expert: ['profound wisdom had been gained', 'moral courage would light their way forward', 'the complexity of life had become a source of strength']
    };
    
    const options = endings[difficulty];
    return options[Math.floor(Math.random() * options.length)];
  }
}