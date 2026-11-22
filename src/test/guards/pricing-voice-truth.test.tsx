// What /pricing promises about voice and read-aloud, against what the code delivers.
// Her ruling 22 Nov 2026 ("free readers should get less"): signed-out guests get no
// voice commands and no read-aloud practice; a free account gets voice commands and
// READ_ALOUD_FREE_SENTENCES_PER_DAY practice sentences a day; Premium is unlimited.
// - Promise: every command the voice card lists is one the parser and the story page
//   act on, in every UI language; every plan line about voice or read-aloud is backed.
// - Outage: when the session cannot be read, the page offers neither feature.
// - Abuse (a guest calling voice-to-text directly) is paid-call-guard.test.ts.
import React from "react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { act, cleanup, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ invoke: vi.fn(), getSession: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  functions: { invoke: (...a: unknown[]) => mocks.invoke(...a) },
  auth: { getSession: () => mocks.getSession(), onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }) },
} }));
vi.mock("@/services/CharlotteVoiceService", () => ({ charlotteVoiceService: { stop: () => {}, charlotteInteractiveAudio: async () => {}, charlotteAccuracyFeedback: async () => {}, charlottePracticeWords: async () => {}, charlotteSyllableWord: async () => {} } }));
vi.mock("@/services/BrowserTTSService", () => ({ browserTTSService: { stop: () => {}, speakCoachMessage: async () => {} } }));

import { STORY_VOICE_COMMANDS, parseStoryVoiceCommand } from "@/lib/voice/storyVoiceCommands";
import { READ_ALOUD_FREE_SENTENCES_PER_DAY } from "@/lib/freeStoryAllowance";
import { freeFeatures, premiumFeatures, additionalOfferings, enterpriseFeatures } from "@/constants/featureLists";
import { VoiceCommandsHelp } from "@/components/VoiceCommandsHelp";
import PricingSection from "@/components/PricingSection";
import ReadAloudCoach from "@/components/ReadAloudCoach";

