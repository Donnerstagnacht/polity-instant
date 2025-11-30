import { test, expect } from '@playwright/test';

test.describe('Create Feature', () => {
  test('Load Create Page', async ({ page }) => {
    // Navigate to create page
    await page.goto('/create');

    // Verify page loads successfully
    await expect(page).toHaveURL('/create');

    // Verify guided mode is default
    const guidedModeIndicator = page
      .locator('[data-testid="guided-mode"]')
      .or(page.locator('text=Guided Mode'))
      .first();
    await expect(guidedModeIndicator).toBeVisible();

    // Verify mode toggle is visible
    const modeToggle = page
      .locator('[data-testid="mode-toggle"]')
      .or(page.getByRole('switch'))
      .first();
    await expect(modeToggle).toBeVisible();

    // Verify entity type selection carousel displays
    const entityCarousel = page
      .locator('[data-testid="entity-carousel"]')
      .or(page.locator('text=Groups').or(page.locator('text=Events')))
      .first();
    await expect(entityCarousel).toBeVisible();
  });
});
