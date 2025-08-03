import { UserInfo, DifficultyLevel } from "@/types";
import { SmartInputParser, ParsedTag } from "./smartInputParser";
import { STORY_LANGUAGES, getLanguageTemplates } from "@/constants/storyLanguages";
import { MultilingualStoryRequest, SupportedLanguage } from "@/types/multilingual";
import { StoryQualityChecker } from "@/utils/storyQualityChecker";
import { validateAndFixGrammar } from "@/utils/grammarValidator";

export interface ConsolidatedStoryConfig {
  pageCount: number;
  language: SupportedLanguage;
  useSmartParsing: boolean;
  antiRepetition: boolean;
  culturalAdaptation: boolean;
}

export interface StoryGenerationResult {
  pages: string[];
  metadata: {
    processingTime: number;
    parsedElements: ParsedTag[];
    templateUsed: string;
    qualityScore: number;
    language: SupportedLanguage;
    elementsUsed: {
      characters: string[];
      objects: string[];
      settings: string[];
      themes: string[];
    };
  };
}

export class ConsolidatedStoryGenerator {
  private static usedTemplates = new Set<string>();
  private static usedCombinations = new Set<string>();

  /**
   * Main story generation method - consolidates all previous generators
   */
  static async generateStory(
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    config: Partial<ConsolidatedStoryConfig> = {}
  ): Promise<StoryGenerationResult> {
    const startTime = Date.now();
    
    const fullConfig: ConsolidatedStoryConfig = {
      pageCount: 10,
      language: 'en',
      useSmartParsing: true,
      antiRepetition: true,
      culturalAdaptation: true,
      ...config
    };

    console.log('🎨 Consolidated Story Generator: Starting enhanced generation...');

    try {
      // Step 1: Smart parsing of user inputs (if enabled)
      let parsedElements: ParsedTag[] = [];
      let storyElements = {
        characters: [userInfo.favoriteAnimal || 'friendly animal'],
        objects: [userInfo.favoriteFood || 'special treasure'],
        settings: ['magical place'],
        themes: [userInfo.hobbies || 'adventure']
      };

      if (fullConfig.useSmartParsing) {
        parsedElements = await this.parseUserInputs(userInfo);
        storyElements = SmartInputParser.extractStoryElements(parsedElements);
      }

      // Step 2: Generate story pages with intelligent element weaving
      const pages = await this.generatePagesWithElements(
        userInfo,
        difficulty,
        storyElements,
        fullConfig
      );

      // Step 3: Apply quality checking and improvements
      const improvedPages = pages.map(page => 
        validateAndFixGrammar(page)
      );

      // Step 4: Calculate quality score
      const qualityScore = this.calculateQualityScore(improvedPages, storyElements);

      const processingTime = Date.now() - startTime;

      console.log(`✨ Story generated in ${processingTime}ms with quality score: ${qualityScore}`);

      return {
        pages: improvedPages,
        metadata: {
          processingTime,
          parsedElements,
          templateUsed: this.getTemplateIdentifier(difficulty, fullConfig.language),
          qualityScore,
          language: fullConfig.language,
          elementsUsed: storyElements
        }
      };

    } catch (error) {
      console.error('Consolidated story generation failed:', error);
      return this.generateFallbackStory(userInfo, difficulty, fullConfig);
    }
  }

  /**
   * Parse user inputs using SmartInputParser
   */
  private static async parseUserInputs(userInfo: UserInfo): Promise<ParsedTag[]> {
    const inputTags: string[] = [];

    // Collect all user inputs as tags
    if (userInfo.favoriteAnimal) {
      inputTags.push(...userInfo.favoriteAnimal.split(',').map(s => s.trim()));
    }
    if (userInfo.favoriteFood) {
      inputTags.push(...userInfo.favoriteFood.split(',').map(s => s.trim()));
    }
    if (userInfo.hobbies) {
      inputTags.push(...userInfo.hobbies.split(',').map(s => s.trim()));
    }
    if (userInfo.specialRequest) {
      inputTags.push(...userInfo.specialRequest.split(',').map(s => s.trim()));
    }

    const result = await SmartInputParser.parseTaggedInput(inputTags, userInfo, true);
    return result.parsedTags;
  }

