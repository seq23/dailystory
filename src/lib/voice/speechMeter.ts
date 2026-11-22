/**
 * Was anything said into the microphone? A level meter on the live stream, shared by
 * the story voice commands (VoiceCommandController) and read-aloud practice
 * (ReadAloudCoach), so a clip with no speech is never sent to speech-to-text
 * (Whisper invents words for silence, and each clip is a paid call).
 *
 * heard: false until the level passes SPEECH_LEVEL, then true; null when this
 * browser has no level meter, so the caller cannot tell and sends the clip.
 */

export const SPEECH_LEVEL = 0.06;

export interface SpeechMeter {
  readonly heard: boolean | null;
  stop(): void;
}

export function startSpeechMeter(
  stream: MediaStream,
  opts: { quietAfterSpeechMs?: number; onQuietAfterSpeech?: () => void } = {},
): SpeechMeter {
  const state = { heard: null as boolean | null, quietSince: null as number | null, stopped: false };
  let ctx: AudioContext | null = null;
  let raf: number | null = null;
  const stop = () => {
    state.stopped = true;
    if (raf != null) { try { cancelAnimationFrame(raf); } catch { /* gone */ } }
    raf = null;
    try { void ctx?.close(); } catch { /* already closed */ }
    ctx = null;
  };
  try {
    const Ctor: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    ctx = new Ctor();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    ctx.createMediaStreamSource(stream).connect(analyser);
    const buffer = new Uint8Array(analyser.frequencyBinCount);
    state.heard = false;
    const tick = () => {
      if (state.stopped) return;
      analyser.getByteTimeDomainData(buffer);
      let sum = 0;
      for (let i = 0; i < buffer.length; i++) { const v = (buffer[i] - 128) / 128; sum += v * v; }
      const level = Math.min(1, Math.sqrt(sum / buffer.length) * 2);
      const now = performance.now();
      if (level > SPEECH_LEVEL) { state.heard = true; state.quietSince = null; }
      else if (state.heard && opts.onQuietAfterSpeech && opts.quietAfterSpeechMs != null) {
        state.quietSince ??= now;
        if (now - state.quietSince > opts.quietAfterSpeechMs) { opts.onQuietAfterSpeech(); return; }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  } catch {
    // No level meter on this browser: we cannot tell, so the clip is sent.
    stop();
    state.heard = null;
  }
  return { get heard() { return state.heard; }, stop };
}
