import React, { createRef } from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { parseStoryVoiceCommand } from '@/lib/voice/storyVoiceCommands';

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

describe('the microphone hears a clip and hands it over', () => {
  let timers: Array<[() => void, number]>;
  beforeEach(() => {
    timers = [];
    (globalThis as any).MediaRecorder = FakeRecorder;
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: vi.fn(async () => ({ getTracks: () => [] })) } });
    const real = window.setTimeout;
    vi.spyOn(window, 'setTimeout').mockImplementation(((fn: () => void, ms?: number) => {
      if (ms === 7000) { timers.push([fn, ms]); return 1 as any; }
      return real(fn, ms);
    }) as any);
    mocks.invoke.mockResolvedValue({ data: { text: 'Next page.' }, error: null });
  });
  afterEach(() => { cleanup(); vi.restoreAllMocks(); mocks.invoke.mockReset(); mocks.toast.mockReset(); });

  it('a clip that ends by itself is transcribed in command mode (before 22 Nov 2026 every stop discarded it)', async () => {
    const ref = createRef<VoiceCommandControllerHandle>();
    const heard = vi.fn();
    render(<VoiceCommandController ref={ref} headless onCommand={heard} />);
    await act(async () => { await ref.current!.start(); });
    expect(timers).toHaveLength(1);
    await act(async () => { timers[0][0](); await new Promise((r) => setTimeout(r, 20)); });
    expect(mocks.invoke).toHaveBeenCalledWith('voice-to-text', { body: expect.objectContaining({ mode: 'command' }) });
    expect(heard).toHaveBeenCalledWith('next page.');
  });

  it('tapping stop discards the clip: nothing is sent', async () => {
    const ref = createRef<VoiceCommandControllerHandle>();
    render(<VoiceCommandController ref={ref} headless onCommand={vi.fn()} />);
    await act(async () => { await ref.current!.start(); });
    await act(async () => { ref.current!.stop(); await new Promise((r) => setTimeout(r, 20)); });
    expect(mocks.invoke).not.toHaveBeenCalled();
  });

  it('a refused microphone is reported, not swallowed', async () => {
    (navigator.mediaDevices.getUserMedia as any).mockRejectedValueOnce(new Error('NotAllowedError'));
    const ref = createRef<VoiceCommandControllerHandle>();
    const onError = vi.fn();
    render(<VoiceCommandController ref={ref} headless onError={onError} />);
    await act(async () => { await ref.current!.start(); });
    expect(onError).toHaveBeenCalledWith('microphone');
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
});
