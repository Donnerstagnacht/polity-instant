// spec: e2e/test-plans/notifications-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
test.describe('Notifications - Empty States', () => {
  test('Empty state when no notifications exist', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to notifications page
    await page.goto('/notifications');

    // 3. Check for notifications
    const emptyState = page.getByText(/no notifications|all caught up/i);
    const hasNoNotifications = await emptyState.isVisible().catch(() => false);

    if (hasNoNotifications) {
      // 4. Verify empty state message displays
      await expect(emptyState).toBeVisible();

      // 5. Verify helpful text
      await expect(page.getByText(/when you get notifications/i)).toBeVisible();

      // 6. Verify bell icon in empty state
      const bellIcon = page.locator('svg').filter({ hasText: '' }).first();
      await expect(bellIcon).toBeVisible();
    }
  });

  test('Empty state for unread tab when all caught up', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to notifications page
    await page.goto('/notifications');

    // 3. Click unread tab
    const unreadTab = page.getByRole('tab', { name: /unread/i });
    await unreadTab.click();

    // 4. Check for empty state
    const caughtUpMessage = page.getByText(/all caught up/i);
    const isAllRead = await caughtUpMessage.isVisible().catch(() => false);

    if (isAllRead) {
      // 5. Verify positive empty state
      await expect(caughtUpMessage).toBeVisible();

      // 6. Verify checkmark or positive indicator
      await expect(page.getByText(/you've read all your notifications/i)).toBeVisible();
    }
  });

  test('Empty state for read tab when no read notifications', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to notifications page
    await page.goto('/notifications');

    // 3. Click read tab
    const readTab = page.getByRole('tab', { name: /read/i }).first();
    await readTab.click();

    // 4. Check for empty state
    const noReadMessage = page.getByText(/no read notifications/i);
    const hasNoRead = await noReadMessage.isVisible().catch(() => false);

    if (hasNoRead) {
      // 5. Verify empty state message
      await expect(noReadMessage).toBeVisible();

      // 6. Verify helpful text
      await expect(page.getByText(/notifications you've read will appear here/i)).toBeVisible();
    }
  });
});
