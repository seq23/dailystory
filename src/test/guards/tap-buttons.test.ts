// Guard: what the final live tests (27 Oct 2026, phone 390) found on the reading screen and quiz.
//  - A normal tap (~120 ms) on "Check my answer", Save and Finish Story did nothing: taps under
//    200 ms were thrown away, and a mouse/trackpad click on a touch device did nothing at all.
//  - Saving twice in one session added two library entries (a new id on every save).
//  - The timer reached 0:00 while a new story was being written: the app went to
//    /session-ended and the new story was lost.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLongPressButton } from "@/hooks/useLongPressButton";

const read = (rel: string) => readFileSync(join(__dirname, "../../..", rel), "utf8");
const touch = (x = 10, y = 10) => ({ touches: [{ clientX: x, clientY: y }], preventDefault: () => {}, stopPropagation: () => {} }) as unknown as React.TouchEvent;

describe("buttons on touch screens answer every tap", () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it("a quick tap (60 ms and 120 ms) presses the button once", () => {
    for (const ms of [60, 120]) {
      const onClick = vi.fn();
      const { result } = renderHook(() => useLongPressButton(onClick, { duration: 500 }));
      act(() => { result.current.onTouchStart(touch()); vi.advanceTimersByTime(ms); result.current.onTouchEnd(touch()); });
      expect(onClick).toHaveBeenCalledTimes(1);
    }
  });
  it("a long press presses it once, not twice", () => {
    const onClick = vi.fn();
    const { result } = renderHook(() => useLongPressButton(onClick, { duration: 500 }));
    act(() => { result.current.onTouchStart(touch()); vi.advanceTimersByTime(700); result.current.onTouchEnd(touch()); });
    expect(onClick).toHaveBeenCalledTimes(1);
  });
  it("a finger sliding to scroll the page does not press it", () => {
    const onClick = vi.fn();
    const { result } = renderHook(() => useLongPressButton(onClick, { duration: 500 }));
    act(() => { result.current.onTouchStart(touch(10, 10)); result.current.onTouchMove(touch(10, 60)); vi.advanceTimersByTime(700); result.current.onTouchEnd(touch(10, 60)); });
    expect(onClick).not.toHaveBeenCalled();
  });
  it("a mouse or keyboard click works on a touch device; the click after a tap is not counted twice", () => {
    const onClick = vi.fn();
    const { result } = renderHook(() => useLongPressButton(onClick, { duration: 500 }));
    expect(typeof result.current.onClick).toBe("function");
    act(() => { result.current.onClick!(); });
    expect(onClick).toHaveBeenCalledTimes(1);
    act(() => { result.current.onTouchStart(touch()); vi.advanceTimersByTime(100); result.current.onTouchEnd(touch()); result.current.onClick!(); });
    expect(onClick).toHaveBeenCalledTimes(2);
  });
});

describe("one library entry per story", () => {
  it("Save reuses the story's id: the library story's own, else one per story in this session", () => {
    const d = read("src/components/CleanStoryDisplay.tsx");
    const fn = d.slice(d.indexOf("const handleSaveStoryNow = async"), d.indexOf("const handleExtendTime"));
    expect(fn).toMatch(/id: storyIdForSave\(\),/);
    expect(fn).not.toMatch(/generateSessionIdWithPrefix\('story'\)/);
    const idFn = d.slice(d.indexOf("const storyIdForSave = ()"), d.indexOf("const handleSaveStoryNow = async"));
    expect(idFn).toMatch(/if \(currentStory\?\.isFromSavedStory && currentStory\?\.id\) return String\(currentStory\.id\);/);
    expect(idFn).toMatch(/if \(!saveIdRef\.current \|\| saveIdRef\.current\.first !== first\)/);
  });
});

describe("time running out while a new story is being written", () => {
  it("both countdowns give the new story a fresh session instead of ending it", () => {
    const hook = read("src/hooks/useStoryLogic.tsx");
    const hc = hook.slice(hook.indexOf("// Timer countdown effect"));
    expect(hc).toMatch(/if \(prev <= 1\) \{\s*if \(deferSessionEndRef\.current\?\.\(\)\) return SESSION_SECONDS;\s*setIsTimerRunning\(false\);\s*if \(onSessionEnded\)/);
    const d = read("src/components/CleanStoryDisplay.tsx");
    expect(d).toMatch(/deferSessionEnd: \(\) => newStoryWritingRef\.current,/);
    expect(d).toMatch(/newStoryWritingRef\.current = isGeneratingNewStory \|\| isGeneratingRewrite \|\| \(isLoading && story\.length === 0\);/);
    const dc = d.slice(d.indexOf("// Timer countdown effect"));
    expect(dc).toMatch(/if \(prev <= 1\) \{[\s\S]{0,120}if \(newStoryWritingRef\.current\) return SESSION_SECONDS;\s*setIsTimerRunning\(false\);/);
  });
});
