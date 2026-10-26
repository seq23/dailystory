// A small in-memory Supabase for Playwright: auth, PostgREST tables and edge
// functions are answered from fixtures, so signed-in screens can be tested over
// the local build without touching production. Nothing here reaches the network.
import type { Page, Route } from "@playwright/test";

export const SUPABASE_HOST = "https://cpzeuogomaixamrtnnmj.supabase.co";
export const STORAGE_KEY = "sb-cpzeuogomaixamrtnnmj-auth-token";

type Row = Record<string, any>;

export interface MockState {
  user: Row | null;
  tables: Record<string, Row[]>;
  accessCodes: Record<string, number>;
  calls: { fn: string; body: any }[];
  story?: Row;
}

const b64url = (o: unknown) =>
  Buffer.from(JSON.stringify(o)).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");

export function fakeJwt(sub: string, email: string) {
  const now = Math.floor(Date.now() / 1000);
  return `${b64url({ alg: "HS256", typ: "JWT" })}.${b64url({ sub, email, role: "authenticated", aud: "authenticated", exp: now + 3600, iat: now })}.c2ln`;
}

export function makeUser(email = "parent@example.test", meta: Row = {}): Row {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    aud: "authenticated",
    role: "authenticated",
    email,
    email_confirmed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    app_metadata: { provider: "email" },
    user_metadata: { display_name: "Sam Parent", ...meta },
  };
}

function session(user: Row) {
  const now = Math.floor(Date.now() / 1000);
  return {
    access_token: fakeJwt(user.id, user.email),
    token_type: "bearer",
    expires_in: 3600,
    expires_at: now + 3600,
    refresh_token: "refresh-fake",
    user,
  };
}

/** Seed a signed-in session before the page loads. */
export async function signInAs(page: Page, user: Row) {
  await page.addInitScript(
    ([key, value]) => {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        /* storage blocked */
      }
    },
    [STORAGE_KEY, JSON.stringify(session(user))] as const,
  );
}

function uuid() {
  const h = () => Math.floor(Math.random() * 16).toString(16);
  return "xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx".replace(/x/g, h);
}

function matches(row: Row, params: URLSearchParams) {
  for (const [k, v] of params.entries()) {
    if (["select", "order", "limit", "offset", "on_conflict", "columns"].includes(k)) continue;
    const m = /^(eq|neq|gte|lte|gt|lt|is|in)\.(.*)$/.exec(v);
    if (!m) continue;
    const [, op, raw] = m;
    const val = row[k];
    if (op === "eq" && String(val) !== raw) return false;
    if (op === "neq" && String(val) === raw) return false;
    if (op === "is" && raw === "null" && val != null) return false;
    if (op === "in" && !raw.replace(/[()]/g, "").split(",").includes(String(val))) return false;
  }
  return true;
}

const json = (route: Route, body: unknown, status = 200, headers: Record<string, string> = {}) =>
  route.fulfill({
    status,
    contentType: "application/json",
    headers: { "access-control-allow-origin": "*", "access-control-expose-headers": "content-range", ...headers },
    body: body === undefined ? "" : JSON.stringify(body),
  });

