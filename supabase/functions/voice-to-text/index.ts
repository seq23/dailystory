import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "../_shared/serve.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { logCost } from "../_shared/costLogger.ts";
import { guardCallWithCors } from "../_shared/paidCallGuardDeno.ts";
import {
  READ_ALOUD_FREE_CLIPS_PER_SENTENCE,
  READ_ALOUD_FREE_SENTENCES_PER_DAY,
  READ_ALOUD_ZONE_CHANGE_DAYS,
} from "../_shared/readAloudAllowance.ts";
import { handleVoiceToText } from "../_shared/voiceToText.ts";

// The handler and its tests: ../_shared/voiceToText.ts. This file wires the live parts.
const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-t2r-guest",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS, HEAD",
  "Access-Control-Max-Age": "600",
  "Vary": "Origin, Access-Control-Request-Headers",
};

const service = () => createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method === "HEAD" && new URL(req.url).pathname === "/health") {
    return new Response(null, { status: 200, headers: { ...corsHeaders, "x-health": "true", "Cache-Control": "no-store" } });
  }
  const sb = service();
  return handleVoiceToText(req, {
    guard: (req) => guardCallWithCors(req, 'voice-to-text', corsHeaders, { allowGuests: false, maxBodyBytes: 8 * 1024 * 1024, signInFor: 'so we can hear you read' }),
    readAloud: () => ({
      async subscriberRow(userId) {
        const { data, error } = await sb.from("subscribers")
          .select("subscribed, subscription_end, override_premium, override_end")
          .eq("user_id", userId).maybeSingle();
        if (error) throw new Error(error.message);
        return data;
      },
      async practiceHit(userId, sentenceKey, timeZone) {
        const { data, error } = await sb.rpc("read_aloud_practice_hit", {
          p_user: userId, p_sentence: sentenceKey, p_time_zone: timeZone,
          p_sentences: READ_ALOUD_FREE_SENTENCES_PER_DAY, p_clips: READ_ALOUD_FREE_CLIPS_PER_SENTENCE,
          p_zone_days: READ_ALOUD_ZONE_CHANGE_DAYS,
        });
        if (error) throw new Error(error.message);
        return data;
      },
      // A zero-cost cost_tracking row; the post-deploy TTS usage report names it
      // (scripts/tts-usage-alert.mjs, READ_ALOUD_CHECK_FAILED / READ_ALOUD_PLAN_UNREADABLE).
      report(incident, detail) {
        console.error(`[voice-to-text] ${incident}: ${detail}`);
        logCost(sb, { sessionId: "voice-to-text", provider: "openai", operationType: incident, modelUsed: "none", cost: 0, apiEndpoint: incident === "read_aloud_count_failed" ? "rpc/read_aloud_practice_hit" : "subscribers" });
      },
    }),
    transcribe: (form) => fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}` },
      body: form,
    }),
    logCost: (entry) => logCost(sb, entry),
  }, corsHeaders);
});
