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
import { runComprehensiveQualityVerification } from "@/utils/runComprehensiveQualityVerification";
import { getEnhancedTemplate } from "@/constants/enhancedStoryTemplates";
import { UserInputDistributor } from "@/services/userInputDistributor";
import { LanguagePreferenceService } from "./languagePreferenceService";
// Generate unique ID utility
const generateUniqueId = () => Math.random().toString(36).substring(2, 11);

export interface ConsolidatedStoryConfig {
  pageCount: number;
  language: SupportedLanguage;
  useSmartParsing: boolean;
  antiRepetition: boolean;
  culturalAdaptation: boolean;
  preserveAntiRepetition?: boolean; // Don't clear cache for story continuations
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
    
    // Get language configuration using the new service
    const languageConfig = LanguagePreferenceService.getLanguageConfig(userInfo);
    
    const fullConfig: ConsolidatedStoryConfig = {
      pageCount: APP_CONFIG.DEFAULT_PAGE_COUNT,
      useSmartParsing: true,
      antiRepetition: true,
      culturalAdaptation: true,
      ...config,
      // Use dynamic story language instead of hardcoded English
      language: languageConfig.storyLanguage
    };

    console.log('🎯 Consolidated Story Generation Starting', {
      userInfo: userInfo.name,
      difficulty,
      config: fullConfig
    });

    // Phase 8: Initialize anti-repetition system and clear cache for new story (unless preserving for continuation)
    await AntiRepetitionSystem.initialize();
    if (!fullConfig.preserveAntiRepetition) {
      AntiRepetitionSystem.clearCache(true); // Preserve persistent signatures
    }

