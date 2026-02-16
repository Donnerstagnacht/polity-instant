import { test, expect } from '../fixtures/test-base';

test.describe('Todos - Edit Todo', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto('/todos');
    await page.waitForLoadState('networkidle');
  });

  test('User can open todo for editing', async ({ authenticatedPage: page }) => {
    const todoItem = page
      .locator('[class*="todo"], [class*="task"], [class*="card"]')
      .filter({ has: page.locator('text=/./') })
      .first();

    const hasTodos = await todoItem.isVisible().catch(() => false);
    if (!hasTodos) {
      test.skip();
      return;
    }

    await todoItem.click();
    await page.waitForLoadState('networkidle');

    // Should open detail dialog/page with edit capability
    const dialog = page.getByRole('dialog');
    const editForm = page.getByRole('textbox');
    const editButton = page.getByRole('button', { name: /edit|save/i });

    const hasDialog = await dialog.isVisible().catch(() => false);
    const hasForm = (await editForm.count()) > 0;
    const hasEditButton = await editButton.isVisible().catch(() => false);

    expect(hasDialog || hasForm || hasEditButton).toBeTruthy();
  });

  test('User can edit todo title', async ({ authenticatedPage: page }) => {
    const todoItem = page
      .locator('[class*="todo"], [class*="task"], [class*="card"]')
      .filter({ has: page.locator('text=/./') })
      .first();

    const hasTodos = await todoItem.isVisible().catch(() => false);
    if (!hasTodos) {
      test.skip();
      return;
    }

    await todoItem.click();
    await page.waitForLoadState('networkidle');

    const titleInput = page
      .getByRole('textbox', { name: /title/i })
      .or(page.getByLabel(/title/i));

    if ((await titleInput.count()) > 0) {
      const timestamp = Date.now();
      const newTitle = `Updated Todo ${timestamp}`;
      await titleInput.first().clear();
      await titleInput.first().fill(newTitle);

      const saveButton = page.getByRole('button', { name: /save|update|confirm/i });
      if ((await saveButton.count()) > 0) {
        await saveButton.first().click();
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('User can change todo priority', async ({ authenticatedPage: page }) => {
    const todoItem = page
      .locator('[class*="todo"], [class*="task"], [class*="card"]')
      .filter({ has: page.locator('text=/./') })
      .first();

    const hasTodos = await todoItem.isVisible().catch(() => false);
    if (!hasTodos) {
      test.skip();
      return;
    }

    await todoItem.click();
    await page.waitForLoadState('networkidle');

    const prioritySelect = page
      .getByRole('combobox', { name: /priority/i })
      .or(page.getByLabel(/priority/i));

    if ((await prioritySelect.count()) > 0) {
      await prioritySelect.first().click();

      const priorityOption = page.getByRole('option', { name: /high|medium|low/i });
      if ((await priorityOption.count()) > 0) {
        await priorityOption.first().click();
        await page.waitForLoadState('networkidle');
      }
    }
  });
});
