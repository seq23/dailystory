// Security audit B (27 Nov 2026), Time-2-Read, on the real path: each function runs as deployed
// (supabase/functions/<fn>/index.ts through ./harness.ts). Auth, REST and RPC answers come from a
// small in-test world; Stripe is the SDK stub (./stub-stripe.ts). Nothing reaches a network.
//  - A discount code is never defaulted, is redeemed only through redeem_discount_code for the
//    signed-in account's own id, and guesses are limited per account and per network.
//  - A Stripe customer is found only by what was recorded for the account id, never by email:
//    a sign-up with a paying parent's address gets neither her Premium nor her billing portal.
// The race (20 parallel redemptions) is proven on real PostgreSQL: supabase/tests/discount_codes
// and scripts/test-institutions-db.sh.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { edgeState } from "./state";
import { ENV, runFunction, tokenFor, type Route, type Run } from "./harness";
import { CODE_GUESS_LIMITS } from "../../../supabase/functions/_shared/discountRedeem";

const HER = "11111111-1111-4111-8111-111111111111";
const FAKE = "22222222-2222-4222-8222-222222222222";
const OTHER = "33333333-3333-4333-8333-333333333333";
const HER_EMAIL = "parent@example.test";
const TOKENS: Record<string, { id: string; email: string }> = {
  [tokenFor("authenticated", HER)]: { id: HER, email: HER_EMAIL },
  // Signed up later with her address (she deleted her account, or changed her email).
  [tokenFor("authenticated", FAKE)]: { id: FAKE, email: HER_EMAIL },
  [tokenFor("authenticated", OTHER)]: { id: OTHER, email: "other@example.test" },
};
const tokenOf = (id: string) => Object.keys(TOKENS).find((t) => TOKENS[t].id === id)!;

interface World {
  subscribers: Array<Record<string, unknown>>;
  counts: Map<string, number>;
  limiterDown?: boolean;
  authDown?: boolean;
  redeemDown?: boolean;
  redeemAnswer: (userId: string, code: string) => Record<string, unknown>;
  redeemCalls: Array<{ p_user_id: string; p_code: string }>;
  accessCodes: Array<Record<string, unknown>>;
  restReads: string[];
}
let w: World;

const ok = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

/** The world's answers: auth, the shared counter (all-or-nothing, like paid_call_hit), the RPC, REST reads by filter. */
const route: Route = (url, init) => {
  const u = new URL(url);
  if (u.pathname === "/auth/v1/user") {
    if (w.authDown) return ok({ message: "auth down" }, 500);
    const auth = new Headers(init?.headers).get("Authorization") ?? "";
    const user = TOKENS[auth.replace(/^Bearer\s+/i, "")];
    return user ? ok(user) : ok({ message: "invalid" }, 401);
  }
  if (u.pathname === "/rest/v1/rpc/paid_call_hit") {
    if (w.limiterDown) return ok({ message: "down" }, 503);
    const { p_buckets, p_limits } = JSON.parse(String(init?.body)) as { p_buckets: string[]; p_limits: number[] };
    const full = p_buckets.find((b, i) => (w.counts.get(b) ?? 0) >= p_limits[i]);
    if (full) return ok(full);
    for (const b of p_buckets) w.counts.set(b, (w.counts.get(b) ?? 0) + 1);
    return ok(null);
  }
  if (u.pathname === "/rest/v1/rpc/redeem_discount_code") {
    const args = JSON.parse(String(init?.body));
    w.redeemCalls.push(args);
    if (w.redeemDown) return ok({ message: "db down" }, 503);
    return ok([w.redeemAnswer(args.p_user_id, args.p_code)]);
  }
  const table = u.pathname.replace("/rest/v1/", "");
  if ((init?.method ?? "GET") === "GET" && (table === "subscribers" || table === "access_codes" || table === "access_code_redemptions")) {
    w.restReads.push(table);
    const rows = table === "subscribers" ? w.subscribers : table === "access_codes" ? w.accessCodes : [];
    const filters = [...u.searchParams.entries()].filter(([k, v]) => k !== "select" && v.startsWith("eq."));
    return ok(rows.filter((r) => filters.every(([k, v]) => String(r[k]) === v.slice(3))));
  }
  return undefined;
};

