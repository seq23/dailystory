// Reading Level Testing Module - MIGRATED TO AI GENERATION SYSTEM
import { AIGenerationTester } from './AIGenerationTester';
import { DifficultyManagerTester } from './DifficultyManagerTester';
import { FallbackSystemTester } from './FallbackSystemTester';

export interface ReadingLevelTestResult {
  passed: number;
  failed: number;
  total: number;
  details: Array<{
    level: string;
    userType: 'free' | 'premium';
    templateCount: number;
    vocabularyCompliance: number;
    issues: string[];
  }>;
}

export class ReadingLevelTester {
  async testAllLevels(): Promise<ReadingLevelTestResult> {
    console.log('📖 DEPRECATED: ReadingLevelTester - Redirecting to AI Generation System...');
    console.log('ℹ️ The system now uses AI generation instead of vocabulary validation.');
    
    // Run the new AI generation tests
    const aiTester = new AIGenerationTester();
    const difficultyTester = new DifficultyManagerTester();
    const fallbackTester = new FallbackSystemTester();

    const [aiResults, difficultyResults, fallbackResults] = await Promise.all([
      aiTester.testAIGenerationSystem(),
      difficultyTester.testDifficultySystem(),
      fallbackTester.testFallbackSystems()
    ]);

    // Convert new test results to legacy format for compatibility
    const results: ReadingLevelTestResult = {
      passed: aiResults.passed + difficultyResults.passed + fallbackResults.passed,
      failed: aiResults.failed + difficultyResults.failed + fallbackResults.failed,
      total: aiResults.total + difficultyResults.total + fallbackResults.total,
      details: [
        // Convert AI generation results
        ...aiResults.details.map(detail => ({
          level: `AI Generation (${detail.difficulty})`,
          userType: detail.userType,
          templateCount: 1, // AI generates dynamically
          vocabularyCompliance: detail.contentQuality,
          issues: detail.passed ? [] : detail.issues
        })),
        // Convert difficulty manager results
        ...difficultyResults.details.map(detail => ({
          level: 'Difficulty Management',
          userType: 'universal' as 'free' | 'premium',
          templateCount: 1,
          vocabularyCompliance: detail.confidence || 0,
          issues: detail.passed ? [] : detail.issues
        })),
        // Convert fallback system results
        ...fallbackResults.details.map(detail => ({
          level: 'Fallback System',
          userType: 'universal' as 'free' | 'premium',
          templateCount: 1,
          vocabularyCompliance: detail.contentQuality,
          issues: detail.passed ? [] : detail.issues
        }))
      ]
    };

    const successRate = Math.round((results.passed / results.total) * 100);
    console.log(`📊 AI Reading System: ${results.passed}/${results.total} passed (${successRate}%)`);
    return results;
  }

  // Legacy methods removed - system now uses AI generation
  // These methods were testing old vocabulary validation system
  // New system uses:
  // - AIGenerationTester for content generation quality
  // - DifficultyManagerTester for intelligent difficulty assignment  
  // - FallbackSystemTester for emergency content systems
}