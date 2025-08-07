import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock Web Audio API on window object
Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    createOscillator: vi.fn(),
    createGain: vi.fn(),
    destination: {},
    resume: vi.fn().mockResolvedValue(undefined),
    suspend: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    state: 'suspended',
  })),
});

Object.defineProperty(window, 'webkitAudioContext', {
  writable: true,
  value: window.AudioContext,
});

// Mock Speech Synthesis API on window object
Object.defineProperty(window, 'SpeechSynthesisUtterance', {
  writable: true,
  value: vi.fn().mockImplementation((text) => ({
    text,
    rate: 1,
    pitch: 1,
    volume: 1,
    voice: null,
    lang: 'en-US',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});

Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: {
    speak: vi.fn(),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn().mockReturnValue([]),
    speaking: false,
    pending: false,
    paused: false,
    onvoiceschanged: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  },
});

// Ensure global fallbacks and proper constructor assignment
global.AudioContext = window.AudioContext;
global.webkitAudioContext = window.AudioContext;
global.SpeechSynthesisUtterance = window.SpeechSynthesisUtterance;
global.speechSynthesis = window.speechSynthesis;

// Explicitly assign constructors to globalThis for better compatibility
globalThis.AudioContext = window.AudioContext;
globalThis.webkitAudioContext = window.AudioContext;
globalThis.SpeechSynthesisUtterance = window.SpeechSynthesisUtterance;
globalThis.speechSynthesis = window.speechSynthesis;

// Mock URL.createObjectURL
Object.assign(global.URL, {
  createObjectURL: vi.fn().mockReturnValue('mocked-blob-url'),
  revokeObjectURL: vi.fn(),
});

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
}));

// Mock fetch
global.fetch = vi.fn();

// Mock MobileAudioManager
vi.mock('@/services/mobileAudioManager', () => ({
  MobileAudioManager: {
    getInstance: vi.fn(() => ({
      initializeMobileAudio: vi.fn().mockResolvedValue(undefined),
      playAudioBlob: vi.fn().mockResolvedValue(undefined),
      stopAudio: vi.fn(),
      isAudioReady: vi.fn().mockReturnValue(true),
      getAudioStatus: vi.fn().mockReturnValue({
        initialized: true,
        userInteractionUnlocked: true,
        audioFormat: 'mp3',
        networkQuality: 'good',
        lowPowerMode: false,
      }),
      destroy: vi.fn(),
    })),
  },
}));

// Mock Enhanced Audio Service
vi.mock('@/services/enhancedAudioService', () => ({
  EnhancedAudioService: vi.fn().mockImplementation(() => ({
    speak: vi.fn().mockResolvedValue(undefined),
    stopAudio: vi.fn(),
    isPlaying: vi.fn().mockReturnValue(false),
  })),
}));