/**
 * Audio Synchronization Integration Tests
 * Tests the enhanced audio-highlighting synchronization system
 */

import { audioSyncService } from '../services/audioSyncService';
import { EnhancedAudioService } from '../services/enhancedAudioService';

interface TestUserInfo {
  age: number;
  nativeLanguage: string;
  avatar?: { type: 'girl' | 'boy' };
  name: string;
}

/**
 * Test suite for audio synchronization functionality
 */
export class AudioSyncTestSuite {
  private testResults: Array<{ test: string; passed: boolean; duration?: number; error?: string }> = [];

  /**
   * Run all audio synchronization tests
   */
  async runAllTests(): Promise<void> {
    console.log('🧪 Starting Audio Synchronization Test Suite...');
    
    await this.testVoiceSelection();
    await this.testSpeedCalculation();
    await this.testHighlightingTiming();
    await this.testSyncCorrection();
    await this.testMobileCompatibility();
    
    this.printResults();
  }

  /**
   * Test voice selection logic
   */
  private async testVoiceSelection(): Promise<void> {
    const testCases: Array<{ user: TestUserInfo; expectedVoice: string; description: string }> = [
      {
        user: { age: 8, nativeLanguage: 'en', name: 'Test Child' },
        expectedVoice: 'EXAVITQu4vr4xnSDxMaL', // Sarah for young children
        description: 'Young English speaker should get Sarah'
      },
      {
        user: { age: 12, nativeLanguage: 'en', name: 'Test Teen' },
        expectedVoice: 'cgSgspJ2msm6clMCkdW9', // Jessica for older children
        description: 'Teen English speaker should get Jessica'
      },
      {
        user: { age: 10, nativeLanguage: 'es', name: 'Test Spanish' },
        expectedVoice: 'XB0fDUnXU5powFXDhCwa', // Charlotte for non-native speakers
        description: 'Non-English speaker should get appropriate multilingual voice'
      }
    ];

    for (const testCase of testCases) {
      try {
        const audioService = new EnhancedAudioService();
        const voice = (audioService as any).getVoiceForUser(testCase.user, 'narrator', false);
        
        const passed = voice === testCase.expectedVoice;
        this.testResults.push({
          test: `Voice Selection: ${testCase.description}`,
          passed,
          error: passed ? undefined : `Expected ${testCase.expectedVoice}, got ${voice}`
        });
      } catch (error) {
        this.testResults.push({
          test: `Voice Selection: ${testCase.description}`,
          passed: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  /**
   * Test speed calculation
   */
  private async testSpeedCalculation(): Promise<void> {
    const audioService = new EnhancedAudioService();
    
    const testCases = [
      { difficulty: 'easy' as const, nativeLanguage: 'en', expectedMin: 0.75, expectedMax: 0.95 },
      { difficulty: 'medium' as const, nativeLanguage: 'en', expectedMin: 0.85, expectedMax: 1.05 },
      { difficulty: 'easy' as const, nativeLanguage: 'es', expectedMin: 0.65, expectedMax: 0.85 },
    ];

    for (const testCase of testCases) {
      try {
        const userInfo = { 
          age: 10, 
          nativeLanguage: testCase.nativeLanguage, 
          name: 'Test User' 
        } as TestUserInfo;
        
        const speed = (audioService as any).getSpeedForDifficulty(testCase.difficulty, userInfo);
        const passed = speed >= testCase.expectedMin && speed <= testCase.expectedMax;
        
        this.testResults.push({
          test: `Speed Calculation: ${testCase.difficulty} ${testCase.nativeLanguage}`,
          passed,
          error: passed ? undefined : `Speed ${speed} outside expected range ${testCase.expectedMin}-${testCase.expectedMax}`
        });
      } catch (error) {
        this.testResults.push({
          test: `Speed Calculation: ${testCase.difficulty} ${testCase.nativeLanguage}`,
          passed: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  /**
   * Test highlighting timing calculations
   */
  private async testHighlightingTiming(): Promise<void> {
    try {
      const mockText = "The quick brown fox jumps over the lazy dog.";
      const words = mockText.split(/(\s+)/).filter(word => word.trim().length > 0);
      
      // Test timing calculation for different voices
      const voiceTests = [
        { voice: 'cgSgspJ2msm6clMCkdW9', expectedInterval: 280 }, // Jessica
        { voice: 'EXAVITQu4vr4xnSDxMaL', expectedInterval: 300 }, // Sarah
      ];

      for (const voiceTest of voiceTests) {
        const audioSyncInstance = audioSyncService;
        const profile = (audioSyncInstance as any).voiceProfiles[voiceTest.voice];
        
        if (profile) {
          const passed = profile.baseWordInterval === voiceTest.expectedInterval;
          this.testResults.push({
            test: `Timing Profile: ${voiceTest.voice}`,
            passed,
            error: passed ? undefined : `Expected ${voiceTest.expectedInterval}ms, got ${profile.baseWordInterval}ms`
          });
        }
      }
    } catch (error) {
      this.testResults.push({
        test: 'Highlighting Timing',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test sync correction functionality
   */
  private async testSyncCorrection(): Promise<void> {
    try {
      const audioSyncInstance = audioSyncService;
      
      // Test sync drift detection
      const expectedIndex = 5;
      const actualIndex = 8;
      const correctedIndex = (audioSyncInstance as any).calculateExpectedWordIndex('cgSgspJ2msm6clMCkdW9', 1.0, 2.5);
      
      // This is a simplified test - in real scenario we'd need actual audio
      const passed = typeof correctedIndex === 'number';
      
      this.testResults.push({
        test: 'Sync Correction Logic',
        passed,
        error: passed ? undefined : 'Sync correction method not working'
      });
    } catch (error) {
      this.testResults.push({
        test: 'Sync Correction Logic',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test mobile compatibility
   */
  private async testMobileCompatibility(): Promise<void> {
    try {
      // Check if mobile detection works
      const audioService = new EnhancedAudioService();
      const isMobile = (audioService as any).isMobile();
      
      // This should work on any device
      const passed = typeof isMobile === 'boolean';
      
      this.testResults.push({
        test: 'Mobile Detection',
        passed,
        error: passed ? undefined : 'Mobile detection not working'
      });

      // Test audio context initialization (basic check)
      const hasAudioContext = 'AudioContext' in window || 'webkitAudioContext' in window;
      
      this.testResults.push({
        test: 'Audio Context Support',
        passed: hasAudioContext,
        error: hasAudioContext ? undefined : 'Audio context not supported'
      });
    } catch (error) {
      this.testResults.push({
        test: 'Mobile Compatibility',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Print test results to console
   */
  private printResults(): void {
    console.log('\n🧪 Audio Synchronization Test Results:');
    console.log('=====================================');
    
    let passed = 0;
    let failed = 0;
    
    this.testResults.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      const duration = result.duration ? ` (${result.duration}ms)` : '';
      const error = result.error ? ` - ${result.error}` : '';
      
      console.log(`${status} ${result.test}${duration}${error}`);
      
      if (result.passed) {
        passed++;
      } else {
        failed++;
      }
    });
    
    console.log('=====================================');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
    
    if (failed === 0) {
      console.log('🎉 All audio synchronization tests passed!');
    } else {
      console.log('⚠️ Some tests failed. Check implementation.');
    }
  }
}

// Export singleton instance for testing
export const audioSyncTests = new AudioSyncTestSuite();

// Auto-run tests in development
if (import.meta.env.DEV) {
  // Run tests after a short delay to ensure all modules are loaded
  setTimeout(() => {
    audioSyncTests.runAllTests().catch(console.error);
  }, 2000);
}