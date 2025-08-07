import { vi } from 'vitest';

// Integration test setup
// Mock environment variables for testing
vi.mock('../../integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ 
        data: { subscription: { unsubscribe: vi.fn() } }
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      })
    })
  }
}));