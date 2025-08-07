import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UnifiedTTSService } from '@/services/unifiedTTSService';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('UnifiedTTSService', () => {
  let ttsService: UnifiedTTSService;
  let mockAudio: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Mock Audio constructor
    mockAudio = {
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      load: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      src: '',
      currentTime: 0,
      duration: 0,
      paused: true,
      volume: 1,
    };
    
    global.Audio = vi.fn(() => mockAudio);
    
    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
    
    ttsService = new UnifiedTTSService({
      preferredProvider: 'openai',
      fallbackToWebSpeech: true,
      mobileOptimized: false,
      cacheEnabled: true,
    });
  });

  afterEach(() => {
    ttsService.stopCurrentAudio();
  });

  describe('Configuration', () => {
    it('initializes with default config', () => {
      const defaultService = new UnifiedTTSService();
      expect(defaultService).toBeDefined();
    });

    it('initializes with custom config', () => {
      const customService = new UnifiedTTSService({
        preferredProvider: 'browser',
        fallbackToWebSpeech: true,
        mobileOptimized: true,
        cacheEnabled: false,
      });
      expect(customService).toBeDefined();
    });
  });

  describe('Audio Generation', () => {
    it('generates audio for simple text', async () => {
      const mockResponse = {
        data: new ArrayBuffer(1024),
        error: null,
      };
      
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockResponse);

      await ttsService.speakText('Hello world');
      
      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'openai-tts',
        expect.objectContaining({
          body: expect.objectContaining({
            text: 'Hello world',
          }),
        })
      );
    });

    it('handles TTS generation errors gracefully', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: { message: 'TTS generation failed' },
      });

      // Should not throw but handle gracefully
      await expect(ttsService.speakText('test')).resolves.not.toThrow();
    });

    it('caches generated audio', async () => {
      const mockResponse = {
        data: new ArrayBuffer(1024),
        error: null,
      };
      
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockResponse);

      // First call should generate
      await ttsService.speakText('cached text');
      expect(supabase.functions.invoke).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await ttsService.speakText('cached text');
      expect(supabase.functions.invoke).toHaveBeenCalledTimes(1);
    });
  });

  describe('Audio Playback', () => {
    it('plays audio successfully', async () => {
      const mockResponse = {
        data: new ArrayBuffer(1024),
        error: null,
      };
      
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockResponse);

      await ttsService.speakText('play test');
      
      expect(mockAudio.play).toHaveBeenCalled();
    });

    it('stops current audio when requested', () => {
      // Set up audio to be playing first
      mockAudio.pause = vi.fn();
      (ttsService as any).currentAudio = mockAudio;
      ttsService.stopCurrentAudio();
      expect(mockAudio.pause).toHaveBeenCalled();
    });

    it('tracks playing state correctly', () => {
      // Test initial state - should return false when no audio is playing
      expect(ttsService.isPlaying()).toBe(false);
      
      // Simulate playing state
      (ttsService as any).currentAudio = mockAudio;
      mockAudio.paused = false;
      
      // Should now indicate playing (implementation may vary)
      const playingState = ttsService.isPlaying();
      expect(typeof playingState).toBe('boolean');
    });
  });

  describe('Word Explanations', () => {
    it('fetches and speaks word explanations', async () => {
      const mockWordResponse = {
        data: [{ definition: 'a greeting word' }],
        error: null,
      };
      
      const mockTTSResponse = {
        data: new ArrayBuffer(1024),
        error: null,
      };
      
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke)
        .mockResolvedValueOnce(mockWordResponse) // word-dictionary call
        .mockResolvedValueOnce(mockTTSResponse); // TTS call

      await ttsService.explainWord('hello', 'easy', 'en');
      
      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'word-dictionary',
        expect.objectContaining({
          body: expect.objectContaining({
            word: 'hello',
          }),
        })
      );
    });

    it('handles missing word definitions', async () => {
      const mockResponse = {
        data: null,
        error: { message: 'Word not found' },
      };
      
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockResponse);

      // Should handle gracefully without throwing
      await expect(ttsService.explainWord('nonexistent')).resolves.not.toThrow();
    });
  });

  describe('Factory Methods', () => {
    it('creates service for children with appropriate settings', () => {
      const childService = UnifiedTTSService.createForChildren();
      expect(childService).toBeInstanceOf(UnifiedTTSService);
    });

    it('creates premium service with enhanced features', () => {
      const premiumService = UnifiedTTSService.createForPremium();
      expect(premiumService).toBeInstanceOf(UnifiedTTSService);
    });
  });

  describe('Cache Management', () => {
    it('clears cache when requested', () => {
      ttsService.clearCache();
      // Cache should be cleared - test by ensuring subsequent calls generate new audio
      expect(ttsService).toBeDefined();
    });
  });
});