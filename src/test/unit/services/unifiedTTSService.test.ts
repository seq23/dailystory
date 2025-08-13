import { vi, describe, it, expect, beforeEach, beforeAll } from 'vitest';

// Suite-local polyfill for URL.createObjectURL/revokeObjectURL
(() => {
  if (!(globalThis as any).URL) {
    (globalThis as any).URL = {} as any;
  }
  if (typeof (globalThis as any).URL.createObjectURL !== 'function') {
    (globalThis as any).URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  }
  if (typeof (globalThis as any).URL.revokeObjectURL !== 'function') {
    (globalThis as any).URL.revokeObjectURL = vi.fn();
  }
})();

// Hoist mocks BEFORE importing the module under test
const hoisted = vi.hoisted(() => {
  const base64Mp3 = 'SUQzBAAAAAAA';
  const mockInvoke = vi.fn(async (fn: string, _args: any) => {
    if (fn === 'openai-tts') return { data: { audioContent: base64Mp3 }, error: null } as any;
    if (fn === 'elevenlabs-tts') return { data: new Uint8Array([1, 2, 3]).buffer, error: null } as any;
    if (fn === 'word-dictionary') return { data: { explanation: 'test explanation' }, error: null } as any;
    return { data: null, error: { message: 'unknown function' } } as any;
  });
  return { base64Mp3, mockInvoke };
});

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: { invoke: hoisted.mockInvoke as any },
    from: (_table: string) => ({ select: vi.fn().mockResolvedValue({ data: [], error: null }) }),
  },
}));

// Import after mocks
import { UnifiedTTSService } from '@/services/unifiedTTSService';

// Local safety polyfills (robust)
beforeAll(() => {
  // Speech synthesis
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
    ;(globalThis as any).SpeechSynthesisUtterance = MockUtterance as any;
    if (typeof window !== 'undefined') {
      (window as any).SpeechSynthesisUtterance = MockUtterance as any;
    }
  }
  if (typeof window !== 'undefined' && !(window as any).speechSynthesis) {
    const synth: any = {
      speaking: false,
      _lastUtterance: null as any,
      cancel: vi.fn(function (this: any) {
        this.speaking = false;
        if (this._lastUtterance && this._lastUtterance.onend) {
          try { this._lastUtterance.onend(); } catch {}
        }
        this._lastUtterance = null;
      }),
      speak: vi.fn(function (this: any, utterance?: any) {
        this._lastUtterance = utterance;
        this.speaking = true;
        try { utterance?.onstart?.(); } catch {}
        queueMicrotask(() => {
          try { utterance?.onend?.(); } catch {}
          this.speaking = false;
        });
      }),
      getVoices: () => [{ name: 'Test EN', lang: 'en-US' }],
    };
    (window as any).speechSynthesis = synth as any;
  }
  // Audio API
  if (typeof window !== 'undefined' && !(window as any).Audio) {
    (window as any).Audio = function (this: any) {
      this.paused = true;
      this.currentTime = 0;
      this.volume = 1;
      this._listeners = {} as Record<string, Function[]>;
      this.play = vi.fn(() => { this.paused = false; return Promise.resolve(); });
      this.pause = vi.fn(() => { this.paused = true; (this._listeners['pause'] || []).forEach((fn: any) => fn()); });
      this.addEventListener = (ev: string, fn: any) => { (this._listeners[ev] ||= []).push(fn); };
      this.removeEventListener = (ev: string, fn: any) => { this._listeners[ev] = (this._listeners[ev] || []).filter((f: any) => f !== fn); };
    } as any;
  }
});

describe('UnifiedTTSService', () => {
  let tts: UnifiedTTSService;

  beforeEach(() => {
    hoisted.mockInvoke.mockClear();
    tts = new UnifiedTTSService({ mobileOptimized: false, fallbackToWebSpeech: true, cacheEnabled: true });
  });

  describe('Audio Generation', () => {
    it('generates audio for simple text', async () => {
      await expect(tts.speakText('hello', { provider: 'openai', voice: 'nova', speed: 0.8 })).resolves.not.toThrow();
      expect(hoisted.mockInvoke).toHaveBeenCalledWith('openai-tts', expect.any(Object));
    });

    it('handles TTS generation errors gracefully', async () => {
      hoisted.mockInvoke.mockImplementationOnce(async () => ({ data: null, error: { message: 'TTS generation failed' } }));
      await expect(tts.speakText('test', { provider: 'openai' })).resolves.not.toThrow();
    });

    it('caches generated audio', async () => {
      const opts = { provider: 'openai' as const, voice: 'nova', speed: 1 };
      await tts.speakText('cache me', opts);
      const calls = hoisted.mockInvoke.mock.calls.length;
      await tts.speakText('cache me', opts);
      expect(hoisted.mockInvoke.mock.calls.length).toBe(calls);
    });
  });

  describe('Audio Playback', () => {
    it('plays audio successfully via ElevenLabs', async () => {
      await expect(tts.speakText('play me', { provider: 'elevenlabs' })).resolves.not.toThrow();
    });

    it('stops current audio when requested', () => {
      const audio = new (window as any).Audio();
      const pauseSpy = vi.spyOn(audio, 'pause');
      ;(tts as any).currentAudio = audio;
      tts.stopCurrentAudio();
      expect(pauseSpy).toHaveBeenCalled();
    });

    it('tracks playing state correctly', async () => {
      expect(!!tts.isPlaying()).toBe(false);
      (window as any).speechSynthesis.speaking = true;
      expect(tts.isPlaying()).toBe(true);
      (window as any).speechSynthesis.cancel();
      await new Promise((r) => setTimeout(r, 0));
      expect(tts.isPlaying()).toBe(false);
    });
  });

  describe('Word Explanations', () => {
    it('fetches and speaks word explanations', async () => {
      await expect(tts.explainWord('test')).resolves.not.toThrow();
    });

    it('handles missing word definitions', async () => {
      hoisted.mockInvoke.mockImplementationOnce(async () => ({ data: { explanation: null }, error: null }));
      await expect(tts.explainWord('unknown')).resolves.not.toThrow();
    });
  });

  describe('Factory Methods', () => {
    it('creates service for children with appropriate settings', () => {
      const child = UnifiedTTSService.createForChildren();
      expect(child).toBeInstanceOf(UnifiedTTSService);
    });

    it('creates premium service with enhanced features', () => {
      const premium = UnifiedTTSService.createForPremium();
      expect(premium).toBeInstanceOf(UnifiedTTSService);
    });
  });

  describe('Cache Management', () => {
    it('clears cache when requested', async () => {
      await tts.speakText('cache clear', { provider: 'openai' });
      tts.clearCache();
      await tts.speakText('cache clear', { provider: 'openai' });
      expect(hoisted.mockInvoke).toHaveBeenCalledWith('openai-tts', expect.any(Object));
    });
  });
});
