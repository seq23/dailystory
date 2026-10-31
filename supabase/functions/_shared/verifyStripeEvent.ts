/** A public webhook must never interpret an unsigned body as a billing event. */
export async function verifyStripeEvent<T>(
  body: string,
  signature: string | null,
  secret: string | undefined,
  constructEvent: (body: string, signature: string, secret: string) => Promise<T>,
): Promise<T> {
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET not configured');
  if (!signature) throw new Error('Missing stripe-signature header');
  return await constructEvent(body, signature, secret);
}