const root = join(__dirname, "../../..");
const read = (rel: string) => readFileSync(join(root, rel), "utf8");
const localesDir = join(root, "src/i18n/locales");
// The eight UI languages src/i18n/config.ts loads.
const locales = ["en", "es", "fr", "ar", "hi", "pt", "ur", "zh"].map((l) => [l, JSON.parse(readFileSync(join(localesDir, `${l}.json`), "utf8"))] as const);
const unquote = (s: string) => s.replace(/^[\s“”«»"'«]+|[\s“”«»"']+$/g, "");
const settle = () => act(async () => { await new Promise((r) => setTimeout(r, 30)); });
const signedIn = () => mocks.getSession.mockResolvedValue({ data: { session: { user: { id: "u1" }, access_token: "tok" } }, error: null });

describe("the voice card lists only commands that exist", () => {
  it("renders exactly STORY_VOICE_COMMANDS, each with a phrase and a label", () => {
    render(<VoiceCommandsHelp />);
    const items = within(screen.getByTestId("voice-command-list")).getAllByRole("listitem");
    expect(items.map((li) => li.getAttribute("data-command"))).toEqual([...STORY_VOICE_COMMANDS]);
    for (const li of items) expect(li.textContent!.trim().length).toBeGreaterThan(4);
    cleanup();
  });

  it.each(locales.map(([l]) => l))("%s: each phrase the card tells the child to say is parsed as that command", (lang) => {
    const say = locales.find(([l]) => l === lang)![1].pricingVoice.say as Record<string, string>;
    expect(Object.keys(say).sort()).toEqual([...STORY_VOICE_COMMANDS].sort());
    for (const command of STORY_VOICE_COMMANDS) expect(parseStoryVoiceCommand(unquote(say[command]))).toBe(command);
  });

  it("the story page handles every listed command", () => {
    const page = read("src/components/CleanStoryDisplay.tsx");
    const handler = page.slice(page.indexOf("const handleStoryVoiceCommand"), page.indexOf("const handleDockCoach"));
    for (const command of STORY_VOICE_COMMANDS) expect(handler).toContain(`command === '${command}'`);
    expect(page).toContain("<StoryVoiceCommands onCommand={handleStoryVoiceCommand} />");
  });

  it("no hand-typed command table is left for a card to read", () => {
    expect(read("src/config/audioConfig.ts")).not.toMatch(/export const voiceCommands\b/);
    expect(read("src/components/VoiceCommandsHelp.tsx")).toContain("STORY_VOICE_COMMANDS.map");
  });
});

describe("every plan line about voice or read-aloud is what the code gives", () => {
  const isVoiceLine = (f: string) => /voice command|read-aloud|speech-to-text/i.test(f);

  it("free account: voice commands, and practice with the real daily number", () => {
    const lines = freeFeatures.filter(isVoiceLine);
    expect(lines.some((f) => /voice command/i.test(f) && /free account/i.test(f))).toBe(true);
    const practice = lines.find((f) => /read-aloud/i.test(f));
    expect(practice).toBeTruthy();
    expect(practice!.match(/\d+/g)).toEqual([String(READ_ALOUD_FREE_SENTENCES_PER_DAY)]);
  });

  it("premium: voice commands and unlimited practice; no voice line sits only under Premium extras", () => {
    expect(premiumFeatures.filter(isVoiceLine).sort()).toEqual(["Unlimited read-aloud practice", "Voice commands on the story page"]);
    expect(additionalOfferings.filter(isVoiceLine)).toEqual([]);
    expect(enterpriseFeatures.filter(isVoiceLine)).toEqual([]);
  });

  it.each(locales.map(([l]) => l))("%s: the free practice line and the coach card carry the same daily number", (lang) => {
    const j = locales.find(([l]) => l === lang)![1];
    const n = String(READ_ALOUD_FREE_SENTENCES_PER_DAY);
    expect(j.ui.plan_read_aloud_free.match(/\d+/g)).toEqual([n]);
    expect(j.pricingVoice.coachWho).toContain("{{count}}");
  });

  it("the pricing doc's number is the one the coach enforces", () => {
    const doc = read("docs/PRICING.md");
    expect(doc).toMatch(new RegExp(`^free_read_aloud_sentences_per_day: ${READ_ALOUD_FREE_SENTENCES_PER_DAY}$`, "m"));
  });
});

describe("the coach enforces the free daily number", () => {
  const key = () => { const d = new Date(); return `t2r_coach_count_${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
  beforeEach(() => { signedIn(); localStorage.clear(); });
  afterEach(() => { cleanup(); localStorage.clear(); mocks.getSession.mockReset(); });

  it("one under the number: a free account can still start", async () => {
    localStorage.setItem(key(), String(READ_ALOUD_FREE_SENTENCES_PER_DAY - 1));
    render(<ReadAloudCoach targetText="The fox runs." autoIntroduce={false} />);
    expect((await screen.findByRole("button", { name: /Start Reading/ })).hasAttribute("disabled")).toBe(false);
  });
  it("at the number: a free account is stopped for the day; Premium is not", async () => {
    localStorage.setItem(key(), String(READ_ALOUD_FREE_SENTENCES_PER_DAY));
    const { unmount } = render(<ReadAloudCoach targetText="The fox runs." autoIntroduce={false} />);
    expect((await screen.findByRole("button", { name: /Start Reading/ })).hasAttribute("disabled")).toBe(true);
    expect(screen.getByText(`${READ_ALOUD_FREE_SENTENCES_PER_DAY}/${READ_ALOUD_FREE_SENTENCES_PER_DAY}`, { exact: false })).toBeTruthy();
    unmount();
    render(<ReadAloudCoach targetText="The fox runs." autoIntroduce={false} isPremium />);
    expect((await screen.findByRole("button", { name: /Start Reading/ })).hasAttribute("disabled")).toBe(false);
  });
});

describe("/pricing for a guest, and when the session cannot be read", () => {
  afterEach(() => { cleanup(); mocks.getSession.mockReset(); mocks.invoke.mockReset(); });
  const renderPricing = () => render(<MemoryRouter><PricingSection /></MemoryRouter>);

  it.each([
    ["a signed-out guest", () => mocks.getSession.mockResolvedValue({ data: { session: null }, error: null })],
    ["the session read failing (outage)", () => mocks.getSession.mockRejectedValue(new Error("auth down"))],
    ["the session read returning an error", () => mocks.getSession.mockResolvedValue({ data: { session: null }, error: new Error("503") })],
  ])("%s: no practice microphone, a sign-in line, and both cards say sign in", async (_c, arrange) => {
    arrange();
    renderPricing();
    await settle();
    expect(screen.queryByRole("button", { name: /Start Reading/ })).toBeNull();
    expect(screen.getByTestId("coach-sign-in")).toBeTruthy();
    expect(screen.getByTestId("coach-plans").textContent).toMatch(/sign in/i);
    expect(screen.getByTestId("voice-plans").textContent).toMatch(/sign in/i);
    expect(screen.queryByTestId("pricing-trial-signed-in")).toBeNull();
    expect(mocks.invoke).not.toHaveBeenCalledWith("voice-to-text", expect.anything());
  });

  it("a signed-in account gets the practice microphone (the guest result is not an empty screen)", async () => {
    signedIn();
    renderPricing();
    await settle();
    expect(await screen.findByRole("button", { name: /Start Reading/ })).toBeTruthy();
    expect(screen.queryByTestId("coach-sign-in")).toBeNull();
    expect(screen.getByTestId("coach-plans").textContent).toContain(`${READ_ALOUD_FREE_SENTENCES_PER_DAY}`);
  });
});
