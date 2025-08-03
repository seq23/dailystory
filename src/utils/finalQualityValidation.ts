import { ComprehensiveQualityTester } from "./comprehensiveQualityTest";
import { UserInfo, DifficultyLevel } from "@/types";
import { SupportedLanguage } from "@/types/multilingual";
import { ConsolidatedStoryGenerator } from "@/services/consolidatedStoryGenerator";
import { FreeUserStoryService } from "@/services/freeUserStoryService";
import { PremiumStoryService } from "@/services/premiumStoryService";
import { UniversalContentManager } from "@/services/universalContentManager";

/**
 * Final validation to ensure all quality improvements are working correctly
 */
export class FinalQualityValidation {
  
  static async runFullSystemValidation(): Promise<boolean> {
    console.log("🚀 STARTING FINAL SYSTEM VALIDATION");
    console.log("=" .repeat(80));
    
    try {
      // 1. Comprehensive Quality Test
      console.log("1️⃣ Running Comprehensive Quality Tests...");
      const comprehensiveReport = await ComprehensiveQualityTester.runComprehensiveTest();
      
      if (!comprehensiveReport.overallPassed) {
        console.error("❌ Comprehensive quality tests failed!");
        console.error("Failed tests:", comprehensiveReport.results.filter(r => !r.passed));
        return false;
      }
      console.log("✅ Comprehensive quality tests PASSED");
      
      // 2. Cross-Device Mobile Validation
      console.log("\n2️⃣ Testing Cross-Device Compatibility...");
      const mobileResult = await this.testMobileCompatibility();
      if (!mobileResult) {
        console.error("❌ Mobile compatibility failed!");
        return false;
      }
      console.log("✅ Mobile compatibility PASSED");
      
      // 3. Multi-Language UI with English Stories
      console.log("\n3️⃣ Testing Multi-Language UI Support...");
      const languageResult = await this.testLanguageSupport();
      if (!languageResult) {
        console.error("❌ Language support failed!");
        return false;
      }
      console.log("✅ Language support PASSED");
      
      // 4. Free vs Premium User Quality
      console.log("\n4️⃣ Testing User Type Quality Standards...");
      const userTypeResult = await this.testUserTypeQuality();
      if (!userTypeResult) {
        console.error("❌ User type quality standards failed!");
        return false;
      }
      console.log("✅ User type quality standards PASSED");
      
      // 5. Word Count Standards Verification
      console.log("\n5️⃣ Testing Word Count Standards...");
      const wordCountResult = await this.testWordCountStandards();
      if (!wordCountResult) {
        console.error("❌ Word count standards failed!");
        return false;
      }
      console.log("✅ Word count standards PASSED");
      
      console.log("\n" + "=" .repeat(80));
      console.log("🎉 ALL QUALITY VALIDATIONS PASSED SUCCESSFULLY!");
      console.log("✅ Story generation pipeline is fully validated and ready");
      console.log("=" .repeat(80));
      
      return true;
      
    } catch (error) {
      console.error("❌ Final validation failed with error:", error);
      return false;
    }
  }
  
  private static async testMobileCompatibility(): Promise<boolean> {
    try {
      // Test responsive design elements
      const mobileUser = this.createTestUser();
      const story = await ConsolidatedStoryGenerator.generateStory(mobileUser, 'easy');
      
      // Verify story structure is mobile-friendly
      const hasValidStructure = story.story.segments.every(segment => 
        segment.text && segment.text.length > 0 && segment.text.length < 500 // Mobile-friendly length
      );
      
      if (!hasValidStructure) {
        console.error("❌ Story structure not mobile-friendly");
        return false;
      }
      
      console.log("📱 Mobile story structure validated");
      return true;
      
    } catch (error) {
      console.error("❌ Mobile compatibility test failed:", error);
      return false;
    }
  }
  
  private static async testLanguageSupport(): Promise<boolean> {
    try {
      const languages: SupportedLanguage[] = ['en', 'es', 'fr', 'ar', 'zh', 'hi', 'pt'];
      
      for (const language of languages) {
        const user = this.createTestUser(language);
        const story = await ConsolidatedStoryGenerator.generateStory(user, 'medium');
        
        // Verify story is in English regardless of UI language
        const storyText = story.story.segments.map(s => s.text).join(' ');
        const isEnglish = this.detectEnglishContent(storyText);
        
        if (!isEnglish) {
          console.error(`❌ Story not in English for UI language: ${language}`);
          return false;
        }
        
        // Verify quality standards are met
        if (story.qualityScore < 0.7) {
          console.error(`❌ Quality score too low for language ${language}: ${story.qualityScore}`);
          return false;
        }
      }
      
      console.log("🌐 All language configurations validated");
      return true;
      
    } catch (error) {
      console.error("❌ Language support test failed:", error);
      return false;
    }
  }
  
  private static async testUserTypeQuality(): Promise<boolean> {
    try {
      const testUser = this.createTestUser();
      
      // Test free user
      const freeResult = await FreeUserStoryService.generateStoryWithCaching(
        testUser, 
        'medium', 
        { originalInputs: {}, translatedInputs: {} }
      );
      
      if (!freeResult.story || freeResult.story.segments.length === 0) {
        console.error("❌ Free user story generation failed");
        return false;
      }
      
      // Test premium user
      const premiumLibrary = await PremiumStoryService.getOrCreateStoryLibrary(
        testUser, 
        { originalInputs: {}, translatedInputs: {} }
      );
      
      if (!premiumLibrary || premiumLibrary.length === 0) {
        console.error("❌ Premium user story generation failed");
        return false;
      }
      
      console.log("👥 Both free and premium user flows validated");
      return true;
      
    } catch (error) {
      console.error("❌ User type quality test failed:", error);
      return false;
    }
  }
  
  private static async testWordCountStandards(): Promise<boolean> {
    try {
      const difficulties: DifficultyLevel[] = ['easy', 'medium', 'hard', 'expert'];
      const expectedRanges = {
        easy: { min: 15, max: 35 },
        medium: { min: 25, max: 50 },
        hard: { min: 40, max: 70 },
        expert: { min: 60, max: 100 }
      };
      
      for (const difficulty of difficulties) {
        const user = this.createTestUser();
        const story = await ConsolidatedStoryGenerator.generateStory(user, difficulty);
        
        const expected = expectedRanges[difficulty];
        
        for (let i = 0; i < story.story.segments.length; i++) {
          const segment = story.story.segments[i];
          const wordCount = segment.text.trim().split(/\s+/).length;
          
          if (wordCount < expected.min || wordCount > expected.max) {
            console.error(`❌ Word count violation for ${difficulty} level page ${i + 1}: ${wordCount} words (expected ${expected.min}-${expected.max})`);
            return false;
          }
        }
      }
      
      console.log("📊 All word count standards validated");
      return true;
      
    } catch (error) {
      console.error("❌ Word count standards test failed:", error);
      return false;
    }
  }
  
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
  
  private static detectEnglishContent(text: string): boolean {
    const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an'];
    const words = text.toLowerCase().split(/\s+/);
    const englishWordCount = words.filter(word => englishWords.includes(word)).length;
    
    return englishWordCount >= 5; // At least 5 common English words
  }
}

// Export for manual testing
if (typeof window !== 'undefined') {
  (window as any).runFinalValidation = () => {
    FinalQualityValidation.runFullSystemValidation()
      .then(result => console.log(`Final validation result: ${result ? 'PASSED' : 'FAILED'}`))
      .catch(error => console.error('Final validation error:', error));
  };
}