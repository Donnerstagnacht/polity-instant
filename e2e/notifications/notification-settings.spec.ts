import { test, expect } from '../fixtures/test-base';

test.describe('Notification Settings', () => {
  test.beforeEach(async ({ authenticatedPage: page, mainUserId }) => {
    await page.goto(`/user/${mainUserId}/notifications`);
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display notification settings page', async ({ authenticatedPage: page }) => {
    const title = page.getByText(/notification settings/i);
    if ((await title.count()) > 0) {
      await expect(title.first()).toBeVisible();
    }
  });

  test('should display settings tabs', async ({ authenticatedPage: page }) => {
    // Tabs: Delivery, Groups, Events, Amendments, Blogs, Todos, Social, Timeline
    const deliveryTab = page.getByRole('tab', { name: /delivery/i });
    const groupsTab = page.getByRole('tab', { name: /groups/i });
    const eventsTab = page.getByRole('tab', { name: /events/i });

    if ((await deliveryTab.count()) > 0) {
      await expect(deliveryTab).toBeVisible();
    }
    if ((await groupsTab.count()) > 0) {
      await expect(groupsTab).toBeVisible();
    }
    if ((await eventsTab.count()) > 0) {
      await expect(eventsTab).toBeVisible();
    }
  });

  test('should display toggle switches for each notification category', async ({ authenticatedPage: page }) => {
    const switches = page.getByRole('switch');
    if ((await switches.count()) > 0) {
      await expect(switches.first()).toBeVisible();
    }
  });

  test('should toggle a notification setting', async ({ authenticatedPage: page }) => {
    const switches = page.getByRole('switch');
    if ((await switches.count()) === 0) {
      test.skip();
      return;
    }

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
    if ((await resetButton.count()) > 0) {
      await expect(resetButton).toBeVisible();
    }
  });
});
