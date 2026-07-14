// Admin CRUD for public.voice_overrides.
// Auth: bearer token must belong to a user listed in ADMIN_USER_IDS (or use service_role).
//
// POST { action: "list" }                              → all overrides
// POST { action: "upsert", language_code, voice_id, display_name?, accent_note?, model_id? }
// POST { action: "delete", language_code }
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Search terms per language for the ElevenLabs Shared Voice Library.
// Kept intentionally broad to maximize hit rate; we then filter to English-labelled voices.
const LANGUAGE_SEARCH: Record<string, string[]> = {
  en: ['american english narrator'],
  ur: ['pakistani english', 'urdu english', 'south asian english'],
  hi: ['indian english narrator', 'indian english'],
  ar: ['arabic english', 'middle eastern english'],
  es: ['latino english', 'spanish accent english', 'hispanic english'],
  fr: ['french english accent', 'french accent'],
  zh: ['chinese english', 'mandarin english'],
  pt: ['brazilian english', 'portuguese english'],
  sw: ['african english', 'kenyan english', 'east african english'],
  ru: ['russian english', 'russian accent'],
  tr: ['turkish english', 'turkish accent'],
};

async function searchSharedLibrary(query: string, apiKey: string): Promise<any[]> {
  const url = `https://api.elevenlabs.io/v1/shared-voices?search=${encodeURIComponent(query)}&page_size=10`;
  const r = await fetch(url, { headers: { 'xi-api-key': apiKey } });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`shared-voices ${r.status}: ${t.slice(0, 200)}`);
  }
  const j = await r.json();
  return j?.voices || [];
}

function pickBestEnglishVoice(candidates: any[]): any | null {
  // Prefer voices explicitly tagged English and with a narration/story use case.
  const englishOnly = candidates.filter((v) => {
    const lang = (v?.language || '').toLowerCase();
    return lang === 'en' || lang.startsWith('english') || lang === '';
  });
  const scored = englishOnly.map((v) => {
    let score = 0;
    const uc = (v?.use_case || '').toLowerCase();
    const desc = (v?.description || '').toLowerCase();
    if (uc.includes('narrat') || uc.includes('story') || uc.includes('audiobook')) score += 3;
    if (desc.includes('narrat') || desc.includes('warm') || desc.includes('clear')) score += 1;
    if (v?.free_users_allowed) score += 1;
    score += Math.min(3, Math.log10((v?.cloned_by_count || 0) + 1));
    return { v, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.v || null;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin, Access-Control-Request-Headers',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const sb = createClient(supabaseUrl, serviceKey);

  // ── Authorization: admin only ──
  const token = req.headers.get('Authorization')?.replace('Bearer ', '').trim();
  if (!token) return json({ error: 'Unauthorized' }, 401);

  const adminUserIds = (Deno.env.get('ADMIN_USER_IDS') || '')
    .split(',').map(s => s.trim()).filter(Boolean);
  let authorized = token === serviceKey;
  let actingUserId: string | null = null;
  if (!authorized) {
    const { data: { user } } = await sb.auth.getUser(token);
    if (user && adminUserIds.includes(user.id)) {
      authorized = true;
      actingUserId = user.id;
    }
  }
  if (!authorized) return json({ error: 'Forbidden' }, 403);

  let body: any;
  try { body = await req.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
  const action = String(body?.action || '').toLowerCase();

  try {
    if (action === 'list') {
      const { data, error } = await sb
        .from('voice_overrides')
        .select('*')
        .order('language_code');
      if (error) throw error;
      return json({ success: true, overrides: data || [] });
    }

    if (action === 'upsert') {
      const language_code = String(body.language_code || '').toLowerCase().trim();
      const voice_id = String(body.voice_id || '').trim();
      if (!language_code || !voice_id) return json({ error: 'language_code and voice_id required' }, 400);
      const row = {
        language_code,
        voice_id,
        display_name: body.display_name ?? null,
        accent_note: body.accent_note ?? null,
        model_id: body.model_id ?? null,
        updated_by: actingUserId,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await sb
        .from('voice_overrides')
        .upsert(row, { onConflict: 'language_code' })
        .select()
        .maybeSingle();
      if (error) throw error;
      return json({ success: true, override: data });
    }

    if (action === 'delete') {
      const language_code = String(body.language_code || '').toLowerCase().trim();
      if (!language_code) return json({ error: 'language_code required' }, 400);
      const { error } = await sb
        .from('voice_overrides')
        .delete()
        .eq('language_code', language_code);
      if (error) throw error;
      return json({ success: true });
    }

    if (action === 'search_library') {
      const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
      if (!apiKey) return json({ error: 'ELEVENLABS_API_KEY not configured' }, 500);
      const query = String(body.query || '').trim();
      if (!query) return json({ error: 'query required' }, 400);
      const voices = await searchSharedLibrary(query, apiKey);
      return json({ success: true, voices });
    }

    if (action === 'auto_populate') {
      const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
      if (!apiKey) return json({ error: 'ELEVENLABS_API_KEY not configured' }, 500);
      const only: string[] | null = Array.isArray(body.languages) && body.languages.length
        ? body.languages.map((s: string) => String(s).toLowerCase())
        : null;
      const overwrite = body.overwrite === true;
      const results: any[] = [];

      for (const [lang, queries] of Object.entries(LANGUAGE_SEARCH)) {
        if (only && !only.includes(lang)) continue;
        if (lang === 'en') { results.push({ lang, status: 'skipped_english' }); continue; }

        // Skip if already set (unless overwrite)
        if (!overwrite) {
          const { data: existing } = await sb
            .from('voice_overrides').select('language_code').eq('language_code', lang).maybeSingle();
          if (existing) { results.push({ lang, status: 'exists_skipped' }); continue; }
        }

        let picked: any = null;
        let usedQuery = '';
        for (const q of queries) {
          try {
            const cand = await searchSharedLibrary(q, apiKey);
            const best = pickBestEnglishVoice(cand);
            if (best) { picked = best; usedQuery = q; break; }
          } catch (e) {
            console.warn(`search ${lang} q="${q}" failed:`, e);
          }
        }

        if (!picked) { results.push({ lang, status: 'no_match' }); continue; }

        const voice_id = picked?.voice_id || picked?.public_owner_id;
        if (!voice_id) { results.push({ lang, status: 'no_voice_id', raw: picked?.name }); continue; }

        const row = {
          language_code: lang,
          voice_id,
          display_name: `${picked.name || 'Unknown'} (${lang} accent)`,
          accent_note: `${picked.accent || picked.description || usedQuery}`.slice(0, 200),
          model_id: 'eleven_turbo_v2_5',
          updated_by: actingUserId,
          updated_at: new Date().toISOString(),
        };
        const { error: upErr } = await sb.from('voice_overrides').upsert(row, { onConflict: 'language_code' });
        if (upErr) { results.push({ lang, status: 'upsert_failed', error: upErr.message }); continue; }

        results.push({
          lang, status: 'set',
          voice_id, name: picked.name, accent: picked.accent, query: usedQuery,
        });
      }

      return json({ success: true, results });
    }

    return json({ error: `Unknown action: ${action}` }, 400);
  } catch (e: any) {
    console.error('voice-overrides-admin error:', e);
    return json({ error: e?.message || 'Internal error' }, 500);
  }
});