// R-KID-01 (22 Nov 2026): the one shared place that decides which names a request must not send
// (supabase/functions/_shared/privacyLane.ts). The real-path proof per function is
// src/test/edge/child-names-never-leave.test.ts; these pin the edges of the shared parts.
import { describe, expect, it } from "vitest";
import {
  installLogRedaction,
  isNameOf,
  namesInBody,
  privacyForRequest,
  redactNames,
  resolvePrivacy,
  withPrivacy,
} from "../../../supabase/functions/_shared/privacyLane";

const userJwt = `x.${btoa(JSON.stringify({ role: "authenticated", sub: "u" }))}.y`;
const deps = (names: string[] | Error) => ({
  verifyUser: async () => "u",
  laneOf: async () => "family",
  namesOf: async () => { if (names instanceof Error) throw names; return names; },
});

describe("which names a request carries", () => {
  it("reads every place the app puts a reader's name, and caps what a caller can send", () => {
    const got = namesInBody({
      childName: "Ada",
      userInfo: { name: "Bea", gender: "girl" },
      config: { userInfo: { displayName: "Cal" } },
      characterInfo: { name: "Dov", siblingName: "Eli", parentName: "Fay" },
      bundle: { storyContent: 'Character Info: {"name":"Gus","gender":"boy"}' },
      readerNames: ["Hal", "", 7, "x".repeat(500), ...Array.from({ length: 50 }, (_, i) => `N${i}`)],
    }).map((n) => n.name);
    expect(got.slice(0, 8).sort()).toEqual(["Ada", "Bea", "Cal", "Dov", "Eli", "Fay", "Gus", "Hal"]);
    expect(got.every((n) => n.length <= 60)).toBe(true);
    expect(got.length).toBeLessThanOrEqual(8 + 20);
    expect(namesInBody(null)).toEqual([]);
    expect(namesInBody("Ada")).toEqual([]);
  });

  it("a signed-in request adds the account's own names from the database", async () => {
    const p = await resolvePrivacy(`Bearer ${userJwt}`, { readerNames: ["Ada"] }, deps(["Marisol Vance", "Quillon"]));
    expect(p.lane).toBe("family");
    expect(p.names.map((n) => n.name)).toEqual(["Ada", "Marisol Vance", "Quillon"]);
  });

  it("when the account's names cannot be read, the request goes the school way (no free route)", async () => {
    const p = await resolvePrivacy(`Bearer ${userJwt}`, { readerNames: ["Ada"] }, deps(new Error("db down")));
    expect(p.lane).toBe("school");
    expect(p.names.map((n) => n.name)).toEqual(["Ada"]);
  });

  it("with no database client, a signed-in or child request goes the school way; a guest stays family", async () => {
    // No SUPABASE_URL / service key here (no Deno env), so the production deps cannot be built.
    const req = (auth?: string) => new Request("https://x.test/f", { method: "POST", headers: auth ? { Authorization: auth } : {} });
    const signedIn = await privacyForRequest(req(`Bearer ${userJwt}`), { readerNames: ["Ada"] });
    expect(signedIn).toEqual({ lane: "school", names: [{ name: "Ada" }] });
    const child = await privacyForRequest(req(), { childProfileId: "6f1c2b3a-1d2e-4f5a-8b9c-0d1e2f3a4b5c" });
    expect(child.lane).toBe("school");
    const guest = await privacyForRequest(req(), { readerNames: ["Ada"] });
    expect(guest).toEqual({ lane: "family", names: [{ name: "Ada" }] });
  });

  it("a tapped word is a name when it is a whole name or one part of one", () => {
    const names = [{ name: "Marisol Vance" }, { name: "Quillon" }];
    expect(isNameOf("vance", names)).toBe(true);
    expect(isNameOf("Quillon", names)).toBe(true);
    expect(isNameOf("Quill", names)).toBe(false);
    expect(isNameOf("a", [{ name: "A" }])).toBe(false);
  });
});

describe("logs never carry a request's names", () => {
  it("redacts whole words, any case, and leaves other words alone", () => {
    expect(redactNames("QUILLON met quillon's dog; Quillonian stays", [{ name: "Quillon" }])).toBe("[name] met [name]'s dog; Quillonian stays");
    expect(redactNames("Marisol Vance, or just Vance", [{ name: "Marisol Vance" }])).toBe("[name], or just [name]");
    expect(redactNames("nothing here", [])).toBe("nothing here");
  });

  it("the console wrapper redacts strings, objects and errors inside the request, and nothing outside it", () => {
    const lines: unknown[][] = [];
    const sink = { log: (...a: unknown[]) => lines.push(a), info: () => {}, warn: () => {}, error: (...a: unknown[]) => lines.push(a), debug: () => {} } as unknown as Console;
    delete (sink as unknown as Record<symbol, unknown>)[Symbol.for("t2r.logRedaction")];
    installLogRedaction(sink);
    withPrivacy({ lane: "family", names: [{ name: "Zephyrine" }] }, () => {
      sink.log("story for Zephyrine", { req: { text: "Zephyrine\nran" } });
      sink.error(new Error("failed for Zephyrine"));
    });
    sink.log("outside Zephyrine");
    const text = JSON.stringify(lines.slice(0, 2));
    expect(text).not.toMatch(/Zephyrine/i);
    expect(text).toContain("[name]");
    expect(lines[2]).toEqual(["outside Zephyrine"]);
  });
});
