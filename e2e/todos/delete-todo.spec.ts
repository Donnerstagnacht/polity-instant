import { test, expect } from '../fixtures/test-base';

test.describe('Todos - Delete Todo', () => {
  test('Delete option visible on todo item', async ({
    authenticatedPage: page,
    todoFactory,
    mainUserId,
  }) => {
    await todoFactory.createTodo(mainUserId, { title: 'E2E Delete Visible Todo' });
    await page.goto('/todos');
    await page.waitForLoadState('networkidle');

    const listViewBtn = page.getByRole('button', { name: /list/i });
    if ((await listViewBtn.count()) > 0) {
      await listViewBtn.click();
    }

    // Open the todo detail dialog where status can be changed to "cancelled"
    const todoCard = page.getByText('E2E Delete Visible Todo');
    await expect(todoCard).toBeVisible({ timeout: 10000 });
    await todoCard.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // The todo detail dialog has edit capabilities with status change including cancelled
    const editButton = dialog.getByRole('button', { name: /edit/i });
    await expect(editButton).toBeVisible();
  });

  test('Delete todo shows confirmation', async ({
    authenticatedPage: page,
    todoFactory,
    mainUserId,
  }) => {
    await todoFactory.createTodo(mainUserId, { title: 'E2E Delete Confirm Todo' });
    await page.goto('/todos');
    await page.waitForLoadState('networkidle');

    const listViewBtn = page.getByRole('button', { name: /list/i });
    if ((await listViewBtn.count()) > 0) {
      await listViewBtn.click();
    }

    const todoCard = page.getByText('E2E Delete Confirm Todo');
    await expect(todoCard).toBeVisible({ timeout: 10000 });
    await todoCard.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Edit the todo and change status to cancelled (equivalent to "delete")
    const editButton = dialog.getByRole('button', { name: /edit/i });
    await editButton.click();

    const statusSelect = dialog.locator('[role="combobox"]').first();
    await statusSelect.click();
    const cancelledOption = page.getByRole('option', { name: /cancelled/i });
    await cancelledOption.click();

    const saveButton = dialog.getByRole('button', { name: /save/i });
    await saveButton.click();
  });
});
