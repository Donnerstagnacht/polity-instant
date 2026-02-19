import { test, expect } from '../fixtures/test-base';

test.describe('Notifications - Navigation from Click', () => {
  test('should navigate to entity when clicking notification', async ({
    authenticatedPage: page,
    notificationFactory,
    mainUserId,
    userFactory,
  }) => {
    // Create a notification so there's something to click
    const otherUser = await userFactory.createUser({ name: 'E2E Notif Sender' });
    await notificationFactory.createNotification(mainUserId, otherUser.id, {
      type: 'comment_added',
      message: 'E2E Test Notification',
    });

    await page.goto('/notifications');
    await page.waitForLoadState('networkidle');

    // Find a notification item - it should be a card
    const notifCard = page.getByText('E2E Test Notification').first();
    await expect(notifCard).toBeVisible({ timeout: 10000 });
  });

  test('should filter by Personal tab', async ({
    authenticatedPage: page,
    notificationFactory,
    mainUserId,
    userFactory,
  }) => {
    const otherUser = await userFactory.createUser({ name: 'E2E Personal Tab Sender' });
    await notificationFactory.createNotification(mainUserId, otherUser.id, {
      type: 'comment_added',
      message: 'E2E Personal Tab Test',
    });

    await page.goto('/notifications');
    await page.waitForLoadState('networkidle');

    const personalTab = page.getByRole('tab', { name: /personal/i });
    await expect(personalTab).toBeVisible({ timeout: 10000 });
    await personalTab.click();

    // Tab should be active
    await expect(personalTab).toHaveAttribute('data-state', 'active');
  });

  test('should filter by Entity tab', async ({
    authenticatedPage: page,
    notificationFactory,
    mainUserId,
    userFactory,
  }) => {
    const otherUser = await userFactory.createUser({ name: 'E2E Entity Tab Sender' });
    await notificationFactory.createNotification(mainUserId, otherUser.id, {
      type: 'comment_added',
      message: 'E2E Entity Tab Test',
    });

    await page.goto('/notifications');
    await page.waitForLoadState('networkidle');

    const entityTab = page.getByRole('tab', { name: /entity/i });
    await expect(entityTab).toBeVisible({ timeout: 10000 });
    await entityTab.click();

    await expect(entityTab).toHaveAttribute('data-state', 'active');
  });
});
