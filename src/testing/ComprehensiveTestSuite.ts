// Comprehensive Test Suite - Main Orchestrator
import { StoryGenerationTester } from './modules/StoryGenerationTester';
import { UserInputTester } from './modules/UserInputTester';
import { ReadingLevelTester } from './modules/ReadingLevelTester';
import { SubscriptionTester } from './modules/SubscriptionTester';
import { PerformanceTester } from './modules/PerformanceTester';
import { SecurityTester } from '../utils/securityTesting';
import { MobileInteractionTester } from '../utils/mobileInteractionTester';
import { VisualDesignTestSuite } from './modules/VisualDesignTestSuite';
import { EfficiencyFirstRecommendationEngine } from './modules/EfficiencyFirstRecommendationEngine';
import { AutomatedFixSystem } from './modules/AutomatedFixSystem';
import { TestDataGenerator } from './utils/TestDataGenerator';
import { TestReporter } from './utils/TestReporter';
import { AccessibilityTester } from './modules/AccessibilityTester';
import { DataIntegrityTester } from './modules/DataIntegrityTester';
import { InternationalizationTester } from './modules/InternationalizationTester';
import { ContentQualityTester } from './modules/ContentQualityTester';
import { TechnicalExcellenceTester } from './modules/TechnicalExcellenceTester';
import { UserInfoFormTester } from './modules/UserInfoFormTester';

export interface TestSuiteResult {
  overall: {
    passed: number;
    failed: number;
    total: number;
    successRate: number;
    duration: number;
  };
  categories: {
    storyGeneration: TestCategoryResult;
    userInput: TestCategoryResult;
    readingLevel: TestCategoryResult;
    subscription: TestCategoryResult;
    performance: TestCategoryResult;
    security: TestCategoryResult;
    mobile: TestCategoryResult;
    design: TestCategoryResult;
    accessibility: TestCategoryResult;
    dataIntegrity: TestCategoryResult;
    internationalization: TestCategoryResult;
    contentQuality: TestCategoryResult;
    technicalExcellence: TestCategoryResult;
    userInfoForm: TestCategoryResult;
  };
  issues: TestIssue[];
  recommendations: string[];
}

export interface TestCategoryResult {
  name: string;
  passed: number;
  failed: number;
  total: number;
  successRate: number;
  duration: number;
  details: any[];
  score?: number;
  issues?: Array<{
    severity: string;
    message: string;
    suggestion: string;
    effortToImpact?: number;
    quickWin?: boolean;
  }>;
}

export interface TestIssue {
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  recommendation: string;
  testCase: string;
}

export class ComprehensiveTestSuite {
  private reporter: TestReporter;
  private startTime: number = 0;

  constructor() {
    this.reporter = new TestReporter();
  }