  /**
   * Generate story pages with intelligent element distribution
   */
  private static async generatePagesWithElements(
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    elements: { characters: string[]; objects: string[]; settings: string[]; themes: string[] },
    config: ConsolidatedStoryConfig
  ): Promise<string[]> {
    
    const templates = getLanguageTemplates(config.language, difficulty);
    if (templates.length === 0) {
      throw new Error(`No templates available for ${config.language}/${difficulty}`);
    }

    const pages: string[] = [];
    const usedElementIndices = new Set<string>();

    for (let i = 0; i < config.pageCount; i++) {
      // Select template with anti-repetition
      const template = this.selectTemplate(templates, i, config.antiRepetition);
      
      // Select elements for this page (rotate to avoid repetition)
      const pageElements = this.selectElementsForPage(elements, i, usedElementIndices);
      
      // Process template with selected elements
      const page = this.processTemplate(template, userInfo, pageElements, i, config.pageCount);
      
      pages.push(page);
    }

    return pages;
  }

  /**
   * Select template with anti-repetition logic
   */
  private static selectTemplate(templates: string[], pageIndex: number, antiRepetition: boolean): string {
    if (!antiRepetition) {
      return templates[pageIndex % templates.length];
    }

    // Try to find an unused template
    const availableTemplates = templates.filter(template => 
      !this.usedTemplates.has(template)
    );

    let selectedTemplate: string;

    if (availableTemplates.length > 0) {
      selectedTemplate = availableTemplates[pageIndex % availableTemplates.length];
    } else {
      // All templates used, reset and continue
      this.usedTemplates.clear();
      selectedTemplate = templates[pageIndex % templates.length];
    }

    this.usedTemplates.add(selectedTemplate);
    return selectedTemplate;
  }

  /**
   * Select and rotate elements for page
   */
  private static selectElementsForPage(
    elements: { characters: string[]; objects: string[]; settings: string[]; themes: string[] },
    pageIndex: number,
    usedElementIndices: Set<string>
  ): { character: string; object: string; setting: string; theme: string } {
    
    const getRotatedElement = (array: string[], category: string): string => {
      if (array.length === 0) return '';
      
      // Try to find unused element
      for (let i = 0; i < array.length; i++) {
        const index = (pageIndex + i) % array.length;
        const key = `${category}-${index}`;
        
        if (!usedElementIndices.has(key)) {
          usedElementIndices.add(key);
          return array[index];
        }
      }
      
      // All used, just rotate
      return array[pageIndex % array.length];
    };

    return {
      character: getRotatedElement(elements.characters, 'character'),
      object: getRotatedElement(elements.objects, 'object'),
      setting: getRotatedElement(elements.settings, 'setting'),
      theme: getRotatedElement(elements.themes, 'theme')
    };
  }

  /**
   * Process template with user data and selected elements
   */
  private static processTemplate(
    template: string,
    userInfo: UserInfo,
    elements: { character: string; object: string; setting: string; theme: string },
    pageIndex: number,
    totalPages: number
  ): string {
    
    const pronouns = this.getPronounsFromUserInfo(userInfo);
    const storyPosition = this.getStoryPosition(pageIndex, totalPages);
    
    // Enhanced template variable replacement
    let processed = template
      .replace(/{name}/g, userInfo.name || 'Alex')
      .replace(/{character}/g, elements.character)
      .replace(/{characters}/g, elements.character + 's')
      .replace(/{object}/g, elements.object)
      .replace(/{objects}/g, elements.object + 's')
      .replace(/{setting}/g, elements.setting)
      .replace(/{settings}/g, elements.setting + 's')
      .replace(/{theme}/g, elements.theme)
      .replace(/{themes}/g, elements.theme + 's')
      .replace(/{pronoun}/g, pronouns.subject)
      .replace(/{pronouns}/g, pronouns.object)
      .replace(/{possessive}/g, pronouns.possessive)
      .replace(/{age}/g, userInfo.age?.toString() || '8')
      .replace(/{position}/g, storyPosition);

    // Advanced replacements for complex templates
    processed = this.processAdvancedTemplateVariables(processed, userInfo, elements, pageIndex);

    return processed;
  }

