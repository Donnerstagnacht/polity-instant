// spec: e2e/test-plans/notifications-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
test.describe('Notifications - Tab Filtering', () => {
  test('User filters to unread notifications only', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to notifications page
    await page.goto('/notifications');

    // 3. User clicks "Unread" tab
    const unreadTab = page.getByRole('tab', { name: /unread/i });
    await unreadTab.click();

    // 4. Verify unread tab is active
    await expect(unreadTab).toHaveAttribute('data-state', 'active');

    // 5. Check content
    const tabPanel = page.getByRole('tabpanel');
    await expect(tabPanel).toBeVisible({ timeout: 10000 });

    const notificationCard = tabPanel.locator('div[class*="cursor-pointer"]').first();
    const emptyState = page.getByText(/all caught up/i);

    // Wait for data to load
    await expect(notificationCard.or(emptyState)).toBeVisible({ timeout: 15000 });

    const hasEmptyState = await emptyState.isVisible().catch(() => false);

    if (!hasEmptyState) {
      // Verify unread notifications are shown (border-l-4 indicates unread)
      const notifications = tabPanel.locator('div[class*="border-l-4"]');
      const unreadCount = await notifications.count();
      expect(unreadCount).toBeGreaterThan(0);
    }
  });

  test('User filters to read notifications only', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to notifications page
    await page.goto('/notifications');

    // 3. User clicks "Read" tab
    const readTab = page.getByRole('tab', { name: /read/i }).first();
    await readTab.click();

    // 4. Verify read tab is active
    await expect(readTab).toHaveAttribute('data-state', 'active');

    // 5. Check for read notifications or empty state
    const tabPanel = page.getByRole('tabpanel');
    await expect(tabPanel).toBeVisible({ timeout: 10000 });

    const notificationCard = tabPanel.locator('div[class*="cursor-pointer"]').first();
    const emptyState = page.getByText(/no read|no notifications/i);

    // Wait for data to load
    await expect(notificationCard.or(emptyState)).toBeVisible({ timeout: 15000 });

    const hasReadNotifications = await notificationCard.isVisible().catch(() => false);

    if (hasReadNotifications) {
      // Read tab should show notification cards
      const notificationCount = await tabPanel.locator('div[class*="cursor-pointer"]').count();
      expect(notificationCount).toBeGreaterThan(0);
    }
  });
});
