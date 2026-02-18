import { test, expect } from '../fixtures/test-base';
test.describe('Create Feature', () => {
  test('Load Create Page', async ({ authenticatedPage: page }) => {
    // Navigate to create page
    await page.goto('/create');

    // Verify page loads successfully
    await expect(page).toHaveURL('/create');

    // Verify dashboard shows entity creation links
    await expect(page.locator('a[href="/create/group"]')).toBeVisible();
    await expect(page.locator('a[href="/create/event"]')).toBeVisible();
    await expect(page.locator('a[href="/create/amendment"]')).toBeVisible();
    await expect(page.locator('a[href="/create/blog"]')).toBeVisible();
    await expect(page.locator('a[href="/create/todo"]')).toBeVisible();
    await expect(page.locator('a[href="/create/statement"]')).toBeVisible();
  });
});
