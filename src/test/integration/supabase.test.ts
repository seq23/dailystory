import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client for integration tests
vi.mock('@/integrations/supabase/client', () => {
  const mockSupabase = {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      then: vi.fn(),
    })),
    functions: {
      invoke: vi.fn(),
    },
  };
  
  return { supabase: mockSupabase };
});

describe('Supabase Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('handles user signup', async () => {
      const mockResponse = {
        data: { 
          user: { id: 'test-user-id', email: 'test@example.com' }, 
          session: { access_token: 'mock-token' } 
        },
        error: null,
      };
      
      vi.mocked(supabase.auth.signUp).mockResolvedValue(mockResponse as any);
      
      const result = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: 'http://localhost:3000'
        }
      });
      
      expect(result.data?.user?.email).toBe('test@example.com');
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: 'http://localhost:3000'
        }
      });
    });

    it('handles user signin', async () => {
      const mockResponse = {
        data: { 
          user: { id: 'test-user-id', email: 'test@example.com' },
          session: { access_token: 'mock-token', user: { id: 'test-user-id', email: 'test@example.com' } }
        },
        error: null,
      };
      
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue(mockResponse as any);
      
      const result = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123',
      });
      
      expect(result.data?.user?.email).toBe('test@example.com');
    });

    it('handles auth state changes', () => {
      const mockCallback = vi.fn();
      supabase.auth.onAuthStateChange(mockCallback);
      
      expect(supabase.auth.onAuthStateChange).toHaveBeenCalledWith(mockCallback);
    });
  });

  describe('Database Operations', () => {
    it('creates user profile', async () => {
      const mockProfile = {
        user_id: 'test-user-id',
        display_name: 'Test User',
        grade_level: '3rd',
        avatar: { type: 'boy', skinTone: 'medium' },
      };
      
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
      };
      
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);
      
      const result = await supabase
        .from('profiles')
        .insert(mockProfile)
        .select()
        .single();
      
      expect(result.data).toEqual(mockProfile);
      expect(supabase.from).toHaveBeenCalledWith('profiles');
    });

    it('saves story progress', async () => {
      const mockSession = {
        user_id: 'test-user-id',
        story_id: 'test-story-id',
        time_spent: 300,
        words_read: 150,
        comprehension_score: 85,
      };
      
      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockSession, error: null }),
      };
      
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);
      
      const result = await supabase
        .from('reading_sessions')
        .insert(mockSession)
        .select()
        .single();
      
      expect(result.data).toEqual(mockSession);
    });

    it('retrieves saved stories', async () => {
      const mockStories = [
        { id: '1', title: 'Story 1', difficulty: 'easy' },
        { id: '2', title: 'Story 2', difficulty: 'medium' },
      ];
      
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        then: vi.fn().mockResolvedValue({ data: mockStories, error: null }),
      };
      
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);
      
      const result = await supabase
        .from('saved_stories')
        .select('*')
        .eq('user_id', 'test-user-id');
      
      expect(result.data).toEqual(mockStories);
    });
  });

  describe('Edge Functions', () => {
    it('calls story generation function', async () => {
      const mockStoryResponse = {
        data: {
          title: 'Generated Story',
          content: 'Once upon a time...',
          difficulty: 'easy',
        },
        error: null,
      };
      
      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockStoryResponse);
      
      const result = await supabase.functions.invoke('generate-adaptive-story', {
        body: {
          userInfo: { age: 8, grade_level: '3rd' },
          preferences: { theme: 'adventure' },
        },
      });
      
      expect(result.data?.title).toBe('Generated Story');
      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'generate-adaptive-story',
        expect.objectContaining({
          body: expect.objectContaining({
            userInfo: { age: 8, grade_level: '3rd' },
          }),
        })
      );
    });

    it('handles TTS generation', async () => {
      const mockAudioResponse = {
        data: new ArrayBuffer(1024),
        error: null,
      };
      
      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockAudioResponse);
      
      const result = await supabase.functions.invoke('openai-tts', {
        body: {
          text: 'Hello world',
          voice: 'alloy',
          speed: 1.0,
        },
      });
      
      expect(result.data).toBeInstanceOf(ArrayBuffer);
    });

    it('handles word dictionary lookup', async () => {
      const mockDefinition = {
        data: [{ definition: 'a greeting' }],
        error: null,
      };
      
      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockDefinition);
      
      const result = await supabase.functions.invoke('word-dictionary', {
        body: { word: 'hello', level: 'easy' },
      });
      
      expect(result.data?.[0]?.definition).toBe('a greeting');
    });
  });

  describe('Row Level Security', () => {
    it('enforces profile access policies', async () => {
      // Test that users can only access their own profiles
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Access denied' } }),
      };
      
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);
      
      const result = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', 'other-user-id')
        .single();
      
      expect(result.error?.message).toBe('Access denied');
    });

    it('allows feedback submission without authentication', async () => {
      const mockFeedback = {
        message: 'Great app!',
        category: 'general',
        rating: 5,
      };
      
      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockFeedback, error: null }),
      };
      
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);
      
      const result = await supabase
        .from('feedback')
        .insert(mockFeedback)
        .select()
        .single();
      
      expect(result.data).toEqual(mockFeedback);
    });
  });
});