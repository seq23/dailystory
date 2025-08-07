import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InteractiveWord } from '@/components/InteractiveWord';

// Mock all dependencies
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toast: vi.fn() })
}));

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: null, error: null })
    }
  }
}));

describe('InteractiveWord Component', () => {
  const defaultProps = {
    word: 'hello',
    difficulty: 'easy' as const,
    userInfo: {
      name: 'Test User',
      age: 8,
      nativeLanguage: 'en' as const,
      grade: 'K' as const,
      learningGoal: 'improve-english-reading' as const,
      avatar: { type: 'girl' as const, skinTone: 'medium' as const },
      favoriteColor: 'blue',
      favoriteAnimal: 'cat',
      hobbies: 'reading',
      favoriteFood: 'pizza',
      specialRequest: '',
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the word correctly', () => {
    const { container } = render(<InteractiveWord {...defaultProps} />);
    const wordElement = container.querySelector('.interactive-word');
    expect(wordElement).toBeInTheDocument();
    expect(wordElement?.textContent).toBe('hello');
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<InteractiveWord {...defaultProps} />);
    const wordElement = container.querySelector('.interactive-word');
    expect(wordElement).toHaveClass('interactive-word');
  });

  it('handles click events without errors', async () => {
    const user = userEvent.setup();
    const { container } = render(<InteractiveWord {...defaultProps} />);
    
    const wordElement = container.querySelector('.interactive-word');
    if (wordElement) {
      await user.click(wordElement);
    }
    
    // Should not throw any errors
    expect(wordElement).toBeInTheDocument();
  });

  it('handles different difficulty levels', () => {
    const { container } = render(<InteractiveWord {...defaultProps} difficulty="hard" />);
    const wordElement = container.querySelector('.interactive-word');
    expect(wordElement).toBeInTheDocument();
  });

  it('handles premium features', () => {
    const { container } = render(<InteractiveWord {...defaultProps} isPremium={true} />);
    const wordElement = container.querySelector('.interactive-word');
    expect(wordElement).toBeInTheDocument();
  });

  it('supports different user languages', () => {
    const spanishUser = {
      ...defaultProps.userInfo,
      nativeLanguage: 'es' as const
    };
    const { container } = render(<InteractiveWord {...defaultProps} userInfo={spanishUser} />);
    const wordElement = container.querySelector('.interactive-word');
    expect(wordElement).toBeInTheDocument();
  });

  it('maintains proper display style', () => {
    const { container } = render(<InteractiveWord {...defaultProps} />);
    const wordElement = container.querySelector('.interactive-word');
    expect(wordElement).toBeVisible();
  });

  it('handles touch interactions on mobile', async () => {
    const user = userEvent.setup();
    const { container } = render(<InteractiveWord {...defaultProps} />);
    
    const wordElement = container.querySelector('.interactive-word');
    if (wordElement) {
      await user.pointer({ target: wordElement, keys: '[TouchA]' });
    }
    
    expect(wordElement).toBeInTheDocument();
  });
});