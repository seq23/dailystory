// Shared state between the edge-function stubs and the tests (src/test/edge/harness.ts).
export interface EdgeState {
  handler: ((req: Request) => Response | Promise<Response>) | null;
  env: Record<string, string>;
  /** Rows a table query answers with, by table name. */
  tables: Record<string, Array<Record<string, unknown>>>;
  /** What each RPC answers. */
  rpc: Record<string, unknown>;
  /** Tables whose reads answer with an error (a database that is down for them). */
  failing?: string[];
  /** The user id a token belongs to (null = not a user). */
  userIdFor: (token: string) => string | null;
}
const KEY = Symbol.for("t2r.edgeTestState");
export function edgeState(): EdgeState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = globalThis as any;
  g[KEY] ??= { handler: null, env: {}, tables: {}, rpc: {}, userIdFor: () => null } satisfies EdgeState;
  return g[KEY];
}
