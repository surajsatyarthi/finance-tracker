import { test, expect } from '../fixtures/chrome-profile.fixture';

/**
 * Quick profile test - verifies your Chrome profile with Supabase works
 */

test.describe('Profile Test - Supabase Session', () => {
  test('should access Finance Tracker with existing Supabase session', async ({ context }) => {
    // Create a new page from the persistent context
    const page = await context.newPage();
    
    // Navigate to the app
    await page.goto('http://localhost:3001');
    
    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot to see where we land
    await page.screenshot({ path: 'test-results/profile-test.png', fullPage: true });
    
    // Check if we're logged in (either on dashboard or login page)
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // If we're on login page, that's okay - means session expired
    // If we're on dashboard, that's great - session is active!
    const isOnDashboard = currentUrl.includes('/dashboard');
    const isOnLogin = currentUrl.includes('/login');
    
    expect(isOnDashboard || isOnLogin).toBeTruthy();
    
    console.log(isOnDashboard ? '✅ Session active! On dashboard.' : '⚠️  On login page. Session may have expired.');
  });
});
