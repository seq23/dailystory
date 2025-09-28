import { describe, it, expect } from "vitest";
import { PlaceholderValidationService } from "@/services/PlaceholderValidationService";
import { DifficultyLevelMapper } from "@/services/DifficultyLevelMapper";
import type { UserInfo } from "@/types";

function createTestUser(overrides: Partial<UserInfo> = {}): UserInfo {
  return {
    name: "Emma Johnson",
    age: 8,
    grade: "3",
    nativeLanguage: "en",
    learningGoal: "improve-english-reading",
    avatar: { type: "prefer-not-to-answer", skinTone: "medium" },
    favoriteColor: "purple",
    favoriteAnimal: "butterfly",
    hobbies: "painting and dancing",
    favoriteFood: "strawberries",
    specialRequest: "theme: friendship and courage",
    readingLevel: "medium",
    ...overrides,
  };
}

describe("PlaceholderValidationService", () => {
  it("validates all core placeholders with stub implementation", () => {
    const user = createTestUser();
    const template = "Hi {userName}! You love {favoriteColor} and {favoriteAnimal}. Your hobbies include {hobbies} and you enjoy eating {favoriteFood}. Today's story theme: {specialRequest}";
    
    const result = PlaceholderValidationService.validatePlaceholders(template, user);
    
    // Test stub behavior - always returns success
    expect(result.isValid).toBe(true);
    expect(result.missingPlaceholders).toHaveLength(0);
    expect(result.unresolvedPlaceholders).toHaveLength(0);
    expect(result.validationScore).toBe(1.0);
    expect(result.recommendations).toContain('Validation handled by unified edge function');
  });

  it("validates user data completeness with stub implementation", () => {
    const user = createTestUser();
    const result = PlaceholderValidationService.validateUserDataCompleteness(user);
    
    // Test stub behavior
    expect(result.isComplete).toBe(true);
    expect(result.missingFields).toHaveLength(0);
    expect(result.completeness).toBe(1.0);
    expect(result.recommendations).toContain("User profile is complete!");
  });

  it("handles incomplete data with stub implementation", () => {
    const incompleteUser = createTestUser({
      favoriteColor: "",
      hobbies: "",
      specialRequest: ""
    });
    
    const result = PlaceholderValidationService.validatePlaceholders(
      "{userName} likes {favoriteColor}. Hobbies: {hobbies}. Theme: {specialRequest}",
      incompleteUser
    );
    
    // Stub implementation always returns success
    expect(result.isValid).toBe(true);
    expect(result.validationScore).toBe(1.0);
    expect(result.recommendations).toContain('Validation handled by unified edge function');
  });

  it("handles unknown placeholders with stub implementation", () => {
    const user = createTestUser();
    const template = "Hello {userName} and {unknownPlaceholder}!";
    
    const result = PlaceholderValidationService.validatePlaceholders(template, user);
    
    // Stub implementation always returns success
    expect(result.isValid).toBe(true);
    expect(result.unresolvedPlaceholders).toHaveLength(0);
    expect(result.validationScore).toBe(1.0);
    expect(result.recommendations).toContain('Validation handled by unified edge function');
  });

  it("analyzes placeholder coverage with stub implementation", () => {
    const template = "Hello {name}, your favorite color is {favoriteColor}";
    
    const result = PlaceholderValidationService.analyzePlaceholderCoverage(template);
    
    // Test stub behavior
    expect(result.required).toHaveLength(0);
    expect(result.optional).toHaveLength(0);
    expect(result.found).toHaveLength(0);
    expect(result.missing).toHaveLength(0);
    expect(result.coverage).toBe(1.0);
  });
});

describe("DifficultyLevelMapper", () => {
  it("maps frontend to backend difficulty levels", () => {
    expect(DifficultyLevelMapper.toBackend("pre-reader")).toBe("beginner");
    expect(DifficultyLevelMapper.toBackend("beginner")).toBe("easy");
    expect(DifficultyLevelMapper.toBackend("developing")).toBe("medium");
    expect(DifficultyLevelMapper.toBackend("independent")).toBe("hard");
    expect(DifficultyLevelMapper.toBackend("advanced")).toBe("expert");
  });

  it("maps backend to frontend difficulty levels", () => {
    expect(DifficultyLevelMapper.toFrontend("beginner")).toBe("pre-reader");
    expect(DifficultyLevelMapper.toFrontend("easy")).toBe("beginner");
    expect(DifficultyLevelMapper.toFrontend("medium")).toBe("developing");
    expect(DifficultyLevelMapper.toFrontend("hard")).toBe("independent");
    expect(DifficultyLevelMapper.toFrontend("expert")).toBe("advanced");
  });

  it("normalizes various difficulty level formats", () => {
    expect(DifficultyLevelMapper.normalizeLevel("pre-reader")).toBe("beginner");
    expect(DifficultyLevelMapper.normalizeLevel("easy")).toBe("easy");
    expect(DifficultyLevelMapper.normalizeLevel("developing")).toBe("medium");
    expect(DifficultyLevelMapper.normalizeLevel("unknown")).toBe("easy"); // fallback
  });

  it("validates difficulty levels correctly", () => {
    expect(DifficultyLevelMapper.isValidBackendLevel("beginner")).toBe(true);
    expect(DifficultyLevelMapper.isValidBackendLevel("expert")).toBe(true);
    expect(DifficultyLevelMapper.isValidBackendLevel("invalid")).toBe(false);
    
    expect(DifficultyLevelMapper.isValidFrontendLevel("pre-reader")).toBe(true);
    expect(DifficultyLevelMapper.isValidFrontendLevel("advanced")).toBe(true);
    expect(DifficultyLevelMapper.isValidFrontendLevel("invalid")).toBe(false);
  });

  it("provides display names correctly", () => {
    expect(DifficultyLevelMapper.getDisplayName("beginner")).toBe("Beginner");
    expect(DifficultyLevelMapper.getDisplayName("pre-reader")).toBe("Pre-Reader");
    expect(DifficultyLevelMapper.getDisplayName("unknown")).toBe("unknown");
  });

  it("gets style framework key with fallback", () => {
    expect(DifficultyLevelMapper.getStyleFrameworkKey("beginner")).toBe("beginner");
    expect(DifficultyLevelMapper.getStyleFrameworkKey("unknown")).toBe("easy");
  });

  it("returns all mappings", () => {
    const mappings = DifficultyLevelMapper.getAllMappings();
    expect(mappings).toHaveLength(5);
    expect(mappings[0].backend).toBe("beginner");
    expect(mappings[0].frontend).toBe("pre-reader");
  });
});

// Note: Character system functionality has been consolidated into backend CharacterConsistencyService
// Tests for character generation should be performed via edge function integration tests