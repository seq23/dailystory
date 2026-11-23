// The other tables at phone widths (coordinator, 22 Nov 2026): /schools (the school workspace,
// signed in as a school admin with a class on file), a book companion page and the printable
// 20-minute reading log. No cell may be clipped or run off the screen at 320 or 390 px, and the
// page itself never scrolls sideways. The captures are kept for review.
import { expect, test, type Page } from '@playwright/test';
import { makeUser, mockSupabase, signInAs } from './support/mockSupabase';

const USER = makeUser('teacher@example.test');
const SCHOOL = 'aaaaaaaa-0000-4000-8000-000000000001';
const CLASS = 'aaaaaaaa-0000-4000-8000-000000000002';
// Long-ish names and titles, as a real class has, so a cell that cannot wrap shows itself.
const STUDENTS = ['Maximiliana Featherstonehaugh', 'Bartholomew Okonkwo-Lindqvist', 'Jo Li'].map((display_name, i) => ({
  id: `aaaaaaaa-0000-4000-8000-00000000010${i}`,
  school_id: SCHOOL,
  external_id: `S-10${i}`,
  display_name,
  school_grade: '2',
  reading_grade: i === 0 ? '3' : '1',
  created_at: '2026-09-01T12:00:00Z',
}));
const ASSESSMENTS = STUDENTS.flatMap((s, i) => (['teacher_recorded', 'app'] as const).flatMap((source, j) => [
  { id: `bbbbbbbb-0000-4000-8000-0000000${i}${j}001`, assessed_on: '2026-09-15', reading_grade: '1' },
  { id: `bbbbbbbb-0000-4000-8000-0000000${i}${j}002`, assessed_on: '2026-11-15', reading_grade: '2' },
].map((a) => ({ ...a, school_id: SCHOOL, class_id: CLASS, student_id: s.id, school_grade: '2', recorded_at: `${a.assessed_on}T12:00:00Z`, source }))));
const SKILLS = ['vocabulary', 'spelling', 'definitions', 'context', 'inference'];

async function schoolWorkspace(page: Page) {
  await signInAs(page, USER);
  await mockSupabase(page, {
    user: USER,
    tables: {
      institution_schools: [{ id: SCHOOL, name: 'Riverside Elementary and Early Learning Academy' }],
      institution_members: [{ school_id: SCHOOL, user_id: USER.id, role: 'school_admin' }],
      institution_classes: [{ id: CLASS, school_id: SCHOOL, teacher_user_id: USER.id, name: 'Room 12 · Second grade readers' }],
      institution_students: STUDENTS,
      institution_enrollments: STUDENTS.map((s) => ({ class_id: CLASS, student_id: s.id, school_id: SCHOOL })),
      institution_readings: STUDENTS.flatMap((s, i) => (['teacher_recorded', 'app'] as const).map((source, j) => ({
        id: `cccccccc-0000-4000-8000-0000000000${i}${j}`, school_id: SCHOOL, class_id: CLASS, student_id: s.id,
        story_title: 'The Extraordinarily Long Adventure of the Sleepy Dragon', minutes: 20, completed: true,
        read_at: '2026-11-10T12:00:00Z', source, words_read: source === 'app' ? 412 : null,
      }))),
      institution_assessments: ASSESSMENTS,
      institution_quiz_results: ASSESSMENTS.flatMap((a, k) => SKILLS.map((skill) => ({ assessment_id: a.id, skill, correct: 3 + (k % 3), total: 6 }))),
      institution_app_links: [],
      child_profiles: [],
    },
  });
}

const PAGES: Array<{ path: string; tables: number; setup?: (page: Page) => Promise<void>; open?: (page: Page) => Promise<void> }> = [
  {
    path: '/schools',
    // Class view: skill summary, teacher and app results, dated growth, and the class list; then one
    // student's own report (two more tables).
    tables: 7,
    setup: schoolWorkspace,
    open: async (page) => {
      await page.getByText('Dated class growth comparisons').click();
      await page.getByRole('button', { name: STUDENTS[0].display_name }).click();
      await expect(page.getByText('Quiz growth by skill (percentage points)')).toBeVisible();
    },
  },
  { path: '/amazon/decodable-stories-1', tables: 1 },
  { path: '/20-minute-reading-log', tables: 1 },
];

for (const width of [320, 390] as const) {
  for (const { path, tables, setup, open } of PAGES) {
    test(`${path} tables at ${width} px`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      if (setup) await setup(page);
      else await page.route(/^https?:\/\/(?!localhost|127\.0\.0\.1)/, (route) => route.fulfill({ status: 204, body: '' }));
      await page.goto(path);
      const consent = page.getByRole('button', { name: 'Only needed', exact: true });
      if (await consent.isVisible({ timeout: 3_000 }).catch(() => false)) await consent.click();
      await expect(page.locator('table, [data-testid$="-row"]').first()).toBeVisible({ timeout: 20_000 });
      if (open) await open(page);
      // Each table (or its stacked list) is there: a check that passes on an empty page proves nothing.
      await expect(page.locator('table, [data-stacked-table]')).toHaveCount(tables);
      expect(await page.evaluate(() => document.documentElement.scrollWidth), `${path} fits ${width} px`).toBeLessThanOrEqual(width);
      // A cell whose text is wider than the cell, or a cell or stacked row reaching past the screen
      // (including one inside a sideways-scrolling box), is clipped.
      const clipped = await page.evaluate((w) => [...document.querySelectorAll('td, th, [data-stacked-table] > *')]
        .filter((el) => { const b = el.getBoundingClientRect(); return el.scrollWidth > el.clientWidth + 1 || b.left < -1 || b.right > w + 1; })
        .map((el) => (el.textContent ?? '').trim().slice(0, 60) || `<${el.tagName.toLowerCase()}>`), width);
      expect(clipped, `${path} clipped cells at ${width} px`).toEqual([]);
      await page.screenshot({ path: testInfo.outputPath(`${path.slice(1).replace(/\//g, '_')}-${width}.png`), fullPage: true });
    });
  }
}
