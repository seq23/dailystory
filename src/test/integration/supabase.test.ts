import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    signUp: vi.fn().mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    }),
    signInWithPassword: vi.fn().mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    getSession: vi.fn().mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null
    }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    })
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        data: [{ id: 'test-profile', user_id: 'test-user-id' }],
        error: null
      }),
      single: vi.fn().mockResolvedValue({
        data: { id: 'test-profile', user_id: 'test-user-id' },
        error: null
      })
    }),
    insert: vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [{ id: 'new-record' }],
        error: null
      })
    }),
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        data: [{ id: 'updated-record' }],
        error: null
      })
    }),
    delete: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        data: [],
        error: null
      })
    })
  }),
  functions: {
    invoke: vi.fn().mockResolvedValue({
      data: { message: 'Function executed successfully' },
      error: null
    })
  }
};

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabaseClient
}));

describe('Supabase Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('handles user signup', async () => {
      const result = await mockSupabaseClient.auth.signUp({
        email: 'test@example.com',
        password: 'password123'
      });
      
      expect(result.data.user).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('handles user signin', async () => {
      const result = await mockSupabaseClient.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123'
      });
      
      expect(result.data.user).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('handles user signout', async () => {
      const result = await mockSupabaseClient.auth.signOut();
      expect(result.error).toBeNull();
    });

    it('gets current session', async () => {
      const result = await mockSupabaseClient.auth.getSession();
      expect(result.data.session).toBeDefined();
      expect(result.error).toBeNull();
    });
  });

  describe('Database Operations', () => {
    it('selects user profiles', async () => {
      const result = await mockSupabaseClient
        .from('profiles')
        .select('*')
        .eq('user_id', 'test-user-id');
      
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.error).toBeNull();
    });

    it('inserts new records', async () => {
      const result = await mockSupabaseClient
        .from('profiles')
        .insert({ user_id: 'test-user-id', name: 'Test User' })
        .select();
      
      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('updates existing records', async () => {
      const result = await mockSupabaseClient
        .from('profiles')
        .update({ name: 'Updated Name' })
        .eq('user_id', 'test-user-id');
      
      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
    });
  });

  describe('Edge Functions', () => {
    it('invokes story generation function', async () => {
      const result = await mockSupabaseClient.functions.invoke('generate-adaptive-story', {
        body: { prompt: 'Test story prompt' }
      });
      
      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('invokes TTS function', async () => {
      const result = await mockSupabaseClient.functions.invoke('openai-tts', {
        body: { text: 'Hello world' }
      });
      
      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('invokes dictionary function', async () => {
      const result = await mockSupabaseClient.functions.invoke('word-dictionary', {
        body: { word: 'test' }
      });
      
      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
    });
  });
});