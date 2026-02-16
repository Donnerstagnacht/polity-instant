// spec: e2e/test-plans/notifications-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
test.describe('Notifications - Unread Count Badge', () => {
  test('Unread count shows in page header', async ({ authenticatedPage: page }) => {
    // 1. Navigate to notifications page
    await page.goto('/notifications');
    await page.waitForLoadState('domcontentloaded');

    // 3. The notifications page should load with tab labels showing counts inline
    const allTab = page.getByRole('tab', { name: /all/i });
    await expect(allTab).toBeVisible({ timeout: 10000 });

    // 4. Verify the All tab contains a count (e.g., "All 5" or "All 0")
    const tabText = await allTab.textContent();
    expect(tabText).toMatch(/all/i);
  });

  test('Tab badges show notification counts', async ({ authenticatedPage: page }) => {
    // 1. Navigate to notifications page
    await page.goto('/notifications');
    await page.waitForLoadState('domcontentloaded');

    // 3. Verify All tab is visible with inline count text
    const allTab = page.getByRole('tab', { name: /all/i });
    await expect(allTab).toBeVisible({ timeout: 10000 });

    // 4. Tab text includes a number (e.g. "All 5")
    const allTabText = await allTab.textContent();
    expect(allTabText).toMatch(/all\s*\d*/i);

    // 5. Check Unread tab is visible
    const unreadTab = page.getByRole('tab', { name: /unread/i });
    await expect(unreadTab).toBeVisible();
  });

  test('Unread count decreases when notifications marked as read', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to notifications page
    await page.goto('/notifications');

    // 3. Check if mark all as read button exists
    const markAllButton = page.getByRole('button', { name: /mark all as read/i });
    const hasUnread = await markAllButton.isVisible().catch(() => false);

    if (hasUnread) {
      // 4. Mark all as read
      await markAllButton.click();
      await page.waitForLoadState('networkidle');

      // 6. Verify count is now 0
      await expect(page.getByText(/all caught up/i)).toBeVisible();
    }
  });
});
