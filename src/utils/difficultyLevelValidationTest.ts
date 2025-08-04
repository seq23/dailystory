// Comprehensive Difficulty Level Validation Test
// Tests word counts, vocabulary appropriateness, and seamless level switching

import { getDifficultyAppropriateTemplate, validateDifficultyCompliance } from '@/constants/difficultyAppropriateTemplates';
import { validateLevel1Sentence } from '@/constants/level1Vocabulary';
import { TemplateVariableProcessor } from '@/utils/templateVariableProcessor';
import { UserInfo, DifficultyLevel } from '@/types';

interface DifficultyTestResult {
  difficulty: DifficultyLevel;
  wordCountCompliance: {
    averageWords: number;
    expectedRange: { min: number; max: number };
    pagesInRange: number;
    totalPages: number;
    compliance: number; // percentage
  };
  vocabularyCompliance: {
    appropriateForLevel: boolean;
    levelViolations: string[];
  };
  contentQuality: {
    variety: number; // uniqueness score
    readability: boolean;
    ageAppropriate: boolean;
  };
  mobileOptimized: {
    noScrollRequired: boolean;
    averageLineLength: number;
    maxLineLength: number;
  };
}

interface SystemValidationReport {
  overallStatus: 'PASS' | 'FAIL' | 'WARNING';
  difficultyResults: DifficultyTestResult[];
  seamlessSwitching: {
    canSwitchBetweenLevels: boolean;
    layoutConsistent: boolean;
    performanceOptimal: boolean;
  };
  criticalIssues: string[];
  recommendations: string[];
}

export class DifficultyLevelValidationTest {
  
  /**
   * Runs comprehensive validation of all difficulty levels
   */
  static async runComprehensiveValidation(): Promise<SystemValidationReport> {
    console.log('🧪 Starting Comprehensive Difficulty Level Validation...');
    
    const testUser: UserInfo = {
      name: 'Alex',
      age: 8,
      grade: '2nd',
      nativeLanguage: 'en',
      learningGoal: 'improve-english-reading',
      avatar: { type: 'boy', skinTone: 'medium' },
      favoriteColor: 'blue',
      favoriteAnimal: 'cat',
      hobbies: 'reading',
      favoriteFood: 'pizza',
      specialRequest: 'adventure story'
    };
    
    const difficulties: DifficultyLevel[] = ['easy', 'medium', 'hard', 'expert'];
    const results: DifficultyTestResult[] = [];
    
    // Test each difficulty level
    for (const difficulty of difficulties) {
      console.log(`🎯 Testing ${difficulty.toUpperCase()} difficulty level...`);
      const result = await this.testDifficultyLevel(difficulty, testUser);
      results.push(result);
    }
    
    // Test seamless switching
    const seamlessTest = await this.testSeamlessSwitching(testUser);
    
    // Generate comprehensive report
    const report = this.generateValidationReport(results, seamlessTest);
    
    console.log('🎯 Comprehensive Validation Complete:', report);
    return report;
  }
  
  /**
   * Tests a specific difficulty level thoroughly
   */
  private static async testDifficultyLevel(
    difficulty: DifficultyLevel, 
    testUser: UserInfo
  ): Promise<DifficultyTestResult> {
    
    const testPages = 20; // Test with 20 pages to ensure consistency
    const wordCounts: number[] = [];
    const contentSamples: string[] = [];
    const levelViolations: string[] = [];
    
    // Generate multiple pages for this difficulty
    for (let i = 0; i < testPages; i++) {
      const template = getDifficultyAppropriateTemplate(difficulty);
      
      // Process template with user data
      const processedContent = await this.processTemplateWithUserData(
        template.join(' '),
        testUser,
        difficulty,
        i,
        testPages
      );
      
      contentSamples.push(processedContent);
      
      // Count words
      const wordCount = processedContent.split(/\s+/).filter(w => w.trim()).length;
      wordCounts.push(wordCount);
      
      // Check Level 1 vocabulary for easy difficulty
      if (difficulty === 'easy') {
        const level1Check = validateLevel1Sentence(processedContent);
        if (!level1Check.isValid) {
          levelViolations.push(`Page ${i + 1}: ${level1Check.invalidWords.join(', ')}`);
        }
      }
    }
    
    // Calculate metrics
    const averageWords = wordCounts.reduce((sum, count) => sum + count, 0) / wordCounts.length;
    const expectedRange = this.getExpectedWordRange(difficulty);
    const pagesInRange = wordCounts.filter(count => 
      count >= expectedRange.min && count <= expectedRange.max
    ).length;
    
    // Test content variety
    const uniqueContent = new Set(contentSamples);
    const variety = uniqueContent.size / contentSamples.length;
    
    // Test mobile optimization
    const lineLengths = contentSamples.map(content => content.length);
    const averageLineLength = lineLengths.reduce((sum, len) => sum + len, 0) / lineLengths.length;
    const maxLineLength = Math.max(...lineLengths);
    
    // Mobile scroll requirements by difficulty
    const scrollLimits = {
      easy: 40,    // Very short for young readers
      medium: 80,  // Moderate length
      hard: 120,   // Longer but manageable
      expert: 180  // Can require minimal scrolling
    };
    
    return {
      difficulty,
      wordCountCompliance: {
        averageWords: Math.round(averageWords * 100) / 100,
        expectedRange,
        pagesInRange,
        totalPages: testPages,
        compliance: Math.round((pagesInRange / testPages) * 100)
      },
      vocabularyCompliance: {
        appropriateForLevel: difficulty === 'easy' ? levelViolations.length === 0 : true,
        levelViolations
      },
      contentQuality: {
        variety: Math.round(variety * 100) / 100,
        readability: this.assessReadability(contentSamples, difficulty),
        ageAppropriate: this.assessAgeAppropriateness(contentSamples, difficulty)
      },
      mobileOptimized: {
        noScrollRequired: maxLineLength <= scrollLimits[difficulty],
        averageLineLength: Math.round(averageLineLength),
        maxLineLength
      }
    };
  }
  
