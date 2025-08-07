// Difficulty Manager Testing Module
import { DifficultyManager } from '../../services/difficultyManager';
import { TestDataGenerator } from '../utils/TestDataGenerator';
import { UserInfo, DifficultyLevel } from '../../types';

export interface DifficultyTestResult {
  passed: number;
  failed: number;
  total: number;
  details: Array<{
    testCase: string;
    passed: boolean;
    expectedDifficulty?: DifficultyLevel;
    actualDifficulty?: DifficultyLevel;
    confidence?: number;
    issues: string[];
  }>;
}

export class DifficultyManagerTester {
  private testDataGenerator: TestDataGenerator;

  constructor() {
    this.testDataGenerator = new TestDataGenerator();
  }

  async testDifficultySystem(): Promise<DifficultyTestResult> {
    console.log('🎯 Testing Difficulty Management System...');
    
    const results: DifficultyTestResult = {
      passed: 0,
      failed: 0,
      total: 0,
      details: []
    };

    // Test age-based difficulty suggestions
    await this.testAgeBased(results);
    
    // Test grade-based difficulty suggestions
    await this.testGradeBased(results);
    
    // Test difficulty storage and retrieval
    await this.testDifficultyStorage(results);
    
    // Test progression paths
    await this.testProgressionPaths(results);
    
    // Test author voice availability
    await this.testAuthorVoiceAvailability(results);

    console.log(`🎯 Difficulty Manager: ${results.passed}/${results.total} passed`);
    return results;
  }

