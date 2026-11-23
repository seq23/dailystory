// Free read-aloud practice is counted on the server, per the family's local day. These run the
// real voice-to-text handler (supabase/functions/_shared/voiceToText.ts) with its parts faked:
// the count below follows public.read_aloud_practice_hit (20261122120000_read_aloud_practice.sql;
// its local day, zone cap and access are proven in Postgres by supabase/tests/read_aloud/practice.sql).
import { describe, expect, it, vi } from 'vitest';
import {
  READ_ALOUD_CLIP_LIMIT_CODE,
  READ_ALOUD_CLIP_LIMIT_MESSAGE,
  READ_ALOUD_FREE_CLIPS_PER_SENTENCE,
  READ_ALOUD_FREE_SENTENCES_PER_DAY,
  READ_ALOUD_LIMIT_CODE,
  READ_ALOUD_LIMIT_MESSAGE,
  READ_ALOUD_UNAVAILABLE_CODE,
  type ReadAloudDeps,
} from '../../../supabase/functions/_shared/readAloudAllowance';
import { handleVoiceToText, type VoiceToTextDeps } from '../../../supabase/functions/_shared/voiceToText';
import { READ_ALOUD_FREE_SENTENCES_PER_DAY as CLIENT_NUMBER } from '@/lib/freeStoryAllowance';

const FREE_ROW = { subscribed: false, subscription_end: null, override_premium: false, override_end: null };
const PREMIUM_ROW = { subscribed: true, subscription_end: '2035-01-01T00:00:00Z' };
const OVERRIDE_ROW = { subscribed: false, override_premium: true, override_end: '2035-01-01T00:00:00Z' };

/** read_aloud_practice_hit for one day: distinct sentences capped, clips per sentence capped; a refusal names its cap. */
function practiceCounter() {
  const clips = new Map<string, number>();
  return vi.fn(async (userId: string, key: string, _tz: string | null) => {
    const mine = [...clips.keys()].filter((k) => k.startsWith(`${userId}|`));
    const k = `${userId}|${key}`;
    const n = clips.get(k);
    if (n !== undefined) {
      if (n >= READ_ALOUD_FREE_CLIPS_PER_SENTENCE) return { allowed: false, reason: 'clips', used: mine.length, limit: READ_ALOUD_FREE_SENTENCES_PER_DAY };
      clips.set(k, n + 1);
      return { allowed: true, used: mine.length, limit: READ_ALOUD_FREE_SENTENCES_PER_DAY };
    }
    if (mine.length >= READ_ALOUD_FREE_SENTENCES_PER_DAY) return { allowed: false, reason: 'sentences', used: mine.length, limit: READ_ALOUD_FREE_SENTENCES_PER_DAY };
    clips.set(k, 1);
    return { allowed: true, used: mine.length + 1, limit: READ_ALOUD_FREE_SENTENCES_PER_DAY };
  });
}

function world(opts: { row?: unknown; rowFails?: boolean; practiceHit?: ReadAloudDeps['practiceHit']; guestRefused?: boolean; userId?: string } = {}) {
  const practiceHit = vi.fn(opts.practiceHit ?? practiceCounter());
  const report = vi.fn();
  const subscriberRow = vi.fn(async () => { if (opts.rowFails) throw new Error('subscribers read failed'); return opts.row ?? FREE_ROW; });
  const transcribe = vi.fn(async (form: FormData) =>
    new Response(JSON.stringify(form.get('response_format') ? { text: 'the fox runs', segments: [], words: [] } : { text: 'the fox runs' }), { status: 200 }));
  const deps: VoiceToTextDeps = {
    guard: async () => opts.guestRefused
      ? { caller: null, refused: new Response(JSON.stringify({ code: 'SIGN_IN_REQUIRED' }), { status: 401 }) }
      : { caller: { kind: 'user', id: opts.userId ?? 'u1' }, refused: null },
    readAloud: () => ({ subscriberRow, practiceHit, report }),
    transcribe,
    logCost: vi.fn(),
  };
  const send = async (body: Record<string, unknown>) => {
    const res = await handleVoiceToText(new Request('https://fn/voice-to-text', { method: 'POST', body: JSON.stringify({ audio: btoa('clip'), ...body }) }), deps, {});
    return { status: res.status, headers: res.headers, body: await res.json() };
  };
  return { send, practiceHit, report, subscriberRow, transcribe };
}

