// Guard (d10 audit, 23 Nov 2026): only our own sites may call the edge functions from a browser.
// Every function used to answer "Access-Control-Allow-Origin: *", so any website could make its
// visitors' browsers spend story, narration and image quota from thousands of addresses.
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { allowedOrigin, applyAllowedOrigin, withAllowedOrigin } from "../../../supabase/functions/_shared/allowedOrigin";

const root = join(__dirname, "../../..");
const fnRoot = join(root, "supabase/functions");
const fnDirs = readdirSync(fnRoot, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
  .map((d) => d.name);

const req = (origin?: string, method = "POST") =>
  new Request("https://example.test/functions/v1/x", { method, headers: origin ? { Origin: origin } : {} });
const wildcard = () =>
  new Response("{}", { status: 200, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type", "Content-Type": "application/json" } });

describe("which origins may call a function from a browser", () => {
  it("our site, its Lovable previews, the native shell and local development are allowed", () => {
    for (const o of [
      "https://time-2-read.com",
      "https://www.time-2-read.com",
      "https://time-2-read.lovable.app",
      "https://time2read.lovable.app",
      "https://preview--time-2-read.lovable.app",
      "https://id-preview--592147a7-1050-4b6c-af2b-895053e775df.lovable.app",
      "https://592147a7-1050-4b6c-af2b-895053e775df.lovableproject.com",
      "capacitor://localhost",
      "http://localhost:4173", // vite preview in the journey workflow
      "http://localhost:5173",
      "http://localhost:8080",
      "http://127.0.0.1:4173",
      "https://localhost",
    ]) expect(allowedOrigin(o), o).toBe(o);
  });

  it("every other site is refused, including look-alikes built to pass a loose match", () => {
    for (const o of [
      "https://evil.example",
      "https://time-2-read.com.evil.example",
      "https://eviltime-2-read.com",
      "http://time-2-read.com", // not https
      "https://time-2-read.com:8443",
      "https://someone-else.lovable.app",
      "https://time-2-read-copy.lovable.app",
      "https://preview--someone-else.lovable.app",
      "https://00000000-0000-0000-0000-000000000000.lovableproject.com",
      "https://localhost.evil.example",
      "http://localhost:4173.evil.example",
      "capacitor://evil.example",
      "null", // sandboxed iframe or file://
      "",
    ]) expect(allowedOrigin(o), o).toBeNull();
    expect(allowedOrigin(null)).toBeNull();
  });
});

describe("the header every response leaves with", () => {
  it("an allowed origin gets its own origin back, never a wildcard, and Vary: Origin", async () => {
    const res = applyAllowedOrigin(req("https://time-2-read.com"), wildcard());
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("https://time-2-read.com");
    expect(res.headers.get("Vary")).toBe("Origin");
    expect(res.headers.get("Access-Control-Allow-Headers")).toBe("authorization, apikey, content-type");
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("{}");
  });

  it("a stranger's site gets no Allow-Origin at all, whatever the function itself set", () => {
    const res = applyAllowedOrigin(req("https://evil.example"), wildcard());
    expect(res.headers.has("Access-Control-Allow-Origin")).toBe(false);
  });

  it("the preflight from a stranger's site is refused the same way, so the browser never sends the call", async () => {
    const handler = withAllowedOrigin(async () => new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*" } }));
    const refused = await handler(req("https://evil.example", "OPTIONS"), undefined);
    expect(refused.headers.has("Access-Control-Allow-Origin")).toBe(false);
    const ours = await handler(req("https://time-2-read.com", "OPTIONS"), undefined);
    expect(ours.status).toBe(204);
    expect(ours.headers.get("Access-Control-Allow-Origin")).toBe("https://time-2-read.com");
  });

  it("a call with no Origin (Stripe, curl, the keep-alive) is answered unchanged apart from the header", async () => {
    const res = applyAllowedOrigin(req(), new Response("ok", { status: 400, statusText: "Bad Request" }));
    expect(res.status).toBe(400);
    expect(res.statusText).toBe("Bad Request");
    expect(await res.text()).toBe("ok");
    expect(res.headers.has("Access-Control-Allow-Origin")).toBe(false);
  });

  it("an existing Vary is kept and Origin is added once", () => {
    const withVary = new Response("", { headers: { Vary: "Accept-Encoding" } });
    expect(applyAllowedOrigin(req("https://time-2-read.com"), withVary).headers.get("Vary")).toBe("Accept-Encoding, Origin");
    const already = new Response("", { headers: { Vary: "origin" } });
    expect(applyAllowedOrigin(req("https://time-2-read.com"), already).headers.get("Vary")).toBe("origin");
  });

  it("an error thrown by the function is not swallowed into a 200", async () => {
    const handler = withAllowedOrigin(async () => { throw new Error("boom"); });
    await expect(handler(req("https://time-2-read.com"), undefined)).rejects.toThrow("boom");
  });
});

describe("every function starts through the allowed-origin serve", () => {
  it("each function's index.ts imports serve from _shared/serve.ts, calls it once, and never Deno.serve or std serve", () => {
    expect(fnDirs.length).toBeGreaterThanOrEqual(40);
    const bad: string[] = [];
    for (const d of fnDirs) {
      const f = join(fnRoot, d, "index.ts");
      if (!existsSync(f)) { bad.push(`${d}: no index.ts`); continue; }
      const s = readFileSync(f, "utf8");
      if (!s.includes('import { serve } from "../_shared/serve.ts";')) bad.push(`${d}: serve not from _shared/serve.ts`);
      if (/deno\.land\/std@[^"']+\/http\/server\.ts/.test(s)) bad.push(`${d}: std serve`);
      if (/\bDeno\.serve\(/.test(s)) bad.push(`${d}: Deno.serve`);
      if ((s.match(/^serve\(/gm) ?? []).length !== 1) bad.push(`${d}: not exactly one top-level serve(`);
    }
    expect(bad).toEqual([]);
  });

  it("serve.ts sends every response through withAllowedOrigin", () => {
    const s = readFileSync(join(fnRoot, "_shared/serve.ts"), "utf8");
    expect(s).toMatch(/Deno\.serve\(withAllowedOrigin\(handler\)\)/);
  });

  it("no function's own code sets a wildcard origin any more", () => {
    const hits: string[] = [];
    for (const d of fnDirs) {
      for (const f of readdirSync(join(fnRoot, d), { recursive: true }) as string[]) {
        if (!/\.(ts|js)$/.test(f)) continue;
        if (/Access-Control-Allow-Origin['"]?\s*[:,]\s*['"]\*['"]/.test(readFileSync(join(fnRoot, d, f), "utf8"))) hits.push(`${d}/${f}`);
      }
    }
    expect(hits).toEqual([]);
  });
});

describe("after each deploy the live functions prove the allowlist (forms rule)", () => {
  const wf = readFileSync(join(root, ".github/workflows/deploy-functions.yml"), "utf8");

  it("every function's preflight from our site must come back with our origin, and the feedback form's real submission too", () => {
    const boot = wf.slice(wf.indexOf("name: Every function boots"), wf.indexOf("name: Strangers are refused"));
    expect(boot).toMatch(/grep -qi '\^access-control-allow-origin: https:\/\/time-2-read\.com' \/tmp\/pf\.h \|\| code="\$\{code\}-no-origin"/);
    const form = wf.slice(wf.indexOf("name: Feedback form delivers"), wf.indexOf("name: Retired functions"));
    expect(form).toContain('-H "Origin: https://time-2-read.com"');
    expect(form).toMatch(/grep -qi '\^access-control-allow-origin: https:\/\/time-2-read\.com' \/tmp\/fb\.h \|\| code=/);
  });

  it("a stranger's preflight is probed on a function that exists, and any Allow-Origin fails the deploy", () => {
    const m = wf.match(/OPTIONS "\$BASE_URL\/([a-z0-9-]+)" \\\n\s+-H "Origin: https:\/\/evil\.example"/);
    expect(m?.[1]).toBeTruthy();
    expect(fnDirs).toContain(m![1]);
    expect(wf).toMatch(/if grep -qi '\^access-control-allow-origin:' \/tmp\/pf\.h; then echo "::error::[^"]*stranger's origin"; exit 1; fi/);
  });
});
