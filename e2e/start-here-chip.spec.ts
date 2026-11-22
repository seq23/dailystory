import { expect, test, type Page } from '@playwright/test';
import { makeUser, mockSupabase, signInAs } from './support/mockSupabase';

// The "Start here!" chip by the New Story button sits under the button, pointing up, at
// every width (phone 390, iPad portrait 820, desktop 1280). It must be whole on screen,
// never cut by a clipping parent, clear of the story title and the button, and readable
// (12 px or more, a solid fill, 4.5:1). To the left of the button it ran off a phone's
// edge and covered the title (22 Nov 2026).
//
// The chip hides itself after 7 s. The clock is paused once it shows, so the checks never
// race that timer; the test then runs the clock past 7 s to prove the timer still works.

async function openStory(page: Page) {
  await page.route('**/*', route => /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/)/.test(route.request().url())
    ? route.continue() : route.abort());
  await page.addInitScript(() => localStorage.setItem('storyImagesEnabled', '0'));
  const user = makeUser();
  const first = 'The little fox walks to a big tree. A bird sits on a low branch. The fox sees a blue door and a small red key. The bird waves a wing and sings a song.';
  await mockSupabase(page, { user, story: { success: true, pages: [first], choices: ['Open the door', 'Ask the bird for help', 'Look at the key'] }, tables: {
    child_profiles: [{ id: '22222222-2222-4222-8222-222222222222', parent_user_id: user.id, display_name: 'Pip', age: 7, grade_level: '2', avatar: { type: 'prefer-not-to-answer' } }],
    subscribers: [{ id: 'fixture-sub', user_id: user.id, email: user.email, subscribed: true, subscription_end: '2035-01-01T00:00:00Z', subscription_tier: 'monthly' }],
  } });
  await signInAs(page, user);
  await page.clock.install();
  await page.goto('/');
  await page.getByRole('button', { name: 'Only needed', exact: true }).click();
  await page.getByRole('button', { name: /create your first story/i }).click();
  const dialog = page.getByTestId('new-story-dialog');
  await dialog.getByRole('button', { name: /\+ space/i }).click();
  await dialog.getByTestId('write-story').click();
  // Wide screens also render the phone layout, hidden: wait for the copy that is on screen.
  await expect(page.getByText('The little fox walks to a big tree.').locator('visible=true').first()).toBeVisible({ timeout: 20_000 });
}

for (const [width, height] of [[320, 640], [390, 844], [820, 1180], [1280, 800]] as const) {
  test(`Start here! is whole and readable at ${width} px, under the button`, async ({ page }, testInfo) => {
    test.setTimeout(60_000); // sign-in, a written story and the checks: 30 s is too tight on a busy runner
    await page.setViewportSize({ width, height });
    await openStory(page);
    const chip = page.getByTestId('start-here-coach').locator('visible=true').first();
    await expect(chip).toBeVisible();
    // On a 640 px tall phone the story view scrolls its text into view on open, which takes the
    // header off screen; bring the chip back before judging it (CI capture, run 45072947966).
    await chip.scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath(`start-here-${width}.png`) });
    // Measure now, with the clock running: the chip shows for 7 s and this takes well under 1 s.
    // Never pause the page clock here: under a paused clock the page's main thread spins and
    // even page.evaluate(() => 1) never returns (probe run 45067541075).
    const box = await chip.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const b = el.parentElement!.querySelector('button')!.getBoundingClientRect();
      const arrow = el.querySelector('svg')!.getBoundingClientRect();
      const cut: string[] = [];
      if (r.left < 0 || r.right > window.innerWidth || r.top < 0 || r.bottom > window.innerHeight) cut.push(`viewport ${Math.round(r.left)}..${Math.round(r.right)}`);
      for (let p = el.parentElement; p; p = p.parentElement) {
        const cs = getComputedStyle(p);
        if (cs.overflowX === 'visible' && cs.overflowY === 'visible') continue;
        const q = p.getBoundingClientRect();
        if (r.left < q.left - 0.5 || r.right > q.right + 0.5 || r.top < q.top - 0.5 || r.bottom > q.bottom + 0.5) {
          cut.push(`${p.tagName}.${String(p.className).slice(0, 40)} ${Math.round(q.left)}..${Math.round(q.right)} cuts ${Math.round(r.left)}..${Math.round(r.right)}`);
        }
      }
      const hit = (q: DOMRect) => r.left < q.right && q.left < r.right && r.top < q.bottom && q.top < r.bottom;
      const titles = [...document.querySelectorAll('h1')].map((h) => h.getBoundingClientRect()).filter((q) => q.width > 0 && q.height > 0);
      const cs = getComputedStyle(el.querySelector('span')!);
      // [r, g, b, alpha]; a see-through text colour is blended over its fill first.
      const rgba = (c: string) => { const v = (c.match(/[\d.]+/g) ?? []).map(Number); return [v[0], v[1], v[2], v[3] ?? 1]; };
      const lum = (v: number[]) => {
        const [R, G, B] = v.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; });
        return 0.2126 * R + 0.7152 * G + 0.0722 * B;
      };
      const fill = rgba(cs.backgroundColor);
      const ink = rgba(cs.color);
      const seen = ink.slice(0, 3).map((x, i) => ink[3] * x + (1 - ink[3]) * fill[i]);
      const [hi, lo] = [lum(seen), lum(fill)].sort((x, y) => y - x);
      const alpha = fill[3];
      return {
        cut, chip: { top: r.top, left: r.left, width: r.width, text: el.textContent }, button: { bottom: b.bottom, left: b.left },
        arrowOnButton: arrow.left + arrow.width / 2 >= b.left && arrow.left + arrow.width / 2 <= b.right,
        titles: titles.length, overTitle: titles.some(hit), overButton: hit(b),
        fontPx: parseFloat(cs.fontSize), opaqueFill: alpha === 1, contrast: (hi + 0.05) / (lo + 0.05),
      };
    });
    // Soft checks: a broken chip reports every way it is broken, not only the first.
    expect.soft(box.cut, 'Start here! chip is cut off').toEqual([]);
    expect(box.chip.text).toContain('Start here!');
    expect(box.chip.width).toBeGreaterThan(40);
    expect.soft(box.chip.top, 'Start here! chip sits under the New Story button').toBeGreaterThanOrEqual(box.button.bottom - 1);
    expect.soft(box.arrowOnButton, 'Start here! arrow points at the New Story button').toBe(true);
    // On a phone row the chip starts at the button: centred under it, the chip is wider than
    // the button and ran past the screen edge at 320 px (98 px chip in CI's font).
    if (width < 640) expect.soft(box.chip.left, 'Start here! chip starts at the button, not left of it').toBeGreaterThanOrEqual(box.button.left - 0.5);
    expect.soft(box.titles, 'a story title is on screen to check against').toBeGreaterThan(0);
    expect.soft(box.overTitle, 'Start here! chip covers the story title').toBe(false);
    expect.soft(box.overButton, 'Start here! chip covers the New Story button').toBe(false);
    expect.soft(box.fontPx, 'Start here! text is 12 px or more').toBeGreaterThanOrEqual(12);
    expect.soft(box.opaqueFill, 'Start here! has a solid fill of its own').toBe(true);
    expect.soft(box.contrast, 'Start here! text clears 4.5:1').toBeGreaterThanOrEqual(4.5);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);

    // The 7 s hide timer is real: past it, the chip is gone.
    await page.clock.fastForward(7_500);
    await expect.poll(() => page.evaluate(() =>
      [...document.querySelectorAll('[data-testid="start-here-coach"]')].filter((e) => e.getClientRects().length > 0).length,
    )).toBe(0);
  });
}

