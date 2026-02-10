/**
 * Simple profile test runner
 * Run with: node tests/run-with-profile.mjs
 */

import { chromium } from '@playwright/test';

async function testWithProfile() {
  console.log('🚀 Launching Chrome with your profile (Profile 6)...');
  console.log('This will use your existing Supabase session!\n');
  
  const userDataDir = `${process.env.HOME}/Library/Application Support/Google/Chrome/Profile 6`;
  
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    viewport: { width: 1400, height: 900 },
    args: ['--disable-blink-features=AutomationControlled'],
  });
  
  const page = await context.newPage();
  
  console.log('📍 Navigating to http://localhost:3001...');
  await page.goto('http://localhost:3001');
  
  console.log('⏳ Waiting for page to load...');
  await page.waitForLoadState('networkidle');
  
  const currentUrl = page.url();
  console.log(`\n✅ Page loaded! Current URL: ${currentUrl}`);
  
  if (currentUrl.includes('/dashboard')) {
    console.log('🎉 Success! You are logged in and on the dashboard!');
    console.log('Your Supabase session is working!\n');
  } else if (currentUrl.includes('/login')) {
    console.log('⚠️  On login page. Your Supabase session may have expired.');
    console.log('Try logging in manually in this browser window.\n');
  }
  
  console.log('Browser will stay open for you to interact with the app.');
  console.log('Press Ctrl+C in the terminal to close when done.\n');
  
  // Keep the browser open
  await new Promise(() => {});
}

testWithProfile().catch(console.error);
