// School children's text goes only to AI routes that neither train on it nor keep it
// (Phase 8, approved 26 Oct 2026; built 31 Oct 2026).
//
// "school" lane: the signed-in account belongs to an institution (teacher or school
// admin), owns an app profile linked to a school roster child, or the request names a
// linked child profile. Decided by the database (public.institution_ai_lane, migration
// 20261031210000_institution_app_reading.sql), never by a flag the browser sends.
// "family" lane: everything else, routed exactly as before.
//
// Fail closed: a signed-in caller whose identity or institution status cannot be
// confirmed is treated as "school". A school request that no school-safe route answers
// gets the caller's backup content (Backup Mode stories, built-in quiz/definition),
// never a free or training route.
//
// Which routes are school-safe, and why: config/product_inference.json
// paid_lanes[product-inference].text_chain.school_lane. Guard:
// src/test/guards/school-privacy-lane.test.ts.
//
// Names (22 Nov 2026, R-KID-01): the same per-request context carries every name that must
// not leave in clear: the names in the request body, the names the browser holds for the
// reader (body.readerNames, added by src/lib/readerNames.ts), and, for a verified account, the account's
// own display name and every child profile on it (a sibling typed into a request is one of
// them). storyTextProvider.ts masks all of them on every tier. A forged name only adds a
// mask to the caller's own request; it can never remove one.
import { AsyncLocalStorage } from "node:async_hooks";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4?target=deno";
import { expandNames, genderOf, namesFromCharacterInfo, type PrivateName } from "./deidentify.ts";

export type PrivacyLane = "family" | "school";

export interface RequestPrivacy {
  lane: PrivacyLane;
  /** Names masked in every model request made while serving this request. */
  names: PrivateName[];
}

// One store per process, even when a bundle holds two copies of this module: the log wrapper
// below reads it, and a second store would leave its requests' names unredacted.
const STORE = Symbol.for("t2r.requestPrivacy");
// deno-lint-ignore no-explicit-any
const privacyStore: AsyncLocalStorage<RequestPrivacy> = ((globalThis as any)[STORE] ??= new AsyncLocalStorage<RequestPrivacy>());

/** Run fn with every chatCompletionWithFallback call inside it on this lane, masking these names. */
export function withPrivacy<T>(privacy: RequestPrivacy, fn: () => T): T {
  return privacyStore.run(privacy, fn);
}

/** The lane of the request being served, when one was set. */
export function currentPrivacyLane(): PrivacyLane | undefined {
  return privacyStore.getStore()?.lane;
}

