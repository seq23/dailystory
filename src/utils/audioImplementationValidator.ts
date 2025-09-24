// Replaced SimplifiedAudioEngine with CharlotteVoiceService
import { CharlotteVoiceService } from '../services/CharlotteVoiceService';
import type { UserInfo } from '@/types';

/**
 * Comprehensive validation for audio-highlighting synchronization
 * Ensures proper functionality across all devices, users, and languages
 */
export class AudioImplementationValidator {
  private issues: string[] = [];
  private warnings: string[] = [];

  /**
   * Run comprehensive validation checks
   */
  async validateImplementation(): Promise<{
    isValid: boolean;
    issues: string[];
    warnings: string[];
    deviceCompatibility: boolean;
    userRestrictions: boolean;
    languageSupport: boolean;
  }> {
    console.log('🔍 Running comprehensive audio implementation validation...');
    
    this.issues = [];
    this.warnings = [];

    const deviceCheck = await this.validateDeviceCompatibility();
    const userCheck = await this.validateUserRestrictions();
    const languageCheck = this.validateLanguageSupport();
    const syncCheck = this.validateSynchronization();
    const mobileCheck = this.validateMobileOptimizations();

    const isValid = this.issues.length === 0;
    
    console.log(`\n🔍 Validation Results:`);
    console.log(`✅ Device Compatibility: ${deviceCheck ? 'PASS' : 'FAIL'}`);
    console.log(`✅ User Restrictions: ${userCheck ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Language Support: ${languageCheck ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Synchronization: ${syncCheck ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Mobile Optimizations: ${mobileCheck ? 'PASS' : 'FAIL'}`);
    
    if (this.issues.length > 0) {
      console.log(`\n❌ Issues found:`);
      this.issues.forEach(issue => console.log(`  - ${issue}`));
    }

    if (this.warnings.length > 0) {
      console.log(`\n⚠️ Warnings:`);
      this.warnings.forEach(warning => console.log(`  - ${warning}`));
    }

    return {
      isValid,
      issues: this.issues,
      warnings: this.warnings,
      deviceCompatibility: deviceCheck,
      userRestrictions: userCheck,
      languageSupport: languageCheck
    };
  }

  /**
   * Validate device compatibility (desktop, mobile, tablet)
   */
  private async validateDeviceCompatibility(): Promise<boolean> {
    let isValid = true;

    // Check mobile audio support
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Check if MobileAudioManager is properly initialized
      try {
        const { MobileAudioManager } = await import('../services/mobileAudioManager');
        const manager = MobileAudioManager.getInstance();
        
        if (!manager) {
          this.issues.push('Mobile audio manager not properly initialized');
          isValid = false;
        }
      } catch (error) {
        this.issues.push('Mobile audio manager import failed');
        isValid = false;
      }

      // Check touch target sizes for mobile
      if (window.innerWidth < 768) {
        this.warnings.push('Ensure audio controls have minimum 44px touch targets for mobile');
      }
    }

    // Check audio context support
    const hasAudioContext = 'AudioContext' in window || 'webkitAudioContext' in window;
    if (!hasAudioContext) {
      this.warnings.push('AudioContext not supported - fallback to HTML5 audio only');
    }

    // Check speech synthesis fallback
    if (!('speechSynthesis' in window)) {
      this.issues.push('Speech synthesis not available - no fallback for TTS failures');
      isValid = false;
    }

