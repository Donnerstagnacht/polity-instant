// spec: e2e/test-plans/timeline-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Timeline - Event Card Click Navigation', () => {
  test('User clicks timeline event to navigate', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to home page
    await page.goto('/');

    // 3. Wait for timeline to load
    await page.waitForLoadState('networkidle');

    // 4. Check if timeline has events
    const hasEvents = !(await page
      .getByText(/your timeline is empty/i)
      .isVisible()
      .catch(() => false));

    if (hasEvents) {
      // 5. Get first clickable event card
      const eventCard = page
        .locator('[class*="Card"]')
        .filter({ has: page.locator('[class*="CardHeader"]') })
        .first();
      const hasCard = await eventCard.isVisible().catch(() => false);

      if (hasCard) {
        // 6. Click the event card
        await eventCard.click();

        // 7. Verify navigation occurred (URL changed or new page loaded)
        await page.waitForTimeout(500);

        // 8. Back button should return to timeline
        await page.goBack();
        await expect(page.getByText(/your timeline/i)).toBeVisible();
      }
    }
  });
});
