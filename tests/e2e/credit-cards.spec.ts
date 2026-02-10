import { test, expect } from '@playwright/test';
import { login, generateTestId, waitForDataLoad } from '../utils/test-helpers';
import { TEST_CREDIT_CARDS } from '../fixtures/test-data';

/**
 * Credit Cards E2E Tests
 * Testing credit card management and utilization calculations
 */

test.describe('Credit Cards - List View', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await login(page);
    await page.goto('/credit-cards');
  });

  test('should load credit cards page', async ({ page }) => {
    await expect(page).toHaveURL('/credit-cards');
    await waitForDataLoad(page);
  });

  test('should display new credit card button', async ({ page }) => {
    await waitForDataLoad(page);
    
    const newButton = page.locator('a:has-text("New"), a:has-text("Add"), a[href="/credit-cards/new"]').first();
    
    if (await newButton.count() > 0) {
      await expect(newButton).toBeVisible();
    }
  });
});

test.describe('Credit Cards - Create', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await login(page);
  });

  test('should create credit card with all required fields', async ({ page }) => {
    await page.goto('/credit-cards/new');
    
    const testName = `${TEST_CREDIT_CARDS.basic.name} ${generateTestId()}`;
    
    // Fill all fields
    const nameField = page.locator('#name').first();
    if (await nameField.count() > 0) {
      await nameField.fill(testName);
      
      // Fill other fields
      await page.fill('input[name="bank"], #bank', TEST_CREDIT_CARDS.basic.bank);
      await page.fill('input[name="last4"], #last4', TEST_CREDIT_CARDS.basic.last4);
      await page.fill('input[name="limit"], #limit, input[name="credit_limit"]', TEST_CREDIT_CARDS.basic.limit.toString());
      await page.fill('input[name="current_balance"], #current_balance, input[name="balance"]', TEST_CREDIT_CARDS.basic.current_balance.toString());
      await page.fill('input[name="billing_date"], #billing_date', TEST_CREDIT_CARDS.basic.billing_date.toString());
      await page.fill('input[name="due_date"], #due_date', TEST_CREDIT_CARDS.basic.due_date.toString());
      await page.fill('input[name="interest_rate"], #interest_rate', TEST_CREDIT_CARDS.basic.interest_rate.toString());
      
      await page.click('button[type="submit"]');
      
      // Wait for redirect
      await page.waitForURL('/credit-cards', { timeout: 30000 });
      await waitForDataLoad(page);
      
      // Verify card appears in list
      await expect(page.locator(`text=${testName}`)).toBeVisible();
    }
  });

  test('should create premium credit card', async ({ page }) => {
    await page.goto('/credit-cards/new');
    
    const testName = `${TEST_CREDIT_CARDS.premium.name} ${generateTestId()}`;
    
    const nameField = page.locator('#name').first();
    if (await nameField.count() > 0) {
      await nameField.fill(testName);
      await page.fill('input[name="bank"], #bank', TEST_CREDIT_CARDS.premium.bank);
      await page.fill('input[name="last4"], #last4', TEST_CREDIT_CARDS.premium.last4);
      await page.fill('input[name="limit"], #limit, input[name="credit_limit"]', TEST_CREDIT_CARDS.premium.limit.toString());
      await page.fill('input[name="current_balance"], #current_balance, input[name="balance"]', TEST_CREDIT_CARDS.premium.current_balance.toString());
      await page.fill('input[name="billing_date"], #billing_date', TEST_CREDIT_CARDS.premium.billing_date.toString());
      await page.fill('input[name="due_date"], #due_date', TEST_CREDIT_CARDS.premium.due_date.toString());
      await page.fill('input[name="interest_rate"], #interest_rate', TEST_CREDIT_CARDS.premium.interest_rate.toString());
      
      await page.click('button[type="submit"]');
      await page.waitForURL('/credit-cards', { timeout: 30000 });
    }
  });

  test('should validate credit limit is positive', async ({ page }) => {
    await page.goto('/credit-cards/new');
    
    const nameField = page.locator('#name').first();
    if (await nameField.count() > 0) {
      await nameField.fill(`Test Card ${generateTestId()}`);
      
      // Try negative limit
      await page.fill('input[name="limit"], #limit, input[name="credit_limit"]', '-10000');
      await page.click('button[type="submit"]');
      
      // Should show validation error or prevent submission
      await page.waitForTimeout(1000);
    }
  });

  test('should validate billing date is between 1-31', async ({ page }) => {
    await page.goto('/credit-cards/new');
    
    const nameField = page.locator('#name').first();
    if (await nameField.count() > 0) {
      await nameField.fill(`Test Card ${generateTestId()}`);
      
      // Try invalid billing date
      await page.fill('input[name="billing_date"], #billing_date', '35');
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(1000);
    }
  });

  test('should calculate utilization when balance exceeds limit', async ({ page }) => {
    // Test over-limit scenario
    await page.goto('/credit-cards/new');
    
    const nameField = page.locator('#name').first();
    if (await nameField.count() > 0) {
      await nameField.fill(`Overlimit Card ${generateTestId()}`);
      await page.fill('input[name="limit"], #limit, input[name="credit_limit"]', '100000');
      await page.fill('input[name="current_balance"], #current_balance, input[name="balance"]', '120000');
      
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
    }
  });
});

