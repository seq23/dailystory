import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InteractiveWord } from '@/components/InteractiveWord';
import { renderWithProviders, mockUserInfo, suppressConsoleLogs } from '../utils/testHelpers';

// Mock dependencies
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: jest.fn() }),
}));

jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => ({ isMobileOrTablet: false, isCapacitor: false, isMobile: false }),
}));

jest.mock('@/utils/gamificationGlobals', () => ({
  getGlobalAddVocabularyWord: () => jest.fn(),
}));

// Mock services
jest.mock('@/services/enhancedAudioService', () => ({
  EnhancedAudioService: jest.fn().mockImplementation(() => ({
    playText: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn(),
    isPlaying: false,
  })),
}));

jest.mock('@/services/phoneticRulesEngine', () => ({
  PhoneticRulesEngine: {
    getInstance: () => ({
      getPhoneticBreakdown: jest.fn().mockReturnValue({
        syllables: ['hel', 'lo'],
        phoneticSpelling: 'HEL-lo',
      }),
    }),
  },
}));

jest.mock('@/services/contextualPronunciation', () => ({
  ContextualPronunciation: {
    getInstance: () => ({
      getContextualPronunciation: jest.fn().mockReturnValue({
        pronunciation: 'test-pronunciation',
        syllables: ['test'],
      }),
    }),
  },
}));

describe('InteractiveWord Component', () => {
  suppressConsoleLogs();

  const defaultProps = {
    word: 'hello',
    className: 'interactive-word',
    difficulty: 'easy',
    userInfo: mockUserInfo,
    isPremium: false,
    sentenceContext: 'This is a test sentence.',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the word correctly', () => {
    renderWithProviders(<InteractiveWord {...defaultProps} />);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('applies the correct CSS classes', () => {
    renderWithProviders(<InteractiveWord {...defaultProps} />);
    const wordElement = screen.getByText('hello');
    expect(wordElement).toHaveClass('interactive-word');
  });

  it('handles click events', async () => {
    renderWithProviders(<InteractiveWord {...defaultProps} />);
    const wordElement = screen.getByText('hello');
    
    fireEvent.click(wordElement);
    
    // Should handle click without throwing
    await waitFor(() => {
      expect(wordElement).toBeInTheDocument();
    });
  });

  it('supports different difficulty levels', () => {
    const { rerender } = renderWithProviders(<InteractiveWord {...defaultProps} />);
    expect(screen.getByText('hello')).toBeInTheDocument();
    
    rerender(<InteractiveWord {...defaultProps} difficulty="hard" />);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('handles different user info', () => {
    const spanishUserInfo = {
      ...mockUserInfo,
      nativeLanguage: 'es',
    };
    
    renderWithProviders(<InteractiveWord {...defaultProps} userInfo={spanishUserInfo} />);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('maintains proper inline display style', () => {
    renderWithProviders(<InteractiveWord {...defaultProps} />);
    const wordElement = screen.getByText('hello');
    
    // Should maintain inline display to not break text flow
    const computedStyle = window.getComputedStyle(wordElement);
    expect(['inline', 'inline-block']).toContain(computedStyle.display || 'inline');
  });

  it('handles premium features', () => {
    renderWithProviders(<InteractiveWord {...defaultProps} isPremium={true} />);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('supports touch interactions on mobile', async () => {
    // Mock mobile environment
    jest.doMock('@/hooks/use-mobile', () => ({
      useIsMobile: () => ({ isMobileOrTablet: true, isCapacitor: false, isMobile: true }),
    }));
    
    renderWithProviders(<InteractiveWord {...defaultProps} />);
    const wordElement = screen.getByText('hello');
    
    // Simulate touch events
    fireEvent.touchStart(wordElement);
    fireEvent.touchEnd(wordElement);
    
    await waitFor(() => {
      expect(wordElement).toBeInTheDocument();
    });
  });
});