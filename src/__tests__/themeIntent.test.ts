import { describe, it, expect } from "vitest";
import { extractThemeIntent } from "@/utils/themeIntent";
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
});
