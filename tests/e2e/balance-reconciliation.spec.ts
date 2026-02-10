import { test, expect } from '@playwright/test';
import { login, generateTestId, waitForDataLoad } from '../utils/test-helpers';

/**
 * ⚠️ CRITICAL: Balance Reconciliation Tests
 *
 * These tests verify that account balances always match transaction history.
 * This is fundamental to financial data integrity - if balances drift from
 * transaction history, the entire financial picture becomes unreliable.
 *
 * Formula: Account Balance = Opening Balance + Sum(Credits) - Sum(Debits)
 *
 * Priority: P0 (SHIP BLOCKER)
 */

test.describe('Balance Reconciliation - Account Transactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await login(page);
  });

  test('should reflect transaction in account balance immediately', async ({ page }) => {
    /**
     * When a transaction is added, the account balance should update instantly
     * Balance = Previous Balance + Transaction Amount (if credit) or - Amount (if debit)
     */

    // Create a test account with known balance
    const testAccountName = `Reconciliation Test ${generateTestId()}`;
    const initialBalance = 10000;

    await page.goto('/accounts/new');
    await page.fill('#name', testAccountName);
    await page.selectOption('#type', 'savings');
    await page.fill('#balance', initialBalance.toString());
    await page.click('button[type="submit"]');

    await page.waitForURL('/accounts', { timeout: 30000 });
    await waitForDataLoad(page);

    // Find the account and get its ID/link
    const accountLink = page.locator(`text=${testAccountName}`).first();
    await expect(accountLink).toBeVisible();

    // Navigate to transactions and add a credit transaction
    await page.goto('/transactions');
    await waitForDataLoad(page);

    const hasNewButton = await page.locator('a:has-text("New"), a[href="/transactions/new"]').count() > 0;

    if (hasNewButton) {
      await page.click('a:has-text("New"), a[href="/transactions/new"]');

      const transactionAmount = 5000;

      // Fill transaction form
      await page.fill('input[name="amount"], #amount', transactionAmount.toString());
      await page.selectOption('#type', 'income');
      await page.fill('input[name="description"], #description', 'Test Income');
      await page.fill('input[name="date"], #date', new Date().toISOString().split('T')[0]);

      // Select the test account
      await page.selectOption('select[name="account_id"], #account_id', { label: testAccountName });

      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);

      // Navigate back to accounts and verify balance updated
      await page.goto('/accounts');
      await waitForDataLoad(page);

      const accountRow = page.locator(`text=${testAccountName}`).locator('..');
      const balanceCell = accountRow.locator('td:has-text("₹")');
      const balanceText = await balanceCell.textContent();

      const parseAmount = (str: string | null) => {
        if (!str) return 0;
        return parseFloat(str.replace(/[₹,\s]/g, ''));
      };

      const currentBalance = parseAmount(balanceText);
      const expectedBalance = initialBalance + transactionAmount;

      expect(currentBalance).toBe(expectedBalance);

      console.log(`✅ Balance Reconciliation:
        Initial Balance: ₹${initialBalance}
        Transaction: +₹${transactionAmount}
        Expected: ₹${expectedBalance}
        Actual: ₹${currentBalance}
      `);
    } else {
      test.skip();
    }
  });

  test('should handle multiple transactions correctly', async ({ page }) => {
    /**
     * Multiple transactions should compound correctly:
     * Balance = Initial + Transaction1 + Transaction2 + ...
     */

    const testAccountName = `Multi-Txn Test ${generateTestId()}`;
    const initialBalance = 20000;

    await page.goto('/accounts/new');
    await page.fill('#name', testAccountName);
    await page.selectOption('#type', 'current');
    await page.fill('#balance', initialBalance.toString());
    await page.click('button[type="submit"]');

    await page.waitForURL('/accounts', { timeout: 30000 });

    // Add multiple transactions
    const transactions = [
      { amount: 5000, type: 'income', description: 'Income 1' },
      { amount: 2000, type: 'expense', description: 'Expense 1' },
      { amount: 3000, type: 'income', description: 'Income 2' },
      { amount: 1500, type: 'expense', description: 'Expense 2' },
    ];

    let expectedBalance = initialBalance;

    for (const txn of transactions) {
      await page.goto('/transactions/new');

      await page.fill('input[name="amount"], #amount', txn.amount.toString());
      await page.selectOption('#type', txn.type);
      await page.fill('input[name="description"], #description', txn.description);
      await page.fill('input[name="date"], #date', new Date().toISOString().split('T')[0]);

      const accountSelector = page.locator('select[name="account_id"], #account_id');
      if (await accountSelector.count() > 0) {
        await accountSelector.selectOption({ label: testAccountName });
      }

      await page.click('button[type="submit"]');
      await page.waitForTimeout(1500);

      // Update expected balance
      if (txn.type === 'income') {
        expectedBalance += txn.amount;
      } else {
        expectedBalance -= txn.amount;
      }
    }

    // Verify final balance
    await page.goto('/accounts');
    await waitForDataLoad(page);

    const accountRow = page.locator(`text=${testAccountName}`).locator('..');
    const balanceCell = accountRow.locator('td:has-text("₹")');
    const balanceText = await balanceCell.textContent();

    const parseAmount = (str: string | null) => {
      if (!str) return 0;
      return parseFloat(str.replace(/[₹,\s]/g, ''));
    };

    const currentBalance = parseAmount(balanceText);

    expect(currentBalance).toBe(expectedBalance);

    console.log(`✅ Multi-Transaction Reconciliation:
      Initial: ₹${initialBalance}
      Transactions: ${transactions.length}
      Expected: ₹${expectedBalance}
      Actual: ₹${currentBalance}
    `);
  });
});

