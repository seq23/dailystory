# Project Checklist (Running List)

This file tracks system + user prompts and quality tasks.

- System prompts
  - Maintain a running checklist in-repo (this file) — Done
  - Comprehensive testing: Vitest (unit/integration) — Existing, expanding
  - Comprehensive testing: Playwright (E2E) — Initial smoke added
  - Network stubs for external services (Supabase, TTS, images) — Partial
  - Coverage thresholds and reporting — Configured (Vitest V8)
  - CI pipeline for tests — TODO

- User prompts
  - “Add E2E tests plan and implement” — Initial implementation complete
  - “Keep a running list of things to accomplish” — Done

- Current status
  - Vitest: multiple suites in src/__tests__ passing
  - Playwright: configured with smoke tests for /, /pricing, /terms, /privacy, 404

- Recent achievements
  - Tier 3 Complete Simplification: Reduced from complex AI pipeline to 12 avatar descriptions + direct DALL-E 3
  - Nuclear Independence Restored: Tier 3 now fully independent with no dependencies on other functions
  - Style Optimization: Changed from "3D Pixar animation" to "beautiful illustration for children's book"
  - Over-engineering Removal: Eliminated MultiStageEnhancementPipeline, buildUnifiedNegativePrompt, extractSimpleScene
  - Clean Prompt Formula: `${avatar}, ${fullPageText}, cheerful and happy, beautiful illustration for children's book, professional quality, soft warm lighting, wholesome, safe`

- Next steps
  - Broaden E2E to guest happy-path with network mocks (story generation, TTS)
  - Set Vitest coverage thresholds and track in CI
  - Add CI workflow to run Vitest and Playwright on PRs
