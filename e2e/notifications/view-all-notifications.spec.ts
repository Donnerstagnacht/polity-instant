// spec: e2e/test-plans/notifications-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Notifications - View All Notifications', () => {
  test('User views all notifications', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to notifications page
    await page.goto('/notifications');

    // 3. User is on "All" tab
    const allTab = page.getByRole('tab', { name: /all/i });
    await expect(allTab).toHaveAttribute('data-state', 'active');

    // 4. Check if notifications exist
    const notificationCards = page
      .locator('[class*="CardContent"]')
      .filter({ has: page.locator('p[class*="font-medium"]') });
    const hasNotifications = await notificationCards
      .first()
      .isVisible()
      .catch(() => false);

    if (hasNotifications) {
      // 5. Each notification shows icon, sender, message, timestamp
      const firstNotification = notificationCards.first();

      // Verify notification structure
      await expect(firstNotification).toBeVisible();

      // Check for icon presence
      const icon = firstNotification.locator('svg').first();
      await expect(icon).toBeVisible();

      // Check for timestamp
      const timestamp = firstNotification.locator('p[class*="text-xs"]');
      await expect(timestamp).toBeVisible();
    } else {
      // No notifications - verify empty state
      await expect(page.getByText(/no notifications yet/i)).toBeVisible();
    }
  });
});
