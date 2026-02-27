import { test, expect } from '../fixtures/test-base';

test.describe('Notification Settings', () => {
  test.beforeEach(async ({ authenticatedPage: page, mainUserId }) => {
    await page.goto(`/user/${mainUserId}/notification-settings`);
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display notification settings page', async ({ authenticatedPage: page }) => {
    const title = page.getByText(/notification settings/i);
    await expect(title.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display settings tabs', async ({ authenticatedPage: page }) => {
    // Tabs: Delivery, Groups, Events, Amendments, Blogs, Todos, Social, Timeline
    const deliveryTab = page.getByRole('tab', { name: /delivery/i });
    await expect(deliveryTab).toBeVisible({ timeout: 10000 });

    const groupsTab = page.getByRole('tab', { name: /groups/i });
    await expect(groupsTab).toBeVisible();

    const eventsTab = page.getByRole('tab', { name: /events/i });
    await expect(eventsTab).toBeVisible();
  });

  test('should display toggle switches for each notification category', async ({ authenticatedPage: page }) => {
    const switches = page.getByRole('switch');
    await expect(switches.first()).toBeVisible({ timeout: 10000 });
  });

  test('should toggle a notification setting', async ({ authenticatedPage: page }) => {
    const switches = page.getByRole('switch');
    await expect(switches.first()).toBeVisible({ timeout: 10000 });

    const firstSwitch = switches.first();
    const wasChecked = await firstSwitch.isChecked();

    await firstSwitch.click();

    // Verify toggle state changed
    if (wasChecked) {
      await expect(firstSwitch).not.toBeChecked();
    } else {
      await expect(firstSwitch).toBeChecked();
    }
  });

  test('should display Reset to defaults button', async ({ authenticatedPage: page }) => {
    const resetButton = page.getByRole('button', { name: /reset to defaults/i });
    await expect(resetButton).toBeVisible({ timeout: 10000 });
  });
});
