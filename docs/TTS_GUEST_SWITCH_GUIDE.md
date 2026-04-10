# 🔊 How to Switch Guest Users from ElevenLabs to Free Browser TTS

## What This Does

Currently, **all users** (guest + premium) use ElevenLabs for text-to-speech audio. ElevenLabs costs money per character. This guide shows how to switch **guest (free) users only** to the browser's built-in free speech engine, saving significant costs.

**Premium users are NOT affected** — they always keep the high-quality ElevenLabs Charlotte voice.

---

## The Change (1 line)

**File:** `src/config/ttsConfig.ts`  
**Line 21** — change `'elevenlabs'` to `'browser'`

### Before (current — guests use ElevenLabs):
```ts
GUEST_TTS_PROVIDER: 'elevenlabs' as TTSProvider,
```

### After (guests use free browser TTS):
```ts
GUEST_TTS_PROVIDER: 'browser' as TTSProvider,
```

That's it. No other files need to change.

---

## Option A: Do It in Lovable

1. Open the Lovable project editor
2. Open the **Code Editor** (code icon in top nav bar)
3. In the file tree, navigate to: `src/config/ttsConfig.ts`
4. Find **line 21** — it says: `GUEST_TTS_PROVIDER: 'elevenlabs' as TTSProvider,`
5. Change `'elevenlabs'` to `'browser'`
6. The file should now read: `GUEST_TTS_PROVIDER: 'browser' as TTSProvider,`
7. Save the file (Ctrl+S / Cmd+S)
8. The preview will auto-reload — test guest audio to confirm it works
9. **Publish** when ready

---

## Option B: Do It in GitHub

1. Go to your GitHub repository
2. Navigate to: `src/config/ttsConfig.ts`
3. Click the **pencil icon** (Edit this file) in the top right
4. Find **line 21**: `GUEST_TTS_PROVIDER: 'elevenlabs' as TTSProvider,`
5. Change `'elevenlabs'` to `'browser'`
6. Scroll down to **Commit changes**
7. Add commit message: `Switch guest TTS from ElevenLabs to free browser speech`
8. Select **Commit directly to the main branch** (or create a PR if you prefer)
9. Click **Commit changes**
10. Lovable will auto-sync the change from GitHub

---

## How to Revert (Go Back to ElevenLabs for Guests)

Follow the same steps above but change `'browser'` back to `'elevenlabs'`.

---

## What Happens Technically

- The config file (`src/config/ttsConfig.ts`) controls which TTS engine is used per user tier
- The audio hook (`src/hooks/useAudioControls.ts`) reads this config at runtime
- When set to `'browser'`, guest users get the device's built-in `speechSynthesis` API (free, zero cost)
- When set to `'elevenlabs'`, guest users get the Charlotte voice via ElevenLabs API (paid)
- Premium users **always** use ElevenLabs regardless of this setting

---

## Quality Tradeoff

| Feature | ElevenLabs | Browser TTS |
|---------|-----------|-------------|
| Cost | ~$0.30/1K chars | **Free** |
| Voice Quality | Excellent (Charlotte) | Decent (varies by device) |
| Word Highlighting | ✅ Yes | ❌ No (basic playback only) |
| Consistency | Same voice everywhere | Different voice per browser/OS |
| Offline | ❌ No | ✅ Yes |

---

## Testing After the Switch

1. Open the app as a **guest user** (not logged in / no premium)
2. Generate a story
3. Tap the audio/play button
4. You should hear the device's built-in voice (not Charlotte)
5. Log in as a **premium user**
6. Tap the audio/play button
7. You should hear Charlotte's ElevenLabs voice (unchanged)

---

*Last updated: April 2026*
