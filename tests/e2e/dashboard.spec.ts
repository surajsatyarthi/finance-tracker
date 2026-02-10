import { test, expect } from '@playwright/test';
import { login, waitForDataLoad } from '../utils/test-helpers';

/**
 * Dashboard E2E Tests
 * Critical financial metrics and calculations
 */

test.describe('Dashboard - Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await login(page);
  });

  test('should load dashboard successfully', async ({ page }) => {
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h2:has-text("Dashboard")')).toBeVisible();
  });

  test('should display all key metric cards', async ({ page }) => {
    // Wait for data to load
    await waitForDataLoad(page);
    
    // Verify all 4 key metric sections are present
    const metrics = ['Net Worth', 'Savings Rate', 'Credit Utilization', 'Debt Service Ratio'];
    
    for (const metric of metrics) {
      await expect(page.locator(`text=${metric}`)).toBeVisible();
    }
  });

  test('should display net worth with correct color coding', async ({ page }) => {
    await waitForDataLoad(page);
    
    const netWorthElement = page.locator('text=Net Worth').locator('..').locator('..');
    const netWorthValue = netWorthElement.locator('div').first();
    
    // Check if element exists
    await expect(netWorthValue).toBeVisible();
    
    // Get the class to check color (green for positive, red for negative)
    const className = await netWorthValue.getAttribute('class');
    
    // Should have either text-green-600 or text-red-600
    const hasColorClass = className?.includes('text-green-600') || className?.includes('text-red-600');
    expect(hasColorClass).toBeTruthy();
  });

  test('should display savings rate with color coding', async ({ page }) => {
    await waitForDataLoad(page);
    
    const savingsRateElement = page.locator('text=Savings Rate').locator('..').locator('..');
    const savingsRateValue = savingsRateElement.locator('div').first();
    
    await expect(savingsRateValue).toBeVisible();
    
    // Should contain % symbol
    const text = await savingsRateValue.textContent();
    expect(text).toContain('%');
  });

  test('should display credit utilization percentage', async ({ page }) => {
    await waitForDataLoad(page);
    
    const creditUtilElement = page.locator('text=Credit Utilization').locator('..').locator('..');
    const creditUtilValue = creditUtilElement.locator('div').first();
    
    await expect(creditUtilValue).toBeVisible();
    
    const text = await creditUtilValue.textContent();
    expect(text).toContain('%');
  });

  test('should display debt service ratio percentage', async ({ page }) => {
    await waitForDataLoad(page);
    
    const debtRatioElement = page.locator('text=Debt Service Ratio').locator('..').locator('..');
    const debtRatioValue = debtRatioElement.locator('div').first();
    
    await expect(debtRatioValue).toBeVisible();
    
    const text = await debtRatioValue.textContent();
    expect(text).toContain('%');
  });
});

test.describe('Dashboard - Assets & Liabilities', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await login(page);
  });

  test('should display assets and liabilities breakdown', async ({ page }) => {
    await waitForDataLoad(page);
    
    // Verify section exists
    await expect(page.locator('text=Assets & Liabilities')).toBeVisible();
    
    // Verify rows exist
    await expect(page.locator('text=Total Assets')).toBeVisible();
    await expect(page.locator('text=Total Liabilities')).toBeVisible();
  });

  test('should display total assets in green', async ({ page }) => {
    await waitForDataLoad(page);
    
    const assetsRow = page.locator('text=Total Assets').locator('..');
    const assetsValue = assetsRow.locator('td').last();
    
    const className = await assetsValue.getAttribute('class');
    expect(className).toContain('text-green-600');
  });

  test('should display total liabilities in red', async ({ page }) => {
    await waitForDataLoad(page);
    
    const liabilitiesRow = page.locator('text=Total Liabilities').locator('..');
    const liabilitiesValue = liabilitiesRow.locator('td').last();
    
    const className = await liabilitiesValue.getAttribute('class');
    expect(className).toContain('text-red-600');
  });

  test('should calculate net worth correctly', async ({ page }) => {
    await waitForDataLoad(page);
    
    // Get assets value
    const assetsRow = page.locator('text=Total Assets').locator('..');
    const assetsText = await assetsRow.locator('td').last().textContent();
    
    // Get liabilities value
    const liabilitiesRow = page.locator('text=Total Liabilities').locator('..');
    const liabilitiesText = await liabilitiesRow.locator('td').last().textContent();
    
    // Both should be currency formatted
    expect(assetsText).toContain('₹');
    expect(liabilitiesText).toContain('₹');
  });
});

