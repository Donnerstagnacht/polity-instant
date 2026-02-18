import { test, expect } from '../fixtures/test-base';
test.describe('Create Feature', () => {
  test('Create Agenda Item', async ({ authenticatedPage: page }) => {
    await page.goto('/create/agenda-item');

    // Step 0: Event selection + Title + Description
    // Title input
    const titleInput = page.locator('#agenda-title');
    await expect(titleInput).toBeVisible();
    await titleInput.fill('Opening Remarks');

    // Description
    const descInput = page.locator('#agenda-description');
    if (await descInput.isVisible()) {
      await descInput.fill('Welcome and introductions');
    }

    // Verify form loaded correctly
    expect(page.url()).toContain('/create/agenda-item');
  });
});
