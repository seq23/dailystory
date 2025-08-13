import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock Supabase client to prevent network calls in unit tests
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: { definition: 'a friendly test definition' }, error: null })
    }
  }
}));

import { InteractiveWord } from '@/components/InteractiveWord';

describe('InteractiveWord Component', () => {
  it('renders the word', () => {
    const { getByText } = render(<span><InteractiveWord word="hello" /></span>);
    expect(getByText(/hello/i)).toBeInTheDocument();
  });

  it('applies custom class', () => {
    const { getByText } = render(<span><InteractiveWord word="hello" className="text-blue-500" /></span>);
    expect(getByText(/hello/i)).toHaveClass('text-blue-500');
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    const { getByText } = render(<span><InteractiveWord word="hello" onClick={onClick} /></span>);
    getByText(/hello/i).click();
    expect(onClick).toHaveBeenCalled();
  });

  it('is inline', () => {
    const { getByText } = render(<span data-testid="container"><InteractiveWord word="hello" /></span>);
    const el = getByText(/hello/i);
    expect(getComputedStyle(el).display).toBe('inline');
  });
});

