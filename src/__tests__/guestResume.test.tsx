import React from "react";
import { render, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock CleanStoryDisplay so reading state is lightweight
vi.mock("@/components/CleanStoryDisplay", () => ({
  __esModule: true,
  default: () => <div data-testid="clean-story-display" />,
}));

import { StorySessionCache } from "@/services/storySessionCache";
import { guestSession } from "@/utils/guestSession";
import { GuestExperience } from "@/components/GuestExperience";

const baseUser = { name: "Guest", age: 7, difficultyLevel: "beginner", nativeLanguage: "en" } as any;

describe("Guest resume on refresh", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("resumes reading when guest session active and timer not expired", () => {
    // Prepare guest session
    guestSession.setActive(true);
    guestSession.saveUserInfo(baseUser);
    guestSession.saveTimerEndTs(Date.now() + 5 * 60 * 1000);
    StorySessionCache.cacheStorySession(
      'guest',
      'beginner' as any,
      ["Page 1", "Page 2"],
      [],
      1,
      { isPremium: false }
    );

    const { getByTestId } = render(<GuestExperience />);
    expect(getByTestId("clean-story-display")).toBeInTheDocument();
  });

  it("does not resume when timer is expired", () => {
    guestSession.setActive(true);
    guestSession.saveUserInfo(baseUser);
    guestSession.saveTimerEndTs(Date.now() - 1000);
    StorySessionCache.cacheStorySession('guest', 'beginner' as any, ["P1"], [], 0, { isPremium: false });

    const { queryByTestId } = render(<GuestExperience />);
    expect(queryByTestId("clean-story-display")).toBeNull();
  });
});
