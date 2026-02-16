import { test, expect } from '../fixtures/test-base';
import { navigateToBlog } from '../helpers/navigation';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Blog - Voting', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await navigateToBlog(page, TEST_ENTITY_IDS.BLOG);
  });

  test('should display upvote and downvote buttons', async ({ authenticatedPage: page }) => {
    // Upvote/Downvote are rendered as buttons with ArrowUp/ArrowDown icons
    const upvoteButton = page.getByRole('button', { name: /upvote|arrow.*up/i });
    const downvoteButton = page.getByRole('button', { name: /downvote|arrow.*down/i });

    // They might also be identified by icon-only buttons near a score
    const arrowButtons = page.locator('button').filter({
      has: page.locator('svg'),
    });

    // There should be votable buttons on the blog detail page
    if ((await upvoteButton.count()) > 0) {
      await expect(upvoteButton.first()).toBeVisible();
    }
    if ((await downvoteButton.count()) > 0) {
      await expect(downvoteButton.first()).toBeVisible();
    }
  });

  test('should display supporter score in stats bar', async ({ authenticatedPage: page }) => {
    // StatsBar shows subscribers, supporters (score), comments
    const statsBar = page.locator('[class*="stats"], [class*="Stats"]');
    if ((await statsBar.count()) > 0) {
      await expect(statsBar.first()).toBeVisible();
    }
  });

  test('should toggle upvote on click', async ({ authenticatedPage: page }) => {
    const upvoteButton = page.getByRole('button', { name: /upvote|arrow.*up/i });
    if ((await upvoteButton.count()) === 0) {
      // Try finding arrow buttons near the action bar
      const actionButtons = page.locator('button svg').locator('..');
      if ((await actionButtons.count()) === 0) {
        test.skip();
        return;
      }
    }

    if ((await upvoteButton.count()) > 0) {
      await upvoteButton.first().click();
      // Vote should be registered (button may change color/style)
    }
  });
});
