// Parent lifecycle emails (approved by Sequoia 1 Nov 2026): who gets them, once only, and the
// approved copy. Invented accounts, no network.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import {
  gate, isTestAccount, dueWelcome, dueTrialEnding, dueComeBack, dueFreeStoriesUsed, LIFECYCLE_FROM, LIFECYCLE_REPLY_TO,
  type Gate, type SubscriberRow, type EmailKind,
} from '../../../supabase/functions/_shared/lifecycleEmail/rules';
import { renderLifecycleEmail } from '../../../supabase/functions/_shared/lifecycleEmail/templates';
import { childStats, runLifecycleSweep, sendLifecycleEmail, type LifecycleDeps, type OutgoingEmail } from '../../../supabase/functions/_shared/lifecycleEmail/core';
import { lifecycleColumns } from '../../../supabase/functions/_shared/lifecycleEmail/stripeState';
import { captureBillingIntent, peekBillingIntent, clearBillingIntent } from '@/lib/billingIntent';

const root = join(__dirname, '../../..');
const read = (p: string) => readFileSync(join(root, p), 'utf8');
const NOW = new Date('2026-11-11T15:00:00Z');
const H = 3_600_000, D = 24 * H;
const iso = (ms: number) => new Date(NOW.getTime() + ms).toISOString();
const ADDRESS = '123 Fixture Street, Testville, ZZ 00000';

const okGate: Gate = { paused: false, mailingAddress: ADDRESS, email: 'parent@family.net', lane: 'family', isTestFlag: false, stripeLivemode: true, optedOut: false, alreadySent: false };

describe('gate: every rule before every send', () => {
  it('a family account that is due gets the email', () => expect(gate(okGate)).toEqual({ send: true }));
  it.each<[Partial<Gate>, string]>([
    [{ lane: 'school' }, 'school_account'],
    [{ lane: null }, 'school_unconfirmed'],
    [{ isTestFlag: true }, 'test_account'],
    [{ stripeLivemode: false }, 'test_account'],
    [{ email: 'qa@example.com' }, 'test_account'],
    [{ email: 'mum+test@gmail.com' }, 'test_account'],
    [{ optedOut: true }, 'opted_out'],
    [{ alreadySent: true }, 'already_sent'],
    [{ paused: true }, 'paused'],
    [{ mailingAddress: null }, 'no_mailing_address'],
    [{ email: null }, 'no_account_email'],
  ])('%o is refused as %s', (change, reason) => expect(gate({ ...okGate, ...change })).toEqual({ send: false, reason }));
  it('school wins over everything else, including the local test recipient', () => {
    expect(gate({ ...okGate, lane: 'school', localRecipientOnly: 'parent@family.net' })).toEqual({ send: false, reason: 'school_account' });
  });
  it('the local private copy sends only to its one allowed address', () => {
    expect(gate({ ...okGate, stripeLivemode: false, email: 'seq@x.org', localRecipientOnly: 'seq@x.org' })).toEqual({ send: true });
    expect(gate({ ...okGate, localRecipientOnly: 'seq@x.org' })).toEqual({ send: false, reason: 'local_recipient_only' });
  });
  it('test accounts', () => {
    expect(isTestAccount({ email: 'a@b.test' })).toBe(true);
    expect(isTestAccount({ email: 'nope' })).toBe(true);
    expect(isTestAccount({ email: 'parent@gmail.com' })).toBe(false);
  });
});

const sub = (x: Partial<SubscriberRow> = {}): SubscriberRow => ({
  user_id: 'u1', subscribed: true, subscription_tier: 'monthly', subscription_end: iso(2 * D), trial_start: iso(-5 * D), trial_end: iso(36 * H),
  cancel_at_period_end: false, cancelled_at: null, ...x,
});

