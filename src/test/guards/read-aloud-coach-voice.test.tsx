// Read-aloud practice sends a child's voice to speech-to-text (voice-to-text → OpenAI).
// What the privacy page promises, proven here (src/pages/Privacy.tsx, Voice bullet):
// - signed-out guests get no practice microphone (parental consent, risk rule R-KID-02);
// - a practice clip with no speech in it is never sent.
import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ invoke: vi.fn(), getSession: vi.fn() }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: {
  functions: { invoke: (...a: any[]) => mocks.invoke(...a) },
  auth: { getSession: () => mocks.getSession(), onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }) },
} }));
vi.mock('@/services/CharlotteVoiceService', () => ({ charlotteVoiceService: { stop: () => {}, charlotteInteractiveAudio: async () => {}, charlotteAccuracyFeedback: async () => {}, charlottePracticeWords: async () => {}, charlotteSyllableWord: async () => {} } }));
vi.mock('@/services/BrowserTTSService', () => ({ browserTTSService: { stop: () => {}, speakCoachMessage: async () => {} } }));

import ReadAloudCoach from '@/components/ReadAloudCoach';

class FakeRecorder {
  static isTypeSupported = () => true;
  static last: FakeRecorder | null = null;
  state = 'inactive';
  ondataavailable: ((e: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  constructor(public stream: unknown) { FakeRecorder.last = this; }
  start() { this.state = 'recording'; }
  stop() {
    if (this.state !== 'recording') return;
    this.state = 'inactive';
    this.ondataavailable?.({ data: new Blob(['clip']) });
    void this.onstop?.();
  }
}

/** A level meter whose samples are all at the midline (silence) or all loud (speech). */
const meter = (sample: number) => class {
  createAnalyser() { return { fftSize: 0, frequencyBinCount: 32, getByteTimeDomainData: (b: Uint8Array) => b.fill(sample) }; }
  createMediaStreamSource() { return { connect: () => {} }; }
  close() { return Promise.resolve(); }
};

const startButton = () => screen.queryByRole('button', { name: /Start Reading/ });

describe('read-aloud practice and the child\'s voice', () => {
  let trackStop: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    trackStop = vi.fn();
    (globalThis as any).MediaRecorder = FakeRecorder;
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: vi.fn(async () => ({ getTracks: () => [{ stop: trackStop }] })) } });
    mocks.invoke.mockResolvedValue({ data: { text: 'the fox runs' }, error: null });
    mocks.getSession.mockResolvedValue({ data: { session: { user: { id: 'u1' } } }, error: null });
  });
  afterEach(() => { cleanup(); vi.restoreAllMocks(); delete (window as any).AudioContext; mocks.invoke.mockReset(); mocks.getSession.mockReset(); });

  it.each([
    ['a guest (no session)', () => mocks.getSession.mockResolvedValue({ data: { session: null }, error: null })],
    ['the sign-in check failing', () => mocks.getSession.mockRejectedValue(new Error('auth down'))],
  ])('%s: no practice microphone, a sign-in line instead, nothing recorded or sent', async (_case, arrange) => {
    arrange();
    render(<ReadAloudCoach targetText="The fox runs." autoIntroduce={false} isPremium />);
    await act(async () => { await new Promise((r) => setTimeout(r, 20)); });
    expect(startButton()).toBeNull();
    expect(screen.getByTestId('coach-sign-in')).toBeTruthy();
    expect(navigator.mediaDevices.getUserMedia).not.toHaveBeenCalled();
    expect(mocks.invoke).not.toHaveBeenCalled();
  });

  it('a practice tap with no speech sends nothing and tells the child', async () => {
    (window as any).AudioContext = meter(128);
    render(<ReadAloudCoach targetText="The fox runs." autoIntroduce={false} isPremium />);
    const start = await screen.findByRole('button', { name: /Start Reading/ });
    await act(async () => { fireEvent.click(start); });
    await act(async () => { await new Promise((r) => setTimeout(r, 50)); });
    await act(async () => { FakeRecorder.last!.stop(); await new Promise((r) => setTimeout(r, 20)); });
    expect(mocks.invoke).not.toHaveBeenCalled();
    expect(trackStop).toHaveBeenCalled();
    expect(screen.getByTestId('coach-no-speech')).toBeTruthy();
  });

  it('a practice clip with speech in it is transcribed', async () => {
    (window as any).AudioContext = meter(255);
    render(<ReadAloudCoach targetText="The fox runs." autoIntroduce={false} isPremium />);
    const start = await screen.findByRole('button', { name: /Start Reading/ });
    await act(async () => { fireEvent.click(start); });
    await act(async () => { await new Promise((r) => setTimeout(r, 50)); });
    await act(async () => { FakeRecorder.last!.stop(); await new Promise((r) => setTimeout(r, 20)); });
    expect(mocks.invoke).toHaveBeenCalledWith('voice-to-text', expect.anything());
    expect(screen.queryByTestId('coach-no-speech')).toBeNull();
  });

  // The server counts a free account's practice (voice-to-text, readAloudAllowance.ts);
  // a fresh browser (count 0 here) must still show the server's refusal.
  const refusedBy = (status: number, code: string) => ({
    data: null,
    error: { name: 'FunctionsHttpError', context: new Response(JSON.stringify({ success: false, code }), { status }) },
  });
  const practiseOnce = async () => {
    (window as any).AudioContext = meter(255);
    localStorage.clear();
    render(<ReadAloudCoach targetText="The fox runs." autoIntroduce={false} isPremium={false} />);
    const start = await screen.findByRole('button', { name: /Start Reading/ });
    await act(async () => { fireEvent.click(start); });
    await act(async () => { await new Promise((r) => setTimeout(r, 50)); });
    await act(async () => { FakeRecorder.last!.stop(); await new Promise((r) => setTimeout(r, 20)); });
  };

  it('the clip names its sentence, so the server can count sentences, not taps', async () => {
    await practiseOnce();
    expect(mocks.invoke).toHaveBeenCalledWith('voice-to-text', { body: expect.objectContaining({ sentence: 'The fox runs.' }) });
  });

  it('a free account the server stops at the daily limit sees why, and Start is off', async () => {
    mocks.invoke.mockResolvedValue(refusedBy(429, 'READ_ALOUD_LIMIT_REACHED'));
    await practiseOnce();
    expect(screen.getByTestId('coach-refused').textContent).toMatch(/5 free practice sentences are used up/);
    expect((startButton() as HTMLButtonElement).disabled).toBe(true);
  });

  it('when the server cannot count, the child is told to try again (not stopped for the day)', async () => {
    mocks.invoke.mockResolvedValue(refusedBy(503, 'READ_ALOUD_CHECK_UNAVAILABLE'));
    await practiseOnce();
    expect(screen.getByTestId('coach-refused').textContent).toMatch(/try again/i);
    expect((startButton() as HTMLButtonElement).disabled).toBe(false);
  });
});

