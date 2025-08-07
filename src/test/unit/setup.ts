import '@testing-library/jest-dom';
import { vi } from 'vitest';

// CRITICAL: Set up global constructor mocks BEFORE any imports
const mockAudioContext = vi.fn(() => ({
  createOscillator: vi.fn(),
  createGain: vi.fn(),
  destination: {},
  resume: vi.fn().mockResolvedValue(undefined),
  suspend: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
  state: 'suspended',
}));

const mockSpeechSynthesisUtterance = vi.fn((text) => ({
  text,
  rate: 1,
  pitch: 1,
  volume: 1,
  voice: null,
  lang: 'en-US',
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}));

// Set up ALL possible scopes for these constructors with proper type casting
(global as any).AudioContext = mockAudioContext;
(global as any).webkitAudioContext = mockAudioContext;
(global as any).SpeechSynthesisUtterance = mockSpeechSynthesisUtterance;

(globalThis as any).AudioContext = mockAudioContext;
(globalThis as any).webkitAudioContext = mockAudioContext;  
(globalThis as any).SpeechSynthesisUtterance = mockSpeechSynthesisUtterance;

// Mock window objects
Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: mockAudioContext,
});

Object.defineProperty(window, 'webkitAudioContext', {
  writable: true,
  value: mockAudioContext,
});

Object.defineProperty(window, 'SpeechSynthesisUtterance', {
  writable: true,
  value: mockSpeechSynthesisUtterance,
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
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
});

// Mock other window APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.URL.createObjectURL = vi.fn().mockReturnValue('mocked-blob-url');
global.URL.revokeObjectURL = vi.fn();

global.fetch = vi.fn();

// Enhanced i18next mock to prevent warnings
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      // Return key as fallback to prevent missing translation warnings
      return key;
    },
    i18n: { 
      changeLanguage: vi.fn().mockResolvedValue(undefined),
      language: 'en',
      languages: ['en', 'es', 'fr', 'pt', 'ar', 'zh', 'hi'],
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
}));

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: { invoke: vi.fn() },
  },
}));

// Mock services that cause issues
vi.mock('@/services/phoneticRulesEngine', () => ({
  PhoneticRulesEngine: {
    getInstance: vi.fn(() => ({
      breakIntoSyllables: vi.fn((word) => [word]),
    })),
  },
}));

vi.mock('@/services/contextualPronunciation', () => ({
  contextualPronunciation: {
    getPhoneticSpelling: vi.fn((word) => word),
  },
}));

vi.mock('@/utils/vocabularyLevelClassifier', () => ({
  VocabularyLevelClassifier: {
    getWordDifficulty: vi.fn(() => ({
      level: 1,
      shouldHighlight: true,
      complexity: 'beginner',
    })),
  },
}));

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

vi.mock('@/services/enhancedAudioService', () => ({
  EnhancedAudioService: vi.fn().mockImplementation(() => ({
    speak: vi.fn().mockResolvedValue(undefined),
    stopAudio: vi.fn(),
    isPlaying: vi.fn().mockReturnValue(false),
    initialize: vi.fn().mockResolvedValue(undefined),
  })),
}));

// Additional service mocks
vi.mock('@/services/unifiedTTSService', () => ({
  UnifiedTTSService: vi.fn().mockImplementation(() => ({
    speakText: vi.fn().mockResolvedValue(undefined),
    stopCurrentAudio: vi.fn(),
    isPlaying: vi.fn().mockReturnValue(false),
    clearCache: vi.fn(),
  })),
}));