  async runFullTestSuite(): Promise<TestSuiteResult> {
    console.log('🚀 Starting Comprehensive Test Suite...');
    this.startTime = Date.now();

    const results: TestSuiteResult = {
      overall: { passed: 0, failed: 0, total: 0, successRate: 0, duration: 0 },
      categories: {
        storyGeneration: this.createEmptyCategory('Story Generation'),
        userInput: this.createEmptyCategory('User Input'),
        readingLevel: this.createEmptyCategory('Reading Level'),
        subscription: this.createEmptyCategory('Subscription'),
        performance: this.createEmptyCategory('Performance'),
        security: this.createEmptyCategory('Security'),
        mobile: this.createEmptyCategory('Mobile'),
        design: this.createEmptyCategory('Design'),
        accessibility: this.createEmptyCategory('Accessibility'),
        dataIntegrity: this.createEmptyCategory('Data Integrity'),
        internationalization: this.createEmptyCategory('Internationalization'),
        contentQuality: this.createEmptyCategory('Content Quality'),
        technicalExcellence: this.createEmptyCategory('Technical Excellence'),
        userInfoForm: this.createEmptyCategory('User Info Form')
      },
      issues: [],
      recommendations: []
    };

    try {
      // Phase 1: Core Functionality Tests
      console.log('\n📋 Phase 1: Core Functionality Tests');
      results.categories.storyGeneration = await this.runStoryGenerationTests();
      results.categories.userInput = await this.runUserInputTests();
      results.categories.readingLevel = await this.runReadingLevelTests();

      // Phase 2: User Experience Tests
      console.log('\n👥 Phase 2: User Experience Tests');
      results.categories.subscription = await this.runSubscriptionTests();
      results.categories.mobile = await this.runMobileTests();

      // Phase 3: Performance & Security Tests
      console.log('\n⚡ Phase 3: Performance & Security Tests');
      results.categories.performance = await this.runPerformanceTests();
      results.categories.security = await this.runSecurityTests();
      results.categories.design = await this.runDesignTests();

      // Phase 4: Professional Quality Assurance Tests
      console.log('\n🏆 Phase 4: Professional Quality Assurance Tests');
      results.categories.accessibility = await this.runAccessibilityTests();
      results.categories.dataIntegrity = await this.runDataIntegrityTests();
      results.categories.internationalization = await this.runInternationalizationTests();
      results.categories.contentQuality = await this.runContentQualityTests();
      results.categories.technicalExcellence = await this.runTechnicalExcellenceTests();
      results.categories.userInfoForm = await this.runUserInfoFormTests();

      // Calculate overall results
      this.calculateOverallResults(results);
      this.generateRecommendations(results);

      console.log('\n✅ Comprehensive Test Suite Complete!');
      console.log(`📊 Overall Success Rate: ${results.overall.successRate}%`);
      console.log(`⏱️ Total Duration: ${results.overall.duration}ms`);

      return results;

    } catch (error) {
      console.error('❌ Test Suite Failed:', error);
      throw error;
    }
  }

  private async runStoryGenerationTests(): Promise<TestCategoryResult> {
    const tester = new StoryGenerationTester();
    const startTime = Date.now();
    
    try {
      const result = await tester.runAllTests();
      return {
        name: 'Story Generation',
        passed: result.passed,
        failed: result.failed,
        total: result.total,
        successRate: Math.round((result.passed / result.total) * 100),
        duration: Date.now() - startTime,
        details: result.details
      };
    } catch (error) {
      console.error('Story Generation Tests Failed:', error);
      return this.createFailedCategory('Story Generation', Date.now() - startTime);
    }
  }

  private async runUserInputTests(): Promise<TestCategoryResult> {
    const tester = new UserInputTester();
    const startTime = Date.now();
    
    try {
      const result = await tester.runComprehensiveTests();
      return {
        name: 'User Input',
        passed: result.passed,
        failed: result.failed,
        total: result.total,
        successRate: Math.round((result.passed / result.total) * 100),
        duration: Date.now() - startTime,
        details: result.details
      };
    } catch (error) {
      console.error('User Input Tests Failed:', error);
      return this.createFailedCategory('User Input', Date.now() - startTime);
    }
  }

  private async runReadingLevelTests(): Promise<TestCategoryResult> {
    const tester = new ReadingLevelTester();
    const startTime = Date.now();
    
    try {
      const result = await tester.testAllLevels();
      return {
        name: 'Reading Level',
        passed: result.passed,
        failed: result.failed,
        total: result.total,
        successRate: Math.round((result.passed / result.total) * 100),
        duration: Date.now() - startTime,
        details: result.details
      };
    } catch (error) {
      console.error('Reading Level Tests Failed:', error);
      return this.createFailedCategory('Reading Level', Date.now() - startTime);
    }
  }

  private async runSubscriptionTests(): Promise<TestCategoryResult> {
    const tester = new SubscriptionTester();
    const startTime = Date.now();
    
    try {
      const result = await tester.testSubscriptionFeatures();
      return {
        name: 'Subscription',
        passed: result.passed,
        failed: result.failed,
        total: result.total,
        successRate: Math.round((result.passed / result.total) * 100),
        duration: Date.now() - startTime,
        details: result.details
      };
    } catch (error) {
      console.error('Subscription Tests Failed:', error);
      return this.createFailedCategory('Subscription', Date.now() - startTime);
    }
  }

