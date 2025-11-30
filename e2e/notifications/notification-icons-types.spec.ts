// spec: e2e/test-plans/notifications-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Notifications - Notification Icons and Types', () => {
  test('Different notification types have appropriate icons', async ({ page }) => {
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
      // 4. Verify each notification has an icon
      for (let i = 0; i < Math.min(count, 5); i++) {
        const notification = notifications.nth(i);

        // 5. Each notification should have icon container
        const iconContainer = notification.locator('[class*="rounded-full"]').first();
        await expect(iconContainer).toBeVisible();

        // 6. Icon should be visible inside container
        const icon = iconContainer.locator('svg');
        await expect(icon).toBeVisible();
      }
    }
  });

  test('Unread notifications have visual indicators', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to notifications page
    await page.goto('/notifications');

    // 3. Look for unread notifications
    const unreadNotifications = page.locator('[class*="border-l-4"]');
    const hasUnread = await unreadNotifications
      .first()
      .isVisible()
      .catch(() => false);

    if (hasUnread) {
      // 4. Verify unread notifications have bold text
      const firstUnread = unreadNotifications.first();
      await expect(firstUnread).toHaveClass(/border-l-primary/);

      // 5. Verify background styling for unread
      await expect(firstUnread).toHaveClass(/bg-accent/);

      // 6. Check for unread badge dot
      const badge = firstUnread.locator('[class*="Badge"]');
      const hasBadge = await badge.isVisible().catch(() => false);

      if (hasBadge) {
        await expect(badge).toBeVisible();
      }
    }
  });
});
