// Admin CRUD for public.voice_overrides.
// Auth: bearer token must belong to a user listed in ADMIN_USER_IDS (or use service_role).
//
// POST { action: "list" }                              → all overrides
// POST { action: "upsert", language_code, voice_id, display_name?, accent_note?, model_id? }
// POST { action: "delete", language_code }
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    return json({ error: `Unknown action: ${action}` }, 400);
  } catch (e: any) {
    console.error('voice-overrides-admin error:', e);
    return json({ error: e?.message || 'Internal error' }, 500);
  }
});