  /**
   * Tests seamless switching between difficulty levels
   */
  private static async testSeamlessSwitching(testUser: UserInfo): Promise<{
    canSwitchBetweenLevels: boolean;
    layoutConsistent: boolean;
    performanceOptimal: boolean;
  }> {
    
    const difficulties: DifficultyLevel[] = ['easy', 'medium', 'hard', 'expert'];
    let switchingWorking = true;
    let layoutConsistent = true;
    let performanceOptimal = true;
    
    const switchTimes: number[] = [];
    
    // Test switching between all levels
    for (let i = 0; i < difficulties.length - 1; i++) {
      const fromDifficulty = difficulties[i];
      const toDifficulty = difficulties[i + 1];
      
      console.log(`🔄 Testing switch from ${fromDifficulty} to ${toDifficulty}...`);
      
      const startTime = Date.now();
      
      try {
        // Generate content for both levels
        const fromTemplate = getDifficultyAppropriateTemplate(fromDifficulty);
        const toTemplate = getDifficultyAppropriateTemplate(toDifficulty);
        
        const fromContent = await this.processTemplateWithUserData(
          fromTemplate.join(' '), testUser, fromDifficulty, 0, 1
        );
        const toContent = await this.processTemplateWithUserData(
          toTemplate.join(' '), testUser, toDifficulty, 0, 1
        );
        
        // Validate both are appropriate for their levels
        const fromValidation = validateDifficultyCompliance(fromContent, fromDifficulty);
        const toValidation = validateDifficultyCompliance(toContent, toDifficulty);
        
        if (!fromValidation.isValid || !toValidation.isValid) {
          switchingWorking = false;
        }
        
        // Check layout consistency (character length differences)
        const lengthDifference = Math.abs(fromContent.length - toContent.length);
        if (lengthDifference > 200) { // Arbitrary threshold for layout consistency
          layoutConsistent = false;
        }
        
      } catch (error) {
        console.error(`Error switching from ${fromDifficulty} to ${toDifficulty}:`, error);
        switchingWorking = false;
      }
      
      const switchTime = Date.now() - startTime;
      switchTimes.push(switchTime);
      
      // Performance should be under 100ms per switch
      if (switchTime > 100) {
        performanceOptimal = false;
      }
    }
    
    const averageSwitchTime = switchTimes.reduce((sum, time) => sum + time, 0) / switchTimes.length;
    console.log(`⚡ Average level switching time: ${averageSwitchTime.toFixed(1)}ms`);
    
    return {
      canSwitchBetweenLevels: switchingWorking,
      layoutConsistent,
      performanceOptimal
    };
  }
  
  /**
   * Process template with actual user data
   */
  private static async processTemplateWithUserData(
    template: string,
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    pageIndex: number,
    totalPages: number
  ): Promise<string> {
    
    const variableContext = {
      userInfo,
      difficulty,
      pageIndex,
      totalPages,
      storyElements: {
        name: [userInfo.name],
        animal: [userInfo.favoriteAnimal],
        color: [userInfo.favoriteColor],
        food: [userInfo.favoriteFood],
        object: ['treasure'],
        setting: ['forest']
      }
    };
    
    try {
      return await TemplateVariableProcessor.processTemplate(template, variableContext);
    } catch (error) {
      console.error('Template processing error:', error);
      // Fallback to simple replacement
      return template
        .replace(/{name}/g, userInfo.name)
        .replace(/{animal}/g, userInfo.favoriteAnimal)
        .replace(/{color}/g, userInfo.favoriteColor)
        .replace(/{food}/g, userInfo.favoriteFood)
        .replace(/{object}/g, 'treasure')
        .replace(/{setting}/g, 'forest')
        .replace(/{pronoun}/g, 'they');
    }
  }
  
  /**
   * Get expected word range for difficulty
   */
  private static getExpectedWordRange(difficulty: DifficultyLevel): { min: number; max: number } {
    const ranges = {
      easy: { min: 3, max: 6 },
      medium: { min: 6, max: 12 },
      hard: { min: 10, max: 18 },
      expert: { min: 15, max: 25 }
    };
    return ranges[difficulty];
  }
  
