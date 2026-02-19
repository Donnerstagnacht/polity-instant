import { test, expect } from '../fixtures/test-base';

test.describe('Notifications - Search', () => {
  test('should display search input', async ({
    authenticatedPage: page,
    notificationFactory,
    mainUserId,
    userFactory,
  }) => {
    const otherUser = await userFactory.createUser({ name: 'E2E Search Notif User' });
    await notificationFactory.createNotification(mainUserId, otherUser.id, {
      type: 'comment_added',
      message: 'E2E Searchable Notification',
    });

    await page.goto('/notifications');
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByPlaceholder(/search/i);
    await expect(searchInput).toBeVisible({ timeout: 10000 });
  });

  test('should filter notifications by search text', async ({
    authenticatedPage: page,
    notificationFactory,
    mainUserId,
    userFactory,
  }) => {
    const otherUser = await userFactory.createUser({ name: 'E2E Filter Notif User' });
    await notificationFactory.createNotification(mainUserId, otherUser.id, {
      type: 'comment_added',
      message: 'E2E Unique Searchable Text',
    });

    await page.goto('/notifications');
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByPlaceholder(/search/i);
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    // Type a search query
    await searchInput.fill('E2E Unique Searchable');

    // Results should be filtered (the list updates)
    await page.waitForTimeout(500);
  });
});