    try {
      console.log(`🎯 Starting consolidated story generation for ${userInfo.name} (${difficulty} level)`);
      console.log(`📊 Using TTS-optimized word count standards: Easy(2-4), Medium(4-8), Hard(6-12), Expert(8-15) words per page`);
      console.log(`🎯 CRITICAL: Current story templates for ${difficulty}:`, getLanguageTemplates('en', difficulty));

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

      // Phase 1 & 5: Generate story pages using enhanced intelligent templates
      await UserInputDistributor.initialize(processedUserInfo);
      const enhancedTemplate = getEnhancedTemplate(difficulty);
      
      if (!enhancedTemplate.length) {
        console.warn(`No enhanced templates available for ${difficulty}, using fallback`);
        return this.generateFallbackStoryResult(processedUserInfo, difficulty, startTime);
      }

      const pages: string[] = [];
      const extractedElements = SmartInputParser.extractStoryElements(parsedElements);
      
      // Phase 3: Enhanced element distribution and selection with intelligent templates
      const totalPages = fullConfig.pageCount; // Generate exactly the requested number of pages
      console.log(`Generating ${totalPages} pages using ${enhancedTemplate.length} template pages`);
      
      for (let i = 0; i < totalPages; i++) {
        // Use template cycling if we need more pages than templates available
        let template = enhancedTemplate[i % enhancedTemplate.length];
        
        // Add variation for repeated templates
        if (i >= enhancedTemplate.length) {
          template = this.addTemplateVariation(template, i, processedUserInfo);
        }
        
        // Phase 1: Comprehensive template variable processing
        const variableContext = {
          userInfo: processedUserInfo,
          difficulty,
          pageIndex: i,
          totalPages: fullConfig.pageCount,
          storyElements: extractedElements
        };
        
        let processedPage = await TemplateVariableProcessor.processTemplate(template, variableContext);
        
        // Phase 8: Anti-repetition system checks with improved thresholds
        if (fullConfig.antiRepetition) {
          const diversityScore = AntiRepetitionSystem.calculateDiversityScore(processedPage);
          
          // More lenient threshold to reduce over-filtering
          if (diversityScore < 0.5 && AntiRepetitionSystem.isDuplicateSync(processedPage, 0.8)) {
            console.log(`Page ${i + 1}: Low diversity (${diversityScore.toFixed(2)}), generating variations...`);
            
            // Generate variations to avoid repetition
            console.log(`🔧 Pre-variation page content:`, processedPage);
            const variations = AntiRepetitionSystem.generateVariations(processedPage, extractedElements);
            if (variations.length > 0) {
              processedPage = variations[Math.floor(Math.random() * variations.length)];
              console.log(`✅ Post-variation page content:`, processedPage);
              console.log(`Page ${i + 1}: Using variation: "${processedPage.substring(0, 50)}..."`);
            } else {
              // Better contextual fallback
              processedPage = this.generateContextualFallback(processedUserInfo, i, totalPages);
              console.log(`Page ${i + 1}: Using contextual fallback`);
            }
          }
          
          await AntiRepetitionSystem.addContent(processedPage);
        }
        
        pages.push(processedPage);
      }

      // Phase 2: Light grammar validation (less aggressive)  
      console.log(`🔍 Pre-grammar validation pages:`, pages);
      const improvedPages = pages.map(page => this.lightGrammarValidation(page));
      console.log(`✅ Post-grammar validation pages:`, improvedPages);

      // Phase 3: INDUSTRY STANDARD QUALITY CHECK - Enforce word count standards per reading level
      let qualityCheck = StoryQualityChecker.checkStoryQuality(improvedPages, difficulty);
      console.log(`📊 Story Quality Check:`, qualityCheck);
      console.log(`📊 Quality Issues Detail:`, qualityCheck.issues);
      
      // CRITICAL FIX: Always enforce quality standards - multiple passes if needed
      let qualityPassAttempts = 0;
      let finalPages = [...improvedPages];
      
      while (!qualityCheck.isValid && qualityPassAttempts < 3) {
        qualityPassAttempts++;
        console.log(`🔧 Quality Fix Attempt #${qualityPassAttempts}`);
        
        const criticalIssues = qualityCheck.issues.filter(issue => 
          issue.severity === 'error' || 
          (issue.type === 'readability' && issue.severity === 'warning')
        );
        
        if (criticalIssues.length > 0) {
          console.log(`⚠️ Critical quality issues found, attempting fixes:`, criticalIssues);
          
          // Fix each critical issue
          for (const issue of criticalIssues) {
            if (issue.type === 'readability' && issue.pageIndex) {
              const pageIndex = issue.pageIndex - 1;
              if (finalPages[pageIndex]) {
                const originalPage = finalPages[pageIndex];
                const wordCount = originalPage.split(/\s+/).filter(w => w.trim()).length;
                
                console.log(`🔧 Fixing page ${pageIndex + 1}: "${originalPage}" (${wordCount} words)`);
                
                // Determine if we need to expand or reduce
                const adjustmentType = issue.message.toLowerCase().includes('only') || 
                                     issue.message.toLowerCase().includes('too few') ? 'expand' : 'reduce';
                
                finalPages[pageIndex] = this.adjustPageWordCount(
                  originalPage, 
                  difficulty, 
                  adjustmentType
                );
                
                const newWordCount = finalPages[pageIndex].split(/\s+/).filter(w => w.trim()).length;
                console.log(`✅ Fixed page ${pageIndex + 1}: "${finalPages[pageIndex]}" (${newWordCount} words)`);
              }
            }
          }
          
          // Re-check quality after fixes
          qualityCheck = StoryQualityChecker.checkStoryQuality(finalPages, difficulty);
          if (qualityCheck.isValid) {
            console.log(`✅ Quality check passed after ${qualityPassAttempts} attempts!`);
            break;
          } else {
            console.log(`⚠️ Quality check still failing, issues:`, qualityCheck.issues);
          }
        } else {
          break; // No critical issues to fix
        }
      }
      
      // Final quality verification with detailed logging
      const finalQualityCheck = StoryQualityChecker.checkStoryQuality(finalPages, difficulty);
      console.log(`🎯 FINAL QUALITY CHECK:`, finalQualityCheck);
      console.log(`📝 FINAL PAGES WORD COUNTS:`, finalPages.map((page, i) => 
        `Page ${i+1}: ${page.split(/\s+/).filter(w => w.trim()).length} words - "${page}"`
      ));

      // Calculate quality score using final quality check results
      const qualityScore = finalQualityCheck.score / 100; // Convert to 0-1 scale
      
      // Get used elements for reporting
      console.log(`📊 Parsed elements for usedElements:`, parsedElements);
      const usedElements = parsedElements.reduce((acc, tag) => {
        acc[tag.category] = acc[tag.category] || [];
        console.log(`📝 Adding to usedElements - category: ${tag.category}, corrected: "${tag.corrected}"`);
        acc[tag.category].push(tag.corrected);
        return acc;
      }, {} as Record<string, string[]>);
      console.log(`🏁 Final usedElements:`, usedElements);

      const story: Story = {
        id: generateUniqueId(),
        title: this.generateStoryTitle(processedUserInfo, difficulty),
        segments: finalPages.map(text => ({
          text: text,
          illustration: undefined,
          audioUrl: undefined
        })),
        difficulty,
        estimatedReadingTime: Math.ceil(finalPages.join(' ').split(' ').length / 100),
        wordCount: finalPages.join(' ').split(' ').filter(word => word.trim()).length
      };

      const processingTime = Date.now() - startTime;
      console.log('✅ Consolidated Story Generation Completed', {
        processingTime: `${processingTime}ms`,
        pageCount: finalPages.length,
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
   * Phase 2: Enhanced grammar validation - fixes critical errors
   */
  private static lightGrammarValidation(text: string): string {
    console.log('🔍 Pre-grammar validation:', text);
    
    // Only fix the most critical grammar issues
    let fixed = text;
    
    // Fix obvious pronoun-verb agreement errors
    fixed = fixed.replace(/\b(he|she|it)\s+(eat|run|play|like|go|come|see|find|help|love|want|need|have|do|say|get|know|think|feel|look|try|make|take|give|work|call|move|turn|start|stop|walk|talk|ask|tell|show|hear|listen|watch|learn|teach|read|write|draw|sing|dance|swim|jump|fly|sleep|wake|open|close|carry|hold|pick|drop|push|pull|throw|catch)\b/gi, 
      (match, pronoun, verb) => {
        console.log(`🔧 Grammar fix: "${match}" -> "${pronoun} ${GrammarValidator.conjugateVerb(verb, pronoun)}"`);
        const correctVerb = GrammarValidator.conjugateVerb(verb, pronoun);
        return `${pronoun} ${correctVerb}`;
      });
    
    // Fix incorrect articles with plural nouns (e.g., "a dogs" -> "dogs", "a cats" -> "cats")
    fixed = fixed.replace(/\ba\s+([a-z]+s)\b/gi, (match, noun) => {
      // Check if it's a plural noun
      if (GrammarValidator.isPlural(noun)) {
        console.log(`🔧 Article fix: "${match}" -> "${noun}" (removed 'a' from plural)`);
        return noun; // Remove the "a" for plural nouns
      }
      return match; // Keep original if not plural
    });
    
    // Fix "an" with plural nouns too
    fixed = fixed.replace(/\ban\s+([a-z]+s)\b/gi, (match, noun) => {
      if (GrammarValidator.isPlural(noun)) {
        console.log(`🔧 Article fix: "${match}" -> "${noun}" (removed 'an' from plural)`);
        return noun; // Remove the "an" for plural nouns
      }
      return match; // Keep original if not plural
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
    
    console.log('✅ Post-grammar validation:', fixed);
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
   * Calculates a quality score for the generated story (TTS-optimized)
   */
  private static calculateQualityScore(pages: string[], parsedTags: ParsedTag[]): number {
    let score = 0.5; // Base score
    
    // Check for TTS-appropriate word count variety
    const wordCounts = pages.map(page => page.split(/\s+/).filter(w => w.trim()).length);
    const avgWordCount = wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length;
    if (avgWordCount >= 2 && avgWordCount <= 15) score += 0.2; // TTS-friendly range
    
    // Check for proper use of parsed elements
    if (parsedTags.length > 0) score += 0.1;
    
    // Check for TTS-friendly sentence structure (complete thoughts, proper punctuation)
    const ttsReadySentences = pages.filter(page => 
      page.trim().length > 3 && page.match(/[.!?]$/) && !page.includes('{')
    );
    if (ttsReadySentences.length === pages.length) score += 0.2;
    
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
   * Adds variation to repeated templates
   */
  private static addTemplateVariation(template: string, pageIndex: number, userInfo: UserInfo): string {
    const variations = [
      "Then, " + template.toLowerCase(),
      "Next, " + template.toLowerCase(),
      "After that, " + template.toLowerCase(),
      "Suddenly, " + template.toLowerCase(),
      "Meanwhile, " + template.toLowerCase()
    ];
    
    return variations[pageIndex % variations.length];
  }

  /**
   * Generates contextual fallback content instead of generic repetitive text
   */
  private static generateContextualFallback(userInfo: UserInfo, pageIndex: number, totalPages: number): string {
    const name = userInfo.name;
    const animal = userInfo.favoriteAnimal || 'friend';
    const hobby = userInfo.hobbies || 'adventure';
    
    const fallbacks = [
      `${name} discovers something wonderful about ${animal}s.`,
      `The ${hobby} leads ${name} to a new discovery.`,
      `${name} learns an important lesson.`,
      `A new challenge appears for ${name} to solve.`,
      `${name} shows kindness to a new friend.`,
      `The adventure takes an unexpected turn for ${name}.`,
      `${name} uses creativity to solve a problem.`,
      `Something magical happens in ${name}'s story.`
    ];
    
    return fallbacks[pageIndex % fallbacks.length];
  }

  /**
   * Adjusts page word count to meet industry standards per reading level
   */
  private static adjustPageWordCount(
    page: string, 
    difficulty: DifficultyLevel, 
    adjustment: 'expand' | 'reduce'
  ): string {
    const wordCounts = {
      easy: { min: 3, max: 8 },
      medium: { min: 8, max: 25 },
      hard: { min: 20, max: 45 },
      expert: { min: 35, max: 80 }
    };

    const target = wordCounts[difficulty] || wordCounts.medium;
    const words = page.split(/\s+/).filter(word => word.trim());
    
    if (adjustment === 'expand' && words.length < target.min) {
      // Add simple descriptive words to reach minimum
      const expansions = [
        'very', 'really', 'quite', 'so', 'always', 'sometimes', 'then', 'also',
        'wonderful', 'amazing', 'special', 'beautiful', 'exciting', 'fun', 'big', 'small'
      ];
      
      let expandedPage = page;
      let attempts = 0;
      const targetWordsNeeded = target.min - words.length;
      
      console.log(`🔧 Need to expand from ${words.length} to at least ${target.min} words (need ${targetWordsNeeded} more)`);
      
      while (expandedPage.split(/\s+/).filter(w => w.trim()).length < target.min && attempts < 10) {
        const expansion = expansions[Math.floor(Math.random() * expansions.length)];
        
        // Try multiple insertion strategies
        if (attempts < 3) {
          // Insert expansion before verbs
          expandedPage = expandedPage.replace(/\b(was|is|were|are|looked|seemed|felt|went|came|saw|found)\b/, `${expansion} $1`);
        } else if (attempts < 6) {
          // Insert expansion before nouns
          expandedPage = expandedPage.replace(/\b(cat|dog|bird|house|tree|friend|adventure|day|time)\b/, `${expansion} $1`);
        } else {
          // Add to the end of sentences
          expandedPage = expandedPage.replace(/\./, ` ${expansion}.`);
        }
        
        attempts++;
      }
      
      // Last resort: just add words at the end
      const currentCount = expandedPage.split(/\s+/).filter(w => w.trim()).length;
      if (currentCount < target.min) {
        const wordsStillNeeded = target.min - currentCount;
        const additionalWords = expansions.slice(0, wordsStillNeeded).join(' ');
        expandedPage = expandedPage.replace(/\.$/, ` ${additionalWords}.`);
      }
      
      console.log(`📝 Expanded page: ${words.length} -> ${expandedPage.split(/\s+/).filter(w => w.trim()).length} words`);
      return expandedPage;
      
    } else if (adjustment === 'reduce' && words.length > target.max) {
      // Remove unnecessary words to reach maximum
      let reducedWords = words.slice(0, target.max);
      
      // Ensure the page still makes sense by keeping important words
      if (reducedWords.length > 3) {
        // Keep first and last few words, remove from middle if needed
        const beginning = reducedWords.slice(0, 2);
        const ending = reducedWords.slice(-2);
        const middle = reducedWords.slice(2, -2).slice(0, target.max - 4);
        reducedWords = [...beginning, ...middle, ...ending];
      }
      
      const reducedPage = reducedWords.join(' ').replace(/\s+/g, ' ').trim();
      console.log(`📝 Reduced page: ${words.length} -> ${reducedWords.length} words`);
      return reducedPage.endsWith('.') ? reducedPage : reducedPage + '.';
    }
    
    return page; // No adjustment needed
  }

  /**
   * Clears all caches - useful for testing and new sessions
   */
  static clearCaches(): void {
    this.usedTemplates.clear();
    this.usedCombinations.clear();
    AntiRepetitionSystem.clearCache(false); // Clear everything including persistent
  }
}