  private async runPerformanceTests(): Promise<TestCategoryResult> {
    const tester = new PerformanceTester();
    const startTime = Date.now();
    
    try {
      const result = await tester.runPerformanceBenchmarks();
      return {
        name: 'Performance',
        passed: result.passed,
        failed: result.failed,
        total: result.total,
        successRate: Math.round((result.passed / result.total) * 100),
        duration: Date.now() - startTime,
        details: result.details
      };
    } catch (error) {
      console.error('Performance Tests Failed:', error);
      return this.createFailedCategory('Performance', Date.now() - startTime);
    }
  }

  private async runSecurityTests(): Promise<TestCategoryResult> {
    const startTime = Date.now();
    
    try {
      const result = await SecurityTester.runSecurityTests();
      return {
        name: 'Security',
        passed: result.passed,
        failed: result.failed,
        total: result.total,
        successRate: Math.round((result.passed / result.total) * 100),
        duration: Date.now() - startTime,
        details: result.results || []
      };
    } catch (error) {
      console.error('Security Tests Failed:', error);
      return this.createFailedCategory('Security', Date.now() - startTime);
    }
  }

  private async runMobileTests(): Promise<TestCategoryResult> {
    const startTime = Date.now();
    
    try {
      const result = await MobileInteractionTester.runFullTestSuite();
      const passed = result.interactiveWordTests.length > 0 && result.navigationTests.length > 0 && result.audioControlTests.length > 0 ? 1 : 0;
      const failed = passed ? 0 : 1;
      
      return {
        name: 'Mobile',
        passed,
        failed,
        total: 1,
        successRate: result.overallScore,
        duration: Date.now() - startTime,
        details: [result]
      };
    } catch (error) {
      console.error('Mobile Tests Failed:', error);
      return this.createFailedCategory('Mobile', Date.now() - startTime);
    }
  }

  private async runDesignTests(): Promise<TestCategoryResult> {
    try {
      return await VisualDesignTestSuite.runVisualDesignTests();
    } catch (error) {
      console.error('Design Tests Failed:', error);
      return this.createFailedCategory('Design', 0);
    }
  }

  private async runAccessibilityTests(): Promise<TestCategoryResult> {
    const startTime = Date.now();
    
    try {
      const tester = new AccessibilityTester();
      const result = await tester.runAccessibilityTests('AA');
      return {
        name: 'Accessibility',
        passed: result.passed,
        failed: result.failed,
        total: result.total,
        successRate: result.overallScore,
        duration: Date.now() - startTime,
        details: result.details,
        score: result.overallScore
      };
    } catch (error) {
      console.error('Accessibility Tests Failed:', error);
      return this.createFailedCategory('Accessibility', Date.now() - startTime);
    }
  }

  private async runDataIntegrityTests(): Promise<TestCategoryResult> {
    const startTime = Date.now();
    
    try {
      const result = await DataIntegrityTester.runDataIntegrityTests();
      return {
        name: 'Data Integrity',
        passed: result.passed ? 1 : 0,
        failed: result.failed ? 1 : 0,
        total: 1,
        successRate: result.score,
        duration: Date.now() - startTime,
        details: [result],
        score: result.score
      };
    } catch (error) {
      console.error('Data Integrity Tests Failed:', error);
      return this.createFailedCategory('Data Integrity', Date.now() - startTime);
    }
  }

  private async runInternationalizationTests(): Promise<TestCategoryResult> {
    const startTime = Date.now();
    
    try {
      const result = await InternationalizationTester.runInternationalizationTests();
      return {
        name: 'Internationalization',
        passed: result.passed ? 1 : 0,
        failed: result.failed ? 1 : 0,
        total: 1,
        successRate: result.score,
        duration: Date.now() - startTime,
        details: [result],
        score: result.score
      };
    } catch (error) {
      console.error('Internationalization Tests Failed:', error);
      return this.createFailedCategory('Internationalization', Date.now() - startTime);
    }
  }

