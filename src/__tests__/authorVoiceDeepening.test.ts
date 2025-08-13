import { describe, it, expect } from "vitest";
import { applyAuthorVoice, getAuthorVoiceForUser } from "@/constants/authorVoicePatterns";
import type { UserInfo } from "@/types";

const user: UserInfo = {
  name: "Avery",
  age: 7,
  grade: "2nd",
  nativeLanguage: "en",
  learningGoal: "improve-english-reading",
  avatar: { type: "prefer-not-to-answer", skinTone: "medium" },
  favoriteColor: "blue",
  favoriteAnimal: "fox",
  hobbies: "drawing",
  favoriteFood: "pancakes",
  specialRequest: "themes: friendship, discovery",
  difficultyLevel: "medium",
};

describe("authorVoiceDeepening", () => {
  it("applies voice pattern without leaking placeholders", () => {
    const voice = getAuthorVoiceForUser(user, "medium");
    const content = "Avery walked to the park. It was a sunny day.";
    const out = applyAuthorVoice(content, voice, "opening");
    expect(out.length).toBeGreaterThan(0);
    expect(out).not.toMatch(/\{[^}]+\}/);
  });
});
