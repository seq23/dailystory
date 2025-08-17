import type { UserInfo } from "@/types";

const ACTIVE_KEY = 'guest.active';
const USER_KEY = 'guest.userInfo';
const TIMER_END_KEY = 'guest.timer.endTs';
const TIMER_REMAINING_KEY = 'guest.timer.remaining';

export const guestSession = {
  setActive(active: boolean) {
    try { sessionStorage.setItem(ACTIVE_KEY, active ? '1' : '0'); } catch {}
  },
  isActive(): boolean {
    try { return sessionStorage.getItem(ACTIVE_KEY) === '1'; } catch { return false; }
  },
  saveUserInfo(user: UserInfo) {
    try { 
      console.log('🔍 [DEBUG] Saving user info to guest session:', { 
        name: user.name, 
        avatar: user.avatar,
        difficultyLevel: user.difficultyLevel 
      });
      sessionStorage.setItem(USER_KEY, JSON.stringify(user)); 
    } catch {}
  },
  getUserInfo(): UserInfo | null {
    try {
      const raw = sessionStorage.getItem(USER_KEY);
      const user = raw ? (JSON.parse(raw) as UserInfo) : null;
      if (user) {
        console.log('🔍 [DEBUG] Retrieved user info from guest session:', { 
          name: user.name, 
          avatar: user.avatar,
          difficultyLevel: user.difficultyLevel 
        });
      }
      return user;
    } catch { return null; }
  },
  saveTimerEndTs(ts: number) {
    try { sessionStorage.setItem(TIMER_END_KEY, String(ts)); } catch {}
  },
  getTimerEndTs(): number | null {
    try {
      const v = Number(sessionStorage.getItem(TIMER_END_KEY));
      return Number.isFinite(v) && v > 0 ? v : null;
    } catch { return null; }
  },
  saveRemaining(seconds: number) {
    try { sessionStorage.setItem(TIMER_REMAINING_KEY, String(Math.max(0, Math.floor(seconds)))); } catch {}
  },
  getRemaining(): number | null {
    try {
      const v = Number(sessionStorage.getItem(TIMER_REMAINING_KEY));
      return Number.isFinite(v) && v >= 0 ? v : null;
    } catch { return null; }
  },
  clearAll() {
    try {
      sessionStorage.removeItem(ACTIVE_KEY);
      sessionStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(TIMER_END_KEY);
      sessionStorage.removeItem(TIMER_REMAINING_KEY);
    } catch {}
  }
};
