import React from "react";
import { render, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock CleanStoryDisplay to avoid heavy dependencies in tests
vi.mock("@/components/CleanStoryDisplay", () => ({
  __esModule: true,
  default: () => <div data-testid="clean-story-display" />,
}));

import { FreeReadingSession } from "@/components/FreeReadingSession";

describe("Guest Images Enforcement", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("forces storyImagesEnabled=1 when FreeReadingSession mounts", () => {
    // Pre-set to disabled to simulate regression state
    localStorage.setItem("storyImagesEnabled", "0");

    const dispatchSpy = vi.spyOn(window, "dispatchEvent");

    render(
      <FreeReadingSession
        userInfo={{ name: "Guest", age: 7, difficultyLevel: "beginner", nativeLanguage: "en" } as any}
        onUpgrade={() => {}}
        onCreateAccount={() => {}}
        isPremium={false}
      />
    );

    expect(localStorage.getItem("storyImagesEnabled")).toBe("1");
    expect(
      dispatchSpy.mock.calls.some(
        (args) => args[0] instanceof CustomEvent && (args[0] as CustomEvent).type === "storyImagesToggle" && (args[0] as CustomEvent).detail === true
      )
    ).toBe(true);
  });
});
