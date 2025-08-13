# Testing Guide

Unit/Integration (Vitest)
- Run: npx vitest run
- Watch: npx vitest

E2E (Playwright)
- Install browsers: npx playwright install --with-deps
- Run all: npx playwright test
- UI mode: npx playwright test --ui

Notes
- The Playwright config starts/reuses a dev server on port 5173. Override with env:
  - PLAYWRIGHT_BASE_URL, PLAYWRIGHT_WEB_SERVER_CMD
- Supabase calls are stubbed in tests to avoid real network.
