// spec: e2e/test-plans/notifications-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
test.describe('Notifications - View All Notifications', () => {
  test('User views all notifications', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to notifications page
    await page.goto('/notifications');

    // Wait for page to load
    await expect(page.getByRole('heading', { name: /notifications/i })).toBeVisible({ timeout: 15000 });

    // 3. User is on "All" tab
    const allTab = page.getByRole('tab', { name: /all/i });
    await expect(allTab).toHaveAttribute('data-state', 'active');

    // 4. Check if notifications exist via the tab panel
    const tabPanel = page.getByRole('tabpanel');
    await expect(tabPanel).toBeVisible({ timeout: 10000 });

    const notificationCards = tabPanel.locator('div[class*="cursor-pointer"]');
    const emptyState = page.getByText(/no notifications yet|no notifications/i);

    // Wait for data to load: either notifications or empty state will appear
    await expect(notificationCards.first().or(emptyState)).toBeVisible({ timeout: 15000 });

    const hasNotifications = await notificationCards.first().isVisible().catch(() => false);

    if (hasNotifications) {
      // 5. Each notification shows icon, sender, message, timestamp
      const firstNotification = notificationCards.first();

      // Check for icon presence
      const icon = firstNotification.locator('svg').first();
      await expect(icon).toBeVisible();

      // Check for timestamp
      const timestamp = firstNotification.locator('p[class*="text-xs"]');
      await expect(timestamp).toBeVisible();
    } else {
      // No notifications - verify empty state
      await expect(page.getByText(/no notifications yet|no notifications/i)).toBeVisible();
    }
  });
});
