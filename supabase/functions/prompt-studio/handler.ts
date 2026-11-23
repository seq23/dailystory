// prompt-studio: the admin image-prompt workbench behind /prompt-studio (23 Nov 2026).
// Every call spends Runware quota, so only an admin (ADMIN_USER_IDS, the same list
// AdminOnly and voice-overrides-admin use) gets past the gate; everyone else is refused
// before any socket is opened or any paid call is made. Browsers cannot set headers on
// a WebSocket, so the page sends its session token as ?jwt= (Supabase's documented
// pattern; verify_jwt = false in config.toml, this gate is the check).
// Pure (deps injected): guard src/test/guards/caller-check.test.ts.
import { adminOrCronRefusal, json, type GetUser } from "../_shared/callerCheck.ts";

export const MAX_BATCH = 8;
export const MAX_SIDE = 1536;

export interface GenerateParams {
  width?: number;
  height?: number;
  cfgScale?: number;
  steps?: number;
  model?: string;
  outputFormat?: string;
  seed?: number;
}

export interface PromptStudioRequest {
  type?: "generate" | "batch" | "analyze";
  positivePrompt?: unknown;
  negativePrompt?: unknown;
  parameters?: GenerateParams;
  batchCount?: unknown;
  enhancementLevel?: string;
}

export type GenerateResult = { success: true; imageURL: string; cost: number; seed?: number } | { success: false; error: string };

export interface PromptStudioDeps {
  adminIds: string[];
  getUser: GetUser;
  /** Opens the WebSocket (Deno.upgradeWebSocket) and wires its messages to runRequest. */
  upgrade: (req: Request) => Response;
  /** One paid Runware image. */
  generate: (prompt: string, negative: string, params: GenerateParams) => Promise<GenerateResult>;
  paidConfigured: boolean;
}

/** The gate: null = an admin; otherwise the refusal to return. Reads Authorization or ?jwt=. */
export async function promptStudioRefusal(req: Request, deps: Pick<PromptStudioDeps, "adminIds" | "getUser">, cors: Record<string, string>): Promise<Response | null> {
  const fromQuery = new URL(req.url).searchParams.get("jwt") ?? "";
  const authorization = req.headers.get("Authorization") || (fromQuery ? `Bearer ${fromQuery}` : "");
  const probe = new Request(req.url, { headers: authorization ? { Authorization: authorization } : {} });
  const auth = await adminOrCronRefusal(probe, { adminIds: deps.adminIds, getUser: deps.getUser, cors });
  return auth.refused;
}

export function enhancePrompt(prompt: string, level = "standard") {
  const enhancedPrompt = `Children's book illustration: ${prompt}. Bright, colorful, safe for children, professional illustration style, consistent character appearance`;
  return {
    enhancedPrompt,
    analysis: {
      originalLength: prompt.length,
      enhancedLength: enhancedPrompt.length,
      optimizations: ["Children book styling", "Safety guidelines", "Professional quality"],
      strategy: level,
    },
  };
}

const clampSide = (n: unknown) => (Number.isFinite(n) ? Math.min(Math.max(Math.round(n as number), 256), MAX_SIDE) : 1024);

/** One request from an admin (over the socket or HTTP); `send` receives each reply. */
export async function runRequest(r: PromptStudioRequest, deps: Pick<PromptStudioDeps, "generate">, send: (m: unknown) => void): Promise<void> {
  const prompt = typeof r.positivePrompt === "string" ? r.positivePrompt.slice(0, 2000) : "";
  if (!prompt.trim()) return send({ success: false, error: "positivePrompt is required" });
  const negative = typeof r.negativePrompt === "string" ? r.negativePrompt.slice(0, 2000) : "";
  const p = r.parameters ?? {};
  const params: GenerateParams = { ...p, width: clampSide(p.width), height: clampSide(p.height) };
  const { enhancedPrompt, analysis } = enhancePrompt(prompt, r.enhancementLevel);

  if (r.type === "analyze") return send({ success: true, enhancedPrompt, analysis });
  if (r.type === "batch") {
    const n = Math.min(Math.max(Math.trunc(Number(r.batchCount) || 4), 1), MAX_BATCH);
    const urls: string[] = [];
    const { seed: _fixed, ...fresh } = params; // a new seed for each picture
    for (let i = 0; i < n; i++) {
      const res = await deps.generate(enhancedPrompt, negative, fresh);
      if (res.success) urls.push(res.imageURL);
      send({ type: "progress", completed: i + 1, total: n, currentImage: res.success ? res.imageURL : null });
    }
    return send({ success: true, imageURLs: urls, type: "batch_complete" });
  }
  const res = await deps.generate(enhancedPrompt, negative, params);
  send({ ...res, enhancedPrompt, analysis });
}

export async function handlePromptStudio(req: Request, deps: PromptStudioDeps, cors: Record<string, string>): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const refused = await promptStudioRefusal(req, deps, cors);
  if (refused) return refused;
  if (!deps.paidConfigured) {
    const stop = "NAMED STOP RUNWARE_API_KEY: not set on the project; nothing is generated.";
    console.error(`[prompt-studio] ${stop}`);
    return json(503, { error: "not configured", stop }, cors);
  }
  if ((req.headers.get("upgrade") || "").toLowerCase() === "websocket") return deps.upgrade(req);
  if (req.method !== "POST") return json(405, { error: "POST only" }, cors);
  const raw = await req.text().catch(() => "");
  if (raw.length > 32 * 1024) return json(413, { error: "Request too large" }, cors);
  let body: PromptStudioRequest;
  try { body = JSON.parse(raw); } catch { return json(400, { error: "Invalid JSON" }, cors); }
  const replies: unknown[] = [];
  await runRequest(body, deps, (m) => replies.push(m));
  return json(200, replies.length === 1 ? replies[0] : replies, cors);
}
