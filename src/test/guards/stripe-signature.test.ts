import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { verifyStripeEvent } from '../../../supabase/functions/_shared/verifyStripeEvent';

describe('billing webhooks require verified signatures', () => {
  it.each([[null, 'fixture-secret'], ['fixture-signature', undefined]])('rejects missing verification credentials', async (signature, secret) => {
    const verify = vi.fn();
    await expect(verifyStripeEvent('{}', signature, secret, verify)).rejects.toThrow();
    expect(verify).not.toHaveBeenCalled();
  });
  it('passes the unchanged raw body to Stripe and returns only its verified event', async () => {
    const body = ' { "type": "customer.subscription.updated" } ';
    const event = { type: 'customer.subscription.updated', data: { object: { customer: 'cus_fixture' } } };
    const verify = vi.fn().mockResolvedValue(event);
    expect(await verifyStripeEvent(body, 'fixture-signature', 'fixture-secret', verify)).toBe(event);
    expect(verify).toHaveBeenCalledWith(body, 'fixture-signature', 'fixture-secret');
  });
  it('rejects invalid signatures instead of parsing the untrusted event', async () => {
    await expect(verifyStripeEvent('{}', 'invalid', 'fixture-secret', async () => { throw new Error('Invalid signature'); })).rejects.toThrow('Invalid signature');
  });
  it('the deployed handler uses verification before creating a database client', () => {
    const source = readFileSync('supabase/functions/stripe-webhook/index.ts', 'utf8');
    expect(source).toContain('event = await verifyStripeEvent(');
    expect(source).not.toContain('event = JSON.parse(body)');
    expect(source.indexOf('event = await verifyStripeEvent(')).toBeLessThan(source.indexOf('const supabaseAdmin = createClient('));
    expect(source).toContain('await syncSubscriptionEvent(event, supabaseAdmin)');
  });
});
