import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not set");
    }

    const contentType = req.headers.get("content-type") || "";
    let agentId = "";

    if (contentType.includes("application/json")) {
      const body = await req.json().catch(() => ({}));
      agentId = String(body?.agentId || "").trim();
    } else {
      // Support query param fallback
      const url = new URL(req.url);
      agentId = String(url.searchParams.get("agentId") || "").trim();
    }

    if (!agentId) {
      throw new Error("agentId is required");
    }

    const endpoint = `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${encodeURIComponent(agentId)}`;
    const resp = await fetch(endpoint, {
      method: "GET",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
      },
    });

    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data?.message || data?.error || `Failed to get signed URL (${resp.status})`);
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
