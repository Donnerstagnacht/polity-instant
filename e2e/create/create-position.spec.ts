import { test, expect } from '../fixtures/test-base';
test.describe('Create Feature', () => {
  test('Create Position', async ({ authenticatedPage: page }) => {
    await page.goto('/create/position');

    // Step 0: Group selection + Title
    const titleInput = page.locator('#position-title');
    await expect(titleInput).toBeVisible();
    await titleInput.fill('President');

    // Verify form loaded correctly
    expect(page.url()).toContain('/create/position');
  });
});
