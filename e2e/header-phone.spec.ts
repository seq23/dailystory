import { expect, test } from '@playwright/test';
import { makeUser, mockSupabase, signInAs } from './support/mockSupabase';

// The site header on a phone: the Menu button, the Time-2-Read logo and the "Reading as <child>"
// picker share one row. At 320 px the picker sat on top of the "Time-2-Read" wordmark (review
// of #175, 22 Nov 2026). Each part must be drawn whole, inside the screen, and clear of the
// others, with the longest child name the picker shows (it truncates at its max width).
for (const [width, name] of [[320, 'Pip'], [320, 'Alexandria-Rose'], [360, 'Alexandria-Rose'], [390, 'Alexandria-Rose'], [430, 'Alexandria-Rose']] as const) {
  test(`header parts do not overlap at ${width} px (child "${name}")`, async ({ page }, testInfo) => {
    await page.route('**/*', route => /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/)/.test(route.request().url())
      ? route.continue() : route.abort());
    await page.setViewportSize({ width, height: 800 });
    const user = makeUser();
    await mockSupabase(page, { user, tables: {
      child_profiles: [{ id: '22222222-2222-4222-8222-222222222222', parent_user_id: user.id, display_name: name, age: 7, grade_level: '2', avatar: { type: 'prefer-not-to-answer' } }],
    } });
    await signInAs(page, user);
    await page.goto('/');
    const header = page.locator('header').first();
    await expect(header.getByTestId('reader-name')).toHaveText(name);
    await page.screenshot({ path: testInfo.outputPath(`header-${width}-${name.length}.png`), clip: { x: 0, y: 0, width, height: 120 } });
    const parts = await header.evaluate((h) => {
      const box = (el: Element | null) => { if (!el) return null; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 ? r : null; };
      const pick = (label: string, el: Element | null) => ({ label, r: box(el) });
      return [
        pick('menu', h.querySelector('[data-testid="menu-button"]')),
        pick('logo icon', h.querySelector('a[href="/"] img')),
        pick('wordmark', h.querySelector('a[href="/"] span')),
        pick('picker', h.querySelector('[data-testid="reader-switcher"]')),
      ].filter((p) => p.r).map((p) => ({ label: p.label, left: p.r!.left, right: p.r!.right, top: p.r!.top, bottom: p.r!.bottom }));
    });
    const labels = parts.map((p) => p.label);
    expect(labels, 'menu, logo and picker are drawn').toEqual(expect.arrayContaining(['menu', 'logo icon', 'picker']));
    for (const p of parts) {
      expect(p.left >= -0.5 && p.right <= width + 0.5, `${p.label} inside the screen (${Math.round(p.left)}..${Math.round(p.right)})`).toBe(true);
    }
    for (let i = 0; i < parts.length; i++) for (let j = i + 1; j < parts.length; j++) {
      const a = parts[i], b = parts[j];
      const overlap = a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;
      expect(overlap, `${a.label} ${Math.round(a.left)}..${Math.round(a.right)} clear of ${b.label} ${Math.round(b.left)}..${Math.round(b.right)}`).toBe(false);
    }
    // Where there is room, the name is spelled out beside the logo.
    if (width >= 430) expect(labels).toContain('wordmark');
  });
}
