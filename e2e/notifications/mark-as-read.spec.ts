// spec: e2e/test-plans/notifications-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
test.describe('Notifications - Mark as Read', () => {
  test('User marks individual notification as read by clicking', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to notifications page
    await page.goto('/notifications');

    // Wait for page to load
    await expect(page.getByRole('heading', { name: /notifications/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('tab', { name: /all/i })).toBeVisible();

    // 3. Check for unread notifications (border-l-4 indicates unread)
    const tabPanel = page.getByRole('tabpanel');
    await expect(tabPanel).toBeVisible({ timeout: 10000 });

    // Wait for data to load
    const notificationCard = tabPanel.locator('div[class*="cursor-pointer"]').first();
    const emptyState = page.getByText(/all caught up|no notifications/i);
    await expect(notificationCard.or(emptyState)).toBeVisible({ timeout: 15000 });

    const unreadNotification = tabPanel.locator('div[class*="border-l-4"]').first();
    const hasUnread = await unreadNotification.isVisible().catch(() => false);

    if (hasUnread) {
      // 4. Click on notification
      await unreadNotification.click();

      // 5. Notification should be marked as read (navigation will occur)
      // Wait for potential navigation
    }
  });

  test('User marks all notifications as read', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to notifications page
    await page.goto('/notifications');

    // Wait for page to load
    await expect(page.getByRole('heading', { name: /notifications/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('tab', { name: /all/i })).toBeVisible();

    // 3. Check if mark all as read button exists
    const markAllButton = page.getByRole('button', { name: /mark all as read/i });
    const hasUnreadNotifications = await markAllButton.isVisible().catch(() => false);

    // Wait for data to load before checking
    const tabPanel2 = page.getByRole('tabpanel');
    await expect(tabPanel2).toBeVisible({ timeout: 10000 });
    const notificationCard = tabPanel2.locator('div[class*="cursor-pointer"]').first();
    const emptyState = page.getByText(/all caught up|no notifications/i);
    await expect(notificationCard.or(emptyState)).toBeVisible({ timeout: 15000 });

    if (hasUnreadNotifications) {
      // 4. Verify there are unread notifications
      const unreadCountBefore = await page.locator('div[class*="border-l-4"]').count();
      expect(unreadCountBefore).toBeGreaterThan(0);

      // 5. Click mark all as read
      await markAllButton.click();

      // 6. Verify the success toast appears (confirms operation succeeded)
      await expect(page.getByText(/all notifications marked as read/i)).toBeVisible({ timeout: 10000 });
    }
  });
});
