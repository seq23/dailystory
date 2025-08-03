import { IssueResolutionVerificationTest } from './issueResolutionVerificationTest';
import { StoryQualityVerificationTest } from './storyQualityVerificationTest';

/**
 * Centralized test runner for all verification tests
 */
export class VerificationTestRunner {
  /**
   * Run all verification tests and provide comprehensive report
   */
  static async runAllTests(): Promise<{
    success: boolean;
    results: {
      issueResolution: boolean;
      storyQuality: boolean;
    };
    summary: string[];
  }> {
    console.log('🧪 Starting Comprehensive Verification Tests...');
    console.log('=====================================================');

    const results = {
      issueResolution: false,
      storyQuality: false,
    };

    const summary: string[] = [];

    try {
      // Run Issue Resolution Tests
      console.log('\n📋 Running Issue Resolution Verification...');
      await IssueResolutionVerificationTest.runCompleteVerification();
      results.issueResolution = true;
      summary.push('✅ Issue Resolution Tests: PASSED');
    } catch (error) {
      console.error('❌ Issue Resolution Tests failed:', error);
      results.issueResolution = false;
      summary.push('❌ Issue Resolution Tests: FAILED');
    }

    try {
      // Run Story Quality Tests
      console.log('\n📖 Running Story Quality Verification...');
      await StoryQualityVerificationTest.runAllQualityTests();
      results.storyQuality = true;
      summary.push('✅ Story Quality Tests: PASSED');
    } catch (error) {
      console.error('❌ Story Quality Tests failed:', error);
      results.storyQuality = false;
      summary.push('❌ Story Quality Tests: FAILED');
    }

    const overallSuccess = results.issueResolution && results.storyQuality;
    
    console.log('\n🎯 COMPREHENSIVE VERIFICATION SUMMARY');
    console.log('=====================================');
    summary.forEach(item => console.log(item));
    console.log(`\n🏆 Overall Status: ${overallSuccess ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

    return {
      success: overallSuccess,
      results,
      summary
    };
  }
}

// Tests can be run manually if needed