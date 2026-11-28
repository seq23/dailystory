// Shared state between the edge-function stubs and the tests (src/test/edge/harness.ts).
export interface EdgeState {
  handler: ((req: Request) => Response | Promise<Response>) | null;
  env: Record<string, string>;
  /** Rows a table query answers with, by table name. */
  tables: Record<string, Array<Record<string, unknown>>>;
  /** What each RPC answers. */
  rpc: Record<string, unknown>;
  /** The user id a token belongs to (null = not a user). */
  userIdFor: (token: string) => string | null;
  /** The email on the account a token belongs to (supabase-js stub auth.getUser). */
  emailFor?: (token: string) => string | null;
  /** What the Stripe SDK stub (./stub-stripe.ts) holds, and every call made to it. */
  stripe?: StripeFake;
}
export interface StripeFake {
  customers: Array<{ id: string; email: string; deleted?: boolean }>;
  /** Subscriptions by customer, with the metadata create-checkout writes. */
  subscriptions: Array<{ id: string; customer: string; status: string; metadata: Record<string, string> }>;
  calls: Array<{ method: string; args: unknown }>;
  /** Set to make every Stripe call fail (an outage). */
  down?: boolean;
}
const KEY = Symbol.for("t2r.edgeTestState");
export function edgeState(): EdgeState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = globalThis as any;
  g[KEY] ??= { handler: null, env: {}, tables: {}, rpc: {}, userIdFor: () => null } satisfies EdgeState;
  return g[KEY];
}
