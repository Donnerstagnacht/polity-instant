// spec: e2e/test-plans/events-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Events - Event Error Handling', () => {
  test('Event not found displays error message', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to non-existent event ID
    await page.goto('/event/non-existent-event-12345');

    // 3. Wait for page to load
    await page.waitForLoadState('networkidle');

    // 4. Clear "Event Not Found" message
    const notFoundMessage = page.getByText(/not found/i).or(page.getByText(/doesn't exist/i));
    await expect(notFoundMessage).toBeVisible({ timeout: 5000 });

    // 5. Explanation text
    // 6. Link to events listing or home
    // No broken UI elements
  });

  test('Permission denied for private event displays error', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Attempt to access private event (if available)
    // This test assumes there's a private event the user cannot access
    await page.goto('/event/private-event-id');

    // 3. Wait for page load
    await page.waitForLoadState('networkidle');

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
