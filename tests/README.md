# E2E Testing with Playwright

Comprehensive end-to-end test suite for Finance Tracker application ensuring data integrity, security, and reliability of financial operations.

## Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Docker Testing](#docker-testing)
- [CI/CD Integration](#cicd-integration)
- [Writing New Tests](#writing-new-tests)
- [Debugging](#debugging)
- [Best Practices](#best-practices)

## Overview

This test suite covers:

- **Authentication & Security**: Login, logout, session management, CSRF, XSS, SQL injection prevention
- **Dashboard Metrics**: Net worth, savings rate, credit utilization, debt service ratio
- **Financial Modules**: Accounts, credit cards, loans, investments, FDs, transactions, EMIs, BNPL, budgets, goals
- **Data Integrity**: Concurrent operations, form validation, cross-module consistency
- **Edge Cases**: Boundary values, special characters, large datasets
- **Performance**: Load time benchmarks, responsiveness

## Setup

### Prerequisites

- Node.js 20+ installed
- Finance Tracker application running locally
- Test user account in Supabase

### Installation

```bash
# Install dependencies (includes Playwright)
npm install

# Install Playwright browsers
npx playwright install --with-deps
```

### Environment Configuration

Create `.env.test` file (copy from `.env.test.example`):

```bash
cp .env.test.example .env.test
```

Edit `.env.test` with your test credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_test_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_test_anon_key
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=your_test_password
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3001
```

> **IMPORTANT**: Use a dedicated test database, never run tests against production data!

## Running Tests

### All Tests (Headless)

```bash
npm run test:e2e
```

### Specific Browser

```bash
npm run test:e2e:chrome    # Chromium only
npm run test:e2e:firefox   # Firefox only
npm run test:e2e:webkit    # WebKit (Safari) only
```

### Interactive Modes

```bash
npm run test:e2e:headed    # Run with visible browser
npm run test:e2e:ui        # Open Playwright UI mode (recommended for development)
npm run test:e2e:debug     # Debug mode with inspector
```

### Mobile Testing

```bash
npm run test:e2e:mobile    # Test on mobile viewports
```

### View Test Report

```bash
npm run test:e2e:report    # Open HTML report
```

### Run Specific Test File

```bash
npx playwright test tests/e2e/auth.spec.ts
```

### Run Specific Test

```bash
npx playwright test tests/e2e/auth.spec.ts -g "should login with valid credentials"
```

## Test Structure

```
tests/
├── e2e/                    # E2E test specifications
│   ├── auth.spec.ts        # Authentication & security tests
│   ├── dashboard.spec.ts   # Dashboard & metrics tests
│   ├── accounts.spec.ts    # Account management tests
│   ├── credit-cards.spec.ts # Credit card tests
│   └── data-integrity.spec.ts # Data integrity & edge cases
├── utils/                  # Test utilities
│   └── test-helpers.ts     # Helper functions (login, cleanup, etc.)
└── fixtures/               # Test data
    └── test-data.ts        # Sample financial data & edge cases
```

## Docker Testing

### Start Test Environment

```bash
docker-compose -f docker-compose.test.yml up -d
```

### Run Tests Against Docker

```bash
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3001 npm run test:e2e
```

### Stop Test Environment

```bash
docker-compose -f docker-compose.test.yml down
```

### View Test Database

Access Supabase Studio at: http://localhost:54323

## CI/CD Integration

Tests run automatically on:
- Every push to `main` branch
- Every pull request
- Manual workflow dispatch

View results in GitHub Actions tab.

### Local CI Simulation

```bash
CI=true npm run test:e2e
```

## Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { login, waitForDataLoad } from '../utils/test-helpers';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await login(page);
  });

  test('should do something', async ({ page }) => {
    await page.goto('/some-page');
    await waitForDataLoad(page);
    
    // Your test assertions
    await expect(page.locator('text=Expected')).toBeVisible();
  });
});
```

### Using Test Helpers

```typescript
import { 
  login, 
  logout, 
  fillFormField, 
  generateTestId,
  expectCurrency,
  expectPercentage 
} from '../utils/test-helpers';

// Login
await login(page);

// Fill form fields
await fillFormField(page, 'Account Name', 'My Account');

// Generate unique test ID
const testName = `Test Account ${generateTestId()}`;

// Assert currency values
await expectCurrency(page, '.balance', 100000);

// Assert percentages
await expectPercentage(page, '.rate', 15.5, 1);
```

### Using Test Fixtures

```typescript
import { TEST_ACCOUNTS, TEST_CREDIT_CARDS } from '../fixtures/test-data';

// Use predefined test data
await page.fill('#name', TEST_ACCOUNTS.savings.name);
await page.fill('#balance', TEST_ACCOUNTS.savings.balance.toString());
```

## Debugging

### Visual Debugging

```bash
npm run test:e2e:ui
```

This opens Playwright UI mode where you can:
- Watch tests run step-by-step
- Inspect DOM at each step
- View screenshots and videos
- Time-travel through test execution

### Debug Mode

```bash
npm run test:e2e:debug
```

This runs tests with Playwright Inspector allowing you to:
- Step through tests
- Set breakpoints
- Inspect locators
- View console logs

### Screenshots on Failure

Screenshots are automatically captured on test failures in `test-results/` directory.

### Video Recording

Videos are recorded for failed tests (configurable in `playwright.config.ts`).

### Console Logs

Enable debug logs in `.env.test`:

```env
ENABLE_DEBUG_LOGS=true
```

## Best Practices

### 1. Test Data Isolation

- Always use `generateTestId()` to create unique test data
- Clean up test data after tests (use test fixtures or beforeEach/afterEach hooks)
- Never rely on data from previous tests

### 2. Wait for Data Loading

```typescript
await waitForDataLoad(page);
```

Always wait for data to load before making assertions.

### 3. Robust Selectors

Prefer in order:
1. Test IDs: `[data-testid="login-button"]`
2. Semantic selectors: `button[type="submit"]`
3. Text content: `text=Submit`
4. Avoid: CSS classes, complex XPath

### 4. Handle Asynchronous Operations

```typescript
await page.waitForURL('/dashboard');
await page.waitForSelector('text=Expected');
await page.waitForLoadState('networkidle');
```

### 5. Error Handling

```typescript
const element = page.locator('optional-element');
if (await element.count() > 0) {
  // Element exists, interact with it
}
```

### 6. Financial Data Assertions

Always use currency formatting helpers:

```typescript
await expectCurrency(page, '.amount', 100000);  // ✅ Good
await expect(page.locator('.amount')).toHaveText('₹1,00,000');  // ❌ Brittle
```

### 7. Security Testing

Include security tests for all user inputs:

```typescript
// XSS prevention
await page.fill('#name', '<script>alert("xss")</script>');

// SQL injection prevention
await page.fill('#search', "' OR '1'='1");
```

### 8. Performance Benchmarks

Track critical user journeys:

```typescript
const startTime = Date.now();
await page.goto('/dashboard');
const loadTime = Date.now() - startTime;
expect(loadTime).toBeLessThan(3000);
```

## Test Coverage

Current coverage:

| Module | Tests | Status |
|--------|-------|--------|
| Authentication | 15+ | ✅ |
| Dashboard | 20+ | ✅ |
| Accounts | 15+ | ✅ |
| Credit Cards | 12+ | ✅ |
| Data Integrity | 20+ | ✅ |
| **Total** | **80+** | ✅ |

## Troubleshooting

### Tests Failing Locally

1. Ensure dev server is running: `npm run dev`
2. Check `.env.test` has correct credentials
3. Verify test user exists in database
4. Clear browser cache: Delete `playwright/.cache/`

### Tests Passing Locally but Failing in CI

1. Check CI environment variables
2. Verify database is accessible in CI
3. Review CI logs for network issues
4. Check timeout settings in `playwright.config.ts`

### Flaky Tests

1. Add explicit waits: `await page.waitForSelector()`
2. Increase timeouts for slow operations
3. Use `test.retry(2)` for known flaky tests
4. Check for race conditions

## Support

For issues or questions:
1. Check this README
2. Review test examples in `tests/e2e/`
3. Consult Playwright documentation: https://playwright.dev
4. Create an issue in the project repository
