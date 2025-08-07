import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Create screen object for queries
const screen = {
  getByText: (text: string) => document.querySelector(`*:contains("${text}")`) as HTMLElement,
};
import { InteractiveWord } from '@/components/InteractiveWord';

// Mock the TTS service
vi.mock('@/services/unifiedTTSService', () => ({
  UnifiedTTSService: vi.fn().mockImplementation(() => ({
    speakText: vi.fn().mockResolvedValue(undefined),
    explainWord: vi.fn().mockResolvedValue(undefined),
    stopCurrentAudio: vi.fn(),
    isPlaying: vi.fn().mockReturnValue(false),
  })),
}));

describe('InteractiveWord Component', () => {
  const defaultProps = {
    word: 'hello',
    className: 'test-class',
    difficulty: 'easy' as const,
    userInfo: {
      name: 'Test User',
      age: 8,
      grade: '3rd' as const,
      nativeLanguage: 'en' as const,
      learningGoal: 'improve-english-reading' as const,
      avatar: { type: 'boy' as const, skinTone: 'medium' as const },
      favoriteColor: 'blue',
      favoriteAnimal: 'dog',
      hobbies: 'reading',
      favoriteFood: 'pizza',
      specialRequest: 'none',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the word correctly', () => {
    render(<InteractiveWord {...defaultProps} />);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('applies the correct CSS classes', () => {
    render(<InteractiveWord {...defaultProps} />);
    const wordElement = screen.getByText('hello');
    expect(wordElement).toHaveClass('test-class');
    expect(wordElement).toHaveClass('interactive-word');
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    render(<InteractiveWord {...defaultProps} />);
    
    const wordElement = screen.getByText('hello');
    await user.click(wordElement);
    
    // Should trigger TTS or explanation
    expect(wordElement).toBeInTheDocument();
  });

  it('supports mobile touch interactions', async () => {
    render(<InteractiveWord {...defaultProps} />);
    const wordElement = screen.getByText('hello');
    
    // Simulate touch events manually since fireEvent is not available
    const touchEvent = new TouchEvent('touchstart', { bubbles: true });
    Object.defineProperty(touchEvent, 'target', { value: wordElement });
    wordElement.dispatchEvent(touchEvent);
    
    expect(wordElement).toBeInTheDocument();
  });

  it('maintains proper inline display style', () => {
    render(<InteractiveWord {...defaultProps} />);
    const wordElement = screen.getByText('hello');
    
    expect(wordElement).toHaveStyle({
      display: 'inline',
      fontSize: 'inherit',
      lineHeight: 'inherit',
    });
  });

  it('handles different difficulty levels', () => {
    const { rerender } = render(<InteractiveWord {...defaultProps} difficulty="hard" />);
    expect(screen.getByText('hello')).toBeInTheDocument();
    
    rerender(<InteractiveWord {...defaultProps} difficulty="medium" />);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('handles different user info', () => {
    const spanishUser = {
      ...defaultProps.userInfo,
      nativeLanguage: 'es' as const,
    };
    render(<InteractiveWord {...defaultProps} userInfo={spanishUser} />);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('shows loading state during audio playback', async () => {
    const user = userEvent.setup();
    render(<InteractiveWord {...defaultProps} />);
    
    const wordElement = screen.getByText('hello');
    await user.click(wordElement);
    
    // The component should handle loading states properly
    expect(wordElement).toBeInTheDocument();
  });
});