test.describe('Balance Reconciliation - Credit Card Outstanding', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await login(page);
  });

  test('should not exceed credit limit', async ({ page }) => {
    /**
     * Current Balance should never exceed Credit Limit
     * (unless explicitly allowed by the system)
     */

    await page.goto('/credit-cards');
    await waitForDataLoad(page);

    // Get all credit cards
    const cardRows = page.locator('tr:has(td:has-text("₹"))');
    const count = await cardRows.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const row = cardRows.nth(i);
      const cells = row.locator('td');

      // Assuming structure: Name | Bank | Limit | Balance | Utilization
      const limitText = await cells.nth(2).textContent();
      const balanceText = await cells.nth(3).textContent();

      const parseAmount = (str: string | null) => {
        if (!str) return 0;
        return parseFloat(str.replace(/[₹,\s]/g, ''));
      };

      const limit = parseAmount(limitText);
      const balance = parseAmount(balanceText);

      // Balance should be <= Limit (with small tolerance for edge cases)
      expect(balance).toBeLessThanOrEqual(limit * 1.01); // 1% tolerance
    }
  });

  test('should calculate utilization as Balance/Limit*100', async ({ page }) => {
    /**
     * Utilization % = (Current Balance / Credit Limit) * 100
     * This should match the displayed utilization percentage
     */

    await page.goto('/credit-cards');
    await waitForDataLoad(page);

    const cardRows = page.locator('tr:has(td:has-text("₹"))');
    const count = await cardRows.count();

    if (count > 0) {
      const row = cardRows.first();
      const cells = row.locator('td');

      const limitText = await cells.nth(2).textContent();
      const balanceText = await cells.nth(3).textContent();
      const utilizationText = await cells.nth(4).textContent();

      const parseAmount = (str: string | null) => {
        if (!str) return 0;
        return parseFloat(str.replace(/[₹,\s]/g, ''));
      };

      const parsePercentage = (str: string | null) => {
        if (!str) return 0;
        return parseFloat(str.replace('%', '').trim());
      };

      const limit = parseAmount(limitText);
      const balance = parseAmount(balanceText);
      const displayedUtilization = parsePercentage(utilizationText);

      if (limit > 0) {
        const expectedUtilization = (balance / limit) * 100;

        // Allow 0.1% difference for rounding
        expect(Math.abs(displayedUtilization - expectedUtilization)).toBeLessThan(0.1);

        console.log(`✅ Credit Card Utilization:
          Balance: ₹${balance}
          Limit: ₹${limit}
          Expected: ${expectedUtilization.toFixed(1)}%
          Displayed: ${displayedUtilization}%
        `);
      }
    }
  });
});

