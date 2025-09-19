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

## Retry & Fallback System Testing

### Network Timeout Testing
```bash
# Test exponential backoff logic
npx vitest src/utils/__tests__/networkTimeout.test.ts

# Test timeout configurations
npx vitest tests/integration/timeout-configs.test.ts

# Expected behaviors:
# - Story generation: 60s timeout, 2 retries, exponential backoff
# - Image generation: 15s timeout, 1 retry
# - Network error recovery with jitter
```

### Error Handling Testing  
```bash
# Test error classification and retry logic
npx vitest src/utils/__tests__/errorHandling.test.ts

# Test circuit breaker functionality
npx vitest tests/integration/circuit-breaker.test.ts

# Expected behaviors:
# - Proper error categorization (NETWORK, API, TIMEOUT, etc.)
# - Circuit breaker activation after 10 consecutive failures
# - Smart retry with exponential backoff
```

### Expert Circuit Breaker Testing
```bash
# Test 6-attempt expert model chain
npx vitest tests/expert/circuit-breaker.test.ts

# Test progressive model fallback
npx vitest tests/expert/model-chain.test.ts

# Expected behaviors:
# - GPT-5 → GPT-4.1 → GPT-5-mini → GPT-4.1 → GPT-4o → GPT-4o-mini
# - API parameter mapping for newer vs legacy models
# - <10 second generation time for expert levels
```

### Repair Mode Testing
```bash
# Test repair mode triggers and recovery
npx vitest tests/repair/repair-mode.test.ts

# Test quality validation and improvement
npx vitest tests/repair/quality-validation.test.ts

# Expected behaviors:
# - Repair triggers: content_too_short, vocabulary_mismatch, etc.
# - Token buffer application (10-50% based on severity)
# - Quality score improvement through repair cycles
```

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
# - Repair mode success rate: >80%
# - Overall system success rate: >95%
```

### Business Logic Tests
```bash
# Test guest vs premium validation
npx vitest tests/business/user-flows.test.ts

# Test expert grade handling (6-10)
npx vitest tests/business/expert-grades.test.ts

# Test retry consistency across user types
npx vitest tests/business/retry-consistency.test.ts
```

## Integration Testing

### Story Generation Pipeline Testing
```bash
# Test complete generation workflow with retries
npx vitest tests/integration/story-generation-pipeline.test.ts

# Test bulk processing performance (5-6x improvement)
npx vitest tests/integration/bulk-processing.test.ts

# Expected outcomes:
# - End-to-end generation success with fallbacks
# - Vocabulary integration with silent failure
# - Image preloading coordination with story stability
```

### Cross-System Validation
```bash
# Test story-image synchronization
npx vitest tests/integration/story-image-sync.test.ts

# Test template-AI fallback coordination  
npx vitest tests/integration/template-ai-fallback.test.ts

# Test anti-flicker system coordination
npx vitest tests/integration/anti-flicker.test.ts
```

## Edge Function Testing Notes

### Runware Generate Image Function
The `runware-generate-image` function expects specific payload structure:
```javascript
{
  storyText: "The story content...", // Required: main story text
  enhancedStoryData: {              // Required: wrapper object
    userInfo: { /* user profile */ },
    pageNumber: 1,
    sessionId: "session-123"
  },
  dryRun: true // Optional: for testing without actual generation
}
```

### Cold Start Retry Behavior
Edge functions may experience temporary `IMPORT_SYNC_ANOMALY` errors during cold starts:
- Functions use TypeScript receptionist pattern for resilience
- Client code should implement 2-3 retry attempts with 2-second delays
- Errors typically resolve automatically within 30 seconds
- All functions include GET health check endpoints for monitoring

## Notes
- The Playwright config starts/reuses a dev server on port 5173. Override with env:
  - PLAYWRIGHT_BASE_URL, PLAYWRIGHT_WEB_SERVER_CMD
- Supabase calls are stubbed in tests to avoid real network.
- Shared validation utilities are tested in both TypeScript and simulated Deno environments
