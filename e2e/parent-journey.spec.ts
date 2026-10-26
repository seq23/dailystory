// The parent journey, end to end, over the local build with Supabase mocked
// (e2e/support/mockSupabase.ts): landing → sign up with a code → Premium badge (no
// free-stories banner) → first child (grade 10) → picture shows as selected →
// second child → switch back and forth → sidebar says Premium, no upsell → empty My
// Stories: one heading, "Create Your First Story" opens the form → start a story.
// Plus: no developer panel for a family.
// Run: npm run build && npx vite preview --port 4173 & PLAYWRIGHT_BASE_URL=http://localhost:4173 npx playwright test e2e/parent-journey.spec.ts
import { expect, test, type Page } from "@playwright/test";
import { makeUser, mockSupabase, signInAs } from "./support/mockSupabase";

const PHONE = { width: 390, height: 844 };

async function dismissCookies(page: Page) {
  const ok = page.getByRole("button", { name: /ok, allow all/i });
  if (await ok.isVisible().catch(() => false)) await ok.click();
}

async function addChild(page: Page, name: string, grade: string, opts: { age?: string; picture?: string; tone?: string } = {}) {
  const form = page.getByTestId("child-form").last();
  await form.getByTestId("child-name").fill(name);
  await form.getByTestId(`child-grade-${grade}`).click();
  await expect(form.getByTestId(`child-grade-${grade}`)).toHaveAttribute("aria-checked", "true");
  if (opts.age) await form.getByTestId("child-age").selectOption(opts.age);
  if (opts.picture) {
    await form.getByTestId(`avatar-type-${opts.picture}`).click();
    await expect(form.getByTestId(`avatar-type-${opts.picture}`)).toHaveAttribute("aria-pressed", "true");
    await expect(form.getByTestId(`avatar-type-${opts.picture}`)).toContainText("Selected");
  }
  if (opts.tone) {
    await form.getByTestId(`avatar-tone-${opts.tone}`).click();
    await expect(form.getByTestId(`avatar-tone-${opts.tone}`)).toContainText("Selected");
    // The chosen tone keeps its name ("Dark ✓ Selected"), never just "Selected".
    await expect(form.getByTestId(`avatar-tone-name-${opts.tone}`)).toHaveText(new RegExp(`^${opts.tone}$`, "i"));
    await expect(form.getByTestId(`avatar-tone-name-${opts.tone}`)).toBeVisible();
  }
  await form.getByTestId("child-save").click();
}

