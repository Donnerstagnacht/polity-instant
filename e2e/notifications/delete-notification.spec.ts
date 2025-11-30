// spec: e2e/test-plans/notifications-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Notifications - Delete Notifications', () => {
  test('User deletes individual notification', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to notifications page
    await page.goto('/notifications');

    // 3. Check for notifications
    const notificationCard = page
      .locator('[class*="CardContent"]')
      .filter({ has: page.locator('p[class*="font-medium"]') })
      .first();
    const hasNotifications = await notificationCard.isVisible().catch(() => false);

    if (hasNotifications) {
      // 4. Get initial count
      const initialCount = await page
        .locator('[class*="CardContent"]')
        .filter({ has: page.locator('p[class*="font-medium"]') })
        .count();

      // 5. Hover over notification to reveal delete button
      await notificationCard.hover();

      // 6. Find and click delete button (X button)
      const deleteButton = notificationCard
        .locator('button')
        .filter({ has: page.locator('svg') })
        .last();
      await expect(deleteButton).toBeVisible();
      await deleteButton.click();

      // 7. Wait for deletion
      await page.waitForTimeout(500);

      // 8. Verify notification count decreased or empty state shown
      const newCount = await page
        .locator('[class*="CardContent"]')
        .filter({ has: page.locator('p[class*="font-medium"]') })
        .count();

      if (newCount === 0) {
        // All notifications deleted
        await expect(page.getByText(/no notifications yet/i)).toBeVisible();
      } else {
        expect(newCount).toBe(initialCount - 1);
      }
    } else {
      // No notifications to delete
      await expect(page.getByText(/no notifications yet/i)).toBeVisible();
    }
  });
});