describe('trigger timing', () => {
  it('welcome: a trial started in the last 2 days', () => {
    expect(dueWelcome(sub({ trial_start: iso(-10 * 60_000), trial_end: iso(7 * D) }), NOW)).toBe(true);
    expect(dueWelcome(sub({ trial_start: iso(-3 * D), trial_end: iso(4 * D) }), NOW)).toBe(false);
    expect(dueWelcome(sub({ trial_start: null }), NOW)).toBe(false);
  });
  it('trial ending: 12–48 h before the trial ends, and not when a cancel is scheduled', () => {
    expect(dueTrialEnding(sub(), NOW)).toBe(true);
    expect(dueTrialEnding(sub({ trial_end: iso(3 * D) }), NOW)).toBe(false);
    expect(dueTrialEnding(sub({ trial_end: iso(6 * H) }), NOW)).toBe(false);
    expect(dueTrialEnding(sub({ cancel_at_period_end: true }), NOW)).toBe(false);
  });
  it('come back: 14–21 days after cancelling, not if subscribed again', () => {
    expect(dueComeBack(sub({ subscribed: false, cancelled_at: iso(-15 * D) }), NOW)).toBe(true);
    expect(dueComeBack(sub({ subscribed: false, cancelled_at: iso(-10 * D) }), NOW)).toBe(false);
    expect(dueComeBack(sub({ subscribed: false, cancelled_at: iso(-30 * D) }), NOW)).toBe(false);
    expect(dueComeBack(sub({ subscribed: true, cancelled_at: iso(-15 * D) }), NOW)).toBe(false);
  });
  it('3 free stories: a free account whose 3rd finished story is recent', () => {
    const three = [iso(-2 * D), iso(-D), iso(-H)];
    expect(dueFreeStoriesUsed(null, three, NOW)).toBe(true);
    expect(dueFreeStoriesUsed(null, three.slice(0, 2), NOW)).toBe(false);
    expect(dueFreeStoriesUsed(null, [iso(-9 * D), iso(-8 * D), iso(-7 * D)], NOW)).toBe(false);
    expect(dueFreeStoriesUsed(sub(), three, NOW)).toBe(false); // paid
    expect(dueFreeStoriesUsed({ subscribed: false, trial_start: iso(-20 * D) }, three, NOW)).toBe(false); // had a trial
  });
});

/** In-memory deps: one family, one school account, a log table with a real unique key. */
function fakeDeps(opts: { lanes?: Record<string, string>; subs?: Record<string, SubscriberRow>; reads?: Record<string, { child_profile_id: string | null; completed_at: string | null; pages_read: number | null }[]>; optedOut?: string[]; paused?: boolean; sendStatus?: number } = {}) {
  const log = new Set<string>();
  const sent: OutgoingEmail[] = [];
  const deps: LifecycleDeps = {
    now: NOW, mailingAddress: ADDRESS, unsubscribeEndpoint: 'https://fn.example/lifecycle-unsubscribe',
    paused: async () => !!opts.paused,
    account: async (u) => ({ email: `${u}@family.net`, meta: { full_name: 'Shane Parent' } }),
    lane: async (u) => { const l = (opts.lanes ?? {})[u]; if (!l) throw new Error('unreadable'); return l; },
    prefs: async (u) => ({ token: '00000000-0000-4000-8000-000000000001', optedOut: (opts.optedOut ?? []).includes(u), isTest: false }),
    subscriber: async (u) => ({ ...(opts.subs ?? {})[u], stripe_livemode: true } as SubscriberRow),
    alreadySent: async (u, k) => log.has(`${u}:${k}`),
    claim: async (u, k) => { if (log.has(`${u}:${k}`)) return false; log.add(`${u}:${k}`); return true; },
    release: async (u, k) => { log.delete(`${u}:${k}`); },
    recordProviderId: async () => {},
    children: async () => [{ id: 'c1', name: 'Aiden' }, { id: 'c2', name: 'Aeric' }],
    readings: async (u) => (opts.reads ?? {})[u] ?? [],
    quizzes: async () => [{ child_profile_id: 'c1' }],
    send: vi.fn(async (e: OutgoingEmail) => { sent.push(e); return opts.sendStatus ? { ok: false as const, status: opts.sendStatus, error: 'The time-2-read.com domain is not verified' } : { ok: true as const, id: 'em_1' }; }),
    subscribersForSweep: async () => Object.values(opts.subs ?? {}),
    recentFreeCompleters: async () => Object.keys(opts.reads ?? {}),
  };
  return { deps, sent, log };
}