/** The names of the request being served (none outside a request). */
export function currentPrivateNames(): PrivateName[] {
  return privacyStore.getStore()?.names ?? [];
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The text with every one of the names (and each 3+ letter part) replaced by "[name]". */
export function redactNames(text: string, names: PrivateName[]): string {
  let out = text;
  for (const n of expandNames(names)) {
    out = out.replace(new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(n)}(?![\\p{L}\\p{N}])`, "giu"), "[name]");
  }
  return out;
}

// Every log line written while a request is served has that request's names removed, so no
// debug line (a prompt, a story, a model's answer) puts a child's name in the function logs.
// One wrapper, installed once by every function that imports this module.
const LOG_REDACTION = Symbol.for("t2r.logRedaction");
function redactArg(arg: unknown, names: PrivateName[], seen = new WeakSet<object>(), depth = 0): unknown {
  if (typeof arg === "string") return redactNames(arg, names);
  if (arg instanceof Error) {
    const text = String(arg.stack ?? `${arg.name}: ${arg.message}`);
    const clean = redactNames(text, names);
    return clean === text ? arg : clean;
  }
  if (!arg || typeof arg !== "object") return arg;
  // Strings inside objects are redacted where they are, before any JSON escaping can hide a name.
  if (seen.has(arg) || depth > 8) return "[…]";
  seen.add(arg);
  if (Array.isArray(arg)) return arg.map((v) => redactArg(v, names, seen, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(arg)) out[redactNames(k, names)] = redactArg(v, names, seen, depth + 1);
  return out;
}
export function installLogRedaction(target: Console = console): void {
  // deno-lint-ignore no-explicit-any
  const t = target as any;
  if (t[LOG_REDACTION]) return;
  t[LOG_REDACTION] = true;
  for (const level of ["log", "info", "warn", "error", "debug"] as const) {
    const original = t[level]?.bind(target);
    if (!original) continue;
    t[level] = (...args: unknown[]) => {
      const names = currentPrivateNames();
      original(...(names.length ? args.map((a) => redactArg(a, names)) : args));
    };
  }
}
installLogRedaction();

const MAX_NAMES = 20;
const MAX_NAME_CHARS = 60;

const cleanName = (v: unknown): string | null => {
  if (typeof v !== "string") return null;
  const n = v.trim().slice(0, MAX_NAME_CHARS);
  return n.length >= 2 ? n : null;
};

/** Names a request body carries for the reader (the child's name, display name, family names). */
export function namesInBody(body: unknown): PrivateName[] {
  // deno-lint-ignore no-explicit-any
  const b = (body ?? {}) as any;
  const out: PrivateName[] = [];
  // deno-lint-ignore no-explicit-any
  const from = (o: any) => {
    if (!o || typeof o !== "object") return;
    const gender = genderOf(o.gender ?? o.avatarType ?? o.avatar?.type);
    for (const k of ["name", "childName", "displayName", "display_name"]) {
      const n = cleanName(o[k]);
      if (n) out.push({ name: n, gender });
    }
    for (const k of ["parentName", "siblingName"]) {
      const n = cleanName(o[k]);
      if (n) out.push({ name: n });
    }
  };
  from({ childName: b.childName, displayName: b.displayName, gender: b.gender });
  from(b.userInfo);
  from(b.config?.userInfo);
  from(b.characterInfo);
  // The story bundle carries the reader in a "Character Info: {...}" block.
  if (typeof b.bundle?.storyContent === "string") out.push(...namesFromCharacterInfo(b.bundle.storyContent));
  if (Array.isArray(b.readerNames)) {
    for (const v of b.readerNames.slice(0, MAX_NAMES)) {
      const n = cleanName(v);
      if (n) out.push({ name: n });
    }
  }
  return out;
}

/** True when the word is one of the names, or one part of a multi-part name (case-insensitive). */
export function isNameOf(word: string, names: PrivateName[]): boolean {
  const w = word.trim().toLowerCase();
  if (w.length < 2) return false;
  return names.some(({ name }) => {
    const n = name.trim().toLowerCase();
    return n === w || n.split(/\s+/).includes(w);
  });
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A child profile id from a request body, when it is a real UUID (anything else is ignored). */
export function childProfileIdOf(body: unknown): string | null {
  // deno-lint-ignore no-explicit-any
  const b = (body ?? {}) as any;
  const candidates = [
    b.childProfileId, b.child_profile_id, b.childId,
    b.userInfo?.childProfileId, b.userInfo?.childId,
    b.config?.userInfo?.childProfileId, b.config?.userInfo?.childId,
  ];
  for (const c of candidates) if (typeof c === "string" && UUID.test(c)) return c;
  return null;
}

/** The JWT's role claim without verifying it (verification happens next, by Supabase Auth). */
export function jwtRole(token: string): string | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(part.length / 4) * 4, "="));
    const role = JSON.parse(json)?.role;
    return typeof role === "string" ? role : null;
  } catch {
    return null;
  }
}

export interface LaneDeps {
  /** Verified user id for the token, or throws. */
  verifyUser: (token: string) => Promise<string>;
  /** public.institution_ai_lane(p_user, p_child), or throws. */
  laneOf: (userId: string, childProfileId: string | null) => Promise<string>;
  /** The account's own display name and every child profile's display name, or throws. */
  namesOf: (userId: string) => Promise<string[]>;
}

/**
 * The privacy of one request. No token, or the project's anon key (a guest), is the
 * family lane: a guest has no school record. A signed-in token is verified and looked
 * up; any failure on that path (token, lane or names) is the school lane, which only
 * uses routes that neither train on nor keep text. The body's names (and readerNames) are
 * masked whatever happens.
 */
export async function resolvePrivacy(
  authorization: string | null | undefined,
  body: unknown,
  deps: LaneDeps,
): Promise<RequestPrivacy> {
  const childProfileId = childProfileIdOf(body);
  const given = namesInBody(body);
  const token = (authorization ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!token || jwtRole(token) === "anon") return { lane: childProfileId ? "school" : "family", names: given };
  try {
    const userId = await deps.verifyUser(token);
    const [lane, accountNames] = await Promise.all([deps.laneOf(userId, childProfileId), deps.namesOf(userId)]);
    const names = [...given, ...accountNames.slice(0, 200).map(cleanName).filter((n): n is string => !!n).map((name) => ({ name }))];
    return { lane: lane === "family" ? "family" : "school", names };
  } catch (e) {
    console.warn("privacy lane: could not confirm the account, using the school lane", e instanceof Error ? e.message : String(e));
    return { lane: "school", names: given };
  }
}

/** The production dependencies: Supabase Auth and the service-role-only lane RPC. */
export async function supabaseLaneDeps(): Promise<LaneDeps> {
  // deno-lint-ignore no-explicit-any
  const env = (n: string) => (globalThis as any).Deno?.env.get(n) as string | undefined;
  const url = env("SUPABASE_URL");
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing");
  const client = createClient(url, key, { auth: { persistSession: false } });
  return {
    verifyUser: async (token) => {
      const { data, error } = await client.auth.getUser(token);
      if (error || !data?.user?.id) throw new Error(error?.message ?? "no user for token");
      return data.user.id;
    },
    laneOf: async (userId, childProfileId) => {
      const { data, error } = await client.rpc("institution_ai_lane", { p_user: userId, p_child: childProfileId });
      if (error) throw new Error(error.message);
      return String(data);
    },
    namesOf: async (userId) => {
      const [own, kids] = await Promise.all([
        client.from("profiles").select("display_name").eq("user_id", userId),
        client.from("child_profiles").select("display_name").eq("parent_user_id", userId),
      ]);
      if (own.error || kids.error) throw new Error((own.error ?? kids.error).message);
      // deno-lint-ignore no-explicit-any
      return [...(own.data ?? []), ...(kids.data ?? [])].map((r: any) => r?.display_name).filter((n: unknown): n is string => typeof n === "string");
    },
  };
}

/** The privacy for an incoming edge request (production wiring; fails closed). */
export async function privacyForRequest(req: Request, body: unknown): Promise<RequestPrivacy> {
  const auth = req.headers.get("Authorization");
  let deps: LaneDeps;
  try {
    deps = await supabaseLaneDeps();
  } catch (e) {
    // Without the database we cannot tell a school child from a family one.
    const names = namesInBody(body);
    const token = (auth ?? "").replace(/^Bearer\s+/i, "").trim();
    if (!childProfileIdOf(body) && (!token || jwtRole(token) === "anon")) return { lane: "family", names };
    console.warn("privacy lane: no database client, using the school lane", e instanceof Error ? e.message : String(e));
    return { lane: "school", names };
  }
  return resolvePrivacy(auth, body, deps);
}
