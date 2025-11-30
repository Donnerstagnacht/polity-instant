// spec: e2e/test-plans/timeline-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Timeline - Load Timeline Page', () => {
  test('Authenticated user loads home page with timeline', async ({ page }) => {
    // 1. User logs in
    await loginAsTestUser(page);

    // 2. User navigates to home page (/)
    await page.goto('/');

    // 3. Timeline component loads
    // 4. Shows "Your Timeline" or "Subscription Feed" heading
    await expect(page.getByText(/your timeline/i)).toBeVisible();

    // 5. Check for loading state or content
    const isLoading = await page
      .getByText(/loading updates/i)
      .isVisible()
      .catch(() => false);

    if (isLoading) {
      // Wait for loading to complete
      await page.waitForTimeout(2000);
    }

    // Verify timeline header is visible
    await expect(page.getByText(/your timeline/i)).toBeVisible();
  });
});
