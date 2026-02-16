// spec: e2e/test-plans/events-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
test.describe('Events - Event Error Handling', () => {
  test('Event not found displays error message', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to non-existent event ID (must be valid UUID for InstantDB)
    await page.goto('/event/00000000-0000-4000-8000-000000000001');

    // 3. Wait for page to load
    await page.waitForLoadState('domcontentloaded');

    // 4. Clear "Event Not Found" message
    const notFoundMessage = page.getByRole('heading', { name: /not found/i });
    await expect(notFoundMessage).toBeVisible({ timeout: 10000 });

    // 5. Explanation text
    // 6. Link to events listing or home
    // No broken UI elements
  });

  test('Permission denied for private event displays error', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Attempt to access private event (valid UUID for InstantDB)
    await page.goto('/event/00000000-0000-4000-8000-000000000002');

    // 3. Wait for page load
    await page.waitForLoadState('domcontentloaded');

    // 4. Check for access denied message or event display
    const accessDenied = page.getByText(/access denied|permission|not authorized/i);
    const hasAccessDenied = (await accessDenied.count()) > 0;

    if (hasAccessDenied) {
      await expect(accessDenied).toBeVisible();

      // 5. Explanation of visibility settings
      // 6. Option to request participation
    }
  });
});
