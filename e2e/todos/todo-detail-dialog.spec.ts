import { test, expect } from '../fixtures/test-base';

test.describe('Todos - Detail Dialog', () => {
  test('should open todo detail dialog when clicking a todo', async ({
    authenticatedPage: page,
    todoFactory,
    mainUserId,
  }) => {
    await todoFactory.createTodo(mainUserId, { title: 'E2E Dialog Test Todo' });
    await page.goto('/todos');
    await page.waitForLoadState('networkidle');

    // Switch to list view to get clickable cards
    const listViewBtn = page.getByRole('button', { name: /list/i });
    if ((await listViewBtn.count()) > 0) {
      await listViewBtn.click();
    }

    const todoCard = page.getByText('E2E Dialog Test Todo');
    await expect(todoCard).toBeVisible({ timeout: 10000 });
    await todoCard.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await expect(dialog.getByText('E2E Dialog Test Todo')).toBeVisible();
  });

  test('should edit todo title in detail dialog', async ({
    authenticatedPage: page,
    todoFactory,
    mainUserId,
  }) => {
    await todoFactory.createTodo(mainUserId, { title: 'E2E Edit Title Todo' });
    await page.goto('/todos');
    await page.waitForLoadState('networkidle');

    const listViewBtn = page.getByRole('button', { name: /list/i });
    if ((await listViewBtn.count()) > 0) {
      await listViewBtn.click();
    }

    const todoCard = page.getByText('E2E Edit Title Todo');
    await expect(todoCard).toBeVisible({ timeout: 10000 });
    await todoCard.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    const editButton = dialog.getByRole('button', { name: /edit/i });
    await expect(editButton).toBeVisible();
    await editButton.click();

    const titleInput = dialog.getByRole('textbox').first();
    await expect(titleInput).toBeVisible();
    await titleInput.clear();
    await titleInput.fill('Updated E2E Todo Title');

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
    await expect(page.getByText('Updated E2E Todo Title').first()).toBeVisible({ timeout: 10000 });
  });

  test('should change todo status in detail dialog', async ({
    authenticatedPage: page,
    todoFactory,
    mainUserId,
  }) => {
    await todoFactory.createTodo(mainUserId, { title: 'E2E Status Change Todo', status: 'pending' });
    await page.goto('/todos');
    await page.waitForLoadState('networkidle');

    const listViewBtn = page.getByRole('button', { name: /list/i });
    if ((await listViewBtn.count()) > 0) {
      await listViewBtn.click();
    }

    const todoCard = page.getByText('E2E Status Change Todo');
    await expect(todoCard).toBeVisible({ timeout: 10000 });
    await todoCard.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    const editButton = dialog.getByRole('button', { name: /edit/i });
    await editButton.click();

    const statusSelect = dialog.locator('[role="combobox"]').first();
    await statusSelect.click();
    const inProgressOption = page.getByRole('option', { name: /in.progress/i });
    await inProgressOption.click();

    const saveButton = dialog.getByRole('button', { name: /save/i });
    await saveButton.click();
  });
});
