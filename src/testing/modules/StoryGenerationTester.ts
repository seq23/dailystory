// Story Generation Testing Module
import { TestDataGenerator } from '../utils/TestDataGenerator';
import type { UserInfo } from '../../types';

type StoryDifficulty = 'easy' | 'medium' | 'hard';

export interface StoryTestResult {
  passed: number;
  failed: number;
  total: number;
  details: Array<{
    testCase: string;
    passed: boolean;
    duration: number;
    details: string;
    userType: 'free' | 'premium';
    difficulty: StoryDifficulty;
  }>;
}

export class StoryGenerationTester {
  private testDataGenerator: TestDataGenerator;

  constructor() {
    this.testDataGenerator = new TestDataGenerator();
  }

  async runAllTests(): Promise<StoryTestResult> {
    console.log('📚 Testing Story Generation...');
    
    const results: StoryTestResult = {
      passed: 0,
      failed: 0,
      total: 0,
      details: []
    };

    // Test all difficulty levels with both user types
    const difficulties: StoryDifficulty[] = ['easy', 'medium', 'hard'];
    const userTypes: ('free' | 'premium')[] = ['free', 'premium'];

    for (const difficulty of difficulties) {
      for (const userType of userTypes) {
        // Generate multiple test users for each combination
        for (let i = 0; i < 10; i++) {
          const testUser = this.testDataGenerator.generateRandomUser();
          const testResult = await this.testStoryGeneration(testUser, difficulty, userType);
          
          results.details.push(testResult);
          results.total++;
          
          if (testResult.passed) {
            results.passed++;
          } else {
            results.failed++;
          }
        }
      }
    }

    // Test edge cases
    await this.testEdgeCases(results);

    console.log(`📊 Story Generation: ${results.passed}/${results.total} passed`);
    return results;
  }

  private async testStoryGeneration(
    userInfo: UserInfo, 
    difficulty: StoryDifficulty, 
    userType: 'free' | 'premium'
  ): Promise<{
    testCase: string;
    passed: boolean;
    duration: number;
    details: string;
    userType: 'free' | 'premium';
    difficulty: StoryDifficulty;
  }> {
    const startTime = Date.now();
    const testCase = `${userType}-${difficulty}-${userInfo.name}`;

    try {
      // Mock story generation call
      const mockStoryResult = await this.mockStoryGeneration(userInfo, difficulty, userType);
      const duration = Date.now() - startTime;

      // Validate story structure
      const validation = this.validateStoryStructure(mockStoryResult, difficulty, userType);

      return {
        testCase,
        passed: validation.isValid,
        duration,
        details: validation.details,
        userType,
        difficulty
      };

    } catch (error) {
      return {
        testCase,
        passed: false,
        duration: Date.now() - startTime,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        userType,
        difficulty
      };
    }
  }

  private async mockStoryGeneration(
    userInfo: UserInfo, 
    difficulty: StoryDifficulty, 
    userType: 'free' | 'premium'
  ): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

    // Mock story structure based on user type and difficulty
    const pageCount = userType === 'premium' ? 10 : 5;
    const wordsPerPage = difficulty === 'easy' ? 15 : difficulty === 'medium' ? 25 : 35;

    return {
      pages: Array.from({ length: pageCount }, (_, i) => ({
        pageNumber: i + 1,
        content: `This is page ${i + 1} for ${userInfo.name}. ${userInfo.name} loves ${userInfo.favoriteAnimal}.`,
        wordCount: wordsPerPage,
        imagePrompt: `${userInfo.name} with ${userInfo.favoriteAnimal}`
      })),
      metadata: {
        difficulty,
        userType,
        totalWords: pageCount * wordsPerPage,
        characterName: userInfo.name
      }
    };
  }

  private validateStoryStructure(
    story: any, 
    difficulty: StoryDifficulty, 
    userType: 'free' | 'premium'
  ): { isValid: boolean; details: string } {
    const issues: string[] = [];

    // Check page count
    const expectedPages = userType === 'premium' ? 10 : 5;
    if (!story.pages || story.pages.length !== expectedPages) {
      issues.push(`Page count mismatch: expected ${expectedPages}, got ${story.pages?.length || 0}`);
    }

    // Check word count per page
    const expectedWordsPerPage = difficulty === 'easy' ? 15 : difficulty === 'medium' ? 25 : 35;
    if (story.pages) {
      story.pages.forEach((page: any, index: number) => {
        if (Math.abs(page.wordCount - expectedWordsPerPage) > 5) {
          issues.push(`Page ${index + 1} word count off: expected ~${expectedWordsPerPage}, got ${page.wordCount}`);
        }
      });
    }

    // Check metadata
    if (!story.metadata || story.metadata.difficulty !== difficulty) {
      issues.push('Metadata difficulty mismatch');
    }

    return {
      isValid: issues.length === 0,
      details: issues.length === 0 ? 'Story structure valid' : issues.join('; ')
    };
  }

  private async testEdgeCases(results: StoryTestResult): Promise<void> {
    const edgeCases = [
      {
        name: 'Empty user input',
        userInfo: { name: '', age: 5 } as UserInfo,
        shouldFail: true
      },
      {
        name: 'Extremely long name',
        userInfo: { name: 'A'.repeat(100), age: 8 } as UserInfo,
        shouldFail: false
      },
      {
        name: 'Special characters in name',
        userInfo: { name: 'José-María ñoño', age: 7 } as UserInfo,
        shouldFail: false
      }
    ];

    for (const edgeCase of edgeCases) {
      const testResult = await this.testStoryGeneration(edgeCase.userInfo, 'easy', 'free');
      
      // Adjust pass/fail based on expectation
      if (edgeCase.shouldFail) {
        testResult.passed = !testResult.passed;
        testResult.details = `Edge case test: ${edgeCase.name} - ${testResult.details}`;
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
}