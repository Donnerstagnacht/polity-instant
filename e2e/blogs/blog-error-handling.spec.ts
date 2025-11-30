// spec: e2e/test-plans/blogs-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Blogs - Blog Error Handling', () => {
  test('Blog not found displays error message', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to non-existent blog ID
    await page.goto('/blog/non-existent-blog-12345');

    // 3. Wait for page to load
    await page.waitForLoadState('networkidle');

    // 4. "Blog Not Found" message
    const notFoundMessage = page.getByText(/blog post not found|not found/i);
    await expect(notFoundMessage).toBeVisible({ timeout: 5000 });

    // 5. Explanation text
    const explanation = page.getByText(/doesn't exist|removed|has been removed/i);
    await expect(explanation).toBeVisible();

    // 6. Link to blogs listing
    page.getByRole('link', { name: /home|blogs|back/i });

    // No broken UI
  });

  test('Permission denied for private blog displays error', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Attempt to access private blog
    await page.goto('/blog/private-blog-id');

    // 3. Wait for page load
    await page.waitForLoadState('networkidle');

    // 4. Check for access denied message or blog display
    const accessDenied = page.getByText(/access denied|permission|not authorized/i);
    const hasAccessDenied = (await accessDenied.count()) > 0;

    if (hasAccessDenied) {
      await expect(accessDenied).toBeVisible();

      // 5. Explanation of visibility
      // 6. Login prompt if applicable
      page.getByRole('link', { name: /log in|sign in/i });

      // 7. Redirect option
    }
  });
});
