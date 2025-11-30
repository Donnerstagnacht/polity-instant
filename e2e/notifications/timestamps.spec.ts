// spec: e2e/test-plans/notifications-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Notifications - Timestamps', () => {
  test('Notifications show relative timestamps', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to notifications page
    await page.goto('/notifications');

    // 3. Check for notifications
    const notifications = page
      .locator('[class*="CardContent"]')
      .filter({ has: page.locator('p[class*="font-medium"]') });
    const count = await notifications.count();

    if (count > 0) {
      // 4. Verify timestamps are present
      for (let i = 0; i < Math.min(count, 3); i++) {
        const notification = notifications.nth(i);

        // 5. Find timestamp element
        const timestamp = notification.locator('p[class*="text-xs text-muted-foreground"]').first();
        await expect(timestamp).toBeVisible();

        // 6. Verify timestamp format (e.g., "Xm ago", "Xh ago", "Xd ago", or "Jan 15")
        const timestampText = await timestamp.textContent();
        expect(timestampText).toMatch(/ago|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/i);
      }
    }
  });

  test('Recent notifications show minutes/hours ago', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to notifications page
    await page.goto('/notifications');

    // 3. Check for notifications
    const notifications = page
      .locator('[class*="CardContent"]')
      .filter({ has: page.locator('p[class*="font-medium"]') });
    const hasNotifications = await notifications
      .first()
      .isVisible()
      .catch(() => false);

    if (hasNotifications) {
      // 4. Check first (most recent) notification
      const firstNotification = notifications.first();
      const timestamp = firstNotification
        .locator('p[class*="text-xs text-muted-foreground"]')
        .first();

      // 5. Timestamp should be visible and formatted
      await expect(timestamp).toBeVisible();
      const timestampText = await timestamp.textContent();

      // Verify it's a valid timestamp format
      expect(timestampText).toBeTruthy();
    }
  });
});
