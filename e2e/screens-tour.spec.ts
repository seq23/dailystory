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
      const user = makeUser();
      await mockSupabase(page, { user });
      await signInAs(page, user);
      await page.goto("/");
      await page.waitForTimeout(2500);
      await tryClick(page, [/ok, allow all/i, /accept all/i], 1500);
      await shot(page, 6, "app-first-screen", d.name);
      const nav = async (title: string) => {
        if (d.width < 768) await tryClick(page, [/open navigation/i, /menu/i]);
        await tryClick(page, [title]);
      };
      await nav("My Account");
      await shot(page, 7, "account", d.name);
      await nav("Parent / Teacher Dashboard");
      await shot(page, 8, "parent-children", d.name);
      await nav("Profile Settings");
      await shot(page, 9, "profile-settings", d.name);
      await nav("My Stories");
      await shot(page, 10, "new-story-form", d.name);
      await tryClick(page, [/reading as/i, /sam/i]);
      await shot(page, 11, "header-menu", d.name);
    });
  });
}