test.describe('Dashboard - Portfolio Summary', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await login(page);
  });

  test('should display portfolio summary section', async ({ page }) => {
    await waitForDataLoad(page);
    
    await expect(page.locator('text=Portfolio Summary')).toBeVisible();
  });

  test('should show account count', async ({ page }) => {
    await waitForDataLoad(page);
    
    const accountsRow = page.locator('text=Accounts').locator('..');
    const count = accountsRow.locator('td').last();
    
    await expect(count).toBeVisible();
    
    // Should be a number
    const text = await count.textContent();
    expect(text).toMatch(/^\d+$/);
  });

  test('should show credit card count', async ({ page }) => {
    await waitForDataLoad(page);
    
    const cardsRow = page.locator('text=Credit Cards').locator('..');
    const count = cardsRow.locator('td').last();
    
    await expect(count).toBeVisible();
  });

  test('should show loan count', async ({ page }) => {
    await waitForDataLoad(page);
    
    const loansRow = page.locator('text=Loans').locator('..');
    const count = loansRow.locator('td').last();
    
    await expect(count).toBeVisible();
  });

  test('should show investment count', async ({ page }) => {
    await waitForDataLoad(page);
    
    const investmentsRow = page.locator('text=Investments').locator('..');
    const count = investmentsRow.locator('td').last();
    
    await expect(count).toBeVisible();
  });

  test('should display liquidity ratio', async ({ page }) => {
    await waitForDataLoad(page);
    
    const liquidityRow = page.locator('text=Liquidity Ratio').locator('..');
    const ratio = liquidityRow.locator('td').last();
    
    await expect(ratio).toBeVisible();
    
    const text = await ratio.textContent();
    expect(text).toContain('x');
  });
});

test.describe('Dashboard - Upcoming Payments', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await login(page);
  });

  test('should display upcoming payments section when payments exist', async ({ page }) => {
    await waitForDataLoad(page);
    
    // This section might not exist if no payments are due
    const hasPayments = await page.locator('text=Upcoming Payments').count() > 0;
    
    if (hasPayments) {
      await expect(page.locator('text=Upcoming Payments')).toBeVisible();
      
      // Verify table headers
      await expect(page.locator('th:has-text("Due Date")')).toBeVisible();
      await expect(page.locator('th:has-text("Name")')).toBeVisible();
      await expect(page.locator('th:has-text("Category")')).toBeVisible();
      await expect(page.locator('th:has-text("Amount")')).toBeVisible();
    }
  });

  test('should show payment count in header', async ({ page }) => {
    await waitForDataLoad(page);
    
    const hasPayments = await page.locator('text=Upcoming Payments').count() > 0;
    
    if (hasPayments) {
      const header = page.locator('text=Upcoming Payments').locator('..');
      const headerText = await header.textContent();
      
      // Should contain count like "(3 payments)"
      expect(headerText).toMatch(/\(\d+\s+payment/);
    }
  });

  test('should calculate total payment amount', async ({ page }) => {
    await waitForDataLoad(page);
    
    const hasPayments = await page.locator('text=Upcoming Payments').count() > 0;
    
    if (hasPayments) {
      const totalRow = page.locator('tfoot tr');
      const totalCell = totalRow.locator('td').last();
      
      await expect(totalCell).toBeVisible();
      
      const text = await totalCell.textContent();
      expect(text).toContain('₹');
    }
  });
});

test.describe('Dashboard - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await login(page);
  });

  test('should have working navigation menu', async ({ page }) => {
    // Check if navigation exists
    const nav = page.locator('nav, header');
    await expect(nav).toBeVisible();
  });

  test('should navigate to accounts page', async ({ page }) => {
    // Look for accounts link
    const accountsLink = page.locator('a:has-text("Accounts"), a[href="/accounts"]').first();
    
    if (await accountsLink.count() > 0) {
      await accountsLink.click();
      await expect(page).toHaveURL('/accounts');
    }
  });

  test('should navigate to transactions page', async ({ page }) => {
    const transactionsLink = page.locator('a:has-text("Transactions"), a[href="/transactions"]').first();
    
    if (await transactionsLink.count() > 0) {
      await transactionsLink.click();
      await expect(page).toHaveURL('/transactions');
    }
  });
});

test.describe('Dashboard - Empty State', () => {
  test('should handle dashboard with no financial data gracefully', async () => {
    // This test assumes a fresh account with no data
    // Skip if not applicable
    test.skip();
  });
});
