
# Plan · Accented-English narration per language (approved decisions applied)

## Decisions locked in
- **Persistence:** per-workspace, in a new `voice_overrides` table (admin can change defaults without redeploy).
- **User-facing picker:** none. Voice is chosen automatically from the active UI `language`.

## Goal
For each supported UI language, narrate English text with a native-speaker-of-that-language English accent (e.g. Urdu → Pakistani-accented English). Replace the single-Charlotte pathway with a language→voice lookup. Charlotte stays as the English default.

## Implementation

### 1. Database — new `voice_overrides` table
Small admin-only key/value table. Row per language code.

```sql
CREATE TABLE public.voice_overrides (
  language_code text PRIMARY KEY,          -- 'en','ur','hi','ar','es','fr','zh','pt','sw','ru','tr'
  voice_id      text NOT NULL,             -- ElevenLabs voice id
  display_name  text NOT NULL,             -- e.g. "Pakistani English — Zara"
  accent_note   text,                      -- human note for admin UI
  model_id      text NOT NULL DEFAULT 'eleven_turbo_v2_5',
  updated_by    uuid,
  updated_at    timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.voice_overrides TO authenticated;
GRANT ALL    ON public.voice_overrides TO service_role;
ALTER TABLE public.voice_overrides ENABLE ROW LEVEL SECURITY;

-- Read: any authenticated user (edge function needs to look up voice)
CREATE POLICY "voice_overrides_read_auth" ON public.voice_overrides
  FOR SELECT TO authenticated USING (true);

-- Write: admins only (uses existing ADMIN_USER_IDS pattern via edge function; no direct client writes)
-- No INSERT/UPDATE/DELETE policies for authenticated -> only service_role can mutate.
```

Seed row for `en` = Charlotte's current ID. Other rows added by admin via the admin page.

### 2. Language → Voice mapping (fallback baked into code)
- New `src/services/tts/languageVoiceMap.ts` with hard-coded defaults per language so the app works even if the table is empty.
- New `supabase/functions/_shared/languageVoiceMap.ts` mirror.
- Runtime lookup order: **DB row → hard-coded default → Charlotte (English)**.

### 3. Edge function routing
- Update `supabase/functions/elevenlabs-tts/index.ts`:
  - Accept optional `language` in request body.
  - If explicit `voiceId` passed, honour it (unchanged behaviour).
  - Otherwise: look up `voice_overrides` for `language`, fall back to code map, fall back to Charlotte.
  - Cache key = `hash(text + voiceId + model + speed)` (accented audio caches independently → repeat reads = free).
  - Explicit 4000-char cap with logged rejection.
  - Emit `costLogger` with `tts.language=<code>` tag.

### 4. Client wiring
- `NewVoiceService.ts` and `enhancedElevenLabsTTS.ts`: pass active UI `language` into the edge function call. No component changes elsewhere.
- Pace / stability settings from the earlier Beaconhouse fix are preserved per reading level.

### 5. New admin edge function + page
- New edge function `voice-overrides-admin` (POST): validates caller is in `ADMIN_USER_IDS`, upserts a row. Reads are done directly from `voice_overrides` via the anon client (RLS allows authenticated read).
- New page `src/pages/admin/VoiceAdmin.tsx` at `/admin/voices`:
  - Table of languages with current voice ID + name.
  - "Play sample" button → calls `elevenlabs-tts` with a 1-sentence sample in the chosen voice.
  - Inline edit → calls `voice-overrides-admin`.
  - Admin-gated via existing pattern (same guard used by other admin routes).

### 6. Docs + memory
- Update `docs/MULTILINGUAL_TTS.md` with the new map, override flow, and cost table.
- Update `mem://architecture/multilingual-tts-logic`.

## What this does NOT change
- No change to Charlotte for English users.
- No change to guest vs. premium routing.
- No change to billing, subscriptions, or Stripe.
- No RLS changes on any existing table.

## Verification
- Unit: `languageVoiceMap` falls back correctly (DB miss → code default → Charlotte).
- Playwright: switch UI language → generate 1 page → confirm `voiceId` in the network payload matches the map / override.
- Cost tag: confirm `cost_tracking` rows show `tts.language=<code>`.

## Cost recap (unchanged)
ElevenLabs bills directly (not Lovable credits). Turbo v2.5 ≈ **$0.09 / 6-page guest story**, ≈ **$0.15 / 10-page premium story**, minus cache hits. Voice list pulls are free.

---

## New items to CREATE (please confirm)
1. **DB migration:** `voice_overrides` table + RLS + seed row for English/Charlotte
2. `src/services/tts/languageVoiceMap.ts`
3. `supabase/functions/_shared/languageVoiceMap.ts`
4. `supabase/functions/voice-overrides-admin/index.ts` (admin-only upsert endpoint)
5. `src/pages/admin/VoiceAdmin.tsx` (admin preview + edit page, no user-facing UI)
6. `/admin/voices` route entry in `src/App.tsx`
7. `docs/MULTILINGUAL_TTS.md`

## Items to MODIFY (please confirm)
1. `supabase/functions/elevenlabs-tts/index.ts` — add language routing, DB lookup, length cap, cost tag
2. `src/services/NewVoiceService.ts` — forward `language`
3. `src/services/enhancedElevenLabsTTS.ts` — forward `language`
4. `mem://architecture/multilingual-tts-logic` — update

## Items to REMOVE
**None.**

Reply "approved" and I'll build it.
