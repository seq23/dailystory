/**
 * Comprehensive Level Transition Test Suite
 * Tests all transitions between reading levels to ensure proper session isolation
 */

import { SimplifiedTemplateManager } from './services/simplifiedTemplateManager';
import type { UserInfo, DifficultyLevel } from './types';

/**
 * Test all level transitions in sequence to simulate real user progression
 */
export async function testUserProgression(): Promise<{
  isValid: boolean;
  errors: string[];
  progressionReport: string;
}> {
  const errors: string[] = [];
  const reports: string[] = [];

  try {
    console.log("👤 Testing realistic user progression through all levels...");

    // Clear all session state to start fresh
    SimplifiedTemplateManager.clearSession();

    const mockUser: UserInfo = {
      name: "ProgressionTestUser",
      age: 7,
      grade: "2nd",
      nativeLanguage: "en",
      learningGoal: "improve-english-reading",
      avatar: { type: "boy", skinTone: "medium" },
      favoriteColor: "blue",
      favoriteAnimal: "elephant",
      hobbies: "adventure, animals",
      favoriteFood: "pizza",
      specialRequest: "",
      interests: ["adventure", "animals"]
    };

    const progressionPath: Array<{
      difficulty: DifficultyLevel;
      expectedGrade: number;
      phase: string;
    }> = [
      { difficulty: "easy", expectedGrade: 1, phase: "Starting Level 1" },
      { difficulty: "easy", expectedGrade: 1, phase: "Second Level 1 story" },
      { difficulty: "medium", expectedGrade: 2, phase: "Progressed to Level 2" },
      { difficulty: "medium", expectedGrade: 2, phase: "Second Level 2 story" },
      { difficulty: "hard", expectedGrade: 3, phase: "Progressed to Level 3" },
      { difficulty: "hard", expectedGrade: 3, phase: "Second Level 3 story" },
      { difficulty: "expert", expectedGrade: 4, phase: "Reached Level 4" },
      { difficulty: "expert", expectedGrade: 4, phase: "Second Level 4 story" }
    ];

    const usedTemplates = new Map<number, Set<number>>();
    let previousStoryText = "";

    for (let i = 0; i < progressionPath.length; i++) {
      const step = progressionPath[i];
      
      console.log(`📖 ${step.phase} (${step.difficulty})...`);

      const story = await SimplifiedTemplateManager.generateStory({
        userInfo: mockUser,
        difficulty: step.difficulty,
        isPremium: false
      });

      // Validate grade level
      if (story.gradeLevel !== step.expectedGrade) {
        errors.push(`${step.phase}: Wrong grade level ${story.gradeLevel}, expected ${step.expectedGrade}`);
      }

      // Validate template index
      if (story.templateIndex === undefined || story.templateIndex >= 40) {
        errors.push(`${step.phase}: Invalid template index ${story.templateIndex}`);
      }

      // Track template usage per level
      if (!usedTemplates.has(step.expectedGrade)) {
        usedTemplates.set(step.expectedGrade, new Set());
      }
      if (story.templateIndex !== undefined) {
        usedTemplates.get(step.expectedGrade)!.add(story.templateIndex);
      }

      // Check for repetition from previous story
      const currentStoryText = story.pages.join(' ');
      if (previousStoryText && currentStoryText === previousStoryText) {
        errors.push(`${step.phase}: Identical story content to previous generation`);
      }

      // Check for internal repetition
      const hasInternalRepetition = story.pages.some(page => {
        const sentences = page.split('. ').filter(s => s.length > 0);
        return sentences.length !== new Set(sentences).size;
      });

      if (hasInternalRepetition) {
        errors.push(`${step.phase}: Story contains internal repetition`);
      }

      reports.push(`${step.phase}: Grade ${story.gradeLevel}, Template ${story.templateIndex}, Pages: ${story.pages.length}`);
      previousStoryText = currentStoryText;
    }

    // Verify template diversity
    for (const [grade, templates] of usedTemplates.entries()) {
      if (templates.size < 2 && templates.size > 0) {
        console.warn(`⚠️  Grade ${grade} only used ${templates.size} unique template(s): ${Array.from(templates).join(', ')}`);
      }
      reports.push(`Grade ${grade} Template Usage: ${Array.from(templates).sort((a, b) => a - b).join(', ')} (${templates.size} unique)`);
    }

    console.log("✅ User progression test completed");

    return {
      isValid: errors.length === 0,
      errors,
      progressionReport: reports.join('\n')
    };

  } catch (error) {
    const errorMsg = `User progression test failed: ${error}`;
    errors.push(errorMsg);
    console.error("❌", errorMsg);

    return {
      isValid: false,
      errors,
      progressionReport: `Test failed with error: ${error}`
    };
  }
}

