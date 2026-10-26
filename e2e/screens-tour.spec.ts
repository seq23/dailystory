// Screens tour: a screenshot of every step a parent sees, at phone and iPad size,
// over the local build with Supabase mocked. Best-effort clicks so it runs on any
// version of the app; it records, it does not assert. Run with SHOTS_DIR set:
//   SHOTS_DIR=/path/out PLAYWRIGHT_BASE_URL=http://localhost:4173 npx playwright test e2e/screens-tour.spec.ts --project=chromium
import { test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { makeUser, mockSupabase, signInAs } from "./support/mockSupabase";

const OUT = process.env.SHOTS_DIR;
const DEVICES = [
  { name: "phone", width: 390, height: 844 },
  { name: "ipad", width: 820, height: 1180 },
];

test.skip(!OUT, "set SHOTS_DIR to record the tour");

async function shot(page: Page, n: number, step: string, device: string) {
  mkdirSync(OUT!, { recursive: true });
  await page.waitForTimeout(700);
  await page.screenshot({ path: join(OUT!, `${String(n).padStart(2, "0")}-${step}-${device}.png`), fullPage: false });
}

async function tryClick(page: Page, names: (string | RegExp)[], timeout = 2500) {
  for (const name of names) {
    const el = page.getByRole("button", { name }).or(page.getByRole("link", { name })).or(page.getByText(name)).first();
    try {
      await el.click({ timeout });
      return true;
    } catch {
      /* try next */
    }
  }
  return false;
}

for (const d of DEVICES) {
  test.describe(`tour ${d.name}`, () => {
    test.use({ viewport: { width: d.width, height: d.height } });

    test(`signed out ${d.name}`, async ({ page }) => {
      await mockSupabase(page);
      await page.goto("/");
      await shot(page, 1, "landing", d.name);
      await tryClick(page, [/ok, allow all/i, /accept all/i]);
      await page.goto("/auth?code=HOMESCHOOL15");
      await shot(page, 2, "signup-step1", d.name);
      await page.locator("#signup-name").fill("Sam Parent").catch(() => {});
      await page.locator("#signup-email").fill("parent@example.test").catch(() => {});
      await page.locator("#signup-password").fill("Example-pass-123").catch(() => {});
      await page.locator('[data-testid="signup-guardian-consent"] input').check({ timeout: 1500 }).catch(() => {});
      await shot(page, 3, "signup-filled", d.name);
      await tryClick(page, [/^continue$/i]);
      await shot(page, 4, "signup-step2", d.name);
      await page.goto("/pricing");
      await shot(page, 5, "pricing", d.name);
    });

    test(`signed in ${d.name}`, async ({ page }) => {
      test.setTimeout(240_000);
      const user = makeUser();
      const pages = [
        "Axel looked up at the night sky. A tiny silver rocket was blinking on the roof of the school.",
        "He climbed the ladder, one careful step at a time, and opened the little round door.",
        "Inside, a robot named Pip waved a bright blue hand. \"Ready to fly?\" Pip asked.",
      ];
      await mockSupabase(page, { user, story: { success: true, story: pages.join("\n\n"), pages, title: "Axel and the Silver Rocket" } });
      await signInAs(page, user);
      await page.goto("/");
      await page.waitForTimeout(2500);
      await tryClick(page, [/ok, allow all/i, /accept all/i], 1500);
      await shot(page, 6, "app-first-screen", d.name);
      // Add a first child (new app) — best effort on older versions
      const form = page.getByTestId("child-form").first();
      if (await form.isVisible().catch(() => false)) {
        await form.getByTestId("child-name").fill("Axel");
        await form.getByTestId("child-grade-10").click();
        await form.getByTestId("avatar-type-boy").click();
        await form.getByTestId("avatar-tone-dark").click();
        await shot(page, 7, "first-child-filled", d.name);
        await form.getByTestId("child-save").click();
        await page.waitForTimeout(1500);
      }
      await shot(page, 8, "home-after-first-child", d.name);
      await tryClick(page, [/reading as/i, /sam/i]);
      await shot(page, 9, "header-reader-menu", d.name);
      if (await tryClick(page, [/add another child/i], 1500)) {
        await page.getByTestId("child-name").fill("Maya").catch(() => {});
        await page.getByTestId("child-grade-5").click().catch(() => {});
        await page.getByTestId("avatar-type-girl").click().catch(() => {});
        await shot(page, 10, "add-child-dialog", d.name);
        await page.getByTestId("child-save").click().catch(() => {});
        await page.waitForTimeout(1200);
      } else {
        await page.keyboard.press("Escape");
      }
      await tryClick(page, [/new story/i]);
      await page.waitForTimeout(800);
      await shot(page, 11, "new-story-dialog", d.name);
      // Write the story and look at the reading screen
      await page.getByTestId("write-story").click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(6000);
      await shot(page, 16, "reading-page", d.name);
      await page.mouse.wheel(0, 700);
      await shot(page, 17, "reading-page-lower", d.name);
      await page.goto("/");
      await page.waitForTimeout(2500);
      const nav = async (title: string | RegExp) => {
        await tryClick(page, [/^☰ ?menu$/i, /open menu/i, /open navigation/i], 1500);
        await page.waitForTimeout(400);
        await tryClick(page, [title]);
      };
      await nav(/menu/i);
      await shot(page, 12, "menu-open", d.name);
      await page.keyboard.press("Escape");
      await nav(/grown-up settings|my account/i);
      await shot(page, 13, "grown-up-settings", d.name);
      await page.mouse.wheel(0, 900);
      await shot(page, 14, "grown-up-settings-plan", d.name);
      await nav(/parent dashboard|parent \/ teacher/i);
      await shot(page, 15, "parent-dashboard", d.name);
      await nav(/^progress/i);
      await shot(page, 18, "progress", d.name);
      await nav(/story library/i);
      await shot(page, 19, "library", d.name);
      await nav(/reading settings/i);
      await shot(page, 20, "reading-settings", d.name);
    });
  });
}