test.describe("parent journey", () => {
  test.use({ viewport: PHONE });

  test("sign up with a code, add two children, switch, start a story", async ({ page }) => {
    const state = await mockSupabase(page);
    const consoleErrors: string[] = [];
    page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });

    // Landing
    await page.goto("/");
    await expect(page.getByRole("button", { name: /sign in/i }).first()).toBeVisible();
    await dismissCookies(page);

    // Sign-in/sign-up from the homepage is a full screen of its own: no marketing text under it
    await expect(page.locator("#home-intro-heading")).toHaveCount(1);
    await page.getByRole("button", { name: /sign in/i }).first().click();
    await expect(page.locator("#signup-name")).toBeVisible();
    await expect(page.locator("#home-intro-heading")).toHaveCount(0);

    // Sign up with a code from a link
    await page.goto("/auth?code=HOMESCHOOL15");
    await dismissCookies(page);
    await expect(page.getByTestId("signup-code-input")).toHaveValue("HOMESCHOOL15");
    await expect(page.getByTestId("signup-code-message")).toContainText("15 days of Premium");
    await page.locator("#signup-name").fill("Sam Parent");
    await page.locator("#signup-email").fill("parent@example.test");
    await page.locator("#signup-password").fill("Example-pass-123");
    await page.getByTestId("signup-guardian-consent").locator("input").check();
    await page.mouse.wheel(0, 2000);
    await page.getByRole("button", { name: /^continue$/i }).click();
    await expect(page.getByTestId("signup-code-accepted")).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(40); // step 2 starts at the top (was the page bottom)
    await expect(page.getByRole("button", { name: /pay/i })).toHaveCount(0); // a code never shows a pay button
    await page.getByTestId("signup-create-with-code").click();

    // Premium at once, server-side; no free-stories banner
    await expect(page.getByTestId("premium-badge")).toContainText(/Premium active until/, { timeout: 15_000 });
    expect(state.calls.some((c) => c.fn === "redeem-access-code")).toBe(true);
    expect(state.user?.user_metadata?.access_code).toBe("HOMESCHOOL15");
    await expect(page.getByTestId("free-stories-banner")).toHaveCount(0);

    // First child, grade 10, with a picture that shows as selected
    await expect(page.getByTestId("first-child-screen")).toContainText("Welcome, Sam!");
    await addChild(page, "Axel", "10", { age: "15", picture: "boy", tone: "dark" });
    await expect(page.getByTestId("reader-name")).toHaveText("Axel", { timeout: 10_000 });
    await expect(page.getByTestId("premium-badge")).toBeVisible();
    await expect(page.getByTestId("free-stories-banner")).toHaveCount(0);
    expect(state.tables.child_profiles[0]).toMatchObject({ display_name: "Axel", grade_level: "10", avatar: { type: "boy", skinTone: "dark" } });

    // No developer panel for a family
    await expect(page.getByText(/system status/i)).toHaveCount(0);
    await expect(page.getByText(/cache hit rate/i)).toHaveCount(0);

    // Second child from the header
    await page.getByTestId("reader-switcher").click();
    await expect(page.getByRole("menuitem", { name: /enable test mode/i })).toHaveCount(0);
    await page.getByTestId("header-add-child").click();
    await expect(page.getByTestId("child-dialog")).toBeVisible();
    await addChild(page, "Maya", "5", { picture: "girl" });
    await expect(page.getByTestId("child-dialog")).toBeHidden();
    await expect(page.getByTestId("reader-name")).toHaveText("Maya");

    // Switch back to Axel
    await page.getByTestId("reader-switcher").click();
    const options = page.getByTestId("reader-option");
    await expect(options).toHaveCount(2);
    await options.filter({ hasText: "Axel" }).click();
    await expect(page.getByTestId("reader-name")).toHaveText("Axel");
    await expect(page.getByText(/couldn't switch/i)).toHaveCount(0);
    const axelId = state.tables.child_profiles.find((c) => c.display_name === "Axel")?.id;
    expect(state.tables.user_preferences.filter((r) => r.user_id === state.user?.id)).toHaveLength(1);
    await expect.poll(() => state.tables.user_preferences.find((r) => r.user_id === state.user?.id)?.active_child_id).toBe(axelId);

    // Start a story for Axel
    await page.getByRole("button", { name: /new story/i }).first().click();
    const dialog = page.getByTestId("new-story-dialog");
    await expect(dialog.getByTestId("story-for")).toContainText("Axel");
    await expect(dialog.getByTestId("story-for")).toContainText("10th grade");
    await dialog.getByRole("button", { name: /\+ space/i }).click();
    await dialog.getByTestId("write-story").click();
    await expect.poll(() => state.calls.some((c) => /generate-adaptive-story|template-service/.test(c.fn)), { timeout: 20_000 }).toBe(true);

    // No preferences write ever collided (23505 / "Error creating default premium preferences")
    expect(consoleErrors.filter((t) => /default premium preferences|setActiveChild error|23505|useCachedSubscriptionStatus/i.test(t))).toEqual([]);
  });

  test("a Premium parent with two children: switch back and forth, sidebar, empty My Stories", async ({ page }) => {
    const user = makeUser();
    const axel = "22222222-2222-4222-8222-222222222222";
    const maya = "33333333-3333-4333-8333-333333333333";
    const until = new Date(Date.now() + 15 * 86_400_000).toISOString();
    const state = await mockSupabase(page, {
      user,
      tables: {
        child_profiles: [
          { id: axel, parent_user_id: user.id, display_name: "Axel", grade_level: "10", avatar: { type: "boy", skinTone: "dark" }, created_at: "2026-10-01T00:00:00Z" },
          { id: maya, parent_user_id: user.id, display_name: "Maya", grade_level: "5", avatar: { type: "girl", skinTone: "medium" }, created_at: "2026-10-02T00:00:00Z" },
        ],
        subscribers: [{ id: "s1", user_id: user.id, email: user.email, subscribed: false, override_premium: true, override_end: until, subscription_tier: "premium" }],
      },
    });
    const consoleErrors: string[] = [];
    page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
    await signInAs(page, user);
    await page.goto("/");
    await dismissCookies(page);
    await expect(page.getByTestId("reader-name")).toHaveText("Axel", { timeout: 15_000 });
    await expect(page.getByTestId("premium-badge")).toContainText(/Premium active until/, { timeout: 15_000 });

    // Switch to Maya, back to Axel, and to Maya again: every switch saves, none fails
    const options = page.getByTestId("reader-option");
    for (const [name, id] of [["Maya", maya], ["Axel", axel], ["Maya", maya]] as const) {
      await page.getByTestId("reader-switcher").click();
      await expect(options).toHaveCount(2);
      await options.filter({ hasText: name }).click();
      await expect(page.getByRole("menu")).toHaveCount(0); // the menu closes once the switch is saved
      await expect(page.getByTestId("reader-name")).toHaveText(name);
      await expect(page.getByText(/couldn't switch/i)).toHaveCount(0);
      await expect.poll(() => state.tables.user_preferences.find((r) => r.user_id === user.id)?.active_child_id).toBe(id);
    }
    expect(state.tables.user_preferences.filter((r) => r.user_id === user.id)).toHaveLength(1);

    // The sidebar says Premium quietly; no upsell card for a Premium parent
    await page.getByTestId("menu-button").click();
    await expect(page.getByTestId("sidebar-premium-until")).toContainText(/Premium active until/);
    await expect(page.getByTestId("sidebar-premium-upsell")).toHaveCount(0);
    await expect(page.getByText(/See plans or use a code/i)).toHaveCount(0);
    await page.getByRole("button", { name: /close navigation/i }).click();

    // Empty My Stories: one heading, and "Create Your First Story" opens the story form for Maya
    await expect(page.locator("main h1")).toHaveText(["My Stories"]);
    await page.getByRole("button", { name: /create your first story/i }).click();
    const dialog = page.getByTestId("new-story-dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByTestId("story-for")).toContainText("Maya");

    expect(consoleErrors.filter((t) => /default premium preferences|setActiveChild error|23505|useCachedSubscriptionStatus/i.test(t))).toEqual([]);
  });

  test("a signed-in family never sees developer widgets", async ({ page }) => {
    const user = makeUser();
    await mockSupabase(page, {
      user,
      tables: {
        child_profiles: [{ id: "22222222-2222-4222-8222-222222222222", parent_user_id: user.id, display_name: "Axel", grade_level: "10", avatar: { type: "boy", skinTone: "dark" }, created_at: new Date().toISOString() }],
      },
    });
    await signInAs(page, user);
    await page.goto("/");
    await expect(page.getByTestId("reader-name")).toHaveText("Axel", { timeout: 15_000 });
    await expect(page.getByText(/system status/i)).toHaveCount(0);
    await expect(page.getByText(/response time/i)).toHaveCount(0);
    await expect(page.getByText("🐛")).toHaveCount(0);
    await page.getByTestId("reader-switcher").click();
    await expect(page.getByText(/test mode/i)).toHaveCount(0);
  });
});
