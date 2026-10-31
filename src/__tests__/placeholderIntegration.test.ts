import { describe, it, expect } from "vitest";
import { PlaceholderValidationService } from "@/services/PlaceholderValidationService";
import { DifficultyLevelMapper } from "@/services/DifficultyLevelMapper";
import type { UserInfo } from "@/types";

function createTestUser(overrides: Partial<UserInfo> = {}): UserInfo {
  return {
    name: "Tavi Wizzle",
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
  it("validates all core placeholders", () => {
    const user = createTestUser();
    const template = "Hi {userName}! You love {favoriteColor} and {favoriteAnimal}. Your hobbies include {hobbies} and you enjoy eating {favoriteFood}. Today's story theme: {specialRequest}";
    
    const result = PlaceholderValidationService.validatePlaceholders(template, user);
    
    expect(result.isValid).toBe(true);
    expect(result.missingPlaceholders).toHaveLength(0);
    expect(result.unresolvedPlaceholders).toHaveLength(0);
    expect(result.validationScore).toBe(1.0);
    expect(result.recommendations).toEqual([]);
    expect(result.resolvedText).toBe(`Hi ${user.name}! You love purple and butterfly. Your hobbies include painting and dancing and you enjoy eating strawberries. Today's story theme: theme: friendship and courage`);
  });

  it("validates user data completeness", () => {
    const user = createTestUser();
    const result = PlaceholderValidationService.validateUserDataCompleteness(user);
    
    expect(result.isComplete).toBe(true);
    expect(result.missingFields).toHaveLength(0);
    expect(result.completeness).toBe(1.0);
    expect(result.recommendations).toEqual(["Excellent profile completeness!"]);
  });

  it("handles incomplete data", () => {
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
    expect(result.missingPlaceholders).toEqual(['favoriteColor', 'hobbies', 'specialRequest']);
    expect(result.unresolvedPlaceholders).toEqual(result.missingPlaceholders);
    expect(result.resolvedText).toBe(`${incompleteUser.name} likes {favoriteColor}. Hobbies: {hobbies}. Theme: {specialRequest}`);
    expect(result.validationScore).toBeCloseTo(0.7);
    expect(result.recommendations[0]).toBe('Missing data for placeholders: favoriteColor, hobbies, specialRequest');
  });

  it("handles unknown placeholders", () => {
    const user = createTestUser();
    const template = "Hello {userName} and {unknownPlaceholder}!";
    
    const result = PlaceholderValidationService.validatePlaceholders(template, user);
    
    expect(result.isValid).toBe(false);
    expect(result.missingPlaceholders).toEqual(['unknownPlaceholder']);
    expect(result.unresolvedPlaceholders).toEqual(['unknownPlaceholder']);
    expect(result.resolvedText).toBe(`Hello ${user.name} and {unknownPlaceholder}!`);
    expect(result.validationScore).toBe(0.9);
    expect(result.recommendations).toEqual(['Missing data for placeholders: unknownPlaceholder']);
  });

  it("analyzes placeholder coverage", () => {
    const template = "Hello {name}, your favorite color is {favoriteColor}";
    
    const result = PlaceholderValidationService.analyzePlaceholderCoverage(template);
    
    expect(result.required).toEqual(["name", "favoriteColor", "favoriteAnimal"]);
    expect(result.optional).toEqual(["favoriteFood", "hobbies", "specialRequest", "age"]);
    expect(result.found).toEqual(["name", "favoriteColor"]);
    expect(result.missing).toEqual(["favoriteAnimal"]);
    expect(result.coverage).toBe(2 / 7);
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
    // "beginner" is a FRONTEND value that maps to backend "easy" - NOT backend "beginner" (pre-reader)
    expect(DifficultyLevelMapper.normalizeLevel("beginner")).toBe("easy");
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
    // "beginner" is a FRONTEND value → maps to backend "easy"
    expect(DifficultyLevelMapper.getStyleFrameworkKey("beginner")).toBe("easy");
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