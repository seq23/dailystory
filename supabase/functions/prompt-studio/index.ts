// prompt-studio: admin-only image-prompt workbench (/prompt-studio). Rules: ./handler.ts.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4?target=deno";
import { adminIdsFrom } from "../_shared/callerCheck.ts";
import { handlePromptStudio, runRequest, type GenerateParams, type GenerateResult } from "./handler.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const runwareKey = Deno.env.get("RUNWARE_API_KEY") ?? "";

/** One image over Runware's WebSocket API; 30 s timeout. */
function generate(prompt: string, negative: string, p: GenerateParams): Promise<GenerateResult> {
  return new Promise((resolve) => {
    let done = false;
    const finish = (r: GenerateResult) => { if (!done) { done = true; clearTimeout(timer); try { ws.close(); } catch { /* closed */ } resolve(r); } };
    const ws = new WebSocket("wss://ws-api.runware.ai/v1");
    const timer = setTimeout(() => finish({ success: false, error: "Generation timeout" }), 30000);
    ws.onopen = () => ws.send(JSON.stringify([{ taskType: "authentication", apiKey: runwareKey }]));
    ws.onmessage = (event) => {
      try {
        for (const item of JSON.parse(String(event.data)).data ?? []) {
          if (item.taskType === "authentication") {
            ws.send(JSON.stringify([{
              taskType: "imageInference",
              taskUUID: crypto.randomUUID(),
              positivePrompt: prompt,
              negativePrompt: negative,
              model: p.model || "runware:100@1",
              width: p.width,
              height: p.height,
              numberResults: 1,
              outputFormat: p.outputFormat || "WEBP",
              CFGScale: p.cfgScale || 8,
              scheduler: "FlowMatchEulerDiscreteScheduler",
              steps: p.steps || 25,
              ...(p.seed ? { seed: p.seed } : {}),
            }]));
          } else if (item.taskType === "imageInference") {
            finish({ success: true, imageURL: item.imageURL, cost: item.cost || 0.002, seed: item.seed });
          }
        }
      } catch (e) {
        console.error(`[prompt-studio] RUNWARE_MESSAGE_UNREADABLE: ${e instanceof Error ? e.message : e}`);
      }
    };
    ws.onerror = () => finish({ success: false, error: "Runware connection failed" });
    ws.onclose = () => finish({ success: false, error: "Runware closed the connection" });
  });
}

const db = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", {
  auth: { persistSession: false, autoRefreshToken: false },
});

Deno.serve((req) =>
  handlePromptStudio(req, {
    adminIds: adminIdsFrom(Deno.env.get("ADMIN_USER_IDS")),
    async getUser(token) {
      const { data, error } = await db.auth.getUser(token);
      return error || !data?.user ? null : { id: data.user.id, email: data.user.email ?? null };
    },
    upgrade(r) {
      const { socket, response } = Deno.upgradeWebSocket(r);
      socket.onopen = () => socket.send(JSON.stringify({ type: "connected", message: "Prompt Studio ready" }));
      socket.onmessage = async (event) => {
        try {
          await runRequest(JSON.parse(String(event.data)), { generate }, (m) => socket.send(JSON.stringify(m)));
        } catch (e) {
          socket.send(JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Request failed" }));
        }
      };
      return response;
    },
    generate,
    paidConfigured: runwareKey.length > 0,
  }, corsHeaders)
);
