

## Plan: Add "Our Family of Tools" Footer Section

### What
Add a small "Our Family of Tools" section to the existing footer in `WelcomeHero.tsx`, positioned between the company info (left) and the legal links (right), or as a new row. It will contain links to both Time2Read and HeyGetOnMyLevel with a one-liner description.

### Where
**File:** `src/components/WelcomeHero.tsx` (lines 373-400)

Insert a new middle section between the company info block (line 377-383) and the legal links block (line 385-397). This keeps it visually distinct but integrated.

### Layout
```text
┌─────────────────────────────────────────────────────┐
│  Time2Read LLC                                      │
│  Personalized stories...                            │
│  Plans & Pricing →                                  │
│                                                     │
│  Our Family of Tools                                │
│  Time2Read · HeyGetOnMyLevel                        │
│  Test reading levels with our companion tool.       │
│                                                     │
│  © 2026 ... | Privacy | Terms | CCPA | ...          │
└─────────────────────────────────────────────────────┘
```

### Technical Details
- Add a new `<div>` section after line 383, styled with `text-center` and matching `text-white/70` palette
- "Our Family of Tools" as a small heading (`text-xs font-semibold text-white/80`)
- Two links side by side separated by a `·` — Time2Read links to `/`, HeyGetOnMyLevel links to `https://heygetonmylevel.com` with `target="_blank" rel="noopener noreferrer"`
- One-liner beneath: "Test reading levels with our companion tool."
- Add a subtle top border or spacing to separate from company info
- Add i18n keys for the new text strings

### Files Modified
- `src/components/WelcomeHero.tsx` — add the new footer section

