// Runs a real edge function (supabase/functions/<name>/index.ts) inside vitest: Deno.env and
// Deno.serve are stood in, URL imports map to ./stub-*.ts (vitest.config.ts), and every
// outbound fetch and every log line is recorded. Used by the real-path privacy tests.
import { vi } from "vitest";
import { edgeState } from "./state";

export interface Outbound { url: string; body: string }
export type AiMode = "fail" | "echo";

const AI_HOSTS = /openrouter\.ai|api\.cloudflare\.com|api\.openai\.com|ai\.gateway\.lovable\.dev/;
export const isAiUrl = (url: string) => AI_HOSTS.test(url);

const lastUserText = (body: string): string => {
  try {
    const messages = JSON.parse(body)?.messages ?? [];
    const users = messages.filter((m: { role?: string }) => m?.role === "user");
    return String(users[users.length - 1]?.content ?? "");
  } catch {
    return "";
  }
};

export interface Run {
  outbound: Outbound[];
  logs: string[];
  response: Response;
  text: string;
}

/** A JWT-shaped token with this role (the functions read the role claim before verifying). */
export function tokenFor(role: "authenticated" | "anon", sub = "user-1"): string {
  const enc = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");
  return `${enc({ alg: "HS256", typ: "JWT" })}.${enc({ role, sub })}.sig`;
}

export const ENV: Record<string, string> = {
  SUPABASE_URL: "https://project.supabase.test",
  SUPABASE_ANON_KEY: tokenFor("anon", "anon"),
  SUPABASE_SERVICE_ROLE_KEY: "service-role-test-key",
  OPENROUTER_API_KEY: "or-test",
  CLOUDFLARE_WORKERS_AI_TOKEN: "cf-test",
  CLOUDFLARE_ACCOUNT_ID: "cf-account",
  OPENAI_API_KEY: "oa-test",
  LOVABLE_API_KEY: "lv-test",
  RUNWARE_API_KEY: "rw-test",
};

/** Answers a non-AI request (REST, auth, RPC) in a test; undefined = the default empty answer. */
export type Route = (url: string, init?: RequestInit) => Response | Promise<Response> | undefined;

/** Load the function fresh and call it once with this request. */
export async function runFunction(name: string, req: Request, mode: AiMode, route?: Route): Promise<Run> {
  const state = edgeState();
  const outbound: Outbound[] = [];
  const logs: string[] = [];

  // Logs: every console line the function writes.
  const sink = (level: string) => (...args: unknown[]) => {
    logs.push(`${level} ${args.map((a) => (typeof a === "string" ? a : a instanceof Error ? String(a.stack ?? a.message) : safeJson(a))).join(" ")}`);
  };
  for (const level of ["log", "info", "warn", "error", "debug"] as const) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (console as any)[level] = sink(level);
  }

  vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const body = typeof init?.body === "string" ? init.body : init?.body ? "[non-string body]" : "";
    outbound.push({ url, body });
    if (isAiUrl(url)) {
      if (mode === "fail") return new Response("upstream down", { status: 503 });
      const content = lastUserText(body) || "ok";
      return new Response(JSON.stringify({ choices: [{ message: { role: "assistant", content }, finish_reason: "stop" }], usage: { prompt_tokens: 1, completion_tokens: 1 } }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    const routed = route ? await route(url, init) : undefined;
    if (routed) return routed;
    return new Response(JSON.stringify({ data: [] }), { status: 200, headers: { "Content-Type": "application/json" } });
  }));

  vi.stubGlobal("Deno", {
    env: { get: (k: string) => state.env[k], toObject: () => ({ ...state.env }) },
    serve: (h: (req: Request) => Response | Promise<Response>) => { state.handler = h; },
  });
  state.handler = null;
  vi.resetModules();
  await import(/* @vite-ignore */ `../../../supabase/functions/${name}/index.ts`);
  if (!state.handler) throw new Error(`${name} registered no handler`);
  const response = await state.handler(req);
  const text = await response.clone().text();
  // Fire-and-forget work (cost logs, cache writes) gets a moment to log too.
  await new Promise((r) => setTimeout(r, 20));
  return { outbound, logs, response, text };
}

function safeJson(v: unknown): string {
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

/** Every place in a run a name was found: outbound AI or other requests, and log lines. */
export function leaks(run: Run, names: string[]): string[] {
  const found: string[] = [];
  for (const n of names) {
    // A plain substring, case-insensitive: JSON escapes ("\\nQuillon") must not hide a name.
    const re = new RegExp(n, "i");
    for (const o of run.outbound) if (re.test(o.url) || re.test(o.body)) found.push(`${n} → ${o.url}`);
    for (const l of run.logs) if (re.test(l)) found.push(`${n} → log: ${l.slice(0, 160)}`);
  }
  return found;
}
