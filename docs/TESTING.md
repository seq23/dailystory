# Testing Guide

## Unit/Integration (Vitest)
- Run: npx vitest run
- Watch: npx vitest

## Coverage (Vitest)
- Install provider: npm i -D @vitest/coverage-v8
- Run with coverage: npx vitest run --coverage
- Open HTML report: open coverage/index.html (or serve coverage dir)
- Thresholds enforced in vite.config.ts: L/S/F 85%, B 80%

## E2E (Playwright)
- Install browsers: npx playwright install --with-deps
- Run all: npx playwright test
- UI mode: npx playwright test --ui

## Shared Validation Architecture Testing

### Validation Consistency Tests
Test that frontend and backend produce identical results:
```bash
# Test shared utilities in isolation
npx vitest src/utils/__tests__/validation-utils.test.ts

# Test frontend-backend consistency
npx vitest tests/integration/validation-consistency.test.ts
```

### Performance Benchmarks
```bash
# Test page generation speed
npx vitest tests/performance/page-generation.test.ts --reporter=verbose

# Expected metrics:
# - Expert level generation: <10 seconds
# - Smart fallback success: >90%
# - Token estimation accuracy: ±10%
```

### Business Logic Tests
```bash
# Test guest vs premium validation
npx vitest tests/business/user-flows.test.ts

# Test expert grade handling (6-10)
npx vitest tests/business/expert-grades.test.ts
```

## Notes
- The Playwright config starts/reuses a dev server on port 5173. Override with env:
  - PLAYWRIGHT_BASE_URL, PLAYWRIGHT_WEB_SERVER_CMD
- Supabase calls are stubbed in tests to avoid real network.
- Shared validation utilities are tested in both TypeScript and simulated Deno environments
