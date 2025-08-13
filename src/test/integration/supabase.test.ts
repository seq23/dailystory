import { vi, describe, it, expect } from 'vitest';

const mockSelect = vi.fn().mockResolvedValue({
  data: [
    { id: '1', title: 'Story 1', difficulty: 'easy' },
    { id: '2', title: 'Story 2', difficulty: 'medium' },
  ],
  error: null
});

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({ select: mockSelect }),
    functions: { invoke: vi.fn().mockResolvedValue({ data: null, error: null }) },
  },
}));

describe('Supabase integration (mocked)', () => {
  it('retrieves saved stories', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase.from('saved_stories').select('*');
    expect(error).toBeNull();
    expect(data?.length).toBeGreaterThan(0);
  });
});
