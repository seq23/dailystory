import { UserInfo, DifficultyLevel } from "@/types";
import { SupportedLanguage } from "@/types/multilingual";
import { ConsolidatedStoryGenerator } from "@/services/consolidatedStoryGenerator";
import { FreeUserStoryService } from "@/services/freeUserStoryService";
import { PremiumStoryService } from "@/services/premiumStoryService";
import { StoryQualityChecker } from "./storyQualityChecker";
import { AntiRepetitionSystem } from "./antiRepetitionSystem";

interface QualityTestResult {
  testName: string;
  passed: boolean;
  details: string;
  actualValue?: any;
  expectedValue?: any;
}

interface ComprehensiveTestReport {
  overallPassed: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: QualityTestResult[];
  summary: string[];
}

export class ComprehensiveQualityTester {
  private static createTestUser(language: SupportedLanguage = 'en'): UserInfo {
    return {
      name: "Test User",
      age: 8,
      grade: "2nd",
      nativeLanguage: language,
      learningGoal: "improve-english-reading",
      avatar: { type: "boy", skinTone: "medium" },
      favoriteColor: "blue",
      favoriteAnimal: "dog",
      hobbies: "reading",
      favoriteFood: "pizza",
      specialRequest: "adventure story"
    };
  }

  private static createTranslationContext() {
    return {
      originalInputs: {
        name: "Usuario de Prueba",
        favoriteAnimal: "perro",
        hobbies: "lectura"
      },
      translatedInputs: {
        name: "Test User",
        favoriteAnimal: "dog", 
        hobbies: "reading"
      }
    };
  }

  private static getExpectedWordCount(difficulty: DifficultyLevel): { min: number; max: number } {
    const ranges = {
      easy: { min: 3, max: 8 },
      medium: { min: 8, max: 25 },
      hard: { min: 20, max: 45 },
      expert: { min: 35, max: 80 }
    };
    return ranges[difficulty];
  }

  static async runComprehensiveTest(): Promise<ComprehensiveTestReport> {
    console.log("🧪 Starting Comprehensive Quality Test Suite...");
    
    const results: QualityTestResult[] = [];
    
    // Test 1: Word Count Standards for All Difficulty Levels
    for (const difficulty of ['easy', 'medium', 'hard', 'expert'] as DifficultyLevel[]) {
      const result = await this.testWordCountStandards(difficulty);
      results.push(result);
    }

    // Test 2: Quality Enforcement
    const qualityResult = await this.testQualityEnforcement();
    results.push(qualityResult);

    // Test 3: Anti-Repetition System
    const antiRepetitionResult = await this.testAntiRepetitionSystem();
    results.push(antiRepetitionResult);

    // Test 4: Language Configuration (English Stories)
    const languageResult = await this.testLanguageConfiguration();
    results.push(languageResult);

    // Test 5: Free User Story Generation
    const freeUserResult = await this.testFreeUserGeneration();
    results.push(freeUserResult);

    // Test 6: Premium User Story Generation
    const premiumUserResult = await this.testPremiumUserGeneration();
    results.push(premiumUserResult);

    // Test 7: Multi-Language UI Support (English Stories)
    const multiLanguageResult = await this.testMultiLanguageSupport();
    results.push(multiLanguageResult);

    // Test 8: Story Structure Validation
    const structureResult = await this.testStoryStructure();
    results.push(structureResult);

    // Calculate overall results
    const passedTests = results.filter(r => r.passed).length;
    const failedTests = results.length - passedTests;
    const overallPassed = failedTests === 0;

    const summary = [
      `📊 Test Execution Complete`,
      `✅ Passed: ${passedTests}/${results.length}`,
      `❌ Failed: ${failedTests}/${results.length}`,
      `🎯 Overall Result: ${overallPassed ? 'PASSED' : 'FAILED'}`
    ];

    if (failedTests > 0) {
      summary.push(`❗ Failed Tests:`);
      results.filter(r => !r.passed).forEach(r => {
        summary.push(`   - ${r.testName}: ${r.details}`);
      });
    }

    return {
      overallPassed,
      totalTests: results.length,
      passedTests,
      failedTests,
      results,
      summary
    };
  }

