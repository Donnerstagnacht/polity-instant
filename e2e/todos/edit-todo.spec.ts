import { test, expect } from '../fixtures/test-base';

test.describe('Todos - Edit Todo', () => {
  test('User can open todo for editing', async ({
    authenticatedPage: page,
    todoFactory,
    mainUserId,
  }) => {
    await todoFactory.createTodo(mainUserId, { title: 'E2E Open Edit Todo' });
    await page.goto('/todos');
    await page.waitForLoadState('networkidle');

    const listViewBtn = page.getByRole('button', { name: /list/i });
    if ((await listViewBtn.count()) > 0) {
      await listViewBtn.click();
    }

    const todoCard = page.getByText('E2E Open Edit Todo');
    await expect(todoCard).toBeVisible({ timeout: 10000 });
    await todoCard.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    const editButton = dialog.getByRole('button', { name: /edit/i });
    await expect(editButton).toBeVisible();
  });

  test('User can edit todo title', async ({
    authenticatedPage: page,
    todoFactory,
    mainUserId,
  }) => {
    await todoFactory.createTodo(mainUserId, { title: 'E2E Edit Todo Title' });
    await page.goto('/todos');
    await page.waitForLoadState('networkidle');

    const listViewBtn = page.getByRole('button', { name: /list/i });
    if ((await listViewBtn.count()) > 0) {
      await listViewBtn.click();
    }

    const todoCard = page.getByText('E2E Edit Todo Title');
    await expect(todoCard).toBeVisible({ timeout: 10000 });
    await todoCard.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    const editButton = dialog.getByRole('button', { name: /edit/i });
    await editButton.click();

    const titleInput = dialog.getByRole('textbox').first();
    await titleInput.clear();
    const timestamp = Date.now();
    await titleInput.fill(`Updated Todo ${timestamp}`);

    const saveButton = dialog.getByRole('button', { name: /save/i });
    await saveButton.click();
    // Wait for save to complete
    await page.waitForTimeout(1000);

    // Close the dialog and verify the title updated on the page
    const closeButton = dialog.getByRole('button', { name: /close/i });
    if (await closeButton.isVisible().catch(() => false)) {
      await closeButton.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await expect(page.getByText(`Updated Todo ${timestamp}`).first()).toBeVisible({ timeout: 10000 });
  });

  test('User can change todo priority', async ({
    authenticatedPage: page,
    todoFactory,
    mainUserId,
  }) => {
    await todoFactory.createTodo(mainUserId, { title: 'E2E Priority Change Todo', priority: 'low' });
    await page.goto('/todos');
    await page.waitForLoadState('networkidle');

    const listViewBtn = page.getByRole('button', { name: /list/i });
    if ((await listViewBtn.count()) > 0) {
      await listViewBtn.click();
    }

    const todoCard = page.getByText('E2E Priority Change Todo');
    await expect(todoCard).toBeVisible({ timeout: 10000 });
    await todoCard.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    const editButton = dialog.getByRole('button', { name: /edit/i });
    await editButton.click();

    // Priority is the second combobox (after status)
    const selects = dialog.locator('[role="combobox"]');
    const prioritySelect = selects.nth(1);
    await prioritySelect.click();
    const highOption = page.getByRole('option', { name: /high/i });
    await highOption.click();

    const saveButton = dialog.getByRole('button', { name: /save/i });
    await saveButton.click();
  });
});
