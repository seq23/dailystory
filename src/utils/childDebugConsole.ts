import { DebugLogger } from "@/services/DebugLogger";

/**
 * Child Profile Debug Console Utility
 * 
 * Access via: window.childDebug
 * 
 * Usage:
 * - window.childDebug.profiles() - Show all child profiles
 * - window.childDebug.active() - Show active child
 * - window.childDebug.avatar() - Show avatar info for active child
 * - window.childDebug.logs() - Show child-related debug logs
 */

interface ChildDebugConsole {
  profiles: () => void;
  active: () => void;
  avatar: () => void;
  logs: () => void;
}

class ChildProfileDebugger {
  profiles() {
    // Get profiles from localStorage or direct access
    const event = new CustomEvent('get-child-profiles');
    window.dispatchEvent(event);
    console.log('🧒 [Child Debug] Dispatched get-child-profiles event. Check useChildProfiles hook.');
  }

  active() {
    const event = new CustomEvent('get-active-child');
    window.dispatchEvent(event);
    console.log('👤 [Child Debug] Dispatched get-active-child event. Check useChildProfiles hook.');
  }

  avatar() {
    const event = new CustomEvent('debug-avatar-info');
    window.dispatchEvent(event);
    console.log('🎭 [Child Debug] Dispatched debug-avatar-info event. Check PremiumHeader component.');
  }

  logs() {
    const childLogs = DebugLogger.getLogs('ui');
    const authLogs = DebugLogger.getLogs('auth');
    
    console.group('🔍 [Child Debug] Recent Logs');
    console.log('UI logs:', childLogs);
    console.log('Auth logs:', authLogs);
    console.groupEnd();
  }
}

// Initialize debug console
const childDebugInstance = new ChildProfileDebugger();

// Attach to window
declare global {
  interface Window {
    childDebug: ChildDebugConsole;
  }
}

if (typeof window !== 'undefined') {
  window.childDebug = childDebugInstance;
  console.log('🧒 [Child Debug] Console loaded. Use window.childDebug for debugging.');
}

export { childDebugInstance as childDebugConsole };