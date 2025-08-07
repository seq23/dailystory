import React from 'react';
import { render } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { InteractiveWord } from '@/components/InteractiveWord';

// Comprehensive mocking for all dependencies
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => ({ 
    isMobileOrTablet: false, 
    isCapacitor: false, 
    isMobile: false 
  }),
}));

vi.mock('@/utils/gamificationGlobals', () => ({
  getGlobalAddVocabularyWord: () => vi.fn(),
}));

vi.mock('@/services/unifiedTTSService', () => ({
  UnifiedTTSService: vi.fn().mockImplementation(() => ({
    speakText: vi.fn().mockResolvedValue(undefined),
    stopCurrentAudio: vi.fn(),
    isPlaying: vi.fn().mockReturnValue(false),
  })),
}));

vi.mock('@/services/enhancedAudioService', () => ({
  EnhancedAudioService: vi.fn().mockImplementation(() => ({
    speak: vi.fn().mockResolvedValue(undefined),
    stopAudio: vi.fn(),
    isPlaying: vi.fn().mockReturnValue(false),
  })),
}));

vi.mock('@/services/phoneticRulesEngine', () => ({
  PhoneticRulesEngine: {
    getInstance: () => ({
      breakIntoSyllables: vi.fn().mockReturnValue(['test']),
    }),
  },
}));

vi.mock('@/services/contextualPronunciation', () => ({
  contextualPronunciation: {
    getPhoneticSpelling: vi.fn().mockReturnValue('test'),
  },
}));

vi.mock('@/utils/vocabularyLevelClassifier', () => ({
  VocabularyLevelClassifier: {
    getWordDifficulty: vi.fn().mockReturnValue({
      level: 1,
      shouldHighlight: true,
      complexity: 'beginner',
    }),
  },
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: { 
      invoke: vi.fn().mockResolvedValue({ data: null, error: null }) 
    },
  },
}));

describe('InteractiveWord Component', () => {
  const defaultProps = {
    word: 'test',
    className: 'interactive-word',
    difficulty: 'easy' as const,
    userInfo: { 
      name: 'Test User', 
      age: 10, 
      nativeLanguage: 'en' as const,
      grade: 'K' as const,
      learningGoal: 'improve-english-reading' as const,
      avatar: { type: 'girl' as const, skinTone: 'medium' as const },
      favoriteColor: 'blue',
      favoriteAnimal: 'cat',
      hobbies: 'reading',
      favoriteFood: 'pizza',
      specialRequest: ''
    },
    isPremium: false,
    sentenceContext: 'This is a test sentence.',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the word correctly', () => {
    const { getByText } = render(<InteractiveWord {...defaultProps} />);
    expect(getByText('test')).toBeInTheDocument();
  });

  it('applies CSS classes correctly', () => {
    const { container } = render(<InteractiveWord {...defaultProps} />);
    const wordElement = container.querySelector('span');
    expect(wordElement).toBeInTheDocument();
    expect(wordElement).toHaveClass('interactive-word');
  });

  it('handles click events without errors', () => {
    const { getByText } = render(<InteractiveWord {...defaultProps} />);
    const wordElement = getByText('test');
    
    // Click should not throw errors
    expect(() => {
      wordElement.click();
    }).not.toThrow();
  });

  it('handles different difficulty levels', () => {
    const { getByText } = render(<InteractiveWord {...defaultProps} difficulty="hard" />);
    expect(getByText('test')).toBeInTheDocument();
  });

  it('handles premium features', () => {
    const { getByText } = render(<InteractiveWord {...defaultProps} isPremium={true} />);
    expect(getByText('test')).toBeInTheDocument();
  });

  it('handles different user languages', () => {
    const spanishUserInfo = { ...defaultProps.userInfo, nativeLanguage: 'es' as const };
    const { getByText } = render(<InteractiveWord {...defaultProps} userInfo={spanishUserInfo} />);
    expect(getByText('test')).toBeInTheDocument();
  });

  it('supports touch interactions on mobile', () => {
    const { getByText } = render(<InteractiveWord {...defaultProps} />);
    const wordElement = getByText('test');
    
    // Touch events should not throw errors
    expect(() => {
      wordElement.dispatchEvent(new TouchEvent('touchstart'));
      wordElement.dispatchEvent(new TouchEvent('touchend'));
    }).not.toThrow();
  });

  it('maintains proper display style', () => {
    const { container } = render(<InteractiveWord {...defaultProps} />);
    const wordElement = container.querySelector('span');
    expect(wordElement).toBeInTheDocument();
  });
});