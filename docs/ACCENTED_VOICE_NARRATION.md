# Accented-English narration per language

_Last updated: July 2026_

## Why
Time2Read narrates stories in English but is used by children whose native
language is not English. Hearing English spoken with a familiar regional accent
(e.g. a Pakistani-accented English narrator for Urdu-native learners) lowers the
comprehension barrier and increases perceived warmth.

## What ships
- **Per-language voice map** — the UI language chosen by the user maps to one
  English-speaking ElevenLabs voice whose accent matches the homeland of that
  language.
- **Admin override table** (`public.voice_overrides`) — mapping is persisted
  per workspace and editable at `/admin/voices` without a redeploy.
- **No user-facing voice picker** — v1 defaults are language-driven only.

## Runtime resolution order
1. Explicit `voice` param in the API call wins (backward compatible).
2. Row in `public.voice_overrides` matching the request `language`.
3. Hard-coded default in `LANGUAGE_VOICE_MAP` (`src/services/tts/languageVoiceMap.ts`
   + `supabase/functions/_shared/languageVoiceMap.ts`).
4. Final fallback: Charlotte (`XB0fDUnXU5powFXDhCwa`).

## Files
| Path | Role |
|---|---|
| `src/services/tts/languageVoiceMap.ts` | Frontend defaults + type contract |
| `supabase/functions/_shared/languageVoiceMap.ts` | Edge-function mirror of the map |
| `supabase/functions/elevenlabs-tts/index.ts` | Reads `language`, resolves voice, enforces `TTS_MAX_CHARACTERS` |
| `supabase/functions/voice-overrides-admin/index.ts` | Admin CRUD (list/upsert/delete) |
| `src/pages/admin/VoiceAdmin.tsx` | UI at `/admin/voices` |
| `src/services/enhancedElevenLabsTTS.ts` | Client forwards optional `language` |

## Cost model
ElevenLabs is billed directly (not through Lovable AI Gateway credits).
Default model is `eleven_turbo_v2_5` — ~$0.10–0.11 per 1K characters on the Pro
plan (~$0.015 per 300-char page). Persistent per-`(text, voice, model)` cache
means repeat reads of the same page cost $0. Guardrail: every request is capped
at `TTS_MAX_CHARACTERS = 4000`.

## Admin access
`/admin/voices` calls the `voice-overrides-admin` edge function, which
authorizes the caller against the `ADMIN_USER_IDS` env var (same pattern as
`get-cost-analytics`, `security-dashboard`, `cost-report`, `notify-data-breach`).
The page now checks for a real signed-in session before calling the function, so
the Supabase anon token is not treated as an admin attempt. Signed-out users see
a sign-in prompt, signed-in non-admins get a clear 403/admin-access message, and
the page remains visible instead of blanking.

## Adding a new language
1. Add the code to `SupportedLanguage` in both `languageVoiceMap.ts` files with
   a Charlotte fallback entry.
2. Deploy.
3. In `/admin/voices`, paste the desired ElevenLabs voice ID.

## Selecting real accented voice IDs
Defaults ship as Charlotte for every language until the operator picks accented
voices from the ElevenLabs Voice Library (`GET /v1/voices`, free) and enters
them at `/admin/voices`. Suggested search terms:

| Language | Search |
|---|---|
| ur | Pakistani English narrator |
| hi | Indian English narrator |
| ar | Arabic English (Levantine/Gulf) |
| es | Latin-American English |
| fr | French English soft |
| zh | Mandarin-Chinese English |
| pt | Brazilian-Portuguese English |
| sw | East-African English |
| ru | Russian English narrator |
| tr | Turkish English soft |

## Not in scope for v1
- User-facing voice picker (child/parent chooses accent manually).
- Multi-voice per language (male/female variants).
- Auto-detect accent from browser locale.