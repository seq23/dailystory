#!/bin/bash

echo "🚀 Installing Playwright browsers..."
npx playwright install

echo "🧪 Running unit tests..."
npx vitest run src/test/unit

echo "🔗 Running integration tests..."
npx vitest run src/test/integration

echo "⚡ Running performance tests..."
npx vitest run src/test/performance

echo "🎭 Running E2E tests..."
npx playwright test

echo "👁️ Running visual regression tests..."
npx playwright test e2e/visual-regression.spec.ts

echo "📱 Running mobile tests..."
npx playwright test e2e/mobile-specific.spec.ts

echo "♿ Running accessibility tests..."
npx playwright test e2e/accessibility.spec.ts

echo "🔒 Running security tests..."
npx playwright test e2e/security.spec.ts

echo "🏋️ Running load tests..."
npx playwright test e2e/load-testing.spec.ts

echo "✅ All tests completed!"