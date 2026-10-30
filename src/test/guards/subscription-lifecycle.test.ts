import { describe, expect, it, vi } from 'vitest';
import { syncSubscriptionEvent } from '../../../supabase/functions/_shared/subscriptionUpdate';

const now = new Date('2030-01-01T00:00:00Z');
const end = Date.parse('2030-02-01T00:00:00Z') / 1000;
const subscription = (extra = {}) => ({
  id: 'sub_fixture', customer: 'cus_fixture', status: 'active', current_period_end: end,
  items: { data: [{ price: { recurring: { interval: 'month' } } }] }, ...extra,
});
const event = (type = 'customer.subscription.updated', extra = {}) => ({ type, data: { object: subscription(extra) } });
function database(error: { message: string } | null = null) {
  const eq = vi.fn().mockResolvedValue({ error });
  const update = vi.fn(() => ({ eq }));
  return { from: vi.fn(() => ({ update })), update, eq };
}

describe('Stripe subscription lifecycle (invented event payloads, no network)', () => {
  it('keeps access until the scheduled cancellation date', async () => {
    const db = database();
    await syncSubscriptionEvent(event(undefined, { cancel_at_period_end: true, cancel_at: end }), db, now);
    expect(db.from).toHaveBeenCalledWith('subscribers');
    expect(db.eq).toHaveBeenCalledWith('stripe_customer_id', 'cus_fixture');
    expect(db.update).toHaveBeenCalledWith({ subscribed: true, subscription_end: '2030-02-01T00:00:00.000Z', subscription_tier: 'monthly', updated_at: now.toISOString() });
  });
  it('renews the expiry, removes a canceled schedule, and updates a changed annual plan', async () => {
    const db = database();
    await syncSubscriptionEvent(event(undefined, {
      cancel_at_period_end: false, cancel_at: null, current_period_end: end + 31536000,
      items: { data: [{ price: { recurring: { interval: 'year' } } }] },
    }), db, now);
    expect(db.update).toHaveBeenCalledWith(expect.objectContaining({ subscribed: true, subscription_tier: 'annual', subscription_end: new Date((end + 31536000) * 1000).toISOString() }));
  });
  it('uses item-level billing periods from current Stripe payloads', async () => {
    const db = database();
    await syncSubscriptionEvent(event(undefined, {
      current_period_end: undefined,
      items: { data: [{ current_period_end: end, price: { recurring: { interval: 'month' } } }] },
    }), db, now);
    expect(db.update).toHaveBeenCalledWith(expect.objectContaining({
      subscribed: true, subscription_end: '2030-02-01T00:00:00.000Z', subscription_tier: 'monthly',
    }));
  });
  it.each(['customer.subscription.deleted', 'customer.subscription.updated'])('clears access, tier and stale expiry for %s', async (type) => {
    const db = database();
    await syncSubscriptionEvent(event(type, { status: 'canceled' }), db, now);
    expect(db.update).toHaveBeenCalledWith({ subscribed: false, subscription_tier: null, subscription_end: null, updated_at: now.toISOString() });
  });
  it.each(['trialing', 'past_due'])('preserves the existing access policy for %s', async (status) => {
    const db = database();
    await syncSubscriptionEvent(event(undefined, { status }), db, now);
    expect(db.update).toHaveBeenCalledWith(expect.objectContaining({ subscribed: true }));
  });
  it.each(['unpaid', 'paused', 'incomplete', 'incomplete_expired'])('revokes access for %s', async (status) => {
    const db = database();
    await syncSubscriptionEvent(event(undefined, { status }), db, now);
    expect(db.update).toHaveBeenCalledWith(expect.objectContaining({ subscribed: false, subscription_end: null, subscription_tier: null }));
  });
  it('supports expanded customers and repeat delivery without extending access', async () => {
    const db = database();
    const payload = event(undefined, { customer: { id: 'cus_fixture' } });
    await syncSubscriptionEvent(payload, db, now);
    await syncSubscriptionEvent(payload, db, now);
    expect(db.eq).toHaveBeenLastCalledWith('stripe_customer_id', 'cus_fixture');
    expect(db.update.mock.calls[0]).toEqual(db.update.mock.calls[1]);
  });
  it('throws database failures so Stripe receives a retryable error', async () => {
    for (const type of ['customer.subscription.updated', 'customer.subscription.deleted']) {
      await expect(syncSubscriptionEvent(event(type), database({ message: 'fixture write failed' }), now)).rejects.toThrow('fixture write failed');
    }
  });
  it('ignores unrelated events', async () => {
    const db = database();
    expect(await syncSubscriptionEvent(event('invoice.payment_failed'), db, now)).toBe(false);
    expect(db.from).not.toHaveBeenCalled();
  });
});
