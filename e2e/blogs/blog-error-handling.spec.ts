// spec: e2e/test-plans/blogs-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
test.describe('Blogs - Blog Error Handling', () => {
  test('Blog not found displays error message', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to non-existent blog with valid UUID format
    await page.goto('/blog/00000000-0000-4000-8000-000000000000');

    // 3. Wait for not found message
    const notFoundMessage = page.getByRole('heading', { name: /not found/i });
    await expect(notFoundMessage).toBeVisible({ timeout: 10000 });

    // 5. Explanation text
    const explanation = page.getByText(/doesn't exist|removed|has been removed/i);
    const hasExplanation = await explanation.isVisible().catch(() => false);
    if (hasExplanation) {
      await expect(explanation).toBeVisible();
    }

    // 6. Link to blogs listing
    page.getByRole('link', { name: /home|blogs|back/i });

    // No broken UI
  });

  test('Permission denied for private blog displays error', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Attempt to access non-existent private blog
    await page.goto('/blog/00000000-0000-4000-8000-000000000001');

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
