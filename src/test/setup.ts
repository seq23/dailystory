import '@testing-library/jest-dom';

// Mock fetch by default to avoid hitting external APIs in tests
import { vi } from 'vitest';

if (!(global as any).fetch) {
  (global as any).fetch = vi.fn();
}

// Minimal speechSynthesis mock for components/services relying on it
if (typeof window !== 'undefined' && !(window as any).speechSynthesis) {
  (window as any).speechSynthesis = {
    cancel: vi.fn(),
    speak: vi.fn(),
    getVoices: () => [{ name: 'Test EN', lang: 'en-US' }],
  } as any;
}
