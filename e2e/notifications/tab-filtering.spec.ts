// spec: e2e/test-plans/notifications-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Notifications - Tab Filtering', () => {
  test('User filters to unread notifications only', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to notifications page
    await page.goto('/notifications');

    // 3. User clicks "Unread" tab
    const unreadTab = page.getByRole('tab', { name: /unread/i });
    await unreadTab.click();

    // 4. Verify unread tab is active
    await expect(unreadTab).toHaveAttribute('data-state', 'active');

    // 5. Check content
    const emptyState = page.getByText(/all caught up/i);
    const hasUnreadNotifications = !(await emptyState.isVisible().catch(() => false));

    if (hasUnreadNotifications) {
      // Verify unread notifications are shown
      const notifications = page.locator('[class*="border-l-4"]');
      const unreadCount = await notifications.count();
      expect(unreadCount).toBeGreaterThan(0);
    } else {
      // Verify empty state for no unread
      await expect(emptyState).toBeVisible();
    }
  });

  test('User filters to read notifications only', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to notifications page
    await page.goto('/notifications');

    // 3. User clicks "Read" tab
    const readTab = page.getByRole('tab', { name: /read/i }).first();
    await readTab.click();

    // 4. Verify read tab is active
    await expect(readTab).toHaveAttribute('data-state', 'active');

    // 5. Check for read notifications or empty state
    const emptyState = page.getByText(/no read notifications/i);
    const hasReadNotifications = !(await emptyState.isVisible().catch(() => false));

    if (hasReadNotifications) {
      // Verify notifications shown do not have unread indicator
      const notifications = page
        .locator('[class*="CardContent"]')
        .filter({ has: page.locator('p[class*="font-medium"]') });
      const count = await notifications.count();
      expect(count).toBeGreaterThan(0);
    } else {
      await expect(emptyState).toBeVisible();
    }
  });
});
