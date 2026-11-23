// Guard (26 Oct 2026): Read to Me played stories at 1.0x and the owner found it slow; whole
// stories now default to TTS_CONFIG.STORY_NARRATION_SPEED. (Clarity, which this file also
// guarded, was removed on 22 Nov 2026: src/test/guards/banned-hosts.test.ts.)
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { TTS_CONFIG } from "@/config/ttsConfig";

const read = (rel: string) => readFileSync(join(__dirname, "../../..", rel), "utf8");

describe("Read to Me pace", () => {
  it("stories default to a pace above 1.0x and below a rushed 1.3x", () => {
    expect(TTS_CONFIG.STORY_NARRATION_SPEED).toBeGreaterThan(1);
    expect(TTS_CONFIG.STORY_NARRATION_SPEED).toBeLessThanOrEqual(1.3);
  });
  it("charlotteReadStory uses that pace when no speed is passed", () => {
    expect(read("src/services/CharlotteVoiceService.ts")).toMatch(
      /charlotteReadStory\([\s\S]{0,120}?speed: number = TTS_CONFIG\.STORY_NARRATION_SPEED\)/,
    );
  });
});

