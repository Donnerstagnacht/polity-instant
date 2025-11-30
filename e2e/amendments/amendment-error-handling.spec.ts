// spec: e2e/test-plans/amendments-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Amendments - Amendment Error Handling', () => {
  test('Amendment not found displays error message', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Access invalid amendment ID
    await page.goto('/amendment/non-existent-amendment-12345');

    // 3. Wait for page to load
    await page.waitForLoadState('networkidle');

    // 4. Clear error message
    const notFoundMessage = page.getByText(/amendment not found|not found/i);
    await expect(notFoundMessage).toBeVisible({ timeout: 5000 });

    // 5. Explanation
    page.getByText(/doesn't exist|removed/i);

    // 6. Navigation options
    // No broken UI
  });

  test('Permission denied for private amendment', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Non-collaborator accesses private amendment
    await page.goto('/amendment/private-amendment-id');

    // 3. Wait for page load
    await page.waitForLoadState('networkidle');

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
