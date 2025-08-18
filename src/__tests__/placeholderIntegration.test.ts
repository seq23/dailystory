import { describe, it, expect } from "vitest";
import { PlaceholderValidationService } from "@/services/PlaceholderValidationService";
import { DifficultyLevelMapper } from "@/services/DifficultyLevelMapper";
import { AdvancedCharacterEngine } from "@/services/AdvancedCharacterEngine";
import { StructuredPromptEngine } from "@/services/StructuredPromptEngine";
import type { UserInfo } from "@/types";

function createTestUser(overrides: Partial<UserInfo> = {}): UserInfo {
  return {
    name: "Emma Johnson",
    age: 8,
    grade: "3rd",
    nativeLanguage: "en",
    learningGoal: "improve-english-reading",
    avatar: { type: "girl", skinTone: "light" },
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

describe("AdvancedCharacterEngine Integration", () => {
  it("detects characters using resolved placeholders", () => {
    const user = createTestUser();
    const storyText = "{userName} met her friend at the park. Her mother watched them play.";
    
    const characters = AdvancedCharacterEngine.detectCharactersInText(
      storyText,
      "test-session",
      user,
      1
    );
    
    // Should detect primary character (Emma) and family member (mother)
    expect(characters.length).toBeGreaterThan(0);
    
    const primaryChar = characters.find(c => c.type === 'primary');
    expect(primaryChar).toBeDefined();
    expect(primaryChar?.name).toBe("Emma"); // resolved from {userName}
    
    const motherChar = characters.find(c => c.relationshipToMain === 'mother');
    expect(motherChar).toBeDefined();
  });

  it("maintains character consistency across pages", () => {
    const user = createTestUser();
    
    // First page
    const chars1 = AdvancedCharacterEngine.detectCharactersInText(
      "{userName} played with her sister.",
      "test-session",
      user,
      1
    );
    
    // Second page
    const chars2 = AdvancedCharacterEngine.detectCharactersInText(
      "{userName} and her sister went home.",
      "test-session",
      user,
      2
    );
    
    const primary1 = chars1.find(c => c.type === 'primary');
    const primary2 = chars2.find(c => c.type === 'primary');
    
    expect(primary1?.name).toBe(primary2?.name);
    expect(primary1?.physicalTraits).toBe(primary2?.physicalTraits);
  });
});

describe("StructuredPromptEngine Integration", () => {
  it("composes prompts with resolved placeholders", () => {
    const user = createTestUser();
    const storyText = "{userName} explored the {favoriteColor} garden with a {favoriteAnimal}.";
    
    const characters = AdvancedCharacterEngine.detectCharactersInText(
      storyText,
      "test-session",
      user,
      1
    );
    
    const template = StructuredPromptEngine.composeStructuredPrompt(
      storyText,
      user,
      1,
      characters
    );
    
    const finalPrompt = StructuredPromptEngine.templateToPrompt(template);
    
    expect(finalPrompt).toContain("Emma"); // resolved userName
    expect(finalPrompt).toContain("purple"); // favoriteColor
    expect(finalPrompt).toContain("butterfly"); // favoriteAnimal
    expect(finalPrompt).not.toMatch(/\{[^}]+\}/); // no unresolved placeholders
  });

  it("handles difficulty level mapping in style frameworks", () => {
    const user = createTestUser({ readingLevel: "developing" }); // frontend format
    
    const template = StructuredPromptEngine.composeStructuredPrompt(
      "Simple story text",
      user,
      1,
      []
    );
    
    // Should map "developing" -> "medium" and use appropriate style
    expect(template.styleFramework).toContain("Children's book art style");
    expect(template.styleFramework).toContain("detailed characters");
  });

  it("integrates user preferences into scene composition", () => {
    const user = createTestUser({
      favoriteColor: "emerald",
      specialRequest: "theme: magical forest adventure"
    });
    
    const template = StructuredPromptEngine.composeStructuredPrompt(
      "{userName} discovered a magical place.",
      user,
      1,
      []
    );
    
    expect(template.sceneDescription).toContain("emerald"); // favoriteColor integration
    expect(template.culturalSetting).toContain("magical forest adventure"); // specialRequest theme
  });
});

describe("End-to-End Placeholder Integration", () => {
  it("processes complete story pipeline with all placeholders", () => {
    const user = createTestUser();
    const storyText = `{userName} loved her {favoriteColor} dress. She went to the park where she saw a beautiful {favoriteAnimal}. 
                      Her favorite activity was {hobbies}, and today felt like a perfect day for {specialRequest}.`;
    
    // Step 1: Validate placeholders
    const validation = PlaceholderValidationService.validatePlaceholders(storyText, user);
    expect(validation.isValid).toBe(true);
    
    // Step 2: Detect characters with resolved text
    const characters = AdvancedCharacterEngine.detectCharactersInText(
      validation.resolvedText,
      "test-session",
      user,
      1
    );
    expect(characters.length).toBeGreaterThan(0);
    
    // Step 3: Generate structured prompt
    const template = StructuredPromptEngine.composeStructuredPrompt(
      validation.resolvedText,
      user,
      1,
      characters
    );
    
    const finalPrompt = StructuredPromptEngine.templateToPrompt(template);
    
    // Verify all user data is integrated
    expect(finalPrompt).toContain("Emma");
    expect(finalPrompt).toContain("purple");
    expect(finalPrompt).toContain("butterfly");
    expect(finalPrompt).toContain("painting");
    expect(finalPrompt).toContain("friendship");
    expect(finalPrompt).not.toMatch(/\{[^}]+\}/);
  });
});