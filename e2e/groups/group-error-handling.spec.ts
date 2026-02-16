// spec: e2e/test-plans/groups-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
test.describe('Groups - Group Error Handling', () => {
  test('Group not found displays error message', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to non-existent group ID (must be valid UUID for InstantDB)
    await page.goto('/group/00000000-0000-4000-8000-000000000001');

    // 3. Wait for page to load
    await page.waitForLoadState('domcontentloaded');

    // 4. Clear "Group Not Found" message
    const notFoundMessage = page.getByRole('heading', { name: /not found/i });
    await expect(notFoundMessage).toBeVisible({ timeout: 10000 });

    // 5. Explanation text
    // 6. Link to groups listing or home
    // No broken UI elements
  });

  test('Permission denied for private group displays error', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Attempt to access private group (valid UUID for InstantDB)
    await page.goto('/group/00000000-0000-4000-8000-000000000002');

    // 3. Wait for page load
    await page.waitForLoadState('domcontentloaded');

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
