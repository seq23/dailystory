// Stands in for https://esm.sh/stripe in edge-function tests: answers from edgeState().stripe and
// records every call, so a test sees exactly which customer a function used. Never reaches Stripe.
import { edgeState, type StripeFake } from "./state";

function fake(): StripeFake {
  const s = edgeState();
  s.stripe ??= { customers: [], subscriptions: [], calls: [] };
  return s.stripe;
}

function call<T>(method: string, args: unknown, answer: (f: StripeFake) => T): Promise<T> {
  const f = fake();
  f.calls.push({ method, args });
  if (f.down) return Promise.reject(Object.assign(new Error("Stripe is unreachable"), { type: "StripeConnectionError" }));
  return Promise.resolve(answer(f));
}

export default class Stripe {
  constructor(_key: string, _opts?: unknown) {}

  customers = {
    retrieve: (id: string) => call("customers.retrieve", id, (f) => {
      const c = f.customers.find((x) => x.id === id);
      if (!c) throw Object.assign(new Error("No such customer"), { code: "resource_missing", statusCode: 404 });
      return c.deleted ? { id: c.id, deleted: true } : { id: c.id, email: c.email };
    }),
    list: (args: { email?: string; limit?: number }) => call("customers.list", args, (f) => ({
      data: f.customers.filter((c) => !c.deleted && (!args.email || c.email === args.email)).slice(0, args.limit ?? 10),
    })),
    create: (args: { email?: string; metadata?: Record<string, string> }) => call("customers.create", args, (f) => {
      const c = { id: `cus_new_${f.customers.length + 1}`, email: args.email ?? "" };
      f.customers.push(c);
      return c;
    }),
  };

  subscriptions = {
    search: (args: { query: string; limit?: number }) => call("subscriptions.search", args, (f) => {
      const m = /^metadata\['user_id'\]:'([^']*)'$/.exec(args.query);
      return { data: m ? f.subscriptions.filter((s) => s.metadata.user_id === m[1]) : [] };
    }),
    list: (args: { customer: string; status?: string; limit?: number }) => call("subscriptions.list", args, (f) => ({
      data: f.subscriptions
        .filter((s) => s.customer === args.customer && (!args.status || args.status === "all" || s.status === args.status))
        .map((s) => ({ ...s, items: { data: [{ id: "si_1", price: { id: "price_1", currency: "usd", product: "prod_1", recurring: { interval: "month" } } }] }, current_period_end: 1893456000 }))
        .slice(0, args.limit ?? 10),
    })),
    update: (id: string, args: unknown) => call("subscriptions.update", { id, args }, () => ({ id })),
  };

  prices = {
    retrieve: (id: string) => call("prices.retrieve", id, () => ({ id, unit_amount: 1299, recurring: { interval: "month" } })),
  };

  billingPortal = {
    sessions: {
      create: (args: { customer: string }) => call("billingPortal.sessions.create", args, () => ({ id: "bps_1", url: `https://billing.stripe.test/session/${args.customer}` })),
    },
  };

  checkout = {
    sessions: {
      create: (args: { customer?: string }) => call("checkout.sessions.create", args, () => ({ id: "cs_test_1", url: "https://checkout.stripe.test/cs_test_1" })),
    },
  };
}

export { Stripe };