const allDue = () => ({
  welcome: sub({ user_id: 'u', trial_start: iso(-H), trial_end: iso(7 * D - H) }),
  trial_ending: sub({ user_id: 'u' }),
  come_back: sub({ user_id: 'u', subscribed: false, cancelled_at: iso(-15 * D), subscription_tier: null }),
});
const done3 = [{ child_profile_id: 'c1', completed_at: iso(-3 * H), pages_read: 8 }, { child_profile_id: 'c1', completed_at: iso(-2 * H), pages_read: 8 }, { child_profile_id: 'c1', completed_at: iso(-H), pages_read: 8 }];

describe('sending: school, test, opted-out and once-only for each trigger', () => {
  const kinds: EmailKind[] = ['welcome', 'trial_ending', 'come_back', 'free_stories_used'];
  const setup = (kind: EmailKind, lane: string, optedOut: string[] = []) => {
    const s = allDue() as Record<string, SubscriberRow>;
    return fakeDeps({ lanes: { u: lane }, subs: kind === 'free_stories_used' ? {} : { u: s[kind] }, reads: { u: done3 }, optedOut });
  };
  it.each(kinds)('%s: a due family account gets exactly one email, ever', async (kind) => {
    const { deps, sent } = setup(kind, 'family');
    expect((await sendLifecycleEmail(kind, 'u', deps)).status).toBe('sent');
    expect((await sendLifecycleEmail(kind, 'u', deps))).toMatchObject({ status: 'skipped', reason: 'already_sent' });
    expect(sent).toHaveLength(1);
    expect(sent[0].to).toBe('u@family.net');
    expect(sent[0].from).toBe('Time-2-Read <hello@time-2-read.com>');
    expect(sent[0].reply_to).toBe('st@time-2-read.com');
    expect(sent[0].headers['List-Unsubscribe-Post']).toBe('List-Unsubscribe=One-Click');
    expect(sent[0].html).toContain(ADDRESS);
  });
  it.each(kinds)('%s: NEGATIVE PROOF a school account (or unreadable school status) gets nothing', async (kind) => {
    for (const lane of ['school', 'mystery']) {
      const { deps, sent } = setup(kind, lane);
      const o = await sendLifecycleEmail(kind, 'u', deps);
      expect(o).toMatchObject({ status: 'skipped', reason: lane === 'school' ? 'school_account' : 'school_unconfirmed' });
      expect(sent).toHaveLength(0);
    }
  });
  it.each(kinds)('%s: an opted-out account gets nothing', async (kind) => {
    const { deps, sent } = setup(kind, 'family', ['u']);
    expect(await sendLifecycleEmail(kind, 'u', deps)).toMatchObject({ status: 'skipped', reason: 'opted_out' });
    expect(sent).toHaveLength(0);
  });
  it('a refused send frees the log row so the next sweep retries, and names the stop', async () => {
    const { deps, log } = fakeDeps({ lanes: { u: 'family' }, subs: { u: allDue().welcome }, sendStatus: 403 });
    const o = await sendLifecycleEmail('welcome', 'u', deps);
    expect(o).toMatchObject({ status: 'stopped', stop: 'SENDER_DOMAIN_UNVERIFIED' });
    expect(log.size).toBe(0);
  });
  it('missing mailing address is a NAMED STOP that sends nothing', async () => {
    const { deps, sent } = fakeDeps({ lanes: { u: 'family' }, subs: { u: allDue().welcome } });
    deps.mailingAddress = null;
    const r = await runLifecycleSweep(deps);
    expect(r.stop).toMatch(/NAMED STOP LIFECYCLE_MAILING_ADDRESS/);
    expect(sent).toHaveLength(0);
  });
  it('the kill switch sends nothing', async () => {
    const { deps, sent } = fakeDeps({ lanes: { u: 'family' }, subs: { u: allDue().welcome }, paused: true });
    await runLifecycleSweep(deps);
    expect(await sendLifecycleEmail('welcome', 'u', deps)).toMatchObject({ reason: 'paused' });
    expect(sent).toHaveLength(0);
  });
  it('come back is not sent when nothing was saved (the copy would be untrue)', async () => {
    const { deps, sent } = fakeDeps({ lanes: { u: 'family' }, subs: { u: allDue().come_back } });
    expect(await sendLifecycleEmail('come_back', 'u', deps)).toMatchObject({ reason: 'nothing_saved' });
    expect(sent).toHaveLength(0);
  });
  it('the sweep finds each due account and sends once across repeated runs', async () => {
    const { deps, sent } = fakeDeps({ lanes: { a: 'family', b: 'school' }, subs: { a: sub({ user_id: 'a' }), b: sub({ user_id: 'b' }) } });
    await runLifecycleSweep(deps);
    await runLifecycleSweep(deps);
    expect(sent.map((e) => e.to)).toEqual(['a@family.net']);
  });
});