  private async runContentQualityTests(): Promise<TestCategoryResult> {
    const startTime = Date.now();
    
    try {
      const result = await ContentQualityTester.runContentQualityTests();
      return {
        name: 'Content Quality',
        passed: result.passed ? 1 : 0,
        failed: result.failed ? 1 : 0,
        total: 1,
        successRate: result.score,
        duration: Date.now() - startTime,
        details: [result],
        score: result.score
      };
    } catch (error) {
      console.error('Content Quality Tests Failed:', error);
      return this.createFailedCategory('Content Quality', Date.now() - startTime);
    }
  }

  private async runTechnicalExcellenceTests(): Promise<TestCategoryResult> {
    const startTime = Date.now();
    
    try {
      const result = await TechnicalExcellenceTester.runTechnicalExcellenceTests();
      return {
        name: 'Technical Excellence',
        passed: result.passed ? 1 : 0,
        failed: result.failed ? 1 : 0,
        total: 1,
        successRate: result.score,
        duration: Date.now() - startTime,
        details: [result],
        score: result.score
      };
    } catch (error) {
      console.error('Technical Excellence Tests Failed:', error);
      return this.createFailedCategory('Technical Excellence', Date.now() - startTime);
    }
  }

  private async runUserInfoFormTests(): Promise<TestCategoryResult> {
    const startTime = Date.now();
    
    try {
      const result = await UserInfoFormTester.runUserInfoFormTests();
      return {
        name: 'User Info Form',
        passed: result.score >= 80 ? 1 : 0,
        failed: result.score < 80 ? 1 : 0,
        total: 1,
        successRate: result.score,
        duration: Date.now() - startTime,
        details: [result],
        score: result.score
      };
    } catch (error) {
      console.error('User Info Form Tests Failed:', error);
      return this.createFailedCategory('User Info Form', Date.now() - startTime);
    }
  }

  private createEmptyCategory(name: string): TestCategoryResult {
    return {
      name,
      passed: 0,
      failed: 0,
      total: 0,
      successRate: 0,
      duration: 0,
      details: []
    };
  }

  private createFailedCategory(name: string, duration: number): TestCategoryResult {
    return {
      name,
      passed: 0,
      failed: 1,
      total: 1,
      successRate: 0,
      duration,
      details: [{ error: 'Test category failed to execute' }]
    };
  }

  private calculateOverallResults(results: TestSuiteResult): void {
    const categories = Object.values(results.categories);
    
    results.overall.passed = categories.reduce((sum, cat) => sum + cat.passed, 0);
    results.overall.failed = categories.reduce((sum, cat) => sum + cat.failed, 0);
    results.overall.total = results.overall.passed + results.overall.failed;
    results.overall.successRate = results.overall.total > 0 
      ? Math.round((results.overall.passed / results.overall.total) * 100)
      : 0;
    results.overall.duration = Date.now() - this.startTime;
  }

  private generateRecommendations(results: TestSuiteResult): void {
    const recommendations: string[] = [];

    // Performance recommendations
    if (results.categories.performance.successRate < 80) {
      recommendations.push('Optimize story generation performance - consider caching strategies');
      recommendations.push('Implement lazy loading for images and non-critical components');
    }

    // Security recommendations
    if (results.categories.security.successRate < 90) {
      recommendations.push('Review input validation and sanitization');
      recommendations.push('Implement additional rate limiting measures');
    }

    // Mobile recommendations
    if (results.categories.mobile.successRate < 85) {
      recommendations.push('Improve touch target sizes for mobile devices');
      recommendations.push('Optimize mobile layout and interaction patterns');
    }

    // Overall recommendations
    if (results.overall.successRate < 85) {
      recommendations.push('Implement automated testing in CI/CD pipeline');
      recommendations.push('Set up monitoring and alerting for production issues');
    }

    results.recommendations = recommendations;
  }

  // Generate comprehensive report
  generateReport(results: TestSuiteResult): string {
    return this.reporter.generateComprehensiveReport(results);
  }
}

// Auto-run capability for development
if (typeof window !== 'undefined') {
  (window as any).runComprehensiveTests = async () => {
    const testSuite = new ComprehensiveTestSuite();
    const results = await testSuite.runFullTestSuite();
    console.log('📄 Full Report:', testSuite.generateReport(results));
    return results;
  };
  console.log('🧪 Comprehensive Test Suite available: runComprehensiveTests()');
}