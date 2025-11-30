// spec: e2e/test-plans/notifications-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Notifications - Unread Count Badge', () => {
  test('Unread count shows in page header', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to notifications page
    await page.goto('/notifications');

    // 3. Check for unread count in header
    const headerText = page
      .locator('p[class*="text-muted-foreground"]')
      .filter({ hasText: /unread|caught up/i });
    await expect(headerText).toBeVisible();

    // 4. Verify count is displayed
    const headerContent = await headerText.textContent();
    expect(headerContent).toMatch(/\d+ unread|all caught up/i);
  });

  test('Tab badges show notification counts', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to notifications page
    await page.goto('/notifications');

    // 3. Verify All tab has count badge
    const allTab = page.getByRole('tab', { name: /all/i });
    const allBadge = allTab.locator('[class*="Badge"]');
    await expect(allBadge).toBeVisible();

    // 4. Verify badge shows number
    const allCount = await allBadge.textContent();
    expect(allCount).toMatch(/^\d+$/);

    // 5. Check Unread tab badge
    const unreadTab = page.getByRole('tab', { name: /unread/i });
    const unreadBadge = unreadTab.locator('[class*="Badge"]');

    const hasUnreadBadge = await unreadBadge.isVisible().catch(() => false);

    if (hasUnreadBadge) {
      // If there are unread notifications, badge should show count
      const unreadCount = await unreadBadge.textContent();
      expect(unreadCount).toMatch(/^\d+$/);
    }
  });

  test('Unread count decreases when notifications marked as read', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to notifications page
    await page.goto('/notifications');

    // 3. Check if mark all as read button exists
    const markAllButton = page.getByRole('button', { name: /mark all as read/i });
    const hasUnread = await markAllButton.isVisible().catch(() => false);

    if (hasUnread) {
      // 4. Mark all as read
      await markAllButton.click();
      await page.waitForTimeout(1000);

      // 6. Verify count is now 0
      await expect(page.getByText(/all caught up/i)).toBeVisible();
    }
  });
});
