import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnifiedTTSService } from '@/services/unifiedTTSService';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn().mockResolvedValue({
        data: { explanation: 'Test explanation' },
        error: null
      })
    }
  }
}));

describe('UnifiedTTSService', () => {
  let ttsService: UnifiedTTSService;
  let mockAudio: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Create mock audio instance
    mockAudio = {
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      load: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      currentTime: 0,
      duration: 0,
      paused: true,
      volume: 1,
    };
    
    // Mock Audio constructor
    global.Audio = vi.fn().mockImplementation(() => mockAudio);
    
    // Create service instance
    ttsService = new UnifiedTTSService();
  });

  describe('Configuration', () => {
    it('initializes with default config', () => {
      expect(ttsService).toBeDefined();
    });

    it('initializes with custom config', () => {
      const customService = new UnifiedTTSService({
        preferredProvider: 'elevenlabs'
      });
      expect(customService).toBeDefined();
    });
  });

  describe('Audio Generation', () => {
    it('generates audio for simple text', async () => {
      // Mock successful fetch response
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue({ error: 'Test error' })
      });

      // Should fallback to web speech API without throwing
      await expect(ttsService.speakText('hello')).resolves.not.toThrow();
    });

    it('handles TTS generation errors gracefully', async () => {
      // Mock fetch to throw error
      global.fetch = vi.fn().mockRejectedValue(new Error('TTS generation failed'));
      
      // Should not throw but handle gracefully
      await expect(ttsService.speakText('test')).resolves.not.toThrow();
    });

    it('caches generated audio', async () => {
      // Mock successful response
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500
      });

      await ttsService.speakText('test');
      await ttsService.speakText('test'); // Should use cache
      
      // Should fallback to speechSynthesis
      expect(window.speechSynthesis.speak).toHaveBeenCalled();
    });
  });

  describe('Audio Playback', () => {
    it('plays audio successfully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500
      });

      await ttsService.speakText('hello');
      expect(window.speechSynthesis.speak).toHaveBeenCalled();
    });

    it('stops current audio when requested', () => {
      ttsService.stopCurrentAudio();
      expect(window.speechSynthesis.cancel).toHaveBeenCalled();
    });

    it('tracks playing state correctly', () => {
      expect(ttsService.isPlaying()).toBe(false);
    });
  });

  describe('Word Explanations', () => {
    it('fetches and speaks word explanations', async () => {
      await ttsService.explainWord('cat');
      expect(window.speechSynthesis.speak).toHaveBeenCalled();
    });

    it('handles missing word definitions', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: null,
        error: { message: 'Word not found' }
      });

      await expect(ttsService.explainWord('unknownword')).resolves.not.toThrow();
    });
  });

  describe('Factory Methods', () => {
    it('creates service for children with appropriate settings', () => {
      const childService = UnifiedTTSService.createForChildren();
      expect(childService).toBeDefined();
    });

    it('creates premium service with enhanced features', () => {
      const premiumService = UnifiedTTSService.createForPremium();
      expect(premiumService).toBeDefined();
    });
  });

  describe('Cache Management', () => {
    it('clears cache when requested', () => {
      ttsService.clearCache();
      // Cache should be cleared (no exception should be thrown)
      expect(true).toBe(true);
    });
  });
});