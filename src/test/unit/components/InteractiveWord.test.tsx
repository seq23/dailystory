import React from 'react';
import { render } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { InteractiveWord } from '@/components/InteractiveWord';

// Basic mock setup
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => ({ isMobileOrTablet: false, isCapacitor: false, isMobile: false }),
}));

vi.mock('@/utils/gamificationGlobals', () => ({
  getGlobalAddVocabularyWord: () => vi.fn(),
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
    const { container } = render(<InteractiveWord {...defaultProps} />);
    expect(container).toHaveTextContent('test');
  });

  it('applies the correct CSS classes', () => {
    const { container } = render(<InteractiveWord {...defaultProps} />);
    const wordElement = container.querySelector('.interactive-word');
    expect(wordElement).toBeInTheDocument();
  });

  it('handles different difficulty levels', () => {
    const { container, rerender } = render(<InteractiveWord {...defaultProps} difficulty="hard" />);
    expect(container).toHaveTextContent('test');
    
    rerender(<InteractiveWord {...defaultProps} difficulty="beginner" />);
    expect(container).toHaveTextContent('test');
  });

  it('handles premium features', () => {
    const { container } = render(<InteractiveWord {...defaultProps} isPremium={true} />);
    expect(container).toHaveTextContent('test');
  });
});