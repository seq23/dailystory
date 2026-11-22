import React, { createRef } from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { parseStoryVoiceCommand } from '@/lib/voice/storyVoiceCommands';
import { VOICE_COMMAND_PROMPTS, commandTranscript, voiceCommandLanguage } from '../../../supabase/functions/_shared/voiceCommandPrompt';

const mocks = vi.hoisted(() => ({ invoke: vi.fn(), toast: vi.fn() }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { functions: { invoke: (...a: any[]) => mocks.invoke(...a) } } }));
vi.mock('@/services/CharlotteVoiceService', () => ({ CharlotteVoiceService: { getInstance: () => ({ getStatus: () => ({ isPlaying: false }), stop: () => {} }) } }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: mocks.toast }) }));

import { VoiceCommandController, type VoiceCommandControllerHandle } from '@/components/VoiceCommandController';
import { StoryVoiceCommands } from '@/components/story/StoryVoiceCommands';

const locales = join(__dirname, '../../i18n/locales');

describe('the story page understands what a child says', () => {
  it.each([
    ['Next page.', 'next'], ['next', 'next'], ['Go back!', 'back'], ['Read to me', 'read'],
    ['Stop.', 'stop'], ['stop reading', 'stop'], ['Página siguiente', 'next'], ['Léeme', 'read'],
    ['Lis-moi', 'read'], ['下一页。', 'next'], ['اقرأ لي', 'read'], ['अगला पेज', 'next'],
  ])('%s → %s', (said, command) => expect(parseStoryVoiceCommand(said)).toBe(command));

  it.each(['', 'Once upon a time there was a dragon who wanted to read every book', 'thank you', 'banana'])(
    'is not a command: %s', (said) => expect(parseStoryVoiceCommand(said)).toBeNull());

  it.each(Object.entries(VOICE_COMMAND_PROMPTS))('the %s speech prompt can never turn a page, whole or in part', (_lng, prompt) => {
    // Whisper repeats its prompt on a silent clip; no run of its words may be a command.
    const han = /\p{Script=Han}/u.test(prompt);
    const units = han ? [...prompt] : prompt.split(/\s+/);
    for (let i = 0; i < units.length; i++) {
      for (let j = i + 1; j <= units.length; j++) {
        const part = units.slice(i, j).join(han ? '' : ' ');
        expect(parseStoryVoiceCommand(part), part).toBeNull();
      }
    }
  });

  it('there is a prompt for each of the 8 UI languages, and nothing else is passed on as a language', () => {
    expect(Object.keys(VOICE_COMMAND_PROMPTS).sort()).toEqual(['ar', 'en', 'es', 'fr', 'hi', 'pt', 'ur', 'zh']);
    expect(voiceCommandLanguage('es-MX')).toBe('es');
    expect(voiceCommandLanguage('de')).toBeNull();
    expect(voiceCommandLanguage({ evil: 1 })).toBeNull();
  });

  it('a transcript that only echoes the prompt is nothing said; a real command passes', () => {
    expect(commandTranscript("Hello. This is a short clip from a children's story app.", VOICE_COMMAND_PROMPTS.en)).toBe('');
    expect(commandTranscript('a short clip', VOICE_COMMAND_PROMPTS.en)).toBe('');
    expect(commandTranscript('  ', VOICE_COMMAND_PROMPTS.en)).toBe('');
    expect(commandTranscript('Next page.', VOICE_COMMAND_PROMPTS.en)).toBe('Next page.');
    expect(commandTranscript('下一页', VOICE_COMMAND_PROMPTS.zh)).toBe('下一页');
  });

  it('Spanish "para" ("for") never stops the reading', () => expect(parseStoryVoiceCommand('lee para mí')).toBe('read'));

  it.each(['en', 'es', 'fr', 'ar', 'hi', 'pt', 'ur', 'zh'])('every phrase the %s hint tells the child to say works, in order', (lng) => {
    const hint: string = JSON.parse(readFileSync(join(locales, `${lng}.json`), 'utf8')).reader.voice.hint;
    const phrases = [...hint.matchAll(/[“«"]\s*([^”»"]+?)\s*[”»"]/g)].map((m) => m[1]);
    expect(phrases).toHaveLength(4);
    expect(phrases.map(parseStoryVoiceCommand)).toEqual(['next', 'back', 'read', 'stop']);
  });
});

class FakeRecorder {
  static isTypeSupported = () => true;
  state = 'inactive';
  ondataavailable: ((e: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  constructor(public stream: unknown) {}
  start() { this.state = 'recording'; }
  stop() {
    if (this.state !== 'recording') throw new Error('inactive');
    this.state = 'inactive';
    this.ondataavailable?.({ data: new Blob(['clip']) });
    void this.onstop?.();
  }
}

/** A level meter that hears nothing: every sample sits at the midline. */
class SilentAudioContext {
  createAnalyser() { return { fftSize: 0, frequencyBinCount: 32, getByteTimeDomainData: (b: Uint8Array) => b.fill(128) }; }
  createMediaStreamSource() { return { connect: () => {} }; }
  close() { return Promise.resolve(); }
}

describe('the microphone hears a clip and hands it over', () => {
  let timers: Array<[() => void, number]>;
  let trackStop: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    timers = [];
    trackStop = vi.fn();
    (globalThis as any).MediaRecorder = FakeRecorder;
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: vi.fn(async () => ({ getTracks: () => [{ stop: trackStop }] })) } });
    const real = window.setTimeout;
    vi.spyOn(window, 'setTimeout').mockImplementation(((fn: () => void, ms?: number) => {
      if (ms === 7000) { timers.push([fn, ms]); return 1 as any; }
      return real(fn, ms);
    }) as any);
    mocks.invoke.mockResolvedValue({ data: { text: 'Next page.' }, error: null });
  });
  afterEach(() => { cleanup(); vi.restoreAllMocks(); delete (window as any).AudioContext; mocks.invoke.mockReset(); mocks.toast.mockReset(); });

  it('a clip that ends by itself is transcribed in command mode (before 22 Nov 2026 every stop discarded it)', async () => {
    const ref = createRef<VoiceCommandControllerHandle>();
    const heard = vi.fn();
    render(<VoiceCommandController ref={ref} onCommand={heard} language="es" />);
    await act(async () => { await ref.current!.start(); });
    expect(timers).toHaveLength(1);
    await act(async () => { timers[0][0](); await new Promise((r) => setTimeout(r, 20)); });
    expect(mocks.invoke).toHaveBeenCalledWith('voice-to-text', { body: expect.objectContaining({ mode: 'command', language: 'es' }) });
    expect(heard).toHaveBeenCalledWith('next page.');
  });

  it('tapping stop discards the clip: nothing is sent', async () => {
    const ref = createRef<VoiceCommandControllerHandle>();
    render(<VoiceCommandController ref={ref} onCommand={vi.fn()} />);
    await act(async () => { await ref.current!.start(); });
    await act(async () => { ref.current!.stop(); await new Promise((r) => setTimeout(r, 20)); });
    expect(mocks.invoke).not.toHaveBeenCalled();
  });

  it('a refused microphone is reported, not swallowed', async () => {
    (navigator.mediaDevices.getUserMedia as any).mockRejectedValueOnce(new Error('NotAllowedError'));
    const ref = createRef<VoiceCommandControllerHandle>();
    const onError = vi.fn();
    render(<VoiceCommandController ref={ref} onError={onError} />);
    await act(async () => { await ref.current!.start(); });
    expect(onError).toHaveBeenCalledWith('microphone');
  });

  it('a tap with no speech sends nothing and tells the child (Whisper invents words for silence)', async () => {
    (window as any).AudioContext = SilentAudioContext;
    const ref = createRef<VoiceCommandControllerHandle>();
    const heard = vi.fn();
    render(<VoiceCommandController ref={ref} onCommand={heard} />);
    await act(async () => { await ref.current!.start(); });
    await act(async () => { timers[0][0](); await new Promise((r) => setTimeout(r, 20)); });
    expect(mocks.invoke).not.toHaveBeenCalled();
    expect(heard).toHaveBeenCalledWith('');
    expect(trackStop).toHaveBeenCalled();
  });

  it('leaving the story page turns the microphone off at once and drops the clip', async () => {
    const ref = createRef<VoiceCommandControllerHandle>();
    const heard = vi.fn();
    const view = render(<VoiceCommandController ref={ref} onCommand={heard} />);
    await act(async () => { await ref.current!.start(); });
    view.unmount();
    expect(trackStop).toHaveBeenCalled();
    await act(async () => { timers[0][0](); await new Promise((r) => setTimeout(r, 20)); });
    expect(mocks.invoke).not.toHaveBeenCalled();
    expect(heard).not.toHaveBeenCalled();
  });

  it('a transcript that comes back after the child left is never acted on', async () => {
    let answer!: (v: unknown) => void;
    mocks.invoke.mockReturnValueOnce(new Promise((r) => { answer = r; }));
    const ref = createRef<VoiceCommandControllerHandle>();
    const heard = vi.fn();
    const view = render(<VoiceCommandController ref={ref} onCommand={heard} />);
    await act(async () => { await ref.current!.start(); });
    await act(async () => { timers[0][0](); await new Promise((r) => setTimeout(r, 20)); });
    expect(mocks.invoke).toHaveBeenCalledTimes(1);
    view.unmount();
    await act(async () => { answer({ data: { text: 'Next page.' }, error: null }); await new Promise((r) => setTimeout(r, 20)); });
    expect(heard).not.toHaveBeenCalled();
  });

  it('leaving while the microphone permission is still being asked never opens it', async () => {
    let grant!: (v: unknown) => void;
    (navigator.mediaDevices.getUserMedia as any).mockReturnValueOnce(new Promise((r) => { grant = r; }));
    const ref = createRef<VoiceCommandControllerHandle>();
    const view = render(<VoiceCommandController ref={ref} onCommand={vi.fn()} />);
    let started!: Promise<void>;
    act(() => { started = ref.current!.start(); });
    view.unmount();
    await act(async () => { grant({ getTracks: () => [{ stop: trackStop }] }); await started; });
    expect(trackStop).toHaveBeenCalled();
    expect(timers).toHaveLength(0);
  });

  it('while listening the button shows a live microphone with one small red dot, and no toast covers the page', async () => {
    render(<StoryVoiceCommands onCommand={vi.fn()} />);
    const button = screen.getByRole('button', { name: 'Voice commands' });
    await act(async () => { fireEvent.click(button); });
    const listening = screen.getByRole('button', { name: 'Stop listening' });
    expect(listening).toHaveAttribute('aria-pressed', 'true');
    expect(listening.querySelector('.lucide-mic')).not.toBeNull();
    expect(listening.querySelector('.lucide-mic-off')).toBeNull();
    expect(screen.getAllByTestId('story-voice-listening')).toHaveLength(1);
    expect(mocks.toast).not.toHaveBeenCalled();
  });

  it('the story button turns what was said into a page action, and says so when it did not understand', async () => {
    const onCommand = vi.fn();
    render(<StoryVoiceCommands onCommand={onCommand} />);
    const button = screen.getByRole('button', { name: 'Voice commands' });
    await act(async () => { fireEvent.click(button); });
    await act(async () => { timers[0][0](); await new Promise((r) => setTimeout(r, 20)); });
    expect(onCommand).toHaveBeenCalledWith('next');

    mocks.invoke.mockResolvedValueOnce({ data: { text: 'banana' }, error: null });
    await act(async () => { fireEvent.click(button); });
    await act(async () => { timers[1][0](); await new Promise((r) => setTimeout(r, 20)); });
    expect(onCommand).toHaveBeenCalledTimes(1);
    expect(mocks.toast).toHaveBeenLastCalledWith(expect.objectContaining({ title: 'I didn’t catch that' }));
  });
});

describe('the reader mounts the microphone where the child can tap it', () => {
  const source = readFileSync(join(__dirname, '../../components/CleanStoryDisplay.tsx'), 'utf8');
  it('the page controls carry the voice button (the old headless mount had nothing to start it)', () => {
    expect(source).toMatch(/voiceControl=\{<StoryVoiceCommands onCommand=\{handleStoryVoiceCommand\} \/>\}/);
  });
  it('the Next buttons and the spoken "next page" read one gate', () => {
    expect(source.match(/currentPage < 5/g)).toHaveLength(1);
    expect(source.match(/canGoNext=\{canGoNext\}/g)).toHaveLength(2);
    expect(source).toMatch(/if \(!canGoNext \|\| isLoadingNextPage\) return;/);
  });
});