  private static async testWordCountStandards(difficulty: DifficultyLevel): Promise<QualityTestResult> {
    try {
      const user = this.createTestUser();
      const expectedRange = this.getExpectedWordCount(difficulty);
      
      const result = await ConsolidatedStoryGenerator.generateStory(user, difficulty);
      const story = result.story;
      
      const wordCounts = story.segments.map(segment => 
        segment.text.trim().split(/\s+/).length
      );
      
      const allWithinRange = wordCounts.every(count => 
        count >= expectedRange.min && count <= expectedRange.max
      );
      
      return {
        testName: `Word Count Standards (${difficulty})`,
        passed: allWithinRange,
        details: allWithinRange 
          ? `All pages within range ${expectedRange.min}-${expectedRange.max} words`
          : `Some pages outside range. Counts: ${wordCounts.join(', ')}`,
        actualValue: wordCounts,
        expectedValue: expectedRange
      };
    } catch (error) {
      return {
        testName: `Word Count Standards (${difficulty})`,
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private static async testQualityEnforcement(): Promise<QualityTestResult> {
    try {
      const user = this.createTestUser();
      const result = await ConsolidatedStoryGenerator.generateStory(user, 'medium');
      
      const qualityCheck = StoryQualityChecker.checkStoryQuality(
        result.story.segments.map(s => s.text),
        'medium'
      );
      
      const hasGoodQuality = qualityCheck.isValid && qualityCheck.score >= 0.7;
      
      return {
        testName: "Quality Enforcement",
        passed: hasGoodQuality,
        details: hasGoodQuality 
          ? `Quality score: ${qualityCheck.score.toFixed(2)}`
          : `Quality issues: ${qualityCheck.issues.map(i => i.message).join(', ')}`,
        actualValue: qualityCheck.score,
        expectedValue: 0.7
      };
    } catch (error) {
      return {
        testName: "Quality Enforcement",
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private static async testAntiRepetitionSystem(): Promise<QualityTestResult> {
    try {
      const user = this.createTestUser();
      
      // Generate multiple stories to test anti-repetition
      const results = await Promise.all([
        ConsolidatedStoryGenerator.generateStory(user, 'easy'),
        ConsolidatedStoryGenerator.generateStory(user, 'easy'),
        ConsolidatedStoryGenerator.generateStory(user, 'easy')
      ]);
      
      const stories = results.map(r => r.story.segments.map(s => s.text).join(' '));
      
      // Check if stories are different enough
      let diversityScore = 0;
      for (let i = 0; i < stories.length; i++) {
        for (let j = i + 1; j < stories.length; j++) {
          const similarity = this.calculateSimilarity(stories[i], stories[j]);
          diversityScore += (1 - similarity);
        }
      }
      diversityScore = diversityScore / ((stories.length * (stories.length - 1)) / 2);
      
      const isUnique = diversityScore > 0.5; // 50% diversity threshold
      
      return {
        testName: "Anti-Repetition System",
        passed: isUnique,
        details: isUnique 
          ? `Stories are sufficiently unique (${(diversityScore * 100).toFixed(1)}% diversity)`
          : `Stories too similar (${(diversityScore * 100).toFixed(1)}% diversity)`,
        actualValue: diversityScore,
        expectedValue: 0.5
      };
    } catch (error) {
      return {
        testName: "Anti-Repetition System",
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private static async testLanguageConfiguration(): Promise<QualityTestResult> {
    try {
      const spanishUser = this.createTestUser('es');
      const result = await ConsolidatedStoryGenerator.generateStory(spanishUser, 'medium');
      
      // Check if story content is in English (should be regardless of user's native language)
      const storyText = result.story.segments.map(s => s.text).join(' ');
      const isEnglish = this.detectEnglishContent(storyText);
      
      return {
        testName: "Language Configuration",
        passed: isEnglish,
        details: isEnglish 
          ? "Story generated in English as expected"
          : "Story not in English",
        actualValue: isEnglish ? "English" : "Non-English",
        expectedValue: "English"
      };
    } catch (error) {
      return {
        testName: "Language Configuration",
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private static async testFreeUserGeneration(): Promise<QualityTestResult> {
    try {
      const user = this.createTestUser();
      const translationContext = this.createTranslationContext();
      
      const result = await FreeUserStoryService.generateStoryWithCaching(
        user, 
        'medium', 
        translationContext
      );
      
      const hasValidStory = result.story && 
                           result.story.segments && 
                           result.story.segments.length > 0;
      
      return {
        testName: "Free User Generation",
        passed: hasValidStory,
        details: hasValidStory 
          ? `Generated story with ${result.story.segments.length} pages`
          : "Failed to generate valid story",
        actualValue: result.story?.segments?.length || 0,
        expectedValue: "> 0"
      };
    } catch (error) {
      return {
        testName: "Free User Generation",
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private static async testPremiumUserGeneration(): Promise<QualityTestResult> {
    try {
      const user = this.createTestUser();
      const translationContext = this.createTranslationContext();
      
      const library = await PremiumStoryService.getOrCreateStoryLibrary(user, translationContext);
      const hasLibrary = library && library.length > 0;
      
      return {
        testName: "Premium User Generation",
        passed: hasLibrary,
        details: hasLibrary 
          ? `Generated story library with ${library.length} entries`
          : "Failed to generate story library",
        actualValue: library?.length || 0,
        expectedValue: "> 0"
      };
    } catch (error) {
      return {
        testName: "Premium User Generation",
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private static async testMultiLanguageSupport(): Promise<QualityTestResult> {
    try {
      const languages: SupportedLanguage[] = ['en', 'es', 'fr', 'ar'];
      const results = await Promise.all(
        languages.map(async (lang) => {
          const user = this.createTestUser(lang);
          const result = await ConsolidatedStoryGenerator.generateStory(user, 'easy');
          return {
            language: lang,
            success: result.story.segments.length > 0,
            isEnglish: this.detectEnglishContent(result.story.segments.map(s => s.text).join(' '))
          };
        })
      );
      
      const allSuccessful = results.every(r => r.success);
      const allEnglishStories = results.every(r => r.isEnglish);
      
      return {
        testName: "Multi-Language Support",
        passed: allSuccessful && allEnglishStories,
        details: allSuccessful && allEnglishStories
          ? "All languages generate English stories successfully"
          : `Issues: ${results.filter(r => !r.success || !r.isEnglish).map(r => r.language).join(', ')}`,
        actualValue: results,
        expectedValue: "All successful with English stories"
      };
    } catch (error) {
      return {
        testName: "Multi-Language Support",
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private static async testStoryStructure(): Promise<QualityTestResult> {
    try {
      const user = this.createTestUser();
      const result = await ConsolidatedStoryGenerator.generateStory(user, 'medium');
      
      const hasTitle = result.story.title && result.story.title.length > 0;
      const hasSegments = result.story.segments && result.story.segments.length >= 3;
      const hasValidSegments = result.story.segments.every(s => s.text && s.text.length > 0);
      
      const isValid = hasTitle && hasSegments && hasValidSegments;
      
      return {
        testName: "Story Structure",
        passed: isValid,
        details: isValid 
          ? `Valid structure: title + ${result.story.segments.length} segments`
          : `Structure issues: title=${hasTitle}, segments=${hasSegments}, valid=${hasValidSegments}`,
        actualValue: {
          title: hasTitle,
          segmentCount: result.story.segments.length,
          validSegments: hasValidSegments
        },
        expectedValue: "Title + 3+ valid segments"
      };
    } catch (error) {
      return {
        testName: "Story Structure",
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private static calculateSimilarity(str1: string, str2: string): number {
    const words1 = new Set(str1.toLowerCase().split(/\s+/));
    const words2 = new Set(str2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  private static detectEnglishContent(text: string): boolean {
    // Simple English detection - check for common English words
    const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const words = text.toLowerCase().split(/\s+/);
    const englishWordCount = words.filter(word => englishWords.includes(word)).length;
    
    return englishWordCount >= 3; // At least 3 common English words
  }

  static async generateTestReport(): Promise<string> {
    const report = await this.runComprehensiveTest();
    
    let output = `
# Comprehensive Quality Test Report
Generated: ${new Date().toISOString()}

## Summary
- **Overall Result**: ${report.overallPassed ? '✅ PASSED' : '❌ FAILED'}
- **Total Tests**: ${report.totalTests}
- **Passed**: ${report.passedTests}
- **Failed**: ${report.failedTests}

## Test Results

`;

    report.results.forEach((result, index) => {
      output += `### ${index + 1}. ${result.testName}
- **Status**: ${result.passed ? '✅ PASSED' : '❌ FAILED'}
- **Details**: ${result.details}
${result.actualValue ? `- **Actual**: ${JSON.stringify(result.actualValue)}` : ''}
${result.expectedValue ? `- **Expected**: ${JSON.stringify(result.expectedValue)}` : ''}

`;
    });

    output += `## Summary Messages
${report.summary.join('\n')}

`;

    return output;
  }
}