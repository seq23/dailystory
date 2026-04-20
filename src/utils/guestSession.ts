import type { UserInfo } from "@/types";

/**
 * Guest session persistence.
 *
 * Uses localStorage (not sessionStorage) so the session survives:
 *  - page refreshes
 *  - any stray sessionStorage.clear() calls (e.g. from auth flows)
 *  - tab close/reopen within the timer window
 *
 * The 20-minute timer end-timestamp is the source of truth for expiration —
 * when it passes, clearAll() is called and the guest starts fresh.
 */

const ACTIVE_KEY = 'guest.active';
const USER_KEY = 'guest.userInfo';
const TIMER_END_KEY = 'guest.timer.endTs';
const TIMER_REMAINING_KEY = 'guest.timer.remaining';

// Read from localStorage with a one-time migration from legacy sessionStorage
function readMigrated(key: string): string | null {
  try {
    const v = localStorage.getItem(key);
    if (v !== null) return v;
    // Migrate any leftover sessionStorage value from previous versions
    const legacy = sessionStorage.getItem(key);
    if (legacy !== null) {
      localStorage.setItem(key, legacy);
      sessionStorage.removeItem(key);
      return legacy;
    }
    return null;
  } catch { return null; }
}

export const guestSession = {
  setActive(active: boolean) {
    try { localStorage.setItem(ACTIVE_KEY, active ? '1' : '0'); } catch {}
  },
  isActive(): boolean {
    try { return readMigrated(ACTIVE_KEY) === '1'; } catch { return false; }
  },
  saveUserInfo(user: UserInfo) {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {}
  },
  getUserInfo(): UserInfo | null {
    try {
      const raw = readMigrated(USER_KEY);
      return raw ? (JSON.parse(raw) as UserInfo) : null;
    } catch { return null; }
  },
  saveTimerEndTs(ts: number) {
    try { localStorage.setItem(TIMER_END_KEY, String(ts)); } catch {}
  },
  getTimerEndTs(): number | null {
    try {
      const v = Number(readMigrated(TIMER_END_KEY));
      return Number.isFinite(v) && v > 0 ? v : null;
    } catch { return null; }
  },
  saveRemaining(seconds: number) {
    try { localStorage.setItem(TIMER_REMAINING_KEY, String(Math.max(0, Math.floor(seconds)))); } catch {}
  },
  getRemaining(): number | null {
    try {
      const v = Number(readMigrated(TIMER_REMAINING_KEY));
      return Number.isFinite(v) && v >= 0 ? v : null;
    } catch { return null; }
  },
  clearAll() {
    try {
      localStorage.removeItem(ACTIVE_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TIMER_END_KEY);
      localStorage.removeItem(TIMER_REMAINING_KEY);
      // Also clear any legacy sessionStorage entries
      sessionStorage.removeItem(ACTIVE_KEY);
      sessionStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(TIMER_END_KEY);
      sessionStorage.removeItem(TIMER_REMAINING_KEY);
    } catch {}
  }
};