describe('voice-to-text counts free read-aloud practice on the server', () => {
  it('one number: the client, /pricing and the server read the same constant', () => {
    expect(CLIENT_NUMBER).toBe(READ_ALOUD_FREE_SENTENCES_PER_DAY);
    expect(READ_ALOUD_FREE_SENTENCES_PER_DAY).toBe(5);
  });

  it('abuse: a client that claims Premium and a zero count is still refused at the 6th sentence, before Whisper', async () => {
    const w = world();
    const lie = { isPremium: true, premium: true, used: 0, dailyUsed: 0, plan: 'premium' };
    for (let i = 1; i <= 5; i++) {
      const r = await w.send({ sentence: `Sentence ${i}.`, ...lie });
      expect(r.status, `sentence ${i}`).toBe(200);
      expect(r.body.practice).toEqual({ used: i, limit: 5 });
    }
    const whisperCalls = w.transcribe.mock.calls.length;
    const sixth = await w.send({ sentence: 'Sentence 6.', ...lie });
    expect(sixth).toMatchObject({ status: 429, body: { code: READ_ALOUD_LIMIT_CODE, used: 5, limit: 5 } });
    expect(sixth.body.error).toMatch(/Come back tomorrow/);
    expect(w.transcribe.mock.calls.length).toBe(whisperCalls);
    // Premium is read from subscribers for the signed-in caller, never from the body.
    expect(w.subscriberRow).toHaveBeenCalledWith('u1');
    // Another try of a sentence already counted today is still allowed.
    expect((await w.send({ sentence: 'sentence   1.' })).status).toBe(200);
  });

  it('abuse: clips with no sentence each count as a new sentence', async () => {
    const w = world();
    for (let i = 0; i < 5; i++) expect((await w.send({})).status).toBe(200);
    expect((await w.send({ sentence: '' })).status).toBe(429);
  });

  it('abuse: labelling every clip with one sentence is capped, not unlimited', async () => {
    const w = world();
    for (let i = 0; i < READ_ALOUD_FREE_CLIPS_PER_SENTENCE; i++) expect((await w.send({ sentence: 'The fox runs.' })).status).toBe(200);
    expect((await w.send({ sentence: 'The fox runs.' })).status).toBe(429);
  });

  // Reviewer, 22 Nov 2026: a child out of one sentence's clips was told "5 sentences used up".
  it('message: one sentence\'s clips used up (sentences left) → the clip message, not the day\'s', async () => {
    const w = world();
    for (let i = 0; i < READ_ALOUD_FREE_CLIPS_PER_SENTENCE; i++) await w.send({ sentence: 'The fox runs.' });
    const r = await w.send({ sentence: 'The fox runs.' });
    expect(r).toMatchObject({ status: 429, body: { code: READ_ALOUD_CLIP_LIMIT_CODE, error: READ_ALOUD_CLIP_LIMIT_MESSAGE, used: 1, limit: 5 } });
    expect(r.body.error).not.toMatch(/sentences are used up/);
    // And it is true: another sentence still works today.
    expect((await w.send({ sentence: 'The cat sits.' })).status).toBe(200);
  });

  it('message: the day\'s sentences used up → the sentence message', async () => {
    const w = world();
    for (let i = 1; i <= 5; i++) await w.send({ sentence: `S ${i}` });
    const r = await w.send({ sentence: 'S 6' });
    expect(r).toMatchObject({ status: 429, body: { code: READ_ALOUD_LIMIT_CODE, error: READ_ALOUD_LIMIT_MESSAGE, used: 5 } });
  });

  it('message: out of clips AND out of sentences → the day\'s message ("try another one" would be false)', async () => {
    const w = world();
    for (let i = 1; i <= 5; i++) await w.send({ sentence: `S ${i}` });
    for (let i = 1; i < READ_ALOUD_FREE_CLIPS_PER_SENTENCE; i++) await w.send({ sentence: 'S 5' });
    const r = await w.send({ sentence: 'S 5' });
    await expect(w.practiceHit.mock.results[w.practiceHit.mock.results.length - 1]?.value).resolves.toMatchObject({ allowed: false, reason: 'clips' });
    expect(r).toMatchObject({ status: 429, body: { code: READ_ALOUD_LIMIT_CODE, error: READ_ALOUD_LIMIT_MESSAGE } });
  });

  it('outage: a refusal that names no cap is unknown ("try again"), never a guessed message', async () => {
    const w = world({ practiceHit: async () => ({ allowed: false, used: 2, limit: 5 }) });
    const r = await w.send({ sentence: 'The fox runs.' });
    expect(r).toMatchObject({ status: 503, body: { code: READ_ALOUD_UNAVAILABLE_CODE } });
    expect(w.transcribe).not.toHaveBeenCalled();
    expect(w.report).toHaveBeenCalledWith('read_aloud_count_failed', expect.stringContaining('no reason'));
  });

  it('abuse: command mode is not counted and returns a command or nothing, never a practice transcript', async () => {
    const w = world();
    const r = await w.send({ mode: 'command', language: 'en' });
    expect(r.status).toBe(200);
    expect(r.body.text).toBe('');
    expect(w.practiceHit).not.toHaveBeenCalled();
  });

  it('a guest is refused by the guard before anything is counted or transcribed', async () => {
    const w = world({ guestRefused: true });
    expect((await w.send({ sentence: 'The fox runs.' })).status).toBe(401);
    expect(w.practiceHit).not.toHaveBeenCalled();
    expect(w.transcribe).not.toHaveBeenCalled();
  });

  it('the browser zone goes to the count (the database keeps the first real one); a junk zone goes as none', async () => {
    const w = world();
    await w.send({ sentence: 'A.', timeZone: 'America/Chicago' });
    await w.send({ sentence: 'B.', timeZone: "x'; drop table" });
    expect(w.practiceHit.mock.calls.map((c) => c[2])).toEqual(['America/Chicago', null]);
  });

  it.each([['an active subscription', PREMIUM_ROW], ['a Premium override', OVERRIDE_ROW]])(
    'data loss: %s is never counted or blocked, and gets no count back', async (_c, row) => {
      const w = world({ row });
      for (let i = 0; i < 40; i++) {
        const r = await w.send({ sentence: `Sentence ${i}.` });
        expect(r.status).toBe(200);
        expect(r.body.practice).toBeNull();
      }
      expect(w.practiceHit).not.toHaveBeenCalled();
    });

  it('data loss: a lapsed subscription counts as free', async () => {
    const w = world({ row: { subscribed: true, subscription_end: '2020-01-01T00:00:00Z' } });
    for (let i = 0; i < 5; i++) await w.send({ sentence: `S ${i}` });
    expect((await w.send({ sentence: 'S 6' })).status).toBe(429);
  });

  it('outage: the plan cannot be read: counted as free (5 today), never a 503, and reported', async () => {
    const w = world({ rowFails: true });
    const r = await w.send({ sentence: 'The fox runs.' });
    expect(r.status).toBe(200);
    expect(r.body.practice).toEqual({ used: 1, limit: 5 });
    expect(w.report).toHaveBeenCalledWith('read_aloud_plan_unknown', expect.stringContaining('subscribers'));
    for (let i = 2; i <= 5; i++) await w.send({ sentence: `S ${i}` });
    expect((await w.send({ sentence: 'S 6' })).status).toBe(429);
  });

  it('outage: the count cannot be read: refused with "try again" (503), never let through, and reported', async () => {
    const w = world({ practiceHit: async () => { throw new Error('rpc down'); } });
    const r = await w.send({ sentence: 'The fox runs.' });
    expect(r).toMatchObject({ status: 503, body: { code: READ_ALOUD_UNAVAILABLE_CODE } });
    expect(r.body.error).toMatch(/try again/i);
    expect(r.headers.get('Retry-After')).toBe('60');
    expect(w.transcribe).not.toHaveBeenCalled();
    expect(w.report).toHaveBeenCalledWith('read_aloud_count_failed', 'rpc down');
  });

  it('outage: an answer that is not a count is unknown, not a pass', async () => {
    const w = world({ practiceHit: async () => null });
    expect((await w.send({ sentence: 'The fox runs.' })).status).toBe(503);
    expect(w.transcribe).not.toHaveBeenCalled();
  });

  it('outage: the count cannot be read: Premium is unaffected', async () => {
    const w = world({ row: PREMIUM_ROW, practiceHit: async () => { throw new Error('rpc down'); } });
    expect((await w.send({ sentence: 'The fox runs.' })).status).toBe(200);
    expect(w.report).not.toHaveBeenCalled();
  });
});
