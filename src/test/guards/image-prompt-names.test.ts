// R-KID-01 (risk brain): a child's name never goes to a model route that may train on it.
// The picture step sends each story page to the Lovable AI gateway (Gemini); before #163 the
// page went with the child's real name in it. The name is swapped for a stand-in first.
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildImagePrompt } from "../../../supabase/functions/_shared/imagePrompt.ts";

afterEach(() => vi.unstubAllGlobals());

describe("image prompt: the child's name never leaves for the Lovable gateway", () => {
  it("the gateway request carries a stand-in, not the name, in the page and the previous scene", async () => {
    const bodies: string[] = [];
    vi.stubGlobal("fetch", vi.fn(async (_url: string, init: RequestInit) => {
      bodies.push(String(init.body));
      return new Response(JSON.stringify({ choices: [{ message: { content: "A small dog runs across a sunny park." } }] }), { status: 200 });
    }));
    const built = await buildImagePrompt({
      pageText: "Aiden Brooks ran to the park, and Aiden laughed as the dog chased the ball.",
      previousScene: "Aiden sits under a big oak tree.",
      user: { name: "Aiden Brooks", age: 7, avatar: { type: "boy" } },
      sessionId: "s1",
      lovableApiKey: "k",
    });
    expect(bodies).toHaveLength(1);
    expect(bodies[0]).toContain("ran to the park");
    expect(bodies[0]).not.toMatch(/Aiden|Brooks/);
    expect(built.scene).not.toMatch(/Aiden/);
  });

  it("with no gateway key, the fallback scene that goes to the image model has no name either", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const built = await buildImagePrompt({
      pageText: "Mia climbed the tall hill and Mia waved at the red kite in the sky.",
      user: { name: "Mia", age: 6, avatar: { type: "girl" } },
      sessionId: "s2",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(built.positivePrompt).not.toMatch(/\bMia\b/);
  });
});
