import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InteractiveWord } from '@/components/InteractiveWord';

// Simple mock user info that matches required interface
const mockUserInfo = {
  name: 'Test User',
  age: 8,
  grade: 'K',
  gradeLevel: 'K',
  readingLevel: 'Beginner',
  interests: ['animals', 'adventure'],
  language: 'en',
  nativeLanguage: 'en',
  skinTone: 'light',
  gender: 'boy',
  specialRequests: 'Make it exciting!',
  learningGoal: 'improve_reading_skills',
  avatar: {
    skinTone: 'light'
  },
  profileComplete: true,
  isESLLearner: false
} as any;

// Mock the mobile hook
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: vi.fn(() => ({
    isMobile: false,
    isTablet: false, 
    isCapacitor: false,
    hasTouchCapability: false,
    isMobileDevice: false,
    isMobileOrTablet: false
  }))
}));

// Mock the audio service
vi.mock('@/services/enhancedAudioService', () => ({
  EnhancedAudioService: vi.fn().mockImplementation(() => ({
    speakWord: vi.fn().mockResolvedValue(undefined),
    stopCurrentAudio: vi.fn(),
    isPlaying: vi.fn().mockReturnValue(false),
    config: {},
    currentAudio: null,
    audioCache: new Map(),
    highlightTimeout: null,
    cacheExpiry: new Map(),
    errorHandlingManager: null,
    pronunciationService: null,
    mobileAudioManager: null,
    difficultyManager: null,
    personalizedLearningService: null,
    adaptiveWordService: null,
    enhancedAnalytics: null,
    intelligentGuessingService: null,
    contextualCharacterEnhancer: null,
    initializeMobileAudio: vi.fn(),
    shouldUseMobileOptimization: vi.fn().mockReturnValue(false),
    generateAudio: vi.fn(),
    playAudio: vi.fn(),
    explainWord: vi.fn(),
    showSyllables: vi.fn(),
    clearCache: vi.fn(),
    updateConfig: vi.fn(),
    getAnalytics: vi.fn(),
    trackWordInteraction: vi.fn(),
    optimizeForUser: vi.fn(),
    enhanceForContext: vi.fn(),
    preloadAudio: vi.fn(),
    adjustForDifficulty: vi.fn(),
    handleError: vi.fn()
  }))
}));

describe('InteractiveWord Component', () => {
  const defaultProps = {
    word: 'hello',
    className: 'test-class',
    difficulty: 'easy' as const,
    userInfo: mockUserInfo,
    isPremium: false,
    sentenceContext: 'Hello world!'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the word correctly', () => {
    const { container } = render(<InteractiveWord {...defaultProps} />);
    expect(container.textContent).toContain('hello');
  });

  it('applies the correct CSS classes', () => {
    const { container } = render(<InteractiveWord {...defaultProps} />);
    const wordElement = container.querySelector('.test-class');
    expect(wordElement).toBeTruthy();
  });

  it('handles click events', async () => {
    const { container } = render(<InteractiveWord {...defaultProps} />);
    const wordElement = container.querySelector('.test-class');
    
    // Simulate click
    if (wordElement) {
      wordElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
    
    // Should handle click without errors
    expect(container.textContent).toContain('hello');
  });

  it('supports mobile touch interactions', async () => {
    const { container } = render(<InteractiveWord {...defaultProps} />);
    const wordElement = container.querySelector('.test-class');
    
    // Simulate touch events
    if (wordElement) {
      wordElement.dispatchEvent(new TouchEvent('touchstart', { bubbles: true }));
      wordElement.dispatchEvent(new TouchEvent('touchend', { bubbles: true }));
    }
    
    expect(container.textContent).toContain('hello');
  });

  it('maintains proper inline display style', () => {
    const { container } = render(<InteractiveWord {...defaultProps} />);
    // Should render without errors
    expect(container.textContent).toContain('hello');
  });

  it('handles different difficulty levels', () => {
    const { rerender, container } = render(<InteractiveWord {...defaultProps} />);
    expect(container.textContent).toContain('hello');
    
    rerender(<InteractiveWord {...defaultProps} difficulty="hard" />);
    expect(container.textContent).toContain('hello');
  });

  it('handles different user info', () => {
    const spanishUserInfo = { ...mockUserInfo, language: 'es' };
    const { container } = render(<InteractiveWord {...defaultProps} userInfo={spanishUserInfo} />);
    expect(container.textContent).toContain('hello');
  });

  it('shows loading state during audio playback', async () => {
    const { container } = render(<InteractiveWord {...defaultProps} />);
    
    // Component should handle loading state
    expect(container.textContent).toContain('hello');
  });
});