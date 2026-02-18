import { test, expect } from '../fixtures/test-base';
test.describe('Create Feature', () => {
  test('Guided Mode - Create Todo', async ({ authenticatedPage: page }) => {
    await page.goto('/create/todo');

    // Step 0: Title + Description (both on same step)
    const titleInput = page.locator('#todo-title');
    await expect(titleInput).toBeVisible();
    await titleInput.fill('Complete project documentation');

    const descInput = page.locator('#todo-description');
    if (await descInput.isVisible()) {
      await descInput.fill('Write comprehensive documentation for the new feature');
    }

    const nextButton = page.getByRole('button', { name: 'Next', exact: true });

    // Navigate: Step 0→1→2→3 (3 clicks to reach review)
    for (let i = 0; i < 3; i++) {
      await nextButton.click();
    }

    // Step 3: Review - Click Create Todo
    const createButton = page.getByRole('button', { name: /create.*todo/i });
    await expect(createButton).toBeVisible();
    await createButton.click();

    // Wait for success
    await page.waitForLoadState('networkidle');

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