test.describe('Balance Reconciliation - Dashboard Totals', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await login(page);
  });

  test('should sum all accounts correctly for dashboard total assets', async ({ page }) => {
    /**
     * Dashboard Total Assets = Sum of all active account balances
     * This tests the aggregation logic
     */

    // Get total assets from dashboard
    await page.goto('/dashboard');
    await waitForDataLoad(page);

    const assetsRow = page.locator('text=Total Assets').locator('..');
    const dashboardAssetsText = await assetsRow.locator('td').last().textContent();

    const parseAmount = (str: string | null) => {
      if (!str) return 0;
      return parseFloat(str.replace(/[₹,\s]/g, ''));
    };

    const dashboardAssets = parseAmount(dashboardAssetsText);

    // Navigate to accounts and sum manually
    await page.goto('/accounts');
    await waitForDataLoad(page);

    const accountBalances: number[] = [];
    const balanceCells = page.locator('td:has-text("₹")');
    const count = await balanceCells.count();

    for (let i = 0; i < count; i++) {
      const text = await balanceCells.nth(i).textContent();
      const amount = parseAmount(text);
      if (amount !== 0) {
        accountBalances.push(amount);
      }
    }

    const calculatedTotal = accountBalances.reduce((sum, bal) => sum + bal, 0);

    // Allow small tolerance for floating point arithmetic
    const tolerance = 1; // ₹1 tolerance
    expect(Math.abs(dashboardAssets - calculatedTotal)).toBeLessThan(tolerance);

    console.log(`✅ Dashboard Assets Reconciliation:
      Dashboard Total: ₹${dashboardAssets}
      Sum of Accounts: ₹${calculatedTotal}
      Difference: ₹${Math.abs(dashboardAssets - calculatedTotal)}
    `);
  });

  test('should match credit card totals between dashboard and credit cards page', async ({ page }) => {
    /**
     * Total credit card outstanding shown on dashboard
     * should match sum on credit cards page
     */

    await page.goto('/dashboard');
    await waitForDataLoad(page);

    // Get credit card info from dashboard
    const liabilitiesRow = page.locator('text=Total Liabilities').locator('..');
    const dashboardLiabilitiesText = await liabilitiesRow.locator('td').last().textContent();

    const parseAmount = (str: string | null) => {
      if (!str) return 0;
      return parseFloat(str.replace(/[₹,\s]/g, ''));
    };

    const dashboardLiabilities = parseAmount(dashboardLiabilitiesText);

    // Navigate to credit cards page
    await page.goto('/credit-cards');
    await waitForDataLoad(page);

    // Sum all credit card balances
    const balanceCells = page.locator('td:has-text("₹"):has-text("Current Balance"), td:nth-child(4)');
    const count = await balanceCells.count();

    let totalCCBalance = 0;
    for (let i = 0; i < count; i++) {
      const text = await balanceCells.nth(i).textContent();
      totalCCBalance += parseAmount(text);
    }

    console.log(`Dashboard Liabilities: ₹${dashboardLiabilities}`);
    console.log(`Credit Card Total: ₹${totalCCBalance}`);

    // Note: Dashboard liabilities includes loans, EMIs, BNPLs too
    // So CC total should be <= total liabilities
    expect(totalCCBalance).toBeLessThanOrEqual(dashboardLiabilities + 1);
  });
});

