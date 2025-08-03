// Comprehensive template variable processor for story generation
import { UserInfo, DifficultyLevel } from "@/types";
import { NameFormatter } from "./nameFormatter";
import { GrammarValidator } from "./grammarValidator";
import { SentenceValidator } from "./sentenceValidator";
import { UserInputDistributor } from "@/services/userInputDistributor";

interface VariableContext {
  userInfo: UserInfo;
  difficulty: DifficultyLevel;
  pageIndex: number;
  totalPages: number;
  storyElements: Record<string, string[]>;
}

export class TemplateVariableProcessor {
  /**
   * Processes all template variables in a given template string
   */
  static processTemplate(template: string, context: VariableContext): string {
    let processed = template;
    
    // Initialize intelligent user input distribution
    UserInputDistributor.initialize(context.userInfo);
    
    // Get intelligent template variables
    const distributionContext = {
      pageIndex: context.pageIndex,
      totalPages: context.totalPages,
      difficulty: context.difficulty,
      usedInputs: new Set<string>()
    };
    
    const intelligentVariables = UserInputDistributor.getTemplateVariables(context.userInfo, distributionContext);
    
    // Apply intelligent variable replacements first
    Object.entries(intelligentVariables).forEach(([variable, value]) => {
      processed = processed.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value);
    });
    
    // Process remaining advanced variables for expert difficulty
    processed = this.processAdvancedVariables(processed, context);
    
    // Final cleanup and validation
    processed = this.cleanupTemplate(processed);
    
    // Validate sentence length for difficulty level
    processed = this.validateSentenceLength(processed, context.difficulty);
    
