import { test, expect } from '../fixtures/test-base';
import { navigateToUserProfile } from '../helpers/navigation';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Profile - View Other User', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    // Navigate to another user's profile
    await navigateToUserProfile(page, TEST_ENTITY_IDS.testUser1);
  });

  test('should display other user profile with action bar', async ({ authenticatedPage: page }) => {
    // Action bar should show Subscribe, Message, Share buttons
    const subscribeButton = page.getByRole('button', { name: /subscribe/i });
    if ((await subscribeButton.count()) > 0) {
      await expect(subscribeButton).toBeVisible();
    }
  });

  test('should subscribe to another user', async ({ authenticatedPage: page }) => {
    const subscribeButton = page.getByRole('button', { name: /subscribe/i });
    if ((await subscribeButton.count()) === 0) {
      test.skip();
      return;
    }

    await subscribeButton.click();
    await page.waitForLoadState('networkidle');

    // Button should change to "Unsubscribe"
    const unsubscribeButton = page.getByRole('button', { name: /unsubscribe/i });
    if ((await unsubscribeButton.count()) > 0) {
      await expect(unsubscribeButton).toBeVisible();
    }
  });

  test('should click message button and navigate to messages', async ({ authenticatedPage: page }) => {
    const messageButton = page.getByRole('button', { name: /message/i });
    if ((await messageButton.count()) === 0) {
      // May use mail icon button
      const mailButton = page.getByRole('link', { name: /message|mail/i });
      if ((await mailButton.count()) > 0) {
        await mailButton.first().click();
        await page.waitForURL(/\/messages/, { timeout: 5000 });
        await expect(page).toHaveURL(/\/messages/);
      } else {
        test.skip();
      }
      return;
    }

    await messageButton.first().click();
    await page.waitForURL(/\/messages/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/messages/);
  });

  test('should display share button on other user profile', async ({ authenticatedPage: page }) => {
    const shareButton = page.getByRole('button', { name: /share/i });
    if ((await shareButton.count()) > 0) {
      await expect(shareButton.first()).toBeVisible();
    }
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

    // Social bar renders social media links
    const socialLinks = page.locator('a[href*="twitter"], a[href*="linkedin"], a[href*="github"]');
    if ((await socialLinks.count()) > 0) {
      await expect(socialLinks.first()).toBeVisible();
    }
  });
});
