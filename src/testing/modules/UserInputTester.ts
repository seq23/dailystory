// User Input Testing Module
import { TestDataGenerator } from '../utils/TestDataGenerator';
import type { UserInfo } from '../../types';

export interface UserInputTestResult {
  passed: number;
  failed: number;
  total: number;
  details: Array<{
    testCase: string;
    passed: boolean;
    input: Partial<UserInfo>;
    validationResult: string;
    category: string;
  }>;
}

export class UserInputTester {
  private testDataGenerator: TestDataGenerator;

  constructor() {
    this.testDataGenerator = new TestDataGenerator();
  }

  async runComprehensiveTests(): Promise<UserInputTestResult> {
    console.log('📝 Testing User Input Validation...');
    
    const results: UserInputTestResult = {
      passed: 0,
      failed: 0,
      total: 0,
      details: []
    };

    // Test valid inputs
    await this.testValidInputs(results);
    
    // Test edge cases
    await this.testEdgeCases(results);
    
    // Test invalid inputs
    await this.testInvalidInputs(results);
    
    // Test boundary values
    await this.testBoundaryValues(results);

    console.log(`📊 User Input: ${results.passed}/${results.total} passed`);
    return results;
  }

  private async testValidInputs(results: UserInputTestResult): Promise<void> {
    // Generate 50 valid user inputs
    for (let i = 0; i < 50; i++) {
      const validUser = this.testDataGenerator.generateRandomUser();
      const testResult = this.validateUserInput(validUser, 'Valid Input');
      
      results.details.push(testResult);
      results.total++;
      
      if (testResult.passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    }
  }

  private async testEdgeCases(results: UserInputTestResult): Promise<void> {
    const edgeCases = [
      {
        name: 'Minimum age',
        input: { name: 'Alex', age: 3, grade: 'PreK' },
        expected: true
      },
      {
        name: 'Maximum age',
        input: { name: 'Alex', age: 18, grade: '6th+' },
        expected: true
      },
      {
        name: 'Name with emojis',
        input: { name: 'Alex 🚀', age: 8, grade: '2nd' },
        expected: true
      },
      {
        name: 'Name with accents',
        input: { name: 'José María', age: 9, grade: '3rd' },
        expected: true
      },
      {
        name: 'Very long name',
        input: { name: 'Alexander Montgomery Fitzgerald III', age: 10, grade: '4th' },
        expected: true
      },
      {
        name: 'Single character name',
        input: { name: 'A', age: 6, grade: '1st' },
        expected: true
      }
    ];

    edgeCases.forEach(edgeCase => {
      const testResult = this.validateUserInput(edgeCase.input as UserInfo, 'Edge Case');
      testResult.testCase = edgeCase.name;
      testResult.passed = testResult.passed === edgeCase.expected;
      
      results.details.push(testResult);
      results.total++;
      
      if (testResult.passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    });
  }

  private async testInvalidInputs(results: UserInputTestResult): Promise<void> {
    const invalidCases = [
      {
        name: 'Empty name',
        input: { name: '', age: 8, grade: '2nd' },
        expected: false
      },
      {
        name: 'Age too young',
        input: { name: 'Alex', age: 2, grade: 'PreK' },
        expected: false
      },
      {
        name: 'Age too old',
        input: { name: 'Alex', age: 25, grade: '6th+' },
        expected: false
      },
      {
        name: 'Negative age',
        input: { name: 'Alex', age: -5, grade: '1st' },
        expected: false
      },
      {
        name: 'Non-numeric age',
        input: { name: 'Alex', age: 'eight' as any, grade: '2nd' },
        expected: false
      },
      {
        name: 'Missing grade',
        input: { name: 'Alex', age: 8, grade: undefined as any },
        expected: false
      }
    ];

    invalidCases.forEach(invalidCase => {
      const testResult = this.validateUserInput(invalidCase.input as UserInfo, 'Invalid Input');
      testResult.testCase = invalidCase.name;
      testResult.passed = testResult.passed === invalidCase.expected;
      
      results.details.push(testResult);
      results.total++;
      
      if (testResult.passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    });
  }

  private async testBoundaryValues(results: UserInputTestResult): Promise<void> {
    const boundaryTests = [
      { name: 'Age 3 (minimum)', age: 3, expected: true },
      { name: 'Age 4', age: 4, expected: true },
      { name: 'Age 18 (maximum)', age: 18, expected: true },
      { name: 'Age 17', age: 17, expected: true },
      { name: 'Name length 1', testName: 'A', expected: true },
      { name: 'Name length 50', testName: 'A'.repeat(50), expected: true },
      { name: 'Name length 100', testName: 'A'.repeat(100), expected: false }
    ];

    boundaryTests.forEach(test => {
      const input: Partial<UserInfo> = {
        name: test.name?.includes('Name') ? (test as any).testName : 'TestUser',
        age: test.age || 8,
        grade: '2nd'
      };

      const testResult = this.validateUserInput(input as UserInfo, 'Boundary Test');
      testResult.testCase = test.name;
      testResult.passed = testResult.passed === test.expected;
      
      results.details.push(testResult);
      results.total++;
      
      if (testResult.passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    });
  }

  private validateUserInput(userInfo: UserInfo, category: string): {
    testCase: string;
    passed: boolean;
    input: Partial<UserInfo>;
    validationResult: string;
    category: string;
  } {
    const issues: string[] = [];

    // Name validation
    if (!userInfo.name || userInfo.name.trim().length === 0) {
      issues.push('Name is required');
    } else if (userInfo.name.length > 50) {
      issues.push('Name is too long');
    }

    // Age validation
    if (!userInfo.age || typeof userInfo.age !== 'number') {
      issues.push('Age must be a number');
    } else if (userInfo.age < 3 || userInfo.age > 18) {
      issues.push('Age must be between 3 and 18');
    }

    // Grade validation
    const validGrades = ['PreK', 'K', '1st', '2nd', '3rd', '4th', '5th', '6th+'];
    if (!userInfo.grade || !validGrades.includes(userInfo.grade)) {
      issues.push('Invalid grade level');
    }

    // Avatar validation (if provided)
    if (userInfo.avatar) {
      if (!['boy', 'girl'].includes(userInfo.avatar.type)) {
        issues.push('Invalid avatar type');
      }
      const validSkinTones = ['pale', 'light', 'medium', 'olive', 'dark'];
      if (!validSkinTones.includes(userInfo.avatar.skinTone)) {
        issues.push('Invalid skin tone');
      }
    }

    const isValid = issues.length === 0;

    return {
      testCase: `${category}: ${userInfo.name || 'unnamed'} (${userInfo.age})`,
      passed: isValid,
      input: userInfo,
      validationResult: isValid ? 'Valid' : issues.join(', '),
      category
    };
  }
}