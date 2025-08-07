# Enterprise Testing Infrastructure

## Overview
Complete enterprise-grade testing infrastructure with multiple test types and CI/CD integration.

## Test Types

### 🧪 Unit Tests
- **Location**: `src/test/unit/`
- **Framework**: Vitest + Testing Library
- **Coverage**: Components, services, hooks
- **Run**: `npx vitest run src/test/unit`

### 🔗 Integration Tests  
- **Location**: `src/test/integration/`
- **Framework**: Vitest
- **Coverage**: Supabase, API integrations
- **Run**: `npx vitest run src/test/integration`

### ⚡ Performance Tests
- **Location**: `src/test/performance/` 
- **Framework**: Vitest + Lighthouse
- **Coverage**: Core Web Vitals, bundle size
- **Run**: `npx vitest run src/test/performance`

### 🎭 E2E Tests
- **Location**: `e2e/`
- **Framework**: Playwright
- **Coverage**: User flows, cross-browser
- **Run**: `npx playwright test`

### 👁️ Visual Regression Tests
- **File**: `e2e/visual-regression.spec.ts`
- **Coverage**: UI consistency, responsive design
- **Run**: `npx playwright test e2e/visual-regression.spec.ts`

### ♿ Accessibility Tests
- **File**: `e2e/accessibility.spec.ts`
- **Framework**: Playwright + Axe-core
- **Coverage**: WCAG 2.1 AA compliance
- **Run**: `npx playwright test e2e/accessibility.spec.ts`

### 📱 Mobile Tests
- **File**: `e2e/mobile-specific.spec.ts`
- **Coverage**: Touch interactions, orientations
- **Run**: `npx playwright test e2e/mobile-specific.spec.ts`

### 🔒 Security Tests
- **File**: `e2e/security.spec.ts`
- **Coverage**: XSS, SQL injection, CSP
- **Run**: `npx playwright test e2e/security.spec.ts`

### 🏋️ Load Tests
- **File**: `e2e/load-testing.spec.ts`
- **Coverage**: Concurrent users, memory usage
- **Run**: `npx playwright test e2e/load-testing.spec.ts`

## Quick Start

### 1. Install Dependencies
```bash
npm install
npx playwright install
```

### 2. Run All Tests
```bash
# Run test setup script
node test-runner.js

# Or run manually:
npx vitest run src/test/unit
npx vitest run src/test/integration  
npx playwright test
```

### 3. Development Testing
```bash
# Watch mode for unit tests
npx vitest

# E2E tests with UI
npx playwright test --ui

# Coverage reports
npx vitest run --coverage
```

## CI/CD Integration

### GitHub Actions
- **File**: `.github/workflows/ci-testing.yml`
- **Triggers**: Push, PR to main
- **Coverage**: All test types, multiple browsers

### Performance Monitoring
- **File**: `.github/workflows/performance-monitoring.yml`
- **Triggers**: Scheduled, release
- **Metrics**: Lighthouse, Core Web Vitals

### Scheduled Testing
- **File**: `.github/workflows/scheduled-testing.yml`
- **Frequency**: Daily, weekly
- **Coverage**: Full regression testing

## Test Configuration

### Vitest Config
- **File**: `vitest.config.ts`
- **Environment**: jsdom
- **Setup**: `src/test/setup.ts`

### Playwright Config
- **File**: `playwright.config.ts`
- **Browsers**: Chromium, Firefox, WebKit
- **Mobile**: Pixel 5, iPhone 12

## Test Scripts (when merged to package.json)

```json
{
  "test:unit": "vitest run src/test/unit",
  "test:integration": "vitest run src/test/integration",
  "test:performance": "vitest run src/test/performance", 
  "test:e2e": "playwright test",
  "test:visual": "playwright test e2e/visual-regression.spec.ts",
  "test:mobile": "playwright test e2e/mobile-specific.spec.ts",
  "test:accessibility": "playwright test e2e/accessibility.spec.ts",
  "test:security": "playwright test e2e/security.spec.ts",
  "test:load": "playwright test e2e/load-testing.spec.ts",
  "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e",
  "test:ci": "npm run test:unit && npm run test:integration && npm run test:e2e && npm run test:security"
}
```

## Test Quality Standards

### Coverage Targets
- **Unit Tests**: 80%+ coverage
- **E2E Tests**: Critical user paths
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Core Web Vitals thresholds

### Best Practices
- Mock external dependencies
- Test user behavior, not implementation
- Maintain test data isolation
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

## Debugging Tests

### Unit Tests
```bash
# Debug specific test
npx vitest run src/test/unit/components/InteractiveWord.test.tsx

# Watch mode with verbose output
npx vitest --reporter=verbose
```

### E2E Tests
```bash
# Debug mode with browser visible
npx playwright test --debug

# Headed mode
npx playwright test --headed

# Specific browser
npx playwright test --project=chromium
```

## Monitoring & Reporting

### Test Reports
- **HTML Reports**: `test-results/`
- **Coverage**: `coverage/`
- **Lighthouse**: `lighthouse-reports/`

### Continuous Monitoring
- Performance regression detection
- Accessibility compliance tracking
- Security vulnerability scanning
- Cross-browser compatibility monitoring

## Dependencies

### Core Testing
- `@playwright/test`: E2E testing framework
- `vitest`: Unit/integration test runner
- `@testing-library/react`: Component testing utilities
- `@testing-library/jest-dom`: DOM matchers

### Specialized Testing
- `@axe-core/playwright`: Accessibility testing
- `lighthouse`: Performance auditing
- `jsdom`: DOM simulation for unit tests

This enterprise testing infrastructure ensures comprehensive quality assurance across all aspects of the application.