beforeEach(() => {
  const s = edgeState();
  s.env = { ...ENV, STRIPE_SECRET_KEY: "sk_test_fake" };
  s.userIdFor = (t) => TOKENS[t]?.id ?? null;
  s.emailFor = (t) => TOKENS[t]?.email ?? null;
  s.rpc = {};
  s.tables = {};
  // Her real, paid billing account. Its email is hers; the subscription carries her account id.
  s.stripe = {
    customers: [{ id: "cus_HER", email: HER_EMAIL }],
    subscriptions: [{ id: "sub_HER", customer: "cus_HER", status: "active", metadata: { user_id: HER, plan: "monthly" } }],
    calls: [],
  };
  w = {
    subscribers: [{ user_id: HER, email: HER_EMAIL, stripe_customer_id: "cus_HER", subscribed: true, subscription_end: "2999-01-01T00:00:00Z", subscription_tier: "Monthly Premium" }],
    counts: new Map(),
    redeemAnswer: (_u, code) => ({ status: "granted", code, duration_days: 90, description: "90 days", premium_until: "2027-02-25T00:00:00Z" }),
    redeemCalls: [],
    accessCodes: [],
    restReads: [],
  };
});
afterEach(() => {
  vi.unstubAllGlobals();
});

const post = (fn: string, userId: string | null, body: unknown, ip = "203.0.113.7") =>
  new Request(`https://project.supabase.test/functions/v1/${fn}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "cf-connecting-ip": ip,
      ...(userId ? { Authorization: `Bearer ${tokenOf(userId)}` } : {}),
    },
    body: JSON.stringify(body),
  });
const run = (fn: string, req: Request) => runFunction(fn, req, "fail", route);
const body = (r: Run) => JSON.parse(r.text) as Record<string, unknown>;
const stripeCalls = (method: string) => (edgeState().stripe?.calls ?? []).filter((c) => c.method === method);

describe("discount codes: no default, own account only, atomic, guess-limited", () => {
  it.each(["activate-discount-code", "apply-discount-code"])("%s: an empty request redeems nothing (no default code)", async (fn) => {
    const r = await run(fn, post(fn, OTHER, {}));
    expect(r.response.status).toBe(400);
    expect(body(r).activated).toBe(false);
    expect(w.redeemCalls).toEqual([]);
    expect(r.outbound.some((o) => /SEQUOIA90/i.test(o.url + o.body))).toBe(false);
  });

  it.each(["activate-discount-code", "apply-discount-code"])("%s: redeems for the token's account, never an id the caller sends", async (fn) => {
    const r = await run(fn, post(fn, OTHER, { discountCode: " sequoia 90 ", user_id: HER, p_user_id: HER }));
    expect(r.response.status).toBe(200);
    expect(body(r).activated).toBe(true);
    expect(w.redeemCalls).toEqual([{ p_user_id: OTHER, p_code: "SEQUOIA90" }]);
    // The old read-then-write paths are gone: no PATCH of current_uses, no subscriber upsert from the function.
    expect(r.outbound.filter((o) => /discount_codes|subscribers\?on_conflict/.test(o.url))).toEqual([]);
  });

  it("apply-discount-code uses the code saved on the account when the body has none", async () => {
    w.subscribers.push({ user_id: OTHER, email: "other@example.test", discount_code_pending: "BEACON90" });
    const r = await run("apply-discount-code", post("apply-discount-code", OTHER, {}));
    expect(r.response.status).toBe(200);
    expect(w.redeemCalls).toEqual([{ p_user_id: OTHER, p_code: "BEACON90" }]);
  });

  it("a used-up code and a wrong code get the same answer, and neither grants", async () => {
    w.redeemAnswer = (_u, code) => ({ status: code === "SEQUOIA90" ? "exhausted" : "invalid", code: null, duration_days: null, description: null, premium_until: null });
    const used = await run("apply-discount-code", post("apply-discount-code", OTHER, { discountCode: "SEQUOIA90" }));
    const wrong = await run("apply-discount-code", post("apply-discount-code", OTHER, { discountCode: "NOPE12" }));
    expect(used.response.status).toBe(400);
    expect(used.text).toBe(wrong.text);
    expect(body(used).activated).toBe(false);
  });

  it("an account that already redeemed is told so and gets nothing more", async () => {
    w.redeemAnswer = () => ({ status: "already", code: "SEQUOIA90", duration_days: 90, description: null, premium_until: null });
    const r = await run("activate-discount-code", post("activate-discount-code", OTHER, { discountCode: "SEQUOIA90" }));
    expect(r.response.status).toBe(200);
    expect(body(r)).toMatchObject({ activated: false, alreadyActivated: true, success: false });
  });

  it("an answer the function does not know is never a grant", async () => {
    w.redeemAnswer = () => ({ status: "maybe" });
    const r = await run("apply-discount-code", post("apply-discount-code", OTHER, { discountCode: "SEQUOIA90" }));
    expect(r.response.status).toBe(503);
    expect(body(r).activated).toBe(false);
  });

  it.each([
    ["auth unreachable", () => { w.authDown = true; }],
    ["the counter unreachable", () => { w.limiterDown = true; }],
    ["the database unreachable", () => { w.redeemDown = true; }],
  ])("%s: a plain 503, never Premium", async (_label, breakIt) => {
    breakIt();
    const r = await run("apply-discount-code", post("apply-discount-code", OTHER, { discountCode: "SEQUOIA90" }));
    expect(r.response.status).toBe(503);
    expect(body(r).activated).toBe(false);
    if (w.limiterDown || w.authDown) expect(w.redeemCalls).toEqual([]);
  });

  it("not signed in: 401 and nothing looked up", async () => {
    const r = await run("apply-discount-code", post("apply-discount-code", null, { discountCode: "SEQUOIA90" }));
    expect(r.response.status).toBe(401);
    expect(w.redeemCalls).toEqual([]);
  });

  it(`an account gets ${CODE_GUESS_LIMITS.perAccountDay} tries a day; the next is refused before any lookup, with a plain message`, async () => {
    w.redeemAnswer = () => ({ status: "invalid" });
    for (let i = 0; i < CODE_GUESS_LIMITS.perAccountDay; i++) {
      const r = await run("apply-discount-code", post("apply-discount-code", OTHER, { discountCode: `GUESS${i}` }));
      expect(r.response.status).toBe(400);
    }
    const calls = w.redeemCalls.length;
    const r = await run("apply-discount-code", post("apply-discount-code", OTHER, { discountCode: "GUESSX" }));
    expect(r.response.status).toBe(429);
    expect(body(r)).toMatchObject({ error: "TOO_MANY_TRIES", message: "Too many code tries today. Please try again tomorrow." });
    expect(w.redeemCalls.length).toBe(calls);
  });

  it("a stranger burning tries from many accounts on one network never locks out a family on another network", async () => {
    w.redeemAnswer = () => ({ status: "invalid" });
    const strangers = Array.from({ length: 8 }, (_, i) => `44444444-4444-4444-8444-44444444440${i}`);
    for (const id of strangers) TOKENS[tokenFor("authenticated", id)] = { id, email: `s${id.slice(-1)}@example.test` };
    let refused = 0;
    for (const id of strangers) {
      for (let i = 0; i < CODE_GUESS_LIMITS.perAccountDay; i++) {
        const r = await run("apply-discount-code", post("apply-discount-code", id, { discountCode: `G${i}` }, "198.51.100.9"));
        if (r.response.status === 429) refused++;
      }
    }
    // 80 tries from one network: the network's day (60) is full, so the last 20 were refused.
    expect(refused).toBe(8 * CODE_GUESS_LIMITS.perAccountDay - CODE_GUESS_LIMITS.perNetworkDay);
    w.redeemAnswer = (_u, code) => ({ status: "granted", code, duration_days: 90, description: null, premium_until: "2027-02-25T00:00:00Z" });
    const family = await run("apply-discount-code", post("apply-discount-code", OTHER, { discountCode: "SEQUOIA90" }, "203.0.113.50"));
    expect(family.response.status).toBe(200);
    expect(body(family).activated).toBe(true);
  });

  it("the network key is the address Cloudflare saw, not a forged X-Forwarded-For", async () => {
    w.redeemAnswer = () => ({ status: "invalid" });
    const req = (i: number) => {
      const r = post("apply-discount-code", OTHER, { discountCode: `F${i}` }, "198.51.100.10");
      r.headers.set("x-forwarded-for", `10.0.0.${i}`);
      return r;
    };
    for (let i = 0; i < CODE_GUESS_LIMITS.perAccountDay; i++) await run("apply-discount-code", req(i));
    const nets = [...w.counts.keys()].filter((k) => k.startsWith("codeguess:net:"));
    expect(nets.length).toBe(1);
  });

  it("redeem-access-code: guesses are limited the same way, and the counter down is a refusal before any lookup", async () => {
    for (let i = 0; i < CODE_GUESS_LIMITS.perAccountDay; i++) {
      await run("redeem-access-code", post("redeem-access-code", OTHER, { accessCode: `HOMESCHOOL${i}` }));
    }
    w.restReads = [];
    const over = await run("redeem-access-code", post("redeem-access-code", OTHER, { accessCode: "HOMESCHOOL99" }));
    expect(over.response.status).toBe(429);
    expect(body(over).error).toBe("TOO_MANY_TRIES");
    expect(w.restReads).toEqual([]);

    w.counts.clear();
    w.limiterDown = true;
    const down = await run("redeem-access-code", post("redeem-access-code", OTHER, { accessCode: "HOMESCHOOL15" }));
    expect(down.response.status).toBe(503);
    expect(body(down).activated).toBe(false);
    expect(w.restReads).toEqual([]);
  });

  it("redeem-access-code: a family's real code still works under the limit", async () => {
    w.accessCodes = [{ id: "ac1", code: "HOMESCHOOL15", trial_days: 15, label: "co-op", active: true }];
    w.subscribers = [];
    const r = await run("redeem-access-code", post("redeem-access-code", OTHER, { accessCode: "homeschool15" }));
    expect(r.response.status).toBe(200);
    expect(body(r)).toMatchObject({ activated: true, trial_days: 15 });
  });
});

describe("billing: a sign-up with a paying parent's email gets neither her Premium nor her billing", () => {
  it("customer-portal: the look-alike account gets no portal session and Stripe is never searched by email", async () => {
    edgeState().tables = { subscribers: [] }; // the look-alike account has no row of its own
    const r = await run("customer-portal", post("customer-portal", FAKE, {}));
    expect(r.response.status).toBe(404);
    expect(r.text).not.toContain("cus_HER");
    expect(stripeCalls("billingPortal.sessions.create")).toEqual([]);
    expect(stripeCalls("customers.list")).toEqual([]);
  });

  it("customer-portal: the paying parent still gets her own portal", async () => {
    edgeState().tables = { subscribers: [{ stripe_customer_id: "cus_HER" }] };
    const r = await run("customer-portal", post("customer-portal", HER, {}));
    expect(r.response.status).toBe(200);
    expect(body(r).url).toBe("https://billing.stripe.test/session/cus_HER");
  });

  it("customer-portal: a payer whose row never got the customer id is found by her own account id on the subscription", async () => {
    edgeState().tables = { subscribers: [{ stripe_customer_id: null }] };
    const r = await run("customer-portal", post("customer-portal", HER, {}));
    expect(body(r).url).toBe("https://billing.stripe.test/session/cus_HER");
    expect(stripeCalls("subscriptions.search")[0]?.args).toEqual({ query: `metadata['user_id']:'${HER}'`, limit: 10 });
  });

  it("customer-portal: Stripe down is a refusal, never a session", async () => {
    edgeState().tables = { subscribers: [{ stripe_customer_id: "cus_HER" }] };
    edgeState().stripe!.down = true;
    const r = await run("customer-portal", post("customer-portal", HER, {}));
    expect(r.response.status).toBeGreaterThanOrEqual(500);
    expect(body(r).url).toBeUndefined();
  });

  it("check-subscription: the look-alike account is not Premium; the paying parent is", async () => {
    const fake = await run("check-subscription", post("check-subscription", FAKE, {}));
    expect(body(fake).subscribed).toBe(false);
    const her = await run("check-subscription", post("check-subscription", HER, {}));
    expect(body(her).subscribed).toBe(true);
  });

  it("sync-subscription-status: the look-alike account is synced as not subscribed and never sees her customer", async () => {
    const r = await run("sync-subscription-status", post("sync-subscription-status", FAKE, {}));
    expect(body(r)).toMatchObject({ success: true, subscribed: false });
    expect(r.outbound.some((o) => o.body.includes("cus_HER"))).toBe(false);
    expect(stripeCalls("customers.list")).toEqual([]);
  });

  it("sync-subscription-status: the paying parent stays subscribed", async () => {
    const r = await run("sync-subscription-status", post("sync-subscription-status", HER, {}));
    expect(body(r)).toMatchObject({ success: true, subscribed: true });
  });

  it("create-checkout: the look-alike account's checkout never attaches to her customer, and her past trial still counts", async () => {
    edgeState().tables = { subscribers: [], access_code_redemptions: [] };
    const r = await run("create-checkout", post("create-checkout", FAKE, { plan: "monthly" }));
    expect(r.response.status).toBe(200);
    const created = stripeCalls("checkout.sessions.create")[0]?.args as { customer?: string; customer_email?: string; subscription_data: { trial_period_days?: number; metadata: Record<string, string> } };
    expect(created.customer).toBeUndefined();
    expect(created.customer_email).toBe(HER_EMAIL);
    expect(created.subscription_data.trial_period_days).toBeUndefined(); // one trial per person: the email may only take it away
    expect(created.subscription_data.metadata.user_id).toBe(FAKE);
  });

  it("create-checkout: a returning payer checks out on her own customer", async () => {
    edgeState().stripe!.subscriptions[0].status = "canceled";
    edgeState().tables = { subscribers: [{ subscribed: false, stripe_customer_id: "cus_HER" }], access_code_redemptions: [] };
    const r = await run("create-checkout", post("create-checkout", HER, { plan: "annual" }));
    expect(r.response.status).toBe(200);
    const created = stripeCalls("checkout.sessions.create")[0]?.args as { customer?: string; line_items: Array<{ price_data: { unit_amount: number } }> };
    expect(created.customer).toBe("cus_HER");
    expect(created.line_items[0].price_data.unit_amount).toBe(9900); // price unchanged
  });

  it("create-checkout: a brand-new parent still gets the 7-day trial", async () => {
    edgeState().tables = { subscribers: [], access_code_redemptions: [] };
    const r = await run("create-checkout", post("create-checkout", OTHER, { plan: "monthly" }));
    const created = stripeCalls("checkout.sessions.create")[0]?.args as { subscription_data: { trial_period_days?: number }; line_items: Array<{ price_data: { unit_amount: number } }> };
    expect(r.response.status).toBe(200);
    expect(created.subscription_data.trial_period_days).toBe(7);
    expect(created.line_items[0].price_data.unit_amount).toBe(1299);
  });
});