  /**
   * Process advanced template variables for higher difficulty levels
   */
  private static processAdvancedTemplateVariables(
    template: string,
    userInfo: UserInfo,
    elements: any,
    pageIndex: number
  ): string {
    
    const timeOfDay = ['morning', 'afternoon', 'evening'][pageIndex % 3];
    const emotions = ['excited', 'curious', 'determined', 'joyful'][pageIndex % 4];
    const actions = ['discovered', 'explored', 'created', 'solved'][pageIndex % 4];
    
    return template
      .replace(/{time_of_day}/g, timeOfDay)
      .replace(/{emotion}/g, emotions)
      .replace(/{action}/g, actions)
      .replace(/{mysterious_element}/g, `mysterious ${elements.object}`)
      .replace(/{complex_concept}/g, 'the power of friendship')
      .replace(/{moral_lesson}/g, 'kindness and cooperation')
      .replace(/{belief_system}/g, 'the way things work')
      .replace(/{problem}/g, `missing ${elements.object}`)
      .replace(/{solution}/g, `find the ${elements.object}`)
      .replace(/{skill}/g, userInfo.hobbies || 'special talent')
      .replace(/{place}/g, elements.setting);
  }

  /**
   * Get pronouns based on user info
   */
  private static getPronounsFromUserInfo(userInfo: UserInfo): { subject: string; object: string; possessive: string } {
    const gender = userInfo.avatar?.type || 'neutral';
    
    switch (gender) {
      case 'girl':
        return { subject: 'she', object: 'her', possessive: 'her' };
      case 'boy':
        return { subject: 'he', object: 'him', possessive: 'his' };
      default:
        return { subject: 'they', object: 'them', possessive: 'their' };
    }
  }

  /**
   * Determine story position for template selection
   */
  private static getStoryPosition(pageIndex: number, totalPages: number): 'beginning' | 'middle' | 'end' {
    if (pageIndex < totalPages * 0.3) return 'beginning';
    if (pageIndex > totalPages * 0.7) return 'end';
    return 'middle';
  }

  /**
   * Calculate story quality score
   */
  private static calculateQualityScore(pages: string[], elements: any): number {
    let score = 0;
    
    // Check element usage diversity
    const allText = pages.join(' ');
    score += elements.characters.length * 10;
    score += elements.objects.length * 10;
    score += elements.settings.length * 10;
    
    // Check for repetition
    const words = allText.split(' ');
    const uniqueWords = new Set(words);
    score += (uniqueWords.size / words.length) * 50;
    
    // Check story length appropriateness
    if (pages.length >= 8) score += 20;
    
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Generate fallback story
   */
  private static generateFallbackStory(
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    config: ConsolidatedStoryConfig
  ): StoryGenerationResult {
    
    const pages = [
      `Once upon a time, there was a child named ${userInfo.name}.`,
      `${userInfo.name} loved ${userInfo.favoriteAnimal || 'animals'} and ${userInfo.favoriteFood || 'good food'}.`,
      `One day, ${userInfo.name} went on a wonderful adventure.`,
      `${userInfo.name} learned something important and returned home happy.`,
      'The end.'
    ];

    return {
      pages,
      metadata: {
        processingTime: 0,
        parsedElements: [],
        templateUsed: 'fallback',
        qualityScore: 50,
        language: config.language,
        elementsUsed: {
          characters: [userInfo.favoriteAnimal || 'friend'],
          objects: [userInfo.favoriteFood || 'treasure'],
          settings: ['home'],
          themes: ['adventure']
        }
      }
    };
  }

  /**
   * Get template identifier for metadata
   */
  private static getTemplateIdentifier(difficulty: DifficultyLevel, language: SupportedLanguage): string {
    return `${language}-${difficulty}-consolidated`;
  }

  /**
   * Clear caches (for testing or memory management)
   */
  static clearCaches(): void {
    this.usedTemplates.clear();
    this.usedCombinations.clear();
  }
}