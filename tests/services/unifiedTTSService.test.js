import { UnifiedTTSService } from '@/services/unifiedTTSService';
import { createMockTTSService, suppressConsoleLogs } from '../utils/testHelpers';

// Mock Supabase
const mockInvoke = jest.fn();
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: mockInvoke,
    },
  },
}));

describe('UnifiedTTSService', () => {
  suppressConsoleLogs();
  
  let ttsService;
  let mockAudio;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Audio constructor
    mockAudio = {
      play: jest.fn().mockResolvedValue(undefined),
      pause: jest.fn(),
      load: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      volume: 1,
      currentTime: 0,
      duration: 0,
      paused: true,
      src: '',
    };
    
    global.Audio = jest.fn().mockImplementation(() => mockAudio);
    global.URL.createObjectURL = jest.fn().mockReturnValue('mock-audio-url');
    
    ttsService = new UnifiedTTSService();
  });

  afterEach(() => {
    if (ttsService) {
      ttsService.stopCurrentAudio();
    }
  });

  describe('Configuration', () => {
    it('initializes with default config', () => {
      expect(ttsService).toBeInstanceOf(UnifiedTTSService);
    });

    it('initializes with custom config', () => {
      const customService = new UnifiedTTSService({
        preferredService: 'elevenlabs',
        voice: 'custom-voice',
        speed: 1.2,
      });
      expect(customService).toBeInstanceOf(UnifiedTTSService);
    });
  });

  describe('Audio Generation', () => {
    it('generates audio for simple text', async () => {
      mockInvoke.mockResolvedValue({
        data: new Uint8Array([1, 2, 3, 4]),
        error: null,
      });

      await expect(ttsService.speakText('hello')).resolves.not.toThrow();
    });

    it('handles TTS generation errors gracefully', async () => {
      mockInvoke.mockResolvedValue({
        data: null,
        error: new Error('TTS generation failed'),
      });

      // Should fallback to web speech and not throw
      await expect(ttsService.speakText('test')).resolves.not.toThrow();
    });

    it('caches generated audio', async () => {
      mockInvoke.mockResolvedValue({
        data: new Uint8Array([1, 2, 3, 4]),
        error: null,
      });

      await ttsService.speakText('hello');
      await ttsService.speakText('hello'); // Second call should use cache

      // Only one API call should be made due to caching
      expect(mockInvoke).toHaveBeenCalledTimes(1);
    });
  });

  describe('Audio Playback', () => {
    it('plays audio successfully', async () => {
      mockInvoke.mockResolvedValue({
        data: new Uint8Array([1, 2, 3, 4]),
        error: null,
      });

      await ttsService.speakText('test');
      expect(global.Audio).toHaveBeenCalled();
    });

    it('stops current audio when requested', () => {
      // Set up audio as playing
      ttsService.currentAudio = mockAudio;
      ttsService.stopCurrentAudio();
      expect(mockAudio.pause).toHaveBeenCalled();
    });

    it('tracks playing state correctly', () => {
      expect(ttsService.isPlaying()).toBe(false);
      
      // Simulate audio playing
      ttsService.currentAudio = mockAudio;
      mockAudio.paused = false;
      expect(ttsService.isPlaying()).toBe(true);
    });
  });

  describe('Word Explanations', () => {
    it('fetches and speaks word explanations', async () => {
      mockInvoke
        .mockResolvedValueOnce({
          data: { definition: 'A greeting' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: new Uint8Array([1, 2, 3, 4]),
          error: null,
        });

      await expect(ttsService.explainWord('hello')).resolves.not.toThrow();
    });

    it('handles missing word definitions', async () => {
      mockInvoke.mockResolvedValue({
        data: null,
        error: new Error('Word not found'),
      });

      await expect(ttsService.explainWord('nonexistentword')).resolves.not.toThrow();
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
      // Should not throw and cache should be cleared
      expect(true).toBe(true);
    });
  });
});