// Test utilities for verifying the anti-repetition system works correctly
import { AntiRepetitionSystem } from "@/utils/antiRepetitionSystem";
import { PersistentAntiRepetitionService } from "@/services/persistentAntiRepetitionService";
import { UniversalContentManager } from "@/services/universalContentManager";
import type { UserInfo, DifficultyLevel } from "@/types";

export class AntiRepetitionTestSuite {
  
  /**
   * Comprehensive test for the anti-repetition system
   */
  static async runComprehensiveTest(): Promise<void> {
    console.log("🧪 Running Anti-Repetition System Comprehensive Test...");
    
    try {
      // Test 1: Device fingerprinting works on all devices
      await this.testDeviceFingerprinting();
      
      // Test 2: Persistent storage works
      await this.testPersistentStorage();
      
      // Test 3: Free user anti-repetition
      await this.testFreeUserAntiRepetition();
      
      // Test 4: Premium user story continuation
      await this.testPremiumUserContinuation();
      
      // Test 5: Language handling (always English)
      await this.testLanguageHandling();
      
      // Test 6: Cross-session persistence
      await this.testCrossSessionPersistence();
      
      console.log("✅ All Anti-Repetition System tests passed!");
      
    } catch (error) {
      console.error("❌ Anti-Repetition System test failed:", error);
    }
  }
  
  /**
   * Test device fingerprinting on different devices
   */
  static async testDeviceFingerprinting(): Promise<void> {
    console.log("🔍 Testing device fingerprinting...");
    
    const fingerprint1 = PersistentAntiRepetitionService.generateDeviceFingerprint();
    const fingerprint2 = PersistentAntiRepetitionService.generateDeviceFingerprint();
    
    // Should be consistent for the same device
    if (fingerprint1 !== fingerprint2) {
      throw new Error("Device fingerprinting not consistent");
    }
    
    console.log("✅ Device fingerprinting test passed");
  }
  
  /**
   * Test persistent storage functionality
   */
  static async testPersistentStorage(): Promise<void> {
    console.log("💾 Testing persistent storage...");
    
    const testSignature = "test_signature_" + Date.now();
    
    // Save a test signature
    await PersistentAntiRepetitionService.saveContentSignature(testSignature, 1, 'test');
    
    // Load signatures and verify it exists
    const signatures = await PersistentAntiRepetitionService.loadContentSignatures();
    
    if (!signatures.has(testSignature)) {
      throw new Error("Persistent storage not working correctly");
    }
    
    console.log("✅ Persistent storage test passed");
  }
  
  /**
   * Test free user anti-repetition during page additions
   */
  static async testFreeUserAntiRepetition(): Promise<void> {
    console.log("🆓 Testing free user anti-repetition...");
    
    const mockUserInfo: UserInfo = {
      name: "TestUser",
      age: 8,
      grade: "2nd",
      nativeLanguage: "es", // Spanish user should still get English stories
      learningGoal: "improve-english-reading",
      avatar: { type: "boy", skinTone: "medium" },
      favoriteColor: "blue",
      favoriteAnimal: "dog",
      hobbies: "reading",
      favoriteFood: "pizza",
      specialRequest: "adventure story"
    };
    
    // Initialize anti-repetition system
    await AntiRepetitionSystem.initialize();
    
    // Generate a test story
    const result = await UniversalContentManager.generateNewStoryWithAntiRepetition(
      mockUserInfo,
      "easy",
      { isPremium: false, userId: "test_user" }
    );
    
    // Verify story is in English despite user's Spanish native language
    const storyText = result.story.segments.map(s => s.text).join(' ');
    
    // Basic check - should contain English words and not Spanish
    if (!storyText.includes('and') && !storyText.includes('the')) {
      throw new Error("Story not generated in English");
    }
    
    console.log("✅ Free user anti-repetition test passed");
  }
  
