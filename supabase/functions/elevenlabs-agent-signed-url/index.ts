
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
    const DEFAULT_AGENT_ID = Deno.env.get("ELEVENLABS_AGENT_ID") || "";

    console.log('🔑 ELEVENLABS_API_KEY exists:', !!ELEVENLABS_API_KEY);
    console.log('🤖 ELEVENLABS_AGENT_ID:', DEFAULT_AGENT_ID);

    if (!ELEVENLABS_API_KEY) {
      console.error('❌ ELEVENLABS_API_KEY is missing');
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

    // Fallback to the default from secrets if not provided
    if (!agentId) {
      if (!DEFAULT_AGENT_ID) {
        console.error('❌ No agentId provided and ELEVENLABS_AGENT_ID not set');
        throw new Error("agentId is required (no override provided and ELEVENLABS_AGENT_ID is not set)");
      }
      agentId = DEFAULT_AGENT_ID;
    }

    console.log('🎯 Using agentId:', agentId);

    const endpoint = `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${encodeURIComponent(agentId)}`;
    console.log('🌐 Calling ElevenLabs API:', endpoint);
    
    const resp = await fetch(endpoint, {
      method: "GET",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
      },
    });

    console.log('📊 ElevenLabs API response status:', resp.status);
    const data = await resp.json();
    console.log('📦 ElevenLabs API response data:', data);
    
    if (!resp.ok) {
      console.error('❌ ElevenLabs API error:', data);
      throw new Error(data?.message || data?.error || `Failed to get signed URL (${resp.status})`);
    }

    console.log('✅ ElevenLabs signed URL obtained successfully');
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
