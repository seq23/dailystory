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
  it("validates all core placeholders are resolved", () => {
    const user = createTestUser();
    const template = "Hi {userName}! You love {favoriteColor} and {favoriteAnimal}. Your hobbies include {hobbies} and you enjoy eating {favoriteFood}. Today's story theme: {specialRequest}";
    
    const result = PlaceholderValidationService.validatePlaceholders(template, user);
    
    expect(result.isValid).toBe(true);
    expect(result.unresolvedPlaceholders).toHaveLength(0);
    expect(result.missingPlaceholders).toHaveLength(0);
    expect(result.validationScore).toBeGreaterThan(0.9);
    expect(result.resolvedText).toContain("Emma");
    expect(result.resolvedText).toContain("purple");
    expect(result.resolvedText).toContain("butterfly");
    expect(result.resolvedText).toContain("painting and dancing");
    expect(result.resolvedText).toContain("strawberries");
    expect(result.resolvedText).toContain("friendship and courage");
  });

  it("identifies missing user data", () => {
    const incompleteUser = createTestUser({
      favoriteColor: "",
      hobbies: "",
      specialRequest: ""
    });
    
    const result = PlaceholderValidationService.validatePlaceholders(
      "{userName} likes {favoriteColor}. Hobbies: {hobbies}. Theme: {specialRequest}",
      incompleteUser
    );
    
    expect(result.isValid).toBe(false);
    expect(result.missingPlaceholders).toContain("favoriteColor");
    expect(result.missingPlaceholders).toContain("hobbies");
    expect(result.missingPlaceholders).toContain("specialRequest");
    expect(result.validationScore).toBeLessThan(0.5);
  });

  it("handles unresolved placeholders gracefully", () => {
    const user = createTestUser();
    const template = "Hello {userName} and {unknownPlaceholder}!";
    
    const result = PlaceholderValidationService.validatePlaceholders(template, user);
    
    expect(result.isValid).toBe(false);
    expect(result.unresolvedPlaceholders).toContain("unknownPlaceholder");
    expect(result.resolvedText).toContain("Emma");
    expect(result.resolvedText).not.toContain("unknownPlaceholder");
  });

  it("validates user data completeness", () => {
    const user = createTestUser();
    const result = PlaceholderValidationService.validateUserDataCompleteness(user);
    
    expect(result.isComplete).toBe(true);
    expect(result.missingFields).toHaveLength(0);
    expect(result.completeness).toBe(1);
    expect(result.recommendations).toContain("User profile is complete!");
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

  it("validates difficulty levels", () => {
    expect(DifficultyLevelMapper.isValidBackendLevel("beginner")).toBe(true);
    expect(DifficultyLevelMapper.isValidBackendLevel("expert")).toBe(true);
    expect(DifficultyLevelMapper.isValidBackendLevel("invalid")).toBe(false);
    
    expect(DifficultyLevelMapper.isValidFrontendLevel("pre-reader")).toBe(true);
    expect(DifficultyLevelMapper.isValidFrontendLevel("advanced")).toBe(true);
    expect(DifficultyLevelMapper.isValidFrontendLevel("invalid")).toBe(false);
  });
});

// Note: Character system functionality has been consolidated into backend CharacterConsistencyService
// Tests for character generation should be performed via edge function integration tests