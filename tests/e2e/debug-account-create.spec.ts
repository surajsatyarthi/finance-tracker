import { test } from '@playwright/test';
import { login, generateTestId } from '../utils/test-helpers';

test('DEBUG: Create account with full logging', async ({ page }) => {
  // Enable console logging
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  page.on('pageerror', err => console.log('ERROR:', err.message));

  // Login
  await page.context().clearCookies();
  await login(page);
  console.log('✅ Logged in successfully');

  // Navigate to new account page
  await page.goto('/accounts/new');
  console.log('✅ Navigated to /accounts/new');
  console.log('Current URL:', page.url());

  // Fill form
  const testName = `Test Account ${generateTestId()}`;
  await page.fill('#name', testName);
  console.log('✅ Filled name:', testName);

  await page.selectOption('#type', 'savings');
  console.log('✅ Selected type: savings');

  await page.fill('#balance', '100000');
  console.log('✅ Filled balance: 100000');

  // Check current URL before submit
  console.log('URL before submit:', page.url());

  // Submit form
  console.log('🔵 Clicking submit button...');
  await page.click('button[type="submit"]');

  // Wait a bit and check URL
  await page.waitForTimeout(2000);
  console.log('URL after submit (2s):', page.url());

  // Check if there's an error message on the page
  const errorMessage = await page.locator('text=/error/i').textContent().catch(() => null);
  if (errorMessage) {
    console.log('❌ Error message found:', errorMessage);
  }

  // Check page content
  const pageContent = await page.textContent('body');
  console.log('Page content preview:', pageContent?.substring(0, 200));

  // Try to wait for navigation
  try {
    await page.waitForURL('/accounts', { timeout: 5000 });
    console.log('✅ Navigation successful!');
  } catch {
    console.log('❌ Navigation failed, current URL:', page.url());
  }
});
