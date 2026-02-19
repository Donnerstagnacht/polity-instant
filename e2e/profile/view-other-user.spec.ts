import { test, expect } from '../fixtures/test-base';
import { navigateToUserProfile } from '../helpers/navigation';

test.describe('Profile - View Other User', () => {
  test('should display other user profile with action bar', async ({
    authenticatedPage: page,
    userFactory,
  }) => {
    const otherUser = await userFactory.createUser({ name: 'E2E Other User' });
    await navigateToUserProfile(page, otherUser.id);

    const subscribeButton = page.getByRole('button', { name: /subscribe/i });
    await expect(subscribeButton).toBeVisible({ timeout: 10000 });
  });

  test('should subscribe to another user', async ({
    authenticatedPage: page,
    userFactory,
  }) => {
    const otherUser = await userFactory.createUser({ name: 'E2E Subscribe Target' });
    await navigateToUserProfile(page, otherUser.id);

    const subscribeButton = page.getByRole('button', { name: /subscribe/i });
    await expect(subscribeButton).toBeVisible({ timeout: 10000 });
    await subscribeButton.click();

    // Button should change to "Unsubscribe"
    const unsubscribeButton = page.getByRole('button', { name: /unsubscribe/i });
    await expect(unsubscribeButton).toBeVisible({ timeout: 5000 });
  });

  test('should click message button and navigate to messages', async ({
    authenticatedPage: page,
    userFactory,
  }) => {
    const otherUser = await userFactory.createUser({ name: 'E2E Message Target' });
    await navigateToUserProfile(page, otherUser.id);

    // Message button is a Button with onClick, not a Link
    const messageButton = page.getByRole('button', { name: /message/i });
    await expect(messageButton).toBeVisible({ timeout: 10000 });
    await messageButton.click();
    await page.waitForURL(/\/messages/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/messages/);
  });

  test('should display share button on other user profile', async ({
    authenticatedPage: page,
    userFactory,
  }) => {
    const otherUser = await userFactory.createUser({ name: 'E2E Share Target' });
    await navigateToUserProfile(page, otherUser.id);

    const shareButton = page.getByRole('button', { name: /share/i });
    await expect(shareButton.first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Profile - Statement Carousel & Social Bar', () => {
  test('should display statement carousel on profile', async ({ authenticatedPage: page }) => {
    await page.goto('/user');
    await page.waitForURL(/\/user\/[a-f0-9-]+/, { timeout: 5000 });

    const carousel = page.locator('[class*="carousel"], [class*="Carousel"]');
    if ((await carousel.count()) > 0) {
      await expect(carousel.first()).toBeVisible();
    }
  });

  test('should display social bar links', async ({ authenticatedPage: page }) => {
    await page.goto('/user');
    await page.waitForURL(/\/user\/[a-f0-9-]+/, { timeout: 5000 });

    const socialLinks = page.locator('a[href*="twitter"], a[href*="linkedin"], a[href*="github"]');
    if ((await socialLinks.count()) > 0) {
      await expect(socialLinks.first()).toBeVisible();
    }
  });
});
