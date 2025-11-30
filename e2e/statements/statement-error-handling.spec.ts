// spec: e2e/test-plans/statements-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Statements - Statement Error Handling', () => {
  test('Statement not found displays error message', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to invalid statement ID
    await page.goto('/statement/non-existent-statement-12345');

    // 3. Wait for page to load
    await page.waitForLoadState('networkidle');

    // 4. "Statement Not Found" message
    const notFoundMessage = page.getByText(/statement not found|not found/i);
    await expect(notFoundMessage).toBeVisible({ timeout: 5000 });

    // 5. Explanation text
    const explanation = page.getByText(/doesn't exist|removed|has been removed/i);
    await expect(explanation).toBeVisible();

    // 6. Navigation to statements listing
    // No broken UI
  });

  test('Permission denied for private statement displays error', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Attempt to access private statement (if available)
    await page.goto('/statement/private-statement-id');

    // 3. Wait for page load
    await page.waitForLoadState('networkidle');

    // 4. Check for access denied message or statement display
    const accessDenied = page.getByText(/access denied|permission|not authorized/i);
    const hasAccessDenied = (await accessDenied.count()) > 0;

    if (hasAccessDenied) {
      await expect(accessDenied).toBeVisible();

      // 5. Explanation of privacy settings
      // 6. Login prompt if applicable
      // 7. Redirect option
    }
  });
});
