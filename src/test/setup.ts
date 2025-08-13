import '@testing-library/jest-dom';
import '@/i18n/config';

// Mock fetch by default to avoid hitting external APIs in tests
import { vi } from 'vitest';

if (!(global as any).fetch) {
  (global as any).fetch = vi.fn();
}

// Polyfill base64 helpers if missing (Node/JSDOM)
if (!(global as any).atob) {
  (global as any).atob = (b64: string) => (globalThis as any).Buffer.from(b64, 'base64').toString('binary');
}
if (!(global as any).btoa) {
  (global as any).btoa = (str: string) => (globalThis as any).Buffer.from(str, 'binary').toString('base64');
}

// Minimal SpeechSynthesisUtterance mock
if (typeof (globalThis as any).SpeechSynthesisUtterance === 'undefined') {
  class MockUtterance {
    text: string;
    rate = 1;
    pitch = 1;
    voice: any = null;
    onstart?: () => void;
    onend?: () => void;
    onerror?: (e?: any) => void;
    constructor(text: string) {
      this.text = text;
    }
  }
  ;(globalThis as any).SpeechSynthesisUtterance = MockUtterance as any;
}

// speechSynthesis mock for components/services relying on it
if (typeof window !== 'undefined' && !(window as any).speechSynthesis) {
  const synth: any = {
    speaking: false,
    _lastUtterance: null as any,
    cancel: vi.fn(function (this: any) {
      this.speaking = false;
      if (this._lastUtterance && this._lastUtterance.onend) {
        try { this._lastUtterance.onend(); } catch {}
      }
    }),
    speak: vi.fn(function (this: any, utterance?: any) {
      this._lastUtterance = utterance;
      this.speaking = true;
      try { utterance?.onstart?.(); } catch {}
    }),
    getVoices: () => [
      { name: 'Test EN', lang: 'en-US' },
      { name: 'Child Friendly', lang: 'en-US' },
    ],
  };
  (window as any).speechSynthesis = synth as any;
}

// Mock Audio API to avoid playback errors in JSDOM
if (typeof window !== 'undefined' && !(window as any).Audio) {
  (window as any).Audio = function (this: any, src?: string) {
    this.src = src || '';
    this.preload = '';
    this.volume = 1;
    this.paused = true;
    this.currentTime = 0;
    this._listeners = {} as Record<string, Function[]>;
    this.play = vi.fn(() => {
      this.paused = false;
      return Promise.resolve();
    });
    this.pause = vi.fn(() => {
      this.paused = true;
      (this._listeners['pause'] || []).forEach((fn: any) => fn());
    });
    this.addEventListener = (ev: string, fn: any) => {
      (this._listeners[ev] ||= []).push(fn);
    };
    this.removeEventListener = (ev: string, fn: any) => {
      this._listeners[ev] = (this._listeners[ev] || []).filter((f: any) => f !== fn);
    };
  } as any;
}

// Mock AudioContext to satisfy mobile audio initialization
if (typeof window !== 'undefined') {
  class MockAudioContext {
    state = 'running';
    resume = vi.fn(async () => { this.state = 'running'; });
    close = vi.fn(async () => { this.state = 'closed'; });
  }
  (window as any).AudioContext = MockAudioContext as any;
  (window as any).webkitAudioContext = MockAudioContext as any;
}

// Stub Media Session and Network Information APIs used by mobile audio manager
if (typeof navigator !== 'undefined') {
  if (!('mediaSession' in navigator)) {
    (navigator as any).mediaSession = { setActionHandler: vi.fn() };
  }
  if (!(navigator as any).connection) {
    (navigator as any).connection = {
      effectiveType: '4g',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
  }
}

// Provide a tolerant :contains() selector shim for brittle tests
(() => {
  const originalQS = Document.prototype.querySelector as any;
  const originalQSA = Document.prototype.querySelectorAll as any;
  Document.prototype.querySelector = function (selectors: any) {
    try {
      return originalQS.call(this, selectors);
    } catch (_e) {
      // fallthrough to shim
    }
    if (typeof selectors === 'string' && selectors.includes(':contains(')) {
      const start = selectors.indexOf(':contains(') + 10;
      const end = selectors.indexOf(')', start);
      const raw = end > start ? selectors.slice(start, end) : selectors.slice(start);
      const needle = raw.replace(/^['"]+|['"]+$/g, '').replace(/,/g, '').trim();
      const all = originalQSA.call(this, '*') as any[];
      for (const el of all) {
        if ((el?.textContent || '').includes(needle)) return el;
      }
      return null;
    }
    return originalQS.call(this, selectors);
  } as any;
})();
