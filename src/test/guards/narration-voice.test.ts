// Guard: which voice reads to the child (25 Oct 2026, docs/PRICING.md "Narration").
// Free and guest readers get the browser voice ($0). Premium gets Charlotte (ElevenLabs);
// when ElevenLabs refuses for any reason the same text is read ONCE in the browser voice,
// after Charlotte is silenced — never silence, never two voices at once.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TTS_CONFIG, getTTSProvider } from "@/config/ttsConfig";
import {
  NarrationFailedError,
  getNarrationFallbackCount,
  narrate,
  resetNarrationFallbackCount,
  setNarrationPremium,
} from "@/services/narrationRouter";
import { SynchronizedElevenLabsTTS } from "@/services/SynchronizedElevenLabsTTS";
import { SmartElevenLabsTTS } from "@/services/smartElevenLabsTTS";
import { BrowserTTSService } from "@/services/BrowserTTSService";
import { CharlotteVoiceService } from "@/services/CharlotteVoiceService";

const ROOT = join(__dirname, "../../..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");

/** Two fake voices that record overlap: a voice may only start when the other is silent. */
function voices(premiumBehaviour: () => Promise<void>) {
  const log: string[] = [];
  let premiumActive = false;
  let browserActive = false;
  let overlap = false;
  return {
    log,
    get overlap() { return overlap; },
    premium: vi.fn(async () => {
      if (browserActive) overlap = true;
      premiumActive = true;
      log.push("premium:start");
      await premiumBehaviour(); // a refusal rejects here, with Charlotte still "on"
      premiumActive = false;
      log.push("premium:end");
    }),
    stopPremium: vi.fn(() => { premiumActive = false; log.push("premium:stop"); }),
    browser: vi.fn(async () => {
      if (premiumActive) overlap = true;
      browserActive = true;
      log.push("browser:start");
      await Promise.resolve();
      browserActive = false;
      log.push("browser:end");
    }),
  };
}

beforeEach(() => resetNarrationFallbackCount());
afterEach(() => { setNarrationPremium(false); vi.restoreAllMocks(); });

describe("tier → voice", () => {
  it("free and guest readers get the browser voice; premium gets ElevenLabs", () => {
    expect(TTS_CONFIG.GUEST_TTS_PROVIDER).toBe("browser");
    expect(TTS_CONFIG.PREMIUM_TTS_PROVIDER).toBe("elevenlabs");
    expect(getTTSProvider(false)).toBe("browser");
    expect(getTTSProvider(true)).toBe("elevenlabs");
  });

  it("a guest never reaches ElevenLabs", async () => {
    const v = voices(async () => {});
    const out = await narrate({ label: "t", provider: getTTSProvider(false), ...v });
    expect(out).toBe("browser");
    expect(v.premium).not.toHaveBeenCalled();
    expect(v.browser).toHaveBeenCalledTimes(1);
    expect(getNarrationFallbackCount()).toBe(0);
  });

  it("premium plays Charlotte and nothing else when ElevenLabs answers", async () => {
    const v = voices(async () => {});
    const out = await narrate({ label: "t", provider: getTTSProvider(true), ...v });
    expect(out).toBe("elevenlabs");
    expect(v.browser).not.toHaveBeenCalled();
    expect(v.stopPremium).not.toHaveBeenCalled();
  });
});

describe("an ElevenLabs refusal → one browser fallback, never two voices", () => {
  const refusals = [
    "Smart TTS failed: Edge Function returned a non-2xx status code (402)",
    "ElevenLabs API error: 401",
    "ElevenLabs API error: 429",
    "quota_exceeded: This request exceeds your quota",
    "TTS request timeout after 15000ms - falling back to browser speech",
    "No audio content received from Synchronized TTS",
    "TTS circuit breaker open - ElevenLabs service unavailable",
  ];
  for (const reason of refusals) {
    it(`falls back once on: ${reason.slice(0, 48)}`, async () => {
      const events: unknown[] = [];
      const onEvent = (e: Event) => events.push((e as CustomEvent).detail);
      window.addEventListener("audio:fallback", onEvent);
      const v = voices(async () => { throw new Error(reason); });
      const out = await narrate({ label: "story", provider: "elevenlabs", ...v });
      window.removeEventListener("audio:fallback", onEvent);
      expect(out).toBe("browser-fallback");
      expect(v.browser).toHaveBeenCalledTimes(1);
      expect(v.log).toEqual(["premium:start", "premium:stop", "browser:start", "browser:end"]);
      expect(v.overlap).toBe(false);
      expect(getNarrationFallbackCount()).toBe(1);
      expect(events).toHaveLength(1);
    });
  }

  it("a stop or page change by the reader is not a refusal: no fallback", async () => {
    const abort = Object.assign(new Error("The play() request was interrupted by a call to pause()"), { name: "AbortError" });
    const v = voices(async () => { throw abort; });
    expect(await narrate({ label: "t", provider: "elevenlabs", ...v })).toBe("cancelled");
    const w = voices(async () => { throw new Error("ElevenLabs API error: 402"); });
    expect(await narrate({ label: "t", provider: "elevenlabs", ...w, isCancelled: () => true })).toBe("cancelled");
    expect(v.browser).not.toHaveBeenCalled();
    expect(w.browser).not.toHaveBeenCalled();
    expect(getNarrationFallbackCount()).toBe(0);
  });

  it("if the browser voice fails too, it is tried once and the caller gets a marked error", async () => {
    const browser = vi.fn(async () => { throw new Error("Browser TTS not supported"); });
    const err = await narrate({
      label: "t", provider: "elevenlabs", browser, stopPremium: () => {},
      premium: async () => { throw new Error("ElevenLabs API error: 402"); },
    }).catch((e) => e);
    expect(err).toBeInstanceOf(NarrationFailedError);
    expect((err as NarrationFailedError).fallbackAttempted).toBe(true);
    expect(browser).toHaveBeenCalledTimes(1);
  });
});

