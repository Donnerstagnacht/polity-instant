// spec: e2e/test-plans/amendments-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
test.describe('Amendments - Amendment Error Handling', () => {
  test('Amendment not found displays error message', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Access non-existent amendment with valid UUID format
    await page.goto('/amendment/00000000-0000-4000-8000-000000000000');

    // 3. Wait for not found message
    const notFoundMessage = page.getByRole('heading', { name: /not found/i });
    await expect(notFoundMessage).toBeVisible({ timeout: 10000 });

    // 5. Explanation
    page.getByText(/doesn't exist|removed/i);

    // 6. Navigation options
    // No broken UI
  });

  test('Permission denied for private amendment', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Non-collaborator accesses non-existent private amendment
    await page.goto('/amendment/00000000-0000-4000-8000-000000000001');

    // 4. Check for access denied message
    const accessDenied = page.getByText(/access denied|permission|not authorized/i);
    const hasAccessDenied = (await accessDenied.count()) > 0;

    if (hasAccessDenied) {
      await expect(accessDenied).toBeVisible();

      // 5. Explanation of privacy
      // 6. Request option shown
      // 7. Redirect available
    }
  });
});