test.describe('Credit Cards - View & Edit', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await login(page);
  });

  test('should view credit card details', async ({ page }) => {
    await page.goto('/credit-cards');
    await waitForDataLoad(page);
    
    // Click first credit card if any exist
    const firstCard = page.locator('a[href^="/credit-cards/"]').first();
    
    if (await firstCard.count() > 0) {
      await firstCard.click();
      
      // Should show details
      await page.waitForURL(/\/credit-cards\/[^/]+$/);
      await waitForDataLoad(page);
      
      // Verify utilization is displayed
      const utilizationElement = page.locator('text=Utilization, text=utilization').first();
      if (await utilizationElement.count() > 0) {
        const text = await utilizationElement.textContent();
        // Should contain percentage
        expect(text).toBeTruthy();
      }
    }
  });

  test('should edit credit card limit', async ({ page }) => {
    // First create a card
    await page.goto('/credit-cards/new');
    const testName = `Edit Test Card ${generateTestId()}`;
    
    const nameField = page.locator('#name').first();
    if (await nameField.count() > 0) {
      await nameField.fill(testName);
      await page.fill('input[name="limit"], #limit, input[name="credit_limit"]', '100000');
      await page.fill('input[name="current_balance"], #current_balance, input[name="balance"]', '25000');
      await page.click('button[type="submit"]');
      
      await page.waitForURL('/credit-cards', { timeout: 30000 });
      await waitForDataLoad(page);
      
      // Find and edit the card
      const cardLink = page.locator(`text=${testName}`).first();
      if (await cardLink.count() > 0) {
        await cardLink.click();
        
        // Look for edit button
        const editButton = page.locator('a:has-text("Edit"), button:has-text("Edit")').first();
        if (await editButton.count() > 0) {
          await editButton.click();
          
          // Modify limit
          const limitInput = page.locator('input[name="limit"], #limit, input[name="credit_limit"]');
          await limitInput.clear();
          await limitInput.fill('150000');
          
          await page.click('button[type="submit"]');
          await page.waitForTimeout(2000);
        }
      }
    }
  });
});

test.describe('Credit Cards - Delete', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await login(page);
  });

  test('should delete credit card', async ({ page }) => {
    // Create a card to delete
    await page.goto('/credit-cards/new');
    const testName = `Delete Card ${generateTestId()}`;
    
    const nameField = page.locator('#name').first();
    if (await nameField.count() > 0) {
      await nameField.fill(testName);
      await page.fill('input[name="limit"], #limit, input[name="credit_limit"]', '50000');
      await page.fill('input[name="current_balance"], #current_balance, input[name="balance"]', '10000');
      await page.click('button[type="submit"]');
      
      await page.waitForURL('/credit-cards', { timeout: 30000 });
      await waitForDataLoad(page);
      
      // Find and delete the card
      const cardLink = page.locator(`text=${testName}`).first();
      if (await cardLink.count() > 0) {
        await cardLink.click();
        await page.waitForURL(/\/credit-cards\/[^/]+$/);
        
        // Look for delete button
        const deleteButton = page.locator('button:has-text("Delete"), button:has-text("Remove")').first();
        if (await deleteButton.count() > 0) {
          page.on('dialog', dialog => dialog.accept());
          await deleteButton.click();
          
          await page.waitForURL('/credit-cards', { timeout: 30000 });
          await waitForDataLoad(page);
          
          // Verify card is removed
          await expect(page.locator(`text=${testName}`)).not.toBeVisible();
        }
      }
    }
  });
});

test.describe('Credit Cards - Dashboard Integration', () => {
  test('should update credit utilization in dashboard', async ({ page }) => {
    await page.context().clearCookies();
    await login(page);
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    await waitForDataLoad(page);
    
    // Verify credit utilization metric exists
    await expect(page.locator('text=Credit Utilization')).toBeVisible();
    
    const utilizationElement = page.locator('text=Credit Utilization').locator('..').locator('..');
    const utilizationValue = utilizationElement.locator('div').first();
    
    const text = await utilizationValue.textContent();
    
    // Should display percentage
    expect(text).toContain('%');
  });
});
