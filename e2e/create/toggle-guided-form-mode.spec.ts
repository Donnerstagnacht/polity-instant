import { test, expect } from '@playwright/test';

test.describe('Create Feature', () => {
  test('Toggle Between Guided and Form Mode', async ({ page }) => {
    // Navigate to create page
    await page.goto('/create');

    // Verify starting in guided mode
    const guidedModeIndicator = page
      .locator('[data-testid="guided-mode"]')
      .or(page.locator('text=Guided Mode'))
      .first();
    await expect(guidedModeIndicator).toBeVisible();

    // Click mode toggle to switch to form mode
    const modeToggle = page
      .locator('[data-testid="mode-toggle"]')
      .or(page.getByRole('switch'))
      .first();
    await modeToggle.click();

    // Verify form mode is active
    const formModeIndicator = page
      .locator('[data-testid="form-mode"]')
      .or(page.locator('text=Form Mode'))
      .first();
    await expect(formModeIndicator).toBeVisible();

    // Verify tabs display for entity types
    await expect(page.locator('text=Groups')).toBeVisible();
    await expect(page.locator('text=Events')).toBeVisible();
    await expect(page.locator('text=Statements')).toBeVisible();

    // Toggle back to guided mode
    await modeToggle.click();

    // Verify back in guided mode
    await expect(guidedModeIndicator).toBeVisible();

    // Verify carousel is back
    const carousel = page
      .locator('[data-testid="entity-carousel"]')
      .or(page.locator('.carousel'))
      .first();
    await expect(carousel).toBeVisible();
  });
});