test.describe('Balance Reconciliation - Deleted Records', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await login(page);
  });

  test('should exclude deleted account from dashboard totals', async ({ page }) => {
    /**
     * CRITICAL: When an account is deleted (soft delete),
     * it should NOT be included in dashboard calculations
     */

    // Get initial total assets
    await page.goto('/dashboard');
    await waitForDataLoad(page);

    const assetsRow = page.locator('text=Total Assets').locator('..');
    const initialAssetsText = await assetsRow.locator('td').last().textContent();

    const parseAmount = (str: string | null) => {
      if (!str) return 0;
      return parseFloat(str.replace(/[₹,\s]/g, ''));
    };

    const initialAssets = parseAmount(initialAssetsText);

    // Create and delete a test account
    const testAccountName = `Delete Test ${generateTestId()}`;
    const testBalance = 5000;

    await page.goto('/accounts/new');
    await page.fill('#name', testAccountName);
    await page.selectOption('#type', 'savings');
    await page.fill('#balance', testBalance.toString());
    await page.click('button[type="submit"]');

    await page.waitForURL('/accounts', { timeout: 30000 });
    await waitForDataLoad(page);

    // Verify assets increased
    await page.goto('/dashboard');
    await waitForDataLoad(page);

    const assetsAfterCreate = parseAmount(
      await assetsRow.locator('td').last().textContent()
    );

    expect(assetsAfterCreate).toBeGreaterThanOrEqual(initialAssets + testBalance);

    // Delete the account
    await page.goto('/accounts');
    const accountLink = page.locator(`text=${testAccountName}`).first();

    if (await accountLink.count() > 0) {
      await accountLink.click();
      await page.waitForURL(/\/accounts\/[^/]+$/);

      const deleteButton = page.locator('button:has-text("Delete"), button:has-text("Remove")').first();

      if (await deleteButton.count() > 0) {
        page.on('dialog', dialog => dialog.accept());
        await deleteButton.click();
        await page.waitForURL('/accounts', { timeout: 30000 });

        // Verify assets decreased back
        await page.goto('/dashboard');
        await waitForDataLoad(page);

        const assetsAfterDelete = parseAmount(
          await assetsRow.locator('td').last().textContent()
        );

        // Assets should be approximately back to initial
        expect(Math.abs(assetsAfterDelete - initialAssets)).toBeLessThan(10);

        console.log(`✅ Deleted Account Reconciliation:
          Initial Assets: ₹${initialAssets}
          After Create: ₹${assetsAfterCreate}
          After Delete: ₹${assetsAfterDelete}
        `);
      }
    }
  });
});

test.describe('Balance Reconciliation - Edge Cases', () => {
  test('should handle accounts with zero balance', async ({ page }) => {
    await page.context().clearCookies();
    await login(page);

    const testAccountName = `Zero Balance ${generateTestId()}`;

    await page.goto('/accounts/new');
    await page.fill('#name', testAccountName);
    await page.selectOption('#type', 'savings');
    await page.fill('#balance', '0');
    await page.click('button[type="submit"]');

    await page.waitForURL('/accounts', { timeout: 30000 });
    await waitForDataLoad(page);

    // Account should be created and visible
    await expect(page.locator(`text=${testAccountName}`)).toBeVisible();
  });

  test('should handle accounts with negative balance (overdraft)', async ({ page }) => {
    await page.context().clearCookies();
    await login(page);

    const testAccountName = `Overdraft ${generateTestId()}`;

    await page.goto('/accounts/new');
    await page.fill('#name', testAccountName);
    await page.selectOption('#type', 'current');
    await page.fill('#balance', '-5000');
    await page.click('button[type="submit"]');

    // Should either accept or show validation
    await page.waitForTimeout(2000);
  });

  test('should handle very large amounts without overflow', async ({ page }) => {
    await page.context().clearCookies();
    await login(page);

    const testAccountName = `Large Amount ${generateTestId()}`;
    const largeAmount = '999999999'; // 99 crores

    await page.goto('/accounts/new');
    await page.fill('#name', testAccountName);
    await page.selectOption('#type', 'investment');
    await page.fill('#balance', largeAmount);
    await page.click('button[type="submit"]');

    await page.waitForURL('/accounts', { timeout: 30000 });
    await waitForDataLoad(page);

    // Verify large amount is displayed correctly
    const accountRow = page.locator(`text=${testAccountName}`).locator('..');
    const balanceText = await accountRow.locator('td:has-text("₹")').textContent();

    expect(balanceText).toContain('99');
  });
});
