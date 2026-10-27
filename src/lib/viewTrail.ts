// Where "← Back" goes on a menu page (27 Oct 2026, final live tests: My Stories, Story Library,
// Progress, Grown-up settings, Reading settings, Parent dashboard and Help had no way back but
// the menu). The app switches views in state, so the trail of views is kept here.
// Guard: src/test/guards/menu-back.test.ts.

/** Views with no Back button: My Stories (the home screen) and the reading screen (it has its own controls). Help is the "home" view and has Back. */
export const BACKLESS_VIEWS: readonly string[] = ["stories", "reading", "email-confirmation-required"];

/** Never returned to by Back: a story is opened again from the library, not by Back. */
const NOT_A_BACK_TARGET: readonly string[] = ["reading", "email-confirmation-required"];

export const HOME_VIEW = "stories";
const MAX_TRAIL = 10;

export function showsBack(view: string): boolean {
  return !BACKLESS_VIEWS.includes(view);
}

/** The trail after moving from one view to another. */
export function pushView(trail: readonly string[], from: string, to: string): string[] {
  if (from === to) return [...trail];
  return [...trail, from].slice(-MAX_TRAIL);
}

/** Where Back goes from `current`, and the trail left after going there. Home when nothing is left. */
export function popView(trail: readonly string[], current: string): { to: string; trail: string[] } {
  const rest = [...trail];
  while (rest.length) {
    const v = rest.pop()!;
    if (v !== current && !NOT_A_BACK_TARGET.includes(v)) return { to: v, trail: rest };
  }
  return { to: HOME_VIEW, trail: [] };
}
