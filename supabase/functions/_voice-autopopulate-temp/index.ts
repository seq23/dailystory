// TEMPORARY: unauthenticated one-shot to auto-populate voice_overrides from
// the ElevenLabs shared library. DELETE this function after it runs successfully.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const LANGUAGE_SEARCH: Record<string, string[]> = {
  ur: ['pakistani english', 'urdu english', 'south asian english'],
  hi: ['indian english narrator', 'indian english'],
  ar: ['arabic english', 'middle eastern english'],
  es: ['latino english', 'spanish accent english'],
  fr: ['french english accent', 'french accent'],
  zh: ['chinese english', 'mandarin english'],
  pt: ['brazilian english', 'portuguese english'],
  sw: ['african english', 'kenyan english'],
  ru: ['russian english', 'russian accent'],
  tr: ['turkish english', 'turkish accent'],
};

async function search(q: string, key: string) {
  const r = await fetch(`https://api.elevenlabs.io/v1/shared-voices?search=${encodeURIComponent(q)}&page_size=10`, {
    headers: { 'xi-api-key': key },
  });
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  const j = await r.json();
  return j?.voices || [];
}

function pickBest(cands: any[]) {
  const eng = cands.filter((v) => {
    const l = (v?.language || '').toLowerCase();
    return l === 'en' || l.startsWith('english') || l === '';
  });
  const scored = eng.map((v) => {
    let s = 0;
    const uc = (v?.use_case || '').toLowerCase();
    if (uc.includes('narrat') || uc.includes('story') || uc.includes('audiobook')) s += 3;
    s += Math.min(3, Math.log10((v?.cloned_by_count || 0) + 1));
    return { v, s };
  });
  scored.sort((a, b) => b.s - a.s);
  return scored[0]?.v || null;
}

serve(async () => {
  const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
  if (!apiKey) return new Response('no key', { status: 500 });
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  const results: any[] = [];
  for (const [lang, queries] of Object.entries(LANGUAGE_SEARCH)) {
    let picked: any = null; let used = '';
    for (const q of queries) {
      try {
        const c = await search(q, apiKey);
        const b = pickBest(c);
        if (b) { picked = b; used = q; break; }
      } catch (e) { console.warn(lang, q, e); }
    }
    if (!picked) { results.push({ lang, status: 'no_match' }); continue; }
    const voice_id = picked.voice_id || picked.public_owner_id;
    if (!voice_id) { results.push({ lang, status: 'no_id' }); continue; }
    const row = {
      language_code: lang,
      voice_id,
      display_name: `${picked.name || 'Unknown'} (${lang} accent)`,
      accent_note: `${picked.accent || picked.description || used}`.slice(0, 200),
      model_id: 'eleven_turbo_v2_5',
      updated_at: new Date().toISOString(),
    };
    const { error } = await sb.from('voice_overrides').upsert(row, { onConflict: 'language_code' });
    if (error) { results.push({ lang, status: 'err', err: error.message }); continue; }
    results.push({ lang, status: 'set', voice_id, name: picked.name, accent: picked.accent, query: used });
  }
  return new Response(JSON.stringify({ results }, null, 2), { headers: { 'Content-Type': 'application/json' } });
});