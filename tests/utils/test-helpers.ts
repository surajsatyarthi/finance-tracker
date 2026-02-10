import { Page, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

/**
 * Test helper utilities for Finance Tracker E2E tests
 */

// Supabase client for test data management
export const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, supabaseKey);
};

/**
 * Authentication helper - Login to the application
 */
export async function login(
  page: Page,
  email: string = process.env.TEST_USER_EMAIL || 'test@financetracker.local',
  password: string = process.env.TEST_USER_PASSWORD || 'TestPassword123!'
) {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard (increased timeout for Supabase auth)
  await page.waitForURL('/dashboard', { timeout: 30000 });
}

/**
 * Authentication helper - Logout from the application
 */
export async function logout(page: Page) {
  // Look for logout button or link
  await page.click('button:has-text("Logout"), a:has-text("Logout"), button:has-text("Sign out"), a:has-text("Sign out")');

  // Wait for redirect to login (increased timeout)
  await page.waitForURL('/login', { timeout: 30000 });
}

/**
 * Database cleanup - Remove all test data for a user
 */
export async function cleanupUserData(userId: string) {
  const supabase = getSupabaseClient();
  
  // Delete in reverse order of dependencies to avoid foreign key constraints
  const tables = [
    'transactions',
    'budgets',
    'goals',
    'bnpl',
    'emis',
    'investments',
    'fixed_deposits',
    'loans',
    'credit_cards',
    'accounts',
    'categories',
  ];
  
  for (const table of tables) {
    try {
      await supabase
        .from(table)
        .delete()
        .eq('user_id', userId);
    } catch (error) {
      console.warn(`Warning: Could not cleanup table ${table}:`, error);
    }
  }
}

/**
 * Currency formatting validator
 */
export function expectCurrencyFormat(value: string, amount: number) {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
  
  expect(value.trim()).toBe(formatted);
}

/**
 * Wait for data to load (useful for dashboard and list pages)
 */
export async function waitForDataLoad(page: Page, selector: string = '[data-testid="loading"]') {
  try {
    // Wait for loading indicator to disappear
    await page.waitForSelector(selector, { state: 'hidden', timeout: 5000 });
  } catch {
    // If no loading indicator, continue
  }
}

/**
 * Fill form field by label
 */
export async function fillFormField(page: Page, label: string, value: string) {
  const input = page.locator(`label:has-text("${label}")`).locator('..').locator('input, textarea, select').first();
  await input.fill(value);
}

/**
 * Create a test account
 */
export async function createTestAccount(page: Page, data: {
  name: string;
  type: string;
  balance: number;
  currency?: string;
}) {
  await page.goto('/accounts/new');
  
  await fillFormField(page, 'Name', data.name);
  await fillFormField(page, 'Type', data.type);
  await fillFormField(page, 'Balance', data.balance.toString());
  
  if (data.currency) {
    await fillFormField(page, 'Currency', data.currency);
  }
  
  await page.click('button[type="submit"]');
  
  // Wait for redirect to accounts list
  await page.waitForURL('/accounts');
}

/**
 * Generate random test data to avoid conflicts
 */
export function generateTestId(): string {
  return `test_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Take screenshot with custom name
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
}

/**
 * Assert no console errors (except known ones)
 */
export function setupConsoleErrorTracking(page: Page) {
  const errors: string[] = [];
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  return {
    getErrors: () => errors,
    assertNoErrors: () => {
      expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
    },
  };
}

/**
 * Wait for network to be idle
 */
export async function waitForNetworkIdle(page: Page) {
  await page.waitForLoadState('networkidle');
}

/**
 * Verify element contains currency value
 */
export async function expectCurrency(page: Page, selector: string, amount: number) {
  const text = await page.locator(selector).textContent();
  const expected = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
  
  expect(text?.trim()).toContain(expected.replace(/\s/g, ''));
}

/**
 * Verify element contains percentage value
 */
export async function expectPercentage(page: Page, selector: string, value: number, decimals: number = 1) {
  const text = await page.locator(selector).textContent();
  expect(text?.trim()).toContain(`${value.toFixed(decimals)}%`);
}
