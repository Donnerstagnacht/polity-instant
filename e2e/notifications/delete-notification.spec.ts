// spec: e2e/test-plans/notifications-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
test.describe('Notifications - Delete Notifications', () => {
  test('User deletes individual notification', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to notifications page
    await page.goto('/notifications');

    // Wait for the page to load
    await expect(page.getByRole('heading', { name: /notifications/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('tab', { name: /all/i })).toBeVisible();

    // 3. Check for notifications via the tab panel
    const tabPanel = page.getByRole('tabpanel');
    await expect(tabPanel).toBeVisible({ timeout: 10000 });

    const notificationCard = tabPanel
      .locator('div[class*="cursor-pointer"]')
      .first();
    const emptyState = page.getByText(/no notifications|all caught up/i);

    // Wait for data to load: either notifications or empty state
    await expect(notificationCard.or(emptyState)).toBeVisible({ timeout: 15000 });

    const hasNotifications = await notificationCard.isVisible().catch(() => false);

    if (hasNotifications) {
      // 4. Get initial count
      const initialCount = await tabPanel
        .locator('div[class*="cursor-pointer"]')
        .count();

      // 5. Hover over notification to reveal delete button
      await notificationCard.hover();

      // 6. Find and click delete button (X button)
      const deleteButton = notificationCard
        .locator('button')
        .filter({ has: page.locator('svg') })
        .last();
      await expect(deleteButton).toBeVisible();
      await deleteButton.click();

      // 7. Wait for deletion

      // 8. Verify notification count decreased or empty state shown
      const newCount = await tabPanel
        .locator('div[class*="cursor-pointer"]')
        .count();

      if (newCount === 0) {
        // All notifications deleted
        await expect(page.getByText(/no notifications|all caught up/i)).toBeVisible();
      } else {
        expect(newCount).toBe(initialCount - 1);
      }
    } else {
      // No notifications to delete - verify empty state
      await expect(page.getByText(/no notifications|all caught up/i)).toBeVisible();
    }
  });
});