  /**
   * Assess readability for difficulty level
   */
  private static assessReadability(contentSamples: string[], difficulty: DifficultyLevel): boolean {
    // Simple readability check based on sentence complexity
    const averageWordsPerSentence = contentSamples.reduce((sum, content) => {
      const sentences = content.split(/[.!?]+/).filter(s => s.trim());
      const words = content.split(/\s+/).filter(w => w.trim());
      return sum + (words.length / Math.max(sentences.length, 1));
    }, 0) / contentSamples.length;
    
    const readabilityThresholds = {
      easy: 5,    // Max 5 words per sentence
      medium: 8,  // Max 8 words per sentence
      hard: 12,   // Max 12 words per sentence
      expert: 20  // Max 20 words per sentence
    };
    
    return averageWordsPerSentence <= readabilityThresholds[difficulty];
  }
  
  /**
   * Assess age appropriateness
   */
  private static assessAgeAppropriateness(contentSamples: string[], difficulty: DifficultyLevel): boolean {
    // Check for age-appropriate themes and vocabulary
    const inappropriateWords = ['violence', 'scary', 'death', 'hate', 'angry'];
    const hasInappropriateContent = contentSamples.some(content => 
      inappropriateWords.some(word => content.toLowerCase().includes(word))
    );
    
    return !hasInappropriateContent;
  }
  
  /**
   * Generate comprehensive validation report
   */
  private static generateValidationReport(
    difficultyResults: DifficultyTestResult[],
    seamlessTest: any
  ): SystemValidationReport {
    
    const criticalIssues: string[] = [];
    const recommendations: string[] = [];
    
    // Check each difficulty level
    difficultyResults.forEach(result => {
      if (result.wordCountCompliance.compliance < 90) {
        criticalIssues.push(
          `${result.difficulty} word count compliance: ${result.wordCountCompliance.compliance}% (target: 90%+)`
        );
      }
      
      if (result.difficulty === 'easy' && !result.vocabularyCompliance.appropriateForLevel) {
        criticalIssues.push(
          `Easy level contains non-Level 1 vocabulary: ${result.vocabularyCompliance.levelViolations.length} violations`
        );
      }
      
      if (!result.mobileOptimized.noScrollRequired && result.difficulty !== 'expert') {
        criticalIssues.push(
          `${result.difficulty} requires scrolling (max length: ${result.mobileOptimized.maxLineLength})`
        );
      }
      
      if (result.contentQuality.variety < 0.8) {
        recommendations.push(
          `Increase ${result.difficulty} template variety (current: ${(result.contentQuality.variety * 100).toFixed(0)}%)`
        );
      }
    });
    
    // Check seamless switching
    if (!seamlessTest.canSwitchBetweenLevels) {
      criticalIssues.push('Seamless level switching is not working');
    }
    
    if (!seamlessTest.performanceOptimal) {
      recommendations.push('Optimize level switching performance');
    }
    
    // Determine overall status
    let overallStatus: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';
    if (criticalIssues.length > 0) {
      overallStatus = criticalIssues.some(issue => 
        issue.includes('word count') || 
        issue.includes('vocabulary') || 
        issue.includes('switching')
      ) ? 'FAIL' : 'WARNING';
    }
    
    if (criticalIssues.length === 0 && recommendations.length === 0) {
      recommendations.push('✅ All difficulty levels are working perfectly!');
      recommendations.push('✅ Seamless switching is optimized');
      recommendations.push('✅ Mobile layout is consistent across all levels');
    }
    
    return {
      overallStatus,
      difficultyResults,
      seamlessSwitching: seamlessTest,
      criticalIssues,
      recommendations
    };
  }
  
  /**
   * Quick validation for production readiness
   */
  static async quickValidation(): Promise<{ ready: boolean; issues: string[] }> {
    const issues: string[] = [];
    
    try {
      // Test each difficulty can generate content
      const difficulties: DifficultyLevel[] = ['easy', 'medium', 'hard', 'expert'];
      
      for (const difficulty of difficulties) {
        const template = getDifficultyAppropriateTemplate(difficulty);
        const sampleContent = template[0].replace(/{name}/g, 'Alex');
        
        const validation = validateDifficultyCompliance(sampleContent, difficulty);
        if (!validation.isValid) {
          issues.push(`${difficulty} template word count out of range`);
        }
      }
      
      // Test Level 1 vocabulary for easy
      const easyTemplate = getDifficultyAppropriateTemplate('easy');
      const easyContent = easyTemplate[0].replace(/{name}/g, 'Alex').replace(/{animal}/g, 'cat');
      const level1Check = validateLevel1Sentence(easyContent);
      
      if (!level1Check.isValid) {
        issues.push('Easy difficulty contains non-Level 1 vocabulary');
      }
      
    } catch (error) {
      issues.push('Template system error: ' + error.message);
    }
    
    return {
      ready: issues.length === 0,
      issues
    };
  }
}