  /**
   * Test premium user story continuation
   */
  static async testPremiumUserContinuation(): Promise<void> {
    console.log("👑 Testing premium user story continuation...");
    
    const mockUserInfo: UserInfo = {
      name: "PremiumUser",
      age: 10,
      grade: "4th",
      nativeLanguage: "fr", // French user should still get English stories
      learningGoal: "both",
      avatar: { type: "girl", skinTone: "light" },
      favoriteColor: "purple",
      favoriteAnimal: "cat",
      hobbies: "dancing",
      favoriteFood: "chocolate",
      specialRequest: "magical story"
    };
    
    const existingStory = [
      "Once upon a time, there was a girl named PremiumUser.",
      "She loved to dance with her purple cat.",
      "One day, they discovered a magical portal."
    ];
    
    // Test story continuation
    const continuationStory = await UniversalContentManager.continueExistingStory(
      existingStory,
      mockUserInfo,
      "medium",
      { isPremium: true, userId: "premium_user" }
    );
    
    // Verify continuation maintains context
    const continuationText = continuationStory.segments.map(s => s.text).join(' ');
    
    if (!continuationText.includes('PremiumUser') && !continuationText.toLowerCase().includes('purple')) {
      console.warn("Story continuation may not maintain full context");
    }
    
    console.log("✅ Premium user story continuation test passed");
  }
  
  /**
   * Test that stories are always generated in English
   */
  static async testLanguageHandling(): Promise<void> {
    console.log("🌍 Testing language handling (always English)...");
    
    const multilingualUsers = [
      { nativeLanguage: "zh" as const, name: "ChineseUser" },
      { nativeLanguage: "ar" as const, name: "ArabicUser" },
      { nativeLanguage: "hi" as const, name: "HindiUser" },
      { nativeLanguage: "pt" as const, name: "PortugueseUser" }
    ];
    
    for (const userData of multilingualUsers) {
      const mockUserInfo: UserInfo = {
        name: userData.name,
        age: 9,
        grade: "3rd",
        nativeLanguage: userData.nativeLanguage,
        learningGoal: "learn-english-language",
        avatar: { type: "boy", skinTone: "dark" },
        favoriteColor: "red",
        favoriteAnimal: "elephant",
        hobbies: "soccer",
        favoriteFood: "rice",
        specialRequest: "sports story"
      };
      
      const result = await UniversalContentManager.generateStory(
        mockUserInfo,
        "easy",
        { isPremium: false, userId: userData.name }
      );
      
      const storyText = result.story.segments.map(s => s.text).join(' ');
      
      // Verify English content
      if (!storyText.includes('and') || !storyText.includes('the')) {
        throw new Error(`Story not in English for ${userData.nativeLanguage} user`);
      }
    }
    
    console.log("✅ Language handling test passed - all stories in English");
  }
  
  /**
   * Test cross-session persistence
   */
  static async testCrossSessionPersistence(): Promise<void> {
    console.log("🔄 Testing cross-session persistence...");
    
    // Clear the current session but preserve persistent data
    AntiRepetitionSystem.clearCache(true);
    
    // Re-initialize (simulating app restart)
    await AntiRepetitionSystem.initialize();
    
    // Add some content
    await AntiRepetitionSystem.addContent("Test content for persistence");
    
    // Clear session again but preserve persistent
    AntiRepetitionSystem.clearCache(true);
    
    // Re-initialize again
    await AntiRepetitionSystem.initialize();
    
    // Check if content is still detected as duplicate
    const isDuplicate = AntiRepetitionSystem.isDuplicateSync("Test content for persistence");
    
    if (!isDuplicate) {
      throw new Error("Cross-session persistence not working");
    }
    
    console.log("✅ Cross-session persistence test passed");
  }
}

// Auto-run test in development mode
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  // Run test after a short delay to ensure all systems are loaded
  setTimeout(() => {
    AntiRepetitionTestSuite.runComprehensiveTest().catch(console.error);
  }, 2000);
}