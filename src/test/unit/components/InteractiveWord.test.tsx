import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock i18n to avoid needing a real i18next instance
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: any) => k, i18n: { changeLanguage: () => Promise.resolve() } }),
}));

// Mock Supabase client to prevent network calls in unit tests
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: { definition: 'a friendly test definition' }, error: null })
    }
  }
}));

// Mock EnhancedAudioService to avoid AudioContext/mobile audio initialization side effects
vi.mock('@/services/enhancedAudioService', () => {
  class MockEnhancedAudioService {
    speakWord = vi.fn(async () => {});
    speakText = vi.fn(async () => {});
    stop = vi.fn();
    isPlaying = () => false;
  }
  return { EnhancedAudioService: MockEnhancedAudioService };
});

import { InteractiveWord } from '@/components/InteractiveWord';

describe('InteractiveWord Component', () => {
  it('renders the word correctly', () => {
    const { getByText } = render(
      <span>
        <InteractiveWord word="hello" />
      </span>
    );
    expect(getByText(/hello/i)).toBeInTheDocument();
  });

  it('applies the correct CSS classes', () => {
    const { getByText } = render(
      <span>
        <InteractiveWord word="hello" className="text-blue-500" />
      </span>
    );
    expect(getByText(/hello/i)).toHaveClass('text-blue-500');
  });

  it('handles click events', () => {
    const onClick = vi.fn();
    const { getByText } = render(
      <span>
        <InteractiveWord word="hello" onClick={onClick} />
      </span>
    );
    getByText(/hello/i).click();
    expect(onClick).toHaveBeenCalled();
  });

  it('supports mobile touch interactions (no crash)', () => {
    const { getByText } = render(
      <span>
        <InteractiveWord word="hello" />
      </span>
    );
    const el = getByText(/hello/i);
    el.dispatchEvent(new Event('touchstart', { bubbles: true }));
    el.dispatchEvent(new Event('touchend', { bubbles: true }));
    expect(el).toBeInTheDocument();
  });

  it('maintains proper inline display style', () => {
    const { getByText } = render(
      <span data-testid="container">
        <InteractiveWord word="hello" />
      </span>
    );
    const el = getByText(/hello/i);
    expect(getComputedStyle(el).display).toBe('inline');
  });
});
