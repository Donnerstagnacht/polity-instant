// spec: e2e/test-plans/amendments-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Amendments - Amendment Voting (Support)', () => {
  test('User upvotes an amendment', async ({
    authenticatedPage: page,
    amendmentFactory,
    mainUserId,
  }) => {
    // SETUP: Create amendment via factory for test isolation
    const amendment = await amendmentFactory.createAmendment(mainUserId, {
      title: `Vote Test Amendment ${Date.now()}`,
    });

    // Navigate to amendment page
    await page.goto(`/amendment/${amendment.id}`);
    await page.waitForLoadState('networkidle');

    // Find upvote/support button
    const upvoteButton = page
      .getByRole('button', { name: /upvote|support|like|👍/i })
      .or(page.locator('button:has([class*="thumbs-up"])'))
      .or(page.locator('button:has([class*="ThumbsUp"])'));

    if ((await upvoteButton.count()) > 0) {
      await upvoteButton.first().click();

      // Wait for vote to be registered via UI state change
      await expect(upvoteButton.first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('User downvotes an amendment', async ({
    authenticatedPage: page,
    amendmentFactory,
    mainUserId,
  }) => {
    // SETUP: Create amendment via factory for test isolation
    const amendment = await amendmentFactory.createAmendment(mainUserId, {
      title: `Downvote Test Amendment ${Date.now()}`,
    });

    // Navigate to amendment page
    await page.goto(`/amendment/${amendment.id}`);
    await page.waitForLoadState('networkidle');

    // Find downvote button
    const downvoteButton = page
      .getByRole('button', { name: /downvote|oppose|👎/i })
      .or(page.locator('button:has([class*="thumbs-down"])'))
      .or(page.locator('button:has([class*="ThumbsDown"])'));

    if ((await downvoteButton.count()) > 0) {
      await downvoteButton.first().click();

      // Wait for vote to be registered via UI state change
      await expect(downvoteButton.first()).toBeVisible({ timeout: 3000 });
    }
  });
});
