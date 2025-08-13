import { vi, describe, it, expect, beforeEach, beforeAll, MockedFunction } from 'vitest';
import { UnifiedTTSService } from '@/services/unifiedTTSService';

// Mock factories for isolated testing
const createMockInvoke = (): MockedFunction<any> => {
  const base64Mp3 = 'SUQzBAAAAAAA';
  return vi.fn(async (fn: string, _args: any) => {
    if (fn === 'openai-tts') return { data: { audioContent: base64Mp3 }, error: null };
    if (fn === 'elevenlabs-tts') return { data: new Uint8Array([1, 2, 3]).buffer, error: null };
    if (fn === 'word-dictionary') return { data: { explanation: 'test explanation' }, error: null };
    return { data: null, error: { message: 'unknown function' } };
  });
};

const createMockSpeechSynthesis = () => {
  let mockSpeaking = false;
  let lastUtterance: any = null;

  return {
    get speaking() { return mockSpeaking; },
    set speaking(value: boolean) { mockSpeaking = value; },
    
    cancel: vi.fn(() => {
      mockSpeaking = false;
      if (lastUtterance?.onend) {
        try { lastUtterance.onend(); } catch {}
      }
      lastUtterance = null;
    }),
    
    speak: vi.fn((utterance: any) => {
      lastUtterance = utterance;
      mockSpeaking = true;
      if (utterance?.onstart) {
        try { utterance.onstart(); } catch {}
      }
      // Synchronous completion for deterministic testing
      setTimeout(() => {
        if (utterance?.onend) {
          try { utterance.onend(); } catch {}
        }
        mockSpeaking = false;
      }, 0);
    }),
    
    getVoices: () => [{ name: 'Test EN', lang: 'en-US' }],
    _reset: () => {
      mockSpeaking = false;
      lastUtterance = null;
    }
  };
};

const createMockAudio = () => {
  return function MockAudio(this: any) {
    this.paused = true;
    this.currentTime = 0;
    this.volume = 1;
    this.preload = 'auto';
    this.onended = null;
    this.onerror = null;
    this._listeners = {} as Record<string, Function[]>;
    
    this.play = vi.fn(() => {
      this.paused = false;
      return Promise.resolve();
    });
    
    this.pause = vi.fn(() => {
      this.paused = true;
      (this._listeners['pause'] || []).forEach((fn: any) => fn());
    });
    
    this.addEventListener = (ev: string, fn: any) => {
      (this._listeners[ev] ||= []).push(fn);
    };
    
    this.removeEventListener = (ev: string, fn: any) => {
      this._listeners[ev] = (this._listeners[ev] || []).filter((f: any) => f !== fn);
    };
  };
};

// Global mocks
let mockInvoke: MockedFunction<any>;
let mockSpeechSynthesis: any;
let mockProcessTextForPronunciation: MockedFunction<any>;

beforeAll(() => {
  // Global URL mock
  vi.stubGlobal('URL', {
    createObjectURL: vi.fn(() => 'blob:mock-url'),
    revokeObjectURL: vi.fn(),
  });

  // Enable debug mode
  (globalThis as any).__TTS_DEBUG__ = true;

  // Setup SpeechSynthesisUtterance
  if (typeof (globalThis as any).SpeechSynthesisUtterance === 'undefined') {
    class MockUtterance {
      text: string;
      rate = 1;
      pitch = 1;
      voice: any = null;
      onstart?: () => void;
      onend?: () => void;
      onerror?: (e?: any) => void;
      constructor(text: string) { this.text = text; }
    }
    (globalThis as any).SpeechSynthesisUtterance = MockUtterance;
    if (typeof window !== 'undefined') {
      (window as any).SpeechSynthesisUtterance = MockUtterance;
    }
  }
});

// Module mocks with isolated factories
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: { 
      get invoke() { return mockInvoke; }
    },
    from: (_table: string) => ({ 
      select: vi.fn().mockResolvedValue({ data: [], error: null }) 
    }),
  },
}));

vi.mock('@/services/contextualPronunciation', () => ({
  contextualPronunciation: {
    get processTextForPronunciation() { return mockProcessTextForPronunciation; }
  },
}));

