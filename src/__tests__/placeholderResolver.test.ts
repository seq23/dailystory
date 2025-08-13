import { describe, it, expect } from "vitest";
import { resolveCanonicalPlaceholders, resolveMicroPlaceholders, resolveAllPlaceholders } from "@/utils/placeholderResolver";
import type { UserInfo } from "@/types";

function makeUser(overrides: Partial<UserInfo> = {}): UserInfo {
  return {
    name: "Avery Johnson",
    age: 7,
    grade: "2nd",
    nativeLanguage: "en",
    learningGoal: "improve-english-reading",
    avatar: { type: "prefer-not-to-answer", skinTone: "medium" },
    favoriteColor: "teal",
    favoriteAnimal: "fox",
    hobbies: "soccer, drawing",
    favoriteFood: "pancakes",
    specialRequest: "theme: courage and kindness",
    ...overrides,
  };
}

describe("placeholderResolver - canonical", () => {
  it("replaces canonical placeholders from user info", () => {
    const user = makeUser();
    const input = "Hi {userName}, you like {favoriteColor} and {favoriteAnimal}. Your fave food is {favoriteFood}.";
    const out = resolveCanonicalPlaceholders(input, user);
    expect(out).toContain("Hi Avery"); // first name shortcut
    expect(out).toContain(user.favoriteColor);
    expect(out).toContain(user.favoriteAnimal);
    expect(out).toContain(user.favoriteFood);
    expect(out).not.toMatch(/\{[^}]+\}/); // no leftovers
  });
});

describe("placeholderResolver - micro tokens", () => {
  it("fills micro tokens using user info, seed, and fallbacks", () => {
    const user = makeUser({ avatar: { type: "boy", skinTone: "light" } });
    const pattern = "{userName} and {friend} ate {food} in the {setting}. {pronoun} felt very {adjective}.";
    const out = resolveMicroPlaceholders(pattern, { userInfo: user, seed: { userName: "Avery", adjective: "brave" }, pageText: "The foxes ran in the forest." });
    expect(out).toMatch(/Avery/);
    expect(out).toMatch(/(Sam|Alex|Riley|Taylor|Jordan|Casey)/);
    expect(out).toMatch(/pancakes|apple|sandwich|cookie|pizza|noodles/);
    expect(out).toMatch(/forest|park|garden|classroom|kitchen|playground/);
    expect(out).toContain("he"); // pronoun for boy
    expect(out).toContain("brave");
    expect(out).not.toMatch(/\{[^}]+\}/);
  });

  it("uses neutral they/them when gender not specified", () => {
    const user = makeUser({ avatar: { type: "prefer-not-to-answer", skinTone: "olive" } });
    const out = resolveMicroPlaceholders("{pronoun} explores.", { userInfo: user });
    expect(out).toBe("they explore.");
  });

  it("strips unresolved tokens cleanly", () => {
    const out = resolveMicroPlaceholders("Start {unknown} end.");
    expect(out).toBe("Start end.");
  });
});

describe("placeholderResolver - resolveAll", () => {
  it("applies canonical first, then micro", () => {
    const user = makeUser({ name: "Taylor Kim", favoriteAnimal: "turtle" });
    const pattern = "Hello {userName}. A {animal} and a {object}.";
    const out = resolveAllPlaceholders(pattern, { userInfo: user, pageText: "We saw a turtle by the pond." });
    expect(out).toMatch(/Hello Taylor/);
    expect(out).toMatch(/turtle/);
    expect(out).not.toMatch(/\{[^}]+\}/);
  });
});
