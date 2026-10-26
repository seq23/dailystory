// Which guest screen is open on the homepage. The marketing text under the app
// (HomeIntro, collection links, footer) belongs to the plain homepage only: while a
// signed-out visitor is signing in, signing up or reading a guest story, that screen
// is a full screen of its own and the marketing text is not there to scroll into.
// The prerendered HTML (src/prerender/entry.tsx) is unaffected: crawlers still get it.
import { useSyncExternalStore } from "react";

export type GuestScreen = "welcome" | "form" | "reading" | "upgrade" | "login";

let current: GuestScreen = "welcome";
const listeners = new Set<() => void>();

export function setGuestScreen(next: GuestScreen) {
  if (next === current) return;
  current = next;
  listeners.forEach((l) => l());
}

export function getGuestScreen(): GuestScreen {
  return current;
}

/** True only on the plain homepage (the welcome screen). */
export function useOnPlainHomepage(): boolean {
  const screen = useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => current,
    () => "welcome" as GuestScreen,
  );
  return screen === "welcome";
}