describe('UnifiedTTSService', () => {
  let tts: UnifiedTTSService;

  beforeEach(() => {
    // Create fresh mock instances for each test
    mockInvoke = createMockInvoke();
    mockSpeechSynthesis = createMockSpeechSynthesis();
    mockProcessTextForPronunciation = vi.fn((text: string) => text);

    // Setup window mocks with fresh instances
    if (typeof window !== 'undefined') {
      (window as any).speechSynthesis = mockSpeechSynthesis;
      (window as any).Audio = createMockAudio();
    }

    // Clear all mocks
    vi.clearAllMocks();

    // Create fresh service instance with testing reset
    tts = new UnifiedTTSService({ 
      mobileOptimized: false, 
      fallbackToWebSpeech: true, 
      cacheEnabled: true 
    });
    
    // Reset all internal state
    (tts as any)._resetForTesting();
  });

  describe('Audio Generation', () => {
    it('generates audio for simple text', async () => {
      await expect(
        tts.speakText('hello', { provider: 'openai', voice: 'nova', speed: 0.8 })
      ).resolves.not.toThrow();
      
      expect(mockInvoke).toHaveBeenCalledWith('openai-tts', expect.objectContaining({
        body: expect.objectContaining({
          text: 'hello',
          voice: 'nova',
          speed: 0.8
        })
      }));
    });

    it('handles TTS generation errors gracefully', async () => {
      mockInvoke.mockImplementationOnce(async () => ({ 
        data: null, 
        error: { message: 'TTS generation failed' } 
      }));

      await expect(tts.speakText('test', { provider: 'openai' })).resolves.not.toThrow();
      expect(mockSpeechSynthesis.speak).toHaveBeenCalled(); // Should fallback
    });

    it('caches generated audio using spy-based verification', async () => {
      const generateAudioSpy = vi.spyOn(tts as any, 'generateAudio');
      const playAudioSpy = vi.spyOn(tts as any, 'playAudio').mockResolvedValue(undefined);
      
      const options = { provider: 'openai' as const, voice: 'nova', speed: 1 };
      
      // First call should generate audio
      await tts.speakText('cache test', options);
      expect(generateAudioSpy).toHaveBeenCalledTimes(1);
      expect(tts.getCacheSize()).toBe(1);
      
      // Second call with same parameters should use cache - verify no additional generation
      await tts.speakText('cache test', options);
      expect(generateAudioSpy).toHaveBeenCalledTimes(1); // Still only 1 call
      expect(tts.getCacheSize()).toBe(1); // Cache size should remain 1
      
      // But playAudio should be called both times
      expect(playAudioSpy).toHaveBeenCalledTimes(2);
      
      generateAudioSpy.mockRestore();
      playAudioSpy.mockRestore();
    });

    it('generates different cache keys for different parameters', async () => {
      const generateAudioSpy = vi.spyOn(tts as any, 'generateAudio');
      const playAudioSpy = vi.spyOn(tts as any, 'playAudio').mockResolvedValue(undefined);
      
      await tts.speakText('same text', { provider: 'openai', voice: 'nova' });
      await tts.speakText('same text', { provider: 'openai', voice: 'alloy' });
      
      expect(generateAudioSpy).toHaveBeenCalledTimes(2); // Different voices = different cache keys
      
      generateAudioSpy.mockRestore();
      playAudioSpy.mockRestore();
    });
  });

  describe('Audio Playback', () => {
    it('plays audio successfully via ElevenLabs', async () => {
      await expect(tts.speakText('play me', { provider: 'elevenlabs' })).resolves.not.toThrow();
      expect(mockInvoke).toHaveBeenCalledWith('elevenlabs-tts', expect.any(Object));
    });

    it('stops current audio when requested', () => {
      const mockAudio = new (window as any).Audio();
      const pauseSpy = vi.spyOn(mockAudio, 'pause');
      
      // Simulate having current audio
      (tts as any).currentAudio = mockAudio;
      
      tts.stopCurrentAudio();
      
      expect(pauseSpy).toHaveBeenCalled();
      expect((tts as any).currentAudio).toBeNull();
    });

    it('tracks playing state correctly with synchronized mocks', () => {
      // Verify initial state
      expect(tts.isPlaying()).toBe(false);
      expect(mockSpeechSynthesis.speaking).toBe(false);
      
      // Simulate speech synthesis playing by setting mock state
      mockSpeechSynthesis.speaking = true;
      expect(tts.isPlaying()).toBe(true);
      
      // Stop audio should reset both service and mock state
      tts.stopCurrentAudio();
      
      // Verify both service and mock state are reset
      expect(mockSpeechSynthesis.speaking).toBe(false);
      expect(tts.isPlaying()).toBe(false);
    });

    it('tracks playing state with audio element', () => {
      const mockAudio = new (window as any).Audio();
      mockAudio.paused = false; // Simulate playing
      
      (tts as any).currentAudio = mockAudio;
      expect(tts.isPlaying()).toBe(true);
      
      mockAudio.paused = true; // Simulate paused
      expect(tts.isPlaying()).toBe(false);
    });
  });

  describe('Word Explanations', () => {
    it('fetches and speaks word explanations', async () => {
      const speakTextSpy = vi.spyOn(tts, 'speakText').mockResolvedValue();
      
      await tts.explainWord('test');
      
      expect(mockInvoke).toHaveBeenCalledWith('word-dictionary', expect.objectContaining({
        body: expect.objectContaining({
          word: 'test',
          userLevel: 'easy',
          userLanguage: 'en'
        })
      }));
      
      expect(speakTextSpy).toHaveBeenCalledWith('test explanation', { speed: 0.8 });
      
      speakTextSpy.mockRestore();
    });

    it('handles missing word definitions with fallback', async () => {
      mockInvoke.mockImplementationOnce(async () => ({ 
        data: { explanation: null }, 
        error: null 
      }));
      
      const speakTextSpy = vi.spyOn(tts, 'speakText').mockResolvedValue();
      
      await expect(tts.explainWord('unknown')).resolves.not.toThrow();
      
      // Should fallback to speaking the word itself
      expect(speakTextSpy).toHaveBeenCalledWith('unknown');
      
      speakTextSpy.mockRestore();
    });

    it('handles word dictionary API errors gracefully', async () => {
      mockInvoke.mockImplementationOnce(async () => ({ 
        data: null, 
        error: { message: 'API error' } 
      }));
      
      const speakTextSpy = vi.spyOn(tts, 'speakText').mockResolvedValue();
      
      await expect(tts.explainWord('error')).resolves.not.toThrow();
      
      // Should fallback to speaking the word
      expect(speakTextSpy).toHaveBeenCalledWith('error');
      
      speakTextSpy.mockRestore();
    });
  });

  describe('Provider Mapping', () => {
    it('maps OpenAI voices correctly', () => {
      const mapToOpenAIVoice = (tts as any).mapToOpenAIVoice.bind(tts);
      
      expect(mapToOpenAIVoice('nova')).toBe('nova');
      expect(mapToOpenAIVoice('invalid')).toBe('nova'); // Default
      expect(mapToOpenAIVoice(undefined, { age: 8, gender: 'girl' })).toBe('nova');
      expect(mapToOpenAIVoice(undefined, { age: 8, gender: 'boy' })).toBe('onyx');
      expect(mapToOpenAIVoice(undefined, { age: 12, gender: 'girl' })).toBe('shimmer');
    });

    it('maps ElevenLabs voices correctly', () => {
      const mapToElevenLabsVoice = (tts as any).mapToElevenLabsVoice.bind(tts);
      
      // Should always return Charlotte voice ID
      expect(mapToElevenLabsVoice('any')).toBe('XB0fDUnXU5powFXDhCwa');
      expect(mapToElevenLabsVoice()).toBe('XB0fDUnXU5powFXDhCwa');
    });
  });

  describe('Factory Methods', () => {
    it('creates service for children with appropriate settings', () => {
      const child = UnifiedTTSService.createForChildren();
      expect(child).toBeInstanceOf(UnifiedTTSService);
      
      const config = (child as any).config;
      expect(config.preferredProvider).toBe('elevenlabs');
      expect(config.fallbackToWebSpeech).toBe(true);
      expect(config.mobileOptimized).toBe(true);
    });

    it('creates premium service with enhanced features', () => {
      const premium = UnifiedTTSService.createForPremium();
      expect(premium).toBeInstanceOf(UnifiedTTSService);
      
      const config = (premium as any).config;
      expect(config.preferredProvider).toBe('elevenlabs');
      expect(config.cacheEnabled).toBe(true);
    });

    it('allows config overrides in factory methods', () => {
      const custom = UnifiedTTSService.createForChildren({ 
        preferredProvider: 'openai',
        cacheEnabled: false 
      });
      
      const config = (custom as any).config;
      expect(config.preferredProvider).toBe('openai');
      expect(config.cacheEnabled).toBe(false);
      expect(config.fallbackToWebSpeech).toBe(true); // Should keep default
    });
  });

  describe('Cache Management', () => {
    it('clears cache and regenerates audio', async () => {
      const generateAudioSpy = vi.spyOn(tts as any, 'generateAudio');
      const playAudioSpy = vi.spyOn(tts as any, 'playAudio').mockResolvedValue(undefined);
      
      const options = { provider: 'openai' as const };
      
      // Generate and cache audio
      await tts.speakText('cache clear test', options);
      expect(generateAudioSpy).toHaveBeenCalledTimes(1);
      expect(tts.getCacheSize()).toBe(1);
      
      // Clear cache
      tts.clearCache();
      expect(tts.getCacheSize()).toBe(0);
      
      // Should regenerate after cache clear
      await tts.speakText('cache clear test', options);
      expect(generateAudioSpy).toHaveBeenCalledTimes(2);
      
      generateAudioSpy.mockRestore();
      playAudioSpy.mockRestore();
    });

    it('revokes object URLs when clearing cache', () => {
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL');
      
      // Manually add cache entry
      (tts as any).audioCache.set('test-key', 'blob:test-url');
      
      tts.clearCache();
      
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:test-url');
      
      revokeObjectURLSpy.mockRestore();
    });
  });

  describe('Fallback Behavior', () => {
    it('falls back to web speech when TTS fails', async () => {
      mockInvoke.mockImplementation(async () => ({ 
        data: null, 
        error: { message: 'TTS failed' } 
      }));
      
      await tts.speakText('fallback test', { provider: 'openai' });
      
      expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
      const utterance = mockSpeechSynthesis.speak.mock.calls[0][0];
      expect(utterance.text).toBe('fallback test');
    });

    it('configures web speech utterance correctly', async () => {
      mockInvoke.mockImplementation(async () => ({ 
        data: null, 
        error: { message: 'TTS failed' } 
      }));
      
      await tts.speakText('speech test', { speed: 1.2 });
      
      expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
      const utterance = mockSpeechSynthesis.speak.mock.calls[0][0];
      expect(utterance.rate).toBe(1.2);
      expect(utterance.pitch).toBe(1.1);
    });

    it('handles web speech unavailable gracefully', async () => {
      // Temporarily remove speechSynthesis
      const originalSpeechSynthesis = (window as any).speechSynthesis;
      delete (window as any).speechSynthesis;
      
      mockInvoke.mockImplementation(async () => ({ 
        data: null, 
        error: { message: 'TTS failed' } 
      }));
      
      await expect(tts.speakText('no speech test')).resolves.not.toThrow();
      
      // Restore
      (window as any).speechSynthesis = originalSpeechSynthesis;
    });
  });

  describe('State Management', () => {
    it('resets internal state correctly with _resetForTesting', () => {
      // Set some internal state
      (tts as any).audioInitialized = true;
      (tts as any).webSpeechSpeaking = true;
      (tts as any).currentAudio = new (window as any).Audio();
      (tts as any).audioCache.set('test', 'blob:test');
      
      // Reset
      (tts as any)._resetForTesting();
      
      expect((tts as any).audioInitialized).toBe(false);
      expect((tts as any).webSpeechSpeaking).toBe(false);
      expect((tts as any).currentAudio).toBeNull();
      expect(tts.getCacheSize()).toBe(0);
    });

    it('synchronizes web speech speaking state properly', () => {
      // Initial state
      expect(tts.isPlaying()).toBe(false);
      expect((tts as any).webSpeechSpeaking).toBe(false);
      
      // Simulate fallback to web speech
      (tts as any).fallbackToWebSpeech('test', {});
      
      // Should update internal tracking
      expect((tts as any).webSpeechSpeaking).toBe(true);
      expect(tts.isPlaying()).toBe(true);
      
      // Stop should reset both
      tts.stopCurrentAudio();
      expect((tts as any).webSpeechSpeaking).toBe(false);
      expect(tts.isPlaying()).toBe(false);
    });
  });
});