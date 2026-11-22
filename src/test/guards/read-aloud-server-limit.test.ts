// Free read-aloud practice is counted on the server (voice-to-text), not only in the browser.
// The in-memory counter below follows public.paid_call_hit (20261103120000_paid_call_rate.sql):
// every bucket is charged or none is, and the first full bucket is returned.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import {
  READ_ALOUD_FREE_CLIPS_PER_SENTENCE,
  READ_ALOUD_FREE_SENTENCES_PER_DAY,
  READ_ALOUD_LIMIT_CODE,
  READ_ALOUD_UNAVAILABLE_CODE,
  checkReadAloud,
  type ReadAloudDeps,
} from '../../../supabase/functions/_shared/readAloudAllowance';
import { spokenCommandOnly } from '../../../supabase/functions/_shared/storyVoiceCommands';
import { READ_ALOUD_FREE_SENTENCES_PER_DAY as CLIENT_NUMBER } from '@/lib/freeStoryAllowance';

const FREE_ROW = { subscribed: false, subscription_end: null, override_premium: false, override_end: null };
const PREMIUM_ROW = { subscribed: true, subscription_end: '2035-01-01T00:00:00Z' };
const OVERRIDE_ROW = { subscribed: false, override_premium: true, override_end: '2035-01-01T00:00:00Z' };

function counter() {
  const hits = new Map<string, number>();
  const hit = vi.fn(async (buckets: string[], _w: number[], limits: number[]) => {
    const next = buckets.map((b) => (hits.get(b) ?? 0) + 1);
    const over = buckets.find((_, i) => next[i] > limits[i]);
    if (over) return over;
    buckets.forEach((b, i) => hits.set(b, next[i]));
    return null;
  });
  return { hits, hit };
}
const deps = (row: unknown, c = counter()): ReadAloudDeps & { hit: ReturnType<typeof vi.fn> } =>
  ({ subscriberRow: vi.fn(async () => row), hit: c.hit });

describe('free read-aloud practice is counted on the server', () => {
  it('one number: the client, /pricing and the server read the same constant', () => {
    expect(CLIENT_NUMBER).toBe(READ_ALOUD_FREE_SENTENCES_PER_DAY);
    expect(READ_ALOUD_FREE_SENTENCES_PER_DAY).toBe(5);
  });

  it('abuse: a free account is refused at the 6th sentence whatever the client claims', async () => {
    const d = deps(FREE_ROW);
    for (let i = 1; i <= 5; i++) expect((await checkReadAloud('u1', `Sentence ${i}.`, d)).allowed, `sentence ${i}`).toBe(true);
    const sixth = await checkReadAloud('u1', 'Sentence 6.', d);
    expect(sixth).toMatchObject({ allowed: false, status: 429, body: { code: READ_ALOUD_LIMIT_CODE, limit: 5 } });
    // A refused call is not counted, and retrying it does not slip through.
    expect((await checkReadAloud('u1', 'Sentence 6.', d)).allowed).toBe(false);
    // Another try of a sentence already counted today is still allowed.
    expect((await checkReadAloud('u1', 'sentence   1.', d))).toMatchObject({ allowed: true, reason: 'same-sentence' });
  });

  it('abuse: clips with no sentence each count as a new sentence', async () => {
    const d = deps(FREE_ROW);
    for (let i = 0; i < 5; i++) expect((await checkReadAloud('u1', undefined, d)).allowed).toBe(true);
    expect((await checkReadAloud('u1', '', d)).allowed).toBe(false);
  });

  it('abuse: labelling every clip with one sentence is capped, not unlimited', async () => {
    const d = deps(FREE_ROW);
    for (let i = 0; i <= READ_ALOUD_FREE_CLIPS_PER_SENTENCE; i++) expect((await checkReadAloud('u1', 'The fox runs.', d)).allowed).toBe(true);
    expect(await checkReadAloud('u1', 'The fox runs.', d)).toMatchObject({ allowed: false, body: { code: READ_ALOUD_LIMIT_CODE } });
  });

  it('abuse: command mode returns a command or nothing, never a practice transcript', () => {
    expect(spokenCommandOnly('next page')).toBe('next page');
    expect(spokenCommandOnly('The little fox walks to a big tree.')).toBe('');
  });

  it('abuse: Premium comes from the subscribers row on the server, never from the request', () => {
    const src = readFileSync(join(process.cwd(), 'supabase/functions/voice-to-text/index.ts'), 'utf8');
    expect(src).toMatch(/const \{ audio, mimeType, mode, language, sentence \} = await req\.json\(\)/);
    expect(src).not.toMatch(/isPremium|premium\s*[:=]/i);
    // Counted before the paid transcription, for every clip that is not a command.
    const check = src.indexOf('checkReadAloud(caller.id');
    expect(check).toBeGreaterThan(src.indexOf('if (!isCommand && caller.kind === "user")'));
    expect(check).toBeLessThan(src.indexOf('api.openai.com/v1/audio/transcriptions'));
    expect(src).toMatch(/isCommand \? spokenCommandOnly\(/);
  });

  it.each([['an active subscription', PREMIUM_ROW], ['a Premium override', OVERRIDE_ROW]])(
    'data loss: %s is never counted or blocked', async (_c, row) => {
      const d = deps(row);
      for (let i = 0; i < 40; i++) expect((await checkReadAloud('p1', `Sentence ${i}.`, d))).toMatchObject({ allowed: true, reason: 'premium' });
      expect(d.hit).not.toHaveBeenCalled();
    });

  it('data loss: a lapsed subscription counts as free', async () => {
    const d = deps({ subscribed: true, subscription_end: '2020-01-01T00:00:00Z' });
    for (let i = 0; i < 5; i++) await checkReadAloud('u2', `S ${i}`, d);
    expect((await checkReadAloud('u2', 'S 6', d)).allowed).toBe(false);
  });

  it('outage: the count cannot be read: a free account is refused with "try again", never let through', async () => {
    const d: ReadAloudDeps = { subscriberRow: async () => FREE_ROW, hit: async () => { throw new Error('db down'); } };
    const r = await checkReadAloud('u1', 'The fox runs.', d);
    expect(r).toMatchObject({ allowed: false, status: 503, body: { code: READ_ALOUD_UNAVAILABLE_CODE } });
    if (!r.allowed) expect(r.body.error).toMatch(/try again/i);
  });

  it('outage: the count cannot be read: Premium is unaffected', async () => {
    const d: ReadAloudDeps = { subscriberRow: async () => PREMIUM_ROW, hit: async () => { throw new Error('db down'); } };
    expect(await checkReadAloud('p1', 'The fox runs.', d)).toMatchObject({ allowed: true, reason: 'premium' });
  });

  it('outage: the plan cannot be read: refused with "try again", never treated as Premium', async () => {
    const c = counter();
    const d: ReadAloudDeps = { subscriberRow: async () => { throw new Error('db down'); }, hit: c.hit };
    expect(await checkReadAloud('u1', 'The fox runs.', d)).toMatchObject({ allowed: false, status: 503, body: { code: READ_ALOUD_UNAVAILABLE_CODE } });
    expect(c.hit).not.toHaveBeenCalled();
  });
});