describe('the approved copy', () => {
  const base = { parentName: 'Shane', mailingAddress: ADDRESS, unsubscribeUrl: 'https://time-2-read.com/unsubscribe?t=x' };
  const trialEnd = new Date('2026-11-13T17:00:00Z'); // a Friday
  it('welcome', () => {
    const r = renderLifecycleEmail({ ...base, kind: 'welcome', trialEnd });
    expect(r.subject).toBe('Welcome! Three things to try tonight');
    expect(r.preview).toBe('Your free week runs until Fri 13 Nov.');
    for (const s of ['Hi Shane,', "Welcome to Time-2-Read: stories at your child&#39;s reading level, for ages 3–15.", 'Add each child.', 'Add a few of their words.', 'Let them steer.',
      'Start tonight&#39;s story', 'Runs until Friday 13 November. We&#39;ll email you 2 days before it ends. Nothing to do now.',
      'You&#39;re getting this because you started a Time-2-Read trial.']) expect(r.html).toContain(s);
    expect(r.html).not.toMatch(/\$\d/); // no price talk on day 1
  });
  it('trial ending, with per-child stats', () => {
    const r = renderLifecycleEmail({ ...base, kind: 'trial_ending', trialEnd, plan: 'monthly', children: [
      { name: 'Aiden', stories: 4, pages: 31, quizzes: 3 }, { name: 'Aeric', stories: 2, pages: 12, quizzes: 0 }] });
    expect(r.subject).toBe('Your free week ends Friday');
    expect(r.preview).toBe('Aiden has read 4 stories so far.');
    for (const s of ['<b>Aiden:</b> 4 stories, 31 pages read, 3 quizzes', '<b>Aeric:</b> 2 stories, 12 pages read', '<b>$12.99 a month</b> on 13 November',
      'Keep Premium', 'Switch to yearly: $99, saves $56', 'Cancel before Friday', 'and you won&#39;t be charged. Your stories stay saved either way.',
      '?billing=yearly', '?billing=cancel', 'Reminder about your Time-2-Read trial.']) expect(r.html).toContain(s);
  });
  it('trial ending with nothing read swaps the box', () => {
    const r = renderLifecycleEmail({ ...base, kind: 'trial_ending', trialEnd, plan: 'monthly', children: [{ name: 'Aiden', stories: 0, pages: 0, quizzes: 0 }] });
    expect(r.html).toContain('Try one story tonight. It takes 10 minutes.');
    expect(r.html).not.toContain('Aiden:');
  });
  it('trial ending on the yearly plan does not offer the yearly switch', () => {
    const r = renderLifecycleEmail({ ...base, kind: 'trial_ending', trialEnd, plan: 'annual', children: [] });
    expect(r.html).not.toContain('Switch to yearly');
    expect(r.html).toContain('<b>$99 a year</b>');
  });
  it('3 free stories used', () => {
    const r = renderLifecycleEmail({ ...base, kind: 'free_stories_used', childName: 'Aiden' });
    expect(r.subject).toBe('Aiden finished 3 stories');
    expect(r.preview).toBe("Here's what comes next.");
    for (const s of ['Aiden has read all 3 free stories. Nice work.', 'Unlimited stories, as long as they want', 'Their own ending, every time',
      'Read-aloud, quizzes after each story, and progress you can see', 'Stories for every child in the family', 'Start a free week',
      '7 days free, then $12.99 a month or $99 a year. Cancel anytime.', 'You&#39;re getting this because you have a Time-2-Read account.']) expect(r.html).toContain(s);
  });
  it('come back', () => {
    const r = renderLifecycleEmail({ ...base, kind: 'come_back', childName: 'Aiden', storyCount: 4 });
    expect(r.subject).toBe("Aiden's stories are still saved");
    expect(r.preview).toBe("Whenever you're ready.");
    for (const s of ['Just so you know: Aiden&#39;s 4 stories and reading level are still saved.', 'Pick up where they left off',
      'This is the only email we&#39;ll send about it.', 'You&#39;re getting this because you had a Time-2-Read account.']) expect(r.html).toContain(s);
  });
  it('every email: unsubscribe link, the postal address, brand spelling, no banned claims', () => {
    for (const kind of ['welcome', 'trial_ending', 'free_stories_used', 'come_back'] as const) {
      const r = renderLifecycleEmail({ ...base, kind, trialEnd, childName: 'Aiden', storyCount: 2, children: [] });
      expect(r.html).toContain('href="https://time-2-read.com/unsubscribe?t=x"');
      expect(r.html).toContain(ADDRESS);
      expect(r.text).toContain(ADDRESS);
      for (const banned of [/no screens?/i, /screen[- ]free/i, /dyslexi/i, /adhd/i, /grade level jump|grade jump|guarantee/i, /\bAI\b/, /Time2Read/]) {
        expect(`${r.subject} ${r.html}`).not.toMatch(banned);
      }
    }
  });
  it('per-child stats: unattributed sessions go to the only child', () => {
    expect(childStats([{ id: 'c1', name: 'Aiden' }], [{ child_profile_id: null, completed_at: iso(0), pages_read: 5 }], [])).toEqual([{ name: 'Aiden', stories: 1, pages: 5, quizzes: 0 }]);
  });
});

