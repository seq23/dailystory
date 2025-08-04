import { UserInfo, DifficultyLevel, Story } from "@/types";
import { SmartInputParser, ParsedTag } from "./smartInputParser";
import { STORY_LANGUAGES, getLanguageTemplates } from "@/constants/storyLanguages";
import { MultilingualStoryRequest, SupportedLanguage } from "@/types/multilingual";
import { StoryQualityChecker } from "@/utils/storyQualityChecker";
import { validateAndFixGrammar, GrammarValidator } from "@/utils/grammarValidator";
import { NameFormatter } from "@/utils/nameFormatter";
import { AntiRepetitionSystem } from "@/utils/antiRepetitionSystem";
import { EnhancedAntiRepetitionEngine } from "@/services/enhancedAntiRepetitionEngine";
import { IntelligentTemplateSelector } from "@/services/intelligentTemplateSelector";
import { getRobustTemplate } from "@/constants/robustStoryTemplates";
import { getDifficultyAppropriateTemplate, validateDifficultyCompliance } from "@/constants/difficultyAppropriateTemplates";
import { TemplateVariableProcessor } from "@/utils/templateVariableProcessor";
import { UserInputDistributor } from "@/services/userInputDistributor";
import { LanguagePreferenceService } from "./languagePreferenceService";
import { validateLevel1Sentence } from "@/constants/level1Vocabulary";
import { APP_CONFIG } from "@/constants/app";
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
  private static templateHistory = new Map<string, number>(); // Track template usage frequency
  private static pageTemplateTracker = new Map<number, string>(); // Track which template was used for each page

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
    // CRITICAL: Determine if user is premium to enforce language restrictions
    const { SubscriptionManager } = await import('./subscriptionManager');
    const isPremium = await SubscriptionManager.isPremiumUser();
    console.log(`🔒 User premium status: ${isPremium ? 'PREMIUM' : 'FREE'}`);
    
    const languageConfig = LanguagePreferenceService.getLanguageConfig(userInfo, isPremium);
    
    // CRITICAL: Validate language configuration for cross-device compatibility
    const languageValidation = LanguagePreferenceService.validateLanguageConfiguration(userInfo, isPremium);
    if (!languageValidation.isValid) {
      console.warn('⚠️ Language configuration issues:', languageValidation.issues);
    }
    
    // CRITICAL: Validate cross-device compatibility
    const deviceValidation = LanguagePreferenceService.validateCrossDeviceCompatibility(userInfo, isPremium);
    if (!deviceValidation.isValid) {
      console.warn('⚠️ Cross-device compatibility issues:', deviceValidation.deviceChecks);
    }
    
    const fullConfig: ConsolidatedStoryConfig = {
      pageCount: APP_CONFIG.DEFAULT_PAGE_COUNT,
      useSmartParsing: true,
      antiRepetition: true,
      culturalAdaptation: true,
      ...config,
      // CRITICAL: Always use English for free users, respect preferences for premium
      language: isPremium ? languageConfig.storyLanguage : 'en'
    };

    console.log('🎯 Consolidated Story Generation Starting', {
      userInfo: userInfo.name,
      difficulty,
      config: fullConfig
    });

    // Phase 8: Initialize anti-repetition system and clear cache for new story (unless preserving for continuation)
    // CRITICAL FIX: Always clear template caches for fresh template selection, even when preserving content anti-repetition
    if (!fullConfig.preserveAntiRepetition) {
      await AntiRepetitionSystem.initialize();
      AntiRepetitionSystem.clearCache(true); // Preserve persistent signatures for mobile efficiency
      // Always clear template caches to enable smart selection
      this.clearCaches();
    } else {
      // Even when preserving anti-repetition, clear template caches for variety
      this.usedTemplates.clear();
      this.usedCombinations.clear();
      this.templateHistory.clear();
      this.pageTemplateTracker.clear();
      console.log('✅ Template caches cleared while preserving content anti-repetition');
    }

    try {
      console.log(`🎯 Starting consolidated story generation for ${userInfo.name} (${difficulty} level)`);
      console.log(`📊 Using updated TTS-optimized word count standards: Easy(3-6), Medium(5-9), Hard(7-13), Expert(9-16) words per page`);
      console.log(`🌍 Target story language: ${fullConfig.language}`);
      console.log(`🎯 Available templates for ${fullConfig.language}/${difficulty}:`, getLanguageTemplates(fullConfig.language, difficulty).length);

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

      // Phase 1 & 5: Generate story pages using ROBUST template system
      await UserInputDistributor.initialize(processedUserInfo);
      
      // CRITICAL UPDATE: Use robust template system with tier-specific intelligence
      const storyLanguage = fullConfig.language;
      const tier: 'free' | 'premium' = isPremium ? 'premium' : 'free';
      console.log(`🎯 Using ${tier.toUpperCase()} tier robust template system for ${storyLanguage} (${difficulty})`);
      
      // Initialize intelligent template selector
      const templateConfig = {
        tier,
        difficulty,
        lookbackPages: tier === 'premium' ? 10 : 5,
        cooldownPages: tier === 'premium' ? 15 : 8,
        userId: processedUserInfo.name || 'anonymous',
        sessionId: generateUniqueId()
      };
      
      const pages: string[] = [];
      const extractedElements = SmartInputParser.extractStoryElements(parsedElements);
      
      // Phase 3: Enhanced element distribution and selection with ROBUST template source
      const totalPages = fullConfig.pageCount;
      console.log(`🎯 Generating ${totalPages} pages using ROBUST ${tier} tier system`);
      
      for (let i = 0; i < totalPages; i++) {
        // CRITICAL FIX: Use difficulty-appropriate templates that enforce proper word counts
        const templateResult = getDifficultyAppropriateTemplate(difficulty);
        let template = templateResult.join(' '); // Convert array to string
        
        console.log(`📝 Page ${i + 1}: Selected ${difficulty} template with appropriate word count`);
        
        // Enhanced anti-repetition check using new engine
        const antiRepetitionConfig = {
          tier,
          userId: templateConfig.userId,
          sessionId: templateConfig.sessionId,
          preserveContext: fullConfig.preserveAntiRepetition
        };
        
        // Phase 1: Comprehensive template variable processing
        const variableContext = {
          userInfo: processedUserInfo,
          difficulty,
          pageIndex: i,
          totalPages: fullConfig.pageCount,
          storyElements: extractedElements
        };
        
        let processedPage = await TemplateVariableProcessor.processTemplate(template, variableContext);
        
        // CRITICAL: Validate content matches difficulty expectations  
        const difficultyValidation = validateDifficultyCompliance(processedPage, difficulty);
        if (!difficultyValidation.isValid) {
          console.log(`⚠️ Page ${i + 1}: Word count ${difficultyValidation.wordCount} outside ${difficulty} range (${difficultyValidation.expectedRange.min}-${difficultyValidation.expectedRange.max})`);
          processedPage = this.generateDifficultyAppropriateContent(processedUserInfo, i, totalPages, difficulty);
        }
        
        // Phase 8: Enhanced anti-repetition system checks
        if (fullConfig.antiRepetition) {
          const repetitionCheck = await EnhancedAntiRepetitionEngine.checkContentRepetition(
            processedPage,
            antiRepetitionConfig,
            difficulty,
            { pageIndex: i, totalPages, userInfo: processedUserInfo }
          );
          
          if (repetitionCheck.isDuplicate) {
            console.log(`🚫 Page ${i + 1}: ${repetitionCheck.reason} (similarity: ${(repetitionCheck.similarity * 100).toFixed(1)}%)`);
            
            // Generate difficulty-appropriate replacement
            processedPage = this.generateDifficultyAppropriateContent(processedUserInfo, i, totalPages, difficulty);
            console.log(`🔧 Generated ${difficulty}-appropriate replacement for page ${i + 1}`);
          } else {
            console.log(`✅ Page ${i + 1}: ${repetitionCheck.reason}`);
          }
          
          // Add approved content to tracking (legacy system for compatibility)
          await AntiRepetitionSystem.addContent(processedPage);
        }
        
        pages.push(processedPage);
      }

      // Phase 2: Difficulty-appropriate grammar validation and vocabulary check
      console.log(`🔍 Pre-grammar validation pages:`, pages);
      let improvedPages = pages.map(page => this.lightGrammarValidation(page));
      
      // CRITICAL FIX: Only apply Level 1 vocabulary validation to EASY difficulty
      // Other difficulties should use age-appropriate vocabulary
      if (difficulty === 'easy') {
        improvedPages = improvedPages.map((page, index) => {
          const validation = validateLevel1Sentence(page);
          if (!validation.isValid) {
            console.log(`⚠️ Page ${index + 1} contains non-Level 1 words:`, validation.invalidWords);
            console.log(`🔧 Replacing with Level 1 fallback for page ${index + 1}`);
            return this.generateDifficultyAppropriateContent(processedUserInfo, index, pages.length, 'easy');
          }
          return page;
        });
      } else {
        // For medium, hard, expert - ensure content matches difficulty expectations
        improvedPages = improvedPages.map((page, index) => {
          const wordCount = page.split(/\s+/).filter(w => w.trim()).length;
          const expectedRange = this.getWordCountRange(difficulty);
          
          if (wordCount < expectedRange.min || wordCount > expectedRange.max) {
            console.log(`⚠️ Page ${index + 1} word count (${wordCount}) outside ${difficulty} range (${expectedRange.min}-${expectedRange.max})`);
            return this.generateDifficultyAppropriateContent(processedUserInfo, index, pages.length, difficulty);
          }
          return page;
        });
      }
      
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
    
    // CRITICAL FIX: Check for incomplete sentences and template replacement failures
    // Fix sentences that end with "a " or "an " (incomplete articles)
    fixed = fixed.replace(/\s+(a|an)\s*$/gi, '');
    
    // Fix sentences that end with incomplete words or hanging prepositions
    fixed = fixed.replace(/\s+(to|with|in|on|at|by|for|of)\s*$/gi, '');
    
    // Remove any remaining template variables that weren't processed
    fixed = fixed.replace(/\{[^}]*\}/g, '');
    
    // Fix obvious incomplete sentences - if sentence is too short, make it complete
    if (fixed.trim().length < 10 && !fixed.includes('.')) {
      const words = fixed.trim().split(/\s+/);
      if (words.length >= 2) {
        // Try to complete common incomplete patterns
        if (words[words.length - 1] === 'a' || words[words.length - 1] === 'an') {
          words.pop(); // Remove incomplete article
          fixed = words.join(' ') + '.';
        } else if (words.length < 3) {
          // Add a simple completion for very short sentences
          fixed = fixed.trim() + ' happily.';
        }
      }
    }
    
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
    
    // Fix double spaces
    fixed = fixed.replace(/\s+/g, ' ');
    
    // Ensure proper sentence ending
    fixed = fixed.trim();
    if (fixed && !fixed.match(/[.!?]$/)) {
      fixed += '.';
    }
    
    // Final check: If sentence is still too short or incomplete, provide a fallback
    if (fixed.trim().length < 5) {
      fixed = 'The adventure continues.';
    }
    
    console.log('✅ Post-grammar validation:', fixed);
    return fixed;
  }

  /**
   * Smart template selection to prevent repetition
   */
  private static selectSmartTemplate(
    templates: string[], 
    pageIndex: number, 
    totalPages: number, 
    difficulty: DifficultyLevel
  ): string {
    const availableTemplates = [...templates];
    
    // For first few pages, use templates in order
    if (pageIndex < templates.length) {
      return templates[pageIndex];
    }
    
    // For continuation, avoid recently used templates
    const recentlyUsed = new Set<number>();
    const lookbackRange = Math.min(3, templates.length - 1); // Look back 3 pages or templates-1
    
    for (let i = Math.max(0, pageIndex - lookbackRange); i < pageIndex; i++) {
      const usedTemplateId = this.pageTemplateTracker.get(i);
      if (usedTemplateId) {
        const templateIndex = parseInt(usedTemplateId.split('_')[1]);
        recentlyUsed.add(templateIndex);
      }
    }
    
    // Find templates that haven't been used recently
    const availableIndices = [];
    for (let i = 0; i < templates.length; i++) {
      if (!recentlyUsed.has(i)) {
        availableIndices.push(i);
      }
    }
    
    // If all templates were used recently, use least recently used
    if (availableIndices.length === 0) {
      console.log(`⚠️ All templates recently used for page ${pageIndex + 1}, using least recent`);
      return templates[pageIndex % templates.length];
    }
    
    // Select randomly from available templates
    const selectedIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    console.log(`✅ Page ${pageIndex + 1}: Selected template ${selectedIndex} (avoided: ${Array.from(recentlyUsed).join(', ')})`);
    
    return templates[selectedIndex];
  }

  /**
   * Determines if template variation should be applied
   */
  private static shouldApplyVariation(
    template: string, 
    pageIndex: number, 
    templateId: string
  ): boolean {
    // Always apply variation for repeated template usage
    const usageCount = this.templateHistory.get(templateId) || 0;
    this.templateHistory.set(templateId, usageCount + 1);
    
    return usageCount > 0; // Apply variation if template has been used before
  }

  /**
   * Enhanced template variation system with meaningful changes
   */
  private static generateEnhancedTemplateVariation(
    template: string,
    pageIndex: number,
    userInfo: UserInfo,
    difficulty: DifficultyLevel
  ): string {
    const variations = [];
    
    // Context-aware variations based on story position
    const storyPosition = pageIndex < 3 ? 'beginning' : pageIndex > 7 ? 'ending' : 'middle';
    
    // Sentence structure variations
    if (template.includes(' is ')) {
      variations.push(template.replace(' is ', ' becomes '));
      variations.push(template.replace(' is ', ' seems '));
    }
    
    if (template.includes(' goes ')) {
      variations.push(template.replace(' goes ', ' travels '));
      variations.push(template.replace(' goes ', ' moves '));
    }
    
    if (template.includes(' sees ')) {
      variations.push(template.replace(' sees ', ' notices '));
      variations.push(template.replace(' sees ', ' discovers '));
    }
    
    if (template.includes(' runs ')) {
      variations.push(template.replace(' runs ', ' dashes '));
      variations.push(template.replace(' runs ', ' hurries '));
    }
    
    // Add contextual elements based on story position
    if (storyPosition === 'beginning') {
      if (template.includes('{name}') && !template.toLowerCase().includes('suddenly')) {
        variations.push(template.replace('{name}', 'Suddenly, {name}'));
      }
    } else if (storyPosition === 'middle') {
      if (template.includes('{name}') && !template.toLowerCase().includes('then')) {
        variations.push(template.replace('{name}', 'Then {name}'));
      }
    } else if (storyPosition === 'ending') {
      if (template.includes('{name}') && !template.toLowerCase().includes('finally')) {
        variations.push(template.replace('{name}', 'Finally, {name}'));
      }
    }
    
    // Difficulty-specific variations
    if (difficulty === 'easy') {
      // Keep variations simple for easy level
      variations.push(template.replace(/^/, 'Now '));
    } else if (difficulty === 'medium' || difficulty === 'hard') {
      // More complex variations for higher levels
      if (!template.toLowerCase().includes('meanwhile')) {
        variations.push(`Meanwhile, ${template.toLowerCase()}`);
      }
    }
    
    // Return best variation or original if no good variations
    const filteredVariations = variations.filter(v => 
      v !== template && 
      v.length > 0 && 
      !v.includes('undefined') &&
      this.isValidVariation(v, difficulty)
    );
    
    if (filteredVariations.length > 0) {
      const selected = filteredVariations[Math.floor(Math.random() * filteredVariations.length)];
      console.log(`🔄 Template variation applied: "${template}" → "${selected}"`);
      return selected;
    }
    
    return template;
  }

  /**
   * Validates if a template variation is appropriate for the difficulty level
   */
  private static isValidVariation(variation: string, difficulty: DifficultyLevel): boolean {
    const wordCount = variation.split(/\s+/).length;
    
    // Check word count limits per difficulty
    switch (difficulty) {
      case 'easy':
        return wordCount <= 6; // Keep easy variations short
      case 'medium':
        return wordCount <= 12;
      case 'hard':
        return wordCount <= 18;
      case 'expert':
        return wordCount <= 25;
      default:
        return true;
    }
  }

  /**
   * Clears template tracking caches - optimized for mobile performance
   */
  static clearCaches(): void {
    this.usedTemplates.clear();
    this.usedCombinations.clear();
    this.templateHistory.clear();
    this.pageTemplateTracker.clear();
    
    // Clear anti-repetition system cache as well
    AntiRepetitionSystem.clearCache(true); // Preserve persistent for mobile battery efficiency
    
    console.log('✅ Template and anti-repetition caches cleared');
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
    
    // Use Level 1 vocabulary for easy difficulty
    const fallbackPages = difficulty === 'easy' ? [
      `${name} sees a ${animal}.`,
      `The ${animal} is ${color}.`,
      `${name} says hello.`,
      `They play together.`,
      `${name} is happy.`,
      `They are good friends.`
    ] : [
      `Once upon a time, there was a brave child named ${name}.`,
      `${name} had a special friend, a ${color} ${animal}.`,
      `One day, ${name} and the ${animal} went on an adventure.`,
      `They discovered something amazing together.`,
      `${name} learned that friendship makes everything better.`,
      `And they all lived happily ever after!`
    ];

    const story: Story = {
      id: generateUniqueId(),
      title: difficulty === 'easy' ? `${name}'s Fun Day` : `${name}'s Adventure`,
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
   * Phase 9: Generates a properly capitalized story title using Level 1 vocabulary for easy
   */
  private static generateStoryTitle(userInfo: UserInfo, difficulty: DifficultyLevel): string {
    const name = NameFormatter.capitalize(userInfo.name);
    const themes = {
      easy: ['Fun Day', 'Good Friend', 'Play Time'], // Level 1 vocabulary only
      medium: ['Quest', 'Discovery', 'Journey'],
      hard: ['Epic Adventure', 'Great Discovery', 'Heroic Quest'],
      expert: ['Legendary Journey', 'Cosmic Adventure', 'Ultimate Quest']
    };
    
    const themeOptions = themes[difficulty] || themes.easy;
    const theme = themeOptions[Math.floor(Math.random() * themeOptions.length)];
    
    return `${name}'s ${theme}`;
  }

  /**
   * Gets a template identifier for tracking
   */
  private static getTemplateIdentifier(
    difficulty: DifficultyLevel,
    language: string
  ): string {
    const templateCount = this.templateHistory.size;
    const uniqueTemplates = new Set(Array.from(this.pageTemplateTracker.values())).size;
    return `${language}_${difficulty}_enhanced_t${templateCount}_u${uniqueTemplates}`;
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
   * Generates contextual fallback content using Level 1 vocabulary for easy difficulty
   */
  private static generateContextualFallback(userInfo: UserInfo, pageIndex: number, totalPages: number): string {
    const name = userInfo.name;
    const animal = userInfo.favoriteAnimal || 'cat';
    
    // Use Level 1 vocabulary for easy fallbacks
    const easyFallbacks = [
      `${name} sees a ${animal}.`,
      `The ${animal} runs fast.`,
      `${name} goes to play.`,
      `They have fun.`,
      `${name} helps the ${animal}.`,
      `They are good friends.`,
      `${name} is happy.`,
      `The ${animal} is happy too.`
    ];
    
    // Complex fallbacks for other difficulties
    const complexFallbacks = [
      `${name} discovers something wonderful about ${animal}s.`,
      `The adventure leads ${name} to a new discovery.`,
      `${name} learns an important lesson.`,
      `A new challenge appears for ${name} to solve.`,
      `${name} shows kindness to a new friend.`,
      `The adventure takes an unexpected turn for ${name}.`,
      `${name} uses creativity to solve a problem.`,
      `Something magical happens in ${name}'s story.`
    ];
    
    // Use simple fallbacks for easy difficulty, complex ones for others
    const fallbacks = easyFallbacks; // Always use Level 1 vocabulary
    return fallbacks[pageIndex % fallbacks.length];
  }

  /**
   * Adjusts page word count to meet difficulty requirements
   */
  private static adjustPageWordCount(
    originalPage: string, 
    difficulty: DifficultyLevel, 
    adjustmentType: 'expand' | 'reduce'
  ): string {
    console.log(`🔧 Adjusting page word count: ${adjustmentType} for ${difficulty}`);
    console.log(`📝 Original: "${originalPage}"`);
    
    // First, fix any incomplete sentences
    let adjustedPage = originalPage;
    
    // Remove incomplete endings like "a " or "an "
    adjustedPage = adjustedPage.replace(/\s+(a|an)\s*$/gi, '');
    
    // Complete obviously incomplete sentences
    if (adjustedPage.trim().endsWith(' sees')) {
      adjustedPage = adjustedPage.replace(/\s+sees\s*$/, ' sees something amazing');
    }
    if (adjustedPage.trim().endsWith(' finds')) {
      adjustedPage = adjustedPage.replace(/\s+finds\s*$/, ' finds a treasure');
    }
    if (adjustedPage.trim().endsWith(' meets')) {
      adjustedPage = adjustedPage.replace(/\s+meets\s*$/, ' meets a friend');
    }
    
    const expectedWordCounts = {
      easy: { min: 3, max: 6 },
      medium: { min: 5, max: 9 },
      hard: { min: 7, max: 13 },
      expert: { min: 9, max: 16 }
    };
    
    const expected = expectedWordCounts[difficulty];
    
    if (adjustmentType === 'expand') {
      // Add appropriate expansions for the difficulty level
      const expansions = {
        easy: [' very much', ' happily', ' today', ' together', ' nicely'],
        medium: [' with great joy', ' in the bright sunshine', ' feeling very happy', ' with new friends'],
        hard: [' with tremendous excitement', ' discovering something wonderful', ' feeling incredibly grateful'],
        expert: [' experiencing profound happiness', ' with extraordinary determination', ' achieving remarkable success']
      };
      
      const difficultyExpansions = expansions[difficulty] || expansions.easy;
      const randomExpansion = difficultyExpansions[Math.floor(Math.random() * difficultyExpansions.length)];
      
      // Add expansion before the final punctuation
      adjustedPage = adjustedPage.replace(/([.!?])$/, `${randomExpansion}$1`);
      
    } else if (adjustmentType === 'reduce') {
      // Remove extra words while keeping meaning
      adjustedPage = adjustedPage
        .replace(/\s+(very|really|quite|so|extremely|incredibly)\s+/gi, ' ')
        .replace(/\s*,\s*[^,]*$/, '.');
    }
    
    // Ensure minimum word count is met even after reduction
    const finalWordCount = adjustedPage.split(/\s+/).filter(w => w.trim()).length;
    if (finalWordCount < expected.min) {
      adjustedPage = adjustedPage.replace(/([.!?])$/, ' happily$1');
    }
    
    // Final safety check - if still incomplete, provide complete sentence
    if (adjustedPage.trim().length < 10 || !adjustedPage.match(/[.!?]$/)) {
      adjustedPage = `The adventure continues with joy.`;
    }
    
    console.log(`✅ Adjusted: "${adjustedPage}"`);
    return adjustedPage;
  }

  /**
   * Get word count range for each difficulty level
   */
  private static getWordCountRange(difficulty: DifficultyLevel): { min: number; max: number } {
    const ranges = {
      easy: { min: 3, max: 6 },      // Level 1: 3-6 words per page
      medium: { min: 6, max: 12 },   // Level 2: 6-12 words per page  
      hard: { min: 10, max: 18 },    // Level 3: 10-18 words per page
      expert: { min: 15, max: 25 }   // Level 4: 15-25 words per page
    };
    return ranges[difficulty];
  }

  /**
   * Generate difficulty-appropriate content that matches reading level expectations
   */
  private static generateDifficultyAppropriateContent(
    userInfo: UserInfo, 
    pageIndex: number, 
    totalPages: number, 
    difficulty: DifficultyLevel
  ): string {
    const name = userInfo.name || 'Alex';
    const animal = userInfo.favoriteAnimal || 'cat';
    const color = userInfo.favoriteColor || 'blue';
    const food = userInfo.favoriteFood || 'pizza';
    
    const templates = {
      easy: [
        `${name} sees a ${animal}.`,
        `The ${animal} is ${color}.`,
        `${name} likes the ${animal}.`,
        `They play together.`,
        `${name} feels happy.`
      ],
      medium: [
        `${name} discovers a magical ${color} ${animal} in the garden.`,
        `The friendly ${animal} shows ${name} a secret hiding place.`,
        `Together they share delicious ${food} under the bright sun.`,
        `${name} learns important lessons about friendship and kindness.`,
        `The wonderful adventure brings joy to both new friends.`
      ],
      hard: [
        `${name} embarked on an extraordinary journey to find the legendary ${color} ${animal}.`,
        `Along the winding path, ${name} encountered various challenges that tested courage and determination.`,
        `The wise ${animal} shared ancient wisdom about the importance of perseverance and compassion.`,
        `Through teamwork and understanding, ${name} and the ${animal} overcame every obstacle together.`,
        `This remarkable adventure transformed ${name} into a confident and caring individual.`
      ],
      expert: [
        `${name} meticulously planned an expedition to investigate the mysterious phenomena surrounding the ${color} ${animal}.`,
        `The comprehensive research revealed fascinating interconnections between the ${animal}'s behavior and environmental factors.`,
        `Through systematic observation and careful analysis, ${name} developed innovative solutions to complex ecological challenges.`,
        `The collaborative partnership with the ${animal} demonstrated the profound impact of interspecies communication and cooperation.`,
        `This transformative experience fundamentally changed ${name}'s understanding of the delicate balance within natural ecosystems.`
      ]
    };
    
    const difficultyTemplates = templates[difficulty];
    const templateIndex = pageIndex % difficultyTemplates.length;
    return difficultyTemplates[templateIndex];
  }

}