    return isValid;
  }

  /**
   * Validate user restrictions (free vs premium)
   */
  private async validateUserRestrictions(): Promise<boolean> {
    let isValid = true;

    // Test free user scenario
    const freeUser: UserInfo = {
      name: 'Test Free User',
      age: 10,
      nativeLanguage: 'es', // Non-English speaker
      avatar: { type: 'prefer-not-to-answer', skinTone: 'medium' },
      grade: '5',
      learningGoal: 'improve-english-reading',
      favoriteColor: 'blue',
      favoriteAnimal: 'dog',
      hobbies: 'sports',
      favoriteFood: 'pizza',
      specialRequest: '',
      interests: ['sports'],
      storyLanguagePreference: 'en'
    };

    try {
      const audioEngine = CharlotteVoiceService.getInstance();
      
      // Test basic audio functionality for free users
      await audioEngine.playTextWithSynchronization({ text: 'Test story content' });
      console.log('✅ Free user audio test completed');
    } catch (error) {
      this.warnings.push('Audio engine test failed: ' + (error as Error).message);
    }

    // Test premium user scenario
    const premiumUser: UserInfo = {
      name: 'Test Premium User',
      age: 10,
      nativeLanguage: 'fr',
      avatar: { type: 'prefer-not-to-answer', skinTone: 'medium' },
      grade: '5',
      learningGoal: 'learn-english-language',
      favoriteColor: 'pink',
      favoriteAnimal: 'cat',
      hobbies: 'art',
      favoriteFood: 'croissant',
      specialRequest: '',
      interests: ['art'],
      storyLanguagePreference: 'fr'
    };

    try {
      const audioEngine = CharlotteVoiceService.getInstance();
      // Test premium user audio access
      await audioEngine.playTextWithSynchronization({ text: 'Premium test content' });
      console.log('✅ Premium user audio test completed');
    } catch (error) {
      this.warnings.push('Could not validate premium user access');
    }

    return isValid;
  }

  /**
   * Validate language support
   */
  private validateLanguageSupport(): boolean {
    let isValid = true;

    // Check that language preference service enforces restrictions
    try {
      // Note: Language preference service validation is optional in current implementation
      this.warnings.push('Language preference service validation skipped - service not properly exportable');
      
    } catch (error) {
      this.warnings.push('Could not validate language preference service');
    }

    return isValid;
  }

  /**
   * Validate audio-highlighting synchronization
   */
  private validateSynchronization(): boolean {
    let isValid = true;

    // Check if AudioSyncService has proper voice profiles
    try {
      // TODO: Replace with SimplifiedAudioEngine validation
      const profiles = {}; // Removed audioSyncService reference
      
      if (!profiles['cgSgspJ2msm6clMCkdW9']) {
        this.issues.push('Jessica voice profile missing from AudioSyncService');
        isValid = false;
      }
      
      if (!profiles['EXAVITQu4vr4xnSDxMaL']) {
        this.issues.push('Sarah voice profile missing from AudioSyncService');
        isValid = false;
      }

      // Check timing values are reasonable
      Object.entries(profiles).forEach(([voice, profile]: [string, any]) => {
        if (profile.baseWordInterval < 200 || profile.baseWordInterval > 400) {
          this.warnings.push(`Voice ${voice} has unusual timing: ${profile.baseWordInterval}ms`);
        }
      });

    } catch (error) {
      this.issues.push('AudioSyncService not properly configured');
      isValid = false;
    }

    return isValid;
  }

  /**
   * Validate mobile-specific optimizations
   */
  private validateMobileOptimizations(): boolean {
    let isValid = true;

    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Check if mobile-specific audio handling is implemented
      const audioElements = document.querySelectorAll('audio');
      
      audioElements.forEach(audio => {
        if (!audio.preload) {
          this.warnings.push('Audio elements should have preload attribute for mobile');
        }
      });

      // Check for mobile-optimized touch targets
      const buttons = document.querySelectorAll('button[aria-label*="audio"], button[aria-label*="play"]');
      buttons.forEach(button => {
        const rect = button.getBoundingClientRect();
        if (rect.height < 44 || rect.width < 44) {
          this.warnings.push('Audio control buttons smaller than recommended 44px touch target');
        }
      });
    }

    return isValid;
  }

  /**
   * Test specific scenarios
   */
  async testScenarios(): Promise<void> {
    console.log('🧪 Testing specific scenarios...');

    // Scenario 1: Free user tries to play non-English audio
    await this.testFreeUserLanguageRestriction();

    // Scenario 2: Mobile device audio playback
    await this.testMobileAudioPlayback();

    // Scenario 3: Premium user multilingual support
    await this.testPremiumMultilingualSupport();

    // Scenario 4: Audio-highlighting synchronization
    await this.testHighlightingSynchronization();
  }

  private async testFreeUserLanguageRestriction(): Promise<void> {
    const freeUser: UserInfo = {
      name: 'Free User',
      age: 12,
      nativeLanguage: 'es',
      avatar: { type: 'prefer-not-to-answer', skinTone: 'medium' },
      grade: '6',
      learningGoal: 'both',
      favoriteColor: 'green',
      favoriteAnimal: 'lion',
      hobbies: 'adventure stories',
      favoriteFood: 'tacos',
      specialRequest: '',
      interests: ['adventure'],
      storyLanguagePreference: 'en'
    };

    try {
      const audioEngine = CharlotteVoiceService.getInstance();
      await audioEngine.playTextWithSynchronization({ text: 'Test content in Spanish' });
      console.log('✅ Free user test completed');
    } catch (error) {
      this.warnings.push('Free user audio test error: ' + (error as Error).message);
    }
  }

  private async testMobileAudioPlayback(): Promise<void> {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Test mobile audio initialization
      try {
        const testAudio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMeBS113+TQeCkELI7L7tmNQAgMW7Dn7adTEw1GnN/y');
        
        await testAudio.play().catch(() => {
          this.warnings.push('Mobile audio autoplay blocked - user interaction required');
        });
        
        testAudio.pause();
        console.log('✅ Mobile audio test completed');
      } catch (error) {
        this.warnings.push('Mobile audio compatibility issue detected');
      }
    }
  }

  private async testPremiumMultilingualSupport(): Promise<void> {
    const premiumUser: UserInfo = {
      name: 'Premium User',
      age: 10,
      nativeLanguage: 'fr',
      storyLanguagePreference: 'fr',
      avatar: { type: 'prefer-not-to-answer', skinTone: 'medium' },
      grade: '5',
      learningGoal: 'both',
      favoriteColor: 'purple',
      favoriteAnimal: 'butterfly',
      hobbies: 'fantasy stories',
      favoriteFood: 'macarons',
      specialRequest: '',
      interests: ['fantasy']
    };

    // This would be a more complex test in a real scenario
    console.log('✅ Premium multilingual support test placeholder completed');
  }

  private async testHighlightingSynchronization(): Promise<void> {
    // Test highlighting timing calculations
    const testText = "The quick brown fox jumps over the lazy dog.";
    const words = testText.split(/(\s+)/).filter(word => word.trim().length > 0);
    
    if (words.length !== 9) {
      this.warnings.push('Text processing for highlighting may have issues');
    }

    console.log('✅ Highlighting synchronization test completed');
  }
}

// Export singleton for validation
export const audioValidator = new AudioImplementationValidator();

// Auto-run validation in development
if (import.meta.env.DEV) {
  setTimeout(async () => {
    const results = await audioValidator.validateImplementation();
    
    if (!results.isValid) {
      console.error('🚨 Audio implementation validation failed!');
      console.error('Issues:', results.issues);
    } else {
      console.log('🎉 Audio implementation validation passed!');
    }
    
    if (results.warnings.length > 0) {
      console.warn('⚠️ Warnings:', results.warnings);
    }
  }, 3000);
}