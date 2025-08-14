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

  it("applies age-appropriate filtering", () => {
    const youngUser = makeUser({ 
      age: 4, 
      specialRequest: "theme: violence and friendship" 
    });
    const ti = extractThemeIntent(youngUser);
    
    // Should filter out violence for 4-year-old
    expect(ti.themes).toContain("friendship");
    expect(ti.themes).not.toContain("violence");
  });

  it("includes validation information when requested", () => {
    const user = makeUser({ 
      age: 6, 
      specialRequest: "theme: mystery and danger" 
    });
    const tiWithValidation = extractThemeIntentWithValidation(user);
    
    expect(tiWithValidation.validation).toBeDefined();
    expect(tiWithValidation.validation.rejectedThemes).toContain("danger");
    expect(tiWithValidation.themes).toContain("mystery");
    expect(tiWithValidation.themes).not.toContain("danger");
  });

  it("handles complex theme requests with age filtering", () => {
    const user = makeUser({ 
      age: 10, 
      specialRequest: "theme: friendship, romance, violence, adventure; tone: exciting" 
    });
    const ti = extractThemeIntent(user);
    
    // 10-year-old should get romance but not violence
    expect(ti.themes).toEqual(expect.arrayContaining(["friendship", "adventure", "romance"]));
    expect(ti.themes).not.toContain("violence");
    expect(ti.tone).toContain("exciting");
  });
});
