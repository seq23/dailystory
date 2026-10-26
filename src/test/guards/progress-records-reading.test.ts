// Guard (26 Oct 2026): Progress, reading time and streaks read reading_sessions, but nothing in the
// app wrote it, so every family saw 0 stories and 0m forever ("exists but nothing invokes it").
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "../../..");
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

describe("ending a reading session is recorded where Progress reads it", () => {
  it("the reading page inserts into reading_sessions on End Session", () => {
    const page = read("src/components/CleanStoryDisplay.tsx");
    expect(page).toMatch(/from\('reading_sessions'\)\.insert\(/);
    const end = page.indexOf("const handleEndSession = async () => {");
    const call = page.indexOf("void saveReadingSessionRow(", end);
    expect(end).toBeGreaterThan(0);
    expect(call).toBeGreaterThan(end);
    expect(call - end).toBeLessThan(2000);
  });
  it("Progress still reads reading_sessions (so the writer has a reader)", () => {
    expect(read("src/hooks/useRealProgressData.ts")).toMatch(/from\('reading_sessions'\)/);
    expect(read("src/hooks/useChildProgressData.ts")).toMatch(/from\('reading_sessions'\)/);
  });
  it("story_id is optional, so a session for a story outside the stories table still saves", () => {
    const migs = readdirSync(join(root, "supabase/migrations")).filter((f) => f.endsWith(".sql"));
    const all = migs.map((f) => read(`supabase/migrations/${f}`)).join("\n");
    expect(all).toMatch(/alter table public\.reading_sessions alter column story_id drop not null/i);
  });
});
