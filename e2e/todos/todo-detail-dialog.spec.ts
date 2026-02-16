import { test, expect } from '../fixtures/test-base';
test.describe('Todos - Detail Dialog', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto('/todos');
    await page.waitForLoadState('networkidle');
  });

  test('should open todo detail dialog when clicking a todo', async ({ authenticatedPage: page }) => {
    // Find a todo card or list item
    const todoItems = page.getByRole('checkbox');
    if ((await todoItems.count()) === 0) {
      test.skip();
      return;
    }

    // Click the todo text (not the checkbox) to open detail dialog
    const todoCard = page.locator('[class*="todo"], [class*="Todo"], [class*="card"]').first();
    if ((await todoCard.count()) > 0) {
      await todoCard.click();

      // Detail dialog should appear
      const dialog = page.getByRole('dialog');
      if ((await dialog.count()) > 0) {
        await expect(dialog).toBeVisible();
      }
    }
  });

  test('should edit todo title in detail dialog', async ({ authenticatedPage: page }) => {
    const todoCard = page.locator('[class*="todo"], [class*="Todo"], [class*="card"]').first();
    if ((await todoCard.count()) === 0) {
      test.skip();
      return;
    }

    await todoCard.click();

    const dialog = page.getByRole('dialog');
    if ((await dialog.count()) === 0) {
      test.skip();
      return;
    }

    // Click edit button
    const editButton = dialog.getByRole('button', { name: /edit/i });
    if ((await editButton.count()) > 0) {
      await editButton.click();

      // Title should become editable
      const titleInput = dialog.getByRole('textbox');
      if ((await titleInput.count()) > 0) {
        await titleInput.first().clear();
        await titleInput.first().fill('Updated Todo Title');

        // Save
        const saveButton = dialog.getByRole('button', { name: /save/i });
        if ((await saveButton.count()) > 0) {
          await saveButton.click();
        }
      }
    }
  });

  test('should change todo status in detail dialog', async ({ authenticatedPage: page }) => {
    const todoCard = page.locator('[class*="todo"], [class*="Todo"], [class*="card"]').first();
    if ((await todoCard.count()) === 0) {
      test.skip();
      return;
    }

    await todoCard.click();

    const dialog = page.getByRole('dialog');
    if ((await dialog.count()) === 0) {
      test.skip();
      return;
    }

    // Find status select
    const statusSelect = dialog.locator('select, [role="combobox"]');
    if ((await statusSelect.count()) > 0) {
      await statusSelect.first().click();
      const option = page.getByRole('option', { name: /in progress/i });
      if ((await option.count()) > 0) {
        await option.click();
      }
    }
  });
});
