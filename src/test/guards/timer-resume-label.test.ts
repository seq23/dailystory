// Guard (26 Oct 2026): a paused reading timer said "Start", which reads like starting over.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const src = readFileSync(join(__dirname, "../../..", "src/components/CollapsibleFloatingTimer.tsx"), "utf8");

describe("reading timer button", () => {
  it("says Resume once the timer has run", () => {
    expect(src).toMatch(/\{isReading \? uiText\("Pause"\) : startedOnce \? uiText\("Resume"\) : uiText\("Start"\)\}/);
    expect(src).toMatch(/useEffect\(\(\) => \{ if \(isReading\) setStartedOnce\(true\); \}, \[isReading\]\)/);
  });
});
