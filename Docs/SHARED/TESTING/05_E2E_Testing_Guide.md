# E2E Testing Guide - Clenergize V3 ESG Platform

**Version**: 1.0.0
**Last Updated**: November 22, 2025
**Framework**: Playwright
**Coverage**: Critical user journeys

## Quick Reference

```bash
npm run test:e2e          # Run all E2E tests
npm run test:e2e:ui      # Run with Playwright UI
npm run test:e2e:debug   # Debug mode
```

## What Are E2E Tests?

End-to-end tests verify complete user workflows across the entire application:
- Full user journeys (login → create project → add data → generate report)
- Cross-service interactions
- Frontend + Backend integration
- Real browser interactions

## Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Carbon Reporting Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('[name=email]', 'admin@clenergize.com');
    await page.fill('[name=password]', 'Admin123!');
    await page.click('button[type=submit]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should complete full carbon reporting workflow', async ({ page }) => {
    // Step 1: Create project
    await page.click('text=New Project');
    await page.fill('[name=projectName]', 'Q4 2025 Carbon Report');
    await page.click('button:has-text("Create")');
    await expect(page.locator('.project-name')).toHaveText('Q4 2025 Carbon Report');

    // Step 2: Add activity data
    await page.click('text=Add Activity');
    await page.selectOption('[name=category]', 'STATIONARY_COMBUSTION');
    await page.fill('[name=quantity]', '1000');
    await page.selectOption('[name=unit]', 'kWh');
    await page.click('button:has-text("Save")');
    await expect(page.locator('.activity-list')).toContainText('1000 kWh');

    // Step 3: Calculate emissions
    await page.click('button:has-text("Calculate Emissions")');
    await expect(page.locator('.calculation-status')).toHaveText('Completed');
    await expect(page.locator('.total-emissions')).toContainText('kg CO2e');

    // Step 4: Generate report
    await page.click('button:has-text("Generate Report")');
    await page.waitForSelector('.report-ready');
    await expect(page.locator('.report-download')).toBeVisible();
  });
});
```

## Playwright Configuration

```javascript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
});
```

## Common E2E Patterns

### Pattern 1: Authentication

```typescript
test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name=email]', 'test@example.com');
  await page.fill('[name=password]', 'Password123!');
  await page.click('button[type=submit]');
  await page.waitForURL('/dashboard');
});
```

### Pattern 2: Data Creation

```typescript
test('should create and verify organization', async ({ page }) => {
  await page.click('text=New Organization');
  await page.fill('[name=name]', 'Acme Corp');
  await page.fill('[name=industry]', 'Manufacturing');
  await page.click('button:has-text("Create")');
  
  await expect(page.locator('.organization-name')).toHaveText('Acme Corp');
});
```

### Pattern 3: Form Validation

```typescript
test('should show validation errors', async ({ page }) => {
  await page.click('button[type=submit]'); // Submit empty form
  
  await expect(page.locator('.error-email')).toHaveText('Email is required');
  await expect(page.locator('.error-password')).toHaveText('Password is required');
});
```

### Pattern 4: API Mocking (for external services)

```typescript
test('should handle API errors gracefully', async ({ page }) => {
  await page.route('**/api/v1/emissions/calculate', route => {
    route.fulfill({ status: 500, body: JSON.stringify({ error: 'Calculation failed' }) });
  });

  await page.click('button:has-text("Calculate")');
  await expect(page.locator('.error-message')).toContainText('Calculation failed');
});
```

## Test Organization

```
e2e/
├── auth/
│   ├── login.spec.ts
│   └── registration.spec.ts
├── projects/
│   ├── create-project.spec.ts
│   └── manage-hierarchy.spec.ts
├── reporting/
│   ├── carbon-report.spec.ts
│   └── export-report.spec.ts
└── admin/
    ├── user-management.spec.ts
    └── org-settings.spec.ts
```

## Best Practices

1. **Test Critical Paths Only** - E2E tests are slow and expensive
2. **Use Page Objects** - Encapsulate page interactions
3. **Stable Selectors** - Use data-testid attributes, not brittle CSS selectors
4. **Clean Test Data** - Reset database between test runs
5. **Parallel Execution** - Run tests in parallel when possible
6. **Visual Regression** - Use Playwright snapshots for UI changes

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test e2e/auth/login.spec.ts

# Run in UI mode (visual debugger)
npm run test:e2e:ui

# Run in headed mode (see browser)
npx playwright test --headed

# Generate HTML report
npx playwright show-report
```

## Debugging Tips

1. Use `page.pause()` to pause execution
2. Run in headed mode to see browser
3. Use Playwright Inspector: `PWDEBUG=1 npx playwright test`
4. Check screenshots in `test-results/` folder
5. Use `--debug` flag for step-by-step execution

## CI/CD Integration

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
      - name: Run E2E tests
        run: npm run test:e2e
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Critical User Journeys to Test

1. **User Registration & Login**
2. **Create Organization & Project**
3. **Upload Activity Data**
4. **Calculate Emissions**
5. **Generate & Export Report**
6. **Set Emission Reduction Targets**
7. **Admin User Management**

## Additional Resources

- [Unit Testing Guide](02_Unit_Testing_Guide.md)
- [Integration Testing Guide](03_Integration_Testing_Guide.md)
- [Playwright Documentation](https://playwright.dev)
