import { test, expect } from '@playwright/test';

test.describe('Create Feature', () => {
  test('Guided Mode - Create Todo', async ({ page }) => {
    // Navigate to create page
    await page.goto('/create');

    // Select Todos entity type
    const todosOption = page
      .locator('text=Todos')
      .or(page.locator('[data-entity="todos"]'))
      .first();
    await todosOption.click();

    await page.waitForTimeout(500);

    // Enter todo title
    const titleInput = page
      .locator('input[name="title"]')
      .or(page.getByPlaceholder(/title/i))
      .first();
    await titleInput.fill('Complete project documentation');

    // Advance carousel
    const nextButton = page
      .locator('[data-testid="next-button"]')
      .or(page.locator('button:has-text("Next")'))
      .first();
    if (await nextButton.isVisible()) {
      await nextButton.click();
    }

    // Enter description
    const descriptionInput = page
      .locator('textarea[name="description"]')
      .or(page.getByPlaceholder(/description/i))
      .first();
    await descriptionInput.fill('Write comprehensive documentation for the new feature');

    if (await nextButton.isVisible()) {
      await nextButton.click();
    }

    // Set priority
    const prioritySelect = page
      .locator('select[name="priority"]')
      .or(page.locator('[data-testid="priority-select"]'))
      .first();
    if (await prioritySelect.isVisible()) {
      await prioritySelect.selectOption('high');
    }

    if (await nextButton.isVisible()) {
      await nextButton.click();
    }

    // Set due date
    const dueDateInput = page
      .locator('input[type="date"]')
      .or(page.locator('input[name="dueDate"]'))
      .first();
    if (await dueDateInput.isVisible()) {
      await dueDateInput.fill('2024-12-31');
    }

    // Click Create Todo button
    const createButton = page
      .locator('button:has-text("Create")')
      .or(page.locator('[data-testid="create-button"]'))
      .first();
    await createButton.click();

    // Wait for success
    await page.waitForTimeout(1000);

    // Verify success message or redirect
    const successMessage = await page
      .locator('text=created')
      .or(page.locator('[role="alert"]'))
      .first()
      .isVisible()
      .catch(() => false);
    const isRedirected = page.url().includes('/todos');

    expect(successMessage || isRedirected).toBeTruthy();
  });
});
