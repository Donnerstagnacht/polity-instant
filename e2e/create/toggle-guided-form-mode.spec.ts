import { test, expect } from '../fixtures/test-base';
test.describe('Create Feature', () => {
  test('Navigate from dashboard to entity creation', async ({ authenticatedPage: page }) => {
    // Navigate to create dashboard
    await page.goto('/create');

    // Verify entity creation links are visible
    await expect(page.locator('a[href="/create/group"]')).toBeVisible();
    await expect(page.locator('a[href="/create/event"]')).toBeVisible();
    await expect(page.locator('a[href="/create/statement"]')).toBeVisible();

    // Click group link to navigate to create group page
    await page.locator('a[href="/create/group"]').click();
    await expect(page).toHaveURL('/create/group');
  });
});