describe('Stripe state for the emails', () => {
  it('records trial dates, live mode, a scheduled cancel and a cancellation', () => {
    expect(lifecycleColumns({ status: 'trialing', trial_start: 1_800_000_000, trial_end: 1_800_604_800 }, true, false, NOW)).toEqual({
      cancel_at_period_end: false, stripe_livemode: true, trial_start: new Date(1_800_000_000_000).toISOString(), trial_end: new Date(1_800_604_800_000).toISOString(), cancelled_at: null });
    expect(lifecycleColumns({ status: 'trialing', cancel_at_period_end: true }, true, false, NOW).cancel_at_period_end).toBe(true);
    expect(lifecycleColumns({ status: 'canceled', ended_at: 1_800_000_000 }, true, true, NOW).cancelled_at).toBe(new Date(1_800_000_000_000).toISOString());
  });
});

describe('billing links from the trial-ending email', () => {
  it('keeps a valid ?billing= intent across sign-in and ignores anything else', () => {
    clearBillingIntent();
    expect(captureBillingIntent('?billing=evil')).toBeNull();
    expect(captureBillingIntent('?billing=yearly')).toBe('yearly');
    expect(peekBillingIntent()).toBe('yearly');
    clearBillingIntent();
    expect(peekBillingIntent()).toBeNull();
  });
});

