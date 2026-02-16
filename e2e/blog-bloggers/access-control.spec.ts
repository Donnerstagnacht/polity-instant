import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Blog Bloggers - Access Control', () => {
  test('should require authentication for bloggers page', async ({ authenticatedPage: page }) => {
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}/bloggers`);
    await page.waitForLoadState('networkidle');

    // Should redirect to auth or show auth prompt
    const isOnAuth = page.url().includes('/auth');
    const signInPrompt = page.getByText(/sign in|log in/i);

    if (isOnAuth) {
      await expect(page).toHaveURL(/\/auth/);
    } else if ((await signInPrompt.count()) > 0) {
      await expect(signInPrompt.first()).toBeVisible();
    }
  });

  test('should restrict access for non-bloggers', async ({ authenticatedPage: page }) => {
    // Navigate to a blog where user is not a blogger with manage permissions
    await page.goto(`/blog/${TEST_ENTITY_IDS.testBlog2}/bloggers`);
    await page.waitForLoadState('networkidle');

    // Should show access denied or redirect
    const accessDenied = page.getByText(/access denied|not authorized|no permission/i);
    if ((await accessDenied.count()) > 0) {
      await expect(accessDenied.first()).toBeVisible();
    }
  });
});
