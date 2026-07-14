## Partner Feedback Remediation (excluding #10 — you fixed sign-in)

Sequenced from lowest-risk config/copy changes to the larger Guided Mode feature. Each phase is independently shippable so we can stop/verify between them.

---

### Phase 1 — Reading pace too fast (#3)  [config only, low risk]
`src/config/audioConfig.ts` currently sets `speedByDifficulty` to `0.8` for beginner/easy/medium and `1.0` for hard/expert.

- Lower the youngest/ESL levels: `beginner 0.65`, `easy 0.7`, `medium 0.75`, keep `hard 0.9`, `expert 1.0`.
- No new UI. The existing "read slower / faster" voice commands and any current speed control keep working — we only shift the baseline.

Dependency check: values are consumed by the audio services via `speedByDifficulty`; lowering them only changes playback rate. Word-highlighting timing derives from actual audio duration (ElevenLabs timings), so it stays in sync automatically. No downstream breakage.

---

### Phase 2 — AI assistant tone feels forceful (#9)  [copy only, low risk]
Audit and soften user-facing coach/assistant strings. From the code, `ReadAloudCoach.tsx` is already warm ("Great job", "That's okay!"). I will:
- Grep every user-facing coach/buddy/toast string for imperative/forceful phrasing and soften wording (e.g. any "you must / try again / wrong" style copy → encouraging equivalents).
- Prefer editing the i18n strings so all languages inherit the warmer tone.

No logic changes — string values only.

---

### Phase 3 — Accent/dialect hard to understand for ESL (#4)  [config, low risk]
Charlotte uses ElevenLabs voice `XB0fDUnXU5powFXDhCwa` with the multilingual model. For ESL clarity:
- Nudge `voice_settings` toward clearer, steadier delivery (raise `stability`, keep `speed` aligned with the Phase 1 slower baselines) in the Charlotte TTS path.
- This does not change the voice identity, only makes it slower and steadier — combined with Phase 1 it directly addresses "too fast / hard to follow."

---

### Phase 4 — Syllable segmentation accuracy (#2)  [data, incremental]
`src/data/phonicsMiniDict.ts` is a curated override dictionary (covered by `phonicsMiniDict.test.ts`). Fix accuracy by:
- Adding/correcting entries for common early-reader words that currently mis-segment.
- Extending the test file with the new expected breakdowns so regressions are caught.

No engine rewrite — just expand the authoritative override dict.

---

### Phase 5 — Guided Mode for young / ESL learners (#1, #5, #6, #7, #8)  [larger feature — separate detailed plan before building]
Items 1, 5, 6, 7, 8 all reduce to: young/ESL kids can't self-drive prompts, themes, characters, and vocabulary. Proposed lean approach (to be detailed & approved separately, NOT built in this pass):
- A "Guided Mode" toggle that swaps free-text prompt entry for a small set of pre-made, age-appropriate theme/character picker cards.
- Optional teacher/parent-selected vocabulary list feeding the existing teacher word-list injection (that system already exists per memory).

I will write this as its own plan for your approval rather than build it now.

---

### Documentation (last step, per your rules)
Update the relevant docs after Phases 1–4 land:
- `docs/AUDIO_SYSTEM_ARCHITECTURE.md` (speed baselines, voice settings)
- `docs/VOICE_CATALOG_TESTING.md` or phonics notes (syllable dict additions)
- A short "Partner Feedback Remediation" note in `docs/IMPLEMENTATION_CHANGELOG.md`.

---

### ⚠️ Approval needed — things I would ADD
1. New/corrected entries in `src/data/phonicsMiniDict.ts` + matching test cases (Phase 4).
2. New i18n string edits for softened tone (Phase 2) — no new keys unless a hardcoded string needs extracting (I'll flag any).
3. A short changelog note in docs.

### Things I would REMOVE
- Nothing is deleted. All changes are edits to existing config/copy/data.

### Not in this pass
- Guided Mode (Phase 5) — I'll deliver a separate plan.
- Sign-in bug #10 — you fixed it.

Confirm and I'll execute Phases 1–4, then write the Guided Mode plan.