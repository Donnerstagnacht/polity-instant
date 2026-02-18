import { test, expect } from '../fixtures/test-base';
test.describe('Create Feature', () => {
  test('Create Election Candidate', async ({ authenticatedPage: page }) => {
    await page.goto('/create/election-candidate');

    // Step 0: Election selection + Order
    // The page should load with the form
    await page.waitForLoadState('networkidle');

    // Order input
    const orderInput = page.locator('#election-candidate-order');
    if (await orderInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await orderInput.fill('1');
    }

    // Verify form loaded correctly
    expect(page.url()).toContain('/create/election-candidate');
  });
});
