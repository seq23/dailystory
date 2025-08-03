import { UserInfo, DifficultyLevel, Story } from "@/types";
import { SmartInputParser, ParsedTag } from "./smartInputParser";
import { STORY_LANGUAGES, getLanguageTemplates } from "@/constants/storyLanguages";
import { MultilingualStoryRequest, SupportedLanguage } from "@/types/multilingual";
import { StoryQualityChecker } from "@/utils/storyQualityChecker";
import { validateAndFixGrammar, GrammarValidator } from "@/utils/grammarValidator";
import { NameFormatter } from "@/utils/nameFormatter";
import { AntiRepetitionSystem } from "@/utils/antiRepetitionSystem";
import { TemplateVariableProcessor } from "@/utils/templateVariableProcessor";
import { APP_CONFIG } from "@/constants/app";
// Generate unique ID utility
const generateUniqueId = () => Math.random().toString(36).substr(2, 9);

export interface ConsolidatedStoryConfig {
  pageCount: number;
  language: SupportedLanguage;
  useSmartParsing: boolean;
  antiRepetition: boolean;
  culturalAdaptation: boolean;
}

export interface StoryGenerationResult {
  story: Story;
  processingTime: number;
  usedElements: Record<string, string[]>;
  qualityScore: number;
  templateIdentifier: string;
}

export class ConsolidatedStoryGenerator {
  private static usedTemplates = new Set<string>();
  private static usedCombinations = new Set<string>();

  /**
   * Main story generation method - consolidates all previous generators with 10-phase improvements
   */
  static async generateStory(
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    config: Partial<ConsolidatedStoryConfig> = {}
  ): Promise<StoryGenerationResult> {
    const startTime = Date.now();
    
    const fullConfig: ConsolidatedStoryConfig = {
      pageCount: APP_CONFIG.DEFAULT_PAGE_COUNT,
      language: 'en',
      useSmartParsing: true,
      antiRepetition: true,
      culturalAdaptation: true,
      ...config
    };

    console.log('🎯 Consolidated Story Generation Starting', {
      userInfo: userInfo.name,
      difficulty,
      config: fullConfig
    });

    // Phase 8: Clear anti-repetition cache for new story
    AntiRepetitionSystem.clearCache();

    try {
      // Phase 9: Ensure proper name capitalization throughout the process
      const processedUserInfo = {
        ...userInfo,
        name: NameFormatter.capitalize(userInfo.name)
      };

      // Phase 10 & 4: Parse user input with enhanced spelling correction
      let parsedElements: ParsedTag[] = [];
      if (fullConfig.useSmartParsing) {
        const userTags = [
          processedUserInfo.favoriteAnimal,
          processedUserInfo.favoriteFood,
          processedUserInfo.hobbies,
          processedUserInfo.specialRequest
        ].filter(Boolean);

        const parsingResult = await SmartInputParser.parseTaggedInput(userTags, processedUserInfo);
        parsedElements = parsingResult.parsedTags;
        
        console.log('📝 Smart Parsing Results:', SmartInputParser.generateProcessingReport(parsingResult));
      }

      // Phase 1 & 5: Generate story pages using enhanced template processing
      const templates = getLanguageTemplates(fullConfig.language, difficulty);
      if (!templates.length) {
        console.warn(`No templates available for ${fullConfig.language}/${difficulty}, using fallback`);
        return this.generateFallbackStoryResult(processedUserInfo, difficulty, startTime);
      }

      const pages: string[] = [];
      const extractedElements = SmartInputParser.extractStoryElements(parsedElements);
      
      // Phase 3: Enhanced element distribution and selection
      for (let i = 0; i < fullConfig.pageCount; i++) {
        const templateIndex = i % templates.length;
        let template = templates[templateIndex];
        
        // Phase 1: Comprehensive template variable processing
        const variableContext = {
          userInfo: processedUserInfo,
          difficulty,
          pageIndex: i,
          totalPages: fullConfig.pageCount,
          storyElements: extractedElements
        };
        
        let processedPage = TemplateVariableProcessor.processTemplate(template, variableContext);
        
        // Phase 8: Anti-repetition system checks
        if (fullConfig.antiRepetition) {
          const diversityScore = AntiRepetitionSystem.calculateDiversityScore(processedPage);
          
          if (diversityScore < 0.7 && AntiRepetitionSystem.isDuplicate(processedPage)) {
            // Generate variations to avoid repetition
            const variations = AntiRepetitionSystem.generateVariations(processedPage, extractedElements);
            if (variations.length > 0) {
              processedPage = variations[Math.floor(Math.random() * variations.length)];
            } else {
              // Fallback to alternative template
              const altTemplateIndex = (templateIndex + 1) % templates.length;
              processedPage = TemplateVariableProcessor.processTemplate(templates[altTemplateIndex], variableContext);
            }
          }
          
          AntiRepetitionSystem.addContent(processedPage);
        }
        
        pages.push(processedPage);
      }

      // Phase 2: Light grammar validation (less aggressive)
      const improvedPages = pages.map(page => this.lightGrammarValidation(page));

      // Calculate quality score
      const qualityScore = this.calculateQualityScore(improvedPages, parsedElements);
      
      // Get used elements for reporting
      const usedElements = parsedElements.reduce((acc, tag) => {
        acc[tag.category] = acc[tag.category] || [];
        acc[tag.category].push(tag.corrected);
        return acc;
      }, {} as Record<string, string[]>);

      const story: Story = {
        id: generateUniqueId(),
        title: this.generateStoryTitle(processedUserInfo, difficulty),
        segments: improvedPages.map(text => ({
          text: text,
          illustration: undefined,
          audioUrl: undefined
        })),
        difficulty,
        estimatedReadingTime: Math.ceil(improvedPages.join(' ').split(' ').length / 100),
        wordCount: improvedPages.join(' ').split(' ').filter(word => word.trim()).length
      };

      const processingTime = Date.now() - startTime;
      console.log('✅ Consolidated Story Generation Completed', {
        processingTime: `${processingTime}ms`,
        pageCount: improvedPages.length,
        wordCount: story.wordCount,
        qualityScore,
        usedElements
      });

      return {
        story,
        processingTime,
        usedElements,
        qualityScore,
        templateIdentifier: this.getTemplateIdentifier(difficulty, fullConfig.language)
      };

    } catch (error) {
      console.error('❌ Consolidated Story Generation Error', error);
      return this.generateFallbackStoryResult(userInfo, difficulty, startTime);
    }
  }

