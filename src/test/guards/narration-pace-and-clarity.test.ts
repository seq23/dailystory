// Guard (26 Oct 2026): Read to Me played stories at 1.0x and the owner found it slow; whole
// stories now default to TTS_CONFIG.STORY_NARRATION_SPEED. And Clarity kept recording a family
// that signed in during a visit (index.html only checks at load), so sign-in stops it.
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

describe("Clarity never records a signed-in family", () => {
  it("sign-in during a visit stops Clarity", () => {
    expect(read("src/main.tsx")).toMatch(/onAuthStateChange\([\s\S]{0,200}session && typeof clarity === 'function'\) clarity\('stop'\)/);
  });
  it("arriving from a sign-in link never starts Clarity", () => {
    const loader = read("src/hooks/useParentFormClarity.ts");
    const tag = loader.indexOf("clarity.ms/tag");
    const skip = loader.indexOf("access_token=|type=(magiclink|signup|recovery|invite)");
    expect(skip).toBeGreaterThan(0);
    expect(skip).toBeLessThan(tag);
  });
});