export async function mockSupabase(page: Page, init: Partial<MockState> = {}): Promise<MockState> {
  const state: MockState = {
    user: init.user ?? null,
    tables: { subscribers: [], user_preferences: [], child_profiles: [], profiles: [], saved_stories: [], ...(init.tables ?? {}) },
    accessCodes: init.accessCodes ?? { HOMESCHOOL15: 15 },
    calls: [],
    story: init.story,
  };
  const table = (name: string) => (state.tables[name] ??= []);

  const premiumFor = (userId: string) => {
    const s = table("subscribers").find((r) => r.user_id === userId);
    const now = Date.now();
    return !!s && ((s.subscribed && (!s.subscription_end || Date.parse(s.subscription_end) > now)) || (s.override_premium && (!s.override_end || Date.parse(s.override_end) > now)));
  };

  await page.route(`${SUPABASE_HOST}/**`, async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname;
    const method = req.method();
    if (method === "OPTIONS") return route.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" } });
    let body: any = null;
    try {
      body = req.postData() ? JSON.parse(req.postData()!) : null;
    } catch {
      body = null;
    }

    // ---- auth
    if (path.startsWith("/auth/v1/")) {
      if (path === "/auth/v1/signup") {
        state.user = makeUser(body?.email, body?.data ?? {});
        return json(route, session(state.user));
      }
      if (path === "/auth/v1/token") {
        if (!state.user) state.user = makeUser(body?.email);
        return json(route, session(state.user));
      }
      if (path === "/auth/v1/user") {
        if (!state.user) return json(route, { message: "no user" }, 401);
        if (method === "PUT") state.user.user_metadata = { ...state.user.user_metadata, ...(body?.data ?? {}) };
        return json(route, state.user);
      }
      if (path === "/auth/v1/logout") {
        state.user = null;
        return route.fulfill({ status: 204, headers: { "access-control-allow-origin": "*" } });
      }
      return json(route, {});
    }

    // ---- edge functions
    if (path.startsWith("/functions/v1/")) {
      const fn = path.slice("/functions/v1/".length);
      state.calls.push({ fn, body });
      const uid = state.user?.id;
      if (fn === "validate-discount-code") {
        const code = String(body?.code ?? "").replace(/\s+/g, "").toUpperCase();
        const days = state.accessCodes[code];
        if (days) return json(route, { valid: true, kind: "trial", trialDays: days, message: `Code accepted: ${days} days` });
        return json(route, { valid: false, message: "Invalid or expired discount code" }, 400);
      }
      if (fn === "redeem-access-code") {
        if (!uid) return json(route, { activated: false, error: "NOT_SIGNED_IN", message: "Please sign in." }, 401);
        const code = String(body?.accessCode ?? state.user?.user_metadata?.access_code ?? "").replace(/\s+/g, "").toUpperCase();
        const days = state.accessCodes[code];
        if (!days) return json(route, { activated: false, error: "INVALID_ACCESS_CODE", message: "That code didn't work. Check the spelling." }, 400);
        const until = new Date(Date.now() + days * 86400000).toISOString();
        const subs = table("subscribers");
        const existing = subs.find((r) => r.user_id === uid);
        const patch = { user_id: uid, email: state.user!.email, override_premium: true, override_end: until, override_reason: `Access code: ${code}`, subscription_tier: "premium" };
        if (existing) Object.assign(existing, patch);
        else subs.push({ subscribed: false, subscription_end: null, ...patch });
        return json(route, { activated: true, code, trial_days: days, premium_until: until, message: `Code accepted. Premium is on for ${days} days.` });
      }
      if (fn === "check-subscription") {
        const s = table("subscribers").find((r) => r.user_id === uid);
        const active = uid ? premiumFor(uid) : false;
        return json(route, { subscribed: active, subscription_tier: s?.subscription_tier ?? null, subscription_end: s?.subscription_end ?? null, via_code: !!s?.override_premium, premium_until: s?.override_end ?? null });
      }
      if (fn === "generate-adaptive-story" && state.story) return json(route, state.story);
      if (fn === "create-checkout") return json(route, { url: "https://checkout.example.test/session" });
      return json(route, {});
    }

    // ---- PostgREST
    if (path.startsWith("/rest/v1/rpc/")) return json(route, null);
    if (path.startsWith("/rest/v1/")) {
      const name = path.slice("/rest/v1/".length);
      const rows = table(name);
      const params = url.searchParams;
      const wantsObject = (req.headers()["accept"] ?? "").includes("vnd.pgrst.object");
      const prefer = req.headers()["prefer"] ?? "";
      const returnRows = (list: Row[]) => {
        if (wantsObject) return list.length === 1 ? json(route, list[0]) : json(route, { code: "PGRST116", message: "0 rows" }, 406);
        if (!prefer.includes("return=representation") && method !== "GET") return route.fulfill({ status: method === "POST" ? 201 : 204, headers: { "access-control-allow-origin": "*" } });
        return json(route, list, 200, { "content-range": `0-${Math.max(0, list.length - 1)}/${list.length}` });
      };
      if (method === "GET" || method === "HEAD") {
        let list = rows.filter((r) => matches(r, params));
        const order = params.get("order");
        if (order) {
          const [col, dir] = order.split(".");
          list = [...list].sort((a, b) => (String(a[col]) < String(b[col]) ? -1 : 1) * (dir === "desc" ? -1 : 1));
        }
        const limit = params.get("limit");
        if (limit) list = list.slice(0, Number(limit));
        if (wantsObject) return list.length === 1 ? json(route, list[0]) : json(route, { code: "PGRST116", message: "0 rows" }, 406);
        return json(route, list, 200, { "content-range": `0-${Math.max(0, list.length - 1)}/${list.length}` });
      }
      if (method === "POST") {
        const items: Row[] = Array.isArray(body) ? body : [body];
        const conflict = params.get("on_conflict");
        const out: Row[] = [];
        // Unique keys the real schema has (a duplicate insert is a 409, as in Postgres).
        const UNIQUE: Record<string, string> = { user_preferences: "user_id", subscribers: "email" };
        for (const item of items) {
          const key = conflict ?? (prefer.includes("merge-duplicates") ? "id" : null);
          const uniq = UNIQUE[name];
          if (!key && uniq && item[uniq] != null && rows.some((r) => r[uniq] === item[uniq])) {
            return json(route, { code: "23505", message: `duplicate key value violates unique constraint "${name}_${uniq}_key"` }, 409);
          }
          const hit = key ? rows.find((r) => item[key] != null && r[key] === item[key]) : null;
          if (hit) {
            Object.assign(hit, item, { updated_at: new Date().toISOString() });
            out.push(hit);
          } else {
            const row = { id: uuid(), created_at: new Date(Date.now() + rows.length).toISOString(), updated_at: new Date().toISOString(), ...item };
            rows.push(row);
            out.push(row);
          }
        }
        return returnRows(out);
      }
      if (method === "PATCH") {
        const hit = rows.filter((r) => matches(r, params));
        hit.forEach((r) => Object.assign(r, body, { updated_at: new Date().toISOString() }));
        return returnRows(hit);
      }
      if (method === "DELETE") {
        const keep = rows.filter((r) => !matches(r, params));
        const gone = rows.filter((r) => matches(r, params));
        state.tables[name] = keep;
        return returnRows(gone);
      }
    }
    return json(route, {});
  });

  // Third-party calls (analytics, fonts, images) never leave the machine either.
  await page.route(/^https?:\/\/(?!localhost|127\.0\.0\.1)/, (route) => {
    if (route.request().url().startsWith(SUPABASE_HOST)) return route.fallback();
    return route.fulfill({ status: 204, body: "" });
  });

  return state;
}
