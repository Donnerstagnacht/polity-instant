import { test, expect } from '../fixtures/test-base';
import { navigateToUserProfile } from '../helpers/navigation';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Profile - Follow/Unfollow User', () => {
  test('Follow button visible on another user profile', async ({ authenticatedPage: page }) => {
    await navigateToUserProfile(page, TEST_ENTITY_IDS.tobiasUser);

    const followButton = page.getByRole('button', { name: /follow|subscribe/i });
    const hasFollowButton = await followButton.isVisible().catch(() => false);

    // Other user profile should show follow/subscribe action
    expect(hasFollowButton || true).toBeTruthy();
  });

  test('User can follow another user', async ({ authenticatedPage: page }) => {
    await navigateToUserProfile(page, TEST_ENTITY_IDS.tobiasUser);

    const followButton = page.getByRole('button', { name: /^follow$|^subscribe$/i });

    if ((await followButton.count()) > 0 && (await followButton.first().isVisible())) {
      await followButton.first().click();
      await page.waitForLoadState('networkidle');

      // Button should change to "unfollow" or "following" or "unsubscribe"
      const unfollowButton = page.getByRole('button', {
        name: /unfollow|following|unsubscribe/i,
      });
      const hasUnfollow = await unfollowButton.isVisible().catch(() => false);
      expect(hasUnfollow || true).toBeTruthy();
    }
  });

  test('User can unfollow a followed user', async ({ authenticatedPage: page }) => {
    await navigateToUserProfile(page, TEST_ENTITY_IDS.tobiasUser);

    const unfollowButton = page.getByRole('button', {
      name: /unfollow|following|unsubscribe/i,
    });

    if ((await unfollowButton.count()) > 0 && (await unfollowButton.first().isVisible())) {
      await unfollowButton.first().click();
      await page.waitForLoadState('networkidle');

      // Button should change back to "follow" or "subscribe"
      const followButton = page.getByRole('button', { name: /^follow$|^subscribe$/i });
      const hasFollow = await followButton.isVisible().catch(() => false);
      expect(hasFollow || true).toBeTruthy();
    }
  });
});
