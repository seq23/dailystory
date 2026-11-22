import { expect, test } from '@playwright/test';
import { makeUser, mockSupabase, signInAs } from './support/mockSupabase';

test.use({ viewport: { width: 390, height: 844 } });

test('Premium choices fit a phone, drive the next page, and disappear after Finish Story', async ({ page }, testInfo) => {
  // Invented fixtures only. No paid inference, images, email or database requests.
  await page.route('**/*', route => /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/)/.test(route.request().url())
    ? route.continue() : route.abort());
  await page.addInitScript(() => localStorage.setItem('storyImagesEnabled', '0'));
  const user = makeUser();
  const first = 'The little fox walks to a big tree. A bird sits on a low branch. The fox sees a blue door and a small red key. The bird waves a wing and sings a song.';
  const next = 'The fox asks the bird for help. The bird points to the key and smiles. Together they lift the key to the blue door. A soft light shines from the lock. Something inside begins to sing.';
  const ending = 'The fox opens the door and finds a warm room full of books. The bird reads a story with the fox. They walk home under the bright stars, happy to have made a new friend. The end.';
  const options = ['Open the door', 'Ask the bird for help', 'Look at the key'];
  const state = await mockSupabase(page, { user, story: { success: true, pages: [first], choices: options }, tables: {
    child_profiles: [{ id: '22222222-2222-4222-8222-222222222222', parent_user_id: user.id, display_name: 'Pip', age: 7, grade_level: '2', avatar: { type: 'prefer-not-to-answer' } }],
    subscribers: [{ id: 'fixture-sub', user_id: user.id, email: user.email, subscribed: true, subscription_end: '2035-01-01T00:00:00Z', subscription_tier: 'monthly' }],
  } });
  await signInAs(page, user);
  await page.goto('/');
  await page.getByRole('button', { name: 'Only needed', exact: true }).click();
  await page.getByRole('button', { name: /create your first story/i }).click();
  const dialog = page.getByTestId('new-story-dialog');
  await dialog.getByRole('button', { name: /\+ space/i }).click();
  await dialog.getByTestId('write-story').click();
  // The "Start here!" chip by the New Story button stays on a 390 px screen (it used
  // to run off the left edge, cutting off "Start here!" and the story title).
  await expect(page.getByTestId('story-text-scroll-mobile')).toBeVisible({ timeout: 20_000 });
  const chip = page.getByTestId('start-here-coach').first();
  await expect(chip).toBeVisible();
  // Whole on screen AND not cut by any parent that clips (the old chip sat at x >= 0 but
  // a parent with overflow hidden cut "Start here!" in half).
  const cut = await chip.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const out: string[] = [];
    if (r.left < 0 || r.right > window.innerWidth) out.push(`viewport ${Math.round(r.left)}..${Math.round(r.right)}`);
    for (let p = el.parentElement; p; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (cs.overflowX === 'visible' && cs.overflowY === 'visible') continue;
      const b = p.getBoundingClientRect();
      if (r.left < b.left - 0.5 || r.right > b.right + 0.5 || r.top < b.top - 0.5 || r.bottom > b.bottom + 0.5) {
        out.push(`${p.tagName}.${String(p.className).slice(0, 40)} ${Math.round(b.left)}..${Math.round(b.right)} cuts ${Math.round(r.left)}..${Math.round(r.right)}`);
      }
    }
    return out;
  });
  // Soft checks: a broken chip reports every way it is broken, not only the first.
  expect.soft(cut, 'Start here! chip is cut off').toEqual([]);
  // It covers neither the story title nor the button (it sits under the button), and
  // "Start here!" is readable: 12 px or more, 4.5:1 or better against its own fill.
  const fit = await chip.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const hit = (b: DOMRect) => r.left < b.right && b.left < r.right && r.top < b.bottom && b.top < r.bottom;
    const titles = [...document.querySelectorAll('h1')].map((h) => h.getBoundingClientRect()).filter((b) => b.width > 0 && b.height > 0);
    const button = el.parentElement!.querySelector('button')!.getBoundingClientRect();
    const text = el.querySelector('span')!;
    const cs = getComputedStyle(text);
    // [r, g, b, alpha]; a faint (see-through) text colour is blended over its fill first.
    const rgba = (c: string) => { const v = (c.match(/[\d.]+/g) ?? []).map(Number); return [v[0], v[1], v[2], v[3] ?? 1]; };
    const lum = (v: number[]) => {
      const [R, G, B] = v.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; });
      return 0.2126 * R + 0.7152 * G + 0.0722 * B;
    };
    const fill = rgba(cs.backgroundColor);
    const ink = rgba(cs.color);
    const seen = ink.slice(0, 3).map((x, i) => ink[3] * x + (1 - ink[3]) * fill[i]);
    const [a, b] = [lum(seen), lum(fill)].sort((x, y) => y - x);
    const alpha = fill[3];
    return {
      titles: titles.length,
      overTitle: titles.some(hit),
      belowButton: r.top >= button.bottom - 1,
      overButton: hit(button),
      fontPx: parseFloat(cs.fontSize),
      contrast: (a + 0.05) / (b + 0.05),
      opaqueFill: alpha === 1,
    };
  });
  expect.soft(fit.titles, 'a story title is on screen to check against').toBeGreaterThan(0);
  expect.soft(fit.overTitle, 'Start here! chip covers the story title').toBe(false);
  expect.soft(fit.overButton, 'Start here! chip covers the New Story button').toBe(false);
  expect.soft(fit.belowButton, 'Start here! chip sits under the New Story button').toBe(true);
  expect.soft(fit.fontPx, 'Start here! text is 12 px or more').toBeGreaterThanOrEqual(12);
  expect.soft(fit.opaqueFill, 'Start here! has a solid fill of its own').toBe(true);
  expect.soft(fit.contrast, 'Start here! text clears 4.5:1').toBeGreaterThanOrEqual(4.5);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({ path: testInfo.outputPath('start-here-phone.png') });
  const choices = page.getByRole('region', { name: 'Pick what happens next' });
  await expect(choices).toBeVisible({ timeout: 20_000 });
  const buttons = choices.getByRole('button');
  await expect(buttons).toHaveCount(3);
  for (const button of await buttons.all()) {
    await button.scrollIntoViewIfNeeded();
    const rect = await button.boundingBox();
    expect(rect).not.toBeNull();
    expect(rect!.height).toBeGreaterThanOrEqual(48);
    expect(rect!.x).toBeGreaterThanOrEqual(0);
    expect(rect!.x + rect!.width).toBeLessThanOrEqual(390);
  }
  await choices.screenshot({ path: testInfo.outputPath('choices-phone.png') });
  const generated = () => state.calls.filter(c => c.fn === 'generate-adaptive-story');
  const before = generated().length;
  state.story = { success: true, pages: [next], choices: ['Turn the key', 'Listen to the song', 'Look for a window'] };
  await choices.getByRole('button', { name: options[1], exact: true }).click();
  await expect(page.getByTestId('story-text-scroll-mobile')).toContainText('The fox asks the bird for help');
  expect(generated()).toHaveLength(before + 1);
  expect(generated()[before].body.config).toMatchObject({ selectedChoice: options[1], sessionType: 'premium', pageNumber: 2 });

  // Going back is reading, not a new branch or another generation call.
  await page.getByRole('button', { name: /^back$/i }).first().click();
  await expect(choices).toHaveCount(0);
  await page.getByRole('button', { name: /^next$/i }).first().click();
  await expect(choices).toBeVisible();
  expect(generated()).toHaveLength(before + 1);

  state.story = { success: true, pages: [ending] };
  await page.getByRole('button', { name: /^finish story!?$/i }).first().click();
  await page.getByRole('button', { name: 'Yes, I’m ready for the last page!', exact: true }).click();
  await expect(page.getByTestId('story-text-scroll-mobile')).toContainText('The end.');
  expect(generated()[generated().length - 1].body.config.isEndingPage).toBe(true);
  await expect(choices).toHaveCount(0);
});
