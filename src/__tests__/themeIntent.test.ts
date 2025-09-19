import { describe, it, expect } from "vitest";
import { extractThemeIntent, extractThemeIntentWithValidation } from "@/utils/themeIntent";
import type { UserInfo } from "@/types";

const makeUser = (overrides: Partial<UserInfo> = {}): UserInfo => ({
  name: "Avery Johnson",
  age: 8,
  grade: "3",
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
  it("extracts themes from specialRequest", () => {
    const user = makeUser();
    const ti = extractThemeIntent(user);
    expect(ti.theme).toEqual(expect.arrayContaining(["courage", "kindness"]));
    expect(ti.keywords).toEqual(expect.arrayContaining(["playful", "gentle"]));
  });

  it("returns empty themes when no explicit themes in specialRequest", () => {
    const user = makeUser({ specialRequest: "", hobbies: "science club" });
    const ti = extractThemeIntent(user);
    expect(ti.theme).toEqual([]);
  });

  it("filters inappropriate themes for safety", () => {
    const youngUser = makeUser({ 
      age: 4, 
      specialRequest: "theme: monsters and friendship" 
    });
    const ti = extractThemeIntent(youngUser);
    
    // Should filter out inappropriate themes but keep safe ones
    expect(ti.theme).toContain("friendship");
    expect(ti.theme).not.toContain("monsters"); // Filtered out as inappropriate
  });

  it("includes validation information when requested", () => {
    const user = makeUser({ 
      age: 6, 
      specialRequest: "theme: mystery and dangerous" 
    });
    const tiWithValidation = extractThemeIntentWithValidation(user);
    
    expect(tiWithValidation.validation).toBeDefined();
    expect(tiWithValidation.validation.rejectedThemes.length).toBeGreaterThan(0);
    expect(tiWithValidation.theme).toContain("mystery");
    expect(tiWithValidation.theme).not.toContain("dangerous"); // Should be filtered
  });

  it("handles complex theme requests with appropriate filtering", () => {
    const user = makeUser({ 
      age: 10, 
      specialRequest: "theme: friendship, romance, monsters, adventure; tone: exciting" 
    });
    const ti = extractThemeIntent(user);
    
    // Should filter inappropriate themes but keep safe ones
    expect(ti.theme).toEqual(expect.arrayContaining(["friendship", "adventure"]));
    expect(ti.theme).not.toContain("romance"); // Filtered for children
    expect(ti.theme).not.toContain("monsters"); // Filtered as potentially scary
    expect(ti.keywords).toContain("exciting");
  });

  it("does not add themes from hobbies/interests automatically", () => {
    const user = makeUser({ 
      specialRequest: "", 
      hobbies: "art, science",
      favoriteAnimal: "dolphin",
      favoriteColor: "blue",
      favoriteFood: "pizza"
    });
    const ti = extractThemeIntent(user);
    
    // Should not automatically add themes like creativity, discovery, nature, identity, family
    expect(ti.theme).toEqual([]);
  });
});