    return processed;
  }

  /**
   * Validates and adjusts sentence length based on difficulty level
   */
  private static validateSentenceLength(text: string, difficulty: DifficultyLevel): string {
    const validation = SentenceValidator.validateSentence(text, difficulty);
    
    if (!validation.isValid && validation.reconstructedSentence) {
      return validation.reconstructedSentence;
    }
    
    return text;
  }
  
  /**
   * Processes basic user-related variables
   */
  private static processBasicVariables(template: string, context: VariableContext): string {
    const { userInfo } = context;
    const name = NameFormatter.capitalize(userInfo.name || 'Alex');
    
    const basicVariables = {
      '{name}': name,
      '{character}': userInfo.favoriteAnimal || 'cat',
      '{setting}': this.getRandomSetting(context.difficulty),
      '{object}': userInfo.favoriteFood || 'apple',
      '{objects}': this.pluralize(userInfo.favoriteFood || 'apple'),
      '{color}': userInfo.favoriteColor || 'blue',
      '{hobby}': userInfo.hobbies || 'playing',
      '{age}': userInfo.age.toString()
    };
    
    let processed = template;
    Object.entries(basicVariables).forEach(([variable, value]) => {
      processed = processed.replace(new RegExp(variable, 'g'), value);
    });
    
    return processed;
  }
  
  /**
   * Processes advanced story variables
   */
  private static processAdvancedVariables(template: string, context: VariableContext): string {
    const { difficulty, pageIndex, totalPages } = context;
    
    const advancedVariables = {
      '{characters}': this.getCharacters(context),
      '{places}': this.getPlaces(difficulty),
      '{time}': this.getTimeReference(pageIndex, totalPages),
      '{theme}': this.getTheme(difficulty),
      '{action}': this.getAction(difficulty),
      '{condition}': this.getCondition(difficulty),
      '{problem}': this.getProblem(difficulty),
      '{skills}': this.getSkills(difficulty),
      '{obstacles}': this.getObstacles(difficulty),
      '{solution}': this.getSolution(difficulty),
      '{moral_lesson}': this.getMoralLesson(difficulty),
      '{mysterious_element}': this.getMysteriousElement(),
      '{complex_concept}': this.getComplexConcept(),
      '{belief_system}': this.getBeliefSystem(),
      '{antagonists}': this.getAntagonists(difficulty),
      '{difficult_choice_1}': this.getDifficultChoice(1),
      '{difficult_choice_2}': this.getDifficultChoice(2),
      '{advanced_tools}': this.getAdvancedTools(),
      '{complex_action}': this.getComplexAction(),
      '{profound_truth}': this.getProfoundTruth(),
      '{character_growth}': this.getCharacterGrowth(),
      '{self_discovery}': this.getSelfDiscovery(),
      '{principle}': this.getPrinciple(),
      '{role}': this.getRole(difficulty)
    };
    
    let processed = template;
    Object.entries(advancedVariables).forEach(([variable, value]) => {
      processed = processed.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value);
    });
    
    return processed;
  }
  
  /**
   * Processes conditional variables based on context
   */
  private static processConditionalVariables(template: string, context: VariableContext): string {
    const { userInfo } = context;
    
    // Pronoun handling
    const pronouns = this.getPronounsFromUserInfo(userInfo);
    const pronounVariables = {
      '{pronoun}': pronouns.subject,
      '{pronoun_object}': pronouns.object,
      '{pronoun_possessive}': pronouns.possessive
    };
    
    let processed = template;
    Object.entries(pronounVariables).forEach(([variable, value]) => {
      processed = processed.replace(new RegExp(variable, 'g'), value);
    });
    
    return processed;
  }
  
  /**
   * Processes grammatical variables (articles, verb conjugations)
   */
  private static processGrammaticalVariables(template: string, context: VariableContext): string {
    // This would handle more complex grammatical rules
    // For now, we'll use the existing grammar validator
    return template;
  }
  
  /**
   * Final cleanup of processed template
   */
  private static cleanupTemplate(template: string): string {
    // Remove any remaining unprocessed variables
    let cleaned = template.replace(/\{[^}]*\}/g, '');
    
    // Fix double spaces
    cleaned = cleaned.replace(/\s+/g, ' ');
    
    // Ensure proper capitalization
    cleaned = cleaned.trim();
    if (cleaned && !cleaned.match(/^[A-Z]/)) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
    
    // Ensure proper punctuation
    if (cleaned && !cleaned.match(/[.!?]$/)) {
      cleaned += '.';
    }
    
    return cleaned;
  }
  
  // Helper methods for generating contextual content
  private static getRandomSetting(difficulty: DifficultyLevel): string {
    const settings = {
      easy: ['park', 'house', 'garden', 'playground'],
      medium: ['magical forest', 'mysterious castle', 'hidden valley', 'ancient library'],
      hard: ['enchanted realm', 'floating city', 'underwater kingdom', 'crystal cavern'],
      expert: ['parallel dimension', 'time-shifted reality', 'quantum laboratory', 'interdimensional nexus']
    };
    
    const options = settings[difficulty] || settings.easy;
    return options[Math.floor(Math.random() * options.length)];
  }
  
  private static getCharacters(context: VariableContext): string {
    // This method is deprecated - use UserInputDistributor instead
    console.warn('getCharacters is deprecated. Use UserInputDistributor for intelligent distribution.');
    return context.userInfo.favoriteAnimal || 'friend';
  }
  
  private static getPlaces(difficulty: DifficultyLevel): string {
    const places = {
      easy: ['different rooms', 'new places', 'fun spots'],
      medium: ['distant lands', 'hidden passages', 'secret chambers'],
      hard: ['treacherous territories', 'forbidden realms', 'uncharted regions'],
      expert: ['dimensional rifts', 'temporal anomalies', 'reality fragments']
    };
    
    const options = places[difficulty] || places.easy;
    return options[Math.floor(Math.random() * options.length)];
  }
  
  private static getTimeReference(pageIndex: number, totalPages: number): string {
    const progress = pageIndex / totalPages;
    if (progress < 0.3) return 'morning';
    if (progress < 0.7) return 'afternoon';
    return 'evening';
  }
  
  private static getTheme(difficulty: DifficultyLevel): string {
    const themes = {
      easy: ['friendship', 'kindness', 'sharing', 'helping'],
      medium: ['courage', 'wisdom', 'perseverance', 'trust'],
      hard: ['self-discovery', 'inner strength', 'moral integrity', 'sacrifice'],
      expert: ['existential purpose', 'philosophical truth', 'cosmic responsibility', 'transcendent understanding']
    };
    
    const options = themes[difficulty] || themes.easy;
    return options[Math.floor(Math.random() * options.length)];
  }
  
  private static getAction(difficulty: DifficultyLevel): string {
    const actions = {
      easy: ['help others', 'make friends', 'solve puzzles'],
      medium: ['communicate with animals', 'understand nature', 'heal others'],
      hard: ['manipulate time', 'read minds', 'control elements'],
      expert: ['transcend reality', 'merge consciousness', 'reshape existence']
    };
    
    const options = actions[difficulty] || actions.easy;
    return options[Math.floor(Math.random() * options.length)];
  }
  
  private static getCondition(difficulty: DifficultyLevel): string {
    const conditions = {
      easy: ['someone needs help', 'friends are sad', 'something is lost'],
      medium: ['danger approaches', 'magic awakens', 'secrets are revealed'],
      hard: ['reality shifts', 'time fractures', 'dimensions collide'],
      expert: ['consciousness expands', 'existence questions itself', 'infinity calls']
    };
    
    const options = conditions[difficulty] || conditions.easy;
    return options[Math.floor(Math.random() * options.length)];
  }
  
  private static getProblem(difficulty: DifficultyLevel): string {
    const problems = {
      easy: ['a missing toy', 'a sad friend', 'a broken swing'],
      medium: ['an ancient curse', 'a mysterious illness', 'a stolen treasure'],
      hard: ['a reality storm', 'temporal paradox', 'dimensional invasion'],
      expert: ['consciousness fragmentation', 'existential collapse', 'universal entropy']
    };
    
    const options = problems[difficulty] || problems.easy;
    return options[Math.floor(Math.random() * options.length)];
  }
  
  private static getSkills(difficulty: DifficultyLevel): string {
    const skills = {
      easy: ['talents', 'abilities', 'special gifts'],
      medium: ['magical powers', 'ancient knowledge', 'mystical abilities'],
      hard: ['reality-bending skills', 'time manipulation', 'dimensional mastery'],
      expert: ['consciousness transcendence', 'existential awareness', 'cosmic understanding']
    };
    
    const options = skills[difficulty] || skills.easy;
    return options[Math.floor(Math.random() * options.length)];
  }
  
  private static getObstacles(difficulty: DifficultyLevel): string {
    const obstacles = {
      easy: ['challenges', 'puzzles', 'difficulties'],
      medium: ['magical barriers', 'ancient guardians', 'mystical tests'],
      hard: ['reality distortions', 'temporal loops', 'dimensional mazes'],
      expert: ['consciousness paradoxes', 'existential barriers', 'cosmic trials']
    };
    
    const options = obstacles[difficulty] || obstacles.easy;
    return options[Math.floor(Math.random() * options.length)];
  }
  
  private static getSolution(difficulty: DifficultyLevel): string {
    const solutions = {
      easy: ['fix the problem', 'help everyone', 'make things better'],
      medium: ['break the curse', 'restore balance', 'save the day'],
      hard: ['repair reality', 'stabilize time', 'restore dimensions'],
      expert: ['reunify consciousness', 'restore existence', 'achieve cosmic harmony']
    };
    
    const options = solutions[difficulty] || solutions.easy;
    return options[Math.floor(Math.random() * options.length)];
  }
  
  private static getMoralLesson(difficulty: DifficultyLevel): string {
    const lessons = {
      easy: ['friendship', 'kindness', 'sharing'],
      medium: ['courage', 'wisdom', 'compassion'],
      hard: ['sacrifice', 'integrity', 'perseverance'],
      expert: ['transcendence', 'enlightenment', 'cosmic responsibility']
    };
    
    const options = lessons[difficulty] || lessons.easy;
    return options[Math.floor(Math.random() * options.length)];
  }
  
  // Additional helper methods for expert-level variables
  private static getMysteriousElement(): string {
    return ['an ancient artifact', 'a cosmic force', 'a dimensional key', 'a consciousness fragment'][Math.floor(Math.random() * 4)];
  }
  
  private static getComplexConcept(): string {
    return ['the nature of reality', 'the flow of time', 'the essence of consciousness', 'the meaning of existence'][Math.floor(Math.random() * 4)];
  }
  
  private static getBeliefSystem(): string {
    return ['the laws of physics', 'the nature of truth', 'the structure of reality', 'the purpose of existence'][Math.floor(Math.random() * 4)];
  }
  
  private static getAntagonists(difficulty: DifficultyLevel): string {
    const antagonists = {
      easy: ['bullies', 'mean animals', 'troublemakers'],
      medium: ['dark wizards', 'evil creatures', 'shadow beings'],
      hard: ['reality destroyers', 'time manipulators', 'dimension invaders'],
      expert: ['consciousness devourers', 'existence nullifiers', 'cosmic entropy']
    };
    
    const options = antagonists[difficulty] || antagonists.easy;
    return options[Math.floor(Math.random() * options.length)];
  }
  
  private static getDifficultChoice(option: number): string {
    const choices = [
      ['saving friends', 'saving family', 'saving the world'],
      ['personal power', 'collective good', 'universal truth']
    ];
    
    const set = choices[option - 1] || choices[0];
    return set[Math.floor(Math.random() * set.length)];
  }
  
  private static getAdvancedTools(): string {
    return ['quantum devices', 'reality anchors', 'consciousness amplifiers', 'dimensional stabilizers'][Math.floor(Math.random() * 4)];
  }
  
  private static getComplexAction(): string {
    return ['rewrite reality', 'merge timelines', 'unify consciousness', 'transcend existence'][Math.floor(Math.random() * 4)];
  }
  
  private static getProfoundTruth(): string {
    return ['interconnected consciousness', 'infinite possibility', 'eternal cycles', 'universal love'][Math.floor(Math.random() * 4)];
  }
  
  private static getCharacterGrowth(): string {
    return ['inner transformation', 'expanded awareness', 'newfound wisdom', 'deepened understanding'][Math.floor(Math.random() * 4)];
  }
  
  private static getSelfDiscovery(): string {
    return ['inner purpose', 'hidden potential', 'true nature', 'cosmic connection'][Math.floor(Math.random() * 4)];
  }
  
  private static getPrinciple(): string {
    return ['harmony', 'balance', 'truth', 'justice'][Math.floor(Math.random() * 4)];
  }
  
  private static getRole(difficulty: DifficultyLevel): string {
    const roles = {
      easy: ['helper', 'friend', 'hero'],
      medium: ['guardian', 'protector', 'guide'],
      hard: ['champion', 'master', 'warrior'],
      expert: ['transcendent being', 'cosmic entity', 'universal force']
    };
    
    const options = roles[difficulty] || roles.easy;
    return options[Math.floor(Math.random() * options.length)];
  }
  
  private static pluralize(word: string): string {
    if (!word) return '';
    if (word.endsWith('s') || word.endsWith('x') || word.endsWith('z') || 
        word.endsWith('ch') || word.endsWith('sh')) {
      return word + 'es';
    }
    if (word.endsWith('y') && !['a', 'e', 'i', 'o', 'u'].includes(word.charAt(word.length - 2))) {
      return word.slice(0, -1) + 'ies';
    }
    return word + 's';
  }
  
  private static getPronounsFromUserInfo(userInfo: UserInfo): { subject: string; object: string; possessive: string } {
    const avatarType = userInfo.avatar?.type;
    
    switch (avatarType) {
      case 'boy':
        return { subject: 'he', object: 'him', possessive: 'his' };
      case 'girl':
        return { subject: 'she', object: 'her', possessive: 'her' };
      default:
        return { subject: 'they', object: 'them', possessive: 'their' };
    }
  }
}