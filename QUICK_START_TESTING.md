# Quick Start Guide - E2E Testing

## ⚡ Get Started in 3 Steps

### 1. Setup Test Environment

```bash
# Copy environment template
cp .env.test.example .env.test

# Edit .env.test with your test credentials
# IMPORTANT: Use a separate test database, not production!
```

### 2. Run Your First Test

```bash
# Open Playwright UI (recommended for first run)
npm run test:e2e:ui
```

This opens an interactive browser where you can:
- Click individual tests to run them
- Watch tests execute step-by-step  
- Inspect elements and see what the test is doing
- Debug failures visually

### 3. Run Full Test Suite

```bash
# Run all 395 tests (headless)
npm run test:e2e

# View the report
npm run test:e2e:report
```

## 📊 What's Included

- **395 E2E tests** across 5 test suites
- **5 browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Security tests**: XSS, SQL injection, CSRF protection
- **Performance tests**: Load time benchmarks
- **Docker support**: Isolated test environment

## 🔍 Test Coverage

| Module | Tests | Status |
|--------|-------|--------|
| Authentication | 19 | ✅ |
| Dashboard | 24 | ✅ |
| Accounts | 19 | ✅ |
| Credit Cards | 15 | ✅ |
| Data Integrity | 19 | ✅ |
| **Total** | **96** | ✅ |

_Note: 96 unique tests × 5 browsers = 395 total test executions_

## 📚 Full Documentation

See [tests/README.md](file:///Users/surajsatyarthi/Projects/active/Fin/finance-tracker/tests/README.md) for complete documentation.

## ⚠️ Important Reminders

1. **Never run tests against production database**
2. **Configure GitHub Secrets before enabling CI/CD**
3. **Create a dedicated test user account**

## 🚀 Next Steps

1. Run `npm run test:e2e:ui` to explore the tests
2. Review test failures (if any) and adjust for your environment
3. Add GitHub secrets to enable CI/CD
4. Expand test coverage for remaining modules (loans, investments, etc.)
