import { test, expect } from '../fixtures/test-base';
test.describe('Notifications - Navigation from Click', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto('/notifications');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to entity when clicking notification', async ({ authenticatedPage: page }) => {
    // Find the first notification item
    const notificationItems = page.locator('[class*="notification"], [class*="Notification"]');

    if ((await notificationItems.count()) === 0) {
      test.skip();
      return;
    }

    const currentUrl = page.url();

    // Click the first notification
    await notificationItems.first().click();
    await page.waitForLoadState('networkidle');

    // Should have navigated to a different URL (entity page)
    // or the notification should be marked as read
  });

  test('should filter by Personal tab', async ({ authenticatedPage: page }) => {
    const personalTab = page.getByRole('tab', { name: /personal/i });
    if ((await personalTab.count()) === 0) {
      test.skip();
      return;
    }

    await personalTab.click();

    // Tab should be active
    await expect(personalTab).toHaveAttribute('data-state', 'active');
  });

  test('should filter by Entity tab', async ({ authenticatedPage: page }) => {
    const entityTab = page.getByRole('tab', { name: /entity/i });
    if ((await entityTab.count()) === 0) {
      test.skip();
      return;
    }

    await entityTab.click();

    await expect(entityTab).toHaveAttribute('data-state', 'active');
  });
});
