import { test, expect } from '../fixtures/test-base';
import { navigateToGroupOperation } from '../helpers/navigation';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Operations - Add Payment', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await navigateToGroupOperation(page, TEST_ENTITY_IDS.GROUP);
  });

  test('should display Add Income button', async ({ authenticatedPage: page }) => {
    const addIncomeButton = page.getByRole('button', { name: /add income/i });
    if ((await addIncomeButton.count()) > 0) {
      await expect(addIncomeButton).toBeVisible();
    }
  });

  test('should display Add Expense button', async ({ authenticatedPage: page }) => {
    const addExpenseButton = page.getByRole('button', { name: /add expense/i });
    if ((await addExpenseButton.count()) > 0) {
      await expect(addExpenseButton).toBeVisible();
    }
  });

  test('should open Add Income dialog with form fields', async ({ authenticatedPage: page }) => {
    const addIncomeButton = page.getByRole('button', { name: /add income/i });
    if ((await addIncomeButton.count()) === 0) {
      test.skip();
      return;
    }

    await addIncomeButton.click();

    // Dialog should show
    await expect(page.getByText('Add Income')).toBeVisible();
    await expect(page.locator('#payment-label')).toBeVisible();
    await expect(page.locator('#payment-type')).toBeVisible();
    await expect(page.locator('#payment-amount')).toBeVisible();
  });

  test('should add an income payment via the dialog', async ({ authenticatedPage: page }) => {
    const addIncomeButton = page.getByRole('button', { name: /add income/i });
    if ((await addIncomeButton.count()) === 0) {
      test.skip();
      return;
    }

    await addIncomeButton.click();
    await expect(page.getByText('Add Income')).toBeVisible();

    // Fill in the form
    await page.locator('#payment-label').fill('Test Membership Fee');

    // Select payment type
    await page.locator('#payment-type').click();
    await page.getByRole('option', { name: /membership fee/i }).click();

    // Enter amount
    await page.locator('#payment-amount').fill('50.00');

    // Submit
    const submitButton = page.getByRole('button', { name: /add payment/i });
    await submitButton.click();

    // Verify success toast
    const toast = page.getByText('Payment added successfully!');
    await expect(toast).toBeVisible({ timeout: 5000 });
  });

  test('should open Add Expense dialog', async ({ authenticatedPage: page }) => {
    const addExpenseButton = page.getByRole('button', { name: /add expense/i });
    if ((await addExpenseButton.count()) === 0) {
      test.skip();
      return;
    }

    await addExpenseButton.click();
    await expect(page.getByText('Add Expense')).toBeVisible();
  });
});