describe('the privacy pages say what happens to a voice clip', () => {
  // Safety text, not wording: OpenAI's API data-controls page
  // (developers.openai.com/api/docs/guides/your-data, read 22 Nov 2026) lists
  // /v1/audio/transcriptions with abuse-monitoring retention "None".
  const { readFileSync } = require('node:fs') as typeof import('node:fs');
  const { join } = require('node:path') as typeof import('node:path');
  const root = join(__dirname, '../../..');
  const files = ['src/pages/Privacy.tsx', 'src/pages/Subprocessors.tsx', 'docs/privacy/data-inventory.md', 'docs/sales/capabilities.md', 'docs/sales/privacy-security.md'];
  const sentences = files.flatMap((f) => readFileSync(join(root, f), 'utf8').replace(/\s+/g, ' ')
    .split(/(?<=[.;|])\s+|<li>|\|/).map((text) => ({ f, text })))
    .filter(({ text }) => /voice clip|speech-to-text|transcription|a clip|the clip|no speech/i.test(text));

  it('no voice line claims a retention period OpenAI does not list, or that every silent tap is dropped', () => {
    expect(sentences.length).toBeGreaterThanOrEqual(8);
    for (const { f, text } of sentences) {
      expect(text, f).not.toMatch(/\b30[- ]days?\b/i);
      expect(text, f).not.toMatch(/a tap with no speech sends nothing/i);
    }
    const retention = sentences.filter(({ text }) => /abuse-monitoring retention/i.test(text));
    expect(retention.map(({ f }) => f).sort()).toEqual(['docs/privacy/data-inventory.md', 'src/pages/Privacy.tsx', 'src/pages/Subprocessors.tsx']);
    for (const { text } of retention) expect(text).toMatch(/developers\.openai\.com\/api\/docs\/guides\/your-data/);
  });

  it('the consent basis is stated only for signed-in accounts, which is what the code enforces', () => {
    const privacy = readFileSync(join(root, 'src/pages/Privacy.tsx'), 'utf8');
    expect(privacy).toMatch(/Voice clips \(signed-in accounts only[^<]*<\/td>.*Parental consent/);
    expect(readFileSync(join(root, 'supabase/functions/voice-to-text/index.ts'), 'utf8')).toMatch(/allowGuests: false/);
  });
});