for (const width of [320, 390] as const) {
  test(`the story title reads in full on a ${width} px phone`, async ({ page }, testInfo) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width, height: 800 });
    await openStory(page);
    const title = page.getByTestId('story-title').locator('visible=true').first();
    await expect(title).toHaveText("Pip's Live Adventure");
    // The sign-in sparkles (about 2 s, floating up to 45 px) stay on the controls row and
    // never cross onto the title. Sampled for 1.2 s; they must be seen at least once.
    const sparkle = await page.evaluate(async () => {
      const h1 = document.querySelector('[data-testid="story-title"]')!.getBoundingClientRect();
      const controls = document.querySelector('[data-testid="story-controls"]')!.getBoundingClientRect();
      let seen = 0;
      const strays: string[] = [];
      for (let i = 0; i < 12; i++) {
        for (const layer of document.querySelectorAll('[data-testid="story-controls"] [data-testid="sparkles"]')) {
          for (const g of layer.children) {
            let r = g.getBoundingClientRect();
            if (r.width === 0 || r.height === 0 || Number(getComputedStyle(g).opacity) === 0) continue;
            // What is drawn: the glyph cut by every clipping box above it.
            let top = r.top, bottom = r.bottom, left = r.left, right = r.right;
            for (let p = g.parentElement; p; p = p.parentElement) {
              const cs = getComputedStyle(p);
              if (cs.overflowX === 'visible' && cs.overflowY === 'visible') continue;
              const q = p.getBoundingClientRect();
              top = Math.max(top, q.top); bottom = Math.min(bottom, q.bottom); left = Math.max(left, q.left); right = Math.min(right, q.right);
            }
            if (bottom <= top || right <= left) continue;
            seen++;
            const onTitle = left < h1.right && h1.left < right && top < h1.bottom && h1.top < bottom;
            if (onTitle || top < controls.top - 0.5) strays.push(`${Math.round(left)},${Math.round(top)}`);
          }
        }
        await new Promise((res) => setTimeout(res, 100));
      }
      return { seen, strays };
    });
    expect.soft(sparkle.seen, 'the sign-in sparkles were on screen to check').toBeGreaterThan(0);
    expect.soft(sparkle.strays, 'sparkles drawn above the controls row, onto the title').toEqual([]);
    const fit = await title.evaluate((el) => ({
      cut: el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1,
      width: el.getBoundingClientRect().width,
      row: el.parentElement!.clientWidth,
    }));
    const controls = await page.getByTestId('story-controls').locator('visible=true').first().evaluate((el) => {
      const badge = el.querySelector('[data-testid="level-badge"]')!;
      const range = document.createRange();
      range.selectNodeContents(badge);
      const lines = new Set([...range.getClientRects()].filter((q) => q.width > 0).map((q) => Math.round(q.top))).size;
      const row = el.parentElement!.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      return { badge: badge.textContent, lines, fits: r.left >= row.left - 0.5 && r.right <= row.right + 0.5 && el.scrollWidth <= el.clientWidth + 1 };
    });
    expect(controls.badge).toMatch(/grade/);
    expect.soft(controls.lines, `the level pill ("${controls.badge}") reads on one line`).toBe(1);
    expect.soft(controls.fits, 'the story controls fit their row').toBe(true);
    expect.soft(fit.cut, 'story title is cut off').toBe(false);
    expect.soft(fit.width, 'story title has the row to itself').toBeGreaterThanOrEqual(fit.row - 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    // The header row itself (title over the controls): the page view is scrolled to the story text.
    await title.locator('xpath=..').screenshot({ path: testInfo.outputPath(`story-title-${width}.png`) });
  });
}
