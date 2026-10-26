// Guard: developer widgets never reach families. The "System Status: HEALTHY" panel
// (response time, cache hit rate, templates, operations) showed on every signed-in
// screen, and the header menu offered "Enable Test Mode". Both now need
// devToolsAllowed() (dev build or an admin account), as does the debug monitor.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { devToolsAllowed, isAdminUser } from "@/lib/devTools";

const read = (rel: string) => readFileSync(join(__dirname, "../../..", rel), "utf8");

describe("developer widgets are gated", () => {
  it("System Status renders only behind showDevTools", () => {
    const app = read("src/components/AuthenticatedApp.tsx");
    const uses = app.match(/^(?!\s*\{?\/[/*]).*<DismissibleSystemStatus\b.*$/gm) ?? [];
    expect(uses.length).toBeGreaterThan(0);
    for (const line of uses) expect(line).toMatch(/\{showDevTools && <DismissibleSystemStatus/);
    expect(app).toMatch(/const showDevTools = devToolsAllowed\(user\)/);
  });
  it("Test Mode is not in a family's header menu", () => {
    const header = read("src/components/PremiumHeader.tsx");
    expect(header).toMatch(/\{showDevTools && \(\s*<DropdownMenuItem onClick=\{onToggleDevMode\}/);
    expect(header).toMatch(/showDevTools = false/);
  });
  it("the debug monitor mounts only for dev tools", () => {
    expect(read("src/App.tsx")).toMatch(/\{devToolsAllowed\(\) && <UnifiedDebugMonitor \/>\}/);
  });
  it("admin comes from server-set app_metadata only", () => {
    expect(isAdminUser({ app_metadata: { role: "admin" } })).toBe(true);
    expect(isAdminUser({ app_metadata: { role: "user" } })).toBe(false);
    expect(isAdminUser(null)).toBe(false);
    // user_metadata is editable by the user, so it never counts
    expect(isAdminUser({ app_metadata: {}, ...( { user_metadata: { role: "admin" } } as object) })).toBe(false);
    expect(typeof devToolsAllowed()).toBe("boolean");
  });
});
