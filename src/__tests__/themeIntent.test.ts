import { describe, it, expect } from "vitest";
import { extractThemeIntent, extractThemeIntentWithValidation } from "@/utils/themeIntent";
import type { UserInfo } from "@/types";

const makeUser = (overrides: Partial<UserInfo> = {}): UserInfo => ({
  name: "Avery Johnson",
  age: 8,
  grade: "3rd",
  nativeLanguage: "en",
  learningGoal: "improve-english-reading",
  avatar: { type: "prefer-not-to-answer", skinTone: "medium" },
  favoriteColor: "teal",
  favoriteAnimal: "fox",
  hobbies: "soccer, drawing",
  favoriteFood: "pancakes",
  specialRequest: "theme: courage and kindness; tone: playful, gentle",
  ...overrides,
});

describe("themeIntent", () => {
  it("extracts themes and tone from specialRequest", () => {
    const user = makeUser();
    const ti = extractThemeIntent(user);
    expect(ti.themes).toEqual(expect.arrayContaining(["courage", "kindness"]));
    expect(ti.tone).toEqual(expect.arrayContaining(["playful", "gentle"]));
  });

  it("falls back to interests when specialRequest absent", () => {
    const user = makeUser({ specialRequest: "", hobbies: "science club" });
    const ti = extractThemeIntent(user);
    expect(ti.themes).toEqual(expect.arrayContaining(["discovery"]));
  });

  it("includes all themes without filtering", () => {
    const youngUser = makeUser({ 
      age: 4, 
      specialRequest: "theme: monsters and friendship" 
    });
    const ti = extractThemeIntent(youngUser);
    
    // Should include all themes - adaptation handled in prompts
    expect(ti.themes).toContain("friendship");
    expect(ti.themes).toContain("monsters");
  });

  it("includes validation information when requested", () => {
    const user = makeUser({ 
      age: 6, 
      specialRequest: "theme: mystery and danger" 
    });
    const tiWithValidation = extractThemeIntentWithValidation(user);
    
    expect(tiWithValidation.validation).toBeDefined();
    expect(tiWithValidation.validation.rejectedThemes).toEqual([]);
    expect(tiWithValidation.themes).toContain("mystery");
    expect(tiWithValidation.themes).toContain("danger");
  });

  it("handles complex theme requests without filtering", () => {
    const user = makeUser({ 
      age: 10, 
      specialRequest: "theme: friendship, romance, monsters, adventure; tone: exciting" 
    });
    const ti = extractThemeIntent(user);
    
    // Should include all themes - adaptation handled in prompts
    expect(ti.themes).toEqual(expect.arrayContaining(["friendship", "adventure", "romance", "monsters"]));
    expect(ti.tone).toContain("exciting");
  });
});
