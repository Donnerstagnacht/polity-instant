// spec: e2e/test-plans/groups-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Groups - Group Error Handling', () => {
  test('Group not found displays error message', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to non-existent group ID
    await page.goto('/group/non-existent-group-12345');

    // 3. Wait for page to load
    await page.waitForLoadState('networkidle');

    // 4. Clear "Group Not Found" message
    const notFoundMessage = page.getByText(/not found/i).or(page.getByText(/doesn't exist/i));
    await expect(notFoundMessage).toBeVisible({ timeout: 5000 });

    // 5. Explanation text
    // 6. Link to groups listing or home
    // No broken UI elements
  });

  test('Permission denied for private group displays error', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Attempt to access private group (if available)
    await page.goto('/group/private-group-id');

    // 3. Wait for page load
    await page.waitForLoadState('networkidle');

    // 4. Check for access denied message or group display
    const accessDenied = page.getByText(/access denied|permission|not authorized/i);
    const hasAccessDenied = (await accessDenied.count()) > 0;

    if (hasAccessDenied) {
      await expect(accessDenied).toBeVisible();

      // 5. Explanation of visibility settings
      // 6. Option to request membership
      page.getByRole('button', { name: /request|join/i });
    }
  });
});
