import { test, expect } from '../fixtures/test-base';
import { gotoWithRetry } from '../helpers/navigation';

test.describe('Group Operations - Add Payment', () => {
  test('should display Add Income button', async ({
    authenticatedPage: page,
    groupFactory,
    mainUserId,
  }) => {
    const group = await groupFactory.createGroup(mainUserId, { name: 'E2E Payment Group' });
    await gotoWithRetry(page, `/group/${group.id}/operation`);

    const addIncomeButton = page.getByRole('button', { name: /add income/i });
    await expect(addIncomeButton).toBeVisible({ timeout: 10000 });
  });

  test('should display Add Expense button', async ({
    authenticatedPage: page,
    groupFactory,
    mainUserId,
  }) => {
    const group = await groupFactory.createGroup(mainUserId, { name: 'E2E Expense Group' });
    await gotoWithRetry(page, `/group/${group.id}/operation`);

    const addExpenseButton = page.getByRole('button', { name: /add expense/i });
    await expect(addExpenseButton).toBeVisible({ timeout: 10000 });
  });

  test('should open Add Income dialog with form fields', async ({
    authenticatedPage: page,
    groupFactory,
    mainUserId,
  }) => {
    const group = await groupFactory.createGroup(mainUserId, { name: 'E2E Income Dialog Group' });
    await gotoWithRetry(page, `/group/${group.id}/operation`);

    const addIncomeButton = page.getByRole('button', { name: /add income/i });
    await expect(addIncomeButton).toBeVisible({ timeout: 10000 });
    await addIncomeButton.click();

    // Dialog should show - scope to dialog to avoid strict mode violation
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('#payment-label')).toBeVisible();
    await expect(dialog.locator('#payment-amount')).toBeVisible();
  });

  test('should add an income payment via the dialog', async ({
    authenticatedPage: page,
    groupFactory,
    mainUserId,
  }) => {
    const group = await groupFactory.createGroup(mainUserId, { name: 'E2E Add Income Group' });
    await gotoWithRetry(page, `/group/${group.id}/operation`);

    const addIncomeButton = page.getByRole('button', { name: /add income/i });
    await expect(addIncomeButton).toBeVisible({ timeout: 10000 });
    await addIncomeButton.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Fill in the form
    await dialog.locator('#payment-label').fill('Test Membership Fee');

    // Enter amount
    await dialog.locator('#payment-amount').fill('50.00');

    // Select a payer entity (required) — open the combobox popover
    const entityCombobox = dialog.locator('#payment-entity');
    await entityCombobox.click();
    await page.waitForTimeout(500);

    // Select the first user from the list
    const firstUser = page.getByRole('option').first();
    await expect(firstUser).toBeVisible({ timeout: 5000 });
    await firstUser.click();
    await page.waitForTimeout(300);

    // Submit
    const submitButton = dialog.getByRole('button', { name: /add payment/i });
    await submitButton.click();

    // Verify success toast
    const toast = page.getByText(/payment added/i);
    await expect(toast).toBeVisible({ timeout: 5000 });
  });

  test('should open Add Expense dialog', async ({
    authenticatedPage: page,
    groupFactory,
    mainUserId,
  }) => {
    const group = await groupFactory.createGroup(mainUserId, { name: 'E2E Expense Dialog Group' });
    await gotoWithRetry(page, `/group/${group.id}/operation`);

    const addExpenseButton = page.getByRole('button', { name: /add expense/i });
    await expect(addExpenseButton).toBeVisible({ timeout: 10000 });
    await addExpenseButton.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });
  });
});