  /**
   * Phase 2: Light grammar validation - only fixes critical errors
   */
  private static lightGrammarValidation(text: string): string {
    // Only fix the most critical grammar issues
    let fixed = text;
    
    // Fix obvious pronoun-verb agreement errors
    fixed = fixed.replace(/\b(he|she|it)\s+(eat|run|play|like|go|come|see|find|help|love|want|need|have|do|say|get|know|think|feel|look|try|make|take|give|work|call|move|turn|start|stop|walk|talk|ask|tell|show|hear|listen|watch|learn|teach|read|write|draw|sing|dance|swim|jump|fly|sleep|wake|open|close|carry|hold|pick|drop|push|pull|throw|catch)\b/gi, 
      (match, pronoun, verb) => {
        const correctVerb = GrammarValidator.conjugateVerb(verb, pronoun);
        return `${pronoun} ${correctVerb}`;
      });
    
    // Remove obvious template variables that weren't processed
    fixed = fixed.replace(/\{[^}]*\}/g, '');
    
    // Fix double spaces
    fixed = fixed.replace(/\s+/g, ' ');
    
    // Ensure proper sentence ending
    fixed = fixed.trim();
    if (fixed && !fixed.match(/[.!?]$/)) {
      fixed += '.';
    }
    
    return fixed;
  }

  /**
   * Generates a fallback story result when main generation fails
   */
  private static generateFallbackStoryResult(
    userInfo: UserInfo, 
    difficulty: DifficultyLevel, 
    startTime: number
  ): StoryGenerationResult {
    const name = NameFormatter.capitalize(userInfo.name || 'Alex');
    const animal = userInfo.favoriteAnimal || 'cat';
    const color = userInfo.favoriteColor || 'blue';
    
    const fallbackPages = [
      `Once upon a time, there was a brave child named ${name}.`,
      `${name} had a special friend, a ${color} ${animal}.`,
      `One day, ${name} and the ${animal} went on an adventure.`,
      `They discovered something amazing together.`,
      `${name} learned that friendship makes everything better.`,
      `And they all lived happily ever after!`
    ];

    const story: Story = {
      id: generateUniqueId(),
      title: `${name}'s Adventure`,
      segments: fallbackPages.map(text => ({
        text: text,
        illustration: undefined,
        audioUrl: undefined
      })),
      difficulty,
      estimatedReadingTime: 3,
      wordCount: fallbackPages.join(' ').split(' ').filter(word => word.trim()).length
    };

    return {
      story,
      processingTime: Date.now() - startTime,
      usedElements: { characters: [animal], themes: ['adventure'] },
      qualityScore: 0.6,
      templateIdentifier: `fallback_${difficulty}`
    };
  }

  /**
   * Calculates a quality score for the generated story
   */
  private static calculateQualityScore(pages: string[], parsedTags: ParsedTag[]): number {
    let score = 0.5; // Base score
    
    // Check for variety in content
    const uniqueWords = new Set(pages.join(' ').toLowerCase().split(/\s+/));
    if (uniqueWords.size > 30) score += 0.2;
    
    // Check for proper use of parsed elements
    if (parsedTags.length > 0) score += 0.1;
    
    // Check for proper sentence structure
    const wellFormedSentences = pages.filter(page => 
      page.trim().length > 10 && page.match(/[.!?]$/)
    );
    if (wellFormedSentences.length === pages.length) score += 0.2;
    
    return Math.min(1.0, score);
  }

  /**
   * Phase 9: Generates a properly capitalized story title
   */
  private static generateStoryTitle(userInfo: UserInfo, difficulty: DifficultyLevel): string {
    const name = NameFormatter.capitalize(userInfo.name);
    const themes = {
      easy: ['Adventure', 'Fun Day', 'Special Friend'],
      medium: ['Quest', 'Discovery', 'Journey'],
      hard: ['Epic Adventure', 'Great Discovery', 'Heroic Quest'],
      expert: ['Legendary Journey', 'Cosmic Adventure', 'Ultimate Quest']
    };
    
    const themeOptions = themes[difficulty] || themes.easy;
    const theme = themeOptions[Math.floor(Math.random() * themeOptions.length)];
    
    return `${name}'s ${theme}`;
  }

  /**
   * Generates a template identifier for tracking
   */
  private static getTemplateIdentifier(difficulty: DifficultyLevel, language: SupportedLanguage): string {
    return `${language}_${difficulty}_v2`;
  }

  /**
   * Clears all caches - useful for testing and new sessions
   */
  static clearCaches(): void {
    this.usedTemplates.clear();
    this.usedCombinations.clear();
    AntiRepetitionSystem.clearCache();
  }
}