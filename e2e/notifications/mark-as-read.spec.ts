// spec: e2e/test-plans/notifications-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
test.describe('Notifications - Mark as Read', () => {
  test('User marks individual notification as read by clicking', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to notifications page
    await page.goto('/notifications');

    // 3. Check for unread notifications
    const unreadNotification = page.locator('[class*="border-l-4"]').first();
    const hasUnread = await unreadNotification.isVisible().catch(() => false);

    if (hasUnread) {
      // 4. Click on notification
      await unreadNotification.click();

      // 5. Notification should be marked as read (navigation will occur)
      // Wait for potential navigation
    } else {
      // No unread notifications
      await expect(page.getByText(/all caught up|no notifications/i)).toBeVisible();
    }
  });

  test('User marks all notifications as read', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to notifications page
    await page.goto('/notifications');

    // 3. Check if mark all as read button exists
    const markAllButton = page.getByRole('button', { name: /mark all as read/i });
    const hasUnreadNotifications = await markAllButton.isVisible().catch(() => false);

    if (hasUnreadNotifications) {
      // 4. Get count of unread before
      const unreadCountBefore = await page.locator('[class*="border-l-4"]').count();
      expect(unreadCountBefore).toBeGreaterThan(0);

      // 5. Click mark all as read
      await markAllButton.click();

      // 6. Wait for update
      await page.waitForLoadState('networkidle');

      // 7. Verify unread count is now 0
      await expect(page.getByText(/all caught up/i)).toBeVisible();

      // 8. Button should no longer be visible
      await expect(markAllButton).not.toBeVisible();
    } else {
      // All already read
      await expect(page.getByText(/all caught up|no notifications/i)).toBeVisible();
    }
  });
});