  private async testAgeBased(results: DifficultyTestResult): Promise<void> {
    const testCases = [
      { age: 4, expectedDifficulty: 'easy' as DifficultyLevel },
      { age: 6, expectedDifficulty: 'easy' as DifficultyLevel },
      { age: 8, expectedDifficulty: 'medium' as DifficultyLevel },
      { age: 12, expectedDifficulty: 'hard' as DifficultyLevel },
      { age: 16, expectedDifficulty: 'hard' as DifficultyLevel }
    ];

    for (const testCase of testCases) {
      const testResult = {
        testCase: `Age-based difficulty for age ${testCase.age}`,
        passed: false,
        expectedDifficulty: testCase.expectedDifficulty,
        actualDifficulty: undefined as DifficultyLevel | undefined,
        confidence: 0,
        issues: [] as string[]
      };

      try {
        const userInfo = this.testDataGenerator.generateRandomUser();
        userInfo.age = testCase.age;

        const profile = DifficultyManager.suggestDifficulty(userInfo);
        testResult.actualDifficulty = profile.suggestedDifficulty;
        testResult.confidence = profile.confidence;

        if (profile.suggestedDifficulty !== testCase.expectedDifficulty) {
          testResult.issues.push(`Expected ${testCase.expectedDifficulty}, got ${profile.suggestedDifficulty}`);
        }

        if (profile.confidence < 60) {
          testResult.issues.push(`Low confidence: ${profile.confidence}%`);
        }

        testResult.passed = testResult.issues.length === 0;

      } catch (error) {
        testResult.issues.push(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      results.details.push(testResult);
      results.total++;
      
      if (testResult.passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    }
  }

  private async testGradeBased(results: DifficultyTestResult): Promise<void> {
    const testCases = [
      { grade: 'PreK', expectedDifficulty: 'easy' as DifficultyLevel },
      { grade: 'K', expectedDifficulty: 'easy' as DifficultyLevel },
      { grade: '2nd', expectedDifficulty: 'medium' as DifficultyLevel },
      { grade: '4th', expectedDifficulty: 'hard' as DifficultyLevel },
      { grade: '6th+', expectedDifficulty: 'hard' as DifficultyLevel }
    ];

    for (const testCase of testCases) {
      const testResult = {
        testCase: `Grade-based difficulty for ${testCase.grade}`,
        passed: false,
        expectedDifficulty: testCase.expectedDifficulty,
        actualDifficulty: undefined as DifficultyLevel | undefined,
        confidence: 0,
        issues: [] as string[]
      };

      try {
        const userInfo = this.testDataGenerator.generateRandomUser();
        userInfo.grade = testCase.grade as any;

        const profile = DifficultyManager.suggestDifficulty(userInfo);
        testResult.actualDifficulty = profile.suggestedDifficulty;
        testResult.confidence = profile.confidence;

        // Allow for some flexibility in grade-based suggestions
        const allowedDifficulties = this.getAllowedDifficultiesForGrade(testCase.grade);
        if (!allowedDifficulties.includes(profile.suggestedDifficulty)) {
          testResult.issues.push(`Expected one of ${allowedDifficulties.join(', ')}, got ${profile.suggestedDifficulty}`);
        }

        testResult.passed = testResult.issues.length === 0;

      } catch (error) {
        testResult.issues.push(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      results.details.push(testResult);
      results.total++;
      
      if (testResult.passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    }
  }

  private async testDifficultyStorage(results: DifficultyTestResult): Promise<void> {
    const testResult = {
      testCase: 'Difficulty storage and retrieval',
      passed: false,
      issues: [] as string[]
    };

    try {
      const userInfo = this.testDataGenerator.generateRandomUser();
      const userId = 'test-user-123';
      const testDifficulty: DifficultyLevel = 'medium';

        // Test storing difficulty
        DifficultyManager.storeDifficulty(userId, testDifficulty, userInfo);

        // Test retrieving difficulty
        const storedDifficulty = DifficultyManager.getStoredDifficulty(userId);

        if (storedDifficulty !== testDifficulty) {
          testResult.issues.push(`Storage failed: expected ${testDifficulty}, got ${storedDifficulty}`);
        }

        // Test final difficulty determination
        const finalDifficulty = DifficultyManager.getFinalDifficulty(userInfo);
      if (finalDifficulty.difficulty !== testDifficulty) {
        testResult.issues.push(`Final difficulty wrong: expected ${testDifficulty}, got ${finalDifficulty.difficulty}`);
      }

      if (!finalDifficulty.isStored) {
        testResult.issues.push('isStored flag should be true for stored difficulty');
      }

      testResult.passed = testResult.issues.length === 0;

    } catch (error) {
      testResult.issues.push(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    results.details.push(testResult);
    results.total++;
    
    if (testResult.passed) {
      results.passed++;
    } else {
      results.failed++;
    }
  }

  private async testProgressionPaths(results: DifficultyTestResult): Promise<void> {
    const progressionTests = [
      { current: 'easy' as DifficultyLevel, expected: 'medium' as DifficultyLevel },
      { current: 'medium' as DifficultyLevel, expected: 'hard' as DifficultyLevel },
      { current: 'hard' as DifficultyLevel, expected: null }
    ];

    for (const test of progressionTests) {
      const testResult = {
        testCase: `Progression from ${test.current}`,
        passed: false,
        issues: [] as string[]
      };

      try {
        const nextLevel = DifficultyManager.getProgressionPath(test.current);

        if (nextLevel !== test.expected) {
          testResult.issues.push(`Expected ${test.expected || 'null'}, got ${nextLevel || 'null'}`);
        }

        testResult.passed = testResult.issues.length === 0;

      } catch (error) {
        testResult.issues.push(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      results.details.push(testResult);
      results.total++;
      
      if (testResult.passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    }
  }

  private async testAuthorVoiceAvailability(results: DifficultyTestResult): Promise<void> {
    const testCases: DifficultyLevel[] = ['easy', 'medium', 'hard'];

    for (const difficulty of testCases) {
      const testResult = {
        testCase: `Author voice availability for ${difficulty}`,
        passed: false,
        issues: [] as string[]
      };

      try {
        const hasAuthorVoice = DifficultyManager.hasAuthorVoice(difficulty);
        
        // Based on the current system, author voice should be available for all except beginner
        const expectedAvailability = difficulty !== 'beginner';
        
        if (hasAuthorVoice !== expectedAvailability) {
          testResult.issues.push(`Expected ${expectedAvailability}, got ${hasAuthorVoice}`);
        }

        testResult.passed = testResult.issues.length === 0;

      } catch (error) {
        testResult.issues.push(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      results.details.push(testResult);
      results.total++;
      
      if (testResult.passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    }
  }

  private getAllowedDifficultiesForGrade(grade: string): DifficultyLevel[] {
    switch (grade) {
      case 'PreK':
      case 'K':
        return ['beginner', 'easy'];
      case '1st':
      case '2nd':
        return ['easy', 'medium'];
      case '3rd':
      case '4th':
        return ['medium', 'hard'];
      case '5th':
      case '6th+':
        return ['hard', 'expert'];
      default:
        return ['beginner', 'easy', 'medium', 'hard', 'expert'];
    }
  }
}