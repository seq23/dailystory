import { describe, expect, it, vi } from 'vitest';
import { AudioSyncService } from '@/services/audioSyncService';

const mockPlayParams = {
  text: 'Test content that will be aborted',
  voice: 'XB0fDUnXU5powFXDhCwa',
  model: 'eleven_turbo_v2',
  speed: 1,
};

describe('AudioSyncService session guards', () => {
  it('aborts in-flight TTS request on stopAudio without throwing', async () => {
    const svc = new AudioSyncService();

    const originalFetch = global.fetch as any;
    // Mock fetch that rejects on abort
    global.fetch = vi.fn((url: string, init?: any) => {
      return new Promise((_resolve, reject) => {
        const signal: AbortSignal | undefined = init?.signal;
        if (signal) {
          const onAbort = () => {
            signal.removeEventListener('abort', onAbort);
            reject({ name: 'AbortError', message: 'aborted' });
          };
          signal.addEventListener('abort', onAbort);
        }
        // Never resolve; we rely on abort
      });
    }) as any;

    const playPromise = svc.playText({
      ...mockPlayParams,
      onWordHighlight: () => {},
    } as any);

    // Immediately stop to trigger abort
    svc.stopAudio();

    await expect(playPromise).resolves.toBeUndefined();
    const st = svc.getPlaybackStatus();
    expect(st.isPlaying).toBe(false);

    global.fetch = originalFetch;
  });
});
