import { test, expect } from '@playwright/test';

test.describe('Create Feature', () => {
  test('Guided Mode - Create Statement', async ({ page }) => {
    // Navigate to create page
    await page.goto('/create');

    // Select Statements entity type
    const statementsOption = page
      .locator('text=Statements')
      .or(page.locator('[data-entity="statements"]'))
      .first();
    await statementsOption.click();

    await page.waitForTimeout(500);

    // Enter statement text
    const textInput = page
      .locator('textarea[name="text"]')
      .or(page.locator('input[name="text"]'))
      .or(page.getByPlaceholder(/statement/i))
      .first();
    await textInput.fill('We should increase funding for renewable energy projects');

    // Advance carousel
    const nextButton = page
      .locator('[data-testid="next-button"]')
      .or(page.locator('button:has-text("Next")'))
      .first();
    if (await nextButton.isVisible()) {
      await nextButton.click();
    }

    // Select statement type
    const typeSelect = page
      .locator('select[name="type"]')
      .or(page.locator('[data-testid="statement-type"]'))
      .first();
    if (await typeSelect.isVisible()) {
      await typeSelect.selectOption('position');
    }

    // Click Create Statement button
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
    const isRedirected = page.url().includes('/statement/') || page.url().includes('/user/');

    expect(successMessage || isRedirected).toBeTruthy();
  });
});
