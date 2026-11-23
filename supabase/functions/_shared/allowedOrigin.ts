// Which websites may call these functions from a browser (d10 audit, 23 Nov 2026).
//
// Every function answered "Access-Control-Allow-Origin: *", so any website could make its
// visitors' browsers call story generation, narration or images with the public anon key:
// paid quota spent from thousands of addresses, round every per-address limit. Each function
// now starts through `serve` (./serve.ts), which sets the header to the caller's origin only when that
// origin is ours, and removes it otherwise, whatever the function itself put there. A request
// with no Origin (curl, Stripe, GitHub Actions, the keep-alive) is not a browser call and is
// answered as before, without the header.
//
// Guard: src/test/guards/allowed-origin.test.ts (the list, the header rewrite, and that every
// function starts through this serve).

const LOVABLE_PROJECT = "592147a7-1050-4b6c-af2b-895053e775df";

export const ALLOWED_ORIGINS: readonly RegExp[] = [
  /^https:\/\/(www\.)?time-2-read\.com$/, // the site
  // Lovable: the published preview, the editor's preview and the project host (the Capacitor
  // shell in capacitor.config.ts loads this one).
  new RegExp(`^https://((id-)?preview--)?(time-2-read|time2read|${LOVABLE_PROJECT})\\.lovable\\.app$`),
  new RegExp(`^https://(id-preview--)?${LOVABLE_PROJECT}\\.lovableproject\\.com$`),
  // A native shell and local development, any port (vite dev 5173/8080, vite preview 4173 in CI).
  /^capacitor:\/\/localhost$/,
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d{1,5})?$/,
];

export function allowedOrigin(origin: string | null): string | null {
  if (!origin) return null;
  return ALLOWED_ORIGINS.some((re) => re.test(origin)) ? origin : null;
}

export function applyAllowedOrigin(req: Request, res: Response): Response {
  if (res.status === 101) return res; // a WebSocket upgrade cannot be rebuilt, and has no CORS
  const headers = new Headers(res.headers);
  const origin = allowedOrigin(req.headers.get("Origin"));
  if (origin) headers.set("Access-Control-Allow-Origin", origin);
  else headers.delete("Access-Control-Allow-Origin");
  const vary = (headers.get("Vary") ?? "").split(",").map((v) => v.trim()).filter(Boolean);
  if (!vary.some((v) => v.toLowerCase() === "origin")) headers.set("Vary", [...vary, "Origin"].join(", "));
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

export type Handler<I> = (req: Request, info: I) => Response | Promise<Response>;

export function withAllowedOrigin<I>(handler: Handler<I>): Handler<I> {
  return async (req, info) => applyAllowedOrigin(req, await handler(req, info));
}