describe("CharlotteVoiceService routes every reader through the router", () => {
  const charlotte = CharlotteVoiceService.getInstance();

  it("guest: story, word and coaching audio never call ElevenLabs", async () => {
    const sync = vi.spyOn(SynchronizedElevenLabsTTS, "generateSynchronizedSpeech");
    const smart = vi.spyOn(SmartElevenLabsTTS, "generateSpeech");
    const speak = vi.spyOn(BrowserTTSService.getInstance(), "speak").mockResolvedValue();
    setNarrationPremium(false);
    await charlotte.charlotteReadStory("The cat sat on the mat.");
    await charlotte.charlotteHearWord("cat");
    await charlotte.charlotteAccuracyFeedback(90, true, "Nice pace.");
    await charlotte.charlottePracticeWords(["cat", "mat"]);
    await charlotte.charlotteMultilingualExplain("A cat is an animal.", "es");
    expect(sync).not.toHaveBeenCalled();
    expect(smart).not.toHaveBeenCalled();
    expect(speak).toHaveBeenCalledTimes(5);
    expect(speak.mock.calls[0][0].text).toBe("The cat sat on the mat.");
  });

  it("premium + ElevenLabs out of credits: Charlotte is silenced, the page is read once in the browser voice", async () => {
    vi.spyOn(SynchronizedElevenLabsTTS, "generateSynchronizedSpeech").mockRejectedValue(
      new Error("Synchronized TTS failed: Edge Function returned a non-2xx status code (402)"),
    );
    const order: string[] = [];
    vi.spyOn(charlotte, "stop").mockImplementation(() => { order.push("stop"); });
    const speak = vi.spyOn(BrowserTTSService.getInstance(), "speak").mockImplementation(async () => { order.push("browser"); });
    setNarrationPremium(true);
    await charlotte.charlotteReadStory("The cat sat on the mat.");
    expect(speak).toHaveBeenCalledTimes(1);
    expect(order).toEqual(["stop", "browser"]);
    expect(getNarrationFallbackCount()).toBe(1);
  });

  it("premium with credits: Charlotte only", async () => {
    const sync = vi.spyOn(SynchronizedElevenLabsTTS, "generateSynchronizedSpeech").mockResolvedValue({
      audioBuffer: new ArrayBuffer(8), wordTimings: [],
    } as never);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.spyOn(charlotte as any, "playCharlotteAudio").mockResolvedValue(undefined);
    const speak = vi.spyOn(BrowserTTSService.getInstance(), "speak").mockResolvedValue();
    setNarrationPremium(true);
    await charlotte.charlotteReadStory("The cat sat on the mat.");
    expect(sync).toHaveBeenCalledTimes(1);
    expect(speak).not.toHaveBeenCalled();
  });
});

describe("no ElevenLabs path bypasses the router", () => {
  function files(dir: string): string[] {
    return readdirSync(join(ROOT, dir)).flatMap((n) => {
      const rel = `${dir}/${n}`;
      if (statSync(join(ROOT, rel)).isDirectory()) return n === "test" || n === "__tests__" ? [] : files(rel);
      return /\.(ts|tsx)$/.test(n) && !/\.test\./.test(n) ? [rel] : [];
    });
  }

  // Admin and operator screens, never shown to a child: the health panel's one-word
  // ping and the voice-override admin. Adding a file here is a decision, not a fix.
  const OPERATOR_TOOLS = ["src/components/testing/SystemHealthPanel.tsx", "src/pages/admin/VoiceAdmin.tsx"];

  it("only CharlotteVoiceService generates ElevenLabs speech; direct function calls check the tier", () => {
    const all = files("src");
    expect(all.length).toBeGreaterThan(100); // an empty scan is a failure, not a pass
    const generators = all.filter((f) => /(SmartElevenLabsTTS|SynchronizedElevenLabsTTS)\.generate\w*\(/.test(read(f)));
    expect(generators.sort()).toEqual(["src/services/CharlotteVoiceService.ts"]);
    const direct = all.filter((f) => /functions\.invoke\(\s*['"]elevenlabs-tts/.test(read(f)));
    expect(direct.length).toBeGreaterThan(0);
    for (const f of direct) {
      // The generators themselves, and the operator health panel's one-word ping.
      if (f.startsWith("src/services/smartElevenLabsTTS") || f.startsWith("src/services/SynchronizedElevenLabsTTS")) continue;
      if (OPERATOR_TOOLS.includes(f)) continue;
      expect(read(f), `${f} calls ElevenLabs without checking the narration tier`).toMatch(/currentNarrationProvider\(\) === 'browser'/);
    }
  });

  it("the tier is the paid status, set in AuthenticatedApp from the billing record", () => {
    const app = read("src/components/AuthenticatedApp.tsx");
    expect(app).toContain("setNarrationPremium(!subLoading && !!isSubscriptionActive)");
    expect(app).toContain("return () => setNarrationPremium(false)");
  });

  it("the edge function reports refusals for the fallback and counts them", () => {
    const fn = read("supabase/functions/elevenlabs-tts-smart/index.ts");
    expect(fn).toMatch(/useFallback: true/);
    expect(fn).toMatch(/operation_type: 'tts_refused'/);
    expect(fn).toMatch(/signal: AbortSignal\.timeout\(ELEVENLABS_DEADLINE_MS\)/);
    const deadline = Number(fn.match(/const ELEVENLABS_DEADLINE_MS = (\d+);/)?.[1]);
    expect(deadline).toBeGreaterThan(0);
    expect(deadline).toBeLessThan(15000); // answers before the client's 15s adaptive timeout
  });
});