/**
 * Test rapid difficulty switching to ensure session isolation
 */
export async function testRapidDifficultySwitching(): Promise<{
  isValid: boolean;
  errors: string[];
  switchingReport: string;
}> {
  const errors: string[] = [];
  const reports: string[] = [];

  try {
    console.log("⚡ Testing rapid difficulty switching...");

    SimplifiedTemplateManager.clearSession();

    const mockUser: UserInfo = {
      name: "SwitchTestUser",
      age: 9,
      grade: "3rd",
      nativeLanguage: "en", 
      learningGoal: "improve-english-reading",
      avatar: { type: "girl", skinTone: "light" },
      favoriteColor: "purple",
      favoriteAnimal: "fox",
      hobbies: "mystery, puzzles",
      favoriteFood: "cookies",
      specialRequest: "",
      interests: ["mystery"]
    };

    // Rapid switching pattern: 1→4→2→3→1→4
    const switchingPattern: Array<{
      difficulty: DifficultyLevel;
      expectedGrade: number;
      label: string;
    }> = [
      { difficulty: "easy", expectedGrade: 1, label: "Level 1" },
      { difficulty: "expert", expectedGrade: 4, label: "Jump to Level 4" },
      { difficulty: "medium", expectedGrade: 2, label: "Down to Level 2" },
      { difficulty: "hard", expectedGrade: 3, label: "Up to Level 3" },
      { difficulty: "easy", expectedGrade: 1, label: "Back to Level 1" },
      { difficulty: "expert", expectedGrade: 4, label: "Return to Level 4" }
    ];

    const generatedStories: string[] = [];

    for (const step of switchingPattern) {
      console.log(`🔄 ${step.label}...`);

      const story = await SimplifiedTemplateManager.generateStory({
        userInfo: mockUser,
        difficulty: step.difficulty,
        isPremium: false
      });

      // Validate grade level
      if (story.gradeLevel !== step.expectedGrade) {
        errors.push(`${step.label}: Wrong grade level ${story.gradeLevel}, expected ${step.expectedGrade}`);
      }

      // Validate template index
      if (story.templateIndex === undefined || story.templateIndex >= 40) {
        errors.push(`${step.label}: Invalid template index ${story.templateIndex}`);
      }

      const storyText = story.pages.join(' ');
      
      // Check for repetition against all previous stories
      if (generatedStories.includes(storyText)) {
        errors.push(`${step.label}: Repeated story content from earlier generation`);
      }

      generatedStories.push(storyText);
      reports.push(`${step.label}: Grade ${story.gradeLevel}, Template ${story.templateIndex}, Unique: ${!generatedStories.slice(0, -1).includes(storyText)}`);
    }

    console.log("✅ Rapid difficulty switching test completed");

    return {
      isValid: errors.length === 0,
      errors,
      switchingReport: reports.join('\n')
    };

  } catch (error) {
    const errorMsg = `Rapid switching test failed: ${error}`;
    errors.push(errorMsg);
    console.error("❌", errorMsg);

    return {
      isValid: false,
      errors,
      switchingReport: `Test failed with error: ${error}`
    };
  }
}

/**
 * Run all transition tests
 */
export async function runAllTransitionTests(): Promise<void> {
  console.log("🚀 Starting comprehensive level transition tests...");

  try {
    // Test 1: User progression simulation
    const progressionResult = await testUserProgression();
    
    if (progressionResult.isValid) {
      console.log("✅ User progression test PASSED");
      console.log(progressionResult.progressionReport);
    } else {
      console.error("❌ User progression test FAILED");
      progressionResult.errors.forEach(error => console.error(`  - ${error}`));
    }

    console.log("\n" + "=".repeat(50) + "\n");

    // Test 2: Rapid switching simulation
    const switchingResult = await testRapidDifficultySwitching();
    
    if (switchingResult.isValid) {
      console.log("✅ Rapid switching test PASSED");
      console.log(switchingResult.switchingReport);
    } else {
      console.error("❌ Rapid switching test FAILED");
      switchingResult.errors.forEach(error => console.error(`  - ${error}`));
    }

    // Overall result
    const allPassed = progressionResult.isValid && switchingResult.isValid;
    
    console.log("\n" + "=".repeat(50));
    console.log(allPassed ? "🎉 ALL TRANSITION TESTS PASSED!" : "⚠️  Some transition tests failed - see errors above");
    console.log("=".repeat(50));

  } catch (error) {
    console.error("💥 Critical error in transition tests:", error);
  }
}

// Auto-run if called directly
if (typeof window !== 'undefined') {
  (window as any).runAllTransitionTests = runAllTransitionTests;
  (window as any).testUserProgression = testUserProgression;
  (window as any).testRapidDifficultySwitching = testRapidDifficultySwitching;
}