describe('wiring, senders and the database', () => {
  it('the approved sender', () => {
    expect(LIFECYCLE_FROM).toBe('Time-2-Read <hello@time-2-read.com>');
    expect(LIFECYCLE_REPLY_TO).toBe('st@time-2-read.com');
  });
  it('every From address in the edge functions is on time-2-read.com (or Resend\'s own test domain)', () => {
    const dir = join(root, 'supabase/functions');
    const files: string[] = [];
    const walk = (d: string) => { for (const n of readdirSync(d)) { const p = join(d, n); if (n === '_vendor' || n === 'node_modules') continue; if (statSync(p).isDirectory()) walk(p); else if (p.endsWith('.ts')) files.push(p); } };
    walk(dir);
    const froms = files.flatMap((f) => [...readFileSync(f, 'utf8').matchAll(/from:\s*["'`][^"'`]*<([^>]+)>/g)].map((m) => m[1]));
    expect(froms.length).toBeGreaterThanOrEqual(6);
    for (const a of froms) expect(a, a).toMatch(/@(time-2-read\.com|resend\.dev)$/);
    for (const f of files) expect(readFileSync(f, 'utf8'), f).not.toMatch(/time2read\.(com|app)|storyforge\.app/i);
  });
  it('the mailing address comes from a secret and is never in the repo', () => {
    expect(read('supabase/functions/_shared/lifecycleEmail/deps.ts')).toContain('env.get("LIFECYCLE_MAILING_ADDRESS")');
    for (const f of ['rules.ts', 'templates.ts', 'core.ts', 'deps.ts']) expect(read(`supabase/functions/_shared/lifecycleEmail/${f}`)).not.toMatch(/San Francisco|\bCA 9\d{4}\b|P\.?O\.? Box/i);
    const sync = read('.github/workflows/sync-edge-secrets.yml');
    expect(sync).toContain('LIFECYCLE_MAILING_ADDRESS');
    expect(sync).toContain('LIFECYCLE_CRON_SECRET');
  });
  it('the migration is additive and keys the sent log by (account, kind)', () => {
    const sql = read('supabase/migrations/20261101090000_lifecycle_emails.sql');
    expect(sql).toMatch(/primary key \(user_id, email_kind\)/);
    expect(sql).not.toMatch(/drop table|drop column|delete from|truncate/i);
    expect(sql).toMatch(/revoke all on public\.lifecycle_email_prefs, public\.lifecycle_email_log, public\.lifecycle_email_settings from anon, authenticated/);
  });
  it('school status comes from the Phase 8 database check, not a flag', () => {
    expect(read('supabase/functions/_shared/lifecycleEmail/deps.ts')).toContain('rpc("institution_ai_lane", { p_user: userId, p_child: null })');
  });
  it('both new functions answer the deploy\'s OPTIONS boot probe with a 2xx before any other check', () => {
    for (const fn of ['lifecycle-emails', 'lifecycle-unsubscribe']) {
      const src = read(`supabase/functions/${fn}/index.ts`);
      const options = src.indexOf('req.method === "OPTIONS"');
      expect(options, fn).toBeGreaterThan(0);
      expect(options, fn).toBeLessThan(src.indexOf('req.method !== "POST"'));
    }
  });
  it('the hourly sweep, the kill switch and the webhook are wired', () => {
    const wf = read('.github/workflows/lifecycle-emails.yml');
    expect(wf).toMatch(/cron: "23 \* \* \* \*"/);
    expect(wf).toContain('x-lifecycle-secret');
    expect(wf).toMatch(/action=pause/);
    const hook = read('supabase/functions/stripe-webhook/index.ts');
    expect(hook).toContain('sendLifecycleEmail("welcome"');
    expect(hook).toContain('recordSubscriptionLifecycle(event, supabaseAdmin)');
    const toml = read('supabase/config.toml');
    expect(toml).toMatch(/\[functions\.lifecycle-emails\]\nverify_jwt = false/);
    expect(toml).toMatch(/\[functions\.lifecycle-unsubscribe\]\nverify_jwt = false/);
    expect(read('src/App.tsx')).toContain('<Route path="/unsubscribe" element={<Unsubscribe />} />');
  });
});
