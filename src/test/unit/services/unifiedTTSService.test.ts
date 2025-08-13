import { vi, describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { UnifiedTTSService } from '@/services/unifiedTTSService';

const base64Mp3 = 'SUQzBAAAAAAA'; // tiny placeholder for base64 mp3

const mockInvoke = vi.fn(async (fn: string, _args: any) => {
  if (fn === 'openai-tts') return { data: { audioContent: base64Mp3 }, error: null };
  if (fn === 'elevenlabs-tts') return { data: new Uint8Array([1, 2, 3]).buffer, error: null };
  if (fn === 'word-dictionary') return { data: { explanation: 'test explanation' }, error: null };
  return { data: null, error: { message: 'unknown function' } };
});

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: { invoke: mockInvoke as any }
  }
}));

// Local safety polyfills (in case global setup isn't applied)
beforeAll(() => {
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
    mockInvoke.mockClear();
    tts = new UnifiedTTSService({ mobileOptimized: false, fallbackToWebSpeech: true, cacheEnabled: true });
  });

  it('generates audio via OpenAI', async () => {
    await tts.speakText('hello', { provider: 'openai', voice: 'nova', speed: 0.8 });
    expect(mockInvoke).toHaveBeenCalledWith('openai-tts', expect.any(Object));
  });

  it('handles generation error gracefully', async () => {
    mockInvoke.mockImplementationOnce(async () => ({ data: null, error: { message: 'TTS generation failed' } }));
    await expect(tts.speakText('test', { provider: 'openai' })).resolves.not.toThrow();
  });

  it('caches generated audio', async () => {
    await tts.speakText('cache me', { provider: 'openai' });
    const callCount = mockInvoke.mock.calls.length;
    await tts.speakText('cache me', { provider: 'openai' });
    expect(mockInvoke.mock.calls.length).toBe(callCount);
  });

  it('plays audio via ElevenLabs', async () => {
    await expect(tts.speakText('play me', { provider: 'elevenlabs' })).resolves.not.toThrow();
  });

  it('stopCurrentAudio pauses audio', () => {
    const audio = new (window as any).Audio();
    const pauseSpy = vi.spyOn(audio, 'pause');
    (tts as any).currentAudio = audio;
    tts.stopCurrentAudio();
    expect(pauseSpy).toHaveBeenCalled();
  });

  it('isPlaying tracks web speech', () => {
    expect(tts.isPlaying()).toBe(false);
    const utter = new (globalThis as any).SpeechSynthesisUtterance('hi');
    window.speechSynthesis.speak(utter);
    expect(tts.isPlaying()).toBe(true);
    window.speechSynthesis.cancel();
    expect(tts.isPlaying()).toBe(false);
  });
});
