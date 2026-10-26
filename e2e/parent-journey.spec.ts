// The parent journey, end to end, over the local build with Supabase mocked
// (e2e/support/mockSupabase.ts): landing → sign up with a code → Premium badge (no
// free-stories banner) → first child (grade 10) → picture shows as selected →
// second child → switch child → start a story. Plus: no developer panel for a family.
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
  }
  await form.getByTestId("child-save").click();
}

test.describe("parent journey", () => {
  test.use({ viewport: PHONE });

  test("sign up with a code, add two children, switch, start a story", async ({ page }) => {
    const state = await mockSupabase(page);

    // Landing
    await page.goto("/");
    await expect(page.getByRole("button", { name: /sign in/i }).first()).toBeVisible();
    await dismissCookies(page);

    // Sign up with a code from a link
    await page.goto("/auth?code=HOMESCHOOL15");
    await dismissCookies(page);
    await expect(page.getByTestId("signup-code-input")).toHaveValue("HOMESCHOOL15");
    await expect(page.getByTestId("signup-code-message")).toContainText("15 days of Premium");
    await page.locator("#signup-name").fill("Sam Parent");
    await page.locator("#signup-email").fill("parent@example.test");
    await page.locator("#signup-password").fill("Example-pass-123");
    await page.getByTestId("signup-guardian-consent").locator("input").check();
    await page.getByRole("button", { name: /^continue$/i }).click();
    await expect(page.getByTestId("signup-code-accepted")).toBeVisible();
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
