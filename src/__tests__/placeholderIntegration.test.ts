import { describe, it, expect } from "vitest";
import { UnifiedValidationService as PlaceholderValidationService } from "@/services/UnifiedValidationService";
import { DifficultyLevelMapper } from "@/services/DifficultyLevelMapper";
import { UnifiedCharacterDescriptor } from "@/services/UnifiedCharacterDescriptor";
import type { UserInfo } from "@/types";

function createTestUser(overrides: Partial<UserInfo> = {}): UserInfo {
  return {
    name: "Emma Johnson",
    age: 8,
    grade: "3rd",
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

describe("Unified Character System Integration", () => {
  it("generates primary character with consolidated system", () => {
    const user = createTestUser();
    
    const primaryChar = UnifiedCharacterDescriptor.generatePrimaryCharacter(user, "medium", "test-session");
    
    expect(primaryChar).toBeDefined();
    expect(primaryChar.name).toBe("Emma");
    expect(primaryChar.type).toBe("primary");
    expect(primaryChar.relationshipToMain).toBe("self");
    expect(primaryChar.ageCategory).toBe("child");
  });

  it("generates secondary characters with cultural authenticity", () => {
    const user = createTestUser({ nativeLanguage: "es" }); // Spanish user
    
    const mother = UnifiedCharacterDescriptor.generateSecondaryCharacter(
      "family",
      { relationship: "mother" },
      user,
      "test-session"
    );
    
    expect(mother).toBeDefined();
    expect((mother as any).type).toBe("family");
    expect((mother as any).relationshipToMain).toBe("mother");
    expect((mother as any).ageCategory).toBe("adult");
  });

  it("generates animal characters as secondary characters", () => {
    const user = createTestUser();
    
    const animal = UnifiedCharacterDescriptor.generateSecondaryCharacter(
      "animal",
      { species: "dog", name: "Buddy", color: "brown", personality: "friendly" },
      user,
      "test-session"
    );
    
    expect(animal).toBeDefined();
    expect((animal as any).species).toBe("dog");
    expect((animal as any).name).toBe("Buddy");
    expect((animal as any).color).toBe("brown");
    expect((animal as any).personality).toBe("friendly");
  });

  it("maintains character consistency data across session", () => {
    const user = createTestUser();
    const sessionId = "test-session-consistency";
    
    // Generate multiple characters
    UnifiedCharacterDescriptor.generatePrimaryCharacter(user, "medium", sessionId);
    UnifiedCharacterDescriptor.generateSecondaryCharacter(
      "family",
      { relationship: "father" },
      user,
      sessionId
    );
    UnifiedCharacterDescriptor.generateSecondaryCharacter(
      "animal",
      { species: "cat", name: "Whiskers" },
      user,
      sessionId
    );
    
    const consistencyData = UnifiedCharacterDescriptor.getCharacterConsistencyData(sessionId);
    
    expect(consistencyData.sessionId).toBe(sessionId);
    expect(consistencyData.characters.length).toBeGreaterThan(0);
    expect(consistencyData.animals.length).toBeGreaterThan(0);
    expect(consistencyData.lastUpdated).toBeDefined();
  });

  it("enforces single animal per species rule", () => {
    const user = createTestUser();
    const sessionId = "test-session-single-animal";
    
    // Try to create two dogs
    const dog1 = UnifiedCharacterDescriptor.generateSecondaryCharacter(
      "animal",
      { species: "dog", name: "Max", color: "golden" },
      user,
      sessionId
    );
    
    const dog2 = UnifiedCharacterDescriptor.generateSecondaryCharacter(
      "animal",
      { species: "dog", name: "Rex", color: "brown" },
      user,
      sessionId
    );
    
    // Should be the same animal (updated with new details)
    expect((dog1 as any).species).toBe("dog");
    expect((dog2 as any).species).toBe("dog");
    expect((dog1 as any).seed).toBe((dog2 as any).seed);
  });
});

// Note: StructuredPromptEngine and AdvancedCharacterEngine functionality has been moved to:
// - Backend: MultiStageEnhancementPipeline.js for prompt composition
// - Frontend: UnifiedCharacterDescriptor for character generation
describe("Backend Migration Validation", () => {
  it("validates frontend services have been properly removed", () => {
    // This test serves as documentation that these services have been moved to backend
    expect(() => {
      // These imports should fail since files were deleted
      require('@/services/StructuredPromptEngine');
    }).toThrow();
    
    expect(() => {
      require('@/services/AdvancedCharacterEngine');
    }).toThrow();
  });

  it("validates UnifiedCharacterDescriptor provides consolidated API", () => {
    // Check all required methods are available in unified service
    expect(typeof UnifiedCharacterDescriptor.generatePrimaryCharacter).toBe("function");
    expect(typeof UnifiedCharacterDescriptor.generateSecondaryCharacter).toBe("function");
    expect(typeof UnifiedCharacterDescriptor.getCharacterConsistencyData).toBe("function");
    expect(typeof UnifiedCharacterDescriptor.clearSession).toBe("function");
    expect(typeof UnifiedCharacterDescriptor.getCharacterDescriptionSafe).toBe("function");
  });
});