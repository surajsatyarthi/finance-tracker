import { test, expect } from '@playwright/test';
import { login } from '../utils/test-helpers';

test('Debug Page Navigation', async ({ page }) => {
  // Use the seeded test user
  await login(page, 'test@financetracker.local', 'TestPassword123!');
  
  // Navigate to debug page
  await page.goto('/debug');
  
  // Wait for page to load
  await expect(page).toHaveURL(/.*debug/);
  
  // Check for success indicators (adjust selector based on actual page content)
  // For now, just checking that the page loads without 500 error
  const bodyText = await page.innerText('body');
  expect(bodyText).not.toContain('Application Error');
  expect(bodyText).not.toContain('500');
  
  console.log('✅ Navigation successful!');
});
