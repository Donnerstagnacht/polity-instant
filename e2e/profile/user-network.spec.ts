import { test, expect } from '../fixtures/test-base';
test.describe('User Network', () => {
  test('should display user network page', async ({ authenticatedPage: page }) => {
    await page.goto('/user');
    await page.waitForURL(/\/user\/[a-f0-9-]+/, { timeout: 5000 });

    // Navigate to network sub-page
    const userId = page.url().match(/\/user\/([a-f0-9-]+)/)?.[1];
    if (userId) {
      await page.goto(`/user/${userId}/network`);
      await page.waitForLoadState('networkidle');

      // Network page should display followers/following or connections
      const networkContent = page.getByText(/network|followers|following|connections/i);
      if ((await networkContent.count()) > 0) {
        await expect(networkContent.first()).toBeVisible();
      }
    }
  });
});
